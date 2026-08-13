---
name: agentflow
description: "Orchestrate autonomous AI development pipelines through your Kanban board (Asana, GitHub Projects, Linear). Manages multi-worker Claude Code dispatch, deterministic quality gates, adversarial review, per-task cost tracking, and crash-proof pipeline execution."
risk: safe
source: community
date_added: "2026-04-02"
---
# AgentFlow

## 概述

AgentFlow 将你现有的看板（Kanban）转变为一个完全自主的 AI 开发流水线。它不通过构建定制化编排基础设施，而是将你的项目管理工具（Asana、GitHub Projects、Linear）视为一个分布式状态机——任务在阶段之间流转，AI 智能体通过评论读取并写入状态，人类则可通过同一套现有界面进行干预。

其结果是你可以在手机上实现完整的流水线可观测性，支持免费崩溃恢复（状态保存在你的 PM 工具中，而非内存），并可在任何时刻通过拖动卡片进行人工覆盖。

## 何时使用此技能

- 当你需要跨完整开发生命周期（构建、评审、测试、集成）协调多个 Claude Code 工作者时使用
- 当你希望在 AI 对 AI 生成代码进行评审前，先经过确定性质量门禁（tsc/eslint/tests）时使用
- 当你希望从看板或手机上完整查看流水线可见性时使用
- 当你在个人或团队项目中需要具备自主任务分发并进行成本跟踪时使用
- 当你需要具备会话重启后仍可存活的抗崩溃编排时使用

## 核心概念

### 7 阶段看板流水线

任务按以下顺序流转：Backlog、Research、Build、Review、Test、Integrate、Done。每个阶段都有特定的门禁。看板（Kanban）本身就是编排层——没有独立数据库、没有消息队列、没有自建基础设施。

### 无状态编排器

一个由 crontab 触发的一次性扫描每 15 分钟运行一次。没有守护进程，没有会话依赖。即使它崩溃，下次扫描也会从中断处继续，因为所有状态都保存在你的 PM 工具中。

### 先确定性后概率性

硬性门禁（tsc + eslint + tests）在任何 AI 评审之前运行，以近乎零成本捕获约 60% 的问题。AI 评审随后进行，作为第二层。

### 对抗式评审

不同的 AI 智能体进行代码评审，并且必须在决定通过前列出 3 个问题。这可防止“走过场”式批准。

### 传递式优先级调度

会优先构建那些会解锁更多下游工作的任务，并自动计算关键路径。

## 技能 / 命令

### `/spec-to-board`
将 `SPEC.md` 拆解为原子任务并映射依赖，创建到你的看板上。

### `/sdlc-orchestrate`
基于传递式优先级和冲突检测分发任务给工作人员。以 crontab 扫描方式运行。

### `/sdlc-worker --slot <N>`
在一个终端插槽中运行工作者，接收任务、编写代码并创建 PR。可并行运行 3-4 个工作者。

### `/sdlc-health`
实时流水线状态仪表盘，展示每个任务的当前阶段、分配的智能体、重试次数和累计成本。

### `/sdlc-stop`
优雅停机：活动工作者完成当前任务，未开始的任务返回 Backlog。

## 分步指南

### 1. 编写规格说明

为你的项目创建 `SPEC.md`，说明你要构建的内容。

### 2. 拆解为任务

```
claude -p "/spec-to-board"
```

这会读取你的 `SPEC.md`，将其拆解为原子任务、映射依赖，并在你的看板上创建这些任务。

### 3. 启动工作者

打开 3-4 个终端窗口，每个作为一个工作者插槽：

```bash
# Terminal 2 — Builder
claude -p "/sdlc-worker --slot T2"

# Terminal 3 — Builder
claude -p "/sdlc-worker --slot T3"

# Terminal 4 — Reviewer
claude -p "/sdlc-worker --slot T4"

# Terminal 5 — Tester
claude -p "/sdlc-worker --slot T5"
```

### 4. 启动编排器

```bash
# Add to crontab (runs every 15 minutes)
crontab -e
# Add: */15 * * * * ~/.claude/sdlc/agentflow-cron.sh >> /tmp/agentflow-orchestrate.log 2>&1
```

### 5. 监控与干预

在手机上打开你的看板。观察任务在流水线中的流转。将任意卡片拖到 “Needs Human” 进行人工干预。运行 `/sdlc-health` 查看终端仪表盘。

