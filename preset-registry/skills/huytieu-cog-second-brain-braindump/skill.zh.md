---
name: braindump
description: Quick capture of raw thoughts with intelligent domain classification and competitive intelligence extraction
roles: [all]
integrations: []
---
# COG 思维倾倒技能

## 目的
通过快速捕获、系统分析、模式识别和领域感知的洞察提取，将原始想法转化为战略情报，同时最大限度减少用户操作阻力。

## 何时调用
- 用户想要捕获意识流式的想法
- 用户说出“braindump”“brain dump”“capture thoughts”或“write down ideas”
- 用户有想要快速记录的想法
- 用户提到想把脑海中的想法倾倒出来

## 智能体模式感知

**检查 `00-inbox/MY-PROFILE.md` 前置元数据中的 `agent_mode`：**
- 如果为 `agent_mode: team` — 将研究、分析和写作子任务委派给专业子智能体（例如，使用 Task 工具将深度分析、竞争情报提取或模式识别委派给不同的智能体）。在向用户展示之前汇总结果。
- 如果为 `agent_mode: solo`（默认）— 直接在对话中处理所有事务。不进行委派。

## 执行前检查

**执行前，检查是否存在用户档案：**

1. 在知识库中查找 `00-inbox/MY-PROFILE.md`
2. 如果未找到：
   ```
   Welcome to COG! It looks like this is your first time.

   Before we start, let's quickly set up your profile (takes 2 minutes).

   Would you like to run onboarding first, or should I proceed with default settings?
   ```
3. 如果已找到：
   - 读取档案以获取用户姓名和活跃项目
   - 如果用户列出了活跃项目，将其作为领域选项提供
   - 使用用户姓名进行友好沟通
   - 如果 `03-professional/COMPETITIVE-WATCHLIST.md` 存在，则读取该文件以检测竞争情报

**获取当前时间戳（生成任何文件前必须执行）：**

1. 使用 Bash 运行 `date '+%Y-%m-%d %H:%M'`，获取实际的当前日期和时间
2. 存储该值，并将其用于所有时间戳字段（前置元数据中的 `created:` 以及文件名的 `HHMM` 部分）
3. 绝不猜测或编造时间——始终使用 `date` 命令返回的值

## 流程

### 1. 用户交互与输入收集
- 热情地问候用户（如果 MY-PROFILE.md 中提供了姓名，则使用其姓名）
- 询问：“你在想什么？”或“准备好进行一次思维倾倒了吗？”
- 收集用户的意识流式输入（可以很长、杂乱无章，也可以是语音转文字等）
- 接受任何格式——不评判、不筛选

### 2. 领域分类
请用户进行分类，或根据内容自动检测：

**如果用户档案存在且包含项目：**
- **个人：** 个人成长、人际关系、健康
- **职业：** 工作、领导力、职业发展
- **特定项目：** 与具体项目相关
  - 如果 MY-PROFILE.md 中列出了项目，则询问：“是哪个项目？[列出项目名称]”
  - 示例：“是哪个项目？(1) SaaS 产品，(2) 图书写作，(3) 健康应用”
- **混合/不明确：** 涉及多个领域

**如果没有档案：** 使用标准的个人/职业/混合分类

### 3. 内容分析与处理

直接应用综合分析框架：

#### 阶段 1：内容摄取
分析输入以了解：
- **内容类型：** [voice-transcript|written-notes|mixed]
- **长度：** [word-count]
- **能量水平：** [high|medium|low]
- **情绪基调：** [excited|frustrated|curious|concerned|neutral|mixed]
- **背景：** [situational-background]

#### 阶段 2：结构分析
提取并识别：
- **主要主题：** [3-5 个核心主题]
- **支撑观点：** [相关概念和细节]
- **提出的问题：** [明确和隐含的问题]
- **考虑中的决策：** [正在考虑的选择]
- **行动事项：** [已识别的任务和承诺]

#### 阶段 3：领域分类（含置信度）
确定：
- **主要领域：** [personal|professional|project-specific]，并注明置信度
- **次要领域：** [如果内容跨越多个领域]
- **跨领域元素：** [适用于多个领域的主题]
- **隐私注意事项：** [需要保护的敏感内容]

