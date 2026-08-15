---
name: expo-observe
description: Use for anything related to EAS Observe — adding `expo-observe` to an Expo project (AppMetricsRoot/ObserveRoot HOC, markInteractive, the useObserve hook, the Expo Router / React Navigation integrations for per-route metrics, and user-defined events via `Observe.logEvent`), querying via the EAS CLI (`eas observe:metrics-summary`, `observe:metrics`, `observe:routes`, `observe:events`, `observe:versions`), or interpreting the resulting metrics (cold/warm launch, TTR, TTI, navigation cold/warm TTR, update download, and the TTI frameRate params for triaging slow startups).
version: 1.0.0
license: MIT
---
# EAS Observe

EAS Observe 用于跟踪生产环境中 Expo 应用的启动、导航和自定义事件性能。

> **权威来源：** https://docs.expo.dev/eas/observe/ — 当 API 细节至关重要时，请始终查阅官方文档，尤其是入门、配置、集成和指标参考相关内容。EAS Observe 正在持续演进；本技能的参考资料力求保持准确，但可能会滞后于文档。

## 应阅读哪份参考资料

`./references/` 中的三个参考文件涵盖了人们通常使用本技能处理的三类需求：

- **将 EAS Observe 添加到项目中** → [`./references/setup.md`](./references/setup.md)。安装、封装根布局（SDK 55 使用 `AppMetricsRoot`，SDK 56+ 使用 `ObserveRoot`）、调用 `markInteractive()`（SDK 55 中为全局调用，SDK 56+ 中通过 `useObserve()` hook 调用）、通过 Expo Router / React Navigation 集成提供可选的逐路由导航指标，以及通过 `Observe.logEvent` 提供用户定义事件（SDK 56+）。
- **从终端查询指标** → [`./references/queries.md`](./references/queries.md)。五个 `eas observe:*` 命令 — `metrics-summary`、`metrics`、`routes`、`events`、`versions` — 包括标志、表格布局、JSON 结构和常见工作流。
- **解读仪表板或 CLI 输出** → [`./references/metrics.md`](./references/metrics.md)。每项指标的目标阈值、TTI 的 `frameRate.*` 参数含义，以及用于区分缓慢但流畅的启动、主线程争用和硬阻塞的诊断模式。

## 文档快速链接

- 入门：https://docs.expo.dev/eas/observe/get-started/
- 仪表板指南：https://docs.expo.dev/eas/observe/dashboard/
- 指标参考：https://docs.expo.dev/eas/observe/reference/metrics/
- Expo Router 集成：https://docs.expo.dev/eas/observe/integrations/expo-router/
- React Navigation 集成：https://docs.expo.dev/eas/observe/integrations/react-navigation/
- 用户定义事件：https://docs.expo.dev/eas/observe/events/
- 配置：https://docs.expo.dev/eas/observe/configuration/