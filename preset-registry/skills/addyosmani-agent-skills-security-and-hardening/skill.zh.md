---
name: security-and-hardening
description: Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when auditing dependencies for known vulnerabilities, triaging package-manager audit findings, or assessing supply-chain risk in a new package. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
---
# 安全与加固

## 概述

面向 Web 应用程序的安全优先开发实践。将每个外部输入都视为恶意的，将每个密钥都视为神圣的，并将每项授权检查都视为强制性的。安全不是一个阶段，而是对每一行涉及用户数据、身份验证或外部系统的代码的约束。

## 何时使用

- 构建任何接受用户输入的功能
- 实现身份验证或授权
- 存储或传输敏感数据
- 与外部 API 或服务集成
- 添加文件上传、Webhook 或回调
- 处理支付或 PII 数据

## 流程：先进行威胁建模

没有威胁模型的控制措施只是猜测。在加固之前，花五分钟像攻击者一样思考：

1. **绘制信任边界。** 不受信任的数据会从哪里进入你的系统？HTTP 请求、表单字段、文件上传、Webhook、第三方 API、消息队列以及 **LLM 输出**。每个边界都是攻击面。
2. **识别资产。** 什么值得被窃取或破坏？凭据、PII、支付数据、管理员操作、资金流动。
3. **对每个边界应用 STRIDE** —— 这是一个快速视角，而非繁琐仪式：

| 威胁 | 问题 | 典型缓解措施 |
|---|---|---|
| **S**poofing | 是否有人能够冒充用户/服务？ | 身份验证、签名验证 |
| **T**ampering | 数据在传输中或静态存储时能否被篡改？ | 完整性检查、参数化查询、HTTPS |
| **R**epudiation | 某项操作之后是否可能被否认？ | 对安全事件进行审计日志记录 |
| **I**nformation disclosure | 数据是否可能泄露？ | 加密、字段允许列表、通用错误信息 |
| **D**enial of service | 是否可能被压垮？ | 速率限制、输入大小上限、超时 |
| **E**levation of privilege | 用户是否能获得其不应拥有的权限？ | 授权检查、最小权限原则 |

4. **在用例旁边编写滥用案例。** 对于每项功能，问自己“我会如何滥用它？”——然后将其作为你的第一个测试。

如果你无法说出某项功能的信任边界，就还没有准备好对其进行安全保护。这是 OWASP **A04：不安全设计** —— 大多数漏洞始于设计，而非代码。

## 三层边界体系

### 始终执行（无例外）

- 在系统边界（API 路由、表单处理程序）**验证所有外部输入**
- **参数化所有数据库查询** —— 永远不要将用户输入拼接到 SQL 中
- **编码输出**以防止 XSS（使用框架的自动转义，不要绕过它）
- 对所有外部通信**使用 HTTPS**
- 使用 bcrypt/scrypt/argon2 **哈希密码**（绝不存储明文）
- **设置安全标头**（CSP、HSTS、X-Frame-Options、X-Content-Type-Options）
- 对会话使用 httpOnly、secure、sameSite Cookie
- 每次发布前，针对已提交的锁文件运行检测到的包管理器原生审计

### 先询问（需要人工批准）

- 添加新的身份验证流程或更改认证逻辑
- 存储新的敏感数据类别（PII、支付信息）
- 添加新的外部服务集成
- 更改 CORS 配置
- 添加文件上传处理程序
- 修改速率限制或节流机制
- 授予更高的权限或角色

### 永远不要做

- **永远不要将机密信息提交**到版本控制系统（API 密钥、密码、令牌）
- **永远不要记录敏感数据**（密码、令牌、完整信用卡号）
- **永远不要信任客户端验证**作为安全边界
- **永远不要为了方便而禁用安全标头**
- **永远不要对用户提供的数据使用 `eval()` 或 `innerHTML`**
- **永远不要将会话存储在客户端可访问的存储中**（用于身份验证令牌的 localStorage）
- **永远不要向用户暴露堆栈跟踪信息**或内部错误详情

## OWASP Top 10 防护模式

这些是防护模式，而不是排名。2021 年的排序请参阅 `../../references/security-checklist.md` 中的快速参考表。

### 注入（SQL、NoSQL、OS 命令）

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

只要服务器获取了用户能够影响的 URL，例如 webhook、“从 URL 导入”、图片代理或链接预览，攻击者就可能将其目标指向内部服务（云元数据、`localhost`、私有 IP）。

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

