---
name: security-and-hardening
description: Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
---
# 安全与加固

## 概述

面向 Web 应用程序的安全优先开发实践。将每一项外部输入都视为恶意内容，将每一个密钥都视为至关重要，并将每一次授权检查都视为强制要求。安全并不是一个阶段，而是对每一行涉及用户数据、身份验证或外部系统的代码施加的约束。

## 何时使用

- 构建任何接受用户输入的功能
- 实现身份验证或授权
- 存储或传输敏感数据
- 与外部 API 或服务集成
- 添加文件上传、Webhook 或回调
- 处理支付或 PII 数据

## 流程：威胁建模优先

没有威胁模型而后期附加的控制措施都只是猜测。在进行加固之前，花五分钟像攻击者一样思考：

1. **梳理信任边界。** 不受信任的数据会从哪里进入你的系统？HTTP 请求、表单字段、文件上传、Webhook、第三方 API、消息队列以及 **LLM 输出**。每一个边界都是攻击面。
2. **明确资产。** 哪些东西值得窃取或破坏？凭据、PII、支付数据、管理员操作、资金流转。
3. **对每个边界执行 STRIDE 分析**——这是一种快速分析视角，而不是一套繁琐流程：

| 威胁 | 要问的问题 | 典型缓解措施 |
|---|---|---|
| **S**poofing（身份伪造） | 是否有人能够冒充用户或服务？ | 身份验证、签名验证 |
| **T**ampering（篡改） | 数据在传输或静态存储时是否可能被修改？ | 完整性检查、参数化查询、HTTPS |
| **R**epudiation（抵赖） | 某项操作是否可能在事后被否认？ | 对安全事件进行审计日志记录 |
| **I**nformation disclosure（信息泄露） | 数据是否可能泄露？ | 加密、字段允许列表、通用错误信息 |
| **D**enial of service（拒绝服务） | 系统是否可能因过载而瘫痪？ | 速率限制、输入大小上限、超时 |
| **E**levation of privilege（权限提升） | 用户是否能够获得其不应拥有的权限？ | 授权检查、最小权限原则 |

4. **在用例旁边编写滥用案例。** 对每项功能都要问：“我会如何滥用它？”——然后将其作为你的第一个测试。

如果你无法明确一项功能的信任边界，就还没有准备好保护它。这正是 OWASP **A04：不安全设计**——大多数安全漏洞始于设计，而不是代码。

## 三级边界体系

### 始终执行（无例外）

- 在系统边界（API 路由、表单处理程序）**验证所有外部输入**
- **对所有数据库查询使用参数化方式**——绝不将用户输入拼接到 SQL 中
- **对输出进行编码**以防止 XSS（使用框架的自动转义功能，不要绕过它）
- 所有外部通信都**使用 HTTPS**
- 使用 bcrypt/scrypt/argon2 **对密码进行哈希处理**（绝不存储明文）
- **设置安全响应头**（CSP、HSTS、X-Frame-Options、X-Content-Type-Options）
- 会话使用 **httpOnly、secure、sameSite cookie**
- 每次发布前，针对已提交的锁文件，**运行检测到的包管理器的原生审计功能**

### 先询问（需要人工批准）

- 添加新的身份验证流程或更改身份验证逻辑
- 存储新类别的敏感数据（PII、支付信息）
- 添加新的外部服务集成
- 更改 CORS 配置
- 添加文件上传处理程序
- 修改速率限制或节流机制
- 授予更高权限或角色

### 绝对不要做

- **绝不要将机密信息提交**到版本控制系统（API 密钥、密码、令牌）
- **绝不要记录敏感数据**（密码、令牌、完整的信用卡号）
- **绝不要将客户端验证视为**安全边界
- **绝不要为了方便而禁用安全响应头**
- **绝不要对用户提供的数据使用 `eval()` 或 `innerHTML`**
- **绝不要将会话存储在客户端可访问的存储中**（例如使用 localStorage 存储身份验证令牌）
- **绝不要向用户暴露堆栈跟踪**或内部错误详情

## OWASP 十大风险预防模式

以下是预防模式，并非排名。有关 2021 年的排序，请参阅 `../../references/security-checklist.md` 中的快速参考表。

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

每当服务器获取受用户影响的 URL 时——例如 Webhook、“从 URL 导入”、图片代理、链接预览——攻击者都可能将其指向内部服务（云元数据、`localhost`、私有 IP）。

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

`range() !== 'unicast'` 检查涵盖 IPv4 和 IPv6 中的环回地址、链路本地地址 `169.254.169.254`（云元数据，首要的 SSRF 攻击目标）、私有地址和唯一本地地址范围。

**注意——这仍然存在 TOCTOU 缺口。** `fetch` 会在检查后再次解析 DNS，因此，攻击者可以使用短 TTL 记录，在验证和连接之间将其重新绑定到内部 IP。对于高风险入口，应仅解析一次并连接到固定的 IP，或者在前端部署过滤代理（`request-filtering-agent` / `ssrf-req-filter`）。

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

