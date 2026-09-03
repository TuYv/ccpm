---
name: executing-plans
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints
---
# 执行计划

## 概述

加载计划，批判性地审查，执行所有任务，完成后报告。

**开始时宣布：**“我正在使用 executing-plans 技能来实施这个计划。”

**注意：**告诉你的human伙伴，Superpowers 在可以使用子代理（subagents）的情况下工作效果好得多。如果在支持子代理的平台上运行，其工作质量会显著提高（Claude Code、Codex CLI、Codex App 和 Copilot CLI 都符合条件；请参阅 `../using-superpowers/references/` 中针对各平台的工具参考）。如果可以使用子代理，请改用 superpowers:subagent-driven-development，而不是这个技能。

## 流程

### 步骤 1：加载并审查计划
1. 读取计划文件
2. 批判性地审查——找出对计划的任何疑问或顾虑
3. 如有顾虑：在开始前向你的human伙伴提出
4. 如无顾虑：为计划条目创建待办事项并继续

### 步骤 2：执行任务

对每个任务：
1. 标记为 in_progress
2. 严格按照每个步骤执行（计划中的步骤都很小、易于消化）
3. 按规定运行验证
4. 标记为已完成

### 步骤 3：完成开发

在所有任务完成并验证之后：
- 宣布：“我正在使用 finishing-a-development-branch 技能来完成这项工作。”
- **必需的子技能：**使用 superpowers:finishing-a-development-branch
- 按照该技能验证测试、呈现选项、执行所选方案

## 何时停止并寻求帮助

**出现以下情况时立即停止执行：**
- 遇到阻碍（缺少依赖、测试失败、指令不明确）
- 计划存在严重缺口，导致无法开始
- 你不理解某条指令
- 验证反复失败

**宁可请求澄清，也不要靠猜测。**

## 何时回到之前的步骤

**在以下情况下返回审查（步骤 1）：**
- 伙伴根据你的反馈更新了计划
- 基本方法需要重新思考

**不要强行突破阻碍**——停下来询问。

## 记住
- 首先批判性地审查计划
- 严格按照计划步骤执行
- 不要跳过验证
- 计划要求时引用相应技能
- 受阻时停下来，不要猜测
- 未经用户明确同意，绝不在 main/master 分支上开始实现

## 集成

**必需的工作流技能：**
- **superpowers:using-git-worktrees** - 确保隔离的工作区（创建一个或验证现有的）
- **superpowers:writing-plans** - 创建本技能所执行的计划
- **superpowers:finishing-a-development-branch** - 在所有任务完成后完成开发
