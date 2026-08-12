---
name: discover-tasks
description: "Use when user asks to \"discover tasks\", \"find next task\", \"prioritize issues\", \"what should I work on\", or \"list open issues\". Discovers and ranks tasks from GitHub, GitLab, local files, and custom sources."
version: 5.1.1
allowed-tools: "Bash(gh:*), Bash(glab:*), Bash(git:*), Bash(grep:*), Grep, Read, AskUserQuestion"
---
# discover-tasks

从已配置的来源发现任务、验证任务，并呈现给用户选择。

## 使用时机

在 `/next-task` 工作流的阶段 2 中，在策略选择后调用。当用户希望从已配置的来源中发现并选择任务时，也可以单独使用。

## 工作流

### 阶段 1：加载策略和已认领任务

```javascript
// Use relative path from skill directory to plugin lib
// Path: skills/discover-tasks/ -> ../../lib/state/workflow-state.js
const workflowState = require('../../lib/state/workflow-state.js');

const state = workflowState.readState();
const policy = state.policy;

// Load claimed task IDs from registry (tasks[] contains worktree-manager claims)
const tasksRegistry = workflowState.readTasks();
const claimedIds = new Set(tasksRegistry.tasks.map(t => t.id));
```

### 阶段 2：按来源获取任务

**来源类型：**
- `github` / `gh-issues`：GitHub CLI
- `gh-projects`：GitHub Projects（v2 看板）
- `gitlab`：GitLab CLI
- `local` / `tasks-md`：本地 Markdown 文件
- `custom`：CLI/MCP/Skill 工具
- `other`：由智能体解释描述

**GitHub Issues：**
```bash
# Fetch with pagination awareness
gh issue list --state open \
  --json number,title,body,labels,assignees,createdAt,url \
  --limit 100 > /tmp/gh-issues.json
```

**GitLab Issues：**
```bash
glab issue list --state opened --output json --per-page 100 > /tmp/glab-issues.json
```

**本地 tasks.md：**
```bash
for f in PLAN.md tasks.md TODO.md; do
  [ -f "$f" ] && grep -n '^\s*- \[ \]' "$f"
done
```

**GitHub Projects（v2）：**
```javascript
// Extract gh-projects parameters from policy
const projectNumber = policy.taskSource.projectNumber;
const owner = policy.taskSource.owner;
if (!projectNumber || !owner) {
  throw new Error('gh-projects source missing projectNumber or owner in policy.taskSource');
}
```

```bash
# Requires 'project' token scope. If permission error: gh auth refresh -s project
gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json --limit 100 > /tmp/gh-project-items.json
```

```javascript
const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('/tmp/gh-project-items.json', 'utf8'));
const items = (raw.items || []);

// Filter to ISSUE type only (exclude PULL_REQUEST, DRAFT_ISSUE)
const issues = items
  .filter(item => item.content && item.content.type === 'ISSUE')
  .map(item => ({
    number: item.content.number,
    title: item.content.title,
    body: item.content.body || '',
    labels: (item.content.labels || []).map(l => typeof l === 'object' ? l.name || '' : l).filter(Boolean),
    url: item.content.url,
    createdAt: item.content.createdAt
  }));
```

[警告] 如果 `gh project item-list` 返回权限错误，请告知用户：
`Run: gh auth refresh -s project`

**自定义来源：**
```javascript
const { sources } = require('../../lib');
const capabilities = sources.getToolCapabilities(toolName);
// Execute capabilities.commands.list_issues
```

### 阶段 2.5：收集 PR 关联的 Issues（仅限 GitHub）

```javascript
// Default for non-GitHub sources - always defined so Phase 3 filter is safe
let prLinkedIssues = new Set();
```

对于 GitHub 来源（`policy.taskSource?.source === 'github'`、`'gh-issues'` 或 `'gh-projects'`），获取所有开放的 PR，并构建一个 Set，其中包含已经有关联 PR 的议题编号。对于所有其他来源，直接跳到阶段 3。

```bash
# Only run when policy.taskSource?.source is 'github', 'gh-issues', or 'gh-projects'
# Note: covers up to 100 open PRs. If repo has more, some linked issues may not be excluded.
gh pr list --state open --json number,title,body,headRefName --limit 100 > /tmp/gh-prs.json
```

```javascript
const fs = require('fs');
try {
  const prs = JSON.parse(fs.readFileSync('/tmp/gh-prs.json', 'utf8') || '[]');

  for (const pr of prs) {
    // 1. Branch name suffix: fix/some-thing-123 extracts 123
    // Note: heuristic - branches like "release-2026" will false-positive on issue #2026.
    // Patterns 2 and 3 are more precise; this is a best-effort supplement.
    const branchMatch = (pr.headRefName || '').match(/-(\d+)$/);
    if (branchMatch) prLinkedIssues.add(branchMatch[1]);

    // 2. PR body closing keywords (GitHub's full keyword set, with word boundary)
    if (pr.body) {
      const bodyMatches = pr.body.matchAll(/\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)/gi);
      for (const m of bodyMatches) prLinkedIssues.add(m[1]);
    }

    // 3. PR title (#N) convention - capture all occurrences
    const titleMatches = (pr.title || '').matchAll(/\(#(\d+)\)/g);
    for (const m of titleMatches) prLinkedIssues.add(m[1]);
  }
} catch (e) {
  console.log('[WARN] Could not parse open PRs, skipping PR-link filter:', e.message);
  prLinkedIssues = new Set();
}
```

