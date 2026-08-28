---
name: claude-switch-models-setup
description: >-
  Set up and maintain multiple isolated Claude Code CLI profiles so students and
  power users can run different LLM providers (Kimi K3, Kimi K2.7 highspeed,
  MiniMax M3, MiniMax M2.7, GLM, DeepSeek, StepFun, Anthropic) in separate
  terminal windows at the same time.
  Use this skill whenever the user asks about multi-provider Claude setup,
  multiple Claude Code windows, switching models or the csk/csd/csg aliases,
  CLAUDE_CONFIG_DIR, the ~/.claude-profiles directory, or running
  Kimi/MiniMax/GLM/DeepSeek/StepFun alongside Anthropic. It also owns profile-drift
  troubleshooting — a third-party profile missing skills/hooks/plugins the default
  profile has, claude-profiles-doctor reporting a real directory where a symlink
  belongs, or settings not converging — and per-provider context-window
  configuration (the [1m] marker or explicit CLAUDE_CODE_MAX_CONTEXT_TOKENS).
---
# Claude Code 多提供商配置文件

## 概述

此技能为 Claude Code CLI 创建一个隔离但共享的配置文件系统。每个配置文件拥有独立的 `.claude.json` 状态文件（凭据和会话历史），同时在所有配置文件之间共享技能、项目、钩子脚本、代理以及已安装的插件状态——并使每个配置文件的 `settings.json`（钩子注册、市场、环境特性开关、权限、偏好设置）以及其 `.claude.json` 的**行为部分**（例如 `workflowSizeGuideline`）与默认配置文件保持一致，因此配置文件之间唯一有意保留的差异就是模型/提供商。

结果是：你可以在一个终端中使用 Kimi，在另一个终端中使用 DeepSeek，在另一个终端中使用 Anthropic——每个终端都运行完全独立的 Claude Code 进程，不会发生配置串扰。

## 工作原理

