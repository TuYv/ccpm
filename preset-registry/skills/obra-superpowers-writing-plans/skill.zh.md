---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---
# 编写计划

## 概览

撰写全面的实现计划，前提是工程师对我们的代码库几乎没有上下文并且品味存疑。记录他们需要知道的一切：每个任务需要修改哪些文件、可能需要查看的代码、测试和文档，以及如何进行测试。以小步任务的形式提供完整计划。遵循 DRY、YAGNI、TDD，频繁提交。

假设他们是技术娴熟的开发者，但对我们的工具链或问题领域几乎一无所知。假设他们并不擅长设计良好的测试。

**在开始时宣布：** "我正在使用 writing-plans skill 来创建实现计划。"

**上下文：** 如果在隔离工作树中工作，应在执行时通过 `superpowers:using-git-worktrees` skill 创建它。

**保存计划到：** `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`  
-（用户对计划位置的偏好会覆盖此默认路径）

## 范围检查

如果规范覆盖多个独立子系统，应在头脑风暴阶段拆分为子项目规范。如果没有拆分，应建议按子系统拆分——每个计划应能独立产出可测试的软件。

## 文件结构

在定义任务之前，先梳理将创建或修改的文件以及各自职责。这是锁定拆分决策的关键。

- 设计职责边界清晰、接口定义明确的单元。每个文件应承担单一职责。
- 你最适合推理并一次性把握上下文中的代码规模有限，你的编辑在文件聚焦时更可靠。应优先使用更小、职责更明确的文件，而不是过于臃肿的文件。
- 应该一起修改的文件应放在一起。按职责拆分，而不是按技术层次拆分。
- 在现有代码库中遵循既定模式。若代码库普遍使用大文件，不要单方面重构；但若你要修改的文件过于庞大，计划中包含拆分是合理的。

此结构用于任务拆解。每个任务应产生彼此独立、逻辑自洽的变更。

## 任务粒度控制

任务是承载自身测试周期并值得重新走评审门禁的最小单元。在划定任务边界时：将设置、配置、脚手架和文档步骤并入需要它们的任务；只在评审者可以在批准相邻任务时拒绝其中一个任务时才拆分。每个任务都应以可独立测试的交付成果收尾。

## 小步任务粒度

**每个步骤为一个动作（2-5 分钟）：**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

## 计划文档头部

**每个计划必须以此头部开头：**

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

**Spec:** [path to the spec/design doc this plan implements — the plan
argues from the spec, so the spec travels with it; executors read both]

## Global Constraints

[The spec's project-wide requirements — version floors, dependency limits,
naming and copy rules, platform requirements — one line each, with exact
values copied verbatim from the spec. Every task's requirements implicitly
include this section.]

---
```

## 任务结构

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

**Interfaces:**
- Consumes: [what this task uses from earlier tasks — exact signatures]
- Produces: [what later tasks rely on — exact function names, parameter
  and return types. A task's implementer sees only their own task; this
  block is how they learn the names and types neighboring tasks use.]

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

## 无占位符

每个步骤都必须包含工程师实际需要的内容。这些是**计划失败**，切勿编写：
- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above"（未提供具体测试代码）
- "Similar to Task N"（重复代码——执行者可能按顺序之外阅读任务；应重复展示代码）
- 描述该做什么但未说明如何做的步骤（代码步骤需附代码块）
- 引用未在任何任务中定义的类型、函数或方法

## 自我审查

在完整撰写计划后，再次审视规范并校验计划。此为自检清单——不是派遣子代理执行。

**1. 需求覆盖：** 浏览规范的每个章节/要求。是否能指出某个任务在实现它？列出所有缺口。

**2. 占位符扫描：** 检查计划中是否出现红旗——“无占位符”部分中的任何模式。发现问题后修正。

**3. 类型一致性：** 你在后续任务中使用的类型、方法签名和属性名是否与前序任务定义一致？若 Task 3 中是 `clearLayers()`，Task 7 中却写成 `clearFullLayers()`，则存在问题。

若发现问题，直接内联修复。无须重做全流程审查：修复并继续。若发现某项规范要求没有对应任务，则补充该任务。

## 执行交接

在保存计划后，给出执行方式：

**"Plan complete and saved to `docs/superpowers/plans/<filename>.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - 我在每个任务中派发全新子代理，任务间复核，快速迭代

**2. Inline Execution** - 在本会话中使用 executing-plans 执行任务，批量执行并按检查点复核

**你想采用哪种方式？**

**如果选择 Subagent-Driven：**
- **REQUIRED SUB-SKILL:** 使用 superpowers:subagent-driven-development
- 每个任务使用新的子代理 + 两阶段复核

**如果选择 Inline Execution：**
- **REQUIRED SUB-SKILL:** 使用 superpowers:executing-plans
- 按批次执行并设置检查点用于复核
