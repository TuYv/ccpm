---
name: aeon
description: Set up and run an Aeon agent instance — get started from scratch, pick which skills to turn on or install more from packs, reschedule or change what runs, edit what an existing skill does, fix a skill that isn't firing, set the STRATEGY.md north star and soul/ voice, turn a Claude Code chat into a scheduled Aeon skill, and mine past Claude Code conversations for recurring work worth automating as a skill. Use when the user mentions Aeon, aeon.yml, an Aeon skill / instance / routine / pack, asks to schedule, enable, edit, or debug an agent that runs on a cron, or asks what of their repeated/manual work Aeon could take over.
---
# Aeon

Aeon 是一个通过 Actions 在用户自己的 GitHub 仓库中运行的代理。技能是一个 Markdown 文件（`skills/<name>/SKILL.md`）；`aeon.yml` 指定运行哪些技能以及何时运行。

选择他们所请求的模式：

| | |
|---|---|
| **1 · 开始使用** | 尚无实例，或从头开始设置实例 |
| **2 · 重新安排** | 更改时间、频率或技能的关注重点 |
| **3 · 解除阻塞** | “它没有运行”/“什么都没发生” |
| **4 · 对话 → 技能** | 将我们刚刚完成的工作转化为定时技能 |
| **5 · 编辑技能** | 更改现有技能的行为 |
| **6 · 启用哪些技能** | 选择技能、浏览技能包、安装更多技能 |
| **7 · 策略与风格** | `STRATEGY.md` 和 `soul/`——指导方向与表达基调 |
| **8 · 从历史记录中挖掘技能** | “我反复进行的哪些工作可以交给 Aeon？”——从过去的 Claude Code 对话中找出来 |

## 前置检查（所有模式）

1. 找到仓库：当前目录 → `gh repo set-default` → 询问。如果本地没有该仓库，则克隆它。
2. **在执行任何写入命令之前，确认 `gh` 指向的是他们自己的实例。**

   ```bash
   gh repo view --json nameWithOwner -q .nameWithOwner
   ```

   如果该命令输出 `aeonfun/aeon`，而他们并非正在上游仓库本身工作，请停止并运行 `gh repo set-default <owner>/<repo>`。如果没有固定默认仓库，`gh` 会优先选择 `upstream` 远程仓库而不是 `origin`，并且 Aeon 的每项写入操作（`auth`、`secrets set`、`skills run`、配置推送）都会调用 `gh -R <resolved>`——因此，它会毫不犹豫地把他们的 API 密钥放到上游仓库，并在那里触发运行。整个过程看起来像是成功的：没有错误，有真实的运行 ID，但技能就是永远不会在他们自己的实例上触发。
3. `gh auth status`——所有操作都通过 `gh` 进行。如果失败，告诉他们运行 `gh auth login`，然后停止。
4. 所有配置写入都使用 `./aeon` CLI。它会保留 `aeon.yml` 中的注释并执行验证。切勿手动编辑 YAML——只有一个例外：CLI 无法为全新的技能*创建*条目（参见模式 4 的第 4 步）。

**不要相信刚刚创建的技能所显示的“disabled”状态。** 读取逻辑会从磁盘列出技能，并对 `aeon.yml` 中缺少的条目默认设置 `enabled: false`，因此“未配置”和“已禁用”看起来完全相同。可以用一条命令区分两者：

```bash
comm -23 <(ls skills/*/SKILL.md | cut -d/ -f2 | sort) \
         <(grep -oE '^  [a-z0-9-]+:' aeon.yml | tr -d ' :' | sort)
```

它输出的任何内容都表示该技能已存在于磁盘上，但尚未配置。**快速了解已安装的内容、已启用的内容，以及所有内容所在的位置：`references/layout.md`。**

**设置任何密钥或令牌时：** 阅读 `references/secrets.md`——其中列出了每个密钥和仓库变量，并提供了获取它们的确切页面。始终使用 `./aeon secrets set NAME --stdin` 设置密钥，绝不要将其作为命令参数传入。

---

## 模式 1——开始使用 Aeon

目标：尽快让他们的手机收到一条真实通知。不要先配置计划。

1. **获取一个仓库。在运行任何操作之前，询问他们要使用公开仓库还是私有仓库**——这会影响所使用的命令，而且之后切换意味着要迁移仓库。

   **公开**（推荐）：Actions 分钟数免费，而且只需一条命令即可获取上游技能更新。

