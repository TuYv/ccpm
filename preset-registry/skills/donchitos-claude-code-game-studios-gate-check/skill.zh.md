---
name: gate-check
description: "Validate readiness to advance between development phases. Produces a PASS/CONCERNS/FAIL verdict with specific blockers and required artifacts. Use when user says 'are we ready to move to X', 'can we advance to production', 'check if we can start the next phase', 'pass the gate'."
argument-hint: "[target-phase: systems-design | technical-setup | pre-production | production | polish | release] [--review full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write, Task, AskUserQuestion
model: opus
---
# 阶段关卡验证

此技能用于验证项目是否已准备好进入下一个开发阶段。它会检查必需的产物、质量标准和阻塞项。

**与 `/project-stage-detect` 的区别**：该技能是诊断性的（“我们处于哪个阶段？”）。此技能是指导性的（“我们是否已准备好推进？”并给出正式结论）。

## 制作阶段（7 个）

项目会依次经历以下阶段：

1. **概念设计** — 头脑风暴、游戏概念文档
2. **系统设计** — 梳理系统、编写 GDD
3. **技术搭建** — 引擎配置、架构决策
4. **前期制作** — 原型开发、垂直切片验证
5. **正式制作** — 功能开发（启用 Epic/Feature/Task 跟踪）
6. **打磨** — 性能优化、试玩测试、缺陷修复
7. **发布** — 上线准备、认证

**当关卡通过时**，将新阶段名称写入 `production/stage.txt`
（单独一行，例如 `Production`）。这会立即更新状态行。

---

## 1. 解析参数

**目标阶段：** `$ARGUMENTS[0]`（留空 = 自动检测当前阶段，然后验证下一阶段的过渡条件）

还需确定评审模式（仅确定一次，并在本次运行的所有关卡派生任务中使用）：
1. 如果传入了 `--review [full|lean|solo]` → 使用该值
2. 否则读取 `production/review-mode.txt` → 使用其中的值
3. 否则 → 默认为 `lean`

注意：在 `solo` 模式下，将跳过负责人派生任务（CD-PHASE-GATE、TD-PHASE-GATE、PR-PHASE-GATE、AD-PHASE-GATE）——关卡检查将仅检查产物是否存在。在 `lean` 模式下，四位负责人仍会全部运行（阶段关卡正是精简模式的重点）。

- **带参数**：`/gate-check production` — 验证是否已准备好进入该指定阶段
- **不带参数**：使用与 `/project-stage-detect` 相同的启发式规则自动检测当前阶段，然后在运行前**向用户确认**：

  使用 `AskUserQuestion`：
  - 提示：“检测到的阶段：**[当前阶段]**。即将运行 [当前阶段] → [下一阶段] 过渡关卡。是否正确？”
  - 选项：
    - `[A] 是 — 运行此关卡`
    - `[B] 否 — 选择其他关卡`（如果选择此项，则显示第二个组件，列出所有关卡选项：概念设计 → 系统设计、系统设计 → 技术搭建、技术搭建 → 前期制作、前期制作 → 正式制作、正式制作 → 打磨、打磨 → 发布）
  
  未提供参数时，不得跳过此确认步骤。

---

## 2. 阶段关卡定义

### 关卡：概念设计 → 系统设计

**必需产物：**
- [ ] `design/gdd/game-concept.md` 存在且包含内容
- [ ] 已定义游戏支柱（位于概念文档或 `design/gdd/game-pillars.md` 中）
- [ ] `design/gdd/game-concept.md` 中存在视觉识别锚点章节（来自头脑风暴第 4 阶段的美术负责人输出）

**建议项（不阻塞）：**
- [ ] `prototypes/` 中存在概念原型，且其 REPORT.md 给出了 PROCEED 结论
      （`/prototype [core-mechanic]`）——跳过此项意味着可能会为一个
      尚未实际试玩过的创意编写 GDD。如果该概念已通过其他方式得到验证，则可以接受。

**质量检查：**
- [ ] 游戏概念已经过评审（`/design-review` 的结论不是 MAJOR REVISION NEEDED）
- [ ] 核心循环已得到描述和理解
- [ ] 已确定目标受众
- [ ] 视觉识别锚点包含一条单行视觉规则，以及至少 2 条配套的视觉原则

