---
name: maintain-cross-platform
description: "Use when preparing releases, validating cross-platform compatibility, or updating installation infrastructure. Meta-skill for maintaining AgentSys's 3-platform architecture."
metadata:
  short-description: "Meta-skill: maintain 3-platform architecture"
  scope: local
  audience: repo-maintainers
---
# 维护跨平台架构

**目的：** 全面了解 AgentSys 的跨平台基础设施，以便进行发布准备、验证和维护。

**范围：** 仅适用于此仓库的 LOCAL skill。包含维护 Claude Code + OpenCode + Codex CLI 兼容性所需的具体文件位置、转换规则和自动化模式。

## 关键规则

1. **必须支持 3 个平台** - Claude Code、OpenCode、Codex CLI。无一例外。
2. **每次推送前都要验证** - Pre-push hook 会自动运行 6 个验证器。
3. **所有版本字段必须一致** - 共 11 个文件（package.json + 10 个 plugin.json 文件）。
4. **文档必须准确** - CI 会验证数量、路径和平台引用。
5. **更新此 skill** - 如果发现不一致或自动化机会，请更新此文件。

---

## 平台差异（完整矩阵）

### 配置

| 方面 | Claude Code | OpenCode | Codex CLI |
|--------|-------------|----------|-----------|
| **配置格式** | JSON | JSON/JSONC | TOML |
| **配置位置** | `~/.claude/settings.json` | `~/.config/opencode/opencode.json` | `~/.codex/config.toml` |
| **状态目录** | `.claude/` | `.opencode/` | `.codex/` |
| **命令前缀** | `/` | `/` | `$` |
| **项目指令** | `CLAUDE.md` | `AGENTS.md`（读取 CLAUDE.md） | `AGENTS.md` |

### 组件位置

| 组件 | Claude Code | OpenCode | Codex CLI |
|-----------|-------------|----------|-----------|
| **命令** | 插件 `commands/` | `~/.config/opencode/commands/` | 不适用（使用 skills） |
| **Agents** | 插件 `agents/` | `~/.config/opencode/agents/` | 不适用（使用 MCP） |
| **Skills** | 插件 `skills/` | `.opencode/skills/`（单数形式） | `~/.codex/skills/` |
| **Hooks** | 插件 `hooks/` | 插件 `hooks/` | 插件 `hooks/` |

### 安装位置（此仓库）

| 平台 | 软件包副本 | 命令 | Agents | Skills | 配置 |
|----------|--------------|----------|--------|--------|--------|
| Claude Code | 通过 marketplace | 随插件捆绑 | 随插件捆绑 | 随插件捆绑 | 不适用 |
| OpenCode | `~/.agentsys/` | `~/.config/opencode/commands/` | `~/.config/opencode/agents/`（29 个文件） | 不适用 | `~/.config/opencode/opencode.json` |
| Codex CLI | `~/.agentsys/` | 不适用 | 不适用 | `~/.codex/skills/`（9 个目录） | `~/.codex/config.toml` |

### Frontmatter 差异

**命令 Frontmatter：**

```yaml
# Claude Code
---
description: Task description
argument-hint: "[args]"
allowed-tools: Bash(git:*), Read, Task
---

# OpenCode (transformed by installer)
---
description: Task description
agent: general
# model field REMOVED (uses user's default model)
---

# Codex (skills use different format)
---
name: skill-name
description: "Use when user asks to \"trigger\". Does X."
---
```

**Agent Frontmatter：**

```yaml
# Claude Code
---
name: agent-name
description: Agent description
tools: Bash(git:*), Read, Edit, Task
model: sonnet
---

# OpenCode (transformed by installer)
---
name: agent-name
description: Agent description
mode: subagent
# model field REMOVED (OpenCode doesn't support per-agent models yet)
permission:
  read: allow
  edit: allow
  bash: ask
  task: allow
---
```

**转换规则（由 bin/cli.js 处理）：**

