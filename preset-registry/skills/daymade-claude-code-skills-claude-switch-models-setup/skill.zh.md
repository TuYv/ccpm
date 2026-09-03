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

此技能为 Claude Code CLI 创建一个隔离但共享的配置文件系统。每个配置文件都有自己的 `.claude.json` 状态文件（凭据和会话历史），同时在所有配置文件之间共享技能、项目、钩子脚本、代理和已安装的插件状态，并使每个配置文件的 `settings.json`（钩子注册、市场、环境特性标志、权限、偏好设置）以及其 `.claude.json` 的**行为片段**（例如 `workflowSizeGuideline`）与默认配置文件保持一致，因此配置文件之间唯一预期的差异就是模型/提供商。

最终效果是：你可以在一个终端中使用 Kimi，在另一个终端中使用 DeepSeek，在另一个终端中使用 Anthropic；每个终端都运行一个完全独立的 Claude Code 进程，不会发生配置串扰。

## 工作原理

- `CLAUDE_CONFIG_DIR` 告诉 Claude Code CLI 使用哪个目录作为配置根目录。
- 每个配置文件位于 `~/.claude-profiles/<name>/`，并拥有隔离的 `.claude.json`。
- 内容目录（`skills/`、`projects/`、`hooks/`、`agents/`、`settings/`）都通过符号链接指回主 `~/.claude/` 目录，因此你只需维护一份副本。注意，这共享的是钩子**脚本**，而不是钩子**注册信息**——注册信息位于每个配置文件自己的 `settings.json` 中（见下一条）。
- **配置层——`settings.json`：**每个配置文件都有自己的 `settings.json`（Claude Code 将其视为配置目录本地文件），因此其中存储的所有内容——钩子注册、`extraKnownMarketplaces`、`enabledPlugins`、`env` 特性标志、`permissions`、行为偏好——都会在默认配置文件发生变更的瞬间悄然产生漂移（截至 2026-07-18 的测量结果：9/9 个实际配置文件都没有钩子注册）。`sync-profile-settings.py` 是用于收敛这些配置的脚本：它被注册为 SessionStart 钩子，将默认配置文件的 `settings.json` 中的每个键复制到活动配置文件中，但身份键除外（顶层的 `model` 和 `advisorModel`——后者用于 Anthropic 模型路由，第三方端点无法提供该服务；以及携带提供商路由或 Anthropic 原生隔离设置的环境变量——`ANTHROPIC_*`、`CLAUDE_CODE_SUBAGENT_MODEL`、`ENABLE_TOOL_SEARCH`、`DISABLE_GROWTHBOOK/TELEMETRY/AUTOUPDATER`——这些变量由提供商设置文件有意设置为不同值）。配置文件独有的**顶层**键会被保留；某个键如果主配置文件也拥有，则其中的嵌套集合（例如 `permissions.allow`、`enabledPlugins`）会整体收敛为主配置文件的值，并列出因此被删除的配置文件独有嵌套条目（写入时统计数量，`--check` 下显示详细信息），让损失可见而不是悄无声息。这正是“除模型外，所有配置文件中的一切都能正常工作”得以成立的原因。
- **状态层——`.claude.json` 行为键：**`settings.json` 并不是唯一的配置文件。Claude Code 还会维护一个每个配置文件独有的状态文件（主配置文件位于 `~/.claude.json`；每个第三方配置文件的状态文件位于 `<profile>/.claude.json`——路径不对称，已在磁盘上验证），并且一些**行为**设置只存在于其中（`workflowSizeGuideline`、通知/UI 偏好）。2026-08-17，只有主配置文件存在 `workflowSizeGuideline: small`，而 11 个第三方配置文件中有 10 个没有该设置——没有系统提示中的大小指导时，一次 Kimi 会话将一个 Dynamic Workflow 扩展到了 30 多个代理。因此，同一个收敛脚本还会将一个行为键允许列表同步到每个配置文件的 `.claude.json` 中。安全机制是脚本中的三向分类器，而不是手动维护的键列表：允许列表中的行为键会被同步；状态/缓存/计数器/迁移/凭据键（通过名称模式匹配）永远不会被修改；任何未知且值不同的键都会被**报告——每次运行每个发生漂移的键占一行，直到人工完成分类**（这是一个触发机制，用于在新的行为键出现的当天发现它）。写入过程会进行备份并原子替换；在活动会话重写该文件的情况下，通过实时测试工具验证是安全的（一个标记键在活动会话运行超过 30 分钟期间仍然保留）。更改将在下一次会话中生效——测试工具会在启动时读取此文件。
- **例外——`plugins/`：**市场内容和安装状态是共享的，但每个配置文件保留自己的 `known_marketplaces.json`。Claude 使用 `path.resolve()` 验证市场的 `installLocation`（该函数**不会**解析符号链接），因此如果使用一个共享文件，所有不负责写入的配置文件都会报告“损坏的 installLocation”。`claude-plugins-sync.py` 负责构建并维护每个配置文件的这一结构。
- `claude-plugins-sync.py` 还会将默认 `~/.claude/settings.json` 中的 `enabledPlugins` 镜像到每个配置文件的 `settings.json` 中（仅共享缓存文件还不够；Claude Code 将“启用”状态视为配置目录本地状态）。它会在配置文件启动时运行，并以响应式方式运行——下一条中的 LaunchAgent 会在默认配置文件的 `settings.json` 每次写入时重新运行它，因此 `claude plugin enable`/`disable --scope user` 通常会在几秒内传播到每个配置文件，无需重新启动（已于 2026-08-22 验证）。该镜像过程会**先执行采纳**：某些配置文件的 `settings.json` 中仅存在、但默认配置文件中不存在的 `enabledPlugins` 键（这是 `claude plugin install` 写入它们的方式）会在镜像前写回默认配置文件——仅采纳值一致的键；跨配置文件的冲突则保留在各个配置文件中，并通过持续警告提示，而不会被悄然覆盖（该行为于 2026-09-03 添加，此前已确认不执行采纳的镜像是技能可见性反复丢失的机械性根因）。上面的 SessionStart 收敛器会将同一个键作为整体设置同步的一部分进行处理；`claude-plugins-sync.py` 仍然负责每个配置文件的 `known_marketplaces.json` 结构。`skill-install-audit.py` 以只读方式协调注册表 / 已安装 / 已启用 / Codex 清单 / `~/.agents/skills` 这些层。
- 本地源同步在维护者机器上会自动进行，但**源清单不是激活策略**。Claude 插件缓存目录仍由源提供支持；Codex 用户技能由 `~/.config/claude-switch-models-setup/codex-active-skills.json` 显式选择，并链接到官方用户根目录 `~/.agents/skills`。`~/.codex/skills/.system` 仍由 Codex 自己管理；修复过程不会修改它。每次选定的替换链接验证完成后，该过程只会创建或确认可选的 `legacy_codex_compat_skills` 子集，并将其作为同源链接放置在旧版 `~/.codex/skills` 下；其他受管理的旧版链接只会被报告以便审查清理，后台任务绝不会删除它们。
  - 清单刻意采用快速失败策略：文件缺失、不是数组、名称列表重复、名称未知、兼容性名称不在 `active_skills` 中，或同一个 frontmatter 名称由两个不同的源捆绑包注册时，会在修改根目录之前中止。显式 JSON `null` 属于格式错误，不代表空的兼容性选择。这可以防止 Python 字典或目录扫描顺序悄然决定最终采用哪个对象。
  - **守护进程拥有的符号链接存在的陷阱**（2026-07 观察到）：绝不要在现有的守护进程条目上手动创建符号链接。BSD `ln` 可能会将新链接放入目标目录内部，从而留下一个自引用的残留链接。对于正常激活，应修改 `active_skills`；当某个长期运行的钩子或进程仍持有旧的 `~/.codex/skills/<name>` 路径时，应将那个已经处于活动状态的名称加入 `legacy_codex_compat_skills`。使用 `readlink` 验证链接，而不是使用 `ls -la <link>`——`ls` 会跟随链接，可能使失败的替换看起来像是成功的。
  - 已安装在 `~/.agents/skills` 下的第三方捆绑包不属于该清单的管理范围。不要将它们添加到源清单中，也不要仅仅为了减少 Codex 提示词负载而删除它们。若要“保留捆绑包在磁盘上但对 Codex 隐藏”，应将其交由 `/daymade-skill:skill-governance` 处理；`references/local-source-sync-architecture.md` 记录了这一所有权边界，但不重复该工作流。
