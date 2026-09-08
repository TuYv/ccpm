---
name: linkedin-content-planner
description: Generate a 7-day LinkedIn content plan from a theme, audience, and pillars. Produces per-day post pillar, format, hook type, CTA, posting time, daily comment targets, and a weekly inbound-readiness check. Use when the user wants to plan a week or month of content, not draft a single post.
---
# LinkedIn 内容规划器

制定一份围绕三大支柱原则构建的 7 天 LinkedIn 计划（权威 40-50%、个人叙事 30-40%、社群 20-30%）。可选增加一个产品/ Offer 支柱，占比 10-15%。

## 适用场景

- 用户提出“帮我规划本周”或“这周该发什么内容”
- 用户想摆脱临时起意的随性发帖，建立节奏
- 在发布周之前（用户需要产品支柱与发布对齐）

## 输入

- **主题**（可选）：例如“AI agents 在生产环境中上线”、“Co.Actor 的前 6 个月”
- **受众描述**：例如“B2B 创始人、AI 运维负责人、市场 VP”
- **支柱配比**（可选）：默认为 40% 权威 / 30% 个人叙事 / 20% 社群 / 10% 产品
- **发帖日**（可选）：默认为周二/周三/周四/周五（4 篇帖子）
- **语气样本**（可选）：过往帖子的路径，用于语气校准

## 输出

一份 markdown 计划，包含：

### 7 天日历

| 星期 | 时间 | 支柱 | 形式 | 钩子公式 | 一句话切入角度 | CTA 类型 | 目标 |
|---|---|---|---|---|---|---|---|
| 周一 | — | （评论互动日） | — | — | — | — | — |
| 周二 | 上午 8:00 当地时间 | 权威 | 文字 | F7 Odd-Precision Money | “跑 3 个月 agent 运维的真实成本” | 提问式收尾 | 收藏 |
| 周三 | 上午 9:30 当地时间 | 个人叙事 | 文字 | F4 Time-Anchor Confession | “我为什么停更了 4 周” | 镜像提问 | 评论 |
| 周四 | 上午 8:00 当地时间 | 社群 | 文字 | F14 Named Gratitude | “影响我们发布的 3 个人” | @提及 + 感谢 | 转发 |
| 周五 | 上午 9:00 当地时间 | 个人叙事 | 文字 | F11 Emotional Cold-Open | “我们第一次部署失败的那个夜晚” | 软性收尾 | 点赞 |
| 周六/周日 | — | （休息） | — | — | — | — | — |

目标列将收藏 / 评论 / 转发 / 点赞分布在四篇帖子中，满足下文的目标组合检查。

### 每日评论目标

针对每个发帖日：
- **3-5 位要互动的创作者**（具体名字或人群画像：“粉丝量 5-20k 的同阶段创始人”、“关注 AI 方向的 VC”、“大公司 CTO”）
- **要采用的评论模式**（抢先评论、数据先行、回答对方问题）
- **目标数量**：每天 10-20 条有实质内容的评论

### 每周获客就绪检查

- [ ] 至少 1 篇袒露脆弱的帖子（个人叙事）
- [ ] 至少 1 篇展示证据/数据的帖子（权威）
- [ ] 至少 1 篇软性 Offer 或引导 CTA 的帖子
- [ ] 评论策略包含 70% 同侪、20% 向上对标对象、10% 潜在客户
- [ ] 任何支柱不超过本周帖子的 60%
- [ ] 同一周内没有重复使用同一公式
- [ ] 目标组合分散：不是每篇帖子都追求同一种反应（见下文“目标组合”）

## 规则

- **支柱最少 3 个，最多 5 个。** 超过 5 个会稀释信号。
- **每周 3-5 篇帖子。** 每周 6 篇以上会触发 360Brew 的自我蚕食信号。
- **每天 10-20 条评论**，发布在其他创作者的内容下。评论带来的获客比帖子更多。
- **周二/周三/周四**对 B2B 效果最佳。避免周五下午 2 点后以及周六/周日（B2B 触达会削减 30-50%）。
- **每个支柱每周只用一种形式。** 不要给权威支柱连排 3 篇文字帖——要变换形式。
- **产品/ Offer 支柱每周最多 1 篇。** 过度使用会摧毁信任。