### 阶段 3：筛选和评分

**排除已认领的任务：**
```javascript
const available = tasks.filter(t => !claimedIds.has(String(t.number || t.id)));
```

**排除已有开放 PR 的议题（仅限 GitHub）：**
```javascript
const filtered = available.filter(t => {
  const id = String(t.number || t.id);
  if (prLinkedIssues.has(id)) {
    console.log(`[INFO] Skipping #${id} - already has an open PR`);
    return false;
  }
  return true;
});
```

**应用优先级筛选器**（将 `filtered` 传入评分管线）：
```javascript
const LABEL_MAPS = {
  bugs: ['bug', 'fix', 'error', 'defect'],
  security: ['security', 'vulnerability', 'cve'],
  features: ['enhancement', 'feature', 'improvement']
};

function filterByPriority(tasks, filter) {
  if (filter === 'continue' || filter === 'all') return tasks;
  const targetLabels = LABEL_MAPS[filter] || [];
  return tasks.filter(t => {
    const labels = (t.labels || []).map(l => (l.name || l).toLowerCase());
    return targetLabels.some(target => labels.some(l => l.includes(target)));
  });
}

const prioritized = filterByPriority(filtered, policy.priorityFilter);
// Assign score to each task so it is available for display in the UI
const topTasks = prioritized.map(t => ({ ...t, score: scoreTask(t) })).sort((a, b) => b.score - a.score);
```

**为任务评分：**
```javascript
function scoreTask(task) {
  let score = 0;
  const labels = (task.labels || []).map(l => (l.name || l).toLowerCase());

  // Priority labels
  if (labels.some(l => l.includes('critical') || l.includes('p0'))) score += 100;
  if (labels.some(l => l.includes('high') || l.includes('p1'))) score += 50;
  if (labels.some(l => l.includes('security'))) score += 40;

  // Quick wins
  if (labels.some(l => l.includes('small') || l.includes('quick'))) score += 20;

  // Age (older bugs get priority)
  if (task.createdAt) {
    const ageInDays = (Date.now() - new Date(task.createdAt)) / 86400000;
    if (labels.includes('bug') && ageInDays > 30) score += 10;
  }

  return score;
}
```

### 阶段 4：通过 AskUserQuestion 向用户展示

**关键要求**：标签不得超过 30 个字符（OpenCode 限制）。

```javascript
function truncateLabel(num, title) {
  const prefix = `#${num}: `;
  const maxLen = 30 - prefix.length;
  return title.length > maxLen
    ? prefix + title.substring(0, maxLen - 1) + '...'
    : prefix + title;
}

const options = topTasks.slice(0, 5).map(task => ({
  label: truncateLabel(task.number, task.title),
  description: `Score: ${task.score} | ${(task.labels || []).slice(0, 2).join(', ')}`
}));

AskUserQuestion({
  questions: [{
    header: "Select Task",
    question: "Which task should I work on?",
    options,
    multiSelect: false
  }]
});
```

### 阶段 5：更新状态

```javascript
workflowState.updateState({
  task: {
    id: String(selectedTask.number),
    source: policy.taskSource?.source || policy.taskSource,
    title: selectedTask.title,
    description: selectedTask.body || '',
    labels: selectedTask.labels?.map(l => l.name || l) || [],
    url: selectedTask.url
  }
});

workflowState.completePhase({
  tasksAnalyzed: tasks.length,
  selectedTask: selectedTask.number
});
```

### 阶段 6：发布评论（仅限 GitHub）

**对于非 GitHub 来源（GitLab、本地、自定义），完全跳过此阶段。** 对 `github`、`gh-issues` 和 `gh-projects` 来源执行此阶段。

```bash
# Only run for GitHub sources (github, gh-issues, gh-projects). Use policy.taskSource?.source from Phase 1 to check.
gh issue comment "$TASK_ID" --body "[BOT] Workflow started for this issue."
```

## 输出格式

```markdown
## Task Selected

**Task**: #{id} - {title}
**Source**: {source}
**URL**: {url}

Proceeding to worktree setup...
```

## 错误处理

如果未找到任务：
1. 建议创建 issue
2. 建议运行 /audit-project
3. 建议使用 'all' 优先级筛选器

## 约束条件

- 必须使用 AskUserQuestion 进行任务选择（不能使用纯文本）
- 标签不得超过 30 个字符
- 排除已被其他工作流认领的任务
- 排除已有开放 PR 的 issue（GitHub 和 GitHub Projects 来源）
- PR 链接检测最多覆盖 100 个开放 PR（--limit 100 是获取上限）
- 仅保留排名前 5 的任务