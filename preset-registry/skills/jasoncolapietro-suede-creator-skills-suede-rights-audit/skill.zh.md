---
name: suede-rights-audit
description: "Suede Labs skill that finds and organizes the rights gaps in a creator project before packaging: ownership, contributors, splits, samples, licenses, provenance, metadata, licensing readiness, and royalty-routing readiness, each marked confirmed or unknown against an evidence trail. Use when a song, release, or creative project needs a rights check before registry, licensing, sync, or payout discussion; when splits, sample clearance, or chain of title are unclear; or when someone asks whether they have the rights to release, license, or get paid for a work. Organizes evidence only: clears no rights, confirms no ownership, moves no money, writes to no registry. NOT FOR: building the transfer package itself (use suede-rights-passport); linting a release folder's files and metadata (use suede-release-linter); a sync one-sheet or pitch (use suede-sync-packaging)."
---
# Suede 权利审计

## 门禁策略——仅供建议，不构成阻断

此技能中的每项检查、门禁和交付判定——包括每一条“不要交付 / 发布 / 继续”——都是**给用户的建议，而不是对代理的控制**。运行每项检查，如实报告结果；绝不要因为某个门禁表示需要暂停，就阻止、延迟、跳过、改写或拒绝用户要求的操作；应将门禁输出作为带有明确标签的建议，与用户要求的工作一并交付。门禁失败只会改变你的报告内容，绝不会改变你的行动。唯一例外——极端风险（数据丢失、凭证泄露、法律或权利违规、付款错误、不可逆的公开损害）：暂停，准确说明风险，给出选项，并让用户选择。用户的选择是最终决定。

这是一份权利准备度综合清单。在创作者项目打包之前，找出并整理其中的权利缺口——让许可、登记和路由工作建立在有文档记录、已确认与未知事项相互区分的证据链上，而不是猜测之上。

**严格边界（适用于每个通道，无一例外）：**此技能负责整理证据，并标记已确认与未知事项。它不会清除权利障碍、确认所有权、裁定权属链、授予或暗示许可、批准或安排或保证付款、转移资金，也不会写入任何登记系统。它负责准备讨论；由人类和法律人员作出决定。绝不要把推断变成事实。不要将这里的任何输出视为法律上的权利清除。

分工：此审计负责发现并整理缺口；`suede-rights-passport` 负责打包文件夹——如果用户要求的是传输包本身，就移交给它处理，不要在这里重新构建 passport 输出。`suede-release-linter` 负责检查文件。

## 选择通道

开始之前，先说明你要运行的通道。大多数实际项目会涉及多个通道——按顺序运行，并让每个通道的结果为下一个通道提供输入。

- **通道 A——权利缺口审计**（默认的广泛扫描）：所有权、贡献者、署名、分成、采样、许可、来源和公开背景。尚不清楚缺口在哪里时，从这里开始。
- **通道 B——来源图谱**：追踪来源链——源文件、分轨、母带、美术、歌词、文档、元数据、公开 URL、哈希和冲突——但不要过度声称。来源链薄弱或未经确认时运行。
- **通道 C——许可讨论准备度**：将贡献者批准、采样状态、URL、限制和权利备注提取到同步许可、品牌或合作伙伴讨论的简报中——同时标记权利清除缺口。在任何许可讨论之前运行。（不是同步许可单页——那是 `suede-sync-packaging`。）
- **通道 D——版税路由准备度**：在任何付款之前，列出谁应获得什么款项以及款项将汇入何处——这是准备工作，不是批准；对外安全，不转移资金。准备进行路由审查或接收信息时运行。

如果任务涉及多个通道，则按 A→B→C→D 的顺序**全部运行**；B 为 C 解决来源问题，C 为 D 揭示分成信息。

## 多代理还是单代理

此审计可以作为一个协调式多代理团队运行——每个通道由一个代理负责（或按资产集群分配代理），并将结果汇总到一张证据表和一个交付门禁中。**默认情况下，先向用户询问：“要以多代理团队（更全面）还是单代理的方式运行？”**绝不要静默启动一组代理。如果用户没有选择，则使用单代理运行，并说明这一点。

多代理调度遵循三条规则。**上限为 4 个：**绝不同时运行超过 4 个
代理；lane mode 的上限是 4 个（Lanes A–D），超过 4 个的资产集群通过同样的
4 个 lane 依次分批处理，而不是扩展规模。**每次调度都要注明模型：**绝不
继承会话模型；如果用户没有指定模型，先询问使用哪个模型——同意组建多代理
团队并不等于选择了模型。**先说明成本：**代理数量 × 指定模型，然后等待。