- 同步脚本使用跨进程共享锁。这是必要的，因为用户经常会通过 tmux 或多个终端同时打开多个提供商窗口；并发启动必须串行化市场/缓存重写，同时仍允许所有配置文件启动。
- 如需了解完整的本地源架构，请在修改这些脚本之前阅读 `references/local-source-sync-architecture.md`。
- 提供商路由通过 `~/.claude/settings/<name>.json` 完成，该文件会为对应窗口设置 `ANTHROPIC_MODEL`、`ANTHROPIC_BASE_URL` 和 `ANTHROPIC_AUTH_TOKEN`。

## 一键设置工作流

当用户说类似“设置 Claude Code 配置档案”或“我想在不同窗口中使用 Kimi 和 DeepSeek”时：

1. **检查前置条件**
   - 已安装 `claude` CLI：`which claude`
   - Shell 是 zsh 或 bash：通过 `$SHELL` 检测
   - `python3` 可用

2. **安装配置档案管理脚本 — 创建符号链接，不要复制**

   在已检出此仓库的机器上（维护者场景），运行随附的安装程序 — 它执行的操作与下面的手动步骤完全相同：

   ```bash
   <absolute-path-to-this-repo>/daymade-claude-code/claude-switch-models-setup/scripts/setup.sh
   ```

   或者手动创建链接。`REPO` **必须是绝对路径**：如果使用相对路径，下面的每条命令仍会成功并以 0 退出，但会留下断开的链接，导致 `csk` 和 LaunchAgent 出错，且没有错误信息可供追踪。

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

   这里明确列出部署路径，而不是使用通配符，这样阅读本文档时就能知道有哪些脚本以及它们位于何处 — `scripts/*.sh` 做不到这一点。不需要执行 `chmod`：每个列出的脚本在提交时都已设置为可执行，因此再次设置权限只会让检出目录产生模式变更，随后这些变更还会被带入其他人的提交。

   **为什么使用符号链接而不是 `cp`：** 实际运行的是 `~/.config/…` 中的内容 — LaunchAgent 和 `claude-profile` 都会通过该路径调用脚本 — 而此仓库存放的是它们的源代码。副本会逐渐偏离，而且部署副本与源文件在外观上没有任何区别，因此没有人能始终可靠地判断“我编辑的是 SSOT 吗？”在切换之前对一台机器进行测量时发现：一个修复锁位置的改动在仓库中放了 26 天，而部署副本仍在运行那个已修复的 bug；另外两个直接写入部署副本的清理例程从未进入版本控制 — **两个方向都在无声地发生偏离。** 链接可以同时消除这两种偏离，*只要它一直保持为链接* — 原子保存编辑器、`rsync` 或误用 `cp` 都可能在不提示的情况下将其变回真实文件，这正是值得重新检查、而不是宣称问题已经解决的原因。它还允许 `sync-local-skill-sources.py` 通过解析自身路径来定位源代码仓库，而不必退回到猜测。

   如何值得重新检查？任何定期检查方式都可以；此 skill 没有随附此类机制。在你通常进行此类操作的地方运行下面这一行即可：

   ```bash
   for f in ~/.config/claude-switch-models-setup/*.py ~/.config/claude-switch-models-setup/*.sh; do
     [ -L "$f" ] && [ -e "$f" ] || echo "not a live link: $f"
   done
   ```

