---
name: alterlab-clinical-reports
description: Writes comprehensive clinical reports — case reports (CARE guidelines), diagnostic reports (radiology, pathology, lab), clinical trial reports (ICH-E3, SAE, CSR), and patient documentation (SOAP notes, H&P, discharge summaries) — with templates, regulatory compliance (HIPAA, FDA, ICH-GCP), and validation tools. Use when drafting a case report for journal publication, a radiology/pathology/lab diagnostic report, an ICH-E3 clinical study report (CSR) or SAE narrative, or SOAP/H&P/discharge patient records needing regulatory-compliant formatting. Part of the AlterLab Academic Skills suite.
allowed-tools: Read Write Edit Bash
license: MIT
compatibility: "Runs with Read/Write/Edit/Bash; producing PDF/report output requires a local LaTeX toolchain. No API key required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# 临床报告撰写

## 概述

以精确、准确且符合法规要求的方式记录医疗信息。
本技能涵盖四类报告：用于期刊发表的**病例报告**、
用于临床实践的**诊断报告**（放射学、病理学、实验室）、
用于监管申报的**临床试验报告**（SAE、CSR），以及用于医疗记录的**患者
文档**（SOAP、H&P、出院记录）。

**关键原则：临床报告必须准确、完整、客观，并遵守适用法规
（HIPAA、FDA、ICH-GCP）。** 患者隐私和数据完整性至关重要。

## 何时使用本技能

适用于：
- 撰写用于期刊投稿的临床病例报告（CARE 指南）
- 创建诊断报告（放射学、病理学、实验室）
- 记录临床试验数据、SAE 叙述或 CSR（ICH-E3）
- 撰写 SOAP 记录、H&P、出院小结或会诊记录
- 确保符合 HIPAA 要求并进行适当的去标识化
- 验证临床文档的完整性和准确性

## 核心工作流程

1. **选择报告类别**并加载其详细参考资料（见下方索引）。
2. 使用 `assets/` 中对应报告类型的模板**起草报告**。
3. **实施监管控制**——去标识化、记录知情同意并遵守时限。
4. 在签发前，使用对应的 `scripts/` 验证器进行**验证**。
5. 根据本文件末尾的核对清单执行**最终质量保证**。

### 1. 用于期刊发表的病例报告
遵循 CARE（CAse REport）核对清单：标题、关键词、结构化摘要、
引言、患者信息、临床发现、时间线、诊断评估、治疗干预、随访/结局、讨论、患者
观点和知情同意。注意期刊的特定限制（字数、
图表、参考文献格式），并在投稿前进行去标识化。
→ 各要素的详细说明、期刊要求以及 HIPAA 规定的 18 项标识符：
`references/care_report_sections.md`。概要核对清单：`references/case_report_guidelines.md`。

### 2. 诊断报告（放射学、病理学、实验室）
每种报告均采用标准化的章节结构（放射学：人口统计学信息 → 检查指征 → 技术 →
对比 → 所见 → 印象；病理学：大体检查/显微镜检查/诊断；
实验室：结果及参考范围与危急值报告）。
在适用情况下使用结构化报告模板（BI-RADS、Lung-RADS、CAP 突触式报告）。
→ 完整章节模板：`references/diagnostic_report_templates.md`。
标准和术语体系（ACR、CAP、LOINC）：`references/diagnostic_reports_standards.md`。

### 3. 临床试验报告（SAE、CSR、偏离）
SAE 报告记录严重不良事件，包括因果关系和预期性，并遵守
严格的监管时限（7/15 天）。CSR 遵循 ICH-E3 章节结构
进行监管申报。方案偏离按类别划分（轻微/重大/违规），
并附 CAPA 文档。
→ 各组成部分的结构：`references/clinical_trial_report_structures.md`。
监管框架（ICH-E3、CONSORT、时限）：`references/clinical_trial_reporting.md`。

### 4. 患者文档（SOAP、H&P、出院记录）
使用 SOAP 病历记录病情进展，使用 H&P 记录入院/初次就诊情况，使用出院小结
向门诊医疗服务提供者交接。使用标准缩写，签名并注明日期，
记录医疗必要性以供计费。
→ 格式结构：`references/patient_record_formats.md`。
编码和文档指导：`references/patient_documentation.md`。

## 法规合规与隐私

- **HIPAA**：仅披露最低必要信息；通过安全港方法（移除 18 类
  标识符）或专家认定进行去标识化；与第三方签订业务伙伴协议。
- **FDA**：21 CFR 第 11 部分（电子记录/签名）、第 50 部分（知情同意）、第 56 部分（IRB）、
  第 312 部分（IND）。
- **ICH-GCP**：遵循方案、记录知情同意、满足源文件要求、
  保留审计追踪、履行研究者职责。

> **⚠️ 注意——自动去标识化并不能保证合规。** 随附的 `scripts/check_deidentification.py` 是一种*纯正则表达式*扫描。模式匹配存在已知且严重的假阴性问题：它会漏掉非常规姓名拼写、自由文本日期、叙述性地址、罕见标识符，以及其固定模式之外的任何内容。它仅适合作为粗略的初步筛查工具——**不能**替代由具备资质的人员进行逐行人工审查，也**不是**经过验证的去标识化工具（例如 Microsoft Presidio、Philter 或经认证的专家认定）。通过此脚本并不能证明符合 HIPAA 安全港要求，绝不能将其作为隐私保障依据。在进行任何披露或发布之前，务必完成人工审查。

