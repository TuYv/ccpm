---
name: reasoning-trace-optimizer
description: "Debug and optimize AI agents by analyzing reasoning traces, context degradation, tool confusion, instruction drift, repeated task failures, and performance regressions."
---
# 推理轨迹优化器

通过分析 AI 智能体的推理轨迹，对其进行调试和优化。此技能利用 MiniMax M2.1 的交错式思考能力，深入洞察智能体的决策过程，并生成具体的改进方案。

## 何时启用

- 需要对智能体的推理轨迹进行调试、分析或提示词优化
- 智能体任务失败，且用户希望了解失败原因
- 用户提到“上下文退化”“工具混淆”或“指令漂移”
- 请求提升智能体性能或减少错误
- 用户希望从调试会话中生成可分享的经验总结
- 在类似任务反复失败后

## 核心概念

### 交错式思考

与仅在开始时进行一次思考的标准推理模型不同，交错式思考允许在每次工具交互之间进行推理。这一点至关重要，因为：

1. **长周期任务**需要在多轮交互中持续保持专注
2. **外部扰动**（工具输出、环境变化）需要实时适应
3. **调试**需要了解决策是如何做出的，而不仅仅是输出了什么

### 优化循环

```
Execute Agent → Capture Traces → Analyze Patterns → Optimize Prompt → Re-run
                                                          ↑____________|
```

每次迭代都会根据检测到的模式改进提示词，直至收敛。

### 模式检测

分析器能够检测的常见失败模式：

| 模式 | 描述 |
|---------|-------------|
| `context_degradation` | 模型在较长的上下文中无法持续跟踪信息 |
| `tool_confusion` | 模型误解工具的功能或输出 |
| `instruction_drift` | 模型逐渐偏离原始指令 |
| `goal_abandonment` | 模型停止追求原始目标 |
| `circular_reasoning` | 模型重复执行相似操作，却没有取得进展 |
| `premature_conclusion` | 模型在完成任务前就得出结论 |

## 使用模式

### 模式 1：M2.1 智能体调试

通过 M2.1 运行任务并分析其推理过程：

```python
from reasoning_trace_optimizer import TraceCapture, TraceAnalyzer

capture = TraceCapture()
trace = capture.run(
    task="Search for Python tutorials and summarize them",
    system_prompt="You are a research assistant.",
    tools=[search_tool],
    tool_executor=execute_search
)

analyzer = TraceAnalyzer()
analysis = analyzer.analyze(trace)

print(f"Score: {analysis.overall_score}/100")
for pattern in analysis.patterns:
    print(f"Found: {pattern.type.value} - {pattern.suggestion}")
```

### 模式 2：完整优化循环

自动迭代，直至提示词得到优化：

```python
from reasoning_trace_optimizer import OptimizationLoop, LoopConfig

config = LoopConfig(
    max_iterations=5,
    min_score_threshold=80.0,
)

loop = OptimizationLoop(config=config)
result = loop.run(
    task="Analyze this codebase and suggest improvements",
    initial_prompt="You are a code reviewer.",
    tools=[read_file_tool, search_tool],
    tool_executor=execute_tool
)

print(f"Improved: {result.initial_score} → {result.final_score}")
print(f"Final prompt:\n{result.final_prompt}")
```

### 模式 3：通用会话分析

分析任意智能体先前的思考过程（适用于 Claude、GPT 等）：

在 Claude Code 中激活此技能后，它可以分析当前会话的思考块，以识别问题并提出改进建议。

```
/reasoning-trace-optimizer analyze-session
```

### 模式 4：生成可共享的技能

将优化经验转化为可复用的智能体技能：

```python
from reasoning_trace_optimizer import SkillGenerator

generator = SkillGenerator()
skill_path = generator.generate(
    result=loop_result,
    skill_name="web-search-best-practices",
    output_dir="./skills"
)
```

## CLI 命令

```bash
# Capture reasoning trace
rto capture "Search for Python tutorials" -s "You are a helpful assistant."

# Analyze a task
rto analyze "Debug this code" -o analysis.txt

# Run optimization loop
rto optimize "Research AI papers" --max-iterations 5 --generate-skill

# Generate skill from artifacts
rto generate-skill my-skill-name --artifacts-dir ./optimization_artifacts
```

## 与 Claude Code 集成

### 失败时自动触发

添加到你的钩子中，以自动分析失败：

```json
{
  "hooks": {
    "post_tool_error": {
      "command": "rto analyze-session --last-error"
    }
  }
}
```

### 按需分析

使用斜杠命令分析当前会话：

```
/reasoning-trace-optimizer
```

这将：
1. 从当前会话中提取思考块
2. 识别模式和问题
3. 提出提示词改进建议
4. 可选择更新系统提示词

## 指南

1. **保留完整上下文**：M2.1 需要包含思考块在内的完整响应历史记录，才能实现最佳性能
2. **使用适当的工具**：清晰定义工具，并提供明确无歧义的描述
3. **设置切合实际的收敛阈值**：每次迭代通常可提升 5-10%
4. **审核生成的技能**：自动生成的技能应在共享前进行审核
5. **监控令牌使用量**：每次优化迭代都会使用大量令牌

## 示例

### 优化前

```
System: You are a helpful assistant.

Issue: Agent called wrong tools, lost track of goal after 3 turns
Score: 45/100
Patterns: tool_confusion, goal_abandonment
```

### 优化后

```
System: You are a research assistant focused on finding accurate information.

IMPORTANT GUIDELINES:
- Always verify search results before summarizing
- If a tool returns an error, try an alternative approach
- Keep track of your original goal throughout the task
- Validate findings against multiple sources when possible

Issue: None
Score: 85/100
Patterns: None detected
```

## 参考资料

- MiniMax M2.1 文档：https://platform.minimax.io/docs
- 交错思考指南：参见 `docs/interleavedthinking.md`
- 智能体泛化：参见 `docs/agentthinking.md`

---

## 技能元数据

**创建日期**：2025-01-11
**作者**：Muratcan Koylan
**版本**：0.1.0
**技术支持**：MiniMax M2.1
**合作关系**：与 MiniMax AI 合作构建