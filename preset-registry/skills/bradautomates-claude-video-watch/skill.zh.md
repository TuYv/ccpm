---
name: watch
version: "0.2.0"
description: Watch a video (URL or local path). Downloads with yt-dlp, extracts auto-scaled frames with ffmpeg, pulls the transcript from captions (or Whisper API fallback), and hands the result to Claude so it can answer questions about what's in the video.
argument-hint: "<video-url-or-path> [question]"
allowed-tools: Bash, Read, AskUserQuestion
homepage: https://github.com/bradautomates/claude-video
repository: https://github.com/bradautomates/claude-video
author: bradautomates
license: MIT
user-invocable: true
---
# /watch

你没有视频输入；此技能会为你提供视频输入。Python 脚本会先获取字幕，并可选择下载视频、将帧提取为 JPEG（感知场景，或在 `efficient` 详细程度下快速提取关键帧）、获取带时间戳的文字稿（优先使用原生字幕，然后使用 Whisper API 作为后备方案），并输出帧路径。然后，你需要对每个帧路径使用 `Read` 来查看图像，并将其与文字稿结合起来回答用户。

## 解析 `SKILL_DIR`（在执行任何命令之前完成此操作）

以下每条 `python3 ...` 命令都会运行 `SKILL_DIR/scripts/` 下的捆绑脚本。将 `SKILL_DIR` 设置为**包含你刚刚通过 Read 读取的这个 SKILL.md 的目录的绝对路径**——你的运行框架已在 Read 结果中告知你该路径。无论采用何种安装布局，这些脚本始终是此文件的直接同级内容（`SKILL_DIR/scripts/watch.py`）：

```
Read ~/.claude/plugins/cache/claude-video/watch/<ver>/skills/watch/SKILL.md → SKILL_DIR=…/skills/watch
Read ~/.codex/skills/watch/SKILL.md                                          → SKILL_DIR=~/.codex/skills/watch
Read ~/.agents/skills/watch/SKILL.md                                         → SKILL_DIR=~/.agents/skills/watch
```

在每条命令中，使用该字面路径替换 `${SKILL_DIR}`。此方式适用于所有运行框架（Claude Code、Codex、Cursor、Gemini CLI，……），无需依赖任何特定于运行框架的环境变量。每次运行开始时执行一次防护检查：

```bash
SKILL_DIR="<absolute path of the directory containing the SKILL.md you Read>"
if [ ! -f "$SKILL_DIR/scripts/watch.py" ]; then
  echo "ERROR: scripts/watch.py not found under SKILL_DIR=$SKILL_DIR" >&2
  echo "Re-check the directory of the SKILL.md you Read and substitute it as SKILL_DIR." >&2
  exit 1
fi
```

## 第 0 步——设置预检（每次调用 `/watch` 时都会运行，成功时不输出任何内容）

**Python 解释器：**此技能中的每条 `python3 ...` 命令均适用于 macOS/Linux。在 **Windows** 上，请替换为 `python`——Windows 上的 `python3` 命令是 Microsoft Store 存根，无法运行该脚本。

在会话中首次调用 `/watch` 时，使用结构化预检，以便检测首次运行设置：

```bash
python3 "${SKILL_DIR}/scripts/setup.py" --json
```

根据以下两个字段进行分支处理：

- **`can_proceed: true` 且 `first_run: false`** → 设置已经完成（用户可能有意跳过了 Whisper 密钥——这是允许的）。无需说明，直接进入第 1 步。
- **`first_run: true`** → 确实是首次设置。按以下顺序执行：
  1. 如果 `missing_binaries` 非空，请先运行安装程序（它会在 macOS 上自动安装／在其他平台上输出命令——见下文），并确认二进制文件已正确安装。**不要跳过此步骤直接进入偏好设置。**
  2. 如有必要，再运行一次安装程序，使其搭建 `~/.config/watch/.env`（仅当文件不存在时才会写入模板，因此请先让它创建文件，*然后*再向其中写入任何值）。
  3. 鼓励用户提供 Whisper API 密钥，并询问下方的观看偏好问题，然后将所选值写入 `~/.config/watch/.env`，并设置 `SETUP_COMPLETE=true`。
