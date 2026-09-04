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

此技能为 Claude Code CLI 创建一个隔离但共享的配置文件系统。每个配置文件都有自己的 `.claude.json` 状态文件（凭据和会话历史），同时在所有配置文件之间共享技能、项目、钩子脚本、代理和已安装的插件状态，并使每个配置文件的 `settings.json`（钩子注册、市场、环境功能标志、权限、偏好设置）以及其 `.claude.json` 的**行为部分**（例如 `workflowSizeGuideline`）与默认配置文件保持一致，因此配置文件之间唯一预期的差异就是模型/提供商。

最终，你可以在一个终端中使用 Kimi，在另一个终端中使用 DeepSeek，在另一个终端中使用 Anthropic；每个终端都运行一个完全独立的 Claude Code 进程，不会发生配置串扰。

## 工作原理

- `CLAUDE_CONFIG_DIR` 告诉 Claude Code CLI 应使用哪个目录作为配置根目录。
- 每个配置文件位于 `~/.claude-profiles/<name>/`，并拥有隔离的 `.claude.json`。
- 内容目录（`skills/`、`projects/`、`hooks/`、`agents/`、`settings/`）都通过符号链接指回主 `~/.claude/` 目录，因此只需维护一份副本。注意，这里共享的是钩子**脚本**，而不是钩子**注册信息**；注册信息位于每个配置文件自己的 `settings.json` 中（见下一项）。
- **配置层 — `settings.json`：** 每个配置文件都有自己的 `settings.json`（Claude Code 将其视为配置目录本地文件），因此其中存储的所有内容——钩子注册、`extraKnownMarketplaces`、`enabledPlugins`、`env` 功能标志、`permissions`、行为偏好——只要默认配置文件发生变化，就会立即悄然偏离（测量于 2026-07-18：9/9 个真实配置文件都没有任何钩子注册）。`sync-profile-settings.py` 是负责收敛的脚本：它被注册为 SessionStart 钩子，将默认配置文件的 `settings.json` 中的每个键复制到活动配置文件，但身份键除外（顶层 `model` 和 `advisorModel`——后者用于 Anthropic 模型路由，第三方端点无法提供该模型；以及携带提供商路由或 Anthropic 原生隔离设置的环境变量——`ANTHROPIC_*`、`CLAUDE_CODE_SUBAGENT_MODEL`、`ENABLE_TOOL_SEARCH`、`DISABLE_GROWTHBOOK/TELEMETRY/AUTOUPDATER`——这些变量由提供商设置文件有意设为不同值）。配置文件专属的**顶层**键会被保留；某个键如果主配置文件也拥有，则其内部集合（例如 `permissions.allow`、`enabledPlugins`）会整体收敛为主配置文件的值，并列出因此被删除的配置文件专属嵌套条目（写入时统计数量，`--check` 下显示详情），让损失可见而不是静默发生。这正是“除了模型外，所有配置在每个配置文件中都能正常工作”得以成立的原因。
- **状态层 — `.claude.json` 行为键：** `settings.json` 并不是唯一的配置文件。Claude Code 还会维护一个每个配置文件独有的状态文件（主配置文件的是 `~/.claude.json`；每个第三方配置文件的是 `<profile>/.claude.json`——路径不对称，已在磁盘上验证），少量**行为**设置只存在于其中（`workflowSizeGuideline`、通知/UI 偏好）。2026-08-17，`workflowSizeGuideline: small` 只存在于主配置文件中，11 个第三方配置文件中有 10 个没有该副本——一次 Kimi 会话在系统提示中没有任何大小指导的情况下，将一个 Dynamic Workflow 扩展到了 30 多个代理。同一个收敛器因此还会将一份行为键允许列表同步到每个配置文件的 `.claude.json` 中。其安全机制是脚本中的三方分类器，而不是手工维护的键列表：允许列表中的行为键会被同步；通过名称模式匹配出的状态/缓存/计数器/迁移/凭据键永远不会被修改；任何未知且值不同的键都会被**报告——每次运行每个发生偏离的键占一行，直到人工完成分类**（这是一个触发机制，能在下一个行为键出现当天将其暴露出来）。写入采用备份加原子替换；通过活动状态下的测试工具验证安全性：测试工具持续重写文件时，一个标记键仍能存活 30 多分钟。更改将在下一次会话中生效——测试工具会在启动时读取此文件。
- **例外——`plugins/`：** 市场内容和安装状态是共享的，但每个配置文件都保留自己的 `known_marketplaces.json`。Claude 使用 `path.resolve()` 验证市场的 `installLocation`（该函数**不会**解析符号链接），因此如果只使用一个共享文件，所有非写入配置文件都会报告“损坏的 installLocation”。`claude-plugins-sync.py` 会为每个配置文件构建并维护这一结构。
- `claude-plugins-sync.py` 还会将默认 `~/.claude/settings.json` 中的 `enabledPlugins` 镜像到每个配置文件的 `settings.json` 中（共享缓存文件还不够；Claude Code 将“启用”状态视为配置目录本地状态）。它会在配置文件启动时运行，并以响应式方式运行——下一项中的 LaunchAgent 会在默认配置文件的 `settings.json` 每次写入时重新运行它，因此 `claude plugin enable`/`disable --scope user` 通常会在几秒内传播到每个配置文件，无需重新启动（已于 2026-08-22 验证）。该镜像流程会**先执行接管**：某些配置文件的 `settings.json` 中仅存在于该配置文件的 `enabledPlugins` 键（这是 `claude plugin install` 写入它们的方式）会在镜像前写回默认配置文件——但仅限于值一致的情况；跨配置文件冲突会在持续警告下保留在各自配置文件中，而不会被静默覆盖（新增于 2026-09-03，此前已确认无接管的镜像是反复出现技能可见性丢失的机械根因）。上面的 SessionStart 收敛器会将同一个键作为整体设置同步的一部分进行处理；`claude-plugins-sync.py` 仍负责每个配置文件的 `known_marketplaces.json` 结构。`skill-install-audit.py` 以只读方式协调 registry / installed / enabled / Codex-manifest / `~/.agents/skills` 各层。
- 本地源同步在维护者机器上自动进行，但**源清单不是激活策略**。Claude 插件缓存目录仍由源提供；Codex 用户技能由 `~/.config/claude-switch-models-setup/codex-active-skills.json` 显式选择，并链接到官方用户根目录 `~/.agents/skills`。清单中的可选 `active_marketplaces` 字段列出受管理的市场，这些市场的*当前全部成员*都会被激活，适用于其自身章程为“激活每个已注册 Skill”的市场——声明仍位于清单中，只是粒度提升到了市场级别，而未列出的每个市场仍按技能进行精选。`~/.codex/skills/.system` 仍由 Codex 管理；修复过程不会修改它。每个选定的替换链接验证完成后，该过程只会创建或确认可选的 `legacy_codex_compat_skills` 子集，作为指向同一源的链接存在于旧版 `~/.codex/skills` 下；其他受管理的旧版链接会报告出来供审查清理，后台任务绝不会删除它们。
  - 清单有意采用快速失败策略：文件缺失、列表不是数组、名称重复、未知名称、兼容性名称不在 `active_skills` 中，或同一个 frontmatter 名称由两个不同的源 bundle 注册，都会在修改根目录之前终止。显式 JSON `null` 属于格式错误，而不是表示空的兼容性选择。这可以防止 Python 字典或目录扫描顺序静默决定最终采用的对象。
  - **daemon 所有符号链接的注意事项**（观察于 2026-07）：绝不要在现有 daemon 所有条目上手动创建符号链接。BSD `ln` 可能会将新链接放入目标目录内部，从而留下自引用的残留链接。普通激活应修改 `active_skills`；当某个长期运行的钩子或进程仍持有旧的 `~/.codex/skills/<name>` 路径时，将该已激活名称加入 `legacy_codex_compat_skills`。使用 `readlink` 而不是 `ls -la <link>` 验证链接——`ls` 会跟随链接，可能使失败的替换看起来像是成功的。
  - 已经安装在 `~/.agents/skills` 下的第三方 bundle 不属于该清单的管理范围。不要将它们加入源清单，也不要仅仅为了减少 Codex 提示负载而删除它们。若要“将 bundle 保留在磁盘上但对 Codex 隐藏”，请转到 `/daymade-skill:skill-governance`；`references/local-source-sync-architecture.md` 记录了所有权边界，而没有重复该工作流。
