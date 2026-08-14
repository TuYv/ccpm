---
name: with-hooks
description: Use when testing valid hooks
hooks:
  PreToolUse:
    - type: command
      command: echo pre-tool
---
在使用工具之前运行工具调用前钩子。