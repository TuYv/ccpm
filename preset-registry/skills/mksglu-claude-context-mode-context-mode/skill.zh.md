---
name: context-mode
description: |
  Use context-mode tools (ctx_execute, ctx_execute_file) instead of Bash/cat when processing
  large outputs. Triggers: "analyze logs", "summarize output", "process data",
  "parse JSON", "filter results", "extract errors", "check build output",
  "analyze dependencies", "process API response", "large file analysis",
  "page snapshot", "browser snapshot", "DOM structure", "inspect page",
  "accessibility tree", "Playwright snapshot",
  "run tests", "test output", "coverage report", "git log", "recent commits",
  "diff between branches", "list containers", "pod status", "disk usage",
  "fetch docs", "API reference", "index documentation",
  "call API", "check response", "query results",
  "find TODOs", "count lines", "codebase statistics", "security audit",
  "outdated packages", "dependency tree", "cloud resources", "CI/CD output".
  Also triggers on ANY MCP tool output that may exceed 20 lines.
  Subagent routing is handled automatically via PreToolUse hook.
---
# 上下文模式：所有大输出的默认选择

## 强制规则

<context_mode_logic>
  <mandatory_rule>
    所有命令默认使用上下文模式。仅对保证输出量较小的操作使用 Bash。
  </mandatory_rule>
</context_mode_logic>

Bash 白名单（可安全地直接运行）：
- **文件变更**：`mkdir`、`mv`、`cp`、`rm`、`touch`、`chmod`
- **Git 写操作**：`git add`、`git commit`、`git push`、`git checkout`、`git branch`、`git merge`
- **导航**：`cd`、`pwd`、`which`
- **进程控制**：`kill`、`pkill`
- **包管理**：`npm install`、`npm publish`、`pip install`
- **简单输出**：`echo`、`printf`

**其他所有操作 → `ctx_execute` 或 `ctx_execute_file`。** 任何读取、查询、获取、列出、记录日志、测试、构建、比较、检查或调用外部服务的命令。其中包括所有 CLI（gh、aws、kubectl、docker、terraform、wrangler、fly、heroku、gcloud 等）——此类工具数以千计，我们无法全部列出。

**不确定时，使用上下文模式。** 每 KB 不必要的上下文都会降低整个会话的质量和速度。

## 决策树

```
About to run a command / read a file / call an API?
│
├── Command is on the Bash whitelist (file mutations, git writes, navigation, echo)?
│   └── Use Bash
│
├── Output MIGHT be large or you're UNSURE?
│   └── Use context-mode ctx_execute or ctx_execute_file
│
├── Fetching web documentation or HTML page?
│   └── Use ctx_fetch_and_index → ctx_search
│
├── Using Playwright (navigate, snapshot, console, network)?
│   └── ALWAYS use filename parameter to save to file, then:
│       browser_snapshot(filename) → ctx_index(path) or ctx_execute_file(path)
│       browser_console_messages(filename) → ctx_execute_file(path)
│       browser_network_requests(filename) → ctx_execute_file(path)
│       ⚠ browser_navigate returns a snapshot automatically — ignore it,
│         use browser_snapshot(filename) for any inspection.
│       ⚠ Playwright MCP uses a SINGLE browser instance — NOT parallel-safe.
│         For parallel browser ops, use agent-browser via execute instead.
│
├── Using agent-browser (parallel-safe browser automation)?
│   └── Run via execute (shell) — each call gets its own subprocess:
│       execute("agent-browser open example.com && agent-browser snapshot -i -c")
│       ✓ Supports sessions for isolated browser instances
│       ✓ Safe for parallel subagent execution
│       ✓ Lightweight accessibility tree with ref-based interaction
│
├── Processing output from another MCP tool (Context7, GitHub API, etc.)?
│   ├── Output already in context from a previous tool call?
│   │   └── Use it directly. Do NOT re-index with ctx_index(content: ...).
│   ├── Need to search the output multiple times?
│   │   └── Save to file via ctx_execute, then ctx_index(path) → ctx_search
│   └── One-shot extraction?
│       └── Save to file via ctx_execute, then ctx_execute_file(path)
│
└── Reading a file to analyze/summarize (not edit)?
    └── Use ctx_execute_file (file loads into FILE_CONTENT, not context)
```

## 何时使用各个工具

