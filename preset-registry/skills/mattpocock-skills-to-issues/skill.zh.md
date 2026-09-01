---
name: to-issues
description: Break a plan, spec, or PRD into independently-grabbable issues on the project issue tracker using tracer-bullet vertical slices.
disable-model-invocation: true
---
# 转为 Issue

将计划拆分为可独立认领的 **tracer bullet**（垂直切片）。

issue 跟踪器与 triage 标签词汇应已提供给你——如果没有，请运行 `/setup-matt-pocock-skills`。

## 流程

### 1. 收集上下文

基于对话上下文中已有的信息开展工作。如果用户将 issue 引用（issue 编号、URL 或路径）作为参数传入，请从 issue 跟踪器获取该 issue 并读取其完整正文与评论。

### 2. 探查代码库（可选）

如果你还未探索过代码库，请进行探索以了解当前状态。issue 标题和描述应使用项目领域词汇表（glossary）中的术语，并遵循你将要涉及区域的 ADR。

寻找机会对代码进行预重构，以便更容易实现。“先把改动变简单，再做简单的改动”（Make the change easy, then make the easy change）。

### 3. 拆分 issue

按 **Vertical slice rules** 将计划拆解为 **tracer bullet** issue。**wide refactor** 是该规则的例外——应改为用 **expand–contract** 进行切分（见 **Wide refactors**）。

### 4. 询问用户

将拟议的拆分结果以编号列表展示。每个切片需包含：

- **标题**：简洁描述性名称
- **阻塞于**：需先完成的其他切片（如有）
- **覆盖的用户故事**：该切片覆盖的用户故事（若源材料有）

向用户提问：

- 粒度是否合适？（过于粗/过于细）
- 依赖关系是否正确？
- 是否需要合并或进一步拆分某些切片？

持续迭代直到用户确认拆分方案。

### 5. 将 issue 发布到 issue 跟踪器

对每个获批切片，按 **Issue body template** 在 issue 跟踪器中发布新 issue。这些 issue 被视为可交给 AFK agent 执行的状态，因此应使用正确的 triage 标签发布，除非另有说明。

按依赖顺序发布 issue（先发布阻塞项），这样你可以引用真实的 issue 标识符。若 tracker 支持，建议将每个切片链接为其父 issue 的原生子任务，并将每个阻塞项作为原生阻塞边（详见 issue-tracker 文档）；否则可使用 **## Parent** 和 **## Blocked by** 作为兜底。  
**不要**关闭或修改任何父 issue。

## 参考

### Vertical slice rules

每个 issue 都是覆盖所有集成层的一条细粒度纵向切片，而不是只覆盖某一层的横向切片。

- 每个切片都应提供一条窄但完整的端到端路径（从 schema 到 API、UI、测试）
- 单个切片应可单独演示或验证
- 任何预重构应先行完成

### Wide refactors

**wide refactor** 是一种机械式变更——例如重命名列、重定义共享符号——其影响范围横跨整个代码库，在单一编辑中会同时打断大量调用点，导致任何纵向切片都无法独立通过。不要将其强行拆成 tracer bullet；应按 **expand–contract** 序列处理。先展开：新增新形式并与旧形式并存以避免 break。再按影响范围分批迁移调用点（按包、按目录），每批为一个 issue，并以展开任务为阻塞项，保持每批单独能绿并让旧形式继续存在。最后收缩：在确认无调用方后删除旧形式，该 issue 阻塞于每个迁移批次。若连批次都无法独立保持绿灯，可继续该序列，但让它们共享一个集成分支，全部阻塞于一个最终的集成验证 issue——绿色仅在该 issue 上被保证。

### Issue body template

<issue-template>
## Parent

A reference to the parent issue on the issue tracker (if the source was an existing issue, otherwise omit this section).

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

Avoid specific file paths or code snippets — they go stale fast. Exception: if the `/prototype` skill produced code that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), add a context pointer to where that prototype code lives rather than inlining it.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- A reference to the blocking ticket (if any)

Or "None - can start immediately" if no blockers.
</issue-template>
