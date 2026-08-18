---
name: okx-growth-competition
description: "List OKX Agentic Wallet exclusive trading competitions, register users for contests, track participation and leaderboard rankings, and claim won rewards. Use when users want to list available trading competitions or trading cups, view competition rules / prize pool / total prizes, register or sign up or enroll or join a contest, check the leaderboard (who is winning) or their own rank (am I in the prize zone, what is my place), ask did I win or query participation / claim status, claim won rewards or prizes from completed competitions, see which wallet account they registered with, or submit Telegram / WeChat / Email / Twitter contact for prize delivery to top-tier winners."
license: MIT
metadata:
  author: okx
  version: "4.2.1"
  homepage: "https://web3.okx.com"
---
# OKX Growth Competition — 交易竞赛

Agentic Wallet 专属交易竞赛。完整生命周期拆分为多个专门的参考文档：

- **参与**（发现 / 报名 / 交易 / 已注册钱包 / 导出保护）— `references/participation.md`
- **详情**（规则 / 奖池 / 四个奖励部分）— `references/details.md`
- **排名**（排行榜 / 使用 CASE 1/2/3 模板查询自己的排名）— `references/rank.md`
- **领取**（奖励状态检查 / 原子领取 / 联系方式收集）— `references/claim.md`
- **CLI 参考**（命令、参数、返回 schema）— `references/cli-reference.md`

本 SKILL.md 包含所有参考文档所依赖的**全局规则**（事实、身份不变量、路由、输出规则、时间格式、状态码、错误处理）。始终先阅读此文件，然后根据用户意图跳转到匹配的参考文档。

## 关于每个 Agentic Wallet 竞赛的事实

当用户询问竞赛如何运作时，将以下内容视为**事实真相**。两个与链相关的字段承担**不同且不重叠的角色**，绝不能混淆：

- `chainId` — 单个 id。**仅表示领取 / 奖励链**（奖励会在此链上发放；其合约地址也位于此处）。它不是交易链，除非它同时出现在 `participateChainIds` 中。
- `participateChainIds` — 由 `list` 和 `detail` endpoint **同时返回的 id 数组**。**表示交易链集合。**在此列表中任意链上的交易，都会计入同一竞赛排名。

**交易链集合 = `participateChainIds`。领取链 = `chainId`。** 这是两个独立的概念；下面的展示规则**绝不会**将二者合并。

1. **链 id → 展示名称**映射。目前支持的竞赛链：`1 → Ethereum`、`196 → X Layer`、`501 → Solana`。
2. 在检查 `participateChainIds` 之前，绝不要告诉用户“你的链不计入”。
3. `myRankInfo.userTotal = 0` 表示用户尚未达到资格门槛，或后端指标流水线尚未识别到用户的交易——这**不**表示用户所在的链不受支持。
4. `competition_rank` 接受一个可选的 `wallet`。查询自己的排名时省略该参数——工具会发送你的 `accountId`（一次调用即可覆盖 `participateChainIds` 中的所有链；无需选择链）。**仅在查询他人排名时**传入显式地址；地址的链族（EVM 为 `0x...`，否则为 Solana）必须与 activity 的主链匹配，否则工具会拒绝调用（不会静默执行错误链查询）。

## 身份解析不变量

`competition_rank` 和 `competition_user_status` 的查询身份是**互斥的**：后端接受 `accountId`（本人）或 `walletAddress`（跨用户）中的**一个**，绝不会同时接受二者。“你使用了哪个身份？”的答案由调用形式**确定性地决定**。

| 调用形式 | 发送的身份 |
|---|---|
| `competition_user_status`（任意情况） | `accountId` — 一次调用即可覆盖 `participateChainIds` 中的所有链 |
| 不带 `wallet` 的 `competition_rank` | `accountId` |
| 带 `wallet=<addr>` 的 `competition_rank` | `walletAddress` — 工具会验证地址的链族（EVM 为 `0x...`，否则为 Solana）是否与 activity 的 `chainId` 匹配；不匹配 → 拒绝 |
| `competition_claim`（预检查） | `accountId` |

对于多活动 `competition_user_status`（没有 `activity_name`），所有活动都会复用相同的 `accountId`，后端会通过 accountId 进行关联。