`range() !== 'unicast'` 检查涵盖 IPv4 和 IPv6 中的回环地址、链路本地地址 `169.254.169.254`（云元数据，SSRF 的首要攻击目标）、私有地址以及唯一本地地址范围。

**注意事项：这仍然存在 TOCTOU 间隙。** 检查后，`fetch` 会再次解析 DNS，因此使用短 TTL 记录的攻击者可在验证与连接之间将其重新绑定到内部 IP。对于高风险入口，应只解析一次并连接到固定 IP，或者在前方部署过滤代理（`request-filtering-agent` / `ssrf-req-filter`）。

## 输入验证模式

### 边界处的模式验证

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

## 依赖审计结果分级处理

包管理器审计会报告已知的安全公告；它们并不能证明某个包可信，也不能证明易受攻击的代码可被触达。请使用以下决策树：

```
原生包管理器审计报告了一个漏洞
├── 严重程度：critical 或 high
│   ├── 易受攻击的代码是否可在运行时、构建、测试或部署路径中触达？
│   │   ├── 是 --> 立即修复（更新、打补丁或替换该依赖）
│   │   └── 否（已确认在这些路径中均未使用） --> 尽快修复，但不构成阻塞
│   └── 是否有可用修复？
│       ├── 是 --> 更新到已修复的版本
│       └── 否 --> 检查是否有缓解措施，考虑替换该依赖，或添加到允许列表并设置审查日期
├── 严重程度：moderate
│   ├── 可在生产环境中触达？ --> 在下一个发布周期修复
│   └── 仅开发环境？ --> 方便时修复，并在待办事项中跟踪
└── 严重程度：low
    └── 跟踪并在常规依赖更新期间修复
```

**关键问题：**
- 易受攻击的函数是否确实在你的代码路径中被调用？
- 该依赖是运行时依赖还是仅开发依赖？
- 在你的部署上下文中，该漏洞是否可被利用（例如，仅客户端应用中的服务端漏洞）？

当你推迟修复时，请记录原因并设置审查日期。

### 供应链卫生

不要想当然地使用 npm，也不要将最近的清单文件视为安装根目录。请按以下顺序执行：

1. **确定安装边界和包管理器。** 使用拥有锁文件的工作区根目录；只有当独立的嵌套项目位于该工作区之外时，才使用它。在该位置交叉验证 `packageManager`（如存在）、锁文件和 CI；如存在不一致或竞争的锁文件，则停止操作。固定包管理器版本，并使用 `../../references/security-checklist.md` 中的矩阵。
2. **在首次执行前阻止依赖脚本。** 使用禁用脚本的方式引导安装，或采用有文档记录的故障关闭策略；检查待执行的脚本源码，仅批准最低限度所需的软件包，提交该策略，然后通过一次干净的冻结/不可变安装进行验证。绝不要批量批准脚本。

审计只能发现已知安全公告；它们无法发现新近恶意化或名称拼写相似的软件包。因此：

- **绝不要自动应用强制审计修复**（`npm audit fix --force` 或等效命令）。预览修复方案，阅读变更日志，并测试每项产生的升级；强制修复可能跨越已声明的依赖范围。
- **在支持时验证注册表签名和来源证明**（`npm audit signatures`、`pnpm audit signatures`），并将缺失视为需要调查的信号，而非自动认定为受损。
- **一并审查新增依赖、锁文件差异和脚本策略变更**——所有权、维护情况、发布时间、来源证明、传递依赖图，以及诸如 `cross-env` 与 `crossenv` 的拼写相似包（OWASP **A06**、**LLM03**）。

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

**一旦进程数超过一个，就应在共享存储中计数。** `express-rate-limit` 默认将计数器保存在进程内存中。在负载均衡器后面运行时，每个实例都会维护自己的计数，因此实际限制是 `max × instances`；在无服务器或边缘运行时中，每次新的调用都会从零开始，因此上面的身份验证限制可能永远不会触发。传入共享的 `store`（通过 `rate-limit-redis` 使用 Redis），或者使用适用于无法建立长期 TCP 连接环境的基于 HTTP 的限流器（例如 `@upstash/ratelimit`）：

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const authLimiter = new Ratelimit({
  redis: Redis.fromEnv(),                       // UPSTASH_REDIS_REST_URL + _TOKEN
  limiter: Ratelimit.slidingWindow(10, '15 m'), // 10 attempts per 15 minutes, across all instances
});
const { success } = await authLimiter.limit(`login:${req.ip}`);
if (!success) return res.status(429).end();
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

