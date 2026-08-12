---
name: using-agent-skills
description: Discovers and invokes agent skills. Use when starting a session or when you need to discover which skill applies to the current task. This is the meta-skill that governs how all other skills are discovered and invoked.
---
# 使用 Agent Skills

## 概述

Agent Skills 是一组按开发阶段组织的工程工作流技能。每项技能都编码了高级工程师遵循的特定流程。此元技能可帮助你发现并应用适合当前任务的技能。

## 技能发现

当任务到来时，识别其所处的开发阶段，并应用相应的技能：

```
Task arrives
    │
    ├── Don't know what you want yet? ──────→ interview-me
    ├── Have a rough concept, need variants? → idea-refine
    ├── New project/feature/change? ──→ spec-driven-development
    ├── Have a spec, need tasks? ──────→ planning-and-task-breakdown
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

## 核心操作行为

这些行为始终适用于所有技能。它们不可妥协。

### 1. 明确提出假设

在实现任何非简单事项之前，明确说明你的假设：

```
ASSUMPTIONS I'M MAKING:
1. [assumption about requirements]
2. [assumption about architecture]
3. [assumption about scope]
→ Correct me now or I'll proceed with these.
```

不要默默补全含糊不清的需求。最常见的失败模式是做出错误假设，并在未经确认的情况下继续推进。尽早暴露不确定性——这样做的成本低于返工。

### 2. 主动处理疑惑

当你遇到不一致、相互冲突的需求或不明确的规范时：

1. **停止。** 不要靠猜测继续推进。
2. 指明具体的疑惑。
3. 说明需要权衡的事项，或提出澄清问题。
4. 等待问题解决后再继续。

**不好的做法：** 默默选择一种解释，并寄希望于它是正确的。
**好的做法：** “我看到规范中写的是 X，但现有代码中是 Y。哪一个优先？”

### 3. 必要时提出异议

你不是一台只会说“是”的机器。当某种方法存在明显问题时：

- 直接指出问题
- 说明具体的不利影响（尽可能量化——用“这会增加约 200ms 的延迟”，而不是“这可能会更慢”）
- 提出替代方案
- 如果对方在充分了解情况后仍决定推翻你的建议，接受其决定

谄媚是一种失败模式。先说“当然可以！”，然后去实现一个糟糕的想法，对任何人都没有帮助。坦诚的技术分歧比虚假的认同更有价值。

### 4. 强制保持简单

你天生倾向于把事情复杂化。要主动抵制这种倾向。

在完成任何实现之前，问问自己：
- 能否用更少的代码完成？
- 这些抽象是否值得其带来的复杂性？
- 资深工程师看到这里时，会不会说“为什么不直接……”？

如果你写了 1000 行，而 100 行就足够，那么你已经失败了。优先选择平淡、直观的解决方案。巧妙是昂贵的。

### 5. 严守范围纪律

只改动要求你改动的内容。

不要：
- 删除你不理解的注释
- “清理”与任务无关的代码
- 以附带影响的方式重构相邻系统
- 未经明确批准就删除看似未使用的代码
- 因为某些功能“似乎有用”而添加规范中没有的功能

你的职责是精准地实施改动，而不是擅自翻新。

### 6. 验证，不要想当然

每个技能都包含验证步骤。在验证通过之前，任务就不算完成。“看起来没问题”永远不够——必须有证据（测试通过、构建输出、运行时数据）。

每个技能的验证是局部检查。无论当前启用的是哪个技能，适用于*每一项*变更的项目级标准都是完成定义：测试通过、无回归、运行时行为已验证、文档已更新。请参阅 `../../references/definition-of-done.md`。它是对每项任务验收标准的补充，而不是替代。

## 应避免的失败模式

以下这些隐蔽错误看似提高了效率，实际上却会制造问题：

1. 未经检查就做出错误假设
2. 未能处理好自己的困惑——在迷失方向时仍埋头推进
3. 没有指出你注意到的不一致之处
4. 面对并非显而易见的决策时，没有说明权衡取舍
5. 对存在明显问题的方案一味迎合（“当然可以！”）
6. 让代码和 API 过度复杂
7. 修改与任务无关的代码或注释
8. 删除自己尚未完全理解的内容
9. 因为“这很明显”而在没有规范的情况下进行构建
10. 因为“看起来没问题”而跳过验证

## 技能规则

1. **开始工作前，检查是否有适用的技能。** 技能中包含能够避免常见错误的流程。

2. **技能是工作流，而不是建议。** 按顺序执行各个步骤。不要跳过验证步骤。

3. **多个技能可以同时适用。** 一项功能实现可能会依次涉及 `idea-refine` → `spec-driven-development` → `planning-and-task-breakdown` → `incremental-implementation` → `test-driven-development` → `code-review-and-quality` → `code-simplification` → `shipping-and-launch`。

4. **如有疑问，先从规范开始。** 如果任务并非微不足道且没有规范，请从 `spec-driven-development` 开始。

## 生命周期顺序

对于一个完整的功能，典型的技能使用顺序如下：

```
1.  interview-me                → Extract what the user actually wants
2.  idea-refine                 → Refine vague ideas
3.  spec-driven-development     → Define what we're building
4.  planning-and-task-breakdown → Break into verifiable chunks
5.  context-engineering         → Load the right context
6.  source-driven-development   → Verify against official docs
7.  incremental-implementation  → Build slice by slice
8.  observability-and-instrumentation → Instrument as you build (runs parallel with 7-9, not after)
9.  doubt-driven-development    → Cross-examine non-trivial decisions in-flight
10. test-driven-development     → Prove each slice works
11. code-review-and-quality     → Review before merge
12. code-simplification         → Reduce unnecessary complexity while preserving behavior
13. git-workflow-and-versioning → Clean commit history
14. documentation-and-adrs      → Document decisions
15. deprecation-and-migration   → Retire old systems and move users safely when needed
16. shipping-and-launch         → Deploy safely
```

并非每项任务都需要用到每个技能。一个错误修复可能只需要：`debugging-and-error-recovery` → `test-driven-development` → `code-review-and-quality`。

## 快速参考

| 阶段 | 技能 | 一句话概述 |
|-------|-------|-----------------|
| 定义 | interview-me | 在任何计划、规范或代码出现之前，明确用户真正想要什么 |
| 定义 | idea-refine | 通过结构化的发散与收敛思维完善想法 |
| 定义 | spec-driven-development | 在编码之前明确需求和验收标准 |
| 规划 | planning-and-task-breakdown | 将工作分解为小型、可验证的任务 |
| 构建 | incremental-implementation | 采用精简的垂直切片，每次扩展前都进行测试 |
| 构建 | source-driven-development | 实现前对照官方文档进行验证 |
| 构建 | doubt-driven-development | 在全新上下文中对每个非简单决策进行对抗式审查 |
| 构建 | context-engineering | 在正确的时间提供正确的上下文 |
| 构建 | frontend-ui-engineering | 构建具备无障碍支持的生产级 UI |
| 构建 | api-and-interface-design | 设计契约清晰的稳定接口 |
| 验证 | test-driven-development | 先编写失败的测试，再使其通过 |
| 验证 | browser-testing-with-devtools | 使用 Chrome DevTools MCP 进行运行时验证 |
| 验证 | debugging-and-error-recovery | 复现 → 定位 → 修复 → 防护 |
| 审查 | code-review-and-quality | 通过质量门禁进行五维审查 |
| 审查 | code-simplification | 在减少不必要复杂性的同时保持行为不变 |
| 审查 | security-and-hardening | OWASP 防护、输入验证、最小权限 |
| 审查 | performance-optimization | 先测量，只优化真正重要的部分 |
| 发布 | git-workflow-and-versioning | 原子提交、整洁的历史记录 |
| 发布 | ci-cd-and-automation | 对每项变更执行自动化质量门禁 |
| 发布 | deprecation-and-migration | 移除旧系统并安全迁移用户 |
| 发布 | documentation-and-adrs | 记录原因，而不仅仅是内容 |
| 发布 | observability-and-instrumentation | 结构化日志、RED 指标、追踪、基于症状的告警 |
| 发布 | shipping-and-launch | 发布前检查清单、监控、回滚计划 |