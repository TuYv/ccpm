---
name: audit
description: |
  Use when the user wants a code review on recent changes — quality, spec, security, or performance feedback. Triggers a multi-level (L1-L5) review with a standalone Reviewer; on NEEDS_FIX, offers to apply findings via /hyperflow:plan.
  Trigger with /hyperflow:audit, "review this change", "review my PR", "audit the diff", "code review".
allowed-tools: Read, Write, Edit, Bash(git:*), Glob, Grep, Agent, Skill, AskUserQuestion
argument-hint: "[target] [--level 1-5]"
version: 3.1.3
license: MIT
compatibility: Designed for Claude Code
tags: [code-review, quality, multi-level, multi-agent]
---
# 审计

多层级代码审查。所有代理均继承会话模型。审查者使用粗体标注；工作者使用普通文本。

此技能会运用**第 3 层（编排器）**和**第 9 层（安全）**。审查结果输出后，**修复关卡**会询问用户是否应用这些发现项；选择 `Yes` 后，审计会自动以这些发现项作为规范调用 `/hyperflow:plan`，随后会串联至 `/hyperflow:dispatch`。

## 铁律

**失败恢复（DOCTRINE 规则 14）。** 每个步骤中的工作者错误、格式错误的输出、`NEEDS_REVISION` 判定以及关卡失败，均遵循 [`skills/hyperflow/failure-recovery.md`](../hyperflow/failure-recovery.md) 中的标准策略。审计特定例外：L1/L2 级别审查者失败时，应升级至同一严重性级别的 L3+ 审查者，而不是中止流程——审计的目的在于发现问题，因此，最适合解决审查者失败的方式是采用更彻底的审查者，而不是停止链路。

## 各步骤代理映射（DOCTRINE 规则 12）

| 步骤 | 子阶段 | 工作者 | 审查者 | 说明 |
|---|---|---|---|---|
| 1 — 解析范围 | — | — | — | 机械性决策（豁免） |
| 2 — 收集上下文 | 2a — 表层映射 | 搜索者 × 2（glob + 导入图） | 审查者 | 并行 |
| 2 — 收集上下文 | 2b — 语义索引 | 搜索者 × 2（类型系统 + 符号图） | 审查者 | 并行 |
| 2 — 收集上下文 | 2c — 约定扫描 | 搜索者 × 1（测试模式 + lint 配置） | 审查者 | 有充分理由的单角度 |
| 2 — 收集上下文 | 2d — 聚合覆盖率关卡 | — | **审查者**验证聚合覆盖率 | 独立覆盖率关卡 |
| 3 — 审查 | 3a — L1+L2（语法/格式/命名） | — | **领域专家审查者** × 2（文件组，表层匹配）+ 审查者汇总 | 并行组合，以匹配的领域专家身份派发 |
| 3 — 审查 | 3b — L3（集成/安全） | — | **审查者** × 2 — backend-reviewer + security-reviewer/vulnerability-reviewer + 审查者汇总 | 并行组合；安全专家优先进行 Web 研究 |
| 3 — 审查 | 3c — L4+L5（性能/规模/无障碍/用户体验） | — | **审查者** × 2 — performance-reviewer + accessibility-reviewer + 审查者汇总 | 并行组合，以匹配的专家身份派发 |
| 4 — 发现项综合 | 4a — 关键发现项 | 写作者 × 2（证据探查 + 影响分析） | 审查者 | 并行 |
| 4 — 发现项综合 | 4b — 重要发现项 | 写作者 × 2（根因探查 + 修复路径分析） | 审查者 | 并行 |
| 4 — 发现项综合 | 4c — 建议 + 观察项 | 写作者 × 2（模式分析 + 优点识别） | 审查者 | 并行 |
| 4 — 发现项综合 | 4d — 记忆反馈 | 写作者 × 1（反模式整理） | 审查者（去重 + 压缩验证） | 原子化的工作者→审查者；在 4a/4b/4c 完成后运行；触发时执行压缩轮次 |
| 5 — 严重性协调 | — | — | 审查者协调步骤 3 各子阶段的严重性标签 | 根据 DOCTRINE 12.2.8 属于原子豁免——读取现有步骤 3 标签；无需工作者 |
| 6 — 修复关卡 | — | — | — | 仅 `AskUserQuestion`（豁免——结构性关卡） |

