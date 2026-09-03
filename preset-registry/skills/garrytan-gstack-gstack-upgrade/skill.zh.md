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

检测全局安装还是 vendored 安装，
执行升级并显示新增内容。当用户要求“升级 gstack”、“更新 gstack”或“获取最新版本”时使用。

语音触发词（语音转文本别名）：“升级工具”、“更新工具”、“gee stack 升级”、“g stack 升级”。

# /gstack-upgrade

将 gstack 升级到最新版本并显示新增内容。

## 内联升级流程

当所有技能前置流程检测到 `UPGRADE_AVAILABLE` 时，都会引用本节。

### 步骤 1：询问用户（或自动升级）

首先，检查是否启用了自动升级：
```bash
_AUTO=""
[ "${GSTACK_AUTO_UPGRADE:-}" = "1" ] && _AUTO="true"
[ -z "$_AUTO" ] && _AUTO=$(~/.claude/skills/gstack/bin/gstack-config get auto_upgrade 2>/dev/null || true)
echo "AUTO_UPGRADE=$_AUTO"
```

**如果 `AUTO_UPGRADE=true` 或 `AUTO_UPGRADE=1`：** 跳过 AskUserQuestion。记录“正在自动升级 gstack v{old} → v{new}...”并直接继续步骤 2。如果自动升级期间 `./setup` 失败，则从备份（`.bak` 目录）恢复，并警告用户：“自动升级失败 — 已恢复之前的版本。请手动运行 `/gstack-upgrade` 重试。”

**否则**，使用 AskUserQuestion：
- 问题：“gstack **v{new}** 可用（当前版本为 v{old}）。现在升级吗？”
- 选项：["是，现在升级", "始终保持最新", "暂时不要", "不再询问"]

**如果选择“是，现在升级”：** 继续步骤 2。

**如果选择“始终保持最新”：**
```bash
~/.claude/skills/gstack/bin/gstack-config set auto_upgrade true
```
告知用户：“已启用自动升级。未来的更新将自动安装。”然后继续步骤 2。

**如果选择“暂时不要”：** 使用逐步延长的退避时间写入暂缓状态（第一次暂缓 = 24 小时，第二次 = 48 小时，第三次及之后 = 1 周），然后继续当前技能。不要再次提及升级。
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
注意：`{new}` 是 `UPGRADE_AVAILABLE` 输出中的远程版本号 — 请从更新检查结果中替换该值。

告知用户暂缓时长：“下次提醒将在 24 小时后”（或根据级别显示 48 小时或 1 周）。提示：“在 `~/.gstack/config.yaml` 中设置 `auto_upgrade: true` 即可自动升级。”

**如果选择“不再询问”：**
```bash
~/.claude/skills/gstack/bin/gstack-config set update_check false
```
告知用户：“已禁用更新检查。运行 `~/.claude/skills/gstack/bin/gstack-config set update_check true` 可重新启用。”
继续当前技能。

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

上面打印的安装类型和目录路径将在后续所有步骤中使用。

### 第 3 步：保存旧版本

使用第 2 步输出中的安装目录：

```bash
OLD_VERSION=$(cat "$INSTALL_DIR/VERSION" 2>/dev/null || echo "unknown")
```

### 第 4 步：升级

使用第 2 步检测到的安装类型和目录：

**对于 git 安装**（global-git、local-git）：

首先尝试快进更新（#2517），这与会话更新自动升级所使用的策略相同。`--autostash` 会在拉取时保留本地修改；由于渲染产物目录中的脏修改可以重新生成，因此先将其丢弃，避免污染 stash（#2569）：

```bash
cd "$INSTALL_DIR"
# Discard render-footprint dirt (#2569): pre-v1.67 gbrain-enabled installs
# ran gen:skill-docs:user IN PLACE, leaving generated SKILL.md / sections
# files permanently modified. They are regenerable (setup re-renders to
# ~/.gstack/render), so discarding is lossless.
git checkout -- 'SKILL.md' '*/SKILL.md' '*/sections/*.md' 2>/dev/null || true
git fetch origin
git pull --ff-only --autostash origin main && ./setup && echo "FF_OK"
```

如果输出以 `FF_OK` 结尾，则升级完成，完全跳过下面的回退步骤。

**回退（快进模式被拒绝：存在本地提交或发生分歧）。**`git reset --hard` 会销毁内容：即使工作树干净，未推送的本地提交也会丢失。请执行门控检查（#2517）：

