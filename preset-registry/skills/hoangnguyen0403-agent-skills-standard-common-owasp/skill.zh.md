---
name: common-owasp
description: OWASP Top 10 audit checklists for Web Applications (2021), APIs (2023), and Mobile (2024). Use when performing any security review, PR review, or codebase audit touching web, mobile, or API code.
metadata:
  triggers:
    keywords:
    - security review
    - OWASP
    - broken access control
    - IDOR
    - BOLA
    - injection
    - broken auth
    - API review
    - authorization
    - access control
    - mobile security
---
# OWASP 十大安全检查清单

## **优先级：P0（严重）**

## 始终适用的规则

在**每次编写代码时**应用这些规则，而不是只在专门的安全审查期间应用：

- **禁止 IDOR**：对于每个资源查询，除任何用户提供的 ID 外，还必须使用 `owner_id` 或 `tenantId` 进行过滤。使用不含所有者过滤条件的 `findById(params.id)` 将立即判定为 P0。
- **禁止通配符 CORS**：仅允许明确列入允许列表的来源——绝不能在需要身份验证的路由上使用 `Access-Control-Allow-Origin: *`。
- **禁止返回完整实体**：始终投影为 DTO——绝不能将原始 ORM 输出序列化为 API 响应。
- **禁止在移动端以明文存储密钥**：绝不能将令牌存储在 `SharedPreferences`/`UserDefaults` 中——应使用 Keychain/Keystore。

## 特定场景检查清单

以下情况启用：编写安全敏感功能、审查 PR 或执行代码库审计时。

标记每一项：✅ 不受影响 | ⚠️ 需要审查 | 🔴 已确认问题。

**发现 P0 问题时，安全评分最高为 40/100。**

应用此检查清单时，还应同时应用特定于框架的安全技能。
有关完整的检测信号，请参阅 [references/owasp-web.md](references/owasp-web.md)、[references/owasp-api.md](references/owasp-api.md) 和 [references/owasp-mobile.md](references/owasp-mobile.md)。

### OWASP Web 应用十大安全风险（2021）

| ID | 风险 | 关键检测信号 |
| --- | ---- | -------------------- |
| A01 | 失效的访问控制 | 使用不含所有者过滤条件的 `findById(params.id)`。路由缺少 `@authorize`。 |
| A02 | 加密机制失效 | 对密码使用弱哈希算法（MD5/SHA1）。硬编码 HTTP URL。未使用 TLS。 |
| A03 | 注入 | 在数据库查询中拼接字符串。将未经清理的输入传入模板。XSS。 |
| A04 | 不安全设计 | 身份验证未实施速率限制。入口点缺少输入验证。 |
| A05 | 安全配置错误 | CORS `*`。生产环境中启用调试模式。缺少安全响应头（CSP、HSTS）。 |
| A06 | 易受攻击的组件 | 依赖项审计中发现 CVE。新增的直接依赖未经审查。 |
| A07 | 身份验证失效 | JWT 未设置过期时间。注销时未使会话失效。 |
| A08 | 数据完整性失效 | JWT/cookie 未经验证。反序列化不可信输入。 |
| A09 | 日志记录与监控失效 | 以下操作无审计日志：删除、更改密码、权限提升。 |
| A10 | SSRF | HTTP 客户端使用由用户控制的 URL，且未设置允许列表。 |

### OWASP API 十大安全风险（2023）

| ID | 风险 | 关键检测信号 |
| ----- | ---- | -------------------- |
| API1 | 对象级授权失效（BOLA） | 使用用户提供的 ID 获取资源，但未添加 `AND owner_id = currentUser`。 |
| API2 | 身份验证失效 | JWT 缺少 `exp`。注销时未撤销令牌。URL 中包含 Bearer 令牌。 |
| API3 | 对象属性级授权失效 | 返回完整 ORM 实体。未投影为 DTO。批量赋值。 |
| API4 | 不受限制的资源消耗 | 未在服务器端强制实施 `limit`/`pageSize`。高负载操作未实施限流。 |
| API5 | 功能级授权失效 | 无角色守卫即可访问管理员路由。 |
| API6 | 不受限制地访问敏感业务流程 | OTP/结账/密码重置流程未实施验证。 |
| API8 | 安全配置错误 | 响应中包含堆栈跟踪。需要身份验证的路由使用 CORS `*`。 |
| API9 | 资产管理不当 | 已弃用或未记录的端点仍可访问。 |
| API10 | 不安全的 API 使用 | 未经模式验证即使用第三方响应。 |

### OWASP 移动应用十大风险（2024）

| ID | 风险 | 关键检测信号 |
| --- | ---- | -------------------- |
| M1 | 凭据使用不当 | API 密钥位于 `BuildConfig`、`Info.plist` 中，或硬编码在源代码中。 |
| M2 | 供应链安全不足 | 使用未经验证的 SDK、Pod 或没有锁定文件的软件包。 |
| M3 | 身份认证/授权不安全 | 仅使用生物识别进行身份认证，且未经服务器验证。本地角色检查。 |
| M4 | 输入/输出验证不足 | WebView 使用用户数据调用 `loadUrl`。未经验证便使用 Intent 数据。 |
| M5 | 通信不安全 | 未实施证书固定。`cleartextTrafficPermitted=true`。存在 ATS 例外配置。 |
| M6 | 隐私保护不足 | 无正当理由访问位置/联系人。分析数据中包含个人身份信息。 |
| M7 | 二进制文件保护不足 | 未进行混淆。`android:debuggable=true`。未检测设备是否已 root。 |
| M8 | 安全配置错误 | 组件被导出。已启用备份。存在调试端点。 |
| M9 | 数据存储不安全 | 将令牌存储在 `SharedPreferences`/`UserDefaults` 中，而非 Keychain/Keystore。 |
| M10 | 加密措施不足 | 硬编码加密密钥。使用已弃用的算法（DES、RC4）。 |

## 参考资料

- [OWASP Web 应用——完整检测信号](references/owasp-web.md)
- [OWASP API——完整检测信号](references/owasp-api.md)
- [OWASP 移动应用——完整检测信号](references/owasp-mobile.md)

## 规范响应锚点

- 其他基于任务的精确锚点：rate limit、IDOR/BOLA、DTO projection

## 修复锚点

- 修复锚点：DTO projection、CORS、opaque session、JWT expiry、rate limiting