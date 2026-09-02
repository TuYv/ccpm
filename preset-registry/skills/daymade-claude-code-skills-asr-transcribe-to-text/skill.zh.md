---
name: asr-transcribe-to-text
description: >-
  Transcribe audio/video to speaker-labeled text — who-said-what by default, plain-text opt-out; MLX-local on Apple Silicon or remote; local files, media URLs. Use for transcribing recordings/podcasts/lectures/meetings, ASR, speech-to-text, 转录, 语音转文字, 录音转文字, speaker diarization/说话人分离/识别/谁在说话, timestamps 字幕/时间戳/音画对齐, CAM++ voiceprint ID. This skill ALSO owns audio PREPROCESSING for ASR as a first-class trigger, even without transcription: convert any audio/video into an ASR-ready file (转换成适合 ASR 的格式, 转格式, convert/prepare audio for ASR, 音频预处理), downsample to 16kHz mono 16-bit (降采样, 重采样, 单声道, 归一化), merge multi-segment recorder dumps (多段合并/拼接, DJI TX01/TX02), transcode to small M4A + pitch-preserved speedup to cut metered-ASR billed minutes (转 M4A, 压缩上传, 加速, 1.3x, 飞书妙记/Feishu Minutes). Trigger even when it looks like a trivial one-line ffmpeg — the skill owns sample-rate/bit-depth/channel, merge-order, speed-vs-WER, format choices + a blessed prepare_asr_input.py.
argument-hint: "[audio-or-video-file-path-or-url ...]"
---
# ASR 转写为文本

将音频/视频转写为**带说话人标签**的文本。本地执行有两
条明确路径。较长或无人值守的录音使用带 checkpoint 的 whisper.cpp +
Silero VAD 分块，然后在后期融合 pyannote 说话人信息。较短/中等长度的录音可以使用 Qwen3-ASR + mlx-whisper 对齐路径。两条路径都不会在 diarization 轮次处切断 ASR 输入；说话人归属发生在连续上下文 ASR 之后。

## ASR 前的路径：转写是结果，不是流程

在开始转写之前，检查所属项目的转写目录、外部来源索引，以及声明的既有成果载体，是否已经存在使用 source ID、日期、标题和实体术语确定的规范转写。经过验证的、人工审核过的、当前有效的转写会结束任务，除非用户明确要求新的独立比较。原始音频存在本身，并不足以重新生成已经存在的文本。

当不存在规范转写时：

1. 对于普通会议/DJI 录音且允许云端处理时，使用 Feishu Minutes 作为默认主路径（先预处理成一个较小的 M4A）。
2. 当用户要求离线/隐私处理、Feishu 不可用或失败，或者任务明确需要独立质量比较时，使用本地 ASR。
3. 对于非会议媒体或明确的本地/远程 ASR 请求，根据下面的音频位置规则选择执行位置。

不要仅仅为了让两条路径流程看起来完整，就运行本地 ASR。

| 模式 | 何时使用 | 速度 | 成本 |
|------|----------|------|------|
| **本地 MLX** | macOS Apple Silicon | 15-27x realtime | 免费 |
| **远程 API** | 任意平台，或本地不可用时 | 取决于 GPU | API/自托管 |

**在它们之间做选择，通常不是看速度，而是看音频已经在哪里。** 远程 GPU 可能会快几倍（使用 vLLM 的 4090 实测约为 ~61x realtime，对比本地 MLX 的 ~15x），但与搬运文件相比，这种差异只是小钱：转写输出是文本，而文本比它来源的音频小约 10,000×（18.5 小时语音 ≈ 330 K 字符 ≈ 1 MB，而原始 WAV 约为 ~2.6 GB）。所以：

> **在音频已经所在的地方进行转写，只搬运转写文本。**

为了到达更快的 GPU 而跨慢速链路搬运几百 MB，往往比整次转写本身还耗时——曾在 63 KB/s 下测得，传输 500 MB 需要两个多小时，只是为了节省几分钟计算时间。如果录音本来就已经在远端机器上（是在那里录制的、在那里下载的，或者存放在挂载到那里的共享目录中），就在那台机器上运行 ASR，然后把 `.txt` 带回来。

配置保存在 `${CLAUDE_PLUGIN_DATA}/config.json` 中。

> **说话人标签是默认行为。** 每次运行都会生成 `[start-end] SPEAKER_xx: text`
> + CSV。纯文本输出是 `--no-diarization` 的退出选项，适用于独白、播客，或者你只想要摘要的场景——见步骤 3。
>
> **说话人分离与识别的一次性设置：** pyannote 是一个受限访问的 HuggingFace 模型——
> 它只需要一次 token（见下面的 `## Speaker Diarization & Identification`）。第一次不带它运行会失败并给出设置步骤；完成设置后，完整能力将永久可用并自动检测。

## 第 0 步：检测平台并加载配置

```bash
cat "${CLAUDE_PLUGIN_DATA}/config.json" 2>/dev/null
```

**如果 config 存在**，读取值并继续到第 1 步。

**如果 config 不存在**，先自动检测平台：

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

然后使用带平台感知默认值的 **AskUserQuestion**：

对于 **macOS Apple Silicon**（推荐：local）：
```
ASR setup — your Mac has Apple Silicon, so local transcription is recommended.

Q1: Transcription mode?
  A) Local MLX — runs on your Mac's GPU, no API key needed, 15-27x realtime (Recommended)
  B) Remote API — send audio to a server (vLLM, Tailscale workstation, etc.)

Q2: Does your network have an HTTP proxy that might intercept traffic?
  A) Yes — bypass proxy for ASR traffic (Recommended if using Shadowrocket/Clash)
  B) No — direct connection
```

对于 **其他平台**（推荐：remote）：
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

保存 config：
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

## 第 1 步：解析输入

接受本地文件、直接媒体 URL，或网页/播客剧集页面。

- **网页或播客页面 URL**：先检查页面中是否已有现成的 transcript。仅当官方/平台 transcript 可由用户账户直接访问时才使用它。如果 transcript 端点需要登录 token 而当前没有可用 token，请明确说明，并回退到从音频 URL 进行 ASR。
- **本地文件、直接媒体 URL，或页面 URL 回退**：运行内置 resolver。它会从常见页面元数据（`og:audio`、media tags、JSON-LD、RSS 风格的 enclosure links）中提取媒体，使用原子化临时文件替换来下载 URL，验证远程 `Content-Length`（如果存在），计算 SHA-256，并使用 `ffprobe` 验证结果。

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/resolve_media_input.py \
  INPUT_FILE_OR_URL [INPUT_FILE_OR_URL2 ...] \
  --output-dir OUTPUT_DIR \
  --manifest OUTPUT_DIR/media_manifest.json
