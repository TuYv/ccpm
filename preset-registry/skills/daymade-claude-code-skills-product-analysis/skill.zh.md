---
name: product-analysis
description: Multi-path parallel product analysis with cross-model test-time compute scaling. Spawns parallel agents (Claude Code agent teams + Codex CLI) to explore product from multiple perspectives, then synthesizes findings into actionable optimization plans. Can invoke competitors-analysis for competitive benchmarking. Use when "product audit", "self-review", "发布前审查", "产品分析", "analyze our product", "UX audit", or "信息架构审计".
argument-hint: [scope: full|ux|api|arch|compare]
---
# 产品分析

通过结合 **Claude Code 智能体团队**和 **Codex CLI**，开展多路径并行产品分析，实现跨模型测试时计算扩展。

**核心原则**：同一分析任务，多个 AI 视角，深度综合。

## 工作原理

```
/product-analysis full
         │
         ├─ Step 0: Auto-detect available tools (codex? competitors?)
         │
    ┌────┼──────────────┐
    │    │              │
 Claude Code         Codex CLI (auto-detected)
 Task Agents         (background Bash)
 (Explore ×3-5)      (×2-3 parallel)
    │                   │
    └────────┬──────────┘
             │
      Synthesis (main context)
             │
      Structured Report
```

## 第 0 步：自动检测可用工具

在启动任何智能体之前，检测有哪些工具可用：

```bash
# Check if Codex CLI is installed
which codex 2>/dev/null && codex --version
```

**决策逻辑**：
- 如果找到 `codex`：告知用户——“检测到 Codex CLI（版本 X）。将运行跨模型分析，以获得更丰富的视角。”
- 如果未找到 `codex`：仅使用 Claude Code 智能体继续执行，不作提示。不要要求用户安装任何内容。

同时检测项目类型，以便针对性地调整智能体提示词：
```bash
# Detect project type
ls package.json 2>/dev/null    # Node.js/React
ls pyproject.toml 2>/dev/null  # Python
ls Cargo.toml 2>/dev/null      # Rust
ls go.mod 2>/dev/null          # Go
```

## 范围模式

解析 `$ARGUMENTS` 以确定分析范围：

| 范围 | 涵盖内容 | 典型智能体 |
|-------|---------------|----------------|
| `full` | UX + API + 架构 + 文档（默认） | 5 个 Claude + Codex（如可用） |
| `ux` | 前端导航、信息密度、用户旅程、空状态、引导流程 | 3 个 Claude + Codex（如可用） |
| `api` | 后端 API 覆盖率、端点健康状况、错误处理、一致性 | 2 个 Claude + Codex（如可用） |
| `arch` | 模块结构、依赖关系图、代码重复、关注点分离 | 2 个 Claude + Codex（如可用） |
| `compare X Y` | 自我审查 + 竞品基准对比（调用 `/competitors-analysis`） | 3 个 Claude + competitors-analysis |

## 阶段 1：并行探索

使用 Task 工具同时启动所有探索智能体（后台模式）。

### Claude Code 智能体（始终运行）

针对每个维度，生成一个 Task 智能体，并设置 `subagent_type: Explore` 和 `run_in_background: true`：

**智能体 A——前端导航与信息密度**
```
Explore the frontend navigation structure and entry points:
1. App.tsx: How many top-level components are mounted simultaneously?
2. Left sidebar: How many buttons/entries? What does each link to?
3. Right sidebar: How many tabs? How many sections per tab?
4. Floating panels: How many drawers/modals? Which overlap in functionality?
5. Count total first-screen interactive elements for a new user.
6. Identify duplicate entry points (same feature accessible from 2+ places).
Give specific file paths, line numbers, and element counts.
```

**智能体 B——用户旅程与空状态**
```
Explore the new user experience:
1. Empty state page: What does a user with no sessions see? Count clickable elements.
2. Onboarding flow: How many steps? What information is presented?
3. Prompt input area: How many buttons/controls surround the input box? Which are high-frequency vs low-frequency?
4. Mobile adaptation: How many nav items? How does it differ from desktop?
5. Estimate: Can a new user complete their first conversation in 3 minutes?
Give specific file paths, line numbers, and UX assessment.
```

**智能体 C — 后端 API 与健康状况**
```
Explore the backend API surface:
1. List ALL API endpoints (method + path + purpose).
2. Identify endpoints that are unused or have no frontend consumer.
3. Check error handling consistency (do all endpoints return structured errors?).
4. Check authentication/authorization patterns (which endpoints require auth?).
5. Identify any endpoints that duplicate functionality.
Give specific file paths and line numbers.
```

