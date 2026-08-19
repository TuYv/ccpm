---
name: clinical-decision-support
description: Prepare and validate research-only clinical decision-support evaluation, evidence-profile, cohort, survival, biomarker/model, privacy, and governance artifacts. Use for aggregate or synthetic research documentation and traceability—not patient care or live clinical operation.
license: MIT
compatibility: Python 3.11+; local files only; bundled scripts use the standard library and require no network, credentials, API keys, LLMs, or image services.
metadata:
  version: "2.1"
  skill-author: K-Dense Inc.
---
# 临床决策支持研究与评估

## 严格安全边界

此技能仅生成**研究、评估、文档和治理工件**。

绝不得将其用于：

- 对个人进行诊断或分类；
- 推荐、选择、排序、开始、停止或修改治疗；
- 计算或传达患者特异性剂量；
- 分诊、确定优先级、发出警报、提醒或判定紧急程度；
- 作出或自动化患者特异性临床决策；
- 支持床旁、即时诊疗或实时临床操作；
- 替代专业判断或经过验证且获得授权的临床系统；
- 声称获得 FDA 授权、符合监管要求、符合 HIPAA 要求或符合法律要求。

如果某项请求可能影响对个人的医疗照护，请停止工作流程，并使用经过本地验证且获得适当授权的系统，将该事项转交给持证医疗专业人员。不得将患者特异性照护重定向至其他技能。

## 范围内

- 研究工件的预期用途和限制说明
- 带有披露控制的汇总队列表格框架
- 统计分析计划和生存分析计划审查
- 汇总模型或生物标志物性能评估
- 透明的 GRADE 证据概况核对清单
- 证据来源和决策逻辑可追溯性
- 去标识化流程核对清单
- 公平性、亚组、校准、不确定性、外部验证、监测、变更控制、审计和人为因素文档

在合格人员批准之前，输出始终为草案。报告指导可提升透明度；但不会确立研究质量、临床效用、安全性、有效性、授权状态或合规性。

## 数据门控

在运行任何脚本之前：

1. 确认输入为合成数据或汇总数据。
2. 拒绝患者行、记录、叙述、标识符、自由文本、与个人相关的日期、图像、波形或基因组序列。
3. 将源文件保留在本地。不得获取 URL、调用 API、读取环境变量或将数据发送给模型。
4. 在生成表格之前设置披露阈值。
5. 记录来源、数据截点日期、人群、排除条件、缺失情况和转换操作。

这些脚本会限制文件大小、组数、行数和文本长度。它们会拒绝类似 URL 的路径和常见的行级键。这些控制措施可减少意外误用；它们并非隐私认定。

## 必需的工件页眉

每个工件都必须以可见方式包含：

- `artifact_type`、标题、版本、状态、负责人、日期和变更摘要；
- 预期目的、预期用户、汇总人群范围和决策角色；
- 严格边界中的所有禁止用途；
- 数据级别，以及未提供 PHI 或原始行的确认；
- 局限性、不确定性和可预见的失效模式；
- 外部验证和亚组适用性状态；
- 人工审查角色、完成状态和批准边界；
- 带版本或日期的来源引用；
- 监测、变更控制、退役和审计预期；
- 以下声明：**不得用于患者照护或实时临床使用。**

从 `assets/artifact_intended_use_template.json` 开始。

## 工作流

### 1. 明确研究问题

- 在查看结果之前定义估计目标或评估目标。
- 区分描述性、预后性、预测性、诊断准确性和因果性问题。
- 预先规定结局、时间起点、时间范围、亚组、分界点、缺失数据处理、多重性以及敏感性分析。
- 将探索性发现与验证性分析分开。

### 2. 选择构件

| 需求 | 资产 | 脚本 |
|---|---|---|
| 预期用途/治理审查 | `assets/artifact_intended_use_template.json` | `scripts/validate_cds_artifact.py` |
| GRADE 证据概况 | `assets/evidence_profile_template.json` | `scripts/evidence_profile_check.py` |
| 汇总模型/生物标志物评估 | `assets/aggregate_model_evaluation_template.json` | `scripts/model_biomarker_evaluation.py` |
| 汇总队列表格 | `assets/aggregate_cohort_table_template.json` | `scripts/cohort_table_generator.py` |
| 生存分析计划 | `assets/survival_analysis_plan_template.json` | `scripts/survival_plan_validator.py` |
| 逻辑可追溯性矩阵 | `assets/decision_logic_traceability_template.json` | `scripts/decision_logic_traceability.py` |
| 去标识化流程审查 | `assets/deidentification_checklist_template.json` | `scripts/deidentification_checklist.py` |

### 3. 在本地运行

所有辅助工具均无依赖：

```bash
python3 scripts/validate_cds_artifact.py --help
python3 scripts/evidence_profile_check.py --help
python3 scripts/model_biomarker_evaluation.py --help
python3 scripts/cohort_table_generator.py --help
python3 scripts/survival_plan_validator.py --help
python3 scripts/decision_logic_traceability.py --help
python3 scripts/deidentification_checklist.py --help
```

仅将输出写入经过审查的本地目录。绝不要将生成的报告放入 EHR、警报系统、临床门户或设备工作流中。

### 4. 人工审查

根据构件的性质，要求相应程度的审查：

- 方法学家/统计学家负责设计和分析；
- 领域专家负责临床科学背景；
- 隐私官或具备资质的专家负责披露决策；
- 监管或法律顾问负责特定司法辖区的解释；
- 人因专家负责用户研究；
- 经授权的治理负责人负责发布和变更控制。

脚本运行成功仅表示声明的字段和内部一致性检查已通过。

## GRADE 证据概况

不要根据文章文本、单独的研究设计、p 值或关键词推断确定性评级。不要将旧版 `1A/2B` 简写视为通用的 GRADE 输出。

