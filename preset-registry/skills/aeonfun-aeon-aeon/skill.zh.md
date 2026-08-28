---
name: aeon
description: Set up and run an Aeon agent instance — get started from scratch, pick which skills to turn on or install more from packs, reschedule or change what runs, edit what an existing skill does, fix a skill that isn't firing, set the STRATEGY.md north star and soul/ voice, turn a coding-agent chat into a scheduled Aeon skill, and mine past coding-agent conversations for recurring work worth automating as a skill. Use when the user mentions Aeon, aeon.yml, an Aeon skill / instance / routine / pack, asks to schedule, enable, edit, or debug an agent that runs on a cron, or asks what of their repeated/manual work Aeon could take over.
---
# Aeon

Aeon 是一个通过 Actions 在用户自己的 GitHub 仓库中运行的代理。技能是一个 Markdown 文件（`skills/<name>/SKILL.md`）；`aeon.yml` 指定运行哪些技能以及何时运行。

选择他们所请求的模式：

| | |
|---|---|
| **1 · 开始使用** | 尚无实例，或从头开始设置实例 |
| **2 · 重新安排** | 更改时间、频率或技能关注的内容 |
| **3 · 排除阻塞** | “它没有运行”/“什么都没发生” |
| **4 · 对话 → 技能** | 将我们刚刚完成的工作转换为定时运行的技能 |
| **5 · 编辑技能** | 更改现有技能的行为 |
| **6 · 启用什么** | 选择技能、浏览技能包、安装更多技能 |
| **7 · 策略与表达风格** | `STRATEGY.md` 和 `soul/` —— 指引方向的北极星与表达基调 |
| **8 · 从历史记录中挖掘技能** | “我反复进行的哪些工作可以交给 Aeon？”—— 从过去的编码代理对话中发掘出来 |

## 预检（适用于所有模式）

1. 找到仓库：当前目录 → `gh repo set-default` → 询问用户。如果仓库不在本地，则克隆它。
2. **在执行任何写入命令之前，确认 `gh` 指向他们的实例。**

   ```bash
   gh repo view --json nameWithOwner -q .nameWithOwner
   ```

   如果输出的是 `aeonfun/aeon`，而他们并非要在上游仓库本身开展工作，请停止并运行 `gh repo set-default <owner>/<repo>`。当未固定默认仓库时，`gh` 会优先选择 `upstream` 远程仓库而不是 `origin`，并且 Aeon 的每项写入操作（`auth`、`secrets set`、`skills run`、配置推送）都会调用 `gh -R <resolved>`——因此，它会毫不犹豫地将他们的 API 密钥放到上游仓库，并在那里触发运行。这看起来像是成功了：没有错误，得到了真实的运行 ID，但该技能就是从未在他们的实例上触发。
3. `gh auth status` —— 所有操作都通过 `gh` 进行。如果失败，告知他们运行 `gh auth login`，然后停止。
4. 所有配置写入都使用 `./aeon` CLI。它会保留 `aeon.yml` 中的注释并执行验证。绝不要手动编辑 YAML——只有一个例外：CLI 无法为全新的技能*创建*条目（请参阅模式 4 的第 4 步）。

**不要相信刚创建的技能显示为“已禁用”。** 读取流程会从磁盘列出技能，并将 `aeon.yml` 中缺少条目的技能默认为 `enabled: false`，因此“未配置”和“已禁用”看起来完全相同。可以通过一条命令区分两者：

```bash
comm -23 <(ls skills/*/SKILL.md | cut -d/ -f2 | sort) \
         <(grep -oE '^  [a-z0-9-]+:' aeon.yml | tr -d ' :' | sort)
```

它输出的所有内容都表示技能已存在于磁盘上，但尚未配置。**概览——已安装什么、启用了什么，以及所有内容位于何处：`references/layout.md`。**

**设置任何密钥或令牌：**阅读 `references/secrets.md`——其中列出了每个密钥和仓库变量，以及获取它们的确切页面。始终使用 `./aeon secrets set NAME --stdin` 设置密钥，绝不要将其作为命令参数传入。

---

## 模式 1 —— 开始使用 Aeon

目标：尽快在他们的手机上收到一条真实通知。不要先配置计划。

1. **获取一个仓库。在运行任何命令之前，询问要使用公开仓库还是私有仓库**——这会影响所用命令，而且之后切换意味着需要迁移仓库。

   **公开**（推荐）：Actions 分钟数免费，而且只需一条命令即可获取上游技能更新。

