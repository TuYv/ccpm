---
name: aeon
description: Set up and run an Aeon agent instance — get started from scratch, pick which skills to turn on or install more from packs, reschedule or change what runs, edit what an existing skill does, fix a skill that isn't firing, set the STRATEGY.md north star and soul/ voice, turn a coding-agent chat into a scheduled Aeon skill, and mine past coding-agent conversations for recurring work worth automating as a skill. Use when the user mentions Aeon, aeon.yml, an Aeon skill / instance / routine / pack, asks to schedule, enable, edit, or debug an agent that runs on a cron, or asks what of their repeated/manual work Aeon could take over.
---
# Aeon

Aeon 是一个通过 Actions 在用户自己的 GitHub 仓库上运行的代理。技能是一个 Markdown 文件（`skills/<name>/SKILL.md`）；`aeon.yml` 用于指定运行哪些技能以及何时运行。

选择他们所需的模式：

| | |
|---|---|
| **1 · 开始使用** | 尚无实例，或从头开始设置实例 |
| **2 · 重新排期** | 更改时间、频率或技能的关注重点 |
| **3 · 排除阻塞** | “它没有运行”/“什么都没发生” |
| **4 · 聊天 → 技能** | 将我们刚才所做的工作转换为定时运行的技能 |
| **5 · 编辑技能** | 更改现有技能的行为 |
| **6 · 启用什么** | 选择技能、浏览技能包、安装更多技能 |
| **7 · 策略与风格** | `STRATEGY.md` 和 `soul/`——指导方向与表达基调 |
| **8 · 从历史记录中挖掘 → 技能** | “我反复进行的哪些工作可以交给 Aeon？”——从以往的编码代理聊天记录中找出这些工作 |

## 预检（适用于所有模式）

1. 找到仓库：当前目录 → `gh repo set-default` → 询问。如果本地没有该仓库，则将其克隆到本地。
2. **在执行任何写入命令之前，确认 `gh` 指向他们自己的实例。**

   ```bash
   gh repo view --json nameWithOwner -q .nameWithOwner
   ```

   如果输出的是 `aeonfun/aeon`，而他们并非要在上游仓库本身进行操作，请停止并运行 `gh repo set-default <owner>/<repo>`。如果没有固定默认仓库，`gh` 会优先选择 `upstream` 远程仓库而不是 `origin`，并且 Aeon 的每项写入操作（`auth`、`secrets set`、`skills run`、配置推送）都是一次 `gh -R <resolved>` 调用——因此，它会毫不犹豫地把他们的 API 密钥放到上游仓库，并在那里分派运行任务。表面上看一切成功：没有错误、获得了真实的运行 ID，但技能就是永远不会在他们自己的实例上触发。
3. `gh auth status`——所有操作都通过 `gh` 进行。如果失败，请让他们运行 `gh auth login`，然后停止。
4. 所有配置写入都使用 `./aeon` CLI。它会保留 `aeon.yml` 中的注释并执行验证。绝不要手动编辑 YAML——只有一个例外：CLI 无法为全新技能*创建*条目（参见模式 4 的第 4 步）。

**不要相信刚创建的技能显示为“已禁用”。** 读取路径会列出磁盘上的技能，并将 `aeon.yml` 中缺少条目的技能默认为 `enabled: false`，因此“未配置”和“已禁用”看起来完全相同。可以用一条命令区分它们：

```bash
comm -23 <(ls skills/*/SKILL.md | cut -d/ -f2 | sort) \
         <(grep -oE '^  [a-z0-9-]+:' aeon.yml | tr -d ' :' | sort)
```

该命令输出的任何技能都已存在于磁盘上，但尚未配置。**入门指引——已安装什么、启用了什么，以及所有内容位于何处：`references/layout.md`。**

**设置任何密钥或令牌时：**阅读 `references/secrets.md`——其中列出了所有密钥和仓库变量，以及获取它们的具体页面。始终使用 `./aeon secrets set NAME --stdin` 设置密钥，绝不要将其作为命令参数传入。

---

## 模式 1——开始使用 Aeon

目标：快速在他们的手机上收到一条真实通知。不要先配置定时计划。

1. **获取一个仓库。在运行任何命令之前，先询问要使用公开仓库还是私有仓库**——这会影响所用命令，而且之后切换意味着必须迁移仓库。

   **公开仓库**（推荐）：Actions 分钟数免费，而且只需一条命令即可获取上游技能更新。

