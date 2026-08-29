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
# 技能创建器

创建、评估并迭代高质量的智能体技能。此技能指导整个生命周期：规划技能应完成的任务、编写 SKILL.md 和参考文件、根据评分标准评估质量，并持续迭代，直到技能达到生产标准。

**理念：** 优秀的技能并不在于篇幅长，而在于*精准*：触发条件详尽、默认行为明确、步骤清晰且设有退出门槛，通过参考文件延后处理复杂性，并使用结构化的输出模板。

**核心规则——始终动态调用，绝不静态调用：** 技能**必须**在运行时检测可用的工具、库和身份验证信息，并据此调整行为。绝不要硬编码单一方法。始终提供包含决策树和回退路径的检测流程。完整模式目录请参阅 `references/dynamic-calling.md`。

---

## 第 1 步：了解用户的需求

将请求归类为以下模式之一：

| 用户意图 | 模式 | 跳转至 |
|---|---|---|
| 创建全新的技能 | **创建** | 第 2 步 |
| 改进 / 修复现有技能 | **改进** | 第 6 步 |
| 评估 / 评分技能质量 | **评估** | 第 7 步 |

如果意图不明确，请询问：“您想创建新技能、改进现有技能，还是评估某个技能？”

### 收集需求（针对创建模式）

在编写任何内容之前，回答以下问题（如果不清楚，请询问用户）：

| 问题 | 重要性 |
|---|---|
| 该技能要自动化什么任务？ | 确定核心工作流 |
| 目标用户是谁？ | 决定复杂程度和术语层级 |
| 它使用哪些工具 / API / CLI？ | 确定依赖项和平台限制 |
| 用户提供什么输入？ | 定义参数和默认值 |
| 输出应是什么样？ | 定义响应模板 |
| 是否需要 API 密钥或凭据？ | 确定 `required_environment_variables` |
| 应在 Claude.ai 上运行，还是仅限 CLI？ | 确定平台字段和动态命令 |

---

## 第 2 步：规划技能架构

在编写 SKILL.md 之前，规划其结构。有关每种模式的详细指导，请阅读 `references/architecture-patterns.md`。

### 选择结构模式

| 模式 | 适用场景 | 步骤数 | 示例 |
|---|---|---|---|
| **线性** | 单一工作流，无分支 | 5-7 | earnings-preview、etf-premium |
| **路由器** | 一个总主题下包含多个子任务 | 3 + 子技能 | stock-correlation（4 个子技能） |
| **方法论** | 具有顺序门槛的复杂领域框架 | 7-9 | sepa-strategy（9 步交易方法论） |
| **组件** | 生成交互式 UI 输出 | 4-5 | options-payoff（提取 + 计算 + 渲染） |
| **API 封装器** | 封装具有多个端点的外部 API | 3-5 + 大量参考文件 | fintel-data（6 个步骤，1 个参考文件） |

### 规划步骤大纲

在编写内容之前，先写出步骤名称。每个技能都应包含：

1. **检测流程**（第 1 步）——动态检测可用工具、身份验证状态和运行时环境；构建决策树，以确定应使用哪种方法
2. **核心方法论**（第 2-N 步）——执行实际工作，并设置通过 / 失败门槛；每个调用外部工具的步骤都应根据第 1 步的检测结果提供可选方法
3. **响应用户**（最后一步）——结构化的输出模板

目标总步数为 **5-9 步**。超过 9 步意味着该 skill 应拆分，或使用路由器模式。

### 规划检测流程

所有涉及外部工具的 skill 都 MUST 以运行时检测流程开始。阅读 `references/dynamic-calling.md` 了解所有模式。检测流程需要回答：

| 问题 | 检测方式 | 决策 |
|---|---|---|
| CLI 工具是否已安装？ | `command -v tool` | CLI 路径还是 Python 回退路径 |
| 用户是否已完成身份验证？ | `tool auth status` / `echo $API_KEY` | 跳过身份验证设置，还是引导用户完成设置 |
| 哪个运行时包含该库？ | 在终端中执行 `import lib`，还是使用 execute_code | 路由到正确的运行时 |
| 是否有功能更丰富的工具可用？ | `gh --version` vs `git --version` | 采用功能丰富的路径，还是最小功能路径 |
| 是否可以访问实时数据？ | `curl -s endpoint` | 使用实时数据，还是缓存数据/默认数据 |

