---
name: hns-lsel-applier
description: >
  Local Self-Evolution Loop (LSEL) APPLY engine — the playback-only consumer of
  approved decision.json records that drives `.moai/hooks/lsel-apply.sh` for the
  GOOS-local PROPOSE→APPLY seam closure (SPEC-LSEL-LOCAL-EVOLUTION-001 M3). Reads
  an approved decision.json, validates the target against the frozen allowlist
  (.claude/lsel/frozen-allowlist.json), mechanically refuses execution-meta
  targets lacking a synchronous-approval marker, applies the referenced
  diff.patch, appends an apply-ledger.jsonl row, and commits one
  lsel-<proposal-id>-tagged Conventional Commit on the feature branch. M3 scope:
  APPLY bypass closure only (the frozen Go applier stays frozen — its write-flag
  at internal/harness/applier.go:22 stays false; REQ-LSEL-003).
allowed-tools: Read, Grep, Glob, Bash
user-invocable: false
metadata:
  version: "0.1.0"
  category: "harness"
  status: "active"
  updated: "2026-08-04"
  tags: "lsel,self-evolution,apply,harness,dogfood"
---
# hns-lsel-applier — LSEL APPLY 引擎

> **命名空间：** `hns-lsel-*` 是用户自有的内部试用内容（CLAUDE.local.md §24）。此技能
> 不会镜像到 `internal/template/templates/` 中——它仅存在于此仓库。
> 升级为 `moai-lsel-*` 并分发至 16 种语言属于另一项独立的 SPEC
>（根据 spec.md §G，不在范围内）。

> **Token 约束。** 本文刻意避免使用已冻结 Go applier 写入标志的字面标识符，
> 以及仅供 orchestrator 使用的用户提问通道的字面名称。两者均通过位置和作用来指代
>（例如“位于 `internal/harness/applier.go:22` 的写入标志”“orchestrator 的同步用户门控”），
> 从而使 REQ-LSEL-003 不变量 grep 和针对 LSEL 表面的 E4 subagent 边界 grep
> 得到零个字面匹配。不变量本身则使用自然语言表述。

## 此技能的作用

LSEL 循环的 PROPOSE→APPLY 衔接点在生产环境中处于失效状态：`Applier.Apply` 从未运行
（缺少 `manifest.jsonl`），`CuratorDispatch` 在生产环境中的调用方数量为 0，而位于
`internal/harness/applier.go:22` 的已冻结 Go applier 写入标志（保持为 `false`）就是
apply 的失效开关（REQ-LSEL-003——M3 通过 BYPASS 使其继续保持 `false`，永不解冻）。
M3 闭环通过一个并行的**用户自有** applier 来执行 APPLY，该 applier 仅写入六个可演化表面
（spec.md §B.3），而已冻结的 Go applier 继续保持逐字节冻结。设计 SSOT：
`.moai/reports/moai-local-self-evolution-design-20260804.html` §4（“建立一个绕过已冻结
Go applier 的并行用户自有 applier”）+ §7（两轮评审将 allowlist 从可演化的技能文件中
移出并放入一个已冻结的元文件，同时将执行元文件加入强制门控集合）。

APPLY 引擎由**回放钩子** `.moai/hooks/lsel-apply.sh` 与此技能的模型中介判断共同组成
（包括目标验证的细微差别、审批标记的来源，以及机械钩子无法识别的影响范围推理）。
该钩子是承载安全性的基础；此技能则是面向使用者的表面，用于决定接下来应将哪个已批准的
决策提供给它，以及如何解释拒绝结果。

## APPLY 流水线

`lsel-apply.sh <decision.json>` 执行五个步骤。步骤 1-2 是安全基础；
步骤 3-5 是回放过程。

1. **已冻结 allowlist 硬拒绝**（REQ-LSEL-001 / AC-LSEL-001）。将
   `decision.json` 中的目标路径与 `.claude/lsel/frozen-allowlist.json` 内
   `frozen_patterns` 正则表达式列表进行匹配。若匹配 → REFUSE：向
   `.moai/logs/lsel-reject.log` 追加一行，记录被拒绝的路径和类别 `frozen-path`，
   不写入任何文件，并且钩子以状态码 2 退出。