```bash
   gh repo fork aeonfun/aeon --clone && cd aeon
   gh repo set-default <owner>/aeon        # REQUIRED — see below
   ```

   **私有实例**：公共仓库的复刻始终是公开的，因此私有实例是镜像，而不是复刻。

   ```bash
   gh repo create <name> --private
   git clone --bare https://github.com/aeonfun/aeon.git
   git -C aeon.git push --mirror https://github.com/<owner>/<name>.git
   rm -rf aeon.git && git clone https://github.com/<owner>/<name>.git && cd <name>
   git remote add upstream https://github.com/aeonfun/aeon.git
   gh repo set-default <owner>/<name>      # REQUIRED — see below
   ```

   在他们选择私有实例之前，明确说明两项成本：Actions 分钟数会计入账户配额（免费版每月 2,000 分钟——定时运行的技能会消耗这些分钟数），而且更新需要使用 `git fetch upstream && git merge upstream/main`，而不是 `gh repo sync`。

   **无论采用哪种方式，都要在执行任何其他命令之前固定默认仓库。** 两种方式最终都会有一个 `upstream` 远程仓库（`gh repo fork --clone` 会自动添加），而且如果没有固定默认仓库，**`gh` 会优先选择 `upstream` 而不是 `origin`**。Aeon 中的所有操作都通过 `gh -R $(gh repo view …)` 路由，因此，在未固定默认仓库的检出目录中，密钥会被悄无声息地写入 `aeonfun/aeon`，运行也会针对它触发，而不是针对他们自己的实例——且不会出现任何错误，因为这些命令确实在错误的仓库上成功执行了。验证：

   ```bash
   gh repo view --json nameWithOwner -q .nameWithOwner   # must print THEIR repo
   ```

   此步骤之后的所有操作，无论采用哪种方式都完全相同。
2. **为模型配置身份验证。** 至少需要配置一个模型。最快的方法是使用 `./aeon auth --oauth`（Claude Pro/Max，会打开浏览器），或者使用 `./aeon auth --key <key>`，它会**根据密钥前缀**检测提供商——`sk-ant-oat`（OAuth）、`sk-or-`（OpenRouter）、`bk_`（Bankr）、`inf_`（Surplus）、`xai-`（Grok）；其他任何前缀都会归入 `ANTHROPIC_API_KEY`。

   **UsePod 和 Venice 的密钥没有前缀**，因此无法检测；如果只使用 `--key`，它们会被保存为普通的 Anthropic 密钥，之后运行时会因令人困惑的身份验证错误而失败。必须明确指定名称：

   ```bash
   ./aeon auth --key <token> --provider usepod    # same for venice
   ```

   `--dry-run` 会输出解析后的 `method=… → secret …`，而不会调用 `gh` 或 `claude`——只要无法确定提供商，就值得运行此命令。

   **不要假设他们订阅了 Claude：**支持九种提供商，包括 OpenRouter、Grok、GLM，以及使用加密货币结算的网关。请参阅“提供商和执行框架”。
3. **连接一个渠道。** Telegram 是最快的选择：使用 @BotFather 创建一个机器人，然后运行 `./aeon secrets set TELEGRAM_BOT_TOKEN --stdin` 并设置 `TELEGRAM_CHAT_ID`。暂时跳过 Discord、Slack 和电子邮件——一个渠道就足以证明它可以正常工作。
4. **立即运行一个技能。** 使用模式 6 选择技能——询问他们希望处理什么，并推荐一个——然后运行 `./aeon skills run <name>`。等待运行完成，然后执行 `./aeon runs logs <id>`。他们应该会收到一条 Telegram 消息。
5. **只有完成上述步骤后，才为其设置定时运行。** 运行 `./aeon skills enable <name>` 并设置时间（参见模式 2）。

适合作为第一个技能的有：`digest`（主题简报）、`github-monitor`（监控他们的仓库）、`heartbeat`（默认已启用，仅在有事项需要关注时报告）。

---

## 模式 2 — 重新安排 / 更改例行任务

以**时间线的形式，并使用他们自己的时区**向他们展示当天的安排，而不是展示配置文件：

```
07:00  digest           "solana"
09:00  pr-review        your repos
18:00  heartbeat        health check
```

使用 `./aeon skills ls --enabled --json` 构建时间线。（`--enabled` 很重要：普通的 `ls` 也会为*已禁用*的技能输出 `SCHEDULE` 列——那只是它们在 `aeon.yml` 中的条目，不能证明任何任务会触发。）没有 CLI，或者想查看原始文件？`references/layout.md` 中提供了仅使用 grep 的等效方法。然后接收自然语言形式的修改要求并应用：

| 他们说 | 你执行 |
|---|---|
| “把摘要移到早上 7 点” | `./aeon skills schedule digest "0 6 * * *"` |
| “只在工作日” | `... "0 6 * * 1-5"` |
| “太吵了，每周两次” | `... "0 6 * * 1,4"` |
| “停掉那个加密货币任务” | `./aeon skills disable token-movers` |
| “改成关于 rust 的内容” | `./aeon skills set digest --var rust` |

