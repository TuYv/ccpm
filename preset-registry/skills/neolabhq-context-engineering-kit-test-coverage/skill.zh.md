---
name: test-coverage
description: Use after writing tests to assess coverage quality across structural, mutation, requirements, and API/integration dimensions; organized knowledge for choosing and interpreting coverage analyses.
---
# 测试覆盖率分析

一份用于在现有测试套件上选择、应用和解读测试覆盖率分析的参考手册。

此技能是**知识参考**，而不是操作流程。它不会告诉你何时编写测试或该设计哪些测试类型——那是 `design-testing-strategy` 的职责。它会告诉你，在测试已经存在之后，**哪种机械信号最适合衡量这些测试实际执行了什么（以及没有执行什么）**，以及如何诚实地解读该信号。

## 什么是覆盖率分析

测试覆盖率分析是对测试套件沿一个或多个**维度**对软件产物进行充分测试的程度所做的**事后测量**。它回答的问题是：*“我的测试实际上触及了什么？”*——具体取决于对“触及”的定义。

“覆盖率”一词有多种含义。它可以指：

- **结构覆盖率 / 代码覆盖率** — 源代码中哪些行、语句、分支、条件或路径被执行了（通过插桩进行测量）。
- **变异覆盖率** — 测试套件能够检测出多少比例的、主动注入的源代码缺陷（通过针对变异后的代码重新运行测试套件进行测量）。
- **需求 / 功能覆盖率** — 哪些验收标准、用户故事或规范条款至少有一个验证测试（通过可追溯性进行测量）。
- **API / 集成覆盖率** — 哪些端点、方法、状态码、契约交互和模式字段被执行到（通过检查请求/响应进行测量）。
- **规范域覆盖率** — 等价类、边界值、参数组合、状态转换、错误路径（通过针对模型分析测试输入进行测量）。

### 类别纠正：覆盖率不是测试类型

变异测试、MC/DC、分支覆盖率、RTM 链接、契约覆盖率和模式覆盖率，都是关于现有测试套件的**度量**。它们并不是像单元测试、集成测试、e2e 测试、契约测试或冒烟测试那样的测试类型。

- “我应该编写单元测试还是变异测试？”是一个错误的问题。正确的表述是：*“我已经有单元测试/集成测试了；是否还应该针对它们额外运行变异分析？”*
- 变异工具会生成源代码的变体，并重新执行**现有的**测试套件。它们产生的是一个分数，而不是新的测试。
- MC/DC 和分支覆盖率是根据**现有**测试套件的插桩运行结果计算出的报告。
- RTM 链接是测试元数据（标签、ID）的一种属性，而不是独立的执行过程。

如果某个“测试策略”把变异测试与单元测试 / 集成测试 / e2e 测试并列，那么该策略就混淆了*要测试什么*和*如何衡量测试*。这两个问题彼此正交。

### 不对称原则

**低覆盖率是测试薄弱的有力证据。高覆盖率却只是测试强健的微弱证据。**

