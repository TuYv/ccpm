---
name: iso-standards-readiness
description: Prepares and structurally reviews readiness evidence for ISO management-system and laboratory-competence standards - ISO 13485 medical device QMS, ISO 14971 device risk management, ISO/IEC 17025 testing and calibration laboratories, and ISO 15189 medical laboratories. Use when organizing declared scope, controlled documents, risk-management files, scope of accreditation, traceability, CAPA, external-provider controls, or bounded local evidence manifests, and when separating ISO certification from laboratory accreditation, FDA QMSR inspection, CLIA certification, MDSAP, and EU MDR/IVDR evidence boundaries. Not for legal applicability, compliance, certification, or accreditation decisions; contains no clause text.
license: MIT
compatibility: Python 3.11+; bundled CLIs use only the standard library and bounded local JSON/Markdown files, with no network access or credentials.
allowed-tools: Read Write Bash Glob
metadata:
  version: "1.0"
  skill-author: K-Dense Inc.
  supersedes: iso-13485-certification
  last-reviewed: "2026-07-26"
---
# ISO 标准就绪证据准备

## 目的

使用此技能，针对指定标准，为实质性人工审查组织已声明的范围、受控文件、
实施记录、可追溯性和就绪证据。它总结了流程工作流，并提供确定性的本地
检查。它不包含任何条款文本，也不执行审计。

这是一个路由器。`SKILL.md` 规定边界、路径纪律、共享
工作流和 CLI 契约。各标准的详细内容位于 `references/` 中。

## 不可妥协的边界

此技能不能：

- 对任何事项进行认证或认可，签发或验证证书、认可
  计划或许可证，或承诺审计、评估或检查结果；
- 确定法律/法规适用性、器械分类、可报告性、符合性路径、产品授权、
  市场准入、许可、人员资格或合规性；
- 替代经授权的管理层、管理者代表、实验室主任、
  质量经理、授权签字人、RA/QA、法律顾问、监管/主管部门、公告机构、
  MDSAP 审核机构、认可机构、评估员或认证机构；
- 验证方法、计算或批准测量不确定度、建立
  计量溯源性、设定风险可接受性标准，或判断某项风险、
  决策规则或参考区间是否适合其预期用途；或
- 根据模板、检查清单、文件名、关键词、文件数量、百分比或脚本
  结果，推断实施情况、能力、符合性、合规性或就绪状态。

始终将输出标记为 **供经授权人员审查的证据准备草案材料**。
将未解决的决策保留为阻碍项，而不是替其作出决定。

## ISO 和 IEC 版权

