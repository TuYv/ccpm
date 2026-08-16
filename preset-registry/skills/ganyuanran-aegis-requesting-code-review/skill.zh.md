---
name: requesting-code-review
description: "Use when requesting independent code review, after implementation slices, before merging high-risk work, or when verification exposes evidence, baseline, architecture, compatibility, or retirement uncertainty."
---
# 请求代码审查

使用规范的 `code-reviewer.md` 模板派发一个审查者子代理，以便在问题连锁扩大之前将其发现。审查者会获得经过精准组织的评估上下文，而绝不会获得你当前会话的历史记录。这能让审查者专注于工作产物，而不是你的思考过程，同时保留你自己的上下文以便继续工作。

本技能是方法包实现工作的规范审查请求工作流。仅当你已掌握足够的证据和上下文，并且明确了审查者受托评估内容的权限边界后，才使用本技能请求审查。

**核心原则：** 尽早审查，频繁审查。

**发现优先：** 审查应先列出具体发现，再给出总结。先说缺陷，先说风险，先说测试。优点和总体评价仍然有用，但不得掩盖正确性、证据、架构或退役方面的问题。

已具备审查条件并不等同于获准合并。审查可以减少不确定性并建议是否已准备就绪，但它不能取代 `verification-before-completion`，也不会授予完成权限。

## 何时请求审查

**强制：**
- 在子代理驱动开发中的每项任务完成后
- 在完成重大功能后
- 在合并到主分支之前

**可选但有价值：**
- 遇到阻碍时（获得全新视角）
- 重构之前（进行基线检查）
- 修复复杂缺陷之后

## 必需输出

在结束此工作流之前，你必须能够说明：

1. **正在审查的确切范围是什么**
2. **由哪项计划、需求或契约定义成功标准**
3. **由哪项产品/需求基线定义已接受的行为和非目标**
4. **由哪项架构/运行时边界基线定义预期的架构状态**
5. **目前已有哪些最新证据**
6. **仍须维持哪项兼容性边界**
7. **哪些旧所有者/回退机制/补丁会保留、缩减或退役**
8. **审查者必须具体验证什么**
9. **审查者是仅提供建议性审查，还是还会给出更高层级的合并建议**
10. **Aegis 可见性**：为什么发现优先的排序、证据充分性、基线一致性、兼容性或退役风险对本次审查请求很重要
11. **语义上下文范围**：本次审查必须保留哪些相关的规范术语、已弃用别名或公共命名边界

本方法包中的审查以建议和证据为导向，其本身不具有权威性的完成判定效力。

## 如何请求

**1. 收集最低限度的审查输入：**

- 实现了什么
- 它应符合哪项需求/计划/规范/ADR
- 此差异必须与哪些基线/当前权威文档保持一致，包括需求/产品一致性以及架构/当前权威一致性
- 目前已有哪些证据（测试、命令、日志、截图、差异摘要）
- 哪项兼容性边界或风险值得审查者关注
- 是否存在任何应当退役的旧路径、回退机制、重复所有者或临时补丁
- 此差异是否包含需要进行 ADR 自动回填或给出基线同步发现的持久性架构决策
- 当 ADR 操作或基线同步闭环属于范围之内时，是否已使用或应当使用 `recording-architecture-decisions`
- 当公共/领域命名属于范围之内时，相关且处于活跃状态的 `CONTEXT.md` 表述；被动阅读不会加载活跃建模

如果你无法回答这些问题，请停止并先收集相关信息，然后再派发审查任务。

**2. 定义 Git 审查范围：**
```bash
# Before the coordinator's task commit
REVIEW_SCOPE=working-tree
BASE_SHA=$(git rev-parse HEAD)

# Or for already committed work
REVIEW_SCOPE=committed-range
BASE_SHA=<known-start>
HEAD_SHA=$(git rev-parse HEAD)
```

对于工作树审查，请明确标识任务所拥有的未跟踪路径。不要仅仅为了让审查者看到它们而执行暂存操作。

**3. 派发审查子智能体：**

使用 Task 工具调用通用审查子智能体。填写位于 `requesting-code-review/code-reviewer.md` 的规范模板；不要依赖单独的具名智能体提示词。

