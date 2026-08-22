---
name: kaizen
description: Use when Code implementation and refactoring, architecturing or designing systems, process and workflow improvements, error handling and validation. Provide tehniquest to avoid over-engineering and apply iterative improvements.
---
# 改善（Kaizen）：持续改进

践行持续改进思维——建议进行小步迭代式改进，采用防错设计，遵循既有模式，避免过度工程化；自动应用这些原则，以指导质量与简洁性。

## 概述

持续进行小幅改进。通过设计实现防错。遵循行之有效的方法。只构建真正需要的内容。

**核心原则：** 许多小改进胜过一次大变革。在设计阶段预防错误，而不是事后修复。

## 何时使用

**始终应用于：**

- 代码实现与重构
- 架构与设计决策
- 流程与工作流改进
- 错误处理与验证

**理念：** 通过渐进式进步与预防来实现质量，而不是投入巨大精力追求完美。

## 四大支柱

### 1. 持续改进（Kaizen）

小而频繁的改进会累积成巨大的收益。

#### 原则

**渐进式改进优于颠覆式变革：**

- 做出能够提升质量的最小可行变更
- 每次只进行一项改进
- 在进行下一项改进前验证每次变更
- 通过小胜利积累动力

**始终让代码比之前更好：**

- 遇到小问题时随手修复
- 在工作过程中进行重构（限定在范围内）
- 更新过时的注释
- 发现无用代码时将其删除

**迭代式优化：**

- 第一版：让它能工作
- 第二轮：让它清晰
- 第三轮：让它高效
- 不要试图一次性完成这三步

<Good>
```typescript
// Iteration 1: Make it work
const calculateTotal = (items: Item[]) => {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
};

// Iteration 2: Make it clear (refactor)
const calculateTotal = (items: Item[]): number => {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Iteration 3: Make it robust (add validation)
const calculateTotal = (items: Item[]): number => {
  if (!items?.length) return 0;
  
  return items.reduce((total, item) => {
    if (item.price < 0 || item.quantity < 0) {
      throw new Error('Price and quantity must be non-negative');
    }
    return total + (item.price * item.quantity);
  }, 0);
};

```
每一步都是完整的、经过测试的，并且可以正常工作
</Good>

<Bad>
```typescript
// Trying to do everything at once
const calculateTotal = (items: Item[]): number => {
  // Validate, optimize, add features, handle edge cases all together
  if (!items?.length) return 0;
  const validItems = items.filter(item => {
    if (item.price < 0) throw new Error('Negative price');
    if (item.quantity < 0) throw new Error('Negative quantity');
    return item.quantity > 0; // Also filtering zero quantities
  });
  // Plus caching, plus logging, plus currency conversion...
  return validItems.reduce(...); // Too many concerns at once
};
```

令人不堪重负、容易出错且难以验证
</Bad>

#### 实践方式

**实现功能时：**

1. 从能够正常工作的最简单版本开始
2. 添加一项改进（错误处理、验证等）
3. 测试并验证
4. 如果时间允许，重复上述步骤
5. 不要试图立即做到完美

**重构时：**

- 每次只修复一种代码异味
- 每完成一项改进就提交一次
- 始终确保测试通过
- 达到“足够好”时停止（收益递减）

**审查代码时：**

- 建议渐进式改进（而不是重写）
- 优先级：关键 → 重要 → 锦上添花
- 首先关注影响最大的改动
- 即使并不完美，也要接受“比以前更好”

### 2. Poka-Yoke（防错）

设计能够在编译/设计阶段而非运行时防止错误的系统。

#### 原则

**让错误不可能发生：**

- 类型系统捕获错误
- 编译器强制执行契约
- 使无效状态无法表示
- 尽早捕获错误（在进入生产环境之前）

**以安全为目标进行设计：**

- 快速且明确地失败
- 提供有用的错误消息
- 让正确的路径显而易见
- 让错误的路径难以选择

**分层防御：**

1. 类型系统（编译时）
2. 验证（运行时，尽早进行）
3. 守卫（前置条件）
4. 错误边界（优雅降级）

#### 类型系统防错