#### 阶段 4：战略洞察提取
识别：
- **关键洞察：** [3-5 个最重要的认识]
- **模式识别：** [与先前想法/决策的联系]
- **战略影响：** [这对目标和优先事项意味着什么]
- **决策框架：** [这将如何为未来的选择提供依据]

#### 阶段 5：竞争情报检测
如果 COMPETITIVE-WATCHLIST.md 存在：
- 扫描随想记录内容，查找其中提到的受跟踪公司/人员
- 将竞争情报提取到单独的文件中
- 创建指回原始随想记录的交叉引用

### 4. 生成结构化输出

创建具有以下结构的随想记录文件：

```markdown
---
type: "braindump"
domain: "[personal|professional|project-specific|mixed]"
project: "[project-name]" # Only if project-specific
date: "YYYY-MM-DD"
created: "YYYY-MM-DD HH:MM"
themes: ["theme1", "theme2", "theme3"]
tags: ["#braindump", "#raw-thoughts", "#domain-tag"]
status: "captured"
energy_level: "[high|medium|low]"
emotional_tone: "[primary-emotion]"
confidence: "[high|medium|low]"
---

# Braindump: [Auto-generated descriptive title]

## Raw Thoughts
[Original user content preserved exactly as provided]

## Content Analysis

### Main Themes
1. **Theme 1:** [description and significance]
2. **Theme 2:** [description and significance]
3. **Theme 3:** [description and significance]

### Supporting Ideas
- [Supporting concept 1]
- [Supporting concept 2]
- [Supporting concept 3]

### Questions Raised
- [Question 1 for deeper exploration]
- [Question 2 requiring consideration]

### Decisions Contemplated
- [Decision 1 being considered with options]
- [Decision 2 under evaluation]

## Strategic Intelligence

### Key Insights
1. **Insight 1:** [description and implications]
2. **Insight 2:** [description and implications]
3. **Insight 3:** [description and implications]

### Pattern Recognition
- **Connection to Previous Thinking:** [links to earlier braindumps or frameworks]
- **Recurring Patterns:** [themes that keep appearing]
- **Evolution:** [how thinking has developed]

### Strategic Implications
- [How this affects goals]
- [Impact on current projects]
- [Decision-making considerations]

## Action Items

**Note:** Calculate actual due dates from today's date and append Obsidian Tasks emoji format.

### Immediate (24-48 hours)
- [ ] [specific action] 📅 [YYYY-MM-DD = tomorrow's date]

### Short-term (1-2 weeks)
- [ ] [specific action] 📅 [YYYY-MM-DD = date +1 week from today]

### Strategic Considerations
- [longer-term implications and considerations]

## Connections
- **Related Braindumps:** [[link1]], [[link2]]
- **Relevant Projects:** [[project1]], [[project2]]
- **Knowledge Base:** [[insight1]], [[framework1]]

## Domain Classification
- **Primary Domain:** [domain] ([confidence]%)
- **Reasoning:** [why this classification]
- **Cross-Domain Elements:** [if applicable]
- **Privacy Level:** [public|private|confidential]

## Processing Notes
### Emotional Context
- **Energy Level:** [assessment]
- **Emotional Tone:** [assessment]
- **Implications:** [what this suggests]

### Confidence Assessment
- **Overall Analysis:** [percentage] - [reasoning]
- **Domain Classification:** [percentage] - [reasoning]
- **Strategic Insights:** [percentage] - [reasoning]
- **Areas Requiring Clarification:** [specific questions if needed]

---

*Processed by COG Brain Dump Analyst*
```

保存到适当位置：
- **个人：** `02-personal/braindumps/braindump-YYYY-MM-DD-HHMM-<slug>.md`
- **职业：** `03-professional/braindumps/braindump-YYYY-MM-DD-HHMM-<slug>.md`
- **项目：** `04-projects/[project-slug]/braindumps/braindump-YYYY-MM-DD-HHMM-<slug>.md`
- **混合：** `00-inbox/braindump-YYYY-MM-DD-HHMM-<slug>.md`

### 5. 竞争情报提取

如果检测到竞争情报（提及观察名单中的公司/人员）：

创建/更新：`04-projects/[project]/competitive/[company-slug].md`