包管理器审计会报告已知安全公告；它们无法证明某个包值得信任，也无法证明存在漏洞的代码是可达的。请使用以下决策树：

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
- 存在漏洞的函数是否确实会在你的代码路径中被调用？
- 该依赖项是运行时依赖项，还是仅用于开发？
- 考虑到你的部署环境，该漏洞是否可被利用（例如，纯客户端应用中的服务端漏洞）？

如果你决定推迟修复，请记录原因并设定复查日期。

### 供应链卫生

不要默认使用 npm，也不要将最近的清单文件所在位置视为安装根目录。请按以下顺序操作：

1. **确定安装边界和包管理器。** 使用拥有锁文件的工作区根目录；只有当独立的嵌套项目位于该工作区之外时，才使用该嵌套项目。在该位置，交叉核实 `packageManager`（如果存在）、锁文件和 CI；如果它们不一致或存在相互竞争的锁文件，则停止操作。固定包管理器版本，并使用 `../../references/security-checklist.md` 中的矩阵。
2. **在首次执行前阻止依赖项脚本。** 在禁用脚本或采用有文档记录的故障关闭策略的情况下进行引导安装，检查待执行脚本的源代码，只批准最低限度所需的包，提交该策略，然后通过一次干净的冻结/不可变安装进行验证。切勿一揽子批准脚本。

审计只能发现已知安全公告；它们无法发现新近出现的恶意包或拼写仿冒包。因此：

- **绝不要自动应用强制审计修复**（`npm audit fix --force` 或等效命令）。预览修复方案，阅读变更日志，并测试由此产生的每项升级；强制修复可能会超出声明的依赖项版本范围。
- **在支持的情况下验证注册表签名和来源证明**（`npm audit signatures`、`pnpm audit signatures`），并将缺失视为需要调查的信号，而不是包已遭入侵的自动证明。
- **同时审查新增依赖项、锁文件差异和脚本策略变更**——包括所有权、维护状况、发布时间、来源证明、传递依赖图，以及诸如 `cross-env` 与 `crossenv` 之类的拼写仿冒（OWASP **A06**、**LLM03**）。

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

**如果密钥曾被提交过，请轮换该密钥。** 删除相关行或重写历史记录并不足够——一旦密钥到达远程仓库，就应假定它已泄露。先撤销并重新签发密钥，然后再从历史记录中彻底清除它。

## 数据隐私与合规

保护数据安全关注的是“攻击者能否读取它？”，而隐私关注的是“我们是否应该持有它，以及应该持有多久？”——这是一个仅靠安全加固无法回答的独立问题。保护成本、泄露成本和合规成本最低的数据，就是从未收集的数据。应将个人数据视为需要尽量减少的负债，而不是应当囤积的资产。

**了解你持有哪些数据。** 如果连数据在哪里都找不到，就无法保护它，也无法响应删除请求。在添加字段时对其进行分类：

| 类别 | 示例 | 处理方式 |
|---|---|---|
| **非个人数据** | 聚合数据、匿名化计数 | 常规处理 |
| **个人数据 (PII)** | 姓名、电子邮件、IP、设备/用户 ID | 尽量减少、实施访问控制、纳入导出/删除范围 |
| **敏感数据** | 健康、财务、位置、生物识别信息、政府签发的 ID、任何与未成年人有关的信息 | 收集时需要额外的合法依据、更严格的访问控制，通常还需要加密和审计日志 |

**操作规则：**
- **尽量减少数据并明确用途。** 只有在具备明确用途时才收集字段。“以后可能有用”不算用途——它只是潜在的泄露范围。不要将 PII 记录到遥测数据中（`observability-and-instrumentation` 技能从运维角度提出了同样的观点）。
- **预先设定保留期限，然后真正删除数据。** 每个个人数据存储都需要设置 TTL，并具备有效的删除路径——包括备份、缓存、搜索索引和分析副本。没有过期时间的数据，就是一场被安排到未来的数据泄露。
- **支持你所在司法管辖区要求的数据主体权利**（GDPR/CCPA 及类似法规）：根据请求导出、更正和删除数据。这些都是工程功能——在设计模式时，应确保用户数据是*可查找的*且*可擦除的*，而不是不可逆地散落在各个系统中。
- **在收集数据或与第三方共享数据之前获得同意**，并确保该同意可审计。将 PII 发送给分析、广告或 LLM 供应商属于“共享”——必须以用户的选择为前提，并且供应商需要签署数据处理协议。
- **根据本地情况设置默认值，不要硬编码某一地区的法律。** 数据驻留要求和规则会因用户所在地而异；应将策略设计为可配置的边界，而不是固定假设。

当数据跨越信任边界时，应将其视为不可信数据进行验证（参见上文的输入验证）；当隐私事件导致个人数据暴露时，泄露通知时限也是事后复盘的一部分——请遵循 `debugging-and-error-recovery` 技能。

## 保护 AI / LLM 功能

