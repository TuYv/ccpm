---
name: csharp-nullable-reference-types
description: Guidelines for introducing and using nullable reference types (NRT) and System.Diagnostics.CodeAnalysis nullable attributes in C# / .NET codebases. Covers the nullability model, flow analysis, the null-forgiving operator, API design rules, the full attribute catalog (AllowNull, DisallowNull, MaybeNull, NotNull, NotNullWhen, MaybeNullWhen, NotNullIfNotNull, MemberNotNull, MemberNotNullWhen, DoesNotReturn, DoesNotReturnIf), the C# 14 field keyword, incremental migration of legacy codebases, and a code-generation checklist.
version: 1.0.0
tags:
  - csharp
  - nullable
  - nrt
  - code-quality
  - api-design
---
# C# 可空引用类型

## 何时使用

- 将可空引用类型（NRT）引入尚未采用它们的代码库
- 编写或重构使用 `T?` / 可空性注解的 C# 代码
- 使用 `System.Diagnostics.CodeAnalysis` 可空性特性为 API 添加注解
- 设计可空性契约十分重要的公共/内部 API
- 封装未添加注解或旧版 API，使下游调用方仍能受益于 NRT
- 审查代码中的空状态分析、守卫辅助方法和 `field` 关键字是否使用正确

## 核心目标

- 通过在签名中明确表达 null 意图，防止运行时发生 `NullReferenceException`。
- 使用官方可空性特性表达类型系统无法直接表示的契约。
- 在旧代码库中渐进式采用 NRT，避免一次性全面重写。

## 核心可空性模型

### 不可空与可空

- `string` — 不可空引用。编译器假定其实例永不为 `null`；为其赋予 `null` 或可能为 null 的值会产生警告。
- `string?` — 可空引用。变量可能为 `null`；编译器要求在解引用之前执行 null 检查。

```csharp
string name = "Alice";
name = null;          // Warning: assigning null to non-nullable.

string? nickname = null;
Console.WriteLine(nickname.Length); // Warning: possible null dereference.
```

### 空状态分析（流分析）

编译器会跟踪引用是*确定非 null*还是*可能为 null*。null 检查和赋值会更新此状态。

```csharp
string? message = GetMessageOrNull();

if (message != null)
{
    // message is definitely non-null in this block.
    Console.WriteLine(message.Length);
}

// Outside the if, message is maybe null again.
```

在解引用可空值之前，引入显式 null 检查（`if (x != null)`、`is not null`、模式匹配）。尽早收窄可空性，并让非 null 状态持续有效。**Null 条件赋值（C# 14）**允许你编写 `customer?.Order = CreateOrder();`——仅当接收者非 null 时，才会对右侧求值。

### Null 宽容运算符（`!`）

`x!` 告诉编译器“在这里将 `x` 视为非 null”。它仅影响分析，不影响运行时行为。

- 仅当某个真实的不变量保证值非 null，而编译器无法识别时，才使用 `!`。
- **不要**将 `!` 作为修复警告的通用手段。应优先考虑重构控制流、添加特性或正确初始化成员。

```csharp
_customer = LoadCustomerFromOrm()!; // ORM guarantees this is not null in valid state.
```

### 在抑制警告之前重组代码

成功通过守卫子句或模式匹配后，当前作用域中已形成一个 null 安全区域。在添加 `!` 之前，让可空值仅跨越一次经过检查的边界，并使其余代码保持不可空：

- 尽早使用守卫子句或模式匹配收窄可空性；
- 在检查之前，将可空字段或属性复制到局部变量中，以免重复读取期间其值发生变化，导致分析失效；
- 当方法具有复杂的控制流时，可选择将非 null 路径移入具有不可空参数的局部函数或私有方法；
- 将可空处理保留在边界处，避免在整个实现中散布 `T?`、重复检查或 `!`。

