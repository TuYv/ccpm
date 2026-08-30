---
name: peon-ping-log
description: Log exercise reps for the Peon Trainer. Use when user says they did pushups, squats, or wants to log reps. Examples - "/peon-ping-log 25 pushups", "/peon-ping-log 30 squats", "log 50 pushups".
user-invocable: true
---
# peon-ping-log

为 Peon Trainer 记录锻炼次数。

## 用法

用户提供次数和锻炼类型。使用 Bash 工具运行以下命令：

```bash
bash ~/.claude/hooks/peon-ping/peon.sh trainer log <count> <exercise>
```

其中：
- `<count>` 是次数（例如 `25`）
- `<exercise>` 是 `pushups` 或 `squats`

### 示例

```bash
bash ~/.claude/hooks/peon-ping/peon.sh trainer log 25 pushups
bash ~/.claude/hooks/peon-ping/peon.sh trainer log 30 squats
```

向用户报告输出结果。该命令会打印更新后的次数并播放训练员语音提示。

## 如果训练员未启用

如果输出显示训练员未启用，请告知用户先运行 `/peon-ping-toggle` 或 `peon trainer on`。

## 检查状态

如果用户在记录后询问其进度，还要运行：

```bash
bash ~/.claude/hooks/peon-ping/peon.sh trainer status
```