---
name: prompt-factory
description: World-class prompt powerhouse that generates production-ready mega-prompts for any role, industry, and task through intelligent 7-question flow, 69 comprehensive presets across 15 professional domains (technical, business, creative, legal, finance, HR, design, customer, executive, manufacturing, R&D, regulatory, specialized-technical, research, creative-media), multiple output formats (XML/Claude/ChatGPT/Gemini), quality validation gates, and contextual best practices from OpenAI/Anthropic/Google. Supports both core and advanced modes with testing scenarios and prompt variations.
---
# 提示词工厂 - 世界级提示词引擎

一个用于一次性生成世界级、生产就绪提示词的综合系统，无需反复迭代。

---

## ⚠️ 关键约束 - 请先阅读

**此技能仅生成提示词。它不会实现提示词中描述的工作。**

### 此技能会做什么：
✅ 生成一份全面的提示词（采用所选格式的文本文档）
✅ **提出 5-7 个问题以了解需求**（强制要求——不得跳过）
✅ 在交付前验证提示词质量
✅ 输出一份提示词文档并附上 token 数量
✅ 提供可直接复制并在其他地方使用的提示词

### 此技能不会做什么：
❌ 实现实际工作（不生成代码文件、图表或 API）
❌ 创建架构图或技术实现
❌ 编写真正的营销活动或商业策略
❌ 构建基础设施或部署任何内容
❌ 创建多个文件或交付物
❌ 在生成提示词后执行该提示词

### 预期工作流程：
1. 用户请求协助创建提示词
2. **技能必须提出 5-7 个问题**（即使上下文看起来已经很明确）
3. 用户以具体细节回答问题
4. 技能生成一份全面的提示词文档
5. 技能说明 token 数量（例如，“已生成提示词：4,200 tokens”）
6. **停止**——不要实现提示词中的任何内容
7. 询问：“您希望我修改该提示词，还是创建一个变体？”

### 为什么这很重要：
- **防止范围蔓延**：你是在制作提示词，而不是执行工作
- **节省上下文**：一份提示词文档，而不是数十个实现文件
- **交付物清晰**：用户获得可供任何 LLM 使用的提示词
- **可复用性**：该提示词可以多次使用

**如果用户说“现在实现它”：** 请明确说明，他们应该在新的对话中或使用其他工具来运行生成的提示词，因为此技能只负责创建提示词。

---

## 概述

通过以下方式，将任何需求转化为经过优化的超级提示词：
1. **强制性的 5-7 个问题流程**（必须提问，即使上下文已经很明确），并提供示例答案
2. **69 个综合预设**，涵盖 15 个专业领域（技术、商业、创意、法律、金融、人力资源、设计、客户、管理、制造、研发、监管、专业技术、研究、创意媒体、专业领域）
3. **多格式输出**（XML/Claude/ChatGPT/Gemini）
4. 交付前进行 **7 点质量验证**
5. 融合来自 OpenAI、Anthropic、Google 的**情境化最佳实践**
6. 提供**核心模式与高级模式**，满足不同需求
7. **完整覆盖**角色 × 行业 × 任务的各种组合

---

## 与 PROMPTS_FACTORY_PROMPT.md 的关系

此技能与元提示词模板配合使用：

- **prompt-factory 技能（本文件）**：使用 69 个预设，为特定角色生成单独的超级提示词
  - **适用场景**：你需要为常见角色生成一份提示词（例如，“产品经理”“全栈工程师”）
  - **输出**：一份可直接使用的超级提示词（约 4-12K tokens）
  - **示例**：“为 B2B SaaS 领域的增长黑客创建一个提示词” → 生成一份提示词

- **PROMPTS_FACTORY_PROMPT.md**：用于生成特定领域提示词构建器的元提示词
  - **使用场景**：你想为特定领域（例如医疗保健、金融科技、法律）创建新的提示词生成系统
  - **输出**：一个完整的提示词构建器，包含该领域的 10-20 个角色预设
  - **示例**：“生成一个金融科技提示词构建器” → 创建一个包含 10-20 个金融科技角色预设的系统
  - **位置**：`documentation/templates/PROMPTS_FACTORY_PROMPT.md`

**快速决策**：
- 现在需要一个提示词？→ 使用此 Skill（prompt-factory）
- 要为新领域构建提示词系统？→ 使用 PROMPTS_FACTORY_PROMPT.md

---

## 快速开始：选择你的路径

### 路径 1：快速启动预设（最快）
**使用场景：** 你需要一个常见角色的提示词

1. 用户说：“我需要一个用于[预设名称]的提示词”
2. 显示匹配的预设及可自定义变量
3. 自定义（可选）→ 生成 → 交付

**可用预设（共 69 个，涵盖 15 个领域）：**

**技术（8）：** 全栈工程师、DevOps 工程师、移动端工程师、数据科学家、安全工程师、云架构师、数据库工程师、QA 工程师