**占位符：**
- `{WHAT_WAS_IMPLEMENTED}` - 你刚刚构建的内容
- `{PLAN_OR_REQUIREMENTS}` - 它应该实现的功能
- `{EVIDENCE}` - 已有的最新测试、命令、日志或验证结果
- `{COMPATIBILITY_BOUNDARY}` - 不得破坏的现有行为或接口
- `{RETIREMENT_NOTES}` - 旧的负责方 / 回退方案 / 补丁 / 重复分支及其预期处置方式
- `{REVIEW_SCOPE}` - `working-tree` 或 `committed-range`
- `{BASE_SHA}` - 起始提交
- `{HEAD_SHA}` - 结束提交，或 `WORKTREE`
- `{DESCRIPTION}` - 简要总结

**4. 根据反馈采取行动：**
- 立即修复严重问题
- 在继续之前修复重要问题
- 记录次要问题，供后续处理
- 如果审查者有误，请提出异议（并说明理由）
- 如果反馈暴露出证据缺口，请执行缺失的验证，而不是凭信心争辩
- 如果反馈暴露出设计缺陷 / 实现偏移、陈旧逻辑，或架构偏移之类的旧别名，请明确决定是立即修复、修正基线，还是记录弃用条件

## 示例

```
[Just completed Task 2: Add verification function]

You: Let me request code review before proceeding.

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Dispatch reviewer subagent using requesting-code-review/code-reviewer.md]
  WHAT_WAS_IMPLEMENTED: Verification and repair functions for conversation index
  PLAN_OR_REQUIREMENTS: Task 2 from docs/aegis/plans/deployment-plan.md
  EVIDENCE: pytest tests/index/test_verify.py -v -> 12 passed
  COMPATIBILITY_BOUNDARY: Existing index format and CLI flags must remain stable
  RETIREMENT_NOTES: Legacy repair fallback still exists in old helper; remove once new path covers all four issue types
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661
  DESCRIPTION: Added verifyIndex() and repairIndex() with 4 issue types

[Subagent returns]:
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready to proceed

You: [Fix progress indicators]
[Continue to Task 3]
```

## 与工作流集成

**子智能体驱动开发：**
- 每项任务完成后都进行审查
- 在问题累积之前发现它们
- 修复后再继续下一项任务

**执行计划：**
- 每批任务（3 项）完成后进行审查
- 获取反馈、应用修改，然后继续

**临时开发：**
- 合并前审查
- 遇到阻碍时审查

## 审查者必须检查的内容

审查请求必须提示审查者至少检查以下内容：

- 发现优先：错误优先、风险优先、测试优先
- 证据是否充分
- 基线与当前权威依据是否一致
- 需求/产品是否与已接受的问题、成功证据和非目标一致
- 架构是否与当前权威依据一致，包括所有者、契约、事实来源、兼容性和退役边界
- Design Defect / Implementation Drift 分类，并包含 `scope: requirements | architecture | both`
- 旧有表述映射：baseline defect、architecture defect 和 architecture drift 必须映射回 Design Defect / Implementation Drift，而不能成为并行的结果术语体系
- 所有者重复的风险
- 兼容性边界
- 对于持久性架构决策，缺少 ADR Auto Backfill 或基线同步发现项
- 当 ADR 操作或基线同步闭环属于范围内时，缺少向 `recording-architecture-decisions` 的移交
- 未经验证的声明或缺失的证明
- 应当退役、暂时保留或最终收敛的旧逻辑
- 公共名称漂移、已弃用术语重新引入，或者在代码/文档中记录了语义变更却未组合使用 `establishing-project-context`

如果审查只问“这段代码好吗？”，那么其要求不够明确。

## 危险信号

**绝不要：**
- 因为“这很简单”而跳过审查
- 忽略 Critical 问题
- 在 Important 问题尚未修复时继续推进
- 与有效的技术反馈争辩
- 将审查者批准视为等同于权威性完成
- 在未说明已有证据的情况下请求审查
- 添加新逻辑却不告知审查者旧路径将如何处理

**如果审查者有误：**
- 以技术论证提出异议
- 展示能够证明其有效的代码/测试
- 请求澄清

## 审查边界

- 审查可以就合并就绪度、残余风险和后续工作提出建议
- 审查本身不能授予权威性完成状态
- 审查应减少不确定性，而不是掩盖不确定性

模板见：requesting-code-review/code-reviewer.md