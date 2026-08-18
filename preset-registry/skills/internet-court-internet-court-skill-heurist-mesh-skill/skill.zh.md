---
name: heurist-mesh-skill
description: Access real-time crypto token data, DeFi analytics, wallet intelligence, project research, and blockchain insights through Heurist Mesh agents. Use when the user asks about token trends, DeFi protocols, wallet holdings, project due diligence, Twitter/X crypto sentiment, or deeper market analysis.
compatibility: Requires network access and curl or equivalent HTTP client.
metadata:
  author: heurist-network
  docs: https://docs.heurist.ai
---
# Heurist Mesh

Heurist Mesh 是一个面向加密货币和区块链数据的模块化 AI 智能体工具开放网络，可通过统一的 REST API 访问。

## 使用时机

当用户请求需要实时数据检索支持的加密货币或 Web3 情报时，使用此 skill，包括：

- 代币发现、热门交易对和市场快照
- DeFi 协议指标、链级活动以及收入/TVL 对比
- 钱包持仓、地址标签或 NFT 投资组合查询
- Twitter/X 信号检查、项目尽职调查和生态研究
- 应升级到 `AskHeuristAgent` 处理的更深层市场问题

## 推荐的智能体和工具

**TrendingTokenAgent** — 热门代币和市场摘要
- `get_trending_tokens` — 获取在 CEX 和 DEX 上讨论和交易最热门的代币
- `get_market_summary` — 获取近期全市场新闻，包括宏观动态和重大更新

**TokenResolverAgent** — 查找代币并获取详细资料
- `token_search` — 按地址、股票代码/符号或名称查找代币（最多 5 个候选结果）
- `token_profile` — 获取详细的代币资料，包括交易对、资金费率和指标

**DefiLlamaAgent** — DeFi 协议和链指标
- `get_protocol_metrics` — 获取协议的 TVL、费用、交易量、收入、所属链及增长趋势
- `get_chain_metrics` — 获取区块链的 TVL、费用、顶级协议及增长趋势

**TwitterIntelligenceAgent** — Twitter/X 数据
- `user_timeline` — 获取用户最近的帖子和公告
- `tweet_detail` — 获取包含线程上下文和回复的推文
- `twitter_search` — 搜索任意主题的帖子和有影响力的提及

**ExaSearchDigestAgent** — 带摘要功能的网页搜索
- `exa_web_search` — 使用 LLM 摘要以及时间和域名过滤器搜索网页
- `exa_scrape_url` — 抓取 URL 并进行摘要或提取信息

**ChainbaseAddressLabelAgent** — EVM 地址标签
- `get_address_labels` — 获取 ETH/Base 地址的标签（身份、合约名称、钱包行为、ENS）

**ZerionWalletAnalysisAgent** — EVM 钱包持仓
- `fetch_wallet_tokens` — 获取代币持仓及其 USD 价值和 24 小时价格变化
- `fetch_wallet_nfts` — 获取钱包持有的 NFT 收藏

**ProjectKnowledgeAgent** — 加密货币项目数据库
- `get_project` — 按名称、符号或 X 账号查询项目（团队、投资者、事件）
- `semantic_search_projects` — 在 10k+ 个项目中进行自然语言搜索（按投资者、标签、融资年份、交易所筛选）

**CaesarResearchAgent** — 学术研究
- `caesar_research` — 提交研究查询以进行深入分析
- `get_research_result` — 按 ID 获取研究结果

**AskHeuristAgent** — 加密货币问答和深度分析（重要：深度加密货币主题推荐使用）
- `ask_heurist` — 提交加密货币问题（普通模式或深度分析模式）
- `check_job_status` — 检查待处理分析任务的状态

## 设置（调用 API 前必须完成）

至少配置一种支付路径。在确认设置完成之前，不要调用 Mesh API。

### 步骤 1：选择一种支付路径

- **API 密钥（推荐）：** 在 `.env` 中设置 `HEURIST_API_KEY`。设置和免费额度流程：[references/heurist-api-key.md](references/heurist-api-key.md)
- **Base 上的 x402：** 在 `.env` 中设置 `WALLET_PRIVATE_KEY`。签名支付流程：[references/x402-payment.md](references/x402-payment.md)
- **Inflow：** 在 `.env` 中设置 `INFLOW_USER_ID` 和 `INFLOW_PRIVATE_KEY`。买方设置和审批流程：[references/inflow-payment.md](references/inflow-payment.md)

### 步骤 2：验证 `.env` 中的设置

- API 密钥路径：已设置 `HEURIST_API_KEY` 且不为空
- x402 路径：已设置 `WALLET_PRIVATE_KEY`，以 `0x` 开头，且长度为 66 个字符
- Inflow 路径：已设置 `INFLOW_USER_ID` 和 `INFLOW_PRIVATE_KEY` 且不为空

**如果没有配置任何一种支付方式，请停止并要求用户设置支付方式。没有有效凭证时不要进行 API 调用。**

### 步骤 3：在调用工具前获取 schema

在调用任何工具前，使用 `mesh_schema` 确认参数名称、必填字段和价格。按 agent 在会话期间缓存结果 — schema 在不同调用之间不会变化：

```
GET https://mesh.heurist.xyz/mesh_schema?agent_id=TokenResolverAgent&agent_id=TrendingTokenAgent
```

默认价格以 credits 表示（`1 credit = $0.01`）。对于 x402 或 Inflow，请添加 `&pricing=usd` 以获取以 USD 计价的价格。

然后在请求中使用已配置的凭证：

```bash
# With API key
curl -X POST https://mesh.heurist.xyz/mesh_request \
  -H "Authorization: Bearer $HEURIST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"agent_id": "TokenResolverAgent", "input": {"tool": "token_search", "tool_arguments": {"query": "ETH"}}}'

# With x402 — sign with cast (Foundry), no account or SDK needed
# See references/x402-payment.md for the full cast-based flow and helper script
```

## 示例

### 示例 1：热门代币

用户询问：“目前哪些代币正在走热？”

1. 获取 schema：`GET /mesh_schema?agent_id=TrendingTokenAgent`
2. 调用工具：`TrendingTokenAgent.get_trending_tokens`
3. 返回热门代币及关键指标，然后总结值得注意的变动

### 示例 2：深度市场问题

用户询问：“请深入分析当前的市场风险和机会。”

1. 使用深度模式，根据用户的问题运行 `AskHeuristAgent.ask_heurist`
2. 使用 `AskHeuristAgent.check_job_status` 轮询，直到完成

## 错误处理

- `401`/`403`：视为凭证问题；要求用户重新检查 `.env` 中的值，不要使用同一个密钥继续调用
- `402`：需要支付；遵循所选的支付路径（`HEURIST_API_KEY`、x402 流程或 Inflow 审批）
- `status: "payment_pending"`（Inflow）：询问审批状态，然后使用退避策略重试
- `429` 或 `5xx`：使用指数退避重试，并在向用户展示失败详情前限制重试次数
- `token_search` 结果不明确：在调用成本高昂的下游工具前，请求用户消除歧义

## 发现更多 Agents

有关完整的 agent 发现流程和示例，请参阅 [references/discover-agents.md](references/discover-agents.md)。

- 所有代理：`https://mesh.heurist.ai/metadata.json`
- 支持 x402 的代理：`https://mesh.heurist.xyz/x402/agents`