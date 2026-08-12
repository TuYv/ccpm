---
name: security-and-hardening
description: Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services.
---
# 安全与加固

## 概述

面向 Web 应用的安全优先开发实践。将每一项外部输入都视为恶意输入，将每一个密钥都视为至关重要，并将每一次授权检查都视为强制要求。安全不是一个阶段——它是对每一行涉及用户数据、身份验证或外部系统的代码施加的约束。

## 何时使用

- 构建任何接受用户输入的功能
- 实现身份验证或授权
- 存储或传输敏感数据
- 与外部 API 或服务集成
- 添加文件上传、Webhook 或回调
- 处理支付或 PII 数据

## 流程：威胁建模优先

没有威胁模型却强行附加的控制措施只能算是猜测。在进行加固之前，花五分钟像攻击者一样思考：

1. **绘制信任边界。** 不可信数据会从哪里进入你的系统？HTTP 请求、表单字段、文件上传、Webhook、第三方 API、消息队列，以及 **LLM 输出**。每一个边界都是攻击面。
2. **明确资产。** 哪些内容值得窃取或破坏？凭据、PII、支付数据、管理员操作、资金流转。
3. **针对每个边界进行 STRIDE 分析**——这是一种快速审视方法，而不是一套繁琐仪式：

| 威胁 | 要问的问题 | 典型缓解措施 |
|---|---|---|
| **S**poofing（身份伪造） | 是否有人能够冒充用户/服务？ | 身份验证、签名验证 |
| **T**ampering（篡改） | 数据在传输中或静态存储时是否可能被修改？ | 完整性检查、参数化查询、HTTPS |
| **R**epudiation（抵赖） | 某项操作是否可能在事后被否认？ | 对安全事件进行审计日志记录 |
| **I**nformation disclosure（信息泄露） | 数据是否可能泄露？ | 加密、字段允许列表、通用错误消息 |
| **D**enial of service（拒绝服务） | 系统是否可能不堪重负？ | 速率限制、输入大小上限、超时 |
| **E**levation of privilege（权限提升） | 用户是否可能获得其本不应拥有的权限？ | 授权检查、最小权限原则 |

4. **在用例旁边编写滥用案例。** 对于每项功能，都要问“我会如何滥用它？”——然后将其作为你的第一个测试。

如果你无法明确某项功能的信任边界，就还没有准备好保护它。这属于 OWASP **A04：不安全设计**——大多数安全漏洞始于设计，而不是代码。

## 三级边界体系

### 始终执行（无例外）

- 在系统边界（API 路由、表单处理程序）**验证所有外部输入**
- **对所有数据库查询进行参数化**——绝不要将用户输入拼接到 SQL 中
- **对输出进行编码**以防止 XSS（使用框架的自动转义功能，不要绕过它）
- 对所有外部通信**使用 HTTPS**
- 使用 bcrypt/scrypt/argon2 **对密码进行哈希处理**（绝不存储明文）
- **设置安全响应头**（CSP、HSTS、X-Frame-Options、X-Content-Type-Options）
- 为会话**使用 httpOnly、secure、sameSite cookie**
- 在每次发布前，针对已提交的锁文件**运行检测到的包管理器的原生审计**

### 先询问（需要人工批准）

- 添加新的身份验证流程或更改身份验证逻辑
- 存储新的敏感数据类别（PII、支付信息）
- 添加新的外部服务集成
- 更改 CORS 配置
- 添加文件上传处理程序
- 修改速率限制或节流机制
- 授予提升后的权限或角色

### 绝对不要做

- **绝不要将密钥提交**到版本控制系统（API 密钥、密码、令牌）
- **绝不要记录敏感数据**（密码、令牌、完整的信用卡号）
- **绝不要将客户端验证视为**安全边界
- **绝不要为了方便而禁用安全标头**
- **绝不要对用户提供的数据使用 `eval()` 或 `innerHTML`**
- **绝不要将会话存储在客户端可访问的存储中**（例如使用 localStorage 存储身份验证令牌）
- **绝不要向用户暴露堆栈跟踪信息**或内部错误详情

## OWASP 十大风险防范模式

以下是防范模式，并非排名。有关 2021 年的排序，请参阅 `../../references/security-checklist.md` 中的快速参考表。

### 注入（SQL、NoSQL、操作系统命令）

```typescript
// BAD: SQL injection via string concatenation
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// GOOD: Parameterized query
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// GOOD: ORM with parameterized input
const user = await prisma.user.findUnique({ where: { id: userId } });
```

### 身份验证失效

```typescript
// Password hashing
import { hash, compare } from 'bcrypt';

const SALT_ROUNDS = 12;
const hashedPassword = await hash(plaintext, SALT_ROUNDS);
const isValid = await compare(plaintext, hashedPassword);

// Session management
app.use(session({
  secret: process.env.SESSION_SECRET,  // From environment, not code
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,     // Not accessible via JavaScript
    secure: true,       // HTTPS only
    sameSite: 'lax',    // CSRF protection
    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
  },
}));
```

