---
name: pierre-guard
description: Guard against breaking the @pierre/diffs integration in Plannotator's code review UI. Use this skill whenever modifying DiffViewer.tsx, upgrading the @pierre/diffs package, changing unsafeCSS injection, adding new props to FileDiff, or touching shadow DOM selectors or CSS variables that cross into Pierre's shadow boundary. Also trigger when someone asks "will this break the diff viewer", "is this safe to change", or when reviewing PRs that touch the review-editor package.
---
# Pierre 集成防护

Plannotator 的代码审查 UI 封装了 `@pierre/diffs`——一个使用 Shadow DOM 的开源差异渲染器。该集成集中在单个文件中，但依赖未文档化的内部实现（Shadow DOM 选择器、CSS 变量名、网格布局假设）。此技能有助于验证变更不会破坏这一约定。

## 权威来源

- **上游仓库**：https://github.com/pierrecomputer/pierre/tree/main/packages/diffs
- **本地类型**：`node_modules/@pierre/diffs/dist/`（`.d.ts` 文件）
- **集成点**：`packages/review-editor/components/DiffViewer.tsx`
- **当前版本**：查看 `packages/review-editor/package.json` 中锁定的版本

始终根据上游仓库或本地 `.d.ts` 文件进行验证——不要依赖对 API 结构的记忆。

## 我们导入的内容

```typescript
import { FileDiff } from '@pierre/diffs/react';
import { getSingularPatch, processFile } from '@pierre/diffs';
```

这是仅有的三个导入项。`DiffViewer.tsx` 是唯一使用 Pierre 的文件。

## 需要防护的 API 范围

### 1. 组件属性（`FileDiff`）

从 `node_modules/@pierre/diffs/dist/react/index.d.ts` 或上游源代码中读取当前的属性类型。我们使用的属性：

| 属性 | 类型 | 备注 |
|------|------|-------|
| `fileDiff` | `FileDiffMetadata` | 来自 `getSingularPatch()` 或 `processFile()` |
| `options` | `FileDiffOptions<T>` | 请参阅下方的选项表 |
| `lineAnnotations` | `DiffLineAnnotation<T>[]` | `{ side, lineNumber, metadata }` |
| `selectedLines` | `SelectedLineRange \| null` | `{ start, end, side }` |
| `renderAnnotation` | `(ann) => ReactNode` | 自定义行内注解渲染器 |
| `renderHoverUtility` | `(getHoveredLine) => ReactNode` | 悬停时显示的 `+` 按钮（上游已弃用——注意其是否被移除） |

### 2. 选项对象

| 选项 | 我们传入的值 | 风险 |
|--------|--------------|------|
| `themeType` | `'dark' \| 'light'` | 低——标准枚举 |
| `unsafeCSS` | CSS 字符串 | **高**——以内部选择器为目标 |
| `diffStyle` | `'split' \| 'unified'` | 低——标准枚举 |
| `diffIndicators` | `'bars'` | 低 |
| `hunkSeparators` | `'line-info'` | 低 |
| `enableLineSelection` | `true` | 低 |
| `enableHoverUtility` | `true` | 中——已弃用的属性 |
| `onLineSelectionEnd` | 回调 | 中——签名可能发生变化 |

### 3. Shadow DOM 选择器（通过 `unsafeCSS`）

这些是我们注入 CSS 规则时针对的选择器。它们以 Pierre 的 Shadow DOM 内部的 `data-*` 属性为目标。如果 Pierre 重命名或移除其中任何一个，我们的样式将悄无声息地失效。

**当前使用：**
- `:host`——Shadow Root
- `[data-diff]`——差异根容器
- `[data-file]`——文件包装器
- `[data-diffs-header]`——标题栏
- `[data-error-wrapper]`——错误显示区域
- `[data-virtualizer-buffer]`——虚拟滚动缓冲区
- `[data-file-info]`——文件元数据行
- `[data-column-number]`——行号栏
- `[data-diffs-header] [data-title]`——标题（我们将其隐藏）
- `[data-diff-type='split']`——分栏布局模式
- `[data-overflow='scroll']` / `[data-overflow='wrap']`——溢出模式

