---
name: asr-transcribe-to-text
description: >-
  Transcribe audio/video to speaker-labeled text — who-said-what by default, plain-text opt-out; MLX-local on Apple Silicon or remote; local files, media URLs. Use for transcribing recordings/podcasts/lectures/meetings, ASR, speech-to-text, 转录, 语音转文字, 录音转文字, speaker diarization/说话人分离/识别/谁在说话, timestamps 字幕/时间戳/音画对齐, CAM++ voiceprint ID. This skill ALSO owns audio PREPROCESSING for ASR as a first-class trigger, even without transcription: convert any audio/video into an ASR-ready file (转换成适合 ASR 的格式, 转格式, convert/prepare audio for ASR, 音频预处理), downsample to 16kHz mono 16-bit (降采样, 重采样, 单声道, 归一化), merge multi-segment recorder dumps (多段合并/拼接, DJI TX01/TX02), transcode to small M4A + pitch-preserved speedup to cut metered-ASR billed minutes (转 M4A, 压缩上传, 加速, 1.3x, 飞书妙记/Feishu Minutes). Trigger even when it looks like a trivial one-line ffmpeg — the skill owns sample-rate/bit-depth/channel, merge-order, speed-vs-WER, format choices + a blessed prepare_asr_input.py.
argument-hint: "[audio-or-video-file-path-or-url ...]"
---
# ASR 转录为文本

将音频/视频转录为带有**说话人标签**的文本。本地执行有两条明确路径。长录音或无人值守的录音使用带检查点的 whisper.cpp + Silero VAD 分块处理，然后再使用 pyannote 对说话人进行延迟融合。短时/中等时长的录音可以使用 Qwen3-ASR + mlx-whisper 对齐路径。两条路径都不会按说话人分段截断 ASR 输入；说话人归属会在保持连续上下文的 ASR 之后完成。

## ASR 前的路径选择：转录结果才是最终产物，而不是运行过程

开始转录前，检查所属项目的转录目录、外部来源索引以及声明的既有工作载体，使用来源 ID、日期、标题和实体术语查找现有的规范转录文本。经过验证、由人工审阅且为最新的转录文本会结束此任务，除非用户明确要求进行新的独立比较。已有原始音频并不是重新生成已有文本的理由。

当不存在规范转录文本时：

1. 对于允许使用云处理的普通会议/DJI 录音，使用 Feishu Minutes 作为常规首选路径（先预处理为较小的 M4A）。
2. 当用户要求离线/隐私处理、Feishu 不可用或失败，或者任务明确需要独立的质量比较时，使用本地 ASR。
3. 对于非会议媒体，或用户明确要求使用本地/远程 ASR 时，根据下方的音频位置规则选择执行位置。

不要仅仅为了让双路径流程看起来完整，就运行本地 ASR。

| 模式 | 适用情况 | 速度 | 成本 |
|------|------|-------|------|
| **本地 MLX** | macOS Apple Silicon | 实时速度的 15-27 倍 | 免费 |
| **远程 API** | 任意平台，或本地不可用时 | 取决于 GPU | API/自托管 |

**在两者之间进行选择通常与速度无关，而与音频已经存放的位置有关。**远程 GPU 的速度可能快数倍（实测使用 4090 运行 vLLM 时，相比本地 MLX 的约 15 倍实时速度，可达到约 61 倍实时速度），但与移动文件相比，这一差距微不足道：转录输出是文本，而文本大小约为其来源音频的 1/10,000（18.5 小时的语音约有 330 K 个字符 ≈ 1 MB，而对应的 WAV 约为 2.6 GB）。因此：

> **在哪里已有音频，就在哪里进行转录，只传输转录文本。**

通过缓慢的网络连接传输几百 MB 的文件以使用更快的 GPU，所花费的实际时间通常会超过完整转录所需的时间——曾有一次测得速度为 63 KB/s，传输 500 MB 需要两小时以上，而节省的计算时间只有几分钟。如果录音已经在远程机器上（在那里录制、在那里下载，或存放在挂载于那里的共享目录中），就在远程机器上运行 ASR，然后取回 `.txt`。

配置会持久化保存在 `${CLAUDE_PLUGIN_DATA}/config.json` 中。

> **说话人标签是默认设置。** 每次运行都会生成 `[start-end] SPEAKER_xx: text`
> + CSV。纯文本输出是选择退出项（`--no-diarization`），适用于独白、播客，或只想获取摘要的情况——请参见步骤 3。它还会删除所有时间戳：纯文本路径只返回会话文本，不返回其他内容。
> 需要逐行时间戳的独白内容（字幕、可跳转到具体时刻的档案）应运行完整流程，并忽略
> `SPEAKER_00` 标签。
>
> **说话人分离的一次性设置：** pyannote 是一个需要授权访问的 HuggingFace 模型——
> 需要一次性配置令牌（见下方的 `## Speaker Diarization & Identification`）。首次运行时如果没有令牌会失败并显示设置步骤；完成设置后，完整功能会永久保留并自动检测。

## 步骤 0：检测平台并加载配置

```bash
cat "${CLAUDE_PLUGIN_DATA}/config.json" 2>/dev/null
```

**如果配置存在**，读取值并继续执行步骤 1。

**如果配置不存在**，先自动检测平台：

```bash
python3 -c "
import sys, platform
is_mac_arm = sys.platform == 'darwin' and platform.machine() in ('arm64', 'aarch64')
print(f'Platform: {sys.platform} {platform.machine()}')
print(f'Apple Silicon: {is_mac_arm}')
if is_mac_arm:
    print('RECOMMEND: local-mlx')
else:
    print('RECOMMEND: remote-api')
"
```

然后使用 **AskUserQuestion**，并根据平台提供默认选项：

对于 **macOS Apple Silicon**（推荐：本地模式）：
```
ASR setup — your Mac has Apple Silicon, so local transcription is recommended.

Q1: Transcription mode?
  A) Local MLX — runs on your Mac's GPU, no API key needed, 15-27x realtime (Recommended)
  B) Remote API — send audio to a server (vLLM, Tailscale workstation, etc.)

Q2: Does your network have an HTTP proxy that might intercept traffic?
  A) Yes — bypass proxy for ASR traffic (Recommended if using Shadowrocket/Clash)
  B) No — direct connection
```

对于**其他平台**（推荐：远程模式）：
```
ASR setup — local MLX requires macOS Apple Silicon. Using remote API mode.

Q1: ASR Endpoint URL?
  A) https://asr.example.com/v1/audio/transcriptions (Self-hosted remote ASR)
  B) http://localhost:8002/v1/audio/transcriptions (Local ASR server)
  C) Custom URL

Q2: Proxy bypass needed?
  A) Yes (Recommended for Shadowrocket/Clash/corporate proxy)
  B) No
```

保存配置：
```bash
mkdir -p "${CLAUDE_PLUGIN_DATA}"
python3 -c "
import json
config = {
    'mode': 'MODE',           # 'local-mlx' or 'remote-api'
    'model': 'MODEL_ID',      # local: 'mlx-community/Qwen3-ASR-1.7B-8bit', remote: 'Qwen/Qwen3-ASR-1.7B'
    'max_tokens': 8192,       # local only; PER 20-minute chunk, not per recording
    'endpoint': 'URL',        # remote only
    'noproxy': True,
    'max_timeout': 900        # remote only
    # 'diarization_declined': True  # set only after the user explicitly declines
    #   the pyannote setup in Step 3 — every run then warns + goes plain-text
    #   until an HF token appears (auto-detected)
}
with open('${CLAUDE_PLUGIN_DATA}/config.json', 'w') as f:
    json.dump(config, f, indent=2)
print('Config saved.')
"
```