检测输出会传递给一个**决策树**，skill 的其余部分将遵循该决策树。绝不要假设——始终进行检查。

### 规划参考文件

决定哪些内容放入 SKILL.md，哪些内容放入 references/：

| SKILL.md 中（约 250 行以内） | references/ 中 |
|---|---|
| 分步工作流 | 详细的 API 文档 |
| 路由/决策表 | 代码模板（超过 20 行） |
| 参数默认值表 | 公式和边界情况 |
| 输出格式模板 | 故障排除数据库 |
| 快速示例（1-3 个） | 完整示例（4 个以上） |

---

## 第 3 步：编写 SKILL.md

阅读 `references/writing-guide.md`，了解编写各个部分的详细说明。阅读 `references/frontmatter-guide.md`，了解完整的 YAML 字段参考。

### 关键规则

1. **Frontmatter 优先**：必须包含 `name`（小写连字符格式，最多 64 个字符）和 `description`（完整的触发条件列表，最多 1024 个字符）。描述需要包含至少 5 个触发条件，其中包括侧向入口点。

2. **第 1 步 = 检测流程**：使用带回退方案的 `!`command`` 来检测可用工具、身份验证状态和运行时。构建包含多种方法路径的决策树（例如，优先使用 CLI，其次使用 Python 回退方案，最后使用内置工具）。绝不要将单一工具硬编码——始终进行检测并适配。参阅 `references/dynamic-calling.md`。

3. **带有方法替代方案的核心步骤**：每个调用外部工具的步骤都应根据第 1 步的检测结果提供至少 2 条路径。使用以下模式：“如果检测到 `TOOL_A` → 方法 1，否则 → 方法 2。”每个步骤都应使用 `## Step N: [Verb] [Object]`，在需要路由时添加决策表，在需要评估时添加通过/失败门槛，并提供指向深入内容的参考文件链接。

4. **默认值表**：每个参数都 MUST 具有明确的默认值。任何 skill 都不应因等待输入而停滞。

5. **最后一步 = 输出模板**：为每个输出部分编号。明确指定每个部分应包含哪些数据。如果涉及评估，还应包含结论/等级系统。

参阅 `references/skill-examples.md`，了解各模式的带注释示例。

---

## 第 4 步：编写参考文件

阅读 `references/writing-guide.md`，了解完整的参考文件编写指南。

### 关键规则

1. **命名**：使用 `lowercase-hyphenated.md`，每个概念集群使用一个文件
2. **大小**：快速查阅文件为 50-150 行，深入指南为 150-400 行，目录为 400-900 行
3. **结构**：H1 标题、H2 小节、代码块、表格，末尾附带边界情况部分
4. **链接**：在 SKILL.md 步骤中使用反引号包裹的路径，并在末尾添加 `## Reference Files` 部分

---

## 步骤 5：交付前质量检查

按照 `references/quality-rubric.md` 中的质量评估标准检查该 skill。为每个维度评分。

### 快速检查清单

- [ ] Frontmatter 包含 `name` 和 `description`（两者均为必需项）
- [ ] Description 包含 5 个以上不同的触发短语
- [ ] Description 包含侧向入口
- [ ] SKILL.md 少于 300 行（理想情况下少于 250 行）
- [ ] 每个参数都有明确的默认值
- [ ] 步骤已编号（## Step N: ...）
- [ ] 每个步骤都有明确的退出条件或交付物
- [ ] 最后一步规定了包含编号部分的确切输出结构
- [ ] 复杂内容位于参考文件中，而不是内联
- [ ] 参考文件指针使用反引号路径
- [ ] 第 1 步包含使用 `!`command`` 检查和回退方案（`|| echo "..."`）的检测流程
- [ ] 检测流程生成包含 2 条以上方法路径的决策树
- [ ] 核心步骤根据检测结果调整行为（而不是硬编码为使用某个工具）
- [ ] 将独立的运行时视为独立环境（terminal 与 execute_code）
- [ ] 在适当位置包含法律/伦理免责声明
- [ ] 不包含会过时的硬编码 ticker 列表、工具路径或静态数据

如果任何一项未通过，请在交付给用户前修复。

---

## 步骤 6：改进现有 Skill

当用户要求改进一个 skill 时：

### 6a：读取当前 Skill

使用 `skill_view(name)` 加载 skill，或直接读取 SKILL.md。同时读取所有参考文件。

