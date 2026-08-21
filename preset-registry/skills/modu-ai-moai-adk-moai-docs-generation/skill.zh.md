---
name: moai-docs-generation
description: >
  Documentation generation patterns for technical specs, API docs, user guides,
  and knowledge bases using real tools like Sphinx, MkDocs, TypeDoc, and Nextra.
  Use when creating docs from code, building doc sites, or automating
  documentation workflows.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Grep, Glob, Skill, Bash(npm:*), Bash(npx:*), Bash(git:*), Bash(sphinx-build:*), Bash(mkdocs:*), Bash(typedoc:*), mcp__context7__resolve-library-id, mcp__context7__get-library-docs
user-invocable: false
metadata:
  version: "2.1.0"
  category: "workflow"
  status: "active"
  updated: "2026-01-08"
  modularized: "true"
  tags: "workflow, documentation, sphinx, mkdocs, typedoc, api-docs, static-sites"
  context: "fork"
  agent: "general-purpose"
---
# 文档生成模式

## 快速参考（30 秒）

用途：使用成熟的工具和框架生成专业文档。

核心文档工具：
- Python：使用 autodoc 的 Sphinx、使用 Material 主题的 MkDocs、pydoc
- TypeScript/JavaScript：TypeDoc、JSDoc、TSDoc
- API 文档：基于 FastAPI/Express 生成的 OpenAPI/Swagger、Redoc、Stoplight
- 静态站点：Nextra（Next.js）、Docusaurus（React）、VitePress（Vue）
- 通用：Markdown、MDX、reStructuredText

何时使用此 Skill：
- 根据代码注解生成 API 文档
- 构建具有搜索和导航功能的文档站点
- 创建用户指南和技术规范
- 在 CI/CD 流水线中自动更新文档
- 在不同文档格式之间转换

---

## 实施指南（5 分钟）

### 使用 Sphinx 编写 Python 文档

Sphinx 设置和配置：

使用 pip install sphinx sphinx-autodoc-typehints sphinx-rtd-theme myst-parser 安装 Sphinx 和扩展

运行 sphinx-quickstart docs 初始化 Sphinx 项目，该命令会创建基本结构。

使用以下关键设置配置 conf.py：
- 将 extensions 设置为包含 autodoc、napoleon、typehints 和 myst_parser
- 将 html_theme 配置为 sphinx_rtd_theme，以获得专业的外观
- 添加设置为 description 的 autodoc_typehints，以支持内联类型提示

通过对源目录运行 sphinx-apidoc 并将结果输出到 docs/api 来生成 API 文档，然后在 docs 目录中运行 make html。

### 使用 MkDocs 编写 Python 文档

MkDocs Material 设置：

使用 pip install mkdocs mkdocs-material mkdocstrings mkdocstrings-python 安装

创建 mkdocs.yml 配置：
- 设置 site_name 和 site_url
- 使用 name material 和所需的调色板配置 theme
- 添加包括 search 和 mkdocstrings 在内的 plugins
- 使用章节和页面定义 nav 结构

在 Markdown 文件中使用 ::: module.path 的 mkdocstrings 语法，根据文档字符串自动生成 API 文档。

使用 mkdocs serve 在本地提供服务，使用 mkdocs build 进行构建，使用 mkdocs gh-deploy 进行部署。

### 使用 TypeDoc 编写 TypeScript 文档

TypeDoc 设置：

使用 npm install typedoc --save-dev 安装

添加到 package.json scripts：typedoc --out docs/api src/index.ts

使用 typedoc.json 进行配置：
- 将 entryPoints 设置为源文件
- 将 out 配置为 docs/api
- 启用 includeVersion 和 categorizeByGroup
- 将 theme 设置为 default，或安装自定义主题

通过运行 npm run docs:generate 生成文档

### 使用 JSDoc 编写 JavaScript 文档

JSDoc 设置：

使用 npm install jsdoc --save-dev 安装

创建 jsdoc.json 配置：
- 设置 source include 路径和 includePattern
- 配置 templates 和输出目标
- 启用 markdown plugin 以支持丰富的格式

使用带有以下标签的 JSDoc 注释记录函数：
- @param 用于记录参数及其类型和说明
- @returns 用于记录返回值
- @example 用于记录使用示例
- @throws 用于记录错误

### OpenAPI/Swagger 文档

FastAPI 自动文档：

FastAPI 提供自动生成的 OpenAPI 文档。可通过 /docs 访问 Swagger UI，通过 /redoc 访问 ReDoc。

可通过以下方式增强文档：
- 为路由处理程序添加文档字符串
- 使用 response_model 定义类型化响应
- 在 Pydantic 模型的 Config 类中定义示例
- 设置 tags 对端点进行分组
- 在路由装饰器中添加详细描述

使用 app.openapi() 以编程方式导出 OpenAPI 规范，并将其保存到 openapi.json。

在 Express 中使用 Swagger：

安装 swagger-jsdoc 和 swagger-ui-express。

使用 OpenAPI 定义和 API 文件路径配置 swagger-jsdoc。

向路由处理程序添加 @openapi 注释，记录路径、参数和响应。

在 /api-docs 端点提供 Swagger UI。

### 静态文档站点

Nextra（Next.js）：

有关完整的 Nextra 模式，请参考 Skill("moai-library-nextra")。

主要优势：支持 MDX、基于文件系统的路由、内置搜索和主题自定义。

使用 npx create-nextra-app 创建应用，配置 theme.config.tsx，并在 pages 目录中组织页面。

Docusaurus（React）：

使用 npx create-docusaurus@latest my-docs classic 初始化

在 docusaurus.config.js 中进行配置：
- 设置包含标题、标语和 URL 的 siteMetadata
- 使用文档和博客设置配置 presets
- 为导航栏和页脚添加 themeConfig
- 使用 algolia 插件启用搜索

