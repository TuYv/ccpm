# smui — CAD 查看器 UI 的终端主题

**smui**（“spacemolt”）设计系统的本地副本
（<https://smui.statico.io/skill.md>），已针对 text-to-cad CAD 查看器进行适配。
smui 是一种受 Nord 启发、面向 shadcn/ui 的终端美学，支持浅色和深色
模式：锐利边角，所有内容均使用等宽字体。在重新设计查看器 UI
样式之前，请通读本文档。

以下设计规则保持通用，因此可迁移到任何 shadcn/ui 应用。
**“在此应用中”**一节是唯一针对查看器的部分——尤其需要注意的是，
此应用保留了**半透明磨砂玻璃表面**，而不是采用 smui 的扁平
不透明面板，因为查看器面板悬浮在实时 3D 场景之上。

---

## 在此应用中（text-to-cad 查看器）

此应用使用 **Vite + Tailwind v4**，而非 Next.js，因此请忽略上游的
`next/font` 和 `next-themes` 说明——此处对应的实现如下：

- **令牌位于 [`viewer/src/client/styles/globals.css`](../../src/client/styles/globals.css)。**
  shadcn CSS 变量直接设置在 `:root`（浅色“Snow Storm”）和
  `.dark`（深色“Polar Night”）中；Tailwind v4 的 `@theme inline` 块会将它们
  映射到工具类，并将 `--radius` 设置为 `0`。**不要**运行 `npx shadcn add`——
  请手动编辑 `globals.css`。
- **字体（应用差异）：此应用不采用 smui 的等宽字体。**它保留
  查看器之前使用的字体——`--font-sans: "IBM Plex Sans", "Aptos",
  "Segoe UI", sans-serif`。因此请跳过 smui 的“所有内容均使用等宽字体”规则和
  JetBrains Mono 配置；其他部分（配色、锐利边角）仍然适用。
- **浅色/深色模式**由查看器自身的配色方案系统驱动，该系统会
  切换 `<html>` 上的 `.dark` 类——不使用 `next-themes`。

### 应用修改：半透明磨砂玻璃表面

smui 默认提供**扁平、不透明**的表面。此应用有意保留其
**磨砂玻璃**外观，以便透过面板看到 3D 模型。请遵循以下要求：

- 表面的背景取自 `--ui-glass-surface` / `--ui-glass-popover`
  / `--ui-glass-control`，这些变量是**半透明的**（`color-mix(... <pct>%,
  transparent)`），并由 smui 的 `--sidebar` / `--popover` / `--background`
  令牌着色。它们通过 `cad-glass-surface`、`cad-glass-popover`
  和 `cad-glass-control` 类应用，这些类还会添加 `backdrop-filter: blur(...)`。
- **不要**在侧边栏外壳、弹出层或浮动工具栏上硬编码不透明面板背景（`bg-card`、`bg-sidebar`、纯色
  十六进制值）——请使用
  `cad-glass-*` 类 / `--ui-glass-*` 令牌，以保留半透明效果和模糊效果。
- **不**位于 3D 场景上方的表面（对话框、纯色
  背景上的菜单）可以正常使用 smui 的纯色令牌。
- 上游针对各场景的 `data-glass-tone` 覆盖已被移除——它们使用
  单色的白色/黑色半透明效果，会冲淡 Nord 配色。现在，无论场景色调如何，
  玻璃的色调都直接来自 smui 令牌。

本节以下的所有内容均为通用的 smui 指南。

---

## 核心规则

1. **浅色 + 深色模式。** `:root` = 浅色（Snow Storm），`.dark` = 深色（Polar
   Night）。所有 CSS 变量都有浅色/深色变体——只需切换 `.dark`
   类即可。
2. **零圆角半径。** `--radius: 0rem`。所有组件均采用锐利直角。
   只有状态点、开关滑块和头像元素使用 `rounded-full`。
3. **所有内容均使用等宽字体。** JetBrains Mono 是唯一字体。不使用衬线字体，也不使用
   无衬线字体。*（此应用有所不同——它保留了之前的无衬线字体；请参阅
   “在此应用中”。）*
