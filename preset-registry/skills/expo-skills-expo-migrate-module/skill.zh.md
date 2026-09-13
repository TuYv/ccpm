---
name: expo-migrate-module
description: Framework (OSS). Migrate an existing Apple/Swift Expo native module from the Expo Modules API 1.0 definition DSL to the 2.0 macro API (sometimes called v2) while preserving its JavaScript and TypeScript contract. Use when converting or incrementally adopting @ExpoModule, @JS, @Event, @SharedObject, or @Record in an existing module. Do not use for creating a new module, general Expo SDK upgrades, or Android/Kotlin migrations.
version: 1.0.0
license: MIT
---
我先检查工作区、仓库说明、Expo 版本和目标模块结构，确认迁移前置条件与现有 JS/TS 兼容契约。由于 SDK 57 的 Swift macros 仍是实验性 API，我会先核对实际检出的 `expo-modules-core` 源码，再决定采用混合迁移还是更大范围改动。# 迁移 Expo 模块

在不改变其可观察 JS API 的前提下，迁移现有 Expo 模块的 Swift 部分。将当前 JS/TypeScript 接口和测试视为兼容性契约。除非用户明确扩大任务范围，否则保持 Kotlin 使用 1.0 DSL。

## 前置条件

使用 `expo` `57.0.21` 或更高版本。更早的 `57.x` 版本可以编译 macros，但缺少许多 2.0 功能和性能优化，因此不要以这些版本为目标。在编辑之前，检查目标项目已安装的版本（`package.json`/锁文件中的 `expo`，或 `npm ls expo`）。如果版本更低，则停止并告知用户先升级。

同时检查示例应用自身的 `package.json`，不要只检查模块根目录。示例应用是你将在第 4 步中构建并启动的集成环境，因此它也需要满足相同的最低版本要求。

这是最低版本要求，并不能保证一切可用：确切的 macro 和 core 接口在 `57.x` 的不同版本之间仍可能有所差异，因此第 2 步仍必须检查当前检出的源代码。

SDK 57 将 macros 作为**实验性且未公开文档化的功能**提供，官方 beta 版本则在 SDK 58 中推出。这套 API 仍可能发生变化。在进行大规模迁移前，应将这一点告知用户，并优先采用渐进式混合模式，而不是一次性整体转换模块。

## 参考资料

- 在修改源代码前阅读 `references/migration-map.md`。其中包含 1.0 到 2.0 的映射、语义陷阱和混合模式规则。
- 阅读 `references/example.md`，其中完整演示了一个模块如何从混合模式迁移到完整迁移。当需要了解各成员规则如何组合时，参考该文档。
- 当当前检出的 `expo-modules-core` 版本或分支不确定是否支持某个请求的 macro 时，阅读 `references/compatibility.md`。该文档说明了如何验证实际的编译时和运行时接口，而不是根据版本号猜测，并列出了 macros 插件在 `0.10.0` 之前获得的功能。

## 工作流程

### 1. 建立契约

在编辑前检查仓库说明和工作区状态。定位 Swift 模块类、记录类型、共享对象、原生视图、JS/TS 绑定、测试、示例应用、podspec、`expo-module.config.json`，以及已安装或检出的 `expo-modules-core`。

在重写之前，盘点所有导出项：

- 模块和共享对象的 JS 名称
- 函数名称、参数数量、标签、默认值、可空性、同步/异步行为、错误和队列/线程语义（注明哪些 `AsyncFunction` 函数体执行阻塞或长时间运行的工作，以及任何 `.runOnQueue(...)`）
- 属性名称、可变性和常量缓存行为
- 事件在线路上的名称和负载结构
- 记录字段名称、默认值、必填性和可空性
- 共享对象构造函数，以及实例/静态放置方式（`Function` 与 `StaticFunction`/`StaticAsyncFunction`）
- 生命周期钩子和视图

使用 TypeScript 声明和 JS 调用位置来消除歧义。不要在语法迁移期间擅自“改进”必填性、重命名事件或改变同步行为。

### 2. 验证可用的 2.0 接口

检查目标实际使用的依赖中的 macro 声明和匹配的 core 钩子。不要因为某个 macro 可以编译，就假定 2.0 设计中的所有项目都已存在。

将每个 1.0 项分类为：

- **迁移：**其宏和所需的核心运行时支持均已存在。
- **保留在 DSL 中：**混合模式能够安全地保留它，或 2.0 没有等价实现。
- **阻塞：**迁移会改变 JS 契约，或需要不可用的运行时支持。

优先采用增量式混合模式结果，避免推测性地生成代码。对于任何剩余的 DSL 元素，保留 `definition()`；只有当它为空且已解析的模块名称由 `@ExpoModule` 保留时，才删除它。

### 3. 应用迁移

一次迁移一个语义组：模块命名、函数、属性/常量、事件、共享对象，然后是记录。保持 diff 聚焦。

遵循以下不变量：

