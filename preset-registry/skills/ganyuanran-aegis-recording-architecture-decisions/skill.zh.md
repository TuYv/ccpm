---
name: recording-architecture-decisions
description: "Use when the user asks to create, write, update, amend, supersede, or evaluate an ADR, architecture decision record, durable architecture decision, decision log, or baseline sync after architecture-changing work."
---
# 记录架构决策

## 目的

记录持久的架构决策，同时确保当前状态基线保持闭环。ADR 记录作出某项决策的原因；基线记录该决策作出后的架构状态。

此技能是一种惰性的、针对特定任务的工作流。它不能取代 `verification-before-completion`，不授予完成权限，也不会生成具有权威性的 `GateDecision` 或 `PolicySnapshot` 输出。

## 必读内容集

在作出决策或编写内容之前，从以下文档中读取最少量的相关摘录：

- `docs/adr/ADR-CREATION-GATE.md`
- `docs/current/AEGIS_ADR_AUTO_BACKFILL.md`
- 目标项目中负责管理受影响架构范围的当前 ADR、基线或权威文档

对于 Aegis 仓库变更，请遵循此仓库的 `docs/adr/` 和 `docs/current/` 权威顺序。对于拥有自身 ADR 系统的目标项目，应遵循该项目的归属约定，而不是将同一项决策重复记录到 `docs/aegis/adr/` 中。

## 何时使用

当用户要求执行以下操作时，请使用此技能：

- 创建、编写、更新、修订、取代或评估 ADR
- 判断是否需要架构决策记录
- 记录持久的架构决策或决策日志条目
- 在与 ADR 相关的架构变更后完成基线同步闭环
- 验证 ADR 操作是否导致架构基线过时

不要将其用于简单的措辞编辑、常规 README 清理、仅测试的覆盖率改进、低风险的单文件变更，或仅恢复现有基线的错误修复。

## 决策流程

1. 识别候选决策及其证据来源。
2. 执行 ADR 创建门禁：
   - 难以撤销
   - 缺少上下文时会令人意外
   - 存在实际权衡
3. 应用回顾 / 记忆过滤器：
   - 已执行的持久决策可以成为 ADR 或基线记忆
   - 未执行的想法不得纳入已接受的架构记忆
   - 如果流程说明不改变当前架构状态，则可以使用更轻量的记录
4. 只选择一种 ADR 操作：创建、修订、取代或跳过。
5. 选择归属范围：项目的 `docs/adr/`、`docs/aegis/adr/`、现有 ADR 或更轻量的记录。
6. 执行基线同步闭环。
7. 如果写入文件，请保留本地 ADR 约定并验证结构。

## 基于辅助工具的写入路径

当所选归属范围是目标项目的 `docs/aegis/adr/` 时，请使用共享工作区辅助工具，而不是临时创建文件：

- `create` -> `<aegis-workspace-helper> new-adr --root <target-project-root> ...`
- `amend` -> `<aegis-workspace-helper> amend-adr --root <target-project-root> --path docs/aegis/adr/ADR-####-<slug>.md ...`
- `supersede` -> `<aegis-workspace-helper> supersede-adr --root <target-project-root> --path docs/aegis/adr/ADR-####-<slug>.md ...`

通过辅助工具回写后，运行：

- `<aegis-workspace-helper> check --root <target-project-root>`

辅助工具仅负责文件结构、ADR 编号、取代标记和 `INDEX.md` 覆盖情况。它不会判定架构事实、ADR 门禁是否通过，也不会判定基线同步在语义上是否充分。

如果 ADR 门禁或所有者表面决策为 `skip`，不要仅仅因为辅助工具存在就创建或修订 ADR 文件。设计/计划中的 ADR 信号只是供后续完成的备注，而不是 ADR 文件。仅针对已执行的持久性决策创建、修订或取代 ADR；如果现有 ADR 已涵盖该决策表面，应修订该 ADR，而不是创建同级 ADR。

## 基线同步闭环

如果 ADR 操作为创建、修订或取代，则必须检查基线同步。

当决策变更或确认以下任一内容时，必须进行基线同步：

- 规范所有者或所有权映射
- 公共 API、模式、制品形态或行为契约
- 依赖方向或允许的跨模块关系
- 事实来源所有者
- 主机兼容性策略或安装/发现契约
- 方法包/运行时核心边界
- 运行时就绪制品边界或证据模型
- 保留的回退方案、适配器、兼容性路径、重复所有者或退役计划
- 已接受的架构范围 Implementation Drift
- 否则会被未来贡献者误读的发布或分发策略

如果未回写基线，请说明现有基线为何仍然有效。执行创建、修订或取代后，绝不能让基线同步处于隐含状态。

## 紧凑输出契约

```text
Aegis Visibility:
- Why executed-decision filtering, ADR gate, owner surface, or baseline sync matters now:

Decision Candidate:
- Summary:
- Evidence source:

ADR Gate:
- Hard to reverse: yes | no | unknown
- Surprising without context: yes | no | unknown
- Real trade-off: yes | no | unknown

Retro / Memory Filter:
- Classification: executed durable decision | unexecuted idea | process note
- Memory action: record | skip | lighter record
- Reason:

ADR Action:
- create | amend | supersede | skip
- Reason:

Owner Surface:
- Target:
- Existing ADR / baseline checked:

Baseline Sync:
- Required: yes | no | unknown
- Target:
- Action: create snapshot | update baseline | cite unchanged | blocked
- Reason:

Boundary:
- Advisory method-pack signal only; not completion authority.
```

## 常见错误

- 仅仅因为主题感觉很重要，就在未通过门禁的情况下编写 ADR。
- 在 ADR 中记录原因，却让基线中的当前状态事实保持过时。
- 在尚未确定漂移是否有意且值得记录到 ADR 之前，就更新基线以匹配漂移。
- 在没有明确镜像关系的情况下，将同一决策同时重复记录到项目的 `docs/adr/` 和 `docs/aegis/adr/` 中。
- 将 ADR 或基线同步视为工作已完成的证明。