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

此技能为 Claude Code CLI 创建一个隔离但共享的配置文件系统。每个配置文件都有自己的 `.claude.json` 状态文件（凭据和会话历史），同时在所有配置文件之间共享技能、项目、钩子脚本、代理和已安装插件状态——并使每个配置文件的 `settings.json`（钩子注册、市场、env 功能标志、权限、偏好设置）以及其 **`.claude.json` 的行为部分**（例如 `workflowSizeGuideline`）与默认配置文件保持一致，因此配置文件之间唯一预期的差异就是模型/提供商。

最终效果是：你可以在一个终端中使用 Kimi，在另一个终端中使用 DeepSeek，在另一个终端中使用 Anthropic——每个终端都运行一个完全独立的 Claude Code 进程，不会发生配置串扰。

## 工作原理

- `CLAUDE_CONFIG_DIR` 告诉 Claude Code CLI 使用哪个目录作为配置根目录。
- 每个配置文件位于 `~/.claude-profiles/<name>/`，并拥有一个隔离的 `.claude.json`。
- 内容目录（`skills/`、`projects/`、`hooks/`、`agents/`、`settings/`）都会符号链接回主 `~/.claude/` 目录，因此只需维护一份副本。注意，这里共享的是钩子**脚本**，而不是钩子**注册信息**——注册信息位于每个配置文件自己的 `settings.json` 中（见下一条）。
- **配置层——`settings.json`：** 每个配置文件都有自己的 `settings.json`（Claude Code 将其视为配置目录本地文件），因此其中存储的所有内容——钩子注册、`extraKnownMarketplaces`、`enabledPlugins`、`env` 功能标志、`permissions`、行为偏好——一旦默认配置文件发生变化，就会悄悄产生偏差（截至 2026-07-18 的测量结果：9/9 个真实配置文件都没有钩子注册）。`sync-profile-settings.py` 就是用于收敛这些差异的脚本：它被注册为 SessionStart 钩子，将默认配置文件 `settings.json` 中的每个键复制到活动配置文件中，但身份键除外（顶层的 `model` 和 `advisorModel`——后者用于 Anthropic 模型路由，而第三方端点无法提供该模型；以及携带提供商路由信息或 Anthropic 原生隔离设置的环境变量——`ANTHROPIC_*`、`CLAUDE_CODE_SUBAGENT_MODEL`、`ENABLE_TOOL_SEARCH`、`DISABLE_GROWTHBOOK/TELEMETRY/AUTOUPDATER`——这些变量会由提供商设置文件有意设置为不同值）。配置文件专属的**顶层**键会被保留；某个主配置文件也拥有的键中的嵌套集合（例如 `permissions.allow`、`enabledPlugins`）会整体收敛到主配置文件的值，而通过这种方式被删除的配置文件专属嵌套条目会被列出（写入时统计数量，`--check` 下显示详情），使丢失内容可见而不是悄无声息。这正是“除模型外，所有配置在每个配置文件中都能正常工作”真正成立的原因。
- **状态层——`.claude.json` 行为键：** `settings.json` 并不是唯一的每配置文件配置文件。Claude Code 还会维护一个每配置文件的状态文件（主配置文件的是 `~/.claude.json`；每个第三方配置文件的是 `<profile>/.claude.json`——路径并不对称，已在磁盘上验证），并且少量**行为**设置只存在于其中（`workflowSizeGuideline`、通知/UI 偏好）。截至 2026-08-17，只有主配置文件中存在 `workflowSizeGuideline: small`，而 10/11 个第三方配置文件没有副本——一次 Kimi 会话在系统提示中没有任何规模指导的情况下，将一个 Dynamic Workflow 扩展到了 30 多个代理。相同的收敛脚本因此还会将一个**行为键允许列表**同步到每个配置文件的 `.claude.json` 中。安全机制是脚本中的三向分类器，而不是手工维护的键列表：允许列表中的行为键会被同步；状态/缓存/计数器/迁移/凭据键（通过名称模式匹配）永不触碰；任何未知且不同的键都会被**报告——每次运行中每个产生偏差的键占一行，直到人工对其分类**（这是一个触发器，能在下一个行为键出现当天将其暴露出来）。写入采用备份 + 原子替换；经测量，在活动 harness 重写文件的情况下是安全的（一个标记键在活动会话中存活了 30 多分钟）。该设置会在下一次会话中生效——harness 会在启动时读取此文件。
- **例外——`plugins/`：** 市场内容和安装状态是共享的，但每个配置文件保留自己的 `known_marketplaces.json`。Claude 使用 `path.resolve()` 验证市场的 `installLocation`（该函数**不会**解析符号链接），因此单个共享文件会导致每个不执行写入的配置文件都报告“损坏的 installLocation”。`claude-plugins-sync.py` 会构建并维护这一按配置文件划分的结构。
- `claude-plugins-sync.py` 还会将默认 `~/.claude/settings.json` 中的 `enabledPlugins` 镜像到每个配置文件的 `settings.json` 中（仅共享缓存文件还不够；Claude Code 将“已启用”状态视为配置目录本地状态）。上面的 SessionStart 收敛脚本会将同一个键作为整个设置同步的一部分进行处理；`claude-plugins-sync.py` 仍然负责维护每个配置文件的 `known_marketplaces.json` 结构。
- 本地源同步在维护者机器上会自动进行。已安装的 Claude 插件缓存目录以及 Codex/agents 技能副本都会符号链接到源代码仓库，因此正常的源代码编辑会立即生效。`sync-local-skill-sources.py` 是幂等的修复原语；`claude-profile` init/launch 会自动运行它，而 `sync-local-skill-sources-daemon.sh --install` 会安装一个 macOS LaunchAgent，用于监视默认 Claude 安装状态以及本地市场清单的结构变化。当某个技能从市场清单中移除时，同一修复过程只会清理指向受管理源代码仓库的过时 Codex/agents 符号链接、插件缓存中已被替代的版本别名符号链接，以及除最新的 `KEEP_JSON_BACKUPS` 个 `installed_plugins.json` 副本之外的所有副本；它绝不会删除真实的技能目录。
  - **守护进程管理的符号链接的陷阱**（均于 2026-07 观察到）：① 不要手动创建指向守护进程管理目录的符号链接（`ln -s <repo>/<skill> ~/.codex/skills/<skill>`）——如果守护进程已经创建了该链接，BSD `ln` 会将新链接放到目标目录**内部**，留下一个目录遍历可能递归进入的自引用 `<skill>/<skill>` 残留；只有在 `readlink` 确认链接缺失后，或直接使用 `ln -sfn`，才能手动修复。② 使用 `readlink` 而不是 `ls -la <link>` 验证符号链接——`ls` 会跟随链接并列出目标的**内容**，即使实际结果是目标内部出现了残留，也会看起来像是“链接已创建”。