| Claude Code | OpenCode |
|-------------|----------|
| `tools: Bash(git:*)` | `permission: { bash: "allow" }` |
| `tools: Read` | `permission: { read: "allow" }` |
| `tools: Edit, Write` | `permission: { edit: "allow" }` |
| `tools: Task` | `permission: { task: "allow" }` |
| `model: sonnet/opus/haiku` | **已移除**（OpenCode 使用用户默认设置） |

**关键：** `bin/cli.js` 中的 `--strip-models` 标志会移除模型配置，以便无法使用全部三个模型层级的 OpenCode 用户使用。

---

## 文件位置（本仓库）

### 安装基础设施

| 文件 | 用途 |
|------|---------|
| `bin/cli.js` | 主安装程序（811 行）——处理全部 3 个平台 |
| `scripts/setup-hooks.js` | Git 钩子安装程序（pre-commit、pre-push） |
| `adapters/opencode-plugin/` | 原生 OpenCode TypeScript 插件 |
| `adapters/opencode/` | 生成的 OpenCode 命令、代理和技能 |
| `adapters/codex/` | 生成的 Codex 技能 |
| `mcp-server/index.js` | 跨平台 MCP 服务器 |

### 验证脚本（全部用于 CI + Pre-Push）

| 脚本 | 验证内容 | 退出码为 1 的情况 |
|--------|-------------------|-----------|
| `scripts/validate-plugins.js` | 插件结构、plugin.json 有效性 | plugin.json 无效 |
| `scripts/validate-cross-platform.js` | 3 平台兼容性 | 存在平台特定代码 |
| `scripts/validate-repo-consistency.js` | 仓库完整性 | 存在不一致 |
| `scripts/check-hardcoded-paths.js` | 不含硬编码的 `.claude/` 路径 | 发现硬编码路径 |
| `scripts/validate-counts.js` | 文档准确性（代理、插件、技能、版本） | 数量不匹配 |
| `scripts/validate-cross-platform-docs.js` | 平台文档一致性 | 文档存在冲突 |

### 转换映射（bin/cli.js）

**在 bin/cli.js 中搜索以下标记：**
- `PLUGINS_ARRAY` - 第 138 行 - 要为 Claude Code 安装的插件
- `OPENCODE_COMMAND_MAPPINGS` - 第 242 行 - 要为 OpenCode 复制的命令
- `CODEX_SKILL_MAPPINGS` - 约第 280 行 - 要为 Codex 创建的技能

**OPENCODE_COMMAND_MAPPINGS 格式：**
```javascript
['dest-file.md', 'plugin-name', 'source-file.md']
```

**CODEX_SKILL_MAPPINGS 格式：**
```javascript
['skill-name', 'plugin-name', 'source-file.md', 'Trigger description with "phrases"']
```

### 版本字段（共 11 个文件）

发布时，所有文件的版本必须相同：

1. `package.json` - 第 3 行
2. `.claude-plugin/plugin.json` - 根插件
3. `.claude-plugin/marketplace.json` - 9 个插件条目
4. `mcp-server/index.js` - 搜索：`MCP_SERVER_VERSION`
5-13. `plugins/*/. claude-plugin/plugin.json` - 全部 9 个插件

**快速检查：**
```bash
grep -r '"version"' package.json plugins/*/.claude-plugin/plugin.json .claude-plugin/plugin.json
```

---

## 发布流程（RC 和生产版本）

### RC 版本发布（3.X.0-rc.N）

**第 1 步：更新版本**
```bash
# Bump to RC version in ALL 11 files
NEW_VERSION="3.6.0-rc.1"

# package.json
npm version $NEW_VERSION --no-git-tag-version

# All plugin.json files (9 plugins + root)
find . -name "plugin.json" -path "*/.claude-plugin/*" -exec sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" {} \;

# mcp-server/index.js
sed -i '' "s/version: '.*'/version: '$NEW_VERSION'/" mcp-server/index.js
```

**步骤 2：更新 CHANGELOG.md**
```markdown
## [3.6.0-rc.1] - 2026-01-30

### Added
- Feature description

### Changed
- Change description

### Fixed
- Bug fix description
```

**步骤 3：验证**
```bash
npm run validate    # All 6 validators
npm test            # All tests
npm pack --dry-run  # Package builds
```

