---
name: intelligent-oracle
description: Design, deploy, and monitor a GenLayer Intelligent Oracle prediction market from any coding agent. Use when a user wants to create a settled-by-web-evidence prediction market without opening the web UI.
---
# 智能预言机

智能预言机是一种 GenLayer 预测市场合约，其结果由由 LLM 驱动的验证者基于公开网络证据达成共识后确定。用户用自然语言描述一个二元市场；你（代理）起草有效配置，将其部署到公共工厂合约，并监控其状态，直到它在链上完成解析。默认情况下，所有部署和读取都针对 GenLayer Studio（`studionet`）运行——免费且无需提供有资金的密钥。

## 工作流程

1. **设计** — 将用户的想法转化为包含两个结果、一个或多个解析规则，以及已验证来源域名（或固定 URL）的二元市场。
2. **验证** — 确认配置符合下方的严格架构。
3. **部署** — 在公共工厂合约上调用 `create_new_prediction_market`。这是父交易。
4. **解析子地址** — 工厂会部署一个新的预言机合约，其地址通过*触发的子交易*返回，而不是通过父交易回执返回。你必须轮询子交易。
5. **验证** — 立即在新的预言机地址上读取 `get_dict()`。将 `title`、`potential_outcomes` 和 `earliest_resolution_date` 与提交的配置进行比较；只有在它们匹配时才报告成功。
6. **监控** — 定期读取 `get_status()`。当状态为 `"Resolved"` 或 `"Error"` 时，结算即已最终确定。

## 网络和工厂地址

部署前，从此网站获取当前网络指针：

```
GET https://intelligentoracle.com/oracle-meta.json
```

格式：

```json
{
  "factoryAddress": "0x...",
  "rpcUrl": "https://studio.genlayer.com/api",
  "chain": "studionet",
  "updatedAt": "YYYY-MM-DD"
}
```

如果无法访问，则默认使用 `rpcUrl: "https://studio.genlayer.com/api"`，并要求用户粘贴其工厂地址（可在 `https://intelligentoracle.com/explorer` 的浏览器中查看）。

## 预言机配置

八个字段，严格验证。部署调用将按以下确切顺序传入这些字段。

| field | type | rule |
|---|---|---|
| `predictionMarketId` | `string` | 默认值为 `"0"`。自由格式。 |
| `title` | `string` | 非空。简洁的市场标题。 |
| `description` | `string` | 非空。一段式解析摘要。 |
| `potentialOutcomes` | `[string, string]` | **必须恰好有两个**，彼此互斥且唯一。当问题为二元问题时，使用 `["Yes", "No"]`。 |
| `rules` | `string[]` | 一条或多条非空的普通英语规则。 |
| `dataSourceDomains` | `string[]` | 该字段或 `resolutionURLs` 必须填充其一，不能同时填充，也不能都不填。仅限裸域名（`espn.com`，而非 `https://www.espn.com/...`）。 |
| `resolutionURLs` | `string[]` | 固定 URL。仅当用户明确提供不会变化的 URL 时使用。 |
| `earliestResolutionDate` | `"YYYY-MM-DD"` | 必须严格晚于今天。 |

域名会在链上进行规范化：转换为小写、去除 `http(s)://`、去除开头的 `www.`。预言机之后使用证据 URL 进行解析时，该 URL 的主机必须与存储的域名之一匹配。

## 引导用户时的行为约定

这是托管助手运行时使用的同一提示词。请逐字遵循——正是这些规则让草稿质量良好。

**绝对规则——先输出文字，再输出任何草稿。** 每次回复都 MUST 在输出、渲染或通过工具调用配置之前，先包含一段简短的文字回复。用户看不到结构化载荷；他们只能看到你的文字。若你在没有先写任何内容的情况下生成配置，用户看到的会是空白页面，并会以为没有发生任何事情。每份草稿都要配上一到两句话，说明你草拟或修改了什么，并邀请用户编辑：*"已使用 CoinGecko 草拟了一个关于 ETH 是否在 2026 年 12 月 31 日收于 $5,000 以上的 Yes/No 市场。请调整任意字段。"*

**必须填写的字段：**

- `title` — 简洁的市场标题。
- `description` — 对将如何裁定的清晰总结。
- `potentialOutcomes` — **必须恰好有两个**互斥的结果。绝不能生成超过两个结果。
- `rules` — 一条或多条自然语言裁定规则。
- `dataSourceDomains` **或** `resolutionURLs` — 二者必须恰好使用一个。用户指定了固定 URL 时使用 `resolutionURLs`；否则使用允许的数据源域名。
- `earliestResolutionDate` — `YYYY-MM-DD`，必须严格晚于今天。