## 步骤 1：解析输入

接受本地文件、直接媒体 URL 或网页/播客单集页面。

- **网页或播客页面 URL**：先检查页面中是否已有现成的文字稿。仅当官方/平台文字稿可由用户账户直接访问时，才使用该文字稿。如果文字稿端点需要登录令牌且当前没有可用令牌，应明确说明，并从音频 URL 回退到 ASR。
- **本地文件、直接媒体 URL 或页面 URL 回退处理**：运行捆绑的解析器。该解析器会从常见页面元数据（`og:audio`、媒体标签、JSON-LD、RSS 风格的 enclosure 链接）中提取媒体，使用原子临时文件替换方式下载 URL，在存在远程 `Content-Length` 时进行验证，计算 SHA-256，并使用 `ffprobe` 验证结果。

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/resolve_media_input.py \
  INPUT_FILE_OR_URL [INPUT_FILE_OR_URL2 ...] \
  --output-dir OUTPUT_DIR \
  --manifest OUTPUT_DIR/media_manifest.json
```

对于可疑或高价值下载，请添加 `--decode-check`，使 `ffmpeg` 在转录前解码整个文件：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/resolve_media_input.py \
  "https://www.xiaoyuzhoufm.com/episode/EPISODE_ID" \
  --output-dir OUTPUT_DIR \
  --manifest OUTPUT_DIR/media_manifest.json \
  --decode-check
```

预期输出：

```text
Downloaded ... bytes in ...s -> OUTPUT_DIR/episode-title.m4a
OUTPUT_DIR/episode-title.m4a
```

在后续步骤中，将打印出的本地路径用作 `INPUT_AUDIO`。如果运行环境显示的是字面量 `${CLAUDE_SKILL_DIR}` 而非替换后的路径，请根据本文档底部“故障排除”条目解析 skill 目录。

对于第三方公开播客或受版权保护的媒体，请将转录稿保存为本地文件，供用户进行个人分析。不要在聊天中粘贴完整的长篇转录稿；请改为提供路径、预览、摘要或简短摘录。

## 第 2 步：提取音频（如果输入是视频）

对于视频文件（mp4、mov、mkv、avi、webm），提取为 16kHz 单声道 WAV：

```bash
ffmpeg -i INPUT_VIDEO -vn -acodec pcm_s16le -ar 16000 -ac 1 OUTPUT.wav -y
```

音频文件（wav、mp3、m4a、flac、ogg）可以直接使用。获取时长：
```bash
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 INPUT_FILE
```

**清理**：转录成功后，删除提取出的 WAV 文件以节省磁盘空间。

## 预处理：合并分段并缩减按量计费上传（可选）

当符合以下任一情况时，请在转录**之前**运行：

- **录音是多分段转储** — 领夹麦克风和现场录音机将
  会话拆分为固定时长的文件（例如，`TX02_MIC024_....wav`、`TX02_MIC025_....wav`；
  `TX01/TX02` = DJI MIC MINI 2S 内部录音 — 设备名册以及
  录音机→飞书妙记路径：meeting-ingest skill 的 `meeting-ingest/references/architecture.md` §①-L0）。
  请将它们一次性合并以保留会话顺序；显式的长音频运行器
  （第 3 步路径 L）随后负责稳定的源时间块。分别转录设备分段会丢失这些块内部的跨分段上下文。
- **音频将发送到按量计费的 ASR**（飞书妙记、任何按分钟计费的配额）— 保留音调的
  加速会直接减少计费时长，而现代 ASR 并不在意：
  1.3x 已在飞书妙记上由用户验证（2026-07-16），没有可感知的识别
  差异；公开的 Whisper 基准测试表明，在 2.0x 之前 WER 不会出现明显下降
  （≤1.5x = 安全区间，1.5x 时 WER 增加约 3%；>2x 不可用）。

请使用随附脚本 — 它会合并、归一化为 16 kHz 单声道、可选地加速，
并验证自身输出，而非仅信任 ffmpeg 退出码：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/prepare_asr_input.py SEG1.wav SEG2.wav -o merged.wav   # merge only
uv run ${CLAUDE_SKILL_DIR}/scripts/prepare_asr_input.py SEG*.wav -o upload.m4a --speed 1.3  # merge + quota-saving speedup
```

预期输出：

```text
Merge order:
  1. SEG1.wav  [pcm_s24le 48000Hz ch=1 1800.14s]
  2. SEG2.wav  [pcm_s24le 48000Hz ch=1 1800.15s]