对于每个重要结局，人工评审小组必须记录：

- 偏倚风险；
- 不一致性；
- 间接性；
- 不精确性；
- 发表偏倚；
- 任何适用的升级考虑因素；
- 效应估计值及不确定性；
- 每项判断的理由和来源 ID；
- 最终确定性判断和指定的审查角色。

检查器仅验证完整性和引用链接。它不会计算证据确定性或推荐强度。参见 `references/evidence_profiles.md`。

## 汇总模型和生物标志物评估

不得推导阈值、分配分子或疾病类别、匹配疗法，或输出个体层面的预测。

评估器仅接受汇总混淆计数和校准分箱。它报告带 Wilson 区间的有界描述性指标、校准差距、亚组差异和明确的抑制处理。它不判定公平性、临床效用或适用性。要求：

- 已锁定的模型/检测/版本以及预先指定的阈值来源；
- 具有代表性的内部验证和独立的外部验证；
- 适合目标用途的校准和区分能力；
- 包含不确定性和样本量的亚组表现；
- 缺失性、谱系/选择偏倚、数据集漂移和检测变异性；
- 在相关情况下开展人为因素和前瞻性评估；
- 监测、变更控制、回滚和退役标准。

参见 `references/model_biomarker_evaluation.md`。

## 队列表

仅使用汇总单元格。不得向生成器提供行级数据。

- 根据经批准的披露政策选择最小单元格阈值。
- 应用主要抑制和互补抑制。
- 报告分母和缺失性。
- 避免将基线显著性检验作为平衡诊断。
- 标注经调整、未调整、预先指定和探索性结果。
- 不得将关联解释为因果关系或临床可操作性。

默认阈值是一项操作性保障措施，并非 HIPAA 规则或保证。参见 `references/cohort_evaluation.md` 和 `references/privacy_and_disclosure.md`。

## 生存分析计划

共同定义时间零点、事件、竞争事件、删失、事件间事件、估计目标、时间范围、效应度量和分析人群。

- 在将风险比视为恒定之前，评估比例风险假设。
- 预先指定替代方案，例如时变效应或限制平均生存时间。
- 当竞争事件重要时，使用累积发生率方法。
- 处理不死时间、信息性删失、延迟入组、缺失数据和多重性风险。
- 纳入敏感性分析和不确定性，而不仅仅是 p 值。

捆绑的辅助工具会验证计划；它不会分析生存数据。参见 `references/survival_analysis.md`。

## 决策逻辑

仅记录研究或治理逻辑，例如证据纳入、验证关卡、发布搁置和人工审核检查点。每个节点必须链接到源 ID、测试、负责人、版本和状态。

不得编码诊疗路径、紧急程度、用药操作、诊断规则、警报或面向患者的输出。参见 `references/decision_logic_traceability.md`。

## 隐私和去标识化

HHS 方法包括专家判定和安全港。仅靠检查清单本身无法执行其中任一种方法。不得声称删除字段列表、对标识符进行哈希处理、采用最小单元格大小或通过此脚本，即可证明去标识化或 HIPAA 合规性。

辅助工具会清点已记录的人工工作。它绝不会读取数据集。将未解决事项、自由文本、日期、地理信息、罕见组合、链接风险、基因组学和纵向模式升级至具备资质的隐私审查。

## 报告指南选择

- 队列/病例对照/横断面研究：STROBE；对于常规收集的数据，增加 RECORD。
- 预测模型开发/评估：TRIPOD+AI 和 PROBAST+AI。
- 肿瘤预后标志物研究：REMARK。
- AI 诊断准确性：STARD-AI 与 STARD。
- AI 试验方案：SPIRIT-AI 与当前 SPIRIT 基础声明。
- AI 随机试验报告：CONSORT-AI 与当前 CONSORT 基础声明。
- 早期真实环境 AI 评估：DECIDE-AI——但真实环境评估不在本技能的执行范围内。

这些是报告或评价工具，而非自动质量评分。参见 `references/study_reporting.md`。

## 监管与治理背景

FDA 医疗器械状态取决于预期用途和功能，而非文档标签。FDA 2026 年 1 月的 CDS 指南区分了某些非器械 CDS 功能与器械软件功能；其中的示例并非自我认证核对清单。ONC HTI-1 要求适用于所定义的认证范围内。ICH E6(R3) 和 E9/E9(R1) 为试验治理和统计规划提供参考，但并不使某项产物自动合规。

使用 `references/regulatory_and_governance.md` 获取有日期标注的背景信息。对于实际产品、研究、申报、部署或司法辖区，请获取合格的专业建议。

## 验证

从此技能目录中：

```bash
python3 -m unittest discover -s tests/clinical-decision-support -p 'test_*.py'
```

在不生成字节码的情况下运行 AST 编译：

```bash
python3 -c "import ast,pathlib; [ast.parse(p.read_text()) for p in pathlib.Path('scripts').glob('*.py')]"
```

## 参考资料映射

- `references/README.md` — 范围与导航
- `references/safety_and_scope.md` — 拒绝与升级规则
- `references/regulatory_and_governance.md` — FDA、ONC、ICH 背景
- `references/evidence_profiles.md` — 人工 GRADE 工作流程
- `references/study_reporting.md` — EQUATOR 和 PROBAST+AI 选择
- `references/cohort_evaluation.md` — 汇总队列方法
- `references/survival_analysis.md` — 生存时间分析规划
- `references/model_biomarker_evaluation.md` — 模型/生物标志物评估
- `references/privacy_and_disclosure.md` — 去标识化与抑制
- `references/decision_logic_traceability.md` — 治理逻辑
- `references/sources.md` — 标注日期的权威来源台账
- `references/security_validation.md` — 扫描结果与已接受的 LOW 发现