- **`can_proceed: false` 且 `first_run: false`** → 之前已完成设置，但环境发生了退化（例如操作系统变更后出现 `missing_binaries`）。运行安装程序进行修复，然后继续。不要再次询问偏好设置。

缺少 Whisper 密钥是*建议修复的问题，而不是必需条件*：在真正的首次运行中，即使二进制文件已存在，`status` 也会显示 `needs_key`——这表示你应该建议用户配置密钥，而不是将其视为阻塞条件。

在同一会话中后续调用 `/watch` 时，请使用静默检查：

```bash
python3 "${SKILL_DIR}/scripts/setup.py" --check
```

这是一次耗时不到 100ms 的查询。退出码 0 表示 /watch 可以运行——这**包括已完成设置但未配置 Whisper 密钥的用户**（允许无密钥运行）。退出码为 0 时，脚本**不会输出任何内容**——直接进入步骤 1，无须说明。**不要向用户宣布“设置已完成”**——他们不需要每次交互都收到状态消息。步骤 0 唯一允许向用户显示的输出，是需要采取修复措施时的提示。

退出码非零时，按照下表处理：

| 退出码 | 含义 | 操作 |
|------|---------|--------|
| `2` | 缺少二进制文件（`ffmpeg` / `ffprobe` / `yt-dlp`） | 运行安装程序 |
| `3` | 真正的首次运行且没有 Whisper API 密钥 | 运行安装程序以搭建 `.env`，然后建议配置密钥（用户可以拒绝——使用 `--no-whisper` 继续） |
| `4` | 两者都缺少 | 运行安装程序，然后建议配置密钥 |

退出码 `3` 仅会在用户完成设置之前出现。一旦写入 `SETUP_COMPLETE=true`，无密钥安装也会返回退出码 0，且不会再次提醒。

安装程序具有幂等性——可安全地重复运行：

```bash
python3 "${SKILL_DIR}/scripts/setup.py"
```

在安装了 Homebrew 的 macOS 上，它会自动安装 `ffmpeg` 和 `yt-dlp`。在 Linux/Windows 上，它会输出用户需要运行的确切安装命令。它会搭建 `~/.config/watch/.env`，其中包含已注释的占位符和默认观看设置，并将权限设为 `0600`。

**如果安装后仍缺少 API 密钥：**使用 `AskUserQuestion` 询问用户是否有 Groq API 密钥（首选——更便宜、更快）或 OpenAI 密钥。然后将其写入 `~/.config/watch/.env`——设置对应的 `GROQ_API_KEY=...` 或 `OPENAI_API_KEY=...` 行。如果用户不想设置 Whisper，则使用 `--no-whisper` 继续，并告知他们，没有原生字幕的视频将只返回帧。

**首次运行时的观看偏好：**安装程序搭建 `~/.config/watch/.env` 后，使用 `AskUserQuestion` 询问一个问题：

- 默认详细程度（单一档位）。请严格按照以下从最轻量到最重量的顺序将这些选项作为 `AskUserQuestion` 选项呈现，并保留 `balanced` 上的 `(recommended)`，即使它不是第一个选项（**不要**为了将推荐选项放在首位而重新排序）：
  - `transcript`——完全不提取帧，仅提供转录文本（存在字幕时跳过视频下载）。
  - `efficient`——快速关键帧处理（上限 50）。
  - `balanced` (recommended)——场景感知帧（上限 100，默认值）。
  - `token-burner`——场景感知，不设上限（最高保真度；token 成本较高）。

通过将未加修饰的键单独设置在一行中，把答案直接写入 `~/.config/watch/.env`——**不要添加尾随的行内注释**（值后面的 `# note` 可能导致解析失败）：

```bash
WATCH_DETAIL=balanced
```

使用用户选择的值。如果用户跳过该问题，则保留推荐的默认值。依赖项、API 密钥选择和此偏好均处理完毕后，在同一文件中写入或更新 `SETUP_COMPLETE=true`。当 `SETUP_COMPLETE=true` 时，不要再次询问此偏好问题。

