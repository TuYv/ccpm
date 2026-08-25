---
name: release-notes
description: "Generate user-facing release notes from tickets, PRDs, or changelogs. Creates clear, engaging summaries organized by category (new features, improvements, fixes). Use when writing release notes, creating changelogs, announcing product updates, or summarizing what shipped."
---
## 发布说明生成器

将技术工单、PRD 或内部变更日志转换为经过润色、面向用户的发布说明。

### 上下文

你正在为 **$ARGUMENTS** 撰写发布说明。

如果用户提供了文件（JIRA 导出文件、Linear 工单、PRD、Git 日志或内部变更日志），请先阅读这些文件。如果用户提到了产品 URL，请使用网络搜索了解该产品及其受众。

### 指示

1. **收集原始材料**：阅读所有提供的工单、变更日志或描述。提取：
   - 发生了哪些变化（功能、改进或修复）
   - 影响哪些用户（哪个用户群体）
   - 为什么重要（对用户的好处）

2. **对变更进行分类**：
   - **新功能**：全新的能力
   - **改进**：对现有功能的增强
   - **错误修复**：已解决的问题
   - **重大变更**：任何需要用户采取行动的变更（迁移、API 变更）
   - **弃用**：即将停止支持的功能

3. **按照以下原则撰写每个条目**：
   - 先说明对用户的好处，而不是技术变更
   - 使用通俗易懂的语言——避免术语、内部代号或工单编号
   - 每个条目控制在 1-3 句话
   - 如果用户提供了视觉素材或截图，请一并加入

   **示例转换**：
   - 技术描述："Implemented Redis caching layer for dashboard API endpoints"
   - 面向用户的描述："Dashboards now load up to 3× faster, so you spend less time waiting and more time analyzing."

   - 技术描述："Fixed race condition in concurrent checkout flow"
   - 面向用户的描述："Fixed an issue where some orders could fail during high-traffic periods."

4. **组织发布说明**：

   ```
   # [Product Name] — [Version / Date]

   ## New Features
   - **[Feature name]**: [1-2 sentence description of what it does and why it matters]

   ## Improvements
   - **[Area]**: [What got better and how it helps]

   ## Bug Fixes
   - Fixed [issue description in user terms]

   ## Breaking Changes (if any)
   - **Action required**: [What users need to do]
   ```

5. **调整语气**以匹配产品的风格——B2B 产品使用专业语气，面向消费者的产品使用友好语气，API 使用面向开发者的语气。

保存为 Markdown 文档。如果用户需要 HTML 或其他格式，请进行相应转换。