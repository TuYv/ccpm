---
name: consult
description: "Cross-tool AI consultation. Use when user asks to 'consult gemini', 'ask codex', 'get second opinion', 'cross-check with claude', 'consult another AI', 'ask opencode', 'copilot opinion', or wants a second opinion from a different AI tool."
version: 5.1.0
argument-hint: "[question] [--tool] [--effort] [--model] [--context] [--continue]"
---
# consult

跨工具 AI 咨询：查询另一个 AI CLI 工具并返回响应。

## 使用场景

在以下情况下调用此技能：
- 用户希望从其他 AI 工具获得第二意见
- 用户要求咨询、询问 gemini/codex/claude/opencode/copilot 或使用它们进行交叉检查
- 用户需要比较多个 AI 工具的响应
- 用户希望使用外部 AI 验证某项决策

## 参数

从 `$ARGUMENTS` 中解析：

| 标志 | 值 | 默认值 | 说明 |
|------|--------|---------|-------------|
| `--tool` | gemini, codex, claude, opencode, copilot | （选择器） | 目标工具 |
| `--effort` | low, medium, high, max | medium | 思考投入程度 |
| `--model` | 任意模型名称 | （根据投入程度确定） | 覆盖模型选择 |
| `--context` | diff, file=PATH, none | none | 自动包含上下文 |
| `--continue` | （标志）或 SESSION_ID | false | 恢复之前的会话 |

问题文本是 `$ARGUMENTS` 中除上述标志之外的所有内容。

## 提供商配置

### Claude

```
Command: env -u CLAUDECODE claude -p "QUESTION" --output-format json --model "MODEL" --max-turns TURNS --allowedTools "Read,Glob,Grep"
Session resume: --resume "SESSION_ID"
```

模型：claude-haiku-4-5、claude-sonnet-4-6、claude-opus-4-6

| 投入程度 | 模型 | 最大轮数 |
|--------|-------|-----------|
| low | claude-haiku-4-5 | 1 |
| medium | claude-sonnet-4-6 | 3 |
| high | claude-opus-4-6 | 5 |
| max | claude-opus-4-6 | 10 |

**解析输出**：`JSON.parse(stdout).result`
**会话 ID**：`JSON.parse(stdout).session_id`
**可继续会话**：是
**ACP 适配器**：`npx -y @anthropic-ai/claude-code-acp`（参见 ACP 传输部分）

### Gemini

```
Command: gemini -p "QUESTION" --output-format json -m "MODEL"
Session resume: --resume "SESSION_ID"
```

模型：gemini-2.5-flash、gemini-2.5-pro、gemini-3-flash-preview、gemini-3-pro-preview、gemini-3.1-pro-preview

| 投入程度 | 模型 |
|--------|-------|
| low | gemini-3-flash-preview |
| medium | gemini-3-flash-preview |
| high | gemini-3.1-pro-preview |
| max | gemini-3.1-pro-preview |

**解析输出**：`JSON.parse(stdout).response`
**会话 ID**：`JSON.parse(stdout).session_id`
**可继续会话**：是（通过 `--resume`）
**ACP 适配器**：`gemini`（原生 ACP——Gemini CLI 与 ACP 兼容）

### Codex

```
Command: codex exec "QUESTION" --json -m "MODEL" {SKIP_GIT_FLAG} -c model_reasoning_effort="LEVEL"
Session resume: codex exec resume "SESSION_ID" "QUESTION" --json -m "MODEL" {SKIP_GIT_FLAG} -c model_reasoning_effort="LEVEL"
Session resume (latest): codex exec resume --last "QUESTION" --json -m "MODEL" {SKIP_GIT_FLAG} -c model_reasoning_effort="LEVEL"
```

注意：`codex exec` 是非交互式/无头模式。不存在 `-q` 标志。TUI 模式是 `codex`（无子命令）。
`{SKIP_GIT_FLAG}` 由命令构建步骤 1b 中的信任门控解析：
- 位于受信任的 git 仓库内：空字符串
- 在受信任的非仓库环境中执行：`--skip-git-repo-check`

模型：gpt-5.3-codex