规则：
- **`aeon.yml` 中的所有 cron 均使用 UTC。** 根据他们的时区进行转换，并明确说明：“巴黎时间早上 7 点 = UTC `0 6 * * *`（夏令时期间是早上 5 点——想将它固定在本地时间吗？）”目前没有本地时间选项，因此如果 DST 很重要，请告诉他们一年中哪半年会相差一小时。
- 每次更改后，向他们确认以其所在时区表示的**接下来 3 次触发时间**。
- 对任何有歧义的操作先使用 `--dry-run`，显示差异，然后再应用。
- 更改需要推送后才能生效。CLI 会执行推送；确认推送已成功。
- **然后检查输出的值是否带引号**——每次都执行一次 grep：

  ```bash
  grep '^  <skill>:' aeon.yml
  ```

  调度器只读取**带双引号**的 `schedule: "…"`。CLI 写入*新*键时不会添加引号，因此，原本没有 `schedule:` 的条目会变成 `schedule: 0 12 * * *`，导致该技能永远被跳过。详情见下文。

带有 `schedule: workflow_dispatch` 的技能只能按需运行——它们永远不会通过 cron 触发。`reactive` 技能根据条件而非时间触发。

---

## 模式 3 — 排除阻塞问题

“它没有运行。”按以下顺序检查，并在发现第一个问题时停止：

1. **它启用了吗？** `./aeon skills ls --enabled`——它是否列在其中？
2. **存在重复键吗？** `node scripts/validate-config.js`。`aeon.yml` 中重复的技能名称会悄无声息地遮蔽第一个同名条目。这通常发生在手动编辑之后。
3. **它真的是 cron 吗？** `workflow_dispatch` 和 `reactive` 永远不会按计划触发。
4. **Actions 被禁用了吗？** `gh api repos/{owner}/{repo}/actions/permissions`。仓库连续 60 天没有活动后，GitHub 会自动禁用计划工作流——这会悄无声息地导致 fork 失效，而 Aeon 中不会显示任何相关信息。在仓库的 Settings 中重新启用。
5. **计划值带引号吗？** `grep '^  <skill>:' aeon.yml`——值必须是 `schedule: "0 12 * * *"`，**并带有双引号**。

   ```
   schedule: "0 12 * * *"   ✅ fires
   schedule: 0 12 * * *     ❌ never fires, no error anywhere
   ```

   `scheduler.yml` 使用 bash 正则表达式 `schedule: *"([^"]+)"` 匹配计划。不带引号的值无法匹配，`$SCHED` 为空，而匹配循环会执行 `[ -z "$SCHED" ] && continue`——每次轮询都悄无声息地跳过，永远如此。

   造成这种情况的原因：CLI 通过一个 YAML 文档模型编辑 `aeon.yml`，该模型会保留*现有*带引号节点的样式，但会以纯文本样式写入**新添加的**键。因此，对于已经有带引号 `schedule:` 的条目，`./aeon skills schedule <name> "0 12 * * *"` 是安全的；但对于原本没有该键的条目，它会悄无声息地导致配置失效。首次设置 `--var` 时也一样。

**除此之外，没有任何机制能检测到这个问题。** 该文件是有效的 YAML，`validate-config.js` 报告 CLEAN，`./aeon skills ls --enabled` 也会列出该技能及其调度计划——因为它们都能正确解析 YAML，只有调度器使用正则表达式。请手动添加引号来修复。
6. **它是否运行后失败了？** 先运行 `./aeon runs ls`，再运行 `./aeon runs logs <id>`。失败的技能会在 30 分钟的冷却期后重试。

如果以上检查均无异常，再检查以下三项：

- **它针对错误的仓库运行了。** 明显迹象是：某条命令报告成功并返回了运行 id，但在他们的实例上执行 `./aeon runs ls` 却看不到任何记录。如果没有固定默认仓库，`gh` 会优先选择 `upstream` 而非 `origin`，因此未固定默认仓库的检出会将所有写入操作发送到 `aeonfun/aeon`。

  ```bash
  gh repo view --json nameWithOwner -q .nameWithOwner   # if this isn't their repo:
  gh repo set-default <owner>/<repo>
  ```

  然后**清理误写入上游仓库的内容**——针对正确仓库重新运行并不会撤销这些操作。指向错误仓库期间设置的任何密钥，现在都成了别人仓库中的密钥：

  ```bash
  gh secret list -R aeonfun/aeon      # timestamps matching the misfire = theirs
  ```

  **始终先在提供商处轮换该密钥**——它曾经存放在一个其协作者可以提交工作流来读取它的仓库中。然后使用 `./aeon secrets set NAME --stdin` 在他们的实例上重新设置该密钥。

  **不要盲目删除它。** `gh secret list` 只显示*最后更新时间*，因此无法判断上游仓库是否原本就有该密钥，而这次误操作将其**覆盖**了。删除前先询问：
  - 上游仓库从未有过该密钥 → `gh secret delete <NAME> -R <upstream>`。
  - 上游仓库原本有自己的密钥 → 删除会破坏*他们的*计划运行。所有者必须重新设置上游仓库自己的值；此次覆盖无法从这里撤销。

  如果删除操作返回 403，说明他们从未拥有写入权限——因此实际上没有写入任何内容，之前的命令只是*看起来*成功，实际已经失败。
