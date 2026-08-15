---
name: code-context
description: This skill should be used when the user asks to "understand a codebase", "get code context", "research a library", "explore a repository", "find code examples", "look up documentation", asks a natural-language code/technology question (e.g. "how does X work", "X vs Y", "best practice for Z"), or wants to understand how a specific project, library, or concept works before making changes.
user-invocable: false
---
# 代码上下文检索

此技能提供 5 种检索代码上下文的方法。请根据目标选择相应的方法：公共 GitHub 仓库、库文档、代码搜索、直接检查，或克隆后的 Web 信息补充。

## Token 隔离（关键）

切勿在主上下文中运行任何外部查询。始终启动 Task 智能体：

- **DeepWiki**：智能体调用 `read_wiki_structure` / `read_wiki_contents` / `ask_question`，提取架构摘要和关键关系，并返回简洁概览。
- **Context7**：智能体先调用 `resolve-library-id`，然后调用 `query-docs`，提取最精简且可用的 API 范围和用法示例，并返回可复制的代码片段及版本说明。
- **Exa**：智能体调用 `get_code_context_exa`，提取最精简且可用的代码片段，对近乎相同的结果（镜像、分叉、重复的 StackOverflow 回答）进行去重，并返回可复制的代码片段和简要说明。
- **Git clone**：智能体将仓库克隆到 `/tmp/`，读取入口点和核心模块，运行 `rm -rf` 进行清理，并返回文件结构摘要和关键模式。
- **Web Search+Fetch**：智能体使用根据克隆结果生成的、带版本限定的查询运行 `WebSearch`，对高价值 URL 调用 `WebFetch`，并且仅返回与已克隆代码交叉核验过的有效信息。

无论搜索量有多大，主上下文都能保持整洁。只有最终摘要会返回给调用方。

## 方法 1：DeepWiki（AI 驱动的仓库文档）

最适合：需要快速获取架构概览、组件说明或高层次理解的知名公共 GitHub 仓库。

**工具**：`read_wiki_structure`、`read_wiki_contents`、`ask_question`

**流程**：
1. 使用 owner/repo（例如 `"facebook/react"`）调用 `read_wiki_structure`，获取主题列表
2. 针对相关主题调用 `read_wiki_contents`，或使用 `ask_question` 进行定向查询
3. 在需要以下内容时使用：架构图、组件关系、设计决策

**优势**：无需配置，可即时获得 AI 总结的文档，适合快速熟悉陌生仓库。

**局限性**：仅适用于公共 GitHub 仓库；覆盖程度因项目受欢迎程度而异。

## 方法 2：Context7（库文档）

最适合：获取 npm/pip 软件包和框架的最新 API 文档、用法示例及特定版本文档。

**工具**：`resolve-library-id`、`query-docs`

**流程**：
1. 使用库名称（例如 `"react"`、`"fastapi"`）调用 `resolve-library-id`，获取规范 ID
2. 当用户指定版本时（例如 `"react@18"`），从 `resolve-library-id` 返回的 `versions` 列表中选择匹配的版本，并将其追加到库 ID 路径中（例如 `/facebook/react/18.3.1`）
3. 使用 `libraryId` 和 `query` 调用 `query-docs`——这是仅有的两个参数

**查询技巧**：查询要具体——`"useCallback dependency array"` 优于 `"react hooks"`。如果已知框架版本，请将其包含在查询中。

**版本固定**：将版本编码到库 ID 路径中（例如 `/vercel/next.js/v14.3.0-canary.87`），而不是将其作为单独参数。使用 `resolve-library-id` 返回的 `versions` 列表选择正确的 slug。

**优势**：文档始终保持最新，支持版本固定，涵盖数千个库，非常适合查询 API 参考资料。

**局限性**：要求库已被索引；对于内部/私有软件包用处较小。

## 方法 3：Exa 代码搜索（全网代码示例）

最适合：查找真实场景中的使用模式、StackOverflow 风格的答案、GitHub Gist 示例，以及来自全网的代码片段。

**工具**：`get_code_context_exa`

**设置**：无需 API 密钥即可使用（免费层有速率限制）。如需更高限额，请设置 `EXA_API_KEY` 环境变量。

**流程**：
1. 使用精确的查询调用 `get_code_context_exa`
2. 根据需要设置 `tokensNum`：快速获取示例时设为 3000，全面查找模式时设为 8000
3. 核实结果的发布日期；优先选择近期来源

**查询编写指南**：
- 包含语言或框架：使用 `"TypeScript React"`，而不只是 `"React"`
- 在相关时包含版本：`"Next.js 14 app router"`
- 使用准确的标识符：使用 `"useServerAction"`，而不是 `"server action hook"`
- 添加模式类型：`"example"`、`"error handling"`、`"migration guide"`
- 示例：`"TypeScript Next.js 14 app router server action error handling example"`

**优势**：能够找到多样化的真实场景示例，不局限于官方文档，并可呈现社区解决方案。

**局限性**：结果可能已过时；务必检查发布日期，并对照官方文档进行验证。

