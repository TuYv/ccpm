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

此技能为 Claude Code CLI 创建一个隔离但共享的配置文件系统。每个配置文件都有自己的 `.claude.json` 状态文件（凭据和会话历史），同时在所有配置文件之间共享技能、项目、钩子脚本、代理以及已安装的插件状态——并使每个配置文件的 `settings.json`（钩子注册、市场、环境特性标志、权限、偏好设置）以及其 **`.claude.json` 的行为部分**（例如 `workflowSizeGuideline`）与默认配置文件保持一致，因此配置文件之间唯一预期的差异就是模型/提供商。

结果是：你可以在一个终端中使用 Kimi，在另一个终端中使用 DeepSeek，再在另一个终端中使用 Anthropic——每个终端都运行完全独立的 Claude Code 进程，不会发生配置串扰。

## 工作原理

- `CLAUDE_CONFIG_DIR` 告诉 Claude Code CLI 将哪个目录用作配置根目录。
- 每个配置文件位于 `~/.claude-profiles/<name>/` 中，并拥有隔离的 `.claude.json`。
- 内容目录（`skills/`、`projects/`、`hooks/`、`agents/`、`settings/`）都通过符号链接指回主 `~/.claude/` 目录，因此你只需维护一份副本。注意，这里共享的是钩子**脚本**，而不是钩子**注册信息**——注册信息位于每个配置文件自己的 `settings.json` 中（见下一条）。
- **配置层——`settings.json`：** 每个配置文件都有自己的 `settings.json`（Claude Code 将其视为配置目录本地文件），因此其中存储的所有内容——钩子注册、`extraKnownMarketplaces`、`enabledPlugins`、`env` 特性标志、`permissions`、行为偏好——都会在默认配置文件发生变化的瞬间悄然偏离（截至 2026-07-18 的测量：9/9 个真实配置文件都没有任何钩子注册）。`sync-profile-settings.py` 就是负责使其重新一致的工具：它被注册为 SessionStart 钩子，将默认配置文件的 `settings.json` 中的每个键复制到活动配置文件中，但身份键除外（顶层的 `model` 和 `advisorModel`——后者用于 Anthropic 模型路由，第三方端点无法提供该模型；以及承载提供商路由或 Anthropic 原生隔离配置的环境变量——`ANTHROPIC_*`、`CLAUDE_CODE_SUBAGENT_MODEL`、`ENABLE_TOOL_SEARCH`、`DISABLE_GROWTHBOOK/TELEMETRY/AUTOUPDATER`——这些变量由提供商配置文件有意设置为不同值）。配置文件独有的**顶层**键会被保留；某个键内部、而主配置文件也拥有的嵌套集合（例如 `permissions.allow`、`enabledPlugins`）会整体收敛为主配置文件中的值，同时以列表形式记录因此被删除的配置文件独有嵌套项（写入时记录数量，`--check` 下显示详情），让丢失情况可见而不是悄无声息。这正是“除了模型之外，所有配置在每个配置文件中都能正常工作”真正成立的原因。
- **状态层——`.claude.json` 行为键：** `settings.json` 并不是唯一的配置文件。Claude Code 还会保存一个每个配置文件独有的状态文件（主配置文件的是 `~/.claude.json`；每个第三方配置文件的是 `<profile>/.claude.json`——路径不对称，已在磁盘上验证），并且少数**行为**设置只存在于其中（`workflowSizeGuideline`、通知/UI 偏好设置）。2026-08-17，`workflowSizeGuideline: small` 只存在于主配置文件中，11 个第三方配置文件中有 10 个没有副本——一次 Kimi 会话在系统提示中没有任何规模指导的情况下，将一个 Dynamic Workflow 扩展到了 30 多个代理。因此，同一个收敛器还会将一组**行为键白名单**同步到每个配置文件的 `.claude.json` 中。安全机制是脚本中的三向分类器，而不是手工维护的键列表：列入白名单的行为键会同步；状态/缓存/计数器/迁移/凭据键（按名称模式匹配）绝不会被修改；任何未知且不一致的键都会被**报告——每次运行每个发生偏差的键一行，直到人工完成分类**（这是一个触发器，用于在下一个行为键出现的当天发现它）。写入操作采用备份 + 原子替换；经过测量，在活动会话重写该文件的情况下仍然安全（一个标记键在活动会话中存活了 30 多分钟）。更改将在下一个会话中生效——测试工具会在启动时读取此文件。
- **例外——`plugins/`：** 市场内容和安装状态是共享的，但每个配置文件保留自己的 `known_marketplaces.json`。Claude 使用 `path.resolve()` 验证市场的 `installLocation`（该方法**不会**解析符号链接），因此如果使用一个共享文件，每个不负责写入的配置文件都会报告“损坏的 installLocation”。`claude-plugins-sync.py` 会构建并维护这一按配置文件划分的结构。
- `claude-plugins-sync.py` 还会将默认 `~/.claude/settings.json` 中的 `enabledPlugins` 镜像到每个配置文件的 `settings.json` 中（共享缓存文件还不够；Claude Code 将“已启用”状态视为配置目录本地状态）。它会在配置文件启动时运行，并以响应式方式运行——下一条中的 LaunchAgent 会在默认配置文件的 `settings.json` 每次写入时重新运行它，因此 `claude plugin enable`/`disable --scope user` 通常会在几秒内传播到每个配置文件，无需重新启动（已于 2026-08-22 验证）。上面的 SessionStart 收敛器会将同一个键作为整体设置同步的一部分进行覆盖；`claude-plugins-sync.py` 仍然负责每个配置文件的 `known_marketplaces.json` 结构。
- 本地源代码同步在维护者机器上是自动的，但**源清单不是激活策略**。Claude 插件缓存目录仍由源代码提供；Codex 用户 Skills 由 `~/.config/claude-switch-models-setup/codex-active-skills.json` 显式选择，并链接到官方用户根目录 `~/.agents/skills`。`~/.codex/skills/.system` 仍由 Codex 管理；修复过程绝不会编辑它。在验证每个选定的替换链接之后，该过程只会在旧版 `~/.codex/skills` 下创建或确认可选的 `legacy_codex_compat_skills` 子集的同源链接；其他受管理的旧版链接会被报告以供审查清理，后台任务绝不会删除它们。
  - 清单有意采用快速失败策略：文件缺失、列表不是数组、名称重复、未知名称、不在 `active_skills` 中的兼容性名称，或同一个 frontmatter 名称由两个不同的源代码包注册，都会在修改根目录之前中止。显式的 JSON `null` 属于格式错误，而不是空的兼容性选择。这样可以避免 Python 字典或目录扫描顺序悄然决定最终采用哪个对象。
  - **守护进程管理的符号链接的陷阱**（2026-07 观察到）：绝不要在现有的守护进程管理条目上手动创建符号链接。BSD `ln` 可能会将新链接放到目标目录**内部**，留下一个自引用的残留项。对于正常激活，请修改 `active_skills`；当一个长时间运行的钩子或进程仍持有旧的 `~/.codex/skills/<name>` 路径时，请将该已处于激活状态的名称添加到 `legacy_codex_compat_skills`。使用 `readlink` 而不是 `ls -la <link>` 验证链接——`ls` 会跟随链接，可能使失败的替换看起来像是成功的。
  - 已经安装在 `~/.agents/skills` 下的第三方包不属于该清单的管理范围。不要将它们添加到源清单中，也不要仅仅为了减少 Codex 提示词负载而删除它们。若要实现“将包保留在磁盘上，但对 Codex 隐藏”，请转交给 `/daymade-skill:skill-governance`；`references/local-source-sync-architecture.md` 记录了所有权边界，但不会重复该工作流。