**智能体 D — 架构与模块结构**（仅限 full/arch 范围）
```
Explore the module structure and dependencies:
1. Map the module dependency graph (which modules import which).
2. Identify circular dependencies or tight coupling.
3. Find code duplication across modules (same pattern in 3+ places).
4. Check separation of concerns (does each module have a single responsibility?).
5. Identify dead code or unused exports.
Give specific file paths and line numbers.
```

**智能体 E — 文档与配置一致性**（仅限 full 范围）
```
Explore documentation and configuration:
1. Compare README claims vs actual implemented features.
2. Check config file consistency (base.yaml vs .env.example vs code defaults).
3. Find outdated documentation (references to removed features/files).
4. Check test coverage gaps (which modules have no tests?).
Give specific file paths and line numbers.
```

### Codex CLI 智能体（自动检测）

如果在步骤 0 中检测到 Codex CLI，则通过后台 Bash 并行启动 Codex 分析。

每次 Codex 调用都会获得相同的维度提示词，但从不同模型的视角进行分析：

```bash
codex -m o4-mini \
  -c model_reasoning_effort="high" \
  --full-auto \
  "Analyze the frontend navigation structure of this project. Count all interactive elements visible to a new user on first screen. Identify duplicate entry points where the same feature is accessible from 2+ places. Give specific file paths and counts."
```

并行运行 2-3 个 Codex 命令（后台 Bash），每个主要维度运行一个。

**重要**：Codex 在项目的工作目录中运行。它拥有完整的文件系统访问权限。`--full-auto` 标志（旧版本使用 `--dangerously-bypass-approvals-and-sandbox`）可启用自主执行。

## 阶段 2：竞品基准分析（仅限 compare 范围）

当范围为 `compare` 时，为每个竞品调用 competitors-analysis skill：

```
Use the Skill tool to invoke: /competitors-analysis {competitor-name} {competitor-url}
```

这会委托给正交的 `competitors-analysis` skill，由其处理：
- 仓库克隆与验证
- 基于证据的代码分析（file:line 引用）
- 竞品画像生成

## 阶段 3：综合分析

所有智能体完成后，在主对话上下文中综合分析结果。

### 交叉验证

对比各智能体的发现（Claude 与 Claude、Claude 与 Codex）：
- **一致** = 高置信度发现
- **不一致** = 深入调查（某个智能体可能遗漏了上下文）
- **仅 Codex 发现** = 不同模型的视角，需手动验证

### 量化

从智能体报告中提取硬性数据：

| 指标 | 衡量内容 |
|--------|----------------|
| 首屏交互元素 | 新用户可见的按钮/链接/输入框总数 |
| 功能入口点重复 | 具有 2 个及以上入口点的功能数量 |
| 无前端消费者的 API 端点 | 未使用的后端路由数量 |
| 从引导到首次获得价值的步骤 | 从启动到首次成功操作所需的步骤数 |
| 模块耦合分数 | 循环依赖或双向依赖的数量 |

### 结构化输出

生成分层优化报告：

```markdown
## Product Analysis Report

### Executive Summary
[1-2 sentences: key finding]

### Quantified Findings
| Metric | Value | Assessment |
|--------|-------|------------|
| ... | ... | ... |

### P0: Critical (block launch)
[Issues that prevent basic usability]

### P1: High Priority (launch week)
[Issues that significantly degrade experience]

### P2: Medium Priority (next sprint)
[Issues worth addressing but not blocking]

### Cross-Model Insights
[Findings that only one model identified — worth investigating]

### Competitive Position (if compare scope)
[How we compare on key dimensions]
```

## 工作流检查清单

- [ ] 解析 `$ARGUMENTS` 以确定范围
- [ ] 自动检测 Codex CLI 是否可用（`which codex`）
- [ ] 自动检测项目类型（package.json / pyproject.toml / 等）
- [ ] 启动 Claude Code Explore 智能体（3-5 个并行、后台运行）
- [ ] 如果检测到 Codex CLI，则启动 Codex CLI 命令（2-3 个并行、后台运行）
- [ ] 如果范围为 `compare`，则调用 `/competitors-analysis`
- [ ] 收集所有智能体结果
- [ ] 交叉验证发现
- [ ] 量化指标
- [ ] 生成具有 P0/P1/P2 优先级的结构化报告

## 参考资料

- [references/analysis_dimensions.md](references/analysis_dimensions.md) — 详细的审计维度定义和提示词
- [references/synthesis_methodology.md](references/synthesis_methodology.md) — 如何对多智能体发现进行加权和合并
- [references/codex_patterns.md](references/codex_patterns.md) — Codex CLI 调用模式和标志参考