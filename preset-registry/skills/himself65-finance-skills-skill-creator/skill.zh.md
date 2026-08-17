---
name: skill-creator
description: >
  Create new skills, modify and improve existing skills, and measure skill performance.
  Use when users want to create a skill from scratch, update or optimize an existing skill,
  run evals to test a skill, benchmark skill performance with variance analysis, or iterate
  on skill quality. Triggers: "create a skill", "make a new skill", "build a skill for",
  "write a skill that", "skill for doing X", "I want a skill to", "new skill", "design a skill",
  "scaffold a skill", "improve this skill", "optimize this skill", "this skill isn't working well",
  "evaluate this skill", "score this skill", "how good is this skill", "run evals on",
  "benchmark this skill", "test this skill's quality", "skill quality", "skill performance".
  Also triggers when a user describes a repeatable workflow they want to automate, says
  "I keep doing X manually", "can you remember how to do X", or "turn this into a skill".
---
# Skill 创建器

创建、评估并迭代高质量的智能体 Skill。本 Skill 覆盖完整生命周期：规划 Skill 应实现的功能、编写 SKILL.md 和参考文件、根据评分标准评估质量，以及持续迭代直至 Skill 达到生产标准。

**理念：**优秀的 Skill 并不在于篇幅长，而在于*精准*：触发条件完备、默认值明确、步骤清晰且设有退出门槛、通过参考文件延后处理复杂内容，并提供结构化的输出模板。

**核心规则——始终动态，绝不静态：**Skill 必须在运行时检测可用的工具、库和身份验证，并据此调整其行为。绝不要硬编码单一方法。始终提供包含决策树和回退路径的检测流程。完整模式目录请参阅 `references/dynamic-calling.md`。

---

## 步骤 1：了解用户的需求

将请求归入以下模式之一：

| 用户意图 | 模式 | 跳转至 |
|---|---|---|
| 创建全新的 Skill | **创建** | 步骤 2 |
| 改进／修复现有 Skill | **改进** | 步骤 6 |
| 评估／衡量 Skill 的质量 | **评估** | 步骤 7 |

如果意图不明确，请询问：“你想创建一个新的 Skill、改进现有 Skill，还是评估某个 Skill？”

### 收集需求（适用于创建模式）

在开始编写任何内容之前，先回答以下问题（如不明确，请询问用户）：

| 问题 | 重要性 |
|---|---|
| 该 Skill 自动执行什么任务？ | 确定核心工作流 |
| 目标用户是谁？ | 决定复杂度和术语层级 |
| 它使用哪些工具/API/CLI？ | 决定依赖项和平台限制 |
| 用户提供哪些输入？ | 确定参数和默认值 |
| 输出应采用什么形式？ | 确定响应模板 |
| 是否需要 API 密钥或凭据？ | 决定 `required_environment_variables` |
| 它应在 Claude.ai 上运行，还是仅支持 CLI？ | 决定平台字段和动态命令 |

---

## 步骤 2：规划 Skill 架构

在编写 SKILL.md 之前，先规划结构。有关每种模式的详细指导，请阅读 `references/architecture-patterns.md`。

### 选择结构模式

| 模式 | 适用场景 | 步骤数 | 示例 |
|---|---|---|---|
| **线性** | 单一工作流，无分支 | 5-7 | earnings-preview、etf-premium |
| **路由器** | 一个主题下包含多个子任务 | 3 + 子 Skill | stock-correlation（4 个子 Skill） |
| **方法论** | 具有连续门槛的复杂领域框架 | 7-9 | sepa-strategy（9 步交易方法论） |
| **组件** | 生成交互式 UI 输出 | 4-5 | options-payoff（提取 + 计算 + 渲染） |
| **API 封装器** | 封装包含大量端点的外部 API | 3-5 + 大量参考文件 | funda-data（5 个步骤，8 个参考文件） |

### 规划步骤大纲

在编写内容之前，先列出步骤名称。每个 Skill 都应包含：

1. **检测流程**（步骤 1）——动态检测可用工具、身份验证状态和运行时环境；构建决策树以确定要使用的方法
2. **核心方法论**（步骤 2-N）——执行实际工作，并设置通过／失败门槛；调用外部工具的每个步骤都应根据步骤 1 的检测结果提供备选方法
3. **回复用户**（最后一步）——结构化输出模板

总步骤数以 **5-9 步**为目标。超过 9 步意味着应拆分该技能，或使用路由器模式。

### 规划检测流程

任何涉及外部工具的技能都必须以运行时检测流程开始。阅读 `references/dynamic-calling.md` 了解所有模式。检测流程需要回答：

