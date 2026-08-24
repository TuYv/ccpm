---
name: evolving-ai-agents
description: Provides guidance for automatically evolving and optimizing AI agents across any domain using LLM-driven evolution algorithms. Use when building self-improving agents, optimizing agent prompts and skills against benchmarks, or implementing automated agent evaluation loops.
version: 1.0.0
author: A-EVO Lab
license: MIT
tags: [Agent Evolution, Self-Improving Agents, Prompt Optimization, LLM, Benchmark Evaluation, Skill Discovery, Agentic AI]
dependencies: [a-evolve>=0.1.0, pyyaml>=6.0]
---
# 使用 A-Evolve 演进 AI 智能体

## 概述

A-Evolve 是一套通用基础设施，能够使用任意演进算法，在任何领域中演进任意 AI 智能体，且无需任何人工工程工作。它将所有可演进的智能体状态表示为文件（提示词、技能、记忆、工具），针对基准测试运行迭代式的求解—观察—演进循环，并使用由 LLM 驱动的变异来自动提升智能体性能。

**基准测试结果**（Claude Opus 4.6）：
- MCP-Atlas：79.4%（#1）
- SWE-bench Verified：76.8%（约 #5）
- Terminal-Bench 2.0：76.5%（约 #7）
- SkillsBench：34.9%（#2）

## 何时使用 A-Evolve

**在以下情况下使用 A-Evolve：**
- 针对可量化的基准测试优化智能体的提示词、技能或记忆
- 构建具备自动门控和回滚机制的自我改进型智能体
- 通过由 LLM 驱动的变异，演进特定领域的工具使用方式和操作流程
- 运行迭代式的求解—观察—演进循环，以最大限度提升智能体性能
- 需要为每项变更保留可复现且由 git 进行版本管理的演进历史

**关键差异**：其他框架用于_构建_智能体；A-Evolve 用于_优化_智能体。它可以构建在任何智能体框架之上，并通过自动化演进使其变得更好。

**请勿在以下情况下使用 A-Evolve：**
- 从头构建多智能体编排（请使用 CrewAI、LangGraph）
- 无需迭代的一次性智能体任务（请使用 LangChain、LlamaIndex）
- 优化 RAG 流水线（请使用 LlamaIndex、Chroma）
- 仅优化提示词，不涉及技能或记忆演进（请使用 DSPy）

## 快速开始

### 安装

```bash
pip install a-evolve                    # Core
pip install a-evolve[anthropic]         # With Claude support
pip install a-evolve[all]               # All providers
```

### 三行代码实现演进

```python
import agent_evolve as ae

evolver = ae.Evolver(agent="swe", benchmark="swe-verified")
results = evolver.run(cycles=10)
print(f"Final score: {results.final_score}")
```

这会复制内置的 SWE 种子工作区，针对 SWE-bench Verified 运行 10 个演进周期，并返回优化后的智能体。

## 核心概念

### 智能体工作区

所有可演进状态均以文件形式存放在工作区目录中：

```
my-agent/
├── manifest.yaml          # Metadata + entrypoint
├── prompts/
│   ├── system.md          # Main system prompt (evolved)
│   └── fragments/         # Modular prompt pieces
├── skills/
│   └── skill-name/
│       └── SKILL.md       # Reusable procedure with frontmatter
├── memory/
│   ├── episodic.jsonl     # Lessons from failures
│   └── semantic.jsonl     # General knowledge
├── tools/
│   ├── registry.yaml      # Tool manifest
│   └── tool_name.py       # Tool implementations
└── evolution/             # Managed by engine (metrics, history)
```

### 演进循环

每个周期遵循五个阶段：

1. **求解** — 智能体处理来自基准测试的一批任务
2. **观察** — 基准测试评估轨迹，生成（任务、轨迹、反馈）三元组
3. **演进** — 演进引擎根据观察结果对工作区文件进行变异
4. **门控** — 验证变异（在变异前后创建 git 快照，以便回滚）
5. **重新加载** — 智能体根据演进后的文件系统状态重新初始化