- 同步脚本使用跨进程共享锁。这是必要的，因为用户经常会通过 tmux 或多个终端同时打开多个提供商窗口；并发启动时必须串行执行市场/缓存重写，同时仍允许所有配置文件启动。
- 如需了解完整的本地源架构，请在修改这些脚本之前阅读 `references/local-source-sync-architecture.md`。
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

   或者手动创建链接。`REPO` **必须是绝对路径**：如果使用相对路径，下面的每条命令仍会成功并以 0 退出，但会留下五个失效链接，导致 `csk` 和 LaunchAgent 出错，而且没有可供追踪的错误信息。

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

   这里逐一写出这五个路径，而不是使用 glob，这样阅读此文件时就能知道有哪些脚本以及它们位于何处 — `scripts/*.sh` 做不到这一点。不需要执行 `chmod`：这五个文件在提交时都已具有可执行权限，再次设置该权限只会让检出目录产生模式变更，随后这些变更还可能被带入其他人的提交中。

   **为什么使用符号链接而不是 `cp`：** 实际运行的是 `~/.config/…` 中的内容 — LaunchAgent 和 `claude-profile` 都通过该路径调用脚本 — 而此仓库存放的是它们的源文件。复制出来的文件会逐渐偏离源文件，并且已部署副本与源文件在外观上没有任何区别，因此“我编辑的是 SSOT 吗？”并不是任何人都能可靠判断的问题。在切换之前对一台机器进行的测量显示：一个锁位置修复在仓库中放了 26 天，而已部署的副本仍在运行那个已经修复的 bug；另外，两个直接写入已部署副本的清理例程从未进入版本控制 — **两个方向上的偏离，而且是静默发生的。** 链接可以消除这两种偏离，*只要它一直是链接* — 原子保存编辑器、`rsync` 或一次误操作的 `cp` 都可能在不提示的情况下把它变回普通文件，这就是为什么值得重新检查，而不是宣布问题已经解决。它还允许 `sync-local-skill-sources.py` 通过解析自身路径来定位源代码仓库，而不是退回到猜测。

   如何值得重新检查？任何定期检查方式都可以；此 skill 没有捆绑任何检查机制。下面这一行可以在你存放此类检查的位置运行：

   ```bash
   for f in ~/.config/claude-switch-models-setup/*.py ~/.config/claude-switch-models-setup/*.sh; do
     [ -L "$f" ] && [ -e "$f" ] || echo "not a live link: $f"
   done
   ```

