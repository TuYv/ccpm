---
name: gstack-upgrade
version: 1.1.0
description: Upgrade gstack to the latest version.
triggers:
  - upgrade gstack
  - update gstack version
  - get latest gstack
allowed-tools:
  - Bash
  - Read
  - Write
  - AskUserQuestion
---
<!-- 自动从 SKILL.md.tmpl 生成 — 请勿直接编辑 -->
<!-- 重新生成：bun run gen:skill-docs -->


## 何时调用此技能

检测全局安装与 vendored 安装，
并执行升级，显示更新内容。使用场景为收到“upgrade gstack”、“update gstack”或“get latest version”的请求时。

语音触发词（语音转文本别名）：“upgrade the tools”、“update the tools”、“gee stack upgrade”、“g stack upgrade”。

# /gstack-upgrade

将 gstack 升级到最新版本并显示更新内容。

## 内联升级流程

此部分会被所有在检测到 `UPGRADE_AVAILABLE` 时的技能前导语引用。

### 步骤 1：询问用户（或自动升级）

首先检查是否已启用自动升级：
```bash
_AUTO=""
[ "${GSTACK_AUTO_UPGRADE:-}" = "1" ] && _AUTO="true"
[ -z "$_AUTO" ] && _AUTO=$(~/.claude/skills/gstack/bin/gstack-config get auto_upgrade 2>/dev/null || true)
echo "AUTO_UPGRADE=$_AUTO"
```

**如果 `AUTO_UPGRADE=true` 或 `AUTO_UPGRADE=1`：** 跳过 AskUserQuestion。记录“Auto-upgrading gstack v{old} → v{new}...”，并直接进入步骤 2。若自动升级期间 `./setup` 失败，则从备份（`.bak` 目录）恢复并警告用户：“Auto-upgrade failed — restored previous version. Run `/gstack-upgrade` manually to retry.”

