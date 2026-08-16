---
name: hybrid-cloud-rpc
description: Guide for creating, updating, and deprecating hybrid cloud RPC services in Sentry. Use when asked to "add RPC method", "create RPC service", "hybrid cloud service", "new RPC model", "deprecate RPC method", "remove RPC endpoint", "cross-silo service", "cell RPC", or "control silo service". Covers service scaffolding, method signatures, RPC models, cell resolvers, testing, and safe deprecation workflows.
---
# 混合云 RPC 服务

本技能将指导你在 Sentry 的混合云架构中创建、修改和弃用 RPC 服务。RPC 服务支持 Control silo（用户身份验证、组织管理）与 Cell silo（项目数据、事件、问题、计费）之间的跨 silo 通信。

## 关键约束

> **绝不要**在 `service.py` 或 `model.py` 文件中使用 `from __future__ import annotations`。
> RPC 框架会在导入时对类型注解进行反射。前向引用会导致序列化静默失败。

> **所有** RPC 方法参数都必须是仅限关键字参数（在签名中使用 `*`）。

> **所有**参数和返回类型都必须具有完整的类型注解——不得使用字符串形式的前向引用。

> **仅允许**使用可序列化类型：`int`、`str`、`bool`、`float`、`None`、`Optional[T]`、`list[T]`、`dict[str, T]`、`RpcModel` 子类、`Enum` 子类、`datetime.datetime`。

> 服务**必须**位于 12 个已注册的发现包之一（参见步骤 3）。

> 对敏感字段（令牌、密钥、键、配置数据块、
> 元数据字典）使用 `Field(repr=False)`，以防止其泄露到日志和错误报告中。
> 完整指南请参阅 `references/rpc-models.md`。

## 步骤 1：确定操作

对开发者的需求进行分类：

| 意图                                  | 前往                 |
| ------------------------------------- | ------------------- |
| 创建全新的 RPC 服务                   | 步骤 2，然后步骤 3   |
| 向现有服务添加方法                    | 步骤 2，然后步骤 4   |
| 更新现有方法的签名                    | 步骤 5               |
| 弃用或移除方法/服务                   | 步骤 6               |

## 步骤 2：确定 Silo 模式

服务的 `local_mode` 决定由数据库支持的实现在何处运行：

| 数据位于……                                              | `local_mode`       | 方法上的装饰器                  | 示例                               |
| ------------------------------------------------------- | ------------------ | ------------------------------- | ---------------------------------- |
| Cell silo（项目、事件、问题、组织数据、计费）           | `SiloMode.CELL`    | `@cell_rpc_method(resolve=...)` | `OrganizationService`              |
| Control silo（用户、身份验证、组织映射）                | `SiloMode.CONTROL` | `@rpc_method`                   | `OrganizationMemberMappingService` |

**判断规则**：如果需要查询的 Django 模型位于 Cell 数据库中，请使用 `SiloMode.CELL`。如果它们位于 Control 数据库中，请使用 `SiloMode.CONTROL`。

Cell silo 服务要求每个 RPC 方法都具备 `CellResolutionStrategy`，以便框架知道应将远程调用路由到哪个 Cell。加载 `references/resolvers.md` 以查看完整的解析器表。

## 步骤 3：创建新服务

加载 `references/service-template.md` 以获取可复制粘贴的文件模板。

### 目录结构

```
src/sentry/{domain}/services/{service_name}/
├── __init__.py      # Re-exports model and service
├── model.py         # RpcModel subclasses (NO future annotations)
├── serial.py        # ORM → RpcModel conversion functions
├── service.py       # Abstract service class (NO future annotations)
└── impl.py          # DatabaseBacked implementation
```

### 注册

服务包必须是以下 12 个已注册发现包之一的子包：

```
sentry.auth.services
sentry.audit_log.services
sentry.backup.services
sentry.hybridcloud.services
sentry.identity.services
sentry.integrations.services
sentry.issues.services
sentry.notifications.services
sentry.organizations.services
sentry.projects.services
sentry.sentry_apps.services
sentry.users.services
```

如果你的服务不适合归入其中任何一个，请在 `src/sentry/hybridcloud/rpc/service.py:list_all_service_method_signatures()` 的 `service_packages` 元组中添加一个新条目。