- `CLAUDE_CONFIG_DIR` 告诉 Claude Code CLI 将哪个目录用作其配置根目录。
- 每个配置文件位于 `~/.claude-profiles/<name>/` 中，并拥有隔离的 `.claude.json`。
- 内容目录（`skills/`、`projects/`、`hooks/`、`agents/`、`settings/`）都通过符号链接指回主 `~/.claude/` 目录，因此你只需维护一份副本。请注意，这里共享的是钩子的**脚本**，而不是钩子的**注册信息**——注册信息位于每个配置文件自己的 `settings.json` 中（见下一项）。
- **配置层——`settings.json`：** 每个配置文件都有自己的 `settings.json`（Claude Code 将其视为配置目录本地文件），因此其中存储的所有内容——钩子注册、`extraKnownMarketplaces`、`enabledPlugins`、`env` 特性开关、`permissions`、行为偏好——一旦默认配置文件发生变化，就会悄然产生偏差（测量时间：2026-07-18：9/9 个真实配置文件都没有任何钩子注册）。`sync-profile-settings.py` 负责收敛：它被注册为 SessionStart 钩子，将默认配置文件的 `settings.json` 中的每个键复制到活动配置文件中，但身份键除外（顶层的 `model` 和 `advisorModel`——后者用于 Anthropic 模型路由，第三方端点无法提供；以及承载提供商路由或 Anthropic 原生隔离设置的环境变量——`ANTHROPIC_*`、`CLAUDE_CODE_SUBAGENT_MODEL`、`ENABLE_TOOL_SEARCH`、`DISABLE_GROWTHBOOK/TELEMETRY/AUTOUPDATER`——这些变量由提供商设置文件有意设置为不同值）。配置文件独有的**顶层**键会被保留；嵌套集合如果位于主配置文件也拥有的键中（例如 `permissions.allow`、`enabledPlugins`），则会整体收敛为主配置文件的值，并且以此方式被丢弃的配置文件独有嵌套条目会被列出（写入时统计数量，`--check` 下显示详情），从而让丢失内容可见而非悄然发生。这正是“除了模型之外，所有配置在每个配置文件中都能正常工作”真正成立的原因。
- **状态层——`.claude.json` 行为键：** `settings.json` 并不是唯一的每配置文件配置文件。Claude Code 还维护一个每配置文件独有的状态文件（主配置文件的是 `~/.claude.json`；每个第三方配置文件的是 `<profile>/.claude.json`——路径不对称，已在磁盘上验证），少量**行为**设置只存在于其中（`workflowSizeGuideline`、通知/UI 偏好设置）。2026-08-17，`workflowSizeGuideline: small` 只存在于主配置文件中，11 个第三方配置文件中有 10 个没有副本——一次 Kimi 会话在系统提示中没有任何大小指导的情况下，将一个 Dynamic Workflow 分发给了 30 多个代理。因此，同一个收敛器还会将**行为键允许列表**同步到每个配置文件的 `.claude.json` 中。安全机制是脚本中的三向分类器，而不是手动维护的键列表：允许列表中的行为键会同步；状态/缓存/计数器/迁移/凭据键（按名称模式匹配）永不触碰；任何未知且不同的键都会被**报告——每次运行中每个发生偏移的键占一行，直到人工完成分类**（这是一个触发器，用于在下一个行为键出现的当天发现它）。写入操作采用备份 + 原子替换；经测量，在活动会话重写文件的情况下依然安全（一个标记键在活动会话中存活了 30 多分钟）。下一次会话生效——启动时工具会读取此文件。
- **例外——`plugins/`：** 市场内容和安装状态是共享的，但每个配置文件都保留自己的 `known_marketplaces.json`。Claude 使用 `path.resolve()`（它**不会**解析符号链接）验证市场的 `installLocation`，因此如果使用一个共享文件，每个不负责写入的配置文件都会报告“corrupted installLocation”。`claude-plugins-sync.py` 负责构建并维护这一按配置文件划分的结构。
- `claude-plugins-sync.py` 还会将默认 `~/.claude/settings.json` 中的 `enabledPlugins` 镜像到每个配置文件的 `settings.json` 中（仅共享缓存文件还不够；Claude Code 将“启用”状态视为配置目录本地状态）。它会在配置文件启动时运行，并以响应式方式运行——下一项中的 LaunchAgent 会在默认配置文件的 `settings.json` 每次写入时重新运行它，因此 `claude plugin enable`/`disable --scope user` 通常可在几秒内传播到每个配置文件，无需重新启动（已于 2026-08-22 验证）。上面的 SessionStart 收敛器会将同一个键作为整个设置同步的一部分进行覆盖；`claude-plugins-sync.py` 仍然负责每个配置文件的 `known_marketplaces.json` 结构。
- 本地源同步在维护者机器上会自动进行，但**源清单并不是激活策略**。Claude 插件缓存目录仍由源提供支持；Codex 用户技能由 `~/.config/claude-switch-models-setup/codex-active-skills.json` 显式选择，并链接到官方用户根目录 `~/.agents/skills`。`~/.codex/skills/.system` 仍由 Codex 管理；修复流程绝不会编辑它。每次验证所选替换链接后，该流程只会在旧版 `~/.codex/skills` 下创建或确认可选的 `legacy_codex_compat_skills` 子集作为同源链接；其他受管理的旧版链接会被报告以便审核清理，后台任务绝不会删除它们。
  - 清单有意采用快速失败策略：文件缺失、列表不是数组、名称列表中存在重复项、未知名称、不在 `active_skills` 中的兼容性名称，或同一个 frontmatter 名称由两个不同的源捆绑包注册，都会在修改根目录之前中止。显式的 JSON `null` 是格式错误，而不是空的兼容性选择。这可以防止 Python 字典或目录扫描顺序悄然决定最终采用哪一个。
  - **守护进程管理的符号链接的陷阱**（观察于 2026-07）：绝不要在现有的守护进程管理条目上手动创建符号链接。BSD `ln` 可能会将新链接放入目标目录**内部**，留下一个自引用的残留链接。正常激活时应修改 `active_skills`；当一个长期运行的钩子或进程仍持有旧的 `~/.codex/skills/<name>` 路径时，将该已激活名称加入 `legacy_codex_compat_skills`。使用 `readlink` 验证链接，而不是使用 `ls -la <link>`——`ls` 会跟随链接，可能使失败的替换看起来像是成功的。
  - 已安装在 `~/.agents/skills` 下的第三方捆绑包不属于该清单的管理范围。不要将它们加入源清单，也不要仅仅为了减少 Codex 提示词负载而删除它们。若要“将捆绑包保留在磁盘上但对 Codex 隐藏”，请交由 `/daymade-skill:skill-governance` 处理；`references/local-source-sync-architecture.md` 记录了所有权边界，但不会重复该工作流。
- 同步脚本使用跨进程共享锁。这是必要的，因为用户经常会通过 tmux 或多个终端同时打开多个提供商窗口；并发启动必须串行化市场/缓存重写，同时仍要允许所有配置文件启动。
- 有关完整的本地源架构，请先阅读 `references/local-source-sync-architecture.md`，再修改这些脚本。
- 提供商路由通过 `~/.claude/settings/<name>.json` 完成，该文件为对应窗口设置 `ANTHROPIC_MODEL`、`ANTHROPIC_BASE_URL` 和 `ANTHROPIC_AUTH_TOKEN`。

## 一键设置工作流

当用户说类似“设置 Claude Code 配置文件”或“我想在不同窗口中使用 Kimi 和 DeepSeek”时：

1. **检查前置条件**
   - 已安装 `claude` CLI：`which claude`
   - Shell 为 zsh 或 bash：通过 `$SHELL` 检测
   - `python3` 可用

