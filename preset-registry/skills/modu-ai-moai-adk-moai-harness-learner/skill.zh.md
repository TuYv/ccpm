---
name: moai-harness-learner
description: Harness learning subsystem coordinator. Produces Tier 4 auto-update proposal payloads consumed by the orchestrator (which surfaces them via AskUserQuestion) and orchestrates Apply/Rollback flows. Triggers when harness learning proposals are pending or learning lifecycle management is needed.
when_to_use: >
  Use for harness learning lifecycle management: producing Tier 4 auto-update
  proposal payloads for the orchestrator (surfaced via AskUserQuestion), and
  coordinating Apply/Rollback flows when learning proposals are pending.
allowed-tools: Bash,Read,Write,Edit
user-invocable: false
---
# moai-harness-learner

<!-- @MX:NOTE: [AUTO] V3R4 契约——根据 harness 基础策略 §10 排除项 #10，此技能正文保持不变（仅文本注解，无行为变更）。此处定义的四层 observation/heuristic/rule/auto_update 阶梯根据 REQ-HRN-FND-011 原样保留。仅限编排器使用 AskUserQuestion 的契约由 REQ-HRN-FND-015 确立（交叉引用：.claude/rules/moai/core/agent-common-protocol.md § User Interaction Boundary）。将基于频次计数的分类器替换为嵌入聚类算法的后续工作，推迟至 harness 分类器升级策略处理。 -->

Harness 学习子系统的协调器技能（harness-learning 策略已由 harness 基础策略取代，后者是当前有效的 V3R4 基础；此 V3R3 SPEC 的四层阶梯保持不变）。
生成由 MoAI 编排器使用的第 4 层自动更新提案载荷；编排器通过 AskUserQuestion 将其呈现给用户，并编排应用/回滚流程。规范契约：`.claude/rules/moai/core/askuser-protocol.md § Orchestrator-Subagent Boundary`（宪法性规则/002/003）。

## 快速参考

**角色**：CLI（`moai harness`）与 AskUserQuestion 之间的编排器侧桥梁。

**关键约束** [HARD]：`moai harness apply` 返回一个表示第 4 层自动更新提案的 JSON 载荷。此技能生成该载荷；编排器通过 `AskUserQuestion` 将其呈现给用户。CLI 本身不会提示用户。规范契约：`.claude/rules/moai/core/askuser-protocol.md § Orchestrator-Subagent Boundary`。

**常见触发方式**：
- `moai harness status` — 检查层级分布和待处理提案
- `moai harness apply` — 加载下一个待处理提案（返回 JSON 载荷）
- `moai harness rollback <date>` — 恢复快照
- `moai harness disable` — 设置 learning.enabled: false

**工作流**：
1. 运行 `moai harness status` 检查状态。
2. 运行 `moai harness apply` 获取提案载荷。
3. 将载荷交给编排器，由其通过 `AskUserQuestion` 呈现（批准 / 拒绝）。
4. 批准时：将批准结果写入 proposals 目录，并通知 CLI 继续执行。
5. 拒绝时：删除提案文件（不应用任何更改）。

---

## 实现指南

### 第 1 步：状态检查

```bash
moai harness status --project-root <project_root>
```

输出包括：
- `enabled` 状态
- 层级分布（observation / heuristic / rule / auto_update）
- 速率限制窗口状态
- 待处理提案数量

### 第 2 步：获取提案载荷

```bash
moai harness apply --project-root <project_root>
```

该命令输出一个 JSON 块，其中包含：
- `id` — 提案标识符
- `target_path` — 要修改的文件
- `field_key` — `description` 或 `triggers`
- `new_value` — 提议的新内容
- `pattern_key` — 触发此提案的模式
- `observation_count` — 此模式被观察到的次数

### 第 3 步：生成供编排器使用的结构化载荷

