---
name: skill-builder
description: Automatically detect source types and build AI skills using Skill Seekers. Use when the user wants to create skills from documentation, repos, PDFs, videos, or other knowledge sources.
---
# Skill Builder

本技能使用 Skill Seekers MCP 服务器，该服务器提供 40 个工具，用于将知识源转换为可供 AI 使用的技能。如果 MCP 工具不可用，请改用本文件底部的 CLI 回退方案——不要停止。

## 前提条件

以下 MCP 工具仅在 Skill Seekers MCP 服务器已连接时可用：

1. 安装该软件包：`pip install "skill-seekers[mcp]"`
2. 连接服务器：
   - 作为 Skill Seekers 插件安装的？无需任何操作——插件自带的 `.mcp.json` 会自动启动服务器（但仍需完成步骤 1）。
   - 独立安装的（例如复制到 `~/.claude/skills/`）？只需注册一次服务器：`claude mcp add skill-seekers -- python -m skill_seekers.mcp.server_fastmcp`

如果 `scrape_docs` 或 `package_skill` 等工具不在你的工具列表中，说明服务器未连接。请将上述两个步骤告知用户，并在此期间使用 CLI 回退方案。

## 何时使用本技能

当用户有以下需求时使用本技能：
- 想从文档站点、GitHub 仓库、PDF、视频或其他来源创建 AI 技能
- 需要将文档转换为适合 LLM 使用的格式
- 想根据源文档更新或同步现有技能
- 需要将技能导出到向量数据库（Weaviate、Chroma、FAISS、Qdrant）
- 询问如何为 AI 抓取、转换或打包文档

## 源类型检测

根据用户输入自动检测源类型：

| 输入模式 | 源类型 | 使用的工具 |
|---------------|-------------|-------------|
| `https://...`（非 GitHub/YouTube） | 文档 | `scrape_docs` |
| `owner/repo` 或 `github.com/...` | GitHub | `scrape_github` |
| `*.pdf` | PDF | `scrape_pdf` |
| YouTube/Vimeo 链接或视频文件 | 视频 | `scrape_video` |
| 本地目录路径 | 代码库 | `scrape_codebase` |
| `*.ipynb`、`*.html`、`*.yaml`（OpenAPI）、`*.adoc`、`*.pptx`、`*.rss`、`*.1`-`.8` | 多种 | `scrape_generic` |
| JSON 配置文件 | 统一 | 使用配置文件配合 `scrape_docs` |

## 推荐工作流程

1. 从用户输入中**检测源类型**
2. 如有需要，使用 `generate_config` 或 `fetch_config` **生成或获取配置**
3. 针对文档站点，使用 `estimate_pages` **估算范围**
4. 使用合适的抓取工具**抓取源**
5. 如果用户需要 AI 驱动的改进，使用 `enhance_skill` 进行**增强**
6. 使用 `package_skill` 为目标平台进行**打包**
7. 如有要求，使用 `export_to_*` 工具**导出到向量数据库**

## 可用的 MCP 工具

### 配置管理
- `generate_config` — 从 URL 生成抓取配置
- `list_configs` — 列出可用的预设配置
- `validate_config` — 验证配置文件

### 抓取（根据源类型选用）
- `scrape_docs` — 文档站点
- `scrape_github` — GitHub 仓库
- `scrape_pdf` — PDF 文件
- `scrape_video` — 视频转录文本
- `scrape_codebase` — 本地代码分析
- `scrape_generic` — Jupyter、HTML、OpenAPI、AsciiDoc、PPTX、RSS、manpage、Confluence、Notion、聊天

### 后处理
- `enhance_skill` — AI 驱动的技能增强
- `package_skill` — 为目标平台打包
- `upload_skill` — 上传到平台 API
- `install_skill` — 端到端安装工作流程

### 高级功能
- `detect_patterns` — 代码中的设计模式检测
- `extract_test_examples` — 从测试中提取使用示例
- `build_how_to_guides` — 从测试生成操作指南
- `split_config` — 将大型配置拆分为聚焦的技能
- `export_to_weaviate`、`export_to_chroma`、`export_to_faiss`、`export_to_qdrant` — 向量数据库导出

## CLI 回退方案（MCP 服务器未连接）

同样的流程也可以通过命令行使用（需要 `pip install skill-seekers`）。使用 Bash 工具运行：

```bash
skill-seekers create <source>                      # auto-detects: URL, owner/repo, ./path, file.pdf, video URL, ...
skill-seekers package <skill_dir> --target claude  # or gemini/openai/langchain/chroma/...
```

`create` 一步完成检测、抓取和构建；添加 `--enhance-level 0` 可跳过 AI 增强。完成后，读取生成的 `SKILL.md` 并总结所创建的内容。