```bash
   gh repo fork aeonfun/aeon --clone && cd aeon
   gh repo set-default <owner>/aeon        # REQUIRED — see below
   ```

   **私有实例**：公开仓库的复刻始终是公开的，因此私有实例是镜像，而不是复刻。

   ```bash
   gh repo create <name> --private
   git clone --bare https://github.com/aeonfun/aeon.git
   git -C aeon.git push --mirror https://github.com/<owner>/<name>.git
   rm -rf aeon.git && git clone https://github.com/<owner>/<name>.git && cd <name>
   git remote add upstream https://github.com/aeonfun/aeon.git
   gh repo set-default <owner>/<name>      # REQUIRED — see below
   ```

   在他们选择私有实例之前，明确告知这两项成本：Actions 分钟数会计入账户配额（免费版每月 2,000 分钟——定时运行的技能会消耗这些分钟数），而且更新需要通过 `git fetch upstream && git merge upstream/main` 获取，而不是 `gh repo sync`。

   **无论采用哪种方式，都要在执行任何其他命令之前固定默认仓库。** 两种方式最终都会有一个 `upstream` 远程仓库（`gh repo fork --clone` 会自动添加），而在没有固定默认仓库的情况下，**`gh` 会优先选择 `upstream` 而不是 `origin`**。Aeon 中的所有操作都会通过 `gh -R $(gh repo view …)` 路由，因此，未固定默认仓库的工作副本会悄无声息地将密钥写入 `aeonfun/aeon`，并针对它触发运行，而不是操作他们自己的实例——且不会出现错误，因为这些命令确实在错误的仓库上成功执行了。验证：

   ```bash
   gh repo view --json nameWithOwner -q .nameWithOwner   # must print THEIR repo
   ```

   完成此步骤后，无论采用哪种方式，后续操作都完全相同。
2. **为模型配置身份验证。** 至少需要配置一个模型。最快的方式是使用 `./aeon auth --oauth`（Claude Pro/Max，会打开浏览器），或使用 `./aeon auth --key <key>`，它会**根据密钥前缀**检测提供商——`sk-ant-oat`（OAuth）、`sk-or-`（OpenRouter）、`bk_`（Bankr）、`inf_`（Surplus）、`xai-`（Grok）；其他任何前缀都会归入 `ANTHROPIC_API_KEY`。

   **UsePod 和 Venice 的密钥没有前缀**，因此无法检测；直接使用 `--key` 会将它们存为普通的 Anthropic 密钥，导致后续运行失败并出现令人困惑的身份验证错误。必须明确指定它们：

   ```bash
   ./aeon auth --key <token> --provider usepod    # same for venice
   ```

   `--dry-run` 会输出解析后的 `method=… → secret …`，而不会调用 `gh` 或 `claude`——只要对提供商有疑问，就值得先运行它。

   **不要假设他们订阅了 Claude：**支持八家提供商，包括 OpenRouter、Grok 和使用加密货币结算的网关。请参阅“提供商和执行框架”。
3. **接入一个渠道。** Telegram 是最快的选择：使用 @BotFather 创建一个机器人，然后执行 `./aeon secrets set TELEGRAM_BOT_TOKEN --stdin` 并设置 `TELEGRAM_CHAT_ID`。暂时跳过 Discord/Slack/电子邮件——一个渠道就足以证明它能够正常工作。
4. **立即运行一个技能。** 使用模式 6 选择技能——询问他们想处理什么，并提出一个建议——然后执行 `./aeon skills run <name>`。等待运行完成，然后执行 `./aeon runs logs <id>`。他们应该会收到一条 Telegram 消息。
5. **只有在此之后，才为它设置定时运行。** 执行 `./aeon skills enable <name>` 并设置时间（请参阅模式 2）。

适合作为首个技能的选项：`digest`（主题简报）、`github-monitor`（监控他们的仓库）、`heartbeat`（默认已启用，仅在有事项需要关注时报告）。

---

## 模式 2 — 重新安排 / 更改例行任务

以用户**所在时区的时间线**展示其一天的安排，而不是配置文件：

```
07:00  digest           "solana"
09:00  pr-review        your repos
18:00  heartbeat        health check
```

根据 `./aeon skills ls --enabled --json` 构建时间线。（`--enabled` 很重要：普通的 `ls` 也会为*已禁用*的技能输出 `SCHEDULE` 列——那只是它们在 `aeon.yml` 中的条目，并不能证明任何任务会实际触发。）没有 CLI，或者想查看原始文件？`references/layout.md` 中提供了仅使用 grep 的等效方法。然后接受自然语言形式的修改要求并应用：

| 用户说 | 你要做 |
|---|---|
| “把摘要移到早上 7 点” | `./aeon skills schedule digest "0 6 * * *"` |
| “仅工作日” | `... "0 6 * * 1-5"` |
| “太频繁了，每周两次” | `... "0 6 * * 1,4"` |
| “停止那个加密货币任务” | `./aeon skills disable token-movers` |
| “改成关注 rust” | `./aeon skills set digest --var rust` |

