---
name: feature-planning
description: Break down feature requests into detailed, implementable plans with clear tasks. Use when user requests a new feature, enhancement, or complex change.
---
# 功能规划

系统地分析功能请求，并创建详细且可执行的实施计划。

## 何时使用

- 请求新功能（“添加用户身份验证”“构建仪表板”）
- 要求增强功能（“提升性能”“添加导出功能”）
- 描述复杂的多步骤变更
- 明确要求进行规划（“规划如何实现 X”）
- 提供需要进一步澄清的模糊需求

## 规划工作流程

### 1. 理解需求

**提出澄清问题：**
- 这要解决什么问题？
- 用户是谁？
- 有哪些具体的技术约束？
- 成功的标准是什么？

**探索代码库：**
使用 Task 工具，并设置 `subagent_type='Explore'` 和 `thoroughness='medium'`，以了解：
- 现有架构和模式
- 可供参考的类似功能
- 新代码应放置的位置
- 哪些部分会受到影响

### 2. 分析与设计

**确定组件：**
- 数据库变更（模型、迁移、模式）
- 后端逻辑（API 端点、业务逻辑、服务）
- 前端变更（UI、状态、路由）
- 测试要求
- 文档更新

**考虑架构：**
- 遵循现有模式（查看 CLAUDE.md）
- 确定可复用的组件
- 规划错误处理和边界情况
- 考虑性能影响
- 考虑安全性和验证

**检查依赖项：**
- 所需的新软件包/库
- 与现有技术栈的兼容性
- 所需的配置变更

### 3. 创建实施计划

将功能拆分为**独立且有顺序的任务**：

```markdown
## Feature: [Feature Name]

### Overview
[Brief description of what will be built and why]

### Architecture Decisions
- [Key decision 1 and rationale]
- [Key decision 2 and rationale]

### Implementation Tasks

#### Task 1: [Component Name]
- **File**: `path/to/file.py:123`
- **Description**: [What needs to be done]
- **Details**:
  - [Specific requirement 1]
  - [Specific requirement 2]
- **Dependencies**: None (or list task numbers)

#### Task 2: [Component Name]
...

### Testing Strategy
- [What types of tests needed]
- [Critical test cases to cover]

### Integration Points
- [How this connects with existing code]
- [Potential impacts on other features]
```

**包含具体引用：**
- 带行号的文件路径（`src/utils/auth.py:45`）
- 应遵循的现有模式
- 相关文档

### 4. 与用户评审计划

确认：
- 这是否符合预期？
- 是否有遗漏的需求？
- 是否需要调整优先级或方法？
- 是否已准备好继续？

### 5. 使用 plan-implementer 执行

为每项任务启动 plan-implementer 代理：

```
Task tool with:
- subagent_type: 'plan-implementer'
- description: 'Implement [task name]'
- prompt: Detailed task description from plan
```

**执行策略：**
- 按顺序实施（遵循依赖关系）
- 在开始下一项任务前验证当前任务
- 如果发现问题，则调整计划
- 让 test-fixing 技能处理失败
- 让 git-pushing 技能处理提交

## 最佳实践

**规划：**
- 先从宏观入手，再深入细节
- 引用现有代码模式
- 包含文件路径和行号
- 提前考虑边界情况
- 保持任务聚焦且原子化

**沟通：**
- 解释架构决策
- 突出权衡与替代方案
- 明确说明假设
- 为未来的维护者提供上下文

**执行：**
- 每次实现一项任务
- 验证后再继续
- 及时向用户同步进展
- 根据新发现进行调整

## 集成

- **plan-implementer agent**：接收任务规格并实施
- **test-fixing skill**：测试失败时自动触发
- **git-pushing skill**：提交时触发