- 同步脚本使用跨进程共享锁。这是必需的，因为用户经常会同时从 tmux 或多个终端打开多个提供商窗口；并发启动必须串行化市场/缓存重写，同时仍需允许所有配置文件启动。
- 有关完整的本地源架构，请在修改这些脚本之前阅读 `references/local-source-sync-architecture.md`。
- 提供商路由通过 `~/.claude/settings/<name>.json` 完成，该文件为对应窗口设置 `ANTHROPIC_MODEL`、`ANTHROPIC_BASE_URL` 和 `ANTHROPIC_AUTH_TOKEN`。

## 一键设置工作流

当用户说类似“设置 Claude Code 配置文件”或“我想在不同窗口中使用 Kimi 和 DeepSeek”时：

1. **检查前置条件**
   - 已安装 `claude` CLI：`which claude`
   - Shell 是 zsh 或 bash：通过 `$SHELL` 检测
   - `python3` 可用

2. **安装配置文件管理器脚本 — 创建符号链接，不要复制**

   在已检出此仓库的机器上（维护者场景），运行捆绑的安装程序 — 它执行的操作与下面的手动步骤完全相同：

   ```bash
   <absolute-path-to-this-repo>/daymade-claude-code/claude-switch-models-setup/scripts/setup.sh
   ```

   或者手动创建链接。`REPO` **必须是绝对路径**：如果使用相对路径，下面的每条命令仍会成功并以 0 退出，但会留下断开的链接，导致 `csk` 和 LaunchAgent 出错，而且没有可供追踪的错误信息。

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

   这里明确列出部署路径，而不是使用通配符，这样阅读此文件就能知道有哪些脚本以及它们位于何处 — `scripts/*.sh` 则做不到这一点。不需要执行 `chmod`：所列出的每个脚本都已提交为可执行文件，因此再次设置权限位只会让检出内容产生模式变更，随后这些变更还会被带入其他人的提交中。

   **为什么使用符号链接而不是 `cp`：** 实际运行的是 `~/.config/…` 中的内容 — LaunchAgent 和 `claude-profile` 都通过该路径调用脚本 — 而此仓库存放的是它们的源代码。复制的文件会逐渐偏离，而且已部署的副本看起来与源文件没有任何区别，因此“我编辑的是 SSOT 吗？”并不是任何人都能可靠判断的问题。在切换之前对一台机器进行的测量显示：一个锁放置修复在仓库中停留了 26 天，而已部署的副本仍在运行它所修复的 bug；另外两个直接写入已部署副本的清理例程从未进入版本控制 — **两个方向上的偏离，而且是静默发生的。** 链接可以消除这两种偏离，*只要它一直保持为链接* — 原子保存编辑器、`rsync` 或随手执行的 `cp` 都可能在不提示的情况下将其变回普通文件，因此值得重新检查，而不是宣布问题已经解决。它还允许 `sync-local-skill-sources.py` 通过解析自身路径来定位源代码仓库，而不必退而猜测。

   怎样进行重新检查？任何定期检查方式都可以；此 skill 没有随附此类检查机制。下面这一行可以在你存放这类检查的位置运行：

   ```bash
   for f in ~/.config/claude-switch-models-setup/*.py ~/.config/claude-switch-models-setup/*.sh; do
     [ -L "$f" ] && [ -e "$f" ] || echo "not a live link: $f"
   done
   ```