### 新服务检查清单

- [ ] `key` 在所有服务中是唯一的（使用 `grep -r 'key = "' src/sentry/*/services/*/service.py` 检查现有键）
- [ ] `local_mode` 与数据所在位置匹配
- [ ] `get_local_implementation()` 返回 `DatabaseBacked` 子类
- [ ] 在 `service.py` 底部定义模块级 `my_service = MyService.create_delegation()`
- [ ] `__init__.py` 重新导出模型和服务
- [ ] `service.py` 或 `model.py` 中没有 `from __future__ import annotations`

## 第 4 步：添加或更新方法

### 对于 CELL silo 服务

加载 `references/resolvers.md` 以了解解析器的详细信息。

```python
@cell_rpc_method(resolve=ByOrganizationId())
@abstractmethod
def my_method(
    self,
    *,
    organization_id: int,
    name: str,
    options: RpcMyOptions | None = None,
) -> RpcMyResult | None:
    pass
```

关键规则：

- `@cell_rpc_method` 必须位于 `@abstractmethod` 之前
- 解析器参数（例如 `organization_id`）必须包含在方法签名中
- 当返回类型为 `Optional`，且缺少组织映射表示“未找到”而非错误时，使用 `return_none_if_mapping_not_found=True`

### 对于 CONTROL silo 服务

```python
@rpc_method
@abstractmethod
def my_method(
    self,
    *,
    user_id: int,
    data: RpcMyData,
) -> RpcMyResult:
    pass
```

### 非抽象便捷方法

你还可以添加组合其他 RPC 调用的非抽象方法。这些方法在本地运行，不会作为 RPC 端点公开：

```python
def get_by_slug_or_id(self, *, slug: str | None = None, id: int | None = None) -> RpcThing | None:
    if slug:
        return self.get_by_slug(slug=slug)
    if id:
        return self.get_by_id(id=id)
    return None
```

### 在 impl.py 中实现

`DatabaseBacked` 子类必须使用完全相同的参数名称实现每个 `@abstractmethod`：

```python
class DatabaseBackedMyService(MyService):
    def my_method(self, *, organization_id: int, name: str, options: RpcMyOptions | None = None) -> RpcMyResult | None:
        # ORM queries here
        obj = MyModel.objects.filter(organization_id=organization_id, name=name).first()
        if obj is None:
            return None
        return serialize_my_model(obj)
```

### 错误传播

RPC 方法传播的所有错误都必须通过返回类型传递。错误会被重新包装，并作为通用的 Invalid service request 返回给外部调用者。

```python
class RpcTentativeResult(RpcModel):
    success: bool
    error_str: str | None
    result: str | None

class DatabaseBackedMyService(MyService):
    def foobar(self, *, organization_id: int) -> RpcTentativeResult
        try:
            some_function_call()
        except e:
            return RpcTentativeResult(success=False, error_str = str(e))

        return RpcTentativeResult(success=True, result="foobar")
```

### RPC 模型

加载 `references/rpc-models.md`，了解支持的类型、默认值和序列化模式。

## 步骤 5：更新方法签名

### 安全变更（向后兼容）

- 添加具有默认值的新**可选**参数
- 扩宽 Control RPC 服务的返回类型（例如，`RpcFoo` → `RpcFoo | None`）
- 向 `RpcModel` 添加具有默认值的字段

### 破坏性变更（需要协调）

- 移除参数或重命名参数
- 更改参数的类型
- 缩窄返回类型
- 从 `RpcModel` 中移除字段

对于破坏性变更，请采用两阶段方法：

1. 在保留旧方法的同时添加新方法
2. 将所有调用方迁移到新方法
3. 移除旧方法（参见步骤 6）

## 步骤 6：弃用或移除

加载 `references/deprecation.md`，了解完整的三阶段工作流。

**快速摘要**：在运行时禁用 → 迁移调用方 → 移除代码。

## 步骤 7：测试

每个 RPC 服务都需要三类测试：**silo 模式兼容性**、**数据准确性**和**错误处理**。当测试需要处理 outbox 或 `on_commit` 钩子时，请使用 `TransactionTestCase`（而不是 `TestCase`）。

