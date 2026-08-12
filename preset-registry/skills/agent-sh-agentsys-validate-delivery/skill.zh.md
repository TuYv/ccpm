---
name: validate-delivery
description: "Use when user asks to \"validate delivery\", \"check readiness\", or \"verify completion\". Runs tests, build, and requirement checks with pass/fail instructions."
version: 5.1.0
---
# validate-delivery

自主验证任务是否已完成并可交付。

## 验证检查

### 检查 1：审查状态

```javascript
function checkReviewStatus(reviewResults) {
  if (!reviewResults) return { passed: false, reason: 'No review results' };
  if (reviewResults.approved) return { passed: true };
  if (reviewResults.override) return { passed: true, override: true };
  return { passed: false, reason: 'Review not approved' };
}
```

### 检查 2：测试通过

```bash
# Detect test runner and run
if grep -q '"test"' package.json; then
  npm test; TEST_EXIT_CODE=$?
elif [ -f "pytest.ini" ]; then
  pytest; TEST_EXIT_CODE=$?
elif [ -f "Cargo.toml" ]; then
  cargo test; TEST_EXIT_CODE=$?
elif [ -f "go.mod" ]; then
  go test ./...; TEST_EXIT_CODE=$?
else
  TEST_EXIT_CODE=0  # No tests
fi
```

### 检查 3：构建通过

```bash
if grep -q '"build"' package.json; then
  npm run build; BUILD_EXIT_CODE=$?
elif [ -f "Cargo.toml" ]; then
  cargo build --release; BUILD_EXIT_CODE=$?
elif [ -f "go.mod" ]; then
  go build ./...; BUILD_EXIT_CODE=$?
else
  BUILD_EXIT_CODE=0  # No build step
fi
```

### 检查 4：满足需求

```javascript
async function checkRequirementsMet(task, changedFiles) {
  const requirements = extractRequirements(task.description);
  const results = [];

  for (const req of requirements) {
    const implemented = await verifyRequirement(req, changedFiles);
    results.push({ requirement: req, implemented });
  }

  return {
    passed: results.every(r => r.implemented),
    requirements: results
  };
}

function extractRequirements(description) {
  const reqs = [];
  // Extract bullet points: - Item
  const bullets = description.match(/^[-*]\s+(.+)$/gm);
  if (bullets) reqs.push(...bullets.map(m => m.replace(/^[-*]\s+/, '')));
  // Extract numbered items: 1. Item
  const numbered = description.match(/^\d+\.\s+(.+)$/gm);
  if (numbered) reqs.push(...numbered.map(m => m.replace(/^\d+\.\s+/, '')));
  return [...new Set(reqs)].slice(0, 10);
}
```

### 检查 5：无回归

```bash
# Compare test counts before/after changes
git stash
BEFORE=$(npm test 2>&1 | grep -oE '[0-9]+ passing' | grep -oE '[0-9]+')
git stash pop
AFTER=$(npm test 2>&1 | grep -oE '[0-9]+ passing' | grep -oE '[0-9]+')
[ "$AFTER" -lt "$BEFORE" ] && REGRESSION=true || REGRESSION=false
```

## 汇总结果

```javascript
const checks = {
  reviewClean: checkReviewStatus(reviewResults),
  testsPassing: { passed: TEST_EXIT_CODE === 0 },
  buildPassing: { passed: BUILD_EXIT_CODE === 0 },
  requirementsMet: await checkRequirementsMet(task, changedFiles),
  noRegressions: { passed: !REGRESSION }
};

const allPassed = Object.values(checks).every(c => c.passed);
const failedChecks = Object.entries(checks)
  .filter(([_, v]) => !v.passed)
  .map(([k]) => k);
```

## 决策和输出

### 如果全部通过

```javascript
workflowState.completePhase({
  approved: true,
  checks,
  summary: 'All validation checks passed'
});

return { approved: true, checks };
```

### 如果有任何检查失败

```javascript
const fixInstructions = generateFixInstructions(checks, failedChecks);

workflowState.failPhase('Validation failed', {
  approved: false,
  failedChecks,
  fixInstructions
});

return { approved: false, failedChecks, fixInstructions };
```

## 修复指令生成器

```javascript
function generateFixInstructions(checks, failedChecks) {
  const instructions = [];

  if (failedChecks.includes('testsPassing')) {
    instructions.push({ action: 'Fix failing tests', command: 'npm test' });
  }
  if (failedChecks.includes('buildPassing')) {
    instructions.push({ action: 'Fix build errors', command: 'npm run build' });
  }
  if (failedChecks.includes('requirementsMet')) {
    const unmet = checks.requirementsMet.requirements
      .filter(r => !r.implemented)
      .map(r => r.requirement);
    instructions.push({ action: 'Implement missing', details: unmet.join(', ') });
  }

  return instructions;
}
```

## 输出格式

```json
{
  "approved": true|false,
  "checks": {
    "reviewClean": { "passed": true },
    "testsPassing": { "passed": true },
    "buildPassing": { "passed": true },
    "requirementsMet": { "passed": true },
    "noRegressions": { "passed": true }
  },
  "failedChecks": [],
  "fixInstructions": []
}
```

## 约束条件

- 无需人工干预——完全自主运行
- 为编排器返回结构化 JSON
- 失败时生成具体的修复指令
- 修复后工作流自动重试