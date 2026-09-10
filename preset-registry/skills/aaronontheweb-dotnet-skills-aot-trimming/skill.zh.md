---
name: aot-trimming
description: "Guidelines for making .NET libraries and applications trimming-safe and Native AOT compatible. Covers the trimming/AOT model, the MSBuild properties that enable analysis (IsTrimmable, IsAotCompatible, PublishTrimmed, PublishAot), the trimming attributes (RequiresUnreferencedCode, RequiresDynamicCode, DynamicallyAccessedMembers, UnconditionalSuppressMessage), IL2xxx/IL3xxx warning codes, and a pattern playbook: source generators and UnsafeAccessor, generated-interception diagnostic suppressors, intentional runtime scanning boundaries, trimming-safe islands and feature switches, migration analyzers, and temporary warning-approval baselines. Use when introducing trimming/AOT support, resolving IL2xxx/IL3xxx warnings, or making reflection-heavy code trimming-safe in C# / .NET codebases. For System.Text.Json AOT scenarios, see also the serialization skill."
version: 1.0.0
tags:
  - csharp
  - dotnet
  - aot
  - trimming
  - nativeaot
  - code-quality
---
# .NET 裁剪和 Native AOT

## 适用场景

- 为库或应用添加裁剪（`PublishTrimmed`）或 Native AOT（`PublishAot`）支持
- 解决 `IL2xxx`（裁剪）和 `IL3xxx`（AOT/单文件）警告
- 使大量使用反射的代码能够安全进行裁剪
- 使用编译时替代方案替换运行时反射、程序集扫描或 `Reflection.Emit`
- 审查代码库或 PR 的裁剪/AOT 兼容性，包括生成的拦截器和分析器抑制器
- 设计必须携带裁剪注解的公共 API

## 核心目标

- 生成能够通过链接器可达性分析并在 Native AOT（无 JIT）下运行的代码。
- 使用裁剪属性表达编译器无法看到的信息，即反射需要哪些成员。
- 将裁剪安全代码与裁剪不安全代码分离，使不安全路径明确且受控。

## 核心模型

### 裁剪与 Native AOT

- **裁剪**（`PublishTrimmed`）运行 ILLink 可达性分析：只保留静态可达的代码。分析器无法识别的反射会被裁剪掉，并产生警告。
- **Native AOT**（`PublishAot`）强制执行裁剪并移除 JIT。`Reflection.Emit` 不受支持，运行时构造*未知*泛型实例不受保证，`Expression.Compile()` 可能回退到解释执行，并且反射只能访问链接器保留的成员。
- 二者运行相同的静态分析：
  - `IL2xxx` —— 裁剪警告：`RequiresUnreferencedCode` 传播 + `DynamicallyAccessedMembers` 数据流分析。
  - `IL3xxx` —— AOT 和单文件警告：`RequiresDynamicCode` / `RequiresAssemblyFiles`。

库可以支持裁剪，但**不一定兼容 AOT**（它使用了 `Reflection.Emit`，裁剪可以容忍这一点，但 AOT 不支持）。

### 需要解决的两个问题

1. **未被发现的反射**（裁剪）：链接器移除了你按名称加载的成员或类型，或者移除了你在泛型方法中通过 `typeof(T)` 访问的成员。
2. **动态代码生成**（AOT）：JIT 已被移除，因此不支持 `Reflection.Emit`，并且不保证构造*未知*泛型实例。

解决这两个问题的方法相同：让分析器能够*静态看到*所需成员，或者完全移除对反射的需求。

### 反射并非敌人

反射是一种合法技术，在普通的 JIT 应用中完全没有问题——你不需要做这些处理。裁剪属性的存在是为了在裁剪/AOT 下*允许*使用反射，而不是禁止它：标注反射所需的内容，链接器就会保留这些内容。只有当你希望移除或限制特定的反射表面时，才应使用源生成器、`[UnsafeAccessor]` 或能力门控（例如，不希望发布带有 `[RequiresUnreferencedCode]` 的公共注册 API）。

## 项目配置

对于**库**，声明兼容性，以便分析器显示警告，并让使用者了解相关信息：

