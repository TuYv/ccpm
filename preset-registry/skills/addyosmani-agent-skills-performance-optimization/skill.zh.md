---
name: performance-optimization
description: Optimizes application performance across frontend, backend, queries, and databases. Use when performance requirements exist, when you suspect performance regressions, when Core Web Vitals or load times need improvement, when N+1 query patterns need fixing, or when profiling reveals bottlenecks.
---
# 性能优化

## 概述

先测量，再优化。没有测量的性能工作就是猜测——而猜测会导致过早优化，增加复杂性，却无法改善真正重要的方面。先进行性能分析，找出实际瓶颈，修复它，然后再次测量。只优化那些经测量证明真正重要的部分。

## 何时使用

- 规范中存在性能要求（加载时间预算、响应时间 SLA）
- 用户或监控报告行为缓慢
- Core Web Vitals 分数低于阈值
- 你怀疑某项变更引入了性能回退
- 构建用于处理大型数据集或高流量的功能

**何时不应使用：** 在有证据表明存在问题之前，不要进行优化。过早优化会增加复杂性，其成本可能高于所带来的性能收益。

## Core Web Vitals 目标

| 指标 | 良好 | 需要改进 | 较差 |
|--------|------|-------------------|------|
| **LCP**（最大内容绘制） | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| **INP**（交互到下一次绘制） | ≤ 200ms | ≤ 500ms | > 500ms |
| **CLS**（累积布局偏移） | ≤ 0.1 | ≤ 0.25 | > 0.25 |

## 优化工作流程

```
1. MEASURE  → Establish baseline with real data
2. IDENTIFY → Find the actual bottleneck (not assumed)
3. FIX      → Address the specific bottleneck
4. VERIFY   → Measure again; keep or revert
5. GUARD    → Add monitoring or tests to prevent regression
```

### 第 1 步：测量

两种互补的方法——两者都要使用：

- **合成测试（Lighthouse、DevTools Performance 选项卡）：** 条件可控、可复现。最适合在 CI 中检测性能回退和隔离特定问题。
- **RUM（web-vitals 库、CrUX）：** 真实条件下的真实用户数据。要验证修复是否真正改善了用户体验，这是必需的。

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

按类别划分的常见瓶颈：

**前端：**

| 症状 | 可能原因 | 排查方法 |
|---------|-------------|---------------|
| LCP 缓慢 | 图片过大、资源阻塞渲染、服务器响应缓慢 | 检查网络瀑布图和图片大小 |
| CLS 较高 | 图片未指定尺寸、内容延迟加载、字体切换 | 检查布局偏移归因 |
| INP 较差 | 主线程上运行繁重的 JavaScript、大规模 DOM 更新 | 检查性能跟踪中的长任务 |
| 初始加载缓慢 | 打包体积过大、网络请求过多 | 检查打包体积和代码拆分 |

**后端：**

| 症状 | 可能原因 | 排查方法 |
|---------|-------------|---------------|
| API 响应缓慢 | N+1 查询、缺少索引、查询未优化 | 检查数据库查询日志 |
| 内存持续增长 | 引用泄漏、缓存无上限、负载过大 | 分析堆快照 |
| CPU 使用率骤升 | 同步执行繁重计算、正则表达式回溯 | CPU 性能分析 |
| 延迟较高 | 缺少缓存、重复计算、网络跳转过多 | 跟踪请求在整个技术栈中的流转 |

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

#### 无限制的数据获取

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

#### 未使用索引的查询

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
| 估算的 `rows=` 与实际值相差一个数量级 | 统计信息已过时；规划器正在依据错误信息做出选择 |
| 扫描上方存在 `Sort` 节点 | 索引覆盖了筛选条件，但未覆盖 `ORDER BY` |

应针对**查询的结构**建立索引，而不是孤立地针对某一列建立索引。在复合索引中，等值条件列应位于最前面，范围条件列或排序列紧随其后：

```sql
CREATE INDEX idx_tasks_owner_created ON tasks (owner_id, created_at DESC);
```

**索引无法发挥作用的情况：**

| 情况 | 原因 |
|---|---|
| 选择性低，查询占主导地位的值（某个 `status` 列中 95% 的值为 `active`，并按 `active` 筛选） | 顺序扫描确实成本更低；规划器会忽略索引。筛选稀有值则情况相反，使用部分索引会非常有效 |
| 前导通配符（`LIKE '%term'`） | B-tree 在没有前缀的情况下无法进行定位查找；需要使用 trigram 或全文索引 |
| 对列应用函数（`WHERE lower(email) = ?`） | 普通列索引无法使用；应改为对表达式建立索引 |
| 写入密集型表 | 每个索引都会增加每次 `INSERT`/`UPDATE` 的成本；不仅要衡量读取收益，还要衡量写入成本 |

之后重新运行 `EXPLAIN ANALYZE`。如果索引没有改变执行计划，就应将其回退（步骤 4），而且它并非没有代价：每次写入仍会产生开销。

#### 连接池耗尽

