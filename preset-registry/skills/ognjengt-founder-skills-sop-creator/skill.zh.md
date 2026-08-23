---
name: sop-creator
description: Creates detailed Standard Operating Procedures (SOPs) for business processes. Use when user needs SOPs, process documentation, operational guides, workflow documentation, or step-by-step instructions for repeatable business processes.
---
# SOP 创建器

## 目的
将非结构化的流程描述转换为清晰、可执行的标准操作程序，并使用五年级学生能够理解的语言编写。

---

## 执行逻辑

**首先检查 $ARGUMENTS 以确定执行模式：**

### 如果 $ARGUMENTS 为空或未提供：
回复：
“SOP 创建器已加载，请描述你想要记录的流程”

然后等待用户在下一条消息中提供流程描述。

### 如果 $ARGUMENTS 包含内容：
立即进入任务执行（跳过“已加载”消息）。

---

## 任务执行

当流程描述可用时（来自初始 $ARGUMENTS 或后续消息）：

### 1. 检查业务背景
检查项目根目录中是否存在 `FOUNDER_CONTEXT.md`。
- **如果存在：** 读取该文件，并使用其中的业务背景对输出进行个性化调整（公司名称、品牌语气、行业特点、受众、使用的工具）。
- **如果不存在：** 使用“默认设置与假设”中的默认值继续执行。

### 2. 分析初始输入
从用户的初始描述中提取已有信息：
- 流程名称或标题
- 谁来执行此流程（角色/技能水平）
- 涉及的工具或系统
- 预期结果或最终状态
- 任何合规或质量要求
- 提到的关键步骤

### 3. 提出澄清问题（如果需要）
**使用 AskUserQuestion 工具**收集缺失的关键信息。最多提出 5 个问题，但越少越好——一旦获得足够的信息来创建完整的 SOP，就停止提问。

**问题库（按优先级排序）：**

| # | 问题 | 为什么重要 | 以下情况可跳过…… |
|---|----------|----------------|------------|
| 1 | 你具体想记录什么流程？ | 确定范围和标题 | 流程已描述清楚 |
| 2 | 谁将执行此流程？（角色、技能水平、经验） | 决定语言复杂度和详细程度 | 用户已指定受众 |
| 3 | 此流程涉及哪些工具或系统？ | 确定前置条件和访问权限要求 | 已列出工具 |
| 4 | 成功的最终结果是什么？如何判断流程已正确完成？ | 确定质量检查标准和成功指标 | 结果已明确说明 |
| 5 | 是否有任何合规要求、安全问题或关键警告？ | 确保包含重要的注意事项 | 没有法规或安全问题 |

**提问策略：**
- 每批使用 AskUserQuestion 提出 2 至 3 个问题
- 如果第一批问题的回答提供了足够的信息，则停止提问
- 总共不得提出超过 5 个问题
- 只询问会阻碍正确执行的问题

### 4. 生成 SOP
使用收集到的信息，按照**输出格式**中的结构创建完整的 SOP：

1. **使用五年级学生能够理解的语言编写**——使用短句和简单的词语
2. **每个步骤只包含一个操作**——不要使用复合指令
3. **每个步骤都以动作动词开头**——“点击”、“打开”、“验证”、“输入”
4. **包含预期结果**——告诉用户他们应该看到什么
5. **为关键步骤添加警告**——防止常见错误
6. **创建质量检查项**——明确说明“完成”的标准

### 5. 格式化并验证
- 按照 **Output Format** 部分组织输出
- 在提交输出前，完成 **Quality Checklist** 自检
- 确保不熟悉该流程的人也能遵循此 SOP

---

## 编写规则
硬性约束。不得自行解读。

### 核心规则
- 使用小学五年级水平的语言
- 使用短句（每句最多 10 至 15 个单词）
- 使用简单、常见的词语——避免术语，或立即解释术语
- 每个步骤只包含一个操作——切勿合并多个操作
- 每个步骤都以操作动词开头（点击、打开、输入、验证、检查）
- 在每个关键步骤后写明预期结果
- 绝不编造步骤——只记录已描述或已确认的内容

