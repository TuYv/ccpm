---
name: security
description: OWASP security patterns, secrets management, security testing
when-to-use: When writing code that handles auth, user input, API keys, or when security review is requested
user-invocable: true
allowed-tools: [Read, Glob, Grep, Bash]
effort: high
---
# 安全技能


适用于所有项目的安全最佳实践和自动化安全测试。

---

## 核心原则

**安全不是可选项。** 每个项目在合并前都必须通过安全检查。假设所有输入都是恶意的，所有提交的密钥都会泄露，并且所有依赖项都存在漏洞。

---

## 必需的安全配置

### 1. Gitignore（不可妥协）

每个项目的 `.gitignore` 中都必须包含以下内容：

```gitignore
# Environment files - NEVER commit
.env
.env.*
!.env.example

# Secrets
*.pem
*.key
*.p12
*.pfx
credentials.json
secrets.json
*-credentials.json
service-account*.json

# IDE and OS
.idea/
.vscode/settings.json
.DS_Store
Thumbs.db

# Dependencies
node_modules/
__pycache__/
*.pyc
.venv/
venv/

# Build outputs
dist/
build/
*.egg-info/

# Logs that might contain sensitive data
*.log
logs/
```

### 2. 环境变量

**创建 `.env.example`**，其中包含所有必需的变量（不填写值）：
```bash
# .env.example - Copy to .env and fill in values

# Server-side only (NEVER prefix with VITE_ or NEXT_PUBLIC_)
DATABASE_URL=
ANTHROPIC_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Client-side safe (public, non-sensitive)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 前端环境变量（重要！）

**绝不要将密钥放入客户端可暴露的环境变量中：**

| 框架 | 客户端暴露前缀 | 仅限服务器端 |
|-----------|----------------------|-------------|
| Vite | `VITE_*` | 无前缀 |
| Next.js | `NEXT_PUBLIC_*` | 无前缀 |
| Create React App | `REACT_APP_*` | N/A（无服务器端） |

```typescript
// WRONG - Secret exposed to browser bundle!
const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

// CORRECT - Only public values client-side
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// CORRECT - Secrets stay server-side only
// In API route or server function:
const apiKey = process.env.ANTHROPIC_API_KEY;
```

**Vercel 环境变量：**
- 在 Vercel 控制面板中，不带 `VITE_` 前缀的密钥仅限服务器端使用
- 只有 `VITE_*` 变量会被打包到客户端代码中
- 始终在浏览器开发者工具 → Sources → 你的 bundle 中进行验证，确保密钥没有暴露

**在启动时验证环境：**
```typescript
// config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  ANTHROPIC_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);
```

```python
# config/env.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    anthropic_api_key: str
    environment: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 安全测试

### 提交前安全检查

添加到提交前钩子中：

**适用于所有项目：**
```yaml
# .pre-commit-config.yaml (add to existing)
repos:
  # Detect secrets
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']

  # Check for security issues in dependencies
  - repo: local
    hooks:
      - id: security-check
        name: security-check
        entry: ./scripts/security-check.sh
        language: script
        pass_filenames: false
```

**TypeScript/JavaScript:**
```json
// package.json scripts
{
  "scripts": {
    "security:audit": "npm audit --audit-level=high",
    "security:secrets": "npx secretlint '**/*'",
    "security:deps": "npx better-npm-audit audit"
  }
}
```

**Python:**
```bash
# Add to dev dependencies
pip install safety bandit

# Commands
safety check           # Check dependencies for vulnerabilities
bandit -r src/        # Static security analysis
```

### 安全检查脚本

创建 `scripts/security-check.sh`：

```bash
#!/bin/bash
set -e

echo "Running security checks..."

# Check for secrets in staged files
echo "Checking for secrets..."
if command -v detect-secrets &> /dev/null; then
  detect-secrets scan --baseline .secrets.baseline
fi

# Check .env is not staged
if git diff --cached --name-only | grep -E '^\.env$|^\.env\.' | grep -v '\.example$'; then
  echo "ERROR: .env file is staged for commit!"
  exit 1
fi

# Check for common secret patterns in staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)
if echo "$STAGED_FILES" | xargs grep -l -E '(password|secret|api_key|apikey|token|private_key)\s*[:=]\s*["\047][^"\047]+["\047]' 2>/dev/null; then
  echo "ERROR: Possible secrets found in staged files!"
  exit 1
fi

# Language-specific checks
if [ -f "package.json" ]; then
  echo "Checking npm dependencies..."
  npm audit --audit-level=high || echo "Warning: npm audit found issues"
fi

if [ -f "pyproject.toml" ] || [ -f "requirements.txt" ]; then
  echo "Checking Python dependencies..."
  if command -v safety &> /dev/null; then
    safety check || echo "Warning: safety found issues"
  fi
fi

echo "Security checks passed!"
```

```bash
chmod +x scripts/security-check.sh
```

---

## GitHub Actions 安全工作流

创建 `.github/workflows/security.yml`：