```xml
<PropertyGroup>
  <!-- Trim-compatible: enables trim warnings. -->
  <IsTrimmable>true</IsTrimmable>

  <!-- AOT-compatible: implies IsTrimmable + EnableTrimAnalyzer + EnableSingleFileAnalyzer + EnableAotAnalyzer. -->
  <IsAotCompatible Condition="$([MSBuild]::IsTargetFrameworkCompatible('$(TargetFramework)', 'net8.0'))">true</IsAotCompatible>
</PropertyGroup>
```

对于**应用程序**，发布裁剪版或 AOT 版本：

```xml
<PropertyGroup>
  <PublishTrimmed>true</PublishTrimmed>
  <!-- or -->
  <PublishAot>true</PublishAot>
</PropertyGroup>
```

通过实际发布进行验证：裁剪版/AOT 应用必须产生零条警告：

```bash
dotnet publish -c Release -r <rid> -p:PublishTrimmed=true
dotnet publish -c Release -r <rid> -p:PublishAot=true
```

用于验证库的标准方式是使用一个引用该库的**测试应用**：

```xml
<PropertyGroup>
  <PublishTrimmed>true</PublishTrimmed>
</PropertyGroup>
<ItemGroup>
  <ProjectReference Include="..\MyLibrary\MyLibrary.csproj" />
  <TrimmerRootAssembly Include="MyLibrary" />
</ItemGroup>
```

有关完整的属性表、功能开关和警告批准基线模式，请参阅 [aot-trimming-playbook-reference.md](aot-trimming-playbook-reference.md)。

## 属性模型

这些属性位于 `System.Diagnostics.CodeAnalysis` 中。有关包含精确签名、警告代码和规则的完整目录，请参阅 [trimming-attributes-reference.md](trimming-attributes-reference.md)。

- `[RequiresUnreferencedCode(message)]` — 标记需要链接器无法看到的成员的代码。在其*内部*抑制警告；在每个调用点发出 `IL2026`。
- `[RequiresDynamicCode(message)]` — 标记需要 JIT（生成动态代码）的代码。在调用点发出 `IL3050`。
- `[DynamicallyAccessedMembers(memberTypes)]` — 声明必须保留的 `Type`/`string` 成员。该声明会从反射位置向 `Type` 源*反向*传播。通过将属性直接放在访问器上，或使用 `[method:]`、`[field:]` 或 `[return:]` 目标，将其（以及其他属性）限定到单个访问器。
- `[UnconditionalSuppressMessage(category, checkId, Justification = "...")]` — 最后的手段，是持久化到 IL 中的抑制；必须包含说明理由以及真实的不变量。
- `[DynamicDependency("Member", typeof(T))]` — 保留指定名称的成员，但**不会**消除警告。

针对实际执行的反射，选择最窄的 `DynamicallyAccessedMemberTypes`：

| 反射 | 成员类型 |
| --- | --- |
| `Activator.CreateInstance<T>()`、`new T()`、`Activator.CreateInstance(type)` | `PublicParameterlessConstructor` |
| DI 激活（`ActivatorUtilities.CreateFactory<T>`） | `PublicConstructors` |
| 显式激活非公共成员 | `NonPublicConstructors` |
| `type.GetInterfaces()` | `Interfaces` |
| `type.GetMethods()` | `PublicMethods`（需要时添加 `NonPublicMethods`） |
| `type.GetProperties()` | `PublicProperties` |
| `type.GetFields()` | `PublicFields` |
| `type.GetNestedTypes()` | `PublicNestedTypes` |

## 模式指南（选摘）

首先确定代码是否确实需要保证裁剪/AOT 安全。普通 JIT 应用或库无需采用这些做法，在其中使用反射没有问题。只有当你或消费者发布裁剪版/AOT 版本时，反射才需要对链接器可见。

目标从来不是“移除所有反射”，而是*让反射在静态分析中可见*，从而使链接器保留所需内容。请针对每个调用点进行选择：

- **保留反射并为其添加注解** — 这是最常见的情况。在 `Type`/`string` 源上放置 `[DynamicallyAccessedMembers(...)]`，并沿调用链传递它；为入口点标记 `[RequiresUnreferencedCode]`/`[RequiresDynamicCode]`。这些特性正是为了让反射在修剪环境下正常工作而存在的。参见 [trimming-attributes-reference.md](trimming-attributes-reference.md)。

