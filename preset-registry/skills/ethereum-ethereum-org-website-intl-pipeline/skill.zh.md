---
name: intl-pipeline
description: Use when working on the translation pipeline (`src/scripts/intl-pipeline/`), the post-import sanitizer (`intl-sanitizer.ts`), the `intl/pending-*` branches, the `intl-pipeline.yml` GitHub Actions workflow, ETHGlossary integration, or any translation-related issue (broken translations, missing locales, manifest drift, sanitizer false positives, ETHGlossary term lookups, language-group transliteration questions). Provides the manifest-driven incremental pipeline mental model, the "don't hand-propagate" rule, recovery procedures, the ETHGlossary-as-canonical-source policy, and the `intl/pending-{base}` orchestration contract.
---
# intl-pipeline

基于 LLM、由清单驱动的增量翻译流水线，用于 ethereum.org。它通过 Gemini 将英文内容（`public/content/` 中的 markdown、`src/intl/en/` 中的 JSON UI 字符串）翻译成 24 种目标语言——可直接调用 Gemini，也可通过 OpenRouter（`LLM_PROVIDER`）调用；其密钥带有服务端支出限额——并在导入后运行清理器，以规范化常见产物。**该工作流仅支持手动触发**；此前的每日 cron 在第 31149083965 次运行时无人值守地计费 $1,108，因此已被移除。ETHGlossary（https://ethglossary.visual-20-hoists.workers.dev）是流水线所使用的所有 Ethereum 生态术语翻译的权威来源。激活时完整阅读此文件；仅在列出的触发条件适用时，才从 `references/` 中读取内容。

## 核心规则：不要手动传播英文变更

保持翻译正确性最具杠杆作用的习惯是：**永远不要手动编辑译文内容来反映英文变更。** 流水线通过清单跟踪状态（每个文件+区域设置对应的 `.manifests/{destPath}/source.json` + `translation.json`）；在英文变更后进行手动编辑会使清单与实际情况不同步，下一次流水线运行时要么重新翻译并覆盖你的编辑，要么产生合并冲突。

这条规则并不是“永远不要编辑区域设置”。它的含义是“不要手动传播英文更新”：

- **允许：** 在英文一侧没有变更时修复翻译错误（审查时修正、清理器后续修正）。清单中的英文到区域设置映射仍然有效。
- **不允许：** 编辑某个区域设置以反映新的英文值（URL 变更、属性变更、段落重构）。清单映射会变得错误。
- **如果英文到区域设置的同步确实紧急**（会导致构建失败的结构性变更，且没有待处理的 PR）：先进行英文编辑，然后使用 `stamp_only: true` 触发 `intl-pipeline.yml`，在不进行翻译的情况下刷新清单。只有在不存在针对该基础分支的 `intl/pending-{base}` 分支时才安全。

**删除也必须通过英文完成。** 流水线只传播规范英文中发生的_变更_；它不会扫描未使用或孤立的字符串，也没有任何机制会自动移除孤立的英文字符串——它只会将英文传播到其他区域设置。要移除字符串——包括代码已不再引用的键（孤立键）——请从英文源（`src/intl/en/` 或英文内容）中删除它；流水线会在下一次运行时将该删除传播到各区域设置。**不要**手动删除区域设置副本，那属于手动传播，应由流水线处理。因此，字符串变成孤立字符串就是一个需要清理的信号：仅从英文中删除它，仅修改英文。

## 顶层规则

