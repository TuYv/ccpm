---
name: e2e-testing
description: Guide for running end-to-end tests of the Qwen Code CLI, including headless mode, MCP server testing, and API traffic inspection. Use this skill whenever you need to verify CLI behavior with real model calls, reproduce user-reported bugs end-to-end, test MCP tool integrations, or inspect raw API request/response payloads. Trigger on mentions of E2E testing, headless testing, MCP tool testing, or reproducing issues.
---
# E2E 测试指南

介绍如何端到端运行 Qwen Code CLI——从构建 bundle 到检查原始 API 流量。当单元测试不足以满足需求，需要通过完整流水线（模型 API → 工具验证 → 工具执行）验证行为时使用。

## 设置

### 使用哪个二进制文件

- **复现 bug**：使用全局安装的 `qwen` 命令——这与用户提交问题时运行的命令一致。
- **验证修复**：先构建（`npm run build && npm run bundle`），然后运行
  `node dist/cli.js`——这会测试你的本地更改。
- **仅运行时检查（最快）**：`npm run dev -- "<prompt>" <flags>`——通过 tsx 运行 TS
  源码，无需构建。只有在发布的 artifact 本身很重要时，才使用 `build && bundle` + `node dist/cli.js`。（下面的 `<qwen>` 可以是 `npm run dev --`。）

### 针对真实模型运行

无头认证来自 `~/.qwen`。使用 `--auth-type` + `--model` 强制指定一个已知可用的模型：

```bash
<qwen> "your prompt" --auth-type openai --model deepseek-v4-flash \
  --approval-mode yolo --output-format json
```

**注意事项：**仅使用 `--model` 不会切换提供商——真正起作用的是 `--auth-type`（`openai`/`anthropic`/`qwen-oauth`/`gemini`/`vertex-ai`）。省略它会回退到默认提供商，并因缺少对应的密钥而失败。

### 隔离运行时 artifact

`QWEN_RUNTIME_DIR=<dir>` 会将 qwen 的运行时输出——`tmp/`、`debug/` 以及 `projects/<sanitized-cwd>/...`（聊天记录、自动记忆、历史记录）——重定向到 `<dir>`，而不是 `~/.qwen`。配置（`settings.json`、OAuth 令牌、`commands/`）仍会从 `~/.qwen` 读取，因此无需任何设置即可使用真实的认证信息和提供商配置。

**在以下情况下使用**：重复运行测试会弄乱真实的聊天历史或自动记忆。**在以下情况下跳过**：你要复现的 bug 依赖用户的实际历史记录或运行时状态——这正是复现条件。

```bash
QWEN_RUNTIME_DIR=/tmp/test-1/runtime <qwen> "prompt" ...
```

## 运行模式

### 无头模式

以非交互方式运行 CLI，并输出 JSON（`<qwen>` = 上述的 `qwen` 或
`node dist/cli.js`）：

```bash
<qwen> "your prompt here" \
  --approval-mode yolo \
  --output-format json \
  2>/dev/null
```

`--output-format json` 会输出**一个 JSON 数组**（所有消息会在 turn 结束时统一刷新）——使用 `jq '.[] | …'` 进行筛选，绝不要使用裸的 `jq 'select(…)'`。（而 `--output-format stream-json` 会输出 NDJSON，每行一个对象。）元素类型：

- `type: "system"` —— 初始化信息：`tools`、`mcp_servers`、`model`、`permission_mode`
- `type: "assistant"` —— 模型输出：`content[].type` 为 `text`、`tool_use` 或 `thinking`
- `type: "user"` —— 工具结果：`content[].type` 为 `tool_result`，并带有 `is_error`
- `type: "result"` —— 最终输出，包含 `result` 文本和 `usage` 统计信息

使用 `jq` 进行筛选——以 `.[]` 开头以进入数组，例如筛选工具结果错误：
`... 2>/dev/null | jq '.[] | select(.type=="user") | .message.content[] | select(.is_error)'`

### 交互模式（tmux）

当你需要验证 TUI 渲染、测试键盘交互或查看用户所看到的内容时使用。仅需要结构化输出时，无头模式更简单。

#### 启动

```bash
tmux new-session -d -s test -x 200 -y 50 \
  "cd /tmp/test-dir && <qwen> --approval-mode yolo"
sleep 3  # wait for TUI to initialize
```

#### 发送提示

将文本和 Enter 分开发送，并加入短暂延迟——将它们一起发送可能会导致
TUI 吞掉提交操作：

