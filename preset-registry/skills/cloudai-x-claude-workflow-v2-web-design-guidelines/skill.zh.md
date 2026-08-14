---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", "check my site against best practices", or "web interface guidelines".
---
# Web 界面指南

### 何时加载

- **触发条件**：UI 审计、无障碍检查、响应式设计审查、UX 最佳实践评估
- **跳过条件**：不包含 UI 组件的纯后端工作

用于审查 Web 界面的独立完整指南。审计 UI 代码时，请应用以下规则。

## 输出格式

按以下格式报告发现的问题：`file:line — [RULE_ID] description`

示例：`src/Button.tsx:12 — [A11Y-01] 图标按钮缺少 aria-label`

## 1. 无障碍性 (A11Y)

### A11Y-01：语义化 HTML

- 操作使用 `<button>`，导航使用 `<a>`，数据输入使用 `<input>`
- 切勿将 `<div onClick>` 或 `<span onClick>` 用作交互元素
- 使用 `<nav>`、`<main>`、`<aside>`、`<header>`、`<footer>` 定义页面地标

### A11Y-02：ARIA 标签

- 所有交互元素都需要有无障碍名称
- 仅含图标的按钮必须具有 `aria-label`
- 表单输入框必须关联 `<label>` 或具有 `aria-label`
- 图像需要 `alt` 文本（装饰性图像：`alt=""`）

### A11Y-03：键盘导航

- 所有交互元素都必须能通过 Tab 键访问
- 自定义组件需要正确设置 `role`、`tabIndex` 和按键处理程序
- 焦点必须清晰可见（切勿在没有替代样式的情况下使用 `outline: none`）
- 模态框/对话框必须限制焦点范围，并在关闭时将焦点返回原处

### A11Y-04：颜色与对比度

- 文本对比度至少为 4.5:1（大号文本为 3:1）
- 切勿仅使用颜色传达含义（应添加图标、文本或图案）
- 确保 UI 在缩放至 200% 时仍可用

### A11Y-05：屏幕阅读器

- 动态内容变化需要使用 `aria-live` 区域
- 加载状态需要设置 `aria-busy="true"`
- 错误消息应通过 `aria-describedby` 与输入框关联

## 2. 性能 (PERF)

### PERF-01：图像优化

- 使用 `next/image`，或使用带有 `srcset` 的响应式图像
- 指定 `width` 和 `height` 以防止布局偏移
- 对首屏以下的图像进行延迟加载：`loading="lazy"`
- 使用 WebP/AVIF，并提供回退格式

### PERF-02：包体积

- 不要导入整个库：使用 `import { Button } from 'lib'`，而不是 `import lib`
- 对 CSS 进行摇树优化：使用 CSS 模块或 Tailwind 清除未使用样式
- 延迟加载路由和大型组件：使用 `React.lazy()` 或动态导入

### PERF-03：渲染

- 避免布局抖动：不要在循环中先读取再写入 DOM
- 谨慎使用 `will-change`（仅用于已知动画）
- 优先使用 CSS 动画，而非 JS 动画
- 使用 `transform` 和 `opacity` 实现 60fps 动画（仅由合成器处理）

### PERF-04：Core Web Vitals

- **LCP** < 2.5s：优化最大图像/文本，预加载关键资源
- **FID/INP** < 200ms：主线程上不得有长任务，延迟加载非关键 JS
- **CLS** < 0.1：为图像/嵌入内容设置尺寸，不要在首屏上方注入内容

## 3. 响应式设计 (RD)

### RD-01：移动优先

- 为移动端设置基础样式，然后使用 `@media (min-width)` 适配更大的屏幕
- 触控目标最小为 44x44px
- 任何视口下都不得出现水平滚动

### RD-02：流式布局

- 排版使用 `rem`/`em`，而不是 `px`
- 使用 `clamp()` 实现流式排版：`font-size: clamp(1rem, 2.5vw, 2rem)`
- 使用 Flex/Grid，而不是固定宽度
- 为确保可读性，内容最大宽度应为：`max-width: 65ch`

