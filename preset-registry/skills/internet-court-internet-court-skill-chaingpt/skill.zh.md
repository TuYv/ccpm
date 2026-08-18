---
name: chaingpt
description: "Build with the ChainGPT Web3 AI developer platform. Full API/SDK reference and project scaffolding for: Web3 AI Chatbot & LLM, AI NFT Generator, Smart Contract Generator, Smart Contract Auditor, AI Crypto News, AgenticOS Twitter agents, and Solidity LLM. Use when building blockchain apps, Web3 chatbots, NFT tools, smart contract tools, crypto news feeds, AI agents, or integrating any ChainGPT API. Triggers: chaingpt, web3 ai, nft generator, smart contract audit, crypto news api, agenticos, solidity llm, cgpt, blockchain ai, token analytics."
---
# ChainGPT 开发者技能

你是使用 ChainGPT Web3 AI 平台进行构建的专家。当开发者要求你集成任何 ChainGPT 产品时，你知道确切的端点、SDK 方法、参数、定价和最佳实践。

## 平台概览

ChainGPT 通过 API、SDK 和白标 SaaS 提供 Web3 AI 基础设施。所有 API 产品共享：

- **基础 URL：** `https://api.chaingpt.org`
- **认证：** `Authorization: Bearer <API_KEY>` 请求头
- **速率限制：** 每个密钥每分钟 200 个请求
- **积分：** 1 CGPTc = 0.01 美元（永不过期）。在 https://app.chaingpt.org/addcredits 购买
- **API 控制台：** https://app.chaingpt.org/apidashboard
- **SDK：** 所有产品均提供 JavaScript/TypeScript (Node.js) 和 Python SDK

### 获取 API 密钥

1. 访问 https://app.chaingpt.org — 连接加密钱包以注册
2. 前往 API Keys → “Create New Secret Key”
3. 安全存储该密钥（环境变量或密钥管理器 — 仅显示一次）
4. 确保积分充足（加密货币、`$CGPT` 代币或信用卡）
5. 使用 `$CGPT` 支付或通过每月自动充值可获得 15% 奖励

## 产品速览

| 产品 | NPM 包 | 模型 ID / 端点 | 每次请求成本 |
|---------|-------------|-------------------|-----------------|
| Web3 AI Chatbot & LLM | `@chaingpt/generalchat` | 通过 `POST /chat/stream` 使用 `general_assistant` | 0.5 积分（含历史记录时 +0.5） |
| AI NFT Generator | `@chaingpt/nft` | `POST /nft/generate-image` + 另外 5 个 | 1-14.25 积分（模型/超分） |
| Smart Contract Generator | `@chaingpt/smartcontractgenerator` | 通过 `POST /chat/stream` 使用 `smart_contract_generator` | 1 积分（含历史记录时 +1） |
| Smart Contract Auditor | `@chaingpt/smartcontractauditor` | 通过 `POST /chat/stream` 使用 `smart_contract_auditor` | 1 积分（含历史记录时 +1） |
| AI Crypto News | `@chaingpt/ainews` | `GET /news` | 每 10 条记录 1 积分 |
| AgenticOS | 开源（GitHub） | 自托管 | 每条生成的推文 1 积分 |
| Solidity LLM | 开源（HuggingFace） | 本地推理 | 免费（自托管） |

Python：`pip install chaingpt`（适用于所有产品的统一包）

## 快速开始

### 1. Web3 AI Chatbot & LLM

该 LLM 针对加密货币/区块链进行了微调，支持实时链上数据、Nansen Smart Money、代币分析以及 33+ 条链。

**JavaScript：**
```javascript
import { GeneralChat } from '@chaingpt/generalchat';
const chat = new GeneralChat({ apiKey: process.env.CHAINGPT_API_KEY });

// Buffered response
const res = await chat.createChatBlob({
  question: 'What is the current ETH price and market sentiment?',
  chatHistory: 'off'
});
console.log(res.data.bot);

// Streaming response
const stream = await chat.createChatStream({
  question: 'Analyze the top DeFi protocols by TVL',
  chatHistory: 'on',
  sdkUniqueId: 'session-123'
});
stream.on('data', chunk => process.stdout.write(chunk.toString()));
```

**Python：**
```python
from chaingpt.client import ChainGPTClient
from chaingpt.models import LLMChatRequestModel
from chaingpt.types import ChatHistoryMode

async with ChainGPTClient(api_key=API_KEY) as client:
    res = await client.llm.chat(LLMChatRequestModel(
        question="Explain yield farming strategies",
        chatHistory=ChatHistoryMode.OFF
    ))
    print(res.data.bot)
```