---

### 阶段门禁：系统设计 → 技术设置

**必需产物：**
- [ ] 系统索引已创建于 `design/gdd/systems-index.md`，且至少列出了 MVP 系统
- [ ] 所有 MVP 层级的 GDD 均已创建于 `design/gdd/`，并分别通过 `/design-review`
- [ ] `design/gdd/` 中存在跨 GDD 评审报告（由 `/review-all-gdds` 生成）

**质量检查：**
- [ ] 所有 MVP GDD 均通过单独的设计评审（包含 8 个必需章节，且结论不是 MAJOR REVISION NEEDED）
- [ ] `/review-all-gdds` 的结论不是 FAIL（跨 GDD 一致性和设计理论检查均通过）
- [ ] `/review-all-gdds` 标记的所有跨 GDD 一致性问题均已解决或被明确接受
- [ ] 系统依赖关系已在系统索引中建立映射，且双向一致
- [ ] 已定义 MVP 优先级层级
- [ ] 未标记任何过时的 GDD 引用（较早的 GDD 已更新，以反映后续 GDD 中作出的决策）

---

### 阶段门禁：技术设置 → 前期制作

**必需产物：**
- [ ] 已选择引擎（CLAUDE.md Technology Stack 不是 `[CHOOSE]`）
- [ ] 已配置技术偏好（已填充 `.claude/docs/technical-preferences.md`）
- [ ] 美术圣经已创建于 `design/art/art-bible.md`，且至少包含第 1–4 节（视觉识别基础）
- [ ] `docs/architecture/` 中至少有 3 份架构决策记录，涵盖
      基础层系统（场景管理、事件架构、保存/加载）
- [ ] `docs/engine-reference/[engine]/` 中存在引擎参考文档
- [ ] 测试框架已初始化：`tests/unit/` 和 `tests/integration/` 目录已创建
- [ ] CI/CD 测试工作流已创建于 `.github/workflows/tests.yml`（或等效位置）
- [ ] 至少存在一个示例测试文件，以确认框架可以正常工作
- [ ] 主架构文档已创建于 `docs/architecture/architecture.md`
- [ ] 架构可追溯性索引已创建于 `docs/architecture/requirements-traceability.md`
- [ ] 已运行 `/architecture-review`（`docs/architecture/` 中存在评审报告文件）
- [ ] `design/accessibility-requirements.md` 已创建，且已确定无障碍层级
- [ ] `design/ux/interaction-patterns.md` 已创建（交互模式库已初始化，即使内容很少）

**质量检查：**
- [ ] 架构决策涵盖核心系统（渲染、输入、状态管理）
- [ ] 技术偏好中已设置命名约定和性能预算
- [ ] 已定义并记录无障碍层级（即使是“基础”也可以——但不能未定义）
- [ ] 已开始编写至少一个界面的 UX 规范（技术设置期间通常会设计主菜单或核心 HUD）
- [ ] 所有 ADR 均包含 **引擎兼容性章节**，并标注了引擎版本
- [ ] 所有 ADR 均包含 **所处理的 GDD 需求章节**，并明确链接至相关 GDD
- [ ] 所有 ADR 均未引用 `docs/engine-reference/[engine]/deprecated-apis.md` 中列出的 API
- [ ] 所有高风险引擎领域（依据 VERSION.md）均已在架构文档中得到明确处理，
      或被标记为待解决问题
- [ ] 架构可追溯性矩阵中的**基础层缺口为零**
      （进入前期制作之前，所有基础层需求都必须有 ADR 覆盖）

**ADR 循环依赖检查**：对于 `docs/architecture/` 中的所有 ADR，读取每个 ADR 的
“ADR 依赖关系”/“依赖于”部分。构建依赖关系图（ADR-A → ADR-B 表示
A 依赖于 B）。如果检测到任何循环（例如 A→B→A 或 A→B→C→A）：
- 标记为 **FAIL**：“ADR 循环依赖：[ADR-X] → [ADR-Y] → [ADR-X]。
  在该循环存在期间，两者都无法达到 Accepted 状态。请移除一条 ‘Depends On’ 边以
  打破循环。”