### 6. 停止流水线

```
claude -p "/sdlc-stop"
```

## 质量门禁

每个阶段在晋升前都执行特定门禁：

- **Build 到 Review**：`tsc` + `eslint` + `npm test` 都必须通过（确定性）
- **Review 到 Test**：对抗式评审者必须在通过前列出 3 个问题
- **Test 到 Integrate**：新文件需达到 80% 覆盖率阈值
- **Integrate 到 Done**：合并后在主分支上运行完整测试套件；失败时自动回滚

## 成本跟踪

按任务进行成本跟踪，并设置阶段上限（Sonnet 默认值）：

- Research: ~$0.10
- Build: ~$0.40
- Review: ~$0.10
- Test: ~$0.05
- Integrate: ~$0.03

自动保护线：$3/$8 处警告，$10/$20（Sonnet/Opus）处硬停，并触发人工升级。

## 安全与恢复

- **自动回滚**：集成失败会触发 `git revert`（新建提交，绝不强制推送）
- **阻塞任务**：在 2 次失败后，任务升级到人工评审
- **死代理检测**：每 5 分钟心跳一次，10 分钟超时后重新分配
- **优雅停机**：`/sdlc-stop` 清空队列并将未开始任务退回待办
- **范围蔓延检测**：PR 差异文件与预测文件列表进行比对
- **规格偏移检测**：通过 SHA-256 哈希比较捕获冲刺过程中需求变更

## 安装

```bash
# Clone the repo
git clone https://github.com/UrRhb/agentflow.git

# Copy skills and prompts to your Claude Code config
cp -r agentflow/skills/* ~/.claude/skills/
cp -r agentflow/prompts/* ~/.claude/sdlc/prompts/
cp agentflow/conventions.md ~/.claude/sdlc/conventions.md
```

或将其作为 Claude Code 插件安装：

```bash
/plugin marketplace add UrRhb/agentflow
/plugin install agentflow
```

## 最佳实践

- Do: 在运行 `/spec-to-board` 之前先编写清晰的 `SPEC.md`
- Do: 对于典型项目，从 3-4 个工作者开始
- Do: 在看板上监控，并在需要时将卡片拖到 “Needs Human”
- Do: 定期查看 `LEARNINGS.md`——它会记录常见失败模式
- Don't: 跳过确定性质量门禁——它们以低成本捕获大多数问题
- Don't: 对 main 强制推送——AgentFlow 使用 `git revert` 来保证安全
- Don't: 运行超出项目并行能力的工作者数量

## 故障排查

### 问题：工作者似乎卡住或失效
**症状：** 任务卡片 15 分钟以上未移动，且无新评论  
**解决方案：** 编排器通过心跳检测失效代理，并在 10 分钟后重新分配。若问题持续，请运行 `/sdlc-health` 检查状态，并手动将卡片拖回 Backlog。

### 问题：触发成本保护线
**症状：** 任务被移动到带有 `COST:CRITICAL` 标签的 “Needs Human”  
**解决方案：** 检查任务的评论线程以查看累计上下文。判断是否提高预算、简化任务或将其拆分为更小的部分。

### 问题：合并后集成测试失败
**症状：** 任务从 main 自动回滚  
**解决方案：** 自动回滚可保持 main 的稳定性。查看评论中的任务重试上下文，其中记录了已尝试内容和失败原因。下一位被分配的工作者将使用该上下文。

## 相关技能

- `@brainstorming` - 在使用 AgentFlow 之前用于设计你的 `SPEC.md`
- `@writing-plans` - 配合 `SPEC.md` 编写进行任务拆解
- `@test-driven-development` - 与 AgentFlow 的质量门禁协作效果良好
- `@subagent-driven-development` - 用于多智能体协作的替代方案

## 附加资源

- [AgentFlow 仓库](https://github.com/UrRhb/agentflow)
- [架构文档](https://github.com/UrRhb/agentflow/blob/main/docs/architecture.md)
- [缺口注册表（45 种失败模式）](https://github.com/UrRhb/agentflow/blob/main/docs/gap-registry.md)
- [入门指南](https://github.com/UrRhb/agentflow/blob/main/docs/getting-started.md)

## 限制
- 仅在任务明确符合上述范围时使用此技能。
- 不要将输出视为替代环境特定的验证、测试或专家评审。
- 若缺少必要输入、权限、安全边界或成功标准，应停止并请求澄清。
