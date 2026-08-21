---
name: bdi-mental-states
description: "This skill should be used when modeling agent mental states with BDI concepts: beliefs, desires, intentions, RDF-to-belief transformations, rational agency traces, cognitive agents, BDI ontologies, and neuro-symbolic AI integration."
---
# BDI 心智状态建模

使用形式化 BDI 本体模式，将外部 RDF 上下文转换为智能体心智状态（信念、欲望、意图）。此技能使智能体能够通过认知架构对上下文进行推理，从而支持审慎推理、可解释性以及多智能体系统内的语义互操作性。

## 何时启用

在以下情况下启用此技能：
- 将外部 RDF 上下文处理为智能体对世界状态的信念
- 使用感知、审慎思考和行动循环对理性智能体进行建模
- 通过可追溯的推理链实现可解释性
- 实现 BDI 框架（SEMAS、JADE、JADEX）
- 使用形式化认知结构增强 LLM（逻辑增强生成）
- 跨多智能体平台协调心智状态
- 跟踪信念、欲望和意图随时间的演变
- 将动机状态与行动计划关联起来

对于由其他技能负责的相邻工作，请勿启用此技能：
- 通用的上下文窗口说明或注意力机制：`context-fundamentals`。
- 不包含形式化 BDI 状态的持久化用户、实体或对话记忆：`memory-systems`。
- 监督者、群体或移交拓扑决策：`multi-agent-patterns`。
- 通用智能体评估量表或质量门控：`evaluation`。

## 核心概念

### 心智实在架构

将心智状态划分为两个本体论类别，因为 BDI 推理需要区分持续存在的事物与发生的事件：

**心智状态（持续体）** -- 将其建模为在时间区间内持续存在的认知属性：
- `Belief`：表示智能体认为关于世界的真实情况。将每个信念建立在世界状态引用的基础上。
- `Desire`：表示智能体希望促成的状态。将每个欲望关联回激发该欲望的信念。
- `Intention`：表示智能体承诺实现的目标。意图必须满足某个欲望并指定一个计划。

**心智过程（发生体）** -- 将其建模为创建或修改心智状态的事件，因为跟踪因果转换能够实现可解释性：
- `BeliefProcess`：根据感知触发信念的形成或更新。始终将其连接到生成该信念的世界状态。
- `DesireProcess`：根据现有信念产生欲望。保留动机链。
- `IntentionProcess`：承诺将选定的欲望转化为可付诸行动的意图。

### 认知链模式

使用双向属性（`motivates`/`isMotivatedBy`、`fulfils`/`isFulfilledBy`）将信念、欲望和意图连接成有向链，因为这样既能实现正向推理（智能体应该做什么？），也能实现反向追溯（智能体为何采取行动？）：

```turtle
:Belief_store_open a bdi:Belief ;
    rdfs:comment "Store is open" ;
    bdi:motivates :Desire_buy_groceries .

:Desire_buy_groceries a bdi:Desire ;
    rdfs:comment "I desire to buy groceries" ;
    bdi:isMotivatedBy :Belief_store_open .

:Intention_go_shopping a bdi:Intention ;
    rdfs:comment "I will buy groceries" ;
    bdi:fulfils :Desire_buy_groceries ;
    bdi:isSupportedBy :Belief_store_open ;
    bdi:specifies :Plan_shopping .
```

### 世界状态溯源

始终通过对世界状态的引用来锚定心智状态，而不是使用自由文本描述，因为未锚定的信念会破坏语义查询和智能体间的互操作性：

```turtle
:Agent_A a bdi:Agent ;
    bdi:perceives :WorldState_WS1 ;
    bdi:hasMentalState :Belief_B1 .

:WorldState_WS1 a bdi:WorldState ;
    rdfs:comment "Meeting scheduled at 10am in Room 5" ;
    bdi:atTime :TimeInstant_10am .

:Belief_B1 a bdi:Belief ;
    bdi:refersTo :WorldState_WS1 .
```

### 目标导向规划

通过 `bdi:specifies` 将意图与计划连接起来，并使用 `bdi:precedes` 将计划分解为有序的任务序列，因为这种分离方式既能让计划在不同意图之间复用，又能明确执行顺序：

```turtle
:Intention_I1 bdi:specifies :Plan_P1 .

:Plan_P1 a bdi:Plan ;
    bdi:addresses :Goal_G1 ;
    bdi:beginsWith :Task_T1 ;
    bdi:endsWith :Task_T3 .

:Task_T1 bdi:precedes :Task_T2 .
:Task_T2 bdi:precedes :Task_T3 .
```

### T2B2T 范式

