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
<!-- 由 SKILL.md.tmpl 自动生成 — 请勿直接编辑 -->
<!-- 重新生成：bun run gen:skill-docs -->


## 何时调用此技能

检测全局安装与内置安装，
执行升级，并展示更新内容。当用户要求“升级 gstack”、
“更新 gstack”或“获取最新版本”时使用。

语音触发词（语音转文字别名）：“升级工具”、“更新工具”、“gee stack upgrade”、“g stack upgrade”。

# /gstack-upgrade

将 gstack 升级到最新版本，并展示更新内容。

## 内联升级流程

当所有技能的前置流程检测到 `UPGRADE_AVAILABLE` 时，都会引用本节。

### 第 1 步：询问用户（或自动升级）

首先，检查是否启用了自动升级：
```bash
_AUTO=""
[ "${GSTACK_AUTO_UPGRADE:-}" = "1" ] && _AUTO="true"
[ -z "$_AUTO" ] && _AUTO=$(~/.claude/skills/gstack/bin/gstack-config get auto_upgrade 2>/dev/null || true)
echo "AUTO_UPGRADE=$_AUTO"
```

**如果 `AUTO_UPGRADE=true` 或 `AUTO_UPGRADE=1`：** 跳过 AskUserQuestion。记录“正在自动升级 gstack v{old} → v{new}...”，然后直接进入第 2 步。如果自动升级期间 `./setup` 失败，则从备份（`.bak` 目录）恢复，并警告用户：“自动升级失败 — 已恢复到先前版本。请手动运行 `/gstack-upgrade` 重试。”

**否则**，使用 AskUserQuestion：
- 问题：“gstack **v{new}** 已发布（你当前使用的是 v{old}）。现在升级吗？”
- 选项：["是，立即升级", "始终为我保持最新版本", "暂不升级", "不再询问"]

**如果选择“是，立即升级”：** 进入第 2 步。

**如果选择“始终为我保持最新版本”：**
```bash
~/.claude/skills/gstack/bin/gstack-config set auto_upgrade true
```
告知用户：“已启用自动升级。未来的更新将自动安装。”然后进入第 2 步。

**如果选择“暂不升级”：** 使用逐级延长的退避时间写入延后提醒状态（第一次延后 = 24 小时，第二次 = 48 小时，第三次及以后 = 1 周），然后继续执行当前技能。不要再次提及升级。
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
注意：`{new}` 是 `UPGRADE_AVAILABLE` 输出中的远程版本号 — 请使用更新检查结果中的值进行替换。

告知用户延后提醒的时长：“下次将在 24 小时后提醒”（也可能是 48 小时或 1 周，具体取决于级别）。提示：“在 `~/.gstack/config.yaml` 中设置 `auto_upgrade: true` 可启用自动升级。”

**如果选择“不再询问”：**
```bash
~/.claude/skills/gstack/bin/gstack-config set update_check false
```
告知用户：“已禁用更新检查。运行 `~/.claude/skills/gstack/bin/gstack-config set update_check true` 可重新启用。”
继续执行当前技能。

### 第 2 步：检测安装类型

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

上面输出的安装类型和目录路径将在后续所有步骤中使用。

### 步骤 3：保存旧版本

使用步骤 2 输出的安装目录：

```bash
OLD_VERSION=$(cat "$INSTALL_DIR/VERSION" 2>/dev/null || echo "unknown")
```

### 步骤 4：升级

使用步骤 2 中检测到的安装类型和目录：

**对于 git 安装**（global-git、local-git）：
```bash
cd "$INSTALL_DIR"
# Discard render-footprint dirt BEFORE stashing (#2569): pre-v1.67
# gbrain-enabled installs ran gen:skill-docs:user IN PLACE, leaving
# generated SKILL.md / sections/*.md files permanently modified. Stashing
# that dirt poisons the stash: the post-upgrade `git stash pop` would
# restore STALE generated markdown over the fresh checkout permanently.
# These files are regenerable (setup re-renders brain-aware variants to
# ~/.gstack/render), so discarding is lossless; anything else the user
# changed still reaches the stash untouched. Same file classification as
# migrations/v1.67.0.0.sh, which remains for manual git-pull flows.
git checkout -- 'SKILL.md' '*/SKILL.md' '*/sections/*.md' 2>/dev/null || true
STASH_OUTPUT=$(git stash 2>&1)
git fetch origin
git reset --hard origin/main
./setup
```
如果 `$STASH_OUTPUT` 包含 "Saved working directory"，则警告用户：“注意：本地更改已被暂存（所有已修改的生成版 SKILL.md/sections 文件会先被丢弃——它们将在 setup 时重新生成）。请在 skill 目录中运行 `git stash pop` 以恢复你自己的更改。”

