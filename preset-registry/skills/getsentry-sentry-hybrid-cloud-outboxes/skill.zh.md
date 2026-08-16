---
name: hybrid-cloud-outboxes
description: >-
  Guide for creating and maintaining outbox-based eventually consistent operations
  in Sentry. Most commonly used for cross-silo data replication, but applicable
  anywhere eventual consistency is needed — including single-silo deferred side
  effects, audit logging, and event fanout. Use when asked to "add outbox",
  "add outbox replication", "replicate model to control silo", "replicate model
  to cell", "add outbox category", "write outbox signal receiver", "debug stuck
  outboxes", "outbox not processing", "data not replicating", "test outbox",
  "migrate model to use outboxes", "backfill outbox data", "outbox coalescing",
  "ReplicatedCellModel", "ReplicatedControlModel", "OutboxCategory",
  "OutboxScope", or "outbox_runner". Covers model mixins, category registration,
  signal receivers, testing, backfill, and debugging workflows.
---
# 混合云发件箱

Sentry 使用**事务性发件箱模式**处理最终一致性操作。当模型发生变化时，会在同一个数据库事务中写入一条发件箱记录。事务提交后，发件箱会被排空——触发一个信号，进而执行 RPC 调用、墓碑传播或审计日志记录等副作用。

最常见的使用场景是**跨孤岛数据复制**：保存在 Cell 孤岛中的模型会生成一个 `CellOutbox`，该发件箱在处理时会将数据复制到 Control 孤岛（反方向则通过 `ControlOutbox` 实现）。不过，这一模式具有通用性——对于任何需要在事务提交后可靠执行的操作，即使是在单个孤岛内，也可以使用发件箱。

根据数据流向，共有两种发件箱类型：

- **`CellOutbox`**——写入 Cell 孤岛，并在 Cell 孤岛中处理，通过信号接收器中的 RPC 调用将数据推送至 Control。
- **`ControlOutbox`**——写入 Control 孤岛，并在 Control 孤岛中处理，将数据推送至一个或多个 Cell 孤岛。每条 `ControlOutbox` 记录都以特定的 `cell_name` 为目标。

## 关键约束

> **发件箱必须与数据变更写入同一个事务。**
> 混入类（`ReplicatedCellModel`、`ReplicatedControlModel`）会通过 `prepare_outboxes()` 自动强制执行这一点。如果手动写入发件箱，请始终使用 `outbox_context(transaction.atomic(...))`。

> **处理程序必须具备幂等性。**
> 发件箱可能会在失败后重试，并且会进行合并——处理程序可能只接收到某次变更的最新版本，也可能针对同一次变更被多次调用。

> **不得在事务中运行 `drain_shard()`。**
> 它会获取 `SELECT FOR UPDATE` 锁，并逐条处理消息。在事务中调用它会导致死锁，或使锁持有时间过长。

> **合并后只会保留最新的有效载荷。**
> 针对同一 `(scope, shard_identifier, category, object_identifier)` 的多次发件箱写入会被合并——只处理 ID 最大的记录。切勿依赖每个中间有效载荷都能被送达。

> **每个 `OutboxCategory` 必须且只能注册到一个 `OutboxScope`。**
> 导入时会通过断言强制执行这一要求。类别注册到零个或多个作用域都会导致导入崩溃。

> **批量操作必须使用生成发件箱的管理器。**
> 使用来自 `CellOutboxProducingManager` 或 `ControlOutboxProducingManager` 的 `MyModel.objects.bulk_create()` / `bulk_update()` / `bulk_delete()`。原始查询集会绕过发件箱创建。

> **使用 Snowflake ID 的模型不能使用 `bulk_create`。**
> 生成发件箱的管理器会通过 `SELECT nextval(...)` 预先分配 ID，这与 Snowflake ID 生成机制冲突。请改为逐个调用 `save()`。

## 第 1 步：确定你的需求

| 目的                                                        | 前往                |
| ----------------------------------------------------------- | ------------------- |
| 为新模型添加发件箱复制                                      | 第 2 步             |
| 添加新的 `OutboxCategory`（不与复制模型绑定）               | 第 3 步             |
| 编写手动信号接收器（不使用模型混入类）                      | 第 4 步             |
| 迁移现有模型以使用发件箱                                    | 第 5 步，然后第 6 步 |
| 为现有数据设置回填                                          | 第 6 步             |
| 测试基于发件箱的复制                                        | 第 7 步             |
| 调试卡住或未处理的发件箱                                    | 第 8 步             |

## 第 2 步：为新模型添加 Outbox 复制

### 2.1 选择 Mixin

| 数据所在位置 | 复制目标位置 | Mixin                    | Outbox 类型     |
| ------------ | ------------ | ------------------------ | --------------- |
| Cell silo    | Control silo | `ReplicatedCellModel`    | `CellOutbox`    |
| Control silo | Cell silo(s) | `ReplicatedControlModel` | `ControlOutbox` |

