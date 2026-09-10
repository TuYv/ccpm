---
name: aeon
description: Set up and run an Aeon agent instance — get started from scratch, pick which skills to turn on or install more from packs, reschedule or change what runs, edit what an existing skill does, fix a skill that isn't firing, set the STRATEGY.md north star and soul/ voice, turn a coding-agent chat into a scheduled Aeon skill, and mine past coding-agent conversations for recurring work worth automating as a skill. Use when the user mentions Aeon, aeon.yml, an Aeon skill / instance / routine / pack, asks to schedule, enable, edit, or debug an agent that runs on a cron, or asks what of their repeated/manual work Aeon could take over.
---
# Aeon

Aeon 是一个通过 Actions 运行在用户自己 GitHub 仓库中的代理。Skill 是一个 Markdown 文件（`skills/<name>/SKILL.md`）；`aeon.yml` 规定哪些 Skill 在什么时候运行。

选择他们所需的模式：

| | |
|---|---|
| **1 · 开始** | 尚无实例，或从头开始设置一个实例 |
| **2 · 重新安排** | 更改时间、频率，或 Skill 的关注重点 |
| **3 · 解除阻塞** | “它没有运行”/“什么都没发生” |
| **4 · 对话 → Skill** | 将我们刚刚完成的工作转换为定时运行的 Skill |
| **5 · 编辑 Skill** | 更改现有 Skill 的行为 |
| **6 · 启用哪些功能** | 选择 Skill、浏览功能包、安装更多内容 |
| **7 · 策略与语气** | `STRATEGY.md` 和 `soul/` — 指导方向与表达语气 |
| **8 · 从历史记录挖掘 → Skill** | “我反复进行的哪些工作可以交给 Aeon？”— 从过去与编码代理的对话中找出这些工作 |

## 预检（所有模式）

1. 查找仓库：当前目录 → `gh repo set-default` → 询问用户。如果仓库不在本地，则将其克隆下来。
2. **在执行任何写入命令之前，确认 `gh` 指向的是他们的实例。**

   ```bash
   gh repo view --json nameWithOwner -q .nameWithOwner
   ```

   如果输出的是 `aeonfun/aeon`，并且他们并不是在上游仓库本身上工作，则停止并运行 `gh repo set-default <owner>/<repo>`。在没有固定默认仓库时，`gh` 会优先选择 `upstream` remote 而不是 `origin`，而且 Aeon 的每次写入操作（`auth`、`secrets set`、`skills run`、配置推送）都会调用 `gh -R <resolved>`，因此它会直接将他们的 API 密钥写入上游仓库，并在那里触发运行。整个过程看起来像是成功的：没有错误、获得了真实的运行 id，但 Skill 只是在他们的实例上始终不运行。

3. `gh auth status` — 所有操作都通过 `gh` 路由。如果失败，告知他们运行 `gh auth login` 并停止。
4. 使用 `./aeon` CLI 执行所有配置写入操作。它会保留 `aeon.yml` 中的注释并进行验证。绝不要手动编辑 YAML — 但有一个例外：CLI 无法为全新 Skill *创建*条目（参见模式 4 第 4 步）。

**不要相信刚创建的 Skill 显示为“disabled”。** 读取路径会从磁盘列出 Skill，并将 `aeon.yml` 中缺失的条目默认设置为 `enabled: false`，因此“未配置”和“已禁用”看起来完全相同。下面这条命令可以区分二者：

```bash
comm -23 <(ls skills/*/SKILL.md | cut -d/ -f2 | sort) \
         <(grep -oE '^  [a-z0-9-]+:' aeon.yml | tr -d ' :' | sort)
```

命令输出的任何内容，都是存在于磁盘上但尚未配置的 Skill。**了解已安装和已启用的内容，以及各项内容的位置：`references/layout.md`。**

**设置任何密钥或令牌：**阅读 `references/secrets.md` — 其中列出了每个 secret 和仓库变量，以及获取它们的准确页面。始终使用 `./aeon secrets set NAME --stdin` 设置 secrets，绝不要将其作为命令参数传入。

---

## 模式 1 — 在 Aeon 上开始

目标：快速让他们的手机收到一条真实通知。不要先配置计划任务。

1. **获取一个仓库。在执行任何操作前先询问选择公开还是私有** — 这会改变命令，而之后切换意味着迁移仓库。

   **公开**（推荐）：Actions 分钟数免费，并且只需一条命令即可获取上游 Skill 更新。

