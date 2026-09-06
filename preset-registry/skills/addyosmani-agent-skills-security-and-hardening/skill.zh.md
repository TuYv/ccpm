---
name: security-and-hardening
description: Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when auditing dependencies for known vulnerabilities, triaging package-manager audit findings, or assessing supply-chain risk in a new package. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
---
# 安全与加固

## 概述

面向 Web 应用的安全优先开发实践。将所有外部输入视为恶意输入，将每个密钥视为至宝，并将每次授权检查视为强制要求。安全不是一个阶段，而是对每一行涉及用户数据、身份验证或外部系统的代码所施加的约束。

## 适用场景

- 构建任何接受用户输入的功能
- 实现身份验证或授权
- 存储或传输敏感数据
- 集成外部 API 或服务
- 添加文件上传、webhook 或回调
- 处理支付或 PII 数据

## 流程：先进行威胁建模

没有威胁模型支撑的安全控制只是凭空猜测。在进行加固前，花五分钟像攻击者一样思考：

1. **梳理信任边界。** 不可信数据在哪里进入你的系统？HTTP 请求、表单字段、文件上传、webhook、第三方 API、消息队列以及 **LLM 输出**，还包括那些看起来像内部数据、只是因为由操作系统交给你的本地值：另一个进程的命令行或环境变量、共享卷上的文件名、作业负载中的路径。信任取决于值的*写入者*，而不是传递它的通道。每个边界都是攻击面。
2. **明确资产。** 哪些东西值得窃取或破坏？凭据、PII、支付数据、管理操作、资金转移。
3. **针对每个边界运行 STRIDE** ——这是一种快速分析视角，而非形式主义流程：

| 威胁 | 要问的问题 | 典型缓解措施 |
|---|---|---|
| **S** 欺骗（Spoofing） | 是否有人可以冒充用户或服务？ | 身份验证、签名验证 |
| **T** 篡改（Tampering） | 数据在传输中或静态存储时是否可以被修改？ | 完整性检查、参数化查询、HTTPS |
| **R** 抵赖（Repudiation） | 某个操作之后是否可以被否认？ | 记录安全事件的审计日志 |
| **I** 信息泄露（Information disclosure） | 数据是否可能泄露？ | 加密、字段允许列表、通用错误信息 |
| **D** 拒绝服务（Denial of service） | 系统是否可能被压垮？ | 速率限制、输入大小上限、超时 |
| **E** 权限提升（Elevation of privilege） | 用户是否可以获得本不应拥有的权限？ | 授权检查、最小权限 |

4. **在编写使用场景的同时编写滥用场景。** 对每项功能询问“我会如何滥用它？”——然后将其作为第一个测试。

如果你无法明确某项功能的信任边界，就还没有准备好保护它。这属于 OWASP **A04：不安全设计** ——大多数安全漏洞始于设计，而不是代码。

## 三层边界系统

### 始终执行（无例外）

- **在系统边界处验证所有外部输入**（API 路由、表单处理器）
- **参数化所有数据库查询** ——绝不将用户输入拼接到 SQL 中
- **对输出进行编码**以防止 XSS（使用框架自动转义，不要绕过它）
- **对所有外部通信使用 HTTPS**
- **使用 bcrypt/scrypt/argon2 哈希密码**（绝不存储明文）
- **设置安全标头**（CSP、HSTS、X-Frame-Options、X-Content-Type-Options）
- **对会话使用 httpOnly、secure、sameSite Cookie**
- **在每次发布前，针对已检测到的包管理器使用已提交的锁文件执行原生 audit**

### 先征得同意（需要人工批准）

- 添加新的身份验证流程或更改身份验证逻辑
- 存储新的敏感数据类别（PII、支付信息）
- 添加新的外部服务集成
- 更改 CORS 配置
- 添加文件上传处理程序
- 修改速率限制或节流机制
- 授予更高权限或角色

### 严禁执行

- **严禁将机密信息提交**到版本控制系统（API keys、passwords、tokens）
- **严禁记录敏感数据**（passwords、tokens、完整的信用卡号码）
- **严禁将客户端验证**作为安全边界
- **严禁为方便起见禁用安全标头**
- **严禁对用户提供的数据使用 `eval()` 或 `innerHTML`**
- **严禁将会话存储在客户端可访问的存储中**（使用 localStorage 存储身份验证令牌）
- **严禁向用户暴露堆栈跟踪**或内部错误详情

## OWASP Top 10 防范模式

这些是防范模式，而不是排名。如需了解 2021 年的排序，请参阅 `../../references/security-checklist.md` 中的快速参考表。

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

### 敏感数据暴露

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

