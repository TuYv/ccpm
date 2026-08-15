---
name: intl-pipeline
description: Use when working on the translation pipeline (`src/scripts/intl-pipeline/`), the post-import sanitizer (`intl-sanitizer.ts`), the `intl/pending-*` branches, the `intl-pipeline.yml` GitHub Actions workflow, ETHGlossary integration, or any translation-related issue (broken translations, missing locales, manifest drift, sanitizer false positives, ETHGlossary term lookups, language-group transliteration questions). Provides the manifest-driven incremental pipeline mental model, the "don't hand-propagate" rule, recovery procedures, the ETHGlossary-as-canonical-source policy, and the `intl/pending-{base}` orchestration contract.
---
# intl-pipeline

面向 ethereum.org、基于 LLM、由清单驱动的增量翻译流水线。通过 Gemini，将英文内容（`public/content/` 中的 markdown、`src/intl/en/` 中的 JSON UI 字符串）翻译为 24 种目标语言，并使用导入后清理器对常见瑕疵进行规范化。ETHGlossary（https://ethglossary.visual-20-hoists.workers.dev）是该流水线所使用的所有以太坊生态系统术语译文的权威来源。激活时请完整阅读此文件；仅当列出的触发条件适用时，才从 `references/` 中获取内容。

## 核心规则：不要手动同步英文变更

确保翻译正确的最高效习惯是：**绝不要手动编辑已翻译内容来体现英文变更。** 流水线通过清单跟踪状态（每个文件和语言区域对应 `.manifest-source.json` + `.manifest-translation.json`）；在英文变更后进行手动编辑，会使清单与实际内容不同步，而下一次运行流水线时，要么会重新翻译并覆盖你的编辑，要么会产生合并冲突。

这条规则并不是“绝不要编辑语言区域文件”，而是“不要手动同步英文更新”：

- **允许：** 在英文内容没有变动时修正翻译错误（审校阶段修正、清理器后续修正）。清单中的英文到本地化语言映射仍然有效。
- **不允许：** 编辑语言区域文件以体现新的英文值（URL 变更、属性变更、段落重构）。清单映射会因此出错。
- **如果确实急需同步英文与本地化语言**（会破坏构建的结构性变更，且没有待处理的开放 PR）：进行英文编辑，然后使用 `stamp_only: true` 触发 `intl-pipeline.yml`，在不翻译的情况下刷新清单。仅当该基础分支不存在 `intl/pending-{base}` 分支时才是安全的。

**删除也必须通过英文进行。** 流水线只传播规范英文中发生的*变更*；它从不扫描未使用或孤立的字符串，也没有自动删除孤立英文字符串的机制——它只会将英文传播到其他语言区域。要删除字符串——包括代码已不再引用的键（孤立键）——请从英文源（`src/intl/en/` 或英文内容）中将其删除；流水线会在下一次运行时将该删除操作传播到各语言区域。**不要**手动删除各语言区域中的副本，这属于手动同步，而流水线会自行处理。因此，出现孤立字符串就是清理信号：仅从英文中删除它。

## 首要规则

1. **ETHGlossary 是术语翻译的规范来源。** 品牌名称、人名、编程语言、操作系统/平台名称、概念术语——全部存放在 ETHGlossary 中。不要维护并行的术语库。流水线通过 `GLOSSARY_API_URL` 查询 API（默认值位于 `src/scripts/intl-pipeline/config.ts`）。
2. **每个基础分支同一时间只能有一个翻译 PR。** 流水线会提交到 `intl/pending-{base}`（例如 `intl/pending-dev`）。后续运行会先将 `{base}` 合并到待处理分支，然后翻译增量内容。针对同一基础分支并行创建翻译 PR 会产生冲突。
3. **流水线在生产环境中仅以 `dev` 为目标。** 针对 `staging` / `master` 的紧急修复仅以英文发布，之后通过 prepare-release 补齐翻译。除非有特定理由并使用自定义 `target_branch`，否则不要针对 `staging` / `master` 进行翻译。
4. **清单与其语言区域文件不可分割。** 每个已翻译文件旁都有两个清单：`.manifest-source.json` 和 `.manifest-translation.json`。如果删除其中一个，就必须重新生成两者——最简单的方法是针对该文件和语言区域，以 `full` 模式运行流水线。绝不要手动编辑清单。
5. **清理器在翻译后运行，而不是翻译前。** 它的职责是修复 Gemini 引入的瑕疵（BiDi 错误、代码围栏偏移、品牌名称误译）。它接收翻译输出，绝不会接收英文源内容。
6. **不要在此处添加转写数据。** 所有术语/品牌/人名的转写策略都位于 ETHGlossary 的 `docs/translation-policy.md` 和各语言条目中。intl-pipeline 只负责使用这些内容，不负责创作。
7. **清理器修复必须先按代码块拆分。** `intl-sanitizer.ts` 中的每项文本转换都**必须**从代码块拆分模式开始。修改代码围栏中的内容会破坏教程里的 Solidity / Python / TypeScript 示例。
8. **流水线失败并不总是流水线缺陷。** “翻译看起来不对”的报告可能源于：Gemini 输出不佳（向上游提交问题）、ETHGlossary 缺少术语（在那里添加）、符合语言组策略的正确结果（阅读 translation-policy.md），或者实际的流水线缺陷。修补前先进行问题分类。

