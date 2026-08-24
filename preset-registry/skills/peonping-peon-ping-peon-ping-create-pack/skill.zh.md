---
name: peon-ping-create-pack
description: 'Internal — invoked headlessly by `peon create`; humans should run `peon create` instead. Author and render a brand-new PeonPing draft pack — invoked headlessly as: "Use the peon-ping-create-pack skill to draft a pack: name=<n> flavor=<f> vibe=<v> draft_root=<dir>. Follow the skill exactly." Authors all 7 CESP categories honoring the vibe, writes openpeon.json (draft-stamped) and prompts.json, renders every sound via scripts/pack-render.py, and always ends by telling the human to run `peon eval <name>`.'
---
# peon-ping-create-pack

你正在从头开始起草一个全新的 PeonPing pack。只能在你创建的
draft 目录中操作。不要触碰任何其他目录，不要安装任何内容，不要提交任何内容，并且绝不能以声明该 pack
“完成”或“已安装”作为结尾——新创建的 pack 绝不会被直接安装（请参阅 Hard rules）。

## If invoked without name/flavor/vibe/draft_root

此 skill 是内部 skill：它只会由 `peon create` 无头调用，并且调用时 `name`、`flavor`、`vibe` 和 `draft_root` 都已填充。如果你在缺少这四个参数的情况下被调用（人类直接运行了此 skill），除了告诉他们改为运行 `peon create` 之外，不执行任何操作。不要触碰任何文件。退出。

## Procedure

1. 解析调用参数：`name`（调用方已根据
   `^[a-z0-9][a-z0-9_-]*$` 完成验证）、`flavor`（`sfx` 或 `voice`）、`vibe`（一行描述）和
   `draft_root`。
2. 计算 `draft_dir = <draft_root>/<name>`。如果它已存在，STOP —
   告诉人类名为该名称的 draft 已存在，并让他们对其运行
   `peon eval <name>`（绝不要覆盖已有的 draft）。否则创建 `draft_dir/sounds/`。
3. 创作一个符合 vibe 的概念，涵盖 **全部 7 个 CESP 类别**，且每个类别**至少包含一个声音**：`session.start`、
   `task.acknowledge`、`task.complete`、`task.error`、`input.required`、
   `resource.limit`、`user.spam`。这体现了
   `brand-to-peon-packs` skill 第 2 步中的概念创作规范：
   - 每个声音都需要一个 `label` — 简短、适合作为字幕的文本，用于描述听到的内容（不是文件名，也不是类别名称的改写 — 例如
     “柔和的确认音”、“宁静的完成音”，而不是“task_complete_0”）。
   - 在全部 7 个声音中保持美学风格一致，让这个 pack 呈现为一个连贯的创意，而不是 7 个互不相关的片段。让
     `vibe` 字符串决定乐器音色 / 音调 / 音域（例如“平静的铃声”意味着始终使用柔和的钟声和钵声，绝不能使用尖锐或打击感强的声音）。
   - **`flavor: sfx`** — 无人声。每个声音都需要一个 `prompt`：为 ElevenLabs 声音生成提供具体、可渲染的描述（乐器或质感、特征、简短的声音形态 — 例如“两个轻柔的铃声，柔和衰减，温暖的房间底噪”）。避免使用没有可渲染内容的模糊形容词（“好听的声音”）——应描述实际会产生该声音的因素。
   - **`flavor: voice`** — 有人声。每个声音都需要 `text`（符合角色、适合该类别和 vibe 的台词）以及 `voice_id`（ElevenLabs voice id）。在全部 7 个声音中复用同一个 `voice_id` — 一个 pack 只有一个声音，而不是 7 个。如果调用时未指定声音，则选择一个角色特征合理匹配该 vibe 的 ElevenLabs stock voice；不要臆造 `voice_id` 字符串 — 如果不确定，请通过 ElevenLabs API 列出声音，确认其确实存在。
4. 写入 `draft_dir/openpeon.json` — 一个包含 `cesp_version`、
   `name`、`display_name`、`version`（从 `"0.0.1"` 开始）、反映 vibe 的简短
   `description`，以及 `"x_openpeon_draft": true`
   的 CESP manifest（**始终如此** — 此 skill 创作的 pack 永远只能是 draft）。`categories` 将 7 个类别名称分别映射到
   `{"sounds": [{"file": "sounds/<category>_<index>.wav", "label": "..."}]}`。
5. 写入 `draft_dir/prompts.json` — `peon-ping-remix` skill 为重新生成读取的契约：对于 sfx 声音，使用
   `{"<file>": {"type": "sfx", "prompt": "..."}}`；对于 voice 声音，使用 `{"<file>": {"type": "tts", "text": "...", "voice_id":
   "..."}}`。键与 `openpeon.json` 中使用的 `file` 路径相同（相对于 `draft_dir`，例如 `sounds/session_start_0.wav`）。
6. 渲染每个声音。对于每个条目，在 `draft_dir/jobs/` **下方**写入一个小型 job 文件（例如
   `draft_dir/jobs/render-job-<category>_<index>.json` — 绝不要放在 draft 根目录；`approve` 会清理 `jobs/` 下的所有内容，如果将渲染输入留在根目录，它会作为垃圾文件被打包进已批准的 pack），其结构为 `{"type": "sfx"|"tts", "prompt"|"text"+"voice_id", "out": "<absolute
   path to the WAV>"}`，然后运行：
   ```
   python3 <peon-ping>/scripts/pack-render.py --job <file>
   ```
   当环境变量 `PEON_RENDER_MOCK=1` 被设置时，传入 `--mock` — 这会写入一个静音的占位 WAV，而不是调用 ElevenLabs，因此无需网络、API key 或 ffmpeg 即可创作并渲染整个 draft。这就是自动化测试运行此 skill 的方式。

   按照 `peon-ping-remix` skill 所使用的相同顺序解析运行中 peon 安装旁边的 scripts 目录中的 `<peon-ping>`：设置了 `$PEON_DIR/scripts` 时使用它，否则使用 `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/hooks/peon-ping/scripts`，否则使用你被调用时所在的 repo checkout。
7. 如果 job 格式错误、缺少键，或重试后仍然渲染出静音，renderer 将以非零状态退出。如果任何声音渲染失败，STOP — 打印 renderer 的 stderr 并以非零状态退出。不要让 `openpeon.json` 声称存在尚未渲染的声音；可以将不完整的 `draft_dir` 留在磁盘上供人类检查或重试——不要删除它。
8. 所有声音成功渲染后，打印一份简短摘要（pack 名称、flavor、类别数量、声音数量），并且**始终**以告知人类运行以下命令作为结尾：
   ```
   peon eval <name>
   ```
   以便试听并批准该 draft。绝不要声称该 pack 已完成、可以使用或已安装——创建操作只会生成一个仍需通过 eval gate 的 draft。

## 硬性规则

- 绝 NEVER 写入 `draft_dir` 之外的位置。
- 绝 NEVER 将 `x_openpeon_draft` 设置为 `true` 以外的任何值。
- 绝 NEVER 安装该 pack、将其复制到 packs 目录，或以其他方式使其可以直接使用 — 这只会通过 `peon eval <name>` → approve 完成。
- 绝 NEVER 打印或记录 ElevenLabs 密钥。
- 当 `PEON_RENDER_MOCK=1` 时，必须为每次 `pack-render.py` 调用传递 `--mock` — 这对测试以及在不消耗 API 配额的情况下预览流程至关重要。
- 流程 ALWAYS 以告知用户运行 `peon eval <name>` 结束 — 创建流程绝不会以已安装的 pack 结束。