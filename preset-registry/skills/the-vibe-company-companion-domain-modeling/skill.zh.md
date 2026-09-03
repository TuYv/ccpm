---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a CONTEXT.md, or recording or editing an ADR.
---
# 领域建模

在设计的同时，主动构建并打磨项目的领域模型。这是一项*主动*的纪律：质疑术语、构思边界场景，并在术语与决策定型的当下就把它们写下来。（仅仅为了词汇去*阅读* `CONTEXT.md` 并不算这项技能：那是任何技能都能做到的一行式习惯。这项技能适用于你要修改模型的时刻，而不仅仅是消费模型。）

## 文件结构

大多数仓库只有单一上下文：

```
/
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

如果根目录下存在 `CONTEXT-MAP.md`，则该仓库拥有多个上下文。该映射文件指明了每个上下文所在的位置：

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

惰性地创建文件：只在有内容可写时才创建。如果不存在 `CONTEXT.md`，就在第一个术语敲定时创建它。如果不存在 `docs/adr/`，就在需要第一个 ADR 时创建它。

## 会话过程中

### 依据术语表提出质疑

当用户使用的术语与 `CONTEXT.md` 中的既有语言冲突时，立即指出。“你的术语表把 'cancellation' 定义为 X，但你似乎指的是 Y。到底是哪一个？”

### 锤炼模糊用语

当用户使用含糊或含义过载的术语时，提出一个精确的规范术语。“你说的是 'account'：指的是 Customer 还是 User？这是两种不同的东西。”

### 讨论具体场景

在讨论领域关系时，用具体场景对其进行压力测试。构思一些能探查边界情况的场景，迫使用户精确界定概念之间的边界。

### 与代码交叉核对

当用户陈述某事物的运作方式时，检查代码是否与此一致。如果发现矛盾，就把它点出来：“你的代码取消的是整个 Orders，但你刚才说部分取消是可能的。哪个才是对的？”

### 就地更新 CONTEXT.md

当一个术语敲定后，当场更新 `CONTEXT.md`。不要把这些攒到一起批量处理：随发生随记录。使用 [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md) 中的格式。

`CONTEXT.md` 应当完全不包含实现细节。不要把 `CONTEXT.md` 当作规格说明、草稿纸或实现决策的存放地。它就是一份术语表，仅此而已。

### 谨慎提议 ADR

只有当以下三点全部成立时，才提议创建 ADR：

1. **难以逆转**：日后改变主意的代价不可忽视
2. **脱离上下文会令人费解**：未来的读者会疑惑“他们当时为什么这么做？”
3. **真实权衡的结果**：当时确实存在多个备选方案，而你出于特定理由选定了其中之一

若三者中缺少任何一条，就跳过该 ADR。使用 [ADR-FORMAT.md](./ADR-FORMAT.md) 中的格式。
