---
name: enhance-prompts
description: "Use when improving general prompts for structure, examples, and constraints."
version: 5.1.0
argument-hint: "[path] [--fix]"
---
# enhance-prompts

分析提示词的清晰度、结构、示例和输出可靠性。

## 解析参数

```javascript
const args = '$ARGUMENTS'.split(' ').filter(Boolean);
const targetPath = args.find(a => !a.startsWith('--')) || '.';
const fix = args.includes('--fix');
```

## 与 enhance-agent-prompts 的区别

| Skill | 关注点 | 使用场景 |
|-------|-------|----------|
| `enhance-prompts` | 提示词质量（清晰度、结构、示例） | 通用提示词、系统提示词、模板 |
| `enhance-agent-prompts` | Agent 配置（frontmatter、工具、模型） | 包含 YAML frontmatter 的 Agent 文件 |

## 工作流程

1. **运行分析器** - 执行 JavaScript 分析器以获取发现项：
   ```bash
   node -e "const a = require('./lib/enhance/prompt-analyzer.js'); console.log(JSON.stringify(a.analyzeAllPrompts('.'), null, 2));"
   ```
   对于特定路径：`a.analyzeAllPrompts('./plugins/enhance')`
   对于单个文件：`a.analyzePrompt('./path/to/file.md')`

2. **解析结果** - 分析器返回包含 `summary` 和 `findings` 的 JSON
3. **筛选** - 根据 --verbose 标志应用确定性筛选
4. **报告** - 将发现项格式化为 Markdown 输出
5. **修复** - 如果存在 --fix 标志，则应用发现项中的自动修复

JavaScript 分析器（`lib/enhance/prompt-analyzer.js`）实现了所有检测模式，包括基于 AST 的代码验证。以下模式为参考文档。

---

## 提示工程知识参考

### 系统提示词结构

有效的系统提示词包括：角色/身份、能力与约束、指令优先级、输出格式、行为指令、示例、错误处理。

**最小模板：**
```xml
<system>
You are [ROLE]. [PURPOSE].
Key constraints: [CONSTRAINTS]
Output format: [FORMAT]
When uncertain: [HANDLING]
</system>
```

### XML 标签（Claude 专用）

Claude 针对 XML 标签进行了微调。可使用：`<role>`、`<constraints>`、`<output_format>`、`<examples>`、`<instructions>`、`<context>`

```xml
<constraints>
- Maximum response length: 500 words
- Use only Python 3.10+ syntax
</constraints>
```

### 少样本示例

- 2-5 个示例为最佳数量（有研究支持）
- 包含边界情况，并确保格式一致
- 从零样本开始，仅在需要时添加示例
- 在相关情况下，同时展示正确和错误的示例

### 思维链（CoT）

| 使用 CoT | 不使用 CoT |
|---------|---------------|
| 复杂的多步推理 | 简单的事实性问题 |
| 数学和逻辑问题 | 分类任务 |
| 代码调试 | 模型具备内置推理能力时 |

**关键点：** 现代模型（Claude 4.x、o1/o3）会在内部执行 CoT。“逐步思考”是多余的。

### 角色提示

**有帮助：** 创意任务、语气/风格、角色扮演
**没有帮助：** 准确性任务、事实检索、复杂推理

更好的方式：“采用系统化方法，并展示过程”，而不是“你是一名专家”

### 指令层级

优先级：系统 > 开发者 > 用户 > 检索内容

对于包含多个约束来源的提示词，应明确说明优先级。

### 负向提示

正向替代方案比负向表达更有效：

| 效果较差 | 效果更好 |
|----------------|----------------|
| “不要使用 Markdown” | “使用散文段落” |
| “不要含糊其辞” | “使用具体的语言” |

### 结构化输出

- 基于提示词：可靠性约为 35.9%
- Schema 强制约束：可靠性为 100%
- 始终提供 schema 示例并验证输出

### 上下文窗口优化

**中间信息丢失：**模型会赋予开头和结尾更高的权重。

将关键约束放在开头，示例放在中间，错误处理放在结尾。

### 扩展思考

高层级指令（“深入思考”）比逐步指导更有效。“逐步思考”对于现代模型而言是多余的。

### 反模式快速参考

| 反模式 | 问题 | 修复方法 |
|--------------|---------|-----|
| 模糊指代 | “上面的代码”会丢失上下文 | 明确引用具体内容 |
| 仅使用负向表达 | “不要做 X”却不提供替代方案 | 说明应该做什么 |
| 激进强调 | “关键：必须” | 使用正常语言 |
| 冗余的思维链 | 浪费 token | 让模型自行处理 |
| 关键信息被埋没 | 中间信息丢失 | 放在开头或结尾 |

---

## 检测模式

### 1. 清晰度问题（高确定性）