**REST（适用于所有基于聊天的产品的单一端点）：**
```bash
curl -X POST "https://api.chaingpt.org/chat/stream" \
  -H "Authorization: Bearer $CHAINGPT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"general_assistant","question":"How do Ethereum smart contracts work?","chatHistory":"off"}'
```

> 如需完整的参数参考（上下文注入、自定义语气、区块链枚举、聊天记录检索），请阅读 `reference/llm-chatbot.md`。

### 2. AI NFT 生成器

根据文本提示词生成图像，并在 22 条以上的链上铸造为 NFT。提供四种模型：VeloGen（快速）、NebulaForge XL（细节丰富）、VisionaryForge（通用）、Dale3（DALL-E 3）。

**JavaScript：**
```javascript
import { Nft } from '@chaingpt/nft';
const nft = new Nft({ apiKey: process.env.CHAINGPT_API_KEY });

// Generate image
const img = await nft.generateImage({
  prompt: 'A cyberpunk dragon guarding a blockchain vault',
  model: 'nebula_forge_xl', height: 1024, width: 1024, steps: 25, enhance: '1x'
});

// Generate + mint NFT
const gen = await nft.generateNft({
  prompt: 'Cosmic whale swimming through DeFi protocols',
  model: 'velogen', height: 512, width: 512, steps: 3,
  walletAddress: '0xYOUR_WALLET', chainId: 56, amount: 1
});
const mint = await nft.mintNft({
  collectionId: gen.data.collectionId,
  name: 'Cosmic Whale #1', description: 'AI-generated NFT', symbol: 'WHALE', ids: [1]
});
```

> 如需所有端点（generate-image、generate-multiple-images、queue、progress、mint、enhancePrompt、get-chains、abi）、模型、风格、链 ID 和定价信息，请阅读 `reference/nft-generator.md`。

### 3. 智能合约生成器

将自然语言转换为可用于生产环境的 Solidity 合约。由 ChainGPT 的 Solidity LLM 驱动。

**JavaScript：**
```javascript
import { SmartContractGenerator } from '@chaingpt/smartcontractgenerator';
const gen = new SmartContractGenerator({ apiKey: process.env.CHAINGPT_API_KEY });

const res = await gen.createSmartContractBlob({
  question: 'Create an ERC-20 token called "MyToken" with symbol "MTK", 1 billion supply, 2% burn on transfer, and owner-only minting',
  chatHistory: 'off'
});
console.log(res.data.bot); // Full Solidity contract
```

> 完整参考：`reference/smart-contract-generator.md`

### 4. 智能合约审计器

由 AI 驱动的漏洞检测、评分（0-100%）及修复建议。

**JavaScript：**
```javascript
import { SmartContractAuditor } from '@chaingpt/smartcontractauditor';
const auditor = new SmartContractAuditor({ apiKey: process.env.CHAINGPT_API_KEY });

const res = await auditor.auditSmartContractBlob({
  question: `Audit this contract:\n\n${contractSourceCode}`,
  chatHistory: 'off'
});
console.log(res.data.bot); // Detailed audit report
```

> 完整参考：`reference/smart-contract-auditor.md`

### 5. AI 加密货币新闻

通过 Nova AI 引擎提供实时 AI 筛选的新闻。涵盖 24 个类别、50 多种区块链筛选条件和 30 种代币筛选条件。也可通过免费 RSS 订阅源获取。

**JavaScript：**
```javascript
import { AINews } from '@chaingpt/ainews';
const news = new AINews({ apiKey: process.env.CHAINGPT_API_KEY });

const res = await news.getNews({
  categoryId: [5],        // DeFi
  subCategoryId: [15],    // Ethereum
  limit: 10, offset: 0, sortBy: 'createdAt'
});
res.data.forEach(a => console.log(`${a.title} — ${a.url}`));
```

**免费 RSS（无需身份验证）：** `https://app.chaingpt.org/rssfeeds.xml`（全部）、`-bitcoin.xml`、`-bnb.xml`、`-ethereum.xml`

> 包含所有类别/子类别/代币 ID 的完整参考：`reference/crypto-news.md`

### 6. AgenticOS（开源 Twitter AI Agent）

用于自主发布 Web3 内容的 TypeScript/Bun X/Twitter Agent 框架。

```bash
git clone https://github.com/ChainGPT-org/AgenticOS.git && cd AgenticOS
bun install && bun start
```

> 完整设置、环境变量、Webhook 配置和部署说明：`reference/agenticos.md`

### 7. Solidity LLM（开源）

