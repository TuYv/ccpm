---
name: setup
description: Install + verify ax (the agent experience layer). Triggers when the user says "install ax", "set up ax", "ax not found", "ax doctor", "is ax running", "fix ax install", "first-time ax setup", or any setup question about the ax CLI / skills / daemon. Walks the install via the install.sh + skills.sh + first ingest, validates with `ax doctor`, and points the user at ax:retro (experiment loop) and ax:extract-workflow (reconstruct workflow behind shipped artifacts).
---
# ax:setup

安装并验证 ax——本地 agent-experience 图谱。完成此技能后，用户将在 PATH 中拥有 `ax` CLI、一个已摄取的本地图谱（内嵌 DuckDB，无需运行或监视守护进程），以及已加载到 Claude Code 中的 ax 技能。

此技能有意保持简洁：仅执行安装和验证。日常使用请参阅 `ax:retro`（实验循环）、`ax:extract-workflow`（重构已交付产物背后的操作配方），或直接运行 CLI。

## 触发时机

触发短语：
- “install ax” / “set up ax” / “first-time ax setup”
- “ax not found” / “where is axctl”
- “ax doctor” / “is ax running” / “is ax working”
- “what does ax give me”

不要在无关工作中自动触发，也不要在用户已经深入 ax 工作流（`ax improve list`、`ax recall …`）时自动触发。

## 安装

```bash
# 1. Download the installer and inspect it before executing. Review the target
#    paths first; this repository does not publish a checksum for install.sh.
(
    set -eu
    ax_install_dir="$(mktemp -d "${TMPDIR:-/tmp}/ax-install.XXXXXXXX")"
    trap 'rm -f "$ax_install_dir/install.sh"; rmdir "$ax_install_dir"' EXIT
    curl -fsSL https://raw.githubusercontent.com/Necmttn/ax/main/install.sh -o "$ax_install_dir/install.sh"
    less "$ax_install_dir/install.sh"
    read -r -p "Execute this installer? [y/N] " answer
    case "$answer" in
        [yY][eE][sS]|[yY]) bash "$ax_install_dir/install.sh" ;;
        *) echo "Installer not run."; exit 1 ;;
    esac
)
```

仅在安装程序成功完成后继续。如果下载失败、审查命令失败、拒绝批准或输入结束，安装都会停止。代理会检查下载的文件，并在执行该文件前获得批准。私有目录可防止其他本地用户替换该文件。

```bash
# 2. Review the skill changes and confirm before installing into the selected
#    agent skill directory. Omit -g unless a global install is intentional.
npx skills add Necmttn/ax -a codex

# 3. First ingest - seeds the graph from the user's last 7 days of
#    Claude Code + Codex transcripts.
PATH="$HOME/.local/bin:$PATH" ax ingest --since=7
```

如果任何步骤失败，请运行 `ax doctor --json` 并指出阻塞原因。如果第 1 步之后仍找不到 `ax`，用户很可能使用了自定义的 shell rc——告知他们将 `$HOME/.local/bin` 添加到 PATH 中。

## 验证

```bash
ax --version              # expect axctl v0.1.x
ax doctor --json          # expect ok: true for cache + skills
ax skills taste --limit=5 # rank top skills - proof the graph populated
```

具体故障模式：
- `cache` 检查失败 / 没有记录成功的 ingest → 运行 `ax ingest`。无需启动守护进程——该图谱是已发布的 DuckDB 快照，按需重建。过期的图谱也会自动修复：任何基于 DB 的命令都会自行派生一个经过防抖处理的后台 `ax ingest`（设置 `AX_NO_AUTO_INGEST=1` 可选择退出）。
- ingest 后技能调用次数为零 → 用户使用了不同的 Claude transcripts 路径。设置 `AX_TRANSCRIPTS_DIR` 并重新 ingest。

## 为 ax 无法分类的技能添加标签（替用户执行此操作）

ax 会为技能添加带有*角色*的标签（例如 framing、execution、verification），因此
`ax skills weighted` 会按使用次数 × 角色进行排名，而不是按原始计数排名。用户调用某个技能 ≥3 次但未指定角色时，该技能会被标记为“未分类”——ax 会将每个此类技能作为任务简报交还给你来补充。这是代理参与流程的核心步骤；不要跳过。

```bash
ax skills classify        # writes .ax/tasks/classify-<skill>.md per unclassified skill
```

