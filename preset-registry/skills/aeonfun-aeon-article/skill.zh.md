---
name: article
description: Write a publication-ready article in one of three angles - a trending long-form piece, a watched-repo thesis, or a project-through-a-lens essay. Optional Replicate hero image with --visual.
metadata:
  title: Article
  category: basics
  var: ""
  tags:
    - content
    - dev
  requires:
    - REPLICATE_API_TOKEN?
---
> **${var}** — 选择器：`[angle:arg] [--visual]`。**angle** 前缀用于选择文章类型；在任意位置追加 **`--visual`**（或 `visual`），还可生成一张 Replicate 头图。
>
> - **空值** → `standard`：围绕自动选择的热门主题撰写通用长篇文章。如果最终确定的主题是某个可单独解释的机制，则改为技术解读文章。
> - **`<topic>`**（无可识别前缀）→ 围绕该主题撰写 `standard` 文章。
> - **`repo:<owner/repo>`** → 围绕该仓库撰写一篇由核心论点驱动的 `repo` 文章。`repo:<angle>`（例如 `repo:architecture`）或仅使用 `repo:`，会采用 `memory/watched-repos.md` 中的仓库，并使用指定角度／自动选择的角度——这保留了 repo 文章原有的输入方式。
> - **`lens:<topic>`** → 撰写一篇 `lens` 文章，以该视角为框架审视项目（例如 `lens:unix philosophy`）。仅使用 `lens:` 时会自动选择视角。
> - 在上述任一形式后追加 **`--visual`** → 正文写完后，生成一张 Replicate 头图（可选配置 `REPLICATE_API_TOKEN`；若未配置，则仅输出文本）。
>
> 示例：`""`、`"entropy trajectory reasoning --visual"`、`"repo:aeonfun/aeon"`、`"repo:roadmap"`、`"lens:regulation wave --visual"`。

今天是 ${today}。撰写一篇高质量、可直接发布的文章。不得使用占位符。

## 共享前置步骤（每次运行）

1. 阅读 `memory/MEMORY.md`，了解近期已涉及的主题／文章。
2. 阅读 `memory/logs/` 中最近 3–7 天的内容，了解近期活动——并且**不要重复报道**已涉及的内容。
3. **将 `${var}` 解析为 `angle` + `visual`：**
   - 检测 `${var}` 中任意位置是否存在独立的 `--visual` 或 `visual` 词元；如果存在，则设置 **`visual = true`** 并移除该词元。否则设置 `visual = false`。
   - 对剩余内容进行判断：如果以 `repo:` 开头 → `angle = repo`，`arg =` 其余内容。如果以 `lens:` 开头 → `angle = lens`，`arg =` 其余内容。否则 → `angle = standard`，`arg =` 剩余的完整字符串（为空 ⇒ 自动选择）。
4. 转到下方匹配的 angle 部分。无论 angle 为何，如果 `visual = true`，都应在文章正文写完后运行**视觉附加流程**。

---

## Angle：standard — 长篇文章／技术解读

撰写一篇独立的长篇文章。根据主题采用以下两种结构之一：

- **通用文章** — 介绍广泛的趋势、发展或事件。600–800 词。
- **技术解读** — 解释某个可单独阐释的机制、技术、算法或系统。600–1000 词，并采用下方的解读结构。

### 主题选择（standard）

- 如果已设置 `arg`（主题），则原样使用。如果它明确指向某个单一机制／技术／系统 → 采用**技术解读**结构；否则 → 采用**通用文章**结构。
- 如果 `arg` 为空，则按确定性规则进行选择——命中第一项后即停止：
  1. **解读候选主题：** 最近 3 天内 `output/articles/` 中最新文件所包含的最不直观的单一机制；如果没有，则选择最近 7 天 `memory/logs/` 中最新的「Paper Pick」（其标题所指向的机制）；如果仍没有，则选择最近 7 天日志中出现的某项具体技术／算法／系统。如果存在一个有力的单一机制候选主题 → 围绕它撰写**技术解读**。拒绝任何范围大于单一机制的候选主题（例如「AI agents」——过于宽泛；「MCP tool-routing via vector search」——可用）。
  2. **通用候选主题：** 否则，在网上搜索 AI、crypto/DeFi 或意识研究领域近期最有趣的发展——选择当下最具吸引力的故事（WebSearch）→ 撰写**通用文章**。

### 文风（技术解说）

