---
name: orchestrate-review
version: 5.1.0
description: "Use when user asks to \"deep review the code\", \"thorough code review\", \"multi-pass review\", or when orchestrating the Phase 9 review loop. Provides review pass definitions (code quality, security, performance, test coverage), signal detection patterns, and iteration algorithms."
metadata:
  short-description: "Multi-pass code review orchestration"
---
# 编排审查

通过并行 Task 代理执行多轮代码审查，汇总发现的问题，并持续迭代直至不再发现问题。

## 基于范围选择专家

根据审查范围有条件地选择专家：
- **用户请求**：从用户所指内容（文件、目录、模块）中检测信号
- **工作流（阶段 9）**：仅从已更改的文件中检测信号
- **项目审计**：从整个项目结构中检测信号

## 审查轮次

为每个审查轮次并行启动一个 `general-purpose` Task 代理（模型：`sonnet`）：

### 核心（始终执行）
```javascript
const corePasses = [
  { id: 'code-quality', role: 'code quality reviewer',
    focus: ['Style and consistency', 'Best practices', 'Bugs and logic errors', 'Error handling', 'Maintainability', 'Duplication'] },
  { id: 'security', role: 'security reviewer',
    focus: ['Auth/authz flaws', 'Input validation', 'Injection risks', 'Secrets exposure', 'Insecure defaults'] },
  { id: 'performance', role: 'performance reviewer',
    focus: ['N+1 queries', 'Blocking operations', 'Hot path inefficiencies', 'Memory leaks'] },
  { id: 'test-coverage', role: 'test coverage reviewer',
    focus: ['Missing tests', 'Edge case coverage', 'Test quality', 'Integration needs', 'Mock appropriateness'] }
];
```

### 条件执行（基于信号）
```javascript
if (signals.hasDb) passes.push({ id: 'database', role: 'database specialist',
  focus: ['Query performance', 'Indexes/transactions', 'Migration safety', 'Data integrity'] });
if (signals.needsArchitecture) passes.push({ id: 'architecture', role: 'architecture reviewer',
  focus: ['Module boundaries', 'Dependency direction', 'Cross-layer coupling', 'Pattern consistency'] });
if (signals.hasApi) passes.push({ id: 'api', role: 'api designer',
  focus: ['REST conventions', 'Error/status consistency', 'Pagination/filters', 'Versioning'] });
if (signals.hasFrontend) passes.push({ id: 'frontend', role: 'frontend specialist',
  focus: ['Component boundaries', 'State management', 'Accessibility', 'Render performance'] });
if (signals.hasBackend) passes.push({ id: 'backend', role: 'backend specialist',
  focus: ['Service boundaries', 'Domain logic', 'Concurrency/idempotency', 'Background job safety'] });
if (signals.hasDevops) passes.push({ id: 'devops', role: 'devops reviewer',
  focus: ['CI/CD safety', 'Secrets handling', 'Build/test pipelines', 'Deploy config'] });
```

## 信号检测

```javascript
const signals = {
  hasDb: files.some(f => /(db|migrations?|schema|prisma|typeorm|sql)/i.test(f)),
  hasApi: files.some(f => /(api|routes?|controllers?|handlers?)/i.test(f)),
  hasFrontend: files.some(f => /\.(tsx|jsx|vue|svelte)$/.test(f)),
  hasBackend: files.some(f => /(server|backend|services?|domain)/i.test(f)),
  hasDevops: files.some(f => /(\.github\/workflows|Dockerfile|k8s|terraform)/i.test(f)),
  needsArchitecture: files.length > 20  // 20+ files typically indicates cross-module changes
};
```

## Task 提示词模板

```
You are a ${pass.role}. Review these changed files:
${files.join('\n')}

Focus: ${pass.focus.map(f => `- ${f}`).join('\n')}

Return JSON:
{
  "pass": "${pass.id}",
  "findings": [{
    "file": "path.ts",
    "line": 42,
    "severity": "critical|high|medium|low",
    "description": "Issue",
    "suggestion": "Fix",
    "confidence": "high|medium|low",
    "falsePositive": false
  }]
}

Example findings (diverse passes and severities):

// Security - high severity
{ "file": "src/auth/login.ts", "line": 89, "severity": "high",
  "description": "Password comparison uses timing-vulnerable string equality",
  "suggestion": "Use crypto.timingSafeEqual() instead of ===",
  "confidence": "high", "falsePositive": false }

// Code quality - medium severity
{ "file": "src/utils/helpers.ts", "line": 45, "severity": "medium",
  "description": "Duplicated validation logic exists in src/api/validators.ts:23",
  "suggestion": "Extract to shared lib/validation.ts",
  "confidence": "high", "falsePositive": false }

// Performance - low severity
{ "file": "src/config.ts", "line": 12, "severity": "low",
  "description": "Magic number 3600 should be named constant",
  "suggestion": "const CACHE_TTL_SECONDS = 3600;",
  "confidence": "medium", "falsePositive": false }

// False positive example
{ "file": "src/crypto/hash.ts", "line": 78, "severity": "high",
  "description": "Non-constant time comparison",
  "suggestion": "N/A - intentional for non-secret data",
  "confidence": "low", "falsePositive": true }

Report all issues with confidence >= medium. Empty findings array if clean.
```

