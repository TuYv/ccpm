---
name: react-useeffect
description: React useEffect best practices from official docs. Use when writing/reviewing useEffect, useState for derived values, data fetching, or state synchronization. Teaches when NOT to use Effect and better alternatives.
---
# 你可能不需要 Effect

Effect 是 React 的**逃生舱口**。它让你能够与外部系统同步。如果不涉及外部系统，你就不应该需要 Effect。

## 快速参考

| 情况 | 不要 | 应该 |
|-----------|-------|-----|
| 从 props/state 派生状态 | `useState` + `useEffect` | 在渲染期间计算 |
| 昂贵的计算 | 用 `useEffect` 来缓存 | `useMemo` |
| prop 变化时重置状态 | `useEffect` 配合 `setState` | `key` prop |
| 响应用户事件 | 用 `useEffect` 监听状态 | 直接使用事件处理器 |
| 通知父组件变化 | 在 `useEffect` 中调用 `onChange` | 在事件处理器中调用 |
| 获取数据 | 不带清理的 `useEffect` | 带清理的 `useEffect` 或框架方案 |

## 什么时候确实需要 Effect

- 与**外部系统**同步（非 React 组件、浏览器 API）
- **订阅**外部 store（尽可能使用 `useSyncExternalStore`）
- 因组件已显示而运行的**分析/日志记录**
- 带适当清理的**数据获取**（或使用框架的内置机制）

## 什么时候不需要 Effect

1. **为渲染转换数据** - 在顶层计算，会自动重新运行
2. **处理用户事件** - 使用事件处理器，你确切知道发生了什么
3. **派生状态** - 直接计算即可：`const fullName = firstName + ' ' + lastName`
4. **链式状态更新** - 在事件处理器中计算所有下一个状态

## 决策树

```
Need to respond to something?
├── User interaction (click, submit, drag)?
│   └── Use EVENT HANDLER
├── Component appeared on screen?
│   └── Use EFFECT (external sync, analytics)
├── Props/state changed and need derived value?
│   └── CALCULATE DURING RENDER
│       └── Expensive? Use useMemo
└── Need to reset state when prop changes?
    └── Use KEY PROP on component
```

## 详细指南

- [反模式](./anti-patterns.md) - 常见错误及修复方法
- [更好的替代方案](./alternatives.md) - useMemo、key prop、状态提升、useSyncExternalStore