- **缺少密钥。** 技能会在 `requires:` 中声明所需的密钥。使用 `./aeon secrets ls --set` 检查这些密钥是否已设置。缺少可选密钥（`KEY?`）意味着功能会静默降级，而不是直接失败。
- **“没有可用的 MCP 工具。”** 在 Claude 运行环境中，`.mcp.json` 里只要有一个无法解析的 `${VAR}`，就会为本次运行禁用**所有** MCP 服务器，而不只是存在问题的那个（`::warning::.mcp.json references secret(s) not set:` … `Skipping MCP this run.`）。Grok 则会按服务器分别降级。如果某个 OAuth 服务器之前工作正常，之后却导致运行失败，应怀疑轮换后的刷新令牌无法保存——参见 `references/mcp.md`。
- **它运行了，但什么都没发送。** 这通常是正确行为。Aeon 的惯例是在没有信号时保持静默——一次没有发现问题的运行不会发送空报告。

注意：GitHub 只会触发约 10% 的 `*/5` cron 时间点，因此调度器会补执行过去最多 12 小时内错过的时间点。技能晚 40 分钟触发属于正常现象。

---

## 模式 4——将本次对话转化为技能

他们刚刚在本次对话中完成了某件事，并希望按计划自动执行它。

1. **编写技能文件。** `skills/<name>/SKILL.md`——先写 frontmatter，再写提示词。根据会话中实际发生的过程来构建它：
   - 提示词正文 = 他们提出的要求，加上实际有效的步骤
   - `mode:` = `read-only`，除非它需要提交更改或创建 PR
   - `requires:` = 执行过程中用到的任何 API 密钥（如果没有该密钥时可以降级，则使用 `KEY?`）
   - `category:` = `core evolution basics dev crypto productivity` 之一
   - 如果他们喜欢输出结果，将经过精简的示例粘贴到正文中，作为格式规范

2. **修复会导致无人值守运行失败的三个问题：**
   - **没有人在场。** 任何你曾询问用户问题的地方，都必须改为默认值或规则。
   - **没有内容时保持沉默。** 明确添加“如果没有值得报告的内容，则记录日志并退出，不发送通知。”否则，一周之内它就会被静音。
   - **不要重复昨天的内容。** 添加“检查 `memory/logs/` 中最近 3 天的记录，并跳过所有已经报告过的内容。”

3. **检查它是否确实能在那里运行。** 没有本地文件系统，也没有已登录的工具。如果会话读取了用户的主目录或使用了本地 MCP 服务器，请明确说明——除非将其配置为仓库密钥 / `.mcp.json`，否则这部分无法在无人值守模式下运行。为无人值守使用配置 MCP 服务器（控制面板 Connect、OAuth 刷新、轮换令牌 PAT）：`references/mcp.md`。

4. **自行添加 `aeon.yml` 条目。** 磁盘上的新技能没有对应条目，而 `./aeon skills enable|schedule` **不会创建条目**——它们只会切换已经存在的条目，并报告 `no change — already in that state`，但这是错误的。在兜底的 `heartbeat:` 行之前手动添加该条目，并将其设为禁用：

   ```yaml
     my-skill: { enabled: false, schedule: "0 12 * * *" }
   ```

   **即使它处于禁用状态，也要包含带引号的 `schedule:`——这些引号不可或缺。** 如果写成不带 `schedule` 的 `{ enabled: false }`，之后再让 `./aeon skills schedule` 添加该键，就会产生一个调度器无法读取的*未加引号*值，导致技能永远不会触发（模式 3，检查项 5）。在此处预先写入带引号的节点，可确保之后每次通过 CLI 编辑时都会保留引号。

   与其他 61 个条目一样，使用单行内联 `{ … }` 格式。`aeon.yml:367` 通过单行 grep 读取每个技能的 `model:`/`harness:` 覆盖项，因此拆分为多行的条目会改用全局默认值。

   这是“绝不手动编辑 YAML”规则唯一获准的例外。之后运行 `node scripts/validate-config.js` 进行验证——但请注意，它只检查结构，无法发现未加引号的值。