| 情况 | 工具 | 示例 |
|-----------|------|---------|
| 访问 API 端点 | `ctx_execute` | `fetch('http://localhost:3000/api/orders')` |
| 运行会返回数据的 CLI | `ctx_execute` | `gh pr list`, `aws s3 ls`, `kubectl get pods` |
| 运行测试 | `ctx_execute` | `npm test`, `pytest`, `go test ./...` |
| Git 操作 | `ctx_execute` | `git log --oneline -50`, `git diff HEAD~5` |
| Docker/K8s 检查 | `ctx_execute` | `docker stats --no-stream`, `kubectl describe pod` |
| 读取日志文件 | `ctx_execute_file` | 解析 access.log、error.log、构建输出 |
| 读取数据文件 | `ctx_execute_file` | 分析 CSV、JSON、YAML、XML |
| 读取源代码进行分析 | `ctx_execute_file` | 统计函数、查找模式、提取指标 |
| 获取 Web 文档 | `ctx_fetch_and_index` | 为 React/Next.js/Zod 文档建立索引，然后搜索 |
| Playwright 快照 | `browser_snapshot(filename)` → `ctx_index(path)` → `ctx_search` | 保存到文件、在服务器端建立索引、执行查询 |
| Playwright 快照（一次性） | `browser_snapshot(filename)` → `ctx_execute_file(path)` | 保存到文件、在沙箱中提取 |
| Playwright 控制台/网络 | `browser_*(filename)` → `ctx_execute_file(path)` | 保存到文件、在沙箱中分析 |
| MCP 输出（已在上下文中） | 直接使用 | 不要重新建立索引——它已经加载 |
| MCP 输出（需要多次查询） | 使用 `ctx_execute` 保存 → `ctx_index(path)` → `ctx_search` | 先保存到文件，再在服务器端建立索引 |
| 清除已索引的知识库内容 | `ctx_purge(confirm: true)` | 永久删除所有已索引内容 |

## 自动触发条件

遇到以下任何情况时，无需用户要求，直接使用 context-mode：

- **API 调试**：“访问这个端点”“调用 API”“检查响应”“查找响应中的错误”
- **日志分析**：“检查日志”“有哪些错误”“读取 access.log”“调试 500 错误”
- **测试运行**：“运行测试”“检查测试是否通过”“测试套件输出”
- **Git 历史记录**：“显示最近的提交”“git log”“发生了哪些更改”“分支之间的差异”
- **数据检查**：“查看 CSV”“解析 JSON”“分析配置”
- **基础设施**：“列出容器”“检查 Pod”“S3 存储桶”“显示正在运行的服务”
- **依赖项审计**：“检查依赖项”“过时的软件包”“安全审计”
- **构建输出**：“构建项目”“检查警告”“编译错误”
- **代码指标**：“统计行数”“查找 TODO”“统计函数数量”“分析代码库”
- **Web 文档查询**：“查找文档”“检查 API 参考文档”“查找示例”

## 语言选择

| 情况 | 语言 | 原因 |
|-----------|----------|-----|
| HTTP/API 调用、JSON | `javascript` | 原生 fetch、JSON.parse、async/await |
| 数据分析、CSV、统计 | `python` | csv、statistics、collections、re |
| 带管道的 Shell 命令 | `shell` | grep、awk、jq、原生工具 |
| 文件模式匹配 | `shell` | find、wc、sort、uniq |

## 搜索查询策略

- BM25 使用 **OR 语义**——匹配更多术语的结果会自动获得更高排名
- 每次查询使用 2–4 个具体的技术术语
- 为多个文档建立索引时，**始终使用 `source` 参数**，以避免跨来源污染
  - 支持部分匹配：`source: "Node"` 可匹配 `"Node.js v22 CHANGELOG"`
- **始终使用 `queries` 数组**——在一次调用中批量提交所有搜索问题：
  - `ctx_search(queries: ["transform pipe", "refine superRefine", "coerce codec"], source: "Zod")`
  - 切勿分别多次调用 ctx_search()——将所有查询放入一个数组中

## 外部文档

- 对于外部文档，**始终使用 `ctx_fetch_and_index`**——对于不属于你的软件包，绝不要对本地路径使用 `cat` 或 `ctx_execute`
- 对于托管在 GitHub 上的项目，请使用原始文件 URL：`https://raw.githubusercontent.com/org/repo/main/CHANGELOG.md`
- 建立索引后，在搜索中使用 `source` 参数，将结果范围限定到该特定文档

## 关键规则

