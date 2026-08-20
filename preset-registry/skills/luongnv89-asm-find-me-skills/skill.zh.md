---
name: find-me-skills
description: "Find Agent Skills for a goal the user cannot name yet, then export an installable bundle. Use when they ask which skills fit a project. Don't use for installing named skills, authoring skills, or catalog maintenance."
license: MIT
compatibility: "Claude Code with the `asm` CLI on PATH"
effort: medium
metadata:
  version: 1.2.0
  author: Luong NGUYEN <luongnv89@gmail.com>
---
# 帮我找技能

帮助那些**有目标但没有技能清单**的用户找到合适的 Agent Skills，解释每项技能的作用，规划它们的运行顺序，并且——如果用户批准——向其提供一个可直接安装的单一捆绑包文件。

这类用户的典型特征是，他们**不知道该提出什么要求**。如果某人已经知道自己想要 `frontend-design`，那么直接运行 `asm install …` 即可。这项技能适用于这样的场景：“我正在开发一款应用，希望从零开始做营销，但我不懂营销，也不知道有哪些技能可用。”从用户当前的认知出发：引导他们说出目标，确认你已正确理解，然后将其需求映射到实时目录中真实、可安装的技能。

## 工作循环

1. **收集意图** — 通过对话引导用户说出他们想要实现的目标。
2. **确认理解** — 复述你对其情况的理解；在搜索之前，让用户有机会纠正。
3. **发现** — 查询实时 `asm` 目录以寻找候选技能（绝不猜测技能名称）。
4. **筛选整理** — 去重、按步骤分组，并用一句通俗的话解释每项技能。
5. **确定顺序** — 给出分步执行路径，并说明每一步的输入和输出。
6. **导出** — 获得批准后，写入捆绑包文件，并提供单行安装命令。

判断用户当前所处的阶段，并从那里开始。如果用户一开始就给出了详尽的目标（“我的 SaaS 需要 SEO、落地页和发布文案”），你可以快速确认，然后进入发现阶段。如果用户的描述很模糊（“帮我推广应用”），则应在第 1–2 步投入更多时间。不要跳过第 2 步——搜索前确认理解，既是确保推荐结果相关的关键，也是明确要求。

## 前置条件（开始时检查一次）

这项技能使用 `asm` CLI 进行发现，并生成可由其安装的文件。在承诺提供推荐之前，先验证 `asm` 是否可用：

```bash
command -v asm || echo "MISSING"
```

如果缺少 `asm`，请告知用户，这项技能要求安装 Agent Skill Manager CLI 并将其加入 PATH；引导他们使用 `npm install -g agent-skill-manager`（或项目文档中说明的安装方式），然后停止。后续所有操作都依赖它。

## 第 1 步 — 收集意图

每次提出一两个开放式问题，直到你能用一句话陈述用户的目标。可以使用以下提问：

- 你目前正在构建什么，或者正在做什么？
- 你希望得到什么结果——发布一个产品、完成一份书面材料，还是打造更高效的工作流？
- 哪一部分让你觉得最困难或最陌生？（技能通常最能在这里提供帮助。）
- 这是一次性任务，还是你会重复执行的任务？

使用与用户相匹配的词汇。一个对营销并不熟悉却提出“营销”需求的用户，实际上可能需要的是定位、落地页和发布文案——应将这些作为选项提出，而不是自行假设。除非用户先使用专业术语（如“ICP”“ASO”），否则应避免使用。

## 第 2 步 — 确认理解（不要跳过）

搜索之前，复述你所听到的信息，并获得明确确认：

> 以下是我的理解：你正在构建 **{project}**，并且希望
> **{goal}**。你不确定的部分是 **{gaps}**。我的理解正确吗？

如果他们纠正了你，请将修正纳入其中并再次确认。只有在他们同意后才能继续。
此步骤是本技能的验收标准之一——确认具体情况能够避免生成一个看似自信却实际错误的技能列表。

## 步骤 3 — 从实时目录中发现候选项

**绝不要编造技能名称或安装 URL。** 目录会不断变化；运行时唯一可信的来源是用户机器上的 `asm` CLI。
根据已确认的目标提炼 2–5 个搜索词，并分别查询：

```bash
asm search "<term>" --available --json
```

每个搜索词都要单独搜索——宽泛的词语（"marketing"、"seo"、"landing page"、"launch"）会找到不同的技能。当你需要了解 JSON 结构、已安装与可用技能的判断规则或空结果处理方式时，请阅读 `references/catalog-discovery.md`；在步骤 3 真正需要这些细节之前，不要让它们占用主要上下文预算。