```bash
   gh repo fork aeonfun/aeon --clone && cd aeon
   gh repo set-default <owner>/aeon        # REQUIRED — see below
   ```

   **私有**：公共仓库的 fork 始终是公共的，因此私有实例是镜像，而不是 fork。

   ```bash
   gh repo create <name> --private
   git clone --bare https://github.com/aeonfun/aeon.git
   git -C aeon.git push --mirror https://github.com/<owner>/<name>.git
   rm -rf aeon.git && git clone https://github.com/<owner>/<name>.git && cd <name>
   git remote add upstream https://github.com/aeonfun/aeon.git
   gh repo set-default <owner>/<name>      # REQUIRED — see below
   ```

   在他们选择私有实例前，务必把两项成本都明确说出来：Actions 分钟数会从账户配额中扣除（Free 方案每月 2,000 分钟——定时技能会消耗这些额度），而更新需要使用 `git fetch upstream && git merge upstream/main`，不能使用 `gh repo sync`。

   **在执行任何其他命令前固定默认仓库——两条路径都一样。** 两种方式最终都会有一个 `upstream` remote（`gh repo fork --clone` 会自动为你添加），而如果没有固定默认仓库，**`gh` 会优先使用 `upstream` 而不是 `origin`**。Aeon 中的所有操作都会通过 `gh -R $(gh repo view …)` 路由，因此未固定默认仓库的 checkout 会悄无声息地将密钥写入 `aeonfun/aeon`，并针对该仓库触发运行，而不是他们自己的实例——不会报错，因为这些命令确实在错误的仓库上成功执行了。请验证：

   ```bash
   gh repo view --json nameWithOwner -q .nameWithOwner   # must print THEIR repo
   ```

   此步骤之后的所有操作都完全相同。
2. **认证一个模型。** 至少需要一个模型。最快的方式是使用 `./aeon auth --oauth`（Claude Pro/Max，会打开浏览器），或者使用 `./aeon auth --key <key>`；后者会**根据密钥前缀**检测提供商——`sk-ant-oat`（OAuth）、`sk-or-`（OpenRouter）、`bk_`（Bankr）、`inf_`（Surplus）、`xai-`（Grok）；其他任何值都会写入 `ANTHROPIC_API_KEY`。

   **UsePod 和 Venice 密钥没有前缀**，无法自动检测，因此直接使用 `--key` 会将其作为普通 Anthropic 密钥写入，运行时随后会因为令人困惑的认证错误而失败。必须指定名称：

   ```bash
   ./aeon auth --key <token> --provider usepod    # same for venice
   ```

   `--dry-run` 会打印解析出的 `method=… → secret …`，不会调用 `gh` 或 `claude`——当你不确定提供商时，值得运行一次。

   **不要假设他们拥有 Claude 订阅：**共有九个提供商可用，其中包括 OpenRouter、Grok、GLM 以及使用加密货币结算的网关。请参阅“提供商与运行框架”。
3. **连接一个渠道。** Telegram 最快：使用 @BotFather 创建一个 bot，然后执行 `./aeon secrets set TELEGRAM_BOT_TOKEN --stdin` 和 `TELEGRAM_CHAT_ID`。暂时跳过 Discord/Slack/电子邮件——一个渠道足以证明它能正常工作。
4. **现在运行一个技能。** 使用模式 6 选择它——询问他们希望处理什么，然后提出一个方案——接着执行 `./aeon skills run <name>`。等待其完成，然后执行 `./aeon runs logs <id>`。他们应该会收到一条 Telegram 消息。
5. **只有在此之后才进行定时调度。** 执行 `./aeon skills enable <name>` 并设置时间（请参阅模式 2）。

适合首次使用的技能：`digest`（主题简报）、`github-monitor`（他们的仓库）、`heartbeat`（默认已启用，仅在有事项需要关注时报告）。

---

## 模式 2 — 重新安排 / 更改例程

以**他们自己所在时区的时间线**向他们展示一天的安排，而不是配置文件：

```
07:00  digest           "solana"
09:00  pr-review        your repos
18:00  heartbeat        health check
```

使用 `./aeon skills ls --enabled --json` 构建。（`--enabled` 很重要：普通的 `ls` 也会为*已禁用*的技能打印 `SCHEDULE` 列——那只是它们在 `aeon.yml` 中的条目，并不能证明任何任务会被触发。）没有 CLI，或者想查看原始文件？`references/layout.md` 中提供了仅使用 grep 的等价方法。然后理解自然语言编辑请求并应用更改：

| 他们说 | 你执行 |
|---|---|
| "把摘要移到早上 7 点" | `./aeon skills schedule digest "0 6 * * *"` |
| "只在工作日运行" | `... "0 6 * * 1-5"` |
| "太吵了，每周两次" | `... "0 6 * * 1,4"` |
| "停止那个加密货币任务" | `./aeon skills disable token-movers` |
| "改成关注 rust" | `./aeon skills set digest --var rust` |