**引擎验证**（先读取 `docs/engine-reference/[engine]/VERSION.md`）：
- [ ] 涉及知识截止日期之后引擎 API 的 ADR 已标记为 Knowledge Risk: HIGH/MEDIUM
- [ ] `/architecture-review` 引擎审计显示未使用任何已弃用的 API
- [ ] 所有 ADR 采用相同的引擎版本（不存在过时的版本引用）

---

### 门禁：预制作 → 制作

**必需产物：**
- [ ] `prototypes/` 中存在包含 REPORT.md 的垂直切片（运行 `/vertical-slice`）— **建议项，不阻塞**；如缺失，则列为 CONCERNS
- [ ] `production/sprints/` 中存在首个冲刺计划
- [ ] 美术圣经已完成（全部 9 个部分），且 AD-ART-BIBLE 签署结论已记录在 `design/art/art-bible.md` 中
- [ ] `design/assets/entity-inventory.md` 中存在实体清单（建议项——不带参数运行 `/asset-spec`，根据 GDD + 美术圣经协作生成）
- [ ] 系统索引中所有 MVP 层级的 GDD 均已完成
- [ ] 主架构文档位于 `docs/architecture/architecture.md`
- [ ] `docs/architecture/` 中至少存在 3 个涵盖 Foundation 层决策的 ADR
- [ ] 所有 Foundation 层和 Core 层 ADR 的状态均为 `Accepted`（而非 `Proposed`）——只有其管辖 ADR 被接受后，故事才可解除阻塞
- [ ] 控制清单位于 `docs/architecture/control-manifest.md`
      （由 `/create-control-manifest` 根据 Accepted ADR 生成）
- [ ] `production/epics/` 中已定义史诗，且至少包含 Foundation 层和 Core
      层史诗（使用 `/create-epics layer: foundation` 和
      `/create-epics layer: core` 创建，然后对每个史诗运行 `/create-stories [epic-slug]`）
- [ ] 垂直切片构建已存在且可游玩（而非仅定义了范围）— **建议项，不阻塞**；如缺失，则列为 CONCERNS
- [ ] 垂直切片已完成至少 1 次有记录的试玩 — **建议项，不阻塞**；如缺失，则列为 CONCERNS
- [ ] 垂直切片试玩报告位于 `production/playtests/` 或等效位置 — **建议项，不阻塞**；如缺失，则列为 CONCERNS
- [ ] 关键界面已有 UX 规格：主菜单、核心玩法 HUD（位于 `design/ux/`）、暂停菜单
- [ ] HUD 设计文档位于 `design/ux/hud.md`（如果游戏具有游戏内 HUD）
- [ ] 所有关键界面的 UX 规格均已通过 `/ux-review`（结论为 APPROVED，或 NEEDS REVISION 已被接受）

**质量检查：**
- [ ] **核心循环的趣味性已经验证**——试玩数据确认核心机制不仅功能正常，而且有趣。明确检查垂直切片试玩报告。
- [ ] UX 规格涵盖 MVP 层级 GDD 中的所有 UI 要求部分
- [ ] 交互模式库记录了关键界面中使用的模式
- [ ] 所有关键界面的 UX 规格均已满足 `design/accessibility-requirements.md` 中的无障碍层级要求
- [ ] 冲刺计划引用 `production/epics/` 中真实的故事文件路径
      （而非仅引用 GDD——故事必须内嵌 GDD 需求 ID + ADR 引用）
- [ ] **垂直切片已完成**，而非仅定义了范围——该构建端到端展示了完整的核心循环。至少有一个完整的 [开始 → 挑战 → 解决] 循环可以正常运行。
- [ ] 架构文档在 Foundation 层或 Core 层中不存在未解决的开放问题
- [ ] 所有 ADR 均包含标注了引擎版本的引擎兼容性部分
- [ ] 所有 ADR 均包含 ADR 依赖关系部分（即使所有字段均为 “None”）
- [ ] 手动验证确认 GDD + 架构 + 史诗相互一致
      （如果近期未运行过，请运行 `/review-all-gdds` 和 `/architecture-review`）
- [ ] **核心幻想已经实现**——至少有一名试玩者在没有受到提示的情况下，独立描述了与核心系统 GDD 中玩家幻想部分相符的体验。

