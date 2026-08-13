---
name: qa
description: Interactive QA session where user reports bugs or issues conversationally, and the agent files GitHub issues. Explores the codebase in the background for context and domain language. Use when user wants to report bugs, do QA, file issues conversationally, or mentions "QA session".
---
# QA 会话

进行一次交互式 QA 会话。用户会描述他们遇到的问题。你先澄清，再探索代码库以获取上下文，并提交持久化、以用户为中心、并使用项目领域语言的 GitHub 问题。

## 用户提出的每个问题

### 1. 倾听并轻度澄清

让用户用自己的话描述问题。提出**最多 2-3 个简短的澄清问题**，聚焦于：

- 他们预期发生什么，以及实际发生了什么
- 重现步骤（如果不明显）
- 是否是持续出现或偶发

不要过度提问。若描述足够清晰到可以提单，立即继续。

### 2. 后台探索代码库

在与用户沟通的同时，在后台启动一个 Agent（`subagent_type=Explore`）来理解相关区域。目标不是去找修复方案——是为了：

- 学习该区域使用的领域语言（查看 `UBIQUITOUS_LANGUAGE.md`）
- 理解该特性应有的行为
- 明确用户可见行为的边界

这些上下文有助于你写出更好的 issue，但 issue 本身不应引用具体文件、行号或内部实现细节。

### 3. 评估范围：单一问题还是拆分？

提交前，先判断这是一个**单一问题**还是需要拆分为多个问题。

当以下情况时拆分：

- 修复涉及多个独立区域（例如“表单校验错误 + 成功提示缺失 + 跳转失败”）
- 明显存在可并行分工的独立关注点
- 用户描述了多种不同的失败模式或症状

当以下情况时保留为单一问题：

- 只有一个行为在某处出错
- 所有症状都由同一根本行为导致

### 4. 提交 GitHub issue（们）

使用 `gh issue create` 创建 issue。不要先让用户审阅——直接提交并分享链接。

issue 必须是**耐久型**——即使经过重大重构也应仍然成立。使用用户视角来撰写。

#### 对于单一 issue

使用以下模板：

```md
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

按依赖顺序创建 issue（先提交阻塞项），以便引用真实的 issue 编号。

使用以下模板为每个子 issue 编写：

```md
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

创建拆分时：

- **优先创建多个小而独立的 issue**——每个都应可独立修复与验证
- **真实标注阻塞关系**——如果 issue B 真的必须等 issue A 解决后才能测试，就如实说明；若独立，请都标为“None — can start immediately”
- **按依赖顺序创建**，以便在“Blocked by”中引用真实编号
- **最大化并行性**——目标是让多个人（或多个 agent）同时处理不同问题

#### 所有 issue 内容的通用规则

- **不要包含文件路径或行号**——这些信息会过时
- **使用项目的领域语言**（若存在请查看 `UBIQUITOUS_LANGUAGE.md`）
- **描述行为而非代码**——例如“同步服务未能应用补丁”，而不是“applyPatch() 在第 42 行抛出异常”
- **必须提供重现步骤**——如果无法确定，请向用户询问
- **保持简洁**——开发者应能在 30 秒内读完一个 issue

提交后，打印所有 issue URL（并汇总阻塞关系），并询问：“下一条问题，还是结束？”

### 5. 继续会话

持续进行，直到用户表示结束。每个 issue 独立处理——不要打包提交。
