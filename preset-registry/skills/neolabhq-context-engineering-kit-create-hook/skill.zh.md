---
name: create-hook
description: Create and configure git hooks with intelligent project analysis, suggestions, and automated testing
argument-hint: Optional hook type or description of desired behavior
---
# 创建 Hook 命令

分析项目，推荐实用的 Hook，并在妥善测试后创建它们。

## 你的任务（/create-hook）

1. **分析环境** - 检测工具链和现有 Hook
2. **推荐 Hook** - 根据项目配置提出建议
3. **配置 Hook** - 提出针对性问题并创建脚本
4. **测试与验证** - 确保 Hook 正常工作

## 你的工作流程

### 1. 环境分析与建议

自动检测项目工具链并推荐相关 Hook：

**检测到 TypeScript 时（`tsconfig.json`）：**

- PostToolUse Hook：“编辑后对文件进行类型检查”
- PreToolUse Hook：“阻止存在类型错误的编辑”

**检测到 Prettier 时（`.prettierrc`、`prettier.config.js`）：**

- PostToolUse Hook：“编辑后自动格式化文件”
- PreToolUse Hook：“要求代码已正确格式化”

**检测到 ESLint 时（`.eslintrc.*`）：**

- PostToolUse Hook：“编辑后执行代码检查并自动修复”
- PreToolUse Hook：“阻止提交存在代码检查错误的内容”

**当 package.json 中包含脚本时：**

- `test` 脚本 → “提交前运行测试”
- `build` 脚本 → “提交前验证构建”

**检测到 git 仓库时：**

- PreToolUse/Bash Hook：“防止提交密钥”
- PostToolUse Hook：“文件变更时执行安全扫描”

**决策树：**

```
Project has TypeScript? → Suggest type checking hooks
Project has formatter? → Suggest formatting hooks
Project has tests? → Suggest test validation hooks
Security sensitive? → Suggest security hooks
+ Scan for additional patterns and suggest custom hooks based on:
  - Custom scripts in package.json
  - Unique file patterns or extensions
  - Development workflow indicators
  - Project-specific tooling configurations
```

### 2. Hook 配置

首先询问：**“这个 Hook 应该做什么？”**，并根据分析结果提供相关建议。

然后根据用户的描述理解上下文，**只询问你不确定的细节**：

1. **触发时机**：应该在什么时候运行？
   - `PreToolUse`：文件操作之前（可以阻止操作）
   - `PostToolUse`：文件操作之后（提供反馈/修复）
   - `UserPromptSubmit`：处理请求之前
   - 根据需要使用其他事件类型

2. **工具匹配器**：哪些工具应触发它？（`Write`、`Edit`、`Bash`、`*` 等）

3. **作用域**：`global`、`project` 或 `project-local`

4. **响应方式**：
   - **仅使用退出码**：简单（exit 0 = 成功，exit 2 = 在 PreToolUse 中阻止操作）
   - **JSON 响应**：高级控制（阻止、上下文、决策）
   - 根据复杂程度提供指导：简单的通过/失败 → 退出码，丰富的反馈 → JSON

5. **阻止行为**（如适用）：“发现问题时是否应停止操作？”
   - PreToolUse：可以阻止操作（安全、验证）
   - PostToolUse：通常只提供反馈

6. **Claude 集成**（关键）：“是否应让 Claude Code 自动看到并修复此 Hook 检测到的问题？”
   - 如果是：使用 `additionalContext` 传递错误信息
   - 如果否：使用 `suppressOutput: true` 静默运行

7. **上下文污染**："成功的操作是否应保持静默以避免噪声？"
   - 对格式化、常规检查，建议选择“是”
   - 对安全警报、严重错误，建议选择“否”

8. **文件过滤**："此 hook 应处理哪些文件类型？"

### 3. 创建 Hook

你应该：

- **创建 hooks 目录**：根据作用域创建 `~/.claude/hooks/` 或 `.claude/hooks/`
- **生成脚本**：创建具备以下内容的 hook 脚本：
  - 正确的 shebang 和可执行权限
  - 项目特定的命令（使用检测到的配置路径）
  - 解释 hook 用途的注释
- **更新设置**：将 hook 配置添加到相应的 settings.json
- **使用绝对路径**：避免使用脚本和可执行文件的相对路径。使用 `$CLAUDE_PROJECT_DIR` 引用项目根目录
- **提供验证选项**：询问用户是否希望你测试该 hook

**关键实现标准：**

- 从 stdin 读取 JSON（绝不使用 argv）
- 使用顶层 `additionalContext`/`systemMessage` 与 Claude 通信
- 对成功的操作包含 `suppressOutput: true`
- 提供具体的错误数量和可操作的反馈
- 关注已更改的文件，而不是整个代码库
- 支持常见的开发工作流

**⚠️ 严重警告：输入/输出格式**

这是大多数 hook 实现失败的地方。请特别注意：

- **输入**：正确地从 stdin 读取 JSON（而不是 argv）
- **输出**：使用正确的顶层 JSON 结构与 Claude 通信
- **文档**：如有疑问，请查阅官方文档以确认准确的 schema

### 4. 测试与验证

**严重警告：同时测试正常路径和异常路径：**

**正常路径测试：**

1. **测试预期成功的场景**——创建 hook 应当通过的条件
   - _示例_：TypeScript（有效代码）、代码检查（已格式化的代码）、安全检查（安全命令）

**异常路径测试：** 2. **测试预期失败的场景**——创建 hook 应当失败/警告的条件

- _示例_：TypeScript（类型错误）、代码检查（未格式化的代码）、安全检查（危险操作）

**验证步骤：** 3. **验证预期行为**：检查它是否按预期阻止、警告或提供上下文

**测试流程示例：**

- 对于防止文件删除的 hook：创建一个测试文件，尝试执行受保护的操作，并验证 hook 是否阻止该操作

**如果出现问题，你应该：**

- 检查设置中的 hook 注册情况
- 验证脚本权限（`chmod +x`）
- 先使用简化版本进行测试
- 通过详细分析 hook 执行过程进行调试

## Hook 模板

### 类型检查（PostToolUse）

```
#!/usr/bin/env node
// Read stdin JSON, check .ts/.tsx files only
// Run: npx tsc --noEmit --pretty
// Output: JSON with additionalContext for errors
```

### 自动格式化（PostToolUse）

```
#!/usr/bin/env node
// Read stdin JSON, check supported file types
// Run: npx prettier --write [file]
// Output: JSON with suppressOutput: true
```

### 安全扫描（PreToolUse）

```bash
#!/bin/bash
# Read stdin JSON, check for secrets/keys
# Block if dangerous patterns found
# Exit 2 to block, 0 to continue
```

_完整模板请参阅：<https://docs.claude.com/en/docs/claude-code/hooks#examples>_

## 快速参考

**📖 官方文档**：<https://docs.claude.com/en/docs/claude-code/hooks.md>

**常见模式：**

- **stdin 输入**：`JSON.parse(process.stdin.read())`
- **文件筛选**：处理前检查扩展名
- **成功响应**：`{continue: true, suppressOutput: true}`
- **错误响应**：`{continue: true, additionalContext: "error details"}`
- **阻止操作**：在 PreToolUse 钩子中使用 `exit(2)`

**按用例划分的钩子类型：**

- **代码质量**：使用 PostToolUse 提供反馈和修复
- **安全性**：使用 PreToolUse 阻止危险操作
- **CI/CD**：使用 PreToolUse 在提交前进行验证
- **开发**：使用 PostToolUse 实现自动改进

**钩子执行最佳实践：**

- 根据官方文档，**钩子会并行运行**
- 由于无法保证执行顺序，**应确保各钩子能够独立运行**
- 当多个钩子会影响相同文件时，**请仔细规划钩子之间的交互**

## 成功标准

✅ **在以下情况下，钩子即创建成功：**

- 脚本具有可执行权限
- 已在正确的 settings.json 中注册
- 能够正确响应测试场景
- 能够与 Claude 正确集成以实现自动修复
- 遵循项目约定和检测到的工具配置

**结果**：用户将获得一个可正常工作的钩子，通过智能自动化和质量检查增强其开发工作流。

---

> ## 文档索引
>
> 获取完整的文档索引：<https://code.claude.com/docs/llms.txt>
> 在进一步探索之前，使用此文件查找所有可用页面。

# 使用钩子自动化工作流

> 当 Claude Code 编辑文件、完成任务或需要输入时，自动运行 shell 命令。格式化代码、发送通知、验证命令并强制执行项目规则。

钩子是用户定义的 shell 命令，会在 Claude Code 生命周期中的特定时刻执行。它们能够以确定性的方式控制 Claude Code 的行为，确保某些操作始终执行，而不是依赖 LLM 自行决定是否运行这些操作。使用钩子可以强制执行项目规则、自动处理重复性任务，并将 Claude Code 与现有工具集成。