[OK] duration: 4946.19s vs expected 4946.18s (delta +0.00s)
[OK] boundary 1 @ 1384.7s: max_volume -15.5 dB
[info] overall: mean_volume -38.3 dB, max_volume 0.0 dB
Wrote upload.m4a
```

- 当每个文件名中都嵌有 `YYYYMMDD_HHMMSS` 时间戳时，按该时间戳排序（录音机导出的文件都符合此规则）；否则保留给定顺序并附带说明 — 转写前请查看打印出的合并顺序。
- 自验证：输出时长必须等于 Σsegments ÷ speed（允许误差 ±1.5 秒，超出则直接 FAIL）；每个拼接处都进行 10 秒音量抽查（边界处无声 = 顺序错误或缺少片段）；打印整体响度，以便与源文件比较。
- 加速必须使用 `atempo` 风格的保留音高拉伸 — 绝不能使用采样率技巧，因为这会改变音高，并破坏 ASR 准确率和说话人日志中的声纹。
- **根据目标选择输出格式** — 编解码器由文件扩展名决定：

  | 目标 | 格式 | 原因 |
  |---|---|---|
  | 本地 MLX pipeline（Path A） | `.wav` 或 `.m4a` | 两者都可以直接输入 pipeline（m4a 已于 2026-07-18 验证：3 分钟切片可被干净地转写）。M4A 体积约小 5 倍 — 在一次 2 小时 49 分钟的合并中，324 MB WAV → 63 MB M4A，时长与 WAV 相差不到 1 秒 |
  | 计费上传（飞书妙记，按分钟配额） | `.m4a` + `--speed 1.3` | AAC 48k 对 ASR 而言具有足够高的语音透明度，在相同语音质量下比 mp3 小约 30%；加速可使计费时长减少约 23% |
  | 自托管 vLLM endpoint（Path B） | `.ogg` | 在 MP3 被拒绝时可以接受，而且体积约为 WAV 的 1/8 — 这正是让长录音保持在服务器 25 MB 请求上限以内的关键。参见 Path B 的限制部分 |
  | 无损归档 | `.flac` | 约为 WAV 体积的 50%，逐位无损 |
  | 仅当目标拒绝上述格式时 | `.mp3` | 兼容性备用方案 |
- 保留原始文件，直到转写通过步骤 4 的验证。

## 选项：上传到飞书妙记进行转写

完成预处理后，当用户希望使用**飞书妙记**，或普通会议/DJI 录音没有规范转写稿且允许进行云端处理时，使用此路径。这是常规的会议音频路径，不是必须先经过本地运行失败后才能使用的备用路径。

**触发短语**：传到妙记 / 上传到飞书妙记 / 让妙记转写 / 从此音频创建妙记 / 上传到飞书妙记。

**上传前先确认用户请求的结果类型**：

- **仅上传** — 用户明确表示只需要妙记链接，或只想上传媒体文件。创建 `minute_url` 即为终止状态。
- **仅转写稿** — 用户需要转写稿/摘要，但不需要项目归档。上传后，按照当前版本匹配的 `lark-minutes` 说明继续执行，直到转写稿就绪。
- **项目交付** — 用户需要修正、路由、知识库文件、项目索引或 Git 交接。`meeting-ingest` 负责整个任务；此 skill 仅作为其预处理参与者。上传前切换到该编排器，并持续执行，直到交付回执得到验证。
- **下游目标未指定** — 请求表示要预处理/上传（例如“上传到飞书妙记，先转成适合 ASR 的格式”），但没有说明妙记创建后应如何处理。按要求完成上传，不要擅自添加转写或项目范围，然后输出带有持久化令牌/URL 的 `outcome_pending`。后续的转写或知识库请求会继续使用同一个妙记；绝不会重新开始，也不依赖最初的猜测。

不要仅仅因为用户的第一个分句说“上传到妙记”，就推断为仅上传。
同一请求或项目上下文中明确的下游结果优先。

**约束**：
- **不使用代理**：所有 `lark-cli` 调用都必须使用 `LARK_CLI_NO_PROXY=1`。
- **单一配置**：仅使用当前激活的飞书配置。不要遍历租户配置，也不要调用租户路由。
- **默认不重复执行本地 ASR**：此分支由飞书负责转写。只有在明确要求离线处理或进行对比时，才运行本地 ASR。
- **加载当前飞书指引**：使用 `lark-cli-router`，然后读取与版本匹配的 `lark-minutes` 上传/详情说明。不要将此 skill 中过时的停止条件复制到当前 CLI 合约之上。

**分步操作**：

1. **尽可能使用上方章节中已经预处理的音频**。
   飞书接受封装在 MP4/MOV 中的 `.m4a`、`.mp3`、`.wav`、`.aac`；预处理器中的“计量上传”行已经完成了相应处理。文件必须小于 6 GB 且时长小于 6 小时，这是飞书上传的硬性限制。

2. **以用户身份上传到 Drive**：
   ```bash
   LARK_CLI_NO_PROXY=1 lark-cli drive +upload \
     --file '<preprocessed-media-path>' \
     --name '<basename>' \
     --as user \
     --format json
   ```
   从结果中记录 `file_token`。如果命令因路径校验或 multipart 失败而报错，不要盲目重试：切换格式或大小策略后再尝试一次，然后报告确切的失败原因。

3. **根据该 Drive 文件创建妙记**：
   ```bash
   LARK_CLI_NO_PROXY=1 lark-cli minutes +upload \
     --file-token '<file_token>' \
     --as user \
     --format json
   ```
   从结果中记录 `minute_token` 和 `minute_url`。

4. **根据之前确定的终端结果进行分支处理**：

   - 仅上传：返回 `minute_url` 并停止。
   - 仅转写：使用当前 `lark-minutes` 详情命令及其就绪等待行为，并加上 `--transcript`。已创建的 URL 只是中间结果；成功必须以可读取的转写产物为准。
   - 项目交付：将以下交接元组返回给 `meeting-ingest`，并在同一次运行中继续执行：`prepared_media`、`file_token`、`minute_token`、`minute_url`、`next_required_phase=minute_ready`。编排器等待云端转写，调用 `sync-feishu-minutes` 执行令牌范围内的摄取/路由/委派，运行完整的 `transcript-fixer`，更新每个项目所有的索引，完成 Git 交接，并记录交付结果。
   - 未指定下游结果：返回 `minute_token`、`minute_url`、`outcome_pending` 和 `next_required_phase=outcome_decision`。在用户提供下游结果之前，不要等待或归档转写内容。

如果就绪等待超时或下游阶段受阻，请报告最后一个确切完成的阶段以及持久化的 `minute_token`/`minute_url`。恢复时继续使用同一个令牌；绝不要仅为了获取新的 URL 而重新上传。

**预期输出**：
- 仅上传成功：返回一个用户可以打开的 `minute_url`。
- 未指定下游结果时成功：请求的上传已完成，同时明确表明运行仍可从 `outcome_pending` 恢复；不要将其称为项目交付。
- 仅转写成功：返回 `minute_url` 以及可读取的转写产物。
- 项目交付成功：只返回 `meeting-ingest` 推送的交付回执；预处理、URL 创建和转写下载都属于中间阶段。
- 失败：返回 `drive +upload` 或 `minutes +upload` 的确切 API 错误，并附带一项建议的下一步操作。

**错误技能恢复**：如果此请求到达时你正在使用
`sync-feishu-minutes`，请根据结果选择：仅上传的请求路由到此处；项目交付路由到
`meeting-ingest`，后者会调用此预处理分支，然后返回到受令牌作用域限制的飞书摄取流程。切勿将项目交付静默降级为 Minute URL。

## 第 3 步：转录（默认使用说话人标签）

### 路径 L：本地长录音 — whisper.cpp + Silero VAD（超过 30 分钟时的默认路径）

对于时长超过 30 分钟的录音、无人值守的批处理任务，或任何可能包含长时间静音／会后环境音的来源，使用此路径。这是 Apple Silicon 上的长音频处理路径：按源时间线对音频块进行检查点记录，每个音频块运行 whisper.cpp 的 Silero VAD，在音频块接缝处对 2 秒重叠部分去重，最后再延迟融合 pyannote 说话人标签。

四个运行时资源必须由操作员明确提供。不要在批处理中静默发现或下载这些资源。`whisper.cpp` 文档说明了模型和 VAD 的下载脚本；启动前请验证二进制文件、模型文件和 VAD 文件。

```bash
# 1. Checkpointed ASR on the original source timeline
uv run ${CLAUDE_SKILL_DIR}/scripts/transcribe_long_whispercpp.py \
  INPUT_16K_MONO_PCM16.wav OUTPUT_DIR \
  --ffmpeg-path /absolute/path/to/ffmpeg \
  --whisper-bin /absolute/path/to/whisper-cli \
  --whisper-model /absolute/path/to/ggml-large-v2-or-v3.bin \
  --vad-model /absolute/path/to/ggml-silero-v6.2.0.bin

# 2. Independent speaker timeline (controlled FFmpeg decode; no TorchCodec path)
uv run --frozen ${CLAUDE_SKILL_DIR}/scripts/diarize_speakers.py \
  INPUT_16K_MONO_PCM16.wav OUTPUT_DIR/STEM.diarization.json \
  --device mps --ffmpeg-path /absolute/path/to/ffmpeg

# 3. Keep only speech-grounded ASR segments and assign speakers by time overlap
uv run ${CLAUDE_SKILL_DIR}/scripts/fuse_whispercpp_diarization.py \
  OUTPUT_DIR/STEM.whispercpp.json \
  OUTPUT_DIR/STEM.diarization.json \
  INPUT_16K_MONO_PCM16.wav OUTPUT_DIR