### 三个可插拔接口

```python
# 1. Agent — implements solve()
class MyAgent(ae.BaseAgent):
    def solve(self, task: ae.Task) -> ae.Trajectory:
        # Domain-specific solving logic
        return ae.Trajectory(task_id=task.id, output=result, steps=steps)

# 2. Benchmark — implements get_tasks() and evaluate()
class MyBenchmark(ae.BenchmarkAdapter):
    def get_tasks(self, split="train", limit=None) -> list[ae.Task]:
        return [ae.Task(id="1", input="...")]

    def evaluate(self, task: ae.Task, trajectory: ae.Trajectory) -> ae.Feedback:
        return ae.Feedback(success=True, score=0.95, detail="Passed")

# 3. Engine — implements step()
class MyEngine(ae.EvolutionEngine):
    def step(self, workspace, observations, history, trial):
        # Mutate workspace based on observations
        return ae.StepResult(mutated=True, summary="Updated prompts")
```

## 工作流 1：演化现有智能体

**适用场景**：你已有一个可正常工作的智能体，并希望针对某个基准测试对其进行优化。

**关键要求：**
- [ ] 智能体实现 `BaseAgent.solve()`，并返回 `Trajectory`
- [ ] 基准测试实现 `BenchmarkAdapter`，其中包含 `get_tasks()` 和 `evaluate()`
- [ ] 初始工作区包含 `manifest.yaml`，其中指定入口点和可演化层
- [ ] 系统提示词位于 `prompts/system.md`
- [ ] 工作区是一个 git 仓库（运行 `git init && git add -A && git commit -m "init"`）

### 步骤

```python
import agent_evolve as ae

# Configure evolution parameters
config = ae.EvolveConfig(
    batch_size=10,           # Tasks per solve round
    max_cycles=20,           # Maximum evolution iterations
    evolve_prompts=True,     # Mutate system prompt
    evolve_skills=True,      # Discover and refine skills
    evolve_memory=True,      # Build episodic memory
    evolver_model="us.anthropic.claude-opus-4-6-v1",
)

# Point to your agent workspace and benchmark
evolver = ae.Evolver(
    agent="./my-agent-workspace",
    benchmark="swe-verified",     # Or custom BenchmarkAdapter instance
    config=config,
)

# Run evolution
results = evolver.run(cycles=10)

# Inspect results
print(f"Cycles completed: {results.cycles_completed}")
print(f"Final score: {results.final_score}")
print(f"Converged: {results.converged}")
for cycle_num, score in enumerate(results.score_history):
    print(f"  Cycle {cycle_num + 1}: {score:.3f}")
```

### 演化后

工作区现已完成优化。检查发生了哪些变化：

```bash
cd my-agent-workspace
git log --oneline              # See evo-1, evo-2, ... tags
git diff evo-1 evo-10          # Compare first and last evolution
cat prompts/system.md          # Read evolved prompt
ls skills/                     # See discovered skills
```

## 工作流 2：添加自定义基准测试

**适用场景**：你希望使用自己的领域特定任务来演化智能体。

**关键要求：**
- [ ] 定义任务格式（输入、预期输出）
- [ ] 实现评分逻辑（0.0–1.0 范围）
- [ ] 准备任务数据集（训练集 + 留出集）

### 步骤

