---
name: moai-domain-design-handoff
description: >
  Claude Design handoff package specialist for /moai brain Phase 7. Assembles 5-file
  handoff bundle (prompt/context/references/acceptance/checklist) for paste-ready
  claude.com Design session. Handles brand-absent fallback and section regeneration.

when_to_use: >
  Use for /moai brain Phase 7 design handoff: assembling the 5-file Claude
  Design package (prompt, context, references, acceptance, checklist),
  brand-voice context, and paste-ready claude.com session bundles.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Grep, Glob
user-invocable: false
metadata:
  version: "1.0.0"
  category: "domain"
  status: "active"
  updated: "2026-05-04"
  modularized: "false"
  tags: "design-handoff, claude-design, prompt-template, brand, acceptance, brain"
  related-skills: "moai-domain-ideation, moai-workflow-brain, moai-workflow-design"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000
---
<!-- 验证：prompt.md 可直接粘贴使用（不含 MoAI 令牌） -->
<!-- 验证：存在品牌语调时已集成；不存在时可优雅地使用默认设置 -->
<!-- 验证：阶段 7 退出时使用包含 3 个选项的 AskUserQuestion -->

<!-- @MX:ANCHOR: [AUTO] prompt.md 5 节模板结构 — 规范定义 -->
<!-- @MX:REASON: 由每个 brain 工作流的阶段 7 执行过程使用（高 fan_in）。结构变更会影响用户信任 — prompt.md 会被直接粘贴到外部 claude.com Design 会话中。 -->

# 设计交接领域专家

为 brain 工作流的阶段 7 组装包含 5 个文件的 Claude Design 交接包。该交接包专为在外部 claude.com Design 产品中即贴即用而设计。

## 快速参考

交接包位于 `.moai/brain/IDEA-NNN/claude-design-handoff/`：

| 文件 | 用途 | 粘贴目标 |
|------|---------|-------------|
| `prompt.md` | 主提示词 — 直接粘贴到 claude.com Design | 是（主要） |
| `context.md` | 供设计会话期间参考的扩展上下文 | 可选补充 |
| `references.md` | 视觉参考 URL 和设计灵感来源 | 在提示词中引用 |
| `acceptance.md` | 设计验收标准（WCAG、响应式、品牌） | 在提示词中引用 |
| `checklist.md` | 在 claude.com Design 中使用前的粘贴前自检 | 人工审查工具 |

关键保证：

- [HARD] `prompt.md` 不包含任何 MoAI 特有令牌（不得包含 `SPEC-`、`.moai/`、`manager-`、`IDEA-`）
- [HARD] 当 `.moai/project/brand/brand-voice.md` 存在时，集成品牌语调
- [HARD] 品牌缺失时的回退方案：使用 `品牌语调（默认 — 请自定义）` 占位章节
- [HARD] 阶段 7 退出时使用提供 3 个选项的 AskUserQuestion（根据相关要求提供 a/b/c）
- [HARD] 无论品牌上下文是否可用，均生成全部 5 个文件

---

## 阶段 7：交接包组装

### 输入

- `ideation.md`（来自阶段 4 和阶段 5 的精益画布 + 评估报告）
- `proposal.md`（来自阶段 6 的产品摘要和 SPEC 拆分）
- 可选：`.moai/project/brand/brand-voice.md`（品牌上下文）
- 可选：`.moai/project/brand/visual-identity.md`（设计令牌、颜色）

### 步骤 0：品牌上下文检测

在编写任何文件之前，检查品牌上下文：

```
IF .moai/project/brand/brand-voice.md exists AND is non-empty:
  Load brand voice → use in Brand Voice section of prompt.md
  SET brand_present = true
ELSE:
  Use default brand voice placeholder
  SET brand_present = false
  Note: will include AskUserQuestion offer to run brand interview
```

### 步骤 1：组装 prompt.md

<!-- @MX:WARN: [AUTO] prompt.md 模板 — 输出将被粘贴到外部 claude.com Design 会话中 -->
<!-- @MX:REASON: 对此模板的更改会影响用户粘贴到 claude.com 中的内容。结构变更可能会破坏用户的设计会话。修改前，请根据当前的 claude.com Design 提示词指南进行验证。 -->

`prompt.md` 必须严格遵循以下 5 节结构：

1. **目标** — 用 2-3 句话描述需要设计的内容、目标用户，以及精益画布 UVP 中排名前三的价值主张
2. **参考资料** — 提供 3-5 个现有产品的 URL 及其风格说明，并包含关键美学方向
3. **品牌语调** — 两个分支（brand_present 与 brand_absent），请参阅下方决策
4. **验收标准** — 简明列出不可协商的要求（5-8 项）
5. **范围之外** — 明确列出排除项（3-5 项）

#### 第 3 节 — 品牌语调决策树

- 分支 A（`brand_present = true`）：从 brand-voice.md 和 visual-identity.md 中提取品牌个性、语调指南、配色方案和字体规范
- 分支 B（`brand_present = false`）：输出 `## 3. Brand Voice (default — please customize)` 标题，并包含明确的占位内容以及编辑或运行品牌访谈的说明

有关逐字一致的章节模板，请参阅 [5 节提示词模板及品牌分支详情](references/prompt-template.md)。

