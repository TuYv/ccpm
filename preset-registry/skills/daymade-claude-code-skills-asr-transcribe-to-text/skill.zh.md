---
name: asr-transcribe-to-text
description: >-
  Transcribe audio/video to speaker-labeled text — who-said-what by default, plain-text opt-out; MLX-local on Apple Silicon or remote; local files, media URLs. Use for transcribing recordings/podcasts/lectures/meetings, ASR, speech-to-text, 转录, 语音转文字, 录音转文字, speaker diarization/说话人分离/识别/谁在说话, timestamps 字幕/时间戳/音画对齐, CAM++ voiceprint ID. This skill ALSO owns audio PREPROCESSING for ASR as a first-class trigger, even without transcription: convert any audio/video into an ASR-ready file (转换成适合 ASR 的格式, 转格式, convert/prepare audio for ASR, 音频预处理), downsample to 16kHz mono 16-bit (降采样, 重采样, 单声道, 归一化), merge multi-segment recorder dumps (多段合并/拼接, DJI TX01/TX02), transcode to small M4A + pitch-preserved speedup to cut metered-ASR billed minutes (转 M4A, 压缩上传, 加速, 1.3x, 飞书妙记/Feishu Minutes). Trigger even when it looks like a trivial one-line ffmpeg — the skill owns sample-rate/bit-depth/channel, merge-order, speed-vs-WER, format choices + a blessed prepare_asr_input.py.
argument-hint: "[audio-or-video-file-path-or-url ...]"
---
# ASR 转录为文本

将音频/视频转录为带有**说话人标签**的文本。默认流程（解耦式，
类似 WhisperX）：Qwen3-ASR 在保留完整上下文的情况下转录整段音频，
mlx-whisper 提供词级时间格点，pyannote 提供说话人分段，
对齐器则将三者合并——音频在 ASR 之前绝不会被切分，
因此转录质量可保持完整音频级别的保真度。

| 模式 | 适用场景 | 速度 | 成本 |
|------|------|-------|------|
| **本地 MLX** | macOS Apple Silicon | 实时速度的 15-27 倍 | 免费 |
| **远程 API** | 任何平台，或本地不可用时 | 取决于 GPU | API/自行托管 |

**在两者之间进行选择通常与速度无关——关键在于音频当前存放在哪里。**
远程 GPU 的速度可能快数倍（实测一台运行 vLLM 的 4090 达到约 61 倍实时速度，
而本地 MLX 约为 15 倍），但与传输文件相比，这点差距微不足道：
转录输出是文本，而文本比其来源音频小约 10,000 倍
（18.5 小时的语音 ≈ 33 万字符 ≈ 1 MB，而 WAV 约为 2.6 GB）。因此：

> **在音频当前所在的位置进行转录，只传输转录文本。**

为了使用更快的 GPU 而通过慢速链路拉取数百 MB 的文件，通常耗费的实际时间
比整个转录过程还要长——有一次实测速率为 63 KB/s，传输 500 MB 需要两个多小时，
却只能节省几分钟的计算时间。如果录音已经在远程主机上（它是在那里录制的、
下载到那里的，或者位于挂载到那里的共享目录中），就在远程主机上运行
ASR，然后只取回 `.txt`。

配置持久化保存在 `${CLAUDE_PLUGIN_DATA}/config.json` 中。

> **默认启用说话人标签。** 每次运行都会生成 `[start-end] SPEAKER_xx: text`
> 和 CSV。仅输出纯文本是一项可选退出设置（`--no-diarization`），适用于独白、
> 播客，或只需要摘要的情况——请参阅步骤 3。
>
> **说话人分离的一次性设置：** pyannote 是 HuggingFace 上的受限模型——首次使用时
> 需要提供一次令牌（见下方的 `## Speaker Diarization & Identification`）。如果未设置，
> 首次运行将失败并显示设置步骤；设置完成后，完整功能将永久可用并被自动检测。

## 步骤 0：检测平台并加载配置

```bash
cat "${CLAUDE_PLUGIN_DATA}/config.json" 2>/dev/null
```

**如果配置存在**，读取其中的值并继续执行步骤 1。

**如果配置不存在**，首先自动检测平台：

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

然后使用 **AskUserQuestion**，并提供适合当前平台的默认选项：

对于 **macOS Apple Silicon**（推荐：本地）：
```
ASR setup — your Mac has Apple Silicon, so local transcription is recommended.

Q1: Transcription mode?
  A) Local MLX — runs on your Mac's GPU, no API key needed, 15-27x realtime (Recommended)
  B) Remote API — send audio to a server (vLLM, Tailscale workstation, etc.)

Q2: Does your network have an HTTP proxy that might intercept traffic?
  A) Yes — bypass proxy for ASR traffic (Recommended if using Shadowrocket/Clash)
  B) No — direct connection
```

对于**其他平台**（推荐：远程）：
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
    'max_tokens': 200000,     # local only, critical for long audio
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

支持本地文件、直接媒体 URL 或网页/播客单集页面。

- **网页或播客页面 URL**：首先检查页面中是否已有转录文本。仅当用户的账户可以直接访问官方/平台提供的转录文本时，才使用该文本。如果转录文本端点需要登录令牌但当前没有可用令牌，请明确说明这一点，并回退到根据音频 URL 进行 ASR。
- **本地文件、直接媒体 URL 或页面 URL 回退方案**：运行随附的解析器。它会从常见页面元数据（`og:audio`、媒体标签、JSON-LD、RSS 风格的附件链接）中提取媒体，使用原子临时文件替换方式下载 URL，在远程 `Content-Length` 存在时进行验证，计算 SHA-256，并使用 `ffprobe` 验证结果。

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/resolve_media_input.py \
  INPUT_FILE_OR_URL [INPUT_FILE_OR_URL2 ...] \
  --output-dir OUTPUT_DIR \
  --manifest OUTPUT_DIR/media_manifest.json