4. **不使用 emoji。**改用 [lucide-react](https://lucide.dev/) 图标。
5. **标签使用大写。**标签、卡片标题和状态文本使用
   `uppercase`，并采用较宽的字母间距。
6. **（此应用）3D 场景上方的表面采用半透明磨砂玻璃。**
   请参阅上方的“在此应用中”。

## 调色板

> 此处应用的精确值以 `globals.css` 中的值为准；下表是 smui 参考值（其中几个十六进制值存在一个色阶的差异）。

### 语义变量（shadcn）

深色模式（`.dark`）：

| 变量 | 十六进制值 | 用途 |
|---|---|---|
| `--background` | `#1a1e24` | 页面背景 |
| `--foreground` | `#d8dee9` | 主要文本 |
| `--card` | `#21262e` | 卡片/面板背景 |
| `--primary` | `#88c0d0` | 主要强调色（霜蓝色） |
| `--muted-foreground` | `#8e99a8` | 次要/弱化文本 |
| `--border` | `#3b4252` | 边框 |
| `--destructive` | `#d4737c` | 错误/危险 |

浅色模式（`:root`）：

| 变量 | 十六进制值 | 用途 |
|---|---|---|
| `--background` | `#eceff4` | 页面背景（Snow Storm 3） |
| `--foreground` | `#2e3440` | 主要文本（Polar Night 1） |
| `--card` | `#e5e9f0` | 卡片/面板背景（Snow Storm 2） |
| `--primary` | `#4c6d94` | 主要强调色（为提高对比度而加深） |
| `--muted-foreground` | `#48505c` | 次要/弱化文本 |
| `--border` | `#c9cfda` | 边框 |
| `--destructive` | `#a3303d` | 错误/危险 |

### 扩展 SMUI 颜色

原始 HSL 三元组。与 `hsl()` 及可选的 alpha 值搭配使用：
`text-[hsl(var(--smui-green))]`、`border-[hsl(var(--smui-yellow)/0.3)]`、
`bg-[hsl(var(--smui-frost-2)/0.04)]`。

| 变量 | 十六进制值 | 用途 |
|---|---|---|
| `--smui-frost-1` | `#8fbcbb` | 蓝绿色强调色 |
| `--smui-frost-2` | `#88c0d0` | 主要霜蓝色（= `--primary`） |
| `--smui-frost-3` | `#81a1c1` | 钢蓝色 |
| `--smui-frost-4` | `#4c6d94` | 深蓝色 |
| `--smui-green` | `#a3be8c` | 成功、在线、正常 |
| `--smui-yellow` | `#ebcb8b` | 警告、待机、注意 |
| `--smui-orange` | `#d08770` | 警报、性能下降 |
| `--smui-red` | `#d4737c` | 严重、错误、危险 |
| `--smui-purple` | `#b48ead` | 信息、特殊、稀有 |

> 尚未在此应用的 `globals.css` 中注册。要启用 `bg-smui-*` /
> `text-smui-*` 工具类，请将 `--smui-*` HSL 变量添加到 `:root`/`.dark`，并添加
> 下方“Tailwind 中的扩展调色板”中的 `@theme inline` 块。

### 表面层级

用于营造深度的四个背景层级（浅色/深色模式下的值不同）：

深色（Polar Night）：`--smui-surface-0` `#1a1e24`（页面）· `-1` `#21262e`（卡片）
· `-2` `#282e37`（浮起层）· `-3` `#2f3640`（高亮/激活）。

浅色（Snow Storm）：`--smui-surface-0` `#eceff4` · `-1` `#e5e9f0` · `-2`
`#d8dee9` · `-3` `#c8ced9`。

> 在此应用中，3D 场景上方的面板使用半透明的 `--ui-glass-*`
> 令牌，而非这些不透明表面——请参阅“在此应用中”。

## 排版模式

### 字体大小层级

| Tailwind 类 | 大小 | 用途 |
|---|---|---|
| `text-label` | 11px | 标签、徽章、状态文本 |
| `text-ui` | 13px | 按钮、导航、表格正文 |
| `text-xs` | 12px | 卡片标题、小号文本 |
| `text-sm` | 14px | 正文文本、列表项 |
| `text-heading` | 22px | 章节标题 |
| `text-stat` | 26px | 大号统计数字 |
| `text-hero` | 42px | Hero 展示文本 |

在 Tailwind v4 中注册自定义大小：

```css
@theme {
  --text-label: 11px;
  --text-ui: 13px;
  --text-heading: 22px;
  --text-stat: 26px;
  --text-hero: 42px;
}
```

### 重复使用的类模式

- **卡片标题：** `text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal`
- **字段标签：** `text-label text-muted-foreground tracking-[1.5px] uppercase block mb-1`
- **状态/角色文本：** `text-label text-muted-foreground tracking-wider`
- **大型统计数字：** `text-stat font-medium text-foreground tracking-tight`
- **状态徽章：** `text-label tracking-wider uppercase px-1.5 py-px border text-[hsl(var(--smui-green))] border-[hsl(var(--smui-green)/0.3)]`
- **章节眉题：** `text-xs text-muted-foreground tracking-[2px] uppercase mb-1.5`

## 组件模式

### 卡片结构

使用 `card-glow` 实现悬停时的边框效果：

```tsx
<Card className="card-glow">
  <CardHeader className="flex flex-row items-center justify-between py-2.5 px-3.5">
    <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
      section title
    </CardTitle>
    <CardDescription className="text-xs text-muted-foreground flex items-center gap-1">
      <span className="inline-block w-[5px] h-[5px] rounded-full bg-[hsl(var(--smui-green))]" />
      status
    </CardDescription>
  </CardHeader>
  <CardContent>{/* content */}</CardContent>
</Card>
```

### 警告框中的状态颜色

```tsx
{/* Info — frost blue */}
<Alert className="border-[hsl(var(--smui-frost-2)/0.25)] bg-[hsl(var(--smui-frost-2)/0.04)] [&>svg]:text-[hsl(var(--smui-frost-2))]">
{/* Warning — yellow */}
<Alert className="border-[hsl(var(--smui-yellow)/0.25)] bg-[hsl(var(--smui-yellow)/0.04)] [&>svg]:text-[hsl(var(--smui-yellow))]">
{/* Success — green */}
<Alert className="border-[hsl(var(--smui-green)/0.25)] bg-[hsl(var(--smui-green)/0.04)] [&>svg]:text-[hsl(var(--smui-green))]">
{/* Error — variant="destructive" */}
<Alert variant="destructive">
```

### 状态点

```tsx
<span className="inline-block w-[5px] h-[5px] rounded-full bg-[hsl(var(--smui-green))]" />
```

### 实用 CSS

```css
.card-glow { transition: border-color 0.15s; }
.card-glow:hover { border-color: hsl(var(--smui-border-hover)); }

::selection {
  background: hsl(193 44% 67% / 0.2);
  color: hsl(193 44% 67%);
}
```

## Tailwind 中的扩展调色板

在 `globals.css` 中注册颜色，以便使用 `bg-smui-frost-2`、
`text-smui-red` 等：

```css
@theme inline {
  --color-smui-frost-1: hsl(var(--smui-frost-1));
  --color-smui-frost-2: hsl(var(--smui-frost-2));
  --color-smui-frost-3: hsl(var(--smui-frost-3));
  --color-smui-frost-4: hsl(var(--smui-frost-4));
  --color-smui-red: hsl(var(--smui-red));
  --color-smui-orange: hsl(var(--smui-orange));
  --color-smui-yellow: hsl(var(--smui-yellow));
  --color-smui-green: hsl(var(--smui-green));
  --color-smui-purple: hsl(var(--smui-purple));
  --color-smui-surface-0: hsl(var(--smui-surface-0));
  --color-smui-surface-1: hsl(var(--smui-surface-1));
  --color-smui-surface-2: hsl(var(--smui-surface-2));
  --color-smui-surface-3: hsl(var(--smui-surface-3));
  --color-smui-border-hover: hsl(var(--smui-border-hover));
}
```

## tailwind-merge 修复

自定义文本字号会与 tailwind-merge 冲突。扩展应用的 `cn()`
（`viewer/src/client/ui/utils`）：

```ts
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": ["text-label", "text-ui", "text-heading", "text-stat", "text-hero"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## 快速参考

- 主题：浅色 + 深色，受 Nord 启发，零圆角，等宽字体（此应用保留其
  自有的无衬线字体——见下文）。
- 主强调色：深色模式 `#88c0d0` / 浅色模式 `#4c6d94`（霜蓝色）。
- 状态：绿色=成功，黄色=警告，红色=错误，紫色=信息。
- 标签：始终使用大写字母和宽字符间距。
- 卡片：使用 `card-glow`，标题栏内边距使用 `py-2.5 px-3.5`。
- 不使用 emoji——使用 lucide-react 图标。
- **此应用：** 在 3D 场景上使用半透明毛玻璃表面；保留其
  原有的无衬线字体（而非 JetBrains Mono）；令牌位于 `globals.css`；Vite +
  Tailwind v4（不使用 next/font、next-themes）。
- 实时示例：<https://smui.statico.io>