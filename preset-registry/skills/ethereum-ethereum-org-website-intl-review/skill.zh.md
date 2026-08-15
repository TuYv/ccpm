---
name: intl-review
description: Use when reviewing translation imports/PRs (especially against `intl/pending-*` branches), evaluating translation quality across any of the 24 target languages, triaging issues in `.claude/translation-review/`, scoring a locale's translation, running the `/review-translations` slash command, debugging brand-name mistranslations or glossary deviations, or working with the per-language findings tracking files. Covers the scoring rubric, ETHGlossary-as-authority policy, language-group rules, agent-role split (structural / terminology / semantic), the concept-tag-vs-brand-tag distinction in frontmatter, and the critical-vs-warning severity policy.
---
# intl-review

针对 ethereum.org 的 24 种语言流水线输出进行翻译质量审查。审查对象包括 `intl/pending-{base}` 分支上由 LLM（Gemini）生成的翻译，以及所有仍在处理中的历史 Crowdin 导入内容。ETHGlossary（https://ethglossary.visual-20-hoists.workers.dev）是术语的权威来源——任何偏差都是**严重问题**，而不是警告。激活时请完整阅读此文件；仅当列出的触发条件适用时，才从 `references/` 中读取内容。

## 核心规则：ETHGlossary 是权威来源

在评估翻译后的品牌名称、人名、编程语言、操作系统名称或任何以太坊生态系统术语时，**该语言中对应术语的 ETHGlossary 条目就是标准答案**。任何偏差都是必须标记的**严重**问题（并且在不带 `--no-fix` 运行 `/review-translations` 时自动修复）。

这不是风格偏好，而是确定性保证。翻译流水线会查询 ETHGlossary；审查人员负责验证输出是否匹配。如果你认为词汇表有误，正确的做法是更新 ETHGlossary（https://github.com/wackerow/ethglossary），而不是保留现有翻译。

使用 `/filter` 端点获取实际出现在给定英文源文件中的词汇表术语子集。不要凭记忆判断品牌名称；请查询词汇表。

## 首要规则

1. **词汇表偏差是严重问题，而不是警告。** 只要翻译后的术语与该语言的 ETHGlossary 条目不同，就是严重问题。审查报告必须列出这些问题，以便第 5 阶段能够自动修复。
2. **内部 href 必须保持英文。** 西班牙语内容中的 `/governance` 必须仍为 `/governance`，而不能变成 `/gobernanza`。翻译 URL 会导致导航失效。锚点 ID（`#section-id`）同样如此。
3. **概念标签需要翻译；品牌名称标签不翻译。** 教程 frontmatter 中的 `tags:` 数组包含混合类型。品牌名称（`"solidity"`、`"hardhat"`、`"alchemy"`）保持英文。概念/类别标签（`"smart contracts"`、`"testing"`、`"security"`）由流水线有意翻译，绝不能还原为英文。
4. **代码块：功能性代码保持英文；注释可以翻译。** 标识符、字符串、配置键、控制台输出——保持英文。代码注释（`//`、`/* */`、`#`）可以翻译，以帮助读者理解。
5. **品牌名称策略因语言和术语而异。** 某些品牌在中日韩语言中保持拉丁字母形式（根据 ETHGlossary 的 `script_rule: always_latin`，Solidity、Hardhat 保持拉丁字母形式）；有些进行音译（根据 `transliterate`，Ethereum → イーサリアム）；有些在 `zh`/`zh-tw` 中有本地意译。请使用词汇表；不要通过模式匹配来判断。
6. **MDX 语法错误是严重问题（会导致构建失败）。** 数字前出现原始 `<`、未闭合的反引号、孤立的闭合标签、JSX 属性中嵌入未转义的引号——其中任何一种都会导致对应语言区域的构建失败。请标记并修复。
7. **报告零个严重问题是有效结果。** 不要为了“展示工作成果”而凭空捏造问题。如果经过全面审查后未发现严重问题，请报告 `0 critical, N warnings`（或 `0/0`），这是有效结果。
8. **自动修复默认启用，而非默认禁用。** `/review-translations` 默认应用修复。使用 `--no-fix` 执行仅审查运行（适用于 GitHub Actions 环境或没有提交权限的情况）。审查报告仍会列出原本会修复的内容。
9. **所有审查更改都必须提交到正在审查的 `intl/pending-*` 分支——绝不能提交到 `dev`。** 针对某次审查的翻译修复和知识库更新（`known-patterns.md`、`per-language/{lang}.md`）都应提交到该审查对应的 `intl/pending-{base}` 分支，以便随 PR 一同提交到 GitHub。请参阅下一节。