如果其中某个已经变成了真实文件，**请在重新创建链接前将其移到一旁** — 它可能包含其他任何地方都没有的编辑内容，而这正是这里所描述的整个问题：`mv "$f" "$f.local-edits" && ln -sf <source> "$f"`，然后进行差异比较。

   在**没有该仓库**的机器上，请改为从此 skill bundle 中复制出这五个脚本 — 并接受这样一个事实：在你再次复制之前，仓库中的修复不会同步到该机器。

3. **添加 shell 集成**
   - 在 `~/.zshrc` 或 `~/.bashrc` 中加载 profile manager
   - 添加别名：`csk`、`csks`、`csd`、`csg`、`css`、`cssp`
   - 告知用户运行 `source ~/.zshrc`（或打开一个新终端）

4. **生成 provider 设置文件**
   - 对于用户想要使用的每个 provider，创建 `~/.claude/settings/<provider>.json`
   - 使用 `assets/templates/` 中的模板作为起点
   - 提示用户输入其 API key 和 base URL；**绝不要硬编码默认值**
   - 正确设置此特定 provider 的上下文窗口 — 使用 `[1m]` 后缀，还是显式设置 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`/`CLAUDE_CODE_AUTO_COMPACT_WINDOW`，请参见下方的“配置上下文窗口大小”。每个新 profile 都要明确执行此操作，不要照搬最近模板中已有的设置 — 最近的模板不需要该设置，并不能证明当前这个模板也不需要。
   - 包含所需的隔离标志：
     - `CLAUDE_CODE_SUBAGENT_MODEL`（与 `ANTHROPIC_MODEL` 相同）
     - `ENABLE_TOOL_SEARCH: "false"`
     - `DISABLE_GROWTHBOOK: "1"`
     - `DISABLE_TELEMETRY: "1"`
     - `DISABLE_AUTOUPDATER: "1"`

5. **初始化 profile 目录**
   - 运行 `claude-profiles-init`
   - 这会创建包含隔离的 `.claude.json` 和符号链接的 `~/.claude-profiles/<provider>/`
   - 在维护者机器上，这还会在同步插件元数据之前修复本地源符号链接

   **状态栏连接：** `claude-profiles-init` 会自动从
   `~/.claude/settings.json` 或 `~/.claude/statusline.sh` 中检测状态栏脚本，并将其注入每个新 profile。如果两者都不存在，profile 仍可正常工作，但不会显示状态栏。**是否需要状态栏、是否应安装 `statusline-generator` skill 以及运行其安装程序，应由 AI 决定** — 不要将依赖安装硬编码到 shell 脚本中。

6. **注册设置合并器**
   - 将 `~/.config/claude-switch-models-setup/sync-profile-settings.py` 作为 SessionStart hook 添加到**默认** profile 的 `~/.claude/settings.json` 的 `hooks.SessionStart` 列表中（当当前 profile **就是**默认 profile 时，它不会执行任何操作；它在此处的作用是在第一次同步时，将其传播到每个 profile 自身的 `hooks` 键中）
   - 运行初始对齐：`python3 ~/.config/claude-switch-models-setup/sync-profile-settings.py --all`
   - 从此以后，每个 profile 都会在每次会话开始时，将其 `settings.json` 以及 `.claude.json` 中的行为部分与默认 profile 进行合并（更改将在下一次会话中生效）。仅审计而不写入：`--check --all`

7. **验证隔离**
   - 运行 `claude-profiles-doctor`
   - 确认每个 profile 目录都包含 `.claude.json` 和有效的符号链接

8. **为维护者安装自动本地源同步**
   - 普通学生或不编辑技能源代码仓库的用户可跳过此步骤
   - 在维护者的 macOS 设备上运行 `sync-local-skill-sources-daemon.sh --install`
   - 此工具会监视默认 Claude 安装状态以及本地 marketplace 清单，并在安装/卸载或插件拓扑发生变化后，自动修复 Claude/Codex 的已安装副本

9. **向用户展示启动方式**
   - `csk` → Kimi K3 窗口
   - `csks` → Kimi K2.7 highspeed 窗口
   - `csd` → DeepSeek 窗口
   - `csg` → GLM 窗口
   - `css` → StepFun 窗口
   - `cssp` → StepFun 付费/特定账户窗口（当存在 `step-pay.json` 时）
   - `claude`（无别名）→ 默认 Anthropic 配置

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
                               # Maintainers: one-shot repair for Claude/Codex source symlinks
~/.config/claude-switch-models-setup/sync-local-skill-sources-daemon.sh --install
                               # Maintainers: install automatic macOS watcher
```

