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
<!-- AUTO-GENERATED from SKILL.md.tmpl — do not edit directly -->
<!-- Regenerate: bun run gen:skill-docs -->


## 何时调用此技能

检测全局安装还是 vendored 安装，
执行升级，并展示新增内容。当用户要求“升级 gstack”、“更新 gstack”或“获取最新版本”时使用。

语音触发词（语音转文字别名）：“升级工具”、“更新工具”、“gee stack upgrade”、“g stack upgrade”。

# /gstack-upgrade

将 gstack 升级到最新版本，并展示新增内容。

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

**如果 `AUTO_UPGRADE=true` 或 `AUTO_UPGRADE=1`：** 跳过 AskUserQuestion。记录“正在自动升级 gstack v{old} → v{new}...”并直接进入步骤 2。如果设置失败，请遵循步骤 4 中针对安装的恢复措施：vendored 安装恢复其备份；git 安装记录升级前的提交后停止，不执行破坏性重置。除非恢复确实成功，否则绝不要声称已完成恢复。

**否则**，使用 AskUserQuestion：
- 问题：“gstack **v{new}** 可用（当前为 v{old}）。现在升级？”
- 选项：["是，现在升级", "始终保持最新", "暂不升级", "不再询问"]

**如果选择“是，现在升级”：** 进入步骤 2。

**如果选择“始终保持最新”：**
```bash
~/.claude/skills/gstack/bin/gstack-config set auto_upgrade true
```
告知用户：“已启用自动升级。未来的更新将自动安装。”然后进入步骤 2。

**如果选择“暂不升级”：** 使用逐步递增的退避时间写入延后状态（第一次延后 = 24 小时，第二次 = 48 小时，第三次及以后 = 1 周），然后继续当前技能。不要再次提及升级。
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
注意：`{new}` 是 `UPGRADE_AVAILABLE` 输出中的远程版本号，请从更新检查结果中替换该值。

告知用户延后时长：“下次提醒将在 24 小时后”（或根据级别显示 48 小时或 1 周）。提示：“在 `~/.gstack/config.yaml` 中设置 `auto_upgrade: true` 即可自动升级。”

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
将 `INSTALL_DIR` 解析为绝对路径。显式传递 `INSTALL_TYPE`、`INSTALL_DIR`、`OLD_VERSION` 以及之后的 `NEW_VERSION`：如果工具调用使用全新的 shell，请在运行代码块之前根据捕获的输出重新赋值。不要依赖之前调用的工作目录或 shell 变量。

### 步骤 3：保存旧版本

使用步骤 2 输出中的安装目录：

```bash
OLD_VERSION=$(cat "$INSTALL_DIR/VERSION" 2>/dev/null || echo "unknown")
echo "OLD_VERSION=$OLD_VERSION"
```

### 步骤 4：升级

使用步骤 2 中检测到的安装类型和目录：

**对于 git 安装**（global-git、local-git）：

先执行快进更新（#2517），与会话更新自动升级所使用的策略相同。`--autostash` 会在拉取过程中保留本地编辑；先丢弃 render-footprint 脏改动，因为这些改动可以重新生成，并且会污染 stash（#2569）：

```bash
cd "$INSTALL_DIR"
# Discard render-footprint dirt (#2569): pre-v1.67 gbrain-enabled installs
# ran gen:skill-docs:user IN PLACE, leaving generated SKILL.md / sections
# files permanently modified. They are regenerable (setup re-renders to
# ~/.gstack/render), so discarding is lossless.
git checkout -- 'SKILL.md' '*/SKILL.md' '*/sections/*.md' 2>/dev/null || true
git fetch origin
PRE_UPGRADE_COMMIT=$(git rev-parse HEAD)
echo "PRE_UPGRADE_COMMIT=$PRE_UPGRADE_COMMIT"
if git pull --ff-only --autostash origin main; then
  if ./setup; then echo "FF_OK"; else echo "SETUP_FAILED: git update succeeded; stop and inspect setup output (previous commit: $PRE_UPGRADE_COMMIT)" >&2; exit 1; fi
else
  echo "FF_REFUSED"
fi
```

如果输出以 `FF_OK` 结尾，则升级完成，完全跳过下面的回退步骤。  
如果出现 `SETUP_FAILED`，请停止；保留用户的更改，并报告恢复提交。git 路径不存在 `.bak`。不要仅仅因为 setup 失败就进入分叉回退流程。只有在 `FF_REFUSED` 时才进入该流程，并且要先检查拉取错误；网络或身份验证失败应停止操作以进行修复，而不是重置。

