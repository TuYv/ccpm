---
name: code-auditor
description: Performs comprehensive codebase analysis covering architecture, code quality, security, performance, testing, and maintainability. Use when user wants to audit code quality, identify technical debt, find security issues, assess test coverage, or get a codebase health check.
---
# 代码审计

全面分析代码库，涵盖架构、代码质量、安全性、性能、测试和可维护性。

## 何时使用

- “审计代码”
- “分析代码质量”
- “检查问题”
- “审查代码库”
- “查找技术债务”
- “安全审计”
- “性能审查”

## 分析内容

### 1. 架构与设计
- 整体结构和组织方式
- 使用的设计模式
- 模块边界和关注点分离
- 依赖管理
- 架构决策与权衡

### 2. 代码质量
- 复杂度热点（圈复杂度）
- 代码重复（违反 DRY 原则）
- 命名约定和一致性
- 文档覆盖情况
- 代码异味和反模式

### 3. 安全性
- 常见漏洞（OWASP Top 10）
- 输入验证和清理
- 身份验证和授权
- 密钥管理
- 依赖项漏洞

### 4. 性能
- 算法复杂度问题
- 数据库查询优化
- 内存使用模式
- 缓存机会
- 资源泄漏

### 5. 测试
- 测试覆盖率评估
- 测试质量和有效性
- 缺失的测试场景
- 测试模式和实践
- 集成测试与单元测试的平衡

### 6. 可维护性
- 技术债务评估
- 耦合度和内聚性
- 未来变更的难易程度
- 新成员上手友好度
- 文档质量

## 方法

1. 使用 Explore 代理（全面模式）进行**探索**
2. 使用 Grep 和 Glob **识别模式**
3. **阅读关键文件**以进行详细分析
4. 如果可用，**运行静态分析工具**
5. 将**分析结果整合**为可执行的报告

## 全面程度级别

- **快速**（15-30 分钟）：高层次分析，仅关注关键问题
- **标准**（30-60 分钟）：全面覆盖所有维度
- **深度**（60 分钟以上）：详尽分析并提供详细示例

## 输出格式

```markdown
# Code Audit Report

## Executive Summary
- Overall health score
- Critical issues count
- Top 3 priorities

## Findings by Category

### Architecture & Design
#### 🔴 High Priority
- [Finding with file:line reference]
  - Impact: [description]
  - Recommendation: [action]

#### 🟡 Medium Priority
...

### [Other categories]

## Prioritized Action Plan
1. Quick wins (< 1 day)
2. Medium-term improvements (1-5 days)
3. Long-term initiatives (> 5 days)

## Metrics
- Files analyzed: X
- Lines of code: Y
- Test coverage: Z%
- Complexity hotspots: N
```

## 使用的工具

- **Task（Explore 代理）**：全面探索代码库
- **Grep**：对问题进行模式匹配
- **Glob**：按类型或模式查找文件
- **Read**：详细分析文件
- **Bash**：运行代码检查工具和覆盖率工具

## 成功标准

- 全面覆盖所有六个维度
- 所有发现都提供具体的 file:line 引用
- 严重性/优先级评级（Critical/High/Medium/Low）
- 可执行的建议（而非仅描述观察结果）
- 修复工作量估算
- 同时包含快速见效的改进和长期改进

## 集成

- **feature-planning**：规划技术债务削减
- **test-fixing**：解决已发现的测试缺口
- **project-bootstrapper**：配置质量工具

## 配置

可专注于特定领域：
- 仅安全审计
- 仅性能审计
- 仅测试评估
- 快速架构审查