对于需要判断而非遵循确定性规则的决策，你还可以使用由 Claude 模型评估条件的[基于提示词的钩子](#prompt-based-hooks)或[基于智能体的钩子](#agent-based-hooks)。

有关扩展 Claude Code 的其他方式，请参阅用于向 Claude 提供额外指令和可执行命令的[技能](/en/skills)、用于在隔离上下文中运行任务的[子智能体](/en/sub-agents)，以及用于打包扩展并在项目间共享的[插件](/en/plugins)。

<Tip>
  本指南介绍常见用例以及如何开始使用。有关完整的事件模式、JSON 输入/输出格式，以及异步钩子和 MCP 工具钩子等高级功能，请参阅[钩子参考文档](/en/hooks)。
</Tip>

## 设置你的第一个钩子

创建钩子的最快方式是使用 Claude Code 中的 `/hooks` 交互式菜单。本演练将创建一个桌面通知钩子，这样每当 Claude 等待你的输入时，你都会收到提醒，而不必一直盯着终端。

<Steps>
  <Step title="打开 hooks 菜单">
    在 Claude Code CLI 中输入 `/hooks`。你会看到所有可用 hook 事件的列表，以及一个禁用所有 hook 的选项。每个事件都对应 Claude 生命周期中的一个节点，你可以在该节点运行自定义代码。选择 `Notification`，创建一个在 Claude 需要你注意时触发的 hook。
  </Step>

  <Step title="配置匹配器">
    菜单会显示匹配器列表，用于筛选触发 hook 的时机。将匹配器设置为 `*`，以便对所有通知类型触发。之后，你可以将匹配器改为 `permission_prompt` 或 `idle_prompt` 等特定值来缩小范围。
  </Step>

  <Step title="添加命令">
    选择 `+ Add new hook…`。菜单会提示你输入事件触发时要运行的 shell 命令。Hook 可以运行你提供的任何 shell 命令，因此你可以使用平台内置的通知工具。复制适用于你的操作系统的命令：

    <Tabs>
      <Tab title="macOS">
        使用 [`osascript`](https://ss64.com/mac/osascript.html) 通过 AppleScript 触发原生 macOS 通知：

        ```
        osascript -e 'display notification "Claude Code needs your attention" with title "Claude Code"'
        ```
      </Tab>

      <Tab title="Linux">
        使用 `notify-send`，它已预装在大多数配有通知守护进程的 Linux 桌面环境中：

        ```
        notify-send 'Claude Code' 'Claude Code needs your attention'
        ```
      </Tab>

      <Tab title="Windows (PowerShell)">
        使用 PowerShell，通过 .NET 的 Windows Forms 显示原生消息框：

        ```
        powershell.exe -Command "[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('Claude Code needs your attention', 'Claude Code')"
        ```
      </Tab>
    </Tabs>
  </Step>

  <Step title="选择存储位置">
    菜单会询问将 hook 配置保存到何处。选择 `User settings`，将其存储在 `~/.claude/settings.json` 中，这会把该 hook 应用于你的所有项目。你也可以选择 `Project settings`，将其范围限定为当前项目。有关所有可用的作用域，请参阅[配置 hook 位置](#configure-hook-location)。
  </Step>

  <Step title="测试 hook">
    按 `Esc` 返回 CLI。让 Claude 执行一项需要权限的操作，然后切换到终端之外。你应该会收到桌面通知。
  </Step>
</Steps>

## 可以自动化哪些操作

Hook 允许你在 Claude Code 生命周期的关键节点运行代码：在编辑后格式化文件、在命令执行前阻止命令、在 Claude 需要输入时发送通知、在会话开始时注入上下文等。有关 hook 事件的完整列表，请参阅 [Hooks 参考](/en/hooks#hook-lifecycle)。

每个示例都包含一个可直接使用的配置块，你可以将其添加到[设置文件](#configure-hook-location)中。最常见的模式包括：

- [在 Claude 需要输入时接收通知](#get-notified-when-claude-needs-input)
- [编辑后自动格式化代码](#auto-format-code-after-edits)
- [阻止编辑受保护的文件](#block-edits-to-protected-files)
- [压缩后重新注入上下文](#re-inject-context-after-compaction)

### 当 Claude 需要输入时接收通知

每当 Claude 完成工作并需要你的输入时，接收桌面通知，这样你就可以切换去处理其他任务，而无需反复查看终端。

此 hook 使用 `Notification` 事件，该事件会在 Claude 等待输入或权限时触发。下面每个选项卡都使用对应平台的原生通知命令。将以下内容添加到 `~/.claude/settings.json`，或者按照上面的[交互式演练](#set-up-your-first-hook)，使用 `/hooks` 进行配置：

<Tabs>
  <Tab title="macOS">
    ```json  theme={null}
    {
      "hooks": {
        "Notification": [
          {
            "matcher": "",
            "hooks": [
              {
                "type": "command",
                "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'"
              }
            ]
          }
        ]
      }
    }
    ```
  </Tab>

  <Tab title="Linux">
    ```json  theme={null}
    {
      "hooks": {
        "Notification": [
          {
            "matcher": "",
            "hooks": [
              {
                "type": "command",
                "command": "notify-send 'Claude Code' 'Claude Code needs your attention'"
              }
            ]
          }
        ]
      }
    }
    ```
  </Tab>

  <Tab title="Windows (PowerShell)">
    ```json  theme={null}
    {
      "hooks": {
        "Notification": [
          {
            "matcher": "",
            "hooks": [
              {
                "type": "command",
                "command": "powershell.exe -Command \"[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('Claude Code needs your attention', 'Claude Code')\""
              }
            ]
          }
        ]
      }
    }
    ```
  </Tab>
</Tabs>

### 编辑后自动格式化代码

对 Claude 编辑的每个文件自动运行 [Prettier](https://prettier.io/)，无需手动干预即可保持格式一致。

此 hook 使用带有 `Edit|Write` 匹配器的 `PostToolUse` 事件，因此它只会在文件编辑工具运行后执行。该命令使用 [`jq`](https://jqlang.github.io/jq/) 提取被编辑文件的路径，并将其传递给 Prettier。将以下内容添加到项目根目录下的 `.claude/settings.json`：

```json  theme={null}
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
          }
        ]
      }
    ]
  }
}
```

<Note>
  本页中的 Bash 示例使用 `jq` 解析 JSON。可通过 `brew install jq`（macOS）、`apt-get install jq`（Debian/Ubuntu）进行安装，或参阅 [`jq` 下载页面](https://jqlang.github.io/jq/download/)。
</Note>

### 阻止编辑受保护的文件

防止 Claude 修改 `.env`、`package-lock.json` 或 `.git/` 中的任何内容等敏感文件。Claude 会收到说明编辑为何被阻止的反馈，以便调整其处理方式。

此示例使用一个由钩子调用的独立脚本文件。该脚本会根据受保护模式列表检查目标文件路径，并以代码 2 退出以阻止编辑。

<Steps>
  <Step title="创建钩子脚本">
    将以下内容保存到 `.claude/hooks/protect-files.sh`：

    ```bash  theme={null}
    #!/bin/bash
    # protect-files.sh

    INPUT=$(cat)
    FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

    PROTECTED_PATTERNS=(".env" "package-lock.json" ".git/")

    for pattern in "${PROTECTED_PATTERNS[@]}"; do
      if [[ "$FILE_PATH" == *"$pattern"* ]]; then
        echo "Blocked: $FILE_PATH matches protected pattern '$pattern'" >&2
        exit 2
      fi
    done

    exit 0
    ```
  </Step>

  <Step title="使脚本可执行（macOS/Linux）">
    钩子脚本必须具有可执行权限，Claude Code 才能运行它们：

    ```bash  theme={null}
    chmod +x .claude/hooks/protect-files.sh
    ```
  </Step>

  <Step title="注册钩子">
    在 `.claude/settings.json` 中添加一个 `PreToolUse` 钩子，使其在任何 `Edit` 或 `Write` 工具调用之前运行该脚本：

    ```json  theme={null}
    {
      "hooks": {
        "PreToolUse": [
          {
            "matcher": "Edit|Write",
            "hooks": [
              {
                "type": "command",
                "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/protect-files.sh"
              }
            ]
          }
        ]
      }
    }
    ```
  </Step>
</Steps>

### 压缩后重新注入上下文

当 Claude 的上下文窗口填满时，压缩功能会汇总对话以释放空间。这可能会丢失重要细节。使用带有 `compact` 匹配器的 `SessionStart` 钩子，在每次压缩后重新注入关键上下文。

命令写入 stdout 的任何文本都会添加到 Claude 的上下文中。此示例会提醒 Claude 项目约定和近期工作。将以下内容添加到项目根目录的 `.claude/settings.json` 中：

```json  theme={null}
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Reminder: use Bun, not npm. Run bun test before committing. Current sprint: auth refactor.'"
          }
        ]
      }
    ]
  }
}
```

你可以将 `echo` 替换为任何可生成动态输出的命令，例如使用 `git log --oneline -5` 显示最近的提交。若要在每次会话开始时注入上下文，请考虑改用 [CLAUDE.md](/en/memory)。有关环境变量的信息，请参阅参考文档中的 [`CLAUDE_ENV_FILE`](/en/hooks#persist-environment-variables)。

## 钩子的工作原理

钩子事件会在 Claude Code 生命周期的特定时刻触发。事件触发时，所有匹配的钩子都会并行运行，并且相同的钩子命令会自动去重。下表列出了每个事件及其触发时机：

| 事件                 | 触发时机                                             |
| :------------------- | :--------------------------------------------------- |
| `SessionStart`       | 会话开始或恢复时                                     |
| `UserPromptSubmit`   | 你提交提示后、Claude 处理该提示之前                  |
| `PreToolUse`         | 工具调用执行之前。可以阻止该调用                     |
| `PermissionRequest`  | 权限对话框出现时                                     |
| `PostToolUse`        | 工具调用成功后                                       |
| `PostToolUseFailure` | 工具调用失败后                                       |
| `Notification`       | Claude Code 发送通知时                               |
| `SubagentStart`      | 子代理生成时                                         |
| `SubagentStop`       | 子代理完成时                                         |
| `Stop`               | Claude 完成响应时                                    |
| `PreCompact`         | 上下文压缩之前                                       |
| `SessionEnd`         | 会话终止时                                           |

每个钩子都有一个决定其运行方式的 `type`。大多数钩子使用 `"type": "command"`，它会运行 shell 命令。另外两个选项使用 Claude 模型进行决策：`"type": "prompt"` 用于单轮评估，`"type": "agent"` 用于可访问工具的多轮验证。有关详细信息，请参阅[基于提示词的钩子](#prompt-based-hooks)和[基于代理的钩子](#agent-based-hooks)。

### 读取输入并返回输出

钩子通过 stdin、stdout、stderr 和退出代码与 Claude Code 通信。当事件触发时，Claude Code 会将事件特定的数据以 JSON 形式传递到脚本的 stdin。脚本读取这些数据，执行相应工作，然后通过退出代码告知 Claude Code 下一步该做什么。

#### 钩子输入

每个事件都包含 `session_id` 和 `cwd` 等通用字段，但不同事件类型会添加不同的数据。例如，当 Claude 运行 Bash 命令时，`PreToolUse` 钩子会在 stdin 上收到类似以下内容：

```json  theme={null}
{
  "session_id": "abc123",          // unique ID for this session
  "cwd": "/Users/sarah/myproject", // working directory when the event fired
  "hook_event_name": "PreToolUse", // which event triggered this hook
  "tool_name": "Bash",             // the tool Claude is about to use
  "tool_input": {                  // the arguments Claude passed to the tool
    "command": "npm test"          // for Bash, this is the shell command
  }
}
```

脚本可以解析该 JSON，并根据其中任意字段执行操作。`UserPromptSubmit` 钩子会改为获取 `prompt` 文本，`SessionStart` 钩子会获取 `source`（startup、resume、compact），依此类推。有关共享字段，请参阅参考文档中的[通用输入字段](/en/hooks#common-input-fields)；有关特定于事件的 schema，请参阅各事件对应的章节。

#### 钩子输出

脚本通过向 stdout 或 stderr 写入内容，并以特定代码退出，来告知 Claude Code 下一步该做什么。例如，一个希望阻止命令的 `PreToolUse` 钩子：

```bash  theme={null}
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q "drop table"; then
  echo "Blocked: dropping tables is not allowed" >&2  # stderr becomes Claude's feedback
  exit 2                                               # exit 2 = block the action
fi

exit 0  # exit 0 = let it proceed
```

退出代码决定接下来会发生什么：

- **退出代码 0**：操作继续执行。对于 `UserPromptSubmit` 和 `SessionStart` 钩子，写入 stdout 的任何内容都会添加到 Claude 的上下文中。
- **退出代码 2**：操作被阻止。将原因写入 stderr，Claude 会将其作为反馈接收，以便进行调整。
- **任何其他退出代码**：操作继续执行。Stderr 会被记录，但不会显示给 Claude。使用 `Ctrl+O` 切换详细模式，即可在交互记录中查看这些消息。

#### 结构化 JSON 输出

退出代码提供两种选择：允许或阻止。如需进行更精细的控制，请以代码 0 退出，并将 JSON 对象输出到 stdout。

<Note>
  使用退出代码 2 配合 stderr 消息来阻止操作，或者使用退出代码 0 配合 JSON 进行结构化控制。不要混用这两种方式：以代码 2 退出时，Claude Code 会忽略 JSON。
</Note>

例如，`PreToolUse` 钩子可以拒绝工具调用并告知 Claude 原因，或者将其升级给用户审批：

```json  theme={null}
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Use rg instead of grep for better performance"
  }
}
```

Claude Code 会读取 `permissionDecision` 并取消工具调用，然后将 `permissionDecisionReason` 作为反馈传回给 Claude。以下三个选项专用于 `PreToolUse`：

- `"allow"`：继续执行，不显示权限提示
- `"deny"`：取消工具调用并将原因发送给 Claude
- `"ask"`：像往常一样向用户显示权限提示

其他事件使用不同的决策模式。例如，`PostToolUse` 和 `Stop` 钩子使用顶层的 `decision: "block"` 字段，而 `PermissionRequest` 使用 `hookSpecificOutput.decision.behavior`。有关按事件分类的完整说明，请参阅参考文档中的[汇总表](/en/hooks#decision-control)。

对于 `UserPromptSubmit` 钩子，请改用 `additionalContext` 将文本注入 Claude 的上下文。基于提示词的钩子（`type: "prompt"`）以不同方式处理输出：请参阅[基于提示词的钩子](#prompt-based-hooks)。

### 使用匹配器筛选钩子

如果没有匹配器，钩子会在其事件每次发生时触发。匹配器可让你缩小触发范围。例如，如果你只想在编辑文件后运行格式化程序（而不是在每次工具调用后运行），请为 `PostToolUse` 钩子添加匹配器：

```json  theme={null}
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "prettier --write ..." }
        ]
      }
    ]
  }
}
```

`"Edit|Write"` 匹配器是一个与工具名称匹配的正则表达式模式。只有当 Claude 使用 `Edit` 或 `Write` 工具时，该钩子才会触发；当 Claude 使用 `Bash`、`Read` 或任何其他工具时则不会触发。

每种事件类型都针对特定字段进行匹配。匹配器支持精确字符串和正则表达式模式：

| 事件                                                                   | 匹配器筛选的内容           | 匹配器值示例                                                             |
| :--------------------------------------------------------------------- | :------------------------ | :----------------------------------------------------------------------- |
| `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest` | 工具名称                   | `Bash`, `Edit\|Write`, `mcp__.*`                                         |
| `SessionStart`                                                         | 会话如何启动               | `startup`, `resume`, `clear`, `compact`                                  |
| `SessionEnd`                                                           | 会话为何结束               | `clear`, `logout`, `prompt_input_exit`, `other`                          |
| `Notification`                                                         | 通知类型                   | `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog` |
| `SubagentStart`                                                        | 代理类型                   | `Bash`、`Explore`、`Plan` 或自定义代理名称                                |
| `PreCompact`                                                           | 触发压缩的原因             | `manual`, `auto`                                                         |
| `UserPromptSubmit`, `Stop`                                             | 不支持匹配器               | 每次发生时始终触发                                                       |
| `SubagentStop`                                                         | 代理类型                   | 与 `SubagentStart` 相同的值                                              |

以下是更多在不同事件类型上使用匹配器的示例：

<Tabs>
  <Tab title="记录每一条 Bash 命令">
    仅匹配 `Bash` 工具调用，并将每条命令记录到文件中。`PostToolUse` 事件会在命令执行完成后触发，因此 `tool_input.command` 包含实际执行的内容。钩子通过 stdin 接收 JSON 格式的事件数据，而 `jq -r '.tool_input.command'` 仅提取命令字符串，再由 `>>` 将其追加到日志文件中：

    ```json  theme={null}
    {
      "hooks": {
        "PostToolUse": [
          {
            "matcher": "Bash",
            "hooks": [
              {
                "type": "command",
                "command": "jq -r '.tool_input.command' >> ~/.claude/command-log.txt"
              }
            ]
          }
        ]
      }
    }
    ```
  </Tab>

  <Tab title="匹配 MCP 工具">
    MCP 工具使用的命名约定与内置工具不同：`mcp__<server>__<tool>`，其中 `<server>` 是 MCP 服务器名称，`<tool>` 是它提供的工具。例如，`mcp__github__search_repositories` 或 `mcp__filesystem__read_file`。使用正则表达式匹配器可以定位特定服务器中的所有工具，也可以使用类似 `mcp__.*__write.*` 的模式跨服务器进行匹配。有关完整的示例列表，请参阅参考文档中的[匹配 MCP 工具](/en/hooks#match-mcp-tools)。

    以下命令使用 `jq` 从钩子的 JSON 输入中提取工具名称，并将其写入 stderr；在详细模式（`Ctrl+O`）下可以看到该输出：

    ```json  theme={null}
    {
      "hooks": {
        "PreToolUse": [
          {
            "matcher": "mcp__github__.*",
            "hooks": [
              {
                "type": "command",
                "command": "echo \"GitHub tool called: $(jq -r '.tool_name')\" >&2"
              }
            ]
          }
        ]
      }
    }
    ```
  </Tab>

  <Tab title="会话结束时清理">
    `SessionEnd` 事件支持根据会话结束原因进行匹配。此钩子仅在 `clear` 时（即运行 `/clear` 时）触发，正常退出时不会触发：

    ```json  theme={null}
    {
      "hooks": {
        "SessionEnd": [
          {
            "matcher": "clear",
            "hooks": [
              {
                "type": "command",
                "command": "rm -f /tmp/claude-scratch-*.txt"
              }
            ]
          }
        ]
      }
    }
    ```
  </Tab>
</Tabs>

有关完整的匹配器语法，请参阅[钩子参考文档](/en/hooks#configuration)。

### 配置钩子位置

添加钩子的位置决定了它的作用域：

| 位置                                                       | 作用域                             | 是否可共享                         |
| :--------------------------------------------------------- | :--------------------------------- | :--------------------------------- |
| `~/.claude/settings.json`                                  | 你的所有项目                       | 否，仅限本地计算机                 |
| `.claude/settings.json`                                    | 单个项目                           | 是，可以提交到仓库                 |
| `.claude/settings.local.json`                              | 单个项目                           | 否，已被 git 忽略                  |
| 托管策略设置                                               | 整个组织                           | 是，由管理员控制                   |
| [插件](/en/plugins) `hooks/hooks.json`                     | 插件启用时                         | 是，与插件捆绑                     |
| [技能](/en/skills)或[代理](/en/sub-agents)的 frontmatter   | 技能或代理处于活动状态时           | 是，在组件文件中定义               |

你还可以使用 Claude Code 中的 [`/hooks` 菜单](/en/hooks#the-hooks-menu)，以交互方式添加、删除和查看钩子。要一次性禁用所有钩子，请使用 `/hooks` 菜单底部的开关，或在设置文件中设置 `"disableAllHooks": true`。

通过 `/hooks` 菜单添加的钩子会立即生效。如果你在 Claude Code 运行期间直接编辑设置文件，则更改要等到你在 `/hooks` 菜单中查看它们或重启会话后才会生效。

## 基于提示词的钩子

对于需要判断而不是依据确定性规则做出的决策，请使用 `type: "prompt"` 钩子。Claude Code 不会运行 shell 命令，而是将你的提示词和钩子的输入数据发送给 Claude 模型（默认为 Haiku）来做出决策。如果需要更强的能力，可以使用 `model` 字段指定其他模型。

该模型唯一的任务是以 JSON 格式返回“是/否”决策：

- `"ok": true`：操作继续执行
- `"ok": false`：操作被阻止。模型返回的 `"reason"` 会反馈给 Claude，以便其进行调整。

以下示例使用 `Stop` 钩子询问模型所有请求的任务是否均已完成。如果模型返回 `"ok": false`，Claude 会继续工作，并将 `reason` 用作下一条指令：

```json  theme={null}
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Check if all tasks are complete. If not, respond with {\"ok\": false, \"reason\": \"what remains to be done\"}."
          }
        ]
      }
    ]
  }
}
```

有关完整的配置选项，请参阅参考文档中的[基于提示词的钩子](/en/hooks#prompt-based-hooks)。

## 基于代理的钩子

当验证过程需要检查文件或运行命令时，请使用 `type: "agent"` 钩子。与仅进行一次 LLM 调用的提示词钩子不同，代理钩子会生成一个子代理，该子代理可以读取文件、搜索代码并使用其他工具验证条件，然后再返回决策。

代理钩子使用与提示词钩子相同的 `"ok"` / `"reason"` 响应格式，但其默认超时时间更长，为 60 秒，并且最多可执行 50 轮工具调用。

以下示例会在允许 Claude 停止之前验证测试是否通过：

```json  theme={null}
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verify that all unit tests pass. Run the test suite and check the results. $ARGUMENTS",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

当仅凭钩子的输入数据就足以做出决策时，请使用提示词钩子。当需要根据代码库的实际状态验证某些内容时，请使用代理钩子。

有关完整的配置选项，请参阅参考文档中的[基于代理的钩子](/en/hooks#agent-based-hooks)。

## 限制与故障排除

### 限制

- 钩子只能通过 stdout、stderr 和退出代码进行通信。它们无法直接触发斜杠命令或工具调用。
- 钩子的默认超时时间为 10 分钟，可以使用每个钩子的 `timeout` 字段（以秒为单位）进行配置。
- `PostToolUse` 钩子无法撤销操作，因为工具已经执行完毕。
- `PermissionRequest` 钩子不会在[非交互模式](/en/headless)（`-p`）下触发。请使用 `PreToolUse` 钩子自动做出权限决策。
- 每当 Claude 完成响应时，都会触发 `Stop` 钩子，而不仅仅是在任务完成时。用户中断时不会触发这些钩子。

### Hook 未触发

Hook 已配置，但从未执行。

- 运行 `/hooks`，确认该 Hook 出现在正确的事件下
- 检查 matcher 模式是否与工具名称完全匹配（matcher 区分大小写）
- 确认触发的是正确的事件类型（例如，`PreToolUse` 在工具执行前触发，`PostToolUse` 在工具执行后触发）
- 如果在非交互模式（`-p`）下使用 `PermissionRequest` Hook，请改用 `PreToolUse`

### 输出中出现 Hook 错误

你在对话记录中看到类似 "PreToolUse hook error: ..." 的消息。

- 你的脚本意外以非零代码退出。通过管道传入示例 JSON 来手动测试：

  ```bash  theme={null}
  echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | ./my-hook.sh
  echo $?  # Check the exit code
  ```

* 如果看到 "command not found"，请使用绝对路径或 `$CLAUDE_PROJECT_DIR` 来引用脚本
- 如果看到 "jq: command not found"，请安装 `jq`，或使用 Python/Node.js 解析 JSON
- 如果脚本完全没有运行，请将其设为可执行：`chmod +x ./my-hook.sh`

### `/hooks` 显示未配置任何 Hook

你编辑了设置文件，但 Hook 没有出现在菜单中。

- 重启会话或打开 `/hooks` 以重新加载。通过 `/hooks` 菜单添加的 Hook 会立即生效，但手动编辑文件后需要重新加载。
- 验证 JSON 是否有效（不允许使用尾随逗号和注释）
- 确认设置文件位于正确的位置：项目 Hook 使用 `.claude/settings.json`，全局 Hook 使用 `~/.claude/settings.json`

### Stop Hook 永久运行

Claude 不断工作并陷入无限循环，而不是停止。

你的 Stop Hook 脚本需要检查它是否已经触发过继续执行。从 JSON 输入中解析 `stop_hook_active` 字段，如果其值为 `true`，则提前退出：

```bash  theme={null}
#!/bin/bash
INPUT=$(cat)
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0  # Allow Claude to stop
fi
# ... rest of your hook logic
```

### JSON 验证失败

即使 Hook 脚本输出了有效的 JSON，Claude Code 仍会显示 JSON 解析错误。

Claude Code 运行 Hook 时，会启动一个读取你的配置文件（`~/.zshrc` 或 `~/.bashrc`）的 shell。如果配置文件中包含无条件执行的 `echo` 语句，其输出会被添加到 Hook 的 JSON 之前：

```
Shell ready on arm64
{"decision": "block", "reason": "Not allowed"}
```

Claude Code 会尝试将其作为 JSON 解析，因而失败。要修复此问题，请将 shell 配置文件中的 echo 语句包装起来，使其仅在交互式 shell 中运行：

```bash  theme={null}
# In ~/.zshrc or ~/.bashrc
if [[ $- == *i* ]]; then
  echo "Shell ready"
fi
```

`$-` 变量包含 shell 标志，其中 `i` 表示交互模式。Hook 在非交互式 shell 中运行，因此会跳过 echo。

### 调试技巧

使用 `Ctrl+O` 切换详细模式，以便在对话记录中查看 Hook 输出；也可以运行 `claude --debug`，查看完整的执行详情，包括匹配了哪些 Hook 及其退出代码。

## 了解更多

- [Hook 参考文档](/en/hooks)：完整的事件架构、JSON 输出格式、异步 Hook 和 MCP 工具 Hook
- [安全注意事项](/en/hooks#security-considerations)：在共享环境或生产环境中部署 Hook 前请先阅读
- [Bash 命令验证器示例](https://github.com/anthropics/claude-code/blob/main/examples/hooks/bash_command_validator_example.py)：完整的参考实现

---

> ## 文档索引
>
> 获取完整的文档索引：<https://code.claude.com/docs/llms.txt>
> 在进一步探索之前，请使用此文件查找所有可用页面。

# Hooks 参考

> Claude Code hook 事件、配置 schema、JSON 输入/输出格式、退出代码、异步 hook、提示词 hook 和 MCP 工具 hook 的参考文档。

<Tip>
  如需包含示例的快速入门指南，请参阅[使用 hook 自动化工作流](/en/hooks-guide)。
</Tip>

Hook 是用户定义的 shell 命令或 LLM 提示词，会在 Claude Code 生命周期中的特定节点自动执行。可使用此参考文档查阅事件 schema、配置选项、JSON 输入/输出格式，以及异步 hook 和 MCP 工具 hook 等高级功能。如果你是第一次设置 hook，请先阅读[指南](/en/hooks-guide)。

## Hook 生命周期

Hook 会在 Claude Code 会话期间的特定节点触发。当事件触发且 matcher 匹配时，Claude Code 会将有关该事件的 JSON 上下文传递给你的 hook handler。对于命令 hook，这些内容通过 stdin 传入。随后，你的 handler 可以检查输入、执行操作，并选择性地返回决策。有些事件在每个会话中仅触发一次，而另一些事件则会在智能体循环内反复触发：

<div style={{maxWidth: "500px", margin: "0 auto"}}>
  <Frame>
    <img src="https://mintcdn.com/claude-code/z2YM37Ycg6eMbID3/images/hooks-lifecycle.png?fit=max&auto=format&n=z2YM37Ycg6eMbID3&q=85&s=5c25fedbc3db6f8882af50c3cc478c32" alt="Hook 生命周期图，展示从 SessionStart 开始，经过智能体循环，直至 SessionEnd 的 hook 顺序" data-og-width="8876" width="8876" data-og-height="12492" height="12492" data-path="images/hooks-lifecycle.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/claude-code/z2YM37Ycg6eMbID3/images/hooks-lifecycle.png?w=280&fit=max&auto=format&n=z2YM37Ycg6eMbID3&q=85&s=62406fcd5d4a189cc8842ee1bd946b84 280w, https://mintcdn.com/claude-code/z2YM37Ycg6eMbID3/images/hooks-lifecycle.png?w=560&fit=max&auto=format&n=z2YM37Ycg6eMbID3&q=85&s=fa3049022a6973c5f974e0f95b28169d 560w, https://mintcdn.com/claude-code/z2YM37Ycg6eMbID3/images/hooks-lifecycle.png?w=840&fit=max&auto=format&n=z2YM37Ycg6eMbID3&q=85&s=bd2890897db61a03160b93d4f972ff8e 840w, https://mintcdn.com/claude-code/z2YM37Ycg6eMbID3/images/hooks-lifecycle.png?w=1100&fit=max&auto=format&n=z2YM37Ycg6eMbID3&q=85&s=7ae8e098340479347135e39df4a13454 1100w, https://mintcdn.com/claude-code/z2YM37Ycg6eMbID3/images/hooks-lifecycle.png?w=1650&fit=max&auto=format&n=z2YM37Ycg6eMbID3&q=85&s=848a8606aab22c2ccaa16b6a18431e32 1650w, https://mintcdn.com/claude-code/z2YM37Ycg6eMbID3/images/hooks-lifecycle.png?w=2500&fit=max&auto=format&n=z2YM37Ycg6eMbID3&q=85&s=f3a9ef7feb61fa8fe362005aa185efbc 2500w" />
  </Frame>
</div>

下表概述了每个事件的触发时机。[Hook 事件](#hook-events)部分记录了每个事件的完整输入 schema 和决策控制选项。

| 事件                 | 触发时机                                             |
| :------------------- | :--------------------------------------------------- |
| `SessionStart`       | 会话开始或恢复时                                     |
| `UserPromptSubmit`   | 提交提示词后、Claude 处理之前                         |
| `PreToolUse`         | 工具调用执行之前。可阻止其执行                       |
| `PermissionRequest`  | 权限对话框出现时                                     |
| `PostToolUse`        | 工具调用成功后                                       |
| `PostToolUseFailure` | 工具调用失败后                                       |
| `Notification`       | Claude Code 发送通知时                               |
| `SubagentStart`      | 子智能体生成时                                       |
| `SubagentStop`       | 子智能体完成时                                       |
| `Stop`               | Claude 完成响应时                                    |
| `PreCompact`         | 上下文压缩之前                                       |
| `SessionEnd`         | 会话终止时                                           |

### Hook 如何解析

要了解这些部分如何协同工作，请看下面这个会阻止破坏性 shell 命令的 `PreToolUse` Hook。该 Hook 会在每次调用 Bash 工具之前运行 `block-rm.sh`：

```json  theme={null}
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/block-rm.sh"
          }
        ]
      }
    ]
  }
}
```

该脚本从 stdin 读取 JSON 输入，提取命令，并在命令包含 `rm -rf` 时返回值为 `"deny"` 的 `permissionDecision`：

```bash  theme={null}
#!/bin/bash
# .claude/hooks/block-rm.sh
COMMAND=$(jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q 'rm -rf'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Destructive command blocked by hook"
    }
  }'
else
  exit 0  # allow the command
fi
```

现在，假设 Claude Code 决定运行 `Bash "rm -rf /tmp/build"`。以下是具体过程：

<Frame>
  <img src="https://mintcdn.com/claude-code/s7NM0vfd_wres2nf/images/hook-resolution.svg?fit=max&auto=format&n=s7NM0vfd_wres2nf&q=85&s=7c13f51ffcbc37d22a593b27e2f2de72" alt="Hook 解析流程：PreToolUse 事件触发，matcher 检查是否匹配 Bash，Hook 处理程序运行，结果返回 Claude Code" data-og-width="780" width="780" data-og-height="290" height="290" data-path="images/hook-resolution.svg" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/claude-code/s7NM0vfd_wres2nf/images/hook-resolution.svg?w=280&fit=max&auto=format&n=s7NM0vfd_wres2nf&q=85&s=36a39a07e8bc1995dcb4639e09846905 280w, https://mintcdn.com/claude-code/s7NM0vfd_wres2nf/images/hook-resolution.svg?w=560&fit=max&auto=format&n=s7NM0vfd_wres2nf&q=85&s=6568d90c596c7605bbac2c325b0a0c86 560w, https://mintcdn.com/claude-code/s7NM0vfd_wres2nf/images/hook-resolution.svg?w=840&fit=max&auto=format&n=s7NM0vfd_wres2nf&q=85&s=255a6f68b9475a0e41dbde7b88002dad 840w, https://mintcdn.com/claude-code/s7NM0vfd_wres2nf/images/hook-resolution.svg?w=1100&fit=max&auto=format&n=s7NM0vfd_wres2nf&q=85&s=dcecf8d5edc88cd2bc49deb006d5760d 1100w, https://mintcdn.com/claude-code/s7NM0vfd_wres2nf/images/hook-resolution.svg?w=1650&fit=max&auto=format&n=s7NM0vfd_wres2nf&q=85&s=04fe51bf69ae375e9fd517f18674e35f 1650w, https://mintcdn.com/claude-code/s7NM0vfd_wres2nf/images/hook-resolution.svg?w=2500&fit=max&auto=format&n=s7NM0vfd_wres2nf&q=85&s=b1b76e0b77fddb5c7fa7bf302dacd80b 2500w" />
</Frame>

<Steps>
  <Step title="事件触发">
    `PreToolUse` 事件触发。Claude Code 通过 stdin 将工具输入以 JSON 格式发送给 Hook：

    ```json  theme={null}
    { "tool_name": "Bash", "tool_input": { "command": "rm -rf /tmp/build" }, ... }
    ```
  </Step>

  <Step title="Matcher 检查">
    Matcher `"Bash"` 与工具名称匹配，因此 `block-rm.sh` 会运行。如果省略 Matcher 或使用 `"*"`，该 Hook 会在此事件每次发生时运行。只有在定义了 Matcher 且其不匹配时，Hook 才会跳过。
  </Step>

<Step title="钩子处理程序运行">
    脚本从输入中提取 `"rm -rf /tmp/build"` 并找到 `rm -rf`，因此它会将决定输出到 stdout：

    ```json  theme={null}
    {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "Destructive command blocked by hook"
      }
    }
    ```

    如果命令是安全的（如 `npm test`），脚本会转而执行 `exit 0`，这会告知 Claude Code 允许该工具调用，无需采取进一步操作。
  </Step>

  <Step title="Claude Code 根据结果执行操作">
    Claude Code 读取 JSON 决定，阻止工具调用，并向 Claude 显示原因。
  </Step>
</Steps>

下方的[配置](#configuration)部分记录了完整的 schema，而每个[钩子事件](#hook-events)部分则记录了命令会接收什么输入以及可以返回什么输出。

## 配置

钩子在 JSON 设置文件中定义。配置包含三个嵌套层级：

1. 选择要响应的[钩子事件](#hook-events)，例如 `PreToolUse` 或 `Stop`
2. 添加一个[匹配器组](#matcher-patterns)来筛选触发条件，例如“仅针对 Bash 工具”
3. 定义一个或多个匹配时要运行的[钩子处理程序](#hook-handler-fields)

有关带注释示例的完整演练，请参阅上文的[钩子如何解析](#how-a-hook-resolves)。

<Note>
  本页面对每个层级使用特定术语：**钩子事件**表示生命周期节点，**匹配器组**表示筛选器，**钩子处理程序**表示运行的 shell 命令、提示词或代理。单独使用“钩子”时，指的是这一通用功能。
</Note>

### 钩子位置

定义钩子的位置决定了它的作用域：

| 位置                                                       | 作用域                       | 可共享性                           |
| :--------------------------------------------------------- | :--------------------------- | :--------------------------------- |
| `~/.claude/settings.json`                                  | 你的所有项目                 | 否，仅限本地计算机                 |
| `.claude/settings.json`                                    | 单个项目                     | 是，可以提交到仓库                 |
| `.claude/settings.local.json`                              | 单个项目                     | 否，已被 git 忽略                  |
| 托管策略设置                                               | 整个组织                     | 是，由管理员控制                   |
| [插件](/en/plugins) `hooks/hooks.json`                     | 插件启用时                   | 是，与插件捆绑                     |
| [技能](/en/skills)或[代理](/en/sub-agents)的 frontmatter   | 组件处于活动状态时           | 是，在组件文件中定义               |

有关设置文件解析的详细信息，请参阅[设置](/en/settings)。企业管理员可以使用 `allowManagedHooksOnly` 阻止用户、项目和插件钩子。请参阅[钩子配置](/en/settings#hook-configuration)。

### 匹配器模式

`matcher` 字段是一个正则表达式字符串，用于筛选钩子的触发时机。使用 `"*"`、`""`，或完全省略 `matcher`，即可匹配所有事件。每种事件类型匹配的字段各不相同：

| 事件                                                                   | 匹配器筛选的内容         | 匹配器值示例                                                                   |
| :--------------------------------------------------------------------- | :----------------------- | :----------------------------------------------------------------------------- |
| `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest` | 工具名称                 | `Bash`, `Edit\|Write`, `mcp__.*`                                               |
| `SessionStart`                                                         | 会话的启动方式           | `startup`, `resume`, `clear`, `compact`                                        |
| `SessionEnd`                                                           | 会话结束的原因           | `clear`, `logout`, `prompt_input_exit`, `bypass_permissions_disabled`, `other` |
| `Notification`                                                         | 通知类型                 | `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog`       |
| `SubagentStart`                                                        | 代理类型                 | `Bash`, `Explore`, `Plan`，或自定义代理名称                                    |
| `PreCompact`                                                           | 触发压缩的方式           | `manual`, `auto`                                                               |
| `SubagentStop`                                                         | 代理类型                 | 与 `SubagentStart` 相同的值                                                    |
| `UserPromptSubmit`, `Stop`                                             | 不支持匹配器             | 每次事件发生时始终触发                                                         |

匹配器是正则表达式，因此 `Edit|Write` 可以匹配任一工具，而 `Notebook.*` 可以匹配任何以 Notebook 开头的工具。匹配器会针对 Claude Code 通过 stdin 发送给钩子的 [JSON 输入](#hook-input-and-output)中的某个字段运行。对于工具事件，该字段是 `tool_name`。每个[钩子事件](#hook-events)章节都列出了该事件的完整匹配器值集合及其输入模式。

以下示例仅在 Claude 写入或编辑文件时运行 lint 脚本：

```json  theme={null}
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/lint-check.sh"
          }
        ]
      }
    ]
  }
}
```

`UserPromptSubmit` 和 `Stop` 不支持匹配器，并且每次事件发生时始终触发。如果向这些事件添加 `matcher` 字段，该字段会被静默忽略。

#### 匹配 MCP 工具

[MCP](/en/mcp) 服务器工具在工具事件（`PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest`）中显示为常规工具，因此你可以像匹配其他任何工具名称一样匹配它们。

MCP 工具遵循 `mcp__<server>__<tool>` 命名模式，例如：

- `mcp__memory__create_entities`：Memory 服务器的创建实体工具
- `mcp__filesystem__read_file`：Filesystem 服务器的读取文件工具
- `mcp__github__search_repositories`：GitHub 服务器的搜索工具

使用正则表达式模式来匹配特定的 MCP 工具或工具组：

- `mcp__memory__.*` 匹配来自 `memory` 服务器的所有工具
- `mcp__.*__write.*` 匹配来自任意服务器且名称中包含 "write" 的任何工具

此示例会记录所有 Memory 服务器操作，并验证来自任意 MCP 服务器的写入操作：

```json  theme={null}
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__memory__.*",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Memory operation initiated' >> ~/mcp-operations.log"
          }
        ]
      },
      {
        "matcher": "mcp__.*__write.*",
        "hooks": [
          {
            "type": "command",
            "command": "/home/user/scripts/validate-mcp-write.py"
          }
        ]
      }
    ]
  }
}
```

### Hook 处理程序字段

内部 `hooks` 数组中的每个对象都是一个 Hook 处理程序：即匹配器匹配时运行的 Shell 命令、LLM 提示词或代理。共有三种类型：

- **[命令 Hook](#command-hook-fields)**（`type: "command"`）：运行 Shell 命令。你的脚本通过 stdin 接收事件的 [JSON 输入](#hook-input-and-output)，并通过退出码和 stdout 返回结果。
- **[提示词 Hook](#prompt-and-agent-hook-fields)**（`type: "prompt"`）：向 Claude 模型发送提示词以进行单轮评估。模型以 JSON 格式返回“是/否”决策。请参阅[基于提示词的 Hook](#prompt-based-hooks)。
- **[代理 Hook](#prompt-and-agent-hook-fields)**（`type: "agent"`）：启动一个子代理，该代理可以使用 Read、Grep 和 Glob 等工具验证条件，然后返回决策。请参阅[基于代理的 Hook](#agent-based-hooks)。

#### 通用字段

以下字段适用于所有 Hook 类型：

| 字段            | 必需 | 描述                                                                                                                                          |
| :-------------- | :--- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`          | 是   | `"command"`、`"prompt"` 或 `"agent"`                                                                                                          |
| `timeout`       | 否   | 取消前等待的秒数。默认值：command 为 600，prompt 为 30，agent 为 60                                                                           |
| `statusMessage` | 否   | Hook 运行时显示的自定义加载提示消息                                                                                                           |
| `once`          | 否   | 如果为 `true`，则每个会话仅运行一次，之后便会被移除。仅适用于 Skill，不适用于代理。请参阅 [Skill 和代理中的 Hook](#hooks-in-skills-and-agents) |

#### 命令钩子字段

除[通用字段](#common-fields)外，命令钩子还接受以下字段：

| 字段      | 必需 | 描述                                                                                                               |
| :-------- | :--- | :----------------------------------------------------------------------------------------------------------------- |
| `command` | 是   | 要执行的 Shell 命令                                                                                                |
| `async`   | 否   | 如果为 `true`，则在后台运行而不阻塞。请参阅[在后台运行钩子](#run-hooks-in-the-background)                           |

#### 提示词和代理钩子字段

除[通用字段](#common-fields)外，提示词和代理钩子还接受以下字段：

| 字段     | 必需 | 描述                                                                            |
| :------- | :--- | :------------------------------------------------------------------------------ |
| `prompt` | 是   | 要发送给模型的提示词文本。使用 `$ARGUMENTS` 作为钩子输入 JSON 的占位符          |
| `model`  | 否   | 用于评估的模型。默认为快速模型                                                  |

所有匹配的钩子都会并行运行，相同的处理程序会自动去重。处理程序在当前目录中使用 Claude Code 的环境运行。在远程 Web 环境中，`$CLAUDE_CODE_REMOTE` 环境变量会被设置为 `"true"`；在本地 CLI 中则不会设置。

### 通过路径引用脚本

使用环境变量引用相对于项目或插件根目录的钩子脚本，无论钩子运行时的工作目录是什么：

- `$CLAUDE_PROJECT_DIR`：项目根目录。用引号括起来，以处理包含空格的路径。
- `${CLAUDE_PLUGIN_ROOT}`：插件的根目录，用于引用随[插件](/en/plugins)捆绑的脚本。

<Tabs>
  <Tab title="项目脚本">
    此示例使用 `$CLAUDE_PROJECT_DIR`，在任何 `Write` 或 `Edit` 工具调用后，从项目的 `.claude/hooks/` 目录运行样式检查器：

    ```json  theme={null}
    {
      "hooks": {
        "PostToolUse": [
          {
            "matcher": "Write|Edit",
            "hooks": [
              {
                "type": "command",
                "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/check-style.sh"
              }
            ]
          }
        ]
      }
    }
    ```
  </Tab>

  <Tab title="插件脚本">
    在 `hooks/hooks.json` 中定义插件钩子，并可选择添加顶层 `description` 字段。启用插件后，其钩子会与你的用户钩子和项目钩子合并。

    此示例运行随插件捆绑的格式化脚本：

    ```json  theme={null}
    {
      "description": "Automatic code formatting",
      "hooks": {
        "PostToolUse": [
          {
            "matcher": "Write|Edit",
            "hooks": [
              {
                "type": "command",
                "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh",
                "timeout": 30
              }
            ]
          }
        ]
      }
    }
    ```

有关创建插件钩子的详细信息，请参阅[插件组件参考](/en/plugins-reference#hooks)。
  </Tab>
</Tabs>

### 技能和代理中的钩子

除了设置文件和插件之外，还可以使用 frontmatter 直接在[技能](/en/skills)和[子代理](/en/sub-agents)中定义钩子。这些钩子的作用域限定在组件的生命周期内，并且仅在该组件处于活动状态时运行。

支持所有钩子事件。对于子代理，`Stop` 钩子会自动转换为 `SubagentStop`，因为子代理完成时触发的是该事件。

钩子使用与基于设置的钩子相同的配置格式，但其作用域限定在组件的生命周期内，并会在组件结束时被清理。

此技能定义了一个 `PreToolUse` 钩子，该钩子会在每条 `Bash` 命令执行前运行安全验证脚本：

```yaml  theme={null}
---
name: secure-operations
description: Perform operations with security checks
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
---
```

代理在其 YAML frontmatter 中使用相同的格式。

### `/hooks` 菜单

在 Claude Code 中输入 `/hooks` 可打开交互式钩子管理器，你可以在其中查看、添加和删除钩子，而无需直接编辑设置文件。有关分步操作说明，请参阅指南中的[设置你的第一个钩子](/en/hooks-guide#set-up-your-first-hook)。

菜单中的每个钩子都带有一个方括号前缀标签，用于指示其来源：

- `[User]`：来自 `~/.claude/settings.json`
- `[Project]`：来自 `.claude/settings.json`
- `[Local]`：来自 `.claude/settings.local.json`
- `[Plugin]`：来自插件的 `hooks/hooks.json`，只读

### 禁用或移除钩子

要移除钩子，请从设置 JSON 文件中删除其条目，或者使用 `/hooks` 菜单并选择要删除的钩子。

要在不移除所有钩子的情况下暂时禁用它们，请在设置文件中设置 `"disableAllHooks": true`，或者使用 `/hooks` 菜单中的切换开关。无法在保留某个钩子配置的同时单独禁用该钩子。

直接编辑设置文件中的钩子不会立即生效。Claude Code 会在启动时捕获钩子的快照，并在整个会话期间使用该快照。这样可以防止恶意或意外的钩子修改在会话进行期间未经你审核就生效。如果钩子在外部被修改，Claude Code 会向你发出警告，并要求你在 `/hooks` 菜单中审核后，更改才会应用。

## 钩子的输入和输出

钩子通过 stdin 接收 JSON 数据，并通过退出代码、stdout 和 stderr 传递结果。本节介绍所有事件共有的字段和行为。[钩子事件](#hook-events)下的每个事件章节都包含该事件特定的输入模式和决策控制选项。

### 通用输入字段

除了各个[钩子事件](#hook-events)章节中记录的事件特定字段外，所有钩子事件还会通过 stdin 以 JSON 形式接收以下字段：

| 字段              | 说明                                                                                                                                       |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `session_id`      | 当前会话标识符                                                                                                                             |
| `transcript_path` | 对话 JSON 的路径                                                                                                                           |
| `cwd`             | 调用钩子时的当前工作目录                                                                                                                   |
| `permission_mode` | 当前[权限模式](/en/permissions#permission-modes)：`"default"`、`"plan"`、`"acceptEdits"`、`"dontAsk"` 或 `"bypassPermissions"` |
| `hook_event_name` | 触发的事件名称                                                                                                                             |

例如，针对 Bash 命令的 `PreToolUse` 钩子会在标准输入中接收到以下内容：

```json  theme={null}
{
  "session_id": "abc123",
  "transcript_path": "/home/user/.claude/projects/.../transcript.jsonl",
  "cwd": "/home/user/my-project",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test"
  }
}
```

`tool_name` 和 `tool_input` 字段是特定于事件的。每个[钩子事件](#hook-events)章节都记录了该事件的附加字段。

### 退出代码输出

钩子命令的退出代码会告知 Claude Code 该操作应该继续、被阻止还是被忽略。

**退出代码 0** 表示成功。Claude Code 会解析标准输出中的 [JSON 输出字段](#json-output)。只有退出代码为 0 时才会处理 JSON 输出。对于大多数事件，标准输出仅在详细模式（`Ctrl+O`）下显示。`UserPromptSubmit` 和 `SessionStart` 是例外，在这两种情况下，标准输出会作为上下文添加，Claude 可以看到并据此采取行动。

**退出代码 2** 表示阻塞性错误。Claude Code 会忽略标准输出及其中的所有 JSON。相反，标准错误文本会作为错误消息反馈给 Claude。具体效果取决于事件：`PreToolUse` 会阻止工具调用，`UserPromptSubmit` 会拒绝提示词，依此类推。完整列表请参阅[退出代码 2 的行为](#exit-code-2-behavior-per-event)。

**任何其他退出代码**都表示非阻塞性错误。标准错误会在详细模式（`Ctrl+O`）下显示，执行则会继续。

例如，以下钩子命令脚本会阻止危险的 Bash 命令：

```bash  theme={null}
#!/bin/bash
# Reads JSON input from stdin, checks the command
command=$(jq -r '.tool_input.command' < /dev/stdin)

if [[ "$command" == rm* ]]; then
  echo "Blocked: rm commands are not allowed" >&2
  exit 2  # Blocking error: tool call is prevented
fi

exit 0  # Success: tool call proceeds
```

#### 各事件中退出代码 2 的行为

退出代码 2 是钩子发出“停止，不要执行此操作”信号的方式。其效果取决于事件，因为有些事件代表可以被阻止的操作（例如尚未发生的工具调用），而另一些事件则代表已经发生或无法阻止的操作。

| 钩子事件             | 可以阻止？ | 退出代码为 2 时会发生什么                                 |
| :------------------- | :--------- | :-------------------------------------------------------- |
| `PreToolUse`         | 是         | 阻止工具调用                                              |
| `PermissionRequest`  | 是         | 拒绝权限请求                                              |
| `UserPromptSubmit`   | 是         | 阻止处理提示词并清除该提示词                              |
| `Stop`               | 是         | 阻止 Claude 停止并继续对话                                |
| `SubagentStop`       | 是         | 阻止子代理停止                                            |
| `PostToolUse`        | 否         | 向 Claude 显示标准错误（工具已运行）                      |
| `PostToolUseFailure` | 否         | 向 Claude 显示标准错误（工具已经失败）                    |
| `Notification`       | 否         | 仅向用户显示标准错误                                      |
| `SubagentStart`      | 否         | 仅向用户显示标准错误                                      |
| `SessionStart`       | 否         | 仅向用户显示标准错误                                      |
| `SessionEnd`         | 否         | 仅向用户显示标准错误                                      |
| `PreCompact`         | 否         | 仅向用户显示标准错误                                      |

### JSON 输出

退出代码可用于允许或阻止操作，而 JSON 输出则能提供更细粒度的控制。与其通过代码 2 退出以进行阻止，不如通过代码 0 退出，并将一个 JSON 对象打印到 stdout。Claude Code 会读取该 JSON 中的特定字段来控制行为，包括用于阻止、允许操作或将决定交由用户处理的[决策控制](#decision-control)。

<Note>
  对于每个 hook，你必须选择一种方式，不能同时使用两种方式：要么仅使用退出代码发出信号，要么通过代码 0 退出并打印 JSON 以进行结构化控制。Claude Code 仅在退出代码为 0 时处理 JSON。如果通过代码 2 退出，则会忽略所有 JSON。
</Note>

hook 的 stdout 必须仅包含 JSON 对象。如果你的 shell 配置文件在启动时打印文本，可能会干扰 JSON 解析。请参阅故障排除指南中的 [JSON 验证失败](/en/hooks-guide#json-validation-failed)。

JSON 对象支持三类字段：

- **通用字段**（如 `continue`）适用于所有事件。下表列出了这些字段。
- **顶层 `decision` 和 `reason`** 由某些事件用于阻止操作或提供反馈。
- **`hookSpecificOutput`** 是一个嵌套对象，供需要更丰富控制能力的事件使用。它要求将 `hookEventName` 字段设置为事件名称。

| 字段             | 默认值  | 说明                                                                                                   |
| :--------------- | :------ | :----------------------------------------------------------------------------------------------------- |
| `continue`       | `true`  | 如果为 `false`，Claude 会在 hook 运行后完全停止处理。其优先级高于任何事件特定的决策字段                 |
| `stopReason`     | 无      | 当 `continue` 为 `false` 时向用户显示的消息。不会向 Claude 显示                                       |
| `suppressOutput` | `false` | 如果为 `true`，则在详细模式输出中隐藏 stdout                                                           |
| `systemMessage`  | 无      | 向用户显示的警告消息                                                                                   |

无论事件类型如何，要完全停止 Claude：

```json  theme={null}
{ "continue": false, "stopReason": "Build failed, fix errors before continuing" }
```

#### 决策控制

并非每个事件都支持通过 JSON 阻止或控制行为。支持此功能的不同事件会使用不同的字段集合来表达该决策。在编写 hook 之前，请使用此表进行快速参考：

| 事件                                                                  | 决策模式             | 关键字段                                                         |
| :-------------------------------------------------------------------- | :------------------- | :--------------------------------------------------------------- |
| UserPromptSubmit, PostToolUse, PostToolUseFailure, Stop, SubagentStop | 顶层 `decision`      | `decision: "block"`, `reason`                                    |
| PreToolUse                                                            | `hookSpecificOutput` | `permissionDecision` (allow/deny/ask), `permissionDecisionReason` |
| PermissionRequest                                                     | `hookSpecificOutput` | `decision.behavior` (allow/deny)                                 |

以下是每种模式的实际应用示例：

<Tabs>
  <Tab title="顶层决策">
    供 `UserPromptSubmit`、`PostToolUse`、`PostToolUseFailure`、`Stop` 和 `SubagentStop` 使用。唯一可用的值是 `"block"`——若要允许操作继续，请从 JSON 中省略 `decision`，或者以退出码 0 退出且完全不输出任何 JSON：

    ```json  theme={null}
    {
      "decision": "block",
      "reason": "Test suite must pass before proceeding"
    }
    ```
  </Tab>

  <Tab title="PreToolUse">
    使用 `hookSpecificOutput` 实现更丰富的控制：允许、拒绝或上报给用户。你还可以在工具运行前修改其输入，或为 Claude 注入额外上下文。有关完整的选项集，请参阅 [PreToolUse 决策控制](#pretooluse-decision-control)。

    ```json  theme={null}
    {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "Database writes are not allowed"
      }
    }
    ```
  </Tab>

  <Tab title="PermissionRequest">
    使用 `hookSpecificOutput` 代表用户允许或拒绝权限请求。允许请求时，你还可以修改工具的输入或应用权限规则，以免再次提示用户。有关完整的选项集，请参阅 [PermissionRequest 决策控制](#permissionrequest-decision-control)。

    ```json  theme={null}
    {
      "hookSpecificOutput": {
        "hookEventName": "PermissionRequest",
        "decision": {
          "behavior": "allow",
          "updatedInput": {
            "command": "npm run lint"
          }
        }
      }
    }
    ```
  </Tab>
</Tabs>

有关包括 Bash 命令验证、提示词过滤和自动批准脚本在内的扩展示例，请参阅指南中的[可以自动执行的操作](/en/hooks-guide#what-you-can-automate)以及 [Bash 命令验证器参考实现](https://github.com/anthropics/claude-code/blob/main/examples/hooks/bash_command_validator_example.py)。

## Hook 事件

每个事件都对应 Claude Code 生命周期中可以运行 hook 的一个时点。以下各节按照生命周期顺序排列：从会话设置开始，经过智能体循环，直至会话结束。每一节都会说明事件何时触发、支持哪些匹配器、接收什么 JSON 输入，以及如何通过输出来控制行为。

### SessionStart

当 Claude Code 启动新会话或恢复现有会话时运行。适合用于加载开发上下文，例如现有 issue 或代码库近期的变更，也可用于设置环境变量。对于不需要脚本的静态上下文，请改用 [CLAUDE.md](/en/memory)。

SessionStart 会在每次会话时运行，因此请确保这些 hook 能够快速执行。

匹配器的值对应会话的启动方式：

| 匹配器    | 触发时机                               |
| :-------- | :------------------------------------- |
| `startup` | 新会话                                 |
| `resume`  | `--resume`、`--continue` 或 `/resume` |
| `clear`   | `/clear`                               |
| `compact` | 自动或手动压缩                         |

#### SessionStart 输入

除[通用输入字段](#common-input-fields)外，SessionStart 钩子还会接收 `source`、`model`，以及可选的 `agent_type`。`source` 字段指示会话的启动方式：新会话为 `"startup"`，恢复的会话为 `"resume"`，执行 `/clear` 后为 `"clear"`，压缩后为 `"compact"`。`model` 字段包含模型标识符。如果你使用 `claude --agent <name>` 启动 Claude Code，则 `agent_type` 字段包含代理名称。

```json  theme={null}
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "SessionStart",
  "source": "startup",
  "model": "claude-sonnet-4-5-20250929"
}
```

#### SessionStart 决策控制

钩子脚本输出到 stdout 的任何文本都会作为上下文添加给 Claude。除所有钩子均可使用的 [JSON 输出字段](#json-output)外，你还可以返回以下事件专用字段：

| 字段                | 描述                                                               |
| :------------------ | :------------------------------------------------------------------------ |
| `additionalContext` | 添加到 Claude 上下文中的字符串。多个钩子的值会拼接在一起 |

```json  theme={null}
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "My additional context here"
  }
}
```

#### 持久化环境变量

SessionStart 钩子可以访问 `CLAUDE_ENV_FILE` 环境变量，该变量提供一个文件路径，你可以在其中持久化环境变量，供后续 Bash 命令使用。

要设置单个环境变量，请将 `export` 语句写入 `CLAUDE_ENV_FILE`。使用追加操作（`>>`）以保留其他钩子设置的变量：

```bash  theme={null}
#!/bin/bash

if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NODE_ENV=production' >> "$CLAUDE_ENV_FILE"
  echo 'export DEBUG_LOG=true' >> "$CLAUDE_ENV_FILE"
  echo 'export PATH="$PATH:./node_modules/.bin"' >> "$CLAUDE_ENV_FILE"
fi

exit 0
```

要捕获设置命令产生的所有环境变更，请比较执行前后导出的变量：

```bash  theme={null}
#!/bin/bash

ENV_BEFORE=$(export -p | sort)

# Run your setup commands that modify the environment
source ~/.nvm/nvm.sh
nvm use 20

if [ -n "$CLAUDE_ENV_FILE" ]; then
  ENV_AFTER=$(export -p | sort)
  comm -13 <(echo "$ENV_BEFORE") <(echo "$ENV_AFTER") >> "$CLAUDE_ENV_FILE"
fi

exit 0
```

写入此文件的任何变量都可供 Claude Code 在会话期间执行的所有后续 Bash 命令使用。

<Note>
  `CLAUDE_ENV_FILE` 可用于 SessionStart 钩子。其他钩子类型无法访问此变量。
</Note>

### UserPromptSubmit

在用户提交提示词后、Claude 处理提示词之前运行。这使你可以根据提示词/对话添加额外上下文、验证提示词，或阻止某些类型的提示词。

#### UserPromptSubmit 输入

除了[通用输入字段](#common-input-fields)之外，UserPromptSubmit 钩子还会接收 `prompt` 字段，其中包含用户提交的文本。

```json  theme={null}
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "UserPromptSubmit",
  "prompt": "Write a function to calculate the factorial of a number"
}
```

#### UserPromptSubmit 决策控制

`UserPromptSubmit` 钩子可以控制是否处理用户提示，并添加上下文。所有 [JSON 输出字段](#json-output)均可使用。

退出代码为 0 时，有两种方式可以向对话添加上下文：

- **纯文本 stdout**：任何写入 stdout 的非 JSON 文本都会被添加为上下文
- **包含 `additionalContext` 的 JSON**：使用下方的 JSON 格式可进行更精细的控制。`additionalContext` 字段会被添加为上下文

纯文本 stdout 会在对话记录中显示为钩子输出。`additionalContext` 字段的添加方式则更为隐蔽。

要阻止提示，请返回一个将 `decision` 设置为 `"block"` 的 JSON 对象：

| 字段                | 描述                                                                                                  |
| :------------------ | :---------------------------------------------------------------------------------------------------- |
| `decision`          | `"block"` 会阻止提示被处理，并将其从上下文中移除。省略此字段则允许提示继续处理                         |
| `reason`            | 当 `decision` 为 `"block"` 时向用户显示。不会添加到上下文                                             |
| `additionalContext` | 添加到 Claude 上下文中的字符串                                                                        |

```json  theme={null}
{
  "decision": "block",
  "reason": "Explanation for decision",
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "My additional context here"
  }
}
```

<Note>
  对于简单的使用场景，无需使用 JSON 格式。要添加上下文，可以在退出代码为 0 时将纯文本输出到 stdout。当你需要阻止提示或进行更结构化的控制时，请使用 JSON。
</Note>

### PreToolUse

在 Claude 创建工具参数之后、处理工具调用之前运行。按工具名称匹配：`Bash`、`Edit`、`Write`、`Read`、`Glob`、`Grep`、`Task`、`WebFetch`、`WebSearch`，以及任何 [MCP 工具名称](#match-mcp-tools)。

使用 [PreToolUse 决策控制](#pretooluse-decision-control)来允许、拒绝或请求使用该工具的权限。

#### PreToolUse 输入

除了[通用输入字段](#common-input-fields)之外，PreToolUse 钩子还会接收 `tool_name`、`tool_input` 和 `tool_use_id`。`tool_input` 的字段取决于具体工具：

##### Bash

执行 shell 命令。

| 字段                | 类型    | 示例               | 描述                     |
| :------------------ | :------ | :----------------- | :----------------------- |
| `command`           | string  | `"npm test"`       | 要执行的 shell 命令      |
| `description`       | string  | `"Run test suite"` | 对命令作用的可选描述     |
| `timeout`           | number  | `120000`           | 可选的超时时间，单位为毫秒 |
| `run_in_background` | boolean | `false`            | 是否在后台运行该命令     |

##### Write

创建或覆盖文件。

| 字段        | 类型   | 示例                  | 描述                     |
| :---------- | :----- | :-------------------- | :----------------------- |
| `file_path` | 字符串 | `"/path/to/file.txt"` | 要写入的文件的绝对路径   |
| `content`   | 字符串 | `"file content"`      | 要写入文件的内容         |

##### Edit

替换现有文件中的字符串。

| 字段          | 类型    | 示例                  | 描述                     |
| :------------ | :------ | :-------------------- | :----------------------- |
| `file_path`   | 字符串  | `"/path/to/file.txt"` | 要编辑的文件的绝对路径   |
| `old_string`  | 字符串  | `"original text"`     | 要查找并替换的文本       |
| `new_string`  | 字符串  | `"replacement text"`  | 替换文本                 |
| `replace_all` | 布尔值  | `false`               | 是否替换所有匹配项       |

##### Read

读取文件内容。

| 字段        | 类型   | 示例                  | 描述                         |
| :---------- | :----- | :-------------------- | :--------------------------- |
| `file_path` | 字符串 | `"/path/to/file.txt"` | 要读取的文件的绝对路径       |
| `offset`    | 数字   | `10`                  | 可选的开始读取行号           |
| `limit`     | 数字   | `50`                  | 可选的读取行数               |

##### Glob

查找与 glob 模式匹配的文件。

| 字段      | 类型   | 示例             | 描述                                         |
| :-------- | :----- | :--------------- | :------------------------------------------- |
| `pattern` | 字符串 | `"**/*.ts"`      | 用于匹配文件的 glob 模式                     |
| `path`    | 字符串 | `"/path/to/dir"` | 可选的搜索目录。默认为当前工作目录           |

##### Grep

使用正则表达式搜索文件内容。

| 字段          | 类型    | 示例             | 描述                                                                         |
| :------------ | :------ | :--------------- | :--------------------------------------------------------------------------- |
| `pattern`     | 字符串  | `"TODO.*fix"`    | 要搜索的正则表达式模式                                                       |
| `path`        | 字符串  | `"/path/to/dir"` | 可选的要搜索的文件或目录                                                     |
| `glob`        | 字符串  | `"*.ts"`         | 用于筛选文件的可选 glob 模式                                                 |
| `output_mode` | 字符串  | `"content"`      | `"content"`、`"files_with_matches"` 或 `"count"`。默认为 `"files_with_matches"` |
| `-i`          | 布尔值  | `true`           | 不区分大小写搜索                                                             |
| `multiline`   | 布尔值  | `false`          | 启用多行匹配                                                                 |

##### WebFetch

获取并处理 Web 内容。

| 字段     | 类型   | 示例                          | 描述                         |
| :------- | :----- | :---------------------------- | :--------------------------- |
| `url`    | string | `"https://example.com/api"`   | 要从中获取内容的 URL         |
| `prompt` | string | `"Extract the API endpoints"` | 对所获取内容运行的提示词     |

##### WebSearch

搜索 Web。

| 字段              | 类型   | 示例                           | 描述                           |
| :---------------- | :----- | :----------------------------- | :----------------------------- |
| `query`           | string | `"react hooks best practices"` | 搜索查询                       |
| `allowed_domains` | array  | `["docs.example.com"]`         | 可选：仅包含来自这些域名的结果 |
| `blocked_domains` | array  | `["spam.example.com"]`         | 可选：排除来自这些域名的结果   |

##### Task

生成一个[子代理](/en/sub-agents)。

| 字段            | 类型   | 示例                       | 描述                         |
| :-------------- | :----- | :------------------------- | :--------------------------- |
| `prompt`        | string | `"Find all API endpoints"` | 代理要执行的任务             |
| `description`   | string | `"Find API endpoints"`     | 任务的简短描述               |
| `subagent_type` | string | `"Explore"`                | 要使用的专用代理类型         |
| `model`         | string | `"sonnet"`                 | 可选：用于覆盖默认值的模型别名 |

#### PreToolUse 决策控制

`PreToolUse` 钩子可以控制工具调用是否继续执行。与使用顶层 `decision` 字段的其他钩子不同，PreToolUse 在 `hookSpecificOutput` 对象中返回其决策。这使其具有更丰富的控制能力：三种结果（允许、拒绝或询问），以及在执行前修改工具输入的能力。

| 字段                       | 描述                                                                                                                                           |
| :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `permissionDecision`       | `"allow"` 绕过权限系统，`"deny"` 阻止工具调用，`"ask"` 提示用户确认                                                                             |
| `permissionDecisionReason` | 对于 `"allow"` 和 `"ask"`，会向用户显示，但不会向 Claude 显示。对于 `"deny"`，会向 Claude 显示                                                   |
| `updatedInput`             | 在执行前修改工具的输入参数。与 `"allow"` 结合可自动批准，与 `"ask"` 结合可向用户显示修改后的输入                                                |
| `additionalContext`        | 在工具执行前添加到 Claude 上下文中的字符串                                                                                                     |

```json  theme={null}
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "My reason here",
    "updatedInput": {
      "field_to_modify": "new value"
    },
    "additionalContext": "Current environment: production. Proceed with caution."
  }
}
```

<Note>
  PreToolUse 以前使用顶层 `decision` 和 `reason` 字段，但对于此事件，这些字段已弃用。请改用 `hookSpecificOutput.permissionDecision` 和 `hookSpecificOutput.permissionDecisionReason`。已弃用的值 `"approve"` 和 `"block"` 分别映射到 `"allow"` 和 `"deny"`。PostToolUse 和 Stop 等其他事件仍继续使用顶层 `decision` 和 `reason` 作为其当前格式。
</Note>

### PermissionRequest

当向用户显示权限对话框时运行。
使用 [PermissionRequest 决策控制](#permissionrequest-decision-control) 代表用户允许或拒绝。

按工具名称进行匹配，其值与 PreToolUse 相同。

#### PermissionRequest 输入

PermissionRequest 钩子会接收与 PreToolUse 钩子类似的 `tool_name` 和 `tool_input` 字段，但不包含 `tool_use_id`。可选的 `permission_suggestions` 数组包含用户通常会在权限对话框中看到的“始终允许”选项。二者的区别在于钩子的触发时机：PermissionRequest 钩子在即将向用户显示权限对话框时运行，而 PreToolUse 钩子无论权限状态如何，都会在工具执行前运行。

```json  theme={null}
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "PermissionRequest",
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf node_modules",
    "description": "Remove node_modules directory"
  },
  "permission_suggestions": [
    { "type": "toolAlwaysAllow", "tool": "Bash" }
  ]
}
```

#### PermissionRequest 决策控制

`PermissionRequest` 钩子可以允许或拒绝权限请求。除了所有钩子都可使用的 [JSON 输出字段](#json-output) 外，钩子脚本还可以返回一个包含以下事件特定字段的 `decision` 对象：

| 字段                 | 描述                                                                                                 |
| :------------------- | :--------------------------------------------------------------------------------------------------- |
| `behavior`           | `"allow"` 授予权限，`"deny"` 拒绝权限                                                                |
| `updatedInput`       | 仅适用于 `"allow"`：在执行前修改工具的输入参数                                                       |
| `updatedPermissions` | 仅适用于 `"allow"`：应用权限规则更新，等同于用户选择“始终允许”选项                                   |
| `message`            | 仅适用于 `"deny"`：告知 Claude 权限被拒绝的原因                                                      |
| `interrupt`          | 仅适用于 `"deny"`：如果为 `true`，则停止 Claude                                                      |

```json  theme={null}
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow",
      "updatedInput": {
        "command": "npm run lint"
      }
    }
  }
}
```

### PostToolUse

在工具成功完成后立即运行。

按工具名称匹配，其值与 PreToolUse 相同。

#### PostToolUse 输入

`PostToolUse` 钩子在工具已成功执行后触发。输入中包含 `tool_input`（发送给工具的参数）和 `tool_response`（工具返回的结果）。两者的确切模式取决于具体工具。

```json  theme={null}
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "PostToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.txt",
    "content": "file content"
  },
  "tool_response": {
    "filePath": "/path/to/file.txt",
    "success": true
  },
  "tool_use_id": "toolu_01ABC123..."
}
```

#### PostToolUse 决策控制

`PostToolUse` 钩子可以在工具执行后向 Claude 提供反馈。除了所有钩子都可使用的 [JSON 输出字段](#json-output)之外，钩子脚本还可以返回以下特定于此事件的字段：

| 字段                   | 描述                                                                                       |
| :--------------------- | :----------------------------------------------------------------------------------------- |
| `decision`             | `"block"` 会使用 `reason` 提示 Claude。省略此字段则允许操作继续进行                         |
| `reason`               | 当 `decision` 为 `"block"` 时向 Claude 显示的说明                                           |
| `additionalContext`    | 供 Claude 考虑的附加上下文                                                                 |
| `updatedMCPToolOutput` | 仅适用于 [MCP 工具](#match-mcp-tools)：使用提供的值替换工具输出                             |

```json  theme={null}
{
  "decision": "block",
  "reason": "Explanation for decision",
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "Additional information for Claude"
  }
}
```

### PostToolUseFailure

在工具执行失败时运行。此事件会针对抛出错误或返回失败结果的工具调用触发。可使用此事件记录失败、发送警报或向 Claude 提供纠正性反馈。

按工具名称匹配，其值与 PreToolUse 相同。

#### PostToolUseFailure 输入

PostToolUseFailure 钩子接收与 PostToolUse 相同的 `tool_name` 和 `tool_input` 字段，并将错误信息作为顶层字段一并接收：

```json  theme={null}
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "PostToolUseFailure",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test",
    "description": "Run test suite"
  },
  "tool_use_id": "toolu_01ABC123...",
  "error": "Command exited with non-zero status code 1",
  "is_interrupt": false
}
```

| 字段           | 描述                                                     |
| :------------- | :------------------------------------------------------- |
| `error`        | 描述出错原因的字符串                                     |
| `is_interrupt` | 可选布尔值，指示失败是否由用户中断导致                   |

#### PostToolUseFailure 决策控制

`PostToolUseFailure` 钩子可以在工具失败后向 Claude 提供上下文。除了所有钩子都可用的 [JSON 输出字段](#json-output)之外，钩子脚本还可以返回以下特定于事件的字段：

| 字段                | 描述                                     |
| :------------------ | :--------------------------------------- |
| `additionalContext` | 供 Claude 在考虑错误时一并参考的附加上下文 |

```json  theme={null}
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUseFailure",
    "additionalContext": "Additional information about the failure for Claude"
  }
}
```

### 通知

在 Claude Code 发送通知时运行。匹配通知类型：`permission_prompt`、`idle_prompt`、`auth_success`、`elicitation_dialog`。省略匹配器可对所有通知类型运行钩子。

使用单独的匹配器，可根据通知类型运行不同的处理程序。以下配置会在 Claude 需要权限批准时触发权限专用提醒脚本，并在 Claude 处于空闲状态时触发另一种通知：

```json  theme={null}
{
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/permission-alert.sh"
          }
        ]
      },
      {
        "matcher": "idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/idle-notification.sh"
          }
        ]
      }
    ]
  }
}
```

#### Notification 输入

除了[通用输入字段](#common-input-fields)之外，Notification 钩子还会接收包含通知文本的 `message`、可选的 `title`，以及指示触发类型的 `notification_type`。

```json  theme={null}
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "Notification",
  "message": "Claude needs your permission to use Bash",
  "title": "Permission needed",
  "notification_type": "permission_prompt"
}
```

Notification 钩子无法阻止或修改通知。除了所有钩子都可用的 [JSON 输出字段](#json-output)之外，你还可以返回 `additionalContext`，以向对话添加上下文：

| 字段                | 描述                         |
| :------------------ | :--------------------------- |
| `additionalContext` | 添加到 Claude 上下文中的字符串 |

### SubagentStart

当通过 Task 工具生成 Claude Code 子代理时运行。支持使用匹配器按代理类型名称进行筛选（内置代理，如 `Bash`、`Explore`、`Plan`，或来自 `.claude/agents/` 的自定义代理名称）。

#### SubagentStart 输入

除了[通用输入字段](#common-input-fields)之外，SubagentStart 钩子还会接收 `agent_id`（子代理的唯一标识符）和 `agent_type`（代理名称，包括 `"Bash"`、`"Explore"`、`"Plan"` 等内置代理名称或自定义代理名称）。

```json  theme={null}
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "SubagentStart",
  "agent_id": "agent-abc123",
  "agent_type": "Explore"
}
```

SubagentStart 钩子无法阻止子代理创建，但可以向子代理注入上下文。除了所有钩子均可使用的 [JSON 输出字段](#json-output)之外，还可以返回：

| 字段                | 说明                           |
| :------------------ | :----------------------------- |
| `additionalContext` | 添加到子代理上下文中的字符串   |

```json  theme={null}
{
  "hookSpecificOutput": {
    "hookEventName": "SubagentStart",
    "additionalContext": "Follow security guidelines for this task"
  }
}
```

### SubagentStop

当 Claude Code 子代理完成响应时运行。按代理类型进行匹配，其可用值与 SubagentStart 相同。

#### SubagentStop 输入

除了[通用输入字段](#common-input-fields)之外，SubagentStop 钩子还会接收 `stop_hook_active`、`agent_id`、`agent_type` 和 `agent_transcript_path`。`agent_type` 字段的值用于匹配器筛选。`transcript_path` 是主会话的转录记录，而 `agent_transcript_path` 是子代理自身的转录记录，存储在嵌套的 `subagents/` 文件夹中。

```json  theme={null}
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../abc123.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "SubagentStop",
  "stop_hook_active": false,
  "agent_id": "def456",
  "agent_type": "Explore",
  "agent_transcript_path": "~/.claude/projects/.../abc123/subagents/agent-def456.jsonl"
}
```

SubagentStop 钩子使用与 [Stop 钩子](#stop-decision-control)相同的决策控制格式。

### Stop

当 Claude Code 主代理完成响应时运行。如果停止是由用户中断引起的，则不会运行。

#### Stop 输入

除了[通用输入字段](#common-input-fields)之外，Stop 钩子还会接收 `stop_hook_active`。当 Claude Code 已经因 Stop 钩子而继续运行时，此字段为 `true`。请检查此值或处理转录记录，以防止 Claude Code 无限运行。

```json  theme={null}
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "Stop",
  "stop_hook_active": true
}
```

#### 停止决策控制

`Stop` 和 `SubagentStop` 钩子可以控制 Claude 是否继续运行。除了所有钩子都可使用的 [JSON 输出字段](#json-output)外，钩子脚本还可以返回以下事件特定字段：

| 字段       | 说明                                                                       |
| :--------- | :------------------------------------------------------------------------- |
| `decision` | `"block"` 可阻止 Claude 停止。省略此字段则允许 Claude 停止                 |
| `reason`   | 当 `decision` 为 `"block"` 时必填。告知 Claude 为什么应当继续运行          |

```json  theme={null}
{
  "decision": "block",
  "reason": "Must be provided when Claude is blocked from stopping"
}
```

### PreCompact

在 Claude Code 即将执行压缩操作之前运行。

匹配器值表示压缩是手动触发还是自动触发：

| 匹配器   | 触发时机                              |
| :------- | :------------------------------------ |
| `manual` | `/compact`                            |
| `auto`   | 上下文窗口已满时自动压缩              |

#### PreCompact 输入

除了[通用输入字段](#common-input-fields)外，PreCompact 钩子还会接收 `trigger` 和 `custom_instructions`。对于 `manual`，`custom_instructions` 包含用户传递给 `/compact` 的内容。对于 `auto`，`custom_instructions` 为空。

```json  theme={null}
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "PreCompact",
  "trigger": "manual",
  "custom_instructions": ""
}
```

### SessionEnd

在 Claude Code 会话结束时运行。适用于执行清理任务、记录会话统计信息或保存会话状态。支持使用匹配器按退出原因进行筛选。

钩子输入中的 `reason` 字段表示会话结束的原因：

| 原因                          | 说明                                      |
| :---------------------------- | :---------------------------------------- |
| `clear`                       | 使用 `/clear` 命令清除了会话              |
| `logout`                      | 用户已退出登录                            |
| `prompt_input_exit`           | 用户在提示输入框可见时退出                 |
| `bypass_permissions_disabled` | 绕过权限模式已被禁用                      |
| `other`                       | 其他退出原因                              |

#### SessionEnd 输入

除了[通用输入字段](#common-input-fields)外，SessionEnd 钩子还会接收一个 `reason` 字段，用于表示会话结束的原因。有关所有取值，请参阅上方的[原因表](#sessionend)。

```json  theme={null}
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "SessionEnd",
  "reason": "other"
}
```

SessionEnd 钩子不具备决策控制能力。它们无法阻止会话终止，但可以执行清理任务。

## 基于提示词的钩子

除了 Bash 命令钩子（`type: "command"`）之外，Claude Code 还支持基于提示词的钩子（`type: "prompt"`），这类钩子使用 LLM 来评估是允许还是阻止某项操作。基于提示词的钩子适用于以下事件：`PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest`、`UserPromptSubmit`、`Stop` 和 `SubagentStop`。

### 基于提示词的钩子如何工作

基于提示词的钩子不会执行 Bash 命令，而是：

1. 将钩子输入和你的提示词发送给 Claude 模型，默认使用 Haiku
2. LLM 返回包含决策的结构化 JSON
3. Claude Code 自动处理该决策

### 提示词钩子配置

将 `type` 设置为 `"prompt"`，并提供 `prompt` 字符串，而不是 `command`。使用 `$ARGUMENTS` 占位符将钩子的 JSON 输入数据注入提示词文本。Claude Code 会将组合后的提示词和输入发送给一个快速 Claude 模型，该模型会返回 JSON 决策。

此 `Stop` 钩子会要求 LLM 在允许 Claude 结束之前评估所有任务是否均已完成：

```json  theme={null}
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Evaluate if Claude should stop: $ARGUMENTS. Check if all tasks are complete."
          }
        ]
      }
    ]
  }
}
```

| 字段      | 必需 | 说明                                                                                                                                                                          |
| :-------- | :--- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`    | 是   | 必须为 `"prompt"`                                                                                                                                                             |
| `prompt`  | 是   | 要发送给 LLM 的提示词文本。使用 `$ARGUMENTS` 作为钩子输入 JSON 的占位符。如果不包含 `$ARGUMENTS`，则输入 JSON 会附加到提示词之后                                           |
| `model`   | 否   | 用于评估的模型。默认为快速模型                                                                                                                                                 |
| `timeout` | 否   | 超时时间，以秒为单位。默认值：30                                                                                                                                               |

### 响应模式

LLM 必须返回包含以下内容的 JSON：

```json  theme={null}
{
  "ok": true | false,
  "reason": "Explanation for the decision"
}
```

| 字段     | 说明                                                        |
| :------- | :---------------------------------------------------------- |
| `ok`     | `true` 允许该操作，`false` 阻止该操作                       |
| `reason` | 当 `ok` 为 `false` 时必需。向 Claude 显示的说明             |

### 示例：多条件 Stop 钩子

此 `Stop` 钩子使用详细的提示词检查三个条件，然后才允许 Claude 停止。如果 `"ok"` 为 `false`，Claude 会将提供的原因作为下一条指令继续工作。`SubagentStop` 钩子使用相同的格式来评估[子代理](/en/sub-agents)是否应停止：

```json  theme={null}
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "You are evaluating whether Claude should stop working. Context: $ARGUMENTS\n\nAnalyze the conversation and determine if:\n1. All user-requested tasks are complete\n2. Any errors need to be addressed\n3. Follow-up work is needed\n\nRespond with JSON: {\"ok\": true} to allow stopping, or {\"ok\": false, \"reason\": \"your explanation\"} to continue working.",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

## 基于代理的钩子

基于代理的钩子（`type: "agent"`）与基于提示词的钩子类似，但支持多轮工具访问。代理钩子不会只进行一次 LLM 调用，而是生成一个子代理，该子代理可以读取文件、搜索代码并检查代码库，以验证条件。代理钩子支持与基于提示词的钩子相同的事件。

### 代理钩子的工作方式

当代理钩子触发时：

1. Claude Code 使用你的提示词和钩子的 JSON 输入生成一个子代理
2. 子代理可以使用 Read、Grep 和 Glob 等工具进行调查
3. 在最多 50 轮之后，子代理返回结构化的 `{ "ok": true/false }` 决策
4. Claude Code 以与提示词钩子相同的方式处理该决策

当验证需要检查实际文件或测试输出，而不只是评估钩子输入数据本身时，代理钩子非常有用。

### 代理钩子配置

将 `type` 设置为 `"agent"`，并提供一个 `prompt` 字符串。配置字段与[提示词钩子](#prompt-hook-configuration)相同，但默认超时时间更长：

| 字段      | 必填     | 描述                                                                                         |
| :-------- | :------- | :------------------------------------------------------------------------------------------- |
| `type`    | 是       | 必须为 `"agent"`                                                                             |
| `prompt`  | 是       | 描述要验证内容的提示词。使用 `$ARGUMENTS` 作为钩子输入 JSON 的占位符                         |
| `model`   | 否       | 要使用的模型。默认为快速模型                                                                 |
| `timeout` | 否       | 超时时间（秒）。默认值：60                                                                   |

响应模式与提示词钩子相同：使用 `{ "ok": true }` 表示允许，或使用 `{ "ok": false, "reason": "..." }` 表示阻止。

此 `Stop` 钩子会在允许 Claude 完成之前验证所有单元测试是否通过：

```json  theme={null}
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verify that all unit tests pass. Run the test suite and check the results. $ARGUMENTS",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

## 在后台运行钩子

默认情况下，钩子会阻塞 Claude 的执行，直到其完成。对于部署、测试套件或外部 API 调用等长时间运行的任务，请设置 `"async": true`，使钩子在后台运行，同时 Claude 继续工作。异步钩子无法阻止或控制 Claude 的行为：`decision`、`permissionDecision` 和 `continue` 等响应字段不会产生任何效果，因为它们原本要控制的操作已经完成。

### 配置异步钩子

在命令钩子的配置中添加 `"async": true`，即可让它在后台运行而不阻塞 Claude。此字段仅适用于 `type: "command"` 钩子。

此钩子会在每次调用 `Write` 工具后运行测试脚本。当 `run-tests.sh` 执行时，Claude 会立即继续工作，脚本最长可运行 120 秒。脚本完成后，其输出会在下一轮对话中传递：

```json  theme={null}
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/run-tests.sh",
            "async": true,
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

`timeout` 字段设置后台进程的最长运行时间（以秒为单位）。如果未指定，异步钩子将使用与同步钩子相同的默认值 10 分钟。

### 异步钩子的执行方式

当异步钩子触发时，Claude Code 会启动钩子进程，并立即继续执行，而不等待其完成。该钩子通过 stdin 接收与同步钩子相同的 JSON 输入。

后台进程退出后，如果钩子生成了包含 `systemMessage` 或 `additionalContext` 字段的 JSON 响应，该内容会在下一轮对话中作为上下文传递给 Claude。

### 示例：文件更改后运行测试

每当 Claude 写入文件时，此钩子都会在后台启动测试套件，然后在测试完成后将结果报告给 Claude。将此脚本保存到项目中的 `.claude/hooks/run-tests-async.sh`，并使用 `chmod +x` 使其可执行：

```bash  theme={null}
#!/bin/bash
# run-tests-async.sh

# Read hook input from stdin
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only run tests for source files
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.js ]]; then
  exit 0
fi

# Run tests and report results via systemMessage
RESULT=$(npm test 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "{\"systemMessage\": \"Tests passed after editing $FILE_PATH\"}"
else
  echo "{\"systemMessage\": \"Tests failed after editing $FILE_PATH: $RESULT\"}"
fi
```

然后将以下配置添加到项目根目录中的 `.claude/settings.json`。`async: true` 标志可让 Claude 在测试运行时继续工作：

```json  theme={null}
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/run-tests-async.sh",
            "async": true,
            "timeout": 300
          }
        ]
      }
    ]
  }
}
```

### 限制

与同步钩子相比，异步钩子存在以下限制：

- 只有 `type: "command"` 钩子支持 `async`。基于提示词的钩子无法异步运行。
- 异步钩子无法阻止工具调用或返回决策。钩子完成时，触发它的操作已经继续执行。
- 钩子输出会在下一轮对话中传递。如果会话处于空闲状态，响应会等待至下一次用户交互。
- 每次执行都会创建一个单独的后台进程。同一异步钩子多次触发时，不会进行去重。

## 安全注意事项

### 免责声明

钩子以你的系统用户的完整权限运行。

<Warning>
  钩子会以你的完整用户权限执行 shell 命令。它们可以修改、删除或访问你的用户账户有权访问的任何文件。在将任何钩子命令添加到配置之前，请先进行审查和测试。
</Warning>

### 安全最佳实践

编写钩子时，请牢记以下实践：

- **验证并清理输入**：绝不要盲目信任输入数据
- **始终为 shell 变量加引号**：使用 `"$VAR"`，而不是 `$VAR`
- **阻止路径遍历**：检查文件路径中是否包含 `..`
- **使用绝对路径**：为脚本指定完整路径，并使用 `"$CLAUDE_PROJECT_DIR"` 表示项目根目录
- **跳过敏感文件**：避免处理 `.env`、`.git/`、密钥等

## 调试钩子

运行 `claude --debug` 可查看钩子执行详情，包括匹配了哪些钩子、它们的退出代码和输出。使用 `Ctrl+O` 切换详细模式，以在记录中查看钩子进度。

```
[DEBUG] Executing hooks for PostToolUse:Write
[DEBUG] Getting matching hook commands for PostToolUse with query: Write
[DEBUG] Found 1 hook matchers in settings
[DEBUG] Matched 1 hooks for query "Write"
[DEBUG] Found 1 hook commands to execute
[DEBUG] Executing hook command: <Your command> with timeout 600000ms
[DEBUG] Hook command completed with status 0: <Your stdout>
```

有关钩子未触发、Stop 钩子无限循环或配置错误等常见问题的故障排除方法，请参阅指南中的[限制与故障排除](/en/hooks-guide#limitations-and-troubleshooting)。