**否则**，使用 AskUserQuestion：
- 问题： “gstack **v{new}** is available (you're on v{old}). Upgrade now?”
- 选项：["Yes, upgrade now"（立即升级）, "Always keep me up to date"（始终保持最新）, "Not now"（暂不升级）, "Never ask again"（不再询问）]

**如果选择“Yes, upgrade now”：** 进入步骤 2。

**如果选择“Always keep me up to date”：**
```bash
~/.claude/skills/gstack/bin/gstack-config set auto_upgrade true
```
告知用户：“Auto-upgrade enabled. Future updates will install automatically.” 然后进入步骤 2。

**如果选择“Not now”：** 写入带有递增退避的延迟状态（首次延迟 24 小时，第二次 48 小时，第三次及以后 1 周），然后继续执行当前技能。不要再次提及升级。
```bash
_SNOOZE_FILE="$HOME/.gstack/update-snoozed"
_REMOTE_VER="{new}"
_CUR_LEVEL=0
if [ -f "$_SNOOZE_FILE" ]; then
  _SNOOZED_VER=$(awk '{print $1}' "$_SNOOZE_FILE")
  if [ "$_SNOOZED_VER" = "$_REMOTE_VER" ]; then
    _CUR_LEVEL=$(awk '{print $2}' "$_SNOOZE_FILE")
    case "$_CUR_LEVEL" in *[!0-9]*) _CUR_LEVEL=0 ;; esac
  fi
fi
_NEW_LEVEL=$((_CUR_LEVEL + 1))
[ "$_NEW_LEVEL" -gt 3 ] && _NEW_LEVEL=3
echo "$_REMOTE_VER $_NEW_LEVEL $(date +%s)" > "$_SNOOZE_FILE"
```
注意：`{new}` 是来自 `UPGRADE_AVAILABLE` 输出的远程版本——请从更新检查结果中替换。

告知用户延迟时长：“Next reminder in 24h”（或 48h 或 1 week，取决于等级）。提示：“Set `auto_upgrade: true` in `~/.gstack/config.yaml` for automatic upgrades.”

**如果选择“Never ask again”：**
```bash
~/.claude/skills/gstack/bin/gstack-config set update_check false
```
告知用户：“Update checks disabled. Run `~/.claude/skills/gstack/bin/gstack-config set update_check true` to re-enable.”
继续执行当前技能。

### 步骤 2：检测安装类型

```bash
if [ -d "$HOME/.claude/skills/gstack/.git" ]; then
  INSTALL_TYPE="global-git"
  INSTALL_DIR="$HOME/.claude/skills/gstack"
elif [ -d "$HOME/.gstack/repos/gstack/.git" ]; then
  INSTALL_TYPE="global-git"
  INSTALL_DIR="$HOME/.gstack/repos/gstack"
elif [ -d ".claude/skills/gstack/.git" ]; then
  INSTALL_TYPE="local-git"
  INSTALL_DIR=".claude/skills/gstack"
elif [ -d ".agents/skills/gstack/.git" ]; then
  INSTALL_TYPE="local-git"
  INSTALL_DIR=".agents/skills/gstack"
elif [ -d ".claude/skills/gstack" ]; then
  INSTALL_TYPE="vendored"
  INSTALL_DIR=".claude/skills/gstack"
elif [ -d "$HOME/.claude/skills/gstack" ]; then
  INSTALL_TYPE="vendored-global"
  INSTALL_DIR="$HOME/.claude/skills/gstack"
else
  echo "ERROR: gstack not found"
  exit 1
fi
echo "Install type: $INSTALL_TYPE at $INSTALL_DIR"
```

上面打印的安装类型和目录路径将用于后续所有步骤。

### 步骤 3：保存旧版本

使用步骤 2 输出的安装目录：

```bash
OLD_VERSION=$(cat "$INSTALL_DIR/VERSION" 2>/dev/null || echo "unknown")
```

### 步骤 4：升级

使用步骤 2 检测到的安装类型和目录：

**对于 git 安装**（global-git、local-git）：
```bash
cd "$INSTALL_DIR"
STASH_OUTPUT=$(git stash 2>&1)
git fetch origin
git reset --hard origin/main
./setup
```
如果 `$STASH_OUTPUT` 包含“Saved working directory”，则警告用户：“Note: local changes were stashed. Run `git stash pop` in the skill directory to restore them.”

**对于 vendored 安装**（vendored、vendored-global）：
```bash
PARENT=$(dirname "$INSTALL_DIR")
TMP_DIR=$(mktemp -d)
git clone --depth 1 https://github.com/garrytan/gstack.git "$TMP_DIR/gstack"
mv "$INSTALL_DIR" "$INSTALL_DIR.bak"
mv "$TMP_DIR/gstack" "$INSTALL_DIR"
cd "$INSTALL_DIR" && ./setup
rm -rf "$INSTALL_DIR.bak" "$TMP_DIR"
```

### 步骤 4.5：处理本地 vendored 副本

使用步骤 2 的安装目录。检查是否还有本地 vendored 副本，以及是否启用了团队模式：

```bash
_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
LOCAL_GSTACK=""
if [ -n "$_ROOT" ] && [ -d "$_ROOT/.claude/skills/gstack" ]; then
  _RESOLVED_LOCAL=$(cd "$_ROOT/.claude/skills/gstack" && pwd -P)
  _RESOLVED_PRIMARY=$(cd "$INSTALL_DIR" && pwd -P)
  if [ "$_RESOLVED_LOCAL" != "$_RESOLVED_PRIMARY" ]; then
    LOCAL_GSTACK="$_ROOT/.claude/skills/gstack"
  fi
fi
_TEAM_MODE=$(~/.claude/skills/gstack/bin/gstack-config get team_mode 2>/dev/null || echo "false")
echo "LOCAL_GSTACK=$LOCAL_GSTACK"
echo "TEAM_MODE=$_TEAM_MODE"
```

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 为 `true`：** 删除 vendored 副本。团队模式使用全局安装作为唯一可信来源。

```bash
cd "$_ROOT"
git rm -r --cached .claude/skills/gstack/ 2>/dev/null || true
if ! grep -qF '.claude/skills/gstack/' .gitignore 2>/dev/null; then
  echo '.claude/skills/gstack/' >> .gitignore
fi
rm -rf "$LOCAL_GSTACK"
```
告知用户：“Removed vendored copy at `$LOCAL_GSTACK` (team mode active — global install is the source of truth). Commit the `.gitignore` change when ready.”

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 不为 `true`：** 按 README 的 vendored 安装方式从新升级的主安装中复制进行更新：
```bash
mv "$LOCAL_GSTACK" "$LOCAL_GSTACK.bak"
cp -Rf "$INSTALL_DIR" "$LOCAL_GSTACK"
rm -rf "$LOCAL_GSTACK/.git"
cd "$LOCAL_GSTACK" && ./setup
rm -rf "$LOCAL_GSTACK.bak"
```
告知用户：“Also updated vendored copy at `$LOCAL_GSTACK` — commit `.claude/skills/gstack/` when you're ready.”

如果 `./setup` 失败，则恢复备份并警告用户：
```bash
rm -rf "$LOCAL_GSTACK"
mv "$LOCAL_GSTACK.bak" "$LOCAL_GSTACK"
```
告知用户：“Sync failed — restored previous version at `$LOCAL_GSTACK`. Run `/gstack-upgrade` manually to retry.”

### 步骤 4.75：运行版本迁移

`./setup` 完成后，运行旧版本与新版本之间的迁移脚本。
这些迁移用于处理 `./setup` 单独无法覆盖的状态修复（过期配置、孤立文件、目录结构变更）。

```bash
MIGRATIONS_DIR="$INSTALL_DIR/gstack-upgrade/migrations"
if [ -d "$MIGRATIONS_DIR" ]; then
  for migration in $(find "$MIGRATIONS_DIR" -maxdepth 1 -name 'v*.sh' -type f 2>/dev/null | sort -V); do
    # Extract version from filename: v0.15.2.0.sh → 0.15.2.0
    m_ver="$(basename "$migration" .sh | sed 's/^v//')"
    # Run if this migration version is newer than old version
    # (simple string compare works for dotted versions with same segment count)
    if [ "$OLD_VERSION" != "unknown" ] && [ "$(printf '%s\n%s' "$OLD_VERSION" "$m_ver" | sort -V | head -1)" = "$OLD_VERSION" ] && [ "$OLD_VERSION" != "$m_ver" ]; then
      echo "Running migration $m_ver..."
      bash "$migration" || echo "  Warning: migration $m_ver had errors (non-fatal)"
    fi
  done
fi
```

迁移脚本是位于 `gstack-upgrade/migrations/` 下的幂等 bash 脚本。每个脚本命名为
`v{VERSION}.sh`，仅在从旧版本升级时运行。新增迁移的方式见 CONTRIBUTING.md。

### 步骤 5：写入标记 + 清理缓存

```bash
mkdir -p ~/.gstack
echo "$OLD_VERSION" > ~/.gstack/just-upgraded-from
rm -f ~/.gstack/last-update-check
rm -f ~/.gstack/update-snoozed
```

### 第6步：显示新增内容

读取 `$INSTALL_DIR/CHANGELOG.md`。查找旧版本与新版本之间的所有版本条目。按主题归纳为 5-7 个要点。不要过度展开——重点关注面向用户的变更。除非具备明显重要性，否则跳过内部重构。

格式：
```
gstack v{new} — upgraded from v{old}!

What's new:
- [bullet 1]
- [bullet 2]
- ...

Happy shipping!
```

### 第7步：继续

显示 `What's New` 后，继续执行用户最初调用的任意 skill。升级已完成——不需要进一步操作。

---

## 独立用法

当直接通过 `/gstack-upgrade` 调用时（而非来自前言）：

1. 强制执行一次全新更新检查（绕过缓存）：
```bash
~/.claude/skills/gstack/bin/gstack-update-check --force 2>/dev/null || \
.claude/skills/gstack/bin/gstack-update-check --force 2>/dev/null || true
```
使用输出结果判断是否有可用升级。

2. 如果出现 `UPGRADE_AVAILABLE <old> <new>`：按上述第2-6步执行。

3. 如果无输出（主版本已是最新）：检查是否存在过期的本地 vendored 副本。

先运行上述第2步 bash 块以检测主安装类型和目录（`INSTALL_TYPE` 和 `INSTALL_DIR`）。然后运行上述第4.5步检测 bash 块，检查本地 vendored 副本（`LOCAL_GSTACK`）及团队模式状态（`TEAM_MODE`）。

**如果 `LOCAL_GSTACK` 为空**（不存在本地 vendored 副本）：告知用户 “You're already on the latest version (v{version}).”

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 为 `true`：** 使用上面的第4.5步团队模式移除 bash 块移除 vendored 副本。告知用户： “Global v{version} is up to date. Removed stale vendored copy (team mode active). Commit the `.gitignore` change when ready.”

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 不是 `true`：** 比较版本：
```bash
PRIMARY_VER=$(cat "$INSTALL_DIR/VERSION" 2>/dev/null || echo "unknown")
LOCAL_VER=$(cat "$LOCAL_GSTACK/VERSION" 2>/dev/null || echo "unknown")
echo "PRIMARY=$PRIMARY_VER LOCAL=$LOCAL_VER"
```

**如果版本不同：** 按上述第4.5步同步 bash 块从主版本更新本地副本。告知用户： “Global v{PRIMARY_VER} is up to date. Updated local vendored copy from v{LOCAL_VER} → v{PRIMARY_VER}. Commit `.claude/skills/gstack/` when you're ready.”

**如果版本一致：** 告知用户 “You're on the latest version (v{PRIMARY_VER}). Global and local vendored copy are both up to date.”
