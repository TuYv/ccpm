---
name: design-testing-strategy
description: Use before writing any type of tests. Distills 14 industry sources into deterministic decision gates, schemas, and worked test examples.
---
# 设计测试策略

一份用于设计适用且符合关键性要求的测试策略参考手册。

此技能**以决策为导向**，而非哲学探讨：每个门禁都是确定性的（当 X 时 ON / 当 Y 时 OFF），每个 schema 都会被强制执行（字段顺序很重要），每个示例都会端到端完整演示。

## 如何使用此技能

1. 按顺序阅读 **决策门禁**（Gate 0 -> Gate 6）。每个门禁彼此独立——最终可以有任意子集的测试类型处于 ON 状态。
2. 应用 **策略性跳过启发式规则**，移除对当前制品而言 ROI 较低的 ON 门禁。
3. 对每个处于 ON 状态的门禁，填写 **测试矩阵 Schema**（`selected_types` entry）——字段顺序具有承载作用。
4. 在 `rejected_types` 中列出被拒绝的类型，在 `deliberately_skipped` 中列出有意跳过的类型。
5. 使用 **用例设计技术**中的 ISTQB 技术，生成一个 **Test Cases to Cover** markdown 项目符号列表。
6. 对照匹配的 **完整演示示例**进行交叉检查（A 纯函数 / B HTTP+DB endpoint / C UI component）。

---

## 决策门禁

按数字顺序应用门禁。每个门禁都会产生一个独立的布尔值（`applies: true|false`）。门禁之间**不会**相互否决——单个制品可以同时启用 unit + integration + contract + property-based。

