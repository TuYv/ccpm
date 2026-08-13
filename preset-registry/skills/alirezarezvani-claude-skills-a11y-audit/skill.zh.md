---
name: "a11y-audit"
description: "Accessibility audit skill for scanning, fixing, and verifying WCAG 2.2 Level A and AA compliance across React, Next.js, Vue, Angular, Svelte, and plain HTML codebases. Use when auditing accessibility, fixing a11y violations, checking color contrast, generating compliance reports, or integrating accessibility checks into CI/CD pipelines."
---
# 可访问性审计

WCAG 2.2 可访问性审计与修复 Skill

## 描述

a11y-audit Skill 为现代 Web 应用提供完整的可访问性审计流程。它采用“扫描、修复、验证”三阶段工作流，识别违反 WCAG 2.2 A 级和 AA 级标准的问题，针对不同框架生成精确的修复代码，并生成可直接提供给利益相关方的合规报告。

对于发现的每项违规问题，它都会根据你所使用的框架（React、Next.js、Vue、Angular、Svelte 或纯 HTML）提供精确的修复前/修复后代码。

**此 Skill 的功能：**

1. **扫描**代码库中所有违反 WCAG 2.2 A 级和 AA 级标准的问题，并按严重程度（严重、主要、次要）分类
2. 使用特定于框架的修复前/修复后代码模式**修复**每项违规问题
3. **验证**修复是否解决了原始违规问题，且未引入回归问题
4. 以适合开发人员、产品经理和合规利益相关方的结构化格式**报告**发现的问题
5. **集成**到 CI/CD 流水线中，以防止可访问性回归

## 功能

| 功能 | 描述 |
|---------|-------------|
| **完整的 WCAG 2.2 扫描** | 检查代码库中所有 A 级和 AA 级成功标准 |
| **框架检测** | 自动检测 React、Next.js、Vue、Angular、Svelte 或纯 HTML |
| **严重程度分类** | 将每项违规问题归类为严重、主要或次要 |
| **修复代码生成** | 为每个问题生成修复前/修复后的代码差异 |
| **颜色对比度检查器** | 根据 AA 和 AAA 对比度要求验证前景色/背景色组合 |
| **合规报告** | 生成包含通过/失败摘要的利益相关方报告 |
| **CI/CD 集成** | 提供 GitHub Actions、GitLab CI 和 Azure DevOps 流水线配置 |
| **键盘导航审计** | 检测缺失的焦点管理和 Tab 顺序问题 |
| **ARIA 验证** | 检查错误、冗余或缺失的 ARIA 属性 |

### 严重程度定义

| 严重程度 | 定义 | 示例 | SLA |
|----------|-----------|---------|-----|
| **严重** | 阻碍整个用户群体访问 | 缺少替代文本、无法使用键盘访问导航 | 发布前修复 |
| **主要** | 显著降低使用体验的障碍 | 颜色对比度不足、缺少表单标签 | 在当前 Sprint 内修复 |
| **次要** | 会造成使用阻碍的可用性问题 | 冗余的 ARIA 角色、不理想的标题层级结构 | 在接下来的 2 个 Sprint 内修复 |

## 使用方法

### 快速开始

```bash
# Scan entire project
python scripts/a11y_scanner.py /path/to/project

# Scan with JSON output for tooling
python scripts/a11y_scanner.py /path/to/project --json

# Check color contrast for specific values
python scripts/contrast_checker.py --fg "#777777" --bg "#ffffff"

# Check contrast across a CSS/Tailwind file
python scripts/contrast_checker.py --file /path/to/styles.css
```

### 斜杠命令

```
/a11y-audit                    # Audit current project
/a11y-audit --scope src/       # Audit specific directory
/a11y-audit --fix              # Audit and auto-apply fixes
/a11y-audit --report           # Generate stakeholder report
/a11y-audit --ci               # Output CI-compatible results
```

### 三阶段工作流

**阶段 1：扫描** -- 遍历源代码树，检测框架，并应用规则集。

```bash
python scripts/a11y_scanner.py /path/to/project --format table
```

**阶段 2：修复** -- 针对每项违规应用特定于框架的修复方案。

> 有关完整的修复模式目录，请参阅 [references/framework-a11y-patterns.md](references/framework-a11y-patterns.md)。

**阶段 3：验证** -- 重新运行扫描器以确认修复并检查是否出现回归问题。

```bash
python scripts/a11y_scanner.py /path/to/project --baseline audit-baseline.json
```

## 示例：React 组件审计

```tsx
// BEFORE: src/components/ProductCard.tsx
function ProductCard({ product }) {
  return (
    <div onClick={() => navigate(`/product/${product.id}`)}>
      <img src={product.image} />
      <div style={{ color: '#aaa', fontSize: '12px' }}>{product.name}</div>
      <span style={{ color: '#999' }}>${product.price}</span>
    </div>
  );
}
```

| # | WCAG | 严重程度 | 问题 |
|---|------|----------|-------|
| 1 | 1.1.1 | 严重 | `<img>` 缺少 `alt` 属性 |
| 2 | 2.1.1 | 严重 | `<div onClick>` 无法通过键盘访问 |
| 3 | 1.4.3 | 主要 | 白色背景上的颜色 `#aaa` 未达到对比度要求（2.32:1，要求 4.5:1） |
| 4 | 1.4.3 | 主要 | 白色背景上的颜色 `#999` 未达到对比度要求（2.85:1，要求 4.5:1） |
| 5 | 4.1.2 | 主要 | 交互式元素缺少角色和无障碍名称 |