**垂直切片验证**（仅当已构建垂直切片时才运行这些检查）：
- [ ] 有真人在没有开发者指导的情况下完整体验过核心循环
- [ ] 游戏能在开始游玩的前 2 分钟内传达玩家该做什么
- [ ] 垂直切片构建版本中不存在严重的“乐趣阻断”缺陷
- [ ] 与核心机制交互时感觉良好（这是一项主观检查——询问用户）

> **垂直切片的判定规则：**
> - **已构建切片且任一验证项为 NO** → 判定自动为 FAIL。存在缺陷
>   或不好玩的垂直切片不应进入制作阶段。
> - **未构建切片（已跳过）** → 仅降级为 CONCERNS，而不是 FAIL。明确指出风险：
>   “在没有经过验证的垂直切片的情况下继续推进，会增加后期进行设计
>   调整的风险。建议在确定完整制作范围之前完成此项。”由用户决定。
> - 对于独立开发者或时间受限的情况，跳过是合理的选择。但交付一个有问题的切片则不是。

---

### 阶段门禁：制作 → 打磨

**必需产物：**
- [ ] `src/` 中包含按子系统组织的活跃代码
- [ ] GDD 中的所有核心机制均已实现（交叉核对 `design/gdd/` 与 `src/`）
- [ ] 主要游戏流程可以从头到尾完整游玩
- [ ] `tests/unit/` 和 `tests/integration/` 中存在覆盖逻辑故事和集成故事的测试文件
- [ ] 本次冲刺中的所有逻辑故事在 `tests/unit/` 中都有对应的单元测试文件
- [ ] 已运行冒烟检查，判定为 PASS 或 PASS WITH WARNINGS——报告存在于 `production/qa/` 中
- [ ] `production/qa/` 中存在覆盖本次冲刺或最终制作冲刺的 QA 计划（由 `/qa-plan` 生成）
- [ ] `production/qa/` 中至少存在一个覆盖此制作阶段的 QA 计划——如缺失则运行 `/qa-plan`（CONCERNS——建议项，不阻断）
- [ ] `production/qa/` 中存在 QA 签核报告（由 `/team-qa` 生成），且判定为 APPROVED 或 APPROVED WITH CONDITIONS
- [ ] `production/playtests/` 中记录了至少 3 次不同的试玩会话
- [ ] 试玩报告涵盖：新玩家体验、游戏中期系统和难度曲线
- [ ] 游戏概念中的乐趣假设已得到明确验证或修订

**质量检查：**
- [ ] 测试全部通过（通过 Bash 运行测试套件）
- [ ] 任何缺陷跟踪器或已知问题中均不存在严重/阻断级缺陷
- [ ] 核心循环按设计运行（与 GDD 验收标准进行比较）
- [ ] 性能处于预算范围内（检查 technical-preferences.md 中的目标）
- [ ] 已审查试玩发现的问题，并处理了严重影响乐趣的问题（而非仅仅记录）
- [ ] 未发现“困惑循环”——游戏中不存在超过 50% 的试玩者因不明原因而卡住的节点
- [ ] 难度曲线与难度曲线设计文档一致（如果 `design/difficulty-curve.md` 中存在该文档）
- [ ] 所有已实现的界面都有对应的 UX 规格（不存在“在代码中直接设计”的界面）
- [ ] 交互模式库已更新，包含实现中使用的所有模式
- [ ] 已根据 `design/accessibility-requirements.md` 中承诺的级别验证无障碍合规性

---

### 门禁：打磨 → 发布

**必需产物：**
- [ ] 里程碑计划中的所有功能均已实现
- [ ] 内容完整（设计文档中引用的所有关卡、资产和对话均已存在）
- [ ] 本地化字符串已外部化（`src/` 中不存在面向玩家的硬编码文本）
- [ ] QA 测试计划已存在（`production/qa/` 中的 `/qa-plan` 输出）
- [ ] QA 签署报告已存在（`/team-qa` 输出 — APPROVED 或 APPROVED WITH CONDITIONS）
- [ ] 所有“必须有”用户故事的测试证据均已提供（逻辑/集成：测试文件通过；视觉/手感/UI：签署文档位于 `production/qa/evidence/`）
- [ ] 冒烟检查在候选发布构建上顺利通过（PASS 结论）
- [ ] 与上一个冲刺相比没有测试回归（测试套件全部通过）
- [ ] 平衡性数据已审核（已运行 `/balance-check`）
- [ ] 发布检查清单已完成（已运行 `/release-checklist` 或 `/launch-checklist`）
- [ ] 商店元数据已准备就绪（如适用）
- [ ] 变更日志/补丁说明已起草

