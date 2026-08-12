---
name: meta-cognition-parallel
description: "EXPERIMENTAL: Three-layer parallel meta-cognition analysis. Triggers on: /meta-parallel, 三层分析, parallel analysis, 并行元认知"
argument-hint: "<rust_question>"
---
# 元认知并行分析（实验性）

> **状态：** 实验性 | **版本：** 0.2.0 | **最后更新：** 2025-01-27
>
> 此技能用于测试并行的三层认知分析。

## 概念

此技能不采用顺序分析，而是并行启动三个分析器（每个认知层各一个），然后综合它们的结果。

```
User Question
     │
     ▼
┌─────────────────────────────────────────────────────┐
│            meta-cognition-parallel                   │
│                  (Coordinator)                       │
└─────────────────────────────────────────────────────┘
     │
     ├─── Layer 1 ──► Language Mechanics ──► L1 Result
     │
     ├─── Layer 2 ──► Design Choices     ──► L2 Result
     │                                            ├── Parallel (Agent Mode)
     │                                            │   or Sequential (Inline)
     └─── Layer 3 ──► Domain Constraints ──► L3 Result
     │
     ▼
┌─────────────────────────────────────────────────────┐
│              Cross-Layer Synthesis                   │
│         (In main context with all results)          │
└─────────────────────────────────────────────────────┘
     │
     ▼
Domain-Correct Architectural Solution
```

## 用法

```
/meta-parallel <your Rust question>
```

**示例：**
```
/meta-parallel 我的交易系统报 E0382 错误，应该用 clone 吗？
```

## 执行模式检测

**关键：首先检查代理文件是否可用，以确定执行模式。**

尝试读取各层分析器文件：
- `../../agents/layer1-analyzer.md`
- `../../agents/layer2-analyzer.md`
- `../../agents/layer3-analyzer.md`

---

## 代理模式（插件安装）——并行执行

**当所有层分析器文件都存在于 `../../agents/` 时：**

### 步骤 1：解析用户查询

从 `$ARGUMENTS` 中提取：
- 原始问题
- 所有代码片段
- 领域提示（交易、Web、嵌入式等）

### 步骤 2：启动三个并行代理

**关键：在同一条消息中启动全部三个任务，以实现并行执行。**

```
Read agent files, then launch in parallel:

Task(
  subagent_type: "general-purpose",
  run_in_background: true,
  prompt: <content of ../../agents/layer1-analyzer.md>
          + "\n\n## User Query\n" + $ARGUMENTS
)

Task(
  subagent_type: "general-purpose",
  run_in_background: true,
  prompt: <content of ../../agents/layer2-analyzer.md>
          + "\n\n## User Query\n" + $ARGUMENTS
)

Task(
  subagent_type: "general-purpose",
  run_in_background: true,
  prompt: <content of ../../agents/layer3-analyzer.md>
          + "\n\n## User Query\n" + $ARGUMENTS
)
```

### 步骤 3：收集结果

等待全部三个代理完成。每个代理都会返回结构化分析。

### 步骤 4：跨层综合

获得全部三个结果后，按照下方模板进行综合。

---

## 内联模式（仅安装技能）——顺序执行

**当层分析器文件不可用时，直接执行分析：**

### 步骤 1：解析用户查询

与代理模式相同——从 `$ARGUMENTS` 中提取问题、代码和领域提示。

### 第 2 步：执行第 1 层——语言机制

分析所涉及的 Rust 语言机制：

```markdown
## Layer 1: Language Mechanics

**Error/Pattern Identified:**
- Error code: E0XXX (if applicable)
- Pattern: ownership/borrowing/lifetime/etc.

**Root Cause:**
[Explain why this error occurs in terms of Rust's ownership model]

**Language-Level Solutions:**
1. [Solution 1]: description
2. [Solution 2]: description

**Confidence:** HIGH | MEDIUM | LOW
**Reasoning:** [Why this confidence level]
```

**重点关注领域：**
- 所有权规则（移动、复制、借用）
- 生命周期标注
- 借用规则（共享与可变）
- 错误代码及其含义

### 第 3 步：执行第 2 层——设计选择

分析设计模式和权衡取舍：

```markdown
## Layer 2: Design Choices

**Design Pattern Context:**
- Current approach: [What pattern is being used]
- Problem: [Why it conflicts with Rust's rules]

**Design Alternatives:**
| Pattern | Pros | Cons | When to Use |
|---------|------|------|-------------|
| Pattern A | ... | ... | ... |
| Pattern B | ... | ... | ... |

**Recommended Pattern:**
[Which pattern fits best and why]

**Confidence:** HIGH | MEDIUM | LOW
**Reasoning:** [Why this confidence level]
```

