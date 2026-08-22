---
name: setup-context7-mcp
description: Guide for setup Context7 MCP server to load documentation for specific technologies.
argument-hint: List of languages and frameworks to load documentation for
---
用户输入：

```text
$ARGUMENTS
```

# Context7 MCP 服务器设置指南

## 1. 确定设置范围

询问用户希望将配置存储在哪里：

**选项：**

1. **项目级别（通过 git 共享）** - 配置由版本控制系统跟踪，并与团队共享
   - CLAUDE.md 更新位置：`./CLAUDE.md`

2. **项目级别（个人偏好）** - 配置保留在本地，不由 git 跟踪
   - CLAUDE.md 更新位置：`./CLAUDE.local.md`
   - 验证这些文件是否已列在 `.gitignore` 中，如果没有，则将它们添加进去

3. **用户级别（全局）** - 配置应用于该用户的所有项目
   - CLAUDE.md 更新位置：`~/.claude/CLAUDE.md`

保存用户的选择，并在后续步骤中使用相应的路径。

## 2. 检查 Context7 MCP 服务器是否已设置

通过发起请求，检查你是否能够访问 Context7 MCP 服务器。

如果不能，请加载 <https://raw.githubusercontent.com/upstash/context7/refs/heads/master/README.md> 文件，并指导用户完成适用于相应代理/操作系统的设置流程。

## 3. 更新 CLAUDE.md 文件

使用在步骤 1 中确定的路径：

- 解析用户输入；如果输入为空，则读取当前项目结构和所使用的技术；如果项目为空，则要求用户提供计划在此项目中使用的语言和框架列表。
- 通过 Context7 MCP 搜索相关技术文档
- 使用以下内容更新相应的 CLAUDE.md 文件：

```markdown
### Use Context7 MCP for Loading Documentation

Context7 MCP is available to fetch up-to-date documentation with code examples.

**Recommended library IDs**:

- `[doc-id]` - short description of documentation

```