**对于内置安装**（vendored、vendored-global）：
```bash
PARENT=$(dirname "$INSTALL_DIR")
TMP_DIR=$(mktemp -d)
git clone --depth 1 https://github.com/garrytan/gstack.git "$TMP_DIR/gstack"
mv "$INSTALL_DIR" "$INSTALL_DIR.bak"
mv "$TMP_DIR/gstack" "$INSTALL_DIR"
cd "$INSTALL_DIR" && ./setup
rm -rf "$INSTALL_DIR.bak" "$TMP_DIR"
```

### 步骤 4.5：处理本地内置副本

使用步骤 2 中的安装目录。检查是否还存在本地内置副本，以及团队模式是否处于启用状态：

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

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 为 `true`：** 删除内置副本。团队模式使用全局安装作为唯一事实来源。

```bash
cd "$_ROOT"
git rm -r --cached .claude/skills/gstack/ 2>/dev/null || true
if ! grep -qF '.claude/skills/gstack/' .gitignore 2>/dev/null; then
  echo '.claude/skills/gstack/' >> .gitignore
fi
rm -rf "$LOCAL_GSTACK"
```
告知用户：“已删除位于 `$LOCAL_GSTACK` 的内置副本（团队模式已启用——全局安装是唯一事实来源）。准备好后，请提交对 `.gitignore` 的更改。”

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 不为 `true`：** 通过从刚刚升级的主安装中复制来更新它（与 README 中的内置安装方式相同）：
```bash
mv "$LOCAL_GSTACK" "$LOCAL_GSTACK.bak"
cp -Rf "$INSTALL_DIR" "$LOCAL_GSTACK"
rm -rf "$LOCAL_GSTACK/.git"
cd "$LOCAL_GSTACK" && ./setup
rm -rf "$LOCAL_GSTACK.bak"
```
告知用户：“同时已更新 `$LOCAL_GSTACK` 中的内置副本——准备好后请提交 `.claude/skills/gstack/`。”

如果 `./setup` 失败，则从备份恢复并警告用户：
```bash
rm -rf "$LOCAL_GSTACK"
mv "$LOCAL_GSTACK.bak" "$LOCAL_GSTACK"
```
告知用户：“同步失败——已恢复 `$LOCAL_GSTACK` 中的先前版本。请手动运行 `/gstack-upgrade` 重试。”

### 步骤 4.75：运行版本迁移

`./setup` 完成后，运行旧版本与新版本之间所有版本对应的迁移脚本。迁移用于处理仅靠 `./setup` 无法覆盖的状态修复（过时的配置、孤立文件、目录结构变更）。

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
      # GSTACK_INSTALL_DIR: migrations that clean the INSTALL (not just
      # ~/.gstack state) default to ~/.claude/skills/gstack when unset —
      # a repo-local install would silently no-op without this.
      GSTACK_INSTALL_DIR="$INSTALL_DIR" bash "$migration" || echo "  Warning: migration $m_ver had errors (non-fatal)"
    fi
  done
fi
```

迁移是位于 `gstack-upgrade/migrations/` 中的幂等 bash 脚本。每个脚本均以 `v{VERSION}.sh` 命名，并且仅在从较旧版本升级时运行。有关如何添加新迁移的信息，请参阅 CONTRIBUTING.md。

### 步骤 4.8：停止所有过时的守护进程（无条件）

升级前启动的 browse 守护进程会继续运行旧二进制文件的代码，直到被停止为止——它不会因 `git reset --hard` 和 `./setup` 而终止，因为正在运行的进程仍持有旧的可执行文件（#2551）。始终执行此步骤，并使用步骤 2 中检测到的安装目录。

```bash
INSTALL_DIR_PLACEHOLDER="<install dir from Step 2>"
NEW_HASH=$(cat "$INSTALL_DIR_PLACEHOLDER/browse/dist/.version" 2>/dev/null || echo "")
_STATE_FILE="${BROWSE_STATE_FILE:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)/.gstack/browse.json}"
if [ -z "$NEW_HASH" ] || [ ! -f "$_STATE_FILE" ]; then
  echo "DAEMON_CHECK=none (no state file or no fresh build hash)"