```csharp
public void Process(Order? order)
{
    if (order?.Customer is not { } customer)
    {
        return;
    }

    // The pattern match already proved that customer is non-null here.
    Console.WriteLine(customer.Name);
}
```

不要仅仅为了满足可空性分析而提取函数。当显式的不可空函数边界同时还能简化大型或包含分支的实现时，才应使用这种方式。仅当某个真实的外部不变量无法通过控制流、签名或可空性分析特性来表示时，才使用 `!`。

## 项目配置

为新代码启用 NRT：

```xml
<PropertyGroup>
  <Nullable>enable</Nullable>
</PropertyGroup>
```

对于遗留代码库，应使用文件级指令（`#nullable enable`、`#nullable disable`、`#nullable enable warnings`、`#nullable enable annotations`）逐步启用。应重视 `CS86xx` 可空性警告；对于新项目，可以考虑启用 `TreatWarningsAsErrors`，或将可空性警告视为错误。

有关完整的渐进式采用策略、`#nullable` 指令参考、遗留代码互操作，以及已知的静态分析局限（数组、`default(struct)`），请参阅 [nrt-migration-playbook-reference.md](nrt-migration-playbook-reference.md)。

## API 设计规则（签名）

这些规则适用于公共和内部 API，也适用于模型。

**参数**——如果不允许 `null`，请使用不可空类型，并为公共 API 添加运行时防护：

```csharp
public void SendEmail(string recipient)
{
    ArgumentNullException.ThrowIfNull(recipient);
    // Implementation
}
```

如果允许使用 `null` 且其具有实际含义，请使用 `T?`，说明如何解释 `null`，并正确实现针对 `null` 的行为。

**返回类型**——当方法永远不会返回 `null` 时使用 `Customer`；当方法可以合理地返回 `null` 时使用 `Customer?`（调用方必须进行检查，并且编译器会强制执行此要求）。

```csharp
public Customer GetRequiredCustomer(Guid id);  // Throws on failure.
public Customer? TryGetCustomer(Guid id);       // Returns null on failure.
```

**属性和字段**——遵循与参数和返回类型相同的规则。不可空成员必须在构造函数中初始化、通过结合对象初始化器使用 `required` 属性来初始化、通过由 `field` 支持的延迟属性来初始化，或通过带有 `[MemberNotNull]` 标注的辅助方法来初始化。

```csharp
public class Order
{
    public required string Id { get; init; }
    public required Customer Customer { get; init; }
    public string? Comment { get; init; } // Optional.
}
```

当契约依赖输入/输出行为、条件行为或成员初始化时，请应用 [nullable-attributes-reference.md](nullable-attributes-reference.md) 中描述的可空性特性。

### 库的公共 API 兼容性

应将可空性标注和可空性分析特性视为已发布 API 契约的一部分。`T` 和 `T?` 具有相同的 CLR 类型，因此仅更改标注通常保持二进制兼容，但可能会向启用了可空性的使用方引入警告，从而造成源代码破坏性变更。当使用方将警告视为错误时，这些警告通常会导致构建失败。

发布前应审查公共 API 的可空性变更，尤其是：