## 审查更改存放在哪里

翻译修正和知识库更新（`per-language/{lang}.md`、`known-patterns.md`）都应提交到正在审查的 `intl/pending-{base}` 分支（即 `/review-translations` 工作树），以便它们随 PR 一起合并。绝不要把审查产物留在 `dev` 上；如果发现自己正在 `dev` 检出目录中编辑 `.claude/translation-review/`，请将这些更改移到审查分支，并还原 `dev`。顺序：提交 → 推送 → 提交审查（如果修正已推送且不再有严重问题，则使用 `--approve`，否则使用 `--comment`）。

## 最值得注意的陷阱

以下是一些容易踩坑的地方，看似显而易见的处理方式实际上是错误的。完整列表位于 `references/gotchas.md`。

### Frontmatter `tags` 数组混合了两种策略

教程 Markdown 文件的 YAML frontmatter 中包含 `tags:`。其中混合了：

- **品牌名称标签**（`"solidity"`、`"hardhat"`、`"alchemy"`、`"JavaScript"`、`"ERC-721"`）——必须保留英文。清理程序会自动修正这些标签；仅在未修正时标记。
- **概念/类别标签**（`"smart contracts"`、`"testing"`、`"security"`、`"deploying"`、`"frontend"`、`"nodes"`）——有意翻译成目标语言。像 `"smart kontrakt účty"`（捷克语）或 `"bezpečnost"`（捷克语中的“安全”）这样的译法是**正确的**。

规则：专有名词/产品名称 → 英文。通用描述性术语 → 翻译形式才是正确的。

### 共识术语的语义颠倒

现实中高频出现的一种故障模式：Gemini 偶尔会混淆权益证明和工作量证明，或将“mainnet”误译为“market”或“main network”。这些属于严重的语义错误，而不是警告。审查时应抽查共识、主网、测试网、验证者、矿工和客户端等术语。

### 跨文字系统污染

旧版 Crowdin 导入有时会导致一种文字系统中的字符混入另一种文字系统（例如土耳其语中出现天城文，阿拉伯语中出现中日韩字符）。这种情况在新流水线中较少见，但仍有可能发生。标记所有意外出现的其他文字系统字符；它们表明翻译记忆库发生了内容泄漏。

### JSON 中的 Lorem ipsum / 占位文本

真实的翻译值有时会包含“Lorem ipsum dolor sit amet”或类似的占位文本。应将其视为用户可见的严重问题。

### 被翻译的 GitHub `@username` 用户名

`@axic` 被翻译成 `@kwaaxic`（斯瓦希里语）或类似形式——这会破坏署名。应予以标记。

### 不对称的反引号和孤立的 HTML 标签