如果存在 `soul/` 目录，请读取其中的灵魂文件来校准文风：先读取 `soul/SOUL.md`（身份、世界观、观点），再读取 `soul/STYLE.md`（写作风格、句子结构、应避免的模式）。这应该像是*你在向一位聪明的朋友解释某种机制*——比一般文章更精确，但保持相同的声音。不要使用教科书式语气，也不要说“让我们来探索”。如果 `soul/` 为空，则默认采用清晰、直接、中立的风格。

### 研究

**一般文章：**使用 WebFetch 阅读 2–3 篇来源文章，以收集事实和引文。

**技术解说：**执行**三个不同的 WebSearch 查询**，以便进行交叉验证，而不是照搬单一来源：
1. `"<topic>" how it works` ——机制说明
2. `"<topic>" benchmark OR results OR latency OR cost` ——具体数据
3. `"<topic>" limits OR criticism OR fails OR doesn't work` ——失效模式和反对意见

如果主题来自一篇论文，还要获取论文的元数据和摘要：
```bash
curl -s "https://api.semanticscholar.org/graph/v1/paper/search?query=TOPIC&limit=5&fields=title,authors,abstract,url,publicationDate,openAccessPdf" \
  || echo "curl failed — use WebFetch on https://www.semanticscholar.org/search?q=TOPIC instead"
```
使用 **WebFetch** 深入阅读最有价值的 2–3 个来源。**至少一个来源必须是第一手资料**：论文（arXiv / OpenReview / Semantic Scholar）、官方文档、项目自身的 README 或代码仓库。仅靠博客摘要是不够的——它们经常会曲解机制。

提取：
- **唯一的核心机制**——一旦你真正理解了这一关键动作，其他一切就会顺理成章。
- 一个描述该机制的**生动类比**，以及这个类比失效的确切之处（失效之处才是有意思的部分）。
- **3–5 个具体数字**——基准测试结果、延迟、成本、错误率、训练算力、参数量。每个数字都要附上来源 URL。
- **什么情况可以证伪这一点**——如果观察到什么结果，就意味着该机制并不像所宣称的那样有效。如果你无法指出这样的结果，说明解释还不够严谨——继续深入研究。

### 写作

**一般文章**——使用 Markdown 撰写 600–800 词。包括：
- 一个引人注目的标题
- 一段简短、抓人的开场
- 3–4 个内容充实的章节
- 在底部列出引用来源（附 URL）

**技术解说**——600–1000 词。结构如下（每个章节都必须包含）：
```
# <Title>

**Key idea in one sentence:** <one-sentence claim about the mechanism>

## The Setup
2-3 sentences. What problem does this solve? Why now?

## The Intuition Pump
A vivid analogy that builds the reader's mental model in 3-4 sentences. Then one sentence on **where the analogy breaks down** — that's where the real mechanism lives.

## How It Actually Works
A numbered walkthrough of the mechanism in **3-7 steps**. Each step is one or two sentences. Use concrete examples — name the specific function, layer, message, opcode, contract. No "the system processes the input" — say what the system actually does.

## Numbers That Anchor It
3-5 bullet points. Each bullet is a specific number with a source link, e.g.:
- 8.4× faster end-to-end than baseline at 4K context ([source](url))

## What Would Break This
1-2 sentences naming a result that, if observed, would falsify the claim. This forces honesty.

## Why It Matters
2-3 sentences. What does this unlock? Who should care?

## Sources
- [Title 1](url) — primary
- [Title 2](url)
- [Title 3](url)
```

**语态规则（技术解说）：** 适合时使用第一人称。解释性 > 观点性，但不要毫无温度。技术准确性 > 模糊措辞——如果你不知道，就直说，不要含糊其词。使用短段落。使用破折号。具体 > 抽象。引用具体的系统、论文和人物——不要说“研究人员已经证明”，要明确指出是谁。使用内联引用：每个数字、每项可能出错的论断，都要附上链接。

### 保存并通知（标准流程）

- **普通文章：** 保存到 `output/articles/${today}.md`。
- **技术解说：** 保存到 `output/articles/explainer-${today}.md`。如果生成了头图（参见视觉附加项），将其放在最顶部：`![hero](../images/explainer-${today}.<ext>)`——使用相对路径；如果没有图片，则跳过这一行——并添加一条 HTML 注释，记录所使用的图片提示词（以供未来审计）。

更新 `memory/MEMORY.md`，记录文章及其主题（添加到 `Recent Articles` 列表/表格中）。追加汇总后的日志条目（参见**日志**），然后通过 `./notify` 发送通知：