### 7.1 使用 `@all_silo_test` 测试 silo 模式兼容性

每个服务测试类都必须使用 `@all_silo_test`，以便测试在所有三种模式（MONOLITH、CELL、CONTROL）下运行。这可确保委托层在本地和远程分派路径下都能正常工作。

```python
from sentry.testutils.cases import TestCase, TransactionTestCase
from sentry.testutils.silo import all_silo_test, assume_test_silo_mode, create_test_cells

@all_silo_test
class MyServiceTest(TestCase):
    def test_get_by_id(self):
        org = self.create_organization()
        result = my_service.get_by_id(organization_id=org.id, id=thing.id)
        assert result is not None
```

对于需要具名 cell 的测试（例如，测试 cell 解析）：

```python
@all_silo_test(cells=create_test_cells("us", "eu"))
class MyServiceCellTest(TransactionTestCase):
    ...
```

当访问位于不同 silo 中的 ORM 模型时，使用 `assume_test_silo_mode` 或 `assume_test_silo_mode_of` 在测试内切换模式：

```python
def test_cross_silo_behavior(self):
    with assume_test_silo_mode(SiloMode.CELL):
        org = self.create_organization()
    result = my_service.get_by_id(organization_id=org.id, id=thing.id)
    assert result is not None
```

### 7.2 使用 `dispatch_to_local_service` 进行序列化往返测试

测试参数和返回值能否在序列化/反序列化后保持正确：

```python
from sentry.hybridcloud.rpc.service import dispatch_to_local_service

def test_serialization_round_trip(self):
    result = dispatch_to_local_service(
        "my_service_key",
        "my_method",
        {"organization_id": org.id, "name": "test"},
    )
    assert result["value"] is not None
```

### 7.3 RPC 模型数据准确性

验证 RPC 模型是否忠实地表示 ORM 数据。将 RPC 模型的**每个字段**与源 ORM 对象进行比较：

```python
def test_rpc_model_accuracy(self):
    orm_obj = MyModel.objects.get(id=thing.id)
    rpc_obj = my_service.get_by_id(organization_id=org.id, id=thing.id)

    assert rpc_obj.id == orm_obj.id
    assert rpc_obj.name == orm_obj.name
    assert rpc_obj.organization_id == orm_obj.organization_id
    assert rpc_obj.is_active == orm_obj.is_active
    assert rpc_obj.date_added == orm_obj.date_added
```

对于包含标志或嵌套对象的模型，遍历所有字段名称：

```python
def test_flags_accuracy(self):
    rpc_org = organization_service.get(id=org.id)
    for field_name in rpc_org.flags.get_field_names():
        assert getattr(rpc_org.flags, field_name) == getattr(orm_org.flags, field_name)
```

对于列表结果，比较前先按 ID 对两边进行排序：

```python
def test_list_accuracy(self):
    rpc_items = my_service.list_things(organization_id=org.id)
    orm_items = list(MyModel.objects.filter(organization_id=org.id).order_by("id"))
    assert len(rpc_items) == len(orm_items)
    for rpc_item, orm_item in zip(sorted(rpc_items, key=lambda x: x.id), orm_items):
        assert rpc_item.id == orm_item.id
        assert rpc_item.name == orm_item.name
```

### 7.4 跨 silo 资源创建

如果你的服务创建或更新的资源会跨 silo 传播（通过发件箱或映射），请验证其跨 silo 效果。

在测试期间使用 `outbox_runner()` 同步清空发件箱：

```python
from sentry.testutils.outbox import outbox_runner

def test_cross_silo_mapping_created(self):
    with outbox_runner():
        my_service.create_thing(organization_id=org.id, name="test")

    with assume_test_silo_mode(SiloMode.CONTROL):
        mapping = MyMapping.objects.get(organization_id=org.id)
        assert mapping.name == "test"
```

对于三重相等断言（RPC 结果 = 源 ORM = 跨 silo 副本）：

```python
def test_provisioning_accuracy(self):
    rpc_result = my_service.provision(organization_id=org.id, slug="test")
    with assume_test_silo_mode(SiloMode.CELL):
        orm_obj = MyModel.objects.get(id=rpc_result.id)
    with assume_test_silo_mode(SiloMode.CONTROL):
        mapping = MyMapping.objects.get(organization_id=org.id)
    assert rpc_result.slug == orm_obj.slug == mapping.slug
```

