---
name: vercel-react-best-practices
description: React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements.
---
# Vercel React 最佳实践

### 何时加载

- **触发条件**：React 或 Next.js 开发、组件编写、数据获取模式、包优化
- **跳过条件**：项目未使用 React 或 Next.js

由 Vercel 维护的 React 和 Next.js 应用综合性能优化指南。包含分布在 8 个类别中的 45 条规则，并按影响程度确定优先级，用于指导自动化重构和代码生成。

## 何时应用

在以下情况下参考这些指南：

- 编写新的 React 组件或 Next.js 页面
- 实现数据获取（客户端或服务端）
- 审查代码中的性能问题
- 重构现有 React/Next.js 代码
- 优化包大小或加载时间

## 按优先级划分的规则类别

| 优先级 | 类别                      | 影响程度 | 前缀         |
| ------ | ------------------------- | -------- | ------------ |
| 1      | 消除瀑布流                | 严重     | `async-`     |
| 2      | 包大小优化                | 严重     | `bundle-`    |
| 3      | 服务端性能                | 高       | `server-`    |
| 4      | 客户端数据获取            | 中高     | `client-`    |
| 5      | 重新渲染优化              | 中       | `rerender-`  |
| 6      | 渲染性能                  | 中       | `rendering-` |
| 7      | JavaScript 性能           | 中低     | `js-`        |
| 8      | 高级模式                  | 低       | `advanced-`  |

## 快速参考

### 1. 消除瀑布流（严重）

- `async-defer-await` - 将 await 移至实际使用它的分支中
- `async-parallel` - 对相互独立的操作使用 Promise.all()
- `async-dependencies` - 对部分依赖关系使用 better-all
- `async-api-routes` - 在 API 路由中尽早启动 promise，延后 await
- `async-suspense-boundaries` - 使用 Suspense 流式传输内容

### 2. 包大小优化（严重）

- `bundle-barrel-imports` - 直接导入，避免使用桶文件
- `bundle-dynamic-imports` - 对大型组件使用 next/dynamic
- `bundle-defer-third-party` - 在 hydration 后加载分析/日志功能
- `bundle-conditional` - 仅在功能激活时加载模块
- `bundle-preload` - 在悬停/聚焦时预加载，以提升感知速度

### 3. 服务端性能（高）

- `server-cache-react` - 使用 React.cache() 进行单次请求内的去重
- `server-cache-lru` - 使用 LRU 缓存实现跨请求缓存
- `server-serialization` - 尽量减少传递给客户端组件的数据
- `server-parallel-fetching` - 重构组件以并行执行数据获取
- `server-after-nonblocking` - 使用 after() 执行非阻塞操作

### 4. 客户端数据获取（中高）

- `client-swr-dedup` - 使用 SWR 自动进行请求去重
- `client-event-listeners` - 对全局事件监听器进行去重

### 5. 重新渲染优化（中）

- `rerender-defer-reads` - 不要订阅仅在回调中使用的状态
- `rerender-memo` - 将高开销工作提取到经过 memoization 的组件中
- `rerender-dependencies` - 在 effect 中使用原始值依赖项
- `rerender-derived-state` - 订阅派生布尔值，而不是原始值
- `rerender-functional-setstate` - 使用函数式 setState 以获得稳定的回调
- `rerender-lazy-state-init` - 对高开销值向 useState 传入函数
- `rerender-transitions` - 对非紧急更新使用 startTransition

### 6. 渲染性能（中等）

- `rendering-animate-svg-wrapper` - 为 div 包装器添加动画，而不是 SVG 元素
- `rendering-content-visibility` - 对长列表使用 content-visibility
- `rendering-hoist-jsx` - 将静态 JSX 提取到组件外部
- `rendering-svg-precision` - 降低 SVG 坐标精度
- `rendering-hydration-no-flicker` - 对仅客户端数据使用内联脚本
- `rendering-activity` - 使用 Activity 组件实现显示/隐藏
- `rendering-conditional-render` - 条件渲染使用三元运算符，而不是 &&

### 7. JavaScript 性能（低至中等）

- `js-batch-dom-css` - 通过类或 cssText 批量处理 CSS 更改
- `js-index-maps` - 为重复查找构建 Map
- `js-cache-property-access` - 在循环中缓存对象属性
- `js-cache-function-results` - 在模块级 Map 中缓存函数结果
- `js-cache-storage` - 缓存 localStorage/sessionStorage 读取结果
- `js-combine-iterations` - 将多次 filter/map 合并为一次循环
- `js-length-check-first` - 在执行高开销比较之前检查数组长度
- `js-early-exit` - 从函数中提前返回
- `js-hoist-regexp` - 将 RegExp 的创建提升到循环外部
- `js-min-max-loop` - 使用循环而不是排序来求最小值/最大值
- `js-set-map-lookups` - 使用 Set/Map 实现 O(1) 查找
- `js-tosorted-immutable` - 使用 toSorted() 保持不可变性

### 8. 高级模式（低）

- `advanced-event-handler-refs` - 将事件处理程序存储在 refs 中
- `advanced-use-latest` - 使用 useLatest 获取稳定的回调 refs

## 完整编译文档

如需查看包含所有规则的完整展开说明和详细代码示例的完整指南，请参阅 [AGENTS.md](AGENTS.md)。

每条规则包含：

- 对其重要性的简要说明
- 带说明的错误代码示例
- 带说明的正确代码示例
- 其他背景信息和参考资料