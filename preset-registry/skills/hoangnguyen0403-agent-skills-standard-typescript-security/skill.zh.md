---
name: typescript-security
description: Secure server-side TypeScript input, auth tokens, and injection boundaries. Use for API/request validation, sanitization, secrets, and sensitive configuration; defer client-only React form validation and generic linting.
metadata:
  triggers:
    files:
    - '**/*.ts'
    - '**/*.tsx'
    keywords:
    - validate
    - sanitize
    - xss
    - injection
    - auth
    - password
    - secret
    - token
---
# TypeScript 安全

## **优先级：P0（严重）**

## 在边界处验证输入

- 在 **API 边界**使用 **`Zod`**、**`Joi`** 或 **`class-validator`**。在使用之前，始终对 **`user-controlled input`** 进行 **`parse`** 和验证。使用 **`safeParse`** 进行不会抛出异常的错误处理。验证失败时返回 **`400 with structured errors`**。

有关 Zod 验证模式、安全 Cookie 设置和 JWT 身份验证模式，请参阅 [references/REFERENCE.md](references/REFERENCE.md)。

## 防止注入和 XSS

- **净化**：使用 **`DOMPurify`** 进行 HTML 净化，以防止**跨站脚本攻击（XSS）**。
- **SQL 注入**：使用**参数化查询**（例如 **`pool.query('... WHERE id = $1', [id])`**）或**类型安全的 ORM**（**`Prisma`**/**`TypeORM`**）。对原始查询使用 **`Prisma.sql`**。
- **输入过滤**：在文件路径或操作系统命令中使用 **`user-controlled input`** 之前，先对其进行净化（命令注入）。

## 安全身份验证

- 使用 **`Argon2id`** 进行密码哈希。通过 **`jsonwebtoken`** 或 **`jose`** 实现 **`JWT`**，并使用 **`HttpOnly`** 和 **`Secure`** Cookie。对公钥/私钥对使用 **`RS256`**，并实现**刷新令牌轮换**。
- **密钥**：将密钥存储在 **`.env`**（例如 **`JWT_SECRET`**）或**密钥管理器**中。绝不要将其提交到 Git。
- **CORS**：使用**严格的来源白名单**配置 **`CORS`**。避免使用 `origin: '*'`。
- **加密**：对敏感数据使用 **`crypto`**（Node.js）或 **`Web Crypto API`**。避免使用 MD5/SHA1 等旧式算法。

## 验证

编写验证模式（Zod/joi）或身份验证守卫后，调用 `getDiagnostics`（typescript-lsp），在最终完成前确认类型收窄正确。

## 反模式

- **禁止动态执行**：避免使用 `eval`、`Function` 构造函数或将字符串字面量用作计时器回调——这些方式都会执行运行时代码并绕过 TypeScript 的类型系统。
- **禁止 Shell 字符串插值**：绝不要使用 `execSync(\`cmd ${userInput}\`)`，也不要将环境变量/配置值插入`execSync`/`spawnSync`字符串中。Shell 元字符会导致**命令注入（OWASP A03）**。应改用`execFileSync('git', ['arg1', arg2])`，即静态命令加独立的参数数组。
- **禁止未经验证的 SSRF 来源**：当 URL 来自环境变量或配置（例如 `FEEDBACK_API_URL`）时，在调用 `fetch()` / `axios` 之前，根据允许来源白名单对其进行验证。
- **禁止明文**：绝不要提交密钥。
- **禁止信任**：在服务器端验证所有内容。

## 参考资料

有关 Zod 验证、安全 Cookie 设置、JWT 身份验证、安全标头和 RBAC 模式，请参阅 [references/REFERENCE.md](references/REFERENCE.md)。

## 规范响应锚点

当此技能适用时，请在相关情况下保留下列领域术语或等效的具体示例：
- HttpOnly