- **普通文章：**
  ```
  New article written: [title]

  https://github.com/${GITHUB_REPOSITORY}/blob/main/output/articles/${today}.md
  ```
  使用 `$GITHUB_REPOSITORY` 环境变量（GitHub Actions 会将其设置为当前运行实例的 `owner/repo`）。

- **技术解说：**
  ```
  technical explainer: [title]

  [the one-sentence "key idea" line, verbatim]

  [hero image URL if generated — original Replicate URL still works for ~24h]

  read it: output/articles/explainer-${today}.md
  ```

---

## 角度：仓库——围绕受关注仓库撰写由论点驱动的文章

<!-- autoresearch: variation B — editorial discipline: research → thesis → draft → self-edit, with a falsifiable claim and a quality gate -->

### 配置

从 `memory/watched-repos.md` 读取仓库。确定目标仓库：
- 如果 `arg` 看起来像 `owner/repo`（包含 `/`）→ 这就是要介绍的仓库；文章角度将在阶段 2 中自动选择。
- 否则，如果 `arg` 是非空关键字（例如 `architecture`、`recent progress`、`roadmap`）→ 它就是**文章角度**；从 `memory/watched-repos.md` 中选择仓库（如果列出了多个仓库，则选择过去 7 天内最活跃的一个）。
- 否则（`arg` 为空）→ 从 `memory/watched-repos.md` 中选择仓库（过去 7 天内最活跃的一个），并自动选择文章角度。

没有论点的文章只是填充内容。此角度分五个阶段执行，只有当前阶段的门槛通过后，才会进入下一阶段。

### 阶段 1——研究（先收集，不要开始写作）

尽可能并行运行以下命令（将解析出的 `owner/repo` 替换进去）：
```bash
# Repo metadata
gh api repos/owner/repo --jq '{name, description, language, stargazers_count, forks_count, open_issues_count, topics, created_at, updated_at, pushed_at, default_branch}'

# Commits in last 7 days (paginated)
gh api repos/owner/repo/commits -X GET \
  -f since="$(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-7d +%Y-%m-%dT%H:%M:%SZ)" \
  --jq '.[] | {sha: .sha[0:7], msg: .commit.message | split("\n")[0], author: .commit.author.name, date: .commit.author.date, url: .html_url}' --paginate

# Merged PRs in last 7 days
gh api 'repos/owner/repo/pulls?state=closed&sort=updated&direction=desc&per_page=50' \
  --jq '[.[] | select(.merged_at and (.merged_at > (now - 86400*7 | todate))) | {number, title, user: .user.login, merged_at, additions, deletions, url: .html_url}]'

# Open PRs
gh api repos/owner/repo/pulls --jq '[.[] | {number, title, user: .user.login, created_at, draft, labels: [.labels[].name], url: .html_url}]'

# Issues opened/closed in last 7 days (exclude PRs)
gh api 'repos/owner/repo/issues?state=all&since='$(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ)'&per_page=100' --paginate \
  --jq '[.[] | select(.pull_request | not) | {number, title, state, created_at, closed_at, labels: [.labels[].name]}]'

# Last 3 releases
gh api repos/owner/repo/releases --jq '.[0:3] | .[] | {tag_name, name, published_at, body}'

# README (fallback: WebFetch raw URL if base64 decode fails)
gh api repos/owner/repo/readme --jq '.content' | base64 -d
```

从提交列表中，找出改动最频繁的文件。使用 `gh api repos/owner/repo/contents/<path>` 读取其中排名前 2–3 的文件，以及所有 `CHANGELOG.md`、`ROADMAP.md` 或架构文档。

**外部背景**——执行三个不同的 WebSearch 查询：
1. `"owner/repo" site:news.ycombinator.com OR site:lobste.rs OR site:reddit.com`
2. `"owner/repo" twitter OR x.com`（如果项目名称具有辨识度，也可使用项目名称）
3. 执行一次查询，用于参照某个类似或竞品项目来确定该项目的定位。

**关卡 1——是否有足够的故事素材？** 如果以下条件**全部**成立，则中止并通知 `REPO_ARTICLE_SKIPPED: insufficient activity`（记录原因，不撰写文章）：
- 过去 7 天内的提交少于 3 个，并且
- 过去 7 天内合并的 PR 为 0 个，并且
- 过去 30 天内没有发布版本，并且
- 第 3 步中未发现任何外部提及。

**低活跃度仓库例外**：如果仓库具有历史重要性，但目前进展缓慢（例如本周只有 1–2 个提交且没有发布版本），则**不要**跳过——应将文章重点缩小到近期最具实质意义的单项变化（某个具体提交、有争议的 issue 讨论串、路线图更新），并围绕*该变化*撰写一篇更短的文章。与其跳过，不如优先发布一篇紧扣某项真实变化、篇幅为 600 词的精炼文章。