```bash
   gh repo fork aeonfun/aeon --clone && cd aeon
   gh repo set-default <owner>/aeon        # REQUIRED — see below
   ```

   **私有仓库**：公共仓库的派生仓库始终是公开的，因此私有实例只能是镜像，而不是派生仓库。

   ```bash
   gh repo create <name> --private
   git clone --bare https://github.com/aeonfun/aeon.git
   git -C aeon.git push --mirror https://github.com/<owner>/<name>.git
   rm -rf aeon.git && git clone https://github.com/<owner>/<name>.git && cd <name>
   git remote add upstream https://github.com/aeonfun/aeon.git
   gh repo set-default <owner>/<name>      # REQUIRED — see below
   ```

   在他们选择私有仓库之前，请明确说明两项成本：Actions 分钟数会计入账户配额（免费版每月 2,000 分钟——定时运行的技能会消耗这些分钟数），而且更新需要通过 `git fetch upstream && git merge upstream/main` 获取，而不是使用 `gh repo sync`。

   **无论选择哪种方式，在执行任何其他命令之前都要固定默认仓库。** 两种方式最终都会有一个 `upstream` 远程仓库（`gh repo fork --clone` 会自动添加），如果没有固定默认仓库，**`gh` 会优先选择 `upstream`，而不是 `origin`**。Aeon 中的所有操作都会通过 `gh -R $(gh repo view …)` 路由，因此，在未固定默认仓库的检出目录中，密钥会被悄无声息地写入 `aeonfun/aeon`，运行也会被分派到该仓库，而不是他们自己的实例——并且不会出现错误，因为这些命令确实在错误的仓库上成功执行了。验证：

   ```bash
   gh repo view --json nameWithOwner -q .nameWithOwner   # must print THEIR repo
   ```

   完成此步骤后，无论选择哪种方式，后续操作都完全相同。
2. **为模型配置认证。** 至少需要配置一个。最快的方式是使用 `./aeon auth --oauth`（Claude Pro/Max，会打开浏览器），或者使用 `./aeon auth --key <key>`，它会根据**密钥前缀**识别提供商——`sk-ant-oat`（OAuth）、`sk-or-`（OpenRouter）、`bk_`（Bankr）、`inf_`（Surplus）、`xai-`（Grok）；其他任何前缀都会归入 `ANTHROPIC_API_KEY`。

   **UsePod 和 Venice 的密钥没有前缀**，因此无法自动识别。直接使用 `--key` 会将它们保存为普通的 Anthropic 密钥，之后运行时会失败，并显示令人困惑的认证错误。必须明确指定其名称：

   ```bash
   ./aeon auth --key <token> --provider usepod    # same for venice
   ```

   `--dry-run` 会输出解析后的 `method=… → secret …`，而不会调用 `gh` 或 `claude`——只要对提供商有疑问，就值得先运行此命令。

   **不要假定他们订阅了 Claude：**系统支持八个提供商，包括 OpenRouter、Grok 以及使用加密货币结算的网关。请参阅“提供商和工具框架”。
3. **接入一个渠道。** Telegram 是最快的选择：使用 @BotFather 创建机器人，然后执行 `./aeon secrets set TELEGRAM_BOT_TOKEN --stdin` 并设置 `TELEGRAM_CHAT_ID`。暂时跳过 Discord、Slack 和电子邮件——只需一个渠道即可证明它能够正常工作。
4. **立即运行一个技能。** 使用模式 6 进行选择——询问他们希望处理什么，并提出一个建议——然后执行 `./aeon skills run <name>`。等待运行完成，然后执行 `./aeon runs logs <id>`。他们应该会收到一条 Telegram 消息。
5. **之后再为其设置定时运行。** 执行 `./aeon skills enable <name>` 并设置时间（参见模式 2）。

适合作为首个技能的有：`digest`（主题简报）、`github-monitor`（监控他们的仓库）、`heartbeat`（默认已启用，仅在有事项需要关注时报告）。

---

## 模式 2 — 重新安排 / 更改例行任务

以用户**所在时区的时间线**展示他们的一天，而不是配置文件：

```
07:00  digest           "solana"
09:00  pr-review        your repos
18:00  heartbeat        health check
```

使用 `./aeon skills ls --enabled --json` 构建时间线。（`--enabled` 很重要：普通的 `ls` 也会为*已禁用*的技能输出 `SCHEDULE` 列——那只是它们在 `aeon.yml` 中的条目，并不能证明任何任务会触发。）没有 CLI，或者想查看原始文件？`references/layout.md` 中提供了仅使用 grep 的等效方法。然后接收自然语言形式的修改要求并应用：

| 用户说 | 你要做 |
|---|---|
| “把摘要移到早上 7 点” | `./aeon skills schedule digest "0 6 * * *"` |
| “仅工作日” | `... "0 6 * * 1-5"` |
| “太吵了，每周两次” | `... "0 6 * * 1,4"` |
| “停止那个加密货币任务” | `./aeon skills disable token-movers` |
| “改成关于 rust 的内容” | `./aeon skills set digest --var rust` |

