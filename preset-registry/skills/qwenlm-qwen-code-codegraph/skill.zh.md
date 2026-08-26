---
name: codegraph
description: Analyze indexed codebases via graph database (neug) and vector index (zvec). Covers call graphs, dependencies, dead code, hotspots, module coupling, architecture reports, semantic search, impact analysis, bug root cause from GitHub issues, class diagrams (UML), and PR review (risk scoring, conflict detection, auto-merge candidates, labeling). Also covers creating, inspecting, and repairing a CodeScope index. Use for: code structure, who calls what, why something changed, similar functions, module boundaries, bug tracing, class relationships, PR risk/conflicts, or any question benefiting from a code knowledge graph. Applies when a `.codegraph` index exists in the workspace, or when the user wants to create one.
---
# CodeScope 问答

CodeScope 将源代码索引为两层知识图谱——**结构**（函数、调用、导入、类、模块）和**演化**（提交、文件变更、函数修改）——并为每个函数生成**语义嵌入**。支持 **Python、JavaScript/TypeScript、C 和 Java**（包括拥有 8K+ 文件的 Hadoop 规模代码仓库）。这种组合能够实现仅靠 grep、LSP 或纯向量搜索无法单独完成的分析。它还可以**获取 GitHub issue 并将 bug 追踪到代码**，以及**审查开放的 PR**——为每个 PR 评估风险、检测跨 PR 冲突、识别可自动合并的候选项，并应用 GitHub 标签。

## 使用此 Skill 的时机

- 用户询问调用链、调用方、被调用方或依赖关系
- 用户想要查找死代码、热点或架构层
- 用户询问代码历史、谁修改了什么，或某项修改的原因
- 用户想要在整个代码库中查找语义相似的函数
- 用户想要完整的架构分析或报告
- 用户询问模块耦合、循环依赖或桥接函数
- 用户想要索引或分析 Java 项目（Maven、Gradle、普通 Java）
- 用户想要分析 GitHub issue 或 bug 报告，以查找根本原因
- 用户询问“为什么这个项目有这么多 bug”或“哪些代码 bug 最多”
- 用户想要将 bug 报告追踪到最相关的代码位置
- 用户询问类之间的关系、归属、组合关系，或想要类图 / UML
- 用户想要了解哪些类拥有或依赖其他类
- 用户想要审查 PR、评估 PR 风险或确定 PR 审查优先级
- 用户询问跨 PR 冲突，或哪些 PR 可以独立合并
- 用户想要查找可自动合并的候选项或生成 PR 审查报告
- 用户询问某个 PR 的影响范围或波及范围
- 用户想要根据分析结果为 PR 应用标签
- 用户想要针对给定 PR 探索特定于 PR 的后续问题
- 工作区中存在 `.codegraph` 目录（或类似索引）

## 入门

### 安装

```bash
pip install codegraph-ai
```

### 环境变量（可选）

```bash
# Create Python virtural environment
python -m venv .venv

source .venv/bin/activate

# Point to a pre-built database (skip indexing)
export CODESCOPE_DB_DIR="/path/to/.linux_db"

# Offline mode for HuggingFace models
export HF_HUB_OFFLINE="1"

# Fallback when HuggingFace is unreachable (e.g., network issues in China)
# Use HF mirror or ModelScope for sentence-transformers models:
export HF_ENDPOINT="https://hf-mirror.com"
# https://www.modelscope.cn/models/sentence-transformers/all-MiniLM-L6-v2
```

### 检查索引状态

```bash
codegraph status --db $CODESCOPE_DB_DIR
```

如果不存在索引，请创建一个：

```bash
codegraph init --repo . --lang auto --commits 500
```

支持的语言：`python`、`c`、`javascript`、`typescript`、`java` 或 `auto`（根据文件扩展名自动检测）。

`--commits` 标志会导入 Git 历史记录（用于演化查询）。如果不使用该标志，则只能进行结构分析。添加 `--backfill-limit 200` 还可以计算函数级别的 `MODIFIES` 边（速度较慢，但可以启用 `change_attribution` 和 `co_change`）。

要将 git 历史添加到现有索引中（无需重新索引结构）：

```bash
codegraph ingest --repo . --db $CODESCOPE_DB_DIR --commits 500
codegraph ingest --repo . --db $CODESCOPE_DB_DIR --backfill-limit 200   # add MODIFIES edges only
```

## 两种接口：CLI 与 Python

