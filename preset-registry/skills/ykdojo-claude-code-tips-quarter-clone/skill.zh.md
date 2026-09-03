---
name: quarter-clone
description: Clone the last quarter of the current conversation, discarding earlier context to reduce token usage while preserving recent work.
---
克隆当前对话的最后四分之一，丢弃较早的上下文以减少 token 用量，同时保留最近的工作。

步骤：
1. 获取当前会话 ID 和项目路径：`tail -1 ~/.claude/history.jsonl | jq -r '[.sessionId, .project] | @tsv'`
2. 使用 bash 查找 half-clone-conversation.sh：`find ~/.claude -name "half-clone-conversation.sh" 2>/dev/null | sort -V | tail -1`
   - 无论是通过插件安装还是手动符号链接，都能找到该脚本
   - 使用版本排序，在存在多个版本时优先选择最新版本
   - 同一脚本同时处理半克隆和四分之一克隆；`--quarter` 选择四分之一模式
3. 预览对话以验证会话 ID：`<script-path> --preview <session-id> <project-path>`
   - 检查第一条和最后一条消息是否与当前对话匹配
4. 运行克隆：`<script-path> --quarter <session-id> <project-path>`
   - 始终传递历史记录条目中的项目路径，而不是当前工作目录
5. 脚本会打印新的会话 ID（即 `New session: <id>` 这一行）。向用户提供确切的命令以直接恢复会话，无需使用选择器：
   ```
   claude --resume <new-session-id>
   ```
   脚本会自动在克隆文件末尾追加对原始对话的引用。（新会话还会被标记为 `[QUARTER-CLONE <timestamp>]`，例如 `[QUARTER-CLONE Jan 7 14:30]`，因此使用 `claude -r` 并手动选择也可以作为备选方案。）