规则：
- **`aeon.yml` 中的所有 cron 均使用 UTC。**从用户所在时区进行转换，并明确说明：“巴黎时间早上 7 点 = UTC `0 6 * * *`（夏令时期间为早上 5 点——要固定为当地时间吗？）”目前没有使用当地时间的选项，因此如果夏令时很重要，请告知用户每年哪一半年会有一小时的偏差。
- 每次更改后，使用用户所在时区确认**接下来的 3 次触发时间**。
- 对任何有歧义的操作，先使用 `--dry-run`，展示差异，然后再应用。
- 更改需要推送后才会生效。CLI 会执行推送；请确认推送已成功落地。
- **然后检查输出的值是否带有引号**——每次都要执行一次 grep：

  ```bash
  grep '^  <skill>:' aeon.yml
  ```

  调度器只会读取**带双引号**的 `schedule: "…"`。CLI 在写入一个*新*键时不会添加引号，因此，此前没有 `schedule:` 的条目会变成 `schedule: 0 12 * * *`，导致该技能永远被跳过。详细信息见下文。

带有 `schedule: workflow_dispatch` 的技能只能按需运行——它们永远不会通过 cron 触发。`reactive` 类型的技能根据条件触发，而不是按时间触发。

---

## 模式 3 — 排除阻塞问题

“它没有运行。”按以下顺序检查，并在发现第一个问题时停止：

1. **它启用了吗？**运行 `./aeon skills ls --enabled`——它是否在列表中？
2. **是否存在重复键？**运行 `node scripts/validate-config.js`。`aeon.yml` 中重复的技能名称会悄无声息地遮蔽第一个条目。这种情况在手动编辑后很常见。
3. **它真的是 cron 吗？**`workflow_dispatch` 和 `reactive` 永远不会按计划触发。
4. **Actions 是否被禁用了？**运行 `gh api repos/{owner}/{repo}/actions/permissions`。仓库 60 天没有活动后，GitHub 会自动禁用计划工作流——这会悄无声息地导致 fork 中的任务失效，而 Aeon 中不会显示任何相关信息。请在仓库的 Settings 中重新启用。
5. **计划值是否带引号？**运行 `grep '^  <skill>:' aeon.yml`——该值必须是 `schedule: "0 12 * * *"`，**并且带双引号**。

   ```
   schedule: "0 12 * * *"   ✅ fires
   schedule: 0 12 * * *     ❌ never fires, no error anywhere
   ```

   `scheduler.yml` 使用 bash 正则表达式 `schedule: *"([^"]+)"` 匹配计划。未加引号的值无法匹配，`$SCHED` 为空，匹配循环会执行 `[ -z "$SCHED" ] && continue`——每次轮询都会被悄无声息地跳过，永远如此。

   出现这种情况的原因：CLI 通过一个 YAML 文档模型编辑 `aeon.yml`，该模型会保留*现有*节点的引号，但会以普通样式写入**新添加的**键。因此，在已有带引号 `schedule:` 的条目上执行 `./aeon skills schedule <name> "0 12 * * *"` 是安全的，但在此前没有该键的条目上执行则会悄无声息地破坏配置。首次使用 `--var` 时也是如此。

**除此之外没有任何机制能检测到这个问题。** 该文件是有效的 YAML，`validate-config.js` 报告 CLEAN，`./aeon skills ls --enabled` 也会列出该技能及其调度配置——因为它们都会正确解析 YAML，只有调度器使用正则表达式。手动添加引号即可修复。
6. **它是否运行后失败了？** 先运行 `./aeon runs ls`，再运行 `./aeon runs logs <id>`。失败的技能会在 30 分钟的冷却期后重试。

如果上述检查均无问题，再检查以下三项：

- **它针对错误的仓库运行了。** 明显的迹象是：某个命令报告成功并返回了运行 ID，但在他们的实例上执行 `./aeon runs ls` 却看不到任何记录。如果没有固定默认仓库，`gh` 会优先选择 `upstream` 而不是 `origin`，因此未固定默认仓库的检出会把所有写入操作都发送到 `aeonfun/aeon`。

  ```bash
  gh repo view --json nameWithOwner -q .nameWithOwner   # if this isn't their repo:
  gh repo set-default <owner>/<repo>
  ```

  然后**清理误写入上游仓库的内容**——针对正确的仓库重新运行并不会撤销这些内容。指向错误仓库时设置的任何密钥，现在都成了别人仓库中的密钥：

  ```bash
  gh secret list -R aeonfun/aeon      # timestamps matching the misfire = theirs
  ```

  **始终先在提供商处轮换密钥**——它曾存放在一个仓库中，而该仓库的协作者可以提交读取该密钥的工作流。然后使用 `./aeon secrets set NAME --stdin` 在他们的实例上重新设置它。

  **不要直接盲目删除。** `gh secret list` 只显示*最后更新时间*，因此无法判断上游仓库是否原本就有该密钥，而误操作是否**覆盖**了它。删除前先询问：
  - 上游仓库从未有过该密钥 → `gh secret delete <NAME> -R <upstream>`。
  - 上游仓库原本有自己的密钥 → 删除会破坏*他们的*计划运行。所有者必须重新设置上游仓库自己的值；此次覆盖无法从这里撤销。

  如果删除操作返回 403，说明他们从未拥有写入权限——实际上没有写入任何内容，之前的命令只是*看起来*正常，实际上已经失败。