### 跨站脚本攻击（XSS）

```typescript
// BAD: Rendering user input as HTML
element.innerHTML = userInput;

// GOOD: Use framework auto-escaping (React does this by default)
return <div>{userInput}</div>;

// If you MUST render HTML, sanitize first
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);
```

### 访问控制失效

```typescript
// Always check authorization, not just authentication
app.patch('/api/tasks/:id', authenticate, async (req, res) => {
  const task = await taskService.findById(req.params.id);

  // Check that the authenticated user owns this resource
  if (task.ownerId !== req.user.id) {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Not authorized to modify this task' }
    });
  }

  // Proceed with update
  const updated = await taskService.update(req.params.id, req.body);
  return res.json(updated);
});
```

### 安全配置错误

```typescript
// Security headers (use helmet for Express)
import helmet from 'helmet';
app.use(helmet());

// Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],  // Tighten if possible
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
  },
}));

// CORS — restrict to known origins
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
}));
```

### 敏感数据泄露

```typescript
// Never return sensitive fields in API responses
function sanitizeUser(user: UserRecord): PublicUser {
  const { passwordHash, resetToken, ...publicFields } = user;
  return publicFields;
}

// Use environment variables for secrets
const API_KEY = process.env.STRIPE_API_KEY;
if (!API_KEY) throw new Error('STRIPE_API_KEY not configured');
```

### 服务端请求伪造（SSRF）

只要服务器获取的 URL 受到用户影响——例如 Webhook、“从 URL 导入”、图片代理、链接预览——攻击者就可能将其指向内部服务（云元数据、`localhost`、私有 IP）。

```typescript
// BAD: fetch whatever the user gives you
await fetch(req.body.webhookUrl);

// GOOD: allowlist scheme + host, reject if ANY resolved IP is private, forbid redirects
import { lookup } from 'node:dns/promises';
import ipaddr from 'ipaddr.js';

const ALLOWED_HOSTS = new Set(['hooks.example.com']);

async function assertSafeUrl(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (url.protocol !== 'https:') throw new Error('https only');
  if (!ALLOWED_HOSTS.has(url.hostname)) throw new Error('host not allowed');
  // Resolve ALL records; a single private/reserved address fails the check.
  const addrs = await lookup(url.hostname, { all: true });
  if (addrs.some((a) => ipaddr.parse(a.address).range() !== 'unicast')) {
    throw new Error('private/reserved IP');
  }
  return url;
}

await fetch(await assertSafeUrl(req.body.webhookUrl), { redirect: 'error' });
```

`range() !== 'unicast'` 检查涵盖 IPv4 和 IPv6 中的环回地址、链路本地地址 `169.254.169.254`（云元数据，也是最常见的 SSRF 目标）、私有地址以及唯一本地地址范围。

**注意——这仍然存在 TOCTOU 缺口。** `fetch` 会在检查后再次解析 DNS，因此，使用短 TTL 记录的攻击者可以在验证与连接之间将其重新绑定到内部 IP。对于高风险入口，应仅解析一次并连接到固定的 IP，或在前面部署过滤代理（`request-filtering-agent` / `ssrf-req-filter`）。

## 输入验证模式

### 在边界处进行模式验证

```typescript
import { z } from 'zod';

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().datetime().optional(),
});

// Validate at the route handler
app.post('/api/tasks', async (req, res) => {
  const result = CreateTaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: result.error.flatten(),
      },
    });
  }
  // result.data is now typed and validated
  const task = await taskService.create(result.data);
  return res.status(201).json(task);
});
```

### 文件上传安全

```typescript
// Restrict file types and sizes
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function validateUpload(file: UploadedFile) {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new ValidationError('File type not allowed');
  }
  if (file.size > MAX_SIZE) {
    throw new ValidationError('File too large (max 5MB)');
  }
  // Don't trust the file extension — check magic bytes if critical
}
```

## 对依赖项审计结果进行分类处置

包管理器审计报告的是已知安全公告；它们既不能证明某个包值得信任，也不能证明易受攻击的代码实际可达。请使用以下决策树：

```
The native package-manager audit reports a vulnerability
├── Severity: critical or high
│   ├── Is the vulnerable code reachable in runtime, build, test, or deployment paths?
│   │   ├── YES --> Fix immediately (update, patch, or replace the dependency)
│   │   └── NO (confirmed unused across those paths) --> Fix soon, but not a blocker
│   └── Is a fix available?
│       ├── YES --> Update to the patched version
│       └── NO --> Check for workarounds, consider replacing the dependency, or add to allowlist with a review date
├── Severity: moderate
│   ├── Reachable in production? --> Fix in the next release cycle
│   └── Dev-only? --> Fix when convenient, track in backlog
└── Severity: low
    └── Track and fix during regular dependency updates
```

