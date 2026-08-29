---
name: cpg-analysis
description: Deep code property graph analysis with Joern CPG (AST+CFG+PDG) and CodeQL for control flow, data flow, taint analysis, and security auditing
when-to-use: "When deep code analysis is needed — control flow, data flow, taint tracking, or security auditing"
user-invocable: true
effort: high
---
# CPG 分析技能


**用途：** 进行超越 AST 的深度代码分析。使用 Joern 构建完整的代码属性图（控制流、数据流、程序依赖），并使用 CodeQL 进行跨过程污点分析和漏洞检测。

**这些是可选工具。** 它们需要 Docker/JVM（Joern）或 CodeQL CLI。
日常导航使用 codebase-memory-mcp（Tier 1，始终启用）。
当 Tier 1 不足以完成深度分析时，使用这些工具。

```
┌────────────────────────────────────────────────────────────────┐
│  CODE PROPERTY GRAPH = AST + CFG + CDG + DDG + PDG             │
│  ─────────────────────────────────────────────────────────────│
│  AST  = Abstract Syntax Tree (structure)                       │
│  CFG  = Control Flow Graph (execution paths)                   │
│  CDG  = Control Dependency Graph (conditional dependencies)    │
│  DDG  = Data Dependency Graph (data flow between statements)   │
│  PDG  = Program Dependency Graph (CDG + DDG combined)          │
│                                                                │
│  Tier 2 (Joern): Full CPG with 40+ query tools                │
│  Tier 3 (CodeQL): Interprocedural taint + security queries     │
└────────────────────────────────────────────────────────────────┘
```

---

## Tier 选择指南

```
Simple symbol lookup, dependency trace, blast radius?
  → Tier 1: codebase-memory-mcp (always on, sub-ms)

Control flow paths, data flow, dead code, complex refactoring?
  → Tier 2: Joern CPG (on-demand, seconds)

Security audit, taint analysis, vulnerability detection?
  → Tier 3: CodeQL (on-demand, seconds to minutes)

Full security review before release?
  → All three tiers in sequence
```

---

## Tier 2：Joern CPG（CodeBadger MCP）

### 何时使用 Joern

| 场景 | 使用 Joern 的原因 | Tier 1 无法完成的工作 |
|----------|-----------|---------------------|
| 跨函数追踪数据流 | 完整的 DDG 遍历 | Tier 1 没有数据流 |
| 理解控制流路径 | 带分支条件的 CFG 分析 | Tier 1 没有 CFG |
| 查找死代码/不可达代码 | PDG 可达性分析 | Tier 1 只能检测未使用的导出 |
| 复杂重构影响分析 | 跨函数依赖链 | Tier 1 仅限于调用图 |
| 审计第三方库的使用情况 | 深度调用链遍历 | Tier 1 在导入边界处停止 |
| 理解异常流 | CFG 包含 throw/catch 路径 | Tier 1 忽略异常 |

### 关键 MCP 工具（Joern/CodeBadger）

| 工具 | 用途 | 示例查询 |
|------|---------|---------------|
| `generate_cpg` | 为项目构建 CPG | 首次设置或重大更改后 |
| `get_cpg_status` | 检查 CPG 构建状态 | 在查询前确认 CPG 已就绪 |
| `run_cpgql_query` | 运行任意 CPGQL 查询 | `cpg.method("login").callOut.code.l` |
| `get_cpgql_syntax_help` | 查询语言参考 | 不确定查询语法时 |
| `get_cfg` | 获取方法的控制流图 | 理解函数中的执行路径 |
| `list_methods` | 列出项目中的所有方法 | 查看可用函数的概览 |
| `get_method_source` | 获取方法的源代码 | 阅读特定函数的源代码 |
| `list_calls` | 列出来自某方法或指向某方法的调用 | 调用方/被调用方分析 |
| `get_call_graph` | 完整调用图可视化 | 理解调用链 |
| `get_type_definition` | 类型/类定义 | 理解类型层次结构 |

### 支持的语言（Joern）

Java、Scala、C/C++、Python、JavaScript、TypeScript、PHP、Ruby、Go、  
Kotlin、Swift、Lua

**不支持：** Rust（Rust 请使用 CodeQL）

### MCP 配置（Joern）

```json
{
  "mcpServers": {
    "codebadger": {
      "url": "http://localhost:4242/mcp",
      "type": "http"
    }
  }
}
```

### 前置条件

- Docker（用于 Joern 后端）
- Python 3.10+（用于 MCP server）
- 安装：`~/.claude/install-graph-tools.sh --joern`