规则：
- **`aeon.yml` 中的所有 cron 均使用 UTC。** 从用户的时区进行转换，并明确说明：“巴黎早上 7 点 = UTC `0 6 * * *`（夏季是早上 5 点——要将它固定在当地时间吗？）”系统不支持当地时间选项，因此，如果夏令时很重要，请告知用户一年中哪一半时间会相差一小时。
- 每次更改后，都要向用户确认以其所在时区表示的**接下来 3 次触发时间**。
- 对任何有歧义的操作，先使用 `--dry-run`，展示差异，然后再应用。
- 更改需要推送后才能生效。CLI 会执行推送；确认推送已成功完成。
- **然后检查输出值是否带有引号**——每次都执行一次 grep：

  ```bash
  grep '^  <skill>:' aeon.yml
  ```

  调度器只读取**带双引号**的 `schedule: "…"`。CLI 会以不带引号的形式写入一个*新*键，因此，原先没有 `schedule:` 的条目会变成 `schedule: 0 12 * * *`，导致该技能永远被跳过。详情见下文。

带有 `schedule: workflow_dispatch` 的技能只能按需触发——它们永远不会由 cron 触发。`reactive` 技能根据条件而不是时间触发。

---

## 模式 3 — 排除阻塞问题

“它没有运行。”按以下顺序检查，并在发现第一个问题时停止：

1. **它是否已启用？** `./aeon skills ls --enabled`——它是否在列表中？
2. **是否存在重复键？** `node scripts/validate-config.js`。`aeon.yml` 中重复的技能名称会悄无声息地遮蔽第一个同名条目。这种情况常见于手动编辑之后。
3. **它真的是 cron 任务吗？** `workflow_dispatch` 和 `reactive` 永远不会按计划触发。
4. **Actions 是否已禁用？** `gh api repos/{owner}/{repo}/actions/permissions`。仓库连续 60 天没有活动后，GitHub 会自动禁用定时工作流——这会悄无声息地使 fork 中的任务失效，而 Aeon 不会显示任何相关信息。请在仓库 Settings 中重新启用。
5. **计划值是否带有引号？** `grep '^  <skill>:' aeon.yml`——该值必须是 `schedule: "0 12 * * *"`，**并带有双引号**。

   ```
   schedule: "0 12 * * *"   ✅ fires
   schedule: 0 12 * * *     ❌ never fires, no error anywhere
   ```

   `scheduler.yml` 使用 bash 正则表达式 `schedule: *"([^"]+)"` 匹配计划值。不带引号的值无法匹配，`$SCHED` 会为空，而匹配循环会执行 `[ -z "$SCHED" ] && continue`——每次周期检查时都会被悄无声息地跳过，永远如此。

   出现这种情况的原因：CLI 通过 YAML 文档模型编辑 `aeon.yml`，该模型会保留一个*现有*节点的引号，但会以纯文本样式写入**新添加的**键。因此，对于已有带引号 `schedule:` 的条目，`./aeon skills schedule <name> "0 12 * * *"` 是安全的；但对于原先没有该键的条目，它会悄无声息地将其破坏。首次使用 `--var` 时同样如此。

**除此之外，没有任何其他机制能检测到这一点。** 该文件是有效的 YAML，`validate-config.js` 报告 CLEAN，并且 `./aeon skills ls --enabled` 会列出该技能及其调度计划——因为它们都能正确解析 YAML，只有调度器使用了正则表达式。手动补上引号即可修复。
6. **它是否运行过但失败了？** 先运行 `./aeon runs ls`，然后运行 `./aeon runs logs <id>`。失败的技能会在 30 分钟冷却时间后重试。

如果以上检查都正常，再检查下面三项：

- **它针对的是错误的仓库。** 一个明显迹象是：某条命令报告成功并返回了运行 ID，但在他们的实例上运行 `./aeon runs ls` 却什么也没有。未固定默认仓库时，`gh` 会优先使用 `upstream` 而不是 `origin`，因此未固定的检出仓库会将每次写入都发送到 `aeonfun/aeon`。

  ```bash
  gh repo view --json nameWithOwner -q .nameWithOwner   # if this isn't their repo:
  gh repo set-default <owner>/<repo>
  ```

  然后**清理已经写入上游的内容**——针对正确的仓库重新运行并不会撤销之前的操作。任何在指向错误仓库期间设置的密钥，现在都是别人仓库中的密钥：

  ```bash
  gh secret list -R aeonfun/aeon      # timestamps matching the misfire = theirs
  ```

  **始终先在提供商处轮换密钥**——该密钥曾存在于一个其协作者可以提交工作流来读取它的仓库中。然后在他们的实例上使用 `./aeon secrets set NAME --stdin` 重新设置。

  **不要盲目删除。** `gh secret list` 只显示*最后更新时间*，因此无法告诉你上游仓库是否原本就有这个密钥，以及这次误操作是否**覆盖**了它。删除前先确认：
  - 上游从未有过该密钥 → `gh secret delete <NAME> -R <upstream>`。
  - 上游原本有自己的密钥 → 删除会破坏*他们*的定时运行。仓库所有者必须重新设置上游自己的值；从这里无法撤销这次覆盖。

  如果删除操作返回 403，说明他们从未拥有写入权限——实际上什么都没有写入，之前的命令只是*看起来*成功，但执行过程中已经失败了。
