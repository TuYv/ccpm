---
name: property-based-testing
effort: low
description: "Writes, reviews, and debugs property-based tests — Hypothesis, fast-check, proptest, jqwik, rapid, and Echidna or Medusa for Solidity invariants. Use whenever tests should cover a whole input domain instead of a hand-picked list of examples: encode/decode and serialize/deserialize pairs, parsers, canonicalizers and normalizers, validators, numeric and Decimal types, comparators and sort order, data structures, and smart-contract state invariants. Also use when adding cases to an existing @given, fast-check, or proptest suite, when judging whether existing property tests assert anything real, and when a generator has shrunk a counterexample and you need to tell a wrong property from a genuine bug. Not for coverage-guided binary fuzzing (libFuzzer, AFL), mutation-testing campaigns, static analysis, benchmarking, or end-to-end UI tests."
---
# 基于属性的测试

示例测试断言一个点，而属性断言一条覆盖整个输入域的规则，并让生成器去搜寻反例。当代码具有某种代数形状——一个逆运算、一个不变量、一个参考实现——时，这笔交易才值得做，否则不值得。没有这种形状的代码就用示例测试；明说这一点也是正当的结果。

先检查形状是确实缺失，还是仅仅被埋住了。被 I/O 包裹的计算、靠拼接构造的字符串、原地修改——每一个都有对应的属性，却没有可以断言它的接缝。在下结论说没有东西可断言之前，先参阅 [references/refactoring.md](references/refactoring.md)。

## 属性目录

| 属性 | 公式 | 适用之处 |
|---|---|---|
| 往返 | `decode(encode(x)) == x` | 序列化、转换对 |
| 逆运算 | `f(g(x)) == x` | 加密/解密、压缩/解压 |
| 参考实现 | `new(x) == reference(x)` | 优化、重构、重新实现 |
| 幂等性 | `f(f(x)) == f(x)` | 规范化、格式化、排序 |
| 不变量 | 执行前后均成立 | 任何变换、合约状态 |
| 易于验证 | `is_sorted(sort(x))` | 带有廉价检查器的复杂算法 |
| 交换律 | `f(a, b) == f(b, a)` | 二元运算与集合运算 |
| 结合律 | `f(f(a,b), c) == f(a, f(b,c))` | 组合类操作 |
| 单位元 | `f(x, e) == x` | 带有单位元的操作 |

强度排序，从弱到强：
`no crash → type preservation → invariant → idempotence → roundtrip / oracle`。

断言代码所支持的最强属性。仅凭“不崩溃”很少值得引入依赖——如果只能找到这一点，那么要么一次小小的重排能暴露出更强的属性，要么诚实的报告是：这段代码不是好的 PBT 候选。先排除前一种，再接受后一种。

## 属性测试断言了空内容的两种方式

- **同义反复。** `assert add(a, b) == a + b` 只是把实现重述了一遍；两者共享的任何 bug 都不会让它失败。要挑选一个能约束函数、却不去重新计算它的属性。注意例外：当 `f` 并非显然纯函数时——比如处理 dict 或 set 的序列化器、哈希、任何读取时钟的东西——`f(x) == f(x)` 就是一条货真价实的确定性属性。
- **空洞。** 把几乎所有输入都过滤掉的 `assume()` 什么都没真正执行就通过了，而自相矛盾的 `assume()` 跑了零个用例照样通过。要把约束推进策略（strategy）里，让生成器直接产出有效输入。

## 接下来看哪里

加载与手头任务相匹配的那个：

| 任务 | 文件 |
|---|---|
| 编写新测试、设计策略 | [references/generating.md](references/generating.md) |
| 代码还没有可断言的属性 | [references/refactoring.md](references/refactoring.md) |
| 审查已有的属性测试 | [references/reviewing.md](references/reviewing.md) |
| 一个属性测试刚刚失败 | [references/interpreting-failures.md](references/interpreting-failures.md) |
| 库的选择，Echidna 与 Medusa | [references/libraries.md](references/libraries.md) |

## 向尚未使用 PBT 的项目引入它

如果项目已经在使用某个 PBT 库，直接用它写测试即可。如果没有，引入一个库是一项属于用户的依赖决策——提出一次，附上你会写的具体属性，然后无论答案如何都照单接受。