将“三元组到信念再到三元组”实现为双向管道，因为智能体既必须使用外部 RDF 上下文，也必须生成新的 RDF 断言。将每个 T2B2T 实现划分为两个明确的阶段：

**阶段 1：三元组到信念** -- 将传入的 RDF 三元组转换为信念实例。使用 `bdi:triggers` 将外部世界状态连接到 `BeliefProcess`，并使用 `bdi:generates` 生成相应的信念。这样可以保留从源数据到内部认知的来源信息：
```turtle
:WorldState_notification a bdi:WorldState ;
    rdfs:comment "Push notification: Payment request $250" ;
    bdi:triggers :BeliefProcess_BP1 .

:BeliefProcess_BP1 a bdi:BeliefProcess ;
    bdi:generates :Belief_payment_request .
```

**阶段 2：信念到三元组** -- 在 BDI 推理选择意图并执行计划后，使用 `bdi:bringsAbout` 将结果投射回 RDF。这样可以闭合循环，使下游系统能够将智能体输出作为标准关联数据使用：
```turtle
:Intention_pay a bdi:Intention ;
    bdi:specifies :Plan_payment .

:PlanExecution_PE1 a bdi:PlanExecution ;
    bdi:satisfies :Plan_payment ;
    bdi:bringsAbout :WorldState_payment_complete .
```

### 按层级选择表示法

根据所建模的 C4 抽象层级选择表示法，因为在错误的层级混用表示法不仅无法阐明认知架构，反而会使其更加模糊：

| C4 层级 | 表示法 | 心智状态表示 |
|----------|----------|----------------------------|
| L1 上下文 | ArchiMate | 智能体边界、外部感知源 |
| L2 容器 | ArchiMate | BDI 推理引擎、信念存储、计划执行器 |
| L3 组件 | UML | 心智状态管理器、流程处理器 |
| L4 代码 | UML/RDF | 信念/欲望/意图类、本体实例 |

### 论证依据与可解释性

使用 `bdi:isJustifiedBy` 为每个心智实体附加 `bdi:Justification` 实例，因为缺乏论证依据的心智状态会使智能体的推理不透明且无法追溯。每个论证依据都应记录产生该心智状态的证据或规则：

```turtle
:Belief_B1 a bdi:Belief ;
    bdi:isJustifiedBy :Justification_J1 .

:Justification_J1 a bdi:Justification ;
    rdfs:comment "Official announcement received via email" .

:Intention_I1 a bdi:Intention ;
    bdi:isJustifiedBy :Justification_J2 .

:Justification_J2 a bdi:Justification ;
    rdfs:comment "Location precondition satisfied" .
```

### 时间维度

使用 `bdi:hasValidity` 和 `TimeInterval` 实例为每个心智状态指定有效时间区间，因为没有时间边界的信念无法在历时推理期间进行垃圾回收或冲突检查：

```turtle
:Belief_B1 a bdi:Belief ;
    bdi:hasValidity :TimeInterval_TI1 .

:TimeInterval_TI1 a bdi:TimeInterval ;
    bdi:hasStartTime :TimeInstant_9am ;
    bdi:hasEndTime :TimeInstant_11am .
```

使用 SPARQL 时间过滤器查询特定时刻处于活跃状态的心智状态。当关于同一世界状态的多个信念在时间上重叠时，使用此模式解决冲突：

```sparql
SELECT ?mentalState WHERE {
    ?mentalState bdi:hasValidity ?interval .
    ?interval bdi:hasStartTime ?start ;
              bdi:hasEndTime ?end .
    FILTER(?start <= "2025-01-04T10:00:00"^^xsd:dateTime &&
           ?end >= "2025-01-04T10:00:00"^^xsd:dateTime)
}
```

### 组合式心智实体

使用 `bdi:hasPart` 关系将复杂信念分解为组成部分，因为整体式信念在部分更新时需要进行完整替换。应以组合方式构造信念，使每个子信念都可以独立更新、查询或失效：

```turtle
:Belief_meeting a bdi:Belief ;
    rdfs:comment "Meeting at 10am in Room 5" ;
    bdi:hasPart :Belief_meeting_time , :Belief_meeting_location .

# Update only location component without touching time
:BeliefProcess_update a bdi:BeliefProcess ;
    bdi:modifies :Belief_meeting_location .
```

## 实用指南

### 分六个阶段构建 BDI 模型

将外部语义上下文转换为 BDI 表示时，请使用以下工作流程：

