---
name: mcp-cli
description: Use MCP servers on-demand via the mcp CLI tool - discover tools, resources, and prompts without polluting context with pre-loaded MCP integrations
---
# MCP CLI：按需使用 MCP 服务器

使用 `mcp` CLI 工具动态发现并调用 MCP 服务器功能，无需将其预配置为永久集成。

## 何时使用此 Skill

在以下情况下使用此 Skill：
- 在决定是否使用某个 MCP 服务器之前探索其功能
- 对 MCP 服务器进行一次性调用，而无需永久集成
- 在不占用上下文窗口的情况下访问 MCP 功能
- 测试或调试 MCP 服务器
- 使用未预配置的 MCP 服务器

## 前置条件

`mcp` CLI 必须安装在 `~/.local/bin/mcp`。如果不存在：

```bash
# Clone and build
cd /tmp && git clone --depth 1 https://github.com/f/mcptools.git
cd mcptools && CGO_ENABLED=0 go build -o ~/.local/bin/mcp ./cmd/mcptools
```

始终确保 PATH 包含该二进制文件：
```bash
export PATH="$HOME/.local/bin:$PATH"
```

## 发现工作流

### 第 1 步：发现可用工具

```bash
mcp tools <server-command>
```

**示例：**
```bash
# Filesystem server
mcp tools npx -y @modelcontextprotocol/server-filesystem /path/to/allow

# Memory/knowledge graph server
mcp tools npx -y @modelcontextprotocol/server-memory

# GitHub server (requires token)
mcp tools docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server

# HTTP-based server
mcp tools https://example.com/mcp
```

### 第 2 步：发现资源（如果支持）

```bash
mcp resources <server-command>
```

资源是服务器公开的数据源（文件、数据库条目等）。

### 第 3 步：发现提示词（如果支持）

```bash
mcp prompts <server-command>
```

提示词是服务器提供的预定义提示词模板。

### 第 4 步：获取详细信息（JSON 格式）

```bash
# For full schema details including parameter types
mcp tools --format json <server-command>
mcp tools --format pretty <server-command>
```

## 调用工具

### 基本语法

```bash
mcp call <tool_name> --params '<json>' <server-command>
```

### 示例

**读取文件：**
```bash
mcp call read_file --params '{"path": "/tmp/example.txt"}' \
  npx -y @modelcontextprotocol/server-filesystem /tmp
```

**写入文件：**
```bash
mcp call write_file --params '{"path": "/tmp/test.txt", "content": "Hello world"}' \
  npx -y @modelcontextprotocol/server-filesystem /tmp
```

**列出目录：**
```bash
mcp call list_directory --params '{"path": "/tmp"}' \
  npx -y @modelcontextprotocol/server-filesystem /tmp
```

**创建实体（内存服务器）：**
```bash
mcp call create_entities --params '{"entities": [{"name": "Project", "entityType": "Software", "observations": ["Uses TypeScript"]}]}' \
  npx -y @modelcontextprotocol/server-memory
```

**搜索（内存服务器）：**
```bash
mcp call search_nodes --params '{"query": "TypeScript"}' \
  npx -y @modelcontextprotocol/server-memory
```

### 复杂参数

对于嵌套对象和数组，请确保使用有效的 JSON：

```bash
mcp call edit_file --params '{
  "path": "/tmp/file.txt",
  "edits": [
    {"oldText": "foo", "newText": "bar"},
    {"oldText": "baz", "newText": "qux"}
  ]
}' npx -y @modelcontextprotocol/server-filesystem /tmp
```

### 输出格式

```bash
# Table (default, human-readable)
mcp call <tool> --params '{}' <server>

# JSON (for parsing)
mcp call <tool> --params '{}' -f json <server>

# Pretty JSON (readable JSON)
mcp call <tool> --params '{}' -f pretty <server>
```

## 读取资源

```bash
# List available resources
mcp resources <server-command>

# Read a specific resource
mcp read-resource <resource-uri> <server-command>

# Alternative syntax
mcp call resource:<resource-uri> <server-command>
```

## 使用提示词

```bash
# List available prompts
mcp prompts <server-command>

# Get a prompt (may require arguments)
mcp get-prompt <prompt-name> <server-command>

# With parameters
mcp get-prompt <prompt-name> --params '{"arg": "value"}' <server-command>
```

## 服务器别名（用于重复使用）

如果在会话期间频繁使用某个服务器：

```bash
# Create alias
mcp alias add fs npx -y @modelcontextprotocol/server-filesystem /home/user

# Use alias
mcp tools fs
mcp call read_file --params '{"path": "README.md"}' fs

# List aliases
mcp alias list

# Remove when done
mcp alias remove fs
```

别名存储在 `~/.mcpt/aliases.json` 中。

## 身份验证

### HTTP 基本身份验证
```bash
mcp tools --auth-user "username:password" https://api.example.com/mcp
```

### Bearer 令牌
```bash
mcp tools --auth-header "Bearer your-token-here" https://api.example.com/mcp
```