```

对于可疑或高价值的下载，请添加 `--decode-check`，让 `ffmpeg` 在转录前解码整个文件：

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

在后续步骤中，使用打印出的本地路径作为 `INPUT_AUDIO`。如果你的运行环境显示的是字面量 `${CLAUDE_SKILL_DIR}`，而不是替换后的路径，请按照本文档底部的故障排除条目解析技能目录。

对于第三方公开播客或受版权保护的媒体，请将转录文本保存为本地文件，供用户进行个人分析。不要在聊天中粘贴完整的长篇转录文本；应改为提供路径、预览、摘要或简短摘录。

## 步骤 2：提取音频（如果输入是视频）

对于视频文件（mp4、mov、mkv、avi、webm），提取为 16kHz 单声道 WAV：

```bash
ffmpeg -i INPUT_VIDEO -vn -acodec pcm_s16le -ar 16000 -ac 1 OUTPUT.wav -y
```

音频文件（wav、mp3、m4a、flac、ogg）可以直接使用。获取时长：
```bash
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 INPUT_FILE
```

**清理**：转写成功后，删除提取出的 WAV 文件以节省磁盘空间。

## 预处理：合并分段并缩减计费上传时长（可选）

当符合以下任一情况时，请在转写之前执行此操作：

- **录音是由多个分段文件组成的转储**——随身麦克风和现场录音设备会将
  会话拆分为固定长度的文件（例如 `TX02_MIC024_....wav`、`TX02_MIC025_....wav`；
  `TX01/TX02` = DJI MIC MINI 2S 内部录音——设备清单以及
  录音设备→飞书妙记路径请参阅 meeting-ingest skill 的 `meeting-ingest/references/architecture.md` §①-L0）。
  合并这些文件，并转写合并后的文件：完整音频上下文是解耦流水线
  （步骤 3）的质量基础，因此分别转写各个分段恰恰会丢弃该架构所带来的优势。
- **音频将发送到按量计费的 ASR**（飞书妙记或任何按分钟计费的配额服务）——
  保持音调不变的加速可直接缩短计费时长，而且现代 ASR 并不在意：
  用户已于 2026-07-16 在飞书妙记上验证过 1.3x，识别效果没有可感知的差异；
  公开的 Whisper 基准测试表明，在 2.0x 之前 WER 不会急剧下降
  （≤1.5x = 安全区，1.5x 时 WER 增幅约为 3%；>2x 不可用）。

使用随附的脚本——它会合并音频、标准化为 16 kHz 单声道、按需加速，
并自行验证输出，而不是盲目信任 ffmpeg 的退出代码：

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

- 当每个文件名中都包含 `YYYYMMDD_HHMMSS` 时间戳时（录音设备转储通常如此），
  分段将按该时间戳排序；否则会保留给定顺序并显示一条说明——
  请在转写前目视检查输出的合并顺序。
- 自验证：输出时长必须等于 Σsegments ÷ speed（允许 ±1.5 s 的误差，否则硬性 FAIL）；
  每个拼接点都会进行 10 s 的音量抽查（边界处出现无声段 = 顺序错误或缺少分段）；
  同时会输出整体响度，以便与源文件比较。
- 加速必须采用 `atempo` 风格的音调保持伸缩——绝不能使用采样率技巧，
  因为这会改变音调，并同时破坏 ASR 准确率和说话人分离所用的声纹。
- **根据目标位置选择输出格式**——编解码器由文件扩展名决定：

| 目标位置 | 格式 | 原因 |
  |---|---|---|
  | 本地 MLX 流水线（路径 A） | `.wav` 或 `.m4a` | 两种格式都可以直接输入流水线（m4a 已于 2026-07-18 验证：一个 3 分钟的片段转写结果清晰准确）。M4A 的体积约小 5 倍——在一次 2 小时 49 分钟的合并中，324 MB WAV → 63 MB M4A，时长精确到秒且完全一致 |
  | 按量计费上传（飞书妙记，按分钟计额） | `.m4a` + `--speed 1.3` | AAC 48k 对 ASR 而言可保持语音透明度，在语音质量相同的情况下比 mp3 小约 30%；加速可使计费时长减少约 23% |
  | 自托管 vLLM 端点（路径 B） | `.ogg` | 可用于拒绝 MP3 的场景，且体积比 WAV 小约 8 倍——这正是让长录音保持在服务器 25 MB 请求上限以内的关键。请参阅路径 B 的限制部分 |
  | 无损归档 | `.flac` | 体积约为 WAV 的 50%，逐比特无损 |
  | 仅在目标不接受上述格式时使用 | `.mp3` | 兼容性后备方案 |
- 在转写文本通过第 4 步验证之前，请保留原始文件。

## 选项：上传至飞书妙记进行转写

预处理完成后，如果用户希望使用**飞书妙记**进行转写，而不是使用上述本地/远程流水线，请采用此路径。当用户明确要求创建妙记，或希望使用云端转写界面而不是本地转写文本文件时，这是正确的选择。

**触发短语**：传到妙记 / 上传到飞书妙记 / 让妙记转写 / 从此音频创建妙记 / 上传到飞书妙记。

**约束**：
- **不使用代理**：所有 `lark-cli` 调用都必须使用 `LARK_CLI_NO_PROXY=1`。
- **单一配置文件**：仅使用当前活跃的飞书配置文件。不要遍历租户配置文件，也不要调用租户路由。
- **之后不进行本地转写**：妙记创建后，此技能的工作即告结束。用户需在飞书中打开 `minute_url`，等待云端 ASR 完成。本地转写文本修正（`transcript-fixer`）或说话人补全（`review-feishu-minutes`）仅适用于云端转写文本已生成并已拉取回本地之后，不适用于创建时。

**分步操作**：

1. 尽可能**使用上一节中已经过预处理的音频**。
   飞书接受 MP4/MOV 封装中的 `.m4a`、`.mp3`、`.wav`、`.aac`；预处理器中的“按量计费上传”一行已经针对这一用途进行了处理。确保文件小于 6 GB 且时长少于 6 小时——这是飞书上传的硬性限制。

2. **以用户身份上传到云盘**：
   ```bash
   LARK_CLI_NO_PROXY=1 lark-cli drive +upload \
     --file '<preprocessed-media-path>' \
     --name '<basename>' \
     --as user \
     --format json
   ```
   从结果中记录 `file_token`。如果命令因路径验证或多部分上传失败而报错，不要盲目重试——调整格式或大小策略后再尝试一次，然后报告确切的失败信息。

3. **从该云盘文件创建妙记**：
   ```bash
   LARK_CLI_NO_PROXY=1 lark-cli minutes +upload \
     --file-token '<file_token>' \
     --as user \
     --format json
   ```
   从结果中记录 `minute_token` 和 `minute_url`。

4. **将 `minute_url` 返回给用户**，然后停止。不要运行此技能的本地转写步骤，也不要对此次新创建的妙记运行 `sync-feishu-minutes` 的摄取/委派操作——这些操作适用于飞书上已经存在的妙记。当用户之后要求拉取此妙记时，移交给 **`sync-feishu-minutes`**；之后如需清理说话人信息，则移交给 **`review-feishu-minutes`**。

**预期输出**：
- 成功：一个用户可打开以查看/转写的 `minute_url`。
- 失败：来自 `drive +upload` 或 `minutes +upload` 的确切 API 错误，外加一个
  建议的后续操作。

**技能错误恢复**：如果此请求在你处于
`sync-feishu-minutes` 中时到达，则请求形式是“本地音频 -> 飞书妙记”，而不是
“同步现有妙记”——停止当前操作，切换到 `asr-transcribe-to-text`，并按照
本节操作。

## 第 3 步：转写（默认标注说话人）

### 路径 A：本地 MLX（macOS Apple Silicon）——默认

运行解耦的说话人处理流水线——它会在内部处理依赖版本固定、模型加载，
以及关键的 `max_tokens` 参数。

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/speaker_transcribe.py \
  INPUT_AUDIO [INPUT_AUDIO2 ...] OUTPUT_DIR
```

