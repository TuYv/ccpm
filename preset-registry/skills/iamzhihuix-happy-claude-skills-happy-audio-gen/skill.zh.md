---
name: happy-audio-gen
description: Universal AI voice / text-to-speech skill supporting OpenAI TTS (gpt-4o-mini-tts, tts-1), ElevenLabs multilingual TTS with voice cloning, Bailian Qwen TTS (qwen-tts / qwen3-tts-vd with voice-design custom voices, long-text chunking built in), MiniMax speech-02-hd, SiliconFlow CosyVoice / SenseVoice, and PlayHT 2.0. Use this skill whenever the user asks to read text aloud, synthesize speech, generate narration, create voice-over, dub a script, or turn any text into audio (mp3 / wav / ogg / flac). Typical phrases include "read this aloud", "generate voice for ...", "create a narration of ...", "tts this", "把这段念出来", "做个配音", "合成语音", or mentions of voices / TTS model names like Alloy, Ash, Cherry, Rachel, CosyVoice, PlayHT. Always use this skill even if the user does not specify a provider — pick one from EXTEND.md defaults or available env keys.
version: 0.1.0
---
# happy-audio-gen

通过一个 CLI，使用 6 家提供商将文本转换为语音。除 Bailian 的语音设计流程外，所有提供商均采用同步方式（TTS 速度很快——通常不到 10 秒）；Bailian 的语音设计流程也受支持，但会使用更长的轮询时间窗口。

## 快速使用

```bash
# Shortest path — OpenAI default voice
bun scripts/main.ts --text "Hello, world" --out ./hello.mp3

# Chinese, MiniMax
bun scripts/main.ts --provider minimax --text "大家好" --voice male-qn-qingse --out ./hello.mp3

# Long-form, Bailian (auto-splits by sentence)
bun scripts/main.ts --provider bailian --textfiles ./script.md --out ./narration.mp3
```

## 何时调用此 Skill

- 用户要求合成语音 / TTS / 朗读 / 旁白 / 配音 / 制作画外音。
- 用户要求将脚本 / 文本 / 文章转换为音频。
- 用户指定了某个 TTS 语音或模型。

当用户想要将音频转写为文本（即音频 → 文本，这是 STT，属于不同领域），或编辑 / 混合音频文件（请使用专用音频编辑器）时，**不要**路由到此处。

## 第 0 步：预检（阻断性）

1. **查找 EXTEND.md**：
   - `./.happy-skills/happy-audio-gen/EXTEND.md`
   - `$XDG_CONFIG_HOME/happy-skills/happy-audio-gen/EXTEND.md`
   - `~/.happy-skills/happy-audio-gen/EXTEND.md`

   如果均未找到，请运行 `bun scripts/main.ts --setup`，并按照 `references/config/first-time-setup.md` 引导用户完成设置。

2. **验证至少一家提供商已配置凭据**（环境变量或 1Password 引用）。

3. **验证 Bun** 可用。备用方案：`npx -y bun`。

## 第 1 步：选择提供商

优先级顺序：

1. `--provider <id>`
2. EXTEND.md 中的 `default_provider`
3. 自动检测环境变量：`openai > elevenlabs > bailian > minimax > siliconflow > playht`

根据语言 / 语音意图进行选择：

- **英语、自然且快速** → `openai`（gpt-4o-mini-tts / tts-1）。
- **多语言、语音克隆** → `elevenlabs`。
- **中文、长文本** → `bailian`（qwen-tts 会自动将长脚本分块）或 `minimax`。
- **中文方言 / 语音设计** → `bailian`（使用 qwen3-tts-vd 的语音设计）或 `siliconflow`（CosyVoice2）。
- **超逼真、短文本** → `playht`（2.0）。

## 第 2 步：填写参数

- **`--text`** 或 **`--textfiles`**：输入。始终使用引号。
- **`--out <path>`**：必填。扩展名决定格式（`.mp3` / `.wav` / `.ogg` / `.flac`）。
- **`--voice <id>`**：因提供商而异。常用语音的简短列表请参阅 `references/voices.md`。
- **`--rate 0.5..2.0`**：语速。
- **`--instruction "..."`**：语音风格指令（仅 `openai` gpt-4o-mini-tts 和 `siliconflow` 支持）。
- **`--language <code>`**：`en`、`zh`、`ja`——只有少数提供商会明确使用此参数。

## 第 3 步：运行

```bash
bun scripts/main.ts \
  --provider openai \
  --model gpt-4o-mini-tts \
  --voice alloy \
  --text "..." \
  --out ./out.mp3
```

JSON 模式：

```json
{ "success": true, "provider": "openai", "model": "gpt-4o-mini-tts", "voice": "alloy", "output": "/abs/out.mp3", "size_bytes": 76032, "format": "mp3" }
```

## 第 4 步：长文本处理

- 对于限制单次调用长度的提供商，`happy-audio-gen` 会自动拆分长输入（Bailian 每次调用不超过 200 个中文字符）。输出时，各分块会按字节直接拼接。
- 为了在拼接 MP3 时获得最佳保真度，请随后使用 ffmpeg 拼接各片段，而不要依赖按字节直接拼接。

## 第 5 步：错误

- `[openai] OpenAI TTS 400` 并提示 `invalid voice` → 该模型不支持此语音名称。请使用 `alloy`、`ash`、`coral`、`echo`、`fable`、`onyx`、`nova`、`sage`、`shimmer` 中的一个。
- `[minimax] ... 2049 invalid api key` → 尝试设置 `MINIMAX_BASE_URL=https://api.minimaxi.com/v1`（适用于不同区域）。
- `[bailian] ... 400 DataInspectionFailed` → 阿里云内容过滤。将此错误告知用户。
- `[elevenlabs] 401` → 密钥无效或订阅已过期。

## 参考资料

- `references/providers.md` — 各提供商的环境变量、默认模型和语音列表。
- `references/voices.md` — 为每个提供商精选的语音。
- `references/error_codes.md` — 常见错误及修复方法。
- `references/config/first-time-setup.md`
- `references/config/extend-schema.md`
- `assets/EXTEND.template.md`