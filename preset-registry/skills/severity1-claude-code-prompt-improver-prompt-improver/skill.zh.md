---
name: prompt-improver
description: This skill enriches vague prompts with targeted research and clarification before execution. Should be used when a prompt is determined to be vague and requires systematic research, question generation, and execution guidance.
---
# Prompt 改进技能

## 目的

通过系统化的研究和有针对性的澄清，将含糊、模糊的提示转化为可执行、定义明确的请求。本技能在 hook 已判定某个提示需要充实之后被调用。

## 本技能何时被调用

**自动调用：**
- UserPromptSubmit hook 对提示进行评估
- Hook 判定提示含糊（缺少具体信息、上下文或明确目标）
- Hook 调用本技能以指导研究和提问

**手动调用：**
- 需要用基于研究的问题来充实含糊的提示时
- 在构建或测试提示评估系统时
- 即使结合对话历史，提示仍缺少足够上下文时

**前提假设：**
- 提示已被识别为含糊
- 评估阶段已完成（由 hook 完成）
- 直接进入研究和澄清环节

## 核心工作流

本技能遵循四阶段方法来充实提示：

### 阶段 1：研究

在提出问题之前，先使用 TodoWrite 创建动态研究计划。

**研究计划模板：**
1. **先检查对话历史** - 如果上下文已经存在，避免重复探索
2. **在需要时审查代码库**：
   - 用 Task/Explore 了解架构和项目结构
   - 用 Grep/Glob 查找特定模式、相关文件
   - 检查 git log 以了解近期变更
   - 搜索错误、失败的测试、TODO/FIXME 注释
3. **在需要时收集额外上下文**：
   - 阅读本地文档文件
   - 用 WebFetch 获取在线文档
   - 用 WebSearch 获取最佳实践、常见做法和最新信息
4. **记录研究发现**，使问题立足于实际项目语境

**关键规则：**
- 绝不跳过研究
- 在探索代码库之前先检查对话历史
- 问题必须基于实际发现，而非假设或基础常识
- Glob、Grep、WebSearch、WebFetch 以及多文件 Read 必须通过 `Task/Explore` 路由——绝不要在主上下文中直接调用它们
- 在每个 Explore 提示中包含与对话相关的上下文（文件路径、错误、先前的决策）——Explore 无法看到之前的对话轮次

关于详细的研究策略、模式和示例，参见 [references/research-strategies.md](references/research-strategies.md)。

### 阶段 2：生成有针对性的问题

基于研究发现，拟定 1-6 个能够澄清模糊之处的问题。

**问题准则：**
- **有依据**：每个选项都来自研究（代码库发现、文档、常见模式）
- **具体**：避免诸如 “Other approach” 这类含糊的选项
- **选择题形式**：每个问题提供 2-4 个具体选项
- **聚焦**：每个问题只针对一个决策点
- **结合语境**：包含对权衡取舍的简要说明

**问题数量：**
- **1-2 个问题**：简单的模糊之处（哪个文件？哪种方法？）
- **3-4 个问题**：中等复杂度（范围 + 方法 + 验证）
- **5-6 个问题**：复杂场景（涉及多个决策点的大型功能）

关于问题模板、有效模式和示例，参见 [references/question-patterns.md](references/question-patterns.md)。

### 阶段 3：获取澄清

使用 AskUserQuestion 工具来呈现基于研究的问题。

**AskUserQuestion 格式：**
```
- question: Clear, specific question ending with ?
- header: Short label (max 12 chars) for UI display
- multiSelect: false (unless choices aren't mutually exclusive)
- options: Array of 2-4 specific choices from research
  - label: Concise choice text (1-5 words)
  - description: Context about this option (trade-offs, implications)
```

**重要：** 务必包含 multiSelect 字段（true/false）。用户始终可以选择 “Other” 来进行自定义输入。

### 阶段 4：结合上下文执行

继续处理原始用户请求，使用以下内容：
- 原始提示的意图
- 用户的澄清回答
- 研究发现和上下文
- 对话历史

像提示从一开始就很清晰那样去执行该请求。

## 示例

### 示例 1：技能调用 → 研究 → 提问 → 执行

**Hook 评估：** 判定提示含糊
**原始提示：** "fix the bug"
**技能被调用：** 是（提示缺少目标和上下文）

**研究计划：**
1. 检查对话历史中的近期错误
2. 探索代码库以查找失败的测试
3. 用 Grep 搜索 TODO/FIXME 注释
4. 检查 git log 中的近期问题区域

**研究发现：**
- 近期对话提到了登录失败
- auth.py:145 存在 try/catch 吞掉错误
- test_auth.py 中有测试失败

**生成的问题：**
1. 你指的是哪个 bug？
   - 登录身份验证失败（auth.py:145）
   - 会话超时问题（session.py:89）
   - Other

**用户回答：** 登录身份验证失败

**执行：** 修复 auth.py:145 中导致登录失败的错误处理问题

### 示例 2：清晰的提示（未调用技能）

**原始提示：** "Refactor the getUserById function in src/api/users.ts to use async/await instead of promises"

**Hook 评估：** 通过所有检查
- 具体目标：src/api/users.ts 中的 getUserById
- 明确动作：重构为 async/await
- 成功标准：使用 async/await 而非 Promise

**技能被调用：** 否（提示清晰，直接继续，不调用技能）

关于展示各种提示类型及其转换的综合示例，参见 [references/examples.md](references/examples.md)。

## 关键原则

1. **默认含糊**：本技能只针对含糊的提示被调用（评估由 hook 完成）
2. **研究先行**：在拟定问题之前务必先收集上下文
3. **问题有据**：使用研究发现，而非假设或基础常识
4. **保持具体**：提供来自实际代码库/上下文的具体选项
5. **保持聚焦**：最多 1-6 个问题，每个问题只针对一个决策点
6. **系统化方法**：遵循四阶段工作流（研究 → 提问 → 澄清 → 执行）

## 渐进式披露

本 SKILL.md 包含核心工作流和 essentials。如需更深入的指导：

- **研究策略**：[references/research-strategies.md](references/research-strategies.md)
- **问题模式**：[references/question-patterns.md](references/question-patterns.md)
- **综合示例**：[references/examples.md](references/examples.md)

仅在需要针对提示改进的特定方面获取详细指导时，才加载这些参考文档。
