---
name: intl-review
description: Use when reviewing translation imports/PRs (especially against `intl/pending-*` branches), evaluating translation quality across any of the 24 target languages, triaging issues in `.claude/translation-review/`, scoring a locale's translation, running the `/review-translations` slash command, debugging brand-name mistranslations or glossary deviations, or working with the per-language findings tracking files. Covers the scoring rubric, ETHGlossary-as-authority policy, language-group rules, agent-role split (structural / terminology / semantic), the concept-tag-vs-brand-tag distinction in frontmatter, and the critical-vs-warning severity policy.
---
# intl-review

对 ethereum.org 的 24 种语言流水线输出进行翻译质量审查。审查对象包括 `intl/pending-{base}` 分支上由 LLM（Gemini）生成的翻译，以及仍在处理中的历史 Crowdin 导入内容。ETHGlossary（https://ethglossary.visual-20-hoists.workers.dev）是术语的权威来源——任何偏离都属于**严重问题**，而不是警告。激活时请完整阅读此文件；仅当列出的触发条件适用时，才从 `references/` 中读取内容。

## 核心规则：ETHGlossary 具有权威性

评估翻译后的品牌名称、人名、编程语言、操作系统名称或任何 Ethereum 生态系统术语时，**该术语在对应语言中的 ETHGlossary 条目就是唯一标准**。任何偏离都属于**严重**问题，必须标记（运行不带 `--no-fix` 的 `/review-translations` 时还必须自动修复）。

这不是风格偏好，而是确定性保证。翻译流水线会查询 ETHGlossary；审查者需要验证输出是否匹配。如果你认为术语表有误，应该修复 ETHGlossary（https://github.com/wackerow/ethglossary），而不是让翻译保持原样。

使用 `/filter` 端点获取实际出现在指定英文源文件中的术语表子集。不要凭记忆判断品牌名称；请查阅术语表。

## 顶层规则

1. **术语表偏离属于严重问题，而不是警告。** 任何时候，只要翻译后的术语与该语言的 ETHGlossary 条目不同，就属于严重问题。审查报告必须列出这些问题，以便 Phase 5 自动修复。
2. **内部 href 必须保持英文。** 西班牙语内容中的 `/governance` 必须仍为 `/governance`，不能改为 `/gobernanza`。翻译后的 URL 会破坏导航。锚点 ID（`#section-id`）同样如此。
3. **概念标签需要翻译；品牌名称标签不需要翻译。** 教程 frontmatter 中的 `tags:` 数组包含这两类标签。品牌名称（`"solidity"`、`"hardhat"`、`"alchemy"`）保持英文。概念/类别标签（`"smart contracts"`、`"testing"`、`"security"`）由流水线有意翻译，不得改回英文。
4. **代码块：可执行代码保持英文；注释可以翻译。** 标识符、字符串、配置键、控制台输出等保持英文。代码注释（`//`、`/* */`、`#`）可以翻译，以帮助读者理解。
5. **品牌名称策略按语言和术语分别确定。** 某些品牌在 CJK 语言中保持拉丁字母形式（根据 ETHGlossary 的 `script_rule: always_latin`，Solidity、Hardhat 就是如此）；某些品牌进行音译（根据 `transliterate`，Ethereum → イーサリアム）；某些品牌在 `zh`/`zh-tw` 中有本地化直译名称。请使用术语表，不要根据模式自行判断。
6. **MDX 语法错误属于严重问题（会导致构建失败）。** 数字前的原始 `<`、未闭合的反引号、孤立的结束标签、包含未转义引号的 JSX 属性等，都会导致该语言环境的构建失败。请标记并修复。
7. **报告零个严重问题是有效结果。** 不要为了“展示工作成果”而臆造问题。如果经过彻底审查后没有发现严重问题，请报告 `0 critical, N warnings`（或 `0/0`）；这完全是有效结果。
8. **自动修复默认启用，而非默认禁用。** `/review-translations` 默认应用修复。在仅审查的运行场景（GitHub Actions 上没有提交授权）中，请使用 `--no-fix`。审查报告仍需列出本应修复的内容。
9. **所有审查修改都必须提交到正在审查的 `intl/pending-*` 分支——绝不能提交到 `dev`。** 翻译修复和知识库更新（`known-patterns.md`、`per-language/{lang}.md`）都必须提交到该审查自身的 `intl/pending-{base}` 分支（`/review-translations` 的 worktree），以便随 PR 一同提交。如果发现自己正在 `dev` checkout 中编辑 `.claude/translation-review/`，请将修改移到审查分支，并恢复 `dev`。流程顺序：提交 → 推送 → 提交审查（修复已推送且不再存在严重问题后使用 `--approve`，否则使用 `--comment`）。

## 价值最高的易错点

这些是一些看似合理、实际上却错误的调用，属于容易踩中的陷阱。完整列表见 `references/gotchas.md`。

### Frontmatter 中的 `tags` 数组混用两种策略

教程的 Frontmatter `tags:` 会混合使用品牌名称标签（保持英文）和概念/类别标签（应有意翻译——不要改回英文）。经验法则：专有名词/产品名称 → 使用英文；通用描述性术语 → 使用翻译后的形式才是正确的。详情和示例见：`references/known-patterns.md`。

### 共识术语的语义颠倒

这是现实中高频出现的失败模式：Gemini 偶尔会混淆权益证明和工作量证明，或将“mainnet”误译为“市场”或“主网络”。这些属于严重的语义错误，而不是警告。审核时应抽查 consensus、mainnet、testnet、validator、miner、client。