规则：
- **`aeon.yml` 中的所有 cron 都使用 UTC。** 根据他们的时区进行转换，并说明这一点："巴黎早上 7 点 = UTC 的 `0 6 * * *`（夏季是早上 5 点——希望将其固定为当地时间吗？" 没有当地时间选项，因此如果夏令时很重要，要告诉他们哪半年会相差一小时。
- 任何更改后，都要在他们的时区中确认接下来 **3 次触发时间**。
- 对任何含义不明确的操作，先使用 `--dry-run`，显示差异，然后再应用。
- 更改需要推送后才能生效。CLI 会完成推送；确认推送已经成功。
- **然后检查该值是否带有引号**——每次都执行一次 grep：

  ```bash
  grep '^  <skill>:' aeon.yml
  ```

  调度器只会读取带有**双引号**的 `schedule: "…"`。CLI 会以不带引号的形式写入一个*新*键，因此尚未包含 `schedule:` 的条目会变成 `schedule: 0 12 * * *`，该技能将永远被跳过。详细信息见下文。

包含 `schedule: workflow_dispatch` 的技能仅按需运行——它们永远不会通过 cron 触发。`reactive` 技能会根据条件触发，而不是按时间触发。

---

## 模式 3 — 排除故障

"它没有运行。" 按以下顺序检查，发现第一个问题后立即停止：

1. **它是否已启用？** `./aeon skills ls --enabled` ——是否列出了它？
2. **是否存在重复键？** `node scripts/validate-config.js`。`aeon.yml` 中重复的技能名称会静默遮蔽第一个条目。手动编辑后很常见。
3. **它是否真的是 cron？** `workflow_dispatch` 和 `reactive` 永远不会按计划触发。
4. **Actions 是否被禁用？** `gh api repos/{owner}/{repo}/actions/permissions`。GitHub 会在仓库连续 60 天没有活动后自动禁用计划工作流——这会静默地使 fork 失效，而 Aeon 中没有任何地方会显示这一点。在仓库 Settings 中重新启用。
5. **计划是否带有引号？** `grep '^  <skill>:' aeon.yml` ——值必须是 `schedule: "0 12 * * *"`，**并且要带双引号**。

   ```
   schedule: "0 12 * * *"   ✅ fires
   schedule: 0 12 * * *     ❌ never fires, no error anywhere
   ```

   `scheduler.yml` 使用 bash 正则 `schedule: *"([^"]+)"` 匹配计划。未加引号的值无法匹配，`$SCHED` 为空，并且匹配循环执行 `[ -z "$SCHED" ] && continue`——被静默跳过，每次触发都如此，永远如此。

   之所以会变成这样：CLI 通过 YAML 文档模型编辑 `aeon.yml`，该模型会保留*已有的*带引号节点，但会以普通样式写入**新添加的**键。因此，`./aeon skills schedule <name> "0 12 * * *"` 用于本来就有带引号的 `schedule:` 的条目时是安全的，但用于没有该键的条目时会悄悄造成问题。首次使用 `--var` 时也是如此。

**没有其他任何东西能检测到这一点。** 该文件是有效的 YAML，`validate-config.js` 报告 CLEAN，`./aeon skills ls --enabled` 也会列出该技能及其调度计划——因为它们都能正确解析 YAML，只有调度器使用了正则表达式。手动添加引号即可修复。
6. **它是否运行过但失败了？** 先运行 `./aeon runs ls`，然后运行 `./aeon runs logs <id>`。失败的技能会在 30 分钟冷却期后重试。

如果以上检查都没问题，再检查下面三项：

- **它针对的是错误的仓库。** 典型迹象是某个命令报告成功并返回了运行 ID，但在其所在实例上运行 `./aeon runs ls` 却什么也没有。未固定默认仓库时，`gh` 会优先使用 `upstream` 而不是 `origin`，因此未固定的检出副本会将每次写入都发送到 `aeonfun/aeon`。

  ```bash
  gh repo view --json nameWithOwner -q .nameWithOwner   # if this isn't their repo:
  gh repo set-default <owner>/<repo>
  ```

  然后**清理已经写入上游的内容**——针对正确的仓库重新运行并不会撤销之前的操作。在指向错误仓库期间设置的任何密钥，现在都已经成为他人仓库中的密钥：

  ```bash
  gh secret list -R aeonfun/aeon      # timestamps matching the misfire = theirs
  ```

  **始终先在提供商处轮换密钥**——该密钥曾存在于一个其协作者可以提交工作流来读取它的仓库中。然后在他们的实例上使用 `./aeon secrets set NAME --stdin` 重新设置。

  **不要盲目删除它。** `gh secret list` 只显示*最后更新时间*，因此无法告诉你上游仓库之前是否已经存在该密钥，以及这次误操作是否**覆盖**了它。删除前先询问：
  - 上游从未有过该密钥 → `gh secret delete <NAME> -R <upstream>`。
  - 上游原本有自己的密钥 → 删除会破坏*他们*的定时运行。所有者必须重新设置上游自己的值；从这里无法撤销这次覆盖。

  如果删除操作返回 403，说明他们从未拥有写入权限——实际上什么也没有写入，之前的命令只是表面上看起来成功，随后便失败了。