else
  DAEMON_PID=$(sed -n 's/.*"pid"[[:space:]]*:[[:space:]]*\([0-9][0-9]*\).*/\1/p' "$_STATE_FILE" | head -1)
  DAEMON_PORT=$(sed -n 's/.*"port"[[:space:]]*:[[:space:]]*\([0-9][0-9]*\).*/\1/p' "$_STATE_FILE" | head -1)
  OLD_HASH=$(sed -n 's/.*"binaryVersion"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$_STATE_FILE" | head -1)
  if [ -z "$DAEMON_PID" ] || ! kill -0 "$DAEMON_PID" 2>/dev/null; then
    echo "DAEMON_CHECK=dead (no live daemon to stop)"
  elif [ "$OLD_HASH" = "$NEW_HASH" ]; then
    echo "DAEMON_CHECK=current (daemon already runs the new binary)"
  elif curl -fsS --max-time 2 "http://127.0.0.1:$DAEMON_PORT/health" 2>/dev/null | grep -q '"status":"healthy"'; then
    echo "DAEMON_CHECK=stale-responsive pid=$DAEMON_PID hash=${OLD_HASH:-unknown} -> $NEW_HASH"
    "$INSTALL_DIR_PLACEHOLDER/browse/dist/browse" stop && echo "DAEMON_STOPPED=yes"
  else
    echo "DAEMON_CHECK=stale-busy pid=$DAEMON_PID hash=${OLD_HASH:-unknown} -> $NEW_HASH"
  fi
fi
```

运行前，请将 `<install dir from Step 2>` 替换为实际安装目录。根据 `DAEMON_CHECK` 的结果进行处理：

1. **`stale-responsive` + `DAEMON_STOPPED=yes`：** 告知用户：“已停止旧的 browse 守护进程（二进制文件 {OLD_HASH} → {NEW_HASH}）。下一条 browse 命令将使用新的二进制文件启动全新的守护进程。”
2. **`stale-busy`：** 守护进程正在运行旧的二进制文件，但当前正在工作——应暂缓处理，升级期间绝不能终止繁忙的守护进程。告知用户：“browse 守护进程仍在运行升级前的二进制文件（{OLD_HASH} → {NEW_HASH}），但目前正忙。完成后，请使用 `browse stop` 停止它；也可以使用 `browse --force-restart stop` 立即强制停止（这会丢失该会话的标签页/cookie/登录状态）。”
3. **`none` / `dead` / `current`：** 无需执行任何操作——不要输出任何内容。

### 步骤 5：写入标记并清除缓存

```bash
mkdir -p ~/.gstack
echo "$OLD_VERSION" > ~/.gstack/just-upgraded-from
rm -f ~/.gstack/last-update-check
rm -f ~/.gstack/update-snoozed
```

### 步骤 6：展示新增内容

读取 `$INSTALL_DIR/CHANGELOG.md`。查找旧版本与新版本之间的所有版本条目。按主题分组，概括为 5-7 个要点。不要让信息过于繁杂——重点关注面向用户的变更。除非影响重大，否则跳过内部重构。

格式：
```
gstack v{new} — upgraded from v{old}!

What's new:
- [bullet 1]
- [bullet 2]
- ...

Happy shipping!
```

### 步骤 7：继续

展示新增内容后，继续执行用户最初调用的技能。升级已完成——无需进一步操作。

---

## 独立使用

直接通过 `/gstack-upgrade` 调用时（而非从前置流程调用）：

1. 强制执行一次全新的更新检查（绕过缓存）：
```bash
~/.claude/skills/gstack/bin/gstack-update-check --force 2>/dev/null || \
.claude/skills/gstack/bin/gstack-update-check --force 2>/dev/null || true
```
根据输出判断是否有可用升级。

2. 如果输出为 `UPGRADE_AVAILABLE <old> <new>`：按照上述步骤 2-6 执行。

3. 如果没有输出（主安装已是最新版本）：检查是否存在过期的本地内置副本。

运行上述步骤 2 中的 bash 代码块，以检测主安装类型和目录（`INSTALL_TYPE` 和 `INSTALL_DIR`）。然后运行上述步骤 4.5 中的检测 bash 代码块，以检查本地内置副本（`LOCAL_GSTACK`）和团队模式状态（`TEAM_MODE`）。

**如果 `LOCAL_GSTACK` 为空**（没有本地内置副本）：告知用户：“你已经在使用最新版本（v{version}）。”

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 为 `true`：** 使用上述步骤 4.5 中的团队模式移除 bash 代码块删除内置副本。告知用户：“全局版本 v{version} 已是最新。已移除过期的内置副本（团队模式已启用）。准备好后，请提交 `.gitignore` 的变更。”

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 不为 `true`**，则比较版本：
```bash
PRIMARY_VER=$(cat "$INSTALL_DIR/VERSION" 2>/dev/null || echo "unknown")
LOCAL_VER=$(cat "$LOCAL_GSTACK/VERSION" 2>/dev/null || echo "unknown")
echo "PRIMARY=$PRIMARY_VER LOCAL=$LOCAL_VER"
```

**如果版本不同：** 按照上述步骤 4.5 中的同步 bash 代码块，从主安装更新本地副本。告知用户：“全局版本 v{PRIMARY_VER} 已是最新。已将本地内置副本从 v{LOCAL_VER} 更新至 v{PRIMARY_VER}。准备好后，请提交 `.claude/skills/gstack/`。”

**如果版本一致：** 告知用户“你使用的是最新版本（v{PRIMARY_VER}）。全局和本地的内置副本均为最新版本。”