这些不是日常使用的命令。正常的源代码编辑会通过符号链接即时生效。一次性命令用于修复、引导设置，或在没有 LaunchAgent 监视器的非 macOS 环境中使用。

## 提供商模板

模板位于 `assets/templates/`：

- `minimax.json` — MiniMax-M3，全局端点，1M 上下文，自适应思考或禁用思考
- `minimax-cn.json` — MiniMax-M3，中国端点，1M 上下文，自适应思考或禁用思考
- `minimax-m2-7.json` — MiniMax-M2.7，全局端点，204800-token 上下文，始终启用思考
- `minimax-m2-7-cn.json` — MiniMax-M2.7，中国端点，204800-token 上下文，始终启用思考
- `kimi.json` — Kimi K3（通过 `[1m]` 标记实现 1M 上下文——参见下方的“配置上下文窗口大小”）
- `kimi-highspeed.json` — Kimi K2.7 highspeed（旧版 200K 上下文）
- `glm.json`
- `deepseek.json`
- `stepfun.json`
- `anthropic.json`

每个模板都使用 `<API_KEY>` 占位符。可配置网关的模板还使用 `<BASE_URL>`；MiniMax 模板固定使用文档中所述的区域端点。要求用户提供每个真实的占位符值；除非用户明确提供，否则不要猜测或复用当前机器上的值。

### MiniMax 模型行为

| 模板 | 模型 | 上下文配置 | 思考行为 |
|---|---|---|---|
| `minimax.json`, `minimax-cn.json` | `MiniMax-M3` | 在每个路由模型值后追加 `[1m]`，并将 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 设置为 `1000000`。 | 支持自适应思考或禁用思考。保持 `ANTHROPIC_REASONING_MODEL` 使用同一模型。 |
| `minimax-m2-7.json`, `minimax-m2-7-cn.json` | `MiniMax-M2.7` | 将 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 和 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 设置为 `204800`；不要追加 `[1m]`。 | 思考始终开启；不要声称存在模板级别的禁用路径。 |

## 配置上下文窗口大小

每个提供商模板都通过两种方式之一设置模型的上下文窗口——如果弄错了，Claude Code 就不知道模型实际可以容纳多少上下文。设置过小会导致它比提供商实际要求的时间点更早进行压缩（总结并丢弃旧细节）；设置过大则会等到已经超过真实限制后才进行压缩。