1. **ETHGlossary 是术语翻译的规范来源。** 品牌名称、人名、编程语言、OS/平台名称、概念术语——全部存放在 ETHGlossary 中。不要维护并行术语库。流水线通过 `GLOSSARY_API_URL` 查询 API（默认值位于 `src/scripts/intl-pipeline/config.ts`）。
2. **每个基础分支一次只能有一个翻译 PR。** 流水线会提交到 `intl/pending-{base}`（例如 `intl/pending-dev`）。后续运行会先将 `{base}` 合并到 pending，然后翻译差异部分。针对同一基础分支的并行翻译 PR 会发生冲突。
3. **流水线在生产环境中只针对 `dev`。** 对 `staging` / `master` 的热修复仅以英文发布，并通过 prepare-release 追赶进度。除非有特定原因并使用自定义的 `target_branch`，否则不要针对 `staging` / `master` 进行翻译。
4. **清单与其区域设置文件不可分离。** 每个翻译文件都有两个清单，集中存放在 `.manifests/{destPath}/` 下：`source.json` 和 `translation.json`。删除其中一个，就必须同时重新生成两个——最简单的方式是对该文件+区域设置通过流水线以 `full` 模式运行。绝不要手动编辑清单。
5. **清理器在翻译后运行，而不是翻译前运行。** 它的职责是修复 Gemini 引入的产物（BiDi 错误、代码围栏偏移、品牌名称误译）。它接收翻译输出，而不是英文源。
6. **不要在此处添加音译数据。** 所有术语/品牌/人名的音译策略都位于 ETHGlossary 的 `docs/translation-policy.md` 和各语言条目中。intl-pipeline 只消费这些内容，不负责编写。
7. **清理器修复必须先按代码块拆分。** `intl-sanitizer.ts` 中的每个文本转换都**必须**从代码块拆分模式开始。在修改代码围栏内容时，会破坏教程中的 Solidity / Python / TypeScript 示例。
8. **流水线失败不一定是流水线的 bug。** “翻译看起来不对”的报告可能是：Gemini 输出不佳（上游文件的问题）、缺少 ETHGlossary 术语（应在那里添加）、符合语言组策略的正确结果（阅读 `translation-policy.md`），或确实是流水线 bug。请先进行分类排查，再修复。

## 最高价值的易错点

这些都是看似显而易见但实际操作错误的陷阱。完整列表见 `references/gotchas.md`；以下情况最常见。

### 命名沿革

该流水线过去称为 "Gemini translation pipeline" 和 "i18n pipeline"。旧文档和外部引用中可能仍会使用这些名称。当前的规范名称如下：

- 模块路径：`src/scripts/intl-pipeline/`（原为 `src/scripts/i18n/`）
- 工作流文件：`.github/workflows/intl-pipeline.yml`（原为 `gemini-translations.yml`）
- 流水线入口：`src/scripts/intl-pipeline/main.ts`（原为 `main-incremental.ts` / `main-gemini.ts`）
- 正文中的模块名称：`intl-pipeline`。新内容中避免使用 `i18n-pipeline` 和 `gemini-translations`。

如果在文档或注释中看到旧名称，请将其更新。

### Manifest 集中存放在 `.manifests/` 下，而不是与 locale 文件放在一起

对于 `public/content/translations/ja/some-page/index.md`，对应的 manifest 为：

- `.manifests/public/content/translations/ja/some-page/index.md/source.json`
- `.manifests/public/content/translations/ja/some-page/index.md/translation.json`

JSON locale 文件也遵循相同模式（`.manifests/src/intl/ja/common.json/source.json`）。路径构造由 `main.ts` 中的 `getManifestPath()` 完成，其根目录为 `MANIFESTS_DIR`。重命名内容文件意味着要为每个 locale 移动其 manifest 目录。覆盖范围并不完整：缺少 manifest 时，该文件和 locale 会进入完整翻译流程，而不是失败。

### 费用上限针对输入侧，判断依据是每次调用的输入 token 数

流水线在本地组装 prompts，因此在第一次请求前就能知道一次运行的成本；所有上限都利用了这一点（`references/runbooks/cost-guard-tripped.md`、`tests/specs/CONCURRENCY-SPEC.md` Part 4）。判断一次运行是否正常时，**不要**查看输入:输出比例——对于增量翻译而言，较高的输入:输出比例是固有现象，因为它会重新发送上下文，并只请求返回发生变化的字符串。应查看**每次调用的输入 token 数**：正常范围为 4k–9k。Run 31149083965 的平均值为 1.76M，费用为 $1,108。

在合并任何涉及批处理、prompt 组装或上下文选择的改动前，运行 `pnpm intl:estimate`，并将每个请求的输入 token 数与该范围进行比较。

### `intl/pending-{base}` 分支生命周期

流水线首次运行时会创建 `intl/pending-{base}`，将翻译提交到该分支，并针对 `{base}` 创建 PR。后续运行会先将 `{base}` MERGE 到 pending 分支，然后翻译差异内容。pending PR 合并后，该分支会被删除；下一次运行会创建一个全新的分支。

不要对 `intl/pending-{base}` 执行 rebase、squash 或 force-push。流水线依赖其历史记录。