如果某个文件已经变成真实文件，**请在重新建立链接前先将其移开**——其中可能包含其他地方不存在的编辑内容，而这正是本文所描述的问题所在：`mv "$f" "$f.local-edits" && ln -sf <source> "$f"`，然后进行 diff。

   在**没有仓库**的机器上，请改为从此 skill bundle 中复制安装程序列出的脚本——并接受这样的事实：在你再次复制之前，仓库中的修复不会同步到该机器。

3. **添加 shell 集成**
   - 在 `~/.zshrc` 或 `~/.bashrc` 中加载 profile manager
   - 添加别名：`csk`、`csks`、`csd`、`csg`、`css`
   - 如有需要，手动添加其他按账户/套餐区分的变体别名——`claude-profiles.sh` 只定义上述别名
   - 告知用户运行 `source ~/.zshrc`（或打开新的终端）

4. **生成 provider 设置文件**
   - 为用户需要的每个 provider 创建 `~/.claude/settings/<provider>.json`
   - 使用 `assets/templates/` 中的模板作为起点
   - 提示用户输入其 API key 和 base URL；**绝不要硬编码默认值**
   - 正确设置该特定 provider 的上下文窗口——使用 `[1m]` 后缀，或显式设置 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`/`CLAUDE_CODE_AUTO_COMPACT_WINDOW`，参见下方的“配置上下文窗口大小”。每创建一个新 profile，都要明确执行此操作，不要直接复制最近的模板中已有的设置——最近的模板不需要该设置，并不能证明当前 profile 也不需要。
   - 包含必需的隔离标志：
     - `CLAUDE_CODE_SUBAGENT_MODEL`（与 `ANTHROPIC_MODEL` 相同）
     - `ENABLE_TOOL_SEARCH: "false"`
     - `DISABLE_GROWTHBOOK: "1"`
     - `DISABLE_TELEMETRY: "1"`
     - `DISABLE_AUTOUPDATER: "1"`

5. **初始化 profile 目录**
   - 运行 `claude-profiles-init`
   - 该命令会创建 `~/.claude-profiles/<provider>/`，其中包含隔离的 `.claude.json` 和符号链接
   - 在维护者机器上，该命令还会在同步插件元数据之前修复本地源代码符号链接

   **Statusline wiring：** `claude-profiles-init` 会自动从 `~/.claude/settings.json` 或 `~/.claude/statusline.sh` 中检测 statusline 脚本，并将其注入每个新 profile。如果两者都不存在，profile 仍可正常工作，但不会显示状态栏。**是否需要 statusline、是否适合安装 `statusline-generator` skill，以及运行其安装程序，应该由 AI 决定**，而不是由 profile 设置脚本决定。不要将依赖安装硬编码到 shell 脚本中。

6. **注册设置 converger**
   - 将 converger 添加为默认 profile 的 `~/.claude/settings.json` 中 `hooks.SessionStart` 列表里的一个 SessionStart hook，使用类似 `'/absolute/path/to/python3' '/absolute/path/to/sync-profile-settings.py'` 的绝对路径直接调用 Python 命令。不要通过 shebang 或 package manager 注册 `.py` 文件：此 hook 用于修复每个 profile，不能等待共享环境/缓存锁。当前活动 profile **是**默认 profile 时，该 hook 不执行任何操作；它在默认 profile 中的作用，是在第一次同步时将自身传播到每个 profile 的 `hooks` 键中。
   - 运行初始对齐：`python3 ~/.config/claude-switch-models-setup/sync-profile-settings.py --all`
   - 此后，每个 profile 会在每次会话开始时，根据默认 profile 收敛其 `settings.json` 以及 `.claude.json` 中的行为部分（更改会在下一个会话生效）。仅审计而不写入：`--check --all`

7. **验证隔离**
   - 运行 `claude-profiles-doctor`
   - 确认每个配置文件目录都包含 `.claude.json`，且符号链接有效

8. **为维护者选择并安装 Codex 用户 Skills**
   - 普通学生或不编辑 skill 源代码仓库的用户跳过此步骤
   - 编辑 `~/.config/claude-switch-models-setup/codex-active-skills.json`；仅列出应对 Codex 全局可见的源 Skills。空列表表示明确选择不激活任何 Skill。
   - 如果仍在运行的 hook 或进程保留旧路径，则将当前已激活的 Skill 列入 `legacy_codex_compat_skills`；否则保持兼容列表为空。
   - 运行 `sync-local-skill-sources.py --apply`。它会在创建或确认显式兼容链接之前，创建/验证选定的 `~/.agents/skills` 链接，并报告其他由其管理的旧链接，以便通过 `skill-governance` 进行审核清理。
   - 在维护者的 macOS 计算机上，运行 `sync-local-skill-sources-daemon.sh --install`
   - 此监视器会监视激活清单、默认 Claude 安装状态和本地 marketplace 清单，并在选择、安装/卸载或插件拓扑发生变化后修复派生状态

9. **向用户展示启动方式**
   - `csk` → Kimi K3 窗口
   - `csks` → Kimi K2.7 highspeed 窗口
   - `csd` → DeepSeek 窗口
   - `csg` → GLM 窗口
   - `css` → StepFun 窗口
   - `claude`（无别名）→ 默认 Anthropic 配置文件
   - 可选：手动添加按账户/套餐区分的变体别名，例如
     `alias cssp='claude-profile step-pay --dangerously-skip-permissions'` —
     `claude-profiles.sh` 不会生成此别名；这是在此基础上手动采用的一种模式

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

这些不是日常使用的命令。常规源代码编辑会通过符号链接实时生效。这些一次性命令用于修复、引导设置，或用于没有 LaunchAgent 监视器的非 macOS 环境。

## Provider Templates

模板位于 `assets/templates/`：

- `minimax.json` — MiniMax-M3，全局端点，1M 上下文，自适应或禁用思考
- `minimax-cn.json` — MiniMax-M3，中国端点，1M 上下文，自适应或禁用思考
- `minimax-m2-7.json` — MiniMax-M2.7，全局端点，204800-token 上下文，始终启用思考
- `minimax-m2-7-cn.json` — MiniMax-M2.7，中国端点，204800-token 上下文，始终启用思考
- `kimi.json` — Kimi K3（通过 `[1m]` 标记实现 1M 上下文，详见下文“配置上下文窗口大小”）
- `kimi-highspeed.json` — Kimi K2.7 highspeed（旧版 200K 上下文）
- `glm.json`
- `deepseek.json`
- `stepfun.json`
- `anthropic.json`

每个模板都使用 `<API_KEY>` 占位符。可配置网关的模板还使用 `<BASE_URL>`；MiniMax 模板固定使用文档中说明的区域端点。要求用户提供每个真实的占位符值；除非用户明确提供，否则不要猜测或复用当前机器上的值。

### MiniMax model behavior

| Templates | Model | Context configuration | Thinking behavior |
|---|---|---|---|
| `minimax.json`、`minimax-cn.json` | `MiniMax-M3` | 为每个路由模型值追加 `[1m]`，并将 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 设置为 `1000000`。 | 支持自适应或禁用思考。保持 `ANTHROPIC_REASONING_MODEL` 使用同一模型。 |
| `minimax-m2-7.json`、`minimax-m2-7-cn.json` | `MiniMax-M2.7` | 将 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 和 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 设置为 `204800`；不要追加 `[1m]`。 | 思考始终启用；不要声称存在模板级别的禁用路径。 |

## Configuring Context Window Size

每个提供商模板都通过以下两种方式之一设置模型的上下文窗口大小。配置错误会导致 Claude Code 无法得知模型实际能够容纳多少上下文。设置过小会导致它远早于提供商的实际要求进行压缩（总结内容、丢弃旧的细节）；设置过大则会导致它直到实际限制已经被超出后才进行压缩。

`[1m]` 标记的完整客户端机制，包括它如何从模型字段中剥离该标记、如何将其添加到 `anthropic-beta` 请求头，以及为什么缺少 `[1m]` *并不意味着*提供商无法容纳较大的提示词，已记录在 `references/context-window-config.md` 中。当上下文数值看起来不正确时，请查阅该文档，而不是在编写模板时查阅。

### Decision rule

编写新的提供商 `settings/<name>.json` 时，应根据提供商真实且经过验证的上下文窗口来选择，不要依据模型的营销名称，也不要照搬最接近的模板所采用的方式：

| Provider's real context window | What to set | Example template |
|---|---|---|
| 约 1M tokens，已明确确认（不是根据模型的级别或名称推断） | 在每个 `ANTHROPIC_MODEL` / `ANTHROPIC_DEFAULT_*_MODEL` / `CLAUDE_CODE_SUBAGENT_MODEL` 值后追加 `[1m]` 后缀。必须是准确的 4 个字符 `[1m]`，Claude Code 匹配的是这个字面字符串，而不是类似 `[1million]` 或 `[max]` 的自定义标记。 | `kimi.json` |
| 已知的较小大小（例如 200K） | 将 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 和/或 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 显式设置为实际数值，不要使用 `[1m]`。 | `kimi-highspeed.json`（`200000`） |
| 未知 / 尚未验证 | 不要猜测，也不要仅仅因为模板需要设置某个值，就照搬其他提供商的数值。请用户先查阅提供商自己的文档或控制台。未经验证的 `[1m]` 或未经验证的较大 `CLAUDE_CODE_AUTO_COMPACT_WINDOW`，只会将故障从“过早压缩”转变为“直到远超实际限制后才压缩”——情况更糟，因为在实际请求失败之前它都不会表现出来。 |

`deepseek.json` 和 `glm.json` 同时设置了 **[1m]** 以及显式的 `CLAUDE_CODE_AUTO_COMPACT_WINDOW: "1000000"`。这是双重保险，并非可以删掉的冗余内容——标记和显式覆盖之间的确切优先级尚未经过独立逆向分析，因此如果你要复制这两个模板中的任意一个，请保留两者，不要删掉其中之一。

MiniMax-M3 模板也使用相同的 1M 标记，并显式设置 `1000000` 的自动压缩值。MiniMax-M2.7 模板使用显式的 `204800` 限制，不带标记。

完整的 step-2-16k 模板正确性实战记录（说明为什么一个内部看起来自洽的上下文值不等于当前正确值——请根据提供商的最新文档交叉核对模型名称，而不只是检查它周围的数字），以及一套可复用的验证方法，用于确认某个环境变量是否确实改变了通过网络发送的字节数（使用本地 `http.server` 捕获，因为 `--debug api` 只能显示内部状态），位于 `references/context-window-config.md`。

### 常见基础 URL（请向提供商确认）

| 提供商 | 常见基础 URL |
|----------|------------------|
| Kimi     | `https://api.moonshot.cn` 或兼容 OpenRouter 的端点 |
| GLM      | `https://open.bigmodel.cn/api/paas/v4` 或兼容 OpenRouter 的端点 |
| DeepSeek | `https://api.deepseek.com` 或兼容 OpenRouter 的端点 |
| StepFun  | `https://api.stepfun.com` 或兼容 OpenRouter 的端点 |
| MiniMax  | 全球：`https://api.minimax.io/anthropic`；中国：`https://api.minimaxi.com/anthropic` |
| Anthropic| `https://api.anthropic.com` |