**结构化模式（可选）：** `python3 "${SKILL_DIR}/scripts/setup.py" --json` 会输出 `{status, can_proceed, first_run, setup_complete, missing_binaries, whisper_backend, has_api_key, config_file, watch_detail, platform}`，其中 `status` 是 `ready | needs_install | needs_key | needs_install_and_key` 之一。`status` 描述的是*理想*状态（建议设置密钥，因此首次无密钥运行时会显示 `needs_key`）；`can_proceed` 是操作门槛（二进制文件存在，并且已设置密钥或已完成设置）。根据 `can_proceed`/`first_run` 决定是否运行；使用 `status` 决定应建议用户执行什么操作。

在同一个会话中，后续调用 `/watch` 时可以跳过步骤 0——一旦 `--check` 返回 0，各轮对话之间的环境就不会发生变化。

## 何时使用

- 用户粘贴视频 URL（YouTube、Vimeo、X、TikTok、Twitch 剪辑，以及大多数 yt-dlp 支持的网站）并询问相关问题。
- 用户指向本地视频文件（`.mp4`、`.mov`、`.mkv`、`.webm` 等）并询问相关问题。
- 用户输入 `/watch <url-or-path> [question]`。

## 建议限制

- **为了获得最佳准确度，视频应短于 10 分钟。** 帧覆盖率与视频时长成反比。
- **通用速率上限：2 fps。** 即使预算或 `--fps` 意味着可以使用更高的速率，脚本的采样速度也绝不会超过 2 fps。
- **帧数上限由详细程度模式设置**（`~/.config/watch/.env` 中的 `WATCH_DETAIL`，或 `--detail`），而不是使用单一的全局上限：
  - `transcript` → 不提取帧
  - `efficient` → 最多 **50** 帧（关键帧）
  - `balanced`（默认）→ 最多 **100** 帧（场景感知）
  - `token-burner` → **无上限**（场景感知；超过 250 帧时会输出温和警告）
  - `--max-frames N` 会覆盖当前模式原本使用的上限。
- **按时长设置完整视频的帧预算。** Token 成本会随帧数增长，因此脚本会根据时长设定目标预算。该预算决定 fps 和均匀采样的回退方案；场景感知选择最多可以填充到上述详细程度上限或预算上限，以较低者为准：
  - ≤30 秒 → 约 12-30 帧
  - 30 秒-1 分钟 → 约 40 帧
  - 1-3 分钟 → 约 60 帧
  - 3-10 分钟 → 约 80 帧
  - \>10 分钟 → 最多达到详细程度上限，帧间隔较稀疏（会输出警告）
- 如果用户提供了一个较长的视频，在消耗 token 进行稀疏扫描之前，可以考虑询问他们是否希望查看某个特定片段。

## 如何调用

**步骤 1——解析用户输入。** 将视频来源（URL 或路径）与用户提出的问题分开。例如：`/watch https://youtu.be/abc what language is this in?` → 来源 = `https://youtu.be/abc`，问题 = `what language is this in?`。

**步骤 2——运行 watch 脚本。** 原样传递来源。除了常规加引号外，不要自行对其进行 shell 转义：

```bash
python3 "${SKILL_DIR}/scripts/watch.py" "<source>"
```

