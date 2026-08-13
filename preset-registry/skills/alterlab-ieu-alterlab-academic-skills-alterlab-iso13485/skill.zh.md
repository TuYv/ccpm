---
name: alterlab-iso13485
description: Prepares ISO 13485 certification documentation for medical device Quality Management Systems (QMS) — gap analysis of existing documentation, Quality Manuals, required procedures and work instructions, and Medical Device Files. Use for ISO 13485 QMS documentation, conducting a documentation gap analysis, drafting a Quality Manual or SOP/work instruction, assembling a Medical Device File, identifying missing documentation for medical device certification, or when medical device regulations, QMS certification, FDA QMSR, or EU MDR are mentioned. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*)
compatibility: "Self-contained — runs with Read/Write/Edit/Bash(python:*); no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# ISO 13485 认证文档助手

## 概述

此技能帮助医疗器械制造商准备全面的 ISO 13485:2016 认证文档。它提供用于创建、审查和差距分析所有必需质量管理体系（QMS）文档的工具、模板、参考资料和指导。

**此技能提供的内容：**
- 现有文档的差距分析
- 所有强制性文档的模板
- 全面的要求指导
- 分步骤的文档创建指导
- 识别缺失的文档
- 合规性检查表

**何时使用此技能：**
- 启动 ISO 13485 认证流程
- 对照 ISO 13485 进行差距分析
- 创建或更新 QMS 文档
- 准备认证审核
- 从 FDA QSR 过渡到 QMSR
- 与欧盟 MDR 要求协调一致

## 核心工作流程

### 1. 评估当前状态（差距分析）

**何时从此处开始：** 用户已有现有文档，需要识别差距

**流程：**

1. **收集现有文档：**
   - 请用户提供当前 QMS 文档所在的目录
   - 文档可以采用任何格式（.txt、.md、.doc、.docx、.pdf）
   - 包括所有程序、手册、作业指导书和表单

2. **运行差距分析脚本：**
   ```bash
   python scripts/gap_analyzer.py --docs-dir <path_to_docs> --output gap-report.json
   ```

3. **审查结果：**
   - 确定哪些必需程序已存在，哪些缺失。该脚本检查 26 项始终适用的成文程序（为避免出现假阴性的差距，它省略了有条件的“适用时”程序——设计、安装、维修、灭菌等）；按照惯例，完整集合称为“31”项。有关完整列表和计数说明，请参阅 `references/quick-reference.md`。
   - 识别缺失的关键文档（质量手册、MDF 等）
   - 计算合规百分比（以脚本跟踪的 26 项程序为基准进行报告）
   - 确定缺失文档的优先级，包括适用于该制造商的所有有条件程序

4. **向用户展示结果：**
   - 总结已有内容
   - 清晰列出缺失内容
   - 提供按优先级排序的行动计划
   - 估算所需工作量

**输出：** 包含按优先级排序的行动项的全面差距分析报告

### 2. 了解要求（查阅参考资料）

**何时使用：** 用户需要了解特定的 ISO 13485 要求

**可用参考资料：**
- `references/iso-13485-requirements.md` - 完整的逐条款解析
- `references/mandatory-documents.md` - 所有 31 项必需程序的说明
- `references/gap-analysis-checklist.md` - 详细的合规性检查表
- `references/quality-manual-guide.md` - 如何创建质量手册

**使用方法：**

1. **针对具体条款问题：**
   - 阅读 `iso-13485-requirements.md` 中的相关章节
   - 使用通俗易懂的语言解释要求
   - 提供实际示例

2. **针对文档要求：**
   - 查阅 `mandatory-documents.md`
   - 说明必须形成文档的内容
   - 明确文档何时适用，何时可以排除

3. **对于实施指导：**
   - 对于政策层级的文档，使用 `quality-manual-guide.md`
   - 提供分步创建流程
   - 展示良好实施与不良实施的示例

**需要了解的关键参考章节：**

- **第 4 条：** QMS 要求、文档、风险管理、软件验证
- **第 5 条：** 管理职责、质量方针、目标、管理评审
- **第 6 条：** 资源、能力、培训、基础设施
- **第 7 条：** 产品实现、设计、采购、生产、可追溯性
- **第 8 条：** 测量、审核、CAPA、投诉、数据分析

### 3. 创建文档（基于模板生成）

**适用情形：** 用户需要创建特定的 QMS 文档。

**可用模板：**
- 质量手册：`assets/templates/quality-manual-template.md`
- CAPA 程序：`assets/templates/procedures/CAPA-procedure-template.md`
- 文档控制：`assets/templates/procedures/document-control-procedure-template.md`

遵循 `references/document-creation-guide.md` 中的完整创建流程、优先顺序（阶段 1-6）以及针对各类文档的深入指导（质量手册、SOP、CAPA、医疗器械文档）。该指南还涵盖按条款逐项进行的详细全面差距分析。

## 路由指南

- **差距分析**（现有文档）→ 核心工作流步骤 1；运行 `scripts/gap_analyzer.py`。按条款逐项进行的详细评估：`references/document-creation-guide.md`。
- **了解条款/要求** → 核心工作流步骤 2；阅读 `references/iso-13485-requirements.md` 和 `references/mandatory-documents.md`。
- **创建质量手册 / SOP / CAPA / MDF** → `references/document-creation-guide.md` + `assets/templates/` 中对应的模板。
- **根据用户情形匹配处理方法**（初创企业从零开始、现有 QMS 的差距分析、单个文档、QMSR 过渡、审核准备）→ `references/common-scenarios.md`。
- **写作质量、删减项、应避免的错误** → `references/best-practices.md`。
- **31 项程序、各地区法规要求、保留期限** → `references/quick-reference.md`。

## 参考资料索引

- `references/iso-13485-requirements.md` — ISO 13485:2016 的完整逐条解析。
- `references/mandatory-documents.md` — 对全部 31 项必需程序及其他强制性文档的说明。
- `references/gap-analysis-checklist.md` — 全面的合规检查清单。
- `references/quality-manual-guide.md` — 创建合规质量手册的分步指南。
- `references/document-creation-guide.md` — 完整的文档创建流程、优先顺序以及针对各类文档的深入指导（QM、SOP、CAPA、MDF、详细差距分析）。
- `references/common-scenarios.md` — 针对五种最常见用户情形的具体处理方法。
- `references/best-practices.md` — 文档制定最佳实践、删减规则及示例、常见错误。
- `references/quick-reference.md` — 31 项程序、各地区法规要求、文档保留期限。

### scripts/
- `gap_analyzer.py` — 用于分析现有文档并识别其与 ISO 13485 要求之间差距的自动化工具。

### assets/templates/
- `quality-manual-template.md`、`procedures/CAPA-procedure-template.md`、`procedures/document-control-procedure-template.md`。

## 入门指南

**首次使用的用户应：**

1. 阅读 `references/iso-13485-requirements.md` 以了解该标准。
2. 如果已有文档，请运行差距分析脚本（核心工作流第 1 步）。
3. 使用模板和 `references/document-creation-guide.md` 创建质量手册。
4. 按优先级顺序制定程序（请参阅指南）。
5. 使用 `references/gap-analysis-checklist.md` 进行最终验证。

**需要帮助？** 首先描述你的情况：你目前所处的阶段、已有的内容以及需要创建的内容——然后按照上述指南选择相应路径。