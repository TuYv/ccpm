---
name: optimizing-performance
description: Analyzes and optimizes application performance across frontend, backend, and database layers. Use when diagnosing slowness, improving load times, optimizing queries, reducing bundle size, or when asked about performance issues.
---
# 优化性能

### 何时加载

- **触发条件**：诊断运行缓慢、性能分析、缓存策略、缩短加载时间、优化包体积
- **跳过条件**：专注于正确性且不关注性能的工作

## 性能优化工作流

复制此检查清单并跟踪进度：

```
Performance Optimization Progress:
- [ ] Step 1: Measure baseline performance
- [ ] Step 2: Identify bottlenecks
- [ ] Step 3: Apply targeted optimizations
- [ ] Step 4: Measure again and compare
- [ ] Step 5: Repeat if targets not met
```

**关键规则**：切勿在没有数据的情况下进行优化。始终在更改前后进行性能分析。

## 第 1 步：测量基准性能

### 性能分析命令

```bash
# Node.js profiling
node --prof app.js
node --prof-process isolate*.log > profile.txt

# Python profiling
python -m cProfile -o profile.stats app.py
python -m pstats profile.stats

# Web performance
lighthouse https://example.com --output=json
```

## 第 2 步：识别瓶颈

### 常见瓶颈类别

| 类别 | 症状                         | 工具                           |
| -------- | -------------------------------- | ------------------------------- |
| CPU      | CPU 使用率高、计算缓慢 | 性能分析器、火焰图          |
| 内存   | RAM 占用高、GC 暂停、OOM         | 堆快照、内存分析器 |
| I/O      | 磁盘/网络速度慢、等待       | strace、网络检查器       |
| 数据库 | 查询缓慢、锁争用    | 查询分析器、EXPLAIN         |

## 第 3 步：应用优化

### 前端优化

**包体积：**

```javascript
// ❌ Import entire library
import _ from "lodash";

// ✅ Import only needed functions
import debounce from "lodash/debounce";

// ✅ Use dynamic imports for code splitting
const HeavyComponent = lazy(() => import("./HeavyComponent"));
```

**渲染：**

```javascript
// ❌ Render on every parent update
function Child({ data }) {
  return <ExpensiveComponent data={data} />;
}

// ✅ Memoize when props don't change
const Child = memo(function Child({ data }) {
  return <ExpensiveComponent data={data} />;
});

// ✅ Use useMemo for expensive computations
const processed = useMemo(() => expensiveCalc(data), [data]);
```

**图像：**

```html
<!-- ❌ Unoptimized -->
<img src="large-image.jpg" />

<!-- ✅ Optimized -->
<img
  src="image.webp"
  srcset="image-300.webp 300w, image-600.webp 600w"
  sizes="(max-width: 600px) 300px, 600px"
  loading="lazy"
  decoding="async"
/>
```

### 后端优化

**数据库查询：**

```sql
-- ❌ N+1 Query Problem
SELECT * FROM users;
-- Then for each user:
SELECT * FROM orders WHERE user_id = ?;

-- ✅ Single query with JOIN
SELECT u.*, o.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- ✅ Or use pagination
SELECT * FROM users LIMIT 100 OFFSET 0;
```

**缓存策略：**

```javascript
// Multi-layer caching
const getUser = async (id) => {
  // L1: In-memory cache (fastest)
  let user = memoryCache.get(`user:${id}`);
  if (user) return user;

  // L2: Redis cache (fast)
  user = await redis.get(`user:${id}`);
  if (user) {
    memoryCache.set(`user:${id}`, user, 60);
    return JSON.parse(user);
  }

  // L3: Database (slow)
  user = await db.users.findById(id);
  await redis.setex(`user:${id}`, 3600, JSON.stringify(user));
  memoryCache.set(`user:${id}`, user, 60);

  return user;
};
```

**异步处理：**

```javascript
// ❌ Blocking operation
app.post("/upload", async (req, res) => {
  await processVideo(req.file); // Takes 5 minutes
  res.send("Done");
});

// ✅ Queue for background processing
app.post("/upload", async (req, res) => {
  const jobId = await queue.add("processVideo", { file: req.file });
  res.send({ jobId, status: "processing" });
});
```

### 算法优化

```javascript
// ❌ O(n²) - nested loops
function findDuplicates(arr) {
  const duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) duplicates.push(arr[i]);
    }
  }
  return duplicates;
}

// ✅ O(n) - hash map
function findDuplicates(arr) {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of arr) {
    if (seen.has(item)) duplicates.add(item);
    seen.add(item);
  }
  return [...duplicates];
}
```

## 步骤 4：再次测量

应用优化后，重新运行性能分析并进行比较：

```
Comparison Checklist:
- [ ] Run same profiling tools as baseline
- [ ] Compare metrics before vs after
- [ ] Verify no regressions in other areas
- [ ] Document improvement percentages
```

## 性能目标

### Web Vitals

| 指标 | 良好    | 需要改进 | 较差    |
| ------ | ------- | ---------- | ------- |
| LCP    | < 2.5s  | 2.5-4s     | > 4s    |
| INP    | < 200ms | 200-500ms  | > 500ms |
| CLS    | < 0.1   | 0.1-0.25   | > 0.25  |
| TTFB   | < 800ms | 800ms-1.8s | > 1.8s  |

### API 性能

| 指标      | 目标  |
| ----------- | ------- |
| P50 延迟 | < 100ms |
| P95 延迟 | < 500ms |
| P99 延迟 | < 1s    |
| 错误率  | < 0.1%  |

## 验证

优化后，验证结果：

```
Performance Validation:
- [ ] Metrics improved from baseline
- [ ] No functionality regressions
- [ ] No new errors introduced
- [ ] Changes are sustainable (not one-time fixes)
- [ ] Performance gains documented
```

如果未达到目标，请返回步骤 2 并找出剩余的瓶颈。