```

对于可疑或高价值下载，添加 `--decode-check` 以让 `ffmpeg` 在转录前先完整解码整个文件：

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

在后续步骤中，将打印出的本地路径用作 `INPUT_AUDIO`。如果你的运行环境显示的是字面量 `${CLAUDE_SKILL_DIR}`，而不是替换后的路径，请按照本文档底部 Troubleshooting 条目中的说明解析 skill 目录。

对于第三方公开播客或受版权保护的媒体，请将转录保存为本地文件，供用户个人分析使用。不要在聊天中粘贴完整的长转录内容；相反，请提供路径、预览、摘要或简短摘录。

## Step 2: 提取音频（如果输入是视频）

对于视频文件（mp4、mov、mkv、avi、webm），提取为 16kHz 单声道 WAV：

```bash
ffmpeg -i INPUT_VIDEO -vn -acodec pcm_s16le -ar 16000 -ac 1 OUTPUT.wav -y
```

音频文件（wav、mp3、m4a、flac、ogg）可以直接使用。获取时长：
```bash
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 INPUT_FILE
```

**清理**：转录成功后，删除提取出的 WAV 文件以节省磁盘空间。

## 预处理：合并分段与缩减计量上传（可选）

在以下任一情况出现时，先运行此步骤，再进行转录：

- **录音是多段转储**——机身麦克风和外场录音设备会将会话拆分为固定时长文件（例如 `TX02_MIC024_....wav`、`TX02_MIC025_....wav`；`TX01/TX02` = DJI MIC MINI 2S 内部录音——设备清单以及 recorder→Feishu-Minutes 路径见 meeting-ingest skill 的 `meeting-ingest/references/architecture.md` §①-L0）。将它们一次性合并以保留会话顺序；明确的长音频运行器（第 3 步 Path L）随后会负责稳定的源时间块。分别转录设备分段会丢失这些片段内部的跨段上下文。
- **音频会发送到计量型 ASR**（Feishu Minutes、任何按分钟计费的配额）——保持音高不变的加速可以直接减少计费时长，而且现代 ASR 不会在意：用户已于 2026-07-16 在 Feishu Minutes 上验证 1.3x 没有可感知的识别差异，公开的 Whisper 基准也显示直到 2.0x 才会出现明显的 WER 下降（≤1.5x = 安全区，1.5x 时约 +3% WER；>2x 不可用）。

使用捆绑脚本——它会合并、规范化为 16 kHz 单声道，按需加速，并在信任 ffmpeg 退出码之前自行验证输出：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/prepare_asr_input.py SEG1.wav SEG2.wav -o merged.wav   # 仅合并
uv run ${CLAUDE_SKILL_DIR}/scripts/prepare_asr_input.py SEG*.wav -o upload.m4a --speed 1.3  # 合并 + 节省配额的加速
```

```text
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

- 当每个文件名里都有 `YYYYMMDD_HHMMSS` 时间戳时，按该时间戳对片段排序（录音机导出的文件就是这样）；否则保持给定顺序，并附注说明 —— 转写前先目视检查打印出的合并顺序。
- 自我验证：输出时长必须等于 Σsegments ÷ speed（误差 ±1.5 s，超出则硬失败）；每个拼接点都要做 10 s 的音量抽查（边界处静音 = 顺序错误或缺少片段）；整体响度会打印出来，供与源文件对比。
- 加速必须是 `atempo` 风格的保留音高伸缩 —— 绝不能用采样率技巧，那会改变音高并破坏 ASR 准确率和说话人分离的声纹。
- **按目标选择输出格式** —— 编解码器由文件扩展名决定：

  | 目标 | 格式 | 原因 |
  |---|---|---|
  | 本地 MLX 流水线（Path A） | `.wav` 或 `.m4a` | 两者都能直接供流水线使用（m4a 已于 2026-07-18 验证：3 分钟片段转写正常）。M4A 体积约小 5 倍——在一次 2h49m 的合并中，324 MB WAV → 63 MB M4A，时长与第二个完全一致 |
  | 计费上传（飞书妙记，按分钟额度） | `.m4a` + `--speed 1.3` | AAC 48k 对 ASR 来说在语音上没有损失，体积与等质量 mp3 相比约小 30%；加速可将计费时长缩短约 23% |
  | 自托管 vLLM 端点（Path B） | `.ogg` | 在 MP3 被拒绝的地方也能接受，而且比 WAV 约小 8 倍——这正是把一段长录音压进服务器 25 MB 请求上限的关键。见 Path B 的限制部分 |
  | 无损归档 | `.flac` | 约为 WAV 的 50%，比特级无损 |
  | 仅当目标拒绝上述格式时 | `.mp3` | 兼容性兜底 |
- 直到第 4 步验证通过前，都保留原始文件。

## 选项：上传到飞书妙记进行转写

预处理完成后，当用户想要 **飞书妙记**，或者普通会议/DJI 录音没有规范转写且允许云端处理时，使用这条路径。它是标准的会议音频路径，不是必须先失败本地运行之后才启用的兜底方案。

**触发短语**：传到妙记 / 上传到飞书妙记 / 让妙记转写 / create a minute from this audio / upload to Feishu minutes.

**上传前先确认用户要的结果**：

- **仅上传** —— 用户明确表示只想要一个 Minute 链接，或者只想把媒体上传上去。创建 `minute_url` 就是终态。
- **仅转写** —— 用户想要转写/摘要，但不需要项目归档。上传后，按当前版本匹配的 `lark-minutes` 指令继续处理到可用转写为止。
- **项目交付** —— 用户想要校正、路由、知识库文件、项目索引或 Git 交接。`meeting-ingest` 负责整体任务；这个 skill 只是它的预处理参与者。上传前切换到该协调器，并持续运行直到它的交付回执被验证。
- **下游未指定** —— 请求只是要求预处理/上传（例如，“上传到飞书妙记，先转成适合 ASR 的格式”），但没有说明 Minute 生成后应做什么。按要求完成上传，不要擅自推断转写或项目范围，然后输出 `outcome_pending` 以及持久化的 token/URL。后续的转写或知识库请求会复用同一个 Minute；它既不会从头开始，也不会依赖最初的猜测。
```