- **用编译时替代方案替换反射** — 当你希望完全移除某个反射表面时使用（例如，不希望公开注册 API 随 `[RequiresUnreferencedCode]` 一起发布）。**源生成器**会生成直接的类型引用（标记特性 → 生成的注册代码）；`[UnsafeAccessor]` 可替代 `FieldInfo`/`MethodInfo`/`ConstructorInfo`。参见 [aot-trimming-playbook-reference.md](aot-trimming-playbook-reference.md#source-generators-and-compile-time-registration) 和 [aot-trimming-playbook-reference.md](aot-trimming-playbook-reference.md#unsafe-accessors-for-non-public-members)。

- **隔离整条动态路径** — 当某条路径本质上是动态的（例如生成代理、按名称加载插件）时，将其移到边界之后，并提供一个由 `RuntimeFeature.IsDynamicCodeSupported` 选择的修剪安全替代方案。参见 [aot-trimming-playbook-reference.md](aot-trimming-playbook-reference.md#trimming-safe-islands)。

- **仅在最后手段时抑制警告** — 在已证明不变量成立的叶节点处使用单个 `[UnconditionalSuppressMessage(...)]`，并提供 `Justification`。绝不要使用 `#pragma`（它不会持久化到 IL 中）。

参见 [aot-trimming-playbook-reference.md](aot-trimming-playbook-reference.md)，了解完整的实践指南，其中包括 object-overload → generic-overload 重定向、生成式拦截抑制器、有意设置的扫描边界、迁移分析器、严格模式优先级，以及临时警告批准基线。

## 参考文件

- [trimming-attributes-reference.md](trimming-attributes-reference.md)：完整的特性目录 — `RequiresUnreferencedCode`、`RequiresDynamicCode`、`DynamicallyAccessedMembers`（完整的 `DynamicallyAccessedMemberTypes` 列表）、`UnconditionalSuppressMessage`、`DynamicDependency` — 每项都包含用途、准确签名和规则，以及 `IL2xxx`/`IL3xxx` 警告代码表。
- [aot-trimming-playbook-reference.md](aot-trimming-playbook-reference.md)：完整的模式实践指南 — 源生成器与反射、修剪安全隔离区与能力检查、安全/不安全代码分离、System.Text.Json 源生成、带有 `[OverloadResolutionPriority]` 和可选分析器的 object-overload → generic-overload 重定向、迁移分析器、警告批准基线、已知陷阱，以及完整的生成检查清单。

## 生成检查清单（摘要）

1. **项目** — 对库设置 `IsTrimmable`/`IsAotCompatible`；对应用设置 `PublishTrimmed`/`PublishAot`；发布时零警告。
2. **使反射可见（或替换它）** — 为保留的反射添加注解（`DynamicallyAccessedMembers`/`RequiresUnreferencedCode`/`RequiresDynamicCode`）；仅在希望移除反射表面时，使用源生成器、泛型（`typeof(T)`）API 或 `[UnsafeAccessor]` 替换它。
3. **添加注解** — 在每个 `Type`/`string` 源上使用范围最窄的 `DynamicallyAccessedMembers`；沿调用链传递它；在不安全的入口点上添加 `[RequiresUnreferencedCode]`/`[RequiresDynamicCode]`。
4. **隔离** — 将不安全的反射/发出代码置于边界之后；使用 `RuntimeFeature.IsDynamicCodeSupported` 控制*动态代码*路径，并使用 `#if` 或注解分离*修剪*路径。
5. **抑制** — 仅在已证明不变量成立的叶节点处使用 `[UnconditionalSuppressMessage]` + 说明；绝不要使用 `#pragma`/`SuppressMessage`。
6. **验证** — 发布修剪版本和 AOT 版本，运行分析器，并使用批准基线锁定警告范围。

## 参考资料

- [裁剪选项](https://learn.microsoft.com/dotnet/core/deploying/trimming/trimming-options)
- [准备 .NET 库以支持裁剪](https://learn.microsoft.com/dotnet/core/deploying/trimming/prepare-libraries-for-trimming)
- [裁剪警告简介](https://learn.microsoft.com/dotnet/core/deploying/trimming/fixing-warnings)
- [Native AOT 部署](https://learn.microsoft.com/dotnet/core/deploying/native-aot/)
- [ILLink 错误代码](https://github.com/dotnet/runtime/blob/main/docs/tools/illink/error-codes.md)