**步骤 4：提交并添加标签**
```bash
git add -A
git commit -m "chore: release v3.6.0-rc.1"
git tag v3.6.0-rc.1
git push origin main --tags
```

**步骤 5：验证**
```bash
# Wait for GitHub Actions
npm view agentsys@rc version  # Should show 3.6.0-rc.1
```

### 正式版本发布（3.X.0）

与 RC 相同，但需要：
- 从版本号中移除 `-rc.N` 后缀
- 使用 `v3.X.0` 添加标签（无后缀）
- npm 会自动发布到 `latest` 标签

---

## 每次发布时需要进行的更改

### 始终更新

1. **版本字段（11 个文件）** - 请参阅上面的“版本字段”部分
2. **CHANGELOG.md** - 在顶部添加新条目
3. **运行验证** - `npm run validate`（包括全部 6 个验证器）
4. **运行测试** - `npm test`（1400 多项测试）
5. **构建软件包** - `npm pack --dry-run`

### 如果添加了新命令

1. **基于约定的发现机制** - 自动从包含 `.claude-plugin/plugin.json` 的 `plugins/*/` 中发现插件
2. **自动发现命令** - 从 `plugins/*/commands/*.md` 文件中发现
3. **Codex 触发短语** - 在命令文件的 frontmatter 中使用 `codex-description`
4. **docs/INSTALLATION.md** - 添加 `/plugin install <name>@agentsys` 行
5. **.claude-plugin/marketplace.json** - 向 `plugins` 数组添加插件条目
6. **README.md** - 添加到命令表格
7. **验证会发现问题** - 如果数量不匹配（插件数量）

### 如果添加了新代理

1. **无需更改** - 安装程序会自动将代理复制到 OpenCode 的 `~/.config/opencode/agents/`
2. **Codex 使用 MCP** - 不直接支持代理，请改用 MCP 工具
3. **验证会发现问题** - 如果基于文件的代理数量发生变化

### 如果添加了新 Skill

1. **Codex 需要触发短语** - 描述必须包含“Use when user asks to...”
2. **验证会发现问题** - 如果 Skill 数量不匹配

### 如果添加了新 MCP 工具

1. **mcp-server/index.js** - 添加到 TOOLS 数组和 toolHandlers
2. **.claude-plugin/marketplace.json** - 添加到 `mcpServer.tools` 数组
3. **bin/cli.js** - 更新 MCP 工具的控制台输出（OpenCode + Codex）
4. **README.md** - 如果面向用户，则添加到 MCP 工具表格

### 如果更改了库模块

1. **lib/{module}/** - 进行更改
2. **lib/index.js** - 如果是新模块，则将其导出
3. **运行同步** - `./scripts/sync-lib.sh`（或 `agentsys-dev sync-lib`）会将 lib/ 复制到全部 9 个插件
4. **同时提交两者** - 提交 lib/ 中的源文件以及 plugins/*/lib/ 中的副本

---

## 平台特定的转换（bin/cli.js 的作用）

### OpenCode 转换

**1. 移除模型规范（如果使用 --strip-models）**
```javascript
// Original (Claude Code):
model: sonnet

// Transformed (OpenCode):
(field removed entirely)
```

**原因：** 并非所有 OpenCode 用户都有权访问全部三个模型层级。因此改用用户的默认模型。

**2. 将工具转换为权限**
```javascript
// Original:
tools: Bash(git:*), Read, Edit, Task

// Transformed:
permission:
  bash: allow
  read: allow
  edit: allow
  task: allow
```

**3. 替换环境变量**
```javascript
// Original:
${CLAUDE_PLUGIN_ROOT}

// Transformed:
${PLUGIN_ROOT}
```

**4. 规范化 require() 中的 Windows 路径**
```javascript
// Original:
require('${CLAUDE_PLUGIN_ROOT}/lib/module.js')

// Transformed:
require('${PLUGIN_ROOT}'.replace(/\\/g, '/') + '/lib/module.js')
```

**原因：** Windows 反斜杠（`C:\Users\...`）会破坏 JavaScript 字符串转义。

### Codex 转换

