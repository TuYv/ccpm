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

此 Skill 为 Claude Code CLI 创建了一个相互隔离但又共享资源的配置文件系统。每个配置文件都有自己的 `.claude.json` 状态文件（凭据和会话历史），同时在所有配置文件之间共享 Skill、项目、Hook 脚本、Agent 和已安装插件的状态，并让每个配置文件的 `settings.json`（Hook 注册、Marketplace、环境变量功能标志、权限、偏好设置）与默认配置文件保持一致，因此配置文件之间唯一预期存在的差异就是模型/提供商。

最终效果是：你可以在一个终端中使用 Kimi，在另一个终端中使用 DeepSeek，再在另一个终端中使用 Anthropic——每个终端都运行着完全独立的 Claude Code 进程，彼此之间不会发生配置串扰。

## 工作原理

- `CLAUDE_CONFIG_DIR` 告诉 Claude Code CLI 应将哪个目录用作其配置根目录。
- 每个配置文件都位于 `~/.claude-profiles/<name>/` 中，并拥有相互隔离的 `.claude.json`。
- 内容目录（`skills/`、`projects/`、`hooks/`、`agents/`、`settings/`）通过符号链接指回主 `~/.claude/` 目录，因此你只需维护一份副本。请注意，这里共享的是 Hook **脚本**，而不是 Hook **注册信息**——注册信息存储在每个配置文件自己的 `settings.json` 中（见下一项）。
- **配置层——`settings.json`：**每个配置文件都有自己的 `settings.json`（Claude Code 将其视为配置目录本地文件），因此存储在其中的所有内容——Hook 注册、`extraKnownMarketplaces`、`enabledPlugins`、`env` 功能标志、`permissions`、行为偏好设置——只要默认配置文件中的内容发生变化，就会在不知不觉中出现偏差（2026-07-18 的测量结果：9/9 个实际配置文件均未注册任何 Hook）。`sync-profile-settings.py` 是用于收敛配置的工具：它注册为 SessionStart Hook，会将默认配置文件 `settings.json` 中的每个键复制到当前活动配置文件中，但身份标识键除外（顶层 `model`；以及用于提供商路由或 Anthropic 原生隔离的环境变量——`ANTHROPIC_*`、`CLAUDE_CODE_SUBAGENT_MODEL`、`ENABLE_TOOL_SEARCH`、`DISABLE_GROWTHBOOK/TELEMETRY/AUTOUPDATER`——提供商设置文件会有意为它们设置不同的值）。仅存在于配置文件中的键会被保留；同步过程永远不会删除内容。这正是确保“除模型外，其他所有功能都能在每个配置文件中正常工作”真正成立的机制。
- **例外——`plugins/`：**Marketplace 内容和安装状态是共享的，但每个配置文件都会保留其**自己的** `known_marketplaces.json`。Claude 使用 `path.resolve()` 验证 Marketplace 的 `installLocation`（它**不会**解析符号链接），因此，如果共享同一个文件，所有非写入方配置文件都会报告“`installLocation` 已损坏”。`claude-plugins-sync.py` 会构建并维护这种按配置文件划分的结构。
- `claude-plugins-sync.py` 还会将默认 `~/.claude/settings.json` 中的 `enabledPlugins` 镜像到每个配置文件的 `settings.json` 中（仅共享缓存文件是不够的；Claude Code 将“已启用”状态视为配置目录本地状态）。上述 SessionStart 收敛器会在同步全部设置的过程中覆盖同一个键；`claude-plugins-sync.py` 仍然负责管理按配置文件划分的 `known_marketplaces.json` 结构。
- 在维护者的机器上，本地源代码同步是自动进行的。已安装的 Claude 插件缓存目录以及 Codex/agents Skill 副本会通过符号链接指向源代码仓库，因此常规源代码编辑会立即生效。`sync-local-skill-sources.py` 是幂等的修复原语；`claude-profile` 初始化/启动时会自动运行它，而 `sync-local-skill-sources-daemon.sh --install` 会安装一个 macOS LaunchAgent，用于监视默认 Claude 安装状态以及本地 Marketplace 清单的结构性变化。当某个 Skill 从 Marketplace 清单中移除时，同一修复过程只会清理指回受管理源代码仓库的过期 Codex/agents 符号链接、插件缓存中已被取代的版本别名符号链接，以及 `installed_plugins.json` 中除最新 `KEEP_JSON_BACKUPS` 份之外的所有备份；它绝不会删除真正的 Skill 目录。
  - **由守护进程管理的符号链接所存在的陷阱**（两者均观察于 2026-07）：① 切勿在由守护进程管理的目录中手动创建符号链接（`ln -s <repo>/<skill> ~/.codex/skills/<skill>`）——如果守护进程已经创建了它，BSD `ln` 会将新链接放到目标目录*内部*，留下一个自引用的 `<skill>/<skill>` 杂项链接，目录遍历可能会递归进入其中；仅可使用 `ln -sfn` 手动修复，或者先通过 `readlink` 确认链接确实不存在后再进行修复。② 使用 `readlink` 而不是 `ls -la <link>` 验证符号链接——ls 会跟随链接并列出目标的*内容*，这会让人误以为“链接已创建”，即使实际结果是在目标内部留下了一个杂项链接。
