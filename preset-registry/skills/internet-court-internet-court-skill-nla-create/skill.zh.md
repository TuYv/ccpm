---
name: nla-create
description: Create a Natural Language Agreement escrow on-chain. Use when the user wants to lock ERC20 tokens in an escrow with a natural language demand that an AI oracle will arbitrate. Handles demand crafting, parameter gathering, and CLI execution.
metadata:
  author: arkhai
  version: "1.0"
compatibility: Requires nla CLI installed (npm install -g nla). Requires a funded Ethereum wallet and access to an EVM chain.
allowed-tools: Bash(nla:*) Read
---
# 创建 NLA 托管

帮助用户使用 `nla` CLI 创建由自然语言需求支持的区块链托管。

## 概述

NLA 托管会在链上锁定 ERC20 代币。任何人都可以尝试完成该托管的自然语言需求。AI 预言机将评估完成情况，并在需求得到满足时释放代币。

## 分步说明

### 1. 收集需求

通过对话向用户收集以下信息：

**必填：**
- **需求**：必须完成的自然语言条件。帮助用户拟定清晰且无歧义的表述。
- **金额**：要托管的代币数量（以代币的最小单位计——不自动进行小数位转换）。
- **代币地址**：ERC20 代币合约地址（`0x...`）。
- **预言机地址**：负责仲裁的预言机地址。

**可选：**
- **仲裁提供商**：`OpenAI`（默认）、`Anthropic` 或 `OpenRouter`。
- **仲裁模型**：例如 `gpt-4o-mini`（默认）、`claude-3-5-sonnet-20241022`、`openai/gpt-4o`。
- **仲裁提示词**：包含 `{{demand}}` 和 `{{obligation}}` 占位符的自定义提示词模板。

### 2. 检查前置条件

```bash
# Verify CLI is available
which nla

# Check current network
nla network

# Check wallet is configured
nla wallet:show
```

如果尚未配置钱包，用户必须选择以下方式之一：
- 运行 `nla wallet:set --private-key <key>`
- 向命令传递 `--private-key <key>`
- 设置 `PRIVATE_KEY` 环境变量

### 3. 帮助拟定需求

指导用户编写有效的需求：
- 应具体，并且能够由 LLM 进行评估
- 考虑：怎样才算有效完成？该条件是否可验证？
- 对于需要现实世界知识的主张，建议使用具备搜索能力的模型（如果预言机已配置，Perplexity 搜索可用）
- 需求、提供商、模型和提示词都会被编码到链上并公开可见——切勿包含秘密信息

### 4. 执行托管创建

```bash
nla escrow:create \
  --demand "<demand text>" \
  --amount <amount> \
  --token <token_address> \
  --oracle <oracle_address> \
  [--arbitration-provider "<provider>"] \
  [--arbitration-model "<model>"] \
  [--arbitration-prompt "<prompt>"]
```

### 5. 记录输出

该命令会输出一个托管 UID（`0x...`）。此 UID 是完成和领取所必需的。向用户清晰展示该 UID，并说明后续步骤。

## 关键细节

- 可用网络：`anvil`（本地）、`sepolia`、`base-sepolia`、`mainnet`。使用 `nla switch <network>` 切换。
- 对于本地开发，`nla dev` 会启动 Anvil、部署合约、创建模拟代币并启动预言机。
- Sepolia 上的公开演示预言机：`0xc5c132B69f57dAAAb75d9ebA86cab504b272Ccbc`。
- 默认仲裁提示词：
  ```
  Evaluate the fulfillment against the demand and decide whether the demand was validly fulfilled

  Demand: {{demand}}

  Fulfillment: {{obligation}}
  ```

## 示例

```bash
nla escrow:create \
  --demand "Provide a valid proof that P != NP" \
  --amount 1000000 \
  --token 0xa513e6e4b8f2a923d98304ec87f64353c4d5c853 \
  --oracle 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --arbitration-provider "Anthropic" \
  --arbitration-model "claude-3-5-sonnet-20241022"
```