不要仅仅因为用户的第一句写着“上传到妙记”就推断为仅上传。

同一请求或项目上下文中的明确下游结果优先。

**约束**：
- **无代理**：所有 `lark-cli` 调用都必须使用 `LARK_CLI_NO_PROXY=1`。
- **单一 profile**：只使用当前生效的 Feishu profile。不要遍历 tenant profiles，也不要调用 tenant 路由。
- **默认不要重复做本地 ASR**：在这个分支上由 Feishu 负责转写。只有在明确的离线/对比目的下才运行本地 ASR。
- **加载当前 Feishu 指南**：先使用 `lark-cli-router`，再阅读版本匹配的 `lark-minutes` 上传/详情说明。不要从这个 skill 里复制过时的停止条件，应该遵循实时 CLI 合约。

**步骤**：

1. **尽可能使用上面已经预处理好的音频**。Feishu 接受放在 MP4/MOV 容器中的 `.m4a`、`.mp3`、`.wav`、`.aac`；预处理器的“Metered upload”行已经是这种形态。保持文件小于 6 GB 且时长小于 6 小时——这是 Feishu 上传的硬限制。

2. **以用户身份上传到 Drive**：
   ```bash
   LARK_CLI_NO_PROXY=1 lark-cli drive +upload \
     --file '<preprocessed-media-path>' \
     --name '<basename>' \
     --as user \
     --format json
   ```
   从结果中记录 `file_token`。如果命令因路径校验或 multipart 失败而报错，不要盲目重试——改用其他格式或大小策略，再尝试一次，然后报告精确失败原因。

3. **基于该 Drive 文件创建分钟纪要**：
   ```bash
   LARK_CLI_NO_PROXY=1 lark-cli minutes +upload \
     --file-token '<file_token>' \
     --as user \
     --format json
   ```
   从结果中记录 `minute_token` 和 `minute_url`。

4. **根据先前已确定的终态分支处理**：

   - 仅上传：返回 `minute_url` 并停止。
   - 仅转写：使用当前 `lark-minutes` 的详情命令及其就绪等待行为，并带上 `--transcript`。创建出来的 URL 只是中间结果；成功的要求是获得一个可读的转写产物。
   - 项目交付：把这个交接元组返回给 `meeting-ingest`，并在同一次运行中继续：`prepared_media`、`file_token`、`minute_token`、`minute_url`、`next_required_phase=minute_ready`。编排器会等待云端转写，调用 `sync-feishu-minutes` 进行基于 token 的 ingest/routing/delegation，运行完整的 `transcript-fixer`，更新所有项目拥有的索引，完成 Git 交接，并记录交付。
   - 下游未指定：返回 `minute_token`、`minute_url`、`outcome_pending` 和 `next_required_phase=outcome_decision`。在用户给出该下游结果之前，不要等待或提交转写。

如果就绪超时或某个下游阶段阻塞，报告精确的最后完成阶段以及持久化的 `minute_token`/`minute_url`。恢复时继续使用同一个 token；不要为了拿到新的 URL 而重新上传。

**期望输出**：
- 仅上传成功：一个用户可以打开的 `minute_url`。
- 下游未指定成功：请求中的上传已完成，同时该运行显式保持在 `outcome_pending`，不要把它称为项目交付。
- 仅转写成功：`minute_url` 加上一个可读的转写产物。
- 项目交付成功：只由 `meeting-ingest` 推送交付回执；预处理、URL 创建和转写下载都是中间阶段。
- 失败：来自 `drive +upload` 或 `minutes +upload` 的精确 API 错误，以及一个建议的下一步操作。

**错误技能恢复**：如果此请求进入 `sync-feishu-minutes`，请按结果选择：仅上传路径走这里；项目交付路径转到 `meeting-ingest`，由它调用这个预处理分支，然后再回到按 token 范围的 Feishu 采集。绝不要把项目交付悄悄降级成 Minute URL。

## 第 3 步：转写（默认带说话人标签）

### 路径 L：长本地录音 — whisper.cpp + Silero VAD（>30 分钟默认）

当录音长于 30 分钟、需要无人值守批处理，或任何源很可能包含长静音 / 会议结束后的环境音时，使用这条路径。它是 Apple Silicon 的长文本路线：源时间块会被 checkpoint，每个块运行 whisper.cpp 的 Silero VAD，块边界处会去重 2 秒重叠，之后再迟融合 pyannote 说话人标签。

四个运行时资产都是明确的操作员输入。不要在批处理中静默发现或下载它们。`whisper.cpp` 文档说明了模型和 VAD 的下载脚本；在开始前验证 binary/model/VAD 文件。

```bash
# 1. 在原始源时间线上进行带 checkpoint 的 ASR
uv run ${CLAUDE_SKILL_DIR}/scripts/transcribe_long_whispercpp.py \
  INPUT_16K_MONO_PCM16.wav OUTPUT_DIR \
  --ffmpeg-path /absolute/path/to/ffmpeg \
  --whisper-bin /absolute/path/to/whisper-cli \
  --whisper-model /absolute/path/to/ggml-large-v2-or-v3.bin \
  --vad-model /absolute/path/to/ggml-silero-v6.2.0.bin

# 2. 独立说话人时间线（受控 FFmpeg 解码；不走 TorchCodec 路径）
uv run --frozen ${CLAUDE_SKILL_DIR}/scripts/diarize_speakers.py \
  INPUT_16K_MONO_PCM16.wav OUTPUT_DIR/STEM.diarization.json \
  --device mps --ffmpeg-path /absolute/path/to/ffmpeg

# 3. 只保留有语音依据的 ASR 段，并按时间重叠分配说话人
uv run ${CLAUDE_SKILL_DIR}/scripts/fuse_whispercpp_diarization.py \
  OUTPUT_DIR/STEM.whispercpp.json \
  OUTPUT_DIR/STEM.diarization.json \
  INPUT_16K_MONO_PCM16.wav OUTPUT_DIR
```

如果物理录音设备在业务会结束后仍然继续运行，请把有证据支持的源时间戳传给两个相关步骤（`--end-at SECONDS`）。保留原始音频和不设上限的 ASR 证据，但不要把会议结束后的车噪或静音强行塞进会议转录。

完成的标准是最终 TXT/CSV/fusion receipt 存在，并且已经采样了开头、中间、结尾，以及每个外侧块边界。仅有 `N/N blocks complete` 不能作为质量声明。重跑时必须报告每个已完成块都已缓存。