```

如果实体录音设备在业务会议结束后仍持续录音，请将基于证据的源时间戳同时传递给两个相关步骤（`--end-at
SECONDS`）。保留原始音频和无界 ASR 证据，但不要将会后的车辆噪声或静音强行写入会议转录稿。

完成的标志是最终 TXT/CSV/融合回执均已存在，并且已经抽样检查开头、中间、结尾以及每个外部音频块接缝。仅有 `N/N blocks complete` 并不能作为质量声明。重新运行时必须报告每个已完成的音频块均已从缓存中读取。

官方架构依据：whisper.cpp 会在推理前提取语音；OpenAI Whisper 会重置先前文本上下文，以避免重复循环；NeMo 的长音频指南使用带重叠的缓冲区块。项目特定的实测证据和参数理由位于
`references/speaker_diarization.md`。

### 路径 A：本地 MLX（macOS Apple Silicon）— 短／中等长度的替代方案

运行解耦的说话人处理流程——它会在内部处理依赖固定版本、每个音频块有界生成、可恢复检查点、模型加载和进程树清理。

输入扩展名不会被信任为解码器契约。Qwen worker 首先使用固定版本的 MLX decoder；如果该 decoder 报告了已识别的输入/容器解码失败（例如 miniaudio 拒绝 Ogg/Opus），它会使用 `ffmpeg` 为固定版本的默认模型创建一个临时的 16 kHz 单声道 PCM WAV 并重试（自定义本地模型使用其声明的采样率）。GPU、内存以及无关的运行时失败会原样传播，绝不会触发规范化处理。checkpoint、输出名称和来源信息仍然绑定到原始源字节；临时 WAV 永远不会成为完成产物。

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/speaker_transcribe.py \
  INPUT_AUDIO [INPUT_AUDIO2 ...] OUTPUT_DIR
```

无人值守批处理：每次调用处理一个文件。任一环节出现确定性失败（例如某个录音达到每个 chunk 的 token 上限时出现 `ASR_DETERMINISTIC_BLOCKED: ChunkTokenLimitError`）都会按设计退出整个多输入运行，排在它之后的文件永远不会启动——一个包含 31 个文件的批处理就曾因此在第 11 个文件处终止。按文件调用可以将影响限制在单个录音内；中间环节已缓存，因此其他文件重新运行时只需付出对齐的成本。

预期输出（每个文件）：

```text
Device: mps
+ uv run .../transcribe_local_mlx.py ...        (leg 1: session text)
Chunk 1/6 starting at 0.0s (max_tokens=8192)
Chunk 1/6 committed: 6310 chars, 3812 tokens
+ uv run .../word_timestamps_whisper.py ...     (leg 2: timing lattice)
... diarization ...                             (leg 3: pyannote segments)
STEM: 42 turns, speakers=['SPEAKER_00', 'SPEAKER_01'], anchored_ratio=0.93
Wrote STEM.txt, STEM.csv, STEM.alignment.json, STEM.receipt.json
```

每个输入的输出：`<stem>.txt`（`[MM:SS - MM:SS] SPEAKER_xx` + 文本）、`<stem>.csv`（`file,start,end,duration,speaker,text` ——供审核 UI 和声纹 ID 使用）、`<stem>.diarization.json`、`<stem>.alignment.json`（来源信息 + `anchored_ratio` 信任信号；低于 0.5 时会打印醒目的警告——在信任标签之前，请对照音频进行核验），以及 `<stem>.receipt.json`（原子完成记录，绑定源字节、全部四个最终产物的哈希值、生成脚本、固定版本的模型/依赖项和语义参数）。中间环节缓存在 `OUTPUT_DIR/_align/` 中，因此重新运行成本很低（`--force` 会重新执行最终环节）。每个中间缓存 sidecar 都会绑定源音频字节、生成脚本字节、语义参数和产物字节；仅凭文件存在绝不会构成缓存命中。下游完成检查要求最终 receipt，而不是仅要求产物非空或存在 alignment JSON。Qwen chunk checkpoint 位于其 staging directory 下方；中断的运行会校验源音频 SHA-256、生成器/拆分器/依赖项契约、不可变的模型 revision、生成参数以及已完成 chunk 的哈希值，然后跳过已完成的 chunk，而不是从头开始处理录音。与语言无关的 12 字符 n-gram guard 会在最终交付前拒绝高度重复的 chunk 文本或整个 session 文本；quality-policy ID 属于 checkpoint identity 的一部分，因此较早生成但未经过检查的部分无法悄悄绕过该 guard。

在使用 Qwen3 路径之前，先对其进行一次冒烟测试：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/transcribe_local_mlx.py --smoke-test
```

预期输出应包含 `Dependency stack: mlx-audio 0.3.1, mlx-lm 0.30.5,
transformers 5.0.0rc3` 和 `Smoke test OK`。有关性能、分块 token 语义、资源限制和恢复机制，请阅读
`references/local_mlx_guide.md`。

**工作原理（以及原因）：** 使用会话范围内的 Qwen3-ASR 文本、mlx-whisper 词级时间戳和 pyannote 说话人分段，并在事后进行对齐。它避免了旧级联方案对每个经过说话人分段的单独轮次分别进行转录而导致的质量损失。不要将其有界生成分块提升为长音频保证：一段真实的多小时录音在 20、10 和 5 分钟的窗口下都触及了 token 上限。架构、对齐算法和故障模式请参阅：
`references/decoupled_speaker_alignment.md`。

**首次运行：pyannote 需要一次性配置 HuggingFace token。** 如果脚本因配置提示退出（退出代码为 3），请停止并使用 **AskUserQuestion**：

```
Speaker diarization needs a one-time setup (gated model, free):
  1. Accept terms at https://hf.co/pyannote/speaker-diarization-3.1
  2. Run `huggingface-cli login` (or set HF_TOKEN)

Options:
A) Set it up now — I'll wait, then rerun with full speaker labels (Recommended)
B) Continue without speakers this time — plain text only
```

- **A** → 用户确认登录后，重新运行相同的命令。每次运行都会自动检测 token；从此以后完整功能将永久可用。
- **B** → 持久化该选择（在 config.json 中设置 `diarization_declined: true`），然后重新运行相同的命令。脚本会检测该标记，打印包含这两个配置步骤的一行警告，并在本次运行中自动回退到纯文本模式 — 无需传入 `--no-diarization`（现在回退是自动进行的，由脚本强制执行，而不仅仅记录在文档中）。在 token 仍然缺失期间，之后每次运行都会进行相同的警告并继续。当之后出现 token 时，diarization 会自动恢复（token 存在后会忽略该标记）— 请告知用户只需完成配置即可。

**纯文本快速路径**（独白、播客、“只需总结内容”）：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/speaker_transcribe.py \
  INPUT_AUDIO OUTPUT_DIR --no-diarization
```

**远程/预生成的 ASR 文本**（例如来自 Path B 或其他 ASR 服务）：跳过 Qwen3 路径，直接对该文本进行对齐。`--text-file` 将一份转录文本与一个输入 wav 配对 — 传入多个输入会被拒绝（同一份转录文本无法与多个文件对齐）：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/speaker_transcribe.py \
  INPUT_AUDIO OUTPUT_DIR --text-file TRANSCRIPT.txt
```

**非 Apple Silicon 机器：** whisper 时间轴路径仅支持 MLX。没有它，就没有可用于将说话人对齐到其上的时间轴 — 请使用 `--no-diarization` 运行，并告知用户说话人模式目前需要 Apple Silicon（具备内置说话人分离功能的云端 ASR，例如飞书妙记，是无需本地 GPU 的替代方案）。

**在批处理许多短文件之前**（宣传片段、蒙太奇剪辑，以及任何可能只包含音乐音频的内容），请阅读下面的 `## Batch Transcription (many short files)`：一个只包含音乐的片段可能会让整个批处理停滞 10 分钟以上。

### 路径 B：远程 API

