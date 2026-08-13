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
  version: "2.1.1"
  source: "https://github.com/PleasePrompto/notebooklm-skill"
---
# Blog NotebookLM：基于文档来源的研究

直接从 Claude Code 查询 Google NotebookLM 笔记本，通过 Gemini 获取带引文支持的答案。每个问题都会打开一个无头浏览器会话，从你上传的文档中检索答案，然后关闭会话。响应是基于来源的模型答案，并不等同于事实证明：上传的文档可能是第一手或第二手资料，答案仍可能遗漏上下文。

只有当返回的引文能够指向可验证的底层来源时，答案才能提供可用的出处信息。当相关细节会影响验证或解读时，请记录稳定的来源 URL，以及发布日期、研究期或检索日期。使用底层来源的标题作为行内引文。对于公开内容，不要将私有 NotebookLM URL 用作参考文献条目。

## 快速参考

| 命令 | 功能 |
|---------|-------------|
| `/blog notebooklm ask <question>` | 查询笔记本以获取基于来源的答案 |
| `/blog notebooklm discover <url>` | 在编入目录前智能发现笔记本内容 |
| `/blog notebooklm library list` | 列出资料库中的所有笔记本 |
| `/blog notebooklm library add <url>` | 将笔记本添加到资料库 |
| `/blog notebooklm library search <query>` | 按关键字搜索笔记本 |
| `/blog notebooklm library remove <id>` | 从资料库中移除笔记本 |
| `/blog notebooklm setup` | 执行一次性的 Google 身份验证（浏览器可见） |
| `/blog notebooklm status` | 检查身份验证状态 |
| `/blog notebooklm cleanup` | 清理浏览器状态（保留资料库） |

## 前置条件

- 拥有 NotebookLM 访问权限的 Google 账号
- Python 3.11+（由 `run.py` 自动管理 venv）
- Google Chrome（首次运行时通过 Patchright 自动安装）
- 一次性的身份验证设置（在可见浏览器中以交互方式登录 Google）

## 使用 run.py 包装器

只能通过 run.py 包装器调用脚本：`python3 scripts/run.py [script]`：

```bash
# CORRECT:
python3 scripts/run.py auth_manager.py status
python3 scripts/run.py ask_question.py --question "..."

# Do not call files under scripts/ directly. The wrapper owns venv setup.
```

`run.py` 包装器会自动创建 `.venv`、安装依赖项、设置 Chrome，并执行目标脚本。

## 身份验证检查（门控模式）

在执行任何查询操作前，请检查身份验证状态：

```bash
python3 scripts/run.py auth_manager.py status
```

- 如果已通过身份验证：继续执行查询
- 如果未通过身份验证：通知用户并引导其完成设置：
  “NotebookLM 需要登录 Google。请运行 `/blog notebooklm setup` 进行身份验证。”
- **在内部调用时**（从 blog-write 或 blog-researcher 调用）：如果未通过身份验证，则静默返回且不报错。绝不能阻塞写作工作流。

## 设置工作流

对于 `/blog notebooklm setup`：

```bash
# Opens a visible browser for manual Google login (one-time)
python3 scripts/run.py auth_manager.py setup
```

告知用户：“将打开一个浏览器窗口。请登录你的 Google 账号。”
身份验证通过浏览器配置文件与 Cookie 注入的混合方式持久保存。

其他身份验证命令：
```bash
python3 scripts/run.py auth_manager.py status   # Check auth
python3 scripts/run.py auth_manager.py reauth   # Re-authenticate
python3 scripts/run.py auth_manager.py clear     # Clear all auth data
```

## 查询工作流

对于 `/blog notebooklm ask <question>`：

### 第 1 步：检查身份验证
运行身份验证检查（参见上面的门控模式）。如果尚未通过身份验证，引导用户完成设置。

### 第 2 步：解析笔记本
确定要查询的笔记本：
- 如果提供了 `--notebook-url`：验证它是否为 NotebookLM 笔记本 URL，然后使用它
- 如果提供了 `--notebook-id`：在资料库中查找
- 如果两者均未提供：使用资料库中的活动笔记本
- 如果没有活动笔记本：显示资料库并要求用户选择

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

### 第 4 步：分析并跟进
每个响应都以跟进提示结束。**必需行为：**
1. **停止**：不要立即回复用户
2. **分析**：将答案与用户的原始请求进行比较
3. **识别缺口**：确定是否需要更多信息
4. **提出跟进问题**：如果存在信息缺口，立即提出跟进问题
5. **重复**：持续执行，直到信息完整
6. **综合**：在回复用户之前整合所有答案

## 智能发现工作流

对于 `/blog notebooklm discover <url>`：

在不了解笔记本内容的情况下添加笔记本时，先对其进行查询：

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

不要猜测描述；应先进行发现或询问用户。

## 资料库管理

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

## 内部 API（供 blog-write / blog-researcher 使用）

当作为 Task 子代理由 blog-write 或 blog-researcher 调用时：

**输入**（由调用方 skill 提供）：
- `question`：与博客主题相关的研究问题
- `notebook_id` 或 `notebook_url`：要查询的笔记本
- `context`：`"internal"`（表示启用优雅降级模式）

**处理流程：**
1. 检查身份验证状态：如果未通过身份验证，则静默返回空结果
2. 使用研究问题查询笔记本
3. 解析并返回结构化响应

**输出**（返回给调用方 skill）：
```markdown
### NotebookLM Research
- **Source:** [Notebook name]
- **Question:** [What was asked]
- **Answer:** [Source-grounded response from user's documents]
- **Underlying Source:** [Public source URL or document identifier]
- **Underlying Source Date:** [Publication date or retrieval date]
- **Source Quality:** [Tier 1-3 after classifying the underlying document]
```

**优雅降级：** 如果缺少身份验证或查询失败，立即返回且不报错。调用工作流将继续使用基于 WebSearch 的研究。
绝不能因为 NotebookLM 不可用而阻塞 blog-write 或 blog-rewrite。

## 数据存储

所有数据均存储在 skill 目录中：
- `data/library.json`：笔记本元数据和资料库
- `data/auth_info.json`：身份验证状态
- `data/browser_state/`：包含 Cookie 的 Chrome 配置文件

**安全性：** 所有数据目录均已加入 gitignore。绝不要提交身份验证信息或浏览器状态。

## 错误处理

| 错误 | 解决方法 |
|-------|-----------|
| 未通过身份验证 | 运行 `/blog notebooklm setup` |
| ModuleNotFoundError | 始终使用 `run.py` 包装器 |
| 浏览器崩溃 | 运行 `cleanup_manager.py --confirm --preserve-library`，然后重新进行身份验证 |
| 达到速率限制（50 次/天） | 等到太平洋标准时间午夜，或切换 Google 账号 |
| 找不到笔记本 | 使用 `notebook_manager.py list` 检查 |
| 查询超时（120 秒） | 使用更简单的问题重试，或通过 `--show-browser` 进行调试 |
| MCP 不可用（内部） | 静默返回：写作工作流将使用 WebSearch |

## 局限性

- 无会话持久化（每个问题都会启动新的浏览器会话）
- 免费 Google 账号存在速率限制（每天 50 次查询）
- 需要手动上传（用户必须将文档添加到 NotebookLM Web UI）
- 浏览器开销（每个问题的启动和关闭需要几秒钟）
- 仅支持本地 Claude Code（Web UI 中不可用）

## 参考文档

按需加载：启动时不要全部加载：
- `references/commands.md`：完整的 CLI 命令、参数和工作流模式
- `references/troubleshooting.md`：错误解决方案、恢复流程和调试方法