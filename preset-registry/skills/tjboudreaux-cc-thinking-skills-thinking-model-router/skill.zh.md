---
name: thinking-model-router
description: When unsure which thinking skill fits, map domain and problem type, then return NONE or one primary skill by default (at most three complementary).
disable-model-invocation: true
---
# Model Router

**核心规则：**优先选择 NONE 或一个主技能。依据机制契合度进行路由，而非习惯。仅当角色明确且必要时才组合使用。

## 何时使用

- 不清楚哪个思维技能合适，否则只能靠猜测或堆叠工具。
- 多个目录技能看起来都可行，而你需要一个单一主技能（或明确的 NONE）。
- 高风险工作，错误的框架代价高昂，而快速的领域×类型匹配能有所帮助。

## 何时不使用

- 匹配已明确或显而易见（“瓶颈在哪？”→ theory-of-constraints）——直接调用该技能；不要为了走形式而路由。
- 任务是常规实现，没有分析层面的未知——直接推理（NONE）。
- 你正在执行已商定的计划，只需要下一个具体步骤。
- 请求超出本目录范围（纯编码语法、无需判断的工具操作）——NONE。

## 调用模型（技能 ID）

路由器输出裸 slug（例如 `id: five-whys-plus`）。使用 Skill 工具、以确切的 ID `thinking-skills:thinking-<slug>` 调用被路由的技能——绝不编造 Procedure 中未引用的 slug。`NONE` 表示不进行调用。

## 流程

1. **短路。**如果某个技能在机制上明显契合，仅返回该技能。如果没有技能能明显改善工作，返回 **NONE** 并直接推理。到此为止。
2. **特征刻画。**记录领域（编码、架构、产品、战略、个人、抽象、风险、创新）和问题类型（诊断、决策、理解、创造、评估、预测、优化）。注意约束条件：时间、信息、利害、可逆性、复杂度。
3. **按类型默认给出候选（约束需要时可覆盖）。**仅保留目录中的活跃技能：
   - 诊断 → five-whys-plus 或 scientific-method（需要 IS/IS-NOT 矩阵时用 kepner-tregoe）
   - 决策 → reversibility 优先；然后是 opportunity-cost 或 probabilistic
   - 理解 → systems（模型与现实存在差距时用 map-territory；方法域不清晰时用 cynefin）
   - 创造 → first-principles（矛盾用 triz；手段驱动用 effectuation；删除优先用 via-negativa）
   - 评估 → steel-manning（假设/定义是未知项时用 socratic）
   - 预测 → probabilistic
   - 优化 → theory-of-constraints（时间压力下用 ooda；搜索停止用 bounded-rationality）
   - 风险 /“什么会失败？”→ pre-mortem 或 red-team；缓冲用 margin-of-safety
   - 产品“该构建什么？”→ jobs-to-be-done
   - 能力圈 / 持久性 → circle-of-competence、lindy-effect
   - 受控假想 → thought-experiment
   - 多视角仅在单一主技能未通过盲点检查之后 → model-combination
4. **按标准选择（满意即可，satisficing）。**仅当剩余 2 个以上候选，或利害关系使强制默认不安全时才打分。对每项标准打 1–5 分（1 = 缺失/不契合；3 = 可用但有缺口；5 = 直接契合）：问题契合度（30%）、可用输入（20%）、应用耗时（15%）、干系人可用性（15%）、正确运用的能力（20%）。一条路由必须问题契合度 ≥4 且加权总分 ≥3.5；否则返回 **NONE**。总分差距在 0.25 以内时，优先选择输入更少、执行更短者；若仍然持平，选择 NONE，除非这些技能回答的是彼此不同且互补的问题。
5. **多技能仅作例外。**仅当每个技能都承担主技能遗留未覆盖的明确互补角色时，才添加第二个或第三个技能。上限为三个。优先顺序执行而非并行。近邻与同义技能不叠加。对于组合模式，在命名主技能后移交给 model-combination。
6. **退出。**列明放弃信号（强行契合、被忽视的因素、约 15 分钟无洞见）。出现不匹配时，重新路由一次或回退到 NONE——绝不强行套用框架。

**领域速查表（主技能优先；仍默认单一技能或 NONE）：**

| 领域信号 | 优先选择 |
|---------------|--------|
| 缺陷 / 根因 / 偶发不稳定 | five-whys-plus, scientific-method, systems |
| 架构 / 技术选型 | reversibility, systems, lindy-effect, opportunity-cost |
| 功能 / 路线图 / 用户参与 | jobs-to-be-done, opportunity-cost, theory-of-constraints |
| 战略 / 竞争 / 增长 | cynefin, systems, red-team, second-order |
| 个人 / 职业承诺 | opportunity-cost, reversibility, circle-of-competence, pre-mortem |
| 论证 / 信念更新 | steel-manning, probabilistic, socratic, first-principles |
| 安全 / 灾难 / 毁灭性风险 | pre-mortem, red-team, margin-of-safety, via-negativa |
| 创新 / 矛盾 / 简化 | first-principles, triz, effectuation, via-negativa |

## 输出

```text
outcome: NONE | one | multi
routes:
  - id: <primary skill id or NONE>
    role: <job this skill performs>
    unique_question: <question only this route answers>
  - id: <secondary skill id, only for multi>
    role: <distinct complementary job>
    unique_question: <distinct open question>
  - id: <tertiary skill id, only for multi>
    role: <distinct complementary job>
    unique_question: <distinct open question>
domain: <domain>
problem_type: <type>
constraints: <time/info/stakes/reversibility>
rationale: <mechanism fit in one sentence>
blind_spots: <what primary still ignores, if any>
exit: <when to abandon or re-route>
```

默认填充：`outcome: NONE` 搭配一条 `id: NONE` 路由，或 `outcome: one` 搭配一条路由。仅当所列每个技能都有明确角色和独特问题时，才使用 `multi`。

## 验证

- **证伪 / 停止：**如果路由依据是习惯或熟悉度而非机制契合，弃用并重新打分或返回 NONE。如果多技能条目缺乏明确角色，收敛为单一最佳主技能。如果没有候选能明显提供帮助，NONE 即为正确——不要编造路由。
- **过度应用防护：**技能已显而易见时不要路由。不要返回超过三个技能。不要引用已删除或不在目录中的名称。不要把路由器当作直接调用叶子技能的前置条件。
