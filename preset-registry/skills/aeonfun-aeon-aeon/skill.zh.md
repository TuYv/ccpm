---
name: aeon
description: Set up and run an Aeon agent instance — get started from scratch, pick which skills to turn on or install more from packs, reschedule or change what runs, edit what an existing skill does, fix a skill that isn't firing, set the STRATEGY.md north star and soul/ voice, turn a Claude Code chat into a scheduled Aeon skill, and mine past Claude Code conversations for recurring work worth automating as a skill. Use when the user mentions Aeon, aeon.yml, an Aeon skill / instance / routine / pack, asks to schedule, enable, edit, or debug an agent that runs on a cron, or asks what of their repeated/manual work Aeon could take over.
---
# Aeon

Aeon 是一个通过 Actions 运行在用户自己 GitHub 仓库中的代理。技能是一个 Markdown 文件（`skills/<name>/SKILL.md`）；`aeon.yml` 指定运行哪些技能以及何时运行。

选择他们所需要的模式：

| | |
|---|---|
| **1 · 开始** | 尚无实例，或从头开始设置 |
| **2 · 重新安排** | 更改时间、频率，或技能关注的内容 |
| **3 · 解除阻塞** | “它没有运行” / “什么也没发生” |
| **4 · 对话 → 技能** | 将我们刚刚完成的工作变成一个定时运行的技能 |
| **5 · 编辑技能** | 更改现有技能的功能 |
| **6 · 选择启用什么** | 选择技能、浏览技能包、安装更多技能 |
| **7 · 策略与语气** | `STRATEGY.md` 和 `soul/` —— 北极星与表达语气 |
| **8 · 从历史记录 → 技能** | “我反复做的哪些工作可以交给 Aeon？”——从过去的 Claude Code 对话中找出这些工作 |

## 预检（每种模式都要执行）

1. 查找仓库：当前目录 → `gh repo set-default` → 询问用户。如果仓库不在本地，则将其克隆下来。
2. **在执行任何会写入内容的命令之前，确认 `gh` 指向的是他们自己的实例。**

   ```bash
   gh repo view --json nameWithOwner -q .nameWithOwner
   ```

   如果输出的是 `aeonfun/aeon`，且他们并不是在上游仓库本身上工作，则停止操作并运行 `gh repo set-default <owner>/<repo>`。当没有固定默认仓库时，`gh` 会优先使用 `upstream` remote，而不是 `origin`；而每次 Aeon 写入操作（`auth`、`secrets set`、`skills run`、配置推送）都会调用 `gh -R <resolved>`，因此它会毫不犹豫地将他们的 API 密钥写入上游仓库，并在那里触发运行。表面上看一切都成功了：没有错误、有真实的运行 id，但技能就是不会在他们的实例上触发。

3. 运行 `gh auth status` —— 所有操作都会通过 `gh` 路由。如果失败，告知他们运行 `gh auth login`，然后停止。
4. 使用 `./aeon` CLI 执行所有配置写入操作。它会保留 `aeon.yml` 中的注释并进行验证。绝不要手动编辑 YAML —— 有一个例外：CLI 无法为全新技能*创建*条目（见模式 4 第 4 步）。

**不要相信刚刚创建的技能显示为“disabled”。** 读取路径会从磁盘列出技能，并将 `aeon.yml` 中缺失的条目默认为 `enabled: false`，因此“未配置”和“已禁用”看起来完全一样。下面的命令可以区分二者：

```bash
comm -23 <(ls skills/*/SKILL.md | cut -d/ -f2 | sort) \
         <(grep -oE '^  [a-z0-9-]+:' aeon.yml | tr -d ' :' | sort)
```

命令输出的任何内容，都是已存在于磁盘上但尚未配置的技能。**快速了解已安装什么、已启用什么，以及所有内容位于何处：`references/layout.md`。**

**设置任何密钥或令牌：**阅读 `references/secrets.md` —— 其中列出了每个 secret 和仓库变量，以及获取它们的确切页面。始终使用 `./aeon secrets set NAME --stdin` 设置 secrets，绝不要将其作为命令参数传入。

---

## 模式 1 —— 在 Aeon 上开始使用

目标：尽快在他们的手机上收到一条真实通知。不要先配置计划任务。

1. **获取一个仓库。在执行任何操作之前，先询问使用公开仓库还是私有仓库** —— 这会改变命令，而之后切换意味着需要迁移仓库。

   **公开仓库**（推荐）：Actions 分钟数免费，并且上游技能更新可以通过一条命令获取。