### 6b：根据评估标准评分

使用 `references/quality-rubric.md` 中的质量评估标准。向用户展示评分明细：

| 维度 | 分数 | 问题 |
|---|---|---|
| 触发质量 | 6/10 | 缺少面向初学者的措辞 |
| 默认值覆盖率 | 3/10 | 没有默认值表 |
| 步骤结构 | 8/10 | 结构良好，但第 3 步缺少退出门槛 |
| 输出模板 | 4/10 | “总结结果”的表述含糊 |
| 参考文件使用 | 7/10 | 拆分良好，但缺少故障排除内容 |

### 6c：提出具体改进建议

按影响程度列出具体变更：

1. [最高影响] 添加包含 8 个以上参数的默认值表
2. [高影响] 使用 10 个以上触发短语重写 description
3. [中等影响] 为最后一步添加结构化输出模板
4. ...

### 6d：应用变更

获得用户批准后，编辑 skill。针对定向变更使用 `skill_manage(action='patch', ...)`，完整重写使用 `skill_manage(action='edit', ...)`。

---

## 步骤 7：评估 Skill

当用户要求评估或为一个 skill 打分时：

### 7a：加载并分析

读取完整的 SKILL.md 和所有参考文件。统计行数、步骤、触发短语、默认值和参考文件。

### 7b：根据评估标准评分

使用 `references/quality-rubric.md` 中的完整评估标准，为 10 个维度分别按 1–10 分评分。

### 7c：展示评分卡

```
## Skill Quality Scorecard: [skill-name]

| # | Dimension | Score | Notes |
|---|---|---|---|
| 1 | Trigger quality | 8/10 | 12 triggers, includes sideways entries |
| 2 | Defaults coverage | 9/10 | All 11 parameters have defaults |
| 3 | Step architecture | 8/10 | 5 clear steps with gates |
| 4 | Reference file strategy | 7/10 | 2 files, could use troubleshooting |
| 5 | Dynamic content | 10/10 | Dep check + live data injection |
| 6 | Output template | 9/10 | 5 numbered sections + verdict |
| 7 | Error handling | 6/10 | Missing data handling unclear |
| 8 | Code/formula quality | 8/10 | Working JS, copy-paste ready |
| 9 | SKILL.md conciseness | 7/10 | 196 lines, well within target |
| 10 | Domain accuracy | 9/10 | BS formulas correct, edge cases covered |

**Overall: 81/100** -- Production quality

### Top 3 Improvements
1. ...
2. ...
3. ...
```

### 基准参考

作为参考，以下是此仓库中已知高质量 skill 的评分：

| Skill | 评分 | 原因 |
|---|---|---|
| sepa-strategy | ~90/100 | 9 个步骤、7 个参考文件、详尽的触发条件、结构化结论 |
| options-payoff | ~85/100 | 强大的默认设置、可运行的代码、实时数据、整洁的输出 |
| stock-correlation | ~80/100 | Router 模式、4 个子 skill、良好的默认设置 |

---

## 第 8 步：响应用户

### 创建模式

交付：
1. 完整的 SKILL.md 内容
2. 所有参考文件
3. skill 目录中的 README.md
4. 质量评分表（来自第 5 步）
5. 建议的后续步骤（测试、迭代、发布）

### 改进模式

交付：
1. 改进前后的质量评分
2. 所做更改的摘要
3. 剩余的改进机会

### 评估模式

交付：
1. 完整的质量评分表
2. 与基准 skill 的比较
3. 按优先级排列的改进列表

---

## 参考文件

- `references/dynamic-calling.md` -- **核心参考资料**：检测流程、决策树、方法回退、运行时感知，以及多工具适配模式，并附有来自生产环境 skill 的注释示例
- `references/writing-guide.md` -- 编写 SKILL.md 各部分、环境检查、默认设置表格、输出模板和参考文件的详细说明
- `references/architecture-patterns.md` -- Linear、Router、Methodology、Widget 和 API Wrapper 模式，以及示例和反模式
- `references/frontmatter-guide.md` -- 完整的 YAML frontmatter 字段参考（name、description、platform、env vars、config、credentials）
- `references/quality-rubric.md` -- 包含 10 个维度、1-10 分制、基准分数和评分解读的评分标准
- `references/skill-examples.md` -- 顶级 skill 的注释摘录，展示特定模式为何有效