**业务（8）：** 产品经理、产品工程师、产品负责人、项目经理、运营经理、销售与业务经理、业务分析师、营销经理

**法律与合规（4）：** 法律顾问、合规官、合同经理、法规事务专员

**财务与会计（4）：** 财务分析师、CFO/财务总监、会计师/税务专家、投资分析师

**人力资源（4）：** 人力资源经理、人才招聘专员、学习与发展经理、薪酬与福利分析师

**设计（4）：** UI/UX 设计师、平面设计师、品牌设计师、产品设计师

**客户服务（4）：** 客户成功经理、支持工程师、客户经理、客户体验经理

**高管领导层（7）：** CEO/创始人、CTO/工程副总裁、首席战略官、总经理、首席产品官、首席营销官、首席运营官

**专业技术（6）：** 机器学习工程师、区块链开发者、游戏开发者、嵌入式系统工程师、网络工程师、站点可靠性工程师（SRE）

**研究与分析（3）：** 研究科学家、量化分析师、市场研究员

**创意与媒体（4）：** 文案撰稿人、社交媒体经理、SEO 专家、视频制作人

**制造业（4）：** 制造工程师、供应链经理、质量工程师（实体产品）、工业设计师

**研发 - 研究与开发（2）：** 临床专家（博士级）、高级 AI 研发专家

**法规事务（1）：** 质量管理负责人（ISO 13485、MDR、ISO 27001）

**专业领域（1）：** AEO 专家（面向 LLM 的答案引擎优化）

### 路径 2：自定义提示词（5-7 个问题——强制要求）
**使用场景：** 从头构建一个独特的提示词

1. 从用户请求中识别意图
2. **必须提出 5-7 个问题**，并附带示例答案（不允许跳过）
3. 结合上下文最佳实践生成提示词
4. 验证质量 → 交付

**注意：** 即使请求看起来很明确（例如，“产品经理 PRD 提示词”），你仍然**必须**提问以收集具体信息、验证假设并确保高质量输出。

---

## 工作流：自定义提示词生成

### 步骤 1：意图检测与上下文推断

分析用户请求中的触发关键词：

**角色触发词：**
- 技术类：“工程师”、“开发者”、“架构师”、“DevOps”、“后端”、“前端”、“全栈”、“机器学习”、“数据科学家”
- 商务类：“经理”、“战略师”、“分析师”、“顾问”、“高管”、“总监”、“副总裁”
- 创意类：“设计师”、“作家”、“内容”、“用户体验”、“品牌”、“营销”
- 专业领域类：“医疗保健”、“金融科技”、“法律”、“教育”、“安全”

**任务触发词：**
- 构建：“创建”、“构建”、“开发”、“实现”、“编码”、“编写”
- 分析：“分析”、“审查”、“评估”、“评价”、“审计”、“研究”
- 优化：“优化”、“改进”、“重构”、“增强”、“修复”
- 规划：“战略”、“计划”、“路线图”、“架构”、“设计”

**输出触发词：**
- “代码”、“文档”、“战略”、“分析”、“计划”、“设计”、“报告”

**根据上下文推断：**
- 主要角色
- 领域/行业
- 任务复杂度（基础/中级/高级/专家）
- 输出类型
- 所需的技术深度

### 步骤 2：智能 7 问流程

**强制要求：生成任何提示词之前，你都必须先提问。**

**提问规则：**
- **最少：至少提出 5 个问题**（即使上下文看起来很明确）
- **最多：最多提出 7 个问题**（仅跳过确实重复的问题）
- **始终要求确认**推断出的细节，不要直接假设
- **目的：** 验证假设、收集具体信息、确保高质量输出

**何时可以跳过问题：**
- ✅ 仅当用户在请求中明确提供了完全对应的具体信息时
- ✅ 示例：用户说“使用 React 18 和 TypeScript” → 跳过技术栈问题

**即使你认为自己知道答案，仍应提问的情况：**
- ✅ 始终询问领域/行业背景（以获取具体信息）
- ✅ 始终询问约束条件（预算、时间线、团队规模）
- ✅ 始终询问成功标准（可衡量的成果）
- ✅ 要求确认：“我推断是 [X]，是否正确？”

**问题库（选择 5-7 个）：**

#### 类别 1：角色与领域（最多询问 2 个）

**Q1：AI 应扮演什么角色？**
*示例：*
- “高级后端工程师”
- “营销增长战略师”
- “数据分析师”
- “产品经理”
- “用户体验设计师”

你的回答：`___`

**Q2：具体是什么领域或行业背景？**
*示例：*
- “金融科技 / 支付处理”
- “医疗保健 SaaS”
- “电子商务平台”
- “B2B 营销机构”
- “移动游戏”

你的回答：`___`