| 问题 | 如何检测 | 决策 |
|---|---|---|
| 是否已安装 CLI 工具？ | `command -v tool` | CLI 路径或 Python 回退方案 |
| 用户是否已通过身份验证？ | `tool auth status` / `echo $API_KEY` | 跳过身份验证设置，或引导用户完成设置 |
| 哪个运行时中安装了该库？ | 在终端中执行 `import lib`，或使用 execute_code | 路由到正确的运行时 |
| 是否有功能更丰富的工具可用？ | `gh --version` 与 `git --version` | 功能丰富的路径或最小化路径 |
| 是否可以访问实时数据？ | `curl -s endpoint` | 实时数据或缓存/默认数据 |

检测结果将作为该技能后续步骤所遵循的**决策树**的输入。绝不假设——始终进行检查。

### 规划参考文件

确定哪些内容应放入 SKILL.md，哪些内容应放入 references/：

| SKILL.md 中的内容（不超过约 250 行） | references/ 中的内容 |
|---|---|
| 分步工作流 | 详细的 API 文档 |
| 路由/决策表 | 代码模板（超过 20 行） |
| 参数默认值表 | 公式和边界情况 |
| 输出格式模板 | 故障排除数据库 |
| 快速示例（1-3 个） | 综合示例（4 个以上） |

---

## 第 3 步：编写 SKILL.md

阅读 `references/writing-guide.md`，了解编写各部分的详细说明。阅读 `references/frontmatter-guide.md`，查看完整的 YAML 字段参考。

### 关键规则

1. **Frontmatter 优先**：必须包含 `name`（小写、连字符分隔，最多 64 个字符）和 `description`（详尽的触发条件列表，最多 1024 个字符）。描述需要包含 5 个以上的触发条件，其中包括间接切入点。

2. **第 1 步 = 检测流程**：使用带回退方案的 !`command`` 来检测可用工具、身份验证状态和运行时。构建包含多种方法路径的决策树（例如，首选 CLI、Python 作为回退方案、内置工具作为最后手段）。绝不要硬编码单一工具——始终进行检测并自适应。参见 `references/dynamic-calling.md`。

3. **核心步骤包含替代方法**：调用外部工具的每个步骤都应根据第 1 步的检测结果提供至少 2 条路径。使用以下模式：“如果检测到 `TOOL_A` → 方法 1，否则 → 方法 2。”每个步骤都应使用 `## Step N: [Verb] [Object]`，如需路由则提供决策表，如属评估步骤则提供通过/失败关卡，并为深入内容提供参考文件指针。

4. **默认值表**：每个参数都必须有明确的默认值。任何技能都不应因等待输入而停滞。

5. **最后一步 = 输出模板**：为每个输出部分编号。明确指定每个部分应包含哪些数据。如果属于评估型技能，则应包含裁定/评级系统。

参见 `references/skill-examples.md`，查看每种模式带注释的示例。

---

## 第 4 步：编写参考文件

阅读 `references/writing-guide.md`，查看完整的参考文件编写指南。

### 关键规则

1. **命名**：`lowercase-hyphenated.md`，每个概念集群对应一个文件
2. **大小**：快速查阅文件 50-150 行，深度指南 150-400 行，目录型文件 400-900 行
3. **结构**：H1 标题、H2 小节、代码块、表格，并在末尾提供边界情况小节
4. **链接**：在 SKILL.md 的步骤中使用反引号路径，并在末尾添加 `## Reference Files` 小节

---

## 步骤 5：交付前的质量检查

根据 `references/quality-rubric.md` 中的质量评分标准检查该技能。为每个维度评分。

### 快速检查清单

- [ ] Frontmatter 包含 `name` 和 `description`（两者均为必填项）
- [ ] 描述中包含 5 个以上不同的触发短语
- [ ] 描述中包含侧向切入点
- [ ] SKILL.md 不超过 300 行（最好不超过 250 行）
- [ ] 每个参数都有明确的默认值
- [ ] 步骤已编号（## Step N: ...）
- [ ] 每个步骤都有明确的退出条件或交付物
- [ ] 最后一步使用编号章节明确规定具体的输出结构
- [ ] 复杂内容位于参考文件中，而不是内联在正文中
- [ ] 参考文件指针使用反引号路径
- [ ] 步骤 1 包含检测流程，其中有 `!`command`` 检查和回退机制（`|| echo "..."`）
- [ ] 检测流程会生成包含 2 条以上方法路径的决策树
- [ ] 核心步骤根据检测结果调整行为（而不是硬编码为使用某一种工具）
- [ ] 将不同的运行时视为不同的环境（终端与 execute_code）
- [ ] 在适当情况下包含法律/伦理免责声明
- [ ] 不包含会过时的硬编码股票代码列表、工具路径或静态数据

如果有任何一项未通过，请先修复再交付给用户。

---