**使用 CLI** 查看状态和报告：

```bash
codegraph status --db $CODESCOPE_DB_DIR
codegraph analyze --db $CODESCOPE_DB_DIR --output report.md
```

**使用 Python API** 执行查询和自定义分析：

```python
import os
os.environ['HF_HUB_OFFLINE'] = '1'  # required

from codegraph.core import CodeScope
cs = CodeScope(os.environ['CODESCOPE_DB_DIR'])

# Cypher query
rows = list(cs.conn.execute('''
    MATCH (caller:Function)-[:CALLS]->(f:Function {name: "free_irq"})
    RETURN caller.name, caller.file_path LIMIT 10
'''))
for r in rows:
    print(r)

cs.close()  # always close when done
```

Python API 功能更强大——它提供对原始 Cypher 的访问，并允许你串联查询。

## Python API 核心功能

### 原始查询

这些是执行任何自定义分析的基础：

| 方法                                      | 功能                                                               |
| ----------------------------------------- | ------------------------------------------------------------------ |
| `cs.conn.execute(cypher)`                 | 对图执行任意 Cypher 查询——返回元组列表                            |
| `cs.vector_only_search(query, topk=10)`   | 在所有函数嵌入上执行语义搜索——返回 `[{id, score}]`                 |
| `cs.summary()`                            | 输出索引代码库的易读概览                                            |

### 结构分析

| 方法                                          | 功能                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| `cs.impact(func_name, change_desc, max_hops=3)` | 查找最多 N 跳的调用者，并根据其与变更的语义相关性进行排名           |
| `cs.hotspots(topk=10)`                          | 按结构风险对函数进行排名（扇入 × 扇出）                             |
| `cs.dead_code()`                                | 查找没有调用者的函数（排除入口点）                                  |
| `cs.circular_deps()`                            | 检测文件级别的循环导入链                                            |
| `cs.module_coupling(topk=10)`                   | 查找跨模块耦合关系对及其调用次数                                    |
| `cs.bridge_functions(topk=30)`                  | 查找从最多不同模块中被调用的函数                                    |
| `cs.layer_discovery(topk=30)`                   | 自动发现基础设施层／中间层／消费者层                                |
| `cs.stability_analysis(topk=50)`                | 分析扇入与修改频率之间的相关性                                      |
| `cs.class_hierarchy(class_name=None)`           | 返回某个类的继承树（或所有类的继承树）                              |

### 类依赖关系（UML 风格）

CodeScope 会在索引过程中，从类字段和类型注解中提取三种 UML 关系类型：

| 关系 | UML 符号           | 含义                                           | 检测方式                                     |
| ------------ | -------------------- | ------------------------------------------------- | ------------------------------------------------ |
| `COMPOSES`   | `*--` 实心菱形 | 强所有权——字段始终持有一个实例 | 非可选字段被赋值为构造出的对象 |
| `AGGREGATES` | `o--` 空心菱形   | 可选/弱引用——可能为 `None`           | `Optional[X]`、`X \| None` 或被赋值为 `None`   |
| `INHERITS`   | `<\|--` 空心箭头 | 子类扩展父类                           | `class A(B)`                                     |

```python
# Get all composition relationships (A strongly owns B)
list(cs.conn.execute('MATCH (c1:Class)-[:COMPOSES]->(c2:Class) RETURN c1.name, c2.name'))

# Get all aggregation relationships (A optionally holds B)
list(cs.conn.execute('MATCH (c1:Class)-[:AGGREGATES]->(c2:Class) RETURN c1.name, c2.name'))

# How many objects does a class directly own?
list(cs.conn.execute(
    'MATCH (c:Class {name: "Llama"})-[:COMPOSES]->(t:Class) RETURN t.name'
))

# Full dependency graph for a class (composition + aggregation + inheritance)
list(cs.conn.execute(
    'MATCH (c:Class {name: "GPUModelRunner"})-[r:COMPOSES|AGGREGATES]->(t:Class) '
    'RETURN type(r), t.name'
))
```

**生成 Mermaid 类图：**

```python
inherits  = list(cs.conn.execute('MATCH (c1:Class)-[:INHERITS]->(c2:Class) RETURN c1.name, c2.name'))
composes  = list(cs.conn.execute('MATCH (c1:Class)-[:COMPOSES]->(c2:Class) RETURN c1.name, c2.name'))
aggregates = list(cs.conn.execute('MATCH (c1:Class)-[:AGGREGATES]->(c2:Class) RETURN c1.name, c2.name'))

print('classDiagram')
for src, tgt in inherits:   print(f'    {tgt} <|-- {src}')   # parent <|-- child
for src, tgt in composes:   print(f'    {src} *-- {tgt}')    # owner *-- owned
for src, tgt in aggregates: print(f'    {src} o-- {tgt}')    # holder o-- optional
```