**关键问题：**
- 易受攻击的函数是否确实会在你的代码路径中被调用？
- 该依赖项是运行时依赖项，还是仅用于开发？
- 结合你的部署环境，该漏洞是否可被利用（例如，仅客户端应用中的服务端漏洞）？

如果你推迟修复，请记录原因并设置复查日期。

### 供应链卫生

不要假定使用 npm，也不要将最近的清单文件所在位置视为安装根目录。请按以下顺序操作：

1. **确定安装边界和包管理器。** 使用拥有锁文件的工作区根目录；只有当某个独立的嵌套项目位于该工作区之外时，才使用该项目。在该位置，交叉核对 `packageManager`（如存在）、锁文件和 CI；如果它们不一致或存在相互竞争的锁文件，则停止操作。固定包管理器版本，并使用 `../../references/security-checklist.md` 中的矩阵。
2. **首次执行前阻止依赖项脚本。** 在禁用脚本或采用已记录的故障关闭策略的情况下执行引导安装，检查待执行脚本的源代码，仅批准最低限度所需的包，提交该策略，然后通过一次干净的冻结式/不可变安装进行验证。切勿笼统批准所有脚本。

审计只能发现已知安全公告；无法检测新近出现的恶意包或仿冒包。因此：

- **切勿自动应用强制审计修复**（`npm audit fix --force` 或等效命令）。预览修复操作、阅读变更日志，并测试由此产生的每项升级；强制修复可能会超出声明的依赖项版本范围。
- **在支持的情况下验证注册表签名和来源证明**（`npm audit signatures`、`pnpm audit signatures`），并将缺失视为需要调查的信号，而不是包已遭入侵的自动证明。
- **同时审查新依赖项、锁文件差异和脚本策略变更**——包括所有权、维护情况、发布时间、来源、传递依赖图，以及 `cross-env` 与 `crossenv` 之类的仿冒包（OWASP **A06**、**LLM03**）。

## 速率限制

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limit
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                   // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
}));

// Stricter limit for auth endpoints
app.use('/api/auth/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,  // 10 attempts per 15 minutes
}));
```

## 密钥管理

```
.env files:
  ├── .env.example  → Committed (template with placeholder values)
  ├── .env          → NOT committed (contains real secrets)
  └── .env.local    → NOT committed (local overrides)

.gitignore must include:
  .env
  .env.local
  .env.*.local
  *.pem
  *.key
```

**提交前务必检查：**
```bash
# Check for accidentally staged secrets
git diff --cached | grep -i "password\|secret\|api_key\|token"
```

**如果密钥曾被提交，请立即轮换。** 删除相应行或重写历史记录还不够——一旦密钥被推送到远程仓库，就应视为已泄露。请先撤销并重新签发密钥，然后再将其从历史记录中彻底清除。

## 保护 AI / LLM 功能

如果你的应用会调用 LLM——例如聊天机器人、摘要工具、智能体或 RAG——它就会面临新的攻击面。请参照 [OWASP LLM 应用十大风险（2025）](https://genai.owasp.org/llm-top-10/)：

- **将所有模型输出视为不可信输入（LLM05：输出处理不当）。** 切勿将 LLM 输出直接传入 `eval`、SQL、shell、`innerHTML` 或文件路径。应像处理原始用户输入一样，对其进行严格的验证和编码。
- **假定提示词可能被劫持（LLM01：提示词注入）。** 上下文窗口中的不可信文本——用户消息、抓取的网页、PDF——都可能携带指令。系统提示词并非安全边界；应在代码中强制实施权限控制，而不是依赖提示词。
- **避免在提示词中包含密钥及其他用户的数据（LLM02 / LLM07）。** 上下文中的任何内容都可能被模型原样输出。不要放入 API 密钥、跨租户数据，或可能被模型复述的完整系统提示词。
- **限制工具和智能体权限（LLM06：过度自主性）。** 将工具权限控制在最低限度，对破坏性或不可逆操作要求确认，并验证每一个工具参数。
- **限制资源消耗（LLM10：无限制消耗）。** 限制 token 数量、请求速率以及循环/递归深度，防止恶意构造的输入导致成本激增或系统卡死。
- **隔离检索数据（LLM08：向量和嵌入弱点）。** 在 RAG 中，应将向量存储视为信任边界：按租户隔离嵌入数据，防止某个用户检索到其他用户的数据；并在建立索引前验证文档，防止被投毒的内容操纵回答。

```typescript
// BAD: trusting model output as a command or as markup
const sql = await llm.generate(`Write SQL for: ${userQuestion}`);
await db.query(sql);                                   // arbitrary query execution
container.innerHTML = await llm.reply(userMessage);   // stored XSS, via the model

