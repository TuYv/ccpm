---
name: enhance-orchestrator
description: "Use when coordinating multiple enhancers for /enhance command. Runs analyzers in parallel and produces unified report."
version: 5.1.0
argument-hint: "[path] [--apply] [--focus=TYPE]"
---
# enhance-orchestrator

并行协调所有增强分析器，并生成统一报告。

## 关键规则

1. **必须并行运行增强器** - 使用 Promise.all 提高效率
2. **必须仅针对现有内容运行增强器** - 如果未找到文件则跳过
3. **必须优先报告 HIGH 确定性问题** - 优先级顺序：HIGH → MEDIUM → LOW
4. **如果没有 --apply 标志，绝不自动修复** - 必须获得明确同意
5. **绝不自动修复 MEDIUM 或 LOW 问题** - 仅修复 HIGH 确定性问题

## 工作流程

### 阶段 1：解析参数

```javascript
const args = '$ARGUMENTS'.split(' ').filter(Boolean);
const targetPath = args.find(a => !a.startsWith('--')) || '.';

const flags = {
  apply: args.includes('--apply'),
  focus: args.find(a => a.startsWith('--focus='))?.split('=')[1],
  verbose: args.includes('--verbose'),
  showSuppressed: args.includes('--show-suppressed'),
  resetLearned: args.includes('--reset-learned'),
  noLearn: args.includes('--no-learn'),
  exportLearned: args.includes('--export-learned')
};

// Validate focus type
const VALID_FOCUS = ['plugin', 'agent', 'claudemd', 'claude-memory', 'docs', 'prompt', 'hooks', 'skills', 'cross-file'];
if (flags.focus && !VALID_FOCUS.includes(flags.focus)) {
  console.error(`Invalid --focus: "${flags.focus}". Valid: ${VALID_FOCUS.join(', ')}`);
  return;
}
```

### 阶段 2：发现内容

检测目标路径中存在的内容：

```javascript
const discovery = {
  plugins: await Glob({ pattern: 'plugins/*/.claude-plugin/plugin.json', path: targetPath }),
  agents: await Glob({ pattern: '**/agents/*.md', path: targetPath }),
  claudemd: await Glob({ pattern: '**/CLAUDE.md', path: targetPath }) ||
            await Glob({ pattern: '**/AGENTS.md', path: targetPath }),
  docs: await Glob({ pattern: 'docs/**/*.md', path: targetPath }),
  prompts: await Glob({ pattern: '**/prompts/**/*.md', path: targetPath }) ||
           await Glob({ pattern: '**/commands/**/*.md', path: targetPath }),
  hooks: await Glob({ pattern: '**/hooks/**/*.md', path: targetPath }),
  skills: await Glob({ pattern: '**/skills/**/SKILL.md', path: targetPath }),
  // Cross-file runs if agents OR skills exist (analyzes relationships)
  'cross-file': discovery.agents?.length || discovery.skills?.length ? ['enabled'] : []
};
```

### 阶段 3：加载抑制项

```javascript
// Use relative path from skill directory to plugin lib
// Path: skills/enhance-orchestrator/ -> ../../lib/
const { getSuppressionPath } = require('../../lib/cross-platform');
const { loadAutoSuppressions, getProjectId, clearAutoSuppressions } = require('../../lib/enhance/auto-suppression');

const suppressionPath = getSuppressionPath();
const projectId = getProjectId(targetPath);

if (flags.resetLearned) {
  clearAutoSuppressions(suppressionPath, projectId);
  console.log(`Cleared suppressions for project: ${projectId}`);
}

const autoLearned = loadAutoSuppressions(suppressionPath, projectId);
```

### 阶段 4：并行启动增强器

**关键**：必须使用 Task() 生成以下这些确切的代理。不要使用 Explore 或其他代理。

| 关注类型 | 要启动的 Agent | 模型 | JS 分析器 |
|------------|----------------|-------|-------------|
| `plugin` | `plugin-enhancer` | sonnet | `lib/enhance/plugin-analyzer.js` |
| `agent` | `agent-enhancer` | opus | `lib/enhance/agent-analyzer.js` |
| `claudemd` | `claudemd-enhancer` | opus | `lib/enhance/projectmemory-analyzer.js` |
| `docs` | `docs-enhancer` | opus | `lib/enhance/docs-analyzer.js` |
| `prompt` | `prompt-enhancer` | opus | `lib/enhance/prompt-analyzer.js` |
| `hooks` | `hooks-enhancer` | opus | `lib/enhance/hook-analyzer.js` |
| `skills` | `skills-enhancer` | opus | `lib/enhance/skill-analyzer.js` |
| `cross-file` | `cross-file-enhancer` | sonnet | `lib/enhance/cross-file-analyzer.js` |

