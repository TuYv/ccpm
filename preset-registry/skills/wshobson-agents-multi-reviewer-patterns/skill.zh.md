---
name: multi-reviewer-patterns
description: Coordinate parallel code reviews across multiple quality dimensions with finding deduplication, severity calibration, and consolidated reporting. Use this skill when organizing multi-reviewer code reviews, calibrating finding severity, or consolidating review results.
version: 1.0.2
---
# 多评审者模式

用于跨多个质量维度协调并行代码评审、对发现项去重、校准严重程度并生成汇总报告的模式。

## 何时使用此技能

- 组织多维代码评审
- 决定分配哪些评审维度
- 对多个评审者的发现项进行去重
- 一致地校准严重程度评级
- 生成汇总评审报告

## 评审维度分配

### 可用维度

| 维度         | 关注点                                   | 何时纳入                             |
| ----------------- | --------------------------------------- | ------------------------------------------- |
| **安全性**      | 漏洞、认证、输入验证 | 处理用户输入或认证的代码始终纳入 |
| **性能**   | 查询效率、内存、缓存       | 更改数据访问或热路径时      |
| **架构**  | SOLID、耦合、设计模式               | 结构性变更或新增模块时       |
| **测试**       | 覆盖率、质量、边界情况           | 新增功能时               |
| **可访问性** | WCAG、ARIA、键盘导航                | UI/前端变更时                     |

### 推荐组合

| 场景               | 维度                                   |
| ---------------------- | -------------------------------------------- |
| API 端点变更   | 安全性、性能、架构          |
| 前端组件     | 架构、测试、可访问性         |
| 数据库迁移     | 性能、架构                    |
| 认证变更 | 安全性、测试                            |
| 完整功能评审    | 安全性、性能、架构、测试 |

## 发现项去重

当多个评审者在同一位置报告问题时：

### 合并规则

1. **同一 file:line、同一问题** — 合并为一项发现，为所有评审者记名
2. **同一 file:line、不同问题** — 保留为独立的发现项
3. **同一问题、不同位置** — 分开保留但相互交叉引用
4. **严重程度冲突** — 采用较高的严重程度评级
5. **建议冲突** — 两条均保留并注明所属评审者

### 去重流程

```
For each finding in all reviewer reports:
  1. Check if another finding references the same file:line
  2. If yes, check if they describe the same issue
  3. If same issue: merge, keeping the more detailed description
  4. If different issue: keep both, tag as "co-located"
  5. Use highest severity among merged findings
```

## 严重程度校准

### 严重程度标准

| 严重程度     | 影响                                        | 可能性             | 示例                                     |
| ------------ | --------------------------------------------- | ---------------------- | -------------------------------------------- |
| **严重** | 数据丢失、安全事件、完全失效  | 必然或极有可能 | SQL 注入、认证绕过、数据损坏  |
| **高**     | 功能受到显著影响、性能退化 | 较有可能                 | 内存泄漏、缺少验证、流程中断 |
| **中**   | 部分影响、存在变通方案             | 可能               | N+1 查询、缺少边界情况处理、错误信息不清晰  |
| **低**      | 影响极小、外观性问题                      | 不太可能               | 风格问题、次要优化、命名      |

### 校准规则

- 可被外部用户利用的安全漏洞：始终定为严重或高
- 热路径中的性能问题：至少定为中
- 关键路径缺少测试：至少定为中
- 核心功能存在可访问性违规：至少定为中
- 不影响功能的代码风格问题：定为低

## 汇总报告模板

```markdown
## Code Review Report

**Target**: {files/PR/directory}
**Reviewers**: {dimension-1}, {dimension-2}, {dimension-3}
**Date**: {date}
**Files Reviewed**: {count}

### Critical Findings ({count})

#### [CR-001] {Title}

**Location**: `{file}:{line}`
**Dimension**: {Security/Performance/etc.}
**Description**: {what was found}
**Impact**: {what could happen}
**Fix**: {recommended remediation}

### High Findings ({count})

...

### Medium Findings ({count