```bash
tmux send-keys -t test "your prompt here"
sleep 0.5
tmux send-keys -t test Enter
```

#### 等待完成

轮询流式指示器是否消失，而不是盲目休眠。页脚占位符 `Type your message` _始终_ 会被渲染——不要检索这个文本，否则循环会在第 1 次迭代时退出，而模型仍在工作。状态行 `esc to cancel` 仅在模型正在生成输出时出现：

```bash
for i in $(seq 1 60); do
  sleep 2
  tmux capture-pane -t test -p | grep -q "esc to cancel" || break
done
```

#### 捕获输出

```bash
tmux capture-pane -t test -p -S -100   # -S -100 = 100 lines of scrollback
```

#### 限制

- **组合键**：`tmux send-keys` 无法可靠地发送所有组合键。
  `C-?`、`C-Shift-*` 以及带修饰键的功能键不受支持或不可靠。对于这些按键，请使用
  `integration-tests/interactive/` 中的 `InteractiveSession` harness，或手动测试。
- **视觉伪影**：`capture-pane` 捕获的是最终渲染帧，而不是中间状态。通过这种方式无法检测闪烁、撕裂或短暂的空白帧。

#### 清理

```bash
tmux kill-session -t test
```

## 检查

### 检查原始 API 流量

调试模型行为（工具参数错误、模式问题）时，启用 API
日志记录，以查看确切的请求/响应载荷：

```bash
<qwen> "prompt" \
  --approval-mode yolo \
  --output-format json \
  --openai-logging \
  --openai-logging-dir /tmp/api-logs
```

每次 API 调用都会生成一个 JSON 文件（由于包含完整消息历史，文件大小可能达到 80KB 以上）。
其中大部分内容位于 `request.messages`（对话历史）中。裁剪后的结构如下：

```json
{
  "request": {
    "model": "coder-model",
    "messages": [
      { "role": "system|user|assistant", "content": "...", "tool_calls?": [...] }
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "tool_name",
          "description": "...",
          "parameters": { ... }      // schema sent to the model
        }
      }
    ]
  },
  "response": {
    "choices": [
      {
        "message": {
          "role": "assistant",
          "content": "...",          // text response (may be null)
          "tool_calls": [
            {
              "id": "call_...",
              "function": {
                "name": "tool_name",
                "arguments": "..."   // raw JSON string from the model
              }
            }
          ]
        }
      }
    ]
  }
}
```

结构化输出调用（请求 JSON schema 的调用，例如通过
`BaseLlmClient.generateJson` 发起的旁路查询）会将模式作为名为
`respond_in_schema` 的合成工具放在 `request.tools[0]` 下——_而不是_放在
`response_format` 下；对于 OpenAI 兼容提供商，该字段为 null。模型的结构化回复会放在
`tool_calls[0].function.arguments` 中，而不是 `message.content` 中。
文本模式调用没有 `tools`，并使用 `message.content`。

### Token 使用统计

使用 `scripts/token-stats.py` 汇总近期 API 日志中的 token 使用情况：

```bash
python3 .qwen/skills/e2e-testing/scripts/token-stats.py 20  # last 20 requests
```

显示每个请求的输入、缓存和输出 token，以及缓存命中率。可用于验证提示词缓存行为或调查异常的 token 数量。

## 测试工具

### MCP 服务器测试

如需端到端测试 MCP 工具的行为，请阅读 `references/mcp-testing.md`。其中介绍了设置时容易踩坑的地方（配置位置、git 仓库要求），并在 `scripts/mcp-test-server.js` 中提供了一个可复用的零依赖测试服务器模板。

### OpenAI 模拟服务器

如需针对真实模型难以触发的场景驱动 CLI 进行测试——例如特定错误码、格式错误的工具调用、确定性的多轮循环、受控的 `usage` 代码块——请阅读 `references/mock-openai-server.md`。其中介绍了何时应使用模拟服务器而不是 `--openai-logging`、如何让 CLI 指向该服务器，以及如何基于 `scripts/mock-openai-server.js` 中的零依赖模板进行专门化配置。

## 技巧

- 当问题涉及权限提示、斜杠命令或键盘交互时，使用交互式（tmux）模式。无头模式没有 TUI——这些功能在那里不存在。
- 对于与挂起相关的问题，使用交互式（tmux）模式。进程停滞时，无头模式不会产生任何输出，让你无从排查。
- 测试权限规则时，使用 `--approval-mode default`。`yolo` 会完全绕过规则评估——无法用于测试某条规则是否匹配。