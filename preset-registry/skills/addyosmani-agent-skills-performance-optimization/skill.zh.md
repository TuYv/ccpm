---
name: performance-optimization
description: Optimizes application performance across frontend, backend, queries, and databases. Use when performance requirements exist, when you suspect performance regressions, when Core Web Vitals or load times need improvement, when N+1 query patterns need fixing, or when profiling reveals bottlenecks.
---
# 性能优化

## 概述

先测量，再优化。没有测量依据的性能工作就是猜测——而猜测会导致过早优化，增加复杂性，却无法改善真正重要的指标。先进行性能分析，找出实际瓶颈，修复它，然后再次测量。只优化那些经测量证明真正重要的部分。

## 何时使用

- 规范中存在性能要求（加载时间预算、响应时间 SLA）
- 用户或监控系统报告运行缓慢
- Core Web Vitals 分数低于阈值
- 你怀疑某项变更引入了性能回退
- 构建需要处理大型数据集或高流量的功能

**何时不应使用：** 在有证据表明存在问题之前，不要进行优化。过早优化会增加复杂性，其成本可能超过带来的性能收益。

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

- **合成测试（Lighthouse、DevTools Performance 选项卡）：** 条件可控、结果可复现。最适合在 CI 中检测性能回退以及隔离特定问题。
- **RUM（web-vitals 库、CrUX）：** 真实环境中的真实用户数据。要验证修复是否确实改善了用户体验，这是必需的。

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

各类别的常见瓶颈：

**前端：**

| 症状 | 可能原因 | 排查方法 |
|---------|-------------|---------------|
| LCP 缓慢 | 图片过大、资源阻塞渲染、服务器响应缓慢 | 检查网络瀑布图和图片大小 |
| CLS 较高 | 图片未指定尺寸、内容延迟加载、字体偏移 | 检查布局偏移归因 |
| INP 较差 | 主线程上运行繁重的 JavaScript、大规模 DOM 更新 | 检查 Performance 跟踪记录中的长任务 |
| 初始加载缓慢 | bundle 过大、网络请求过多 | 检查 bundle 大小和代码拆分 |

**后端：**

| 症状 | 可能原因 | 排查方法 |
|---------|-------------|---------------|
| API 响应缓慢 | N+1 查询、缺少索引、查询未经优化 | 检查数据库查询日志 |
| 内存增长 | 引用泄漏、缓存无上限、载荷过大 | 分析堆快照 |
| CPU 峰值 | 同步执行繁重计算、正则表达式回溯 | CPU 性能分析 |
| 高延迟 | 缺少缓存、重复计算、网络跳转 | 跟踪请求在整个技术栈中的处理过程 |

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

#### 无上限的数据获取

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

#### 缺少图片优化（前端）

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

#### 过大的包体积

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

### 第 4 步：验证（保留或还原）

在重新测量之前，修复只是一种假设。此步骤决定它是否应当保留。

**按照测量基线时的方式重新测量：**使用相同的命令、相同的条件和相同的固定预算（实际耗时、样本数量或请求数量）。将冷缓存下取得的基线与热缓存下取得的结果进行比较，测量的是缓存效果，而不是你的改动。

**一次只改一件事。** 三项优化一起落地只能得到一个数字，而你无法确定它归因于哪一项。如果它们必须一起发布，请先分别单独测量每一项。

**要超越噪声，而不只是改善平均值。** 重复进行测量，并将变化幅度与各次运行之间的方差进行比较。在 ±5% 的方差范围内取得 3% 的提升并不算提升；那只是一个不同的样本。

然后严格作出决定：

| 与基线相比的结果 | 操作 |
|---|---|
| 超过阈值，测试通过 | **保留。** 提交时在消息中附上改动前后的数据。 |
| 处于噪声范围内（无可测量的变化） | **还原。** |
| 变差 | **还原。** |
| 有所改善，但有测试失败 | **还原。** 这是披着胜利外衣的回归。 |

