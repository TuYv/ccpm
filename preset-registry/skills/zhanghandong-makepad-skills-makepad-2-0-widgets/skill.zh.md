---
name: makepad-2.0-widgets
description: |
  CRITICAL: Use for Makepad 2.0 widget catalog and usage. Triggers on:
  makepad widget, makepad View, makepad Button, makepad Label, makepad TextInput,
  makepad PortalList, makepad Dock, makepad Modal, makepad Image, makepad CheckBox,
  makepad Slider, makepad DropDown, widget catalog, widget reference, widget list,
  SolidView, RoundedView, ScrollYView, FoldHeader, Splitter, FileTree,
  组件, 控件, 视图, 按钮, 标签, 输入框, 列表, 模态框
---
# Makepad 2.0 小部件目录技能

> **版本：** makepad-widgets（dev 分支） | **最后更新：** 2026-03-03

## 概述

Makepad 2.0 提供了一套丰富的内置小部件，用于构建用户界面。所有小部件均以 Splash 语法定义，并通过 `script_mod!` 注册。

## 文档

详细文档请参阅以下本地文件：
- `./references/widget-catalog.md` - 完整的小部件列表及属性
- `./references/widget-advanced.md` - 高级模式：PortalList、Dock、自定义小部件、MapView

## 重要：文档完整性检查

**在回答问题之前，Claude 必须：**
1. 阅读上文中列出的相关参考文件
2. 将参考内容融入答案中

---

## 小部件分类速查

### 容器（布局）

| 小部件 | 描述 | 关键属性 |
|--------|-------------|----------------|
| `View` | 基础容器（透明） | width, height, flow, spacing, padding, align |
| `SolidView` | 带纯色背景的 View | + show_bg: true, draw_bg.color |
| `RoundedView` | 带圆角的 View | + draw_bg.border_radius |
| `RoundedAllView` | 所有圆角半径相同 | + border_radius 简写 |
| `GradientXView` | 水平渐变背景 | + draw_bg 颜色 |
| `GradientYView` | 垂直渐变背景 | + draw_bg 颜色 |
| `ScrollXView` | 水平滚动 | scroll 属性 |
| `ScrollYView` | 垂直滚动 | scroll 属性 |
| `ScrollXYView` | 双轴滚动 | scroll 属性 |

### 文本小部件

| 小部件 | 描述 | 关键属性 |
|--------|-------------|----------------|
| `Label` | 单行/多行文本 | text, draw_text.color, draw_text.text_style.font_size |
| `H1` - `H4` | 标题级别 | text（预置样式） |
| `P` | 段落文本 | text |
| `TextInput` | 可编辑文本输入框 | text, empty_text, password, read_only, numeric_only |
| `Markdown` | Markdown 渲染器 | body |
| `Html` | HTML 渲染器 | body |
| `LinkLabel` | 可点击的链接文本 | text, url |

### 按钮

| 小部件 | 描述 | 关键属性 |
|--------|-------------|----------------|
| `Button` | 标准按钮 | text |
| `ButtonFlat` | 扁平样式按钮 | text |
| `ButtonFlatter` | 极简按钮 | text |

### 开关小部件

| 小部件 | 描述 | 关键属性 |
|--------|-------------|----------------|
| `CheckBox` | 复选框 | text, active |
| `Toggle` | 切换开关 | text, active |
| `RadioButton` | 单选按钮 | text, active |

### 输入小部件

| 小部件 | 描述 | 关键属性 |
|--------|-------------|----------------|
| `Slider` | 水平滑块 | min, max, step, default, precision |
| `DropDown` | 下拉选择框 | labels: ["a", "b", "c"] |

### 媒体小部件

| 小部件 | 描述 | 关键属性 |
|--------|-------------|----------------|
| `Image` | 图片显示 | source, fit（Stretch/Horizontal/Vertical/Smallest/Biggest/Size） |
| `Svg` | 外部 SVG 文件渲染器 | draw_svg.svg（crate_resource/http_resource）, animating, draw_svg.color |
| `Icon` | SVG 图标（可着色） | draw_icon.svg, draw_icon.color, icon_walk |
| `Vector` | 内联矢量图形 | viewbox, Path{d: "..."} |
| `LoadingSpinner` | 加载指示器 | color, rotation_speed |
| `MapView` | 地图小部件 | center_lon, center_lat, zoom（必须使用固定高度！） |

### 布局辅助小部件