**规模参考：**

| 项目          | 类数量 | INHERITS | COMPOSES | AGGREGATES | 索引时间 |
| ---------------- | ------- | -------- | -------- | ---------- | ---------- |
| llama-cpp-python | 128     | 18       | 8        | 4          | ~2s        |
| vllm             | 4,002   | 2,185    | 3,217    | 149        | ~50s       |

### 语义搜索

| 方法                                          | 功能                                                            |
| ----------------------------------------------- | ----------------------------------------------------------------------- |
| `cs.similar(function, scope, topk=10)`          | 在模块作用域内查找与给定函数相似的函数        |
| `cs.cross_locate(query, topk=10)`               | 查找语义相关的函数，然后揭示调用链连接 |
| `cs.semantic_cross_pollination(query, topk=15)` | 在相距较远的子系统之间查找相似函数                        |

### 演进（初始化时需要使用 `--commits`）

| 方法                                                              | 功能                                               |
| ----------------------------------------------------------------- | -------------------------------------------------- |
| `cs.change_attribution(func_name, file_path=None, limit=20)`      | 哪些提交修改了某个函数？（需要回填）               |
| `cs.co_change(func_name, file_path=None, min_commits=2, topk=10)` | 总是一起被修改的函数                               |
| `cs.intent_search(query, topk=10)`                                | 查找与自然语言意图匹配的提交                       |
| `cs.commit_modularity(topk=20)`                                   | 根据提交涉及的模块数量为提交评分                   |
| `cs.hot_cold_map(topk=30)`                                        | 模块修改密度                                       |

### 报告生成

```python
from codegraph.analyzer import generate_report
report = generate_report(cs)  # 以 markdown 格式生成完整的架构分析
```

或者通过 CLI：

```bash
codegraph analyze --output reports/analysis.md
```

报告涵盖：概览统计、子系统分布、顶层模块、架构层（包含 Mermaid 图表）、桥接函数、扇入/扇出热点、跨模块耦合、演进热点以及死代码密度。

## Java 支持

CodeScope 包含完整的 Java 适配器，可处理 Apache Hadoop 等企业级代码库（约 8K 个文件、约 97K 个函数，可在约 3.5 分钟内完成索引）。

### 索引内容

| 元素               | 图节点/边                         | 备注                                       |
| ------------------ | --------------------------------- | ------------------------------------------ |
| 类                 | `Class` 节点                       | 包含泛型和注解                             |
| 接口               | `Class` 节点                       | `extends` → `INHERITS` 边                  |
| 枚举               | `Class` 节点                       | 提取枚举方法                               |
| 方法               | `Function` 节点                    | 完整的泛型签名和 JavaDoc                   |
| 构造函数           | `Function` 节点（name=`<init>`）  | 包含 `super()` 调用                        |
| 方法调用           | `CALLS` 边                         | 保留接收者上下文（`obj.method()`）          |
| `new` 表达式       | 指向 `ClassName.<init>` 的 `CALLS` 边 | 构造函数调用                              |
| 导入               | `IMPORTS` 边（file→file）          | 单个、通配符和静态导入                     |
| 内部类             | `Class` 节点（name=`Outer.Inner`） | 添加外部类前缀                             |
| 继承               | `INHERITS` 边                      | `extends` + `implements`                   |

### 为 Java 项目建立索引

```bash
codegraph init --repo /path/to/java-project --lang java --commits 500
```

或者使用自动检测（自动检测 `.java` 文件）：

```bash
codegraph init --repo /path/to/java-project --lang auto
```

### Java 特定排除项

默认情况下，为 Java 项目建立索引时会排除以下目录：`target/`、`build/`、`.gradle/`、`.idea/`、`.settings/`、`bin/`、`out/`、`test/`、`tests/`、`src/test/`。

### Java 查询示例

