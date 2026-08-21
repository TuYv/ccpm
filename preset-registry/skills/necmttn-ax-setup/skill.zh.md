---
name: setup
description: Install + verify ax (the agent experience layer). Triggers when the user says "install ax", "set up ax", "ax not found", "ax doctor", "is ax running", "fix ax install", "first-time ax setup", or any setup question about the ax CLI / skills / daemon. Walks the install via the install.sh + skills.sh + first ingest, validates with `ax doctor`, and points the user at ax:retro (experiment loop) and ax:extract-workflow (reconstruct workflow behind shipped artifacts).
---
# ax:setup

安装并验证 ax——本地智能体体验图。完成此技能后，用户将在 PATH 中拥有 `ax` CLI、一个已完成摄取的本地图（嵌入式 DuckDB，无需运行或监视守护进程），并且 ax 技能已加载到 Claude Code 中。

此技能的范围有意保持精简：仅安装 + 验证。日常使用请参阅 `ax:retro`（实验循环）、`ax:extract-workflow`（重建已交付产物背后的工作流程），或直接运行 CLI。

## 何时触发

触发短语：
- "安装 ax" / "设置 ax" / "首次设置 ax"
- "找不到 ax" / "axctl 在哪里"
- "ax doctor" / "ax 正在运行吗" / "ax 能正常工作吗"
- "ax 能为我提供什么"

不要在不相关的工作中，或用户已经深入执行某个 ax 工作流（`ax improve list`、`ax recall …`）时自动触发。

## 安装

```bash
# 1. CLI binary (downloads the latest GitHub release; macOS-first,
#    Linux works for ingest + CLI without launchd reactivity).
curl -fsSL https://raw.githubusercontent.com/Necmttn/ax/main/install.sh | bash

# 2. Skills - installs this skill + ax:retro + ax:extract-workflow
#    into ~/.claude/skills/ (and ~/.agents/skills/ for codex).
npx skills add Necmttn/ax

# 3. First ingest - seeds the graph from the user's last 7 days of
#    Claude Code + Codex transcripts.
PATH="$HOME/.local/bin:$PATH" ax ingest --since=7
```

如果任何步骤失败，请运行 `ax doctor --json` 并指出阻塞原因。如果在步骤 1 后仍找不到 `ax`，用户可能使用了自定义 shell rc——请告知他们将 `$HOME/.local/bin` 添加到 PATH。

## 验证

```bash
ax --version              # expect axctl v0.1.x
ax doctor --json          # expect ok: true for cache + skills
ax skills taste --limit=5 # rank top skills - proof the graph populated
```

具体故障模式：
- `cache` 检查失败 / 未记录成功的摄取 → 运行 `ax ingest`。
  无需启动守护进程——该图是一个已发布的 DuckDB 快照，按需重建。过期的图也会自行修复：任何由数据库支持的命令都会自行派生一个经过防抖处理的后台 `ax ingest`（设置 `AX_NO_AUTO_INGEST=1` 可选择退出）。
- 摄取后技能调用次数为零 → 用户使用了不同的 Claude 对话记录路径。设置 `AX_TRANSCRIPTS_DIR` 并重新摄取。

## 标注 ax 无法分类的技能（请为用户执行此操作）

ax 使用*角色*（例如构思、执行、验证）标记技能，因此 `ax skills weighted` 按使用次数 × 角色进行排序，而不是按原始次数排序。用户调用次数 ≥3× 但没有角色的技能属于“未分类”——ax 会将每个此类技能作为待补充的任务简报交还给你。这是智能体参与闭环的核心步骤；不要跳过。

```bash
ax skills classify        # writes .ax/tasks/classify-<skill>.md per unclassified skill
```

对于写入的每份简报：
1. 阅读该技能（其 SKILL.md / 它的作用）以及简报中的证据。
2. 填写简报顶部的 YAML frontmatter：`primary_role:`（必填，一个标签），以及可选的 `secondary:`、`confidence:`（0–1）、`rationale:`。
   运行 `ax roles` 查看已在使用的标签；如果适用，请复用这些标签。
3. 应用 + 检查：

