---
name: hybrid-cloud-test-gen
description: Generate hybrid cloud tests for the Sentry codebase. Use when asked to "generate HC test", "create hybrid cloud test", "write HC test", "add HC test", "write RPC test", "test RPC service", "silo test", "cross-silo test", "outbox test", "API gateway test", or "endpoint silo test". Covers RPC service tests, API gateway tests, outbox pattern tests, and API endpoint tests with silo decorators.
---
# 混合云测试生成

此技能用于为 Sentry 的混合云架构生成测试。它涵盖 RPC 服务、API 网关代理、发件箱模式和端点孤岛装饰器。

## 关键约束

> **始终**使用工厂方法（`self.create_user()`、`self.create_organization()`），绝不要使用 `Model.objects.create()`。

> **绝不要**将工厂方法调用包装在 `assume_test_silo_mode` 或 `assume_test_silo_mode_of` 中。工厂能够感知孤岛，并会在内部处理孤岛模式。仅对直接 ORM 查询（`Model.objects.get/filter/count/exists/delete`）使用孤岛模式上下文管理器。

> **始终**使用 `pytest` 风格的断言（`assert x == y`），绝不要使用 `self.assertEqual()`。

> **始终**将测试添加到现有测试文件中，而不是创建新文件，除非该模块不存在测试文件。

> 对于跨孤岛 ORM 访问：访问单个模型时，使用 `assume_test_silo_mode_of(Model)`（会自动检测孤岛）。当代码块涵盖多个模型或非模型操作时，使用 `assume_test_silo_mode(SiloMode.X)`。

> 大多数测试都使用 `TestCase`，包括使用 `outbox_runner()` 的测试。仅当测试需要真实提交的事务（线程、并发、多进程场景）时，才使用 `TransactionTestCase`。

> **绝不要**在处理 RPC 模型的测试文件中使用 `from __future__ import annotations`。

## 步骤 1：确定测试类别

根据用户的请求，确定要生成哪一类混合云测试：

| 信号                                                                 | 类别           | 转到   |
| ------------------------------------------------------------------- | -------------- | ------ |
| RPC 服务、服务方法、序列化往返、分派                                | RPC 服务测试   | 步骤 3 |
| API 网关、代理、中间件、转发                                         | API 网关测试   | 步骤 4 |
| 发件箱、跨孤岛消息、ControlOutbox、CellOutbox、发件箱排空            | 发件箱模式测试 | 步骤 5 |
| 带有孤岛装饰器的 API 端点、端点测试、权限检查                        | 端点孤岛测试   | 步骤 6 |

如果信号不明确，请用户说明具体类别。

## 步骤 2：收集上下文

在生成任何测试之前：

1. **阅读被测试的源模块**。通过检查 `@cell_silo_endpoint`、`@control_silo_endpoint`、`local_mode = SiloMode.X` 或 `@cell_silo_model`/`@control_silo_model` 装饰器来确定其孤岛模式。

2. **使用镜像路径约定查找现有测试文件**：
   - `src/sentry/foo/bar.py` → `tests/sentry/foo/test_bar.py`
   - `src/sentry/foo/services/bar/service.py` → `tests/sentry/foo/services/test_bar.py`
   - `src/sentry/foo/services/bar/impl.py` → `tests/sentry/foo/services/test_bar.py`

3. **阅读现有测试文件**，了解已经测试了哪些内容、使用了哪些基类，以及已经采用了哪些模式。

4. **阅读源方法签名**，了解参数、返回类型以及涉及哪些 RPC 模型。

## 步骤 3：生成 RPC 服务测试

加载 `references/rpc-service-tests.md` 以获取完整模板和模式。

RPC 服务测试必须覆盖：

- **Silo 兼容性**：`@all_silo_test` 确保服务在所有 silo 模式下均可正常工作
- **序列化往返**：`dispatch_to_local_service` 验证参数/返回值在序列化后保持不变
- **字段准确性**：逐字段比较 RPC 模型与 ORM 对象
- **错误处理**：未找到时的返回值、已禁用的方法、远程异常封装
- **跨 silo 影响**：使用 `outbox_runner()` + `assume_test_silo_mode` 检查传播情况

### 快速参考 — 装饰器与基类

| 场景 | 装饰器 | 基类 |
| ---------------------------------- | ----------------------------------------------- | -------------------------------- |
| 标准 RPC 服务 | `@all_silo_test` | `TestCase` |
| 使用命名单元的 RPC | `@all_silo_test(cells=create_test_cells("us"))` | `TestCase` |
| 包含成员映射断言的 RPC | `@all_silo_test` | `TestCase, HybridCloudTestMixin` |

## 第 4 步：生成 API 网关测试

加载 `references/api-gateway-tests.md` 以获取完整模板和模式。

API 网关测试用于验证对 control-silo 端点的请求是否被正确代理到相应的单元。测试必须覆盖：

- **代理透传**：使用正确的参数、请求头和请求体转发请求
- **查询参数转发**：保留多值参数
- **错误代理**：正确转发上游错误
- **流式响应**：使用 `close_streaming_response()` 读取被代理的响应体