- 同步脚本使用跨进程共享锁。这是必要的，因为用户经常会从 tmux 或多个终端同时打开多个提供商窗口；并发启动必须串行执行市场/缓存重写，同时仍要允许所有配置文件启动。
- 如需了解完整的本地源代码架构，请在修改这些脚本之前阅读 `references/local-source-sync-architecture.md`。
- 提供商路由通过 `~/.claude/settings/<name>.json` 完成，该文件会为对应窗口设置 `ANTHROPIC_MODEL`、`ANTHROPIC_BASE_URL` 和 `ANTHROPIC_AUTH_TOKEN`。

## 一键设置工作流

当用户说类似“设置 Claude Code 配置文件”或“我想在不同窗口中使用 Kimi 和 DeepSeek”时：

1. **检查前置条件**
   - 已安装 `claude` CLI：`which claude`
   - Shell 是 zsh 或 bash：通过 `$SHELL` 检测
   - `python3` 可用

2. **安装配置文件管理器脚本 — 创建符号链接，不要复制**

   在已检出此仓库的机器上（维护者场景），运行捆绑的安装程序 — 它执行的操作与下面的手动方式完全相同：

   ```bash
   <absolute-path-to-this-repo>/daymade-claude-code/claude-switch-models-setup/scripts/setup.sh
   ```

   或者手动创建链接。`REPO` **必须是绝对路径**：如果使用相对路径，下面的每条命令仍会成功并以 0 退出，但会留下断开的链接，导致 `csk` 和 LaunchAgent 出错，且没有任何可追溯的错误信息。

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

   这里明确写出部署路径，而不是使用 glob，这样阅读此文件就能知道有哪些脚本以及它们位于何处 — `scripts/*.sh` 则无法做到这一点。无需执行 `chmod`：列出的每个脚本在提交时都已具有可执行权限，因此再次设置该权限只会因为模式变更弄脏检出内容，而这些变更随后还会进入其他人的提交。

   **为什么使用符号链接而不是 `cp`：** 实际运行的是 `~/.config/…` 中的内容 — LaunchAgent 和 `claude-profile` 都通过该路径调用脚本 — 而此仓库存放的是脚本源文件。复制的文件会发生漂移，并且部署副本与源文件看起来没有任何区别，因此“我编辑的是 SSOT 吗？”并不是任何人都能可靠判断的问题。在切换之前对一台机器进行的测量显示：一个锁放置修复在仓库中停留了 26 天，而部署副本仍在运行该修复所针对的 bug；另外，直接写入部署副本的两个清理例程从未进入版本控制 — **两个方向上的漂移，而且都是静默发生的。** 链接可以消除这两种漂移，*只要它仍然是链接* — 原子保存编辑器、`rsync` 或误执行的 `cp` 都可能在不提示的情况下将其变回真实文件，这也是为什么值得重新检查，而不是宣布问题已经解决。它还允许 `sync-local-skill-sources.py` 通过解析自身路径来定位源代码仓库，而不是退回到猜测。

   如何值得重新检查？任何定期检查方式都可以；此 skill 没有附带相关功能。在你通常存放此类检查的位置运行下面这一行即可：

   ```bash
   for f in ~/.config/claude-switch-models-setup/*.py ~/.config/claude-switch-models-setup/*.sh; do
     [ -L "$f" ] && [ -e "$f" ] || echo "not a live link: $f"
   done
   ```

