---
name: optimize
description: Improve interface performance across loading speed, rendering, animations, images, and bundle size. Makes experiences faster and smoother.
user-invokable: true
args:
  - name: target
    description: The feature or area to optimize (optional)
    required: false
---
识别并修复性能问题，打造更快、更流畅的用户体验。

## 评估性能问题

了解当前性能状况并识别问题：

1. **测量当前状态**：
   - **Core Web Vitals**：LCP、FID/INP、CLS 得分
   - **加载时间**：可交互时间、首次内容绘制
   - **包体积**：JavaScript、CSS、图片大小
   - **运行时性能**：帧率、内存占用、CPU 占用
   - **网络**：请求数量、负载大小、请求瀑布图

2. **识别瓶颈**：
   - 什么慢？（初始加载？交互？动画？）
   - 原因是什么？（大图片？昂贵的 JavaScript？布局抖动？）
   - 有多严重？（可感知？令人烦恼？造成阻塞？）
   - 影响到谁？（所有用户？仅移动端？慢速网络？）

**关键**：在优化前后都要测量。过早的优化浪费时间。只优化真正重要的东西。

## 优化策略

制定系统性的改进计划：

### 加载性能

**优化图片**：
- 使用现代格式（WebP、AVIF）
- 合理的尺寸（不要为了 300px 的显示加载 3000px 的图片）
- 对首屏以下的图片使用懒加载
- 响应式图片（`srcset`、`picture` 元素）
- 压缩图片（80-85% 质量通常无法察觉）
- 使用 CDN 加快分发

```html
<img 
  src="hero.webp"
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
  loading="lazy"
  alt="Hero image"
/>
```

**缩减 JavaScript 包**：
- 代码分割（基于路由、基于组件）
- Tree shaking（移除未使用的代码）
- 移除未使用的依赖
- 懒加载非关键代码
- 对大型组件使用动态导入

```javascript
// Lazy load heavy component
const HeavyChart = lazy(() => import('./HeavyChart'));
```

**优化 CSS**：
- 移除未使用的 CSS
- 关键 CSS 内联，其余异步加载
- 压缩 CSS 文件
- 对独立区域使用 CSS containment

**优化字体**：
- 使用 `font-display: swap` 或 `optional`
- 对字体做子集化（只包含需要的字符）
- 预加载关键字体
- 在合适时使用系统字体
- 限制加载的字重数量

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* Show fallback immediately */
  unicode-range: U+0020-007F; /* Basic Latin only */
}
```

**优化加载策略**：
- 关键资源优先（非关键资源用 async/defer）
- 预加载关键资源
- 预取（prefetch）可能访问的下一个页面
- 使用 service worker 实现离线/缓存
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
- 最小化 DOM 深度（越扁平越快）
- 减小 DOM 规模（元素越少越好）
- 对长列表使用 `content-visibility: auto`
- 对超长列表使用虚拟滚动（react-window、react-virtualized）

**减少绘制与合成**：
- 动画使用 `transform` 和 `opacity`（GPU 加速）
- 避免对布局属性做动画（width、height、top、left）
- 对已知的昂贵操作审慎使用 `will-change`
- 最小化绘制区域（越小越快）

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
- 目标为每帧 16ms（60fps）
- JS 动画使用 `requestAnimationFrame`
- 对滚动处理器做防抖/节流
- 尽可能使用 CSS 动画
- 动画期间避免长时间运行的 JavaScript

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

**React 专属**：
- 对昂贵的组件使用 `memo()`
- 昂贵计算使用 `useMemo()` 和 `useCallback()`
- 对长列表做虚拟化
- 对路由做代码分割
- 避免 render 中创建内联函数
- 使用 React DevTools Profiler

**框架无关**：
- 最小化重新渲染
- 对昂贵操作做防抖
- 缓存计算值
- 懒加载路由和组件

### 网络优化

**减少请求**：
- 合并小文件
- 图标使用 SVG 雪碧图
- 内联小的关键资源
- 移除未使用的第三方脚本

**优化 API**：
- 使用分页（不要一次加载全部）
- 用 GraphQL 只请求需要的字段
- 响应压缩（gzip、brotli）
- HTTP 缓存头
- 静态资源使用 CDN

**针对慢速网络的优化**：
- 基于连接状况的自适应加载（navigator.connection）
- 乐观 UI 更新
- 请求优先级排序
- 渐进增强

## Core Web Vitals 优化

### Largest Contentful Paint（LCP < 2.5s）
- 优化首屏大图
- 内联关键 CSS
- 预加载关键资源
- 使用 CDN
- 服务端渲染

### First Input Delay（FID < 100ms）/ INP（< 200ms）
- 拆分长任务
- 延迟加载非关键 JavaScript
- 重计算使用 web worker
- 减少 JavaScript 执行时间

### Cumulative Layout Shift（CLS < 0.1）
- 为图片和视频设置尺寸
- 不要在已有内容上方注入内容
- 使用 `aspect-ratio` CSS 属性
- 为广告/嵌入内容预留空间
- 避免引起布局偏移的动画

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
- 包体积分析工具（webpack-bundle-analyzer）
- 性能监控（Sentry、DataDog、New Relic）

**关键指标**：
- LCP、FID/INP、CLS（Core Web Vitals）
- Time to Interactive（TTI）
- First Contentful Paint（FCP）
- Total Blocking Time（TBT）
- 包体积
- 请求数量

**重要**：在真实设备、真实网络条件下测量。高速网络下的桌面版 Chrome 不具代表性。

**绝不**：
- 不测量就优化（过早优化）
- 为性能牺牲可访问性
- 在优化过程中破坏功能
- 到处使用 `will-change`（会创建新图层、消耗内存）
- 懒加载首屏内容
- 沉迷微优化而忽略重大问题（先优化最大的瓶颈）
- 忘记移动端性能（设备往往更慢、网络往往更慢）

## 验证改进

测试优化是否生效：

- **优化前后指标**：比较 Lighthouse 得分
- **真实用户监控**：追踪真实用户的体验改进
- **不同设备**：在低端 Android 上测试，而不只是旗舰 iPhone
- **慢速网络**：节流到 3G，测试体验
- **无回归**：确保功能仍然正常
- **用户感知**：*感觉*上是否更快了？

记住：性能就是一项功能。快速的体验让人感觉响应更灵敏、更精致、更专业。系统地优化，毫不留情地测量，并优先考虑用户感知到的性能。