- **缺少密钥。** 技能会在 `requires:` 中声明密钥。使用 `./aeon secrets ls --set` 检查这些密钥。缺少可选密钥（`KEY?`）意味着功能会静默降级，而不是直接失败。
- **“没有可用的 MCP 工具。”** 在 Claude 运行环境中，`.mcp.json` 里只要有一个无法解析的 `${VAR}`，就会对该次运行禁用**所有** MCP 服务器，而不只是有问题的那一个（`::warning::.mcp.json references secret(s) not set:` … `Skipping MCP this run.`）。Grok 则会按服务器分别降级。如果某个 OAuth 服务器之前工作正常，之后却导致运行失败，应怀疑轮换后的刷新令牌无法保存——参见 `references/mcp.md`。
- **它运行了，但什么也没发送。** 这通常是正确行为。Aeon 的约定是在没有信号时保持静默——一次无异常的运行不会发送空报告，而是什么也不发送。

注意：GitHub 只会触发大约 10% 的 `*/5` cron 时点，因此调度器会补执行最长 12 小时内错过的时段。技能延迟 40 分钟触发是正常现象。

---

## 模式 4——将此聊天转换为技能

他们刚刚在 Claude Code 中完成了某项操作，并希望它按计划运行。

1. **编写技能文件。** `skills/<name>/SKILL.md`——先写 frontmatter，再写提示词。根据会话中实际发生的情况生成：
   - 提示词正文 = 他们提出的要求，加上已验证有效的步骤
   - `mode:` = `read-only`，除非它需要提交代码或创建 PR
   - `requires:` = 工作过程中使用的所有 API 密钥（如果没有该密钥也可以降级运行，则使用 `KEY?`）
   - `category:` = `core evolution basics dev crypto productivity` 之一
   - 如果他们喜欢输出结果，将经过精简的示例粘贴到正文中，作为格式规范

2. **修复会导致无人值守运行失败的三个问题：**
   - **现场没有人。** 之前任何需要向用户提问的地方，都必须改成默认值或规则。
   - **无事时保持沉默。** 明确添加“如果没有值得报告的内容，则记录日志并退出，不发送通知。”否则一周后它就会被静音。
   - **不要重复昨天的内容。** 添加“检查 `memory/logs/` 最近 3 天的记录，跳过任何已经报告过的内容。”

3. **检查它在那里是否真的能运行。** 没有本地文件系统，也没有已登录的工具。如果会话读取了用户的主目录或使用了本地 MCP 服务器，请明确说明——除非将这部分配置为仓库密钥 / `.mcp.json`，否则它无法在无人值守模式下运行。为无人值守运行接入 MCP 服务器（控制面板中的 Connect、OAuth 刷新、采用轮换令牌的 PAT）：`references/mcp.md`。

4. **自行添加 `aeon.yml` 条目。** 磁盘上的新 Skill 没有对应条目，而 `./aeon skills enable|schedule` **不会创建条目**——它们只会切换已经存在的条目，并报告 `no change — already in that state`，但这是错误的。在备用的 `heartbeat:` 行之前，手动添加一个处于禁用状态的条目：

   ```yaml
     my-skill: { enabled: false, schedule: "0 12 * * *" }
   ```

   **即使它处于禁用状态，也要包含带引号的 `schedule:`——这些引号不可或缺。** 如果先写一个不带 `schedule:` 的 `{ enabled: false }`，之后再让 `./aeon skills schedule` 添加该键，就会生成一个*不带引号*的值，调度器无法读取它，Skill 也就永远不会触发（模式 3，检查项 5）。在这里预先放入一个带引号的节点，可确保之后每次通过 CLI 编辑时都保留引号。

   与其他 61 个条目保持一致，使用单行内联的 `{ … }` 形式。`aeon.yml:367` 使用单行 grep 读取每个 Skill 的 `model:`/`harness:` 覆盖配置，因此拆分为多行的条目会改用全局默认值。

   这是“绝不手动编辑 YAML”规则唯一获准的例外。之后执行验证：`node scripts/validate-config.js`——但请注意，它只检查结构，无法发现未加引号的值。