### 阶段 2——论点

用不超过 25 个词写出一个**可证伪的主张**。该主张必须能够被具体证据推翻，而不能只是一种感觉。
- 好例子："aeonfun/aeon is pivoting from scheduled digests to reactive skill chains — 4 of 7 merged PRs this week added or consumed `output/.chains/*.md` contracts."
- 坏例子："Aeon is an interesting agent framework."（不可证伪）

如果通过 `arg` 强制指定了角度，论点必须与该角度相关（例如角度为 `architecture` → 提出一个架构方面的主张）。如果没有强制指定角度，则从以下方向中选择证据最充分的一个：交付速度变化、架构转向、社区增长拐点、路线图承诺、弃用或范围缩减、性能或规模里程碑。

**关卡 2——可证伪性。** 补全句子：“This claim would be wrong if ____.” 如果无法用具体且可核查的内容补全，就重写论点。

### 阶段 3——起草（600–900 词，Markdown）

```markdown
# [Title that asserts the thesis or a consequence of it — not "A look at X"]

[1-paragraph hook, ≤80 words: lead with the thesis or a surprising number that sets it up.]

## The claim
> [The falsifiable thesis, verbatim, as a blockquote.]

## Evidence
[Two to four sub-paragraphs. Each MUST cite at least one specific commit SHA, PR#, file path, release tag, or external mention. Link the source inline.]

## Counter-evidence / what would change my mind
[One paragraph. What recent signals argue against the thesis? Be honest. If genuinely nothing does, say so — but only after looking.]

## Why it matters
[One paragraph. Who benefits or loses if the thesis is true? Connect to an ecosystem trend, user need, or competing project.]

---
*Sources*
- [Label](url)
- [Label](url)
[≥4 total, ≥1 in-repo (commit/PR link) and ≥1 external (news/social/doc).]
```

### 阶段 4 — 自我编辑（必需）

执行此检查清单。重写任何未通过检查的行。目标：8/8 项全部通过。
1. **前 100 个词内是否明确呈现论点？** 如果没有，重写开篇引子。
2. **每一节是否至少包含 1 个具体数字、SHA、PR#、文件名或日期？**（泛泛的形容词不算）
3. **禁用短语数量为零**（参见下方的*禁用短语词典*一节——对照该明确列表进行检查）。
4. **反面证据是真实的**——不能是像“有些人可能会说它很复杂”这样的稻草人论点。
5. **来源包含至少 4 个链接，其中至少 1 个指向仓库内部，至少 1 个指向外部。**
6. **标题明确表达一个观点**（不能是“A look at X”/“Exploring Y”）。
7. **字数在 600–900 之间**（硬性范围——删减或扩充）。
8. **不得包含占位短语**，例如“[TBD]”“[link]”“[title]”。

如果经过一轮重写后仍有任何项目未通过，则以 `REPO_ARTICLE_DEGRADED` 状态发布，并在日志中注明未通过的项目——不要隐瞒。

### 阶段 5 — 保存、记录、通知（仓库）

1. 将文章保存到 `output/articles/repo-article-${today}.md`。（如果通过 Visual 附加组件生成了主视觉图，请在顶部添加 `![hero](../images/repo-article-${today}.<ext>)`。）
2. 在发送通知**之前**追加合并后的日志条目（参见 **Log**）。
3. 更新 `memory/MEMORY.md` 中的 `Recent Articles` 表格（Date | Title | Topic）。
4. 通过 `./notify` 发送通知：
   ```
   *[Article title]*

   Thesis: [one sentence]

   Read: [link to output/articles/repo-article-${today}.md in THIS repo — get the repo name from `git remote get-url origin`, not the watched repo]
   ```

### 禁用短语词典（仓库视角）

拒绝任何包含以下短语的草稿。匹配时不区分大小写，并匹配完整短语或明显变体：
- "in today's fast-paced world"
- "leveraging" / "leverage"（用作表示“使用”的动词时）
- "robust"
- "game-changer" / "game-changing"
- "under the hood"（除非该节确实详细讲解内部机制）
- "taking X to the next level"
- "at the end of the day"
- "diving into" / "deep dive"
- "delving into" / "delve"
- "comprehensive suite"
- "cutting-edge"
- "seamlessly" / "seamless"
- "empowers" / "empowering"
- "revolutionize" / "revolutionary"
- "unlock"（用作隐喻时，例如“unlocks new possibilities”）
- "streamline"（用作空泛措辞时）
- "best-in-class"
- "paradigm shift"