| # | 类型 | ON 条件 | OFF 条件 | 来源 |
|---|------|---------|----------|--------|
| 0 | **全部跳过** | 关键性为 `NONE`（仅文档、注释、格式化、生成代码、不含逻辑的配置、一次性原型） | 存在分支、计算输出、副作用或用户可见行为 | [Pragmatic Programmer](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/) ——“进行严格且有效的测试”意味着在 ROI 为零时应有效地跳过 |
| 1 | **Unit** | 代码包含任何逻辑：分支、循环、条件判断、计算、转换、解析、验证、格式化 | 纯声明式连接（DI 注册、路由表），且不包含任何行为 | [Test Pyramid (Vocke)](https://martinfowler.com/articles/practical-test-pyramid.html) 基础层 + [Beck TDD](https://www.oreilly.com/library/view/test-driven-development/0321146530/) Red-Green-Refactor unit |
| 2 | **Integration** | 存在边界跨越：HTTP 调用、DB 查询、外部 SDK、消息队列、文件系统 I/O，或者与 >=2 个不同协作者协作且 unit double 会扭曲行为 | 纯函数，没有 I/O，且只有 0-1 个稳定协作者 | [Testing Trophy (Dodds)](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) ——integration 是 ROI 最高的层；[Google "Follow the User"](https://testing.googleblog.com/2020/10/testing-on-toilet-testing-ui-logic.html) |
| 3 | **Component or E2E** | UI 表面 AND 关键性 >= MEDIUM-HIGH AND 面向用户的关键路径（注册、结账、身份验证、支付、主要 CTA） | 仅供内部管理使用的界面、开发工具或非关键 UI | [Test Pyramid top](https://martinfowler.com/articles/practical-test-pyramid.html) + [ISO/IEC/IEEE 29119](https://en.wikipedia.org/wiki/ISO/IEC_29119) 风险分级 + [Google e2e principles](https://testing.googleblog.com/2016/09/testing-on-toilet-what-makes-good-end.html) |
| 4 | **Contract** | 公共 API 被 >=1 个不同客户端使用（移动端 + Web、多个内部服务、外部合作伙伴）AND 部署节奏相互独立 | 消费者和提供者一起部署的 API | [Pact / CDC](https://docs.pact.io/) + [Pactflow CDC explainer](https://pactflow.io/what-is-consumer-driven-contract-testing/) |
| 5 | **Smoke** | 可部署表面（Web 应用、API、服务）AND 存在部署/CI 流水线，且部署后验证有意义 | 库、内部辅助工具或不存在部署流水线 | [Google "What Makes a Good End-to-End Test"](https://testing.googleblog.com/2016/09/testing-on-toilet-what-makes-good-end.html) ——smoke = 用于部署门禁的最小 e2e |
| 6 | **Property-Based** | 输入域较大或无界（数值范围、字符串、列表、解析器、序列化器、编码器、数学运算）AND 不变量稳定（往返、幂等性、单调性、交换律）AND 关键性 >= MEDIUM-HIGH | 输入域较小且有限、不变量不稳定或关键性为 LOW | [Hypothesis / QuickCheck](https://hypothesis.works/articles/what-is-property-based-testing/) |

### Gate 应用算法

```
for gate in [Gate 0, Gate 1, ..., Gate 6]:
    if gate.ON_condition_met(artifact):
        result[gate.type] = applies: true
    else:
        result[gate.type] = applies: false

if Gate 0 is true:
    short-circuit: emit empty selected_types, document criticality=NONE, stop
```

**关键性等级**（由 Gate 3 和 Gate 6 使用）：

| 等级 | 定义 |
|-------|------------|
| `NONE` | 文档、格式化、生成的代码、一次性代码、不包含逻辑的配置 |
| `LOW` | 内部开发工具、仅限管理员使用的界面、日志格式化器 |
| `MEDIUM` | 标准 CRUD、只有一个团队使用者的内部 API、非关键 UI、辅助函数和工具类 |
| `MEDIUM-HIGH` | 关键路径上的面向用户的 UI、由多个使用者使用的公共 API、业务工作流 |
| `HIGH` | 资金流转、身份验证/授权决策、安全关键型验证、数据完整性、受监管领域 |

---

## 测试类型参考

| 类型 | 适用场景 | 不适用场景 | 框架 | 典型依赖项 | Google 大小 |
|------|----------|-----------------|------------|----------------------|-------------|
| **unit** | 纯逻辑、单个函数/方法/类、确定性输入 | 代码只是没有逻辑的 I/O 编排 | vitest, jest, pytest, go test, JUnit, xUnit, RSpec | 无（或内存中的伪实现） | [小型](https://testing.googleblog.com/2010/12/test-sizes.html) |
| **integration** | 跨越边界（DB、HTTP、队列、FS）；存在多个协作者且模拟会扭曲行为 | 没有边界的纯函数 | vitest, jest, pytest, go test, JUnit + [Testcontainers](https://testcontainers.com/), supertest, TestRestTemplate | 通过 Testcontainers 提供的真实 Postgres/Redis/Kafka、进程内 HTTP 服务器、tmpdir 中的真实 FS | [中型](https://testing.googleblog.com/2010/12/test-sizes.html)（单台机器，localhost 可用） |
| **component** | 单个组件内的 UI 渲染和交互，不需要完整应用上下文 | 仅后端逻辑；跨页面用户流程 | React Testing Library, Vue Test Utils, Angular TestBed, Storybook interaction tests | jsdom 或 happy-dom，在 fetch/axios 层模拟的网络 | 小型至中型 |
| **e2e** | 通过运行中应用的完整用户路径：真实浏览器、真实后端、真实 DB | 内部辅助函数、单个组件、非关键 UI | [Playwright](https://playwright.dev/), [Cypress](https://www.cypress.io/), Selenium | 真实运行中的应用 + 由 Testcontainers 支持的 DB 或已填充数据的 staging 环境 | [大型](https://abseil.io/resources/swe-book/html/ch11.html)（多进程，可能跨多台机器） |
| **smoke** | 部署后是否继续的检查：访问 / health、关键端点有响应、登录有效 | 详细正确性；smoke 按设计就是浅层检查 | Playwright（1-3 条关键路径）、HTTP 探测脚本、k6 最小场景 | 真实部署环境 | 大型 |
| **contract** | 由 2 个或更多具有独立部署节奏的不同客户端使用的公共 API | 单一使用者的内部 API；提供方和使用方一起部署 | [Pact](https://docs.pact.io/), Spring Cloud Contract, OpenAPI schema validators | Pact broker 或仓库中的 contract 文件 | 中型 |
| **property-based** | 具有稳定不变量的大型/无界输入域（解析器、序列化器、编码器、数学运算） | 小型有限输入空间；不稳定的不变量 | [Hypothesis](https://hypothesis.works/)（Python）、fast-check (TS)、QuickCheck (Haskell)、jqwik (Java)、proptest (Rust) | 与 unit 相同 | 小型 |

### Google Test 大小映射

[Google Test 大小（Bland）](https://mike-bland.com/2011/11/01/small-medium-large.html) 和 [Google 软件工程师第 11 章](https://abseil.io/resources/swe-book/html/ch11.html) 按 **资源**（大小）对测试进行分类，与所覆盖的 **范围**（路径）无关：

| 大小 | 进程模型 | 网络 | 文件系统 | 时间预算 | 备注 |
|------|---------------|---------|------------|-------------|-------|
| `small` | 单进程、单线程 | 无 | 无（仅内存中） | < 100ms | 快速、密闭、可并行 |
| `medium` | 单台机器，允许多个进程 | 仅限 localhost | 允许使用 tmpdir | < 1s | Testcontainers 适用于此级别 |
| `large` | 多台机器 | 允许外部网络 | 允许使用持久化文件系统 | < 15min | 完整端到端测试 |
| `enormous` | 分布式 | 广域网络 | 任意位置 | 更长 | 集群 / 混沌测试 |

测试的 **类型**（unit/integration/e2e）和 **大小**（small/medium/large）是正交的：小型集成测试（在同一进程中通过 JDBC 使用 Testcontainers Postgres）是合理的。

### Playwright 与 Cypress（UI 端到端测试）

| 维度 | [Playwright](https://playwright.dev/) | [Cypress](https://www.cypress.io/) |
|-----------|---------------------------------------|-----------------------------------|
| 浏览器 | Chromium、Firefox、WebKit | Chromium、Firefox、WebKit（受限） |
| 多标签页 / 多源 | 支持 | 受限 |
| 并行 | 内置分片 | 付费 dashboard 或外部工具 |
| 网络拦截 | 健壮的路由级拦截 | cy.intercept |
| 默认选择 | 除非团队已经标准化使用 Cypress，否则新项目选择 Playwright | 团队已有大量投入时选择 Cypress |

---

## 用例设计技术

使用 ISTQB Foundation Level 黑盒技术，推导每种选定测试类型中需要测试的 **内容**。参考资料：[ISTQB BVA 白皮书](https://istqb.org/wp-content/uploads/2025/10/Boundary-Value-Analysis-white-paper.pdf)、[ASTQB 黑盒技术](https://astqb.org/4-2-black-box-test-techniques/)。

### 1. 等价类划分（EP）

将输入域划分为多个分区，在这些分区中系统预期具有相同的行为；每个分区只需一个测试即可。

**完整示例** — `discount(orderTotal: number) -> number`：

| 分区 | 范围 | 代表性测试输入 | 预期结果 |
|-----------|-------|---------------------------|----------|
| 低于阈值 | `0 <= total < 100` | `50` | `0% discount` |
| 中间档位 | `100 <= total < 500` | `250` | `5% discount` |
| 最高档位 | `total >= 500` | `1000` | `10% discount` |
| 无效（负数） | `total < 0` | `-1` | `throw / error` |

四个测试即可覆盖所有分区。单独使用 EP 会遗漏边界——应与 BVA 结合使用。

### 2. 边界值分析（BVA）

缺陷往往集中在边界处。对于每个边界值 `B`，测试 **`B-1`、`B`、`B+1`**（对于浮点数，则使用可表示的最小步长）。

**完整示例** — 同一个 `discount` 函数，边界为 `100`：

| 测试输入 | 原因 | 预期结果 |
|------------|-----|----------|
| `99` (= B-1) | “低于阈值”分区中的最后一个值 | `0% discount` |
| `100` (= B) | “中间档位”分区中的第一个值 | `5% discount` |
| `101` (= B+1) | 确认没有出现差二错误 | `5% discount` |

对于 `500` 边界重复同样的测试：测试 `499`、`500`、`501`。总计：6 个边界测试 + 4 个 EP 测试 = 10 个用例。

`B-1 / B / B+1` 三元组在各个边界处具有相同的结构（输入不同、预期输出不同、断言相同）；这非常适合采用**表驱动测试**（参见下面的第 5 小节）。

### 3. 判定表

当输出取决于多个条件的组合时使用。每一列代表一条规则。

**完整示例** — `canCheckout(cartHasItems, paymentValid, addressOnFile)`：

| 条件 / 规则 | R1 | R2 | R3 | R4 |
|------------------|----|----|----|----|
| cartHasItems | T | T | T | F |
| paymentValid | T | T | F | * |
| addressOnFile | T | F | * | * |
| **结果** | 允许 | 阻止：地址 | 阻止：支付 | 阻止：购物车 |

每条规则对应一个测试，共四个测试（`*` = 不关心，通过合并省略）。

### 4. 状态转换

当行为取决于历史状态时使用。识别状态、事件以及禁止的转换。

**完整示例** — 状态为 `{draft, submitted, paid, shipped, cancelled}` 的订单状态机：

| 起始状态 | 事件 | 目标状态 | 测试 |
|------|-------|----|----|
| draft | submit | submitted | 正常路径 |
| submitted | pay | paid | 正常路径 |
| paid | ship | shipped | 正常路径 |
| draft | cancel | cancelled | 提前取消 |
| paid | cancel | reject | 禁止 — 需要退款流程，不能直接取消 |
| shipped | submit | reject | 禁止 |

每个合法转换覆盖一个测试，每个禁止的转换覆盖一个测试（负向路径）。

### 5. 表驱动测试

当 EP、BVA 或判定表分析产生**3 个或更多结构相同的用例**时（设置相同、断言相同，只有输入和预期输出不同——例如解析有效/无效的日期格式、计算不同税率档位的税额、路由规则），将它们合并为一个**表驱动测试**。这些用例成为数据表中的行；测试主体遍历各行，并对每一行执行一次断言。参考资料：Dave Cheney，[Prefer table-driven tests](https://dave.cheney.net/2019/05/07/prefer-table-driven-tests)；[Go wiki: TableDrivenTests](https://go.dev/wiki/TableDrivenTests)。

当不同用例之间的设置、框架调用或断言结构存在较大差异时，**不要**强行使用表格。强行统一会将真实差异隐藏在单个名称之后，并产生晦涩的失败消息——应将这些用例保留为单独的、各自命名的测试。

**完整示例** — 针对 `discount(orderTotal)` 的六个 EP+BVA 用例（边界为 `100`）合并为一个表驱动单元测试（TS / vitest 语法；同样的模式适用于 Go 的 `t.Run`、JUnit 的 `@ParameterizedTest`、pytest 的 `parametrize`）：

```ts
describe("discount", () => {
  const cases: Array<{ name: string; input: number; expected: number }> = [
    { name: "EP: below threshold (typical)", input: 50,  expected: 0    },
    { name: "BVA: B-1 at boundary 100",      input: 99,  expected: 0    },
    { name: "BVA: B at boundary 100",        input: 100, expected: 0.05 },
    { name: "BVA: B+1 at boundary 100",      input: 101, expected: 0.05 },
    { name: "EP: mid tier (typical)",        input: 250, expected: 0.05 },
    { name: "EP: top tier (typical)",        input: 1000, expected: 0.10 },
  ];

  for (const c of cases) {
    it(c.name, () => {
      expect(discount(c.input)).toBe(c.expected);
    });
  }
});
```

`name` 列是必需的：每一行都必须生成一个可单独定位的测试，以便失败时指向具体案例，而不是“6 行中的第 3 行”。需要使用不同断言的行（例如，负输入案例会抛出异常）应作为独立测试保留在表格之外。

---

## 依赖决策

对于 Gate 2（集成）和 Gate 3（组件/E2E），应有意选择依赖项。目标是：在 CI 中仍能确定性运行的前提下，实现**最大程度的真实行为**。

| 依赖方式 | 适用场景 | 避免使用的场景 | 备注 |
|------------------|----------|------------|-------|
| **通过 [Testcontainers](https://testcontainers.com/) 使用真实基础设施** | DB/Redis/Kafka/Browser；开发需要真实驱动行为；需要隔离且可复现的 CI | 冷启动预算 < 1s；没有 Docker 可用 | Postgres / Redis / Kafka / Localstack 的集成测试默认采用此方式 |
| **内存中的伪实现** | 接口由本方拥有；语义简单（键值对、列表）；测试速度至关重要 | 伪实现与真实实现存在偏差——在集成边界产生静默错误 | 可接受用于六边形架构中的 repository 端口，前提是该端口有针对真实基础设施的独立契约测试 |
| **Mock（测试替身）** | 只有一个具有纯接口的协作者；测试关注协议（是否以 Y 调用了 X） | Mock 超过 2 个协作者，或 Mock 数据结构（反模式：不完整的 Mock） | Mock 是用于隔离的工具，而不是被测试的对象 |
| **Stub 化 HTTP** | 调用外部 SaaS，且不存在 Testcontainers / Localstack 选项 | 需要 Pact / CDC 时（应改用契约测试） | nock（Node）、responses（Python）、WireMock（JVM） |
| **真实外部服务** | 仅用于 staging 中的冒烟测试 | 单元测试 / 集成测试 / CI——始终具有非确定性 | 仅用于针对 staging 的冒烟测试 |

**权衡总结**：Testcontainers > 内存中的伪实现 > Mock，但成本也朝同一方向递增。选择不会误导边界行为的最低成本级别。

---

## 策略性跳过启发式规则

明确的“无需费心”规则。跳过这些测试并不是懒惰——根据 [ISO/IEC/IEEE 29119 风险驱动测试](https://en.wikipedia.org/wiki/ISO/IEC_29119) 和[基于风险的测试](https://www.softwaretestinghelp.com/risk-management-during-test-planning-risk-based-testing/)，这是经过风险调整的投入产出比。

| 跳过项 | 规则 |
|------|------|
| **内部辅助函数不做 e2e** | 如果工件没有 UI 表面，也没有面向用户的路径，则跳过 e2e。单元测试 + 集成测试已足够。 |
| **由部署绑定的消费者 API 不做契约测试** | 如果只有一个客户端使用该 API，且双方一起部署，契约测试只会增加维护成本，不会带来解耦收益。 |
| **小型有限域不做基于属性的测试** | 如果输入空间是 `enum {A, B, C}`，EP + BVA 已经覆盖；基于属性的测试只会增加基础设施，却不会发现更多错误。 |
| **纯函数不做集成测试** | 为测试 `formatCurrency` 辅助函数而启动 Postgres 容器是浪费。只做单元测试。 |
| **静态标记不做组件测试** | 如果组件没有状态、没有事件、没有条件渲染，那么快照就足够了——或者完全跳过。 |
| **声明式 wiring 不做单元测试** | DI 绑定、路由注册、schema 声明：应在集成层级断言（例如路由是否提供了正确的处理程序）。 |
| **集成测试能够可靠覆盖的内容不做 e2e** | 根据 [Google 的 e2e 原则](https://testing.googleblog.com/2016/09/testing-on-toilet-what-makes-good-end.html)：能够用更小规模的测试覆盖某个行为时，测试越小越好。e2e 是例外，而不是默认选择。 |
| **spike/throwaway 代码不做测试** | 根据 [Beck TDD](https://www.oreilly.com/library/view/test-driven-development/0321146530/)：如果工件将在数小时内删除，应与人类协作者记录这一例外。然后为保留下来的版本编写测试。 |
| **不做包含“and”的测试** | 如果测试名称包含“and”，则将其拆分为多个独立测试（每个行为一个断言）。 |
|

---

## 测试矩阵架构

每个测试策略**必须**使用下面的 YAML 代码块表示。**每个列表条目中的字段顺序会影响解析结果**——评审器和下游工具会将第一个键解析为关键字段（rationale / reason / why），将第二个键解析为分类字段（type / what）。

### 架构

```yaml
test_strategy:
  artifact: "<path or short identifier>"
  rationale: "Why this test strategy is being applied to this artifact (specific, evidence-based)"
  criticality: "NONE | LOW | MEDIUM | MEDIUM-HIGH | HIGH"

  selected_types:
    - rationale: "Why this type is being applied to this artifact (specific, evidence-based)"
      type: "unit | integration | component | e2e | smoke | contract | property-based"
      size: "small | medium | large | enormous"
      framework: "vitest | jest | pytest | go test | JUnit | playwright | cypress | pact | hypothesis | ..."
      dependencies:
        - "List of dependencies: real Postgres via Testcontainers, in-memory fake, mocked HTTP via nock, etc."
      gate: "Gate N (the gate that triggered this selection)"

  rejected_types:
    - reason: "Why this type does NOT apply to this artifact (cite Strategic Skip Heuristic or gate that did not trigger)"
      type: "unit | integration | component | e2e | smoke | contract | property-based"

  deliberately_skipped:
    - why: "Cost / risk justification for skipping despite a partial signal"
      what: "A specific category of test cases being skipped (e.g., 'browser compatibility on IE11', 'load testing beyond 100 RPS')"
```

### YAML 示例

```yaml
test_strategy:
  artifact: "POST /users (user registration endpoint)"
  rationale: "User registration is a critical user-facing path; can be used by web and mobile apps independently of each other."
  criticality: "MEDIUM-HIGH"

  selected_types:
    - rationale: "Endpoint contains validation logic (email format, password rules, uniqueness) — Gate 1 ON for branch coverage"
      type: "unit"
      size: "small"
      framework: "vitest"
      dependencies: ["in-memory user repository fake"]
      gate: "Gate 1"
    - rationale: "Endpoint writes to Postgres and emits user.created event to Kafka — Gate 2 ON, real boundary behavior matters"
      type: "integration"
      size: "medium"
      framework: "vitest + supertest + Testcontainers"
      dependencies: ["Postgres 15 via Testcontainers", "Kafka via Testcontainers"]
      gate: "Gate 2"
    - rationale: "Consumed by mobile app and web app on independent deploy cadences — Gate 4 ON, prevents drift"
      type: "contract"
      size: "medium"
      framework: "Pact"
      dependencies: ["Pact broker"]
      gate: "Gate 4"

  rejected_types:
    - reason: "No UI surface in this artifact — Gate 3 OFF"
      type: "component"
    - reason: "No UI surface — Gate 3 OFF; e2e covered by web/mobile apps separately"
      type: "e2e"
    - reason: "Input domain (email, password) is large but invariants are well-covered by EP+BVA at unit level — property-based ROI is low at MEDIUM-HIGH criticality, only triggers Gate 6 partially"
      type: "property-based"

  deliberately_skipped:
    - why: "Project does not have post-deploy probe pipeline yet; smoke would be no-op"
      what: "Smoke test for /users after deploy"
    - why: "Non-functional load testing is out of scope for this task; tracked separately in performance backlog"
      what: "Load test verifying p99 < 200ms at 1000 RPS"
```

**字段排序检查清单**（评审人员会逐字检查）：

- `test_strategy`：`artifact` BEFORE `rationale` BEFORE `criticality`。
- `selected_types[*]`：`rationale` BEFORE `type` BEFORE `size` BEFORE `framework` BEFORE `dependencies` BEFORE `gate`。
- `rejected_types[*]`：`reason` BEFORE `type`。
- `deliberately_skipped[*]`：`why` BEFORE `what`。

---

## 用例列表模式

在矩阵之后，生成一个待实现测试用例的扁平 Markdown 项目符号列表。它与 YAML 矩阵相互独立，因为：

- a. 它列出的是要测试的*内容*，而不是测试的*方式*
- b. 它链接回验收标准

### 格式

```markdown
## Test Cases to Cover

### AC-N: [criterion title]
- [type] description 
- [type] description 

### AC-N: [criterion title]
- [type] description 
- [type] description 
```

其中：

- `type` 与矩阵中的某个 `selected_types[*].type` 相匹配
- `description` 遵循 AAA / [Given-When-Then（Dan North BDD）](https://dannorth.net/introducing-bdd/) 的结构——参见 [Bill Wake AAA（2001）](https://xp123.com/articles/3a-arrange-act-assert/)
- `AC-N` 引用该用例所验证的验收标准（如果不属于任何 AC，例如基础设施冒烟测试，则省略）

### 完整示例

```markdown
## Test Cases to Cover

### AC-1: Discount returns the correct percentage based on the total
- [unit] discount returns 0% when total = 0 [EP partition: below threshold]
- [unit] discount returns 0% when total = 99 [BVA: B-1 at boundary 100]
- [unit] discount returns 5% when total = 100 [BVA: B at boundary 100]
- [unit] discount returns 5% when total = 101 [BVA: B+1 at boundary 100]

### AC-2: Discount fails when total is invalid
- [unit] discount throws when total = -1 [EP partition: invalid]

### AC-3: /orders saves the order to the database
- [integration] POST /orders persists order to Postgres and returns 201 with order id

### AC-4: /orders rejects duplicate idempotency key
- [integration] POST /orders rejects duplicate idempotency key with 409

### AC-5: /orders/:id returns order by id
- [contract] GET /orders/:id returns schema matching mobile-app pact
```

---

## 来源与延伸阅读

以下 14 个来源为上述每个门禁和规则提供依据。如有疑问，请查阅对应门禁处链接的来源。

1. **测试金字塔** — Mike Cohn（2009，《Succeeding with Agile》）与 Ham Vocke，[The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)，martinfowler.com。
2. **测试奖杯** — Kent C. Dodds（2018），[The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) 和 [Write Tests](https://kentcdodds.com/blog/write-tests)。
3. **Google 测试规模** — Mike Bland（2011），[Small / Medium / Large](https://mike-bland.com/2011/11/01/small-medium-large.html)；[Software Engineering at Google Ch.11](https://abseil.io/resources/swe-book/html/ch11.html)；[Test Sizes (Google Testing Blog)](https://testing.googleblog.com/2010/12/test-sizes.html)。
4. **Google Testing on the Toilet** — [What Makes a Good End-to-End Test](https://testing.googleblog.com/2016/09/testing-on-toilet-what-makes-good-end.html)、[Testing UI Logic - Follow the User](https://testing.googleblog.com/2020/10/testing-on-toilet-testing-ui-logic.html)、[Origins (Mike Bland)](https://mike-bland.com/2011/10/25/testing-on-the-toilet.html)。
5. **ISTQB Foundation Level** — 黑盒技术：[Boundary Value Analysis white paper](https://istqb.org/wp-content/uploads/2025/10/Boundary-Value-Analysis-white-paper.pdf)；[ASTQB Black-Box Techniques](https://astqb.org/4-2-black-box-test-techniques/)。
6. **ISO/IEC/IEEE 29119** — 基于风险的测试过程标准。[Wikipedia overview](https://en.wikipedia.org/wiki/ISO/IEC_29119)。
7. **Kent Beck — *Test Driven Development: By Example***（Addison-Wesley，2002）。[Publisher page](https://www.oreilly.com/library/view/test-driven-development/0321146530/)。ISBN 978-0321146533。
8. **The Pragmatic Programmer（20 周年版）** — Hunt 与 Thomas（2019）。[pragprog.com](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/)。
9. **AAA 模式** — Bill Wake（2001），[3A — Arrange, Act, Assert](https://xp123.com/articles/3a-arrange-act-assert/)。**Given-When-Then** — Dan North，[Introducing BDD](https://dannorth.net/introducing-bdd/)。
10. **基于属性的测试** — [Hypothesis: What is property-based testing?](https://hypothesis.works/articles/what-is-property-based-testing/)；QuickCheck（Haskell）、fast-check（TS）。
11. **契约测试 / 消费者驱动契约** — [Pact docs](https://docs.pact.io/)；[Pactflow CDC explainer](https://pactflow.io/what-is-consumer-driven-contract-testing/)。
12. **Testcontainers** — [testcontainers.com](https://testcontainers.com/)。
13. **表格驱动测试** — Dave Cheney，[Prefer table-driven tests](https://dave.cheney.net/2019/05/07/prefer-table-driven-tests)；[Go wiki: TableDrivenTests](https://go.dev/wiki/TableDrivenTests)。
14. **基于风险的测试** — [Risk Management During Test Planning (softwaretestinghelp.com)](https://www.softwaretestinghelp.com/risk-management-during-test-planning-risk-based-testing/)。

---

## 实例讲解

每个示例包括：
- a. 工件和验收标准
- b. 逐门 walkthrough
- c. 遵循该 schema 的 `test_strategy` YAML
- d. `Test Cases to Cover` 列表
- e. 对被拒绝类型的说明

---

### 示例 A — 纯辅助函数：`formatCurrency(amount: number, code: string): string`

**工件**

```ts
function formatCurrency(amount: number, code: string): string;
// e.g. formatCurrency(1234.5, "USD") -> "$1,234.50"
//      formatCurrency(1234.5, "EUR") -> "€1.234,50"
```

**验收标准**：

- AC-1：USD 输出使用 `$` 前缀、逗号分隔千位、句点作为小数分隔符，并保留两位小数。
- AC-2：EUR 输出使用 `€` 前缀、句点分隔千位、逗号作为小数分隔符，并保留两位小数。
- AC-3：对于不支持的代码，抛出 `Error("Unknown currency code")`。
- AC-4：`amount = 0` 格式化为 `"$0.00"` / `"€0,00"`。

**重要性**：`LOW`（辅助函数仅用于显示，不涉及资金流转）。

**逐门说明**

| 门 | 决策 | 原因 |
|------|----------|--------|
| 0 跳过 | 关闭 | 包含逻辑 |
| 1 单元 | **开启** | 按货币代码分支的纯逻辑 — [测试金字塔基础](https://martinfowler.com/articles/practical-test-pyramid.html) |
| 2 集成 | 关闭 | 无 I/O，无边界 — [跳过启发式规则：纯函数无需集成测试](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) |
| 3 组件/E2E | 关闭 | 无 UI 接触面 |
| 4 契约 | 关闭 | 不是公共 API |
| 5 冒烟 | 关闭 | 不可部署 |
| 6 基于属性 | **开启**（部分） | 数值输入无界，但存在不变量（通过解析实现往返、金额的单调性）— [Hypothesis](https://hypothesis.works/articles/what-is-property-based-testing/)。在 `MEDIUM-HIGH` 时提升优先级；此处重要性为 LOW，因此仅谨慎应用（1-2 个属性） |

**`test_strategy` YAML**

```yaml
test_strategy:
  artifact: "src/util/formatCurrency.ts"
  rationale: "Pure helper function used in display only; no money movement here."
  criticality: "LOW"

  selected_types:
    - rationale: "Pure logic with currency-specific branches and number formatting; EP+BVA on amount, decision table on currency code"
      type: "unit"
      size: "small"
      framework: "vitest"
      dependencies: []
      gate: "Gate 1"
    - rationale: "Amount domain is unbounded floats; invariant 'parseCurrency(formatCurrency(x, c)) ~= x' is stable; sparingly applied (1-2 properties) at LOW criticality"
      type: "property-based"
      size: "small"
      framework: "fast-check"
      dependencies: []
      gate: "Gate 6"

  rejected_types:
    - reason: "No I/O, no boundary, no collaborators - Gate 2 OFF"
      type: "integration"
    - reason: "No UI surface - Gate 3 OFF"
      type: "component"
    - reason: "No UI surface - Gate 3 OFF"
      type: "e2e"
    - reason: "Internal helper, not consumed across deploys - Gate 4 OFF"
      type: "contract"
    - reason: "Library helper, no deploy pipeline target - Gate 5 OFF"
      type: "smoke"

  deliberately_skipped:
    - why: "Locale list is finite (USD, EUR); exhaustive enumeration via decision table is sufficient and more maintainable than i18n property tests"
      what: "Property-based fuzzing of currency code beyond known list"
```

**要覆盖的测试用例**

```markdown
### AC-1: USD output uses `$` prefix, comma thousands, period decimal, two decimal places.
- [unit] formatCurrency(1234.5, "USD") returns "$1,234.50" [EP: typical USD]
- [unit] formatCurrency(0.01, "USD") returns "$0.01" [BVA: B+1 smallest non-zero]
- [unit] formatCurrency(-0.01, "USD") returns "-$0.01" [BVA: B-1 negative side]

### AC-2: EUR output uses `€` prefix, period thousands, comma decimal, two decimal places.
- [unit] formatCurrency(1234.5, "EUR") returns "€1.234,50" [EP: typical EUR]
- [property-based] for any non-NaN finite x in [-1e9, 1e9] and code in {USD, EUR}: parseCurrency(formatCurrency(x, code)) is within 0.005 of x [round-trip invariant]

### AC-3: Throws `Error("Unknown currency code")` for unsupported codes.
- [unit] formatCurrency(1, "XYZ") throws Error("Unknown currency code") [Decision table: unknown code]

### AC-4: `amount = 0` formats as `"$0.00"` / `"€0,00"`.
- [unit] formatCurrency(0, "USD") returns "$0.00" [BVA: B at amount=0]
- [unit] formatCurrency(0, "EUR") returns "€0,00" [BVA: B at amount=0 for EUR]

```

**拒绝这些测试类型的原因**：Helper 没有边界（无集成），没有 UI（无组件/e2e），属于内部的库风格代码（无契约/冒烟），并且在 LOW 关键性下，增加其他测试类型的成本远高于收益。

---

### 示例 B — 带 DB 和多消费者的 HTTP POST 端点：`POST /users`

**制品**

一个用户注册端点，该端点：

1. 验证请求体（电子邮件格式、密码复杂度、年龄 >= 13）。
2. 在 Postgres 中检查电子邮件唯一性。
3. 插入用户记录（事务性）。
4. 向 Kafka 发出 `user.created` 事件。
5. 返回带有 `{id, email, createdAt}` 的 `201`。
6. 对无效输入返回 `400`，对重复电子邮件返回 `409`。

**使用方**：移动应用（iOS/Android）和 Web 应用，二者采用独立的部署节奏。

**验收标准**：

- AC-1：有效请求返回 `201` 并持久化用户。
- AC-2：无效电子邮件格式返回带字段级错误的 `400`。
- AC-3：不符合策略的密码返回 `400`。
- AC-4：重复电子邮件返回 `409`。
- AC-5：成功注册恰好发出一个 `user.created` 事件。
- AC-6：响应 schema 对移动端和 Web 端使用方保持稳定。

**关键性**：`MEDIUM-HIGH`（身份验证表面、身份域、多消费者公共 API）。

**门禁演练**

| 门禁 | 决策 | 原因 |
|------|----------|--------|
| 0 跳过 | OFF | 包含大量逻辑 |
| 1 单元 | **ON** | 验证器（电子邮件、密码、年龄）是纯逻辑 — [测试金字塔基础](https://martinfowler.com/articles/practical-test-pyramid.html) |
| 2 集成 | **ON** | 跨越边界：HTTP、Postgres、Kafka — [测试奖杯](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) 投资回报率的最佳点 |
| 3 组件/E2E | OFF（此处） | 此制品中没有 UI；UI 位于移动端和 Web 端代码库中，并由各自的代码库自行测试 |
| 4 契约 | **ON** | 两个不同的使用方（移动端和 Web 端）采用独立的部署节奏 — [Pact CDC](https://pactflow.io/what-is-consumer-driven-contract-testing/) |
| 5 冒烟 | **ON** | 可部署的 HTTP 服务；部署后探测 `/users` 注册接口具有实际意义 — [Google e2e](https://testing.googleblog.com/2016/09/testing-on-toilet-what-makes-good-end.html) |
| 6 基于属性 | OFF | 输入域（电子邮件、密码、年龄）受限，并已在单元测试中通过 EP+BVA 得到充分覆盖；关键性为 MEDIUM-HIGH，但对于有界输入，门禁 6 为 OFF — [跳过启发式](https://hypothesis.works/articles/what-is-property-based-testing/) |

**`test_strategy` YAML**

```yaml
test_strategy:
  artifact: "POST /users (user registration endpoint)"
  rationale: "User registration is a critical user-facing path; can be used by web and mobile apps independently of each other."
  criticality: "MEDIUM-HIGH"

  selected_types:
    - rationale: "Validators (email, password, age) are pure logic; EP+BVA on each field; one test per partition"
      type: "unit"
      size: "small"
      framework: "vitest"
      dependencies: ["in-memory user repository fake (for service-level unit if needed)"]
      gate: "Gate 1"
    - rationale: "Endpoint writes to Postgres and emits to Kafka; mocking these distorts transactional and ordering behavior - Testcontainers gives real boundary fidelity"
      type: "integration"
      size: "medium"
      framework: "vitest + supertest + Testcontainers"
      dependencies: ["Postgres 15 via Testcontainers", "Kafka via Testcontainers"]
      gate: "Gate 2"
    - rationale: "Public API consumed by mobile + web on independent deploy cadences; contract testing prevents schema drift breaking either consumer"
      type: "contract"
      size: "medium"
      framework: "Pact (provider verification)"
      dependencies: ["Pact broker", "consumer-published pacts from mobile and web"]
      gate: "Gate 4"
    - rationale: "Deployable HTTP service with a post-deploy pipeline; one minimal smoke verifies /users responds 201 in the deployed environment"
      type: "smoke"
      size: "large"
      framework: "Playwright (1 critical path)"
      dependencies: ["deployed environment URL", "test account seeding"]
      gate: "Gate 5"

  rejected_types:
    - reason: "No UI surface in this artifact - Gate 3 OFF; mobile and web repos own their own component tests"
      type: "component"
    - reason: "No UI surface - Gate 3 OFF; consumer e2e lives in mobile/web repos"
      type: "e2e"
    - reason: "Input domain is bounded and EP+BVA at unit level covers it; property-based on this glue endpoint adds infra without finding more bugs - Gate 6 OFF"
      type: "property-based"

  deliberately_skipped:
    - why: "Performance/load testing is out of scope here; tracked in dedicated performance backlog"
      what: "Load test verifying p99 < 200ms at 1000 RPS"
    - why: "Cross-region failover is owned by infrastructure team, not this endpoint"
      what: "Multi-region availability test"
```

**要覆盖的测试用例**

```markdown
### AC-1: Valid request returns `201` and persists user.
- [unit] validateEmail accepts "alice@example.com" [EP: well-formed]
- [integration] POST /users with valid body returns 201 and persists row in Postgres
- [smoke] POST /users in deployed environment returns 201 for a synthetic test account

### AC-2: Invalid email format returns `400` with field-level error.
- [unit] validateEmail rejects "alice@" [EP: missing domain]
- [unit] validateEmail rejects "" [BVA: empty boundary]
- [integration] POST /users with invalid email returns 400 and does NOT persist

### AC-3: Password not meeting policy returns `400`.
- [unit] validatePassword rejects 7-char password [BVA: B-1 at min length 8]
- [unit] validatePassword accepts 8-char password meeting policy [BVA: B at min length]
- [unit] validatePassword accepts 9-char password [BVA: B+1]
- [unit] validateAge rejects 12 [BVA: B-1 at boundary 13]
- [unit] validateAge accepts 13 [BVA: B at boundary 13]

### AC-4: Duplicate email returns `409`.
- [integration] POST /users with duplicate email returns 409 and does NOT emit event

### AC-5: Successful registration emits exactly one `user.created` event.
- [integration] POST /users emits exactly one user.created event to Kafka on success
- [integration] POST /users transaction rolls back when Kafka publish fails [State Transition: failure path]

### AC-6: Response schema is stable for mobile + web consumers.
- [contract] Provider satisfies mobile pact: POST /users response shape matches mobile contract
- [contract] Provider satisfies web pact: POST /users response shape matches web contract
```

**拒绝这些类型的原因**：没有 UI 界面（component/e2e 属于消费者应用），输入空间有界（基于属性的测试 ROI 较低），范围外的关注点（负载、多区域）基于理由有意跳过。

---

### 示例 C — UI 表单组件：`<RegistrationForm />`（web）

**制品**

一个 React 表单组件：

1. 字段：email、password、confirmPassword、age。
2. 客户端验证：email 格式、password >= 8 个字符且包含大小写字母 + 数字、两次密码匹配、age >= 13。
3. 提交到 `POST /users`。
4. 显示字段内联错误和提交级错误（网络错误、409 重复）。
5. 请求处理中禁用提交按钮；收到响应后重新启用。
6. WCAG 2.1 AA：标签与输入框绑定，通过 `aria-live` 播报错误，验证失败时焦点移动到第一个错误处。

**验收标准**：

- AC-1：用户可以提交有效表单，并导航到 `/welcome`。
- AC-2：无效 email 显示内联错误 `"Enter a valid email"`。
- AC-3：密码不匹配时显示内联错误 `"Passwords must match"`。
- AC-4：请求进行中时提交按钮处于禁用状态。
- AC-5：服务器返回 409 时，在表单级别显示 `"This email is already registered"`。
- AC-6：表单可通过键盘导航；验证失败时焦点移动到第一个错误处。
- AC-7：所有输入框都有程序化标签；错误通过 `aria-live="polite"` 播报。

**重要性**：`MEDIUM-HIGH`（注册是面向用户的关键路径；许多司法管辖区对无障碍有监管要求）。

**门禁检查**

| 门禁 | 决策 | 原因 |
|------|----------|--------|
| 0 跳过 | OFF | 行为 + 无障碍逻辑 |
| 1 单元 | **ON** | 验证辅助函数（`validateEmail`、`passwordsMatch`、`parseAge`）是纯逻辑 |
| 2 集成 | OFF（此处） | 组件本身不跨越真实边界；网络在 fetch 层级进行模拟。网络集成由 `POST /users`（示例 B）负责 |
| 3 组件/E2E | **ON**（组件） + **ON**（注册路径的 e2e） | UI 界面、重要性为 MEDIUM-HIGH、面向用户的关键路径 — [测试金字塔顶部](https://martinfowler.com/articles/practical-test-pyramid.html) + [跟随用户](https://testing.googleblog.com/2020/10/testing-on-toilet-testing-ui-logic.html) |
| 4 契约 | OFF | UI 消费 API；提供方的契约测试位于示例 B |
| 5 冒烟 | **ON** | Web 应用已部署；对“注册页面渲染并提交”进行冒烟测试是有意义的 |
| 6 基于属性 | OFF | 表单输入有界；EP+BVA 已覆盖这些输入 |

**`test_strategy` YAML**

```yaml
test_strategy:
  artifact: "src/components/RegistrationForm.tsx"
  rationale: "React form component used in web app; registration is a business-critical user-facing path."
  criticality: "MEDIUM-HIGH"

  selected_types:
    - rationale: "Validation helpers (validateEmail, passwordsMatch, parseAge) are pure logic; EP+BVA per field"
      type: "unit"
      size: "small"
      framework: "vitest"
      dependencies: []
      gate: "Gate 1"
    - rationale: "UI rendering + interaction within a single component; network mocked at fetch level - tests focus on user-facing behavior per Follow the User"
      type: "component"
      size: "small"
      framework: "vitest + React Testing Library"
      dependencies: ["happy-dom", "msw (mock service worker) for fetch"]
      gate: "Gate 3"
    - rationale: "Registration is a critical user-facing path; one e2e covers the full happy path with real backend (Testcontainers-backed)"
      type: "e2e"
      size: "large"
      framework: "Playwright"
      dependencies: ["app server running locally", "Postgres via Testcontainers", "Kafka via Testcontainers"]
      gate: "Gate 3"
    - rationale: "Web app deploys to staging/prod; smoke verifies /register page loads and form submits in deployed env"
      type: "smoke"
      size: "large"
      framework: "Playwright (1 critical path)"
      dependencies: ["deployed environment URL", "test account seeding"]
      gate: "Gate 5"

  rejected_types:
    - reason: "Component does not own a real boundary; network integration is owned by POST /users (provider) - Gate 2 OFF for this artifact"
      type: "integration"
    - reason: "UI consumes the API; provider contract tests live with the provider (POST /users) - Gate 4 OFF for the consumer"
      type: "contract"
    - reason: "Bounded input space; EP+BVA at unit level is sufficient - Gate 6 OFF"
      type: "property-based"

  deliberately_skipped:
    - why: "Cross-browser e2e on legacy browsers (IE11) is out of support per project browser matrix"
      what: "Browser compatibility e2e on IE11 / Edge Legacy"
    - why: "Visual regression (pixel diff) is owned by a separate Storybook chromatic pipeline"
      what: "Pixel-level visual regression assertions"
```

**需要覆盖的测试用例**

```markdown
### AC-1：用户可以提交有效表单，并被导航至 `/welcome`。
- [unit] validateEmail 接受 "alice@example.com" [EP：格式良好]
- [unit] parseAge 拒绝 12 [BVA：边界 13 处的 B-1]
- [unit] parseAge 接受 13 [BVA：边界 13 处的 B]
- [e2e] 用户填写有效表单、提交，并进入 /welcome 页面
- [smoke] /register 页面加载，并且表单在已部署环境中提交成功

### AC-2：无效邮箱以内联方式显示 `"Enter a valid email"`。
- [unit] validateEmail 拒绝 "" [BVA：空值边界]
- [unit] validateEmail 拒绝 "alice@" [EP：缺少域名]
- [component] 输入无效邮箱并失去焦点后，内联显示 "Enter a valid email"

### AC-3：密码不匹配时以内联方式显示 `"Passwords must match"`。
- [unit] 当两者都等于 "Abcd1234" 时，passwordsMatch 返回 true
- [unit] 当其中一个为 "" 时，passwordsMatch 返回 false [BVA：空值]
- [component] 输入不匹配的密码后，内联显示 "Passwords must match"

### AC-4：请求进行期间提交按钮处于禁用状态。
- [component] 当 password 和 confirmPassword 不一致时，提交按钮处于禁用状态
- [component] 请求处于 pending 状态时，点击提交按钮会将其禁用 [状态转换：idle -> pending]

### AC-5：服务器返回 409 响应时，在表单级别显示 `"This email is already registered"`。
- [component] 409 响应显示表单级别的 "This email is already registered"

### AC-6：表单支持键盘导航；验证失败时焦点移动到第一个错误。
- [component] 验证失败时，焦点移动到第一个错误字段 [a11y]

### AC-7：所有输入框都有程序化标签；错误通过 `aria-live="polite"` 宣布。
- [component] 表单渲染 email、password、confirmPassword、age、submit [正常路径渲染]
- [component] 所有输入框都有程序化标签，且错误位于 aria-live="polite" 区域中 [a11y]

```

**拒绝这些类型的原因**：此产物是一个 UI 使用者——其真正的边界是 API，该 API 在示例 B（提供方侧）中作为集成进行测试。对于有界的 UI 输入处理而言，基于属性的测试缺乏合理性。跨浏览器旧版支持和视觉回归测试不在范围内，并已明确跳过且给出理由。

---

## Skill 自检

在宣布策略完成之前，加载时验证：

- [ ] 已明确评估全部 7 个门禁（ON/OFF + 原因）。
- [ ] `selected_types[*]` 的顺序为 `rationale -> type -> size -> framework -> dependencies -> gate`。
- [ ] `rejected_types[*]` 的顺序为 `reason -> type`。
- [ ] `deliberately_skipped[*]` 的顺序为 `why -> what`。
- [ ] 每个 AC 至少被一个测试用例引用。
- [ ] BVA 用例针对每个数值边界枚举 `B-1`、`B`、`B+1`。
- [ ] 根据 [Google 测试规模](https://abseil.io/resources/swe-book/html/ch11.html) 为测试分配测试规模（small/medium/large）。
- [ ] 测试名称不包含 "and"（遵循 [跳过启发式规则](#strategic-skip-heuristics)）。
- [ ] 至少应用了一条 [策略性跳过启发式规则](#strategic-skip-heuristics)，或者明确考虑过该规则但基于理由决定不采用。

如果任何检查未通过，请在交付前修订策略。

## 覆盖率分析

变异测试和其他覆盖率分析方法（用于**在编写测试后评估测试套件质量**）记录在配套的 `test-coverage` skill 中。