**1. 命令 → 技能转换**
```javascript
// Commands become skills with trigger phrases
// Original command: /next-task
// Becomes: $next-task with SKILL.md

// SKILL.md requires:
---
name: next-task
description: "Use when user asks to \"find next task\", \"automate workflow\". Master orchestrator."
---
```

**2. 智能体逻辑 → 内联到技能中**
- Codex 不直接支持智能体
- 将智能体工作流嵌入技能说明中
- 或使用 MCP 工具调用智能体逻辑

---

## 验证套件（推送前 + CI）

### validate:plugins
**文件：** `scripts/validate-plugins.js`
**检查项：**
- plugin.json 结构有效性
- 必填字段是否存在
- 声明的命令、智能体和技能是否存在

**在以下情况下以状态码 1 退出：** plugin.json 无效

### validate:cross-platform
**文件：** `scripts/validate-cross-platform.js`
**检查项：**
- 代码可在全部 3 个平台上运行
- 不存在特定于平台的假设
- 正确使用 AI_STATE_DIR

**在以下情况下以状态码 1 退出：** 检测到特定于平台的代码

### validate:consistency
**文件：** `scripts/validate-repo-consistency.js`
**检查项：**
- 仓库完整性
- 文件结构一致性

**在以下情况下以状态码 1 退出：** 发现不一致

### validate:paths
**文件：** `scripts/check-hardcoded-paths.js`
**检查项：**
- 智能体、命令和技能中不存在硬编码的 `.claude/` 路径
- 排除项：文档、enhance/ 中的 SKILL.md、RESEARCH.md、示例

**检测的模式：**
```regex
/\.claude\/(?!.*\(example\)|.*Platform|.*State directory)/
/\.opencode\/(?!.*\(example\)|.*Platform)/
/\.codex\/(?!.*\(example\)|.*Platform)/
```