**重要：** 确切的端点取决于用户是直接调用提供商，还是通过兼容网关（例如 OpenRouter）调用。请务必询问清楚。

## 共享与隔离

| 数据 | 位置 | 是否共享？ |
|------|----------|---------|
| 会话历史 | `~/.claude-profiles/<name>/.claude.json` | **按配置文件隔离** |
| 身份验证令牌/缓存 | `~/.claude-profiles/<name>/.claude.json` | **按配置文件隔离** |
| Skills | `~/.claude/skills/` | 通过符号链接共享 |
| 插件内容 | `~/.claude/plugins/marketplaces`、`cache`、`data` 等 | 通过符号链接共享 |
| 插件安装注册表 | `~/.claude/plugins/installed_plugins.json` | 通过符号链接共享 |
| 已启用插件映射 | `~/.claude/settings.json` -> `<profile>/settings.json` | 由 `sync-profile-settings.py` 汇聚（也由 `claude-plugins-sync.py` 镜像） |
| 插件市场索引 | `<profile>/plugins/known_marketplaces.json` | **按配置文件区分**（installLocation 与配置目录相关，无法共享） |
| 项目/记忆 | `~/.claude/projects/`、`~/.claude/memory/` | 通过符号链接共享 |
| Hook 脚本 | `~/.claude/hooks/`、`~/.claude/commands/` | 通过符号链接共享（仅脚本共享——**不包括注册信息**） |
| `settings.json` 配置：Hook 注册、市场、环境标志、权限、偏好设置 | `<profile>/settings.json` | 在会话开始时由 `sync-profile-settings.py` **从默认配置文件汇聚**（身份键，如 `model`，以及提供商路由/隔离环境变量永不同步） |
| `.claude.json` 行为键（`workflowSizeGuideline`、通知/UI 偏好设置） | `~/.claude.json` → `<profile>/.claude.json` | 由同一脚本**按行为允许列表汇聚**；状态/缓存/计数器/迁移/凭据键（包括 `projects`、`oauthAccount`、`userID`）永不同步；漂移的未知键会报告给人工分类 |
| 提供商设置 | `~/.claude/settings/<name>.json` | 共享源，按配置文件加载 |