如果某个文件已经变成了真正的文件，**请在重新建立链接前先将其移到一旁**——其中可能包含其他地方都不存在的编辑内容，而这正是此处所描述的问题：`mv "$f" "$f.local-edits" && ln -sf <source> "$f"`，然后执行 diff。

   在**没有该仓库**的机器上，请改为从此 skill 包中复制安装程序列出的脚本——并接受这样的事实：在你再次复制之前，仓库中的修复不会同步到该机器。

3. **添加 shell 集成**
   - 在 `~/.zshrc` 或 `~/.bashrc` 中加载 profile manager
   - 添加别名：`csk`、`csks`、`csd`、`csg`、`css`
   - 如有需要，手动添加其他按账户/套餐区分的变体别名——`claude-profiles.sh` 只定义上述别名
   - 告知用户运行 `source ~/.zshrc`（或打开一个新的终端）

4. **生成 provider 设置文件**
   - 对于用户需要的每个 provider，创建 `~/.claude/settings/<provider>.json`
   - 使用 `assets/templates/` 中的模板作为起点
   - 提示用户提供其 API key 和 base URL；**绝不要硬编码默认值**
   - 针对该特定 provider 正确设置上下文窗口——使用 `[1m]` 后缀，还是显式设置 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`/`CLAUDE_CODE_AUTO_COMPACT_WINDOW`，请参阅下方的“配置上下文窗口大小”。每个新 profile 都必须明确执行此操作，不要直接复制最近模板中恰好已有的设置——最近的模板不需要该设置，并不能证明当前这个 profile 也不需要。
   - 包含必要的隔离标志：
     - `CLAUDE_CODE_SUBAGENT_MODEL`（与 `ANTHROPIC_MODEL` 相同）
     - `ENABLE_TOOL_SEARCH: "false"`
     - `DISABLE_GROWTHBOOK: "1"`
     - `DISABLE_TELEMETRY: "1"`
     - `DISABLE_AUTOUPDATER: "1"`

5. **初始化 profile 目录**
   - 运行 `claude-profiles-init`
   - 这会创建 `~/.claude-profiles/<provider>/`，其中包含隔离的 `.claude.json` 和符号链接
   - 在维护者机器上，这还会在同步插件元数据之前修复本地源符号链接

   **状态栏连接：**`claude-profiles-init` 会自动从
   `~/.claude/settings.json` 或 `~/.claude/statusline.sh` 中检测状态栏脚本，并将其注入每个新 profile。如果两者都不存在，profile 仍可正常工作，但不会显示状态栏。**AI 应负责**判断用户是否需要状态栏，并在适当时安装 `statusline-generator` skill，然后运行其安装程序——而不是由 profile setup 脚本负责。不要将依赖安装硬编码到 shell 脚本中。

6. **注册 settings converger**
   - 将 converger 添加为默认 profile 的 `~/.claude/settings.json` 中 `hooks.SessionStart` 列表里的一个 SessionStart hook，使用类似 `'/absolute/path/to/python3' '/absolute/path/to/sync-profile-settings.py'` 的绝对路径直接调用 Python 的命令。不要通过 shebang 或 package manager 注册 `.py` 文件：此 hook 用于修复每个 profile，不能等待共享环境/缓存锁。当前 profile **就是**默认 profile 时，它不会执行任何操作；它在默认 profile 中的作用，是在第一次同步时将自身传播到每个 profile 的 `hooks` 键中。
   - 运行初始对齐：`python3 ~/.config/claude-switch-models-setup/sync-profile-settings.py --all`
   - 从此以后，每个 profile 都会在每次会话启动时，使其 `settings.json` 以及 `.claude.json` 中的行为相关部分与默认 profile 保持一致（更改将在下一次会话中生效）。仅审计而不写入：`--check --all`

7. **验证隔离**
   - 运行 `claude-profiles-doctor`
   - 确认每个 profile 目录都包含 `.claude.json` 和有效的符号链接

8. **为维护者选择并安装 Codex 用户 Skills**
   - 普通学生或不编辑 Skill 源代码仓库的用户跳过此步骤
   - 编辑 `~/.config/claude-switch-models-setup/codex-active-skills.json`；仅列出应在 Codex 中全局可见的源 Skills。空列表表示明确选择不激活任何 Skill。
   - 如果仍在运行的 hook 或进程保留了旧路径，则将该已处于激活状态的 Skill 列在 `legacy_codex_compat_skills` 下；否则将兼容性列表留空。
   - 运行 `sync-local-skill-sources.py --apply`。它会在创建或确认显式兼容性链接之前，创建/验证所选的 `~/.agents/skills` 链接，并报告其他由其管理的旧链接，以便通过 `skill-governance` 进行审核清理。
   - 在维护者的 macOS 机器上，运行 `sync-local-skill-sources-daemon.sh --install`
   - 此工具会监视激活清单、默认 Claude 安装状态和本地 marketplace 清单，并在选择、安装/卸载或插件拓扑发生变化后修复派生状态

9. **向用户说明如何启动**
   - `csk` → Kimi K3 窗口
   - `csks` → Kimi K2.7 highspeed 窗口
   - `csd` → DeepSeek 窗口
   - `csg` → GLM 窗口
   - `css` → StepFun 窗口
   - `claude`（无别名）→ 默认 Anthropic profile
   - 可选：手动添加一个按账户/套餐区分的变体别名，例如：
     `alias cssp='claude-profile step-pay --dangerously-skip-permissions'` —
     `claude-profiles.sh` 不会生成此别名；这是在此基础上手动采用的一种模式

## 命令

完成设置后，用户可以运行：

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

这些不是日常使用的命令。普通的源代码编辑会通过符号链接实时生效。这些一次性命令用于修复、引导配置，或用于没有 LaunchAgent 监视器的非 macOS 环境。

## 提供商模板

模板位于 `assets/templates/`：

- `minimax.json` — MiniMax-M3，全球端点，1M 上下文，支持自适应思考或禁用思考
- `minimax-cn.json` — MiniMax-M3，中国端点，1M 上下文，支持自适应思考或禁用思考
- `minimax-m2-7.json` — MiniMax-M2.7，全球端点，204800 token 上下文，始终启用思考
- `minimax-m2-7-cn.json` — MiniMax-M2.7，中国端点，204800 token 上下文，始终启用思考
- `kimi.json` — Kimi K3（通过 `[1m]` 标记实现 1M 上下文——参见下方的“配置上下文窗口大小”）
- `kimi-highspeed.json` — Kimi K2.7 highspeed（旧版 200K 上下文）
- `glm.json`
- `deepseek.json`
- `stepfun.json`
- `anthropic.json`

每个模板都使用 `<API_KEY>` 占位符。可配置网关的模板还会使用 `<BASE_URL>`；MiniMax 模板固定使用文档中说明的区域端点。要求用户提供每一个真实的占位符值；除非用户明确提供，否则不要猜测或复用当前机器上的值。

### MiniMax 模型行为

| 模板 | 模型 | 上下文配置 | 思考行为 |
|---|---|---|---|
| `minimax.json`、`minimax-cn.json` | `MiniMax-M3` | 为每个路由的模型值追加 `[1m]`，并将 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 设置为 `1000000`。 | 支持自适应思考或禁用思考。保持 `ANTHROPIC_REASONING_MODEL` 使用同一模型。 |
| `minimax-m2-7.json`、`minimax-m2-7-cn.json` | `MiniMax-M2.7` | 将 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 和 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 设置为 `204800`；不要追加 `[1m]`。 | 思考始终开启；不要声称存在模板级别的禁用路径。 |

## 配置上下文窗口大小

每个提供商模板都通过以下两种方式之一设置模型的上下文窗口——如果弄错，Claude Code 就不知道模型实际能够容纳多少上下文。设置得过小，会比提供商实际要求的时间早得多地进行压缩（总结、丢弃旧的详细信息）；设置得过大，则会直到实际限制已经被突破后才进行压缩。

关于 `[1m]` 标记的完整客户端机制——它会从模型字段中移除什么、会向 `anthropic-beta` 标头中添加什么，以及为什么缺少 `[1m]` *并不意味着*提供商无法容纳较大的提示词——请参阅 `references/context-window-config.md` 中的文档。当上下文数值看起来不正确时，应查阅该文档，而不是在编写模板时查阅。

### 决策规则

编写新的提供商 `settings/<name>.json` 时，应根据提供商实际且经过验证的上下文窗口进行选择——不要根据模型的营销名称，也不要因为最接近的模板碰巧采用了某种做法就照搬：

| 提供商的实际上下文窗口 | 要设置的内容 | 示例模板 |
|---|---|---|
| 约 1M token，已明确确认（不是根据模型的等级/名称推断） | 在每个 `ANTHROPIC_MODEL` / `ANTHROPIC_DEFAULT_*_MODEL` / `CLAUDE_CODE_SUBAGENT_MODEL` 值后添加 `[1m]` 后缀。必须是精确的 4 个字符 `[1m]`——Claude Code 会匹配这个字面字符串，而不是类似 `[1million]` 或 `[max]` 这样的自定义标记。 | `kimi.json` |
| 已知的较小数值（例如 200K） | 将 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 和/或 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 明确设置为实际数值——不要使用 `[1m]`。 | `kimi-highspeed.json`（`200000`） |
| 未知/尚未验证 | 不要猜测，也不要仅仅因为模板需要*填入某个值*就照搬其他提供商的数值。要求用户先查看提供商自己的文档/控制台。未经验证的 `[1m]` 或未经验证的较大 `CLAUDE_CODE_AUTO_COMPACT_WINDOW`，只会将故障从“过早压缩”转变为“直到远超实际限制后才压缩”——这更糟糕，因为在请求真正失败之前，这个问题都是静默的。 |

`deepseek.json` 和 `glm.json` **同时**设置了 `[1m]` 以及显式的 `CLAUDE_CODE_AUTO_COMPACT_WINDOW: "1000000"`。这是双重保险，并非应当删掉的冗余填充——标记与显式覆盖之间的确切优先级尚未经过独立逆向分析，因此如果你要复制这两个模板中的任意一个，请保留两者，不要删除其中一个。

MiniMax-M3 模板使用相同的 1M 标记，同时设置显式的 `1000000` 自动压缩值。MiniMax-M2.7 模板使用显式的 `204800` 限制，不带标记。

完整的 step-2-16k 模板正确性经验总结（为什么一个内部看起来自洽的上下文值，并不等同于当前正确的值——应将模型名称与提供商的实时文档交叉核对，而不只是查看它周围的数字），以及一套可复用的方案，用于验证某个环境变量是否确实改变了通过网络传输的字节（使用本地 `http.server` 捕获，因为 `--debug api` 只能显示内部状态），都位于 `references/context-window-config.md` 中。

### 常见基础 URL（请与提供商确认）

| 提供商 | 典型基础 URL |
|----------|------------------|
| Kimi     | `https://api.moonshot.cn` 或兼容 OpenRouter 的端点 |
| GLM      | `https://open.bigmodel.cn/api/paas/v4` 或兼容 OpenRouter 的端点 |
| DeepSeek | `https://api.deepseek.com` 或兼容 OpenRouter 的端点 |
| StepFun  | `https://api.stepfun.com` 或兼容 OpenRouter 的端点 |
| MiniMax  | 全球：`https://api.minimax.io/anthropic`；中国：`https://api.minimaxi.com/anthropic` |
| Anthropic| `https://api.anthropic.com` |

