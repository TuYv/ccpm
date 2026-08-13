---
name: alterlab-treatment-plans
description: Generates concise (3-4 page), focused medical treatment plans in LaTeX/PDF format across all clinical specialties — general medical treatment, rehabilitation therapy, mental health care, chronic disease management, perioperative care, and pain management — using SMART goal frameworks, evidence-based interventions with minimal citations, HIPAA compliance, and professional formatting. Use when drafting a brief, actionable patient treatment or care plan with measurable SMART goals and structured follow-up for any specialty. Part of the AlterLab Academic Skills suite.
allowed-tools: Read Write Edit Bash
license: MIT
compatibility: "Runs with Read/Write/Edit/Bash; producing PDF output requires a local LaTeX toolchain (pdflatex/xelatex). No API key required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# 治疗计划撰写

## 概述

治疗计划撰写是对临床照护策略进行系统化记录的过程，旨在通过循证干预、可衡量的目标和结构化随访来处理患者的健康问题。此技能提供 LaTeX 模板和验证工具，用于为所有医学专科创建**简明、聚焦**且完全符合监管要求的治疗计划（标准篇幅为 3-4 页）。

**关键原则：**
1. **简明且可执行**：治疗计划默认最多 3-4 页（标准病例首选 1 页），仅关注会影响照护决策的临床必要信息
2. **以患者为中心**：计划必须以证据为基础、可衡量，并符合医疗保健法规（HIPAA、文档记录标准）
3. **最少引用**：仅在必要时使用简短的文内引用；避免冗长的参考文献列表（3-4 页的计划最多引用 0-3 篇文献）

每份治疗计划都应包含明确的目标、具体的干预措施、确定的时间安排、监测参数以及符合患者偏好和当前临床指南的预期结果，并尽可能高效地呈现所有内容。

## 何时使用此技能

在以下情况下使用此技能：
- 为患者照护创建个体化治疗计划
- 记录慢性病管理的治疗干预措施
- 制定康复方案（物理治疗、作业治疗、心脏康复）
- 撰写心理健康和精神科治疗计划
- 规划围手术期和外科照护路径
- 制定疼痛管理方案
- 使用 SMART 标准设定以患者为中心的目标
- 协调跨专科的多学科照护
- 确保治疗文档符合监管要求

## 核心工作流程

1. **选择格式和篇幅。** 默认使用 1 页的快速参考卡；仅在病例复杂性需要时，才扩展为 3-4 页的标准格式（首页摘要 + 详细内容）。请参阅 `references/document_formats.md`。
2. **编写必需的首页执行摘要。** 标题 + 报告信息框 + 2-4 个彩色关键发现框（目标、干预措施、决策点）。此页面通常可以独立使用。完整规范和 LaTeX 框架请参阅 `references/document_formats.md`。
3. **从 `assets/` 中选择专科模板**，并填写其组成部分。各专科（普通医疗、康复、心理健康、慢性病、围手术期、疼痛）的组成部分检查清单位于 `references/specialty_components.md`。
4. **编写 SMART 目标**（具体、可衡量、可实现、相关且有时限），涵盖短期和长期时间范围。
5. **使用 `medical_treatment_plan.sty` 包应用专业样式**——请参阅 `references/latex_styling.md`。
6. **验证，然后生成 PDF。** 运行完整性和质量检查，对照质量检查清单，然后进行编译。请参阅 `references/templates_and_validation.md`。

## 六类专科计划

| # | 类型 | 模板（`assets/`） | 适用场景 |
|---|------|----------------------|---------|
| 1 | 普通医疗 | `general_medical_treatment_plan.tex` | 慢性病、急性内科疾病、初级保健 |
| 2 | 康复 | `rehabilitation_treatment_plan.tex` | 物理治疗/作业治疗/言语语言病理服务、术后康复、损伤恢复 |
| 3 | 心理健康 | `mental_health_treatment_plan.tex` | 精神疾病、行为健康 |
| 4 | 慢性病 | `chronic_disease_management_plan.tex` | 复杂多病共存的长期照护 |
| 5 | 围手术期 | `perioperative_care_plan.tex` | 外科手术/操作的术前、术中及术后照护 |
| 6 | 疼痛管理 | `pain_management_plan.tex` | 急性/慢性疼痛、减少阿片类药物使用的多模式治疗 |

