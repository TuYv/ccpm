---
name: expo-module
description: Framework (OSS). Guide for creating and writing Expo native modules and views using the Expo Modules API (Swift, Kotlin, TypeScript). Covers module definition DSL, native views, shared objects, config plugins, lifecycle hooks, autolinking, and type system. Use when building or modifying native modules for Expo. Not for migrating an existing Swift module from the definition DSL to the Expo Modules API 2.0 macros; use expo-migrate-module (from the expo-experiments plugin) for that.
version: 1.0.0
license: MIT
---
# 编写 Expo 模块

使用 Expo Modules API 构建原生模块和视图的完整参考。涵盖 Swift（iOS）、Kotlin（Android）和 TypeScript。

## 何时使用

- 创建新的 Expo 原生模块或原生视图
- 向 Expo 应用添加原生功能（相机、传感器、系统 API）
- 封装平台 SDK 以供 React Native 使用
- 构建用于修改原生项目文件的配置插件
- 为现有 Expo 模块添加 Android、Apple 或 Web 支持
- 编辑 `expo-module.config.json`、配置插件或生命周期钩子

如需将现有 Swift 模块从定义 DSL 迁移到 Expo Modules API 2.0 宏（`@ExpoModule`、`@JS`、`@Event`），请改用 `expo-migrate-module` skill（来自 `expo-experiments` 插件）。

## 参考资料

根据需要查阅以下资源：

```
references/
  create-expo-module.md      Scaffolding and add-platform-support workflow, defaults, and quirks
  native-module.md           Module definition DSL: Name, Function, AsyncFunction, Property, Constant, Events, type system, shared objects
  native-view.md             Native view components: View, Prop, EventDispatcher, view lifecycle, ref-based functions
  lifecycle.md               Lifecycle hooks: module, iOS app/AppDelegate, Android activity/application listeners
  config-plugin.md           Config plugins: modifying Info.plist, AndroidManifest.xml, reading values in native code
  module-config.md           expo-module.config.json fields, file placement, and autolinking behavior
```

## 快速开始

优先使用 `create-expo-module`，而不是手动创建原生模块文件和目录。在实践中，最佳路径通常是先创建脚手架，然后在其基础上进行构建。脚手架会设置预期的目录结构、`expo-module.config.json`、podspec 或 Gradle 文件、TypeScript 绑定，以及独立示例应用流程。

如果现有 Expo 模块仅需添加另一个平台，请使用 `create-expo-module add-platform-support`，而不是手动复制原生目录。

在搭建脚手架或扩展模块之前，请参阅 [references/create-expo-module.md](references/create-expo-module.md)。其中涵盖：

- 本地模块与独立模块
- `--platform`、`--features`、`--barrel`、`--package-manager` 以及非交互模式
- `expo.autolinking.nativeModulesDir`
- `add-platform-support` 的行为和特殊情况

## 推荐工作流

1. 首先选择脚手架类型：
   - **本地模块**，用于单个应用
   - **独立模块**，用于复用、monorepo 或发布
2. 确定所需的原生 `expo-module` 功能。
   - 根据用户的指示，确定哪些功能脚手架会有用。
   - 可用功能：`Constant`、`Function`、`AsyncFunction`、`Event`、`View`、`ViewEvent`、`SharedObject`
3. 有针对性地搭建脚手架：
   - 传入明确的 slug 或路径
   - 有意识地选择 `--platform`，而不是依赖默认值
   - 使用 `--features` 选择代码示例，并在下一步中修改这些示例以匹配实际实现。
4. 使用实际实现替换生成的示例代码。
5. 如果稍后添加新平台，请优先使用 `add-platform-support`，而不是手动复制文件。

## 实用脚手架规则

- 功能示例为**可选加入**。如果未选择任何功能，新搭建的模块可以保持最精简的结构。
- `ViewEvent` 意味着需要 `View`。
- 默认情况下，本地模块不会生成 `index.ts` 桶文件。仅在需要时使用 `--barrel`。
- 在非交互式本地脚手架中，请显式传入位置参数形式的 slug 或路径。`--name` 修改的是原生类名，而不是文件夹名称。
- 如果配置了 `expo.autolinking.nativeModulesDir`，本地模块会位于该目录中；否则位于 `modules/` 中。
- 独立模块拥有自己的包元数据、脚本，并且通常还有一个示例应用。本地模块则使用宿主应用的工具链。

## 核心文件结构

Swift 和 Kotlin DSL 采用相同的结构。Swift 通常是最清晰的主要示例；有关特定功能的详细信息，请查阅参考资料。

## 模块结构参考

Swift 和 Kotlin DSL 采用相同的结构。此处同时展示两个平台以供参考——在其他参考文件中，除非 Kotlin 模式存在显著差异，否则将以 Swift 作为主要语言进行展示。

**Swift (iOS)：**

```swift
import ExpoModulesCore

public class MyModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyModule")

    Function("hello") { (name: String) -> String in
      return "Hello \(name)!"
    }
  }
}
```

**Kotlin (Android)：**

```kotlin
package expo.modules.mymodule

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MyModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MyModule")

    Function("hello") { name: String ->
      "Hello $name!"
    }
  }
}
```

**TypeScript：**

```typescript
import { requireNativeModule } from "expo";

const MyModule = requireNativeModule("MyModule");

export function hello(name: string): string {
  return MyModule.hello(name);
}
```

### expo-module.config.json

```json
{
  "platforms": ["android", "apple"],
  "apple": {
    "modules": ["MyModule"]
  },
  "android": {
    "modules": ["expo.modules.mymodule.MyModule"]
  }
}
```

注意：iOS 仅使用类名；Android 使用完全限定类名（包名 + 类名）。有关所有字段，请参阅 `references/module-config.md`。

## 提交反馈
如果你在此技能中遇到错误、误导性信息或过时信息，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-module" "<actionable feedback>"
```
仅当你有具体且可操作的问题需要报告时才提交。请尽可能提供相关上下文。
如果 AI 代理反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback 技能并遵循其 eval-candidate 流程，而不要重复使用上述命令。