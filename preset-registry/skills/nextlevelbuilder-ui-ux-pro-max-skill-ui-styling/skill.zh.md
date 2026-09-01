---
name: ui-styling
description: Create beautiful, accessible user interfaces with shadcn/ui components (built on Radix UI + Tailwind), Tailwind CSS utility-first styling, and canvas-based visual designs. Use when building user interfaces, implementing design systems, creating responsive layouts, adding accessible components (dialogs, dropdowns, forms, tables), customizing themes and colors, implementing dark mode, generating visual designs and posters, or establishing consistent styling patterns across applications.
argument-hint: "[component or layout]"
license: MIT
metadata:
  author: claudekit
  version: "1.0.0"
---
# UI Styling Skill

用于创建美观、可访问用户界面的综合技能，结合 shadcn/ui 组件、Tailwind CSS 工具类样式以及基于 canvas 的视觉设计系统。

## Reference

- shadcn/ui: https://ui.shadcn.com/llms.txt
- Tailwind CSS: https://tailwindcss.com/docs

## When to Use This Skill

使用场景：
- 使用基于 React 的框架（Next.js、Vite、Remix、Astro）构建 UI
- 实现可访问组件（对话框、表单、表格、导航）
- 使用工具优先的 CSS 方法进行样式设计
- 创建响应式、移动优先的布局
- 实现深色模式和主题自定义
- 使用一致的令牌构建设计系统
- 生成视觉设计、海报或品牌物料
- 通过即时视觉反馈进行快速原型设计
- 添加复杂 UI 模式（数据表格、图表、命令面板）

## Core Stack

### Component Layer: shadcn/ui
- 通过 Radix UI 原语提供预构建的可访问组件
- 复制粘贴分发模型（组件存在于你的代码库中）
- TypeScript 优先，具备完整类型安全
- 可组合的原语，用于构建复杂 UI
- 基于 CLI 的安装和管理

### Styling Layer: Tailwind CSS
- 工具优先的 CSS 框架
- 构建时处理，零运行时开销
- 移动优先的响应式设计
- 一致的设计令牌（颜色、间距、排版）
- 自动清理无用代码

### Visual Design Layer: Canvas
- 博物馆级视觉构图
- 哲学驱动的设计方法
- 精致的视觉传达
- 极少文本，最大视觉冲击
- 系统化模式与精致美学

## Quick Start

### Component + Styling Setup

**安装带 Tailwind 的 shadcn/ui：**
```bash
npx shadcn@latest init
```

CLI 会提示选择框架、TypeScript、路径和主题偏好。这会同时配置 shadcn/ui 和 Tailwind CSS。

**添加组件：**
```bash
npx shadcn@latest add button card dialog form
```