使用 `HybridCloudTestMixin` 执行常见的跨 silo 断言：

```python
from sentry.testutils.hybrid_cloud import HybridCloudTestMixin

class MyServiceTest(HybridCloudTestMixin, TransactionTestCase):
    def test_member_mapping_synced(self):
        self.assert_org_member_mapping(org_member=org_member)
```

### 7.5 错误处理

测试服务是否能在所有 silo 模式下正确处理错误：

```python
def test_not_found_returns_none(self):
    result = my_service.get_by_id(organization_id=org.id, id=99999)
    assert result is None

def test_missing_org_returns_none(self):
    # For methods with return_none_if_mapping_not_found=True
    result = my_service.get_by_id(organization_id=99999, id=1)
    assert result is None
```

测试被禁用的方法：

```python
from sentry.hybridcloud.rpc.service import RpcDisabledException
from sentry.testutils.helpers.options import override_options

def test_disabled_method_raises(self):
    with override_options({"hybrid_cloud.rpc.disabled-service-methods": ["MyService.my_method"]}):
        with pytest.raises(RpcDisabledException):
            dispatch_remote_call(None, "my_service_key", "my_method", {"id": 1})
```

测试远程异常是否被正确包装：

```python
from sentry.hybridcloud.rpc.service import RpcRemoteException

def test_remote_error_wrapping(self):
    if SiloMode.get_current_mode() == SiloMode.CELL:
        with pytest.raises(RpcRemoteException):
            my_control_service.do_thing_that_fails(...)
```

测试失败的操作不会产生任何副作用：

```python
def test_no_side_effects_on_failure(self):
    result = my_service.create_conflicting_thing(organization_id=org.id)
    assert not result
    with assume_test_silo_mode(SiloMode.CELL):
        assert not MyModel.objects.filter(organization_id=org.id).exists()
```

还需测试所有调用代码（包括直接调用和间接调用），并确保使用正确的 silo 装饰器。

### 7.6 测试所需的关键导入

```python
from sentry.testutils.cases import TestCase, TransactionTestCase
from sentry.testutils.silo import (
    all_silo_test,
    control_silo_test,
    cell_silo_test,
    assume_test_silo_mode,
    assume_test_silo_mode_of,
    create_test_cells,
)
from sentry.testutils.outbox import outbox_runner
from sentry.testutils.hybrid_cloud import HybridCloudTestMixin
from sentry.hybridcloud.rpc.service import (
    dispatch_to_local_service,
    dispatch_remote_call,
    RpcDisabledException,
    RpcRemoteException,
)
```

## 步骤 8：验证（提交前检查清单）

提交 PR 之前，请验证：

- [ ] service.py 或 model.py 中没有 `from __future__ import annotations`
- [ ] 所有 RPC 方法参数均为仅限关键字参数（使用 `*` 分隔符）
- [ ] 所有参数都有显式类型注解
- [ ] 所有类型均可序列化（基本类型、RpcModel、list、Optional、dict、Enum、datetime）
- [ ] Cell 服务方法使用了带有适当解析器的 `@cell_rpc_method`
- [ ] Control 服务方法使用了 `@rpc_method`
- [ ] `@cell_rpc_method` / `@rpc_method` 位于 `@abstractmethod` 之前
- [ ] 在 service.py 底部的模块级作用域调用了 `create_delegation()`
- [ ] 服务包位于 12 个已注册的发现包之一
- [ ] `impl.py` 实现了每个抽象方法，且参数名称一致
- [ ] `serial.py` 能够正确地将 ORM 模型转换为 RPC 模型
- [ ] 敏感字段使用 `Field(repr=False)`（令牌、密钥、配置、元数据）
- [ ] 测试使用 `@all_silo_test` 以完整覆盖所有 silo 模式
- [ ] 测试根据 ORM 对象验证 RPC 模型字段的准确性
- [ ] 测试验证跨 silo 资源（映射、副本）是否使用正确的数据创建
- [ ] 测试覆盖错误情况（未找到、方法被禁用、操作失败）
- [ ] 测试通过 `dispatch_to_local_service` 覆盖序列化往返过程