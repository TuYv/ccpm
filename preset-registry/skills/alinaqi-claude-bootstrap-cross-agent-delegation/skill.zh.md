---
name: cross-agent-delegation
description: Cross-agent task routing — Codex auto-review, Kimi delegation by complexity score (iCPG + Claude reasoning), iCPG + Mnemos mandatory for all agents
when-to-use: Always loaded when multiple AI CLI tools are available (Claude, Kimi, Codex)
user-invocable: false
effort: medium
---
# 跨智能体委派

Claude Code 负责任务到 Kimi 和 Codex 的路由编排。用户只与 Claude 交互——委派在幕后进行。

---

## 工具检测

会话开始时，检测可用工具：

```bash
command -v kimi &>/dev/null && HAS_KIMI=true || HAS_KIMI=false
command -v codex &>/dev/null && HAS_CODEX=true || HAS_CODEX=false
```

---

## Codex 自动审查（Stop 钩子——自动执行）

安装 Codex 后，Stop 钩子会在测试通过后审查代码：

1. TDD 循环检查运行测试
2. `codex-auto-review.sh` 让 Codex 审查差异
3. 严重/高危发现会反馈给 Claude（退出码 2）
4. 无问题的审查会直接通过（退出码 0）

**完全自动执行。** 无需用户或 Claude 采取任何操作。

---

## Kimi 委派（由 Claude 编排）

安装 Kimi 且任务复杂度处于有限范围内时，Claude 会直接进行委派——用户无需运行任何命令。

### 第 1 步：评估复杂度，而非文件数量

文件数量并不能很好地代表委派风险。对授权路径进行单文件修改，可能比重命名 12 个文件更困难。根据来自 iCPG 的信号和 Claude 的语义推理，从五个维度对任务进行评分，每个维度为 0-2 分：

| 维度 | 0（低） | 1（中） | 2（高） | 来源 |
|---|---|---|---|---|
| **圈复杂度 / 表层深度** | <10 LOC，无分支 | 10-50 LOC，≤3 个分支 | 50+ LOC 或嵌套控制流 | 对函数体执行 iCPG `query_graph` |
| **扇出（对使用方的影响范围）** | 0-2 个调用方 | 3-10 个调用方 | 11+ 个调用方 | iCPG `trace_path(<symbol>, mode=callers)` |
| **跨越安全边界**（SEC-006、认证、PII、RLS、组织范围、计费、支付） | 无 | 间接相关 | 直接读取或写入 | iCPG SEC-* / R-063 标签 + grep 搜索 `org_id`、`user_id`、`auth`、`pii` |
| **并发 / 事务性** | 纯函数 / 同步 | 仅异步 | 锁、事务、原子认领、`FOR UPDATE`、`asyncio.Lock`、`session.begin` | iCPG 并发标志 + grep |
| **所需领域不变量** | 无 / 内联文档完善 | 存在一些隐含要求（需要阅读 1-2 个文件） | 较多（跨文档、受 ADR 约束、受 RFC 约束） | Claude 推理 + iCPG ADR 关联 |

```bash
# Auto-collect signals
icpg query blast <scope> --format json    # fan-out, async flags, sec tags
grep -rE "org_id|user_id|auth|pii"  <file>  # cheap sec heuristic if iCPG flags absent
grep -rE "asyncio.Lock|FOR UPDATE|session.begin" <file>  # concurrency heuristic
```

### 第 2 步：总分 → 路由

| 总分 | 路由 | 理由 |
|---|---|---|
| **0-3** | Kimi 单独处理 | 影响范围有限，无安全、并发或跨文档方面的顾虑 |
| **4-6** | Kimi → Codex 自动审查（无需提示用户） | 存在实际风险，但没有高到需要 Claude 获取完整上下文——Codex 会发现 Kimi 可能遗漏的问题 |
| **7-10** | Claude 直接处理 | 涉及跨领域 / 安全关键 / 高并发——需要完整上下文 |

### 第 3 步：下限——简单情形的快捷方式

对于真正简单的工作，可以跳过 iCPG 查询的成本：

```bash
# If <2 files changed AND no SEC/auth/PII/concurrency keyword in diff,
# → auto-Kimi without scoring.
FILES=$(git diff --name-only | wc -l)
HAS_RISK_KEYWORDS=$(git diff | grep -ciE "org_id|auth|pii|asyncio|FOR UPDATE|transaction|session\.begin" || true)
if [ "$FILES" -lt 2 ] && [ "$HAS_RISK_KEYWORDS" -eq 0 ]; then
  AUTO_KIMI=true
fi
```

