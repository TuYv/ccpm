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

根据经核实且已获授权的事实，准备**报告草稿结构**、汇总表格和审查清单。将每项产物路由至正确的报告指导，保留溯源信息，并在缺少来源支持或合格审查时停止。

此技能不确立法律、监管、伦理、期刊、认证或机构合规性。其脚本仅检查结构和内部一致性。

## 不可协商的边界

绝不：

- 进行诊断、推荐治疗、选择或更改剂量、分诊，或提供返诊注意事项；
- 解读图像、标本、原始实验室结果、症状或其他临床观察；
- 编造、推断、规范化、“补全”或默默协调观察结果、结果、日期、单位、分母、因果关系、预期性、严重性、结局或结论；
- 根据患者级别叙述创建个例安全性报告，或决定可报告性；
- 签署、证明、批准、归档、传送、提交、修订源记录，或充当持证临床医生、病理学家、放射科医师、实验室专业人员、安全性医师、统计学家、隐私官、律师或监管专业人员；
- 在示例、资产、测试、提示词、日志或外部服务中使用真实 PHI；
- 调用外部 LLM、图像服务、API 或其他技能。

所有生成的产物必须始终带有清晰可见的标记：

> 草稿 — 不得用于临床使用、签署、归档或提交。仅可根据经核实且已获授权的源记录填写。必须经过合格审查和签核。

如果请求越过边界，则停止不安全的部分。提供空白结构化模板、源事实清单或确定性的结构检查。将直接的临床或监管决策交由负责的合格专业人员处理。

## 输入门槛

仅当所有条件均为真时才继续：

1. **目的明确**：发表草稿、诊断报告框架、试验结果稿件、方案报告审查、CSR 草稿、汇总安全性表格或汇总研究摘要。
2. **数据类别允许**：`synthetic`、`deidentified` 或 `aggregate`。
3. **授权已记录**：请求者获授权可将记录用于所述目的。
4. **可行的仅本地处理**：不需要上传、远程 API、遥测或凭据。
5. **最小必要范围已定义**：排除产物不需要的字段。
6. **溯源信息存在**：每个已填写字段或声明均映射至一个或多个经核实的源事实 ID。
7. **审查负责人已确定**：视情况进行合格的临床、统计、安全性、隐私、法律、期刊和/或监管审查。

在可提供结构化源事实清单时，不要接受原始自由文本患者记录。不要将直接标识符复制到此技能的模板或脚本中。

## 起草前路由

| 产物 | 主要路由 | 重要边界 |
|---|---|---|
| 用于发表的病例报告 | CARE 2013 核对清单和 2017 说明 | 发表同意、隐私、期刊政策和临床准确性需要人工核实 |
| 放射学草稿框架 | ACR 2025 沟通实践参数，加上特定影像模态的 ACR 材料 | 合格的放射科医师撰写所见/印象并处理非常规沟通 |
| 病理学草稿框架 | 当前标本特异性 CAP Cancer Protocol（如适用） | 合格的病理学家选择方案/版本并撰写诊断 |
| 实验室草稿框架 | 42 CFR 493.1291 和实验室政策 | 执行检测的实验室控制结果、参考区间、更正和发布 |
| 随机试验结果报告 | CONSORT 2025 加上每一项适用的现行扩展 | CONSORT 是报告指导，而非实施或提交标准 |
| 随机试验方案报告 | SPIRIT 2025 加上适用扩展 | SPIRIT 用于方案，而非结果或 CSR |
| 临床研究报告 | ICH E3 加 E3 问答；考虑 ICH E6(R3) 和地区要求 | E3 是可调整的指导，而非严格的通用模板 |
| 批准前安全性报告 | ICH E2A；电子 ICSR 数据采用 E2B(R3)；适用的地区法律/指导 | 合格的申办方/研究者安全性评估控制可报告性和时限 |
| 批准后个例安全性报告 | ICH E2D(R1)、E2B(R3) 和地区要求 | 不要自动化病例评估、编码或提交 |
| 汇总安全性呈现 | 方案/SAP、ICH E3、CONSORT Harms 和适用的 FDA/ICH 指导 | 汇总表格绝不决定个例可报告性 |
| 汇总研究摘要 | 研究设计特异性报告指南及源方案/SAP | 严格按经核实的信息说明人群、估计目标、分母、缺失情况和局限性 |

在选择路线之前，请阅读 `references/report_type_routing.md`。使用 `references/sources.md` 中带日期的主要来源台账；当要求可能已发生变化时，请查阅实时官方来源。

## 安全起草工作流程

### 1. 创建来源事实清单

使用 `assets/provenance_manifest_template.json`。仅记录本地记录定位符、字段路径、验证状态、验证者角色、验证日期和 SHA-256 值哈希。不得复制来源内容或直接标识符。

每项草稿声明或已填充字段都必须引用一个或多个事实 ID。未经支持的内容应保持为 `null` 或 `missing`；绝不得用看似合理的文本替代。

### 2. 生成正确的模板

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/generate_report_template.py --list
PYTHONDONTWRITEBYTECODE=1 python3 scripts/generate_report_template.py \
  --type case-report \
  --output ./case-report-draft.json