**回退（仅快进更新被拒绝：存在本地提交或发生分叉）。** `git reset
--hard` 会**销毁**内容：即使工作树干净，未推送的本地提交也会丢失。请进行门控检查（#2517）：

1. 在 `$INSTALL_DIR` 中运行 `git status --porcelain` 和 `git rev-list origin/main..HEAD --oneline`
   。
2. 如果两者均为空，则可以证明重置是安全的——无需询问，直接运行下面的回退代码块。
3. 否则，通过 AskUserQuestion 询问（这是不可逆操作——具有破坏性），准确列出将被丢弃的内容：每个有改动的文件，以及每个未推送提交的哈希值和主题。选项：**A)** 丢弃这些内容并升级（重置）——需要明确输入该字母；**B)** 中止升级，以便用户先行挽救其工作（本地存在提交时推荐此选项）。切勿根据含糊的回复继续操作。

```bash
cd "$INSTALL_DIR"
STASH_OUTPUT=$(git stash 2>&1)
git reset --hard origin/main
./setup
```
如果 `$STASH_OUTPUT` 包含 "Saved working directory"，请警告用户："注意：本地更改已被暂存（任何已修改的 generated SKILL.md/sections 文件都会先被丢弃——它们会在 setup 时重新生成）。请在 skill 目录中运行 `git stash pop` 以恢复你自己的更改。"

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
mv "$INSTALL_DIR" "$INSTALL_DIR.bak" || { rm -rf "$TMP_DIR"; exit 1; }
if mv "$TMP_DIR/gstack" "$INSTALL_DIR"; then
  if (cd "$INSTALL_DIR" && ./setup); then
    rm -rf "$INSTALL_DIR.bak" "$TMP_DIR"
  else
    rm -rf "$INSTALL_DIR"
    mv "$INSTALL_DIR.bak" "$INSTALL_DIR" || { echo "ERROR: restore failed; backup retained." >&2; exit 1; }
    rm -rf "$TMP_DIR"
    echo "ERROR: setup failed; previous install restored." >&2
    exit 1
  fi
else
  mv "$INSTALL_DIR.bak" "$INSTALL_DIR"
  echo "ERROR: swap failed — previous install restored; upgrade aborted." >&2
  rm -rf "$TMP_DIR"
  exit 1
fi
```

### 第 4.5 步：处理本地 vendored 副本

使用第 2 步中的安装目录。检查是否同时存在本地 vendored 副本，以及团队模式是否已启用：

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

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 为 `true`：** 移除 vendored 副本。团队模式使用全局安装作为唯一事实来源。

```bash
cd "$_ROOT"
git rm -r --cached .claude/skills/gstack/ 2>/dev/null || true
if ! grep -qF '.claude/skills/gstack/' .gitignore 2>/dev/null; then
  echo '.claude/skills/gstack/' >> .gitignore
fi
rm -rf "$LOCAL_GSTACK"
```
告知用户：“已移除 `$LOCAL_GSTACK` 处的 vendored 副本（团队模式已启用，全局安装是事实来源）。准备好后提交 `.gitignore` 更改。”

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 不是 `true`：** 从刚刚升级完成的主安装中复制内容来更新它（与 README vendored 安装采用相同方法）：
```bash
[ -e "$LOCAL_GSTACK.bak" ] && { echo "ERROR: stale vendored backup; inspect it before retrying." >&2; exit 1; }
mv "$LOCAL_GSTACK" "$LOCAL_GSTACK.bak" || exit 1
if cp -Rf "$INSTALL_DIR" "$LOCAL_GSTACK" && rm -rf "$LOCAL_GSTACK/.git" && (cd "$LOCAL_GSTACK" && ./setup); then
  rm -rf "$LOCAL_GSTACK.bak"
  echo "LOCAL_SYNC_OK"
else
  rm -rf "$LOCAL_GSTACK"
  mv "$LOCAL_GSTACK.bak" "$LOCAL_GSTACK" || { echo "ERROR: restore failed; backup retained." >&2; exit 1; }
  echo "ERROR: sync failed; previous vendored copy restored." >&2
  exit 1
