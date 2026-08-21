---
name: moai-design-tools
description: >
  Design tool integration specialist covering Figma MCP, Pencil renderer, and
  Pencil-to-code export. Use when fetching design context from Figma, rendering
  Pencil designs, or exporting to React/Tailwind code.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, WebFetch, WebSearch, mcp__context7__resolve-library-id, mcp__context7__get-library-docs, mcp__pencil__batch_design, mcp__pencil__batch_get, mcp__pencil__get_screenshot, mcp__pencil__snapshot_layout, mcp__pencil__get_editor_state, mcp__pencil__get_variables, mcp__pencil__set_variables, mcp__pencil__get_guidelines, mcp__pencil__get_style_guide, mcp__pencil__get_style_guide_tags, mcp__pencil__open_document, mcp__pencil__find_empty_space_on_canvas, mcp__pencil__replace_all_matching_properties, mcp__pencil__search_all_unique_properties
user-invocable: false
metadata:
  version: "5.1.0"
  category: "domain"
  status: "active"
  updated: "2026-04-05"
  modularized: "false"
  tools: "Figma, Pencil MCP"
  tags: "figma, pencil, design to code, design export, render dna, pen frame, react from design, tailwind from design, design context, ui implementation"
  context7-libraries: "/figma/docs, /pencil/docs"
  related-skills: "moai-domain-uiux, moai-domain-frontend, moai-library-shadcn, moai-lang-typescript, moai-lang-react"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5500

# MoAI Extension: Triggers
triggers:
  keywords: ["figma", "pencil", "design to code", "design export", "render dna", "pen frame", "react from design", "tailwind from design", "design context", "ui implementation", "design fetching", "figma mcp", "pencil mcp", "component from design", "layout from design"]
  agents: ["expert-frontend", "team-designer"]
  phases: ["run"]
---
# 设计工具集成专家

全面的设计到代码工作流指南，涵盖三项主要能力：Figma MCP（设计获取）、Pencil MCP（视觉渲染）以及 Pencil 到代码导出（生成 React/Tailwind）。

## 默认设计风格（shadcn/ui Nova）

当未指定具体设计风格时，使用采用 Notion 风格中性色方案的 **shadcn/ui Nova** 预设：

```
bunx --bun shadcn@latest create --preset "https://ui.shadcn.com/init?base=radix&style=nova&baseColor=neutral&theme=neutral&iconLibrary=hugeicons&font=noto-sans&menuAccent=bold&menuColor=default&radius=small&template=next&rtl=false" --template next
```

### Nova 风格配置

| 属性 | 值 | 描述 |
|----------|-------|-------------|
| 风格 | `nova` | 现代、简洁的设计语言 |
| 基础颜色 | `neutral` | Notion 风格的灰度调色板 |
| 主题 | `neutral` | 一致的中性主题 |
| 图标库 | `hugeicons` | 全面的图标集 |
| 字体 | `noto-sans` | 简洁、易读的无衬线字体 |
| 圆角 | `small` | 细微的圆角 |
| 菜单强调 | `bold` | 醒目的菜单高亮 |

### 何时使用默认风格

在以下情况下应用 Nova 预设：
- 用户要求“简洁”“现代”或“极简”设计，但未提供具体要求
- 未指定品牌指南或设计系统
- 创建仪表盘、管理面板或生产力工具
- 构建文档或以内容为中心的界面

## 工具快速选择

### Figma MCP - 设计上下文与生成

