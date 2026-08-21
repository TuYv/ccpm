---
name: moai-workflow-tdd
description: >
  Test-Driven Development workflow specialist using RED-GREEN-REFACTOR
  cycle for test-first software development. Use when developing new
  features from scratch or when behavior specification drives
  implementation.

when_to_use: >
  Use for Test-Driven Development: the RED-GREEN-REFACTOR cycle for
  test-first software development, new-feature implementation from
  scratch, and behavior-specification-driven implementation.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Bash(pytest:*), Bash(ruff:*), Bash(npm:*), Bash(npx:*), Bash(node:*), Bash(jest:*), Bash(vitest:*), Bash(go:*), Bash(cargo:*), Bash(mix:*), Bash(uv:*), Bash(bundle:*), Bash(php:*), Bash(phpunit:*), Grep, Glob
user-invocable: false
metadata:
  version: "1.0.0"
  category: "workflow"
  status: "active"
  updated: "2026-02-03"
  modularized: "true"
  tags: "workflow, tdd, test-driven, red-green-refactor, test-first"
  author: "MoAI-ADK Team"
  related-skills: "moai-workflow-ddd, moai-workflow-testing, moai-foundation-quality"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000
---
# 测试驱动开发（TDD）工作流

## 开发模式配置（关键）

[注意] 此工作流根据 `.moai/config/sections/quality.yaml` 进行选择：

```yaml
constitution:
  development_mode: tdd    # or ddd
```

**何时使用此工作流**：
- `development_mode: tdd` → 使用 TDD（此工作流，默认）
- `development_mode: ddd` → 改用 DDD（moai-workflow-ddd）

**关键区别**：
- **TDD**（默认）：对所有工作采用测试优先开发，包括对棕地项目执行 RED 前分析
- **DDD**：对于测试覆盖率较低的现有代码库，优先编写特征测试

## 快速参考

测试驱动开发提供了一种规范的方法来创建新功能，在实现之前先通过测试定义预期行为。

核心循环——RED-GREEN-REFACTOR：

- RED：编写一个失败的测试，用于定义期望的行为
- GREEN：编写使测试通过所需的最少代码
- REFACTOR：在保持测试通过的同时改进代码结构

何时使用 TDD：

- 从头创建新功能
- 构建不依赖现有代码的独立模块
- 由行为规范驱动开发时
- 具有明确契约的新 API 端点
- 具有明确行为的新 UI 组件
- 绿地项目（较少见——通常使用混合模式更合适）

何时不应使用 TDD：

- 重构现有代码（改用 DDD）
- 主要目标是保持行为不变时
- 没有测试覆盖的遗留代码库（先使用 DDD）
- 修改现有文件时（考虑使用混合模式）

---

## 核心理念

### TDD 与 DDD 对比

TDD 方法：

- 循环：RED-GREEN-REFACTOR
- 目标：通过测试创建新功能
- 起点：尚不存在代码
- 测试类型：定义预期行为的规范测试
- 结果：具有测试覆盖的新可运行代码

DDD 方法：

- 循环：ANALYZE-PRESERVE-IMPROVE
- 目标：在不改变行为的情况下改进结构
- 起点：具有明确行为的现有代码
- 测试类型：捕获当前行为的特征测试
- 结果：结构更优且行为完全相同的代码

### 测试优先原则

TDD 的黄金法则是必须先编写测试，然后再编写实现代码：

- 测试定义契约
- 测试记录预期行为
- 测试能够立即发现回归问题
- 实现由测试要求驱动

---

## 实现指南

### 阶段 1：RED——编写失败的测试

RED 阶段专注于通过失败的测试定义期望的行为。

#### 编写有效的测试

在编写任何实现代码之前：

- 清楚理解需求
- 以测试的形式定义预期行为
- 每次编写一个测试
- 保持测试目标明确且具体
- 使用能够说明行为的描述性测试名称

#### 测试结构

遵循 Arrange-Act-Assert 模式：

- Arrange：设置测试数据和依赖项
- Act：执行被测代码
- Assert：验证预期结果