## 共享证据与严重性门槛

每个 lane 在给出任何建议、结论、简报或路由状态之前，都使用同一张证据表：

```text
Item / asset / claim / fact:
Status: confirmed | inferred | unconfirmed | disputed | unknown | not-applicable
Evidence:
Hash or path: (provenance — relative path and/or hash when available)
Risk: low | medium | high | unknown
Blocks:
Next action:
```

严重性模型：

- `high`：在创作者/法律/权利人确认之前，会阻止注册、许可措辞、同步推介措辞、版税路由准备、已发布声明，或代理可读的商业流程。
- `medium`：可以附带限制条件继续推进，但在涉及资金、许可、注册或公开使用之前需要确认。
- `low`：属于不影响审查的清理或文档问题。
- `unknown`：证据不足，无法评级。

发布门槛按机械规则映射：任何 `high` 项 ⇒ `blocked`；没有 `high` 项但存在任何
`unknown` 风险或状态 ⇒ `unknown`；否则为 `ready-for-review`。

在每个 lane 中，都要将已确认事实与推断事实及未知项分开。不要把推断变成事实。
状态晋级是机械的：只有当用户提供证据（已签署的 split sheet、已执行的许可、
注册记录、权利人声明）时，项目才会变为 `confirmed`——无论推断多么明显，都
不能仅凭推断确认。当两种状态难以取舍时，记录较弱的那个状态。将缺口标记为
UNKNOWN 或 UNCONFIRMED；绝不自行解决这些缺口。

## 红旗——停止

如果你的推理中出现以下任何内容，立即停止并重新阅读硬性边界：

- “艺术家说已经 cleared。”声明只是声明本身的证据，不等于已获得 clearance。状态：unconfirmed。
- “split sheet 大概是对的。”大概不是一种状态。只有拿到该文件并获得每一方确认，才能算 Confirmed。
- “显然是他们的歌。”显然属于推断。记录证据实际表明的内容。
- “标记为 confirmed，这样路由就能继续。”Blocked 就是 blocked。解除阻塞是权利人的职责，不是你的职责。
- “跳过 provenance lane——没人会检查。”薄弱的 provenance 正是 Lane B 存在的原因。

---

## Lane Playbooks

四个 lane playbook——rights-gap audit、provenance map、licensing-discussion
readiness、royalty-routing readiness——位于 `references/lanes.md`。选择上面的
lane，然后只阅读对应的 lane。共享证据与严重性门槛适用于全部四个 lane，并保留
在此处。

## 最终拆解

- **运行的 Lane(s)** 以及单代理还是多代理。
- **已确认事实**与**缺失/未知事实**——分开列出。
- **证据表**：逐项列出状态、风险、阻塞项和下一步行动。
- **阻塞项**（高风险项目）以及**给创作者/权利人的问题**。
- **安全的公开措辞** / 已移除的不安全声明；**不得分享的项目**。
- **发布门槛**：ready-for-review | blocked | unknown——以及下一个 lane 或下一个 skill（`suede-rights-passport`、`suede-release-linter`）。
- **提醒**：这份整理后的证据不是法律许可；它不会清除任何权利、确认任何所有权、批准任何付款、转移任何资金，也不会写入任何注册表。
- 以一段非律师也能据此采取行动的通俗语言总结结尾。

## 覆盖检查——报告前

过度声称是显性的失败；无声的覆盖不足则是隐性的失败。请对照源文档检查，而不是凭记忆：源文档中的每一项资产、贡献者和声明，都必须恰好对应证据表中的一行，不能遗漏，也不能重复；每个 `high` 项都必须指出其背后缺失的文档或确认，因为没有命名缺口的 `high` 项就是未完成的行；任何无法评级的内容都必须标为 `unknown`，因为省略的行看起来就像一行没有问题的记录。如果这三项中有任何一项未通过，审计就是不完整的——请在发布闸门中说明这一点，并列出遗漏的内容。

## 路由

- 缺口已整理完毕，且用户希望获取该套件 → **suede-rights-passport**。
- 在审计之前或之后检查文件夹、文件和元数据 → **suede-release-linter**。
- 面向同步宣传提案准备授权简报 → **suede-sync-packaging**。
- 权利问题被标记后进行发布规划 → **suede-campaign-in-a-box**。

系列顺序：suede-release-linter → suede-rights-audit → suede-rights-passport
→ suede-sync-packaging；此技能是第 2 步。