远程端点只返回纯文本；说话人信息会在本地通过将该文本（第 1 条支路）与本地的时间信息和说话人分离支路对齐来添加。因此，路径 B = 从远程获取文本，然后使用 `--text-file` 运行路径 A 的流程。

**先执行健康检查**（如果本次会话中已经验证过，则跳过）：
```bash
python3 -c "
import json, subprocess, sys
with open('${CLAUDE_PLUGIN_DATA}/config.json') as f:
    cfg = json.load(f)
base = cfg['endpoint'].rsplit('/audio/', 1)[0]
noproxy = ['--noproxy', '*'] if cfg.get('noproxy', True) else []
result = subprocess.run(
    ['curl', '-s', '--max-time', '10'] + noproxy + [f'{base}/models'],
    capture_output=True, text=True
)
if result.returncode != 0 or not result.stdout.strip():
    print(f'HEALTH CHECK FAILED: {base}/models', file=sys.stderr)
    sys.exit(1)
print(f'Service healthy: {base}')
"
```

读取配置并通过 curl 发送：

```bash
python3 -c "
import json, subprocess, sys, os, tempfile
with open('${CLAUDE_PLUGIN_DATA}/config.json') as f:
    cfg = json.load(f)
noproxy = ['--noproxy', '*'] if cfg.get('noproxy', True) else []
timeout = str(cfg.get('max_timeout', 900))
audio_file = 'AUDIO_FILE_PATH'
output_json = tempfile.mktemp(suffix='.json', prefix='asr_')

result = subprocess.run(
    ['curl', '-s', '--max-time', timeout] + noproxy + [
        cfg['endpoint'],
        '-F', f'file=@{audio_file}',
        '-F', f'model={cfg[\"model\"]}',
        '-o', output_json
    ], capture_output=True, text=True
)

with open(output_json) as f:
    data = json.load(f)
if 'text' not in data:
    print(f'ERROR: {json.dumps(data)[:300]}', file=sys.stderr)
    sys.exit(1)
text = data['text']
print(f'Transcribed: {len(text)} chars', file=sys.stderr)
print(text)
os.unlink(output_json)
" > OUTPUT.txt
```

然后在本地添加说话人信息（需要 Apple Silicon + pyannote token）：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/speaker_transcribe.py \
  INPUT_AUDIO OUTPUT_DIR --text-file OUTPUT.txt
```

#### 自托管 vLLM：容易以令人困惑的方式失效的限制

**这里版本很重要——其中两项限制在不同版本之间发生了变化。** 以下行为是针对 vLLM `0.15.2rc1.dev68`（开发版本；不存在 `0.15.2` 正式版本，PyPI 版本从 0.15.1 直接跳到 0.16.0）提供 `Qwen/Qwen3-ASR-1.7B` 时端到端测得的结果，之后又根据 `v0.26.0` 的源代码重新核对过。请先检查你自己的版本——运行 `pip show vllm`——并阅读第 #1 和第 #3 项中的版本说明。

**1. 发送 OGG，而不是 WAV——绝不要使用 MP3。** 在 0.15.x 上，MP3 会被直接拒绝，但下意识的修复方法（转换为 WAV）反而会让你触及第 #2 项中的大小上限：

| 格式 | 16 kHz 单声道、16 位、60 秒 | 0.15.x 接受 |
|---|---|---|
| WAV `pcm_s16le` | 1,920 KB | 是 |
| FLAC | 1,092 KB | 是 |
| **OGG Vorbis** | **245 KB** | **是** |
| MP3 | — | **否** |

在相同采样率下，OGG 的大小约为 WAV 的八分之一：

```bash
ffmpeg -nostdin -v error -i INPUT -ar 16000 -ac 1 -c:a libvorbis OUTPUT.ogg
```

如果你要自行比较格式，请固定位深——解码有损源时，ffmpeg 可以自由扩展位深，而 24-bit FLAC 的结果会比 16-bit PCM *更大*。这会让人误以为“FLAC 不压缩”，但实际上只是两者并非来自同一份录音。添加 `-sample_fmt s16`。

值得注意的是，MP3 的拒绝会以 **HTTP 200 和错误响应体的形式返回**——只检查 `%{http_code}` 的检查会报告成功：

```
HTTP=200
{"error": {"message": "Error opening <_io.BytesIO object>: Format not recognised.", ...}}
```

*版本说明：* 在 0.15.x 中，上传文件会通过 `librosa`/soundfile 读取到 `BytesIO`，即使主机的 libsndfile 能够处理磁盘上的 MP3，在这里也会拒绝 MP3。`v0.26.0` 在 soundfile 抛出 `LibsndfileError` 后添加了 pyav 回退机制（`multimodal/media/audio.py`），因此 MP3/M4A 可能可以在当前版本中解码——但出于上述文件大小原因，OGG 仍然是更好的选择。

**2. 请求大小上限为 25 MB。**

```
{"error":{"message":"Maximum file size exceeded (parameter=audio_filesize_mb, value=28.6)",...}}
```

`VLLM_MAX_AUDIO_CLIP_FILESIZE_MB` 的默认值为 `25`（`vllm/envs.py`，从 0.15.1 到 v0.26.0 均未改变）。按 OGG 约 245 KB/分钟计算，大约 **100 分钟**就会达到该上限——足以覆盖一次会议，但全天录音或合并后的多段录音文件会超过它。任务足够长时，请提高该值：

```bash
VLLM_MAX_AUDIO_CLIP_FILESIZE_MB=800 vllm serve <model> --port <port> ...
```

**3. `v0.26.0` 增加了第二个相互独立的限制：音频时长为 10 分钟。** 提高文件大小上限**不会**解除该限制——这是两个独立的检查条件，而且该限制会拒绝请求，而不是截断音频：

```
Audio exceeds maximum allowed duration of 600s (metadata reports 5998.0s).
Set VLLM_MAX_AUDIO_DECODE_DURATION_S to increase this limit.
```

`VLLM_MAX_AUDIO_DECODE_DURATION_S` 的默认值为 `600`，位于 `envs.py` 中文件大小上限之后的下一行——它在 0.15.x 中不存在，因此一个在旧服务器上可以正常运行的讲座时长文件，在全新安装的服务器上可能会被拒绝。在 `v0.26.0`+ 中，同时设置这两个值：

```bash
VLLM_MAX_AUDIO_CLIP_FILESIZE_MB=800 VLLM_MAX_AUDIO_DECODE_DURATION_S=36000 \
  vllm serve <model> --port <port> ...
