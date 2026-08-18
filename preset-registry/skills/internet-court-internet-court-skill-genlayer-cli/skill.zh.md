---
name: genlayer-cli
description: Use the GenLayer CLI to deploy, interact with, and debug intelligent contracts.
allowed-tools:
  - Bash
  - Read
---
# GenLayer CLI

`genlayer` CLI 用于管理合约部署、交互、交易检查和网络配置。支持 GenLayer Studio（本地）、studio.genlayer.com 和 Testnet Bradbury。

## 设置

```bash
npm install -g genlayer
```

## 网络配置

```bash
genlayer network set                    # Interactive selector
genlayer network set testnet-bradbury   # Direct
genlayer network info                   # Show current network config
genlayer network list                   # List all networks
```

网络：`localnet`、`studionet`、`testnet-asimov`、`testnet-bradbury`

**注意**：`studionet` 无需 gas，因此部署或交互合约不需要代币。GEN 余额为 0 是正常情况，不会阻止任何操作。

**注意**：`studionet` 按 IP 限流：**60 req/min、1000 req/hr、10000 req/day**。这些限制不是永久性的：批量执行大量 `deploy`/`write` 调用会触发 `-32429` / HTTP 429，后续请求将被拒绝，直到窗口重置（下一个分钟 / 小时 / 天周期）。`-32028` 表示待处理队列达到上限：**每个发送者最多 32 个进行中的 tx**；每个合约还单独有一个上限。请限制批处理脚本的请求速率，在提交之间等待回执，或者对大量批处理使用 `localnet`。

**对于内置网络，始终使用 `genlayer network set`，不要使用 `--rpc`**。`--rpc` 标志会绕过链配置（共识合约 ABI、`isStudio` 标志等），并导致交易轮询失败。只有对于不在内置列表中的自定义/私有网络，才使用 `--rpc`。

## 账户管理

```bash
genlayer account                        # Show active account (address, balance, network)
genlayer account list                   # List all accounts
genlayer account create --name dev1     # Create new account
genlayer account use dev1               # Set active account
genlayer account unlock                 # Cache key in OS keychain (no password prompts)
genlayer account lock                   # Remove from keychain

# Import from private key or keystore
genlayer account import --name imported --private-key 0x...
genlayer account import --name imported --keystore ./keystore.json

# Send tokens
genlayer account send 0x123...abc 10gen
```

金额格式：`"10gen"`、`"0.5gen"` 或原始 wei `"1000000000000000000"`

### 非交互式用法（CI/CD、容器、代理）

`account create`、`account import` 和 `account send` 接受 `--password <password>`，可跳过交互式提示：

```bash
genlayer account create --name dev1 --password "mypassword"
genlayer account import --name imported --private-key 0x... --password "mypassword"
```

`account unlock` 需要操作系统密钥链（macOS Keychain、GNOME Keyring 等），在无头容器中会失败。当账户处于锁定状态时，需要签署交易的命令（`deploy`、`write`、`appeal`、`account send`）会提示输入 keystore 密码。要实现自动化，请通过 stdin 传递密码：

```bash
echo "mypassword" | genlayer deploy --contract contracts/my_contract.py --args "arg1"
```

## 资金账户

新账户的初始余额为 0 GEN。资金要求取决于网络：

**StudioNet 不收取 gas 费用** —— 余额为 0 GEN 的账户无需任何资金即可部署合约并与合约交互。在 StudioNet 上，余额为 0 是正常且符合预期的。使用 StudioNet 时完全跳过充值步骤。

对于**测试网**（Bradbury、Asimov），请在部署或写入操作前为账户充值。