- **缺少密钥。** 技能会在 `requires:` 中声明所需的密钥。将其与 `./aeon secrets ls --set` 的结果进行比对。缺少可选密钥（`KEY?`）意味着功能会静默降级，而不是导致失败。
- **“没有可用的 MCP 工具。”** 在 Claude harness 中，`.mcp.json` 里只要有一个无法解析的 `${VAR}`，就会停用该次运行的**所有** MCP 服务器，而不仅仅是有问题的那个（`::warning::.mcp.json references secret(s) not set:` … `Skipping MCP this run.`）。Grok 则会按服务器分别降级。如果某个 OAuth 服务器之前运行正常、后来却导致运行失败，请怀疑轮换后的刷新令牌无法保存——参见 `references/mcp.md`。
- **它运行了，但什么也没发送。** 这通常是正确的。Aeon 的约定是在没有信号时保持静默——运行正常时不会发送任何内容，而不是发送一份空报告。

注意：GitHub 对 `*/5` cron 触发时刻的实际投递率只有约 10%，因此调度器会在最多 12 小时内补执行错过的时刻。技能延迟 40 分钟触发是正常现象。

---

## 模式 4——将这次聊天变成一个技能

他们刚刚在这次聊天中完成了某件事，并希望它按计划定期执行。

1. **编写技能文件。** `skills/<name>/SKILL.md`——先写 frontmatter，然后写提示词。根据会话中实际发生的内容来提炼：
   - prompt 正文 = 他们提出的要求，加上实际有效的步骤
   - `mode:` = 除非需要提交更改或创建 PR，否则使用 `read-only`
   - `requires:` = 工作过程中用到的任何 API 密钥（如果没有该密钥也能降级运行，则使用 `KEY?`）
   - `category:` = `core evolution basics dev crypto productivity` 中的一个
   - 如果他们喜欢输出结果，就将一份精简示例粘贴到正文中，作为格式规范

2. **修复会导致无人值守运行失败的三件事：**
   - **没有人在现场。** 凡是需要向对方提问的地方，都必须改成默认值或规则。
   - **不要对任何情况保持沉默。** 明确添加“如果没有值得报告的内容，则记录并退出，不发送通知”。否则它会在一周内被静默。
   - **不要重复昨天的内容。** 添加“检查最近 3 天的 `memory/logs/`，跳过已经报告过的内容”。

3. **检查它是否确实能在那里运行。** 不能依赖本地文件系统，也不能依赖已登录的工具。如果会话读取了对方的主目录或使用了本地 MCP 服务器，请明确说明——除非将其配置为仓库 secret / `.mcp.json`，否则这部分无法无人值守运行。关于为无人值守使用配置 MCP 服务器（dashboard Connect、OAuth 刷新、轮换 token 的 PAT）：`references/mcp.md`。

4. **自行添加 `aeon.yml` 条目。** 磁盘上的新 skill 没有对应条目，而 `./aeon skills enable|schedule` **不会创建条目**——它们只会切换已经存在的条目，并报告 `no change — already in that state`，但这并不是真的。手动添加该条目，并将其设为禁用状态，放在 `heartbeat:` 回退行之前：

   ```yaml
     my-skill: { enabled: false, schedule: "0 12 * * *" }
   ```

   **即使它处于禁用状态，也要包含带引号的 `schedule:`——这些引号是必需的。** 如果写成裸的 `{ enabled: false }`，再让 `./aeon skills schedule` 稍后添加该键，就会生成调度器无法读取的*不带引号*的值，导致 skill 永远不会触发（Mode 3，检查 5）。在这里预先写入带引号的节点，可以确保后续每次 CLI 编辑都保留引号。

   与其他 61 个条目一样，使用单行的内联 `{ … }` 形式。`aeon.yml:367` 通过单行 grep 读取每个 skill 的 `model:`/`harness:` 覆盖值，因此如果条目跨行，实际会采用全局默认值。

   这是“绝不要手动编辑 YAML”这一规则唯一获准的例外。之后进行验证：`node scripts/validate-config.js`——但请注意，它只检查结构，无法发现不带引号的值。

5. **重新生成两个目录，然后以 PR 形式提交。** 新 skill 会触发三个 CI 门禁。在本地运行它们——**没有任何规则会阻止红色结果合并**，`main` 未受保护，也没有 ruleset，因此未运行的门禁只会在事后失败：

   ```bash
   bash scripts/check-skill-categories.sh   # category is one of the six
   bin/generate-skills-json                 # catalog/skills.json
   bin/generate-packs-json                  # catalog/packs.json — NOT optional
   ```

   `generate-packs-json` 是每个人都会忘记的那个：`catalog/skills.json` 本身就是 `ci-packs-json` 的触发路径，因此如果只提交 skills 目录而不提交 pack 目录，就会在一个你从未修改过的 workflow 上变红。两个文件都要提交。

   完整的门禁列表、触发条件，以及 `ci-tests` / `ci-apps` 命令：`references/ci.md`。

