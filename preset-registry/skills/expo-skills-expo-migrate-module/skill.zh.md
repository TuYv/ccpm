---
name: expo-migrate-module
description: Framework (OSS). Migrate an existing Apple/Swift Expo native module from the Expo Modules API 1.0 definition DSL to the 2.0 macro API (sometimes called v2) while preserving its JavaScript and TypeScript contract. Use when converting or incrementally adopting @ExpoModule, @JS, @Event, @SharedObject, or @Record in an existing module. Do not use for creating a new module, general Expo SDK upgrades, or Android/Kotlin migrations.
version: 1.0.0
license: MIT
---
# 迁移 Expo 模块

迁移现有 Expo 模块的 Swift 端，同时不改变其可观察的 JS API。将当前的 JS/TypeScript 接口和测试视为兼容性契约。除非用户明确扩大任务范围，否则 Kotlin 保持使用 1.0 DSL。

## 前提条件

Expo Modules API 2.0 宏要求 `expo` 版本为 `57.0.7` 或更高。编辑前，请检查目标项目已安装的版本（`package.json`/锁文件中的 `expo`，或运行 `npm ls expo`）。如果版本更旧，请停止并告知用户先升级；不要尝试在不受支持的版本上执行迁移。这只是最低版本要求，并非兼容性保证：具体的宏和核心接口在 `57.x` 的不同版本中仍有差异，因此第 2 步仍必须核实当前检出的源代码。

## 参考资料

- 修改源代码前，请阅读 `references/migration-map.md`。其中包含从 1.0 到 2.0 的映射、语义陷阱和混合模式规则。
- 阅读 `references/example.md`，了解一个模块从混合模式到完整迁移的完整前后对比流程。当你需要了解各成员规则如何组合应用时，请参考此文档。
- 当无法确定当前检出的 `expo-modules-core` 版本或分支是否支持所有请求的宏时，请阅读 `references/compatibility.md`。其中说明了如何验证实际的编译时和运行时接口，而不是根据 SDK 版本进行猜测。

## 工作流程

### 1. 确立契约

编辑前，请检查仓库说明和工作树。找到 Swift 模块类、记录、共享对象、原生视图、JS/TS 绑定、测试、示例应用、podspec，以及已安装或检出的 `expo-modules-core`。

重写前，请清点每个导出项：

- 模块和共享对象的 JS 名称
- 函数名称、参数数量、参数标签、默认值、可空性、同步/异步行为、错误和队列语义
- 属性名称、可变性和常量缓存行为
- 事件传输名称和载荷结构
- 记录字段名称、默认值、必填性和可空性
- 共享对象构造函数以及实例/静态成员的归属
- 生命周期钩子和视图

使用 TypeScript 声明和 JS 调用位置来消除歧义。不要在语法迁移期间擅自“改进”必填性、重命名事件或更改同步行为。

### 2. 验证可用的 2.0 接口

检查目标实际使用的依赖项中的宏声明及其对应的核心钩子。不要因为某个宏能够编译，就假定 2.0 设计中的所有项目都已可用。

将每个 1.0 项目归类为：

- **迁移：**其宏和所需的核心运行时支持均已存在。
- **保留在 DSL 中：**混合模式能够安全保留该项目，或 2.0 中没有对应项。
- **受阻：**迁移会改变 JS 契约，或需要当前不可用的运行时支持。

与其生成未经验证的推测性代码，不如优先采用增量式混合模式结果。只要仍有 DSL 元素，就保留 `definition()`；仅当其为空且 `@ExpoModule` 保留了解析后的模块名称时，才将其删除。

### 3. 执行迁移

每次迁移一个语义组：模块命名、函数、属性/常量、事件、共享对象，最后是记录。尽量缩小差异范围。

遵循以下不变原则：

- 当 Swift 命名规则或宏默认值存在差异时，显式保留每个现有的 JS 可见名称。
- 保持原有的可选/默认行为。不能仅仅因为 2.0 能够表达必填字段，就将 1.0 中的可选记录字段改为必填字段。
- 除非已检出的宏能够对具有相同 JS 名称的重载进行分组和分派，否则不要迁移这些重载。
- 不要原样迁移固定到队列的 DSL 函数；应按照 `references/migration-map.md` 中的异步函数规则，将其重构到 Swift Concurrency 上，或通过 continuation 分派到原始队列。
- 在未验证支持的情况下，不要迁移视图、联合类型、同步事件或共享对象的静态函数。
- 除非用户请求更改 API，否则不要修改 Kotlin、JS 包装器或公共 `.d.ts` 文件。

完成每个组后，搜索本应已迁移的旧 DSL 条目和调用点。避免大范围格式化或无关清理。

### 当缺少对应的 2.0 实现或某个组迁移失败时

当步骤 2 将某个项目归类为**受阻**，或者某个已迁移的组无法构建或破坏了契约时，不要强行迁移。停止处理该组，并：

1. **询问用户希望如何处理**该项目，并提供两个选项：
   - **共存：**将该项目保留在 1.0 的 `definition()` DSL 中，与已迁移的 `@ExpoModule` 并存（混合模式），然后继续处理其他组。
   - **还原：**撤销该组的编辑，使其保持原有的 1.0 状态，然后继续处理。

   当混合模式已验证安全时，默认选择共存，因为这样可以保留最多的迁移成果。如果已部分应用的更改导致模块无法构建，并且无法通过增量方式修复，则选择还原。

2. **在 `expo/expo` 上创建跟踪 issue**，注明 2.0 尚未涵盖的功能，以便记录该缺口，而不是通过变通方案将其悄然掩盖。使用 `gh issue create --repo expo/expo`，并在发布前征得用户确认（根据仓库约定，未经批准不得发布面向外部的评论）。包括：
   - 1.0 成员及其 JS 契约
   - 缺少的具体宏或核心钩子（引用 `references/compatibility.md` 中关于证据缺口的说明）
   - 当前检出的 `expo-modules-core` 版本/分支

   在交接说明中引用该 issue，以便将剩余的 DSL 条目追溯到已知限制。

继续处理能够顺利迁移的其他组；单个受阻成员不应阻塞其余迁移。

### 4. 验证行为

先运行范围最小的可用检查，再验证实际集成层面：

1. 针对目标 `expo-modules-core` 构建 Apple 模块或对其执行类型检查。
2. 运行原生单元测试和 JS/TS 测试。
3. 如果仓库提供了示例应用，则构建并启动该应用。
4. 将最终导出的接口与步骤 1 中的清单进行比较。
5. 搜索残留的 `Name`、已迁移的 `Function`/`Property`/`Constant`/`Events` 条目、旧的 `sendEvent` 调用、`@Field` 以及重复注册。

仅靠展开测试是不够的：生成的宏代码看起来可能正确，但在面对不匹配的核心符号时仍可能失败。如果依赖项发生变化或缺少宏插件标志，请根据需要重新安装 JS 依赖项，运行仓库的 CocoaPods 安装工作流，并在诊断插件通信故障之前重启 Xcode。

## 交接

报告：

- 哪些成员已迁移到 2.0
- 哪些成员有意保留在 1.0 DSL 中，以及原因
- 任何对兼容性敏感的选择，尤其是事件名称、记录的必需性、常量和队列
- 已运行的命令以及任何尚未完成的验证

## 提交反馈
如果你在此技能中发现错误、误导性信息或过时信息，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-migrate-module" "<actionable feedback>"
```
仅当你有具体且可操作的问题需要报告时才提交。请提供尽可能多的相关上下文。
如果 AI 代理反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback 技能并遵循其 eval-candidate 流程，而不要重复使用上述命令。