## 方法 4：Git 克隆（直接检查代码）

最适合：私有仓库、详细的实现审查、运行本地分析，或其他方法缺乏足够深度时。

**流程**：
1. 运行 `git clone <repo-url> /tmp/<repo-name> --depth=1` 获取代码
2. 阅读关键文件：入口点、配置、核心模块
3. 梳理文件结构，并在整个代码库中搜索相关模式
4. 完成后进行清理：`rm -rf /tmp/<repo-name>`

**优势**：可完整访问代码，支持私有仓库（需提供凭据），并可使用静态分析工具。

**局限性**：需要网络访问和磁盘空间；对于大型仓库速度较慢；私有仓库需要凭据。

## 方法 5：网页搜索 + 获取

最适合：概念、原理、“最佳实践”类问题、变更日志、Issue 讨论、博客文章，以及位于源代码之外的迁移指南。提供两种模式：
- **独立使用**——对于询问“为什么”/“Z 的最佳实践”/“比较 X 与 Y”且无需克隆仓库的自然语言目标，将其作为主要方法。
- **克隆后补充**——作为方法 4 之后的辅助方法：克隆提供代码，此方法则提供其背后的*原因*以及*发生了哪些变化*。

**工具**：`WebSearch`、`WebFetch`

**适用时机**：对于概念/原理/最佳实践类查询，可独立使用；在需要使用源代码中未包含的上下文来补充仓库检查时，于克隆后使用。

**流程**：
1. 构建有针对性的查询——在克隆后模式中，根据克隆分析结果构建（使用源代码中发现的准确标识符、错误字符串或设计模式）；在独立模式中，直接根据自然语言目标构建
2. 调用 `WebSearch`，将 `query` 设置为精确且锚定版本的字符串（例如 `"<library> <version> breaking change <symbol>"`）
3. 对于每个高信号结果，使用搜索结果中的 `url` 调用 `WebFetch`，并提供聚焦的 `prompt`，仅提取相关部分
4. 如有克隆的代码，将获取的内容与其交叉核对；否则与官方文档交叉核对
5. 除非主题稳定或具有基础性，否则丢弃早于 2 年的结果

**查询模式**：
- 变更日志：`"<repo-name> CHANGELOG v<version>"` 或 `"<repo-name> release notes"`
- 设计原理：`"<repo-name> <concept> why OR rationale site:github.com"`
- 已知问题：`"<repo-name> <symbol or pattern> issue OR bug site:github.com"`
- 迁移：`"<repo-name> migrate from <old-version> to <new-version>"`

**优势**：能够发现源代码中从未出现的上下文——弃用通知、上游问题讨论串、作者博客文章、社区迁移经验。

**局限性**：结果可能已过时或不准确；务必根据实际克隆的代码验证获取到的信息。没有 API 密钥时会受到速率限制。

## 目标分类

每个输入目标都属于以下三种类型之一。选择方法前先进行分类：

- **仓库目标**——`owner/repo` 标识或 git URL。使用 DeepWiki（公开仓库）或 Git Clone（私有仓库／需要更深入的细节）。
- **库目标**——单独的软件包／框架名称，可以是 `name@version`。使用 Context7；将版本编码到 libraryId 路径中。
- **自然语言目标**——问题、比较或概念（“X 如何工作”“X 与 Y 的比较”“Z 的最佳实践”）。使用 Exa 查找代码模式；使用 Web Search+Fetch 查找设计原理、变更日志和“为什么”类问题。如果查询中指定了某个库，还应运行 Context7 以获取其规范的 API 接口。

当调用方传入 `--method=` 时，只能使用允许的方法与适用方法的交集。如果某个目标的交集为空，则跳过该目标的外部查询，并报告没有适用的允许方法。

## 方法选择指南

| 场景 | 首选方法 | 备用方法 |
|----------|---------------|----------|
| “X 库如何工作？” | Context7 | DeepWiki |
| “了解 Y 仓库的架构” | DeepWiki | Git Clone |
| “查找 Z 模式的示例” | Exa | Context7 |
| “检查私有／内部仓库” | Git Clone | - |
| “库的 v3 版本发生了哪些变化？” | Context7 | Exa |
| “模块之间是如何连接的？” | DeepWiki | Git Clone |
| “为什么做出这一设计决策？” | Git Clone → Web Search+Fetch | DeepWiki |
| “不同版本之间出现了哪些破坏性变化？” | Web Search+Fetch | Context7 |
| “比较 X 与 Y”（自然语言） | Exa + Context7 | Web Search+Fetch |
| “Z 的最佳实践”（自然语言） | Web Search+Fetch | Exa |

## 组合使用方法

为了获取全面的上下文，可组合使用多种方法：
1. 使用 DeepWiki 获取架构概览
2. 使用 Context7 获取具体的 API 细节
3. 使用 Exa 获取社区使用模式
4. 在需要时使用 Git Clone 获取实现细节

始终优先采用非破坏性的只读操作。克隆时使用 `/tmp`，并在完成后清理。