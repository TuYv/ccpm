---
name: vercel-react-best-practices
description: React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---
# Vercel React 最佳实践

由 Vercel 维护的 React 和 Next.js 应用综合性能优化指南。包含分为 8 个类别的 57 条规则，并按影响程度确定优先级，用于指导自动化重构和代码生成。

## 何时应用

在以下情况中参考这些指南：
- 编写新的 React 组件或 Next.js 页面
- 实现数据获取（客户端或服务端）
- 审查代码中的性能问题
- 重构现有的 React/Next.js 代码
- 优化包体积或加载时间

## 按优先级划分的规则类别

| 优先级 | 类别 | 影响程度 | 前缀 |
|----------|----------|--------|--------|
| 1 | 消除瀑布流 | 严重 | `async-` |
| 2 | 包体积优化 | 严重 | `bundle-` |
| 3 | 服务端性能 | 高 | `server-` |
| 4 | 客户端数据获取 | 中高 | `client-` |
| 5 | 重新渲染优化 | 中 | `rerender-` |
| 6 | 渲染性能 | 中 | `rendering-` |
| 7 | JavaScript 性能 | 中低 | `js-` |
| 8 | 高级模式 | 低 | `advanced-` |

## 快速参考

### 1. 消除瀑布流（严重）

- `async-defer-await` - 将 await 移至实际使用它的分支中
- `async-parallel` - 对相互独立的操作使用 Promise.all()
- `async-dependencies` - 对部分依赖关系使用 better-all
- `async-api-routes` - 在 API 路由中尽早启动 promise，延后 await
- `async-suspense-boundaries` - 使用 Suspense 流式传输内容

### 2. 包体积优化（严重）

- `bundle-barrel-imports` - 直接导入，避免使用桶文件
- `bundle-dynamic-imports` - 对大型组件使用 next/dynamic
- `bundle-defer-third-party` - 在 hydration 完成后加载分析/日志记录功能
- `bundle-conditional` - 仅在功能启用时加载模块
- `bundle-preload` - 在悬停/聚焦时预加载，提升感知速度

### 3. 服务端性能（高）

- `server-auth-actions` - 像 API 路由一样对服务器操作进行身份验证
- `server-cache-react` - 使用 React.cache() 实现单次请求内的去重
- `server-cache-lru` - 使用 LRU 缓存实现跨请求缓存
- `server-dedup-props` - 避免在 RSC props 中重复序列化
- `server-serialization` - 尽量减少传递给客户端组件的数据
- `server-parallel-fetching` - 重构组件以并行执行数据获取
- `server-after-nonblocking` - 使用 after() 执行非阻塞操作

### 4. 客户端数据获取（中高）

- `client-swr-dedup` - 使用 SWR 自动进行请求去重
- `client-event-listeners` - 对全局事件监听器进行去重
- `client-passive-event-listeners` - 对滚动事件使用被动监听器
- `client-localstorage-schema` - 对 localStorage 数据进行版本管理并尽量精简

### 5. 重新渲染优化（中）

- `rerender-defer-reads` - 不要订阅仅在回调中使用的状态
- `rerender-memo` - 将高开销工作提取到经过记忆化处理的组件中
- `rerender-memo-with-default-value` - 提升默认的非原始类型 props
- `rerender-dependencies` - 在 effects 中使用原始类型依赖项
- `rerender-derived-state` - 订阅派生布尔值，而不是原始值
- `rerender-derived-state-no-effect` - 在渲染期间派生状态，而不是在 effects 中
- `rerender-functional-setstate` - 使用函数式 setState 以获得稳定的回调
- `rerender-lazy-state-init` - 对高开销值向 useState 传入函数
- `rerender-simple-expression-in-memo` - 避免对简单的原始类型值使用 memo
- `rerender-move-effect-to-event` - 将交互逻辑放入事件处理程序
- `rerender-transitions` - 对非紧急更新使用 startTransition
- `rerender-use-ref-transient-values` - 对频繁变化的临时值使用 refs

### 6. 渲染性能（中等）

- `rendering-animate-svg-wrapper` - 为 div 包装器添加动画，而不是 SVG 元素
- `rendering-content-visibility` - 对长列表使用 content-visibility
- `rendering-hoist-jsx` - 将静态 JSX 提取到组件外部
- `rendering-svg-precision` - 降低 SVG 坐标精度
- `rendering-hydration-no-flicker` - 对仅客户端数据使用内联脚本
- `rendering-hydration-suppress-warning` - 抑制预期的不匹配警告
- `rendering-activity` - 使用 Activity 组件实现显示/隐藏
- `rendering-conditional-render` - 条件渲染使用三元运算符，而不是 &&
- `rendering-usetransition-loading` - 加载状态优先使用 useTransition

### 7. JavaScript 性能（低至中等）

- `js-batch-dom-css` - 通过类或 cssText 批量处理 CSS 更改
- `js-index-maps` - 为重复查找构建 Map
- `js-cache-property-access` - 在循环中缓存对象属性
- `js-cache-function-results` - 在模块级 Map 中缓存函数结果
- `js-cache-storage` - 缓存 localStorage/sessionStorage 读取结果
- `js-combine-iterations` - 将多次 filter/map 合并为一次循环
- `js-length-check-first` - 在执行高开销比较之前检查数组长度
- `js-early-exit` - 从函数中提前返回
- `js-hoist-regexp` - 将 RegExp 创建提升到循环外部
- `js-min-max-loop` - 使用循环而不是排序来求最小值/最大值
- `js-set-map-lookups` - 使用 Set/Map 实现 O(1) 查找
- `js-tosorted-immutable` - 使用 toSorted() 保持不可变性

### 8. 高级模式（低）

- `advanced-event-handler-refs` - 将事件处理程序存储在 refs 中
- `advanced-init-once` - 每次应用加载时仅初始化应用一次
- `advanced-use-latest` - 使用 useLatest 实现稳定的回调 refs

## 使用方法

阅读各个规则文件，获取详细说明和代码示例：

```
rules/async-parallel.md
rules/bundle-barrel-imports.md
```

每个规则文件包含：
- 对其重要性的简要说明
- 带有解释的错误代码示例
- 带有解释的正确代码示例
- 补充背景信息和参考资料

## 完整汇编文档

有关展开所有规则的完整指南，请参阅：`AGENTS.md`