### 2.2 `ReplicatedCellModel` 模板

当 Cell 模型需要将数据复制到 Control silo 时，请使用此模板。

```python
from sentry.backup.scopes import RelocationScope
from sentry.db.models import (
    FlexibleForeignKey,
    Model,
    cell_silo_model,
    sane_repr,
)
from sentry.db.models.manager.base_query_set import BaseQuerySet
from sentry.hybridcloud.outbox.base import ReplicatedCellModel, CellOutboxProducingManager
from sentry.hybridcloud.outbox.category import OutboxCategory


class MyModelManager(CellOutboxProducingManager["MyModel"]):
    """Manager that ensures bulk operations create outboxes."""
    pass


@cell_silo_model
class MyModel(ReplicatedCellModel):
    __relocation_scope__ = RelocationScope.Organization

    # Required: the OutboxCategory for this model (must already be registered)
    category = OutboxCategory.MY_MODEL_UPDATE

    # Use the producing manager for bulk operation support
    objects: ClassVar[MyModelManager] = MyModelManager()

    # Model fields...
    organization = FlexibleForeignKey("sentry.Organization")
    name = models.CharField(max_length=128)

    class Meta:
        app_label = "sentry"
        db_table = "sentry_mymodel"

    def payload_for_update(self) -> dict[str, Any] | None:
        """
        Optional: include data needed by the deletion handler.
        Keep payloads minimal — only data that cannot be recovered
        after the row is deleted. Payloads are coalesced (only the
        latest survives).
        """
        return None  # Override if needed

    @classmethod
    def handle_async_deletion(
        cls,
        identifier: int,
        shard_identifier: int,
        payload: Mapping[str, Any] | None,
    ) -> None:
        """
        Called when this object has been deleted (row no longer exists).
        Clean up cross-silo resources. Must be idempotent.
        """
        my_mapping_service.delete(
            my_model_id=identifier,
            organization_id=shard_identifier,
        )

    def handle_async_replication(self, shard_identifier: int) -> None:
        """
        Called when this object has been created or updated.
        Replicate to the control silo via RPC. Must be idempotent.
        """
        my_mapping_service.upsert(
            my_model_id=self.id,
            organization_id=shard_identifier,
            mapping=RpcMyModelMapping.from_orm(self),
        )
```

### 2.3 `ReplicatedControlModel` 模板

当 Control 模型需要将数据复制到 Cell silo(s) 时，请使用此模板。主要区别在于：Control outbox 会扇出到一个或多个 Cell，因此模型必须声明要将哪些 Cell 作为目标。

```python
from sentry.db.models import control_silo_model
from sentry.hybridcloud.outbox.base import ReplicatedControlModel, ControlOutboxProducingManager
from sentry.hybridcloud.outbox.category import OutboxCategory


class MyControlModelManager(ControlOutboxProducingManager["MyControlModel"]):
    pass


@control_silo_model
class MyControlModel(ReplicatedControlModel):
    __relocation_scope__ = RelocationScope.Global

    category = OutboxCategory.MY_CONTROL_MODEL_UPDATE

    objects: ClassVar[MyControlModelManager] = MyControlModelManager()

    # Model fields...
    organization = FlexibleForeignKey("sentry.Organization")
    user = FlexibleForeignKey("sentry.User")

    class Meta:
        app_label = "sentry"
        db_table = "sentry_mycontrolmodel"

    def outbox_cell_names(self) -> Collection[str]:
        """
        Which cells should receive outboxes for this change.
        Default implementation checks organization_id then user_id.
        Override for custom logic (e.g., all cells, specific cells).
        """
        # Default: auto-detects from organization_id or user_id attributes.
        # Override only if the default doesn't work for your model.
        return super().outbox_cell_names()

    @classmethod
    def handle_async_deletion(
        cls,
        identifier: int,
        cell_name: str,
        shard_identifier: int,
        payload: Mapping[str, Any] | None,
    ) -> None:
        """Note: receives cell_name — one call per target cell."""
        pass

    def handle_async_replication(self, cell_name: str, shard_identifier: int) -> None:
        """Note: receives cell_name — one call per target cell."""
        pass
```

### 2.4 连接类别

Mixin 类通过 `OutboxCategory.connect_cell_model_updates()`（或 `connect_control_model_updates()`）自动连接信号接收器。这会在类定义时设置 `category` 类变量后发生。该连接会自动分派到你的 `handle_async_replication` 和 `handle_async_deletion` 方法。

对于复制模型，**无需手动创建信号接收器**——Mixin 会处理此事。只有不映射到复制模型的类别才需要手动接收器（参见第 4 步）。

如果你的 `OutboxCategory` 尚不存在，请先创建它（第 3 步）。

