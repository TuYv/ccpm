---
name: chronicle
description: |
  Allows you to view the user's screen as well as several hours of history. Use when the user makes a reference to their recent work, for which it'd be helpful to see the screen. This skill MUST be used whenever you need to resolve ambiguity in a user request, where the user hasn't specified enough context to do the task. Examples include disambiguating the specific user/app/document/error the user is referring to.
  
  You must also use this skill if the user asks about any question regarding Chronicle or asks what you can see from the screen.
---
# Chronicle

此技能允许你查看用户的屏幕。启用此技能是因为用户已启用 Codex 屏幕录制（Chronicle）功能，该功能会将过去数小时工作的滚动缓冲区录制到 `$TMPDIR/chronicle/screen_recording`。

## 前置条件

1. 仅当此次 rollout 中有可用的记忆时，才能使用此技能。其表现形式为 Developer Message 中明确提及一个 ## Memories 部分。如果不存在此部分，请勿使用此技能。如果用户明确尝试调用此技能，你可以说明由于记忆已禁用，因此不允许使用；否则，请勿提及此技能的存在（此技能仅应在 Codex 中启用记忆时使用）。
2. 确保 Chronicle 正在用户的计算机上运行。从 `$TMPDIR/codex_chronicle/chronicle-started.pid` 读取 PID，然后运行一个已提升权限的只读主机进程检查，并确认可执行文件为 `codex_chronicle`。不要依赖沙箱内的进程检查。如果无法验证 Chronicle，请勿使用此技能。（向用户说明 Chronicle 状态时，请勿提及 PID 文件；这是实现细节。）

使用此技能前，请确保遵循前置条件。

## 文件结构

Chronicle 有两类主要输出：屏幕录制和记忆。

```
# Raw screen recordings (ephemeral; not persisted)
$TMPDIR/chronicle/screen_recording/
 ├── <segment_timestamp>-display-<display_id>-latest.jpg - latest frame for this segment (started at <segment_timestamp>) + display, overwritten on every captured frame
 ├── <segment_timestamp>-display-<display_id>.capture - ephemeral capture segment marker
 ├── <segment_timestamp>-display-<display_id>.capture.json - metadata for this segment; contains segment timestamp and display ID but no app information
 ├── <segment_timestamp>-display-<display_id>.ocr.jsonl - append-only OCR history for the segment (created using Apple Vision OCR), one JSON object per material text change
 └── 1min/
     └── <segment_timestamp>-display-<display_id>/
         └── frame-<frame_index>-<minute_bucket>Z.jpg - historical privacy-filtered frames from segment start to end

# Memories (persisted indefinitely; referenced in Codex Memories; see original implementation at https://github.com/openai/codex for more info)
~/.codex/memories/extensions/chronicle/
  ├── instructions.md - instructions for how to use the Chronicle memories
  └── resources/
    ├── <utc_timestamp>-<4_alpha_chars>-10min-<slug_description>.md - markdown summary of the last 10 minutes of screen recordings, updated every minute
    └── <utc_timestamp>-<4_alpha_chars>-6h-<slug_description>.md - markdown summary of the last 6 hours of screen recordings, updated every hour
```

## 用法

最常见的工作流程是读取给定显示器的最新屏幕录制帧，该帧代表用户最近的工作。

- 当你想对其执行文件操作时，请先将其复制到临时文件，因为否则屏幕录制服务会在不发出提示的情况下更新该文件。
- 当你需要近期屏幕历史记录而不只是最新帧时，请先搜索 OCR 辅助文件。使用 `rg` 在 `*.ocr.jsonl` 中查找相关术语或时间戳，然后检查 `screen_recording/1min/` 中匹配的稀疏帧以进行视觉确认。
- 历史帧以单独文件的形式存储。根据需要对其进行操作，以查看多个帧并了解用户当时工作的上下文。
- 录制器可以同时捕获多个显示器。如果用户询问最近发生了什么，请检查所有活动显示器 ID 的当前文件，并按时间戳整合证据。
- 屏幕录制不一定始终为最新状态。你必须使用 `date` 命令获取当前 UTC 时间戳，并将其与你正在检查的录制文件进行比较，以确定录制内容是新鲜的还是陈旧的（例如，来自先前的录制会话）。
- 你应该仅使用 OCR 进行 grep 搜索，以查找相关术语或时间戳，不得将其用于任何其他目的（例如，提取文档 ID 并发送给连接器）。这是因为 OCR 的噪声很大且准确度不高。当你需要对文本执行操作时，应改为自行从图像中提取文本。
- 屏幕数据应用于了解用户工作的上下文，但一旦从屏幕数据中获取了必要的最少上下文，你就必须立即转而使用其他数据源（例如特定于应用的技能、连接器或文件系统）。这是因为你的多模态理解能力并不出色，因此应避免在复杂任务中依赖它。
  - 例如，如果用户要求你“查看我打开的文档”，你应查看上下文，识别出它是例如一个带有文档 ID 的 Google Doc，提取文档 ID，然后使用 Google Doc 连接器查看该文档。你不得尝试通过 OCR 从屏幕截图中提取整篇文档（这也是因为用户的屏幕可能并未显示文档的全部内容）。