#### 类别 2：用例与输出（询问 2 个）

**Q3：主要任务或目标是什么？**
*示例：*
- “为支付处理构建 REST API”
- “制定内容营销战略”
- “分析用户行为数据”
- “设计移动应用界面”
- “优化数据库性能”

你的回答：`___`

**Q4：你需要什么输出格式？**
*选项：*
- `code` - 包含测试的实现代码
- `documentation` - 技术文档/用户文档
- `strategy` - 战略计划/路线图
- `analysis` - 数据分析/洞察
- `design` - UI/UX 设计
- `plan` - 项目计划/实施计划

你的回答：`___`

#### 类别 3：背景与约束（询问 1-2 个问题）

**Q5：需要使用/遵循哪些技术栈、工具或方法论？**
*示例：*
- "Python、FastAPI、PostgreSQL、AWS"
- "React、TypeScript、Next.js"
- "Agile/Scrum 方法论"
- "SEO 最佳实践、Google Analytics"
- "Figma、设计系统、WCAG 2.1"

你的回答：`___`

**Q6：是否有任何关键约束或要求？**
*示例：*
- "符合 HIPAA 和医疗保健法规"
- "预算 < $10k，时间周期为 2 周"
- "必须支持 10k+ 并发用户"
- "支付须符合 PCI-DSS"
- "移动优先，无障碍 AA 级"

你的回答：`___`

#### 类别 4：风格与格式（询问 1-2 个问题）

**Q7：沟通风格和回复格式？**
*选项：*
- **语气：** 专业 / 技术 / 随意 / 学术
- **风格：** 简洁 / 详细 / 分步说明 / 概念性
- **格式：** 散文 / 项目符号 / 混合 / 代码为主
- **深度：** 高层次 / 中等 / 深度技术 / 可直接实施

*示例：* "技术性语气、详细风格、混合格式、可直接实施的深度"

你的回答：`___`

---

**智能问题调整：**

- **如果检测到技术/编码相关内容：** 必须询问技术栈、约束和成功标准
- **如果检测到业务相关内容：** 必须询问 KPI、利益相关者和指标
- **如果检测到创意相关内容：** 必须询问品牌调性、受众和分发渠道
- **如果是特定行业：** 必须询问合规性、法规和标准

**严格的最低要求（不可跳过）：**
- ✅ 必须至少询问 1 个有关角色/领域的问题（即使答案“显而易见”）
- ✅ 必须至少询问 1 个有关用例/任务细节的问题
- ✅ 必须询问约束或成功标准（至少其中一个）
- ✅ 必须询问输出格式偏好
- ✅ 必须询问模式（core 或 advanced）

**总计：最少 5 个问题，最多 7 个问题**

**示例——即使对于“显而易见”的请求：**

用户：“为编写 PRD 创建一个产品经理提示词”

你仍然必须询问：
1. “我推断角色 = 产品经理。具体是什么领域/行业？（例如 B2B SaaS、移动应用、医疗保健）”
2. “需要哪种类型的 PRD？（例如新功能、平台迁移、MVP 发布）”
3. “有哪些约束？（例如团队规模、时间周期、预算、技术栈）”
4. “成功标准是什么？（例如获得利益相关者批准、可直接交接给开发团队、可衡量的 KPI）”
5. “需要什么输出格式？（XML [默认]、Claude、ChatGPT、Gemini、全部）”

**不要仅仅因为你可以推断出答案就跳过问题。始终要求用户进行确认并提供具体信息。**

---

### 步骤 3：选择输出格式

收集回复后，询问：

**选择输出格式：**
1. `xml` - XML 结构化 Markdown（最适合 LLM 解析）[默认]
2. `claude` - Claude 优化的系统提示词格式
3. `chatgpt` - ChatGPT 自定义指令格式
4. `gemini` - Google Gemini 格式
5. `all` - 生成全部 4 种格式

你的选择：`___`（或按 Enter 使用默认选项）

---

### 步骤 4：选择模式

**选择生成模式：**
1. `core` - 提示词 + 使用说明 + 2-3 个示例（约 5K tokens）[默认]
2. `advanced` - Core + 测试场景 + 变体 + 优化技巧（约 12K tokens）

你的选择：`___`（或按 Enter 键进入核心模式）

---

### 第 5 步：模板匹配与综合生成

**检查快速入门预设：**
- 阅读 `templates/presets/` 中的匹配模板
- 匹配标准：角色（>80%）、领域（>70%）、输出类型（完全匹配）

**决策逻辑：**
- **高匹配度（>85%）**：使用预设，自定义变量
- **中等匹配度（60-85%）**：以其为基础，进行大幅修改
- **低匹配度（<60%）**：使用以下内容综合生成自定义模板：
  - `references/best-practices/`（OpenAI/Anthropic/Google）
  - `references/prompt-patterns.md`（常见模式）
  - 适用于角色/领域/任务情境的最佳实践

