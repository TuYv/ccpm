---
name: vc-debug
description: "Debug systematically with root-cause analysis before fixes. Use for bugs, test failures, unexpected behavior, performance issues, CI failures, or system investigation."
languages: all
argument-hint: "[error or issue description]"
trigger_keywords: debug, root cause, investigate, why is this
layer: helper
metadata:
  author: claudekit
  version: "4.0.0"
---
# 调试与系统排查

> **输出风格：** 遵循 `process/development-protocols/communication-standards.md` —— 结论先行、语言平实、不使用未解释的术语、长回复附 TL;DR。

综合框架，融合系统性调试、根因追踪、纵深防御验证、验证协议以及系统级排查（日志、CI/CD、数据库、性能）。

## 核心原则

**未先完成根因调查，绝不进行修复**

随意的修复浪费时间并制造新 bug。找到根因，从源头修复，在每一层进行验证，在宣称成功之前先核实。

## 何时使用

**代码级：** 测试失败、bug、意外行为、构建失败、集成问题
**系统级：** 服务器错误、CI/CD 流水线失败、性能下降、数据库问题、日志分析
**始终：** 在宣称工作完成之前

## 技术方法

### 1. 系统性调试（`references/systematic-debugging.md`）

四阶段框架：根因调查 → 模式分析 → 假设检验 → 实施。完成每个阶段后再继续。没有第一阶段就不能修复。

**加载时机：** 任何需要调查和修复的 bug/问题

### 2. 根因追踪（`references/root-cause-tracing.md`）

沿调用栈向后追踪 bug，找到最初的触发点。从源头修复，而非修复表象。包含用于二分定位测试污染的 `scripts/find-polluter.sh`。

**加载时机：** 错误深藏于调用栈中，不清楚无效数据源于何处

### 3. 纵深防御（`references/defense-in-depth.md`）

在每一层进行验证：入口校验 → 业务逻辑 → 环境防护 → 调试插桩

**加载时机：** 找到根因后，需要进行全面验证

### 4. 验证（`references/verification.md`）

**铁律：** 缺乏最新的验证证据，不得宣称完成。运行命令。读取输出。然后才能宣称结果。

**加载时机：** 即将宣称工作完成、已修复或测试通过

### 5. 排查方法论（`references/investigation-methodology.md`）

针对系统级问题的五步结构化排查：初步评估 → 数据收集 → 分析 → 根因识别 → 方案制定

**加载时机：** 服务器事件、系统行为分析、多组件故障

### 6. 日志与 CI/CD 分析（`references/log-and-ci-analysis.md`）

收集并分析来自服务器、CI/CD 流水线（GitHub Actions）、应用层的日志。工具：`gh` CLI、结构化日志查询、跨来源关联。

**加载时机：** CI/CD 流水线失败、服务器错误、部署问题

### 7. 性能诊断（`references/performance-diagnostics.md`）

识别瓶颈、分析查询性能、制定优化策略。涵盖数据库查询、API 响应时间、资源利用率。

**加载时机：** 性能下降、慢查询、高延迟、资源耗尽

### 8. 报告规范（`references/reporting-standards.md`）

结构化诊断报告：执行摘要 → 技术分析 → 建议 → 证据

**加载时机：** 需要产出调查报告或诊断摘要

### 9. 任务管理（`references/task-management-debugging.md`）

通过 Claude 原生任务（TaskCreate、TaskUpdate、TaskList）跟踪排查流程。针对带有依赖链和并行证据收集的多步排查，采用水合（hydration）模式。**备选方案：** 任务工具仅限 CLI —— 如果不可用（VSCode 扩展），改用 `TodoWrite` 进行跟踪。调试工作流仍完全可用。

**加载时机：** 多组件排查（3 步以上）、并行日志收集、协调调试器子代理

### 10. 前端验证（`references/frontend-verification.md`）

通过 Chrome MCP（Claude Chrome 扩展）或 `vc-agent-browser` 技能备选方案对前端实现进行可视化验证。检测是否与前端相关 → 检查 Chrome MCP 可用性 → 截图 + 控制台错误检查 → 报告。若与前端无关则跳过。

**加载时机：** 实现涉及前端文件（tsx/jsx/vue/svelte/html/css）、UI bug、视觉回归

## 快速参考

```
Code bug       → systematic-debugging.md (Phase 1-4)
  Deep in stack  → root-cause-tracing.md (trace backward)
  Found cause    → defense-in-depth.md (add layers)
  Claiming done  → verification.md (verify first)

System issue   → investigation-methodology.md (5 steps)
  CI/CD failure  → log-and-ci-analysis.md
  Slow system    → performance-diagnostics.md
  Need report    → reporting-standards.md

Frontend fix   → frontend-verification.md (Chrome/devtools)
```

## 工具集成

- **数据库：** 使用 `sqlite3` CLI 和 `drizzle-kit studio` 进行 SQLite/libSQL 诊断
- **CI/CD：** 使用 `gh` CLI 查看 GitHub Actions 日志和调试流水线
- **代码库：** `vc-docs-seeker` 技能用于查阅包/插件文档；`vc-scout` 技能用于代码库探索
- **探查：** `/vc-scout` 或 `/vc-scout ext` 用于查找相关文件
- **前端：** 使用 Chrome 浏览器或 `vc-agent-browser` 技能进行可视化验证（截图、控制台、网络）
- **技能：** 在复杂问题上陷入僵局时激活 `vc-problem-solving` 技能

## 危险信号

如果脑中出现以下念头，立即停下并遵循流程：

- “先临时修一下，之后再调查”
- “随便改一下 X 试试看行不行”
- “多半是 X，直接修掉吧”
- “现在应该没问题了” / “看起来修好了”
- “测试通过了，搞定了”

**以上所有念头都意味着：** 回到系统化流程。
