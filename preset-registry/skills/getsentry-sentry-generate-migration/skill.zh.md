---
name: generate-migration
description: Generate Django database migrations for Sentry. Use when creating migrations, adding/removing columns or tables, adding indexes, or resolving migration conflicts.
---
# 生成 Django 数据库迁移

## 命令

根据模型变更自动生成迁移：

```bash
sentry django makemigrations
```

针对特定应用：

```bash
sentry django makemigrations <app_name>
```

生成空迁移（用于数据迁移或自定义操作）：

```bash
sentry django makemigrations <app_name> --empty
```

## 生成后

1. 如果添加了新模型，请确保在应用的 `__init__.py` 中导入该模型
2. 检查生成的迁移是否正确
3. 运行 `sentry django sqlmigrate <app_name> <migration_name>` 以验证 SQL
4. 使用 `sentry django migrate <app_name>` 在本地应用迁移——Sentry 的迁移框架会在应用迁移时执行安全检查，因此可以在 CI 之前发现不安全的操作（缺少 `is_post_deployment`、不安全的列变更等）。

编辑生成的迁移时（例如将 `DeleteModel` 替换为 `SafeDeleteModel`），**请保留自动生成的 `is_post_deployment` 注释块**。它通过具体指导说明了一个不易察觉的标志，为未来的迁移编写者提供了有用的上下文，并非无用内容。仅当注释已过时或与代码矛盾时才将其删除。

### 不要测试 ORM

不要编写仅用于测试 Django ORM 的测试。标准操作——创建/更新/删除、级联删除、唯一约束强制执行——由 Django 和 Postgres 提供，应假定它们能够正常工作。应测试的是*你的*逻辑（业务规则、信号接收器、自定义管理器/验证），而不是框架本身。

### 务必测试数据迁移和回填

上述规则有一个例外：用于**回填或转换数据**的迁移属于你的逻辑，因此必须有测试。使用 `sentry.testutils.cases` 中的 `TestMigrations` 基类；测试位于 `tests/sentry/migrations/` 中。

设置 `app`、`migrate_from`（你的迁移之前的那个迁移）和 `migrate_to`（你的迁移）。在 `setup_before_migration(self, apps)` 中使用**历史**模型注册表（`apps.get_model("sentry", "MyModel")`）植入迁移前的行——不要直接使用 `from sentry.models...` 导入，因为当前模型可能与 `migrate_from` 时的模式不匹配。然后断言迁移后的状态。

**只编写一个 `test_*` 方法。** `setUp` 会针对*每个*测试方法运行完整的降级迁移 → 植入数据 → 升级迁移周期，因此每增加一个方法，都会额外执行一次往返过程，却不会增加测试覆盖范围。若要覆盖多种情况，请在 `setup_before_migration` 中植入所有情况，并在唯一的测试主体中逐一断言。

```python
from sentry.testutils.cases import TestMigrations


class BackfillFooTest(TestMigrations):
    app = "sentry"
    migrate_from = "0123_before"
    migrate_to = "0124_backfill_foo"

    def setup_before_migration(self, apps):
        Foo = apps.get_model("sentry", "Foo")
        self.empty = Foo.objects.create(value=None)
        self.already_set = Foo.objects.create(value="kept")

    def test_backfill(self):
        self.empty.refresh_from_db()
        self.already_set.refresh_from_db()
        assert self.empty.value == "expected"
        assert self.already_set.value == "kept"
```

**`app` 和 `connection`**：`app` 是你正在测试其迁移的 Django 应用标签——默认为 `"sentry"`，但当迁移位于某个应用的 `migrations/` 目录中时，应将其设置为相应的值，例如 `"workflow_engine"`。`connection` 是数据库别名，默认为 `"default"`；应将其设置为模型的数据表实际所在的连接。两者都必须与迁移及其数据表的实际位置一致，否则向上/向下迁移将在错误的数据库上运行。

在本地运行这些测试时，请使用 `--migrations` 和 `--reuse-db` 标志。首次运行时，需要将 `--create-db` 与 `--reuse-db` 一起使用，以使数据库处于正确状态。

## 指南

### 添加列

- 对于具有默认值的列，使用 `db_default=<value>`，而不是 `default=<value>`
- 可为空的列：使用 `null=True`
- 非空列：必须设置 `db_default`

### 添加索引

对于大型数据表，请在迁移上设置 `is_post_deployment = True`，因为创建索引可能会超过 5 秒超时时间。

### 删除列

