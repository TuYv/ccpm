---
name: performance-optimization
description: Optimizes application performance across frontend, backend, queries, and databases. Use when performance requirements exist, when you suspect performance regressions, when Core Web Vitals or load times need improvement, when N+1 query patterns need fixing, or when profiling reveals bottlenecks.
---
# 性能优化

## 概述

先测量，再优化。没有测量的性能工作就是猜测——而猜测会导致过早优化，徒增复杂性，却无法改善真正重要的方面。首先进行性能分析，找出真正的瓶颈，修复它，然后再次测量。只优化那些经测量证明重要的部分。

## 何时使用

- 规范中存在性能要求（加载时间预算、响应时间 SLA）
- 用户或监控报告存在运行缓慢的情况
- Core Web Vitals 分数低于阈值
- 你怀疑某项变更引入了性能回退
- 构建需要处理大型数据集或高流量的功能

**何时不应使用：** 在有证据证明存在问题之前，不要进行优化。过早优化会增加复杂性，其代价可能高于获得的性能提升。

## Core Web Vitals 目标

| 指标 | 良好 | 需要改进 | 较差 |
|--------|------|-------------------|------|
| **LCP**（最大内容绘制） | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| **INP**（交互到下一次绘制） | ≤ 200ms | ≤ 500ms | > 500ms |
| **CLS**（累积布局偏移） | ≤ 0.1 | ≤ 0.25 | > 0.25 |

## 优化工作流

```
1. MEASURE  → Establish baseline with real data
2. IDENTIFY → Find the actual bottleneck (not assumed)
3. FIX      → Address the specific bottleneck
4. VERIFY   → Measure again; keep or revert
5. GUARD    → Add monitoring or tests to prevent regression
```

### 第 1 步：测量

两种互补的方法——两者都要使用：

- **合成测试（Lighthouse、DevTools Performance 选项卡）：** 条件可控，可复现。最适合用于 CI 性能回退检测和隔离特定问题。
- **RUM（web-vitals 库、CrUX）：** 真实环境中的真实用户数据。要验证修复是否真正改善了用户体验，必须使用这种方法。

**前端：**
```bash
# Synthetic: Lighthouse in Chrome DevTools (or CI)
# Chrome DevTools → Performance tab → Record
# Chrome DevTools MCP → Performance trace

# RUM: Web Vitals library in code
import { onLCP, onINP, onCLS } from 'web-vitals';

onLCP(console.log);
onINP(console.log);
onCLS(console.log);
```

**后端：**
```bash
# Response time logging
# Application Performance Monitoring (APM)
# Database query logging with timing

# Simple timing
console.time('db-query');
const result = await db.query(...);
console.timeEnd('db-query');
```

### 从何处开始测量

根据症状决定首先测量什么：

```
What is slow?
├── First page load
│   ├── Large bundle? --> Measure bundle size, check code splitting
│   ├── Slow server response? --> Measure TTFB in DevTools Network waterfall
│   │   ├── DNS long? --> Add dns-prefetch / preconnect for known origins
│   │   ├── TCP/TLS long? --> Enable HTTP/2, check edge deployment, keep-alive
│   │   └── Waiting (server) long? --> Profile backend, check queries and caching
│   └── Render-blocking resources? --> Check network waterfall for CSS/JS blocking
├── Interaction feels sluggish
│   ├── UI freezes on click? --> Profile main thread, look for long tasks (>50ms)
│   ├── Form input lag? --> Check re-renders, controlled component overhead
│   └── Animation jank? --> Check layout thrashing, forced reflows
├── Page after navigation
│   ├── Data loading? --> Measure API response times, check for waterfalls
│   └── Client rendering? --> Profile component render time, check for N+1 fetches
└── Backend / API
    ├── Single endpoint slow? --> Profile database queries, check indexes
    ├── All endpoints slow? --> Check connection pool, memory, CPU
    └── Intermittent slowness? --> Check for lock contention, GC pauses, external deps
```

### 第 2 步：识别瓶颈

各类别中的常见瓶颈：

**前端：**

| 症状 | 可能原因 | 排查方法 |
|---------|-------------|---------------|
| LCP 较慢 | 图片过大、资源阻塞渲染、服务器响应慢 | 检查网络瀑布图和图片大小 |
| CLS 较高 | 图片未指定尺寸、内容延迟加载、字体切换 | 检查布局偏移归因 |
| INP 较差 | 主线程上运行繁重的 JavaScript、大规模 DOM 更新 | 检查 Performance 跟踪记录中的长任务 |
| 初始加载缓慢 | 打包体积过大、网络请求过多 | 检查打包体积和代码拆分 |

