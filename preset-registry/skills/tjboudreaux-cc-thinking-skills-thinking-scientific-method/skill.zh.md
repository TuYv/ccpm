---
name: thinking-scientific-method
description: When a symptom has several plausible causes, rank falsifiable hypotheses and run the cheapest discriminating observation first; prefer least-assumptive survivors only after evidence fit.
disable-model-invocation: true
---
# 科学方法（假设鉴别法）

当某个症状可能来自多个来源时，枚举相互竞争的可证伪假设，并将成本最低的观测用于最能区分这些假设的那项检查。每次观测之后，仅保留仍然符合事实的假设，然后在幸存者中选择无支持假设最少的那一个作为工作解释。

## 何时使用

- 某个缺陷、事件或异常存在不止一个合理的原因。
- 你现在就能查看代码、日志、diff、trace、测试、配置或数据。
- 在修复之前，你必须先定位出问题的文件、函数、分支、配置或不变量。
- 相互竞争的解释都符合相同的表面事实，而你需要一个有区分力的检查。

## 何时不使用

- 从单个堆栈、失败的测试或最近的 diff 中已能明显看出原因——直接修复。
- 只存在一个合理的假设——直接测试它；不要为了走形式而虚构竞争对手。
- 目前尚无法进行任何观测——先获取访问权限；不要凭空猜测定位结果。
- 为期数周的实验、产品 A/B 测试或策略试点——本技能适用于 agent 当下即可执行的检查。
- 故障已经定位，而你需要系统性的根因/预防深度——请使用 five-whys-plus。
- “仅这些对象/时间”这类选择性缺陷更适合用 IS/IS-NOT 对比——请使用 Kepner-Tregoe。
- 表现形式（文档/仪表盘）可能与实际情况脱节——先用 map-territory 验证实际状况，再恢复假设分析。

## 流程

1. **精确陈述症状。** 记录失败行为、范围、时机、环境和约束条件。将观察与解读区分开来。
2. **枚举 2–5 个相互竞争的假设。** 指明具体的文件、函数、配置、输入条件或不变量。拒绝模糊的归类（“后端问题”）。如果经过认真检查后不再存在严肃的替代假设，就退出该鉴别流程，直接测试或修复这唯一有证据支持的原因；绝不要为了继续流程而虚构竞争对手。
3. **在动手查看之前先指明证伪条件和低成本观测。** 对每个假设：什么样的结果会将其排除，以及你现在能运行哪些 read/grep/diff/log/test 检查。优先选择立即可用的观测，而非部署、金丝雀发布或长时间等待。
4. **按区分度 × 低成本给观测排序。** 运行成本最低、最能区分主要竞争者的检查。如果一次低成本的交叉检查就能排除其他选项，就不要先深挖最受青睐的那个假设。
5. **每次观测后更新。** 剔除已证伪的假设。在仍然符合全部证据的幸存者中，优先选择独立且无支持的假设最少的那一个（额外组件、罕见时序、外部依赖）。简约性是在符合证据之后才用来给幸存者排序；它绝不会挽救一个已被证据否定的更精简假设。只有当更简单的幸存者都被排除后，才升级到更复杂的假设。
6. **定位并停止。** 当某个假设已有直接支持证据且关键替代假设被排除时，指明需要修改的文件/函数/配置以及支持该定位的证据。一旦定位是直接的，就停止分析。

## 输出

```text
Symptom: <specific failing behavior, scope, timing>
Hypotheses:
  H1: <specific cause> | Why plausible | Observation | Falsified if
  H2: ...
  H3: ...
Test order: <cheapest discriminating checks>
Results: <what each observation showed>
Survivors: <remaining Hs; least-assumptive working pick among fit>
Localized fault: <file/function/config + supporting evidence>
Ruled out: <Hs dropped and why>
```

## 验证

- 如果你是在严肃假设不足两个的情况下继续推进，或是事先没有声明任何证伪条件、跳过了成本更低的区分性检查、或在证据已与之矛盾后仍保留“更简单”的说法，就应否定该鉴别结论。
- 当故障被直接定位且重要的替代假设已被排除时即停止；不要继续空谈理论。
- 过度使用防护：在不存在相互竞争的原因时，不要照本宣科地叙述“观察→提问”；不要把假设最少当作证明；当已有证据表明存在单一明显原因时，不要运行本技能。