如果某个文件已经变成真实文件，**请在重新建立链接前先将其移开**，因为其中可能包含其他地方不存在的编辑内容，这正是这里所描述的问题：`mv "$f" "$f.local-edits" && ln -sf <source> "$f"`，然后进行 diff。

   在**没有 repo 的机器**上，请改为从此 skill bundle 中复制安装程序列出的脚本，并接受这样的事实：在你再次复制之前，repo 中的修复不会同步到该机器。

3. **添加 shell 集成**
   - 在 `~/.zshrc` 或 `~/.bashrc` 中 source profile manager
   - 添加别名：`csk`、`csks`、`csd`、`csg`、`css`
   - 如有需要，手动添加其他按账户/套餐区分的变体别名——`claude-profiles.sh` 只定义上面列出的别名
   - 告知用户运行 `source ~/.zshrc`（或打开新的终端）

4. **生成 provider 设置文件**
   - 对于用户需要的每个 provider，创建 `~/.claude/settings/<provider>.json`
   - 使用 `assets/templates/` 中的模板作为起点
   - 向用户请求其 API key 和 base URL；**绝不要硬编码默认值**
   - 正确设置该特定 provider 的上下文窗口——使用 `[1m]` 后缀，或显式设置 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`/`CLAUDE_CODE_AUTO_COMPACT_WINDOW`，请参阅下方的“Configuring Context Window Size”。每个新 profile 都必须明确执行此操作，不要直接复制最近的模板中已有的设置——最近的模板不需要该设置，并不能证明当前 profile 也不需要。
   - 包含必需的隔离标志：
     - `CLAUDE_CODE_SUBAGENT_MODEL`（与 `ANTHROPIC_MODEL` 相同）
     - `ENABLE_TOOL_SEARCH: "false"`
     - `DISABLE_GROWTHBOOK: "1"`
     - `DISABLE_TELEMETRY: "1"`
     - `DISABLE_AUTOUPDATER: "1"`

5. **初始化 profile 目录**
   - 运行 `claude-profiles-init`
   - 这会创建包含隔离 `.claude.json` 和符号链接的 `~/.claude-profiles/<provider>/`
   - 在维护者机器上，它还会在同步 plugin metadata 之前修复本地 source symlink

   **Statusline wiring：**`claude-profiles-init` 会自动从 `~/.claude/settings.json` 或 `~/.claude/statusline.sh` 中检测 statusline 脚本，并将其注入每个新 profile。如果两者都不存在，profiles 仍然可以正常工作，但不会显示状态栏。**AI 负责**判断用户是否需要 statusline、在适当时安装 `statusline-generator` skill，并运行其安装程序，而不是由 profile setup script 负责。不要将依赖安装硬编码到 shell 脚本中。

6. **注册 settings converger**
   - 将 converger 作为 SessionStart hook 添加到**默认** profile 的 `~/.claude/settings.json` `hooks.SessionStart` 列表中，使用类似 `'/absolute/path/to/python3' '/absolute/path/to/sync-profile-settings.py'` 的绝对路径 direct-Python 命令。不要通过 shebang 或 package manager 注册 `.py` 文件：此 hook 用于修复每个 profile，不能等待共享环境/缓存锁。默认 profile 处于活动状态时它会 no-op；它的作用是在首次同步时将自身传播到每个 profile 自己的 `hooks` key 中。
   - 运行初始对齐：`python3 ~/.config/claude-switch-models-setup/sync-profile-settings.py --all`
   - 此后，每个 profile 都会在每次 session start 时，根据默认 profile 收敛其 `settings.json` 以及 `.claude.json` 中的行为部分（更改会在下一次 session 生效）。仅审计而不写入：`--check --all`

7. **验证隔离**
   - 运行 `claude-profiles-doctor`
   - 确认每个配置文件目录都包含 `.claude.json`，且符号链接有效

8. **为维护者选择并安装 Codex 用户 Skills**
   - 普通学生或不编辑 Skill 源代码仓库的用户跳过此步骤
   - 编辑 `~/.config/claude-switch-models-setup/codex-active-skills.json`；仅列出应对 Codex 全局可见的源 Skills。空列表表示明确选择不激活任何 Skill。
   - 如果仍在运行的 hook 或进程保留了旧路径，则将该已激活的 Skill 列入 `legacy_codex_compat_skills`；否则保持兼容性列表为空。
   - 运行 `sync-local-skill-sources.py --apply`。它会在创建或确认显式兼容性链接之前，创建或验证选定的 `~/.agents/skills` 链接，并报告其他由其管理的旧版链接，以便审查并由 `skill-governance` 清理。
   - 在维护者的 macOS 机器上，运行 `sync-local-skill-sources-daemon.sh --install`
   - 此程序会监视激活清单、默认 Claude 安装状态和本地 marketplace 清单，并在选择、安装/卸载或插件拓扑发生变化后修复派生状态

9. **向用户说明启动方式**
   - `csk` → Kimi K3 窗口
   - `csks` → Kimi K2.7 highspeed 窗口
   - `csd` → DeepSeek 窗口
   - `csg` → GLM 窗口
   - `css` → StepFun 窗口
   - `claude`（无别名）→ 默认 Anthropic 配置文件
   - 可选：手动添加按账户/套餐区分的变体别名，例如：
     `alias cssp='claude-profile step-pay --dangerously-skip-permissions'` —
     `claude-profiles.sh` 不会生成此别名；这是在此基础上手动采用的模式

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

这些不是日常使用的命令。普通源代码编辑会通过符号链接实时生效。这些一次性命令用于修复、引导初始化，或用于没有 LaunchAgent watcher 的非 macOS 环境。

## Provider Templates

模板位于 `assets/templates/`：

- `minimax.json` — MiniMax-M3，全局端点，1M 上下文，自适应思考或禁用思考
- `minimax-cn.json` — MiniMax-M3，中国端点，1M 上下文，自适应思考或禁用思考
- `minimax-m2-7.json` — MiniMax-M2.7，全局端点，204800-token 上下文，始终启用思考
- `minimax-m2-7-cn.json` — MiniMax-M2.7，中国端点，204800-token 上下文，始终启用思考
- `kimi.json` — Kimi K3（通过 `[1m]` 标记实现 1M 上下文，参见下方“Configuring Context Window Size”）
- `kimi-highspeed.json` — Kimi K2.7 highspeed（旧版 200K 上下文）
- `glm.json`
- `deepseek.json`
- `stepfun.json`
- `anthropic.json`

每个模板都使用 `<API_KEY>` 占位符。可配置网关的模板还使用 `<BASE_URL>`；MiniMax 模板则固定使用文档中规定的区域端点。向用户询问每一个真实的占位符值；不要猜测，也不要复用当前机器上的值，除非用户明确提供了这些值。

### MiniMax model behavior

| Templates | Model | Context configuration | Thinking behavior |
|---|---|---|---|
| `minimax.json`、`minimax-cn.json` | `MiniMax-M3` | 为每个路由的模型值追加 `[1m]`，并将 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 设置为 `1000000`。 | 支持自适应思考或禁用思考。保持 `ANTHROPIC_REASONING_MODEL` 使用同一个模型。 |
| `minimax-m2-7.json`、`minimax-m2-7-cn.json` | `MiniMax-M2.7` | 将 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 和 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 设置为 `204800`；不要追加 `[1m]`。 | 思考始终启用；不要声称模板层面提供禁用路径。 |

## Configuring Context Window Size

每个 Provider 模板都通过以下两种方式之一设置模型的上下文窗口大小。这里配置错误会导致 Claude Code 无法知道模型实际能够容纳多少上下文。设置过小会导致它比 Provider 的实际要求更早进行压缩（总结内容、丢弃旧细节）；设置过大则会导致它在真实限制已经被超出后仍未进行压缩。

`[1m]` 标记的完整客户端机制，包括它如何从模型字段中移除该标记、如何将其添加到 `anthropic-beta` header，以及为什么缺少 `[1m]` *并不意味着 Provider 无法容纳较大的 prompt*，都记录在 `references/context-window-config.md` 中。当上下文数值看起来不正确时，请查阅该文档，而不是在编写模板时查阅。

### Decision rule

编写新 Provider 的 `settings/<name>.json` 时，应根据该 Provider 真实且经过验证的上下文窗口进行选择，而不是根据模型的营销名称，也不要照搬最接近的模板所采用的方式：

| Provider's real context window | What to set | Example template |
|---|---|---|
| 约 1M tokens，已明确确认（不能仅根据模型的级别或名称假定） | 在每个 `ANTHROPIC_MODEL` / `ANTHROPIC_DEFAULT_*_MODEL` / `CLAUDE_CODE_SUBAGENT_MODEL` 值上追加 `[1m]` 后缀。必须是准确的 4 个字符 `[1m]`，Claude Code 匹配的是这个字面字符串，而不是类似 `[1million]` 或 `[max]` 的自定义标记。 | `kimi.json` |
| 已知的较小值（例如 200K） | 明确将 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 和/或 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 设置为真实数值，不要使用 `[1m]`。 | `kimi-highspeed.json`（`200000`） |
| 未知 / 尚未验证 | 不要猜测，也不要仅仅因为模板需要填入某个值，就照搬其他 Provider 的数值。先让用户查看该 Provider 自己的文档或控制台进行确认。未经验证的 `[1m]` 或未经验证的大型 `CLAUDE_CODE_AUTO_COMPACT_WINDOW`，只会让失败模式从“过早压缩”变成“直到远远超过真实限制后才压缩”，后者更糟糕，因为在实际请求失败之前它都是静默的。 |

`deepseek.json` 和 `glm.json` 同时设置了 **[1m]** 和显式的 `CLAUDE_CODE_AUTO_COMPACT_WINDOW: "1000000"`。这是双重保险，并不是应当删掉的冗余内容——标记和显式覆盖值之间的确切优先级尚未经过独立逆向分析，因此如果你复制这两个模板中的任意一个，请保留两者，不要删掉其中一个。

MiniMax-M3 模板使用相同的 1M 标记，以及显式的 `1000000` 自动压缩值。MiniMax-M2.7 模板使用显式的 `204800` 限制，不带标记。

完整的 step-2-16k 模板正确性经验总结（为什么一个内部看起来自洽的上下文值，并不等于当前正确的值——请将模型名称与提供商的实时文档进行交叉核对，而不只是检查它周围的数字），以及一套可复用的方案，用于验证某个环境变量是否确实改变了通过网络发送的字节内容（使用本地 `http.server` 捕获，因为 `--debug api` 只显示内部状态），位于 `references/context-window-config.md`。

### 常见基础 URL（请向提供商确认）

| 提供商 | 典型基础 URL |
|----------|------------------|
| Kimi     | `https://api.moonshot.cn` 或兼容 OpenRouter 的端点 |
| GLM      | `https://open.bigmodel.cn/api/paas/v4` 或兼容 OpenRouter 的端点 |
| DeepSeek | `https://api.deepseek.com` 或兼容 OpenRouter 的端点 |
| StepFun  | `https://api.stepfun.com` 或兼容 OpenRouter 的端点 |
| MiniMax  | 全球：`https://api.minimax.io/anthropic`；中国：`https://api.minimaxi.com/anthropic` |
| Anthropic| `https://api.anthropic.com` |

