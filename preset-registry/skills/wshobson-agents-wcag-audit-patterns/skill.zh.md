---
name: wcag-audit-patterns
description: Conduct WCAG 2.2 accessibility audits with automated testing, manual verification, and remediation guidance. Use when auditing websites for accessibility, fixing WCAG violations, or implementing accessible design patterns.
---
# WCAG 审计模式

对照 WCAG 2.2 指南审计 Web 内容的综合指南，附带可操作的整改策略。

## 何时使用本技能

- 开展无障碍审计
- 修复 WCAG 违规问题
- 实现无障碍组件
- 为无障碍诉讼做准备
- 满足 ADA/Section 508 要求
- 达到 VPAT 合规

## 核心概念

### 1. WCAG 一致性级别

| 级别    | 描述               | 适用范围      |
| ------- | ------------------ | ------------- |
| **A**   | 最低无障碍水平     | 法律底线      |
| **AA**  | 标准一致性         | 多数法规      |
| **AAA** | 增强无障碍水平     | 特殊需求      |

### 2. POUR 原则

```
Perceivable:  Can users perceive the content?
Operable:     Can users operate the interface?
Understandable: Can users understand the content?
Robust:       Does it work with assistive tech?
```

### 3. 按影响程度分类的常见违规问题

```
Critical (Blockers):
├── Missing alt text for functional images
├── No keyboard access to interactive elements
├── Missing form labels
└── Auto-playing media without controls

Serious:
├── Insufficient color contrast
├── Missing skip links
├── Inaccessible custom widgets
└── Missing page titles

Moderate:
├── Missing language attribute
├── Unclear link text
├── Missing landmarks
└── Improper heading hierarchy
```

## 详细模式与实际示例

详细的模式文档位于 `references/details.md` 中。当上方的导航层级信息不足时，请阅读该文件。

## 最佳实践

### 应该做的

- **尽早开始** - 从设计阶段就考虑无障碍
- **与真实用户一起测试** - 残障用户能提供最好的反馈
- **尽可能自动化** - 可检测出 30-50% 的问题
- **使用语义化 HTML** - 减少 ARIA 的需求
- **记录模式** - 构建无障碍组件库

### 不应该做的

- **不要只依赖自动化测试** - 必须进行手动测试
- **不要把 ARIA 作为首选方案** - 优先使用原生 HTML
- **不要隐藏焦点轮廓** - 键盘用户需要它们
- **不要禁用缩放** - 用户需要调整页面大小
- **不要仅使用颜色传达信息** - 需要多种指示方式