详细指导：`references/regulatory_compliance.md`。

## 医学术语与标准

使用标准化命名体系：**SNOMED CT**（临床术语）、**LOINC**（实验室/临床
观察）、**ICD-10-CM**（诊断编码）、**CPT**（操作编码）。遵守
美国联合委员会的“禁用”缩写列表（例如，写作“unit”而非“U”；始终在小数点前
添加零，绝不在小数点后添加无意义的零）。
完整标准：`references/medical_terminology.md`。

## 数据呈现

使用表格呈现人口统计学信息、不良事件、随时间变化的实验室检查值和疗效结局；
使用图形呈现 Kaplan-Meier 曲线、森林图、CONSORT 流程图和病例报告
时间线。图像必须为 ≥300 dpi，经过去标识化；对于可识别身份的
患者，必须获得其同意。详情：`references/data_presentation.md`。

## 质量保证

文档必须**完整、准确、及时、清晰且合规**。使用
各类型对应的验证清单（CARE、诊断完整性、SAE 法规
合规性、计费要求）以及 `scripts/` 验证器。

## 按报告类型划分的工作流程

- **病例报告**：确定病例 + 获得同意 → 文献综述 → 起草（CARE）→ 内部
  审核 → 期刊选择/投稿 → 修订。
- **诊断报告**：审查检查指征/既往资料 → 判读 → 口述结构化报告
  → 同行评审（复杂病例）→ 签发 → 危急值通知。STAT <1h，
  常规 24-48h。
- **SAE 报告**：识别 → 评估/记录 → 因果关系 + 预期性 → 审核 →
  提交给申办方/IRB/FDA → 随访直至事件解决（24h-15 天）。
- **CSR**：数据库锁定 → 按 SAP 分析 → 医学撰写人员起草 → 生物统计/临床
  审核 → QC → 批准/提交（研究完成后 6-12 个月）。

## 捆绑资源索引

### 参考资料（`references/`）
- `care_report_sections.md` — CARE 各要素说明、期刊要求、18 项 HIPAA 标识符
- `case_report_guidelines.md` — CARE 指南、期刊要求、写作技巧
- `diagnostic_report_templates.md` — 放射学/病理学/实验室报告章节模板
- `diagnostic_reports_standards.md` — ACR、CAP、实验室报告标准
- `clinical_trial_report_structures.md` — SAE/CSR/偏差报告的组成结构
- `clinical_trial_reporting.md` — ICH-E3、CONSORT、SAE 报告、CSR 结构
- `patient_record_formats.md` — SOAP/H&P/出院记录章节格式
- `patient_documentation.md` — SOAP、H&P、出院记录、编码
- `regulatory_compliance.md` — HIPAA、21 CFR Part 11、ICH-GCP、FDA
- `medical_terminology.md` — SNOMED、LOINC、ICD-10、缩写
- `data_presentation.md` — 表格、图形、安全性数据、CONSORT 流程图
- `peer_review_standards.md` — 临床论文的评审标准

### 模板资源（`assets/`）
`case_report_template.md`、`radiology_report_template.md`、`pathology_report_template.md`、
`lab_report_template.md`、`clinical_trial_sae_template.md`、`clinical_trial_csr_template.md`、
`soap_note_template.md`、`history_physical_template.md`、`discharge_summary_template.md`、
`consult_note_template.md`、`quality_checklist.md`、`hipaa_compliance_checklist.md`。

### 自动化脚本（`scripts/`）
`validate_case_report.py`、`validate_trial_report.py`、`check_deidentification.py`、
`format_adverse_events.py`、`generate_report_template.py`、`extract_clinical_data.py`、
`compliance_checker.py`、`terminology_validator.py`。

## 与其他 Skill 的集成

可与 scientific-writing（清晰的医学写作）、peer-review（质量评估）、
citation-mgmt（文献引用）、research-grants（方案制定）以及
literature-review（背景部分）配合使用。

## 常见问题

- **病例报告**：侵犯隐私、缺乏新颖性、细节不足、文献综述薄弱、
  根据单个病例进行过度概括。
- **诊断报告**：措辞含糊、对比不完整、缺少临床关联、
  危急值通知延迟。
- **试验报告**：SAE 报告延迟、因果关系信息不完整、数据不一致、
  未报告偏差、选择性报告。
- **患者文档**：复制沿用错误、细节不足影响计费、
  缺少医疗必要性说明、记录未签名/未注明日期。

## 最终检查清单

在最终确定任何临床报告之前，请核实：

- [ ] 所有必需章节均已完成
- [ ] 患者隐私已得到保护（符合 HIPAA 要求）
- [ ] 已获得知情同意（如适用）
- [ ] 临床数据准确且已经核实
- [ ] 使用了适当的医学术语和编码
- [ ] 语言清晰、专业
- [ ] 按照指南正确设置格式
- [ ] 参考文献引用恰当
- [ ] 图和表的标注正确
- [ ] 已进行拼写检查和校对
- [ ] 已满足监管要求
- [ ] 已遵循机构政策
- [ ] 签名和日期齐全
- [ ] 已完成质量保证审核

**最后提醒**：临床报告的质量直接影响患者安全、医疗服务和医学知识。始终将准确性、隐私保护和专业性置于首位。