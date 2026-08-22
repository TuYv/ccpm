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
# Claude Code 多提供商配置档案

## 概述

此技能为 Claude Code CLI 创建一个彼此隔离但共享资源的配置档案系统。每个配置档案都有自己的 `.claude.json` 状态文件（凭据和会话历史记录），同时在所有配置档案之间共享技能、项目、钩子脚本、代理以及已安装插件的状态；此外，还会以默认配置档案为基准，收敛每个配置档案的 `settings.json`（钩子注册、市场、环境变量功能标志、权限、偏好设置）以及其 `.claude.json` 中的**行为设置部分**（例如 `workflowSizeGuideline`），从而确保各配置档案之间唯一的预期差异是模型/提供商。

最终效果是：你可以在一个终端中使用 Kimi，在另一个终端中使用 DeepSeek，再在另一个终端中使用 Anthropic——每个终端都作为完全独立的 Claude Code 进程运行，且不会发生配置串扰。

## 工作原理

- `CLAUDE_CONFIG_DIR` 告诉 Claude Code CLI 应将哪个目录用作其配置根目录。
- 每个配置档案都位于 `~/.claude-profiles/<name>/` 中，并拥有一个隔离的 `.claude.json`。
- 内容目录（`skills/`、`projects/`、`hooks/`、`agents/`、`settings/`）通过符号链接指回主 `~/.claude/` 目录，因此你只需维护一份副本。请注意，这里共享的是钩子**脚本**，而不是钩子**注册信息**——注册信息位于每个配置档案自己的 `settings.json` 中（见下一项）。
- **配置层——`settings.json`：**每个配置档案都有自己的 `settings.json`（Claude Code 将其视为配置目录本地文件），因此其中存储的所有内容——钩子注册信息、`extraKnownMarketplaces`、`enabledPlugins`、`env` 功能标志、`permissions`、行为偏好——一旦默认配置档案中的相应内容发生变化，就会悄然产生偏差（2026-07-18 实测：9/9 个真实配置档案均没有任何钩子注册信息）。`sync-profile-settings.py` 是负责收敛的脚本：它被注册为 SessionStart 钩子，会把默认配置档案 `settings.json` 中的每个键复制到当前活动配置档案中，但身份标识键除外（顶层的 `model` 和 `advisorModel`——后者用于路由 Anthropic 模型，而第三方端点无法提供该模型；以及负责提供商路由或 Anthropic 原生隔离的环境变量——`ANTHROPIC_*`、`CLAUDE_CODE_SUBAGENT_MODEL`、`ENABLE_TOOL_SEARCH`、`DISABLE_GROWTHBOOK/TELEMETRY/AUTOUPDATER`——提供商设置文件会有意为这些变量设置不同的值）。仅存在于配置档案中的**顶层**键会被保留；如果某个嵌套集合所属的键在主配置档案中也存在（例如 `permissions.allow`、`enabledPlugins`），该集合将整体收敛到主配置档案中的值，因此被移除的任何配置档案专属嵌套条目都会被列出（写入时显示数量，使用 `--check` 时显示详情），从而让这种丢失变得可见，而不是悄然发生。正是这一机制真正保证了“除模型外，所有内容都能在每个配置档案中正常工作”。
- **状态层——`.claude.json` 行为键：**`settings.json` 并不是唯一的配置档案专属配置文件。Claude Code 还会为每个配置档案维护一个状态文件（主配置档案的是 `~/.claude.json`；每个第三方配置档案的是 `<profile>/.claude.json`——二者路径并不对称，已在磁盘上验证），并且少数**行为**设置只存在于此文件中（`workflowSizeGuideline`、通知/UI 偏好设置）。截至 2026-08-17，`workflowSizeGuideline: small` 仅存在于主配置档案中，11 个第三方配置档案中有 10 个没有该设置的副本——一个 Kimi 会话在其系统提示中没有任何规模指导的情况下，将一个动态工作流分派给了 30 多个代理。因此，同一个收敛脚本还会把一份**行为键允许列表**同步到每个配置档案的 `.claude.json` 中。其安全机制是脚本内的三向分类器，而不是人工维护的键列表：允许列表中的行为键会被同步；通过名称模式匹配到的状态/缓存/计数器/迁移/凭据键绝不会被触碰；任何未知且存在差异的键都会被**报告——每次运行时，每个存在偏差的键各输出一行，直到人工完成分类**（这是一条绊线，可在下一个行为键出现当天就将其暴露出来）。写入采用备份加原子替换；实测可安全应对实时测试工具对文件的重写（一个标记键在活动会话持续 30 多分钟后仍然保留）。更改会在下次会话生效——测试工具会在启动时读取此文件。
- **例外——`plugins/`：**市场内容和安装状态是共享的，但每个配置档案都会保留其**自己的** `known_marketplaces.json`。Claude 使用 `path.resolve()` 验证市场的 `installLocation`（该函数**不会**解析符号链接），因此如果共享同一个文件，所有未执行写入操作的配置档案都会报告“`installLocation` 已损坏”。`claude-plugins-sync.py` 会构建并维护这种按配置档案区分的结构。
- `claude-plugins-sync.py` 还会将默认 `~/.claude/settings.json` 中的 `enabledPlugins` 镜像到每个配置档案的 `settings.json` 中（仅共享缓存文件是不够的；Claude Code 将“已启用”状态视为配置目录本地状态）。它会在配置档案启动时以及响应式地运行——下一项所述的 LaunchAgent 会在默认配置档案的 `settings.json` 每次被写入时重新运行该脚本，因此 `claude plugin enable`/`disable --scope user` 通常会在几秒内传播到所有配置档案，而无需重新启动（已于 2026-08-22 验证）。上述 SessionStart 收敛器会在完整设置同步过程中覆盖同一个键；`claude-plugins-sync.py` 仍然负责管理各配置档案的 `known_marketplaces.json` 结构。
- 在维护者的计算机上，本地源同步会自动执行。已安装的 Claude 插件缓存目录以及 Codex/agents 技能副本都通过符号链接指向源代码仓库，因此常规的源代码编辑会立即生效。`sync-local-skill-sources.py` 是幂等的修复原语；`claude-profile` 初始化/启动时会自动运行它，而 `sync-local-skill-sources-daemon.sh --install` 会安装一个 macOS LaunchAgent，用于监视默认 Claude 安装状态以及本地市场清单中的结构性变化。当某项技能从市场清单中移除时，同一个修复过程只会清理那些指回受管理源代码仓库的过期 Codex/agents 符号链接、插件缓存中已被取代的版本别名符号链接，以及 `installed_plugins.json` 备份中除最新 `KEEP_JSON_BACKUPS` 份以外的所有副本；它绝不会删除真实的技能目录。
  - **由守护进程管理的符号链接相关陷阱**（两者均于 2026-07 观察到）：① 切勿在由守护进程管理的目录中手动创建符号链接（`ln -s <repo>/<skill> ~/.codex/skills/<skill>`）——如果守护进程已经创建了该链接，BSD `ln` 会把新链接放到目标目录*内部*，留下一个自引用的 `<skill>/<skill>` 残留项，目录遍历可能因此陷入递归；如需手动修复，只能使用 `ln -sfn`，或者先通过 `readlink` 确认链接确实不存在。② 应使用 `readlink` 而不是 `ls -la <link>` 验证符号链接——ls 会跟随链接并列出目标的*内容*，即使实际结果是在目标内部产生了一个残留链接，看起来也会像是“链接已创建”。
