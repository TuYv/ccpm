---
name: stepfun-asr
description: Transcribe audio with StepFun's stepaudio-2.5-asr — an SSE endpoint (NOT /v1/audio/transcriptions) with 32K context, ~85-101x RTF on long audio, and a single-call ceiling around 30 minutes (no client-side chunking). Use when transcribing Chinese / English audio with StepFun, when long-form recordings (5-30 min) need to land in one request, when migrating from step-asr / step-asr-1.1, or when hitting the misleading `model stepaudio-2.5-asr not supported` error (which actually means wrong endpoint). Triggers on 阶跃 ASR, StepFun ASR, stepaudio-2.5-asr, 转录, 语音识别, 长音频转写, 语音转文字. For TTS with the sibling stepaudio-2.5-tts model, use the stepfun-tts skill instead.
---
# StepFun stepaudio-2.5-asr

使用 StepFun 的 `stepaudio-2.5-asr` 转录音频（发布于 2026-04，验证于 2026-04-23）。只需一次调用即可处理长音频，无需分块——但**前提是**请求必须发送到正确的端点，并使用正确的请求体结构。使用错误的端点会返回一个与“模型不存在”完全相同的错误，这正是本技能存在的首要原因。

> 配套技能：如需使用 `stepaudio-2.5-tts`（同系列模型）进行 TTS，请使用 `stepfun-tts` 技能——二者共用 API 密钥，但位于不同的端点，并使用不同的请求体结构。

## 本技能存在的原因——三个会浪费数小时的陷阱

1. **错误的端点，错误的错误信息**。`stepaudio-2.5-asr` **不**位于 `/v1/audio/transcriptions`（该端点供较旧的 `step-asr` 系列使用）。它位于 `/v1/audio/asr/sse`——使用 SSE 流式传输、JSON 请求体和 base64 音频。将请求发送到错误的端点会返回 `{"error":{"message":"model stepaudio-2.5-asr not supported"}}`，其**结构与**模型名称确实不存在时返回的错误完全相同。人们因此浪费数小时提交白名单工单。

2. **Plan 密钥与 Normal 密钥，静默失败**。StepFun 的“Plan”订阅密钥（价格低廉，仅限文本）无法调用音频端点，但失败时只会表现为 4xx，且没有类似身份验证错误的信息。如果你的账户订阅了 Plan，则需要从同一个控制台获取单独的“Normal”密钥。

3. **SSE 错误事件确实存在**。内容审查也可能在 ASR 端触发（尽管很少见）。不要假设流中只会出现 `transcript.text.delta` 和 `transcript.text.done` 事件——请处理流中的 `type: error` 事件，否则这些错误会被静默丢弃。

## 配置与身份验证

API 密钥按以下顺序解析（快速失败，不使用默认值）：

1. `$STEPFUN_API_KEY` 环境变量
2. `${CLAUDE_PLUGIN_DATA}/config.json`，内容为 `{"api_key": "..."}`（跨会话持久化）

首次设置：

```bash
mkdir -p "${CLAUDE_PLUGIN_DATA}" && cat > "${CLAUDE_PLUGIN_DATA}/config.json" <<EOF
{"api_key": "<paste Normal key here>"}
EOF
```

如果用户尚未设置密钥，请让他们粘贴密钥——不要猜测，也不要使用占位符。请前往 https://platform.stepfun.com/ → API Keys 获取密钥。**请使用 Normal 密钥，而不是 Plan 密钥。**

## 快速开始——单个文件

```bash
python3 scripts/asr_transcribe.py /path/to/audio.mp3
```

输出：在 stdout 上输出纯文本转录结果。

如需包含用量／计时信息的机器可读输出：

```bash
python3 scripts/asr_transcribe.py /path/to/audio.mp3 --json
```

对于非中文音频：

```bash
python3 scripts/asr_transcribe.py /path/to/audio.mp3 --language en
```

该脚本会处理 base64 编码、嵌套的 `{audio: {data, input: {transcription, format}}}` 请求体、SSE 解析，以及误导性的端点陷阱。除非要集成到更大的流水线中，否则应优先使用该脚本，而不是自行编写 HTTP 调用。

## 决策表

| 场景 | 操作 |
|---|---|
| 短音频片段（< 5 分钟），中文或英文，mp3/wav/ogg/opus | `python3 scripts/asr_transcribe.py audio.mp3` |
| 长音频（5-30 分钟） | 使用相同脚本——32K 上下文可通过一次调用处理，无需分块 |
| 音频 > 30 分钟 | 发送前使用 ffmpeg 分割；API 会拒绝过大的载荷 |
| 需要用量／计费数据 | 添加 `--json`，以从 `transcript.text.done` 中捕获 `usage.input_tokens` / `usage.total_tokens` |
| 高度重复的内容（同一短语出现 5 次以上，时长 > 90 秒） | 使用 `step-asr-1.1` 进行交叉验证——参阅 `references/known_issues.md` 中的重复幻觉问题 |
| 遇到 `model stepaudio-2.5-asr not supported` | 端点错误。将 `/v1/audio/transcriptions` 切换为 `/v1/audio/asr/sse` |
| 遇到静默的 4xx 身份验证失败 | 确认你的密钥是“Normal”而不是“Plan”——Plan 密钥无法调用音频端点 |
| 需要编写原始 HTTP 请求（不使用 Python） | 阅读 `references/api_reference.md`，了解准确的 JSON 请求体和 SSE 事件结构 |