2. **安装配置文件管理器脚本 — 创建符号链接，不要复制**

   在已检出此仓库的机器上（维护者场景），运行附带的安装程序——它执行的操作与下面的手动方式完全相同：

   ```bash
   <absolute-path-to-this-repo>/daymade-claude-code/claude-switch-models-setup/scripts/setup.sh
   ```

   或者手动创建链接。`REPO` **必须是绝对路径**：如果使用相对路径，下面的每条命令仍会成功并以 0 退出，留下五个悬空链接，导致 `csk` 和 LaunchAgent 出错，且没有可供追踪的错误信息。

   ```bash
   REPO=<absolute-path-to-this-repo>/daymade-claude-code/claude-switch-models-setup
   DST=~/.config/claude-switch-models-setup
   mkdir -p "$DST"
   for f in scripts/claude-profiles.sh \
            scripts/claude-plugins-sync.py \
            scripts/sync-local-skill-sources.py \
            scripts/sync-local-skill-sources-daemon.sh \
            scripts/sync-profile-settings.py; do
     ln -sf "$REPO/$f" "$DST/$(basename "$f")"
   done
   python3 "$REPO/scripts/seed-codex-active-skills.py" \
     "$REPO/assets/templates/codex-active-skills.json" \
     "$DST/codex-active-skills.json"
   ```

   这里明确列出五个路径，而不是使用 glob，这样阅读此文件就能知道有哪些脚本以及它们位于何处——`scripts/*.sh` 做不到这一点。不需要执行 `chmod`：这五个文件提交时都已具有可执行权限，因此再次设置该权限只会让检出目录产生模式变更，随后这些变更还可能被带入其他人的提交中。

   **为什么使用符号链接，而不是 `cp`：** 实际运行的是 `~/.config/…` 中的内容——LaunchAgent 和 `claude-profile` 都通过该路径调用脚本——而此仓库存放的是它们的源文件。复制的文件会逐渐偏离源文件，并且部署后的副本在外观上与源文件没有任何区别，因此“我编辑的是 SSOT 吗？”不是任何人都能可靠判断的问题。在切换之前对一台机器进行的测量显示：一个锁放置修复在仓库中放了 26 天，而部署的副本仍在运行它所修复的那个 bug；另外两个直接写入部署副本的清理例程从未进入版本控制——**两个方向都在悄无声息地发生偏离。** 符号链接可以消除这两种偏离，*只要它始终是链接*——原子保存编辑器、`rsync` 或误操作的 `cp` 都可能在不提示的情况下将其变回真实文件，这就是为什么值得重新检查，而不是宣布问题已经解决。它还使 `sync-local-skill-sources.py` 能够通过解析自身路径来定位源代码仓库，而不必退回到猜测。

   如何值得重新检查？任何定期检查方式都可以；此 skill 没有附带这样的机制。在你存放此类检查的位置运行下面这一行即可：

   ```bash
   for f in ~/.config/claude-switch-models-setup/*.py ~/.config/claude-switch-models-setup/*.sh; do
     [ -L "$f" ] && [ -e "$f" ] || echo "not a live link: $f"
   done
   ```

如果其中某个已经变成了真实文件，**请在重新创建链接前先将其移到一旁**——它可能包含其他任何地方都不存在的编辑内容，而这正是这里所描述的问题所在：`mv "$f" "$f.local-edits" && ln -sf <source> "$f"`，然后进行 diff。

   在**没有该 repo** 的机器上，请改为从此 skill bundle 中复制出这五个脚本——并接受这样的事实：在你再次复制之前，repo 中的修复不会同步到该机器。

3. **添加 shell 集成**
   - 在 `~/.zshrc` 或 `~/.bashrc` 中 source profile manager
   - 添加别名：`csk`、`csks`、`csd`、`csg`、`css`
   - 如果需要，手动添加其他按账户/套餐区分的变体别名——`claude-profiles.sh` 只定义了上面的五个别名
   - 告知用户运行 `source ~/.zshrc`（或打开一个新终端）

