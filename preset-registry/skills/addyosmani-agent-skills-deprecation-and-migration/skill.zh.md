---
name: deprecation-and-migration
description: Manages deprecation and migration. Use when removing old systems, APIs, or features. Use when migrating users from one implementation to another. Use when migrating a database schema in production, such as renaming or dropping a column without downtime (expand/contract). Use when deciding whether to maintain or sunset existing code.
---
# 弃用与迁移

## 概述

代码是一项负债，而非资产。每一行代码都具有持续的维护成本——需要修复的 bug、需要更新的依赖项、需要应用的安全补丁，以及需要让新工程师熟悉的内容。弃用是移除不再物有所值的代码的实践，而迁移则是将用户从旧方案安全转移至新方案的过程。

大多数工程组织擅长构建事物。很少有组织擅长移除它们。本技能旨在填补这一空白。

## 何时使用

- 使用新系统、API 或库替换旧系统、API 或库
- 逐步淘汰不再需要的功能
- 整合重复实现
- 移除无人负责但所有人都依赖的死代码
- 规划新系统的生命周期（弃用规划从设计阶段开始）
- 决定是维护遗留系统，还是投入资源进行迁移

## 核心原则

### 代码是一项负债

每一行代码都具有持续成本：它需要测试、文档、安全补丁、依赖项更新，并会给在其附近工作的任何人带来认知负担。代码的价值在于其提供的功能，而非代码本身。当能够以更少的代码、更低的复杂性或更好的抽象提供相同功能时——旧代码就应该被移除。

### Hyrum 定律使移除变得困难

当用户足够多时，每一种可观察到的行为都会被依赖——包括 bug、时序怪癖和未文档化的副作用。这就是为什么弃用需要积极推动迁移，而不只是发布公告。当用户依赖于替代方案未能复现的行为时，他们无法“直接切换”。

### 弃用规划从设计阶段开始

构建新事物时，请问：“3 年后我们该如何移除它？”具有清晰接口、功能开关和最小表面积的系统，比那些到处泄露实现细节的系统更容易弃用。

## 弃用决策

在弃用任何内容之前，请回答以下问题：

```
1. Does this system still provide unique value?
   → If yes, maintain it. If no, proceed.

2. How many users/consumers depend on it?
   → Quantify the migration scope.

3. Does a replacement exist?
   → If no, build the replacement first. Don't deprecate without an alternative.

4. What's the migration cost for each consumer?
   → If trivially automated, do it. If manual and high-effort, weigh against maintenance cost.

5. What's the ongoing maintenance cost of NOT deprecating?
   → Security risk, engineer time, opportunity cost of complexity.
```

## 强制性弃用与建议性弃用

| 类型 | 何时使用 | 机制 |
|------|-------------|-----------|
| **建议性** | 迁移是可选的，旧系统稳定 | 警告、文档、提示。用户按照自己的时间表迁移。 |
| **强制性** | 旧系统存在安全问题、阻碍进展，或维护成本不可持续 | 硬性截止日期。旧系统将在 X 日期前被移除。提供迁移工具。 |

**默认采用建议性弃用。** 仅当维护成本或风险足以证明强制迁移合理时，才使用强制性弃用。强制性弃用要求提供迁移工具、文档和支持——不能只发布一个截止日期公告。

## 迁移流程

### 第 1 步：构建替代方案

不要在没有可用替代方案的情况下弃用。替代方案必须：

- 覆盖旧系统的所有关键用例
- 具备文档和迁移指南
- 已在生产环境中得到验证（而不只是“理论上更好”）

### 第 2 步：公告和文档化

```markdown
## Deprecation Notice: OldService

**Status:** Deprecated as of 2025-03-01
**Replacement:** NewService (see migration guide below)
**Removal date:** Advisory — no hard deadline yet
**Reason:** OldService requires manual scaling and lacks observability.
            NewService handles both automatically.

### Migration Guide
1. Replace `import { client } from 'old-service'` with `import { client } from 'new-service'`
2. Update configuration (see examples below)
3. Run the migration verification script: `npx migrate-check`
```

