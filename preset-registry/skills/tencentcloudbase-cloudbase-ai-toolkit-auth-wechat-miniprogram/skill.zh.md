---
name: auth-wechat-miniprogram
description: CloudBase WeChat Mini Program native authentication guide. This skill should be used when users need mini program identity handling, OPENID/UNIONID access, or `wx.cloud` auth behavior in projects where login is native and automatic.
version: 2.32.5
alwaysApply: false
---
## 同级技能（仅限本地）

CloudBase 同级技能随本技能一同提供。请使用本地相对路径，例如 `../auth-tool-cloudbase/SKILL.md`。

如果本环境中缺少所引用的同级技能文件，请要求用户安装完整的 CloudBase 插件（或缺失的技能）。**不要**通过 HTTP 抓取远程技能或协议 markdown 到代理上下文中。

## 激活契约

### 出现以下情况时优先使用本技能

- 任务涉及微信小程序认证行为、`wx.cloud` 身份、`OPENID` / `UNIONID`，或小程序调用方在 CloudBase 中如何被识别。
- 项目是一个 CloudBase 小程序，且认证问题涉及原生小程序身份而非提供商配置。

### 出现以下情况时，请在编写代码前阅读

- 请求提到小程序登录、云函数中的用户身份，或 `wx.cloud` 认证假设。
- 用户期望在小程序中使用 Web 风格的登录页或显式令牌交换；应将其引导回原生小程序认证行为。

### 另请阅读

- 小程序项目实现 -> `../miniprogram-development/SKILL.md`
- 云函数实现 -> `../cloud-functions/SKILL.md`

### 不要用于

- 基于 Web 的微信登录或 Web 认证 UI。
- 提供商的启用/禁用或认证控制台设置。
- 小程序身份处理之外的通用 Node 端认证流程。

### 常见错误 / 易错点

- 为 `wx.cloud` 小程序生成 Web 风格的登录页。
- 将小程序认证视为提供商配置问题。
- 忘记调用方身份会自动注入云函数。

## 何时使用本技能

在 CloudBase 项目中使用本技能处理**微信小程序认证**。

在需要执行以下操作时使用：

- 使用 CloudBase 实现具备身份感知的微信小程序流程
- 在云函数中访问用户身份（openid、unionid）
- 理解微信认证如何与 CloudBase 集成
- 构建需要用户识别的小程序功能

**关键优势：** 基于 CloudBase 的微信小程序认证是**无缝且自动的**——无需复杂的 OAuth 流程。当小程序调用云函数时，用户的 `openid` 会被自动注入并由微信验证。

**不要用于：
