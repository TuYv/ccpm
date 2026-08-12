---
name: sync-docs
description: "Sync documentation with code. Use when user asks to update docs, check docs, fix stale documentation, update changelog, or after code changes."
version: 5.1.0
argument-hint: "[report|apply] [--scope=all|recent|before-pr] [--include-undocumented]"
allowed-tools: Bash(git:*), Read, Grep, Glob
---
# sync-docs

用于将文档与代码状态保持同步的统一技能。将发现、分析和 CHANGELOG 更新整合到单一工作流中。

## 解析参数

```javascript
const args = '$ARGUMENTS'.split(' ').filter(Boolean);
const mode = args.find(a => ['report', 'apply'].includes(a)) || 'report';
const scope = args.find(a => a.startsWith('--scope='))?.split('=')[1] || 'recent';
const includeUndocumented = args.includes('--include-undocumented');
```

## 快速开始 - Agent 指令

**步骤 1**：获取已更改的文件（使用 Bash）：
```bash
# Recent changes (default scope)
git diff --name-only origin/main..HEAD 2>/dev/null || git diff --name-only HEAD~5..HEAD

# Or for all files
git ls-files '*.md'
```

**步骤 2**：查找引用已更改文件的文档（使用 Grep）：
- 在 `*.md` 文件中搜索文件名、函数名和类名
- 检查 README.md、CHANGELOG.md、docs/*.md

**步骤 3**：分析每份文档中存在的问题：
- 版本不匹配（将文档版本与 package.json 进行比较）
- 已移除的导出项（文档中存在但代码中不存在的符号）
- 过时的代码示例
- 导入路径变更

**步骤 4**：检查 CHANGELOG：
- 查找 `## [Unreleased]` 章节
- 将最近的提交消息与 CHANGELOG 条目进行比较

**步骤 5**：如果 repo-map 存在（`{stateDir}/repo-map.json` - 平台状态目录）：
- 加载它以获取准确的导出项列表
- 查找任何文档中均未提及的导出项
- 将其报告为 `undocumented-export` 问题

## 输入

参数：`[report|apply] [--scope=all|recent|before-pr] [--include-undocumented]`

- **模式**：`report`（默认）或 `apply`
- **范围**：
  - `recent`（默认）：自上次提交到 main 以来发生更改的文件
  - `all`：根据所有代码扫描所有文档
  - `before-pr`：当前分支中的文件，针对 /next-task 阶段 11 进行了优化
- **--include-undocumented**：查找任何文档中均未提及的导出项（使用 repo-map）

## 架构

此技能负责协调所有文档同步操作：

```
sync-docs skill
    |-- Phase 1: Detect project context
    |-- Phase 2: Find related docs (lib/collectors/docs-patterns)
    |-- Phase 3: Analyze issues
    |-- Phase 3.5: Find undocumented exports (repo-map integration)
    |-- Phase 4: Check CHANGELOG
    |-- Phase 5: Return structured results
```

此技能绝不能直接应用修复。它会返回结构化数据，由编排器决定如何处理。

---

## 实现细节（参考）

以下章节仅供参考，描述内部 JavaScript 实现。Agent 应使用 Bash、Read 和 Grep 工具，按照上面的快速开始指令操作。

### 阶段 1：检测项目上下文

检测项目类型并查找文档文件。

### 阶段 1.5：确保 Repo-Map 可用

在分析问题之前，确保 repo-map 可用，以便准确检测符号：

```javascript
const { ensureRepoMap } = require('../../lib/collectors/docs-patterns');

// Try to get repo-map (will auto-init if ast-grep available)
const repoMapStatus = await ensureRepoMap({
  cwd: process.cwd(),
  askUser: async (opts) => {
    // Use AskUserQuestion tool
    const answer = await AskUserQuestion({
      question: opts.question,
      header: opts.header,
      options: opts.options
    });
    return answer;
  }
});

if (repoMapStatus.installInstructions) {
  // User wants to install ast-grep, show instructions
  console.log(repoMapStatus.installInstructions);
  // Wait for user to confirm installation, then retry
}

// repoMapStatus.available indicates if repo-map can be used
// repoMapStatus.fallbackReason explains why if not available
```

**用户交互（仅当未安装 ast-grep 时）：**

使用 AskUserQuestion：
- Header: "需要 ast-grep"
- Question: "未找到 ast-grep。是否安装以提高文档同步的准确性？"
- Options:
  - "是，显示安装说明" - 显示特定于平台的安装说明
  - "否，使用正则表达式回退方案" - 继续使用准确性较低、基于正则表达式的检测方式

如果用户拒绝安装或 repo-map 不可用，系统会自动回退到基于正则表达式的导出检测。

```javascript
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Detect documentation files
const docFiles = [];
const commonDocs = ['README.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'docs/**/*.md'];

for (const pattern of commonDocs) {
  // Use glob to find matching files
  const matches = glob.sync(pattern, { cwd: process.cwd() });
  docFiles.push(...matches);
}

// Detect project type from package.json, Cargo.toml, go.mod, etc.
let projectType = 'unknown';
if (fs.existsSync('package.json')) projectType = 'javascript';
else if (fs.existsSync('Cargo.toml')) projectType = 'rust';
else if (fs.existsSync('go.mod')) projectType = 'go';
else if (fs.existsSync('pyproject.toml') || fs.existsSync('setup.py')) projectType = 'python';

