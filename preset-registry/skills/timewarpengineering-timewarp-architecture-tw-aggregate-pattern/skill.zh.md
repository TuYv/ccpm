---
name: tw-aggregate-pattern
description: "**TIMEWARP SKILL** — the golden aggregate-root pattern: typed id, `Entity<TId>` base, fail-closed `Create`, named mutations with no public setters, a private nested `Invariants` validator, and save-time enforcement via `DomainInvariantsGuard`/`AggregateDbContext`. Invoke before adding or reviewing an `IAggregateRoot`, or when TWA0011/TWA0012 fire. WHEN: add an aggregate, IAggregateRoot, aggregate root, TWA0011, TWA0012, Invariants validator, typed id."
when-to-use: aggregate root, IAggregateRoot, Entity<TId>, typed id, TypedId, Invariants validator, DomainInvariantsGuard, AggregateDbContext, TWA0011, TWA0012, fail-closed construction, named mutation, concurrency token, Version
---
# 聚合模式（TWA0011/0012）

聚合是一种领域实体，它是一组不变量的一致性边界。本仓库中的每个聚合根都遵循相同的黄金模式。本技能是该模式的唯一事实来源（SSOT）；`how-to-add-your-aggregate.md` 是面向人类读者的端到端操作指南，并以此技能为准。

## 检测——何时调用

| 信号 | 如何发现 |
|--------|----------------|
| 新增一个 `IAggregateRoot` | 任何拥有自身一致性边界的领域类型 |
| `TWA0011` / `TWA0012` 诊断 | 分析器输出中指明了聚合类型 |
| “不变量检查在哪里运行？” | 保存路径，而非构造路径 |
| 审查领域类型的 `Create`/变更方法 | 故障关闭式构造检查 |

## 黄金模式

- **类型化 id。** 聚合的 id 是一个 `[TypedId] readonly partial record struct`（例如 `ProfileId`），绝不使用裸 `Guid`。参见 `web/features/profile/profile-id-domain.cs`。
- **`Entity<TId>` 基类。** 聚合继承自 `TimeWarp.Foundation.Entities.Entity<TId>`（只读（get-only）的类型化 `Id`、基于标识的相等性、由存储持有的 `Version` 并发令牌），并实现标记接口 `IAggregateRoot`。
- **故障关闭式构造。** 私有构造函数加上带守卫子句的静态 `Create(...)` 工厂——聚合永远不会以半初始化的状态存在，也不会带有明显无效的必填字段。
- **命名的变更方法，不用公共 setter。** 状态变更是意图明确的方法（`Rename`、`SetLanguage`、……），绝不使用 `{ get; set; }`。
- **嵌套的 `Invariants` 验证器。** 一个 `private sealed class Invariants : AbstractValidator<T>` 声明该聚合的完整规则集。它保持 `private`，这样契约验证器的自动注册（`AddValidatorsFromAssemblyContaining`）就不会把它当作请求验证器。
- **保存时强制执行。** 在保存执行之前，`DomainInvariantsGuard` 会通过 `AggregateDbContext.SaveChanges(Async)` 为每个发生变更的 `IAggregateRoot` 发现并运行嵌套的 `Invariants` 验证器。宿主上下文（例如 `PostgresDbContext`）继承该基类；它们不会重新实现这个钩子。`Create`/变更方法中的守卫子句与保存时验证器是**互补的，而非冗余的**：前者使无效状态难以构造，后者则使它们无论经由哪条代码路径产生都无法持久化。仅涉及子实体的变更会解析到所属的根，因此不变量检查和 `Version` 依然会执行。

## 放置位置

聚合的领域类型是位于其所属切片中的 `<name>-domain.cs`，其类型化 id 则是与之并排放置的 `<name>-id-domain.cs`——两者都遵循 `domain` 层的 `<name>[-<function>]-<layer>.cs` 文件名语法。完整的语法、注册表和用例文件夹规则参见 `tw-feature-placement`；本技能关注聚合的内部形态，而非文件的存放位置。

## 强制执行对照

| 规则 | 要求 | 原因 |
|------|----------|-----|
| **TWA0011** | `IAggregateRoot` 必须声明一个嵌套的 `Invariants : AbstractValidator<T>` | 故障关闭：没有验证器意味着 `DomainInvariantsGuard` 无法在保存时检查该聚合 |
| **TWA0012** | 该嵌套的 `Invariants` 必须为 `private` | 使其不被 `AddValidatorsFromAssemblyContaining` 自动注册——它是保存时的领域检查，而不是请求验证器 |

## 范例

`web/features/profile/profile-domain.cs` + `profile-id-domain.cs`——在新增聚合之前请先阅读这两个文件。它的 EF 映射（`profile-entity-type-configuration-infrastructure.cs`——表/schema 为 `profiles`、TypedId 键转换）由 `PostgresDbContext` 通过 `ApplyConfigurationsFromAssembly` 应用。`Version` 的 `.IsConcurrencyToken()` 由 `AggregateDbContext` 的 `Version` 约定免费提供——聚合自身的映射不需要声明它。

## 相关技能与指引

- `tw-feature-placement`——文件名语法与层归属（`<name>[-<function>]-<layer>.cs`、`domain` 层、注册表）
- `tw-slice-isolation`——在确定放置位置之前，聚合属于哪个切片
- `how-to-add-your-aggregate.md`——面向人类读者的端到端操作指南（领域 → EF 映射 → 宿主注册 → 应用程序使用 → 测试）