**水龙头**：[https://testnet-faucet.genlayer.foundation/](https://testnet-faucet.genlayer.foundation/)

1. 获取你的地址：`genlayer account` -> 复制 `address` 字段
2. 打开水龙头 URL，粘贴地址并领取 100 GEN（每 24 小时一次）
3. 验证：`genlayer account` 应显示更新后的余额

水龙头使用 Cloudflare Turnstile，无法通过 CLI 自动化 —— 用户必须在浏览器中手动领取。Testnet Bradbury 和 Testnet Asimov 均可使用。

## 合约部署

```bash
# Deploy a specific contract
genlayer deploy --contract contracts/my_contract.py
genlayer deploy --contract contracts/my_contract.py --args "arg1" 42

# Run all deploy scripts in deploy/ folder
genlayer deploy
```

## 合约交互

### 读取（无交易）
```bash
genlayer call <address> <method>
genlayer call 0x123...abc get_data --args "key1"
```

### 写入（发送交易）
```bash
genlayer write <address> <method>
genlayer write 0x123...abc set_data --args "hello"
```

### 检查合约
```bash
genlayer schema <address>   # Method signatures and types
genlayer code <address>     # Source code
```

## 交易调试

最有用的调试命令 —— 检查交易中发生了什么：

```bash
# Get full receipt (waits for FINALIZED by default)
genlayer receipt <txHash>

# Get just stdout or stderr from execution
genlayer receipt <txHash> --stdout
genlayer receipt <txHash> --stderr

# Wait for a lifecycle status
genlayer receipt <txHash> --status PENDING
genlayer receipt <txHash> --status ACCEPTED
genlayer receipt <txHash> --status FINALIZED

# Custom retry behavior
genlayer receipt <txHash> --retries 50 --interval 3000
```

交易生命周期状态：`SUBMITTED` -> `PENDING` -> `ACCEPTED` -> `FINALIZED`

### 生命周期状态不代表执行成功

`ACCEPTED` 和 `FINALIZED` 表示网络已接受或最终确定了交易结果。它们并不表示合约代码执行成功。

如果合约执行失败，交易仍然可能变为 `ACCEPTED`，随后变为 `FINALIZED`，但状态变更不会被应用。对于部署交易，这意味着不会创建合约。在这种情况下，`genlayer code`、`genlayer schema`、`eth_getCode` 或 `gen_getContractSchema` 返回不存在合约是符合预期的。

在诊断基础设施问题之前，务必先检查回执中的执行结果：

1. 运行 `genlayer receipt <txHash> --stdout --stderr`。
2. 检查执行是成功还是失败。
3. 如果执行失败，先修复合约或运行时错误。
4. 只有在回执显示执行成功时，才将代码或 schema 缺失视为可能的 RPC、索引器或状态读取问题。

| 观察结果 | 可能含义 |
|-------------|----------------|
| `ACCEPTED`/`FINALIZED` + 执行错误 + 没有代码/架构 | 预期中的部署失败；修复合约或运行时错误 |
| `ACCEPTED`/`FINALIZED` + 执行成功 + 没有代码/架构 | 可能是 RPC、索引器或状态读取问题 |
| `PENDING`、缺少收据或找不到交易 | 轮询、网络或交易传播问题 |

## 申诉交易

对交易结果提出异议，以触发验证器重新评估：

```bash
genlayer appeal <txHash>
```

## 本地 Studio 管理

```bash
genlayer init                               # 初始化环境
genlayer init --numValidators 10 --headless  # 自定义
genlayer up                                 # 启动 Studio
genlayer up --reset-db                      # 全新启动
genlayer stop                               # 停止所有服务
```

### 本地验证器管理

```bash
genlayer localnet validators get                          # 列出全部
genlayer localnet validators count                        # 计数
genlayer localnet validators create --stake 50            # 添加一个
genlayer localnet validators create-random --count 3      # 添加多个
genlayer localnet validators update 0x... --model gpt-4   # 更改模型
genlayer localnet validators delete --address 0x...       # 移除
```

## 调试工作流

当交易失败或产生意外结果时：

1. **获取收据**：`genlayer receipt <txHash> --stdout --stderr`
2. **检查执行结果**：仅凭生命周期状态是不够的；`ACCEPTED`/`FINALIZED` 可能包含执行错误
3. **检查合约架构**：`genlayer schema <address>`（验证方法是否存在，以及参数是否正确）
4. **读取合约源代码**：`genlayer code <address>`（验证已部署代码是否与本地代码一致）
5. **尝试读取调用**：`genlayer call <address> <view_method>`（检查当前状态）
6. **必要时提出申诉**：`genlayer appeal <txHash>`（重新运行共识）

## 项目脚手架

```bash
genlayer new myproject          # 从模板创建
genlayer new myproject --path ./projects/
```

## 配置

```bash
genlayer config get                         # 显示所有配置
genlayer config get network                 # 特定键
genlayer config set network=testnet-bradbury
genlayer config reset network               # 恢复默认值
```