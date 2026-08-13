---
name: "atlassian-templates"
description: Atlassian Template and Files Creator/Modifier expert for creating, modifying, and managing Jira and Confluence templates, blueprints, custom layouts, reusable components, and standardized content structures. Use when building org-wide templates, custom blueprints, page layouts, and automated content generation.
---
# Atlassian 模板与文件创建专家

专注于为 Jira 和 Confluence 创建、修改和管理可复用的模板与文件。确保一致性、加速内容创建，并维护组织范围内的标准。

---

## 工作流

### 模板创建流程
1. **调研**：访谈利益相关者以了解需求
2. **分析**：审查现有内容模式
3. **设计**：创建模板结构和占位符
4. **实施**：使用宏和格式构建模板
5. **测试**：使用示例数据进行验证——发布前确认模板可在预览中正确呈现
6. **文档化**：创建使用说明
7. **发布**：通过 MCP 部署到适当的空间/项目（参见下方的 MCP 操作）
8. **验证**：确认部署成功；如果发生错误，则回滚到先前版本
9. **培训**：指导用户如何使用模板
10. **监控**：跟踪采用情况并收集反馈
11. **迭代**：根据使用情况进行优化

### 模板修改流程
1. **评估**：审查变更请求及其影响
2. **版本管理**：创建新版本，同时保留旧版本
3. **修改**：更新模板结构/内容
4. **测试**：验证变更不会破坏现有用法；发布前预览更新后的模板
5. **迁移**：为现有内容提供迁移路径
6. **沟通**：向用户公布变更
7. **支持**：协助用户完成迁移
8. **归档**：过渡完成后弃用旧版本；确认已弃用的模板不再列出，而不是被删除

### 蓝图开发
1. 定义蓝图的范围和用途
2. 设计多页面结构
3. 为每个部分创建页面模板
4. 配置页面创建规则
5. 添加动态内容（Jira 查询、用户数据）
6. 使用示例空间对蓝图创建流程进行端到端测试
7. 部署前验证所有宏引用均可正确解析
8. **移交给**：Atlassian 管理员进行全局部署

---

## Confluence 模板库

