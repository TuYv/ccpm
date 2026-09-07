---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---
# 编写计划

## 概述

编写详尽的实现计划，假设这位工程师对我们的代码库毫无背景知识，而且品味存疑。把他们需要知道的一切都写进文档：每个任务要改动哪些文件、代码、测试、他们可能需要查阅的文档、如何测试。以一口大小的任务形式把完整计划交给他们。DRY。YAGNI。TDD。频繁提交。

假设他们是一位技术娴熟的开发者，但对我们的工具集或问题领域几乎一无所知。假设他们不太擅长良好的测试设计。

**开始时宣布：**“我正在使用 writing-plans 技能来创建实现计划。”

**上下文：**如果在隔离的 worktree 中工作，它应当是在执行时通过 `superpowers:using-git-worktrees` 技能创建的。

**计划保存至：**`docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`
- （用户对计划存放位置的偏好设置会覆盖此默认值）

## 范围检查

如果规格说明涵盖多个独立的子系统，那么它本应在头脑风暴阶段就被拆分为多个子项目规格说明。如果没有，建议将其拆分为多个独立的计划——每个子系统一个。每个计划都应能独立产出可运行、可测试的软件。

## 文件结构

在定义任务之前，先梳理出将要创建或修改哪些文件，以及每个文件各自负责什么。分解决策就在这里敲定。

- 设计具有清晰边界和明确定义接口的单元。每个文件应有一个明确的职责。
- 你对能一次性纳入上下文的代码推理得最好，而当文件高度聚焦时，你的编辑也更可靠。优先选择较小、聚焦的文件，而非承担过多职责的大文件。
- 一起变更的文件应放在一起。按职责拆分，而非按技术分层拆分。
- 在现有代码库中，遵循既有模式。如果代码库使用大文件，不要擅自重构——但如果你要修改的文件已经变得臃肿难控，在计划中包含一次拆分是合理的。

这一结构为任务分解提供依据。每个任务应产出可独立成立的自包含变更。

## 任务规模把控

一个任务是承载自身测试周期、且值得交给一位新评审者把关的最小单元。在划定任务边界时：把设置、配置、脚手架和文档步骤并入其交付物需要它们的那个任务中；只在评审者有可能有理由否决某个任务却批准其相邻任务之处才进行拆分。每个任务都以一个可独立测试的交付物收尾。

## 一口大小的任务粒度

**每一步都是一个动作（2-5 分钟）：**
- “编写失败的测试” - 步骤
- “运行它以确保它失败” - 步骤
- “实现让测试通过的最小代码” - 步骤
- “运行测试并确保它们通过” - 步骤
- “提交” - 步骤

## 计划文档头部

**每个计划都必须以此头部开始：**

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

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

## 禁止占位符

每一步都必须包含工程师所需的实际内容。这些就是**计划失败**——绝不要写出它们：
- “TBD”、“TODO”、“以后再实现”、“补充细节”
- “添加适当的错误处理”/“添加验证”/“处理边界情况”
- “为上述内容编写测试”（却没有实际的测试代码）
- “与任务 N 类似”（把代码重复写出来——工程师可能不按顺序阅读任务）
- 只描述做什么却不展示如何做的步骤（代码步骤必须提供代码块）
- 引用了未在任何任务中定义的类型、函数或方法

## 记住
- 始终使用精确的文件路径
- 每一步都包含完整代码——如果某一步会改动代码，就展示代码
- 精确的命令及其预期输出
- DRY、YAGNI、TDD、频繁提交

## 自我审查

写完完整计划后，以全新的眼光重新审视规格说明，并对照它检查计划。这是一份由你自己运行的检查清单——而不是派发子代理。

**1. 规格覆盖度：**快速浏览规格说明中的每个章节/需求。你能指出实现它的任务吗？列出所有缺口。

**2. 占位符扫描：**在你的计划中搜索危险信号——上文“禁止占位符”一节中的任何模式。把它们修复。

**3. 类型一致性：**你在后续任务中使用的类型、方法签名和属性名，是否与你在早期任务中定义的相匹配？一个函数在任务 3 中叫 `clearLayers()`、在任务 7 中却叫 `clearFullLayers()`，这就是一个 bug。

如果发现问题，就地修复。无需重新审查——修完即继续。如果发现某项规格需求没有对应任务，就补上该任务。

## 执行交接

保存计划后，提供执行方式选择：

**“计划已完成并保存至 `docs/superpowers/plans/<filename>.md`。两种执行方案：**

**1. 子代理驱动（推荐）** - 我为每个任务派发一个全新的子代理，在任务之间进行审查，快速迭代

**2. 内联执行** - 在本会话中使用 executing-plans 执行任务，带检查点的批量执行

**选哪种方案？”**

**如果选择子代理驱动：**
- **必需的子技能：**使用 superpowers:subagent-driven-development
- 每个任务一个全新子代理 + 两阶段审查

**如果选择内联执行：**
- **必需的子技能：**使用 superpowers:executing-plans
- 带审查检查点的批量执行