**后端：**

| 症状 | 可能原因 | 排查方法 |
|---------|-------------|---------------|
| API 响应缓慢 | N+1 查询、缺少索引、查询未优化 | 检查数据库查询日志 |
| 内存持续增长 | 引用泄漏、缓存无上限、负载数据过大 | 分析堆快照 |
| CPU 使用率突增 | 同步执行繁重计算、正则表达式回溯 | 进行 CPU 性能分析 |
| 延迟较高 | 缺少缓存、重复计算、网络跳数过多 | 跟踪请求在整个技术栈中的传递过程 |

### 第 3 步：修复常见反模式

#### N+1 查询（后端）

```typescript
// BAD: N+1 — one query per task for the owner
const tasks = await db.tasks.findMany();
for (const task of tasks) {
  task.owner = await db.users.findUnique({ where: { id: task.ownerId } });
}

// GOOD: Single query with join/include
const tasks = await db.tasks.findMany({
  include: { owner: true },
});
```

#### 无限制获取数据

```typescript
// BAD: Fetching all records
const allTasks = await db.tasks.findMany();

// GOOD: Paginated with limits
const tasks = await db.tasks.findMany({
  take: 20,
  skip: (page - 1) * 20,
  orderBy: { createdAt: 'desc' },
});
```

#### 未利用索引的查询

“添加索引”只是猜测。查询计划才是衡量依据：

```sql
EXPLAIN ANALYZE
SELECT id, title FROM tasks
WHERE owner_id = 42 ORDER BY created_at DESC LIMIT 20;
```

输出中的以下三项决定了修复方式：

| 看到的内容 | 含义 |
|---|---|
| 在预期使用索引的大表上出现 `Seq Scan` | 没有可用于此谓词的索引 |
| 估算的 `rows=` 与实际值相差一个数量级 | 统计信息已过期；查询规划器正在基于错误信息做出选择 |
| 扫描节点上方出现 `Sort` 节点 | 索引覆盖了过滤条件，但未覆盖 `ORDER BY` |

应针对**查询的结构**建立索引，而不是孤立地针对某一列建立索引。在复合索引中，等值查询列应放在前面，范围查询列或排序列放在后面：

```sql
CREATE INDEX idx_tasks_owner_created ON tasks (owner_id, created_at DESC);
```

**索引无法发挥作用的情况：**

| 情况 | 原因 |
|---|---|
| 选择性低，查询占主导地位的值（某个 `status` 列中 95% 的值都是 `active`，并按 `active` 过滤） | 顺序扫描确实成本更低；查询规划器会忽略索引。按稀有值过滤则情况相反，部分索引很适合这种场景 |
| 前导通配符（`LIKE '%term'`） | B-tree 无法在没有前缀的情况下执行查找；需要使用 trigram 或全文索引 |
| 对列使用函数（`WHERE lower(email) = ?`） | 普通列索引无法使用；应改为对表达式建立索引 |
| 写入密集型表 | 每个索引都会增加每次 `INSERT`/`UPDATE` 的开销；不仅要衡量读取收益，也要衡量写入成本 |

之后重新运行 `EXPLAIN ANALYZE`。未改变执行计划的索引属于应回滚的更改（步骤 4），而且它并非没有代价：每次写入时仍然会产生开销。

#### 连接池耗尽

其特征非常明显：**所有**端点会同时变慢，耗时主要花在等待连接上，而不是执行操作上，并且数据库报告的大多是空闲会话。

```typescript
// BAD: a pool per request or per module — under serverless this multiplies
// by instance count and exhausts the database's connection limit
// GOOD: one pool per process, sized against the database's ceiling
const pool = new Pool({
  max: 10,                        // instances × max must stay under max_connections
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000, // fail fast instead of queueing forever
});
```

**更大并不意味着更快。** 如果连接池大于数据库能够并发执行的连接数，只会将队列从应用转移到数据库中，使其更难被发现。当实例数量没有上限时（无服务器、自动扩缩容），正确的解决方案是使用能够复用连接的代理（pgbouncer、RDS Proxy），而不是提高 `max`。