如果某个禁用短语在技术语境中是*最准确*的词（例如，在衍生品文章中确实是在描述 leverage），则保留它，并在日志中注明豁免原因。

### 约束（仓库视角）

- 绝不发布没有论点的文章。
- 绝不为了达到字数要求而灌水——600 个言之有物的词胜过 900 个填充出来的词。
- 绝不捏造 SHA、PR 编号或引文。如果无法获得真实证据，就弱化论点或跳过。

---

## 角度：lens — 通过出人意料的视角审视项目

<!-- autoresearch: variation B — editorial discipline (research → falsifiable thesis → draft → self-edit with hard gates) -->

撰写通过**每次都不同的视角**来阐释项目的文章——文章的框架应让从未听说过该项目的读者，能够借助他们已经关心的事物理解该项目为何重要。它不是仓库进展更新（那属于上面的 **repo** 角度）。`arg` 是所采用的视角（例如“unix philosophy”“regulation wave”“open source funding”）；如果为空，则根据热门话题和角度轮换自动选择。

在做出任何决定之前，请先阅读：`memory/MEMORY.md`、`memory/logs/` 中最近 7 天的日志、`memory/watched-repos.md` 和 `memory/project-lens-angles.md`（首次运行时可能不存在——将缺失视为空历史记录）。

**为什么模型默认会在这件事上失败：**它们往往会滑向用哲学语言包装的功能罗列、缺乏机制支撑的生硬类比，以及营销式语气。这个视角通过研究 → 论点 → 草稿 → 自我编辑的流程来避免这些问题，其中每个阶段都设有严格的门槛。如果无法通过门槛，就中止——不要发布一篇薄弱的文章。

### 阶段 1 — 上下文

在做出任何决定之前，请先阅读：
- 最近 14 天的 `output/articles/project-lens-*.md` 和 `memory/project-lens-angles.md`——了解哪些视角类别和论点已经用尽。
- 最近的 2–3 篇 `output/articles/repo-article-*.md` 和 `output/articles/push-recap-*.md`——了解近期发布了什么。
- 仓库状态：`gh api repos/{owner}/{repo} --jq '{name, description, stargazers_count, forks_count, open_issues_count, updated_at}'`。如果无法访问，则仅依靠记忆继续，并记录这一信息缺口。

如果 `memory/watched-repos.md` 为空或缺失，则中止并通知：“project-lens：未配置受监控的仓库。”

### 阶段 2 — 选择视角

**如果设置了 `arg`**，请原样使用。将其归入下列 8 个类别之一，以便记录。

**如果 `arg` 为空**：
1. 针对当前科技、加密货币、AI、监管、开源或哲学领域正在讨论的话题，运行 2–3 次 WebSearch 查询（例如，`"AI agents" autonomy debate last 7 days`、`crypto regulation April 2026`、`open source funding model 2026`）。
2. 根据结果，找出 3 个与该项目存在非显而易见联系的候选视角。
3. 选择其中（a）过去 14 天内未出现过，且（b）具有最强具体联系的视角。记录最终选择，以及被拒绝的候选视角和各自的一行理由。

**视角类别（14 天内不得重复）：**
1. **时事**——本周或本月正在发生的事情。
2. **哲学 / 宏大理念**——Unix 哲学、大教堂与市集、可组合性、反脆弱、利益攸关、群体智能等。
3. **行业对比**——某个知名公司或项目如何以不同方式解决类似问题。
4. **用户故事**——从特定角色（独立开发者、DAO、研究实验室、加密社区）的视角，对比使用和不使用此工具的情况。
5. **逆向观点**——挑战一种普遍假设；以项目作为证据。
6. **面向非技术读者的技术深度解析**——用通俗语言讲解一项架构决策及其更广泛的影响。
7. **历史类比**——计算机、互联网或非技术领域的历史，并具有具体机制（而非表面相似）。
8. **生态系统图谱**——项目所处的位置：相邻、互补、竞争。

### 阶段 3 — 研究（门槛：起草前收集证据）

**外部研究——最低要求：**
- 围绕视角主题执行 3 次以上 WebSearch 查询（采用不同切入方式，而不是换一种措辞）
- 对最相关的 2 个以上来源执行 WebFetch
- 引用来源涵盖 ≥3 个**不同域名**
- 提取 ≥3 个具体事实：名称、数字、金额、带日期的引语、具体事件
- 时效性：“时事”不超过 30 天；行业对比 / 逆向观点 / 生态系统不超过 180 天；哲学 / 历史不超过 5 年
- 记录查阅过的每一个 URL