只要服务器获取的 URL 受到用户影响，例如 Webhook、“从 URL 导入”、图片代理、链接预览，攻击者就可能将其指向内部服务（云元数据、`localhost`、私有 IP）。

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

`range() !== 'unicast'` 检查涵盖了环回地址、链路本地地址 `169.254.169.254`（云元数据、最常见的 SSRF 目标）、私有地址范围，以及 IPv4 和 IPv6 中的唯一本地地址范围。

**注意事项：此检查仍然存在 TOCTOU 漏洞。** `fetch` 会在检查完成后再次解析 DNS，因此攻击者可以利用 TTL 较短的记录，在验证与建立连接之间将其重新绑定到内部 IP。对于高风险场景，应解析一次并连接到固定的 IP，或在前方部署过滤代理（`request-filtering-agent` / `ssrf-req-filter`）。

## 输入验证模式

### 边界处的 Schema 验证

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

### 派生路径上的破坏性操作

删除、移动或覆盖操作的安全性，取决于为其命名的目标值是否可信。从内核、作业负载或兄弟服务中读取该值，只能证明它*从哪里到达*，不能证明它*由谁写入*；另一个进程的命令行同样受攻击者控制，就像表单字段一样。形状检查（“绝对路径，且至少深入一个目录”）只能证明格式正确，却常被误认为是授权；这正是清理例程删除根目录而不是叶节点的原因。

在执行破坏性调用前，必须同时满足以下三点：解析后的目标位于**允许列表中的根目录**下（比较前先解析符号链接，绝不能比较原始字符串）；目标至少位于该根目录**下一级**，因此根目录本身永远不会成为目标；并且目标带有**证明它属于你**的证据，该证据必须在操作前、以及任何会将其移除的清理操作前读取，否则“缺失”和“非我所有”将无法区分。拒绝操作时，记录被拒绝的目标并停止：清理操作回退到更宽泛的默认路径，正是此检查要防止的故障。详见 `../../references/security-checklist.md` 中的示例。

这里有两个限制，因为这项检查看起来比实际更可靠。目录树中的标记属于自我声明：任何能够写入该目录的人都能写入该标记，因此预期所有者必须来自经过身份验证的状态，并且标记需要完整性保护（限制性所有权或 MAC），之后才能将其视为授权依据。并且，先解析路径、再通过名称执行操作，只要不受信任的进程能够替换祖先目录，就存在检查与使用之间的竞态条件：在共享卷上，应通过描述符持有目标并使用 no-follow 操作、在根目录下执行操作，或确保整个层级在操作期间无法发生变化。

## 分类处理依赖项审计结果

包管理器审计会报告已知安全公告；它们无法证明某个包是可信的，也无法证明易受攻击的代码一定可达。请使用以下决策树：

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
- 根据你的部署环境，该漏洞是否可被利用（例如，仅客户端应用中的服务端漏洞）？

推迟修复时，记录原因并设置复查日期。

### 供应链卫生

不要假设 npm，也不要将最近的 manifest 视为安装根目录。按以下顺序操作：

1. **查找安装边界和包管理器。** 使用拥有 lockfile 的工作区根目录；只有当独立的嵌套项目位于该工作区之外时，才使用该项目。在那里，对照确认 `packageManager`（如果存在）、lockfile 和 CI；如果三者不一致或存在多个 lockfile，则停止操作。固定包管理器版本，并使用 `../../references/security-checklist.md` 中的矩阵。
2. **在首次执行前阻止依赖脚本。** 在禁用脚本的情况下进行引导安装，或采用有文档记录的故障关闭策略；检查待执行脚本的源代码，仅批准所需的最少软件包，提交该策略，然后通过干净的 frozen/immutable 安装进行验证。绝不要对脚本进行一揽子批准。

审计只能发现已知的安全公告；它们无法发现新出现的恶意软件包或拼写仿冒软件包。因此：

- **绝不要自动应用强制审计修复**（`npm audit fix --force` 或等效命令）。预览修复方案，阅读变更日志，并测试每次由此产生的升级；强制修复可能会超出已声明的依赖范围。
- **在支持的情况下验证 registry 签名和来源**（`npm audit signatures`、`pnpm audit signatures`），并将缺失视为需要调查的信号，而不是自动认定为遭到入侵的证据。
- **一并审查新增依赖、lockfile 差异和脚本策略变更**——包括所有权、维护情况、发布时间、来源、传递依赖图，以及诸如 `cross-env` 与 `crossenv` 之类的拼写仿冒软件包（OWASP **A06**、**LLM03**）。

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