### 第 3 步：渐进式迁移

一次迁移一个消费者，而不是同时迁移所有消费者。对于每个消费者：

```
1. Identify all touchpoints with the deprecated system
2. Update to use the replacement
3. Verify behavior matches (tests, integration checks)
4. Remove references to the old system
5. Confirm no regressions
```

**变更责任规则：** 如果你拥有正在弃用的基础设施，那么你有责任迁移其用户，或提供无需迁移的向后兼容更新。不要宣布弃用后就让用户自行解决。

### 第 4 步：移除旧系统

仅在所有消费者都已迁移之后：

```
1. Verify zero active usage (metrics, logs, dependency analysis)
2. Remove the code
3. Remove associated tests, documentation, and configuration
4. Remove the deprecation notices
5. Celebrate — removing code is an achievement
```

## 迁移模式

### 绞杀者模式

并行运行旧系统和新系统。将流量从旧系统逐步路由到新系统。当旧系统处理的流量为 0% 时，将其移除。

```
Phase 1: New system handles 0%, old handles 100%
Phase 2: New system handles 10% (canary)
Phase 3: New system handles 50%
Phase 4: New system handles 100%, old system idle
Phase 5: Remove old system
```

### 适配器模式

创建一个适配器，将对旧接口的调用转换为对新实现的调用。消费者在你迁移后端期间继续使用旧接口。

```typescript
// Adapter: old interface, new implementation
class LegacyTaskService implements OldTaskAPI {
  constructor(private newService: NewTaskService) {}

  // Old method signature, delegates to new implementation
  getTask(id: number): OldTask {
    const task = this.newService.findById(String(id));
    return this.toOldFormat(task);
  }
}
```

### 功能标志迁移

使用功能标志一次将一个消费者从旧系统切换到新系统：

```typescript
function getTaskService(userId: string): TaskService {
  if (featureFlags.isEnabled('new-task-service', { userId })) {
    return new NewTaskService();
  }
  return new LegacyTaskService();
}
```

### 数据库架构迁移（扩展/收缩）

架构变更是风险最高的迁移，因为数据是唯一无法通过回滚部署来恢复的东西。失败模式在于将架构变更与代码变更耦合：在同一个发布中重命名列，并开始使用新名称，而在发布窗口期间——旧代码和新代码同时运行时——其中一方会查询不存在的列。解决方法是**绝不原地修改列**。以增量阶段进行迁移，确保旧代码和新代码在每一步中都有效。

```
EXPAND ──────────────→ MIGRATE ──────────────→ CONTRACT
add the new column,    backfill existing rows,  once no code reads the
nullable, alongside    dual-write old+new from  old column, drop it in
the old one            the app                  a later, separate deploy
```

**完整示例——将 `name` 重命名为 `full_name`：**

1. **扩展。** 将 `full_name` 添加为可空字段。部署。（旧代码会忽略它；不会出问题。）
2. **双写。** 应用在每次插入/更新时同时写入 `name` 和 `full_name`。部署。
3. **回填。** 为现有行复制 `name → full_name`，分批执行，以免锁定表。
4. **切换读取。** 让应用读取 `full_name`，继续同时写入两者。部署并观察一段时间。
5. **收缩。** 停止写入 `name`，然后——在一次*独立且更晚*的部署中——删除该列。

每一步都可以独立部署和回滚：如果第 4 步出现异常，回滚代码，而 `full_name` 仍会持续被填充。将每个阶段视为一个精简的垂直切片——参见 `incremental-implementation` skill。

