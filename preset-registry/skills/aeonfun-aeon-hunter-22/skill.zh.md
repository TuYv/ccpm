---
name: hunter-22
description: Scan the ClawHunter agent bounty marketplace for opportunities that genuinely match this agent's real capabilities (code, security research, writing) and surface only real matches — never a raw unfiltered dump. When a match is real audit-shaped work with a linked GitHub repo, the notification carries a one-tap button to dispatch vuln-scanner at it directly.
metadata:
  title: Hunter 22
  mode: write
  category: productivity
  var: ""
  tags: [bounties, income, discovery, security]
  requires: []
schedule: "0 10 * * *"
---
> **${var}** — 可选筛选条件。留空 → 默认按能力匹配（见下文）。`types:<a,b>` → 限定赏金类型（例如 `types:code,research`）。`min:<usd>` → 最低奖励下限。

今天是 ${today}。

## 这是什么

[ClawHunter](https://clawhunter.fun) 是一个付费 API，用于索引加密货币/社交赏金平台并对机会进行排名。此技能仅调用其**免费发现层级**——无需 API 密钥、钱包或付款。请阅读此仓库中的 `docs/ClawHunter-API.md`，了解端点参考信息（基础 URL、身份验证、速率限制）。

对于任何需要人工判断或资金的事项，这**仅用于发现**——它绝不会认领、提交或执行赏金任务，也绝不会接触钱包。它会向操作者展示候选项，供其手动采取行动，但有一个例外：当某个匹配项确实属于审计类工作（代码/安全，并且链接了 GitHub 仓库）时，通知会附带一个按钮，用于针对该仓库调度 `vuln-scanner`——仍需由操作者点击以触发，此技能绝不会自行调度。此技能中不得调用任何 `$`（付费、x402）端点；这些端点需要有资金的钱包，而此分支并未配置此类钱包。

## 要做什么

1. 如果 `memory/topics/hunter-22-seen.json` 存在，则读取它（去重日志——已展示过的赏金 ID，以及最后一次看到它们的时间戳）。如果缺失，则创建空文件（`[]`）。
2. 调用 `POST https://clawhunter.fun/api/v1/match`，并提供一个 JSON 请求体，描述此代理真实且已得到证明的能力，而非期望具备的能力：
   ```json
   {
     "capabilities": ["code", "security-research", "research", "writing", "dependency-analysis"],
     "canDoRealWorld": false,
     "minReward": 20,
     "limit": 25
   }
   ```
   `canDoRealWorld: false`——此代理未配置钱包/支付通道，因此应排除需要链上执行或付款的赏金。除非钱包确实已获得资金并记录在 `memory/topics/` 中，否则不得设置 `canDoRealWorld: true`——请先检查。
3. 如果 `${var}` 设置了 `types:` 或 `min:`，则相应调整请求（`types` 筛选赏金的 `types` 字段，`min` 覆盖 `minReward`）。
4. 像处理其他发现技能一样对响应进行筛选——**要诚实，不要宽松**：
   - 丢弃任何实际上伪装成其他任务的内容/社交增长任务（推文串、互动刷量、模仿网红口吻、“让某个主播/创作者发布 X”之类的外联任务）。如果 `requires` 数组仅包含 `engage`/`outreach`/`video`/`image`，而不包含 `code`/`onchain`，就是明显迹象——此代理未接入内容生成或社交外联工具，无法可靠地交付这些任务。
   - 保留与实际工作对应的赏金：代码修复、依赖项/安全审查、技术写作、包含可引用来源的结构化研究——也就是已经在 `output/articles/vuln-scan-*.md` 中展示过的工作类型。
   - 对于每个保留的候选项，进行合理性检查，确认奖励是真实的（而非空头承诺），并且截止日期确实来得及。
5. **标记审计类候选项。** 对于通过第 4 步筛选的每个候选项，检查它是否确实属于代码安全审计：`requires` 包含 `code` 或 `onchain`，**并且**赏金的 `body`/`url` 中包含 GitHub 仓库链接（`github\.com/[\w.-]+/[\w.-]+`）。如果两项都满足，则提取 `owner/repo`——这正是 Veilo 赏金的形式（某个 Superteam 列表指定了特定链上程序的源代码仓库）。并非每个保留的候选项都有这样的链接；大多数都没有。
6. 与 `memory/topics/hunter-22-seen.json` 进行差异比较——仅报告过去 14 天内未见过的赏金。
7. 更新 `memory/topics/hunter-22-seen.json`：为本次运行返回的每个候选项追加 `{id, title, reward, seen_at}`（无论之前是否见过——这样可以确保去重窗口准确，即使是被筛除的候选项，也不会毫无必要地每天重新评估）。清理超过 30 天的条目。
8. 如果存在新的、真正优质的匹配项：调用 `./notify`，发送一份简短、足以支持决策的列表——包括标题、奖励、平台、一行匹配原因和链接。开头先写数量和最佳匹配项。对于第 5 步中标记为审计类的任何匹配项，添加一个内联按钮，使操作者只需点击一次即可调度审计：
   ```bash
   ./notify -f /tmp/hunter22-notify.md --buttons '[[
     {"text":"Audit owner/repo","callback_data":"run:vuln-scanner:owner/repo"},
     {"text":"Open bounty","url":"<bounty url>"}
   ]]'
   ```
   `callback_data` 有严格的 64 字节限制（参见 `docs/telegram-commands.md`）——对于任何实际的仓库路径，`run:vuln-scanner:owner/repo` 都完全能够满足限制。如果本次运行中有多个候选项属于审计类，则每个候选项分别发送一条通知（每条通知都带有自己的按钮行），而不是将它们合并，这样点击时就能明确知道目标是哪个仓库。
   如果没有新候选项，或者筛选后没有真实有效的候选项，则**不要**发送通知（参见 CLAUDE.md：“仅在有明确信号时通知”）。
9. 提交 `memory/topics/hunter-22-seen.json`，并更新 `timestamp:`。

## 约束条件

- 绝不调用付费（`$`）端点。绝不访问 `/tools/*`、`/chat/completions`，也不访问此技能中任何通过 x402 计费的内容。
- 绝不代表运营者认领或提交悬赏——此技能仅展示候选项，而且第 8 步中的审计派发按钮仍需人工点击，不会自动触发。
- 如果 API 无法访问或受到速率限制，请记录相关情况并静默退出——不要进行激进重试（文档规定的上限是每个 IP 每分钟 60 次；此任务每天仅运行一次，远低于该上限）。