4. **生成 provider 设置文件**
   - 对于用户需要的每个 provider，创建 `~/.claude/settings/<provider>.json`
   - 使用 `assets/templates/` 中的模板作为起点
   - 要求用户提供其 API key 和 base URL；**绝不要硬编码默认值**
   - 为此特定 provider 正确设置上下文窗口——使用 `[1m]` 后缀，还是显式设置 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`/`CLAUDE_CODE_AUTO_COMPACT_WINDOW`，请参见下方的“配置上下文窗口大小”。每创建一个新 profile，都要明确执行此操作，而不是照搬最近模板中已有的设置——最近的模板不需要该设置，并不能证明当前这个 profile 也不需要。
   - 包含必需的隔离标志：
     - `CLAUDE_CODE_SUBAGENT_MODEL`（与 `ANTHROPIC_MODEL` 相同）
     - `ENABLE_TOOL_SEARCH: "false"`
     - `DISABLE_GROWTHBOOK: "1"`
     - `DISABLE_TELEMETRY: "1"`
     - `DISABLE_AUTOUPDATER: "1"`

5. **初始化 profile 目录**
   - 运行 `claude-profiles-init`
   - 这会创建包含隔离的 `.claude.json` 和符号链接的 `~/.claude-profiles/<provider>/`
   - 在维护者机器上，这还会在同步 plugin metadata 之前修复本地 source symlink

   **Statusline wiring：**`claude-profiles-init` 会自动从
   `~/.claude/settings.json` 或 `~/.claude/statusline.sh` 中检测 statusline 脚本，并将其注入每个新 profile。如果两者都不存在，profile 仍可正常工作，但不会显示状态栏。**是否需要 statusline、是否适合安装 `statusline-generator` skill，以及运行其安装程序，属于 AI 的职责**，而不是 profile setup script 的职责。不要将依赖安装硬编码到 shell 脚本中。

6. **注册 settings converger**
   - 将 `~/.config/claude-switch-models-setup/sync-profile-settings.py` 作为 SessionStart hook 添加到**默认** profile 的 `~/.claude/settings.json` 的 `hooks.SessionStart` 列表中（当活动 profile **就是**默认 profile 时，它不会执行任何操作；它在默认 profile 中的作用，是在首次同步时将自身传播到每个 profile 自己的 `hooks` key 中）
   - 运行初始对齐：`python3 ~/.config/claude-switch-models-setup/sync-profile-settings.py --all`
   - 此后，每个 profile 都会在每次 session start 时，从默认 profile 收敛其 `settings.json` 以及 `.claude.json` 中的行为部分（更改将在下一个 session 生效）。仅审计而不写入：`--check --all`

7. **验证隔离**
   - 运行 `claude-profiles-doctor`
   - 确认每个配置文件目录都包含 `.claude.json` 且符号链接有效

8. **为维护者选择并安装 Codex 用户 Skills**
   - 普通学生或不编辑 Skill 源代码仓库的用户可跳过此步骤
   - 编辑 `~/.config/claude-switch-models-setup/codex-active-skills.json`；仅列出应对 Codex 全局可见的源 Skills。空列表表示明确选择不激活任何 Skill。
   - 如果仍在运行的 hook 或进程保留了旧路径，则将该已激活的 Skill 列入 `legacy_codex_compat_skills`；否则保持兼容性列表为空。
   - 运行 `sync-local-skill-sources.py --apply`。它会在创建或确认显式兼容性链接之前，创建/验证所选的 `~/.agents/skills` 链接，并报告其他由管理的旧版链接，以便通过 `skill-governance` 进行审核和清理。
   - 在维护者的 macOS 机器上，运行 `sync-local-skill-sources-daemon.sh --install`
   - 该工具会监视激活清单、默认 Claude 安装状态和本地 marketplace 清单，并在选择、安装/卸载或插件拓扑发生变化后修复派生状态

9. **向用户展示启动方式**
   - `csk` → Kimi K3 窗口
   - `csks` → Kimi K2.7 highspeed 窗口
   - `csd` → DeepSeek 窗口
   - `csg` → GLM 窗口
   - `css` → StepFun 窗口
   - `claude`（无别名）→ 默认 Anthropic 配置文件
   - 可选：自行手动添加按账户/套餐区分的变体别名，例如
     `alias cssp='claude-profile step-pay --dangerously-skip-permissions'` —
     `claude-profiles.sh` 不会生成此别名；这是一种在其基础上手动添加的模式

## 命令

设置完成后，用户可以运行：

```bash
claude-profiles-init          # Re-scan settings/*.json, create missing profiles;
                               # reports symlink drift (real dirs that should be symlinks).
                               # Add --repair to archive drift and replace with symlinks.
claude-profile <name>         # Launch a specific profile
claude-profiles-ls            # List profiles
claude-profiles-doctor        # Check symlink health
claude-profile-rm <name>      # Remove a profile's isolation directory
python3 ~/.config/claude-switch-models-setup/claude-plugins-sync.py
                               # Repair per-profile plugin structure and enabledPlugins
python3 ~/.config/claude-switch-models-setup/sync-profile-settings.py --all
                               # Converge every profile from the default profile:
                               # settings.json (hooks, marketplaces, env flags,
                               # permissions, preferences) + .claude.json behavior
                               # keys (workflowSizeGuideline etc.); --check --all
                               # audits without writing
python3 ~/.config/claude-switch-models-setup/sync-local-skill-sources.py --apply
                               # Maintainers: activate the explicit Codex user set in
                               # ~/.agents/skills; retain compat/report stale legacy links
~/.config/claude-switch-models-setup/sync-local-skill-sources-daemon.sh --install
                               # Maintainers: install automatic macOS watcher