**重要：**确切的端点取决于用户是直接调用提供商，还是通过兼容性网关（例如 OpenRouter）调用。请务必询问。

## 共享与隔离

| 数据 | 位置 | 是否共享？ |
|------|----------|---------|
| 会话历史 | `~/.claude-profiles/<name>/.claude.json` | **按配置文件隔离** |
| 身份验证令牌/缓存 | `~/.claude-profiles/<name>/.claude.json` | **按配置文件隔离** |
| 技能 | `~/.claude/skills/` | 通过符号链接共享 |
| 插件内容 | `~/.claude/plugins/marketplaces`、`cache`、`data`、... | 通过符号链接共享 |
| 插件安装注册表 | `~/.claude/plugins/installed_plugins.json` | 通过符号链接共享 |
| 已启用插件映射 | `~/.claude/settings.json` -> `<profile>/settings.json` | 由 `sync-profile-settings.py` 汇聚（也由 `claude-plugins-sync.py` 镜像） |
| 插件市场索引 | `<profile>/plugins/known_marketplaces.json` | **按配置文件区分**（installLocation 特定于配置目录；无法共享） |
| 项目/记忆 | `~/.claude/projects/`、`~/.claude/memory/` | 通过符号链接共享 |
| Hook 脚本 | `~/.claude/hooks/`、`~/.claude/commands/` | 通过符号链接共享（仅脚本——**不包括注册信息**） |
| `settings.json` 配置：Hook 注册、市场、环境标志、权限、偏好设置 | `<profile>/settings.json` | 在会话开始时由 `sync-profile-settings.py` **从默认配置文件汇聚**（`model` 等身份键，以及提供商路由/隔离环境变量从不同步） |
| `.claude.json` 行为键（`workflowSizeGuideline`、通知/UI 偏好设置） | `~/.claude.json` → `<profile>/.claude.json` | 由同一脚本**按照行为白名单汇聚**；状态/缓存/计数器/迁移/凭据键（包括 `projects`、`oauthAccount`、`userID`）从不同步；未知的漂移键会报告给人类进行分类 |
| 提供商设置 | `~/.claude/settings/<name>.json` | 共享源，按配置文件加载 |