```python
# Find all classes that extend a specific class
list(cs.conn.execute("""
    MATCH (c:Class)-[:INHERITS]->(p:Class {name: 'FileSystem'})
    RETURN c.name, c.file_path
"""))

# Find all methods in a specific class
list(cs.conn.execute("""
    MATCH (c:Class {name: 'DefaultParser'})-[:HAS_METHOD]->(f:Function)
    RETURN f.name, f.signature
"""))

# Find constructor call chains
list(cs.conn.execute("""
    MATCH (f:Function)-[:CALLS]->(init:Function {name: '<init>'})
    WHERE init.class_name = 'Configuration'
    RETURN f.name, f.file_path LIMIT 10
"""))
```

## Bug 根因分析

CodeScope 可以获取 GitHub issue，并利用图和向量基础设施将其映射到代码。这是回答“为什么这个项目有这么多 bug？”或“这个 bug 在代码中的根源是什么？”等问题的核心工作流。

### 前提条件

- 目标代码库必须已经建立代码图索引
- 必须安装并完成身份验证的 `gh` CLI（`gh auth login`）

### Bug 分析 API

#### 单个 Issue 分析

```python
# Analyze a specific GitHub issue against the indexed code graph
result = cs.analyze_issue("owner", "repo", 1234, topk=10)
print(result.format_report())
```

此操作会：

1. 从 GitHub 获取 issue（或从缓存加载）
2. 从 issue 正文中解析文件路径、函数名称和堆栈跟踪
3. 将提取出的路径与图中的 File 节点进行匹配
4. 使用语义搜索（`cross_locate`）查找相关代码
5. 通过 `impact()` 跟踪所提及函数的调用者
6. 对根因候选项进行排序，并返回带有解释的结果

#### 批量 Bug 分析

```python
# Analyze top-k bug issues and get aggregated hotspot data
results = cs.analyze_top_bugs("owner", "repo", k=10, label="bug")
for r in results:
    print(f"#{r.issue.number}: {r.issue.title}")
    for c in r.candidates[:3]:
        print(f"  {c.function_name} ({c.file_path}) score={c.score:.2f}")
```

#### CLI 命令

```bash
# Fetch and parse a single issue (no graph needed)
codegraph fetch-issue owner repo 1234

# Fetch top-k bugs from a repo
codegraph fetch-bugs owner repo --top 10 --label bug

# Analyze a single bug against the code graph
codegraph analyze-bug owner repo 1234 --db .codegraph --topk 10

# Batch analyze top bugs
codegraph analyze-bugs owner repo --db .codegraph --top 10 --label bug
```

#### 更底层的组件

对于自定义分析流水线，可以单独使用以下组件：

```python
from codegraph.issue_fetcher import fetch_and_parse_issue
from codegraph.bug_locator import (
    resolve_paths_to_files,
    find_semantic_matches,
    trace_callers,
    rank_root_causes,
    analyze_bug,
)

# Fetch and parse (with caching)
issue = fetch_and_parse_issue("owner", "repo", 1234)
print(issue.extracted_paths)   # file paths found in body
print(issue.extracted_funcs)   # function names from stack traces
print(issue.linked_commits)    # merge commit SHAs from linked PRs

# Match paths to graph nodes
path_matches = resolve_paths_to_files(cs, issue.extracted_paths)

# Semantic search using issue description
semantic_matches = find_semantic_matches(cs, f"{issue.title}\n{issue.body}")

# Trace callers of mentioned functions
caller_traces = trace_callers(cs, issue.extracted_funcs, max_hops=2)

# Combine into ranked candidates
candidates = rank_root_causes(path_matches, semantic_matches, caller_traces, issue.extracted_funcs)
```

### 评分系统

根因候选项通过组合多个信号进行评分：

| 信号              | 分数     | 描述                                                |
| ----------------- | --------- | ---------------------------------------------------------- |
| 直接提及      | +1.0      | 函数名称出现在 issue 正文/堆栈跟踪中            |
| 文件路径匹配     | +0.8      | 函数位于 issue 中提及的文件内               |
| 语义匹配      | +score    | `cross_locate` 返回的原始余弦相似度（0.0-1.0）        |
| 调用方关系 | +0.5/hops | 函数调用了被提及的函数（随距离衰减）          |

### Issue 缓存

解析后的 issue 会缓存到 `~/.codegraph/issue_cache/{owner}_{repo}_{number}.json`。命中缓存时会完全跳过 GitHub API 调用（耗时低于 1 毫秒）。要强制刷新，请传入 `use_cache=False`，或在 CLI 中使用 `--no-cache`。

```python
from codegraph.issue_cache import clear_cache
clear_cache(owner="openclaw", repo="openclaw")  # clear specific repo
clear_cache()  # clear all
```

