---
name: prompt-engineering
description: Use this skill when you writing commands, hooks, skills for Agent, or prompts for sub agents or any other LLM interaction, including optimizing prompts, improving LLM outputs, or designing production prompt templates.
---
# 提示词工程模式

用于最大限度提升 LLM 性能、可靠性和可控性的高级提示词工程技术。

## 核心能力

### 1. 少样本学习

通过展示示例而非解释规则来教导模型。提供 2-5 组输入输出对，以演示所需的行为。当你需要一致的格式、特定的推理模式或对边界情况的处理方式时使用。更多示例可以提高准确性，但也会消耗更多 token——应根据任务复杂度进行权衡。

**示例：**

```markdown
Extract key information from support tickets:

Input: "My login doesn't work and I keep getting error 403"
Output: {"issue": "authentication", "error_code": "403", "priority": "high"}

Input: "Feature request: add dark mode to settings"
Output: {"issue": "feature_request", "error_code": null, "priority": "low"}

Now process: "Can't upload files larger than 10MB, getting timeout"
```

### 2. 思维链提示

要求模型在给出最终答案前进行逐步推理。添加 "Let's think step by step"（零样本），或提供推理过程示例（少样本）。适用于需要多步逻辑、数学推理的复杂问题，或需要验证模型思考过程的情况。可将分析任务的准确率提高 30-50%。

**示例：**

```markdown
Analyze this bug report and determine root cause.

Think step by step:
1. What is the expected behavior?
2. What is the actual behavior?
3. What changed recently that could cause this?
4. What components are involved?
5. What is the most likely root cause?

Bug: "Users can't save drafts after the cache update deployed yesterday"
```

### 3. 提示词优化

通过测试和改进，系统性地优化提示词。从简单版本开始，衡量性能（准确性、一致性、token 使用量），然后迭代。使用包括边界情况在内的多样化输入进行测试。使用 A/B 测试比较不同版本。对于一致性和成本至关重要的生产环境提示词来说，这是关键步骤。

**示例：**

```markdown
Version 1 (Simple): "Summarize this article"
→ Result: Inconsistent length, misses key points

Version 2 (Add constraints): "Summarize in 3 bullet points"
→ Result: Better structure, but still misses nuance

Version 3 (Add reasoning): "Identify the 3 main findings, then summarize each"
→ Result: Consistent, accurate, captures key information
```

### 4. 模板系统

构建包含变量、条件部分和模块化组件的可复用提示词结构。适用于多轮对话、基于角色的交互，或同一种模式适用于不同输入的情况。减少重复，并确保相似任务之间的一致性。

**示例：**

```python
# Reusable code review template
template = """
Review this {language} code for {focus_area}.

Code:
{code_block}

Provide feedback on:
{checklist}
"""

# Usage
prompt = template.format(
    language="Python",
    focus_area="security vulnerabilities",
    code_block=user_code,
    checklist="1. SQL injection\n2. XSS risks\n3. Authentication"
)
```

### 5. 系统提示词设计

设置贯穿整个对话的全局行为和约束。定义模型的角色、专业水平、输出格式和安全准则。使用系统提示词来承载不应随对话轮次变化的稳定指令，从而为可变内容腾出用户消息的 token 空间。

**示例：**

```markdown
System: You are a senior backend engineer specializing in API design.

Rules:
- Always consider scalability and performance
- Suggest RESTful patterns by default
- Flag security concerns immediately
- Provide code examples in Python
- Use early return pattern

Format responses as:
1. Analysis
2. Recommendation
3. Code example
4. Trade-offs
```

## 关键模式

### 渐进式披露

从简单的提示词开始，仅在需要时增加复杂度：

1. **级别 1**：直接指令
   - “总结这篇文章”

2. **级别 2**：添加约束
   - “用 3 个要点总结这篇文章，重点关注关键发现”

3. **级别 3**：添加推理
   - “阅读这篇文章，找出主要发现，然后用 3 个要点进行总结”