6. **运行一次**（`./aeon skills run <name>`），展示输出，然后通过 Mode 2 为其安排计划运行。

### Skill 文件结构

```yaml
---
name: my-skill
description: One line — what it does and what it sends.
metadata:
  title: My Skill
  mode: read-only
  category: basics
  var: ""
  tags:
    - content
  requires:
    - SOME_API_KEY?
---

Today is ${today}. <the prompt — plain instructions, including judgment calls>

## Steps
1. <the procedure — 43 of 80 skills lead with this>

## Network note
<curl / WebFetch / `./secretcurl` / `gh api` — how this skill fetches>

## Log
Report via `./notify` (use `./notify -f file.md` for anything multi-line).
Send nothing if there's nothing worth reporting.
Append what you did to `memory/logs/${today}.md` under a `### <skill-name>` heading.
```

正文长度为 133–757 行（中位数约为 306 行）——skill 是用散文写成的提示词，而不是配置文件。`## Steps` / `## Network note` / `## Constraints` / `## Log` 是约定的结构。

编写时有四件容易踩坑的事——完整细节见 `references/skill-anatomy.md`：

- **`requires:` 是最小权限 allowlist——运行时只会导出此处列出的键。** 行内形式（`requires: [KEY?]`）和块形式（`- KEY` 行）都能解析，可以位于顶层，也可以嵌套在 `metadata:` 下。关键在于值：只有匹配 `^[A-Z][A-Z0-9_]{2,}$` 的名称（末尾的 `?` 表示可选）才会被注入；小写或格式错误的条目会被静默丢弃。
- **拼错 `mode:` 会授予写权限。** 未知值会回退到 `write`，而不是更安全的权限级别。准确的字符串是 `read-only`。
- **`${today}` / `${var}` 不会被模板化。** 没有任何东西会改写 `SKILL.md`；工作流会将日期和变量放入外围提示词中，由模型在上下文中解析。自行发明 `${my_thing}` 得到的只会是字面量 `${my_thing}`。
- **绝不要把密钥放在命令行上。** 使用带有花括号占位符 `{ENV_NAME}` 的 `./secretcurl`——Claude Code 的权限分析器会在运行时阻止 `$SECRET` 展开。

计划任务**不应写入 `SKILL.md`**——它们位于 `aeon.yml` 中。仍有 10 个上游 skill 带有 `schedule:` 或 `cron:` frontmatter 行；**没有任何东西会读取它们**（`scheduler.yml` 只解析 `aeon.yml`）。不要照搬这种模式，也不要相信你找到的相关配置——请检查 `aeon.yml`。

---

## 模式 5——更改现有 skill 的行为

“让摘要更短”“停止覆盖 X”“添加一个来源”。这比编写新 skill 更常见。

**首先，确认这是配置更改，而不是文件编辑。** 大多数 skill 通过 `var` 接收主题、过滤器或模式——在修改正文之前，先读取该 skill 的 `var:` 行以及其 `aeon.yml` 条目上的注释。如果 `var` 已经涵盖了需求，就完成了：

```bash
./aeon skills set digest --var "rust"          # no file edit at all
```

否则编辑 `skills/<name>/SKILL.md`：

1. **先完整阅读正文。** 这些文件通常很长（200–750 行），包含判断规则、退出分类和评分标准；针对性编辑可能会在不知不觉中与它们产生矛盾。
2. **不要删掉维持运行的机制。** 无论其他部分如何变化，该 skill 都必须保留：`./notify` 路径、无信号时静默退出、在 `### <skill-name>` 下追加到 `memory/logs/${today}.md`，以及任何已有的去重逻辑。试图“收紧” skill 的编辑经常会删掉这些内容。`### <skill-name>` 标题由健康循环解析，而去重规则会读取最近 3 天的日志——破坏其中任何一项都会导致 skill 持续重复报告，直到被静音。约定见 `references/skill-anatomy.md`。
3. **如果行为发生了变化，就更新 frontmatter。** 新增的数据源需要一个键 → 将其添加到 `requires:`。现在会写入文件或创建 PR → `mode: write`。如果修改了 `description:`、`name:`、`category:` 或 `requires:` → 重新生成**两个** catalog（`bin/generate-skills-json && bin/generate-packs-json`）并同时提交二者；`skills.json` 包含这些字段，并为 `packs.json` 提供数据。参见 `references/ci.md`。
4. **如果它是上游 skill，请发出警告。** `aeonfun/aeon` 中发布的任何内容都会在下一次 `git merge upstream/main` 时产生冲突。这样做没有问题，但要说明这一点——两个仓库的约定是让本地编辑保持有意为之且尽可能少。
5. **运行一次**（`./aeon skills run <name>`），并在结束前阅读输出。