## 故障排查

### 配置目录存在，但 claude-profiles-doctor 将其报告为“孤立配置文件”

症状：`claude-profiles-doctor` 报告
`WARN: orphan profile — no settings/<name>.json; claude-profile <name> fails. Run: claude-profile-rm <name>`。

原因：配置隔离目录存在于 `~/.claude-profiles/` 下，但对应的 `~/.claude/settings/<name>.json` provider 配置文件缺失。`claude-profiles-init` 只扫描 `settings/*.json`，因此不会创建或维护孤立配置文件的符号链接，并且 `claude-profile <name>` 将因“Error: Settings file not found.”而无法启动。配置目录中可能仍包含有用的每个配置文件数据（`history.jsonl`、包含 provider credentials 的 `.claude.json`、`settings.json`、skill workspaces）。

修复：
- **如果不再需要该配置文件**：运行 `claude-profile-rm <name>`，这会安全地移除隔离目录（该命令会先检查是否存在意外文件）。
- **如果希望恢复该配置文件**：在 `~/.claude/settings/<name>.json` 创建 settings 文件（使用 `assets/templates/` 中的 provider 模板），然后运行 `claude-profiles-init`。

### 共享目录（skills/projects/hooks/agents/...）显示为真实目录，而不是符号链接

症状：`claude-profiles-doctor` 报告
`<name> is a real directory (expected symlink to ~/.claude/<name>) — drift; run: claude-profiles-init --repair`。

