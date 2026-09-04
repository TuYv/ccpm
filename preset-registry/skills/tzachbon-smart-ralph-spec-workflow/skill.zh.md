---
name: spec-workflow
description: This skill should be used when the user asks to "build a feature", "create a spec", "start spec-driven development", "run research phase", "generate requirements", "create design", "plan tasks", "implement spec", "check spec status", "triage a feature", "create an epic", "decompose a large feature", or needs guidance on spec-driven development workflow, phase ordering, or epic orchestration.
version: 0.2.0
---
# 规格工作流

规格驱动开发通过一系列顺序阶段将功能请求转化为结构化的规格，然后逐个任务执行。

## 决策树：从哪里开始

| 情况 | 命令 |
|-----------|---------|
| 新功能，需要引导 | `/ralph-specum:start <name> <goal>` |
| 新功能，跳过访谈 | `/ralph-specum:start <name> <goal> --quick` |
| 需要拆解的大型功能 | `/ralph-specum:triage <goal>` |
| 恢复现有规格 | `/ralph-specum:start`（自动检测） |
| 跳转到特定阶段 | `/ralph-specum:<phase>` |

## 单个规格流程

```
start/new -> research -> requirements -> design -> tasks -> implement
                         ^
                         optional prototype overlay, then return
```

每个阶段都会在解析后的 `<basePath>/` 下生成一个 markdown 工件。普通模式会在各阶段之间暂停以等待批准。快速模式则运行所有阶段后自动开始执行。

原型是一个可选的叠加层，而非主阶段。主 `phase` 始终为 `research`、`requirements`、`design`、`tasks` 或 `execution`；进行中的原型工作存储在 `activePrototypes` 中。在执行任何叠加层操作之前，请先解析配置的规格根目录和 `basePath`。在建议、启动、恢复、取消或使用原型证据时，请遵循 [`references/phase-transitions.md`](references/phase-transitions.md)。

### 阶段命令

| 命令 | 代理 | 输出 | 用途 |
|---------|-------|--------|---------|
| `/ralph-specum:research` | research-analyst | research.md | 探索可行性、模式与上下文 |
| `/ralph-specum:requirements` | product-manager | requirements.md | 用户故事、验收标准 |
| `/ralph-specum:design` | architect-reviewer | design.md | 架构、组件、接口 |
| `/ralph-specum:tasks` | task-planner | tasks.md | 以 POC 优先的任务拆解 |
| `/ralph-specum:implement` | spec-executor | commits | 自主逐任务执行 |
| `/ralph-specum:prototype` | prototype-builder | prototypes/&lt;id&gt;.md | 隔离测试一个可证伪的设计问题 |

普通模式可以在研究或需求阶段之后建议原型，而捕获、裁决、移交和删除等决策由用户负责。可以从任何主阶段直接调用。快速模式在需求阶段之后最多运行一个由代理负责的请求；当存在设计阻塞项时，会接管最旧的一项；不提出任何决策性问题，并始终继续进入设计阶段。

## 史诗流程（多规格）

对于过于庞大、单个规格无法承载的功能，可使用史诗分诊将其拆解为感知依赖关系的多个规格。

```
triage -> [spec-1, spec-2, spec-3...] -> implement each in order
```

**入口：**
- `/ralph-specum:triage <goal>` —— 创建或恢复一个史诗
- `/ralph-specum:start` —— 检测活跃的史诗并建议下一个未被阻塞的规格

**文件结构：**
```
specs/
  _epics/<epic-name>/
    epic.md            # Triage output (vision, specs, dependency graph)
    research.md        # Exploration + validation research
    .epic-state.json   # Progress tracking across specs
    .progress.md       # Learnings and decisions
```

## 管理命令

| 命令 | 用途 |
|---------|---------|
| `/ralph-specum:status` | 显示所有规格及进度 |
| `/ralph-specum:switch <name>` | 切换活跃规格 |
| `/ralph-specum:cancel` | 取消当前执行 |
| `/ralph-specum:refactor` | 执行后更新规格文件 |

## 常见工作流

### 快速工作流
```bash
/ralph-specum:start my-feature "Build X" --quick
# Runs all phases automatically, starts execution
# May run one unattended prototype request after requirements
```

### 引导式开发
```bash
/ralph-specum:start my-feature "Build X"
# Fact-first grilling at each phase
# Review and approve each artifact
/ralph-specum:implement
```

### 大型功能
```bash
/ralph-specum:triage "Build entire auth system"
# Decomposes into: auth-core, auth-oauth, auth-rbac
/ralph-specum:start  # Picks next unblocked spec
```

## 参考

- **`references/phase-transitions.md`** —— 阅读以了解阶段流转、原型叠加层的进入与返回、快速模式所有权、恢复或跳过阶段
