---
name: generate-migration
description: Generate or review Django database migrations for Sentry. Use when creating or reviewing migrations and data migrations, adding/removing columns or tables, adding indexes, or resolving migration conflicts.
---
# 生成 Django 数据库迁移

## 命令

根据模型变更自动生成迁移：

```bash
sentry django makemigrations
```

针对特定 app：

```bash
sentry django makemigrations <app_name>
```

生成空迁移（用于数据迁移或自定义工作）：

```bash
sentry django makemigrations <app_name> --empty
```

## 生成之后

1. 如果你添加了新模型，确保它已在 app 的 `__init__.py` 中导入
2. 检查生成的迁移是否正确
3. 运行 `sentry django sqlmigrate <app_name> <migration_name>` 来验证 SQL
4. 使用 `sentry django migrate <app_name>` 在本地应用迁移 — Sentry 的迁移框架会在应用时运行安全检查，因此这能在 CI 之前发现不安全的操作（缺失 `is_post_deployment`、不安全的列变更等）。

编辑生成的迁移时（例如将 `DeleteModel` 换成 `SafeDeleteModel`），**保留自动生成的 `is_post_deployment` 注释块**。它记录了一个不明显的标志，并为未来的迁移作者提供具体指导 — 这是有用的上下文，不是冗余内容。只有当注释过时或与代码矛盾时才移除它。

### 不要测试 ORM

不要编写只测试 Django ORM 的测试。标准操作 — 创建/更新/删除、级联删除、唯一约束执行 — 由 Django 和 Postgres 提供，默认认为它们能正常工作。测试 _你的_ 逻辑（业务规则、信号接收器、自定义管理器/验证），而不是框架本身。

### 要测试数据迁移和回填

上述规则的例外：会**回填或转换数据**的迁移属于你的逻辑，必须有测试。使用来自 `sentry.testutils.cases` 的 `TestMigrations` 基类；测试放在 `tests/sentry/migrations/` 中。

设置 `app`、`migrate_from`（你的迁移之前的那个迁移）和 `migrate_to`（你的迁移）。在 `setup_before_migration(self, apps)` 中使用**历史**模型注册表（`apps.get_model("sentry", "MyModel")`）来植入迁移前的行 — 不要直接 `from sentry.models...` 导入，因为当前模型可能与 `migrate_from` 时的 schema 不匹配。然后断言迁移后的状态。

**只写一个 `test_*` 方法。** `setUp` 会在 _每个_ 测试方法上运行完整的 migrate-down → seed → migrate-up 循环，因此每多一个方法都会多付出一次往返成本，却不会增加覆盖率。通过在 `setup_before_migration` 中植入所有情况，并在单个测试主体中逐一断言，来覆盖多个场景。

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

**`app` 和 `connection`**：`app` 是你正在测试的迁移所属的 Django app label，默认是 `"sentry"`；但当迁移位于某个 app 的 `migrations/` 目录下时，应将其设为例如 `"workflow_engine"`。`connection` 是数据库别名，默认是 `"default"`；应将其设为该模型表实际所在的连接。两者都必须与迁移及其表的实际位置匹配，否则向上/向下迁移会在错误的数据库上运行。

在本地运行这些测试时使用 `--migrations` 和 `--reuse-db` 标志。首次运行时，需要将 `--create-db` 与 `--reuse-db` 一起使用，以便让数据库处于良好状态。

## 指南

### 历史模型和 Save Hook

`apps.get_model()` 返回的是不包含自定义 `save()` 方法的历史模型类。它发出的信号会使用历史类作为 sender，因此限定在实时模型上的 receiver（例如缓存失效 hook）不会运行。

在编写或审查数据迁移时，检查实时模型的 save hook，并显式执行所需的副作用。继续使用 `apps.get_model()`；导入实时模型并不是安全的变通方案。

### 添加列

- 对带默认值的列，使用 `db_default=<value>` 而不是 `default=<value>`
- 可空列：使用 `null=True`
- 非空列：必须设置 `db_default`

### 添加索引

对于大表，在迁移上设置 `is_post_deployment = True`，因为索引创建可能会超过 5s 超时。