| 投入程度 | 模型 | 推理程度 |
|--------|-------|-----------|
| low | gpt-5.3-codex | low |
| medium | gpt-5.3-codex | medium |
| high | gpt-5.3-codex | high |
| max | gpt-5.3-codex | high |

**解析输出**：`JSON.parse(stdout).message` 或原始文本
**会话 ID**：Codex 会在会话结束时输出恢复提示（例如 `codex resume SESSION_ID`）。从 stdout 中提取会话 ID；如果可用，也可以从 `JSON.parse(stdout).session_id` 中提取。
**可继续**：是。会话以 JSONL rollout 文件的形式存储在 `~/.codex/sessions/` 中。非交互式恢复使用 `codex exec resume "SESSION_ID" "follow-up prompt" --json -m "MODEL" {SKIP_GIT_FLAG} -c model_reasoning_effort="LEVEL"`。使用 `--last` 代替会话 ID 可恢复最近的会话。
**ACP 适配器**：`npx -y @zed-industries/codex-acp`（参见 ACP 传输部分）

### OpenCode

```
Command: opencode run "QUESTION" --format json --model "MODEL" --variant "VARIANT"
Session resume: opencode run "QUESTION" --format json --model "MODEL" --variant "VARIANT" --continue (most recent) or --session "SESSION_ID"
With thinking: add --thinking flag
```

模型：通过提供商支持 75+ 个模型（格式：`provider/model`）。主要提供商：`opencode/`（免费）、`github-copilot/`、`amazon-bedrock/`、`google/`。示例：`github-copilot/gemini-3.1-pro-preview`、`opencode/big-pickle`、`amazon-bedrock/anthropic.claude-opus-4-6-v1`。运行 `opencode models` 可列出所有模型。

免费模型：`opencode/big-pickle`、`opencode/gpt-5-nano`、`opencode/minimax-m2.5-free`、`opencode/trinity-large-preview-free`

| 工作强度 | 模型 | 变体 |
|--------|-------|---------|
| low | （用户选择或默认） | low |
| medium | （用户选择或默认） | medium |
| high | （用户选择或默认） | high |
| max | （用户选择或默认） | high + --thinking |

**解析输出**：OpenCode 输出以换行符分隔的 JSON 事件。每一行都是一个包含 `type` 字段的 JSON 对象。从 `type === "text"` 的事件中提取响应文本——文本位于 `part.text` 中（**而不是** `part.content`）。将 `type: "text"` 事件中的所有 `part.text` 值拼接起来。事件类型：`step_start`、`tool_use`、`text`、`step_finish`。`sessionID` 位于每个事件的顶层 `sessionID` 字段中。

**会话 ID**：可通过每个事件中的 `event.sessionID` 获取（例如 `ses_xxxxx`）。使用 `--session SESSION_ID` 恢复会话。
**可继续**：是（通过 `--continue` 或 `--session`）。会话存储在 OpenCode 数据目录中的 SQLite 数据库里。使用 `--session SESSION_ID` 恢复指定会话，或使用 `--continue` 恢复最近的会话。
**ACP 适配器**：`opencode acp`（参见 ACP 传输部分）

### Copilot

```
Command: copilot -p "QUESTION"
```

模型：claude-sonnet-4-6（默认）、claude-opus-4-6、claude-haiku-4-5、gpt-5

| 工作强度 | 说明 |
|--------|-------|
| all | 不提供工作强度控制。可通过 --model 标志选择模型。 |

**解析输出**：stdout 中的原始文本
**可继续**：否
**ACP 适配器**：`copilot --acp --stdio`（参见 ACP 传输部分）

### Kiro

```
ACP-only provider. No CLI mode for external consultation.
Command: node acp/run.js --provider="kiro" --question-file="{AI_STATE_DIR}/consult/question.tmp" --timeout=120000
```

Kiro 仅可通过 ACP 传输使用。它要求 `kiro-cli` 位于 PATH 中。

**解析输出**：通过 ACP runner（`JSON.parse(stdout)`）
**可继续**：否
**ACP 适配器**：`kiro-cli acp`（原生 ACP）

## 输入验证

在构建命令之前，验证所有用户提供的参数：