```bash
   gh repo fork aeonfun/aeon --clone && cd aeon
   gh repo set-default <owner>/aeon        # REQUIRED — see below
   ```

   **私有**：公共仓库的 fork 始终是公开的，因此私有实例是镜像，而不是 fork。

   ```bash
   gh repo create <name> --private
   git clone --bare https://github.com/aeonfun/aeon.git
   git -C aeon.git push --mirror https://github.com/<owner>/<name>.git
   rm -rf aeon.git && git clone https://github.com/<owner>/<name>.git && cd <name>
   git remote add upstream https://github.com/aeonfun/aeon.git
   gh repo set-default <owner>/<name>      # REQUIRED — see below
   ```

   在他们选择私有实例之前，务必把这两项成本都明确告知：Actions 分钟数会计入账户配额（Free 计划每月 2,000 分钟——定时运行的 skill 会消耗这些额度），更新需要使用 `git fetch upstream && git merge upstream/main`，而不是 `gh repo sync`。

   **在执行任何其他命令之前，先固定默认仓库——两条路径都必须如此。** 两种方式最终都会有一个 `upstream` 远程仓库（`gh repo fork --clone` 会自动添加），而如果没有固定默认仓库，**`gh` 会优先使用 `upstream` 而不是 `origin`**。Aeon 中的所有操作都会通过 `gh -R $(gh repo view …)` 路由，因此未固定默认仓库的 checkout 会悄悄地把密钥写入 `aeonfun/aeon`，并针对该仓库触发运行，而不是他们自己的实例——不会报错，因为这些命令确实在错误的仓库上成功执行了。请验证：

   ```bash
   gh repo view --json nameWithOwner -q .nameWithOwner   # must print THEIR repo
   ```

   此步骤之后的所有操作都完全相同。
2. **为模型配置身份验证。** 至少需要一个模型。最快的方法是 `./aeon auth --oauth`（Claude Pro/Max，会打开浏览器），或者使用 `./aeon auth --key <key>`；后者会**根据密钥前缀**检测提供商——`sk-ant-oat`（OAuth）、`sk-or-`（OpenRouter）、`bk_`（Bankr）、`inf_`（Surplus）、`xai-`（Grok）；其他任何值都会被写入 `ANTHROPIC_API_KEY`。

   **UsePod 和 Venice 密钥没有前缀**，无法自动检测，因此直接使用 `--key` 会将其记录为普通 Anthropic 密钥，运行稍后会因令人困惑的身份验证错误而失败。必须明确指定：

   ```bash
   ./aeon auth --key <token> --provider usepod    # same for venice
   ```

   `--dry-run` 会打印解析后的 `method=… → secret …`，不会调用 `gh` 或 `claude`——当提供商不确定时，值得运行一次。

   **不要假设他们拥有 Claude 订阅：**共有八个提供商可用，其中包括 OpenRouter、Grok 和使用加密货币结算的网关。请参阅“提供商和 harness”。

3. **接入一个渠道。** Telegram 是最快的方式：使用 @BotFather 创建一个 bot，然后执行 `./aeon secrets set TELEGRAM_BOT_TOKEN --stdin` 和 `TELEGRAM_CHAT_ID`。暂时跳过 Discord/Slack/电子邮件——一个渠道就足以验证其正常工作。
4. **现在运行一个 skill。** 使用模式 6 选择它——询问他们希望处理什么，然后提出一个建议——接着执行 `./aeon skills run <name>`。等待其完成，然后执行 `./aeon runs logs <id>`。他们应该会收到一条 Telegram 消息。
5. **只有在这之后，才进行定时运行。** 执行 `./aeon skills enable <name>` 并设置时间（请参阅模式 2）。

好的首批 skill：`digest`（主题简报）、`github-monitor`（他们的仓库）、`heartbeat`（默认已启用，仅在有需要关注的事项时报告）。

---

## 模式 2 — 重新安排 / 更改例程

以**他们自己所在的时区**向他们展示当天的**时间线**，而不是配置文件：

```
07:00  digest           "solana"
09:00  pr-review        your repos
18:00  heartbeat        health check
```

使用 `./aeon skills ls --enabled --json` 构建。（`--enabled` 很重要：普通的 `ls` 也会为*已禁用*的技能打印 `SCHEDULE` 列——那只是它们在 `aeon.yml` 中的条目，并不能证明任何内容会被触发。）没有 CLI，或者想要原始文件？`references/layout.md` 中提供了仅使用 grep 的等价方法。然后理解自然语言形式的修改并应用：

| 他们说 | 你执行 |
|---|---|
| “把 digest 改到早上 7 点” | `./aeon skills schedule digest "0 6 * * *"` |
| “只在工作日执行” | `... "0 6 * * 1-5"` |
| “太吵了，一周两次就好” | `... "0 6 * * 1,4"` |
| “停止那个加密货币的” | `./aeon skills disable token-movers` |
| “改成关于 rust 的” | `./aeon skills set digest --var rust` |