- **缺少密钥。** 技能会在 `requires:` 中声明密钥。将这些密钥与 `./aeon secrets ls --set` 的结果进行核对。缺少可选密钥（`KEY?`）意味着功能会静默降级，而不是因此中断。
- **“没有可用的 MCP 工具。”** 在 Claude harness 中，`.mcp.json` 里只要有一个无法解析的 `${VAR}`，就会让本次运行中的**所有** MCP 服务器失效，而不仅仅是那个出问题的服务器（`::warning::.mcp.json references secret(s) not set:` … `Skipping MCP this run.`）。Grok 则会按服务器分别降级。如果某个 OAuth 服务器之前运行正常、后来导致运行失败，应怀疑轮换后的刷新令牌无法保存——参见 `references/mcp.md`。
- **它运行了，但什么也没发送。** 这通常是正确行为。Aeon 的约定是没有信号时保持静默——一次干净的运行不会发送任何内容，而不是发送一份空报告。

注意：GitHub 只会交付 `*/5` cron 触发的大约 10%，因此调度器会在最多 12 小时内补上错过的时间点。技能晚 40 分钟触发属于正常现象。

---

## 模式 4 — 将此聊天转换为技能

他们刚刚在本次聊天中完成了某件事，并希望它按计划自动执行。

1. **编写技能文件。** `skills/<name>/SKILL.md` — 先写 frontmatter，再写提示词。根据会话中实际发生的内容来提炼：
   - 提示词正文 = 他们提出的要求，加上实际有效的步骤
   - `mode:` = `read-only`，除非它需要提交更改或创建 PR
   - `requires:` = 工作过程中用到的任何 API 密钥（如果没有该密钥也能降级运行，则使用 `KEY?`）
   - `category:` = `core evolution basics dev crypto productivity` 中的一个
   - 如果他们喜欢生成的结果，就将一份裁剪后的示例粘贴到正文中，作为格式规范。

2. **修复会导致无人值守运行中断的三件事：**
   - **现场没有人。** 任何你曾向他们提问的地方，都必须改成默认值或规则。
   - **不要在没有内容时保持沉默。** 明确添加“如果没有值得报告的内容，则记录日志并退出，不发送通知。”否则它会在一周后被静音。
   - **不要重复昨天的内容。** 添加“检查 `memory/logs/` 中最近 3 天的内容，并跳过已经报告过的事项。”

3. **检查它是否真的能在那里运行。** 不要使用本地文件系统，也不要使用已登录的工具。如果该会话读取了他们的主目录或使用了本地 MCP 服务器，请明确说明——除非将其配置为仓库 secret / `.mcp.json`，否则那部分无法无人值守运行。有关为无人值守使用配置 MCP 服务器（dashboard Connect、OAuth 刷新、轮换 token 的 PAT）：`references/mcp.md`。

4. **自行添加 `aeon.yml` 条目。** 磁盘上的新 skill 不会自动拥有条目，而 `./aeon skills enable|schedule` **不会创建条目**——它们只会切换已经存在的条目，并报告 `no change — already in that state`，但这其实是不正确的。手动添加该条目，并在 fallback `heartbeat:` 行之前将其设为禁用：

   ```yaml
     my-skill: { enabled: false, schedule: "0 12 * * *" }
   ```

   **即使处于禁用状态，也要包含带引号的 `schedule:`——这些引号是必需的。** 如果写成不带引号的 `{ enabled: false }`，再让 `./aeon skills schedule` 稍后添加该键，就会生成调度器无法读取的*不带引号*的值，导致该 skill 永远不会触发（Mode 3，检查项 5）。在这里预先写入带引号的节点，可以确保之后每次 CLI 编辑都保留引号。

   与其他 61 个条目使用的内联 `{ … }` 格式保持一致，并放在同一行。`aeon.yml:367` 使用单行 grep 读取每个 skill 的 `model:`/`harness:` 覆盖设置，因此跨行拆分的条目会采用全局默认值。

   这是“永远不要手动编辑 YAML”这一原则唯一获准的例外。之后进行验证：`node scripts/validate-config.js`——但请注意，它只检查结构，无法捕获不带引号的值。

