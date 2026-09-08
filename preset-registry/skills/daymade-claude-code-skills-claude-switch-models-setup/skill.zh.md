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
# Claude Code 配置文件与本地 Skill 激活

## 概述

此 skill 为 Claude Code CLI 创建一个隔离但共享的配置文件系统。每个配置文件都有自己的 `.claude.json` 状态文件（凭据和会话历史），同时在所有配置文件之间共享 skills、项目、钩子脚本、agents 以及已安装的插件状态；此外，还会从默认配置文件收敛每个配置文件的 `settings.json`（钩子注册、marketplaces、env 功能标志、权限、偏好设置）以及其 **`.claude.json` 的行为部分**（例如 `workflowSizeGuideline`），因此配置文件之间唯一预期的差异就是模型/提供商。

最终效果是：你可以在一个终端中使用 Kimi，在另一个终端中使用 DeepSeek，在另一个终端中使用 Anthropic；每个终端都运行着完全独立的 Claude Code 进程，不会发生配置串扰。

## 工作原理

- `CLAUDE_CONFIG_DIR` 告诉 Claude Code CLI 使用哪个目录作为配置根目录。
- 每个配置文件都位于 `~/.claude-profiles/<name>/` 中，并拥有隔离的 `.claude.json`。
- 内容目录（`skills/`、`projects/`、`hooks/`、`agents/`、`settings/`）都通过符号链接指回主 `~/.claude/` 目录，因此只需维护一份副本。注意，这共享的是钩子 **脚本**，而不是钩子 **注册信息**——注册信息位于每个配置文件自己的 `settings.json` 中（见下一项）。
- **配置层——`settings.json`：** 每个配置文件都有自己的 `settings.json`（Claude Code 将其视为配置目录本地文件），因此其中存储的所有内容——钩子注册、`extraKnownMarketplaces`、`enabledPlugins`、`env` 功能标志、`permissions`、行为偏好——都会在默认配置文件发生变化的瞬间悄然产生偏差（截至 2026-07-18 的测量结果：9/9 个真实配置文件都没有任何钩子注册）。`sync-profile-settings.py` 就是负责收敛的脚本：它被注册为 SessionStart hook，将默认配置文件的 `settings.json` 中的每个键复制到活动配置文件中，但身份键除外（顶层的 `model` 和 `advisorModel`——后者负责 Anthropic 模型路由，第三方端点无法提供该服务；以及承载提供商路由或 Anthropic 原生隔离设置的环境变量——`ANTHROPIC_*`、`CLAUDE_CODE_SUBAGENT_MODEL`、`ENABLE_TOOL_SEARCH`、`DISABLE_GROWTHBOOK/TELEMETRY/AUTOUPDATER`——这些变量由提供商设置文件有意设置为不同值）。仅存在于配置文件中的 **顶层** 键会被保留；某个键中主配置文件也拥有的嵌套集合（例如 `permissions.allow`、`enabledPlugins`）会整体收敛到主配置文件的值，并且以此方式被丢弃的、仅存在于配置文件中的嵌套条目会被列出（写入时统计数量，`--check` 下显示详细信息），使损失可见而不是悄无声息。这正是“除模型之外的所有内容都能在每个配置文件中正常工作”得以真正成立的原因。
- **状态层——`.claude.json` 行为键：** `settings.json` 并不是唯一的配置文件。Claude Code 还会为每个配置文件维护一个状态文件（主配置文件的是 `~/.claude.json`；每个第三方配置文件的是 `<profile>/.claude.json`——路径并不对称，已在磁盘上验证），其中只有少数**行为**设置（`workflowSizeGuideline`、通知/UI 偏好）存在。2026-08-17，只有主配置文件中存在 `workflowSizeGuideline: small`，11 个第三方配置文件中有 10 个没有该副本——某个 Kimi 会话在系统提示中没有任何大小指导的情况下，将一个 Dynamic Workflow 分发给了 30 多个 agents。因此，同一个收敛脚本还会将一份**行为键允许列表**同步到每个配置文件的 `.claude.json` 中。安全机制是脚本中的三方分类器，而不是手动维护的键列表：允许列表中的行为键会被同步；状态/缓存/计数器/迁移/凭据键（按名称模式匹配）永远不会被修改；任何未知且不同的键都会被**报告——每次运行中每个发生偏差的键占一行，直到人工完成分类**（这是一个触发器，用于在下一个行为键出现的当天将其暴露出来）。写入采用备份加原子替换；经测量，在活动会话重写文件的情况下依然安全（一个标记键在活动会话中存活了 30 多分钟）。下次会话才会生效——harness 会在启动时读取此文件。
- **例外——`plugins/`：** marketplace 内容和安装状态是共享的，但每个配置文件都保留自己的 `known_marketplaces.json`。Claude 会使用 `path.resolve()` 验证 marketplace 的 `installLocation`（该函数**不会**解析符号链接），因此共享单个文件会导致所有不负责写入的配置文件报告“corrupted installLocation”。`claude-plugins-sync.py` 会构建并维护这一按配置文件区分的结构。
- `claude-plugins-sync.py` 还会将默认 `~/.claude/settings.json` 中的 `enabledPlugins` 镜像到每个配置文件的 `settings.json` 中（仅共享缓存文件还不够；Claude Code 将“启用”状态视为配置目录本地状态）。它会在配置文件启动时运行，并以响应式方式运行——下一项中的 LaunchAgent 会在默认配置文件的 `settings.json` 每次写入时重新运行它，因此 `claude plugin enable`/`disable --scope user` 通常会在几秒内传播到每个配置文件，无需重新启动（已于 2026-08-22 验证）。该镜像会**先执行采纳**：某些配置文件的 `settings.json` 中独有的 `enabledPlugins` 键（即 `claude plugin install` 写入这些键的方式）会在镜像前写回默认配置文件——但只处理一致的值；跨配置文件冲突会在持续警告的保护下保留在各自配置文件中，而不会被静默覆盖（该行为于 2026-09-03 加入，此前已确认缺少采纳的镜像机制是技能可见性反复丢失的机械根因）。上面的 SessionStart 收敛脚本会将同一个键作为整体设置同步的一部分进行处理；`claude-plugins-sync.py` 仍负责每个配置文件的 `known_marketplaces.json` 结构。`skill-install-audit.py` 以只读方式协调 registry / installed / enabled / Codex-manifest / `~/.agents/skills` 各层，同时检查 daemon 固定的运行时版本，以及它据此判断所有内容的 checkout 是否本身已经落后。`prune-source-sync-backups.py` 只会移除 git 能够重建的 `.source-sync-backups/` 存储桶；如果某个存储桶中哪怕有一个仓库不存在的 blob，就会报告该情况并保留该存储桶。
- 本地源同步会使每个主机上的已批准、基于源的路由保持一致。  
  在选择或修复条目之前，请阅读
  [主机特定的激活契约](references/local-source-sync-architecture.md#host-specific-user-skill-activation)。
  它负责清单字段、marketplace 展开、Claude 插件/直接链接的区别、
  未解析名称的处理、冲突安全性以及旧版兼容性。
  仅进行源注册并不能决定激活策略；不要手动创建链接，也不要重新利用清单来管理第三方清单。
- 同步脚本使用跨进程共享锁。这是必需的，因为用户经常会从 tmux 或多个终端同时打开多个提供商窗口；并发启动必须串行化 marketplace/缓存重写，同时仍允许所有配置文件启动。
- 如需了解完整的本地源架构，请在修改这些脚本之前阅读 `references/local-source-sync-architecture.md`。
- 提供商路由通过 `~/.claude/settings/<name>.json` 完成，该文件会为对应窗口设置 `ANTHROPIC_MODEL`、`ANTHROPIC_BASE_URL` 和 `ANTHROPIC_AUTH_TOKEN`。

## 一键设置工作流

当用户说类似“设置 Claude Code 配置文件”或“我想在不同窗口中使用 Kimi 和 DeepSeek”时：

1. **检查前置条件**
   - 已安装 `claude` CLI：`which claude`
   - Shell 为 zsh 或 bash：通过 `$SHELL` 检测
   - `python3` 可用

2. **安装配置文件管理器脚本 — 创建符号链接，不要复制**

   在已检出此仓库的机器上（维护者场景），运行随附的安装程序：

   ```bash
   <absolute-path-to-this-repo>/daymade-claude-code/claude-switch-models-setup/scripts/setup.sh
   ```

   `scripts/setup.sh` 是确定实际部署集合的唯一来源。它会将每个辅助脚本链接到 `~/.config/claude-switch-models-setup/`，并且仅在激活清单尚不存在时创建该清单。不要在此处维护另一份辅助脚本列表。不需要执行 `chmod`：部署方式是符号链接，源文件会保留其已提交的权限模式。

   **为什么使用符号链接而不是 `cp`：** 实际运行的是 `~/.config/…` 中的内容——LaunchAgent 和 `claude-profile` 都会通过该路径调用脚本——而此仓库保存的是它们的源代码。副本会发生漂移，而且已部署的副本看起来与其源文件没有任何区别，因此“我编辑的是 SSOT 吗？”不是任何人都能可靠判断的问题。在切换前对一台机器进行的测量显示：一个锁放置修复在仓库中放了 26 天，而已部署的副本仍在运行它所修复的缺陷；另外，直接写入已部署副本的两个清理例程从未进入版本控制——**两个方向都在无声地发生漂移。** 符号链接可以消除这两个问题，*只要它一直是符号链接*——原子保存编辑器、`rsync` 或意外的 `cp` 都可能在不提示的情况下将其重新变成真实文件，这就是为什么值得重新检查，而不是宣布问题已经解决。它还使 `sync-local-skill-sources.py` 能够通过解析自身路径找到源代码仓库，而不必退回到猜测。

   如何值得重新检查？任何定期检查都可以；此 skill 没有附带相关检查。下面这一行可在你管理这类任务的地方运行：

   ```bash
   for f in ~/.config/claude-switch-models-setup/*.py ~/.config/claude-switch-models-setup/*.sh; do
     [ -L "$f" ] && [ -e "$f" ] || echo "not a live link: $f"
   done
   ```

   如果其中一个已经变成真实文件，**请在重新建立链接之前将其移到一旁**——其中可能包含任何其他地方都不存在的编辑内容，而这正是上文所描述的问题：`mv "$f" "$f.local-edits" && ln -sf <source> "$f"`，然后进行差异比较。

   在**没有**仓库的机器上，改为从此 skill bundle 中复制安装程序列出的脚本，并接受这样一个事实：在你再次复制之前，仓库中的修复不会同步到该机器。

   在 LaunchAgent 运行**固定版本的插件副本**的机器上（维护者布局见[本地源代码同步架构](references/local-source-sync-architecture.md)），这些相同的链接会指向 `.../plugins/cache/...` 下该副本的版本目录，而不是指向检出目录；只有在推进固定版本时才会移动（见[故障排除](references/troubleshooting.md)中的“推进固定版本”）。安装程序拒绝将此类机器重新链接到检出目录（`CSMS_SETUP_RELINK_TO_CHECKOUT=1` 可覆盖此行为），因为这样 daemon 和 `claude-profile` 就会跟随检出目录当前所在的任意分支。上面的活动链接检查适用于这两种布局。

3. **添加 shell 集成**
   - 在 `~/.zshrc` 或 `~/.bashrc` 中加载 profile manager
   - 添加别名：`csk`、`csks`、`csd`、`csg`、`css`
   - 如有需要，手动添加其他按账户/套餐区分的变体别名 —
     `claude-profiles.sh` 只定义上述别名
   - 告知用户运行 `source ~/.zshrc`（或打开新的终端）

4. **生成 provider 设置文件**
   - 对于用户需要的每个 provider，创建 `~/.claude/settings/<provider>.json`
   - 使用 `assets/templates/` 中的模板作为起点
   - 向用户询问其 API key 和 base URL；**绝不要硬编码默认值**
   - 正确设置此特定 provider 的上下文窗口 — 使用 `[1m]` 后缀，或显式设置 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`/`CLAUDE_CODE_AUTO_COMPACT_WINDOW`，参见下文“配置上下文窗口大小”。每个新 profile 都必须明确执行此操作，不要直接复制最近模板中已有的设置 — 最近的模板不需要设置这一项，并不能证明当前 profile 也不需要。
   - 包含必需的隔离标志：
     - `CLAUDE_CODE_SUBAGENT_MODEL`（与 `ANTHROPIC_MODEL` 相同）
     - `ENABLE_TOOL_SEARCH: "false"`
     - `DISABLE_GROWTHBOOK: "1"`
     - `DISABLE_TELEMETRY: "1"`
     - `DISABLE_AUTOUPDATER: "1"`

5. **初始化 profile 目录**
   - 运行 `claude-profiles-init`
   - 此命令会创建包含隔离 `.claude.json` 和符号链接的 `~/.claude-profiles/<provider>/`
   - 在维护者机器上，此命令还会在同步插件元数据之前修复本地源代码符号链接

   **状态栏连接：** `claude-profiles-init` 会自动从
   `~/.claude/settings.json` 或 `~/.claude/statusline.sh` 中检测状态栏脚本，并将其注入每个新 profile。如果两者都不存在，profile 仍可正常工作，但不会显示状态栏。**AI 负责**判断用户是否需要状态栏，并在适当时安装 `statusline-generator` skill 及运行其安装程序 — profile 设置脚本不负责此事。不要将依赖安装硬编码到 shell 脚本中。

6. **注册设置收敛器**
   - 将收敛器作为 SessionStart hook 添加到**默认** profile 的 `~/.claude/settings.json` 的 `hooks.SessionStart` 列表中，使用类似 `'/absolute/path/to/python3' '/absolute/path/to/sync-profile-settings.py'` 的绝对路径直接调用 Python 的命令。不要通过 shebang 或包管理器注册 `.py` 文件：此 hook 用于修复每个 profile，因此不能等待共享环境/缓存锁。激活的 profile 为默认 profile 时，它不会执行任何操作；它在默认 profile 中的作用是在首次同步时将自身传播到每个 profile 的 `hooks` 键中。
   - 运行初始对齐：`python3 ~/.config/claude-switch-models-setup/sync-profile-settings.py --all`
   - 此后，每个 profile 会在每次会话启动时，从默认 profile 收敛其 `settings.json` 以及 `.claude.json` 中的行为部分（更改将在下一个会话中生效）。仅审计而不写入：`--check --all`

7. **验证隔离**
   - 运行 `claude-profiles-doctor`
   - 确认每个 profile 目录都包含 `.claude.json` 和有效的符号链接

8. **为 Codex 和 Claude 选择本地源 Skills**
   - 普通学生或不编辑 skill 源代码仓库的用户跳过此步骤
   - 阅读[主机特定的激活契约](references/local-source-sync-architecture.md#host-specific-user-skill-activation)，然后为请求的主机编辑机器的激活清单。仅对仍保留旧路径的使用者使用其中的兼容性规则。
   - 使用 `python3 ~/.config/claude-switch-models-setup/sync-local-skill-sources.py` 预览，读取每个受影响的路径，然后使用 `python3 ~/.config/claude-switch-models-setup/sync-local-skill-sources.py --apply` 应用。
   - 在维护者的 macOS 机器上，运行 `~/.config/claude-switch-models-setup/sync-local-skill-sources-daemon.sh --install`
   - 此程序会监视激活清单、默认 Claude 安装状态和本地 marketplace 清单，并在选择、安装/卸载或插件拓扑发生变化后修复派生状态

9. **向用户展示如何启动**
   - `csk` → Kimi K3 窗口
   - `csks` → Kimi K2.7 highspeed 窗口
   - `csd` → DeepSeek 窗口
   - `csg` → GLM 窗口
   - `css` → StepFun 窗口
   - `claude`（无别名）→ 默认 Anthropic 配置
   - 可选：自行手动添加按账户/套餐区分的变体别名，例如：
     `alias cssp='claude-profile step-pay --dangerously-skip-permissions'` —
     `claude-profiles.sh` 不会生成此别名；这是在其基础上采用的手动模式

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
python3 ~/.config/claude-switch-models-setup/sync-local-skill-sources.py
                               # Maintainers: preview host selections and affected paths
python3 ~/.config/claude-switch-models-setup/sync-local-skill-sources.py --apply
                               # Apply the inspected Codex, Claude, and explicit
                               # legacy compatibility changes
~/.config/claude-switch-models-setup/sync-local-skill-sources-daemon.sh --install
                               # Maintainers: install automatic macOS watcher
```

这些不是日常使用的命令。普通源代码编辑会通过符号链接实时生效。这些一次性命令用于修复、引导设置，或用于没有 LaunchAgent 监视器的非 macOS 环境。

## Provider Templates

使用 [`assets/templates/`](assets/templates/) 中的 provider 模板。读取所选文件以获取其模型、端点、上下文设置和思考行为；不要从手动维护的模板摘要中推断这些值。

每个模板都使用 `<API_KEY>` 占位符。可配置网关的模板还使用 `<BASE_URL>`；MiniMax 模板固定使用文档中规定的区域端点。向用户询问每个真实的占位符值；除非用户明确提供，否则不要猜测或复用当前机器上的值。

### MiniMax model behavior

| Templates | Model | Context configuration | Thinking behavior |
|---|---|---|---|
| `minimax.json`、`minimax-cn.json` | `MiniMax-M3` | 将 `[1m]` 追加到每个路由模型值，并将 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 设置为 `1000000`。 | 支持自适应或禁用思考。保持 `ANTHROPIC_REASONING_MODEL` 使用相同的模型。 |
| `minimax-m2-7.json`、`minimax-m2-7-cn.json` | `MiniMax-M2.7` | 将 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 和 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 设置为 `204800`；不要追加 `[1m]`。 | 思考始终开启；不要声称存在模板级别的禁用路径。 |

## Configuring Context Window Size

每个 provider 模板都通过以下两种方式之一设置模型的上下文窗口大小。设置错误后，Claude Code 将无法知道模型实际可以容纳多少上下文。设置过小会导致它比 provider 的实际要求更早进行压缩（总结并丢弃旧的细节）；设置过大则会导致它在实际限制已经被超出后仍不进行压缩。

`[1m]` 标记的完整客户端机制，包括它如何从模型字段中移除该标记、如何将其添加到 `anthropic-beta` 标头，以及为什么缺少 `[1m]` *并不意味着* provider 无法容纳较大的提示词，都记录在 `references/context-window-config.md` 中。当上下文数值看起来不正确时，请查阅该文档，而不是在编写模板时查阅。

### Decision rule

编写新 provider 的 `settings/<name>.json` 时，应根据 provider 实际且经过验证的上下文窗口来选择，而不是根据模型的营销名称，也不要照搬最相近模板的做法：

| Provider's real context window | What to set | Example template |
|---|---|---|
| 约 1M tokens，且已明确确认（不能根据模型的级别或名称推断） | 在每个 `ANTHROPIC_MODEL` / `ANTHROPIC_DEFAULT_*_MODEL` / `CLAUDE_CODE_SUBAGENT_MODEL` 值后追加 `[1m]` 后缀。必须是准确的 4 个字符 `[1m]`，Claude Code 会匹配这个字面字符串，而不是类似 `[1million]` 或 `[max]` 这样的自定义标记。 | `kimi.json` |
| 已知的较小值（例如 200K） | 将 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 和/或 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 显式设置为真实数值，不要使用 `[1m]`。 | `kimi-highspeed.json`（`200000`） |
| 未知 / 尚未验证 | 不要猜测，也不要仅仅因为模板需要设置某个值，就照搬其他 provider 的数值。请用户先查阅 provider 自己的文档或控制台。未经验证的 `[1m]` 或未经验证的较大 `CLAUDE_CODE_AUTO_COMPACT_WINDOW`，只是将问题从“过早压缩”转变为“直到远超实际限制后才压缩”；后者更糟，因为在实际请求失败前都不会显现。 |

`deepseek.json` 和 `glm.json` 同时设置了 **[1m]** 以及显式的 `CLAUDE_CODE_AUTO_COMPACT_WINDOW: "1000000"`。这是双重保险，并不是应当删掉的冗余填充 —— 标记和显式覆盖之间的确切优先级尚未经过独立逆向工程验证，因此如果你要复制这两个模板中的任意一个，请保留两者，不要删除其中之一。

MiniMax-M3 模板使用相同的 1M 标记，并附带显式的 `1000000` 自动压缩值。MiniMax-M2.7 模板使用显式的 `204800` 限制，不带标记。

完整的第 2 步到 16k 模板正确性经验总结（为什么一个内部看起来自洽的上下文值，并不等同于当前正确的值 —— 请将模型名称与提供商的实时文档交叉核对，而不只是查看它周围的数字），以及一套可复用的验证方案，用于确认某个环境变量是否确实改变了通过网络发送的字节（使用本地 `http.server` 捕获，因为 `--debug api` 只显示内部状态），都位于 `references/context-window-config.md`。

### 常见基础 URL（请与提供商核实）

| 提供商 | 典型基础 URL |
|----------|------------------|
| Kimi     | `https://api.moonshot.cn` 或兼容 OpenRouter 的端点 |
| GLM      | `https://open.bigmodel.cn/api/paas/v4` 或兼容 OpenRouter 的端点 |
| DeepSeek | `https://api.deepseek.com` 或兼容 OpenRouter 的端点 |
| StepFun  | `https://api.stepfun.com` 或兼容 OpenRouter 的端点 |
| MiniMax  | 全球：`https://api.minimax.io/anthropic`；中国：`https://api.minimaxi.com/anthropic` |
| Anthropic| `https://api.anthropic.com` |

**重要：** 确切的端点取决于用户是直接调用提供商，还是通过兼容网关（例如 OpenRouter）调用。请务必询问。

## 共享与隔离

| 数据 | 位置 | 是否共享？ |
|------|----------|---------|
| 会话历史 | `~/.claude-profiles/<name>/.claude.json` | **按配置文件隔离** |
| 身份验证令牌/缓存 | `~/.claude-profiles/<name>/.claude.json` | **按配置文件隔离** |
| Skills | `~/.claude/skills/` | 通过符号链接共享 |
| 插件内容 | `~/.claude/plugins/marketplaces`、`cache`、`data` 等 | 通过符号链接共享 |
| 插件安装注册表 | `~/.claude/plugins/installed_plugins.json` | 通过符号链接共享 |
| 已启用插件映射 | `~/.claude/settings.json` -> `<profile>/settings.json` | 由 `sync-profile-settings.py` 收敛（也由 `claude-plugins-sync.py` 镜像） |
| 插件市场索引 | `<profile>/plugins/known_marketplaces.json` | **按配置文件区分**（installLocation 特定于配置目录，无法共享） |
| 项目/记忆 | `~/.claude/projects/`、`~/.claude/memory/` | 通过符号链接共享 |
| Hook 脚本 | `~/.claude/hooks/`、`~/.claude/commands/` | 通过符号链接共享（仅脚本 —— **不包括注册信息**） |
| `settings.json` 配置：Hook 注册、市场、环境标志、权限、偏好设置 | `<profile>/settings.json` | 在会话开始时由 `sync-profile-settings.py` **从默认配置文件收敛**（`model` 等身份键以及提供商路由/隔离环境变量永不同步） |
| `.claude.json` 行为键（`workflowSizeGuideline`、通知/UI 偏好设置） | `~/.claude.json` → `<profile>/.claude.json` | 由同一脚本**按行为允许列表收敛**；状态/缓存/计数器/迁移/凭据键（包括 `projects`、`oauthAccount`、`userID`）永不同步；未知的漂移键会报告出来，供人工分类 |
| 提供商设置 | `~/.claude/settings/<name>.json` | 共享源文件，按配置文件加载 |

## 故障排除

### 配置文件目录存在，但 claude-profiles-doctor 将其报告为“孤立配置文件”

现象：`claude-profiles-doctor` 报告
`WARN: orphan profile — no settings/<name>.json; claude-profile <name> fails. Run: claude-profile-rm <name>`。

原因：配置文件隔离目录存在于 `~/.claude-profiles/` 下，但对应的
`~/.claude/settings/<name>.json` 提供商配置文件缺失。`claude-profiles-init` 只扫描
`settings/*.json`，因此孤立配置文件的符号链接从未被创建或维护，并且
`claude-profile <name>` 将无法启动，并显示“Error: Settings file not found。”配置文件目录中可能仍包含有用的每配置文件数据（`history.jsonl`、包含提供商凭据的 `.claude.json`、`settings.json`、技能工作区）。

修复：
- **如果不再需要该配置文件**：`claude-profile-rm <name>` — 这会安全地移除隔离目录（它会先检查是否存在意外文件）。
- **如果想要恢复该配置文件**：在 `~/.claude/settings/<name>.json` 创建配置文件（使用 `assets/templates/` 中的提供商模板），然后运行 `claude-profiles-init`。

### 共享目录（skills/projects/hooks/agents/...）显示为真实目录，而不是符号链接

现象：`claude-profiles-doctor` 报告
`<name> is a real directory (expected symlink to ~/.claude/<name>) — drift; run: claude-profiles-init --repair`。

原因：该配置文件是在符号链接收敛设计落地之前创建的（或是手动创建的），因此共享内容目录最终成为了真实的每配置文件目录，而不是符号链接。现在，该配置文件中的副本会与主 `~/.claude/` 副本静默产生分歧——它的 skills/projects/hooks/agents 与其他每个配置文件中的并不相同。损坏符号链接检查无法发现这一点（真实目录不是损坏的链接）；在真实机器上，这种分歧一直未被发现，持续了数月，直到专门的真实目录检查被添加（2026-07-21：在此检查存在之前创建的旧配置文件中，真实的 `projects/` 目录持续了数月而未被发现）。

修复（可逆——数据会被归档，绝不会被删除）：

```bash
claude-profiles-init --repair
```

对于每个存在分歧的目录，该命令会将真实目录归档到配置文件目录中的
`<name>.pre-symlink-bak-<timestamp>`，然后创建本应存在的符号链接。再次运行
`claude-profiles-doctor`，确认检查结果正常。如果归档中有你需要的数据，它就在
那里——没有任何数据被销毁。

关于哪些内容会被共享的说明：修复后，该目录会指向主
`~/.claude/<name>` 副本，因此该配置文件看到的 skills/projects/etc. 与默认配置文件相同——这正是共享符号链接设计的全部目的。必须保持隔离的每配置文件状态（`.claude.json`、`settings.json` 中的 `model`/provider env 等身份键、`plugins/known_marketplaces.json`）从来都不属于这些符号链接目录，因此修复不会触及这些内容。如果该配置文件中保存了你在意的会话/历史数据，请在丢弃归档前检查它——这些数据现在会解析到共享副本。

### Marketplace 报告“损坏的 installLocation”

症状：`/plugin` 或 `claude plugin marketplace update` 报告
`corrupted installLocation ... expected a path inside <config-dir>/plugins/marketplaces`。

原因：`known_marketplaces.json` 被多个配置文件共享（或经过手动编辑）。它的
`installLocation` 特定于配置目录，因为 Claude 使用 `path.resolve()` 进行验证（不会解析符号链接），因此同一个共享副本无法满足多个配置文件的要求。

修复：`claude-plugins-sync.py` 会为每个配置文件重新构建其独立副本以及共享内容的符号链接。它会在 `claude-profile` 初始化或启动时自动运行；如需手动运行：

```bash
python3 ~/.config/claude-switch-models-setup/claude-plugins-sync.py
```

### Skill 在默认 Claude 中存在，但在 Kimi/GLM/DeepSeek 中缺失

症状：默认 Anthropic 配置文件可以看到某个 skill，但第三方配置文件无法看到。

原因：Claude Code 将 `enabledPlugins` 存储在每个配置目录的 `settings.json` 中。
共享 `plugins/cache` 只会让文件可用；它不会启用这些插件。

修复：

```bash
python3 ~/.config/claude-switch-models-setup/claude-plugins-sync.py
```

然后重启受影响的 Claude Code 窗口。

### 本地源代码修改未显示在 Claude Code 或 Codex 中

请阅读[源代码变更和固定版本更新流程](references/troubleshooting.md#local-skill-source-changes-do-not-appear-in-claude-code-or-codex)。
其中区分了基于源代码的路径与固定版本的运行时副本，也区分了清单报告、成功同步和新主机发现。

源代码同步还会管理派生的缓存产物：


- **版本别名符号链接。** 每个缓存链接都以 marketplace 的当前版本命名，因此每次版本升级都会遗留一个指向同一源目录的旧链接。现在，同步过程会删除那些解析到同一源目录的同级链接；真实目录永远不会被触碰，因为这些目录由 Claude Code 安装，活动会话可能仍通过 `.in_use` 持有它们。
- **`installed_plugins.json` 备份。** 每次修改 JSON 的运行都会写入一个备份。脚本中的 `KEEP_JSON_BACKUPS` 常量会限制保留的备份数量；名称末尾带有 `YYYYMMDD-HHMMSS` 时间戳，因此按字典序排列即为时间顺序。

在 `--apply` 执行任何修改之前，两者都会在 dry run 中显示。

### 某个配置文件缺少 hooks、marketplaces、环境标志或其他默认配置文件设置

症状：默认配置文件配置了 hook guards、marketplaces 或功能标志，但第三方配置文件的行为仿佛这些设置不存在（没有 PreToolUse guards 触发，`claude plugin marketplace list` 为空，默认配置文件中启用的功能处于关闭状态）。

**同级症状，不同层级（2026-08-17）：** 在默认配置文件中设置的行为偏好（例如工作流规模指南）对第三方配置文件没有影响（某个 Kimi 会话将 Dynamic Workflow 扩展到了 30 多个 agents，尽管主配置文件中设置的是 `small`）。该键位于每个配置文件的 `.claude.json` 中，而符号链接和 `settings.json` 同步都不会覆盖它。请参阅 `references/troubleshooting.md` 中的“Default-profile behavior settings don't reach third-party profiles”。

原因：这些内容位于每个配置文件的各自 `settings.json` 中，这是配置目录本地的配置层——仅建立目录符号链接无法覆盖配置层，而且默认配置文件一旦发生变化，就会悄然产生偏差。

修复：

```bash
python3 ~/.config/claude-switch-models-setup/sync-profile-settings.py --all
```

然后重启受影响的窗口。将收敛器注册为 `SessionStart` hook（设置步骤 6）后，每个配置文件都会在会话开始时自行收敛，因此只有在你手动修改了设置并希望立即传播时，才需要执行此操作。

### 第三方配置文件尝试使用 Anthropic 专属功能

症状：WebSearch 或其他 Anthropic 原生工具返回 400 错误。
修复：确保配置文件的 `settings.json` 设置了：

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

症状：Kimi 窗口中的子代理调用了 `claude-opus-4-7`。
修复：将 `CLAUDE_CODE_SUBAGENT_MODEL` 设置为配置文件 `settings.json` 中 `ANTHROPIC_MODEL` 的相同值。

### 超大上下文提供商过早进行上下文压缩/摘要，或状态栏中的上下文数值看起来不正确

症状：某个提供商的文档声称其上下文容量约为 1M tokens，但 Claude Code 在远低于该容量时就自动进行上下文压缩——长会话在显然还没有真正需要压缩时就被摘要了，或者状态栏中的上下文百分比表现得像是在参考一个约 200K 的模型，而不是实际的上限。

原因：配置文件中的 `ANTHROPIC_MODEL`（以及其 `ANTHROPIC_DEFAULT_*_MODEL` / `CLAUDE_CODE_SUBAGENT_MODEL` 同类变量）缺少 `[1m]` 标记。Claude Code 没有其他方式获知提供商的真实上下文大小——请求本身能够成功处理超大提示词，并不能告诉 Claude Code 这一点，因为这是上游提供商的属性，而不是客户端的属性。完整机制请参见 `references/context-window-config.md`。

修复：在配置文件 `settings.json` 中，为 `ANTHROPIC_MODEL`、每个 `ANTHROPIC_DEFAULT_*_MODEL` 以及 `CLAUDE_CODE_SUBAGENT_MODEL` 添加字面量 `[1m]` 后缀（遵循 `kimi.json` 的模式）。重启受影响的窗口。

## 稍后添加新提供商

1. 使用模板创建 `~/.claude/settings/<new-provider>.json`。
2. 检查提供商真实且经过验证的上下文窗口并进行配置——使用 `[1m]` 标记，或显式设置 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`/`CLAUDE_CODE_AUTO_COMPACT_WINDOW`，请参见下方的“配置上下文窗口大小”和 `references/context-window-config.md`。不要因为复制的模板恰好不需要配置就跳过这一步。
3. 运行 `claude-profiles-init`。
4. 如有需要，将别名添加到 shell rc 文件中。

## 安全说明

- API 密钥会以纯文本形式写入 `~/.claude/settings/<provider>.json`，其方式与 Claude Code 存储 `ANTHROPIC_AUTH_TOKEN` 相同。这符合 Claude Code 自身的安全模型。
- 此技能不会将密钥或设置上传到任何地方。
- 用于公开分发时，随附脚本不包含硬编码的机密、端点或特定用户路径。

## 下一步

设置完成后，用户可以立即打开两个终端进行测试：在一个终端中运行 `csk`（Kimi K3），在另一个终端中运行 `csd`。每个窗口彼此独立。

当接受设置的人员是使用自己机器自行操作的工作坊参与者，而不是由你代为操作时，请将 `references/student-setup-guide.md` 交给他们，而不是带着他们阅读此文件。该指南从头到尾都是为他们编写的，其中不包含他们目前还不需要的维护和故障排除内容。