**重要：** 具体端点取决于用户是直接调用提供商，还是通过兼容网关（例如 OpenRouter）调用。请务必询问清楚。

## 共享与隔离

| 数据 | 位置 | 是否共享？ |
|------|----------|---------|
| 会话历史 | `~/.claude-profiles/<name>/.claude.json` | **按配置文件隔离** |
| 身份验证令牌/缓存 | `~/.claude-profiles/<name>/.claude.json` | **按配置文件隔离** |
| Skills | `~/.claude/skills/` | 通过符号链接共享 |
| 插件内容 | `~/.claude/plugins/marketplaces`、`cache`、`data` 等 | 通过符号链接共享 |
| 插件安装注册表 | `~/.claude/plugins/installed_plugins.json` | 通过符号链接共享 |
| 已启用插件映射 | `~/.claude/settings.json` -> `<profile>/settings.json` | 由 `sync-profile-settings.py` 统一（也由 `claude-plugins-sync.py` 镜像同步） |
| 插件市场索引 | `<profile>/plugins/known_marketplaces.json` | **按配置文件分别存储**（`installLocation` 与配置目录相关，无法共享） |
| 项目/记忆 | `~/.claude/projects/`、`~/.claude/memory/` | 通过符号链接共享 |
| Hook 脚本 | `~/.claude/hooks/`、`~/.claude/commands/` | 通过符号链接共享（仅脚本——**不包括注册信息**） |
| `settings.json` 配置：Hook 注册、市场、环境标志、权限、偏好设置 | `<profile>/settings.json` | 在会话启动时由 `sync-profile-settings.py` **从默认配置文件统一**（身份键，如 `model`，以及提供商路由/隔离环境变量永不进行同步） |
| `.claude.json` 行为键（`workflowSizeGuideline`、通知/UI 偏好设置） | `~/.claude.json` → `<profile>/.claude.json` | 由同一脚本统一**行为白名单**；状态/缓存/计数器/迁移/凭据键（包括 `projects`、`oauthAccount`、`userID`）永不进行同步；漂移的未知键会报告给人工分类 |
| 提供商设置 | `~/.claude/settings/<name>.json` | 共享源文件，按配置文件分别加载 |

