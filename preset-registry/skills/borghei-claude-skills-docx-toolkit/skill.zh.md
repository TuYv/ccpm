---
name: docx-toolkit
description: >
  Audit Microsoft Word (.docx) documents for heading hierarchy, comments,
  tracked changes, broken cross-references, and style consistency. Use when
  reviewing a contract draft, preparing a document for handoff, or enforcing a
  style guide.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: documents
  domain: document-automation
  updated: 2026-05-04
  python-tools: docx_auditor.py
  tech-stack: docx, OOXML
---
# DOCX 工具包

仅使用标准库审查 `.docx` 文件——无需 `python-docx`。通过 `zipfile` + `xml.etree` 直接读取 OOXML。

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

docx、Word、Microsoft Word、文档、文档审查、批注、修订、红线修订、标题、样式指南、字数统计、文档审计

---

## 首先确认

在运行审计之前，请确认以下输入。如果有任何一项未知或含糊，请询问——不要自行假设：

- [ ] **审计目的（交接前清理、合同审查分流或样式指南执行）**——用于选择工作流及所应用的阈值
- [ ] **接收方（外部客户、对方律师、内部人员）**——决定对残留批注和修订的容忍度
- [ ] **允许的样式集（用于样式指南执行）**——定义哪些样式属于不合规样式

停止规则：只询问对输出影响最大的 2-3 项。如果用户说“直接起草即可”，则继续执行，并在交付物顶部列出你的假设。

## 快速开始

```bash
python scripts/docx_auditor.py contract.docx
```

输出：字数、段落数、标题层级、批注数、修订状态、超链接数、所使用的唯一段落样式列表。

---

## 核心工作流

### 工作流 1：交接前文档审计

**目标：** 在文档发出之前，发现会令发送者难堪的问题——残留批注、未处理的修订、断裂的标题层级。

**步骤：**
1. 运行：`python scripts/docx_auditor.py document.docx`
2. 检查审计输出：
   - 批注数 > 0 → 发送前解决或删除
   - 检测到修订 → 发送前接受或拒绝
   - 标题层级存在跳级（H1 → H3，中间没有 H2）→ 重新组织结构
   - 样式泛滥（超过 8 种段落样式）→ 合并精简
3. 重新运行，直至无问题

**预计耗时：** 每份文档 5-15 分钟。

### 工作流 2：合同审查分流

**目标：** 在逐行阅读退回的合同之前，量化其所需的返工工作量。

**步骤：**
1. 对退回的 `.docx` 运行审计
2. 批注数 > 20 或含修订的段落 > 30% → 预计需要进行大量审查；预留时间
3. 批注数 < 5 → 可能仅涉及表面调整；可以快速处理
4. 使用 `references/docx_review_checklist.md` 进行实际内容审查

**预计耗时：** 每份文档的分流耗时 1 分钟。

### 工作流 3：样式指南执行

**目标：** 在文档发送给客户之前，检测其是否偏离样式指南。

**步骤：**
1. 在样式指南中定义允许的样式（参见 `assets/style_compliance_template.md`）
2. 对候选文档运行审计
3. 标记使用了允许集合之外样式的所有文档
4. 将不合规段落重新映射到标准样式

**预计耗时：** 每份文档 2-5 分钟。

---

## 工具

### docx_auditor.py

将 `.docx` 文件作为 ZIP 归档读取，并直接解析 OOXML。无需外部依赖。

```bash
# Human-readable
python scripts/docx_auditor.py document.docx

# JSON
python scripts/docx_auditor.py document.docx --json
```

**报告内容：**
- 字数和段落数
- 标题层级（含层级跳跃检测）
- 批注数量
- 是否存在修订记录
- 使用的唯一段落样式
- 超链接数量
- 图片数量
- 表格数量

**限制：** 此工具用于读取现有 docx 文件。若要*生成* docx，请使用 `assets/` 中的模板并在 Word 中编辑，或单独安装 `python-docx`。

---

## 参考指南

- **`references/docx_review_checklist.md`** — 交付前检查清单；常见返工诱因；自动审计无法发现的错误

---

## 模板

- **`assets/style_compliance_template.md`** — 用于声明允许使用的段落样式的格式
- **`assets/handoff_checklist_template.md`** — 包含签核复选框的发送前检查清单

---

## 最佳实践

- **每次对外发送前都要审计。** 30 秒的审计可以避免 80% 本可避免的尴尬。
- **在创建 "Final v3.docx" 之前解决所有批注。** 名为 "final" 却仍有未处理批注的文件，最容易让律师哭笑不得。
- **锁定标题层级。** 从 H1 直接跳到 H3 而没有 H2，会破坏导航、无障碍访问和目录生成。
- **优先使用样式，而非行内格式。** 在一处修改样式，胜过调整数百处行内格式覆盖。

---

## 集成点

- 与 `legal/` 技能配合，用于合同修订
- 与 `marketing/copywriting/` 配合，用于内容审核
- 由 `c-level-advisor/board-deck-builder` 用于董事会资料包文档