原因：该配置文件是在符号链接收敛设计落地之前创建的（或是手动创建的），因此某个共享内容目录最终成为真实的每个配置文件专属目录，而不是符号链接。现在，该配置文件中的副本会与主 `~/.claude/` 副本悄然产生偏差，其 skills/projects/hooks/agents 与其他所有配置文件中的并不相同。损坏符号链接检查无法发现这一问题（真实目录不是损坏的链接）；在真实机器上，这种偏差持续数月未被发现，直到添加了专门的真实目录检查（2026-07-21：在此检查存在之前创建的旧配置文件携带真实的 `projects/` 目录数月之久，始终未被发现）。

修复（可逆：数据会被归档，从不删除）：

```bash
claude-profiles-init --repair
```

对于每个存在偏差的目录，该命令会将真实目录归档到配置文件目录中的
`<name>.pre-symlink-bak-<timestamp>`，然后创建本应存在的符号链接。再次运行 `claude-profiles-doctor`，确认检查结果正常。如果归档中有需要的数据，它就在原处，没有任何内容被销毁。

关于共享内容的说明：修复后，该目录会指向主 `~/.claude/<name>` 副本，因此该配置文件会看到与默认配置文件相同的 skills/projects/etc.，这正是共享符号链接设计的全部目的。必须保持隔离的每个配置文件状态（`.claude.json`、包含 `model`/provider env 等 identity keys 的 `settings.json`、`plugins/known_marketplaces.json`）从来都不属于这些符号链接目录，因此修复不会触及这些状态。如果配置文件中包含需要保留的 session/history 数据，请先检查归档，再决定是否丢弃它；这些数据现在会解析到共享副本。

### Marketplace 报告“corrupted installLocation”

现象：`/plugin` 或 `claude plugin marketplace update` 报告
`corrupted installLocation ... expected a path inside <config-dir>/plugins/marketplaces`。

