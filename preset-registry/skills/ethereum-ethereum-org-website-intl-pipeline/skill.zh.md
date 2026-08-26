---
name: intl-pipeline
description: Use when working on the translation pipeline (`src/scripts/intl-pipeline/`), the post-import sanitizer (`intl-sanitizer.ts`), the `intl/pending-*` branches, the `intl-pipeline.yml` GitHub Actions workflow, ETHGlossary integration, or any translation-related issue (broken translations, missing locales, manifest drift, sanitizer false positives, ETHGlossary term lookups, language-group transliteration questions). Provides the manifest-driven incremental pipeline mental model, the "don't hand-propagate" rule, recovery procedures, the ETHGlossary-as-canonical-source policy, and the `intl/pending-{base}` orchestration contract.
---
# intl-pipeline

基于 LLM、由清单驱动的 ethereum.org 增量翻译流水线。它通过 Gemini 将英文内容（`public/content/` 中的 markdown、`src/intl/en/` 中的 JSON UI 字符串）翻译成 24 种目标语言，也可以通过 OpenRouter（`LLM_PROVIDER`）间接调用 Gemini；OpenRouter 的密钥带有服务端支出限额。导入后置的清理器会对常见产物进行规范化。**该工作流仅支持手动触发**；由于一次无人值守运行产生了 $1,108 的费用，原有的每日 cron 已被移除（`references/runbooks/cost-guard-tripped.md`）。对于流水线所使用的所有 Ethereum 生态术语翻译，ETHGlossary 是权威来源。激活时请完整阅读本文件；仅在列出的触发条件适用时读取 `references/` 中的内容。

## 核心规则：不要手动传播英文变更

保持翻译正确性最具杠杆效应的习惯是：**永远不要手动编辑译文内容来反映英文变更。** 流水线通过清单跟踪状态（每个文件和语言对应 `.manifests/{destPath}/source.json` + `translation.json`）；在英文变更后进行的手动编辑会使清单与实际状态不同步，而下一次流水线运行要么覆盖你的编辑重新翻译，要么产生合并冲突。

这条规则并不是“永远不要编辑语言文件”。它的含义是“不要手动传播英文更新”：

- **允许：** 在英文一侧没有变更时修复翻译错误（审查时修正、清理器后续修正）。清单中的英文到语言映射仍然有效。
- **不允许：** 为了反映新的英文值而编辑语言文件（URL 变更、属性变更、段落重构）。清单映射会因此变得错误。
- **如果英文到语言的同步确实紧急**（会导致构建失败的结构性变更，且没有待处理的 PR）：先进行英文修改，然后以 `stamp_only: true` 触发 `intl-pipeline.yml`，在不翻译的情况下刷新清单。只有在不存在针对该 base 的 `intl/pending-{base}` 分支时才安全。

**删除也必须通过英文一侧进行。** 要移除一个字符串——包括代码已不再引用的孤立键——只需从英文源文件中删除；流水线会在下一次运行时传播删除操作。手动删除语言文件中的副本属于手动传播。

## 顶层规则

1. **ETHGlossary 是术语翻译的权威来源。** 品牌名称、人名、编程语言、操作系统/平台名称、概念术语——全部都存放在 ETHGlossary 中。不要维护平行的术语库。流水线通过 `GLOSSARY_API_URL` 查询 API（默认值位于 `src/scripts/intl-pipeline/config.ts`）。
2. **每个 base 分支一次只能有一个翻译 PR。** 流水线会提交到 `intl/pending-{base}`（例如 `intl/pending-dev`）。后续运行会先将 `{base}` 合并到 pending，然后翻译差异内容。针对同一个 base 的并行翻译 PR 会产生冲突。
3. **生产环境中的流水线只针对 `dev`。** 对 `staging` / `master` 的紧急修复仅以英文发布，并通过 prepare-release 追赶同步。除非有特定原因并使用自定义的 `target_branch`，否则不要针对 `staging` / `master` 进行翻译。
4. **清单与其语言文件不可分离。** 每个翻译文件都有两个清单，集中存放于 `.manifests/{destPath}/`：`source.json` 和 `translation.json`。删除其中一个，就必须重新生成两个——对该文件和语言使用 `full` 模式运行流水线是最简单的方式。绝不要手动编辑清单。
5. **清理器在翻译后运行，而不是翻译前运行。** 它的作用是修复 Gemini 引入的产物（BiDi 错误、代码围栏偏移、品牌名称误译）。它接收翻译输出，而不是英文源文件。
6. **不要在此处添加音译数据。** 所有术语/品牌/人名的音译策略都位于 ETHGlossary 的 `docs/translation-policy.md` 和各语言条目中。intl-pipeline 只消费这些策略，不负责编写。
7. **清理器修复必须先按代码块进行拆分。** `intl-sanitizer.ts` 中的每个文本转换都 MUST 以代码块拆分模式开始。修改代码围栏内容会破坏教程中的 Solidity / Python / TypeScript 示例。
8. **流水线失败不一定是流水线缺陷。** “翻译看起来不对”的报告可能是：Gemini 输出质量不佳（问题来自上游文件）、ETHGlossary 缺少术语（应在那里添加）、符合语言组策略的正确结果（请阅读 `translation-policy.md`），或确实存在流水线缺陷。请先进行分类排查，再修复。