## 聚合

```javascript
function aggregateFindings(results) {
  const items = [];
  for (const {pass, findings = []} of results) {
    for (const f of findings) {
      items.push({
        id: `${pass}:${f.file}:${f.line}:${f.description}`,
        pass, ...f,
        status: f.falsePositive ? 'false-positive' : 'open'
      });
    }
  }

  // Deduplicate by id
  const deduped = [...new Map(items.map(i => [i.id, i])).values()];

  // Group by severity
  const bySeverity = {critical: [], high: [], medium: [], low: []};
  deduped.forEach(i => !i.falsePositive && bySeverity[i.severity || 'low'].push(i));

  const totals = Object.fromEntries(Object.entries(bySeverity).map(([k, v]) => [k, v.length]));

  return {
    items: deduped,
    bySeverity,
    totals,
    openCount: Object.values(totals).reduce((a, b) => a + b, 0)
  };
}
```

## 迭代循环

**安全说明**：修复由编排器使用标准 Edit 工具权限实施。应用严重级别为 critical/high 的发现项之前应进行审查——不要盲目地将 LLM 建议的修复应用于安全敏感代码。编排器会根据原始问题验证每项修复。

```javascript
// 5 iterations balances thoroughness vs cost; 1 stall (2 consecutive identical-hash iterations) indicates fixes aren't progressing
const MAX_ITERATIONS = 5, MAX_STALLS = 1;
let iteration = 1, stallCount = 0, lastHash = null;

while (iteration <= MAX_ITERATIONS) {
  // 1. Spawn parallel Task agents
  const results = await Promise.all(passes.map(pass => Task({
    subagent_type: 'general-purpose',
    model: 'sonnet',
    prompt: /* see template above */
  })));

  // 2. Aggregate findings
  const findings = aggregateFindings(results);

  // 3. Check if done
  if (findings.openCount === 0) {
    workflowState.completePhase({ approved: true, iterations: iteration });
    break;
  }

  // 4. Fix issues (severity order: critical → high → medium → low)
  // Orchestrator reviews each suggestion before applying via Edit tool
  for (const issue of [...findings.bySeverity.critical, ...findings.bySeverity.high,
                          ...findings.bySeverity.medium, ...findings.bySeverity.low]) {
    if (!issue.falsePositive) {
      // Read file, locate issue.line, validate suggestion, apply via Edit tool
      // For complex fixes, use simple-fixer agent pattern
    }
  }

  // 5. Commit
  exec(`git add . && git commit -m "fix: review feedback (iteration ${iteration})"`);

  // 6. Post-iteration deslop
  Task({ subagent_type: 'deslop-agent', model: 'sonnet' });

  // 7. Stall detection
  const hash = crypto.createHash('sha256')
    .update(JSON.stringify(findings.items.filter(i => !i.falsePositive)))
    .digest('hex');
  stallCount = hash === lastHash ? stallCount + 1 : 0;
  lastHash = hash;

  // 8. Check limits
  if (stallCount >= MAX_STALLS || iteration >= MAX_ITERATIONS) {
    const reason = stallCount >= MAX_STALLS ? 'stall-detected' : 'iteration-limit';
    console.log(`[BLOCKED] Review loop ended: ${reason}. Remaining: ${JSON.stringify(findings.totals)}`);
    // Ask the user before advancing - do not silently proceed to delivery-validation
    const question = `Review loop blocked (${reason}). Open issues remain. How should we proceed?`;
    const response = AskUserQuestion({
      questions: [{
        question,
        header: 'Review Blocked',
        multiSelect: false,
        options: [
          { label: 'Override and proceed', description: 'Advance to delivery-validation with unresolved issues (risky)' },
          { label: 'Abort workflow', description: 'Stop here; open issues must be fixed manually' }
        ]
      }]
    });
    // AskUserQuestion returns { answers: { [questionText]: selectedLabel } }
    const choice = response.answers?.[question] ?? response[question];
    if (choice === 'Override and proceed') {
      workflowState.completePhase({
        approved: false, blocked: true, overridden: true,
        reason, remaining: findings.totals
      });
    } else {
      workflowState.failPhase(`Review blocked: ${reason}. ${JSON.stringify(findings.totals)} issues remain.`);
    }
    break;
  }

  iteration++;
}
```

## 审查队列

将状态存储在 `{stateDir}/review-queue-{timestamp}.json`：
```json
{
  "status": "open|resolved|blocked",
  "scope": { "type": "diff", "files": ["..."] },
  "passes": ["code-quality", "security"],
  "items": [],
  "iteration": 0,
  "stallCount": 0
}
```

批准后删除。阻塞时保留，以供编排器检查。

## 跨平台兼容性

此 Skill 使用 `Task({ subagent_type: ... })`，这是 Claude Code 的语法。对于其他平台：

| 平台 | 等效语法 |
|----------|-------------------|
| Claude Code | `Task({ subagent_type: 'general-purpose', model: 'sonnet', prompt: ... })` |
| OpenCode | `spawn_agent({ type: 'general-purpose', model: 'sonnet', prompt: ... })` |
| Codex CLI | `$agent general-purpose --model sonnet --prompt "..."` |

聚合和迭代逻辑在各个平台上保持不变——只有代理生成语法有所不同。