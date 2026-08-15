---
name: macos-cleaner
description: Analyze and reclaim macOS disk space through intelligent cleanup recommendations. This skill should be used when users report disk space issues, need to clean up their Mac, or want to understand what's consuming storage. Focus on safe, interactive analysis with user confirmation before any deletions.
---
# macOS 清理工具

## 概述

智能分析 macOS 磁盘使用情况，并提供可执行的清理建议以释放存储空间。本技能遵循**安全第一的理念**：进行全面分析，清晰呈现分析结果，并在执行任何删除操作之前要求用户明确确认。

**目标用户**：具备基本技术知识、了解文件系统，但需要指导以判断 macOS 上哪些内容可以安全删除的用户。

## 核心原则

1. **安全第一，绝不绕过**：在未获得用户明确确认的情况下，绝不执行危险命令（`rm -rf`、`mo clean` 等）。不得使用捷径或变通方法。
2. **仅执行精确删除**：通过指定确切的对象 ID/名称进行删除。绝不使用批量清理命令。
3. **列出每个对象**：报告必须展示每个具体的镜像、卷和容器，而不能只显示“12 GB 未使用的镜像”。
4. **价值重于数字好看**：你的目标不是最大化已清理空间，而是识别哪些内容**确实无用**，哪些属于**有价值的缓存**。仅仅为了显示一个很大的数字而清除 50GB 有用缓存是有害的。
5. **关注网络环境**：许多用户（尤其是中国用户）的网络速度较慢或不稳定。重新下载缓存可能需要数小时。能够节省 30 分钟下载时间的缓存值得保留。
6. **必须进行影响分析**：每条清理建议都必须包含“删除后会发生什么”列。绝不能只列出项目而不解释后果。
7. **删除前进行双重检查**：删除前，使用相互独立的交叉检查来验证每个 Docker 对象（参见 references/docker_analysis.md）。
8. **耐心重于速度**：磁盘扫描可能需要 5 至 10 分钟。绝不能中断或跳过耗时较长的操作。应定期向用户报告进度。
9. **由用户执行清理**：分析完成后，提供清理命令供用户自行运行。不要自动执行清理。
10. **采用保守的默认策略**：如有疑问，就不要删除。宁可谨慎行事。

**绝对禁止事项：**
- ❌ 绝不使用 `docker image prune`、`docker volume prune`、`docker system prune` 或任何 prune 系列命令（例外：`docker builder prune` 是安全的——构建缓存仅包含中间层，绝不包含用户数据）
- ❌ 绝不使用 `docker container prune`——已停止的容器随时可能重新启动
- ❌ 在未获得明确确认的情况下，绝不对用户目录运行 `rm -rf`
- ❌ 在未先通过 `--dry-run` 预览的情况下，绝不运行 `mo clean`
- ❌ 绝不为了节省时间而跳过分析步骤
- ❌ 绝不在 Mole 命令后附加 `--help`（只有 `mo --help` 是安全的）
- ❌ 绝不提供仅包含分类的清理报告——必须逐一列出每个对象
- ❌ 绝不为了夸大清理数字而建议删除有用的缓存

## 工作流决策树

```
用户报告磁盘空间问题
           ↓
        快速诊断
           ↓
    ┌──────┴──────┐
    │             │
 立即清理      深度分析
              （继续下方流程）
    │             │
    └──────┬──────┘
           ↓
      呈现分析结果
           ↓
       用户确认
           ↓
       执行清理
           ↓
       验证结果
```

## 第 1 步：使用 Mole 快速诊断

**主要工具**：使用 Mole 进行磁盘分析。它能够提供全面且分类清晰的结果。

### 1.1 执行前检查

```bash
# Check Mole installation and version
which mo && mo --version

# If not installed
brew install tw93/tap/mole

# Check for updates (Mole updates frequently)
brew info tw93/tap/mole | head -5

# Upgrade if outdated
brew upgrade tw93/tap/mole
```

### 1.2 选择分析方法

**重要**：使用 `mo analyze` 作为主要分析工具，**不要**使用 `mo clean --dry-run`。

