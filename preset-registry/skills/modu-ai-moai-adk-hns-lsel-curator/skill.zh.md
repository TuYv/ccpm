---
name: hns-lsel-curator
description: >
  Local Self-Evolution Loop (LSEL) curator — the CLUSTER + drain engine for the
  GOOS-local PROPOSE→APPLY seam closure (SPEC-LSEL-LOCAL-EVOLUTION-001). Companion-offset
  drain of .moai/lessons-inbox.jsonl with a drain-side severity filter that drops the ~65%
  Bash-timeout/sandbox noise, event_key clustering with a frequency gate, and a
  Generative-Agents-style 1-10 importance score. Candidates stage at
  .moai/state/lsel/clusters.json. M1 = drain only (NO PROPOSE, NO APPLY, NO memory/ writes).
allowed-tools: Read, Grep, Glob, Bash
user-invocable: false
metadata:
  version: "0.2.0"
  category: "harness"
  status: "active"
  updated: "2026-08-26"
  tags: "lsel,self-evolution,drain,cluster,harness,dogfood"
---
# hns-lsel-curator — LSEL CLUSTER + drain 引擎

> **Namespace:** `hns-lsel-*` 是用户拥有的 dogfood（CLAUDE.local.md §24）。此技能
> 不会镜像到 `internal/template/templates/` 中——它只存在于此仓库。毕业到
> `moai-lsel-*` + 16 语言分发是一个独立的 SPEC（根据 spec.md §G，不在范围内）。
>
> **M1 范围：** drain + cluster + stage candidates。不包含 APPROVE，不包含 APPLY（M3）。
> **M2 范围：** drain + cluster + **PROPOSE shadow**（不包含 APPROVE，不包含 APPLY）。PROPOSE 阶段
> 会生成 shadow proposals + self-critiques；APPROVE/APPLY 将在 M3 中通过全新的
> `hns-lsel-applier` 路径落地。M2 不会写入 `memory/`——第一个 `feedback_*.md` 主题
> 文件是 APPROVE 之后、作为 M3+ 交付物生成的。

## 此技能的功能

MoAI-ADK 仓库会在 `.moai/lessons-inbox.jsonl` 中累积工具失败存根（M1 开始时为 624 个存根，
重新测量后——这是一个持续变化的目标）。宪章将编排器指定为 drain 执行者，但在此技能之前，
**完全没有机械化的 drain 代码**——drain 只存在于一段原则性文字中
（`moai-constitution.md:147`）。此技能在用户拥有的界面中填补了这一空白，同时不触碰冻结的
Go applier（`internal/harness/applier.go:22`——其写入标志保持为 `false`；REQ-LSEL-003：
绕过它，绝不解冻）。

drain 被拆分为一个**机械核心**（`drain.sh`，确定性、可测试）和一个
**模型介导层**（本 SKILL.md + 你的判断，用于 M2+ 重要性细化和提案起草）。

## 机械核心——`drain.sh`

`drain.sh` 是一个便携式 bash + jq 脚本，与本 SKILL.md 位于同一目录。它执行 drain 的确定性部分：

```
drain.sh --inbox <path-to-lessons-inbox.jsonl> --state-dir <path-to-lsel-state>
```

流水线（REQ-LSEL-009 + AC-LSEL-009 / AC-LSEL-010）：

1. **Companion offset** — 读取 `<state-dir>/drain-offset.json`（如果不存在则以 `{"offset":0}` 为种子）。
   inbox 只允许追加，并且永远不会被修改；offset 标记已消费的存根
   （SPEC-HARNESS-RATCHET-REWIRE-001 D3 companion-offset 模式）。
2. **Slice** — 从 offset 之后开始读取存根（`tail -n +<offset+1>`）。
3. **Drain-side severity filter**（AC-LSEL-010）——在聚类之前丢弃噪声：
   - `tool_failure:Bash:UnknownFailure`——不透明的约 65% 超时/沙箱类别（主要
     噪声占比；见报告 §2）。
   - `tool_failure:Bash:SandboxViolation`——环境约束，而非代码缺陷。
   - 任何 `*:TimeoutError`（Bash 和 MCP 超时）。
   之所以在 drain 侧进行过滤，是因为 `internal/hook/failure_observer.go`（inbox 写入器）位于
   六个可由循环写入的界面之外（plan.md §F.1 [DECISION RESOLVED]），因此循环无法编辑写入器——
   它只能在读取时进行过滤。
