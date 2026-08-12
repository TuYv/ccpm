---
name: eval-harness
description: Formal evaluation framework for Claude Code sessions implementing eval-driven development (EDD) principles. Use when a Claude Code workflow needs a formal eval before it is trusted or changed.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---
# 评估框架 Skill

一个用于 Claude Code 会话的正式评估框架，实现评估驱动开发（EDD）原则。

## 何时启用

- 为 AI 辅助工作流建立评估驱动开发（EDD）体系
- 为 Claude Code 任务完成情况定义通过/失败标准
- 使用 pass@k 指标衡量智能体可靠性
- 为提示词或智能体变更创建回归测试套件
- 对不同模型版本的智能体性能进行基准测试

## 理念

评估驱动开发将评估视为“AI 开发的单元测试”：
- 在实现之前定义预期行为
- 在开发过程中持续运行评估
- 跟踪每次变更引入的回归
- 使用 pass@k 指标衡量可靠性

## 评估类型

### 能力评估
测试 Claude 是否能够完成之前无法完成的事情：
```markdown
[CAPABILITY EVAL: feature-name]
Task: Description of what Claude should accomplish
Success Criteria:
  - [ ] Criterion 1
  - [ ] Criterion 2
  - [ ] Criterion 3
Expected Output: Description of expected result
```

### 回归评估
确保变更不会破坏现有功能：
```markdown
[REGRESSION EVAL: feature-name]
Baseline: SHA or checkpoint name
Tests:
  - existing-test-1: PASS/FAIL
  - existing-test-2: PASS/FAIL
  - existing-test-3: PASS/FAIL
Result: X/Y passed (previously Y/Y)
```

## 评分器类型

### 1. 基于代码的评分器
使用代码执行确定性检查：
```bash
# Check if file contains expected pattern
grep -q "export function handleAuth" src/auth.ts && echo "PASS" || echo "FAIL"

# Check if tests pass
npm test -- --testPathPattern="auth" && echo "PASS" || echo "FAIL"

# Check if build succeeds
npm run build && echo "PASS" || echo "FAIL"
```

### 2. 基于模型的评分器
使用 Claude 评估开放式输出：
```markdown
[MODEL GRADER PROMPT]
Evaluate the following code change:
1. Does it solve the stated problem?
2. Is it well-structured?
3. Are edge cases handled?
4. Is error handling appropriate?

Score: 1-5 (1=poor, 5=excellent)
Reasoning: [explanation]
```

### 3. 人工评分器
标记为需要人工审查：
```markdown
[HUMAN REVIEW REQUIRED]
Change: Description of what changed
Reason: Why human review is needed
Risk Level: LOW/MEDIUM/HIGH
```

## 指标

### pass@k
“在 k 次尝试中至少成功一次”
- pass@1：首次尝试成功率
- pass@3：在 3 次尝试内成功
- 典型目标：pass@3 > 90%

### pass^k
“全部 k 次试验均成功”
- 对可靠性提出了更高要求
- pass^3：连续成功 3 次
- 用于关键路径

## 评估工作流

### 1. 定义（编码之前）
```markdown
## EVAL DEFINITION: feature-xyz

### Capability Evals
1. Can create new user account
2. Can validate email format
3. Can hash password securely

### Regression Evals
1. Existing login still works
2. Session management unchanged
3. Logout flow intact

### Success Metrics
- pass@3 > 90% for capability evals
- pass^3 = 100% for regression evals
```

### 2. 实现
编写代码以通过已定义的评估。

### 3. 评估
```bash
# Run capability evals
[Run each capability eval, record PASS/FAIL]

# Run regression evals
npm test -- --testPathPattern="existing"

# Generate report
```

### 4. 报告
```markdown
EVAL REPORT: feature-xyz
========================

Capability Evals:
  create-user:     PASS (pass@1)
  validate-email:  PASS (pass@2)
  hash-password:   PASS (pass@1)
  Overall:         3/3 passed

Regression Evals:
  login-flow:      PASS
  session-mgmt:    PASS
  logout-flow:     PASS
  Overall:         3/3 passed

Metrics:
  pass@1: 67% (2/3)
  pass@3: 100% (3/3)

Status: READY FOR REVIEW
```

## 集成模式

### 实现前
```
/eval define feature-name
```
在 `.claude/evals/feature-name.md` 创建评测定义文件

### 实现期间
```
/eval check feature-name
```
运行当前评测并报告状态

### 实现后
```
/eval report feature-name
```
生成完整的评测报告

## 评测存储

将评测存储在项目中：
```
.claude/
  evals/
    feature-xyz.md      # Eval definition
    feature-xyz.log     # Eval run history
    baseline.json       # Regression baselines
```

## 最佳实践

1. **在编码前定义评测** - 促使你清晰思考成功标准
2. **频繁运行评测** - 尽早发现回归问题
3. **持续跟踪 pass@k** - 监控可靠性趋势
4. **尽可能使用代码评分器** - 确定性优于概率性
5. **对安全性进行人工审查** - 切勿完全自动化安全检查
6. **保持评测快速运行** - 缓慢的评测不会被运行
7. **评测与代码一起进行版本管理** - 评测是一等产物

## 示例：添加身份验证

```markdown
## EVAL: add-authentication

### Phase 1: Define (10 min)
Capability Evals:
- [ ] User can register with email/password
- [ ] User can login with valid credentials
- [ ] Invalid credentials rejected with proper error
- [ ] Sessions persist across page reloads
- [ ] Logout clears session

Regression Evals:
- [ ] Public routes still accessible
- [ ] API responses unchanged
- [ ] Database schema compatible

### Phase 2: Implement (varies)
[Write code]

### Phase 3: Evaluate
Run: /eval check add-authentication

### Phase 4: Report
EVAL REPORT: add-authentication
==============================
Capability: 5/5 passed (pass@3: 100%)
Regression: 3/3 passed (pass^3: 100%)
Status: SHIP IT
```