**“无变化”意味着回退，而不是保留。** 这是团队经常跳过的一步：改动已经写完了，丢弃它似乎很浪费，于是它在未经测量的情况下被合入，代码库也因此不断积累从未带来任何收益的复杂性。保留下来的代码，你就得永远维护。要让它证明自身的价值。

**正确性是指标的前提。** 测试套件必须保持通过，*并且*指标必须有所改善。如果一项“优化”是通过删减产品所需的工作来取得成效（跳过某项验证、缓存必须保持最新的内容、移除一个不可或缺的 `await`），那它就是回归，而不是胜利。

#### 记录每一次尝试，包括已回退的尝试

已回退的工作不会在 git 历史记录中留下痕迹，而这恰恰就是同一个无效想法会在下个季度被再次尝试的原因。维护一份简短的记录，让被放弃的想法继续保持被放弃的状态：

| 想法 | 基线 → 结果 | 结论 | 原因 |
|---|---|---|---|
| 对行组件进行记忆化 | INP 240ms → 235ms | 已回退 | 处于噪声范围内（±15ms）。行组件并非瓶颈。 |
| 对列表进行虚拟化 | INP 240ms → 90ms | 已保留 | 跟踪记录中的长任务已消失。 |
| 预连接到 API 源站 | LCP 2.8s → 2.8s | 已回退 | 已经是同源。 |

在 PR 描述中添加一个章节，或在仓库中创建一个 `PERF.md`，两种方式都可以。重要的是，下一个人（或下一个代理）在提出实验方案前会先阅读它，并且不会重新运行已经失败过的实验。

## 性能预算

设置预算并强制执行：

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
| “我们以后再优化” | 性能债务会不断累积。现在修复明显的反模式，将微优化推迟处理。 |
| “在我的机器上很快” | 你的机器不是用户的机器。请在具有代表性的硬件和网络环境中进行性能分析。 |
| “这个优化显而易见” | 如果没有测量，你就无法确定。先进行性能分析。 |
| “用户不会注意到 100ms” | 研究表明，100ms 的延迟会影响转化率。用户能察觉到的问题比你想象的更多。 |
| “框架会处理性能问题” | 框架可以防止某些问题，但无法修复 N+1 查询或过大的包。 |
| “它没什么帮助，但也没有坏处” | 没有改善的改动应该回退。你将永远为它们付出维护成本，却没有获得任何回报。 |
| “我们都已经写完了，不妨保留” | 这是沉没成本。测量结果并不在乎你花了多长时间编写这项改动。 |
| “改善显而易见，无需重新测量” | 那么重新测量的成本就很低，而且可以证明这一点。未经测量的收益，正是无收益的复杂性得以合入的原因。 |

## 危险信号

- 没有性能分析数据作为依据的优化
- 数据获取中的 N+1 查询模式
- 没有分页的列表端点
- 图片未指定尺寸、未使用延迟加载或未提供响应式尺寸
- 包体积不断增长，却未经审查
- 生产环境中没有性能监控
- 到处使用 `React.memo` 和 `useMemo`（过度使用与使用不足一样糟糕）
- 优化在没有通过重新测量证明其合理性的情况下被保留
- 将多项优化捆绑到一次测量中，导致无法将结果归因于任何单项改动
- 一项“改进”要求修改、跳过或删除测试
- 由于无人记录第一次尝试，同一项失败的优化被多次尝试

## 验证

在进行任何性能相关的更改后：

- [ ] 存在更改前后的测量结果（具体数值）
- [ ] 采用与基准相同的方式（相同命令、相同条件）重新测量结果
- [ ] 性能提升超过了多次运行之间的波动，而不仅仅是平均值有所改善
- [ ] 未能优于基准的更改已被回退，而不是作为无影响的更改保留
- [ ] 所有尝试均已记录，无论保留还是回退，以免再次尝试已证实无效的方案
- [ ] 已识别并解决具体的瓶颈
- [ ] Core Web Vitals 处于“良好”阈值范围内
- [ ] Bundle 大小未显著增加
- [ ] 新的数据获取代码中不存在 N+1 查询
- [ ] CI 中的性能预算检查通过（如果已配置）
- [ ] 现有测试仍然通过（优化未破坏原有行为）