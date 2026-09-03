---
name: eas-update
description: "EAS service (paid). Configure and use EAS Update for over-the-air JavaScript and asset updates with expo-updates and EAS CLI. Use when setting up OTA updates, running eas update:configure or eas update, publishing to preview/staging/production channels, explaining branches/channels/runtime versions, testing updates, or debugging why an installed build still shows old code. Load for TestFlight, preview, or production updates that do not appear, including questions about cold launches or reopening the app. Not for update health metrics; use eas-update-insights for adoption, crashes, and rollout monitoring."
version: 1.0.0
license: MIT
allowed-tools: "Bash(npx expo *), Bash(npx *eas-cli@*), Bash(eas *)"
---
# EAS Update

> **EAS 服务会产生费用。** EAS Update 可在 Free 计划中使用；发布和交付会消耗更新、带宽和存储额度，付费计划提供更高的额度。请参阅 https://expo.dev/pricing。

使用 EAS Update，可以向已安装的应用交付兼容的 JavaScript、样式和资源更改，而无需提交新的原生二进制文件。原生代码更改仍然需要新的构建。

## 从受支持的配置路径开始

在进行任何更改之前，检查 `package.json`、Expo 应用配置、`eas.json`（如果存在），以及 `ios/` 或 `android/` 是否处于版本控制中。审查 CLI 的更改时，使用你发现的信息：

- 保留现有的动态应用配置或平台特定应用配置。
- 如果存在 `eas.json`，保留其配置文件和现有的 channel 分配。CLI 只会为尚未设置 channel 的构建配置文件添加一个与配置文件名称匹配的 channel。
- 如果不存在 `eas.json`，不要手动创建它。CLI 可能会指引用户单独运行 `eas build:configure`。
- 如果原生项目处于版本控制中，CLI 应会同步平台的原生 Update 配置。如果不存在这些项目，则预期由持续原生生成在后续构建期间应用原生配置。

在安装软件包或解读特定版本的行为之前，先检测 Expo SDK 版本。

如果未安装 `expo-updates`，请安装兼容 SDK 的版本：

```bash
npx expo install expo-updates
```

从项目根目录进行配置：

```bash
npx eas-cli@latest update:configure
```

使用 `eas update:configure`，不要手动臆造 `updates.url`、`runtimeVersion`、原生元数据或构建配置文件的 channel。该命令能够理解 EAS 项目关联、持续原生生成以及包含已提交原生目录的项目。审查并解释其生成的差异。

如果由于项目尚未关联，或用户尚未授权所需的远程操作，导致命令无法继续，则在完成任何可独立有效的软件包安装后停止，并说明仍需完成的事项。不要通过手动添加 runtime-version 策略、配置插件、更新 URL 或 channel 来部分复现 `update:configure` 的行为。

对于动态应用配置、非 EAS 构建，或无法自动完成的命令，请遵循最新的设置文档，不要自行猜测：https://docs.expo.dev/eas-update/getting-started.md。

## 正确理解模型

- **构建：**已安装的原生应用。它包含原生代码、嵌入式更新、平台、运行时版本，以及通常在构建时固定的 channel。
- **更新：**针对某个平台和运行时版本发布的 JavaScript bundle、资源和元数据。
- **分支：**按顺序排列的更新流。最新的兼容更新处于激活状态。
- **Channel：**嵌入构建中的稳定部署目标。在服务器上，它指向一个分支。
- **运行时版本：**更新与构建中原生代码之间的兼容性边界。

只有当平台和运行时版本匹配，并且构建的 channel 指向包含该更新的分支时，构建才会接收更新：

```text
已安装构建（渠道：production，运行时：1.1.1，平台：ios）
  -> production 渠道
  -> production 分支
  -> 适用于运行时 1.1.1 和 ios 的最新更新
```

渠道和分支通常使用相同的名称，但它们是彼此独立的对象。`eas channel:edit` 会更改该渠道上所有构建所使用的服务器端分支映射，但不会更改单个安装中嵌入的渠道。

使用此模型做出决策，但只解释用户请求所需的概念，而不是每次都复述完整模型。

## 判断更新是否兼容

对于已安装的原生运行时已经支持的 JavaScript、样式和打包资源变更，使用更新。

当变更添加或修改原生代码或原生配置时，创建新的原生构建，这包括大多数原生库新增和 SDK 升级。不要通过变通方式绕过运行时不匹配，也不要暗示发布更新可以向现有构建添加原生能力。请参阅 https://docs.expo.dev/eas-update/runtime-versions.md。