## 批准门

| 门 | 时机 | 格式 |
|---|---|---|
| 修复门 | 第 6 步，在 NEEDS_FIX 或带建议的 PASS 之后 | `AskUserQuestion` — 全部修复 / 仅关键项 / 否 |
| 强制停止 | 审查者发现任何 `SECURITY_VIOLATION` | 停止，展示发现的问题；不进入修复门 |

## 输入

- **目标** — 用户提供的文件路径、行范围、提交 SHA、分支或 PR 编号
- **默认值（无目标）** — `git diff HEAD` + `git diff --staged`
- **级别标志** — `--level 1` 至 `--level 5`（默认值 — L2）

## 审查级别

改编自 [review-levels.md](references/review-levels.md)：

| L | 名称 | 检查项 |
|---|------|--------|
| 1 | 快速 | 语法、明显错误、格式 |
| 2 | 标准 | L1 + 规范遵从性、命名、边界情况 |
| 3 | 全面 | L2 + 跨文件一致性、集成风险、安全性 |
| 4 | 深度 | L3 + 架构、可扩展性、可访问性 |
| 5 | 穷尽 | L4 + 对抗性探测、性能分析、替代方案 |

L3 及以上必须进行安全扫描（硬编码密钥、注入、路径遍历、XSS、缺失验证）。参见 [security.md](references/security.md)。

## 流程

### 第 1 步 — 确定范围

使用提供的目标，或运行 `git diff HEAD` + `git diff --staged`。不派发代理（只读 git）。

**接受的目标：**路径/glob、显式文件列表，或 **git 范围 `<base>..<head>`**。范围形式用于运行双会话 **交接审查** — `/hyperflow:handoff review <slug>` 读取构建的 `COMPLETION.md` 差异范围，并以 `Skill audit "<base>..<head> level=<n>"` 调用审计，因此审查恰好覆盖第二个会话的提交（`git diff <base>..<head>`）。参见 [`../hyperflow/session-handoff.md`](../hyperflow/session-handoff.md)。

### 第 2 步 — 收集上下文

子阶段 2a、2b、2c 并行运行（P1）。第 2 步的输出是其工作代理输出与三个子阶段 Reviewer 判定的并集，并交给一个独立的汇总覆盖门。Searchers 还会记录 **差异触及哪些表面**（前端 / api / db / devops / mobile / data-ml / security）——这将驱动第 3 步中的领域专家选择（[`../../agents/README.md`](../../agents/README.md)）。

#### 第 2a 步 — 表面映射

并行派发两个 Searcher 代理：
- Searcher — glob 发现（文件扩展名、目录树、入口点）
- Searcher — 导入图遍历（从受影响文件沿 `import`/`require`/`use` 链追踪）

然后派发 `**Reviewer** — 2a 表面映射覆盖检查`。判定 ∈ {`PASS`, `NEEDS_REVISION`, `ESCALATE`}。如果为 `NEEDS_REVISION`，仅重新派发 2a。

#### 第 2b 步 — 语义索引

并行派发两个 Searcher 代理：
- Searcher — 类型系统探测（与变更符号相关的接口/schema 定义）
- Searcher — 符号图探测（变更符号的调用点、使用位置、导出引用）

然后派发 `**Reviewer** — 2b 语义索引覆盖检查`。判定同上。

#### 第 2c 步 — 约定扫描

派发一个 Searcher 代理（单一角度合理——测试模式和 lint 配置是单个正交语料库，不存在可独立展开的轴）：
- Searcher — 约定扫描（现有测试模式、lint 规则、命名约定、代码风格配置）

然后分派 `**Reviewer** — 2c 约定扫描覆盖检查`。裁决同上。

#### 步骤 2d — 汇总覆盖门槛

在 2a + 2b + 2c 完成后，分派 `**Reviewer** — 验证汇总上下文覆盖范围`，以确认组合后的覆盖面涵盖与差异相关的所有子系统。若存在覆盖缺口：重新分派受影响的子阶段（最多重试 2 次）；若重试次数耗尽，则将缺口告知用户。

### 步骤 3 — 审查

