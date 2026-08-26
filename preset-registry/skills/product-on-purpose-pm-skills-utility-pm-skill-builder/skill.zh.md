---
name: utility-pm-skill-builder
description: Guides contributors from a PM skill idea to a complete Skill Implementation Packet aligned with pm-skills conventions. Runs gap analysis, validates through a Why Gate, classifies by type and phase, generates draft files, and writes to a staging area for review before promotion.
license: Apache-2.0
metadata:
  classification: utility
  version: "1.0.0"
  updated: 2026-03-22
  category: coordination
  frameworks: [triple-diamond]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# PM 技能构建器

此技能用于为 pm-skills 库创建新的 PM 技能。它会生成一份
技能实现数据包：一份完整的设计文档，其中包含草稿文件，
存放在暂存区域中，供晋级到规范位置前进行审查。

## 适用场景

- 当你有一个新 PM 技能的想法时
- 当你想向 pm-skills 库添加领域技能（特定阶段）、基础技能
  （跨领域）或实用工具技能（元工具）时
- 当贡献者需要遵循仓库约定、在指导下创建技能时

## 不适用场景

- 修改现有技能 → 使用未来的验证/迭代工具（计划中）
- 为非 pm-skills 上下文创建技能 → 使用通用代理技能构建器（计划中）
- 创建工作流 → 工作流应直接编写，而不是通过此构建器创建

## 说明

当被要求创建新的 PM 技能时，请遵循以下步骤：

### 步骤 1：理解想法

接受以下任一种形式的想法：
- **问题优先**：“此技能解决什么 PM 问题？谁会遇到这个
  问题，以及他们目前会（或不会）产出什么？”
- **技能优先**：“描述你想创建的技能。它会产出什么工件？
  它支持什么 PM 活动？”

两种入口会产生相同的后续流程。如果用户提供了其中一种形式，
不要要求提供另一种形式——提取你所需的信息并继续。

如果想法较为模糊，询问一个后续问题，以在继续之前明确工件
类型和目标受众。

### 步骤 2：差距分析

检查所有现有技能是否存在重叠。使用下面的当前库参考
表，并扫描 `skills/` 目录以获取最新清单。

具体说明分析结果：
- 列出每个存在重叠的技能，并解释其涵盖范围
- 明确指出这个新技能将填补的具体差距
- 如果重叠程度较高，则触发“为什么”关卡（见下文）

**“为什么”关卡**（发现重叠时触发）：
询问用户：“请列出 2—3 个具体提示词或场景，在这些情况下现有
技能无法产出你所需要的结果。”

**终止关卡**：如果用户无法阐明令人信服的差距，则建议采取替代方案：
- “修改 [现有技能] 以覆盖此场景”
- “创建一个组合 [技能 A] + [技能 B] 的工作流”
- “添加命令变体，而不是创建新技能”
- “这是文档改进，而不是新技能”

除非有令人信服的差距证据或用户明确覆盖，否则不要越过终止关卡继续。

### 步骤 3：范围检查

评估这个想法应当对应一个技能，还是多个技能。

**拆分信号：**
- 这个想法会产出多个不同的工件类型
- 这个想法跨越 Triple Diamond 阶段（例如，发现 + 交付）
- 描述中自然地包含连接两项活动的“和”

如果需要拆分，请提出以下建议：
“这似乎涵盖了两个不同的 PM 活动：
  1. [活动 A] → 产出 [工件 A]
  2. [活动 B] → 产出 [工件 B]
将它们拆分为可以通过工作流串联的独立技能会更好。
你希望暂时只继续处理 [活动 A] 吗？”

### 第 4 步：分类 + 仓库适配

确定 skill 的分类和命名：

**领域 skills**（特定阶段的 PM 活动）：
- 阶段：discover | define | develop | deliver | measure | iterate
- 目录：`{phase}-{skill-name}`
- Frontmatter：`phase: {phase}`（必需），不得包含 `classification` 字段

**基础 skills**（跨阶段使用）：
- 无阶段
- 目录：`foundation-{skill-name}`
- Frontmatter：`classification: foundation`（必需），不得包含 `phase` 字段
- 使用场景：该 skill 同等适用于多个阶段

**实用工具 skills**（元技能、仓库工具）：
- 无阶段
- 目录：`utility-{skill-name}`
- Frontmatter：`classification: utility`（必需），不得包含 `phase` 字段
- 使用场景：该 skill 作用于仓库、工作流或其他 skills

**示例选择：**
确定 1-2 个在结构上最匹配的现有 skills：
- 相同阶段 > 相同类别 > 相似的产物类型
- 阅读其 `SKILL.md`，了解章节结构、指令风格、输出契约格式和质量检查清单模式
- 明确写出示例："参考 [skill] 建模 . 相同阶段，[category] 类别"