### 堆栈跟踪解析

解析器会自动从 Python、C/C++、JavaScript/Node.js、Go 和 Rust 格式的堆栈跟踪中提取文件路径和函数名称。它还会提取反引号和行内代码中的 `func_name()` 引用。

## PR 审查与分析

CodeScope 可以针对已建立索引的代码图分析开放的 PR，计算结构风险分数、检测 PR 之间的冲突，并生成按优先级排序的审查报告。

### 前置条件

- 目标仓库必须已经建立代码图索引
- 必须安装并完成身份验证的 `gh` CLI（`gh auth login`）
- 建议设置 `GITHUB_TOKEN` 环境变量，以避免受到速率限制

### 统一管道（CLI）

包含两个子命令：`prepare`（分析并写入 DB）和 `label`（应用 GitHub 标签并发表评论）。

```bash
# Phase 1: Analyze PRs, detect conflicts, write to graph DB (full rebuild)
# Pipeline: cross-PR analysis → single-PR risk scoring → report + labels
codegraph pr-review prepare --db .codegraph

# Filter by author during prepare:
codegraph pr-review prepare --db .codegraph --author someone

# Override auto-detected GitHub repo (owner/repo):
codegraph pr-review prepare --db .codegraph --repo owner/repo

# Skip per-PR risk scoring (conflict-only, faster):
codegraph pr-review prepare --db .codegraph --skip-single-pr

# Phase 2: Apply labels and post conflict comments from graph DB
codegraph pr-review label --db .codegraph

# Label with dry-run (preview without API calls):
codegraph pr-review label --db .codegraph --dry-run
```

必需参数：`--db`。本地仓库路径由 `--db` 的父目录推导得出。GitHub 仓库会通过 `git remote get-url origin` 自动检测（也可以通过 `--repo` 指定）。可选参数：`--author`、`--output`、`--skip-single-pr`（`prepare`）；`--dry-run`（`label`）。

### Python API（用于 agents / scripts）

如需在同一个 Python 进程中以编程方式使用，请使用 `PRReview`——这是一个会自动管理 CodeScope 生命周期的高级封装器。

```python
from codegraph.pr_api import PRReview

# Full pipeline in 2 lines
with PRReview(db=".codegraph") as pr:
    pr.prepare()                # fetch PRs → graph DB → scoring → report
    pr.label(dry_run=True)      # preview labels without API calls

# Query after prepare (works across sessions once DB has data)
with PRReview(db=".codegraph") as pr:
    # Conflicts
    pr.conflict_prs_of("100")           # → ["101", "102"]

    # Risk
    pr.risk("100")                      # → {"number": "100", "risk_level": "HIGH", ...}

    # Classification
    pr.auto_merge_candidates()          # → [{"number": "200", ...}, ...]
    pr.conflicting_groups()             # → [["100", "101"], ["103"]]

    # All PRs in DB
    pr.all_prs()                        # → [{"number": "100", ...}, ...]

    # Functions changed by a specific PR (added / modified / deleted)
    import json
    cs = pr._open_cs()
    rows = list(cs.conn.execute(
        f"MATCH (pr:PR {{id: {json.dumps('439')}}})-[c:CHANGES]->(f:Function) "
        f"RETURN c.info AS change_type, f.name, f.file_path "
        f"ORDER BY c.info, f.name"
    ))
    for change_type, name, path in rows:
        print(f"  [{change_type}] {name} ({path})")
    # change_type: 'hunk' (modified), 'new' (added), 'deleted', 'related' (newly calls)
```

所有查询方法都会返回结构化的 Python 对象——无需进行文本解析。CLI 和 Python API 共享相同的底层实现（`run_prepare` / `run_label` / graph DB），因此你可以通过 CLI 执行 `prepare`，再通过 Python 进行查询，反之亦然。

有关更底层的组件（PRScorer、CrossPRAnalyzer 等），请参阅：