## 故障排除

### 配置目录存在，但 claude-profiles-doctor 将其报告为“孤立配置”

症状：`claude-profiles-doctor` 报告
`WARN: orphan profile — no settings/<name>.json; claude-profile <name> fails. Run: claude-profile-rm <name>`。

原因：配置隔离目录存在于 `~/.claude-profiles/` 下，但对应的 `~/.claude/settings/<name>.json` 提供商配置文件缺失。`claude-profiles-init` 仅扫描 `settings/*.json`，因此不会为孤立配置创建或维护其符号链接，且 `claude-profile <name>`
将无法启动，并显示“Error: Settings file not found.”。该配置目录中可能仍包含有用的按配置隔离的数据（`history.jsonl`、包含提供商凭据的 `.claude.json`、`settings.json`、技能工作区）。

修复：
- **如果不再需要该配置**：`claude-profile-rm <name>` — 这会安全地移除隔离目录（会先检查是否存在意外文件）。
- **如果想要恢复它**：在
  `~/.claude/settings/<name>.json` 重新创建设置文件（使用 `assets/templates/` 中的提供商模板），然后运行 `claude-profiles-init`。

### 共享目录（skills/projects/hooks/agents/...）显示为真实目录，而非符号链接

症状：`claude-profiles-doctor` 报告
`<name> is a real directory (expected symlink to ~/.claude/<name>) — drift; run: claude-profiles-init --repair`。