预期输出（每个文件）：

```text
Device: mps
+ uv run .../transcribe_local_mlx.py ...        (leg 1: full-audio text)
+ uv run .../word_timestamps_whisper.py ...     (leg 2: timing lattice)
... diarization ...                             (leg 3: pyannote segments)
STEM: 42 turns, speakers=['SPEAKER_00', 'SPEAKER_01'], anchored_ratio=0.93
Wrote STEM.txt, STEM.csv, STEM.alignment.json
```

每个输入的输出：`<stem>.txt`（`[MM:SS - MM:SS] SPEAKER_xx` + 文本）、
`<stem>.csv`（`file,start,end,duration,speaker,text`——供审核 UI 和
声纹识别使用）、`<stem>.diarization.json`、`<stem>.alignment.json`（来源信息
+ `anchored_ratio` 可信度信号；< 0.5 时会输出醒目警告——在信任标签之前，
请对照音频进行验证）。中间阶段结果会缓存在
`OUTPUT_DIR/_align/` 中，因此重新运行的开销很小（`--force` 会重新执行这些阶段）。

在首次长时间运行之前，先对 Qwen3 阶段执行一次冒烟测试：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/transcribe_local_mlx.py --smoke-test
```

预期输出包含 `Dependency stack: mlx-audio 0.3.1, mlx-lm 0.30.5,
transformers 5.0.0rc3` 和 `Smoke test OK`。有关性能详情和
max_tokens 截断问题，请参阅 `references/local_mlx_guide.md`。

**工作原理（以及这样做的原因）：** 完整音频的 Qwen3-ASR 文本 + mlx-whisper 单词
时间戳 + pyannote 说话人片段，并在事后进行对齐——音频在转写前绝不会被
切分，因此 ASR 能够保留完整上下文。架构、对齐算法和失败模式：
`references/decoupled_speaker_alignment.md`。

**首次运行：pyannote 需要一次性设置 HuggingFace token。** 如果脚本退出时
显示设置提示（退出代码 3），请停止并使用 **AskUserQuestion**：

```
Speaker diarization needs a one-time setup (gated model, free):
  1. Accept terms at https://hf.co/pyannote/speaker-diarization-3.1
  2. Run `huggingface-cli login` (or set HF_TOKEN)

