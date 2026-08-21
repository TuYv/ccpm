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
  version: "0.1.0"
  category: "harness"
  status: "active"
  updated: "2026-08-04"
  tags: "lsel,self-evolution,drain,cluster,harness,dogfood"
---
# hns-lsel-curator — LSEL 聚类 + 排空引擎

> **命名空间：** `hns-lsel-*` 是用户自有的内部试用内容（CLAUDE.local.md §24）。此技能
> 不会镜像到 `internal/template/templates/`，而是仅存在于此仓库中。晋级为
> `moai-lsel-*` 并分发至 16 种语言属于单独的 SPEC（根据 spec.md §G，不在范围内）。
>
> **M1 范围：** 排空 + 聚类 + 暂存候选项。无 APPROVE，无 APPLY（M3）。
> **M2 范围：** 排空 + 聚类 + **PROPOSE 影子阶段**（无 APPROVE，无 APPLY）。PROPOSE 阶段
> 会生成影子提案 + 自我批评；APPROVE/APPLY 将在 M3 中通过全新的
> `hns-lsel-applier` 路径落地。M2 不会写入 `memory/`——第一个 `feedback_*.md` 主题
> 文件是 APPROVE 之后在 M3+ 中交付的产物。

## 此技能的作用

MoAI-ADK 仓库会在 `.moai/lessons-inbox.jsonl` 中积累工具失败存根（M1 启动时重新测得
624 个存根——这是一个持续变化的目标）。章程指定编排器作为排空执行者，但在此技能出现之前，
**完全没有机械化的排空代码**——排空仅以规范段落的形式存在
（`moai-constitution.md:147`）。此技能在用户自有界面中填补了这一空白，同时不会触及已冻结的
Go 应用器（`internal/harness/applier.go:22`——其写入标志保持为 `false`；
REQ-LSEL-003：绕过，绝不解冻）。

排空过程分为一个**机械核心**（`drain.sh`，确定性、可测试）和一个
**模型介导层**（此 SKILL.md + 你的判断，在 M2+ 中用于优化重要性评估
和起草提案）。

## 机械核心 — `drain.sh`

`drain.sh` 是一个可移植的 bash + jq 脚本，与此 SKILL.md 位于同一目录。它负责执行
排空流程中具有确定性的部分：

```
drain.sh --inbox <path-to-lessons-inbox.jsonl> --state-dir <path-to-lsel-state>
```

流水线（REQ-LSEL-009 + AC-LSEL-009 / AC-LSEL-010）：

1. **伴随偏移量**——读取 `<state-dir>/drain-offset.json`（若不存在，则以 `{"offset":0}` 初始化）。
   收件箱仅允许追加，且绝不会被修改；偏移量用于标记已消费的存根
   （SPEC-HARNESS-RATCHET-REWIRE-001 D3 伴随偏移量模式）。
2. **切片**——读取从偏移量开始的存根（`tail -n +<offset+1>`）。
3. **排空侧严重性过滤器**（AC-LSEL-010）——在聚类之前丢弃噪声：
   - `tool_failure:Bash:UnknownFailure`——不透明的约占 65% 的超时/沙箱类别（占比最高的
     噪声；报告 §2）。
   - `tool_failure:Bash:SandboxViolation`——环境约束，而非代码缺陷。
   - 任何 `*:TimeoutError`（Bash + MCP 超时）。
   该过滤器位于排空侧，因为 `internal/hook/failure_observer.go`（收件箱写入器）
   不属于六个循环可写界面（plan.md §F.1 [DECISION RESOLVED]），因此循环无法
   编辑写入器——只能在读取时进行过滤。
4. **聚类**——按 `event_key` 聚类，并记录频次、首次/最后出现时间以及最多 3 条示例摘要。
5. **单例门控**——丢弃 `frequency < 2` 的聚类（根据章程 Lessons Protocol 排空段落，
   单次出现属于噪声）。
6. **重要性**——使用生成式智能体风格的 1–10 门控为每个保留下来的聚类评分：
   `importance = min(10, frequency)`（以频次作为代理指标；在 M2+ 中，模型会结合
   严重性提示和检索加权判断对其进行补充）。
7. **输出**——将候选项输出到 `<state-dir>/clusters.json`；推进伴随偏移量。

### `clusters.json` 架构

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

### 空增量时无操作

如果收件箱尚未增长到超过该偏移量，`drain.sh` 会写入一个候选项为空的 `clusters.json`，
并保持偏移量不变。这不属于失败（acceptance.md §E 边界情况）。

## 模型介入层（即你，被调用时）

