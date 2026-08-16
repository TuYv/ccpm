---
name: optimize
description: Diagnoses and fixes UI performance across loading speed, rendering, animations, images, and bundle size. Use when the user mentions slow, laggy, janky, performance, bundle size, load time, or wants a faster, smoother experience.
version: 2.1.1
user-invocable: false
argument-hint: "[target]"
---
识别并修复性能问题，打造更快速、更流畅的用户体验。

## 评估性能问题

了解当前性能并识别问题：

1. **衡量当前状态**：
   - **核心 Web 指标**：LCP、FID/INP、CLS 分数
   - **加载时间**：可交互时间、首次内容绘制
   - **包体积**：JavaScript、CSS、图片大小
   - **运行时性能**：帧率、内存使用量、CPU 使用率
   - **网络**：请求数量、载荷大小、瀑布图

2. **识别瓶颈**：
   - 什么地方慢？（初始加载？交互？动画？）
   - 原因是什么？（大型图片？高开销的 JavaScript？布局抖动？）
   - 严重程度如何？（可以察觉？令人烦恼？造成阻塞？）
   - 哪些人受到影响？（所有用户？仅移动端用户？使用慢速网络的用户？）

**关键要求**：在优化前后都要进行衡量。过早优化会浪费时间。应优化真正重要的部分。

## 优化策略

制定系统性的改进计划：

### 加载性能

**优化图片**：
- 使用现代格式（WebP、AVIF）
- 使用合适的尺寸（不要为 300px 的显示区域加载 3000px 的图片）
- 对首屏以下的图片使用延迟加载
- 使用响应式图片（`srcset`、`picture` 元素）
- 压缩图片（80-85% 的质量通常不会产生可察觉的差异）
- 使用 CDN 加快交付速度

```html
<img 
  src="hero.webp"
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
  loading="lazy"
  alt="Hero image"
/>
```

**减小 JavaScript 包体积**：
- 代码分割（基于路由、基于组件）
- Tree shaking（移除未使用的代码）
- 移除未使用的依赖项
- 延迟加载非关键代码
- 对大型组件使用动态导入

```javascript
// Lazy load heavy component
const HeavyChart = lazy(() => import('./HeavyChart'));
```

**优化 CSS**：
- 移除未使用的 CSS
- 内联关键 CSS，其余异步加载
- 最小化 CSS 文件
- 对独立区域使用 CSS 包含

**优化字体**：
- 使用 `font-display: swap` 或 `optional`
- 对字体进行子集化（仅包含所需字符）
- 预加载关键字体
- 适当时使用系统字体
- 限制加载的字体字重

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* Show fallback immediately */
  unicode-range: U+0020-007F; /* Basic Latin only */
}
```

**优化加载策略**：
- 优先加载关键资源（对非关键资源使用 async/defer）
- 预加载关键资源
- 预取用户可能访问的后续页面
- 使用 Service Worker 实现离线访问/缓存
- 使用 HTTP/2 或 HTTP/3 实现多路复用

### 渲染性能

**避免布局抖动**：
```javascript
// ❌ Bad: Alternating reads and writes (causes reflows)
elements.forEach(el => {
  const height = el.offsetHeight; // Read (forces layout)
  el.style.height = height * 2; // Write
});

// ✅ Good: Batch reads, then batch writes
const heights = elements.map(el => el.offsetHeight); // All reads
elements.forEach((el, i) => {
  el.style.height = heights[i] * 2; // All writes
});
```

**优化渲染**：
- 对独立区域使用 CSS `contain` 属性
- 尽量降低 DOM 深度（结构越扁平，速度越快）
- 减少 DOM 大小（使用更少的元素）
- 对长列表使用 `content-visibility: auto`
- 对超长列表使用虚拟滚动（react-window、react-virtualized）

**减少绘制与合成开销**：
- 动画使用 `transform` 和 `opacity`（GPU 加速）
- 避免为布局属性添加动画（width、height、top、left）
- 仅对已知的高开销操作谨慎使用 `will-change`
- 尽量缩小绘制区域（区域越小，速度越快）

### 动画性能

**GPU 加速**：
```css
/* ✅ GPU-accelerated (fast) */
.animated {
  transform: translateX(100px);
  opacity: 0.5;
}