```python
from codegraph.pr_analysis import GitHubClient, GraphAnalyzer, PRScorer, CrossPRAnalyzer
gh = GitHubClient(repo='owner/repo')
scorer = PRScorer(GraphAnalyzer(cs, repo_dir), repo_dir, gh)
result = scorer.analyze(gh.pr_to_entry(pr), output_dir='/tmp')  # risk_score, risk_level, peak_blast...

cross = CrossPRAnalyzer(cs, repo_dir, gh)
cross.prepare(pr_ids)  # index PR nodes into graph
cross.connected_components()  # {root: [pr_ids]} — detects conflicts
cross.update_pr_labels(assignments)  # persist labels to graph DB

# Load PR results from graph DB (no GitHub API needed)
all_results, components = cross.load_from_graph()

# Build and apply labels from analysis results
from codegraph.pr_labeler import build_label_assignments, apply_labels
assignments = build_label_assignments(all_results, components)
apply_labels(assignments, repo='owner/repo', create_labels=True)
```

有关详细工作流、Cypher 模式以及 CrossPRAnalyzer 查询维度，请参阅 [pr-analysis.md](./pr-analysis.md)。

### 报告结构（3 个部分）

1. **自动合并候选项**：风险级别为 LOW、没有接口/配置更改且属于单例组件的 PR
2. **独立审查**：没有跨 PR 冲突的非简单 PR
3. **冲突 PR 组**：通过连通分量（DSU）共享代码/调用路径的 PR

风险级别：CRITICAL（≥12）、HIGH（≥7）、MEDIUM（≥3）、LOW（<3）、UNKNOWN（使用 `--skip-single-pr` 时）。关键信号：blast_radius（3.0×）、no_test_coverage（2.0×）、interface_change（2.5×）、dead_code（1.5×）。

### 应用标签和冲突评论

运行 `codegraph pr-review prepare` 后，运行 `codegraph pr-review label`，为 GitHub PR 应用类别标签并发布冲突评论：

```bash
# Apply labels and post conflict comments:
codegraph pr-review label --db .codegraph

# Preview without making API calls:
codegraph pr-review label --db .codegraph --dry-run
```

`label` 子命令从图数据库（`pr.label` 列）读取 PR 标签——无需重新分析。对于冲突 PR（标记为 `conflicting-group-N`），它还会在 GitHub PR 上发布评论，列出共享函数以及其他冲突 PR。

标签在 `prepare` 期间根据分析结果（连通分量 + 风险评分）计算，并持久化到图数据库中的 PR 节点（`pr.label` 列，以分号分隔）。

标签方案：

| 类别                         | 标签                   | 颜色          |
| ---------------------------- | ---------------------- | ------------- |
| 自动合并候选（第 1 部分）    | `auto-merge-candidate` | 绿色          |
| 独立审查（第 2 部分）        | `independent-review`   | 黄色          |
| 冲突组 N（第 3 部分）        | `conflicting-group-N`  | 红色/橙色/蓝色 |
| 任意冲突 PR（第 3 部分）     | `conflicting-pr`       | 红色          |

### 后续探索

当图数据库中存在 PR 节点时（即运行 `codegraph pr-review prepare` 后），PR 专属的后续问题会自动包含在 `codegraph explore` 中。PR 探索是一组集成到 `explore` 中的问题模板。要查询特定 PR 的详细信息（冲突、变更函数），请使用 `PRReview` Python API。

```bash
# After pr-review prepare, explore includes PR questions automatically:
codegraph explore --db .codegraph --top 15

# Interactive exploration (including PR follow-up questions):
codegraph explore --db .codegraph

# Focus on PR-specific questions (use reviewer role):
codegraph explore --db .codegraph --role reviewer

# Filter to only architecture questions (exclude PR patterns):
codegraph explore --db .codegraph --type architecture

# Filter to only risk questions:
codegraph explore --db .codegraph --type risk

# Filter to only PR review questions:
codegraph explore --db .codegraph --type pr-review --role reviewer
```

`--type` 过滤器控制显示哪些问题类别：

- `all`（默认）：混合显示所有类别
- `architecture`：结构设计问题（扇入、耦合、循环）
- `risk`：风险相关问题（结构风险 + PR 风险）
- `evolution`：Git 历史问题（变更归因、修改模式）
- `hotspot`：频繁修改的代码问题
- `pr-review`：PR 专属问题（影响、冲突、测试覆盖率）

指定 `--type pr-review` 时，只显示与 PR 相关的问题。

## 如何路由问题

关键决策是：**用户想要精确的结构化答案、模糊的语义答案，还是缺陷到代码的映射？**