原因：该配置创建于符号链接收敛设计落地之前（或是手动创建的），因此共享内容目录最终成为真实的按配置隔离目录，而非符号链接。该配置的副本现在会与主 `~/.claude/` 副本悄然发生偏离 — 它的 skills/projects/hooks/agents 与其他所有配置的不再相同。损坏的符号链接检查无法发现这一问题（真实目录不是损坏链接）；在真实机器上，这种偏离在专门的真实目录检查加入前数月未被发现（2026-07-21：在此检查存在之前创建的旧版配置携带真实的 `projects/` 目录数月而未被发现）。

修复（可逆 — 数据会被归档，绝不删除）：

```bash
claude-profiles-init --repair
```

对于每个发生偏离的目录，此操作会将真实目录归档至配置目录内的
`<name>.pre-symlink-bak-<timestamp>`，然后创建原本应存在的符号链接。再次运行 `claude-profiles-doctor`，以确认状态正常。如果某个归档最终包含你需要的数据，它就在那里 — 没有任何内容被销毁。

关于共享内容的说明：修复后，该目录指向主
`~/.claude/<name>` 副本，因此该配置会看到与默认配置相同的 skills/projects/etc. — 这正是共享符号链接设计的全部目的。必须保持隔离的按配置状态（`.claude.json`、如 `model`/提供商环境变量等 `settings.json`
身份键、`plugins/known_marketplaces.json`）绝不会是这些符号链接目录之一，因此修复绝不会触及它。丢弃归档前请检查其中内容，尤其是在该配置中存有你关心的会话/历史数据时 —
它们现在会解析为共享副本。

### Marketplace 提示“corrupted installLocation”

症状：`/plugin` 或 `claude plugin marketplace update` 报告
`corrupted installLocation ... expected a path inside <config-dir>/plugins/marketplaces`。