**模糊指令：**“通常”“有时”“尝试”“如果可能”“也许”“可以”

**仅使用负向表达的约束：**使用“不要”“绝不”“避免”，却未说明应该做什么

**激进强调：**过度使用大写字母（CRITICAL、IMPORTANT）、多个感叹号 !!

### 2. 结构问题（高/中确定性）

**缺少 XML 结构：**复杂提示词（>800 tokens）未使用 XML 标签

**章节不一致：**混用不同的标题样式、跳过标题层级（H1→H3）

**关键信息被埋没：**重要指令位于中间 40% 的位置、约束出现在示例之后

### 3. 示例问题（高/中确定性）

**缺少示例：**复杂任务未提供少样本示例、格式要求未提供示例

**数量不理想：**只有 1 个示例（最佳数量：2-5 个），或超过 7 个（内容臃肿）

**缺少对比：**未标注好/坏示例，未涵盖边界情况

### 4. 上下文问题（中确定性）

**缺少原因说明：**规则没有解释原因

**缺少优先级：**存在多个约束章节，却未说明如何解决冲突

### 5. 输出格式问题（高/中确定性）

**缺少格式：**内容较多的提示词未指定格式

**JSON 缺少 Schema：**要求输出 JSON，却未提供示例结构

### 6. 反模式（高/中/低确定性）

**冗余的思维链（高）：**对现代模型使用“逐步思考”

**过度规定（中）：**包含 10 个以上的编号步骤，对推理过程进行微观管理

**提示词臃肿（低）：**超过 2500 tokens，包含冗余指令

**模糊指代（高）：**“上面的代码”“如前所述”

---

## 自动修复实现

### 1. 激进强调
将 CRITICAL→critical、!!→!，并移除过度使用的大写字母

### 2. 将仅使用负向表达改为正向表达
为“不要”类陈述建议正向替代方案

---

## 输出格式

```markdown
## Prompt Analysis: {prompt-name}

**File**: {path}
**Type**: {system|agent|skill|template}
**Token Count**: ~{tokens}

### Summary
- HIGH: {count} issues
- MEDIUM: {count} issues

### Clarity Issues ({n})
| Issue | Location | Fix | Certainty |

### Structure Issues ({n})
| Issue | Location | Fix | Certainty |

### Example Issues ({n})
| Issue | Location | Fix | Certainty |
```

---

## 模式统计

| 类别 | 模式数 | 可自动修复 |
|----------|----------|--------------|
| 清晰度 | 4 | 1 |
| 结构 | 4 | 0 |
| 示例 | 4 | 0 |
| 上下文 | 2 | 0 |
| 输出格式 | 3 | 0 |
| 反模式 | 4 | 0 |
| **总计** | **21** | **1** |

---

<examples>
### 示例：模糊的指令

<bad_example>
```markdown
You should usually follow best practices when possible.
```
**问题所在**：模糊的限定词会降低确定性。
</bad_example>

<good_example>
```markdown
Follow these practices:
1. Validate input before processing
2. Handle null/undefined explicitly
```
**优点所在**：指令具体且可操作。
</good_example>

### 示例：仅包含否定形式的约束

<bad_example>
```markdown
- Don't use vague language
- Never skip validation
```
**问题所在**：只说明了不应做什么。
</bad_example>

<good_example>
```markdown
- Use specific, deterministic language
- Always validate input; return structured errors
```
**优点所在**：每项约束都包含正向操作。
</good_example>

### 示例：冗余的思维链

<bad_example>
```markdown
Think through this step by step:
1. First, analyze the input
2. Then, identify the key elements
```
**问题所在**：现代模型会在内部完成这些步骤，因而浪费 token。
</bad_example>

<good_example>
```markdown
Analyze the input carefully before responding.
```
**优点所在**：提供高层指导，而不过度干预细节。
</good_example>

### 示例：缺少输出格式

<bad_example>
```markdown
Respond with a JSON object containing the analysis results.
```
**问题所在**：没有 schema 或示例。
</bad_example>

<good_example>
```markdown
## Output Format
{"status": "success|error", "findings": [{"severity": "HIGH"}]}
```
**优点所在**：具体的 schema 展示了确切的结构。
</good_example>

### 示例：关键信息埋藏过深

<bad_example>
```markdown
# Task
[task]
## Background
[500 words...]
## Important Constraints  <- buried at end
```
**问题所在**：会受到「中间信息丢失」效应的影响。
</bad_example>

<good_example>
```markdown
# Task
## Critical Constraints  <- at start
[constraints]
## Background
```
**优点所在**：将关键信息放在注意力最高的开头。
</good_example>
</examples>

---

## 约束

- 仅对确定性为 HIGH 的问题应用自动修复
- 保留原始结构和格式
- 根据上方嵌入的知识参考进行验证