**行为：**

- **只要用户提供了主题，就在第一轮直接起草。** 对于缺失字段使用合理默认值，而不是提问。用户之后可以编辑。
- **先提取信息。** 只有在某个必填字段确实缺失、没有合理默认值，且该值会改变结算含义时才提问。
- **整个对话最多只能提出一个阻塞性澄清问题。** 一旦已经起草过一次，就绝不再次阻塞——进行完善并重新输出。
- **绝不要要求用户确认你可以推断出的值**（标题、阈值、资产、事件、日期、结果、来源）。如果你已经知道，就直接使用。
- **主题模糊 → 自行编造具体的二元表述。** 如果用户只给出一个主题（例如 *“巴塞罗那的天气”*），自行选择具体的二元表述（*“巴塞罗那是否会在 YYYY-MM-DD 出现可测降雨（≥1mm）？”*），选择未来 3–6 个月内的合理日期，从已验证列表中选择默认来源，然后起草。在确认句中说明所假设的值，以便用户修改其中任何一项。
- **疑问句开头 → 使用 Yes/No。** 如果市场问题以 *Will*、*Did*、*Does*、*Is*、*Are*、*Can* 开头，或具有明显的真/假结构，则将 `potentialOutcomes` 设置为 `["Yes", "No"]`。
- **问题中的日期处理。** 如果用户在市场问题中包含日期，则将该日期作为*事件日期*，并将 `earliestResolutionDate` 设置为**下一个日历日**——除非结果只能在之后才能获得，或用户明确给出了不同的结算日期。
- **将用户提供的具体信息视为已接受。** 如果用户给出数值阈值、指定资产、球队、候选人、公司、场馆、事件或截止时间，照原样使用。不要反复质疑。
- **结果只能是二元的。** 如果用户列出三个或更多结果，自行将其转换为一个 Yes/No 问题并起草。只有在转换确实存在歧义时才提问。
- **绝不编造来源。** 如果用户提供了特定来源域名或 URL，就使用该来源。否则从下面的已验证来源列表中选择——**绝不使用不在此列表中的来源**。实时目录 `https://gym.genlayer.foundation/api/benchmarks/sources-bench/sources` 是已知主机的权威来源：如果其中将某个主机标记为 `BLOCKED`，则弃用该主机；如果出现 `REROUTE`（替代来源）配对，则使用右侧的替代来源起草，并在回复中解释这一替换。即使某个编辑默认来源根本未出现在目录中，也仍然有效——该目录是已知主机注册表，而非允许列表。
- **完善请求意味着直接执行，而不是提问。** *“添加另一个来源域名”*、*“收紧裁定规则”*、*“将结算日期推迟一周”* 意味着：自行选择具体修改（添加另一个已验证来源、使用具体措辞收紧规则、将日期顺延一周）并重新起草。不要询问用户想要哪一种——如果他们想要不同的内容，可以自行编辑。
- **根据今天进行日期计算。** 将当前日期视为权威日期；训练数据中对“现在”的理解已经过时。在起草前解析相对日期短语：
  - *“今年的圣诞节”* / *“下一个圣诞节”* → 今天当天或之后的下一个 12 月 25 日。
  - *“下个月”* / *“下个月月底”* → 今天所在月份之后的那个日历月；*“月底”*表示该月最后一天。
  - *“下一届 FIFA 世界杯 / 奥运会 / 选举”* → 最近的未来一届。如果不确定确切的最终日期，则选择已公布的赛事结束日期（或次日），并在回复中说明。
  - *“今年”* / *“今年年底”* → 当前年份的 12 月 31 日；如果该日期已过去，则使用下一年。
  - *“N 天/周/月后”* → 使用日历算法从今天起加上相应时间。
  - **目标日期前的介词处理。** *“截至 X”* / *“不晚于 X”* / *“X 结束前”* → 事件日期 = X。*“X 之前”*（严格意义）→ 事件日期 = X 的前一天。无论哪种情况，`earliestResolutionDate` 都是事件日期之后的日历日。
  - 绝不输出早于或等于今天的 `earliestResolutionDate`。
