---
name: moai-domain-uiux
description: >
  UI/UX design systems specialist covering accessibility, icons, theming,
  design tokens, and user experience patterns. Use when working on design
  systems, WCAG compliance, ARIA patterns, or dark mode theming.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Grep, Glob, mcp__context7__resolve-library-id, mcp__context7__get-library-docs
user-invocable: false
metadata:
  version: "3.1.0"
  category: "domain"
  status: "active"
  updated: "2026-03-28"
  modularized: "true"
  tags: "domain, uiux, design-systems, accessibility, components, icons, theming"

# MoAI Extension: Triggers
triggers:
  keywords: ["UI/UX", "design system", "accessibility", "WCAG", "ARIA", "icon", "theming", "dark mode", "design tokens", "component library", "Radix UI", "shadcn", "Storybook", "Pencil", "design tokens", "Style Dictionary", "Lucide", "Iconify", "Hugeicons", "responsive design", "user experience", "Anti-AI Slop", "design direction", "AI slop prevention"]
---
## 快速参考

核心 UI/UX 基础——企业级 UI/UX 基础，集成设计系统（W3C DTCG 2025.10）、组件架构（React 19、Vue 3.5）、无障碍功能（WCAG 2.2）、图标库（20 万+图标）和主题系统。

统一能力：

- 设计系统：W3C DTCG 2025.10 令牌、Style Dictionary 4.0、Pencil MCP 工作流
- 组件架构：原子设计、React 19、Vue 3.5、shadcn/ui、Radix UI 原语
- 无障碍功能：符合 WCAG 2.2 AA/AAA 标准、键盘导航、屏幕阅读器优化
- 图标库：10+ 个生态系统（Lucide、React Icons 35K+、Tabler 5900+、Iconify 200K+、Hugeicons 27K+）
- 主题化：CSS 变量、浅色/深色模式、主题提供器、品牌定制

适用场景：

- 构建以设计系统为基础的现代 UI 组件库
- 实现具备无障碍能力的企业级用户界面
- 为多平台项目建立设计令牌架构
- 集成功能全面且具有最佳包体积的图标系统
- 创建支持深色模式的可定制主题系统

模块组织：

- 组件：modules/component-architecture.md（原子设计、组件模式、props API）
- 设计系统：modules/design-system-tokens.md（DTCG 令牌、Style Dictionary、Pencil MCP）
- 无障碍功能：modules/accessibility-wcag.md（WCAG 2.2 合规性、测试、导航）
- 图标：modules/icon-libraries.md（10+ 个库、选型指南、性能优化）
- 主题化：modules/theming-system.md（主题系统、CSS 变量、品牌定制）
- Web 界面指南：modules/web-interface-guidelines.md（Vercel Labs 全面的 UI/UX 合规规范、前端组合规则）
- 示例：examples.md（实用实现示例）
- 参考资料：reference.md（外部文档链接）

---

## 实现指南

### 基础技术栈

核心技术：

- React 19，支持服务器组件和并发渲染
- TypeScript 5.9+，提供完整的类型安全和改进的类型推断
- Tailwind CSS 4.x，支持 CSS 优先配置、CSS 变量和深色模式
- 使用 Radix UI 提供无样式的无障碍原语
- 使用 W3C DTCG 2025.10 作为设计令牌规范
- 使用 Style Dictionary 4.0 进行令牌转换
- 使用 Pencil MCP 实现从设计到代码的自动化
- 使用 Storybook 8.x 编写组件文档

快速决策指南：

对于设计令牌，请使用 modules/design-system-tokens.md，并采用 DTCG 2025.10 和 Style Dictionary 4.0。

对于组件模式，请使用 modules/component-architecture.md，并采用原子设计、React 19 和 shadcn/ui。

对于无障碍功能，请使用 modules/accessibility-wcag.md，并采用 WCAG 2.2、jest-axe 和键盘导航。