4. **Cluster** — 按 `event_key` 聚类，并统计频率、首次/最后一次出现时间，以及最多 3 个示例摘要。
5. **Singleton gate** — 丢弃 `frequency < 2` 的聚类（根据宪章 Lessons Protocol drain 段落，
   单次出现的噪声）。
6. **Importance** — 使用 Generative-Agents 风格的 1-10 门槛为每个幸存项评分：
   `importance = min(10, frequency)`（以频率作为代理值；在 M2+ 中，模型会使用严重性提示和
   加权检索判断来增强这一评分）。
7. **Emit** — 将候选项输出到 `<state-dir>/clusters.json`；推进 companion offset。

### `clusters.json` 模式

```json
{
  "drained_at": "2026-08-04T08:41:00Z",
  "offset_before": 0,
  "offset_after": 624,
  "total_read": 624,
  "noise_discarded": 533,
  "singletons_discarded": 4,
  "candidates": [
    {
      "event_key": "tool_failure:Agent:UnknownFailure",
      "frequency": 41,
      "first_seen": "...",
      "last_seen": "...",
      "sample_summaries": ["...", "...", "..."],
      "source": "tool:Agent",
      "importance": 10
    }
  ]
}
```

### 空增量无操作

如果收件箱的内容没有增长到超过偏移量，`drain.sh` 会写入一个候选项为空的 `clusters.json`，
并保持偏移量不变。这不是失败（`acceptance.md §E` 边界情况）。

## 模型介入层（调用时的你）

`drain.sh` 会生成确定性的候选集。在此技能因真实整理流程（M2+）而被调用时，你在机械输出之上需要：

- **读取 `clusters.json`**，先按 `importance`、再按 `frequency` 对候选项排序。
- **使用机械核心无法看到的严重性提示来补充 importance**：反复出现的
  `Bash:ExitError` 集群指向真实的命令形式缺陷（高信号）；反复出现的
  `Agent:ContextCancelled` 集群可能只是会话拆除噪声（较低信号）。在起草 M2 提案时，将
  理由记录在候选项的正文中——不要重写 `clusters.json`（它是机械产物；你的补充内容应存在于提案中）。
- **在 M1 中不要写入 `memory/`**。候选项仅暂存于 `clusters.json` 中。第一个
  `feedback_*.md` 主题文件由 M2 PROPOSE 阶段在先检索再提案以及自我批评之后生成
  （REQ-LSEL-010）。

## 此技能不执行的操作（M1 边界）

- **没有 APPROVE / APPLY** —— 并行的用户拥有的应用器（`hns-lsel-applier`）属于 M3。
- **不编辑冻结的规约** —— `.claude/rules/moai/**`、`CLAUDE.md`、
  `internal/template/templates/**`、保留的代理、`moai-*` 技能，以及冻结的 Go 应用器 / `curator_dispatch.go`
  均逐字节保持不变（REQ-LSEL-001 / §B.3）。
- **不新增 `.moai/config/sections/` 文件** —— 循环状态位于 `.moai/state/lsel/` 下
  （新建的 section 文件会在 `moai update` 时被清除；plan.md §B.4 / AP-LSEL-005）。
- **没有仅供编排器使用的同步用户提问通道** —— 这是由子代理拥有的机制技能；它永远不会调用编排器的用户闸门。
  如果缺少输入，则返回结构化阻塞报告；由编排器运行用户闸门（CLAUDE.md §8）。

## 持久化操作 —— 会话启动触发器（`session_drain.sh`）

排空操作原先的“调度”是一个会话范围内的 `/loop` 配方，会随着其所属会话结束而失效（2026-08-04），
即使在会话存续期间也什么都没有执行——收件箱在无人获知的情况下停滞了 3 周
（SPEC-LSEL-DRAIN-STALL-001 §B）。现在触发器是机械式的：