## 价值最高的注意事项

这些是看似显而易见但实际操作错误的雷区。完整列表见 `references/gotchas.md`；以下情况最常出现。

### 命名沿革

旧名称已经废弃——`src/scripts/i18n/`、`gemini-translations.yml`、`main-incremental.ts`、“i18n pipeline”；任何地方的规范名称都是 `intl-pipeline`。看到旧名称就立即更新。

### Manifest 集中存放于 `.manifests/` 下，而不是与 locale 文件放在一起

每个文件+locale 对应 `.manifests/{destPath}/source.json` + `translation.json` 中的两个 manifest（例如 `.manifests/src/intl/ja/common.json/source.json`）。结构、生命周期和调试方法见 `references/manifests.md`。

### 消耗上限针对输入侧，判断依据是每次调用的输入 tokens

健康运行的每次调用平均输入 tokens 为 4k–9k；输入:输出比例不是判断信号。在合并任何涉及批处理、prompt 组装或上下文选择的改动之前，运行 `pnpm intl:estimate`，并将每个请求的输入 tokens 与该范围进行比较。上限、分诊方法以及促成这些限制的事故见 `references/runbooks/cost-guard-tripped.md`。

### `intl/pending-{base}` 分支生命周期

首次运行时，pipeline 会创建 `intl/pending-{base}`，将翻译提交到该分支，并创建一个针对 `{base}` 的 PR。后续运行会先将 `{base}` 合并到 pending 分支，再翻译增量内容。pending PR 合并后，该分支会被删除；下一次运行会创建一个全新的分支。

不要对 `intl/pending-{base}` 执行 rebase、squash 或 force-push。pipeline 依赖其历史记录。

### SOV 语言的行内元素重排

对于韩语、乌尔都语以及其他 SOV（主语-宾语-动词）语言，行内元素（链接、行内代码、JSX 组件）相对于英语通常会以相反顺序出现。pipeline 的 inert-propagation pass 按 **value** 而不是位置匹配元素。任何假设位置顺序的逻辑都会悄无声息地破坏这些语言。

### JSX 属性翻译是独立的 pass

JSX 属性值不会在主 Phase 4 LLM 调用中翻译。Phase 4b 是一个专用 pass，其中可翻译属性名称的 allow-list（`title`、`description`、`alt`、`label`、`aria-label`、`placeholder` 等）定义在 `src/scripts/intl-pipeline/lib/shared-patterns.ts` 中。修改属性翻译意味着修改该 pass，而不是 Phase 4。

### Sanitizer 测试范围按文件划分，绝不能按语言进行全量扫描

绝对不要针对整个语言运行 sanitizer。它会处理数千个文件并挂起 30 多分钟。没有按文件设置范围的环境变量——唯一基于环境变量的范围控制是通过 `TARGET_LANGUAGES` 按语言指定（例如 `TARGET_LANGUAGES=ja`），但这仍会扫描该语言的全部内容。通过调用 `intl-sanitizer.ts` 导出的 `runSanitizer(filesWithContent)`，并仅传入受影响的文件，将范围限定为特定文件。斜杠命令 `/fix-sanitizer-bug` 会强制执行这一点；如果你通过脚本绕过它，也必须保留这一约束。

## 快速“我该去哪里看？”速查表