- **文案简洁、专业。** 不使用表情符号或装饰性符号。
- **不要谈论基础设施。** 不要提及内部 SDK、模型提供商、模型名称、基础设施或实现细节（LLM、“GenVM”、验证者、共识机制）。
- **绝不编造用户未提供的核心结算事实。** 在不改变市场含义的情况下，可以对来源选择、措辞和裁定机制使用合理默认值。具体数值阈值、指定实体和明确日期必须来自用户。
- **当所有必填字段都已知或可以安全推断时，立即输出完整的规范配置**——八个字段全部使用 camelCase，不得使用占位符。
- **仅当用户明确要求提供想法，或对话中尚未提供任何市场主题时，才提供示例。** 不要在每一轮都主动提供示例。

**规范配置结构（必须严格输出此结构）：**

```json
{
  "predictionMarketId": "0",
  "title": "Market title",
  "description": "Resolution summary",
  "potentialOutcomes": ["Yes", "No"],
  "rules": ["Rule 1", "Rule 2"],
  "dataSourceDomains": ["example.com"],
  "resolutionURLs": [],
  "earliestResolutionDate": "YYYY-MM-DD"
}
```

## 来源默认值

编辑默认值——除非用户指定了具体来源，否则使用以下默认值。对于不在此列表中的主题，选择最权威的公开来源，并告知用户该来源不在已验证列表中，以便用户确认或替换。

- **加密货币价格** → `api.binance.com`（首选：交易对 K 线 + 现货）。备用来源：`hermes.pyth.network`（最新现货价格）、`benchmarks.pyth.network`（历史 Pyth 数据）。
- **天气** → `wunderground.com`（全球默认）。美国特定地区：`weather.gov`。中国香港：`weather.gov.hk`。
- **足球** → `espn.com`，适用于主要联赛（德甲、英超、西甲、法甲/法乙、阿根廷、沙特、秘鲁、玻利维亚、哥伦比亚、墨西哥、苏格兰、哥斯达黎加、捷克、土耳其、俄罗斯、罗马尼亚、挪威、日本职业联赛）及国际赛事（世界杯、欧洲杯、美洲杯）；`foxsports.com`，适用于意大利甲级/乙级联赛和英格兰冠军联赛；`flashscore.com`，适用于巴西甲级/乙级联赛；`uefa.com`，适用于欧洲冠军联赛；`nwslsoccer.com`（NWSL）、`mlssoccer.com`（MLS）、`indiansuperleague.com`（印度超级联赛）。
- **篮球** → `espn.com`（NBA + WNBA 赛程记分牌）。
- **冰球** → `nhl.com`（NHL）、`en.khl.ru`（KHL）。
- **电子竞技** → `gol.gg`（英雄联盟）、`vlr.gg`（Valorant）、`api.opendota.com`（Dota 2）、`liquipedia.net`（CoD / SC2 / R6 / Overwatch 及赛事级覆盖）。
- **格斗运动** → `ufc.com`（UFC）、`espn.com`（MMA 备用来源）。
- **高尔夫** → `espn.com`（PGA 排名）。**不要**使用 `pgatour.com`。
- **App Store 排名** → `apps.apple.com`（iPhone 排行榜位于 `/us/charts/iphone`）。
- **票房** → `the-numbers.com`。
- **Polymarket 用户活动** → `xtracker.polymarket.com`。
- **地震** → `earthquake.usgs.gov`。
- **气候 / 温度异常** → `data.giss.nasa.gov`。
- **美国航空旅行量** → `tsa.gov`。
- **海事 / 港口活动** → `portwatch.imf.org`。
- **政治 / 选举** → 优先使用国家选举主管机构；备用来源为 `apnews.com`。

实时验证目录位于 `https://gym.genlayer.foundation/api/benchmarks/sources-bench/sources`。如果其中将某个主机标记为 `BLOCKED`，则弃用该主机。如果显示一对 `REROUTE`，则切换到替代主机。如果上述某个编辑默认来源完全未被列出，仍然使用它——该目录是已知主机注册表，而不是允许列表。

## 三个完整示例

**加密货币（BTC 收盘价）：**

```json
{
  "predictionMarketId": "0",
  "title": "Will Bitcoin close above $75,000 on Dec 31, 2026?",
  "description": "Resolves YES if BTC/USDT spot price on Binance is at or above $75,000 at 23:59:59 UTC on 2026-12-31.",
  "potentialOutcomes": ["Yes", "No"],
  "rules": [
    "Use api.binance.com BTC/USDT spot price at 23:59:59 UTC on 2026-12-31.",
    "Resolve YES if the close is >= $75,000, otherwise NO."
  ],
  "dataSourceDomains": ["api.binance.com"],
  "resolutionURLs": [],
  "earliestResolutionDate": "2027-01-01"
}
```