**所有排空操作都必须经过 `session_drain.sh`**（位于此 `SKILL.md` 旁边），绝不能直接调用
`drain.sh`。该包装器补充了冻结核心刻意缺少的功能：独占式排空锁（发生争用时安全地不执行任何操作）、在任何覆盖操作**之前无条件**将已有的
`clusters.json` 归档到 `clusters-history/` 中（直接调用 `drain.sh` 会绕过归档，并可能静默丢弃暂存的候选项——
`drain.sh` 会在排空路径和无操作路径上都覆盖 `clusters.json`）、一行状态信息，以及故障开放（任何内部错误都会降级为 stderr 通知并以
exit 0 退出——钩子永远不会阻塞会话启动）。

```bash
session_drain.sh [--inbox <path>] [--state-dir <dir>]   # defaults: live paths
```

**PROPOSE 读取 `.moai/state/lsel/clusters-history/` 中归档的副本**（按最新优先），而不是实时的 `clusters.json`——在按会话启动执行 drain 的情况下，实时文件是临时的：下一次无操作会话启动会将其覆盖为 `candidates: []`。wrapper 的归档才是持久保留的结果。

**本地 wiring 是维护者机器上的交付物**（在 M2 中应用，NOT 随 PR 携带——被跟踪的 `.claude/settings.json` 条目会在每次
`moai update` 时被清除，因此被跟踪的 wiring 明确是错误的）：将 `session_drain.sh`
和 `backlog_check.sh` 两者都添加到 `.claude/settings.local.json` 的 `.hooks.SessionStart` 中，并为每个显式设置 `"timeout": 30`（对于 1.1MB inbox，实测完整 backlog drain 耗时 <1s；30s 与现有的 live SessionStart hook 先例一致）。Wiring 验证：
`jq '.hooks.SessionStart' .claude/settings.local.json`。

**已移除无效锚点：** `backlog_check.sh` 中原先对 `CLAUDE.local.md` 第 28 节锚点的引用
（header comment + reminder body——两处）已在 SPEC-LSEL-DRAIN-STALL-001 M1 中移除；操作说明现位于本节中，并镜像到恢复后的 CLAUDE.local.md LSEL 节（M2 本地交付物）。

## 验证（声明 drain 完成前运行）

```bash
# 1. The drain mechanics + the wrapper (fixture-based characterization tests —
#    AC-LSEL-009/010 and AC-LDS-001..006 + the mutant probe):
.claude/skills/hns-lsel-curator/drain_test.sh
.claude/skills/hns-lsel-curator/session_drain_test.sh

# 2. A real drain of the live backlog — VIA THE WRAPPER (all drains are
#    wrapper-mediated; re-measure first, the inbox is a moving target). Capture
#    BEFORE the drain, then judge the ARCHIVED copy: a later no-op session-start
#    drain overwrites the live clusters.json with candidates: [], but the wrapper
#    archives unconditionally before any overwrite, so the bulk-drain result
#    survives in clusters-history/.
OFFSET_BEFORE=$(jq -r .offset .moai/state/lsel/drain-offset.json)
LIVE_COUNT=$(wc -l < .moai/lessons-inbox.jsonl | tr -d ' ')
.claude/skills/hns-lsel-curator/session_drain.sh --inbox .moai/lessons-inbox.jsonl --state-dir .moai/state/lsel
ARCHIVE=$(ls -t .moai/state/lsel/clusters-history/clusters-*.json | head -1)
jq --argjson n "$LIVE_COUNT" --argjson b "$OFFSET_BEFORE" \
   '(.offset_after == $n) and ((.candidates // []) | length >= 1) and (.total_read == ($n - $b))' "$ARCHIVE"
# must print: true  (offset==live AND candidates>=1 AND self-consistent — the
# AC-LDS-010 predicate; the session_drain_test.sh mutant probe proves it rejects
# an offset-only-advance fake)

# 3. M1 invariant — zero memory/ writes from the drain:
find memory -newer <drain-start-timestamp> -name 'feedback_*' 2>/dev/null | wc -l   # must be 0
```

## 特征测试

