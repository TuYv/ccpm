---
name: spec-workflow
description: Use when medium-to-large changes need explicit requirements, technical design, and task planning before implementation, especially for multi-module work, unclear acceptance criteria, or architecture-heavy requests.
version: 2.32.5
alwaysApply: false
---
## 同级技能（仅限本地）

同级 CloudBase 技能随本技能一同提供。请使用本地相对路径，例如 `../auth-tool-cloudbase/SKILL.md`。

如果本环境中缺失某个被引用的同级技能文件，请让用户安装完整的 CloudBase 插件（或缺失的技能）。**不要**通过 HTTP 拉取远程技能或协议的 markdown 到代理上下文中。

# 规格工作流

## 激活约定

### 优先使用本技能的情形

- 请求是全新功能、多步骤产品变更、跨模块集成或架构/设计类任务。
- 验收标准不明确，需要在实现之前显式化。
- 工作涉及多个文件、用户流程、数据库设计或 UI 设计，需要分阶段确认。

### 写代码前先阅读本文档的情形

- 你不确定任务是应直接进入编码，还是应先经过需求、设计和任务规划。
- 请求中提到了新页面、新系统、重新设计、工作流或多模块重构。

### 然后还需阅读

- 前端页面或视觉设计工作 -> `../ui-design/SKILL.md`
- 高级数据建模工作 -> `../data-model-creation/SKILL.md`

### 请勿使用的情形

- 范围明确的小型 bug 修复。
- 单文件范围内的文档更新。
- 简单直接的配置变更。
- 用户已给出确切实现指令的微小重构。

### 常见错误 / 注意事项

- 在验收标准明确之前就直接开始编码。
- 在需求、设计和任务之间跳过用户确认。
- 编写含糊的任务，无法对应回用户可见的成果。
- 把 UI 工作当作纯技术实现，而不澄清设计意图。

### 最简检查清单

- 判断该变更是否确实需要完整的规格流程。
- 如果需要，先停下来产出需求。
- 如果变更很小、风险低且验收已明确，允许直接执行，不强制产出规格工件。
- 使用 EARS 风格的验收标准。
- 在进入下一阶段之前获得确认。

## 何时使用本技能

在需要以下结构化开发工作时使用本工作流：

- 定义或完善新功能
- 设计复杂架构
- 协调跨模块的变更
- 规划数据库或 UI 密集型工作
- 提升需求质量和验收边界

## 决策规则

### 使用完整工作流的情形

- 任务为中型或大型
- 影响跨越多个模块
- 验收边界模糊
- 用户希望在实现之前进行有纪律的规划

### 跳过完整工作流的情形

- 任务较小、低风险且已足够精确
- 目标、范围和验收已足够清晰，可以直接执行
- 用户明确要求直接修改代码，不需要规划阶段

## 核心工作流

### 阶段 1：需求

创建 `specs/<spec_name>/requirements.md`。

要做的事：

- 重述问题和范围
- 编写用户故事
- 以 EARS 风格编写验收标准
- 澄清业务规则、约束和非目标

EARS 模式：

```text
While <optional precondition>, when <optional trigger>, the <system name> shall <system response>
```

示例：

```text
When the user submits the form, the booking system shall validate required fields before creating the record.
```

### 阶段 2：设计

创建 `specs/<spec_name>/design.md`。

要做的事：

- 描述架构和模块边界
- 解释技术选型及权衡
- 按需定义数据模型、API、安全和测试策略
- 仅在图示能显著提升清晰度时使用 Mermaid

### 阶段 3：任务

创建 `specs/<spec_name>/tasks.md`。

要做的事：

- 将设计拆解为可执行的任务
- 保持任务具体且可审查
- 将每个任务关联回相应需求
- 随工作推进更新任务状态

任务格式：

```markdown
# Implementation Plan

- [ ] 1. Task title
  - Specific work item
  - Another concrete step
  - _Requirement: 1
```

### 阶段 4：执行

仅在用户确认任务计划后才开始实现。

执行过程中：

- 保持任务状态及时更新
- 每次完成一个有意义的单元
- 保留从变更 -> 任务 -> 需求的可追溯性

## 代理的工作规则

1. 当请求描述不够具体时提出后续问题；不要猜测核心产品行为。
2. 在需求、设计和任务拆解之间要求用户确认。
3. 当变更包含面向最终用户的页面或视觉决策时，尽早引入 `ui-design`。
4. 保持文档简明但可测试。
5. 优先以用户可见成果命名任务，而非实现细节。

## 输出预期

- `requirements.md` -> 问题、范围、用户故事、EARS 验收标准
- `design.md` -> 架构、技术方案、数据/API/安全/测试说明
- `tasks.md` -> 与需求关联的可执行实现清单