```

**4. 在无法访问 huggingface.co 的主机上，即使模型已经缓存在本地，模型加载也会失败。** vLLM 启动时会为 `config.json` 发起一次 `HEAD` 请求，重试五次后退出——错误信息会说“在缓存文件中找不到它们”，即使文件确实就在本地：

```bash
HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 vllm serve <model> ...
```

另一个症状相同但原因不同、值得优先排查的问题是：**容器化**服务器拥有自己的 `HF_HOME`，无法看到主机用户的 `~/.cache/huggingface`，因此你能够通过 `ls` 看到的模型，对于容器而言确实不存在。

**5. vLLM 已经会对长音频进行分块——效果优于客户端自行切分。** `SpeechToTextConfig` 包含 `overlap_chunk_second=1` 和 `min_energy_split_window_size=1600`，也就是说，它会**在约 100 ms 窗口内最安静的位置进行切分**，而不是按照固定偏移量切分，因此切点会落在单词之间。解除上述限制后，100 分钟的文件可以通过一个请求发送。这就是为什么下面的步骤 5 回退方案只针对**不会执行此操作的服务器**。

**没有权限重启服务器？** #2/#3 中的上限是在服务器启动时设置的，所以当你无法操作服务器时，剩下的选择就是在客户端拆分文件——这正是步骤 5；对于这样的端点，这是合适的工具，而不是退而求其次的方案。

⚠️ **但是，`overlap_merge_transcribe.py` 无法直接驱动 0.15.x vLLM 端点**：它使用
`-acodec copy` 将分块切割成 `chunk_NN.mp3`，因此当输入本身已经是 MP3 时，它会输出 MP3（根据 #1 会被拒绝）；对于其他任何输入则会直接失败——它从不检查 ffmpeg 的退出状态，所以错误的分块会在之后表现为 JSON 解析错误，而不是明确提示“ffmpeg failed”。这些分块也会在同一个 `TemporaryDirectory` 中创建并随之销毁，因此没有任何可以转换它们的时机。对于这样的端点，请手动拆分为 OGG，然后逐个提交：

```bash
ffmpeg -nostdin -v error -i INPUT -f segment -segment_time 900 \
  -ar 16000 -ac 1 -c:a libvorbis chunk_%02d.ogg
```

请注意，这会失去重叠合并的拼接效果，因此句子可能会在分块边界处断开——这正是 #5 中服务器端基于能量的拆分器要避免的问题。

**如果远程健康检查失败**，请按以下顺序诊断：

1. 网络：`ping -c 1 HOST` 或 `tailscale status | grep HOST`
2. 服务：`tailscale ssh USER@HOST "curl -s localhost:PORT/v1/models"`
3. 代理：切换 `--noproxy '*'` 后重试

**4. “到底有没有程序在监听？”——单独使用 `ss` 会误导你。** 它只显示当前用户的进程，因此以其他用户身份运行的服务器或**容器内部**运行的服务器对它不可见，但仍可以正常提供流量。请同时查询 Docker：

```bash
tailscale ssh USER@HOST "ss -ltn | grep -E ':(8000|8001|8002)'; \
  docker ps --format '{{.Names}}\t{{.Ports}}\t{{.Status}}'"
```

**5. “GPU 空闲吗？”** ——在启动另一台服务器之前，请检查是否确实有程序占用了显存。无论旧笔记如何声称某项服务“占用”了 GPU，只要计算应用列表为**空**，就表示没有程序正在使用它：

```bash
tailscale ssh USER@HOST "nvidia-smi --query-compute-apps=pid,process_name,used_memory --format=csv"
# under WSL nvidia-smi is often off PATH: /usr/lib/wsl/lib/nvidia-smi
```

**6. 要重启它？`pkill -f 'vllm serve'` 会杀掉发出该命令的进程。** `-f`
会匹配完整的命令行——而你刚刚输入的命令行中正好包含这个字符串，因此 pkill 会匹配到
当前 shell。结果是：旧进程被杀掉，新进程却永远不会启动，并且**不会有任何错误报告**。请将首字母包裹在字符类中，使该模式无法匹配自身：

```bash
tailscale ssh USER@HOST "pgrep -f '[v]llm serve'"   # check
tailscale ssh USER@HOST "pkill -f '[v]llm serve'"   # kill
```

任何在同一行中也输入了匹配模式的 `pkill -f` 都存在同样的陷阱。

## 步骤 4：验证输出

转录完成后，请检查内容是否完整：

1. 确认输出不为空
2. 检查字符数是否合理（中文约为每分钟 400 个字符，英文约为每分钟 200 个单词）
3. 对于本地 MLX，确认检查点清单显示 `status: complete`；当任何分块达到其 token 上限时，脚本会拒绝写入最终的 `.txt`
4. 对于旧版或远程输出，请检查**结尾**——以句子中间结束可能意味着发生了截断
5. 向用户展示开头和结尾各约 200 个字符作为预览
6. **说话人路径**：检查对齐报告——`anchored_ratio` 应 ≥ 0.5（低于此值时脚本会发出警告），说话人数量应符合录音情况（两人访谈却显示有 5 位说话人，或独白被拆分成 2 位以上说话人，都意味着说话人分离过度——何时不应信任这些标签，请参阅 `references/speaker_diarization.md`）

当此运行是针对现有高风险转录的独立证据轨迹时，完整性意味着整个基线录音已到达完整检查点/最终收据。选定的片段可以确定选定的 utterance，但不能支持整个转录或“更高质量最终版本”的声明。将完整输出交给 `transcript-fixer`；让其人工审核环节处理未解决的专有名称分歧。

如果内容被截断或不正确，请使用 **AskUserQuestion**：
```
Transcription may be truncated:
- Expected: ~[N] chars for [M] minutes of audio
- Got: [actual] chars ([pct]% of expected)
- Last line: "[last 100 chars...]"

Options:
A) Inspect the failed chunk; if it is dense real speech, retry with a measured
   per-chunk budget up to 16384
B) If it is music/silence repetition, classify or preprocess that chunk instead
C) Switch mode — try [local/remote] instead
D) Abort
```

## 步骤 5：回退方案：重叠合并（仅限远程 API）

**检查你的服务器是否会在内部进行分块，然后再考虑使用此方案。** vLLM 会进行内部处理（路径 B 限制 #5），并且其基于能量的切分效果优于此脚本的固定偏移切分。在你控制的 vLLM 端点上，过长文件应通过提高上限来修复，而不是在客户端进行切分。

当端点**无法接收整个文件**时，在客户端进行分块：例如，它直接拒绝过长音频（固定上下文窗口、硬性单次请求时长限制），在相同输入长度下每次都会 OOM，或者它确实会在内部进行分块，但你没有权限提高其上限。

**超时是另一种故障，通常有成本更低的修复方式**：请求已被接受，并且仍在运行。请先在配置中提高 `max_timeout`（100 分钟的文件若以约实时速度的 60 倍处理，仍需要几分钟，而默认值可能比这更严格）；只有在设置了宽裕的超时时限后仍然超时，才考虑分块，这意味着服务器确实无法在一次处理中及时完成。

满足上述任一条件时，回退到分块转录：

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/overlap_merge_transcribe.py \
  --config "${CLAUDE_PLUGIN_DATA}/config.json" \
  INPUT_AUDIO OUTPUT.txt
```

该脚本会将音频切分为 18 分钟的片段，并设置 2 分钟的重叠区，然后使用去除标点符号的模糊匹配进行合并。算法细节请参阅 `references/overlap_merge_strategy.md`。

对于本地 MLX 模式，无需进行重叠合并：随附脚本使用固定版本的 Qwen 低能量切分器，以原子方式提交每个片段，并且默认按**每个片段**设置 `max_tokens=8192`。

## 步骤 6：建议进行转录校正

ASR 输出始终包含识别错误，例如同音词、难以辨认的技术术语和断裂的句子。转录成功后，**主动建议**对输出运行 `transcript-fixer` skill：

```
Transcription complete: [N] chars saved to [output_path].

ASR output typically contains recognition errors (homophones, garbled terms, broken sentences).
Would you like me to run /daymade-audio:transcript-fixer to clean up the text?

Options:
A) Yes — run daymade-audio:transcript-fixer on the output now (Recommended)
B) No — the raw transcription is good enough for my needs
C) Later — I'll run it myself when ready
```

如果用户选择 A，请使用输出文件路径调用 `transcript-fixer` skill。这两个 skill 构成自然的流水线：**转录 → 校正 → 审核**。