```

这些不是日常使用的命令。普通的源代码编辑会通过符号链接实时生效。这些一次性命令用于修复、引导初始化，或用于没有 LaunchAgent 监视器的非 macOS 环境。

## Provider 模板

模板位于 `assets/templates/`：

- `minimax.json` — MiniMax-M3，全球端点，1M 上下文，自适应或禁用思考
- `minimax-cn.json` — MiniMax-M3，中国端点，1M 上下文，自适应或禁用思考
- `minimax-m2-7.json` — MiniMax-M2.7，全球端点，204800-token 上下文，始终启用思考
- `minimax-m2-7-cn.json` — MiniMax-M2.7，中国端点，204800-token 上下文，始终启用思考
- `kimi.json` — Kimi K3（通过 `[1m]` 标记使用 1M 上下文——参见下方的“配置上下文窗口大小”）
- `kimi-highspeed.json` — Kimi K2.7 highspeed（旧版 200K 上下文）
- `glm.json`
- `deepseek.json`
- `stepfun.json`
- `anthropic.json`

每个模板都使用 `<API_KEY>` 占位符。可配置网关的模板还使用 `<BASE_URL>`；MiniMax 模板固定使用文档中说明的区域端点。要求用户提供每个真实的占位符值；除非用户明确提供，否则不要猜测或复用当前机器上的值。

### MiniMax 模型行为

| 模板 | 模型 | 上下文配置 | 思考行为 |
|---|---|---|---|
| `minimax.json`、`minimax-cn.json` | `MiniMax-M3` | 在每个路由模型值后追加 `[1m]`，并将 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 设置为 `1000000`。 | 支持自适应或禁用思考。将 `ANTHROPIC_REASONING_MODEL` 保持为同一模型。 |
| `minimax-m2-7.json`、`minimax-m2-7-cn.json` | `MiniMax-M2.7` | 将 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 和 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 设置为 `204800`；不要追加 `[1m]`。 | 思考始终启用；不要声称存在模板级别的禁用路径。 |

## 配置上下文窗口大小

每个 Provider 模板都通过以下两种方式之一设置模型的上下文窗口——如果弄错这一点，Claude Code 就不知道模型实际能容纳多少上下文。设置过小会导致它比 Provider 实际要求的时间更早进行压缩（总结内容、丢弃旧的细节）；设置过大则会导致它直到实际限制已经被突破后才进行压缩。

`[1m]` 标记的完整客户端机制——包括它会从模型字段中剥离什么、会向 `anthropic-beta` 标头中添加什么，以及为什么缺少 `[1m]` *并不*意味着 Provider 无法容纳较大的提示词——记录在 `references/context-window-config.md` 中。当上下文数值看起来不对时，请查阅该文档，而不是在编写模板时查阅。

### 决策规则

编写新的 Provider 的 `settings/<name>.json` 时，应根据 Provider 实际且经过验证的上下文窗口进行选择——不要根据模型的营销名称，也不要照搬碰巧最接近的模板所采用的方式：

| Provider 的实际上下文窗口 | 要设置的内容 | 示例模板 |
|---|---|---|
| 约 1M tokens，已明确确认（不是根据模型的级别/名称推断） | 在每个 `ANTHROPIC_MODEL` / `ANTHROPIC_DEFAULT_*_MODEL` / `CLAUDE_CODE_SUBAGENT_MODEL` 值后添加 `[1m]` 后缀。必须是精确的 4 个字符 `[1m]`——Claude Code 匹配的是这个字面字符串，而不是自行编造的标记，例如 `[1million]` 或 `[max]`。 | `kimi.json` |
| 已知的较小规模（例如 200K） | 将 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 和/或 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 明确设置为实际数值——不要使用 `[1m]`。 | `kimi-highspeed.json`（`200000`） |
| 未知/尚未验证 | 不要猜测，也不要仅仅因为模板需要*填入某个值*就照搬其他 Provider 的数值。请用户先查阅该 Provider 自己的文档/控制台。未经验证的 `[1m]` 或未经验证的较大 `CLAUDE_CODE_AUTO_COMPACT_WINDOW`，只会将问题从“过早压缩”转变为“直到远超实际限制后才压缩”——后者更糟，因为在请求实际失败之前都不会显现。 |

`deepseek.json` 和 `glm.json` 同时设置了 **[1m]** 和显式的 `CLAUDE_CODE_AUTO_COMPACT_WINDOW: "1000000"`。这是双重保险，并不是应当删掉的冗余填充——目前尚未独立逆向分析出标记与显式覆盖值之间的确切优先级，因此如果你要复制这两个模板中的任何一个，请同时保留二者，不要删除其中一个。

MiniMax-M3 模板使用相同的 1M 标记，同时设置显式的 `1000000` 自动压缩值。MiniMax-M2.7 模板使用显式的 `204800` 限制，不带标记。

完整的第 2 步到 16k 模板正确性血泪史（为什么一个内部看起来自洽的上下文值，并不等同于当前正确的值——请将模型名称与提供商的实时文档进行交叉核对，而不只是查看它周围的数字），以及一套可复用的方案，用于验证某个环境变量是否确实改变了通过网络发送的字节（使用本地 `http.server` 捕获，因为 `--debug api` 只会显示内部状态），都记录在 `references/context-window-config.md` 中。

### 常见基础 URL（请向你的提供商确认）

| 提供商 | 常见基础 URL |
|----------|------------------|
| Kimi     | `https://api.moonshot.cn` 或兼容 OpenRouter 的端点 |
| GLM      | `https://open.bigmodel.cn/api/paas/v4` 或兼容 OpenRouter 的端点 |
| DeepSeek | `https://api.deepseek.com` 或兼容 OpenRouter 的端点 |
| StepFun  | `https://api.stepfun.com` 或兼容 OpenRouter 的端点 |
| MiniMax  | 全球：`https://api.minimax.io/anthropic`；中国：`https://api.minimaxi.com/anthropic` |
| Anthropic| `https://api.anthropic.com` |

