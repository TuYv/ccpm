---
name: toprank-upgrade
argument-hint: "<or just run '/toprank-upgrade'>"
description: >
  Upgrade toprank plugin to the latest version. Updates the marketplace repo,
  installs the new version to the plugin cache, and updates installed_plugins.json.
  Use when asked to "upgrade toprank", "update toprank", or "get latest version".
  Also handles inline upgrade prompts when a skill detects UPGRADE_AVAILABLE at startup.
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---
# /toprank-upgrade

将 toprank 插件升级到最新版本，并展示更新内容。

## 关键路径

| 内容 | 路径 |
|------|------|
| Marketplace 仓库 | `~/.claude/plugins/marketplaces/nowork-studio/` |
| 插件缓存 | `~/.claude/plugins/cache/nowork-studio/toprank/<version>/` |
| 已安装插件 | `~/.claude/plugins/installed_plugins.json` |
| 更新状态 | `~/.toprank/` |

---

## 内联升级流程

当技能前置流程输出 `UPGRADE_AVAILABLE` 时，使用本节流程。

### 第 1 步：自动升级

记录日志“正在将 toprank 从 v{old} 升级到 v{new}...”，然后继续执行第 2 步。

---

### 第 2 步：检测当前安装

首先检查开发符号链接（参见“开发符号链接检测”一节）。如果检测到，则停止——不要升级。

```bash
# Find the currently installed plugin path
INSTALLED_DIR=$(ls -d ~/.claude/plugins/cache/nowork-studio/toprank/*/ 2>/dev/null | grep -v '.bak' | head -1)
if [ -z "$INSTALLED_DIR" ]; then
  echo "ERROR: toprank plugin not found in cache"; exit 1
fi
MARKETPLACE_DIR="$HOME/.claude/plugins/marketplaces/nowork-studio"
if [ ! -d "$MARKETPLACE_DIR/.git" ]; then
  echo "ERROR: marketplace repo not found at $MARKETPLACE_DIR"; exit 1
fi
echo "Current install: $INSTALLED_DIR"
echo "Marketplace repo: $MARKETPLACE_DIR"
```

### 第 3 步：保存旧版本

```bash
OLD_VERSION=$(cat "$INSTALLED_DIR/VERSION" 2>/dev/null | tr -d '[:space:]' || echo "unknown")
```

### 第 4 步：更新 Marketplace 仓库并安装

```bash
cd "$MARKETPLACE_DIR"
git fetch origin
git reset --hard origin/main
NEW_VERSION=$(cat VERSION | tr -d '[:space:]')
GIT_SHA=$(git rev-parse HEAD)

# Create new versioned cache directory
NEW_CACHE_DIR="$HOME/.claude/plugins/cache/nowork-studio/toprank/$NEW_VERSION"
if [ -d "$NEW_CACHE_DIR" ]; then
  rm -rf "$NEW_CACHE_DIR"
fi
mkdir -p "$NEW_CACHE_DIR"

# Copy plugin files (exclude .git to save space)
rsync -a --exclude='.git' "$MARKETPLACE_DIR/" "$NEW_CACHE_DIR/"
```

如果复制失败，则发出警告：“升级失败——旧版本仍处于活动状态。请手动运行 `/toprank-upgrade`。”然后停止。

### 第 5 步：更新 installed_plugins.json

读取 `~/.claude/plugins/installed_plugins.json`，然后更新 `toprank@nowork-studio` 条目：

```bash
python3 -c "
import json, os
from datetime import datetime, timezone

path = os.path.expanduser('~/.claude/plugins/installed_plugins.json')
with open(path) as f:
    data = json.load(f)

data['plugins']['toprank@nowork-studio'] = [{
    'scope': 'user',
    'installPath': os.path.expanduser('~/.claude/plugins/cache/nowork-studio/toprank/$NEW_VERSION'),
    'version': '$NEW_VERSION',
    'installedAt': data['plugins'].get('toprank@nowork-studio', [{}])[0].get('installedAt', datetime.now(timezone.utc).isoformat()),
    'lastUpdated': datetime.now(timezone.utc).isoformat(),
    'gitCommitSha': '$GIT_SHA'
}]

with open(path, 'w') as f:
    json.dump(data, f, indent=4)
print('Updated installed_plugins.json: toprank@nowork-studio -> v$NEW_VERSION')
"
```

### 第 6 步：清理旧缓存版本

删除旧的版本化缓存目录（仅保留新版本）。绝不要删除 `dev` 符号链接：

```bash
for dir in ~/.claude/plugins/cache/nowork-studio/toprank/*/; do
  ver=$(basename "$dir")
  if [ "$ver" != "$NEW_VERSION" ] && [ "$ver" != "dev" ]; then
    rm -rf "$dir"
    echo "Removed old cache: $ver"
  fi
done
```

### 第 7 步：写入标记并清除更新状态

```bash
mkdir -p ~/.toprank
echo "$OLD_VERSION" > ~/.toprank/just-upgraded-from
rm -f ~/.toprank/last-update-check
rm -f ~/.toprank/update-snoozed
```

### 第 8 步：显示新增内容

读取 `$NEW_CACHE_DIR/CHANGELOG.md`。找出旧版本与新版本之间的所有版本条目。按主题分组并总结为 3–7 个要点——重点关注面向用户的变更，跳过内部重构。

格式：
```
toprank v{new} — upgraded from v{old}!

What's new:
- [bullet 1]
- [bullet 2]
- ...

The new version will be fully active on your next Claude Code session.
```

### 第 9 步：继续

显示新增内容后，继续执行用户最初调用的技能。

---

## 开发符号链接检测

升级前，检查已安装的缓存目录是否为名为 `dev` 的符号链接：

```bash
CACHE_DIR=$(ls -d ~/.claude/plugins/cache/nowork-studio/toprank/*/ 2>/dev/null | head -1)
if [ -L "${CACHE_DIR%/}" ] && [ "$(basename "$CACHE_DIR")" = "dev" ]; then
  echo "DEV_SYMLINK"
fi
```

如果为 `DEV_SYMLINK`：告知用户“toprank 以开发符号链接的形式安装——它始终指向你的本地源代码（v$(cat "$CACHE_DIR/VERSION" 2>/dev/null | tr -d '[:space:]')）。无需升级。”然后**停止**。不要继续执行第 2–8 步。

---

## 独立使用

直接通过 `/toprank-upgrade` 调用时：

1. 检查开发符号链接（参见上文“开发符号链接检测”）。如果检测到，则停止。

2. 强制执行一次全新的更新检查（绕过缓存和暂缓状态）：
```bash
_UPD_BIN=$(ls ~/.claude/plugins/cache/nowork-studio/toprank/*/bin/toprank-update-check 2>/dev/null | head -1)
[ -n "$_UPD_BIN" ] && _UPD=$("$_UPD_BIN" --force 2>/dev/null || true) || _UPD=""
echo "$_UPD"
```

3. 如果输出 `UPGRADE_AVAILABLE <old> <new>`：按照上面的第 2–8 步操作。

4. 如果没有输出 `UPGRADE_AVAILABLE`：告知用户“你已经在使用最新版本（v{LOCAL}）。”