```markdown
---
type: "competitive-intelligence"
company: "[Company Name]"
project: "[project-name]"
last_updated: "YYYY-MM-DD"
sources: ["braindump"]
tags: ["#competitive", "#intelligence", "#[company-slug]"]
---

# Competitive Intelligence: [Company Name]

## Latest Update - [Date]
**Source:** [[braindump-file-reference]]

[Extracted competitive intelligence from braindump]

## Previous Intelligence
[Historical intel from earlier braindumps]

## Strategic Implications
[Analysis of what this means for the project]

## Action Items
- [ ] [Follow-up actions based on intel] 📅 [YYYY-MM-DD = calculated due date]

---

*Auto-extracted by COG Brain Dump Analyst*
```

### 6. 确认完成
- 确认文件已创建
- 向用户显示：“头脑倾倒已保存至 [file path]”
- 显示所识别主要主题的简要摘要
- 如果提取了竞争情报，请注明：“还将竞争情报提取到了 [file path]”

## YAML 格式要求

**关键：** 所有 YAML frontmatter 都必须使用与 Obsidian 兼容的正确格式：
- 所有字符串值都必须使用双引号
- 数组必须使用带引号的字符串：`["item1", "item2", "item3"]`
- 布尔值不应加引号：`true` 或 `false`
- 数字不应加引号，除非它们是字符串标识符
- 确保 YAML 语法正确，以防止 Obsidian 中出现解析错误

**示例：**
```yaml
# CORRECT
type: "braindump"
themes: ["automation", "testing", "ui-improvements"]
analysis_needed: true

# INCORRECT
type: braindump
themes: [automation, testing, ui-improvements]
analysis_needed: "true"
```

## 验证协议

### 内容准确性
- **解读验证：** 确认理解与意图一致
- **上下文验证：** 确保准确捕捉情境上下文
- **情绪准确性：** 验证对情绪基调和精力水平的评估
- **完整性检查：** 确认已识别所有主要主题

### 领域分类验证
- **边界清晰度：** 确保领域分类清晰且有充分依据
- **隐私保护：** 验证个人内容得到妥善保护
- **跨领域价值：** 确认跨领域洞察有价值且适当
- **分类置信度：** 说明领域分配的置信度

### 战略洞察验证
- **基于证据：** 确保洞察有内容证据支持
- **可操作性：** 验证建议具体且可实施
- **优先级准确性：** 确认优先级评估与既定目标一致
- **时间线现实性：** 确保建议的时间线切实可行

## 不确定性处理

### 何时请求澄清
- **领域分类模糊：** 内容可能属于多个领域
- **战略意义不明确：** 洞察可能有多种解读
- **信息冲突：** 内容包含相互矛盾的要素
- **上下文缺失：** 似乎缺少重要的背景信息

### 置信度指标
- **高置信度（90%+）：** 内容清晰，所属领域和影响显而易见
- **中等置信度（70-89%）：** 整体清晰，但存在一些模糊要素
- **低置信度（50-69%）：** 存在明显歧义，需要用户提供信息
- **极低置信度（<50%）：** 存在重大不确定性，需要澄清

始终在处理说明中明确说明置信度及其理由。

## 与其他技能的集成

### 即时跟进
在思维倾倒后，建议：
- 回顾多次思维倾倒中的模式
- 每周进行一次回顾，以反思主题
- 整合知识以构建框架

### 竞争情报
如果检测到与竞争相关的内容：
- 自动更新竞争情报文件
- 在输出中提及此操作
- 提供竞争情报文件的链接

## 成功指标
- 记录速度（尽量减少用户操作阻力）
- 准确的领域分类
- 文件保存到正确位置
- 用户感到自己被倾听和理解
- 在相关情况下自动提取竞争情报
- 对分析准确性具有高置信度

## 学习与适应

### 模式学习
- 学习用户的思维模式和沟通风格
- 理解用户特定的领域划分偏好
- 识别用户认为最有价值的洞察类型
- 了解用户通常会实施哪些建议

### 持续改进
- 持续跟踪洞察和建议的准确性
- 监测用户对建议的参与和实施情况
- 通过学习提高分析的速度和准确性
- 根据实际效果优化分析框架