`drain.sh` 会生成确定性的候选集。当此技能被调用以执行真正的
筛选流程（M2+）时，你在机械输出之上的职责是：

- **读取 `clusters.json`**，依次按 `importance` 和 `frequency` 对候选项进行排序。
- **补充重要性判断**，加入机械核心无法识别的严重性提示：重复出现的
  `Bash:ExitError` 集群指向真实的命令结构缺陷（高信号）；重复出现的
  `Agent:ContextCancelled` 集群可能是会话关闭时产生的噪声（较低信号）。起草 M2 提案时，
  在候选项的文字说明中记录判断依据——**不要**重写
  `clusters.json`（它是机械产物；你的补充判断应放在提案中）。
- **在 M1 中不要写入 `memory/`。** 候选项仅暂存于 `clusters.json` 中。首个
  `feedback_*.md` 主题文件由 M2 PROPOSE 阶段在执行提议前检索
  和自我审查（REQ-LSEL-010）后生成。

## 此技能不执行的操作（M1 边界）

- **不执行 APPROVE / APPLY**——并行的用户所有应用器（`hns-lsel-applier`）属于 M3。
- **不修改冻结规范**——`.claude/rules/moai/**`、`CLAUDE.md`、
  `internal/template/templates/**`、保留的代理、`moai-*` 技能，以及冻结的 Go
  应用器 / `curator_dispatch.go` 均保持逐字节不变（REQ-LSEL-001 / §B.3）。
- **不新增 `.moai/config/sections/` 文件**——循环状态位于 `.moai/state/lsel/`
  下（新建的 section 文件会在执行 `moai update` 时被清除；plan.md §B.4 / AP-LSEL-005）。
- **不使用仅限编排器的同步用户提问通道**——这是由子代理所有的
  机制技能；它绝不会调用编排器的用户门控。缺少输入时，
  返回结构化的阻塞报告；由编排器运行用户门控（CLAUDE.md §8）。

## 验证（在宣布清空完成前运行）

```bash
# 1. The drain mechanics (fixture-based characterization test — AC-LSEL-009/010):
.claude/skills/hns-lsel-curator/drain_test.sh

# 2. A real drain of the live backlog (re-measure the count first — it is a moving target):
LIVE_COUNT=$(wc -l < .moai/lessons-inbox.jsonl | tr -d ' ')
.claude/skills/hns-lsel-curator/drain.sh --inbox .moai/lessons-inbox.jsonl --state-dir .moai/state/lsel
jq '.offset_after == ($LIVE_COUNT|tonumber) and (.candidates | length) >= 1' .moai/state/lsel/clusters.json

# 3. M1 invariant — zero memory/ writes from the drain:
find memory -newer <drain-start-timestamp> -name 'feedback_*' 2>/dev/null | wc -l   # must be 0
```

## 特征测试

`drain_test.sh`（与此 SKILL.md 位于同一目录）是 TDD RED→GREEN 测试工具。它会构建一个包含已知噪声与信号桩的合成收件箱，运行 `drain.sh`，并断言清理语义：聚类前排除噪声、以正确频率聚类信号、丢弃单例、推进偏移量、输出候选项、对 `memory/` 零写入，以及重复清理的幂等性。每次编辑 `drain.sh` 后都要运行它。

## 交叉引用

- **SPEC：** `.moai/specs/SPEC-LSEL-LOCAL-EVOLUTION-001/{spec,plan,acceptance,progress}.md`
- **设计报告（SSOT）：** `.moai/reports/moai-local-self-evolution-design-20260804.html`
  §6 阶段 2（CLUSTER）、§10 P1、§11 mustFix B#1/B#3。
- **已冻结的应用器（仅供参考）：** `internal/harness/applier.go:22`
  （写入标志，保持为 `false`）、`internal/harness/curator_dispatch.go`。
- **章程中的清理段落（此技能所取代的“0 Go 代码”桩）：**
  `.claude/rules/moai/core/moai-constitution.md:147`。
- **命名空间防护：** `internal/template/split_namespace_test.go`、
  `internal/template/internal_content_leak_test.go`（在 M2 中扩展 — AC-LSEL-006）。

---

## PROPOSE 阶段（M2 — 影子提案）

PROPOSE 阶段使用 `.moai/state/lsel/clusters.json` 中的 M1 候选聚类，并在 `.moai/state/lsel/proposals/<proposal-id>/` 中输出**影子提案**——每个值得采取行动的候选项对应一个提案。M2 提案仅为 SHADOW：没有 APPROVE，也没有 APPLY。APPROVE/APPLY 将在 M3 中通过全新的 `hns-lsel-applier` 路径实现（而不是通过已废弃的 `moai-harness-learner` Tier-4 流程——参见下文的“Tier-4 发现”）。

