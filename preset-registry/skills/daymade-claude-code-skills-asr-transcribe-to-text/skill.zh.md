---
name: asr-transcribe-to-text
description: >-
  Transcribe audio/video to speaker-labeled text — who-said-what by default, plain-text opt-out; MLX-local on Apple Silicon or remote; local files, media URLs. Use for transcribing recordings/podcasts/lectures/meetings, ASR, speech-to-text, 转录, 语音转文字, 录音转文字, speaker diarization/说话人分离/识别/谁在说话, timestamps 字幕/时间戳/音画对齐, CAM++ voiceprint ID. This skill ALSO owns audio PREPROCESSING for ASR as a first-class trigger, even without transcription: convert any audio/video into an ASR-ready file (转换成适合 ASR 的格式, 转格式, convert/prepare audio for ASR, 音频预处理), downsample to 16kHz mono 16-bit (降采样, 重采样, 单声道, 归一化), merge multi-segment recorder dumps (多段合并/拼接, DJI TX01/TX02), transcode to small M4A + pitch-preserved speedup to cut metered-ASR billed minutes (转 M4A, 压缩上传, 加速, 1.3x, 飞书妙记/Feishu Minutes). Trigger even when it looks like a trivial one-line ffmpeg — the skill owns sample-rate/bit-depth/channel, merge-order, speed-vs-WER, format choices + a blessed prepare_asr_input.py.
argument-hint: "[audio-or-video-file-path-or-url ...]"
---
# ASR 转录为文本

将音频/视频转录为带有**说话人标签**的文本。本地执行有两条明确路径。较长或无人值守的录音使用带检查点的 whisper.cpp + Silero VAD 分块处理，然后再通过 pyannote 延迟融合说话人信息。较短/中等时长的录音可以使用 Qwen3-ASR + mlx-whisper 对齐路径。两条路径都不会在说话人分离转折处截断 ASR 输入；说话人归属是在保持连续上下文的 ASR 之后完成的。

## ASR 前的路径选择：转录结果才是任务成果，而不是运行过程

开始转录前，请检查所属项目的转录目录、外部来源索引以及声明的既有工作载体，使用来源 ID、日期、标题和实体术语查找现有的规范转录文本。经过验证、由人工审阅且为当前版本的转录文本会结束此任务，除非用户明确要求进行新的独立比较。原始音频仍然存在，并不是重新生成已有文本的理由。

当不存在规范转录文本时：

1. 对于允许使用云端处理的普通会议/DJI 录音，通常应使用 Feishu Minutes 作为主要路径（先预处理为较小的 M4A）。
2. 当用户要求离线/隐私处理、Feishu 不可用或处理失败，或者任务明确需要独立的质量比较时，使用本地 ASR。
3. 对于非会议媒体，或用户明确要求使用本地/远程 ASR 时，根据下面的音频位置规则选择执行位置。

不要仅仅为了让两条路径的流程看起来完整而运行本地 ASR。

| 模式 | 适用情况 | 速度 | 成本 |
|------|------|-------|------|
| **Local MLX** | macOS Apple Silicon | 实时速度的 15-27 倍 | 免费 |
| **Remote API** | 任意平台，或本地不可用时 | 取决于 GPU | API/自托管 |

**通常，二者之间的选择并不取决于速度——而取决于音频已经位于哪里。**远程 GPU 的速度可能快几倍（实测使用 vLLM 的 4090 约为实时速度的 61 倍，而本地 MLX 约为 15 倍），但与移动文件相比，这点差距微不足道：转录输出是文本，而文本大小约为其来源音频的 1/10,000（18.5 小时的语音约为 330 K 个字符、约 1 MB，而 WAV 约为 2.6 GB）。因此：

> **音频在哪里，就在哪里进行转录，只传输转录文本。**

通过缓慢的网络连接传输几百 MB 以使用更快的 GPU，实际耗费的总时间通常比完整转录还要长——曾实测网速为 63 KB/s，传输 500 MB 需要两个多小时，而节省的计算时间只有几分钟。如果录音已经在远程机器上（在那里录制、在那里下载，或存储在挂载于那里的共享目录中），就在远程机器上运行 ASR，然后带回 `.txt`。

配置会持久化保存在 `${CLAUDE_PLUGIN_DATA}/config.json` 中。

> **说话人标签是默认设置。**每次运行都会生成 `[start-end] SPEAKER_xx: text`
> + CSV。纯文本输出是可选的禁用模式（`--no-diarization`），适用于独白、
> 播客，或只想要摘要的情况——参见第 3 步。
>
> **说话人分离的一次性设置：**pyannote 是 HuggingFace 上受限访问的模型——它
> 只需要设置一次令牌（见下方的 `## Speaker Diarization & Identification`）。首次运行
> 时如果没有令牌会失败并显示设置步骤；完成设置后，完整功能将永久可用并自动检测。

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

对于 **其他平台**（推荐：远程模式）：
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

- **网页或播客页面 URL**：先检查页面中是否已有文字稿。仅当官方/平台文字稿可由用户账户直接访问时，才使用该文字稿。如果文字稿端点需要登录令牌且没有可用令牌，需明确说明这一点，并回退到使用音频 URL 进行 ASR。
- **本地文件、直接媒体 URL 或页面 URL 回退方案**：运行捆绑的解析器。它会从常见的页面元数据（`og:audio`、媒体标签、JSON-LD、RSS 风格的 enclosure 链接）中提取媒体，使用原子临时文件替换机制下载 URL，在远程 `Content-Length` 存在时进行验证，计算 SHA-256，并使用 `ffprobe` 验证结果。

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/resolve_media_input.py \
  INPUT_FILE_OR_URL [INPUT_FILE_OR_URL2 ...] \
  --output-dir OUTPUT_DIR \
  --manifest OUTPUT_DIR/media_manifest.json