### 环境变量（用于基于 Docker 的服务器）
```bash
mcp tools docker run -i --rm \
  -e GITHUB_PERSONAL_ACCESS_TOKEN="$GITHUB_TOKEN" \
  ghcr.io/github/github-mcp-server
```

## 传输类型

### Stdio（npx/node 命令的默认传输方式）
```bash
mcp tools npx -y @modelcontextprotocol/server-filesystem /tmp
```

### HTTP（对 http/https URL 自动检测）
```bash
mcp tools https://example.com/mcp
```

### SSE（服务器发送事件）
```bash
mcp tools http://localhost:3001/sse
# Or explicitly:
mcp tools --transport sse http://localhost:3001
```

## 常用 MCP 服务器

### 文件系统
```bash
# Allow access to specific directory
mcp tools npx -y @modelcontextprotocol/server-filesystem /path/to/allow
```

### 内存（知识图谱）
```bash
mcp tools npx -y @modelcontextprotocol/server-memory
```

### GitHub
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="your-token"
mcp tools docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server
```

### Brave 搜索
```bash
export BRAVE_API_KEY="your-key"
mcp tools npx -y @anthropic/mcp-server-brave-search
```

### Puppeteer（浏览器自动化）
```bash
mcp tools npx -y @anthropic/mcp-server-puppeteer
```

## 最佳实践

### 1. 始终先进行发现
在调用工具之前，运行 `mcp tools` 以了解有哪些可用工具以及确切的参数架构。

### 2. 使用 JSON 格式进行解析
当你需要以编程方式处理结果时：
```bash
mcp call <tool> --params '{}' -f json <server> | jq '.field'
```

### 3. 验证参数
表格输出会显示参数签名。请与其完全匹配：
- `param:str` = 字符串
- `param:num` = 数字
- `param:bool` = 布尔值
- `param:str[]` = 字符串数组
- `[param:str]` = 可选参数

### 4. 妥善处理错误
工具调用可能会失败。请检查退出代码和 stderr：
```bash
if ! result=$(mcp call tool --params '{}' server 2>&1); then
  echo "Error: $result"
fi
```

### 5. 对多步骤操作使用别名
如果要对同一服务器进行多次调用：
```bash
mcp alias add tmp-server npx -y @modelcontextprotocol/server-filesystem /tmp
mcp call list_directory --params '{"path": "/tmp"}' tmp-server
mcp call read_file --params '{"path": "/tmp/file.txt"}' tmp-server
mcp alias remove tmp-server
```

### 6. 使用 Guard 限制能力
为确保安全，请限制可访问的工具：
```bash
# Only allow read operations
mcp guard --allow 'tools:read_*,list_*' --deny 'tools:write_*,delete_*' \
  npx -y @modelcontextprotocol/server-filesystem /home
```

## 调试

### 查看服务器日志
```bash
mcp tools --server-logs <server-command>
```

### 检查别名配置
```bash
cat ~/.mcpt/aliases.json
```

### 详细输出
使用 `--format pretty` 获取详细的 JSON 输出，以调试参数问题。

## 快速参考

| 操作 | 命令 |
|--------|---------|
| 列出工具 | `mcp tools <server>` |
| 列出资源 | `mcp resources <server>` |
| 列出提示词 | `mcp prompts <server>` |
| 调用工具 | `mcp call <tool> --params '<json>' <server>` |
| 读取资源 | `mcp read-resource <uri> <server>` |
| 获取提示词 | `mcp get-prompt <name> <server>` |
| 添加别名 | `mcp alias add <name> <server-command>` |
| 删除别名 | `mcp alias remove <name>` |
| JSON 输出 | 添加 `-f json` 或 `-f pretty` |

## 示例：完整工作流

```bash
# 1. Discover what's available
mcp tools npx -y @modelcontextprotocol/server-filesystem /home/user/project

# 2. Check for resources
mcp resources npx -y @modelcontextprotocol/server-filesystem /home/user/project

# 3. Create alias for convenience
mcp alias add proj npx -y @modelcontextprotocol/server-filesystem /home/user/project

# 4. Explore directory structure
mcp call directory_tree --params '{"path": "/home/user/project"}' proj

# 5. Read specific files
mcp call read_file --params '{"path": "/home/user/project/README.md"}' proj

# 6. Search for patterns
mcp call search_files --params '{"path": "/home/user/project", "pattern": "**/*.ts"}' proj

# 7. Clean up alias
mcp alias remove proj
```

## 故障排除

### "command not found: mcp"
确保已设置 PATH：`export PATH="$HOME/.local/bin:$PATH"`

### JSON 解析错误
- 正确转义特殊字符
- 在 JSON 两侧使用单引号，以避免 shell 展开问题
- 对于复杂的 JSON，请写入临时文件并使用 `--params "$(cat params.json)"`

### 服务器超时
某些服务器需要一些时间才能启动。mcp CLI 会自动等待初始化完成。

### 权限被拒绝
对于文件系统服务器，请确保允许的目录路径正确且可访问。