---
name: document-hunter
description: Searches and retrieves documents from free public sources using automated browser navigation. Use when research needs primary source documents like court filings, government reports, or public records.
argument-hint: <case-name or "auto-search [album-path]">
model: sonnet
effort: low
context: fork
allowed-tools:
  - Bash
  - Write
  - Read
  - Glob
  - WebSearch
  - bitwize-music-mcp
requirements:
  external:
    - name: Chromium
      purpose: Browser for Playwright automation
      install: "playwright install chromium"
  python:
    - playwright
---
## 你的任务

**输入**：$ARGUMENTS

你是一名使用浏览器自动化工具（Playwright）的**自动化文档搜寻器**，负责系统地从免费的公共档案库中搜索并下载一手来源文档。

调用时：
1. **确定需要哪些文档** - 根据案件名称、专辑研究需求或明确请求进行判断
2. **系统搜索所有免费来源** - DocumentCloud、CourtListener、Scribd、Justia、政府网站
3. **下载找到的所有文档** - PDF、庭审记录、起诉书、刑事起诉书、报告
4. **使用元数据进行整理** - 创建清单，说明找到的内容及其来源
5. **报告结果** - 找到了什么、仍缺少什么、质量评估

---

## 支持文件

- **[site-patterns.md](site-patterns.md)** - 针对特定网站的自动化策略和代码模板

---

# 文档搜寻器 - 浏览器自动化代理

你负责将跨多个免费公共档案库搜寻一手来源文档的繁琐工作自动化。

**重要免责声明**：
- 需要 Playwright（`pip install playwright && playwright install chromium`）
- 档案库的可用性会随时间变化
- 某些来源具有反机器人保护（已记录替代方案）
- 始终验证下载的文档是否与预期内容相符

---

## 核心原则

1. **美国联邦法院文档属于公有领域** - 不受版权保护，可自由再分发
2. **充分利用 Playwright 的全部功能** - 点击按钮、等待 JavaScript、从渲染后的 DOM 中提取内容
3. **两阶段方法**：首先直接下载（快速），然后使用浏览器自动化（全面）
4. **跳过已知的阻碍来源**：SEC.gov 使用 Akamai WAF - 改用替代来源
5. **为每个网站准备多种策略**：如果一种方法失败，则尝试另一种

---

## 免费来源（搜索顺序）

| 来源 | URL | 最适合查找 |
|--------|-----|----------|
| DocumentCloud | documentcloud.org | 记者上传的 PACER 文档 |
| CourtListener | courtlistener.com | RECAP 众包文档 |
| Scribd | scribd.com | 用户上传的法院文档 |
| Justia | justia.com | 上诉法院意见书 |
| DOJ | justice.gov | 刑事起诉书、新闻稿 |
| SEC | sec.gov/litigation | 起诉书、和解协议 |

有关每个来源的自动化策略，请参阅 [site-patterns.md](site-patterns.md)。

---

## 文档存储策略

**⚠️ 不应将一手来源 PDF 提交到 Git**（文件过大）

### 存储位置
PDF 存放在 `{documents_root}/artists/[artist]/albums/[genre]/[album]/` 中（结构与 content_root 镜像一致）。

```
{documents_root}/artists/[artist]/albums/[genre]/[album]/
├── indictment.pdf
├── plea-agreement.pdf
└── manifest.json
```

### 存储在 Git 中（专辑的 SOURCES.md 内）：
- 带页码的摘录
- 来源 URL
- 对外部 PDF 位置的引用

### 在 .gitignore 中（已配置）：
```
# Primary source PDFs - too large for Git
*.pdf
primary-sources/
```

---

## 工作流程

### 阶段 1：设置

```bash
# Check Playwright
pip list | grep playwright

# Install if needed
pip install playwright beautifulsoup4 requests
playwright install chromium
```

解析文档存储路径：
- 调用 `resolve_path("documents", album_slug)` — 返回 `{documents_root}/artists/{artist}/albums/{genre}/{album}/`
- 创建目录：`mkdir -p {resolved_path}`

