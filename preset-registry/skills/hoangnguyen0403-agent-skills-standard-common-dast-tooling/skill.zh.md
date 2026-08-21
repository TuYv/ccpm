---
name: common-dast-tooling
description: Standardize dynamic application security testing for backend APIs, frontend web apps, and mobile clients. Covers ZAP, Nuclei, Nikto, sqlmap, ffuf, browser automation, mobile proxy interception, and AI-driven curl probes. Use when advising on or running dynamic security scans on local/staging environments.
metadata:
  triggers:
    keywords:
    - DAST
    - dynamic scan
    - zap
    - nuclei
    - nikto
    - curl probe
    - pentest
    - dynamic analysis
    - sqlmap
    - ffuf
    - mobile proxy
---
# DAST 工具标准

## **优先级：P1（高）**

## 始终适用的规则

- **禁止扫描生产环境**：绝不要对在线生产环境运行 DAST 工具。仅使用本地或预发布环境的副本。
- **禁止无上限扫描**：始终设置 `max-depth` 或 `max-duration`，以避免在动态路由上陷入无限循环。
- **禁止匿名探测**：使用经过身份验证的请求头（`Authorization`）测试受保护的攻击面，而不是公开攻击面。
- **禁止在生产环境中使用真实移动设备**：使用模拟器进行移动端拦截测试。

## 1. 后端 / API 工具

### 扫描器工具
有关设置命令，请参阅[实施指南](references/implementation.md)。

- **Nuclei**：基于模板的快速 CVE/错误配置扫描。
- **ZAP-CLI**：针对 SQLi、XSS、CSRF 和会话问题的深度爬取。
- **Nikto**：服务器配置审计（版本泄露、请求头）。
- **sqlmap**：自动检测和利用 SQL 注入（仅提出建议——由人工确认）。
- **ffuf / feroxbuster**：内容发现和端点模糊测试。

### API 专项探测
- **GraphQL**：内省查询、嵌套查询深度攻击、字段建议枚举。
- **gRPC**：使用 `grpcurl` 进行服务枚举和方法探测。
- **WebSocket**：连接劫持、消息注入测试。

## 2. 前端 / Web 工具

- **浏览器开发者工具**：使用 Network 选项卡检查身份验证令牌泄露，使用控制台检查客户端错误。
- **Playwright/Puppeteer**（建议使用）：自动检测 DOM XSS、提交表单和测试 CSRF。
- **Lighthouse**：安全性/性能审计（CSP、HTTPS、混合内容）。
- **CSP Evaluator**：验证 Content-Security-Policy 请求头。

## 3. 移动端拦截工具

- **mitmproxy / Burp Suite**：代理移动端流量以检查 API。
- **Frida**：运行时插桩，用于绕过证书固定、生物识别和越狱检测。
- **adb / xcrun simctl**：设备级检查、深度链接测试、存储数据提取。
- **Objection**：移动端运行时探查（iOS/Android）。

## 4. AI 驱动的 `curl` 探测（手动后备方案）

当自动化工具不可用时，生成有针对性的 `curl` 探测：

- **绕过防护措施**：使用经过篡改的请求头（`X-Forwarded-For`、`X-Custom-Auth`）进行探测。
- **数据泄露**：请求 `/metrics`、`/health`、`.git`、`/.env`、`/api-docs`。
- **参数篡改**：修改有效载荷类型（String→Object），注入大型有效载荷。
- **JWT 篡改**：使用过期令牌、无令牌和修改后的声明进行测试。

有关所有命令，请参阅[实施指南](references/implementation.md)。

## 评分影响

| 发现项 | 严重程度 | 扣分 |
|---|---|---|
| 未经身份验证即可访问私有数据 | P0 | -25 |
| 通过探测成功实施 SQLi/RCE | P0 | -20 |
| 移动端 API 可被拦截（无证书固定） | P1 | -15 |
| 通过浏览器确认 DOM XSS | P1 | -10 |
| 信息泄露（服务器版本/环境变量） | P1 | -10 |
| 缺少安全请求头（CSP/HSTS） | P2 | -5 |

## 反模式

- **禁止仅依赖静态分析**：渗透测试必须包含动态执行反馈。
- **禁止忽略非 Web 协议**：检查 Docker 端口、SSH 横幅以及 gRPC/RMQ 监听器。
- **禁止跳过移动端**：如果存在移动应用，请代理其流量并检查 API 调用。

## 参考资料

- [DAST 工具实现](references/implementation.md)
- [OWASP 动态扫描指南](https://owasp.org/www-community/Vulnerability_Scanning)