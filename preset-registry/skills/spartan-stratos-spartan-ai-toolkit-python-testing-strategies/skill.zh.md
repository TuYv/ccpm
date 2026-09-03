---
name: python-testing-strategies
description: "Testing patterns for FastAPI with pytest-asyncio, httpx AsyncClient, fixtures, and test data factories. Use when writing tests, setting up test infrastructure, or improving coverage in a FastAPI project."
allowed_tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---
# Python 测试策略 — 快速参考

## 配置（至关重要）

在 `pyproject.toml` 中设置 `asyncio_mode = "auto"`，以便自动检测异步测试而无需标记。（如果使用 `@pytest.mark.asyncio` 标记测试，默认的 "strict" 模式也可以。）

> 完整的 conftest.py 和 pyproject.toml 配置请参见 examples.md。

## 测试客户端

使用 `httpx.AsyncClient` + `ASGITransport` —— 异步测试绝不要使用 `TestClient`。

> 客户端 fixture 的配置请参见 examples.md。

## 每个端点必需的测试覆盖

1. 正常路径（创建、读取、更新、删除）
2. 未找到（404）
3. 校验错误（422）
4. 认证失败（401）—— 如果有访问保护
5. 软删除 —— 已删除的记录不再返回

## 测试命名

```python
async def test_create_item():           # Happy path
async def test_create_item_missing_name():  # Validation
async def test_get_item_not_found():    # 404
async def test_get_item_soft_deleted(): # Soft delete
```

## 测试数据工厂

使用带有合理默认值的简单工厂函数。只覆盖测试所关心的部分。

> 工厂模式的示例请参见 examples.md。

## 运行测试

```bash
pytest                           # All tests
pytest tests/test_items.py       # One file
pytest -k "test_create"          # By name pattern
pytest --tb=short -q             # Quiet output
```

## 常见陷阱

- **缺失 `asyncio_mode = "auto"` 会无声无息地破坏一切。** 测试看似通过（收集到 0 个）或无限挂起。在编写任何异步测试之前，先把 `[tool.pytest.ini_options] asyncio_mode = "auto"` 添加到 `pyproject.toml` 中。这是“我的测试不运行”的头号原因。

- **`TestClient` 和 `AsyncClient` 不可互换。** `TestClient`（来自 Starlette）是同步的 —— 它会阻塞。`AsyncClient`（来自 httpx）是异步的 —— 它使用事件循环。如果你的应用使用了带 `await` 的 `async def` 路由，就必须配合 `ASGITransport` 使用 `AsyncClient`。使用 `TestClient` 可能会掩盖异步 bug，因为它是同步运行的。

- **没有适当的清理时，数据库状态会在测试之间泄漏。** 每个测试都需要一个干净的数据库。使用一个 `autouse=True` 的 fixture 来创建/删除表，或者在测试之间做截断（truncate）。否则，测试顺序会影响结果，CI 中会出现随机失败。

- **`response.json()` 默认从 FastAPI 返回 snake_case。** 如果你的 Pydantic 模型使用了 `alias_generator`，JSON 键可能与你的 Python 字段名不一致。始终根据实际的 JSON 键进行断言，而不是 Python 属性名。

- **在异步测试中忘记 `await` 会产生令人困惑的错误。** 如果你在测试输出中看到的是 `<coroutine object ...>` 而不是实际数据，说明你忘了写 `await`。每个 `client.get()`、`client.post()` 等调用都必须被 await。