5. **重新生成两个 catalog，然后通过 PR 提交。** 新 skill 会触发三个 CI 检查门。请在本地运行它们——**没有任何规则会阻止红色检查合并**，`main` 未受保护，也没有 ruleset，因此未运行的检查只会在事后失败：

   ```bash
   bash scripts/check-skill-categories.sh   # category is one of the six
   bin/generate-skills-json                 # catalog/skills.json
   bin/generate-packs-json                  # catalog/packs.json — NOT optional
   ```

   `generate-packs-json` 是所有人最容易忘记的那个：`catalog/skills.json` 本身就是 `ci-packs-json` 的触发路径，因此提交 skills catalog 而不提交 pack catalog，会导致一个你根本没有修改过的 workflow 变红。两个文件都要提交。

   完整的检查门列表、触发条件，以及 `ci-tests` / `ci-apps` 命令：`references/ci.md`。

6. **运行一次**（`./aeon skills run <name>`），向他们展示输出，然后通过 Mode 2 为其设置调度。

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
1. <the procedure — 43 of 77 skills lead with this>

## Network note
<curl / WebFetch / `./secretcurl` / `gh api` — how this skill fetches>

## Log
Report via `./notify` (use `./notify -f file.md` for anything multi-line).
Send nothing if there's nothing worth reporting.
Append what you did to `memory/logs/${today}.md` under a `### <skill-name>` heading.
```

正文长度为 133–757 行（中位数约为 306 行）——skill 是用散文写成的提示词，而不是配置文件。`## Steps` / `## Network note` / `## Constraints` / `## Log` 是约定的结构。

编写时有四件容易踩坑的事——完整细节见 `references/skill-anatomy.md`：

- **`requires:` 是最小权限白名单——运行时只会导出此处列出的键。** 内联形式（`requires: [KEY?]`）和块形式（`- KEY` 行）都能解析，可以位于顶层，也可以嵌套在 `metadata:` 下。需要注意的是值：只有匹配 `^[A-Z][A-Z0-9_]{2,}$` 的名称（末尾的 `?` 表示可选）才会被注入；小写或格式错误的条目会被静默丢弃。
- **`mode:` 拼写错误会授予写入权限。** 未知值会回退到 `write`，而不是更安全的层级。准确的字符串是 `read-only`。
- **`${today}` / `${var}` 不会被模板化。** 没有任何东西会重写 `SKILL.md`；工作流会将日期和 var 放入外围提示词中，由模型在上下文中解析。自行发明 `${my_thing}` 会得到字面量 `${my_thing}`。
- **绝不要把密钥放在命令行上。** 使用带有花括号占位符 `{ENV_NAME}` 的 `./secretcurl`——Claude Code 的权限分析器会在运行时阻止 `$SECRET` 展开。

计划任务**不要**放在 `SKILL.md` 中——它们位于 `aeon.yml`。仍有 10 个上游 skill 带有 `schedule:` 或 `cron:` frontmatter 行；**没有任何东西会读取它**（`scheduler.yml` 只解析 `aeon.yml`）。不要照搬这种模式，也不要相信你找到的类似配置——请检查 `aeon.yml`。

---

## 模式 5 — 更改现有 skill 的行为

“让摘要更短”“停止涵盖 X”“添加一个来源”。这比编写全新的 skill 更常见。

**首先，检查这是否是配置更改，而不是文件编辑。** 大多数 skill 通过 `var` 接收主题、过滤器或模式——在修改正文之前，先阅读该 skill 的 `var:` 行以及其 `aeon.yml` 条目上的注释。如果 `var` 已经涵盖了需求，就完成了：

```bash
./aeon skills set digest --var "rust"          # 完全不编辑文件
```

否则编辑 `skills/<name>/SKILL.md`：

