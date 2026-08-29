---
name: find-me-skills
description: "Find Agent Skills for a goal the user cannot name yet, then export an installable bundle. Use when they ask which skills fit a project. Don't use for installing named skills, authoring skills, or catalog maintenance."
license: MIT
compatibility: "Claude Code with the `asm` CLI on PATH"
effort: medium
metadata:
  version: 1.2.1
  author: "Luong NGUYEN <luongnv89@gmail.com>"
---
# 查找适合的 Skills

帮助只有**目标但没有技能列表**的用户找到合适的 Agent Skills，解释每个技能的作用，列出运行顺序，并且——如果他们批准——为他们生成一个单独的可安装 bundle 文件。

用户最显著的特征是，他们**不知道该提出什么请求**。已经知道自己想要 `frontend-design` 的人，直接运行 `asm install …` 即可。这项技能面向的是这样的人：“我正在构建一个应用，想从头开始做营销，但我不了解营销，也不知道有哪些技能可用。” 从他们的实际需求出发：梳理目标，确认你理解了他们的需求，然后将其映射到实时目录中真实存在且可安装的技能。

## 流程

1. **收集意图** — 通过对话了解用户想要实现什么。
2. **确认理解** — 复述你对用户情况的理解；在搜索之前让他们纠正你。
3. **发现技能** — 查询实时的 `asm` 目录，寻找候选技能（绝不猜测技能名称）。
4. **整理筛选** — 去重，按步骤分组，并用一句通俗的话解释每个技能。
5. **安排顺序** — 给出分步骤路径，以及每一步的输入和输出。
6. **导出** — 获得批准后，写入 bundle 文件，并给出单行安装命令。

识别用户已经进行到哪一步，并从那里开始。如果用户一开始就提出了详细目标（“我需要 SEO、一个落地页，以及 SaaS 的发布文案”），可以快速确认，然后进入技能发现。如果用户的需求很模糊（“帮我推广我的应用”），就在第 1–2 步多花些时间。不要跳过第 2 步——在搜索之前确认理解，是让推荐保持相关性的关键，也是明确要求。

## 前置条件（开始时检查一次）

这项技能通过 `asm` CLI 进行发现，并生成一个由它安装的文件。
在承诺提供推荐之前，先确认 `asm` 是否可用：

```bash
command -v asm || echo "MISSING"
```

如果缺少 `asm`，告知用户这项技能需要安装 Agent Skill Manager CLI，并确保其位于 PATH 中；引导他们运行 `npm install -g agent-skill-manager`（或项目文档中说明的安装方式），然后停止。后续所有步骤都依赖它。

## 第 1 步 — 收集意图

通过开放式问题进行询问，每次问一到两个问题，直到你可以用一句话陈述用户的目标。可以使用以下提示：

- 你目前正在构建或处理什么？
- 你想要什么结果——发布一个产品、完成一份文字材料，还是让工作流程更高效？
- 哪个部分让你觉得最困难或最陌生？（这通常正是技能最能提供帮助的地方。）
- 这是一次性任务，还是你会反复进行的事情？

使用与用户相匹配的词汇。一个不了解营销的用户说“营销”，实际需要的可能是定位、落地页和发布文案——将这些作为选项提出来，不要擅自假设。除非用户先使用，否则避免使用“ICP”“ASO”等术语。

## 第 2 步 — 确认理解（不要跳过）

在搜索之前，复述你听到的内容，并获得明确确认：

> 我的理解是：你正在构建 **{project}**，并且希望
> **{goal}**。你不确定的部分是 **{gaps}**。我理解得对吗？

如果他们纠正了你，就将这些信息纳入，并再次确认。只有在他们同意后才能继续。
这一步是此 skill 的验收标准——确认实际情况，才能避免生成一个自信但错误的 skill 列表。

## 第 3 步——从实时目录中发现候选项

**绝不要臆造 skill 名称或安装 URL。** 目录会不断变化；
运行时唯一可信的来源是用户机器上的 `asm` CLI。
根据已确认的目标提取 2–5 个搜索词，并分别查询每个搜索词：

```bash
asm search "<term>" --available --json
```

每个搜索词都要单独搜索——宽泛的词（"marketing"、"seo"、"landing page"、"launch"）会找到不同的 skills。当你需要了解 JSON 结构、已安装与可用的判断规则，或空结果的处理方式时，请阅读 `references/catalog-discovery.md`；在第 3 步需要之前，不要将这些细节放入主要上下文预算中。

阅读每个候选项的 `description` 来判断相关性；描述中自身的 "Use when…" / "Don't use for…" 文本会告诉你它是否符合用户的目标。还要运行不带 `--available` 的 `asm search "<term>" --json`，以检测已安装的 skills：在计划中提及已安装的匹配项，但将它们排除在 bundle 之外。只有带有 `installCommand` 的 `available` skills 才能放入其中。