原因：`known_marketplaces.json` 最终在多个配置文件之间共享（或被手动编辑）。其
`installLocation` 是特定于配置目录的，因为 Claude 使用 `path.resolve()` 进行验证
（不会解析符号链接），因此一份共享副本无法满足多个配置文件。

修复：`claude-plugins-sync.py` 会重建每个配置文件各自的副本以及共享内容的
符号链接。它会在 `claude-profile` 初始化/启动时自动运行；如需手动运行：

```bash
python3 ~/.config/claude-switch-models-setup/claude-plugins-sync.py
```

### 默认 Claude 中存在 Skill，但 Kimi/GLM/DeepSeek 中缺失

症状：默认 Anthropic 配置文件可以看到某个 Skill，但第三方配置文件无法看到。

原因：Claude Code 将 `enabledPlugins` 存储在每个配置目录的 `settings.json` 中。
共享 `plugins/cache` 只会让文件可用；不会启用它们。

修复：

```bash
python3 ~/.config/claude-switch-models-setup/claude-plugins-sync.py
```

然后重启受影响的 Claude Code 窗口。

### 本地源代码编辑未在 Claude Code 或 Codex 中显示

症状：你在本地源代码仓库中编辑了一个 Skill，但 Claude Code 或 Codex 仍加载旧的已安装副本。

预期设计：由于其运行时位置是符号链接，对已安装 Claude 插件或明确选中的 Codex 用户 Skill 进行的常规编辑会立即生效。未出现在 `codex-active-skills.json` 中的源 Skill 被有意作为冷库存，而非同步漂移。现有 Claude Code/Codex 会话仍可能需要重启，因为 Skill 元数据会在会话启动时加载。

如果编辑属于结构性变更（新插件、新 Skill 条目、版本升级、安装/卸载或 marketplace 清单变更），macOS LaunchAgent 应会自动运行。检查：

```bash
launchctl print gui/$(id -u)/ai.daymade.claude-skill-source-sync
```

仅当监视器未安装或你使用非 macOS 机器时，才手动修复：

```bash
python3 ~/.config/claude-switch-models-setup/sync-local-skill-sources.py --apply
```

这会先验证显式激活清单和完整的源名称集合。每个已注册的 Skill 都会将其 marketplace 仓库包含关系和加载时 inode 传入冻结步骤，后者会在为整个过程绑定一个源路径和 inode 前重新检查两者。它会在可变阶段之前捕获两个用户根目录的现有身份，然后使用禁止跟随符号链接的目录句柄打开每个剩余组件，并拒绝在固定前消失、出现或 inode 已变更的根目录。它会将选定条目链接到 `~/.agents/skills`，验证每个选定目标，并且仅在此后于 `~/.codex/skills` 下创建或确认 `legacy_codex_compat_skills`；最终的跨根检查会在源的前后身份检查之间读取这两个链接。只有在选定策略需要时，才会专门创建缺失的根目录。在选定的 `.agents` 目标位置，接受空路径或正确链接；指向受管源仓库的错误链接会移至带时间戳的恢复存储，而真实对象、相对/损坏链接或第三方链接会明显失败并保留在原处。过期的未选定受管链接会移至同一恢复存储；格式错误的外来链接将因不属于受管范围而跳过。移动本身是排他的：如果已分类条目先发生变化，并发获胜者会恢复到原始名称，且选定替换会失败（未选定清理将跳过它）；如果较新的获胜者已占据该名称，则两者都不会被覆盖，运行会失败，同时较早的获胜者保留在恢复存储中。在请求的旧版兼容路径处，只接受已正确指向相同源的链接或空路径；所有其他现有对象都会明显失败，且绝不会被替换。创建操作会通过原子性的禁止覆盖硬链接发布一个已知的私有符号链接 inode，因此在发布之前、期间或之后的任何竞争路径都会以关闭失败方式处理，即使它指向预期源也是如此。其他由源支持的旧版链接会被记录，以便通过 `skill-governance` 进行明确且经过审核的清理；LaunchAgent 永远不会解除链接它们。

它还会清理自身，而早期版本不会：

- **版本别名符号链接。** 每个缓存链接都以 marketplace 的当前版本命名，因此每次版本升级都会留下旧链接，并指向完全相同的源目录。某个插件有六个版本目录，其中四个是同一源目录的别名。现在的处理会移除那些解析到相同源目录的同级链接；真实目录永远不会被触碰，因为这些目录由 Claude Code 安装，活动会话可能仍通过 `.in_use` 持有它们。
- **`installed_plugins.json` 备份。** 每次运行修改 JSON 时都会写入一个备份，而之前没有任何机制移除它们，一个月的运行就留下了 453 个文件。脚本中的 `KEEP_JSON_BACKUPS` 常量会限制保留的备份集合；文件名以 `YYYYMMDD-HHMMSS` 时间戳结尾，因此按字典序排列时也是按时间顺序排列。

