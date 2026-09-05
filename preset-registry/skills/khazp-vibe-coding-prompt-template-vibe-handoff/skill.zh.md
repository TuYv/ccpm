---
name: vibe-handoff
description: Prepare compact factual project context for another session or coding tool without copying transcripts or secrets.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---
# Vibe 交接

检查当前分支/修订版本、工作树变更、MEMORY.md、manifest、决策和可用的检查结果。编写一份简洁的交接说明，其中包含目标、当前状态、变更的文件、决策及其理由、阻塞项、实际执行的检查及日期/结果、未执行的检查、恢复检查点和下一步有界操作。

引用产品文档，而不是重复其中的内容。排除机密信息、凭据、继续工作所不需要的个人数据以及完整的对话记录。不要推断检查已成功，也不要提交未提交的变更。将稳定规则保存在 AGENTS.md 中，并替换 MEMORY.md 中过时的进度，而不是无限追加日志。