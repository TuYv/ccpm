---
name: hyperframes-registry
description: Install, discover, and wire registry blocks and components into HyperFrames compositions. Use when running hyperframes add or hyperframes catalog, installing one item or every block matching a tag, wiring an installed item into index.html, or working with hyperframes.json. Covers discovery, install locations, block sub-composition wiring, component snippet merging, and authoring a new block or component to contribute upstream (idea → scaffold → validate → PR).
---
# HyperFrames 注册表

注册表提供可通过 `hyperframes add <name>` 安装的可复用区块和组件。

- **区块** — 独立的子合成（拥有自己的尺寸、时长和时间线）。通过宿主合成中的 `data-composition-src` 引入。
- **组件** — 效果片段（没有自己的尺寸）。直接粘贴到宿主合成的 HTML 中。

## 快速参考

```bash
hyperframes add data-chart              # install a block
hyperframes add grain-overlay           # install a component
hyperframes add captions                # install every block tagged captions
hyperframes add shimmer-sweep --dir .   # target a specific project
hyperframes add data-chart --json       # machine-readable output
hyperframes add data-chart --no-clipboard  # skip clipboard (CI/headless)
```

安装后，CLI 会输出写入了哪些文件，以及一个可粘贴到宿主合成中的代码片段。该片段只是一个起点——在连接区块时，你需要添加 `data-composition-id`（必须与区块内部的合成 ID 匹配）、`data-start` 和 `data-track-index` 属性。

位置参数值会首先按精确的项目名称进行解析。如果没有匹配的项目，但该值是一个标签，则该命令会安装带有该标签的所有区块。注册表依赖项会在请求的项目之前安装。`hyperframes add` 仅适用于区块和组件；对于示例，请改用 `hyperframes init <dir> --example <name>`。

## 安装位置

默认情况下，区块安装到 `compositions/<name>.html`。组件默认安装到 `compositions/components/<name>.html`。

可以在 `hyperframes.json` 中配置这些路径：

```json
{
  "registry": "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry",
  "paths": {
    "blocks": "compositions",
    "components": "compositions/components",
    "assets": "assets"
  }
}
```

完整详情请参阅 [install-locations.md](./references/install-locations.md)。

## 连接区块

区块是独立的合成——通过宿主 `index.html` 中的 `data-composition-src` 引入它们：

```html
<div
  data-composition-id="data-chart"
  data-composition-src="compositions/data-chart.html"
  data-start="2"
  data-duration="15"
  data-track-index="1"
  data-width="1920"
  data-height="1080"
></div>
```

关键属性：

- `data-composition-src` — 区块 HTML 文件的路径
- `data-composition-id` — 必须与区块的内部 ID 匹配
- `data-start` — 区块在宿主时间线中出现的时间（秒）
- `data-duration` — 区块播放的时长
- `data-width` / `data-height` — 区块画布尺寸
- `data-track-index` — 图层顺序（数值越大越靠前）

完整详情请参阅 [wiring-blocks.md](./references/wiring-blocks.md)。

## 连接组件

组件是代码片段——将其 HTML 粘贴到合成的标记中，将其 CSS 粘贴到样式块中，并将其 JS 粘贴到脚本中（如果有）：

1. 读取已安装的文件（例如 `compositions/components/grain-overlay.html`）
2. 将 HTML 元素复制到合成的 `<div data-composition-id="...">` 中
3. 将 `<style>` 块复制到合成的样式中
4. 将所有 `<script>` 内容复制到合成的脚本中（放在时间线代码之前）
5. 如果组件提供 GSAP 时间线集成（请参阅代码片段中的注释块），请将这些调用添加到时间线中

完整详情请参阅 [wiring-components.md](./references/wiring-components.md)。

## 发现

将 CLI 作为主要的发现入口：

```bash
npx hyperframes catalog
npx hyperframes catalog --type block
npx hyperframes catalog --type component
npx hyperframes catalog --type block --tag social
npx hyperframes catalog --json
npx hyperframes catalog --human-friendly
```

普通表格模式和 `--json` 模式仅列出匹配项；使用 `hyperframes add <name>` 安装所选名称对应的项目。`--human-friendly` 会打开交互式选择器，并立即安装所选项目。在 CI 或智能体工作流中，建议使用 `--json`，然后显式执行 `add`。

如果 CLI 无法访问已配置的注册表，可检查原始清单作为备用方案：

```bash
curl -s https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry/registry.json
```

每个项目的 `registry-item.json` 包含：名称、类型、标题、描述、标签、尺寸（仅限区块）、时长（仅限区块）以及文件列表。

有关按类型和标签筛选的详细信息，请参阅 [discovery.md](./references/discovery.md)。

## 贡献新的区块或组件

若要创作一个新的注册表项目（字幕样式、VFX 区块、转场、下三分之一字幕条或可复用组件），并通过上游 PR 发布——而不是安装现有项目——请遵循 [contributing.md](./references/contributing.md) 中完整的构思 → 搭建脚手架 → 构建 → 验证 → 预览 → 发布工作流。可复制粘贴的入门模板（字幕 / VFX / 组件 / `registry-item.json`）位于 [templates.md](./references/templates.md)。