### 快速参考 — 装饰器与基类

| 场景 | 装饰器 | 基类 |
| --------------------- | -------------------------------------------------------------------------------- | -------------------- |
| 标准网关测试 | `@control_silo_test(cells=[ApiGatewayTestCase.CELL], include_monolith_run=True)` | `ApiGatewayTestCase` |

## 第 5 步：生成 Outbox 模式测试

加载 `references/outbox-tests.md` 以获取完整模板和模式。

Outbox 测试用于验证跨 silo 消息是否被创建、排空并产生预期的副作用。测试必须覆盖：

- **Outbox 创建**：使用 `outbox_context(flush=False)` 验证正确的 outbox 记录
- **Outbox 处理**：使用 `outbox_runner()` 排空待处理消息
- **跨 silo 副作用**：使用 `assume_test_silo_mode_of(Model)` 检查副本/映射状态
- **幂等性**：对同一分片执行两次排空不会产生重复项

### 快速参考 — 装饰器与基类

| 场景 | 装饰器 | 基类 |
| --------------------------------- | -------------------- | --------------------- |
| Control outbox 测试 | `@control_silo_test` | `TestCase` |
| Cell outbox 测试 | `@cell_silo_test` | `TestCase` |
| 使用线程/并发的 Outbox | （无） | `TransactionTestCase` |

## 第 6 步：生成端点 Silo 测试

加载 `references/endpoint-silo-tests.md` 以获取完整的模板和模式。

端点 Silo 测试用于验证 API 端点能否在其声明的 Silo 模式下正常工作。测试必须涵盖：

- **正确的 Silo 装饰器**：确保端点装饰器与测试装饰器相匹配
- **跨 Silo 数据设置**：使用工厂方法创建数据（无需 Silo 包装器）
- **权限检查**：验证未经授权的访问会返回 401/403
- **响应准确性**：验证响应正文与预期数据一致

### 快速参考——装饰器映射

| 端点装饰器                            | 测试装饰器                                          |
| ------------------------------------- | --------------------------------------------------- |
| `@cell_silo_endpoint  `               | `@cell_silo_test`                                   |
| `@control_silo_endpoint`              | `@control_silo_test`                                |
| `@control_silo_endpoint`（带代理）    | `@control_silo_test(cells=create_test_cells("us"))` |
| 无装饰器（仅限单体模式）              | `@no_silo_test`                                     |

## 第 7 步：验证

在展示生成的测试之前，请根据以下清单进行验证：

- [ ] 测试类使用了正确的 Silo 装饰器
- [ ] 对单模型 ORM 访问使用 `assume_test_silo_mode_of(Model)`；对多模型/非模型 ORM 代码块使用 `assume_test_silo_mode(SiloMode.X)`
- [ ] 工厂方法（`self.create_*`）绝不能包装在 `assume_test_silo_mode` 中
- [ ] 使用工厂方法——绝不使用 `Model.objects.create()`
- [ ] 仅使用 `pytest` 风格的断言（`assert x == y`）
- [ ] 使用正确的基类（大多数测试使用 `TestCase`；仅线程/并发测试使用 `TransactionTestCase`）
- [ ] 导入正确且精简
- [ ] 测试文件位于正确的镜像路径
- [ ] 测试方法名称具有描述性（`test_<action>_<scenario>`）
- [ ] 运行命令：`pytest -svv --reuse-db tests/sentry/path/to/test_file.py`

## 关键导入快速参考

```python
# Silo decorators
from sentry.testutils.silo import (
    all_silo_test,
    control_silo_test,
    cell_silo_test,
    no_silo_test,
    assume_test_silo_mode,
    assume_test_silo_mode_of,
    create_test_cells,
)

# Base classes
from sentry.testutils.cases import TestCase, TransactionTestCase, APITestCase

# Cross-silo utilities
from sentry.testutils.outbox import outbox_runner
from sentry.testutils.hybrid_cloud import HybridCloudTestMixin
from sentry.silo.base import SiloMode

# RPC testing
from sentry.hybridcloud.rpc.service import dispatch_to_local_service

# API gateway testing
from sentry.testutils.helpers.apigateway import ApiGatewayTestCase, verify_request_params

# Outbox models
from sentry.hybridcloud.models.outbox import ControlOutbox, CellOutbox, outbox_context
from sentry.hybridcloud.outbox.category import OutboxCategory, OutboxScope
```

## 上下文管理器快速参考

```python
# Use ONLY for direct ORM queries — never for factory calls
assume_test_silo_mode(SiloMode.CONTROL)     # Switch to control silo for ORM access
assume_test_silo_mode(SiloMode.CELL)        # Switch to cell silo for ORM access
assume_test_silo_mode_of(ModelClass)        # Switch to silo matching model's silo mode

outbox_runner()                             # Drain all pending outboxes on exit
outbox_context(flush=False)                 # Create outboxes without flushing
override_cells(cells)                       # Override active cell config
override_settings(SILO_MODE=SiloMode.X)     # Override Django settings
override_options({"key": value})            # Override Sentry options
```