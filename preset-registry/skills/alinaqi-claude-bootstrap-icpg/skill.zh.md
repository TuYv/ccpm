---
name: icpg
description: Intent-Augmented Code Property Graph — tracks WHY code exists via ReasonNodes with formal contracts, 6-dimension drift detection, and 3 canonical pre-task queries for autonomous development
when-to-use: "Before any code change — query the reason graph for intent, constraints, and risk"
user-invocable: false
effort: high
---
# iCPG 技能（意图增强型代码属性图）


**目的：** 在代码结构之上添加一个理由图层，使每个函数、类和模块都可以追溯到创建它的目标、负责它的智能体或人员，以及它是否仍在完成原本应该完成的工作。

```
┌────────────────────────────────────────────────────────────────┐
│  iCPG = AST + CFG + PDG + RG (Reason Graph)                    │
│  ─────────────────────────────────────────────────────────────│
│  AST  = Abstract Syntax Tree (structure)      ← existing       │
│  CFG  = Control Flow Graph (execution paths)  ← existing       │
│  PDG  = Program Dependency Graph              ← existing       │
│  RG   = Reason Graph (WHY layer)              ← THIS SKILL     │
│                                                                │
│  The RG stores ReasonNodes (goals/tasks), links them to code   │
│  symbols via typed edges, enforces contracts (DbC), and        │
│  detects when code drifts from its original purpose.           │
│                                                                │
│  Storage: .icpg/reason.db (SQLite, per-project, gitignored)   │
│  CLI: icpg init | create | record | query | drift | bootstrap │
└────────────────────────────────────────────────────────────────┘
```

---

## 核心原则

**意图优先，代码其次。** 在编写或修改代码之前，查询理由图，以了解现有代码为何编写、必须保留哪些约束，以及你的更改是否与之前的工作重复。

---

## 3 个规范的任务前查询

**每个智能体在编写代码之前都必须运行以下查询：**

| # | 查询 | 命令 | 它能回答什么 |
|---|-------|---------|-----------------|
| 1 | **search_prior_work** | `icpg query prior "<goal>"` | 以前是否尝试过此任务？防止重复工作。 |
| 2 | **get_constraints** | `icpg query constraints <file>` | 我将改动的文件适用哪些不变量？防止破坏现有约束。 |
| 3 | **get_risk_profile** | `icpg query risk <symbol>` | 这个符号是否脆弱？查看漂移历史和所有权变更。 |

---

## ReasonNode——核心原语

每个 ReasonNode 都通过一份形式化契约来记录一个明确陈述的目的：

```
id              UUID
goal            Natural language: what is this trying to achieve
decision_type   business_goal | arch_decision | task | workaround | constraint | patch
scope           Files/modules expected to be touched
owner           Human or agent accountable
status          proposed | executing | fulfilled | drifted | abandoned
source          manual | commit | inferred | agent-session

FORMAL CONTRACT (Design by Contract):
  preconditions    What must be true before this intent executes
  postconditions   What must be true when fulfilled
  invariants       What must remain true throughout and after
```

**漂移 = 谓词失败。** 当一个符号的当前行为不再满足创建它的 ReasonNode 的后置条件，或者违反了某个不变量时，该符号就发生了漂移。

---

## 六种边类型

```
CREATES      Reason  → Symbol   (this intent created this function)
MODIFIES     Reason  → Symbol   (this intent changed this function)
REQUIRES     Reason  → Reason   (B depends on A being done first)
DUPLICATES   Reason  → Reason   (these two goals overlap)
VALIDATED_BY Reason  → Test     (this test proves the intent was satisfied)
DRIFTS_FROM  Symbol  → Reason   (this symbol no longer does what it was made for)
```

---

## 六维漂移模型