### SOP 专用规则
- 标题格式："SOP: [流程名称]"（清晰且便于搜索）
- 必须包含版本信息——SOP 必须进行版本控制
- 必须明确列出前置条件——不得隐藏任何要求
- 质量检查必须可衡量——避免主观标准
- 必须包含常见问题部分——记录已知的失败情况
- 工具部分必须包含所需的访问权限

### 受众规则
- 除非另有说明，否则假定读者没有任何相关知识
- 首次使用缩写时，必须说明其含义
- 对不易理解的步骤说明“为什么”
- 在适合使用视觉指导的位置添加截图占位符
- 在破坏性或不可逆操作前添加警告

---

## 输出格式

SOP 严格遵循以下结构：

```markdown
# SOP: [Process Name]

**Version:** 1.0
**Last Updated:** [Current Date]
**Owner:** [Role/Name from context or "Process Owner"]
**Audience:** [Who uses this SOP]

---

## 1. Purpose
[One clear sentence describing what this process achieves and why it matters.]

## 2. Who Does This
[Role or skill level of person performing this process]

## 3. Tools You Need
- [Tool 1]
- [Tool 2]
- [Access/permissions required]

## 4. Starting Requirements
Before you start, make sure:
- [ ] [Requirement 1]
- [ ] [Requirement 2]
- [ ] [Everything you need is ready]

## 5. Step-by-Step Instructions

### Step 1: [Action Title]
1. [Do this specific action]
2. [Do this specific action]

**What you should see:** [Expected result or outcome]

### Step 2: [Action Title]
1. [Do this specific action]
   - [If needed, add a sub-step for clarity]
   - [If needed, add another sub-step]

**Warning:** [Important thing that could go wrong or caution]

### Step 3: [Action Title]
1. [Do this specific action]

**What you should see:** [Expected result]

[Continue with numbered steps until process completion...]

## 6. Quality Check
After finishing, verify:
- [ ] [Verification item 1 — specific and measurable]
- [ ] [Verification item 2 — specific and measurable]
- [ ] [Final outcome achieved]

## 7. Common Problems and Fixes

| Problem | Why It Happens | How to Fix |
|---------|---------------|------------|
| [Specific problem] | [Root cause] | [Clear solution] |
| [Specific problem] | [Root cause] | [Clear solution] |

## 8. Notes
**Assumptions made:**
- [List any assumptions about user knowledge, tools, or environment]

**Who to ask for help:** [Role or person]

## 9. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [Date] | [Author] | Initial version |
```

---

## 质量检查清单（自我验证）

在最终确定输出内容前，请验证以下所有项目：

### 执行前检查
- [ ] 我已检查 FOUNDER_CONTEXT.md，并在可用时应用了业务背景
- [ ] 我只针对真正缺失的信息提出了澄清问题
- [ ] 我提出的问题总数不超过 5 个

### 内容检查
- [ ] 流程标题清晰且具体
- [ ] 目的说明是一个清晰的句子
- [ ] 已列出所有工具和访问权限要求
- [ ] 前置条件明确且可检查
- [ ] 每个步骤都以动作动词开头
- [ ] 没有步骤假设读者掌握未说明的知识
- [ ] 关键步骤包含预期结果
- [ ] 警告位于有风险的操作之前

### 写作检查
- [ ] 语言符合五年级阅读水平
- [ ] 句子简短（10-15 个词）
- [ ] 专业术语均附有解释
- [ ] 每个步骤只包含一个操作
- [ ] 步骤按正确的先后顺序排列

### 输出检查
- [ ] 质量检查具体且可衡量
- [ ] 常见问题部分包含可能出现的问题
- [ ] 明确定义了成功状态
- [ ] 无需额外背景信息即可遵循该 SOP
- [ ] 版本信息完整

**如果任何检查未通过 → 请在展示前修改。**

---

## 默认设置与假设

除非用户另有说明，否则使用以下设置：

- **受众：** 对此特定流程没有任何经验的初学者
- **阅读水平：** 五年级（用词简单，句子简短）
- **版本：** 1.0
- **作者：** 如果 FOUNDER_CONTEXT.md 可用，则从中获取；否则使用“流程负责人”
- **最后更新：** 当前日期
- **流程类型：** 可重复执行的业务流程（非一次性任务）
- **完成时间：** 除非已提及，否则不指定
- **权限：** 除非另有说明，否则使用标准用户访问权限

在 SOP 的**备注**部分记录所有做出的假设。

---