4. **级别 4**：添加示例
   - 提供 2 至 3 个带有输入输出对的总结示例

### 指令层级

```
[System Context] → [Task Instruction] → [Examples] → [Input Data] → [Output Format]
```

### 错误恢复

构建能够妥善处理失败情况的提示词：

- 提供备用指令
- 要求给出置信度分数
- 在不确定时要求提供其他可能的解释
- 指定如何表明信息缺失

## 最佳实践

1. **具体明确**：模糊的提示词会产生不一致的结果
2. **展示而非描述**：示例比描述更有效
3. **充分测试**：使用多样化且具有代表性的输入进行评估
4. **快速迭代**：微小的改动也可能产生巨大的影响
5. **监控性能**：在生产环境中跟踪指标
6. **版本控制**：像管理代码一样对提示词进行适当的版本管理
7. **记录意图**：解释提示词为何采用当前结构

## 常见陷阱

- **过度设计**：在尝试简单提示词之前就从复杂提示词开始
- **示例污染**：使用与目标任务不匹配的示例
- **上下文溢出**：因示例过多而超出 token 限制
- **指令模糊**：留下多种解释的空间
- **忽略边界情况**：未对异常输入或边界输入进行测试

## 集成模式

### 与 RAG 系统集成

```python
# Combine retrieved context with prompt engineering
prompt = f"""Given the following context:
{retrieved_context}

{few_shot_examples}

Question: {user_question}

Provide a detailed answer based solely on the context above. If the context doesn't contain enough information, explicitly state what's missing."""
```

### 与验证机制集成

```python
# Add self-verification step
prompt = f"""{main_task_prompt}

After generating your response, verify it meets these criteria:
1. Answers the question directly
2. Uses only information from provided context
3. Cites specific sources
4. Acknowledges any uncertainty

If verification fails, revise your response."""
```

## 性能优化

### 令牌效率

- 删除冗余的单词和短语
- 首次定义后统一使用缩写
- 合并相似的指令
- 将稳定的内容移至系统提示词

### 延迟降低

- 在不牺牲质量的前提下尽量缩短提示词
- 对长篇输出使用流式传输
- 缓存常用的提示词前缀
- 尽可能批量处理相似请求

---

# 智能体提示最佳实践

基于 Anthropic 官方的智能体提示最佳实践。

## 核心原则

### 上下文窗口

“上下文窗口”是指语言模型在生成新文本时能够回顾和引用的全部文本量，加上它所生成的新文本。这不同于训练语言模型所使用的大规模数据语料库，而是代表模型的“工作记忆”。更大的上下文窗口使模型能够理解并响应更复杂、更长的提示词，而较小的上下文窗口可能会限制模型处理较长提示词或在长时间对话中保持连贯性的能力。

- 令牌渐进累积：随着对话逐轮推进，每条用户消息和助手回复都会累积在上下文窗口中。之前的轮次会被完整保留。
- 线性增长模式：上下文使用量会随每一轮对话线性增长，之前的轮次会被完整保留。
- 200K 令牌容量：可用上下文窗口总量（200,000 个令牌）代表 Claude 存储对话历史并生成新输出的最大容量。
- 输入输出流程：每一轮包括：
  - 输入阶段：包含之前的所有对话历史以及当前用户消息
  - 输出阶段：生成文本回复，该回复将成为未来输入的一部分

### 简洁是关键

上下文窗口是一种公共资源。你的提示词、命令和技能会与 Claude 需要了解的其他所有内容共享上下文窗口，包括：

- 系统提示词
- 对话历史
- 其他命令、技能、钩子和元数据
- 你的实际请求

**默认假设**：Claude 已经非常聪明

只添加 Claude 尚不了解的上下文。审视每一条信息：

- “Claude 真的需要这个解释吗？”
- “我可以假设 Claude 已经知道这些吗？”
- “这段内容值得其占用的令牌成本吗？”

**好的示例：简洁**（约 50 个令牌）：