### 常用 CPGQL 查询

```scala
// Find all methods that handle user input
cpg.method.where(_.parameter.name(".*input.*|.*request.*")).name.l

// Trace data flow from parameter to return
cpg.method("processPayment").parameter.reachableBy(cpg.method("processPayment").methodReturn).l

// Find methods with high cyclomatic complexity
cpg.method.where(_.controlStructure.size > 10).name.l

// Dead code: methods with no callers
cpg.method.where(_.callIn.size == 0).filter(_.name != "main").name.l

// Exception flow: methods that can throw but callers don't catch
cpg.method.where(_.ast.isThrow.size > 0).callIn.method.filter(_.ast.isTry.size == 0).name.l
```

---

## 第 3 层：CodeQL

### 何时使用 CodeQL

| 场景 | 使用 CodeQL 的原因 | 其他层级无法做到的事情 |
|----------|-----------|----------|
| 发布前的安全审计 | 过程间污点分析 | Joern 仅支持基础污点分析，CodeQL 更深入 |
| 审查身份验证/支付代码 | 从源到汇的数据流 | 跨函数、跨文件污点分析 |
| PR 安全审查 | 针对性的漏洞扫描 | 预构建的 OWASP 查询包 |
| 合规性检查 | CWE/OWASP 模式匹配 | 精选的安全查询套件 |
| Rust 安全分析 | 完整支持 Rust | Joern 不支持 Rust |

### 关键 MCP 工具（CodeQL）

| 工具 | 用途 |
|------|---------|
| `run_query` | 针对数据库执行 CodeQL 查询 |
| `find_definitions` | 定位符号定义 |
| `find_references` | 查找符号的所有引用 |
| `get_results` | 解析 BQRS（二进制查询结果集） |

### 支持的语言（CodeQL）

C/C++、C#、Go、Java、Kotlin、JavaScript、TypeScript、Python、Ruby、  
Swift、**Rust**

### MCP 配置（CodeQL）

```json
{
  "mcpServers": {
    "codeql": {
      "command": "codeql-mcp",
      "args": ["--database", ".code-graph/codeql-db"]
    }
  }
}
```

### 前置条件

- CodeQL CLI（在 macOS 上运行 `brew install codeql`）
- 安装：`~/.claude/install-graph-tools.sh --codeql`

### 常用 CodeQL 模式

```ql
// SQL injection: user input flows to SQL query
import python
from DataFlow::PathNode source, DataFlow::PathNode sink
where TaintTracking::hasFlowPath(source, sink)
  and source instanceof RemoteFlowSource
  and sink instanceof SqlExecution
select sink, source, sink, "SQL injection from $@.", source, "user input"

// Unvalidated redirect
from DataFlow::PathNode source, DataFlow::PathNode sink
where source instanceof RemoteFlowSource
  and sink instanceof RedirectSink
select sink, "Unvalidated redirect from user input"
```

---

## 组合工作流：深度分析

执行安全审查或复杂重构时，使用所有层级：

```
1. SCOPE       → Tier 1: detect_changes / get_architecture
                 Identify files and modules in scope

2. STRUCTURE   → Tier 1: search_graph / trace_call_path
                 Map the call graph and dependencies

3. FLOW        → Tier 2: get_cfg / run_cpgql_query
                 Analyze control flow and data flow paths

4. SECURITY    → Tier 3: run_query with taint analysis
                 Check for vulnerabilities in data paths

5. REPORT      → Combine findings from all tiers
                 Prioritize: Critical > High > Medium > Low
```

---

## 反模式

| 反模式 | 应改为 |
|-------------|-----------------|
| 使用 Joern/CodeQL 进行简单的符号查找 | 使用 Tier 1 `search_graph`（亚毫秒级，而非数秒） |
| 每次提交都运行完整的 CPG 构建 | 按需构建 CPG；使用 Tier 1 进行持续监控 |
| 未检查 `get_cpg_status` 就查询 Joern | 查询前始终确认 CPG 已构建且为最新状态 |
| 未提出具体的安全问题就运行 CodeQL | 先提出假设；CodeQL 查询开销较高 |
| 在深度分析前忽略 Tier 1 的影响范围 | 始终先使用 Tier 1 确定范围，再深入分析标记的区域 |
| 使用 CodeQL 进行非安全相关的结构查询 | 使用 Joern CPGQL 进行结构/流程查询；使用 CodeQL 进行安全分析 |