---
name: react-best-practices
description: React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---
# Vercel React 最佳实践

由 Vercel 维护的 React 和 Next.js 应用综合性能优化指南。包含 8 个类别的 77 条规则（70 条上游规则 + 7 条本地规则），并按影响程度划分优先级，用于指导自动化重构和代码生成。

## 适用场景

在以下情况下参考这些指南：
- 编写新的 React 组件或 Next.js 页面
- 实现数据获取（客户端或服务端）
- 审查代码中的性能问题
- 重构现有 React/Next.js 代码
- 优化包体积或加载时间

## 按优先级划分的规则类别

| 优先级 | 类别 | 影响 | 前缀 |
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

- `async-cheap-condition-before-await` - 在等待标志或远程值之前，先检查成本较低的同步条件
- `async-defer-await` - 将 await 移至实际使用它的分支中
- `async-parallel` - 对独立操作使用 Promise.all()
- `async-dependencies` - 对部分依赖使用 better-all
- `async-api-routes` - 在 API 路由中尽早启动 promise，延后执行 await
- `async-suspense-boundaries` - 使用 Suspense 流式传输内容

### 2. 包体积优化（严重）

- `bundle-barrel-imports` - 直接导入，避免使用桶文件
- `bundle-analyzable-paths` - 优先使用可静态分析的导入路径和文件系统路径，以避免生成过大的包和追踪范围
- `bundle-dynamic-imports` - 对重量级组件使用 next/dynamic
- `bundle-defer-third-party` - 在水合完成后加载分析/日志记录功能
- `bundle-conditional` - 仅在功能激活时加载模块
- `bundle-preload` - 在悬停/聚焦时预加载，以提升感知速度

### 3. 服务端性能（高）

- `server-auth-actions` - 像 API 路由一样对服务器操作进行身份验证
- `server-cache-react` - 使用 React.cache() 实现单次请求内的去重
- `server-cache-lru` - 使用 LRU 缓存实现跨请求缓存
- `server-dedup-props` - 避免在 RSC props 中重复序列化
- `server-hoist-static-io` - 将静态 I/O（字体、徽标）提升至模块级别
- `server-no-shared-module-state` - 避免在 RSC/SSR 中使用模块级可变请求状态
- `server-serialization` - 尽量减少传递给客户端组件的数据
- `server-parallel-fetching` - 重构组件以并行执行数据获取
- `server-parallel-nested-fetching` - 在 Promise.all 中按项目串联嵌套的数据获取
- `server-after-nonblocking` - 对非阻塞操作使用 after()
- `server-rsc-tanstack-hybrid` - 对交互式页面使用 RSC 预获取 + TanStack Query 水合的混合模式

### 4. 客户端数据获取（中高）

- `client-swr-dedup` - 使用 SWR 自动对请求进行去重
- `client-event-listeners` - 对全局事件监听器进行去重
- `client-passive-event-listeners` - 为滚动事件使用被动监听器
- `client-localstorage-schema` - 对 localStorage 数据进行版本控制并将其最小化
- `client-use-action-state` - React 19：使用 useActionState 将 Server Actions 与表单连接起来
- `client-use-form-status` - React 19：使用 useFormStatus 读取父表单的 pending 状态
- `client-use-optimistic` - React 19：使用 useOptimistic 提供即时的变更反馈
- `client-state-management` - 决策树：useState / URL / TanStack Query / Zustand / Jotai

### 5. 重渲染优化（中等）