**将组件与工具类样式一起使用：**
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function Dashboard() {
  return (
    <div className="container mx-auto p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">View your metrics</p>
          <Button variant="default" className="w-full">
            View Details
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Alternative: Tailwind-Only Setup

**Vite 项目：**
```bash
npm install -D tailwindcss @tailwindcss/vite
```

```javascript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
export default { plugins: [tailwindcss()] }
```

```css
/* src/index.css */
@import "tailwindcss";
```

## Component Library Guide

**包含用法模式、安装方式和组合示例的完整组件目录。**

参见：`references/shadcn-components.md`

涵盖：
- 表单与输入组件（Button、Input、Select、Checkbox、Date Picker、Form validation）
- 布局与导航（Card、Tabs、Accordion、Navigation Menu）
- 覆盖层与对话框（Dialog、Drawer、Popover、Toast、Command）
- 反馈与状态（Alert、Progress、Skeleton）
- 展示组件（Table、Data Table、Avatar、Badge）

## Theme & Customization

**主题配置、CSS 变量、深色模式实现和组件自定义。**

参见：`references/shadcn-theming.md`

涵盖：
- 使用 next-themes 设置深色模式
- CSS 变量系统
- 颜色自定义与调色板
- 组件变体自定义
- 主题切换实现

## Accessibility Patterns

**ARIA 模式、键盘导航、屏幕阅读器支持以及可访问组件用法。**

参见：`references/shadcn-accessibility.md`

涵盖：
- Radix UI 可访问性特性
- 键盘导航模式
- 焦点管理
- 屏幕阅读器提示
- 表单验证可访问性

## Tailwind Utilities

**用于布局、间距、排版、颜色、边框和阴影的核心工具类。**

参见：`references/tailwind-utilities.md`

涵盖：
- 布局工具类（Flexbox、Grid、positioning）
- 间距系统（padding、margin、gap）
- 排版（字号、字重、对齐、行高）
- 颜色与背景
- 边框与阴影
- 用于自定义样式的任意值

## Responsive Design

**移动优先断点、响应式工具类和自适应布局。**

参见：`references/tailwind-responsive.md`

涵盖：
- 移动优先方法
- 断点系统（sm、md、lg、xl、2xl）
- 响应式工具类模式
- 容器查询
- 最大宽度查询
- 自定义断点

## Tailwind Customization

**配置文件结构、自定义工具类、插件和主题扩展。**

参见：`references/tailwind-customization.md`

涵盖：
- 用于自定义令牌的 @theme 指令
- 自定义颜色和字体
- 间距与断点扩展
- 创建自定义工具类
- 自定义变体
- 层级组织（@layer base、components、utilities）
- 用于组件提取的 Apply 指令

## Visual Design System

**基于 canvas 的设计哲学、视觉传达原则和精致构图。**

参见：`references/canvas-design-system.md`

涵盖：
- 设计哲学方法
- 视觉传达优于文本
- 系统化模式与构图
- 颜色、形态与空间设计
- 极简文本集成
- 博物馆级执行
- 多页设计系统

## Utility Scripts

**用于组件安装和配置生成的 Python 自动化。**

### shadcn_add.py
添加 shadcn/ui 组件并处理依赖：
```bash
python scripts/shadcn_add.py button card dialog
```

### tailwind_config_gen.py
生成带有自定义主题的 tailwind.config.js：
```bash
python scripts/tailwind_config_gen.py --colors brand:blue --fonts display:Inter
```

## Best Practices

1. **组件组合**：从简单、可组合的原语构建复杂 UI
2. **工具优先样式**：直接使用 Tailwind 类；仅在真正重复时提取组件
3. **移动优先响应式**：从移动样式开始，叠加响应式变体
4. **可访问性优先**：利用 Radix UI 原语，添加焦点状态，使用语义化 HTML
5. **设计令牌**：使用一致的间距比例、调色板和排版系统
6. **深色模式一致性**：为所有带主题的元素应用深色变体
7. **性能**：利用自动 CSS 清理，避免动态类名
8. **TypeScript**：使用完整类型安全以获得更好的开发者体验
9. **视觉层级**：让构图引导注意力，有意地使用间距和颜色
10. **专家工艺**：每个细节都很重要——把 UI 当作一门工艺

## Reference Navigation

**Component Library**
- `references/shadcn-components.md` - 完整组件目录
- `references/shadcn-theming.md` - 主题与自定义
- `references/shadcn-accessibility.md` - 可访问性模式

**Styling System**
- `references/tailwind-utilities.md` - 核心工具类
- `references/tailwind-responsive.md` - 响应式设计
- `references/tailwind-customization.md` - 配置与扩展

**Visual Design**
- `references/canvas-design-system.md` - 设计哲学与 canvas 工作流

**Automation**
- `scripts/shadcn_add.py` - 组件安装
- `scripts/tailwind_config_gen.py` - 配置生成

## Common Patterns

**带验证的表单：**
```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)} className="space-y-6">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full">Sign In</Button>
      </form>
    </Form>
  )
}
```

**响应式布局与暗色模式：**
```tsx
<div className="min-h-screen bg-white dark:bg-gray-900">
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Content
          </h3>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
```

## 资源

- shadcn/ui 文档：https://ui.shadcn.com
- Tailwind CSS 文档：https://tailwindcss.com
- Radix UI：https://radix-ui.com
- Tailwind UI：https://tailwindui.com
- Headless UI：https://headlessui.com
- v0（AI UI 生成器）：https://v0.dev
