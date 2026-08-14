---
name: clipboard
description: Copies track content (lyrics, style prompts, streaming lyrics) to the system clipboard. Use when the user needs to paste lyrics or style prompts into Suno or other external tools.
argument-hint: <content-type> <album-name> <track-number>
model: haiku
allowed-tools:
  - Read
  - Bash
  - bitwize-music-mcp
---
## 你的任务

**输入**：$ARGUMENTS

将曲目文件中的内容复制到系统剪贴板，以便粘贴到 Suno 或其他工具中。

---

# 剪贴板技能

将曲目文件中的特定部分直接复制到剪贴板。

## 第 1 步：检测平台并检查剪贴板工具

运行检测：

```bash
if command -v pbcopy >/dev/null 2>&1; then
  echo "macOS"
elif command -v clip.exe >/dev/null 2>&1; then
  # clip.exe is a built-in Windows utility (System32). Reachable both from WSL
  # via interop and from a native-Windows shell such as Git Bash, so this one
  # branch covers both. Verified on a windows-latest runner: Git Bash present,
  # clip.exe resolved at /c/Windows/system32/clip.exe, copy round-tripped.
  echo "Windows/WSL"
elif command -v xclip >/dev/null 2>&1; then
  echo "Linux-xclip"
elif command -v xsel >/dev/null 2>&1; then
  echo "Linux-xsel"
else
  echo "NONE"
fi
```

**如果为 NONE：**

```
Error: No clipboard utility found.

Install instructions:
- macOS: pbcopy (built-in)
- Linux: sudo apt install xclip
- Windows (native) and WSL: clip.exe (built-in)
```

## 第 2 步：解析参数

预期格式：`<content-type> <album-name> <track-number>`

**内容类型：**
- `lyrics` - Suno 歌词框
- `style` - Suno 风格框（如果存在排除风格，则自动追加）
- `exclude` - 仅排除风格（负面提示词）
- `streaming-lyrics` - 流媒体歌词（供发行商使用）
- `all` - 所有 Suno 输入内容（风格 + 排除风格 + 歌词合并）
- `suno` - 用于通过 Tampermonkey 自动填充 Suno 的 JSON 对象（title、style、exclude_styles、lyrics）

示例：
- `/clipboard lyrics sample-album 03`
- `/clipboard style sample-album 05`
- `/clipboard streaming-lyrics sample-album 02`
- `/clipboard all sample-album 01`

如果缺少参数：
```
Usage: /clipboard <content-type> <album-name> <track-number>

Content types: lyrics, style, exclude, streaming-lyrics, all, suno

Example: /clipboard lyrics sample-album 03
```

## 第 3 步：通过 MCP 提取内容

调用 `format_for_clipboard(album_slug, track_slug, content_type)`——通过一次调用提取并格式化所请求的内容。

- `content_type`：`"lyrics"`、`"style"`、`"exclude"`、`"streaming"`、`"all"` 或 `"suno"`
- 返回已格式化并可直接复制到剪贴板的内容
- 自动处理曲目解析、章节提取和格式化

**如果未找到曲目：**MCP 会返回包含可用曲目的错误信息。

## 第 6 步：复制到剪贴板

使用检测到的平台所对应的剪贴板命令：

| 平台 | 命令 |
|----------|---------|
| macOS | `pbcopy` |
| Windows（原生）/ WSL | `clip.exe` |
| Linux（xclip） | `xclip -selection clipboard` |
| Linux（xsel） | `xsel --clipboard --input` |

示例（使用 `printf '%s'` 安全处理歌词中的特殊字符）：
```bash
printf '%s' "$content" | pbcopy  # macOS
printf '%s' "$content" | xclip -selection clipboard  # Linux
```

## 第 7 步：确认

报告：
```
✓ Copied to clipboard: {content-type} from track {track-number}
  Album: {album}
  Track: {track-filename}
```

## 错误处理

**未找到曲目文件：**
```
Error: Track {track-number} not found in album {album}

Available tracks:
- 01-track-name.md
- 02-track-name.md
```

**未找到内容章节：**
```
Error: {content-type} section not found in track {track-number}

The track file may not have this section yet.
```

**缺少配置：**
```
Error: Config not found at ~/.bitwize-music/config.yaml
Run /configure to set up.
```

---

## 示例

### 复制 Suno 歌词

```
/clipboard lyrics sample-album 03
```

输出：
```
✓ Copied to clipboard: lyrics from track 03
  Album: sample-album
  Track: 03-t-day-beach.md
```

### 复制风格提示词

```
/clipboard style sample-album 05
```

### 复制流媒体歌词

```
/clipboard streaming-lyrics sample-album 02
```

### 复制所有 Suno 输入内容

```
/clipboard all sample-album 01
```

输出：
```
✓ Copied to clipboard: all suno inputs from track 01
  Album: sample-album
  Track: 01-intro.md

Contents:
- Style Box (with Exclude Styles if present)
- Lyrics Box
```

### 复制 Suno 自动填充 JSON

```
/clipboard suno sample-album 01
```

输出：
```
✓ Copied to clipboard: suno auto-fill JSON from track 01
  Album: sample-album
  Track: 01-intro.md

Clipboard contains JSON with: title, style, exclude_styles, lyrics
Paste into Suno with the Tampermonkey auto-fill script (Ctrl+Shift+V).
See tools/userscripts/README.md for setup.
```

---

## 实现说明

**剪贴板检测：**
- 按优先级顺序检查多个工具
- `clip.exe` 内置于 Windows 中，因此既适用于原生 Windows（通过 Git Bash），也适用于 WSL（通过互操作）
- 如果完全没有可用的 bash，PowerShell 的 `Set-Clipboard` 可作为等效的原生后备方案（已验证可用）
- Linux 用户可能安装了 `xclip` 或 `xsel`

**内容提取：**
- MCP `format_for_clipboard` 负责所有章节提取和格式化
- 无需手动解析文件

**多个匹配项：**
- 如果曲目编号匹配多个文件（这种情况不应发生），使用第一个匹配项
- 如果目录结构看起来有误，则向用户发出警告