其特征非常明显：**所有**端点会同时变慢，耗时发生在等待连接而非执行操作上，并且数据库报告的大多数会话都处于空闲状态。

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

**连接池越大并不意味着越快。** 如果连接池的大小超过数据库可并发执行的能力，只会将队列从应用程序转移到数据库，而在那里更难观察。当实例数量不受限制时（无服务器、自动扩缩容），正确的解决方案是使用可复用连接的代理（pgbouncer、RDS Proxy），而不是提高 `max`。

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

#### 打包体积过大

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

应缓存那些生成成本高昂、读取频率远高于变更频率的内容。缓存一个原本就很快的查询，只会增加一次网络跳转、一个数据陈旧问题和一套需要维护的淘汰策略，却得不到任何收益。

**谨慎选择缓存层：**

| 缓存层 | 可见范围 | 适用场景 | 代价 |
|---|---|---|---|
| 进程内（`Map`、LRU） | 单个实例 | 数据量小、访问频繁，并且可接受各实例间的数据陈旧 | 每个实例会独立产生偏差；失效操作只能触达一个实例 |
| 共享缓存（Redis、Memcached） | 所有实例 | 实例之间必须保持一致，或者值的重新计算成本高昂 | 增加一次网络跳转，以及一个需要运行和监控的服务 |
| CDN / 边缘缓存 | 所有人，按 URL 区分 | 响应是公开的，并且给定键对应的响应完全相同 | 缓存失效是最棘手的部分；应假定无法快速撤回错误响应 |

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

**键的设计决定了正确性。** 所有会改变响应的输入都必须包含在键中：租户、区域设置、权限、功能标志。如果键中遗漏了查看者信息，就可能把一个用户的数据提供给另一个用户，而这还会被当作性能优化发布出去。

**选择一种失效策略，而不是三种并用：**

| 策略 | 权衡 |
|---|---|
| TTL | 最简单。你需要接受数据在 TTL 时长内可能处于陈旧状态，因此应明确说明可接受的时间窗口 |
| 基于事件或标签 | 写入时即可刷新，但写入方现在必须了解缓存拓扑 |
| 版本化键（`user:42:profile:v7`） | 永不执行失效操作，只需停止读取旧键。代价是在淘汰前会持续占用内存 |

**防范缓存击穿。** 当一个热点键过期时，所有并发请求会同时缓存未命中，源站将瞬间承受全部负载，缓存非但没能防止故障，反而导致了故障。可以在单个请求重新计算期间继续提供陈旧数据（`stale-while-revalidate`），也可以让并发的缓存未命中共用一个正在执行的 Promise，使 N 个等待者只触发一次重新计算。

**不要缓存：** 任何一旦过时就会导致正确性缺陷的数据（余额、权限、结账时的库存），也不要将每位用户的数据缓存在无法标识该用户的键下。有关请求合并、写入策略、负缓存和缓存检查清单，请参阅 `../../references/performance-checklist.md`。

### 第 4 步：验证（保留或还原）

在重新测量之前，修复都只是假设。这一步决定它是否能够保留下来。

**使用测量基线时采用的方式重新测量：** 相同的命令、相同的条件、相同的固定预算（实际经过时间、样本数或请求数）。将在冷缓存下取得的基线与在热缓存下取得的结果进行比较，测量到的是缓存的效果，而不是你的改动。

**一次只改一处。** 三项优化一起落地只会产生一个数字，而你无法确定这个数字应归因于哪一项。如果它们必须一起发布，请先分别单独测量每一项。

**要胜过噪声，而不仅仅是均值。** 重复测量，并将变化量与不同运行之间的方差进行比较。若方差为 ±5%，那么 3% 的提升并不算提升；它只是另一个不同的样本。

然后严格作出决定：

| 与基线相比的结果 | 操作 |
|---|---|
| 超过阈值，测试全部通过 | **保留。** 提交，并在提交信息中写明改动前后的数字。 |
| 在噪声范围内（没有可测量的变化） | **还原。** |
| 更差 | **还原。** |
| 有所改善，但有测试失败 | **还原。** 这是披着胜利外衣的回归。 |

**“中性”意味着还原，而不是保留。** 这是团队经常跳过的一步：改动已经写完，丢弃它让人觉得浪费，于是它未经测量就被合入，代码库也因此不断累积从未带来任何收益的复杂性。保留下来的代码需要永远维护。要让它证明自己物有所值。

**正确性是指标的前提。** 测试套件必须保持全部通过，*并且*数字必须有所改善。如果一项“优化”通过省略产品所需的工作来获得提升（跳过验证、缓存必须保持最新的数据、移除一个起关键作用的 `await`），那就是回归，而不是胜利。

#### 记录每一次尝试，包括已还原的尝试

已还原的工作不会在 git 历史记录中留下痕迹，而这正是同一个无效想法会在下个季度被再次尝试的原因。保留一份简短的记录，让被放弃的想法继续保持被放弃的状态：