客户端处理 `[1m]` 标记的完整机制——包括它会从模型字段中移除什么、会向 `anthropic-beta` 标头中添加什么，以及缺少 `[1m]` *并不意味着*提供商无法容纳较大的提示词——已记录在 `references/context-window-config.md` 中。当上下文数值看起来不正确时，请查阅该文档，而不是在编写模板时查阅。

### 决策规则

编写新的 `settings/<name>.json` 时，应根据提供商真实且经过验证的上下文窗口进行选择——不要根据模型的营销名称，也不要照搬最近的模板碰巧采用的配置：

| 提供商的真实上下文窗口 | 应设置的内容 | 示例模板 |
|---|---|---|
| 约 1M 个 token，已明确确认（不是根据模型的等级/名称推断） | 在每个 `ANTHROPIC_MODEL` / `ANTHROPIC_DEFAULT_*_MODEL` / `CLAUDE_CODE_SUBAGENT_MODEL` 值后添加 `[1m]` 后缀。必须是准确的 4 个字符 `[1m]`——Claude Code 匹配的是这个字面字符串，而不是像 `[1million]` 或 `[max]` 这样的自造标记。 | `kimi.json` |
| 已知的较小大小（例如 200K） | 将 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 和/或 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 显式设置为真实数值——不要使用 `[1m]`。 | `kimi-highspeed.json` (`200000`) |
| 未知/尚未验证 | 不要猜测，也不要仅仅因为模板需要*某个*值，就照搬其他提供商的数值。先要求用户查看提供商自己的文档/控制台进行确认。未经验证的 `[1m]` 或未经验证的较大 `CLAUDE_CODE_AUTO_COMPACT_WINDOW`，只会将问题从“过早压缩”转变为“直到远远超过真实限制后才压缩”——这更糟糕，因为只有请求实际失败时才会暴露问题。 |

`deepseek.json` 和 `glm.json` 同时设置了 **`[1m]`** 和显式的 `CLAUDE_CODE_AUTO_COMPACT_WINDOW: "1000000"`。这是双重保险，并不是可以删掉的冗余填充——标记与显式覆盖之间的确切优先级尚未经过独立逆向分析，因此如果你要复制这两个模板中的任意一个，请保留两者，不要删除其中一个。

MiniMax-M3 模板使用相同的 1M 标记，并显式设置 `1000000` 的自动压缩值。MiniMax-M2.7 模板使用显式的 `204800` 限制，不包含标记。

完整的 step-2-16k 模板正确性实战复盘（为什么一个看起来内部一致的上下文值，并不等同于当前正确的值——应将模型名称与提供商的实时文档进行交叉核对，而不只是查看它周围的数字），以及一套可复用的验证方法，用于确认某个环境变量是否确实改变了通过网络发送的字节内容（使用本地 `http.server` 捕获，因为 `--debug api` 只显示内部状态），都位于 `references/context-window-config.md` 中。

### 常见基础 URL（请向提供商核实）

| 提供商 | 典型基础 URL |
|----------|------------------|
| Kimi     | `https://api.moonshot.cn` 或兼容 OpenRouter 的端点 |
| GLM      | `https://open.bigmodel.cn/api/paas/v4` 或兼容 OpenRouter 的端点 |
| DeepSeek | `https://api.deepseek.com` 或兼容 OpenRouter 的端点 |
| StepFun  | `https://api.stepfun.com` 或兼容 OpenRouter 的端点 |
| MiniMax  | 全球：`https://api.minimax.io/anthropic`；中国：`https://api.minimaxi.com/anthropic` |
| Anthropic| `https://api.anthropic.com` |

**重要：** 确切的端点取决于用户是直接调用提供商，还是通过兼容性网关（例如 OpenRouter）调用。务必询问。

## 共享与隔离