| 用户提问...                                                   | 最佳方式                                                                                                                  |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| “谁调用 `free_irq`？”                                          | Cypher：`MATCH (c:Function)-[:CALLS]->(f:Function {name: 'free_irq'}) RETURN c.name, c.file_path`                           |
| “查找与内存分配相关的函数”                                     | `cs.vector_only_search("memory allocation")` 或 `cs.cross_locate("memory allocation")`                                      |
| “哪个函数最复杂？”                                            | `cs.hotspots(topk=1)`                                                                                                      |
| “网络栈中是否存在死代码？”                                    | `cs.dead_code()`，然后按文件路径过滤                                                                                      |
| “`schedule()` 最近发生了哪些变化？”                           | `cs.change_attribution("schedule", "kernel/sched/core.c")`                                                                 |
| “哪些模块之间耦合紧密？”                                      | `cs.module_coupling(topk=20)`                                                                                             |
| “生成完整的架构报告”                                          | `codegraph analyze` 或 `generate_report(cs)`                                                                               |
| “`mm/` 的架构角色是什么？”                                    | `cs.layer_discovery()`，然后查找 `mm` 条目                                                                                |
| “哪些函数充当 API 边界？”                                     | `cs.bridge_functions(topk=30)`                                                                                             |
| “查找修复竞态条件的提交”                                      | `cs.intent_search("fix race condition")`                                                                                   |
| “哪些函数总是与 `kmalloc` 一起变更？”                         | `cs.co_change("kmalloc")`                                                                                                  |
| “为什么这个项目有这么多缺陷？”                                | `cs.analyze_top_bugs("owner", "repo", k=10)`，然后汇总热点                                                                  |
| “分析 GitHub 中的 issue #1234”                                | `cs.analyze_issue("owner", "repo", 1234)`                                                                                   |
| “哪些代码与这个缺陷相关？”                                    | `cs.analyze_issue(...)` 或手动执行 `cross_locate(bug_description)`                                                         |
| “查找 issue #42 中崩溃的根本原因”                              | `cs.analyze_issue("owner", "repo", 42)`                                                                                     |
| “哪些模块的缺陷最多？”                                        | `cs.analyze_top_bugs(...)`，然后按文件/模块汇总                                                                            |
| “索引这个 Java 项目”                                          | `codegraph init --repo . --lang java`                                                                                      |
| “Hadoop 中哪些类扩展了 FileSystem？”                           | Cypher：`MATCH (c:Class)-[:INHERITS]->(p:Class {name: 'FileSystem'}) RETURN c.name, c.file_path`                            |
| “查找此模块中调用的所有构造函数”                               | Cypher：`MATCH (f:Function)-[:CALLS]->(init:Function {name: '<init>'}) WHERE f.file_path CONTAINS 'module' RETURN ...`      |
| “绘制类图 / 显示类 UML”                                       | 查询 `COMPOSES`、`AGGREGATES`、`INHERITS` 边，并将其渲染为 Mermaid `classDiagram`                                          |
| “`Llama` 拥有哪些对象 / 组合了什么？”                         | Cypher：`MATCH (c:Class {name:'Llama'})-[:COMPOSES]->(t:Class) RETURN t.name`                                               |
| “哪个类持有对 `KVCacheManager` 的引用？”                       | Cypher：`MATCH (c:Class)-[:COMPOSES\|AGGREGATES]->(t:Class {name:'KVCacheManager'}) RETURN c.name`                         |
| “显示 `GPUModelRunner` 的所有可选依赖”                         | Cypher：`MATCH (c:Class {name:'GPUModelRunner'})-[:AGGREGATES]->(t:Class) RETURN t.name`                                   |
| “审查所有开放 PR 并生成报告”                                  | `codegraph pr-review prepare --db ...`                                                                                     |
| “哪些 PR 可以自动合并？”                                      | 运行 `pr-review prepare`，检查报告的第 1 部分                                                                              |
| “是否存在冲突 PR？”                                           | 运行 `pr-review prepare`，检查第 3 部分（连通分量）                                                                         |
| “PR #42 的风险是什么？”                                       | `PRScorer.analyze(entry)`，用于逐个 PR 评分                                                                                |
| “这个 PR 的影响范围有多大？”                                  | `PRScorer.analyze(entry)` → `result['peak_blast']` 和调用图可视化                                                          |
| “哪些 PR 修改了同一个函数？”                                  | `CrossPRAnalyzer.connected_components()` → 同函数边类型                                                                   |
| “为 PR 添加其审查类别标签”                                    | `codegraph pr-review label --db ...`                                                                                        |
| “在 PR 上发布冲突评论”                                        | `codegraph pr-review label --db ...`（对冲突 PR 自动执行）                                                                  |
| “预览标签/评论但不实际应用”                                   | `codegraph pr-review label --db ... --dry-run`                                                                              |
| “以交互方式探索 PR 后续问题”                                  | `codegraph explore --db .codegraph`（如果运行过 `prepare`，会自动包含 PR 模式）                                            |
| “查询特定 PR 的冲突”                                          | `PRReview.conflict_prs_of("42")` — 返回冲突 PR 编号列表                                                                     |
| “查询特定 PR 的变更函数”                                      | Cypher：`MATCH (pr:PR {id: '42'})-[c:CHANGES]->(f:Function) RETURN c.info, f.name, f.file_path`                            |
| “比较两个 PR 的重叠部分”                                      | Cypher：`MATCH (pr1:PR {id: '42'})-[c1:CHANGES]->(f:Function)<-[c2:CHANGES]-(pr2:PR {id: '43'}) RETURN f.name, f.file_path` |
| “仅显示架构问题”                                              | `codegraph explore --db .codegraph --type architecture`                                                                    |
| “仅显示 PR 审查问题”                                          | `codegraph explore --db .codegraph --type pr-review --role reviewer`                                                        |
| “显示排名靠前的 PR 风险问题”                                  | `codegraph explore --db .codegraph --top 15 --role reviewer`                                                               |
| “完整的 PR 审查流程：分析、添加标签、探索”                     | 1) `codegraph pr-review prepare` 2) `codegraph pr-review label` 3) `codegraph explore --db .codegraph`                      |