- 当 Swift 命名规则或宏默认值不同时，显式保留每个现有的 JS 可见名称。
- 保留原有的可选值/默认值行为。1.0 中可选的记录字段不能仅仅因为 2.0 能表达必填字段，就变成必填字段。
- 除非已检出的宏会对同一 JS 名称的重载进行分组和分派，否则不要迁移这些重载。
- 保留异步线程行为。1.0 的 `AsyncFunction` 主体在 JS 线程之外运行；2.0 的 `async` `@JS` 成员从 JS 线程开始运行，只会在第一个 `await` 处离开该线程。因此，不包含 `await` 的主体会阻塞 JS 线程，但 JS 签名不会发生变化。审查第一个 `await` 之前运行的内容，绝不要将阻塞式 I/O 留在 JS actor 上。使用 `@JS(.concurrent)` 修复，或将其重构为 Swift Concurrency 或 continuation。固定到队列的函数也应进行同样处理。参见 `references/migration-map.md` 中的线程部分。
- 在迁移视图、联合类型、同步事件、共享对象静态成员或自由形式的 `Any` 参数之前，先验证核心支持。对于上述每项能力，宏插件都曾先于核心发布，因此应检查已检出的核心，而不是插件版本，并将不受支持的成员保留在 1.0 DSL 中。`references/compatibility.md` 包含逐项能力检查。
- 确保 `expo-module.config.json` 在 `apple.modules` 下列出每个模块类。条目是裸 Swift 类名，因此在迁移期间重命名类会静默地使模块脱离：它能够构建，但运行时不会出现。迁移后的类也必须保持 `public` 或 `open`。SDK 58 的自动发现机制将负责淘汰这些条目。
- 除非用户请求 API 变更，否则不要修改 Kotlin、JS 封装器或公开的 `.d.ts` 文件。
- 绝不要将宏生成的符号写入模块源代码。宏会生成这些符号；手写或重写它们不属于迁移的一部分。

每个组完成后，搜索应该已经迁移的旧 DSL 条目和调用点。避免大范围格式化或无关清理。

### 当缺少 2.0 等价实现或某个组失败时

当步骤 2 将某个项目分类为**阻塞**，或迁移后的组构建失败或破坏契约时，不要强行迁移。停止处理该组，并：

1. **询问用户如何处理**该项目，并提供两个选项：
   - **共存：**将该项目与已迁移的 `@ExpoModule` 一起保留在 1.0 `definition()` DSL 中（混合模式），并继续处理其他组。
   - **还原：**撤回该组的编辑，使其保持不变地使用 1.0，然后继续处理其他组。

当混合模式已验证安全时，默认采用共存方式，因为这样可以保留最多进展。当半应用的更改使模块处于无法构建且无法通过增量方式修复的状态时，才进行回退。

2. **在 `expo/expo` 上创建跟踪 issue**，记录 2.0 尚未覆盖的功能，以便登记这一缺口，而不是默默地绕过它。使用 `gh issue create --repo expo/expo`，并在发布前向用户确认（遵循仓库约定，未经批准不要发布面向外部的评论）。请包括：
   - 1.0 成员及其 JS 契约
   - 缺失的具体宏或核心钩子（引用 `references/compatibility.md` 中的证据缺口）
   - 当前检出的 `expo-modules-core` 版本/分支

在交接说明中引用该 issue，以便将剩余的 DSL 条目追溯到一个已知限制。

继续处理能够顺利迁移的组；一个受阻成员不应阻塞其余成员。

### 4. 验证行为

先运行可用的最小范围检查，然后验证实际集成面：

1. 针对目标 `expo-modules-core` 构建或进行类型检查 Apple 模块。
2. 运行原生单元测试和 JS/TS 测试。
3. 如果仓库提供示例应用，则构建并启动它。
4. 确认 `expo-module.config.json` 仍在 `apple.modules` 下列出每个模块类，并且与当前的 Swift 类名一致。过时的条目可以成功构建，但只会在运行时失败，因此示例应用必须实际解析该模块，而不能仅仅完成编译。
5. 将最终导出面与第 1 步中的清单进行比较。
6. 搜索过时的 `Name`、已迁移的 `Function`/`AsyncFunction`/`StaticFunction`/`StaticAsyncFunction`/`Property`/`Constant`/`Events` 条目、旧的 `sendEvent` 调用、`@Field` 以及重复注册。搜索你编写的源代码，而不是宏展开输出。

仅进行展开测试是不够的：生成的宏代码看起来可能正确，但在与版本不匹配的 core 集成时，仍可能无法链接或运行。如果依赖发生变化或缺少宏插件标志，请按需重新安装 JS 依赖，运行仓库的 CocoaPods 安装流程，并重启 Xcode，然后再诊断插件通信失败。

## 交接

绝不要向用户输出宏生成的或 core 内部的符号名称。`references/compatibility.md` 引用了这些名称，以便你进行 grep，但它们属于会随插件修订而变化的实现细节，在报告中只会造成干扰。通过宏（`@JS static`、`@Event(sync:)`）和可观察到的 JS 行为来描述能力。请表述为“已安装的 core 尚不支持解码自由格式的字典参数”，而不是缺失方法的名称。例外是 `expo/expo` 上的跟踪 issue，其中具体缺失的钩子正是问题核心。

报告：

- 哪些成员已迁移到 2.0
- 哪些成员有意保留在 1.0 DSL 中，以及原因
- 所有对兼容性敏感的选择，尤其是事件名称、record 是否必需、常量和队列
- 已运行的命令，以及尚未完成的验证

## 提交反馈
如果你发现此技能中存在错误、误导性信息或过时信息，请报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-migrate-module" "<actionable feedback>"
```
仅在你有具体且可操作的反馈时提交。请尽可能提供相关上下文。
如果 AI agent 反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback skill，并遵循其 eval-candidate 流程，而不要重复使用上面的命令。