**质量检查：**
- [ ] 完整 QA 测试已由 `qa-lead` 签署通过
- [ ] 所有测试均通过
- [ ] 在所有目标平台上均达到性能目标
- [ ] 不存在已知的严重、高危或中危缺陷
- [ ] 已涵盖基本无障碍功能（按键重映射、文本缩放，如适用）
- [ ] 已验证所有目标语言的本地化
- [ ] 已满足法律要求（EULA、隐私政策、年龄分级，如适用）
- [ ] 构建可顺利完成编译和打包

---

## 3. 运行门禁检查

**在运行产物检查之前**，读取 `docs/consistency-failures.md`（如果存在）。
提取 Domain 与目标阶段匹配的条目（例如，如果检查
系统设计 → 技术设置，则提取 Economy、Combat 或任何 GDD 领域中的条目；
如果检查技术设置 → 前期制作，则提取 Architecture、Engine 中的条目）。
将这些条目作为上下文——如果目标领域中存在反复出现的冲突模式，
则应对这些特定检查进行更严格的审查。

对于目标门禁中的每一项：

### 产物检查
- 使用 `Glob` 和 `Read` 验证文件是否存在且包含有意义的内容
- 不要只检查是否存在——还要确认文件包含实际内容（而不只是模板标题）
- 对于代码检查，验证目录结构和文件数量

**系统设计 → 技术设置门禁 — 跨 GDD 审核检查**：
使用 `Glob('design/gdd/gdd-cross-review-*.md')` 查找 `/review-all-gdds` 报告。
如果没有匹配的文件，则将“跨 GDD 审核报告已存在”产物标记为 **FAIL**，并
显著提示：“在 `design/gdd/` 中未找到 `/review-all-gdds` 报告。请在推进到
技术设置阶段之前运行 `/review-all-gdds`。”
如果找到文件，则读取该文件并检查结论行：FAIL 结论表示
跨 GDD 一致性检查失败，必须先解决问题才能推进。

### 质量检查
- 对于测试检查：如果已配置测试运行器，则通过 `Bash` 运行测试套件
- 对于设计审核检查：使用 `Read` 读取 GDD，并检查是否包含 8 个必需章节
- 对于性能检查：使用 `Read` 读取 technical-preferences.md，并与
  `tests/performance/` 中的任何性能分析数据或最近的 `/perf-profile` 输出进行比较
- 对于本地化检查：使用 `Grep` 查找 `src/` 中的硬编码字符串

### 交叉引用检查
- 将 `design/gdd/` 文档与 `src/` 中的实现进行比较
- 检查架构文档中引用的每个系统是否都有对应的代码
- 验证冲刺计划引用的是真实工作项

---

## 4. 协作式评估

对于无法自动验证的项目，**询问用户**：

- “我无法自动验证核心循环的实际游玩体验是否良好。是否进行过试玩测试？”
- “未找到试玩测试报告。是否进行过非正式测试？”
- “没有可用的性能分析数据。你想运行 `/perf-profile` 吗？”

**切勿将无法验证的项目假定为 PASS。** 将其标记为 MANUAL CHECK NEEDED。

---

## 4b. 总监小组评估

**在生成任何总监子代理之前应用审查模式：**
- `solo` → 跳过全部四位总监。在输出中注明：“已跳过总监小组——Solo 模式。关卡裁决仅基于工件和质量检查。”然后继续执行第 5 阶段。
- `lean` → 生成全部四位总监（阶段关卡始终在精简模式下运行——这正是其用途）。
- `full` → 正常生成全部四位总监。

（审查模式已在第 1 阶段确定。此处使用已存储的值。）

在生成最终裁决之前，通过 Task 使用 `.claude/docs/director-gates.md` 中的并行关卡协议，将全部四位总监生成为**并行子代理**。同时发出全部四个 Task 调用——不要等一个启动后再启动下一个。