- 同步脚本使用共享的跨进程锁。这是必要的，因为用户经常会从 tmux 或多个终端同时打开多个提供商窗口；并发启动必须串行执行市场/缓存重写，同时仍允许所有配置档案启动。
- 在更改这些脚本之前，请先阅读 `references/local-source-sync-architecture.md`，了解完整的本地源架构。
- 提供商路由通过 `~/.claude/settings/<name>.json` 完成，该文件会为对应窗口设置 `ANTHROPIC_MODEL`、`ANTHROPIC_BASE_URL` 和 `ANTHROPIC_AUTH_TOKEN`。

## 一键设置工作流

当用户说类似“设置 Claude Code 配置文件”或“我想在不同窗口中使用 Kimi 和 DeepSeek”时：

1. **检查前置条件**
   - 已安装 `claude` CLI：`which claude`
   - Shell 是 zsh 或 bash：通过 `$SHELL` 检测
   - `python3` 可用

2. **安装配置文件管理器脚本——使用符号链接，不要复制**

   在已检出此仓库的机器上（维护者场景），运行随附的安装程序——它所执行的操作与下方的手动方式完全相同：

   ```bash
   <absolute-path-to-this-repo>/daymade-claude-code/claude-switch-models-setup/scripts/setup.sh
   ```

   或者手动创建链接。`REPO` **必须是绝对路径**：如果使用相对路径，下面的每条命令仍会成功执行并以状态码 0 退出，但会留下五个悬空链接，导致 `csk` 和 LaunchAgent 失效，而且没有错误可供追查。

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
   ```

   这里明确列出了五个路径，而不是使用 glob，这样阅读此文件时就能知道存在哪些脚本以及它们位于何处——`scripts/*.sh` 无法做到这一点。无需执行 `chmod`：这五个文件提交时都已具备可执行权限，因此再次设置该权限只会因文件模式变更而弄脏检出目录，随后这些变更还可能被带入其他人的提交。

   **为什么使用符号链接而不是 `cp`：** `~/.config/…` 才是实际运行的位置——LaunchAgent 和 `claude-profile` 都通过该路径调用脚本——而此仓库保存着它们的源代码。副本会逐渐偏离源文件，而且已部署的副本在外观上与其源文件没有区别，因此没人能够始终可靠地判断“我编辑的是不是 SSOT？”。在一台机器上切换到符号链接之前进行的测量显示：一个锁放置修复已在仓库中存在了 26 天，而已部署的副本仍在运行它所修复的缺陷；另外，两个直接写入已部署副本的清理例程则从未进入版本控制——**两个方向都在悄无声息地发生偏离。** 符号链接可以消除这两种问题，*前提是它始终保持为符号链接*——采用原子保存方式的编辑器、一次 `rsync` 或一次误用的 `cp` 都可能在没有任何提示的情况下将其重新变成普通文件，因此值得再次检查，而不能认为问题已经一劳永逸地解决。它还使 `sync-local-skill-sources.py` 能够通过解析自身路径来定位其源仓库，而不必退回到猜测位置。

   该如何再次检查？任何定期检查方式都可以；此技能未随附此类检查。只需一行，在你通常存放此类任务的任何位置运行：

   ```bash
   for f in ~/.config/claude-switch-models-setup/*.py ~/.config/claude-switch-models-setup/*.sh; do
     [ -L "$f" ] && [ -e "$f" ] || echo "not a live link: $f"
   done
   ```

如果其中某个已经变成了真实文件，**请在重新建立链接前将其移到一旁**——它可能包含其他任何地方都不存在的编辑内容，而这正是此处所描述的问题：`mv "$f" "$f.local-edits" && ln -sf <source> "$f"`，然后执行 diff。

   在**没有**该仓库的机器上，改为从此 Skill 包中复制这五个脚本——并接受这样一个事实：在你再次复制之前，仓库中的修复不会同步到该机器。

3. **添加 shell 集成**
   - 在 `~/.zshrc` 或 `~/.bashrc` 中加载配置文件管理器
   - 添加别名：`csk`、`csks`、`csd`、`csg`、`css`
   - 如有需要，手动添加其他按账户或套餐区分的变体别名——`claude-profiles.sh` 仅定义了上述五个别名
   - 告知用户运行 `source ~/.zshrc`（或打开一个新终端）

4. **生成提供商设置文件**
   - 对于用户需要的每个提供商，创建 `~/.claude/settings/<provider>.json`
   - 以 `assets/templates/` 中的模板为起点
   - 提示用户输入其 API 密钥和基础 URL；**绝不要硬编码默认值**
   - 为此特定提供商正确设置上下文窗口——使用 `[1m]` 后缀还是显式设置 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`/`CLAUDE_CODE_AUTO_COMPACT_WINDOW`，请参阅下文的“配置上下文窗口大小”。应为每个新配置显式执行此操作，而不是直接复制最接近的模板中已有的设置——最接近的模板不需要此设置，并不能证明当前配置也不需要。
   - 包含必需的隔离标志：
     - `CLAUDE_CODE_SUBAGENT_MODEL`（与 `ANTHROPIC_MODEL` 相同）
     - `ENABLE_TOOL_SEARCH: "false"`
     - `DISABLE_GROWTHBOOK: "1"`
     - `DISABLE_TELEMETRY: "1"`
     - `DISABLE_AUTOUPDATER: "1"`

5. **初始化配置目录**
   - 运行 `claude-profiles-init`
   - 这会创建包含独立 `.claude.json` 和符号链接的 `~/.claude-profiles/<provider>/`
   - 在维护者的机器上，这还会在同步插件元数据之前修复本地源符号链接

   **状态栏接入：** `claude-profiles-init` 会从
   `~/.claude/settings.json` 或 `~/.claude/statusline.sh` 自动检测状态栏脚本，并将其注入每个新
   配置。如果两者均不存在，配置仍可正常工作，但不会显示状态栏。**AI 有责任**
   判断用户是否需要状态栏，并在适当时安装
   `statusline-generator` Skill 并运行其安装程序——这不是配置
   设置脚本的职责。不要在 shell 脚本中硬编码依赖项安装。

6. **注册设置收敛器**
   - 将 `~/.config/claude-switch-models-setup/sync-profile-settings.py` 作为 SessionStart 钩子添加到**默认**配置的 `~/.claude/settings.json` 的 `hooks.SessionStart` 列表中（当活动配置就是默认配置时，它不会执行任何操作；它在该处的作用是在首次同步时将自身传播到每个配置各自的 `hooks` 键中）
   - 运行初始对齐：`python3 ~/.config/claude-switch-models-setup/sync-profile-settings.py --all`
   - 此后，每个配置都会在每次会话开始时，从默认配置收敛其 `settings.json` 以及 `.claude.json` 中的行为部分（更改将在下一次会话生效）。仅审计而不写入：`--check --all`

7. **验证隔离**
   - 运行 `claude-profiles-doctor`
   - 确认每个配置目录中都有 `.claude.json` 和有效的符号链接

8. **为维护者安装自动本地源同步**
   - 普通学生或不编辑技能源代码仓库的用户请跳过此步骤
   - 在维护者的 macOS 机器上，运行 `sync-local-skill-sources-daemon.sh --install`
   - 此命令会监视 Claude 的默认安装状态以及本地市场清单，并在安装/卸载或插件拓扑发生变化后，自动修复 Claude/Codex 的已安装副本

9. **向用户说明如何启动**
   - `csk` → Kimi K3 窗口
   - `csks` → Kimi K2.7 高速窗口
   - `csd` → DeepSeek 窗口
   - `csg` → GLM 窗口
   - `css` → StepFun 窗口
   - `claude`（无别名）→ 默认 Anthropic 配置
   - 可选：自行手动添加按账户/套餐区分的变体别名，例如
     `alias cssp='claude-profile step-pay --dangerously-skip-permissions'` —
     `claude-profiles.sh` 不会生成此别名；这是在其基础上手动添加的模式

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
                               # Maintainers: one-shot repair for Claude/Codex source symlinks
~/.config/claude-switch-models-setup/sync-local-skill-sources-daemon.sh --install
                               # Maintainers: install automatic macOS watcher
```

这些并非日常使用的命令。通过符号链接，对源代码的常规编辑会实时生效。一次性命令用于修复、引导初始化，或用于没有 LaunchAgent 监视器的非 macOS 环境。

## 提供商模板

模板位于 `assets/templates/`：

- `minimax.json` — MiniMax-M3，全球端点，1M 上下文，自适应思考或禁用思考
- `minimax-cn.json` — MiniMax-M3，中国端点，1M 上下文，自适应思考或禁用思考
- `minimax-m2-7.json` — MiniMax-M2.7，全球端点，204800-token 上下文，始终启用思考
- `minimax-m2-7-cn.json` — MiniMax-M2.7，中国端点，204800-token 上下文，始终启用思考
- `kimi.json` — Kimi K3（通过 `[1m]` 标记启用 1M 上下文——参见下文“配置上下文窗口大小”）
- `kimi-highspeed.json` — Kimi K2.7 高速版（旧版 200K 上下文）
- `glm.json`
- `deepseek.json`
- `stepfun.json`
- `anthropic.json`

每个模板都使用 `<API_KEY>` 占位符。用于可配置网关的模板还使用 `<BASE_URL>`；MiniMax 模板则固定使用文档中指定的区域端点。向用户询问每个占位符对应的真实值；除非用户明确提供，否则不要猜测，也不要复用当前机器上的值。

### MiniMax 模型行为

| 模板 | 模型 | 上下文配置 | 思考行为 |
|---|---|---|---|
| `minimax.json`, `minimax-cn.json` | `MiniMax-M3` | 在每个路由模型值后追加 `[1m]`，并将 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 设置为 `1000000`。 | 支持自适应思考或禁用思考。确保 `ANTHROPIC_REASONING_MODEL` 使用相同的模型。 |
| `minimax-m2-7.json`, `minimax-m2-7-cn.json` | `MiniMax-M2.7` | 将 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 和 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 设置为 `204800`；不要追加 `[1m]`。 | 思考始终开启；不要声称可以在模板级别禁用。 |

## 配置上下文窗口大小

每个提供商模板都通过两种方式之一设置模型的上下文窗口——如果此处配置错误，Claude Code 就无法知道模型实际能够容纳多少上下文。设置得过小，它会远早于提供商实际要求的时机进行压缩（总结并丢弃旧的细节）；设置得过大，它就不会进行压缩，直到已经超过真正的限制。

`[1m]` 标记在客户端侧的完整机制——它会从模型字段中移除什么、会向 `anthropic-beta` 标头添加什么，以及为什么缺少 `[1m]` 并*不*意味着提供商无法容纳较大的提示词——记录在 `references/context-window-config.md` 中。当上下文数值看起来有误时再查阅它，而不是在编写模板时使用。

### 决策规则

编写新提供商的 `settings/<name>.json` 时，应根据提供商真实且经过验证的上下文窗口进行选择——不要根据模型的营销名称，也不要直接照搬碰巧最相近的模板：

| 提供商的真实上下文窗口 | 应设置的内容 | 示例模板 |
|---|---|---|
| 约 1M 个 token，且已明确确认（而非根据模型的层级/名称推测） | 在每个 `ANTHROPIC_MODEL` / `ANTHROPIC_DEFAULT_*_MODEL` / `CLAUDE_CODE_SUBAGENT_MODEL` 值后添加 `[1m]` 后缀。必须是完全一致的 4 个字符 `[1m]`——Claude Code 匹配的是这个字面字符串，而不是 `[1million]` 或 `[max]` 之类自创的标记。 | `kimi.json` |
| 已知的较小值（例如 200K） | 将 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 和/或 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 显式设置为真实数值——不要使用 `[1m]`。 | `kimi-highspeed.json`（`200000`） |
| 未知/尚未验证 | 不要猜测，也不要仅仅因为模板需要在这里填入*某个值*，就复制另一个提供商的数值。先让用户查阅提供商自己的文档/控制台。未经验证的 `[1m]` 或未经验证的较大 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 只会将故障从“压缩过早”变成“直到远远超过真实限制才压缩”——后者更糟，因为在请求真正失败之前不会有任何迹象。 |

`deepseek.json` 和 `glm.json` **同时**设置了 `[1m]` 和显式的 `CLAUDE_CODE_AUTO_COMPACT_WINDOW: "1000000"`。这是双重保险，而不是可以删除的冗余内容——标记与显式覆盖之间的确切优先级尚未经过独立逆向分析，因此，如果你要复制这两个模板中的任意一个，请同时保留二者，不要删除其中任何一个。

MiniMax-M3 模板使用相同的 1M 标记，并显式设置 `1000000` 自动压缩值。MiniMax-M2.7 模板使用显式的 `204800` 限制，且不带标记。

完整的 step-2-16k 模板正确性实战案例（为何一个看似内部一致的上下文值并不等同于当前正确的值——应根据提供商的在线文档交叉核对模型名称，而不能只看其周围的数字），以及一套可复用的验证方法，用于确认任意环境变量是否确实改变了通过网络发送的字节内容（使用本地 `http.server` 进行捕获，因为 `--debug api` 只显示内部状态），均位于 `references/context-window-config.md` 中。

### 常用基础 URL（请与提供商核实）

| 提供商 | 典型基础 URL |
|----------|------------------|
| Kimi     | `https://api.moonshot.cn` 或兼容 OpenRouter 的端点 |
| GLM      | `https://open.bigmodel.cn/api/paas/v4` 或兼容 OpenRouter 的端点 |
| DeepSeek | `https://api.deepseek.com` 或兼容 OpenRouter 的端点 |
| StepFun  | `https://api.stepfun.com` 或兼容 OpenRouter 的端点 |
| MiniMax  | 全球：`https://api.minimax.io/anthropic`；中国：`https://api.minimaxi.com/anthropic` |
| Anthropic| `https://api.anthropic.com` |

**重要：** 确切的端点取决于用户是直接调用提供商，还是通过兼容性网关（例如 OpenRouter）进行调用。务必询问。

## 共享与隔离

| 数据 | 位置 | 是否共享？ |
|------|----------|---------|
| 会话历史记录 | `~/.claude-profiles/<name>/.claude.json` | **按配置文件隔离** |
| 身份验证令牌/缓存 | `~/.claude-profiles/<name>/.claude.json` | **按配置文件隔离** |
| Skills | `~/.claude/skills/` | 通过符号链接共享 |
| 插件内容 | `~/.claude/plugins/marketplaces`、`cache`、`data`、... | 通过符号链接共享 |
| 插件安装注册表 | `~/.claude/plugins/installed_plugins.json` | 通过符号链接共享 |
| 已启用插件映射 | `~/.claude/settings.json` -> `<profile>/settings.json` | 由 `sync-profile-settings.py` 收敛同步（`claude-plugins-sync.py` 也会进行镜像同步） |
| 插件市场索引 | `<profile>/plugins/known_marketplaces.json` | **按配置文件隔离**（installLocation 特定于配置目录，无法共享） |
| 项目/记忆 | `~/.claude/projects/`、`~/.claude/memory/` | 通过符号链接共享 |
| Hook 脚本 | `~/.claude/hooks/`、`~/.claude/commands/` | 通过符号链接共享（仅限脚本——不包括注册信息） |
| `settings.json` 配置：Hook 注册、市场、环境标志、权限、偏好设置 | `<profile>/settings.json` | 会话启动时，由 `sync-profile-settings.py` **从默认配置文件收敛同步**（`model` 等身份标识键以及提供商路由/隔离环境变量永远不会同步） |
| `.claude.json` 行为键（`workflowSizeGuideline`、通知/UI 偏好设置） | `~/.claude.json` → `<profile>/.claude.json` | 由同一脚本**按照行为键白名单收敛同步**；状态/缓存/计数器/迁移/凭据键（包括 `projects`、`oauthAccount`、`userID`）永远不会同步；出现差异的未知键会被报告，以供人工分类 |
| 提供商设置 | `~/.claude/settings/<name>.json` | 共享来源，按配置文件加载 |

## 故障排除

### 配置目录存在，但 claude-profiles-doctor 将其报告为“孤立配置”

症状：`claude-profiles-doctor` 报告
`WARN: orphan profile — no settings/<name>.json; claude-profile <name> fails. Run: claude-profile-rm <name>`。

原因：配置隔离目录存在于 `~/.claude-profiles/` 下，但缺少对应的 `~/.claude/settings/<name>.json` 提供商配置文件。`claude-profiles-init` 只扫描 `settings/*.json`，因此不会创建或维护孤立配置的符号链接，并且 `claude-profile <name>` 将无法启动，同时显示“Error: Settings file not found.”。该配置目录中可能仍包含有用的各配置专属数据（`history.jsonl`、包含提供商凭据的 `.claude.json`、`settings.json`、技能工作区）。

修复方法：
- **如果不再需要该配置**：`claude-profile-rm <name>`——这会安全地删除隔离目录（它会先检查是否存在非预期文件）。
- **如果想要恢复该配置**：在 `~/.claude/settings/<name>.json` 处重新创建设置文件（使用 `assets/templates/` 中的提供商模板），然后运行 `claude-profiles-init`。

### 共享目录（skills/projects/hooks/agents/...）显示为真实目录，而非符号链接

症状：`claude-profiles-doctor` 报告
`<name> is a real directory (expected symlink to ~/.claude/<name>) — drift; run: claude-profiles-init --repair`。

原因：该配置是在符号链接收敛设计落地之前创建的（或由手动创建），因此某个共享内容目录最终成了真实的配置专属目录，而不是符号链接。该配置中的副本如今已悄然偏离主 `~/.claude/` 副本——其中的技能、项目、钩子和代理与其他配置中的不再相同。失效符号链接检查无法发现这一问题（真实目录不是失效链接）；在实际机器上，这种偏离曾持续数月未被发现，直到添加专门的真实目录检查（2026-07-21：在此检查出现之前创建的旧配置携带真实的 `projects/` 目录长达数月，却一直未被发现）。

修复方法（可逆——数据会被归档，绝不会删除）：

```bash
claude-profiles-init --repair
```

对于每个发生偏离的目录，此命令会将真实目录归档到配置目录内的 `<name>.pre-symlink-bak-<timestamp>`，然后创建本应存在的符号链接。再次运行 `claude-profiles-doctor`，确认检查结果正常。如果归档中包含你需要的数据，它就在那里——没有任何内容被销毁。

关于共享内容的说明：修复后，该目录会指向主 `~/.claude/<name>` 副本，因此该配置看到的技能、项目等内容将与默认配置相同——这正是共享符号链接设计的全部意义所在。必须保持隔离的配置专属状态（`.claude.json`、`settings.json` 中的身份相关键，例如 `model`/提供商环境变量，以及 `plugins/known_marketplaces.json`）绝不会位于这些符号链接目录中，因此修复操作绝不会触碰它们。如果该配置包含你关心的会话/历史数据，请在丢弃归档前检查其中的内容——这些数据现在将解析到共享副本。

### Marketplace 提示“corrupted installLocation”

症状：`/plugin` 或 `claude plugin marketplace update` 报告
`corrupted installLocation ... expected a path inside <config-dir>/plugins/marketplaces`。

原因：`known_marketplaces.json` 被多个配置文件共享（或经过手动编辑）。其中的
`installLocation` 特定于配置目录，因为 Claude 使用 `path.resolve()` 进行验证
（不会解析符号链接），所以一份共享副本无法同时满足多个配置文件。

修复：`claude-plugins-sync.py` 会重新构建每个配置文件自己的副本以及指向共享内容的
符号链接。它会在 `claude-profile` 初始化/启动时自动运行；如需手动运行：

```bash
python3 ~/.config/claude-switch-models-setup/claude-plugins-sync.py
```

### 技能存在于默认 Claude 中，但在 Kimi/GLM/DeepSeek 中缺失

症状：默认的 Anthropic 配置文件可以看到某项技能，但第三方配置文件看不到。

原因：Claude Code 将 `enabledPlugins` 存储在每个配置目录的 `settings.json` 中。
共享 `plugins/cache` 只能让文件可用，并不会启用它们。

修复：

```bash
python3 ~/.config/claude-switch-models-setup/claude-plugins-sync.py
```

然后重新启动受影响的 Claude Code 窗口。

### 对本地源代码的编辑未反映在 Claude Code 或 Codex 中

症状：你编辑了本地源代码仓库中的某项技能，但 Claude Code 或 Codex 仍然加载旧的已安装副本。

预期设计：对现有源文件的常规编辑会立即生效，因为安装位置是符号链接。由于技能元数据会在会话启动时加载，现有的 Claude Code/Codex 会话可能仍需重新启动。

如果编辑涉及结构变更（新增插件、新增技能条目、版本升级、安装/卸载或 Marketplace 清单变更），macOS LaunchAgent 应会自动运行。检查：

```bash
launchctl print gui/$(id -u)/ai.daymade.claude-skill-source-sync
```

仅当监视程序未安装或你使用的是非 macOS 计算机时，才需要手动修复：

```bash
python3 ~/.config/claude-switch-models-setup/sync-local-skill-sources.py --apply
```

这会将现有的实际副本移动到带时间戳的 `.source-sync-backups/` 文件夹中，将其替换为指向源代码仓库的符号链接，并在从清单中移除某项技能后清理过期的托管符号链接。

它还会清理自身产生的内容，这是早期版本没有做到的：

- **版本别名符号链接。** 每个缓存链接都以 Marketplace 的当前版本命名，因此每次版本升级都会留下指向同一源目录的旧链接。某个插件曾有六个版本目录，其中四个是同一源的别名。现在，此过程会移除解析到同一源的同级链接；绝不会改动实际目录，因为这些目录由 Claude Code 安装，而且活跃会话可能仍通过 `.in_use` 持有它们。
- **`installed_plugins.json` 备份。** 每次运行只要更改了 JSON 就会写入一个备份，却从未清理它们——一个月的运行留下了 453 个文件。脚本中的 `KEEP_JSON_BACKUPS` 常量限制了保留数量；文件名以 `YYYYMMDD-HHMMSS` 时间戳结尾，因此按字典序排列即为时间顺序。

在 `--apply` 改动任何内容之前，两者都会在试运行中显示出来。

### 配置档案缺少钩子、市场、环境标志或其他默认配置档案设置

症状：默认配置档案已配置钩子防护、市场或功能标志，但第三方配置档案的行为却像是这些配置不存在（没有触发 PreToolUse 防护、`claude plugin marketplace list` 为空、默认配置档案中已启用的功能处于关闭状态）。

**类似症状，但属于不同层面（2026-08-17）：** 在默认配置档案中设置的行为偏好——例如工作流规模准则——在第三方配置档案中不起作用（尽管主配置档案设置了 `small`，某个 Kimi 会话仍将一个动态工作流扩展到了 30 多个智能体）。该键位于各配置档案自己的 `.claude.json` 中，符号链接和 settings.json 同步都无法覆盖它。请参阅 `references/troubleshooting.md` 中的“默认配置档案的行为设置未应用到第三方配置档案”。

原因：这些设置位于每个配置档案自己的 `settings.json` 中，而该文件是配置目录本地的——为目录创建符号链接无法覆盖配置层，并且默认配置档案一旦发生更改，它便会悄无声息地出现偏差。

修复方法：

```bash
python3 ~/.config/claude-switch-models-setup/sync-profile-settings.py --all
```

然后重新启动受影响的窗口。将收敛器注册为 SessionStart 钩子（设置步骤 6）后，每个配置档案都会在会话启动时自行收敛，因此只有在手动编辑设置并希望立即传播更改后，才需要执行此操作。

### 第三方配置档案尝试使用 Anthropic 专属功能

症状：WebSearch 或其他 Anthropic 原生工具出现 400 错误。
修复方法：确保该配置档案的 `settings.json` 设置了：

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

### 子智能体调用回退到其他模型

症状：Kimi 窗口中的子智能体调用 `claude-opus-4-7`。
修复方法：在该配置档案的 `settings.json` 中，将 `CLAUDE_CODE_SUBAGENT_MODEL` 设置为与 `ANTHROPIC_MODEL` 相同的值。

### 超大上下文提供商过早压缩/总结，或状态栏中的上下文数值显示错误

症状：某个提供商自己的文档声称支持约 100 万个 token 的上下文，但 Claude Code 在远低于该上限时就自动压缩了上下文——长会话在显然尚无实际必要时便被总结，或者状态栏中的上下文百分比表现得像是以约 20 万 token 的模型为基准，而非真正的上限。

原因：该配置档案的 `ANTHROPIC_MODEL`（及其同类设置 `ANTHROPIC_DEFAULT_*_MODEL` / `CLAUDE_CODE_SUBAGENT_MODEL`）缺少 `[1m]` 标记。Claude Code 无法通过其他方式获知提供商的实际上下文大小——请求本身能够携带巨大提示成功执行，并不能向 Claude Code 提供任何相关信息，因为这是上游提供商的属性，而非客户端的属性。完整机制请参阅 `references/context-window-config.md`。

修复方法：在该配置档案的 `settings.json` 中，为 `ANTHROPIC_MODEL`、每个 `ANTHROPIC_DEFAULT_*_MODEL` 以及 `CLAUDE_CODE_SUBAGENT_MODEL` 添加字面量后缀 `[1m]`（遵循 `kimi.json` 的模式）。重新启动受影响的窗口。

## 后续添加新提供商

1. 使用模板创建 `~/.claude/settings/<new-provider>.json`。
2. 查询该提供商真实且经过验证的上下文窗口并进行配置——使用 `[1m]` 标记，或显式设置 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`/`CLAUDE_CODE_AUTO_COMPACT_WINDOW`；请参阅下文的“配置上下文窗口大小”和 `references/context-window-config.md`。不要因为复制的模板碰巧不需要此配置就跳过这一步。
3. 运行 `claude-profiles-init`。
4. 如有需要，在 shell rc 文件中添加别名。

## 安全说明

- API 密钥以明文形式写入 `~/.claude/settings/<provider>.json`，与 Claude Code 存储 `ANTHROPIC_AUTH_TOKEN` 的方式相同。这与 Claude Code 自身的安全模型一致。
- 此 Skill 绝不会将密钥或设置上传到任何地方。
- 为便于公开分发，随附的脚本中不包含任何硬编码的密钥、端点或用户特定路径。

## 后续步骤

设置完成后，用户可以立即进行测试：打开两个终端，在其中一个运行 `csk`（Kimi K3），在另一个运行 `csd`。每个窗口彼此独立。