`drain_test.sh`（与本 SKILL.md 位于同一目录）是 TDD RED→GREEN harness。它会构建一个包含已知噪声 + 信号 stub 的合成 inbox，运行 `drain.sh`，并断言 drain 语义：
预聚类阶段排除噪声、以正确频率对信号进行聚类、丢弃单例、推进 offset、生成 candidates、不写入 `memory/`，以及重复 drain 具有幂等性。在对 `drain.sh` 做任何编辑后运行它。`session_drain_test.sh`（同一目录）是 wrapper harness——覆盖五条路径（drain / lock contention / archive-before-overwrite / no-op / fail-open）以及 mutant probe。在对 `session_drain.sh` 做任何编辑后运行它。

## 交叉引用

- **SPEC：** `.moai/specs/SPEC-LSEL-LOCAL-EVOLUTION-001/{spec,plan,acceptance,progress}.md`
- **设计报告（SSOT）：** `.moai/reports/moai-local-self-evolution-design-20260804.html`
  §6 第 2 阶段（CLUSTER）、§10 P1、§11 mustFix B#1/B#3。
- **冻结的 applier（仅供参考）：** `internal/harness/applier.go:22`
  （write-flag，保持为 `false`）、`internal/harness/curator_dispatch.go`。
- **Constitution drain 段落（该 skill 所替代的“0 Go code”存根）：**
  `.claude/rules/moai/core/moai-constitution.md:147`。
- **命名空间防护：** `internal/template/split_namespace_test.go`、
  `internal/template/internal_content_leak_test.go`（在 M2 中扩展 — AC-LSEL-006）。

---

## PROPOSE 阶段（M2 — shadow proposals）

PROPOSE 阶段会消费归档在
`.moai/state/lsel/clusters-history/` 中的候选集群
（最新的归档 — 实时的 `clusters.json` 在每次会话启动 drain 中都是临时的：下一次 no-op drain 会用
`candidates: []` 覆盖它，SPEC-LSEL-DRAIN-STALL-001 REQ-LDS-010），并在
`.moai/state/lsel/proposals/<proposal-id>/` 生成 **shadow proposals** — 每个值得采取行动的候选项对应一个。
M2 proposals 仅为 SHADOW：不执行 APPROVE，不执行 APPLY。
APPROVE/APPLY 将在 M3 中通过新的 `hns-lsel-applier` 路径落地（**不是**通过已失效的
`moai-harness-learner` Tier-4 流程 — 参见下文的“Tier-4 finding”）。

### Retrieval-before-propose（Reflexion）

在起草 proposal **之前**，从
`~/.claude/projects/<hash>/memory/` 中检索相关的 `feedback_*.md` 主题文件。
检索结果会将 proposal 建立在既有经验教训之上（Reflexion 风格），并在 proposal 的
`retrieval_evidence` 块中留下证据。没有检索证据的 proposal 属于格式错误，**绝不得**生成。

### Proposal payload schema（AC-LSEL-011）

每个 proposal 位于 `.moai/state/lsel/proposals/<id>/`，并且恰好包含：

| 文件 | 用途 |
|------|---------|
| `proposal.md` | YAML-frontmatter payload + 正文 |
| `diff.patch` | 拟议的编辑内容（unified diff；在 M2 中**不应用**） |
| `self-critique.md` | 针对冻结 doctrine 执行的模型批评 |

`proposal.md` 的 YAML frontmatter 携带完整 schema（8 个必需键）：

```yaml
---
proposal_id: lsel-001
target_surface: <one of the 6 evolvable surfaces, spec.md §B.3>
rationale: |
  <what + why>
WHY-not-just-WHAT: |
  <the reasoning, not just the change — catches "what" proposals that skip the "why">
prediction: <a FALSIFIABLE expected effect — the verify_command must be able to falsify it>
verify_command: <a runnable command that, if green, confirms the prediction>
blast_radius: <which surfaces the diff touches; used by the CSA forced-gate match>
memory_type: semantic|procedural|episodic   # CoALA taxonomy
retrieval_evidence:
  - <path to a feedback_*.md retrieved before drafting>
status: blocked   # blocked | ready — blocked if self-critique has an UNRESOLVED objection
---
```

