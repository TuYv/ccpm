---
name: marketplace-publishing
description: Workflow for publishing skills and agents to the dotnet-skills Claude Code marketplace. Covers adding new content, updating plugin.json, validation, and release tagging.
invocable: true
---
# Marketplace 发布工作流

本技能文档介绍如何将技能和代理发布到 dotnet-skills Claude Code Marketplace。

## 仓库结构

```
dotnet-skills/
├── .claude-plugin/
│   ├── marketplace.json      # Marketplace catalog
│   └── plugin.json           # Plugin metadata + skill/agent registry
├── .github/workflows/
│   └── release.yml           # Release automation
├── skills/
│   ├── akka/                 # Akka.NET skills
│   │   ├── best-practices/SKILL.md
│   │   ├── testing-patterns/SKILL.md
│   │   └── ...
│   ├── aspire/               # .NET Aspire skills
│   ├── csharp/               # C# language skills
│   ├── testing/              # Testing framework skills
│   └── meta/                 # Meta skills
├── agents/
│   └── *.md                  # Agent definitions
└── scripts/
    └── validate-marketplace.sh
```

## 添加新技能

### 第 1 步：选择类别

技能按领域组织：

| 类别 | 用途 |
|----------|---------|
| `akka/` | Akka.NET Actor 模式、测试和集群 |
| `aspire/` | .NET Aspire 编排、测试和配置 |
| `csharp/` | C# 语言特性和编码标准 |
| `testing/` | 测试框架（xUnit、Playwright、Testcontainers） |
| `meta/` | 与此 Marketplace 相关的元技能 |

如果现有类别均不适用，请创建新的类别文件夹。

### 第 2 步：创建技能文件夹

创建一个文件夹，并在其中放置 `SKILL.md`：

```
skills/<category>/<skill-name>/SKILL.md
```

示例：`skills/akka/cluster-sharding/SKILL.md`

### 第 3 步：编写 SKILL.md

```markdown
---
name: my-new-skill
description: Brief description of what this skill does and when to use it.
---

# My New Skill

## When to Use This Skill

Use this skill when:
- [List specific scenarios]

---

## Content

[Comprehensive guide with examples, patterns, and anti-patterns]
```

**要求：**
- `name` 必须使用小写字母和连字符（例如 `cluster-sharding`）
- `description` 应使用 1 至 2 句话说明 Claude 应在何时使用此技能
- 内容应为 10-40KB，全面涵盖相关主题
- 包含采用现代 C# 模式的具体代码示例

### 第 4 步：在 plugin.json 中注册

将技能路径添加到 `.claude-plugin/plugin.json` 的 `skills` 数组中：

```json
{
  "skills": [
    "./skills/akka/best-practices",
    "./skills/akka/cluster-sharding"  // Add new skill here
  ]
}
```

### 第 5 步：验证

运行验证脚本：

```bash
./scripts/validate-marketplace.sh
```

### 第 6 步：一并提交

```bash
git add skills/akka/cluster-sharding/ .claude-plugin/plugin.json
git commit -m "Add cluster-sharding skill for Akka.NET Cluster Sharding patterns"
```

---

## 添加新代理

### 第 1 步：创建代理文件

在 `/agents/` 中创建一个 Markdown 文件：

```markdown
---
name: my-agent-name
description: Expert in [domain]. Specializes in [specific areas]. Use for [scenarios].
model: sonnet
color: blue
---

You are a [domain] specialist with deep expertise in [areas].

**Reference Materials:**
- [Official docs and resources]

**Core Expertise Areas:**
[List expertise areas]

**Diagnostic Approach:**
[How the agent analyzes problems]
```

**要求：**
- `name` 必须使用小写字母和连字符
- `model` 必须是以下值之一：`haiku`、`sonnet`、`opus`
- `color` 为可选项（用于 UI 显示）

### 第 2 步：在 plugin.json 中注册

添加到 `agents` 数组：

```json
{
  "agents": [
    "./agents/akka-net-specialist",
    "./agents/my-agent-name"  // Add new agent here
  ]
}
```

### 第 3 步：一并提交

```bash
git add agents/my-agent-name.md .claude-plugin/plugin.json
git commit -m "Add my-agent-name agent for [domain] expertise"
```

---

## 发布版本

### 版本控制

更新 `.claude-plugin/plugin.json` 中的版本：

```json
{
  "version": "1.1.0"
}
```

使用语义化版本控制（`MAJOR.MINOR.PATCH`）：
- **MAJOR**：破坏性变更（重命名或移除技能）
- **MINOR**：添加新技能或代理
- **PATCH**：修复或改进现有内容

### 发布流程

1. **更新 plugin.json 中的版本**

2. **验证**
   ```bash
   ./scripts/validate-marketplace.sh
   ```

3. **提交版本更新**
   ```bash
   git add .claude-plugin/plugin.json
   git commit -m "Bump version to 1.1.0"
   ```

4. **创建并推送标签**
   ```bash
   git tag v1.1.0
   git push origin master --tags
   ```

5. **GitHub Actions 将自动执行以下操作：**
   - 验证市场结构
   - 创建包含自动生成说明的 GitHub 发布版本

---

## 用户安装

用户安装完整插件（包括所有技能和代理）：

```bash
# Add the marketplace (one-time)
/plugin marketplace add Aaronontheweb/dotnet-skills

# Install the plugin (gets everything)
/plugin install dotnet-skills

# Update to latest version
/plugin marketplace update
```

---

## 验证清单

提交前：

- [ ] SKILL.md 包含有效的 YAML 前置元数据，其中含有 `name` 和 `description`
- [ ] 技能文件夹位于适当的分类下
- [ ] 路径已添加到 `plugin.json` 的技能数组中
- [ ] 对于代理：已指定 `model`（haiku/sonnet/opus）
- [ ] `./scripts/validate-marketplace.sh` 验证通过

---

## 故障排除

### 安装后技能未显示

- 验证 plugin.json 中的路径是否与文件夹结构匹配
- 检查文件夹中是否存在 SKILL.md
- 尝试重新安装：`/plugin uninstall dotnet-skills && /plugin install dotnet-skills`

### 验证错误

- 确保 JSON 有效：`jq . .claude-plugin/plugin.json`
- 检查数组中是否存在尾随逗号
- 验证所有引用的文件夹是否都包含 SKILL.md

### 未创建发布版本

- 确保标签遵循语义化版本格式（`v1.0.0`）
- 检查 GitHub Actions 日志中的错误
- 验证 plugin.json 版本是否与标签匹配