```bash
ax skills lint            # reads filled briefs → writes plays_role edges
ax skills weighted        # the re-ranked list, now role-weighted
```

如果 `classify` 报告 "no unclassified skills"，说明用户使用得还不够多——
请如实说明，并在几天后重新查看（重新运行 `ax ingest`，或者让
新鲜度驱动机制自动补充数据）。无需简报即可进行一次性覆盖：
`ax skills tag <skill> <role>`。

在相关情况下，也要向用户展示配置入口：
- `ax skills config` - 技能生命周期（live / orphan / out-of-scope / parked）。
- `ax hooks config` - 跨 claude/cursor/codex/opencode 的钩子（以及添加/删除/编辑）。
- `ax hooks init` - 为编写自定义 TypeScript 守卫搭建 `~/.ax/hooks` 脚手架（使用来自 `@ax/hooks-sdk` 的 `defineHook`）；在执行 `ax hooks install` 前，使用 `ax hooks backtest` 进行验证。
- `ax agents config` - 智能体定义及其作用域内的技能。

首次数据摄取完成后，向用户展示其模型支出的去向——
这是产品中最快让人恍然大悟的时刻：

```bash
ax cost split --days=7       # main loop vs subagents, by model
ax dispatches --candidates   # dispatches that could run on cheaper models
```

如果候选列表非空，请引导用户查看路由循环：`efficient-dispatch`
技能（与其他技能一起安装）、`route-dispatch`
钩子（`ax hooks init` 会为其搭建脚手架；使用
`ax hooks install ~/.ax/hooks/route-dispatch.ts --providers=claude` 安装），以及
用于了解完整情况的 `docs/design/cost-routing.md`。

## 已安装的内容

| 组件 | 位置 | 负责方 |
|---|---|---|
| `ax` / `axctl` CLI | `~/.local/bin/ax`（指向 `~/.local/share/ax/bin/axctl` 的符号链接） | install.sh |
| DuckDB 缓存 | `~/.local/share/ax/`（嵌入式，无需运行或监控守护进程） | `ax ingest` |
| 新鲜度驱动机制 | 当图数据过期时，派生一个经过防抖处理的后台 `ax ingest` | 自动，在任何依赖数据库的命令上触发 |
| OTLP 接收器（可选，仅限 macOS） | `com.necmttn.ax-otlpd` LaunchAgent | `ax install --telemetry` |
| Claude 技能 | `ax:setup`（本技能）、`ax:retro`（实验循环）、`ax:extract-workflow`（流程配方重建）、`ax:release-announcement`（根据 git + 会话证据生成发布说明） | `npx skills add Necmttn/ax` |

## 安装后

要运行实验循环：

> 让我们做一次 ax 回顾

这会触发 `ax:retro`，引导用户根据其近期工作完成提案分类 +
结论审查。

对于临时查询，可直接使用 CLI：

```bash
ax skills taste --limit=10      # most-used skills (with clean-run boost)
ax recall "auth middleware"     # cross-session text search
ax insights tools --limit=5     # tool-failure leaderboard
ax project context --json       # grounding for the current repo
```

## 常见问题

- **“ax 有什么作用？”** 它是一个本地类型化图谱，涵盖每次 Claude Code + Codex
  会话、技能调用、编辑和提交。它会揭示你
  实际使用了哪些技能、应基于哪些上下文，以及哪些重复工作流
  值得封装。
- **“我的数据会被共享吗？”** 不会。所有数据都保留在
  `~/.local/share/ax/` 下的本地嵌入式 DuckDB 缓存中。不会有任何遥测数据离开本机。
- **“如何卸载？”**
  ```bash
  ax uninstall --purge
  ```

## 此技能不适用于什么

- 实验循环工作流 → 使用 `ax:retro`。
- 重建已发布产物的构建方式 → 使用
  `ax:extract-workflow`。
- 起草发布说明或变更日志页面 → 使用
  `ax:release-announcement`。
- 日常技能查询 → 直接运行 CLI；无需技能介入。
- 对 ax 仓库本身进行 Schema / 开发工作 → 参阅仓库中的
  `docs/development.md`。