在 docs 文件夹中组织文档，并使用 category.json 文件定义侧边栏结构。

VitePress（Vue）：

使用 npm init vitepress 初始化

在 .vitepress/config.js 中进行配置：
- 设置标题、描述和基础路径
- 定义包含导航和侧边栏的 themeConfig
- 配置搜索和社交链接

使用支持 Vue 组件、代码高亮和 frontmatter 的 Markdown。

---

## 高级模式（10 分钟以上）

### 从 SPEC 文件生成文档

从 MoAI SPEC 文件生成文档的模式：

读取 SPEC 文件内容并提取关键部分：id、title、description、requirements、api_endpoints。

生成结构化 Markdown 文档：
- 根据 description 创建概述部分
- 将 requirements 以功能要点的形式列出
- 使用方法、路径和描述记录每个 API 端点
- 根据端点定义添加使用示例

将生成的文档保存到 docs 目录中的适当位置。

### CI/CD 文档流水线

GitHub Actions 工作流：

创建 .github/workflows/docs.yml，使其在推送到 main 分支且 src 或 docs 路径发生变化时触发。

工作流步骤：
- 检出仓库
- 设置语言运行时（Python、Node.js）
- 安装文档依赖项
- 使用适当的工具生成文档
- 部署到 GitHub Pages、Netlify 或 Vercel

Python/Sphinx 示例：
- 使用 pip install sphinx sphinx-rtd-theme 安装
- 使用 sphinx-build -b html docs/source docs/build 生成
- 使用 actions-gh-pages action 部署

TypeScript/TypeDoc 示例：
- 使用 npm ci 安装
- 使用 npm run docs:generate 生成
- 部署到 Pages

### 文档验证

链接检查：

使用 linkchecker 对 HTML 输出中的本地链接进行验证。

对于 Markdown，请在 pre-commit hooks 中使用 markdown-link-check。

拼写检查：

使用 pyspelling 和 Aspell 进行自动拼写检查。

在 .pyspelling.yml 中为不同文件类型配置 matrix 条目。

文档覆盖率：

对于 Python，使用 interrogate 检查文档字符串覆盖率。

在 pyproject.toml 中配置最低覆盖率阈值。

如果覆盖率低于阈值，则使 CI 构建失败。

### 多语言文档

使用 Nextra 实现国际化：

在 next.config.js 中使用 locales 数组和 defaultLocale 配置 i18n。

在 pages/[locale] 目录中创建特定于语言区域的页面。

使用 next-intl 或类似工具进行翻译。

使用 Docusaurus 实现国际化：

在 docusaurus.config.js 中使用 defaultLocale 和 locales 配置 i18n。

使用 docusaurus write-translations 生成翻译文件。

按照 i18n/[locale] 目录结构组织翻译。

---

## 配合使用效果良好

技能：
- moai-library-nextra - 全面的 Nextra 文档框架模式
- moai-lang-python - Python 文档字符串约定和类型标注
- moai-lang-typescript - TypeScript/JSDoc 文档模式
- moai-domain-backend - 后端服务的 API 文档
- moai-workflow-project - 项目文档集成

智能体：
- manager-docs - 文档工作流编排
- expert-backend - API 端点文档
- expert-frontend - 组件文档

命令：
- /moai:3-sync - 将文档与代码变更同步

---

## 工具参考

Python 文档：
- Sphinx: https://www.sphinx-doc.org/
- MkDocs: https://www.mkdocs.org/
- MkDocs Material: https://squidfunk.github.io/mkdocs-material/
- mkdocstrings: https://mkdocstrings.github.io/

JavaScript/TypeScript 文档：
- TypeDoc: https://typedoc.org/
- JSDoc: https://jsdoc.app/
- TSDoc: https://tsdoc.org/

API 文档：
- OpenAPI Specification: https://spec.openapis.org/
- Swagger UI: https://swagger.io/tools/swagger-ui/
- Redoc: https://redocly.github.io/redoc/
- Stoplight: https://stoplight.io/

静态站点生成器：
- Nextra: https://nextra.site/
- Docusaurus: https://docusaurus.io/
- VitePress: https://vitepress.dev/

风格指南：
- Google Developer Documentation Style Guide: https://developers.google.com/style
- Microsoft Writing Style Guide: https://learn.microsoft.com/style-guide/

---

版本：2.0.0
最后更新：2025-12-30

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “代码本身就是文档” | 代码解释发生了什么。文档解释为什么、何时以及为谁服务。它们面向不同的受众。 |
| “API 文档完全可以从代码生成” | 生成的文档提供结构。上下文、示例和指南需要人工编写。两者都不可或缺。 |
| “我会在功能完成后编写文档” | 功能完成后编写的文档记录已经构建的内容。在开发过程中编写文档，则能在设计缺陷转化为代码之前将其暴露出来。 |
| “反正没人读文档” | 当文档确实存在且容易找到时，人们会阅读它。空白的文档部分会让这种说法成为自我实现的预言。 |
| “让文档与代码同步维护太费力了” | 过时的文档比没有文档更糟。将可以自动化的部分（API 参考）自动化，其余部分则与代码一起编写。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 公共 API 端点没有文档页面
- 文档引用了已不存在的代码
- 生成的 API 文档包含占位符或 Lorem ipsum 文本
- 面向用户的功能没有示例或快速入门部分
- 文档构建产生缺少引用的警告

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 文档构建无错误或警告（展示构建输出）
- [ ] 每个公共 API 都有对应的文档页面
- [ ] 文档中的示例已经过测试，或链接到经过测试的源代码
- [ ] 生成的文档中未残留占位文本
- [ ] 文档与代码变更在同一个提交或 PR 中更新

<!-- moai:evolvable-end -->