**并行生成：**

1. **`creative-director`** — 关卡 **CD-PHASE-GATE**（`.claude/docs/director-gates.md`）
2. **`technical-director`** — 关卡 **TD-PHASE-GATE**（`.claude/docs/director-gates.md`）
3. **`producer`** — 关卡 **PR-PHASE-GATE**（`.claude/docs/director-gates.md`）
4. **`art-director`** — 关卡 **AD-PHASE-GATE**（`.claude/docs/director-gates.md`）

向每位总监传递：目标阶段名称、现有工件列表，以及相应关卡定义中列出的上下文字段。

**收集全部四份响应，然后呈现总监小组摘要：**

```
## Director Panel Assessment

Creative Director:  [READY / CONCERNS / NOT READY]
  [feedback]

Technical Director: [READY / CONCERNS / NOT READY]
  [feedback]

Producer:           [READY / CONCERNS / NOT READY]
  [feedback]

Art Director:       [READY / CONCERNS / NOT READY]
  [feedback]
```

**应用于裁决：**
- 任何总监返回 NOT READY → 裁决最低为 FAIL（用户可通过明确确认进行覆盖）
- 任何总监返回 CONCERNS → 裁决最低为 CONCERNS
- 四位总监全部返回 READY → 可判定为 PASS（仍需满足第 3 节中的工件和质量检查）

---

## 5. 输出裁决

```
## Gate Check: [Current Phase] → [Target Phase]

**Date**: [date]
**Checked by**: gate-check skill

### Required Artifacts: [X/Y present]
- [x] design/gdd/game-concept.md — exists, 2.4KB
- [ ] docs/architecture/ — MISSING (no ADRs found)
- [x] production/sprints/ — exists, 1 sprint plan

### Quality Checks: [X/Y passing]
- [x] GDD has 8/8 required sections
- [ ] Tests — FAILED (3 failures in tests/unit/)
- [?] Core loop playtested — MANUAL CHECK NEEDED

### Blockers
1. **No Architecture Decision Records** — Run `/architecture-decision` to create one
   covering core system architecture before entering production.
2. **3 test failures** — Fix failing tests in tests/unit/ before advancing.

### Recommendations
- [Priority actions to resolve blockers]
- [Optional improvements that aren't blocking]

### Verdict: [PASS / CONCERNS / FAIL]
- **PASS**: All required artifacts present, all quality checks passing
- **CONCERNS**: Minor gaps exist but can be addressed during the next phase
- **FAIL**: Critical blockers must be resolved before advancing
```

---

## 5a. 验证链

在第 5 阶段起草裁定后，先对其提出质疑，再最终确定。

**步骤 1 — 生成 5 个质疑问题**，旨在推翻该裁定：

> **工具操作要求**：以下 5 个质疑问题中，至少有 2 个必须通过重新读取特定文件（Read 工具）或重新运行特定检查（Grep 工具）来回答，而不能仅靠反思。使用 [TOOL ACTION] 标记这些问题，以表明使用了工具。

对于 **PASS** 草案：
- “哪些质量检查是我通过实际读取文件验证的，哪些只是推断为已通过？”
- “是否存在我在未经用户确认的情况下标记为 PASS 的 MANUAL CHECK NEEDED 项？[TOOL ACTION] 重新扫描检查清单，查找任何 [?] 或 MANUAL CHECK 项。”
- “我是否确认了所有列出的产物都包含实际内容，而不只是空标题？[TOOL ACTION] 重新读取文件并检查其中是否包含非占位内容。”
- “我认为无关紧要的某个阻碍因素，是否实际上可能导致该阶段无法成功？”
- “我对哪一项检查最没有信心，为什么？”

对于 **CONCERNS** 草案：
- “鉴于项目当前的状态，列出的某个 CONCERN 是否可能升级为阻碍因素？”
- “该问题能否在下一阶段内解决，还是会随着时间推移不断累积？”
- “我是否为了避免给出更严厉的裁定，而将某个 FAIL 条件弱化成了 CONCERN？”
- “是否存在我未检查的产物，而它们可能暴露出其他阻碍因素？”
- “即使每个 CONCERN 单独来看都很轻微，它们合在一起是否会构成阻碍性问题？”