1. 在 `$INSTALL_DIR` 中运行 `git status --porcelain` 和 `git rev-list origin/main..HEAD --oneline`。
2. 如果两者都为空，则可以证明重置是安全的，无需询问即可运行下面的回退代码块。
3. 否则，通过 AskUserQuestion 询问用户（这是单向操作，会产生破坏性影响），并准确列出将被丢弃的内容：每个有修改的文件，以及每个未推送提交的哈希值和主题。选项：**A)** 丢弃这些内容并升级（重置）——需要明确回复字母；**B)** 中止升级，让用户先行挽救其工作（存在本地提交时推荐此选项）。绝不要根据含糊的回复继续执行。

```bash
cd "$INSTALL_DIR"
STASH_OUTPUT=$(git stash 2>&1)
git reset --hard origin/main
./setup
```

如果 `$STASH_OUTPUT` 包含 "Saved working directory"，请警告用户："注意：本地修改已被 stash（任何修改过的生成的 SKILL.md/sections 文件都已在此之前被丢弃，它们会在 setup 时重新生成）。请在 skill 目录中运行 `git stash pop`，以恢复你自己的修改。"

**对于 vendored 安装**（vendored、vendored-global）：

```bash
PARENT=$(dirname "$INSTALL_DIR")
# A stale .bak from a previously crashed upgrade would make the mv below NEST
# the live install inside it and the failure-restore arm would "restore" the
# stale backup. It may also be the only good copy from that crashed run —
# abort and let the human inspect, never delete it silently.
[ -e "$INSTALL_DIR.bak" ] && { echo "ERROR: stale backup exists at $INSTALL_DIR.bak (from a previous failed upgrade?) — inspect it, salvage/remove it, then re-run." >&2; exit 1; }
TMP_DIR=$(mktemp -d) || { echo "ERROR: mktemp failed — aborting upgrade (install untouched)." >&2; exit 1; }
git clone --depth 1 https://github.com/garrytan/gstack.git "$TMP_DIR/gstack" || { echo "ERROR: clone failed — aborting upgrade (install untouched)." >&2; rm -rf "$TMP_DIR"; exit 1; }
mv "$INSTALL_DIR" "$INSTALL_DIR.bak"
if mv "$TMP_DIR/gstack" "$INSTALL_DIR"; then
  cd "$INSTALL_DIR" && ./setup
  rm -rf "$INSTALL_DIR.bak" "$TMP_DIR"
else
  mv "$INSTALL_DIR.bak" "$INSTALL_DIR"
  echo "ERROR: swap failed — previous install restored; upgrade aborted." >&2
  rm -rf "$TMP_DIR"
  exit 1
fi
```

### 第 4.5 步：处理本地 vendored 副本

使用第 2 步中的安装目录。检查是否还存在本地 vendored 副本，以及团队模式是否已启用：

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

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 为 `true`：** 删除 vendored 副本。团队模式使用全局安装作为唯一事实来源。

```bash
cd "$_ROOT"
git rm -r --cached .claude/skills/gstack/ 2>/dev/null || true
if ! grep -qF '.claude/skills/gstack/' .gitignore 2>/dev/null; then
  echo '.claude/skills/gstack/' >> .gitignore
fi
rm -rf "$LOCAL_GSTACK"
```
告诉用户："已删除位于 `$LOCAL_GSTACK` 的 vendored 副本（团队模式已启用，全局安装是事实来源）。准备好后提交 `.gitignore` 更改。"

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 不是 `true`：** 通过从刚刚升级的主安装目录复制来更新它（与 README vendored 安装采用相同方式）：
```bash
mv "$LOCAL_GSTACK" "$LOCAL_GSTACK.bak"
cp -Rf "$INSTALL_DIR" "$LOCAL_GSTACK"
rm -rf "$LOCAL_GSTACK/.git"
cd "$LOCAL_GSTACK" && ./setup
rm -rf "$LOCAL_GSTACK.bak"
```
告诉用户："同时已更新位于 `$LOCAL_GSTACK` 的 vendored 副本，准备好后提交 `.claude/skills/gstack/`。"

如果 `./setup` 失败，则从备份中恢复并警告用户：
```bash
rm -rf "$LOCAL_GSTACK"
mv "$LOCAL_GSTACK.bak" "$LOCAL_GSTACK"
```
告诉用户："同步失败，已恢复 `$LOCAL_GSTACK` 中的先前版本。运行 `/gstack-upgrade` 手动重试。"

### 第 4.75 步：运行版本迁移

`./setup` 完成后，运行旧版本与新版本之间的所有迁移脚本。迁移脚本用于处理仅靠 `./setup` 无法覆盖的状态修复（过时的配置、孤立文件、目录结构变更）。

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

