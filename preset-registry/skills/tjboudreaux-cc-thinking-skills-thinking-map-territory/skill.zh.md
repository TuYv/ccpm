---
name: thinking-map-territory
description: When a claim, doc, test, metric, or assumption conflicts with observed behavior, stop theorizing from the map and verify the live code or data; let territory overrule.
disable-model-invocation: true
---
# 地图与疆域

文档、测试、图表、指标、注释和心智模型都是地图。运行中的代码和实际数据才是疆域。当二者不一致时，验证疆域并更新模型——绝不要强迫现实去符合描述。

## 何时使用

- 观察到的行为与文档、测试预期、图表、注释、仪表盘或先前的假设相矛盾。
- 关于系统的某个论断来自二手来源，而非当前代码或数据。
- 测试通过，但生产环境或手动验证的行为是错的。
- 你在查看实际发生的情况之前，就准备开始理论化「为什么会发生」。
- 某项决策取决于某个模型、schema 或指标是否仍然有效。

## 何时不使用

- 地图本身就是你被要求编辑的产物（文档、图表、规格说明）——该产物就是任务的疆域。
- 同一路径本会话中已验证过——复用该观察结果。
- 地图是权威且具生成性的（codegen 类型、派生 schema），且没有声称存在漂移。
- 不一致无法改变决策——记下并继续。
- 疆域已确认后仍存在相互竞争的因果假设——切换到 scientific-method 技能。
- 构造安全漏洞利用——使用 red-team 技能；本技能只用于裁定「模型与观察」之争。

## 操作步骤

1. **指明地图。** 说明所信任的确切表述：是哪份文档、测试、指标、图表、注释或假设。引用原话，而不是转述。
2. **指明疆域检查方式。** 说明能够证明或推翻该论断的观察手段：代码路径、运行时取值、查询、复现、最近的变更，或实时指标。
3. **核实来源与新鲜度。** 确认地图的来源（作者、生成器、最后更新时间），以及它相对于部署、配置或数据变更是否可能已过期。优先使用当前的一手来源，而非摘要。
4. **观察疆域。** 阅读真实的代码路径，运行它或对其加埋点，查询真实数据，或复现该行为。不要仅凭签名或名称来判断。
5. **记录差异并更新。** 如果疆域与地图相矛盾，就已上线的行为而言，疆域说了算。记录差距，修订模型，再决定修复方式（改代码、改地图，或两者都改）。记下地图未覆盖的路径——它们很可能是下一个故障点。
6. **一旦定论即停止。** 当论断已被具体观察确认或推翻后，就停止对同一路径的重复检查。

## 输出

```text
Map: <claim + source + freshness>
Territory check: <what was inspected/run/queried>
Observation: <concrete result, not interpretation>
Delta: <aligned | map wrong | territory incomplete>
Updated model: <corrected understanding>
Action: <fix code | update map | no decision impact>
Uncovered: <paths no map covers>
```

## 验证

- 若你只依据地图推理而没有进行疆域观察、信任了过期的二手来源，或在未检查任何一方的情况下强迫代码匹配错误文档，则判为未通过。
- 当矛盾已解决或与决策无关时，即停止。
- 过度使用防范：在编辑地图本身时、当地图是生成性的唯一事实来源时、或当差距无法改变下一步行动时，不要重新验证整个系统。