对于 **FAIL** 草案：
- “我是否准确地区分了硬性阻碍因素和强烈建议？”
- “是否存在我判断得过于宽松的 PASS 项？”
- “我是否遗漏了用户应该了解的其他阻碍因素？”
- “我能否提供一条达到 PASS 的最简路径——必须更改的 3 个具体事项？”
- “该失败条件是否可以解决，还是表明存在更深层的设计问题？”

**步骤 2 — 独立回答每个问题**。
不要引用裁定草案的文本——重新检查具体文件或询问用户。

**步骤 3 — 必要时修订：**
- 如果任何答案揭示出遗漏的阻碍因素 → 升级裁定（PASS→CONCERNS 或 CONCERNS→FAIL）
- 如果任何答案揭示出被夸大的阻碍因素 → 仅在引用具体证据时降级
- 如果答案一致 → 确认裁定不变

**步骤 4 — 在最终报告输出中注明验证情况**：
`Chain-of-Verification: [N] questions checked — verdict [unchanged | revised from X to Y]`

---

## 6. 在 PASS 时更新阶段

当裁定为 **PASS** 且用户确认希望推进时：

1. 将新阶段名称写入 `production/stage.txt`（单行，无尾随换行符）
2. 这会立即更新未来所有会话的状态行

示例：如果通过“Pre-Production → Production”关卡：
```bash
echo -n "Production" > production/stage.txt
```

**写入前务必询问**：“关卡已通过。我可以将 `production/stage.txt` 更新为 'Production' 吗？”

---

## 7. 结束时的后续步骤小组件

展示裁定并完成所有 stage.txt 更新后，使用 `AskUserQuestion` 以结构化的后续步骤提示结束。

**根据刚刚运行的门禁定制选项：**

对于 **systems-design PASS**：
```
Gate passed. What would you like to do next?
[A] Run /create-architecture — produce your master architecture blueprint and ADR work plan (recommended next step)
[B] Design more GDDs first — return here when all MVP systems are complete
[C] Stop here for this session
```

> **systems-design PASS 注意事项**：在编写任何 ADR 之前，必须先执行 `/create-architecture`。它会生成总体架构文档以及按优先级排序的待编写 ADR 列表。跳过此步骤直接运行 `/architecture-decision`，意味着在没有蓝图的情况下编写 ADR——风险自负。

对于 **technical-setup PASS**：
```
Gate passed. What would you like to do next?
[A] Run /create-control-manifest — generate the layer rules manifest from your Accepted ADRs (do this first)
[B] Run /vertical-slice — build the Vertical Slice (do this before writing epics — validate fun first)
[C] Write more ADRs first — run /architecture-decision [next-system]
[D] Stop here for this session
```

> **technical-setup PASS 注意事项**：前期制作阶段的顺序是特意安排的，
> 目的是在投入详细规划之前先验证游戏是否有趣：
>
> 1. `/create-control-manifest` — 从 Accepted ADRs 中提取技术规则（编写史诗前的必要步骤）
> 2. `/vertical-slice` — **首先**构建垂直切片，然后再编写史诗或故事
> 3. 游戏试玩 → `/playtest-report` — 要通过前期制作门禁，至少需要进行 1 次试玩；建议在投入整个团队前进行 3 次以上
> 4. `/ux-design [screen]` — 为主菜单、核心 HUD、暂停菜单编写 UX 规格（如果尚未完成）
> 5. `/create-epics layer:foundation`，然后执行 `/create-epics layer:core` — 在验证游戏乐趣后再进行规划
> 6. 对每个史诗执行 `/create-stories [epic-slug]`
> 7. `/sprint-plan new`
>
> **为什么要先制作原型，再编写史诗？** 如果原型表明核心循环需要修改，
> 那么在发现这一点之前编写的史诗将有一部分是错误的。先以较低成本验证游戏乐趣，
> 然后再进行详细规划。这是从 GDC 项目复盘数据中总结出的首要经验。

对于其他所有门禁，提供该阶段最合理的两个后续步骤，外加“在此停止”。

---

## 8. 后续行动

根据判定结果，建议具体的后续步骤：

