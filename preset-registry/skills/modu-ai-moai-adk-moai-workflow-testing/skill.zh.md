---
name: moai-workflow-testing
description: >
  Use when writing tests, measuring coverage, or running characterization,
  performance, or PR-review QA. Comprehensive specialist combining DDD
  testing, characterization tests, performance profiling, and TRUST 5
  quality-assurance validation.

when_to_use: >
  Use for comprehensive testing and QA: DDD domain-driven testing,
  characterization tests, behavior preservation, performance profiling,
  code and PR review, CI/CD, and TRUST 5 quality-assurance validation.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Bash(pytest:*), Bash(ruff:*), Bash(npm:*), Bash(npx:*), Bash(node:*), Bash(jest:*), Bash(vitest:*), Bash(go:*), Bash(cargo:*), Bash(mix:*), Bash(uv:*), Bash(bundle:*), Bash(php:*), Bash(phpunit:*), Grep, Glob
user-invocable: false
metadata:
  version: "2.4.0"
  category: "workflow"
  status: "active"
  updated: "2026-07-10"
  modularized: "true"
  tags: "workflow, ddd, testing, debugging, performance, quality, review, pr-review"
  author: "MoAI-ADK Team"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000
---
# 开发工作流专家

## 快速参考

统一的开发工作流，结合了 DDD（领域驱动开发）测试、调试指导、性能优化、自动化代码审查和 CI/CD 质量门禁。强调在重构过程中通过特征测试保持行为不变。

核心能力：

- DDD 测试：特征测试（遗留系统）+ 规格测试（全新开发）+ 行为快照
- AI 驱动的调试：错误分析、分类、候选解决方案
- 性能优化：性能分析、瓶颈检测、优化建议
- 自动化代码审查：TRUST 5 框架验证
- PR 代码审查：多智能体模式（Haiku 资格判定 + 5 个 Sonnet 并行审查器）
- 质量保证：集成带有质量门禁的 CI/CD

工作流进程：调试 → 重构 → 优化 → 审查 → 测试 → 性能分析

适用场景：

- 完整的开发生命周期管理
- 质量保证和 CI/CD 集成
- 多语言及性能关键型项目
- 减少技术债务
- PR 代码审查自动化

---

## 实施指南

### 核心概念

工作流由五个集成组件构成：

- AI 驱动的调试：错误分类（语法/运行时/逻辑/集成/性能）以及按可能性排序的候选解决方案
- 智能重构：使用复杂度指标和风险评估进行技术债务分析
- 性能优化：CPU/内存/IO/网络性能分析及优化策略
- DDD 测试管理：面向遗留系统的特征测试（PRESERVE 阶段）+ 面向全新开发的规格测试 + TRUST 5 验证
- 自动化代码审查：采用 TRUST 5 框架并提供可执行的建议

### TRUST 5 框架

包含五个维度的质量评估模型：

- 可测试性：纯函数、可注入依赖、模块化设计
- 可读性：描述性命名、逻辑结构、记录复杂度
- 可理解性：清晰的业务逻辑、恰当的抽象、清楚的概念
- 安全性：输入验证、密钥管理、符合 OWASP 标准（注入/XSS/CSRF）
- 透明度：全面的错误处理、结构化日志、可追踪的问题

总分：采用加权平均，并设有关键维度覆盖规则（安全性/可测试性问题不能被其他维度掩盖）。

完整评估准则请参阅 [TRUST 5 详细维度和评分](${CLAUDE_SKILL_DIR}/references/trust5-framework.md)。

### DDD 测试流程

遗留代码（PRESERVE 阶段）：

1. 编写记录当前行为（而非期望行为）的特征测试
2. 按领域概念组织测试，以呈现领域边界
3. 使用行为快照作为复杂场景的回归保障
4. 验证基线：在进行任何更改之前，所有特征测试均须通过
5. 在持续执行测试的同时进行重构
6. 重构后运行 TRUST 5 验证

全新开发：

1. 从领域需求中推导规格测试（每个测试 = 一条业务规则）
2. 按聚合、实体和值对象组织测试（DDD 通用语言）
3. 使用业务语言而非实现细节来描述行为
4. 通过实现满足规格
5. 使用集成测试进行验证（领域交互 + 不变量）
6. 应用 TRUST 5 验证

### 调试、重构和性能工作流

三者均遵循 6 步模式：捕获/分析 → 分类 → 确定候选方案 → 应用 → 验证 → 记录。

有关详细的流程表，请参阅[调试/重构/性能分步演练](${CLAUDE_SKILL_DIR}/references/workflow-processes.md)。

### 代码审查流程

1. 扫描代码库以确定审查目标
2. 对每个文件应用 TRUST 5 框架
3. 识别关键问题
4. 计算每个文件的评分和汇总评分
5. 生成按优先级排序的建议
6. 创建包含改进路线图的摘要报告

### PR 代码审查（多智能体模式）

5 步多智能体流水线：

1. 资格检查（Haiku）：跳过已关闭/草稿/已审查/无关紧要的 PR
2. 上下文收集：查找每个已修改目录中的 CLAUDE.md，并总结 PR
3. 并行审查（5 个 Sonnet 智能体）：CLAUDE.md 合规性 / 明显缺陷 / git blame / 既往评论 / 代码注释合规性
4. 置信度评分（0-100）：0=误报，25=有一定可能，50=中等，75=高，100=确定
5. 筛选并报告：丢弃置信度 <80 的问题，通过 gh CLI 发布，并附上文件/行号/提交链接