## 强制阅读顺序

**在生成任何关于竞赛的面向用户的消息之前，必须先在下方正确的参考文件中定位匹配的章节，并遵循其固定的模板结构。** 不得自行发挥格式。不得缩短模板。不得删除或合并章节。模板是产品强制规定的文案（Participation / Skill Quality 表述及免责声明），不得进行改写。

模板的**结构是固定的**；**语言遵循用户所用语言**，请参阅下方的 `## Output Language` 规则。当用户使用中文时，将模板字符串翻译为自然中文。当用户使用英文时，按原文使用英文。占位符（包括来自 `{supportedChains}` 的链显示名称）保持不变。

快速路由（用户意图 → 参考文件 + 章节）：

| 用户意图 | 参考文件 | 章节 |
|---|---|---|
| “列出竞赛 / 展示可用竞赛” | `references/participation.md` | 步骤 1 — 发现 |
| “展示详情 / 展示规则 / 展示奖池” | `references/details.md` | 步骤 2 — 查看详情 |
| “注册 / 加入” | `references/participation.md` | 步骤 3 — 加入 |
| “替我交易” | `references/participation.md` | 步骤 4 — 交易（委托给 okx-agentic-wallet） |
| “排行榜 / 完整榜单 / 谁正在获胜” | `references/rank.md` | 查看排行榜（完整榜单） |
| “我的排名 / 我的排名是多少 / 我是否位于奖金区” | `references/rank.md` | 查看用户自己的排名（所有排行榜） |
| “展示已注册钱包” | `references/participation.md` | 查询已注册钱包 |
| “导出钱包” | `references/participation.md` | 钱包导出保护 |
| “查看我的状态 / 我赢了吗” | `references/claim.md` | 查看参与状态 |
| “领取奖励 / 领取我的奖品” | `references/claim.md` | 步骤 6 — 领取奖励 |
| 顶级获胜者领取后的联系方式跟进（领取后 `needContact: true`） | `references/claim.md` | 联系方式收集（仅限顶级获胜者） |

如果用户的意图无法明确对应上述任何一项，请先询问用户具体指的是哪一项，然后再回复——**不得**自行发明自由格式。

## 预检

> 阅读 `../okx-agentic-wallet/_shared/preflight.md`。如果缺失，则阅读 `_shared/preflight.md`。

**常见错误的跨技能路由**：
- `not logged in` → 引导用户完成 `okx-agentic-wallet` 登录流程（电子邮件 → OTP），然后重试原始操作。
- 后端状态码（`--status` 过滤器 / `status` / `joinStatus` / `rewardStatus`）以及错误代码消息（`11002` / `11003` / `11008` / `1860402` / `address limit reached` / `Sui-chain` / region-blocked / `not eligible`）：参阅 `references/cli-reference.md`。

## 命令索引

所有 MCP 工具都与 CLI 对应；MCP 变体接受 `activity_name`（由服务器解析 id），并从当前活动会话中自动解析 `accountId` / 钱包地址。完整的标志参数表和返回结构：参阅 `references/cli-reference.md`。

| # | Command | Auth | Description |
|---|---------|------|-------------|
| 1 | `onchainos competition list [--status 0\|1\|2] [--page-size N] [--page-num N]` | 无 | 列出竞赛（默认为 `status=0`，仅限进行中的竞赛） |
| 2 | `onchainos competition detail --activity-id <id>` | 无 | 规则、奖池、链、时间线 |
| 3 | `onchainos competition rank --activity-id <id> [--wallet <addr>] --sort-type <type> [--limit N]` | 无 | 排行榜及用户排名。有关自身/跨用户语义以及 `sort-type` 的发现方式，请参阅 `references/rank.md`。 |
| 4 | `onchainos competition user-status [--activity-id <id>]` | 钱包登录 | 参与及奖励状态（省略 `--activity-id` 可查询所有活动） |
| 5 | `onchainos competition join --activity-id <id> --evm-wallet <addr> --sol-wallet <addr> --chain-index <chain_id>` | 钱包登录 | 为当前账户报名参加竞赛 |
| 6 | `onchainos competition claim --activity-id <id> --evm-wallet <addr> --sol-wallet <addr>` | 钱包登录 | 原子化领取——在调用过程中完成签名并广播。请参阅 `references/claim.md`。 |
| 7 | `onchainos competition submit-contact --activity-id <id> --contact-type <Telegram\|WeChat\|Email\|Twitter> --contact-value <text>` | 钱包登录 | 为顶级获奖者记录联系方式；仅可在 `needContact: true` 的领取操作之后执行。请参阅 `references/claim.md`。 |