## 最高价值的易踩坑点

以下这些地方很容易踩坑，看似显而易见的做法其实是错误的。完整列表位于 `references/gotchas.md`；下面这些最常遇到。

### 历史命名

该流水线过去被称为“Gemini 翻译流水线”和“i18n 流水线”。旧文档和外部引用可能仍在使用这些名称。目前的规范名称如下：

- 模块路径：`src/scripts/intl-pipeline/`（原为 `src/scripts/i18n/`）
- 工作流文件：`.github/workflows/intl-pipeline.yml`（原为 `gemini-translations.yml`）
- 流水线入口：`src/scripts/intl-pipeline/main.ts`（原为 `main-incremental.ts` / `main-gemini.ts`）
- 正文中的模块名称：`intl-pipeline`。在新内容中避免使用 `i18n-pipeline` 和 `gemini-translations`。

如果在文档或注释中看到旧名称，请更新它。

### 清单文件与区域设置文件位于同一位置，而不是集中存放

对于 `public/content/translations/ja/some-page/index.md`，对应的清单文件为：

- `public/content/translations/ja/some-page/index.md.manifest-source.json`
- `public/content/translations/ja/some-page/index.md.manifest-translation.json`

`src/intl/{locale}/` 中的 JSON 区域设置文件也遵循相同模式。移动区域设置文件时，必须同时移动其清单文件；重命名内容文件意味着每个区域设置都要重命名六个文件（文件 + 2 个清单文件，再乘以 en 源文件）。

### `intl/pending-{base}` 分支的生命周期

流水线首次运行时会创建 `intl/pending-{base}`，将翻译提交到该分支，并创建一个以 `{base}` 为目标分支的 PR。后续运行会先将 `{base}` 合并到 pending 分支，然后再翻译增量内容。pending PR 合并后，该分支会被删除；下一次运行会创建一个全新的分支。

切勿对 `intl/pending-{base}` 执行变基、压缩提交或强制推送。流水线依赖其提交历史。

### `stamp_only: true` 是应急覆盖机制

如果英文内容的结构性变更会导致已翻译区域设置的构建失败（例如删除了区域设置仍在引用的组件，或进行了与 MDX 不兼容的更改），请先修复英文内容，然后使用 `stamp_only: true` 触发 `intl-pipeline.yml`。这会重新生成清单，而不执行翻译。仅当该基础分支不存在 pending 分支时才是安全的。

### SOV 语言的行内元素重排序

对于韩语、乌尔都语及其他 SOV（主语-宾语-谓语）语言，行内元素（链接、行内代码、JSX 组件）的顺序通常与英语相反。流水线的惰性传播步骤按**值**而不是按位置匹配元素。任何假设元素位置顺序不变的逻辑，都会在不发出提示的情况下破坏这些语言的内容。

### JSX 属性翻译是一个独立步骤

JSX 属性值不会在 Phase 4 的主要 LLM 调用中翻译。Phase 4b 是一个专用步骤，它使用 `src/scripts/intl-pipeline/lib/shared-patterns.ts` 中定义的可翻译属性名称允许列表（`title`、`description`、`alt`、`label`、`aria-label`、`placeholder` 等）。修改属性翻译时，应修改该步骤，而不是 Phase 4。

### 清理器测试范围必须限定为单个文件，绝不能扫描整个语言

绝不要针对整个语言运行清理器。它会处理数千个文件，并卡住 30 分钟以上。不存在按文件限定范围的环境变量——唯一基于环境变量的范围限定方式是通过 `TARGET_LANGUAGES` 按语言限定（例如 `TARGET_LANGUAGES=ja`），但这仍会扫描该语言的全部内容。应通过编程方式限定到特定文件：调用 `intl-sanitizer.ts` 导出的 `runSanitizer(filesWithContent)`，并仅传入受影响的文件。斜杠命令 `/fix-sanitizer-bug` 会强制执行此约束；如果编写脚本绕过该命令，也必须保留这一约束。

## 快速“我该去哪里找？”速查表