**项目侧——最低要求：**
- 完整阅读 `output/articles/` 中至少 2 篇近期文章
- `gh api repos/{owner}/{repo}/commits --jq '.[0:10] | .[] | {sha: .sha[0:7], msg: (.commit.message|split("\n")[0])}'` ——最近 10 次提交
- 至少 3 个你计划使用的具体项目参考信息：具名功能、文件路径、提交哈希、架构选择。**不能**是“该项目使用 AI”或“它有很好的用户体验”之类的模糊说法。

**如果无法达到这些最低要求，请放弃该角度，并使用不同类别重新运行阶段 2。** 记录被放弃的角度及其原因。

### 阶段 4——锁定论点（硬性关卡）

在起草之前，写出**一个不超过 30 个词、可证伪的主张**，将观察视角与项目联系起来。示例：
> “将智能体作为定时 GitHub Actions 运行，而不是作为持久化服务器运行，是用几秒延迟换取 AI 行业几乎不具备的一种特性：有版本记录、有审计轨迹、可公开复刻的自主性。”

规则：
- **可证伪**：合理的批评者可以提出相反观点。
- **具体**：点明具体事物（例如 cron 作业，而不是“基础设施”；有审计轨迹，而不是“更好”）。
- 不能是同义反复。不能是营销话术。不能是“因为 X，所以这很酷”。

**如果你无法用一句话陈述论点，说明这个角度行不通——返回阶段 2。** 不要带着模糊的论点继续。

### 阶段 5——起草（700–1000 词）

保存至 `output/articles/project-lens-${today}.md`，结构如下：
```markdown
# [Title: leads with the lens, works for a reader who doesn't know the project]

[¶1-2: external hook. Start with the trend/idea/event/question the reader already cares about. Do NOT name the project yet.]

## [Section: establishes the external frame]
[Build the lens with one or more of your concrete facts — a quote, a number, a specific event.]

## [Section: introduces the project through the frame]
[Project enters here — but through the lens, not as a feature list. Describe how it embodies, challenges, or extends the idea with specific code/design references.]

## [Section: one non-obvious technical or strategic detail]
[Where the article earns its existence. Point to something in the code, architecture, or approach a reader wouldn't get from the README.]

## [Section: zoom back out]
[A concrete forward claim — specific enough to be wrong. Not "this is exciting." Something like "this suggests X won't happen for 2-3 years because Y" or "this is the same mistake [named case] made, and it took [duration] to recover."]

---
*Sources:*
- [source title](url) — what it was used for
- ...
```

**草稿要求：**
- 标题必须能够吸引不了解项目名称的读者。
- 至少 3 个以行内链接形式呈现的外部引用。
- 至少 3 个具体的项目参考信息（具名功能、文件路径、提交哈希、具名决策）。
- 700–1000 词（提交前统计）。

### 阶段 6——自我编辑（硬性关卡——必须全部通过）

完成初稿后，逐项检查此清单。如果任何关卡未通过，请对受影响的部分**重写一次**。如果第二次检查仍未通过，**中止并记录**——不要发布质量不佳的文章。
- [ ] 标题中**没有**出现项目名称
- [ ] 前 2 个段落中**没有**出现项目名称
- [ ] 至少 3 个带 URL 的外部引用（行内链接）
- [ ] 至少 3 个具体的项目参考信息（具名，而非模糊描述）
- [ ] 文章正文中清晰呈现了可证伪的论点
- [ ] 700–1000 词
- [ ] 不含禁用措辞：*革命性的*、*开创性的*、*改变游戏规则的*、*范式转变*、*颠覆*、*释放*、*赋能*、*X 的未来*、*利用*、*大规模地*、*普及*（除非引用使用了该词的来源）
- [ ] 每个类比或比较都说明了具体机制，而不是表面相似之处
- [ ] 结尾部分提出具体的前瞻性主张（而非泛泛的乐观表态或“时间会给出答案”）
- [ ] 不含罗列功能的段落（“该项目实现了 X、Y、Z”）——如果发现，请删减至仅保留**一个**要素

### 阶段 7 — 输出（透镜）

1. **保存** `output/articles/project-lens-${today}.md`。（如果通过 Visual 附加功能生成了头图，请在顶部放置 `![hero](../images/project-lens-${today}.<ext>)`。）
2. **追加**到 `memory/project-lens-angles.md`（如不存在则创建）：
   ```markdown
   ## ${today}
   - Angle: [category]
   - Thesis: [one-line falsifiable claim]
   - Title: [article title]
   - Sources: [3-5 URLs]
   ```