### Self-critique gate

`self-critique.md` 由模型执行（**不是**机械式 doctrine 检查器 — 报告 §13 caveat 3：
模型可能会进行合理化；冻结的 allowlist + `/moai gate` 才是真正的安全底线）。其中
列出针对冻结 doctrine 的异议；每条异议都标记为 RESOLVED 或 UNRESOLVED。任何包含
UNRESOLVED 异议的 proposal 都是 `status: blocked`，并且**不得**继续进入 APPROVE。
始终无法收敛的 proposal 会保持 blocked；curator 会返回 blocker 报告，而
orchestrator 会将其呈现出来（acceptance.md §E edge case — 这不会阻塞 M2 的发布；它证明了该 gate 会触发）。

### Tier-4 发现（AC-LSEL-012 — **不要接通已失效的流程**）

**发现（已于 2026-08-04 通过 `tier4_firing_test.sh` 验证）：`moai-harness-learner` Tier-4
同步用户问题流程在生产调用层已失效。** CLI（`moai harness apply`）
只打印一个存根字符串，从不调用 learner skill；`CuratorDispatch` 没有任何生产环境调用方（审计中的警示性先例）；
冻结 applier 的写入标志（`internal/harness/applier.go:22` 中的 `false`）就是 apply 死开关；并且不存在任何机械触发器会让编排器呈现 Tier-4
提案（这正是审计报告中的确切失败模式，报告 §11 的 mustFix B#1）。

根据 acceptance.md §E 的边界情况，M2 不会让 PROPOSE→APPROVE 交接依赖 Tier-4 流程。APPROVE 通过 M3 的新路径（`hns-lsel-applier` + 带有
同步审批标记的 `decision.json`）进行路由。M2 只发出影子提案。此发现已记录在
`tier4_firing_test.sh` 中，并在 M2 wiring 提交中引用。

## CSA 强制门控类别（AC-LSEL-005 / REQ-LSEL-005）

APPROVE 阶段（M3，`hns-lsel-applier`）会针对其影响范围触及以下六类 CSA
强制门控类别中任一类别的提案，强制执行同步用户问题门控
（编排器运行）——无论提案者的置信度如何：

1. **INVARIANTS 内核** — `CLAUDE.local.md` 顶部的只读目标内核块。
2. **安全/验证例外**区段 — 输入验证例外、可防止数据丢失的错误处理、OWASP 措施。
3. **高 fan-in 引用** — `@MX:ANCHOR` 函数，且 fan_in ≥ 3 个调用方。
4. **Bash 风险路径** — 破坏性原语集合 + `BASH_SUBCOMMAND_SOFT_CAP` 复合命令
   （coding-standards.md § Bash Risk-Amplifier Doctrine）。
5. **`permissions.allow`** 添加项 — 明确的安全例外区段；逐行同步审批（每个新增的 allow 条目都构成其自身的强制门控）。
6. **execution-meta 文件** — REQ-LSEL-002/005 中所述的四类 execution-meta：
   (i) 位于 `.claude/lsel/frozen-allowlist.json` 的冻结 allowlist meta 文件，(ii) applier
   或 curator skill 的正文（`hns-lsel-applier/`、`hns-lsel-curator/`），(iii) apply hook
   脚本（`lsel-apply.sh` 及其包装器），(iv) `settings.local.json` 中的 hook 注册子块。

**打扰成本豁免：**强制门控**不受打扰成本限制**——打扰成本门控规则仅适用于常规层级提案。无论打扰成本状态如何，强制门控提案始终会触发
同步用户问题门控（编排器运行）。

**机械强制执行（D3）：** applier（由 M3 驱动 `lsel-apply.sh` 的 `hns-lsel-applier`）
会拦截每个匹配上述四类 execution-meta 的提案，并且除非提案的 `decision.json` 携带明确的同步审批标记，否则**拒绝**写入
（该标记是由编排器的同步用户问题门控生成的审批工件）。
匹配但没有标记的提案会中止 apply，
向 `.moai/logs/lsel-reject.log` 追加一行拒绝记录并列出匹配的类别，同时
不写入任何内容。未匹配上述四类中任何一类的提案，则通过常规打扰成本路径继续处理。这种机械拦截使得自我修改式束缚防御具有可辩护性，而无需仅仅依赖正则表达式悖论。