**规则：**
- **先增量，最后单独执行破坏性操作。** 添加（新的可空列、新表、新索引）可在任何部署中安全执行；删除和重命名应在没有代码引用旧结构*之后*单独部署。
- **每个迁移都必须有经过测试的回退路径。** 无法逆转的迁移，就是无法回滚的部署。在合并前编写并运行 `down`。
- **在热路径之外分批回填。** 对数百万行执行单条 `UPDATE` 会锁定表；应分块并限流。
- **构建大型索引时避免阻塞写入**（例如 Postgres 的 `CREATE INDEX CONCURRENTLY`）。
- **当切换风险较高时，通过功能标志与代码解耦**，具体方式与上文的功能标志迁移模式完全相同。

## 僵尸代码

僵尸代码是没有人负责、却人人依赖的代码。它未被积极维护，没有明确的所有者，并不断累积安全漏洞和兼容性问题。迹象包括：

- 超过 6 个月没有提交，但仍有活跃使用者
- 没有指定维护者或团队
- 没有人修复的失败测试
- 没有人更新且存在已知漏洞的依赖项
- 引用了已不存在系统的文档

**应对措施：** 要么指定所有者并妥善维护，要么通过具体的迁移计划将其弃用。僵尸代码不能一直处于悬而未决的状态——它要么获得投入，要么被移除。

## 常见的合理化说辞

| 合理化说辞 | 现实 |
|---|---|
| “它仍然能用，为什么要移除？” | 没有人维护的可运行代码会累积安全债务和复杂性。维护成本会悄然增长。 |
| “以后可能有人会需要它” | 如果以后需要，可以重新构建。保留未使用的代码以备不时之需，成本高于重建。 |
| “迁移成本太高了” | 将迁移成本与未来 2-3 年的持续维护成本比较。从长期来看，迁移通常更便宜。 |
| “等我们完成新系统后再弃用它” | 弃用规划应在设计阶段开始。等新系统完成时，你会有新的优先事项。现在就规划。 |
| “用户会自行迁移” | 他们不会。提供工具、文档和激励措施——或者自己完成迁移（流失规则）。 |
| “我们可以无限期维护两个系统” | 两个执行相同功能的系统，意味着维护、测试、文档和入职成本翻倍。 |
| “直接重命名列就行，这只是一行改动” | 在发布期间，旧代码和新代码会同时运行——其中一方将查询不再存在的列。采用扩展/收缩，绝不原地重命名。 |
| “我会在同一个迁移中添加新列并删除旧列” | 这会将安全的添加操作与破坏性的删除操作耦合。删除操作应在没有代码引用旧结构后单独部署。 |
| “需要时再写回滚” | 没有回退路径的迁移，就是无法逆转的部署。在合并前编写并运行 `down`。 |

## 风险信号

- 已弃用的系统没有可用的替代方案
- 已宣布弃用，但没有迁移工具或文档
- “软性”弃用已持续多年，仅为建议性质且没有进展
- 没有所有者但仍有活跃使用方的僵尸代码
- 向已弃用系统添加新功能（应当投资于替代方案）
- 未衡量当前使用情况就弃用
- 未验证活跃使用方为零就移除代码
- Schema 变更与依赖该变更的代码在同一次部署中发布
- 直接原地重命名或删除列，而不是通过扩展/收缩方式进行
- 合并了未经测试的回滚路径的迁移，或会锁定表的回填操作

## 验证

完成弃用后：

- [ ] 替代方案已在生产环境中得到验证，并覆盖所有关键用例
- [ ] 已有包含具体步骤和示例的迁移指南
- [ ] 所有活跃使用方均已迁移（已通过指标/日志验证）
- [ ] 旧代码、测试、文档和配置均已完全移除
- [ ] 代码库中不再存在对已弃用系统的引用
- [ ] 已移除弃用通知（它们已完成其使命）

完成数据库 schema 迁移后：

- [ ] 变更以增量阶段发布（扩展 → 回填 → 收缩），而非单次原地编辑
- [ ] 在每个部署步骤中，旧代码和新代码均能与 schema 兼容
- [ ] 每个迁移都有经过测试的回滚路径；回填以受限批次运行
- [ ] 在没有代码引用旧结构后，破坏性步骤（删除/重命名）在独立部署中发布