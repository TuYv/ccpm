---
name: vc-sequential-thinking
description: Apply step-by-step analysis for complex problems with revision capability. Use for multi-step reasoning, hypothesis verification, adaptive planning, problem decomposition, course correction.
license: MIT
argument-hint: "[problem to analyze step-by-step]"
trigger_keywords: complex problem, think through, analyze step by step
layer: helper
metadata:
  author: claudekit
  version: "1.0.0"
---
# 顺序思考

> **输出风格：** 遵循 `process/development-protocols/communication-standards.md` —— 结论先行、语言平实、不使用未解释的术语、长回复提供 TL;DR。

通过可管理、可反思的思维序列进行结构化的问题解决，并支持动态调整。

## 何时应用

- 复杂问题分解
- 具备修订能力的自适应规划
- 需要中途纠偏的分析
- 范围不明确/逐步显现的问题
- 需要维持上下文的多步骤解决方案
- 假设驱动的调查/调试

## 核心流程

### 1. 先做粗略估算
```
Thought 1/5: [Initial analysis]
```
随着理解的深入，动态调整估算。

### 2. 结构化每条思路
- 明确地基于先前的上下文进行构建
- 每条思路只处理一个方面
- 说明假设、不确定性与新认识
- 指出下一条思路应处理什么

### 3. 应用动态调整
- **扩展**：发现更多复杂之处 → 增加总数
- **收缩**：比预期更简单 → 减少总数
- **修订**：新认识使先前内容失效 → 标记修订
- **分支**：存在多种方法 → 探索备选方案

### 4. 需要时进行修订
```
Thought 5/8 [REVISION of Thought 2]: [Corrected understanding]
- Original: [What was stated]
- Why revised: [New insight]
- Impact: [What changes]
```

### 5. 分支探索备选方案
```
Thought 4/7 [BRANCH A from Thought 2]: [Approach A]
Thought 4/7 [BRANCH B from Thought 2]: [Approach B]
```
明确比较各分支，并带着决策理由完成收敛。

### 6. 生成并验证假设
```
Thought 6/9 [HYPOTHESIS]: [Proposed solution]
Thought 7/9 [VERIFICATION]: [Test results]
```
迭代直到假设得到验证。

### 7. 仅在准备好时完成
将最后一条标记为：`Thought N/N [FINAL]`

满足以下条件时完成：
- 解决方案已验证
- 所有关键方面均已处理
- 已建立信心
- 不存在遗留的不确定性

## 应用模式

**显式**：当复杂度需要展示推理过程或用户要求分步拆解时，使用可见的思路标记。

**隐式**：在日常问题解决中于内部应用该方法论，在借助思考提升准确性的同时不让回复变得杂乱。

## 脚本（可选）

用于确定性验证/追踪的可选脚本：
- `scripts/process-thought.js` - 验证并追踪思路（含历史记录）
- `scripts/format-thought.js` - 格式化以便显示（box/markdown/simple）

用法示例参见 README.md。在需要验证/持久化时使用；否则直接应用方法论。

## 参考资料

在需要更深入的理解时加载：
- `references/core-patterns.md` - 修订与分支模式
- `references/examples-api.md` - API 设计示例
- `references/examples-debug.md` - 调试示例
- `references/examples-architecture.md` - 架构决策示例
- `references/advanced-techniques.md` - 螺旋式精炼、假设检验、收敛
- `references/advanced-strategies.md` - 不确定性、修订级联、元思考
