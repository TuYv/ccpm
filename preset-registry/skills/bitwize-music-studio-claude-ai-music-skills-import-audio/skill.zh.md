---
name: import-audio
description: Moves audio files to the correct album location with proper path structure. Use when the user has downloaded WAV files from Suno or other sources that need to be organized.
argument-hint: <file-path> <album-name> [track-slug]
model: haiku
allowed-tools:
  - Read
  - Bash
  - bitwize-music-mcp
---
## 你的任务

**输入**：$ARGUMENTS

根据配置将音频文件（WAV、MP3 等）导入正确的专辑位置。

---

# 导入音频 Skill

你需要将音频文件移动到用户音频目录中的正确位置。

## 第 1 步：解析参数

预期格式：`<file-path> <album-name> [track-slug]`

`track-slug` 是可选的——仅在导入分轨压缩包且无法根据文件名推断曲目时才需要。

示例：
- `~/Downloads/track.wav sample-album`
- `~/Downloads/03-t-day-beach.wav sample-album`
- `~/Downloads/stems.zip sample-album 01-first-taste`

如果缺少参数，请询问：
```
Usage: /import-audio <file-path> <album-name> [track-slug]

Examples:
  /import-audio ~/Downloads/track.wav sample-album
  /import-audio ~/Downloads/stems.zip sample-album 01-first-taste
```

## 第 2 步：通过 MCP 解析音频路径

1. 调用 `resolve_path("audio", album_slug)`——返回完整的音频目录路径
2. 解析后的路径采用镜像结构：`{audio_root}/artists/{artist}/albums/{genre}/{album}/`

结果示例：`~/bitwize-music/audio/artists/bitwize/albums/hip-hop/sample-album/`

**关键要求**：始终使用 `resolve_path`——切勿手动构造路径。

## 第 3 步：检测文件类型

检查文件扩展名，并确定它是否为分轨压缩包：

| 文件类型 | 操作 |
|-----------|--------|
| `.wav`、`.mp3`、`.flac`、`.ogg`、`.m4a` | 移动到专辑音频目录（第 4 步） |
| `.zip`（分轨） | 解压到每首曲目各自的分轨子文件夹（第 4b 步） |

**如何识别分轨压缩包**：用户会提到“stems”，或者压缩包中包含类似 `0 Lead Vocals.wav`、`1 Backing Vocals.wav` 等文件。

## 第 4 步：创建目录并移动文件

```bash
mkdir -p {resolved_path}
mv "{source_file}" "{resolved_path}/{filename}"
```

## 第 4b 步：导入分轨压缩包

分轨文件必须放入每首曲目各自的子文件夹中，以防止文件名冲突（每首曲目都会包含 `0 Lead Vocals.wav` 等文件）：

```
{resolved_path}/
  01-first-taste.wav
  02-sugar-high.wav
  stems/
    01-first-taste/
      0 Lead Vocals.wav
      1 Backing Vocals.wav
      2 Drums.wav
      ...
    02-sugar-high/
      0 Lead Vocals.wav
      1 Backing Vocals.wav
      ...
```

**工作流程：**

1. 通过以下方式之一**确定曲目 slug**：
   - 如果压缩包文件名符合曲目命名模式，则从文件名中确定（例如，`01-first-taste-stems.zip` → `01-first-taste`）
   - 用户指定曲目（例如，`/import-audio stems.zip sample-album 01-first-taste`）
   - **如果两者都没有**：询问用户这些分轨属于哪首曲目
2. **解压**到该曲目专属的子文件夹中：
   ```bash
   mkdir -p {resolved_path}/stems/{track-slug}
   unzip "{source_file}" -d "{resolved_path}/stems/{track-slug}"
   ```
3. **更新曲目元数据**：调用 `update_track_field(album_slug, track_slug, "stems", "Yes")`

**分轨参数格式**：`<zip-path> <album-name> [track-slug]`

## 第 5 步：确认

报告：
```
Moved: {source_file}
   To: {resolved_path}/{filename}
```

对于分轨：
```
Extracted stems: {source_file}
       To: {resolved_path}/stems/{track-slug}/
    Files: {count} stem files extracted
  Updated: {track-slug} stems → Yes
```

## 错误处理

**源文件不存在：**
```
Error: File not found: {source_file}
```

**配置文件缺失：**
```
Error: Config not found at ~/.bitwize-music/config.yaml
Run /configure to set up.
```

**目标位置已存在同名文件：**
```
Warning: File already exists at destination.
Overwrite? (The original was not moved)
```

---

## MP3 文件

Suno 支持下载 WAV 和 MP3 两种格式。为确保母带处理质量，**始终优先使用 WAV**。

**如果用户提供 MP3 文件：**

1. 接受该 MP3 并按正常方式导入（使用相同的路径逻辑）
2. 向用户发出警告：
```
Note: This is an MP3 file. For best mastering results, download the WAV
version from Suno instead. MP3 compression removes audio data that can't
be recovered during mastering.

If WAV isn't available, this MP3 will work but mastering quality may be limited.
```

3. 将文件导入与 WAV 文件相同的目标路径

**支持的格式：** WAV（首选）、MP3、FLAC、OGG、M4A

---

## 示例

```
/import-audio ~/Downloads/03-t-day-beach.wav sample-album
```

配置包含：
```yaml
paths:
  audio_root: ~/bitwize-music/audio
artist:
  name: bitwize
```

结果：
```
Moved: ~/Downloads/03-t-day-beach.wav
   To: ~/bitwize-music/audio/artists/bitwize/albums/hip-hop/sample-album/03-t-day-beach.wav
```

### 分轨导入示例

```
/import-audio ~/Downloads/stems.zip sample-album 01-first-taste
```

结果：
```
Extracted stems: ~/Downloads/stems.zip
       To: ~/bitwize-music/audio/artists/bitwize/albums/hip-hop/sample-album/stems/01-first-taste/
    Files: 5 stem files extracted
  Updated: 01-first-taste stems → Yes
```

---

## 常见错误

### ❌ 不要：手动读取配置并构造路径

**错误：**
```bash
cat ~/.bitwize-music/config.yaml
mv file.wav ~/music-projects/audio/artists/bitwize/albums/electronic/sample-album/
```

**正确：**
```
# Use MCP to resolve the correct path
resolve_path("audio", album_slug) → returns full path with artist folder
```

**为何重要：** `resolve_path` 会读取配置、解析变量，并自动包含艺术家文件夹。无需手动解析配置或构造路径。

### ❌ 不要：混淆 content_root 和 audio_root

**路径对比：**
- 内容：`{content_root}/artists/{artist}/albums/{genre}/{album}/`（Markdown、歌词）
- 音频：`{audio_root}/artists/{artist}/albums/{genre}/{album}/`（WAV 文件、分轨）
- 文档：`{documents_root}/artists/{artist}/albums/{genre}/{album}/`（PDF、研究资料）

使用 `resolve_path` 并传入适当的 `path_type`（"content"、"audio"、"documents"）以获取正确路径。