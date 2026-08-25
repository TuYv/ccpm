---
name: retro
description: "Facilitate a structured sprint retrospective — what went well, what didn't, and prioritized action items with owners and deadlines. Use when running a retrospective, reflecting on a sprint, creating action items from team feedback, or learning how to run effective retros."
---
## Sprint 回顾主持人

运行一次结构化回顾，提炼洞察并产出可执行的改进措施。

### 上下文

你正在为 **$ARGUMENTS** 主持回顾。

如果用户提供了文件（Sprint 数据、速度图表、团队反馈或之前的回顾记录），请先阅读这些文件。

### 指示

1. **根据上下文选择回顾形式**（或让用户选择）：

   **形式 A — 开始 / 停止 / 继续**：
   - **开始**：我们应该开始做什么？
   - **停止**：我们应该停止做什么？
   - **继续**：哪些事情进展顺利，应该继续保持？

   **形式 B — 4Ls（喜欢 / 学到 / 缺少 / 期待）**：
   - **喜欢（Liked）**：团队喜欢哪些方面？
   - **学到（Learned）**：获得了哪些新知识？
   - **缺少（Lacked）**：哪些东西是缺失的？
   - **期待（Longed For）**：我们希望拥有哪些东西？

   **形式 C — 帆船**：
   - **风（推动我们前进）**：是什么在推动我们前进？
   - **锚（阻碍我们）**：什么在拖慢我们的进度？
   - **礁石（风险）**：前方有哪些危险？
   - **岛屿（目标）**：我们要到达哪里？

2. **如果用户提供了原始反馈**（例如便签、调查回复或 Slack 消息）：
   - 将相似内容归纳为主题
   - 找出被提及最频繁的话题
   - 注意情绪模式（挫败、积极、困惑）

3. **分析 Sprint 表现**：
   - Sprint 目标：已达成还是未达成？
   - 速度与承诺的对比（承诺过多？承诺过少？）
   - 遇到的阻碍以及解决方式
   - 协作模式（哪些做得好，哪些没有奏效）

4. **生成已排序的行动项**：

   | 优先级 | 行动项 | 负责人 | 截止日期 | 成功指标 |
   |---|---|---|---|---|
   | 1 | [具体、可执行的改进措施] | [姓名/角色] | [日期] | [我们如何判断它奏效] |

   - 限制为 2-3 个行动项（更多行动项通常无法完成）
   - 每个行动项都必须具体、可分配且可衡量
   - 如果有之前的回顾行动项，请引用它们——这些行动项是否已完成？

5. **创建回顾摘要**：
   ```
   ## Sprint [X] Retrospective — [Date]

   ### Sprint Performance
   - Goal: [Achieved / Partially / Missed]
   - Committed: [X pts] | Completed: [Y pts]

   ### Key Themes
   1. [Theme] — [summary]

   ### Action Items
   1. [Action] — [Owner] — [By date]

   ### Carry-over from Last Retro
   - [Previous action] — [Status: Done / In Progress / Not Started]
   ```

保存为 Markdown。保持建设性的语气——目标是改进，而不是追责。