子阶段 3a、3b、3c 并行运行（P1）——每个阶段均以一个子阶段聚合 Reviewer 结束，之后才会触发下一批。活跃子阶段随 `--level` 缩放：L1-L2 仅运行 3a；L3 增加 3b；L4-L5 增加 3c。

**专家选择。** 步骤 2 检测差异涉及哪些领域（前端、api、db、devops、移动端、数据/ml，……）。步骤 3 将每个 Reviewer **作为匹配的领域专家**进行分派（[`../../agents/README.md`](../../agents/README.md)）——注入其职责说明和严格检查清单，并且（审计是一个受门槛控制的流程）先执行其以网络研究为先的检查，以获取当前最佳实践 / CVE 信息。当目标包含规格/任务文件时，其由 Brain 决定的 `Specialists` 名单将作为选择依据。

#### 步骤 3a — L1+L2：语法、格式、命名

在不同文件组上并行分派两个 Reviewer 代理（按目录或功能边界拆分），每个代理均**作为与该组领域匹配的领域专家**（`frontend-reviewer` / `backend-reviewer` / `api-reviewer` / `database-reviewer` / `devops-reviewer` / `mobile` / `data-ml-reviewer`）：
- **Reviewer**（领域专家）— L1+L2 审查，文件组 A（语法错误、明显缺陷、格式、命名约定）
- **Reviewer**（领域专家）— L1+L2 审查，文件组 B（相同检查清单，不同文件组）

随后分派 `**Reviewer** — 3a 聚合`，以合并两个裁决并去重重叠发现。裁决 ∈ {`PASS`, `NEEDS_REVISION`, `ESCALATE`}。若为 `NEEDS_REVISION`，则仅重新分派 3a。

#### 步骤 3b — L3：集成、安全性（仅 L3+）

在不同关注维度上并行分派两个 Reviewer 代理——作为安全专家：
- **Reviewer**（`backend-reviewer` 或 `api-reviewer`）— L3 集成风险（跨文件一致性、API 合约不匹配、竞态条件、边界情况）
- **Reviewer**（`security-reviewer` + `vulnerability-reviewer`）— L3 安全扫描（硬编码密钥、注入、路径遍历、XSS、缺少验证、已知 CVE 暴露——依据 [security.md](references/security.md)，针对当前公告优先进行网络研究）

如果安全 Reviewer 输出 `SECURITY_VIOLATION:` → 立即停止；跳过修复门槛；内联呈现该发现；由用户决定补救措施。

随后分派 `**Reviewer** — 3b 聚合`，以合并两个裁决。裁决同上。

#### 步骤 3c — L4+L5：性能、可扩展性、可访问性、用户体验（仅 L4+）

并行分派两个 Reviewer 代理——作为匹配的专家：
- **Reviewer**（`performance-reviewer`）— L4+L5 性能和可扩展性（算法复杂度、内存、包体积、对抗性负载）
- **Reviewer**（`accessibility-reviewer`）— L4+L5 可访问性和用户体验（WCAG 合规性、键盘导航、屏幕阅读器语义、交互设计）

然后派发 `**Reviewer** — 3c 聚合`，以汇总这两个裁决。裁决同上。

Reviewer 使用 [reviewer-prompt.md](references/reviewer-prompt.md) 模板，并提供 diff、级别定义以及任何适用的规范。每个子阶段都会产出结构化的 `[Critical] / [Important] / [Suggestions] / [Praise]` 发现项，并将其输入到步骤 4。

### 步骤 4 — 发现项综合

将完整的结构化审计写入 `.hyperflow/audits/<YYYY-MM-DD-HHmm>-<scope-slug>.md`。子阶段 4a、4b、4c 并行运行（P1），每个阶段分别编写审计文件的一个部分。审计文件还会根据 [memory-system.md](references/memory-system.md) 接收一个内存追加部分。

#### 步骤 4a — Critical 发现项

并行派发两个 Writer agent：
- Writer — 证据探查（将每个 Critical 发现项追溯到 diff 行；确认可复现性）
- Writer — 影响分析（阐明每个 Critical 发现项对用户可见层面 / 系统层面的后果）

然后派发 `**Reviewer** — 4a critical findings review`，以验证每个 Critical 条目均有已确认的修复路径，且不存在误报。裁决 ∈ {`PASS`, `NEEDS_REVISION`, `ESCALATE`}。

