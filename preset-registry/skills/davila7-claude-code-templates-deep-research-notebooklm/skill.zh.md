---
name: deep-research-notebooklm
description: "Deep research skill powered by NotebookLM MCP. Conducts structured multi-source research (market analysis, competitive intel, trend analysis, prospect research) using Google NotebookLM as the research engine, then delivers formatted briefs and optional studio artifacts (slides, audio podcasts, videos, infographics, reports, mind maps)."
---
# 通过 NotebookLM 进行深度研究

使用 NotebookLM MCP 服务器深入研究 **$ARGUMENTS**，并交付一份结构化的研究简报。还可选择根据研究结果生成工作室制品（幻灯片、音频播客、视频、信息图、报告、思维导图）。

## 前置条件

- 必须配置 **NotebookLM MCP server**。通过以下命令安装：`nlm setup add claude-code`
- 如果 NotebookLM MCP 工具不可用，请告知用户运行该设置命令并重启会话。

## 研究工作流

### 第 1 步：定义范围

根据用户的请求确定**研究类型**：

| 类型 | 重点 |
|------|-------|
| **市场研究** | 行业趋势、市场规模、机会、TAM/SAM/SOM |
| **竞争情报** | 竞争对手分析、定位空白、功能对比 |
| **客户/潜在客户研究** | 公司背景、痛点、决策者、近期新闻 |
| **趋势分析** | 技术趋势、采用模式、预测、新兴参与者 |
| **提案研究** | 提案背景、特定行业数据、案例研究 |
| **学术/技术研究** | 论文、框架、方法论、当前最先进水平 |

告知用户你计划研究的内容，并确认研究角度：

> “我将研究[主题]。我的角度是：[具体重点]。我将调查：[2-3 个具体问题]。这样合适吗，还是需要我调整？”

等待确认后再继续。

### 第 2 步：创建 NotebookLM 笔记本

使用 `notebook_create` 创建一个具有以下名称的笔记本：
`Research: [Topic] - [YYYY-MM-DD]`

### 第 3 步：添加背景来源

使用 `source_add` 为笔记本添加相关背景信息：
- 添加用户提供的所有 URL（文章、公司页面、报告）
- 添加用户提及的所有文档或文件
- 如果没有可用的 URL，则添加相关背景的文本摘要
- 如果研究某家公司，请添加其网站、LinkedIn 页面和近期新闻稿

### 第 4 步：开展研究

使用 `research_start`，根据主题和背景构建精心设计的查询。

**模式选择：**
- 默认：`"fast"`（约 60 秒，约 10 个来源）——适合大多数查询
- 仅当用户明确要求进行详尽研究时才使用 `"deep"`（可能需要 10 分钟以上，并可能停滞在 0 个来源）

**提示：** 在研究引擎运行期间，并行执行直接的 `WebSearch` 调用，以更快地完成初始数据收集。

轮询 `research_status` 直至完成。使用 `query` 参数作为后备匹配方式——任务 ID 在调用 `research_start` 和 `research_status` 之间可能会发生变化。

### 第 5 步：导入发现的来源

使用 `research_import` 将发现的来源导入笔记本，以进行更深入的分析。

### 第 6 步：查询洞察

使用 `notebook_query` 根据研究类型提出 3-5 个有针对性的问题：

1. **概览**：“关于[主题]有哪些关键发现？”
2. **机会**：“这一领域存在哪些机会或空白？”
3. **行动**：“这项研究中最具可操作性的洞察是什么？”
4. **风险**：“主要的风险、挑战或反对意见是什么？”
5. **自定义**：一个与研究类型相关的问题（例如，在竞争情报研究中询问：“排名前 5 的竞争对手是谁，他们如何实现差异化？”）

### 第 7 步：撰写研究简报

使用研究简报模板将研究结果保存到本地文件：

**文件路径：** `research/[topic-slug]-[YYYY-MM-DD].md`

使用 [research-brief-template.md](research-brief-template.md) 中的模板组织输出。如果 `research/` 目录不存在，请创建该目录。

### 第 8 步：呈现要点

保存后，向用户呈现：
- **3-5 条核心发现**（使用项目符号，直接明了，不说废话）
- **1-2 项建议行动**，与用户陈述的目标相关联
- **意外或反常识的发现**——任何挑战既有假设的内容
- **完整简报的保存文件路径**
- **NotebookLM 笔记本 URL**，以便用户直接探索来源

### 第 9 步（可选）：生成 Studio 成果

询问用户：“需要我根据这项研究生成任何成果吗？可选类型：幻灯片、音频（播客）、视频、信息图、报告、思维导图。”

如果用户同意，请使用 `studio_create`，并传入第 2 步中的 notebook_id。

**可用的成果类型和推荐设置：**

| 类型 | 关键参数 | 最适合 |
|------|-----------|----------|
| `slide_deck` | `slide_format`：`detailed_deck` 或 `presenter_slides`；`slide_length`：`short` 或 `default` | 高管演示、客户提案 |
| `audio` | `audio_format`：`deep_dive`、`brief`、`critique` 或 `debate`；`audio_length`：`short`、`default`、`long` | 播客风格的深度探讨、随时随地学习 |
| `video` | `video_format`：`explainer`、`brief`、`cinematic`；`visual_style`：`auto_select`、`classic`、`whiteboard` 等 | 可视化讲解、社交媒体内容 |
| `infographic` | `orientation`：`landscape`、`portrait`、`square`；`infographic_style`：`professional`、`bento_grid` 等 | 单页材料、社交分享 |
| `report` | `report_format`：`Briefing Doc`、`Study Guide`、`Blog Post`、`Create Your Own` | 书面交付物、摘要 |
| `mind_map` | `title` | 可视化知识梳理 |

**所有成果类型的通用参数：**
- `language`：设置为用户的首选语言（例如 `"en"`、`"es"`、`"pt"`）
- `focus_prompt`：清晰说明成果中需要重点突出的内容
- `confirm`：必须设为 `true` 才能继续生成

**创建成果后：**
1. 轮询 `studio_status`，直至状态为 `completed`（音频/视频：5-15 分钟；幻灯片/信息图：2-5 分钟）
2. 如需保存到本地，请使用 `download_artifact`
3. 提供笔记本 URL，以便用户直接访问成果

**提示：**
- 使用 `deep_dive` 格式的 `audio` 可生成最佳的播客风格分析
- 使用 `detailed_deck` 格式的 `slide_deck` 最适合独立阅读；`presenter_slides` 更适合与演讲者备注配合使用
- 音频完成后，状态可能显示为 `"unknown"`——应检查是否存在 `audio_url`，而不是等待状态变为 `"completed"`

## 注意事项

- 建议默认使用快速模式。深度模式功能强大，但可能需要 10 分钟以上，并且偶尔会停滞。
- 开始前始终与用户确认研究范围——范围明确的查询能产生显著更好的结果。
- 研究简报模板可确保所有研究类型都能产出一致且可操作的结果。

## 其他资源

- [research-brief-template.md](research-brief-template.md) -- 用于组织研究简报输出的模板