- 同步脚本使用共享的跨进程锁。这是必需的，因为用户经常会从 tmux 或多个终端中同时打开多个提供商窗口；并发启动必须对 Marketplace/缓存重写操作进行串行化，同时仍允许所有配置文件启动。
- 如需了解完整的本地源代码架构，请在修改这些脚本前阅读 `references/local-source-sync-architecture.md`。
- 提供商路由通过 `~/.claude/settings/<name>.json` 完成，该文件会为相应窗口设置 `ANTHROPIC_MODEL`、`ANTHROPIC_BASE_URL` 和 `ANTHROPIC_AUTH_TOKEN`。

## 一键设置工作流

当用户提出类似“设置 Claude Code 配置文件”或“我想在不同窗口中使用 Kimi 和 DeepSeek”的需求时：

1. **检查前置条件**
   - 已安装 `claude` CLI：`which claude`
   - Shell 是 zsh 或 bash：通过 `$SHELL` 检测
   - `python3` 可用

2. **安装配置文件管理器脚本——使用符号链接，不要复制**

   在已检出此仓库的机器上（维护者场景），运行随附的安装程序——它执行的操作与下方的手动方式完全相同：

   ```bash
   <absolute-path-to-this-repo>/daymade-claude-code/claude-switch-models-setup/scripts/setup.sh
   ```

   或者手动创建链接。`REPO` **必须是绝对路径**：如果使用相对路径，下方所有命令仍会成功执行并以 0 退出，但会留下五个悬空链接，导致 `csk` 和 LaunchAgent 无法工作，而且没有错误可供追查。

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

   这里明确列出五个路径，而不是使用通配符，这样阅读此文件时就能知道存在哪些脚本以及它们位于何处——`scripts/*.sh` 无法提供这些信息。无需执行 `chmod`：这五个文件提交时都已具有可执行权限，因此再次设置该权限只会产生文件模式变更，弄脏检出目录，之后这些变更还可能被带入其他人的提交。

   **为什么使用符号链接而不是 `cp`：** 实际运行的是 `~/.config/…` 中的内容——LaunchAgent 和 `claude-profile` 都通过该路径调用脚本——而此仓库保存的是它们的源文件。副本会逐渐产生偏差，而且已部署的副本与其源文件看起来并无区别，因此没有人能始终可靠地判断“我编辑的是不是单一事实来源（SSOT）”。在一台机器切换为符号链接之前进行的测量显示：一个锁位置修复已在仓库中存在了 26 天，但已部署的副本仍在运行它所修复的缺陷；而直接写入已部署副本的两个清理例程则根本没有进入版本控制——**两个方向都在悄无声息地产生偏差。** 符号链接可以同时消除这两种偏差，*前提是它始终保持为链接*——编辑器的原子保存操作、一次 `rsync` 或一次无意的 `cp` 都可能在没有任何提示的情况下将其重新变成普通文件，因此值得定期复查，而不是宣称问题已永久解决。这也使 `sync-local-skill-sources.py` 能够通过解析自身路径来定位其源仓库，而不必退回到猜测位置的方式。

   如何复查？任何定期检查方式都可以；此 Skill 未附带此类检查。一行命令即可，可在你通常存放此类检查的位置运行：

   ```bash
   for f in ~/.config/claude-switch-models-setup/*.py ~/.config/claude-switch-models-setup/*.sh; do
     [ -L "$f" ] && [ -e "$f" ] || echo "not a live link: $f"
   done
   ```

