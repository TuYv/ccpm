---
name: peon-ping-remix
description: 'Internal — invoked headlessly by the peon eval server; humans should run `peon eval <pack>` instead. Execute one PeonPing reroll job — invoked headlessly by the peon eval server as: "Use the peon-ping-remix skill to execute the reroll job at <path>". Reads the job JSON (scope, category, index, caption), rewrites the affected sound prompt(s) to honor the caption, re-renders via scripts/pack-render.py, and logs the change to eval-log.json.'
---
# peon-ping-remix

你正在为一个 PeonPing 草稿包执行一次重抽任务。只能在
该任务的 `draft_dir` 内操作。不得触碰任何其他目录，不得安装任何内容，不得进行提交。

## 未提供任务文件路径时

此 skill 仅供内部使用：它只会由 peon eval
服务器以任务文件路径无头调用。如果调用时没有提供路径（即有人直接运行了此 skill），除了告知对方此 skill 会由 eval 服务器自动运行，并应改为运行 `peon eval <pack>` 外，不得执行任何操作。
不得触碰任何文件。退出。

## 流程

1. 读取传入路径中的任务 JSON：`scope`（"sound" 或
   "pack"）、`category`、`index`、`caption`、`draft_dir`。
2. 读取 `<draft_dir>/openpeon.json` 和 `<draft_dir>/prompts.json`。如果缺少
   `prompts.json`，则以清晰的消息报告失败——没有当前提示词就无法执行重抽。
3. 确定目标声音文件：scope 为 "sound" → `categories[category].sounds[index].file` 中的一个文件；scope 为 "pack" → 每个类别中的所有文件。
4. 对每个目标，根据 caption 编写一个新的渲染输入：
   - 保持该包既有的美学风格（阅读其他提示词以了解上下文）。caption 是修正要求，而不是重置要求：例如“太刺耳了，希望更柔和”表示调整强度，同时保留乐器音色范围，除非 caption 明确要求其他内容。
   - sfx 条目：重写 `prompt`。tts 条目：重写 `text`（保留 `voice_id` —— 重抽时绝不能更改包的语音）。
   - 如果 caption 为空，则针对同一构想生成一个全新的变体。
5. 渲染每个目标：将新的输入写成一个位于
   `<draft_dir>/jobs/` 下的任务文件（例如 `<draft_dir>/jobs/render-job-<category>_<index>.json`
   —— `approve` 会清理 `jobs/` 下的所有内容，因此如果将渲染输入留在草稿根目录，它会作为垃圾文件被包含进已批准的包中），并运行 `python3 <peon-ping>/scripts/pack-render.py --job <file>`，其中
   `out` 设置为目标 WAV 路径（原地覆盖）。如果渲染失败，渲染器会以非零状态退出——此时立即停止，并将其 stderr 作为自身的非零退出信息；不要部分更新日志。
   （按以下顺序解析 `<peon-ping>`：如果设置了 `$PEON_DIR/scripts`，则使用它；否则使用 `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/hooks/peon-ping/scripts`；否则使用运行 peon 时所在的仓库检出目录。）
6. 只有在所有目标均成功渲染后：使用新输入更新 `prompts.json`，并向
   `<draft_dir>/eval-log.json` 追加每个已渲染声音一个条目（如果文件不存在则创建为 `[]`）：
   `{"ts": "<ISO8601>", "scope", "category", "index", "caption",
     "old_prompt", "new_prompt", "file"}`。
7. 为每个已渲染的声音打印一行摘要。退出状态为 0。

## 硬性规则

- 绝不能写入 `draft_dir` 之外的任何位置。
- 绝不能打印或记录 ElevenLabs 密钥。
- 渲染失败时，之前的 WAV 会保持原样——pack-render.py 会将渲染结果写入同一目录下的临时文件，并且仅在成功且非静音的渲染完成后，才通过原子操作 `os.replace` 替换 out 路径；渲染前不要删除 WAV。
- caption 代表用户的判断。先按字面要求执行，再进行创作。