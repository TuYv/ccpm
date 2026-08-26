---
name: setup-codemap-cli
description: Guide for setup Codemap CLI for intelligent codebase visualization and navigation
---
用户输入：

```text
$ARGUMENTS
```

# Codemap CLI 设置指南

## 1. 确定设置上下文

询问用户希望将配置存储在哪里：

**选项：**

1. **项目级别（通过 git 共享）** - 配置纳入版本控制，与团队共享
   - CLAUDE.md 更新至：`./CLAUDE.md`
   - Hook 设置写入：`./.claude/settings.json`

2. **项目级别（个人偏好）** - 配置保留在本地，不纳入 git 跟踪
   - CLAUDE.md 更新至：`./CLAUDE.local.md`
   - Hook 设置写入：`./.claude/settings.local.json`
   - 确认这些文件已列在 `.gitignore` 中，如未列出则添加

3. **用户级别（全局）** - 配置应用于该用户的所有项目
   - CLAUDE.md 更新至：`~/.claude/CLAUDE.md`
   - Hook 设置写入：`~/.claude/settings.json`

保存用户的选择，并在后续步骤中使用相应路径。

## 2. 检查 Codemap 是否已安装

运行 `codemap -help` 检查 codemap 是否已安装。

如果尚未安装，则继续进行设置。

## 3. 加载 Codemap 文档

阅读以下文档，以了解 Codemap 的功能：

- 加载 <https://raw.githubusercontent.com/JordanCoin/codemap/refs/heads/main/README.md>，了解 Codemap 是什么以及它具备哪些功能

## 4. 引导用户完成安装

### macOS/Linux（Homebrew）

```bash
brew tap JordanCoin/tap && brew install codemap
```

### Windows（Scoop）

```bash
scoop bucket add codemap https://github.com/JordanCoin/scoop-codemap
scoop install codemap
```

## 5. 验证安装

安装完成后，验证 codemap 是否正常工作：

```bash
codemap .
```

## 6. 更新 CLAUDE.md 文件

使用第 1 步确定的路径。Codemap 成功安装后，使用以下内容更新相应的 CLAUDE.md 文件：

```markdown
## Use Codemap CLI for Codebase Navigation

Codemap CLI is available for intelligent codebase visualization and navigation.

**Required Usage** - You MUST use `codemap --diff --ref master` to research changes different from default branch, and `git diff` + `git status` to research current working state.

### Quick Start

```bash
codemap .                    # Project tree
codemap --only swift .       # Just Swift files
codemap --exclude .xcassets,Fonts,.png .  # Hide assets
codemap --depth 2 .          # Limit depth
codemap --diff               # What changed vs main
codemap --deps .             # Dependency flow
```

### Options

| Flag | Description |
|------|-------------|
| `--depth, -d <n>` | Limit tree depth (0 = unlimited) |
| `--only <exts>` | Only show files with these extensions |
| `--exclude <patterns>` | Exclude files matching patterns |
| `--diff` | Show files changed vs main branch |
| `--ref <branch>` | Branch to compare against (with --diff) |
| `--deps` | Dependency flow mode |
| `--importers <file>` | Check who imports a file |
| `--skyline` | City skyline visualization |
| `--json` | Output JSON |

**Smart pattern matching** - no quotes needed:
- `.png` - any `.png` file
- `Fonts` - any `/Fonts/` directory
- `*Test*` - glob pattern

### Diff Mode

See what you're working on:

```bash
codemap --diff
codemap --diff --ref develop
```

```

如果默认分支不是 `main`，而是 `master`（或其他名称），请相应更新内容：
 - 使用 `codemap --diff --ref master`，而不是常规的 `codemap --diff`


## 7. 更新 .gitignore 文件

更新 .gitignore 文件，使其包含 `.codemap/` 目录：

```text
.codemap/
```

## 8. 测试 Codemap

运行快速测试以验证一切正常：

```bash
codemap .
codemap --diff
```

## 9. 将 hooks 添加到设置文件

- 使用步骤 1 中确定的设置路径。如果设置文件不存在，则创建该文件并添加以下内容：

    ```json
    {
        "hooks": {
            "session-start": "codemap hook session-start && echo 'git diff:' && git diff --stat && echo 'git status:' && git status"
        }
    }
    ```

    如果默认分支不是 `main`，而是 `master`（或其他名称），请相应更新内容：
    - 使用 `codemap hook session-start --ref=master`，而不是常规的 `codemap hook session-start`
    - 对其余命令也添加 `--ref=master` 标志。

- 询问用户是否希望添加其他 hooks，并提供包含描述的选项列表。添加用户要求的 hooks。

### 可用的 Hooks

| 命令 | 触发条件 | 描述 |
|---------|---------|-------------|
| `codemap hook session-start` | SessionStart | 完整树结构、中心节点、分支差异、上次会话上下文 |
| `codemap hook pre-edit` | PreToolUse (Edit\|Write) | 谁导入了该文件，以及该文件导入了哪些中心节点 |
| `codemap hook post-edit` | PostToolUse (Edit\|Write) | 更改的影响（与 pre-edit 相同） |
| `codemap hook prompt-submit` | UserPromptSubmit | 所提及文件的中心节点上下文 + 会话进度 |
| `codemap hook pre-compact` | PreCompact | 将中心节点状态保存到 .codemap/hubs.txt |
| `codemap hook session-stop` | SessionEnd | 包含行数和统计信息的编辑时间线 |


### 包含完整 hooks 配置的文件示例

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "codemap hook session-start"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "codemap hook pre-edit"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "codemap hook post-edit"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "codemap hook prompt-submit"
          }
        ]
      }
    ],
    "PreCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "codemap hook pre-compact"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "codemap hook session-stop"
          }
        ]
      }
    ]
  }
}
```