向用户展示分类和示例选择，以供确认。

### 第 5 步：生成 Skill 实现数据包

使用 `references/TEMPLATE.md` 作为格式，生成完整的数据包。
数据包包括：

1. **决策** . 建议 + Why Gate 证据（如适用）
2. **分类** . 类型、阶段（如为领域 skill）、类别、目录名称
3. **重叠分析** . 发现了什么，以及为什么仍然需要此 skill
4. **示例 Skills** . 参考了哪些现有 skills 建模，以及原因
5. **Draft Frontmatter** . 完整且有效的 YAML 块。Frontmatter 必须从文件的字节 0 处的 `---` 开始（前面不得有任何内容，包括 HTML 注释、BOM 或空白字符）。任何署名注释都必须放在结束的 `---` 围栏之后，绝不能放在之前。参考：`library/skill-output-samples/SAMPLE_CREATION.md` 第 5 节。
6. **Draft SKILL.md** . 完整内容（而非大纲），与示例的结构保持一致
7. **Draft TEMPLATE.md** . 包含指导性注释的章节标题
8. **Draft EXAMPLE.md** . 完整且真实的示例（150-300 行），包含具体的 PM 场景，填写每个章节，同时演示可选章节既填写又跳过的情况
9. **Draft Command** . 命令 frontmatter
10. **AGENTS.md Entry** . 要添加的确切文本
11. **Validation Checklist** . 针对草稿检查所有 CI 规则
12. **Next Steps** . 本地 CI、测试、贡献工作流

### 第 6 步：写入暂存区

将生成的所有文件写入暂存区：

```
_staging/pm-skill-builder/{skill-name}/
├── SKILL.md               ← draft skill file
├── references/
│   ├── TEMPLATE.md        ← draft template
│   └── EXAMPLE.md         ← draft example
└── command.md             ← draft command
```

> **注意**：`_staging/` 已被 gitignore 忽略 . 草稿产物不会随发布版本一起发布。
> 暂存目录会在晋升后被丢弃。

报告写入了什么内容以及写入位置。

### 第 7 步：推广（确认后）

询问：“请查看上面的数据包。准备好后，我会将文件推广到其规范位置。是否继续？[yes/no]”

如果回答 yes，则通过将每个文件从暂存位置复制到其规范路径来进行推广：

| 暂存文件 | 规范位置 |
|--------------|--------------------|
| `_staging/pm-skill-builder/{skill-name}/SKILL.md` | `skills/{dir-name}/SKILL.md` |
| `_staging/pm-skill-builder/{skill-name}/references/TEMPLATE.md` | `skills/{dir-name}/references/TEMPLATE.md` |
| `_staging/pm-skill-builder/{skill-name}/references/EXAMPLE.md` | `skills/{dir-name}/references/EXAMPLE.md` |
| `_staging/pm-skill-builder/{skill-name}/command.md` | `commands/{command-name}.md` |

其中，`{dir-name}` 是带有分类前缀的目录（例如：`deliver-change-communication`）。

然后：
1. 创建目标目录：`skills/{dir-name}/references/`
2. 将每个文件复制到其规范位置
3. 附加数据包中的 AGENTS.md 条目
4. 运行 CI 验证：`bash scripts/lint-skills-frontmatter.sh && bash scripts/validate-agents-md.sh && bash scripts/validate-commands.sh`
5. 如果验证通过，则删除暂存文件夹：`_staging/pm-skill-builder/{skill-name}/`
6. 如果验证失败，则报告错误并保留暂存内容，以便修复

设计依据记录在 GitHub issue、PR 或工作简报中，而不是永久性数据包文件中。

提供推广后的指导：
- “在本地运行 CI：`bash scripts/lint-skills-frontmatter.sh`”
- “测试该 skill：使用真实场景尝试 `/{command-name}`”
- “如果要贡献：使用 skill-proposal 模板创建 GitHub issue，然后提交 PR”

## 当前库参考

使用此表进行差距分析——它反映了当前的 skill 清单。
同时扫描 `skills/` 目录，以获取最新的权威数量。

### 领域 Skill（26 个）

