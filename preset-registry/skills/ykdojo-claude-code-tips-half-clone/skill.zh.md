---
name: half-clone
description: Clone the later half of the current conversation, discarding earlier context to reduce token usage while preserving recent work.
---
克隆当前对话的后半部分，丢弃较早的上下文以减少 token 用量，同时保留最近的工作。

步骤：
1. 获取当前会话 ID 和项目路径：`tail -1 ~/.claude/history.jsonl | jq -r '[.sessionId, .project] | @tsv'`
2. 使用 bash 查找 half-clone-conversation.sh：`find ~/.claude -name "half-clone-conversation.sh" 2>/dev/null | sort -V | tail -1`
   - 无论该脚本是通过插件安装还是手动符号链接安装的，此命令都能找到它
   - 使用版本排序，若存在多个版本则优先选择最新版本
3. 预览对话以验证会话 ID：`<script-path> --preview <session-id> <project-path>`
   - 检查第一条和最后一条消息是否与当前对话相符
4. 运行克隆：`<script-path> <session-id> <project-path>`
   - 始终传入历史记录条目中的项目路径，而不是当前工作目录
5. 脚本会输出新的会话 ID（即 `New session: <id>` 行）。向用户提供可直接恢复该会话的确切命令，无需使用选择器：
   ```
   claude --resume <new-session-id>
   ```
   脚本会自动在克隆的文件末尾追加对原始对话的引用。（新会话还会被标记为 `[HALF-CLONE <timestamp>]`，例如 `[HALF-CLONE Jan 7 14:30]`，因此通过 `claude -r` 并手动选择它也可作为备用方案。）