- `rerender-defer-reads` - 不要订阅仅在回调中使用的状态
- `rerender-memo` - 将开销较大的工作提取到经过记忆化的组件中
- `rerender-memo-with-default-value` - 提升非原始类型的默认 props
- `rerender-dependencies` - 在 effects 中使用原始类型依赖项
- `rerender-derived-state` - 订阅派生的布尔值，而不是原始值
- `rerender-derived-state-no-effect` - 在渲染期间派生状态，而不是在 effects 中
- `rerender-functional-setstate` - 使用函数式 setState 以获得稳定的回调
- `rerender-lazy-state-init` - 对于开销较大的值，将函数传给 useState
- `rerender-simple-expression-in-memo` - 避免对简单的原始类型值使用 memo
- `rerender-split-combined-hooks` - 拆分具有独立依赖项的 hooks
- `rerender-move-effect-to-event` - 将交互逻辑放入事件处理器
- `rerender-transitions` - 对非紧急更新使用 startTransition
- `rerender-use-deferred-value` - 延迟开销较大的渲染，以保持输入响应流畅
- `rerender-use-ref-transient-values` - 对频繁变化的瞬时值使用 refs
- `rerender-no-inline-components` - 不要在组件内部定义组件
- `rerender-react-compiler` - 启用 React Compiler 后，它会取代手动使用的 memo/useMemo/useCallback

### 6. 渲染性能（中等）

- `rendering-animate-svg-wrapper` - 为 div 包装器添加动画，而不是 SVG 元素
- `rendering-content-visibility` - 对长列表使用 content-visibility
- `rendering-hoist-jsx` - 将静态 JSX 提取到组件外部
- `rendering-svg-precision` - 降低 SVG 坐标精度
- `rendering-hydration-no-flicker` - 对仅客户端数据使用内联脚本
- `rendering-hydration-suppress-warning` - 抑制预期内的不匹配警告
- `rendering-activity` - 使用 Activity 组件控制显示/隐藏
- `rendering-conditional-render` - 使用三元运算符进行条件渲染，而不是 &&
- `rendering-usetransition-loading` - 优先使用 useTransition 管理加载状态
- `rendering-resource-hints` - 使用 React DOM 资源提示进行预加载
- `rendering-script-defer-async` - 在 script 标签上使用 defer 或 async

### 7. JavaScript 性能（低至中等）

- `js-batch-dom-css` - 通过 classes 或 cssText 批量处理 CSS 更改
- `js-index-maps` - 构建 Map 以进行重复查找
- `js-cache-property-access` - 在循环中缓存对象属性
- `js-cache-function-results` - 在模块级 Map 中缓存函数结果
- `js-cache-storage` - 缓存 localStorage/sessionStorage 读取结果
- `js-combine-iterations` - 将多次 filter/map 操作合并为单次循环
- `js-length-check-first` - 在进行开销较大的比较前检查数组长度
- `js-early-exit` - 提前从函数返回
- `js-hoist-regexp` - 将 RegExp 的创建提升到循环外部
- `js-min-max-loop` - 使用循环而不是排序来求最小值/最大值
- `js-set-map-lookups` - 使用 Set/Map 实现 O(1) 查找
- `js-tosorted-immutable` - 使用 toSorted() 保持不可变性
- `js-flatmap-filter` - 使用 flatMap 在单次遍历中完成映射和过滤
- `js-request-idle-callback` - 将非关键工作推迟到浏览器空闲时执行

### 8. 高级模式（低优先级）

- `advanced-effect-event-deps` - 不要将 `useEffectEvent` 的结果放入 effect 依赖项中
- `advanced-event-handler-refs` - 将事件处理器存储在 ref 中
- `advanced-init-once` - 每次应用加载时仅初始化应用一次
- `advanced-use-latest` - 使用 useLatest 获取稳定的回调 ref
- `advanced-use-hook-promise` - React 19：在 Suspense 下，use() 可在客户端组件中解包 Promise

## 使用方法

阅读各个规则文件以了解详细说明和代码示例：

```
rules/async-parallel.md
rules/bundle-barrel-imports.md
```

每个规则文件包含：
- 对其重要性的简要说明
- 错误代码示例及说明
- 正确代码示例及说明
- 其他上下文和参考资料

## 完整汇编文档

如需查看展开所有规则的完整指南，请参阅：`AGENTS.md`