**重点关注领域：**
- 智能指针的选择（Box、Rc、Arc）
- 内部可变性模式（Cell、RefCell、Mutex）
- 所有权转移与共享
- 克隆与引用

### 第 4 步：执行第 3 层——领域约束

分析特定领域的要求：

```markdown
## Layer 3: Domain Constraints

**Domain Identified:** [trading/fintech | web | CLI | embedded | etc.]

**Domain-Specific Requirements:**
- [ ] Performance: [requirements]
- [ ] Safety: [requirements]
- [ ] Concurrency: [requirements]
- [ ] Auditability: [requirements]

**Domain Best Practices:**
1. [Best practice 1]
2. [Best practice 2]

**Constraints on Solution:**
- MUST: [hard requirements]
- SHOULD: [soft requirements]
- AVOID: [anti-patterns for this domain]

**Confidence:** HIGH | MEDIUM | LOW
**Reasoning:** [Why this confidence level]
```

**重点关注领域：**
- 行业要求（金融科技监管、Web 可扩展性等）
- 性能约束
- 安全性和正确性要求
- 该领域中的常见模式

### 第 5 步：跨层综合

综合所有三个层次：

```markdown
## Cross-Layer Synthesis

### Layer Results Summary

| Layer | Key Finding | Confidence |
|-------|-------------|------------|
| L1 (Mechanics) | [Summary] | [Level] |
| L2 (Design) | [Summary] | [Level] |
| L3 (Domain) | [Summary] | [Level] |

### Cross-Layer Reasoning

1. **L3 → L2:** [How domain constraints affect design choice]
2. **L2 → L1:** [How design choice determines mechanism]
3. **L1 ← L3:** [Direct domain impact on language features]

### Synthesized Recommendation

**Problem:** [Restated with full context]

**Solution:** [Domain-correct architectural solution]

**Rationale:**
- Domain requires: [L3 constraint]
- Design pattern: [L2 pattern]
- Mechanism: [L1 implementation]

### Confidence Assessment

- **Overall:** HIGH | MEDIUM | LOW
- **Limiting Factor:** [Which layer had lowest confidence]
```

---

## 输出模板

两种模式生成相同的输出格式：

```markdown
# Three-Layer Meta-Cognition Analysis

> Query: [User's question]

---

## Layer 1: Language Mechanics
[L1 analysis result]

---

## Layer 2: Design Choices
[L2 analysis result]

---

## Layer 3: Domain Constraints
[L3 analysis result]

---

## Cross-Layer Synthesis

### Reasoning Chain
```
L3 Domain: [Constraint]
    ↓ implies
L2 Design: [Pattern]
    ↓ implemented via
L1 Mechanism: [Feature]
```

### Final Recommendation

**Do:** [Recommended approach]

**Don't:** [What to avoid]

**Code Pattern:**
```rust
// Recommended implementation
```

---

*Analysis performed by meta-cognition-parallel v0.2.0 (experimental)*
```

---

## 测试场景

### 测试 1：交易系统 E0382
```
/meta-parallel 交易系统报 E0382，trade record 被 move 了
```

预期结果：L3 识别出金融科技约束 → L2 建议共享不可变模式 → L1 推荐 Arc<T>

### 测试 2：Web API 并发
```
/meta-parallel Web API 中多个 handler 需要共享数据库连接池
```

预期结果：L3 识别出 Web 约束 → L2 建议使用连接池 → L1 推荐 Arc<Pool>

### 测试 3：CLI 工具配置
```
/meta-parallel CLI 工具如何处理配置文件和命令行参数的优先级
```

预期结果：L3 识别出 CLI 约束 → L2 建议使用配置优先级模式 → L1 推荐构建器模式

---

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| 找不到 Agent 文件 | 仅安装了 Skills | 使用内联模式（顺序执行） |
| Agent 超时 | 分析复杂 | 等待更长时间或使用内联模式 |
| 分层结果不完整 | Agent 问题 | 使用内联分析补全 |

## 局限性

- **Agent 模式：** 并行执行，速度更快，但需要安装插件
- **内联模式：** 顺序执行，速度较慢，但可在任何环境中使用
- 跨层综合的质量取决于结果结构
- 延迟可能高于简单的单层分析

## 反馈

此功能尚处于实验阶段。请报告问题并提出建议，以帮助改进三层分析方法。