<Good>
```typescript
// Error: string status can be any value
type OrderBad = {
  status: string; // Can be "pending", "PENDING", "pnding", anything!
  total: number;
};

// Good: Only valid states possible
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';
type Order = {
  status: OrderStatus;
  total: number;
};

// Better: States with associated data
type Order =
  | { status: 'pending'; createdAt: Date }
  | { status: 'processing'; startedAt: Date; estimatedCompletion: Date }
  | { status: 'shipped'; trackingNumber: string; shippedAt: Date }
  | { status: 'delivered'; deliveredAt: Date; signature: string };

// Now impossible to have shipped without trackingNumber

```
类型系统可以防止整个类别的错误
</Good>

<Good>
```typescript
// Make invalid states unrepresentable
type NonEmptyArray<T> = [T, ...T[]];

const firstItem = <T>(items: NonEmptyArray<T>): T => {
  return items[0]; // Always safe, never undefined!
};

// Caller must prove array is non-empty
const items: number[] = [1, 2, 3];
if (items.length > 0) {
  firstItem(items as NonEmptyArray<number>); // Safe
}
```

函数签名可保证安全性
</Good>

#### 验证防错

<Good>
```typescript
// Error: Validation after use
const processPayment = (amount: number) => {
  const fee = amount * 0.03; // Used before validation!
  if (amount <= 0) throw new Error('Invalid amount');
  // ...
};

// Good: Validate immediately
const processPayment = (amount: number) => {
  if (amount <= 0) {
    throw new Error('Payment amount must be positive');
  }
  if (amount > 10000) {
    throw new Error('Payment exceeds maximum allowed');
  }
  
  const fee = amount * 0.03;
  // ... now safe to use
};

// Better: Validation at boundary with branded type
type PositiveNumber = number & { readonly __brand: 'PositiveNumber' };

const validatePositive = (n: number): PositiveNumber => {
  if (n <= 0) throw new Error('Must be positive');
  return n as PositiveNumber;
};

const processPayment = (amount: PositiveNumber) => {
  // amount is guaranteed positive, no need to check
  const fee = amount * 0.03;
};

// Validate at system boundary
const handlePaymentRequest = (req: Request) => {
  const amount = validatePositive(req.body.amount); // Validate once
  processPayment(amount); // Use everywhere safely
};

```
在边界处验证一次，其他所有地方都可安全使用
</Good>

#### 守卫条件与前置条件

<Good>
```typescript
// Early returns prevent deeply nested code
const processUser = (user: User | null) => {
  if (!user) {
    logger.error('User not found');
    return;
  }
  
  if (!user.email) {
    logger.error('User email missing');
    return;
  }
  
  if (!user.isActive) {
    logger.info('User inactive, skipping');
    return;
  }
  
  // Main logic here, guaranteed user is valid and active
  sendEmail(user.email, 'Welcome!');
};
```

守卫条件使假设变得明确并得到强制执行
</Good>

#### 配置防错

<Good>
```typescript
// Error: Optional config with unsafe defaults
type ConfigBad = {
  apiKey?: string;
  timeout?: number;
};

const client = new APIClient({ timeout: 5000 }); // apiKey missing!

// Good: Required config, fails early
type Config = {
  apiKey: string;
  timeout: number;
};

const loadConfig = (): Config => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY environment variable required');
  }
  
  return {
    apiKey,
    timeout: 5000,
  };
};

// App fails at startup if config invalid, not during request
const config = loadConfig();
const client = new APIClient(config);

```
在启动时失败，而不是在生产环境中失败
</Good>

#### 实践方法

**设计 API 时：**
- 使用类型约束输入
- 使无效状态无法表示
- 返回 Result<T, E>，而不是抛出异常
- 在类型中记录前置条件

**处理错误时：**
- 在系统边界进行验证
- 使用守卫条件检查前置条件
- 快速失败并提供清晰的消息
- 记录上下文以便调试

**进行配置时：**
- 优先使用必填项，而不是带默认值的可选项
- 在启动时验证所有配置
- 如果配置无效，则让部署失败
- 不允许不完整的配置

### 3. 标准化工作

遵循既定模式。记录有效做法。让良好实践易于遵循。

#### 原则

**一致性优于炫技：**
- 遵循现有代码库的模式
- 不要重新发明已有解决方案的问题
- 仅在新模式明显更好时才采用
- 团队应就新模式达成一致

**文档与代码共存：**
- 使用 README 说明设置和架构
- 使用 CLAUDE.md 说明 AI 编码约定
- 注释解释“为什么”，而不是“是什么”
- 为复杂模式提供示例