5. **重新生成两个目录，然后以 PR 形式提交。** 新技能会触发三个 CI 门禁。请在本地运行它们——**即使出现红灯，也没有任何机制会阻止合并**，`main` 不受保护且没有规则集，因此未运行的门禁只会在事后失败：

   ```bash
   bash scripts/check-skill-categories.sh   # category is one of the six
   bin/generate-skills-json                 # catalog/skills.json
   bin/generate-packs-json                  # catalog/packs.json — NOT optional
   ```

   `generate-packs-json` 是所有人都会忘记的那一个：`catalog/skills.json` 本身就是 `ci-packs-json` 的触发路径，因此，如果提交技能目录时没有同时提交包目录，你从未接触过的工作流就会报红。请提交这两个文件。

   完整的门禁列表、触发条件以及 `ci-tests` / `ci-apps` 命令：`references/ci.md`。

6. **运行一次**（`./aeon skills run <name>`），向用户展示输出，然后通过模式 2 为其设置调度。

### 技能文件结构

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

正文长度为 133–757 行（中位数约为 306 行）——skill 是用散文写成的提示词，而不是配置文件。`## Steps` / `## Network note` / `## Constraints` / `## Log` 是标准结构。

编写时有四件容易出问题的地方——完整细节见 `references/skill-anatomy.md`：

- **`requires:` 是最小权限白名单——运行时只会导出此处列出的键。** 行内写法（`requires: [KEY?]`）和块写法（`- KEY` 行）都能解析，可以位于顶层，也可以嵌套在 `metadata:` 下。关键在于值：只有匹配 `^[A-Z][A-Z0-9_]{2,}$` 的名称（末尾的 `?` 表示可选）才会被注入；小写或格式错误的条目会被静默丢弃。
- **`mode:` 拼写错误会授予写入权限。** 未知值会回退到 `write`，而不是更安全的权限层级。准确的字符串是 `read-only`。
- **`${today}` / `${var}` 不会被模板化。** 没有任何东西会重写 `SKILL.md`；工作流会将日期和 var 放入外围提示词中，由模型在上下文中解析。自行编造 `${my_thing}` 得到的只会是字面量 `${my_thing}`。
- **绝不要将密钥放在命令行上。** 使用带有花括号占位符 `{ENV_NAME}` 的 `./secretcurl` —— Claude Code 的权限分析器会在运行时阻止 `$SECRET` 展开。

计划不应写入 `SKILL.md` ——它们位于 `aeon.yml` 中。尽管有 10 个上游 skill 仍然带有 `schedule:` 或 `cron:` frontmatter 行，但**没有任何东西会读取它们**（`scheduler.yml` 只解析 `aeon.yml`）。不要照搬这种模式，也不要相信你找到的类似配置——请检查 `aeon.yml`。

---

## 模式 5——更改现有 skill 的行为

“让摘要更短”“停止涵盖 X”“添加一个来源”。这比编写新的 skill 更常见。

**首先，确认这是否是配置变更，而不是文件编辑。** 大多数 skill 都通过 `var` 接收主题、筛选条件或模式——在修改正文之前，先阅读该 skill 的 `var:` 行以及其 `aeon.yml` 条目上的注释。如果 `var` 能覆盖需求，就完成了：

```bash
./aeon skills set digest --var "rust"          # no file edit at all
```

否则编辑 `skills/<name>/SKILL.md`：

1. **先通读整个正文。** 这些文件通常很长（200–750 行），并包含判断规则、退出分类和评分标准；针对性编辑可能会在不知不觉中与它们产生矛盾。
2. **不要删掉维持运行所必需的机制。** 无论其他内容如何变化，该 skill 都必须保留：`./notify` 路径、无信号时静默退出、在 `### <skill-name>` 下追加到 `memory/logs/${today}.md`，以及任何已有的去重逻辑。用于“收紧” skill 的编辑经常会删掉这些内容。`### <skill-name>` 标题会被健康循环解析，而去重规则会读取最近 3 天的日志——破坏其中任何一项都会导致该 skill 持续重复报告，直到被静音。相关约定见 `references/skill-anatomy.md`。
3. **如果行为发生了变化，请更新 frontmatter。** 新增的数据源需要一个键 → 将其添加到 `requires:`。现在会写入文件或打开 PR → 使用 `mode: write`。如果修改了 `description:`、`name:`、`category:` 或 `requires:` → 重新生成**两个** catalog（`bin/generate-skills-json && bin/generate-packs-json`）并提交两者；`skills.json` 包含这些字段，并为 `packs.json` 提供数据。参见 `references/ci.md`。
4. **如果它是上游 skill，请发出警告。** `aeonfun/aeon` 中附带的任何内容都会在下一次 `git merge upstream/main` 时发生冲突。修改本身没有问题，但要说明这一点——两个仓库的约定是让本地编辑保持有意为之且尽量少。
5. **运行一次**（`./aeon skills run <name>`），并在结束前阅读输出。