**如果某个密钥曾被提交，请将其轮换。**仅删除该行或重写历史记录是不够的——一旦密钥到达远程仓库，就应假定它已经泄露。先撤销并重新签发密钥，然后再从历史记录中彻底清除它。

## 数据隐私与合规

保护数据关注的是“攻击者能否读取它？”隐私关注的是“我们是否应该持有它，以及持有多久？”这是一个独立的问题，安全加固无法回答。最容易保护、泄露影响最小且最易于合规的数据，是你从未收集过的数据。将个人数据视为需要尽量减少的负债，而不是需要囤积的资产。

**了解你持有什么。**对于你找不到的数据，你既无法保护它，也无法响应删除请求。在添加字段时对其进行分类：

| 类别 | 示例 | 处理方式 |
|---|---|---|
| **非个人数据** | 聚合数据、匿名化计数 | 正常处理 |
| **个人数据（PII）** | 姓名、电子邮件、IP、设备/用户 ID | 尽量减少、实施访问控制，并纳入导出/删除范围 |
| **敏感数据** | 健康、财务、位置、生物特征、政府签发的 ID、任何涉及未成年人的数据 | 需要额外的收集依据、更严格的访问控制，通常还需要加密和审计日志 |

**操作规则：**
- **尽量减少收集并设定用途。**仅为明确说明的用途收集字段。“以后可能有用”不是用途，而是潜在的泄露范围。不要将 PII 记录到遥测数据中（`observability-and-instrumentation` skill 从运维角度提出了相同观点）。
- **预先设定保留期限，然后真正删除。**每个个人数据存储都需要 TTL 和可用的删除路径，包括备份、缓存、搜索索引和分析副本。没有过期时间的数据，就是一场迟早会发生的数据泄露。
- **支持所在司法辖区要求的数据主体权利**（GDPR/CCPA 及类似法规）：按请求导出、更正和删除数据。这些都是工程功能——设计 schema 时，应确保用户数据是*可查找*且*可删除*的，而不是不可逆地散落在各个系统中。
- **在收集数据或与第三方共享数据之前取得同意**，并确保同意可审计。将 PII 发送给分析、广告或 LLM 供应商属于“共享”——用户的选择决定是否可以这样做，而供应商需要签署数据处理协议。
- **使默认设置本地化，不要硬编码某一地区的法律。**数据驻留要求和规则因用户所在位置而异；应将政策设计为可配置的边界，而不是一个假设。

当数据跨越信任边界时，请将其作为不可信数据进行验证（参见上面的输入验证）；当隐私事件暴露个人数据时，数据泄露通知时限也是事后复盘的一部分，请遵循 `debugging-and-error-recovery` 技能。

## 保护 AI / LLM 功能