### `stamp_only: true` 是覆盖入口

如果英文中的结构性变更会导致翻译 locale 的构建失败（例如被移除的组件仍被该 locale 引用，或发生与 MDX 不兼容的变更），请在修复英文侧之后，使用 `stamp_only: true` 触发 `intl-pipeline.yml`。这会重新生成 manifests，但不会进行翻译。仅当该 base 不存在 pending 分支时才安全。

### SOV 语言中的行内元素重排序

对于韩语、乌尔都语及其他 SOV（主语-宾语-动词）语言，行内元素（链接、行内代码、JSX 组件）通常会以与英语**相反**的顺序出现。管道的惰性传播流程按**值**而非位置匹配元素。任何假设位置顺序的逻辑都会悄无声息地破坏这些语言。

### JSX 属性翻译是独立流程

JSX 属性值不会在主阶段 4 LLM 调用中翻译。阶段 4b 是一个专用流程，具有由 `src/scripts/intl-pipeline/lib/shared-patterns.ts` 定义的可翻译属性名称允许列表（`title`、`description`、`alt`、`label`、`aria-label`、`placeholder` 等）。涉及属性翻译意味着修改该流程，而不是阶段 4。

### 清理器测试范围应按文件限定，绝不能按语言全量扫描

绝不要针对整个语言运行清理器。它会处理数千个文件并卡住 30 分钟以上。不存在按文件设置的环境变量——唯一基于环境变量的范围限定是通过 `TARGET_LANGUAGES` 按语言进行（例如 `TARGET_LANGUAGES=ja`），而这仍会扫描该语言的全部内容。应通过调用从 `intl-sanitizer.ts` 导出的 `runSanitizer(filesWithContent)`，并且只传入受影响的文件，来以编程方式限定到特定文件。斜杠命令 `/fix-sanitizer-bug` 强制执行此规则；如果你通过脚本绕过它，仍需保留这一约束。

## 快速“我该去哪里找？”速查表

| 我需要...                              | 路径                                                               |
| -------------------------------------- | ------------------------------------------------------------------ |
| 管道入口                               | `src/scripts/intl-pipeline/main.ts`                                |
| 清理器                                 | `src/scripts/intl-pipeline/intl-sanitizer.ts`                      |
| Gemini 适配器                          | `src/scripts/intl-pipeline/lib/llm/gemini.ts`                      |
| OpenRouter 传输层                     | `src/scripts/intl-pipeline/lib/llm/openrouter.ts`                  |
| 适配器注册表 / 提供商选择             | `src/scripts/intl-pipeline/lib/llm/adapters.ts`, `constants.ts`    |
| 支出边界（预算 + 运行熔断器）          | `src/scripts/intl-pipeline/lib/llm/cost-meter.ts`                  |
| 工作规划器（与估算共享）               | `src/scripts/intl-pipeline/lib/llm/plan.ts`                        |
| 成本估算，不调用 LLM                   | `pnpm intl:estimate` (`src/scripts/intl-pipeline/estimate.ts`)     |
| 提示词构建器                           | `src/scripts/intl-pipeline/lib/llm/prompt-builder.ts`              |
| 内容规范化器                           | `src/scripts/intl-pipeline/lib/llm/content-normalizer.ts`          |
| 共享模式（JSX 属性允许列表）           | `src/scripts/intl-pipeline/lib/shared-patterns.ts`                 |
| 术语表配置                             | `src/scripts/intl-pipeline/config.ts`                              |
| 工作流文件                             | `.github/workflows/intl-pipeline.yml`                              |
| 单文件管道规范（权威版本）             | `tests/specs/PIPELINE-SPEC.md`                                     |
| 并发 / 分块规范                        | `tests/specs/CONCURRENCY-SPEC.md`                                  |
| 测试夹具变更表                         | `tests/specs/SPEC.md`                                              |
| 清理器测试套件                         | `tests/unit/intl-pipeline/sanitizer/`                              |
| 管道测试套件                           | `tests/unit/intl-pipeline/`                                        |
| 未来工作待办列表                       | `src/scripts/intl-pipeline/FUTURE.md`                              |
| 语言配置（权威列表）                   | `i18n.config.json`                                                 |
| ETHGlossary 仓库                       | https://github.com/wackerow/ethglossary                            |
| ETHGlossary API 根路径                 | https://ethglossary.visual-20-hoists.workers.dev                   |
| 斜杠命令：修复清理器错误               | `/fix-sanitizer-bug` (`.claude/commands/fix-sanitizer-bug.md`)     |
| 斜杠命令：审查翻译                     | `/review-translations` (`.claude/commands/review-translations.md`) |