**安全上下文（跳过）：**
- 文档表格（`| State Dir |`）
- 平台比较示例
- 技能文档（enhance/* SKILL.md）
- 检查清单引用

**在以下情况下以状态码 1 退出：** 在安全上下文之外发现硬编码路径

### validate:counts
**文件：** `scripts/validate-counts.js`
**检查项：**
- README、CLAUDE.md、AGENTS.md、package.json 和文档中的插件数量（9）
- 所有文档中的智能体数量（共 39 个 = 29 个基于文件的智能体 + 10 个基于角色的智能体）
- 所有文档中的技能数量（23）
- 版本一致性（package.json 与全部 10 个 plugin.json 文件一致）
- CLAUDE.md ↔ AGENTS.md 关键规则一致性（相似度 >90%）

**实际数量（文件系统）：**
- 插件：`plugins/` 中有 9 个目录
- 基于文件的智能体：`plugins/*/agents/` 中有 29 个 .md 文件
- 基于角色的智能体：10 个（来自 audit-project，以内联方式定义）
- 技能：`plugins/*/skills/*/SKILL.md` 中有 23 个 SKILL.md 文件

**智能验证：**
- 接受“39 个智能体”或“39 个智能体（29 个基于文件的智能体 + 10 个基于角色的智能体）”
- 跳过特定于插件的数量，例如“next-task（12 个智能体）”
- 仅验证顶层总数

**以下情况退出码为 1：** 数量不匹配或版本未对齐

### validate:platform-docs
**文件：** `scripts/validate-cross-platform-docs.js`
**检查项：**
- 命令前缀一致性（/ 与 $）
- 状态目录引用适用于对应平台
- 功能对等性（所有平台均记录全部 9 个命令）
- 安装说明保持一致
- MCP 服务器配置正确

**智能验证：**
- 跳过对比表格
- 跳过检查清单引用
- 跳过技能名称提及（例如 `enhance-claude-memory`）
- 跳过文档示例

**以下情况退出码为 1：** 存在平台冲突或缺少功能

---

## 推送前钩子（自动强制执行）

**文件：** `scripts/setup-hooks.js` → 创建 `.git/hooks/pre-push`

**阶段 1：验证套件**
```bash
npm run validate  # Runs all 6 validators
```
任何验证器失败时都会阻止推送。

**阶段 2：增强内容检查**
检测以下已修改文件：
- `agents/*.md`
- `skills/*/SKILL.md`
- `hooks/*.md`
- `prompts/*.md`

提示：“是否已对这些文件运行 /enhance？(y/N)”
如果选择“N”，则阻止推送（依据 CLAUDE.md 关键规则 #7）。

**阶段 3：发布标签验证**
如果正在推送版本标签（v*）：
- 运行 `npm test`
- 运行 `npm pack --dry-run`
- 任一命令失败都会阻止推送

**跳过钩子：** `git push --no-verify`（请谨慎使用）

---

## 安装程序深入解析（bin/cli.js）

### 交互式流程

1. **平台选择** - 多选：Claude Code、OpenCode、Codex CLI
2. **清理旧安装** - 如果 `~/.agentsys/` 存在，则将其删除
3. **复制软件包** - 从 npm 全局安装位置复制到 `~/.agentsys/`
4. **安装依赖项** - 在软件包和 mcp-server 中运行 `npm install --production`
5. **按平台安装：**
   - Claude Code：添加 marketplace，安装 9 个插件
   - OpenCode：复制命令和代理；更新配置；安装原生插件
   - Codex：创建带有触发短语的技能；更新配置

### 关键函数

**installForClaude()** - 第 116 行
- 添加 marketplace：`claude plugin marketplace add agent-sh/agentsys`
- 安装 9 个插件：`claude plugin install {plugin}@agentsys`
- 命令：/next-task、/ship、/deslop、/audit-project、/drift-detect、/enhance、/perf、/sync-docs、/repo-intel

**installForOpenCode(installDir, options)** - 第 165 行
- 创建目录：`~/.config/opencode/commands/`、`~/.config/opencode/plugins/agentsys.ts`
- 从 `adapters/opencode-plugin/` 复制原生插件
- 使用 `OPENCODE_COMMAND_MAPPINGS` 转换命令
- 转换代理（tools → permissions，如果指定 --strip-models 则移除 models）
- 使用 MCP 配置更新 `~/.config/opencode/opencode.json`

**installForCodex(installDir)** - 第 330+ 行
- 创建目录：`~/.codex/skills/`
- 使用 `CODEX_SKILL_MAPPINGS` 创建 SKILL.md 文件
- 每个技能都会获得触发短语描述
- 使用 MCP 配置更新 `~/.codex/config.toml`

### 命令映射（OpenCode）

**OPENCODE_COMMAND_MAPPINGS** - 约第 242 行：
```javascript
const commandMappings = [
  ['deslop.md', 'deslop', 'deslop.md'],
  ['enhance.md', 'enhance', 'enhance.md'],
  ['next-task.md', 'next-task', 'next-task.md'],
  ['delivery-approval.md', 'next-task', 'delivery-approval.md'],
  ['sync-docs.md', 'sync-docs', 'sync-docs.md'],
  ['audit-project.md', 'audit-project', 'audit-project.md'],
  ['drift-detect.md', 'drift-detect', 'drift-detect.md'],
  ['repo-intel.md', 'repo-intel', 'repo-intel.md'],
  ['perf.md', 'perf', 'perf.md'],
  ['ship.md', 'ship', 'ship.md']
];
```

### Skill 映射（Codex）

**CODEX_SKILL_MAPPINGS** - 约第 280 行起：
```javascript
const skillMappings = [
  ['next-task', 'next-task', 'next-task.md',
    'Use when user asks to "find next task", "automate workflow". Master workflow orchestrator.'],
  ['ship', 'ship', 'ship.md',
    'Use when user asks to "create PR", "ship changes", "merge PR". Complete PR workflow.'],
  // ... 7 more
];
```

---

## 添加新功能（分步说明）

### 新命令（例如 /my-command）

**1. 创建命令文件：**
```bash
plugins/my-plugin/commands/my-command.md
```

**2. 更新 bin/cli.js 中的 3 处位置：**

**a) PLUGINS_ARRAY（如果是新插件）：**
```javascript
// Line ~138
const plugins = ['next-task', 'ship', ..., 'my-plugin'];
```

**b) OPENCODE_COMMAND_MAPPINGS：**
```javascript
// Line ~242
['my-command.md', 'my-plugin', 'my-command.md'],
```

**c) CODEX_SKILL_MAPPINGS：**
```javascript
// Line ~280
['my-command', 'my-plugin', 'my-command.md',
  'Use when user asks to "trigger phrase". Description of capability.'],
```

**3. 更新 marketplace.json：**
```json
// .claude-plugin/marketplace.json - Add to plugins array
{
  "name": "my-plugin",
  "version": "3.5.0",
  "description": "...",
  "path": "plugins/my-plugin"
}
```

**4. 创建 plugin.json：**
```bash
plugins/my-plugin/.claude-plugin/plugin.json
```

**5. 更新文档：**
- `docs/INSTALLATION.md` - 添加安装命令
- `README.md` - 添加到命令表
- CHANGELOG.md - 添加到 "Added" 下

**6. 验证：**
```bash
npm run validate  # Will catch missing mappings
```

### 新 Agent（例如 my-agent）

**1. 创建 Agent 文件：**
```bash
plugins/my-plugin/agents/my-agent.md
```

使用正确的 frontmatter：
```yaml
---
name: my-agent
description: Brief description
tools: Bash(git:*), Read, Edit
model: sonnet
---
```

**2. 安装程序会自动处理：**
- ✅ 复制到 `~/.config/opencode/agents/my-agent.md`
- ✅ 转换 frontmatter（tools → permissions）
- ✅ 如果使用 --strip-models 标志，则移除 model
- ✅ 规范化 require() 中的 Windows 路径

**3. 无需更改 Codex** - Codex 使用 MCP，而非 Agent

**4. 验证：**
```bash
npm run validate:counts  # Will update agent count if added
```

### 新 Skill（例如 my-skill）

**1. 创建 Skill 目录和文件：**
```bash
plugins/my-plugin/skills/my-skill/SKILL.md
```

使用以下 frontmatter：
```yaml
---
name: my-skill
description: "Use when user asks to \"trigger\". Description."
metadata:
  short-description: "Brief"
---
```

**2. 如果可由用户调用（Codex）：**
添加到 bin/cli.js 中的 CODEX_SKILL_MAPPINGS

**3. 验证：**
```bash
npm run validate:counts  # Will check skill count matches
```

### 新 MCP 工具

**1. 添加到 mcp-server/index.js：**

**a) TOOLS 数组：**
```javascript
const TOOLS = [
  // ...
  {
    name: 'my_tool',
    description: 'Tool description',
    inputSchema: {
      type: 'object',
      properties: { param: { type: 'string' } },
      required: ['param']
    }
  }
];
```

**b) toolHandlers 对象：**
```javascript
const toolHandlers = {
  // ...
  my_tool: async (params) => {
    // Implementation
    return xplat.successResponse({ result: 'data' });
  }
};
```

**2. 更新 marketplace.json：**
```json
// .claude-plugin/marketplace.json
"mcpServer": {
  "tools": ["workflow_status", ..., "my_tool"]
}
```

**3. 更新文档：**
- `README.md` - 如果是面向用户的功能，请将其添加到功能列表中

---

## 常见发布陷阱（以及验证器如何发现它们）

### 陷阱 1：忘记更新插件版本
```bash
# Symptoms:
- package.json says 3.6.0
- plugins/next-task/.claude-plugin/plugin.json says 3.5.0

# Caught by:
npm run validate:counts
# → [ERROR] Version misalignment
```

### 陷阱 2：硬编码 .claude/ 路径
```bash
# Symptoms:
- Agent contains: `.claude/flow.json`
- OpenCode and Codex break

# Caught by:
npm run validate:paths
# → [ERROR] Hardcoded path found in agents/my-agent.md:42
```

### 陷阱 3：智能体数量不匹配
```bash
# Symptoms:
- Added new agent
- README still says "39 agents"
- Actually 40 now

# Caught by:
npm run validate:counts
# → [ERROR] README.md agents: Expected 40, Actual 39
```

### 陷阱 4：缺少触发短语（Codex）
```bash
# Symptoms:
- Codex skill has: description: "Master orchestrator"
- No trigger phrases
- Codex doesn't know when to invoke

# Caught by:
/enhance --focus=skills
# → [MEDIUM] Description missing trigger phrases
```

### 陷阱 5：OpenCode 标签过长
```bash
# Symptoms:
- AskUserQuestion label: "#123: Fix authentication timeout in ProfileScreen component"
- 65 characters
- OpenCode throws error

# Prevention:
Use truncateLabel() function in task-discoverer agent
Max 30 chars for OpenCode compatibility
```

### 陷阱 6：忘记运行 /enhance
```bash
# Symptoms:
- Modified agents/skills
- Didn't run /enhance
- Pushed anyway

# Caught by:
Pre-push hook prompts: "Have you run /enhance? (y/N)"
Blocks push if "N"
```

---

## 自动化机会（始终应予以考虑）

### 当前已有的自动化

1. ✅ **lib/ 同步** - 预提交钩子会自动将 lib/ 同步到 plugins/
2. ✅ **验证** - 预推送钩子会运行 6 个验证器
3. ✅ **智能体转换** - 安装程序会自动转换 frontmatter
4. ✅ **模型字段移除** - 用于 OpenCode 的 `--strip-models` 标志
5. ✅ **版本检查** - validate:counts 可发现版本不一致
6. ✅ **路径检查** - validate:paths 可发现硬编码路径
7. ✅ **/enhance 强制执行** - 预推送钩子会提示确认