如果你的应用调用 LLM，例如聊天机器人、摘要器、代理、RAG，它就会继承一个新的攻击面。请根据 [OWASP LLM 应用十大风险（2025）](https://genai.owasp.org/llm-top-10/) 对其进行映射：

- **将所有模型输出视为不可信输入（LLM05：不当的输出处理）。** 永远不要将 LLM 输出直接传入 `eval`、SQL、shell、`innerHTML` 或文件路径。应像处理原始用户输入一样验证并编码。
- **假设提示词可能被劫持（LLM01：提示词注入）。** 上下文窗口中的不可信文本，例如用户消息、抓取的网页、PDF，可能携带指令。系统提示词不是安全边界；应在代码中强制执行权限，而不是依赖提示词。
- **不要将密钥和其他用户的数据放入提示词（LLM02 / LLM07）。** 上下文中的任何内容都可能被原样复述。不要将 API 密钥、跨租户数据或完整系统提示词放在模型可以复述的位置。
- **限制工具和代理的权限（LLM06：权限过度）。** 将工具权限限制到最低必要范围，对破坏性或不可逆操作要求确认，并验证每个工具参数。
- **限制资源消耗（LLM10：资源消耗不受限）。** 限制 token 数量、请求速率以及循环/递归深度，避免构造的输入增加成本或导致系统挂起。
- **隔离检索数据（LLM08：向量和嵌入弱点）。** 在 RAG 中，将向量存储视为信任边界：按租户划分嵌入，确保一个用户无法检索其他用户的数据；并在建立索引前验证文档，避免被投毒的内容引导回答。

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
- [ ] Personal data is classified, collected against a stated purpose, and minimized
- [ ] Personal data has a retention limit and a working deletion path (incl. backups/indexes)
- [ ] Export/delete (data-subject) requests are supported where required; sharing with third parties has consent

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

## 常见合理化说法

| 合理化说法 | 事实 |
|---|---|
| “这是内部工具，安全不重要” | 内部工具也会遭到入侵。攻击者会瞄准最薄弱的环节。 |
| “以后再添加安全措施” | 事后补充安全措施的难度是从一开始就构建安全性的 10 倍。现在就加入。 |
| “没人会尝试利用这个” | 自动化扫描器会找到它。通过隐蔽性实现安全并不是真正的安全。 |
| “框架会处理安全问题” | 框架提供的是工具，而非保证。你仍然需要正确使用这些工具。 |
| “这只是原型” | 原型最终会进入生产环境。从第一天就养成安全习惯。 |
| “威胁建模在这里没必要” | 花五分钟思考“我会如何攻击这个系统？”，就能避免那些之后任何控制措施都无法修补的设计缺陷。 |
| “这只是 LLM 的输出，只是文本而已” | 那些“文本”可能是 SQL 语句、脚本标签或 shell 命令。应将其视为不受信任的输入。 |
| “审计通过了，所以依赖是安全的” | 审计针对的是已知公告。它们无法检测新近变得恶意的软件包，也无法让未经审查的安装脚本变得可以安全执行。 |
| “先收集起来，以后可能会用到” | 不持有的数据不会被泄露、传唤或错误删除。“可能会用到”意味着更大的泄露范围，而不是明确的用途。 |
| “我们会手动处理删除请求” | 手动擦除会遗漏备份、缓存和分析副本。如果数据库架构无法找到用户的数据，就无法履行删除请求，应在设计时就为此做好准备。 |
| “合规是法务的问题，不是我们的问题” | 导出、删除、保留和同意都涉及数据库架构和代码。如果你已经把 PII 散落在十个系统中，法务无法事后再把这些要求强行加上去。 |

## 警示信号

- 将用户输入直接传递给数据库查询、shell 命令或 HTML 渲染
- 源代码或提交历史中包含密钥
- API 端点缺少身份验证或授权检查
- 缺少 CORS 配置，或使用通配符 (`*`) 来源
- 身份验证端点没有速率限制，或在多个实例前使用基于内存的限制器
- 向用户暴露堆栈跟踪或内部错误
- 存在已知严重漏洞的依赖项、同一安装边界存在相互竞争的锁文件、不可复现的安装，或无条件批准的脚本
- 服务器在没有 allowlist 的情况下获取用户提供的 URL（SSRF）
- 将 LLM/model 输出传递给查询、DOM、shell 或 `eval`
- 将密钥、PII 或完整系统提示词放入 LLM 上下文窗口
- 收集个人数据时没有声明用途、保留期限或删除路径
- 未经同意或没有数据处理协议，就将 PII 发送给分析、广告或 LLM 供应商
- “删除我的账户”只切换了一个标记，而个人数据仍然留在各个存储系统和备份中

## 验证

实现与安全相关的代码后：

- [ ] 原生审计没有未缓解且可触达的严重/高危问题；CI 保留权威锁文件，并阻止未经审查的依赖脚本
- [ ] 源代码或 git 历史中没有密钥
- [ ] 所有用户输入都在系统边界进行验证
- [ ] 每个受保护的端点都检查身份验证和授权
- [ ] 响应中存在安全标头（使用浏览器 DevTools 检查）
- [ ] 错误响应不会暴露内部细节
- [ ] 身份验证端点启用了速率限制；当有多个实例提供流量服务时，限制器由共享存储支持
- [ ] 服务器端 URL 获取操作根据 allowlist 进行验证（无 SSRF）
- [ ] LLM/model 输出在使用前经过验证和编码（如果存在 AI 功能）
- [ ] 个人数据已分类，并精简到声明的用途范围内，同时设有保留期限
- [ ] 删除和导出请求能够端到端完成（包括备份、缓存和分析副本）