官方架构依据：whisper.cpp VAD 会在推理前提取语音；OpenAI Whisper 会重置前文上下文以避免重复循环；NeMo 长音频指导使用重叠缓冲块。项目特定的测量证据和参数依据记录在 `references/speaker_diarization.md`。

### 路径 A：本地 MLX（macOS Apple Silicon）— 短/中等时长替代方案

运行解耦的说话人流水线——它在内部处理依赖锁定、按 chunk 生成、可恢复 checkpoint、模型加载和进程树清理。

输入扩展名不能被信任为解码器契约。Qwen worker 先使用固定的 MLX 解码器；如果该解码器报告了已识别的输入/容器解码失败（例如 miniaudio 拒绝 Ogg/Opus），它会使用 `ffmpeg` 为固定默认模型创建一个临时的 16 kHz 单声道 PCM WAV（自定义本地模型使用其声明的采样率），然后重试。GPU、内存以及无关的运行时失败会原样传播，绝不会触发归一化。checkpoint、输出名称和 provenance 仍然绑定到原始源字节；临时 WAV 永远不会成为完成产物。

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/speaker_transcribe.py \
  INPUT_AUDIO [INPUT_AUDIO2 ...] OUTPUT_DIR
```

期望输出（每个文件）：

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

每个输入的输出：`<stem>.txt`（`[MM:SS - MM:SS] SPEAKER_xx` + 文本）、`<stem>.csv`（`file,start,end,duration,speaker,text` — 供审阅 UI 和 voiceprint ID 使用）、`<stem>.diarization.json`、`<stem>.alignment.json`（provenance + `anchored_ratio` 信号；低于 0.5 会打印醒目的警告 — 在信任标签前请先对照音频核验）、以及 `<stem>.receipt.json`（原子完成记录，绑定源字节、全部四个最终产物的哈希、producer 脚本、固定模型/依赖和语义参数）。中间 leg 会缓存到 `OUTPUT_DIR/_align/`，因此重跑很便宜（`--force` 会重新运行最终 leg）。每个中间缓存 sidecar 都会绑定源音频字节、producer 脚本字节、语义参数和产物字节；仅凭文件存在绝不会命中缓存。下游完成检查要求最终 receipt，而不是仅要求非空产物或单独的 alignment JSON。Qwen chunk checkpoint 位于其 staging 目录下；中断的运行会验证源音频 SHA-256、producer/splitter/依赖契约、不可变模型修订版、生成参数和已完成的 chunk 哈希，然后跳过已完成的 chunk，而不是从头重新开始录音。一个与语言无关的 12 字符 n-gram guard 会在最终交付前拒绝高度重复的 chunk 或整段会话文本；quality-policy ID 是 checkpoint 身份的一部分，因此旧的未检查部分不能悄悄绕过该 guard。

在使用 Qwen3 路线之前，先对它的 leg 做一次 smoke-test：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/transcribe_local_mlx.py --smoke-test
```

期望输出包含 `Dependency stack: mlx-audio 0.3.1, mlx-lm 0.30.5,
transformers 5.0.0rc3` 和 `Smoke test OK`。关于性能、逐 chunk token 语义、资源边界和恢复，请阅读 `references/local_mlx_guide.md`。

**工作原理（以及原因）：** 使用整个会话范围的 Qwen3-ASR 文本 + mlx-whisper 词级时间戳 + pyannote 说话人片段，并在事后进行对齐。这样可以避免旧的级联方式带来的质量损失；旧方式会把每个已分离的说话人轮次单独转写。不要把它有限的生成分块夸大为可处理长篇内容的保证：一段真实的多小时录音在 20、10 和 5 分钟窗口下都撞到了 token 上限。架构、对齐算法和失败模式：`references/decoupled_speaker_alignment.md`。

**首次运行：pyannote 需要一次性的 HuggingFace token。** 如果脚本以设置提示退出（退出码 3），请停止并使用 **AskUserQuestion**：

```
Speaker diarization needs a one-time setup (gated model, free):
  1. Accept terms at https://hf.co/pyannote/speaker-diarization-3.1
  2. Run `huggingface-cli login` (or set HF_TOKEN)

Options:
A) Set it up now — I'll wait, then rerun with full speaker labels (Recommended)
B) Continue without speakers this time — plain text only
```

- **A** → 在用户确认登录后，重新运行同一命令。token 每次运行都会自动检测；从那时起，完整功能将永久可用。
- **B** → 持久化该选择（在 `config.json` 中设置 `diarization_declined: true`），然后重新运行**同一**命令。脚本会检测到该标志，打印一行包含两个设置步骤的警告，并在该次运行中自动回退为纯文本——现在无需传递 `--no-diarization`（回退现在是自动的，并由脚本而不仅仅是文档强制执行）。在 token 仍然缺失的后续每次运行中，也会发生同样的“警告并继续”。一旦之后出现 token，diarization 会自动恢复（只要 token 存在，该标志就会被忽略）——请提到这一点，让用户知道只需完成设置即可。

**纯文本快速路径**（独白、播客、“就总结一下”）：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/speaker_transcribe.py \
  INPUT_AUDIO OUTPUT_DIR --no-diarization
```

**远程/预先生成的 ASR 文本**（例如来自 Path B，或其他 ASR 服务）：跳过 Qwen3 这条腿，改为对齐那份文本。`--text-file` 将**一个**转录文本与**一个**输入 wav 配对——传入多个输入会被拒绝（一个转录文本不能对齐到多个文件）：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/speaker_transcribe.py \
  INPUT_AUDIO OUTPUT_DIR --text-file TRANSCRIPT.txt
```

**非 Apple Silicon 机器：** whisper 的计时环节仅支持 MLX。没有它，就没有可供说话人对齐的时间格点——请使用 `--no-diarization` 运行，并告知用户说话人模式当前需要 Apple Silicon（带内置 diarization 的云端 ASR，例如 Feishu Minutes，是无本地 GPU 的替代方案）。

**在批量处理许多短文件之前**（宣传短片、剪辑片段——任何可能包含纯音乐音频的内容），先阅读下面的 `## Batch Transcription (many short files)`：一个纯音乐片段就可能让整个批处理停滞 10 分钟以上。

### Path B: 远程 API

远程端点只返回纯文本——说话人是通过将该文本（第 1 条腿）与本地时间信息 + diarization 组件对齐后在本地添加的。因此 Path B = 远程获取文本，然后使用 `--text-file` 运行 Path A 的流水线。