Options:
A) Set it up now — I'll wait, then rerun with full speaker labels (Recommended)
B) Continue without speakers this time — plain text only
```

- **A** → 用户确认登录后，重新运行相同命令。每次运行都会自动检测 token；
  此后将永久具备完整功能。
- **B** → 持久化该选择（在 config.json 中设置 `diarization_declined: true`），并
  重新运行相同命令。脚本会检测该标志，输出一行包含两个设置步骤的警告，
  并在该次运行中自动回退到纯文本——无需传递 `--no-diarization`（现在回退是
  自动进行的，并由脚本而不只是文档强制执行）。此后每次运行时，只要 token
  仍然缺失，都会以相同方式发出警告并继续。当之后检测到 token 时，
  说话人分离会自动恢复（存在 token 时会忽略该标志）——请向用户说明这一点，
  让用户知道只需完成设置即可。

**纯文本快速路径**（独白、播客、“只需总结一下”）：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/speaker_transcribe.py \
  INPUT_AUDIO OUTPUT_DIR --no-diarization
```

**远程/预生成的 ASR 文本**（例如来自路径 B 或其他 ASR 服务）：跳过 Qwen3 环节，改为对齐该文本。`--text-file` 将一份转录文本与一个输入 wav 文件配对——不允许传入多个输入文件（一份转录文本无法与多个文件对齐）：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/speaker_transcribe.py \
  INPUT_AUDIO OUTPUT_DIR --text-file TRANSCRIPT.txt
```

**非 Apple Silicon 设备：** Whisper 计时环节仅支持 MLX。没有该环节，就不存在可用于对齐说话人的时间网格——请使用 `--no-diarization` 运行，并告知用户说话人模式目前需要 Apple Silicon（带有内置说话人分离功能的云端 ASR，例如飞书妙记，是无需本地 GPU 的替代方案）。

**在批量处理大量短文件之前**（宣传片段、蒙太奇剪辑——任何可能包含纯音乐音频的内容），请阅读下方的 `## 批量转录（大量短文件）`：一个纯音乐片段就可能使整个批处理停滞 10 分钟以上。

### 路径 B：远程 API

远程端点仅返回纯文本——说话人信息通过在本地将该文本（环节 1）与本地计时及说话人分离环节对齐来添加。因此，路径 B = 远程获取文本，然后使用 `--text-file` 运行路径 A 的流水线。

**首先进行健康检查**（如果本次会话中已验证过则跳过）：
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

然后在本地添加说话人信息（需要 Apple Silicon 和 pyannote 令牌）：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/speaker_transcribe.py \
  INPUT_AUDIO OUTPUT_DIR --text-file OUTPUT.txt
```

#### 自托管 vLLM：那些会以令人困惑的方式触发失败的限制

**这里的版本很重要——其中两项限制在不同版本之间发生了变化。** 以下行为是通过对运行 `Qwen/Qwen3-ASR-1.7B` 的 vLLM `0.15.2rc1.dev68`（开发构建；并不存在 `0.15.2` 正式版本——PyPI 从 0.15.1 直接跳到 0.16.0）进行端到端测试得出的，随后又对照 `v0.26.0` 的源代码重新核查。请先检查你自己的版本——`pip show vllm`——并阅读第 1 项和第 3 项中的版本说明。

**1. 发送 OGG，而不是 WAV——并且绝不要发送 MP3。** MP3 在 0.15.x 上会被直接拒绝，但下意识的修复方式（转换为 WAV）恰恰会让你撞上第 2 项中的大小上限：

| 格式 | 60 秒，16 kHz 单声道、16 位 | 是否接受（0.15.x） |
|---|---|---|
| WAV `pcm_s16le` | 1,920 KB | 是 |
| FLAC | 1,092 KB | 是 |
| **OGG Vorbis** | **245 KB** | **是** |
| MP3 | — | **否** |

在相同采样率下，OGG 的体积约比 WAV 小 8 倍：

```bash
ffmpeg -nostdin -v error -i INPUT -ar 16000 -ac 1 -c:a libvorbis OUTPUT.ogg
```

自行比较格式时，请固定比特深度——解码有损音源时，ffmpeg 可以自由扩展其比特深度，而 24 位 FLAC 会比 16 位 PCM *更大*，这会让人误以为“FLAC 无法压缩”，但实际上两者根本不是同一种录音格式。请添加 `-sample_fmt s16`。

MP3 被拒绝这一点值得特别注意，因为**它会以 HTTP 200 加错误正文的形式返回**——如果检查逻辑只查看 `%{http_code}`，就会将其报告为成功：

```
HTTP=200
{"error": {"message": "Error opening <_io.BytesIO object>: Format not recognised.", ...}}
```

*版本说明：* 在 0.15.x 上，上传内容通过 `BytesIO` 上的 `librosa`/soundfile 读取；即使宿主机的 libsndfile 能够处理磁盘上的 MP3，此处仍会拒绝 MP3。`v0.26.0` 增加了在 soundfile 抛出 `LibsndfileError` 后使用 pyav 的回退机制（`multimodal/media/audio.py`），因此 MP3/M4A 在当前版本中很可能可以解码——但出于上述体积原因，OGG 仍然是更好的选择。

**2. 请求大小上限为 25 MB。**

```
{"error":{"message":"Maximum file size exceeded (parameter=audio_filesize_mb, value=28.6)",...}}
```

`VLLM_MAX_AUDIO_CLIP_FILESIZE_MB` 的默认值为 `25`（位于 `vllm/envs.py`，从 0.15.1 到 v0.26.0 均未改变）。按照 OGG 约 245 KB/分钟的大小计算，大约在 **100 分钟**时会达到这一上限——足以容纳一场会议，但全天录音或合并后的多分段转储文件会超过它。当任务时长足以触发该限制时，请提高此上限：

```bash
VLLM_MAX_AUDIO_CLIP_FILESIZE_MB=800 vllm serve <model> --port <port> ...
```

**3. `v0.26.0` 新增了第二个独立限制：音频时长不得超过 10 分钟。** 提高大小上限并**不会**解除这一限制——它们是两个独立的关卡，而且此限制会拒绝音频，而不是将其截断：

```
Audio exceeds maximum allowed duration of 600s (metadata reports 5998.0s).
Set VLLM_MAX_AUDIO_DECODE_DURATION_S to increase this limit.
```

`VLLM_MAX_AUDIO_DECODE_DURATION_S` 的默认值为 `600`，位于 `envs.py` 中大小上限之后的下一行——它在 0.15.x 中并不存在，因此能在旧服务器上正常处理的讲座长度文件，可能会被新安装的服务器拒绝。在 `v0.26.0` 及更高版本中，请同时设置这两个值：

```bash
VLLM_MAX_AUDIO_CLIP_FILESIZE_MB=800 VLLM_MAX_AUDIO_DECODE_DURATION_S=36000 \
  vllm serve <model> --port <port> ...
