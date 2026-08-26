---
name: blog-notebooklm
description: >
  Query Google NotebookLM notebooks for source-grounded, citation-backed
  answers from user-uploaded documents. Manages notebook library, handles
  Google authentication, and supports smart discovery. Works standalone
  via /blog notebooklm or internally from blog-write and blog-researcher
  for source-grounded research context. Falls back gracefully when not configured.
  Use when user says "notebooklm", "notebook", "query notebook",
  "ask notebook", "notebook research", "source grounded research",
  "document query", "notebook library".
user-invokable: true
argument-hint: "[ask|discover|library|setup|status|cleanup] [question-or-url]"
license: MIT
metadata:
  author: AgriciDaniel
  version: "2.2.0"
  source: "https://github.com/PleasePrompto/notebooklm-skill"
---
# Blog NotebookLM：基于文档的来源支撑研究

直接从 Claude Code 查询 Google NotebookLM 笔记本，获取 Gemini 提供的有引用支持的答案。每个问题都会打开一个无头浏览器会话，从你上传的文档中检索答案，然后关闭会话。返回的内容是有来源支撑的模型回答，而不是事实真相的证明：上传的文档可能是一手资料，也可能是二手资料，并且答案仍可能遗漏上下文。

只有当返回的引用指向可验证的底层来源时，答案才会提供可用的来源依据。当相关细节会影响验证或解读时，请记录稳定的来源 URL，以及出版日期、研究期间或检索日期。使用底层来源的标题作为行内引用。对于公开内容，不要将私有的 NotebookLM URL 作为参考文献条目。

## 快速参考

| 命令 | 功能 |
|---------|-------------|
| `/blog notebooklm ask <question>` | 查询笔记本以获取有来源支撑的答案 |
| `/blog notebooklm discover <url>` | 在编目之前智能发现笔记本内容 |
| `/blog notebooklm library list` | 列出库中的所有笔记本 |
| `/blog notebooklm library add <url>` | 将笔记本添加到库中 |
| `/blog notebooklm library search <query>` | 按关键词搜索笔记本 |
| `/blog notebooklm library remove <id>` | 从库中移除笔记本 |
| `/blog notebooklm setup` | 一次性 Google 身份验证（浏览器可见） |
| `/blog notebooklm status` | 检查身份验证状态 |
| `/blog notebooklm cleanup` | 清理浏览器状态（保留库） |

## 前置条件

- 拥有可访问 NotebookLM 的 Google 账号
- Python 3.11+（由 `run.py` 自动管理 venv）
- Google Chrome（首次运行时通过 Patchright 自动安装）
- 一次性身份验证设置（在可见浏览器中进行交互式 Google 登录）

## 使用 run.py 包装器

只能通过 run.py 包装器调用脚本：`python3 scripts/run.py [script]`：

```bash
# CORRECT:
python3 scripts/run.py auth_manager.py status
python3 scripts/run.py ask_question.py --question "..."

# Do not call files under scripts/ directly. The wrapper owns venv setup.
```

`run.py` 包装器会自动创建 `.venv`、安装依赖、设置 Chrome，并执行目标脚本。

## 身份验证检查（门控模式）

在执行任何查询操作之前，检查身份验证状态：

```bash
python3 scripts/run.py auth_manager.py status
```

- 如果已通过身份验证：继续执行查询
- 如果未通过身份验证：告知用户并引导其进行设置：
  "NotebookLM requires Google login. Run `/blog notebooklm setup` to authenticate."
- **内部调用时**（来自 blog-write 或 blog-researcher）：如果未通过身份验证，则静默返回且不报错。绝不要阻塞写作工作流。

## 设置工作流

对于 `/blog notebooklm setup`：

```bash
# Opens a visible browser for manual Google login (one-time)
python3 scripts/run.py auth_manager.py setup
```

告知用户："A browser window will open. Please log in to your Google account."
身份验证通过浏览器配置文件和 cookie 注入持久化（混合方式）。

其他身份验证命令：
```bash
python3 scripts/run.py auth_manager.py status   # Check auth
python3 scripts/run.py auth_manager.py reauth   # Re-authenticate
python3 scripts/run.py auth_manager.py clear     # Clear all auth data
```

## 查询工作流

对于 `/blog notebooklm ask <question>`：

### 第 1 步：检查身份验证
运行身份验证检查（参见上面的门控模式）。如果尚未通过身份验证，请引导用户完成设置。

### 第 2 步：解析 Notebook
确定要查询的 notebook：
- 如果提供了 `--notebook-url`：验证它是否为 NotebookLM notebook URL，然后使用该 URL
- 如果提供了 `--notebook-id`：在库中查找
- 如果两者都未提供：使用库中的活动 notebook
- 如果没有活动 notebook：显示库并要求用户选择

### 第 3 步：提出问题
```bash
# Basic query (uses active notebook)
python3 scripts/run.py ask_question.py --question "Your question here"

# Query specific notebook by ID
python3 scripts/run.py ask_question.py --question "..." --notebook-id notebook-id

# Query by URL directly
python3 scripts/run.py ask_question.py --question "..." --notebook-url "https://..."

# JSON output (for internal/programmatic use)
python3 scripts/run.py ask_question.py --question "..." --json

# Show browser for debugging
python3 scripts/run.py ask_question.py --question "..." --show-browser
```