### 潜在改进

**1. 版本升级自动化**
```bash
# Current: Manual find/replace in 11 files
# Opportunity: Script that updates all version fields atomically
# Script: scripts/bump-version.js <new-version>
```

**2. CHANGELOG 条目生成**
```bash
# Current: Manual entry creation
# Opportunity: Parse git log since last tag, categorize commits
# Script: scripts/generate-changelog-entry.js
```

**3. 跨平台安装测试**
```bash
# Current: Manual testing on each platform
# Opportunity: Docker containers for each platform, automated smoke tests
# Script: scripts/test-install-all-platforms.sh
```

**4. 自动更新智能体数量**
```bash
# Current: Manual count updates in docs
# Opportunity: Extract counts from filesystem, update docs automatically
# Script: scripts/update-doc-counts.js
```

**5. Marketplace.json 同步**
```bash
# Current: Manual updates to .claude-plugin/marketplace.json
# Opportunity: Generate from plugins/ directory structure
# Script: scripts/sync-marketplace-manifest.js
```

**如果你发现更多自动化机会，请将它们添加到此处。**

---

## 你的职责（使用此 Skill 的 Agent）

### 推送前

1. **运行验证：**
   ```bash
   npm run validate
   ```
   修复发现的所有问题。

2. **如果修改了增强内容（agents/skills/hooks/prompts）：**
   ```bash
   /enhance
   ```
   处理确定性为 HIGH 的发现。