#### 缺少图像优化（前端）

```html
<!-- BAD: No dimensions, no format optimization -->
<img src="/hero.jpg" />

<!-- GOOD: Hero / LCP image — art direction + resolution switching, high priority -->
<!--
  Two techniques combined:
  - Art direction (media): different crop/composition per breakpoint
  - Resolution switching (srcset + sizes): right file size per screen density
-->
<picture>
  <!-- Mobile: portrait crop (8:10) -->
  <source
    media="(max-width: 767px)"
    srcset="/hero-mobile-400.avif 400w, /hero-mobile-800.avif 800w"
    sizes="100vw"
    width="800"
    height="1000"
    type="image/avif"
  />
  <source
    media="(max-width: 767px)"
    srcset="/hero-mobile-400.webp 400w, /hero-mobile-800.webp 800w"
    sizes="100vw"
    width="800"
    height="1000"
    type="image/webp"
  />
  <!-- Desktop: landscape crop (2:1) -->
  <source
    srcset="/hero-800.avif 800w, /hero-1200.avif 1200w, /hero-1600.avif 1600w"
    sizes="(max-width: 1200px) 100vw, 1200px"
    width="1200"
    height="600"
    type="image/avif"
  />
  <source
    srcset="/hero-800.webp 800w, /hero-1200.webp 1200w, /hero-1600.webp 1600w"
    sizes="(max-width: 1200px) 100vw, 1200px"
    width="1200"
    height="600"
    type="image/webp"
  />
  <img
    src="/hero-desktop.jpg"
    width="1200"
    height="600"
    fetchpriority="high"
    alt="Hero image description"
  />
</picture>

<!-- GOOD: Below-the-fold image — lazy loaded + async decoding -->
<img
  src="/content.webp"
  width="800"
  height="400"
  loading="lazy"
  decoding="async"
  alt="Content image description"
/>
```

#### 不必要的重新渲染（React）

```tsx
// BAD: Creates new object on every render, causing children to re-render
function TaskList() {
  return <TaskFilters options={{ sortBy: 'date', order: 'desc' }} />;
}

// GOOD: Stable reference
const DEFAULT_OPTIONS = { sortBy: 'date', order: 'desc' } as const;
function TaskList() {
  return <TaskFilters options={DEFAULT_OPTIONS} />;
}

// Use React.memo for expensive components
const TaskItem = React.memo(function TaskItem({ task }: Props) {
  return <div>{/* expensive render */}</div>;
});

// Use useMemo for expensive computations
function TaskStats({ tasks }: Props) {
  const stats = useMemo(() => calculateStats(tasks), [tasks]);
  return <div>{stats.completed} / {stats.total}</div>;
}
```

#### Bundle 体积过大

```typescript
// Modern bundlers (Vite, webpack 5+) handle named imports with tree-shaking automatically,
// provided the dependency ships ESM and is marked `sideEffects: false` in package.json.
// Profile before changing import styles — the real gains come from splitting and lazy loading.

// GOOD: Dynamic import for heavy, rarely-used features
const ChartLibrary = lazy(() => import('./ChartLibrary'));

// GOOD: Route-level code splitting wrapped in Suspense
const SettingsPage = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <SettingsPage />
    </Suspense>
  );
}
```

#### 缺少缓存（后端）

缓存那些生成成本高、读取频率远高于变化频率的数据。缓存一个本来就很快的查询，只会增加一次网络跳转、引入数据过期问题，并增加需要维护的驱逐策略，却没有带来任何收益。

**有意识地选择缓存层：**

| 层 | 可见范围 | 适用场景 | 成本 |
|---|---|---|---|
| 进程内（`Map`、LRU） | 单个实例 | 数据量小、访问频繁，并且可以接受每个实例的数据过期状态不同 | 每个实例独立漂移；失效操作只能触及一个实例 |
| 共享（Redis、Memcached） | 所有实例 | 实例之间必须保持一致，或该值重新计算的成本很高 | 增加一次网络跳转，以及一个需要运行和监控的服务 |
| CDN / edge | 所有用户，按 URL 区分 | 响应是公开的，并且对于给定键完全相同 | 失效是难点；假设无法快速撤回错误响应 |

