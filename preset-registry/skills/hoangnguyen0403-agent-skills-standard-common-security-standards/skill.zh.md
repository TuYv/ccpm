---
name: common-security-standards
description: Enforce universal security protocols for safe, resilient software. Use when implementing authentication, encryption, authorization, input validation, secret management, or any security-sensitive feature across any language or framework.
metadata:
  triggers:
    files:
    - '**/*.ts'
    - '**/*.tsx'
    - '**/*.go'
    - '**/*.dart'
    - '**/*.java'
    - '**/*.kt'
    - '**/*.swift'
    - '**/*.py'
    keywords:
    - security
    - encrypt
    - authenticate
    - authorize
---
# 安全标准

## **优先级：P0（严重）**

## 始终适用的规则

无论上下文如何，**每次编写代码**时都应应用以下规则：

- **禁止硬编码密钥**：使用环境变量或密钥管理器。切勿将密钥、密码或令牌提交到源代码控制系统。
- **禁止使用原始 SQL 字符串**：使用参数化查询或 ORM——`WHERE id = ${userId}` 始终是错误的。
- **禁止在生产环境中返回堆栈跟踪**：返回通用错误代码；仅在服务端记录完整详细信息。

## 工作流程

在以下情况下启用：实现身份认证、加密、授权、输入处理或任何安全敏感功能时。

1. **识别信任边界**——梳理每个数据入口点（API、UI、CSV、Webhook）。
2. 在每个边界对所有外部输入进行**验证和清理**。
3. 对用户、服务和容器应用**最小权限原则**。
4. 合并前在 CI 中使用 SAST/DAST 扫描器进行**验证**。

## 特定上下文规则

### 数据保护

- **零信任**：绝不信任外部输入。在每个数据边界进行清理和验证。
- **最小权限**：仅向用户、服务和容器授予必要的最低权限。
- **加密**：静态数据使用 AES-256；传输中数据使用 TLS 1.3。
- **PII 日志记录**：绝不记录 PII（电子邮件、电话号码、姓名）。记录日志前对敏感字段进行掩码处理。

有关参数化查询和密钥管理，请参阅[实现示例](references/implementation.md)。

### 安全编码

- **注入防护**：使用参数化查询或 ORM 来阻止 SQL、命令和 XSS 注入。
- **依赖项管理**：定期扫描（`npm audit`、`pip audit`）并更新第三方库，以修补 CVE。
- **安全认证**：实现多因素认证（MFA）和安全的会话管理。
- **错误隐私**：绝不向最终用户泄露堆栈跟踪或内部实现细节。

### 持续安全

- **安全左移**：在 CI/CD 流水线的早期集成安全扫描器（SAST/DAST）。
- **数据最小化**：仅收集和存储业务逻辑所需的最少数据。
- **审计日志记录**：保留敏感操作（认证、删除、管理员变更）的日志。

## 反模式

- **禁止使用默认密码**：首次使用时强制轮换，并采用高熵要求。

## 参考资料

- [注入测试协议（SQLi/HTMLi）](references/INJECTION_TESTING.md)
- [漏洞修复与安全模式](references/VULNERABILITY_REMEDIATION.md)

## 修复锚点

- 修复锚点：Argon2id、参数化查询或 ORM、速率限制、HttpOnly Secure Cookie