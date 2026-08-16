---
name: qa
description: Interactive QA session where user reports bugs or issues conversationally, and the agent files GitHub issues. Explores the codebase in the background for context and domain language. Use when user wants to report bugs, do QA, file issues conversationally, or mentions "QA session".
---
# QA 会话

运行一次交互式 QA 会话。用户描述他们遇到的问题。你需要进行澄清、探索代码库以了解上下文，并创建持久、以用户为中心且使用项目领域语言的 GitHub issue。

## 针对用户提出的每个问题

### 1. 倾听并进行简单澄清

让用户用自己的话描述问题。提出**最多 2-3 个简短的澄清问题**，重点关注：

- 他们的预期结果与实际发生的情况
- 重现步骤（如果并不明显）
- 问题是持续发生还是偶发

不要过度询问。如果描述已经足够清楚，可以直接创建 issue，就继续下一步。

### 2. 在后台探索代码库

在与用户交谈的同时，在后台启动一个 Agent（subagent_type=Explore），以了解相关区域。目标不是寻找修复方案，而是：

- 了解该区域使用的领域语言（查看 UBIQUITOUS_LANGUAGE.md）
- 理解该功能应当如何运行
- 识别面向用户的行为边界

这些上下文有助于你编写更好的 issue，但 issue 本身不应引用具体文件、行号或内部实现细节。

### 3. 评估范围：单个 issue 还是拆分？

创建 issue 前，判断这是一个**单独的 issue**，还是需要**拆分**为多个 issue。

在以下情况下进行拆分：

- 修复涉及多个相互独立的区域（例如，“表单验证有误，并且成功消息缺失，而且重定向也失效”）
- 存在可以由不同人员并行处理、界限清晰且可分离的问题
- 用户描述的问题包含多个不同的失败模式或症状

在以下情况下保留为单个 issue：

- 某个位置的一项行为不正确
- 所有症状都由同一个根本行为引起

### 4. 创建 GitHub issue

使用 `gh issue create` 创建 issue。不要先让用户审核，直接创建并分享 URL。

Issue 必须具有**持久性**，即使经过重大重构后仍然有意义。应从用户的角度编写。

#### 对于单个 issue

使用此模板：

```
## What happened

[Describe the actual behavior the user experienced, in plain language]

## What I expected

[Describe the expected behavior]

## Steps to reproduce

1. [Concrete, numbered steps a developer can follow]
2. [Use domain terms from the codebase, not internal module names]
3. [Include relevant inputs, flags, or configuration]

## Additional context

[Any extra observations from the user or from codebase exploration that help frame the issue — e.g. "this only happens when using the Docker layer, not the filesystem layer" — use domain language but don't cite files]
```

#### 对于拆分（多个 issue）

按依赖顺序创建 issue（阻塞项优先），以便引用真实的 issue 编号。

对每个子 issue 使用此模板：

```
## Parent issue

#<parent-issue-number> (if you created a tracking issue) or "Reported during QA session"

## What's wrong

[Describe this specific behavior problem — just this slice, not the whole report]

## What I expected

[Expected behavior for this specific slice]

## Steps to reproduce

1. [Steps specific to THIS issue]

## Blocked by

- #<issue-number> (if this issue can't be fixed until another is resolved)

Or "None — can start immediately" if no blockers.

## Additional context

[Any extra observations relevant to this slice]
```

创建任务拆分时：

- **宁可拆成多个轻量任务，也不要只建少数庞大任务** — 每个任务都应该能够独立修复和验证
- **如实标记阻塞关系** — 如果任务 B 确实要等任务 A 修复后才能测试，请明确说明。如果它们彼此独立，则将两者都标记为“无 — 可以立即开始”
- **按依赖顺序创建任务**，以便在“被以下任务阻塞”中引用真实的任务编号
- **最大限度提高并行度** — 目标是让多个人（或智能体）能够同时处理不同的任务

#### 所有任务正文的规则

- **不要包含文件路径或行号** — 这些信息会过时
- **使用项目的领域语言**（如果存在，请查看 UBIQUITOUS_LANGUAGE.md）
- **描述行为，而不是代码** — 使用“同步服务无法应用补丁”，而不是“applyPatch() 在第 42 行抛出异常”
- **必须提供复现步骤** — 如果无法确定，请询问用户
- **保持简洁** — 开发者应能在 30 秒内读完任务

提交后，打印所有任务 URL（并概述阻塞关系），然后询问：“下一个任务，还是已经完成了？”

### 5. 继续会话

持续进行，直到用户表示已经完成。每个任务都是独立的 — 不要批量处理。