3. **检查此 Skill 中是否存在不一致：**
   - 添加了新脚本，但此处未记录？
   - 发现了新的平台差异？
   - 需要新的验证模式？
   - 如果是，请更新此文件

4. **考虑自动化：**
   - 这个手动步骤能否自动化？
   - 是否存在我们正在重复执行的模式？
   - 添加到“潜在改进”部分

### 发布前

1. **阅读发布检查清单：**
   ```bash
   cat checklists/release.md
   ```

2. **更新全部 11 个版本字段：**
   - 使用版本升级脚本（如果存在），或手动查找并替换
   - 验证：`npm run validate:counts`

3. **更新 CHANGELOG.md：**
   - 在顶部添加带日期的条目
   - 分类：Added/Changed/Fixed/Removed

4. **运行完整验证：**
   ```bash
   npm test                  # 1400+ tests
   npm run validate          # All 6 validators
   npm pack --dry-run        # Package builds
   ```

5. **测试跨平台安装：**
   ```bash
   npm pack
   npm install -g ./agentsys-*.tgz
   echo "1 2 3" | agentsys  # Test installer
   ```

6. **提交并添加标签：**
   ```bash
   git add -A
   git commit -m "chore: release v3.X.0-rc.N"
   git tag v3.X.0-rc.N
   git push origin main --tags
   ```

