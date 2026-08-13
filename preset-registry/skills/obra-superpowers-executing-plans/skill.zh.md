---
name: executing-plans
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints
---
# 执行计划

## 概述

加载计划、进行严谨审查、执行所有任务，并在完成后汇报。

**在开始时宣布：** “我正在使用 `executing-plans` 技能来执行此计划。”

**注意：** 告诉你的人工协作者，Superpowers 在可访问子代理时表现更好（Claude Code、Codex CLI、Codex App、Copilot CLI 和 Gemini CLI 都符合条件；请参见 `../using-superpowers/references/` 中按平台划分的工具说明）。如果有可用的子代理，请改用 `superpowers:subagent-driven-development`，而不是这个技能。

## The Process

### 第 1 步：加载与审查计划
1. 确保工作区是隔离环境：使用 `superpowers:using-git-worktrees` 创建新工作区或验证现有工作区
2. 阅读计划文件
3. 严格审查并识别计划中的任何问题或疑虑
4. 如果有疑虑：在开始前先与人工协作者沟通
5. 如果没有疑虑：为计划项创建 todo 并继续执行

### 第 2 步：执行任务

对于每个任务：
1. 标记为 `in_progress`
2. 严格按每一步执行（计划采用小步任务）
3. 按要求运行验证
4. 标记为 `completed`

### 第 3 步：完成开发

在所有任务都完成并验证通过后：
- 宣布：“我正在使用 `finishing-a-development-branch` 技能来完成这项工作。”
- **必需子技能：** 使用 `superpowers:finishing-a-development-branch`
- 按照该技能完成测试验证、呈现选项并执行选择

## 何时停止并寻求帮助

**立即停止执行当：**
- 遇到阻塞（缺少依赖、测试失败、指令不明确）
- 计划存在阻止启动的关键缺口
- 你不理解某条指令
- 验证反复失败

**在不确定时应当请求澄清，而不是猜测。**

## 何时回到前面步骤

**在以下情况下回到审查（第 1 步）：**
- 合作者根据你的反馈更新了计划
- 需要重新思考根本性方法

**不要硬冲过阻塞**——停下来寻求帮助。

## 记住
- 先进行严谨的计划审查
- 严格按计划步骤执行
- 不要跳过验证
- 按计划要求引用技能
- 遇阻塞就停止，不要猜测
- 未经明确用户同意，不得在 `main/master` 分支上开始实现