2. **执行元信息强制门控**（REQ-LSEL-002 / AC-LSEL-005 D3 自我修订约束）。
   如果目标匹配四种 `execution_meta` 类别之一——
   (i) 已冻结 allowlist 元文件本身，(ii) applier/curator 技能正文
   (`hns-lsel-applier/`, `hns-lsel-curator/`)，(iii) apply 钩子
   (`.moai/hooks/lsel-*.sh`)，(iv) `settings.local.json` 的钩子注册
   子块——钩子会检查 `decision.json` 中是否存在同步审批标记（一个
   `synchronous_approval` 对象，其中包含 `decision: "approved"`，由
   orchestrator 的同步用户门控生成）。没有标记 → REFUSE：向拒绝日志写入一行，
   类别为 `execution-meta`，以状态码 3 退出，且不执行写入。有标记 → 继续执行
   （拒绝取决于缺少标记，而非仅仅匹配了该类别）。拒绝语义与 M2
   `csa_refusal_test.sh` 固件完全一致。
3. **通过 `git apply` 应用 diff.patch**（回放一个已获批准的决策）。
   仅暂存补丁中声明的路径——绝不执行 `git add -A`（保持工作树整洁）。
4. **向 apply ledger 追加一行**，写入 `.moai/state/lsel/apply-ledger.jsonl`：
   `{proposal_id, target_surface, ts, result:"applied", commit_sha, category}`。这就是
   已冻结 Go applier 从未生成的 manifest，如今终于在用户自有空间中成为现实。
5. **提交**暂存的变更，在当前（功能）分支上创建一个
   `feat(lsel-<proposal-id>): ...` 约定式提交（REQ-LSEL-004）。ledger 行中的
   `commit_sha` 会使用该提交的短 SHA 进行回填。

无参数调用是一个干净的空操作（退出码为 0），因此已批准队列为空时不会
中断循环轮次。

## 模型介导层（即被调用时的你）

当调用此技能来驱动 APPLY 轮次时，除了机械钩子之外，你的职责还包括：

- **读取提案的 `proposal.md` 和 `self-critique.md`**，它们位于
  `.moai/state/lsel/proposals/<id>/`。带有 `status: blocked` 的提案（存在任何
  UNRESOLVED 自我批判异议）绝不能传给钩子——应改为返回阻塞报告。
- **确认批准标记的来源。** `synchronous_approval` 对象必须携带由编排器实际生成的
  批准工件（即编排器依据 CLAUDE.md §8 所拥有的同步用户提问通道）。循环为自身伪造的
  标记属于“可自行修改的手铐”失效模式（REQ-LSEL-002）；钩子的机械检查只是底线，
  你的来源判断才是上限。此技能是一种子代理机制，绝不会调用仅限编排器使用的用户提问
  通道；应返回阻塞报告，并让编排器执行门控。
- **重新验证冻结允许列表不变量**，方法是在
  `internal/harness/applier.go:22` grep 写入标志——它必须保持为 `false`。如果 M3
  的绕过机制有任何向解冻 Go 应用器偏移的迹象，应返回阻塞报告（AP-LSEL-002）。

## 此技能不执行的操作

- **不解冻 Go 应用器**——位于
  `internal/harness/applier.go:22` 的写入标志保持为 `false`（REQ-LSEL-003）。
  绕过机制与之并行且归用户所有；冻结的应用器仅供参考。
- **不编辑冻结的规范**——`internal/template/templates/**`、
  `.claude/rules/moai/**`、`CLAUDE.md`、保留的代理、`moai-*` 技能、冻结的
  Go 应用器 / `curator_dispatch.go`，以及 `.moai/config/sections/**` 均保持
  逐字节不变。允许列表会硬性拒绝它们（步骤 1）。
- **不在 `lsel-apply.sh` 中新增 apply / 自行批准 / 修改允许列表原语**
  （REQ-LSEL-008）。钩子只消费已获批准的决策；它既不编写提案，也不批准提案。
  M4 的 `verify.sh` 仅在 apply 已提交之后运行——它不会创建新的 apply；也绝不会
  自行批准。
- **不调用用户提问通道**——这是子代理边界（CLAUDE.md §8）。应返回阻塞报告；
  由编排器执行同步门控。

---

## VERIFY 阶段（M4 — REQ-LSEL-013 / AC-LSEL-015）

apply 提交提案后，VERIFY 会证明该 apply 是安全的。VERIFY 有
**两层**——两者都是强制性的：

### (a) 机械层——`verify.sh`（可通过 bash 测试）

`verify.sh --proposal-dir <p> --repo-root <r> [--timeout SECS] [--feedback-file <f>]`
使用**超时后重试一次**策略运行提案 frontmatter 中的 `verify_command`，并在第二次失败时
自动还原：

- **两次尝试策略。** 执行第 1 次尝试。若 SUCCESS → `verified:true`，停止。若为
  TIMEOUT 类失败 → 执行第 2 次尝试（容忍偶发故障——报告 §10 P3：“超时后重试一次，
  以免正确的提案因噪声而被判定失败”）。若为
  NON-TIMEOUT-FAIL → 执行第 2 次尝试（使 AC-LSEL-015 条款 3 中的“第二次非超时失败”
  能够实际发生，随后再触发还原）。