对于写入的每份简报：
1. 阅读该技能（其 SKILL.md / 它的作用）以及简报中的证据。
2. 填写简报顶部的 YAML frontmatter：`primary_role:`（必填，一个标签），以及可选的 `secondary:`、`confidence:`（0–1）、`rationale:`。
   运行 `ax roles` 查看已经在使用的标签；如果合适，请重复使用这些标签。
3. 应用并检查：

```bash
ax skills lint            # reads filled briefs → writes plays_role edges
ax skills weighted        # the re-ranked list, now role-weighted
```

如果 `classify` 报告“没有未分类的技能”，说明用户目前使用得还不够多——请告知用户这一点，并在几天后重新检查（再次运行 `ax ingest`，或让 freshness drive 自动补充数据）。无需简报即可进行一次性覆盖：`ax skills tag <skill> <role>`。

在相关时，也请展示配置入口：
- `ax skills config` - 技能生命周期（live / orphan / out-of-scope / parked）。
- `ax hooks config` - claude/cursor/codex/opencode 中的 hooks（包括添加/删除/编辑）。
- `ax hooks init` - 为编写自定义 TypeScript 守卫搭建 `~/.ax/hooks` 的脚手架（使用 `@ax/hooks-sdk` 中的 `defineHook`）；在运行 `ax hooks install` 前，使用 `ax hooks backtest` 进行验证。
- `ax agents config` - 代理定义及其限定使用的技能。

首次 ingest 完成后，向用户展示模型开销的去向——这是产品中最快让用户“恍然大悟”的地方：

```bash
ax cost split --days=7       # main loop vs subagents, by model
ax dispatches --candidates   # dispatches that could run on cheaper models
```

如果候选列表不为空，请指出路由流程：`efficient-dispatch` 技能（与其他技能一同安装）、`route-dispatch` hook（`ax hooks init` 会为其搭建脚手架；使用
`ax hooks install ~/.ax/hooks/route-dispatch.ts --providers=claude` 安装），以及完整说明请参阅
`docs/design/cost-routing.md`。

## 已安装的内容

| 组件 | 位置 | 所有者 |
|---|---|---|
| `ax` / `axctl` CLI | `~/.local/bin/ax`（指向 `~/.local/share/ax/bin/axctl` 的符号链接） | install.sh |
| DuckDB 缓存 | `~/.local/share/ax/`（内嵌，无需运行或监视守护进程） | `ax ingest` |
| Freshness drive | 当图谱过期时派生一个经过防抖处理的后台 `ax ingest` | 自动，在任何基于数据库的命令上 |
| OTLP 接收器（可选，macOS） | `com.necmttn.ax-otlpd` LaunchAgent | `ax install --telemetry` |
| Claude 技能 | `ax:setup`（本技能）、`ax:retro`（实验循环）、`ax:extract-workflow`（配方重建）、`ax:release-announcement`（根据 git + 会话证据生成发布说明） | `npx skills add Necmttn/ax` |

## 安装后

要运行实验循环：

> let's do an ax retro

这会触发 `ax:retro`，引导用户根据近期工作完成提案筛选和结论复核。

对于临时查询，CLI 可直接使用：

```bash
ax skills taste --limit=10      # most-used skills (with clean-run boost)
ax recall "auth middleware"     # cross-session text search
ax insights tools --limit=5     # tool-failure leaderboard
ax project context --json       # grounding for the current repo
```

## 常见问题

- **“ax 是做什么的？”** 记录每个 Claude Code + Codex
  会话、技能调用、编辑和提交的本地类型化图谱。它会展示你实际使用的技能、
  需要作为依据的上下文，以及哪些重复性工作流值得打包。
- **“我的数据会被共享吗？”** 不会。所有内容都保存在本地嵌入式 DuckDB
  缓存中，路径为 `~/.local/share/ax/`。不会有遥测数据离开本机。
- **“如何卸载？”**
  ```bash
  ax uninstall --purge
  ```

## 此技能不适用于以下场景

- 实验循环工作流 → 使用 `ax:retro`。
- 重建已交付产物的构建过程 → 使用
  `ax:extract-workflow`。
- 起草发布说明或变更日志页面 → 使用
  `ax:release-announcement`。
- 日常技能查询 → 直接运行 CLI；无需通过技能中介。
- ax 仓库本身的 Schema / 开发工作 → 参见仓库中的
  `docs/development.md`。