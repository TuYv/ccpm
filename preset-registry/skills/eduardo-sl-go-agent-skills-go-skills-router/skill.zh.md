---
name: go-skills-router
description: >
  Index and routing table for this repository's Go skills: maps a task to
  the skill that owns it, names the secondary skills worth loading
  alongside, and draws the boundary between skills whose triggers overlap.
  Use when it is unclear which Go skill applies, when a task spans several
  concerns at once, when two skills seem to cover the same ground, or when
  the user asks what Go skills are available. Trigger examples: "which skill
  should I use", "what Go skills do you have", "is this concurrency or
  performance", "go-performance-review or go-troubleshooting".
  Not for: a task that already maps cleanly to one skill — load that skill
  directly.
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Indexes the skills published in eduardo-sl/go-agent-skills; it names them, it does not require them.
allowed-tools: Read Glob Grep
metadata:
  author: eduardo-sl
  version: "1.0.1"
---
# Go 技能路由器

此仓库发布了 33 个 Go 技能。它们的触发条件必然会有重叠——
“这运行得很慢”可能涉及性能、并发、数据库或泄漏。使用下面的
表格选择负责的技能，然后在同一轮中加载次要技能，而不是逐个发现它们。

这是一个索引。它列出的每个技能都可以独立使用，无需阅读本文档。

## 路由表

| 任务 | 主要技能 | 也加载 |
|---|---|---|
| 格式化、命名或布局代码 | `go-coding-standards` | `go-documentation` |
| 审查 diff 或 PR | `go-code-review` | 负责被审查领域的技能 |
| 返回、包装或检查错误 | `go-error-handling` | 对于大量涉及 nil 的代码，加载 `go-defensive-coding` |
| 传递截止时间、取消工作 | `go-context` | 涉及 goroutine 时加载 `go-concurrency-review` |
| 采用较新的 Go 特性 | `go-modernize` | 加载 `go-ci` 以提升 CI 中的工具链版本 |
| 切片、映射、集合、预分配 | `go-data-structures` | `go-performance-review` |
| 编写 godoc、示例、弃用说明 | `go-documentation` | `go-coding-standards` |
| 防止 panic 和静默数据损坏 | `go-defensive-coding` | `go-error-handling` |
| 审查包布局和依赖方向 | `go-architecture-review` | `go-interface-design` |
| 启动新项目或服务 | `go-project-layout` | `go-dependency-injection`、`go-ci` |
| 设计接口或类型 | `go-interface-design` | `go-design-patterns` |
| 应用已知模式 | `go-design-patterns` | `go-interface-design` |
| 连接依赖、移除全局变量 | `go-dependency-injection` | `go-project-layout` |
| 构建 HTTP API | `go-api-design` | `go-openapi`、`go-observability` |
| 根据 OpenAPI 规范开展工作 | `go-openapi` | `go-api-design`、`go-test-quality` |
| 构建 GraphQL API | `go-graphql` | `go-database`、`go-api-design` |
| 构建 gRPC 服务 | `go-grpc` | `go-api-design`、`go-observability` |
| 构建 CLI | `go-cli` | `go-project-layout`、`go-binary-size` |
| 查询数据库、管理事务 | `go-database` | `go-error-handling`、`go-security-audit` |
| 编写 goroutine、channel、同步代码 | `go-concurrency-review` | `go-context`、`go-test-quality` |
| 审计漏洞 | `go-security-audit` | `go-dependency-audit`、`go-defensive-coding` |
| 减少分配、优化热点路径 | `go-performance-review` | `go-data-structures` |
| 缩小二进制文件或镜像 | `go-binary-size` | `go-ci` |
| 添加日志、指标、追踪 | `go-observability` | `go-context` |
| 调试 panic、泄漏或死锁 | `go-troubleshooting` | `go-concurrency-review`、`go-performance-review` |
| 编写或改进测试 | `go-test-quality` | `go-test-table-driven` |
| 组织测试矩阵 | `go-test-table-driven` | `go-test-quality` |
| 审计 go.mod、检查 CVE | `go-dependency-audit` | `go-security-audit` |
| 设置 CI、lint、覆盖率门禁 | `go-ci` | `go-dependency-audit` |
| 安全地重构现有代码 | `go-refactoring` | `go-semantic-tools`，以及负责目标形态的技能 |
| 查找调用方、实现方、执行重命名 | `go-semantic-tools` | `go-refactoring` |
| 编写提交消息 | `git-commit` | — |

## 重叠技能之间的边界