```

对于可疑或高价值的下载，添加 `--decode-check`，使 `ffmpeg` 在转录前对整个文件进行解码：

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

在后续步骤中，将打印出的本地路径作为 `INPUT_AUDIO` 使用。如果运行环境显示的是字面量 `${CLAUDE_SKILL_DIR}`，而不是替换后的路径，请按照本文档底部 Troubleshooting 条目中的说明解析 skill 目录。

对于第三方公开播客或受版权保护的媒体，将转录内容保存为本地文件，供用户个人分析。不要将完整的长篇转录内容粘贴到聊天中；应改为提供路径、预览、摘要或简短摘录。

## 步骤 2：提取音频（如果输入为视频）

对于视频文件（mp4、mov、mkv、avi、webm），提取为 16kHz 单声道 WAV：

```bash
ffmpeg -i INPUT_VIDEO -vn -acodec pcm_s16le -ar 16000 -ac 1 OUTPUT.wav -y
```

音频文件（wav、mp3、m4a、flac、ogg）可以直接使用。获取时长：
```bash
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 INPUT_FILE
```

**清理**：转录成功后，删除提取出的 WAV 文件以节省磁盘空间。

## 预处理：合并片段并缩短计费上传时长（可选）

在以下任一情况适用时，于转录前执行此步骤：

- **录音是由多个片段组成的转储** —— 领夹麦克风和现场录音设备会将会话拆分为固定时长的文件（例如 `TX02_MIC024_....wav`、`TX02_MIC025_....wav`；
  `TX01/TX02` = DJI MIC MINI 2S 内部录音 —— 设备清单以及 recorder→Feishu-Minutes 的路径：meeting-ingest skill 的 `meeting-ingest/references/architecture.md` §①-L0）。
  将这些文件合并一次，以保留会话顺序；显式的长音频运行器（步骤 3 路径 L）随后负责稳定的源时间块。分别转录设备片段会丢失这些音频块内部跨片段的上下文。
- **音频将发送到按量计费的 ASR**（Feishu Minutes，或任何按分钟计算配额的服务）——保持音高不变的加速会直接缩短计费时长，而现代 ASR 不受影响：
  Feishu Minutes 上经用户验证，1.3 倍速不会造成可感知的识别差异（2026-07-16）；公开的 Whisper 基准显示，在 2.0 倍速之前 WER 不会明显下降
  （≤1.5 倍速 = 安全区间；1.5 倍速时 WER 增加约 3%；>2 倍速则不可用）。

使用随附的脚本——它会合并文件、将音频标准化为 16 kHz 单声道、按需加速，并验证自身输出，而不是盲目信任 ffmpeg 的退出代码：

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

- 当每个文件的文件名中都包含 `YYYYMMDD_HHMMSS` 时间戳时，按该时间戳排序（录音机导出文件都满足这一条件）；否则保留给定顺序并附带说明 — 转写前目测检查打印出的合并顺序。
- 自验证：输出时长必须等于 Σsegments ÷ speed（允许误差 ±1.5 s，否则直接 FAIL）；每个拼接点都会进行 10 s 音量抽查（边界处无声 = 顺序错误或缺少片段）；同时打印整体响度，以便与源文件比较。
- 加速必须使用保留音高的 `atempo` 风格拉伸 — 绝不能使用改变采样率的方式，因为这会改变音高，并同时破坏 ASR 准确率和说话人分离的声纹。
- **根据目标位置选择输出格式** — 编解码器由文件扩展名决定：

  | 目标位置 | 格式 | 原因 |
  |---|---|---|
  | 本地 MLX pipeline (Path A) | `.wav` 或 `.m4a` | 两者都可以直接输入 pipeline（m4a 已于 2026-07-18 验证：一段 3 分钟的切片能够被准确转写）。M4A 体积约小 5 倍 — 在一次 2h49m 的合并中，324 MB WAV → 63 MB M4A，时长与前者完全一致 |
  | 按量计费的上传（Feishu Minutes，按分钟配额） | `.m4a` + `--speed 1.3` | 在 ASR 中，AAC 48k 的语音质量足以保持透明度；在相同语音质量下，体积比 mp3 小约 30%；加速可使计费时长减少约 23% |
  | 自托管 vLLM endpoint (Path B) | `.ogg` | 在 MP3 被拒绝的情况下仍可接受，且体积约为 WAV 的 1/8 — 正是这一点让长录音能够保持在服务器 25 MB 的请求上限以内。参见 Path B 的限制部分 |
  | 无损归档 | `.flac` | 体积约为 WAV 的 50%，逐位无损 |
  | 仅当目标拒绝上述格式时 | `.mp3` | 兼容性备选格式 |
- 保留原始文件，直到转写文本通过 Step 4 验证。

## 选项：上传到 Feishu Minutes 进行转写

预处理完成后，当用户希望使用 **Feishu Minutes**，或普通会议 / DJI 录音没有规范转写文本且允许进行云端处理时，使用此路径。这是常规的会议音频路径，并非只有本地运行失败后才使用的备用路径。

**触发短语**：传到妙记 / 上传到飞书妙记 / 让妙记转写 / create a minute from this audio / upload to Feishu minutes.

**限制**：
- **不使用代理**：所有 `lark-cli` 调用都必须使用 `LARK_CLI_NO_PROXY=1`。
- **单一 profile**：仅使用当前激活的 Feishu profile。不要遍历 tenant profiles，也不要调用 tenant routing。
- **后续不进行本地转写**：minute 创建完成后，此 skill 的工作到此结束。用户在 Feishu 中打开 `minute_url`，等待云端 ASR。只有在云端转写文本已经存在并被拉回后，才适用本地转写修正（`transcript-fixer`）或说话人回填（`review-feishu-minutes`），创建时不执行这些操作。

**分步操作**：

1. **尽可能使用上文已经预处理好的音频**。Feishu 接受 MP4/MOV 封装中的 `.m4a`、`.mp3`、`.wav`、`.aac`；预处理器的“Metered upload”行已经针对这一要求进行了处理。文件大小保持在 6 GB 以下，时长保持在 6 小时以下 — 这些是 Feishu 上传的硬性限制。

2. **以用户身份上传到云盘**：
   ```bash
   LARK_CLI_NO_PROXY=1 lark-cli drive +upload \
     --file '<preprocessed-media-path>' \
     --name '<basename>' \
     --as user \
     --format json
   ```
   从结果中记录 `file_token`。如果命令因路径验证或 multipart 失败而报错，不要盲目重试——切换格式或大小策略后再尝试一次，然后报告确切的失败信息。

3. **根据该云盘文件创建会议纪要**：
   ```bash
   LARK_CLI_NO_PROXY=1 lark-cli minutes +upload \
     --file-token '<file_token>' \
     --as user \
     --format json
   ```
   从结果中记录 `minute_token` 和 `minute_url`。

4. **将 `minute_url` 返回给用户**并停止。不要运行此技能的本地转录步骤，也不要为这个新创建的会议纪要运行 `sync-feishu-minutes` 的导入/委派流程——这些流程用于已经存在于 Feishu 上的会议纪要。当用户之后要求将此会议纪要拉回时，交由 **`sync-feishu-minutes`** 处理；之后如需清理发言人信息，则交由 **`review-feishu-minutes`** 处理。

**预期输出**：
- 成功：返回一个用户可以打开以查看/转录的 `minute_url`。
- 失败：返回 `drive +upload` 或 `minutes +upload` 的确切 API 错误，以及一条建议的下一步操作。

**错误技能恢复**：如果此请求是在 `sync-feishu-minutes` 中处理时到达的，那么请求形态是“本地音频 -> Feishu 会议纪要”，而不是“同步现有会议纪要”——停止当前流程，切换到 `asr-transcribe-to-text`，并按照本节执行。

## 步骤 3：转录（默认添加发言人标签）

### 路径 L：本地长录音 — whisper.cpp + Silero VAD（>30 分钟时的默认路径）

对于时长超过 30 分钟的录音、无人值守的批处理任务，或任何可能包含长时间静音/会后环境音的来源，使用此路径。这是 Apple Silicon 的长音频处理路径：按源时间划分的分块会创建检查点，每个分块运行 whisper.cpp 的 Silero VAD，在分块交界处对 2 秒重叠部分去重，之后再延迟融合 pyannote 的发言人标签。

四个运行时资源是明确的操作员输入。不要在批处理过程中静默地发现或下载它们。`whisper.cpp` 提供模型和 VAD 的下载脚本；启动前请验证二进制文件、模型文件和 VAD 文件。

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

如果业务会议结束后实体录音设备仍在运行，请将有证据支持的源时间戳传递给两个相关步骤（`--end-at
SECONDS`）。保留原始音频和无界 ASR 证据，但不要将会后车辆噪声或静音强行纳入会议转录稿。

完成意味着最终 TXT/CSV/fusion 回执已存在，并且已对开头、中段、结尾以及每个外部区块接缝进行抽样检查。仅有 `N/N blocks complete` 并不代表质量达标。重新运行时必须将每个已完成区块报告为已缓存。

官方架构依据：whisper.cpp VAD 在推理前提取语音；OpenAI Whisper 会重置先前文本上下文，以避免重复循环；NeMo 的长音频指南使用带重叠的缓冲区块。项目特定的实测证据和参数依据位于
`references/speaker_diarization.md`。

### 路径 A：本地 MLX（macOS Apple Silicon）——短时/中时长替代方案

运行解耦的说话人流水线——它会在内部处理依赖固定版本、按区块限制生成、可恢复检查点、模型加载以及进程树清理。

输入扩展名不被视为解码器契约。Qwen worker 首先使用固定版本的 MLX 解码器；如果该解码器报告已识别的输入/容器解码失败（例如 miniaudio 拒绝 Ogg/Opus），则使用 `ffmpeg` 为固定版本的默认模型创建临时的 16 kHz 单声道 PCM WAV，并重试（自定义本地模型使用其声明的采样率）。GPU、内存及无关的运行时故障会原样传播，绝不会触发规范化。检查点、输出名称和溯源信息仍绑定到原始源字节；临时 WAV 永远不会成为完成产物。

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/speaker_transcribe.py \
  INPUT_AUDIO [INPUT_AUDIO2 ...] OUTPUT_DIR
```

