---
name: xlsx-toolkit
description: >
  Audit Microsoft Excel (.xlsx) workbooks for formula density, external
  references, named ranges, hidden sheets, and data validation. Use when
  reviewing a financial model, sharing a workbook externally, or checking for
  data leakage.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: documents
  domain: document-automation
  updated: 2026-05-04
  python-tools: xlsx_auditor.py
  tech-stack: xlsx, OOXML
---
# Xlsx 工具包

仅使用标准库审计 `.xlsx` 文件——无需 `openpyxl`。通过 `zipfile` + `xml.etree` 直接读取 OOXML。

---

## 目录

- [关键词](#keywords)
- [快速开始](#quick-start)
- [核心工作流](#core-workflows)
- [工具](#tools)
- [参考指南](#reference-guides)
- [模板](#templates)
- [最佳实践](#best-practices)

---

## 关键词

xlsx、Excel、电子表格、工作簿、财务模型、公式审计、隐藏工作表、外部引用、命名区域、数据验证

---

## 首先确认

运行审计前，请确认以下输入。如果有任何一项未知或含糊，请询问——不要自行假设：

- [ ] **审计目的（发送前泄漏检查、财务模型审查或交接可移植性检查）**——决定采用的工作流以及要标记的问题
- [ ] **接收方情况（外部合作伙伴、其他团队、对方的机器）**——决定对隐藏工作表和外部链接的容忍度
- [ ] **哪些工作表是输入表，哪些是计算表（用于模型审查）**——决定阅读公式密度时应重点关注的位置

停止规则：只询问对输出影响最大的 2-3 项。如果用户说“直接起草即可”，则继续执行，并在产出物顶部列出你的假设。

## 快速开始

```bash
python scripts/xlsx_auditor.py model.xlsx
```

输出：工作表数量和名称、隐藏工作表数量、每个工作表的单元格数量、每个工作表的公式数量、外部链接数量、命名区域数量、数据验证规则数量。

---

## 核心工作流

### 工作流 1：发送前工作簿审计

**目标：** 找出会让发送者尴尬的问题——遗留的隐藏工作表、失效的外部链接、未使用的命名区域、引用本地文件路径的公式。

**步骤：**
1. 运行审计
2. 隐藏工作表 > 0 → 确认是否有意保留，否则删除
3. 外部链接 > 0 → 验证链接是否指向公开或共享的数据源，而不是你的本地驱动器
4. 命名区域数量异常（非常高）→ 可能是先前模型版本遗留的冗余内容；进行清理
5. 重新运行，直至没有问题

**时间估算：** 每个工作簿 5-10 分钟。

### 工作流 2：财务模型审查

**目标：** 在逐个单元格阅读之前，对财务模型的大致复杂度进行量化。

**步骤：**
1. 运行审计；记录每个工作表的单元格数量和公式数量
2. 公式密度 > 70% 的工作表属于计算表；应具有良好的结构
3. 公式密度为 0-10% 的工作表属于输入表；应有清晰明确的标注
4. 公式密度为 10-70% 的工作表属于混合表——最容易隐藏错误
5. 对照 `references/financial_model_audit_guide.md` 进行检查

**时间估算：** 每次模型审计 30-60 分钟（审计 + 针对性阅读）。

### 工作流 3：工作簿交接检查

**目标：** 确保交接给其他团队或合作伙伴的工作簿不会在对方的机器上失效。

**步骤：**
1. 运行审计
2. 外部链接 → 重新链接到共享路径（OneDrive、SharePoint、S3），或将值硬编码
3. 自定义命名区域 → 如果预期接收方会扩展工作簿，则编写相关文档；如果仅供内部使用，则将其删除
4. 宏（xlsm）→ 审计会显示预期使用非 `.xlsx` 扩展名；如果接收方无法运行宏，则进行转换
5. 文件大小 > 10 MB → 考虑拆分文件或移除图像/图表二进制对象

**时间估算：** 每个工作簿 10-20 分钟。

---

## 工具

### xlsx_auditor.py

将 `.xlsx` 文件作为 ZIP 归档读取，并直接解析 OOXML。

```bash
python scripts/xlsx_auditor.py model.xlsx
python scripts/xlsx_auditor.py model.xlsx --json
```

**报告内容：**
- 工作表列表，包括名称、隐藏状态、单元格数量、公式数量、公式密度 %
- 单元格和公式总数
- 命名区域及其作用域
- 外部链接引用（文件路径或 URL）
- 数据验证规则数量
- 文件大小

**限制：**
- **不会**计算公式。要检查公式是否*正确*，请使用 Excel 本身或财务模型检查器库。
- 除计数外，**不会**读取非共享字符串单元格的值；完整提取值所需的解析工作超出了此工具的能力范围。

---

## 参考指南

- **`references/financial_model_audit_guide.md`** — 财务模型审计模式；常见错误类别；防御性结构技巧

---

## 模板

- **`assets/workbook_handoff_checklist.md`** — 发送前的 xlsx 签核检查清单

---

## 最佳实践

- **仅在确有必要时隐藏仅供内部使用的工作表。** 如果工作表因为仍在制作中而被隐藏，请在发送前将其删除。
- **交接时避免使用外部链接。** 引用了 `'C:\Users\you\Desktop\old-model.xlsx'` 的公式，就相当于在文档作者字段中留下你的笔记本电脑名称。
- **为输入项命名。** `Inputs!B7` 这样的单元格引用含义不明。像 `WACC` 和 `RevenueGrowth` 这样的命名区域则能经受结构变更。
- **一个模型只服务于一个目的。** 同时用于计算、展示和充当记录数据库的工作簿，最终总会出问题。

---

## 集成点

- 与 `finance/` 技能配合，用于财务模型审查
- 与 `c-level-advisor/cfo-advisor` 配合，用于董事会材料包工作簿审查
- 由 `data-analytics/` 用于临时分析交接