规则：
- **`aeon.yml` 中的所有 cron 都是 UTC。** 根据他们的时区进行转换，并明确说明：“巴黎时间早上 7 点 = UTC 的 `0 6 * * *`（夏季是早上 5 点——想要固定为当地时间吗？” 没有当地时间选项，因此如果夏令时很重要，要告诉他们哪半年会相差一小时。
- 任何更改后，确认返回**他们所在时区中的接下来 3 次触发时间**。
- 对任何有歧义的操作，先使用 `--dry-run`，展示差异，然后再应用。
- 更改需要推送后才会生效。CLI 会完成推送；确认推送已经成功。
- **然后检查该值是否带引号**——每次都执行一次 grep：

  ```bash
  grep '^  <skill>:' aeon.yml
  ```

  调度器只读取带有**双引号**的 `schedule: "…"`。CLI 会写入一个不带引号的*新*键，因此一个之前还没有 `schedule:` 的条目会变成 `schedule: 0 12 * * *`，该技能也就会永远被跳过。详情如下。

带有 `schedule: workflow_dispatch` 的技能仅按需运行——它们永远不会由 cron 触发。`reactive` 技能会根据条件触发，而不是根据时间触发。

---

## 模式 3 — 解除阻塞

“它没有运行。”按以下顺序检查，并在第一次发现问题时停止：

1. **它是否已启用？** `./aeon skills ls --enabled` — 是否列在其中？
2. **是否存在重复键？** `node scripts/validate-config.js`。`aeon.yml` 中重复的技能名称会静默遮蔽第一个条目。手动编辑后很常见。
3. **它是否真的是 cron？** `workflow_dispatch` 和 `reactive` 永远不会按计划触发。
4. **Actions 是否被禁用？** `gh api repos/{owner}/{repo}/actions/permissions`。GitHub 会在仓库连续 60 天没有活动后自动禁用计划工作流——这会静默地导致 fork 失效，而 Aeon 中没有任何地方会显示这一点。在仓库 Settings 中重新启用。
5. **计划是否带引号？** `grep '^  <skill>:' aeon.yml` — 值必须是 `schedule: "0 12 * * *"`，**并且带双引号**。

   ```
   schedule: "0 12 * * *"   ✅ fires
   schedule: 0 12 * * *     ❌ never fires, no error anywhere
   ```

   `scheduler.yml` 使用 bash 正则表达式 `schedule: *"([^"]+)"` 匹配计划。未加引号的值无法匹配，`$SCHED` 为空，而匹配循环会执行 `[ -z "$SCHED" ] && continue`——静默跳过，每次 tick 都如此，永远如此。

   它变成这样的原因是：CLI 通过 YAML 文档模型编辑 `aeon.yml`，该模型会保留*现有的*带引号节点，但会以普通样式写入**新添加的**键。因此，`./aeon skills schedule <name> "0 12 * * *"` 对于已经存在带引号 `schedule:` 的条目是安全的，但对于之前没有该键的条目则会悄悄破坏。同样的情况也适用于首次使用 `--var`。

**没有其他地方能检测到这一点。** 该文件是有效的 YAML，`validate-config.js` 报告 CLEAN，`./aeon skills ls --enabled` 也会列出该技能及其调度计划——因为它们都会正确解析 YAML，只有调度器使用正则表达式。手动添加引号即可修复。
6. **它是否运行过但失败了？** 先运行 `./aeon runs ls`，然后运行 `./aeon runs logs <id>`。失败的技能会在 30 分钟冷却期后重试。

如果以上检查都没有问题，再检查下面三项：

- **它针对的是错误的仓库。** 典型迹象是某条命令报告成功并给出了运行 id，但在他们的实例上运行 `./aeon runs ls` 却什么也没有。未固定默认仓库时，`gh` 会优先使用 `upstream` 而不是 `origin`，因此未固定的检出仓库会将每次写入都发送到 `aeonfun/aeon`。

  ```bash
  gh repo view --json nameWithOwner -q .nameWithOwner   # if this isn't their repo:
  gh repo set-default <owner>/<repo>
  ```

  然后**清理已经写入上游的内容**——针对正确仓库重新运行并不会撤销之前的操作。任何在指向错误仓库期间设置的密钥，现在都是别人仓库中的秘密：

  ```bash
  gh secret list -R aeonfun/aeon      # timestamps matching the misfire = theirs
  ```

  **始终先在提供方处轮换该密钥**——它曾存在于一个其协作者可以提交工作流并读取该密钥的仓库中。然后在他们的实例上使用 `./aeon secrets set NAME --stdin` 重新设置。

  **不要盲目删除。** `gh secret list` 只显示*最后更新时间*，因此无法告诉你上游仓库之前是否已经有这个密钥，以及这次误操作是否**覆盖**了它。删除前先询问：
  - 上游从未有过该密钥 → `gh secret delete <NAME> -R <upstream>`。
  - 上游原本有自己的密钥 → 删除会破坏*他们*的定时运行。所有者必须重新设置上游自己的值；从这里无法撤销这次覆盖。

  如果删除操作返回 403，说明他们从未拥有写入权限——实际上什么都没有写入，之前那条命令只是看起来成功，但在操作过程中失败了。
