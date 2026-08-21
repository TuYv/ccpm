---
name: moai-ref-react-patterns
description: >
  React/Next.js component design patterns, state management strategies, and project
  structure reference for frontend development. Agent-extending skill that amplifies
  frontend domain work (spawned via Agent(general-purpose) with frontend instructions)
  with production-grade React patterns.
  NOT for: backend API design, database modeling, DevOps, mobile apps.

when_to_use: >
  Use for React/Next.js component design patterns: state-management
  strategies, hooks, component composition, and project structure.
  Amplifies frontend domain work (Agent(general-purpose) with frontend
  instructions) with production-grade React patterns.

user-invocable: false
metadata:
  version: "1.0.0"
  category: "domain"
  status: "active"
  updated: "2026-03-30"
  tags: "react, nextjs, component, patterns, frontend, reference"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 3000
---
# React 模式参考

## 目标生成方式

前端领域工作通过带有前端指令的 `Agent(general-purpose)` 生成——将这些模式直接应用于组件设计和状态管理。

## 组件设计模式

### 1. 复合组件
父组件和子组件通过 Context 共享隐式状态。

适用于：Tab、Accordion、Dropdown、Select  
结构：`<Select>` + `<Select.Trigger>` + `<Select.Option>`

### 2. 自定义 Hook（提取模式）
将状态逻辑提取到可复用的 Hook 中。

适用于：表单管理、API 调用、localStorage、防抖  
命名：必须使用 `use` 前缀——`useForm`、`useDebounce`、`useAuth`

### 3. 容器组件与展示组件分离
将数据逻辑（容器组件）与 UI（展示组件）分离。

适用于：大型应用、需要可测试性时  
容器组件：数据获取、状态管理、事件处理程序  
展示组件：仅根据 props 渲染，保持函数纯粹性

### 4. 无头组件
提供行为和状态，但不提供 UI。

适用于：独立于设计系统的逻辑  
示例：无头 `useCombobox`、`useDialog`、`useTable`

## 状态管理选择指南

| 状态类型 | 工具 | 理由 |
|-----------|------|-----------|
| UI 局部状态 | useState, useReducer | 组件内部使用 |
| 服务端状态 | React Query / TanStack Query | 缓存、重新获取、乐观更新 |
| 全局客户端状态 | Zustand | 简洁、样板代码少 |
| 复杂全局状态 | Zustand + Immer | 方便实现不可变性 |
| URL 状态 | nuqs / useSearchParams | 筛选、分页 |
| 表单状态 | React Hook Form + Zod | 集成式验证 |
| 主题/i18n | Context + Provider | 变更频率低 |

### 决策流程
```
Restorable from URL? -> URL state (nuqs)
Server data? -> React Query
Shared across components? -> Zustand
Component-internal? -> useState
Complex transitions? -> useReducer
```

## Next.js App Router 结构

```
src/
├── app/                    # App Router
│   ├── (auth)/             # Auth route group
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/             # Main route group
│   │   ├── dashboard/page.tsx
│   │   └── settings/page.tsx
│   ├── api/                # API Routes
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home
├── components/
│   ├── ui/                 # Base UI (Button, Input, Modal)
│   └── features/           # Feature components
│       ├── auth/
│       └── dashboard/
├── hooks/                  # Custom hooks
├── lib/                    # Utilities, config
├── stores/                 # Zustand stores
├── types/                  # TypeScript types
└── styles/                 # Global styles
```

## 组件质量标准

| 项目 | 标准 |
|------|----------|
| 组件大小 | 少于 200 行（超过时进行拆分） |
| Props | 不超过 5 个（超过时组合成对象） |
| 自定义 Hook | 复用逻辑时始终提取 |
| 错误边界 | 在页面级别设置 |
| 加载状态 | 为所有异步操作提供加载 UI |
| 表单验证 | 同时在客户端和服务端进行验证 |

## 性能模式

| 模式 | 适用场景 | 工具 |
|---------|------|------|
| 记忆化 | 高开销计算 | `useMemo`, `React.memo` |
| 懒加载 | 减小打包体积 | `React.lazy`, `next/dynamic` |
| 虚拟化 | 包含 1000 个以上项目的列表 | `@tanstack/react-virtual` |
| 图像优化 | 图像加载 | `next/image` |
| 乐观更新 | 即时反馈 | React Query `onMutate` |
| 防抖 | 搜索、输入 | `useDeferredValue` 或自定义 hook |

## 错误处理

### 分层错误边界
```
RootErrorBoundary (global)
  └── LayoutErrorBoundary (per section)
      └── ComponentErrorFallback (individual)
```

### API 错误处理
| HTTP 状态码 | 客户端处理 |
|------------|----------------|
| 401 | 自动登出并重定向 |
| 403 | 未授权 UI |
| 404 | 未找到页面 |
| 422 | 按字段显示表单错误 |
| 429 | 重试并显示等待通知 |
| 500 | 通用错误并显示重试按钮 |

## 无障碍检查清单

- [ ] 所有图像均有替代文本
- [ ] 键盘导航（Tab、Enter、Escape）
- [ ] ARIA 标签（aria-label、role）
- [ ] 颜色对比度达到 4.5:1 或以上
- [ ] 可见的焦点指示器
- [ ] 语义化 HTML（button、nav、main、section）

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的错误理由

| 错误理由 | 实际情况 |
|---|---|
| “在 React 19 中使用 useEffect 获取数据没问题” | React 19 提供了用于获取数据的 use() 和服务器组件。使用 useEffect 发起 fetch 是一种会导致瀑布式请求的旧有模式。 |
| “全局状态比逐层传递 props 更简单” | 全局状态会让相距较远的组件产生耦合。逐层传递 props 或通过 children 进行组合更可预测，也更易于测试。 |
| “我之后会添加 TypeScript 类型” | 无类型组件会不断积累类型为 any 的调用方。为一个已投入使用的组件补加类型，要比一开始就使用类型困难得多。 |
| “这个组件不需要记忆化” | 过早进行记忆化是一种浪费，但对于渲染列表或复杂树结构的组件，应进行性能分析，而不是想当然地认为它们运行得很快。 |
| “CSS-in-JS 没问题，大家都在用” | CSS-in-JS 会增加运行时开销和打包体积。Tailwind 或 CSS Modules 可以实现相同的作用域隔离，而无需付出这些代价。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 在服务器组件或 use() 可用时，仍使用 useEffect 获取数据
- 组件接收超过 5 个 props，却未进行拆分或对象分组
- 使用状态管理库管理可在服务器端缓存的数据（应改用 React Query 或 SWR）
- 使用内联样式或硬编码的像素值，而不是设计令牌
- 处理异步操作的组件未使用错误边界包裹

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 数据获取使用服务器组件、use() 或 React Query（而不是 useEffect + fetch）
- [ ] 组件为所有 props 定义了 TypeScript 接口
- [ ] 错误边界包裹了包含异步操作的组件
- [ ] 已完成无障碍检查清单（替代文本、键盘导航、ARIA、对比度、焦点、语义化）
- [ ] 不存在内联样式或硬编码的颜色/间距值（使用设计令牌）
- [ ] 组件可在 React Strict Mode 中正确渲染（不存在双重 effect 问题）

<!-- moai:evolvable-end -->