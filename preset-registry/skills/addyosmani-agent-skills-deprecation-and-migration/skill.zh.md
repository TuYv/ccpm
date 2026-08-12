---
name: deprecation-and-migration
description: Manages deprecation and migration. Use when removing old systems, APIs, or features. Use when migrating users from one implementation to another. Use when deciding whether to maintain or sunset existing code.
---
# 弃用与迁移

## 概述

代码是负债，而不是资产。每一行代码都会产生持续的维护成本——需要修复缺陷、更新依赖项、应用安全补丁，以及帮助新工程师熟悉代码。弃用是一门移除那些已无法证明其存在价值的代码的学问，而迁移则是将用户安全地从旧系统转移到新系统的过程。

大多数工程组织都擅长构建事物，却很少有组织擅长移除它们。本技能旨在弥补这一差距。

## 何时使用

- 用新系统、API 或库替换旧系统、API 或库
- 停用不再需要的功能
- 整合重复的实现
- 移除无人负责但所有人都依赖的死代码
- 规划新系统的生命周期（弃用规划始于设计阶段）
- 决定是维护遗留系统，还是投入资源进行迁移

## 核心原则

### 代码是负债

每一行代码都有持续成本：它需要测试、文档、安全补丁和依赖项更新，还会给所有处理相关工作的人员带来心智负担。代码的价值在于它提供的功能，而不在于代码本身。当能够用更少的代码、更低的复杂度或更好的抽象来提供相同功能时，就应该移除旧代码。

### 海勒姆定律使移除变得困难

只要用户足够多，每一种可观察到的行为都会有人依赖——包括缺陷、时序上的特殊表现和未记录的副作用。因此，弃用需要主动推动迁移，而不能只是发布公告。当用户依赖替代方案无法复现的行为时，他们无法“直接切换”。

### 弃用规划始于设计阶段

构建新事物时，要问：“三年后，我们要如何移除它？”与那些处处泄露实现细节的系统相比，具有清晰接口、功能开关和最小化暴露面的系统更容易弃用。

## 弃用决策

弃用任何事物之前，请先回答以下问题：

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

## 强制弃用与建议弃用

| 类型 | 何时使用 | 机制 |
|------|-------------|-----------|
| **建议弃用** | 迁移是可选的，旧系统运行稳定 | 警告、文档和提醒。用户按照自己的时间安排进行迁移。 |
| **强制弃用** | 旧系统存在安全问题、阻碍进展，或维护成本已不可持续 | 设定硬性截止日期。旧系统将在日期 X 前移除。提供迁移工具。 |

**默认采用建议弃用。** 只有当维护成本或风险足以证明强制迁移的合理性时，才使用强制弃用。强制弃用需要提供迁移工具、文档和支持——不能只是宣布一个截止日期。

## 迁移流程

### 第 1 步：构建替代方案

不要在没有可用替代方案的情况下弃用旧系统。替代方案必须：

- 覆盖旧系统的所有关键用例
- 提供文档和迁移指南
- 已在生产环境中得到验证（而不只是“理论上更好”）

### 第 2 步：发布公告并编写文档

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

### 第 3 步：增量迁移

逐个迁移使用方，不要一次性全部迁移。对于每个使用方：

```
1. Identify all touchpoints with the deprecated system
2. Update to use the replacement
3. Verify behavior matches (tests, integration checks)
4. Remove references to the old system
5. Confirm no regressions
```

**变更负担规则：**如果你负责即将弃用的基础设施，那么你就有责任迁移其用户，或者提供无需迁移的向后兼容更新。不要只发布弃用公告，然后让用户自己想办法。

### 第 4 步：移除旧系统

只有在所有使用方都完成迁移后：

```
1. Verify zero active usage (metrics, logs, dependency analysis)
2. Remove the code
3. Remove associated tests, documentation, and configuration
4. Remove the deprecation notices
5. Celebrate — removing code is an achievement
```

## 迁移模式

### 绞杀者模式

让新旧系统并行运行。逐步将流量从旧系统路由到新系统。当旧系统处理的流量降至 0% 时，将其移除。

```
Phase 1: New system handles 0%, old handles 100%
Phase 2: New system handles 10% (canary)
Phase 3: New system handles 50%
Phase 4: New system handles 100%, old system idle
Phase 5: Remove old system
```

### 适配器模式

创建一个适配器，将对旧接口的调用转换为对新实现的调用。在迁移后端期间，使用方可以继续使用旧接口。

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

使用功能标志，逐个将使用方从旧系统切换到新系统：

```typescript
function getTaskService(userId: string): TaskService {
  if (featureFlags.isEnabled('new-task-service', { userId })) {
    return new NewTaskService();
  }
  return new LegacyTaskService();
}
```

### 数据库模式迁移（扩展/收缩）

Schema 变更是风险最高的迁移，因为数据是唯一无法通过回退部署来恢复的东西。失败模式在于将 Schema 变更与代码变更耦合：在开始使用新名称的同一个版本中重命名列，那么在发布窗口期间——此时新旧代码会同时运行——其中一方就会查询一个不存在的列。解决办法是**绝不原地修改列**。应采用增量阶段进行迁移，确保新旧代码在每个步骤中都有效。

```
EXPAND ──────────────→ MIGRATE ──────────────→ CONTRACT
add the new column,    backfill existing rows,  once no code reads the
nullable, alongside    dual-write old+new from  old column, drop it in
the old one            the app                  a later, separate deploy
```