如果其中某个已变成真实文件，**请先将其移到一旁，再重新创建链接**——它可能
   包含其他任何地方都不存在的编辑内容，而这正是此处所描述的问题：
   `mv "$f" "$f.local-edits" && ln -sf <source> "$f"`，然后执行 diff。

   在**没有**该仓库的机器上，改为从此 skill 包中复制这五个脚本
   ——并且要接受这样一个事实：在你再次复制之前，仓库中的修复不会同步到这台机器。

3. **添加 shell 集成**
   - 在 `~/.zshrc` 或 `~/.bashrc` 中加载 profile manager
   - 添加别名：`csk`、`csks`、`csd`、`csg`、`css`、`cssp`
   - 告知用户运行 `source ~/.zshrc`（或打开一个新终端）

4. **生成 provider 设置文件**
   - 为用户需要的每个 provider 创建 `~/.claude/settings/<provider>.json`
   - 以 `assets/templates/` 中的模板为起点
   - 提示用户输入其 API key 和 base URL；**绝不要硬编码默认值**
   - 为这个特定 provider 正确设置上下文窗口——使用 `[1m]` 后缀，还是显式设置 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`/`CLAUDE_CODE_AUTO_COMPACT_WINDOW`，请参阅下文的“配置上下文窗口大小”。对每个新 profile 都要显式执行此操作，而不是照搬最接近的模板中碰巧已有的设置——最接近的模板不需要该设置，并不能证明这个 profile 也不需要。
   - 包含必需的隔离标志：
     - `CLAUDE_CODE_SUBAGENT_MODEL`（与 `ANTHROPIC_MODEL` 相同）
     - `ENABLE_TOOL_SEARCH: "false"`
     - `DISABLE_GROWTHBOOK: "1"`
     - `DISABLE_TELEMETRY: "1"`
     - `DISABLE_AUTOUPDATER: "1"`

5. **初始化 profile 目录**
   - 运行 `claude-profiles-init`
   - 这会创建包含隔离的 `.claude.json` 和符号链接的 `~/.claude-profiles/<provider>/`
   - 在维护者的机器上，这还会在同步插件元数据之前修复本地源符号链接

   **状态栏接线：**`claude-profiles-init` 会从
   `~/.claude/settings.json` 或 `~/.claude/statusline.sh` 自动检测状态栏脚本，并将其注入每个新的
   profile。如果两者都不存在，profile 仍可正常工作，但不会显示状态栏。**AI 有责任**
   判断用户是否需要状态栏，在适当情况下安装
   `statusline-generator` skill 并运行其安装程序——而不是由 profile
   设置脚本负责。不要在 shell 脚本中硬编码依赖项安装。

6. **注册设置收敛器**
   - 将 `~/.config/claude-switch-models-setup/sync-profile-settings.py` 作为 SessionStart hook 添加到**默认** profile 的 `~/.claude/settings.json` 的 `hooks.SessionStart` 列表中（当活动 profile 就是默认 profile 时，它不会执行任何操作；它在这里的职责是在首次同步时将自身传播到每个 profile 的 `hooks` 键中）
   - 运行初始对齐：`python3 ~/.config/claude-switch-models-setup/sync-profile-settings.py --all`
   - 此后，每个 profile 都会在每次会话启动时从默认 profile 收敛其 `settings.json`（更改将在下次会话生效）。仅审计而不写入：`--check --all`

7. **验证隔离**
   - 运行 `claude-profiles-doctor`
   - 确认每个 profile 目录都包含 `.claude.json` 和有效的符号链接

8. **为维护者安装自动本地源同步**
   - 普通学生或不编辑 Skill 源代码仓库的用户请跳过此步骤
   - 在维护者的 macOS 机器上，运行 `sync-local-skill-sources-daemon.sh --install`
   - 它会监视 Claude 的默认安装状态以及本地 Marketplace 清单，并在安装、卸载或插件拓扑发生变化后，自动修复 Claude/Codex 中已安装的副本

9. **向用户说明如何启动**
   - `csk` → Kimi K3 窗口
   - `csks` → Kimi K2.7 高速窗口
   - `csd` → DeepSeek 窗口
   - `csg` → GLM 窗口
   - `css` → StepFun 窗口
   - `cssp` → StepFun 付费/账户专用窗口（当 `step-pay.json` 存在时）
   - `claude`（无别名）→ 默认 Anthropic 配置

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
                               # Converge every profile's settings.json from the default
                               # profile (hooks, marketplaces, env flags, permissions,
                               # preferences); --check --all audits without writing
python3 ~/.config/claude-switch-models-setup/sync-local-skill-sources.py --apply
                               # Maintainers: one-shot repair for Claude/Codex source symlinks
~/.config/claude-switch-models-setup/sync-local-skill-sources-daemon.sh --install
                               # Maintainers: install automatic macOS watcher
```