[HARD] 此技能生成一个表示第 4 层自动更新提案的结构化载荷；MoAI 编排器通过 `AskUserQuestion` 将其呈现给用户。规范契约：`.claude/rules/moai/core/askuser-protocol.md § Orchestrator-Subagent Boundary`。

**载荷模式**：

- `proposal_id` — 提案标识符
- `target_path` — 要修改的文件
- `field_key` — `description` 或 `triggers`
- `current_value` — 现有内容（用于差异上下文）
- `new_value` — 提议的新内容
- `observation_count` — 模式观察次数
- `confidence` — 自动更新置信度分数（0.0–1.0）
- `recommended_action` — `approve`（默认）| `reject` | `inspect` | `defer`

该技能将此载荷作为工具输出发出。编排器读取载荷，通过 `ToolSearch(query: "select:AskUserQuestion")` 预加载 `AskUserQuestion`，并向用户显示包含四个选项的决策（approve / reject / inspect / defer）。用户批准后，编排器使用 `action=apply` 再次委派给此技能；用户拒绝后，则使用 `action=skip`。按照 `askuser-protocol.md § Socratic Interview Structure`，编排器根据载荷的 `recommended_action` 字段构造“（推荐）”后缀和各选项的说明。

### 第 4 步：批准时

该技能通过直接调用安全流水线来应用变更。由于 CLI 的 `apply` 仅显示载荷（并不执行），实际写入通过执行框架包的 `Apply()` 函数完成，并受五层安全流水线管控。

对于协调器技能，最简单的流程是：
1. 用户选择“approve”
2. 将 `approved: true` 写入 `.moai/harness/proposals/<id>.decision`
3. 运行 `moai harness apply --execute`（如果 CLI 支持），或直接调用执行框架 API。

### 第 5 步：拒绝时

1. 删除 `.moai/harness/proposals/<id>.json`
2. 向用户确认已删除。

### 回滚流程

```bash
# List available snapshots
ls .moai/harness/learning-history/snapshots/

# Rollback to a specific snapshot
moai harness rollback 2026-04-27T00-00-00.000000000Z --project-root <project_root>
```

### 禁用学习

```bash
moai harness disable --project-root <project_root>
```

在 `.moai/config/sections/harness.yaml` 中设置 `learning.enabled: false`。
注释和键顺序会被保留（YAML 往返处理）。

---

## 配合良好的技能

- `moai-meta-harness` — 生成作为自动更新目标的 `hns-*` 技能
- `moai-workflow-tdd` — TDD 循环会生成输入观察器的事件
- `moai-foundation-quality` — 自动更新后运行质量门禁，以验证正确性

## 安全架构参考

五层安全流水线（L1 冻结保护 → L2 金丝雀检查 → L3 矛盾检测器 → L4 速率限制器 → L5 人工监督）会保护每一次 Tier 4 自动更新：

| 层级 | 保护机制 | 违规时的操作 |
|-------|-------|---------------------|
| L1 | 冻结保护 | 阻止 — 永远不会修改 FROZEN 路径 |
| L2 | 金丝雀检查 | 阻止 — 如果有效性下降超过 0.10 |
| L3 | 矛盾检测器 | 阻止 — 如果出现触发器冲突 |
| L4 | 速率限制器 | 阻止 — 每周最多 3 次，冷却时间为 24 小时 |
| L5 | 人工监督 | 编排器通过 AskUserQuestion 显示用户审批选项（此技能发出载荷） |

[HARD] L1 冻结路径（运行时绝不自动修改）：
- `.claude/agents/moai/**`（由模板管理的代理；`.claude/agents/harness/` 是用户所有且允许写入的目标，并未冻结）
- `.claude/skills/moai-*/**`
- `.claude/rules/moai/**`

只有用户区域的技能（`.claude/skills/hns-*/`，以及旧版的 `.claude/skills/harness-*/` 和 `.claude/skills/my-harness-*/`）和代理（`.claude/agents/harness/`）才是有效的自动更新目标。