- 第 2 次尝试：SUCCESS → `verified:true`。任何失败（超时或非超时）→
  `verified:false` + **自动执行 `git revert lsel-<proposal-id>`** + 将提案的
  `feedback_*.md` 标记为 `verified: false`。
- 结果会作为
  `{"stage":"verify","verified":true|false,...}` 行追加到 apply 账本中——这是承载关键逻辑的信号。

### (b) 强制执行的 `/moai gate` 超集（由模型介导）

**每次 apply 后都必须执行 `/moai gate`（lint+format+type+test）——这不是可选项。** Bash hook 无法直接调用 Claude Code 斜杠命令，因此该门禁在模型侧运行：当此技能驱动一次 APPLY 流程时，编排器/模型会在机械式 apply + verify 之后运行 `/moai gate`。仅使用提议者编写的 `verify_command` 存在**循环验证**问题（报告 §11 mustFix B#6 / AP-LSEL-004）：提议者可以编写一个恰好能由其自身变更满足的 verify_command。`/moai gate` 是独立检查——lint、格式、类型检查以及测试套件会覆盖提案从未触及的表面。如果机械式 verify_command 显示 PASS，但 `/moai gate` 未通过，则应将该次 apply 视为未经验证。

### 模型介导层（即被调用时的你）

- 在 `lsel-apply.sh` 提交且 `verify.sh` 报告结果后，**运行 `/moai gate`**（强制超集）。如果门禁失败，那么即使 `verify.sh` 报告 `verified:true`，该次 apply 仍未经验证——将其视为 VERIFY 失败并回滚。
- 回滚（无论是由 `verify.sh` 自动触发，还是由门禁驱动）都必须以阻塞报告的形式呈现给编排器——由编排器而非此技能向用户确认回滚。切勿从此子代理机制内部运行 `/moai gate` 面向用户的界面；应返回阻塞报告。

### 验证（在宣布 APPLY+VERIFY 流程完成前运行）

```bash
# M4 VERIFY characterization test (AC-LSEL-015) — hermetic temp repo:
.claude/skills/hns-lsel-applier/verify_test.sh

# the verify ledger row carries the outcome:
grep '"stage":"verify"' .moai/state/lsel/apply-ledger.jsonl
```

## 验证（在宣布 APPLY 流程完成前运行）

```bash
# 1. APPLY characterization test (AC-001/002/005/008/013) — hermetic temp repo:
.claude/skills/hns-lsel-applier/apply_test.sh

# 2. Rollback-rehearsal SHIP GATE (AC-014):
.claude/skills/hns-lsel-applier/rollback_rehearsal_test.sh

# 3. REQ-LSEL-003 frozen-flag re-verify (post-apply). The frozen Go applier's
#    write-flag at internal/harness/applier.go:22 MUST read `false`, and no LSEL
#    surface (skills/hooks/state/allowlist) references that identifier as mutable.
#    (The literal identifier is intentionally not written here; find it at line 22
#    of the frozen file and grep LSEL surfaces for it — expect zero hits.)
sed -n '22p' internal/harness/applier.go   # MUST show the `= false` write-flag line

# 4. The apply ledger carries the new row:
tail -1 .moai/state/lsel/apply-ledger.jsonl
```

## 交叉引用

- **SPEC：** `.moai/specs/SPEC-LSEL-LOCAL-EVOLUTION-001/{spec,plan,acceptance,progress}.md`
- **设计报告（SSOT）：** `.moai/reports/moai-local-self-evolution-design-20260804.html`
  §4（用户自有的并行 applier）、§7（allowlist 迁移 + execution-meta 强制门禁）、§10 P3、§11 mustFix A#1/A#5/A#8。
- **冻结的 applier（仅供参考）：** `internal/harness/applier.go:22`（冻结的 write-flag）、`internal/harness/curator_dispatch.go`。
- **Curator（PROPOSE 阶段，M2）：** `.claude/skills/hns-lsel-curator/SKILL.md`
  （CSA 强制门禁原则 + Tier-4 DEAD 发现）。
- **CSA 拒绝 fixture：** `.claude/skills/hns-lsel-curator/csa_refusal_test.sh`
  （此 hook 以机械方式强制执行的拒绝规则）。
- **命名空间防护：** `internal/template/split_namespace_test.go`、
  `internal/template/internal_content_leak_test.go`（绝不能将 `hns-lsel-applier`
  泄漏标记为问题——此技能用于 dogfood，绝不会被模板化）。