```

**4. 在无法访问 huggingface.co 的主机上，即使模型已缓存在本地，模型加载仍会失败。** vLLM 在启动时会对 `config.json` 发出 `HEAD` 请求，重试五次后退出——错误消息称“无法在缓存文件中找到它们”，尽管它们明明就在那里：

```bash
HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 vllm serve <model> ...
```

还有一种症状相同但原因不同的情况，值得优先排除：**容器化的**服务器有自己的 `HF_HOME`，无法看到主机用户的 `~/.cache/huggingface`，因此你能用 `ls` 看到的模型，在容器的视角中确实不存在。

**5. vLLM 已经会对长音频进行分块——而且比客户端分割器做得更好。**
`SpeechToTextConfig` 带有 `overlap_chunk_second=1` 和
`min_energy_split_window_size=1600`，也就是说，它会在**约 100 ms 窗口内最安静的位置**
进行分割，而不是在固定偏移处切割，因此切点会落在词与词之间。解除上述限制后，一个 100 分钟的文件可以通过单个请求提交。正因如此，下面第 5 步中的后备方案仅适用于*不具备*此能力的服务器。

**没有权限重启服务器？** 第 2/3 点中的限制是在服务器启动时设置的，因此当你无法对服务器进行操作时，剩下的办法就是在客户端进行分割——这就是第 5 步；对于此类端点，它是正确的工具，而不是后备方案。

⚠️ **但是，`overlap_merge_transcribe.py` 无法直接驱动 0.15.x 版本的 vLLM 端点**：它使用 `-acodec copy` 将音频切成 `chunk_NN.mp3`，因此只要输入本身是 MP3，它就会输出 MP3（根据第 1 点，这会被拒绝）；而对于任何其他输入，它都会直接*失败*——它从不检查 ffmpeg 的退出状态，所以有问题的分块稍后会表现为 JSON 解析错误，而不是“ffmpeg 失败”。这些分块也只存在于同一个 `TemporaryDirectory` 的生命周期内，因此根本没有可以转换它们的时机。对于此类端点，请手动分割成 OGG，并逐个提交各分块：

```bash
ffmpeg -nostdin -v error -i INPUT -f segment -segment_time 900 \
  -ar 16000 -ac 1 -c:a libvorbis chunk_%02d.ogg
```

请注意，这会失去重叠合并的拼接能力，因此句子可能会在接缝处断开——而这正是第 5 点中的服务器端基于能量的分割器所要避免的问题。

**如果远程健康检查失败**，请按以下顺序诊断：

1. 网络：`ping -c 1 HOST` 或 `tailscale status | grep HOST`
2. 服务：`tailscale ssh USER@HOST "curl -s localhost:PORT/v1/models"`
3. 代理：切换是否使用 `--noproxy '*'` 后重试

**4. “真的有任何服务在监听吗？”——只看 `ss` 会误导你。** 它只显示你自己的用户进程，因此，以其他用户身份运行或**在容器内**运行的服务器对它不可见，即使该服务器正在正常提供流量服务。与此同时也要查询 Docker：

```bash
tailscale ssh USER@HOST "ss -ltn | grep -E ':(8000|8001|8002)'; \
  docker ps --format '{{.Names}}\t{{.Ports}}\t{{.Status}}'"
```

**5. “GPU 空闲吗？”**——在启动另一台服务器之前，请检查是否确实有进程正在占用显存。计算应用列表为**空**意味着没有任何进程在使用它，无论较早的备注声称哪个服务“占用”了 GPU：

```bash
tailscale ssh USER@HOST "nvidia-smi --query-compute-apps=pid,process_name,used_memory --format=csv"
# under WSL nvidia-smi is often off PATH: /usr/lib/wsl/lib/nvidia-smi
```

**6. 要重启它？`pkill -f 'vllm serve'` 会终止发出该命令的进程。** `-f`
会匹配整个命令行——而你刚刚输入的命令行中包含这个确切的字符串，
因此 pkill 会匹配你自己的 shell。症状是：旧进程被终止，新进程
始终没有启动，而且**不会报告任何错误**。将首字母放在字符类中，
使该模式无法匹配自身：

```bash
tailscale ssh USER@HOST "pgrep -f '[v]llm serve'"   # check
tailscale ssh USER@HOST "pkill -f '[v]llm serve'"   # kill
```

对于任何 `pkill -f`，只要它的模式也出现在你输入的同一行中，都会遇到这个陷阱。

## 第 4 步：验证输出

转录完成后，检查是否发生截断——这是最常见的故障模式：

1. 确认输出不为空
2. 检查字符数是否合理（中文约 400 字符/分钟，英文约 200 词/分钟）
3. 检查**结尾**——是否在句子中途戛然而止？如果是，则说明 `max_tokens` 已耗尽
4. 向用户展示开头和结尾各约 200 个字符作为预览
5. **说话人路径**：检查对齐报告——`anchored_ratio` 应 ≥ 0.5（低于此值时脚本会发出警告），说话人数量对于该录音而言应当合理（双人访谈显示 5 位说话人，或独白被拆分为 2 位以上说话人，都意味着说话人分离发生了过度分割——有关何时不应信任标签，请参阅 `references/speaker_diarization.md`）

如果输出被截断或有误，请使用 **AskUserQuestion**：
```
Transcription may be truncated:
- Expected: ~[N] chars for [M] minutes of audio
- Got: [actual] chars ([pct]% of expected)
- Last line: "[last 100 chars...]"