`csa_refusal_test.sh`（与此 SKILL.md 位于同一目录）是拒绝规则的 fixture 测试。

---

## REFLECTION 阶段（M4 — REQ-LSEL-014 / AC-LSEL-016）

定期整合流程用于防止未经提炼的积累——设计报告 §10 P4 所称的主要故障模式：“不进行整合 / 衰减 / 剪枝 → 检索到错误经验”。如果没有 REFLECTION，具体主题文件会不断堆积，检索结果会呈现过时的具体事件，而不是这些事件共同支撑的原则。

### 由阈值触发，而非由时钟触发

当具体 `feedback_*.md` 主题文件的**累积重要性**超过阈值（默认约为 150）时，REFLECTION 才会触发，而不是依赖每月一次的 cron。这就是设计报告 §10 P4 所引用的 Vectorize 四杠杆模型（重要性门控 / 合并 / 衰减 / 淘汰）：重要性在写入时分配，而反思阈值是累积信号，而非日历信号。低于阈值的单主题群组应当干净地无操作退出（acceptance.md §E 边界情况）。

### 机械核心 — `reflect.sh`

`reflect.sh --memory-dir <m> [--threshold 150] [--min-topics 3]`：

1. 读取处于活动状态的 `feedback_*.md` 主题文件（maxdepth 1 — 绝不读取 `_archive/` 冷层）。
2. 汇总其 frontmatter 中的 `importance`。如果 `count < min-topics` 或 `sum <
   threshold` → 干净地无操作退出（exit 0）。
3. 合成一个 `feedback_*_principle_*.md`，其中包含：
   - 一个 `memory_type` 标签（CoALA 分类法——反馈原则使用 `semantic`；
     `procedural` 则应路由到 `hns-*` skill 正文）。
   - 从源描述中提取的共同主题（检索提示）。
   - 用于审计追踪的 `source_count` + `synthesized_at`。
4. 将原文件**移动**到 `memory/_archive/`（冷层）——**绝不删除**
   （报告 §10 P4：“淘汰 ≠ 归档——归档用于性能，硬删除用于合规；MoAI 的
   ‘不删除而归档’规则已被证明是正确的”——归档会保留审计追踪）。

### 按衰减加权的检索

原文件会被移至 `_archive/`，因此活动召回集合（召回层优先扫描的
`memory/` 目录）中保存的是合成后的原则，而**不是**过时的具体原文件。针对相关提示的检索探测会返回排名**高于**归档原文件的原则——这就是 AC-LSEL-016 条款所要求的按衰减加权的检索。原则的
`description` 经过编写，可以匹配共同提示；归档的原文件仍然可被发现（冷层），但不再主导召回集合的顶部结果。

### 模型介导层（调用时由你负责）

`reflect.sh` 执行机械式合成（具有确定性）。当此 skill 运行一次真实的反思流程时，你还需要：
- **阅读合成后的原则**，并将其 prose 提炼为真正的抽象陈述（机械核心会聚合描述；实际原则由你撰写）。
- **确认 `memory_type`**——如果整合后的知识属于过程性知识（应归入某个 `hns-*` skill 正文的操作方法），则标记 `memory_type: procedural`，并将该合成内容路由到对应 skill，而不是继续保留为 `feedback_*`。
- **不要删除归档**——`_archive/` 中的原文件是审计追踪。如果热层（活动的 `feedback_*.md`）接近 50 个文件的上限，应优先归档更多具体主题，而不是删除它们（moai-memory.md § Memory Hygiene）。

### 验证（在宣布反思阶段完成前运行）

```bash
# M4 REFLECTION characterization test (AC-LSEL-016) — hermetic temp memory dir:
.claude/skills/hns-lsel-curator/reflect_test.sh

# cold-tier growth vs hot-tier (post-M4 audit, acceptance.md §H):
ls memory/_archive/ | wc -l   # archived originals
ls memory/feedback_*.md | wc -l   # active hot tier
```