---
name: council-review
description: Multi-model validation council — auto-validate plans, architecture changes, and PRs via validate-plan/review before executing
when-to-use: When you write a plan to ~/.claude/plans/, make architectural changes, or before marking a PR done; required for CLAUDE-tier tasks
user-invocable: false
allowed-tools: [Bash, Read]
effort: high
---
# 专家委员会 — 多模型验证

## 自动触发时机

### 计划（auto_validate_plans）
当你将计划写入 `~/.claude/plans/` 时，自动对其进行验证：
```bash
~/bin/validate-plan --threshold 2 ~/.claude/plans/<plan-file>.md
```
- 3 个评审者中有 2 个或以上批准 → 立即执行
- 3 个评审者中有 1 个批准 → 在继续之前向用户展示评审者反馈
- 3 个评审者均未批准 → 修改计划并重新验证

### 架构决策（auto_review_architecture）
进行架构变更（新服务、API 重设计、数据库架构变更）时，运行：
```bash
~/bin/review --all "Review this architecture: <summary>"
```

### PR 评审（auto_review_prs）
在将 PR 标记为完成之前，运行：
```bash
~/bin/review --all --file <changed-files>
```

## 配置

委员会行为在 `~/.claude/council.yaml` 中配置。Maggy 仪表板（Settings > Council）也会管理此配置。

### 委员会主席

`chief: claude-fable-5` — Claude Fable 5（Anthropic 目前最强、广泛发布的模型，于 2026-06-09 正式发布）担任每个评审小组的主席：它首先进行评审，并负责最终综合裁决。通过 `~/bin/claude-fable-5` 调用。可在 `~/.claude/council.yaml` 中覆盖主席设置。

### 评审上下文

主席领导每个上下文，随后由评审小组参与：

| 上下文 | 默认评审者 | 适用时机 |
|---------|-------------------|------|
| `plan` | **Claude Fable 5 (chief)**、DeepSeek Pro、Codex、Gemini Pro | 执行任何计划之前 |
| `review` | **Claude Fable 5 (chief)**、DeepSeek Pro、Kimi | 代码评审、PR 评审 |
| `architecture` | **Claude Fable 5 (chief)**、DeepSeek Pro、Gemini Pro、Grok | 系统设计、架构变更 |

### 阈值规则

`threshold` 设置控制所需的批准数量：
- 3 个评审者中设置为 `threshold: 2` → 需要 2/3 才会自动执行
- 限制在 [1, reviewer_count] 范围内 — 不能为 0，也不能超过可用评审者数量

## 模型清单

全部 13 个层级均列在 `~/.claude/council.yaml` 的 `models:` 下。每个层级包含：
- `id` — 唯一标识符
- `cmd` — 用于调用的 CLI 命令（Claude 模型为 null，因为它们就是宿主）
- `tier` — 路由优先级（0=最便宜，12=能力最强）
- `label` — 人类可读的名称

使用 `POST /api/models/health` 验证所有模型是否正常响应。

## 此技能的使用方式

此技能由 Claude Code 在会话启动时加载。它提供何时调用多模型验证的行为规则。实际执行通过已经安装的 `~/bin/validate-plan` 和 `~/bin/review` 完成。

**不要跳过对 CLAUDE-tier 任务的委员会验证。**委员会存在的全部意义，就是在执行之前对架构和安全决策进行独立验证。