**一旦进程数超过一个，就在共享存储中计数。** `express-rate-limit` 默认将计数器保存在进程内存中。在负载均衡器之后，每个实例都会维护自己的计数，因此实际限制是 `max × instances`；在 serverless 或 edge 运行时中，每次新的调用都会从零开始，因此上面的 auth 限制可能永远不会触发。传入共享 `store`（通过 `rate-limit-redis` 使用 Redis），或者使用适用于无法建立长时间 TCP 连接环境的基于 HTTP 的限流器（例如 `@upstash/ratelimit`）：

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

**始终在提交前检查：**
```bash
# 检查是否意外暂存了机密信息
git diff --cached | grep -i "password\|secret\|api_key\|token"
```

**如果机密信息曾被提交，立即轮换它。**仅删除该行或重写历史记录是不够的——一旦信息进入远程仓库，就假定它已经泄露。先撤销并重新签发密钥，然后从历史记录中清除它。

## 数据隐私与合规

保护数据关注的是“攻击者能否读取它？”隐私关注的是“我们是否应该持有它，以及持有多久？”——这是两个不同的问题，强化安全性无法回答后者。最容易保护、泄露影响最小、合规成本最低的数据，就是从未收集的数据。将个人数据视为需要尽量减少的负担，而不是需要囤积的资产。

**了解你持有什么。**你无法保护或响应删除请求中涉及的、自己都找不到的数据。添加字段时就对其进行分类：

| 类别 | 示例 | 处理方式 |
|---|---|---|
| **非个人数据** | 聚合数据、匿名化计数 | 按常规处理 |
| **个人数据（PII）** | 姓名、电子邮件、IP、设备/用户 ID | 最小化收集、实施访问控制，并纳入导出/删除范围 |
| **敏感数据** | 健康、财务、位置、生物识别信息、政府签发的 ID、任何涉及未成年人的数据 | 需要额外的收集依据、更严格的访问控制，通常还需要加密和审计日志 |

**操作规则：**
- **最小化收集并设定用途。**仅为明确说明的用途收集字段。“以后可能有用”不是用途，而是潜在的泄露范围。不要将 PII 记录到遥测数据中（`observability-and-instrumentation` skill 也从运维角度阐述了同一点）。
- **预先设定保留期限，然后确实删除。**每个个人数据存储都需要 TTL 和可用的删除路径，包括备份、缓存、搜索索引和分析副本。没有过期时间的数据，就是一场迟早会发生的泄露。
- **支持所在司法辖区要求的数据主体权利**（GDPR/CCPA 及类似法规）：按请求导出、更正和删除数据。这些都是工程功能——设计 schema 时要确保用户数据是*可查找*且*可删除*的，而不是不可逆地散落在各个系统中。
- **在收集或与第三方共享之前取得同意**，并使其可审计。将 PII 发送给分析、广告或 LLM 供应商属于“共享”——这应受用户选择控制，并且供应商需要签署数据处理协议。
- **将默认设置本地化，不要硬编码某一地区的法律。**数据驻留要求和规则因用户所在地而异；应将政策设计为可配置的边界，而不是预设假设。

当数据跨越信任边界时，应将其作为不可信数据进行验证（参见上面的输入验证）；当隐私事件暴露个人数据时，违规通知时限也是事后复盘的一部分——请遵循 `debugging-and-error-recovery` skill。

## 保护 AI / LLM 功能

