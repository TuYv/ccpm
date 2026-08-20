---
name: "daily-logs"
description: "Track daily activity logs and summaries for the user. TRIGGER BY: read/edit user memory"
---
# 每日日志

以结构化、按时间顺序的格式记录用户每天的活动、进展、决策和经验总结。

## 文件结构

每天使用一个单独的文件，命名为 `yyyy-mm-dd.md`（例如 `2025-06-15.md`）。每天新建一个文件；如果当天的文件已存在，则将条目追加到现有文件中。

### 文件格式：`yyyy-mm-dd.md`

内容格式示例：
```
# yyyy-mm-dd

## [short description]
- [1-3 sentence summary of what happened]
```

## 指南

- 每天一个文件，每个文件可包含多个条目（每项任务对应一个条目）
- 使用 ISO 日期格式：`yyyy-mm-dd`
- 条目应保持简洁——重点记录对未来有参考价值的内容
- 不要重复记录已由其他技能捕获的信息
- 始终使用第三人称指代用户（“用户请求了 X”“用户决定了 Y”），绝不使用第一人称代词