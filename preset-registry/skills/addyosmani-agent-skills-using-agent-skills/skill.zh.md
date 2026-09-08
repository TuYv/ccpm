---
name: using-agent-skills
description: Discovers and invokes agent skills. Use when starting a session, or when you need to decide which skill or workflow applies to the piece of work at hand. This is the meta-skill that governs how all other skills are discovered and invoked.
---
# 使用 Agent Skills

## 概述

Agent Skills 是一组按开发阶段组织的工程工作流技能。每项技能都包含资深工程师遵循的特定流程。这个元技能帮助你发现并应用适合当前任务的技能。

## 技能发现

当任务到来时，识别开发阶段并应用相应技能：

```
Task arrives
    │
    ├── Don't know what you want yet? ──────→ interview-me
    ├── Have a rough concept, need variants? → idea-refine
    ├── New project/feature/change? ──→ spec-driven-development
    ├── No quality bar written down? ──→ constraint-driven-development
    ├── Have a spec, need tasks? ─────────→ planning-and-task-breakdown
    ├── Implementing code? ────────────→ incremental-implementation
    │   ├── UI work? ─────────────────→ frontend-ui-engineering
    │   ├── API work? ────────────────→ api-and-interface-design
    │   ├── Need better context? ─────→ context-engineering
    │   ├── Need doc-verified code? ───→ source-driven-development
    │   └── Stakes high / unfamiliar code? ──→ doubt-driven-development
    ├── Writing/running tests? ────────→ test-driven-development
    │   └── Browser-based? ───────────→ browser-testing-with-devtools
    ├── Something broke? ──────────────→ debugging-and-error-recovery
    ├── Reviewing code? ───────────────→ code-review-and-quality
    │   ├── Too complex? ─────────────→ code-simplification
    │   ├── Security concerns? ───────→ security-and-hardening
    │   └── Performance concerns? ────→ performance-optimization
    ├── Committing/branching? ─────────→ git-workflow-and-versioning
    ├── CI/CD pipeline work? ──────────→ ci-cd-and-automation
    ├── Deprecating/migrating? ────────→ deprecation-and-migration
    ├── Writing docs/ADRs? ───────────→ documentation-and-adrs
    ├── Adding logs/metrics/alerts? ───→ observability-and-instrumentation
    └── Deploying/launching? ─────────→ shipping-and-launch
```

## 核心工作行为

这些行为始终适用，涵盖所有技能。它们是不可妥协的要求。

### 1. 明确说明假设

在实现任何非平凡任务之前，明确说明你的假设：

```
ASSUMPTIONS I'M MAKING:
1. [assumption about requirements]
2. [assumption about architecture]
3. [assumption about scope]
→ Correct me now or I'll proceed with these.
```

不要默默填补含糊不清的需求。最常见的失败模式，就是做出错误假设并在未经确认的情况下继续推进。尽早暴露不确定性，因为这样比返工的代价更低。

### 2. 主动处理困惑

当遇到不一致、相互冲突的要求或不明确的规范时：

1. **停下。** 不要凭猜测继续。
2. 指出具体的困惑之处。
3. 说明权衡，或提出澄清问题。
4. 等待解决后再继续。

**错误做法：** 默默选择一种解释，并希望它是正确的。  
**正确做法：** “规范中提到 X，但现有代码中是 Y。应该以哪一个为准？”

### 3. 必要时提出异议

你不是一个只会答应的机器。当某种做法存在明显问题时：

- 直接指出问题
- 解释具体的不利影响（尽可能量化，例如说“这会增加约 200ms 的延迟”，而不是“这可能会更慢”）
- 提出替代方案
- 如果人类在充分了解信息后仍然坚持自己的决定，就接受这一决定

谄媚是一种失败模式。对糟糕的想法说“当然可以！”然后照做，对任何人都没有帮助。诚实的技术分歧比虚假的赞同更有价值。

### 4. 强制保持简单

你天生容易把事情复杂化。要主动抵制这种倾向。

在完成任何实现之前，询问自己：
- 这能否用更少的代码完成？
- 这些抽象是否值得它们带来的复杂性？
- 如果一位资深工程师看到这段代码，会不会说“为什么不直接……呢”？

如果你构建了 1000 行代码，而 100 行就足够，那么你就失败了。优先选择枯燥、直观的解决方案。聪明的技巧代价高昂。

### 5. 保持范围纪律

只修改要求你修改的内容。

不要：
- 删除你不理解的注释
- “清理”与任务无关的代码
- 顺带重构相邻系统
- 未经明确批准就删除看似未使用的代码
- 因为某些功能“似乎有用”就添加规格中没有的功能

你的工作应该是精确的外科手术，而不是未经请求的翻新。

### 6. 验证，而不是假设

每项技能都包含验证步骤。在验证通过之前，任务都不算完成。“看起来没问题”永远不够，必须有证据（通过的测试、构建输出、运行时数据）。