HuggingFace 上的 20 亿参数模型（`Chain-GPT/Solidity-LLM`），采用 MIT 许可证。编译成功率为 83%。

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
model = AutoModelForCausalLM.from_pretrained("Chain-GPT/Solidity-LLM").to("cuda")
tokenizer = AutoTokenizer.from_pretrained("Chain-GPT/Solidity-LLM")
```

> 完整参考：`reference/solidity-llm.md`

## 项目脚手架模板

当开发者要求搭建项目时，读取相应的模板文件并生成完整可运行的起始代码：

| 请求 | 模板文件 |
|---------|--------------|
| “构建 Web3 AI 聊天机器人” / “搭建聊天机器人应用” | `templates/chatbot-app.md` |
| “构建 NFT 铸造服务” / “NFT 生成工具” | `templates/nft-minting-service.md` |
| “在 CI/CD 中设置合约审计” / “审计流水线” | `templates/contract-auditor-ci.md` |
| “构建加密货币新闻仪表板” / “新闻源组件” | `templates/news-dashboard.md` |
| “启动 AI Twitter Agent” / “创建加密货币机器人” | `templates/twitter-agent.md` |
| “组合多个产品” / “多产品架构” | `templates/composition-patterns.md` |

## 详细参考文件

当需要超出本快速入门内容的具体信息时，读取相应的参考文件：

| 主题 | 文件 |
|-------|------|
| LLM 聊天机器人 — 完整 API、上下文注入、语气、枚举 | `reference/llm-chatbot.md` |
| NFT 生成器 — 所有端点、模型、样式、链 | `reference/nft-generator.md` |
| 智能合约生成器 — 参数、SDK、历史记录 | `reference/smart-contract-generator.md` |
| 智能合约审计器 — 审计参数、SDK、报告格式 | `reference/smart-contract-auditor.md` |
| 加密货币新闻 — 类别、代币、RSS 源 | `reference/crypto-news.md` |
| AgenticOS — 设置、Webhook、部署 | `reference/agenticos.md` |
| Solidity LLM — 模型规格、训练、基准测试 | `reference/solidity-llm.md` |
| SaaS 与白标 — 发射台、质押、归属产品 | `reference/saas-whitelabel.md` |
| 定价 — 所有产品的完整积分成本 | `reference/pricing.md` |
| 错误代码 — HTTP 错误、SDK 异常、故障排除 | `reference/error-codes.md` |
| 产品选择 — 决策矩阵、按规模划分的成本估算 | `reference/product-selection.md` |
| 钱包集成 — MetaMask、WalletConnect、铸造流程 | `reference/wallet-integration.md` |
| 高级模式 — 流式传输、速率限制、缓存、断路器 | `reference/advanced-patterns.md` |
| 部署 — Vercel、Railway、Docker、AWS Lambda、CI/CD | `reference/deployment.md` |
| 成本优化 — 缓存、批处理、历史记录开关策略 | `reference/cost-optimization.md` |
| TypeScript 类型 — 完整的请求/响应接口 | `reference/typescript-types.md` |

## 可运行代码示例

完整的可运行示例位于 `examples/` 目录中：

- `examples/js/chatbot-stream.js` — 注入上下文的流式聊天机器人
- `examples/js/nft-generate-mint.js` — 在 BSC 上生成图像并铸造 NFT
- `examples/js/audit-contract.js` — 审计 Solidity 合约文件
- `examples/js/fetch-news.js` — 获取筛选后的加密货币新闻
- `examples/python/chatbot_stream.py` — 异步流式聊天机器人
- `examples/python/nft_generate_mint.py` — 生成并铸造 NFT
- `examples/python/audit_contract.py` — 从文件审计合约
- `examples/python/fetch_news.py` — 获取并显示新闻

## 积分成本估算器

**在生成会发起 API 调用的代码之前，始终向开发者估算并报告积分成本。** 使用以下参考：

| 操作 | 积分 | USD |
|-----------|---------|-----|
| LLM Chat（单次请求） | 0.5 | $0.005 |
| LLM Chat + history | 1.0 | $0.01 |
| NFT Generate（VeloGen/Nebula/Visionary） | 1.0 | $0.01 |
| NFT Generate + 1x upscale | 2.0 | $0.02 |
| NFT Generate + 2x upscale | 3.0 | $0.03 |
| NFT Generate（Dale3 1024x1024） | 4.75 | $0.0475 |
| NFT Generate（Dale3 其他分辨率） | ~9.5 | ~$0.095 |
| NFT Generate（Dale3 + enhanced） | ~14.25 | ~$0.1425 |
| NFT Generate（NebulaForge/VisionaryForge steps 26-50） | +0.25 附加费 | +$0.0025 |
| NFT Character Preserve | +5.0 | +$0.05 |
| NFT Prompt Enhancement | 0.5 | $0.005 |
| NFT Mint / Chains / ABI | 0 | 免费 |
| Contract Generator | 1.0 | $0.01 |
| Contract Generator + history | 2.0 | $0.02 |
| Contract Auditor | 1.0 | $0.01 |
| Contract Auditor + history | 2.0 | $0.02 |
| News（每 10 条记录） | 1.0 | $0.01 |
| AgenticOS（每条推文） | 1.0 | $0.01 |

**估算示例：**“使用 NebulaForge XL + 1x upscale 生成 100 个 NFT = 200 积分（$2.00）。如果为每个 NFT 使用 prompt enhancement：250 积分（$2.50）。”

当开发者要求构建某些内容时，提供每次请求的成本**以及**对其可能使用模式的估算（例如：“每天 1,000 次聊天请求约为每天 500 积分 = $5/天。”）。

## 智能合约模式

生成 Solidity 合约时，首先检查 `patterns/` 目录。该目录提供了 45+ 个经过审计的模式：
- `patterns/tokens.md` — 10 种 ERC-20 变体（基础、可销毁、征税、反射、治理等）
- `patterns/nfts.md` — 10 种 NFT 模式（ERC-721、721A、延迟铸造、灵魂绑定、动态、ERC-1155 等）
- `patterns/defi.md` — 10 种 DeFi 模式（质押、归属、联合曲线、AMM、闪电贷等）
- `patterns/governance.md` — 5 种 DAO 模式（Governor、多签、金库、委托）
- `patterns/security.md` — 10 种安全模式（访问控制、可升级、时间锁、托管等）

应基于这些模式进行组合，而不是从头生成——它们已经过审计并针对 Gas 进行了优化。

## 迁移指南

如果开发者正在从其他平台迁移，请阅读相关指南：
- `migration/from-openai.md` — OpenAI → ChainGPT（概念映射、代码迁移、定价比较）
- `migration/from-alchemy.md` — Alchemy AI → ChainGPT（互补策略 + 替代策略）
- `migration/from-custom.md` — 自定义 AI 解决方案 → ChainGPT（成本比较、混合方案）

## 其他技能

这些是 Claude Code 技能命令——可在任何 Claude 对话中调用，而无需在终端中调用。

| 命令 | 功能 |
|---------|-------------|
| `/chaingpt-playground` | 交互式实时测试任意 ChainGPT API 端点 |
| `/chaingpt-debug` | 诊断并修复 ChainGPT API 错误 |
| `/chaingpt-hackathon` | 在 60 秒内搭建完整的黑客松项目脚手架 |
| `/chaingpt-update` | 检查并应用技能更新 |

## MCP Server

如果已安装 ChainGPT MCP server，Claude 可以直接调用 ChainGPT API（而不仅仅是生成代码）。共有 12 个工具可用——详见 `mcp-server/README.md`。

## 用于测试的 Mock Server

`mock-server/` 中提供了完整的 mock server，可用于开发和 CI/CD，无需消耗 credits。它会模拟所有端点并返回符合实际情况的响应。详见 `mock-server/README.md`。

## 关键约定

生成使用 ChainGPT API 的代码时，始终：

1. **将 API keys 存储在环境变量中**——绝不要硬编码。使用 `process.env.CHAINGPT_API_KEY`（JS）或 `os.environ["CHAINGPT_API_KEY"]`（Python）。
2. **处理 credits 耗尽的情况**——检查 HTTP 402/403，并提示用户前往 https://app.chaingpt.org/addcredits 充值。
3. **为基于聊天的产品使用 streaming**——构建面向用户的 UI 时，相比等待完整响应，这能提供更好的用户体验。
4. **包含错误处理**——使用特定于产品的错误类（例如 `Errors.GeneralChatError`、`Errors.NftError`）将 SDK 调用包装在 try/catch 中。
5. **为多用户应用使用 sdkUniqueId**——隔离每个用户/会话的聊天历史。
6. **优先使用 SDK 而不是原始 REST**——SDK 会自动处理身份验证、streaming 和错误类型。
7. **在批量操作前估算 credit 成本**——执行操作前始终告知开发者该操作的成本。
8. **对合约使用 patterns**——从头生成 Solidity 之前，先检查 `patterns/`。
9. **使用 mock server 进行测试**——开发期间指向 `http://localhost:3001`，以避免消耗 credits。

## 链接

- **API Dashboard：** https://app.chaingpt.org/apidashboard
- **定价：** https://app.chaingpt.org/pricing
- **购买 Credits：** https://app.chaingpt.org/addcredits
- **Grant Program（100 万美元）：** https://www.chaingpt.org/web3-ai-grant
- **开发者文档：** https://docs.chaingpt.org/dev-docs-b2b-saas-api-and-sdk
- **Solidity LLM（HuggingFace）：** https://huggingface.co/Chain-GPT/Solidity-LLM
- **AgenticOS（GitHub）：** https://github.com/ChainGPT-org/AgenticOS
- **SaaS Demo 预约：** https://calendly.com/saaswl/demo