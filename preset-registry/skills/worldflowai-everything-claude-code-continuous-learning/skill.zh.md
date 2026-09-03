---
name: continuous-learning
description: Automatically extract reusable patterns from Claude Code sessions and save them as learned skills for future use.
---
# 持续学习技能

在 Claude Code 会话结束时自动评估会话，提取可复用的模式，并将其保存为已学习的技能。

## 工作原理

该技能在每个会话结束时作为 **Stop hook** 运行：

1. **会话评估**：检查会话是否包含足够多的消息（默认：10 条以上）
2. **模式检测**：从会话中识别可提取的模式
3. **技能提取**：将有用的模式保存到 `~/.claude/skills/learned/`

## 配置

编辑 `config.json` 进行自定义：

```json
{
  "min_session_length": 10,
  "extraction_threshold": "medium",
  "auto_approve": false,
  "learned_skills_path": "~/.claude/skills/learned/",
  "patterns_to_detect": [
    "error_resolution",
    "user_corrections",
    "workarounds",
    "debugging_techniques",
    "project_specific"
  ],
  "ignore_patterns": [
    "simple_typos",
    "one_time_fixes",
    "external_api_issues"
  ]
}
```

## 模式类型

| 模式 | 描述 |
|---------|-------------|
| `error_resolution` | 特定错误是如何被解决的 |
| `user_corrections` | 来自用户纠正的模式 |
| `workarounds` | 针对框架/库的怪异问题给出的解决方案 |
| `debugging_techniques` | 有效的调试方法 |
| `project_specific` | 项目特定的约定 |

## Hook 设置

添加到你的 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning/evaluate-session.sh"
      }]
    }]
  }
}
```

## 为什么使用 Stop Hook？

- **轻量**：仅在会话结束时运行一次
- **非阻塞**：不会给每条消息增加延迟
- **完整上下文**：可以访问完整的会话记录

## 相关内容

- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) - 关于持续学习的章节
- `/learn` 命令 - 在会话中途手动提取模式