5. **重新生成两个目录文件，然后通过 PR 提交。** 新 Skill 会触发三个 CI 门禁。请在本地运行它们——**即使结果为红也没有任何机制阻止合并**，`main` 未受保护且没有规则集，因此未运行的门禁只会在事后失败：

   ```bash
   bash scripts/check-skill-categories.sh   # category is one of the six
   bin/generate-skills-json                 # catalog/skills.json
   bin/generate-packs-json                  # catalog/packs.json — NOT optional
   ```

   `generate-packs-json` 是所有人都会忘记的那一个：`catalog/skills.json` 本身就是 `ci-packs-json` 的触发路径，因此如果只提交 Skill 目录而不提交 Pack 目录，一个你从未修改过的工作流就会变红。请提交这两个文件。

   完整门禁列表、触发条件以及 `ci-tests` / `ci-apps` 命令：`references/ci.md`。

6. **先运行一次**（`./aeon skills run <name>`），向用户展示输出，然后通过模式 2 为其设置调度。

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
1. <the procedure — 43 of 75 skills lead with this>

## Network note
<curl / WebFetch / `./secretcurl` / `gh api` — how this skill fetches>

## Log
Report via `./notify` (use `./notify -f file.md` for anything multi-line).
Send nothing if there's nothing worth reporting.
Append what you did to `memory/logs/${today}.md` under a `### <skill-name>` heading.
```

正文通常为 133–757 行（中位数约为 306 行）——skill 是用自然语言写成的提示词，而不是配置文件。`## Steps` / `## Network note` / `## Constraints` / `## Log` 是其惯用结构。

编写时有四个容易踩坑的地方——完整细节见 `references/skill-anatomy.md`：

- **`requires:` 是最小权限许可列表——运行时只会导出此处列出的键。** 行内形式（`requires: [KEY?]`）和块形式（`- KEY` 行）都能解析，既可以位于顶层，也可以嵌套在 `metadata:` 下。需要注意的是取值：只有匹配 `^[A-Z][A-Z0-9_]{2,}$` 的名称（末尾的 `?` 表示可选）才会被注入；小写或格式错误的条目会被静默丢弃。
- **`mode:` 拼写错误会授予写权限。** 未知值会回退到 `write`，绝不会回退到更安全的权限级别。准确的字符串是 `read-only`。
- **`${today}` / `${var}` 不会被模板化。** 不会有任何机制重写 `SKILL.md`；工作流会把日期和变量放入外围提示词中，由模型结合上下文解析。自行创造 `${my_thing}` 只会得到字面量 `${my_thing}`。
- **绝不要把密钥放在命令行中。** 使用 `./secretcurl`，并在花括号中放置 `{ENV_NAME}` 占位符——Claude Code 的权限分析器会在运行时阻止 `$SECRET` 展开。

调度配置**不能**放在 `SKILL.md` 中——它们位于 `aeon.yml`。仍有 10 个上游 skill 在 frontmatter 中带有 `schedule:` 或 `cron:` 行；但**没有任何组件会读取它们**（`scheduler.yml` 只解析 `aeon.yml`）。不要照搬这种模式，也不要轻信你发现的此类配置——请检查 `aeon.yml`。

---

## 模式 5——更改现有 skill 的行为

“缩短摘要”“停止涵盖 X”“添加一个来源”。这比编写新 skill 更常见。

**首先，确认这是否属于配置变更，而不是文件编辑。** 大多数 skill 通过 `var` 接收主题、过滤器或模式——修改正文之前，先阅读该 skill 的 `var:` 行及其 `aeon.yml` 条目中的注释。如果 `var` 可以满足需求，那就完成了：

```bash
./aeon skills set digest --var "rust"          # no file edit at all
```

否则，编辑 `skills/<name>/SKILL.md`：

1. **先通读完整正文。** 这些文件通常很长（200–750 行），其中包含判断规则、退出分类法和评分量表，针对性的编辑可能会在不易察觉的情况下与它们产生冲突。
2. **不要删掉保障正常运行的机制。** 无论其他内容如何变化，skill 都必须保留：`./notify` 路径、无有效信号时静默退出、在 `### <skill-name>` 下追加到 `memory/logs/${today}.md` 的逻辑，以及所有已有的已报告内容去重机制。旨在“收紧”skill 的编辑经常会误删这些内容。健康检查循环会解析 `### <skill-name>` 标题，而去重规则会读取最近 3 天的日志——破坏其中任何一项，都会导致 skill 重复报告，直到被静音。相关约定见 `references/skill-anatomy.md`。
3. **如果行为发生变化，请更新 frontmatter。** 新数据源需要密钥 → 将其添加到 `requires:`。现在会写入文件或创建 PR → `mode: write`。更改了 `description:`、`name:`、`category:` 或 `requires:` → 重新生成**两个**目录（`bin/generate-skills-json && bin/generate-packs-json`）并将二者都提交；`skills.json` 包含这些字段，并为 `packs.json` 提供数据。见 `references/ci.md`。
4. **如果是上游 skill，请发出警告。** `aeonfun/aeon` 中发布的任何内容都会在下次执行 `git merge upstream/main` 时发生冲突。这没问题，但要明确说明——双仓库约定要求本地编辑必须有明确目的，并且数量尽可能少。
5. **运行一次**（`./aeon skills run <name>`），并在结束前阅读输出。

