---
name: pptx-toolkit
description: >
  Audit PowerPoint (.pptx) decks for slide count, text density, embedded images
  and fonts, hidden slides, speaker notes, and animation density. Use when
  reviewing a board deck, sales deck, or conference talk before sending.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: documents
  domain: document-automation
  updated: 2026-05-04
  python-tools: pptx_auditor.py
  tech-stack: pptx, OOXML
---
# Pptx 工具包

仅使用标准库审查 `.pptx` 文件——无需 `python-pptx`。通过 `zipfile` + `xml.etree` 直接读取 OOXML。

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

pptx、PowerPoint、幻灯片、演示文稿、董事会演示文稿、销售演示文稿、演示文稿审查、幻灯片密度、演讲者备注、动画、隐藏幻灯片

---

## 首先确认

运行审查之前，请确认以下输入。如果任何一项未知或含糊，请询问——不要自行假设：

- [ ] **演示文稿用途（董事会/投资者、销售或会议演讲）**——决定密度上限、演讲者备注覆盖率和动画限制（评分标准因类型而异）
- [ ] **交付场景（发送给他人阅读，还是依据备注进行现场演示）**——影响是否可以接受内容极少的幻灯片和动画
- [ ] **是否应交付隐藏幻灯片**——用于区分有意保留的备用幻灯片与叙事中遗留的冗余内容

停止规则：只询问对输出影响最大的 2-3 项。如果用户说“直接起草”，则继续执行，并在产出物顶部列出你的假设。

## 快速开始

```bash
python scripts/pptx_auditor.py deck.pptx
```

输出：幻灯片数量、隐藏幻灯片数量、含演讲者备注的幻灯片、每张幻灯片的字数（含逐页明细）、图像和嵌入式媒体数量、动画节点数量、主题名称。

---

## 核心工作流

### 工作流 1：会前演示文稿审查

**目标：** 找出会让演示文稿在现场显得不专业的问题——内容过载的幻灯片、缺失的演讲者备注，以及之前版本遗留的隐藏幻灯片。

**步骤：**
1. 运行审查
2. 字数 > 50 的幻灯片 → 标记为需要精简内容
3. 董事会/投资者演示文稿中没有演讲者备注的幻灯片 → 添加备注或标记为“有意留空”
4. 隐藏幻灯片 → 确认是否应以隐藏状态交付，否则删除
5. 整份演示文稿的动画数量 > 100 → 很可能动画过多；进行删减

**预计时间：** 每份演示文稿 5-10 分钟。

### 工作流 2：董事会/投资者演示文稿审查

**目标：** 通过结构化审查记录，按照更高的质量标准检查董事会/投资者演示文稿。

**步骤：**
1. 运行审查；导出 JSON，并与演示文稿一起归档
2. 应用 `references/deck_density_rubric.md` 中的评分标准
3. 标记超出密度上限的幻灯片；精简至每张幻灯片只表达一个观点
4. 搭配 `cs-board-deck-builder` skill 进行叙事审查

**预计时间：** 每份董事会演示文稿 30-60 分钟。

### 工作流 3：会前演讲演示文稿检查

**目标：** 使演示文稿达到登台标准——移除隐藏/删减的幻灯片、完善演讲者备注，并确保动画可排练。

**步骤：**
1. 运行审查；确保幻灯片数量符合试讲的时间预算
2. 演讲者备注覆盖率 > 90%（适用于依据备注进行演讲的场景）
3. 整场演讲的动画数量控制在 50 个以内（更多动画会增加台上发生时间配合失误的风险）
4. 嵌入式视频/音频：确认文件存在且可在本地播放

**预计时间：** 排练前 15 分钟。

---

## 工具

### pptx_auditor.py

将 `.pptx` 文件作为 ZIP 归档读取，并直接解析 OOXML。无需外部依赖。

```bash
python scripts/pptx_auditor.py deck.pptx
python scripts/pptx_auditor.py deck.pptx --json
```

**报告内容：**
- 幻灯片数量和隐藏幻灯片数量
- 包含演讲者备注的幻灯片（数量和百分比）
- 每张幻灯片的字数（平均值、最大值、完整分布）
- 内容最密集的前 N 张幻灯片
- 图片/嵌入媒体数量
- 动画计时节点数量
- 主题名称

---

## 参考指南

- **`references/deck_density_rubric.md`** — 按演示文稿用途（董事会、销售、演讲、培训）提供的每张幻灯片字数指南；动画设计理念；演讲者备注模式

---

## 模板

- **`assets/deck_handoff_checklist.md`** — 会前演示文稿签核检查清单

---

## 最佳实践

- **每张幻灯片只表达一个观点。** 如果你无法用一句话概括某张幻灯片，那么它就包含了不止一个观点。
- **演讲者备注就是文档。** 没有备注的幻灯片会让读者（会后）只能猜测当时的讲解内容。
- **发送前删除隐藏幻灯片。** 隐藏幻灯片通常是为“以防万一”而保留的旧版本——它们会一直留存，并泄露叙事上下文。
- **动画会带来时序风险。** 每个动画都可能导致现场演示与演讲者的讲解不同步。

---

## 集成点

- 与 `c-level-advisor/board-deck-builder` 配合，用于董事会/投资者演示文稿
- 与 `marketing/launch-strategy` 配合，用于发布演示文稿审查
- 由 `cs-pr-comms-lead` 用于新闻/合作伙伴演示文稿