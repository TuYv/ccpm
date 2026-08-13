---
name: agentflow
description: "Orchestrate autonomous AI development pipelines through your Kanban board (Asana, GitHub Projects, Linear). Manages multi-worker Claude Code dispatch, deterministic quality gates, adversarial review, per-task cost tracking, and crash-proof pipeline execution."
risk: safe
source: community
date_added: "2026-04-02"
---
# AgentFlow

## 概览

AgentFlow 将你现有的看板转换为一个完全自主的 AI 开发流水线。你无需构建自定义编排基础设施，它把你的项目管理工具（Asana、GitHub Projects、Linear）当作一个分布式状态机——任务在各阶段流转，AI 智能体通过评论读取和写入状态，而人工干预也能通过他们已经在使用的同一界面完成。

其结果是：可在手机上完整观察流水线运行过程、崩溃后可无损恢复（状态保存在 PM 工具中，而不在内存中），以及任何时刻都可以通过拖拽卡片实现人工接管。

## 何时使用该技能

- 当你需要在完整开发生命周期（构建、评审、测试、集成）中编排多个 Claude Code 工作者时使用
- 当你希望在 AI 审查 AI 生成代码之前先经过确定性质量门禁（tsc/eslint/tests）时使用
- 当你希望从看板或手机获得完整流水线可见性时使用
- 当你以独立或团队项目方式进行开发，需要带成本跟踪的自主任务分发时使用
- 当你需要能够在会话重启后依然存在的抗崩溃编排时使用

## 核心概念

### 7 阶段看板流水线

任务按以下顺序流转：Backlog、Research、Build、Review、Test、Integrate、Done。每个阶段都有特定的门禁。看板本身就是编排层——没有独立数据库，没有消息队列，没有自建基础设施。

### 无状态编排器

一个由 crontab 驱动的单次扫描每 15 分钟运行一次。没有守护进程，也不依赖会话。若发生崩溃，下一次扫描会从上次中断处继续，因为所有状态都保存在你的 PM 工具中。

### 确定性优先于概率性

在任何 AI 审查之前先执行硬性门禁（tsc + eslint + tests），以几乎零成本捕获约 60% 的问题。AI 审查随后作为第二层。

### 对抗式评审

不同的 AI 智能体进行代码评审，并且必须在决定通过前列出 3 个问题，以防止敷衍式通过。

### 传递优先级调度

优先处理解除最多下游阻塞的任务，自动计算关键路径。

## 技能 / 命令

### `/spec-to-board`
将 `SPEC.md` 分解为原子任务并映射到你的看板上。

### `/sdlc-orchestrate`
基于传递优先级和冲突检测分发任务到工作者。以 crontab 扫描方式运行。

### `/sdlc-worker --slot <N>`
在终端槽位中运行一个工作者，领取任务、编写代码并创建 PR。可并行运行 3-4 个工作者。

### `/sdlc-health`
实时流水线状态看板，显示每个任务的当前阶段、被分配智能体、重试次数和累计成本。

### `/sdlc-stop`
优雅停机：活动工作者完成当前任务，未启动任务返回 Backlog。

## 逐步指南

### 1. 编写你的规范

为你的项目创建 `SPEC.md`，描述你要构建的内容。

### 2. 分解为任务

```
claude -p "/spec-to-board"
```

它会读取你的 `SPEC.md`，将其分解为原子任务，映射依赖关系，并在看板上创建这些任务。

### 3. 启动工作者

打开 3-4 个终端窗口，每个作为一个工作者槽位：

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

在手机上打开你的看板。观察任务在流水线中的流转。将任意卡片拖到“Needs Human”进行干预。运行 `/sdlc-health` 查看终端看板。

### 6. 停止流水线

```
claude -p "/sdlc-stop"
```

## 质量门禁

每个阶段在晋升前都有特定门禁：

- **Build 到 Review**：`tsc` + `eslint` + `npm test` 必须全部通过（确定性）
- **Review 到 Test**：对抗式评审必须先列出 3 个问题才能通过
- **Test 到 Integrate**：新文件 80% 覆盖率阈值
- **Integrate 到 Done**：合并后在主分支运行完整测试套件；失败则自动回退

