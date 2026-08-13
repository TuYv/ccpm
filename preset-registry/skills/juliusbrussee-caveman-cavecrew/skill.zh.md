---
name: cavecrew
description: >
  Decision guide for delegating to caveman-style subagents. Tells the main
  thread WHEN to spawn `cavecrew-investigator` (locate code), `cavecrew-builder`
  (1-2 file edit), or `cavecrew-reviewer` (diff review) instead of doing the
  work inline or using vanilla `Explore`. Subagent output is caveman-compressed
  so the tool-result injected back into main context is ~60% smaller — main
  context lasts longer across long sessions.
  Trigger: "delegate to subagent", "use cavecrew", "spawn investigator/builder/reviewer",
  "save context", "compressed agent output".
---
收到。先按规则确认：本次任务是纯文本翻译，通常**不需要加载任何 skill 或 plugin 组**。  
你想继续使用：  

- **全部不启用（推荐）**  
- **仅启用指定 skill/plugin 组**（请说明具体名称）  

请确认后我再开始输出这段中文译文。
