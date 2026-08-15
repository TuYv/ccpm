---
name: brainstorming
description: Structures collaborative dialogue to turn rough ideas into implementation-ready designs. This skill should be used when the user has a new idea, feature request, ambiguous requirement, or asks to "brainstorm a solution" before implementation begins.
user-invocable: true
allowed-tools: ["Bash(git-agent:*)", "Bash(git:*)", "Bash(${CLAUDE_PLUGIN_ROOT}/scripts/setup-superpower-loop.sh:*)"]
---
# 将头脑风暴想法转化为设计

通过使用 Superpower Loop 开展结构化的协作对话和持续迭代，将粗略想法转化为可直接实施的设计。

## 关键：第一步操作——立即启动 Superpower Loop

**这必须是你的第一步操作。在启动 Superpower Loop 之前，不要探索代码库，不要提问，也不要执行任何其他操作。**

1. 将 `$ARGUMENTS` 作为初始提示词
2. 立即运行：
```bash
"${CLAUDE_PLUGIN_ROOT}/scripts/setup-superpower-loop.sh" "Brainstorm: $ARGUMENTS. Continue progressing through the superpowers:brainstorming skill phases: Phase 1 (Discovery) → Phase 2 (Option Analysis) → Phase 3 (Design Creation) → Phase 4 (Design Reflection) → Phase 5 (Git Commit) → Phase 6 (Transition)." --completion-promise "BRAINSTORMING_COMPLETE" --max-iterations 50
```
3. 只有在循环运行后，才能继续探索代码库并进入阶段 1

**该循环可在整个头脑风暴过程中实现自我参照式迭代。**

## Superpower Loop 集成

此技能使用 Superpower Loop 在整个头脑风暴过程中实现自我参照式迭代。

**关键要求**：在整个过程中，仅当满足以下条件时，你才可以输出 `<promise>BRAINSTORMING_COMPLETE</promise>`：
- 阶段 1-4（探索、方案分析、设计创建、设计反思）均已完成
- 已创建设计文件夹，且其中包含所有必需文档
- 已在阶段 2 获得用户批准
- 已完成 Git 提交

在所有条件都确实满足之前，不要输出该承诺。

**绝对的末尾输出规则**：承诺标签必须是你输出的最后一段文本。请在承诺标签之前输出所有过渡消息或面向用户的说明。`<promise>BRAINSTORMING_COMPLETE</promise>` 之后不得有任何内容。

## 初始化

（Superpower Loop 已在上述关键第一步操作中启动——不要再次启动）

1. **上下文检查**：确保你已阅读 `CLAUDE.md` 和 `README.md`，以了解项目约束。
2. **代码库索引**：确认你可以访问代码库并执行搜索。

循环将持续贯穿所有阶段，直到输出 `<promise>BRAINSTORMING_COMPLETE</promise>`。

## 核心原则

1. **按顺序收敛**：澄清 → 比较 → 选择 → 设计 → 反思 → 提交 → 过渡
2. **上下文优先**：先探索代码库，再提问
3. **增量验证**：进入下一阶段前，先验证当前阶段
4. **坚决遵循 YAGNI**：仅包含明确需要的内容
5. **测试优先思维**：始终包含 BDD 规格说明——加载 `superpowers:behavior-driven-development` 技能

## 阶段 1：探索

先探索代码库，然后提出聚焦的问题以明确需求。

**操作**：

1. **探索代码库**——使用 Read/Grep/Glob 查找相关文件和模式
2. **审查上下文**——检查 docs/、README.md、CLAUDE.md 和近期提交
3. **识别缺口**——确定哪些内容无法仅通过代码库弄清楚
4. **提出问题**——使用 AskUserQuestion，每次调用只提出 1 个问题
   - 优先使用多项选择题（2-4 个选项）
   - 每次只问一个问题，绝不合并提问
   - 根据探索中发现的缺口提问

**开放式问题背景**：

如果问题看起来是开放式的、含糊不清的，或需要挑战既有假设：
- 考虑运用第一性原理思维来识别根本价值主张
- 反复追问“为什么”，直至触及核心真相
- 准备好在阶段 2 中**显式加载 `superpowers:build-like-iphone-team` 技能**，以采用激进创新方法