| 命令 | 用途 | 使用场景 |
|---------|---------|----------|
| `mo analyze` | 交互式磁盘使用情况浏览器（TUI 树状视图） | **主要方式**：了解哪些内容正在占用空间 |
| `mo clean --dry-run` | 预览清理类别 | **辅助方式**：仅在运行 `mo analyze` 后用于查看清理预览 |

**优先使用 `mo analyze` 的原因：**
- 专用磁盘分析工具，提供交互式树状导航
- 可以深入查看特定目录
- 显示实际的磁盘使用明细，而不只是清理类别
- 对于了解存储空间占用情况更有帮助

### 1.3 通过 tmux 运行分析

**重要**：Mole 需要 TTY。从 Claude Code 使用时，始终通过 tmux 运行。

**关键时间提示**：扫描主目录的速度很慢（对于大型目录，需要 5–10 分钟甚至更长时间）。请提前告知用户并耐心等待。

```bash
# Create tmux session
tmux new-session -d -s mole -x 120 -y 40

# Run disk analysis (PRIMARY tool - interactive TUI)
tmux send-keys -t mole 'mo analyze' Enter

# Wait for scan - BE PATIENT!
# Home directory scanning typically takes 5-10 minutes
# Report progress to user regularly
sleep 60 && tmux capture-pane -t mole -p

# Navigate the TUI with arrow keys
tmux send-keys -t mole Down    # Move to next item
tmux send-keys -t mole Enter   # Expand/select item
tmux send-keys -t mole 'q'     # Quit when done
```

**替代方式：清理预览（在运行 mo analyze 之后使用）**
```bash
# Run dry-run preview (SAFE - no deletion)
tmux send-keys -t mole 'mo clean --dry-run' Enter

# Wait for scan (report progress to user every 30 seconds)
# Be patient! Large directories take 5-10 minutes
sleep 30 && tmux capture-pane -t mole -p
```

### 1.4 报告进度

定期向用户报告扫描进度：

```
📊 Disk Analysis in Progress...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ Elapsed: 2 minutes

Current status:
✅ Applications: 49.5 GB (complete)
✅ System Library: 10.3 GB (complete)
⏳ Home: scanning... (this may take 5-10 minutes)
⏳ App Library: pending

I'm waiting patiently for the scan to complete.
Will report again in 30 seconds...
```

### 1.5 展示最终结果

扫描完成后，以结构化形式展示结果：

```
📊 Disk Space Analysis (via Mole)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Free space: 27 GB

🧹 Recoverable Space (dry-run preview):

➤ User Essentials
  • User app cache:     16.67 GB
  • User app logs:      102.3 MB
  • Trash:              642.9 MB

➤ Browser Caches
  • Chrome cache:       1.90 GB
  • Safari cache:       4 KB

➤ Developer Tools
  • uv cache:           9.96 GB
  • npm cache:          (detected)
  • Docker cache:       (detected)
  • Homebrew cache:     (detected)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total recoverable: ~30 GB

⚠️ This was a dry-run preview. No files were deleted.
```

## 第 2 步：深度分析类别

系统地检查以下类别。有关详细说明，请参阅 `references/cleanup_targets.md`。

### 类别 1：系统与应用程序缓存

**要分析的位置：**
- `~/Library/Caches/*` - 用户应用程序缓存
- `/Library/Caches/*` - 系统范围的缓存（需要 sudo）
- `~/Library/Logs/*` - 应用程序日志
- `/var/log/*` - 系统日志（需要 sudo）

**分析脚本：**
```bash
scripts/analyze_caches.py --user-only
```

**安全级别**：🟢 通常可以安全删除（应用程序会重新生成缓存）

**需要保留的例外项：**
- 浏览器运行时的浏览器缓存
- IDE 缓存（可能会导致下次启动变慢）
- 包管理器缓存（Homebrew、pip、npm）

### 类别 2：应用程序残留

**要分析的位置：**
- `~/Library/Application Support/*` - 应用程序数据
- `~/Library/Preferences/*` - 偏好设置文件
- `~/Library/Containers/*` - 沙盒应用程序数据