删除列需要两次迁移。应预先编写这两个迁移，但它们必须位于**两个独立的 PR** 中，并将第 2 阶段堆叠在第 1 阶段之上，使其迁移依赖于第 1 阶段。请明确说明，**在第 1 阶段部署完成前，第 2 阶段不能合并**——同时合并二者会在旧代码仍在运行时删除该列。

**第 1 阶段 — `MOVE_TO_PENDING`**

按以下顺序运行两次 `makemigrations`。一旦从模型中移除该字段，Django 就无法再生成 `AlterField`，因此如果按相反顺序操作，就会在没有任何提示的情况下发布缺少该操作的迁移。

1. 在字段**仍位于模型中**时，就地编辑该字段：如果它是 FK，则设置 `db_constraint=False`；如果它不允许为空且没有 `db_default`，则设置 `null=True`。运行 `makemigrations` 以生成 `AlterField`。
2. 移除该字段以及代码中对它的所有引用，然后再次运行 `makemigrations`。将生成的 `RemoveField` 替换为 `SafeRemoveField(..., deletion_action=DeletionAction.MOVE_TO_PENDING)`——这会移除 Django 状态，而不是删除该列。
3. 手动将两者合并为一个迁移。示例：

```python
operations = [
    migrations.AlterField(
        model_name="testmodel",
        name="project",
        field=sentry.db.models.fields.foreignkey.FlexibleForeignKey(
            db_constraint=False,
            null=True,
            on_delete=django.db.models.deletion.CASCADE,
            to="sentry.project",
        ),
    ),
    SafeRemoveField(
        model_name="testmodel", name="project", deletion_action=DeletionAction.MOVE_TO_PENDING
    ),
]
```

**第 2 阶段 — `DELETE`**（第二个 PR，在第 1 阶段部署后合并）

运行 `makemigrations <app> --empty`，然后添加相同的 `SafeRemoveField`，并设置 `deletion_action=DeletionAction.DELETE`。该 PR 中不要包含任何其他内容。

### 移除模型（并最终删除其数据表）

删除数据表需要两次迁移。应预先编写这两个迁移，但它们必须位于**两个独立的 PR** 中，并将第 2 阶段堆叠在第 1 阶段之上，使其迁移依赖于第 1 阶段。请明确说明，**在第 1 阶段部署完成前，第 2 阶段不能合并**——同时合并二者会在旧代码仍在运行时删除该表。

**首先，检查入站 FK。** 如果其他表有指向此表的外键，则这些列需要单独执行一轮“删除列”，并且该流程的两个阶段都必须在此模型的阶段 1 合并之前完成部署。

**阶段 1 — `MOVE_TO_PENDING`**

按以下顺序运行两次 `makemigrations`。模型一旦被删除，Django 就无法再生成 `AlterField`，因此如果颠倒顺序，就会在未生成这些操作的情况下悄然发布。

1. 在模型的每个**出站** FK 字段上添加 `db_constraint=False`（如果是 `HybridCloudForeignKey`，则改为添加 `null=True`），然后运行 `makemigrations` 以生成 `AlterField` 操作。
2. 删除该模型及所有代码引用，再次运行 `makemigrations`，并将生成的 `DeleteModel` 替换为 `SafeDeleteModel(..., deletion_action=DeletionAction.MOVE_TO_PENDING)`。
3. 将两者合并到一个迁移中，并将 `AlterField` 放在前面。
4. 将该表添加到 `src/sentry/db/router.py`（或 `getsentry/db/router.py`）中的 `historical_silo_assignments`。选择该模型原来使用的 silo——通常是 `SiloMode.CELL`。

删除约束不是可选操作。这些表会一直保留到阶段 2，但 Django 已经不知道它们的存在，因此无法级联到这些表中——删除仍然存在的父表中的记录时，会因残留的约束而失败。一次删除**多个**模型时，还应删除待删除表_之间_的约束，这样阶段 2 中执行 `DROP TABLE` 的顺序就无关紧要了。

**阶段 2 — `DELETE`**（第二个 PR，在阶段 1 部署后合并）

运行 `makemigrations <app> --empty`，然后添加相同的 `SafeDeleteModel`，并设置 `deletion_action=DeletionAction.DELETE`。保留 `historical_silo_assignments` 条目——删表迁移需要使用它来确定 silo。

### 重命名列/表

不要在 Postgres 中重命名。使用 `db_column` 或 `Meta.db_table` 保留旧名称。

## 解决合并冲突

如果 `migrations_lockfile.txt` 发生冲突：

```bash
bin/update-migration <migration_name>
```

此命令会重命名迁移、更新依赖项并修复锁文件。