// GOOD: model output is data — parse defensively, then validate, then encode
let intent;
try {
  intent = CommandSchema.parse(JSON.parse(await llm.replyJson(userMessage)));
} catch {
  throw new ValidationError('unexpected model output'); // JSON.parse or schema failed
}
await runAllowlistedAction(intent.action, intent.params);
container.textContent = await llm.reply(userMessage);
```

## 安全审查清单

```markdown
### Authentication
- [ ] Passwords hashed with bcrypt/scrypt/argon2 (salt rounds ≥ 12)
- [ ] Session tokens are httpOnly, secure, sameSite
- [ ] Login has rate limiting
- [ ] Password reset tokens expire

### Authorization
- [ ] Every endpoint checks user permissions
- [ ] Users can only access their own resources
- [ ] Admin actions require admin role verification

### Input
- [ ] All user input validated at the boundary
- [ ] SQL queries are parameterized
- [ ] HTML output is encoded/escaped
- [ ] Server-side URL fetches are allowlisted (no SSRF to internal services)

### Data
- [ ] No secrets in code or version control
- [ ] Sensitive fields excluded from API responses
- [ ] PII encrypted at rest (if applicable)

### Infrastructure
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] CORS restricted to known origins
- [ ] Dependencies audited for vulnerabilities
- [ ] Error messages don't expose internals

### Supply Chain
- [ ] One authoritative lockfile committed; CI uses that manager's frozen/immutable install
- [ ] Native audit triaged by reachability and fix risk; dependency install scripts blocked unless explicitly approved
- [ ] New dependencies reviewed (ownership, provenance, release age, transitive graph)

### AI / LLM (if used)
- [ ] Model output treated as untrusted (no eval/SQL/innerHTML/shell)
- [ ] Secrets and other users' data kept out of prompts
- [ ] Tool/agent permissions scoped; destructive actions require confirmation
```
## 另请参阅

有关详细的安全检查清单和提交前验证步骤，请参阅 `../../references/security-checklist.md`。

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “这是内部工具，安全性并不重要” | 内部工具也会遭到入侵。攻击者会以最薄弱的环节为目标。 |
| “我们以后再补充安全措施” | 事后补救安全问题的难度是在一开始就构建安全性的 10 倍。现在就加入安全措施。 |
| “没人会试图利用这个漏洞” | 自动化扫描器会发现它。隐匿式安全并不是真正的安全。 |
| “框架会处理安全问题” | 框架提供的是工具，而不是保障。你仍然需要正确使用这些工具。 |
| “这只是一个原型” | 原型会变成生产系统。从第一天起就养成安全习惯。 |
| “在这里进行威胁建模有些小题大做” | 花五分钟思考“我会如何攻击它？”，可以避免那些任何控制措施以后都无法修补的设计缺陷。 |
| “这只是 LLM 输出，只是文本而已” | 这些“文本”可能是 SQL 语句、脚本标签或 shell 命令。应像对待任何不可信输入一样对待它。 |
| “审计已经通过，所以这个依赖是安全的” | 审计匹配的是已知安全公告。它们无法检测新近变成恶意软件包的依赖，也不能保证执行未经审查的安装脚本是安全的。 |

## 危险信号

- 将用户输入直接传递给数据库查询、shell 命令或 HTML 渲染
- 源代码或提交历史中存在密钥
- API 端点没有身份验证或授权检查
- 缺少 CORS 配置，或使用通配符（`*`）来源
- 身份验证端点没有速率限制
- 向用户暴露堆栈跟踪或内部错误
- 依赖项存在已知的严重漏洞、同一安装边界内存在相互冲突的锁文件、安装不可复现，或一概批准执行脚本
- 服务器在没有允许列表的情况下获取用户提供的 URL（SSRF）
- 将 LLM/模型输出传递给查询、DOM、shell 或 `eval`
- 将密钥、个人身份信息（PII）或完整的系统提示词放入 LLM 上下文窗口

## 验证

实现与安全相关的代码后：

- [ ] 原生审计中不存在未经缓解且可触达的严重/高危发现；CI 保留权威锁文件，并阻止未经审查的依赖脚本
- [ ] 源代码或 git 历史中不存在密钥
- [ ] 所有用户输入均在系统边界处经过验证
- [ ] 每个受保护的端点都进行身份验证和授权检查
- [ ] 响应中包含安全标头（使用浏览器 DevTools 检查）
- [ ] 错误响应不会暴露内部细节
- [ ] 身份验证端点已启用速率限制
- [ ] 服务器端 URL 获取操作根据允许列表进行验证（无 SSRF）
- [ ] LLM/模型输出在使用前经过验证和编码（如果存在 AI 功能）