**先做健康检查**（如果本轮会话中已经验证过则跳过）：
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

读取 config 并通过 curl 发送：

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

然后在本地附加说话人信息（Apple Silicon + 需要 pyannote token）：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/speaker_transcribe.py \
  INPUT_AUDIO OUTPUT_DIR --text-file OUTPUT.txt
```

#### 自托管 vLLM：那些会以令人困惑的方式失败的限制

**版本在这里很重要——其中两项在不同版本之间变了。** 下述行为是
基于 vLLM `0.15.2rc1.dev68`（一个开发构建；并没有 `0.15.2`
正式版——PyPI 是从 0.15.1 到 0.16.0）端到端测得的，使用的是
`Qwen/Qwen3-ASR-1.7B`，之后又对照 `v0.26.0` 源码重新核对。先检查你自己的版本——`pip show vllm`——并阅读关于第 1 点和第 3 点的版本说明。

**1. 发送 OGG，不要发送 WAV——也绝不要 MP3。** 在 0.15.x 上，MP3 会被直接拒绝，但那个看起来顺手的修复办法（转成 WAV）反而会把你带进第 2 点的大小上限：

| 格式 | 60 s @ 16 kHz 单声道，16-bit | 是否接受（0.15.x） |
|---|---|---|
| WAV `pcm_s16le` | 1,920 KB | yes |
| FLAC | 1,092 KB | yes |
| **OGG Vorbis** | **245 KB** | **yes** |
| MP3 | — | **no** |

在相同采样率下，OGG 大约只有 WAV 的 1/8：

```bash
ffmpeg -nostdin -v error -i INPUT -ar 16000 -ac 1 -c:a libvorbis OUTPUT.ogg
```

自己比较格式时要固定位深——解码有损源文件时，ffmpeg 可以自由把它扩宽，而 24-bit FLAC 的体积会比 16-bit PCM 更大，这看起来像是“FLAC 不压缩”，但其实只是这两份录音并不相同。加上 `-sample_fmt s16`。

之所以要识别 MP3 的拒绝，是因为**它会以 HTTP 200 加错误正文的形式返回**——只检查 `%{http_code}` 的话会把它当成成功：

```  
HTTP=200
{"error": {"message": "Error opening <_io.BytesIO object>: Format not recognised.", ...}}
```

*版本说明：* 在 0.15.x 中，上传会通过 `librosa`/soundfile 在 `BytesIO` 上读取，
而这在这里会拒绝 MP3，即便主机上的 libsndfile 在磁盘文件上能处理 MP3。`v0.26.0`
在 `soundfile` 抛出 `LibsndfileError` 后添加了 pyav 回退（`multimodal/media/audio.py`），
因此在当前版本上 MP3/M4A 很可能可以解码——但出于上面的体积原因，OGG 仍然是更好的选择。

**2. 请求上限为 25 MB。**

```
{"error":{"message":"Maximum file size exceeded (parameter=audio_filesize_mb, value=28.6)",...}}
```

`VLLM_MAX_AUDIO_CLIP_FILESIZE_MB` 的默认值是 `25`（`vllm/envs.py`，从 0.15.1 到 `v0.26.0` 均未变）。按 OGG 每分钟约 `245 KB` 计算，这个上限大约在 **100 分钟** 左右触发——足够覆盖一次会议，但整天录音或合并后的多段转储会超过它。任务足够长时就提高它：

```bash
VLLM_MAX_AUDIO_CLIP_FILESIZE_MB=800 vllm serve <model> --port <port> ...
```

**3. `v0.26.0` 还新增了第二个、彼此独立的限制：10 分钟音频。** 提高
大小上限并**不会**解除它——它们是分开的门槛，而且这个限制会直接拒绝，
不会截断：

```
Audio exceeds maximum allowed duration of 600s (metadata reports 5998.0s).
Set VLLM_MAX_AUDIO_DECODE_DURATION_S to increase this limit.
```

`VLLM_MAX_AUDIO_DECODE_DURATION_S` 的默认值是 `600`，位于 `envs.py` 中大小上限下一行右侧——
它在 0.15.x 中不存在，所以一个在旧服务器上可用的长讲座文件，在新安装的服务器上会被拒绝。对于 `v0.26.0`+，两者都要设置：

```bash
VLLM_MAX_AUDIO_CLIP_FILESIZE_MB=800 VLLM_MAX_AUDIO_DECODE_DURATION_S=36000 \
  vllm serve <model> --port <port> ...
```

**4. 如果主机无法访问 huggingface.co，即使模型已经缓存在本地，模型加载也会失败。** vLLM 会在启动时对 `config.json` 发起一个 `HEAD` 请求，重试五次，然后退出——错误信息会说“couldn't find them in
the cached files”，尽管它们明明就在那儿：

```bash
HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 vllm serve <model> ...
```

还有一个需要先排除的相同表象、不同原因：**容器化**的服务器有自己的 `HF_HOME`，看不到主机用户的 `~/.cache/huggingface`，所以你能 `ls` 到的模型，对它来说确实不可见。

**5. vLLM 已经会对长音频做分块——比客户端分割器更好。**
`SpeechToTextConfig` 带有 `overlap_chunk_second=1` 和
`min_energy_split_window_size=1600`，也就是说它会在约 **100 ms** 窗口内的最静音点切分，
而不是在固定偏移处切分，所以切口会落在词与词之间。一旦解除上面的限制，100 分钟文件可以一次请求送入。
这就是下面 Step 5 回退方案仅针对**不会**这样处理的服务器的原因。

**没有重启服务器的权限？** 第 #2/#3 条中的限制是在服务器启动时设置的，所以当你无法改动它时，客户端侧切分就是剩下的办法——那就是 Step 5，在这种端点上它是合适的工具，而不是回退方案。

⚠️ **但 `overlap_merge_transcribe.py` 不能直接驱动 0.15.x vLLM 端点**：它会用 `-acodec copy` 把分片切成 `chunk_NN.mp3`，所以当输入本身就是 MP3 时，它会输出 MP3（按 #1 会被拒绝），而且在任何其他输入上都会*直接失败*——它从不检查 ffmpeg 的退出状态，所以坏掉的分片之后才会表现为 JSON 解析错误，而不是“ffmpeg failed”。这些分片也只在一个 `TemporaryDirectory` 里短暂存在，所以根本没有可转换的时机。面对这种端点，请手动拆成 OGG 并逐个发送：

```bash
ffmpeg -nostdin -v error -i INPUT -f segment -segment_time 900 \
  -ar 16000 -ac 1 -c:a libvorbis chunk_%02d.ogg
