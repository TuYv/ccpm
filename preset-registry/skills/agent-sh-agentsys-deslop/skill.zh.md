---
name: deslop
description: "Use when user wants to clean AI slop from code. Use for cleanup, remove debug statements, find ghost code, repo hygiene."
version: 5.1.0
argument-hint: "[report|apply] [--scope=all|diff|path] [--thoroughness=quick|normal|deep]"
---
# deslop

基于确定性检测结果和自动修复，清理代码中的 AI 垃圾内容。

## 解析参数

```javascript
const args = '$ARGUMENTS'.split(' ').filter(Boolean);
const mode = args.find(a => ['report', 'apply'].includes(a)) || 'report';
const scope = args.find(a => a.startsWith('--scope='))?.split('=')[1] || 'all';
const thoroughness = args.find(a => a.startsWith('--thoroughness='))?.split('=')[1] || 'normal';
```

## 输入

参数：`[report|apply] [--scope=<path>|all|diff] [--thoroughness=quick|normal|deep]`

- **模式**：`report`（默认）或 `apply`
- **范围**：要扫描的内容
  - `all`（默认）：整个代码库
  - `diff`：仅当前分支中已更改的文件
  - `<path>`：指定目录或文件
- **彻底程度**：分析深度（默认：`normal`）
  - `quick`：仅使用正则表达式模式
  - `normal`：增加多遍分析器
  - `deep`：如果可用，增加 CLI 工具（jscpd、madge）

## 检测流程

### 阶段 1：运行检测脚本

检测脚本位于相对于此 Skill 的 `../../scripts/detect.js`。

**运行检测**（使用相对于 Skill 目录的路径）：
```bash
# Scripts are at plugin root: ../../scripts/ from skills/deslop/
node ../../scripts/detect.js . --thoroughness normal --compact --max 50
```

**对于 diff 范围**（仅已更改的文件）：
```bash
BASE=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@' || echo "main")
# Use newline-separated list to safely handle filenames with special chars
git diff --name-only origin/${BASE}..HEAD | \
  xargs -d '\n' node ../../scripts/detect.js --thoroughness normal --compact
```

**注意**：相对路径 `../../scripts/detect.js` 从 `skills/deslop/` 向上导航至包含 `scripts/` 的插件根目录。

### 阶段 2：Repo-Map 增强（可选）

如果 repo-map 存在，则使用基于 AST 的分析增强检测：

```javascript
// Use relative path from skill directory to plugin lib
// Path: skills/deslop/ -> ../../lib/repo-map
const repoMap = require('../../lib/repo-map');

if (repoMap.exists(basePath)) {
  const map = repoMap.load(basePath);
  const usageIndex = repoMap.buildUsageIndex(map);

  // Find orphaned infrastructure with HIGH certainty
  const orphaned = repoMap.findOrphanedInfrastructure(map, usageIndex);
  for (const item of orphaned) {
    findings.push({
      file: item.file,
      line: item.line,
      pattern: 'orphaned-infrastructure',
      message: `${item.name} (${item.type}) is never used`,
      certainty: 'HIGH',
      severity: 'high',
      autoFix: false
    });
  }

  // Find unused exports
  const unusedExports = repoMap.findUnusedExports(map, usageIndex);
  for (const item of unusedExports) {
    findings.push({
      file: item.file,
      line: item.line,
      pattern: 'unused-export',
      message: `Export '${item.name}' is never imported`,
      certainty: item.certainty,
      severity: 'medium',
      autoFix: false
    });
  }
}
```

### 阶段 3：汇总并确定优先级

按以下顺序对检测结果排序：
1. **确定性**：HIGH 优先于 MEDIUM，MEDIUM 优先于 LOW
2. **严重程度**：high 优先于 medium，medium 优先于 low
3. **修复复杂度**：可自动修复的项目优先于需手动修复的项目

### 阶段 4：返回结构化结果

技能返回结构化 JSON——**不**应用修复（由编排器处理）。

## 输出格式

标记之间的 JSON 结构：

```
=== DESLOP_RESULT ===
{
  "mode": "report|apply",
  "scope": "all|diff|path",
  "filesScanned": N,
  "findings": [
    {
      "file": "src/api.js",
      "line": 42,
      "pattern": "debug-statement",
      "message": "console.log found",
      "certainty": "HIGH",
      "severity": "medium",
      "autoFix": true,
      "fixType": "remove-line"
    }
  ],
  "fixes": [
    {
      "file": "src/api.js",
      "line": 42,
      "fixType": "remove-line",
      "pattern": "debug-statement"
    }
  ],
  "summary": {
    "high": N,
    "medium": N,
    "low": N,
    "autoFixable": N
  }
}
=== END_RESULT ===
```

## 确定性级别

| 级别 | 含义 | 操作 |
|-------|---------|--------|
| **HIGH** | 确定是冗余内容，可安全自动修复 | 通过 simple-fixer 自动修复 |
| **MEDIUM** | 很可能是冗余内容，需要验证 | 先审查 |
| **LOW** | 可能是冗余内容，取决于上下文 | 仅标记 |

## 模式类别

### HIGH 确定性（可自动修复）

- `debug-statement`：console.log、console.debug、print、println!
- `debug-import`：未使用的调试/日志导入
- `placeholder-text`："Lorem ipsum"、"TODO: implement"
- `empty-catch`：没有注释的空 catch 块
- `trailing-whitespace`：行尾空白
- `mixed-indentation`：混用制表符和空格

### MEDIUM 确定性（需要审查）

- `excessive-comments`：注释/代码比例 > 2:1
- `doc-code-ratio`：JSDoc 长度 > 函数体的 3 倍
- `stub-function`：仅返回占位值
- `dead-code`：return/throw 之后无法执行的代码
- `infrastructure-without-impl`：创建了数据库客户端但从未使用

### LOW 确定性（仅标记）

- `over-engineering`：文件/导出比例 > 20x
- `buzzword-inflation`：没有证据支持的声明
- `shotgun-surgery`：经常一起更改的文件

## 修复类型

| 修复类型 | 操作 | 模式 |
|----------|--------|----------|
| `remove-line` | 删除行 | debug-statement、debug-import |
| `add-comment` | 添加说明 | empty-catch |
| `remove-block` | 删除代码块 | 带 TODO 的 stub-function |

## 错误处理

- **Git 不可用**：跳过依赖 git 的检查
- **无效作用域**：在 JSON 中返回错误
- **解析错误**：跳过文件并继续扫描

## 集成

此技能由以下项调用：
- `deslop-agent`，用于 `/deslop` 命令
- `/next-task` 阶段 8（审查前门禁），使用 `scope=diff`

编排器会生成 `simple-fixer` 来应用 HIGH 确定性的修复。