/* ❌ CPU-bound (slow) */
.animated {
  left: 100px;
  width: 300px;
}
```

**流畅的 60fps**：
- 以每帧 16ms（60fps）为目标
- 使用 `requestAnimationFrame` 实现 JS 动画
- 对滚动处理程序进行防抖/节流
- 尽可能使用 CSS 动画
- 避免在动画期间运行耗时较长的 JavaScript

**Intersection Observer**：
```javascript
// Efficiently detect when elements enter viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Element is visible, lazy load or animate
    }
  });
});
```

### React/框架优化

**React 特定优化**：
- 对高开销组件使用 `memo()`
- 对高开销计算使用 `useMemo()` 和 `useCallback()`
- 对长列表进行虚拟化
- 对路由进行代码拆分
- 避免在渲染过程中创建内联函数
- 使用 React DevTools Profiler

**框架无关优化**：
- 尽量减少重新渲染
- 对高开销操作进行防抖
- 对计算值进行记忆化
- 延迟加载路由和组件

### 网络优化

**减少请求**：
- 合并小文件
- 对图标使用 SVG 雪碧图
- 内联体积较小的关键资源
- 移除未使用的第三方脚本

**优化 API**：
- 使用分页（不要加载所有内容）
- 使用 GraphQL 仅请求所需字段
- 响应压缩（gzip、brotli）
- HTTP 缓存标头
- 对静态资源使用 CDN

**针对慢速连接进行优化**：
- 根据连接情况进行自适应加载（navigator.connection）
- 乐观式 UI 更新
- 请求优先级排序
- 渐进增强

## Core Web Vitals 优化

### 最大内容绘制（LCP < 2.5s）
- 优化首屏主视觉图片
- 内联关键 CSS
- 预加载关键资源
- 使用 CDN
- 服务端渲染

### 首次输入延迟（FID < 100ms）/ 交互到下一次绘制（INP < 200ms）
- 拆分长任务
- 延迟加载非关键 JavaScript
- 使用 Web Worker 执行高负载计算
- 减少 JavaScript 执行时间

### 累积布局偏移（CLS < 0.1）
- 为图片和视频设置尺寸
- 不要在现有内容上方插入内容
- 使用 `aspect-ratio` CSS 属性
- 为广告/嵌入内容预留空间
- 避免使用会导致布局偏移的动画

```css
/* Reserve space for image */
.image-container {
  aspect-ratio: 16 / 9;
}
```

## 性能监控

**可使用的工具**：
- Chrome DevTools（Lighthouse、Performance 面板）
- WebPageTest
- Core Web Vitals（Chrome UX Report）
- Bundle 分析器（webpack-bundle-analyzer）
- 性能监控工具（Sentry、DataDog、New Relic）

**关键指标**：
- LCP、FID/INP、CLS（核心网页指标）
- 可交互时间（TTI）
- 首次内容绘制（FCP）
- 总阻塞时间（TBT）
- 打包体积
- 请求数量

**重要**：请在真实设备和真实网络条件下进行测量。使用高速网络连接的桌面版 Chrome 并不能代表真实情况。

**绝不要**：
- 在未测量的情况下进行优化（过早优化）
- 为性能牺牲可访问性
- 在优化过程中破坏功能
- 到处使用 `will-change`（这会创建新图层并占用内存）
- 延迟加载首屏内容
- 在忽略重大问题的同时进行微小优化（应先优化最大的瓶颈）
- 忽视移动端性能（移动设备通常性能更低、网络连接更慢）

## 验证改进效果

测试优化是否奏效：

- **优化前后指标**：比较 Lighthouse 分数
- **真实用户监控**：跟踪真实用户体验到的改进
- **不同设备**：在低端 Android 设备上测试，而不只是在旗舰版 iPhone 上测试
- **慢速网络连接**：将网络限速至 3G，并测试使用体验
- **无回归问题**：确保功能仍然正常
- **用户感知**：用户是否*感觉*速度更快？

请记住：性能是一项功能。快速的体验会让产品显得响应更迅速、更精致、更专业。系统化地进行优化，严格地测量，并优先考虑用户感知到的性能。