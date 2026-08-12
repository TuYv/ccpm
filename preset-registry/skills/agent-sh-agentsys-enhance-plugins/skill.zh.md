---
name: enhance-plugins
description: "Use when analyzing plugin structures, MCP tools, and plugin security patterns."
version: 5.1.0
argument-hint: "[path] [--fix]"
---
# enhance-plugins

根据最佳实践分析插件结构、MCP 工具和安全模式。

## 解析参数

```javascript
const args = '$ARGUMENTS'.split(' ').filter(Boolean);
const targetPath = args.find(a => !a.startsWith('--')) || '.';
const fix = args.includes('--fix');
```

## 插件位置

| 平台 | 位置 |
|----------|----------|
| Claude Code | `plugins/*/`、`.claude-plugin/plugin.json` |
| OpenCode | `.opencode/plugins/`，MCP 位于 `opencode.json` |
| Codex | MCP 位于 `~/.codex/config.toml` |

## 工作流程

1. **发现** - 在 `plugins/` 目录中查找插件
2. **加载** - 读取 `plugin.json`、代理、命令和技能
3. **分析** - 按确定性级别运行模式检查
4. **报告** - 生成 Markdown 输出
5. **修复** - 如果指定了 `--fix`，则应用自动修复（仅限高确定性问题）

## 检测模式

### 1. 工具 Schema 设计（高）

基于函数调用最佳实践：

**必需元素：**
```json
{
  "name": "verb_noun",
  "description": "What it does. When to use. What it returns.",
  "input_schema": {
    "type": "object",
    "properties": {
      "param": {
        "type": "string",
        "description": "Format and example"
      }
    },
    "required": ["param"],
    "additionalProperties": false
  }
}
```

**“实习生测试”** - 如果只看到描述，其他人能否使用此工具？

| 问题 | 确定性 | 自动修复 |
|-------|-----------|----------|
| 缺少 `additionalProperties: false` | 高 | 是 |
| 缺少 `required` 数组 | 高 | 是 |
| 缺少工具描述 | 高 | 否 |
| 缺少参数描述 | 中 | 否 |
| 名称含糊（`search`、`process`） | 中 | 否 |

### 2. 描述质量（高）

**工具描述必须包括：**
- 函数的作用
- 何时使用（触发上下文）
- 返回的内容

```json
// Bad - vague
"description": "Search for things"

// Good - complete
"description": "Search product catalog by keyword. Use for inventory queries or price checks. Returns matching products with prices."
```

**参数描述必须包括：**
- 格式要求
- 示例值
- 与其他参数的关系

```json
// Bad
"query": { "type": "string" }

// Good
"query": {
  "type": "string",
  "description": "Search keywords. Supports AND/OR. Example: 'laptop AND gaming'"
}
```

### 3. Schema 结构（中）

| 问题 | 重要性 |
|-------|----------------|
| 嵌套过深（>2 层） | 降低生成质量 |
| 受约束值缺少枚举 | 允许出现无效状态 |
| 数字没有最小值/最大值 | 输入不受限制 |
| 每个插件包含 >20 个工具 | 增加错误率 |

**优先采用扁平结构：**
```json
// Bad - nested
{ "config": { "settings": { "timeout": 30 } } }

// Good - flat
{ "timeout_seconds": 30 }
```

### 4. 插件结构（高）

**必需文件：**
```
plugin-name/
├── .claude-plugin/
│   └── plugin.json      # name, version, description
├── commands/            # User-invokable commands
├── agents/              # Subagent definitions
├── skills/              # Reusable skill implementations
└── package.json         # Optional, for npm plugins
```

**plugin.json 验证：**
- `name`：小写，使用 kebab-case
- `version`：semver 格式（`^\d+\.\d+\.\d+$`）
- `description`：说明插件提供的功能

**版本同步：** 如果存在 package.json，plugin.json 的版本必须与其一致。

### 5. MCP 服务器模式（MEDIUM）

对于公开 MCP 工具的插件：

**传输类型：**
- `stdio` - 标准输入/输出（最常见）
- `http` - HTTP/SSE 传输

**配置：**
```json
{
  "mcp": {
    "server-name": {
      "type": "local",
      "command": ["node", "path/to/server.js"],
      "environment": { "KEY": "value" },
      "enabled": true
    }
  }
}
```

