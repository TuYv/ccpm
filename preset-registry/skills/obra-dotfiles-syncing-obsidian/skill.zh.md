---
name: syncing-obsidian
description: Use when reading or writing files in an Obsidian vault that is synced with obsync. Ensures changes are pulled before reading and pushed after writing. Also covers sync status, file history, version restore, and diagnosing sync issues.
---
# 同步 Obsidian

使用 `obsync` CLI 从命令行同步 Obsidian 仓库。它可与官方 Obsidian 客户端配合使用 Obsidian Sync 服务器。

## 关键要求：读取前同步，写入后同步

如果 `obsync watch` 正在运行，仓库会自动保持同步——读取前或写入后均无需手动同步。

如果监视模式**未**运行，请始终手动同步：

**读取仓库文件前**，从服务器拉取最新内容：

```bash
obsync sync /path/to/vault
```

**写入或修改仓库文件后**，推送你的更改：

```bash
obsync sync /path/to/vault
```

如果跳过这些步骤且监视模式未运行，你将读取到过期内容，或者你的更改将无法同步到其他设备。

`obsync sync` 会在一次调用中同时执行拉取和推送，因此在这两种情况下使用都是安全的。

## 何时使用此 Skill

在以下情况下使用此 Skill：
- 从 Obsidian 仓库读取文件（先同步以获取最新内容）
- 在 Obsidian 仓库中写入或编辑文件（完成后同步以推送更改）
- 用户要求同步其仓库
- 检查哪些文件已更改或需要同步
- 查看或恢复文件版本历史记录
- 诊断文件无法同步的原因
- 设置新仓库以进行同步

## 设置（一次性）

```bash
# Log in
obsync login

# List available vaults
obsync vaults

# Initialize a vault in a directory
obsync init <vault-id> /path/to/vault
```

初始化后，所有命令都从仓库目录内运行（或者将该目录作为最后一个参数传入）。

## 常用操作

### 同步仓库

```bash
obsync sync [directory]
```

拉取远程更改、解决冲突，然后推送本地更改。如果省略目录，则使用当前工作目录。

### 仅拉取或推送

```bash
obsync pull [directory]   # download remote changes only
obsync push [directory]   # upload local changes only
```

### 持续监视并同步

```bash
obsync watch [directory]
```

保持 WebSocket 连接开启，通过推送通知实时拉取远程更改，并每 30 秒扫描一次本地更改。连接断开时会自动重新连接。使用 Ctrl+C 停止。

每个仓库只能运行一个 obsync 进程（文件锁位于 `.obsync/obsync.lock`）。如果监视模式正在运行，`obsync sync` 将因锁错误而失败——这是预期行为，因为同步由监视模式负责。

### 检查同步状态

```bash
obsync status [directory]
```

显示仓库信息、文件数量，以及自上次同步以来发生更改的所有文件。

### 查看文件历史记录

```bash
obsync history "path/to/file.md" [directory]
```

显示所有版本及其 UID、时间戳、设备和大小。使用 UID 进行恢复。

### 恢复版本

```bash
obsync restore "path/to/file.md" <version-uid> [directory]
```

### 运行诊断

```bash
obsync diag [directory]
```

测试连接性、推送/回显往返、仓库大小和已删除文件数量。

### 调试模式

在任何命令前添加 `--debug`，即可在 stderr 中查看 WebSocket 消息和协议详细信息：

```bash
obsync --debug sync
```

## 阅读活动日志

每次同步都会追加记录到仓库内的 `.obsync/sync.log`：

```
2026-02-02 14:47:25 sync started
2026-02-02 14:47:26 pull "meeting.md" downloaded from server
2026-02-02 14:47:26 pull "draft.md" deleted (server deleted)
2026-02-02 14:47:26 pull "notes.md" kept local version
2026-02-02 14:47:26 push "new-note.md" uploaded (1234 bytes)
2026-02-02 14:47:26 push "old-note.md" server has current version
2026-02-02 14:47:26 sync complete
```

**日志条目的含义：**
- `downloaded from server` — 服务器版本较新，已写入磁盘
- `deleted (server deleted)` — 文件已在另一台设备上删除，因此也在本地移除
- `kept local version` — 保留本地编辑，覆盖服务器上的更改
- `merged (text)` — Markdown 文件的两端均有更改，已应用三方合并
- `merged (json)` — 配置 JSON 的两端均有更改，已应用浅合并
- `uploaded (N bytes)` — 文件已推送到服务器
- `server has current version` — 服务器已有此版本，无需上传

## 诊断同步问题

### 文件未向上同步

```bash
obsync status
```

如果该文件没有显示为已更改，则说明它已被标记为已同步。运行 `obsync push` 并检查活动日志。

### 文件未向下同步

运行 `obsync sync` 并检查 `.obsync/sync.log`。如果该文件未出现，则服务器尚未发送关于它的通知。尝试运行 `obsync --debug sync`，并查找提及该文件的推送通知。

### 删除操作未传播

处理删除操作前，需要清除 `initial` 标志。运行一次 `obsync sync` 以清除该标志，之后的同步将处理来自其他设备的删除操作。

### 直接检查数据库

同步状态位于 `.obsync/state.db`（SQLite）中：

```bash
# Files that need pushing (changed locally since last sync)
sqlite3 .obsync/state.db "SELECT path FROM local_files WHERE hash != synchash"

# Server-side deleted files
sqlite3 .obsync/state.db "SELECT path FROM server_files WHERE deleted = 1"

# Current sync metadata
sqlite3 .obsync/state.db "SELECT * FROM metadata"
```

### 强制重新同步文件

重置其同步状态，使其显示为已更改：

```bash
sqlite3 .obsync/state.db "UPDATE local_files SET synchash='' WHERE path='path/to/file.md'"
obsync push
```

### 重放遗漏的服务器更改

回退版本游标，以重新接收推送通知：

```bash
# Check current version
sqlite3 .obsync/state.db "SELECT value FROM metadata WHERE key='last_version'"

# Roll back (e.g., by 10 versions)
sqlite3 .obsync/state.db "UPDATE metadata SET value='7040' WHERE key='last_version'"
obsync sync
```

## 同步的内容

- 仓库中的所有文件，无论扩展名是什么
- 文件夹（作为元数据条目）

## 排除的内容

- 点文件和点文件夹（`.git/`、`.obsidian/`、`.obsync/`）
- `workspace.json` 和 `workspace-mobile.json`
- 大于约 199 MB 的文件

注意：尽管本地扫描器会跳过点文件夹，服务器仍会同步 `.obsidian/` 配置文件（它们会以推送通知的形式到达）。

## 冲突解决

当本地和远程都修改了同一个文件时：

| 文件类型 | 解决方式 |
|-----------|-----------|
| Markdown (`.md`) | 使用共同祖先进行三方合并 |
| `.obsidian/` 中的 JSON | 浅合并（服务器端的键优先，保留仅本地存在的键） |
| 其他所有类型 | 本地版本优先 |

任何合并操作执行前都会保存备份。