| 数据 | 位置 | 是否共享？ |
|------|----------|---------|
| 会话历史 | `~/.claude-profiles/<name>/.claude.json` | **按配置文件隔离** |
| 身份验证令牌/缓存 | `~/.claude-profiles/<name>/.claude.json` | **按配置文件隔离** |
| Skills | `~/.claude/skills/` | 通过符号链接共享 |
| 插件内容 | `~/.claude/plugins/marketplaces`、`cache`、`data` 等 | 通过符号链接共享 |
| 插件安装注册表 | `~/.claude/plugins/installed_plugins.json` | 通过符号链接共享 |
| 已启用插件映射 | `~/.claude/settings.json` -> `<profile>/settings.json` | 由 `sync-profile-settings.py` 收敛（也由 `claude-plugins-sync.py` 镜像同步） |
| 插件市场索引 | `<profile>/plugins/known_marketplaces.json` | **按配置文件区分**（`installLocation` 与配置目录相关，无法共享） |
| 项目/记忆 | `~/.claude/projects/`、`~/.claude/memory/` | 通过符号链接共享 |
| Hook 脚本 | `~/.claude/hooks/`、`~/.claude/commands/` | 通过符号链接共享（仅脚本——**不包括注册信息**） |
| `settings.json` 配置：Hook 注册、市场、环境标志、权限、偏好设置 | `<profile>/settings.json` | 在会话开始时由 `sync-profile-settings.py` **从默认配置文件收敛**（`model` 等身份键以及提供商路由/隔离环境变量永不进行同步） |
| `.claude.json` 行为键（`workflowSizeGuideline`、通知/UI 偏好设置） | `~/.claude.json` → `<profile>/.claude.json` | 由同一脚本**按行为允许列表收敛**；状态/缓存/计数器/迁移/凭据键（包括 `projects`、`oauthAccount`、`userID`）永不进行同步；未知的漂移键会报告给人工进行分类 |
| 提供商设置 | `~/.claude/settings/<name>.json` | 共享源，按配置文件加载 |

## 故障排除

### 配置文件目录存在，但 claude-profiles-doctor 将其报告为“孤立配置文件”

症状：`claude-profiles-doctor` 报告
`WARN: orphan profile — no settings/<name>.json; claude-profile <name> fails. Run: claude-profile-rm <name>`。

原因：配置文件隔离目录存在于 `~/.claude-profiles/` 下，但对应的
`~/.claude/settings/<name>.json` provider 配置文件缺失。`claude-profiles-init` 只扫描
`settings/*.json`，因此孤立配置文件的符号链接从未被创建或维护，并且
`claude-profile <name>` 将因“Error: Settings file not found.”而无法启动。配置文件目录中可能仍包含有用的每个配置文件数据（`history.jsonl`、带有 provider 凭据的 `.claude.json`、`settings.json`、skill 工作区）。

修复：
- **如果不再需要该配置文件**：`claude-profile-rm <name>` — 这会安全地移除隔离目录（在移除前会检查是否存在意外文件）。
- **如果想要恢复它**：在 `~/.claude/settings/<name>.json` 创建设置文件（使用 `assets/templates/` 中的 provider 模板），然后运行 `claude-profiles-init`。

### 共享目录（skills/projects/hooks/agents/...）显示为真实目录，而不是符号链接

症状：`claude-profiles-doctor` 报告
`<name> is a real directory (expected symlink to ~/.claude/<name>) — drift; run: claude-profiles-init --repair`。

原因：该配置文件是在符号链接收敛设计落地之前创建的（或者是手动创建的），因此共享内容目录最终成为了真实的每个配置文件目录，而不是符号链接。现在该配置文件中的副本会与主 `~/.claude/` 副本悄然分叉——它的 skills/projects/hooks/agents 与其他所有配置文件中的并不相同。损坏符号链接检查无法发现这一点（真实目录不是损坏的链接）；在真实机器上，这种偏差持续了数月都未被发现，直到专门的真实目录检查被添加（2026-07-21：在此检查存在之前创建的旧配置文件携带真实的 `projects/` 目录数月之久而未被发现）。

修复（可逆——数据会被归档，绝不会删除）：

```bash
claude-profiles-init --repair
```

对于每个存在偏差的目录，该命令会将真实目录归档为配置文件目录中的
`<name>.pre-symlink-bak-<timestamp>`，然后创建本应存在的符号链接。再次运行 `claude-profiles-doctor`，确认检查结果正常。如果归档中有你需要的数据，它就在原处——没有任何内容被销毁。