原因：`known_marketplaces.json` 在多个 profile 之间共享（或被手动编辑）。其
`installLocation` 与 config-dir 相关，因为 Claude 使用 `path.resolve()` 进行验证
（不会解析符号链接），因此同一份共享副本无法满足多个 profile。

修复：`claude-plugins-sync.py` 会重建每个 profile 自己的副本以及共享内容的
符号链接。它会在 `claude-profile` 初始化/启动时自动运行；如需手动运行：

```bash
python3 ~/.config/claude-switch-models-setup/claude-plugins-sync.py
```

### Skill 在默认 Claude 中存在，但在 Kimi/GLM/DeepSeek 中缺失

现象：默认 Anthropic profile 可以看到某个 Skill，但第三方 profile 无法看到。

原因：Claude Code 将 `enabledPlugins` 存储在每个 config 目录的 `settings.json` 中。
共享 `plugins/cache` 只能让文件可用；它不会启用这些插件。

修复：

```bash
python3 ~/.config/claude-switch-models-setup/claude-plugins-sync.py
```

然后重启受影响的 Claude Code 窗口。

### 本地源代码编辑不会在 Claude Code 或 Codex 中显示

现象：你在本地源代码仓库中编辑了某个 Skill，但 Claude Code 或 Codex 仍然加载旧的已安装副本。

预期设计：对已安装的 Claude 插件或明确选中的 Codex 用户 Skill 进行的普通编辑会立即生效，因为它们的运行时位置是符号链接。未出现在 `codex-active-skills.json` 中的源 Skill 是有意保留的冷清单，不是同步漂移。由于 Skill 元数据会在会话启动时加载，已有的 Claude Code/Codex 会话可能仍需要重启。

如果编辑涉及结构性变更（新插件、新 Skill 条目、版本更新、安装/卸载或 marketplace 清单变更），macOS LaunchAgent 应会自动运行。检查：

```bash
launchctl print gui/$(id -u)/ai.daymade.claude-skill-source-sync
```

仅当 watcher 未安装，或你使用的是非 macOS 系统时，才需要手动修复：

```bash
python3 ~/.config/claude-switch-models-setup/sync-local-skill-sources.py --apply
```

该命令首先验证明确的激活清单和完整的源名称集合。每个已注册的 Skill 都会携带其 marketplace-repo 包含关系以及加载时的 inode，并在冻结步骤中重新检查二者，然后在整个过程中绑定同一个源路径和 inode。它会在可变阶段开始前捕获两个用户根目录的现有身份信息，随后使用不跟随符号链接的目录句柄打开每个剩余组件；在固定根目录前，如果根目录消失、新出现或 inode 发生变化，命令都会拒绝继续。它会将选中的条目链接到 `~/.agents/skills`，验证每个选中的目标，之后才在 `~/.codex/skills` 下创建或确认 `legacy_codex_compat_skills`；最后的跨根检查会在源目录前后身份检查之间读取两个链接。如果选定的策略需要某个根目录，只有在根目录缺失时才会专门创建。在选定的 `.agents` 目标位置，空路径或正确的链接会被接受；指向受管理源代码仓库的错误链接会移入带时间戳的恢复存储，而真实对象、相对/失效链接或第三方链接会明确失败并保留原位。过时的、未选中的受管理链接会移入同一恢复存储；格式异常的外部链接会作为非归属对象跳过。移动操作本身具有排他性：如果已分类条目先发生变化，并发获胜者会被恢复到原名称，选中的替换操作会失败（未选中的清理操作则跳过）；如果更新的获胜者已经占据该名称，则两者都不会被覆盖，运行会失败，同时较早的获胜者会保留在恢复存储中。在请求的 legacy 兼容路径上，只有已经正确指向同一源的链接或空路径会被接受；其他所有已存在的对象都会明确失败，绝不会被替换。创建过程会发布一个已知的私有符号链接 inode，并通过原子式的无覆盖硬链接完成发布，因此发布前、发布期间或发布后的任何竞争路径都会导致操作安全失败，即使该路径指向预期源也是如此。其他由源支持的 legacy 链接会被记录下来，交由 `skill-governance` 进行明确且经过审核的清理；LaunchAgent 绝不会解除这些链接。

它还会自行清理，而早期版本不会：

- **版本别名符号链接。** 每个缓存链接都以 marketplace 的当前版本命名，因此每次版本升级都会留下之前的链接，并使其指向完全相同的源目录。某个插件曾有六个版本目录，其中四个是同一源目录的别名。现在的清理过程会移除那些解析到同一源目录的同级链接；真实目录永远不会被触碰，因为这些目录由 Claude Code 安装，活动会话可能仍通过 `.in_use` 持有它们。
- **`installed_plugins.json` 备份。** 每次修改 JSON 的运行都会写入一个备份，而之前没有任何机制移除它们，导致一个月的运行留下了 453 个文件。脚本中的 `KEEP_JSON_BACKUPS` 常量限制了保留的备份集合；文件名末尾带有 `YYYYMMDD-HHMMSS` 时间戳，因此按字典序排列就是按时间顺序排列。

