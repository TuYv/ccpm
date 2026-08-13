---
name: codebase-design
description: Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when another skill needs the deep-module vocabulary.
---
# 代码库设计

设计**深层模块**：在一个小接口后承载大量行为，将其放在清晰的 seam 处，并通过该接口可测试。无论是在设计还是重构代码时，都请使用这套语言和原则。目标是为调用者提供更高的 leverage，为维护者提供更好的 locality，并让每个人都更易于测试。

## 术语表

请准确使用这些术定语，不要用“component”“service”“API”或“boundary”替代。“边界”与“边界上下文”概念重叠才是关键。“模块”一词必须保持一致。

**Module** — 任何同时具有接口与实现的东西。刻意与规模无关：函数、类、包，或跨层切片。_避免_：unit, component, service。

**Interface** — 调用者正确使用模块所需了解的一切：类型签名，以及不变量、顺序约束、错误模式、所需配置和性能特征。_避免_：API、签名（太窄——只能指代类型层面的表面）。

**Implementation** — 模块内部的内容，即代码主体。与**Adapter**不同：一个事物可以是小型适配器却有庞大实现（如一个 Postgres 仓库），也可以是大型适配器却只有很小实现（如内存假实现）。当话题在 seam 上时用“adapter”；否则用“implementation”。

**Depth** — 接口处的 leverage：调用者（或测试）每学习一单位接口所能驱动的行为量。模块在接口很小而行为很多时是**深层**的，若接口几乎与实现同样复杂则是**浅层**的。

**Seam** _(Michael Feathers)_ — 一个可以在不修改该处代码的情况下改变行为的位置；即模块接口所在的*位置*。将 seam 放在哪是另一个独立设计决策，区别于在 seam 后放置什么。_避免_：boundary（与 DDD 的 bounded context 含义重叠）。

**Adapter** — 在 seam 上满足接口的具体对象。描述的是*角色*（填补什么职责位），不是内部实质（里面是什么）。

**Leverage** — 深度带给调用者的回报：每单位学习到的接口能力更强。一个实现能够在 N 个调用点与 M 个测试中复用收益。

**Locality** — 深度带给维护者的好处：变更、缺陷、知识和验证都集中在一处，而不是分散到所有调用者。修一次、全局生效。

## 深/浅模块

**Deep module** = 小接口 + 大量实现：

```
┌─────────────────────┐
│   Small Interface   │  ← Few methods, simple params
├─────────────────────┤
│                     │
│  Deep Implementation│  ← Complex logic hidden
│                     │
└─────────────────────┘
```

**Shallow module** = 大接口 + 少量实现（应避免）：

```
┌─────────────────────────────────┐
│       Large Interface           │  ← Many methods, complex params
├─────────────────────────────────┤
│  Thin Implementation            │  ← Just passes through
└─────────────────────────────────┘
```

设计接口时，请思考：

- 我能减少方法数量吗？
- 我能简化参数吗？
- 我能把更多复杂性隐藏到内部吗？

## 原则

- **深度是接口的属性，而非实现的属性。** 一个深模块可以在内部由小型、可 mock、可替换的部分组成——它们只是没有暴露在接口上。一个模块既可以有**内部 seam**（对实现私有，由自身测试使用），也可以有其**外部 seam**（位于其接口）。
- **删除测试。** 想象把模块删除掉。如果复杂性消失了，说明它只是透传；如果复杂性在 N 个调用者间重新出现，那么它确实在发挥作用。
- **接口是测试面。** 调用者和测试会跨越同一个 seam。如果你需要测试**超越**接口的行为，那么这个模块的形状可能不对。
- **一个适配器意味着假设中的 seam；两个适配器意味着真实 seam。** 除非某些东西确实在其间变化，否则不要引入 seam。

## 为可测试性而设计

良好接口使测试变得自然：

1. **接收依赖，不要创建依赖。**

   ```typescript
   // Testable
   function processOrder(order, paymentGateway) {}

   // Hard to test
   function processOrder(order) {
     const gateway = new StripeGateway();
   }
   ```

2. **返回结果，不要产生副作用。**

   ```typescript
   // Testable
   function calculateDiscount(cart): Discount {}

   // Hard to test
   function applyDiscount(cart): void {
     cart.total -= discount;
   }
   ```

3. **接口表面要小。** 方法越少，需要的测试越少。参数越少，测试搭建也越简单。

## 关系

- 一个**Module**只有一个**Interface**（它向调用者和测试暴露的表面）。
- **Depth**是**Module**的属性，依据其**Interface**进行衡量。
- **Seam**是**Module**的**Interface**所在的位置。
- 一个**Adapter**位于**Seam**上并满足**Interface**。
- **Depth**为调用者带来**Leverage**，为维护者带来**Locality**。

## 被否定的表述

- **将实现行数与接口行数的比值作为深度**（Ousterhout）：会鼓励填充实现代码。我们使用“按 leverage 计算的深度”。
- 将“**Interface**”理解为 TypeScript 的 `interface` 关键字或类的 public 方法：过于狭窄——这里的接口包含调用者必须知道的全部事实。
- **“Boundary”**：与 DDD 的 bounded context 概念重叠。请使用**seam**或**interface**。

## 进一步深入

- **按依赖加深一个 cluster** —— 见 [DEEPENING.md](DEEPENING.md)：依赖类别、seam 纪律，以及 replace-don't-layer 测试。
- **探索备选接口** —— 见 [DESIGN-IT-TWICE.md](DESIGN-IT-TWICE.md)：并行启动多个子代理，以几种截然不同的方式设计接口，再从深度、locality 和 seam 位置上进行比较。