自动化替代方案：仓库内的 `autoresearch` 技能会生成四个经过评分的变体来演进目标技能，并将胜出版本作为 PR 提交。当需求是“让它变得更好”，而不是要求进行某项具体更改时，请使用它。

---

## 模式 6 —“我应该启用什么？”

这是引导配置期间真正应该首先提出的问题。**不要一股脑列出整个目录。**先问两三个问题，了解他们离开时真正希望系统处理什么，然后推荐**三个**技能，并为每个技能附上一行理由。

一次推荐三个，而不是十二个。每个启用的技能都会带来周期性通知，而毁掉一个实例最快的方式，就是从第一天起就让它吵个不停。`heartbeat` 已经启用，并且除非有事情需要关注，否则会保持静默。

```bash
./aeon skills ls                 # all skills — SKILL / ON / SCHEDULE / PACK / DESC
./aeon skills ls --enabled       # only what actually runs
./aeon skills ls --pack crypto   # one pack
./aeon skills <name>             # one skill's detail
./aeon packs ls                  # the six first-party packs
```

`ls` 的页脚会显示 `75 skills · 1 enabled`——在推荐任何内容之前，先把它读给他们听。首次运行会安装 CLI 运行时（tsx + yaml，约 12MB）；npm 产生的大量输出只会出现一次，属于正常现象。仅使用 grep 的等效方法：`references/layout.md`。

技能包只是可见性筛选器，并不是运行时开关——显示一个技能包不会运行任何内容。Core（12 个）、Evolution（9 个）和 Basics（17 个）默认显示；Dev（11 个）、Crypto（15 个）和 Productivity（11 个）则按需显示。

合理的初始组合：

| 他们关心的内容 | 推荐 |
|---|---|
| 他们的仓库 | `github-monitor`、`pr-review`、`changelog` |
| 某个主题/研究 | `digest`、`article`、`mention-radar` |
| 市场 | `token-movers`、`defi-overview`、`monitor-polymarket` |
| 发布/增长势头 | `heartbeat`、`shiplog`、`bd-radar` |

### 安装更多技能

```bash
bin/install-skill-pack --list             # browse the community registry
bin/install-skill-pack <owner>/<repo>     # install a curated pack
bin/add-skill <owner>/<repo> --list       # any repo containing SKILL.md files
```

所有内容安装后都处于**禁用状态**，经过安全扫描，并在 `skills.lock` 中记录来源。

**启用社区 SKILL.md 之前，请先阅读它。**安装技能包意味着运行陌生人编写的提示词，并向其中注入你的机密信息。扫描器使用的是正则表达式——它无法检测提示注入。请检查 `requires:` 是否与其声称的任务相符、`capabilities:` 是否如实描述，以及其中是否存在指示代理将数据发送到无关位置的内容。

**启用任何会对现实世界产生广泛影响的技能前，必须明确确认：**`distribute-tokens`（发送 USDC）、`schedule-ads`（花费资金）、`send-email` 和 `vuln-scanner`（联系真实人员）、`deploy-prototype` 和 `feature`（向他人的仓库推送内容）。

---

## 模式 7 — 策略与表达风格

有两个文件会被带入**每一次**运行的上下文中。两者都不是必需的，开销都很低，而且它们对输出质量的提升超过任何针对单个技能的调优。

### `STRATEGY.md` — 指路明灯

它会被导入 `CLAUDE.md`，因此会出现在每个技能的上下文中：目标、优先级、受众和硬性约束。当某项选择无法通过其他方式确定时，它会作出最终取舍。内容要保持**精炼**（每次运行都会消耗 token）且**具体**（模糊的策略无法作出取舍）。

```bash
./aeon strategy show
./aeon strategy set --file STRATEGY.md
./aeon strategy build "<one-line goal>"    # dispatches the strategy-builder skill
```

`build` 会读取简报、仓库 README 和 `memory/MEMORY.md`，然后提交一份草稿。它以 Action 的形式运行，因此请在完成后拉取一次。无需 API 密钥。

### `soul/` — 它听起来是什么样的

默认情况下，Aeon 没有个性。每次运行时都会读取 `soul/SOUL.md`（身份、世界观、观点）和 `soul/STYLE.md`（语气、词汇、反模式），因此通知和内容听起来会像操作者本人。`soul/examples/` 包含 10–20 个校准样本。

```bash
./aeon soul show
./aeon soul build --handle <x-handle> --name "<Full Name>" --links <url,url>
```