## 公式 → 支柱映射

| 支柱 | 优先公式 |
|---|---|
| 权威 | F7 Odd-Precision Money, F10 Contrarian Historical, F8 Paid-vs-Free, F5 Self-Proving Meta, F15 Explain-to-Kids |
| 个人叙事 | F4 Time-Anchor Confession, F3 Year-over-Year Pivot, F9 Curiosity-Gap, F11 Emotional Cold-Open, F16 Status-Strip |
| 社群 | F6 Comment-Gate（少量使用）、F12 Permission Slip, F14 Named Gratitude、投票帖、聚焦提及 |
| 产品/ Offer | F2 R.I.P. Obituary（在切换品类时）、F1 Anaphora（在将产品定位为解法时）、F13 Bait-and-Switch（升级公告） |

## 创始人版（备选支柱组合）

当整份计划是为一位正在与投资人、新招员工和设计伙伴建立信任的**创始人**制定时，将默认支柱配比替换为 `../../references/founder-topics.md` 中的创始人支柱组合。它将每个支柱映射到创始人**切入角度**（A1-A10）而非通用话题，并倚重结构化公式 F17-F20。

| 支柱 | 占比 | 创始人角度 | 优先公式 |
|---|---|---|---|
| **信念**（POV、品类、产品哲学） | 30-40% | A1 Reprice, A7 Designed Serendipity, A8 Evasive-Sentence | F10, F18, F5 |
| **公开构建**（真实的、不光鲜的工作） | 30-40% | A5 Unglamorous Bet, A6 Limit of Delegation, A9 Delegation Line | F7, F4, F17 |
| **算账**（创始人实际如何决策） | 15-20% | A4 Scarce-Shots, A10 Learning Gate | F10, F18, F20 |
| **佐证**（以窄切口讲述关系与成果） | 10-15% | A2 Content-to-Pipeline, A3 Audience of One | F9, F11, F5 |

同样的护栏依然适用：每周 3-5 篇帖子、任何支柱不超过 60%、7 天内不重复公式、目标在一周内分散。当受众是一位正在创业的创始人时，询问用户“要创始人计划还是通用计划？”，如果对方回答创始人，则默认使用这套组合。

## 目标组合（平衡整周，而不只是支柱）

每个公式对应一种主要反应：评论、转发、点赞或收藏（见 `../../references/hook-formulas.md` 的“Engagement-goal split”）。一周全是评论诱饵或全是转发诱饵会显得刻意设计，并压平触达。将目标分散到整周：

| 目标 | 公式 | 每周目标 |
|---|---|---|
| 评论 | F4, F10, F12, F9 | 至少 1 篇 |
| 转发 | F14, F2, F8 | 至少 1 篇 |
| 点赞 | F11, F13, F16 | 至少 1 篇 |
| 收藏 | F15, F7, F8 | 至少 1 篇 |

## 步骤

1. 收集输入。如果未提供主题、受众和支柱偏好，向用户询问。
2. 校验支柱配比合计为 100%；任何支柱超过 60% 时给出警告。
3. 为每个发帖日选定：
   - 支柱（轮换以匹配目标配比）
   - 该支柱公式库中的公式（7 天内不重复）
   - 形式（按支柱规则轮换文字 / 轮播图 / 投票）
   - 具体切入角度（由用户提供或由技能生成）
   - 发帖时间（考虑受众所在时区）
4. 为每个发帖日添加 3-5 个评论目标及建议的评论模式。
5. 运行获客就绪检查；标记缺失项。
6. 以 markdown 形式返回 + 可选的 JSON，用于导入 Notion/Airtable。

## 示例

填写完整的 7 天计划示例见 `references/example-plan-week.md`。

## 文件

- `SKILL.md` — 本文件
- `references/example-plan-week.md` — 完整示例
- `references/pillars-framework.md` — 三大支柱原则详解
- `../../references/founder-topics.md` — 创始人版角度库（A1-A10）及创始人支柱组合

## 相关技能

- `linkedin-post-writer` — 根据计划生成每天的帖子草稿
- `linkedin-comment-drafter` — 执行每日评论目标
- `linkedin-thread-monitor` — 追踪评论策略带来的获客
- `linkedin-engager-analytics` — 对每篇帖子的受众做分层分析
