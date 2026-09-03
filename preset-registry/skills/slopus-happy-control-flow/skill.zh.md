---
name: control-flow
description: >
  Analyze and design control flows and data structures. Produces compact
  ASCII tree diagrams showing triggers, call chains, payload shapes, state
  mutations, and re-render effects. Use when user asks to diagram, trace,
  visualize, or design a flow or data structure.
---
# /control-flow — 分析与设计控制流和数据结构

阅读相关源代码，并在 ```txt 代码块中生成 ASCII 树状图。

## 格式

- 每个用户操作或 IO 事件是独立的树根节点
- 使用真实的函数名和类型——绝不凭空捏造
- 用 TypeScript 类型表示载荷形状，而非文字描述
- 状态变更：哪些字段改变、由什么触发
- 重渲染链：涉及哪些组件、原因是什么
- 当流程横跨 app → CLI → server 时展示跨包内容
- 保持紧凑——跳过琐碎的透传，展示决策点

示例：

```txt
User taps "Archive"
│
├─ handleActionPress(action: SessionActionItem)
│  └─ onClose() → setActionsAnchor(null)
│
├─ sessionKill(sessionId: string)
│  ├─ POST /api/sessions/:id/kill
│  └─ → { success: boolean, message?: string }
│
└─ deleteSession(sessionId)
   ├─ mutates: sessions, sessionMessages, gitStatus, fileCache
   ├─ rebuilds: sessionListViewData
   └─ re-renders: SessionsListWrapper (data ref changed)
```

对于数据结构，展示其形状以及依赖它的内容：

```txt
SessionRowData (flat primitives, cheap deep-equal)
├─ id, name, subtitle, avatarId     ← identity + display
├─ state: SessionState              ← collapsed from presence + agentState + thinking
├─ hasDraft: boolean                ← collapsed from draft string
├─ activeAt?: number                ← only inactive sessions (avoids heartbeat diffs)
├─ machineId, path, homeDir         ← grouping in ActiveSessionsGroup
└─ completedTodosCount, totalTodosCount
   │
   consumed by:
   ├─ SessionItem         → renders purely from props, no store hooks
   ├─ ActiveSessionsGroup → groups by machineId + path
   └─ useDeepEqual        → 12 primitive comparisons vs full Session tree
```

## 原则

- 表达力强且紧凑——每一行都有存在的价值
- 展示载荷的形状而非文字描述
- 展示状态变更 → 涉及哪些 store 字段、重建什么
- 展示重渲染链 → 组件 + 原因
- 仅在节点之间的分支逻辑处使用伪代码
- 始终在 ```txt 代码块内输出以保证对齐
- 在有帮助时提供文件：行号引用，但非必需——流程比位置更重要

## 流程

1. 将主题解析为入口点
2. 使用 Grep/Explore 查找调用链
3. 在相关行处阅读每个步骤
4. 从触发点 → 最终效果构建树
5. 以 ```txt 代码块形式输出