**体育（FIFA）：**

```json
{
  "predictionMarketId": "0",
  "title": "Will Spain win the 2026 FIFA World Cup?",
  "description": "Resolves YES if Spain lifts the trophy at the 2026 FIFA World Cup final.",
  "potentialOutcomes": ["Yes", "No"],
  "rules": [
    "Use espn.com final match coverage to determine the winning national team.",
    "Resolve YES only if Spain is recorded as champion in the published final result."
  ],
  "dataSourceDomains": ["espn.com"],
  "resolutionURLs": [],
  "earliestResolutionDate": "2026-07-20"
}
```

**天气：**

```json
{
  "predictionMarketId": "0",
  "title": "Will Barcelona have measurable rainfall on June 21, 2026?",
  "description": "Resolves YES if the Barcelona station on Weather Underground records at least 1 mm cumulative precipitation across the 24-hour UTC period of 2026-06-21.",
  "potentialOutcomes": ["Yes", "No"],
  "rules": [
    "Use the wunderground.com Barcelona station daily summary for 2026-06-21.",
    "Resolve YES if total precipitation that day is >= 1mm, otherwise NO."
  ],
  "dataSourceDomains": ["wunderground.com"],
  "resolutionURLs": [],
  "earliestResolutionDate": "2026-06-22"
}
```

## 部署（默认：现有的公共 studionet 工厂）

该工厂提供单个写入方法：

```
create_new_prediction_market(
  prediction_market_id: str,
  title: str,
  description: str,
  potential_outcomes: list[str],
  rules: list[str],
  data_source_domains: list[str],
  resolution_urls: list[str],
  earliest_resolution_date: str,
)
```

按照上述顺序传入经过验证的 config 中的八个字段。该工厂会部署一个全新的预言机合约并将其注册；新预言机的地址会通过*触发的子交易*返回，而不是出现在父交易回执中——你必须轮询获取该地址。

### genlayer-js（Node 和浏览器）

```ts
import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const client = createClient({
  chain: studionet,
  endpoint: "https://studio.genlayer.com/api",
  // Node: createAccount(process.env.PRIVATE_KEY). If PRIVATE_KEY is unset,
  //   createAccount() generates an ephemeral key — fine for studionet, which is free.
  // Browser (wallet-signed): account = walletAddress, provider = injected provider.
  account: createAccount(process.env.PRIVATE_KEY),
});

const parentHash = await client.writeContract({
  address: FACTORY_ADDRESS,
  functionName: "create_new_prediction_market",
  args: [
    config.predictionMarketId || "0",
    config.title,
    config.description,
    config.potentialOutcomes,    // [string, string]
    config.rules,                // string[]
    config.dataSourceDomains,    // string[]
    config.resolutionURLs,       // string[]
    config.earliestResolutionDate,
  ],
  value: 0n,
});

await client.waitForTransactionReceipt({
  hash: parentHash,
  status: TransactionStatus.ACCEPTED,
});

// Resolve the child oracle deploy tx (poll up to ~60s).
let childHash: `0x${string}` | null = null;
for (let i = 0; i < 30 && !childHash; i++) {
  const triggered = await client.getTriggeredTransactionIds({ hash: parentHash });
  childHash = triggered?.[0] ?? null;
  if (!childHash) await new Promise(r => setTimeout(r, 2000));
}
if (!childHash) throw new Error("No oracle child transaction was emitted.");

const childReceipt = await client.waitForTransactionReceipt({
  hash: childHash,
  status: TransactionStatus.ACCEPTED,
});
const oracleAddress =
  childReceipt.txDataDecoded?.contractAddress ??
  childReceipt.data?.contract_address;

// Verify deployment immediately — confirm the factory wrote what you submitted
// before reporting success to the user.
const deployed = await client.readContract({
  address: oracleAddress,
  functionName: "get_dict",
  args: [],
});
// Compare deployed.title, deployed.potential_outcomes, and
// deployed.earliest_resolution_date against your config.
```

仅记录 `parentHash`、`childHash`、`oracleAddress`，以及 `deployed` 中的一小部分字段（例如 `title`、`potential_outcomes`、`earliest_resolution_date`）——完整的交易回执包含大量共识和验证器载荷，会使代理上下文变得臃肿。