在 `--apply` 执行任何操作之前，这两类清理都会在 dry run 中显示。

### 某个 profile 缺少 hooks、marketplaces、env flags 或其他 default profile 设置

症状：default profile 配置了 hook guards、marketplaces 或 feature flags，但 third-party profile 的行为仿佛这些设置不存在（没有 PreToolUse guards 触发，`claude plugin marketplace list` 为空，default profile 中启用的功能处于关闭状态）。

**同类症状，但属于不同层（2026-08-17）：** default profile 设置的行为偏好，例如 workflow size guideline，在 third-party profiles 中没有生效（Kimi 会话将 Dynamic Workflow 扩展到了 30+ 个 agents，尽管 main 上设置的是 `small`）。该键位于每个 profile 的 `.claude.json` 中，而符号链接和 settings.json 同步都会遗漏它。请参阅 `references/troubleshooting.md` 中的“Default-profile behavior settings don't reach third-party profiles”。

原因：这些设置位于各 profile 自己的 `settings.json` 中，该文件属于 config-dir-local；仅对目录创建符号链接无法覆盖配置层，而且 default profile 一旦发生变化，就会悄无声息地产生漂移。

修复：

```bash
python3 ~/.config/claude-switch-models-setup/sync-profile-settings.py --all
```

然后重启受影响的窗口。一旦 converger 被注册为 SessionStart hook（setup step 6），每个 profile 都会在会话开始时自行收敛，因此只有在你手动编辑 settings 并希望立即传播时，才需要执行此命令。

### Third-party profile 尝试使用 Anthropic 专属功能

症状：WebSearch 或其他 Anthropic 原生工具失败并返回 400 错误。  
修复：确保该 profile 的 `settings.json` 设置了：

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

### Subagent 调用回退到了其他模型

症状：Kimi 窗口中的 Subagents 调用了 `claude-opus-4-7`。  
修复：在该 profile 的 `settings.json` 中，将 `CLAUDE_CODE_SUBAGENT_MODEL` 设置为与 `ANTHROPIC_MODEL` 相同的值。

### 超大上下文 provider 过早进行压缩/摘要，或 statusline 上的上下文数字看起来不正确

症状：某个 provider 自身文档声称支持约 1M tokens 的上下文，却被 Claude Code 在远低于该容量时自动压缩，长会话在显然还没有实际需要时就被摘要，或者 statusline 中的上下文百分比看起来像是在按照约 200K 模型而非真实上限进行跟踪。

原因：配置文件中的 `ANTHROPIC_MODEL`（以及其 `ANTHROPIC_DEFAULT_*_MODEL` / `CLAUDE_CODE_SUBAGENT_MODEL` 同类配置）缺少 `[1m]` 标记。Claude Code 没有其他方式了解提供商的实际上下文大小，因为请求本身能够成功处理超大提示词，并不能向 Claude Code 说明任何信息；这是上游提供商的属性，而不是客户端的属性。完整机制请参阅 `references/context-window-config.md`。

修复：在配置文件的 `settings.json` 中，为 `ANTHROPIC_MODEL`、每个 `ANTHROPIC_DEFAULT_*_MODEL` 以及 `CLAUDE_CODE_SUBAGENT_MODEL` 添加字面量 `[1m]` 后缀（参照 `kimi.json` 的模式）。重启受影响的窗口。

## 稍后添加新提供商

1. 使用模板创建 `~/.claude/settings/<new-provider>.json`。
2. 检查提供商真实且经过验证的上下文窗口，并进行配置：使用 `[1m]` 标记，或显式设置 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`/`CLAUDE_CODE_AUTO_COMPACT_WINDOW`。请参阅下方的“配置上下文窗口大小”和 `references/context-window-config.md`。不要因为复制的模板恰好不需要配置就跳过此步骤。
3. 运行 `claude-profiles-init`。
4. 如果需要，在 shell rc 文件中添加别名。

## 安全说明

- API 密钥会以明文形式写入 `~/.claude/settings/<provider>.json`，与 Claude Code 存储 `ANTHROPIC_AUTH_TOKEN` 的方式相同。这符合 Claude Code 自身的安全模型。
- 此 skill 不会将密钥或设置上传到任何地方。
- 对于公开分发，随附的脚本不包含硬编码的机密、端点或特定用户路径。

## 下一步

完成设置后，用户可以立即通过打开两个终端进行测试：在一个终端中运行 `csk`（Kimi K3），在另一个终端中运行 `csd`。每个窗口彼此独立。