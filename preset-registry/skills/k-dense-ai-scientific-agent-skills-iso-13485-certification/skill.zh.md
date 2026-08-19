---
name: iso-13485-certification
description: Prepare and structurally review ISO 13485 QMS scope, controlled documentation, and local evidence manifests. Use for ISO 13485 certification-readiness documentation or for separating related FDA QMSR, MDSAP, and EU MDR/IVDR evidence boundaries; not for legal applicability, compliance, or certification decisions.
license: MIT
compatibility: Python 3.11+; bundled CLIs use only the standard library and bounded local JSON/Markdown files, with no network access or credentials.
allowed-tools: Read Write Bash Glob
metadata:
  version: "1.1"
  skill-author: K-Dense Inc.
---
# ISO 13485 QMS 证据准备

## 目的

使用此技能组织 QMS 范围、受控文件、实施记录、可追溯性和准备就绪证据，
以便进行实质性审查。它总结流程工作流并提供确定性的本地检查；不包含 ISO 条款
文本，也不执行审核。

## 不可协商的边界

此技能不能：

- 对 QMS 进行认证、签发或验证证书，或承诺审核结果；
- 确定法律/法规适用性、器械分类、可报告性、符合性路径、产品授权、市场准入或合规性；
- 替代经授权的管理层、管理者代表、RA/QA、法律顾问、监管机构/主管机构、公告机构、
  MDSAP 审核组织、认可机构或认证机构；或
- 根据模板、检查清单、文件名、关键词、文件数量、百分比或脚本结果推断实施情况、符合性、
  合规性或准备就绪状态。

始终将输出标注为**供经授权的人类审查的证据准备材料草案**。将未解决的决策保留为阻塞项。

## ISO 版权