对于图标，请使用 modules/icon-libraries.md，并采用 Lucide、React Icons、Tabler、Iconify 和 Hugeicons。

对于 Nova preset 和设计预设，请使用 moai-design-tools skill（reference/pencil-renderer.md）。

对于主题化，请使用 modules/theming-system.md，并采用 CSS 变量和 Theme Provider。

对于实用示例，请使用 examples.md，其中包含 React 和 Vue 实现。

---

## 快速入门工作流

### 设计系统设置

步骤 1：创建一个包含 DTCG schema URL 的 JSON 文件来初始化设计令牌。定义类型为 color 且 primary 500 值已设置的颜色令牌。定义类型为 dimension 且 md 值为 1rem 的间距令牌。

步骤 2：安装 Style Dictionary 软件包并运行构建命令，以使用 Style Dictionary 转换令牌。

步骤 3：从 tokens 目录导入 colors 和 spacing，将其集成到组件中。

有关完整的令牌架构，请参阅 modules/design-system-tokens.md。

### 组件库设置

步骤 1：运行 init 命令初始化 shadcn/ui，然后添加 button、form 和 dialog 组件。

步骤 2：设置原子设计结构：在 atoms 目录中放置 Button、Input 和 Label 组件，在 molecules 目录中放置 FormGroup 和 Card 组件，在 organisms 目录中放置 DataTable 和 Modal 组件。

步骤 3：通过为交互式元素添加 aria-label 属性，以符合无障碍要求的方式实现组件。

有关模式和示例，请参阅 modules/component-architecture.md。

### 图标系统集成

步骤 1：根据需求选择图标库。安装 lucide-react 以满足通用需求，安装 iconify/react 以获得最丰富的选择，或安装 tabler/icons-react 以针对仪表板进行优化。

步骤 2：通过导入特定图标并应用 className 设置尺寸和颜色，实现类型安全的图标。

有关图标库的比较和优化，请参阅 modules/icon-libraries.md。

### 主题系统设置

步骤 1：在根选择器中为 primary 和 background 颜色配置 CSS 变量。定义具有反转值的 dark 类，以支持深色模式。

步骤 2：通过使用 attribute 设置为 class 且 defaultTheme 设置为 system 的方式包装应用程序，实现 Theme Provider。

有关完整的主题系统，请参阅 modules/theming-system.md。

---

## 核心原则

设计令牌优先：

- 作为设计决策的单一事实来源
- 使用 color.primary.500 格式而非 blue-500 进行语义化命名
- 支持浅色和深色模式等多种主题
- 与平台无关的转换

默认支持无障碍：

- 最低达到 WCAG 2.2 AA 标准，文本对比度为 4.5:1
- 所有交互式元素均支持键盘导航
- 为屏幕阅读器提供 ARIA 属性
- 焦点管理和可见的焦点指示器

组件组合：

- 从 Atoms 到 Molecules 再到 Organisms 的原子设计层级结构
- 使用 Props API 实现可复用性
- 使用基于变体的样式，而非创建单独的组件
- 使用 TypeScript 实现类型安全

性能优化：

- 通过导入特定图标而非全部图标，为图标启用 tree-shaking
- 对大型组件进行延迟加载
- 对渲染开销较大的组件使用 React.memo
- 监控 bundle 大小

---

## 最佳实践

必需实践：

所有颜色、间距和排版值必须仅使用设计令牌。设计令牌提供单一事实来源，从而实现一致的主题、多平台支持和可扩展的设计系统。硬编码值会产生维护债务，并导致主题切换失效。

所有仅包含图标的交互式元素都必须包含 ARIA 标签。如果没有文本替代内容，屏幕阅读器便无法理解视觉图标。缺少 ARIA 标签会违反 WCAG 2.2 AA 合规要求。

应逐个导入图标，而不是使用命名空间导入。命名空间导入会将整个库打包进去，使摇树优化失效。每个图标库会使打包体积增加 500KB-2MB。