- **缺少密钥。** 技能会在 `requires:` 中声明所需的密钥。将它们与 `./aeon secrets ls --set` 的结果进行对照。缺少可选密钥（`KEY?`）意味着功能会静默降级，而不是导致失败。
- **“没有可用的 MCP 工具。”** 在 Claude harness 上，只要 `.mcp.json` 中有一个无法解析的 `${VAR}`，该次运行中的**所有** MCP 服务器都会被禁用，而不仅仅是有问题的那个（`::warning::.mcp.json references secret(s) not set:` … `Skipping MCP this run.`）。Grok 则会按服务器分别降级。如果某个 OAuth 服务器之前运行正常、后来却导致运行失败，请怀疑刷新令牌发生了轮换但未能保存——参见 `references/mcp.md`。
- **它运行了，但什么也没发送。** 这通常是正确行为。Aeon 的约定是在没有信号时保持静默——一次干净的运行不会发送任何内容，而不是发送一份空报告。

注意：GitHub 只会触发约 `*/5` cron 时间点中的 10%，因此调度器会在最多 12 小时内补执行错过的时间点。某个技能晚 40 分钟触发是正常的。

---

## 模式 4 — 将本次聊天变成一个技能

他们刚刚在 Claude Code 中完成了某件事，并希望它按计划自动执行。

1. **编写技能文件。** `skills/<name>/SKILL.md`——先写 frontmatter，然后写提示词。根据会话中实际发生的内容来提炼：
   - 提示词正文 = 他们提出的要求，加上已经奏效的步骤
   - `mode:` = `read-only`，除非需要提交或创建 PR
   - `requires:` = 执行过程中用到的任何 API 密钥（如果没有该密钥也能降级，则使用 `KEY?`）
   - `category:` = `core evolution basics dev crypto productivity` 中的一个
   - 如果他们喜欢生成的结果，就将一份精简示例粘贴到正文中，作为格式规范

2. **修复会导致无人值守运行中断的三件事：**
   - **没人会在那里。** 任何你向他们提问的地方，都必须改成默认值或规则。
   - **不要对任何情况保持沉默。** 明确添加“如果没有值得报告的内容，则记录日志并退出，不发送通知。”否则它一周后就会被静默。
   - **不要重复昨天的内容。** 添加“检查 `memory/logs/` 最近 3 天的内容，并跳过任何已经报告过的事项。”

3. **检查它在那里确实能够运行。** 不能使用本地文件系统，也不能使用已登录的工具。如果该会话读取了他们的主目录或使用了本地 MCP 服务器，请明确说明——除非将其接入为仓库 secret / `.mcp.json`，否则那部分无法无人值守运行。为无人值守使用接入 MCP 服务器（dashboard Connect、OAuth 刷新、轮换 token 的 PAT）：`references/mcp.md`。

4. **自行添加 `aeon.yml` 条目。** 磁盘上的新 skill 没有条目，而 `./aeon skills enable|schedule` **不会创建条目**——它们只会切换已经存在的条目，并报告 `no change — already in that state`，但这是错误的。手动添加该条目，并将其禁用，放在后备 `heartbeat:` 行之前：

   ```yaml
     my-skill: { enabled: false, schedule: "0 12 * * *" }
   ```

   **即使它处于禁用状态，也要包含带引号的 `schedule:`——这些引号是必需的。** 写成一个裸的 `{ enabled: false }`，再让 `./aeon skills schedule` 之后添加该键，会生成调度器无法读取的*未加引号*的值，导致该 skill 永远不会触发（模式 3，检查 5）。在这里预先写入一个带引号的节点，可以确保之后每次 CLI 编辑都保留引号。

   与其他 61 个条目使用的内联 `{ … }` 形式保持一致，写在一行中。`aeon.yml:367` 通过单行 grep 读取每个 skill 的 `model:`/`harness:` 覆盖配置，因此拆成多行的条目会采用全局默认值。

   这是唯一获准违反“永远不要手动编辑 YAML”的例外。完成后进行验证：`node scripts/validate-config.js`——但请注意，它只检查结构，无法捕获未加引号的值。

