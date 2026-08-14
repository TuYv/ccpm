---
name: rename
description: Renames an album or track, updating slugs, titles, and all mirrored paths. Use when the user wants to rename an album or track.
argument-hint: <album|track> <current-name> <new-name>
model: haiku
allowed-tools:
  - Read
  - Bash
  - bitwize-music-mcp
---
## 你的任务

**输入**：$ARGUMENTS

使用 MCP 重命名工具重命名专辑或曲目。

---

# 重命名技能

你可以重命名专辑或曲目，并更新 slug、显示标题以及所有镜像目录路径（内容、音频、文档）。

## 第 1 步：解析参数

预期格式：`<type> <current-name> <new-name>`

示例：
- `album old-album-name new-album-name`
- `track my-album 01-old-track 01-new-track`

如果参数缺失或含义不明确，请显示用法：
```
Usage:
  /rename album <current-slug> <new-slug>
  /rename track <album-slug> <current-track-slug> <new-track-slug>

Examples:
  /rename album my-old-album my-new-album
  /rename track my-album 01-old-name 01-new-name
```

## 第 2 步：通过 MCP 验证配置

调用 `get_config()` 以验证配置已加载。MCP 重命名工具会在内部解析路径，但配置必须有效。

## 第 3 步：向用户确认

重命名前，请确认该操作：

**对于专辑：**
```
Rename album 'old-name' -> 'new-name'?

This will:
- Move content directory
- Move audio directory (if exists)
- Move documents directory (if exists)
- Update README.md title
- Update state cache
```

**对于曲目：**
```
Rename track 'old-name' -> 'new-name' in album 'album-name'?

This will:
- Rename track file
- Update title in metadata table
- Update state cache

Note: Audio files are NOT renamed (they have Suno-generated names).
```

等待用户确认后再继续。

## 第 4 步：调用 MCP 工具

**对于专辑：** 使用 `rename_album` MCP 工具，并传入：
- `old_slug`：当前专辑 slug
- `new_slug`：新专辑 slug
- `new_title`：（可选）自定义显示标题

**对于曲目：** 使用 `rename_track` MCP 工具，并传入：
- `album_slug`：曲目所属的专辑
- `old_track_slug`：当前曲目 slug
- `new_track_slug`：新曲目 slug
- `new_title`：（可选）自定义显示标题

## 第 5 步：报告结果

**成功：**
```
Renamed album 'old-name' -> 'new-name'
  Content directory: moved
  Audio directory: moved (or: no audio directory found)
  Documents directory: moved (or: no documents directory found)
  Tracks updated: N
```

**对于曲目：**
```
Renamed track 'old-name' -> 'new-name' in album 'album-name'
  Old path: /path/to/old-file.md
  New path: /path/to/new-file.md
  Title updated to: "New Name"
```

## 错误处理

**未找到专辑/曲目：**
```
Error: Album 'name' not found.
Available albums: album-1, album-2, album-3
```

**新名称已存在：**
```
Error: Album 'new-name' already exists.
Choose a different name.
```

**部分失败（专辑重命名）：**
```
Warning: Content directory renamed successfully, but:
  - Audio directory rename failed: [error]
  - Documents directory rename failed: [error]

The content directory has been moved. Use rebuild_state to refresh the cache,
then manually move any remaining directories.
```