ISO 标准受版权保护。请从
[ISO](https://www.iso.org/standard/59752.html)、ISO 国家成员或其他授权来源获取 ISO 13485
及相关标准。不要检索、粘贴、复制或生成条款文本。总结组织的流程，并引用受控的授权副本。
参见 [ISO 版权](https://www.iso.org/copyright.html)。

## 当前基线（研究于 2026-07-23）

- **ISO 13485：** ISO 13485:2016，第 3 版，在 2025 年系统性审查后得到确认，目前仍为现行版本。
- **欧洲修订：** EN ISO 13485:2016/A11:2021 是欧洲 EN 修订版，而不是 ISO 国际标准中的
  “Amendment 1:2021”。仅在适用欧洲来源基础的情况下跟踪 AC:2018/A11:2021。
- **FDA QMSR：** 自 **2026-02-02** 起生效并实施。目前的 Part 820 标题为
  *Quality Management System Regulation*。FDA 已停止使用 QSIT，改用合规计划
  **7382.850**。应将其视为已实施，而不是未来的过渡。
- **MDSAP：** 当前官方审核方法为 **MDSAP AU P0002.010**，版本日期为
  **2026-02-02**。
- **欧盟：** 使用当前合并版 MDR/IVDR 文本、当前 OJEU 协调标准决定、当前 MDCG 指南以及
  针对产品的符合性路径。
- **风险管理：** ISO 14971:2019，第 3 版，于 2025 年得到确认。对于欧洲相关工作，应区分
  EN ISO 14971:2019/A11:2021。

在作出时间敏感的陈述之前，阅读 `references/source-ledger.md`。

## 保持五条路径彼此分开

### 1. ISO 13485 认证

认证机构根据授权标准和认证方案，对已定义的管理体系范围进行评估。证书仅限于其中所声明的
组织、场所、活动、技术/产品范围、版本和有效期。

### 2. FDA QMSR 检查/合规

FDA 评估适用的 FDA 要求。ISO 认证不会使制造商免于接受检查，FDA 也不会签发 ISO 13485
证书。使用当前 eCFR 和 FDA 补充规定；不要将原有 QSR 条款结构用作当前要求映射。

### 3. MDSAP 审核

MDSAP 认可的审核机构使用当前的 MDSAP 方法以及参与辖区适用的要求开展法规审核。仅针对 ISO 的审核不属于 MDSAP；FDA 检查不遵循 MDSAP 审核计划。

### 4. EU MDR/IVDR 合规性评定

EU 合规性评定除通用 QMS 文档外，还包括产品、技术文档、上市后、警戒、经济运营者和公告机构等要求。在 NANDO 中核实公告机构当前的法规/任务/指定代码范围。仅有 ISO 认证/认可并不等同于公告机构指定，也不等同于 EU 产品合规。

### 5. 产品和辖区特定控制

分类、预期用途、声明、软件/网络安全、临床或性能证据、生物相容性、电气安全、灭菌、UDI、注册、报告以及其他控制措施，需要单独进行授权分析。

## 核心工作流程

### 步骤 1：明确目的和授权负责人

说明该项工作是支持内部 QMS 开发、ISO 认证准备、FDA 检查准备、MDSAP、EU 合规性评定，还是支持其中的特定组合。明确管理者代表、RA/QA 负责人、法律/适用性负责人、流程负责人、审批人和升级路径。

运行：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/validate_scope_intake.py \
  assets/templates/scope-intake-template.json
```

随附的模板设计为默认失败关闭。将其复制到技能目录之外，并使用受控的组织证据完成填写。

### 步骤 2：冻结来源/版本证据

对于每一项标准、法规、指南、审核模型和产品来源，记录：

- 发布者、正式标题、版本/版本号/日期以及授权位置；
- 访问日期和时效性审查日期；
- 范围/适用性负责人；
- 影响评估、状态、证据和批准。

不要将搜索摘要用作受控要求。当发布者发布新版本时，不要默默更新已纳入的版本。

### 步骤 3：盘点受控文件和记录

不要统计命名的程序或扫描关键词。建立明确的登记册，将文件、记录、来源版本、负责人、批准、生效日期、保留依据、培训和变更记录关联起来。

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/audit_document_records.py \
  assets/templates/document-register-template.json
```

阅读 `references/mandatory-documents.md` 了解证据架构。

### 步骤 4：审查流程实施情况

针对受控程序**和抽样记录**评估以下内容：

- 范围、治理、职责和管理权限；
- 文件/记录/外部来源控制；
- 风险管理；
- 设计/开发、转移和变更；
- 供应商、采购和外包流程；
- 生产/服务、基础设施、环境、验收和放行；
- 流程、设备、测试方法和软件验证；
- 标识、可追溯性、防护、安装和服务；
- 反馈、投诉、上市后监督和警戒；
- 不合格、CAPA 和有效性；
- 内部审核和管理评审；
- 能力/培训；以及
- 集成变更控制。

每个条目都需要包含负责人、状态、证据 ID、来源/版本、批准信息和未解决缺口链接。请阅读 `references/iso-13485-requirements.md`。

### 步骤 5：建立可追溯性并执行重点检查

风险/设计/生产/上市后：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/check_traceability.py \
  assets/templates/traceability-matrix-template.json
```

CAPA/有效性：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/check_capa.py \
  assets/templates/capa-record-template.json
```

供应商控制：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/check_supplier_controls.py \
  assets/templates/supplier-controls-template.json
```

待处理或无效的 CAPA 有效性证据会阻止关闭。关键供应商控制在基于风险的控制措施和批准得到证据证明之前，始终处于阻塞状态。

### 步骤 6：单独处理当前的 QMSR 证据

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/check_qmsr_transition.py \
  assets/templates/qmsr-transition-template.json
```

审查当前 Part 820/FDA 来源依据、补充条款、已废弃的 QSR/QSIT 引用、生效日期之前的记录、可供检查访问的管理层/质量/供应商审核记录、当前检查流程培训、投诉和维修记录、标签/包装控制、供应商/软件/变更证据，以及被禁止的证书等效性声明。

不要将旧版 820 与 ISO 条款建立映射，作为当前控制框架。

### 步骤 7：组装有边界的准备情况清单

将证据模板复制到 skill 之外。仅使用指向本地 `.json`、`.md` 或 `.markdown` 证据的相对路径。

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/validate_evidence_manifest.py \
  /path/to/evidence-manifest.json \
  --base-dir /path/to/controlled-export \
  --verify-files \
  --output /path/to/manifest-report.json
```

然后生成域级缺口视图：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/gap_analyzer.py \
  /path/to/evidence-manifest.json \
  --base-dir /path/to/controlled-export \
  --verify-files \
  --output /path/to/gap-report.json
```

该分析器使用清单中的显式标签。它不会根据文件名、关键词或专有标准文本推断证据，也不会计算合规评分。

### 步骤 8：人工审查和受控交接

请提供：

- 声明的范围、保证通道以及尚未解决的适用性决策；
- 确切的来源/版本基线；
- 已抽样的证据及其局限性；
- 按流程和风险分组的结构性发现；
- 行动/变更/CAPA 负责人和日期；
- 批准状态；以及
- 负责下一项决策的授权方。

不得将结果命名为“证书”“合规报告”“审核通过”或“已准备好接受检查”。合适的标题是 **供授权人员评估的 QMS 证据审查草案**。

## CLI 行为和安全性

所有随附的 CLI：

- 仅使用 Python 标准库；
- 不执行网络请求；
- 接受有边界的本地 JSON；可选的证据验证仅接受有边界的本地 JSON/Markdown；
- 拒绝符号链接输入、重复的 JSON 键、非有限数值、超出限制的大小/嵌套层级/项目数，以及不安全的证据路径；
- 不使用动态求值、可执行反序列化、pickle 或 shell 执行；
- 除非显式指定 `--force`，否则拒绝覆盖报告；并且
- 生成确定性排序的 JSON。

将清单本身视为受控的组织记录。可选的 SHA-256 比较只能检测本地文件是否不匹配；不能证明用户提供的清单的来源、真实性、充分性或可信度。JSON 中的 `local_path` 和 `evidence.location` 字段指向用户受控的导出内容，而不是捆绑的 skill 资源；未解析的占位符绝不能被打开。

退出代码：

- `0`：所提供字段不存在结构性问题；**不是合规结果**；
- `1`：发现结构性/证据缺口；
- `2`：输入/输出无效或不安全。

针对每个接口运行 `python3 scripts/<name>.py --help`。

## 模板

- `assets/templates/quality-manual-template.md`
- `assets/templates/procedures/CAPA-procedure-template.md`
- `assets/templates/procedures/document-control-procedure-template.md`
- `assets/templates/scope-intake-template.json`
- `assets/templates/document-register-template.json`
- `assets/templates/capa-record-template.json`
- `assets/templates/traceability-matrix-template.json`
- `assets/templates/qmsr-transition-template.json`
- `assets/templates/evidence-manifest-template.json`
- `assets/templates/supplier-controls-template.json`

每个模板都刻意设置为 `draft`/`pending`，使用占位符，并包含所有者/状态/证据/批准字段。请复制并对其实施控制；切勿将分发的模板编辑成声称已批准的记录。

## 参考资料

- `references/iso-13485-requirements.md` — 流程/证据框架和保证边界
- `references/mandatory-documents.md` — 文档和记录架构
- `references/gap-analysis-checklist.md` — 失效关闭式证据审查问题
- `references/quality-manual-guide.md` — 受控手册开发
- `references/source-ledger.md` — 具有日期的权威官方来源基线