````markdown  theme={null}
## Extract PDF text

Use pdfplumber for text extraction:

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
````

**不好的示例：过于冗长**（约 150 个令牌）：

```markdown  theme={null}
## Extract PDF text

PDF (Portable Document Format) files are a common file format that contains
text, images, and other content. To extract text from a PDF, you'll need to
use a library. There are many libraries available for PDF processing, but we
recommend pdfplumber because it's easy to use and handles most cases well.
First, you'll need to install it using pip. Then you can use the code below...
```

简洁版本假定 Claude 知道 PDF 是什么，以及库如何工作。

### 设置适当的自由度

根据任务的脆弱性和可变性选择具体程度。

**高自由度**（基于文本的说明）：

适用于：

- 多种方法均有效
- 决策取决于上下文
- 使用启发式方法指导处理方式

示例：

```markdown  theme={null}
## Code review process

1. Analyze the code structure and organization
2. Check for potential bugs or edge cases
3. Suggest improvements for readability and maintainability
4. Verify adherence to project conventions
```

**中等自由度**（伪代码或带参数的脚本）：

适用于：

- 存在首选模式
- 允许一定程度的变化
- 配置会影响行为

示例：

````markdown  theme={null}
## Generate report

Use this template and customize as needed:

```python
def generate_report(data, format="markdown", include_charts=True):
    # Process data
    # Generate output in specified format
    # Optionally include visualizations
```
````

**低自由度**（具体脚本，很少或没有参数）：

适用于：

- 操作脆弱且容易出错
- 一致性至关重要
- 必须遵循特定顺序

示例：

````markdown  theme={null}
## Database migration

Run exactly this script:

```bash
python scripts/migrate.py --verify --backup
```

Do not modify the command or add additional flags.
````

**类比**：将 Claude 想象成一个正在探索路径的机器人：

- **两侧都是悬崖的狭窄桥梁**：只有一种安全的前进方式。提供明确的约束和精确的说明（低自由度）。示例：必须严格按照既定顺序执行的数据库迁移。
- **没有危险的开阔地带**：许多路径都能通向成功。给出大致方向，并相信 Claude 能找到最佳路线（高自由度）。示例：最佳方法由上下文决定的代码审查。

# 智能体沟通中的说服原则

适用于编写提示词，包括但不限于：面向 Claude Code 的命令、钩子、技能，或面向子智能体的提示词，以及任何其他 LLM 交互。

## 概述

LLM 会像人类一样响应相同的说服原则。理解这种心理机制有助于你设计出更有效的技能——目的不是操纵，而是确保即使在压力之下，关键实践也能得到遵循。

**研究基础：** Meincke 等人（2025）在 28,000 次 AI 对话中测试了 7 项说服原则。说服技巧使服从率提高了一倍以上（33% → 72%，p < .001）。

## 七项原则

### 1. 权威

**含义：** 对专业知识、资质或官方来源的遵从。

**在提示词中的运作方式：**

- 使用祈使语气："YOU MUST"、"Never"、"Always"
- 不容协商的表述："No exceptions"
- 消除决策疲劳和自我合理化

**适用场景：**

- 强制执行纪律的技能（TDD、验证要求）
- 安全关键型实践
- 已确立的最佳实践

**示例：**

```markdown
✅ Write code before test? Delete it. Start over. No exceptions.
❌ Consider writing tests first when feasible.
```

### 2. 承诺

**它是什么：** 与先前的行动、陈述或公开声明保持一致。

**它如何在提示词中发挥作用：**

- 要求声明："宣布使用技能"
- 强制明确选择："选择 A、B 或 C"
- 使用跟踪机制：使用 TodoWrite 跟踪检查清单

**何时使用：**

- 确保技能得到切实遵循
- 多步骤流程
- 问责机制

**示例：**

```markdown
✅ When you find a skill, you MUST announce: "I'm using [Skill Name]"
❌ Consider letting your partner know which skill you're using.
```

### 3. 稀缺性