1. **先通读整个正文。** 这些文件很长（200–750 行），包含判断规则、退出分类和评分标准；针对性编辑可能会在不知不觉中与这些内容矛盾。
2. **不要删掉维持正常运行的机制。** 无论其他内容如何变化，该 skill 都必须保留：`./notify` 路径、无信号时静默退出、在 `### <skill-name>` 下追加到 `memory/logs/${today}.md`，以及任何已有的去重逻辑。旨在“收紧” skill 的编辑经常会删掉这些内容。`### <skill-name>` 标题会被健康检查循环解析，而去重规则会读取日志中最近 3 天的内容——破坏其中任一项，都会使 skill 持续重复报告，直到被静音。相关约定见 `references/skill-anatomy.md`。
3. **如果行为发生了变化，就更新 frontmatter。** 新增的数据源需要一个键 → 将其添加到 `requires:`。现在会写入文件或打开 PR → 使用 `mode: write`。如果修改了 `description:`、`name:`、`category:` 或 `requires:` → 重新生成**两个** catalog（`bin/generate-skills-json && bin/generate-packs-json`）并提交二者；`skills.json` 携带这些字段，并为 `packs.json` 提供数据。参见 `references/ci.md`。
4. **如果它是上游 skill，请发出警告。** 任何随 `aeonfun/aeon` 发布的内容，都会在下一次 `git merge upstream/main` 时发生冲突。这样做没问题，但要说明这一点——两个仓库的约定是让本地编辑保持审慎且尽量少。
5. **运行一次**（`./aeon skills run <name>`），并在结束前阅读输出。

自动化替代方案：仓库内的 `autoresearch` skill 会生成四个经过评分的变体，并将胜出的版本作为 PR 发布，从而持续改进目标 skill。当需求是“把这个做得更好”，而不是要求进行某项具体更改时，可以使用它。

---

## 模式 6——“我应该启用什么？”

这是引导用户上手时真正的第一个问题。**不要把目录一股脑全列出来。** 先询问他们希望在离开期间实际处理什么，然后提出 **三个** skill，每个附上一行理由。

一次提供三个，而不是十二个。每个启用的 skill 都会产生周期性通知，而让实例从第一天开始变得嘈杂，是最快将其扼杀的方法。`heartbeat` 已经启用，除非有事情需要处理，否则会保持静默。

```bash
./aeon skills ls                 # all skills — SKILL / ON / SCHEDULE / PACK / DESC
./aeon skills ls --enabled       # only what actually runs
./aeon skills ls --pack crypto   # one pack
./aeon skills <name>             # one skill's detail
./aeon packs ls                  # the six first-party packs
```

读取 `ls` 输出的页脚，例如 `77 skills · 1 enabled`，并在提出建议前先告诉他们。首次运行会安装 CLI 运行时（tsx + yaml，约 12MB）；npm 输出的噪声只会出现一次，属于预期现象。仅使用 grep 的等价方式：`references/layout.md`。

Pack 是可见性筛选器，而不是运行时开关——显示某个 pack 不会运行任何内容。Core（12 个）、Evolution（9 个）和 Basics（18 个）默认显示；Dev（12 个）、Crypto（15 个）和 Productivity（11 个）按需显示。

合理的起始组合：

| 他们关注的内容 | 建议 |
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

所有内容都会以 **禁用** 状态安装，经过安全扫描，并在 `skills.lock` 中记录来源信息。

**启用社区 SKILL.md 之前先阅读它。** 安装一个 pack，就意味着在注入你的机密信息后运行陌生人的提示词。扫描器基于正则表达式——无法捕获提示词注入。检查 `requires:` 是否与其所声明的任务相匹配，`capabilities:` 是否如实，以及是否有任何指示要求 agent 将数据发送到无关的地方。

**在启用任何具有现实世界影响范围的内容前，都必须明确确认：** `distribute-tokens`（发送 USDC）、`schedule-ads`（花钱）、`send-email` 和 `vuln-scanner`（联系真实的人）、`deploy-prototype` 和 `feature`（推送到其他人的代码仓库）。

---

## 模式 7——策略与语气

有两个文件会进入 **每次**运行的上下文。两者都不是必需的，成本也都很低，但它们对输出质量的提升超过任何针对单个 skill 的调优。

### `STRATEGY.md`——北极星

它会被导入 `CLAUDE.md`，因此会出现在每个 skill 的上下文中：目标、优先级、受众、硬性约束。当某个选择无法通过其他方式确定时，它可以打破平局。保持它**简洁**（每次运行都会消耗 token），并且**具体**（模糊的策略无法打破平局）。

```bash
./aeon strategy show
./aeon strategy set --file STRATEGY.md
./aeon strategy build "<one-line goal>"    # dispatches the strategy-builder skill
```

`build` 会读取 brief、仓库 README 和 `memory/MEMORY.md`，然后提交一个草稿。它作为 Action 运行，因此完成后请执行 pull。无需 API 密钥。

### `soul/` — 它的表达方式

默认情况下，Aeon 没有个性。每次运行时都会读取 `soul/SOUL.md`（身份、世界观、观点）和 `soul/STYLE.md`（语气、词汇、反模式），因此通知和内容听起来会像操作者本人。`soul/examples/` 中存放了 10–20 个校准样本。

```bash
./aeon soul show
./aeon soul build --handle <x-handle> --name "<Full Name>" --links <url,url>
```