如果你的应用调用 LLM——例如聊天机器人、摘要生成器、智能体或 RAG——它就会引入新的攻击面。请将其映射到 [OWASP LLM 应用十大风险 (2025)](https://genai.owasp.org/llm-top-10/)：

- **将所有模型输出视为不可信输入（LLM05：输出处理不当）。** 绝不要将 LLM 输出直接传入 `eval`、SQL、shell、`innerHTML` 或文件路径。应像处理原始用户输入一样，对其进行严格的验证和编码。
- **假设提示词可能被劫持（LLM01：提示词注入）。** 上下文窗口中的不可信文本——用户消息、抓取的网页、PDF——都可能携带指令。系统提示词并非安全边界；应在代码中而非提示词中实施权限控制。
- **不要在提示词中包含密钥和其他用户的数据（LLM02 / LLM07）。** 上下文中的任何内容都可能被复述出来。不要将 API 密钥、跨租户数据或完整的系统提示词放在模型可能重复输出的位置。
- **限制工具和智能体的权限（LLM06：过度代理权）。** 将工具权限限定在最低必要范围，对破坏性或不可逆操作要求确认，并验证每个工具参数。
- **限制资源消耗（LLM10：无界消耗）。** 限制 token 数、请求速率以及循环/递归深度，防止恶意构造的输入导致成本激增或系统挂起。
- **隔离检索数据（LLM08：向量与嵌入弱点）。** 在 RAG 中，将向量存储视为信任边界：按租户隔离嵌入，防止一个用户检索到另一个用户的数据；并在建立索引前验证文档，防止被投毒的内容操纵回答。

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

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “这是内部工具，安全性并不重要” | 内部工具同样会遭到入侵。攻击者会瞄准最薄弱的环节。 |
| “我们以后再加安全措施” | 事后补充安全措施的难度是在设计之初构建安全性的 10 倍。现在就加上。 |
| “不会有人试图利用这个漏洞” | 自动化扫描器会发现它。隐匿式安全并不是真正的安全。 |
| “框架会处理安全问题” | 框架提供的是工具，而不是保障。你仍然需要正确使用这些工具。 |
| “这只是个原型” | 原型会变成生产系统。从第一天起就要养成安全习惯。 |
| “在这里做威胁建模太小题大做了” | 花五分钟思考“我会如何攻击它？”，可以避免那些任何控制措施都无法在事后修补的设计缺陷。 |
| “这只是 LLM 输出，不过是文本而已” | 这些“文本”可能是 SQL 语句、脚本标签或 shell 命令。要像对待任何不可信输入一样对待它。 |
| “审计通过了，所以依赖项是安全的” | 审计只能匹配已知的安全公告。它无法检测新近变为恶意的软件包，也无法保证未经审查的安装脚本可以安全执行。 |
| “现在先收集起来，以后可能会用到” | 你未持有的数据无法被泄露、传唤调取或误删。“可能会用到”代表的是泄露影响范围，而不是收集目的。 |
| “我们会手动处理删除请求” | 手动擦除会遗漏备份、缓存和分析系统中的副本。如果数据模式无法定位某位用户的数据，你就无法履行该请求——应在设计时就为此做好准备。 |
| “合规是法务的问题，不是我们的问题” | 导出、删除、保留和同意都涉及数据模式和代码。如果你已经把 PII 散布到了十个系统中，法务无法在事后将这些能力强行附加上去。 |

## 危险信号

- 将用户输入直接传递给数据库查询、shell 命令或 HTML 渲染
- 源代码或提交历史中存在密钥
- API 端点缺少身份认证或授权检查
- 缺少 CORS 配置，或将来源配置为通配符（`*`）
- 身份认证端点没有速率限制
- 向用户暴露堆栈跟踪或内部错误
- 依赖项存在已知的严重漏洞、同一安装边界内存在相互冲突的锁文件、安装过程不可复现，或全面放行脚本执行
- 服务器获取用户提供的 URL 时未使用允许列表（SSRF）
- 将 LLM/模型输出传入查询、DOM、shell 或 `eval`
- 将密钥、PII 或完整的系统提示词放入 LLM 上下文窗口
- 收集个人数据时没有明确用途、保留期限或删除路径
- 在未经用户同意或没有数据处理协议的情况下，将 PII 发送给分析、广告或 LLM 供应商
- “删除我的账户”操作仅仅切换一个标志，而个人数据仍残留在存储系统和备份中

## 验证

实现与安全相关的代码后：

- [ ] 原生审计中不存在未缓解且可达的严重/高危问题；CI 保留权威锁文件，并阻止未经审查的依赖项脚本
- [ ] 源代码或 git 历史中不存在密钥
- [ ] 在系统边界对所有用户输入进行验证
- [ ] 在每个受保护的端点上检查身份认证和授权
- [ ] 响应中包含安全标头（使用浏览器 DevTools 检查）
- [ ] 错误响应不暴露内部细节
- [ ] 身份认证端点已启用速率限制
- [ ] 服务器端 URL 获取操作已通过允许列表验证（无 SSRF）
- [ ] LLM/模型输出在使用前经过验证和编码（如果存在 AI 功能）
- [ ] 个人数据已分类、按照明确用途最小化收集，并设有保留期限
- [ ] 删除和导出请求可端到端正常执行（包括备份、缓存和分析系统中的副本）