- **--tool**：必须是以下值之一：gemini、codex、claude、opencode、copilot、kiro。拒绝所有其他值。
- **--effort**：必须是以下值之一：low、medium、high、max。默认为 medium。
- **--model**：允许任意字符串，但需在命令中为其添加引号。
- **--continue=SESSION_ID**：如果提供，SESSION_ID 必须匹配 `^(?!-)[A-Za-z0-9._:-]+$`。拒绝包含空格、前导连字符或 shell 元字符的值。
- **--context=file=PATH**：必须解析为项目目录内的路径。拒绝 cwd 之外的绝对路径。附加检查：
  1. **阻止 UNC 路径**（Windows）：拒绝以 `\\` 或 `//` 开头的路径（网络共享）
  2. **解析规范路径**：使用 Read 工具读取文件（不要使用 shell 命令）。读取前，解析路径：拼接 `cwd + PATH`，然后进行规范化（折叠 `.``、`..`，解析符号链接）
  3. **验证包含关系**：解析后的规范路径必须以当前工作目录开头。如果路径发生逃逸（通过 `..`、符号链接或联接点），则拒绝并返回：`[ERROR] Path escapes project directory: {PATH}`
  4. **禁止 shell 访问**：仅使用 Read 工具读取文件内容。绝不要将用户提供的路径传递给 shell 命令（防止通过路径值进行注入）

## 命令构建

根据解析后的参数，构建完整的 CLI 命令。所有用户提供的值都必须在 shell 命令中加引号，以防止注入。

### 步骤 1：解析模型

如果指定了 `--model`，则直接使用它。否则，使用上方提供商表中基于 effort 的模型。

### 步骤 1b：Codex `--skip-git-repo-check` 的信任门控

在使用任何 Codex 模板之前，通过此门控解析 `{SKIP_GIT_FLAG}`：

1. 验证咨询任务在当前项目工作目录（即调用 `/consult` 的同一工作区）中运行，而不是在任意外部路径中运行。
2. 验证解析后的当前工具是 Codex（通过 flag、NLP、picker 或恢复的 `--continue` 会话确定）。
3. 在当前工作目录中运行 `git rev-parse --is-inside-work-tree`：
   - 如果为 true：将 `{SKIP_GIT_FLAG}` 设置为空字符串
   - 如果为 false 且检查 1-2 已通过：将 `{SKIP_GIT_FLAG}` 设置为 `--skip-git-repo-check`
4. 如果检查 1-2 失败，则拒绝执行并返回 `[ERROR] Refusing Codex --skip-git-repo-check outside trusted working directory`。

此 skill 中的 Codex 模板假定此信任门控已经通过。

### 步骤 2：构建命令字符串

使用提供商配置部分中的命令模板。将 QUESTION、MODEL、TURNS、LEVEL、VARIANT 和 SKIP_GIT_FLAG 替换为解析后的字面值。
`{SKIP_GIT_FLAG}` 必须仅由步骤 1b 设置。不要从继承的 shell 环境中读取 `SKIP_GIT_FLAG`。

如果继续某个会话：
- **Claude 或 Gemini**：将 `--resume "SESSION_ID"` 追加到命令。
- **Codex**：使用 `codex exec resume "SESSION_ID" "QUESTION" --json -m "MODEL" {SKIP_GIT_FLAG} -c model_reasoning_effort="LEVEL"`，而不是标准命令。对于最近的会话，使用 `--last` 代替会话 ID。
- **OpenCode**：将 `--session SESSION_ID` 追加到命令。如果未保存 session_id，则改用 `--continue`（恢复最近的会话）。
如果 OpenCode 使用 max effort：追加 `--thinking`。

### 第 3 步：上下文打包

如果指定 `--context=diff`：运行 `git diff 2>/dev/null`，并将输出添加到问题前面。
如果指定 `--context=file=PATH`：使用 Read 工具读取文件，并将其内容添加到问题前面。

### 第 4 步：安全传递问题

绝对不能将用户提供的问题文本插入 shell 命令字符串中。仅进行 shell 转义是不够的——即使在双引号内，`$()`、反引号和其他扩展序列也可能执行任意命令。

**必需的方法——通过标准输入或临时文件传递问题：**

1. **将问题写入**临时文件，使用 Write 工具（例如 `{AI_STATE_DIR}/consult/question.tmp`）

   平台状态目录：
   - Claude Code：`.claude/`
   - OpenCode：`.opencode/`
   - Codex CLI：`.codex/`
2. **构建命令**，使用临时文件作为输入，而不是内联文本：

| 提供方 | 安全命令模式 |
|----------|---------------------|
| Claude | `env -u CLAUDECODE claude -p - --output-format json --model "MODEL" --max-turns TURNS --allowedTools "Read,Glob,Grep" < "{AI_STATE_DIR}/consult/question.tmp"` |
| Claude（恢复会话） | `env -u CLAUDECODE claude -p - --output-format json --model "MODEL" --max-turns TURNS --allowedTools "Read,Glob,Grep" --resume "SESSION_ID" < "{AI_STATE_DIR}/consult/question.tmp"` |
| Gemini | `gemini -p - --output-format json -m "MODEL" < "{AI_STATE_DIR}/consult/question.tmp"` |
| Gemini（恢复会话） | `gemini -p - --output-format json -m "MODEL" --resume "SESSION_ID" < "{AI_STATE_DIR}/consult/question.tmp"` |
| Codex | `codex exec "$(cat "{AI_STATE_DIR}/consult/question.tmp")" --json -m "MODEL" {SKIP_GIT_FLAG} -c model_reasoning_effort="LEVEL"`（Codex exec 不支持标准输入模式——cat 从平台控制的路径读取，而不是从用户输入中读取） |
| Codex（恢复会话） | `codex exec resume "SESSION_ID" "$(cat "{AI_STATE_DIR}/consult/question.tmp")" --json -m "MODEL" {SKIP_GIT_FLAG} -c model_reasoning_effort="LEVEL"` |
| Codex（恢复最近会话） | `codex exec resume --last "$(cat "{AI_STATE_DIR}/consult/question.tmp")" --json -m "MODEL" {SKIP_GIT_FLAG} -c model_reasoning_effort="LEVEL"` |
| OpenCode | `opencode run - --format json --model "MODEL" --variant "VARIANT" < "{AI_STATE_DIR}/consult/question.tmp"` |
| OpenCode（按 ID 恢复会话） | `opencode run - --format json --model "MODEL" --variant "VARIANT" --session "SESSION_ID" < "{AI_STATE_DIR}/consult/question.tmp"` |
| OpenCode（恢复最近会话） | `opencode run - --format json --model "MODEL" --variant "VARIANT" --continue < "{AI_STATE_DIR}/consult/question.tmp"` |
| Copilot | `copilot -p - < "{AI_STATE_DIR}/consult/question.tmp"` |

3. 命令执行完成后（无论成功还是失败），**删除临时文件**。始终进行清理，以防止文件不断累积。

**模型和会话 ID 值**是受控字符串（来自选择器或已保存的状态），可以安全地直接在命令中用引号括起来。只有问题包含任意用户文本，因此需要采用临时文件方法。临时文件路径（`{AI_STATE_DIR}/consult/question.tmp`）使用平台控制的目录和固定文件名——路径中不包含用户输入。

## 提供商检测

跨平台工具检测：

- **Windows**：`where.exe TOOL 2>nul` -- 找到时返回 0
- **Unix**：`which TOOL 2>/dev/null` -- 找到时返回 0

检查每个工具（claude、gemini、codex、opencode、copilot、kiro），并仅返回可用的工具。

## ACP 传输

ACP（Agent Client Protocol，智能体客户端协议）是 CLI 子进程调用之外的另一种传输方式。ACP 可用时，会通过所有主流 AI 编码工具均支持的通用协议，提供结构化的 JSON-RPC 2.0 通信、会话持久化和流式响应。

### ACP 提供商适配器

| 提供商 | ACP 命令 | 类型 | 检测方式 |
|----------|-------------|------|-----------|
| Claude | `npx -y @anthropic-ai/claude-code-acp` | 适配器 | npx 可用 |
| Gemini | `gemini`（原生 ACP） | 原生 | gemini 可用 |
| Codex | `npx -y @zed-industries/codex-acp` | 适配器 | npx 可用 |
| Copilot | `copilot --acp --stdio` | 原生 | copilot 可用 |
| Kiro | `kiro-cli acp` | 原生 | kiro-cli 可用 |
| OpenCode | `opencode acp` | 原生 | opencode 可用 |

### 传输方式选择

1. 检查目标提供商的 ACP 可用性（参见下方的 ACP 检测）
2. 如果 ACP 可用：使用 ACP 传输（首选——标准化协议、会话持久化）
3. 如果 ACP 不可用：回退到 CLI 传输（沿用上述现有行为）

无论使用哪种传输方式，输出封装都完全相同。下游使用方（会话管理、辩论编排器、输出解析）与传输方式无关。

### ACP 命令模板

所有 ACP 提供商都通过 ACP 运行器脚本使用相同的命令模式：

```
node acp/run.js --provider="PROVIDER" --question-file="{AI_STATE_DIR}/consult/question.tmp" --timeout=TIMEOUT_MS [--model="MODEL"] [--session-id="SESSION_ID"]
```

| 提供商 | ACP 安全命令模式 |
|----------|------------------------|
| Claude | `node acp/run.js --provider="claude" --question-file="{AI_STATE_DIR}/consult/question.tmp" --timeout=120000 --model="MODEL"` |
| Gemini | `node acp/run.js --provider="gemini" --question-file="{AI_STATE_DIR}/consult/question.tmp" --timeout=120000 --model="MODEL"` |
| Codex | `node acp/run.js --provider="codex" --question-file="{AI_STATE_DIR}/consult/question.tmp" --timeout=120000 --model="MODEL"` |
| OpenCode | `node acp/run.js --provider="opencode" --question-file="{AI_STATE_DIR}/consult/question.tmp" --timeout=120000 --model="MODEL"` |
| Copilot | `node acp/run.js --provider="copilot" --question-file="{AI_STATE_DIR}/consult/question.tmp" --timeout=120000` |
| Kiro | `node acp/run.js --provider="kiro" --question-file="{AI_STATE_DIR}/consult/question.tmp" --timeout=120000` |

**解析输出**：与 CLI 传输相同——`JSON.parse(stdout)`。ACP 运行器输出相同的封装格式。
**会话 ID**：来自 `JSON.parse(stdout).session_id`（ACP 会话 ID）
**恢复**：在 ACP 命令中传入 `--session-id="SESSION_ID"` 标志
**可继续**：Claude、Gemini、Codex、OpenCode（是）。Copilot、Kiro（否）。

### ACP 检测

同时运行 ACP 检测和 CLI 检测。对于每个提供商：

```bash
node acp/run.js --detect --provider="PROVIDER"
```

成功时返回（退出码 0）：
```json
{"provider": "claude", "acp_available": true, "name": "Claude"}
```

失败时返回（退出码 1）：
```json
{"provider": "claude", "acp_available": false, "name": "Claude", "reason": "npx not found on PATH"}
```

**Kiro 说明**：Kiro 仅支持 ACP——它没有用于外部咨询的 CLI 模式。只有当 `kiro-cli` 位于 PATH 中且 ACP 检测成功时，它才会显示为可用。

## 会话管理

### 保存会话

成功咨询后，保存到 `{AI_STATE_DIR}/consult/last-session.json`：

```json
{
  "tool": "claude",
  "model": "opus",
  "effort": "high",
  "session_id": "abc-123-def-456",
  "timestamp": "2026-02-10T12:00:00Z",
  "question": "original question text",
  "continuable": true,
  "transport": "acp"
}
```

`transport` 字段为 `"acp"` 或 `"cli"`。使用 `--continue` 恢复会话时，应使用创建该会话时所用的同一传输方式。如果该字段不存在，则假定为 `"cli"`（向后兼容）。

`AI_STATE_DIR` 使用平台状态目录：
- Claude Code：`.claude/`
- OpenCode：`.opencode/`
- Codex CLI：`.codex/`

### 加载会话

对于 `--continue`，读取会话文件并恢复：
- 工具（来自已保存状态）
- session_id（用于 --resume 标志）
- 模型（复用同一模型）

在使用恢复的值之前，重新验证它们：
- 工具必须仍在允许列表中：gemini、codex、claude、opencode、copilot、kiro
- session_id 必须匹配 `^(?!-)[A-Za-z0-9._:-]+$`
- 模型必须匹配 `^[A-Za-z0-9._:/-]+$`（拒绝空格和 shell 元字符）
- 如果任一检查失败，则以 `[ERROR] Invalid restored session data` 拒绝，并且不要构建命令

如果未找到会话文件，则发出警告并作为全新咨询继续。

## 输出清理

在输出中包含任何被咨询工具的响应之前，扫描响应文本，并对匹配以下模式的内容进行脱敏：

| 模式 | 描述 | 替换内容 |
|---------|-------------|-------------|
| `sk-[a-zA-Z0-9_-]{20,}` | Anthropic API 密钥 | `[REDACTED_API_KEY]` |
| `sk-proj-[a-zA-Z0-9_-]{20,}` | OpenAI 项目密钥 | `[REDACTED_API_KEY]` |
| `sk-ant-[a-zA-Z0-9_-]{20,}` | Anthropic API 密钥（ant 前缀） | `[REDACTED_API_KEY]` |
| `AIza[a-zA-Z0-9_-]{30,}` | Google API 密钥 | `[REDACTED_API_KEY]` |
| `ghp_[a-zA-Z0-9]{36,}` | GitHub 个人访问令牌 | `[REDACTED_TOKEN]` |
| `gho_[a-zA-Z0-9]{36,}` | GitHub OAuth 令牌 | `[REDACTED_TOKEN]` |
| `github_pat_[a-zA-Z0-9_]{20,}` | GitHub 细粒度 PAT | `[REDACTED_TOKEN]` |
| `ANTHROPIC_API_KEY=[^\s]+` | 环境输出中的密钥赋值 | `ANTHROPIC_API_KEY=[REDACTED]` |
| `OPENAI_API_KEY=[^\s]+` | 环境输出中的密钥赋值 | `OPENAI_API_KEY=[REDACTED]` |
| `GOOGLE_API_KEY=[^\s]+` | 环境输出中的密钥赋值 | `GOOGLE_API_KEY=[REDACTED]` |
| `GEMINI_API_KEY=[^\s]+` | 环境输出中的密钥赋值 | `GEMINI_API_KEY=[REDACTED]` |
| `AKIA[A-Z0-9]{16}` | AWS 访问密钥 | `[REDACTED_AWS_KEY]` |
| `ASIA[A-Z0-9]{16}` | AWS 会话令牌 | `[REDACTED_AWS_KEY]` |
| `Bearer [a-zA-Z0-9_-]{20,}` | 授权标头 | `Bearer [REDACTED]` |

在插入结果 JSON 之前，对完整响应文本应用脱敏处理。如果发生任何脱敏，请附加一条说明：`[WARN] Sensitive tokens were redacted from the response.`

## 输出格式

将纯 JSON 对象返回到 stdout（不含标记或包装器）：

```json
{
  "tool": "gemini",
  "model": "gemini-3.1-pro-preview",
  "effort": "high",
  "duration_ms": 12300,
  "response": "The AI's response text here...",
  "session_id": "abc-123",
  "continuable": true
}
```

## 安装说明

当找不到工具时，返回以下安装命令：

| 工具 | 安装 |
|------|---------|
| Claude | `npm install -g @anthropic-ai/claude-code` |
| Gemini | 安装说明请参阅 https://gemini.google.com/cli |
| Codex | `npm install -g @openai/codex` |
| OpenCode | `npm install -g opencode-ai` 或 `brew install anomalyco/tap/opencode` |
| Copilot | `gh extension install github/copilot-cli` |

## 错误处理

| 错误 | 响应 |
|-------|----------|
| 工具未安装 | 返回上表中的安装说明 |
| 工具执行超时 | 返回 `"response": "Timeout after 120s"` |
| JSON 解析错误 | 将原始文本作为响应返回 |
| 输出为空 | 返回 `"response": "No output received"` |
| 会话文件缺失 | 不恢复会话并继续执行 |
| API 密钥缺失 | 返回特定于工具的环境变量说明 |

## 集成

此 Skill 由以下方式调用：
- `consult-agent` 为 `/consult` 命令调用此 Skill
- 直接调用：`Skill('consult', '"question" --tool=gemini --effort=high')`

示例：`Skill('consult', '"Is this approach correct?" --tool=gemini --effort=high --model=gemini-3.1-pro-preview')`