在 `--apply` 实际执行任何操作之前，这两类清理都会显示在 dry run 中。

### 配置文件缺少 hooks、marketplaces、环境标志或其他默认配置文件设置

现象：默认配置文件配置了 hook guards、marketplaces 或功能标志，但第三方配置文件的行为仿佛这些设置不存在（没有触发任何 PreToolUse guards，`claude plugin marketplace list` 为空，默认配置文件中启用的功能处于关闭状态）。

**同级现象，不同层（2026-08-17）：** 默认配置文件设置的行为偏好，例如工作流规模指南，在第三方配置文件中没有生效（尽管 main 上设置了 `small`，Kimi 会话仍将 Dynamic Workflow 分发给了 30 多个 agents）。该键位于每个配置文件的 `.claude.json` 中，而符号链接和 settings.json 同步都无法覆盖这一层。请参阅 `references/troubleshooting.md` 中的“Default-profile behavior settings don't reach third-party profiles”。

原因：这些设置位于每个配置文件自己的 `settings.json` 中，而该文件是配置目录本地的，符号链接目录无法覆盖配置层；默认配置文件发生变化后，这些设置也会悄然漂移。

修复：

```bash
python3 ~/.config/claude-switch-models-setup/sync-profile-settings.py --all
```

然后重启受影响的窗口。将 converger 注册为 SessionStart hook（设置步骤 6）后，每个配置文件都会在会话开始时自行收敛，因此只有在手动编辑 settings 并希望立即传播更改时才需要执行此操作。

### 第三方配置文件尝试使用 Anthropic 专属功能

现象：WebSearch 或其他 Anthropic 原生工具失败并返回 400 错误。  
修复：确保该配置文件的 `settings.json` 设置为：

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

现象：Kimi 窗口中的子代理调用 `claude-opus-4-7`。  
修复：在该配置文件的 `settings.json` 中，将 `CLAUDE_CODE_SUBAGENT_MODEL` 设置为与 `ANTHROPIC_MODEL` 相同的值。

### 超大上下文提供商过早压缩/总结，或状态栏中的上下文数字看起来不正确

现象：某个提供商自身的文档声称其上下文容量约为 1M tokens，但 Claude Code 在远低于该容量时就自动压缩上下文，长会话在显然还没有实际需要时就被总结；或者状态栏中的上下文百分比表现得像是在以约 200K 的模型而非实际上限为依据。

原因：配置文件中的 `ANTHROPIC_MODEL`（以及同类的 `ANTHROPIC_DEFAULT_*_MODEL` / `CLAUDE_CODE_SUBAGENT_MODEL`）缺少 `[1m]` 标记。Claude Code 没有其他方式得知提供商的实际上下文大小——请求本身能够成功处理超大提示词，并不能让 Claude Code 获知任何信息，因为这是上游提供商的属性，而不是客户端的属性。完整机制请参阅 `references/context-window-config.md`。

修复：在配置文件的 `settings.json` 中，为 `ANTHROPIC_MODEL`、每个 `ANTHROPIC_DEFAULT_*_MODEL` 以及 `CLAUDE_CODE_SUBAGENT_MODEL` 添加字面量 `[1m]` 后缀（参照 `kimi.json` 的模式）。重启受影响的窗口。

## 之后添加新提供商

1. 使用模板创建 `~/.claude/settings/<new-provider>.json`。
2. 检查提供商真实且经过验证的上下文窗口，并进行配置——使用 `[1m]` 标记，或显式设置 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`/`CLAUDE_CODE_AUTO_COMPACT_WINDOW`。请参阅下方的“配置上下文窗口大小”和 `references/context-window-config.md`。不要因为所复制的模板恰好不需要配置，就跳过此步骤。
3. 运行 `claude-profiles-init`。
4. 如果需要，将别名添加到 shell rc 文件中。

## 安全说明

- API 密钥会以明文形式写入 `~/.claude/settings/<provider>.json`，与 Claude Code 存储 `ANTHROPIC_AUTH_TOKEN` 的方式相同。这符合 Claude Code 自身的安全模型。
- 此技能绝不会将密钥或设置上传到任何地方。
- 对于公开分发，随附的脚本不包含硬编码的机密信息、端点或特定用户路径。

## 下一步

设置完成后，用户可以立即通过打开两个终端进行测试：在一个终端中运行 `csk`（Kimi K3），在另一个终端中运行 `csd`。每个窗口彼此独立。

当接受设置的人员是 workshop 参加者、需要在自己的机器上完成设置，而不是由你代为操作时，请将 `references/student-setup-guide.md` 交给他们，而不要带他们逐步阅读此文件——该指南从头到尾都是为他们编写的，其中不包含他们暂时不需要的维护和故障排查内容。