**它是什么：** 由时间限制或可用性有限所产生的紧迫感。

**它如何在提示词中发挥作用：**

- 有时间限制的要求："在继续之前"
- 顺序依赖："在 X 之后立即执行"
- 防止拖延

**何时使用：**

- 需要立即验证时
- 时间敏感的工作流
- 防止“我稍后再做”

**示例：**

```markdown
✅ After completing a task, IMMEDIATELY request code review before proceeding.
❌ You can review code when convenient.
```

### 4. 社会认同

**它是什么：** 遵从他人的做法或被视为常态的行为。

**它如何在提示词中发挥作用：**

- 普遍性模式："每次"、"始终"
- 失败模式："没有 Y 的 X = 失败"
- 建立规范

**何时使用：**

- 记录普遍适用的实践
- 警示常见失败
- 强化标准

**示例：**

```markdown
✅ Checklists without TodoWrite tracking = steps get skipped. Every time.
❌ Some people find TodoWrite helpful for checklists.
```

### 5. 一致性

**它是什么：** 共同身份、“我们”的意识和群体归属感。

**它如何在提示词中发挥作用：**

- 协作性语言："我们的代码库"、"我们是同事"
- 共同目标："我们都追求质量"

**何时使用：**

- 协作式工作流
- 建立团队文化
- 非层级式实践

**示例：**

```markdown
✅ We're colleagues working together. I need your honest technical judgment.
❌ You should probably tell me if I'm wrong.
```

### 6. 互惠

**它是什么：** 回报所获益处的义务。

**它如何发挥作用：**

- 谨慎使用——可能会让人感觉受到操纵
- 在提示词中很少需要

**何时避免：**

- 几乎总是避免（其他原则更有效）

### 7. 喜好

**它是什么：** 更愿意与我们喜欢的人合作。

**它如何发挥作用：**

- **不要用于促使遵从**
- 与坦诚反馈文化相冲突
- 会造成谄媚奉承

**何时避免：**

- 在执行纪律要求时始终避免

## 按提示词类型划分的原则组合

| 提示词类型 | 使用 | 避免 |
|------------|-----|-------|
| 纪律执行型 | 权威 + 承诺 + 社会认同 | 喜好、互惠 |
| 指导/技巧型 | 适度的权威 + 一致性 | 过度使用权威 |
| 协作型 | 一致性 + 承诺 | 权威、喜好 |
| 参考型 | 仅追求清晰 | 所有说服原则 |

## 这种方法为何有效：背后的心理学

**明确的界线规则可减少合理化：**

- "YOU MUST" 可消除决策疲劳
- 绝对化语言可避免产生“这是例外吗？”之类的疑问
- 明确反驳合理化借口，可堵住特定漏洞

**执行意图会形成自动化行为：**

- 明确的触发条件 + 必须执行的行动 = 自动执行
- “当 X 发生时，执行 Y”比“通常应执行 Y”更有效
- 减少遵从要求时的认知负担

**LLM 具有类人特征：**

- 使用包含这些模式的人类文本进行训练
- 在训练数据中，权威性语言通常先于遵从行为出现
- 经常学习承诺序列（陈述 → 行动）
- 社会认同模式（所有人都做 X）会建立规范

## 合乎伦理的使用方式

**正当用途：**

- 确保关键实践得到遵循
- 创建有效的文档
- 防止可预见的失败

**不正当用途：**

- 为谋取个人利益而操纵他人
- 制造虚假的紧迫感
- 利用内疚感迫使他人遵从

**判断标准：** 如果用户充分了解这项技术，它是否仍然符合用户的真正利益？

## 快速参考

设计提示词时，请思考：

1. **它属于什么类型？**（纪律约束、指导还是参考）
2. **我试图改变什么行为？**
3. **适用哪些原则？**（纪律约束通常采用权威原则 + 承诺原则）
4. **我是否组合了过多原则？**（不要把全部七项原则都用上）
5. **这合乎伦理吗？**（是否符合用户的真正利益？）