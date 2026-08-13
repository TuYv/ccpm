---
name: invalid-agent-skill
description: Use when testing invalid agent validation
context: fork
agent: Invalid_Agent
---
此技能的代理类型无效。
代理必须是内置类型（Explore、Plan、general-purpose）或采用 kebab-case 格式的自定义名称。
`Invalid_Agent` 会被拒绝，因为不允许使用下划线；请使用连字符以符合 kebab-case 格式。