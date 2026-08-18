---
name: integration-tests
description: Write and run integration tests against a GenLayer environment.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
---
# 集成测试

在真实的 GenLayer 环境（GLSim、Studio 或测试网）中运行合约，并进行完整的共识验证。

## 运行测试

```bash
# Against default network (from gltest.config.yaml)
gltest tests/integration/ -v -s

# Against specific network
gltest tests/integration/ -v -s --network localnet
gltest tests/integration/ -v -s --network studionet
gltest tests/integration/ -v -s --network testnet_bradbury
```

开发期间始终使用 `-v -s` 以显示输出。

## 测试模式

```python
from gltest import get_contract_factory
from gltest.assertions import tx_execution_succeeded

def test_full_flow():
    factory = get_contract_factory("MyContract")
    contract = factory.deploy(args=[])

    # Write methods return transaction receipts
    tx_receipt = contract.set_data(args=["hello"]).transact()
    assert tx_execution_succeeded(tx_receipt)

    # Read methods return values directly
    result = contract.get_data(args=[contract.address]).call()
    assert result == "hello"
```

`ACCEPTED` 和 `FINALIZED` 是交易生命周期状态，并不代表合约执行成功。交易可能在执行出错的情况下仍被接受并最终确认，而执行失败不会应用任何状态变更。对于部署交易，执行失败意味着不会创建合约。

在读取状态、检查 schema/code，或将缺失合约视为基础设施问题之前，始终断言 `tx_execution_succeeded(receipt)`。

## 与直接模式的主要区别

| | 直接模式 | 集成测试 |
|---|---|---|
| 速度 | ~30ms | ~几秒至几分钟 |
| 是否需要服务器 | 否 | 是（GLSim、Studio 或测试网） |
| 共识 | 仅 Leader | 完整的 Leader + 验证者 |
| 写入方法 | 直接返回值 | 返回交易回执 |
| 读取方法 | 直接返回值 | 使用 `.call()` |
| 模拟 | `mock_web()` / `mock_llm()` | 真实的 Web/LLM 调用 |

## 写入调用与读取调用

**写入方法**（改变状态）：
```python
# .transact() submits and waits for consensus
tx_receipt = contract.method_name(args=[arg1, arg2]).transact()
assert tx_execution_succeeded(tx_receipt)
```

**读取方法**（仅查看）：
```python
# .call() reads without transaction
result = contract.view_method(args=[arg1]).call()
```

## 配置（gltest.config.yaml）

```yaml
contract_path: contracts/

networks:
  localnet:
    # GenLayer Studio running locally
  studionet:
    # studio.genlayer.com — gasless, no funding needed (0 GEN balance is fine)
  testnet_bradbury:
    accounts:
      - "${ACCOUNT_PRIVATE_KEY_1}"
      - "${ACCOUNT_PRIVATE_KEY_2}"
```

## 测试标记

```python
import pytest

@pytest.mark.slow
def test_expensive_operation():
    """Excluded by default. Run with: gltest -m slow"""
    pass
```

## 环境

- **GLSim**（`pip install genlayer-test[sim]`、`glsim --port 4000 --validators 5`）——轻量级、无需 Docker，启动约需 1 秒。原生运行 Python，而不是在 GenVM 中运行。适合快速迭代。
- **Studio 本地环境**（`genlayer up`）——完整的 GenVM、真实共识，需要 Docker。用于验证运行时兼容性。
- **studio.genlayer.com**（StudioNet）——托管的 Studio，无需设置，但有速率限制（参见常见问题）。**无需 Gas：不需要代币。** 账户即使 GEN 余额为 0，也可以正常部署并运行测试。
- **Bradbury 测试网**——真实网络，需要账户有足够余额。

## 何时使用集成测试

- 验证共识（leader + validators 达成一致）
- 测试真实的 Web 请求和 LLM 调用
- 部署前的冒烟测试
- 验证合约在实际 GenVM 中正常工作（而不仅仅是在 Python runner 中）

直接模式应覆盖大多数逻辑测试。在部署前，使用集成测试进行最终验证。

## 常见问题

### “Transaction not found” 错误
清除缓存：`rm -rf .gltest_cache`

### 测试速度慢
开发期间运行单个测试：
```bash
gltest tests/integration/test_file.py::test_specific -v -s
```

### JSON 序列化
使用 mock validators 时，将其转换为字典：
```python
transaction_context = {"validators": [v.to_dict() for v in mock_validators]}
```

### Studio 速率限制（HTTP 429 / -32429）
`studio.genlayer.com` 实施按 IP 计算的限制：**60 req/min、1000 req/hr、10000 req/day**。这些限制不是永久性的——一旦触发，后续请求会被拒绝，直到当前时间窗口重置（下一分钟 / 小时 / 天的周期）。请限制批量测试的请求速率，使用 `localnet`（GLSim 或本地 Studio）运行大型测试套件，或控制 `.transact()` 调用的发送节奏。

`-32028` 是相关的待处理队列上限——**每个 sender 最多 32 个进行中的 txs**；每个合约也有单独的上限，以防止向共享 Studio 泛洪请求。请在提交下一批之前等待回执，而不是并行发起请求。