### 第 4 步：分析并继续追问
每个响应都会以一个后续提示结束。**必须执行以下操作：**
1. **停止**：不要立即向用户作答
2. **分析**：将答案与用户的原始请求进行比较
3. **识别信息缺口**：确定是否需要更多信息
4. **提出后续问题**：如果存在信息缺口，立即提出后续问题
5. **重复**：持续进行，直到信息完整
6. **综合**：整合所有答案后再向用户作答

## 智能发现工作流

对于 `/blog notebooklm discover <url>`：

在不知道 notebook 内容的情况下添加 notebook 时，先查询其内容：

```bash
# Step 1: Discover content
python3 scripts/run.py ask_question.py \
  --question "What is the content of this notebook? What topics are covered? Provide a complete overview briefly and concisely" \
  --notebook-url "<URL>"

# Step 2: Add with discovered metadata
python3 scripts/run.py notebook_manager.py add \
  --url "<URL>" \
  --name "<Based on content>" \
  --description "<Based on content>" \
  --topics "<Extracted topics>"
```

不要猜测描述；请先进行发现或询问用户。

## 库管理

```bash
# List all notebooks
python3 scripts/run.py notebook_manager.py list

# Add notebook (all params required -- discover or ask user!)
python3 scripts/run.py notebook_manager.py add \
  --url "https://notebooklm.google.com/notebook/..." \
  --name "Descriptive Name" \
  --description "What this notebook contains" \
  --topics "topic1,topic2,topic3"

# Search by keyword
python3 scripts/run.py notebook_manager.py search --query "keyword"

# Set active notebook
python3 scripts/run.py notebook_manager.py activate --id notebook-id

# Remove notebook
python3 scripts/run.py notebook_manager.py remove --id notebook-id

# Library statistics
python3 scripts/run.py notebook_manager.py stats
```

## Internal API（用于 blog-write / blog-researcher）

作为来自 blog-write 或 blog-researcher 的 Task 子代理调用时：

**Input**（由调用 skill 提供）：
- `question`：与博客主题相关的研究问题
- `notebook_id` 或 `notebook_url`：要查询的 notebook
- `context`：`"internal"`（表示优雅降级模式）

**Process:**
1. 检查 auth 状态：如果未通过身份验证，则静默返回空结果
2. 使用研究问题查询 notebook
3. 解析并返回结构化响应

**Output**（返回给调用 skill）：
```markdown
### NotebookLM Research
- **Source:** [Notebook name]
- **Question:** [What was asked]
- **Answer:** [Source-grounded response from user's documents]
- **Underlying Source:** [Public source URL or document identifier]
- **Underlying Source Date:** [Publication date or retrieval date]
- **Source Quality:** [Tier 1-3 after classifying the underlying document]
```

**Graceful fallback:** 如果缺少 auth 或查询失败，则立即返回，
不显示错误。调用方工作流将继续使用基于 WebSearch 的研究。
绝不要因为 NotebookLM 不可用而阻塞 blog-write 或 blog-rewrite。

## Data Storage

所有数据都存储在 skill 目录中：
- `data/library.json`：Notebook 元数据和库
- `data/auth_info.json`：身份验证状态
- `data/browser_state/`：包含 cookies 的 Chrome 配置文件

**Security：**所有数据目录都已加入 gitignore。绝不要提交 auth 或浏览器状态。

浏览器生命周期和已通过身份验证的上下文隔离由
`scripts/browser_session.py` 统一管理。命令脚本必须使用该辅助程序，而不是
打开额外的持久化配置文件或将 cookies 复制到其他文件中。

## Error Handling

| Error | Resolution |
|-------|-----------|
| 未通过身份验证 | 运行 `/blog notebooklm setup` |
| ModuleNotFoundError | 始终使用 `run.py` 包装器 |
| 浏览器崩溃 | 运行 `cleanup_manager.py --confirm --preserve-library`，然后重新进行身份验证 |
| 速率限制（50/天） | 等待至太平洋时间午夜，或切换 Google 账号 |
| 未找到 notebook | 使用 `notebook_manager.py list` 检查 |
| 查询超时（120 秒） | 使用更简单的问题重试，或使用 `--show-browser` 进行调试 |
| MCP 不可用（内部） | 静默返回：写作工作流会使用 WebSearch |

## Limitations

- 不会持久化会话（每个问题都会创建新的浏览器会话）
- 免费 Google 账号存在速率限制（每天 50 次查询）
- 需要手动上传（用户必须将文档添加到 NotebookLM 网页界面）
- 浏览器开销（启动和销毁每个问题需要几秒钟）
- 仅限本地 Claude Code（网页界面不可用）

## Reference Documentation

按需加载：不要在启动时全部加载：
- `references/commands.md`：完整的 CLI 命令、参数和工作流模式
- `references/troubleshooting.md`：错误解决方案、恢复流程和调试