```

注意，这会丢失 overlap-merge 的拼接逻辑，所以句子可能会在断点处被切开——这正是 #5 里服务端基于能量的分割器要避免的情况。

**如果远程健康检查失败**，按以下顺序排查：

1. 网络：`ping -c 1 HOST` 或 `tailscale status | grep HOST`
2. 服务：`tailscale ssh USER@HOST "curl -s localhost:PORT/v1/models"`
3. 代理：切换 `--noproxy '*'` 重试

**4. “到底有没有东西在监听？”——只看 `ss` 会骗你。** 它只显示你自己用户的进程，所以由其他用户运行的服务器，或者**容器内部**的服务器，对它来说是不可见的，而实际上却在正常提供服务。要和 Docker 一起查：

```bash
tailscale ssh USER@HOST "ss -ltn | grep -E ':(8000|8001|8002)'; \
  docker ps --format '{{.Names}}\t{{.Ports}}\t{{.Status}}'"
```

**5. “GPU 是空的吗？”**——在启动另一个服务器之前，先确认是否真的有进程占用 VRAM。`compute-apps` 列表**为空**就表示没有任何东西在用它，不管之前的记录里怎么说哪个服务“占着” GPU：

```bash
tailscale ssh USER@HOST "nvidia-smi --query-compute-apps=pid,process_name,used_memory --format=csv"
# under WSL nvidia-smi is often off PATH: /usr/lib/wsl/lib/nvidia-smi
```

**6. 要重启它？`pkill -f 'vllm serve'` 会把发起它的命令也杀掉。** `-f` 会对整个命令行做匹配——而你刚输入的命令行里就包含那段完全相同的字符串，所以 pkill 会匹配到你自己的 shell。症状是：旧进程死了，新进程却根本没启动，而且**没有任何报错**。把第一个字母包进字符类里，这样模式就不可能匹配到它自己：

```bash
tailscale ssh USER@HOST "pgrep -f '[v]llm serve'"   # check
tailscale ssh USER@HOST "pkill -f '[v]llm serve'"   # kill
```

同样的陷阱也适用于任何 `pkill -f`，只要你在那一行里也把那个模式原样敲了出来。

## Step 4: 验证输出

转写完成后，检查完整性：

1. 确认输出不是空的
2. 检查字符数是否合理（中文约 400 字/分钟，英文约 200 词/分钟）
3. 对于本地 MLX，确认 checkpoint manifest 显示 `status: complete`；当任一分片达到 token 上限时，脚本会拒绝写出最终的 `.txt`
4. 对于旧版/远程输出，检查**结尾**——中途截断的尾巴可能意味着被截断
5. 向用户展示开头和结尾各约 200 个字符作为预览
6. **说话人路径**：检查对齐报告——`anchored_ratio` 应该 ≥ 0.5（脚本在更低时会警告），说话人数应与录音情况相符（一次两人访谈却显示 5 个说话人，或者独白被拆成 2 个以上，说明说话人分离过度切分——见 `references/speaker_diarization.md`，了解何时不应相信这些标签）

当本次运行是现有高风险转录的独立证据轨迹时，完整性意味着整个基线录音都已到达完整的检查点/最终回执。选定的片段可以确定选定的发言内容，但不能支持整个转录或“更高质量最终版本”的声明。将完整输出交给 `transcript-fixer`；让其人工审核环节处理尚未解决的专有名称分歧。

如果内容被截断或错误，请使用 **AskUserQuestion**：
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

## 第 5 步：回退方案——重叠合并（仅限远程 API）

**请先确认你的服务器是否会在内部进行分块，然后再考虑使用此方案。** vLLM 会执行此操作（路径 B 限制 #5），并且其基于能量的切分效果优于此脚本的固定偏移切分——因此，在你控制的 vLLM 端点上，过长文件应通过提高上限来解决，而不是在客户端进行切分。

当端点**无法接收整个文件**时，在客户端进行分块：端点直接拒绝过长音频（固定上下文窗口、单次请求的硬性时长限制），在相同输入长度下每次都会 OOM，或者端点会在内部进行分块，但你无权提高其上限。

**超时是另一种故障，通常有更便宜的解决办法**——请求已经被接受，并且仍在运行。请先提高配置中的 `max_timeout`（100 分钟的文件以约实时速度的 60 倍处理时仍需要几分钟，而默认值可能比这更严格）；只有当提高上限后仍然超时，才考虑分块，这意味着服务器确实无法在单次处理中过快完成任务。

满足上述情况之一时，回退到分块转录：

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/overlap_merge_transcribe.py \
  --config "${CLAUDE_PLUGIN_DATA}/config.json" \
  INPUT_AUDIO OUTPUT.txt
```

该脚本会将音频切分为 18 分钟的片段，并设置 2 分钟的重叠区，然后使用去除标点后的模糊匹配进行合并。算法详情请参阅 `references/overlap_merge_strategy.md`。

对于本地 MLX 模式，无需使用重叠合并——随附的脚本使用固定版本的 Qwen 低能量切分器，以原子方式提交每个片段，并且默认按**每个片段**设置 `max_tokens=8192`。

## 第 6 步：建议修正转录文本

ASR 输出始终包含识别错误——同音词、乱码技术术语、断裂的句子。转录成功后，**主动建议**针对输出运行 `transcript-fixer` skill：

```
Transcription complete: [N] chars saved to [output_path].

ASR output typically contains recognition errors (homophones, garbled terms, broken sentences).
Would you like me to run /daymade-audio:transcript-fixer to clean up the text?

Options:
A) Yes — run daymade-audio:transcript-fixer on the output now (Recommended)
B) No — the raw transcription is good enough for my needs
C) Later — I'll run it myself when ready
```

如果用户选择 A，则使用输出文件路径调用 `transcript-fixer` 技能。两个技能构成一个自然的流水线：**transcribe → correct → review**。

如果用户已经在同一轮中请求了校正、多轨合并，或者更高质量的转录，那么该请求已经选择了 A。继续进入 `transcript-fixer`，不要再次要求用户批准同样的工作。

## 重新配置

```bash
rm "${CLAUDE_PLUGIN_DATA}/config.json"
```

然后重新运行第 0 步。

## 批量转录（多个短文件）