#### 步骤 4b — Important 发现项

并行派发两个 Writer agent：
- Writer — 根因探查（将每个 Important 发现项追溯到其来源；确认它不是某个 Critical 的症状）
- Writer — 修复路径分析（针对每个发现项提出建议的变更，并附带 file:line 锚点）

然后派发 `**Reviewer** — 4b important findings review`。裁决同上。

#### 步骤 4c — Suggestions、观察项与内存追加

并行派发两个 Writer agent：
- Writer — 模式分析（识别 Suggestion 级别的改进项；为内存提取可复用的模式）
- Writer — 认可项识别（标记确实做得好的决策；根据 [memory-system.md](references/memory-system.md) 将持久模式追加到 `.hyperflow/memory/learnings.md`）

然后派发 `**Reviewer** — 4c suggestions + memory dedup check`，以确保不会写入重复的内存条目，并且没有将 Suggestions 错分为 Important。裁决同上。

#### 步骤 4d — 内存反馈（在 4a/4b/4c 完成后运行）

审计文件写入后，将重复出现的问题模式整理到 `.hyperflow/memory/anti-patterns.md`，让未来的审计运行和 worker 能从累积发现中获益。这是一个原子性的 Worker→Reviewer 配对。

派发一个 Writer agent：
- Writer — 反模式整理（如果 `.hyperflow/memory/anti-patterns.md` 存在则读取；从 4a/4b 产生的 `[Critical]` 和 `[Important]` 发现项中提取最多 3 个新条目，并追加或更新文件）

**Writer 必须遵循的整理规则：**

- 只有 `[Critical]` 和 `[Important]` 发现项符合资格 — Suggestions 和 Praise 不包括在内。
- 写入前，读取现有的 `anti-patterns.md`。如果已存在匹配的模式，增加其 `frequency` 计数器并更新 `last seen`。不要创建重复条目。
- 限制：每次审计运行最多新增 3 个模式条目。当符合条件的发现项超过 3 个时，按影响范围优先排序 — 多文件发现项优先于单文件发现项。
- 按以下格式追加条目：

```markdown
## <模式类别>（例如：错误处理、命名、死代码）
- <描述> — 首次在审计 <YYYY-MM-DD> 中发现，频率：<count>，最后发现时间：<YYYY-MM-DD>
  建议：<工作人员应如何避免此问题>
```

- 在会话内存索引中将 `anti-patterns.md` 标记为 `#hot`，以便工作人员在会话开始时与其他热层文件一同加载它。

**压缩流程（在 Writer 追加新条目后运行，而非之前）：**

新发现始终先写入。追加后，Writer 会检查是否需要压缩。当满足以下任一条件时触发压缩：

- `anti-patterns.md` 中的条目总数超过 50。
- 任意条目的 `last seen` 距今超过 6 个月且 `frequency == 1`（过时的单例条目 — 从未被再次印证）。
- 文件行数达到或超过 `memory.compactionThreshold`（默认值为 300，来自 `~/.hyperflow/config.json`）。

触发后，Writer 按以下顺序执行这些操作：

1. **合并重复项。** 同一类别中措辞相近的条目会合并为一条。合并后的 `frequency` = 被合并条目的总和；`last seen` = 被合并条目中最近的日期。措辞采用频率较高的条目。
2. **归档过时的单例条目。** 满足 `frequency == 1` 且 `last seen` 早于 6 个月前的条目，会移至 `.hyperflow/memory/archive/YYYY-MM.md`（月份从条目的 `last seen` 日期派生），并附带其来源标签，以确保仍可检索。这与 `/hyperflow:cache compact` 使用的共享月度归档约定相同 — 参见 `skills/cache/references/compaction.md`。
3. **最多保留 50 个条目。** 如果合并和归档后文件仍超过 50 个条目，则移除频率最低的条目。决胜规则：优先移除 `last seen` 最早的条目。**绝不移除源自 `[Critical]` 发现的条目** — 最高严重级别的模式正是必须持续出现的模式；如果需要移除，但超出上限的仅剩源自 Critical 的条目，则保留文件超出上限，并在下一次压缩时记录此情况。被移除的条目会移至同一共享月度归档。
4. **热层已完成接入。** `anti-patterns.md` 永久属于热层（参见 `memory-system.md`）。压缩后的文件会在下次会话开始时自动注入。无需手动刷新热层。