## 成本跟踪

按任务进行成本跟踪并设定阶段上限（Sonnet 默认值）：

- Research：~$0.10
- Build：~$0.40
- Review：~$0.10
- Test：~$0.05
- Integrate：~$0.03

自动保护：Sonnet/Opus 分别在 $3/$8 时告警，$10/$20 时硬停止，并升级到人工处理。

## 安全与恢复

- **自动回退**：集成失败会触发 `git revert`（新建提交，绝不 force-push）
- **阻塞任务**：经过 2 次失败尝试后，任务升级为人工评审
- **死任务检测**：每 5 分钟心跳检测，10 分钟超时后重新分配
- **优雅停机**：`/sdlc-stop` 会排空工作者，将未启动任务返回 Backlog
- **范围蔓延检测**：对比 PR 差异文件与预测文件列表
- **规范漂移检测**：SHA-256 哈希比对可捕获冲刺中需求变更

## 安装

```bash
# Clone the repo
git clone https://github.com/UrRhb/agentflow.git

# Copy skills and prompts to your Claude Code config
cp -r agentflow/skills/* ~/.claude/skills/
cp -r agentflow/prompts/* ~/.claude/sdlc/prompts/
cp agentflow/conventions.md ~/.claude/sdlc/conventions.md
```

或安装为 Claude Code 插件：

```bash
/plugin marketplace add UrRhb/agentflow
/plugin install agentflow
```

## 最佳实践

- Do: 在运行 `/spec-to-board` 前先写清晰的 `SPEC.md`
- Do: 针对典型项目，先启动 3-4 个工作者
- Do: 从看板监控，并在需要时将卡片拖到“Needs Human”
- Do: 定期查看 `LEARNINGS.md`——它会记录常见失败模式
- Don't: 跳过确定性质量门禁——它们以低成本捕获大部分问题
- Don't: 对 main 执行 force-push——AgentFlow 使用 `git revert` 来保证安全
- Don't: 启动超过项目并行能力允许数量的工作者

## 故障排查

### 问题：工作者似乎卡住或失效
**症状：** 任务卡片 15 分钟以上未移动，且无新评论  
**解决方案：** 编排器通过心跳检测到死亡工作者，并在 10 分钟后重新分配。如果问题持续，运行 `/sdlc-health` 检查状态，并手动将卡片拖回 Backlog。

### 问题：触发成本保护线
**症状：** 任务被移动到“Needs Human”并带有 COST:CRITICAL 标签  
**解决方案：** 查看该任务的评论线程以获取累计上下文。决定是否提高预算、简化任务，或将其拆分为更小的部分。

### 问题：合并后集成测试失败
**症状：** 任务已从 main 自动回退  
**解决方案：** 自动回退用于保住主分支稳定性。检查评论中的任务重试上下文，其中包含尝试内容与失败情况。下一位被分配的工作者会使用这些上下文继续。

## 相关技能

- `@brainstorming` - 在使用 AgentFlow 前用于设计你的 `SPEC.md`
- `@writing-plans` - 与任务分解的规范编写互补
- `@test-driven-development` - 与 AgentFlow 的质量门禁配合良好
- `@subagent-driven-development` - 多智能体协同的替代方法

## 额外资源

- [AgentFlow Repository](https://github.com/UrRhb/agentflow)
- [Architecture Documentation](https://github.com/UrRhb/agentflow/blob/main/docs/architecture.md)
- [Gap Registry (45 failure modes)](https://github.com/UrRhb/agentflow/blob/main/docs/gap-registry.md)
- [Getting Started Guide](https://github.com/UrRhb/agentflow/blob/main/docs/getting-started.md)

## 局限性
- 仅在任务明确符合上述范围时使用该技能。
- 不要将输出替代特定环境下的验证、测试或专家评审。
- 当缺少必要输入、权限、安全边界或成功标准时，请停止并请求澄清。