Options:
A) Retry with higher max_tokens (current: [N], try: [N*2])
B) Switch mode — try [local/remote] instead
C) Save as-is — the output looks complete to me
D) Abort
```

## 第 5 步：后备方案——重叠合并（仅限远程 API）

**在采用此方案之前，请先检查你的服务器是否会在内部进行分块。** vLLM 会这样做
（路径 B 的限制 #5），而且它基于能量的切分优于此脚本基于固定偏移量的切分——因此，
对于你所控制的 vLLM 端点，文件过长的问题应通过提高上限解决，而不是
在客户端进行切分。

当端点**无法接收整个文件**时，才在客户端进行分块：端点直接拒绝过长的音频
（固定上下文窗口、严格的单次请求时长限制），总是在相同的输入长度下发生 OOM，
或者端点会在内部进行分块，但你无权提高其上限。

**超时属于另一种故障，通常有成本更低的解决办法**——请求已被接受，只是仍在
运行。首先提高配置中的 `max_timeout`（一段 100 分钟的文件，即使处理速度约为
实时速度的 60 倍，也仍然需要几分钟，而默认值可能比这更严格）；只有在设置了
宽裕的上限后仍然超时时，才采用分块，这意味着服务器确实慢到无法一次完成处理。

当符合上述任一情况时，回退到分块转录：

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/overlap_merge_transcribe.py \
  --config "${CLAUDE_PLUGIN_DATA}/config.json" \
  INPUT_AUDIO OUTPUT.txt
```

将音频切分为 18 分钟的分块，分块之间重叠 2 分钟，并使用去除标点后的模糊匹配进行合并。有关算法的详细信息，请参阅 `references/overlap_merge_strategy.md`。

对于本地 MLX 模式，无需进行重叠合并——内置脚本会在内部使用 `max_tokens=200000` 处理分块。

## 步骤 6：建议修正转录文本

ASR 输出总会包含识别错误——同音词、乱码般的技术术语、断裂的句子。成功完成转录后，**主动建议**对输出运行 `transcript-fixer` skill：

```
Transcription complete: [N] chars saved to [output_path].

ASR output typically contains recognition errors (homophones, garbled terms, broken sentences).
Would you like me to run /daymade-audio:transcript-fixer to clean up the text?

Options:
A) Yes — run daymade-audio:transcript-fixer on the output now (Recommended)
B) No — the raw transcription is good enough for my needs
C) Later — I'll run it myself when ready
```

如果用户选择 A，请使用输出文件路径调用 `transcript-fixer` skill。这两个 skill 构成了一条自然的流水线：**转录 → 修正 → 审阅**。

## 重新配置

```bash
rm "${CLAUDE_PLUGIN_DATA}/config.json"
```

然后重新执行步骤 0。

## 批量转录（大量短文件）

将多个文件传给单次 `transcribe_local_mlx.py` 调用效率很高（模型只加载一次）——**但前提是每个文件都包含真实语音。** 如果批次中可能包含纯音乐/BGM-only 片段（短宣传视频、使用字幕而非画外音的蒙太奇片段），请勿在同一进程中批量处理它们：

- 对于纯音乐/节奏音频，模型可能会陷入**重复循环幻觉**（例如无休止地重复“One, two, three, one, two, three...”），并持续消耗 token 直至 `max_tokens=200000`——仅一个这样的文件就可能卡住 10 分钟以上，并阻塞整个批次。
- **以每个文件一个进程的方式驱动批处理任务，并为每个文件设置超时**（例如在每次调用外使用 `timeout 240` / `perl -e 'alarm 240; exec @ARGV'`，超时则跳过，并对失败项进行第二轮处理）。这样，一个卡住的文件只会耗费 4 分钟，而不会拖住整个批次。
- 对于卡住的文件，使用 `--max-tokens 3000` 重试：短片段中的真实语音完全可以容纳；循环文件则会得到截断的输出，便于你对其进行分类。
- **检测“无语音”，而不是交付垃圾内容**：如果转录文本的唯一词比例极低（例如，对于 40 个字符以上的输出，`len(set(words))/len(words) < 0.06`），该片段几乎肯定没有画外音——应将其标记为无语音，而不是交付循环文本。（对于仅含字幕的视频，后续对画面字幕进行 OCR 才是真正的解决方案。）

## 词级时间戳（字幕、音视频对齐）

