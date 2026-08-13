---
name: chaos-engineering
description: Use when planning, running, or learning from chaos engineering experiments. Triggers on "chaos experiment", "fault injection", "gameday", "resilience test", "blast radius", "steady state", "abort criteria", "Chaos Toolkit", "Chaos Mesh", "Litmus", "Gremlin", "AWS FIS", or any deliberate failure-injection question. Ships experiment designer, blast-radius calculator, and postmortem generator (all stdlib Python), 4 references on chaos principles + experiment design + attack taxonomy + tooling landscape, and a /chaos-experiment slash command. Composes with feature-flags-architect (kill switches as abort triggers) and kubernetes-operator (common chaos targets).
context: fork
version: 2.9.0
author: claude-code-skills
license: MIT
tags: [chaos-engineering, resilience, fault-injection, gameday, sre, reliability, chaos-toolkit, chaos-mesh, litmus, gremlin, aws-fis]
compatible_tools: [claude-code, codex-cli, cursor, antigravity, opencode, gemini-cli]
---
# 混沌工程

设计能够暴露生产系统真实弱点、但不会演变为故障的实验。大多数“混沌工程”尝试都会跳过稳态测量，不定义中止条件，也不限制爆炸半径。此技能强制执行必要的规范，使混沌实验既安全又实用。

## 何时使用

- 规划混沌实验（破坏什么、在哪里破坏、何时进行、如何中止）
- 在运行实验前计算爆炸半径
- 审查现有实验计划的安全性
- 选择混沌工具（Chaos Toolkit / Chaos Mesh / Litmus / Gremlin / AWS FIS）
- 编写混沌实验事后复盘
- 开展 Game Day 演练

## 何时不应使用

- 常规事件响应（使用 `incident-response`）
- 威胁狩猎 / 红队测试（使用 `red-team`、`threat-detection`）
- 性能负载测试（目标不同——混沌工程关注的是故障模式，而非容量）
- 生产环境调试（混沌工程用于预先发现弱点，而不是事后排查）

## 核心原则：没有中止条件的混沌实验就是一场故障

混沌工程的四项原则（Netflix，2016）：

1. **围绕稳态行为构建假设。** 不要问“什么会坏？”，而要问“X 能够保持；在故障 Y 下还能保持吗？”
2. **模拟真实世界中的事件。** 注入现实的故障：终止节点、降低网络速度、使缓存失效、限制依赖项。
3. **在生产环境中运行实验。** 预发布环境永远不会具备相同的故障模式。从小规模开始。
4. **将实验自动化并持续运行。** 一次性的混沌实验只是新闻稿；持续的混沌实验才是工程实践。

再增加第五项：**预先定义中止条件。** 没有中止条件的混沌实验，不过是换了个名字的故障。

## 快速开始

```bash
SKILL=engineering/chaos-engineering/skills/chaos-engineering

# 1. Design an experiment
python "$SKILL/scripts/experiment_designer.py" --target "checkout-svc" --hypothesis "p99 latency stays <500ms" --attack latency --duration-min 15

# 2. Calculate blast radius
python "$SKILL/scripts/blast_radius_calculator.py" --traffic-share 0.05 --user-pop 1000000 --duration-min 15

# 3. Generate postmortem after the experiment
python "$SKILL/scripts/experiment_postmortem.py" --plan experiment.json --result-log results.txt
```

## 三个 Python 工具

均仅使用标准库。使用 `--help` 运行。

### `experiment_designer.py`

根据输入生成结构化的实验计划。强制要求包含必要部分（假设、稳态指标、爆炸半径、中止条件、回滚）。

```bash
python scripts/experiment_designer.py \
  --target "checkout-svc" \
  --hypothesis "p99 latency stays <500ms when payment-svc is slow" \
  --attack latency \
  --magnitude "+200ms" \
  --duration-min 15 \
  --blast-radius "5% of US traffic" \
  --abort-if "p99 > 1000ms OR error_rate > baseline + 1pp"
```

输出一份 Markdown 计划，其中包含：假设、稳态、攻击、强度、持续时间、爆炸半径、中止条件、回滚流程、监控仪表板以及学习问题。

### `blast_radius_calculator.py`

计算计划实验的爆炸半径。根据流量占比 + 用户总量 + 持续时间，计算预计受影响用户数、预计错误预算消耗量和风险评分。

```bash
python scripts/blast_radius_calculator.py \
  --traffic-share 0.05 \
  --user-pop 1000000 \
  --duration-min 15 \
  --baseline-availability 0.999 \
  --expected-impact-availability 0.95
```

输出：
- 预计受影响用户数
- 消耗的错误预算（以错误预算分钟数计）
- 风险评分：GREEN / YELLOW / RED
- 建议：PROCEED / REDUCE / ABORT

GREEN = 错误预算的 <1%；YELLOW = 1-10%；RED = >10%。

### `experiment_postmortem.py`

根据实验计划 + 结果生成结构化的事后复盘。可识别常见的事后复盘失败模式：未记录经验、没有后续行动、使用带有指责意味的语言。

```bash
python scripts/experiment_postmortem.py --plan experiment.json --result-log results.txt
```

输出包含以下内容的 Markdown：摘要、假设（得到证实还是被推翻？）、我们学到了什么、哪些结果出乎意料、包含负责人的后续行动，以及下一个实验的链接。

## 7 种攻击类型（分类法）

不同的攻击会揭示不同的弱点。完整详情参见 `references/attack_taxonomy.md`。

