---
name: moai-workflow-docs-claim-check
description: >
  Read-only check of whether the claims a public-facing document makes
  (README, release notes, install and usage guides) are supported by
  user-supplied evidence. Runs Preflight, Claim Triage, and Validation, splits
  composite claims into atomic ones, and labels each. Runs no commands and
  writes no fixes.

when_to_use: >
  Use when asked whether documentation claims are backed by evidence, to audit
  a README or release note before publishing, or to find unsupported or
  outdated statements in user-facing docs.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Grep, Glob
user-invocable: false
metadata:
  version: "1.0.0"
  category: "workflow"
  status: "active"
  updated: "2026-07-24"
  modularized: "true"
  tags: "documentation, claim-check, evidence, verification, readme, release-notes, read-only"
  related-skills: "moai-workflow-project, moai-foundation-quality"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000
---
# 文档声明核查

评估面向公众的文档所作的声明是否确实得到随附证据的支持。评估过程只读取、判断并报告。它不会更改任何内容，也不会运行任何内容。

典型对象：README、发布说明、安装指南、快速入门指南、迁移说明、功能或兼容性表格。

## 严格边界

以下三条边界是绝对的。即使请求要求执行更多操作，这些边界仍然适用；在这种情况下，请完成评估，并在“边界说明”中拒绝其余请求。

1. **不得执行命令。** 在评估过程中，不得运行构建、测试、包管理器、代码检查工具、网络请求或任何 shell 命令。当某项声明只能通过运行某些内容来判定时，应**写明**确切的命令及其应针对的文件，并将该声明标记为 `needs-human`。写明命令即为交付内容；不得实际运行。
2. **不得修复。** 不得生成补丁、diff、改写后的段落或文件编辑内容。说明维护者应在何处进行何种更改，然后停止。
3. **不得进行代码审查或安全审查。** 不得评估代码质量、架构、性能或漏洞。如果收到此类请求，请在“边界说明”中声明该边界，并仅继续进行声明评估。

可以打开用户指定的文件，以查找其提供的证据——这属于读取，而不是执行。

## 阶段 1 — 预检

在对任何一项声明进行分类之前，完成以下全部三个步骤。如果某一步无法完成，请报告该情况并停止，不要猜测。

1. **确认文档面向公众。** 此技能评判的是为软件用户编写的文档：README、发布说明、安装与使用指南、已发布的网站页面。内部设计说明、任务跟踪记录和私有运行手册不在范围内——请说明这一点并停止。
2. **盘点所提供的证据。** 对于每一项证据，记录其内容、来源、**版本**标识符和**时间戳**。既无版本标识符也无时间戳的证据仍可使用，但应将其记录为未注明日期：之后不能用它来支持时效性判断。
3. **在继续之前标记需要脱敏的秘密信息。** 扫描所提供的证据，查找凭据、令牌、私钥、连接字符串和个人数据。如有发现，请标记其位置以便脱敏，绝不要在任何输出中复现秘密信息，并且只有在获得脱敏副本后才能继续。

## 阶段 2 — 声明分类

将文档转化为原子声明清单。

**提取。** 通读文档，提取其中所有关于软件且可核查的陈述：受支持的平台和版本、安装与使用步骤、默认值、限制、保证、可用性、数量。

**拆分复合声明。** 复合声明会在一个句子中包含若干可独立核查的断言。应将其拆分，使得**每项原子声明恰好只包含一个断言，因此也恰好只获得一个标签**。如果一个句子原本需要两个标签，则它还不是原子声明。

> “在 macOS 和 Linux 上只需一条命令即可安装”可拆分为三个原子化
> 声明：单命令安装、支持 macOS、支持 Linux。每项声明都有
> 独立的证据支持，也可能独立验证失败。

**将主观表述排除在外。** 对品味或目标的陈述（“快速”、
“对开发者友好”、“生产级”）无法根据证据进行核验。
不要为其添加标签，而应将其列在“已审查的输入范围”下，并附上一行理由。当主观形容词修饰一个可核验的核心表述时，应将其拆分：
为核心表述添加标签，排除该形容词。

**绑定证据。** 对于每项原子化声明，注明所提供的哪些证据项
与其相关；如果没有相关证据，也应记录这一点。

## 阶段 3 — 验证

按照有序决策树，为每项原子化声明分配**且仅分配一个**标签。
在第一个触发的关卡处停止；不要重新检查之前的关卡。

```
needs-human  ->  stale-suspected  ->  verified  ->  unsupported
```

| 标签 | 关卡条件 |
|-------|----------------|
| `needs-human` | 判定该声明需要执行本技能范围之外的操作：运行命令、访问私有系统、操作 UI，或作出只有维护者才能作出的判断。 |
| `stale-suspected` | 证据表明该声明此前为真，但当前证据在版本、日期、数量或名称方面与其不一致。这属于时间上的不匹配，而非实质性矛盾。 |
| `verified` | 所提供的证据直接支持该声明，并且可以明确指出支持它的证据项。 |
| `unsupported` | 以上关卡均未触发：证据无法支持该声明。 |