这些并非日常使用的命令。通过符号链接，对源代码的常规编辑会实时生效。一次性命令用于修复、引导初始化，或没有 LaunchAgent 监视器的非 macOS 环境。

## 提供商模板

模板位于 `assets/templates/`：

- `minimax.json` — MiniMax-M3，全球端点，100 万上下文，自适应思考或禁用思考
- `minimax-cn.json` — MiniMax-M3，中国端点，100 万上下文，自适应思考或禁用思考
- `minimax-m2-7.json` — MiniMax-M2.7，全球端点，204800 token 上下文，始终启用思考
- `minimax-m2-7-cn.json` — MiniMax-M2.7，中国端点，204800 token 上下文，始终启用思考
- `kimi.json` — Kimi K3（通过 `[1m]` 标记启用 100 万上下文——请参阅下文的“配置上下文窗口大小”）
- `kimi-highspeed.json` — Kimi K2.7 高速版（旧版 200K 上下文）
- `glm.json`
- `deepseek.json`
- `stepfun.json`
- `anthropic.json`

每个模板都使用 `<API_KEY>` 占位符。可配置网关的模板还使用 `<BASE_URL>`；MiniMax 模板则固定使用文档中指定的区域端点。向用户询问每个占位符的实际值；除非用户明确提供，否则不要猜测或复用当前机器上的值。

### MiniMax 模型行为

| 模板 | 模型 | 上下文配置 | 思考行为 |
|---|---|---|---|
| `minimax.json`, `minimax-cn.json` | `MiniMax-M3` | 在每个路由模型值后追加 `[1m]`，并将 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 设置为 `1000000`。 | 支持自适应思考或禁用思考。保持 `ANTHROPIC_REASONING_MODEL` 使用同一模型。 |
| `minimax-m2-7.json`, `minimax-m2-7-cn.json` | `MiniMax-M2.7` | 将 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 和 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 设置为 `204800`；不要追加 `[1m]`。 | 思考始终开启；不要声称存在模板级禁用方式。 |

## 配置上下文窗口大小