| 攻击 | 测试内容 | 工具 |
|---|---|---|
| **延迟** | 超时、重试、断路器 | tc, Chaos Mesh `NetworkChaos` |
| **错误** | 错误处理、回退路径 | Chaos Mesh `HTTPChaos`, Toxiproxy |
| **资源**（CPU、内存、磁盘） | 饱和处理、自动扩缩容 | Chaos Mesh `StressChaos`, stress-ng |
| **网络分区** | 脑裂、共识、故障转移 | Chaos Mesh `NetworkChaos` partition |
| **依赖项故障** | 优雅降级、回退 | Service mesh fault injection |
| **时间** | 时钟偏移、NTP 问题 | libfaketime, Chaos Mesh `TimeChaos` |
| **基础设施**（终止实例） | 自动恢复、故障转移 | AWS FIS, Chaos Monkey |

选择与假设相匹配的攻击。“如果 X 变慢会发生什么？”→ 延迟。“如果 X 与网络断开会发生什么？”→ 网络分区。

## 工具选择器

| 工具 | 最适合 | 定价 | 技术栈 |
|---|---|---|---|
| **Chaos Toolkit** | 轻量级、与语言无关、基于 JSON 的实验 | 开源 | 任意 |
| **Chaos Mesh** | Kubernetes 原生、丰富的 CRD、集群内运行 | 开源 | Kubernetes |
| **Litmus** | Kubernetes、与 Argo 集成、丰富的实验库 | 开源 + 企业版 | Kubernetes |
| **Gremlin** | 企业级 SaaS、多云、审计 | 付费 | 任意 |
| **AWS FIS** | AWS 原生、与 IAM 集成、EC2/ECS/EKS | 付费（AWS） | AWS |
| **自定义** | 特殊需求、单一云平台、低预算 | 无 | 任意 |

决策规则：
- 仅使用 k8s 的技术栈 + 开源 → Chaos Mesh 或 Litmus（Litmus 拥有更丰富的实验库）
- 多云 + 开源 → Chaos Toolkit
- 以 AWS 为主 + 需求简单 → AWS FIS
- 企业级 + 审计/合规 → Gremlin

权衡取舍参见 `references/tooling_landscape.md`。

## 工作流

### 工作流 1：设计并运行单个实验

```
1. State a hypothesis: "When [fault], steady-state metric X stays within Y."
2. Identify the steady-state metric — must be measurable BEFORE the experiment.
3. Run blast_radius_calculator.py — confirm GREEN before proceeding.
4. Run experiment_designer.py to produce the plan.
5. Get a peer review of the plan; confirm abort criteria are concrete.
6. Notify the on-call team in #incidents (or whatever channel).
7. Run the experiment with monitoring open.
8. If abort criteria are hit, abort immediately; record what happened.
9. Run experiment_postmortem.py to capture learnings.
10. File follow-up actions; link to next experiment.
```

### 工作流 2：故障演练日

```
1. Pick a scenario (e.g., "primary database fails over").
2. Identify all dependent services that should keep working.
3. Build a multi-experiment plan covering each layer.
4. Schedule with stakeholders; on-call coverage required.
5. Run with a facilitator who manages the scenario.
6. Capture observations in a shared doc as they happen.
7. Single combined postmortem covering all observations.
8. Track follow-up actions in a board with owners.
```

### 工作流 3：持续混沌（故障演练日 → 每日）

```
1. Start: weekly Game Day in staging.
2. Move to: weekly Game Day in production with limited blast radius.
3. Mature to: continuous chaos via scheduled experiments (Litmus chaos schedule, Gremlin scenarios).
4. Wire to deployment: every prod deploy triggers a baseline chaos sweep.
5. Track: experiments per week, weaknesses discovered, MTTR trend.
```

## 与其他技能组合使用

此技能明确与该技能库中的另外两个技能组合使用：

| 技能 | 组合方式 |
|---|---|
| `feature-flags-architect` | 在该技能中定义的终止开关是此处的中止触发器 |
| `kubernetes-operator` | Operator 是常见的混沌测试目标（测试故障条件下的协调循环） |
| `incident-response` | 升级扩大的混沌实验将转为事故 |

## 反模式

- **没有假设** — “让我们破坏一些东西”是蓄意破坏，而不是工程实践
- **没有稳态指标** — 没有基线，就无法判断 X 是否发生故障
- **没有爆炸半径边界** — 在完整生产环境中进行无限制实验 = 服务中断
- **没有中止标准** — 见上文；这是强制要求
- **没有值班保障** — 没有监控的混沌测试就是无人监控的生产环境
- **仅在预发布环境中进行混沌测试** — 预发布环境永远不具备生产环境中的故障模式
- **在开发环境中进行混沌测试** — 毫无用处；开发环境与生产环境的故障模式不同
- **一次性混沌测试** — 单次实验只是一次新闻发布；学习需要反复进行
- **充满指责的事后复盘** — 记录原因，而不是归咎于人；否则团队将不再开展混沌测试

## 参考资料

- `references/chaos_principles.md` — 4 项原则、历史及何时开始
- `references/experiment_design.md` — 假设结构、稳态指标、中止标准
- `references/attack_taxonomy.md` — 7 种攻击类型及其示例和工具
- `references/tooling_landscape.md` — Chaos Toolkit / Mesh / Litmus / Gremlin / FIS / DIY

## 斜杠命令

`/chaos-experiment` — 运行全部 3 个工具的交互式实验设计向导。

## 资产模板

- `assets/experiment_template.md` — 可填写的计划模板
- `assets/postmortem_template.md` — 结构化事后复盘模板

## 可验证的成功标准

使用此技能的团队应实现：

- 100% 的混沌实验都具有书面假设、中止标准和爆炸半径计算
- 任何单次实验的爆炸半径都不超过错误预算的 10%
- 混沌实验之间的平均时间 <14 天（持续进行，而非一次性）
- 每次实验都会产生 ≥1 项已交付的后续行动
- 在过去 90 天内，没有任何混沌实验升级为影响客户的事故