自动化替代方案：仓库内的 `autoresearch` skill 通过生成四个经评分的变体并将胜者作为 PR 提交，来迭代目标 skill。当需求是“把这个做得更好”，而不是某项具体修改时，优先使用它。

---

## 模式 6 —“我应该启用什么？”

这是入门过程中真正的第一个问题。**不要把目录一股脑列出来。** 先询问两三个问题，了解他们在离开期间真正希望处理哪些事情，然后提出 **三个** skills，并分别用一句话说明理由。

每次推荐三个，而不是十二个。每个启用的 skill 都会产生周期性通知，而让实例在第一天就变得嘈杂，是最快的“杀死”实例的方法。`heartbeat` 已经启用，并且会保持静默，除非有需要关注的事项。

```bash
./aeon skills ls                 # all skills — SKILL / ON / SCHEDULE / PACK / DESC
./aeon skills ls --enabled       # only what actually runs
./aeon skills ls --pack crypto   # one pack
./aeon skills <name>             # one skill's detail
./aeon packs ls                  # the six first-party packs
```

读取 `ls` 输出末尾类似 `80 skills · 1 enabled` 的信息——在提出任何建议之前，先把它读给对方。首次运行会安装 CLI 运行时（tsx + yaml，约 12MB）；npm 输出的噪声只会出现一次，属于预期现象。仅使用 Grep 的等效方案：`references/layout.md`。

Pack 是可见性过滤器，而不是运行时开关——显示某个 pack 不会运行任何内容。Core（12 个）、Evolution（9 个）和 Basics（18 个）默认显示；Dev（12 个）、Crypto（18 个）和 Productivity（11 个）按需显示。

合理的起始组合：

| 他们关注的内容 | 建议 |
|---|---|
| 他们的仓库 | `github-monitor`、`pr-review`、`changelog` |
| 某个主题 / 研究 | `digest`、`article`、`mention-radar` |
| 市场 | `token-movers`、`defi-overview`、`monitor-polymarket` |
| 发布 / 增长 | `heartbeat`、`shiplog`、`bd-radar` |

### 安装更多

```bash
bin/install-skill-pack --list             # browse the community registry
bin/install-skill-pack <owner>/<repo>     # install a curated pack
bin/add-skill <owner>/<repo> --list       # any repo containing SKILL.md files
```

所有内容都会以 **禁用** 状态安装，并经过安全扫描，同时在 `skills.lock` 中记录来源信息。

**启用社区 SKILL.md 之前，先阅读它。** 安装一个 pack 就意味着运行陌生人的 prompt，并向其中注入你的机密信息。扫描器使用正则表达式——无法捕获 prompt 注入。检查 `requires:` 是否与所述任务相匹配，`capabilities:` 是否如实，以及其中是否有指示 agent 将数据发送到无关位置的内容。

**在启用任何具有现实世界影响范围的功能之前，必须明确确认：** `distribute-tokens`（发送 USDC）、`schedule-ads`（花费资金）、`send-email` 和 `vuln-scanner`（联系真实人员）、`deploy-prototype` 和 `feature`（推送到他人的仓库）。

---

## 模式 7 — 策略与语气

两个文件都会随每次运行的上下文一起加载。两者都不是必需的，编写成本也很低，但它们对输出质量的提升，胜过针对单个 skill 的任何调优。

### `STRATEGY.md` — 北极星

它会被导入 `CLAUDE.md`，因此会出现在每个 skill 的上下文中：目标、优先级、受众和硬性约束。当其他信息无法决定某个选择时，它会帮助打破平局。保持它**简洁**（每次运行都会消耗 token）且**具体**（模糊的策略无法帮助打破平局）。

```bash
./aeon strategy show
./aeon strategy set --file STRATEGY.md
./aeon strategy build "<one-line goal>"    # dispatches the strategy-builder skill
```

`build` 会读取 brief、仓库 README 和 `memory/MEMORY.md`，然后提交一份草稿。它以 Action 的形式运行，因此完成后请执行 pull。无需 API 密钥。

### `soul/` — 它听起来是什么样

默认情况下，Aeon 没有个性。每次运行时都会读取 `soul/SOUL.md`（身份、世界观、观点）和 `soul/STYLE.md`（语气、词汇、反模式），因此通知和内容听起来会像操作员本人。`soul/examples/` 存放 10–20 个校准样本。

```bash
./aeon soul show
./aeon soul build --handle <x-handle> --name "<Full Name>" --links <url,url>
```

`XAI_API_KEY` 能让系统更充分地读取真实的 X 时间线；没有它时，`soul-builder` 会退回使用网络搜索。github.com/aeonfun/soul.md 上还有一组完整示例 soul 的画廊，可以从那里开始。