每个提供商模板都会通过两种方式之一设置模型的上下文窗口——如果设置错误，Claude Code 就无法知道模型实际能容纳多少上下文。设置得过小，它会远早于提供商实际要求的时机进行压缩（总结并丢弃旧细节）；设置得过大，它则要等到实际限制已经被突破后才会压缩。

关于 `[1m]` 标记的完整客户端机制——它会从模型
字段中移除什么、向 `anthropic-beta` 标头添加什么，以及为什么缺少 `[1m]` 
*并不*意味着提供商无法容纳大型提示词——记录在
`references/context-window-config.md` 中。当上下文数值看起来有误时请查阅该文档，而不是在编写模板时查阅。

### 决策规则

编写新提供商的 `settings/<name>.json` 时，应根据提供商真实且经过验证的上下文窗口进行选择——不要根据模型的营销名称，也不要照搬碰巧最相近的模板所采用的配置：

| 提供商的真实上下文窗口 | 应设置的内容 | 示例模板 |
|---|---|---|
| 约 100 万 token，且已明确确认（不能根据模型的层级/名称推断） | 为每个 `ANTHROPIC_MODEL` / `ANTHROPIC_DEFAULT_*_MODEL` / `CLAUDE_CODE_SUBAGENT_MODEL` 值添加 `[1m]` 后缀。必须是完全一致的 4 个字符 `[1m]`——Claude Code 匹配的是这个字面字符串，而不是 `[1million]` 或 `[max]` 之类自造的标记。 | `kimi.json` |
| 已知的较小规模（例如 20 万） | 将 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 和/或 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 明确设置为真实数值——不使用 `[1m]`。 | `kimi-highspeed.json` (`200000`) |
| 未知/尚未验证 | 不要猜测，也不要仅仅因为模板中需要设置*某个值*，就照搬其他提供商的数值。应先让用户查阅提供商自己的文档/控制台。未经验证的 `[1m]` 或未经验证的较大 `CLAUDE_CODE_AUTO_COMPACT_WINDOW`，只会让故障从“过早压缩”变成“直到远远超出真实限制后仍不压缩”——后者更糟，因为在请求真正失败之前不会显现。 |

`deepseek.json` 和 `glm.json` **同时**设置了 `[1m]` 和显式的 `CLAUDE_CODE_AUTO_COMPACT_WINDOW: "1000000"`。这是双重保障，并不是应该删除的冗余填充——标记与显式覆盖之间的确切优先级尚未经过独立逆向分析，因此，如果你要复制这两个模板之一，应同时保留两者，而不是删除其中一个。

MiniMax-M3 模板使用相同的 100 万标记，并显式将自动压缩值设置为 `1000000`。MiniMax-M2.7 模板使用显式的 `204800` 限制，不使用标记。

完整的 step-2-16k 模板正确性实战记录（为什么一个看似内部一致的上下文值并不等同于当前正确的值——应对照提供商的最新文档核查模型名称，而不能只检查它周围的数字），以及一个可复用的验证方法，用于确认任意环境变量是否确实改变了通过网络发送的字节（使用本地 `http.server` 进行捕获，因为 `--debug api` 只显示内部状态），均位于 `references/context-window-config.md` 中。

### 常用基础 URL（请向你的提供商核实）

| 提供商 | 典型基础 URL |
|----------|------------------|
| Kimi     | `https://api.moonshot.cn` 或 OpenRouter 兼容端点 |
| GLM      | `https://open.bigmodel.cn/api/paas/v4` 或 OpenRouter 兼容端点 |
| DeepSeek | `https://api.deepseek.com` 或 OpenRouter 兼容端点 |
| StepFun  | `https://api.stepfun.com` 或 OpenRouter 兼容端点 |
| MiniMax  | 全球：`https://api.minimax.io/anthropic`；中国：`https://api.minimaxi.com/anthropic` |
| Anthropic| `https://api.anthropic.com` |

**重要：** 具体端点取决于用户是直接调用提供商，还是通过兼容性网关（例如 OpenRouter）调用。务必询问。