如果用户在同一轮中已经请求了校正、多轨合并或更高质量的转录，则该请求已经选择了 A。继续进入 `transcript-fixer`，无需再次询问用户是否批准相同的工作。

## 重新配置

```bash
rm "${CLAUDE_PLUGIN_DATA}/config.json"
```

然后重新运行步骤 0。

## 批量转录（多个短文件）

将多个文件传递给一次 `transcribe_local_mlx.py` 调用效率很高（模型只需加载一次），**但前提是每个文件都包含实际语音。** 如果批次中可能包含仅音乐 / 仅 BGM 的片段（带字幕而非旁白的短宣传视频、混剪片段），请不要在一个进程中批量处理：

- 对于仅音乐 / 节奏音频，模型可能陷入**重复循环幻觉**（例如不断输出“one, two, three, one, two, three...”）。每个分块的 8192 token 上限可以限制资源增长，而 12 字符 n-gram 质量门控会拒绝即使在达到该上限前停止的循环；但一个异常文件仍可能耗尽整个分块超时时间，使批次中的其他文件得不到处理。
- **让批处理作业按每个文件一个进程运行，并为每个文件设置超时**（例如在每次调用外层使用 `timeout 240` / `perl -e 'alarm 240; exec @ARGV'`，超时则跳过，并对失败文件进行第二轮处理）。这样，一个卡住的文件只会耗费 4 分钟，而不是拖住整个批次。
- 对于卡住的文件，使用 `--max-tokens 3000` 重试：短片段中的真实语音可以轻松容纳；陷入循环的文件则会产生可截断、可分类的输出。
- **检测“无语音”而不是交付垃圾结果**：如果转录结果的唯一词比例极低（例如对于长度超过 40 个字符的输出，`len(set(words))/len(words) < 0.06`），则该片段几乎可以确定没有旁白，应将其标记为无语音，而不是交付循环文本。（对于仅有字幕的视频，实际的修复方法是对屏幕字幕执行下游 OCR。）

## 单词级时间戳（字幕、音画对齐）

mlx-whisper 的单词计时是**短 / 中等 Qwen speaker 流水线的计时部分**（第 2 部分，`scripts/word_timestamps_whisper.py` 会自动运行它）。本节介绍如何**单独**使用单词时间戳：生成字幕、将旁白与镜头边界对齐、为每个片段生成字幕。

Qwen3-ASR 是一种 LLM 解码器 ASR：无论本地路径还是远程路径，它都只输出纯文本，不包含对齐信息。当任务需要知道*每个单词在何时被说出*时，请使用启用 `word_timestamps=True` 的 `mlx-whisper`。对于这类任务，Whisper 的交叉注意力单词对齐是事实上的本地解决方案。

关键事实（完整步骤见 `references/whisper_word_timestamps.md`）：

- 模型：`mlx-community/whisper-large-v3-turbo`（约 1.6GB）。对于纯转录，其中文 WER 高于 Qwen3-ASR，但对于对齐任务，Qwen3-ASR 根本不是可选方案；请通过 `initial_prompt` 提前提供领域术语。
- **片段粒度陷阱**：对于短视频（15–40 秒），Whisper 经常将整个片段作为一个片段返回，因此始终应基于单词列表，并按照时间中点将单词分配到时间窗口。
- 与 ffmpeg 场景检测（`select='gt(scene,0.3)'`）配合处理视觉侧；避免在非 ASCII 路径上使用 PySceneDetect。

## 说话人分离与识别（谁说了什么）

说话人标签是第 3 步的默认输出。两条本地路径都会将 ASR 与
pyannote 解耦，并按时间进行融合；二者都不会单独转录说话人轮次的切分片段。
本节介绍相关组成部分。

- **短/中等长度流水线** — `scripts/speaker_transcribe.py` 在一条命令中运行全部三条路径
  以及对齐，并写入带说话人标签的转录文本和 CSV。
  架构、对齐算法、信任信号（`anchored_ratio`）以及失败模式：
  `references/decoupled_speaker_alignment.md`。生产环境中的注意事项（过度分段、麦克风领域效应、
  何时不应信任标签）：`references/speaker_diarization.md`。
- **仅说话人分离** — `scripts/diarize_speakers.py` 只输出
  `speaker × time` 片段（不进行转录）。
- **旧版级联流程** — `scripts/speaker_transcribe_cascade.py` 是旧的
  先切分再转录变体（进行说话人分离 → 按轮次切分音频 → 对每个
  切片进行 ASR）。它会在每次切分处打断 ASR 上下文并降低文本质量；仅保留用于
  极度嘈杂或严重重叠的音频，此时对每个切片隔离占主导地位的近场说话人，其效果优于基于会话级别的 ASR。
  其他情况均使用解耦的默认流程。
- **声纹识别** — 说话人分离标签是匿名的
  （`SPEAKER_00`……）且仅在每个文件内有效。要将它们映射到真实姓名、
  在多个文件中统一同一说话人，或合并说话人分离产生的过度分段，请使用
  `scripts/voiceprint_id.py` 中的 CAM++ 声纹。配方**以及关键的
  声学领域注意事项**——使用一种麦克风类型构建的声纹，在不同麦克风上匹配
  同一个人的效果会差很多：
  `references/voiceprint_speaker_id.md`。

**一次性 pyannote 设置**（受限模型）：在
`hf.co/pyannote/speaker-diarization-3.1` 接受条款，然后运行一次
`huggingface-cli login`（或设置 `HF_TOKEN`）。此后每次运行都会自动检测。

## 转录审计与审阅（HTML）

完成说话人分离后，每个文件都会得到一个 CSV（`file,start,end,duration,speaker,text`）。
随附的审计 HTML 生成器会将这些 CSV 转换为一个以阅读为先的审阅页面，支持音频播放、
每个轮次的标记/备注、说话人别名以及导出。

从说话人转录输出目录生成：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/generate_audit_html.py \
  OUTPUT_DIR \
  --output OUTPUT_DIR/audit/index.html \
  --audio-dir /path/to/original/audio
