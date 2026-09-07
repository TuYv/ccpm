---
name: vercel-react-best-practices
description: React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---
# Vercel React 最佳实践

由 Vercel 维护的 React 和 Next.js 应用综合性能优化指南。包含 8 个类别共 70 条规则，按影响程度排定优先级，用于指导自动化重构和代码生成。

## 适用时机

在以下情况中参考这些指南：
- 编写新的 React 组件或 Next.js 页面时
- 实现数据获取（客户端或服务端）时
- 审查代码以排查性能问题时
- 重构现有 React/Next.js 代码时
- 优化包体积或加载时间时

## 按优先级排列的规则类别

| 优先级 | 类别 | 影响程度 | 前缀 |
|----------|----------|--------|--------|
| 1 | 消除瀑布流 | 严重 | `async-` |
| 2 | 包体积优化 | 严重 | `bundle-` |
| 3 | 服务端性能 | 高 | `server-` |
| 4 | 客户端数据获取 | 中高 | `client-` |
| 5 | 重渲染优化 | 中 | `rerender-` |
| 6 | 渲染性能 | 中 | `rendering-` |
| 7 | JavaScript 性能 | 中低 | `js-` |
| 8 | 高级模式 | 低 | `advanced-` |

## 快速参考

### 1. 消除瀑布流（严重）

- `async-cheap-condition-before-await` - 在 await 标志或远程值之前，先检查开销小的同步条件
- `async-defer-await` - 将 await 移入实际使用它的分支
- `async-parallel` - 对相互独立的操作使用 Promise.all()
- `async-dependencies` - 对部分依赖使用 better-all
- `async-api-routes` - 在 API 路由中尽早启动 promise，尽量晚地 await
- `async-suspense-boundaries` - 使用 Suspense 流式传输内容

### 2. 包体积优化（严重）

- `bundle-barrel-imports` - 直接导入，避免桶文件
- `bundle-analyzable-paths` - 优先使用可静态分析的导入路径和文件系统路径，避免打包范围和追踪范围过大
- `bundle-dynamic-imports` - 对重量级组件使用 next/dynamic
- `bundle-defer-third-party` - 在 hydration 之后再加载分析/日志功能
- `bundle-conditional` - 仅在功能被激活时才加载模块
- `bundle-preload` - 在悬停/聚焦时预加载，提升感知速度

### 3. 服务端性能（高）

- `server-auth-actions` - 像 API 路由一样对 Server Actions 进行身份验证
- `server-cache-react` - 使用 React.cache() 实现按请求去重
- `server-cache-lru` - 使用 LRU 缓存进行跨请求缓存
- `server-dedup-props` - 避免 RSC props 中的重复序列化
- `server-hoist-static-io` - 将静态 I/O（字体、logo）提升到模块级别
- `server-no-shared-module-state` - 在 RSC/SSR 中避免模块级的可变请求状态
- `server-serialization` - 尽量减少传递给客户端组件的数据
- `server-parallel-fetching` - 重构组件结构以并行化 fetch 请求
- `server-parallel-nested-fetching` - 在 Promise.all 中按条目串联嵌套 fetch
- `server-after-nonblocking` - 使用 after() 执行非阻塞操作

### 4. 客户端数据获取（中高）

- `client-swr-dedup` - 使用 SWR 自动对请求去重
- `client-event-listeners` - 对全局事件监听器去重
- `client-passive-event-listeners` - 对滚动使用被动监听器
- `client-localstorage-schema` - 对 localStorage 数据进行版本管理并尽量精简

### 5. 重渲染优化（中）

- `rerender-defer-reads` - 不要订阅仅在回调中使用的状态
- `rerender-memo` - 将开销大的工作提取到记忆化组件中
- `rerender-memo-with-default-value` - 提升默认的非原始类型 props
- `rerender-dependencies` - 在 effect 中使用原始类型的依赖
- `rerender-derived-state` - 订阅派生布尔值而非原始值
- `rerender-derived-state-no-effect` - 在渲染期间派生状态，而不是在 effect 中
- `rerender-functional-setstate` - 使用函数式 setState 获得稳定的回调
- `rerender-lazy-state-init` - 对开销大的值向 useState 传入函数
- `rerender-simple-expression-in-memo` - 避免对简单原始值使用 memo
- `rerender-split-combined-hooks` - 拆分具有独立依赖的 hook
- `rerender-move-effect-to-event` - 将交互逻辑放入事件处理器
- `rerender-transitions` - 使用 startTransition 处理非紧急更新
- `rerender-use-deferred-value` - 延迟开销大的渲染以保持输入的响应性
- `rerender-use-ref-transient-values` - 对频繁变化的临时值使用 ref
- `rerender-no-inline-components` - 不要在组件内部定义组件

### 6. 渲染性能（中）

- `rendering-animate-svg-wrapper` - 对 div 包裹层做动画，而不是 SVG 元素
- `rendering-content-visibility` - 对长列表使用 content-visibility
- `rendering-hoist-jsx` - 将静态 JSX 提取到组件外部
- `rendering-svg-precision` - 降低 SVG 坐标精度
- `rendering-hydration-no-flicker` - 对仅客户端使用的数据使用内联 script
- `rendering-hydration-suppress-warning` - 抑制预期中的不匹配警告
- `rendering-activity` - 使用 Activity 组件实现显示/隐藏
- `rendering-conditional-render` - 条件渲染使用三元运算符，而非 &&
- `rendering-usetransition-loading` - 处理加载状态时优先使用 useTransition
- `rendering-resource-hints` - 使用 React DOM 资源提示进行预加载
- `rendering-script-defer-async` - 在 script 标签上使用 defer 或 async

### 7. JavaScript 性能（中低）

- `js-batch-dom-css` - 通过 class 或 cssText 批量处理 CSS 变更
- `js-index-maps` - 为重复查找构建 Map
- `js-cache-property-access` - 在循环中缓存对象属性
- `js-cache-function-results` - 在模块级 Map 中缓存函数结果
- `js-cache-storage` - 缓存 localStorage/sessionStorage 读取
- `js-combine-iterations` - 将多个 filter/map 合并为一个循环
- `js-length-check-first` - 在进行开销大的比较之前先检查数组长度
- `js-early-exit` - 在函数中提前返回
- `js-hoist-regexp` - 将 RegExp 的创建提升到循环外部
- `js-min-max-loop` - 用循环而非排序求最大/最小值
- `js-set-map-lookups` - 使用 Set/Map 实现 O(1) 查找
- `js-tosorted-immutable` - 使用 toSorted() 保持不可变性
- `js-flatmap-filter` - 使用 flatMap 一趟完成映射和过滤
- `js-request-idle-callback` - 将非关键工作推迟到浏览器空闲时间执行

### 8. 高级模式（低）

- `advanced-effect-event-deps` - 不要将 `useEffectEvent` 的结果放入 effect 依赖中
- `advanced-event-handler-refs` - 将事件处理器存储在 ref 中
- `advanced-init-once` - 每次应用加载时仅初始化一次
- `advanced-use-latest` - 使用 useLatest 获得稳定的回调引用

## 使用方法

阅读各个规则文件以获取详细说明和代码示例：

```
rules/async-parallel.md
rules/bundle-barrel-imports.md
```

每个规则文件包含：
- 关于该规则为何重要的简要说明
- 带说明的错误代码示例
- 带说明的正确代码示例
- 额外的上下文和参考资料

## 完整汇编文档

如需展开所有规则的完整指南：`AGENTS.md`