关于哪些内容会被共享的说明：修复后，该目录会指向主
`~/.claude/<name>` 副本，因此该配置文件会看到与默认配置文件相同的 skills/projects/etc.——这正是共享符号链接设计的全部目的。必须保持隔离的每个配置文件状态（`.claude.json`、`settings.json` 中的 identity keys，如 `model`/provider env、`plugins/known_marketplaces.json`）从来都不是这些符号链接目录之一，因此修复不会触及它们。如果配置文件中保存了你关心的会话/历史数据，请在丢弃归档前进行检查——这些数据现在会解析到共享副本。

### Marketplace 显示“corrupted installLocation”

症状：`/plugin` 或 `claude plugin marketplace update` 报告
`corrupted installLocation ... expected a path inside <config-dir>/plugins/marketplaces`。

原因：`known_marketplaces.json` 在多个配置 profile 之间被共享（或被手动编辑）。其中的
`installLocation` 与配置目录相关，因为 Claude 使用 `path.resolve()` 进行验证（不会解析符号链接），因此同一份共享副本无法满足多个 profile。

修复：`claude-plugins-sync.py` 会为每个 profile 重新构建其独立副本，以及共享内容的符号链接。它会在 `claude-profile` 初始化/启动时自动运行；如需手动运行：

```bash
python3 ~/.config/claude-switch-models-setup/claude-plugins-sync.py
```

### Skill 在默认 Claude 中存在，但在 Kimi/GLM/DeepSeek 中缺失

症状：默认 Anthropic profile 可以看到某个 skill，但第三方 profile 无法看到。

原因：Claude Code 将 `enabledPlugins` 存储在每个配置目录的 `settings.json` 中。
共享 `plugins/cache` 只会使文件可用，并不会启用它们。

修复：

```bash
python3 ~/.config/claude-switch-models-setup/claude-plugins-sync.py
```

然后重启受影响的 Claude Code 窗口。

### 本地源文件的修改未在 Claude Code 或 Codex 中显示

症状：你在本地源代码仓库中编辑了某个 skill，但 Claude Code 或 Codex 仍然加载旧的已安装副本。

预期设计：对现有源文件进行的普通编辑会立即生效，因为已安装位置是符号链接。现有的 Claude Code/Codex 会话可能仍需要重启，因为 skill 元数据会在会话启动时加载。

如果修改属于结构性变更（新增 plugin、新增 skill 条目、版本升级、安装/卸载，或 marketplace 清单变更），macOS LaunchAgent 应会自动运行。检查：

```bash
launchctl print gui/$(id -u)/ai.daymade.claude-skill-source-sync
```

仅当 watcher 未安装，或你使用的是非 macOS 机器时，才需手动修复：

```bash
python3 ~/.config/claude-switch-models-setup/sync-local-skill-sources.py --apply
```

此操作会将现有的真实副本移入带时间戳的 `.source-sync-backups/` 文件夹，用指向源代码仓库的符号链接替换它们，并在某个 skill 从清单中移除后清理过时的受管符号链接。

它还会自行清理，而早期版本不会：

- **版本别名符号链接。** 每个缓存链接都以 marketplace 的当前版本命名，因此每次版本升级都会遗留上一个指向完全相同源目录的链接。某个 plugin 曾有六个版本目录，其中四个是同一源的别名。现在该流程会移除解析到相同源的同级链接；真实目录永远不会被触碰，因为这些目录由 Claude Code 安装，而运行中的会话可能仍会通过 `.in_use` 持有它们。
- **`installed_plugins.json` 备份。** 每次修改 JSON 的运行都会写入一个备份，而此前没有任何机制移除它们——运行一个月后留下了 453 个文件。脚本中的 `KEEP_JSON_BACKUPS` 常量会限制保留的备份数量；文件名以 `YYYYMMDD-HHMMSS` 时间戳结尾，因此按字典序排列即为时间顺序。

两者都会在 `--apply` 执行任何更改之前的 dry run 中显示。

### 某个配置档缺少钩子、市场、环境标志或其他默认配置档设置