### 提案前检索（Reflexion）

在起草提案之前，从 `~/.claude/projects/<hash>/memory/` 检索相关的 `feedback_*.md` 主题文件。该检索使提案以过往经验（Reflexion 风格）为依据，并在提案的 `retrieval_evidence` 块中提供证据。没有检索证据的提案格式不正确，绝不能输出。

### 提案载荷模式（AC-LSEL-011）

每个提案位于 `.moai/state/lsel/proposals/<id>/`，且仅包含以下内容：

| 文件 | 用途 |
|------|---------|
| `proposal.md` | YAML frontmatter 载荷 + 正文 |
| `diff.patch` | 提议的编辑（统一 diff；在 M2 中不应用） |
| `self-critique.md` | 模型依据已冻结准则执行的自我批判 |

`proposal.md` YAML frontmatter 包含完整模式（8 个必需键）：

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

### 自我批判门禁

`self-critique.md` 由模型执行（并非机械式教条检查器——参见报告 §13 注意事项 3：
模型可能会进行合理化辩解；冻结的允许列表 + `/moai gate` 才是真正的安全底线）。该文件
会列出针对冻结教条的反对意见；每条反对意见都会标记为 RESOLVED 或 UNRESOLVED。任何
包含 UNRESOLVED 反对意见的提案，其 `status: blocked`，且绝对不得进入 APPROVE。
始终无法收敛的提案会保持阻塞状态；策展器会返回阻塞项报告，并由编排器将其呈现出来
（acceptance.md §E 边缘情况——它不会阻塞 M2 的发布；它证明了门禁确实会触发）。

### 第 4 层发现（AC-LSEL-012——切勿接入失效流程）

**发现（已于 2026-08-04 通过 `tier4_firing_test.sh` 验证）：`moai-harness-learner` 第 4 层
同步用户提问流程在生产调用层已失效。** CLI（`moai harness apply`）
只会输出一个桩字符串，从不调用学习器技能；`CuratorDispatch` 在生产环境中有 0 个
调用方（审计中的警示性先例）；冻结应用器的写入标志（`false`
，位于 `internal/harness/applier.go:22`）是应用流程的失效开关；并且没有任何机械触发器会使编排器呈现第 4 层
提案（与审计中完全相同的失效模式，报告 §11 mustFix B#1）。

根据 acceptance.md §E 边缘情况，M2 不会让 PROPOSE→APPROVE 交接依赖
第 4 层流程。APPROVE 通过 M3 的全新路径（`hns-lsel-applier` + 带有
同步批准标记的 `decision.json`）进行路由。M2 仅发出影子提案。此发现记录在
`tier4_firing_test.sh` 中，并在 M2 接线提交中引用。

## CSA 强制门禁类别（AC-LSEL-005 / REQ-LSEL-005）

对于爆炸半径涉及以下六类 CSA
强制门禁类别中任意一类的提案，APPROVE 阶段（M3，`hns-lsel-applier`）都会强制设置同步用户提问门禁
（由编排器运行），无论提案者的置信度如何：

1. **INVARANTS 内核**——`CLAUDE.local.md` 顶部的只读目标内核块。
2. **安全/验证例外**区段——输入验证豁免、防止数据丢失的错误处理、
   OWASP 措施。
3. **高扇入引用**——fan_in ≥ 3 个调用方的 `@MX:ANCHOR` 函数。
4. **Bash 风险路径**——破坏性原语集合 + `BASH_SUBCOMMAND_SOFT_CAP` 复合
   命令（coding-standards.md § Bash 风险放大器教条）。
5. **`permissions.allow`** 新增项——明确的安全例外区段；逐行同步
   批准（每个新增的 allow 条目都对应一个独立的强制门禁）。
6. **执行元文件**——REQ-LSEL-002/005 中指定的四类执行元文件：
   (i) 位于 `.claude/lsel/frozen-allowlist.json` 的冻结允许列表元文件，(ii) 应用器
   或策展器技能主体（`hns-lsel-applier/`、`hns-lsel-curator/`），(iii) 应用钩子
   脚本（`lsel-apply.sh` 及其包装器），(iv) `settings.local.json` 中的钩子注册
   子块。

**打扰成本豁免：**强制门禁**不受打扰成本约束**——打扰成本门禁
规则仅适用于常规层级提案。无论打扰成本状态如何，强制门禁提案始终会
触发同步用户提问门禁（由编排器运行）。

