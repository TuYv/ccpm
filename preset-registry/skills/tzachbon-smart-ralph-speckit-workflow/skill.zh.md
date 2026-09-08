---
name: speckit-workflow
description: Comprehensive understanding of the spec-kit methodology. Constitution-driven feature development with specify, plan, tasks, and implement phases.
version: 0.1.0
---
# SpecKit 工作流

SpecKit 方法论是一种以宪章为驱动的功能开发方法。它通过将所有决策立足于项目原则，确保各功能之间的一致性。

## 核心理念

**宪章优先**：每个功能都依据项目宪章来设计——宪章是一份记录原则、约束和标准的动态文档。

**治理优于惯例**：SpecKit 不依赖隐式模式，而是通过以下方式让治理显式化：
- 宪章原则（MUST、SHOULD、MAY）
- 与原则挂钩的功能规格说明
- 作为“需求单元测试”的质量检查清单
- 跨产物的一致性分析

## 目录结构

```text
.specify/
├── memory/
│   └── constitution.md       # Project principles and standards
├── .current-feature          # Active feature pointer
├── templates/                # Artifact templates
│   ├── spec-template.md
│   ├── plan-template.md
│   ├── tasks-template.md
│   └── checklist-template.md
└── specs/
    └── <id>-<name>/          # Feature directories
        ├── .speckit-state.json
        ├── .progress.md
        ├── .coordinator-prompt.md
        ├── spec.md           # Feature specification
        ├── plan.md           # Technical design
        ├── tasks.md          # Implementation tasks
        ├── research.md       # Research findings (optional)
        ├── data-model.md     # Entity definitions (optional)
        ├── contracts/        # API contracts (optional)
        └── checklists/       # Quality checklists
```

## 功能 ID 系统

功能使用自动递增的三位数 ID：
- `001-user-auth`
- `002-payment-gateway`
- `003-notification-system`

优势：
- 在文件系统中自然排序
- 便于在提交/PR 中引用
- 避免命名冲突

## 工作流阶段

### 阶段 1：宪章（`/speckit:constitution`）

建立或更新项目全局原则。

**输入**：项目背景、团队偏好
**输出**：`.specify/memory/constitution.md`

宪章包含的章节：
- **标识**：项目名称、目的、核心领域
- **原则**：MUST/SHOULD/MAY 规则
- **技术栈**：语言、框架、工具
- **模式**：架构、命名、错误处理
- **质量标准**：测试、性能、安全

### 阶段 2：规格定义（`/speckit:specify`）

依据宪章定义功能规格说明。

**输入**：功能目标、宪章引用
**输出**：`spec.md`

规格说明包含：
- 功能概述与目标
- 带验收标准的用户故事
- 宪章对齐标记
- 范围外事项
- 依赖与风险

### 阶段 3：澄清（`/speckit:clarify`）——可选

通过结构化问答解决歧义。

**输入**：存在歧义的 `spec.md`
**输出**：附带澄清说明的更新版 `spec.md`

规则：
- 每次会话最多 5 个澄清问题
- 每个问题提供 2-4 个选项 + “其他”
- 在适用时标注推荐项
- 澄清内容追加到规格说明中

### 阶段 4：规划（`/speckit:plan`）

根据规格说明生成技术设计。

**输入**：`spec.md`、宪章、代码库上下文
**输出**：`plan.md`，以及可选的 `data-model.md`、`contracts/`

规划包含：
- 架构概览
- 组件拆解
- 数据流图
- API 契约
- 集成点
- 风险缓解

### 阶段 5：任务（`/speckit:tasks`）

将规划拆解为按依赖顺序排列的实现任务。

**输入**：`plan.md`、`spec.md`
**输出**：`tasks.md`

任务格式：
```markdown
- [ ] T001 [P] [US1] Task description `path/to/file.ts`
```

组成部分：
- `T001`：顺序任务 ID
- `[P]`：并行标记（可选）
- `[US1]`：用户故事引用（可选）
- 带文件路径的描述