- 将输出从 `T` 弱化为 `T?`，或添加 `[MaybeNull]`；
- 将输入从 `T?`` 收紧为 `T`，或添加 `[DisallowNull]`；
- 更改泛型约束，例如 `class?`、`class` 或 `notnull`；
- 更改虚成员、接口、委托及实现上的注解或特性，因为不匹配会产生编译器警告。

向之前未感知可空性的 API 添加注解，也可能造成相同的源代码兼容性问题。请将添加注解后的 API 表面与上一个发布版本进行比较，使用启用了可空性的使用方进行测试，并根据库的兼容性策略记录有意引入的源代码破坏性变更，或调整其版本。

## `field` 关键字（C# 14 / .NET 10）

`field` 上下文关键字允许你编写属性访问器主体，而无需声明显式的后备字段。这是一个主要的 NRT 场景（延迟初始化属性），编译器会执行特殊的*空值弹性*分析，因此构造函数中不会出现干扰性的 `CS8618`：

```csharp
public class C
{
    public C() { } // No warning: the getter is null-resilient.
    string Prop => field ??= GetPropValue();
}
```

有关完整的 `field` 可空性规则（具有空值弹性与不具有空值弹性的 getter、`[field: AllowNull, MaybeNull]` 逃生舱，以及 setter/构造函数分析），请参阅 [nullable-attributes-reference.md](nullable-attributes-reference.md)。

## 参考文件

- [nullable-attributes-reference.md](nullable-attributes-reference.md)：完整的 `System.Diagnostics.CodeAnalysis` 特性目录——前置条件（`AllowNull`、`DisallowNull`）、后置条件（`MaybeNull`、`NotNull`）、条件后置条件（`NotNullWhen`、`MaybeNullWhen`、`NotNullIfNotNull`）、辅助方法（`MemberNotNull`、`MemberNotNullWhen`）、不可达代码辅助特性（`DoesNotReturn`、`DoesNotReturnIf`），以及 `field` 关键字的可空性规则。每项均包含意图、模式和代理规则。
- [nrt-migration-playbook-reference.md](nrt-migration-playbook-reference.md)：渐进式采用策略、`#nullable` 指令参考、旧版/未注解 API 互操作、为较旧的目标框架补充可空性特性（包括权衡分析和添加前确认的决策流程）、已知的静态分析局限（不可为 null 的引用类型数组、包含引用字段的 `default(struct)`）、警告处理，以及完整的生成检查清单。

## 生成检查清单（摘要）

1. **项目** — 存在 `<Nullable>enable</Nullable>`；仅在无法避免的旧代码周围禁用。
2. **类型** — 必需的参数/返回值/属性使用不可为 null 的类型；仅当 `null` 有效且符合预期时才使用 `T?`。
3. **初始化** — 使用构造函数、`required` + 对象初始化器、由 `field` 支持的延迟 getter，或 `[MemberNotNull]` 辅助方法。除非作为有文档说明的逃生舱，否则避免使用 `null!`。
4. **null 检查** — 在公共边界进行显式防护；通过控制流缩小类型范围，并且仅当提取不可为 null 的辅助方法能够改善复杂代码时才这样做；仅在存在明确不变量时使用 `!`。
5. **特性** — 使用特性来表达类型系统无法表达的契约（请参阅参考文件）。
6. **互操作** — 信任 BCL/已注解的库；封装未注解的 API 时，添加自己的防护和特性。
7. **警告** — 绝不忽略；应修正设计或添加特性，而不是使用 `!` 或 `#pragma` 来抑制警告。
8. **兼容性** — 对于已发布的库，将公共可空性变更视为潜在的源代码破坏性变更进行审查，并使用启用了可空性的使用方进行测试。

## 参考资料

- [可为空引用类型（概述）](https://learn.microsoft.com/dotnet/csharp/nullable-references)
- [用于 null 状态静态分析的特性](https://learn.microsoft.com/dotnet/csharp/language-reference/attributes/nullable-analysis)
- [可为空迁移策略](https://learn.microsoft.com/dotnet/csharp/advanced-topics/update-applications/nullable-migration-strategies)
- [重大更改：可为空引用类型注释变更](https://learn.microsoft.com/dotnet/core/compatibility/core-libraries/6.0/nullable-ref-type-annotation-changes)
- [教程：使用可为空和不可为空引用类型表达设计意图](https://learn.microsoft.com/dotnet/csharp/whats-new/tutorials/nullable-reference-types)
- [C# 14 中的新增功能](https://learn.microsoft.com/dotnet/csharp/whats-new/csharp-14)（扩展成员、`field` 关键字正式发布、null 条件赋值）
- [`field` 上下文关键字（功能规范）](https://learn.microsoft.com/dotnet/csharp/language-reference/proposals/csharp-14.0/field-keyword)