## 支持的音频格式

脚本会根据扩展名自动检测格式；可传入 `--format` 进行覆盖：

| 扩展名 | 格式标志 | 说明 |
|---|---|---|
| `.mp3` | `mp3` | 最常用，默认格式 |
| `.wav` | `wav` | 无损 |
| `.ogg` | `ogg` | OGG 容器 |
| `.opus` | `ogg` | OGG 容器中的 Opus 编解码器——原样传入，不做修改 |
| `.pcm` | `pcm` | 原始 PCM——还需要 `format.rate`、`format.channel`、`format.bits`（参见 API 参考文档） |

对于 mp4/m4a/webm 等格式，请先通过 ffmpeg 转码为上述格式之一。生产流水线通常会预先将所有音频转码为 OGG/Opus 16kHz 单声道，以尽量减小 base64 载荷大小。

## 容量与性能（验证于 2026-04-23）

- **32K 上下文窗口**——单次调用的上限，对于 ≤ 30 分钟的音频无需分块
- **长音频约为 85-101× RTF**（17.4 分钟音频 → 10.4 秒实际耗时）
- **在 100 秒以上的时长范围内，相比 step-asr-1.1 约有 5.3× 的加速**
- **在 5-15 秒范围内仅约有 2× 的加速**——LLM 启动成本在短音频中占主导。如果你的工作负载包含大量短音频，迁移的投资回报率有限

## 常见错误模式

| 错误响应 | 实际原因 | 修复方法 |
|---|---|---|
| `/v1/audio/transcriptions` 上出现 `"model stepaudio-2.5-asr not supported"` | 端点错误 | 切换到 `/v1/audio/asr/sse`（脚本已这样处理） |
| 无身份验证消息的静默 4xx 错误 | 在音频端点使用了「Plan」密钥 | 从 StepFun 控制台获取「Normal」密钥 |
| ASR 返回的字符数是预期的 3-4 倍 | 高度重复音频导致重复幻觉 | 使用 `step-asr-1.1` 进行交叉验证；参见 `references/known_issues.md` |
| 流中途出现 `data: {"type":"error","message":"content blocked..."}` | 用户上传的内容触发了内容审查 | 显式处理 SSE `error` 事件；不要假设只会收到 `delta`/`done` |

更多边界情况请参见 `references/known_issues.md`。

## 设计不变量（请勿破坏）

1. **始终透传 SSE**——不要尝试使用非流式客户端缓冲响应。对于长音频，模型会发出 `transcript.text.delta`；`transcript.text.done` 包含权威的完整文本和 `usage`。如果完全拒绝 SSE 格式，你将无法获得任何内容。
2. **从 `transcript.text.done.text` 获取最终文本**——拼接后的增量文本在边界情况下可能出现偏差。增量文本用于渐进式 UI；`done` 事件才是事实来源。
3. **处理流中的 `error` 事件**——不要认为 SSE 流中只会出现成功事件。流中途出现的内容拦截事件会返回 `type: error`，且不会产生 `done` 事件。
4. **缺少 API 密钥时快速失败**——绝不要默认使用占位符或空字符串。脚本已这样处理；任何包装器都应保留此行为。

## 何时阅读参考文档

- `references/api_reference.md`——准确的 JSON 请求体、所有字段、所有 SSE 事件类型及响应示例。使用原始 HTTP 调用而非捆绑脚本时请阅读。
- `references/known_issues.md`——重复幻觉的详细信息、错误端点的诊断过程、Plan 与 Normal 密钥的陷阱、ASR 端内容审查的处理方式，以及定价不透明问题。在调试异常输出或评估是否从 `step-asr-1.1` 迁移时请阅读。

## 定价（已于 2026-04-23 核实，可能随时变动）

截至 2026-04-23，`stepaudio-2.5-asr` 处于邀请测试阶段——尚无公开的每分钟价格。`step-asr-1.1` 的基准价格为 2.2 元/小时。邀请测试 PDF 中提到“成本直降 80%”，意味着价格约为 0.4 元/小时，但该价格尚未出现在定价页面上。在向利益相关者报价前，请前往 https://platform.stepfun.com/docs/zh/guides/pricing/details 重新核实。

## 后续步骤

ASR 转写文本几乎总能从以下两种下游处理步骤之一中受益。生成转写文本后，建议使用自然衔接的下一个技能：

```
Transcription complete. The output is raw text from the model — common next steps:

Options:
A) transcript-fixer — clean up ASR errors (homophones, segmentation, filler words). Recommended if the recording is a real-world conversation, podcast, or interview rather than read-aloud text
B) meeting-minutes-taker — turn the transcript into structured minutes with decisions, action items, and speaker attribution. Recommended if the recording is a meeting
C) No thanks — the raw transcript is what I needed
```

如果用户已经指定了下游工具，或者此次转写明显只是一次性查询（例如，“这段 15 秒的音频说了什么？”），则跳过该建议。