`XAI_API_KEY` 能够对真实的 X 时间线进行最丰富的读取；没有它时，`soul-builder` 会退回到网页搜索。github.com/aeonfun/soul.md 还有一个完整示例 soul 集合，可以从中开始。

**质量标准：具体到可能出错。** *“我认为大多数 AI 安全讨论都是自以为是的银河脑式自我安慰”* 是有用的。*“我对 AI 安全有细腻的看法”* 则不是。应当努力做到前一种程度——一个不会冒犯任何人的 soul，不会听起来像任何人。

---

## 模式 8 — 挖掘历史记录，寻找可自动化的技能

“我反复手动做的事情中，有哪些是 Aeon 可以直接完成的？”模式 4 会把*当前*对话变成技能；模式 8 则会挖掘*过去*的对话，找出哪些对话值得转化为技能。它会读取操作者本地的 coding-agent transcripts（`~/.claude/projects` 或 `~/.codex/sessions`），因此只在操作者自己的机器上运行——绝不会在 Aeon 运行过程中执行。

1. **扫描。** 从实例仓库根目录运行 miner：

   ```bash
   node "${PLUGIN_ROOT:-$CLAUDE_PLUGIN_ROOT}/skills/aeon/scripts/mine-history.mjs" --days 45 --top 15
   ```

   它会解析时间窗口内每个顶层 session（跳过 subagent sidechains），将 shell 命令规范化为 `binary subcommand`，对 session 标题进行分组，并按 **distinct sessions × distinct days** 对摘要进行排名——关注的是重复频率和节奏，而不是原始数量。参数包括：`--days N`（时间窗口，默认 120）、`--project SUBSTR`（仅包含 cwd 匹配的 session——将范围限定到一个仓库/主题）、`--top N`、`--min-sessions N`、`--json`。它没有依赖项，如果没有历史记录，会返回干净的错误。有关表格的深入解读和候选项评估标准，请参阅 `references/history-mining.md`。

2. **像人一样阅读它。** 摘要只是原始信号，不是结论——判断取决于你：
   - **重复出现的命令工作流**——某个 `binary subcommand` 在许多 session、许多日期中反复出现，说明它是一种习惯。通用基础操作（`git status`、`gh auth`、裸 `node`/`python3`）已经被过滤掉，但 `gh pr`/`gh api`/`npm run` 也属于基础设施，在各处都很常见，作为技能构想的价值较弱。应寻找*具有独特性的重复调用*：命名脚本、特定 CLI（`x-cli`、`langfuse`、`raindrop`），或一组紧密相关的 `gh api` 模式。
   - **重复出现的任务主题**——分组后的 session 标题是最强的信号。在许多天里、以大致固定的节奏反复出现的标题（“检查 X”、“审查 Y”、“汇总 Z”），几乎总是真正的自动化候选项。
   - **工具 / 项目**——工作涉及哪些 MCP servers 和仓库；这会告诉你技能需要接入什么，以及应在哪里限定 `--project` 的范围。

3. **筛选真正的候选项。** 只有同时满足以下所有条件的行，才值得提出：
   - **具有重复性**——跨多个日期的多次会话，而不是某个繁忙的下午。
   - **属于获取/计算/报告型**——拉取或检查某些内容并进行报告。交互式、需要大量决策或一次性的迁移工作都*不应*自动化。
   - **可安全无人值守运行**——不依赖本地文件、已登录的桌面应用，也不需要人在任务中途进行响应（Mode 4 的第 2/3 步会涵盖加固）。
   - **尚未成为 skill。** 针对实例执行去重：`./aeon skills ls`。许多重复性的 `gh pr` 工作已经由 `pr-review`/`pr-check` 覆盖；研究节奏已经由 `digest`/`mention-radar` 覆盖。如果已有 skill 能覆盖该工作，应采用 Mode 2（重新安排）或 Mode 5（编辑其 `var`），**而不是**创建新 skill。

4. **提出三个候选项，并提供证据。** 不要倾倒整份摘要。请指定**三个**候选项，并分别提供其重复次数作为证明（“你在 D 天内的 N 次会话中执行了 X”）、一行 skill 草案（它获取什么、发送什么）、建议的 `mode:`（如果只获取并报告，则使用 `read-only`），以及根据观察到的节奏推断出的建议 `schedule:`（约每天出现 → daily；约每周出现 → weekly）。询问用户希望构建哪一个。

5. **交接给 Mode 4 来编写所选 skill**——使用相同的 skill 文件结构、无人值守加固、带引号的 `schedule:` 条目，以及双目录 CI。Mode 8 负责发现工作；Mode 4 负责交付它。

**隐私：**会话记录在本地读取，只有聚合后的摘要会被展示。不要将会话中的原始提示正文或任何敏感内容粘贴到频道中，也不要写入提交的文件；计数和标题已经足以完成决策。