const context = { docFiles, projectType };
```

此阶段无需外部脚本即可收集项目的相关上下文。

## 阶段 2：查找相关文档

使用 lib/collectors/docs-patterns 查找与已更改文件相关的文档：

```javascript
// Use relative path from skill directory to plugin lib
// Path: skills/sync-docs/ -> ../../lib
const { collectors } = require('../../lib');
const docsPatterns = collectors.docsPatterns;

// Get changed files based on scope
let changedFiles;
if (scope === 'all') {
  changedFiles = await exec("git ls-files '*.js' '*.ts' '*.py' '*.go' '*.rs' '*.java'");
} else if (scope === 'before-pr') {
  changedFiles = await exec("git diff --name-only origin/main..HEAD");
} else {
  // recent (default): get the default branch name
  let base = 'main';
  try {
    const { stdout: refOutput } = await exec("git symbolic-ref refs/remotes/origin/HEAD");
    // Parse "refs/remotes/origin/branch-name" to extract "branch-name"
    const rawBase = refOutput.trim().split('/').pop();
    // Sanitize branch name to prevent shell injection (only allow alphanumeric, dash, underscore, dot)
    if (/^[a-zA-Z0-9._-]+$/.test(rawBase)) {
      base = rawBase;
    }
  } catch (e) {
    base = 'main'; // fallback to main if symbolic-ref fails
  }
  changedFiles = await exec(`git diff --name-only origin/${base}..HEAD 2>/dev/null || git diff --name-only HEAD~5..HEAD`);
}

// Find related docs
const relatedDocs = docsPatterns.findRelatedDocs(changedFiles.split('\n').filter(Boolean), {
  cwd: process.cwd()
});
```

## 阶段 3：分析文档问题

检查每份相关文档是否存在问题：

```javascript
const allIssues = [];

for (const { doc, referencedFile } of relatedDocs) {
  const issues = docsPatterns.analyzeDocIssues(doc, referencedFile, {
    cwd: process.cwd()
  });

  issues.forEach(issue => {
    allIssues.push({
      ...issue,
      doc,
      referencedFile
    });
  });
}
```

检测到的问题类型：
- `outdated-version`：版本字符串与当前版本不匹配
- `removed-export`：引用了已移除的符号
- `code-example`：代码示例可能已过时
- `import-path`：导入路径已更改
- `undocumented-export`：代码中存在导出，但任何文档中均未提及（需要 repo-map）

## 阶段 4：检查 CHANGELOG

```javascript
const changelogResult = docsPatterns.checkChangelog(changedFiles.split('\n').filter(Boolean), {
  cwd: process.cwd()
});

// changelogResult contains:
// - exists: boolean
// - hasUnreleased: boolean
// - documented: string[]
// - undocumented: string[]
// - suggestion: string | null
```

## 阶段 5：返回结构化结果

将所有结果合并为单个输出：

```json
{
  "mode": "report|apply",
  "scope": "recent|all|before-pr|path",
  "context": {
    "projectType": "javascript|python|rust|go|unknown",
    "docFiles": ["README.md", "CHANGELOG.md"]
  },
  "repoMap": {
    "available": true,
    "fallbackReason": null,
    "stats": { "files": 142, "symbols": 847 }
  },
  "discovery": {
    "changedFilesCount": 5,
    "relatedDocsCount": 3,
    "relatedDocs": [
      { "doc": "README.md", "referencedFile": "src/api.js", "referenceTypes": ["filename", "import"] }
    ]
  },
  "issues": [
    {
      "type": "outdated-version",
      "severity": "low",
      "doc": "README.md",
      "line": 15,
      "current": "1.0.0",
      "expected": "1.1.0",
      "autoFix": true,
      "suggestion": "Update version from 1.0.0 to 1.1.0"
    }
  ],
  "undocumentedExports": [
    {
      "type": "undocumented-export",
      "severity": "low",
      "file": "src/utils.js",
      "name": "formatDate",
      "line": 25,
      "certainty": "MEDIUM",
      "suggestion": "Export 'formatDate' in src/utils.js is not mentioned in any documentation"
    }
  ],
  "fixes": [
    {
      "file": "README.md",
      "type": "update-version",
      "line": 15,
      "search": "1.0.0",
      "replace": "1.1.0"
    }
  ],
  "changelog": {
    "exists": true,
    "hasUnreleased": true,
    "undocumented": ["feat: add new feature"],
    "status": "needs-update|ok"
  },
  "summary": {
    "issueCount": 3,
    "fixableCount": 2,
    "bySeverity": { "high": 0, "medium": 1, "low": 2 }
  }
}
```

## 输出格式

在标记之间以 JSON 格式输出结果：

```
=== SYNC_DOCS_RESULT ===
{JSON output}
=== END_RESULT ===
```

## Agent 使用方式

### sync-docs-agent（独立运行 `/sync-docs`）

```
Skill: sync-docs
Args: report --scope=recent
```

### `/next-task` 阶段 11

```
Skill: sync-docs
Args: apply --scope=before-pr
```

编排器接收结构化结果，并在需要修复时生成 `simple-fixer`。

## 约束

1. **默认为报告模式** - 除非明确处于应用模式，否则绝不修改文件
2. **结构化输出** - 始终在标记之间返回 JSON
3. **不直接修复** - 返回修复指令，由编排器决定
4. **保留格式** - 修复建议应保留现有风格
5. **仅限安全更改** - 只有可自动修复的问题才生成修复条目

## 错误处理

- **没有 git**：退出并报错 "Git required for change detection"
- **未找到文档**：报告空的 docFiles，建议创建 README.md
- **没有变更的文件**：将 scope 报告为 "empty"，建议使用 --scope=all