覆盖率是*必要但不充分的条件*。测试可以执行某一行代码，却不做任何有意义的断言；100% 的行覆盖率通常可以在零断言的情况下实现（[thinkinglabs.io](https://thinkinglabs.io/articles/2022/03/19/the-fallacy-of-the-100-code-coverage.html)、[codeintelligently.com](https://codeintelligently.com/blog/ai-generated-tests-false-confidence)）。应将覆盖率用作**警报线**，而不是**奖杯**。一旦某个覆盖率百分比成为目标，它就不再是一个好的指标（将古德哈特定律应用于测试；参见 [Optivem Journal](https://journal.optivem.com/p/code-coverage-targets-recipe-for-disaster)）。

### 覆盖率分析不是什么

- **不是测试质量的衡量标准。** 代码行可以被执行，却没有任何断言。
- **不是正确性的衡量标准。** 覆盖率只能证明测试运行过，不能证明代码出现缺陷时测试会失败。
- **不是“经过充分测试”的同义词。** 变异测试经常会推翻“100% 覆盖率但没有断言”的测试套件。
- **不是风险驱动测试选择的替代方案**，参见 [ISO/IEC/IEEE 29119](https://en.wikipedia.org/wiki/ISO/IEC/IEEE_29119)。
- **不是目标。** 将其视为底线和趋势，而不是目标本身。

---

## 按类型划分的结构

本技能中的每种覆盖率类型都按照相同的六个子字段进行说明，顺序如下：

1. **定义** — 它衡量什么。
2. **它不衡量什么** — 它的局限性 / 盲点。
3. **典型工具** — 按生态系统划分。
4. **何时使用与跳过** — 适用性启发式判断。
5. **目标 / 阈值与陷阱** — 可辩护的数值范围（始终附带风险注意事项）以及常见的指标操纵模式。
6. **成本效益 ROI** — 成本的大致量级与实际获得的信号。

可通过这些标题快速查阅任意章节。

---

## 结构 / 代码覆盖率

通过对编译或解释执行的程序进行插桩，并记录测试套件执行了哪些结构元素（行、语句、分支、条件、路径）来进行测量。

### 行 / 语句覆盖率

- **定义。** 至少执行过一次的源代码行（或语句）所占的百分比。
- **它不衡量什么。** 分支是否沿两个方向都执行过。断言是否验证了结果。是否测试了边界值。一行中的多条语句会使该指标失真（[Metridev](https://www.metridev.com/en/metrics/statement-vs-branch-coverage-understanding-the-difference/)）。
- **典型工具。**

  | 生态系统 | 工具 |
  |-----------|------|
  | JS/TS | [Istanbul / nyc](https://istanbul.js.org/)（内置于 Jest、Vitest、Karma）；`--coverage` 标志 |
  | Python | [Coverage.py](https://coverage.readthedocs.io/) + `pytest-cov`；支持分支模式 |
  | JVM | [JaCoCo](https://www.eclemma.org/jacoco/) — 字节码插桩，行业标准 |
  | C/C++ | `gcov` / `lcov` / `gcovr`、[llvm-cov](https://llvm.org/docs/CommandGuide/llvm-cov.html) |
  | Go | `go test -cover`、`go tool cover`（[build-cover](https://go.dev/doc/build-cover) 在 Go 1.20 中新增了集成测试模式） |
  | .NET | [Coverlet](https://github.com/coverlet-coverage/coverlet)（开源默认方案）、[JetBrains dotCover](https://www.jetbrains.com/dotcover/)、AltCover。**OpenCover 处于维护模式 — 优先使用 Coverlet / dotCover / AltCover**（[NDepend 指南](https://blog.ndepend.com/guide-code-coverage-tools/)） |
  | Ruby | [SimpleCov](https://github.com/simplecov-ruby/simplecov) |
  | Swift / Obj-C | Xcode 内置（llvm-cov 后端） |
  | Rust | `cargo-llvm-cov`、`cargo-tarpaulin` |
  | 报告格式 | Cobertura XML、LCOV、Clover；聚合工具：Codecov、Coveralls、SonarQube |

- **何时使用与跳过。** 始终启用；成本接近于零（一个 CI 标志）。绝不要将其本身作为质量目标。
- **目标 / 阈值与陷阱。** 通用代码通常为 70–85%（[Qt 博客](https://www.qt.io/quality-assurance/blog/is-70-80-90-or-100-code-coverage-good-enough)）。仅在附带风险注意事项的情况下使用（参见下文的“基于风险的解读”）。没有断言的测试仍会将代码行计为已覆盖。单行 `if (x) doA(); else doB();` 只执行了一个分支时，也会显示 100% 的语句覆盖率。仅包含快照的测试会在没有验证行为的情况下虚增数值。
- **成本效益 ROI。** 非常高 — 成本接近于零，价值在于作为测试触达范围发生回归的告警信号。

### 分支 / 判定覆盖率

- **定义。** 已执行的判定分支（`if`、`while`、`for`、`?:`、`switch` 分支的 true/false 结果）所占的百分比。
- **它不衡量什么。** 复合条件的独立性（`A && B` 取 `true` 时，可能从未测试过 `A=true, B=false`）。求值顺序。循环迭代次数。断言强度。
- **典型工具。** 与行覆盖率相同；使用 `--branch`（coverage.py）启用分支覆盖率，Istanbul 默认支持分支感知，JaCoCo 原生报告分支覆盖率。严格强于行/语句覆盖率（[Graph AI](https://www.graphapp.ai/blog/statement-coverage-vs-branch-coverage-a-comprehensive-comparison)）。
- **何时使用，何时跳过。** 对任何非简单逻辑，默认使用。优先将分支覆盖率而非行覆盖率作为主要结构性指标。
- **目标 / 阈值与陷阱。** 对业务应用而言，70–80% 的分支覆盖率是一个“体面”的目标（[Lead With Skills](https://www.leadwithskills.com/blogs/test-coverage-metrics-lines-branches-conditions-paths)）——但始终要结合风险提示。复合条件会隐藏缺口：`if (A || B)` 只要有一个子条件求值为 true，并且整体存在一个 false 分支，就能达到 100% 的分支覆盖率。

### 条件覆盖率

- **定义。** 每个判定中的每个布尔**子条件**都至少取过一次 `true` 和 `false`。
- **它不衡量什么。** 每个子条件是否独立影响结果（这属于 MC/DC）。不要求覆盖所有组合。
- **典型工具。** 与分支覆盖率使用相同的工具链；许多工具会将条件覆盖率作为单独的列进行报告。

  | 生态系统 | 工具 |
  |-----------|------|
  | JVM | JaCoCo（分支报告中的条件计数器） |
  | C / C++ | gcov/gcovr（`--branch-counts`）、Qt Coco |
  | .NET | Coverlet（通过 Cobertura 输出提供条件覆盖率） |

- **何时使用，何时跳过。** 对包含复合表达式的代码具有参考价值；很少适合单独作为 CI 门槛。
- **目标 / 阈值与陷阱。** 无需执行每种组合即可达到目标。对于 `if (A && B)`，使用 `{A=T,B=F}` 和 `{A=F,B=T}` 即可达到 100% 的条件覆盖率——但这两组测试都不会使判定结果为 `true`。应将其视为诊断指标，而非门槛。
- **ROI：** 中等——在调查“为什么分支覆盖率看起来很高但 bug 仍然存在”时具有诊断价值；不应作为门槛。

### MC/DC — 修改条件/判定覆盖率

- **定义**（参见[维基百科](https://en.wikipedia.org/wiki/Modified_condition/decision_coverage)）：
  1. 每个进入点/退出点至少被调用一次。
  2. 每个判定至少取得过一次每种结果。
  3. 判定中的每个条件至少取得过一次每种结果。
  4. 已证明每个条件能够**独立地**影响判定结果（固定其他条件不变）。

  对于包含 `n` 个条件的判定，通过独立性测试对，MC/DC 可使用 `n+1` 到 `2n` 个测试实现——相比穷举式多条件覆盖率所需的 `2^n` 个测试，成本大幅降低（[LDRA](https://ldra.com/capabilities/mc-dc/)）。

- **它不测量什么。** 循环迭代次数、数据值、集成路径、断言强度。
- **典型工具。** LDRA TBvision、Rapita RapiCover、VectorCAST、Razorcat TESSY、[Qt Coco](https://www.qt.io/quality-assurance/coco/feature-modified-condition-decision-coverage-mcdc)、Parasoft C/C++test。大多为商业工具——开源 MC/DC 十分少见。
- **何时使用，何时跳过。** 当标准要求时使用（DO-178C DAL A、ISO 26262 ASIL D、IEC 62304 Class C 高风险模块、EN 50128 SIL 4、IEC 61508 SIL 4）。在受监管领域之外，分支覆盖率 + 变异测试可以以更低成本覆盖相同意图。
- **目标 / 阈值与陷阱。** 在受监管领域中，按定义为 100%。类 C 语言中的短路求值可能使某些独立性对无法到达；编译器优化可能合并条件，因此覆盖率构建必须禁用优化——这意味着覆盖率构建的二进制文件不是发布构建的二进制文件，这是一项已获监管认可的风险（[Verifysoft](https://www.verifysoft.com/en_ISO_26262_Road_Vehicles_Functional_Safety.html)）。
- **成本效益 ROI。** 成本非常高（专业工具链 + 人力 + 文档开销）；只有在法律 / 标准要求时价值才高。

### 函数 / 方法覆盖率

- **定义。** 至少被调用一次的已声明函数 / 方法所占的百分比。
- **它不测量什么。** 与这些函数的方法体相关的任何内容。
- **典型工具。** 大多数结构化覆盖率工具都会将其作为附加列报告。

  | 生态系统 | 工具 |
  |-----------|------|
  | JVM | JaCoCo（method counter） |
  | .NET | Coverlet（methods column） |
  | Python | coverage.py（`report -m` 粒度）、pytest-cov |
  | JS/TS | Istanbul（lcov / json-summary 中的 functions 指标） |

- **何时使用，何时跳过。** 用作快速检查“是否忘记了某个模块”；绝不能作为主要指标。
- **目标 / 阈值与陷阱。** 数值通常高得具有迷惑性——许多函数会被仅覆盖正常路径的测试进入，而函数内部没有错误路径覆盖。
- **ROI：** 低——仅用于提供信息；适合作为“是否忘记了某个模块？”的触发器，而不是门禁。

### 路径覆盖率

- **定义。** 穿过某个函数的唯一线性独立路径所占的百分比。其上限由圈复杂度 `V(G) = decisions + 1` 决定（[圈复杂度](https://en.wikipedia.org/wiki/Cyclomatic_complexity)）。
- **它不测量什么。** 对于非平凡函数而言，几乎没有任何实际意义——`N` 个决策会产生 `2^N` 条路径，而循环会使路径数量无界。
- **典型工具。** 一些商业安全关键工具会报告基路径数量；很少作为 CI 产物。

  | 生态系统 | 工具 |
  |-----------|------|
  | 安全关键型 C/C++ | LDRA TBvision、VectorCAST（基路径指标） |
  | 任意语言 / 复杂度代理指标 | lizard、radon、SonarQube（将圈复杂度作为*上限*，而不是路径指标） |

- **何时使用，何时跳过。** 很少将其作为覆盖率目标。圈复杂度更适合作为一种**复杂度信号**，用于*限定*执行不同流程所需的最少测试数量。
- **目标 / 阈值与陷阱。** 组合爆炸。大多数生产代码在路径覆盖率层面都未被覆盖，这是可以接受的。
- **ROI：** 对生产代码而言较低；只有在非常小、关键性非常高的函数内部才有意义——除此之外，将复杂度作为一种*信号*即可，不要继续追求。

---

## 将变异测试作为覆盖率分析

> **提醒：** 变异测试是对现有测试套件进行的覆盖率分析。它**不是**一种测试类型。它会生成一个分数和一份存活变异体列表；不会生成新的测试。你应将它*应用于*单元测试/集成测试套件，而不是用它*替代*测试套件。

### 定义

变异测试会对源代码进行小规模的语法修改（“变异体”），然后针对每个变异体重新运行现有测试套件。如果某个变异体至少有一个测试**失败**，则该变异体被**杀死**（测试套件检测到了该故障）。如果所有测试都**通过**，则该变异体**存活**（测试套件无法发现这一变化）。它衡量的是*测试套件的故障检测能力*，而不是源代码覆盖范围（[Stryker 文档](https://stryker-mutator.io/docs/)）。

典型的变异操作符：

- **算术** — `+` → `-`、`*` → `/`、`++` → `--`。
- **条件/关系** — `<` → `<=`、`==` → `!=`、`&&` → `||`。
- **布尔/取反** — `true` → `false`、移除 `!`。
- **语句移除/代码块删除。**
- **返回值** — `return x` → `return null` / `return ""`。
- **字面量常量的递增/递减。**
- **条件边界** — `>` → `>=`。

### 变异体状态（[Stryker 文档](https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/)）

| 状态 | 含义 |
|-------|---------|
| **Killed** | 至少有一个测试在该变异体上失败。测试套件检测到了该故障。 |
| **Survived** | 该变异体上的所有测试都通过。测试套件无法发现该变化。 |
| **No coverage** | 没有测试执行被修改的代码（正交的缺口——代码本身未经过测试）。 |
| **Timeout** | 测试挂起；通常计为杀死（测试套件*确实*观察到了异常行为）。 |
| **Compile error / runtime error** | 变异体在语法或语义上无效；通常会被过滤。 |
| **Ignored** | 根据配置被过滤（生成的代码、胶水代码等）。 |

分数：`mutation_score = killed_mutants / (total_mutants - equivalent_mutants - errors)`。一些工具还会报告相对于仅*已覆盖*变异体的“killed%”。

### 它不衡量什么

- **死代码区域** — 显示为 `no coverage`，与“未覆盖的代码行”相同。
- **断言的语义正确性** — 错误但严格的断言仍然可以杀死变异体。
- **边界数据值** — 操作符变异体可以近似反映这一点，但不能替代 BVA。
- **等价变异体** — 产生相同可观察行为的变体。一般来说，检测等价变异体是不可判定的；人工审查是唯一确定的方法。现代工具（Stryker TypeScript Checker、配合 Major 的 PIT）会通过启发式方法减少这类变异体。**不要追求 100% 的变异分数**——等价变异体使这一目标渐近地无法实现（[Stryker 文档](https://stryker-mutator.io/docs/mutation-testing-elements/equivalent-mutants/)）。

### 典型工具

| 生态系统 | 工具 |
|-----------|------|
| JS / TS | [Stryker (StrykerJS)](https://stryker-mutator.io/) — TypeScript checker 插件会过滤编译错误变异体 |
| .NET (C#) | [Stryker .NET](https://stryker-mutator.io/docs/stryker-net/introduction/)；Microsoft Learn 中有相关文档（[Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/core/testing/mutation-testing)） |
| Java / JVM | [PIT (Pitest)](https://pitest.org/) — JVM 的参考标准；Major Mutator 用于研究 |
| Python | [mutmut](https://mutmut.readthedocs.io/)、[Cosmic Ray](https://cosmic-ray.readthedocs.io/)、[MutPy](https://github.com/mutpy/mutpy) |
| Go | [go-mutesting](https://github.com/avito-tech/go-mutesting)、[ooze](https://github.com/gtramontina/ooze) |
| PHP | [Infection](https://infection.github.io/) |
| Ruby | [mutant](https://github.com/mbj/mutant) |
| Rust | [cargo-mutants](https://mutants.rs/) |
| C / C++ | [Mull](https://github.com/mull-project/mull) — 基于 LLVM |
| Scala | [Stryker4s](https://stryker-mutator.io/docs/stryker4s/introduction/) |
|

### 何时使用与跳过

**适用于：**

- 测试套件在结构上已经成熟（通常分支覆盖率 >80%）。对于稀疏的测试套件，变异测试结果会被 `no coverage` 主导；除了结构覆盖率已经展示的内容之外，你无法获得任何新的信息。
- 工件是**纯逻辑核心**——财务计算、安全关键验证、解析器、加密、授权决策。
- 重要性足够高，测试套件中的盲点会带来实质性风险。

**跳过：**

- 胶水代码、控制器、框架接线代码——操作符会在声明式结构上产生噪声。
- UI 渲染——等价变异体占主导。
- 配置、DTO、声明式序列化。
- 仍在构建中的全新测试套件。
- CI 反馈周期很短，而 N×测试套件运行时间难以接受（应通过增量分析缓解，而不是放弃覆盖率）。

### 目标 / 阈值与陷阱

Stryker 默认值（[配置](https://stryker-mutator.io/docs/stryker-js/configuration/)）：`high: 80`、`low: 60`、`break: null`。将 `break` 设置为低于某个下限时使构建失败。应用时应注意风险：对于成熟的、针对纯逻辑核心的单元测试套件，60–80% 是一个合理的起点；绝不要用于胶水代码。常见陷阱：追逐等价变异体（渐近线）、在 UI/配置上运行（噪声）、在浅层测试套件上运行（重新报告覆盖率已经显示的内容）。

### 成本效益 ROI

- **成本。** CPU 开销近似呈平方级增长。一个运行 60 秒的测试套件在生成 1,000 个变异体时，未经优化可能需要 1,000 × 60s。现代工具通过增量分析、逐变异体测试选择和并行运行器来缓解这一问题。
- **收益。** 能够捕获结构覆盖率无法检测的*缺失断言*和*过度 Mock* 测试。这是**唯一一种能够实际评估断言强度的覆盖率技术**——而“没有断言却达到 100% 覆盖率”的主要失败模式正是这一点（[codeintelligently.com](https://codeintelligently.com/blog/ai-generated-tests-false-confidence)）。
- **CI 模式。** 在 PR 差异上进行增量变异测试；每晚对关键模块执行完整运行（[oneuptime](https://oneuptime.com/blog/post/2026-01-24-mutation-testing/view)；另见 [greg4cr.github.io](https://greg4cr.github.io/pdf/23mutationci.pdf) 上的研究汇总）。

### 与结构覆盖率的关系

变异测试**包含并补充**结构覆盖率：

- 不可达代码中的变异体会显示为 `no coverage`——与“未覆盖的行”信号相同。
- 已覆盖代码中的变异体如果存活下来——即“已覆盖但未得到有意义的验证”——这是结构覆盖率无法发现的。

---

## 需求 / 功能覆盖率

### 定义

将规格说明工件（需求、用户故事、验收标准、监管条款）与验证测试建立映射：

```
requirements_coverage = requirements_with_>=1_passing_test / total_requirements
```

基础工件是**需求可追溯矩阵（RTM）**——一个将需求与测试用例相关联的二维表格（[ISTQB 术语表](https://istqb-glossary.page/traceability-matrix/)）。它能够：

- **正向可追溯性** — 每项需求是否都有对应的测试？
- **反向可追溯性** — 每项测试是否都能追溯到某项需求？
- **变更影响分析** — 当需求 X 发生变更时，哪些测试必须重新检查？

### 它不衡量什么

- 测试是否**正确** — 针对错误断言的通过测试，仍然会满足 RTM 要求。
- 需求本身是否**完整** — 如果需求集遗漏了某些场景，那么 100% 的 RTM 覆盖率毫无意义。
- 代码覆盖情况 — RTM 与结构化覆盖率是正交的。

### 典型工具

| 工具 | 类型 | 说明 |
|------|------|-------|
| Jira + Xray / Zephyr / Test Manager | ALM | 在工单中关联用户故事 ↔ 测试 |
| Polarion、IBM DOORS / DOORS Next、Codebeamer | 受监管领域的 ALM | DO-178C / ISO 26262 的一级工具 |
| 电子表格 + 测试名称中的标签 | 轻量级 | 适用于小型团队；规模扩大后会逐渐失效 |
| BDD 场景报告 | 与 BDD 对齐 | Cucumber + Pickles 报告生成器 |
| `@Tag("AC-123")` 风格的注解 | 代码级 | 基于 JUnit / pytest 标签，将测试链接到 AC ID |

在 BDD 生态中，Gherkin `Scenario:` 代码块是验收覆盖的单元；每个 AC 最好映射到一个或多个场景（BDD 的黄金法则：一个场景对应一种行为 — [Automation Panda](https://automationpanda.com/bdd/)）。工具包括：[Cucumber](https://cucumber.io/)（多语言）、[SpecFlow](https://specflow.org/)（注意：活跃的社区分支是 [Reqnroll](https://reqnroll.net/)）、[behave](https://behave.readthedocs.io/)（Python）、[pytest-bdd](https://pytest-bdd.readthedocs.io/)、[Robot Framework](https://robotframework.org/)、Behat（PHP）。

基础标准：**ISTQB Foundation Level** 将 RTM 视为系统化测试设计的基础工件。**[ISO/IEC/IEEE 29119](https://en.wikipedia.org/wiki/ISO/IEC_29119)** 的第 1–5 部分要求在测试计划、测试设计和测试执行层面实现可追溯性（参见 [rcolomo.com](https://www.rcolomo.com/papers/326.pdf) 中的 ISTQB 到 29119 映射）。在 DO-178C、ISO 26262 第 6 部分工作产品、IEC 62304 验证记录以及 FDA 21 CFR Part 820 中，监管可追溯性都是**强制要求**。

### 何时使用，何时跳过

- **适用于**具有明确验收标准的任何内容、受监管软件以及合同交付物。当测试名称中嵌入 AC ID 时，成本很低（`it("AC-3: rejects mismatched passwords")`）。
- **跳过**一次性脚本以及没有文档化需求的内部工具。

### 目标 / 阈值与陷阱

100% 的需求覆盖率是一个合理目标 — 每个已记录的 AC 都应至少有一个测试。陷阱在于*质量*而非数值：

- **仪式成本** — 要求手动更新的繁重 RTM 工具最终会因信息逐渐过时而失效。
- **每个 AC 一个测试的陷阱** — 如果某个 AC 包含多个等价类或边界，一个测试并不能算“覆盖”该 AC。
- **理想化需求** — 统计“计划中的测试”而不是“通过的测试”，会产生虚假的绿色 RTM。
- **静默失效** — 除非强制执行链接完整性，否则需求频繁变更会破坏可追溯性。

### 成本效益 ROI

- **高**，适用于强制要求的受监管/合同工作。
- **中等**，适用于在测试名称中使用带有 AC 标签的 BDD 产品团队——成本接近于零，可追溯性则作为 CI 产物实现。
- **低**，适用于个人开发或原型工作。

---

## API / 集成覆盖率

API 覆盖率衡量测试套件所覆盖的集成范围——端点、方法、状态码、负载字段以及服务间契约——与代码覆盖率无关。

### 端点覆盖率

- **定义。** `(unique_endpoint_method_pairs_hit) / (total_documented_endpoint_method_pairs)`。通常还会进一步按 `(endpoint, method, status_code)` 三元组进行拆分。
- **它不衡量什么。** 响应是否*正确*——它只表示端点曾被访问过，而不表示导致每个状态码的组合输入是否被覆盖。
- **典型工具。** [Schemathesis](https://schemathesis.readthedocs.io/)（由 OpenAPI/GraphQL 驱动的测试生成器，可报告端点和状态码覆盖率）、[Dredd](https://dredd.org/)（根据 API Blueprint / OpenAPI 验证 HTTP API）、API 网关访问日志（Kong、Apigee、AWS API Gateway）采集后导入覆盖率仪表板，以及自定义中间件，用于跟踪测试运行期间观测到的 `(method, path_template, status)` 三元组，并与 OpenAPI 规范进行对比。
- **何时使用，何时跳过。** 只要存在 OpenAPI / GraphQL 规范，就应使用。对于没有网络接口的内部库，可以跳过。
- **目标 / 阈值与陷阱。** 路径模板规范化（`/users/123` 与 `/users/:id`）是自定义采集器中的常见缺陷。未文档化的端点可能显示为 0%，但它们往往风险最高。`5xx` 错误路径很少经过测试。
- **成本效益 ROI。** 高——类似 schemathesis 的生成方式成本低，并且能快速发现缺口。

### 契约覆盖率（消费者驱动的契约）

- **定义。** 提供方已验证的消费者侧**交互**（请求/响应示例）所占的百分比。消费者生成 Pact 文件（JSON contracts），其中记录具体交互；提供方在 CI 中针对这些契约运行验证套件。
- **它不衡量什么。** 消费者从未发送过的输入上的提供方行为（负空间）。性能、安全性或模式完整性。
- **典型工具。** [Pact](https://docs.pact.io/)（支持多种语言）、用于存储和验证报告的 Pact Broker / [Pactflow](https://pactflow.io/what-is-consumer-driven-contract-testing/)。[Spring Cloud Contract](https://spring.io/projects/spring-cloud-contract/)（Groovy/YAML/Java DSL 契约；自动为提供方生成 JUnit/Spock 测试，并为消费者生成 WireMock 存根，同时支持 CDC 和生产者驱动的契约）。
- **何时使用，何时跳过。** 当存在多个独立消费者，且它们具有独立的部署节奏时使用（微服务、共享同一后端的移动端 + Web）。对于与提供方一同部署的单消费者 API，或库 API，可以跳过。
- **目标 / 阈值与陷阱。** “模式有效”弱于“遵守契约”——模式告诉你哪些形状是*合法的*；契约告诉你消费者*实际依赖哪些*字段和行为（[Speakeasy：Pact 与 OpenAPI 的比较](https://www.speakeasy.com/blog/pact-vs-openapi)）。
- **成本效益 ROI。** 在多消费者架构中较高；在单消费者架构中投入过多。

### Schema 覆盖率（OpenAPI / JSON Schema / GraphQL）

- **定义。** 测试套件中被实际执行的 schema 字段、枚举值以及 `oneOf` / `anyOf` 变体所占的百分比。
- **它不衡量什么。** 字段的语义正确性（字段可能具有错误的值，但形状正确）。
- **典型工具。** [Schemathesis](https://schemathesis.readthedocs.io/)（根据 OpenAPI 生成基于属性的测试；输出针对 schema 元素的覆盖率指标）、[Dredd](https://dredd.org/)（配合钩子实现字段级插桩）、[Specmatic](https://specmatic.io/)（schema-first，支持消费者驱动和提供者驱动的契约）、[Pactflow Bi-Directional Contract Testing](https://pactflow.io/blog/contract-testing-using-json-schemas-and-open-api-part-3/)（Pact + OpenAPI，用于治理和交互安全）。
- **何时使用、何时跳过。** 只要 API 有 schema 描述，就应使用。当 schema 不可信或已过时时应跳过——先修复 schema。
- **目标 / 阈值与陷阱。** 可选字段很容易被忽略；可空性和 `oneOf` 变体是常见盲点；已弃用字段会长期处于未覆盖状态。
- **成本效益 ROI。** 中等——与基于属性的生成结合使用时最具信息量。

### 集成路径覆盖率

- **定义。** 哪些服务到服务或组件到组件的边已经通过端到端方式执行。
- **它不衡量什么。** 每个服务内部的代码覆盖率；部分失败条件下的行为。
- **典型工具。** 分布式追踪（OpenTelemetry、Jaeger、Tempo、Lightstep），使用 `test_suite_id` 标记将 span 归因到测试运行；服务网格遥测（Istio、Linkerd）。
- **何时使用、何时跳过。** 在已经具备追踪能力的成熟微服务架构中使用，尤其适用于预生产 / staging 环境。当不存在追踪基础设施时跳过（仅凭覆盖率信号不足以证明增加该基础设施的成本是合理的）。
- **目标 / 阈值与陷阱。** 旧运行产生的陈旧追踪可能掩盖当前缺口；采样率可能丢弃低频路径；带外后台工作可能缺少 `test_suite_id` 标签。
- **成本效益 ROI。** 中等——在成熟平台中信号价值高，但在从零开始的项目中设置成本过高。

---

## 其他覆盖率类型

### 数据 / 等价类覆盖率

- **定义。** 针对**输入分区**而非代码衡量的覆盖率。ISTQB Foundation Level 黑盒技术中的每个等价类划分（EP）和边界值分析（BVA）槽位都会成为一个覆盖率元素（[ISTQB BVA white paper](https://istqb.org/wp-content/uploads/2025/10/Boundary-Value-Analysis-white-paper.pdf)）。示例：一个处理 `orderTotal` 的函数，其分区为 `{<0, 0-99, 100-499, ≥500}`，包含 4 个 EP 槽位，以及位于 0、100、500 处的 `(B-1, B, B+1)` 边界三元组（共 9 个边界槽位）。
- **它不衡量什么。** 代码可达性；多参数交互。
- **典型工具。** 通常作为测试计划中的检查清单进行跟踪，而不是通过工具完成。某些 ALM 工具支持分区标记。
- **何时使用、何时跳过。** 对解析器 / 验证器 / 计算器风格的代码价值较高。对简单的直通代码跳过。
- **目标 / 阈值与陷阱。** 目标是覆盖每个 EP 以及每个 `(B-1, B, B+1)` 三元组。陷阱：将一个 BVA 测试计为“覆盖”一个分区。
- **成本效益 ROI。** 对输入有界的纯逻辑代码而言较高。

### 成对 / 组合覆盖率

- **定义。** **成对（全对）**测试要求每一对参数值都至少出现在一个测试用例中。大多数多参数缺陷都表现在 2 路交互层面（[Wikipedia](https://en.wikipedia.org/wiki/All-pairs_testing)）。**t 路覆盖率**可推广到三元组、四元组等。
- **它不衡量什么。** 三路及以上的交互（除非提升到 `t=3`）；工作流中的顺序效应。
- **典型工具。** [Microsoft PICT](https://github.com/microsoft/pict)（Pairwise Independent Combinatorial Tool；支持约束、加权和播种）、AllPairs（Satisfice）、[NIST ACTS](https://csrc.nist.gov/projects/automated-combinatorial-testing-for-software)（支持最大 `t=6`）、CATS、Jenny、Hexawise。
- **何时使用与跳过。** 对于具有有限取值域的 4 个及以上参数（配置矩阵、功能标志、浏览器 × OS × 区域设置）应使用。参数数量为 2–3 个时应跳过（显式枚举）。
- **目标 / 阈值与注意事项。** “100% 成对覆盖率”是可以实现的，也是合理的目标。注意约束规范错误，它们可能会悄无声息地排除合法组合。
- **成本效益 ROI。** 一旦参数达到 4 个及以上，ROI 就非常高——穷举会呈组合爆炸；成对测试的规模则接近线性增长。

### 异常 / 错误路径覆盖率

- **定义。** 被测试执行过的 `catch` 块、`Result.Err` 分支、`if (err != nil)` 分支以及显式错误返回路径所占的百分比。
- **它不衡量什么。** 错误是否得到了*正确*处理（是否记录日志？是否向用户显示消息？是否重试？是否执行补偿事务？）。
- **典型工具。** 专门针对错误处理分支的分支覆盖率——工具很少将其作为单独的指标报告，但覆盖率报告通常会突出显示未覆盖的 `catch` 块。
- **何时使用与跳过。** 始终检查覆盖率报告中未覆盖的 `catch` 块；它们通常是测试套件最大的盲点。
- **目标 / 阈值与注意事项。** 在单元测试中模拟错误注入很棘手；在经过优化的覆盖率构建中，错误路径经常会被死代码消除，从而变得不可见。
- **成本效益 ROI。** 高——生产事故往往源自错误路径；只需少量审查工作，就能大幅降低风险。

### 状态 / 转换覆盖率

- **定义。** 测试执行过的状态机中已声明转换（以及可选的禁止转换）所占的百分比。
- **切换级别覆盖率：** *0-switch* —— 每个转换都执行一次。*1-switch* —— 每一对连续转换都执行一次。*2-switch* —— 每个连续的三元转换都执行一次。*往返* —— 状态图中的每个循环都执行一次（[Lead With Skills](https://www.leadwithskills.com/blogs/state-transition-testing-behavior-based-systems-istqb)）。
- **它不衡量什么。** 在转换之间传递的数据；未建模的行为。
- **典型工具。** 基于模型的测试工具——GraphWalker、ModelJUnit、fMBT。PlantUML / Mermaid 中的状态图可用作输入。
- **何时使用与跳过。** 适用于工作流引擎、订单 / 支付生命周期、UI 步骤向导、协议实现、受监管的审批流程。不适用于无状态服务。
- **目标 / 阈值与注意事项。** 对关键工作流而言，0-switch 是一个有充分依据的最低要求；在关键路径上采用 1-switch，可以捕获“在 C→A 之后，A→B 是否正常工作？”这类缺陷。禁止转换测试很容易被遗忘。
- **成本效益 ROI。** 对工作流软件而言很高；对其他软件而言可以忽略不计。

---

## 跨领域主题

### 组合方法——每种方法无法展示什么

不同的覆盖轴能够检测不同类别的 bug。将它们组合起来产生的是乘法效应，而不是加法效应。

**示例——折扣码的输入验证器。** 考虑 `if (code.length > 0 && code.startsWith("PROMO"))`。使用 `"PROMO10"` 的单个快乐路径测试会产生：

| 新增的轴 | 新捕获的问题 | 仍然隐藏的问题 |
|------------|----------------------|------------------|
| 仅行覆盖 | 所有代码执行一次——行覆盖率 100%。 | 空字符串和非 `PROMO` 的拒绝路径都未测试；将 `>= 0` 重构后仍会通过。 |
| + 分支覆盖 | 强制添加一个 false 分支测试，例如 `""`。现在空字符串情况得到了执行。 | 弱断言（`expect(result).toBeDefined()`）仍然无法杀死任何 bug；将 `>` 变异为 `>=` 后测试套件仍会通过，因为没有测试断言具体的拒绝结果。 |
| + 变异测试 | 杀死 `>` → `>=` 和 `startsWith` → `endsWith` 变异体，迫使测试对拒绝结果进行*具体*断言。 | 仍未测试 `code.length === MAX` 这样的边界值——这需要 **边界 / 数据覆盖**。 |
| + 数据（BVA） | 增加 `MAX`、`MAX+1` 和 `null` 情况。 | 仍然无法捕获第二个以 `code = undefined` 调用该验证器的消费者——这需要 **契约覆盖**。 |

每个新增轴都会弥补前一个轴在结构上**无法**发现的一类故障——仅靠分支覆盖永远无法检测弱断言，仅靠变异测试永远无法检测未测试的边界值，而仅靠契约覆盖永远无法检测逻辑 bug。这就是乘法效应。下表列出了每个轴及其盲点——将其理解为“要填补这个盲点，就再叠加一个轴”。

| 轴 | 无法检测 |
|------|----------|
| 语句 / 行 | 未执行的分支、缺失的断言、错误的返回值 |
| 分支 / 判定 | 复合条件的独立性、循环迭代次数、断言强度 |
| MC/DC | 数据值边界（仍需要 BVA）、断言强度 |
| 路径 | 运行时的组合爆炸；超出玩具函数后变得不切实际 |
| 变异测试 | 死代码区域（无覆盖）；断言的语义正确性（错误但严格的断言仍然可以杀死变异体） |
| RTM / 需求 | 需求是否完整；测试是否正确 |
| 端点 / API | 字段级形状正确性；行为正确性 |
| 契约 | 负空间——提供方具有但没有消费者使用的功能 |
| Schema | 语义正确性；字段含义 |
| 成对组合 | 3 路及以上的交互；顺序影响 |
| 状态转换 | 在转换之间传递的数据；未建模的行为 |
| 错误路径 | 错误是否得到了正确处理 |

非监管产品代码的典型分层组合：

1. **分支覆盖**——CI 门禁和回归触发器。
2. **需求 / AC 关联**——每条验收标准至少有一个测试。
3. **变异测试**——仅对纯逻辑核心模块每晚执行。
4. **成对组合**——用于多参数配置 / 功能界面。
5. **契约 / 端点覆盖**——用于公共 API。
6. **状态转换覆盖**——用于工作流。

这一套方案只会增加极少的 CI 分钟数，却能发现实践中绝大多数真正重要的测试套件盲点。

### 弱断言陷阱

高覆盖率无法反映质量的最常见原因：

```ts
// 100% statement coverage. 0% useful.
it("computes discount", () => {
  discount(150);            // line executed
  // no assertion
});
```

或者，更隐蔽一些：

```ts
// 100% statement coverage. Verifies nothing semantic.
it("renders form", () => {
  expect(render(<Form />)).toMatchSnapshot();
});
```

这两类测试都会执行它们涉及的每一行代码，并生成绿色的覆盖率报告。变异测试可以检测出这两类问题：`discount` 中的每个运算符变异都会存活，因为没有任何断言会失败；`<Form />` 中的每一处改动都会存活，因为可以使用 `--update-snapshot` 更新快照。**仅凭覆盖率无法将这些测试与强大的测试套件区分开来。**变异测试可以。

应对措施：当覆盖率报告显示覆盖率 ≥80%，但生产环境中仍持续出现缺陷时，在提高覆盖率目标之前，先对可疑模块运行变异分析。

### 基于风险的解读

覆盖率目标应当与风险**成比例**（[ISO/IEC/IEEE 29119](https://en.wikipedia.org/wiki/ISO/IEC/IEEE_29119)）。同一工件处于不同关键性等级时，不应设置相同的覆盖率门槛。以下表格可作为起点——应针对每个工件进行调整，而不是按照团队统一策略设置。

| 关键性 | 合理的结构化目标 | 变异测试？ | RTM？ | MC/DC？ |
|-------------|------------------------------|-----------|------|--------|
| NONE（文档、一次性代码） | — | 否 | 否 | 否 |
| LOW（内部工具） | 60% 行覆盖率 | 否 | 轻量级 | 否 |
| MEDIUM（CRUD / 标准产品） | 70–80% 分支覆盖率 | 仅针对核心逻辑 | 按 AC | 否 |
| MEDIUM-HIGH（面向用户的关键路径） | 80% 分支覆盖率 | 针对核心逻辑和关键验证器 | 强制 | 否 |
| HIGH（金钱、身份验证、安全） | 90%+ 分支覆盖率 | 纯逻辑核心必须执行 | 强制 + 审计级 | 标准要求时执行 |
| 受监管 | 按标准执行 | 建议对纯逻辑核心执行 | 强制 + 审计级 | 标准要求时必须执行 |

**增量阈值**（“下降幅度不得超过 X%”）通常比绝对下限更安全——它们能防止测试规范性退化，同时不会激励通过投机手段达标（[Optivem](https://journal.optivem.com/p/code-coverage-targets-recipe-for-disaster)）。例外情况是全新代码，因为没有可用于比较的基线。

### 需要识别的常见刷指标模式

1. **无断言测试**——执行代码，却不验证行为。变异测试可以揭示这类问题。
2. **仅快照测试**抬高数字——`expect(component).toMatchSnapshot()` 会覆盖每一行代码，却不验证任何语义；一次粗心的 `--update-snapshot` 就会使整个测试套件失去意义。应对措施：限制快照对覆盖率的贡献，或要求同时提供行为断言。
3. **覆盖死代码**——生产环境中无法到达的代码，却通过反射或仅供测试使用的入口被测试执行。静态分析器（SonarQube、Coverity）可以标记死代码；当死代码增加时，CI 应当失败。
4. **使用 try/catch 包装器**抑制失败，同时仍然执行代码行。
5. **压缩成单行**以降低分支数量（例如使用 `a && b && doX()` 代替 `if (a && b) doX();`）——这属于依赖工具特性的刷指标方式。
6. **在没有记录原因的情况下从覆盖率中排除文件**。应对措施：要求添加 `// coverage:ignore` 注释，并附上能够经受代码审查的理由。
7. **将生成代码计入覆盖率**以抬高分母。应对措施：确定性地排除 `*.generated.*`。
8. **在 RTM 中计入已计划但尚未通过的测试**。
9. **用一个简单测试标记多个 AC**，让 RTM 看起来全部通过。
10. **过时的追踪记录**——旧的 Playwright / OpenTelemetry 追踪记录掩盖了当前的缺口。

### Instrumentation 注意事项

- 覆盖率构建通常会禁用优化，因此 `coverage_build_behavior ≠ release_build_behavior`。这对 C/C++/Rust 和 MC/DC 尤其重要——覆盖率构建的二进制文件并不是发布构建的二进制文件。
- 使用基于采样的覆盖率进行并发测试执行可能会丢失数据；优先使用原子模式（Go `-covermode=atomic`、JaCoCo 离线插桩）。
- 通常无法覆盖由托管运行时调用的原生代码（JNI、FFI），除非明确进行相应的工具化处理。
- 热重载 / 监视模式环境会累积过时的覆盖率数据；测量前务必清理。

### 受监管领域的覆盖率标准

| 标准 | 领域 | 覆盖率要求 |
|----------|--------|----------------------|
| **[DO-178C](https://www.consunova.com/do178c-info.html)** §6.4.4.2，表 A-7 | 航空电子 | DAL A 要求 MC/DC；DAL B 要求判定覆盖率；DAL C 要求语句覆盖率；DAL D/E 不要求（[LDRA 结构覆盖率](https://ldra.com/ldra-blog/do-178c-structural-coverage-analysis/)） |
| **[ISO 26262](https://www.parasoft.com/learning-center/iso-26262/code-coverage/)** 第 6 部分表 9 | 汽车 | 强烈建议 ASIL D 使用 MC/DC；ASIL B–C 使用分支覆盖率；ASIL A 至少使用语句覆盖率（[Verifysoft](https://www.verifysoft.com/en_ISO_26262_Road_Vehicles_Functional_Safety.html)） |
| **[IEC 62304](https://intuitionlabs.ai/articles/iec-62304-medical-device-software-guide)** | 医疗 | 覆盖率要求随安全等级 A → B → C 提高；审核员期望对 C 类高风险模块使用 MC/DC；通常还会同时采用 MISRA C/C++ 编码标准 |
| **[MISRA C / MISRA C++](https://www.misra.org.uk/)** | 嵌入式（跨行业） | 编码规则符合性是主要信号；覆盖率是补充指标；安全关键组件应使用 MC/DC |
| **EN 50128 / EN 50657** | 轨道交通 | SIL 4 要求 MC/DC |
| **IEC 61508** | 功能安全总标准 | SIL 4 要求 MC/DC |

在受监管领域，覆盖率**目标由标准设定**，而不是通过 ROI 协商确定。需要选择的是适用哪个标准，而不是选择什么阈值。

---

## 决策参考表

这些是**查阅表**，不是步骤。阅读与工件及关键性相匹配的行；忽略其余内容。

### 按关键性划分的覆盖率方法

| 关键性 | 推荐的覆盖率信号 |
|-------------|------------------------------|
| NONE | 无——明确跳过 |
| LOW | 将行覆盖率作为警戒线；如果工作项有 AC，则建立 AC 关联 |
| MEDIUM | 分支覆盖率 + AC 关联；如果是 API 工件，则增加端点覆盖率 |
| MEDIUM-HIGH | 分支覆盖率 + AC 关联 + 端点 / 契约覆盖率；对验证器进行变异测试 |
| HIGH | 分支覆盖率 + 纯逻辑上的变异测试 + AC 关联 + 工作流的状态转换覆盖率 + 配置的成对覆盖率；标准要求时使用 MC/DC |
| 受监管（DO-178C / ISO 26262 / IEC 62304） | 采用标准规定的内容——通常包括 MC/DC + RTM + 可审计证据 |

### 按工件类型划分的覆盖率方法

| 工件 | 信息量最大的覆盖率维度 |
|----------|--------------------------------|
| 纯工具函数（解析器、计算器、格式化器） | 分支 + BVA/EP + 变异测试 |
| 带 DB / 队列的 HTTP 端点 | 分支（单元测试）+ 端点 + 契约 + 状态码 |
| UI 组件 | Storybook 故事覆盖率 + 交互覆盖率 + 视觉回归基线；通过分支覆盖率 + 变异测试覆盖逻辑辅助函数 |
| 工作流引擎 / 状态机 | 状态转换覆盖率（最低 0-switch，关键路径使用 1-switch）+ 分支 |
| 授权 / 策略模块 | 分支 + 受监管时使用 MC/DC，否则使用分支 + 变异测试；在设计阶段使用决策表覆盖率 |
| 多参数配置 / 功能开关 | 成对覆盖率（PICT / ACTS）+ 分支 |
| 被 N 个客户端使用的公共 API | 契约（Pact）+ 端点 + 模式 |
| 库 / SDK | 分支 + 基于属性的测试；对纯逻辑进行变异测试；已发布 API 表面覆盖率 |
| 生成的代码 | 从结构覆盖率中排除；仅通过集成测试进行验证 |

### 生态系统工具链速查

| 生态系统 | 结构覆盖 | 变异测试 | API | 组合测试 | BDD |
|-----------|-----------|----------|-----|---------------|-----|
| JS / TS | Istanbul/nyc, Vitest, Jest | Stryker | Schemathesis, Pact JS, Dredd | PICT | Cucumber-JS, Vitest+Gherkin |
| Java / JVM | JaCoCo | PIT | Pact JVM, Spring Cloud Contract | jcunit / NIST ACTS | Cucumber-JVM |
| Python | Coverage.py + pytest-cov | mutmut, Cosmic Ray | Schemathesis, pact-python | NIST ACTS, allpairspy | behave, pytest-bdd |
| Go | go cover + gocover-cobertura | go-mutesting | Schemathesis, pact-go | （手动 / NIST ACTS） | godog |
| .NET | Coverlet, dotCover, AltCover (OpenCover deprecated) | Stryker .NET | Pact .NET, Specmatic | PICT, NIST ACTS | Reqnroll (SpecFlow 的活跃分支) |
| Ruby | SimpleCov | mutant | pact-ruby | （手动） | Cucumber, RSpec |
| C / C++ | gcov/lcov, llvm-cov | Mull | （供应商特定） | NIST ACTS | （供应商特定） |
| Rust | cargo-llvm-cov, tarpaulin | cargo-mutants | （有限） | proptest 组合器 | （有限） |
| PHP | Xdebug / PCOV | Infection | pact-php | （手动） | Behat |

### UI / 交互覆盖补充指标

对于以 UI 为主的项目，这些专用覆盖指标可补充（而非替代）结构覆盖和变异测试分析：

- **Playwright trace coverage** — Playwright 会为每个测试记录 trace（DOM、网络、控制台）；[trace viewer](https://playwright.dev/docs/trace-viewer) 让 UI 覆盖变得**可审计**，这是 DOM 快照测试无法做到的。Trace 工件会增加 CI 存储空间。
- **Storybook coverage** — [Storybook Test](https://storybook.js.org/docs/writing-tests) 报告哪些 story（组件状态）具有交互测试（`play` 函数），哪些只有渲染快照。
- **Visual coverage** — 跨 story 的像素差异回归（[Chromatic](https://www.chromatic.com/)、Percy、Applitools、Playwright `toHaveScreenshot`）。覆盖元素 = 组件状态的视觉基线。

这些指标**不**衡量逻辑正确性（使用分支覆盖 + 变异测试），跨组件流程（使用 e2e），可访问性（使用 axe-core / Pa11y），或真实设备差异（使用 BrowserStack / Sauce / 设备云）。

---

## 来源与延伸阅读

### 标准

- **DO-178C** — RTCA；概览：<https://www.consunova.com/do178c-info.html>；LDRA 结构覆盖分析：<https://ldra.com/ldra-blog/do-178c-structural-coverage-analysis/>。
- **ISO 26262** — 道路车辆功能安全；Parasoft 摘要：<https://www.parasoft.com/learning-center/iso-26262/code-coverage/>；Verifysoft：<https://www.verifysoft.com/en_ISO_26262_Road_Vehicles_Functional_Safety.html>。
- **IEC 62304** — 医疗器械软件生命周期；<https://intuitionlabs.ai/articles/iec-62304-medical-device-software-guide>。
- **MISRA C / C++** — <https://www.misra.org.uk/>。
- **ISO/IEC/IEEE 29119** — 软件测试过程；<https://en.wikipedia.org/wiki/ISO/IEC_29119>；ISTQB 到 29119 的映射：<https://www.rcolomo.com/papers/326.pdf>。
- **ISTQB Foundation Level** — RTM 术语表条目：<https://istqb-glossary.page/traceability-matrix/>；BVA 白皮书：<https://istqb.org/wp-content/uploads/2025/10/Boundary-Value-Analysis-white-paper.pdf>。

### 结构化测试与 MC/DC

- LDRA MC/DC 功能：<https://ldra.com/capabilities/mc-dc/>.
- Wikipedia MC/DC：<https://en.wikipedia.org/wiki/Modified_condition/decision_coverage>.
- Qt Coco MC/DC：<https://www.qt.io/quality-assurance/coco/feature-modified-condition-decision-coverage-mcdc>.
- 圈复杂度：<https://en.wikipedia.org/wiki/Cyclomatic_complexity>。

### 结构化覆盖率工具

- Istanbul：<https://istanbul.js.org/>.
- JaCoCo：<https://www.eclemma.org/jacoco/>.
- Coverage.py：<https://coverage.readthedocs.io/>.
- llvm-cov：<https://llvm.org/docs/CommandGuide/llvm-cov.html>.
- Go 覆盖率：<https://go.dev/doc/build-cover>.
- Coverlet：<https://github.com/coverlet-coverage/coverlet>；NDepend 指南（OpenCover 弃用通知）：<https://blog.ndepend.com/guide-code-coverage-tools/>.
- SimpleCov：<https://github.com/simplecov-ruby/simplecov>。

### 变异测试

- Stryker（JS / .NET / Scala）：<https://stryker-mutator.io/>；配置：<https://stryker-mutator.io/docs/stryker-js/configuration/>；变异体状态：<https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/>；等价变异体：<https://stryker-mutator.io/docs/mutation-testing-elements/equivalent-mutants/>.
- Microsoft Learn 上的 Stryker .NET：<https://learn.microsoft.com/en-us/dotnet/core/testing/mutation-testing>。
- PIT（Pitest）：<https://pitest.org/>.
- mutmut：<https://mutmut.readthedocs.io/>；Cosmic Ray：<https://cosmic-ray.readthedocs.io/>。
- go-mutesting：<https://github.com/avito-tech/go-mutesting>。
- Infection（PHP）：<https://infection.github.io/>.
- Mull（LLVM）：<https://github.com/mull-project/mull>.
- cargo-mutants（Rust）：<https://mutants.rs/>.
- Mutant（Ruby）：<https://github.com/mbj/mutant>.
- CI 中的变异测试（研究）：<https://greg4cr.github.io/pdf/23mutationci.pdf>。

### 需求 / BDD

- Cucumber：<https://cucumber.io/>；behave：<https://behave.readthedocs.io/>；Reqnroll（活跃的 SpecFlow 分支）：<https://reqnroll.net/>.
- BDD 基本规则 — Automation Panda：<https://automationpanda.com/bdd/>.

### API / 契约

- Pact：<https://docs.pact.io/>；Pactflow CDC 说明：<https://pactflow.io/what-is-consumer-driven-contract-testing/>；Pact 与 OpenAPI 对比：<https://www.speakeasy.com/blog/pact-vs-openapi>；双向契约测试：<https://pactflow.io/blog/contract-testing-using-json-schemas-and-open-api-part-3/>.
- Spring Cloud Contract：<https://spring.io/projects/spring-cloud-contract/>.
- Specmatic：<https://specmatic.io/>.
- Schemathesis：<https://schemathesis.readthedocs.io/>.
- Dredd：<https://dredd.org/>。

### 组合 / 状态 / UI

- PICT：<https://github.com/microsoft/pict>.
- NIST ACTS：<https://csrc.nist.gov/projects/automated-combinatorial-testing-for-software>.
- 全对测试概览：<https://en.wikipedia.org/wiki/All-pairs_testing>.
- 状态转换测试（符合 ISTQB）：<https://www.leadwithskills.com/blogs/state-transition-testing-behavior-based-systems-istqb>.
- Playwright trace viewer：<https://playwright.dev/docs/trace-viewer>.
- Storybook Test：<https://storybook.js.org/docs/writing-tests>；Chromatic：<https://www.chromatic.com/>】【。

### 行业评论

- 《100% 代码覆盖率的谬误》— Thierry de Pauw：<https://thinkinglabs.io/articles/2022/03/19/the-fallacy-of-the-100-code-coverage.html>。
- 《代码覆盖率目标——灾难的配方》— Optivem Journal：<https://journal.optivem.com/p/code-coverage-targets-recipe-for-disaster>。
- 《70/80/90/100% 的覆盖率够好吗？》— Qt：<https://www.qt.io/quality-assurance/blog/is-70-80-90-or-100-code-coverage-good-enough>。
- 《AI 生成的测试带来虚假的信心》— CodeIntelligently：<https://codeintelligently.com/blog/ai-generated-tests-false-confidence>。