### RD-03: 断点

- 不要针对设备设置断点，而应针对内容设置断点
- 常用断点：640px (sm)、768px (md)、1024px (lg)、1280px (xl)
- 在 320px、375px、768px、1024px、1440px、1920px 下进行测试

## 4. 组件模式 (CP)

### CP-01: 表单

- 在字段旁边以内联方式显示验证错误
- 使用 `type="email"`、`type="tel"`、`inputmode="numeric"` 以适配移动端键盘
- 提交期间禁用提交按钮（防止重复提交）
- 发生错误时保留表单状态（不要清空字段）

### CP-02: 加载状态

- 对内容区域，优先显示骨架屏而非加载动画
- 对耗时较长的操作显示进度（进度条优于加载动画）
- 加载期间禁用交互元素
- 在加载中的容器上设置 `aria-busy="true"`

### CP-03: 错误状态

- 始终显示可操作的错误消息（提供“重试”按钮，而不只是显示“错误”）
- 不要向用户显示技术错误（在内部记录日志，并显示友好的消息）
- 为 React 组件树设置错误边界
- 为网络故障实现重试逻辑

### CP-04: 空状态

- 切勿显示空白页面——应提供有帮助的空状态
- 包含行动号召：“暂无项目。创建你的第一个项目。”
- 谨慎使用插图（它们会增加包体积）

### CP-05: 模态框与对话框

- 使用 `<dialog>` 元素或正确的 `role="dialog"`
- 将焦点限制在模态框内
- 按 Escape 键或点击背景时关闭
- 关闭时将焦点返回到触发元素
- 打开时禁止页面主体滚动

## 5. CSS 实践 (CSS)

### CSS-01: 选择器优先级

- 优先使用类选择器，而不是 ID 选择器或元素选择器
- 避免使用 `!important`（使用选择器优先级或级联层）
- 使用 CSS 自定义属性实现主题化
- 间距统一使用一个方向：优先使用 `margin-bottom`，而不是 `margin-top`

### CSS-02: 布局

- 一维布局使用 Flexbox，二维布局使用 Grid
- 避免使用 `position: absolute` 进行布局（仅用于覆盖层）
- Flex/Grid 子元素之间的间距使用 `gap`，而不是外边距
- 全高布局使用 `min-height: 100dvh`（而不是 `100vh`）

### CSS-03: 深色模式

- 使用 `prefers-color-scheme` 媒体查询
- 将所有颜色定义为 CSS 自定义属性
- 测试两种模式——检查两种模式下的对比度
- 不要只是反转颜色——应专门为深色模式进行设计

## 6. 安全性 (SEC)

### SEC-01: 内容安全

- 未经净化处理，绝不要使用 `dangerouslySetInnerHTML`
- 渲染用户生成的内容之前先进行净化处理
- 对带有 `target="_blank"` 的外部链接使用 `rel="noopener noreferrer"`

### SEC-02: 表单与输入

- 所有表单都应提供 CSRF 防护
- 对表单提交进行速率限制
- 在客户端和服务器端都进行验证

## 7. 国际化 (I18N)

### I18N-01: 文本

- 不要硬编码字符串——使用 i18n 库或常量
- 支持 RTL 布局：使用`逻辑属性`（使用 `margin-inline-start`，而不是 `margin-left`）
- 不要截断文本——设计必须能容纳 40% 的文本扩展
- 在 `<html>` 标签上使用 `lang` 属性

## 审查清单

审核文件时，按以下顺序检查（优先检查 CRITICAL）：

1. **CRITICAL**：A11Y-01、A11Y-02、SEC-01——语义化 HTML、ARIA、XSS 防护
2. **HIGH**：PERF-04、A11Y-03、CP-01——核心网页指标、键盘操作、表单
3. **MEDIUM**：RD-01、CSS-02、CP-02、CP-03——响应式、布局、加载/错误
4. **LOW**：CSS-03、I18N-01、CP-04——深色模式、国际化、空状态