`--status`（请求筛选条件）：`0`=进行中，`1`=已结束，`2`=全部  
`activityStatus`（响应字段）：**`3`=进行中，`4`=已结束** —— 与请求筛选条件不同

## 输出规则

> **仅供内部使用的 ID 与面向用户的显示。** 工具响应中会有意返回内部数字 ID（`activityId`、`chainIndex`、`accountId`）——它们是工具之间串联调用所必需的（例如，在执行 `competition_join` 后，可能需要调用 `competition_detail`，并使用活动 ID 填充成功模板）。**请将它们保留在数据层中；绝不要在面向用户的消息中显示。**

**在任何情况下、以任何格式生成面向用户的消息时，都不得包含任何内部 id。** 只能通过 `activityName`（如果名称不可用，则使用 `shortName`）向用户标识活动。

**禁止出现在面向用户输出中的模式**（不得生成如下输出）：
- `Agentic Trading Contest (#107)`
- `#106 (agenticwallettest1)`
- 任何暴露活动 ID 的列、行或行内引用（例如 `competition 107`、`ID` 列、标记为 `Activity ID` 的行）——无论标签、形状或语言如何，均适用同一规则。

**正确的面向用户显示方式**：
- `Agentic Trading Contest`
- 当需要区分两个同名活动时，追加 `chainName`（例如 `Agentic Trading Contest (Solana)`），绝不能使用 ID。

**幕后操作（允许且应当执行）**：
- 从 `competition_user_status` / `competition_join` 响应中读取 `activityId`，并将其传递给 `competition_detail`，以获取固定模板所需的数据。
- 通过数字 id 在工具之间串联调用——只要最终面向用户的消息中不包含这些 id 即可。

当用户要求对特定活动执行操作（例如“claim Agentic Trading Contest”）时，MCP 工具 `competition_claim` / `competition_join` 接受 `activity_name`，并在服务器端解析 id，因此你也可以直接使用名称，而无需自行查询。

## 输出语言

**将用户对话中的每个固定模板都以用户所使用的语言呈现。** 模板结构（章节、顺序、编号项目、表格列数、占位符位置、`{supportedChains}` 占位符以及 `[Disclaimer: ...]` 块）是固定的，绝对不能更改。只有其中的自然语言文本才翻译成用户所使用的语言。

**占位符绝不翻译。** `{supportedChains}`、`{chainName}`、`{rewardUnit}`、`{txHash}`、`{accountName}` 等占位符会直接填充 API 值，不要进行本地化。链的显示名称（例如 `Solana`、`X Layer`、`Base`）来自规范的 id → name 映射，在所有语言中都保持不变。

## 交付前检查清单

发送前进行最终检查，涵盖长篇响应后容易遗漏的参考文件 MUST 要求。（前文已涵盖的规则——内部 ID、`participateChainIds`、`*Formatted`、语言/模板一致性——此处不再重复；请遵循其所属章节中的规则进行验证。）

- [ ] 注册成功响应后 → `[免责声明：数字资产交易涉及风险。 ...]` 行必须单独出现在末尾。（→ `participation.md` → Successful registration）
- [ ] claim 运行时失败（签名 / 广播 / 网络）后 → 附加 3 条项目符号组成的失败建议块。在预检查拒绝（rewardStatus 0/2/3/4、code 11002、code 11008）时 → **省略**该建议块。（→ `claim.md` → Fixed failure-suggestion block）
- [ ] 调用 `competition_claim` 前 → 必须呈现预 claim 预览行（`准备在 {chainName} 上领取 {rewardAmount} {rewardUnit}。请回复 "confirm" 以继续。`），并且用户已明确确认。（→ `claim.md` → Pre-claim preview）