自动化替代方案：仓库内的 `autoresearch` skill 通过生成四个评分变体并将胜出者作为 PR 提交，来迭代目标 skill。当请求是“把这个做得更好”而不是提出具体修改时，优先使用它。

---

## 模式 6——“我该启用什么？”

这是入门流程中的真正第一个问题。**不要把目录一股脑列出来。** 先询问一两个问题，了解他们希望在离开期间实际处理哪些事情，然后提出 **三个** skill，每个附上一句理由。

一次三个，而不是十二个。每个启用的 skill 都会产生周期性通知，而让实例在第一天就变得嘈杂，是最快的终结方式。`heartbeat` 已经启用，除非有事情需要处理，否则会保持静默。

```bash
./aeon skills ls                 # 所有 skills — SKILL / ON / SCHEDULE / PACK / DESC
./aeon skills ls --enabled       # 仅显示实际运行的内容
./aeon skills ls --pack crypto   # 一个 pack
./aeon skills <name>             # 某个 skill 的详细信息
./aeon packs ls                  # 六个一方 pack
```

`ls` 的页脚会显示 `77 skills · 1 enabled` —— 在提出建议前，先把它读给他们听。首次运行会安装 CLI 运行时（tsx + yaml，约 12MB）；npm 输出只会出现一次，属于预期现象。仅使用 Grep 的等效方式：`references/layout.md`。

Packs 是可见性过滤器，而不是运行时开关——显示某个 pack 不会运行任何内容。Core（12 个）、Evolution（9 个）和 Basics（18 个）默认显示；Dev（12 个）、Crypto（15 个）和 Productivity（11 个）按需显示。

合理的起始组合：

| 他们关心的内容 | 建议 |
|---|---|
| 他们的代码仓库 | `github-monitor`、`pr-review`、`changelog` |
| 某个主题 / 研究 | `digest`、`article`、`mention-radar` |
| 市场 | `token-movers`、`defi-overview`、`monitor-polymarket` |
| 发布 / 增长 | `heartbeat`、`shiplog`、`bd-radar` |

### 安装更多内容

```bash
bin/install-skill-pack --list             # 浏览社区注册表
bin/install-skill-pack <owner>/<repo>     # 安装精选 pack
bin/add-skill <owner>/<repo> --list       # 安装任何包含 SKILL.md 文件的仓库
```

所有内容都会以 **禁用** 状态落地，经过安全扫描，并在 `skills.lock` 中记录来源信息。

**启用社区 SKILL.md 之前先阅读它。** 安装 pack 意味着运行陌生人的提示词，并将你的机密注入其中。扫描器基于正则表达式——无法捕获提示词注入。检查 `requires:` 是否符合所声明的工作，`capabilities:` 是否如实，以及是否存在指示 agent 将数据发送到无关位置的内容。

**启用任何具有现实世界影响范围的内容前，都必须明确确认：** `distribute-tokens`（发送 USDC）、`schedule-ads`（花钱）、`send-email` 和 `vuln-scanner`（联系真实人员）、`deploy-prototype` 和 `feature`（推送到他人的代码仓库）。

---

## 模式 7——策略与风格

有两个文件会随 **每一次**运行进入上下文。两者都不是必需的，成本也很低，但它们对输出质量的提升超过任何针对单个 skill 的调优。

### `STRATEGY.md`——北极星

它会被导入 `CLAUDE.md`，因此会出现在每个 skill 的上下文中：目标、优先级、受众、硬性约束。当某个选择无法通过其他方式确定时，它会帮助打破平局。务必保持**简洁**（每次运行都会消耗 token）且**具体**（含糊的策略无法打破平局）。

```bash
./aeon strategy show
./aeon strategy set --file STRATEGY.md
./aeon strategy build "<one-line goal>"    # dispatches the strategy-builder skill
```

`build` 会读取 brief、仓库 README 和 `memory/MEMORY.md`，然后提交一份草稿。它会作为 Action 运行，因此完成后请执行 pull。无需 API 密钥。

### `soul/` — 它的表达方式

默认情况下，Aeon 没有任何个性。每次运行时都会读取 `soul/SOUL.md`（身份、世界观、观点）和 `soul/STYLE.md`（语气、词汇、反模式），因此通知和内容听起来会像操作员本人。`soul/examples/` 中存放了 10–20 个校准样本。

```bash
./aeon soul show
./aeon soul build --handle <x-handle> --name "<Full Name>" --links <url,url>
```

`XAI_API_KEY` 能够对真实的 X 时间线进行最丰富的读取；没有它时，`soul-builder` 会退回使用网络搜索。github.com/aeonfun/soul.md 上还有一组完整的示例 soul，可以从那里开始。