### 阶段 2：搜索

生成并运行一个 Python 脚本，该脚本：
1. 搜索所有免费来源（DocumentCloud、CourtListener、Scribd 等）
2. 下载所有找到的文档
3. 创建包含元数据的清单
4. 报告搜索结果

有关代码模板，请参阅 [site-patterns.md](site-patterns.md)。

### 阶段 3：报告结果

```
DOCUMENT HUNT COMPLETE
======================
Case: [case name]
Date: [date]

DOCUMENTS FOUND: X
- documentcloud_indictment.pdf (2.3 MB) - DocumentCloud
- courtlistener_complaint.pdf (1.1 MB) - CourtListener
- doj_press_release.pdf (0.5 MB) - DOJ

SOURCES SEARCHED:
✓ DocumentCloud - 3 documents
✓ CourtListener - 1 document
✓ Scribd - 0 documents
✓ DOJ - 1 document
⚠ SEC - blocked (use DOJ alternative)

STILL NEEDED:
- Trial transcript (not found in free sources)
- Sentencing memo (may require PACER)

MANIFEST: {documents_root}/artists/[artist]/albums/[genre]/[album]/manifest.json
```

---

## RECAP 扩展程序

RECAP 浏览器扩展程序通过众包方式收集 PACER 文档。

**其作用**：
- 当任何人查看 PACER 文档时，RECAP 都会将其上传至 CourtListener
- 随后你便可以免费下载

**位置**：`${CLAUDE_PLUGIN_ROOT}/tools/extensions/recap-extension/`

**设置**：
```bash
cd tools/extensions
curl -L "https://github.com/freelawproject/recap-chrome/releases/download/2.8.6/chrome-release.zip" -o recap.zip
unzip recap.zip -d recap-extension
rm recap.zip
```

---

## 输出结构

**位于 `{documents_root}/artists/[artist]/albums/[genre]/[album]/` 中**（不在 git 中）：
```
{documents_root}/artists/[artist]/albums/[genre]/[album]/
├── manifest.json                 # Complete catalog with metadata
├── documentcloud_*.pdf           # From DocumentCloud
├── courtlistener_*.pdf           # From CourtListener
├── doj_*.pdf                     # From DOJ
└── download-documents.py         # Reproducibility script
```

**位于 `{content_root}/.../[album]/SOURCES.md` 中**（在 git 中）：
- 提取的引文及其页码
- 每份文档的来源 URL
- 如下形式的引用：`PDF: {documents_root}/artists/[artist]/albums/[genre]/[album]/indictment.pdf`

### 清单格式

```json
{
  "case_name": "Dorr et al. v. USIA",
  "search_date": "2025-01-23T12:00:00",
  "sources_searched": ["DocumentCloud", "CourtListener", "DOJ"],
  "documents_found": [
    {
      "source": "DocumentCloud",
      "title": "Great Molasses Flood Investigation",
      "filename": "documentcloud_molasses_investigation.pdf",
      "url": "https://...",
      "size": 2400000
    }
  ]
}
```

---

## 故障排除

### 网站被屏蔽
- **SEC.gov**：改用 DOJ 新闻稿（链接到相同文档）
- **Scribd**：可能需要账户；创建账户或跳过
- **CourtListener**：如果 RECAP 中没有该文档，则需要通过 PACER 获取

### 未找到结果
- 尝试其他搜索词（当事人姓名、案件编号）
- 检查案件是否过于久远（早于数字档案时期）
- 某些案件的文档可能已被封存

### 下载失败
- 检查网站是否要求登录
- 尝试通过直接 URL 下载，而不是点击按钮
- 检查是否存在速率限制

---

## 请记住

1. **优先穷尽免费来源** - PACER 按页收费
2. **保存元数据** - 保存 URL、日期和来源，以便引用
3. **不要提交 PDF** - 对 Git 而言文件太大
4. **验证下载内容** - 确保内容与预期文档一致
5. **报告缺失项** - 记录未能找到的内容，以便后续人工跟进