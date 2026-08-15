---
name: estimate
description: "Estimates task effort by analyzing complexity, dependencies, historical velocity, and risk factors. Produces a structured estimate with confidence levels."
argument-hint: "[task-description]"
user-invocable: true
allowed-tools: Read, Glob, Grep
model: sonnet
---
## 阶段 1：理解任务

阅读参数中的任务描述。如果描述过于模糊，无法做出有意义的估算，请在继续之前要求澄清。

阅读 CLAUDE.md 以了解项目背景：技术栈、编码标准、架构模式以及所有估算指南。

如果任务与已有文档记录的功能或系统相关，请阅读 `design/gdd/` 中的相关设计文档。

---

## 阶段 2：扫描受影响的代码

确定需要修改的文件和模块：

- 评估复杂度（规模、依赖项数量、圈复杂度）
- 确定与其他系统的集成点
- 检查受影响区域现有的测试覆盖情况
- 阅读 `production/sprints/` 中过去的冲刺数据，了解类似已完成任务和历史开发速度

---

## 阶段 3：分析复杂度因素

**代码复杂度：**
- 受影响文件的代码行数
- 依赖项数量和耦合程度
- 是否涉及核心/引擎代码，而非叶子/功能代码
- 是否可以遵循现有模式，或需要采用新模式

**范围：**
- 涉及的系统数量
- 新增代码与修改现有代码的比例
- 所需新增测试覆盖的工作量
- 是否需要数据迁移或配置更改

**风险：**
- 新技术或不熟悉的库
- 不清晰或存在歧义的需求
- 依赖尚未完成的工作
- 跨系统集成的复杂度
- 性能敏感性

---

## 阶段 4：生成估算

```markdown
## Task Estimate: [Task Name]
Generated: [Date]

### Task Description
[Restate the task clearly in 1-2 sentences]

### Complexity Assessment

| Factor | Assessment | Notes |
|--------|-----------|-------|
| Systems affected | [List] | [Core, gameplay, UI, etc.] |
| Files likely modified | [Count] | [Key files listed below] |
| New code vs modification | [Ratio] | |
| Integration points | [Count] | [Which systems interact] |
| Test coverage needed | [Low / Medium / High] | |
| Existing patterns available | [Yes / Partial / No] | |

**Key files likely affected:**
- `[path/to/file1]` -- [what changes here]

### Effort Estimate

| Scenario | Days | Assumption |
|----------|------|------------|
| Optimistic | [X] | Everything goes right, no surprises |
| Expected | [Y] | Normal pace, minor issues, one round of review |
| Pessimistic | [Z] | Significant unknowns surface, blocked for a day |

**Recommended budget: [Y days]**

### Confidence: [High / Medium / Low]

[Explain which factors drive the confidence level for this specific task.]

### Risk Factors

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|

### Dependencies

| Dependency | Status | Impact if Delayed |
|-----------|--------|-------------------|

### Suggested Breakdown

| # | Sub-task | Estimate | Notes |
|---|----------|----------|-------|
| 1 | [Research / spike] | [X days] | |
| 2 | [Core implementation] | [X days] | |
| 3 | [Testing and validation] | [X days] | |
| | **Total** | **[Y days]** | |

### Notes and Assumptions
- [Key assumption that affects the estimate]
- [Any caveats about scope boundaries]
```

输出估算结果及简要摘要：建议预算、置信度和最主要的单一风险因素。

此技能为只读模式——不会写入任何文件。结论：**COMPLETE**——估算已生成。

---

## 阶段 5：后续步骤

- 如果置信度为低：建议在正式投入前进行有时间限制的探索性原型验证（`/prototype`）。
- 如果任务耗时 > 10 天：建议通过 `/create-stories` 将其拆分为更小的用户故事。
- 如需安排该任务：运行 `/sprint-plan update`，将其添加到下一个冲刺中。

### 指南

- 始终给出一个范围（乐观 / 预期 / 悲观），绝不只给出单一数字
- 建议预算应采用预期估算值，而不是乐观估算值
- 以半天为增量进行取整——对于耗时超过一天的任务，以小时为单位进行估算会造成虚假的精确感
- 不要悄悄为估算增加余量——应明确指出风险，以便团队作出决定