```python
import agent_evolve as ae

class CodeReviewBenchmark(ae.BenchmarkAdapter):
    """Evaluate agents on code review quality."""

    def get_tasks(self, split="train", limit=None):
        tasks = load_review_dataset(split)
        if limit:
            tasks = tasks[:limit]
        return [
            ae.Task(id=t["id"], input=t["diff"], metadata={"expected": t["comments"]})
            for t in tasks
        ]

    def evaluate(self, task, trajectory):
        expected = task.metadata["expected"]
        actual = trajectory.output
        precision, recall = compute_review_metrics(expected, actual)
        f1 = 2 * precision * recall / (precision + recall + 1e-9)
        return ae.Feedback(
            success=f1 > 0.7,
            score=f1,
            detail=f"P={precision:.2f} R={recall:.2f} F1={f1:.2f}",
        )

# Use with any agent
evolver = ae.Evolver(agent="./my-agent", benchmark=CodeReviewBenchmark())
results = evolver.run(cycles=5)
```

## 工作流 3：创建自定义进化引擎

**适用场景**：默认的 LLM 驱动变异不适合你的领域。

### 步骤

```python
import agent_evolve as ae

class RuleBasedEngine(ae.EvolutionEngine):
    def step(self, workspace, observations, history, trial):
        failures = [o for o in observations if not o.feedback.success]
        if not failures:
            return ae.StepResult(mutated=False, summary="No failures to address")

        # Analyze failure patterns
        error_types = categorize_errors(failures)
        prompt = workspace.read_prompt()

        # Append learned rules to prompt
        new_rules = generate_rules(error_types)
        workspace.write_prompt(prompt + "\n" + new_rules)

        return ae.StepResult(
            mutated=True,
            summary=f"Added {len(new_rules)} rules from {len(failures)} failures",
        )

evolver = ae.Evolver(
    agent="./my-agent",
    benchmark="my-benchmark",
    engine=RuleBasedEngine(),
)
```

## 内置组件

### 种子智能体

| 智能体 | 领域 | 模型 | 主要特性 |
|-------|--------|-------|-------------|
| `swe` | SWE-bench | Claude Opus 4.6 | 验证-修复循环、技能提案 |
| `terminal` | Terminal-Bench | Claude Sonnet 4 | 并发超时、环境探测 |
| `mcp` | MCP-Atlas | Claude Opus 4.6 | MCP 服务器集成 |

### 基准测试

| 名称 | 领域 | 指标 |
|------|--------|--------|
| `swe-verified` | 代码修补 | 通过率 |
| `mcp-atlas` | 工具调用 | 准确率 |
| `terminal2` | Shell 任务 | 通过率 |
| `skill-bench` | 多步骤流程 | 准确率 |
| `arc-agi-3` | 交互式游戏 | RHAE 分数 |

### 进化算法

| 算法 | 策略 | 最适合 |
|-----------|----------|----------|
| A-Evolve/SkillForge | LLM 驱动的工作区变异 | 通用场景 |
| Guided Synthesis | 记忆优先、精选技能 | 技能发现 |
| Adaptive Evolution | 奖励跟踪、筛选后的观察结果 | 细粒度控制 |
| Adaptive Skill | 以技能为中心的优化 | 技能密集型领域 |

## 配置参考

```python
ae.EvolveConfig(
    batch_size=10,              # Tasks per solve round
    max_cycles=20,              # Max evolution iterations
    holdout_ratio=0.2,          # Test set split for gating
    evolve_prompts=True,        # Mutate system prompts
    evolve_skills=True,         # Discover/refine skills
    evolve_memory=True,         # Build episodic memory
    evolve_tools=False,         # Mutate tool implementations
    trajectory_only=False,      # Hide scores from evolver
    evolver_model="us.anthropic.claude-opus-4-6-v1",
    evolver_max_tokens=16384,
    egl_threshold=0.05,         # Convergence epsilon
    egl_window=3,               # Cycles for plateau detection
)
```

**收敛**：如果最近 `egl_window` 个周期内的分数提升小于 `egl_threshold`，进化将提前停止。

## Skill 格式

Skill 是在进化过程中发现并完善的可复用流程：

```markdown
---
name: verify-edge-cases
description: "TRIGGER when: checking boundary conditions. DO NOT TRIGGER: for happy-path tests."
---

## Pattern
Test all falsy-but-valid values: 0, False, "", [], {}

## Process
1. List all input boundaries
2. Run each against the implementation
3. Check both output AND side effects
```

