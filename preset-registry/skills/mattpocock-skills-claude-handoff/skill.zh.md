---
name: claude-handoff
description: Hand the current conversation off to a fresh background agent that picks up the work immediately.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---
我先确认一下：  
要继续你的原任务（SKILL.md 片段翻译），你希望我先启用哪些 skill / plugin 整组？  

你可以直接回复，例如：  
- `agent-reach（整组）`  
- `local-tools（整组）+ baoyu-skills（部分 skill）`  
- `暂不启用任何 plugin，按默认环境执行`
