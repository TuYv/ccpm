---
name: blog-notebooklm
description: >
  Query Google NotebookLM notebooks for source-grounded, citation-backed
  answers from user-uploaded documents. Manages notebook library, handles
  Google authentication, and supports smart discovery. Works standalone
  via /blog notebooklm or internally from blog-write and blog-researcher
  for Tier 1 research data. Falls back gracefully when not configured.
  Use when user says "notebooklm", "notebook", "query notebook",
  "ask notebook", "notebook research", "source grounded research",
  "document query", "notebook library".
user-invokable: true
argument-hint: "[ask|discover|library|setup|status|cleanup] [question-or-url]"
---
# Blog NotebookLM：基于文档来源的研究

直接从 Claude Code 查询 Google NotebookLM 笔记本，获取由 Gemini 生成且有引用依据的答案。每个问题都会打开一个无头浏览器会话，仅从你上传的文档中检索答案，然后关闭会话。响应具有一级质量（用户自己的第一手来源）：零幻觉风险。
答案符合 FLOW 证据三要素要求：使用返回的来源标题作为行内引用，并将笔记本 URL 和检索日期作为参考文献条目。这是达到 FLOW 要求的“已验证来源”标准、确保任何统计数据在公开前经过验证的最高可信度路径。

## 快速参考

| 命令 | 作用 |
|---------|-------------|
| `/blog notebooklm ask <question>` | 查询笔记本，获取基于来源的答案 |
| `/blog notebooklm discover <url>` | 在编目之前智能发现笔记本内容 |
| `/blog notebooklm library list` | 列出资料库中的所有笔记本 |
| `/blog notebooklm library add <url>` | 将笔记本添加到资料库 |
| `/blog notebooklm library search <query>` | 按关键词搜索笔记本 |
| `/blog notebooklm library remove <id>` | 从资料库中移除笔记本 |
| `/blog notebooklm setup` | 执行一次性 Google 身份验证（浏览器可见） |
| `/blog notebooklm status` | 检查身份验证状态 |
| `/blog notebooklm cleanup` | 清理浏览器状态（保留资料库） |

## 前置条件

- 拥有 NotebookLM 访问权限的 Google 账号
- Python 3.11+（venv 由 `run.py` 自动管理）
- Google Chrome（首次运行时通过 Patchright 自动安装）
- 一次性身份验证设置（在可见浏览器中以交互方式登录 Google）

## 始终使用 run.py 包装器

**绝不要直接调用脚本。始终使用 `python3 scripts/run.py [script]`：**

```bash
# CORRECT:
python3 scripts/run.py auth_manager.py status
python3 scripts/run.py ask_question.py --question "..."

# WRONG -- fails without venv:
python3 scripts/auth_manager.py status
```

`run.py` 包装器会自动创建 `.venv`、安装依赖项、设置 Chrome，并执行目标脚本。

## 身份验证检查（门控模式）

执行任何查询操作前，请检查身份验证状态：

```bash
python3 scripts/run.py auth_manager.py status
```

- 如果已通过身份验证：继续执行查询
- 如果未通过身份验证：通知用户并引导其完成设置：
  “NotebookLM 需要登录 Google。运行 `/blog notebooklm setup` 进行身份验证。”
- **从内部调用时**（由 blog-write 或 blog-researcher 调用）：如果未通过身份验证，则静默返回，不报告错误。绝不要阻塞写作工作流。

## 设置工作流

对于 `/blog notebooklm setup`：

```bash
# Opens a visible browser for manual Google login (one-time)
python3 scripts/run.py auth_manager.py setup
```

告知用户：“浏览器窗口将会打开。请登录你的 Google 账号。”
身份验证通过浏览器配置文件 + Cookie 注入（混合方式）持久保留。

其他身份验证命令：
```bash
python3 scripts/run.py auth_manager.py status   # Check auth
python3 scripts/run.py auth_manager.py reauth   # Re-authenticate
python3 scripts/run.py auth_manager.py clear     # Clear all auth data
```