## 故障排除

### 配置文件目录存在，但 claude-profiles-doctor 将其报告为“孤立配置文件”

症状：`claude-profiles-doctor` 报告
`WARN: orphan profile — no settings/<name>.json; claude-profile <name> fails. Run: claude-profile-rm <name>`。

原因：配置文件隔离目录存在于 `~/.claude-profiles/` 下，但对应的
`~/.claude/settings/<name>.json` provider 配置文件缺失。`claude-profiles-init` 只扫描
`settings/*.json`，因此孤立配置文件的符号链接不会被创建或维护，并且
`claude-profile <name>` 将因 "Error: Settings file not found." 而无法启动。配置文件目录中可能仍包含有用的配置文件级数据（`history.jsonl`、包含 provider 凭据的 `.claude.json`、`settings.json`、技能工作区）。

修复：
- **如果不再需要此配置文件**：`claude-profile-rm <name>` — 该命令会安全地移除隔离目录（会先检查是否存在意外文件）。
- **如果想要恢复它**：在 `~/.claude/settings/<name>.json` 重新创建设置文件（使用 `assets/templates/` 中的 provider 模板），然后运行 `claude-profiles-init`。

### 共享目录（skills/projects/hooks/agents/...）显示为真实目录，而不是符号链接

症状：`claude-profiles-doctor` 报告
`<name> is a real directory (expected symlink to ~/.claude/<name>) — drift; run: claude-profiles-init --repair`。