## 何时加载各个参考文档

仅在触发条件适用时加载这些文档。不要一开始就全部读取。

- **`references/architecture.md`** — 在调试流水线行为，或希望查看分阶段流程说明时加载（变更检测、路由、确定性传播、LLM 翻译、JSX 属性处理、组装、清单更新）。
- **`references/manifests.md`** — 在清单行为异常时加载（哈希不匹配、缺少区段、理论上未变更的文件发生漂移），或在更改流水线跟踪内容时加载。
- **`references/orchestration.md`** — 在处理 `intl/pending-{base}` 分支时加载：base 合并到 pending、临时分支生命周期、多次运行协调、运行期间 base 发生移动时的处理方式。
- **`references/recovery.md`** — 在翻译损坏并需要恢复时加载（LLM 输出错误、清单损坏、意外的手动编辑、某个语言环境构建失败）。排查“流水线做错了什么”时应首先查看此文档。
- **`references/sanitizer.md`** — 在调查 sanitizer 行为、误报 / 漏报或添加修复函数时加载。模式目录位于 `docs/solutions/integration-issues/sanitizer-test-research.md`。
- **`references/runbooks/fix-sanitizer-bug.md`** — 在确认存在 sanitizer bug 并需要遵循测试优先工作流时加载（排查 / 编写失败测试 / 实现 / 验证）。
- **`references/runbooks/cost-guard-tripped.md`** — 在运行因 `[cost-guard]` 中止、文件因预算被跳过，或需要判断预计成本是否合理时加载。该文档也说明了相关边界值和 provider 选择。
- **`references/ethglossary.md`** — 在问题涉及 ETHGlossary 时加载：流水线如何查询术语、何时将术语添加到 ETHGlossary、`script_rule` 和 `term_role` 如何映射到流水线行为，以及缺少术语时的处理方式。
- **`references/non-english-edits.md`** — 在准备手动编辑翻译文件时加载。该文档说明何时可以安全编辑（`English unchanged`），以及何时不可以（英文变更后的同步）。
- **`references/gotchas.md`** — 在感觉哪里不对、但无法在上文找到相关说明时加载。这里记录了各种容易踩坑的细节。

## 可能适用的其他项目技能

- **`intl-review`** — 用于翻译质量审查（评分标准、语言组规则、品牌名称政策、按语言列出的发现）。它与流水线属于同一流程的两面；流水线负责生成，intl-review 负责评估。
- **`data-layer`** — 如果流水线变更涉及外部来源的内容，用于数据获取。

## 合并前冒烟测试

在提交涉及流水线的 PR 前：

- [ ] Sanitizer 测试套件通过（`npx playwright test --project=unit tests/unit/intl-pipeline/sanitizer/`）
- [ ] 流水线测试套件通过（`npx playwright test --project=unit tests/unit/intl-pipeline/`）
- [ ] 未手动编辑 `public/content/translations/` 或 `src/intl/{non-en}/` 文件
- [ ] 未手动更改 `*.manifest-*.json` 文件
- [ ] 如果重命名工作流 / 配置路径，已更新所有文档引用（搜索旧名称）
- [ ] 如果添加了会影响流水线的代码，已更新 `src/scripts/intl-pipeline/FUTURE.md`（如果已完成，则移除对应项目）
- [ ] 如果新增 sanitizer 修复函数，代码块拆分模式是其中的第一个操作
- [ ] 如果修改术语策略或转写规则，应先在 ETHGlossary 中进行变更——绝不要在此处重复术语数据
- [ ] 如果修改编排模型（pending 分支、临时分支、stamp_only），已同步更新 `references/orchestration.md`
- [ ] 如果修改批处理、提示词组装或上下文选择：已运行 `pnpm intl:estimate`，且每次请求的输入 token 数量合理（4k–9k），同时 `tests/unit/intl-pipeline/cost-incident.spec.ts` 通过
- [ ] 没有绕过 `callGeminiRaw` 的新 LLM 调用点——每次调用上限和运行熔断器都在此唯一的核心控制点执行