**分析方法：**
1. 列出 `/Applications` 中已安装的应用程序
2. 与 `~/Library/Application Support` 进行交叉比对
3. 识别孤立文件夹（应用程序已卸载，但数据仍然存在）

**分析脚本：**
```bash
scripts/find_app_remnants.py
```

**安全级别**：🟡 需要谨慎
- ✅ 安全：明确已卸载应用程序的文件夹
- ⚠️ 先检查：很少使用的应用程序所对应的文件夹
- ❌ 保留：正在使用的应用程序数据

### 类别 3：大文件与重复文件

**分析脚本：**
```bash
scripts/analyze_large_files.py --threshold 100MB --path ~
```

**查找重复文件（可选，资源消耗较大）：**
```bash
# Use fdupes if installed
if command -v fdupes &> /dev/null; then
  fdupes -r ~/Documents ~/Downloads
fi
```

**呈现分析结果：**
```
📦 Large Files (>100MB):
━━━━━━━━━━━━━━━━━━━━━━━━
1. movie.mp4                    4.2 GB  ~/Downloads
2. dataset.csv                  1.8 GB  ~/Documents/data
3. old_backup.zip               1.5 GB  ~/Desktop
...

🔁 Duplicate Files:
- screenshot.png (3 copies)     15 MB each
- document_v1.docx (2 copies)   8 MB each
```

**安全级别**：🟡 需要用户自行判断

### 类别 4：开发环境清理

**清理目标：**
- Docker：镜像、容器、卷、构建缓存
- Homebrew：缓存、旧版本
- Node.js：`node_modules`、npm 缓存
- Python：pip 缓存、`__pycache__`、venv
- Git：已归档项目中的 `.git` 文件夹

**分析脚本：**
```bash
scripts/analyze_dev_env.py
```

**分析结果示例：**
```
🐳 Docker Resources:
- Unused images:      12 GB
- Stopped containers:  2 GB
- Build cache:         8 GB
- Orphaned volumes:    3 GB
Total potential:      25 GB

📦 Package Managers:
- Homebrew cache:      5 GB
- npm cache:           3 GB
- pip cache:           1 GB
Total potential:       9 GB

🗂️  Old Projects:
- archived-project-2022/.git  500 MB
- old-prototype/.git          300 MB
```

**清理命令（需要确认）：**
```bash
# Homebrew cleanup (safe)
brew cleanup -s

# npm _npx only (safe - temporary packages)
rm -rf ~/.npm/_npx

# pip cache (use with caution)
pip cache purge
```

**Docker 清理 - 需要特殊处理：**

⚠️ **切勿使用以下命令：**
```bash
# ❌ DANGEROUS - deletes ALL volumes without confirmation
docker volume prune -f
docker system prune -a --volumes
```

✅ **正确方法 - 逐个卷确认：**
```bash
# 1. List all volumes
docker volume ls

# 2. Identify which projects each volume belongs to
docker volume inspect <volume_name>

# 3. Ask user to confirm EACH project they want to delete
# Example: "Do you want to delete all volumes for 'ragflow' project?"

# 4. Delete specific volumes only after confirmation
docker volume rm ragflow_mysql_data ragflow_redis_data
```

**安全级别**：🟢 Homebrew/npm 清理，🔴 Docker 卷需要逐个项目确认

### 步骤 2A-2C：Docker 深度分析

对于大量使用 Docker 的系统，请遵循 `references/docker_analysis.md` 中详细的逐对象分析和验证协议（镜像/容器/卷检查、OrbStack 稀疏文件处理，以及数据库卷红线规则）。核心规则：删除前，须通过独立交叉检查验证每个 Docker 对象，并且绝不使用 prune 系列命令。

## 步骤 3：与 Mole 集成

**Mole**（https://github.com/tw93/Mole）是一款用于全面清理 macOS 的**命令行界面（CLI）**工具。它提供基于交互式终端的分析和清理功能，可用于处理缓存、日志、开发者工具等。