```yaml
name: Security

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    # Run weekly on Monday at 9am UTC
    - cron: '0 9 * * 1'

jobs:
  secrets-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Detect secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.pull_request.base.sha }}
          head: ${{ github.event.pull_request.head.sha }}

  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Node.js projects
      - name: Setup Node
        if: hashFiles('package.json') != ''
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        if: hashFiles('package.json') != ''
        run: npm ci

      - name: NPM Audit
        if: hashFiles('package.json') != ''
        run: npm audit --audit-level=high

      # Python projects
      - name: Setup Python
        if: hashFiles('pyproject.toml') != '' || hashFiles('requirements.txt') != ''
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install safety
        if: hashFiles('pyproject.toml') != '' || hashFiles('requirements.txt') != ''
        run: pip install safety

      - name: Safety check
        if: hashFiles('pyproject.toml') != '' || hashFiles('requirements.txt') != ''
        run: safety check

  codeql:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ hashFiles('package.json') != '' && 'javascript-typescript' || 'python' }}

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

---

## 输入验证（OWASP Top 10）

### 1. SQL 注入防护

**绝不要使用字符串拼接：**
```typescript
// BAD - SQL injection vulnerable
const user = await db.query(`SELECT * FROM users WHERE id = ${userId}`);

// GOOD - Parameterized query
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// GOOD - Using ORM (Kysely, Prisma, Drizzle)
const user = await db.selectFrom('users').where('id', '=', userId).execute();
```

```python
# BAD - SQL injection vulnerable
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")

# GOOD - Parameterized query
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))

# GOOD - Using ORM (SQLAlchemy)
user = session.query(User).filter(User.id == user_id).first()
```

### 2. XSS 防护

```typescript
// Always sanitize user input before rendering
import DOMPurify from 'dompurify';

// BAD - XSS vulnerable
element.innerHTML = userInput;

// GOOD - Sanitized
element.innerHTML = DOMPurify.sanitize(userInput);

// BEST - Use framework's built-in escaping (React does this by default)
return <div>{userInput}</div>;  // Safe in React

// DANGER - Bypasses React's protection
return <div dangerouslySetInnerHTML={{ __html: userInput }} />;  // Avoid!
```

### 3. 在边界处进行输入验证

```typescript
// Validate ALL external input with Zod
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s]+$/),
  age: z.number().int().min(0).max(150),
});

// In route handler
app.post('/users', async (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  // result.data is now typed and validated
});
```

### 4. 路径遍历防护

```typescript
import path from 'path';

// BAD - Path traversal vulnerable
const filePath = `./uploads/${req.params.filename}`;

// GOOD - Validate and sanitize path
const filename = path.basename(req.params.filename);  // Strips ../
const filePath = path.join('./uploads', filename);

// Verify it's still within allowed directory
if (!filePath.startsWith(path.resolve('./uploads'))) {
  throw new Error('Invalid path');
}
```

---

## 身份验证与授权

### JWT 最佳实践

```typescript
import jwt from 'jsonwebtoken';

// Token generation
function generateToken(userId: string): string {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET!,
    {
      expiresIn: '15m',      // Short-lived access tokens
      algorithm: 'HS256',
    }
  );
}

// Token verification
function verifyToken(token: string): { sub: string } {
  return jwt.verify(token, process.env.JWT_SECRET!, {
    algorithms: ['HS256'],   // Explicitly specify allowed algorithms
  }) as { sub: string };
}
```

### 密码哈希

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;  // Minimum 10, recommended 12+

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)
```

### 速率限制

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to auth routes
app.use('/api/auth', rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,                // 5 attempts per minute
  message: 'Too many login attempts, please try again later',
}));
```

---

## 安全标头

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

---

## 安全测试清单

在每次发布前运行：

```markdown
## Security Checklist

### Secrets & Environment
- [ ] No secrets in code (run detect-secrets)
- [ ] .env files in .gitignore
- [ ] .env.example exists with all required vars
- [ ] Environment validated at startup

### Dependencies
- [ ] npm audit / safety check passes
- [ ] No known vulnerabilities in dependencies
- [ ] Dependencies up to date (Dependabot enabled)

### Input Validation
- [ ] All API inputs validated with schema (Zod/Pydantic)
- [ ] File uploads restricted by type and size
- [ ] Path traversal prevented

### Authentication
- [ ] Passwords hashed with bcrypt (12+ rounds)
- [ ] JWTs use short expiration
- [ ] Rate limiting on auth endpoints
- [ ] Session tokens rotated on login

### Database
- [ ] Parameterized queries only
- [ ] Least privilege database user
- [ ] Connection strings not logged

### Headers & CORS
- [ ] Security headers enabled (helmet)
- [ ] CORS restricted to known origins
- [ ] HTTPS only in production

### Logging
- [ ] No secrets in logs
- [ ] No PII in logs (or properly masked)
- [ ] Failed auth attempts logged
```

---

## 安全反模式

- ❌ 将机密信息放入 `VITE_*`、`NEXT_PUBLIC_*` 或 `REACT_APP_*` 环境变量（会暴露给客户端！）
- ❌ 将机密信息放入已提交到 git 的代码或配置文件中
- ❌ `.env` 文件未在 `.gitignore` 中添加条目
- ❌ 使用字符串拼接构造 SQL 查询
- ❌ 未进行清理就使用 `dangerouslySetInnerHTML`
- ❌ 对用户输入使用 `eval()` 或 `new Function()`
- ❌ 以明文或弱哈希（MD5、SHA1）存储密码
- ❌ JWT 没有过期时间或过期时间过长
- ❌ 未对身份验证端点进行速率限制
- ❌ 记录敏感数据（密码、令牌、PII）
- ❌ 在生产环境中使用 `*` 作为 CORS 来源
- ❌ 忽略 npm audit / safety check 警告
- ❌ 在生产环境中以 root / admin 身份运行
- ❌ 为任何环境硬编码凭据
- ❌ 禁用 SSL/TLS 验证