**质量标准：具体到可能出错。** *“我觉得大多数 AI 安全讨论都是自以为高深的自我安慰”* 是有用的。*“我对 AI 安全有着复杂而细腻的看法”* 则不是。要推动前一种表达——一个不会冒犯任何人的 soul，不会听起来像任何人。

---

## 模式 8 — 挖掘历史记录，寻找可自动化的技能

“我有哪些事情在一遍遍手动做，而 Aeon 本可以直接完成？”模式 4 会把*当前*对话变成技能；模式 8 则会挖掘*过去*的对话，找出哪些对话值得转化为技能。它会读取操作员本地的编码代理会话记录（`~/.claude/projects` 或 `~/.codex/sessions`），因此只能在操作员自己的机器上运行——绝不能在 Aeon 运行过程中使用。

1. **扫描。** 从实例仓库根目录运行挖掘器：

   ```bash
   node "${PLUGIN_ROOT:-$CLAUDE_PLUGIN_ROOT}/skills/aeon/scripts/mine-history.mjs" --days 45 --top 15
   ```

   它会解析时间窗口内每个顶层会话（跳过子代理 sidechain），将 shell 命令规范化为 `binary subcommand`，对会话标题进行分组，并输出一份按**不同会话数 × 不同天数**排序的摘要——关注的是重复出现和节奏，而不是原始数量。参数：`--days N`（时间窗口，默认 120）、`--project SUBSTR`（仅处理 cwd 匹配的会话——将范围限定到某个仓库/主题）、`--top N`、`--min-sessions N`、`--json`。它没有依赖项；如果没有历史记录，则会返回干净的错误。关于如何深入阅读表格以及候选项评估标准，请参阅：`references/history-mining.md`。

2. **像人一样阅读它。** 摘要只是原始信号，不是最终结论——判断由你来做：
   - **重复出现的命令工作流**——某个 `binary subcommand` 跨越许多会话和许多天出现，说明它是一种习惯。通用基础操作（`git status`、`gh auth`、裸调用 `node`/`python3`）已经被过滤掉，但 `gh pr`/`gh api`/`npm run` 也属于基础设施——它们到处都很常见，不太适合作为技能创意。要寻找的是*有辨识度的重复调用*：一个命名脚本、某个特定 CLI（`x-cli`、`langfuse`、`raindrop`），或一种固定的 `gh api` 模式。
   - **重复出现的任务主题**——分组后的会话标题是最强的信号。某个标题以大致固定的节奏跨越许多天出现（“检查 X”“审查 Y”“汇总 Z”），几乎总是真正的自动化候选项。
   - **工具 / 项目**——工作涉及哪些 MCP 服务器和仓库；这能告诉你技能需要接入什么，以及应在哪里使用 `--project` 限定范围。

3. **筛选真正的候选项。** 只有同时满足以下所有条件的行，才值得提出：
   - **可重复执行** —— 跨多个日期的多次会话中都出现，而不是只有一个繁忙的下午。
   - **具有获取/计算/报告的形态** —— 拉取或检查某些内容并进行报告。交互式、需要大量决策或一次性的迁移工作都*不适合*自动化。
   - **可安全无人值守** —— 不依赖本地文件、已登录的桌面应用，也不要求人在任务执行过程中回答问题（Mode 4 的第 2/3 步会涵盖加固）。
   - **尚未是一个 skill。** 使用 `./aeon skills ls` 对实例进行去重。许多重复性的 `gh pr` 工作已经属于 `pr-review`/`pr-check`；研究节奏已经属于 `digest`/`mention-radar`。如果已有 skill 覆盖该工作，应采用 Mode 2（重新安排）或 Mode 5（编辑其 `var`），**而不是**创建新的 skill。

4. **提出三个候选项，并提供证据。** 不要直接倾倒摘要。指定 **三个**候选项，并为每个候选项提供其重复次数作为证明（“你在 D 天内的 N 次会话中执行了 X”）、一行 skill 草案（它获取什么、发送什么）、建议的 `mode:`（如果只获取并报告，则使用 `read-only`），以及根据观察到的节奏推断出的建议 `schedule:`（约每天一次 → daily；约每周一次 → weekly）。询问用户想构建哪一个。

5. **交接给 Mode 4 编写用户选中的 skill** —— 使用相同的 skill 文件结构、无人值守加固、带引号的 `schedule:` 条目，以及双目录 CI。Mode 8 负责发现工作；Mode 4 负责交付它。

**隐私：** 会话记录在本地读取，只有聚合摘要会被展示。不要将会话中的原始提示正文或任何敏感内容粘贴到频道中，也不要写入提交的文件；用于作出决定的计数和标题已经足够。

---

## 提供商与 harness

