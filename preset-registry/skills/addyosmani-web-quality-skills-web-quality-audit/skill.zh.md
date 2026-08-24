---
name: web-quality-audit
description: Run an evidence-led web quality audit covering performance, accessibility, SEO, best practices, and agentic browsing. Use when asked to "audit my site", "review web quality", "run lighthouse audit", "check page quality", or "optimize my website".
license: MIT
metadata:
  author: web-quality-skills
  version: "2.0"
---
# Web 质量审计

结合实时浏览器证据与源代码检查的综合质量评审。涵盖性能、无障碍、SEO、最佳实践和智能体浏览，但不会将聚合评分视为质量证明。

> **Lighthouse 13+。** Performance 类别现在在 Lighthouse 和 DevTools Performance 面板之间共享 **Performance Insights**（[公告](https://developer.chrome.com/blog/moving-lighthouse-to-insights)）。请遵循当前的洞察名称和证据。不要要求已移除的审计 ID，也不要自动重新创建其建议；其中一些审计因噪声较大、无法采取行动或容易被过度推荐而被弃用。

## 工作原理

1. 确定审计目标：具有代表性的 URL、重要状态和用户流程、公开访问与身份验证访问，以及移动端/桌面端范围。
2. 如果页面可以运行，请阅读[测量工作流](../performance/references/MEASUREMENT.md)，并在广泛搜索代码库之前收集最小化的实时基线。
3. 使用运行时故障来定位源代码检查范围。将已测量的发现与仅在代码中发现的假设分开。
4. 按用户影响和置信度进行分类，然后实施或建议具体修复。
5. 重新运行等效的自动化检查和受影响的手动流程。报告哪些内容已验证，以及哪些内容仍需要现场或人工验证。

## 工具路由

使用已经可用的最佳能力；不要因可选设置而阻塞审计。

| 需求 | 首选路径 | 备用方案 |
|------|-----------------|----------|
| 性能和 Core Web Vitals | 记录浏览器性能跟踪记录并分析聚焦的洞察；使用 Chrome DevTools MCP 时，使用 `performance_start_trace`，然后使用 `performance_analyze_insight` | Lighthouse CLI 或 PageSpeed Insights 实验室数据 |
| 真实用户性能 | 当前 DevTools 跟踪记录摘要中包含的 CrUX 值 | PageSpeed Insights/CrUX Vis；仅在已有密钥或请求自动化时直接使用 CrUX API |
| 无障碍、SEO、最佳实践、智能体浏览 | 运行实时 Lighthouse 审计；使用 Chrome DevTools MCP 时，使用 `lighthouse_audit` | 针对类别的 Lighthouse CLI 审计，以及手动检查 |
| 渲染后的语义和交互 | 检查无障碍树并操作 UI；使用 Chrome DevTools MCP 时，使用 `take_snapshot` 和聚焦的 `evaluate_script` | 浏览器/手动测试 |
| 源代码冒烟测试 | `scripts/analyze.sh <path>` | 直接检查源代码 |

Chrome DevTools MCP 的 `lighthouse_audit` 有意排除了性能。其导航模式会重新加载页面；当保留当前已验证身份或用户创建的状态很重要时，请使用快照模式。静态分析器是一种快速冒烟测试，不能替代渲染页面审计。

## 审计类别

### 性能

**Core Web Vitals** — 良好的页面体验必须通过：
* **LCP (Largest Contentful Paint) < 2.5s。** 最大的可见元素必须快速渲染。优化图片、字体和服务器响应时间。
* **INP (Interaction to Next Paint) < 200ms。** 用户交互必须感觉即时响应。减少 JavaScript 执行时间，并拆分长任务。
* **CLS (Cumulative Layout Shift) < 0.1。** 内容不得发生跳动。为图片、嵌入内容和广告设置明确的尺寸。

**资源优化：**
* **压缩图像。** 使用 WebP/AVIF，并提供后备格式。通过 `srcset` 提供尺寸合适的图像。
* **尽量减少 JavaScript。** 移除未使用的代码。使用代码拆分。延迟加载非关键脚本。
* **优化 CSS。** 提取关键 CSS。移除未使用的样式。避免使用 `@import`。
* **高效使用字体。** 使用 `font-display: swap`。预加载关键字体。将字体子集化为所需字符。

**加载策略：**
* **预连接到来源。** 为第三方域名添加 `<link rel="preconnect">`。
* **预加载关键资源。** 预加载 LCP 图像、字体和首屏 CSS。
* **延迟加载首屏以下内容。** 延迟加载图像、iframe 和大型组件。
* **有效缓存。** 为静态资源设置较长的缓存 TTL。对带哈希的文件使用不可变缓存。

### 无障碍

**可感知：**
* **文本替代。** 每个 `<img>` 都有有意义的 `alt` 文本。装饰性图像使用 `alt=""`。
* **颜色对比度。** 普通文本的最低对比度为 4.5:1，大号文本为 3:1（WCAG AA）。
* **不要仅依赖颜色。** 在颜色指示器旁结合使用图标、图案或文本。
* **字幕和文字稿。** 视频应提供字幕。音频应提供文字稿。

**可操作：**
* **支持键盘操作。** 所有功能都可通过键盘使用。不得设置键盘陷阱。
* **焦点可见。** 为所有交互元素提供清晰的焦点指示器。
* **跳过链接。** 为键盘用户提供“跳转到主要内容”链接。
* **提供充足时间。** 用户可以延长时间限制。不得在没有控件的情况下自动推进内容。

**可理解：**
* **页面语言。** 在 `<html>` 上设置 `lang` 属性。
* **一致的导航。** 在各页面之间保持相同的导航结构。
* **错误识别。** 清晰描述表单错误，并将其与对应字段关联。
* **标签和说明。** 所有表单输入控件都有相关联的标签。

**稳健：**
* **有效的 HTML。** 不得有重复的 ID。元素应正确嵌套。
* **正确使用 ARIA。** 优先使用原生元素。ARIA 角色应与行为相匹配。
* **名称、角色、值。** 交互元素应具有可访问名称和正确的角色。

### SEO

**可抓取性：**
* **有效的 robots.txt。** 不得阻止重要资源。
* **XML 站点地图。** 列出所有重要页面。提交到 Search Console。
* **规范 URL。** 防止重复内容问题。
* **重要页面不得设置 noindex。** 检查 meta robots 和响应头。

**页面 SEO：**
* **唯一的标题标签。** 使每个标题具有描述性且简洁；显示截断方式因设备和结果类型而异。
* **Meta 描述。** 编写有用且针对具体页面的摘要；搜索引擎可能会选择不同的摘要片段。
* **标题层级。** 主标题应具有描述性，结构应合乎逻辑；仅因使用多个 `<h1>` 而判定有效 HTML 不合格。
* **描述性链接文本。** 不要使用“点击这里”或“阅读更多”。

**技术 SEO：**
* **适合移动设备。** 采用响应式设计。点击目标 ≥ 48px。
* **HTTPS。** 必须使用安全连接。
* **页面体验信号。** 使用真实用户的 Core Web Vitals 数据作为证据，但不要承诺排名会发生变化。
* **结构化数据。** 使用 JSON-LD 实现富摘要（Article、Product、FAQ 等）。

### 最佳实践

**安全性：**
* **全面使用 HTTPS。** 不得存在混合内容。启用 HSTS。
* **不得使用存在漏洞的库。** 保持依赖项更新。
* **CSP 标头。** 使用内容安全策略防止 XSS。
* **不得暴露源映射。** 在生产构建中尤其如此。

**现代标准：**
* **不得使用已弃用的 API。** 替换 `document.write`、同步 XHR 等。
* **使用有效的 doctype。** 使用 `<!DOCTYPE html>`。
* **声明字符集。** 将 `<meta charset="UTF-8">` 作为 `<head>` 中的第一个元素。
* **不得存在浏览器错误。** 保持控制台干净。不得存在 CORS 问题。

**UX 模式：**
* **不得使用侵扰性的插屏。** 移动设备上尤其如此。
* **清晰的权限请求。** 仅在需要时请求，并提供上下文。
* **不得使用误导性按钮。** 按钮的行为应与其文字描述一致。

### Agentic 浏览

将 Lighthouse Agentic Browsing 结果作为技术信号，用于评估助手理解和交互渲染页面的能力。

* **可访问的交互界面。** 语义化 HTML、标签、名称、角色和状态必须在无障碍树中暴露有意义的控件。
* **存在 WebMCP 集成时可视为有效。** 检查已注册的工具、架构和表单覆盖范围；不得仅为提高审计分数而添加 WebMCP。
* **`llms.txt` 是可选的。** 有效的文件可能帮助兼容的工具发现经过整理的内容，但 Lighthouse 通过并不能证明搜索或 AI 产品会抓取、排序或引用该文件。
* **将此类别与 SEO 声明分开。** Agentic 可浏览性不能证明搜索排名或 AI 可见性。

## 严重级别

| 级别 | 描述 | 操作 |
|-------|-------------|--------|
| **严重** | 安全漏洞、完全失效 | 立即修复 |
| **高** | Core Web Vitals 失败、主要无障碍障碍 | 上线前修复 |
| **中** | 性能优化机会、SEO 改进 | 在当前迭代内修复 |
| **低** | 次要优化、代码质量 | 方便时修复 |

## 审计输出格式

执行审计时，请按以下结构组织发现结果：

```markdown
## Audit results

### Evidence
| Signal | Scope/conditions | Result | Source |
|--------|------------------|--------|--------|
| LCP | URL, phone, p75/28 days | 3.1s (needs improvement) | CrUX |
| Accessibility | URL, mobile navigation | 92 | Lighthouse |

### Critical issues (X found)
- **[Category]** Issue description. File: `path/to/file.js:123`
  - **Impact:** Why this matters
  - **Evidence:** Measured failure, runtime observation, or source hypothesis
  - **Fix:** Specific code change or recommendation

### High priority (X found)
...

### Summary
- Performance: measured status and X findings
- Accessibility: automated status, X findings, manual checks pending/passed
- SEO: X findings
- Best Practices: X findings
- Agentic Browsing: X findings or not available

### Recommended priority
1. First fix this because...
2. Then address...
3. Finally optimize...

### Verification
- Re-run results under the same conditions
- Manual checks completed
- Field validation still pending
```

## 快速检查清单

### 每次部署前
- [ ] Core Web Vitals 通过
- [ ] 没有可访问性错误（axe/Lighthouse）
- [ ] 没有控制台错误
- [ ] HTTPS 正常工作
- [ ] 元标签存在

### 每周检查
- [ ] 检查 Search Console 中是否存在问题
- [ ] 查看 Core Web Vitals 趋势
- [ ] 更新依赖项
- [ ] 使用屏幕阅读器进行测试

### 每月深入检查
- [ ] 完整的 Lighthouse 审计
- [ ] 性能分析
- [ ] 与真实用户一起进行可访问性审计
- [ ] SEO 关键词检查

## 参考资料

有关特定领域的详细指南：
- [性能优化](../performance/SKILL.md)
- [Core Web Vitals](../core-web-vitals/SKILL.md)
- [可访问性](../accessibility/SKILL.md)
- [SEO](../seo/SKILL.md)
- [最佳实践](../best-practices/SKILL.md)