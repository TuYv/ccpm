---
name: clinical-reports
description: Create safety-bounded draft structures and run local deterministic checks for clinical case, diagnostic, trial, safety, and aggregate research reports. Use only with synthetic, de-identified, or aggregate inputs and verified source-fact manifests; every output requires qualified review.
license: MIT
compatibility: Requires Python 3.11+ only for optional dependency-free local scripts; no network access, credentials, external models, or image services.
metadata:
  version: "2.0"
  skill-author: K-Dense Inc.
---
# 临床报告

## 目的

根据经核实且获得授权的事实，准备**报告结构草案**、汇总表和审查清单。将每项产物交由正确的报告指南处理，保留来源信息，并在缺少来源支持或合格审查时停止。

此技能不负责确立法律、监管、伦理、期刊、认证或机构合规要求。其脚本仅检查结构和内部一致性。

## 不可协商的边界

绝不：

- 进行诊断、推荐治疗、选择或更改剂量、分诊或提供返诊注意事项；
- 解读影像、标本、原始实验室结果、症状或其他临床观察；
- 编造、推断、规范化、“补全”或默默调和观察结果、结果、日期、单位、分母、因果关系、预期性、严重性、结局或结论；
- 根据患者层面的叙述创建个例安全性报告，或决定是否需要报告；
- 签署、证明、批准、归档、传输、提交、修改源记录，或以持证临床医生、病理学家、放射科医生、实验室人员、安全性医生、统计师、隐私官、律师或监管专业人员的身份行事；
- 在示例、资产、测试、提示词、日志或外部服务中使用真实 PHI；
- 调用外部 LLM、图像服务、API 或其他技能。

所有生成的产物都必须保持清晰标记：

> 草案 — 不得用于临床、签署、归档或提交。仅可根据经核实且获得授权的源记录填写。必须经过合格审查并签字确认。

如果请求越过边界，停止其中不安全的部分。提供空白结构化模板、源事实清单或确定性的结构检查。将直接的临床或监管决策交由负责的合格专业人员处理。

## 输入门槛

仅当所有条件均满足时才可继续：

1. **目的明确**：出版物草案、诊断报告框架、试验结果手稿、方案报告审查、CSR 草案、汇总安全性表或汇总研究摘要。
2. **数据类别获准**：`synthetic`、`deidentified` 或 `aggregate`。
3. **已记录授权**：请求者获授权将这些记录用于所述目的。
4. **可行本地处理**：不需要上传、远程 API、遥测或凭据。
5. **已定义最小必要范围**：排除产物不需要的字段。
6. **存在来源信息**：每个已填充字段或声明都可映射到一个或多个经核实的源事实 ID。
7. **已确定审查负责人**：根据适用情况，由合格的临床、统计、安全性、隐私、法律、期刊和/或监管人员进行审查。

当可以提供结构化源事实清单时，不要接受患者记录的原始自由文本。不要将直接标识符复制到此技能的模板或脚本中。

## 起草前进行路由分配

| 产物 | 主要路由 | 重要边界 |
|---|---|---|
| 用于发表的病例报告 | CARE 2013 checklist and 2017 explanation | 发表同意、隐私、期刊政策和临床准确性需要人工核实 |
| 放射学报告草案框架 | ACR 2025 communication practice parameter plus modality-specific ACR material | 合格的放射科医生负责撰写所见/印象，并处理非常规沟通 |
| 病理学报告草案框架 | Current specimen-specific CAP Cancer Protocol, if applicable | 合格的病理学家选择方案/版本并撰写诊断 |
| 实验室报告草案框架 | 42 CFR 493.1291 and laboratory policy | 执行实验室负责控制结果、参考区间、更正和发布 |
| 随机试验结果报告 | CONSORT 2025 plus every applicable current extension | CONSORT 是报告指南，而非实施或提交标准 |
| 随机试验方案报告 | SPIRIT 2025 plus applicable extensions | SPIRIT 用于方案，而非结果或 CSR |
| Clinical Study Report | ICH E3 plus E3 Q&A; consider ICH E6(R3) and regional requirements | E3 是可调整的指南，而非僵化的通用模板 |
| 批准前安全性报告 | ICH E2A; E2B(R3) for electronic ICSR data; applicable regional law/guidance | 合格的申办方/研究者安全性评估决定是否报告及报告时限 |
| 批准后个例安全性报告 | ICH E2D(R1), E2B(R3), and regional requirements | 不要自动化病例评估、编码或提交 |
| 汇总安全性呈现 | Protocol/SAP, ICH E3, CONSORT Harms, and applicable FDA/ICH guidance | 汇总表绝不会决定个例是否需要报告 |
| 汇总研究摘要 | Study-design-specific reporting guideline and source protocol/SAP | 必须严格按照已核实的信息说明研究人群、估计目标、分母、缺失情况和局限性 |