这是两个相互独立的维度。不要混淆：**网关**决定由哪个模型回答；**harness**决定运行 skill 时使用哪个 CLI。

### 网关 — 为 Claude Code 提供动力

设置一个 secret 后即可生效。`aeon.yml` 默认包含 `gateway: { provider: auto }`，它会在运行时根据现有的密钥解析提供商，优先级顺序如下：

```
claude → anthropic → openrouter → bankr → usepod → venice → surplus → grok → glm
```

`direct` **不是**该链中的一环——当九个 secret 均未设置时，它只是占位符。它不需要任何内容，也不会配置任何内容，因此运行会继续使用环境中存在的 `ANTHROPIC_*`，如果不存在，则会在首次模型调用时失败。日志中显示“已解析为 `direct`”意味着**未找到任何密钥**，而不是某个回退方案生效了。

| 提供商 | Secret | 备注 |
|---|---|---|
| Claude 订阅 | `CLAUDE_CODE_OAUTH_TOKEN` | 一键 OAuth，Pro/Max 已包含 |
| Anthropic API | `ANTHROPIC_API_KEY` | 按使用量付费 |
| OpenRouter | `OPENROUTER_API_KEY` | `sk-or-…` · Anthropic 原生透传，风险最低 |
| Bankr | `BANKR_LLM_KEY` | `bk_…` · 折扣价 Opus |
| UsePod | `USEPOD_TOKEN` | 无前缀——传入 `--provider usepod`。令牌位于基础 URL 中，请妥善保密 |
| Venice | `VENICE_API_KEY` | 无前缀——传入 `--provider venice`。以隐私为先，通过 sidecar 桥接 |
| Surplus | `SURPLUS_API_KEY` | `inf_…` · 在 Base 上结算 USDC——先为钱包注资并执行一次 `approve()` |
| Grok (xAI) | `XAI_API_KEY` | `xai-…` · 透传至 `api.x.ai` |
| GLM (Z.AI) | `GLM_API_KEY` | 无前缀——传入 `--provider glm`。别名为 `ZAI_API_KEY`。透传至 `api.z.ai/api/anthropic` |

它采用的是**级联**机制，而不是单一选择：优先级最高的密钥先执行；如果出现*任何*失败（没有额度、触发速率限制、服务中断、响应无效），本次运行就会转到下一个已设置密钥的提供商。只有所有提供商都失败时才会报错。日志会在每次跳转时输出 `Routing attempt via '<provider>'`。

- **重新排序：**仓库变量 `GATEWAY_ORDER`（以空格分隔的名称）。
- **固定一个提供商**（禁用故障转移）：`./aeon config set gateway <name>`。
- **任意兼容 Anthropic 的端点：**`ANTHROPIC_API_KEY` 加上仓库变量 `ANTHROPIC_BASE_URL`——例如 `https://api.deepseek.com/anthropic`。

### Harness — 哪个 CLI 运行该 skill

`claude`（默认）或 `grok`。Grok harness 运行的是 `grok` CLI，而不是 Claude Code，并且**完全绕过网关**——它有自己的一套身份验证机制。

- **设置方式：**全局设置为 `./aeon config set harness grok`，或者在单个 skill 的 `aeon.yml` 条目中设置 `harness: "grok"`——**必须加引号，并且放在该条目的一行内**。每个 skill 的 `model:` 和 `harness:` 都由单行 grep 读取，该 grep 要求使用双引号（`aeon.yml:367`、`:380`），因此未加引号或分行的覆盖设置会被静默忽略，skill 会继续运行全局默认值——不会报错，而且日志中的 `model=` 行看起来也正常。通过 CLI 设置任一项后，请重新读取该条目，并在缺少引号时补上。
- **身份验证：**`XAI_API_KEY`，或者通过控制面板中的**连接 X 账号**使用 X 账号（SuperGrok / X Premium+）；该操作会保存 `GROK_CREDENTIALS`。X OAuth 流程没有 CLI 标志——这一项需要让他们前往 `./aeon`（控制面板）完成。
- **模型：**`grok-4.5`（默认，推理型）或 `grok-composer-2.5-fast`（低成本）。
- **没有免费层级。**

请提前告知他们：

- Grok 运行报告中的 **0 tokens**——它的 JSON 不包含 token 数量，因此成本跟踪会显示为空白。这不是 bug。
- X OAuth 会话会过期。如果无人值守的运行开始因身份验证失败，请重新连接。
- `mode: read-only` 仍然适用（映射为 `--sandbox read-only`），MCP 也可用。

针对每个 skill 的 grok 配置项位于 `SKILL.md` frontmatter 中（在 Claude harness 下会被忽略）：`max_turns`（默认 60）、`best_of_n`、`verify` 和 `effort`（`low|medium|high|xhigh|max`——仅限推理模型；`grok-composer-2.5-fast` 不接受该配置）。