---
name: import-art
description: Places album art files in the correct audio and content directory locations. Use when the user has generated or downloaded album artwork that needs to be saved.
argument-hint: <file-path> <album-name>
model: haiku
allowed-tools:
  - Read
  - Bash
  - Glob
  - bitwize-music-mcp
---
## 你的任务

**输入**：$ARGUMENTS

将专辑封面导入音频文件夹和专辑内容文件夹。

---

# 导入封面技能

你需要根据配置将专辑封面复制到两个必需的位置。

## 第 1 步：解析参数

预期格式：`<file-path> <album-name>`

示例：
- `~/Downloads/album-art.jpg sample-album`
- `~/Downloads/cover.png sample-album`

如果缺少参数，请询问：
```
Usage: /import-art <file-path> <album-name>

Example: /import-art ~/Downloads/album-art.jpg sample-album
```

## 第 2 步：通过 MCP 查找专辑并解析路径

1. 调用 `find_album(album_name)`——进行模糊匹配，返回包括流派在内的专辑元数据
2. 调用 `resolve_path("audio", album_slug)`——返回音频目录路径
3. 调用 `resolve_path("content", album_slug)`——返回内容目录路径

如果未找到专辑：
```
Error: Album "{album-name}" not found.
Create it first with: /new-album {album-name} <genre>
```

## 第 3 步：构造目标路径

**需要两个目标位置**（路径来自 MCP `resolve_path` 调用）：

1. **音频文件夹**（用于平台发布/母带处理）：`{audio_path}/album.png`
2. **内容文件夹**（用于文档）：`{content_path}/album-art.{ext}`

**关键**：`resolve_path` 会自动包含艺术家文件夹。

## 第 4 步：创建目录并复制文件

```bash
# Create audio directory (includes artist folder!)
mkdir -p {audio_root}/artists/{artist}/albums/{genre}/{album}

# Copy to audio folder as album.png
cp "{source_file}" "{audio_root}/artists/{artist}/albums/{genre}/{album}/album.png"

# Copy to content folder preserving extension
cp "{source_file}" "{content_root}/artists/{artist}/albums/{genre}/{album}/album-art.{ext}"
```

## 第 5 步：确认

报告：
```
Album art imported for: {album-name}

Copied to:
1. {audio_root}/artists/{artist}/albums/{genre}/{album}/album.png (for platforms)
2. {content_root}/artists/{artist}/albums/{genre}/{album}/album-art.{ext} (for docs)
```

## 错误处理

**源文件不存在：**
```
Error: File not found: {source_file}
```

**缺少配置文件：**
```
Error: Config not found at ~/.bitwize-music/config.yaml
Run /configure to set up.
```

**未找到专辑：**
```
Error: Album "{album-name}" not found.
Create it first with: /new-album {album-name} <genre>
```

**不是图像文件：**
```
Warning: File doesn't appear to be an image: {source_file}
Expected: .jpg, .jpeg, .png, .webp

Continue anyway? (y/n)
```

---

## 示例

```
/import-art ~/Downloads/sample-album-cover.jpg sample-album
```

配置内容为：
```yaml
paths:
  content_root: ~/bitwize-music
  audio_root: ~/bitwize-music/audio
artist:
  name: bitwize
```

专辑位于：`~/bitwize-music/artists/bitwize/albums/electronic/sample-album/`

结果：
```
Album art imported for: sample-album

Copied to:
1. ~/bitwize-music/audio/artists/bitwize/albums/electronic/sample-album/album.png (for platforms)
2. ~/bitwize-music/artists/bitwize/albums/electronic/sample-album/album-art.jpg (for docs)
```

---

## 常见错误

### ❌ 不要：手动读取配置并构造路径

**错误做法：**
```bash
cat ~/.bitwize-music/config.yaml
cp art.png ~/music-projects/audio/sample-album/
```

**正确做法：**
```
# Use MCP to find album and resolve both paths
find_album(album_name) → returns album metadata
resolve_path("audio", album_slug) → audio path with artist folder
resolve_path("content", album_slug) → content path with genre
```

**为什么这很重要：** `resolve_path` 会自动处理配置读取、艺术家文件夹和流派解析。

### ❌ 不要：只将封面放在一个位置

**错误做法：**
```bash
# Only copying to audio folder
cp art.png {audio_root}/artists/{artist}/albums/{genre}/{album}/album.png
# Missing: content folder copy
```

**正确做法：**
```bash
# Copy to BOTH locations
# 1. Audio location (for streaming platforms)
cp art.png {audio_root}/artists/{artist}/albums/{genre}/{album}/album.png
# 2. Content location (for documentation)
cp art.jpg {album_path}/album-art.jpg
```

**为什么这很重要：** 专辑封面需要同时存放在两个位置——音频文件夹用于发行，内容文件夹用于文档。

### ❌ 不要：混淆文件名

**错误做法：**
```bash
# Using same filename in both locations
cp art.png {audio_root}/artists/{artist}/albums/{genre}/{album}/album-art.png
cp art.png {album_path}/album.png
```

**正确的命名方式：**
```
Audio location: album.png (or album.jpg)
Content location: album-art.jpg (or album-art.png)
```

**为什么这很重要：** 不同位置采用不同的命名约定，以避免混淆。

### ❌ 不要：手动搜索专辑

**错误做法：**
```bash
find . -name "README.md" -path "*albums/$album_name*"
```

**正确做法：**
```
find_album(album_name) → returns album data including path and genre
```

### ❌ 不要：忘记创建目录

**错误做法：**
```bash
# Copying without ensuring directory exists
cp art.png {audio_root}/artists/{artist}/albums/{genre}/{album}/album.png
# Fails if directory doesn't exist
```

**正确做法：**
```bash
# Create directory first
mkdir -p {audio_root}/artists/{artist}/albums/{genre}/{album}/
cp art.png {audio_root}/artists/{artist}/albums/{genre}/{album}/album.png
```

**为什么这很重要：** 音频目录可能尚不存在，尤其是对于新专辑。