原因：该配置文件创建于符号链接收敛设计落地之前（或是手动创建的），因此共享内容目录最终成为了真实的配置文件级目录，而不是符号链接。现在，该配置文件中的副本会与主 `~/.claude/` 副本悄然产生偏差——它的 skills/projects/hooks/agents 与其他所有配置文件中的并不相同。损坏符号链接检查无法发现这一问题（真实目录不是损坏的链接）；在真实机器上，这种偏差一直未被发现，持续了数月，直到添加了专门的真实目录检查（2026-07-21：在此检查存在之前创建的旧配置文件携带真实的 `projects/` 目录数月之久，始终未被发现）。

修复（可逆——数据会被归档，从不删除）：

```bash
claude-profiles-init --repair
```

对于每个存在偏差的目录，该命令会将真实目录归档到配置文件目录中的
`<name>.pre-symlink-bak-<timestamp>`，然后创建本应存在的符号链接。再次运行
`claude-profiles-doctor`，确认检查结果正常。如果发现某个归档中包含需要的数据，它就在原处——没有任何数据被销毁。

关于共享内容的说明：修复后，该目录会指向主
`~/.claude/<name>` 副本，因此该配置文件会看到与默认配置文件相同的 skills/projects/etc.——这正是共享符号链接设计的全部目的。必须保持隔离的配置文件级状态（`.claude.json`、包含 `model`/provider env 等身份键的 `settings.json`、`plugins/known_marketplaces.json`）从来都不属于这些符号链接目录，因此修复不会触及它们。如果配置文件中包含你需要的会话/历史数据，请在丢弃归档前先检查它——这些数据现在会解析到共享副本。

### Marketplace 报告“corrupted installLocation”

症状：`/plugin` 或 `claude plugin marketplace update` 报告  
`corrupted installLocation ... expected a path inside <config-dir>/plugins/marketplaces`。