1. **定义世界状态基础层**：识别智能体可以感知的外部事实或事件。在创建信念之前，将这些内容建模为世界状态。
2. **创建信念实例**：将每个相关的世界状态转换为带有来源、时间有效性和理由引用的信念。
3. **从信念推导愿望**：仅当某个信念产生与目标相关的动机时，才添加愿望。将每个愿望链接到激发它的信念。
4. **审慎地确立意图**：仅当智能体承诺执行某项计划时，才将愿望提升为意图。记录所选计划及其前置条件。
5. **将行动结果映射回三元组**：执行后，以 RDF 形式输出产生的世界状态，使下游系统能够使用新状态。
6. **使用能力问题进行验证**：在信任模型之前，查询来源、动机、计划顺序和当前有效的时间窗口。

### 保持本体精简

从 `Agent`、`WorldState`、`Belief`、`Desire`、`Intention`、`Plan`、`Task`、`Justification` 和 `TimeInterval` 开始。只有当能力问题证明核心模型无法回答所需查询时，才添加专用类。紧凑的本体更易于序列化到提示词中，更易于验证，也不太可能产生脆弱的推理链。

### 仅在心智状态语义至关重要时使用 BDI

当系统需要可解释的能动性时，采用 BDI 建模是合理的：智能体为何相信某件事、该信念产生了什么愿望、选择了哪个意图，以及执行了什么计划。如果系统只需跨会话记忆事实，请使用 `memory-systems`。如果系统只需在多个智能体之间拆分工作，请使用 `multi-agent-patterns`。

## 详细主题

### 集成模式

### 逻辑增强生成（LAG）

使用 LAG，以本体结构约束 LLM 输出，因为无约束生成会产生违反 BDI 类限制的三元组。将本体序列化到提示词上下文中，然后根据本体校验生成的三元组，再决定是否接受：

```python
def augment_llm_with_bdi_ontology(prompt, ontology_graph):
    ontology_context = serialize_ontology(ontology_graph, format='turtle')
    augmented_prompt = f"{ontology_context}\n\n{prompt}"

    response = llm.generate(augmented_prompt)
    triples = extract_rdf_triples(response)

    is_consistent = validate_triples(triples, ontology_graph)
    return triples if is_consistent else retry_with_feedback()
```

### SEMAS 规则转换

部署到基于规则的智能体平台时，将 BDI 本体模式转换为可执行的产生式规则。将认知链中的每个环节（信念到愿望、愿望到意图）映射为 HEAD/CONDITIONALS/TAIL 规则，因为这样既能保留审议语义，又能实现运行时执行：

```prolog
% Belief triggers desire formation
[HEAD: belief(agent_a, store_open)] /
[CONDITIONALS: time(weekday_afternoon)] »
[TAIL: generate_desire(agent_a, buy_groceries)].

% Desire triggers intention commitment
[HEAD: desire(agent_a, buy_groceries)] /
[CONDITIONALS: belief(agent_a, has_shopping_list)] »
[TAIL: commit_intention(agent_a, buy_groceries)].
```

## 指南

1. 将世界状态建模为独立于智能体视角的配置，为心智状态提供指称基础。

2. 区分延续体（持续存在的心智状态）与发生体（具有时间性的心智过程），以与 DOLCE 本体保持一致。

3. 将目标视为描述而非心智状态，保持认知层与规划层之间的分离。

4. 对部分关系结构使用 `hasPart` 关系，以支持选择性信念更新。

5. 通过 `atTime` 或 `hasValidity` 将每个心智实体与时间构造相关联。

6. 使用双向属性对（`motivates`/`isMotivatedBy`、`generates`/`isGeneratedBy`），以支持灵活查询。

7. 将心智实体链接到 `Justification` 实例，以提升可解释性和可信度。

8. 按以下步骤实现 T2B2T：(1) 将 RDF 转换为信念；(2) 执行 BDI 推理；(3) 将心智状态投射回 RDF。

9. 为心智过程定义存在性限制（例如，`BeliefProcess ⊑ ∃generates.Belief`）。

10. 复用已有的 ODP（EventCore、Situation、TimeIndexedSituation、BasicPlan、Provenance），以实现互操作性。

## 能力问题

使用以下 SPARQL 查询验证实现：

```sparql
# CQ1: What beliefs motivated formation of a given desire?
SELECT ?belief WHERE {
    :Desire_D1 bdi:isMotivatedBy ?belief .
}

# CQ2: Which desire does a particular intention fulfill?
SELECT ?desire WHERE {
    :Intention_I1 bdi:fulfils ?desire .
}

# CQ3: Which mental process generated a belief?
SELECT ?process WHERE {
    ?process bdi:generates :Belief_B1 .
}

# CQ4: What is the ordered sequence of tasks in a plan?
SELECT ?task ?nextTask WHERE {
    :Plan_P1 bdi:hasComponent ?task .
    OPTIONAL { ?task bdi:precedes ?nextTask }
} ORDER BY ?task
```