迁移脚本是位于 `gstack-upgrade/migrations/` 中的幂等 bash 脚本。每个脚本都命名为
`v{VERSION}.sh`，并且仅在从较旧版本升级时运行。有关如何添加新迁移，请参阅 CONTRIBUTING.md。

### 步骤 4.8：停止任何过时的守护进程（无条件执行）

在升级之前启动的浏览守护进程会继续提供旧二进制文件中的代码，直到它被停止为止——即使执行了
`git reset --hard` 和 `./setup`，它也仍然存在，因为正在运行的进程持有旧的可执行文件（#2551）。始终执行此步骤，并使用步骤 2 中检测到的安装目录。

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

在运行前，将 `<install dir from Step 2>` 替换为实际的安装目录。解释 `DAEMON_CHECK` 结果：

1. **`stale-responsive` + `DAEMON_STOPPED=yes`：** 告知用户：“已停止旧的浏览守护进程（二进制文件 {OLD_HASH} → {NEW_HASH}）。下一条 browse 命令将在新二进制文件上启动全新的守护进程。”
2. **`stale-busy`：** 守护进程正在运行旧二进制文件，但正处于工作状态——应将其交由自身完成，升级期间绝不能终止忙碌的守护进程。告知用户：“浏览守护进程仍在运行升级前的二进制文件（{OLD_HASH} → {NEW_HASH}），但当前正忙。完成后，请使用 `browse stop` 停止它；或者使用 `browse --force-restart stop` 立即强制停止（会丢失该会话的标签页、cookies 和登录信息）。”
3. **`none` / `dead` / `current`：** 无需执行任何操作——不输出任何内容。

### 步骤 5：写入标记并清除缓存

```bash
mkdir -p ~/.gstack
echo "$OLD_VERSION" > ~/.gstack/just-upgraded-from
rm -f ~/.gstack/last-update-check
rm -f ~/.gstack/update-snoozed
```

### 步骤 6：查看更新内容

读取 `$INSTALL_DIR/CHANGELOG.md`。查找旧版本与新版本之间的所有版本条目。按主题分组，概括为 5-7 条要点。不要让内容过载——重点关注面向用户的变更。除非内部重构具有重要意义，否则跳过这些内容。

格式：
```
gstack v{new} — upgraded from v{old}!

What's new:
- [bullet 1]
- [bullet 2]
- ...

Happy shipping!
```

### 第 7 步：继续

显示 What's New 后，继续执行用户最初调用的 skill。升级已完成，无需进一步操作。

---

## 独立使用

直接以 `/gstack-upgrade` 调用时（不是从前置流程调用）：

1. 强制执行全新的更新检查（绕过缓存）：
```bash
~/.claude/skills/gstack/bin/gstack-update-check --force 2>/dev/null || \
.claude/skills/gstack/bin/gstack-update-check --force 2>/dev/null || true
```
使用输出结果确定是否有可用升级。

2. 如果输出 `UPGRADE_AVAILABLE <old> <new>`：按照上面的第 2-6 步执行。

3. 如果没有输出（主安装已是最新版本）：检查是否存在过时的本地 vendored 副本。

运行上面的第 2 步 bash 代码块，以检测主安装类型和目录（`INSTALL_TYPE` 和 `INSTALL_DIR`）。然后运行上面的第 4.5 步检测 bash 代码块，以检查本地 vendored 副本（`LOCAL_GSTACK`）和团队模式状态（`TEAM_MODE`）。

**如果 `LOCAL_GSTACK` 为空**（不存在本地 vendored 副本）：告知用户“You're already on the latest version (v{version}).”

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 为 `true`：**使用上面的第 4.5 步团队模式移除 bash 代码块删除 vendored 副本。告知用户：“Global v{version} is up to date. Removed stale vendored copy (team mode active). Commit the `.gitignore` change when ready.”

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 不为 `true`**，比较版本：
```bash
PRIMARY_VER=$(cat "$INSTALL_DIR/VERSION" 2>/dev/null || echo "unknown")
LOCAL_VER=$(cat "$LOCAL_GSTACK/VERSION" 2>/dev/null || echo "unknown")
echo "PRIMARY=$PRIMARY_VER LOCAL=$LOCAL_VER"
```

**如果版本不同：**按照上面的第 4.5 步同步 bash 代码块，将本地副本从主安装更新。告知用户：“Global v{PRIMARY_VER} is up to date. Updated local vendored copy from v{LOCAL_VER} → v{PRIMARY_VER}. Commit `.claude/skills/gstack/` when you're ready.”

**如果版本相同：**告知用户“You're on the latest version (v{PRIMARY_VER}). Global and local vendored copy are both up to date.”