在选择路线之前，先阅读 `references/report_type_routing.md`。使用 `references/sources.md` 中按日期记录的主要来源账本；当要求可能已经发生变化时，检查实时的官方来源。

## 安全起草工作流程

### 1. 创建来源事实清单

使用 `assets/provenance_manifest_template.json`。只记录本地记录定位符、字段路径、核验状态、核验人员角色、核验日期和 SHA-256 值哈希。不要复制来源内容或直接标识符。

每一条起草声明或填充字段都必须引用一个或多个事实 ID。未经支持的内容保持为 `null` 或 `missing`；绝不要用看似合理的文本替代。

### 2. 生成正确的模板

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/generate_report_template.py --list
PYTHONDONTWRITEBYTECODE=1 python3 scripts/generate_report_template.py \
  --type case-report \
  --output ./case-report-draft.json
```

生成器会复制一个默认关闭（fail-closed）的 JSON 模板。它不会填充临床内容、创建目录、默认覆盖文件，也不会证明已准备就绪。

### 3. 仅填充已核验的字段

- 保持 `draft_status` 不变。
- 仅当已核验的事实 ID 支持某字段时，才将 `null` 替换为其他内容。
- 按记录原样保留不确定性和“未评估”。
- 不要将原始观察转换为诊断、代码、等级、分期、严重性、因果关系、预期性或建议。
- 仅当具备资质的审阅者提供了理由时，才使用 `not_applicable_with_rationale`。
- 保持来源记录与草稿分离。

### 4. 运行确定性检查

CARE 结构：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/validate_case_report.py \
  ./case-report-draft.json
```

ICH E3、CONSORT 2025 或 SPIRIT 2025 结构：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/validate_trial_report.py \
  ./trial-report-manifest.json
```

汇总不良事件表：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/format_adverse_events.py \
  ./aggregate-ae.csv --metadata ./safety-aggregate.json \
  --output ./aggregate-ae-table.md
```

术语模式：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/terminology_validator.py \
  ./terminology-manifest.json
```

去标识化流程文档：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/check_deidentification.py \
  ./deidentification-process.json
```

