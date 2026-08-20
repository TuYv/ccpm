---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a CONTEXT.md, or recording or editing an ADR.
---
# 领域建模

在设计过程中，主动构建并完善项目的领域模型。这是一项*主动的*实践：质疑术语、构想边界场景，并在术语表和决策明确成形的那一刻将其记录下来。（仅仅为了了解词汇而*阅读* `CONTEXT.md` 并不属于这项技能：那只是任何技能都能做到的一行式习惯。这项技能适用于你正在改变模型，而不只是使用模型的情况。）

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

如果根目录中存在 `CONTEXT-MAP.md`，则该仓库包含多个上下文。该映射文件会指明每个上下文所在的位置：

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

按需创建文件：只有在确实有内容可写时才创建。如果不存在 `CONTEXT.md`，就在第一个术语得到明确时创建它。如果不存在 `docs/adr/`，就在需要编写第一份 ADR 时创建它。

## 会话期间

### 对照术语表提出质疑

当用户使用的术语与 `CONTEXT.md` 中已有的语言相冲突时，立即指出。“你的术语表将‘取消’定义为 X，但你似乎想表达 Y。究竟是哪一个？”

### 明确模糊语言

当用户使用含糊或含义过载的术语时，提出一个精确的规范术语。“你说的是‘账户’：你指的是客户还是用户？它们是不同的概念。”

### 讨论具体场景

在讨论领域关系时，使用具体场景对其进行压力测试。构想能够探查边界情况的场景，促使用户精确说明概念之间的边界。

### 与代码交叉核对

当用户说明某项机制如何运作时，检查代码是否与之相符。如果发现矛盾，就指出来：“你的代码会取消整个订单，但你刚才说可以部分取消。哪一种才是正确的？”

### 即时更新 CONTEXT.md

当一个术语得到明确时，立即更新 `CONTEXT.md`。不要集中到之后再处理：术语一旦明确，就将其记录下来。使用 [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md) 中的格式。

`CONTEXT.md` 应当完全不包含实现细节。不要把 `CONTEXT.md` 当作规范、草稿本或实现决策的存储库。它只是一个术语表，除此之外别无其他用途。

### 谨慎提议编写 ADR

只有同时满足以下三个条件时，才提议创建 ADR：

1. **难以逆转**：日后改变决定会产生显著成本
2. **缺少上下文时令人意外**：未来的读者会疑惑“他们为什么要这样做？”
3. **源于真实的权衡**：确实存在其他可选方案，并且你出于特定原因选择了其中一个

如果缺少其中任何一个条件，就不要编写 ADR。使用 [ADR-FORMAT.md](./ADR-FORMAT.md) 中的格式。