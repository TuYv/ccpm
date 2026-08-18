---
name: direct-tests
description: Write and run fast direct mode tests for GenLayer intelligent contracts.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
---
# 直接模式测试

为智能合约编写快速的内存测试。无需服务器，无需 Docker——测试运行时间约为 30–50 毫秒。

## 运行测试

```bash
pytest tests/direct/ -v
pytest tests/direct/test_specific.py -v
pytest tests/direct/test_specific.py::test_one_case -v
```

## Fixtures

可通过 `genlayer-test` pytest 插件使用：

```python
def test_example(direct_vm, direct_deploy, direct_alice, direct_bob):
    # direct_vm      — VMContext with cheatcodes
    # direct_deploy  — deploy a contract file
    # direct_alice   — test address
    # direct_bob     — test address
    pass
```

所有 fixtures：`direct_vm`、`direct_deploy`、`direct_alice`、`direct_bob`、`direct_charlie`、`direct_owner`、`direct_accounts`

## 基本测试模式

```python
def test_set_and_get(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/my_contract.py")
    direct_vm.sender = direct_alice

    contract.set_data("hello")

    result = contract.get_data(direct_alice)
    assert result == "hello"
```

## 模拟 Web 请求

对于调用 `gl.nondet.web.get()` 的合约：

```python
import json

def test_with_web_mock(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/my_contract.py")
    direct_vm.sender = direct_alice

    # Pattern: regex matching on URL
    direct_vm.mock_web(
        r".*api\.example\.com/prices.*",
        {"status": 200, "body": '{"price": 42.5}'},
    )

    contract.update_price("ETH/USD")
    assert contract.get_price("ETH/USD") == 42.5
```

### 完整模拟格式（需要控制请求头/方法时）

```python
direct_vm.mock_web(
    r"api\.example\.com/data",
    {
        "response": {
            "status": 200,
            "headers": {},
            "body": json.dumps({"key": "value"}).encode()
        },
        "method": "GET"
    }
)
```

## 模拟 LLM 响应

对于调用 `gl.nondet.exec_prompt()` 的合约：

```python
direct_vm.mock_llm(
    r".*Extract the match result.*",  # Regex on prompt text
    json.dumps({"score": "2:1", "winner": 1}),
)
```

## 清除模拟

```python
direct_vm.clear_mocks()  # Reset between test scenarios
```

## VMContext 欺骗码

```python
# Set transaction sender
direct_vm.sender = direct_alice

# Set native value (wei)
direct_vm.value = 1000000000000000000  # 1 ETH

# Expect a revert
with direct_vm.expect_revert("Insufficient balance"):
    contract.withdraw(1000)

# Temporary sender change
with direct_vm.prank(direct_bob):
    contract.method()  # Called as bob

# Snapshot and restore state
snap_id = direct_vm.snapshot()
contract.modify_state()
direct_vm.revert(snap_id)  # State restored

# Set account balance
direct_vm.deal(direct_alice, 1000000000000000000)

# Time travel
direct_vm.warp("2024-06-01T12:00:00Z")
```

## 测试组织

```
tests/direct/
├── conftest.py           # Shared fixtures and mock helpers
├── test_<feature>.py     # Tests per feature/method
└── test_<feature>_web.py # Tests requiring web/LLM mocks
```

## 直接模式下应测试的内容

| 类别 | 示例 |
|----------|---------|
| 状态转换 | 创建 → 读回 → 验证字段 |
| 验证 / 回退 | 无效输入、未经授权的调用者 |
| 访问控制 | 仅所有者可调用的方法、角色检查 |
| 边界情况 | 空状态、边界值、溢出 |
| Web/LLM 解析 | 模拟响应 → 验证提取逻辑 |

## 常见模式

### 测试访问控制
```python
def test_only_owner(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/my_contract.py")

    direct_vm.sender = direct_alice
    contract.create_item("item_1")

    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Only owner"):
        contract.delete_item("item_1")
```

### 测试状态转换
```python
def test_state_flow(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/my_contract.py")
    direct_vm.sender = direct_alice

    contract.create_item("item_1")
    assert contract.get_item("item_1")["status"] == "pending"

    contract.approve_item("item_1")
    assert contract.get_item("item_1")["status"] == "approved"
```

### 可复用的模拟辅助函数（conftest.py）
```python
import json

def mock_price_api(direct_vm, pair: str, price: float):
    """Mock a price API response."""
    direct_vm.mock_web(
        rf".*api\.example\.com/prices/{pair}.*",
        {"status": 200, "body": json.dumps({"price": price})},
    )
```

## 提示

- 在调用写入方法之前，始终设置 `direct_vm.sender = ...`
- 在编写测试之前，对 `genvm-lint check` 使用 `--json` 标志，以了解合约的接口
- 直接模式只运行 leader 函数，不会执行验证者逻辑。要进行完整的共识验证，请使用集成测试。