| 我需要……                               | 路径                                                               |
| -------------------------------------- | ------------------------------------------------------------------ |
| 流水线入口                             | `src/scripts/intl-pipeline/main.ts`                                |
| 清理器                                 | `src/scripts/intl-pipeline/intl-sanitizer.ts`                      |
| Gemini 适配器                          | `src/scripts/intl-pipeline/lib/llm/gemini.ts`                      |
| 提示词构建器                           | `src/scripts/intl-pipeline/lib/llm/prompt-builder.ts`              |
| 内容规范化器                           | `src/scripts/intl-pipeline/lib/llm/content-normalizer.ts`          |
| 共享模式（JSX 属性允许列表）           | `src/scripts/intl-pipeline/lib/shared-patterns.ts`                 |
| 术语表配置                             | `src/scripts/intl-pipeline/config.ts`                              |
| 工作流文件                             | `.github/workflows/intl-pipeline.yml`                              |
| 单文件流水线规范（权威版本）           | `tests/specs/PIPELINE-SPEC.md`                                     |
| 并发／分块规范                         | `tests/specs/CONCURRENCY-SPEC.md`                                  |
| 测试固件变更表                         | `tests/specs/SPEC.md`                                              |
| 清理器测试套件                         | `tests/unit/intl-pipeline/sanitizer/`                              |
| 流水线测试套件                         | `tests/unit/intl-pipeline/`                                        |
| 未来工作待办列表                       | `src/scripts/intl-pipeline/FUTURE.md`                              |
| 语言配置（权威列表）                   | `i18n.config.json`                                                 |
| ETHGlossary 仓库                       | https://github.com/wackerow/ethglossary                            |
| ETHGlossary API 根地址                 | https://ethglossary.visual-20-hoists.workers.dev                   |
| 斜杠命令：修复清理器错误               | `/fix-sanitizer-bug` (`.claude/commands/fix-sanitizer-bug.md`)     |
| 斜杠命令：审查翻译                     | `/review-translations` (`.claude/commands/review-translations.md`) |

## 何时加载各项参考资料

仅在符合触发条件时才加载这些资料。不要一开始就全部阅读。

- **`references/architecture.md`** — 在调试流水线行为或需要逐阶段说明时加载（变更检测、路由、确定性传播、LLM 翻译、JSX 属性处理、组装、清单更新）。
- **`references/manifests.md`** — 在清单行为异常（哈希不匹配、缺少章节、理应未变更的文件发生偏移）或更改流水线的跟踪内容时加载。
- **`references/orchestration.md`** — 在处理 `intl/pending-{base}` 分支时加载：将基础分支合并到待处理分支、临时分支生命周期、多次运行协调，以及运行期间基础分支发生移动时的处理方式。
- **`references/recovery.md`** — 在翻译损坏且需要恢复时加载（LLM 输出不佳、清单损坏、意外手动编辑、某个语言版本构建失败）。排查“流水线出了问题”时首先应查阅此文档。
- **`references/sanitizer.md`** — 在调查清理器行为、误报／漏报或添加修复函数时加载。模式目录位于 `docs/solutions/integration-issues/sanitizer-test-research.md`。
- **`references/runbooks/fix-sanitizer-bug.md`** — 在确认存在清理器错误并需要测试优先的工作流时加载（问题分类／编写失败测试／实现／验证）。
- **`references/ethglossary.md`** — 在问题与 ETHGlossary 有关时加载：流水线如何查询术语、何时向 ETHGlossary 添加术语、`script_rule` 和 `term_role` 如何映射到流水线行为，以及术语缺失时该怎么做。
- **`references/non-english-edits.md`** — 在准备手动编辑翻译文件时加载。它会告诉你何时可以安全编辑（英文未变更），何时不可以（英文变更后进行同步）。
- **`references/gotchas.md`** — 在感觉有些不对劲且无法在上文中找到相关内容时加载。这里收录了各种容易踩到的隐蔽陷阱。

## 其他可能适用的项目技能

- **`intl-review`** — 用于翻译质量审查（评分标准、语言组规则、品牌名称政策、各语言调查结果）。这是同一枚硬币的审查面；流水线负责产出，intl-review 负责评估。
- **`data-layer`** — 用于数据获取，适用于流水线变更涉及外部来源内容的情况。

## 合并前冒烟测试

在创建涉及该流水线的 PR 之前：

- [ ] 清理器测试套件通过（`npx playwright test --project=unit tests/unit/intl-pipeline/sanitizer/`）
- [ ] 流水线测试套件通过（`npx playwright test --project=unit tests/unit/intl-pipeline/`）
- [ ] 未手动编辑 `public/content/translations/` 或 `src/intl/{non-en}/` 文件
- [ ] 未手动更改 `*.manifest-*.json` 文件
- [ ] 如果重命名工作流或配置路径，已更新所有文档引用（搜索旧名称）
- [ ] 如果添加影响流水线的代码，已更新 `src/scripts/intl-pipeline/FUTURE.md`（或者，如果对应事项已完成，则将其移除）
- [ ] 如果新增清理器修复函数，代码块拆分模式是该函数内部执行的第一个操作
- [ ] 如果涉及术语政策或音译，应先在 ETHGlossary 中进行更改——绝不要在此处重复维护术语数据
- [ ] 如果涉及编排模型（pending branch、temp branch、stamp_only），应同步更新 `references/orchestration.md`