1. **始终通过 console.log/print 输出你的发现。** 只有 stdout 会进入上下文。没有输出 = 浪费调用。
2. **编写分析代码，而不仅仅是转储数据。** 不要使用 `console.log(JSON.stringify(data))`——先进行分析，再输出发现。
3. **输出要具体。** 输出包含 ID、行号、确切值的 bug 详情——而不仅仅是数量。
4. **对于需要编辑的文件**：使用常规 Read 工具。context-mode 用于分析，而非编辑。
5. **仅对 Bash 白名单命令**：使用 Bash 进行文件变更、git 写入、导航、进程控制、软件包安装和 echo。其他所有操作都通过 context-mode 完成。
6. **绝不要使用 `ctx_index(content: large_data)`。** 使用 `ctx_index(path: ...)` 在服务器端读取文件。`content` 参数会将数据作为工具参数传入上下文——仅将其用于少量内联文本。
7. **在 Playwright 工具（`browser_snapshot`、`browser_console_messages`、`browser_network_requests`）上始终使用 `filename` 参数。** 如果没有该参数，完整输出将进入上下文。
8. **不要重新索引上下文中已有的数据。** 如果 MCP 工具在先前的响应中返回了数据，那么它已被加载——直接使用它，或先将其保存到文件。

## 沙盒数据工作流

<sandboxed_data_workflow>
  <critical_rule>
    使用支持保存到文件的工具时：始终使用 'filename' 参数。
    绝不要将大型原始数据集直接返回到上下文。
  </critical_rule>
  <workflow>
    LargeDataTool(filename: "path") → mcp__context-mode__ctx_index(path: "path") → ctx_search()
  </workflow>
</sandboxed_data_workflow>

无论源工具是什么（Playwright、GitHub API、AWS CLI 等），
这是用于保留上下文的通用模式。

## 示例

### 调试 API 端点
```javascript
const resp = await fetch('http://localhost:3000/api/orders');
const { orders } = await resp.json();

const bugs = [];
const negQty = orders.filter(o => o.quantity < 0);
if (negQty.length) bugs.push(`Negative qty: ${negQty.map(o => o.id).join(', ')}`);

const nullFields = orders.filter(o => !o.product || !o.customer);
if (nullFields.length) bugs.push(`Null fields: ${nullFields.map(o => o.id).join(', ')}`);

console.log(`${orders.length} orders, ${bugs.length} bugs found:`);
bugs.forEach(b => console.log(`- ${b}`));
```

### 分析测试输出
```shell
npm test 2>&1
echo "EXIT=$?"
```

### 检查 GitHub PR
```shell
gh pr list --json number,title,state,reviewDecision --jq '.[] | "\(.number) [\(.state)] \(.title) — \(.reviewDecision // "no review")"'
```

### 读取并分析大型文件
```python
# FILE_CONTENT is pre-loaded by ctx_execute_file
import json
data = json.loads(FILE_CONTENT)
print(f"Records: {len(data)}")
# ... analyze and print findings
```

## 浏览器与 Playwright 集成

**当任务涉及 Playwright 快照、屏幕截图或页面检查时，始终通过文件 → 沙箱进行处理。**

Playwright `browser_snapshot` 会返回 10K–135K 个 token 的无障碍树数据。不带 `filename` 调用它会将所有这些数据都转储到上下文中。将输出作为参数传给 `ctx_index(content: ...)`，会把它第二次发送到上下文中。这两种做法都是错误的。

**关键洞察**：`browser_snapshot` 有一个 `filename` 参数，可将内容保存到文件，而不是返回到上下文。`ctx_index` 有一个 `path` 参数，可在服务器端读取文件。`ctx_execute_file` 会在沙箱中处理文件。**这些操作都不会触及上下文。**

### 工作流 A：快照 → 文件 → 索引 → 搜索（多次查询）

```
Step 1: browser_snapshot(filename: "/tmp/playwright-snapshot.md")
        → saves to file, returns ~50B confirmation (NOT 135K tokens)

Step 2: ctx_index(path: "/tmp/playwright-snapshot.md", source: "Playwright snapshot")
        → reads file SERVER-SIDE, indexes into FTS5, returns ~80B confirmation

Step 3: ctx_search(queries: ["login form email password"], source: "Playwright")
        → returns only matching chunks (~300B)
```

**上下文总量：约 430B**，而不是 270K 个 token。真正节省 99%。

### 工作流 B：快照 → 文件 → 执行文件（一次性提取）

```
Step 1: browser_snapshot(filename: "/tmp/playwright-snapshot.md")
        → saves to file, returns ~50B confirmation

Step 2: ctx_execute_file(path: "/tmp/playwright-snapshot.md", language: "javascript", code: "
          const links = [...FILE_CONTENT.matchAll(/- link \"([^\"]+)\"/g)].map(m => m[1]);
          const buttons = [...FILE_CONTENT.matchAll(/- button \"([^\"]+)\"/g)].map(m => m[1]);
          const inputs = [...FILE_CONTENT.matchAll(/- textbox|- checkbox|- radio/g)];
          console.log('Links:', links.length, '| Buttons:', buttons.length, '| Inputs:', inputs.length);
          console.log('Navigation:', links.slice(0, 10).join(', '));
        ")
        → processes in sandbox, returns ~200B summary
```