如果触发了压缩，但三个操作均没有符合条件的可处理项（例如，行数阈值因一个冗长但已去重且条目数 ≤50 的文件而触发），Writer 会跳过重写 — 不进行无操作的压缩调度。如果完全未触发压缩，Writer 会完全跳过此代码块，并继续执行 Reviewer。

然后分派 `**Reviewer** — 4d anti-pattern dedup and compaction check`，以验证：没有重复条目写入，频率计数器准确，只有 Critical/Important 发现被提升，新条目数量不超过 3，并且 — 当执行了压缩时 — 没有关键条目在未归档的情况下被删除，且归档侧车文件已正确写入。结论 ∈ {`PASS`, `NEEDS_REVISION`}。当为 `NEEDS_REVISION` 时，Writer 会重新读取文件并修正具体违规项（最多重试 1 次，之后以内联方式呈现）。

### 步骤 5 —— 严重性协调（根据 DOCTRINE 12.2.8 免除原子性要求）

派遣一个 `**Reviewer** — severity reconciliation`，用于整合步骤 3 子阶段（3a/3b/3c）已经输出的 `[Critical] / [Important] / [Suggestion] / [Praise]` 标签。不派遣任何 Worker：Reviewer 读取现有的步骤 3 标签，并解决各子阶段之间的冲突（例如，某项发现已在 3a 中标记为 `[Important]`，在 3b 中标记为 `[Critical]`，则最终解析为 `[Critical]`）。Verdict ∈ {`PASS`, `NEEDS_REVISION`}。当结果为 `NEEDS_REVISION` 时，Reviewer 注明具体冲突；编排器直接应用该解决结果（不重新派遣任务）。

步骤 5 完成后，编排器将分级后的发现写入审计文件（为步骤 4 的各节标题应用严重性标签），并输出聊天摘要（文件优先，DOCTRINE 规则 8）：

```
── Audit Result ──────────────────────
Scope:    main..HEAD (13 files)
Level:    L3
Verdict:  NEEDS_FIX
Findings: 0 Critical · 4 Important · 4 Suggestions · 5 Praise
Written:  .hyperflow/audits/2026-05-16-1730-memory-compaction.md
─────────────────────────────────────
```

聊天中不得出现 `[Critical]` / `[Important]` 正文行。用户打开文件（或由聊天宿主预览文件）。对于 `PASS` 且干净的运行（没有 Critical/Important），只输出一行 `Audit clean — no fixes needed.`，同时仍然写入包含 praise + suggestions 列表的文件（以保留审计历史）。仅在 `SECURITY_VIOLATION` 时跳过文件写入——此类问题需要立即在用户视线范围内显示；直接内联输出发现并停止。

### 步骤 6 —— 修复门禁（结构性门禁 · DOCTRINE 规则 8）

摘要输出后，审计 skill **MUST** 通过 `AskUserQuestion` 询问用户是否应用这些发现。根据 DOCTRINE 规则 8，只要存在发现，该门禁就必须触发——自主执行指令**不得**跳过它。静默采用默认选项属于违反 doctrine 的行为。

**仅在以下情况下跳过门禁：** verdict 为 `PASS`，且不存在 `[Critical]` 或 `[Important]` 条目（仅有 Suggestions 或仅有 Praise）。在输出一行 `Audit clean — no fixes needed.` 后停止。

**以下情况下也跳过门禁：** verdict 为 `SECURITY_VIOLATION`。停止并交由用户决定。

**否则**，询问：

```
?  Audit findings written to .hyperflow/audits/<timestamp>-<slug>.md — apply fixes?

   Fix all (Recommended)   — Critical + Important + Suggestions via /hyperflow:plan → /hyperflow:dispatch
   Critical + Important    — skip Suggestions, fix the rest
   Critical only           — fix the must-haves, defer the nice-to-haves
   No, leave as-is         — stop; you'll handle manually
```

Recommended 选项根据发现的组合进行调整：
- 存在任何 `[Critical]` → `Fix all (Recommended)` — Critical 项不能延期
- 只有 `[Important]` + `[Suggestions]` → `Critical + Important (Recommended)`
- 只有 `[Suggestions]` → `No, leave as-is (Recommended)` — Suggestions 按定义是可选项；门禁仍会触发，但建议跳过