**关键要求：**

1. **TTY 环境**：Mole 的交互式命令需要 TTY。从 Claude Code 或脚本运行时，请使用 `tmux`。
2. **版本检查**：使用前务必确认 Mole 已更新至最新版本。
3. **安全的帮助命令**：只有 `mo --help` 是安全的。请勿在其他命令后附加 `--help`。

**安装检查和升级：**

```bash
# Check if installed and get version
which mo && mo --version

# If not installed
brew install tw93/tap/mole

# Check for updates
brew info tw93/tap/mole | head -5

# Upgrade if needed
brew upgrade tw93/tap/mole
```

**通过 tmux 使用 Mole（Claude Code 必须如此）：**

```bash
# Create tmux session for TTY environment
tmux new-session -d -s mole -x 120 -y 40

# Run analysis (safe, read-only)
tmux send-keys -t mole 'mo analyze' Enter

# Wait for scan (be patient - can take 5-10 minutes for large directories)
sleep 60

# Capture results
tmux capture-pane -t mole -p

# Cleanup when done
tmux kill-session -t mole
```

**可用命令（来自 `mo --help`）：**

| 命令 | 安全性 | 说明 |
|---------|--------|-------------|
| `mo --help` | ✅ 安全 | 查看所有命令（唯一安全的帮助命令） |
| `mo analyze` | ✅ 安全 | 磁盘用量浏览器（只读） |
| `mo status` | ✅ 安全 | 系统健康状况监视器 |
| `mo clean --dry-run` | ✅ 安全 | 预览清理操作（不删除） |
| `mo clean` | ⚠️ 危险 | 实际删除文件 |
| `mo purge` | ⚠️ 危险 | 删除项目产物 |
| `mo uninstall` | ⚠️ 危险 | 删除应用程序 |

**参考指南：**
有关详细的 tmux 工作流程和故障排除方法，请参阅 `references/mole_integration.md`。

## 使用 Mole 进行多层深度探索

为了进行全面分析，请执行多层级探索（深入检查 Home、Library、.cache、.npm、Downloads 等），而不是只扫描顶层目录。完整的 TUI 导航演练、推荐的探索树、预计耗时和完整示例会话均记录在 `references/mole_integration.md` 中。

## 反模式：不应删除的内容

**关键提醒**：以下项目经常被建议清理，但在大多数情况下不应删除。它们提供的重要价值超过了所占用的空间。

### 应保留的项目（反模式）

| 项目 | 大小 | 不应删除的原因 | 删除后的实际影响 |
|------|------|-------------------|------------------------|
| **Xcode DerivedData** | 10+ GB | 构建缓存可为每次完整重新构建节省 10-30 分钟 | 下次构建将多花 10-30 分钟 |
| **npm _cacache** | 5+ GB | 已下载的软件包缓存在本地 | `npm install` 会重新下载所有内容（在中国需要 30 分钟至 2 小时） |
| **~/.cache/uv** | 10+ GB | Python 软件包缓存 | 每个 Python 项目都会从 PyPI 重新安装依赖项 |
| **Playwright browsers** | 3-4 GB | 用于自动化测试的浏览器二进制文件 | 每次都要重新下载 2GB 以上的数据（30 分钟至 1 小时） |
| **iOS DeviceSupport** | 2-3 GB | 设备调试所必需 | 连接设备时需从 Apple 重新下载 |
| **Docker stopped containers** | <500 MB | 随时可能通过 `docker start` 重新启动 | 丢失容器状态，需要重新创建 |
| **~/.cache/huggingface** | 大小不定 | AI 模型缓存 | 重新下载大型模型（需要数小时） |
| **~/.cache/modelscope** | 大小不定 | AI 模型缓存（中国） | 同上 |
| **JetBrains caches** | 1+ GB | IDE 索引和缓存 | IDE 需要 5-10 分钟重新建立索引 |

### 为什么这很重要

**虚荣陷阱**：展示“清理了 50GB！”让人感觉很好，但：
- 用户接下来要花 2 小时重新下载 npm 软件包
- 下次 Xcode 构建需要 30 分钟，而不是 30 秒
- AI 项目因需要重新下载模型而失败