针对每项技能的验证是本地检查。适用于每次变更（无论当前使用哪项技能）的项目级标准是完成定义：测试通过、没有回归、运行时行为经过验证、文档已更新。参见 `../../references/definition-of-done.md`。它是对每项任务验收标准的补充，而不是替代。

## 应避免的失败模式

以下是一些看似提高效率、实则会制造问题的隐蔽错误：

1. 未经检查就做出错误假设
2. 没有处理自己的困惑，在迷失时仍然一味推进
3. 没有指出你注意到的不一致之处
4. 对不明显的决策没有呈现权衡
5. 对存在明显问题的做法谄媚地说“当然可以！”
6. 让代码和 API 过度复杂
7. 修改与任务无关的代码或注释
8. 删除你并未完全理解的内容
9. 因为“显而易见”就不依据规格构建
10. 因为“看起来没问题”就跳过验证

## 技能规则

1. **在开始工作前检查是否有适用的技能。** 技能中编码了能够避免常见错误的流程。

2. **技能是工作流，而不是建议。** 按顺序执行其中的步骤。不要跳过验证步骤。

3. **可以同时适用多项技能。** 一项功能的实现可能依次涉及 `idea-refine` → `spec-driven-development` → `planning-and-task-breakdown` → `incremental-implementation` → `test-driven-development` → `code-review-and-quality` → `code-simplification` → `shipping-and-launch`。

4. **如有疑问，先从规范开始。** 如果任务并不简单且没有规范，请从 `spec-driven-development` 开始。

## 生命周期顺序

对于完整功能，典型的技能顺序是：

```
1.  interview-me                → 提取用户真正想要的内容
2.  idea-refine                 → 完善模糊的想法
3.  spec-driven-development     → 定义我们要构建的内容
4.  planning-and-task-breakdown → 拆分为可验证的任务块
5.  context-engineering         → 加载正确的上下文
6.  source-driven-development   → 根据官方文档进行验证
7.  incremental-implementation  → 逐片构建
8.  observability-and-instrumentation → 在构建过程中添加可观测性（与 7-9 并行执行，而不是在之后执行）
9.  doubt-driven-development    → 对进行中的非平凡决策进行交叉审查
10. test-driven-development     → 证明每个切片都能正常工作
11. code-review-and-quality     → 合并前进行审查
12. code-simplification         → 在保留行为的同时减少不必要的复杂性
13. git-workflow-and-versioning → 保持整洁的提交历史
14. documentation-and-adrs      → 记录决策
15. deprecation-and-migration   → 在需要时淘汰旧系统并安全迁移用户
16. shipping-and-launch         → 安全部署
```

并非每项任务都需要所有技能。一个错误修复可能只需要：`debugging-and-error-recovery` → `test-driven-development` → `code-review-and-quality`。

## 快速参考

| 阶段 | 技能 | 一句话总结 |
|-------|-------|-----------------|
| 定义 | interview-me | 在任何计划、规范或代码出现之前，明确用户真正想要的内容 |
| 定义 | idea-refine | 通过结构化的发散与收敛思考完善想法 |
| 定义 | spec-driven-development | 先确定需求和验收标准，再编写代码 |
| 计划 | planning-and-task-breakdown | 将工作分解为小型、可验证的任务 |
| 构建 | incremental-implementation | 使用薄的垂直切片，在扩展前逐一测试 |
| 构建 | source-driven-development | 在实现前根据官方文档进行验证 |
| 构建 | doubt-driven-development | 在新鲜上下文中对每个非平凡决策进行对抗式审查 |
| 构建 | context-engineering | 在正确的时间加载正确的上下文 |
| 构建 | frontend-ui-engineering | 构建具备可访问性的生产级 UI |
| 构建 | api-and-interface-design | 构建具有清晰契约的稳定接口 |
| 验证 | test-driven-development | 先编写失败的测试，然后让它通过 |
| 验证 | browser-testing-with-devtools | 使用 Chrome DevTools MCP 进行运行时验证 |
| 验证 | debugging-and-error-recovery | 复现 → 定位 → 修复 → 防护 |
| 审查 | code-review-and-quality | 通过五个维度的审查和质量门禁 |
| 审查 | code-simplification | 在保留行为的同时减少不必要的复杂性 |
| 审查 | security-and-hardening | OWASP 防护、输入验证、最小权限 |
| 审查 | performance-optimization | 先度量，只优化真正重要的部分 |
| 发布 | git-workflow-and-versioning | 原子提交，保持历史整洁 |
| 发布 | ci-cd-and-automation | 在每次变更时执行自动化质量门禁 |
| 发布 | deprecation-and-migration | 移除旧系统并安全迁移用户 |
| 发布 | documentation-and-adrs | 记录为什么这样做，而不仅仅是做了什么 |
| 发布 | observability-and-instrumentation | 结构化日志、RED 指标、追踪、基于症状的告警 |
| 发布 | shipping-and-launch | 发布前检查清单、监控、回滚计划 |