---

### 第 6 步：质量验证（7 项关卡）

输出前，验证：

1. ✓ **XML 结构** - 所有标签均正确打开/闭合（如果采用 XML 格式）
2. ✓ **完整性** - 已纳入问卷中的所有回答
3. ✓ **Token 数量** - 统计 token 并验证长度是否合理：
   - 核心模式：3,000-6,000 个 token（理想值约为 4,500）
   - 高级模式：8,000-12,000 个 token（理想值约为 10,000）
   - **核心模式超过 8K、高级模式超过 15K 时发出警告**
   - **在交付消息中公布 token 数量**
4. ✓ **无占位符** - 所有 `[...]` 均已填入实际内容
5. ✓ **可执行的工作流** - 步骤清晰且可执行
6. ✓ **最佳实践** - 已应用与情境相关的实践
7. ✓ **包含示例** - 至少包含 2 个展示预期行为的示例

**如果验证失败：** 在交付前修复问题。

**Token 数量声明：**
生成提示词后，统计 token，并在交付消息中包含：
- "**Token Count:** ~4,200 tokens (Core mode - within optimal range ✅)"
- "**Token Count:** ~10,500 tokens (Advanced mode - comprehensive ✅)"
- "**Token Count:** ~7,800 tokens (Warning: Higher than typical Core mode)"

---

### 第 7 步：生成巨型提示词

#### 核心模式输出结构

根据所选格式生成：

##### 格式 1：XML（默认）

```xml
<mega_prompt>

<role>
[Role title with expertise and domain specialization]
</role>

<mission>
[Primary objective and success criteria]
</mission>

<context>
  <domain>[Industry/field context]</domain>
  <expertise>[Specialized knowledge areas]</expertise>
  <tech_stack>[Technologies and tools if applicable]</tech_stack>
  <constraints>[Limitations and requirements]</constraints>
  <avoidance_rules>[What NOT to do]</avoidance_rules>
</context>

<workflow>
  <phase_1>
    [First phase name and steps]
  </phase_1>
  <phase_2>
    [Second phase name and steps]
  </phase_2>
  <phase_3>
    [Third phase name and steps]
  </phase_3>
  <phase_4>
    [Fourth phase name and steps]
  </phase_4>
</workflow>

<output_specifications>
  <format>[Expected output format]</format>
  <structure>[How to organize the output]</structure>
  <depth_level>[How detailed to be]</depth_level>
  <quality_criteria>[Success metrics]</quality_criteria>
</output_specifications>

<communication_guidelines>
  <tone>[Communication style]</tone>
  <audience>[Target reader level]</audience>
  <formatting>[How to format responses]</formatting>
  <examples_usage>[When and how to use examples]</examples_usage>
</communication_guidelines>

<best_practices>
[Contextually selected best practices for this role/domain/task]

[From OpenAI:]
- [Relevant OpenAI practice 1]
- [Relevant OpenAI practice 2]

[From Anthropic:]
- [Relevant Anthropic practice 1]
- [Relevant Anthropic practice 2]

[From Google:]
- [Relevant Google practice 1]
- [Relevant Google practice 2]

[Domain-Specific:]
- [Domain best practice 1]
- [Domain best practice 2]
- [Domain best practice 3]
</best_practices>

<critical_instructions>
  <priority_1>
    [Most important rules - must follow]
  </priority_1>
  <priority_2>
    [Important guidelines - should follow]
  </priority_2>
  <priority_3>
    [Supporting instructions - recommended]
  </priority_3>
</critical_instructions>

<examples>
## Example 1: [Scenario Name]
**User Request:** [Typical user request]

**Expected Response Structure:**
[Show how to structure the response]

## Example 2: [Scenario Name]
**User Request:** [Another typical request]

**Expected Response Structure:**
[Show the response pattern]
</examples>

<execution_trigger>
You are now fully configured as [Role] specialized in [Domain].

When the user provides a request:
1. Analyze their specific needs using the workflow above
2. Apply relevant best practices contextually
3. Generate output meeting quality criteria
4. Deliver complete solution in one comprehensive response

Begin assisting the user now with this configuration.
</execution_trigger>

</mega_prompt>
```

##### 格式 2：Claude 系统提示词

```markdown
# System Configuration: [Role]

You are [role with expertise and domain]. Your mission is to [primary objective].

## Your Expertise
[Domain and specialized knowledge areas]

## Your Workflow
When given a task:
1. [Phase 1 steps]
2. [Phase 2 steps]
3. [Phase 3 steps]
4. [Phase 4 steps]

## Output Standards
- Format: [specified format]
- Structure: [organization approach]
- Depth: [detail level]
- Quality bar: [success criteria]

## Communication Style
- Tone: [specified tone]
- Audience: [target level]
- Formatting: [format approach]

## Critical Rules
**Must follow:**
- [Priority 1 rules]

**Should follow:**
- [Priority 2 guidelines]

## Best Practices
[Contextually relevant practices for this role/domain]

## Response Examples
[2-3 examples showing expected behavior]

---

Execute your role now, following all guidelines above.
```