可选标志：
- `--detail transcript|efficient|balanced|token-burner` —— 保真度/速度调节选项。`transcript` = 不提取帧（仅转录；存在字幕时跳过视频下载）；`efficient` = 快速提取关键帧（上限 50）；`balanced` = 提取场景感知帧（上限 100）；`token-burner` = 场景感知，无上限。
- `--start T` / `--end T` —— 聚焦于某个片段。接受 `SS`、`MM:SS` 或 `HH:MM:SS`。设置任一参数时，fps 会自动调整得更密集（请参阅下文的“聚焦于某个片段”）。
- `--timestamps T1,T2,…` —— 在每个指定的绝对时间戳处抓取一帧（`SS`、`MM:SS` 或 `HH:MM:SS`）。阅读转录文本后，可使用此选项捕获演示者通过指示语标出的时刻（“看这里”“如你所见”“注意这一点”），因为仅靠视觉选择可能会遗漏这些时刻。请参阅下文的“转录提示帧”。
- `--max-frames N` —— 覆盖预设上限，以进一步收紧 token 预算（例如 `--max-frames 40`）
- `--resolution W` —— 更改帧宽度（以 px 为单位，默认为 512；仅当用户需要阅读屏幕文字时才提高到 1024）
- `--fps F` —— 覆盖自动 fps（最高限制为 2 fps）
- `--out-dir DIR` —— 将工作文件保存在指定位置（默认：自动生成的临时目录）
- `--whisper groq|openai` —— 强制使用特定的 Whisper 后端（默认：如果两种密钥都存在，则优先使用 Groq）
- `--no-whisper` —— 完全禁用 Whisper 回退（如果没有字幕，则仅提取帧）
- `--no-dedup` —— 保留近似重复的帧。默认情况下，帧差异处理会丢弃与前一个保留帧在视觉上几乎相同的帧（长时间停留的幻灯片、静态屏幕录制、暂停的视频），以便将帧预算用于不同的内容；报告中的 **Frames** 行会注明丢弃了多少帧。仅当用户需要每个采样帧时才传递此选项（例如，判断细微的逐帧运动）。

### 聚焦某个片段（更高帧率）

当用户询问某个特定时刻时——“2 分钟处发生了什么？”、“放大查看 0:45 到 1:00”、“前 10 秒”——传入 `--start` 和/或 `--end`。脚本会切换到聚焦模式的帧数预算，该预算比完整视频模式更密集（仍以 2 fps 为上限，并且仍受细节模式上限约束——以下帧数假设采用默认的 `balanced` 上限 100；`efficient` 的上限为 50）：

- ≤5 秒 → 2 fps（最多 10 帧）
- 5-15 秒 → 2 fps（最多 30 帧）
- 15-30 秒 → ~2 fps（最多 60 帧）
- 30-60 秒 → ~1.3 fps（最多 80 帧）
- 60-180 秒 → ~0.6 fps（100 帧，达到上限）

聚焦模式适用于：
- 用户明确指出的任何时刻/范围（“2:30 左右”、“开场部分”、“最后 30 秒”）。
- 任何长度超过约 10 分钟、且用户的问题针对某个特定部分的视频——对相关片段运行聚焦模式，远比稀疏扫描整个视频有用。
- 完整扫描后发现某个区域的细节不足，需要重新运行。

转录文本会自动筛选至相同范围。帧时间戳是绝对时间（即真实的视频时间线，而不是相对于起始位置的偏移时间）。

示例：
```bash
# Last 10 seconds of a 1 minute video
python3 "${SKILL_DIR}/scripts/watch.py" video.mp4 --start 50 --end 60

# Zoom into 2:15 → 2:45 at 2 fps (60 frames)
python3 "${SKILL_DIR}/scripts/watch.py" "$URL" --start 2:15 --end 2:45 --fps 2

# From 1h12m to the end of the video
python3 "${SKILL_DIR}/scripts/watch.py" "$URL" --start 1:12:00
```

**第 3 步——读取脚本列出的每个帧路径。** Read 工具会直接将 JPEG 渲染为图像供你查看。在一条消息中读取所有帧（并行工具调用），以便同时查看它们。这些帧按时间顺序排列，并带有 `t=MM:SS` 时间戳，因此你可以将其与转录文本对齐。

**第 4 步——回答用户。** 现在你拥有两个证据来源：
- **帧**——每个时间戳对应的屏幕画面
- **转录文本**——每个时间戳对应的语音内容。报告的标头会显示来源（`captions` = yt-dlp 提取的原生字幕；`whisper (groq)` 或 `whisper (openai)` = 通过 API 转录）。

如果用户提出了具体问题，请直接回答并引用时间戳。如果用户没有提出任何问题，则总结视频中发生的内容——结构、关键时刻、值得注意的画面和口述内容。

这一要求同样适用于 `transcript` 细节模式：即使没有帧，也应像其他模式一样生成**摘要**——不要将完整转录文本粘贴到聊天中。综合归纳视频结构、关键时刻和口述内容并附上时间戳；仅引用重要的语句。只有当用户明确要求时，才提供原始转录文本。