**正确的思维方式**：“我发现了 50GB 的缓存。以下是其中大多数实际上很有价值、应该保留的原因……”

### 实际上可以安全删除的内容

| 项目 | 安全的原因 | 影响 |
|------|----------|--------|
| **Trash** | 用户已经删除了这些文件 | 无——这是用户的决定 |
| **Homebrew old versions** | 已被较新的版本取代 | 极少见：无法回退到旧版本 |
| **npm _npx** | 临时的 npx 执行内容 | 轻微：npx 会在下次使用时重新下载 |
| **Orphaned app remnants** | 应用已经卸载 | 无——应用已不存在 |
| **Specific unused Docker volumes** | 已确认项目被弃用 | 无——前提是确实已被弃用 |

## 报告格式要求

每份清理报告都必须遵循以下格式，并包含影响分析：

```markdown
## Disk Analysis Report

### Classification Legend
| Symbol | Meaning |
|--------|---------|
| 🟢 | **Absolutely Safe** - No negative impact, truly unused |
| 🟡 | **Trade-off Required** - Useful cache, deletion has cost |
| 🔴 | **Do Not Delete** - Contains valuable data or actively used |

### Findings

| Item | Size | Classification | What It Is | Impact If Deleted |
|------|------|----------------|------------|-------------------|
| Trash | 643 MB | 🟢 | Files you deleted | None |
| npm _npx | 2.1 GB | 🟢 | Temp npx packages | Minor redownload |
| npm _cacache | 5 GB | 🟡 | Package cache | 30min-2hr redownload |
| DerivedData | 10 GB | 🟡 | Xcode build cache | 10-30min rebuild |
| Docker volumes | 11 GB | 🔴 | Project databases | **DATA LOSS** |

### Recommendation
Only items marked 🟢 are recommended for cleanup.
Items marked 🟡 require your judgment based on usage patterns.
Items marked 🔴 require explicit confirmation per-item.
```

### Docker 报告：必须提供对象级详细信息

Docker 报告必须列出每个单独的对象（每个镜像、容器和卷），而不能只列出类别。请参阅 `references/report_templates.md` 中的对象级表格模板。

## 高质量报告模板

完成多层探索后，使用 `references/report_templates.md` 中详细的填空模板呈现调查结果。

### 报告质量检查清单

在呈现报告之前，请确认：

- [ ] 每一项都有“删除后的影响”说明
- [ ] 🟢 项确实可以安全删除（废纸篓、_npx、旧版本）
- [ ] 🟡 项需要用户决定（提供时间信息、使用模式）
- [ ] 🔴 项说明了应当保留的原因
- [ ] Docker 卷按项目列出，而不是笼统地执行清理
- [ ] 已考虑网络环境（中国 = 重新下载速度慢）
- [ ] 不要为了夸大可释放空间而建议删除有用的缓存
- [ ] 提供清晰的操作项和准确的命令

## 步骤 4：呈现建议

将调查结果整理为带风险等级的可执行建议：

