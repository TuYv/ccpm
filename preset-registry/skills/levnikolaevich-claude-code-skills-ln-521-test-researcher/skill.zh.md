---
name: ln-521-test-researcher
description: "Researches real-world problems, competitor solutions, and customer complaints for a feature domain. Use before test planning to ground tests in actual user pain points."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

## 输入

| 输入 | 必填 | 来源 | 描述 |
|-------|----------|--------|-------------|
| `storyId` | 是 | 参数、Git 分支、看板、用户 | 要处理的 Story |

**解析方式：** Story 解析链。
**状态筛选器：** To Review

# 测试研究员

**类型：** L3 Worker

在制定测试计划之前，研究现实问题和边界情况，确保测试覆盖用户的实际痛点，而不仅仅是 AC。

## 目的与范围
- 使用 Web Search、MCP Ref、Context7 研究该功能领域的常见问题。
- 分析竞争对手如何解决同类问题。
- 从论坛、StackOverflow、Reddit 中查找客户投诉和痛点。
- 将结构化的研究结果作为跟踪器评论（`addComment`）发布，供后续测试规划步骤使用。
- 不创建测试，也不更改状态。

## 何时使用

应在以下情况下使用此技能：
- 在需要功能领域相关证据时，于测试规划工作流开始阶段使用
- Story 包含非简单功能（外部 API、文件格式、身份验证）
- 需要发现 AC 之外的边界情况

**在以下情况下跳过研究：**
- Story 很简单（简单 CRUD，无外部依赖）
- Story 中已存在研究评论
- 用户明确要求跳过

## 工作流

### 阶段 1：发现

**必须阅读：** 加载 `references/input_resolution_pattern.md`

1. **解析 storyId：** 按照指南运行 Story 解析链（状态筛选器：[To Review]）。

2. 从 `docs/tasks/kanban_board.md` 自动发现 Team ID

### 阶段 2：提取功能领域

1) 通过已配置的跟踪器提供方获取 Story（`getStory`）
2) 解析 Story 目标和 AC，以确定：
   - 涉及哪些技术/API/格式？
   - 用户的目标是什么？（例如，“翻译 XLIFF 文件”“通过 OAuth 进行身份验证”）
3) 提取用于研究查询的关键词

### 阶段 3：研究常见问题

使用可用工具查找现实问题：

1) **Web Search：**
   - “[功能] 常见问题”
   - “[格式] 边界情况”
   - “[API] 易踩坑点”
   - “[技术] 已知问题”

2) **MCP Ref：**
   - `ref_search_documentation("[feature] error handling best practices")`
   - `ref_search_documentation("[format] validation rules")`

3) **Context7：**
   - 查询相关库的文档以了解已知问题
   - 检查 API 文档中的限制

### 阶段 4：研究竞争对手的解决方案

1) **Web Search：**
   - “[竞争对手] [功能] 如何运作”
   - “[功能] 对比”
   - “[产品类型] 最佳实践”

2) **分析：**
   - 市场领导者如何处理此功能？
   - 他们使用哪些 UX 模式？
   - 常见的错误处理方法有哪些？

### 阶段 5：研究客户投诉

1) **Web Search：**
   - “[功能] 投诉”
   - “[产品类型] 用户问题”
   - “[格式] 问题 reddit”
   - “[格式] 问题 stackoverflow”

2) **分析：**
   - 用户实际遇到哪些困难？
   - 常见的挫折有哪些？
   - 用户期望与典型实现之间存在哪些差距？

### 阶段 6：汇总并发布研究结果

1) **汇总研究结果**并按以下类别分类：
   - **输入验证问题**（格式错误的数据、编码、大小限制）
   - **边界情况**（空输入、特殊字符、Unicode）
   - **错误处理**（超时、速率限制、部分失败）
   - **安全隐患**（注入、身份验证绕过）
   - **竞争对手优势**（我们应达到或超越的功能）
   - **客户痛点**（用户实际抱怨的问题）

2) 在 Story 上**发布跟踪器评论**（`addComment`），其中包含研究摘要：

```markdown
## Test Research: {Feature}

### Sources Consulted
- [Source 1](url)
- [Source 2](url)

### Common Problems Found
1. **Problem 1:** Description + test case suggestion
2. **Problem 2:** Description + test case suggestion

### Competitor Analysis
- **Competitor A:** How they handle this + what we can learn
- **Competitor B:** Their approach + gaps we can exploit

### Customer Pain Points
- **Complaint 1:** What users struggle with + test to prevent
- **Complaint 2:** Common frustration + how to verify we solve it

### Recommended Test Coverage
- [ ] Test case for problem 1
- [ ] Test case for competitor parity
- [ ] Test case for customer pain point

---
_This research informs both manual tests (ln-522) and automated tests (ln-523)._
```

## 关键规则

- **不得创建测试：**仅进行研究和编写文档。
- **不得更改状态：**仅发布跟踪器评论。
- **注明来源：**始终包含所参考来源的 URL。
- **研究结果应可执行：**每个问题都应建议一个测试用例。
- **跳过简单的 Story：**不要研究“向页面添加按钮”之类的 Story。

## 运行时摘要工件

**必须阅读：**加载 `references/test_planning_summary_contract.md`、`references/test_planning_worker_runtime_contract.md`

运行时配置：
- 系列：`test-planning-worker`
- 工作进程：`ln-521`
- 摘要类型：`test-planning-worker`
- 协调器使用的有效载荷字段：`worker`、`status`、`warnings`、`research_comment_path`

调用规则：
- 独立运行：省略 `runId` 和 `summaryArtifactPath`
- 托管运行：同时传递 `runId` 和准确的 `summaryArtifactPath`
- 始终在产生最终结果之前写入已验证的摘要

## 完成标准

- [ ] 已从 Story 中提取功能领域（已确定技术/API/格式）
- [ ] 已研究常见问题（Web Search + MCP Ref + Context7）
- [ ] 已分析竞争对手的解决方案（至少 1-2 个竞争对手）
- [ ] 已找到客户投诉（论坛、StackOverflow、Reddit）
- [ ] 已将研究结果汇总并分类
- [ ] 已发布包含“## Test Research: {Feature}”标题的跟踪器评论
- [ ] 已建议至少 3 个测试用例

**输出：**包含研究结果的跟踪器评论，供 ln-522 和 ln-523 使用。

## 参考文件

- 研究方法：Web Search、MCP Ref、Context7 工具
- 评论格式：包含来源的结构化 Markdown
- 下游使用方：ln-522-manual-tester、ln-523-auto-test-planner
- **必须阅读：**加载 `references/research_tool_fallback.md`

---

**版本：** 1.0.0
**最后更新：** 2026-01-15