5. **重新生成两个 catalog，然后以 PR 形式提交。** 新 skill 会触发三个 CI 门禁。在本地运行它们——**没有任何机制会阻止红色状态下的合并**，`main` 未受保护，也没有 ruleset，因此未运行的门禁只会在事后失败：

   ```bash
   bash scripts/check-skill-categories.sh   # category is one of the six
   bin/generate-skills-json                 # catalog/skills.json
   bin/generate-packs-json                  # catalog/packs.json — NOT optional
   ```

   `generate-packs-json` 是所有人都会忘记的那个：`catalog/skills.json` 本身就是 `ci-packs-json` 的触发路径，因此只提交 skills catalog、而不提交 pack catalog，会导致一个你根本没有修改过的 workflow 变红。将两个文件都提交。

   完整的门禁列表、触发条件，以及 `ci-tests` / `ci-apps` 命令：`references/ci.md`。

6. **运行一次**（`./aeon skills run <name>`），向他们展示输出，然后通过模式 2 为其设置计划。

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
1. <the procedure — 43 of 76 skills lead with this>

## Network note
<curl / WebFetch / `./secretcurl` / `gh api` — how this skill fetches>

## Log
Report via `./notify` (use `./notify -f file.md` for anything multi-line).
Send nothing if there's nothing worth reporting.
Append what you did to `memory/logs/${today}.md` under a `### <skill-name>` heading.
```

正文长度为 133–757 行（中位数约为 306 行）——skill 是用散文写成的提示词，而不是配置文件。`## Steps` / `## Network note` / `## Constraints` / `## Log` 是标准结构。

编写时有四件容易踩坑的事——完整细节见 `references/skill-anatomy.md`：

- **`requires:` 是最小权限白名单——运行时只会导出此处命名的键。** 行内形式（`requires: [KEY?]`）和块形式（`- KEY` 行）都能解析，可以位于顶层，也可以嵌套在 `metadata:` 下。关键在于值：只有匹配 `^[A-Z][A-Z0-9_]{2,}$` 的名称（末尾的 `?` 表示可选）才会被注入；小写或格式错误的条目会被静默丢弃。
- **`mode:` 拼写错误会授予写入权限。** 未知值会回退为 `write`，而不是更安全的层级。准确字符串是 `read-only`。
- **`${today}` / `${var}` 不会被模板化。** 没有任何东西会重写 `SKILL.md`；工作流会将日期和 var 放入外围提示词中，由模型在上下文中解析。自行发明 `${my_thing}` 只会得到字面量 `${my_thing}`。
- **绝不要将密钥放在命令行上。** 使用带有花括号占位符 `{ENV_NAME}` 的 `./secretcurl`——Claude Code 的权限分析器会在运行时阻止 `$SECRET` 展开。

计划任务**不**应放在 `SKILL.md` 中——它们位于 `aeon.yml`。尽管有 10 个上游 skill 仍然带有 `schedule:` 或 `cron:` frontmatter 行；**没有任何东西会读取它**（`scheduler.yml` 只解析 `aeon.yml`）。不要照搬这种模式，也不要相信你找到的任何此类配置——请检查 `aeon.yml`。

---

## 模式 5 — 更改现有 skill 的行为

“让摘要更短”、“停止涵盖 X”、“添加一个来源”。这比编写新 skill 更常见。

**首先，检查这是否是配置变更，而不是文件编辑。** 大多数 skill 会通过 `var` 接收主题、过滤条件或模式——在修改正文之前，先阅读该 skill 的 `var:` 行以及其 `aeon.yml` 条目上的注释。如果 `var` 已经涵盖了需求，就完成了：

```bash
./aeon skills set digest --var "rust"          # no file edit at all
```

否则编辑 `skills/<name>/SKILL.md`：

1. **先完整阅读整个正文。** 这些文件很长（200–750 行），并包含判断规则、退出分类和评分标准；针对性编辑可能会在不知不觉中与它们矛盾。
2. **不要删除维持运行所需的机制。** 无论其他内容如何变化，该 skill 都必须保留：`./notify` 路径、无信号时静默退出、在 `### <skill-name>` 下追加到 `memory/logs/${today}.md`，以及任何已经存在的去重逻辑。声称要“收紧” skill 的编辑经常会删除这些内容。`### <skill-name>` 标题会被健康循环解析，而去重规则会读取日志中最近 3 天的内容——破坏其中任何一项都会导致 skill 持续重复报告，直到被静音。相关约定见 `references/skill-anatomy.md`。
3. **如果行为发生了变化，请更新 frontmatter。** 新增需要某个键的数据源 → 将其添加到 `requires:`。现在会写入文件或创建 PR → 设置 `mode: write`。如果更改了 `description:`、`name:`、`category:` 或 `requires:` → 重新生成**两个**目录（`bin/generate-skills-json && bin/generate-packs-json`）并提交两者；`skills.json` 包含这些字段，并为 `packs.json` 提供数据。参见 `references/ci.md`。
4. **如果是上游 skill，请发出警告。** `aeonfun/aeon` 中随附的任何内容都会在下一次 `git merge upstream/main` 时发生冲突。这样做没问题，但要说明这一点——两个仓库的约定是让本地编辑保持有意为之且尽量少。
5. **运行一次**（`./aeon skills run <name>`），并在结束前阅读输出。