**对于任何 "Fix …" 选项：**

1. 根据所选发现构建 spec 文件，路径为 `.hyperflow/specs/audit-<YYYY-MM-DD>-<scope-slug>.md`。每项发现都应成为一个编号的修复章节，其中包含：file:line、问题、reviewer 建议的修复方案（如果没有提供 Fix:，则写入 "design needed"），以及 commit message stub。spec 文件是驱动链路的 artefact；不得将修复要点粘贴到聊天中。
2. 使用 `skill: plan` 和 `args: "session=one spec=.hyperflow/specs/audit-<YYYY-MM-DD>-<scope-slug>.md"` 调用 `Skill`。
3. `/hyperflow:plan` 将拆分为多个批次；`/hyperflow:dispatch` 将执行这些批次——与其他链路运行一样，遵循每个子任务的提交节奏以及每批次的 L1–L<n> 审查。

**关于“否”：**

打印一行并停止：

```
Audit complete — N findings recorded, no fixes applied. Re-run /hyperflow:audit later or invoke /hyperflow:plan manually if you change your mind.
```

如果无法将 `AskUserQuestion` 作为弹窗呈现，请使用可移植界面回退方案（Codex / OpenCode / Grok）：将修复关卡打印为带编号选项的 `Hyperflow Question` 聊天块，然后停止并等待用户回答。如果根本没有可用的交互式通道，请打印发现项和一行错误信息——绝不要静默自动修复或静默退出。

## 输出格式

每次审计运行生成两个输出：

**1. 审计文件**，位于 `.hyperflow/audits/<YYYY-MM-DD-HHmm>-<scope-slug>.md` —— 完整的结构化审查，按 [`../hyperflow/artefact-format.md`](../hyperflow/artefact-format.md) 格式编写：

```markdown
# Audit — <scope description>

## Status

| Field    | Value                                                |
|----------|------------------------------------------------------|
| Verdict  | `<PASS \| NEEDS_FIX \| SECURITY_VIOLATION>`          |
| Scope    | `<files / range / commit>`                           |
| Level    | L<n>                                                 |
| Findings | N Critical · N Important · N Suggestions · N Praise  |
| Date     | <YYYY-MM-DD HH:mm>                                   |

## TL;DR

<2–3 sentences: the most important takeaway + the most important fix
to apply. The user reads this and decides whether to dig into the
findings list.>

## Findings

### [Critical] `<file>:<line>` — <one-line issue title>

**Issue:** <one paragraph: what's broken and why it's blocking>

**Fix:** <one paragraph: the recommended change, with the file:line
anchor and the suggested replacement>

**Why it matters:** <one sentence: the user-visible or system-level
consequence if shipped as-is>

### [Important] `<file>:<line>` — <one-line issue title>
...

### [Suggestion] `<file>:<line>` — <one-line improvement title>
...

### [Praise] `<file>:<line>` — <one-line note>
...

## Security scan (L3+ mandatory)

| Category          | Result                |
|-------------------|-----------------------|
| secrets           | pass                  |
| injection         | pass                  |
| path traversal    | pass                  |
| DoS               | pass | concerns       |
| missing validation| pass | concerns       |

## Cost

| Role      | Agents | Tokens   |
|-----------|-------:|---------:|
| Worker    |      1 |     ~Nk  |
| Reviewer  |      1 |     ~Nk  |
| **Total** |  **2** | **~Nk**  |
```

**2. 聊天摘要** —— 一个指向文件的简短框，绝不包含发现项本身：

```
── Audit Result ──────────────────────
Scope:    <files / range>
Level:    L<n>
Verdict:  <PASS | NEEDS_FIX | SECURITY_VIOLATION>
Findings: 0 Critical · 4 Important · 4 Suggestions · 5 Praise
Written:  .hyperflow/audits/<YYYY-MM-DD-HHmm>-<scope>.md
──────────────────────────────────────
```

## 交接

- **PASS**（没有值得修复的发现项）——打印 `Audit clean`。如果用户已准备好发布，建议使用 `/hyperflow:deploy`。不要自动发布。
- **NEEDS_FIX** ——触发修复关卡（步骤 6）。选择 `Yes …` → 自动串联至 `/hyperflow:plan`。选择 `No` → 打印发现项后停止。
- **SECURITY_VIOLATION** ——中止。跳过修复关卡。由用户决定补救路径。