将多个文件传给一次 `transcribe_local_mlx.py` 调用是高效的（模型只加载一次）——**但前提是每个文件都包含实际语音。** 如果批次中可能包含仅音乐 / 仅 BGM 片段（短宣传视频、带字幕而非旁白的蒙太奇片段），不要把它们一次性批处理进同一个进程：

- 在仅音乐/节奏音频上，模型可能陷入**重复循环幻觉**（例如无休止地输出 `"One, two, three, one, two, three..."`）。8192 token 的每块上限限制了资源增长，而 12 字符的 n-gram 质量门会在循环即使未达到该上限时也将其拒绝；但一个坏文件仍然可能耗尽整个分块超时时间并拖慢批处理。
- **对批量任务采用每文件一个进程，并为每个文件设置超时**（例如在每次调用外层使用 `timeout 240` / `perl -e 'alarm 240; exec @ARGV'`，超时则跳过，对失败项进行第二轮处理）。这样一个卡住的文件只会消耗 4 分钟，而不是整个批次。
- 对于卡住的文件，使用 `--max-tokens 3000` 重试：短片中的真实语音很容易装入；而循环文件会得到被截断的输出，便于分类。
- **检测“无语音”，不要交付垃圾内容**：如果转录结果的唯一词比例极低（例如在 40+ 字符的输出上 `len(set(words))/len(words) < 0.06`），那么该片段几乎肯定没有旁白——应将其标记为无语音，而不是交付循环文本。（对屏幕字幕进行下游 OCR 才是处理仅字幕视频的实际修复方式。）

## 词级时间戳（字幕、音画对齐）

mlx-whisper 的词时间戳是短/中 Qwen 说话人流水线中的**时间轴环节**（第 2 环节 — `scripts/word_timestamps_whisper.py` 会自动运行它）。本节用于**单独使用**词时间戳：字幕生成、将旁白与镜头边界对齐、逐片段字幕标注。

Qwen3-ASR 是一种 LLM-decoder ASR：它在本地和远程路径上都会输出不带对齐信息的纯文本。当任务需要知道每个词**什么时候**被说出时，请使用带 `word_timestamps=True` 的 `mlx-whisper`。Whisper 的交叉注意力词对齐是这类任务事实上的本地解决方案。

关键事实（完整流程见 `references/whisper_word_timestamps.md`）：

- 模型：`mlx-community/whisper-large-v3-turbo`（约 1.6GB）。它的中文 WER 在纯转录上高于 Qwen3-ASR，但在对齐任务中 Qwen3-ASR 根本不是选项；请通过 `initial_prompt` 预置领域术语。
- **分段粒度陷阱**：在短视频（15–40 秒）上，whisper 经常会把整段视频作为一个 segment 返回——务必从词列表出发，并按中点将词分配到时间窗口。
- 可与 ffmpeg 场景检测（`select='gt(scene,0.3)'`）配合使用以处理视觉侧；避免在非 ASCII 路径上使用 PySceneDetect。

## 说话人分离与识别（谁说了什么）

说话人标签是步骤 3 的默认输出。两条本地路径都将 ASR 与 pyannote 解耦，并按时间融合；两者都不会单独对说话轮次切片进行转写。本节介绍相关组成部分。

- **短/中等长度流程** — `scripts/speaker_transcribe.py` 在一个命令中运行全部三条链路 + 对齐，并写出带说话人标签的转录 + CSV。架构、对齐算法、可信信号（`anchored_ratio`）和失败模式：`references/decoupled_speaker_alignment.md`。生产中的坑位（过度分段、麦克风域效应、何时不应信任标签）：`references/speaker_diarization.md`。
- **仅做分离** — `scripts/diarize_speakers.py` 只输出 `speaker × time` 段（不做转写）。
- **旧式级联** — `scripts/speaker_transcribe_cascade.py` 是旧的先切后转写变体（先 diarize → 按轮次切音频 → 对每个切片做 ASR）。它会在每次切分时破坏 ASR 上下文并降低文本质量；仅保留给极其嘈杂 / 重叠严重的音频，此时对切片内一个占主导的近场说话人的隔离效果优于会话级 ASR。其他情况都使用解耦的默认流程。
- **声纹识别** — diarization 标签是匿名的（`SPEAKER_00`…）且按文件独立。要将它们映射到真实姓名、跨文件统一某个说话人，或者合并 diarization 的过度分段，请使用 CAM++ 声纹，入口是 `scripts/voiceprint_id.py`。说明文档 **以及关键的声学域注意事项** —— 用一种麦克风类型构建的声纹，在另一种麦克风上与同一人的匹配效果要差得多：
  `references/voiceprint_speaker_id.md`。

**一次性 pyannote 设置**（受限模型）：先在 `hf.co/pyannote/speaker-diarization-3.1` 接受条款，然后运行一次 `huggingface-cli login`（或设置 `HF_TOKEN`）。之后每次运行都会自动检测。

## 转录审阅与检查（HTML）

完成 diarization 后，你会得到每个文件一个 CSV（`file,start,end,duration,speaker,text`）。随附的审阅 HTML 生成器会把这些 CSV 转成一个以阅读为先的审阅页面，包含音频播放、每轮标记/备注、说话人别名以及导出功能。

从 speaker-transcribe 的输出目录生成它：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/generate_audit_html.py \
  OUTPUT_DIR \
  --output OUTPUT_DIR/audit/index.html \
  --audio-dir /path/to/original/audio