单个反引号开始、两个反引号结束（`` `text`` ``）、在 `</li>` 前缺少 `</em>`、没有起始标签的原始 `</a>`——这些都会导致 MDX 编译失败。属于严重问题。

### `/review-translations` 要求使用命名分支，绝不能处于 detached HEAD 状态

该斜杠命令的工作树设置会强制执行这一要求；如果你编写脚本绕过它，构建验证步骤仍依赖于已检出命名分支。

### Claude Code 沙箱中的 `gh` CLI

由于沙箱使用 TLS 代理，`gh` 需要设置 `dangerouslyDisableSandbox: true`。Git 命令在沙箱中可正常运行（SSH）。执行文件系统操作繁重的 `pnpm install` / `pnpm build` 时，也可能需要禁用沙箱。

## “该去哪里找？”快速速查表

| 我需要……                               | 路径                                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 斜杠命令（完整流水线）                 | `/review-translations`（`.claude/commands/review-translations.md`）                                                |
| 问题模式目录                           | `.claude/translation-review/known-patterns.md` + `references/known-patterns.md`                                    |
| 各语言规则                             | `references/language-rules.md`（来源为 `.claude/translation-review/localization-rules-by-language-group.md`）      |
| 评分标准                               | `references/scoring-rubric.md`                                                                                     |
| 各语言发现的问题                       | `.claude/translation-review/per-language/{lang}.md`                                                                |
| ETHGlossary 术语（按源文本筛选）       | `POST /api/v1/filter`                                                                                              |
| ETHGlossary 术语（各语言完整列表）      | `GET /api/v1/translations/{lang}`                                                                                  |
| ETHGlossary 策略                       | https://github.com/wackerow/ethglossary/blob/main/docs/translation-policy.md                                       |
| 清理程序源代码                         | `src/scripts/intl-pipeline/intl-sanitizer.ts`                                                                      |
| 清理程序测试研究                       | `docs/solutions/integration-issues/sanitizer-test-research.md`                                                     |
| 过往审查复盘                           | `docs/solutions/integration-issues/` + `docs/solutions/logic-errors/`                                              |
| 语言配置                               | `i18n.config.json`                                                                                                 |

## 何时加载各项参考资料

仅在满足触发条件时引入这些资料。

- **`references/known-patterns.md`** — 开始任何审查时加载。这里汇总了反复出现的问题模式（品牌名称误译、MDX 语法错误、语义反转、跨文字体系污染等）。
- **`references/language-rules.md`** — 处理特定的非拉丁文字语言（ar、bn、hi、ja、ko、mr、ru、ta、te、uk、ur、zh、zh-tw）时加载。包含各语言组针对正文、UI 标签、数字、代码、人名的规则。
- **`references/scoring-rubric.md`** — 为 PR 评分或生成质量报告时加载。包含具有权重的 5 类评分标准（品牌名称保留、技术准确性、语义忠实度、术语一致性、语气/语域）。
- **`references/ethglossary-usage.md`** — 将 ETHGlossary 查询集成到审查流程中时加载（使用哪个端点、何时使用 `/filter` 而不是 `/translations/{lang}`、如何处理缺失术语，以及 `script_rule` 和 `term_role` 对审查人员的含义）。
- **`references/per-language-tracking.md`** — 写入或读取 `.claude/translation-review/per-language/{lang}.md` 时加载。用于跨多次审查累积发现结果的约定。
- **`references/gotchas.md`** — 当感觉有问题但无法在当前内容中找到原因时加载。这里收录了各种较少见的混淆模式。
- **`references/critical-vs-warning.md`** — 判断应将问题标记为严重问题（自动修复）还是警告（人工审查）时加载。包含严重程度评定标准。
- **`references/agent-roles.md`** — 规划多智能体审查（结构 / 术语 / 语义）时加载。包含角色划分及各角色的关注重点。

## 其他可能适用的项目技能

- **`intl-pipeline`** — 用于流水线相关工作：翻译的生成方式、清单不变量、清理器行为以及 `intl/pending-{base}` 模型。当审查发现的是流水线层面的问题（而非翻译层面的问题）时，请使用此技能。
- **`design-system`** — 当翻译问题与渲染有关时使用（双向文本翻转、RTL 间距、较长的非英文字符串导致布局溢出）。

## 合并前冒烟测试

提交翻译质量审查之前：

- [ ] 每种语言至少有一个文件调用了 ETHGlossary `/filter` 端点（不要凭记忆审查）
- [ ] 已列出所有严重问题（偏离术语表、MDX 语法错误、品牌名称误译、href 被翻译、语义反转）
- [ ] 已遵循 Frontmatter `tags` 的区别（品牌标签使用英文，概念标签进行翻译）
- [ ] 已应用代码块策略（功能性代码使用英文，注释可以翻译）
- [ ] 已按照 5 类评分标准生成各语言的质量评分
- [ ] 已更新各语言的发现结果文件 `.claude/translation-review/per-language/{lang}.md`
- [ ] 如果发现了新的问题模式，已将其添加到 `references/known-patterns.md`（或知识库中的 `known-patterns.md`）
- [ ] 所有审查变更（修复 + 知识库更新）均已提交到正在审查的 `intl/pending-*` 分支并推送——绝不能遗留在 `dev` 上
- [ ] 如果审查涉及 MDX 语法相关问题，已运行构建验证（`--build-local` 或 `--netlify-check`）