```typescript
// Cache frequently-read, rarely-changed data
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cachedConfig: AppConfig | null = null;
let cacheExpiry = 0;

async function getAppConfig(): Promise<AppConfig> {
  if (cachedConfig && Date.now() < cacheExpiry) {
    return cachedConfig;
  }
  cachedConfig = await db.config.findFirst();
  cacheExpiry = Date.now() + CACHE_TTL;
  return cachedConfig;
}

// HTTP caching headers for static assets
app.use('/static', express.static('public', {
  maxAge: '1y',           // Cache for 1 year
  immutable: true,        // Never revalidate (use content hashing in filenames)
}));

// Cache-Control for API responses
res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
```

**键的设计决定正确性。** 每个会改变响应的输入都必须包含在键中：租户、区域设置、权限、功能开关。遗漏查看者信息的键，正是导致一个用户的数据被提供给另一个用户的原因，而这类问题往往会以性能优化的名义上线。

**选择一种失效策略，而不是三种：**

| 策略 | 权衡 |
|---|---|
| TTL | 最简单。你需要接受最长达到 TTL 的数据过期时间，因此应明确说明可接受的时间窗口 |
| 基于事件或标签 | 写入时即可保持最新，但现在写入方必须了解缓存拓扑 |
| 版本化键（`user:42:profile:v7`） | 永不执行失效，只需停止读取旧键。在被驱逐前会占用内存 |

**防止缓存击穿。** 一个热点键过期后，所有并发请求会同时未命中，源站会瞬间承受全部负载；缓存因此会从防止故障的机制变成导致故障的机制。可以在单个请求重新计算期间继续提供旧数据（`stale-while-revalidate`），或者让并发未命中请求共享一个正在执行的 promise，使 N 个等待者只触发一次重新计算。

**不要缓存：**任何过期会导致正确性问题的内容（结算余额、权限、结账时的库存），或使用无法标识用户的键存储的用户级数据。有关请求合并、写入策略、负缓存以及缓存检查清单，请参阅 `../../references/performance-checklist.md`。

### 步骤 4：验证（保留或还原）

修复在重新测量之前都只是一个假设。本步骤决定它是否能够保留。

**按照测量基线的方式重新测量：**使用相同的命令、相同的条件、相同的固定预算（挂钟时间、样本数量或请求数量）。在冷缓存上取得的基线与在热缓存上取得的结果进行比较，测量到的是缓存，而不是你的改动。

**一次只改动一件事。** 三项优化同时落地只能得到一个数字，你无法确定结果归因于哪一项。如果它们必须一起发布，先分别单独测量。

**要超越噪声，而不只是超越平均值。** 重复测量，并将变化量与每次运行之间的方差进行比较。在 ±5% 的方差范围内取得 3% 的提升并不算提升；那只是另一组样本。

然后严格按照以下规则决定：

| 与基线相比的结果 | 操作 |
|---|---|
| 超过阈值，测试通过 | **保留。** 在提交消息中写明改动前后的数值。 |
| 处于噪声范围内（没有可测量的变化） | **还原。** |
| 变差 | **还原。** |
| 有所改善，但某项测试失败 | **还原。** 这是披着胜利外衣的回归。 |

**“中性”意味着还原，而不是保留。** 这是团队会跳过的一步：改动已经写好了，丢弃它让人觉得浪费，于是它未经测量就被合入，代码库不断累积从未带来任何收益的复杂性。你保留的代码，就必须永远维护。让它证明自己值得保留。

**正确性优先于指标。** 测试套件必须保持通过，*并且*数值必须发生改善。一项通过丢弃产品所需的工作而获胜的“优化”（跳过验证、缓存必须保持最新的内容、移除起关键作用的 `await`）是回归，而不是胜利。

#### 记录每一次尝试，包括已还原的尝试

已还原的工作不会在 git 历史中留下痕迹，这正是同一个无效想法会在下个季度再次被尝试的原因。保留一份简短的记录，让被放弃的想法继续被放弃：

| 想法 | 基线 → 结果 | 结论 | 原因 |
|---|---|---|---|
| 记忆化行组件 | INP 240ms → 235ms | 已还原 | 处于噪声范围内（±15ms）。行组件不是瓶颈。 |
| 对列表进行虚拟化 | INP 240ms → 90ms | 已保留 | 跟踪记录中的长任务消失了。 |
| 预连接到 API 源站 | LCP 2.8s → 2.8s | 已还原 | 已经是同源。 |