mlx-whisper 的词级时间信息现在是**默认说话人流水线的时间信息环节**（第 2 环——`scripts/word_timestamps_whisper.py` 会自动运行它）。本节介绍如何独立使用词级时间戳：生成字幕、将旁白与镜头边界对齐、为每个片段生成字幕。

Qwen3-ASR 是一种采用 LLM 解码器的 ASR：无论在本地还是远程路径中，它都只输出纯文本，不包含任何对齐信息。当任务需要知道每个词在*何时*说出时，请使用启用了 `word_timestamps=True` 的 `mlx-whisper`。Whisper 的交叉注意力词对齐是此类任务事实上的本地解决方案。

关键事实（完整方法见 `references/whisper_word_timestamps.md`）：

- 模型：`mlx-community/whisper-large-v3-turbo`（约 1.6GB）。在纯转录任务中，其中文 WER 高于 Qwen3-ASR，但对于对齐任务，Qwen3-ASR 完全不可用；请通过 `initial_prompt` 预先提供领域术语。
- **分段粒度陷阱**：对于短视频（15–40 秒），whisper 经常会将整个片段作为一个分段返回——应始终使用词语列表，并根据中点将词语分配到各个时间窗口。
- 在视觉侧配合 ffmpeg 场景检测（`select='gt(scene,0.3)'`）使用；对于包含非 ASCII 路径的情况，请避免使用 PySceneDetect。

## 说话人分离与识别（谁说了什么）

说话人标签是步骤 3 的默认输出（解耦架构：
全音频 Qwen3-ASR 文本 + whisper 时间格点 + pyannote 分段，
经过对齐——绝不要先切分再转录）。本节介绍其中的各个组成部分。

- **处理流水线** — `scripts/speaker_transcribe.py` 通过一条命令运行全部三个分支及
  对齐，并写入带说话人标签的转录文本和 CSV。
  架构、对齐算法、可信度信号（`anchored_ratio`）和
  失败模式：`references/decoupled_speaker_alignment.md`。生产环境中的
  陷阱（过度分段、麦克风声学域效应、何时不应信任标签）：
  `references/speaker_diarization.md`。
- **仅说话人分离** — `scripts/diarize_speakers.py` 仅输出
  `speaker × time` 分段（不进行转录）。
- **旧版级联流程** — `scripts/speaker_transcribe_cascade.py` 是旧的
  先切分再转录变体（说话人分离 → 按每个发言轮次切分音频 → 对每个
  切片执行 ASR）。它会在每次切分时打断 ASR 上下文并降低文本质量；仅为
  极度嘈杂或重度语音重叠的音频保留，因为在这类情况下，按切片隔离
  占主导地位的近场说话人可能优于全音频 ASR。其他所有情况都使用
  默认的解耦流程。
- **声纹识别** — 说话人分离标签是匿名的
  （`SPEAKER_00`……），并且仅适用于单个文件。若要将其映射到真实姓名、跨文件
  统一同一说话人，或合并说话人分离产生的过度分段，请通过
  `scripts/voiceprint_id.py` 使用 CAM++ 声纹。具体方法**以及关键的
  声学域注意事项**——使用一种麦克风类型构建的声纹，与同一人在
  另一种麦克风上的声音匹配效果会显著下降：
  `references/voiceprint_speaker_id.md`。

**pyannote 一次性设置**（受限模型）：在
`hf.co/pyannote/speaker-diarization-3.1` 接受条款，然后运行一次 `huggingface-cli login`
（或设置 `HF_TOKEN`）。此后每次运行时都会自动检测。

## 转录审计与审阅（HTML）

完成说话人分离后，每个文件都会得到一个 CSV（`file,start,end,duration,speaker,text`）。随附的审计 HTML 生成器可将这些 CSV 转换为一个以阅读体验为优先的统一审阅页面，其中包含音频播放、逐轮次标记/备注、说话人别名设置和导出功能。

从说话人转录输出目录生成该页面：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/generate_audit_html.py \
  OUTPUT_DIR \
  --output OUTPUT_DIR/audit/index.html \
  --audio-dir /path/to/original/audio