**复杂度评估**（决定阶段 3 和阶段 4 的子代理策略）：

在探索结束时，对范围进行分类：
- **简单**（单个文件/组件，有明确模式可遵循）：在阶段 3 和阶段 4 中跳过子代理——由主代理直接处理
- **中等**（跨模块，涉及一些架构决策）：阶段 3 使用 2 个子代理（架构与 BDD 合并、上下文），阶段 4 使用 2 个反思子代理
- **复杂**（新系统、大规模重构、多个集成点）：阶段 3 和阶段 4 均使用完整的 3 个或更多子代理

在继续之前明确说明评估结果。

**输出**：清晰的需求、约束、成功标准、相关模式和复杂度评估。

有关详细模式和提问指南，请参阅 `./references/discovery.md`。
有关阶段 1 的验证清单，请参阅 `./references/exit-criteria.md`。

## 阶段 2：选项分析

研究现有模式，提出可行选项，并获得用户批准。

**操作**：

1. **研究** - 在代码库中搜索类似实现
2. **识别选项** - 提出 2-3 个基于代码库实际情况的选项，或解释“没有替代方案”
3. **呈现** - 使用对话式表达，首先给出推荐选项，并说明权衡取舍
4. **获得批准** - 使用 AskUserQuestion，每次提出一个问题，直到明确为止

**激进创新背景**：

如果问题涉及：
- 挑战行业惯例或“事情通常是如何完成的”
- 创建新的产品类别，而不是改进现有产品
- 质疑基本假设
- 需要颠覆性思维的开放式或含糊需求

那么，使用 Skill 工具**显式加载 `superpowers:build-like-iphone-team` 技能**，以应用 iPhone 设计理念（第一性原理思维、突破性技术、体验驱动的规格、内部竞争、Purple Dorm 隔离机制）。

**输出**：经用户批准的方法，且其理由和权衡取舍已得到理解。

有关比较和呈现模式，请参阅 `./references/options.md`。
有关阶段 2 的验证清单，请参阅 `./references/exit-criteria.md`。

## 阶段 3：创建设计

创建设计文档。根据**阶段 1 的复杂度评估**调整子代理的使用方式。

**简单**：主代理直接处理所有研究和文档创建工作。无需子代理——探索代码库、搜索最佳实践、编写 BDD 场景，并一次性创建设计文档。

**中等**（2 个子代理）：

**子代理 1：架构与最佳实践研究**
- 重点：现有模式、库、使用 WebSearch 搜索最佳实践、安全性、性能
- 加载 `superpowers:behavior-driven-development` 技能
- 输出：架构建议、BDD 场景、最佳实践摘要

**子代理 2：上下文与需求综合**
- 重点：综合阶段 1 和阶段 2 的结果
- 输出：上下文摘要、需求列表、成功标准

**复杂**（3 个以上子代理）：

**子代理 1：架构研究**
- 重点：代码库中的现有模式、架构和库
- 使用 WebSearch 获取最新最佳实践
- 输出：包含代码库引用的架构建议

**子代理 2：最佳实践研究**
- 重点：通过 Web 搜索研究最佳实践、安全性和性能模式
- 加载 `superpowers:behavior-driven-development` skill
- 输出：BDD 场景、测试策略、最佳实践摘要

**子代理 3：上下文与需求综合**
- 重点：综合阶段 1 和阶段 2 的结果
- 输出：上下文摘要、需求列表、成功标准

**其他子代理**：根据需要，针对不同的研究密集型方面启动子代理。

**整合结果**：合并所有发现、解决冲突，并创建统一设计。

**设计文档结构**：

```
docs/plans/YYYY-MM-DD-<topic>-design/
├── _index.md              # Context, Requirements, Rationale, Detailed Design, Design Documents section (MANDATORY)
├── bdd-specs.md           # BDD specifications (MANDATORY)
├── architecture.md        # Architecture details (MANDATORY)
├── best-practices.md      # Best practices and considerations (MANDATORY)
├── decisions/             # ADRs (optional)
└── diagrams/              # Visual artifacts (optional)
```