原因：`known_marketplaces.json` 被不同配置文件共用（或经过手动编辑）。它的
`installLocation` 与配置目录相关，因为 Claude 使用 `path.resolve()` 进行验证
（不会解析符号链接），因此同一份共享副本无法满足多个配置文件。

修复：`claude-plugins-sync.py` 会重建每个配置文件自己的副本，以及共享内容的
符号链接。它会在 `claude-profile` 初始化/启动时自动运行；如需手动运行：

```bash
python3 ~/.config/claude-switch-models-setup/claude-plugins-sync.py
```

### Skill 在默认 Claude 中存在，但在 Kimi/GLM/DeepSeek 中缺失

症状：默认 Anthropic 配置文件可以看到某个 Skill，但第三方配置文件看不到。

原因：Claude Code 将 `enabledPlugins` 存储在每个配置目录的 `settings.json` 中。
共享 `plugins/cache` 只会使文件可用；它不会启用这些插件。

修复：

```bash
python3 ~/.config/claude-switch-models-setup/claude-plugins-sync.py
```

然后重启受影响的 Claude Code 窗口。

### 本地源代码编辑不会显示在 Claude Code 或 Codex 中

症状：你在本地源代码仓库中编辑了某个 Skill，但 Claude Code 或 Codex 仍然加载旧的已安装副本。

预期设计：对已安装的 Claude 插件或明确选定的 Codex 用户 Skill 进行的普通编辑会立即生效，因为它们的运行时位置是符号链接。不在 `codex-active-skills.json` 中的源 Skill 是有意保留的冷库存，而不是同步漂移。现有的 Claude Code/Codex 会话可能仍需要重启，因为 Skill 元数据是在会话启动时加载的。

如果编辑涉及结构变更（新插件、新 Skill 条目、版本号更新、安装/卸载或 marketplace 清单变更），macOS LaunchAgent 应自动运行。检查：

```bash
launchctl print gui/$(id -u)/ai.daymade.claude-skill-source-sync
```

仅当 watcher 未安装，或你使用的是非 macOS 设备时，才需要手动修复：

```bash
python3 ~/.config/claude-switch-models-setup/sync-local-skill-sources.py --apply
```

该操作首先验证显式激活清单和完整的源名称集合。每个已注册的 Skill 都会将其 marketplace-repo 包含关系和加载时 inode 带入冻结步骤；该步骤会在为整个过程绑定一个源路径和 inode 之前，重新检查这两项。它会在可变阶段之前捕获两个用户根目录的现有身份信息，然后使用不跟随符号链接的目录句柄打开所有剩余组件，并在固定之前拒绝任何已消失、新出现或 inode 发生变化的根目录。它会将选定的条目链接到 `~/.agents/skills`，验证每个选定目标，之后才在 `~/.codex/skills` 下创建或确认 `legacy_codex_compat_skills`；最后的跨根检查会在源的前后身份检查之间读取这两个链接。如果选定策略需要，才会专门创建缺失的根目录。在选定的 `.agents` 目标位置，空路径或正确的链接会被接受；指向受管理源代码仓库的错误链接会移入带时间戳的恢复存储，而真实对象、相对/失效链接或第三方链接则会显式失败并保持原位。过时的、未选定的受管理链接会移入同一恢复存储；格式错误的外部链接会作为非所有链接跳过。移动操作本身具有排他性：如果已分类条目先发生变化，则会将并发获胜者恢复到原始名称，且选定的替换操作会失败（未选定条目的清理会跳过它）；如果更新的获胜者已经占据该名称，则两者都不会被覆盖，运行会失败，同时较早的获胜者会保留在恢复存储中。在请求的旧版兼容路径上，只有已经正确的同源链接或空路径会被接受；任何其他已存在的对象都会显式失败，且绝不会被替换。创建操作会发布一个已知的私有符号链接 inode，并通过原子式、不可覆盖的硬链接完成发布，因此发布之前、期间或之后出现的任何竞争路径都会安全失败——即使该路径指向预期源也是如此。其他由源支持的旧版链接会被记录下来，以便通过 `skill-governance` 进行明确且经过审查的清理；LaunchAgent 永远不会取消链接。

它还会自行清理，而早期版本不会：

- **版本别名符号链接。** 每个缓存链接都以 marketplace 的当前版本命名，因此每次版本升级都会遗留指向同一源目录的旧链接。某个插件有六个版本目录，其中四个实际上是同一个源目录的别名。现在的清理过程会移除解析到同一源目录的同级链接；真实目录绝不会被触碰，因为这些目录由 Claude Code 安装，活动中的会话可能仍会通过 `.in_use` 持有它们。
- **`installed_plugins.json` 备份。** 每次运行修改 JSON 时都会写入一个备份，而之前没有任何机制移除它们——运行一个月后留下了 453 个文件。脚本中的 `KEEP_JSON_BACKUPS` 常量会限制保留的备份数量；文件名以 `YYYYMMDD-HHMMSS` 时间戳结尾，因此按字典序排列就是按时间顺序排列。