```

生成器会复制一个故障关闭的 JSON 模板。它不会填充临床内容、创建目录、默认覆盖文件，或证明已具备就绪条件。

### 3. 仅填充已验证的字段

- 保持 `draft_status` 不变。
- 仅当经验证的事实 ID 支持该字段时，才替换 `null`。
- 完全按记录保留不确定性和“未评估”。
- 不得将原始观察结果转化为诊断、代码、分级、分期、严重性、因果关系、预期性或建议。
- 仅当合格审阅者提供理由时，才使用 `not_applicable_with_rationale`。
- 将来源记录与草稿分开保存。

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

可追溯性和一致性：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/provenance_validator.py ./provenance.json
PYTHONDONTWRITEBYTECODE=1 python3 scripts/consistency_checker.py ./consistency.json
```

这些工具使用 Python 标准库、受限的本地文件，并且不使用网络、动态求值、序列化代码执行或患者记录提取。成功结果仍表示需要审阅。

### 5. 实施适当的审阅

最低要求：

- 临床事实和解读：由相应专科的合格临床医生审阅；
- 统计结果、人群、估计目标、分母和缺失情况：由合格统计学家审阅；
- 安全性编码、严重性、因果关系、预期性和可报告性：由合格安全性专业人员审阅；
- HIPAA、同意、授权和披露：由隐私/法律/机构审阅；
- CSR 或监管安全性输出：由申办方监管和医学团队审阅；
- 发表：由所有负责作者审阅，并进行目标期刊检查。

绝不代表他人签署或提交。

## 病例报告

使用 `assets/case_report_template.json` 和 `references/case_report_guidelines.md`。

- CARE 当前的核心清单仍为 2013 年版清单。
- 仅报告经核实记录所支持的内容。
- 不要将病例转化为临床建议，也不要从单个病例泛化因果关系。
- 必须准确记录患者视角和知情同意状态；不得起草虚假的同意声明。
- 去标识化和同意是相互独立的控制措施。同意并不会消除隐私风险。

## 诊断报告脚手架

使用放射学、病理学或实验室 JSON 资产以及 `references/diagnostic_reports_standards.md`。

- 这些资产是字段映射，而不是诊断报告创作系统。
- 绝不生成所见、印象、诊断、分级、分期、参考区间、危急阈值或随访建议。
- 保留初步/最终/更正状态和源系统版本。
- 对于标本，请使用当前、准确的 CAP 方案及版本；不要维护通用的癌症分期默认值。
- 沟通和更正操作仍由负责的临床服务机构处理。

原有的 SOAP、H&P、会诊和出院小结界面已被移除。不要重新创建患者照护记录、用药计划、分诊指示、计费支持或处置建议。

## 试验、CSR 和安全性报告

阅读 `references/clinical_trial_reporting.md` 和 `references/safety_reporting.md`。

- CONSORT 2025 对随机试验结果规定了 30 个最低要求项目；请从当前官方目录中选择相关扩展。
- SPIRIT 2025 对随机试验方案规定了 34 个最低要求项目，并取代 SPIRIT 2013。
- ICH E3 仍是 CSR 的基础；其 2012 年问答明确允许有合理依据的调整。
- ICH E6(R3) 整合后的原则、附件 1 和附件 2 于 2026 年 6 月 16 日获采纳；区域实施可能有所不同。
- 区分严重性与严重程度，以及不良事件与疑似不良反应。
- ICH E2B(R3) 定义了电子 ICSR 数据/消息结构；它不是汇总表格式，也不是可报告性判定规则。
- ICH E2D(R1) 于 2025 年 9 月 15 日获采纳，涉及上市后个例安全性报告；汇总定期报告另行规定。
- FDA 要求和电子提交路径因角色、产品、研究和日期而异。本技能绝不进行申报或传输。

## 隐私

阅读 `references/privacy_and_deidentification.md`。

- 仅在本地处理最低必要数据。
- HHS 根据 45 CFR 164.514(b) 认可安全港和专家判定。
- 安全港还要求不存在任何实际知情，即剩余信息能够识别某个个体。
- 专家判定必须由具备适当资格的专家执行并记录。
- 清单或模式扫描无法确立去标识化或 HIPAA 合规性。
- 罕见病、小样本单元、日期、自由文本、图像、元数据以及准标识符的组合，均可能保留重新识别风险。

## 资产

所有资产仅包含合成架构，并且初始状态均为已阻止：

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

- `references/README.md` — 安全使用和文件映射
- `references/report_type_routing.md` — 工件到指南的路由
- `references/case_report_guidelines.md` — CARE 结构和发表保障措施
- `references/diagnostic_reports_standards.md` — ACR、CAP 和 CLIA 的边界
- `references/clinical_trial_reporting.md` — CONSORT 2025、SPIRIT 2025、ICH E3/E6(R3)
- `references/safety_reporting.md` — ICH E2/FDA 安全性区分
- `references/privacy_and_deidentification.md` — HHS 方法及其局限性
- `references/medical_terminology.md` — 版本化术语和架构检查
- `references/data_presentation.md` — 分母、单位、缺失情况和汇总表
- `references/professional_review.md` — 伦理、问责和签核
- `references/sources.md` — 官方来源台账，检查日期为 2026-07-23

## 最终交接

说明：

1. 工件类型以及所使用的确切指南/版本；
2. 允许的数据类别和仅限本地处理；
3. 未解决的 `null`、缺失值、冲突和无支持的声明；
4. 溯源和确定性检查结果；
5. 所需的合格审阅人员；
6. 草稿/不得提交警告。

绝不可称其为“合规”、“符合 HIPAA 安全要求”、“经临床验证”、“已批准”、“可归档”或“可提交”。