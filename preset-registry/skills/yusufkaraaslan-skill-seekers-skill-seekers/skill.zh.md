---
name: skill-builder
description: Automatically detect source types and build AI skills using Skill Seekers. Use when the user wants to create skills from documentation, repos, PDFs, videos, or other knowledge sources.
---
# Skill Builder

你可以访问 Skill Seekers MCP 服务器，它提供了 40 个工具，用于将知识源转换为可直接供 AI 使用的技能。

## 何时使用此技能

当用户出现以下情况时使用此技能：
- 想要基于文档站点、GitHub 仓库、PDF、视频或其他来源创建 AI 技能
- 需要将文档转换为适合 LLM 使用的格式
- 想要更新现有技能或使其与源文档保持同步
- 需要将技能导出到向量数据库（Weaviate、Chroma、FAISS、Qdrant）
- 询问关于为 AI 抓取、转换或打包文档的问题

## 来源类型检测

根据用户输入自动检测来源类型：

| 输入模式 | 来源类型 | 使用的工具 |
|---------------|-------------|-------------|
| `https://...`（非 GitHub/YouTube） | 文档 | `scrape_docs` |
| `owner/repo` 或 `github.com/...` | GitHub | `scrape_github` |
| `*.pdf` | PDF | `scrape_pdf` |
| YouTube/Vimeo URL 或视频文件 | 视频 | `scrape_video` |
| 本地目录路径 | 代码库 | `scrape_codebase` |
| `*.ipynb`、`*.html`、`*.yaml`（OpenAPI）、`*.adoc`、`*.pptx`、`*.rss`、`*.1`-`.8` | 多种类型 | `scrape_generic` |
| JSON 配置文件 | 统一处理 | 将配置与 `scrape_docs` 配合使用 |

## 推荐工作流

1. 根据用户输入**检测来源类型**
2. 如有需要，使用 `generate_config` 或 `fetch_config` **生成或获取配置**
3. 对文档站点使用 `estimate_pages` **估算规模**
4. 使用相应的抓取工具**抓取来源**
5. 如果用户希望进行 AI 增强改进，使用 `enhance_skill` 进行**增强**
6. 使用 `package_skill` 针对目标平台进行**打包**
7. 如有请求，使用 `export_to_*` 工具**导出到向量数据库**

## 可用的 MCP 工具

### 配置管理
- `generate_config` — 根据 URL 生成抓取配置
- `list_configs` — 列出可用的预设配置
- `validate_config` — 校验配置文件

### 抓取（根据来源类型选用）
- `scrape_docs` — 文档站点
- `scrape_github` — GitHub 仓库
- `scrape_pdf` — PDF 文件
- `scrape_video` — 视频转录文本
- `scrape_codebase` — 本地代码分析
- `scrape_generic` — Jupyter、HTML、OpenAPI、AsciiDoc、PPTX、RSS、man 手册页、Confluence、Notion、聊天

### 后处理
- `enhance_skill` — AI 驱动的技能增强
- `package_skill` — 针对目标平台打包
- `upload_skill` — 上传到平台 API
- `install_skill` — 端到端安装工作流

### 高级功能
- `detect_patterns` — 检测代码中的设计模式
- `extract_test_examples` — 从测试中提取用法示例
- `build_how_to_guides` — 从测试生成操作指南
- `split_config` — 将大型配置拆分为聚焦的技能
- `export_to_weaviate`、`export_to_chroma`、`export_to_faiss`、`export_to_qdrant` — 向量数据库导出