不要将更改项目的运行时版本策略作为附带修复。解释当前策略如何影响兼容性；将更改该策略视为一个单独的决策，因为它会改变哪些已安装构建能够接收未来更新。

## 有意地发布

在依赖记忆中的标志之前，先检查当前 CLI 帮助：

```bash
npx eas-cli@latest update --help
```

对于常见的基于渠道的流程：

```bash
npx eas-cli@latest update \
  --channel <channel> \
  --message "<message>" \
  --environment <environment>
```

SDK 55 及更高版本要求发布时指定 EAS 环境。应有意选择环境，以便导出的代码获得预期的变量。

发布会更改远程状态，并可能影响已安装的应用。在运行发布命令之前，明确确切的项目、渠道、环境、平台、运行时版本和消息。只有在用户明确请求或批准时，才发布到 production；如果授权或目标不明确，请在运行命令前停下并询问。不要仅根据当前 Git 分支推断 production 目标。

优先使用预览或 staging 渠道进行验证。在提升经过测试的更新时，使用文档中说明的部署流程，以便 production 尽可能接收相同的构建产物：https://docs.expo.dev/eas-update/deployment.md。

## 根据构建类型进行测试

### 开发构建

使用开发构建的 Extensions UI、EAS 控制面板或 Expo Orbit 预览更新。普通的 `expo-dev-client` 开发构建，其行为并不像发布构建那样在启动时自动获取更新。

### 预览、TestFlight 和 production 构建

发布构建通常会优先保证启动速度。在默认启动行为下，应用可能会先启动当前嵌入的更新或缓存的更新，同时在后台下载新发布的更新。下载的更新会在之后重新启动时应用。

进行手动 QA 时，应完全终止应用，而不是将其置于后台；重新打开应用，留出足够时间让更新下载；如果看不到变更，则再次完全终止并重新打开应用。将此描述为**最多两次冷启动**，而不是 TestFlight 专属流程：

1. 一次启动可以发现并下载更新。
2. 后续启动可以运行已下载的更新。

不要自动更改 `fallbackToCacheTimeout` 来避免第二次启动。启动时等待会以启动延迟和可靠性为代价，加快更新激活速度。如果应用需要有意设计的更新 UX，可以考虑使用 `expo-updates` API 来检查、获取更新，并呈现非阻塞的重启操作。请使用与项目检测到的 SDK 版本对应的 `expo-updates` API 参考。

## 调试未更新的构建

按以下顺序检查：

1. 确认更新已发布到预期的 EAS 项目、channel 或 branch、平台和环境。
2. 将已安装构建的平台和 runtime version 与已发布的更新进行比较。
3. 确认构建实际包含预期的更新 URL 和 channel；app-config 的更改只有在重新编译构建后才会生效。
4. 检查 channel 到 branch 的映射，以及该 branch 上的活动更新。
5. 完全终止 release 构建，并等待正常的下载后应用生命周期完成。
6. 使用当前调试指南检查 native 日志、导出问题和配置： https://docs.expo.dev/eas-update/debug.md。

永远不要仅仅为了让更新显示出来而绕过兼容性或防止应用变砖的安全机制。

## 高级及相关工作流

- **频道切换：** 单个 release 构建可以覆盖其 `expo-channel-name` 请求标头，以请求另一个兼容的 channel。这不同于更改服务端的 channel 到 branch 映射。请遵循 https://docs.expo.dev/eas-update/channel-surfing.md，并保留其中关于访问控制、持久性、恢复和兼容性的约束。
- **更新健康状况：** 发布后加载 `eas-update-insights`，以监控采用率、启动失败、崩溃率、负载大小和发布进度。
- **应用商店发布：** 当 native 更改需要新的 TestFlight、App Store 或 Play Store 构建时，加载 `eas-app-stores`。

## 官方参考

- 设置：https://docs.expo.dev/eas-update/getting-started.md
- 概念与匹配：https://docs.expo.dev/eas-update/how-it-works.md
- 部署：https://docs.expo.dev/eas-update/deployment.md
- 调试：https://docs.expo.dev/eas-update/debug.md
- 当前 EAS CLI 参考：https://docs.expo.dev/eas/cli.md

## 提交反馈
如果你在此 skill 中遇到错误、误导性信息或过时信息，请报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "eas-update" "<actionable feedback>"
```
仅当你有具体且可操作的反馈时才提交。请尽可能包含相关上下文。
如果 AI agent 反复执行 Expo 任务失败，或用户不得不接管 Expo 任务，请加载 expo-skill-feedback skill，并遵循其 eval-candidate 流程，而不是重复使用上述命令。