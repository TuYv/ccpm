---
name: ln-72-current-architecture-documenter
description: "Documents implemented current-state architecture from repository evidence. Use for onboarding or migration baselines; not for target design, audit verdicts, or code changes."
---
# 当前架构文档编写器

**目标：** 生成一份对已检出仓库中实际实现的架构的可信快照。记录现存内容及其行为方式；不要对其评分、规定目标架构、修复代码，或将预期中的图示当作事实。

**执行契约：** 将下面按顺序排列的复选框工作流视为本技能的完成定义。将每个复选框追踪为 `PENDING`，然后根据具体证据将其解决为 `PROVEN`，根据其条件触发器不存在的证据将其解决为 `CLEARED`，或标记为 `UNPROVEN`；阅读、提及、委派、跳过或工具失败都不构成证明。
返回前，解决所有 `PENDING`，仅将 `PROVEN` 和 `CLEARED` 项计为完成，对每个 `UNPROVEN` 应用本技能的判定、决策和批准规则，并在开头添加 **Checklist: X/Y complete**<br>**Incomplete: None | section/item — reason; outcome impact; exact next action**；列出所有 `UNPROVEN` 项。

## 工具路由

| 需求 | 首选能力 | 备用方案 |
|---|---|---|
| 快照身份和工作区状态 | Git 状态、分支、远程仓库和 HEAD | 将所提供的快照记录为 `UNVERIFIED` |
| 结构和配置 | 原生列表、搜索、清单文件和直接文件读取 | 进行范围有限的手动检查 |
| 符号、依赖项和使用者 | 语言智能或已解析的依赖工具 | 搜索定义、注册、导入和调用方 |
| 运行时和部署拓扑 | 入口点、IaC、容器、CI、配置和运行时证据 | 将部署关系标记为 `UNKNOWN` |
| 文档修改 | 对已批准的架构文档进行最小化补丁修改 | 如果没有获得可写路径授权，则返回 `BLOCKED` |

优先使用本地证据，而不是远程仓库状态。路径、图示或命名约定在可执行的接线关系或权威契约确认之前，都只是线索。

## 产物规则

- 复用清晰的当前状态架构文档；否则使用 `docs/architecture/current-state.md`。
- 将文档锚定到远程仓库、分支、HEAD、工作区状态和观察日期。
- 使用文件路径、符号、命令或配置键引用重要声明。
- 将声明标记为 `OBSERVED`、`DOCUMENTED`、`INFERRED` 或 `UNKNOWN`。
- 将实际结构与预期的目标设计及审计发现分开。
- 先绘制整个系统的映射，然后仅深入解释关键行为所需的两到三个区域。
- 保留矛盾和不确定性，不要根据偏好消解它们。
- 优先采用面向职责的描述，而不是穷举文件清单。
- 记录证据截止范围，以便读者区分未检查的范围与确实不存在的内容。
- 仅在易变的计数或清单会影响架构理解时保留它们。

## 检查清单

### 1. 建立文档契约

- [ ] 确定仓库范围、目标读者、批准的目标位置、所需深度和语言。
- [ ] 阅读仓库说明，并记录快照身份及工作区存在未提交更改时的限制。
- [ ] 搜索现有的当前状态、基线、目标设计、决策、图示和部署产物。
- [ ] 复用明确无歧义的当前状态文档，或选择默认路径，避免重复记录项目知识。
- [ ] 除已批准的架构文档外，保持本次运行只读。

### 2. 映射系统广度

- [ ] 根据 manifests 和 CI，识别语言、框架、package roots、generated surfaces 以及规范的构建或运行命令。
- [ ] 识别用户、外部系统、入口点、应用程序、服务、进程、worker、计划任务和部署单元。
- [ ] 映射主要领域或模块、职责、所有权和依赖方向。
- [ ] 映射数据存储、缓存、队列、文件、外部 API、schema 以及事实来源系统。
- [ ] 记录公共接口、运行时发现、注册、配置组合方式和环境边界。
- [ ] 记录构建、部署、扩展和故障边界，不要根据目录名称推断独立性。

### 3. 追踪关键行为

- [ ] 根据业务重要性和架构覆盖范围，选择具有代表性的关键流程。
- [ ] 从参与者或触发器开始，经过入口点、运行时协调、领域行为、持久化或集成，到可观测结果，追踪每个流程。
- [ ] 在有证据的情况下，记录同步和异步跳转、事务归属、一致性、重试、超时、幂等性和错误传播。
- [ ] 描述从仓库证据中可见的部署、启动、关闭、健康检查、可观测性和恢复路径。
- [ ] 仅深入最复杂的两到三个子系统；不要将普通实现细节写入架构文档。

### 4. 编写当前状态产物

- [ ] 编写快照标识、系统上下文、组件清单、职责、依赖和数据流、运行时拓扑、关键流程、部署、所有权以及证据索引。
- [ ] 在文档中内嵌最少但有用的图表，或通过路径链接现有图表产物。
- [ ] 区分已观察到的实现和已记录的意图，并明确列出偏差或矛盾，不要为其指定严重性。
- [ ] 当本地证据无法证实时，将远程专属、仅运行时、组织层面或生产环境事实标记为 `UNKNOWN`。
- [ ] 保留现有的人工维护上下文，除非仓库证据证明其不实；若确实如此，则记录该矛盾。

### 5. 验证并报告

- [ ] 打开每个引用的文件或符号，并移除缺乏支持的声明。
- [ ] 确认该映射说明了关键行为如何被发现、执行、持久化和部署。
- [ ] 确认抽象层级没有混杂，并确保名称在正文和图表中保持一致。
- [ ] 确认没有引入任何目标建议、审计结论、产品代码、测试或外部状态。
- [ ] 当快照有证据支持且具有实用价值时，使用 `DOCUMENTED`；当重要拓扑仍未知时，使用 `INCONCLUSIVE`；当无法安全确定仓库身份、范围或目标位置时，使用 `BLOCKED`。

## 输出契约

```markdown
# Current Architecture Documentation

**Verdict:** DOCUMENTED | INCONCLUSIVE | BLOCKED
**Artifact:** path
**Snapshot:** remote, branch, HEAD, worktree state, observed date

## Architecture mapped
- Context, modules, runtime and deployment units
- Data, interfaces, ownership, and critical flows

## Evidence limitations
| Claim or area | Status | Evidence inspected | Exact next action |
|---|---|---|---|

## Changes made
- Created or updated sections and diagrams

## Residual unknowns
Facts that require runtime, organizational, or external confirmation.
```