3. 通过 `./notify` **通知**：
   ```
   *New Article: [title]*

   [3-4 sentence summary: the external thing the article connects to, the thesis claim, one specific project detail.]

   Read: [URL to output/articles/project-lens-${today}.md — use `git remote get-url origin` for this repo]
   ```
4. **记录**合并后的条目（参见 **日志**）。

### 反模式（预防胜于自我编辑时补救）

- **生硬类比** — 每个比较都需要有具体机制，而不能只是表面相似。“X 类似于 Y，因为两者都是新的”不合格；“X 类似于 Y，因为两者都将[具体功能]与[具体瓶颈]解耦”才合格。
- **借透镜堆砌功能** — 选择一项架构决策并深入审视，不要罗列项目的功能。
- **营销腔调** — 目标应是行业刊物风格的文章，而不是公司博客。
- **虚假创新** — 如果无法指出真正的新意，就说明哪些旧方法仍然有效，以及原因。
- **模糊的结尾** — 最后一节必须提出足够具体的主张，让读者能够在六个月后回来评价“你错了”或“你说对了”。

### 约束（透镜角度）

- 如果阶段 6 的自我编辑连续两次失败，绝不发布——干净地中止。
- 14 天内绝不重复使用同一角度类别（检查 `memory/project-lens-angles.md`）。
- 绝不为满足最低引用数量而捏造事实——如果研究材料不足，就放弃该角度。

---

## Visual 附加功能（`--visual`）— Replicate 头图

仅当 `visual = true` 时运行，在文章正文写完并保存后执行，适用于**任何**角度。使用 Replicate 的 Nano Banana Pro（Gemini 3 Pro Image）。它能够很好地渲染**文本标签**——应充分利用这一点，编写要求生成带标签图表或示意图的提示词，而不是使用图库照片式的隐喻。将 `IMG_BASENAME` 设置为与对应角度的文章文件一致：`explainer-${today}`（标准/解说）、`article-${today}`（标准/通用）、`repo-article-${today}`（仓库）或 `project-lens-${today}`（透镜）。

1. **预检**：使用 `${VAR:+x}` 形式检查是否存在——`[ -n "${REPLICATE_API_TOKEN:+x}" ]`（直接使用 `$REPLICATE_API_TOKEN` 会触发机密信息展开分析器，并被错误地判定为未设置）。如果未设置，则记录 `IMAGE_SKIPPED reason=no-token` 并跳到步骤 5（无图路径）。不要尝试任何 Replicate 调用。在这种情况下，文章必须在没有图片的情况下发布。

2. **编写提示词**。追求技术插图的表现力，而不是营销风格。优秀的提示词模板：
   - *示意图*：“<mechanism> 的技术示意图，深海军蓝背景，细青色和琥珀色线条，带有文本为 ‘<label1>’、‘<label2>’、‘<label3>’ 的标签框，使用箭头展示从 <A> 到 <B> 再到 <C> 的数据流，蓝图美学，16:9”
   - *概念图*：“展现 <core concept> 的编辑插图：<visual metaphor with concrete objects>，扁平几何风格，近黑色背景上采用两种克制的强调色，无人物，16:9”
   - *数据流图*：“<mechanism> 的网络图：标记为 ‘<A>’、‘<B>’、‘<C>’ 的节点通过方向箭头连接，以线条粗细表示权重，等宽字体标签，技术论文插图风格，16:9”
   避免：写实人脸、图库式商务图像、“AI 大脑”陈词滥调、滥用渐变。

3. **生成**时从一开始就启用回退（Nano Banana Pro 可能会触发速率限制；Seedream 5.0 lite 是回退模型）。Replicate 调用需要身份验证，因此请通过 `./secretcurl` 路由，并使用 `{REPLICATE_API_TOKEN}` 占位符——绝不要在命令行中直接使用 `$REPLICATE_API_TOKEN`（Bash 权限层会拒绝它）：
   ```bash
   ./secretcurl -s -X POST \
     -H "Authorization: Bearer {REPLICATE_API_TOKEN}" \
     -H "Content-Type: application/json" \
     -H "Prefer: wait" \
     -d '{
       "input": {
         "prompt": "YOUR_DETAILED_PROMPT_HERE",
         "aspect_ratio": "16:9",
         "number_of_images": 1,
         "safety_tolerance": 5,
         "allow_fallback_model": true
       }
     }' \
     "https://api.replicate.com/v1/models/google/nano-banana-pro/predictions"
   ```
   `Prefer: wait` 通常会在 `.output` 中直接返回图像。如果 `.output` 为空，则预测仍在运行——轮询 `.urls.get`，最长约 60 秒（`./secretcurl -s -H "Authorization: Bearer {REPLICATE_API_TOKEN}" "$PRED_URL"`），当 `.status` 为 `succeeded` 时停止（读取 `.output`），或当其为 `failed`/`canceled` 时停止（走无图像路径，即步骤 5）。