**重要：** 确切的端点取决于用户是直接调用提供商，还是通过兼容性网关（例如 OpenRouter）调用。请务必询问。

## 共享与隔离

| 数据 | 位置 | 是否共享？ |
|------|----------|---------|
| 会话历史 | `~/.claude-profiles/<name>/.claude.json` | **按配置文件隔离** |
| 身份验证令牌/缓存 | `~/.claude-profiles/<name>/.claude.json` | **按配置文件隔离** |
| Skills | `~/.claude/skills/` | 通过符号链接共享 |
| 插件内容 | `~/.claude/plugins/marketplaces`、`cache`、`data`、... | 通过符号链接共享 |
| 插件安装注册表 | `~/.claude/plugins/installed_plugins.json` | 通过符号链接共享 |
| 已启用插件映射 | `~/.claude/settings.json` -> `<profile>/settings.json` | 由 `sync-profile-settings.py` 汇聚（也由 `claude-plugins-sync.py` 镜像） |
| 插件市场索引 | `<profile>/plugins/known_marketplaces.json` | **按配置文件划分**（installLocation 与配置目录相关；无法共享） |
| 项目/记忆 | `~/.claude/projects/`、`~/.claude/memory/` | 通过符号链接共享 |
| Hook 脚本 | `~/.claude/hooks/`、`~/.claude/commands/` | 通过符号链接共享（仅脚本——**不包括注册信息**） |
| `settings.json` 配置：Hook 注册、市场、环境标志、权限、偏好设置 | `<profile>/settings.json` | 在会话开始时由 `sync-profile-settings.py` **从默认配置文件汇聚**（`model` 等身份键以及提供商路由/隔离环境变量永不进行同步） |
| `.claude.json` 行为键（`workflowSizeGuideline`、通知/UI 偏好设置） | `~/.claude.json` → `<profile>/.claude.json` | 由同一脚本**按行为允许列表汇聚**；状态/缓存/计数器/迁移/凭据键（包括 `projects`、`oauthAccount`、`userID`）永不进行同步；检测到漂移的未知键会报告给人类进行分类 |
| 提供商设置 | `~/.claude/settings/<name>.json` | 共享源，按配置文件加载 |

## 故障排除

### 配置文件目录存在，但 claude-profiles-doctor 将其报告为“孤立配置文件”

症状：`claude-profiles-doctor` 报告
`WARN: orphan profile — no settings/<name>.json; claude-profile <name> fails. Run: claude-profile-rm <name>`。

原因：配置文件隔离目录存在于 `~/.claude-profiles/` 下，但对应的 `~/.claude/settings/<name>.json` provider 配置文件缺失。`claude-profiles-init` 只扫描 `settings/*.json`，因此孤立配置文件的符号链接从未创建或维护，且 `claude-profile <name>` 将因 "Error: Settings file not found." 而无法启动。配置文件目录中可能仍包含有用的每配置文件数据（`history.jsonl`、包含 provider 凭据的 `.claude.json`、`settings.json`、技能工作区）。

修复：
- **如果不再需要该配置文件**：`claude-profile-rm <name>` — 这会安全地移除隔离目录（会先检查是否存在意外文件）。
- **如果希望恢复它**：在 `~/.claude/settings/<name>.json` 创建配置文件（使用 `assets/templates/` 中的 provider 模板），然后运行 `claude-profiles-init`。

### 共享目录（skills/projects/hooks/agents/...）显示为真实目录，而不是符号链接

症状：`claude-profiles-doctor` 报告
`<name> is a real directory (expected symlink to ~/.claude/<name>) — drift; run: claude-profiles-init --repair`。

原因：该配置文件创建于符号链接收敛设计落地之前（或是手动创建的），因此共享内容目录最终成为了真实的每配置文件目录，而不是符号链接。该配置文件中的副本现在会与主 `~/.claude/` 副本静默分叉——它的 skills/projects/hooks/agents 与其他所有配置文件中的并不相同。损坏符号链接检查无法发现这一点（真实目录不是损坏的链接）；在实际机器上，这种偏差持续数月未被发现，直到新增了专门的真实目录检查（2026-07-21：在该检查存在之前创建的旧配置文件携带真实的 `projects/` 目录长达数月而未被发现）。

修复（可逆——数据会被归档，绝不会删除）：

```bash
claude-profiles-init --repair
```

对于每个存在偏差的目录，该命令会将真实目录归档到配置文件目录中的 `<name>.pre-symlink-bak-<timestamp>`，然后创建本应存在的符号链接。再次运行 `claude-profiles-doctor` 以确认检查结果正常。如果发现归档中有需要的数据，它就在原处——没有任何内容被销毁。

关于共享内容的说明：修复后，该目录会指向主 `~/.claude/<name>` 副本，因此该配置文件将看到与默认配置文件相同的 skills/projects/etc.——这正是共享符号链接设计的全部目的。必须保持隔离的每配置文件状态（`.claude.json`、`settings.json` 中类似 `model`/provider env 的身份键、`plugins/known_marketplaces.json`）从不属于这些符号链接目录，因此修复不会触及它们。如果该配置文件中保存了你所关心的会话/历史数据，请在丢弃归档前检查它——这些数据现在会解析到共享副本。