**机械强制执行（D3）：** 应用器（由 `hns-lsel-applier` 驱动 `lsel-apply.sh`，
M3）会拦截每个匹配四类执行元类别的提案，并且拒绝
写入，除非该提案的 `decision.json` 携带明确的同步批准标记
（由编排器的同步用户提问门控生成的批准工件）。
匹配但没有标记时，将中止应用，
向 `.moai/logs/lsel-reject.log` 追加一行拒绝记录并注明匹配的类别，同时
不写入任何内容。不匹配四类中任何一类的提案，则继续走常规的
干扰成本路径。正是这种机械式拦截，使自我修正约束
防御不必仅依赖正则表达式悖论，也具备了可辩护性。

`csa_refusal_test.sh`（位于此 SKILL.md 旁边）是该拒绝规则的固件测试。

---

## REFLECTION 阶段（M4 — REQ-LSEL-014 / AC-LSEL-016）

定期整合过程可防止未经提炼的内容持续累积——这是
设计报告 §10 P4 指出的主要失败模式：“没有整合 / 衰减 /
剪枝 → 检索到错误经验”。如果没有 REFLECTION，具体主题文件会不断
堆积，检索将呈现陈旧的具体事件，而不是这些事件共同
支持的原则。

### 由阈值触发，而非由墙上时钟触发

当具体 `feedback_*.md`
主题文件的**累积重要性**超过阈值（默认约为 150）时触发 REFLECTION，而不是
通过每月 cron 触发。这是设计
报告 §10 P4 引用的 Vectorize 四杠杆模型（重要性门控 / 合并 / 衰减 / 驱逐）：重要性在写入时赋予，而反思
阈值是一个累积信号，不是日历信号。低于
阈值的单主题群组会干净地不执行任何操作（acceptance.md §E 边界情况）。

### 机械核心——`reflect.sh`

`reflect.sh --memory-dir <m> [--threshold 150] [--min-topics 3]`：

1. 读取活跃的 `feedback_*.md` 主题文件（maxdepth 1——绝不读取
   `_archive/` 冷层）。
2. 对其 frontmatter 中的 `importance` 求和。如果 `count < min-topics` 或 `sum <
   threshold` → 干净地不执行任何操作（退出码 0）。
3. 合成一个 `feedback_*_principle_*.md`，其中包含：
   - 一个 `memory_type` 标签（CoALA 分类法——反馈原则使用 `semantic`；
     `procedural` 则会路由到 `hns-*` skill 主体）。
   - 从源描述中提取的共同主题（检索线索）。
   - 用于审计追踪的 `source_count` + `synthesized_at`。
4. 将原始文件**移动**到 `memory/_archive/`（冷层）——**绝不删除**
   （报告 §10 P4：“驱逐 ≠ 保管——保管用于性能，硬删除用于合规；MoAI 的
   ‘不要删除而要保管’规则被证明是正确的”——归档保留了审计追踪）。

### 衰减加权检索

原始文件被重新放置到 `_archive/`，因此活跃召回集合（即召回层优先
扫描的 `memory/` 目录）包含合成后的
原则，而不是陈旧的具体原始文件。针对相关线索的检索探针
返回的原则排名高于已归档的原始文件——这正是
衰减加权检索 AC-LSEL-016 条款所要求的。原则的
`description` 被设计为匹配共同线索；已归档的原始文件仍然
可被发现（冷层），但不再占据召回集合的顶部。

### 模型介导层（调用时由你负责）

`reflect.sh` 负责执行机械式综合（确定性）。当此技能运行实际的反思流程时，你还需要：
- **阅读综合出的原则**，并将其措辞提炼为真正的抽象陈述（机械核心负责聚合描述；你负责撰写真正的原则）。
- **确认 memory_type**——如果整合后的知识属于程序性知识（应归入 `hns-*` 技能主体的操作指南），则标记 `memory_type: procedural`，并将综合结果路由至该技能，而不是将其保留为 `feedback_*`。
- **不要删除归档**——`_archive/` 中的原始内容是审计记录。如果热层（活跃的 `feedback_*.md`）接近 50 个文件的上限，应优先归档更具体的主题，而不是将其删除（moai-memory.md § 内存卫生）。

### 验证（在宣布反思流程完成之前运行）

```bash
# M4 REFLECTION characterization test (AC-LSEL-016) — hermetic temp memory dir:
.claude/skills/hns-lsel-curator/reflect_test.sh

# cold-tier growth vs hot-tier (post-M4 audit, acceptance.md §H):
ls memory/_archive/ | wc -l   # archived originals
ls memory/feedback_*.md | wc -l   # active hot tier
```