```

默认假定 `PROJECT_DIR` 下采用扁平布局：`PROJECT_DIR/*.csv` 为转录文件，
`PROJECT_DIR/*.diarization.json` 为说话人分离文件，原始音频文件与输出文件放在同一目录。
`speaker_transcribe.py` 本身会将 CSV、TXT 和说话人分离文件以扁平形式写入其 `OUTPUT_DIR` 下。
如果项目使用不同的结构，可以覆盖其中任意路径：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/generate_audit_html.py \
  /path/to/project \
  --output /path/to/project/audit/index.html \
  --csv-dir /path/to/project/csv \
  --txt-dir /path/to/project/txt \
  --diarization-dir /path/to/project/diarization \
  --audio-dir /path/to/project/audio \
  --original-dir /path/to/project/original \
  --manifest /path/to/project/manifest.json \
  --title "Project Audit" \
  --subtitle "Speaker-labeled transcript review" \
  --storage-key "project-audit" \
  --known-speaker "Speaker A" \
  --known-speaker "Speaker B"
```

**主要 CLI 选项：**

| 选项 | 含义 |
|--------|---------|
| `project_dir` | 基础项目目录（必需） |
| `--output` | 写入 `index.html` 的位置 |
| `--csv-dir` | 包含 `*.csv` 转录文件的目录 |
| `--txt-dir` | 包含 `*.txt` 纯文本转录文件的目录（可选） |
| `--diarization-dir` | 包含 `*.diarization.json` 文件的目录 |
| `--audio-dir` | 包含用于播放的音频文件的目录 |
| `--original-dir` | 包含原始源媒体的目录（可选） |
| `--manifest` | 将文件 ID 映射到元数据的 JSON 清单（可选） |
| `--title` / `--subtitle` | 页面标题和副标题 |
| `--storage-key` | 用于持久化状态的 `localStorage` 命名空间 |
| `--known-speaker` | 可重复使用；`"Name"` 自动分配颜色，`"Name=#hex"` 显式设置颜色 |
| `--material-final` / `--material-rough` | 用于筛选的可重复使用的素材分类标签 |

输出是一个不含外部依赖的单一自包含 HTML 文件。在浏览器中打开即可审阅、标记和注释各个发言段；导出按钮会生成一份包含所有已标记行、标记原因和备注的报告。

## 故障排除

### 本地 MLX 在加载模型时失败

如果模型加载失败，并出现类似以下错误：

```text
AttributeError: 'str' object has no attribute '__module__'
```

代理可能正在使用未经固定版本或过时的本地 MLX 脚本副本。已知可正常工作的版本组合是：

```text
mlx-audio 0.3.1
mlx-lm 0.30.5
transformers 5.0.0rc3
```

运行捆绑的 `--smoke-test` 命令，并确认依赖版本组合行匹配。请不要在 smoke test 成功之前开始长音频转录。

### 自托管远程端点拒绝音频

以下每种现象看起来都指向错误的原因，因此值得根据症状加以识别。完整详情和修复方法：Path B 的“自托管 vLLM：以令人困惑的方式失效的限制”部分。

| 症状 | 实际原因 |
|---|---|
| `Maximum file size exceeded (parameter=audio_filesize_mb, ...)` | 25 MB 上限，按**字节而非分钟**计算——转换为 WAV 通常正是超过上限的原因；请发送 OGG（大约小 8 倍） |
| `HTTP 200`，但响应体是 `{"error": ... "Format not recognised."}` | 将 MP3 发送给了 0.15.x 服务器——而仅检查状态码的逻辑会将其判定为成功 |
| `Audio exceeds maximum allowed duration of 600s` | 在 `v0.26.0` 中新增的**第二个独立**上限；提高大小上限不会解除该限制 → `VLLM_MAX_AUDIO_DECODE_DURATION_S` |
| 服务器无法启动：提示“couldn't find them in the cached files”，但模型*确实*已缓存 | 启动时尝试连接 huggingface.co → `HF_HUB_OFFLINE=1`；如果使用容器，容器的 `HF_HOME` 可能根本看不到主机的缓存 |
| 长文件失败，并且你正准备在客户端进行分块 | vLLM 已经会在低能量点进行拆分——请改为解除上限，除非你无法重启服务器（Step 5 解释了何时适合分块） |

### whisper timing leg 因 `httpx.ProxyError: 503 Service Unavailable` 退出

`word_timestamps_whisper.py` 会在从本地缓存加载模型之前，向 huggingface.co 查询模型。在代理隧道不稳定的情况下，该请求会失败并导致该处理阶段退出；即使所有模型文件都已在磁盘上，这仍会导致整个文件失败（某一批次的 44 个文件中有 6 个出现这种情况）。为此次运行设置 `HF_HUB_OFFLINE=1`：离线模式会直接从缓存加载，且永远不会建立连接。与上面的 vLLM 服务器表格行相同，使用的是同一个变量，原因也相同。

### 未替换 `${CLAUDE_SKILL_DIR}`

此技能中的脚本路径使用 `${CLAUDE_SKILL_DIR}` —— 即技能自身所在的目录，Claude Code 在技能加载时会替换该变量。如果某条命令传入的是字面量 `${CLAUDE_SKILL_DIR}`（某些运行时不会进行替换），请按以下顺序解析技能目录：

1. 技能加载信封：`Base directory for this skill: <path>` → `<path>` 即技能目录。
2. 没有信封 → 查找候选目录，并选择本会话可用技能列表所指向的目录（已安装的副本可能落后于源代码检出目录）：
   `find ~/.claude ~/.claude-profiles ~/.codex ~/workspace -maxdepth 7 -type d -name asr-transcribe-to-text 2>/dev/null | head -5`

在本文档中的所有位置，将 `${CLAUDE_SKILL_DIR}` 替换为解析得到的绝对路径。

## 随附资源

**脚本：**
- `resolve_media_input.py` —— 将本地路径、直接媒体 URL 以及播客/网页解析为经过验证的本地媒体文件
- `prepare_asr_input.py` —— 合并多段录音并进行 ASR 规范化处理（16 kHz 单声道）；针对按量计费的上传，可选择保留音高的加速处理；会自行验证时长计算和拼接边界
- `transcribe_local_mlx.py` —— 本地 MLX 转录（macOS ARM64，PEP 723 依赖）；限制低能量片段，支持原子检查点/恢复，以及所有者存活状态绑定
- `transcribe_long_whispercpp.py` —— **长音频 ASR 的默认方案**：显式源时间块 + 重叠归属 + whisper.cpp/Silero VAD + 原子检查点/恢复
- `fuse_whispercpp_diarization.py` —— 将规范化的 whisper.cpp 时间片段与 pyannote 语音/说话人结果进行后期融合；移除无依据的静音幻觉，并输出 TXT/CSV/receipt
- `speaker_transcribe.py` —— 短/中等长度音频的解耦流水线（会话级 Qwen3-ASR + whisper 时间信息 + pyannote）；`--no-diarization` 纯文本快速路径；`--text-file` 用于远程或预生成的 ASR 文本
- `align_speakers.py` —— 解耦对齐核心（标准库）：将完整转录文本映射到 whisper 词级格和 pyannote 片段；在停顿和说话人变化处切分轮次，但绝不会在拉丁词内部切分；可独立用于调试
- `word_timestamps_whisper.py` —— mlx-whisper 词级时间戳 → JSON 时间信息格（Apple Silicon）
- `speaker_transcribe_cascade.py` —— **旧版**先切分后转录方案（仅适用于极其嘈杂或说话人严重重叠的音频）
- `diarize_speakers.py` —— 仅执行说话人分离（pyannote 3.1 @ MPS）→ 每个片段的 JSON
- `voiceprint_id.py` —— CAM++ 声纹注册/匹配：将匿名的 SPEAKER_xx 映射为真实姓名
- `overlap_merge_transcribe.py` —— 带重叠合并的分块转录（远程 API 后备方案）
- `generate_audit_html.py` —— 根据 speaker-transcribe CSV 输出构建自包含的 HTML 审计/审核页面

**参考资料：**
- `decoupled_speaker_alignment.md` —— 默认架构：为何采用解耦设计、对齐算法、可信度信号和故障模式
- `speaker_diarization.md` —— 生产环境中的问题：过度切分、麦克风域影响、何时不应信任标签；旧版级联方案说明
- `voiceprint_speaker_id.md` —— CAM++ 说话人识别：注册/匹配、阈值+间隔门控、声学域限制，以及引导初始化
- `local_mlx_guide.md` —— 性能基准、每个片段的 token/资源契约、检查点恢复、模型兼容性
- `whisper_word_timestamps.md` —— mlx-whisper 词级时间信息：短/中等长度 Qwen 流水线中的时间信息环节；独立的字幕/音视频对齐方案
- `overlap_merge_strategy.md` —— 为何朴素分块会失败、模糊合并算法