预期输出（每个文件）：

```text
Device: mps
+ uv run .../transcribe_local_mlx.py ...        (第 1 条流水线：会议文本)
Chunk 1/6 starting at 0.0s (max_tokens=8192)
Chunk 1/6 committed: 6310 chars, 3812 tokens
+ uv run .../word_timestamps_whisper.py ...     (第 2 条流水线：时间定位网格)
... diarization ...                             (第 3 条流水线：pyannote 区段)
STEM: 42 turns, speakers=['SPEAKER_00', 'SPEAKER_01'], anchored_ratio=0.93
Wrote STEM.txt, STEM.csv, STEM.alignment.json, STEM.receipt.json
```

每个输入的输出：`<stem>.txt`（`[MM:SS - MM:SS] SPEAKER_xx` + 文本）、
`<stem>.csv`（`file,start,end,duration,speaker,text`——供审阅 UI 和
声纹 ID 使用）、`<stem>.diarization.json`、`<stem>.alignment.json`（溯源信息
+ `anchored_ratio` 信任信号；< 0.5 时会打印醒目的警告——在信任这些标签前，
请根据音频核实它们），以及 `<stem>.receipt.json`（将源字节、全部四个最终产物的哈希值、
生成脚本、固定版本的模型/依赖和语义参数绑定在一起的原子完成记录）。中间流水线会缓存在
`OUTPUT_DIR/_align/` 中，因此重新运行成本较低（`--force` 会重新执行最终流水线）。每个中间
缓存旁车文件都会绑定源音频字节、生成脚本字节、语义参数和产物字节；仅凭文件存在绝不会被视为缓存命中。下游完成检查要求最终回执存在，而不能仅凭非空产物或 alignment JSON。Qwen 区块检查点位于其暂存目录下；中断的运行会验证
源音频 SHA-256、生成器/拆分器/依赖契约、不可变模型
版本、生成参数和已完成区块的哈希值，然后跳过已完成区块，而不是从头开始处理录音。一个与语言无关的 12 字符 n-gram
防护机制会在最终交付前拒绝高度重复的区块文本或整场会议文本；
质量策略 ID 是检查点身份的一部分，因此较旧且未经检查的部分
无法静默绕过该防护机制。

