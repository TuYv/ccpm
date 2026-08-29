---
name: using-agent-skills
description: Discovers and invokes agent skills. Use when starting a session or when you need to discover which skill applies to the current task. This is the meta-skill that governs how all other skills are discovered and invoked.
---
# 使用 Agent Skills

## 概述

Agent Skills 是一组按开发阶段组织的工程工作流技能。每项技能都编码了高级工程师遵循的特定流程。这项元技能可帮助你发现并应用适合当前任务的技能。

## 技能发现

当任务到来时，确定其所处的开发阶段，并应用相应的技能：

```
Task arrives
    │
    ├── Don't know what you want yet? ──────→ interview-me
    ├── Have a rough concept, need variants? → idea-refine
    ├── New project/feature/change? ──→ spec-driven-development
    ├── No quality bar written down? ──→ constraint-driven-development
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

这些行为始终适用，并贯穿所有技能。它们不容妥协。

### 1. 明确说明假设

在实现任何非简单事项之前，请明确说明你的假设：

```
ASSUMPTIONS I'M MAKING:
1. [assumption about requirements]
2. [assumption about architecture]
3. [assumption about scope]
→ Correct me now or I'll proceed with these.
```

不要默默补全含糊不清的需求。最常见的失败模式是做出错误假设，并在未经确认的情况下继续推进。尽早暴露不确定性——这比返工成本更低。

### 2. 主动处理困惑

当你遇到不一致、相互冲突的需求或不清晰的规范时：

1. **停止。** 不要靠猜测继续推进。
2. 指明具体的困惑之处。
3. 说明取舍，或提出澄清问题。
4. 等待问题解决后再继续。

**错误示例：** 默默选择一种解释，并寄希望于它是正确的。
**正确示例：** “我在规范中看到 X，但现有代码中是 Y。应以哪一个为准？”

### 3. 在合理时提出异议

你不是一台只会说“是”的机器。当某种方案存在明显问题时：

- 直接指出问题
- 说明具体的不利影响（尽可能量化——例如说“这会增加约 200 毫秒的延迟”，而不是“这可能会更慢”）
- 提出替代方案
- 如果对方在充分了解情况后仍决定推翻你的建议，接受其决定

谄媚是一种失败模式。先说“当然可以！”，然后去实现一个糟糕的想法，对任何人都没有帮助。坦诚的技术异议比虚假的赞同更有价值。

### 4. 坚持简洁

你的自然倾向是把事情过度复杂化。要主动克制这种倾向。

在完成任何实现之前，问问自己：
- 能否用更少的代码行完成？
- 这些抽象是否值得其带来的复杂性？
- 资深工程师看到后是否会说“为什么不直接……”？

如果你写了 1000 行代码，而 100 行就足够，那么你就失败了。优先选择平淡、直观的解决方案。炫技的代价很高。

### 5. 严守范围

只修改被要求修改的内容。

不要：
- 删除你不理解的注释
- “清理”与任务无关的代码
- 把重构相邻系统当作附带工作
- 未经明确批准就删除看似未使用的代码
- 因为某些功能“似乎有用”就在规范之外添加它们

你的职责是精准处理，而不是擅自翻修。

### 6. 验证，不要想当然

每项技能都包含验证步骤。只有通过验证，任务才算完成。“看起来没问题”绝不充分——必须有证据（测试通过、构建输出、运行时数据）。

每项技能的验证是局部检查。无论启用了哪项技能，适用于*每次*变更的项目级标准都是完成定义：测试通过、没有回归、在运行时验证行为、文档已更新。请参阅 `../../references/definition-of-done.md`。它是对每项任务验收标准的补充，而不是替代。

## 应避免的失败模式

以下是一些看似提高了生产力、实际上却会制造问题的隐蔽错误：

1. 未经检查就做出错误假设
2. 不处理自身的困惑——在迷失方向时仍埋头推进
3. 没有指出自己注意到的不一致
4. 在不显而易见的决策中没有说明权衡取舍
5. 对存在明显问题的方案谄媚迎合（“当然可以！”）
6. 让代码和 API 过度复杂
7. 修改与任务无关的代码或注释
8. 删除自己尚未完全理解的内容
9. 因为“这很明显”就在没有规范的情况下开始构建
10. 因为“看起来没问题”就跳过验证

## 技能规则

1. **开始工作前，检查是否有适用的技能。** 技能中包含可避免常见错误的流程。

2. **技能是工作流，而不是建议。** 按顺序执行各个步骤。不要跳过验证步骤。

3. **可能同时适用多项技能。** 一项功能实现可能需要依次使用 `idea-refine` → `spec-driven-development` → `planning-and-task-breakdown` → `incremental-implementation` → `test-driven-development` → `code-review-and-quality` → `code-simplification` → `shipping-and-launch`。

4. **如有疑问，先从规范开始。** 如果任务并不简单且没有规范，请从 `spec-driven-development` 开始。

## 生命周期顺序

对于完整功能，典型的技能顺序如下：

```
1.  interview-me                → 提取用户真正想要的内容
2.  idea-refine                 → 细化模糊的想法
3.  spec-driven-development     → 定义我们要构建的内容
4.  planning-and-task-breakdown → 拆分为可验证的任务块
5.  context-engineering         → 加载正确的上下文
6.  source-driven-development   → 根据官方文档进行验证
7.  incremental-implementation  → 逐步构建各个切片
8.  observability-and-instrumentation → 在构建过程中添加检测能力（与 7-9 并行运行，而不是在之后运行）
9.  doubt-driven-development    → 在进行过程中对非平凡决策进行交叉审查
10. test-driven-development     → 证明每个切片都能正常工作
11. code-review-and-quality     → 合并前进行审查
12. code-simplification         → 在保持行为不变的同时减少不必要的复杂性
13. git-workflow-and-versioning → 保持干净的提交历史
14. documentation-and-adrs      → 记录决策
15. deprecation-and-migration   → 在需要时淘汰旧系统并安全迁移用户
16. shipping-and-launch         → 安全部署
```

并非每项任务都需要使用所有技能。一个错误修复可能只需要：`debugging-and-error-recovery` → `test-driven-development` → `code-review-and-quality`。

## 快速参考

| 阶段 | 技能 | 一句话总结 |
|-------|-------|-----------------|
| 定义 | interview-me | 在任何计划、规范或代码产生之前，明确用户真正想要的内容 |
| 定义 | idea-refine | 通过结构化的发散与收敛思考来细化想法 |
| 定义 | spec-driven-development | 在编写代码之前确定需求和验收标准 |
| 计划 | planning-and-task-breakdown | 将任务分解为小型、可验证的任务 |
| 构建 | incremental-implementation | 采用精简的垂直切片，在扩展之前逐一进行测试 |
| 构建 | source-driven-development | 在实现之前根据官方文档进行验证 |
| 构建 | doubt-driven-development | 在全新的上下文中对每个非平凡决策进行对抗式审查 |
| 构建 | context-engineering | 在正确的时间提供正确的上下文 |
| 构建 | frontend-ui-engineering | 构建具备可访问性的生产级 UI |
| 构建 | api-and-interface-design | 通过清晰的契约构建稳定的接口 |
| 验证 | test-driven-development | 先编写失败的测试，再让它通过 |
| 验证 | browser-testing-with-devtools | 使用 Chrome DevTools MCP 进行运行时验证 |
| 验证 | debugging-and-error-recovery | 复现 → 定位 → 修复 → 防护 |
| 审查 | code-review-and-quality | 通过五个维度的审查和质量门禁进行检查 |
| 审查 | code-simplification | 在保持行为不变的同时减少不必要的复杂性 |
| 审查 | security-and-hardening | OWASP 防护、输入验证、最小权限 |
| 审查 | performance-optimization | 先进行度量，只优化真正重要的部分 |
| 发布 | git-workflow-and-versioning | 原子提交，保持干净的历史记录 |
| 发布 | ci-cd-and-automation | 在每次变更时执行自动化质量门禁 |
| 发布 | deprecation-and-migration | 移除旧系统并安全迁移用户 |
| 发布 | documentation-and-adrs | 记录为什么这样做，而不仅仅是做了什么 |
| 发布 | observability-and-instrumentation | 结构化日志、RED 指标、追踪、基于症状的告警 |
| 发布 | shipping-and-launch | 发布前检查清单、监控、回滚计划 |