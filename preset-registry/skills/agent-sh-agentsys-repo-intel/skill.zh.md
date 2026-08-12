---
name: repo-intel
description: "Use when user asks to \"run repo intel\", \"generate repo map\", \"analyze repo\", \"query hotspots\", \"check ownership\", or \"bus factor\". Unified static analysis - git history, AST symbols, project metadata."
argument-hint: "[action] [--force]"
---
# Repo Intel 技能

通过 agent-analyzer 提供统一的静态分析——包括 Git 历史智能分析、AST 符号映射和项目元数据。

## 解析参数

```javascript
const args = '$ARGUMENTS'.split(' ').filter(Boolean);
const action = args.find(a => !a.startsWith('--')) || 'status';
const force = args.includes('--force');
```

## 主要职责

1. 按需**初始化**（`/repo-intel init`）
2. **增量更新**（`/repo-intel update`）
3. **查询** Git 历史数据（`/repo-intel query hotspots`）
4. **检查状态**和数据是否过时（`/repo-intel status`）
5. 使用 map-validator 代理**验证输出**

## 核心数据约定

Repo intel 数据存储在平台状态目录中：

- Claude Code：`.claude/repo-intel.json`、`.claude/repo-map.json`
- OpenCode：`.opencode/repo-intel.json`、`.opencode/repo-map.json`
- Codex CLI：`.codex/repo-intel.json`、`.codex/repo-map.json`

## 行为规则

- 未经用户明确同意，**绝不**安装依赖项
- 初始化或更新后，**始终**使用 `map-validator` 验证输出
- 除非数据已过时或历史记录被重写，否则**优先**进行增量更新

## 何时建议使用 Repo Intel

如果用户请求进行漂移检测、文档对齐或仓库分析，但缺少 repo-intel 数据：

```
Repo intel data not found. For better analysis, run:
  /repo-intel init
```

## 过时信号

- 找不到数据对应的提交（已变基）
- 分支已更改
- Git 钩子已标记为过时
- 落后于 HEAD 的提交

## 输出要求

保持输出简洁：

- **init/update**：文件数、符号数、提交、警告
- **query**：格式化的查询结果
- **status**：过时状态、落后的提交数、最后更新时间