阅读每个候选项的 `description` 以判断相关性；描述中自带的 "Use when…" / "Don't use for…" 文本会说明它是否适合用户的目标。还要运行不带 `--available` 的 `asm search "<term>" --json` 来检测已安装的技能：在计划中提及匹配的已安装技能，但将它们排除在技能包之外。只有具备 `installCommand` 的 `available` 技能才能纳入其中。

## 步骤 4 — 筛选：去重并说明理由

从搜索结果的并集中构建推荐集合：

- **按技能 `name` 去重。** 同一技能可能出现在多个搜索词的结果中，有时也可能来自多个仓库。每个名称只保留一个条目。如果两个仓库提供了同名技能，优先选择描述与目标最匹配的那个（如果选择并不显而易见，请注明理由）。
- **移除匹配度较低的技能。** 只保留那些你能用一句话说明其与用户目标关联的技能。
- **用通俗语言解释每个技能**——用一句话说明它能为*这位用户*做什么，而不是改述它的描述。"`landing-page-copywriter` 为你的发布页面撰写文案，让访客了解产品并注册。"

## 步骤 5 — 编排为分步执行路径

按照用户实际应运行这些技能的顺序排列筛选后的技能，并为每个步骤说明其**输入**（用户或上一步提供的内容）和**输出**（完成后将获得的内容）。基础性或上下文类技能通常排在前面；审查或质量保证类技能通常排在最后。示例格式：

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

在导出任何内容之前，先向用户展示此计划。让用户可以轻松提出 "drop step 3" 或 "add something for email" 之类的调整要求——完成调整后再次确认。

## 步骤 6 — 导出可安装的技能包（获得批准后）

只有在用户批准计划后，才能生成采用 `asm` 的 `BundleManifest` 格式的**技能包文件**，并向他们提供单行安装命令。使用根据目标命名的文件，例如 `marketing-starter.bundle.json`。

有关必需的 JSON 模板、验证规则，以及此技能为何使用 `asm bundle install` 而不是 `asm install` 或 `asm import`，请参阅 `references/bundle-format.md`。逐字复制第 3 步中的每个 `installUrl`；切勿手动构造，也切勿包含已安装的技能。

然后进行验证并交付：

```bash
# Sanity-check the file parses as a bundle before telling the user to install:
asm bundle show ./marketing-starter.bundle.json
```

如果 `asm bundle show` 正确显示了该捆绑包，请向用户提供最终命令：

```bash
asm bundle install ./marketing-starter.bundle.json
```

告诉他们该命令的作用：它会从各自的来源安装所有推荐的技能，并显示确认提示（添加 `-y` 可跳过该提示）。之后，他们可以按顺序重新运行计划中的步骤。如果 `asm bundle show` 报错，请修复有问题的字段（错误信息会指出该字段），并在交付前重新检查。

## 验收标准

在宣布本次运行完成前，请验证以下所有事项：

- 用户在进行任何目录搜索之前已明确确认目标。
- 对每个选定的搜索词，至少运行了一次 `asm search "<term>" --available --json` 查询。
- 已使用 `asm search "<term>" --json` 检查已安装的技能，并将其排除在捆绑包之外。
- 用户在写入任何文件之前已批准按顺序排列的计划。
- 预期输出均存在：编号计划、捆绑包文件路径和安装命令。
- `asm bundle show ./<file>.bundle.json` 成功执行；否则，本次运行会报告验证错误，而不是交付一个无法正常工作的命令。

## 输出格式

每次成功运行都应以以下三项内容结束，并清晰分隔：

1. **计划** — 编号步骤，每一步都包含技能、单行用途说明，以及输入/输出。
2. **捆绑包文件** — 已写入磁盘，并显示路径。
3. **安装命令** — `asm bundle install ./<file>` 单独占一行。

解释应保持通俗易懂。用户来到这里，正是因为他们*不了解*这一领域——请确保他们最终明白自己将要安装什么以及为什么要安装。

## 边界情况

- **未安装 `asm`** — 在先决条件检查处停止；引导他们查看安装文档。
- **模糊且无法进一步明确的目标** — 停留在第 1–2 步；提供 2–3 个具体方向（“你指的是 A、B 还是 C？”），而不是凭猜测进行搜索。
- **目录中没有与部分目标匹配的内容** — 如实说明；仅推荐真正符合要求的内容，如果他们可能需要自行创建尚不存在的内容，则建议使用 `skill-creator`。
- **所有相关技能均已安装** — 没有内容需要打包；只需使用他们已安装的技能提供分步计划，并跳过导出。
- **用户拒绝计划** — 不要写入文件。根据他们的反馈进行调整并重新确认，或妥善停止。
- **不同仓库中存在同名技能** — 只保留一个；选择描述更匹配的技能，并说明这一选择。