#### prompt.md 中禁止出现的内容

[硬性要求] 以下内容绝不能出现在 prompt.md 中的任何位置：

- 对 `SPEC-` 标识符的引用（例如 `SPEC-AUTH-001`）
- 对 `.moai/` 路径的引用（例如 `.moai/brain/`、`.moai/project/`）
- 对智能体名称的引用（例如 `manager-brain`、`manager-spec`）
- 对 `IDEA-NNN` 标识符的引用
- 对 MoAI 专用命令的引用（例如 `/moai plan`、`/moai run`）
- 内部实现细节（文件结构、Go 代码、数据库模式）

提示词读起来必须像是由一位不了解 MoAI 内部结构的人类产品设计师撰写的。

### 第 2-5 步：辅助文件

| 步骤 | 文件 | 用途 |
|------|------|---------|
| 2 | references.md | 竞品分析 + 视觉灵感 + 用户体验模式参考（来自 research.md 的 Sources 部分的 3-5 个 URL）。当 URL 不足时，回退为说明性备注。 |
| 3 | acceptance.md | 无障碍性（WCAG 2.1 AA）、响应式设计（375/768/1280px）、品牌一致性、内容完整性、技术约束 |
| 4 | context.md | 扩展上下文——不得粘贴到 Claude Design 中。包含完整的精益画布摘要、SPEC 路线图、研究发现和品牌上下文 |
| 5 | checklist.md | 粘贴 prompt.md 前的人工自检：内容审查、MoAI 内部信息清理（自动验证）、范围验证、会话就绪检查 |

有关逐字一致的 references.md、acceptance.md、context.md 和 checklist.md 模板，请参阅[辅助文件模板](references/supporting-files.md)。

---

## 阶段 7 退出：AskUserQuestion

写入全部 5 个文件后，工作流必须调用 AskUserQuestion（预先加载 ToolSearch），并提供 3 个选项：

```
ToolSearch(query: "select:AskUserQuestion")
AskUserQuestion({
  questions: [{
    question: "핸드오프 패키지가 준비되었습니다. 다음 단계를 선택하세요.",
    header: "Brain Workflow 완료",
    options: [
      {
        label: "/moai project 실행 (권장)",
        description: "IDEA-NNN/proposal.md 기반으로 product.md, structure.md, tech.md 프로젝트 문서 생성. 이후 /moai plan으로 첫 SPEC 작성 가능."
      },
      {
        label: "수동 검토",
        description: "핸드오프 파일을 직접 검토하고 필요한 경우 편집. .moai/brain/IDEA-NNN/ 디렉토리를 확인하세요. 준비가 되면 /moai project --from-brain IDEA-NNN을 실행하세요."
      },
      {
        label: "핸드오프 패키지 재생성",
        description: "prompt.md 또는 다른 파일에 수정이 필요한 경우 어떤 부분을 변경할지 알려주세요. 해당 파일만 재생성합니다."
      }
    ]
  }]
})
```

当 conversation_language 不是韩语时，应相应翻译选项标签和描述。

---

## 可配合使用

- `moai-domain-ideation`：使用 ideation.md 和 proposal.md 作为主要输入
- `moai-domain-research`：从 research.md 的 Sources 部分提取参考 URL
- `moai-workflow-design`：用户完成外部 Claude Design 会话后，作为 `claude-design-handoff/` 目录的下游使用方（路径 A 处理器）
- `moai-workflow-brain`：通过 IDEA-NNN 目录管理来编排阶段 7 的执行

---

## 常见的自我辩解

| 自我辩解 | 实际情况 |
|----------------|---------|
| “在 prompt.md 中包含 SPEC-AUTH-001 有助于设计师理解范围” | prompt.md 是供 claude.com Design 使用的，而不是供 MoAI 使用的。SPEC ID 属于内部信息。请使用“范围之外”部分，以通俗的语言描述范围边界。 |
| “我应该跳过 checklist.md——内容显而易见” | checklist.md 可避免最常见的错误：粘贴包含占位符品牌语调的提示词。完成它只需 30 秒，并能避免一次糟糕的设计会话。 |
| “如果研究中没有 URL，references.md 就是可选的” | 始终需要生成 references.md。当 URL 很少时，请添加一条说明，要求用户自行补充。空白的参考资料文件不如包含说明的文件。 |
| “如果没有品牌信息，就跳过品牌语调部分” | 品牌语调部分始终存在。在缺少品牌信息的路径中，应生成一个带有说明的明确占位符——这比缺少该部分更清晰。 |

## 验证

- [ ] 已生成全部 5 个文件：prompt.md、context.md、references.md、acceptance.md、checklist.md
- [ ] prompt.md 恰好包含 5 个部分（目标、参考资料、品牌语调、验收标准、范围之外）
- [ ] prompt.md 不包含任何 SPEC- 标识符
- [ ] prompt.md 不包含任何 .moai/ 路径引用
- [ ] prompt.md 不包含任何 manager- 或 /moai 引用
- [ ] 缺少品牌信息的路径在 prompt.md 中包含“品牌语调（默认——请自定义）”标题
- [ ] context.md 包含说明，明确指出不得将其粘贴到 Claude Design 中
- [ ] 阶段 7 退出时调用 AskUserQuestion，并且恰好提供 3 个选项