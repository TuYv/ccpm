---
name: jira
description: Use when the user mentions Jira issues (e.g., "PROJ-123"), asks about tickets, wants to create/view/update issues, check sprint status, or manage their Jira workflow. Triggers on keywords like "jira", "issue", "ticket", "sprint", "backlog", or issue key patterns.
---
# Jira

以自然语言方式与 Jira 交互。支持多种后端。

## 后端检测

**请先运行此检查**，以确定应使用哪个后端：

```
1. Check if jira CLI is available:
   → Run: which jira
   → If found: USE CLI BACKEND

2. If no CLI, check for Atlassian MCP:
   → Look for mcp__atlassian__* tools
   → If available: USE MCP BACKEND

3. If neither available:
   → GUIDE USER TO SETUP
```

| 后端 | 使用时机 | 参考文档 |
|---------|-------------|-----------|
| **CLI** | `jira` 命令可用 | `references/commands.md` |
| **MCP** | Atlassian MCP 工具可用 | `references/mcp.md` |
| **无** | 两者均不可用 | 指导用户安装 CLI |

---

## 快速参考（CLI）

> 如果使用 MCP 后端，请跳过本节。

| 意图 | 命令 |
|--------|---------|
| 查看问题 | `jira issue view ISSUE-KEY` |
| 列出我的问题 | `jira issue list -a$(jira me)` |
| 我的进行中问题 | `jira issue list -a$(jira me) -s"In Progress"` |
| 创建问题 | `jira issue create -tType -s"Summary" -b"Description"` |
| 移动/流转 | `jira issue move ISSUE-KEY "State"` |
| 分配给我 | `jira issue assign ISSUE-KEY $(jira me)` |
| 取消分配 | `jira issue assign ISSUE-KEY x` |
| 添加评论 | `jira issue comment add ISSUE-KEY -b"Comment text"` |
| 在浏览器中打开 | `jira open ISSUE-KEY` |
| 当前迭代 | `jira sprint list --state active` |
| 我是谁 | `jira me` |

---

## 快速参考（MCP）

> 如果使用 CLI 后端，请跳过本节。

| 意图 | MCP 工具 |
|--------|----------|
| 搜索问题 | `mcp__atlassian__searchJiraIssuesUsingJql` |
| 查看问题 | `mcp__atlassian__getJiraIssue` |
| 创建问题 | `mcp__atlassian__createJiraIssue` |
| 更新问题 | `mcp__atlassian__editJiraIssue` |
| 获取流转 | `mcp__atlassian__getTransitionsForJiraIssue` |
| 执行流转 | `mcp__atlassian__transitionJiraIssue` |
| 添加评论 | `mcp__atlassian__addCommentToJiraIssue` |
| 用户查询 | `mcp__atlassian__lookupJiraAccountId` |
| 列出项目 | `mcp__atlassian__getVisibleJiraProjects` |

完整的 MCP 模式请参见 `references/mcp.md`。

---

## 触发条件

- “创建一个 jira 工单”
- “给我看看 PROJ-123”
- “列出我的工单”
- “把工单移到已完成”
- “当前迭代里有什么”

---

## 问题键检测

问题键遵循以下模式：`[A-Z]+-[0-9]+`（例如 PROJ-123、ABC-1）。

当用户在对话中提到某个问题键时：
- **CLI：** `jira issue view KEY` 或 `jira open KEY`
- **MCP：** 使用该键调用 `mcp__atlassian__jira_get_issue`

---

## 工作流程

**创建工单：**
1. 如果用户提到了代码/工单/PR，先研究相关上下文
2. 起草工单内容
3. 与用户一起审阅
4. 使用合适的后端创建

**更新工单：**
1. 先获取问题详情
2. 检查状态（对进行中的工单要谨慎）
3. 展示当前内容与拟议变更的对比
4. 更新前先获得批准
5. 添加评论说明所做的变更

---

## 执行任何操作前

问问自己：

1. **当前状态是什么？** —— 始终先获取该问题。不要假设状态、经办人或字段值就是用户以为的那样。

2. **还有谁会受到影响？** —— 检查关注者、关联问题、父 Epic。一次“简单编辑”可能会通知 10 个人。

3. **这个操作可逆吗？** —— 流转可能存在单向门禁。某些工作流要求经过中间状态。对描述的编辑没有撤销功能。

4. **我是否拿到了正确的标识符？** —— 问题键、流转 ID、账户 ID。显示名称无法用于分配（MCP）。

---

## 严禁

- **绝不在未获取当前状态的情况下执行流转** —— 工作流可能要求经过中间状态。如果必须先经过 "In Progress"，"To Do" → "Done" 可能会静默失败。

- **绝不使用显示名称进行分配（MCP）** —— 只有账户 ID 才有效。务必先调用 `lookupJiraAccountId`，否则分配会静默失败。

- **绝不在未展示原始内容的情况下编辑描述** —— Jira 没有撤销功能。用户必须看到自己要替换的内容。

- **绝不在缺少所有必填字段时使用 `--no-input`（CLI）** —— 会静默失败并报出晦涩难懂的错误。请先检查项目的必填字段。

- **绝不假设流转名称是通用的** —— "Done"、"Closed"、"Complete" 因项目而异。务必先获取可用的流转。

- **绝不在没有明确批准的情况下批量修改** —— 每次工单变更都会通知关注者。10 次编辑 = 10 场通知风暴。

---

## 安全性

- 运行前始终先展示命令/工具调用
- 修改工单前务必获得批准
- 编辑时保留原始信息
- 应用更新后进行验证
- 始终清晰地呈现认证问题，以便用户自行解决

---

## 无可用后端

如果 CLI 和 MCP 均不可用，请引导用户：

```
To use Jira, you need one of:

1. **jira CLI** (recommended):
   https://github.com/ankitpokhrel/jira-cli

   Install: brew install ankitpokhrel/jira-cli/jira-cli
   Setup:   jira init

2. **Atlassian MCP**:
   Configure in your MCP settings with Atlassian credentials.
```

---

## 深入指南

**在以下情况加载参考文档：**
- 创建包含复杂字段或多行内容的问题
- 构建超出简单过滤条件的 JQL 查询
- 排查错误或认证问题
- 处理流转、问题链接或迭代相关操作

**在以下情况不要加载参考文档：**
- 简单的查看/列表操作（上面的快速参考已足够）
- 基本的状态检查（`jira issue view KEY`）
- 在浏览器中打开问题

| 任务 | 是否加载参考文档？ |
|------|-----------------|
| 查看单个问题 | 否 |
| 列出我的工单 | 否 |
| 创建带描述的问题 | **是** —— CLI 需要 `/tmp` 模式 |
| 流转问题 | **是** —— 需要流转 ID 工作流 |
| JQL 搜索 | **是** —— 用于复杂查询 |
| 链接问题 | **是** —— MCP 存在限制，需要脚本 |

参考资料：
- CLI 模式：`references/commands.md`
- MCP 模式：`references/mcp.md`