**完整示例——将 `name` 重命名为 `full_name`：**

1. **扩展。** 添加可为空的 `full_name`。部署。（旧代码会忽略它；不会有任何问题。）
2. **双写。** 应用在每次插入/更新时同时写入 `name` 和 `full_name`。部署。
3. **回填。** 对现有行执行 `name → full_name` 的复制，分批处理，以免锁表。
4. **切换读取。** 将应用的读取指向 `full_name`，同时继续写入两者。部署并观察稳定性。
5. **收缩。** 停止写入 `name`，然后——在一次*独立且更晚的*部署中——删除该列。

每个步骤都可以独立部署和回退：如果第 4 步出现异常，就回退代码，而 `full_name` 仍会持续得到填充。将每个阶段视为一个精简的纵向切片——参见 `incremental-implementation` Skill。

**规则：**
- **先增量，最后再单独执行破坏性操作。** 添加操作（新的可空列、新表、新索引）在任何部署中都是安全的；删除和重命名操作必须在没有任何代码引用旧结构*之后*，通过各自独立的部署执行。
- **每次迁移都必须有经过测试的回退路径。** 无法逆转的迁移，就意味着无法回退的部署。在合并前编写并运行 `down`。
- **脱离热点路径，分批回填。** 对数百万行执行单条 `UPDATE` 会锁表；应分块处理并限速。
- **构建大型索引时不要阻塞写入**（例如 Postgres 的 `CREATE INDEX CONCURRENTLY`）。
- 当切换存在风险时，**使用功能标志与代码解耦**，具体方式与上文的功能标志迁移模式完全相同。

## 僵尸代码

僵尸代码是无人负责、但所有人都依赖的代码。它没有得到积极维护，没有明确的负责人，并且会不断积累安全漏洞和兼容性问题。迹象包括：

- 超过 6 个月没有提交，但仍存在活跃使用者
- 没有指定维护者或团队
- 测试失败，却无人修复
- 依赖项存在已知漏洞，却无人更新
- 文档引用了已不存在的系统

**应对措施：** 要么指定负责人并妥善维护，要么制定具体的迁移计划将其弃用。僵尸代码不能一直处于悬而未决的状态——要么投入资源维护，要么将其移除。

## 常见的合理化借口

| 合理化借口 | 现实 |
|---|---|
| “它还能用，为什么要移除？” | 无人维护的可用代码会不断积累安全债务和复杂性。维护成本会悄无声息地增长。 |
| “以后可能有人会需要它” | 如果以后需要，可以重新构建。为了“以防万一”而保留未使用的代码，比重新构建的成本更高。 |
| “迁移成本太高了” | 将迁移成本与未来 2～3 年的持续维护成本进行比较。从长期来看，迁移通常更便宜。 |
| “等新系统完成后，我们再弃用它” | 弃用规划应从设计阶段开始。等到新系统完成时，你将会有新的优先事项。现在就制定计划。 |
| “用户会自行迁移” | 他们不会。应提供工具、文档和激励措施——或者自行完成迁移（流失规则）。 |
| “我们可以无限期地维护两个系统” | 同时维护两个功能相同的系统，意味着维护、测试、文档和新成员上手成本全部翻倍。 |
| “直接重命名列就行了，只改一行” | 在发布期间，新旧代码会同时运行——其中一方将查询一个已不存在的列。使用扩展/收缩模式，绝不原地重命名。 |
| “我会在同一次迁移中添加新列并删除旧列” | 这会将安全的添加操作与破坏性的删除操作耦合。删除操作必须在没有任何代码引用旧结构之后，通过独立的部署执行。 |
| “如果需要，我们再编写回退操作” | 没有回退路径的迁移，就意味着无法逆转的部署。在合并前编写并运行 `down`。 |

## 危险信号

- 已弃用的系统没有可用的替代方案
- 发布弃用公告，却没有迁移工具或文档
- “软”弃用多年来一直停留在建议层面，毫无进展
- 没有负责人但仍有活跃使用方的僵尸代码
- 向已弃用的系统添加新功能（应改为投入替代方案）
- 未衡量当前使用情况就弃用
- 未验证活跃使用方数量为零就删除代码
- 架构变更及其依赖代码在同一次部署中发布
- 直接重命名或删除列，而不是通过扩展/收缩方式完成
- 合并迁移时没有经过测试的回滚路径，或回填操作会锁表

## 验证

完成弃用后：

- [ ] 替代方案已在生产环境中得到验证，并覆盖所有关键用例
- [ ] 已提供包含具体步骤和示例的迁移指南
- [ ] 所有活跃使用方均已完成迁移（通过指标/日志验证）
- [ ] 旧代码、测试、文档和配置均已彻底移除
- [ ] 代码库中不再有对已弃用系统的引用
- [ ] 已移除弃用通知（它们已经完成了使命）

完成数据库架构迁移后：

- [ ] 变更以增量阶段发布（扩展 → 回填 → 收缩），而不是一次性直接修改
- [ ] 在每个部署步骤中，新旧代码都与该架构兼容
- [ ] 每个迁移都有经过测试的回滚路径；回填以限流批次运行
- [ ] 破坏性步骤（删除/重命名）应在代码不再引用旧结构后，通过单独的部署发布