`XAI_API_KEY` 能够最充分地解读真实的 X 时间线；如果没有它，`soul-builder` 会回退到 Web 搜索。github.com/aeonfun/soul.md 上还有一个完整示例灵魂库，可以作为起点。

**质量标准：具体到可能出错。** *“我认为大多数 AI 安全讨论都是自作聪明的自我安慰”*是有用的。*“我对 AI 安全有细致入微的看法”*则没有用。要追求前一种——一个无法冒犯任何人的灵魂，听起来也不会像任何人。

---

## 模式 8 — 从历史记录中挖掘可自动化的技能

“有哪些事情是我一遍又一遍手动完成，而 Aeon 完全可以代劳的？”模式 4 会把*当前*聊天转化为技能；模式 8 则会挖掘*过去*的聊天，找出哪些聊天值得转化为技能。它会读取操作者本地的 Claude Code 对话记录（`~/.claude/projects/*/*.jsonl`），因此只能在他们自己的机器上使用——绝不能在 Aeon 运行过程中使用。

1. **扫描。** 从实例仓库根目录运行挖掘器：

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/skills/aeon/scripts/mine-history.mjs --days 45 --top 15
   ```

   它会解析时间窗口内的每个顶层会话（跳过子代理旁支会话），将 shell 命令规范化为 `binary subcommand`，对会话标题进行分组，并输出一份按**不同会话数 × 不同天数**排序的摘要——衡量的是重复性和周期性，而不是原始数量。参数：`--days N`（时间窗口，默认 120）、`--project SUBSTR`（仅包含 cwd 匹配的会话——将范围限定到某个仓库/主题）、`--top N`、`--min-sessions N`、`--json`。它没有依赖项，如果没有历史记录，会以清晰的错误退出。有关表格的深入解读和候选项评判标准，请参阅：`references/history-mining.md`。

2. **像人一样阅读它。** 摘要只是原始信号，并非定论——判断权在你：
   - **重复出现的命令工作流**——如果一个 `binary subcommand` 出现在许多会话中，*并且*横跨许多天，那它就是一种习惯。通用基础操作（`git status`、`gh auth`、单独的 `node`/`python3`）已经被过滤掉，但 `gh pr`/`gh api`/`npm run` 同样属于底层工具——它们到处都高频出现，作为技能创意的信号却很弱。要寻找的是*有辨识度的*重复调用：具名脚本、特定 CLI（`x-cli`、`langfuse`、`raindrop`），或固定而紧凑的 `gh api` 模式。
   - **重复出现的任务主题**——分组后的会话标题是最强的信号。如果某个标题以大致固定的周期在许多天里反复出现（“检查 X”“审查 Y”“汇总 Z”），它几乎总是真正的自动化候选项。
   - **工具 / 项目**——工作涉及哪些 MCP 服务器和仓库；这能告诉你一个技能需要接入哪些资源，以及应在哪里使用 `--project` 限定范围。

3. **筛选出真正的候选项。** 只有同时满足以下所有条件的条目才值得提出：
   - **重复发生** — 跨越数天内的多个会话，而不是仅集中在某个忙碌的下午。
   - **符合获取/计算/报告模式** — 获取或检查某些内容并进行报告。交互性强、需要大量决策或一次性的迁移工作并不适合自动化。
   - **可安全无人值守运行** — 不依赖本地文件、已登录的桌面应用，也不需要人工在任务中途作答（模式 4 的步骤 2/3 涵盖加固工作）。
   - **尚未成为 Skill。** 对照当前实例进行去重：`./aeon skills ls`。许多重复进行的 `gh pr` 工作已由 `pr-review`/`pr-check` 覆盖；定期研究工作也已有 `digest`/`mention-radar`。如果现有 Skill 已能覆盖，那么应采用模式 2（重新安排时间）或模式 5（编辑其 `var`），**而不是**创建新的 Skill。

4. **提出三个候选项，并附上证据。** 不要直接倾倒摘要内容。列出**三个**候选项，每个都要以重复次数作为证据（“你在 D 天内的 N 个会话中执行了 X”）、提供一行 Skill 概述（它获取什么、发送什么）、给出建议的 `mode:`（如果它只进行获取和报告，则使用 `read-only`），并根据观察到的频率推断建议的 `schedule:`（约每天发生 → 每天；约每周发生 → 每周）。询问要构建哪一个。

5. **移交给模式 4** 来编写选定的 Skill——使用相同的 Skill 文件结构、无人值守加固、带引号的 `schedule:` 条目，以及双目录 CI。模式 8 发现工作；模式 4 将其交付。

**隐私：** 会话记录仅在本地读取，对外只展示汇总摘要。不要将原始提示词正文或会话中的任何敏感内容粘贴到频道或已提交的文件中；次数和标题足以用来作出决定。

---

## 提供商与运行框架

这是两个相互独立的维度。不要混淆：**网关**决定由哪个模型回答；**运行框架**决定由哪个 CLI 运行 Skill。

### 网关——为 Claude Code 提供支持的服务

设置一个密钥即可启用。`aeon.yml` 默认包含 `gateway: { provider: auto }`，它会在运行时根据现有密钥，按以下优先顺序进行解析：

```
claude → anthropic → openrouter → bankr → usepod → venice → surplus → grok
```

`direct` **不是**这条链路中的一跳——它是在八个密钥均未设置时使用的占位符。它不需要任何内容，也不会配置任何内容，因此运行过程会继续使用环境中碰巧存在的 `ANTHROPIC_*` 环境变量，否则会在首次调用模型时失败。日志中的“已解析为 `direct`”意味着**未找到任何密钥**，而不是备用方案已成功生效。

| 提供商 | 密钥 | 备注 |
|---|---|---|
| Claude 订阅 | `CLAUDE_CODE_OAUTH_TOKEN` | 一键式 OAuth，包含在 Pro/Max 套餐中 |
| Anthropic API | `ANTHROPIC_API_KEY` | 按使用量付费 |
| OpenRouter | `OPENROUTER_API_KEY` | `sk-or-…` · Anthropic 原生直通，风险最低 |
| Bankr | `BANKR_LLM_KEY` | `bk_…` · 折扣价 Opus |
| UsePod | `USEPOD_TOKEN` | 无前缀——传入 `--provider usepod`。令牌位于基础 URL 中，请妥善保密 |
| Venice | `VENICE_API_KEY` | 无前缀——传入 `--provider venice`。隐私优先，通过 sidecar 进行桥接 |
| Surplus | `SURPLUS_API_KEY` | `inf_…` · 在 Base 上以 USDC 结算——先为钱包充值并执行一次 `approve()` |
| Grok (xAI) | `XAI_API_KEY` | `xai-…` · 直通 `api.x.ai` |

它以**级联**方式运行，而不是只做一次选择：优先级最高的密钥最先使用，一旦出现*任何*失败（额度不足、速率限制、服务中断、无效响应），该次运行就会故障转移到下一个已设置密钥的提供商。只有全部失败时才会报错。日志会在每一跳打印 `Routing attempt via '<provider>'`。

- **重新排序：**仓库变量 `GATEWAY_ORDER`（名称以空格分隔）。
- **固定使用一个提供商**（禁用故障转移）：`./aeon config set gateway <name>`。
- **任何与 Anthropic 兼容的端点：**`ANTHROPIC_API_KEY` 加上仓库变量 `ANTHROPIC_BASE_URL`——例如 `https://api.deepseek.com/anthropic`。