任务阶段：
1. **搭建**：环境、依赖、脚手架
2. **核心**：主要实现任务
3. **集成**：连接各组件
4. **打磨**：错误处理、边界情况
5. **验证**：质量检查点

### 阶段 6：实现（`/speckit:implement`）

通过 Ralph Wiggum 循环执行任务。

**输入**：`tasks.md`、状态文件
**输出**：代码变更、提交、更新后的进度

执行模型：
- 协调者读取状态，并委派给执行者
- 推进前进行 4 层验证
- 对标记了 [P] 的任务并行执行
- 每个任务使用全新上下文

## 状态管理

### 状态文件（`.speckit-state.json`）

```json
{
  "featureId": "001",
  "name": "user-auth",
  "basePath": ".specify/specs/001-user-auth",
  "phase": "execution",
  "taskIndex": 0,
  "totalTasks": 15,
  "taskIteration": 1,
  "maxTaskIterations": 5,
  "globalIteration": 1,
  "maxGlobalIterations": 100,
  "awaitingApproval": false
}
```

### 进度文件（`.progress.md`）

记录：
- 已完成的任务及对应的提交哈希
- 供后续任务使用的经验与上下文
- 阻塞项及其解决方式
- 跨任务依赖

## 质量保证

### 检查清单（`/speckit:checklist`）

针对特定领域的质量检查清单：
- UX 检查清单
- API 检查清单
- 安全检查清单
- 性能检查清单
- 无障碍检查清单

检查清单是“需求的单元测试”——在实现之前可验证的准则。

### 分析（`/speckit:analyze`）

跨产物一致性分析：
- 规格 ↔ 宪章对齐
- 规划 ↔ 规格覆盖度
- 任务 ↔ 规划可追溯性
- 识别缺口、冲突、歧义

## 命令参考

| 命令 | 用途 | 阶段 |
|---------|---------|-------|
| `/speckit:start <name>` | 创建或恢复功能 | 入口 |
| `/speckit:constitution` | 创建/更新项目原则 | 1 |
| `/speckit:specify` | 定义功能规格说明 | 2 |
| `/speckit:clarify` | 解决规格歧义 | 3 |
| `/speckit:plan` | 生成技术设计 | 4 |
| `/speckit:tasks` | 将规划拆解为任务 | 5 |
| `/speckit:implement` | 执行任务 | 6 |
| `/speckit:analyze` | 检查一致性 | 任意 |
| `/speckit:checklist` | 生成质量检查清单 | 任意 |
| `/speckit:status` | 显示当前状态 | 任意 |
| `/speckit:switch <id>` | 切换当前功能 | 任意 |
| `/speckit:cancel` | 停止执行并清理 | 任意 |

## 智能体生态

| 智能体 | 用途 | 使用命令 |
|-------|---------|---------|
| `constitution-architect` | 创建/更新宪章 | constitution |
| `spec-analyst` | 生成规格说明 | specify |
| `plan-architect` | 技术设计 | plan |
| `task-planner` | 任务拆解 | tasks |
| `spec-executor` | 执行单个任务 | implement |
| `qa-engineer` | 验证任务 | implement |

## 宪章集成

所有阶段都会引用宪章：

1. **规格定义**：将功能映射到宪章原则
2. **规划**：架构遵循宪章模式
3. **任务**：质量检查点强制执行宪章
4. **实现**：执行者依据标准进行验证

产物中的宪章标记：
- `[C§3.1]`：引用宪章第 3.1 节
- `[MUST]`：宪章强制要求
- `[SHOULD]`：宪章推荐
- `[MAY]`：按宪章可选

## 最佳实践

### 启动新功能

1. 确保宪章存在且为最新
2. 使用描述性的功能名称（kebab-case）
3. 在规格说明中包含明确的成功标准
4. 如适用，引用相关功能

### 实现过程中

1. 按任务顺序执行（依赖关系很重要）
2. 每完成一个任务就提交一次
3. 将经验心得更新到进度文件
4. 运行验证检查点

### 维护宪章

1. 对宪章变更采用语义化版本管理
2. 更新后运行同步影响分析
3. 如有需要，更新受影响的功能
4. 记录变更理由
