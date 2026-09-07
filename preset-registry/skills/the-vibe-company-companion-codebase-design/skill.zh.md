---
name: codebase-design
description: Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when another skill needs the deep-module vocabulary.
---
# 代码库设计

设计**深模块**：将大量行为置于一个小接口之后，安放在一道干净的接缝上，并可通过该接口进行测试。凡是在设计或重构代码之处，都使用这套术语和这些原则。其目标是：让调用者获得杠杆，让维护者获得局部性，让所有人获得可测试性。

## 术语表

请严格使用这些术语：不要用 "component"、"service"、"API" 或 "boundary" 来替代。术语一致正是全部要义。

**模块（Module）**：任何具有接口和实现的东西。刻意保持规模无关：可以是一个函数、类、包，也可以是横跨多个层级的切片。_避免使用_：unit、component、service。

**接口（Interface）**：调用者要正确使用该模块所必须知道的一切：既包括类型签名，也包括不变量、顺序约束、错误模式、必需的配置以及性能特征。_避免使用_：API、signature（太窄，它们只指类型层面的表面）。

**实现（Implementation）**：模块内部的东西，即它的代码主体。与**适配器（Adapter）**相区分：一个东西可以是小适配器配大实现（例如一个 Postgres 仓储），也可以是大适配器配小实现（例如一个内存 fake）。当话题围绕接缝时，选用“适配器”；其余场合用“实现”。

**深度（Depth）**：接口层面的杠杆。指调用者（或测试）每学习一单位接口所能驱动的行为量。当大量行为居于一个小接口之后时，模块是**深的**；当接口几乎与实现一样复杂时，模块是**浅的**。

**接缝（Seam）**_（Michael Feathers）_：一处无需在原地修改代码即可改变行为的地方；也是模块接口所处的*位置*。接缝放在哪里，本身就是一个独立的设计决策，与接缝背后放什么互不相干。_避免使用_：boundary（因 DDD 的 bounded context 而语义过载）。

**适配器（Adapter）**：在接缝处满足某个接口的具体事物。它描述的是*角色*（填补的是哪个空位），而非实质（里面装的是什么）。

**杠杆（Leverage）**：调用者从深度中获得的东西。每学习一单位接口，换来的能力更多。一份实现可在 N 个调用点和 M 个测试中获得回报。

**局部性（Locality）**：维护者从深度中获得的东西。变更、缺陷、知识和验证都集中在一处，而不是散布到各个调用者那里。修一次，处处修好。

## 深与浅

**深模块** = 小接口 + 大量实现：

```
┌─────────────────────┐
│   Small Interface   │  ← Few methods, simple params
├─────────────────────┤
│                     │
│  Deep Implementation│  ← Complex logic hidden
│                     │
└─────────────────────┘
```

**浅模块** = 大接口 + 少量实现（应避免）：

```
┌─────────────────────────────────┐
│       Large Interface           │  ← Many methods, complex params
├─────────────────────────────────┤
│  Thin Implementation            │  ← Just passes through
└─────────────────────────────────┘
```

在设计接口时，问自己：

- 能否减少方法的数量？
- 能否简化参数？
- 能否把更多复杂度藏进内部？

## 原则

- **深度是接口的属性，而非实现的属性。** 一个深模块在内部可以由一些小的、可 mock、可替换的部件组成；只是这些部件并不属于接口。一个模块既可以拥有接口处的**外部接缝**，也可以拥有**内部接缝**（对实现私有、供其自身测试使用）。
- **删除测试。** 想象把这个模块删掉。如果复杂度随之消失，说明它只是在做透传。如果复杂度在 N 个调用者那里重新出现，说明它物有所值。
- **接口就是测试面。** 调用者和测试穿过的是同一道接缝。如果你想要测到接口*背后*去，这个模块的形状多半不对。
- **一个适配器意味着一道假想的接缝。两个适配器才意味着一道真实的接缝。** 除非确实有东西会在这道接缝两侧发生变化，否则不要引入接缝。

## 为可测试性而设计

好的接口让测试变得自然：

1. **接受依赖，而不是自己创建依赖。**

   ```typescript
   // Testable
   function processOrder(order, paymentGateway) {}

   // Hard to test
   function processOrder(order) {
     const gateway = new StripeGateway();
   }
   ```

2. **返回结果，而不是产生副作用。**

   ```typescript
   // Testable
   function calculateDiscount(cart): Discount {}

   // Hard to test
   function applyDiscount(cart): void {
     cart.total -= discount;
   }
   ```

3. **更小的表面积。** 方法更少 = 所需测试更少。参数更少 = 测试准备更简单。

## 关系

- 一个**模块**恰好拥有一个**接口**（即它呈现给调用者和测试的表面）。
- **深度**是**模块**的属性，相对于其**接口**来衡量。
- **接缝**是**模块**的**接口**所在之处。
- **适配器**坐落于**接缝**处，并满足**接口**。
- **深度**为调用者带来**杠杆**，为维护者带来**局部性**。

## 不采用的提法

- **把深度当作实现行数与接口行数之比**（Ousterhout）：这会奖励为实现注水。我们转而采用“深度即杠杆”的界定。
- **把“接口”理解为 TypeScript 的 `interface` 关键字或某个类的公有方法**：太窄了：这里的接口包含调用者必须知道的每一个事实。
- **"boundary"**：因 DDD 的 bounded context 而语义过载。请改说**接缝**或**接口**。

## 深入探究

- **在给定依赖的前提下加深一个模块簇**，参见 [DEEPENING.md](DEEPENING.md)：依赖分类、接缝纪律，以及“替换而非叠加”的测试方法。
- **探索备选的接口设计**，参见 [DESIGN-IT-TWICE.md](DESIGN-IT-TWICE.md)：并行启动多个子代理，以几种截然不同的方式设计接口，然后从深度、局部性和接缝位置上进行比较。