### 原始 JSON-RPC（非 JS 代理）

RPC 端点（`https://studio.genlayer.com/api`）支持 Ethereum 风格的 JSON-RPC 超集。读取使用 `gen_call`；写入则通过签名交易使用 `eth_sendRawTransaction`。**Calldata 由 GenVM 自有方案编码——不是 Solidity ABI。** 可移植的选择有：

- 在另一个运行时中通过 Node 子进程使用 `genlayer-js` SDK，或
- 从开源 SDK 中复现编码器（它会将参数序列化为一种以指定方法为目标的 CBOR 风格载荷）。

对于大多数代理而言，最简单的方法是调用一个运行上述代码片段的小型 Node 脚本。无论使用哪种语言，HTTP 目标和方法名称都保持不变。

### CLI 快捷方式（仅在分叉你自己的工厂时使用）

```bash
cd scripts && PRIVATE_KEY=<key> RPC_URL=<rpc> npm run deploy
```

这会部署一个**全新的工厂合约**（将新地址写入 `.env.local`），而不是创建新的预言机。除非用户明确希望运行自己的工厂，否则应使用 `oracle-meta.json` 中地址对应的现有工厂。

## 稍后检查（监控）

预言机公开了两个视图方法：

- `get_dict()` → 完整状态字典：`title`、`description`、`potential_outcomes`、`rules`、`data_source_domains`、`resolution_urls`、`status`、`earliest_resolution_date`、`analysis`、`outcome`、`prediction_market_id`。
- `get_status()` → 字符串，值为 `"Active"` | `"Resolved"` | `"Error"` 之一。

状态含义：

- `Active` — 仍处于开放状态，或上一次 `resolve()` 调用返回了 `UNDETERMINED`（证据不足）。任何人稍后都可以再次调用 `resolve()`。
- `Resolved` — `outcome` 字段已填入 `potential_outcomes` 中的一个值。最终状态。
- `Error` — 验证器就一个不在允许列表中的结果达成了共识。最终状态，不可重试。

```ts
const state = await client.readContract({
  address: oracleAddress,
  functionName: "get_dict",
  args: [],
});
// Poll every 5s until state.status is "Resolved" or "Error" — never longer.
// Once terminal, stop polling.
```

要列出某个工厂已部署的所有预言机：

```ts
const addresses = await client.readContract({
  address: FACTORY_ADDRESS,
  functionName: "get_contract_addresses",
  args: [],
});
```

## 触发解析

预言机不会自行解析。在 `earliestResolutionDate` 经过之后，任何人都可以调用 `resolve()`：

```ts
await client.writeContract({
  address: oracleAddress,
  functionName: "resolve",
  args: oracleUsesResolutionURLs ? [] : [evidenceUrl],
  value: 0n,
});
```

- 对于**基于域名的**预言机（已填充 `dataSourceDomains`），传入一个 `evidenceUrl`，其主机必须与已存储域名之一匹配。
- 对于**基于 URL 的**预言机（已填充 `resolutionURLs`），不要传入参数——这些 URL 在创建时已经固定。

验证器随后会获取页面、运行 LLM 共识，并写入 `status` + `outcome`。

## 故障排除

- `Cannot provide both resolution URLs and data source domains` — XOR 违反。选择其中一项，并将另一项置空。
- `Missing resolution URLs or data source domains` — 两个数组均为空。至少添加一项。
- `At least two potential outcomes are required` / `Potential outcomes must be unique` — 必须提供恰好两个不同的字符串。
- `Cannot resolve before the earliest resolution date` — 等待该日期过去。
- `The evidence URL does not match any of the data source domains` — `evidenceUrl` 的主机名（转换为小写并移除 `www.`）必须与存储的域名之一相等。
- 使用 `resolve()` 后状态仍为 `Active` — LLM 面板返回了 `UNDETERMINED`。稍后使用更好的证据 URL 再次调用 `resolve()`。
- 状态变为 `Error` — 共识选择了不在 `potentialOutcomes` 中的结果。该错误为最终错误，无法重试。考虑使用更清晰的规则或结果重新部署。
- `Factory address is not configured` — 获取 `https://intelligentoracle.com/oracle-meta.json`，或向用户询问当前使用的工厂地址。
- 浏览器路径中的钱包拒绝 — 显示纯文本消息 "Request cancelled in your wallet"，然后重新提示。

## 规范版本

此 skill 发布于 `https://intelligentoracle.com/skill.md`。如果怀疑内容已过时，请重新获取。