## 第 4 步——筛选：去重并说明理由

根据搜索结果的并集，构建推荐集合：

- **按 skill `name` 去重。** 同一个 skill 可能会在多个搜索词下出现，有时还会来自多个仓库。每个名称只保留一个条目。如果两个仓库提供同名 skill，则优先选择描述与目标最匹配的那个（如果不明显，请注明选择理由）。
- **剔除匹配度较低的项。** 只保留那些你能用一句与用户目标相关的话说明其合理性的 skills。
- **用通俗语言解释每个 skill**——用一句话说明它能为_这位用户_做什么，而不是复述其描述。"`landing-page-copywriter` 为你的发布页面撰写文案，让访客理解产品并完成注册。"

## 第 5 步——编排为逐步执行路径

将筛选后的 skills 按照用户实际应运行的顺序排列，并为每个步骤说明其**输入**（用户/前一步提供的内容）和**输出**（完成后用户将获得的内容）。基础性/上下文类 skills 通常应放在前面；审查/QA 类 skills 通常应放在最后。示例结构：

```
Step 1 — marketing-context
  in:  your product description, target customer
  out: a saved brand/positioning brief other skills read first
Step 2 — landing-page-copywriter
  in:  the brief from step 1
  out: landing-page copy ready to paste
Step 3 — x-post-generator
  in:  the positioning + launch angle
  out: launch posts for X
```

在导出任何内容之前，先将此计划展示给用户。让用户可以轻松地说“删除第 3 步”或“添加一些用于电子邮件的内容”——然后进行调整并再次确认。

## 第 6 步——导出可安装的 bundle（经批准后）

只有在用户批准计划后，才能以 `asm` 的 `BundleManifest` 格式输出一个 **bundle 文件**，并提供一行安装命令。创建一个基于目标命名的文件，例如 `marketing-starter.bundle.json`。

请参阅 `references/bundle-format.md`，了解所需的 JSON 模板、验证规则，以及本技能使用 `asm bundle install` 而不是 `asm install` 或 `asm import` 的原因。逐字复制步骤 3 中的每个 `installUrl`；绝不要手动构造它，也绝不要包含已经安装的技能。

然后进行验证并交接：

```bash
# Sanity-check the file parses as a bundle before telling the user to install:
asm bundle show ./marketing-starter.bundle.json
```

如果 `asm bundle show` 正确报告了该 bundle，请向用户提供最终命令：

```bash
asm bundle install ./marketing-starter.bundle.json
```

告诉用户该命令的作用：它会从各自的来源安装所有推荐的技能，并显示确认提示（添加 `-y` 可跳过确认）。之后，用户可以按顺序重新执行计划中的步骤。如果 `asm bundle show` 报错，请修复出错的字段（错误信息会指出该字段），然后重新检查，确认无误后再交接。

## 验收标准

在将运行标记为完成之前，验证以下所有事项：

- 在进行任何目录搜索之前，用户已明确确认目标。
- 针对每个选定的搜索词，至少运行了一次 `asm search "<term>" --available --json` 查询。
- 使用 `asm search "<term>" --json` 检查了已安装的技能，并将其从 bundle 中排除。
- 在写入任何文件之前，用户已批准按顺序排列的计划。
- 预期输出均已存在：编号计划、bundle 文件路径和安装命令。
- `asm bundle show ./<file>.bundle.json` 成功，或者运行报告验证错误，而不是交接一个有问题的命令。

## 输出格式

每次成功运行结束时，都要清晰分隔地包含以下三项：

1. **计划** — 编号步骤，每一步包含技能、单行用途，以及输入/输出。
2. **bundle 文件** — 已写入磁盘，并显示路径。
3. **安装命令** — 单独一行显示 `asm bundle install ./<file>`。

说明应保持通俗易懂。用户之所以来到这里，是因为他们_不了解可用的技能范围_——要让他们明白即将安装什么，以及为什么安装这些技能。

## 边界情况

- **未安装 `asm`** — 在先决条件检查处停止；引导用户查看安装文档。
- **目标含糊且无法进一步明确** — 停留在步骤 1–2；提供 2–3 个具体方向（“你指的是 A、B 还是 C？”），不要基于猜测进行搜索。
- **目标的部分内容没有目录匹配项** — 如实说明；只推荐真正匹配的内容，并建议他们考虑使用 `skill-creator`，以便编写目前尚不存在的技能。
- **所有相关技能都已安装** — 无需创建 bundle；仅使用用户已安装的技能提供分步计划，并跳过导出。
- **用户拒绝该计划** — 不要写入文件。根据用户反馈进行调整并重新确认，或干净地停止。
- **不同仓库中存在同名技能** — 保留一个；选择描述匹配度更高的技能，并说明这一选择。