**关键要求：_index.md 必须包含带有以下引用的 Design Documents 部分：**

```markdown
## Design Documents

- [BDD Specifications](./bdd-specs.md) - Behavior scenarios and testing strategy
- [Architecture](./architecture.md) - System architecture and component details
- [Best Practices](./best-practices.md) - Security, performance, and code quality guidelines
```

**输出**：创建设计文件夹，并保存所有文件。

有关子代理模式和整合工作流，请参阅 `./references/design-creation.md`。
有关阶段 3 的验证清单，请参阅 `./references/exit-criteria.md`。

## 阶段 4：设计复盘

提交之前，验证设计质量。根据**阶段 1 的复杂度评估**调整复盘规模。

**简单**：主代理执行单轮审查——依次检查需求覆盖情况、BDD 完整性和文档一致性。无需子代理。

**中等**（2 个复盘子代理）：

**子代理 1：需求与 BDD 审查**
- 重点：验证需求可追溯性以及 BDD 场景完整性（正常路径、边界情况、错误）
- 输出：可追溯性矩阵、缺失场景、覆盖缺口

**子代理 2：一致性与风险审查**
- 重点：跨文档术语、引用、组件名称和关键风险
- 输出：不一致之处、失效引用、未处理的风险

**复杂**（3 个以上复盘子代理）：

**子代理 1：需求可追溯性审查**
- 重点：验证阶段 1 的每项需求均已在设计中得到处理
- 输出：可追溯性矩阵、孤立需求列表

**子代理 2：BDD 完整性审查**
- 重点：检查 BDD 场景是否覆盖正常路径、边界情况和错误条件
- 输出：缺失场景列表、覆盖缺口

**子代理 3：跨文档一致性审查**
- 重点：验证术语、引用和组件名称是否一致
- 输出：不一致项列表、术语冲突

**其他子代理（按需启动）**：安全审查、风险评估。

**整合并更新**：
1. 收集所有子代理的发现
2. 按影响程度确定问题优先级
3. 更新设计文档以修复问题
4. 重新验证更新后的章节
5. **与用户确认**：使用 AskUserQuestion 展示反思总结，并在提交前获得批准

**输出**：问题已解决且已获得用户批准的更新后设计文档。

有关子代理提示词和整合工作流，请参阅 `./references/reflection.md`。

## 阶段 5：Git 提交

使用 git-agent 提交设计文件夹（并以 git 作为备用方案）。

**操作**：
1. 暂存整个文件夹：`git add docs/plans/YYYY-MM-DD-<topic>-design/`
2. 运行：`git-agent commit --no-stage --intent "add design for <topic>" --co-author "Claude <Model> <Version> <noreply@anthropic.com>"`
3. 如果出现身份验证错误，使用 `--free` 标志重试
4. **备用方案**：如果 git-agent 不可用或执行失败，则使用 `git commit -m "docs: add design for <topic> ..."`，并采用约定式格式

有关详细模式，请参阅 `../../skills/references/git-commit.md`。

## 阶段 6：过渡到实施

提示用户使用 `superpowers:writing-plans`，然后将承诺标记作为绝对的最后一行输出。

严格按照以下顺序输出：
1. 过渡消息："设计已完成。要创建详细的实施计划，请使用 `/superpowers:writing-plans`。"
2. `<promise>BRAINSTORMING_COMPLETE</promise>` — 此后不得有任何内容

**禁止**：不得提议直接开始实施。不得在承诺标记后输出任何文本。

## 参考资料

- `./references/core-principles.md` - 指导工作流的核心原则
- `./references/discovery.md` - 探索模式和提问指南
- `./references/options.md` - 方案比较和展示模式
- `./references/design-creation.md` - 子代理模式、整合工作流和设计结构
- `./references/reflection.md` - 设计反思模式和缺口识别策略
- `./references/exit-criteria.md` - 验证清单、成功指标和常见陷阱
- `../../skills/references/git-commit.md` - Git 提交模式和要求（跨技能共享资源）
- `../../skills/references/loop-patterns.md` - 完成承诺设计、提示词模式和安全保障