可追溯性与一致性：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/provenance_validator.py ./provenance.json
PYTHONDONTWRITEBYTECODE=1 python3 scripts/consistency_checker.py ./consistency.json
```

这些工具使用 Python 标准库、本地受限文件，并且不使用网络、动态求值、序列化代码执行或患者记录提取。即使结果成功，仍表示需要审阅。

### 5. 进行适当的审阅

至少包括：

- 临床事实和解读：由该专科的具备资质的临床医生审阅；
- 统计结果、群体、估计目标、分母和缺失性：由具备资质的统计师审阅；
- 安全性编码、严重性、因果关系、预期性和可报告性：由具备资质的安全专业人员审阅；
- HIPAA、同意、授权和披露：由隐私/法律/机构进行审阅；
- CSR 或监管安全性输出：由申办方监管和医学团队审阅；
- 发表：由所有负有责任的作者审阅，并完成目标期刊检查。

绝不要代表他人签署或提交。

## 病例报告

使用 `assets/case_report_template.json` 和 `references/case_report_guidelines.md`。

- CARE 当前的核心核查表仍为 2013 年核查表。
- 仅报告经核实记录支持的内容。
- 不要将病例转化为临床建议，也不要从单个病例推断普遍因果关系。
- 必须准确记录患者观点和知情同意状态；不要起草虚假的同意声明。
- 去标识化和同意是相互独立的控制措施。同意并不会消除隐私风险。

## 诊断报告框架

使用放射学、病理学或实验室 JSON 资产，以及 `references/diagnostic_reports_standards.md`。

- 这些资产是字段映射，而不是诊断撰写系统。
- 绝不要生成所见、印象、诊断、分级、分期、参考区间、危急阈值或随访建议。
- 保留初步/最终/更正状态以及源系统版本。
- 针对标本使用当前且准确的 CAP 协议和版本；不要维护通用的癌症分期默认值。
- 沟通和更正操作仍由负责的临床服务部门执行。

原有的 SOAP、H&P、会诊和出院摘要界面已被移除。不要重新创建患者照护记录、用药计划、分诊指示、计费支持或处置建议。

## 试验、CSR 和安全性报告

阅读 `references/clinical_trial_reporting.md` 和 `references/safety_reporting.md`。

- CONSORT 2025 对随机试验结果规定了 30 个最低项目；从当前官方目录中选择相关扩展。
- SPIRIT 2025 对随机试验方案规定了 34 个最低项目，并取代 SPIRIT 2013。
- ICH E3 仍是 CSR 的基础；其 2012 年 Q&A 明确允许经过论证的调整。
- ICH E6(R3) 合并后的 Principles、Annex 1 和 Annex 2 于 2026 年 6 月 16 日获采纳；各地区的实施可能有所不同。
- 区分严重性与严重程度，并区分不良事件与疑似不良反应。
- ICH E2B(R3) 定义了电子 ICSR 数据/消息结构；它不是汇总表格式，也不是可报告性判定规则。
- ICH E2D(R1) 于 2025 年 9 月 15 日获采纳，涉及批准后个例安全性报告；汇总性定期报告另行规定。
- FDA 的要求和电子提交途径取决于角色、产品、研究和日期。本技能绝不进行申报或传输。

## 隐私

阅读 `references/privacy_and_deidentification.md`。

- 在本地仅处理必要的最少数据。
- HHS 根据 45 CFR 164.514(b) 认可 Safe Harbor 和 Expert Determination。
- Safe Harbor 还要求不得实际知悉剩余信息能够识别某个人。
- Expert Determination 必须由具备适当资质的专家执行并记录。
- 核查表或模式扫描无法确立去标识化或 HIPAA 合规性。
- 罕见疾病、小单元格、日期、自由文本、图像、元数据以及准标识符的组合，仍可能保留重新识别风险。

## 资产

所有资产仅包含合成模式，并且初始状态均为阻止：

- `assets/case_report_template.json`
- `assets/radiology_report_template.json`
- `assets/pathology_report_template.json`
- `assets/lab_report_template.json`
- `assets/clinical_trial_csr_template.json`
- `assets/clinical_trial_results_template.json`
- `assets/trial_protocol_reporting_checklist.json`
- `assets/clinical_trial_safety_aggregate_template.json`
- `assets/adverse_event_aggregate_input_template.csv`
- `assets/research_summary_template.json`
- `assets/deidentification_process_checklist.json`
- `assets/quality_review_checklist.json`
- `assets/provenance_manifest_template.json`
- `assets/terminology_manifest_template.json`
- `assets/consistency_manifest_template.json`

## 参考资料

- `references/README.md` — 安全使用说明和文件映射
- `references/report_type_routing.md` — 工件到指导原则的路由
- `references/case_report_guidelines.md` — CARE 结构和发表保护措施
- `references/diagnostic_reports_standards.md` — ACR、CAP 和 CLIA 的边界
- `references/clinical_trial_reporting.md` — CONSORT 2025、SPIRIT 2025、ICH E3/E6(R3)
- `references/safety_reporting.md` — ICH E2/FDA 安全性区分
- `references/privacy_and_deidentification.md` — HHS 方法和局限性
- `references/medical_terminology.md` — 版本化术语和模式检查
- `references/data_presentation.md` — 分母、单位、缺失数据和汇总表
- `references/professional_review.md` — 伦理、责任和签署
- `references/sources.md` — 官方来源台账，核查日期为 2026-07-23

## 最终交接

说明：

1. 工件类型以及所使用的确切指导原则/版本；
2. 允许使用的数据类别以及仅限本地的处理方式；
3. 未解决的 `null`、`missing`、冲突和不受支持的声明；
4. 来源信息和确定性检查结果；
5. 所需的合格审阅人员；
6. 草稿/不得提交警告。

绝不要说“合规”“HIPAA 安全”“已完成临床验证”“已批准”“可以归档”或“可以提交”。