通过远程 MCP 服务器 (https://mcp.figma.com/mcp) 实现的官方 Figma MCP 集成。安装命令：`claude plugin install figma@claude-plugins-official`

最适合：从 Figma 文件获取设计上下文、提取设计令牌、使用 Code-to-Canvas (generate_figma_design) 生成新设计、访问 FigJam 白板，以及通过 Code Connect 将组件与代码关联。

主要优势：提供 16 个官方工具，包括读取工具（get_design_context、get_variable_defs、get_screenshot、get_metadata）、写入工具（use_figma、generate_figma_design、create_new_file）、Code Connect 工具（get_code_connect_map、add_code_connect_map、get_code_connect_suggestions、send_code_connect_mappings）、FigJam 工具（get_figjam、generate_diagram）、设计系统工具（search_design_system、create_design_system_rules）以及实用工具（whoami）。画布写入功能目前在测试期间免费。

工作流：安装插件 → get_design_context → get_variable_defs → get_screenshot → 实现设计 → 对照截图验证。

Context7 库：/figma/docs

### Pencil MCP - 视觉设计渲染

Pencil MCP 集成用于借助 AI 辅助设计生成功能创建和编辑 .pen 设计文件（schema v2.9）。CLI：`@pencil.dev/cli` v0.2.4。

最适合：快速原型设计、视觉设计迭代、根据文本描述创建 UI 模型、协作式设计讨论，以及实现前的视觉方案。

主要优势：文本到设计转换、批量设计操作、样式指南集成、无需实现即可进行视觉预览、协作式设计工作流、带插槽的组件系统、设计库（.lib.pen）。

**可用的 Pencil MCP 工具（14 个 + 1 个仅限 CLI）：**

**注意：** .pen 文件是纯 JSON（可进行 Git 差异比较和合并）。共有 13 种节点类型：Rectangle、Ellipse、Line、Polygon、Path、Text、Frame、Group、Note、Prompt、Context、IconFont、Ref。

| 工具 | 用途 |
|------|---------|
| `batch_design` | 批量创建、修改和操作设计元素（Insert/Copy/Replace/Update/Delete/Move/Generate） |
| `batch_get` | 按模式或节点 ID 读取设计组件及其层级结构 |
| `get_screenshot` | 将设计预览渲染为 PNG 图像 |
| `snapshot_layout` | 使用边界框分析计算后的布局结构并检测重叠 |
| `get_editor_state` | 获取当前编辑器上下文、活动文件和选中内容 |
| `get_variables` | 读取设计令牌和主题变量（颜色、间距、圆角、尺寸、字体） |
| `set_variables` | 更新设计令牌和主题变量 |
| `search_all_unique_properties` | 递归搜索节点上的所有唯一属性 |
| `replace_all_matching_properties` | 递归替换节点上所有匹配的属性 |
| `get_guidelines` | 获取设计指南（主题：code、table、tailwind、landing-page、design-system） |
| `get_style_guide` | 按名称或标签获取样式指南 |
| `get_style_guide_tags` | 列出所有可用的样式指南标签 |
| `open_document` | 打开现有的 .pen 文件或创建新文件 |
| `find_empty_space_on_canvas` | 查找画布上可用于放置新元素的空间 |
| `export_nodes` | **仅限 CLI** — 以缩放倍数导出为 PNG、JPEG、WEBP、PDF |

工作流程：使用自然语言描述 UI → 使用 batch_design 生成设计 → 使用 get_screenshot 进行可视化审查 → 迭代设计 → 准备就绪后导出为代码。

**CLI 身份验证：** `pencil login`（交互式）或 `PENCIL_CLI_KEY` 环境变量（CI/CD）。代理模式：`pencil --out file.pen --prompt "..." --model claude-sonnet-4-6`。

Context7 库：/pencil/docs

### Pencil 到代码导出——生成 React/Tailwind

通过基于提示词的工作流程，将 .pen 设计导出为可用于生产环境的 React 和 Tailwind CSS 代码。

最适合：将已获批准的 .pen 设计转换为实现代码、生成带有 Tailwind 样式的 React 组件、在代码中保持设计保真度，以及基于视觉设计快速进行前端开发。

主要优势：基于提示词生成代码（无导出 API）、使用 batch_get 读取 .pen JSON 结构、通过 get_variables 提取设计令牌、生成带有 Tailwind 类的 React 组件，以及保留组件结构。

工作流程：batch_get 框架数据 → 分析 JSON 结构 → 映射到 React/Tailwind → 应用设计令牌 → 对照屏幕截图进行验证。

注意：Pencil 到代码采用基于提示词的工作流程。不存在 `pencil.export_to_react()` API 或 `pencil.config.js` 配置文件。

## 快速决策指南

在以下情况下选择 Figma MCP：
- 需要从现有 Figma 文件中提取设计上下文
- 与使用 Figma 的设计师合作
- 需要获取设计令牌和组件规范
- 需要来自 Figma 的屏幕截图或视觉参考
- 记录现有设计系统

以下情况请选择 Pencil MCP：
- 从零开始创建设计
- 需要快速制作原型并进行视觉迭代
- 偏好基于文本的设计工作流
- 希望使用 AI 辅助生成设计
- 与团队协作讨论设计

以下情况请选择 Pencil-to-Code Export：
- 设计已在 .pen 格式中定稿
- 已准备好将视觉设计实现为代码
- 需要使用 Tailwind 样式的 React 组件
- 保持设计还原度至关重要
- 根据设计快速开展前端开发

## Pencil MCP 工作流

### 开始设计会话

1. **检查编辑器状态**
   ```
   get_editor_state() → Determine active .pen file and user selection
   ```

2. **打开或创建文档**
   ```
   open_document(filePathOrNew: "new") → Create new .pen file
   open_document(filePathOrNew: "/path/to/file.pen") → Open existing
   ```

3. **获取设计指南**
   ```
   get_guidelines(topic: "code" | "table" | "tailwind" | "landing-page")
   get_style_guide_tags() → Get available style tags
   get_style_guide(tags: ["minimalist", "dashboard"], name: "nova")
   ```

### 创建设计

1. **使用 batch_design 生成**

   使用 batch_design 高效执行批量操作。语法：
   ```
   foo=I("parent", { ... })    // Insert new node
   baz=C("nodeid", "parent", { ... })  // Copy node
   foo2=R("nodeid1/nodeid2", {...})    // Replace node
   U(foo+"/nodeid", {...})     // Update node
   D("dfFAeg2")               // Delete node
   M("nodeid3", "parent", 2)   // Move node
   G("baz", "ai", "...")       // Generate image with AI
   ```

2. **使用默认 Nova 风格进行设计**

   在未指定用户风格的情况下创建组件时：
   - 使用中性色板（灰色、白色）
   - 应用小圆角（4-6px）
   - 使用 Noto Sans 或系统无衬线字体
   - 保持简洁、极简的美学风格
   - 应用一致的 4px/8px 间距网格

3. **使用 get_screenshot 检查**
   ```
   get_screenshot() → Visual validation of design
   ```

### 管理设计令牌

1. **读取变量**
   ```
   get_variables() → Current design tokens and themes
   ```

2. **更新变量**
   ```
   set_variables(variables: { primary: "#3B82F6", ... })
   ```

### 布局分析

```
snapshot_layout() → Analyze computed layout rectangles
find_empty_space_on_canvas(direction: "right", size: { w: 200, h: 100 })
```

## 常见的设计转代码模式

### 通用模式

这些模式适用于全部三种工具，并由各工具采用特定的实现方式。

**设计令牌管理：**

所有工具都支持设计令牌的提取和管理。Figma MCP 从现有文件中提取令牌，Pencil MCP 在创建设计时生成令牌，Pencil-to-code 将令牌导出为 CSS 变量或 Tailwind 配置。

**组件架构：**

所有工具都会保留组件层级结构。Figma MCP 从 Figma 中读取组件结构，Pencil MCP 在 DNA 代码中创建组件结构，Pencil-to-code 在保留层级结构的同时生成 React 组件。

**响应式设计：**

所有工具都能处理响应式布局。Figma MCP 提取响应式变体，Pencil MCP 在 DNA 中定义响应式断点，Pencil-to-code 生成 Tailwind 响应式类。

**样式一致性：**

所有工具都能确保设计一致性。Figma MCP 会根据设计系统进行验证，Pencil MCP 会强制应用设计令牌，Pencil-to-code 会应用一致的 Tailwind 类。

### 工作流最佳实践

适用于所有工具：

**设计系统集成：**
- 在开始设计工作之前定义设计令牌
- 在各工具之间使用一致的命名约定
- 为设计值维护单一事实来源
- 记录令牌用法和组件模式

**版本控制：**
- 提交 Figma 元数据快照以供参考
- 在代码仓库中对 .pen 文件进行版本控制
- 使用 git 跟踪设计迭代
- 在代码注释中记录设计决策

**协作：**
- 使用 Figma 评论提供设计反馈
- 共享 .pen 画框以进行视觉评审
- 为设计变更创建拉取请求
- 在维护代码的同时维护设计文档

**质量保证：**
- 根据样式指南验证设计令牌
- 测试响应式断点
- 验证无障碍合规性
- 审查生成的代码以进行优化

## 特定工具的实现

有关特定工具的详细实现指南，请参阅以下参考文件：

### Figma MCP 实现

文件：reference/figma.md

涵盖 Figma MCP 连接设置、文件元数据获取、组件树提取、设计令牌检索、屏幕截图捕获和样式指南生成。

关键章节：MCP 配置、身份验证设置、文件访问模式、元数据查询、组件层级解析、令牌提取格式、屏幕截图 API 用法、设计系统文档。

### Pencil MCP 渲染

文件：reference/pencil-renderer.md

涵盖 batch_design 操作、样式指南集成、.pen 画框渲染、视觉设计迭代、协作工作流和设计版本控制。

关键章节：batch_design 语法、自然语言设计提示词、渲染选项、画框配置、设计优化模式、版本控制策略、团队协作工作流。

### Pencil-to-Code 导出

文件：reference/pencil-code.md

涵盖将 .pen 设计导出为 React 组件、Tailwind CSS 生成、组件结构保留、响应式布局处理和设计系统集成。

关键章节：导出配置、React 组件生成、Tailwind 类应用、props API 设计、状态管理集成、生成组件的测试、优化策略。

### 工具比较

文件：reference/comparison.md

提供详细的比较矩阵，涵盖使用场景、工作流模式、集成复杂度以及何时使用各个工具。

关键章节：功能比较表、工作流决策矩阵、工具集成模式、迁移策略、生态系统兼容性、团队工作流建议。

## 导航指南

使用设计转代码功能时：

1. 如果需要选择工具，请从上方的快速工具选择开始
2. 未指定样式时，应用默认 Nova 样式
3. 查看通用设计转代码模式以了解通用概念
4. 打开特定工具的参考文件以了解实现细节
5. 评估多个工具时，请参阅 comparison.md
6. 使用 Context7 工具访问最新的工具文档

## Context7 文档访问

使用 Context7 MCP 访问最新的工具文档：

**Figma：**
- 使用 resolve-library-id，并以 "figma" 获取库 ID
- 使用 get-library-docs，topic 分别为 "mcp"、"api"、"design-tokens"、"metadata"

**Pencil：**
- 使用 resolve-library-id，并以 "pencil" 获取库 ID
- 使用 get-library-docs，topic 分别为 "mcp"、"dna-codes"、"rendering"、"export"

## 官方文档

- Pencil 官方网站：https://pencil.dev
- Pencil 文档：https://docs.pencil.dev
- Pencil AI 集成：https://docs.pencil.dev/getting-started/ai-integration

## 适合搭配使用

- moai-domain-uiux：设计系统和组件架构
- moai-domain-frontend：React 实现模式
- moai-library-shadcn：shadcn/ui 组件集成（Nova 预设）
- moai-lang-typescript：用于生成组件的 TypeScript
- moai-lang-react：React 最佳实践
- moai-foundation-core：SPEC 驱动的开发工作流

---

状态：活跃
版本：5.1.0（Pencil 文档同步——schema v2.9、CLI v0.2.4、slots、libraries、完整 node types）
最后更新：2026-04-05
工具：Figma MCP（16 个工具，官方远程服务器）、Pencil MCP（14 个工具 + 仅限 CLI 的 export_nodes）、Pencil-to-Code 导出
默认样式：shadcn/ui Nova（neutral、noto-sans、small radius）
UI 套件：Shadcn UI（默认）、Halo（玻璃拟态）、Lunaris（深色模式）、Nitro（极简）

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的合理化借口

| 合理化借口 | 事实 |
|---|---|
| “我可以根据截图实现设计，不需要 Figma 上下文” | 截图会丢失组件结构、间距 token 和交互状态。Figma MCP 可提供结构化设计数据。 |
| “Pencil 文件只供设计师使用，开发者不需要” | Pencil 文件包含布局约束和组件层级。开发者将其作为实现的唯一事实来源。 |
| “我会先导出为代码，然后再整理” | 生成的代码只是起点，而不是交付成果。未经审查的导出会产生不具备语义且无障碍性不足的标记。 |
| “设计 token 太死板了，我需要自定义值” | 自定义值会绕过设计系统。应通过系统扩展 token，而不是绕开系统。 |
| “我会在实现后与设计师同步” | 实现后同步意味着返工。实现前同步意味着达成一致。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 实现使用硬编码值，而不是来自 Figma 或 Pencil 的设计 token
- 导出的代码未经语义化 HTML 清理便提交
- 实现中缺少交互状态（hover、focus、active、disabled）
- Pencil 文件已更新，但实现未同步
- 设计工具导出内容包含会破坏响应式布局的绝对定位

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 已将 Figma 或 Pencil 中的设计 token 用于颜色、间距和排版
- [ ] 已实现所有交互状态（hover、focus、active、disabled）
- [ ] 已使用语义化 HTML 和无障碍属性清理导出的代码
- [ ] 实现在所有断点处均与设计文件一致（进行视觉对比）
- [ ] 在有可用设计 token 的地方未使用硬编码像素值

<!-- moai:evolvable-end -->