---
name: council-review
description: Multi-model validation council — auto-validate plans, architecture changes, and PRs via validate-plan/review before executing
when-to-use: When you write a plan to ~/.claude/plans/, make architectural changes, or before marking a PR done; required for CLAUDE-tier tasks
user-invocable: false
allowed-tools: [Bash, Read]
effort: high
---
# 专家委员会 — 多模型验证

## 何时自动触发

### 计划 (auto_validate_plans)
当你将计划写入 `~/.claude/plans/` 时，自动对其进行验证：
```bash
~/bin/validate-plan --threshold 2 ~/.claude/plans/<plan-file>.md
```
- 3 个中有 2 个或更多批准 → 立即执行
- 3 个中有 1 个批准 → 在继续之前向用户展示审阅者反馈
- 3 个中有 0 个批准 → 修改计划并重新验证

### 架构决策 (auto_review_architecture)
进行架构变更（新服务、API 重新设计、数据库模式变更）时，运行：
```bash
~/bin/review --all "Review this architecture: <summary>"
```

### PR 审阅 (auto_review_prs)
在将 PR 标记为完成之前，运行：
```bash
~/bin/review --all --file <changed-files>
```

## 配置

委员会行为在 `~/.claude/council.yaml` 中配置。Maggy 仪表板（Settings > Council）也可管理此配置。

### 委员会主席

`chief: claude-fable-5` — Claude Fable 5（Anthropic 已广泛发布的最强大模型，
于 2026-06-09 正式发布）作为主席领导每个评审组：它首先进行审阅，并给出
决定性的综合意见。通过 `~/bin/claude-fable-5` 调用。可在
`~/.claude/council.yaml` 中覆盖主席设置。

### 审阅上下文

每个上下文均由主席领导，其他成员随后参与：

| 上下文 | 默认审阅者 | 时机 |
|---------|-------------------|------|
| `plan` | **Claude Fable 5（主席）**、DeepSeek Pro、Codex、Gemini Pro | 执行任何计划之前 |
| `review` | **Claude Fable 5（主席）**、DeepSeek Pro、Kimi | 代码审阅、PR 审阅 |
| `architecture` | **Claude Fable 5（主席）**、DeepSeek Pro、Gemini Pro、Grok | 系统设计、模式变更 |

### 阈值规则

`threshold` 设置控制所需的批准数量：
- `threshold: 2` 且有 3 名审阅者 → 需要 2/3 批准才能自动执行
- 限制在 [1, reviewer_count] 范围内 — 不能为 0，也不能超过可用审阅者数量

## 模型清单

全部 13 个层级均列在 `~/.claude/council.yaml` 的 `models:` 下。每个模型都有：
- `id` — 唯一标识符
- `cmd` — 用于调用的 CLI 命令（Claude 模型为 null，因为它们是宿主模型）
- `tier` — 路由优先级（0=成本最低，12=能力最强）
- `label` — 人类可读的名称

使用 `POST /api/models/health` 验证所有模型是否均有响应。

## 此 Skill 的使用方式

此 Skill 会在会话开始时由 Claude Code 加载。它规定了何时调用多模型验证的行为规则。实际执行通过已安装的 `~/bin/validate-plan` 和 `~/bin/review` 进行。

**对于 CLAUDE 层级的任务，不要跳过委员会验证。** 其核心目的正是让架构和安全决策在执行前得到独立验证。