如果你的应用调用 LLM——聊天机器人、摘要工具、代理、RAG——它就会继承一个新的攻击面。请参考 [OWASP Top 10 for LLM Applications (2025)](https://genai.owasp.org/llm-top-10/) 进行梳理：

- **将所有模型输出视为不可信输入（LLM05：输出处理不当）。**绝不要将 LLM 输出直接传入 `eval`、SQL、shell、`innerHTML` 或文件路径。应像处理原始用户输入一样对其进行验证和编码。
- **假定提示词可能被劫持（LLM01：提示词注入）。**上下文窗口中的不可信文本——用户消息、抓取的网页、PDF——都可能携带指令。系统提示词不是安全边界；应在代码中强制执行权限，而不是依赖提示词。
- **不要将机密信息和其他用户的数据放入提示词（LLM02 / LLM07）。**上下文中的任何内容都可能被模型复述。不要将 API 密钥、跨租户数据或完整系统提示词放入模型可以复述的位置。
- **限制工具和代理的权限（LLM06：权限过度）。**将工具权限限定为最低必要范围，对破坏性或不可逆操作要求确认，并验证每个工具参数。
- **限制资源消耗（LLM10：资源消耗不受限）。**限制 token 数量、请求速率以及循环/递归深度，避免精心构造的输入推高成本或导致系统卡住。
- **隔离检索数据（LLM08：向量和嵌入弱点）。**在 RAG 中，将向量存储视为信任边界：按租户划分嵌入，避免一个用户检索到其他用户的数据；并在建立索引前验证文档，避免被投毒的内容引导答案。

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
- [ ] Delete/move/overwrite targets built from data are checked against an allowlisted root, a minimum depth, and ownership evidence read before the operation

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

有关详细的安全清单和提交前验证步骤，请参阅 `../../references/security-checklist.md`。

## 常见的自我辩解

| 自我辩解 | 现实 |
|---|---|
| “这是内部工具，安全性无关紧要” | 内部工具也会遭到入侵。攻击者会瞄准最薄弱的环节。 |
| “我们以后再加安全措施” | 事后补做安全防护比从一开始就集成安全措施难 10 倍。现在就加上。 |
| “没人会尝试利用这个漏洞” | 自动化扫描器会发现它。依赖隐蔽性并不等于安全。 |
| “框架会处理安全问题” | 框架提供的是工具，而非保证。你仍然需要正确使用这些工具。 |
| “这只是一个原型” | 原型会进入生产环境。从第一天起就养成安全习惯。 |
| “在这里做威胁建模是小题大做” | 花五分钟思考“我会如何攻击这个？”可以避免那些事后任何控制措施都无法修补的设计缺陷。 |
| “这只是 LLM 的输出，只是文本而已” | 那些“文本”可能是 SQL 语句、脚本标签或 shell 命令。应将其视为任何不受信任的输入。 |
| “审计通过了，所以依赖是安全的” | 审计只能匹配已知的安全公告。它们无法检测新出现的恶意软件包，也无法让未经审查的安装脚本变得可以安全执行。 |
| “先收集起来，我们以后可能会需要” | 你不持有的数据不会被泄露、传唤或错误删除。“可能会需要”是泄露范围，而不是收集目的。 |
| “我们会手动处理删除请求” | 手动擦除会遗漏备份、缓存和分析副本。如果无法通过架构找到某个用户的数据，就无法满足其请求——应为此进行设计。 |
| “合规是法务的问题，不是我们的问题” | 导出、删除、保留和同意都涉及架构和代码。如果你已经把 PII 分散到十个系统中，法务无法事后再将这些要求强行加上去。 |

## 高风险信号

- 用户输入被直接传入数据库查询、shell 命令或 HTML 渲染
- 删除、移动或覆盖操作的目标来自 payload、配置值或另一个进程的命令行，且仅通过对路径进行形状检查来防护
- 源代码或提交历史中包含密钥
- API 端点没有身份验证或授权检查
- 缺少 CORS 配置，或使用通配符（`*`）来源
- 身份验证端点没有速率限制，或在多个实例前使用基于内存的限制器
- 向用户暴露堆栈跟踪或内部错误
- 依赖项存在已知严重漏洞、同一安装边界存在相互竞争的 lockfile、安装不可复现，或无条件批准脚本
- 服务器获取用户提供的 URL，且没有 allowlist（SSRF）
- 将 LLM/模型输出传入查询、DOM、shell 或 `eval`
- 将密钥、PII 或完整系统提示词放入 LLM 上下文窗口
- 收集个人数据时没有说明用途、保留期限或删除路径
- 未经同意或没有数据处理协议，就将 PII 发送给分析、广告或 LLM 供应商
- “删除我的账户”实际上只切换了一个标记，而个人数据仍残留在存储和备份中

## 验证

实现与安全相关的代码后：

- [ ] 原生审计没有未缓解且可触达的严重/高危发现；CI 保留权威 lockfile，并阻止未经审查的依赖脚本
- [ ] 源代码或 git 历史中没有密钥
- [ ] 所有用户输入都在系统边界进行验证
- [ ] 破坏性文件系统操作会解析符号链接，然后在执行前验证 allowlisted root、最小深度和所有权
- [ ] 每个受保护端点都检查身份验证和授权
- [ ] 响应中存在安全标头（使用浏览器 DevTools 检查）
- [ ] 错误响应不会暴露内部细节
- [ ] 身份验证端点启用了速率限制；当多个实例提供流量服务时，速率限制由共享存储支持
- [ ] 服务端 URL 获取会根据 allowlist 进行验证（无 SSRF）
- [ ] LLM/模型输出在使用前经过验证和编码（如果存在 AI 功能）
- [ ] 个人数据已分类、已最小化到明确用途，并设有保留期限
- [ ] 删除和导出请求能够端到端正常工作（包括备份、缓存和分析副本）