在 PR 描述中增加一个章节，或在仓库中添加一个 `PERF.md`，都可以。重要的是，下一个人（或下一个代理）在提出实验之前会先阅读它，而不会重新运行一个已经失败过的实验。

## 性能预算

设定预算并强制执行：

```
JavaScript bundle: < 200KB gzipped (initial load)
CSS: < 50KB gzipped
Images: < 200KB per image (above the fold)
Fonts: < 100KB total
API response time: < 200ms (p95)
Time to Interactive: < 3.5s on 4G
Lighthouse Performance score: ≥ 90
```

**在 CI 中强制执行：**
```bash
# Bundle size check
npx bundlesize --config bundlesize.config.json

# Lighthouse CI
npx lhci autorun
```

## 另请参阅

有关详细的性能检查清单、优化命令和反模式参考，请参阅 `../../references/performance-checklist.md`。


## 常见的自我辩解

| 自我辩解 | 现实 |
|---|---|
| "我们以后再优化" | 性能债务会不断累积。现在修复明显的反模式，将微优化推迟。 |
| "在我的机器上运行很快" | 你的机器不是用户的机器。应在有代表性的硬件和网络环境中进行性能分析。 |
| "这个优化显而易见" | 如果你没有进行测量，就无法确定。先进行性能分析。 |
| "用户不会注意到 100ms" | 研究表明，100ms 的延迟会影响转化率。用户的感知比你想象的更敏锐。 |
| "框架会处理性能问题" | 框架可以避免某些问题，但无法修复 N+1 查询或过大的包。 |
| "查询很慢，加个索引就行" | 先查看执行计划。索引可能已经存在且无法使用，而且每个索引都会永久增加写入成本。 |
| "直接缓存就行" | 缓存一个本来就很廉价的调用毫无收益，还会引入数据过时问题。应缓存开销大且读取远多于写入的内容。 |
| "增大连接池吧，我们快没有连接了" | 连接池大小超过数据库的处理能力，只会把队列转移到不那么显眼的地方。找出是什么占用了连接。 |
| "效果不明显，但也没什么坏处" | 没有带来收益的改动就应该回滚。你将永久承担其维护成本，却一无所获。 |
| "代码都已经写好了，留着也无妨" | 这是沉没成本。测量结果并不在意这项改动花了多长时间编写。 |
| "改进效果显而易见，不需要重新测量" | 那么重新测量的成本很低，而且能证明这一点。未经测量的所谓收益，正是无效复杂性被引入的方式。 |

## 危险信号

- 没有性能分析数据来证明其合理性的优化
- 数据获取中的 N+1 查询模式
- 添加索引前后都没有查询执行计划来证明其合理性
- 缓存键遗漏了响应所依赖的输入（租户、区域设置、查看者）
- 缓存没有明确的数据过时窗口，也没有失效策略
- 因连接耗尽而增大连接池，却没有找出是什么占用了连接
- 列表接口没有分页
- 图片没有尺寸、延迟加载或响应式尺寸
- 包大小不断增长，却没有进行审查
- 生产环境中没有性能监控
- 到处使用 `React.memo` 和 `useMemo`（过度使用和使用不足一样糟糕）
- 没有重新测量来证明其合理性的优化却被保留
- 将多个优化合并到一次测量中，导致无法将结果归因于某个单独的改动
- 所谓的“收益”需要修改、跳过或删除测试才能实现
- 由于没有记录第一次尝试，同一个失败的优化被重复尝试

## 验证

完成任何与性能相关的改动后：

- [ ] 存在改动前后的测量结果（具体数值）
- [ ] 结果以与基线相同的方式重新测量（相同的命令、相同的条件）
- [ ] 改进幅度超过多次运行之间的波动，而不仅仅是超过平均值
- [ ] 未超过基线的改动已回滚，而不是作为无收益改动保留
- [ ] 所有尝试都已记录，无论保留还是回滚，避免重复尝试已经失败的想法
- [ ] 已识别并解决具体的瓶颈
- [ ] Core Web Vitals 处于“Good”阈值范围内
- [ ] 包大小没有显著增加
- [ ] 新增的数据获取代码中没有 N+1 查询
- [ ] 任何新索引都有前后查询执行计划作为依据，并且已考虑其写入成本
- [ ] 任何新缓存都说明了缓存键的组成以及数据如何过时
- [ ] CI 中的性能预算检查通过（如果已配置）
- [ ] 现有测试仍然通过（优化没有破坏行为）