- **没有美术圣经？** → 使用 `/art-bible` 创建视觉识别规范
- **已有美术圣经，但没有资产规格？** → 使用 `/asset-spec system:[name]`，根据已批准的 GDD 生成逐资产的视觉规格和生成提示词
- **没有游戏概念？** → 使用 `/brainstorm` 创建一个
- **没有系统索引？** → 使用 `/map-systems` 将概念分解为系统
- **缺少设计文档？** → 使用 `/reverse-document` 或委派给 `game-designer`
- **需要小幅设计变更？** → 对于耗时少于约 4 小时的变更，使用 `/quick-design`（绕过完整的 GDD 流程）
- **没有 UX 规格？** → 使用 `/ux-design [screen name]` 编写规格，或使用 `/team-ui [feature]` 执行完整流程
- **UX 规格尚未评审？** → 使用 `/ux-review [file]` 或 `/ux-review all` 进行验证
- **没有无障碍需求文档？** → 运行 `/ux-design`，它会在一个步骤中同时创建 `design/accessibility-requirements.md` 和 `design/ux/interaction-patterns.md`
- **没有交互模式库？** → 使用 `/ux-design patterns` 对其进行初始化
- **GDD 尚未交叉评审？** → 使用 `/review-all-gdds`（在所有 MVP GDD 均已单独获批后运行）
- **存在跨 GDD 一致性问题？** → 修复被标记的 GDD，然后重新运行 `/review-all-gdds`
- **没有测试框架？** → 使用 `/test-setup` 为你的引擎搭建框架脚手架
- **当前冲刺没有 QA 计划？** → 在开始实施前使用 `/qa-plan sprint` 生成计划
- **缺少 ADR？** → 使用 `/architecture-decision` 处理单项决策
- **没有总体架构文档？** → 使用 `/create-architecture` 创建完整蓝图
- **ADR 缺少引擎兼容性章节？** → 重新运行 `/architecture-decision`
  或手动将 Engine Compatibility 章节添加到现有 ADR 中
- **缺少控制清单？** → 使用 `/create-control-manifest`（需要 Accepted ADRs）
- **缺少史诗？** → 先运行 `/create-epics layer: foundation`，然后运行 `/create-epics layer: core`（需要控制清单）
- **某个史诗缺少故事？** → 使用 `/create-stories [epic-slug]`（在每个史诗创建后运行）
- **故事尚未达到实施就绪状态？** → 使用 `/story-readiness` 在开发人员接手故事前进行验证
- **测试失败？** → 委派给 `lead-programmer` 或 `qa-tester`
- **没有试玩数据？** → 使用 `/playtest-report`
- **除了最低要求外没有更多试玩场次？** → 增加试玩场次可以获得更可靠的信号。建议在投入整个团队前总共进行 3 次以上。使用 `/playtest-report` 整理发现。
- **没有难度曲线文档？** → 使用 `.claude/docs/templates/difficulty-curve.md` 中的模板创建 `design/difficulty-curve.md`，或者使用 `/quick-design "difficulty curve"` 进行引导式会话。
- **没有玩家旅程地图？** → 使用 `.claude/docs/templates/player-journey.md` 中的模板创建 `design/player-journey.md`，或者使用 `/ux-design` Phase 2b 协作编写。
- **需要快速检查冲刺？** → 使用 `/sprint-status` 获取当前冲刺进度快照
- **性能情况未知？** → 使用 `/perf-profile`
- **尚未本地化？** → 使用 `/localize`
- **准备发布？** → 使用 `/launch-checklist`

---

## 协作协议

此技能遵循协作式设计原则：

1. **先扫描**：检查所有制品和质量门禁
2. **询问未知项**：对于无法验证的事项，不要擅自假定为 PASS
3. **呈现检查结果**：显示包含状态的完整检查清单
4. **由用户决定**：结论只是建议——最终决定由用户作出
5. **获得批准**：“我可以将此门禁检查报告写入 production/gate-checks/ 吗？”
6. **绝不自动修复**：如果缺少必需的制品，应报告 FAIL 结论，并
   指明要运行的技能（例如“运行 `/test-setup`”）。不要创建缺失的文件，也不要
   自动重新运行门禁。通过创建文件来制造 PASS 会违背门禁的目的。

**绝不**阻止用户继续推进——结论仅供参考。记录相关风险，
并让用户决定是否不顾这些问题继续推进。