### Marketplace 报告“corrupted installLocation”

症状：`/plugin` 或 `claude plugin marketplace update` 报告  
`corrupted installLocation ... expected a path inside <config-dir>/plugins/marketplaces`。

原因：`known_marketplaces.json` 被多个配置档共享（或经过手动编辑）。其
`installLocation` 与配置目录相关，因为 Claude 使用 `path.resolve()` 进行验证（不会解析符号链接），因此同一份共享副本无法满足多个配置档。

修复：`claude-plugins-sync.py` 会为每个配置档重新构建其专属副本，以及共享内容的符号链接。它会在 `claude-profile` 初始化/启动时自动运行；如需手动运行：

```bash
python3 ~/.config/claude-switch-models-setup/claude-plugins-sync.py
```

### Skill 在默认 Claude 中存在，但在 Kimi/GLM/DeepSeek 中缺失

症状：默认 Anthropic 配置档可以看到某个 Skill，但第三方配置档无法看到。

原因：Claude Code 将 `enabledPlugins` 存储在每个配置目录的 `settings.json` 中。共享 `plugins/cache` 只会让文件可用；它不会启用这些插件。

修复：

```bash
python3 ~/.config/claude-switch-models-setup/claude-plugins-sync.py
```

然后重启受影响的 Claude Code 窗口。

### 本地源代码编辑不会在 Claude Code 或 Codex 中显示

症状：你在本地源代码仓库中编辑了某个 Skill，但 Claude Code 或 Codex 仍然加载旧的已安装副本。

预期设计：对已安装 Claude 插件或明确选定的 Codex 用户 Skill 进行的普通编辑会立即生效，因为它们的运行时位置是符号链接。不在 `codex-active-skills.json` 中的源 Skill 是有意保留的冷库存，而不是同步漂移。由于 Skill 元数据会在会话启动时加载，现有的 Claude Code/Codex 会话可能仍需要重启。

如果编辑涉及结构性变更（新插件、新 Skill 条目、版本更新、安装/卸载或 marketplace 清单变更），macOS LaunchAgent 应会自动运行。检查：

```bash
launchctl print gui/$(id -u)/ai.daymade.claude-skill-source-sync
```

只有在 watcher 未安装，或你使用的是非 macOS 机器时，才需要手动修复：

```bash
python3 ~/.config/claude-switch-models-setup/sync-local-skill-sources.py --apply
```

此过程首先会验证显式激活清单和完整的源名称集合。每个已注册的 Skill 都会将其 marketplace-repo 包含关系和加载时 inode 带入冻结步骤；冻结步骤会在为整个过程绑定一个源路径和 inode 之前，重新检查这两项。它会在可变阶段开始前捕获两个用户根目录的现有身份信息，然后使用不跟随符号链接的目录句柄打开所有剩余组件，并在固定根目录前拒绝任何已消失、新出现或 inode 发生变化的根目录。它会将选定条目链接到 `~/.agents/skills`，验证每个选定目标，之后才在 `~/.codex/skills` 下创建或确认 `legacy_codex_compat_skills`；最后的跨根检查会在源目录前后身份检查之间读取两个链接。只有在选定策略需要时，才会专门创建缺失的根目录。在选定的 `.agents` 目标位置，空路径或正确的链接会被接受；指向受管理源代码仓库的错误链接会移入带时间戳的恢复存储，而真实对象、相对链接/断开的链接或第三方链接则会明确失败并保留原位。过期的、未选定的受管理链接会移入同一恢复存储；格式错误的外部链接会作为非所有链接而跳过。移动操作本身是排他的：如果分类条目先发生变化，并发获胜者会被恢复到原始名称，而选定的替换会失败（未选定条目的清理会跳过它）；如果更新的获胜者已经占据该名称，则两者都不会被覆盖，运行会失败，并将较早的获胜者保留在恢复存储中。在请求的旧版兼容路径中，只有已经正确的同源链接或空路径会被接受；任何其他现有对象都会明确失败，且绝不会被替换。创建操作会发布一个已知的私有符号链接 inode，并通过原子式、不可覆盖的硬链接完成发布，因此发布之前、期间或之后出现的任何竞争路径都会安全失败——即使它指向预期的源。其他由源支持的旧版链接会被记录下来，以便通过 `skill-governance` 进行明确且经过审核的清理；LaunchAgent 绝不会取消链接这些链接。

它还会进行自清理，而早期版本不会：

- **版本别名符号链接。** 每个缓存链接都以 marketplace 的当前版本命名，因此每次版本升级都会遗留上一个链接，并且该链接仍指向完全相同的源目录。某个插件有六个版本目录，其中四个是同一源目录的别名。现在，这一步会移除解析到同一源目录的同级链接；实际目录永远不会被触碰，因为这些目录由 Claude Code 安装，活动会话可能仍会通过 `.in_use` 持有它们。
- **`installed_plugins.json` 备份。** 每次运行修改 JSON 时都会写入一个备份，而之前没有任何机制删除它们——运行一个月后留下了 453 个文件。脚本中的 `KEEP_JSON_BACKUPS` 常量会限制保留的备份集合；文件名以 `YYYYMMDD-HHMMSS` 时间戳结尾，因此按字典序排列就是按时间顺序排列。