7. **验证 npm 发布：**
   ```bash
   # Wait for GitHub Actions release workflow
   npm view agentsys@rc version  # For RC
   npm view agentsys version     # For production
   ```

### 更新不一致之处

如果你在工作时发现以下任一情况：

**此处未记录的新脚本：**
1. 阅读脚本以了解其作用
2. 将其添加到相关部分（验证套件、安装等）
3. 提交：`"docs(maintain-cross-platform): document {script-name}"`

**发现新的平台差异：**
1. 在全部 3 个平台上测试以确认
2. 添加到“平台差异”矩阵
3. 如果会导致问题，则添加到“常见陷阱”
4. 如有需要，更新相关验证脚本

**需要新的验证模式：**
1. 考虑：能否扩展现有验证器？
2. 如果需要新的验证器，请在 `scripts/validate-{name}.js` 中创建
3. 添加到 `package.json` 的 validate 脚本
4. 在“验证套件”部分记录
5. 如果相关，更新“推送前 Hook”部分

**发现自动化机会：**
1. 添加到“潜在改进”部分并附上说明
2. 估算工作量（简单/中等/复杂）
3. 注明依赖项（所需工具、所需测试）

---

## 快速参考：文件数量

**插件：** 9
1. next-task
2. enhance
3. ship
4. perf
5. audit-project
6. deslop
7. drift-detect
8. repo-intel
9. sync-docs

**代理：** 共 39 个 = 29 个基于文件的代理 + 10 个基于角色的代理

**基于文件（29）：** 统计 `plugins/*/agents/*.md` 中的文件
- next-task：12
- enhance：9
- perf：6
- drift-detect：1
- repo-intel：1

**基于角色（10）：** 在 audit-project 命令中内联定义
- code-quality-reviewer, security-expert, performance-engineer, test-quality-guardian
- architecture-reviewer, database-specialist, api-designer
- frontend-specialist, backend-specialist, devops-reviewer

**技能：** 23 个——统计 `plugins/*/skills/*/SKILL.md` 中的 SKILL.md
- next-task：1（discover-tasks）
- prepare-delivery：4（prepare-delivery, check-test-coverage, orchestrate-review, validate-delivery）
- enhance：10（orchestrator, reporter, agent-prompts, claude-memory, docs, plugins, prompts, hooks, skills）
- perf：8（analyzer, baseline, benchmark, code-paths, investigation-logger, profile, theory, theory-tester）
- drift-detect：1（drift-analysis）
- repo-intel：1（repo-intel）

**版本字段：** 11 个文件
- 1x package.json
- 1x .claude-plugin/plugin.json
- 9x plugins/*/.claude-plugin/plugin.json
- 1x mcp-server/index.js（MCP_SERVER_VERSION 常量）

---

## 约束条件

- **绝不能破坏现有功能**——这是一个拥有真实用户的生产项目
- **始终在全部 3 个平台上进行测试**——至少执行冒烟测试
- **始终更新此技能**——如果发现缺漏或改进之处
- **始终运行验证**——推送前钩子会强制执行此要求
- **文档必须保持准确**——验证器会强制执行此要求

---

## 输出格式

使用此技能时，输出：

```markdown
## Cross-Platform Compatibility Check

### Validations Run
- [OK/ERROR] validate:plugins
- [OK/ERROR] validate:cross-platform
- [OK/ERROR] validate:consistency
- [OK/ERROR] validate:paths
- [OK/ERROR] validate:counts
- [OK/ERROR] validate:platform-docs

### Issues Found
[List any issues with file:line references]

### Misalignments in This Skill
[List any outdated information found in this skill]

### Automation Opportunities
[List any manual steps that could be automated]

### Actions Taken
[List files updated/created]

### Next Steps
[List remaining work]
```

---

## 版本

**技能版本：** 1.0.0
**最后更新：** 2026-01-30
**涵盖范围：** AgentSys v5.0.0 架构

**在以下情况下更新此技能：**
- 添加新平台
- 创建新的验证脚本
- 安装流程发生变化
- 实现新的自动化
- 发现平台差异