### 删除列

删除需要两个迁移。两个都要提前写好，但它们必须是**两个独立的 PR**，其中 phase 2 叠在 phase 1 之上，使其迁移依赖于 phase 1。明确说明 **phase 2 不能在 phase 1 部署前合并**，因为一起合并会在旧代码仍在运行时删除该列。

**Phase 1 — `MOVE_TO_PENDING`**

按以下顺序运行两次 `makemigrations`。一旦字段从模型上移除，Django 就无法再生成 `AlterField`，所以反过来做会导致在没有它的情况下静默发布。

1. 在字段**仍然保留在模型上**时，就地编辑它：如果是 FK，则设置 `db_constraint=False`；如果它不可空且没有 `db_default`，则设置 `null=True`。运行 `makemigrations` 以获得 `AlterField`。
2. 移除该字段以及对它的所有代码引用，然后再次运行 `makemigrations`。将生成的 `RemoveField` 替换为 `SafeRemoveField(..., deletion_action=DeletionAction.MOVE_TO_PENDING)`，这会删除 Django state，而不是删除列。
3. 手动将两者合并到一个迁移中。示例：

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

**Phase 2 — `DELETE`**（第二个 PR，在 phase 1 部署后合并）

`makemigrations <app> --empty`，然后使用相同的 `SafeRemoveField`，并将 `deletion_action=DeletionAction.DELETE` 传入。PR 中不要包含其他内容。

### 删除模型（以及最终删除其表）

删除一个表需要两个迁移。提前编写好这两个迁移，但它们必须属于**两个独立的 PR**，并且第 2 阶段基于第 1 阶段堆叠，这样它的迁移才能依赖第 1 阶段。请明确说明：**第 2 阶段必须等到第 1 阶段已经部署后才能合并**——将它们合并在一起会在旧代码仍在运行时删除表。

**首先，检查入站 FK。** 如果其他表有指向该表的外键，那么这些列需要单独执行一次“删除列”流程，并且这两个阶段都必须部署完成后，该模型的第 1 阶段才能合并。

**第 1 阶段 — `MOVE_TO_PENDING`**

按以下顺序运行两次 `makemigrations`。模型删除后，Django 将无法再生成 `AlterField`，因此反过来操作会导致这些变更在无提示的情况下未被发布。

1. 在该模型的每个**出站** FK 字段上添加 `db_constraint=False`（对于 `HybridCloudForeignKey`，改为添加 `null=True`），然后为 `AlterField` 操作运行 `makemigrations`。
2. 删除模型及所有代码引用，再次运行 `makemigrations`，并将生成的 `DeleteModel` 替换为 `SafeDeleteModel(..., deletion_action=DeletionAction.MOVE_TO_PENDING)`。
3. 将两者合并到一个迁移中，并将 `AlterField` 放在前面。
4. 将该表添加到 `src/sentry/db/router.py`（或 `getsentry/db/router.py`）中的 `historical_silo_assignments`。选择该模型之前使用的 silo，通常是 `SiloMode.CELL`。

删除约束不是可选操作。表会一直保留到第 2 阶段，但 Django 已经不知道这些表的存在，因此无法级联处理它们——对仍然存在的父表执行删除操作时，会因遗留约束而失败。一次删除**多个**模型时，还要删除待删除表之间的约束，这样第 2 阶段执行 `DROP TABLE` 时就不必依赖特定的顺序。

**第 2 阶段 — `DELETE`**（第 2 个 PR，在第 1 阶段部署后合并）

`makemigrations <app> --empty`，然后使用相同的 `SafeDeleteModel`，并将 `deletion_action=DeletionAction.DELETE` 传入。保留 `historical_silo_assignments` 条目——删除表的迁移需要通过它解析 silo。

### 重命名列/表

不要在 Postgres 中重命名。使用 `db_column` 或 `Meta.db_table` 保留旧名称。

## 解决合并冲突

如果 `migrations_lockfile.txt` 发生冲突：

```bash
bin/update-migration <migration_name>
```

该命令会重命名你的迁移、更新依赖项并修复锁文件。