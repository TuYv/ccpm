---
name: nla-arbitrate
description: Manually arbitrate NLA escrow fulfillments as an alternative to the automated oracle. Use when the user wants to review pending arbitration requests, evaluate demands against fulfillments, and submit on-chain decisions. Supports both interactive and LLM-auto modes.
metadata:
  author: arkhai
  version: "1.0"
compatibility: Requires nla CLI installed (npm install -g nla). Requires a funded Ethereum wallet whose address matches the oracle specified in escrows.
allowed-tools: Bash(nla:*) Read
---
# 手动进行 NLA 仲裁

使用 `nla escrow:arbitrate` CLI 命令手动仲裁托管履约，绕过自动化预言机监听器。

## 使用场景

- 用户希望手动审核并决定托管履约
- 用户就是预言机（创建托管时指定的钱包地址就是用户的钱包地址）
- 自动化预言机未运行，或者用户希望对决策拥有更多控制权

## 分步说明

### 1. 验证预言机身份

用户的钱包必须是托管中指定的预言机地址：

```bash
nla wallet:show
```

### 2a. 仲裁指定的托管

查看已知托管 UID 对应的履约：

```bash
# Interactive mode - prompts for approve/reject
nla escrow:arbitrate --escrow-uid <uid>

# Auto mode - uses the LLM specified in the escrow's demand
nla escrow:arbitrate --escrow-uid <uid> --auto
```

### 2b. 扫描所有待处理请求

查找所有用户作为预言机且尚未仲裁的履约：

```bash
# Interactive mode
nla escrow:arbitrate --escrow-uid all

# Auto mode
nla escrow:arbitrate --escrow-uid all --auto
```

### 3. 审核并作出决定

在**交互模式**下，命令会显示每个待处理履约的以下信息：
- 托管 UID 和履约 UID
- 需求文本
- 履约文本
- 指定的仲裁提供商/模型

然后提示输入决定：`approve`、`reject` 或 `skip`。

在**自动模式**（`--auto`）下，命令使用托管需求中指定的 LLM 提供商/模型自动进行仲裁。需要通过环境变量或标志（`--openai-api-key`、`--anthropic-api-key`、`--openrouter-api-key`）提供至少一个 LLM API 密钥。

### 4. 验证

仲裁完成后，检查结果：

```bash
nla escrow:status --escrow-uid <escrow_uid>
```

## 关键细节

- 用户的钱包地址必须与托管中的预言机地址匹配，否则链上合约会拒绝该决定
- 每个仲裁决定都会作为永久性的链上证明记录
- 在交互模式下，输入 `skip` 或 `s` 可跳过某个履约而不作决定
- 自动模式会从环境变量（OPENAI_API_KEY 等）或 CLI 标志中读取 LLM API 密钥
- 如果未找到待处理请求，命令会说明可能的原因（尚无履约、已经完成仲裁，或预言机地址不正确）

## 前置条件

- 已安装并配置 `nla` CLI
- 通过 `nla wallet:set`、`--private-key` 标志或 `PRIVATE_KEY` 环境变量设置私钥
- 预言机账户中有 ETH 用于支付 gas（提交决定需要支付 gas）
- 对于自动模式：至少需要一个 LLM 提供商 API 密钥

## 示例

```bash
# Scan for all pending requests, decide interactively
nla escrow:arbitrate --escrow-uid all

# Auto-arbitrate a specific escrow using LLM
nla escrow:arbitrate --escrow-uid 0xabc123... --auto

# Auto-arbitrate all pending, with explicit API key
nla escrow:arbitrate --escrow-uid all --auto --openai-api-key sk-...
```