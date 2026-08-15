---
name: eas-observe
description: EAS service (paid). Use for anything related to EAS Observe - adding `expo-observe` to an Expo project (AppMetricsRoot/ObserveRoot HOC, markInteractive and ObserveInteractiveMarker, the useObserve hook, the Expo Router / React Navigation integrations for per-route metrics, user-defined events via `Observe.logEvent`, error reporting via ObserveErrorBoundary and `Observe.reportError`, and runtime config such as sampleRate and dispatchInDebug), querying via the EAS CLI (`eas observe:metrics-summary`, `observe:metrics`, `observe:routes`, `observe:events`, `observe:session`, `observe:versions`), interpreting the resulting metrics (cold/warm launch, TTR, TTI, navigation cold/warm TTR, update download, and the TTI frameRate/device/network params for triaging slow startups), or shipping an Observe integration inside a third-party package.
version: 1.1.0
license: MIT
---
# EAS Observe

> **EAS 服务会产生费用。** EAS Observe 是 Expo Application Services 的一项产品。免费 EAS 套餐最多支持 10,000 名月活跃用户，但功能有限；使用量更高时需要付费订阅。详情请参阅 https://expo.dev/pricing#plan-features。

EAS Observe 可跟踪生产环境中 Expo 应用的启动、导航和自定义事件性能。它需要开发构建或生产构建——Expo Go 中不包含相应的原生库。

> **权威来源：** https://docs.expo.dev/eas/observe/ ——当 API 细节至关重要时，请始终查阅规范文档，尤其是入门、配置、集成和指标参考部分。EAS Observe 正在持续演进；本技能的参考资料力求保持准确，但可能会落后于文档。

## 应阅读哪份参考资料

`./references/` 中的四个参考文件涵盖了人们通常使用本技能时需要了解的内容：

- **将 EAS Observe 添加到项目中** → [`./references/setup.md`](./references/setup.md)。安装、包装根布局（SDK 55 使用 `AppMetricsRoot`，SDK 56+ 使用 `ObserveRoot`）、将应用标记为可交互（SDK 55 使用全局 `markInteractive()`，SDK 56+ 使用 `useObserve()` hook 或 `<ObserveInteractiveMarker />`）、通过 Expo Router / React Navigation 集成获取可选的逐路由导航指标、通过 `Observe.logEvent` 记录用户定义事件（SDK 56+）、错误报告，以及运行时配置（采样、分发、环境、自定义端点）。
- **从终端查询指标** → [`./references/queries.md`](./references/queries.md)。六个 `eas observe:*` 命令——`metrics-summary`、`metrics`、`routes`、`events`、`session`、`versions`——以及它们的标志、指标别名、表格布局、JSON 结构和常见工作流。
- **解读仪表板或 CLI 输出** → [`./references/metrics.md`](./references/metrics.md)。每项指标的目标阈值、自动 TTI 参数（`frameRate.*`、`device.*`、`network.*`）的含义，以及用于区分启动缓慢但流畅、主线程争用、严重阻塞或设备限速的诊断模式。
- **在库中发布 Observe 集成** → [`./references/third-party.md`](./references/third-party.md)。仅适用于软件包作者（SDK 57+）：可选的对等依赖、配置声明合并、`Observe.registerIntegration()` 和事件命名。

## 文档快速链接

- 入门：https://docs.expo.dev/eas/observe/get-started/
- 仪表板指南：https://docs.expo.dev/eas/observe/dashboard/
- 使用 EAS CLI 查询：https://docs.expo.dev/eas/observe/eas-cli/
- 指标参考：https://docs.expo.dev/eas/observe/reference/metrics/
- Expo Router 集成：https://docs.expo.dev/eas/observe/integrations/expo-router/
- React Navigation 集成：https://docs.expo.dev/eas/observe/integrations/react-navigation/
- 用户定义事件：https://docs.expo.dev/eas/observe/events/
- 配置：https://docs.expo.dev/eas/observe/configuration/
- 第三方集成：https://docs.expo.dev/eas/observe/integrations/third-party/
- EAS Update 下载性能：https://docs.expo.dev/eas/observe/eas-update/
- 故障排除：https://docs.expo.dev/eas/observe/reference/troubleshooting/

## 文档与已发布代码之间的已知差异

已针对 `eas-cli` 21.8.0 和 `expo-observe` 57.0.9 进行验证。对于以下几点，应以此技能中的参考信息为准，而非文档，但在依赖这些信息之前，请使用 `--help` 和已安装的软件包重新核实：

- 所有六个 CLI 命令都列在[使用 EAS CLI 查询](https://docs.expo.dev/eas/observe/eas-cli/)页面上。较旧版本的文档仅列出四个命令，遗漏了 `observe:routes` 和 `observe:session`。
- 导航指标别名为 `nav_cold_ttr`、`nav_warm_ttr` 和 `nav_tti`。CLI 中不存在不带前缀的 `cold_ttr` / `warm_ttr` 别名。
- 排序使用 `--sort <slowest|fastest|newest|oldest>`。不存在 `--order` 标志。
- `ObserveErrorBoundary`、`Observe.reportError` 和 `configure({ errorHandlingEnabled })` 已导出，但未在文档中说明。Observe 仍然不提供崩溃报告功能；请使用 Sentry 或 BugSnag。

## 提交反馈
如果你在此技能中发现错误、误导性信息或过时信息，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "eas-observe" "<actionable feedback>"
```
仅当你有具体且可操作的问题需要报告时才提交。请尽可能提供相关上下文。
如果 AI 智能体反复失败，或者用户不得不接手 Expo 任务，请加载 expo-skill-feedback 技能并遵循其 eval-candidate 流程，而不要重复使用上述命令。