在使用 Qwen3 路径之前，先对其执行一次冒烟测试：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/transcribe_local_mlx.py --smoke-test
```

预期输出包括 `Dependency stack: mlx-audio 0.3.1, mlx-lm 0.30.5,
transformers 5.0.0rc3` 和 `Smoke test OK`。有关性能、分块令牌语义、资源限制和
恢复机制，请阅读 `references/local_mlx_guide.md`。

**工作原理（以及原因）：** 使用贯穿整个会话的 Qwen3-ASR 文本、mlx-whisper 的词级
时间戳，以及 pyannote 的说话人片段，并在事后进行对齐。它避免了旧式级联方案对每个
说话人分段分别进行转写所造成的质量损失。不要将其有界生成分块提升为长音频保证：
真实的多小时录音在 20、10 和 5 分钟窗口下都曾达到令牌上限。有关架构、对齐算法和
故障模式，请参阅 `references/decoupled_speaker_alignment.md`。

**首次运行：pyannote 需要一次性 HuggingFace 令牌。** 如果脚本因输出设置提示而退出
（退出代码为 3），请停止并使用 **AskUserQuestion**：

```
Speaker diarization needs a one-time setup (gated model, free):
  1. Accept terms at https://hf.co/pyannote/speaker-diarization-3.1
  2. Run `huggingface-cli login` (or set HF_TOKEN)

Options:
A) Set it up now — I'll wait, then rerun with full speaker labels (Recommended)
B) Continue without speakers this time — plain text only
```

- **A** → 用户确认登录后，重新运行相同的命令。每次运行都会自动检测令牌；从此之后，
  完整功能将永久可用。
- **B** → 持久化该选择（在 config.json 中设置 `diarization_declined: true`），然后重新
  运行相同的命令。脚本会检测该标志，打印包含两项设置步骤的单行警告，并在本次运行中
  自动回退到纯文本模式——无需传递 `--no-diarization`（现在回退是自动进行的，由脚本
  强制执行，而不仅仅是文档中的说明）。只要令牌仍然缺失，之后每次运行都会以相同方式
  发出警告并继续运行。当之后出现令牌时，分离说话人功能会自动恢复（令牌存在后将忽略
  该标志）——请告知用户，只需完成设置即可。

**纯文本快速路径**（独白、播客、“只需总结内容”）：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/speaker_transcribe.py \
  INPUT_AUDIO OUTPUT_DIR --no-diarization
```

**远程/预生成的 ASR 文本**（例如来自路径 B 或其他 ASR 服务）：跳过 Qwen3 阶段，改为
对该文本进行对齐。`--text-file` 将一份转录文本与一个输入 wav 配对——传入多个输入
会被拒绝（同一份转录文本无法与多个文件对齐）：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/speaker_transcribe.py \
  INPUT_AUDIO OUTPUT_DIR --text-file TRANSCRIPT.txt
```

**非 Apple Silicon 设备：** whisper 计时阶段仅支持 MLX。没有该阶段，就没有可用于将
说话人对齐到其上的时间网格——请使用 `--no-diarization` 运行，并告知用户，说话人
模式目前需要 Apple Silicon（带有内置说话人分离功能的云端 ASR，例如飞书妙记，是无需
本地 GPU 的替代方案）。

**在批处理许多短文件之前**（宣传片段、蒙太奇剪辑——任何可能包含纯音乐音频的内容），请阅读下面的 `## Batch Transcription (many short files)`：一个纯音乐片段就可能让整个批处理停滞 10 分钟以上。

### 路径 B：远程 API

远程端点只返回纯文本——说话人信息通过在本地将该文本（第 1 条腿）与本地时间对齐 + 说话人分离流程进行对齐来添加。因此，路径 B = 远程获取文本，然后使用 `--text-file` 运行路径 A 的流程。

**先进行健康检查**（如果本会话中已经验证过，则跳过）：
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

#### 自托管 vLLM：以令人困惑的方式失效的限制

**这里版本很重要——其中两项限制在不同版本之间发生了变化。**下面的行为是针对提供 `Qwen/Qwen3-ASR-1.7B` 的 vLLM `0.15.2rc1.dev68`（一个开发版本；不存在 `0.15.2` 正式版本——PyPI 的版本从 0.15.1 直接跳到 0.16.0）进行端到端测试后测得的，随后又根据 `v0.26.0` 的源码重新核对。请先检查你自己的版本——`pip show vllm`——并阅读 #1 和 #3 中的版本说明。

**1. 发送 OGG，而不是 WAV——并且绝不要使用 MP3。**在 0.15.x 上，MP3 会被直接拒绝，但下意识的修复方式（转换为 WAV）反而会让你触及 #2 中的大小上限：

| 格式 | 16 kHz 单声道、16 位、60 秒 | 0.15.x 接受 |
|---|---|---|
| WAV `pcm_s16le` | 1,920 KB | 是 |
| FLAC | 1,092 KB | 是 |
| **OGG Vorbis** | **245 KB** | **是** |
| MP3 | — | **否** |

在相同采样率下，OGG 的大小约为 WAV 的 1/8：

```bash
ffmpeg -nostdin -v error -i INPUT -ar 16000 -ac 1 -c:a libvorbis OUTPUT.ogg
```

自行比较格式时请固定位深——解码有损源时，ffmpeg 可以自由扩展位深，而 24 位
FLAC 的输出会比 16 位 PCM *更大*；如果两者本来就不是同一份录音，这种结果会让人误以为
“FLAC 无法压缩”。添加 `-sample_fmt s16`。