| 阶段 | Skill | 类别 | 描述 |
|-------|-------|----------|-------------|
| discover | competitive-analysis | research | 结构化竞争格局分析 |
| discover | interview-synthesis | research | 用户研究访谈综合 |
| discover | stakeholder-summary | research | 利益相关者需求与影响力映射 |
| define | hypothesis | ideation | 包含成功指标的可测试假设 |
| define | jtbd-canvas | problem-framing | 待完成工作画布 |
| define | opportunity-tree | problem-framing | 机会解决方案树 |
| define | problem-statement | problem-framing | 包含成功标准的清晰问题陈述 |
| develop | adr | specification | 架构决策记录 |
| develop | design-rationale | specification | 设计决策依据 |
| develop | solution-brief | ideation | 一页式解决方案概述 |
| develop | spike-summary | coordination | 技术/设计 spike 结果 |
| deliver | acceptance-criteria | specification | Given/When/Then 验收标准 |
| deliver | edge-cases | specification | 边界情况与错误状态 |
| deliver | launch-checklist | coordination | 发布前检查清单 |
| deliver | prd | specification | 产品需求文档 |
| deliver | release-notes | coordination | 面向用户的发布说明 |
| deliver | user-stories | specification | 包含验收标准的用户故事 |
| measure | dashboard-requirements | validation | 分析仪表板规范 |
| measure | experiment-design | validation | A/B 测试或实验设计 |
| measure | experiment-results | reflection | 实验结果与经验总结 |
| measure | instrumentation-spec | validation | 事件追踪规范 |
| measure | okr-grader | reflection | 在 KR 层面对 OKR 周期结束进行评分 |
| iterate | lessons-log | reflection | 结构化经验总结 |
| iterate | pivot-decision | reflection | 转向或坚持决策 |
| iterate | refinement-notes | coordination | 待办事项细化结果 |
| iterate | retrospective | reflection | 团队回顾 |

### 基础技能（8）

| Skill | Category | Description |
|-------|----------|-------------|
| lean-canvas | problem-framing | 跨越九个相互关联模块的单页精益画布 |
| meeting-agenda | meeting | 面向参会者的会前议程 |
| meeting-brief | meeting | 私密的会前战略准备 |
| meeting-recap | meeting | 包含决策和行动事项的会后总结 |
| meeting-synthesize | meeting | 基于多份会议回顾的跨会议模式综合 |
| okr-writer | coordination | 结合辅导的基于成果的 OKR 集合编写 |
| persona | research | 经过证据校准的产品或营销角色画像 |
| stakeholder-update | meeting | 面向未参会者的异步利益相关者沟通 |

### 实用技能（6）

| Skill | Category | Description |
|-------|----------|-------------|
| mermaid-diagrams | documentation | 带语法验证的 Mermaid 图表编写 |
| pm-skill-builder | coordination | 此技能 |
| pm-skill-iterate | coordination | 针对现有技能的定向改进 |
| pm-skill-validate | coordination | 根据结构约定和质量标准审计技能 |
| slideshow-creator | communication | 跨 18 种幻灯片类型的 JSON 规范演示文稿生成 |
| update-pm-skills | coordination | 在本地检查并应用 pm-skills 发布版本 |

## 输出契约

构建器 MUST 为新技能生成草稿文件：
- `SKILL.md` . 完整的技能说明
- `references/TEMPLATE.md` . 带指导性注释的输出模板
- `references/EXAMPLE.md` . 完整的演示示例（150-300 行）
- `command.md` . 斜杠命令文件

所有草稿都写入 `_staging/pm-skill-builder/{skill-name}/`（已被 gitignore）。

升级时，文件会被复制到规范位置，AGENTS.md 会被更新，并且暂存文件夹会被删除。

## 质量检查清单

在最终确定数据包之前，验证以下两个层级中的所有项目：

### CI 验证（必须通过）
- [ ] `name` 与目录名称匹配
- [ ] 描述为 20-100 个单词（单行，不使用多行 YAML）
- [ ] `version`、`updated`、`license` 均存在
- [ ] 分类正确（领域 → `phase:`，基础/实用 → `classification:`）
- [ ] 目录名称遵循约定：`{phase/classification}-{skill-name}`
- [ ] TEMPLATE.md 至少包含 3 个 `##` 部分
- [ ] 命令文件引用正确的技能路径
- [ ] AGENTS.md 条目使用 `####` + `**Path:**` 格式

### 质量检查（应通过）
- [ ] 已检查所有现有技能的差距分析（而不仅是同一阶段的技能）
- [ ] Why Gate 证据具体明确（点出提示词/场景，而不是含糊其辞）
- [ ] EXAMPLE.md 是完整产物（150-300 行），而非大纲
- [ ] 输出契约已包含在草稿 SKILL.md 中
- [ ] 质量检查清单已包含在草稿 SKILL.md 中

## 示例

参见 `references/EXAMPLE.md`，其中包含一个已完成的技能实现数据包，演示了真实的领域技能创建。