在浅色和深色模式下测试所有组件。主题切换会影响颜色对比度、可读性和无障碍合规性。

为所有交互式组件实现键盘导航。仅使用键盘的用户需要对 Tab、Enter、Escape 和方向键提供支持。

为所有可聚焦元素提供清晰可见的焦点指示器。焦点指示器用于传达当前键盘位置，以支持导航和无障碍访问。

使用 Tailwind 实用工具类，而不是内联样式。Tailwind 提供一致的间距比例、响应式设计和自动清除未使用样式的功能，以优化打包体积。

为所有异步操作提供加载状态。加载状态可在数据获取期间提供反馈，避免用户产生不确定感。

---

## 可配合使用

技能：

- moai-lang-typescript - TypeScript 和 JavaScript 最佳实践
- moai-foundation-core - TRUST 5 质量验证
- moai-library-nextra - 文档生成
- moai-library-shadcn - shadcn/ui 专用模式

代理：

- code-frontend - 前端组件实现
- design-uiux - 设计系统架构
- mcp-pencil - Pencil MCP 设计工作流
- core-quality - 无障碍和质量验证

命令：

- /moai:2-run - DDD 实现周期
- /moai:3-sync - 文档生成

---

## 资源

有关详细的模块文档，请参阅 modules 目录。

有关实用代码示例，请参阅 examples.md。

有关外部文档链接，请参阅 reference.md。

官方资源：

- W3C DTCG: https://designtokens.org
- WCAG 2.2: https://www.w3.org/WAI/WCAG22/quickref/
- React 19: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Radix UI: https://www.radix-ui.com
- shadcn/ui: https://ui.shadcn.com
- Storybook: https://storybook.js.org
- Pencil: https://docs.pencil.dev
- Style Dictionary: https://styledictionary.com
- Lucide Icons: https://lucide.dev
- Iconify: https://iconify.design
- Vercel Web Interface Guidelines: https://github.com/vercel-labs/web-interface-guidelines

---

最后更新：2026-03-11
状态：生产就绪
版本：3.0.0

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的合理化借口

| 合理化借口 | 事实 |
|---|---|
| “无障碍功能是锦上添花，并非必需” | 在许多司法管辖区，符合 WCAG 是一项法律要求。它也是核心质量维度，而非可选项。 |
| “深色模式只是反转颜色” | 简单的颜色反转会破坏对比度、图像可见性和语义颜色含义。深色模式是一项设计工作。 |
| “设计系统太死板了，我需要自定义样式” | 绕过设计系统的自定义样式会造成不一致。应扩展系统，而不是规避系统。 |
| “图标不需要标签，它们的含义不言自明” | 缺乏上下文时，图标的含义并不明确。屏幕阅读器无法描述未标记的图标。始终添加 aria-label。 |
| “我会在最后处理响应式设计” | 事后改造响应式设计会破坏布局。应先针对最小视口进行设计，然后再逐步增强。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 交互元素没有可见的焦点指示器
- 普通文本的颜色对比度低于 4.5:1
- 使用图标时没有 aria-label 或配套文本
- 使用硬编码的颜色或间距值，绕过了设计令牌
- 新组件未定义深色模式变体
- 新布局组件中缺少响应式断点

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 颜色对比度符合 WCAG AA 标准（普通文本 4.5:1，大号文本 3:1）（展示对比度检查输出）
- [ ] 所有交互元素都有可见的焦点指示器
- [ ] 图标具有无障碍名称（aria-label 或配套的可见文本）
- [ ] 颜色、间距和排版均使用设计令牌（无硬编码值）
- [ ] 深色模式渲染正确，不存在对比度异常或元素不可见的问题
- [ ] 已在移动端（320px）、平板端（768px）和桌面端（1280px）宽度下测试布局

<!-- moai:evolvable-end -->