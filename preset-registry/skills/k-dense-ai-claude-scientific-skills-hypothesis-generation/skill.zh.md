---
name: hypothesis-generation
description: Formulate evidence-bounded scientific questions, candidate hypotheses, rival explanations, causal or associational claims, discriminating predictions, measurements, and preregistration-ready analysis plans. Use when turning observations or preliminary findings into transparent, testable research plans without treating hypotheses as facts.
license: MIT
compatibility: Python 3.11+ standard library. Bundled CLIs are deterministic and local-only; they accept bounded JSON, CSV, or Markdown and require no network, credentials, models, image services, or external packages.
metadata:
  version: "2.1"
  skill-author: K-Dense Inc.
  last-reviewed: "2026-07-23"
---
# 科学假设生成

将一项观察转化为一组透明的候选解释和检验。假设是一个有待质疑的提议，而不是发现、事实、诊断或建议。

## 不可妥协的边界

在使用未发表的、敏感的、受控的、个人的、专有的、出口管制的或与安全相关的材料之前：

1. 确认授权，以及适用的机构、资助方、出版方、数据使用、隐私和 AI 政策。
2. 除非获得授权人员的明确批准，指定外部接收方和数据范围，否则应将材料保留在本地。
3. 尽量减少输入。未经授权，不得将敏感或未发表的数据放入网络搜索或外部 AI 系统。
4. 在适当的人体、动物、生物安全、双重用途、数据治理或监管关卡处停止。

绝不能：

- 将假设、机制、因果效应、引用或表面上的模式表述为既定证据；
- 因为快速搜索没有找到任何结果，就声称具有新颖性；
- 从关联、单独的时间先后关系、预测准确性或模型输出中推断因果关系；
- 提供针对特定患者的诊断、治疗、剂量、预后或其他临床建议；
- 为病原体、毒素、武器、规避行为或其他滥用提供有害的实验优化或操作细节；
- 绕过 IRB/REC、IACUC、IBC、生物安全、双重用途、隐私、法律或监管审查；
- 捏造来源、标识符、搜索覆盖范围、数据、结果、批准或预注册；
- 自动对科学假设进行评分、排序、选择、接受或拒绝。

如果请求越过安全关卡，只生成高层次的风险/监督说明，并将其转交给具备资质的当地主管部门。不要继续提供操作细节。

## 保持对象彼此区分

| 对象 | 含义 |
|---|---|
| **观察** | 已测量、注意到或报告的内容，包括来源和不确定性 |
| **研究问题** | 用于界定范围、且可以回答的问题 |
| **假设** | 候选的解释性或关系性命题 |
| **机制** | 连接条件与结果的拟议过程 |
| **因果估计量** | 要估计的、经过精确定义的因果对比 |
| **预测** | 在检查目标结果之前推导出的可观察含义 |
| **替代解释** | 竞争性的解释，包括偏倚或非因果解释 |
| **零假设** | 分析所使用的、明确规定的无效应/无差异模型 |
| **阴性对照** | 预期不会通过所提出机制发挥作用的对照 |
| **操作化** | 将一个构念转化为变量、测量、干预或类别的方式 |
| **分析计划** | 预先规定的变换、模型、对比、不确定性和决策规则 |
| **证据** | 与某项主张相关的观察或来源；绝不是主张本身 |

不要混淆这些标签。机制性叙述不是预测；预测不是证据；拒绝某个零假设并不能证明某种机制；支持某个候选解释也不能排除未被考虑的竞争性解释。

## 工作流

### 1. 运行范围与安全门控

记录：

- 负责的人类负责人和预期用途；
- 数据敏感性、授权、保留期限和允许的处理方式；
- 受影响的人、动物、生态系统、社区或安全利益；
- 所需的伦理、可行性、生物安全、双重用途和监管审查；
- 尚未解决的阻碍以及所需的领域专业知识。

脚本审批不等同于伦理、安全、监管或科学审批。

### 2. 固定观察结果

在进行解释之前写下观察结果：

- 测量或来源；
- 人群、系统、地点和时间；
- 观察单位和分析单位；
- 不确定性、缺失情况、排除项和预处理；
- 该模式是预期的、探索性的，还是在查看结果后选定的。

除非因果设计和估计目标能够提供依据，否则使用“报告了”“观察到”或“相关”，而不要使用因果性表述。

### 3. 构建研究问题

仅在适用时选择框架：

- **PICO/PICOT** 用于干预/有效性问题：人群、干预、对照、结局，以及可选的时间。
- **PECO** 用于暴露问题。
- **人群–指标检验–参考标准–目标状况** 用于诊断准确性。
- **人群–预后因素–结局–时间** 用于预后。
- 对于定性、描述性、机制性或理论性研究，使用特定领域的构念–情境–结局框架。