对于**预构建方法未涵盖的新颖调查**，请编写原始 Cypher 查询。有关模板，请参阅 [patterns.md](./patterns.md)。有关 bug 分析模式，请参阅 [bug-analysis.md](./bug-analysis.md)。

## Cypher 的重要过滤条件

编写 Cypher 查询时，以下过滤条件可以避免产生误导性结果：

- **`f.is_historical = 0`** — 排除仍作为历史记录保留在图中的已删除/重命名函数
- **`f.is_external = 0`**（用于 File 节点）— 排除系统头文件/库文件
- **`c.version_tag = 'bf'`** — 只有回填的提交具有 `MODIFIES` 边；未回填的提交只有 `TOUCHES`（文件级）边
- **始终使用 `LIMIT`** — 大型代码库可能返回数十万行结果

## 检查数据可用性

在运行演化查询之前，请检查可用的数据：

```python
# How many commits are indexed?
list(cs.conn.execute("MATCH (c:Commit) RETURN count(c)"))

# How many have MODIFIES edges (backfilled)?
list(cs.conn.execute("MATCH (c:Commit) WHERE c.version_tag = 'bf' RETURN count(c)"))
```

如果不存在提交，演化方法将返回空结果——请引导用户先运行 `codegraph ingest`。如果存在提交但尚未完成回填，`TOUCHES`（文件级）查询仍然有效，但 `MODIFIES`（函数级）查询将无法工作。

## 故障排除

| 错误                              | 原因                                  | 修复                                                                               |
| ---------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------- |
| `Database locked`                  | 进程崩溃后遗留 neug 锁                 | `rm <db>/graph.db/neugdb.lock`                                                    |
| `Can't open lock file`             | zvec LOCK 文件被删除                   | `touch <db>/vectors/LOCK`                                                         |
| `Can't lock read-write collection` | 另一个进程持有锁                       | 终止另一个进程                                                                     |
| `recovery idmap failed`            | WAL 文件过期                           | 删除 `<db>/vectors/idmap.0/` 中为空的 `.log` 文件                                 |
| HuggingFace model download fails   | 网络/防火墙阻止访问 huggingface.co     | 使用 `HF_ENDPOINT="https://hf-mirror.com"` 或 ModelScope（参见 Getting Started 提示） |

CLI 会在启动时尽可能自动清理锁相关问题。

## 参考资料

- **[schema.md](./schema.md)** — 完整的图模式：节点类型、边类型、属性及 Cypher 语法说明
- **[patterns.md](./patterns.md)** — 可直接使用的 Cypher 查询模板和组合策略
- **[bug-analysis.md](./bug-analysis.md)** — Bug 分析工作流：单个问题、批量分析、热点聚合、自定义流水线
- **[pr-analysis.md](./pr-analysis.md)** — PR 分析工作流：逐个 PR 评分、跨 PR 冲突检测、Cypher 模式、CrossPRAnalyzer 用法