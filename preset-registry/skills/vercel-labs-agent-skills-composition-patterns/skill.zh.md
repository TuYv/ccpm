---
name: vercel-composition-patterns
description:
  React composition patterns that scale. Use when refactoring components with
  boolean prop proliferation, building flexible component libraries, or
  designing reusable APIs. Triggers on tasks involving compound components,
  render props, context providers, or component architecture. Includes React 19
  API changes.
license: MIT
metadata:
  author: vercel
  version: '1.0.0'
---
# React 组合模式

用于构建灵活、可维护的 React 组件的组合模式。通过使用复合组件、提升状态和组合内部实现，避免布尔 props 的泛滥。这些模式让代码库在规模扩大时，无论对人类还是 AI 智能体都更易于操作。

## 何时应用

在以下情况下参考这些指南：

- 重构带有大量布尔 props 的组件
- 构建可复用的组件库
- 设计灵活的组件 API
- 审查组件架构
- 使用复合组件或 context provider

## 按优先级划分的规则类别

| 优先级 | 类别           | 影响 | 前缀            |
| ------ | -------------- | ---- | --------------- |
| 1      | 组件架构       | 高   | `architecture-` |
| 2      | 状态管理       | 中   | `state-`        |
| 3      | 实现模式       | 中   | `patterns-`     |
| 4      | React 19 API   | 中   | `react19-`      |

## 快速参考

### 1. 组件架构（高）

- `architecture-avoid-boolean-props` - 不要为了自定义行为而添加布尔 props；应使用组合
- `architecture-compound-components` - 通过共享 context 来组织复杂组件

### 2. 状态管理（中）

- `state-decouple-implementation` - Provider 是唯一知道状态如何管理的地方
- `state-context-interface` - 定义包含 state、actions、meta 的通用接口，用于依赖注入
- `state-lift-state` - 将状态移入 provider 组件，以便兄弟组件访问

### 3. 实现模式（中）

- `patterns-explicit-variants` - 创建显式的变体组件，而不是布尔模式
- `patterns-children-over-render-props` - 使用 children 进行组合，而不是 renderX props

### 4. React 19 API（中）

> **⚠️ 仅限 React 19+。** 如果使用 React 18 或更早版本，请跳过本节。

- `react19-no-forwardref` - 不要使用 `forwardRef`；使用 `use()` 而非 `useContext()`

## 如何使用

阅读各个规则文件以获取详细说明和代码示例：

```
rules/architecture-avoid-boolean-props.md
rules/state-context-interface.md
```

每个规则文件包含：

- 简要说明该规则为何重要
- 附有说明的错误代码示例
- 附有说明的正确代码示例
- 补充背景与参考资料

## 完整汇总文档

获取包含所有规则完整展开内容的完整指南：`AGENTS.md`