| 维度 | 含义 | 检测方式 |
|-----------|--------------|-----------|
| **规格漂移** | Symbol 校验和发生变化，但没有 MODIFIES 边 | 比较存储的校验和与当前校验和 |
| **决策漂移** | 后置条件不再成立 | 根据代码库求值谓词 |
| **所有权漂移** | 存在 >3 个不同的 owner，且缺乏一致的监督 | 统计边上唯一 owner 的数量 |
| **测试漂移** | VALIDATED_BY 测试缺失或失败 | 检查测试文件是否存在并运行测试 |
| **使用漂移** | Symbol 在原始 scope 之外被使用 | 使用 Grep 搜索 scope 之外的导入 |
| **依赖漂移** | 下游 REQUIRES reason 已发生漂移 | 遍历 REQUIRES 边 |

运行 `icpg drift check` 扫描所有维度。每个维度都会生成一个 0-1 的严重程度评分。

---

## CLI 参考

### 设置
```bash
icpg init                          # Create .icpg/ and database
icpg bootstrap --days 90           # Infer ReasonNodes from git history
icpg bootstrap --days 90 --no-llm  # Without LLM (commit-message only)
```

### 创建与记录
```bash
icpg create "Add JWT auth" --scope src/auth/ --owner feature-auth --type task
icpg record --reason <id> --base main         # Record symbols from git diff
icpg record --reason <id> --edge-type MODIFIES # Record as modifications
```

### 查询（3 个规范查询）
```bash
icpg query prior "user authentication"     # 1. Duplicate detection
icpg query constraints src/auth/service.ts  # 2. Invariants for file
icpg query risk validateToken              # 3. Symbol risk profile
icpg query context src/auth/service.ts     # All intents for a file
icpg query blast <reason-id>               # Full blast radius
```

### 漂移
```bash
icpg drift check          # Full scan across all dimensions
icpg drift resolve <id>   # Mark drift event resolved
```

### 状态
```bash
icpg status               # Stats: reasons, symbols, edges, drift
```

---

## 存储

每个项目独立、由 git 忽略、无需基础设施：

```
.icpg/
  reason.db       SQLite database (4 tables: reasons, symbols, edges, drift_events)
  .gitignore      Contains: *
  chroma/         ChromaDB vectors (if chromadb installed)
  tfidf_cache.json  TF-IDF fallback cache
  .current-intent   Marker file for active intent (used by Stop hook)
```

安装选项：
```bash
pip install ./scripts/icpg            # Core (zero deps)
pip install "./scripts/icpg[vectors]"  # + ChromaDB for duplicate detection
pip install "./scripts/icpg[all]"      # + ChromaDB + scikit-learn + openai
```

---

## 工作流：任何代码变更之前

```
0. INTENT       → icpg create (or identify existing intent)
1. DEDUP        → icpg query prior (check for duplicate work)
2. CONSTRAINTS  → icpg query constraints (understand invariants)
3. RISK         → icpg query risk (check fragile symbols)
4. LOCATE       → search_graph to find symbols (code-graph skill)
5. CHANGE       → Make the edit (PreToolUse hook shows context)
6. RECORD       → icpg record (link symbols to intent)
7. DRIFT CHECK  → icpg drift check (verify no unintended drift)
8. VERIFY       → Run tests, lint, typecheck
```

**对于自主智能体，步骤 0 不可省略。** 每项变更都必须
关联到一个明确说明的目的。如果没有意图，就没有可用于
衡量漂移的基准。

---

## Hook 集成

### PreToolUse Hook（自动注入上下文）

添加到 `.claude/settings.json`：
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "scripts/icpg-pre-edit.sh",
        "timeout": 3,
        "statusMessage": "Checking intent context..."
      }]
    }]
  }
}
```

每次编辑文件之前，智能体都会看到：
```
═══ iCPG CONTEXT ═══
INTENTS for src/auth/service.ts:
  [>] a1b2c3d4 — User authentication with JWT tokens
      Owner: feature-auth | Status: executing
      Invariants: 2
CONSTRAINTS for src/auth/service.ts:
  From intent: User authentication with JWT tokens
    INV: file_exists("src/auth/middleware.ts")
    POST: test_exists("src/auth/__tests__/service.test.ts")