Skill 会累积在工作区的 `skills/` 目录中。进化器会对其进行整理：接受新的 Skill、合并重叠的 Skill、跳过冗余提案。目标是保留 5–10 个宽泛的 Skill，而不是 30 个狭窄的 Skill。

## 常见问题

### 进化分数过早进入平台期

**原因**：批次大小过小，或者进化器没有看到足够多样的失败情况。  
**解决方法**：增大 `batch_size`（可尝试 15–20），并确保基准测试任务涵盖多种失败模式。设置 `trajectory_only=False`，让进化器能够看到分数。

### Agent 工作区变得过大

**原因**：接受每个提案导致 Skill 库膨胀。  
**解决方法**：默认的 SkillForge 引擎会自动整理 Skill。如果使用自定义引擎，请实现合并逻辑，将重叠的 Skill 整合起来。

### 进化期间发生 Git 冲突

**原因**：在同一个工作区中进行了多次进化运行。  
**解决方法**：每次 `evolver.run()` 都应该在各自独立的工作区副本上运行。使用 `Evolver(agent="seed-name")`，可在每次运行时自动复制种子。

### 进化期间出现 LLM 提供商错误

**原因**：进化器模型遇到速率限制或身份验证问题。  
**解决方法**：检查 `evolver_model` 配置。对于 Bedrock，请确保已配置 AWS 凭证。对于 Anthropic，请设置 `ANTHROPIC_API_KEY`。

### 自定义 Agent 未加载进化后的状态

**原因**：Agent 未实现 `reload_from_fs()`。  
**解决方法**：在你的 `BaseAgent` 子类中重写 `reload_from_fs()`，以便在每个进化周期结束后，从工作区重新读取提示词、Skill 和记忆。

## Agent 使用说明

加载此 Skill 后：

1. 在实现任何进化工作流之前，**完整阅读此文件**
2. **从快速入门开始**——先让最小化的进化流程运行起来，再进行自定义
3. **尽可能使用内置种子**——`"swe"`、`"terminal"`、`"mcp"` 均采用了经过实战检验的配置
4. 在运行进化之前，务必在自定义工作区中**初始化 git**
5. **检查收敛设置**——默认的 `egl_threshold=0.05` 和 `egl_window=3` 对你的领域而言可能过于激进
6. 每次运行后，**检查进化后的状态**——阅读 `prompts/system.md` 和 `skills/`，了解进化器学到了什么

**专业提示：**
- 将 `trajectory_only=False`（默认值），以便进化器能够看到分数——这会加速学习
- 从 `batch_size=10` 开始，并根据任务多样性进行调整
- 使用 `holdout_ratio=0.2`，防止对训练任务过拟合
- 进化完成后，`git diff evo-1 evo-N` 可显示所有变异的累积效果
- 如果进化器未能发现技能，请在 `feedback.detail` 字符串中补充具体的失败原因

**警示信号：**
- 分数在各周期之间振荡 → 基准评估可能具有非确定性
- 技能目录增长至超过 15 个技能 → 引擎未能正确合并或筛选技能
- 提示词增长至超过 10K 字符 → 进化过程只在追加内容，而未进行重构
- 经过 2-3 个周期后 `converged=True` → 增大 `egl_window` 并减小 `egl_threshold`

## 参考资料

- **架构深入解析**：参见 [references/architecture.md](references/architecture.md)
- **API 参考**：参见 [references/api.md](references/api.md)
- **分步教程**：参见 [references/tutorials.md](references/tutorials.md)
- **真实案例**：参见 [references/examples.md](references/examples.md)
- **GitHub 问题与解决方案**：参见 [references/issues.md](references/issues.md)
- **设计模式**：参见 [references/design-patterns.md](references/design-patterns.md)
- **发布历史**：参见 [references/releases.md](references/releases.md)