这可以处理简单重命名／拼写错误修复的情况，而无需付出 iCPG 往返调用的成本。

### 不应委派的情况（优先于评分规则）

- 用户明确要求由 Claude 完成
- 跨服务变更（API + 前端 + 数据库）——无论评分如何，都需要完整上下文
- 发布分支上的生产环境紧急修复——跨工具审查的延迟过高
- 任一维度得分达到 7+（只要有一个关键维度达到此分数，就足以让 Claude 继续参与）

### 第 4 步：通过 Bash 委派

Claude 写入 mnemos 检查点，然后以无头模式运行 Kimi：

```bash
# 1. Save current context to disk
mnemos checkpoint --force

# 2. Get context summary for Kimi
CONTEXT=$(mnemos resume 2>/dev/null)

# 3. Get constraints for target files
CONSTRAINTS=$(icpg query constraints <target-file> 2>/dev/null)

# 4. Run Kimi headless with full context
kimi --print -y -w . -p "
## Context (from mnemos checkpoint)
$CONTEXT

## Constraints (from iCPG)
$CONSTRAINTS

## Task
<specific task description>

## Rules
- Run tests after changes
- Record changes: icpg record --base main
- Write checkpoint when done: mnemos checkpoint --force
"
```

### 第 4 步：读取结果

Kimi 完成后，Claude 执行：

```bash
# Read what Kimi did
mnemos resume          # Kimi's checkpoint
icpg status            # Kimi's recorded symbols
git diff               # Kimi's file changes
```

### 不应委派的情况

- 安全敏感代码（身份验证、加密、支付）
- 跨服务变更（API + 前端 + 数据库）
- 涉及共享接口的重构
- 用户明确要求由 Claude 完成

---

## iCPG——所有智能体的强制要求

在进行任何代码变更之前，Claude 都要运行以下命令（委派时也要包含结果）：

### 任务前查询

```bash
# 1. Duplicate check — already done?
icpg query prior "<goal>"

# 2. Constraints — what invariants apply?
icpg query constraints <file-path>

# 3. Risk — is this symbol fragile?
icpg query risk <symbol-name>
```

### 代码变更后

```bash
icpg record --reason <id> --base main
icpg drift check
```

---

## Mnemos——所有智能体的强制要求

### 任务开始时

```bash
mnemos add goal "<task description>"
```

### 子目标边界处

```bash
mnemos checkpoint
```

### 任务结束时（由 Stop 钩子自动处理）

```bash
mnemos checkpoint --force
```

### 工具之间的上下文传递

检查点是桥梁。Claude 写入，Kimi 读取：

```bash
# Claude saves state
mnemos checkpoint --force

# Kimi (or Codex) reads state
mnemos resume
```

检查点包含：目标、约束、最近使用的文件、Git 状态、疲劳程度。

---

## 完整编排流程

```
TASK ARRIVES (user tells Claude)
    |
    v
[1] Claude: icpg query prior "<goal>"     ← Already done?
[2] Claude: trivial-case shortcut         ← <2 files & no risk keywords?
    |
    +-- YES + Kimi installed -----> AUTO-KIMI (no scoring)
    |
    +-- NO ↓
    v
[3] Claude: score complexity (5 dims × 0-2, iCPG + reasoning)
    |
    +-- score 0-3   ----> KIMI SOLO PATH
    |   [a] mnemos checkpoint --force
    |   [b] kimi --print -y -p "..."
    |   [c] mnemos resume + git diff
    |   [d] Continue in Claude
    |
    +-- score 4-6   ----> KIMI + CODEX REVIEW PATH
    |   [a] mnemos checkpoint --force
    |   [b] kimi --print -y -p "..."
    |   [c] codex review --uncommitted    ← Auto-review the diff
    |   [d] If P0/P1 findings: re-prompt Kimi with findings
    |   [e] Once clean: continue in Claude
    |
    +-- score 7-10  ----> CLAUDE DIRECT PATH (full context)
    |
    v
[4] icpg query constraints <files>         ← Invariants
[5] icpg query risk <symbols>              ← Fragility
[6] mnemos add goal "<task>"               ← Track in memory
    |
    v
[7] IMPLEMENT (TDD: RED -> GREEN)
    |
    v
[8]  Stop: tdd-loop-check.sh               ← Tests pass?
[9]  Stop: codex-auto-review.sh            ← Codex reviews diff
[10] Stop: icpg-stop-record.sh             ← Record symbols
[11] Stop: mnemos-checkpoint.sh            ← Save memory
```