PRESERVE function signatures unless your task requires changing them.
═══════════════════
```

### Stop Hook（自动记录符号）

实现通过测试后，自动记录符号：
```json
{
  "hooks": {
    "Stop": [{
      "hooks": [
        {"type": "command", "command": "scripts/tdd-loop-check.sh", "timeout": 60},
        {"type": "command", "command": "scripts/icpg-stop-record.sh", "timeout": 5}
      ]
    }]
  }
}
```

---

## 智能体团队集成

### 更新后的流水线（agent-teams + iCPG）

```
 0. INTENT       Team lead creates ReasonNode from feature spec
 0b. DEDUP       icpg query prior — check for duplicate intents
 1. SPEC         Feature agent writes spec
 2. SPEC-REVIEW  Quality agent reviews spec + intent alignment
 3. TESTS (RED)  Feature agent writes tests
 4. RED-VERIFY   Quality agent verifies tests fail
 5. IMPLEMENT    Feature agent codes (PreEdit hook shows context)
 5b. RECORD      Auto-record symbols → intent (Stop hook)
 5c. DRIFT-CHECK Quality agent verifies no scope drift
 6. GREEN-VERIFY Quality agent verifies tests pass + coverage
 7. VALIDATE     Lint + typecheck + full suite
 8. CODE-REVIEW  Review agent (sees intent context per file)
 9. SECURITY     Security agent
10. BRANCH-PR    Merger agent (PR includes intent traceability)
```

### 智能体职责

| 智能体 | iCPG 操作 |
|-------|-------------|
| **团队负责人** | 创建任务链时执行 `icpg create`。执行 `icpg query prior` 以检查重复项。 |
| **功能智能体** | 实现前执行 `icpg query constraints`。写入 `.icpg/.current-intent` 以进行自动记录。 |
| **质量智能体** | 在 GREEN 验证期间执行 `icpg drift check`。验证范围是否一致。 |
| **审查智能体** | 审查文件时通过 PreToolUse hook 查看意图上下文。 |
| **合并智能体** | 在 PR 描述中包含意图可追溯性。 |

---

## 从 Git 历史记录引导初始化

对于现有代码库，从提交历史中推断 ReasonNode：

```bash
icpg bootstrap --days 90 --verbose
```

这将：
1. 获取过去 90 天内的提交
2. 按时间接近程度进行聚类（2 小时时间窗口）
3. 通过 LLM（Claude 或 OpenAI）或解析提交消息来推断意图
4. 创建带有 `source: "inferred"`、`confidence: 0.6-0.8` 的 ReasonNode
5. 从变更的文件中提取符号，并创建 CREATES 边
6. 针对现有 ReasonNode 运行重复检测

**质量说明：** 推断出的意图会被标记为低置信度。请审查这些意图，并
手动提升其中高价值意图的置信度。

---

## 契约谓词

谓词是针对代码库状态的结构化断言：

```
file_exists("src/auth/middleware.ts")
test_exists("src/auth/__tests__/service.test.ts")
symbol_count("src/auth/") <= 15
function_signature("validateToken") == "(token: string) => Promise<User>"
```

契约可以是：
- 针对高风险 ReasonNode **手动编写**
- 通过 `icpg create --infer-contracts` **由 LLM 推断**
- **基于启发式规则生成**（范围 → file_exists，测试 → test_exists）

---

## 反模式

| 反模式 | 应改为 |
|-------------|-----------------|
| 未声明意图就编写代码 | 在每次非简单变更之前运行 `icpg create` |
| 假设你的变更是孤立的 | 先运行 `icpg query constraints` + `icpg query risk` |
| 重复构建已有功能 | 使用 `icpg query prior` 检查是否已有相关工作 |
| 让意图永远停留在 'executing' 状态 | 完成后将状态更新为 'fulfilled' |
| 忽略漂移事件 | 每周运行 `icpg drift check`，解决漂移或创建新意图 |
| 在符号中存储完整源代码 | 仅存储签名 + 校验和——从文件中读取源代码 |
| 在现有仓库中跳过引导初始化 | 使用 `icpg bootstrap --days 90` 构建初始图 |