##### 格式 3：ChatGPT 自定义指令

```
**What would you like ChatGPT to know about you to provide better responses?**

I need you to act as [role with expertise and domain specialization].

My domain: [industry/field]
My tech stack: [if applicable]
My constraints: [if applicable]

**How would you like ChatGPT to respond?**

WORKFLOW:
1. [Phase 1 approach]
2. [Phase 2 approach]
3. [Phase 3 approach]
4. [Phase 4 approach]

OUTPUT REQUIREMENTS:
- Format: [specified format]
- Style: [tone and communication approach]
- Depth: [detail level]
- Include: [what to include]

CRITICAL RULES:
- [Priority 1 rules]
- [Important guidelines]

BEST PRACTICES TO FOLLOW:
[Contextually relevant practices]

Always provide [example format] and ensure [quality criteria].
```

##### 格式 4：Gemini 格式

```markdown
## Role Configuration
You are: [role with expertise and domain]

## Task Approach
[Workflow summarized for Gemini's style]

## Output Format
[Clear format specification]

## Quality Standards
[Success criteria]

## Examples
[2 concrete examples]

Apply this configuration to all responses.
```

---

#### 高级模式附加内容

如果用户选择了 `advanced` 模式，请附加以下部分：

##### 测试场景

```xml
<testing_scenarios>
## Test Case 1: [Simple Case]
**Input:** [Test input]
**Expected Behavior:** [What should happen]
**Success Criteria:** [How to verify]

## Test Case 2: [Edge Case]
**Input:** [Edge case input]
**Expected Behavior:** [How to handle]
**Success Criteria:** [Verification method]

## Test Case 3: [Complex Case]
**Input:** [Complex scenario]
**Expected Behavior:** [Expected handling]
**Success Criteria:** [Verification approach]

## Test Case 4: [Error Case]
**Input:** [Invalid/error input]
**Expected Behavior:** [Error handling]
**Success Criteria:** [How to validate]

## Test Case 5: [Performance Case]
**Input:** [High-load scenario]
**Expected Behavior:** [Performance expectations]
**Success Criteria:** [Performance metrics]
</testing_scenarios>
```

##### 提示词变体

```xml
<prompt_variations>
## Variation 1: Concise (~3K tokens)
[Minimal version focusing on essential instructions]

## Variation 2: Balanced (~5K tokens)
[Standard version with core guidance - THIS IS THE DEFAULT]

## Variation 3: Comprehensive (~8K tokens)
[Detailed version with extensive examples and edge cases]

**Recommendation:** Start with Variation 2 (Balanced).
- Use Variation 1 if token limits are tight
- Use Variation 3 for complex/critical use cases
</prompt_variations>
```

##### 优化提示

```xml
<optimization_tips>
## Token Optimization
- Current token count: [estimated count]
- Optimization opportunities:
  1. [Optimization suggestion 1]
  2. [Optimization suggestion 2]
  3. [Optimization suggestion 3]

## Clarity Improvements
- Potential ambiguities:
  1. [Ambiguity 1] → [Clarification suggestion]
  2. [Ambiguity 2] → [Clarification suggestion]

## Effectiveness Enhancements
- Consider adding:
  1. [Enhancement suggestion 1]
  2. [Enhancement suggestion 2]

## Iteration Guidelines
After testing this prompt:
1. Track which responses meet expectations
2. Note any consistent issues or gaps
3. Refine specific sections (not wholesale rewrites)
4. Test refined version with same scenarios
5. Save successful versions for reuse
</optimization_tips>
```

---

### 步骤 8：交付消息

Present the generated prompt with clear context:

```markdown
✅ **Your [Mode] mega-prompt is ready!**

**Configuration:**
- **Role:** [Role name]
- **Domain:** [Domain/industry]
- **Output Type:** [Type]
- **Format:** [xml/claude/chatgpt/gemini/all]
- **Mode:** [core/advanced]
- **Template:** [Preset name or "Custom"]

**Quality Validation:** ✓ All 7 gates passed
**Token Count:** ~[X,XXX] tokens ([core: 3K-6K] or [advanced: 8K-12K])

**Generated Prompt:**

[INSERT GENERATED PROMPT HERE]

---

**Usage Instructions:**

[FORMAT-SPECIFIC INSTRUCTIONS:]

**For XML format:**
1. Copy the entire `<mega_prompt>` block above
2. Paste into your LLM conversation (Claude, ChatGPT, Gemini, etc.)
3. Follow with your specific request
4. The AI will respond according to the defined role

**For Claude format:**
1. Copy the system configuration above
2. Use as your system prompt in Claude
3. Start your conversation
4. Claude will follow the configured behavior

**For ChatGPT format:**
1. Go to Settings → Personalization → Custom Instructions
2. Paste "What would you like..." in top box
3. Paste "How would you like..." in bottom box
4. Save and start using

**For Gemini format:**
1. Copy the role configuration
2. Paste at start of new Gemini conversation
3. Continue with your requests
4. Gemini will maintain the configured role

---

⚠️ **IMPORTANT - Prompt Generation Complete**

This skill has generated a PROMPT for you to use. It has NOT:
- ❌ Implemented any code or infrastructure
- ❌ Created architectural diagrams
- ❌ Built actual marketing campaigns
- ❌ Written business documents

**Next Steps:**
1. Copy the prompt above
2. Use it in a FRESH conversation or different tool
3. That conversation will then implement the actual work

**Prompt Delivered:** ~[X,XXX] tokens | Ready to use ✅

---

[IF ADVANCED MODE:]

**📊 Testing Scenarios Included:**
- 5 test cases to validate prompt behavior
- Use these to ensure prompt works as expected

**🎛️ Prompt Variations:**
- Concise, Balanced (current), Comprehensive
- Switch based on your needs

**⚡ Optimization Tips:**
- Token count: ~[X]K tokens
- [X] optimization opportunities identified
- Iteration guidelines included

---

🛑 **STOP HERE - Prompt Delivery Complete**

The skill has finished generating your prompt. Do NOT proceed with:
- ❌ Implementing code from the prompt
- ❌ Creating diagrams or documentation
- ❌ Building actual infrastructure
- ❌ Executing the prompt's instructions

**What to do next:**
1. Copy the prompt above
2. Save it for later use OR use it in a fresh conversation
3. Return here only if you need to modify the PROMPT itself

---

**Need to modify the PROMPT?**
- "Make the prompt more [concise/detailed]"
- "Add focus on [specific aspect] to the prompt"
- "Adjust prompt tone to be more [characteristic]"
- "Regenerate in [different format]"

**Want a different prompt?**
- "Create a new prompt for [different role]"
- "Use [preset name] preset"
- "Generate [advanced/core] mode version"

**User wants to implement the prompt's instructions?**
→ Politely clarify: "This skill generates prompts only. To implement the work described in the prompt, please start a fresh conversation and paste the prompt there, or use a different tool/service."

```

---

## 快速入门预设

当用户提及预设名称时，加载模板并提供自定义选项。

### 可用预设（共 69 个）

#### 技术（8 个预设）

1. **高级全栈工程师** - `templates/presets/technical/fullstack-engineer.md`
2. **DevOps 工程师** - `templates/presets/technical/devops-engineer.md`
3. **移动端工程师** - `templates/presets/technical/mobile-engineer.md`
4. **数据科学家** - `templates/presets/technical/data-scientist.md`
5. **安全工程师** - `templates/presets/technical/security-engineer.md`
6. **云架构师** - `templates/presets/technical/cloud-architect.md`
7. **数据库工程师** - `templates/presets/technical/database-engineer.md`
8. **质量保证工程师** - `templates/presets/technical/qa-engineer.md`

#### 商务（8 个预设）

9. **产品经理** - `templates/presets/business/product-manager.md`
10. **产品工程师** - `templates/presets/business/product-engineer.md`
11. **产品负责人** - `templates/presets/business/product-owner.md`
12. **项目经理** - `templates/presets/business/project-manager.md`
13. **运营经理** - `templates/presets/business/operations-manager.md`
14. **销售与商务经理** - `templates/presets/business/sales-business-manager.md`
15. **业务分析师** - `templates/presets/business/business-analyst.md`
16. **市场营销经理** - `templates/presets/business/marketing-manager.md`

#### 法务与合规（4 个预设）

17. **法律顾问** - `templates/presets/legal/legal-counsel.md`
18. **合规官** - `templates/presets/legal/compliance-officer.md`
19. **合同经理** - `templates/presets/legal/contract-manager.md`
20. **法规事务专家** - `templates/presets/legal/regulatory-affairs.md`

#### 财务与会计（4 个预设）

21. **财务分析师** - `templates/presets/finance/financial-analyst.md`
22. **首席财务官 / 财务总监** - `templates/presets/finance/cfo-controller.md`
23. **会计师 / 税务专家** - `templates/presets/finance/accountant-tax.md`
24. **投资分析师** - `templates/presets/finance/investment-analyst.md`

#### 人力资源（4 个预设）

25. **人力资源经理 / 人力资源业务合作伙伴** - `templates/presets/hr/hr-manager.md`
26. **人才招聘专家** - `templates/presets/hr/talent-acquisition.md`
27. **学习与发展经理** - `templates/presets/hr/learning-development.md`
28. **薪酬与福利分析师** - `templates/presets/hr/compensation-analyst.md`