自动化替代方案：仓库内的 `autoresearch` skill 会生成四个经过评分的变体，并将胜出的变体作为 PR 提交，从而迭代改进目标 skill。当用户的诉求是“让它变得更好”，而不是提出具体修改时，可以使用它。

---

## 模式 6 ——“我应该启用什么？”

这是新手引导期间真正的第一个问题。**不要把目录一股脑倒出来。** 先问两三个问题，了解他们希望在离开时由系统处理什么，然后提出 **三个** skill，并各用一句话说明理由。

每次提供三个，而不是十二个。每个启用的 skill 都会产生周期性通知，而让实例在第一天就变得嘈杂，是最快的弃用方式。`heartbeat` 已经启用，只有在需要关注时才会保持静默。

```bash
./aeon skills ls                 # all skills — SKILL / ON / SCHEDULE / PACK / DESC
./aeon skills ls --enabled       # only what actually runs
./aeon skills ls --pack crypto   # one pack
./aeon skills <name>             # one skill's detail
./aeon packs ls                  # the six first-party packs
```

读取 `ls` 输出底部类似 `76 skills · 1 enabled` 的统计信息——在提出任何建议前先读给他们听。首次运行会安装 CLI 运行时（tsx + yaml，约 12MB）；npm 输出的噪声只会出现一次，属于预期现象。仅使用 grep 的等效说明：`references/layout.md`。

Pack 是可见性筛选器，而不是运行时开关——显示某个 pack 不会运行任何内容。Core（12 个）、Evolution（9 个）和 Basics（18 个）默认显示；Dev（11 个）、Crypto（15 个）和 Productivity（11 个）按需显示。

合理的起始组合：

| 他们关注的事项 | 建议 |
|---|---|
| 他们的代码仓库 | `github-monitor`、`pr-review`、`changelog` |
| 某个主题 / 研究 | `digest`、`article`、`mention-radar` |
| 市场 | `token-movers`、`defi-overview`、`monitor-polymarket` |
| 发布 / 增长 | `heartbeat`、`shiplog`、`bd-radar` |

### 安装更多内容

```bash
bin/install-skill-pack --list             # browse the community registry
bin/install-skill-pack <owner>/<repo>     # install a curated pack
bin/add-skill <owner>/<repo> --list       # any repo containing SKILL.md files
```

所有内容都会以 **禁用** 状态安装，并经过安全扫描，来源信息记录在 `skills.lock` 中。

**启用社区 `SKILL.md` 之前先阅读它。** 安装 pack 意味着会在注入你的机密信息后运行陌生人的提示词。扫描器基于正则表达式——无法检测提示词注入。请检查 `requires:` 是否与所声明的工作相匹配，`capabilities:` 是否如实，以及是否有任何指示要求 agent 将数据发送到无关的地方。

**在启用任何具有现实世界影响范围的内容之前，必须明确确认：** `distribute-tokens`（发送 USDC）、`schedule-ads`（花钱）、`send-email` 和 `vuln-scanner`（联系真实人员）、`deploy-prototype` 和 `feature`（推送到他人的代码仓库）。

---

## 模式 7 ——策略与语气

有两个文件会被带入 **每一次**运行的上下文中。两者都不是必需的，成本也很低，但它们对输出质量的提升超过了针对单个 skill 的任何调优。

### `STRATEGY.md` ——北极星

它会被导入 `CLAUDE.md`，因此会出现在每个 skill 的上下文中：目标、优先事项、受众、硬性约束。当某个选择无法通过其他方式确定时，它可以打破平局。保持它**简洁**（每次运行都会消耗 token），并且**具体**（模糊的策略无法打破平局）。

```bash
./aeon strategy show
./aeon strategy set --file STRATEGY.md
./aeon strategy build "<one-line goal>"    # dispatches the strategy-builder skill
```

`build` 会读取简报以及仓库 README 和 `memory/MEMORY.md`，然后提交一个草稿。它会作为 Action 运行，因此完成后请执行 pull。无需 API 密钥。

### `soul/` — 它听起来是什么样

默认情况下，Aeon 没有个性。每次运行都会读取 `soul/SOUL.md`（身份、世界观、观点）和 `soul/STYLE.md`（语气、词汇、反模式），因此通知和内容听起来会像操作者本人。`soul/examples/` 中存放了 10–20 个校准样本。

```bash
./aeon soul show
./aeon soul build --handle <x-handle> --name "<Full Name>" --links <url,url>
```