**上下文总量：约 250B**，而不是 135K 个 token。

### 工作流 C：控制台与网络（数据量较大时保存到文件）

```
browser_console_messages(level: "error", filename: "/tmp/console.md")
→ ctx_execute_file(path: "/tmp/console.md", ...) or ctx_index(path: "/tmp/console.md", ...)

browser_network_requests(includeStatic: false, filename: "/tmp/network.md")
→ ctx_execute_file(path: "/tmp/network.md", ...) or ctx_index(path: "/tmp/network.md", ...)
```

### 关键：为什么必须使用 `filename` + `path`

| 方法 | 上下文成本 | 是否正确？ |
|----------|-------------|----------|
| `browser_snapshot()` → 原始数据进入上下文 | **135K 个 token** | 否 |
| `browser_snapshot()` → `ctx_index(content: raw)` | **270K 个 token**（翻倍！） | 否 |
| `browser_snapshot(filename)` → `ctx_index(path)` → `ctx_search` | **约 430B** | 是 |
| `browser_snapshot(filename)` → `ctx_execute_file(path)` | **约 250B** | 是 |

### 关键规则

> **调用 `browser_snapshot`、`browser_console_messages` 或 `browser_network_requests` 时，始终使用 `filename` 参数。**
> 然后通过 `ctx_index(path: ...)` 或 `ctx_execute_file(path: ...)` 进行处理——绝不要使用 `ctx_index(content: ...)`。
>
> 数据流：**Playwright → 文件 → 服务器端读取 → 上下文**。绝不要：**Playwright → 上下文 → ctx_index(content) → 再次进入上下文**。

## 子代理使用

子代理会通过 PreToolUse hook 自动接收 context-mode 工具路由。你**无需**在子代理提示词中手动添加工具名称——该 hook 会自动注入。只需使用自然语言描述任务即可。

## 反模式

- 通过 Bash 使用 `curl http://api/endpoint` → 50KB 内容会涌入上下文。应改用带 fetch 的 `ctx_execute`。
- 通过 Bash 使用 `cat large-file.json` → 整个文件都会进入上下文。应改用 `ctx_execute_file`。
- 通过 Bash 使用 `gh pr list` → 原始 JSON 会进入上下文。应改用带 `--jq` 过滤器的 `ctx_execute`。
- 使用 `| head -20` 对 Bash 输出进行管道截取 → 你会丢失其余内容。应使用 `ctx_execute` 分析**全部**数据并输出摘要。
- 在捕获之前从上游缩减 `ctx_execute` 输出 → `ctx_execute` 负责捕获，`ctx_search` 负责过滤；混合这两个层级会丢弃索引从未见过的数据。参见 `references/anti-patterns.md` §8。
- 通过 Bash 运行 `npm test` → 完整测试输出会进入上下文。应使用 `ctx_execute` 捕获并汇总。
- 调用 `browser_snapshot()` 时**不传入** `filename` 参数 → 13.5 万个 token 会涌入上下文。**始终**使用 `browser_snapshot(filename: "/tmp/snap.md")`。
- 调用 `browser_console_messages()` 或 `browser_network_requests()` 时**不传入** `filename` → 整个输出都会涌入上下文。**始终**使用 `filename` 参数。
- 将任何大型数据传给 `ctx_index(content: ...)` → 数据会以参数形式进入上下文。**始终**使用 `ctx_index(path: ...)` 在服务器端读取。`content` 参数应仅用于你自行编写的少量内联文本。
- 调用 MCP 工具（Context7 `query-docs`、GitHub API 等），然后将响应传给 `ctx_index(content: response)` → 上下文用量会**翻倍**。响应已经在上下文中——请直接使用，或先保存到文件。
- 忽略 `browser_navigate` 的自动快照 → 导航响应中包含完整的页面快照。不要依赖它进行检查——请另行调用 `browser_snapshot(filename)`。
- 期望 `ctx_stats` 重置或清除任何内容 → `ctx_stats` 是只读的（仅显示统计信息）。使用 `ctx_purge(confirm: true)` 永久删除所有已索引内容。

## 参考文件

- [JavaScript/TypeScript 模式](./references/patterns-javascript.md)
- [Python 模式](./references/patterns-python.md)
- [Shell 模式](./references/patterns-shell.md)
- [反模式与常见错误](./references/anti-patterns.md)