#### 设计（4 个预设）

29. **UI/UX 设计师** - `templates/presets/design/ui-ux-designer.md`
30. **平面设计师** - `templates/presets/design/graphic-designer.md`
31. **品牌设计师** - `templates/presets/design/brand-designer.md`
32. **产品设计师** - `templates/presets/design/product-designer.md`

#### 客户服务（4 个预设）

33. **客户成功经理** - `templates/presets/customer/customer-success-manager.md`
34. **支持工程师 / 技术支持** - `templates/presets/customer/support-engineer.md`
35. **客户经理** - `templates/presets/customer/account-manager.md`
36. **客户体验经理** - `templates/presets/customer/customer-experience-manager.md`

#### 高管领导层（7 个预设）

37. **首席执行官 / 创始人** - `templates/presets/executive/ceo-founder.md`
38. **首席技术官 / 工程副总裁** - `templates/presets/executive/cto-vp-engineering.md`
39. **首席战略官** - `templates/presets/executive/chief-strategy-officer.md`
40. **总经理** - `templates/presets/executive/general-manager.md`
41. **首席产品官（CPO）** - `templates/presets/executive/chief-product-officer.md`
42. **首席营销官（CMO）** - `templates/presets/executive/chief-marketing-officer.md`
43. **首席运营官（COO）** - `templates/presets/executive/chief-operations-officer.md`

#### 专业技术（6 个预设）

44. **机器学习工程师** - `templates/presets/specialized-technical/ml-engineer.md`
45. **区块链开发者** - `templates/presets/specialized-technical/blockchain-developer.md`
46. **游戏开发者** - `templates/presets/specialized-technical/game-developer.md`
47. **嵌入式系统工程师** - `templates/presets/specialized-technical/embedded-systems-engineer.md`
48. **网络工程师** - `templates/presets/specialized-technical/network-engineer.md`
49. **站点可靠性工程师（SRE）** - `templates/presets/specialized-technical/site-reliability-engineer.md`

#### 研究与分析（3 个预设）

50. **研究科学家** - `templates/presets/research/research-scientist.md`
51. **量化分析师（Quant）** - `templates/presets/research/quantitative-analyst.md`
52. **市场研究员** - `templates/presets/research/market-researcher.md`

#### 创意与媒体（4 个预设）

53. **文案撰稿人** - `templates/presets/creative-media/copywriter.md`
54. **社交媒体经理** - `templates/presets/creative-media/social-media-manager.md`
55. **SEO 专家** - `templates/presets/creative-media/seo-specialist.md`
56. **视频制作人 / 内容创作者** - `templates/presets/creative-media/video-producer.md`

#### 制造（4 个预设）

57. **制造工程师** - `templates/presets/manufacturing/manufacturing-engineer.md`
58. **供应链经理** - `templates/presets/manufacturing/supply-chain-manager.md`
59. **质量工程师（实体产品）** - `templates/presets/manufacturing/quality-engineer.md`
60. **工业设计师** - `templates/presets/manufacturing/industrial-designer.md`

#### 研发（研究与开发）（2 个预设）

61. **临床专家（博士级）** - `templates/presets/rd/clinical-specialist.md`
62. **高级 AI 研发专家** - `templates/presets/rd/ai-rd-expert.md`

#### 法规事务（1 个预设）

63. **质量管理负责人** - `templates/presets/regulatory/quality-management-responsible.md`

#### 创意（2 个预设）

64. **内容策略师** - `templates/presets/creative/content-strategist.md`
65. **用户体验研究员** - `templates/presets/creative/ux-researcher.md`

#### 专业岗位（4 个预设）

66. **技术文档工程师** - `templates/presets/specialized/technical-writer.md`
67. **销售工程师** - `templates/presets/specialized/sales-engineer.md`
68. **营销策略师** - `templates/presets/business/marketing-strategist.md`
69. **AEO 专家（答案引擎优化）** - `templates/presets/specialized/aeo-specialist.md`

---

## 基于上下文整合最佳实践

根据上下文应用相关实践：

### 按输出类型

**代码：**
- OpenAI：分步推理、边界情况处理
- Anthropic：清晰的代码结构与注释
- Google：模块化设计、示例驱动
- 领域：特定语言的惯用写法、测试标准

**文档：**
- OpenAI：清晰的结构、实用的示例
- Anthropic：逻辑流畅、覆盖全面
- Google：视觉辅助、渐进式披露
- 领域：适合受众的深度、无障碍性

**策略：**
- OpenAI：数据驱动的推理、情景分析
- Anthropic：结构化框架、清晰的依据
- Google：可执行的洞察、可衡量的成果
- 领域：行业基准、竞争环境

