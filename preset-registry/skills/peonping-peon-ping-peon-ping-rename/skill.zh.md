---
name: peon-ping-rename
description: Rename the current Claude session for peon-ping notifications and terminal tab title. Use when user wants to give this session a custom name like "/peon-ping-rename Auth Refactor". Call with no argument to reset to auto-detect.
user_invocable: true
license: MIT
metadata:
  author: PeonPing
  version: "1.0"
---
# peon-ping-rename

为当前会话设置一个自定义名称，该名称会显示在桌面通知标题和终端标签页标题中。

## 工作原理

当用户输入 `/peon-ping-rename <name>` 时，**UserPromptSubmit hook** 会在命令到达模型之前拦截它：

1. 提取会话 ID 和名称
2. 将 `session_names[session_id] = name` 写入 `.state.json`
3. 立即通过 ANSI 转义序列更新终端标签页标题
4. 返回确认信息（使用 0 个 token）

在之后的每个钩子事件中，peon.sh 都会读取 `session_names[session_id]`，将其作为优先级最高的项目名称。同一代码仓库中的多个标签页各自拥有独立的名称。

## 使用方法

```
/peon-ping-rename Auth Refactor
/peon-ping-rename API: payments
/peon-ping-rename          ← 重置为自动检测
```

名称长度上限为 50 个字符。允许使用：字母、数字、空格、点号、连字符、下划线。

## 手动备用方法（如果钩子失败）

### 1. 获取会话 ID

```bash
echo "$CLAUDE_SESSION_ID"
```

### 2. 将名称写入状态

```bash
python3 -c "
import json, os, time
state_path = os.path.expanduser('~/.claude/hooks/peon-ping/.state.json')
try:
    state = json.load(open(state_path))
except:
    state = {}
state.setdefault('session_names', {})['SESSION_ID_HERE'] = 'My Session Name'
json.dump(state, open(state_path, 'w'), indent=2)
"
```

### 3. 触发钩子事件以刷新标签页标题

提交任意提示 — peon.sh 会在下一次 `UserPromptSubmit` 或 `Stop` 事件中获取新名称。

## 重置

```
/peon-ping-rename
```

或者直接从 `.state.json` 中的 `session_names` 移除该会话 ID。

## 优先级

`/peon-ping-rename` > `CLAUDE_SESSION_NAME` 环境变量 > `.peon-label` 文件 > `notification_title_script` > `project_name_map` > `notification_title_override` > git 仓库名称 > 文件夹名称