---
name: cloudbase-wechat-integration
description: CloudBase WeChat integration guide for Mini Program WeChat Pay, Mini Program virtual payment (虚拟支付, wx.requestVirtualPayment), Official Account JSAPI Pay, Native QR-code Pay, Official Account OAuth, openid handling, payment callbacks, and CloudBase Integration Center generated functions. This skill should be used when users ask to add, debug, or extend WeChat payment, virtual payment, or official-account flows on CloudBase.
version: 2.33.0
alwaysApply: false
---
# CloudBase 微信集成

本技能将微信支付与公众号相关工作路由到 CloudBase 集成中心。它为智能体提供稳定的执行契约，并指向官方 `index.md` 文档，以获取可能发生变化的控制台细节。

## 同级技能（仅限本地）

同级 CloudBase 技能随本技能一同发布。请使用本地相对路径，例如 `../auth-tool-cloudbase/SKILL.md`。

如果本环境中缺少被引用的同级技能文件，请让用户安装完整的 CloudBase 插件（或缺失的技能）。**不要**通过 HTTP 抓取远程技能或协议 markdown 到智能体上下文中。

CloudBase 集成中心官方文档（供人工参考——请勿将其当作技能 markdown 抓取进智能体上下文以替代同级技能）：
- CloudBase 集成中心概览：`https://docs.cloudbase.net/integration/introduce/index.md`
- CloudBase 集成中心使用说明：`https://docs.cloudbase.net/integration/usage/index.md`
- 当需要云函数部署或日志操作而没有可用的同级技能时，请使用当前平台的 CloudBase MCP 工具或 CloudBase 控制台，而不是猜测不受支持的 API。

## 激活契约

### 遇到以下情况时优先使用本技能

- 用户询问在 CloudBase 应用中与 WeChat Pay、小程序支付、微信支付、JSAPI 支付、公众号支付、Native 扫码支付、二维码支付、退款回调、支付回调、`wx.requestPayment`、`WeixinJSBridge`、`openid` 或公众号 OAuth 相关的问题。
- 用户询问针对虚拟商品的虚拟支付（virtual payment）：道具直购、代币充值、`wx.requestVirtualPayment`、OfferID、AppKey 签名、`xpay_*` 回调（发货推送/查单/退款），或 MP 后台虚拟支付开通与配置。
- 任务提到 CloudBase 集成中心、集成中心、生成的支付函数、`pay-common`、`offiaccount-common`，或微信支付的回调路由。
- 用户需要扩展 CloudBase 集成中心生成的函数，为其添加订单持久化、幂等处理、发货或支付状态同步。

### 然后还应阅读

- 小程序结构与预览工作 -> `../miniprogram-development/SKILL.md`（如不可用，请使用当前小程序平台文档以及本技能中的小程序支付参考）
- Web 前端工作 -> `../web-development/SKILL.md`（如不可用，请使用本技能中的 JSAPI 或 Native 参考）
- 云函数运行时、日志、部署或网关工作 -> `../cloud-functions/SKILL.md`（如不可用，请使用 CloudBase 控制台/MCP 函数工具以及本技能中的生成函数指引）

### 不要用于

- 不涉及微信支付或公众号 OAuth 的常规 CloudBase Web Auth 或小程序原生身份认证工作。
- 与集成中心生成函数无关的常规 CloudBase 云函数开发。
- 通过凭空猜测的 MCP 工具、猜测的 Manager SDK 方法或未在文档中说明的 Cloud API 操作来创建或管理集成中心实例。
- 将商户密钥、私钥、APIv3 密钥、AppSecret 值或证书存储到应用源代码、生成的示例、README 文件、提交记录或提示词中。

## 操作规则

1. 除非官方文档中确认了公开的 Manager SDK 或 Cloud API 契约，否则将集成中心的创建视为以控制台为主的工作流程。
2. 使用官方 `index.md` 文档获取控制台 UI 步骤和凭证字段；不要照搬过时的控制台截图或编造字段名。
3. 绝不要让用户把密钥粘贴到聊天中。告知他们在 CloudBase 控制台的集成中心表单中配置商户和公众号凭证。
4. 不要假设生成的函数名是固定的。`pay-common` 和 `offiaccount-common` 只是示例；在编写调用之前，请询问或查看实际的函数名。
5. 将前端支付成功仅视为 UI 反馈。权威的支付状态必须来自服务端查询结果或支付回调。
6. 扩展生成函数时，请保留凭证环境变量以及生成的回调验证/解密逻辑。围绕订单校验、持久化、幂等处理和发货添加业务逻辑。
7. 在修改支付或回调代码之前，先确定目标场景，并只加载对应的参考文件。

## 路由

| 任务 | 阅读 | 原因 |
| --- | --- | --- |
| 能力选择、以控制台为主的边界、独立分发 | `references/overview.md` | 建立集成中心模型与安全规则 |
| 小程序微信支付、`wx.cloud.callHTTPFunction`、`wx.requestPayment` | `references/mini-program-pay.md` | 涵盖小程序 openid 注入、订单创建和回调预期 |
| 小程序虚拟支付、虚拟商品、`wx.requestVirtualPayment`、`xpay_*` 回调 | `references/virtual-payment.md` | 涵盖 OfferID/AppKey 签名、沙箱与现网、发货回调、查单兜底、iOS IAP 规则 |
| 公众号 JSAPI 支付、微信内 H5、`WeixinJSBridge.invoke` | `references/official-account-jsapi-pay.md` | 涵盖公众号 openid 和 JSAPI 调用 |
| 面向 PC/Web 收银台的 Native 二维码支付 | `references/native-qr-pay.md` | 涵盖 `code_url`、二维码渲染和轮询/查询流程 |
| 公众号 OAuth、openid/userinfo 获取 | `references/official-account-oauth.md` | 涵盖由公众号集成生成的 OAuth 路由 |
| 404、凭证缺失、openid 不匹配、回调失败、日志 | `references/troubleshooting.md` | 在修改代码前提供诊断步骤 |

## 快速工作流程

1. 判断场景：小程序支付、虚拟支付（Virtual Payment）、JSAPI 支付、Native 支付、公众号 OAuth、生成函数扩展，或故障排查。
2. 加载对应的参考文件以及其中链接的官方 `index.md` 文档。
3. 确认实际的 CloudBase 环境 ID 和生成的函数名。
4. 仅生成或修改所需的客户端/后端代码；商户凭证保留在集成中心配置中。
5. 当支付状态会影响业务数据时，加入订单状态查询、回调幂等处理以及金额/订单校验。
6. 视情况通过函数日志、回调日志以及端到端支付沙箱或小额生产测试进行验证。

## 最低自查清单

- 我是否避免了猜测未在文档中说明的集成中心管理 API？
- 我是否使用了实际生成的函数名，而不是假设为 `pay-common`？
- 我是否确保所有商户密钥和证书都没有进入源代码和聊天？
- 支付流程是否依赖回调/查询状态，而不是仅依赖前端成功提示？
- 我是否只加载了用户任务所需的场景参考？

## 参考索引

所有随技能打包的参考文件（技能 lint 可达性检查所需）：

- [mini-program-pay.md](references/mini-program-pay.md)
- [native-qr-pay.md](references/native-qr-pay.md)
- [official-account-jsapi-pay.md](references/official-account-jsapi-pay.md)
- [official-account-oauth.md](references/official-account-oauth.md)
- [overview.md](references/overview.md)
- [troubleshooting.md](references/troubleshooting.md)