值得注意的是，MP3 的拒绝会以 **HTTP 200 和错误响应体的形式返回**——只检查 `%{http_code}` 的检测会报告成功：

```
HTTP=200
{"error": {"message": "Error opening <_io.BytesIO object>: Format not recognised.", ...}}
```

*版本说明：* 在 0.15.x 中，上传内容会通过 `librosa`/soundfile 读取到 `BytesIO`，
即使主机上的 libsndfile 能够处理磁盘上的 MP3，`BytesIO` 在这里仍然会拒绝 MP3。`v0.26.0`
在 soundfile 抛出 `LibsndfileError` 后（`multimodal/media/audio.py`）添加了 pyav 回退机制，
因此 MP3/M4A 可能可以在当前版本中解码——但由于上述大小原因，OGG 仍然是更好的选择。

**2. 请求大小上限为 25 MB。**

```
{"error":{"message":"Maximum file size exceeded (parameter=audio_filesize_mb, value=28.6)",...}}
```

`VLLM_MAX_AUDIO_CLIP_FILESIZE_MB` 默认为 `25`（`vllm/envs.py`，从
0.15.1 到 v0.26.0 均未改变）。按 OGG 约 245 KB/分钟计算，大约在 **100
分钟**时达到该上限——对于一场会议来说绰绰有余，但全天录音或合并后的多段录音转储就会超过它。任务足够长、确实需要时，可以提高该值：

```bash
VLLM_MAX_AUDIO_CLIP_FILESIZE_MB=800 vllm serve <model> --port <port> ...
```

**3. `v0.26.0` 又增加了第二个独立限制：音频时长为 10 分钟。** 提高
大小上限**不会**解除该限制——它们是彼此独立的两个关卡，而且该限制会拒绝请求，而不是截断音频：

```
Audio exceeds maximum allowed duration of 600s (metadata reports 5998.0s).
Set VLLM_MAX_AUDIO_DECODE_DURATION_S to increase this limit.
```

`VLLM_MAX_AUDIO_DECODE_DURATION_S` 默认为 `600`，在 `envs.py` 中位于大小上限之后的下一行——
0.15.x 中不存在该变量，因此一份能在旧服务器上运行的讲座时长文件，在新安装的服务器上会被拒绝。在 `v0.26.0`+ 中同时设置两项：

```bash
VLLM_MAX_AUDIO_CLIP_FILESIZE_MB=800 VLLM_MAX_AUDIO_DECODE_DURATION_S=36000 \
  vllm serve <model> --port <port> ...
```

**4. 如果主机无法访问 huggingface.co，即使模型已经缓存在本地，模型加载也会失败。** vLLM 会在
启动时对 `config.json` 发起 `HEAD` 请求，重试五次后退出——错误信息会说“无法在缓存文件中找到它们”，即使文件明明就在本地：

```bash
HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 vllm serve <model> ...
```

还有一种症状相同但原因不同的情况，值得优先排查：**容器化**服务器拥有自己的 `HF_HOME`，
无法看到主机用户的 `~/.cache/huggingface`，因此你能够用 `ls` 找到的模型，对该服务器的视图而言确实不存在。

**5. vLLM 已经会对长音频进行分块——效果比客户端分割更好。**
`SpeechToTextConfig` 包含 `overlap_chunk_second=1` 和
`min_energy_split_window_size=1600`，也就是说，它会**在约 100 ms
窗口内最安静的位置进行分割**，而不是按照固定偏移量分割，因此切口会落在单词之间。解除上述限制后，一份 100 分钟的文件可以通过一个请求提交。这也是下面第 5 步回退方案仅针对**不会执行此操作的服务器**的原因。

**没有权限重启服务器？** #2/#3 中的上限是在服务器启动时设置的，因此当你无法操作服务器时，剩下的办法就是在客户端进行切分——这就是第 5 步；对于这样的端点，这是正确的工具，而不是退而求其次的方案。

⚠️ **但 `overlap_merge_transcribe.py` 无法直接驱动 0.15.x vLLM 端点**：它使用
`-acodec copy` 将分块切入 `chunk_NN.mp3`，因此当输入本身已经是 MP3 时会输出 MP3（根据 #1
会被拒绝），而对于任何其他输入则会直接失败——它从不检查 ffmpeg 的退出状态，因此坏掉的分块会在稍后表现为 JSON 解析错误，而不是“ffmpeg failed”。这些分块也始终存在于同一个
`TemporaryDirectory` 中，并在其中被清理，因此你没有机会对它们进行转换。对于这样的端点，请手动切分为 OGG，然后逐个提交每个片段：

```bash
ffmpeg -nostdin -v error -i INPUT -f segment -segment_time 900 \
  -ar 16000 -ac 1 -c:a libvorbis chunk_%02d.ogg
```

注意，这会失去重叠合并拼接功能，因此句子可能会在接缝处断开——而这正是 #5 中服务器端基于能量的切分器所要避免的问题。

**如果远程健康检查失败**，请按以下顺序诊断：

1. 网络：`ping -c 1 HOST` 或 `tailscale status | grep HOST`
2. 服务：`tailscale ssh USER@HOST "curl -s localhost:PORT/v1/models"`
3. 代理：切换 `--noproxy '*'` 后重试

**4. “实际上有东西在监听吗？”——单独使用 `ss` 会误导你。** 它只显示你自己用户的进程，因此以其他用户身份运行的服务器或**容器内的服务器**对它来说都是不可见的，即使它们仍在正常提供流量。请同时询问 Docker：

```bash
tailscale ssh USER@HOST "ss -ltn | grep -E ':(8000|8001|8002)'; \
  docker ps --format '{{.Names}}\t{{.Ports}}\t{{.Status}}'"
```