### 执行框架——由哪个 CLI 运行技能

`claude`（默认）或 `grok`。Grok 执行框架会运行 `grok` CLI，而不是 Claude Code，并且**完全绕过网关**——它有自己的身份验证机制。

- **设置方式：**使用 `./aeon config set harness grok` 进行全局设置，或者在单个技能的 `aeon.yml` 条目中设置 `harness: "grok"`——**必须加引号，并写在该条目的单个内联行中**。每个技能的 `model:` 和 `harness:` 由仅匹配单行的 grep 读取，并且要求使用双引号（`aeon.yml:367`、`:380`），因此未加引号或拆分到多行的覆盖配置会被静默忽略，技能将继续使用全局默认值——不会报错，而且日志中的 `model=` 行看起来也完全正常。通过 CLI 设置任一项后，请重新查看该条目；如果缺少引号，请补上。
- **身份验证：**使用 `XAI_API_KEY`，或通过控制面板中的**连接 X 账号**使用 X 账号（SuperGrok / X Premium+），这会存储 `GROK_CREDENTIALS`。X OAuth 流程没有 CLI 标志——这项操作应让用户前往 `./aeon`（控制面板）完成。
- **模型：**`grok-4.5`（默认，推理模型）或 `grok-composer-2.5-fast`（价格低廉）。
- **没有免费套餐。**

请预先告知用户：
- Grok 运行会报告 **0 个 token**——其 JSON 不包含 token 计数，因此成本跟踪读取到的是空值。这不是 bug。
- X OAuth 会话会过期。如果无人值守运行开始因身份验证失败，请重新连接。
- `mode: read-only` 仍然适用（映射到 `--sandbox read-only`），并且 MCP 可以正常工作。

每个技能的 Grok 配置项位于 `SKILL.md` 的 frontmatter 中（在 Claude 执行框架下会被忽略）：`max_turns`（默认值为 60）、`best_of_n`、`verify` 和 `effort`（`low|medium|high|xhigh|max`——仅适用于推理模型；`grok-composer-2.5-fast` 不接受此配置）。