```

默认设置假定 `PROJECT_DIR` 下采用扁平布局：`PROJECT_DIR/*.csv` 转录文件、`PROJECT_DIR/*.diarization.json`，以及与输出文件放在同一目录中的原始音频文件。`speaker_transcribe.py` 本身会将 CSV、TXT 和说话人分离文件直接写入其 `OUTPUT_DIR` 下。如果你的项目使用不同的结构，可以覆盖其中任意路径：

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
| `project_dir` | 项目根目录（必需） |
| `--output` | 写入 `index.html` 的位置 |
| `--csv-dir` | 包含 `*.csv` 转录文件的目录 |
| `--txt-dir` | 包含 `*.txt` 纯文本转录文件的目录（可选） |
| `--diarization-dir` | 包含 `*.diarization.json` 文件的目录 |
| `--audio-dir` | 包含用于播放的音频文件的目录 |
| `--original-dir` | 包含原始源媒体的目录（可选） |
| `--manifest` | 将文件 ID 映射到元数据的 JSON 清单（可选） |
| `--title` / `--subtitle` | 页面标题和副标题 |
| `--storage-key` | 用于持久化状态的 `localStorage` 命名空间 |
| `--known-speaker` | 可重复使用；`"Name"` 会自动分配颜色，`"Name=#hex"` 会显式设置颜色 |
| `--material-final` / `--material-rough` | 可重复使用的素材分类标签，用于筛选 |

输出是一个不依赖任何外部资源的单一自包含 HTML 文件。在浏览器中打开该文件，即可检查、标记和注释各个话轮；导出按钮会生成一份报告，其中包含所有已标记的行及其原因和备注。

## 故障排查

### 本地 MLX 在加载模型时失败

如果模型加载失败并出现如下错误：

```text
AttributeError: 'str' object has no attribute '__module__'
```

代理可能正在使用未固定版本或过时的本地 MLX 脚本副本。已知可正常工作的依赖栈为：

```text
mlx-audio 0.3.1
mlx-lm 0.30.5
transformers 5.0.0rc3
```

运行随附的 `--smoke-test` 命令，并确认依赖栈行与上述内容一致。在冒烟测试成功之前，不要开始耗时较长的转录任务。

### 自托管远程端点拒绝音频

以下每种现象都容易让人忽略其真正原因，因此值得根据症状加以识别。完整详情和修复方法：参见路径 B 的“自托管 vLLM：那些以令人困惑的方式失效的限制”章节。

| 症状 | 实际原因 |
|---|---|
| `Maximum file size exceeded (parameter=audio_filesize_mb, ...)` | 25 MB 上限，按**字节而非分钟**计算——通常是转换为 WAV 后超出了限制；请发送 OGG（小约 8 倍） |
| `HTTP 200`，但响应正文是 `{"error": ... "Format not recognised."}` | 向 0.15.x 服务器发送了 MP3——而且仅检查状态码会将其视为成功 |
| `Audio exceeds maximum allowed duration of 600s` | 在 `v0.26.0` 中新增的**第二个独立**上限；提高文件大小上限并不会解除它 → `VLLM_MAX_AUDIO_DECODE_DURATION_S` |
| 服务器无法启动：模型*确实*已缓存，但提示“couldn't find them in the cached files” | 启动时尝试连接 huggingface.co → `HF_HUB_OFFLINE=1`；如果使用容器，容器的 `HF_HOME` 可能根本无法访问主机上的缓存 |
| 长文件处理失败，而你正准备在客户端对其分块 | vLLM 已经会在低能量点进行切分——除非无法重启服务器，否则应提高上限（步骤 5 说明了何时分块*才是*正确做法） |

### `${CLAUDE_SKILL_DIR}` 未被替换

此技能中的脚本路径使用 `${CLAUDE_SKILL_DIR}`——即技能自身的目录，Claude Code 会在技能加载时进行替换。如果你收到的命令中包含字面量 `${CLAUDE_SKILL_DIR}`（某些运行时不会执行替换），请按以下顺序确定技能目录：

1. 技能加载信封：`Base directory for this skill: <path>` → `<path>` 即为技能目录。
2. 没有信封 → 查找候选目录，并选择本次会话的可用技能列表所指向的目录（已安装的副本可能落后于源代码检出版本）：
   `find ~/.claude ~/.claude-profiles ~/.codex ~/workspace -maxdepth 7 -type d -name asr-transcribe-to-text 2>/dev/null | head -5`

在本文档的所有位置，用解析得到的绝对路径替换 `${CLAUDE_SKILL_DIR}`。

## 随附资源

**脚本：**
- `resolve_media_input.py` — 将本地路径、直接媒体 URL 以及播客/网页解析为经过验证的本地媒体文件
- `prepare_asr_input.py` — 合并多段录音并为 ASR 进行标准化（16 kHz 单声道），可选择在按时长计费的上传场景中进行保留音高的加速；自动验证时长计算和拼接边界
- `transcribe_local_mlx.py` — 本地 MLX 转录（macOS ARM64，PEP 723 依赖项）
- `speaker_transcribe.py` — **默认流水线**：解耦式多人说话转录（完整音频 Qwen3-ASR + whisper 单词时间信息 + pyannote 说话人分离，并进行对齐）→ 带说话人标签的转录文本 + CSV；`--no-diarization` 为纯文本快速路径；`--text-file` 用于远程/预先生成的 ASR 文本
- `align_speakers.py` — 解耦式对齐核心（标准库）：将完整转录文本映射到 whisper 单词时间格和 pyannote 分段；可独立用于调试
- `word_timestamps_whisper.py` — mlx-whisper 单词级时间戳 → JSON 时间格（Apple Silicon）
- `speaker_transcribe_cascade.py` — 旧版先切分后转录变体（仅用于噪声极大/大量重叠的音频）
- `diarize_speakers.py` — 仅执行说话人分离（pyannote 3.1 @ MPS）→ 每个分段对应的 JSON
- `voiceprint_id.py` — CAM++ 声纹注册/匹配：将匿名 SPEAKER_xx 映射到真实姓名
- `overlap_merge_transcribe.py` — 使用重叠合并的分块转录（远程 API 后备方案）
- `generate_audit_html.py` — 根据 speaker-transcribe CSV 输出构建自包含的 HTML 审核/审阅页面

**参考资料：**
- `decoupled_speaker_alignment.md` — 默认架构：为何解耦、对齐算法、可信度信号、失败模式
- `speaker_diarization.md` — 生产环境陷阱：过度分段、麦克风声学域效应、何时不应信任标签；旧版级联方案说明
- `voiceprint_speaker_id.md` — CAM++ 说话人识别：注册/匹配、阈值与差值门控、声学域注意事项、引导过程
- `local_mlx_guide.md` — 性能基准、max_tokens 截断、模型兼容性
- `whisper_word_timestamps.md` — mlx-whisper 单词时间信息：默认流水线中的时间信息分支；独立的字幕/音视频对齐方法
- `overlap_merge_strategy.md` — 为何简单分块会失败、模糊合并算法