**自动执行标准：**
- 使用代码检查工具强制执行风格规范
- 使用类型检查强制执行契约
- 使用测试验证行为
- 使用 CI/CD 强制执行质量门禁

#### 遵循模式

<Good>
```typescript
// Existing codebase pattern for API clients
class UserAPIClient {
  async getUser(id: string): Promise<User> {
    return this.fetch(`/users/${id}`);
  }
}

// New code follows the same pattern
class OrderAPIClient {
  async getOrder(id: string): Promise<Order> {
    return this.fetch(`/orders/${id}`);
  }
}
```

一致性使代码库具有可预测性
</Good>

<Bad>
```typescript
// Existing pattern uses classes
class UserAPIClient { /* ... */ }

// New code introduces different pattern without discussion
const getOrder = async (id: string): Promise<Order> => {
  // Breaking consistency "because I prefer functions"
};

```
不一致会造成困惑
</Bad>

#### 错误处理模式

<Good>
```typescript
// Project standard: Result type for recoverable errors
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// All services follow this pattern
const fetchUser = async (id: string): Promise<Result<User, Error>> => {
  try {
    const user = await db.users.findById(id);
    if (!user) {
      return { ok: false, error: new Error('User not found') };
    }
    return { ok: true, value: user };
  } catch (err) {
    return { ok: false, error: err as Error };
  }
};

// Callers use consistent pattern
const result = await fetchUser('123');
if (!result.ok) {
  logger.error('Failed to fetch user', result.error);
  return;
}
const user = result.value; // Type-safe!
```

整个代码库采用统一模式
</Good>

#### 文档标准

<Good>
```typescript
/**
 * Retries an async operation with exponential backoff.
 *
 * Why: Network requests fail temporarily; retrying improves reliability
 * When to use: External API calls, database operations
 * When not to use: User input validation, internal function calls
 *
 * @example
 * const result = await retry(
 *   () => fetch('https://api.example.com/data'),
 *   { maxAttempts: 3, baseDelay: 1000 }
 * );
 */
const retry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> => {
  // Implementation...
};
```
说明原因、适用时机和使用方法
</Good>

#### 实践方式

**添加新模式之前：**

- 在代码库中搜索类似问题的现有解决方案
- 查看 CLAUDE.md 中的项目约定
- 如果要打破现有模式，请与团队讨论
- 引入新模式时更新文档

**编写代码时：**

- 与现有文件结构保持一致
- 使用相同的命名约定
- 遵循相同的错误处理方式
- 从相同位置导入

**审查时：**

- 检查是否与现有代码保持一致
- 指出代码库中的示例
- 建议与标准保持一致
- 如果形成了新标准，请更新 CLAUDE.md

### 4. 即时实现（JIT）

只构建当前所需的内容，不多也不少。避免过早优化和过度工程化。

#### 原则

**YAGNI（你不会需要它）：**

- 只实现当前需求
- 不添加“以防万一”的功能
- 不编写“以后可能会需要”的代码
- 删除基于臆测的内容

**采用能够奏效的最简单方案：**

- 从直接明了的解决方案开始
- 只在必要时增加复杂度
- 需求变化时进行重构
- 不要预判未来需求

**有测量结果后再优化：**

- 不要过早优化
- 优化前先进行性能分析
- 衡量变更的影响
- 接受“足够好”的性能

#### YAGNI 实践

<Good>
```typescript
// Current requirement: Log errors to console
const logError = (error: Error) => {
  console.error(error.message);
};
```
简单，满足当前需求
</Good>

<Bad>
```typescript
// Over-engineered for "future needs"
interface LogTransport {
  write(level: LogLevel, message: string, meta?: LogMetadata): Promise<void>;
}

class ConsoleTransport implements LogTransport { /*... */ }
class FileTransport implements LogTransport { /* ... */ }
class RemoteTransport implements LogTransport { /* ...*/ }

class Logger {
  private transports: LogTransport[] = [];
  private queue: LogEntry[] = [];
  private rateLimiter: RateLimiter;
  private formatter: LogFormatter;
  
  // 200 lines of code for "maybe we'll need it"
}

const logError = (error: Error) => {
  Logger.getInstance().log('error', error.message);
};

```
为想象中的未来需求进行构建
</Bad>