`XAI_API_KEY` 能够对真实的 X 时间线进行最丰富的读取；没有它时，`soul-builder` 会退回到网页搜索。另有一个完整示例 soul 集合，位于 github.com/aeonfun/soul.md，可作为起点。

**质量标准：具体到可能出错。** *“我认为大多数 AI 安全讨论都是自以为是的银河脑式自我安慰”* 是有用的。*“我对 AI 安全有着复杂而细腻的看法”* 则不是。应当追求第一种——一个不会冒犯任何人的 soul，不会听起来像任何人。

---

## 模式 8——挖掘历史记录，寻找可自动化的技能

“我有哪些事情在一遍又一遍地手动做，而 Aeon 完全可以代劳？”模式 4 会把*当前*聊天转换为技能；模式 8 则会挖掘*过去*的聊天，找出哪些聊天值得转换为技能。它会读取操作者本地的 Claude Code transcript（`~/.claude/projects/*/*.jsonl`），因此只能在操作者自己的机器上运行——绝不能在 Aeon 运行过程中使用。

1. **扫描。** 从实例仓库根目录运行 miner：

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/skills/aeon/scripts/mine-history.mjs --days 45 --top 15
   ```

   它会解析时间窗口内的每个顶层会话（跳过子代理 sidechain），将 shell 命令规范化为 `binary subcommand`，对会话标题进行分组，并输出一份按**不重复的会话数 × 不重复的天数**排序的摘要——关注的是重复出现和发生频率，而不是原始数量。参数包括：`--days N`（时间窗口，默认 120）、`--project SUBSTR`（仅处理 cwd 匹配的会话——将范围限定到一个仓库或主题）、`--top N`、`--min-sessions N`、`--json`。它没有依赖项，如果没有历史记录，会返回干净的错误信息。关于如何更深入地阅读这些表格以及候选项评估标准，请参阅 `references/history-mining.md`。

2. **像人一样阅读。** 摘要只是原始信号，而不是结论——判断由你做出：
   - **重复出现的命令工作流**——某个 `binary subcommand` 在许多会话和许多天中都出现，说明它是一种习惯。通用基础操作（`git status`、`gh auth`、裸用的 `node`/`python3`）已经被过滤掉，但 `gh pr`/`gh api`/`npm run` 也属于基础设施，在各处出现频率很高，作为技能创意的价值较弱。应寻找*具有辨识度的重复调用*：命名脚本、特定 CLI（`x-cli`、`langfuse`、`raindrop`），或紧凑的 `gh api` 模式。
   - **重复出现的任务主题**——经过分组的会话标题是最强的信号。某个标题以大致固定的频率跨越多天出现（“检查 X”“审阅 Y”“汇总 Z”），几乎总是真正的自动化候选项。
   - **工具链 / 项目**——工作所在的 MCP server 和仓库有哪些；这会告诉你技能需要接入什么，以及应当在哪里限定 `--project` 的范围。

3. **筛选真正的候选项。** 只有同时满足以下所有条件的行，才值得提出：
   - **具有周期性** —— 跨越数天的多个会话，而不是某个繁忙的下午。
   - **符合获取/计算/报告的形态** —— 拉取或检查某些内容并进行报告。交互式、需要大量决策或一次性的迁移工作都*不应*自动化。
   - **可安全无人值守运行** —— 不依赖本地文件、已登录的桌面应用，也不需要人在任务中途回答问题（Mode 4 的第 2/3 步会负责加固）。
   - **尚未是一个 skill。** 对照实例去重：`./aeon skills ls`。许多周期性的 `gh pr` 工作已经由 `pr-review`/`pr-check` 覆盖；研究节奏已经由 `digest`/`mention-radar` 覆盖。如果已有 skill 能够覆盖该工作，应采用 Mode 2（重新安排）或 Mode 5（编辑其 `var`），**而不是**创建新的 skill。

4. **提出三个候选项，并提供证据。** 不要倾倒整个摘要。请列出**三个**候选项，并为每个候选项提供其重复次数作为证据（“你在 D 天内的 N 个会话中执行了 X”）、一行 skill 草案（它获取什么、发送什么）、建议的 `mode:`（如果仅获取并报告，则使用 `read-only`），以及根据观察到的节奏推断出的建议 `schedule:`（大约每天一次 → daily；大约每周一次 → weekly）。询问用户要构建哪一个。

5. **交由 Mode 4 编写所选的 skill** —— 使用相同的 skill 文件结构、无人值守加固、带引号的 `schedule:` 条目，以及双目录 CI。Mode 8 负责发现工作；Mode 4 负责交付它。

**隐私：** 会话记录在本地读取，只有聚合摘要会被展示出来。不要将会话中的原始提示正文或任何敏感内容粘贴到频道中，也不要写入已提交的文件；用于决策的计数和标题已经足够。

---

## 提供商与执行框架

这是两个相互独立的维度。不要混淆它们：**网关**决定由哪个模型回答；**执行框架**决定使用哪个 CLI 运行 skill。

### 网关 — 为 Claude Code 提供支持的组件

设置好 secret 后即可生效。`aeon.yml` 自带 `gateway: { provider: auto }`，它会在运行时根据现有的密钥解析提供商，优先级顺序如下：

```
claude → anthropic → openrouter → bankr → usepod → venice → surplus → grok
```

`direct` **不是**该链路中的一跳——当八个 secret 均未设置时，它只是占位符。它不需要任何东西，也不会配置任何东西，因此运行会继续使用现有的 `ANTHROPIC_*` 环境变量；如果不存在该变量，则会在第一次模型调用时失败。日志中“解析为 `direct`”意味着**未找到任何密钥**，而不是某个回退方案生效了。

| 提供商 | Secret | 备注 |
|---|---|---|
| Claude 订阅 | `CLAUDE_CODE_OAUTH_TOKEN` | 一键 OAuth，包含在 Pro/Max 中 |
| Anthropic API | `ANTHROPIC_API_KEY` | 按使用量付费 |
| OpenRouter | `OPENROUTER_API_KEY` | `sk-or-…` · Anthropic 原生透传，风险最低 |
| Bankr | `BANKR_LLM_KEY` | `bk_…` · 折扣 Opus |
| UsePod | `USEPOD_TOKEN` | 无前缀——传入 `--provider usepod`。Token 位于基础 URL 中，请妥善保密 |
| Venice | `VENICE_API_KEY` | 无前缀——传入 `--provider venice`。以隐私为先，通过 sidecar 桥接 |
| Surplus | `SURPLUS_API_KEY` | `inf_…` · 在 Base 上结算 USDC——先为钱包充值并完成一次 `approve()` |
| Grok (xAI) | `XAI_API_KEY` | `xai-…` · 透传至 `api.x.ai` |

它以**级联**方式运行，而不是单次选择：优先级最高的密钥先运行，如果出现*任何*失败（没有 credits、触发速率限制、服务中断、响应无效），本次运行就会转到下一个已设置密钥的提供商。只有所有提供商都失败时才会报错。日志会在每次切换时打印 `Routing attempt via '<provider>'`。

- **重新排序：** repo 变量 `GATEWAY_ORDER`（以空格分隔的名称）。
- **固定一个**（禁用故障转移）：`./aeon config set gateway <name>`。
- **任意兼容 Anthropic 的端点：** `ANTHROPIC_API_KEY` 加上 repo 变量 `ANTHROPIC_BASE_URL` — 例如 `https://api.deepseek.com/anthropic`。

