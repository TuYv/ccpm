---
name: secure-code-guardian
description: Use when implementing authentication/authorization, securing user input, or preventing OWASP Top 10 vulnerabilities — including custom security implementations such as hashing passwords with bcrypt/argon2, sanitizing SQL queries with parameterized statements, configuring CORS/CSP headers, validating input with Zod, and setting up JWT tokens. Invoke for authentication, authorization, input validation, encryption, OWASP Top 10 prevention, secure session management, and security hardening. For pre-built OAuth/SSO integrations or standalone security audits, consider a more specialized skill.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: security
  triggers: security, authentication, authorization, encryption, OWASP, vulnerability, secure coding, password, JWT, OAuth
  role: specialist
  scope: implementation
  output-format: code
  related-skills: fullstack-guardian, security-reviewer, architecture-designer
---
# 安全代码守护者

## 核心工作流

1. **威胁建模** — 识别攻击面与威胁
2. **设计** — 规划安全控制措施
3. **实现** — 编写具备纵深防御的安全代码；请参阅下方代码示例
4. **验证** — 通过明确的检查点测试安全控制措施（见下文）
5. **文档化** — 记录安全决策

### 验证检查点

在每个实现步骤后，验证：

- **身份验证**：测试暴力破解防护（触发锁定/速率限制）、会话固定攻击抵抗能力、令牌过期，以及无效凭证的错误消息（不得泄露用户是否存在）。
- **授权**：验证已阻止水平和垂直权限提升路径；使用属于不同角色/用户的令牌进行测试。
- **输入处理**：确认 SQL 注入载荷（`' OR 1=1--`）会被拒绝；确认 XSS 载荷（`<script>alert(1)</script>`）会被转义或拒绝。
- **响应头/CORS**：使用安全扫描器（例如 `curl -I`、Mozilla Observatory）验证安全响应头已存在，且 CORS 来源允许列表正确。

## 参考指南

根据上下文加载详细指南：

| 主题 | 参考文件 | 加载时机 |
|-------|-----------|-----------|
| OWASP | `references/owasp-prevention.md` | OWASP Top 10 模式 |
| 身份验证 | `references/authentication.md` | 密码哈希、JWT |
| 输入验证 | `references/input-validation.md` | Zod、SQL 注入 |
| XSS/CSRF | `references/xss-csrf.md` | XSS 防护、CSRF |
| 响应头 | `references/security-headers.md` | Helmet、速率限制 |

## 约束

### 必须执行
- 使用 bcrypt/argon2 对密码进行哈希处理（绝不使用 MD5/SHA-1/无盐哈希）
- 使用参数化查询（绝不使用字符串插值 SQL）
- 在使用前验证并清理所有用户输入
- 在身份验证端点实施速率限制
- 设置安全响应头（CSP、HSTS、X-Frame-Options）
- 记录安全事件（身份验证失败、权限提升尝试）
- 将密钥存储在环境变量或密钥管理器中（绝不存储在源代码中）

### 严禁执行
- 以明文或可逆加密形式存储密码
- 未经验证即信任用户输入
- 在日志或错误响应中暴露敏感数据
- 使用弱或已弃用的算法（MD5、SHA-1、DES、ECB 模式）
- 在代码中硬编码密钥或凭证

## 代码示例

### 密码哈希（bcrypt）

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // minimum 10; 12 balances security and performance

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}
```

### 参数化 SQL 查询（Node.js / pg）

```typescript
// NEVER: `SELECT * FROM users WHERE email = '${email}'`
// ALWAYS: use positional parameters
import { Pool } from 'pg';
const pool = new Pool();

export async function getUserByEmail(email: string) {
  const { rows } = await pool.query(
    'SELECT id, email, role FROM users WHERE email = $1',
    [email]  // value passed separately — never interpolated
  );
  return rows[0] ?? null;
}
```

### 使用 Zod 进行输入验证

```typescript
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
});

export function validateLoginInput(raw: unknown) {
  const result = LoginSchema.safeParse(raw);
  if (!result.success) {
    // Return generic error — never echo raw input back
    throw new Error('Invalid credentials format');
  }
  return result.data;
}
```

### JWT 验证

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!; // never hardcode

export function verifyToken(token: string): jwt.JwtPayload {
  // Throws if expired, tampered, or wrong algorithm
  const payload = jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS256'],   // explicitly allowlist algorithm
    issuer: 'your-app',
    audience: 'your-app',
  });
  if (typeof payload === 'string') throw new Error('Invalid token payload');
  return payload;
}
```

### 保护端点：完整流程

```typescript
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();
app.use(helmet()); // sets CSP, HSTS, X-Frame-Options, etc.
app.use(express.json({ limit: '10kb' })); // limit payload size

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/login', authLimiter, async (req, res) => {
  // 1. Validate input
  const { email, password } = validateLoginInput(req.body);

  // 2. Authenticate — parameterized query, constant-time compare
  const user = await getUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    // Generic message — do not reveal whether email exists
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // 3. Authorize — issue scoped, short-lived token
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '15m', issuer: 'your-app', audience: 'your-app' }
  );

  // 4. Secure response — token in httpOnly cookie, not body
  res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
  return res.json({ message: 'Authenticated' });
});
```

## 输出模板

实现安全功能时，请提供：
1. 安全的实现代码
2. 已说明的安全注意事项
3. 配置要求（环境变量、请求头）
4. 测试建议

## 知识参考

OWASP Top 10、bcrypt/argon2、JWT、OAuth 2.0、OIDC、CSP、CORS、速率限制、输入验证、输出编码、加密（AES、RSA）、TLS、安全响应头

[文档](https://jeffallan.github.io/claude-skills/skills/security/secure-code-guardian/)