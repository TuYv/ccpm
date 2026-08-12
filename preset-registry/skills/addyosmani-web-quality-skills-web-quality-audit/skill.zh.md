---
name: web-quality-audit
description: Comprehensive web quality audit covering performance, accessibility, SEO, and best practices. Use when asked to "audit my site", "review web quality", "run lighthouse audit", "check page quality", or "optimize my website".
license: MIT
metadata:
  author: web-quality-skills
  version: "1.0"
---
# Web 质量审计

基于 Google Lighthouse 审计的全面质量评估。涵盖性能、无障碍、SEO 和最佳实践，共计 150 多项检查。

> **Lighthouse v13 说明（2025 年 10 月及以后）。** Lighthouse 已将性能类别从逐项优化机会审计迁移到**性能洞察审计**（[公告](https://developer.chrome.com/blog/moving-lighthouse-to-insights)）。此技能过去引用的若干独立审计名称——*First Meaningful Paint*、*No Document Write*、*Uses Passive Event Listeners*、*Uses Rel Preload*——已被移除或合并。底层的*建议*并未改变，仍然适用；只是报告格式发生了变化。与 CLS 相关的审计（"layout shifts"、"non-composited animations"、"unsized images"）现已整合到单一的 `cls-culprits-insight` 中，图像审计则合并到 `image-delivery-insight` 中。应将旧版 Lighthouse JSON 输出视为超集，而不是相互矛盾的结果。

## 工作原理

1. 分析所提供的代码/项目中存在的质量问题
2. 按严重程度对发现的问题进行分类（严重、高、中、低）
3. 提供具体且可操作的建议
4. 提供修复所需的代码示例

## 审计类别

### 性能（通常占问题的 40%）

**核心 Web 指标**——必须通过才能获得良好的页面体验：
* **LCP（最大内容绘制）< 2.5s。** 最大的可见元素必须快速渲染。优化图像、字体和服务器响应时间。
* **INP（交互到下一次绘制）< 200ms。** 用户交互必须让人感觉即时响应。减少 JavaScript 执行时间，并拆分长任务。
* **CLS（累积布局偏移）< 0.1。** 内容不能四处跳动。为图像、嵌入内容和广告设置明确的尺寸。

**资源优化：**
* **压缩图像。** 使用 WebP/AVIF 并提供回退格式。通过 `srcset` 提供尺寸正确的图像。
* **最小化 JavaScript。** 移除未使用的代码。使用代码拆分。延迟加载非关键脚本。
* **优化 CSS。** 提取关键 CSS。移除未使用的样式。避免使用 `@import`。
* **高效使用字体。** 使用 `font-display: swap`。预加载关键字体。将字体精简为仅包含所需字符。

**加载策略：**
* **预连接到源站。** 为第三方域名添加 `<link rel="preconnect">`。
* **预加载关键资源。** 包括 LCP 图像、字体和首屏 CSS。
* **延迟加载首屏以下的内容。** 包括图像、iframe 和大型组件。
* **有效利用缓存。** 为静态资源设置较长的缓存 TTL。对带哈希值的文件使用不可变缓存。

### 无障碍（通常占问题的 30%）

**可感知：**
* **文本替代内容。** 每个 `<img>` 都具有有意义的 `alt` 文本。装饰性图像使用 `alt=""`。
* **颜色对比度。** 普通文本最低为 4.5:1，大号文本最低为 3:1（WCAG AA）。
* **不要仅依赖颜色。** 在颜色指示之外同时使用图标、图案或文本。
* **字幕和文字记录。** 视频提供字幕。音频提供文字记录。

**可操作：**
* **支持键盘操作。** 所有功能均可通过键盘使用。不得存在键盘陷阱。
* **焦点清晰可见。** 所有交互式元素都具有清晰的焦点指示器。
* **跳转链接。** 为键盘用户提供“跳转到主要内容”链接。
* **提供充足时间。** 用户可以延长时间限制。内容不得在没有控制选项的情况下自动推进。

**可理解性：**
* **页面语言。** 在 `<html>` 上设置 `lang` 属性。
* **一致的导航。** 各页面采用相同的导航结构。
* **错误识别。** 清晰描述表单错误，并将其与对应字段关联。
* **标签和说明。** 所有表单输入项都有与之关联的标签。

**健壮性：**
* **有效的 HTML。** 不存在重复 ID。元素正确嵌套。
* **正确使用 ARIA。** 优先使用原生元素。ARIA 角色与行为相匹配。
* **名称、角色和值。** 交互元素具有无障碍名称和正确的角色。

### SEO（占典型问题的 15%）

**可抓取性：**
* **有效的 robots.txt。** 不阻止重要资源。
* **XML 站点地图。** 列出所有重要页面。已提交至 Search Console。
* **规范 URL。** 防止重复内容问题。
* **重要页面未设置 noindex。** 检查 meta robots 和响应头。

**页面 SEO：**
* **唯一的标题标签。** 长度为 50-60 个字符。包含主要关键词。
* **元描述。** 长度为 150-160 个字符。具有吸引力且独一无二。
* **标题层级。** 仅使用一个 `<h1>`。标题结构符合逻辑。
* **描述性链接文本。** 不使用“点击此处”或“阅读更多”。

**技术 SEO：**
* **适配移动设备。** 采用响应式设计。点击目标尺寸 ≥ 48px。
* **HTTPS。** 必须使用安全连接。
* **快速加载。** 性能会直接影响排名。
* **结构化数据。** 使用 JSON-LD 实现富媒体摘要（Article、Product、FAQ 等）。

### 最佳实践（占典型问题的 15%）

**安全性：**
* **全面使用 HTTPS。** 不存在混合内容。已启用 HSTS。
* **不存在有漏洞的库。** 保持依赖项为最新版本。
* **CSP 响应头。** 使用内容安全策略防止 XSS。
* **不暴露源映射。** 在生产构建中不暴露源映射。

**现代标准：**
* **不使用已弃用的 API。** 替换 `document.write`、同步 XHR 等。
* **有效的 doctype。** 使用 `<!DOCTYPE html>`。
* **声明字符集。** 将 `<meta charset="UTF-8">` 作为 `<head>` 中的第一个元素。
* **不存在浏览器错误。** 控制台无报错。不存在 CORS 问题。

**用户体验模式：**
* **不使用侵入式插页。** 尤其是在移动设备上。
* **清晰的权限请求。** 仅在需要时请求权限，并提供上下文。
* **不存在误导性按钮。** 按钮的实际行为与其说明一致。

## 严重程度级别

| 级别 | 描述 | 操作 |
|-------|-------------|--------|
| **严重** | 安全漏洞、完全失效 | 立即修复 |
| **高** | Core Web Vitals 不达标、严重的无障碍障碍 | 发布前修复 |
| **中** | 性能优化机会、SEO 改进 | 在当前迭代内修复 |
| **低** | 次要优化、代码质量 | 方便时修复 |

## 审计输出格式

执行审计时，按以下结构组织发现的问题：

```markdown
## Audit results

### Critical issues (X found)
- **[Category]** Issue description. File: `path/to/file.js:123`
  - **Impact:** Why this matters
  - **Fix:** Specific code change or recommendation

### High priority (X found)
...

### Summary
- Performance: X issues (Y critical)
- Accessibility: X issues (Y critical)
- SEO: X issues
- Best Practices: X issues

### Recommended priority
1. First fix this because...
2. Then address...
3. Finally optimize...
```

## 快速检查清单

### 每次部署前
- [ ] 核心网页指标达标
- [ ] 无无障碍访问错误（axe/Lighthouse）
- [ ] 无控制台错误
- [ ] HTTPS 正常工作
- [ ] Meta 标签已添加

### 每周检查
- [ ] 检查 Search Console 中的问题
- [ ] 查看核心网页指标趋势
- [ ] 更新依赖项
- [ ] 使用屏幕阅读器进行测试

### 每月深入检查
- [ ] 完整的 Lighthouse 审计
- [ ] 性能分析
- [ ] 由真实用户参与的无障碍访问审计
- [ ] SEO 关键词审查

## 参考资料

有关特定领域的详细指南：
- [性能优化](../performance/SKILL.md)
- [核心网页指标](../core-web-vitals/SKILL.md)
- [无障碍访问](../accessibility/SKILL.md)
- [SEO](../seo/SKILL.md)
- [最佳实践](../best-practices/SKILL.md)