有关智能体角色详情和输出示例，请参阅[PR 审查多智能体架构和输出格式](${CLAUDE_SKILL_DIR}/references/pr-review-multi-agent.md)。

### 多语言支持

各语言的工具链映射（Python pytest+ruff+bandit、JS/TS Jest+ESLint+npm audit、Go go test+staticcheck+gosec、Rust cargo test+clippy+gosec 的对应工具）。

有关各语言的测试/lint/安全/性能工具清单，请参阅[多语言工具链参考](${CLAUDE_SKILL_DIR}/references/multi-language-support.md)。

---

## 高级功能

### 质量门禁配置

三种严格程度模式：

- 严格：所有 TRUST 维度均 ≥ 阈值、关键问题为零、完整覆盖
- 标准：平均评分 ≥ 阈值、没有造成阻塞的关键问题、允许存在警告
- 宽松：只有关键阻塞项才会阻止流程推进

门禁配置：各维度阈值、按严重程度划分的最大问题数、覆盖率目标、性能基准。

### CI/CD 集成

四阶段流水线：代码质量 → 测试 → 性能 → 安全。任何阶段失败时都会终止流水线，并生成该阶段专属的失败报告。

有关任务配置演练，请参阅[CI/CD 集成模式（GitHub Actions + Docker）](${CLAUDE_SKILL_DIR}/references/integration-patterns.md)。

### E2E / 浏览器测试

Playwright 模式（页面对象模型、跨浏览器、视觉回归）和文档查找集成。请参阅 [Playwright 最佳实践](${CLAUDE_SKILL_DIR}/references/playwright-best-practices.md)。

---

## 模块

针对每个工作流阶段的深入模块。这些模块描述的是概念性工作流
（而非可导入的 SDK）——请使用你项目自身的工具链来应用各个模块。可从
[模块索引](${CLAUDE_SKILL_DIR}/modules/INDEX.md)开始，或直接跳转到某个阶段：

- [AI 驱动的调试](${CLAUDE_SKILL_DIR}/modules/ai-debugging.md) — 错误分类 + 候选解决方案
- [智能重构](${CLAUDE_SKILL_DIR}/modules/smart-refactoring.md) — 技术债务分析 + 安全转换
- [性能优化](${CLAUDE_SKILL_DIR}/modules/performance-optimization.md) — 性能分析 + 瓶颈检测
- [自动化代码审查](${CLAUDE_SKILL_DIR}/modules/automated-code-review.md) — TRUST 5 评分 + 静态分析

---

## 配合良好的技能

- moai-domain-backend: 后端测试模式
- moai-domain-frontend: 前端 UI 测试
- moai-foundation-core: SPEC 系统集成
- moai-platform-supabase / moai-platform-vercel / moai-platform-firebase-auth: 平台特定测试
- moai-workflow-project: 项目管理工作流

---

状态：生产就绪
最后更新：2026-07-10
维护方：MoAI-ADK 开发工作流团队
版本：2.5.0（审计整改：语言中立性 + 模块重新链接）

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “这段代码已经由集成测试覆盖了” | 集成测试捕获的缺陷与单元测试不同。测试金字塔的存在是有原因的。 |
| “模拟数据库太难了，我会跳过这个测试” | 如果测试因耦合而难以编写，说明代码需要更合理的抽象边界。 |
| “80% 的覆盖率已经足够好了” | 覆盖率目标是下限，而不是上限。缺失的 20% 往往包含错误处理路径。 |
| “这些只是工具函数，不需要测试” | 工具函数是复用最广泛的代码。工具函数中的缺陷会传播到各处。 |
| “我已经在本地运行过测试了，CI 会通过的” | 环境差异会导致仅在 CI 中出现的失败。应信任 CI 输出，而不是本地运行结果。 |
| “不稳定测试很正常，重新运行就行” | 不稳定测试会掩盖真正的失败。修复其不稳定性，或明确隔离该测试。 |

**左移**：尽可能早地发现并修复缺陷。每个在 CI 而非本地运行的测试都会增加延迟。每个本可作为单元测试却被写成 E2E 测试的测试都会增加脆弱性。

**碧昂丝法则**：如果你喜欢它，就应该为它加上测试。未经测试的行为就是未定义的行为。

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 覆盖率报告显示新增功能后覆盖率有所下降
- 测试文件包含 `t.Skip()` 或 `skip`，但未附带问题跟踪器链接
- 测试名称是自动生成的（test_1、test_2），而不是描述行为的名称
- 没有测试触及新函数的错误/失败分支
- 测试文件导入具体实现，而不是接口

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 测试套件以零失败通过（粘贴命令输出）
- [ ] 已生成覆盖率报告，并且变更包达到 85% 的阈值
- [ ] 错误路径有专门的测试用例（不只是正常路径）
- [ ] 未引入不稳定测试（使用 -count=3 运行以验证稳定性）
- [ ] 已确认测试隔离：每个测试都使用自己的夹具或 t.TempDir()
- [ ] 并发代码已通过竞态检测器检查（go test -race 或等效命令）

<!-- moai:evolvable-end -->