## 准则

完整规则见 [DOCTRINE.md](../hyperflow/DOCTRINE.md)。输出风格见 [output-style.md](references/output-style.md)。每步代理调度遵循规则 12。

## 概述

`/hyperflow:audit` 会针对未提交的更改、特定提交、分支或 PR 执行多级代码审查。搜索代理收集上下文；独立的 Reviewer 根据所选级别（从 L1 快速扫描到 L5 穷尽式审查）给出结论。当结果为 `NEEDS_FIX` 时，结构性门控会询问用户是否应用发现的问题：`Yes` 会自动串联至 `/hyperflow:plan`，后者会分解修复工作，然后在任何构建开始前停在其自身的构建位置门控处；`No` 则保持 diff 不变。

## 前置条件

- Git 仓库中存在待审查的更改，且这些更改位于工作树、暂存区或历史记录中。
- `.hyperflow/` 缓存为可选项，但建议使用（Layer 0 分析可改善 Reviewer 的上下文）。如缺失，请先运行 `/hyperflow:scaffold`。

## 指令

参见上方的 [Flow](#flow) —— 步骤 1-6 是操作指令。摘要：

1. 解析范围（目标参数或 `git diff HEAD`）。
2. 表面映射 + 语义索引 + 约定扫描（并行执行 2a/2b/2c）；汇总覆盖率门控（2d）。
3. L1+L2 语法/命名（3a）+ L3 集成/安全性（3b）+ L4+L5 性能/无障碍性（3c）；每个子阶段均为 Reviewer 对 → 聚合器。
4. 发现问题综合：关键问题（4a）+ 重要问题（4b）+ 建议/记忆（4c）——每个子阶段均为 Writer 对 → Reviewer。
5. 严重性协调（原子豁免 —— 单个 Reviewer 汇总步骤 3 的标签）；打印指向审计文件的聊天摘要。
6. 当出现带有关键/重要发现的问题的 `NEEDS_FIX` 时，触发修复门控。

## 输出

精确区块格式见上方的 [Output Format](#output-format)。每次调用仅输出一个审查区块；底部的代理数量行显示模型/角色拆分。

## 错误处理

| 失败情况 | 行为 |
|---|---|
| 没有可审查的 diff（工作树干净，且未提供目标） | 打印 `Nothing to review — clean working tree. Pass an explicit target.` 并停止。 |
| Searcher 未返回上下文（文件已删除、路径错误） | Reviewer 标记 `[Critical] — target unreachable`，并在步骤 3 停止。 |
| Reviewer 发出 `SECURITY_VIOLATION`（仅 L3+） | 跳过步骤 4 及后续步骤。打印发现的问题。不要触发修复门控。由用户决定修复方式。 |
| `AskUserQuestion` 弹窗不可用（Codex / OpenCode / Grok） | 将修复门控作为 `Hyperflow Question` 聊天区块打印，并等待用户回答。 |
| 完全没有交互通道 | 打印发现的问题，并附带一行错误信息，说明修复门控无法触发。绝不可静默自动修复或静默退出。 |
| Reviewer 不同意工作代理上下文（步骤 2 覆盖率检查中出现 `NEEDS_FIX`） | 使用 Reviewer 的缺口列表重新调度 Searcher。最多重试 2 次，然后将缺口呈现给用户。 |

## 示例

已将完整的执行记录移至 [examples.md](references/examples.md)，以保持 SKILL 正文简洁。示例仅用于说明，并非行为的必要依据。需要查看端到端执行记录时，请阅读配套文件。

## 资源

- [DOCTRINE.md](../hyperflow/DOCTRINE.md) —— 编排规则（尤其是 #8 结构性门控、#12 每步代理）。
- [review-levels.md](references/review-levels.md) —— L1-L5 的完整检查清单。
- [reviewer-prompt.md](references/reviewer-prompt.md) —— Reviewer 模板。
- [security.md](references/security.md) —— 安全扫描策略（L3+ 必需）。
- [memory-system.md](references/memory-system.md) —— 模式的持久化方式。
- [output-style.md](references/output-style.md) —— 标签和表格约定。