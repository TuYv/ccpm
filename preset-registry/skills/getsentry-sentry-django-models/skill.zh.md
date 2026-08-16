---
name: django-models
description: Design Django ORM models for Sentry following architectural conventions for silos, replication, relocation, and foreign keys. Use when adding a new Django model, designing a model for a feature, deciding where data should live, picking a foreign key type, or refactoring an existing model's silo placement. Trigger on "add a Django model", "create a model", "design a model for X", "new database table", "store this data in the DB", "I need to track Y", "model for [feature]". Not for Pydantic models, dataclasses, ML models, or Protobuf — this is specifically for Django ORM models in the Sentry codebase.
---
# Sentry 模型约定

本技能涵盖设计 Sentry 模型时涉及的_架构_决策。它不涵盖 Django 语法、导入顺序或迁移生成——对于这些内容：

- 迁移：模型设计完成后，调用 `generate-migration` 技能。
- Outbox 复制机制（信号接收器、负载结构、删除处理程序）：调用 `hybrid-cloud-outboxes` 技能。
- 混合云 RPC：调用 `hybrid-cloud-rpc` 技能。

## 定义 Sentry 模型的四项决策

在编写任何字段之前，请先确定全部四项决策。它们彼此关联——任何一项出错，都会迫使你通过后续迁移来修复其他项。

### 1. 这些数据位于哪个 silo？

Cell silo（`@cell_silo_model`）是默认选择。仅当数据由多个组织共享，或必须与其他 control-silo 资源（身份验证、集成安装、API 令牌、slug 保留）保持强一致性时，才使用 control silo（`@control_silo_model`）。

错误的思考方式是：“这是面向用户的内容，所以应该放在 control。”正确的思考方式是：“能够正确承载这些数据的最小 silo 是什么？它是否与所有会同这些数据一起变更的内容位于同一个 silo？”如果 cell 从不读取这些数据，它们就不属于 cell。

### 2. 另一个 silo 是否需要看到这些数据？

如果需要，该模型必须继承 `ReplicatedCellModel`（cell 侧）或 `ReplicatedControlModel`（control 侧），并设置 `category: ClassVar[OutboxCategory] = OutboxCategory.MY_THING`。基础 `Model` 类适用于确实永远不会跨越 silo 边界的数据。

复制是_设计_的一部分，而不是之后附加上去的东西。如果你不得不问“另一个 silo X 是否应该能够在不使用 RPC 的情况下按 ID 查找这些数据？”——这就是一项复制决策，并且它会改变基类。如有疑问，请在最终确定模型之前参考 `hybrid-cloud-outboxes` 技能。

### 3. 这些数据是否属于组织导出（迁移）的一部分？

每个具体模型都必须设置 `__relocation_scope__`——如果缺失，`src/sentry/db/models/base.py` 中的运行时检查会抛出异常。通常只会选择以下两项之一：

| 范围                           | 适用情况                                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `RelocationScope.Organization` | 与组织关联、并且应在迁移期间随组织一起转移的客户数据。包括大多数项目、设置、成员、仪表板和告警。                                                       |
| `RelocationScope.Excluded`     | 瞬态数据、遥测数据、缓存、系统内部状态、`getsentry` 应用中的任何数据，或在另一个实例中没有意义的数据。                                                  |

可以使用范围 `set` 并重写 `get_relocation_scope()`，但这种情况很少见；仅当迁移行为需要根据实例决定时才使用这种方式。`Excluded` 不能作为集合的一部分。

如果你不确定：大多数存储客户工作状态的新模型应使用 `Organization`；大多数服务于 Sentry 自身运维的新模型（队列、缓存、尝试记录、作业、运行时使用的功能标志）应使用 `Excluded`。

### 4. 每个外键的跨隔离域影响范围是什么？

FK 类型表达的是架构决策，而非代码风格选择：

- `FlexibleForeignKey("sentry.Project", on_delete=...)` — FK 目标位于同一隔离域中。系统会创建真正的数据库约束。级联删除由 Postgres 强制执行。
- `HybridCloudForeignKey("sentry.User", on_delete="...", ...)` — FK 目标位于_相对的_隔离域中。不存在数据库约束。级联操作通过发件箱墓碑机制实现最终一致性。`on_delete` 以字符串形式传入（`"CASCADE"`、`"SET_NULL"`、`"DO_NOTHING"`）。字段名称应带有显式的 `_id` 后缀（例如 `user_id = HybridCloudForeignKey(...)`），因为没有可供解析的 ORM 关系——只有一个 ID。与 `FlexibleForeignKey` 对比，使用单个 `project = FlexibleForeignKey(...)`，Django 就会同时为你提供 `project`（关联对象）和 `project_id`（数据库列）。
- 普通的 Django `ForeignKey` — 应避免使用。少数较旧的 `workflow_engine` 模型仍在使用它，但对于新代码，惯例是使用 `FlexibleForeignKey`（同隔离域）或 `HybridCloudForeignKey`（跨隔离域）。两者都能接入 Sentry 的删除框架和混合云基础设施，而普通的 `ForeignKey` 无法做到这一点。

一个模型同时拥有这两种 FK 是正常且常见的。存在 HCFK _并不_意味着该模型应位于另一个隔离域——它只表示该关系跨越了隔离域。

## 其他值得编码为规范的约定