### 4. 我们覆盖的 CSS 变量

我们覆盖以下 `--diffs-*` 变量来设置 Pierre 的主题：

- `--diffs-bg`, `--diffs-fg` — 基础颜色
- `--diffs-dark-bg`, `--diffs-light-bg` — 特定主题的背景色
- `--diffs-dark`, `--diffs-light` — 特定主题的前景色

### 5. 我们注入的 CSS 变量（自定义）

我们在 Shadow DOM 外部的包装器 div 上设置这些变量，并依赖 CSS 自定义属性的继承机制：

- `--split-left`, `--split-right` — 控制拆分窗格的网格比例

`unsafeCSS` 网格覆盖会引用这些变量：`grid-template-columns: var(--split-left, 1fr) var(--split-right, 1fr)`。如果未设置这些变量，`1fr` 回退值可确保布局安全。

### 6. 网格布局假设

Pierre 的拆分视图使用 CSS Grid，并设置了 `grid-template-columns: 1fr 1fr`。我们为可调整大小的拆分窗格覆盖了此设置。如果 Pierre 更改其布局引擎（例如改用 flexbox 或不同的网格结构），此覆盖将不再生效。

**验证方法：**在上游源代码中，搜索差异组件样式里的 `grid-template-columns`。

## 验证清单

审查涉及 Pierre 集成的更改时，请检查：

### 属性与类型
- [ ] 阅读当前的 `.d.ts` 文件，确认属性名称和类型未发生变化
- [ ] 检查是否仍然支持 `renderHoverUtility`（它已被弃用，可能会被移除）
- [ ] 验证 `DiffLineAnnotation` 是否仍然使用 `side: 'deletions' | 'additions'`（而非 `'old' | 'new'`）
- [ ] 确认 `SelectedLineRange` 的结构：`{ start, end, side? }`

### Shadow DOM 选择器
- [ ] 在上游源代码中 grep 搜索我们在 `unsafeCSS` 中使用的每个 `data-*` 属性
- [ ] 如果要升级软件包版本，对比新旧 CSS/HTML 输出，检查是否有重命名的属性
- [ ] 同时测试 `split` 和 `unified` 视图——选择器取决于布局

### CSS 变量
- [ ] 在上游代码中 grep 搜索 `--diffs-bg`、`--diffs-fg` 以及我们覆盖的其他变量
- [ ] 验证变量名称是否被重命名或移除
- [ ] 检查是否仍然需要 `!important`（Pierre 可能会更改特异性）

### 主题合规性
- [ ] 新的 UI 元素必须使用主题令牌（`bg-border`、`bg-primary` 等），不能使用 `bg-blue-500` 之类的硬编码颜色
- [ ] `packages/ui/components/ResizeHandle.tsx` 中现有的 `ResizeHandle` 组件定义了视觉规范——请与其保持一致

### 构建与运行时
- [ ] 运行 `bun run dev:review`，并验证差异内容在拆分和统一模式下均可正常渲染
- [ ] 检查浏览器控制台中是否有 Pierre 警告（例如 `parseLineType: Invalid firstChar`）
- [ ] 使用仅新增和仅删除的文件进行测试（Pierre 不会为这些文件渲染拆分网格）
- [ ] 如果更改 UI 代码，请记住构建顺序：`bun run --cwd apps/review build && bun run build:hook`

## 升级 @pierre/diffs 时

1. 在 https://github.com/pierrecomputer/pierre 查看上游变更日志/提交历史
2. 对比新旧版本的 `.d.ts` 文件：
   ```bash
   # Before upgrading, snapshot current types
   cp -r node_modules/@pierre/diffs/dist /tmp/pierre-old
   # After upgrading
   diff -r /tmp/pierre-old node_modules/@pierre/diffs/dist
   ```
3. 在新版本中搜索已重命名或移除的 data 属性
4. 完成上面的完整验证清单
5. 测试可调整大小的拆分窗格——它依赖网格布局内部实现