**质量标准：具体到可能出错。** *“我认为大多数 AI 安全讨论都是自以为是的银河级脑补”* 很有用。*“我对 AI 安全有细腻而复杂的看法”* 则没有用。要推动用户写出前一种——一个不可能冒犯任何人的 soul，也就不会听起来像任何人。

---

## 模式 8 — 挖掘历史记录，寻找可自动化的技能

“我有哪些事情一直在手动反复做，而 Aeon 本可以直接替我完成？”模式 4 会把*当前*聊天转换成技能；模式 8 则会挖掘*过去*的聊天，找出哪些聊天值得转换成技能。它会读取操作员本地的 coding-agent 记录（`~/.claude/projects` 或 `~/.codex/sessions`），因此只能在操作员自己的机器上运行——绝不能在 Aeon 运行期间运行。

1. **扫描。** 从实例仓库根目录运行 miner：

   ```bash
   node "${PLUGIN_ROOT:-$CLAUDE_PLUGIN_ROOT}/skills/aeon/scripts/mine-history.mjs" --days 45 --top 15
   ```

   它会解析时间窗口内每个顶层会话（跳过子代理 sidechain），将 shell 命令规范化为 `binary subcommand`，对会话标题进行分组，并输出一份按**不同会话数 × 不同天数**排序的摘要——关注的是重复频率和节奏，而不是原始数量。参数包括：`--days N`（时间窗口，默认 120）、`--project SUBSTR`（仅包含 cwd 匹配的会话——将范围限定到一个仓库/主题）、`--top N`、`--min-sessions N`、`--json`。它没有依赖项；如果没有历史记录，则会返回简洁的错误信息。关于如何深入阅读这些表格以及候选项评估标准，请参阅 `references/history-mining.md`。

2. **像人一样阅读它。** 摘要只是原始信号，不是结论——判断取决于你：
   - **重复出现的命令工作流**——某个 `binary subcommand` 出现在许多会话和许多天中，说明它是一种习惯。通用基础操作（`git status`、`gh auth`、裸 `node`/`python3`）已经被过滤掉，但 `gh pr`/`gh api`/`npm run` 也属于基础设施，在各处都很常见，因此作为技能想法的价值较弱。要寻找的是*具有辨识度的重复调用*：某个命名脚本、某个特定 CLI（`x-cli`、`langfuse`、`raindrop`），或某种紧凑的 `gh api` 模式。
   - **重复出现的任务主题**——经过分组的会话标题是最强的信号。某个标题以大致固定的节奏、跨越多天反复出现（“检查 X”、“审查 Y”、“汇总 Z”），几乎总是真正的自动化候选。
   - **工具 / 项目**——工作涉及哪些 MCP 服务器和仓库；这会告诉你技能需要接入什么，以及应将 `--project` 的范围限定在哪里。

3. **筛选真正的候选项。** 只有同时满足以下所有条件的条目，才值得提议：
   - **具有重复性** —— 跨多个日期的多次会话中都出现，而不是只有一个繁忙的下午。
   - **符合获取/计算/报告的形态** —— 获取或检查某些内容并进行报告。交互式、需要大量决策或一次性的迁移工作都*不适合*自动化。
   - **可安全无人值守运行** —— 不依赖本地文件、已登录的桌面应用，或任务中途由人工回答（Mode 4 的第 2/3 步会处理加固）。
   - **尚未是一个 skill。** 使用 `./aeon skills ls` 针对实例进行去重。许多重复性的 `gh pr` 工作已经由 `pr-review`/`pr-check` 覆盖；研究节奏已经由 `digest`/`mention-radar` 覆盖。如果已有 skill 能够覆盖该工作，应采用 Mode 2（重新安排）或 Mode 5（编辑其 `var`），**而不是**创建新的 skill。

4. **提出三个候选项，并提供证据。** 不要倾倒整个摘要。指定**三个**候选项，每个都要以重复次数作为依据（“你在 D 天内的 N 次会话中执行了 X”），用一行概述 skill（它获取什么、发送什么），给出建议的 `mode:`（如果只获取并报告，则使用 `read-only`），并根据观察到的节奏推断建议的 `schedule:`（约每天出现 → daily；约每周出现 → weekly）。询问用户要构建哪一个。

5. **交给 Mode 4 编写所选的 skill** —— 使用相同的 skill 文件结构、无人值守加固、带引号的 `schedule:` 条目以及双目录 CI。Mode 8 负责发现工作；Mode 4 负责交付它。

**隐私：** 会话记录只在本地读取，外部只展示汇总摘要。不要将会话中的原始提示正文或任何敏感内容粘贴到频道或提交文件中；计数和标题足以帮助做出决定。

---

## 提供商和 harness

这是两个相互独立的维度。不要混淆它们：**gateway** 决定由哪个模型回答；**harness** 决定运行该 skill 的 CLI。

