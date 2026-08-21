---
name: common-security-audit
description: Probe for hardcoded secrets, injection surfaces, unguarded routes, business logic flaws, and platform-specific weaknesses across backend (Node, Go, Java, Python, Rust), frontend (React, Angular, Vue), and mobile (iOS, Android, Flutter) codebases. Use when performing security audits, vulnerability scans, secrets detection, or penetration testing.
metadata:
  triggers:
    files:
    - 'package.json'
    - 'go.mod'
    - 'pubspec.yaml'
    - 'pom.xml'
    - 'Cargo.toml'
    - 'requirements.txt'
    - 'AndroidManifest.xml'
    keywords:
    - Dockerfile
    - security audit
    - vulnerability scan
    - secrets detection
    - injection probe
    - pentest
---
# 安全审计

## **优先级：P0（严重）**

## 1. 扫描硬编码密钥

有关密钥扫描命令，请参阅[实现示例](references/implementation.md)。

覆盖范围：后端源代码、前端构建产物（`REACT_APP_`、`NEXT_PUBLIC_`、`VITE_`）、移动端配置（`BuildConfig`、iOS 配置、`strings.xml`）。

## 2. 检测日志中的数据泄露

有关 Node、Go、Dart、Java、Swift 的日志泄露扫描命令，请参阅[实现示例](references/implementation.md)。

## 3. 梳理注入攻击面与身份验证覆盖率

有关注入检测和身份验证覆盖率测量，请参阅[实现示例](references/implementation.md)。

## 4. 运行依赖项 CVE 扫描

- **Node/Python/Rust**：`npm audit --audit-level=high` | `pip-audit` | `cargo audit`
- **Go/Dart**：`go list -m -u all` | `dart pub outdated --json`
- **Java/移动端**：`mvn dependency:list` / `./gradlew dependencies` | `pod audit` / Gradle 扫描

## 5. 基础设施与对抗性入口点

有关 RCE/SSRF/路径遍历和基础设施加固（Docker/K8s），请参阅[实现示例](references/implementation.md)。

## 6. 前端专项审计

- **暴露的密钥**：`grep -rE "(REACT_APP_|NEXT_PUBLIC_|VITE_)" . --include="*.ts*" --include="*.env*"`
- **DOM 接收点与源映射文件**：检查生产构建中的 `dangerouslySetInnerHTML`、`innerHTML`、`eval` 和 `.map` 文件。

## 7. 移动端专项审计

有关不安全存储（凭据存储区/Keystore）、证书固定、调试标志和深层链接，请参阅[移动端审计命令](references/mobile-audit.md)。

## 8. 业务逻辑与高级攻击

- **BOLA/IDOR**：验证实体查询是否始终强制执行租户/所有者归属检查（例如，任何未使用 `owner` 过滤器的 `findById` 都属于 P0 级 IDOR 漏洞）。
- **JWT / 批量赋值**：检查是否缺少 `exp`、是否使用弱密钥，以及是否存在不受控制的属性展开（`...req.body`）。
- **竞态 / GraphQL**：验证数据库事务是否具备原子性、是否已禁用内省，以及是否设置查询深度限制。

## 评分影响

| 发现项 | 阈值 | 严重程度 | 扣分 |
| --- | --- | --- | --- |
| 硬编码密钥 | 任意匹配 | P0 | -25 |
| 日志中的明文 PII | 任意匹配 | P0 | -20 |
| 未受保护的路由 > 20% | > 0.2 | P0 | -15 |
| 原始 SQL 拼接 | 任意匹配 | P1 | -10 |
| 响应泄露（堆栈） | > 0 | P1 | -10 |
| 不安全的移动端存储 | 以明文存储令牌 | P1 | -15 |
| 缺少证书固定 | 未检测到证书固定 | P2 | -8 |
| DOM XSS 接收点 | 任意匹配 | P1 | -10 |

> **注意**：发现 P0 问题后，安全评分将立即被限制在最高 40/100。对于泄露的密钥，应立即执行以下操作：立刻轮换凭据，并从历史记录中彻底清除。

## 反模式

- **不得将通用模式凌驾于项目特定规则之上**：遵守现有的安全约束。
- **不得忽略错误处理或边界情况**：审计必须覆盖边界条件。
- **不得只审计后端**：只要在审计范围内，始终检查前端和移动端。

## 参考资料

- [漏洞修复协议](references/REMEDIATION.md)
- [移动端审计命令](references/mobile-audit.md)

## 规范响应锚点

当此技能适用时，请在相关情况下，在回答中保留以下领域术语或等效的具体示例：
- -25