## 共享与隔离

| 数据 | 位置 | 是否共享？ |
|------|----------|---------|
| 会话历史记录 | `~/.claude-profiles/<name>/.claude.json` | **按配置档案隔离** |
| 身份验证令牌/缓存 | `~/.claude-profiles/<name>/.claude.json` | **按配置档案隔离** |
| Skills | `~/.claude/skills/` | 通过符号链接共享 |
| 插件内容 | `~/.claude/plugins/marketplaces`、`cache`、`data`、... | 通过符号链接共享 |
| 插件安装注册表 | `~/.claude/plugins/installed_plugins.json` | 通过符号链接共享 |
| 已启用插件映射 | `~/.claude/settings.json` -> `<profile>/settings.json` | 由 `sync-profile-settings.py` 收敛（也由 `claude-plugins-sync.py` 镜像） |
| 插件市场索引 | `<profile>/plugins/known_marketplaces.json` | **按配置档案隔离**（installLocation 特定于配置目录，无法共享） |
| 项目/记忆 | `~/.claude/projects/`、`~/.claude/memory/` | 通过符号链接共享 |
| Hook 脚本 | `~/.claude/hooks/`、`~/.claude/commands/` | 通过符号链接共享（仅限脚本——不包括注册信息） |
| `settings.json` 配置：Hook 注册、市场、环境标志、权限、偏好设置 | `<profile>/settings.json` | 会话启动时由 `sync-profile-settings.py` **从默认配置档案收敛**（`model` 等身份标识键以及提供商路由/隔离环境变量永远不会同步） |
| 提供商设置 | `~/.claude/settings/<name>.json` | 共享来源，按配置档案加载 |

## 故障排除

### 配置档案目录存在，但 claude-profiles-doctor 将其报告为“孤立配置档案”

症状：`claude-profiles-doctor` 报告
`WARN: orphan profile — no settings/<name>.json; claude-profile <name> fails. Run: claude-profile-rm <name>`。

原因：配置档案隔离目录存在于 `~/.claude-profiles/` 下，但缺少对应的 `~/.claude/settings/<name>.json` 提供商配置文件。`claude-profiles-init` 只扫描 `settings/*.json`，因此孤立配置档案的符号链接永远不会被创建或维护，并且 `claude-profile <name>` 将启动失败并显示 "Error: Settings file not found."。该配置档案目录中可能仍包含有用的按配置档案隔离的数据（`history.jsonl`、包含提供商凭据的 `.claude.json`、`settings.json`、Skill 工作区）。

修复方法：
- **如果不再需要该配置文件**：`claude-profile-rm <name>` — 此命令会安全地
  删除隔离目录（它会先检查是否存在非预期文件）。
- **如果想要恢复该配置文件**：在
  `~/.claude/settings/<name>.json` 处重新创建设置文件（使用
  `assets/templates/` 中的提供商模板），然后运行 `claude-profiles-init`。

### 共享目录（skills/projects/hooks/agents/...）显示为真实目录，而不是符号链接

症状：`claude-profiles-doctor` 报告
`<name> is a real directory (expected symlink to ~/.claude/<name>) — drift; run: claude-profiles-init --repair`。

原因：该配置文件是在符号链接收敛设计落地之前创建的（或是手动创建的），因此某个共享内容目录最终成为了每个配置文件独有的真实目录，而不是符号链接。该配置文件中的副本现在会悄无声息地偏离主 `~/.claude/` 副本——其中的 skills/projects/hooks/agents 与其他配置文件中的不再相同。失效符号链接检查无法发现此问题（真实目录不是失效链接）；在一台真实机器上，这种偏离数月都未被发现，直到加入了专门的真实目录检查（2026-07-21：在此检查出现之前创建的旧配置文件携带真实的 `projects/` 目录数月之久，却未被发现）。

修复方法（可逆——数据只会被归档，绝不会被删除）：