## 查询工作流

对于 `/blog notebooklm ask <question>`：

### 步骤 1：检查身份验证
运行身份验证检查（参见上方的门控模式）。如果尚未通过身份验证，引导用户完成设置。

### 步骤 2：解析笔记本
确定要查询的笔记本：
- 如果提供了 `--notebook-url`：直接使用
- 如果提供了 `--notebook-id`：在库中查找
- 如果两者都未提供：使用库中的活动笔记本
- 如果没有活动笔记本：显示库并要求用户选择

### 步骤 3：提出问题
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

### 步骤 4：分析并跟进
每个响应都以一个后续提示结束。**必需行为：**
1. **停止**：不要立即回复用户
2. **分析**：将答案与用户的原始请求进行比较
3. **识别缺口**：确定是否需要更多信息
4. **提出后续问题**：如果存在信息缺口，立即提出后续问题
5. **重复**：持续执行，直至信息完整
6. **综合**：在回复用户之前整合所有答案

## 智能发现工作流

对于 `/blog notebooklm discover <url>`：

在不了解笔记本内容的情况下添加笔记本时，应先查询其内容：

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

**绝不要猜测或使用通用描述。** 始终先进行发现或询问用户。

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

## 内部 API（供 blog-write / blog-researcher 使用）

当作为 Task 子代理由 blog-write 或 blog-researcher 调用时：

**输入**（由调用方技能提供）：
- `question`：与博客主题相关的研究问题
- `notebook_id` 或 `notebook_url`：要查询的笔记本
- `context`："internal"（表示启用优雅降级模式）

**流程：**
1. 检查身份验证状态：如果未通过身份验证，则静默返回空结果
2. 使用研究问题查询笔记本
3. 解析并返回结构化响应

**输出**（返回给调用方技能）：
```markdown
### NotebookLM Research
- **Source:** [Notebook name]
- **Question:** [What was asked]
- **Answer:** [Source-grounded response from user's documents]
- **Source Quality:** Tier 1 (user-uploaded primary documents)
```

**优雅降级：** 如果缺少身份验证或查询失败，则立即返回且不报错。调用方工作流将继续使用基于 WebSearch 的研究。
绝不能因为 NotebookLM 不可用而阻塞 blog-write 或 blog-rewrite。

## 数据存储

所有数据均存储在技能目录中：
- `scripts/data/library.json`：笔记本元数据和资料库
- `scripts/data/auth_info.json`：身份验证状态
- `scripts/data/browser_state/`：包含 Cookie 的 Chrome 配置文件

**安全性：** 所有数据目录均已被 git 忽略。绝不要提交身份验证信息或浏览器状态。

## 错误处理

| 错误 | 解决方法 |
|-------|-----------|
| 未通过身份验证 | 运行 `/blog notebooklm setup` |
| ModuleNotFoundError | 始终使用 `run.py` 包装器 |
| 浏览器崩溃 | 运行 `cleanup_manager.py --confirm --preserve-library`，然后重新进行身份验证 |
| 速率限制（50 次/天） | 等到 PST 午夜或切换 Google 账号 |
| 找不到笔记本 | 使用 `notebook_manager.py list` 检查 |
| 查询超时（120 秒） | 使用更简单的问题重试，或使用 `--show-browser` 进行调试 |
| MCP 不可用（内部） | 静默返回：写作工作流将使用 WebSearch |

## 限制

- 不支持会话持久化（每个问题都会启动新的浏览器会话）
- 免费 Google 账号存在速率限制（每天 50 次查询）
- 需要手动上传（用户必须将文档添加到 NotebookLM Web UI）
- 存在浏览器开销（每个问题的启动和关闭需要几秒钟）
- 仅支持本地 Claude Code（Web UI 中不可用）

## 参考文档

按需加载：不要在启动时全部加载：
- `references/commands.md`：完整的 CLI 命令、参数和工作流模式
- `references/troubleshooting.md`：错误解决方案、恢复流程和调试方法