**安全原则：**
- 访问数据须征得用户同意
- 未经批准不得传输数据
- 工具描述是不可信的输入

### 6. 安全模式（HIGH）

**HIGH 确定性问题：**
| 模式 | 风险 | 检测方式 |
|---------|------|-----------|
| 不受限制的 `Bash` | 命令执行 | `tools:.*Bash[^(]` |
| 命令注入 | Shell 转义 | 命令中的 `\${.*}` |
| 路径遍历 | 文件访问 | 路径中的 `\.\.\/` |
| 硬编码密钥 | 凭据泄露 | API 密钥、密码 |

**MEDIUM 确定性问题：**
| 模式 | 风险 |
|---------|------|
| 过于宽泛的文件访问权限 | 数据外泄 |
| 缺少输入验证 | 注入攻击 |
| 工具未设置超时 | 资源耗尽 |

**必须进行输入验证：**
```javascript
// Validate before execution
function validateToolInput(params, schema) {
  // Type validation
  // Range validation (min/max)
  // Enum validation
  // Format validation (regex patterns)
}
```

### 7. 错误处理（MEDIUM）

工具应返回结构化错误：
```json
{
  "type": "tool_result",
  "tool_use_id": "id",
  "content": "Error: [TYPE]. [WHAT]. [SUGGESTION].",
  "is_error": true
}
```

**重试指南：**
- 瞬时错误（429、503）：指数退避
- 验证错误（400）：不重试，返回错误
- 超时：可配置，默认为 30 秒

### 8. 工具数量（LOW）

**“少即是多”方法：**
- 研究表明，减少工具数量可将准确率提高多达 89%
- 每个任务上下文限制为 3-5 个相关工具
- 对于大型工具集，考虑动态加载工具

## 自动修复

| 问题 | 修复方式 |
|-------|-----|
| 缺少 `additionalProperties` | 添加 `"additionalProperties": false` |
| 缺少 `required` | 将所有属性添加到 required 数组 |
| 版本不匹配 | 同步 plugin.json 与 package.json |

## 输出格式

```markdown
## Plugin Analysis: {name}

**Files scanned**: {count}

| Certainty | Count |
|-----------|-------|
| HIGH | {n} |
| MEDIUM | {n} |

### Tool Schema Issues
| Tool | Issue | Fix | Certainty |

### Structure Issues
| File | Issue | Certainty |

### Security Issues
| File | Line | Issue | Certainty |
```

## 模式统计

| 类别 | 模式数 | 确定性 |
|----------|----------|-----------|
| 工具模式 | 5 | HIGH |
| 描述 | 2 | HIGH |
| 模式结构 | 4 | MEDIUM |
| 插件结构 | 3 | HIGH |
| MCP 模式 | 2 | MEDIUM |
| 安全性 | 6 | HIGH/MEDIUM |
| 错误处理 | 2 | MEDIUM |
| 工具数量 | 1 | LOW |
| **总计** | **25** | - |

<examples>
### 架构严格性
<bad_example>
```json
{
  "properties": { "path": { "type": "string" } }
}
```
</bad_example>
<good_example>
```json
{
  "properties": { "path": { "type": "string", "description": "File path" } },
  "required": ["path"],
  "additionalProperties": false
}
```
</good_example>

### 工具描述
<bad_example>
```json
"description": "Search for things"
```
</bad_example>
<good_example>
```json
"description": "Search product catalog by keyword. Use for inventory or price queries. Returns products with prices."
```
</good_example>

### 安全性
<bad_example>
```yaml
tools: Read, Bash  # Unrestricted
```
</bad_example>
<good_example>
```yaml
tools: Read, Bash(git:*)  # Scoped
```
</good_example>
</examples>

## 参考资料

- `agent-docs/FUNCTION-CALLING-TOOL-USE-REFERENCE.md` - 工具架构、描述和安全性
- `agent-docs/CLAUDE-CODE-REFERENCE.md` - 插件结构、MCP 配置
- `agent-docs/OPENCODE-REFERENCE.md` - OpenCode MCP 集成
- `agent-docs/CODEX-REFERENCE.md` - Codex MCP 配置

## 约束条件

- 仅自动修复确定性为 HIGH 的问题
- 安全警告仅供参考，不要自动修复
- 保留现有的 plugin.json 字段
- 切勿修改工具行为，只修改架构定义