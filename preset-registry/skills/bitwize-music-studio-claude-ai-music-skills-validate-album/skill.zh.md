---
name: validate-album
description: Validates album directory structure, file locations, and content integrity. Use before release or whenever the user wants to check an album's structural health.
argument-hint: <album-name>
model: haiku
context: fork
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - bitwize-music-mcp
---
# 专辑验证代理

## 你的任务

**输入**：$ARGUMENTS（专辑名称，例如 `sample-album`）

验证专辑是否在正确位置包含所有必需文件，以便在路径问题和内容缺失造成影响之前发现它们。

---

## 第 1 步：加载配置并查找专辑

1. 调用 `get_config()`——返回路径（`content_root`、`audio_root`、`documents_root`）和 `artist.name`
   - 如果配置缺失，停止并报告：
     ```
     [FAIL] Config file missing: ~/.bitwize-music/config.yaml
            Run /configure to set up the plugin.
     ```

2. 调用 `find_album(album_name)`——通过名称、slug 或部分内容进行模糊匹配
   - 如果未找到，停止并报告（MCP 会返回可用专辑）：
     ```
     [FAIL] Album not found: {album-name}
     ```

3. 可选调用 `validate_album_structure(album_slug)`——运行结构验证检查并返回 `{passed, failed, warnings, skipped, issues[], checks[]}`。此 MCP 工具可通过一次调用处理目录结构、必需文件、音频位置和曲目内容检查。

**注意**：MCP `validate_album_structure` 工具会自动执行下方的许多检查。你可以直接使用其结果，也可以运行手动检查以提供更详细的报告。

---

## 第 3 步：运行验证

### 初始化计数器
- `passed = 0`
- `failed = 0`
- `warnings = 0`
- `skipped = 0`
- `issues = []`（修复命令列表）

### 输出标题
```
═══════════════════════════════════════════════════════════
ALBUM VALIDATION: {album-name}
═══════════════════════════════════════════════════════════
```

---

## 验证类别

### 配置
```
CONFIG
──────
```

| 检查项 | 通过 | 失败 |
|-------|------|------|
| 配置文件存在 | `[PASS] Config file exists` | `[FAIL] Config file missing` |
| 已定义 content_root | `[PASS] content_root: {value}` | `[FAIL] content_root not defined` |
| 已定义 audio_root | `[PASS] audio_root: {value}` | `[FAIL] audio_root not defined` |
| 已定义 artist | `[PASS] artist: {value}` | `[FAIL] artist.name not defined` |

### 专辑结构
```
ALBUM STRUCTURE
───────────────
```

| 检查项 | 方法 | 通过 | 失败 |
|-------|-----|------|------|
| 专辑目录存在 | `test -d {album_path}` | `[PASS] Album directory: {path}` | `[FAIL] Album directory missing` |
| README.md 存在 | `test -f {album_path}/README.md` | `[PASS] README.md exists` | `[FAIL] README.md missing` |
| tracks/ 目录存在 | `test -d {album_path}/tracks` | `[PASS] tracks/ directory exists` | `[FAIL] tracks/ directory missing` |
| 曲目文件存在 | `ls {album_path}/tracks/*.md` | `[PASS] {N} track files found` | `[WARN] No track files found` |

**对于纪录片专辑**（检查 README.md 中的类型）：
| 检查项 | 方法 | 通过 | 失败 |
|-------|-----|------|------|
| RESEARCH.md 存在 | `test -f {album_path}/RESEARCH.md` | `[PASS] RESEARCH.md exists` | `[WARN] RESEARCH.md missing (documentary album)` |
| SOURCES.md 存在 | `test -f {album_path}/SOURCES.md` | `[PASS] SOURCES.md exists` | `[WARN] SOURCES.md missing (documentary album)` |

### 音频文件
```
AUDIO FILES
───────────
```

预期路径：`{audio_root}/artists/{artist}/albums/{genre}/{album}/`

| 检查项 | 检查方式 | 通过 | 失败 |
|-------|-----|------|------|
| 音频目录存在（路径正确） | `test -d {audio_root}/artists/{artist}/albums/{genre}/{album}` | `[PASS] Audio directory: {path}` | 见下文 |
| 音频目录位于错误位置 | `test -d {audio_root}/{album}` | 不适用 | `[FAIL] Audio in wrong location (missing artist folder)` |

**如果音频位于错误位置**，添加到问题列表：
```
→ Expected: {audio_root}/artists/{artist}/albums/{genre}/{album}/
→ Found at: {audio_root}/{album}/ (WRONG - missing artist folder)
→ Fix: mv {audio_root}/{album}/ {audio_root}/artists/{artist}/albums/{genre}/{album}/
```