```bash
claude-profiles-init --repair
```

对于每个发生偏离的目录，此命令会先将真实目录归档到配置文件目录内的
`<name>.pre-symlink-bak-<timestamp>`，然后创建本应存在的符号链接。再次运行
`claude-profiles-doctor`，确认所有检查均正常。如果归档中包含你需要的数据，
它就保存在原处——没有任何内容被销毁。

关于共享内容的说明：修复后，该目录会指向主
`~/.claude/<name>` 副本，因此该配置文件将看到与默认配置文件相同的 skills/projects/etc.——这正是共享符号链接设计的全部意义所在。必须保持隔离的每配置文件状态（`.claude.json`、`settings.json` 中的身份标识键，如 `model`/提供商环境变量，以及 `plugins/known_marketplaces.json`）绝不会属于这些符号链接目录，因此修复操作绝不会触及这些状态。如果该配置文件中保存了你在意的会话/历史记录数据，请先检查归档再将其丢弃——这些数据现在会解析到共享副本。

### Marketplace 报告“corrupted installLocation”

症状：`/plugin` 或 `claude plugin marketplace update` 报告
`corrupted installLocation ... expected a path inside <config-dir>/plugins/marketplaces`。

原因：`known_marketplaces.json` 最终在多个配置文件之间被共享（或经过手动编辑）。它的
`installLocation` 特定于配置目录，因为 Claude 使用 `path.resolve()` 进行验证
（不会解析符号链接），所以一个共享副本无法同时满足多个配置文件。

修复方法：`claude-plugins-sync.py` 会重建每个配置文件各自的副本和共享内容
符号链接。它会在 `claude-profile` 初始化/启动时自动运行；如需手动运行：

```bash
python3 ~/.config/claude-switch-models-setup/claude-plugins-sync.py
```

### Skill 存在于默认 Claude 中，但在 Kimi/GLM/DeepSeek 中缺失

症状：默认 Anthropic 配置可以看到某个技能，但第三方配置无法看到。

原因：Claude Code 将 `enabledPlugins` 存储在每个配置目录的 `settings.json` 中。
仅共享 `plugins/cache` 只会让文件可用，并不会启用它们。

修复方法：

```bash
python3 ~/.config/claude-switch-models-setup/claude-plugins-sync.py
```

然后重启受影响的 Claude Code 窗口。

### 对本地源代码的编辑未在 Claude Code 或 Codex 中显示

症状：你在本地源代码仓库中编辑了某个技能，但 Claude Code 或 Codex 仍然加载旧的已安装副本。

预期设计：由于安装位置使用符号链接，对现有源文件的常规编辑会立即生效。现有的 Claude Code/Codex 会话可能仍需重启，因为技能元数据会在会话启动时加载。

如果是结构性编辑（新增插件、新增技能条目、版本升级、安装/卸载，或更改市场清单），macOS LaunchAgent 应会自动运行。检查：

```bash
launchctl print gui/$(id -u)/ai.daymade.claude-skill-source-sync
```

仅当监视器未安装或你使用的不是 macOS 设备时，才需要手动修复：

```bash
python3 ~/.config/claude-switch-models-setup/sync-local-skill-sources.py --apply
```

此操作会将现有的实际副本移动到带时间戳的 `.source-sync-backups/` 文件夹中，将其替换为指向源代码仓库的符号链接，并在技能从清单中移除后清理失效的托管符号链接。

它还会清理自身产生的文件，而早期版本不会这样做：

- **版本别名符号链接。** 每个缓存链接均以市场中的当前版本命名，因此每次版本升级都会遗留先前的链接，而这些链接指向完全相同的源目录。某个插件曾有六个版本目录，其中四个是同一源目录的别名。该流程现在会移除解析到同一源目录的同级链接；实际目录绝不会被改动，因为这些目录由 Claude Code 安装，并且活动会话可能仍通过 `.in_use` 持有它们。
- **`installed_plugins.json` 备份。** 每次运行只要更改了 JSON 就会写入一个备份，但此前没有任何机制移除它们——一个月的运行留下了 453 个文件。脚本中的 `KEEP_JSON_BACKUPS` 常量会限制保留的备份数量；文件名以 `YYYYMMDD-HHMMSS` 时间戳结尾，因此按字典顺序排列即为时间顺序。