| 我需要……                              | 路径                                                               |
| -------------------------------------- | ------------------------------------------------------------------ |
| Pipeline 入口                         | `src/scripts/intl-pipeline/main.ts`                                |
| Sanitizer                              | `src/scripts/intl-pipeline/intl-sanitizer.ts`                      |
| Gemini 适配器                         | `src/scripts/intl-pipeline/lib/llm/gemini.ts`                      |
| OpenRouter 传输层                     | `src/scripts/intl-pipeline/lib/llm/openrouter.ts`                  |
| 适配器注册表 / provider 选择           | `src/scripts/intl-pipeline/lib/llm/adapters.ts`、`constants.ts`    |
| 消耗上限（预算 + 运行 fuse）           | `src/scripts/intl-pipeline/lib/llm/cost-meter.ts`                  |
| 工作规划器（与 estimate 共用）         | `src/scripts/intl-pipeline/lib/llm/plan.ts`                        |
| 成本估算，不调用 LLM                  | `pnpm intl:estimate`（`src/scripts/intl-pipeline/estimate.ts`）     |
| Prompt 构建器                          | `src/scripts/intl-pipeline/lib/llm/prompt-builder.ts`              |
| 内容规范化器                           | `src/scripts/intl-pipeline/lib/llm/content-normalizer.ts`          |
| 共享模式（JSX attrs allow-list）       | `src/scripts/intl-pipeline/lib/shared-patterns.ts`                 |
| Glossary 配置                         | `src/scripts/intl-pipeline/config.ts`                              |
| Workflow 文件                         | `.github/workflows/intl-pipeline.yml`                              |
| 单文件 pipeline 规范（规范版本）       | `tests/specs/PIPELINE-SPEC.md`                                     |
| 并发 / 分块规范                        | `tests/specs/CONCURRENCY-SPEC.md`                                  |
| 测试 fixture 变更表                    | `tests/specs/SPEC.md`                                              |
| Sanitizer 测试套件                     | `tests/unit/intl-pipeline/sanitizer/`                              |
| Pipeline 测试套件                      | `tests/unit/intl-pipeline/`                                        |
| Future-work 待办列表                   | `src/scripts/intl-pipeline/FUTURE.md`                              |
| 语言配置（规范列表）                   | `i18n.config.json`                                                 |
| ETHGlossary 仓库                       | https://github.com/wackerow/ethglossary                            |
| ETHGlossary API 根地址                 | https://ethglossary.visual-20-hoists.workers.dev                   |

## 何时加载各个参考文档

仅在触发相应条件时加载这些文档。不要一开始就全部阅读。

- **`references/architecture.md`** — 调试管道行为；按阶段分解的流程说明。
- **`references/manifests.md`** — manifest 行为异常，或需要更改管道所跟踪的内容。
- **`references/orchestration.md`** — 使用 `intl/pending-{base}` 分支。
- **`references/recovery.md`** — 翻译出现问题，排查“管道执行错误”。
- **`references/sanitizer.md`** — sanitizer 行为、误报/漏报、修复函数目录。
- **`references/runbooks/fix-sanitizer-bug.md`** — 已确认的 sanitizer bug；何时运行或不运行 `/fix-sanitizer-bug`。
- **`references/runbooks/cost-guard-tripped.md`** — `[cost-guard]` 中止、预算跳过、成本约束设计、provider 选择。
- **`references/ethglossary.md`** — 术语查询、`script_rule`/`term_role` 语义、缺失术语。
- **`references/non-english-edits.md`** — 即将手动编辑翻译文件。
- **`references/gotchas.md`** — 感觉哪里不对，但上面没有内联说明。

## 可能适用的其他项目 Skill

- **`intl-review`** — 用于翻译质量审查（评分标准、语言组规则、品牌名称政策、按语言划分的问题）。这是同一枚硬币的另一面；管道负责生成，intl-review 负责评估。
- **`data-layer`** — 用于数据获取，适用于管道变更涉及外部来源内容的情况。

## 合并前冒烟测试

在提交涉及管道的 PR 之前：

- [ ] Sanitizer 测试套件通过（`npx playwright test --project=unit tests/unit/intl-pipeline/sanitizer/`）
- [ ] 管道测试套件通过（`npx playwright test --project=unit tests/unit/intl-pipeline/`）
- [ ] 未手动编辑 `public/content/translations/` 或 `src/intl/{non-en}/` 文件
- [ ] 未手动修改 `.manifests/` 下的 manifest 文件
- [ ] 如果重命名 workflow / config 路径，已更新所有文档引用（搜索旧名称）
- [ ] 如果新增影响管道的代码，已更新 `src/scripts/intl-pipeline/FUTURE.md`（如果已完成，则移除相应条目）
- [ ] 如果新增 sanitizer 修复函数，代码块拆分模式是其中的第一个操作
- [ ] 如果涉及术语政策或音译，先在 ETHGlossary 中修改——绝不要在此处重复术语数据
- [ ] 如果涉及编排模型（pending 分支、临时分支、stamp_only），已同步更新 `references/orchestration.md`
- [ ] 如果涉及批处理、提示组装或上下文选择：已运行 `pnpm intl:estimate`，且每次请求的输入 token 数合理（4k–9k）；同时 `tests/unit/intl-pipeline/cost-incident.spec.ts` 通过
- [ ] 没有新增绕过 `callGeminiRaw` 的 LLM 调用点——它是唯一强制执行单次调用上限和运行熔断机制的集中控制点