## 第 3 步：添加新的 OutboxCategory

每种发件箱消息类型都需要一个注册到且仅注册到一个 `OutboxScope` 的 `OutboxCategory` 枚举值。

**快速步骤：**

1. 在 `src/sentry/hybridcloud/outbox/category.py` 的 `OutboxCategory` 枚举中添加一个新值
2. 将其注册到适当的 `OutboxScope` 下（这决定分片键）
3. 如果使用模型 Mixin，请在模型上设置 `category = OutboxCategory.MY_CATEGORY`

加载 `references/category-and-scope.md`，查看完整的作用域到类别映射、如何选择作用域以及注册机制。

## 第 4 步：编写手动信号接收器

当发件箱类别**未**绑定到 `ReplicatedCellModel` 或 `ReplicatedControlModel` 时，请使用手动接收器。常见情况包括：

- 仅含载荷的操作（审计日志、IP 事件），其所有数据都包含在载荷中
- 由模型变更触发、但不直接复制该模型的操作
- 跨筒仓信号转发（`SEND_SIGNAL`、`RESET_IDP_FLAGS`）
- 需要自定义分派逻辑的复杂多步骤操作

加载 `references/signal-receivers.md`，以获取可复制粘贴的接收器模板、`maybe_process_tombstone` 模式和放置规则。

## 步骤 5：迁移现有模型以使用发件箱

为生产环境中已有数据的模型添加发件箱复制时：

### 5.1 代码变更（非破坏性）

1. 将模型的基类改为 `ReplicatedCellModel` 或 `ReplicatedControlModel`
2. 添加 `category` 类变量
3. 添加生产管理器（`CellOutboxProducingManager` / `ControlOutboxProducingManager`）
4. 实现 `handle_async_replication` 和 `handle_async_deletion`
5. 如有需要，添加 `payload_for_update()`，以提供删除恢复数据
6. 如果 `OutboxCategory` 尚不存在，则创建它（步骤 3）

这些变更是非破坏性的：新的模型保存操作会创建发件箱，但现有行还没有发件箱。

### 5.2 回填现有数据

需要为现有行追溯创建发件箱。在模型类上设置 `replication_version = 2`（或更高版本），并配置回填系统——参见步骤 6。

## 步骤 6：设置回填

回填系统会为早于发件箱集成而存在的模型行创建发件箱。它会分批处理行，并通过 Redis 状态跟踪进度。

加载 `references/backfill.md`，以了解 `replication_version` 机制、选项键格式、Redis 状态跟踪，以及 SaaS 与自托管环境的发布流程。

## 步骤 7：测试基于发件箱的复制

> 如需详细的发件箱测试模板和可复制粘贴的模式，请调用 `hybrid-cloud-test-gen` skill。
> 以下指导说明要测试什么；`hybrid-cloud-test-gen` 则说明如何生成测试代码。

### 7.1 核心测试工具

**`outbox_runner()`**——主要测试工具。它是一个上下文管理器，在被包装的代码成功执行后，会同步清空所有待处理的发件箱：

```python
from sentry.testutils.outbox import outbox_runner

with outbox_runner():
    my_model.save()
# All outboxes drained — cross-silo effects have happened
```

它最多执行 10 次清空迭代（如果超过则引发 `OutboxRecursionLimitError`）。可与 `TestCase` 配合使用——标准发件箱测试无需使用 `TransactionTestCase`。

**`outbox_context(flush=False)`**——创建发件箱记录而不处理它们。用于独立验证发件箱的创建，不涉及处理过程：

```python
from sentry.hybridcloud.models.outbox import outbox_context

with outbox_context(flush=False):
    MyModel(id=10).outbox_for_update().save()

assert CellOutbox.objects.count() == 1
```

**`assume_test_silo_mode` / `assume_test_silo_mode_of`**——在测试中切换筒仓上下文，以查询跨筒仓模型：

```python
from sentry.testutils.silo import assume_test_silo_mode_of

with assume_test_silo_mode_of(MyMapping):
    assert MyMapping.objects.filter(my_model_id=obj.id).exists()
```

### 7.2 测试内容

**发件箱创建** — 验证保存/删除模型时，会创建具有正确作用域、类别和标识符的发件箱行：

```python
def test_outbox_created_on_save(self):
    with outbox_context(flush=False):
        obj = MyModel(id=10, organization_id=1)
        obj.outbox_for_update().save()

    outbox = CellOutbox.objects.first()
    assert outbox.category == OutboxCategory.MY_MODEL_UPDATE.value
    assert outbox.shard_scope == OutboxScope.ORGANIZATION_SCOPE.value
    assert outbox.shard_identifier == 1
```

**复制传播** — 验证完整的往返流程：保存模型 -> 排空发件箱 -> 产生跨孤岛效果：