| 小部件 | 描述 | 用法 |
|--------|-------------|-------|
| `Hr` | 水平分隔线 | 分隔线 |
| `Vr` | 垂直分隔线 | 垂直分隔线 |
| `Filler` | 弹性空间 | 撑开同级元素（仅在 Fit 同级元素之间使用！） |
| `Splitter` | 可调整大小的拆分 | axis: Horizontal/Vertical，a/b 子元素 |
| `FoldHeader` | 可折叠区域 | header + body 子元素 |

### 列表

| 小部件 | 描述 | 用法 |
|--------|-------------|-------|
| `PortalList` | 虚拟化列表 | 适用于大型列表（100+ 项），仅渲染可见项 |
| `FlatList` | 简单列表 | 适用于小型列表，渲染所有项 |

### 导航小部件

| 小部件 | 描述 | 控制方式 |
|--------|-------------|---------|
| `Modal` | 模态对话框 | 在 Rust 中调用 .open(cx) / .close(cx) |
| `Tooltip` | 工具提示弹出层 | 悬停触发 |
| `PopupNotification` | Toast 通知 | 定时显示 |
| `SlidePanel` | 滑动面板 | slide_from |
| `ExpandablePanel` | 可展开区域 | open/close |
| `PageFlip` | 页面切换器 | active_page: page_name |
| `StackNavigation` | 堆栈导航 | push/pop 页面 |

### Dock 系统

| 小部件 | 描述 |
|--------|-------------|
| `Dock` | 标签页容器系统 |
| `DockSplitter` | Dock 拆分面板 |
| `DockTabs` | 标签栏 |
| `DockTab` | 单个标签页 |

---

## 关键规则

### 1. 容器上使用 height: Fit
```
// WRONG - View defaults to 0px height
View{ flow: Down Label{text: "Invisible"} }

// CORRECT
View{ height: Fit flow: Down Label{text: "Visible"} }
```

### 2. 带文本的着色容器使用 new_batch
```
// WRONG - text behind background
RoundedView{ draw_bg.color: #333 Label{text: "Invisible"} }

// CORRECT
RoundedView{ new_batch: true draw_bg.color: #333 Label{text: "Visible"} }
```

### 3. 使用 := 命名子元素
```
// Named (addressable, overridable)
title := Label{text: "Hello"}

// Static (not addressable)
Label{text: "Hello"}
```

### 4. Label 默认颜色为白色
```
// Default text is white (#fff) - set color for light backgrounds
Label{text: "Dark text" draw_text.color: #333}
```

### 5. MapView 必须具有固定高度
```
// WRONG
MapView{ width: Fill height: Fill }

// CORRECT
View{ new_batch: true width: Fill height: 400
    MapView{ width: Fill height: 400 center_lat: 40.7 center_lon: -73.9 zoom: 14.0 }
}
```

### 6. Label 不支持 Animator
```
// WRONG (silently ignored)
Label{ animator: Animator{...} }

// CORRECT - wrap in View
View{ animator: Animator{...} Label{text: "Animated"} }
```

---

## 常见小部件模式

### 卡片
```
RoundedView{
    width: Fill height: Fit
    padding: 16
    new_batch: true
    draw_bg.color: #2a2a3d
    draw_bg.border_radius: 8.0
    flow: Down spacing: 8
    title := Label{text: "Title" draw_text.color: #fff draw_text.text_style.font_size: 16}
    body := Label{text: "Content" draw_text.color: #aaa}
}
```

### 表单输入
```
View{
    width: Fill height: Fit
    flow: Down spacing: 4
    Label{text: "Email" draw_text.color: #aaa draw_text.text_style.font_size: 11}
    email_input := TextInput{
        width: Fill height: 36
        empty_text: "Enter email..."
    }
}
```

### 可滚动列表
```
ScrollYView{
    width: Fill height: Fill
    flow: Down spacing: 4
    new_batch: true
    on_render: || {
        for i, item in items {
            ItemTemplate{label.text: item.name}
        }
    }
}
```

---

## 最佳实践

1. 在每个容器上**使用 `height: Fit`**，除非你想要 Fill 或固定像素值
2. 在任何具有背景色 + 文本子元素的 View 上**使用 `new_batch: true`**
3. 对需要引用或覆盖的子元素**使用 `:=`**
4. **使用主题颜色**（`theme.color_*`），而非硬编码颜色
5. 对大型列表**使用 `PortalList`**（虚拟化渲染）
6. 对可滚动内容区域**使用 `ScrollYView`**
7. 对卡片和容器**使用 `RoundedView`**（具有 border_radius）