---

## Provider 与 harness

这是两个相互独立的维度。不要混淆：**gateway** 决定由哪个模型作答；**harness** 决定使用哪个 CLI 来运行 skill。

### Gateway — Claude Code 的驱动力

设置一个 secret 后即可生效。`aeon.yml` 自带 `gateway: { provider: auto }`，它会在运行时根据现有的密钥进行解析，优先级如下：

```
claude → anthropic → openrouter → bankr → usepod → venice → surplus → grok
```

`direct` **不是**该链中的一跳——当八个 secret 均未设置时，它只是占位符。它不需要任何内容，也不会进行任何配置，因此运行会继续使用当前存在的 `ANTHROPIC_*` 环境变量；如果不存在，则会在第一次模型调用时失败。日志中“Resolved to `direct`”表示**未找到任何密钥**，并不表示某个回退方案成功了。

| Provider | Secret | Notes |
|---|---|---|
| Claude 订阅 | `CLAUDE_CODE_OAUTH_TOKEN` | 一键 OAuth，包含在 Pro/Max 中 |
| Anthropic API | `ANTHROPIC_API_KEY` | 按使用量付费 |
| OpenRouter | `OPENROUTER_API_KEY` | `sk-or-…` · Anthropic 原生透传，风险最低 |
| Bankr | `BANKR_LLM_KEY` | `bk_…` · 折扣版 Opus |
| UsePod | `USEPOD_TOKEN` | 无前缀——传入 `--provider usepod`。Token 位于基础 URL 中，请妥善保密 |
| Venice | `VENICE_API_KEY` | 无前缀——传入 `--provider venice`。隐私优先，通过 sidecar 桥接 |
| Surplus | `SURPLUS_API_KEY` | `inf_…` · 在 Base 上结算 USDC——先为钱包注资并执行一次 `approve()` |
| Grok (xAI) | `XAI_API_KEY` | `xai-…` · 透传至 `api.x.ai` |

它以**级联**方式运行，而不是单次选择：优先级最高的 key 先运行，遇到*任何*失败（没有 credits、触发速率限制、服务中断、响应无效）时，运行会转到下一个已设置 key 的 provider。只有所有 provider 都失败时才会报错。日志会在每次跳转时打印 `Routing attempt via '<provider>'`。

- **重新排序：** repo 变量 `GATEWAY_ORDER`（以空格分隔的名称）。
- **固定一个**（禁用故障转移）：`./aeon config set gateway <name>`。
- **任意兼容 Anthropic 的端点：** `ANTHROPIC_API_KEY` 加上 repo 变量 `ANTHROPIC_BASE_URL` — 例如 `https://api.deepseek.com/anthropic`。

### Harness — 运行 skill 的 CLI

`claude`（默认）或 `grok`。Grok harness 运行 `grok` CLI 而不是 Claude Code，并且**完全绕过 gateway** — 它有自己的身份验证方式。

- **设置方式：** 全局设置为 `./aeon config set harness grok`，或者在单个 skill 的 `aeon.yml` 条目中设置 `harness: "grok"` — **必须加引号，并写在该条目的一行内**。每个 skill 的 `model:` 和 `harness:` 都由要求双引号的单行 grep 读取（`aeon.yml:367`、`:380`），因此未加引号或拆分到多行的覆盖设置会被静默忽略，skill 会继续运行全局默认值 — 不会报错，而且日志中的 `model=` 行看起来正常。通过 CLI 设置任一项后，请重新读取该条目，并在缺少引号时补上。
- **身份验证：** `XAI_API_KEY`，或通过 dashboard 的**Connect X account** 使用 X 账户（SuperGrok / X Premium+），该操作会存储 `GROK_CREDENTIALS`。X OAuth 流程没有 CLI flag — 这一步请让他们使用 `./aeon`（dashboard）完成。
- **模型：** `grok-4.5`（默认，推理模型）或 `grok-composer-2.5-fast`（低成本）。
- **没有免费层级。**

请提前告知他们：
- Grok 运行报告中的 **0 tokens** — 它的 JSON 不包含 token 计数，因此成本跟踪会显示为空。这不是 bug。
- X OAuth 会话会过期。如果无人值守的运行开始因身份验证失败，请重新连接。
- `mode: read-only` 仍然适用（映射为 `--sandbox read-only`），并且 MCP 可用。

每个 skill 的 grok 参数位于 `SKILL.md` frontmatter 中（Claude harness 会忽略这些参数）：`max_turns`（默认 60）、`best_of_n`、`verify` 和 `effort`（`low|medium|high|xhigh|max` — 仅适用于推理模型；`grok-composer-2.5-fast` 不接受该参数）。