ISO 和 IEC 标准受版权保护。请从
[ISO](https://www.iso.org/standards.html)、IEC、ISO 国家成员机构或其他
授权来源获取每项标准。不要获取、粘贴、复制或生成条款文本。
总结组织自身的流程，并引用受控的授权副本。请参阅
[ISO 版权](https://www.iso.org/copyright.html)。引用要求的认可机构、CAP
和方案检查清单分别受到许可约束——也不要将它们放入共享
存储库和提示中。

## 涵盖的标准

在准备证据之前，先阅读当前所涉及标准的参考文件。每个文件都包含其自身的当前
版本、路径、领域词汇和失效模式。

| 标准 | 配置文件键 | 路径 | 参考文件 |
| --- | --- | --- | --- |
| ISO 13485 医疗器械质量管理体系 | `iso-13485` | 认证 | `references/iso-13485.md` |
| ISO 14971 器械风险管理 | `iso-14971` | 无独立路径 | `references/iso-14971.md` |
| ISO/IEC 17025 检测和校准实验室 | `iso-17025` | 认可 | `references/iso-17025.md` |
| ISO 15189 医学实验室 | `iso-15189` | 认可 | `references/iso-15189.md` |

表中未列出的标准不在捆绑检查的范围内。不要将某个配置文件用于它未指明的
标准——从不同标准借用的领域词汇会生成一份看似完整、实则毫无意义的报告。

## 当前基线（任何涉及时间的陈述前，先阅读 ledger）

- **ISO 13485:2016** 第 3 版，在其 2025 年系统评审后确认仍为现行版本。  
  **EN ISO 13485:2016/A11:2021** 是欧洲修订件，而不是 ISO 国际标准的
  “Amendment 1:2021”。
- **ISO 14971:2019** 第 3 版，于 2025 年确认仍为现行版本，并以
  **ISO/TR 24971:2020** 作为其信息性指南配套文件。不存在 ISO 14971 证书。
- **ISO/IEC 17025:2017** 第 3 版仍为现行版本；尚未确定有后续版本。
- **ISO 15189:2022** 第 4 版取代了 2012 版，吸收了原先包含在 ISO 22870
  中的 POCT 要求，其认可转换已于 **2025 年 12 月**结束——已实施，而非即将实施。
- **FDA QMSR** 自 **2026-02-02** 起生效并开始执行；Part 820 的标题为
  *Quality Management System Regulation*；QSIT 已被废止，改用合规计划
  **7382.850**。
- **MDSAP** 当前的 Audit Approach 为 **MDSAP AU P0002.010**，版本日期为
  **2026-02-02**。
- **认可互认：** Global Accreditation Cooperation Incorporated 于
  **2026-01-01** 开始全面运营，取代 ILAC 和 IAF，并拥有自己的 MRA；
  原 IAF MLA / ILAC MRA 的输出在过渡期间继续获得认可。
- **EU：** 使用当前整合版 MDR/IVDR 文本、当前 OJEU 协调标准决定、当前 MDCG 指南以及
  针对具体产品的合格评定路径。

在作出任何涉及时间的陈述前，请阅读 `references/source-ledger.md`。其中记录了来源限制，
包括哪些条目仍需根据 ISO 目录进行确认。

## 保持各保障路径相互独立

这里大多数实质性错误并非源于缺少文件，而是源于路径混淆。认证、认可、监管机构检查、
强制许可、监管审核计划和产品合格评定由不同机构依据不同基础作出决定，任何一种都不能替代
另一种。以下两条规则经常被违反：

- 组织获得**认证**；实验室获得**认可**。“ISO 17025
  certified”和“ISO 15189 certified”属于类别错误。
- 证书永远不能取代监管机构。ISO 13485 认证不能使任何人免于 FDA 检查，
  ISO 15189 认可也不能满足 CLIA 要求。

请阅读 `references/assurance-lanes.md`，了解完整的路径表、范围声明限制以及命名规则。

## 核心工作流

### 步骤 1：声明标准、目的和授权负责人

列出标准、工作所支持的路径以及负责人：管理者代表或实验室主任、质量负责人、
法律/适用性负责人、流程或技术负责人、批准人和升级路径。路径必须作为明确声明的输入，
绝不能通过推断得出。

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/validate_scope_intake.py \
  assets/templates/scope-intake-template.json --standard iso-13485
```

使用匹配的模板和配置：

| 配置 | 模板 |
| --- | --- |
| `iso-13485`, `iso-14971` | `assets/templates/scope-intake-template.json` |
| `iso-17025` | `assets/templates/laboratory-scope-intake-template.json` |
| `iso-15189` | `assets/templates/medical-laboratory-scope-intake-template.json` |
|

`--standard` 默认为 `iso-13485`。每个随附的模板都经过有意设计，默认以阻断方式失败；请将其复制到 skill 外部，并使用受控的组织证据完成。适用性未确定时会引发 `HUMAN_DECISION_REQUIRED` —— 请将其保留为阻塞项。

### 步骤 2：冻结来源/版本证据

对于每项标准、法规、指南、方案文件、审核模型和产品来源，记录发布者、官方标题、版次/版本/日期、授权位置、访问日期和货币审查日期、范围/适用性负责人、影响评估、状态、证据和批准。

不要将搜索摘要用作受控要求。当发布者发布新版本时，不要默默更新已纳入的版本 — FDA 纳入的是特定版本的 ISO 13485，后续发布的 ISO 或 EN 版本不会改变该版本。

### 步骤 3：盘点受控文件和记录

不要统计已命名的程序或扫描关键词。建立一个明确的登记册，将文件、记录、来源版本、负责人、批准、实施日期、保存依据、培训和变更记录关联起来。

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/audit_document_records.py \
  assets/templates/document-register-template.json
```

此检查与标准无关。请阅读 `references/evidence-architecture.md` 了解证据架构。

### 步骤 4：评审过程实施情况

根据你的 profile 所声明的领域，评估受控程序**以及抽样记录** — 每项标准的参考文件会列出这些领域。每个项目都需要负责人、状态、证据 ID、来源/版本、批准和未解决缺口链接。

描述某项活动的程序并不能证明该活动已经发生。在你报告的每个领域中抽样记录，并说明你抽样了什么以及没有抽样什么。

### 步骤 5：运行适用于该路径的重点检查

器械路径（`iso-13485`、`iso-14971`）— 风险/设计/生产/上市后链：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/check_traceability.py \
  assets/templates/traceability-matrix-template.json
```

所有标准 — 纠正措施和有效性：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/check_capa.py \
  assets/templates/capa-record-template.json
```

所有标准 — 供应商以及外部提供的产品和服务，包括校准服务提供商、标准物质供应商，以及转介或分包实验室：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/check_supplier_controls.py \
  assets/templates/supplier-controls-template.json
```

待定或无效的 CAPA 有效性证据会阻止关闭。关键供应商的控制措施在基于风险的控制和批准得到证据证明之前，应保持阻塞状态。

请注意，`check_traceability.py` 涉及设计和风险可追溯性，**而不是**计量学溯源 — 两者用词相近，但这是实验室工作的错误工具。

### 步骤 6：单独处理路径特定的监管机构证据

仅适用于美国器械路径：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/check_qmsr_transition.py \
  assets/templates/qmsr-transition-template.json
```

审查当前 Part 820/FDA 依据、补充条款、已过时的 QSR/QSIT
引用、生效日期之前的记录、可供检查访问的管理/质量/
供应商审核记录、当前检查流程培训、投诉和服务记录、标签/包装控制、
供应商/软件/变更证据，以及禁止的证书等效性声明。不要构建旧版 820 到 ISO 条款的映射，将其作为当前控制框架。

实验室通道没有等效的捆绑检查。CLIA、许可和国家级检查证据由授权的合规负责人保管；参见
`references/iso-15189.md`。

### 步骤 7：组装有界的准备情况清单

将证据模板复制到技能目录之外。仅使用相对路径指向本地 `.json`、
`.md` 或 `.markdown` 证据，并且每个清单只能声明一个通道用途。

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/validate_evidence_manifest.py \
  /path/to/evidence-manifest.json \
  --standard iso-17025 \
  --base-dir /path/to/controlled-export \
  --verify-files \
  --output /path/to/manifest-report.json
```

然后针对同一配置文件生成域级差距视图：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/gap_analyzer.py \
  /path/to/evidence-manifest.json \
  --standard iso-17025 \
  --base-dir /path/to/controlled-export \
  --verify-files \
  --output /path/to/gap-report.json
```

分析器使用清单中的明确标签。它不会根据文件名、
关键词或专有标准文本推断证据，也不会计算合规评分。`expected_domains` 中缺失的域会被报告为
`not-assessed`，这**不**代表已确定为不适用。

阅读 `references/gap-analysis-checklist.md` 以了解失败即关闭的审查问题。

### 步骤 8：人工审查和受控交接

提交：

- 声明的标准、范围、保证通道以及尚未解决的适用性决定；
- 确切的来源/版本基线；
- 已抽样的证据及该样本的局限性；
- 按流程和风险分组的结构性发现；
- 负责行动、变更和 CAPA 的负责人及日期；
- 批准状态；以及
- 负责下一项决策的授权方。

绝不要将结果命名为“证书”“认可”“合规报告”“审核通过”“视同状态”或“已准备好接受检查”。合适的标题是**供授权人员评估的证据审查草案**，并注明其准备所针对的通道。

## CLI 行为与安全性

所有随附的 CLI：

- 仅使用 Python 标准库；
- 不执行网络请求；
- 接受有界的本地 JSON；可选的证据验证仅接受有界的本地
  JSON/Markdown；
- 拒绝符号链接输入、重复的 JSON 键、非有限数值、超出限制的大小/嵌套层级/项目数，以及不安全的证据路径；
- 拒绝未列出的 `--standard` 值，而不是回退到默认值；
- 不使用动态求值、可执行反序列化、pickle 或 shell 执行；
- 除非明确指定 `--force`，否则拒绝覆盖报告；并且
- 生成确定性排序的 JSON。

将清单本身视为受控的组织记录。可选的 SHA-256 比对仅检测本地文件是否不匹配；它不能证明用户提供的清单的来源、真实性、充分性或可信度。JSON 中的 `local_path` 和 `evidence.location` 字段指向用户受控的导出内容，而不是随附的 skill 资源；未解析的占位符绝不能被打开。

退出代码：

- `0`：所提供字段不存在结构性问题；**不代表合规、符合性、能力或认可结果**；
- `1`：发现结构性/证据缺口；
- `2`：输入/输出无效或不安全，包括未列出的标准。

对每个接口运行 `python3 scripts/<name>.py --help`。

## 模板

范围接收，按 profile 划分：

- `assets/templates/scope-intake-template.json` — 设备生命周期
- `assets/templates/laboratory-scope-intake-template.json` — 检测/校准
- `assets/templates/medical-laboratory-scope-intake-template.json` — 检查

共享登记册和记录：

- `assets/templates/document-register-template.json`
- `assets/templates/capa-record-template.json`
- `assets/templates/traceability-matrix-template.json`
- `assets/templates/supplier-controls-template.json`
- `assets/templates/evidence-manifest-template.json`
- `assets/templates/qmsr-transition-template.json` — 仅限美国设备路径

管理体系文件：

- `assets/templates/quality-manual-template.md`
- `assets/templates/procedures/CAPA-procedure-template.md`
- `assets/templates/procedures/document-control-procedure-template.md`

每个模板都明确标记为 `draft`/`pending`，使用占位符，并包含 owner/status/evidence/approval 字段。请复制并对其实施控制；绝不要将分发的模板编辑成声称已批准的记录。

## 参考资料

共享：

- `references/assurance-lanes.md` — 每条路径所作的决定，以及命名规则
- `references/source-ledger.md` — 带日期的权威来源基线及来源限制
- `references/evidence-architecture.md` — 文件和记录架构
- `references/gap-analysis-checklist.md` — 证据审查问题（发现问题即关闭）
- `references/quality-manual-guide.md` — 受控手册开发

按标准：

- `references/iso-13485.md` — 设备 QMS 流程/证据框架、QMSR、MDSAP、EU
- `references/iso-14971.md` — 风险管理链条及缺失环节的失效模式
- `references/iso-17025.md` — 实验室能力、溯源性、不确定度和判定规则
- `references/iso-15189.md` — 医学实验室、POCT、报告以及 CLIA 路径