**何时应增加复杂性：**
- 当前需求确实需要
- 在使用过程中发现了痛点
- 出现了经测量确认的性能问题
- 出现了多个用例

<Good>
```typescript
// Start simple
const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

// Requirement evolves: support multiple currencies
const formatCurrency = (amount: number, currency: string): string => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  return `${symbols[currency]}${amount.toFixed(2)}`;
};

// Requirement evolves: support localization
const formatCurrency = (amount: number, locale: string): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: locale === 'en-US' ? 'USD' : 'EUR',
  }).format(amount);
};
```

仅在需要时增加复杂性
</Good>

#### 过早抽象

<Bad>
```typescript
// One use case, but building generic framework
abstract class BaseCRUDService<T> {
  abstract getAll(): Promise<T[]>;
  abstract getById(id: string): Promise<T>;
  abstract create(data: Partial<T>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<void>;
}

class GenericRepository<T> { /*300 lines */ }
class QueryBuilder<T> { /* 200 lines*/ }
// ... building entire ORM for single table

```
为不确定的未来进行大规模抽象
</Bad>

<Good>
```typescript
// Simple functions for current needs
const getUsers = async (): Promise<User[]> => {
  return db.query('SELECT * FROM users');
};

const getUserById = async (id: string): Promise<User | null> => {
  return db.query('SELECT * FROM users WHERE id = $1', [id]);
};

// When pattern emerges across multiple entities, then abstract
```

仅当某种模式已在 3 个以上的场景中得到验证时才进行抽象
</Good>

#### 性能优化

<Good>
```typescript
// Current: Simple approach
const filterActiveUsers = (users: User[]): User[] => {
  return users.filter(user => user.isActive);
};

// Benchmark shows: 50ms for 1000 users (acceptable)
// ✓ Ship it, no optimization needed

// Later: After profiling shows this is bottleneck
// Then optimize with indexed lookup or caching

```
基于测量结果进行优化，而非基于假设
</Good>

<Bad>
```typescript
// Premature optimization
const filterActiveUsers = (users: User[]): User[] => {
  // "This might be slow, so let's cache and index"
  const cache = new WeakMap();
  const indexed = buildBTreeIndex(users, 'isActive');
  // 100 lines of optimization code
  // Adds complexity, harder to maintain
  // No evidence it was needed
};
```

用复杂的解决方案处理未经测量的问题
</Bad>

#### 实践中

**实现时：**

- 解决眼前的问题
- 采用直截了当的方法
- 抵制“如果……会怎样”的思维
- 删除臆测性代码

**优化时：**

- 先分析性能，再进行优化
- 对优化前后进行测量
- 记录需要优化的原因
- 在测试中保留简单版本

**抽象时：**

- 等待出现 3 个以上的相似场景（三次法则）
- 使抽象尽可能简单
- 宁可重复，也不要采用错误的抽象
- 在模式明确时进行重构

## 与命令集成

Kaizen 技能指导你的工作方式。命令提供结构化分析：

- **`/why`**：根因分析（5 Whys）
- **`/cause-and-effect`**：多因素分析（Fishbone）
- **`/plan-do-check-act`**：迭代改进循环
- **`/analyse-problem`**：全面文档记录（A3）
- **`/analyse`**：智能方法选择（Gemba/VSM/Muda）

使用命令进行结构化问题解决。在日常开发中应用该技能。

## 危险信号

**违反持续改进原则：**

- “我稍后会重构它”（永远不会发生）
- 让代码变得比你接手时更糟
- 进行大爆炸式重写，而非渐进式改进

**违反 Poka-Yoke 原则：**

- “用户只要小心一点就行”
- 使用后才验证，而非使用前验证
- 可选配置没有验证机制

**违反标准化作业原则：**

- “我更喜欢按自己的方式做”
- 不检查现有模式
- 忽略项目约定

**违反 Just-In-Time 原则：**

- “也许有一天我们会需要它”
- 在实际使用前就构建框架
- 未经测量就进行优化

## 请记住

**Kaizen 注重：**

- 持续进行小幅改进
- 通过设计预防错误
- 遵循经过验证的模式
- 只构建所需的内容

**不注重：**

- 第一次尝试就做到完美
- 大规模重构项目
- 巧妙的抽象
- 过早优化

**思维方式：** 今天足够好，明天做得更好。不断重复。