### 跨文字系统污染

旧版 Crowdin 导入有时会出现一种文字系统中的字符泄漏到另一种文字系统中的情况（土耳其语中出现天城文字符、阿拉伯语中出现中日韩字符）。新流水线中这种情况较少见，但仍有可能发生。标记任何意外出现的文字系统字符；这表明翻译记忆发生了泄漏。

### JSON 中的 Lorem ipsum / 占位文本

实际的翻译值有时会包含“Lorem ipsum dolor sit amet”或类似的占位文本。将其视为严重的用户可见问题。

### 被翻译的 GitHub `@username` 用户名

例如 `@axic` 被翻译成斯瓦希里语中的 `@kwaaxic` 或类似形式——这会破坏署名。应标记此问题。

### 不对称的反引号和孤立的 HTML 标签

单个开头/两个结尾的反引号（`` `text`` ``）、在`</li>`之前缺少`</em>`、没有开头标签却出现原始的`</a>`——这些都会导致 MDX 编译失败。属于严重问题。

## 快速“我该去哪里找？”速查表

| 我需要……                              | 路径                                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Slash 命令（完整流水线）          | `/review-translations`（`.claude/commands/review-translations.md`）                                                 |
| 问题模式目录                  | `.claude/translation-review/known-patterns.md` + `references/known-patterns.md`                                    |
| 各语言规则                     | `references/language-rules.md`（来源于`.claude/translation-review/localization-rules-by-language-group.md`） |
| 评分标准                         | `references/scoring-rubric.md`                                                                                     |
| 各语言的发现                  | `.claude/translation-review/per-language/{lang}.md`                                                                |
| ETHGlossary 术语（筛选至源文本） | `POST /api/v1/filter`                                                                                              |
| ETHGlossary 术语（各语言完整列表）  | `GET /api/v1/translations/{lang}`                                                                                  |
| ETHGlossary 政策                     | https://github.com/wackerow/ethglossary/blob/main/docs/translation-policy.md                                       |
| 清理器源代码                       | `src/scripts/intl-pipeline/intl-sanitizer.ts`                                                                      |
| 清理器测试研究                | `docs/solutions/integration-issues/sanitizer-test-research.md`                                                     |
| 过往评审复盘               | `docs/solutions/integration-issues/` + `docs/solutions/logic-errors/`                                              |
| 语言配置                        | `i18n.config.json`                                                                                                 |

## 何时加载各个参考资料

仅在触发条件满足时加载这些资料。

- **`references/known-patterns.md`** — 开始任何审查时加载。包含常见问题模式目录（品牌误译、MDX 语法错误、语义颠倒、跨文字系统污染等）。
- **`references/language-rules.md`** — 针对特定非拉丁文字语言（ar、bn、hi、ja、ko、mr、ru、ta、te、uk、ur、zh、zh-tw）开展工作时加载。包含针对各语言组的正文、UI 标签、数字、代码和人名规则。
- **`references/scoring-rubric.md`** — 对 PR 评分或生成质量报告时加载。包含 5 个类别的评分标准（品牌名称保留、技术准确性、语义保真度、术语一致性、语气/文体）及其权重。
- **`references/ethglossary-usage.md`** — 将 ETHGlossary 查询集成到审查中时加载（应使用哪个端点、何时使用 `/filter` 与 `/translations/{lang}`、如何处理缺失术语，以及 `script_rule` 和 `term_role` 对审查者的含义）。
- **`references/per-language-tracking.md`** — 读写 `.claude/translation-review/per-language/{lang}.md` 时加载。包含跨审查累计问题的约定。
- **`references/gotchas.md`** — 当感觉某处不对但无法在正文中找到答案时加载。包含各种容易混淆的长尾模式。
- **`references/critical-vs-warning.md`** — 决定将问题标记为 critical（自动修复）还是 warning（人工审查）时加载。包含严重性判定标准。
- **`references/agent-roles.md`** — 规划多智能体审查（结构 / 术语 / 语义）时加载。包含角色划分及各角色的关注重点。

## 其他可能适用的项目技能

- **`intl-pipeline`** — 用于流水线相关事项：翻译生成方式、清单不变量、清理器行为、`intl/pending-{base}` 模型。当审查发现流水线层面的问题（而非翻译层面的问题）时，使用此技能。
- **`design-system`** — 当翻译问题与渲染相关时使用（BiDi 翻转、RTL 间距、较长的非英语字符串导致布局溢出）。

## 合并前冒烟测试

提交翻译质量审查之前：

- [ ] 已对每种语言至少有一个文件调用 ETHGlossary `/filter` 端点（不要凭记忆进行审查）
- [ ] 已列出所有 critical 问题（术语表偏差、MDX 语法错误、品牌误译、翻译后的 href、语义颠倒）
- [ ] 遵守 frontmatter `tags` 的区分规则（品牌标签使用英文，概念标签进行翻译）
- [ ] 已应用代码块策略（功能代码使用英文，注释可以翻译）
- [ ] 已按照 5 类评分标准生成每种语言的质量评分
- [ ] 已更新每种语言的问题文件 `.claude/translation-review/per-language/{lang}.md`
- [ ] 如果出现新的问题模式，已将其添加到 `references/known-patterns.md`（或知识库中的 `known-patterns.md`）
- [ ] 所有审查变更（修复及知识库更新）均已提交到正在审查的 `intl/pending-*` 分支并推送——绝不能留在 `dev` 上
- [ ] 如果审查涉及 MDX 语法相关问题，已运行构建验证（`--build-local` 或 `--netlify-check`）