---
name: icpg
description: Intent-Augmented Code Property Graph — tracks WHY code exists via ReasonNodes with formal contracts, 6-dimension drift detection, and 3 canonical pre-task queries for autonomous development
when-to-use: "Before any code change — query the reason graph for intent, constraints, and risk"
user-invocable: false
effort: high
---
# iCPG Skill（意图增强型代码属性图）


**目的：** 在代码结构之上增加一层 Reason Graph，使每个
函数、类和模块都能追溯到创建它的目标、负责它的代理或人员，以及它是否仍在执行原本预期的功能。

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

**意图优先，代码其次。** 在编写或修改代码之前，查询
reason graph，以了解现有代码为何编写、必须保留哪些约束，以及你的更改是否会重复已有工作。

---

## 3 个规范的任务前查询

**每个代理在编写代码之前都必须运行以下查询：**

| # | 查询 | 命令 | 回答的问题 |
|---|-------|---------|-----------------|
| 1 | **search_prior_work** | `icpg query prior "<goal>"` | 之前是否尝试过？防止重复。 |
| 2 | **get_constraints** | `icpg query constraints <file>` | 我将修改的文件适用哪些不变量？防止破坏。 |
| 3 | **get_risk_profile** | `icpg query risk <symbol>` | 此符号是否脆弱？查看漂移历史和所有权变更。 |

---

## ReasonNode — 核心原语

每个 ReasonNode 都会通过形式化契约记录一个明确陈述的目的：

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

**漂移 = 谓词失败。** 当某个符号的当前行为不再满足创建它的 ReasonNode 的后置条件，或某个不变量遭到违反时，该符号就发生了漂移。

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
| **规格漂移** | Symbol checksum changed without a MODIFIES edge | Compare stored vs current checksum |
| **决策漂移** | Postconditions no longer hold | Evaluate predicates against codebase |
| **所有权漂移** | >3 different owners without coherent oversight | Count unique owners on edges |
| **测试漂移** | VALIDATED_BY tests missing or failing | Check test file existence + run |
| **使用漂移** | Symbol used outside original scope | Grep for imports beyond scope |
| **依赖漂移** | Downstream REQUIRES reasons have drifted | Traverse REQUIRES edges |

运行 `icpg drift check` 扫描所有维度。每个维度都会产生一个 0-1 的严重性分数。

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

每个项目独立、被 gitignore 忽略、无需基础设施：

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
0. 意图       → icpg create（或识别现有意图）
1. 去重       → icpg query prior（检查是否存在重复工作）
2. 约束       → icpg query constraints（理解不变量）
3. 风险       → icpg query risk（检查脆弱符号）
4. 定位       → search_graph 查找符号（code-graph skill）
5. 修改       → 执行编辑（PreToolUse hook 显示上下文）
6. 记录       → icpg record（将符号关联到意图）
7. 漂移检查   → icpg drift check（验证没有非预期漂移）
8. 验证       → 运行测试、lint、类型检查
```

**对于自主代理而言，第 0 步不可协商。** 每项变更都必须关联到明确的目的。没有意图，就没有可用于衡量漂移的基准。

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

在每次文件编辑之前，代理会看到：
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

## Agent Teams 集成

### 更新后的流水线（agent-teams + iCPG）

```
 0. 意图       团队负责人根据功能规格创建 ReasonNode
 0b. 去重       icpg query prior — 检查是否存在重复意图
 1. 规格       功能代理编写规格
 2. 规格审查   质量代理审查规格与意图的一致性
 3. 测试（RED） 功能代理编写测试
 4. RED 验证   质量代理验证测试失败
 5. 实现       功能代理编写代码（PreEdit hook 显示上下文）
 5b. 记录      自动将符号记录到意图 →（Stop hook）
 5c. 漂移检查  质量代理验证没有范围漂移
 6. GREEN 验证 质量代理验证测试通过及覆盖率
 7. 验证       Lint + 类型检查 + 完整测试套件
 8. 代码审查   审查代理（按文件查看意图上下文）
 9. 安全       安全代理
10. 分支-PR    合并代理（PR 包含意图可追溯性）
```

### 代理职责

| 代理 | iCPG 操作 |
|-------|-------------|
| **团队负责人** | 创建任务链时使用 `icpg create`。使用 `icpg query prior` 检查重复项。 |
| **功能代理** | 实现前使用 `icpg query constraints`。写入 `.icpg/.current-intent` 以便自动记录。 |
| **质量代理** | 在 GREEN 验证期间使用 `icpg drift check`。验证范围一致性。 |
| **审查代理** | 审查文件时通过 PreToolUse hook 查看意图上下文。 |
| **合并代理** | 在 PR 描述中包含意图可追溯性。 |

---

## 从 Git 历史进行引导

对于现有代码库，可以从提交历史中推断 ReasonNode：

```bash
icpg bootstrap --days 90 --verbose
```

这将：
1. 获取最近 90 天的提交
2. 按时间接近程度进行聚类（2 小时窗口）
3. 通过 LLM（Claude 或 OpenAI）或提交消息解析来推断意图
4. 创建 `source: "inferred"`、`confidence: 0.6-0.8` 的 ReasonNode
5. 从变更文件中提取符号，创建 CREATES 边
6. 针对现有 ReasonNode 运行重复检测

**质量提示：** 推断出的意图会被标记为低置信度。请手动审查并提升高价值意图的状态。

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
- **启发式生成**（scope → file_exists，test → test_exists）

---

## 反模式

| 反模式 | 应改为 |
|-------------|-----------------|
| 编码时不声明意图 | 在每次非平凡变更前执行 `icpg create` |
| 假设你的变更是孤立的 | 先执行 `icpg query constraints` + `icpg query risk` |
| 重建已经存在的内容 | 执行 `icpg query prior` 检查先前的工作 |
| 让意图永远处于 'executing' 状态 | 完成后将状态更新为 'fulfilled' |
| 忽略漂移事件 | 每周执行 `icpg drift check`，解决问题或创建新意图 |
| 在符号中存储完整源代码 | 仅存储签名 + 校验和——从文件中读取源代码 |
| 跳过现有仓库的引导步骤 | 执行 `icpg bootstrap --days 90` 来构建初始图 |