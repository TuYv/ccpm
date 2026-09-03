---
name: thinking-via-negativa
description: Use when the reflex is to add a feature, layer, or process. Prefer removing harmful or nonessential elements first, with an irreversibility guard before deletion.
disable-model-invocation: true
---
# Via Negativa

先做减法，再做加法。优先移除危害、浪费和非必要的复杂度；只有在移除候选项被穷尽之后仍存在已被证明的需求时，才进行添加。

## 何时使用

- 即将通过添加功能、抽象、依赖、流程或控制来修复问题时。
- 简化那些复杂度就是税负的系统或工作流时。
- 通过决定不保留、不构建或不维护哪些内容来排列优先级时。
- 在性能或可靠性工作中，当消除一条糟糕路径胜过生硬叠加缓解措施时。

## 何时不使用

- 承重型控制：认证、校验、测试、限流、重试、安全检查——在被证明失效之前，一律推定其必要。
- 已被证明无法通过移除或简化满足的需求。
- 缺乏未使用或净危害证据的美学式极简。
- 影响未知且没有回滚路径的不可逆删除。

## 流程

1. **暂停添加的本能冲动。**用一句话说明目标和提议的添加内容。
2. **先提出减法问题。**列出可以移除或停止的内容，以更小的暴露面实现同一目标。
3. **以证据为候选项编目。**优先考虑未使用、冗余、高成本/低价值或有害的元素。要求提供使用情况、调用图、指标或实验证据——而非个人品味。
4. **应用不可逆性防护。**将候选项分为可逆与难以恢复两类；识别依赖方；拒绝删除未经证实的神秘防护项。当风险不可忽略时，规划分阶段移除或加以标记。
5. **先移除最安全的高价值候选项。**做减法、监控，并在进行下一次移除之前验证所需行为未缺失。
6. **仅在目标仍未达成时才添加。**如果减法无法满足需求，则添加最小变更，并记录移除为何不足。
7. 当目标因移除而达成，或剩余候选项未达到不可逆性/证据门槛、且最小添加具备正当理由时，**停止**。

**停止条件：**通过移除达成目标，或在有证据支撑的减法失败后，残余需求已被记录在案。

## 输出

```text
Goal: <desired outcome>
Proposed add (if any): <thing>
Removal candidates: <element — evidence — risk — reversible?>
Action: remove <X> | staged remove <X> | add minimal <Y> because <why removal failed>
Verification plan: <how absence/success is checked>
Do-not-touch: <load-bearing items preserved>
```

## 验证

- 若某项内容在没有未使用/危害证据的情况下被删除，或某项安全控制被当作“复杂度”而移除，则判定不通过。
- 若某项添加在未针对同一目标先做一轮减法核查的情况下就已发布，则判定不通过。
- 过度应用防护：当该元素起承重作用或需求已被证明时，不要为了行数或纯粹性而删除。