**5. “GPU 空闲吗？”**——在启动另一台服务器之前，请检查是否确实有进程占用 VRAM。无论旧笔记中声称哪个服务“拥有”该 GPU，只要计算应用列表为空，就表示没有任何进程正在使用它：

```bash
tailscale ssh USER@HOST "nvidia-smi --query-compute-apps=pid,process_name,used_memory --format=csv"
# under WSL nvidia-smi is often off PATH: /usr/lib/wsl/lib/nvidia-smi
```

**6. 要重启它？`pkill -f 'vllm serve'` 会杀死发出该命令的命令进程。** `-f`
会针对完整命令行进行匹配——而你刚刚输入的命令行中正好包含这个字符串，因此 pkill 会匹配到你自己的 shell。其表现为：旧进程被终止，新进程却始终没有启动，并且**不会有任何错误报告**。将首字母包在字符类中，使该模式无法匹配自身：

```bash
tailscale ssh USER@HOST "pgrep -f '[v]llm serve'"   # check
tailscale ssh USER@HOST "pkill -f '[v]llm serve'"   # kill
```

任何你在同一行中也输入了匹配模式的 `pkill -f` 都存在同样的陷阱。

## 第 4 步：验证输出

转录完成后，检查其完整性：

1. 确认输出不为空
2. 检查字符数是否合理（中文约 400 字符/分钟，英文约 200 词/分钟）
3. 对于本地 MLX，确认检查点清单显示 `status: complete`；当任何分块达到其令牌上限时，脚本会拒绝写入最终的 `.txt`
4. 对于旧版/远程输出，检查**结尾**——以半句话结尾可能意味着发生了截断
5. 向用户展示开头和结尾各约 200 个字符作为预览
6. **说话人路径**：检查对齐报告——`anchored_ratio` 应 ≥ 0.5（低于该值时脚本会发出警告），说话人数量应与录音情况相符（两人访谈却显示 5 个说话人，或独白被拆分成 2 个以上说话人，意味着说话人分离过度——何时不应信任这些标签，请参阅 `references/speaker_diarization.md`）

当此运行是现有高风险转录的独立证据轨迹时，完整性意味着整个基线录音都已到达完整检查点/最终回执。选定的片段可以确定选定的语句，但不能支持整篇转录或“更高质量最终版本”的声明。将完整输出交给 `transcript-fixer`；让其人工闸门处理尚未解决的专有名称分歧。

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

## 步骤 5：回退方案——重叠合并（仅限远程 API）

**先检查服务器是否会在内部进行分块，再考虑使用此方案。** vLLM 会这样做（路径 B 限制 #5），而且其基于能量的分割效果优于此脚本的固定偏移分割——因此，对于你所控制的 vLLM 端点，过长文件应通过提高上限来解决，而不是在客户端进行分割。

当端点**无法接收整个文件**时，在客户端进行分块：它直接拒绝过长音频（固定上下文窗口、硬性单请求时长限制），每次在相同输入长度下都发生 OOM，或者它会在内部进行分块但你无权提高其上限。

**超时是另一种故障，通常有更便宜的解决办法**——请求已经被接受，并且仍在运行。先在配置中提高 `max_timeout`（一个 100 分钟的文件，即使以约 60× 实时速度运行，也仍需要几分钟，而默认值可能比这更紧）；只有在设置了宽裕的上限后仍然超时，才考虑分块，这意味着服务器确实无法在一次处理中及时完成。

如果符合上述任一情况，则回退到分块转录：

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/overlap_merge_transcribe.py \
  --config "${CLAUDE_PLUGIN_DATA}/config.json" \
  INPUT_AUDIO OUTPUT.txt
```

该脚本将音频分割为 18 分钟的片段，并设置 2 分钟的重叠区，然后使用去除标点后的模糊匹配进行合并。算法详情请参阅 `references/overlap_merge_strategy.md`。

对于本地 MLX 模式，不需要重叠合并——随附脚本使用固定版本的 Qwen 低能量分割器，以原子方式提交每个片段，并且默认将 `max_tokens=8192` 设置为**每个片段**的上限。

## 步骤 6：建议进行转录校正

ASR 输出始终包含识别错误——同音词、乱码技术术语、断裂的句子。转录成功后，**主动建议**对输出运行 `transcript-fixer` 技能：

```
Transcription complete: [N] chars saved to [output_path].

ASR output typically contains recognition errors (homophones, garbled terms, broken sentences).
Would you like me to run /daymade-audio:transcript-fixer to clean up the text?