## 示例

**示例 1：从 RDF 通知到 BDI 链**

输入世界状态：

```turtle
:WorldState_invoice_due a bdi:WorldState ;
    rdfs:comment "Invoice INV-42 is due tomorrow" ;
    bdi:atTime :Time_2026_05_15 .
```

BDI 投影：

```turtle
:Belief_invoice_due a bdi:Belief ;
    bdi:refersTo :WorldState_invoice_due ;
    bdi:isJustifiedBy :Justification_billing_system ;
    bdi:motivates :Desire_avoid_late_fee .

:Desire_avoid_late_fee a bdi:Desire ;
    bdi:isMotivatedBy :Belief_invoice_due .

:Intention_pay_invoice a bdi:Intention ;
    bdi:fulfils :Desire_avoid_late_fee ;
    bdi:specifies :Plan_pay_invoice .
```

**示例 2：边界判断**

如果任务是“记住 Alice 偏好简洁的摘要”，请使用 `memory-systems`。如果任务是“表示智能体为何相信 Alice 需要摘要、这会产生什么目标，以及智能体承诺采用哪项计划”，请使用此技能。

## 注意事项

1. **混淆心理状态与世界状态**：心理状态通过 `bdi:refersTo` 引用世界状态，它们本身并不是世界状态。将二者混在一起会破坏感知与认知之间的边界，并导致按类型筛选的 SPARQL 查询失效。

2. **缺少时间边界**：每个心理状态都需要有效期区间，以支持历时推理。若无有效期区间，过时的信念将无限期持续存在，并使冲突检测变得不可能。

3. **扁平的信念结构**：对于复杂信念，应使用 `hasPart` 进行组合式建模。单体式信念会导致仅有一个属性发生变化时，也必须整体替换。

4. **隐式论证依据**：始终将心理实体链接到显式的 `Justification` 实例。没有论证依据的心理状态无法被审计或追溯。

5. **意图直接映射到行动**：意图指定计划，计划包含任务；行动执行任务。跳过计划层将无法复用、重新排序或共享执行策略。

6. **本体过度复杂**：从 5–10 个核心类和属性（Belief、Desire、Intention、WorldState、Plan 以及关键关系）开始。过早扩展本体会增加提示词上下文并降低 SPARQL 查询速度，却无法提升推理质量。

7. **推理成本爆炸**：将信念链保持在 3 层或更少（belief -> desire -> intention）。更深的链对于 LLM 推理而言成本高得令人难以承受，并且与较浅的替代方案相比，几乎无法提升决策质量。

## 集成

本技能负责形式化心智状态建模。相邻技能负责不同层面：

- `memory-systems`：持久化事实、实体记忆和时序知识图谱，但不涉及 BDI 的信念/愿望/意图语义。
- `multi-agent-patterns`：智能体拓扑、交接协议以及智能体之间的协调。
- `evaluation`：BDI 实现的能力问题、回归检查和质量门禁。
- `context-fundamentals`：用于指导提示词构建的上下文窗口和注意力机制的概念性知识。
- `tool-design`：BDI 查询、验证或投影工具的模式和工具契约。

## 参考资料

内部参考资料：
- [BDI 本体核心](./references/bdi-ontology-core.md) - 适合阅读的情形：实现 BDI 类层次结构或从零开始定义本体属性
- [RDF 示例](./references/rdf-examples.md) - 适合阅读的情形：编写心智状态的 Turtle 序列化或调试三元组结构
- [SPARQL 能力查询](./references/sparql-competency.md) - 适合阅读的情形：根据能力问题验证实现或构建自定义查询
- [框架集成](./references/framework-integration.md) - 适合阅读的情形：将 BDI 模型部署到 SEMAS、JADE 或 LAG 流水线

主要来源：
- Zuppiroli 等，《信念—愿望—意图本体》（2025）— 适合阅读的情形：实现形式化 BDI 类层次结构或验证本体对齐
- Rao 与 Georgeff，《BDI 智能体：从理论到实践》（1995）— 适合阅读的情形：理解实践推理智能体的理论基础
- Bratman，《意图、计划与实践理性》（1987）— 适合阅读的情形：以意向性的哲学基础为实现决策提供依据

---

## 技能元数据

**创建日期**：2026-01-07
**最后更新**：2026-05-15
**作者**：面向上下文工程贡献者的智能体技能
**版本**：2.1.0