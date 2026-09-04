---
name: plugin-forge
description: Create and manage Claude Code plugins with proper structure, manifests, and marketplace integration. Use when creating plugins for a marketplace, adding plugin components (commands, agents, hooks), bumping plugin versions, or working with plugin.json/marketplace.json manifests.
---
# CC Plugin Forge

## 用途

以正确的结构、清单（manifest）和 marketplace 集成方式来构建和管理 Claude Code 插件。包含工作流、自动化脚本和参考文档。

## 何时使用

- 为 marketplace 创建新插件
- 添加/修改插件组件（commands、skills、agents、hooks）
- 更新插件版本
- 处理插件或 marketplace 清单
- 搭建本地插件测试
- 发布插件

## 快速开始

### 创建新插件

使用 `create_plugin.py` 生成插件结构：

```bash
python scripts/create_plugin.py plugin-name \
  --marketplace-root /path/to/marketplace \
  --author-name "Your Name" \
  --author-email "your.email@example.com" \
  --description "Plugin description" \
  --keywords "keyword1,keyword2" \
  --category "productivity"
```

该脚本会自动：

- 创建插件目录结构
- 生成 `plugin.json` 清单
- 创建 README 模板
- 更新 `marketplace.json`

### 更新版本号

使用 `bump_version.py` 同时更新两份清单中的版本：

```bash
python scripts/bump_version.py plugin-name major|minor|patch \
  --marketplace-root /path/to/marketplace
```

语义化版本：

- **major**：破坏性变更（1.0.0 → 2.0.0）
- **minor**：新功能、重构（1.0.0 → 1.1.0）
- **patch**：错误修复、文档更新（1.0.0 → 1.0.1）

## 开发工作流

### 1. 创建结构

手动方式（如果不使用脚本）：

```bash
mkdir -p plugins/plugin-name/.claude-plugin
mkdir -p plugins/plugin-name/commands
mkdir -p plugins/plugin-name/skills
```

### 2. 插件清单

文件：`plugins/plugin-name/.claude-plugin/plugin.json`

```json
{
  "name": "plugin-name",
  "version": "0.1.0",
  "description": "Plugin description",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "keywords": ["keyword1", "keyword2"]
}
```

### 3. 在 Marketplace 中注册

更新 `.claude-plugin/marketplace.json`：

```json
{
  "name": "plugin-name",
  "source": "./plugins/plugin-name",
  "description": "Plugin description",
  "version": "0.1.0",
  "keywords": ["keyword1", "keyword2"],
  "category": "productivity"
}
```

### 4. 添加组件

在对应的目录中创建：

| 组件 | 位置 | 格式 |
|-----------|----------|--------|
| Commands | `commands/` | 带 frontmatter 的 Markdown |
| Skills | `skills/<name>/` | 包含 `SKILL.md` 的目录 |
| Agents | `agents/` | Markdown 定义 |
| Hooks | `hooks/hooks.json` | 事件处理器 |
| MCP 服务器 | `.mcp.json` | 外部集成 |

### 5. 本地测试

```bash
# Add marketplace
/plugin marketplace add /path/to/marketplace-root

# Install plugin
/plugin install plugin-name@marketplace-name

# After changes: reinstall
/plugin uninstall plugin-name@marketplace-name
/plugin install plugin-name@marketplace-name
```

## 插件模式

### 框架插件

用于提供针对特定框架（React、Vue 等）的指导：

```
plugins/framework-name/
├── .claude-plugin/plugin.json
├── skills/
│   └── framework-name/
│       ├── SKILL.md
│       └── references/
├── commands/
│   └── prime/
│       ├── components.md
│       └── framework.md
└── README.md
```

### 工具插件

用于工具和命令：

```
plugins/utility-name/
├── .claude-plugin/plugin.json
├── commands/
│   ├── action1.md
│   └── action2.md
└── README.md
```

### 领域插件

用于特定领域的知识：

```
plugins/domain-name/
├── .claude-plugin/plugin.json
├── skills/
│   └── domain-name/
│       ├── SKILL.md
│       ├── references/
│       └── scripts/
└── README.md
```

## 命令命名

基于子目录的命名空间，使用 `:` 作为分隔符：

- `commands/namespace/command.md` → `/namespace:command`
- `commands/simple.md` → `/simple`

示例：

- `commands/prime/vue.md` → `/prime:vue`
- `commands/docs/generate.md` → `/docs:generate`

## 版本管理

**重要：** 必须**同时**在两处更新版本：

1. `plugins/<name>/.claude-plugin/plugin.json`
2. `.claude-plugin/marketplace.json`

使用 `bump_version.py` 可将此过程自动化。

## Git 提交

使用约定式提交（conventional commits）：

```bash
git commit -m "feat: add new plugin"
git commit -m "fix: correct plugin manifest"
git commit -m "docs: update plugin README"
git commit -m "feat!: breaking change"
```

## 参考文档

包含以下详细文档：

| 参考文档 | 内容 |
|-----------|---------|
| `references/plugin-structure.md` | 目录结构、清单 schema、组件 |
| `references/marketplace-schema.md` | Marketplace 格式、插件条目、分发 |
| `references/workflows.md` | 分步工作流、模式、发布流程 |

### 脚本

| 脚本 | 用途 |
|--------|---------|
| `scripts/create_plugin.py` | 为新插件搭建脚手架 |
| `scripts/bump_version.py` | 更新版本 |