在 `--apply` 实际执行任何操作之前，这两类清理都会在 dry run 中显示。

### 某个配置档缺少钩子、marketplaces、环境标志或其他默认配置档设置

症状：默认配置档配置了钩子保护、marketplaces 或功能标志，但第三方配置档的行为却像是这些设置不存在（没有触发任何 PreToolUse 保护，`claude plugin marketplace list` 为空，默认配置档中启用的功能处于关闭状态）。

**类似症状，但属于不同层（2026-08-17）：** 默认配置档设置的行为偏好——例如工作流大小指南——在第三方配置档中不起作用（Kimi 会话将 Dynamic Workflow 扩展到了 30 多个 agent，尽管主配置档中设置的是 `small`）。该键位于各配置档自己的 `.claude.json` 中，而符号链接和 `settings.json` 同步都无法覆盖这一层。请参阅 `references/troubleshooting.md` 中的“Default-profile behavior settings don't reach third-party profiles”。

原因：这些设置位于每个配置档自己的 `settings.json` 中，而该文件属于配置目录本地内容——符号链接目录无法覆盖配置层，并且默认配置档一发生变化，它们就会在不知不觉中产生漂移。

修复：

```bash
python3 ~/.config/claude-switch-models-setup/sync-profile-settings.py --all
```

然后重启受影响的窗口。一旦将收敛器注册为 SessionStart 钩子（设置步骤 6），每个配置档都会在会话启动时自行收敛，因此只有在手动编辑设置并希望立即传播时，才需要执行此命令。

### 第三方配置档尝试使用 Anthropic 专属功能

症状：WebSearch 或其他 Anthropic 原生工具失败并返回 400 错误。  
修复：确保该配置档的 `settings.json` 设置了：

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
修复：在该配置档的 `settings.json` 中，将 `CLAUDE_CODE_SUBAGENT_MODEL` 设置为与 `ANTHROPIC_MODEL` 相同的值。

### 超大上下文提供商过早进行压缩/摘要，或状态栏中的上下文数字看起来不正确

症状：某个提供商自己的文档声称其上下文容量约为 1M tokens，但 Claude Code 却在远低于该容量时自动进行压缩——较长的会话在显然还没有实际需要时就被摘要，或者状态栏中的上下文百分比表现得像是在以约 200K 的模型而不是真实上限为依据。

原因：配置文件中的 `ANTHROPIC_MODEL`（以及其对应的 `ANTHROPIC_DEFAULT_*_MODEL` / `CLAUDE_CODE_SUBAGENT_MODEL`）缺少 `[1m]` 标记。Claude Code 没有其他方式获知提供商实际的上下文大小——请求本身能够成功处理超长提示词并不能向 Claude Code 传达任何信息，因为这是上游提供商的属性，而不是客户端的属性。完整机制请参阅 `references/context-window-config.md`。

修复：在配置文件的 `settings.json` 中，为 `ANTHROPIC_MODEL`、每个 `ANTHROPIC_DEFAULT_*_MODEL` 以及 `CLAUDE_CODE_SUBAGENT_MODEL` 添加字面量 `[1m]` 后缀（遵循 `kimi.json` 的模式）。重启受影响的窗口。

## 稍后添加新提供商

1. 使用模板创建 `~/.claude/settings/<new-provider>.json`。
2. 检查提供商实际且经过验证的上下文窗口并进行配置——使用 `[1m]` 标记，或显式设置 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`/`CLAUDE_CODE_AUTO_COMPACT_WINDOW`，请参阅下方的“配置上下文窗口大小”和 `references/context-window-config.md`。不要因为复制的模板恰好不需要配置就跳过这一步。
3. 运行 `claude-profiles-init`。
4. 如有需要，将别名添加到 shell rc 文件中。

## 安全注意事项

- API 密钥会以纯文本形式写入 `~/.claude/settings/<provider>.json`，其方式与 Claude Code 存储 `ANTHROPIC_AUTH_TOKEN` 相同。这符合 Claude Code 自身的安全模型。
- 此 skill 不会将密钥或设置上传到任何地方。
- 对于公开分发，随附的脚本不包含硬编码的机密、端点或特定于用户的路径。

## 下一步

设置完成后，用户可以立即通过打开两个终端进行测试：在其中一个终端运行 `csk`（Kimi K3），在另一个终端运行 `csd`。每个窗口彼此独立。