### 基类和时间戳

新模型应使用 `DefaultFieldsModel`。它会直接为你提供 `date_added`（`auto_now_add=True`）和 `date_updated`（`auto_now=True`），而这几乎总是你想要的——确实不应记录这两个时间戳中任意一个的数据表非常少见。`DefaultFieldsModelExisting` 仅供遗留代码使用——它的文档字符串明确说明不要将其用于新模型（为了向后兼容早于该字段存在的模型，它允许 `date_added` 为空）。

### 字段类型的设计意图

- 主键使用 `BoundedBigAutoField`，非 PK 的数字 ID 和计数使用 `BoundedBigIntegerField` / `BoundedPositiveIntegerField`。“bounded”部分是运行时溢出保护，而不是 Django 提供的便利功能——它可以捕获那些会悄无声息地破坏下游消费者的数据值。
- 对于没有严格规范的限长文本字段，优先使用 `CharField(max_length=256)`。低于 TOAST 阈值时，无论 `n` 是多少，Postgres `varchar(n)` 的存储方式都相同，因此过早选择 64 只会带来约束，却没有任何收益。仅当该列具有明确含义时才选择更小的值（哈希值=40/64、UUID=32、slug、具有规范的标识符）。
- 对于自由格式的文本字段，使用 `TextField`。
- 对于新的 JSON 列，优先使用 Django 的 `models.JSONField()`（以 jsonb 为底层存储）。遗留的 `sentry.db.models.fields.jsonfield.JSONField` 以文本为底层存储，仅用于兼容旧列——只有在有意与旧列保持一致时才使用它。
- 可变的可调用默认值（`default=dict`、`default=list`）——绝不要直接使用 `default={}` / `default=[]`。

### 软删除需要显式实现

不存在基于元类的软删除。如果模型需要软删除，请使用 `ObjectStatus` 添加显式的 `status` 字段，并确保业务逻辑遵循该字段。`ParanoidModel` 确实存在（`SentryAppInstallation` 使用了它），但这是一个重量级选择——大多数模型不应需要它。

### 优先使用约束而非 `unique_together`

对于新模型，请使用 `Meta.constraints = [UniqueConstraint(...)]`，而不要使用 `unique_together`。原因在于 `condition=Q(...)`：部分唯一约束是表达“当此列不为 null 时保持唯一”的唯一正确方式，而这是一项常见需求，使用 `unique_together` 时会悄无声息地失效。约束和索引的名称应明确且具有描述性，不应自动生成。

### 复合索引应与查询顺序匹配

如果你会同时按 `(org_id, project_id, type)` 进行筛选，就需要一个字段顺序与“选择性最高者优先”的筛选模式相匹配的索引。外键自动创建的索引并_不能_覆盖多列场景。

### 文件应放置的位置

- 默认：将新模型放在应用下的 `src/sentry/<app>/models.py`（单文件）或 `src/sentry/<app>/models/<thing>.py`（每个模型一个文件）中——根据该应用中的既有惯例选择。
- `src/sentry/models/<thing>.py` 是旧版位置。只有当新模型与已位于其中的某个模型紧密耦合，并且移动该模型会造成干扰时，才将新模型放在那里。
- `src/sentry/<app>/` 下的新应用应设置为真正的 Django 应用（包含 `apps.py`，以及带有 `default_app_config` 的 `__init__.py`）。

## 最小化的 cell-silo 模型骨架

这是一个起始脚手架，而不是模板——移除不需要的内容，也不要添加不需要的内容。

```python
from __future__ import annotations

from django.db import models

from sentry.backup.scopes import RelocationScope
from sentry.db.models import DefaultFieldsModel, FlexibleForeignKey, cell_silo_model, sane_repr
from sentry.db.models.fields.hybrid_cloud_foreign_key import HybridCloudForeignKey


@cell_silo_model
class MyThing(DefaultFieldsModel):
    __relocation_scope__ = RelocationScope.Organization

    organization = FlexibleForeignKey("sentry.Organization")
    project = FlexibleForeignKey("sentry.Project")
    user_id = HybridCloudForeignKey("sentry.User", null=True, on_delete="SET_NULL")

    name = models.CharField(max_length=256)
    config = models.JSONField(default=dict)

    class Meta:
        app_label = "sentry"
        db_table = "sentry_mything"
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "name"],
                name="sentry_mything_org_name_unique",
            ),
        ]

    __repr__ = sane_repr("organization_id", "project_id", "name")
```

对于 control-silo 模型，请将 `@cell_silo_model` 替换为 `@control_silo_model`。对于状态需要在另一个 silo 中可见的模型，请将基类改为 `ReplicatedCellModel` 或 `ReplicatedControlModel`，并添加 `category = OutboxCategory.MY_THING`——然后调用 `hybrid-cloud-outboxes` skill 来完成其余工作。

## 模型设计完成后

1. 生成迁移：调用 `generate-migration` skill。
2. 如果模型是复制模型：调用 `hybrid-cloud-outboxes` skill，以配置 payload、信号接收器和删除处理程序。
3. 如果应用的 `models/__init__.py` 会重新导出其模型，也请在其中添加新模型——这只是为调用方提供的便利（`from sentry.<app>.models import Thing`），并非 Django 的要求，因此请遵循该应用的既有惯例。