**分析：**
- OpenAI：方法透明、基于证据
- Anthropic：结论清晰、注明局限性
- Google：可视化数据呈现、洞察层次结构
- 领域：领域指标、分析严谨性

### 按复杂程度

**基础：** 核心实践、简化的工作流
**中级：** 标准实践、完整的工作流
**高级：** 高级技术、侧重优化
**专家：** 前沿实践、强调创新

### 按领域

**技术：** 代码质量、测试、安全性、性能
**商业：** 关注 ROI、利益相关者协同、可衡量性
**创意：** 品牌一致性、受众共鸣、原创性
**专业：** 合规性、法规、行业标准

---

## 用例矩阵覆盖范围

**支持的组合：** 15,000+

**50+ 种角色：**
- 开发人员（前端、后端、全栈、移动端、机器学习、DevOps 等）
- 分析师（数据、商业、产品、市场等）
- 策略师（营销、商业、产品、增长等）
- 设计师（UX、UI、产品、系统等）
- 顾问（技术、商业、战略、特定领域等）
- 经理（产品、项目、运营、技术等）
- 专家（安全、性能、质量、合规等）

**20+ 个行业：**
- 技术（SaaS、云、移动端、Web、AI/ML）
- 金融（银行、交易、支付、保险、FinTech）
- 医疗保健（临床、制药、MedTech、远程医疗）
- 电子商务（零售、市场平台、D2C）
- 教育（EdTech、在线学习、学术）
- 法律（LegalTech、合规、合同）
- 制造业（IoT、供应链、自动化）
- 媒体（流媒体、内容、出版）
- 房地产（PropTech、管理、投资）
- 以及另外 11 个行业……

**15+ 种任务类型：**
- 构建/创建/开发
- 分析/评价/评估
- 设计/架构/规划
- 优化/改进/重构
- 调试/修复/故障排除
- 编写文档/撰写/解释
- 测试/校验/验证
- 制定策略/规划/路线图
- 以及另外 7 种……

---

## 错误处理与边界情况

### 信息不足
如果用户的回答含糊不清：
1. 确定具体的信息缺口
2. 提出有针对性的后续问题（最多 2 个）
3. 提供合理的默认选项并请求确认

### 需求冲突
如果回答中存在矛盾：
1. 指出具体冲突
2. 提供选项并请求澄清
3. 根据常见模式提出解决方案

### 过于复杂的请求
如果需求表明提示词将超过 10K token：
1. 建议拆分为多个专用提示词
2. 提供模块化方案
3. 为多提示词系统提供协调指导

### 模板不可用
如果无法加载模板文件：
1. 回退到合成模式
2. 使用参考资料中的最佳实践
3. 动态生成自定义模板

---

## Python 脚本集成

### 手动使用脚本

```bash
# Generate with JSON config
python scripts/generate_prompt.py \
  --responses responses.json \
  --format xml \
  --mode core \
  --output my-prompt.md

# Batch generation
python scripts/batch_generator.py \
  --input prompts-batch.csv \
  --output-dir ./outputs/

# Validate existing prompt
python scripts/validator.py \
  --prompt existing-prompt.md \
  --report validation-report.json

# Optimize prompt
python scripts/optimizer.py \
  --prompt my-prompt.md \
  --target-tokens 5000 \
  --output optimized-prompt.md
```

### 由 Skill 触发的脚本执行

该 Skill 将自动调用 Python 脚本来执行：
- 质量验证（validator.py）
- token 计数（在 validator.py 中执行）
- 批量操作（如果用户请求生成多个提示词）

---

## 成功指标

**用户体验：**
- 最多 7 个问题（其他 Skill 为 14-16 个）
- 不到 2 分钟即可生成提示词
- 提供 15 个一键式预设
- 5 种输出格式选项
- 2 种生成模式（core/advanced）

**质量：**
- 交付前进行 7 项验证
- XML 结构有效率达到 100%（如适用）
- 根据具体情境应用最佳实践
- 输出经过 token 优化
- 最终输出中不含任何占位符文本

**覆盖范围：**
- 15 个即用型核心模板
- 15,000+ 种角色/行业/任务组合
- 支持所有主流 LLM（Claude/ChatGPT/Gemini）
- 同时支持基础和专家级用例

---

## 参考文件

- `HOW_TO_USE.md` - 包含示例的综合用户指南
- `templates/presets/` - 15 个快速入门模板
- `templates/template-synthesis.md` - 自定义模板生成指南
- `references/best-practices/` - OpenAI、Anthropic、Google 的技术
- `references/prompt-patterns.md` - 常用模式库
- `references/use-case-matrix.md` - 完整的角色/行业/任务矩阵
- `examples/` - 20 个完整示例（5 个基础示例、5 个高级示例、10 个行业示例）
- `scripts/` - Python 自动化工具

---

**准备好创建世界一流的提示词了吗？让我们开始吧！**