**第 5 步——清理。** 脚本会在结束时输出一个工作目录。如果用户不会再就此视频提出后续问题，请使用 `rm -rf <dir>` 将其删除。如果用户可能会继续提问，则保留该目录。

## 细节和帧

默认行为来自 `~/.config/watch/.env`：

- `WATCH_DETAIL=transcript|efficient|balanced|token-burner`（默认值：`balanced`）

在 `transcript` 详细程度下，仅凭字幕即可生成报告，无需下载视频。如果没有字幕，脚本只会下载音频并尝试使用 Whisper。如果无法生成转录文本，脚本会明确报告这一限制；可使用 `--detail balanced` 重新运行以提取帧。

在 `efficient` 详细程度下，脚本会下载视频并**仅提取关键帧**（`ffmpeg -skip_frame nokey`）——这是一种近乎即时的处理方式，可在场景切换处提取帧。如果某个片段的关键帧少于 4 个，则会回退到均匀采样。

在 `balanced` / `token-burner` 详细程度下，脚本会提取**场景感知**帧：首先使用 ffmpeg 进行场景变化选择，仅当视频实际上处于静止状态时才回退到均匀采样。`balanced` 最多提取 100 帧；`token-burner` 不设上限。帧报告中的每一行都包含时间戳和选择原因。为兼容 Claude Read，提取的图像高度会限制为最多 1998px。

## 转录提示帧

视觉帧选择（场景帧/关键帧）可能会错过演示者明确提示的时刻——“看这里”“如你所见”“注意这里”“看看接下来会发生什么”——因为指向幻灯片时的视觉变化通常*很小*。`--timestamps` 允许你强制提取这些确切时刻的帧。由**你**通过阅读转录文本来决定哪些时刻重要：

1. 首先使用 `--detail transcript`（或任意详细程度）运行一次，以获取带时间戳的转录文本。
2. 扫描其中的指示性提示——即说话者引导观众关注屏幕上某些内容的短语。这需要主观判断（应忽略“听着，重点是……”这类修辞性表达）；因此这项工作由你完成，而不是由正则表达式完成。
3. 使用 `--timestamps 4:32,7:10,9:55`（绝对源时间）重新运行。对于 URL，第二次运行时应指向工作目录中**已下载的本地文件**，以避免重复下载。

行为：
- **默认采用追加方式。** 提示帧（`reason=transcript-cue`）会按时间顺序合并到 `--detail` 已选择的帧中。
- **固定保留并优先计数。** 在详细程度引擎运行前，会先从帧数上限中为提示帧预留名额，因此即使进行均匀采样，它们也绝不会被剔除。
- **遵循聚焦模式。** 使用 `--start/--end` 时，窗口之外的任何提示时间戳都会被丢弃（并在摘要中报告）。时间坐标始终是绝对源时间。
- **仅提示帧。** `--detail transcript --timestamps …` 会跳过场景帧/关键帧采样，并且*只*返回提示帧（由于帧需要像素数据，因此仍会下载视频）。

## 转录

脚本通过以下两种方式之一获取带时间戳的转录文本：

1. **原生字幕（免费，优先使用）。** 如果源平台提供人工字幕或自动生成的字幕，yt-dlp 会将其拉取下来。
2. **Whisper API 回退方案。** 如果未获取到字幕（或来源是本地文件），脚本会提取音频（`ffmpeg -vn -ac 1 -ar 16000 -b:a 64k`，约 0.5 MB/分钟），并将其上传到已配置密钥的 Whisper API：
   - **Groq** — `whisper-large-v3`。首选默认项：更便宜、更快。可在 console.groq.com/keys 获取密钥。
   - **OpenAI** — `whisper-1`。回退选项。可在 platform.openai.com/api-keys 获取密钥。

两个密钥都位于 `~/.config/watch/.env` 中。当两者都已设置时，脚本优先使用 Groq；可通过 `--whisper openai` 强制使用 OpenAI。使用 `--no-whisper` 可完全跳过回退方案。

## 失败模式与处理方式

