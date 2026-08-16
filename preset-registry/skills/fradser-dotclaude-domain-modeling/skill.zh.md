---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when the user wants to pin down domain terminology or a ubiquitous language, record an architectural decision, or when another skill needs to maintain the domain model.
---
# 领域建模

在设计过程中，主动构建并完善项目的领域模型。这是一项*主动的*工作——质疑术语、构想边界场景，并在术语表和决策明确下来的那一刻将其记录下来。（仅仅为了了解词汇而*阅读* `CONTEXT.md` 并不属于这项技能——那只是任何技能都能做到的一行式习惯。这项技能适用于你正在改变模型，而不只是使用模型的时候。）

## 文件结构

大多数仓库只有一个上下文：

```
/
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

如果根目录中存在 `CONTEXT-MAP.md`，则该仓库包含多个上下文。该映射文件会指出每个上下文所在的位置：

```
/
├── CONTEXT-MAP.md
├── docs/
│   └── adr/                          ← system-wide decisions
├── src/
│   ├── ordering/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                 ← context-specific decisions
│   └── billing/
│       ├── CONTEXT.md
│       └── docs/adr/
```

按需创建文件——仅在有内容可写时才创建。如果不存在 `CONTEXT.md`，请在第一个术语得到明确后创建它。如果不存在 `docs/adr/`，请在需要第一份 ADR 时创建该目录。

## 会话期间

### 对照术语表提出质疑

当用户使用的术语与 `CONTEXT.md` 中的既有语言冲突时，应立即指出。“你的术语表将‘取消’定义为 X，但你现在似乎表达的是 Y——究竟是哪一个？”

### 明确模糊语言

当用户使用含糊或含义过多的术语时，提出一个精确的规范术语。“你说的是‘账户’——你指的是客户还是用户？它们是不同的概念。”

### 讨论具体场景

讨论领域关系时，使用具体场景进行压力测试。构想能够探查边界情况的场景，促使用户精确说明概念之间的边界。

### 与代码交叉核对

当用户说明某项机制如何运作时，检查代码是否与其一致。如果发现矛盾，应明确指出：“你的代码会取消整个订单，但你刚才说可以部分取消——哪一种才是正确的？”

### 即时更新 CONTEXT.md

术语一旦明确，就立即更新 `CONTEXT.md`。不要集中到最后再处理——在术语明确时随即记录。使用 [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md) 中的格式。

`CONTEXT.md` 应完全不包含实现细节。不要将 `CONTEXT.md` 视为规范、草稿本或实现决策的存放处。它只是术语表，仅此而已。

## 关键要求：CONTEXT.md 只是术语表，仅此而已

绝不要将 `CONTEXT.md` 视为规范、草稿本或实现决策的存放处——其中禁止出现实现细节。在已明确的术语成形时立即记录；只有当某项决策难以逆转、缺乏上下文便令人意外，并且确实是权衡取舍的结果时，才提出创建 ADR。

### 谨慎提出创建 ADR

只有在以下三个条件全部满足时，才提出创建 ADR：

1. **难以逆转**——日后改变决定的成本不可忽视
2. **脱离上下文会令人费解**——未来的读者会疑惑：“他们为什么要这样做？”
3. **真实权衡的结果**——确实存在其他可行方案，而你出于特定原因选择了其中一种

如果不满足以上任一条件，就跳过 ADR。请使用 [ADR-FORMAT.md](./ADR-FORMAT.md) 中的格式。