```

默认值假设 `PROJECT_DIR` 下是扁平布局：`PROJECT_DIR/*.csv` 转录、`PROJECT_DIR/*.diarization.json`，以及放在输出旁边的原始音频文件。`speaker_transcribe.py` 本身会把 CSV、TXT 和 diarization 文件扁平写到它的 `OUTPUT_DIR` 下。如果你的项目使用不同结构，可以覆盖这些路径中的任意一个：

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

**关键 CLI 选项：**

| 选项 | 含义 |
|--------|---------|
| `project_dir` | 基础项目目录（必需） |
| `--output` | 写入 `index.html` 的位置 |
| `--csv-dir` | 包含 `*.csv` 转录文件的目录 |
| `--txt-dir` | 包含 `*.txt` 纯文本转录文件的目录（可选） |
| `--diarization-dir` | 包含 `*.diarization.json` 文件的目录 |
| `--audio-dir` | 包含播放音频文件的目录 |
| `--original-dir` | 包含原始源媒体的目录（可选） |
| `--manifest` | 将文件 ID 映射到元数据的 JSON 清单（可选） |
| `--title` / `--subtitle` | 页面标题和副标题 |
| `--storage-key` | 用于状态持久化的 `localStorage` 命名空间 |
| `--known-speaker` | 可重复；`"Name"` 会自动分配颜色，`"Name=#hex"` 会显式设置颜色 |
| `--material-final` / `--material-rough` | 用于筛选的可重复材料分类标签 |

输出是一个单一的、自包含的 HTML 文件，没有外部依赖。在浏览器中打开它来审查、标记和注释回合；导出按钮会生成一份包含所有已标记行及其原因和备注的报告。

## 故障排查

### 本地 MLX 在加载模型时失败

如果模型加载失败，并出现如下错误：

```text
AttributeError: 'str' object has no attribute '__module__'
```

那么代理很可能在使用未固定版本或过时的本地 MLX 脚本。已知可用的栈是：

```text
mlx-audio 0.3.1
mlx-lm 0.30.5
transformers 5.0.0rc3
```

运行随附的 `--smoke-test` 命令，并确认依赖栈那一行匹配。在 smoke test 通过之前，不要开始长时间转录。

### 自托管远程端点拒绝音频

下面这些症状都指向其真正原因的反面，因此值得按症状来识别。完整细节和修复方法：Path B 的“Self-hosted vLLM: the limits that fail in confusing ways”一节。

| 症状 | 实际原因 |
|---|---|
| `Maximum file size exceeded (parameter=audio_filesize_mb, ...)` | 25 MB 上限，按 **字节而不是分钟** 计算 —— 转成 WAV 通常就是超限的原因；发送 OGG（体积约小 8 倍） |
| `HTTP 200` 但响应体是 `{"error": ... "Format not recognised."}` | 向 0.15.x 服务器发送了 MP3 —— 仅检查状态码会把它当作成功 |
| `Audio exceeds maximum allowed duration of 600s` | 在 `v0.26.0` 中新增的一个 **第二个、独立的** 上限；提高大小上限并不会解除它 → `VLLM_MAX_AUDIO_DECODE_DURATION_S` |
| 服务器无法启动：“couldn't find them in the cached files”，而模型 *确实* 已缓存 | 启动时尝试访问 huggingface.co → `HF_HUB_OFFLINE=1`；如果容器化运行，`HF_HOME` 也可能根本看不到宿主机的缓存 |
| 长文件失败，而且你正准备在客户端分块处理 | vLLM 已经会在低能量点切分 —— 除非你无法重启服务器，否则直接提高这些上限（Step 5 解释了何时分块 *才* 是正确做法） |

### `${CLAUDE_SKILL_DIR}` 未被替换

此 skill 中的脚本路径使用 `${CLAUDE_SKILL_DIR}` —— 也就是该 skill 自身的目录，Claude Code 在加载 skill 时会替换它。如果某个命令传到你这里时仍保留字面量 `${CLAUDE_SKILL_DIR}`（有些运行时不会替换），请按以下顺序解析 skill 目录：

1. skill-load 信封：`Base directory for this skill: <path>` → `<path>` 是 skill 目录。
2. 没有信封 → 查找候选项，并选择本会话的 available-skills 列表所指向的候选项（已安装的副本可能落后于源代码检出）：
   `find ~/.claude ~/.claude-profiles ~/.codex ~/workspace -maxdepth 7 -type d -name asr-transcribe-to-text 2>/dev/null | head -5`

在本文档中，将 `${CLAUDE_SKILL_DIR}` 的所有出现替换为解析得到的绝对路径。

## 捆绑资源

**脚本：**
- `resolve_media_input.py` — 将本地路径、直接媒体 URL 以及播客/网页解析为经过验证的本地媒体文件
- `prepare_asr_input.py` — 合并多段录音并进行 ASR 规范化处理（16 kHz 单声道）；可选使用保留音高的加速，以适应按量计费的上传；自行验证时长计算和拼接边界
- `transcribe_local_mlx.py` — 本地 MLX 转录（macOS ARM64，PEP 723 依赖）；限制低能量片段，支持原子检查点/恢复，并绑定所有者存活状态
- `transcribe_long_whispercpp.py` — **默认的长音频 ASR**：显式源时间块 + 重叠归属 + whisper.cpp/Silero VAD + 原子检查点/恢复
- `fuse_whispercpp_diarization.py` — 将规范化的 whisper.cpp 时间片段与 pyannote 语音/说话人结果进行后期融合；移除没有依据的静音幻觉，并输出 TXT/CSV/receipt
- `speaker_transcribe.py` — 短/中等音频的解耦流水线（全会话 Qwen3-ASR + whisper 计时 + pyannote）；`--no-diarization` 纯文本快速路径；`--text-file` 用于远程或预生成的 ASR 文本
- `align_speakers.py` — 解耦对齐核心（标准库）：将完整转录文本映射到 whisper 词级格和 pyannote 片段；可单独用于调试
- `word_timestamps_whisper.py` — mlx-whisper 词级时间戳 → JSON 计时格（Apple Silicon）
- `speaker_transcribe_cascade.py` — **旧版**先切分后转录的变体（仅适用于噪声极大或重叠严重的音频）
- `diarize_speakers.py` — 单独执行说话人分离（pyannote 3.1 @ MPS）→ 每片段 JSON
- `voiceprint_id.py` — CAM++ 声纹注册/匹配：将匿名的 SPEAKER_xx 映射为真实姓名
- `overlap_merge_transcribe.py` — 使用重叠合并的分块转录（远程 API 回退方案）
- `generate_audit_html.py` — 根据 speaker-transcribe CSV 输出构建自包含的 HTML 审计/复核页面

**参考资料：**
- `decoupled_speaker_alignment.md` — 默认架构：为何采用解耦设计、对齐算法、可信度信号、失败模式
- `speaker_diarization.md` — 生产环境中的陷阱：过度分段、麦克风域效应、何时不应信任标签；旧版级联方案说明
- `voiceprint_speaker_id.md` — CAM++ 说话人识别：注册/匹配、阈值+边界门控、声学域注意事项、引导启动
- `local_mlx_guide.md` — 性能基准、每片段的令牌/资源契约、检查点恢复、模型兼容性
- `whisper_word_timestamps.md` — mlx-whisper 词级计时：短/中等 Qwen 流水线中的计时环节；独立的字幕/音视频对齐方案
- `overlap_merge_strategy.md` — 朴素分块为何会失败、模糊合并算法