PICO 不是通用模板。明确利益相关者、情境、边界、可行性，以及什么样的答案会改变知识或实践。FINER 是一个问题细化助记词——可行（Feasible）、有趣（Interesting）、新颖（Novel）、合乎伦理（Ethical）、相关（Relevant）——而不是评分体系。在有记录、适合目的的检索和专家审查提供支持之前，应将“新颖”视为尚未解决的问题。

### 4. 建立有日期标记的证据边界

在作出依赖文献的陈述之前进行检索。优先使用原始研究、官方政策、原始方法论文、当前的报告指南，以及用于了解方向的系统综述。

记录：

- 检索日期和截止时间；
- 数据库/索引、查询、筛选条件和筛选边界；
- 纳入和排除的来源类型；
- 支持、质疑或为每项主张提供背景的来源；
- 已知的访问、语言、数据库和时间限制。

检索可以确定检索过什么，但不能证明普遍不存在。应说“在有记录的检索边界内未找到”，绝不要说“之前不存在相关工作”。使用 `assets/search_boundary_template.json`、`assets/evidence_ledger_template.csv` 和 `references/literature_search_strategies.md`。

### 5. 在选择检验之前生成竞争性解释

在合理的情况下，从真正不同的解释类别中生成多个候选项：

- 提出的机制；
- 测量或处理伪象；
- 混杂因素或共同原因；
- 选择或脱落；
- 对碰撞变量进行条件化；
- 反向因果；
- 时间、情境或边界条件差异；
- 随机变异；
- 另一尺度上的竞争性机制。

在 AI 辅助扩展之前，先独立生成一组初始竞争性解释，以减少锚定和同质化。不要强行设定固定数量，也不要制造虚假的对称性。保留每个候选项的 `candidate` 标签。

Platt 的强推断模式促使人们提出替代性假设和关键检验，但替代方案失败并不意味着剩下的假设就是真的。未知的替代方案、辅助假设、测量误差以及混合机制仍然可能存在。

### 6. 声明主张类型和估计目标

将每个目标分类为：

- 描述性；
- 关联性；
- 预测性；
- 因果性；
- 机制性。

对于因果目标，在分析前定义：

- 目标人群或系统；
- 干预/暴露及比较对象；
- 结局和时间范围；
- 群体层面的汇总指标；
- 在相关情况下，治疗版本和治疗期间事件的处理方式；
- 识别假设以及目标试验/设计类比。

分别记录混杂、选择、碰撞变量、测量和反向因果风险。观察性因果估计仍然依赖于假设。使用 `references/causal_inference_and_claims.md`。

### 7. 推导具有区分力的预测

对于每个候选假设：

1. 陈述条件和边界条件。
2. 指明可观测量及其测量方式。
3. 陈述预期模式和不确定性。
4. 在已声明的假设下，陈述与该候选假设不相容的结果。
5. 将预期结果至少与一个竞争假设进行对比。
6. 定义无法判定的结果，以及从中能够了解到什么。

优先选择竞争假设所预测的结果具有实质差异的检验。在科学上适当时，加入阳性、程序性和阴性对照。阴性对照必须无法通过目标机制发挥作用，同时共享相关的偏差路径；它不是一个装饰性的未处理组。

使用 `assets/prediction_rival_matrix_template.csv` 和 `assets/falsification_controls_template.json`。

### 8. 将测量操作化并进行验证

对于每个构念，记录：

- 变量角色和操作性定义；
- 人群/系统、单位、时间安排和条件；
- 仪器/方法、校准、质量控制和盲法；
- 可靠性/可重复性；
- 有效性证据及适用性；
- 缺失、检测限、变换、截点及其依据；
- 在相关情况下的测量不变性或跨组可比性；
- 可预见的测量偏差和局限性。

不要将一个便于使用的代理变量视为构念本身。使用以下命令进行验证：

```bash
python3 scripts/check_operationalization.py local-operationalization.json
```

### 9. 使设计和分析与主张相匹配

明确规定：

- 抽样、实验单位、分配、随机化、盲法和对照；
- 纳入/排除标准和停止规则；
- 基于已声明假设的样本量、精度或信息量依据；
- 结局、对比、估计目标、模型、效应度量和不确定性；
- 缺失数据和治疗期间事件的处理方式；
- 跨结局、模型、亚组、分析时点和假设的多重性；
- 假设、诊断、稳健性和敏感性分析；
- 重复或独立验证计划；
- 哪些内容属于确认性分析，哪些属于探索性分析。