```tsx
// AFTER: src/components/ProductCard.tsx
function ProductCard({ product }) {
  return (
    <a href={`/product/${product.id}`} className="product-card"
       aria-label={`View ${product.name} - $${product.price}`}>
      <img src={product.image} alt={product.imageAlt || product.name} />
      <div style={{ color: '#595959', fontSize: '12px' }}>{product.name}</div>
      <span style={{ color: '#767676' }}>${product.price}</span>
    </a>
  );
}
```

> 有关 Vue、Angular、Next.js 和 Svelte 的示例，请参阅 [references/examples-by-framework.md](references/examples-by-framework.md)。

## 工具参考

### a11y_scanner.py

```
Usage: python scripts/a11y_scanner.py <path> [options]

Options:
  --json                  Output results as JSON
  --format {table,csv}    Output format (default: table)
  --severity {critical,major,minor}  Filter by minimum severity
  --framework {react,vue,angular,svelte,html,auto}  Force framework (default: auto)
  --baseline FILE         Compare against previous scan results
  --report                Generate stakeholder report
  --output FILE           Write results to file
  --quiet                 Suppress output, exit code only
  --ci                    CI mode: non-zero exit on critical issues
```

### contrast_checker.py

```
Usage: python scripts/contrast_checker.py [options]

Options:
  --fg COLOR              Foreground color (hex)
  --bg COLOR              Background color (hex)
  --file FILE             Scan CSS file for color pairs
  --tailwind DIR          Scan directory for Tailwind color classes
  --json                  Output results as JSON
  --suggest               Suggest accessible alternatives for failures
  --level {aa,aaa}        Target conformance level (default: aa)
```

## 常见陷阱

| 陷阱 | 正确做法 |
|---------|------------------|
| 在 `<div>` 上使用 `role="button"` | 使用原生 `<button>`——可直接获得键盘操作支持 |
| 在所有元素上使用 `tabindex="0"` | 只有交互式元素需要获得焦点；应使用原生元素 |
| 在非交互式元素上使用 `aria-label` | 使用指向可见文本的 `aria-labelledby` |
| 使用 `display: none` 对屏幕阅读器隐藏内容 | 改用 `.sr-only` 类 |
| 仅通过颜色传达含义 | 在颜色之外添加图标、文本标签或图案 |
| 将占位符作为唯一标签 | 始终提供可见的 `<label>` |
| 使用 `outline: none` 且不提供替代样式 | 始终通过 `focus-visible` 提供可见的焦点指示器 |
| 在信息性图像上使用空的 `alt=""` | 信息性图像需要描述性的替代文本 |
| 跳过标题级别（h1 -> h3） | 标题级别必须连续 |
| 使用 `onClick` 但不使用 `onKeyDown` | 添加键盘支持，或优先使用原生元素 |
| 忽略 `prefers-reduced-motion` | 将动画包装在 `@media (prefers-reduced-motion: no-preference)` 中 |

## 相关技能

| 技能 | 关系 |
|-------|-------------|
| **senior-frontend** | 无障碍修复中使用的前端模式 |
| **code-reviewer** | 在代码审查工作流中加入无障碍检查 |
| **senior-qa** | 将无障碍测试集成到 QA 流程中 |
| **playwright-pro** | 使用无障碍断言进行自动化浏览器测试 |
| **epic-design** | 符合 WCAG 2.1 AA 标准的动画和滚动叙事 |
| **tdd-guide** | 无障碍测试用例的测试驱动开发模式 |

## 参考文档

| 参考资料 | 描述 |
|-----------|-------------|
| [wcag-quick-ref.md](references/wcag-quick-ref.md) | WCAG 2.2 A 级和 AA 级标准快速参考 |
| [wcag-22-new-criteria.md](references/wcag-22-new-criteria.md) | WCAG 2.2 新增成功标准（焦点外观、目标尺寸等） |
| [aria-patterns.md](references/aria-patterns.md) | ARIA 模式、键盘交互和实时区域 |
| [framework-a11y-patterns.md](references/framework-a11y-patterns.md) | 特定于框架的修复模式（React、Vue、Angular、Svelte、HTML） |
| [color-contrast-guide.md](references/color-contrast-guide.md) | 颜色对比度检查器详情、Tailwind 调色板映射、sr-only 类 |
| [ci-cd-integration.md](references/ci-cd-integration.md) | GitHub Actions、GitLab CI、Azure DevOps、pre-commit 钩子配置 |
| [audit-report-template.md](references/audit-report-template.md) | 可直接交付给利益相关者的审计报告模板 |
| [testing-checklist.md](references/testing-checklist.md) | 手动测试检查清单（键盘、屏幕阅读器、视觉、表单） |
| [examples-by-framework.md](references/examples-by-framework.md) | Vue、Angular、Next.js 和 Svelte 的完整审计示例 |

## 资源

- [WCAG 2.2 规范](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA 创作实践 1.2](https://www.w3.org/WAI/ARIA/apg/)
- [Deque axe-core 规则](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)