加载负责**所提问题**的技能，而不是匹配代码中某个关键词的技能。

**“它很慢。”**

- `go-performance-review` — 代码分配或复制了过多内容。负责
  基准测试、pprof 和优化模式。
- `go-concurrency-review` — 代码在锁上产生竞争，或将原本可并行运行的工作
  串行化。
- `go-database` — 问题出在查询上：缺少索引、N+1、连接池
  耗尽。
- `go-troubleshooting` — 你尚不清楚上述三种情况中是哪一种。先从
  这里开始找出原因，然后交接。

**“它崩溃了。”**

- `go-troubleshooting` — 已经发生了 panic、死锁或泄漏。
  诊断、性能分析、delve。
- `go-defensive-coding` — 预防。Nil 陷阱、别名、溢出，以及让下一次崩溃不可能发生的
  构造。
- `go-concurrency-review` — 数据竞争或 goroutine 生命周期错误。

**“这安全吗？”**

- `go-security-audit` — 外部威胁：注入、认证、密钥、TLS。
- `go-dependency-audit` — 你导入的模块中已知的 CVE。
- `go-defensive-coding` — 不属于攻击的内部正确性错误。

**“这应该如何组织？”**

- `go-architecture-review` — 现有代码库的形态。
- `go-project-layout` — 新代码库的形态。
- `go-interface-design` — 单个类型或契约的形态。
- `go-refactoring` — 从当前形态到达目标形态的*过程*。与上方负责该目标的任一技能
  一同加载。

**“我该如何暴露它？”**

- `go-api-design` — HTTP handlers、middleware、shutdown。与协议无关的
  服务端关注点。
- `go-openapi` — 契约是规范，并从中生成代码。
- `go-graphql` — 客户端选择响应的形态。
- `go-grpc` — protobuf 契约、interceptors、streaming。

**“测试。”**

- `go-test-quality` — 测试什么、如何隔离、模拟什么、
  synctest、goleak、基准测试。
- `go-test-table-driven` — 专门针对表格模式：何时有帮助、
  如何设计 case struct、何时停止使用它。

**“风格。”**

- `go-coding-standards` — 代码应遵循的规则。
- `go-code-review` — 将规则应用到他人的变更上，并标明严重程度。
- `go-modernize` — 因语言演进而改变的规则。
- `go-ci` — 让机器强制执行这些规则。

## 多关注点任务

一个真实任务通常会跨越三个技能。应在开始时一同加载它们，
而不是按顺序加载。

| 请求 | 加载 |
|---|---|
| “构建一个带测试的 gRPC 服务” | `go-grpc` + `go-test-quality` + `go-error-handling` |
| “这个端点在负载下很慢” | `go-troubleshooting` + `go-performance-review` + `go-database` |
| “在发布前加固这个服务” | `go-security-audit` + `go-dependency-audit` + `go-defensive-coding` + `go-ci` |
| “拆分这个单体应用” | `go-architecture-review` + `go-refactoring` + `go-semantic-tools` |
| “搭建一个新的 CLI” | `go-project-layout` + `go-cli` + `go-ci` + `go-binary-size` |
| “将其迁移到当前 Go 版本” | `go-modernize` + `go-test-quality` + `go-ci` |

## 完整目录

| 类别 | 技能 |
|---|---|
| 代码质量 | `go-coding-standards` `go-code-review` `go-error-handling` `go-context` `go-modernize` `go-data-structures` `go-documentation` |
| 架构 | `go-architecture-review` `go-project-layout` `go-interface-design` `go-api-design` `go-openapi` `go-graphql` `go-grpc` `go-design-patterns` `go-dependency-injection` `go-cli` |
| 数据 | `go-database` |
| 安全与性能 | `go-concurrency-review` `go-security-audit` `go-defensive-coding` `go-performance-review` `go-observability` `go-troubleshooting` |
| 测试 | `go-test-quality` `go-test-table-driven` |
| 工作流 | `go-dependency-audit` `go-ci` `go-refactoring` `go-semantic-tools` `go-binary-size` `git-commit` `go-skills-router` |

## 验证清单

1. 主要技能应与所提出的问题相匹配，而不是与代码中的某个关键词匹配
2. 次要技能应在同一轮中加载，而不是逐个发现
3. 对于诊断任务，应先运行 `go-troubleshooting`，再运行优化类技能
4. 对于重构任务，应将 `go-refactoring` 与负责目标结构的技能配对
5. 如果恰好只有一个技能适用，则应直接加载该技能，而无需路由