#### 验证

测试最初必须失败：

- 确认测试确实测试了某些内容
- 确保测试不是意外通过的
- 记录当前状态与期望状态之间的差距

### 阶段 2：GREEN - 让测试通过

GREEN 阶段专注于编写满足测试要求的最少代码。

#### 最小化实现

只编写足以让测试通过的代码：

- 不要过度设计
- 不要添加测试未要求的功能
- 专注于正确性，而非完美性
- 必要时可以硬编码值（稍后再重构）

#### 验证

运行测试以确认其通过：

- 所有断言都必须成功
- 不应破坏任何其他测试
- 实现满足测试要求

### 阶段 3：REFACTOR - 改进代码

REFACTOR 阶段专注于在保持行为不变的同时提升代码质量。

#### 安全重构

以通过的测试作为安全保障：

- 消除重复
- 改进命名和可读性
- 提取方法和类
- 在适当的情况下应用设计模式

#### 持续验证

每个重构步骤完成后：

- 运行所有测试
- 如果任何测试失败，立即还原
- 测试通过后提交

---

## TDD 工作流执行

### 标准 TDD 会话

通过 manager-develop 执行 TDD 时：

步骤 1 - 理解需求：

- 阅读 SPEC 文档以了解功能范围
- 从验收标准中识别测试用例
- 规划测试实现顺序

步骤 2 - RED 阶段：

- 编写第一个失败的测试
- 验证测试因正确的原因而失败
- 记录预期行为

步骤 3 - GREEN 阶段：

- 编写最小化实现
- 运行测试以验证其通过
- 转到下一个测试

步骤 4 - REFACTOR 阶段：

- 检查代码中可改进之处
- 以测试作为安全保障进行重构
- 提交整洁的代码

步骤 5 - 重复：

- 继续 RED-GREEN-REFACTOR 循环
- 直到实现所有需求
- 直到通过所有验收标准

### TDD 循环模式

对于需要多个测试用例的功能：

- 预先识别所有测试用例
- 按依赖关系和复杂度确定优先级
- 针对每个测试用例执行 RED-GREEN-REFACTOR
- 持续维护累积的测试套件

---

## 质量指标

### TDD 成功标准

测试覆盖率（必需）：

- 每次提交的最低覆盖率为 80%
- 新代码建议达到 90%
- 测试所有公共接口

代码质量（目标）：

- 所有测试均通过
- 不得在实现后编写测试
- 使用清晰的测试名称描述行为
- 以最小化实现满足测试要求

### TDD 专属 TRUST 验证

应用以 TDD 为重点的 TRUST 5 框架：

- 可测试性：测试优先的方法可确保可测试性
- 可读性：测试记录预期行为
- 可理解性：测试充当活文档
- 安全性：在实现之前编写安全测试
- 透明性：测试失败可提供即时反馈

---

## 集成点

### 与 DDD 工作流集成

TDD 与 DDD 相辅相成：

- 对新代码使用 TDD
- 对现有代码重构使用 DDD
- 混合模式结合两种方法

### 与测试工作流集成

TDD 与测试工作流集成：

- 使用规范测试
- 与覆盖率工具集成
- 支持通过变异测试评估测试质量

### 与质量框架集成

TDD 输出会提供给质量评估：

- 跟踪覆盖率指标
- 对变更进行 TRUST 5 验证
- 通过质量门禁强制执行标准

---

## 故障排除

### 常见问题

测试过于复杂：

- 拆分为更小、更聚焦的测试
- 每次只测试一种行为
- 使用测试夹具完成复杂的设置

实现增长过快：

- 克制实现未经测试功能的冲动
- 针对新功能回到 RED 阶段
- 保持 GREEN 阶段的实现最小化

重构导致测试失败：

- 立即还原
- 以更小的步骤进行重构
- 确保测试验证的是行为，而不是实现

### 恢复流程

当 TDD 纪律被打破时：