### Gateway — Claude Code 的驱动力

设置一个密钥后即可生效。`aeon.yml` 提供了 `gateway: { provider: auto }`，它会在运行时根据现有密钥进行解析，优先级顺序如下：

```
claude → anthropic → openrouter → bankr → usepod → venice → surplus → grok → glm
```

`direct` **不是**该链中的一环——当九个密钥**均未设置**时，它只是占位符。它不需要任何东西，也不会配置任何东西，因此运行会继续使用环境中存在的 `ANTHROPIC_*`，否则会在第一次模型调用时失败。日志中显示“解析为 `direct`”意味着**未找到密钥**，而不是某个回退方案生效了。

| 提供商 | 密钥 | 备注 |
|---|---|---|
| Claude 订阅 | `CLAUDE_CODE_OAUTH_TOKEN` | 一键 OAuth，包含在 Pro/Max 中 |
| Anthropic API | `ANTHROPIC_API_KEY` | 按使用量付费 |
| OpenRouter | `OPENROUTER_API_KEY` | `sk-or-…` · Anthropic 原生透传，风险最低 |
| Bankr | `BANKR_LLM_KEY` | `bk_…` · 折扣价 Opus |
| UsePod | `USEPOD_TOKEN` | 无前缀——传入 `--provider usepod`。令牌位于基础 URL 中，请妥善保密 |
| Venice | `VENICE_API_KEY` | 无前缀——传入 `--provider venice`。隐私优先，通过 sidecar 桥接 |
| Surplus | `SURPLUS_API_KEY` | `inf_…` · 在 Base 上结算 USDC——先为钱包充值，并完成一次 `approve()` |
| Grok (xAI) | `XAI_API_KEY` | `xai-…` · 透传至 `api.x.ai` |
| GLM (Z.AI) | `GLM_API_KEY` | 无前缀——传入 `--provider glm`。别名为 `ZAI_API_KEY`。透传至 `api.z.ai/api/anthropic` |

它以**级联**方式运行，而不是单次选择：优先级最高的密钥先运行，若出现*任何*失败（没有 credits、触发速率限制、服务中断、响应无效），本次运行就会切换到下一个已设置密钥的提供商。只有所有提供商都失败时才会报错。日志会在每次切换时打印 `Routing attempt via '<provider>'`。

- **重新排序：** repo 变量 `GATEWAY_ORDER`（以空格分隔的名称）。
- **固定一个：** `./aeon config set gateway <name>`（禁用故障转移）。
- **任意兼容 Anthropic 的端点：** `ANTHROPIC_API_KEY` 加上 repo 变量 `ANTHROPIC_BASE_URL` — 例如 `https://api.deepseek.com/anthropic`。

### Harness — 运行 skill 的 CLI

`claude`（默认）或 `grok`。Grok harness 运行的是 `grok` CLI，而不是 Claude Code，并且**完全绕过 gateway** — 它有自己的身份验证方式。

- **设置方式：** 全局设置为 `./aeon config set harness grok`，或者在单个 skill 的 `aeon.yml` 条目中设置 `harness: "grok"` — **必须加引号，并位于该条目唯一的内联行上**。每个 skill 的 `model:` 和 `harness:` 会由要求双引号的单行 grep 读取（`aeon.yml:367`、`:380`），因此未加引号或拆分到多行的覆盖设置会被静默忽略，skill 会继续运行全局默认值 — 不会报错，并且日志中的 `model=` 行看起来也正常。通过 CLI 设置任一配置后，请重新读取该条目；如果缺少引号，请补上。
- **身份验证：** `XAI_API_KEY`，或者通过 dashboard 的 **Connect X account** 使用 X 账号（SuperGrok / X Premium+），该操作会存储 `GROK_CREDENTIALS`。X OAuth 流程没有 CLI 标志 — 这一步请让他们使用 `./aeon`（dashboard）完成。
- **模型：** `grok-4.5`（默认，推理模型）或 `grok-composer-2.5-fast`（低成本）。
- **没有免费层级。**

请提前告知他们：
- Grok 运行报告的 **0 tokens** — 其 JSON 不包含 token 计数，因此成本跟踪会显示为空。这不是 bug。
- X OAuth 会话会过期。如果无人值守的运行开始因身份验证失败，请重新连接。
- `mode: read-only` 仍然适用（映射为 `--sandbox read-only`），并且 MCP 可用。

每个 skill 的 Grok 调节项位于 `SKILL.md` frontmatter 中（Claude harness 会忽略这些设置）：`max_turns`（默认 60）、`best_of_n`、`verify` 和 `effort`（`low|medium|high|xhigh|max` — 仅推理模型支持；`grok-composer-2.5-fast` 不接受该设置）。