Options:
A) Yes — run daymade-audio:transcript-fixer on the output now (Recommended)
B) No — the raw transcription is good enough for my needs
C) Later — I'll run it myself when ready
```

如果用户选择 A，则使用输出文件路径调用 `transcript-fixer` skill。这两个 skill 构成一个自然的流水线：**转录 → 校正 → 审阅**。

如果用户在同一轮中已经请求校正、合并多轨，或生成更高质量的转录文本，则该请求已经选择了 A。直接继续执行 `transcript-fixer`，无需再次询问用户是否批准相同的工作。

## 重新配置

```bash
rm "${CLAUDE_PLUGIN_DATA}/config.json"
```

然后重新运行步骤 0。

## 批量转录（许多短文件）

将许多文件传递给一次 `transcribe_local_mlx.py` 调用效率很高（模型只需加载一次）——**但前提是每个文件都包含实际语音。** 如果批次中可能包含纯音乐 / 仅 BGM 的片段（带字幕而非旁白的短宣传视频、混剪片段），不要在一个进程中批量处理：

- 对于仅有音乐 / 节奏的音频，模型可能陷入**重复循环幻觉**（例如无休止地输出 “One, two, three, one, two, three...”）。每个分块 8192 个 token 的上限可以限制资源增长，而 12 字符 n-gram 质量门会拒绝即使在达到该上限前停止的循环；但一个异常文件仍可能耗尽整个分块超时时间，使批处理中的其他文件得不到处理。
- **让批处理任务按每个文件一个进程运行，并设置每个文件的超时时间**（例如在每次调用外层使用 `timeout 240` / `perl -e 'alarm 240; exec @ARGV'`，超时则跳过，之后对失败文件进行第二轮处理）。这样，一个卡住的文件只会耗费 4 分钟，而不是拖住整个批次。
- 对于卡住的文件，使用 `--max-tokens 3000` 重试：短片段中的真实语音可以轻松容纳；陷入循环的文件则会生成被截断的输出，便于分类。
- **检测“无语音”情况，而不是交付垃圾结果**：如果转录文本的唯一词比例极低（例如对于长度超过 40 个字符的输出，`len(set(words))/len(words) < 0.06`），则该片段几乎可以确定没有旁白——应将其标记为无语音，而不是交付循环文本。（对于仅包含字幕的视频，真正的解决方案是对画面中的字幕执行下游 OCR。）

## 单词级时间戳（字幕、音画对齐）

`mlx-whisper` 的词语计时是短 / 中等 Qwen 说话人流水线的**计时环节**（第 2 环——`scripts/word_timestamps_whisper.py` 会自动运行它）。本节介绍如何**单独**使用单词级时间戳：生成字幕、将旁白与镜头边界对齐、为每个片段生成字幕。

Qwen3-ASR 是一种 LLM 解码器 ASR，在本地路径和远程路径上都会输出不包含对齐信息的纯文本。当任务需要知道每个单词的发音时间时，应使用 `mlx-whisper` 并设置 `word_timestamps=True`。对于此类任务，Whisper 的交叉注意力单词对齐是事实上的本地解决方案。

关键事实（完整步骤见 `references/whisper_word_timestamps.md`）：

- 模型：`mlx-community/whisper-large-v3-turbo`（约 1.6GB）。其中文 WER 高于 Qwen3-ASR，适合纯转录；但对于对齐任务，Qwen3-ASR 根本不是可选方案；可通过 `initial_prompt` 预置领域术语。
- **分段粒度陷阱**：对于短视频（15–40 秒），Whisper 经常将整个片段作为一个分段返回——始终应基于单词列表，并按照单词的中点将单词分配到时间窗口。
- 与 ffmpeg 场景检测（`select='gt(scene,0.3)'`）结合处理视觉侧；避免在非 ASCII 路径上使用 PySceneDetect。

## 说话人分离与识别（谁说了什么）

说话人标签是 Step 3 的默认输出。两种本地路线都会将 ASR 与 pyannote 解耦，并按时间进行融合；两者都不会单独转写说话人轮次切分后的片段。本节介绍相关组件。

- **短时/中时流水线** — `scripts/speaker_transcribe.py` 在一条命令中运行全部三个环节及对齐，并写入带说话人标签的转录文本和 CSV。架构、对齐算法、可信度信号（`anchored_ratio`）以及失败模式：`references/decoupled_speaker_alignment.md`。生产环境中的注意事项（过度分段、麦克风域效应、何时不应信任标签）：`references/speaker_diarization.md`。
- **仅进行说话人分离** — `scripts/diarize_speakers.py` 只输出 `speaker × time` 片段（不进行转录）。
- **旧版级联流程** — `scripts/speaker_transcribe_cascade.py` 是旧的先切分再转写变体（先进行说话人分离 → 按轮次切分音频 → 对每个切分片段执行 ASR）。它会在每次切分处打断 ASR 上下文并降低文本质量；仅保留用于极度嘈杂或严重重叠的音频，在这类情况下，对每个切分片段隔离出占主导地位的近场说话人，其效果优于会话级 ASR。其他情况均使用默认的解耦流程。
- **声纹识别** — 说话人分离标签是匿名的（`SPEAKER_00`……），并且只在每个文件内有效。若要将其映射到真实姓名、在多个文件之间统一同一说话人，或合并说话人分离产生的过度分段，请通过 `scripts/voiceprint_id.py` 使用 CAM++ 声纹。配方**以及关键的声学域注意事项**——使用一种麦克风类型构建的声纹，在另一种不同麦克风上匹配同一个人的效果会差得多：`references/voiceprint_speaker_id.md`。

**一次性 pyannote 设置**（受限模型）：在
`hf.co/pyannote/speaker-diarization-3.1` 接受条款，然后执行一次
`huggingface-cli login`（或设置 `HF_TOKEN`）。之后每次运行都会自动检测。

## 转录审计与审阅（HTML）

进行说话人分离后，每个文件会得到一个 CSV（`file,start,end,duration,speaker,text`）。随附的审计 HTML 生成器会将这些 CSV 转换为单个以阅读为先的审阅页面，支持音频播放、逐轮标记/备注、说话人别名设置和导出。

从说话人转录输出目录生成：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/generate_audit_html.py \
  OUTPUT_DIR \
  --output OUTPUT_DIR/audit/index.html \
  --audio-dir /path/to/original/audio
```

默认情况下，生成器假设 `PROJECT_DIR` 下采用扁平布局：`PROJECT_DIR/*.csv` 为转录文件，`PROJECT_DIR/*.diarization.json` 为分离文件，原始音频文件则放置在输出文件旁边。`speaker_transcribe.py` 本身会将 CSV、TXT 和分离文件以扁平方式写入其 `OUTPUT_DIR` 下。如果你的项目使用不同的结构，可以覆盖其中任意路径：

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
| `--manifest` | 将文件 ID 映射到元数据的 JSON manifest（可选） |
| `--title` / `--subtitle` | 页面标题和副标题 |
| `--storage-key` | 用于持久化状态的 `localStorage` 命名空间 |
| `--known-speaker` | 可重复使用；`"Name"` 自动分配颜色，`"Name=#hex"` 显式设置颜色 |
| `--material-final` / `--material-rough` | 用于筛选的可重复使用的素材分类标签 |

输出是一个不含外部依赖的单个自包含 HTML 文件。在浏览器中打开后，可以查看、标记和注释发言轮次；导出按钮会生成一份报告，其中包含所有被标记的行及其原因和备注。

