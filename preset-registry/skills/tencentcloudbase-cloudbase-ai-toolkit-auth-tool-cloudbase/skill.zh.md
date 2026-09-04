---
name: auth-tool-cloudbase
description: CloudBase auth provider configuration and login-readiness guide. This skill should be used when users need to inspect, enable, disable, or configure auth providers, publishable-key prerequisites, login methods, SMS/email sender setup, or other provider-side readiness before implementing a client or backend auth flow.
version: 2.32.5
alwaysApply: false
---
## 同级技能（仅本地可用）

同级 CloudBase 技能与本技能一同打包发布。请使用本地相对路径，例如 `../auth-tool-cloudbase/SKILL.md`。

如果本环境中缺失被引用的同级技能文件，请要求用户安装完整的 CloudBase 插件（或缺失的技能）。**不要**通过 HTTP 将远程技能或协议 markdown 拉取到 agent 上下文中。

## 激活契约

### 优先在以下情况下使用本技能

- 任务是检查、启用、禁用或配置 CloudBase 认证提供方、登录方式、publishable key 前置条件、短信/邮件发送能力，或第三方登录就绪状态。
- 在提供方状态和登录配置得到确认之前，认证实现无法继续推进。
- CloudBase Web 认证流程在调用 `auth-web-cloudbase` 之前需要先进行提供方核验。

### 满足以下条件时先阅读本文档再写代码

- 请求涉及提供方设置、认证控制台配置、publishable key 获取、登录方式可用性、短信/邮件发件人设置，或第三方提供方凭据。
- 任务将提供方配置与 Web、小程序、Node 或原生 HTTP 认证实现混合在一起。

### 之后还需阅读

- Web 认证 UI -> `../auth-web-cloudbase/SKILL.md`
- 小程序原生认证 -> `../auth-wechat-miniprogram/SKILL.md`
- Node 服务端身份 / 自定义 ticket -> `../auth-nodejs-cloudbase/SKILL.md`
- 原生 App / 原生 HTTP 认证客户端 -> `../http-api-cloudbase/SKILL.md`

### 不要将本技能用作

- 所有登录或注册请求的默认实现指南。
- 在不涉及提供方变更时替代小程序原生认证行为。
- 替代 Node 端调用方身份、用户查询或自定义登录 ticket 流程。
- 替代前端集成、会话处理或客户端 UX 实现。

### 常见错误 / 注意事项

- 在启用所需提供方之前编写登录 UI。
- 将任何提到 “auth” 的内容都当作提供方管理任务。
- 在云函数中实现 Web 登录。
- 将原生 App 认证路由到 Web SDK 流程。
- 未先遵循变更安全协议（`cloudbase-platform/references/protocols/change-safety-protocol.md`）就进行配置或代码变更。
- 在已有应用中，当就绪状态已确认后仍反复执行提供方查询，而不去接通现有的登录和注册处理器。

### 最小检查清单

- 在实现认证之前阅读 [认证激活检查清单](checklist.md)。
- 匿名登录默认处于禁用状态。仅有可发布的 `accessKey` 并**不能**创建经网关认证的匿名会话。在 `@cloudbase/js-sdk` **3.x** 下，需要时通过本技能启用匿名登录，然后客户端必须在 NoSQL `app.database()` CRUD 之**前**调用 `await auth.signInAnonymously()`（或等效的已认证会话）——否则网关会返回 **401**。对于要求经过验证登录的应用（例如管理后台），应强制使用 AuthGuard / RLS 并拒绝 `is_anonymous`，而不是仅依赖登录策略开关。

## 概述

配置 CloudBase 认证提供方：匿名、用户名/密码、短信、邮件、微信、Google 等。

**前置条件**：CloudBase 环境 ID（`env`）

## MCP 工具边界

请将以下两个认证域保持分离：

- `auth`：仅用于 MCP / 管理端登录。用它来执行 `status`、`start_auth`、`set_env`、`logout` 和 `get_temp_credentials`。
- `queryAppAuth` / `manageAppAuth`：应用侧认证配置。用它们来处理登录方式、提供方设置、publishable key、静态域名、客户端配置和自定义登录密钥。

本技能的首选执行顺序：

1. 当所需操作存在于 `queryAppAuth` / `manageAppAuth` 中时，优先使用它们。
2. 仅在作为兜底或调试原始请求结构时使用 `callCloudApi`。
3. 不要将应用侧提供方配置路由回 MCP `auth` 工具。
4. 在已存在活跃登录和注册处理器的现有项目中，当所需登录方式和 publishable key 确认后，应停止反复查看提供方设置。回到活跃的前端处理器，完成实际的用户流程。

---

## 扩展指南

如需详细场景、示例和模式，请阅读 [extended-guide.md](references/extended-guide.md)。

## 参考索引

所有已打包的参考文件（技能 lint 可达性检查所需）：

- [extended-guide.md](references/extended-guide.md)