在 `--apply` 实际执行任何操作之前，两者都会在试运行中显示。

### 某个配置文件缺少 hooks、marketplaces、环境标志或其他默认配置文件设置

症状：默认配置文件配置了 hook 守卫、marketplaces 或功能标志，但第三方配置文件的行为仿佛这些设置不存在（没有 PreToolUse 守卫触发，`claude plugin marketplace list` 为空，默认配置文件中启用的功能处于关闭状态）。

**同类症状，不同层级（2026-08-17）：** 在默认配置文件中设置的行为偏好——例如工作流大小指南——不会对第三方配置文件生效（一个 Kimi 会话将 Dynamic Workflow 扩展到了 30 多个 agent，尽管主配置文件中设置的是 `small`）。该键位于每个配置文件各自的 `.claude.json` 中，而符号链接和 settings.json 同步都会遗漏它。请参阅 `references/troubleshooting.md` 中的“默认配置文件的行为设置不会传递到第三方配置文件”。

原因：这些设置位于每个配置文件自己的 `settings.json` 中，该文件属于配置目录本地设置——符号链接目录无法覆盖配置层，而且默认配置文件一旦发生变化，它们就会悄无声息地产生偏差。

修复：

```bash
python3 ~/.config/claude-switch-models-setup/sync-profile-settings.py --all
```

然后重启受影响的窗口。一旦将 converger 注册为 SessionStart hook（设置步骤 6），每个配置文件都会在会话启动时自行收敛，因此只有在手动编辑设置并希望立即传播时，才需要执行此操作。

### 第三方配置文件尝试使用 Anthropic 专属功能

症状：WebSearch 或其他 Anthropic 原生工具失败并返回 400 错误。  
修复：确保该配置文件的 `settings.json` 设置了：

```json
{
  "env": {
    "ENABLE_TOOL_SEARCH": "false",
    "DISABLE_GROWTHBOOK": "1",
    "DISABLE_TELEMETRY": "1",
    "DISABLE_AUTOUPDATER": "1"
  }
}
```

### 子代理调用回退到其他模型

症状：Kimi 窗口中的子代理调用 `claude-opus-4-7`。  
修复：在该配置文件的 `settings.json` 中，将 `CLAUDE_CODE_SUBAGENT_MODEL` 设置为与 `ANTHROPIC_MODEL` 相同的值。

### 超大上下文提供商过早进行压缩/摘要，或状态栏中的上下文数字看起来不正确

症状：某个提供商自身的文档声称其上下文容量约为 1M tokens，但 Claude Code 却在远低于该容量时自动进行压缩——长会话会在显然还没有实际需要时就被摘要，或者状态栏中的上下文百分比表现得像是在以一个约 200K 的模型而非真实上限为依据。

原因：配置文件中的 `ANTHROPIC_MODEL`（及其 `ANTHROPIC_DEFAULT_*_MODEL` / `CLAUDE_CODE_SUBAGENT_MODEL` 同类变量）缺少 `[1m]` 标记。Claude Code 没有其他方式得知提供商实际的上下文大小——请求本身能够成功处理超大提示词，并不能向 Claude Code 传达任何信息，因为这属于上游提供商的属性，而不是客户端的属性。完整机制请参阅 `references/context-window-config.md`。

修复：在配置文件的 `settings.json` 中，为 `ANTHROPIC_MODEL`、每个 `ANTHROPIC_DEFAULT_*_MODEL` 以及 `CLAUDE_CODE_SUBAGENT_MODEL` 添加字面量后缀 `[1m]`（匹配 `kimi.json` 的模式）。重启受影响的窗口。

## 稍后添加新提供商

1. 使用模板创建 `~/.claude/settings/<new-provider>.json`。
2. 检查提供商实际且经过验证的上下文窗口并进行配置——使用 `[1m]` 标记，或显式配置 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`/`CLAUDE_CODE_AUTO_COMPACT_WINDOW`；请参阅下方的“配置上下文窗口大小”和 `references/context-window-config.md`。不要因为复制的模板碰巧不需要配置，就跳过这一步。
3. 运行 `claude-profiles-init`。
4. 如有需要，将别名添加到 shell rc 文件中。

## 安全说明

- API 密钥会以明文形式写入 `~/.claude/settings/<provider>.json`，这与 Claude Code 存储 `ANTHROPIC_AUTH_TOKEN` 的方式相同。这符合 Claude Code 自身的安全模型。
- 此 skill 不会将密钥或设置上传到任何地方。
- 用于公开分发时，随附的脚本不包含硬编码的机密、端点或特定用户路径。

## 下一步

设置完成后，用户可以立即打开两个终端进行测试：在其中一个终端运行 `csk`（Kimi K3），在另一个终端运行 `csd`。每个窗口彼此独立。