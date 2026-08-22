---
name: propose-hypotheses
description: Execute complete FPF cycle from hypothesis generation to decision
argument-hint: "[problem-statement]"
allowed-tools: Task, Read, Write, Bash, AskUserQuestion
---
# 提出假设工作流

执行第一性原理框架（FPF）循环：生成相互竞争的假设、验证逻辑、验证证据、审计可信度并作出决策。

## 用户输入

```text
Problem Statement: $ARGUMENTS
```

## 工作流执行

### 步骤 1a：创建目录结构（主代理）

如果 `.fpf/` 目录结构不存在，则创建该结构：

```bash
mkdir -p .fpf/{evidence,decisions,sessions,knowledge/{L0,L1,L2,invalid}}
touch .fpf/{evidence,decisions,sessions,knowledge/{L0,L1,L2,invalid}}/.gitkeep
```

**后置条件**：`.fpf/` 目录框架已存在。

---

### 步骤 1b：初始化上下文（FPF 代理）

使用 sonnet[1m] 模型启动 fpf-agent：
- **描述**："初始化 FPF 上下文"
- **提示词**：
  ```
  Read ${CLAUDE_PLUGIN_ROOT}/tasks/init-context.md and execute.

  Problem Statement: $ARGUMENTS

  **Write**: Context summary to `.fpf/context.md`**
  ```

---

### 步骤 2：生成假设（FPF 代理）

使用 sonnet[1m] 模型启动 fpf-agent：
- **描述**："生成 L0 假设"
- **提示词**：
  ```
  Read ${CLAUDE_PLUGIN_ROOT}/tasks/generate-hypotheses.md and execute.

  Problem Statement: $ARGUMENTS
  Context: <summary from Step 1b>

  **Write**: List of hypothesis IDs and titles to `.fpf/knowledge/L0/`

  Reply with summary table in markdown format:

    | ID | Title | Kind | Scope |
    |----|-------|------|-------|
    | ... | ... | ... | ... |
  ```

---

### 步骤 3：呈现摘要（主代理）

1. 从 `.fpf/knowledge/L0/` 读取所有 L0 假设文件
2. 呈现代理响应中的摘要表格。
3. 询问用户："你想添加自己的假设吗？（是/否）"

---

### 步骤 4：添加用户假设（FPF 代理，条件循环）

**条件**：用户表示要添加假设。

使用 sonnet[1m] 模型启动 fpf-agent：
- **描述**："添加用户假设"
- **提示词**：
  ```
  Read ${CLAUDE_PLUGIN_ROOT}/tasks/add-user-hypothesis.md and execute.

  User Hypothesis Description: <get from user>

  **Write**: User hypothesis to `.fpf/knowledge/L0/`
  ```

**循环**：添加假设后返回步骤 3。

**退出**：当用户表示不添加或拒绝继续添加时退出。

---

### 步骤 5：验证逻辑（并行子代理）

**条件**：用户已完成假设添加。

对于 `.fpf/knowledge/L0/` 中的每个 L0 假设文件，使用 sonnet[1m] 模型并行启动 fpf-agent：
- **描述**："验证假设：<hypothesis-id>"
- **提示词**：
  ```
  Read ${CLAUDE_PLUGIN_ROOT}/tasks/verify-logic.md and execute.

  Hypothesis ID: <hypothesis-id>
  Hypothesis File: .fpf/knowledge/L0/<hypothesis-id>.md

  **Move**: After you complete verification, move the file to `.fpf/knowledge/L1/` or `.fpf/knowledge/invalid/`.
  ```

**等待所有代理完成**，然后检查文件是否已移动到 `.fpf/knowledge/L1/` 或 `.fpf/knowledge/invalid/`。

---

### 步骤 6：验证证据（并行子代理）

对于 `.fpf/knowledge/L1/` 中的每个 L1 假设文件，使用 sonnet[1m] 模型并行启动 fpf-agent：
- **描述**："验证假设：<hypothesis-id>"
- **提示词**：
  ```
  Read ${CLAUDE_PLUGIN_ROOT}/tasks/validate-evidence.md and execute.

  Hypothesis ID: <hypothesis-id>
  Hypothesis File: .fpf/knowledge/L1/<hypothesis-id>.md

  **Move**: After you complete validation, move the file to `.fpf/knowledge/L2/` or `.fpf/knowledge/invalid/`.
  ```

**等待所有代理完成**，然后检查文件是否已移至 `.fpf/knowledge/L2/` 或 `.fpf/knowledge/invalid/`。

---

### 步骤 7：审计可信度（并行子代理）

针对 `.fpf/knowledge/L2/` 中的每个 L2 假设文件，使用 sonnet[1m] 模型并行启动 fpf-agent：
- **描述**："审计可信度：<hypothesis-id>"
- **提示词**：
  ```
  Read ${CLAUDE_PLUGIN_ROOT}/tasks/audit-trust.md and execute.

  Hypothesis ID: <hypothesis-id>
  Hypothesis File: .fpf/knowledge/L2/<hypothesis-id>.md

  **Write**: Audit report to `.fpf/evidence/audit-{hypothesis-id}-{YYYY-MM-DD}.md`

  **Reply**: with R_eff score and weakest link
  ```

**等待所有代理完成**，然后检查审计报告是否已在 `.fpf/evidence/` 中创建。

---

### 步骤 8：做出决策（FPF 代理）

使用 sonnet[1m] 模型启动 fpf-agent：
- **描述**："创建设计决策记录"
- **提示词**：
  ```
  Read ${CLAUDE_PLUGIN_ROOT}/tasks/decide.md and execute.

  Problem Statement: $ARGUMENTS
  L2 Hypotheses Directory: .fpf/knowledge/L2/
  Audit Reports: .fpf/evidence/

  **Write**: Decision record to `.fpf/decisions/`

  **Reply**: with decision record summary in markdown format:

  | Hypothesis | R_eff | Weakest Link | Status |
  |------------|-------|--------------|--------|
  | ... | ... | ... | ... |

  **Recommended Decision**: <hypothesis title>

  **Rationale**: <brief explanation>
  ```

**等待代理完成**，然后检查决策记录是否已在 `.fpf/decisions/` 中创建。
---

### 步骤 9：展示最终摘要（主代理）

1. 从 `.fpf/decisions/` 读取 DRR
2. 展示代理响应中的结果。
3. 展示后续步骤：
   - 实施选定的假设
   - 使用 `/fpf:status` 检查 FPF 状态
   - 如果代码库发生变化，使用 `/fpf:actualize`
4. 询问用户是否同意该决策；如果不同意，则从步骤 8 启动 fpf-agent，并指示其按照用户的要求修改决策。

---

## 完成条件

满足以下条件时，工作流即告完成：
- [ ] `.fpf/` 目录结构已存在
- [ ] 上下文已记录在 `.fpf/context.md` 中
- [ ] 假设已生成、核验、验证并审计
- [ ] DRR 已在 `.fpf/decisions/` 中创建
- [ ] 已向用户展示最终摘要

**已创建的产物**：
- `.fpf/context.md` - 问题上下文
- `.fpf/knowledge/L0/*.md` - 初始假设
- `.fpf/knowledge/L1/*.md` - 已核验的假设
- `.fpf/knowledge/L2/*.md` - 已验证的假设
- `.fpf/knowledge/invalid/*.md` - 已拒绝的假设
- `.fpf/evidence/*.md` - 证据文件
- `.fpf/decisions/*.md` - 设计原理记录