每个 Agent 都拥有 `Bash(node:*)` 权限，可运行其 JS 分析器。不要用 Explore Agent 替代。

```javascript
// EXACT agent mapping - do not change
const ENHANCER_AGENTS = {
  plugin: 'plugin-enhancer',
  agent: 'agent-enhancer',
  claudemd: 'claudemd-enhancer',
  docs: 'docs-enhancer',
  prompt: 'prompt-enhancer',
  hooks: 'hooks-enhancer',
  skills: 'skills-enhancer',
  'cross-file': 'cross-file-enhancer'
};

const promises = [];

for (const [type, agentType] of Object.entries(ENHANCER_AGENTS)) {
  if (focus && focus !== type) continue;
  if (!discovery[type]?.length) continue;

  // MUST use exact subagent_type - these agents have Bash(node:*) to run JS analyzers
  promises.push(Task({
    subagent_type: agentType,
    prompt: `Analyze ${type} in ${targetPath}.
MUST use Skill tool to invoke your enhance-* skill.
The skill runs the JavaScript analyzer and returns structured findings.
verbose: ${flags.verbose}
Return JSON: { "enhancerType": "${type}", "findings": [...], "summary": { high, medium, low } }`
  }));
}

// MUST use Promise.all for parallel execution
const results = await Promise.all(promises);
```

### 阶段 5：汇总结果

```javascript
function aggregateResults(enhancerResults) {
  const findings = [];
  const byEnhancer = {};

  for (const result of enhancerResults) {
    if (!result?.findings) continue;
    for (const finding of result.findings) {
      findings.push({ ...finding, source: result.enhancerType });
    }
    byEnhancer[result.enhancerType] = result.summary;
  }

  return {
    findings,
    byEnhancer,
    totals: {
      high: findings.filter(f => f.certainty === 'HIGH').length,
      medium: findings.filter(f => f.certainty === 'MEDIUM').length,
      low: findings.filter(f => f.certainty === 'LOW').length
    }
  };
}
```

### 阶段 6：生成报告

直接根据汇总后的发现生成报告：

```javascript
const { generateReport } = require('../../lib/enhance/reporter');

const report = generateReport(aggregated, {
  verbose: flags.verbose,
  showAutoFixable: flags.apply
});

console.log(report);
```

### 阶段 7：自动学习

```javascript
if (!flags.noLearn) {
  const { analyzeForAutoSuppression, saveAutoSuppressions } = require('../../lib/enhance/auto-suppression');

  const newSuppressions = analyzeForAutoSuppression(aggregated.findings, fileContents, { projectRoot: targetPath });

  if (newSuppressions.length > 0) {
    saveAutoSuppressions(suppressionPath, projectId, newSuppressions);
    console.log(`\nLearned ${newSuppressions.length} new suppressions.`);
  }
}
```

### 阶段 8：应用修复

```javascript
if (flags.apply) {
  const autoFixable = aggregated.findings.filter(f => f.certainty === 'HIGH' && f.autoFixable);

  if (autoFixable.length > 0) {
    console.log(`\n## Applying ${autoFixable.length} Auto-Fixes\n`);

    const byEnhancer = {};
    for (const fix of autoFixable) {
      const type = fix.source;
      if (!byEnhancer[type]) byEnhancer[type] = [];
      byEnhancer[type].push(fix);
    }

    for (const [type, fixes] of Object.entries(byEnhancer)) {
      await Task({
        subagent_type: enhancerAgents[type],
        prompt: `Apply HIGH certainty fixes: ${JSON.stringify(fixes, null, 2)}`
      });
    }

    console.log(`Applied ${autoFixable.length} fixes.`);
  }
}
```

## 输出格式

```markdown
# Enhancement Analysis Report

**Target**: {targetPath}
**Date**: {timestamp}
**Enhancers Run**: {list}

## Executive Summary

| Enhancer | HIGH | MEDIUM | LOW | Auto-Fixable |
|----------|------|--------|-----|--------------|
| plugin   | 2    | 3      | 1   | 1            |
| agent    | 1    | 2      | 0   | 1            |
| **Total**| **3**| **5**  | **1**| **2**       |

## HIGH Certainty Issues
[Grouped by enhancer, then file]

## MEDIUM Certainty Issues
[...]

## Auto-Fix Summary
{n} issues can be fixed with `--apply` flag.
```

## 约束条件

- 必须并行运行增强器（Promise.all）
- 必须跳过缺少相应内容类型的增强器
- 必须优先报告确定性为 HIGH 的问题
- 必须对不同增强器的发现进行去重
- 如果未显式指定 --apply 标志，绝不能自动修复
- 绝不能自动修复确定性为 MEDIUM 或 LOW 的问题