### Harness — 运行 skill 的 CLI

`claude`（默认）或 `grok`。Grok harness 会运行 `grok` CLI，而不是 Claude Code，并且**完全绕过 gateway** — 它有自己的身份验证方式。

- **设置方式：** 全局设置为 `./aeon config set harness grok`，或者在单个 skill 的 `aeon.yml` 条目中设置 `harness: "grok"` — **必须加引号，并且位于该条目唯一的内联行上**。每个 skill 的 `model:` 和 `harness:` 会由一个要求双引号的单行 grep 读取（`aeon.yml:367`、`:380`），因此未加引号或拆分到多行的覆盖设置会被静默忽略，skill 会继续运行全局默认值 — 不会报错，而且日志中的 `model=` 行看起来也正常。通过 CLI 设置任一项后，重新读取该条目；如果缺少引号，请补上。
- **身份验证：** `XAI_API_KEY`，或者通过 dashboard 的 **Connect X account** 使用 X 账号（SuperGrok / X Premium+），该操作会存储 `GROK_CREDENTIALS`。X OAuth 流程没有 CLI 标志 — 只需将他们引导至 `./aeon`（dashboard）完成这一步。
- **模型：** `grok-4.5`（默认，推理模型）或 `grok-composer-2.5-fast`（低成本）。
- **没有免费层级。**

请事先告知他们：

- Grok 运行报告会显示 **0 tokens** — 它的 JSON 不携带 token 数量，因此成本跟踪会读取为空。这不是 bug。
- X OAuth 会话会过期。如果无人值守的运行开始因身份验证失败，请重新连接。
- `mode: read-only` 仍然适用（映射为 `--sandbox read-only`），MCP 也可用。

每个 skill 的 grok 参数位于 `SKILL.md` frontmatter 中（Claude harness 会忽略这些参数）：`max_turns`（默认 60）、`best_of_n`、`verify` 和 `effort`（`low|medium|high|xhigh|max` — 仅推理模型支持；`grok-composer-2.5-fast` 不接受该参数）。