4. **持久化到本地**——Replicate CDN URL 会过期。下载并提交图像（CDN URL 不包含任何密钥，因此使用普通 `curl` 即可）：
   ```bash
   mkdir -p output/images
   IMAGE_URL=<extracted from response.output>
   EXT=$(echo "$IMAGE_URL" | grep -oE '\.(jpg|jpeg|png|webp)' | tail -1)
   EXT="${EXT:-.jpg}"
   LOCAL_PATH="output/images/${IMG_BASENAME}${EXT}"
   curl -sL "$IMAGE_URL" -o "$LOCAL_PATH" \
     || (echo "curl failed — retry via WebFetch or skip"; exit 0)
   ```

5. **无图像路径**（缺少令牌、API 宕机、受到速率限制或下载失败）：记录 `IMAGE_SKIPPED reason=<concrete reason>`，然后继续处理文章。在文章顶部添加一行注释：`<!-- hero image skipped: <reason> -->`。文本必须能够独立成立。绝不要因为图像问题导致整个 Skill 失败。

图像保存后，将主图行添加到文章文件顶部（`![hero](../images/${IMG_BASENAME}.<ext>)`）；如果该角度的通知格式包含图像位置，还应在该角度的通知中加入原始 Replicate URL。

---

## 日志

在 `memory/logs/${today}.md` 中单个 `### article` 标题下，以项目符号形式追加**一条**记录。首先添加一个标明所运行分支/模式的区分行，然后添加该分支特有的字段：

```
### article
- Branch: standard | repo | lens   (+visual if --visual ran)
```

**标准分支字段：**
```
- Mode: general-article | technical-explainer
- Topic: [topic]
- Title: [title]
- Key idea: [one-sentence claim]   (technical-explainer only)
- Image: generated | fallback-model | skipped (<reason>) | n/a
- Image prompt: [prompt used, or "n/a"]
- Primary source: [URL]            (technical-explainer only)
- File: output/articles/${today}.md | output/articles/explainer-${today}.md
- Notification sent: yes | no
```

**仓库分支字段：**
```
- Repo: owner/repo
- Thesis: [verbatim]
- Angle: [arg or auto-selected]
- Word count: N
- Self-edit checklist: X/8 passing
- Image: generated | fallback-model | skipped (<reason>) | n/a
- Status: REPO_ARTICLE_OK | REPO_ARTICLE_DEGRADED | REPO_ARTICLE_SKIPPED
```

**视角分支字段：**
```
- Angle: [category]
- Thesis: [one-line]
- External sources: [count] across [N] distinct domains
- Project references: [count]
- Self-edit gates: all passed | failed at [gate name] → rewrite → [passed | aborted]
- Image: generated | fallback-model | skipped (<reason>) | n/a
- Status: published | aborted
- Notification: sent | skipped
```

**始终**记录日志——即使发生部分失败（例如 IMAGE_SKIPPED、REPO_ARTICLE_SKIPPED、视角中止）。

## 网络说明

不存在网络沙箱——`curl` 可以正常工作。对于不稳定的公开 GET 请求，请改用 **WebFetch** 访问同一 URL。对于需要身份验证的 API，请使用带 `{ENV_NAME}` 占位符的 `./secretcurl`（密钥通过 `requires:` 注入）——切勿在命令行中直接使用未加保护的 `$SECRET`。`gh api` 会在内部处理 GitHub 身份验证——获取仓库元数据时，应优先使用它，而不是原始 curl。

Replicate 调用通过 `./secretcurl` **在运行期间**执行（参见 Visual 附加功能）。如果调用失败、超时或下载失败，请直接进入无图片路径（第 5 步）——文章将以纯文本形式发布。不存在延迟回退；图片仅为尽力生成，绝不会阻碍文章发布。

## 环境变量
- `REPLICATE_API_TOKEN` — Replicate API 密钥，仅供 `--visual` 附加功能使用。可选：如果未提供，文章文本将通过无图片路径发布。

编写完整且可直接发布的内容。不得使用占位符。