```markdown
# macOS Cleanup Recommendations

## Summary
Total space recoverable: ~XX GB
Current usage: XX%

## Recommended Actions

### 🟢 Safe to Execute (Low Risk)
These are safe to delete and will be regenerated as needed:

1. **Empty Trash** (~12 GB)
   - Location: ~/.Trash
   - Command: `rm -rf ~/.Trash/*`

2. **Clear System Caches** (~45 GB)
   - Location: ~/Library/Caches
   - Command: `rm -rf ~/Library/Caches/*`
   - Note: Apps may be slightly slower on next launch

3. **Remove Homebrew Cache** (~5 GB)
   - Command: `brew cleanup -s`

### 🟡 Review Recommended (Medium Risk)
Review these items before deletion:

1. **Large Downloads** (~38 GB)
   - Location: ~/Downloads
   - Action: Manually review and delete unneeded files
   - Files: [list top 10 largest files]

2. **Application Remnants** (~8 GB)
   - Apps: [list detected uninstalled apps]
   - Locations: [list paths]
   - Action: Confirm apps are truly uninstalled before deleting data

### 🔴 Keep Unless Certain (High Risk)
Only delete if you know what you're doing:

1. **Docker Volumes** (~3 GB)
   - May contain important data
   - Review with: `docker volume ls`

2. **Time Machine Local Snapshots** (~XX GB)
   - Automatic backups, will be deleted when space needed
   - Command to check: `tmutil listlocalsnapshots /`
```

## 步骤 5：确认后执行

**关键要求**：未经用户明确确认，绝不能执行删除操作。

**交互式确认流程：**

```python
# Example from scripts/safe_delete.py
def confirm_delete(path: str, size: str, description: str) -> bool:
    """
    Ask user to confirm deletion.

    Args:
        path: File/directory path
        size: Human-readable size
        description: What this file/directory is

    Returns:
        True if user confirms, False otherwise
    """
    print(f"\n🗑️  Confirm Deletion")
    print(f"━━━━━━━━━━━━━━━━━━")
    print(f"Path:        {path}")
    print(f"Size:        {size}")
    print(f"Description: {description}")

    response = input("\nDelete this item? [y/N]: ").strip().lower()
    return response == 'y'
```

**对于批量操作：**

```python
def batch_confirm(items: list) -> list:
    """
    Show all items, ask for batch confirmation.

    Returns list of items user approved.
    """
    print("\n📋 Items to Delete:")
    print("━━━━━━━━━━━━━━━━━━")
    for i, item in enumerate(items, 1):
        print(f"{i}. {item['path']} ({item['size']})")

    print("\nOptions:")
    print("  'all'    - Delete all items")
    print("  '1,3,5'  - Delete specific items by number")
    print("  'none'   - Cancel")

    response = input("\nYour choice: ").strip().lower()

    if response == 'none':
        return []
    elif response == 'all':
        return items
    else:
        # Parse numbers
        indices = [int(x.strip()) - 1 for x in response.split(',')]
        return [items[i] for i in indices if 0 <= i < len(items)]
```

## 第 6 步：验证结果

清理后，验证结果并进行报告：

```bash
# Compare before/after
df -h /

# Calculate space recovered
# (handled by scripts/cleanup_report.py)
```

**报告格式：**

```
✅ Cleanup Complete!

Before: 450 GB used (90%)
After:  385 GB used (77%)
━━━━━━━━━━━━━━━━━━━━━━━━
Recovered: 65 GB

Breakdown:
- System caches:        45 GB
- Downloads:            12 GB
- Homebrew cache:        5 GB
- Application remnants:  3 GB

⚠️ Notes:
- Some applications may take longer to launch on first run
- Deleted items cannot be recovered unless you have Time Machine backup
- Consider running this cleanup monthly

💡 Maintenance Tips:
- Set up automatic Homebrew cleanup: `brew cleanup` weekly
- Review Downloads folder monthly
- Enable "Empty Trash Automatically" in Finder preferences
```

## 附加内容：Dockerfile 优化发现

当镜像分析发现镜像过大时，建议采用多阶段构建优化。有关优化前后的示例和关键技术，请参阅 `references/docker_analysis.md`。

## ⚠️ 安全准则

### 始终保留

未经用户明确指示，切勿删除以下内容：
- `~/Documents`、`~/Desktop`、`~/Pictures` 中的内容
- 活跃项目目录
- 数据库文件（*.db、*.sqlite）
- 活跃应用的配置文件
- SSH 密钥、凭据、证书
- Time Machine 备份

### ⚠️ 需要确认 Sudo 权限

这些操作需要提升权限。请让用户手动运行命令：
- 清理 `/Library/Caches`（系统范围）
- 清理 `/var/log`（系统日志）
- 清理 `/private/var/folders`（系统临时文件）

提示示例：
```
⚠️ This operation requires administrator privileges.

Please run this command manually:
  sudo rm -rf /Library/Caches/*

⚠️ You'll be asked for your password.
```

### 💡 备份建议

在执行任何超过 10GB 的清理之前，建议：

```
💡 Safety Tip:
Before cleaning XX GB, consider creating a Time Machine backup.

Quick backup check:
  tmutil latestbackup

If no recent backup, run:
  tmutil startbackup
```

## 故障排除

### “Operation not permitted”错误

由于 SIP（系统完整性保护），macOS 可能会阻止删除某些系统文件。

**解决方案**：不要强行操作。这些保护机制是出于安全考虑而存在的。

### 删除缓存后应用崩溃

这种情况很少见，但有可能发生。**解决方案**：重启应用，它会重新生成必要的缓存。

### Docker 清理操作移除了重要数据

**预防措施**：清理前始终列出 Docker 卷：
```bash
docker volume ls
docker volume inspect <volume_name>
```

## 资源

### scripts/

- `analyze_caches.py` - 扫描缓存目录并进行分类
- `find_app_remnants.py` - 检测孤立的应用程序数据
- `analyze_large_files.py` - 通过智能筛选查找大文件
- `analyze_dev_env.py` - 扫描开发环境资源
- `safe_delete.py` - 通过确认进行交互式删除
- `cleanup_report.py` - 生成清理前后报告

### references/

- `cleanup_targets.md` - 每个清理目标的详细说明
- `mole_integration.md` - 如何使用 Mole，以及多层 TUI 探索演练
- `docker_analysis.md` - Docker 深度分析工作流（步骤 2A-2C）和 Dockerfile 优化
- `report_templates.md` - 详细的报告模板（对象级 Docker 表格、完整报告布局）
- `safety_rules.md` - 绝不能删除的内容的完整列表

## 使用示例

### 示例 1：快速清理缓存

用户请求：“我的 Mac 快没空间了，可以帮帮我吗？”

工作流：
1. 运行快速诊断
2. 将系统缓存确定为可快速释放空间的目标
3. 展示发现：“`~/Library/Caches` 占用 45 GB”
4. 解释：“这些内容可以安全删除，应用会重新生成它们”
5. 请求确认
6. 提供命令供用户自行运行：`rm -rf ~/Library/Caches/*`（根据核心原则 9，不要自动执行）
7. 用户运行后，使用 `df -h /` 验证并报告：“已释放 45 GB”

### 示例 2：清理开发环境

用户请求：“我是一名开发者，我的磁盘已满”

工作流：
1. 运行 `scripts/analyze_dev_env.py`
2. 展示 Docker + npm + Homebrew 的检查结果
3. 解释每个类别
4. 提供清理命令及相关说明
5. 让用户执行（不要自动执行 Docker 清理）
6. 验证结果

### 示例 3：查找大文件

用户请求：“是什么占用了这么多空间？”

工作流：
1. 运行 `scripts/analyze_large_files.py --threshold 100MB`
2. 结合上下文展示最大的 20 个文件
3. 分类：视频、数据集、归档文件、磁盘映像
4. 让用户决定要删除哪些内容
5. 提供删除命令供用户运行（或使用 `scripts/safe_delete.py` 对每个项目进行交互式确认）
6. 建议归档到外部驱动器

## 最佳实践

1. **从保守操作开始**：先处理明显安全的目标（缓存、废纸篓）
2. **解释所有内容**：用户应当了解自己正在删除什么
3. **展示示例**：列出每个类别中的 3-5 个示例文件
4. **尊重用户节奏**：不要仓促跳过确认步骤
5. **记录结果**：始终展示清理前后的空间使用情况
6. **提供指导**：在最终报告中加入维护建议
7. **集成工具**：对于偏好 GUI 的用户，建议使用 Mole

## 不应使用此 Skill 的情况

- 用户希望自动/静默清理（违背安全优先原则）
- 用户需要清理 Windows/Linux（此技能仅适用于 macOS）
- 用户的磁盘使用率低于 10%（无需清理）
- 用户希望清理需要禁用 SIP 才能处理的系统文件（存在安全风险）

在这些情况下，请说明限制并建议替代方案。