- **设置预检失败** → 运行 `python3 "${SKILL_DIR}/scripts/setup.py"`（在 macOS 上通过 brew 自动安装 ffmpeg/yt-dlp，并创建 `.env` 的基本结构）。对于 API 密钥，通过 `AskUserQuestion` 询问用户，并将其写入 `~/.config/watch/.env`。
- **没有可用的转录文本** → 缺少字幕，并且（没有 Whisper 密钥或 Whisper API 调用失败）。脚本会输出一条指向设置流程的提示。继续仅使用帧进行处理，并告知用户。
- **输出了长视频警告** → 在回答中说明已注意到该警告。建议通过 `--start`/`--end` 聚焦于特定片段后重新运行，而不是对整个视频进行稀疏扫描。
- **下载失败** → yt-dlp 的错误会输出到 stderr。如果视频需要登录或存在地区限制，请直接告知用户；不要持续重试。
- **Whisper 请求失败** → 错误会输出到 stderr（可能原因：密钥无效或达到速率限制）。超过 API 25 MB 上传上限的音频会被拆分成多个分块并自动转录，因此不会仅因长度而失败；如果某些分块失败，转录文本将不完整，且被丢弃的分块会在 stderr 中注明。只有当所有分块均失败时，报告才会显示 "none available"。如果 Groq 失败，可以使用 `--whisper openai` 重试（反之亦然）。

## Token 效率

此技能消耗的 Token 主要来自帧。大致数量级如下：
- 80 个宽度为 512px 的帧大约需要 50-80k 个图像 Token，具体取决于宽高比。
- 转录文本的成本很低（对于 10 分钟的视频，最多只需几千个 Token）。
- 将 `--resolution` 提高到 1024 会使每帧的图像 Token 数量大致增加到四倍。仅在必要时这样做。

如果你在当前会话中已经看过某个视频，而用户又提出后续问题，**不要**重新运行脚本——帧和转录文本已经在上下文中。直接根据现有内容回答即可。

## 安全与权限

**此技能执行的操作：**
- 在本地运行 `yt-dlp` 以下载视频，并在来源支持时提取原生字幕（公开数据；请求会直接发送到 URL 所指向的主机）
- 在本地运行 `ffmpeg` / `ffprobe`，将帧提取为 JPEG；需要 Whisper 时，还会提取单声道 16 kHz 音频片段
- 设置 `GROQ_API_KEY` 时，将提取的音频片段发送到 Groq 的 Whisper API（`api.groq.com/openai/v1/audio/transcriptions`）（首选——成本更低、速度更快）
- 已设置 `OPENAI_API_KEY` 且未设置 Groq 时，或强制使用 `--whisper openai` 时，将提取的音频片段发送到 OpenAI 的音频转录 API（`api.openai.com/v1/audio/transcriptions`）
- 将下载的视频、帧、音频和中间转录文本写入系统临时目录下的工作目录（如果指定了 `--out-dir`，则写入该目录），以便 Claude 可以对其执行 `Read`
- 读取/创建 `~/.config/watch/.env`（权限模式为 `0600`），用于存储 Whisper API 密钥和 `SETUP_COMPLETE` 标记。作为回退方案，还会读取当前工作目录中的 `.env`

**此技能不会执行以下操作：**
- 不会将视频本身上传至任何 API——只有提取出的音频会被发送，并且仅在缺少原生字幕且未使用 `--no-whisper` 禁用 Whisper 时才会发送
- 不会访问任何平台账户（不登录、不使用会话 Cookie、不发布内容）——yt-dlp 始终只请求公开数据
- 不会在提供商之间共享 API 密钥（Groq 密钥仅发送至 `api.groq.com`，OpenAI 密钥仅发送至 `api.openai.com`）
- 不会将 API 密钥记录、缓存或写入 stdout、stderr 或输出文件
- 不会在工作目录和 `~/.config/watch/.env` 之外持久化任何内容——完成后请清理工作目录（步骤 5）

**捆绑脚本：** `scripts/watch.py`（入口点）、`scripts/download.py`（yt-dlp 封装器）、`scripts/frames.py`（ffmpeg 帧提取）、`scripts/transcribe.py`（字幕选择 + Whisper 编排）、`scripts/whisper.py`（Groq / OpenAI 客户端）、`scripts/setup.py`（预检 + 安装程序）

首次使用前请审查脚本以验证其行为。