| 想法 | 基线 → 结果 | 结论 | 原因 |
|---|---|---|---|
| 对行组件进行记忆化 | INP 240ms → 235ms | 已还原 | 在噪声范围内（±15ms）。行并不是瓶颈。 |
| 对列表进行虚拟化 | INP 240ms → 90ms | 已保留 | 跟踪记录中的长任务已消失。 |
| 预连接到 API 源站 | LCP 2.8s → 2.8s | 已还原 | 已经是同源。 |

可以在 PR 描述中添加一个章节，也可以在仓库中放置一个 `PERF.md`。重要的是，下一个人（或下一个智能体）在提出实验之前会先阅读它，并且不会重新运行一个已经失败的实验。

### 第 5 步：防止回归

守护用户实际感受到的指标，而不是每一个可用的数字。使用证明该修复合理的同一个 LCP、INP、p95 延迟或其他主要指标。

当面向用户的界面受到影响时，请使用两个互补的层级：

- **合成 CI 门禁：** 使用性能预算，在合并前捕获可复现的回归。重复执行噪声较大的测量，或比较中位数/趋势，从而避免正常的运行间方差让门禁变成不稳定的检查。
- **现场监控：** 当 RUM 数据中的 p75 出现显著变化时发出警报。使用带归因信息的 `web-vitals` 数据定位原因；将 CrUX 的滚动窗口视为确认信号，而不是即时警报。

当任一防护条件触发时，返回步骤 1，并建立新的基线，然后再提出其他修复方案。

**设定预算并严格执行：**

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

| 自我辩解 | 事实 |
|---|---|
| “我们以后再优化” | 性能债务会不断累积。现在就修复明显的反模式，微优化则可以推迟。 |
| “在我的机器上很快” | 你的机器并不是用户的机器。请在具有代表性的硬件和网络环境中进行性能分析。 |
| “这个优化显而易见” | 如果没有测量，你就无法确定。先进行性能分析。 |
| “用户不会注意到 100ms” | 研究表明，100ms 的延迟会影响转化率。用户能察觉到的比你想象的更多。 |
| “框架会处理性能问题” | 框架可以避免某些问题，但无法修复 N+1 查询或过大的 bundle。 |
| “查询很慢，加个索引” | 先查看执行计划。索引可能已经存在但无法使用，而且每个索引都会永久增加写入成本。 |
| “直接缓存就行” | 缓存本就廉价的调用毫无收益，反而会引入数据陈旧问题。应缓存那些开销高昂，*并且*读取频率远高于写入频率的内容。 |
| “把连接池调大，我们的连接快用完了” | 超过数据库服务能力的连接池只会把队列转移到更难察觉的地方。找出是什么占用了连接。 |
| “虽然没什么帮助，但也没有坏处” | 没有收益的变更就应该回退。你将永远为其付出维护成本，却没有得到任何回报。 |
| “我们已经写完了，不妨保留” | 这是沉没成本。测量结果并不在乎编写该变更花了多长时间。 |
| “改进显而易见，不需要重新测量” | 那么重新测量的成本也很低，而且可以证明这一点。未经测量的收益正是无效复杂性混入系统的原因。 |

## 危险信号

- 在没有性能分析数据支持的情况下进行优化
- 数据获取中存在 N+1 查询模式
- 在添加索引前后都没有查询计划来证明其合理性
- 缓存键遗漏了响应所依赖的输入（租户、区域设置、查看者）
- 缓存没有明确的陈旧时间窗口，也没有失效策略
- 在未查明连接被什么占用的情况下，因连接耗尽而增大连接池
- 列表端点没有分页
- 图片没有尺寸、延迟加载或响应式尺寸
- bundle 大小持续增长却未经审查
- 生产环境中没有性能监控
- 到处使用 `React.memo` 和 `useMemo`（过度使用和使用不足同样糟糕）
- 在没有重新测量证明其合理性的情况下保留优化
- 将多项优化合并到一次测量中，导致无法将结果归因于任何单一变更
- 某项“改进”需要修改、跳过或删除测试
- 由于无人记录第一次尝试，导致同一个失败的优化被多次尝试

## 验证

在进行任何性能相关的更改后：

- [ ] 存在更改前后的测量结果（具体数值）
- [ ] 使用与基线相同的方式重新测量结果（相同命令、相同条件）
- [ ] 改进幅度超过了多次运行之间的波动，而不仅仅是平均值有所改善
- [ ] 未超越基线的更改已被还原，而不是作为无影响的更改保留
- [ ] 所有尝试均有记录，无论保留还是还原，以免重复尝试无效方案
- [ ] 已识别并解决具体的瓶颈
- [ ] Core Web Vitals 处于“良好”阈值范围内
- [ ] Bundle 大小未显著增加
- [ ] 新的数据获取代码中不存在 N+1 查询
- [ ] 任何新索引均有更改前后的查询计划作为依据，并且已考虑其写入成本
- [ ] 任何新缓存均说明其键的依据以及失效方式
- [ ] 已测量的用户侧指标具备能够检测回归的合成监控预算或真实用户监控
- [ ] 现有测试仍然通过（优化未破坏原有行为）