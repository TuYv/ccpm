---
name: lsp-simulate
description: Speculative code editing session — simulate changes in memory before touching disk. Use when planning edits that might break things, exploring refactors across multiple files, or verifying an edit is safe before applying.
user-invocable: true
allowed-tools: mcp__lsp__start_lsp mcp__lsp__create_simulation_session mcp__lsp__simulate_edit mcp__lsp__simulate_chain mcp__lsp__evaluate_session mcp__lsp__commit_session mcp__lsp__discard_session mcp__lsp__destroy_session mcp__lsp__preview_edit
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata: {}
---
> 需要 agent-lsp MCP 服务器。

# lsp-simulate

在写入磁盘之前，先在内存中模拟代码编辑。LSP 服务器会将你的更改应用到内存覆盖层，运行诊断，并报告此次编辑是否安全——不会触碰任何文件。

## 前置条件

必须已为目标工作区运行 LSP。如果尚未初始化，请在使用任何模拟工具之前调用 `start_lsp`。

```
mcp__lsp__start_lsp(root_dir: "/your/workspace")
```

自动初始化说明：agent-lsp 支持根据文件路径自动推断工作区。只有在切换工作区根目录时，才需要显式调用 `start_lsp`。

## 快速开始（单次编辑）

对于单次假设性检查，请使用 `preview_edit`——它会在一次调用中创建会话、应用编辑、执行评估并销毁会话：

```
mcp__lsp__preview_edit(
  workspace_root: "/your/workspace",
  language: "go",
  file_path: "/abs/path/to/file.go",
  start_line: 42, start_column: 1,
  end_line: 42, end_column: 20,
  new_text: "replacement text"
)
```

结果：

```
{ net_delta: 0 }   -- safe to apply
{ net_delta: 2 }   -- 2 new errors introduced; do NOT apply
```

`net_delta: 0` 表示未引入新错误。正值表示引入了错误——请先检查 `errors_introduced`，再做决定。

## 完整会话工作流（多次编辑）

当需要应用多项相互依赖的编辑，或者希望先检查补丁再决定是否写入磁盘时，请使用完整会话。

**步骤 1——创建模拟会话**

```
mcp__lsp__create_simulation_session(
  workspace_root: "/your/workspace",
  language: "go"
)
→ { session_id: "abc123" }
```

**步骤 2——在内存中应用编辑**

调用一次或多次 `simulate_edit`。所有编辑都仅存在于内存中。位置索引从 1 开始（与编辑器行号和 `cat -n` 输出一致）。

```
mcp__lsp__simulate_edit(
  session_id: "abc123",
  file_path: "/abs/path/to/file.go",
  start_line: 10, start_column: 1,
  end_line: 10, end_column: 30,
  new_text: "func NewClient(cfg Config) *Client {"
)
→ { session_id: "abc123", edit_applied: true, version_after: 1 }
```

根据需要重复执行其他编辑。

**步骤 3——评估会话**

```
mcp__lsp__evaluate_session(
  session_id: "abc123",
  scope: "file"
)
→ {
    net_delta: 0,
    confidence: "high",
    errors_introduced: [],
    errors_resolved: [],
    edit_risk_score: 0.0,
    affected_symbols: []
  }
```

`scope: "file"`（默认值）速度更快，并返回 `confidence: "high"`。
`scope: "workspace"` 能捕获跨文件类型错误，但会返回 `confidence: "eventual"`（结果可能尚未完全稳定）。

**步骤 4——决策关卡**

如果 `net_delta == 0`，则继续提交。否则，丢弃会话：

```
mcp__lsp__discard_session(session_id: "abc123")
```

**步骤 5——提交会话**

```
-- Preview patch only (no disk write):
mcp__lsp__commit_session(session_id: "abc123", apply: false)

-- Write to disk:
mcp__lsp__commit_session(session_id: "abc123", apply: true)
```

**步骤 6——销毁会话（始终执行）**

```
mcp__lsp__destroy_session(session_id: "abc123")
```

提交或丢弃后，始终调用 `destroy_session` 以释放服务器资源。请参阅下方的[清理规则](#cleanup-rule)。

## 链式变更（simulate_chain）

当你有一系列编辑，并希望确定该序列执行到哪一步仍可安全应用时，请使用 `simulate_chain`。与多次调用 `simulate_edit` 不同，`simulate_chain` 会在每个步骤之后评估诊断结果。

```
mcp__lsp__simulate_chain(
  session_id: "abc123",
  edits: [
    { file_path: "/abs/file.go", start_line: 5, start_column: 1,
      end_line: 5, end_column: 40, new_text: "type Foo struct { Bar int }" },
    { file_path: "/abs/file.go", start_line: 20, start_column: 1,
      end_line: 20, end_column: 10, new_text: "f.Bar" },
    { file_path: "/abs/other.go", start_line: 8, start_column: 1,
      end_line: 8, end_column: 10, new_text: "x.Bar" }
  ]
)
→ {
    steps: [
      { step: 1, net_delta: 0, errors_introduced: [] },
      { step: 2, net_delta: 0, errors_introduced: [] },
      { step: 3, net_delta: 1, errors_introduced: [...] }
    ],
    safe_to_apply_through_step: 2,
    cumulative_delta: 1
  }
```

`safe_to_apply_through_step: 2` 表示步骤 1 和步骤 2 是安全的；步骤 3 引入了错误。审查后提交会话以应用步骤 1–2，或丢弃会话以取消所有内容。

## 决策指南

| net_delta | confidence  | 操作                                                             |
|-----------|-------------|-------------------------------------------------------------------|
| 0         | high        | 安全。提交或应用。                                            |
| 0         | eventual    | 很可能安全。工作区范围——如果风险很重要，请重新评估。       |
| > 0       | any         | 请勿应用。检查 `errors_introduced`。丢弃会话。       |
| > 0       | partial     | 超时。结果不完整。丢弃并缩小范围后重试。|

## 会话状态

| 状态     | 含义                                                       | 下一步              |
|-----------|---------------------------------------------------------------|------------------------|
| created   | 会话已初始化，尚未进行编辑                             | simulate_edit          |
| mutated   | 已在内存中应用一个或多个编辑                           | evaluate_session       |
| evaluated | 已收集诊断结果                                         | 提交或丢弃      |
| committed | 已返回补丁（并可选择写入磁盘）               | destroy_session        |
| discarded | 已还原内存中的编辑，未写入磁盘                       | destroy_session        |
| dirty     | 还原失败或版本不匹配；会话处于不一致状态    | 仅可执行 destroy_session   |

处于 `dirty` 状态的会话无法恢复——请立即调用 `destroy_session`。

## 清理规则

完成会话后，始终调用 `destroy_session`，即使在错误处理路径中也是如此：

```
-- After commit:
mcp__lsp__commit_session(session_id: "abc123", apply: true)
mcp__lsp__destroy_session(session_id: "abc123")

-- After discard:
mcp__lsp__discard_session(session_id: "abc123")
mcp__lsp__destroy_session(session_id: "abc123")
```

**MCP 服务器重启：** 会话是临时的——它们仅存在于服务器内存中。如果 MCP 服务器重启，所有会话 ID 都会失效。要在重启期间保留工作，请先调用 `commit_session(apply: false)` 获取可移植补丁，然后在服务器重启后重新应用该补丁。

有关详细的字段说明和置信度解读，请参阅 [references/patterns.md](references/patterns.md)。