```python
def test_replication_creates_mapping(self):
    org = self.create_organization()
    with outbox_runner():
        obj = MyModel.objects.create(organization=org, name="test")

    with assume_test_silo_mode_of(MyMapping):
        mapping = MyMapping.objects.get(my_model_id=obj.id)
        assert mapping.name == "test"
```

**删除和墓碑** — 验证删除模型会触发 `handle_async_deletion` 并清理跨孤岛资源：

```python
def test_delete_cleans_up_mapping(self):
    org = self.create_organization()
    with outbox_runner():
        obj = MyModel.objects.create(organization=org, name="test")

    with outbox_runner():
        obj.delete()

    with assume_test_silo_mode_of(MyMapping):
        assert not MyMapping.objects.filter(my_model_id=obj.id).exists()
```

**幂等性** — 验证将同一分片排空两次不会产生重复项或错误：

```python
def test_idempotent_replication(self):
    with outbox_runner():
        obj = MyModel.objects.create(organization=org, name="test")

    with assume_test_silo_mode_of(MyMapping):
        count_after_first = MyMapping.objects.count()

    with outbox_runner():
        pass  # Drain again — should be a no-op

    with assume_test_silo_mode_of(MyMapping):
        assert MyMapping.objects.count() == count_after_first
```

### 7.3 孤岛测试装饰器

- 对于重点测试 `CellOutbox` 创建的测试，使用 **`@cell_silo_test`**
- 对于重点测试 `ControlOutbox` 创建的测试，使用 **`@control_silo_test`**
- 对于涉及两个孤岛的端到端复制测试，使用 **`@all_silo_test`**
- 仅在线程/并发测试（例如 `threading.Barrier`）中使用 **`TransactionTestCase`**，不要将其用于标准的发件箱排空测试

### 7.4 常见陷阱

- **工厂调用**（`self.create_organization()` 等）绝不能包装在 `assume_test_silo_mode` 中。工厂会在内部处理孤岛模式。
- **`outbox_runner()`** 会在退出时清空发件箱。如果需要检查发件箱状态，请改用 `outbox_context(flush=False)`。
- 如果发件箱处理程序创建了更多发件箱（级联），`outbox_runner` 会自动处理（最多迭代 10 次）。

## 步骤 8：调试卡住的发件箱

| 症状                                   | 可能的原因                                      | 排查方式                                            |
| -------------------------------------- | ----------------------------------------------- | --------------------------------------------------- |
| 数据未复制到其他孤岛                   | 处理程序出错，发件箱处于退避状态                | 检查卡住的发件箱上的 `scheduled_for`                |
| 测试中出现 `OutboxFlushError`          | 信号接收器引发异常                              | 阅读错误消息中包装的异常                            |
| 发件箱行不断累积                       | 排空任务未运行或运行失败                        | 检查 `enqueue_outbox_jobs` 的 Celery 任务日志       |
| 分片排空缓慢                           | 合并批次过大或处理程序超时                      | 检查 `outbox.coalesced_net_processing_time` 指标    |
| 导入崩溃：作用域/类别断言              | 类别注册到了错误的作用域或多个作用域            | 检查 `category.py` 中的 `OutboxScope` 注册          |

加载 `references/debugging.md`，查看完整的处理流水线演练、分片检查方法、退避调度、终止开关，以及实用的 SQL/指标查询。

## 第 9 步：验证（提交前检查清单）

提交 PR 前，请验证：

- [ ] 模型继承自 `ReplicatedCellModel` 或 `ReplicatedControlModel`（或使用手动接收器）
- [ ] `category` 类变量已设置为正确的 `OutboxCategory`
- [ ] `OutboxCategory` 仅注册到一个 `OutboxScope`
- [ ] 所选的 `OutboxScope` 与模型的分片键（organization_id、user_id 等）匹配
- [ ] `handle_async_replication` 具有幂等性（多次调用是安全的）
- [ ] `handle_async_deletion` 具有幂等性，并能处理数据行已不存在的情况
- [ ] `payload_for_update()` 仅包含删除恢复所需的数据（不包含快速变化的字段）
- [ ] 模型上已设置生产管理器（`CellOutboxProducingManager` / `ControlOutboxProducingManager`）
- [ ] 批量操作通过生产管理器执行，而不是通过原始查询集
- [ ] `ReplicatedControlModel` 正确实现了 `outbox_cell_names()`
- [ ] 测试验证了发件箱记录的创建（作用域、类别、标识符）
- [ ] 测试验证了端到端复制（保存 -> 排空 -> 跨孤岛生效）
- [ ] 测试验证了删除传播（删除 -> 排空 -> 清理）
- [ ] 测试验证了幂等性（排空两次 -> 无重复项）
- [ ] 如果要迁移现有模型，已递增 `replication_version` 并配置回填