症状：默认配置档已配置钩子防护、市场或功能标志，但第三方配置档的行为却像这些设置不存在一样（没有触发任何 PreToolUse 防护，`claude plugin marketplace list` 为空，默认配置档中启用的功能处于关闭状态）。

**同胞症状，不同层级（2026-08-17）：**在默认配置档上设置的行为偏好——例如工作流大小指南——对第三方配置档没有影响（Kimi 会话将一个 Dynamic Workflow 扩展到了 30 多个代理，而主配置档中设置的是 `small`）。该键位于每个配置档的 `.claude.json` 中，而符号链接和 settings.json 同步都无法覆盖它。请参阅 `references/troubleshooting.md` 中的“默认配置档行为设置无法传递到第三方配置档”。

原因：这些设置位于每个配置档自己的 `settings.json` 中，而该文件位于配置目录本地——为目录创建符号链接无法覆盖配置层，并且默认配置档一旦发生更改，这些设置就会悄无声息地产生偏差。

修复：

```bash
python3 ~/.config/claude-switch-models-setup/sync-profile-settings.py --all
```

然后重启受影响的窗口。一旦将 converger 注册为 SessionStart 钩子（设置步骤 6），每个配置档都会在会话开始时自行收敛，因此只有在你手动编辑设置并希望立即传播时，才需要执行此操作。

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

### 子代理调用回退到了其他模型

症状：Kimi 窗口中的子代理调用了 `claude-opus-4-7`。  
修复：在该配置档的 `settings.json` 中，将 `CLAUDE_CODE_SUBAGENT_MODEL` 设置为与 `ANTHROPIC_MODEL` 相同的值。

### 超大上下文提供商过早进行压缩/摘要，或状态栏中的上下文数字看起来不正确

症状：某个提供商自身文档声称支持约 1M token 的上下文，但 Claude Code 却在远低于该容量时自动进行上下文压缩——长会话在显然还没有实际必要时就被摘要，或者状态栏中的上下文百分比表现得像是在参考一个约 200K 的模型，而不是实际的上限。

原因：配置档中的 `ANTHROPIC_MODEL`（以及其 `ANTHROPIC_DEFAULT_*_MODEL` / `CLAUDE_CODE_SUBAGENT_MODEL` 同类项）缺少 `[1m]` 标记。Claude Code 没有其他方式得知提供商的实际上下文大小——请求本身能够成功处理超大提示词，并不能让 Claude Code 获知任何信息，因为这是上游提供商的属性，而不是客户端的属性。完整机制请参阅 `references/context-window-config.md`。

修复：在配置档的 `settings.json` 中，为 `ANTHROPIC_MODEL`、每个 `ANTHROPIC_DEFAULT_*_MODEL` 以及 `CLAUDE_CODE_SUBAGENT_MODEL` 添加字面量 `[1m]` 后缀（遵循 `kimi.json` 的模式）。重启受影响的窗口。

## 稍后添加新提供商

1. 使用模板创建 `~/.claude/settings/<new-provider>.json`。
2. 检查提供商真实且经过验证的上下文窗口，并进行配置 — `[1m]` 标记或明确设置 `CLAUDE_CODE_MAX_CONTEXT_TOKENS`/`CLAUDE_CODE_AUTO_COMPACT_WINDOW`，请参阅下方的“配置上下文窗口大小”和 `references/context-window-config.md`。不要因为所复制的模板碰巧不需要配置就跳过此步骤。
3. 运行 `claude-profiles-init`。
4. 如有需要，将别名添加到 shell rc 文件中。

## 安全说明

- API 密钥以明文形式写入 `~/.claude/settings/<provider>.json`，与 Claude Code 存储 `ANTHROPIC_AUTH_TOKEN` 的方式相同。这与 Claude Code 自身的安全模型一致。
- 此 skill 绝不会将密钥或设置上传到任何地方。
- 对于公开分发，随附的脚本不包含硬编码的机密、端点或用户特定路径。

## 下一步

设置完成后，用户可以立即通过打开两个终端进行测试：在一个终端中运行 `csk`（Kimi K3），在另一个终端中运行 `csd`。每个窗口彼此独立。