- 停下来评估当前状态
- 为现有代码编写特征测试
- 对剩余功能恢复使用 TDD
- 考虑切换到 Hybrid 模式

---

版本：1.0.0
状态：活跃

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “实现可以工作后，我再添加测试” | 事后测试验证的是代码实际做了什么，而不是它应该做什么。它们会漏掉 RED 阶段能够捕获的缺陷。 |
| “现有测试已经覆盖了这种情况” | 现有测试验证的是旧行为。新行为需要先有自己的失败测试。 |
| “这个函数太简单了，不需要测试” | 简单函数也会逐渐累积复杂性。测试能在行为发生偏移之前记录预期行为。 |
| “我已经在终端中手动测试过了” | 手动检查无法持久保留。明天的变更可能会破坏约定，却不会发出任何信号。 |
| “这个测试需要复杂的模拟” | 如果测试很难编写，那么代码也很难理解。先重构设计。 |
| “测试会拖慢我的速度” | 测试先行能尽早暴露设计问题，而此时修复问题的成本最低。 |
| “为了继续推进，这个周期我会跳过 REFACTOR” | 跳过的重构会不断累积。下一个周期将从更差的基线开始。 |

**DAMP 优于 DRY**：在测试代码中，优先选择“描述性且有意义的短语”，而不是“不要重复自己”。测试中的重复如果能让意图一目了然，就比隐藏意图的抽象更好。

**Beyonce 规则**：如果你喜欢它，就应该为它编写测试。任何未经 CI 验证的行为，最终都会在毫无预警的情况下出问题。

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 实现文件与其测试文件在同一个提交中创建（跳过了 RED 阶段）
- 测试名称描述的是实现（test_function_returns_true），而不是行为（test_user_login_rejects_expired_token）
- 新文件中的所有测试在首次运行时都通过——没有记录 RED 阶段
- 功能已经合并后，提交消息才写着“添加测试”
- 测试套件包含对被测代码的模拟（模拟的是实现，而不是协作者）
- 添加新功能的提交导致覆盖率下降

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] Git 历史记录显示，实现提交之前存在失败测试的提交，或者同一提交中有 RED 阶段的证据
- [ ] 测试名称读起来像行为规范，而不是函数描述
- [ ] 每个新增的公共函数都至少有一个对应的测试用例
- [ ] 完整测试套件通过（粘贴命令输出）
- [ ] 已测量并报告变更文件的覆盖率（显示工具输出）
- [ ] 此次变更中未添加任何 `skip`、`xit` 或已禁用的测试
- [ ] 已执行 REFACTOR 阶段，或已明确说明无需执行的理由

<!-- moai:evolvable-end -->

## 测试优先反作弊

[ZONE:Evolvable] [HARD] 上述危险信号和验证检查清单位于建议性（可演进）区块中，并且不会被任何完成门禁使用。本节将它们提升为两项强制执行的不变量，使测试优先在完成矩阵中具备可证伪性。

- **不变量 i — RED 失败输出是强制性的完成证据。** 必须观察并展示逐字一致的 RED 测试失败输出（在任何实现使其通过之前捕获的失败测试运行输出），作为运行阶段完成证据的一部分。无法提供此输出的运行跳过了 RED，因此不能报告为干净运行。
- **不变量 ii — 在对应失败测试之前编写的实现必须删除，并以测试优先方式重新推导。** 在对应失败测试存在之前编写的任何实现代码都必须删除，并从失败测试重新推导（先 RED，后 GREEN）。“我已经编写了实现，所以测试第一次运行就通过”正是此不变量所禁止的失败模式——这是测试后置，而非测试优先，并且不会留下可作为证据展示的 RED 输出（不变量 i）。

这两项不变量弥合了可证伪性缺口：在引入它们之前，即使没有任何 RED 证据，也可以生成全部通过的自验证矩阵，因此无法通过完成报告区分测试优先与测试后置。引入它们之后，矩阵要求提供逐字一致的 GREEN 前 RED 输出，因此跳过 RED 的运行没有此类输出可供提交，矩阵在结构上也就不完整。