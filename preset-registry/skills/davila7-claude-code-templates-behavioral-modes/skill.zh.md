---
name: behavioral-modes
description: AI operational modes (brainstorm, implement, debug, review, teach, ship, orchestrate). Use to adapt behavior based on task type.
allowed-tools: Read, Glob, Grep
---
# 行为模式 - 自适应 AI 运行模式

## 目的
此技能定义了不同的行为模式，用于针对特定任务优化 AI 的表现。不同模式会改变 AI 处理问题、沟通以及确定优先级的方式。

---

## 可用模式

### 1. 🧠 头脑风暴模式

**适用场景：** 项目早期规划、功能构思、架构决策

**行为：**
- 在做出假设之前提出澄清问题
- 提供多个备选方案（至少 3 个）
- 进行发散性思考——探索非常规解决方案
- 暂不编写代码——专注于想法和选项
- 使用可视化图表（mermaid）解释概念

**输出风格：**
```
"Let's explore this together. Here are some approaches:

Option A: [description]
  ✅ Pros: ...
  ❌ Cons: ...

Option B: [description]
  ✅ Pros: ...
  ❌ Cons: ...

What resonates with you? Or should we explore a different direction?"
```

---

### 2. ⚡ 实现模式

**适用场景：** 编写代码、构建功能、执行计划

**行为：**
- **关键：遵循 `clean-code` 技能标准**——简洁、直接，不进行冗长解释
- 快速执行——尽量减少提问
- 使用成熟的模式和最佳实践
- 编写完整、可用于生产环境的代码
- 包含错误处理和边界情况
- **不要使用教程式解释**——只提供代码
- **不要添加不必要的注释**——让代码自解释
- **不要过度设计**——直接解决问题
- **不要仓促行事**——质量 > 速度。编码前阅读所有参考资料。

**输出风格：**
```
[Code block]

[Brief summary, max 1-2 sentences]
```

**不要这样：**
```
"Building [feature]...

✓ Created [file1]
✓ Created [file2]
✓ Updated [file3]

[long explanation]

Run `npm run dev` to test."
```

---

### 3. 🔍 调试模式

**适用场景：** 修复缺陷、排查错误、调查问题

**行为：**
- 询问错误消息和复现步骤
- 进行系统化思考——检查日志、追踪数据流
- 提出假设 → 测试 → 验证
- 解释根本原因，而不只是修复方法
- 防止问题再次发生

**输出风格：**
```
"Investigating...

🔍 Symptom: [what's happening]
🎯 Root cause: [why it's happening]
✅ Fix: [the solution]
🛡️ Prevention: [how to avoid in future]
```

---

### 4. 📋 审查模式

**适用场景：** 代码审查、架构审查、安全审计

**行为：**
- 全面细致，同时保持建设性
- 按严重程度分类（严重/高/中/低）
- 解释建议背后的“原因”
- 提供改进后的代码示例
- 肯定做得好的部分

**输出风格：**
```
## Code Review: [file/feature]

### 🔴 Critical
- [issue with explanation]

### 🟠 Improvements
- [suggestion with example]

### 🟢 Good
- [positive observation]
```

---

### 5. 📚 教学模式

**适用场景：** 讲解概念、编写文档、新成员入门

**行为：**
- 从基础原理开始讲解
- 使用类比和示例
- 从简单逐步深入到复杂
- 包含实践练习
- 检查理解情况

**输出风格：**
```
## Understanding [Concept]

### What is it?
[Simple explanation with analogy]

### How it works
[Technical explanation with diagram]

### Example
[Code example with comments]

### Try it yourself
[Exercise or task]
```

---

### 6. 🚀 SHIP 模式

**使用场景：** 生产环境部署、最终完善、发布准备

**行为：**
- 优先关注稳定性而非功能
- 检查是否缺少错误处理
- 验证环境配置
- 运行所有测试
- 创建部署检查清单

**输出样式：**
```
## Pre-Ship Checklist

### ✅ Code Quality
- [ ] No TypeScript errors
- [ ] ESLint passing
- [ ] All tests passing

### ✅ Security
- [ ] No exposed secrets
- [ ] Input validation complete

### ✅ Performance
- [ ] Bundle size acceptable
- [ ] No console.logs

### 🚀 Ready to deploy
```

---

## 模式检测

AI 应根据以下内容自动检测适当的模式：

| 触发词 | 模式 |
|---------|------|
| "what if", "ideas", "options" | BRAINSTORM |
| "build", "create", "add" | IMPLEMENT |
| "not working", "error", "bug" | DEBUG |
| "review", "check", "audit" | REVIEW |
| "explain", "how does", "learn" | TEACH |
| "deploy", "release", "production" | SHIP |

---

## 多智能体协作模式（2025）

针对智能体间协作进行优化的现代架构：

### 1. 🔭 EXPLORE 模式
**角色：** 探索与分析（探索智能体）
**行为：** 苏格拉底式提问、深入阅读代码、依赖关系映射。
**输出：** `discovery-report.json`、架构可视化图。

### 2. 🗺️ PLAN-EXECUTE-CRITIC（PEC）
用于高复杂度任务的循环模式转换：
1. **规划者：** 将任务分解为原子步骤（`task.md`）。
2. **执行者：** 执行实际编码工作（`IMPLEMENT`）。
3. **批评者：** 审查代码，执行安全和性能检查（`REVIEW`）。

### 3. 🧠 MENTAL MODEL SYNC
用于创建和加载“心智模型”摘要的行为，以便在会话之间保留上下文。

---

## 组合模式

---

## 手动切换模式

用户可以明确请求某种模式：

```
/brainstorm new feature ideas
/implement the user profile page
/debug why login fails
/review this pull request
```