有关模板设计模式，请参阅 `references/template-design-patterns.md`；有关治理模型，请参阅 `references/governance-framework.md`。如需可直接部署的存储格式标记，请使用随附的脚手架工具（参见下方的[模板脚手架工具](#template-scaffolder-generate-storage-format-markup)）。以下汇总了此技能创建和维护的标准类型。

### Confluence 模板类型
| 模板 | 用途 | 使用的主要宏 |
|----------|---------|-----------------|
| **会议记录** | 包含议程、决策和行动项的结构化会议记录 | `{date}`, `{tasks}`, `{panel}`, `{info}`, `{note}` |
| **项目章程** | 组织级项目范围、利益相关者 RACI、时间线和预算 | `{panel}`, `{status}`, `{timeline}`, `{info}` |
| **Sprint 回顾** | 包含“做得好的方面”/“做得不好的方面”/“行动项”的敏捷仪式模板 | `{panel}`, `{expand}`, `{tasks}`, `{status}` |
| **PRD** | 包含目标、用户故事、功能性/非功能性需求和发布计划的功能定义 | `{panel}`, `{status}`, `{jira}`, `{warning}` |
| **决策日志** | 包含决策矩阵和实施跟踪的结构化选项分析 | `{panel}`, `{status}`, `{info}`, `{tasks}` |

所有 Confluence 模板均包含的**标准章节**：
- 包含元数据（负责人、日期、状态）的页眉面板
- 带有内联占位说明且标签清晰的内容章节
- 使用 `{tasks}` 宏的行动项区块
- 相关链接和参考资料

### 完整示例：会议记录模板

> **格式警告**：以下示例采用**旧版 Wiki 标记语言**（`{panel}`、`h2.`、`{tasks}`），仅为便于人工阅读而展示。Wiki 标记语言并非 Confluence 存储格式，且**会被** `mcp__atlassian__createConfluencePage` / `updateConfluencePage` **拒绝**；这两个工具要求使用存储格式（XHTML、`<ac:structured-macro>` 元素）或 ADF。要获取可直接部署的等效存储格式，请运行脚手架工具：`python3 scripts/template_scaffolder.py meeting-notes`（参见[模板脚手架工具](#template-scaffolder-generate-storage-format-markup)）。

```
{panel:title=Meeting Metadata|borderColor=#0052CC|titleBGColor=#0052CC|titleColor=#FFFFFF}
*Date:* {date}
*Owner / Facilitator:* @[facilitator name]
*Attendees:* @[name], @[name]
*Status:* {status:colour=Yellow|title=In Progress}
{panel}

h2. Agenda
# [Agenda item 1]
# [Agenda item 2]
# [Agenda item 3]

h2. Discussion & Decisions
{panel:title=Key Decisions|borderColor=#36B37E|titleBGColor=#36B37E|titleColor=#FFFFFF}
* *Decision 1:* [What was decided and why]
* *Decision 2:* [What was decided and why]
{panel}

{info:title=Notes}
[Detailed discussion notes, context, or background here]
{info}

h2. Action Items
{tasks}
* [ ] [Action item] — Owner: @[name] — Due: {date}
* [ ] [Action item] — Owner: @[name] — Due: {date}
{tasks}

h2. Next Steps & Related Links
* Next meeting: {date}
* Related pages: [link]
* Related Jira issues: {jira:key=PROJ-123}
```

> 其他内置类型（decision-log、runbook、project-kickoff）的存储格式示例可通过 `python3 scripts/template_scaffolder.py --list` 获取；其余类型（项目章程、Sprint 回顾、PRD）的设计模式位于 `references/template-design-patterns.md` 中。

---

## Jira 模板库

### Jira 模板类型
| 模板 | 用途 | 关键章节 |
|----------|---------|--------------|
| **用户故事** | 采用“作为 / 我想要 / 以便”格式的功能请求 | 验收标准（假定/当/那么）、设计链接、技术说明、完成定义 |
| **缺陷报告** | 通过复现步骤记录缺陷 | 环境、复现步骤、预期行为与实际行为、严重程度、临时解决方案 |
| **Epic** | 高层级计划范围 | 愿景、目标、成功指标、故事拆分、依赖项、时间线 |

所有 Jira 模板均包含的**标准章节**：
- 清晰的摘要行
- 以复选框形式呈现的验收标准或成功标准
- 相关问题和依赖项区块
- 完成定义（适用于故事）

---

## 宏使用指南

**动态内容**：使用宏实现自动更新的内容（日期、用户提及、Jira 查询）
**视觉层级**：使用 `{panel}`、`{info}` 和 `{note}` 创建视觉区分
**交互性**：在较长的模板中使用 `{expand}` 创建可折叠章节
**集成**：通过 `{jira}` 宏嵌入 Jira 图表和表格，以展示实时数据

---

## 模板脚手架 — 生成存储格式标记

随附的脚手架会生成 **Confluence 存储格式 XHTML** — 即 `createConfluencePage`/`updateConfluencePage` 所接受的准确正文格式。它是此技能的规范部署路径：

```bash
# List available template types (meeting-notes, decision-log, runbook, project-kickoff, custom)
python3 scripts/template_scaffolder.py --list

# Generate a template body (storage-format XHTML)
python3 scripts/template_scaffolder.py meeting-notes

# Custom template with chosen sections and macros, JSON output for programmatic use
python3 scripts/template_scaffolder.py custom --sections "Overview,Goals,Action Items" --macros "toc,status,info" --format json
```

使用输出：提取 `CONFLUENCE STORAGE FORMAT MARKUP` 块（文本模式）或 markup 字段（JSON 模式），并将其原样作为 `mcp__atlassian__createConfluencePage` 的 `body` 传入。之后通过 Confluence UI 应用建议的标签（MCP 上没有标签工具）。

## Atlassian MCP 集成

**主要工具**：Atlassian Remote MCP 服务器（随附 `.mcp.json`，服务器键为 `atlassian`）。工具以 `mcp__atlassian__<toolName>`（camelCase）的形式提供。**规范工具列表**：`project-management/references/atlassian-mcp-tools.md`。绝不要虚构工具名称 — 如果某项功能不在该列表中，就无法通过 MCP 使用；请改用 Web UI 或 REST API。

### 通过 MCP 执行模板操作

首先通过 `mcp__atlassian__getAccessibleAtlassianResources` 获取一次 `cloudId`。将尖括号占位符替换为实际值；调用时从每个工具的 schema 中查明准确的参数名称。

**创建 Confluence 模板页面**（正文来自上述脚手架）：
```
mcp__atlassian__createConfluencePage (cloudId, space, title="Template: Meeting Notes",
  body=<storage-format XHTML from template_scaffolder.py>, parent page id optional)
```
标签（`template`、`meeting-notes`）必须在 Confluence UI 中应用 — MCP 没有标签工具。

**更新现有模板页面**（先读取以获取当前版本）：
```
mcp__atlassian__getConfluencePage (cloudId, pageId=<existing page id>)
mcp__atlassian__updateConfluencePage (cloudId, pageId=<id>, version=<current + 1>,
  body=<updated storage-format content>)
```

**Jira 议题描述模板**：**没有用于字段配置的 MCP 工具**（描述字段的 `default_value`、界面、字段上下文）。请在 Jira 管理 UI（`Settings > Issues > Field configurations`）中配置描述默认值，或通过 REST（`/rest/api/3/fieldconfiguration`）进行配置。MCP 可以执行的操作：通过 `mcp__atlassian__createJiraIssue` 创建预先填入模板文本的议题（将模板正文作为描述传入），以及使用 `mcp__atlassian__getJiraIssueTypeMetaWithFields` 检查各议题类型的必填字段。

**一等 Confluence 模板/蓝图**同样**无法通过 MCP 创建** — `createConfluencePage` 创建的是可用作复制源模板的普通页面。要注册真正的空间模板，请使用 UI 中的 `Space settings > Templates`。

**将模板页面部署到多个空间（批量）：**
```
# Repeat per target space:
mcp__atlassian__createConfluencePage (cloudId, space=<target>, title="Template: Meeting Notes", body=<storage-format content>)
# Verify each create before proceeding:
mcp__atlassian__getConfluencePage (cloudId, pageId=<id returned by create>)
# Assert the returned body is non-empty and contains the expected <ac:structured-macro> elements
```

**部署后的验证检查点：**
- 通过 `mcp__atlassian__getConfluencePage` 检索已创建/更新的页面，并确认其渲染时没有宏错误
- 检查 Jira 宏嵌入内容能否针对目标 Jira 项目正确解析
- 确认任务块在已发布的视图中可交互
- 如果任何检查失败：使用 `mcp__atlassian__updateConfluencePage` 回滚，其中 `version: <current + 1>`，正文使用上一版本的内容

---

## 最佳实践与治理

**组织特定标准：**
- 在页面页眉中使用版本说明跟踪模板版本
- 在归档前使用 `{warning}` 横幅标记过时模板；进行归档（不要删除）
- 维护从每个模板链接的使用指南
- 按季度评审周期收集反馈；在弃用前纳入使用情况指标

**质量关卡（每次部署前均需执行）：**
- 为每个部分提供示例内容
- 使用示例数据在预览中进行测试
- 在变更日志中添加版本注释
- 建立反馈机制（启用评论或链接调查问卷）

**治理流程**：
1. 请求与理由
2. 设计与评审
3. 与试点用户一起测试
4. 文档编写
5. 审批
6. 部署（通过 MCP 或手动）
7. 培训
8. 监控

---

## 交接协议

交接摘要（治理背景见 `references/governance-framework.md`）：

| 合作方 | 接收内容 | 发送内容 |
|---------|--------------|---------|
| **高级产品经理** | 模板需求、报告模板、高管格式 | 已完成的模板、使用情况分析、优化建议 |
| **Scrum Master** | 冲刺仪式需求、团队特定请求、回顾会议格式偏好 | 可用于冲刺的模板、敏捷仪式结构、速率跟踪模板 |
| **Jira 专家** | 事务模板需求、自定义字段显示需求 | 事务描述模板、字段配置模板、JQL 查询模板 |
| **Confluence 专家** | 空间特定需求、全局模板请求、蓝图需求 | 已配置的页面模板、蓝图结构、部署计划 |
| **Atlassian 管理员** | 组织级标准、全局部署要求、合规模板 | 待审批的全局模板、使用情况报告、合规状态 |