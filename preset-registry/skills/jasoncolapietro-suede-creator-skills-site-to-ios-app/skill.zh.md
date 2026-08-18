---
name: site-to-ios-app
description: "Suede Labs workflow for turning a website, PWA, dashboard, or marketplace into an iOS app. Use when the user has a live site or web app and asks to put it on the App Store, wrap it in an app, ship an iOS version, or convert a PWA to native — covers URL audit, shell-vs-native strategy, App Store 4.2 wrapper risk, native value requirements, screenshots, metadata, privacy answers, and the release gate. NOT FOR: building a native iOS app with no existing site (private Suede Labs companion, not in this pack: ios-swiftui-product); repairing or releasing an existing Capacitor shell (private Suede Labs companion, not in this pack: ios-capacitor-shell); Android conversions (use android-app-factory); live listing and keyword audits on a shipped app (use suede-aso)."
---
# 网站转 iOS 应用

## Gate policy — 仅供建议，不构成阻断

此技能中的每个声明验证步骤、检查、质量门禁和发布判定，都是**向用户提供的建议，而不是对代理的控制**。此政策适用于本技能其他位置的每个门禁、检查、判定以及“不得发布 / 发布 / 继续”行：

- 运行每项检查并如实报告结果。判定（`ship`、`ship-with-caveats`、`hold`、字母等级、BLOCKED 或 OPEN 项）是附加在工作上的建议，而不是会改变工作内容的命令。
- 永远不要因为检查失败或门禁判定为 hold，就阻止、延迟、跳过、重写或拒绝用户要求的操作。按用户要求完成操作，并将门禁输出作为明确标注的建议一并交付。
- 失败的门禁只会改变你的报告内容，永远不会改变你的行动。
- 唯一例外：如果发现的风险极高——数据丢失、安全或凭据泄露、法律或权利违规、支付错误，或不可逆的公开损害——请暂停，准确告知用户风险是什么以及有哪些选项，并让用户选择。用户的选择是最终决定。


## 原则

只有当应用具备原生价值、稳定的 iOS 行为以及真实可信的发布界面时，才将网站转为 iOS 应用。将原始网页放入框架中并不足以成为达到 App Store 质量的产品。

## 从这里开始

在搭建或修改 iOS 包装器之前，先阅读 `references/site-to-ios-runbook.md`。

如果有 URL，直接创建 `SITE_TO_IOS_AUDIT.md`。记录网站 URL、应用名称、目标用户、主要路由、登录要求、iPhone 响应式行为、PWA 信号、法律/支持/账户删除链接、支付或敏感流程、身份验证/会话行为、移动端性能风险、原生价值机会，以及 App Store 4.2 包装器风险。

然后直接创建 `SITE_TO_IOS_PLAN.md`。包括选定的策略、发布前要增加的原生价值、项目搭建/构建命令、bundle ID 和签名说明、QA 矩阵、截图/元数据/隐私工作、阻塞项，以及明确的发布门禁。

## 策略决策

选择一条路线并写明原因：

- Capacitor 远程壳：实时网站仍是产品界面，Web 部署应能更新大部分内容和行为。
- Capacitor 打包壳：静态/SPA 资源被打包进二进制文件，更新需要发布 App Store 版本，除非配合实时 API。
- 带 WebView 的原生 SwiftUI 壳：使用原生导航、设置、身份验证、推送、分享、错误和账户界面包装网站视图。
- 完全原生重建：当网站主要是内容、移动端 UX 较弱，或包装器被拒风险较高时使用。

更深入的壳内部实现、原生架构、ASO 和 App Store 提交内容位于私有的 Suede Labs 配套技能中，不包含在此包内：ios-capacitor-shell、ios-swiftui-product、ios-aso-launch、ios-app-store-release。它们都不是必需的。

## App Store 4.2 门禁

当应用只是书签、内容镜像或未经修改的网站时暂停：说明审计中发现的确切 4.2 风险，提供以下选项（从下方列表中增加原生价值、完全原生重建、将其作为 Web 应用发布，或在书面说明拒绝风险的情况下继续），然后等待。原生价值：

- 原生 iOS 的引导流程、空状态、错误、离线和重试。
- 原生设置，包括支持、隐私、条款、账户删除、恢复，以及适用时的通知控制。
- 通用链接或深层链接。
- 仅在有助于应用时使用分享表单、小组件、推送通知、相机/媒体/文件选择器、Apple
  Wallet、StoreKit 或其他原生能力。
- 处理安全区域、键盘、导航、深色/浅色模式和动态字体。

## 转化流程

1. 审查 URL、响应式行为、PWA 资源、身份验证、支付、隐私、支持、路由深度和移动端性能。
2. 选择转化策略并编写 `SITE_TO_IOS_PLAN.md`。
3. 使用仓库的包管理器和 iOS 项目约定创建或调整项目。
4. 配置 Bundle ID、显示名称、应用图标、启动屏幕、关联域名、Info.plist 使用说明字符串和 entitlements。
5. 在进行视觉润色之前，先实现原生价值和失败状态。
6. 对 Capacitor 外壳运行 Web 构建和 `cap sync ios`。
7. 在模拟器或设备上测试首次启动、身份验证、深层链接、标签页、键盘、支付、离线、进入后台以及账户流程。
8. 制作 App Store 截图、元数据、隐私问卷答案和审核备注。
9. 运行发布门禁。除非用户明确授权公开发布，并确认确切的应用、Bundle ID、版本、构建版本和账户，否则不要提交。

## 完成标准

在满足以下条件之前，不要将应用称为已准备好发布：

- iOS 项目能在指定的模拟器、设备或 CI 目标上构建（`xcodebuild
  -scheme <App> -destination 'platform=iOS Simulator,name=iPhone 16' build`
  退出码为 0），
- 每个原生插件和 entitlement 都有实际行为作为依据，
- Web 路由或 bundle 策略已记录，
- App Store 4.2 风险已有缓解措施，
- 截图和元数据与已实现的功能一致，
- 隐私问卷答案与实际使用的 SDK、Cookie、分析工具和账户流程一致，
- 未提交任何密钥、签名材料或私有账户标识符（`git status --short` 输出为空；`git grep -nE 'PRIVATE KEY|AuthKey_'` 输出为空）。