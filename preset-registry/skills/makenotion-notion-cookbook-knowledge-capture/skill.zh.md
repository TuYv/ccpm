---
name: notion-knowledge-capture
description: Transforms conversations and discussions into structured documentation pages in Notion. Captures insights, decisions, and knowledge from chat context, formats appropriately, and saves to wikis or databases with proper organization and linking for easy discovery.
---
# 知识沉淀

将对话、讨论和见解转化为 Notion 工作区中的结构化文档。从聊天上下文中提取知识，以适当的格式进行整理，并将其保存到正确的位置，同时做好组织和链接。

## 快速开始

当被要求将信息保存到 Notion 时：

1. **提取内容**：识别对话上下文中的关键信息
2. **组织信息**：将信息整理为适当的文档格式
3. **确定位置**：使用 `Notion:notion-search` 查找合适的 Wiki 页面/数据库
4. **创建页面**：使用 `Notion:notion-create-pages` 保存内容
5. **确保易于发现**：从相关中心页面添加链接、将其添加到数据库，或更新 Wiki 导航，以便其他人能够找到它

## 知识沉淀工作流

### 步骤 1：识别要沉淀的内容

```
From conversation context, extract:
- Key concepts and definitions
- Decisions made and rationale
- How-to information and procedures
- Important insights or learnings
- Q&A pairs
- Examples and use cases
```

### 步骤 2：确定内容类型

```
Classify the knowledge:
- Concept/Definition
- How-to Guide
- Decision Record
- FAQ Entry
- Meeting Summary
- Learning/Post-mortem
- Reference Documentation
```

### 步骤 3：组织内容

```
Format appropriately based on content type:
- Use templates for consistency
- Add clear headings and sections
- Include examples where helpful
- Add relevant metadata
- Link to related pages
```

### 步骤 4：确定目标位置

```
Where to save:
- Wiki page (general knowledge base)
- Specific project page (project-specific knowledge)
- Documentation database (structured docs)
- FAQ database (questions and answers)
- Decision log (architecture/product decisions)
- Team wiki (team-specific knowledge)
```

### 步骤 5：创建页面

```
Use Notion:notion-create-pages:
- Set appropriate title
- Use structured content from template
- Set properties if in database
- Add tags/categories
- Link to related pages
```

### 步骤 6：确保内容易于发现

```
Link the new page so others can find it:

1. Update hub/index pages:
   - Add link to wiki table of contents page
   - Add link from relevant project page
   - Add link from category/topic page (e.g., "Engineering Docs")

2. If page is in a database:
   - Set appropriate tags/categories
   - Set status (e.g., "Published")
   - Add to relevant views

3. Optionally update parent page:
   - If saved under a project, add to project's "Documentation" section
   - If in team wiki, ensure it's linked from team homepage

Example:
Notion:notion-update-page
page_id: "team-wiki-homepage-id"
command: "insert_content_after"
selection_with_ellipsis: "## How-To Guides..."
new_str: "- <mention-page url='...'>How to Deploy to Production</mention-page>"
```

此步骤可确保知识不会成为“孤立页面”——它会正确连接到工作区的导航结构中。

## 内容类型

根据内容选择适当的结构：

**概念**：概述 → 定义 → 特征 → 示例 → 使用场景 → 相关内容  
**操作指南**：概述 → 前置条件 → 步骤（编号）→ 验证 → 故障排除 → 相关内容  
**决策**：背景 → 决策 → 理由 → 考虑过的选项 → 后果 → 实施  
**常见问题**：简短回答 → 详细说明 → 示例 → 何时使用 → 相关问题  
**经验总结**：发生了什么 → 哪些方面做得好 → 哪些方面做得不好 → 根本原因 → 经验教训 → 行动

## 目标位置模式

**通用 Wiki**：独立页面 → 添加到索引 → 添加标签 → 从相关页面链接

**项目 Wiki**：作为项目页面的子页面 → 从项目概述链接 → 使用项目名称作为标签

**文档数据库**：使用属性（标题、类型、类别、标签、最后更新时间、负责人）

**决策日志数据库**：使用属性（决策、日期、状态、领域、决策者、影响）

**常见问题数据库**：使用属性（问题、类别、标签、最后审查时间、有用次数）

有关数据库选择指南和各个架构文件，请参阅 [reference/database-best-practices.md](reference/database-best-practices.md)。

## 从对话中提取内容

**聊天讨论**：要点、结论、资源、行动项、问答

**问题解决**：问题陈述、尝试过的方法、解决方案、奏效原因、未来注意事项

**知识分享**：所讲解的概念、示例、最佳实践、常见误区、资源

**决策讨论**：问题、选项、权衡、决策、理由、后续步骤

## 格式最佳实践

**结构**：始终如一地使用 `#`（标题）、`##`（章节）、`###`（子章节）

**写作**：以概述开篇，使用项目符号，保持段落简短，并添加示例

**链接**：链接相关页面、提及人员、引用资源，并创建双向链接

**元数据**：包括日期、作者、标签、状态

**可搜索性**：清晰的标题、自然关键词、常用搜索标签、图片替代文本

## 索引与组织

**Wiki 索引**：按章节组织（入门指南、操作指南、参考资料、常见问题、决策），并提供页面链接

**分类页面**：创建包含概述、文档链接和近期更新的入口页面

**标签策略**：针对技术/工具、主题、受众和状态使用一致的标签

## 更新管理

**新建内容**：内容充实（>2 个段落）、将被多次引用、属于知识库的一部分、需要能够被独立发现

**更新现有内容**：向现有主题添加内容、纠正信息、扩展概念、根据变化进行更新

**版本管理**：针对重大变更添加更新历史章节（日期、作者、变更内容、变更原因）

## 最佳实践

1. **及时记录**：趁上下文仍清晰时编写文档
2. **保持结构一致**：对类似内容使用模板
3. **广泛链接**：关联相关知识
4. **为便于发现而写作**：使用易于搜索的标题和标签
5. **包含上下文**：说明为何重要、何时使用
6. **添加示例**：具体示例有助于理解
7. **持续维护**：定期审查和更新
8. **获取反馈**：询问文档是否有帮助

## 高级功能

**文档数据库**：有关数据库模式，请参阅 [reference/database-best-practices.md](reference/database-best-practices.md)。

## 常见问题

**“不确定保存在哪里”**：默认保存到通用 Wiki，之后可以移动  
**“内容零散”**：将相关片段整理成连贯的文档  
**“内容已存在”**：先搜索，并在适当时更新现有内容  
**“过于口语化”**：在保留见解的同时润色语言

## 示例

有关完整工作流，请参阅 [examples/](examples/)：

- [examples/conversation-to-faq.md](examples/conversation-to-faq.md) - 根据问答创建常见问题解答
- [examples/decision-capture.md](examples/decision-capture.md) - 决策记录
- [examples/how-to-guide.md](examples/how-to-guide.md) - 根据讨论创建操作指南