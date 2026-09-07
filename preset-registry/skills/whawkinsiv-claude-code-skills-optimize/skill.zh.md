---
name: optimize
description: "Use this skill when the user's app feels slow, the codebase feels bloated, or after significant development work. Also use when the user says 'my app is slow,' 'clean up my code,' 'reduce bundle size,' 'my hosting bill is too high,' or 'everything feels sluggish.' Optimizes across four dimensions: Speed (page load, API response), Code (unused files, dead code), Database (orphaned data, schema hygiene), and Dependencies (package bloat, bundle size)."
---
# Optimize

减少浪费、提升效率。**只有在拥有真实用户和真实问题之后才进行优化** —— 过早优化是创始人最常犯的时间浪费。

**这个技能用于让已有的东西更快、更精简。** 构建功能请使用 **build**。修复 bug 请使用 **debug**。监控生产环境性能请使用 **monitor**。数据库 schema 设计请使用 **database**。

## 工作流程

```
Optimize your app:
- [ ] Measure first — get actual numbers (page load, API speed, bundle size)
- [ ] Speed — fix the slowest page or API endpoint
- [ ] Dependencies — update packages, remove unused ones
- [ ] Database — clean orphaned data, optimize slow queries
- [ ] Code — remove dead code and unused files
- [ ] Re-measure — verify improvements with numbers
```

## 何时优化（以及何时不优化）

**以下情况不要优化：**
- 正在构建你的 MVP
- 活跃用户少于约 100 人
- 一切运行良好
- 你还没有对问题进行测量

**以下情况应当优化：**
- 用户抱怨速度慢（速度）
- 出现打包体积警告或安全告警（依赖）
- 应用明显比刚上线时慢（速度/数据库）
- 你在为本不需要的托管资源付费（速度/数据库）

**规则：** 先让它能用 → 获取用户 → 测量 → 然后再让它精简。

---

## 优先级顺序

当有多件事需要处理时：

1. **速度** —— 用户会立刻感受到。慢 = 用户流失。
2. **依赖** —— 安全漏洞很紧急。打包体积膨胀会影响速度。
3. **数据库** —— 影响长期性能和托管成本。
4. **代码** —— 影响可维护性。对用户的影响最小。

---

## 速度优化

### 目标

| 指标 | 良好 | 不佳 |
|--------|------|-----|
| 页面加载 | < 3s | > 5s |
| API 响应 | < 500ms | > 1s |
| 可交互时间 | < 5s | > 8s |

### 第 1 步：测量

**Claude Code**（可以直接测量）：
```
Audit app performance:
- Measure page load times for the 3 most important pages
- Log API response times for the 5 most-used endpoints
- Identify the slowest database queries
- Check total bundle size
Report findings with specific numbers.
```

**Lovable / Replit / Cursor**（先手动测量）：
1. 在 Chrome 中打开你的应用 → 右键 → Inspect（检查） → Network（网络）标签 → 重新加载
2. 记下底部的“Load”时间 —— 那就是你的页面加载时间
3. 点击一个调用 API 的按钮 —— 在 Network 标签中记下请求时间
4. 然后将测量结果粘贴到对话中：
```
My app's performance numbers:
- Homepage loads in [X] seconds
- [Main feature] API takes [X] seconds
- [Other page] loads in [X] seconds
What's slow and how do I fix it?
```

### 第 2 步：修复

**告诉 AI：**
```
Optimize these performance issues:
[paste audit findings]

Apply fixes in this order:
1. Add caching for slow API calls
2. Add database indexes for slow queries
3. Optimize and lazy-load images
4. Code split large bundles
Run build and tests after each fix.
```

### 第 3 步：预防

**告诉 AI：**
```
Add performance monitoring:
- Log API calls > 500ms
- Log database queries > 100ms
- Alert if page load > 3s
```

详细测试方法请参见 [PERFORMANCE-CHECKS.md](PERFORMANCE-CHECKS.md)。