`unsupported` 始终携带**且仅携带一个**原因：

| 原因 | 含义 |
|--------|---------|
| `missing-evidence` | 所提供的证据完全未涉及该声明。 |
| `contradicted` | 所提供的证据断言了相反的内容。 |
| `insufficient-coverage` | 证据与主题相关，但覆盖范围小于声明——三个平台中只覆盖一个、声明的版本范围中只覆盖一个版本，或多条路径中只覆盖一条。 |

锚定规则：每个 `verified` 都要指明其证据锚点；每个
`stale-suspected` 都要指明不匹配的字段及双方的值；每个
`needs-human` 都要指明可用于判定的命令或文件；每个
`unsupported` 都要携带其原因。

完整的关卡判定标准、相邻关卡之间的裁决规则以及声明类型表
位于 `references/label-decision-tree.md`。完整的端到端评估示例
位于 `references/worked-examples.md`。

## 输出约定

每次都严格按以下顺序输出这三个部分——即使
声明清单为空也不例外。

### 1. 已审查的输入范围

- 已阅读的文档，并在已知时注明版本或日期。
- 已编目的证据项，每项均附版本和时间戳（或 `undated`）。
- 因具有主观性而被排除的陈述，每项均附一行理由。
- 需要但**未**提供的证据，并明确指出具体内容。

### 2. 声明评估

每项原子化声明占一行：

| # | 原子化声明 | 标签 | 原因 | 证据锚点或缺失内容 |
|---|--------------|-------|--------|------------------------------------|

`Reason` 仅在 `unsupported` 行中填写。

### 3. 边界说明

- 认证声明，按原文表述：本次评估期间**未执行任何命令**。
- 所有被拒绝的事项，以及禁止这些事项的边界（修复请求、代码或安全审查请求）。
- 剩余风险：即使每一行均为 `verified`，本次评估仍无法证明哪些内容。
- 对于每个 `needs-human` 行，注明维护者需要使用的具体命令或文件。

## 与声明完整性策略的关系

此 Skill 是项目规则
`.claude/rules/moai/core/verification-claim-integrity.md` 面向文档的执行流程。该规则定义了规范及其报告格式；此 Skill 仅将该规范应用于已发布的文档。当规范本身存在疑问时，请直接阅读该规则——此处不再复述。

## 随附参考资料

| 文件 | 内容 |
|------|----------|
| `references/label-decision-tree.md` | 完整的门槛标准、相邻门槛的决胜规则、声明类型表、复合声明拆分指南 |
| `references/worked-examples.md` | 涵盖多个语言生态系统的端到端评估示例 |

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的合理化借口

| 合理化借口 | 事实 |
|---|---|
| “只需运行一个简单命令即可确定此声明，所以我直接运行就好” | 禁止执行命令的边界不存在规模例外。注明该命令，并将声明标记为 `needs-human`。 |
| “该声明显然为真，我熟悉这个生态系统” | 背景知识不属于已提供的证据。缺少证据锚点时，标签应为 `unsupported`，原因应为 `missing-evidence`。 |
| “没有证据与之矛盾，所以它通过了” | 没有出现反驳某项声明的证据，并不构成对该声明的支持。沉默对应 `missing-evidence`，绝不对应 `verified`。 |
| “文档有误，我直接修正这句话” | 仅报告发现。说明应做的更改以及更改位置；编辑操作应由维护者执行。 |
| “这句话有两部分，但结论显而易见” | 两项断言需要两个标签。请先拆分，再进行标记。 |
| “缺少 Linux 日志，但 macOS 日志已经足够接近” | 当证据的覆盖范围小于声明的范围时，应标记为 `insufficient-coverage`，而不是 `verified`。 |
<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 一个声明行带有两个标签，或同时带有标签和模糊限定语。
- 一个 `verified` 行未注明任何证据锚点。
- 一个 `unsupported` 行未注明原因，或注明了多个原因。
- 主观形容词被标记，而不是被排除。
- 缺少边界说明，或其中未包含“未执行任何命令”这一明确表述。
- 评估期间“只是为了确认”而运行了命令。
- 未提供任何证据，但仍有声明被标记为 `verified`。
- 证据清单未记录版本或时间戳，却被用于判断时效性。
<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 在进行任何标记之前，已完成并记录全部三个预检步骤。
- [ ] 已拆分每个复合声明，直至每个原子声明仅包含一项断言。
- [ ] 每个原子声明都仅带有四值标签集中的一个标签。
- [ ] 已按顺序对每个声明应用决策树。
- [ ] 每个 `unsupported` 行都仅带有一个原因。
- [ ] 三个输出章节均已按顺序提供。
- [ ] 边界说明包含“未执行任何命令”这一明确认证声明。
- [ ] 输出中的任何位置均未出现补丁、差异或编辑后的段落。
<!-- moai:evolvable-end -->