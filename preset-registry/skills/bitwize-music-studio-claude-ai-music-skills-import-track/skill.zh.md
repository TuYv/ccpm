---
name: import-track
description: Moves track markdown files to the correct album location. Use when the user has track files in Downloads or other locations that need to be placed in an album.
argument-hint: <file-path> <album-name> [track-number]
model: haiku
allowed-tools:
  - Read
  - Bash
  - Glob
  - bitwize-music-mcp
---
## 你的任务

**输入**：$ARGUMENTS

根据配置将曲目 Markdown 文件（.md）导入到正确的专辑位置。

---

# 导入曲目技能

你需要将曲目 Markdown 文件移动到用户内容目录中的正确位置。

## 第 1 步：解析参数

预期格式：`<file-path> <album-name> [track-number]`

示例：
- `~/Downloads/track.md sample-album 03`
- `~/Downloads/t-day-beach.md sample-album 03`
- `~/Downloads/03-t-day-beach.md sample-album`（文件名中已包含编号）

如果缺少参数，请询问：
```
Usage: /import-track <file-path> <album-name> [track-number]

Example: /import-track ~/Downloads/track.md sample-album 03
```

## 第 2 步：通过 MCP 查找专辑并解析路径

1. 调用 `find_album(album_name)`——根据名称、slug 或部分名称进行模糊匹配。返回包括流派在内的专辑元数据。
2. 调用 `resolve_path("tracks", album_slug)`——返回完整的曲目目录路径

如果未找到专辑，MCP 会返回可用专辑：
```
Error: Album "{album-name}" not found.

Available albums:
[list from MCP response]

Create album first with: /new-album {album-name} <genre>
```

## 第 4 步：构建目标路径

目标路径**始终**为：

```
{content_root}/artists/{artist}/albums/{genre}/{album}/tracks/{XX}-{track-name}.md
```

示例参数：
- `content_root: ~/bitwize-music`
- `artist: bitwize`
- `genre: electronic`（从专辑位置中找到）
- `album: sample-album`
- `track-number: 03`
- `track-name: t-day-beach`

结果：
```
~/bitwize-music/artists/bitwize/albums/electronic/sample-album/tracks/03-t-day-beach.md
```

**曲目编号**：
- 如果提供了曲目编号，则使用该编号（补零：`03`）
- 如果文件名已有编号前缀（例如 `03-name.md`），则保留该编号
- 如果两者都没有，则询问用户曲目编号

## 第 5 步：移动文件

```bash
mv "{source_file}" "{target_path}"
```

## 第 6 步：确认

报告：
```
Moved: {source_file}
   To: {target_path}
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

**未找到专辑：**
```
Error: Album "{album-name}" not found.
Create it first with: /new-album {album-name} <genre>
```

**曲目已存在：**
```
Warning: Track already exists at destination.
Overwrite? (The original was not moved)
```

---

## 示例

```
/import-track ~/Downloads/t-day-beach.md sample-album 03
```

配置内容为：
```yaml
paths:
  content_root: ~/bitwize-music
artist:
  name: bitwize
```

找到的专辑位于：`~/bitwize-music/artists/bitwize/albums/electronic/sample-album/`

结果：
```
Moved: ~/Downloads/t-day-beach.md
   To: ~/bitwize-music/artists/bitwize/albums/electronic/sample-album/tracks/03-t-day-beach.md
```

---

## 常见错误

### ❌ 不要：手动读取配置并搜索专辑

**错误：**
```bash
cat ~/.bitwize-music/config.yaml
find . -name "README.md" -path "*albums/$album_name*"
```

**正确：**
```
# Use MCP to find album and resolve path
find_album(album_name) → returns album metadata with genre
resolve_path("tracks", album_slug) → returns full tracks directory path
```

**为什么重要：** MCP 可通过单次调用完成配置读取、模糊匹配和路径解析。

### ❌ 不要：忘记 tracks/ 子目录

**错误的目标位置：**
```
{album_path}/01-track.md
# Example: ~/bitwize-music/artists/bitwize/albums/electronic/sample-album/01-track.md
```

**正确的目标位置：**
```
{album_path}/tracks/01-track.md
# Example: ~/bitwize-music/artists/bitwize/albums/electronic/sample-album/tracks/01-track.md
```

**为什么重要：** 曲目始终应放在专辑文件夹内的 `tracks/` 子目录中。

### ❌ 不要：跳过曲目编号验证

**错误做法：**
```bash
# Not validating track number format
mv track.md {album_path}/tracks/$track_num-track.md
# Could result in: 3-track.md instead of 03-track.md
```

**正确做法：**
```bash
# Ensure zero-padding
track_num=$(printf "%02d" $track_num)
mv track.md {album_path}/tracks/$track_num-track.md
# Results in: 03-track.md
```

**为什么重要：** 曲目编号必须用零补齐（01、02、03……），以确保正确排序。

### ❌ 不要：未经搜索就假定专辑位置

**错误做法：**
```bash
# Guessing album is in electronic genre
mv track.md ~/music-projects/artists/bitwize/albums/electronic/sample-album/tracks/
```

**正确做法：**
```
# Use MCP to find the album (handles genre resolution)
find_album(album_name) → returns album metadata including genre and path
```

**为什么重要：** 专辑按流派整理。`find_album` 会自动解析流派。