| 检查项 | 检查方式 | 通过 | 跳过 |
|-------|-----|------|------|
| 存在 WAV 文件 | `ls {audio_path}/*.wav` | `[PASS] {N} WAV files found` | `[SKIP] No audio files yet` |
| 存在 mastered/ | `test -d {audio_path}/mastered` | `[PASS] mastered/ directory exists` | `[SKIP] Not mastered yet` |

### 专辑封面
```
ALBUM ART
─────────
```

| 检查项 | 检查方式 | 通过 | 跳过 |
|-------|-----|------|------|
| 封面位于音频文件夹中 | `test -f {audio_path}/album.png` | `[PASS] album.png in audio folder` | `[SKIP] No album art yet` |
| 封面位于内容文件夹中 | `test -f {album_path}/album-art.*` | `[PASS] album-art in content folder` | `[SKIP] No album art yet` |

### 曲目
```
TRACKS
──────
```

对于 `{album_path}/tracks/*.md` 中的每个曲目文件：

1. 读取文件
2. 检查必填字段：
   - 存在 Status 字段
   - 存在 Suno Style Box（包含 `## Suno Inputs` 章节）
   - 存在 Suno Lyrics Box
   - 如果 Status 为 `Generated` 或 `Final`：存在 Suno Link
   - 如果是纪录片类型：存在 Sources Verified 状态
3. 检查 instrumental 字段同步情况：
   - 读取 frontmatter 的 `instrumental` 字段（true/false/缺失）
   - 读取 Track Details 表中的 `**Instrumental**` 行（Yes/No/缺失）
   - 如果两者都存在但不一致 → `[WARN] {filename} - Instrumental field mismatch: frontmatter={value}, table={value}`
   - 如果只设置了其中一个 → `[WARN] {filename} - Instrumental field missing from {frontmatter|table} (set in {other})`

每个曲目的输出：
- `[PASS] {filename} - Status: {status}, Suno Link: {present/missing}`
- `[WARN] {filename} - Status: {status}, missing {what}`
- `[FAIL] {filename} - No Status field`

---

## 第 4 步：摘要

```
═══════════════════════════════════════════════════════════
SUMMARY: {passed} passed, {failed} failed, {warnings} warning(s), {skipped} skipped
═══════════════════════════════════════════════════════════
```

如果存在任何问题：
```
ISSUES TO FIX:
1. {issue description}
   {fix command}
2. ...
```

---

## 输出示例

```
═══════════════════════════════════════════════════════════
ALBUM VALIDATION: sample-album
═══════════════════════════════════════════════════════════

CONFIG
──────
[PASS] Config file exists
[PASS] content_root: ~/bitwize-music
[PASS] audio_root: ~/bitwize-music/audio
[PASS] artist: bitwize

ALBUM STRUCTURE
───────────────
[PASS] Album directory: ~/bitwize-music/artists/bitwize/albums/electronic/sample-album/
[PASS] README.md exists
[PASS] tracks/ directory exists
[PASS] 5 track files found

AUDIO FILES
───────────
[FAIL] Audio directory in wrong location
       → Expected: ~/bitwize-music/audio/artists/bitwize/albums/electronic/sample-album/
       → Found at: ~/bitwize-music/audio/sample-album/
       → Fix: mv ~/bitwize-music/audio/sample-album/ ~/bitwize-music/audio/artists/bitwize/albums/electronic/sample-album/

ALBUM ART
─────────
[SKIP] No album art yet

TRACKS
──────
[PASS] 01-intro.md - Status: Final, Suno Link: present
[PASS] 02-track.md - Status: Final, Suno Link: present
[WARN] 03-t-day-beach.md - Status: Generated, Suno Link: missing

═══════════════════════════════════════════════════════════
SUMMARY: 8 passed, 1 failed, 1 warning, 1 skipped
═══════════════════════════════════════════════════════════

ISSUES TO FIX:
1. Move audio folder to include artist:
   mv ~/bitwize-music/audio/sample-album/ ~/bitwize-music/audio/artists/bitwize/albums/electronic/sample-album/
```

---

## 重要说明

1. **优先使用 MCP 工具** - 在手动检查之前使用 `get_config()`、`find_album()`、`validate_album_structure()`
2. **同时检查正确和错误的位置** - 发现放错位置的文件
3. **提供可执行的修复方案** - 包含修复问题所需的确切命令
4. **使用适当的状态** - 根据严重程度使用 PASS/FAIL/WARN/SKIP
5. **统计所有内容** - 在摘要中报告总数