## 故障排除

### 本地 MLX 在加载模型时失败

如果模型加载失败，并出现类似以下错误：

```text
AttributeError: 'str' object has no attribute '__module__'
```

则该代理很可能正在使用未固定版本或过时的本地 MLX 脚本。已知可正常工作的版本组合是：

```text
mlx-audio 0.3.1
mlx-lm 0.30.5
transformers 5.0.0rc3
```

运行捆绑的 `--smoke-test` 命令，并确认依赖栈那一行与之匹配。在 smoke test 成功之前，不要开始长时间的转录任务。

### 自托管远程端点拒绝音频

以下每种情况表现出来的症状都容易让人误判真正原因，因此值得根据症状加以识别。完整的详情和修复方法请参阅路径 B 的“自托管 vLLM：以令人困惑的方式失败的限制”部分。

| 症状 | 实际原因 |
|---|---|
| `Maximum file size exceeded (parameter=audio_filesize_mb, ...)` | 25 MB 上限，按**字节而不是分钟**计算——通常是转换为 WAV 后超出了上限；发送 OGG（大约小 8 倍） |
| `HTTP 200`，但响应正文是 `{"error": ... "Format not recognised."}` | 将 MP3 发送给了 0.15.x 服务器——而仅检查状态码的逻辑会将其判定为成功 |
| `Audio exceeds maximum allowed duration of 600s` | 在 `v0.26.0` 中新增的**第二个独立**上限；提高大小上限不会解除该限制 → `VLLM_MAX_AUDIO_DECODE_DURATION_S` |
| 服务器无法启动：提示 “couldn't find them in the cached files”，但模型*确实*已缓存 | 启动时尝试访问 huggingface.co → `HF_HUB_OFFLINE=1`；如果使用容器，容器的 `HF_HOME` 可能根本看不到主机的缓存 |
| 长文件失败，而你正准备在客户端进行分块 | vLLM 已经会在低能量点进行拆分——应改为提高上限，除非你无法重启服务器（第 5 步会说明何时适合进行分块） |

### `${CLAUDE_SKILL_DIR}` 未被替换

此 skill 中的脚本路径使用 `${CLAUDE_SKILL_DIR}`——即 skill 自身所在的目录，Claude Code 加载 skill 时会替换该变量。如果某条命令中出现了字面量 `${CLAUDE_SKILL_DIR}`（某些运行时不会进行替换），请按以下顺序解析 skill 目录：

1. 技能加载信封：`Base directory for this skill: <path>` → `<path>` 是技能目录。
2. 没有信封 → 查找候选项，并选择本会话的 available-skills 列表所指向的候选项（已安装的副本可能落后于源代码检出版本）：
   `find ~/.claude ~/.claude-profiles ~/.codex ~/workspace -maxdepth 7 -type d -name asr-transcribe-to-text 2>/dev/null | head -5`

在本文档中，将 `${CLAUDE_SKILL_DIR}` 的所有出现替换为解析得到的绝对路径。

## 随附资源

**脚本：**
- `resolve_media_input.py` — 将本地路径、直接媒体 URL 以及播客/网页解析为经过验证的本地媒体文件
- `prepare_asr_input.py` — 合并多段录音并为 ASR 进行标准化处理（16 kHz 单声道）；可选使用保留音高的加速处理，以适应有时长限制的上传；自行验证时长计算和拼接边界
- `transcribe_local_mlx.py` — 本地 MLX 转录（macOS ARM64，PEP 723 依赖）；限制低能量片段；支持原子检查点/恢复；绑定所有者存活状态
- `transcribe_long_whispercpp.py` — **长音频 ASR 的默认方案**：显式源时间块 + 重叠归属 + whisper.cpp/Silero VAD + 原子检查点/恢复
- `fuse_whispercpp_diarization.py` — 将规范化的 whisper.cpp 时间片段与 pyannote 语音/说话人结果进行后期融合；移除未经依据的静音幻觉，并输出 TXT/CSV/回执
- `speaker_transcribe.py` — 短/中等音频的解耦流水线（会话范围内的 Qwen3-ASR + whisper 定时 + pyannote）；`--no-diarization` 纯文本快速路径；`--text-file` 用于远程或预生成的 ASR 文本
- `align_speakers.py` — 解耦式对齐核心（标准库）：将完整转录文本映射到 whisper 词级网格和 pyannote 片段；可单独用于调试
- `word_timestamps_whisper.py` — mlx-whisper 词级时间戳 → JSON 定时网格（Apple Silicon）
- `speaker_transcribe_cascade.py` — **旧版**截取后转录方案（仅适用于噪声极大/重叠严重的音频）
- `diarize_speakers.py` — 单独进行说话人分离（pyannote 3.1 @ MPS）→ 每个片段的 JSON
- `voiceprint_id.py` — CAM++ 声纹注册/匹配：将匿名的 SPEAKER_xx 映射为真实姓名
- `overlap_merge_transcribe.py` — 带重叠合并的分块转录（远程 API 备用方案）
- `generate_audit_html.py` — 根据 speaker-transcribe CSV 输出构建自包含的 HTML 审核/复核页面

**参考资料：**
- `decoupled_speaker_alignment.md` — 默认架构：为何采用解耦方式、对齐算法、可信度信号、失败模式
- `speaker_diarization.md` — 生产环境中的陷阱：过度分段、麦克风域效应、何时不应信任标签；旧版级联方案说明
- `voiceprint_speaker_id.md` — CAM++ 说话人识别：注册/匹配、阈值+裕度门控、声学域注意事项、引导启动
- `local_mlx_guide.md` — 性能基准、每个片段的令牌/资源契约、检查点恢复、模型兼容性
- `whisper_word_timestamps.md` — mlx-whisper 词级定时：短/中等音频 Qwen 流水线中的定时环节；独立的字幕/音视频对齐方案
- `overlap_merge_strategy.md` — 为什么朴素分块会失败、模糊合并算法