---
name: prompt-optimizer
description: Transform vague prompts into precise, well-structured specifications using EARS (Easy Approach to Requirements Syntax) methodology. This skill should be used when users provide loose requirements, ambiguous feature descriptions, or need to enhance prompts for AI-generated code, products, or documents. Triggers include requests to "optimize my prompt", "improve this requirement", "make this more specific", or when raw requirements lack detail and structure.
---
# 提示词优化器

## 概述

使用 EARS（简易需求语法方法，Easy Approach to Requirements Syntax）将模糊的提示词优化为精确、可执行的规范。EARS 是劳斯莱斯提出的一种方法论，用于将自然语言转换为结构化、可测试的需求。

**方法论灵感来源：** 本技能将 EARS 与领域理论基础相结合的方法，受到[阿星AI工作室 (A-Xing AI Studio)](https://mp.weixin.qq.com/s/yUVX-9FovSq7ZGChkHpuXQ)的启发，该工作室展示了如何实际应用 EARS 来增强提示词。

**四层增强流程：**

1. **EARS 语法转换** - 将描述性语言转换为规范性说明
2. **领域理论支撑** - 应用相关的行业框架（GTD、BJ Fogg、格式塔等）
3. **示例提取** - 使用真实数据呈现具体用例
4. **结构化提示词生成** - 使用角色/技能/工作流/示例/格式框架进行格式化

## 适用场景

适用于以下情况：
- 用户提供模糊的功能请求（“构建一个仪表板”“创建一个提醒应用”）
- 需求缺少具体条件、触发器或可衡量的结果
- 需要将自然语言描述转换为可测试的规范
- 用户明确要求优化提示词或完善需求

## 六步优化工作流

### 第 1 步：分析原始需求

识别弱点：
- **范围过于宽泛** - “添加用户身份验证” → 缺少密码要求和会话管理
- **缺少触发条件** - “发送通知” → 缺少通知触发的时间和原因
- **操作含糊不清** - “使其易于使用” → 缺少可衡量的可用性标准
- **没有约束条件** - “处理付款” → 缺少安全性和合规性要求

### 第 2 步：应用 EARS 转换

将需求转换为 EARS 模式。完整的语法规则请参阅 `references/ears_syntax.md`。

**五种核心模式：**
1. **普遍型**：`The system shall <action>`
2. **事件驱动型**：`When <trigger>, the system shall <action>`
3. **状态驱动型**：`While <state>, the system shall <action>`
4. **条件型**：`If <condition>, the system shall <action>`
5. **非预期行为型**：`If <condition>, the system shall prevent <unwanted action>`

**快速示例：**
```
Before: "Create a reminder app with task management"

After (EARS):
1. When user creates a task, the system shall guide decomposition into executable sub-tasks
2. When task deadline is within 30 minutes AND user has not started, the system shall send notification with sound alert
3. When user completes a sub-task, the system shall update progress and provide positive feedback
```

**转换检查清单：**
- [ ] 识别隐含条件并将其明确化
- [ ] 指定触发事件或状态
- [ ] 使用精确的动作动词（shall、must、should）
- [ ] 添加可衡量的标准（“30 分钟内”“至少 8 个字符”）
- [ ] 将复合需求拆分为原子化陈述
- [ ] 移除含糊不清的语言（“易于使用”“快速”）

### 第 3 步：识别领域理论

将需求与成熟框架进行匹配。完整目录请参阅 `references/domain_theories.md`。

**常见领域映射：**
- **生产力** → GTD、番茄工作法、艾森豪威尔矩阵
- **行为改变** → BJ Fogg 模型（B=MAT）、《原子习惯》
- **UX 设计** → 希克定律、费茨定律、格式塔原则
- **安全** → 零信任、纵深防御、隐私设计

**选择流程：**
1. 根据需求关键词识别主要领域
2. 匹配 2-4 个互补理论
3. 将理论原则应用于具体功能
4. 在增强后的提示词中引用理论，以提升可信度

### 步骤 4：提取具体示例

使用真实数据生成具体示例：
- 用户场景：“当用户在移动设备上登录时……”
- 数据示例：“产品：‘笔记本电脑’，价格：$999，库存：15”
- 工作流示例：“任务：撰写报告 → 子任务：调研（2 小时）、起草（3 小时）、编辑（1 小时）”

示例必须具备**真实性**、**具体性**、**多样性**（成功/错误/边界情况），并且**可测试**。

### 步骤 5：生成增强后的提示词

使用标准框架组织内容：

```markdown
# Role
[Specific expert role with domain expertise]

## Skills
- [Core capability 1]
- [Core capability 2]
[List 5-8 skills aligned with domain theories]

## Workflows
1. [Phase 1] - [Key activities]
2. [Phase 2] - [Key activities]
[Complete step-by-step process]

## Examples
[Concrete examples with real data, not placeholders]

## Formats
[Precise output specifications:
- File types, structure requirements
- Design/styling expectations
- Technical constraints
- Deliverable checklist]
```

**质量标准：**
- **角色具体性**：“专注于时间管理应用的产品设计师” > “设计师”
- **理论基础**：明确引用相关框架
- **可执行的工作流**：明确输入、输出和决策点
- **具体示例**：使用真实数据，而非“示例 1”“示例 2”
- **可衡量的格式要求**：提出具体要求，而非“优秀的设计”

### 步骤 6：呈现优化结果

以结构化格式输出：

```markdown
## Original Requirement
[User's vague requirement]

**Identified Issues:**
- [Issue 1: e.g., "Lacks specific trigger conditions"]
- [Issue 2: e.g., "No measurable success criteria"]

## EARS Transformation
[Numbered list of EARS-formatted requirements]

## Domain & Theories
**Primary Domain:** [e.g., Authentication Security]

**Applicable Theories:**
- **[Theory 1]** - [Brief relevance]
- **[Theory 2]** - [Brief relevance]

## Enhanced Prompt
[Complete Role/Skills/Workflows/Examples/Formats prompt]

---

**How to use:**
[Brief guidance on applying the prompt]
```

## 高级技巧

对于复杂场景，请参阅 `references/advanced_techniques.md`：
- **多利益相关者需求** - 为每种用户类型编写 EARS 语句
- **非功能性需求** - 使用量化阈值定义性能、安全性和可扩展性
- **复杂条件逻辑** - 使用布尔运算符处理嵌套条件

## 快速参考

**应当：**
✅ 拆分复合需求（每项需求对应一条 EARS 语句）
✅ 指定可衡量的标准（数值、时间范围、百分比）
✅ 包含错误/边界情况
✅ 以成熟理论为基础
✅ 使用包含真实数据的具体示例

**禁止事项：**
❌ 避免使用模糊语言（如“快速”“用户友好”）
❌ 不要假定读者具备隐含知识
❌ 不要在一条陈述中混合多个操作
❌ 不要在示例中使用占位符

## 资源

根据需要加载以下参考文件：

- **`references/ears_syntax.md`** - 完整的 EARS 语法规则、全部 5 种模式、转换指南及优势
- **`references/domain_theories.md`** - 映射到 10 个领域（生产力、UX、游戏化、学习、电子商务、安全等）的 40 多种理论
- **`references/examples.md`** - 四个完整的转换示例（拖延症应用、电子商务产品页面、学习仪表板、密码重置安全），包含转换前后对比和可复用模板
- **`references/advanced_techniques.md`** - 多利益相关者需求、非功能性规格、复杂条件逻辑模式

**何时加载参考文件：**
- 需要澄清 EARS 语法 → `ears_syntax.md`
- 选择领域理论时需要大量选项 → `domain_theories.md`
- 用户请求多个优化示例 → `examples.md`
- 涉及多个利益相关者或非功能性规格的复杂需求 → `advanced_techniques.md`