不要使用普适性的样本量下限。不要将经过阈值处理的 p 值解释为某个假设为真的概率，也不要将其解释为效应的重要性。参见 `references/experimental_design_patterns.md`。

对于干预试验，在适用时使用当前的 SPIRIT 2025 方案指南和 CONSORT 2025 报告指南。这些指南可以提高完整性；但不能证明设计质量、伦理性或监管合规性。

### 10. 防止 HARKing 并揭示偏离

在接触目标结果之前，在可行的情况下，对问题、候选方案、预测、结果、排除项、转换、分析、多重性、缺失数据计划和停止规则进行时间戳记录。

之后：

- 将依赖数据产生的想法和分析标记为探索性；
- 保留并报告计划中的分析；
- 列出偏离，并注明日期、理由、决策者以及预期影响；
- 绝不要将观察到的模式改写为事前预测。

预注册是一项透明计划，并不禁止适应性调整。Registered Reports 在期刊政策框架下增加了结果盲审和原则性接收。参见 `references/preregistration_and_open_science.md`。

### 11. 规划复现与更新

区分：

- **可再现性（reproducibility）：** 使用相同的数据、代码和条件得到一致的计算结果；
- **可重复性（replicability）：** 针对同一问题，在收集新数据的不同研究之间保持一致。

在获得授权可以共享时，保留来源信息、版本、代码、材料和决策日志。规划在相关边界之间开展独立复现或迁移性测试。当出现相反证据、无效结果或复现证据时，更新候选方案的状态；不要隐藏负面结果。

### 12. 实施人工问责

负责问责的人必须核查：

- 每一条引用以及从来源到论断的链接；
- 领域合理性和测量有效性；
- 因果假设和统计设计；
- 伦理、可行性、安全、隐私和监管状态；
- 所有 AI 辅助生成的文本、想法和引用；
- 是否需要更广泛的专业知识或社区意见。

AI 可能会捏造引用、锚定推理并使候选方案集合趋同。记录获准使用的 AI 以及其产生的实质性影响。在流程中保留独立的人工作想和竞争性方案生成。

## 本地工具索引

所有 CLI 均有边界限制、无依赖、本地运行、确定性且不进行评分：

| 任务 | 资源 | 命令 |
|---|---|---|
| 假设记录模式 | `assets/hypothesis_record_template.json` | `python3 scripts/validate_hypothesis_schema.py record.json` |
| 测量检查清单 | `assets/operationalization_template.json` | `python3 scripts/check_operationalization.py checklist.json` |
| 预测/竞争性方案矩阵 | `assets/prediction_rival_matrix_template.csv` | `python3 scripts/validate_prediction_matrix.py matrix.csv` |
| 论断语言检查 | 带注释的 Markdown | `python3 scripts/lint_causal_claims.py draft.md` |
| 证伪/控制 | `assets/falsification_controls_template.json` | `python3 scripts/check_falsification_controls.py controls.json` |
| 证据/来源审计 | `assets/evidence_ledger_template.csv` + `assets/search_boundary_template.json` | `python3 scripts/audit_evidence_ledger.py ledger.csv boundary.json` |
| 预注册脚手架 | `assets/preregistration_scaffold_template.md` | `python3 scripts/generate_preregistration_scaffold.py record.json -o preregistration.md` |

退出代码：`0` 表示结构上有效的输出，`1` 表示验证已完成但存在错误，`2` 表示输入格式错误或不安全。报告仅验证声明和内部一致性；不验证科学事实，也不选择某个假设。完整 schema 见 `references/tool_reference.md`。

## 参考资料

- `references/concepts_and_workflow.md` — 对象模型、强推断、不确定性和候选项生命周期
- `references/hypothesis_quality_criteria.md` — 非评分式人工审查标准
- `references/literature_search_strategies.md` — 可追溯且有界限的证据检索
- `references/causal_inference_and_claims.md` — 估计量和因果偏差风险
- `references/experimental_design_patterns.md` — 设计、对照、测量、多重性和重复
- `references/preregistration_and_open_science.md` — 预注册、注册报告、偏离和开放科学
- `references/ethics_safety_and_ai.md` — 监督关卡、双重用途、数据处理和负责任的 AI
- `references/tool_reference.md` — CLI schema、限制和示例
- `references/source_ledger.md` — 注明日期的权威来源说明
- `references/security_validation.md` — 基线发现和验证记录

随附的来源台账为 `assets/source_ledger.csv`，已验证截至 **2026-07-23**。在更晚时间或特定司法管辖区使用前，请重新核查具有时效性的政策和指南。