fi
```
仅当出现 `LOCAL_SYNC_OK` 时，告知用户：“同时已更新 `$LOCAL_GSTACK` 处的 vendored 副本——准备好后提交 `.claude/skills/gstack/`。”否则停止并报告恢复结果；不要继续执行迁移，也不要宣布成功。

### 步骤 4.75：运行版本迁移

`./setup` 完成后，运行旧版本与新版本之间的所有迁移脚本。迁移用于处理仅靠 `./setup` 无法覆盖的状态修复（陈旧配置、孤立文件、目录结构变更）。

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

迁移是位于 `gstack-upgrade/migrations/` 中的幂等 bash 脚本。每个脚本都以
`v{VERSION}.sh` 命名，并且仅在从较旧版本升级时运行。有关如何添加新迁移，请参阅 CONTRIBUTING.md。

### 步骤 4.8：停止任何过期的 daemon（无条件）

升级前启动的 browse 守护进程会继续提供旧二进制的代码，
直到它被停止为止——即使执行了 `git reset --hard` 和 `./setup`，它仍会继续运行，因为
正在运行的进程持有旧的可执行文件（#2551）。始终执行此步骤，并使用第 2 步中检测到的安装目录。

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

运行前，将 `<install dir from Step 2>` 替换为实际的安装目录。解释 `DAEMON_CHECK` 的结果：

1. **`stale-responsive` + `DAEMON_STOPPED=yes`：** 告知用户“已停止旧的 browse 守护进程（二进制版本 {OLD_HASH} → {NEW_HASH}）。下一条 browse 命令会使用新的二进制文件启动全新的守护进程。”
2. **`stale-busy`：** 守护进程正在运行旧二进制，但正处于工作过程中——将其交给它继续处理，升级期间绝不要终止忙碌中的守护进程。告知用户：“一个 browse 守护进程仍在运行升级前的二进制版本（{OLD_HASH} → {NEW_HASH}），但当前正忙。完成后，使用 `browse stop` 停止它——或者立即使用 `browse --force-restart stop` 强制停止（会丢失该会话的标签页、cookie 和登录信息）。”
3. **`none` / `dead` / `current`：** 无需处理——不输出任何内容。

### 第 5 步：写入标记 + 清除缓存

```bash
mkdir -p ~/.gstack
echo "$OLD_VERSION" > ~/.gstack/just-upgraded-from
rm -f ~/.gstack/last-update-check
rm -f ~/.gstack/update-snoozed
```

### 第 6 步：展示更新内容

读取 `$INSTALL_DIR/CHANGELOG.md`。找出旧版本与新版本之间的所有版本条目。按主题分组，用 5-7 条要点进行总结。不要让用户应接不暇——重点关注面向用户的变更。除非内部重构具有重要意义，否则跳过相关内容。

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

显示“What's New”后，继续执行用户最初调用的 skill。升级已完成，无需进一步操作。

---

## 独立使用

直接以 `/gstack-upgrade` 调用时（不是从前置说明中调用）：

1. 强制执行全新的更新检查（绕过缓存）：
```bash
~/.claude/skills/gstack/bin/gstack-update-check --force 2>/dev/null || \
.claude/skills/gstack/bin/gstack-update-check --force 2>/dev/null || true
```
使用输出确定是否有可用升级。

2. 如果输出 `UPGRADE_AVAILABLE <old> <new>`：按照上面的步骤 2-6 执行。

3. 如果没有输出（主安装已是最新版本）：检查本地过时的 vendored 副本。

运行上面的步骤 2 bash 代码块，以检测主安装类型和目录（`INSTALL_TYPE` 和 `INSTALL_DIR`）。然后运行上面的步骤 4.5 检测 bash 代码块，以检查本地 vendored 副本（`LOCAL_GSTACK`）和团队模式状态（`TEAM_MODE`）。

**如果 `LOCAL_GSTACK` 为空**（没有本地 vendored 副本）：告知用户“你已经使用最新版本（v{version}）。”

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 为 `true`：**使用上面的步骤 4.5 团队模式移除 bash 代码块删除 vendored 副本。告知用户：“全局 v{version} 已是最新版本。已删除过时的 vendored 副本（团队模式已启用）。准备好后提交 `.gitignore` 更改。”

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 不为 `true`**，比较版本：
```bash
PRIMARY_VER=$(cat "$INSTALL_DIR/VERSION" 2>/dev/null || echo "unknown")
LOCAL_VER=$(cat "$LOCAL_GSTACK/VERSION" 2>/dev/null || echo "unknown")
echo "PRIMARY=$PRIMARY_VER LOCAL=$LOCAL_VER"
```

**如果版本不同：**按照上面的步骤 4.5 同步 bash 代码块，从主安装更新本地副本。告知用户：“全局 v{PRIMARY_VER} 已是最新版本。已将本地 vendored 副本从 v{LOCAL_VER} → v{PRIMARY_VER} 更新。准备好后提交 `.claude/skills/gstack/`。”

**如果版本相同：**告知用户“你使用的是最新版本（v{PRIMARY_VER}）。全局和本地 vendored 副本均已是最新版本。”