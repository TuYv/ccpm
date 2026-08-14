---
name: pdf-toolkit
description: >
  Audit PDF files for metadata leakage, page count, encryption, JavaScript,
  embedded files, and version. Use before sending a PDF externally, when
  redacting sensitive metadata, or running a PDF security review.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: documents
  domain: document-automation
  updated: 2026-05-04
  python-tools: pdf_auditor.py
  tech-stack: pdf
---
# PDF 工具包

仅使用标准库审计 `.pdf` 文件的元数据、页数、加密状态、嵌入式 JavaScript、嵌入文件和 PDF 版本。

---

## 目录

- [关键词](#keywords)
- [快速入门](#quick-start)
- [核心工作流](#core-workflows)
- [工具](#tools)
- [参考指南](#reference-guides)
- [模板](#templates)
- [最佳实践](#best-practices)

---

## 关键词

pdf, pdf 审计, pdf 元数据, pdf 审查, pdf 泄露, pdf 安全, 脱敏, 文档交接

---

## 首先确认

运行审计前，请确认以下信息。如果有任何信息未知或含糊不清，请询问——不要自行假设：

- [ ] **审计目的（交接前清理元数据、入站安全分诊或批量出站检查）** —— 决定使用 3 个工作流中的哪一个，以及需要处理哪些字段
- [ ] **接收方／处理环境（外部相关方、受管笔记本电脑）** —— 决定哪些内容属于泄露，或哪些威胁值得隔离
- [ ] **预期的合法元数据（作者／标题应当是什么）** —— 如果没有这些信息，就无法区分泄露数据和预期数据

停止规则：只询问最能影响输出结果的 2-3 个问题。如果用户说“直接起草即可”，则继续执行，并在产出内容顶部列出你的假设。

## 快速入门

```bash
python scripts/pdf_auditor.py contract.pdf
```

输出：PDF 版本、页数、文件大小、元数据（作者、标题、生成程序、创建程序、日期）、加密状态、嵌入式 JavaScript 指示信息、嵌入文件指示信息。

---

## 核心工作流

### 工作流 1：交接前 PDF 元数据审计

**目标：** 向外部相关方交接 PDF 时，避免泄露作者身份、先前客户名称或文档历史记录。

**步骤：**
1. 运行：`python scripts/pdf_auditor.py document.pdf`
2. 检查元数据字段：
   - `Author` 与发送方一致（而不是先前项目中的“Bob 的实习生”）
   - `Title` 与文档一致，而不是遗留的工作标题
   - `Producer` 不会泄露仅供内部使用的 PDF 工具
   - `CreationDate` 和 `ModDate` 对当前交易而言合理
3. 如果元数据存在泄露，请使用清理后的属性从源文件重新导出（或使用脱敏工具）

**预计用时：** 每份文档 2-3 分钟。

### 工作流 2：PDF 安全分诊

**目标：** 判断收到的 PDF 能否在受管笔记本电脑上安全打开。

**步骤：**
1. 运行审计
2. 存在 JavaScript 指示信息 → 隔离；在沙箱中检查
3. 存在嵌入文件指示信息 → 获取文件类型列表；如不符合预期，则隔离
4. 文件已加密且所有者密码非空 → 通过其他渠道向发送方索取密码
5. 决策：打开／隔离／拒绝

**预计用时：** 每份入站文档 1-2 分钟。

### 工作流 3：批量审计出站文档集

**目标：** 在为客户或合作伙伴压缩文件夹之前，审计其中的每个 PDF。

**步骤：**
1. 循环执行：`for f in *.pdf; do python scripts/pdf_auditor.py "$f" --json; done > audit.jsonl`
2. 解析 JSON Lines，检查是否存在任何元数据泄露或异常
3. 从源文件重新导出有问题的文件
4. 重新运行审计，直至全部通过

**时间估算：** 每个文件 1-2 分钟。

---

## 工具

### pdf_auditor.py

使用标准库解析读取 PDF——无需 `pypdf` 或 `pdfplumber`。可检测：

- PDF 版本（来自文件头）
- 页数（通过扫描 `/Type /Page` 对象）
- 文件大小
- 文档信息 / XMP 元数据（Title、Author、Subject、Keywords、Producer、Creator、CreationDate、ModDate）
- 加密状态（是否存在 `/Encrypt` 引用）
- JavaScript 指示项（`/JS`、`/JavaScript`、`/AA` 键）
- 嵌入文件指示项（`/EmbeddedFiles`）

```bash
python scripts/pdf_auditor.py document.pdf
python scripts/pdf_auditor.py document.pdf --json
```

**限制：**
- **不会**提取文本内容——仅使用标准库进行 PDF 文本提取并不可靠。如需提取文本，请另行安装 `pdfplumber` 或 `pypdf`。
- 无法解密已加密文件。
- 只能检测是否存在 JavaScript/嵌入文件，无法检测其行为。

---

## 参考指南

- **`references/pdf_handoff_guide.md`** — 对外发送 PDF 前应清除哪些内容；PDF/A 和 PDF/UA 基础知识；常见信息泄露模式

---

## 模板

- **`assets/pdf_handoff_checklist.md`** — 发送前 PDF 签核清单

---

## 最佳实践

- **重新导出，而不是遮盖。** 用于“移除”内容的遮盖工具可能会留下可恢复的信息。最安全的方式是从源文档重新生成 PDF，并移除敏感字段。
- **在源文件中清除文档属性。** 在 Word 中：File → Inspect Document → Document Inspector。在 Pages 中：File → Properties。然后导出为 PDF。
- **不要相信文件名。** 名为 `Public-Report.pdf` 的文件可能携带肉眼无法察觉的私密元数据。
- **使用 PDF/A 进行归档。** PDF/A 会移除 JavaScript 和外部依赖项，使文档适合长期安全归档。

---

## 集成点

- 与 `legal/` 配合，用于已遮盖敏感信息的合同交接
- 与 `c-level-advisor/board-deck-builder` 配合，用于董事会材料包交接
- 供 `marketing/` 用于白皮书/案例研究交接