在 `--apply` 修改任何内容之前，可以通过试运行看到这两项清理操作。

### 某个配置缺少钩子、市场、环境标志或其他默认配置设置

症状：默认配置已配置钩子防护、市场或功能标志，但第三方配置的表现却像它们不存在一样（没有触发 PreToolUse 防护、`claude plugin marketplace list` 为空、默认配置中已启用的功能处于关闭状态）。

原因：这些设置位于每个配置各自的 `settings.json` 中，而该文件仅属于对应的配置目录——对目录进行符号链接无法涵盖配置层，并且默认配置一旦发生更改，第三方配置就会在无提示的情况下与其产生偏差。

修复方法：

```bash
python3 ~/.config/claude-switch-models-setup/sync-profile-settings.py --all
```

然后重启受影响的窗口。一旦收敛器被注册为 SessionStart 钩子（设置步骤 6），每个配置文件都会在会话启动时自行收敛，因此只有在手动编辑设置并希望立即传播更改后，才需要执行此操作。

### 第三方配置文件尝试使用 Anthropic 特有功能

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

### 超大上下文提供商过早进行压缩/总结，或状态栏中的上下文数值看起来不正确

症状：某个提供商自己的文档声称支持约 100 万 token 的上下文，但 Claude Code 在远低于该上限时就进行了自动压缩——长会话明明还完全没有实际需要，却已被总结；或者状态栏中的上下文百分比变化看起来像是基于约 20 万 token 的模型，而不是真实上限。

原因：该配置文件的 `ANTHROPIC_MODEL`（以及同类的 `ANTHROPIC_DEFAULT_*_MODEL` / `CLAUDE_CODE_SUBAGENT_MODEL`）缺少 `[1m]` 标记。Claude Code 没有其他方式获知提供商的真实上下文大小——请求本身能够携带超大提示词成功执行，并不能向 Claude Code 提供任何相关信息，因为这是上游提供商的属性，而不是客户端的属性。完整机制请参阅 `references/context-window-config.md`。

修复：在该配置文件的 `settings.json` 中，为 `ANTHROPIC_MODEL`、每个 `ANTHROPIC_DEFAULT_*_MODEL` 以及 `CLAUDE_CODE_SUBAGENT_MODEL` 添加字面量后缀 `[1m]`（遵循 `kimi.json` 的模式）。重启受影响的窗口。

## 日后添加新提供商

1. 使用模板创建 `~/.claude/settings/<new-provider>.json`。
2. 检查并配置该提供商经过验证的真实上下文窗口——使用 `[1m]` 标记，或显式设置 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`/`CLAUDE_CODE_AUTO_COMPACT_WINDOW`；请参阅下文的“配置上下文窗口大小”和 `references/context-window-config.md`。不要仅仅因为复制的模板碰巧不需要此配置就跳过这一步。
3. 运行 `claude-profiles-init`。
4. 如有需要，在 shell rc 文件中添加别名。

## 安全说明

- API 密钥会以明文形式写入 `~/.claude/settings/<provider>.json`，与 Claude Code 存储 `ANTHROPIC_AUTH_TOKEN` 的方式相同。这与 Claude Code 自身的安全模型一致。
- 此 Skill 绝不会将密钥或设置上传到任何地方。
- 对于公开分发，捆绑的脚本不包含任何硬编码的密钥、端点或用户特定路径。

## 下一步

设置完成后，用户可以立即打开两个终端进行测试：在一个终端中运行 `csk`（Kimi K3），在另一个终端中运行 `csd`。每个窗口彼此独立。