各专科所需组成部分的详细说明（评估、目标、干预、监测、教育、风险缓解）记录在 **[`references/specialty_components.md`](references/specialty_components.md)** 中。

## 快速生成

```bash
# Interactive template selection
python scripts/generate_template.py

# Or specify type directly. Default to one_page (the preferred quick-reference
# format) for most cases; pick a specialty template when complexity demands it.
python scripts/generate_template.py --type one_page --output diabetes_plan.tex
python scripts/generate_template.py --type mental_health --output depression_treatment_plan.tex

# Type choices: one_page, general_medical, rehabilitation, mental_health,
#               chronic_disease, perioperative, pain_management

# Validate, then compile
python scripts/check_completeness.py plan.tex
python scripts/validate_treatment_plan.py plan.tex
pdflatex plan.tex
```

## 专业文档样式

可以使用 `medical_treatment_plan.sty` LaTeX 软件包（位于 `assets/` 中）为治疗计划增添专业的医疗文档样式。该软件包提供采用颜色编码的临床文档外观、自定义方框环境（`infobox`、`warningbox`、`goalbox`、`keybox`、`emergencybox`、`patientinfo`），以及具有特定样式的医疗表格。

有关完整的样式指南——包括配色方案、每种方框环境及其示例、表格格式、编译（XeLaTeX/PDFLaTeX）、自定义、安装、故障排除，以及完整的样式化文档示例——请参阅 **[`references/latex_styling.md`](references/latex_styling.md)**。

## 参考资料索引

| 文件 | 内容 |
| ---- | -------- |
| [`references/document_formats.md`](references/document_formats.md) | 篇幅选项（1 页 / 3–4 页 / 5–6 页）、Foundation-Medicine 首页摘要模型及 LaTeX 框架、简明文档规则、引用指南、完整最佳实践（简洁性、SMART、以患者为中心、合规性、协调） |
| [`references/specialty_components.md`](references/specialty_components.md) | 所有六种专科计划类型的完整必需组成部分核对清单 |
| [`references/worked_examples.md`](references/worked_examples.md) | 五个端到端场景（糖尿病、卒中后康复、MDD、TKA、慢性腰痛），包含模板、目标和干预措施 |
| [`references/templates_and_validation.md`](references/templates_and_validation.md) | 模板选择/结构、PDF 生成、完整性与质量验证脚本、质量核对清单、时间线生成、专业标准、跨 Skill 集成 |
| [`references/latex_styling.md`](references/latex_styling.md) | 样式软件包指南：颜色、方框环境、表格、编译、故障排除 |
| [`references/goal_setting_frameworks.md`](references/goal_setting_frameworks.md) | SMART 及相关目标设定框架 |
| [`references/intervention_guidelines.md`](references/intervention_guidelines.md) | 循证干预指南 |
| [`references/regulatory_compliance.md`](references/regulatory_compliance.md) | HIPAA 和文档合规性详细说明 |
| [`references/specialty_specific_guidelines.md`](references/specialty_specific_guidelines.md) | 专科协会指南参考资料 |
| [`references/treatment_plan_standards.md`](references/treatment_plan_standards.md) | 治疗计划文档标准 |

## 伦理考量

- **知情同意**：所有计划都应确保患者理解拟议的干预措施并自愿同意。
- **文化敏感性**：尊重不同的文化信仰、健康实践和沟通方式。
- **健康公平**：考虑健康的社会决定因素、医疗服务获取障碍和差异。
- **隐私保护**：严格遵守 HIPAA；对共享文档中的所有受保护健康信息进行去标识化处理。
- **自主与行善**：在促进患者福祉的同时，平衡医疗建议与患者的自主权和价值观。

## 许可证

Claude Scientific Writer 项目的一部分。请参阅主 LICENSE 文件。