## 步骤 6：改进现有技能

当用户要求改进某个技能时：

### 6a：读取当前技能

使用 `skill_view(name)` 加载该技能，或直接读取 SKILL.md。同时读取所有参考文件。

### 6b：根据评分标准评分

使用 `references/quality-rubric.md` 中的质量评分标准。向用户展示各项得分明细：

| 维度 | 得分 | 问题 |
|---|---|---|
| 触发质量 | 6/10 | 缺少初学者用语 |
| 默认值覆盖率 | 3/10 | 没有默认值表 |
| 步骤结构 | 8/10 | 整体良好，但步骤 3 缺少退出关卡 |
| 输出模板 | 4/10 | “总结结果”表述含糊 |
| 参考文件使用 | 7/10 | 拆分合理，但缺少故障排除内容 |

### 6c：提出具体改进建议

按影响程度列出具体变更：

1. [影响最高] 添加包含 8 个以上参数的默认值表
2. [影响较高] 重写描述，加入 10 个以上触发短语
3. [影响中等] 在最后一步添加结构化输出模板
4. ...

### 6d：应用更改

获得用户批准后，编辑该技能。对于局部更改，使用 `skill_manage(action='patch', ...)`；对于完整重写，使用 `skill_manage(action='edit', ...)`。

---

## 步骤 7：评估技能

当用户要求评估技能或为技能评分时：

### 7a：加载并分析

读取完整的 SKILL.md 和所有参考文件。统计行数、步骤数、触发短语数、默认值数和参考文件数。

### 7b：根据评分标准评分

使用 `references/quality-rubric.md` 中的综合评分标准。按 1-10 分制为 10 个维度逐一评分。

### 7c：展示评分卡

```
## 技能质量评分卡：[skill-name]

| # | 维度 | 得分 | 备注 |
|---|---|---|---|
| 1 | 触发质量 | 8/10 | 12 个触发短语，包括侧向切入点 |
| 2 | 默认值覆盖率 | 9/10 | 全部 11 个参数均有默认值 |
| 3 | 步骤架构 | 8/10 | 5 个清晰且带有关卡的步骤 |
| 4 | 参考文件策略 | 7/10 | 2 个文件，可以增加故障排除内容 |
| 5 | 动态内容 | 10/10 | 依赖项检查 + 实时数据注入 |
| 6 | 输出模板 | 9/10 | 5 个编号章节 + 结论 |
| 7 | 错误处理 | 6/10 | 缺少数据时的处理方式不明确 |
| 8 | 代码/公式质量 | 8/10 | 可正常运行的 JS，可直接复制粘贴 |
| 9 | SKILL.md 简洁性 | 7/10 | 196 行，完全在目标范围内 |
| 10 | 领域准确性 | 9/10 | BS 公式正确，涵盖边界情况 |

**总分：81/100** -- 生产级质量

### 最重要的 3 项改进
1. ...
2. ...
3. ...
```

### 基准参考

作为参考，以下是此仓库中已知高质量技能的评分：

| 技能 | 评分 | 原因 |
|---|---|---|
| sepa-strategy | ~90/100 | 9 个步骤、7 个参考文件、详尽的触发条件、结构化的结论 |
| options-payoff | ~85/100 | 强大的默认设置、可运行的代码、实时数据、简洁的输出 |
| stock-correlation | ~80/100 | 路由器模式、4 个子技能、良好的默认设置 |

---

## 步骤 8：回应用户

### 对于创建模式

交付：
1. 完整的 SKILL.md 内容
2. 所有参考文件
3. 技能目录的 README.md
4. 质量评分卡（来自步骤 5）
5. 建议的后续步骤（测试、迭代、发布）

### 对于改进模式

交付：
1. 改进前后的质量评分
2. 所做更改的摘要
3. 剩余的改进机会

### 对于评估模式

交付：
1. 完整的质量评分卡
2. 与基准技能的对比
3. 按优先级排序的改进列表

---

## 参考文件

- `references/dynamic-calling.md` -- **核心参考**：检测流程、决策树、方法回退、运行时感知，以及包含生产环境技能注释示例的多工具适配模式
- `references/writing-guide.md` -- 编写 SKILL.md 各章节、环境检查、默认值表格、输出模板和参考文件的详细说明
- `references/architecture-patterns.md` -- 线性、路由器、方法论、微件和 API 包装器模式，包含示例和反模式
- `references/frontmatter-guide.md` -- 完整的 YAML 前置元数据字段参考（name、description、platform、env vars、config、credentials）
- `references/quality-rubric.md` -- 10 个维度的评分标准，包含 1-10 分量表、基准评分和分数解读
- `references/skill-examples.md` -- 顶级技能的带注释摘录，说明特定模式为何有效