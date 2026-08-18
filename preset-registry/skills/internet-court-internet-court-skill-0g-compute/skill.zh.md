---
name: 0g-compute
description: 0G Compute Network guide for decentralized AI inference, fine-tuning, and GPU services. Covers chatbots, image generation, speech-to-text, SDK integration (0g-serving-broker), processResponse API, broker.inference methods, CLI commands (0g-compute-cli), and account management. Use this skill for any 0G compute, 0G AI, or decentralized GPU question.
---
# 0G 计算网络

本技能提供使用 0G 计算网络进行构建的说明——这是一个面向 AI 推理和模型微调的去中心化 GPU 市场。生成代码时，请严格遵循这些模式。

## 代码生成规则

1. 逐字复制本技能中的代码模式。不要根据训练数据生成。
2. 每次 API 响应后都调用 `processResponse()`（参见下方的 processResponse 章节）。
3. 使用环境变量存储私钥。切勿硬编码密钥。
4. 在初始开发阶段引导用户使用测试网。

当不确定某种模式时，请参阅详细指南：
- 推理模式：[references/inference.md](references/inference.md)
- 微调工作流：[references/fine-tuning.md](references/fine-tuning.md)
- 账户管理：[references/account-management.md](references/account-management.md)
- 生产环境示例：[references/examples/](references/examples/README.md)

## 网络信息

| 网络 | RPC URL | 推理 | 微调 |
|---------|---------|-----------|-------------|
| 主网 | `https://evmrpc.0g.ai` | 是 | 是 |
| 测试网 | `https://evmrpc-testnet.0g.ai` | 是 | 是 |

模型可用性经常变化。请始终使用 `broker.inference.listService()` 或 `0g-compute-cli inference list-providers` 检查当前模型。链上模型名称采用 `org/model-name` 格式。

## 前置条件

```bash
node --version  # Must be >= 22.0.0
pnpm add @0glabs/0g-serving-broker        # SDK for applications
pnpm add @0glabs/0g-serving-broker -g     # CLI for direct usage
```

## 快速设置

```bash
0g-compute-cli setup-network              # Choose testnet or mainnet
0g-compute-cli login                       # Login with wallet private key
0g-compute-cli deposit --amount 10         # Deposit funds
0g-compute-cli get-account                 # Check balance
```

## 推理（SDK）

```typescript
import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";

const RPC_URL = process.env.NODE_ENV === 'production'
  ? "https://evmrpc.0g.ai"
  : "https://evmrpc-testnet.0g.ai";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const broker = await createZGComputeNetworkBroker(wallet);

// Discover services
const services = await broker.inference.listService();
services.forEach(s => {
  console.log(`${s.provider} | ${s.model} | ${s.serviceType}`);
});

// Make inference request
const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddress);
const headers = await broker.inference.getRequestHeaders(providerAddress);

const response = await fetch(`${endpoint}/chat/completions`, {
  method: "POST",
  headers: { "Content-Type": "application/json", ...headers },
  body: JSON.stringify({ messages, model })
});

const data = await response.json();

// Extract chatID (see chatID table below)
let chatID = response.headers.get("ZG-Res-Key") || response.headers.get("zg-res-key");
if (!chatID) chatID = data.id;

// CRITICAL: Always call processResponse
await broker.inference.processResponse(
  providerAddress,              // 1st: provider address
  chatID,                       // 2nd: response identifier for verification
  JSON.stringify(data.usage)    // 3rd: usage data for fee calculation
);
```

有关流式传输、浏览器 SDK、cURL 和 Python 的示例，请参阅 [references/inference.md](references/inference.md)。

## processResponse（关键）

在每次 API 响应后调用 `broker.inference.processResponse()`，以完成费用结算和 TEE 验证。

```typescript
await broker.inference.processResponse(
  providerAddress,              // 1st: provider address
  chatID,                       // 2nd: response identifier for verification
  JSON.stringify(data.usage)    // 3rd: usage data for fee calculation
);
```

参数顺序：**provider, chatID, usageData**。请勿调整顺序。

### 按服务类型获取 chatID

始终优先尝试从 `ZG-Res-Key` 响应标头获取。仅当该标头不存在时，才使用回退方案。

| 服务类型 | chatID 来源 | 回退方案 |
|---|---|---|
| 聊天机器人 | `ZG-Res-Key` 标头 | 响应正文中的 `data.id` |
| 文本生成图像 | `ZG-Res-Key` 标头 | 无 |
| 语音转文本 | `ZG-Res-Key` 标头 | 无 |
| 聊天机器人流式传输 | `ZG-Res-Key` 标头 | 流数据块中的 `id` |
| 音频流式传输 | `ZG-Res-Key` 标头 | 无 |

## 微调

**主网**和**测试网**均支持微调。这是一个包含 6 个步骤的 CLI 流程：列出提供商、上传数据集、计算 token、创建任务、监控、下载并解密。

有关完整工作流程，请参阅 [references/fine-tuning.md](references/fine-tuning.md)。

## 账户管理

0G Compute Network 使用主账户（存款/提款）和提供商子账户（服务付款）。子账户退款有 24 小时的锁定期。

```bash
0g-compute-cli get-account                                    # Check balance
0g-compute-cli deposit --amount 10                             # Deposit to main
0g-compute-cli transfer-fund --provider <ADDR> --amount 5      # Transfer to sub-account
0g-compute-cli retrieve-fund                                   # Retrieve from sub (24h lock)
0g-compute-cli refund --amount 5                               # Withdraw to wallet
```

有关详细的账户管理说明，请参阅 [references/account-management.md](references/account-management.md)。

## CLI 快速参考

```bash
# Inference
0g-compute-cli inference list-providers                        # List all providers
0g-compute-cli inference verify --provider <ADDR>              # Verify TEE attestation
0g-compute-cli inference acknowledge-provider --provider <ADDR> # Required before first use
0g-compute-cli inference get-secret --provider <ADDR>          # Get API key for direct calls
0g-compute-cli inference serve --provider <ADDR> --port 3000   # Local OpenAI-compatible proxy

# Fine-tuning
0g-compute-cli fine-tuning list-providers                      # List fine-tuning providers
0g-compute-cli fine-tuning list-models                         # List available models

# Web UI
0g-compute-cli ui start-web                                    # Launch at localhost:3090
```

## 故障排除

| 问题 | 解决方案 |
|---|---|
| 余额不足 | 先执行 `deposit --amount 5`，再执行 `transfer-fund --provider <ADDR> --amount 2` |
| 尚未确认提供商 | `inference acknowledge-provider --provider <ADDR>` |
| 提供商繁忙（微调） | 等待后重试，或选择其他提供商 |
| Web UI 端口冲突 | `ui start-web --port 3091` |

## 资源

- [生产环境示例](references/examples/README.md) — 流式聊天、图像生成、转录
- [GitHub 入门套件](https://github.com/0gfoundation/0g-compute-ts-starter-kit)
- [软件包版本发布](https://github.com/0gfoundation/0g-serving-broker/releases)
- [Discord 支持](https://discord.gg/0glabs)

> 注意：涵盖所有 0G 服务（Compute、Storage、Chain）的统一 Skill 位于 [0g-agent-skills](https://github.com/0gfoundation/0g-agent-skills)。