---

## 依赖优化

在任何阶段都最适用的优化 —— 甚至在上线之前。

### 需要此项优化的迹象

- 运行 `npm install` 时出现安全漏洞警告
- 打包体积 > 500KB
- “这个包是干什么的？”

### 审计

**告诉 AI：**
```
Audit dependencies:
- List packages not imported anywhere in code
- List packages with security vulnerabilities
- Analyze bundle size by package
- Find packages with lighter alternatives

Report: package name, size impact, and recommendation.
```

### 修复

**告诉 AI：**
```
Clean up dependencies:
[paste audit findings]

Steps:
- Remove unused packages from package.json
- Update packages with security vulnerabilities
- Replace heavy packages with lighter alternatives
After changes: delete node_modules, fresh npm install, run build and tests.
```

**常见替换方案：**

| 重量级 | 轻量替代方案 |
|-------|-------------------|
| moment.js | date-fns 或 dayjs |
| lodash（完整版） | lodash-es（可 tree-shake） |
| axios | fetch（内置） |

### 预防

**告诉 AI：**
```
Set up dependency hygiene:
- Add npm audit to CI pipeline
- Configure Dependabot for automatic security updates
```

详细模式请参见 [DEPENDENCIES.md](DEPENDENCIES.md)。

---

## 数据库优化

**何时重要：** 在经过数月真实使用之后，当查询变慢或托管成本攀升时。

### 需要此项优化的迹象

- 之前很快的页面现在变慢了
- 数据库托管成本持续上升
- 负载下查询超时

### 审计与修复

**告诉 AI：**
```
Audit database for optimization opportunities:
- Find missing indexes on frequently queried columns
- Find slow queries (> 100ms)
- Find orphaned records (foreign keys pointing to deleted rows)
- Find tables with no recent reads/writes

For each issue, apply the fix:
- Add indexes for slow queries
- Set up ON DELETE CASCADE for dependent records
- Create cleanup job for orphaned/soft-deleted records (> 90 days)
Always backup before making schema changes.
```

---

## 代码清理

**何时重要：** 当你的代码库经过大量 AI 辅助迭代而显著膨胀之后。多轮“构建功能、重建功能”会留下死代码。

### 需要此项优化的迹象

- 出现你不认识的文件
- 没有在任何地方使用的组件
- “我不敢删掉这个”

### 审计与修复

**告诉 AI：**
```
Audit codebase for unused code:
- Find components not imported anywhere
- Find functions never called
- Find commented-out code blocks
For each: verify nothing references it, then remove it.

For duplicate/similar code, use **dry** — it covers deduplication across UI, database, and logic.
Run build and tests after cleanup.
```

**安全规则：** 如果不确定，先注释掉并测试。确认没有破坏任何功能后再删除。

---

## 常见错误

| 错误 | 修正 |
|---------|-----|
| 未测量就优化 | 始终先 AUDIT |
| 在 MVP 阶段优化 | 先上线，等用户抱怨时再优化 |
| 一次性更新所有包 | 一次只更新一个，并逐一测试 |
| 未验证就删除代码 | 删除前先检查 import/引用 |
| 在生产环境删除数据库列 | 先在 staging 环境测试迁移 |

---

## 成功是什么样子

优化之后，你应该看到：

- 页面加载 < 3 秒
- 依赖中零安全漏洞
- 没有明显未使用的包
- 数据库查询响应 < 100ms
- 自动化检查能捕获未来的性能回退

---

## 相关技能

- **monitor** —— 优化完成后追踪生产环境性能
- **debug** —— 修复坏了的东西（optimize 修复慢的东西）
- **deploy** —— 托管配置会影响性能
- **database** —— Schema 设计与查询优化
- **dry** —— 查找并消除 UI、数据库和逻辑中的重复代码
- **build** —— 功能开发（先构建再优化，而不是边构建边优化）
