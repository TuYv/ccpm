---
name: hyperframes-registry
description: Install, discover, and wire registry blocks and components into HyperFrames compositions. Use when running hyperframes add or hyperframes catalog, installing one item or every block matching a tag, wiring an installed item into index.html, or working with hyperframes.json. Covers discovery, install locations, block sub-composition wiring, component snippet merging, and authoring a new block or component to contribute upstream (idea → scaffold → validate → PR).
---
# HyperFrames 注册表

注册表提供可通过 `hyperframes add <name>` 安装的可复用区块和组件。

- **区块** — 独立的子合成（拥有自己的尺寸、时长和时间轴）。通过宿主合成中的 `data-composition-src` 引入。
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

安装后，CLI 会输出写入了哪些文件，以及一段可粘贴到宿主合成中的代码片段。该片段只是一个起点 — 在接入区块时，你需要添加 `data-composition-id`（必须与区块内部的合成 ID 匹配）、`data-start` 和 `data-track-index` 属性。

位置参数值会先按精确的条目名称进行解析。如果没有匹配的条目，并且该值是一个标签，则该命令会安装带有该标签的所有区块。注册表依赖项会先于所请求的条目安装。`hyperframes add` 仅适用于区块和组件；对于示例，请改用 `hyperframes init <dir> --example <name>`。

## 安装位置

区块默认安装到 `compositions/<name>.html`。组件默认安装到 `compositions/components/<name>.html`。

这些路径可在 `hyperframes.json` 中配置：

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

## 接入区块

区块是独立的合成 — 可通过宿主 `index.html` 中的 `data-composition-src` 引入：

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
- `data-start` — 区块在宿主时间轴中出现的时间（秒）
- `data-duration` — 区块播放的时长
- `data-width` / `data-height` — 区块画布的尺寸
- `data-track-index` — 图层顺序（值越高越靠前）

完整详情请参阅 [wiring-blocks.md](./references/wiring-blocks.md)。

## 接入组件

组件是代码片段 — 将其 HTML 粘贴到合成的标记中，将其 CSS 粘贴到样式块中，并将其 JS 粘贴到脚本中（如果有）：

1. 读取已安装的文件（例如 `compositions/components/grain-overlay.html`）
2. 将 HTML 元素复制到合成的 `<div data-composition-id="...">` 中
3. 将 `<style>` 块复制到合成的样式中
4. 将所有 `<script>` 内容复制到合成的脚本中（放在时间轴代码之前）
5. 如果组件提供 GSAP 时间轴集成（请参阅代码片段中的注释块），请将这些调用添加到你的时间轴中

完整详情请参阅 [wiring-components.md](./references/wiring-components.md)。

## 发现

将 CLI 作为主要的发现界面。**先按意图搜索，再进行浏览：**注册表中的项目多到无法靠肉眼逐一查看，因此先列出项目再按名称或标签匹配效率很低，而且只要作者使用的措辞与你不同，这种方式就会失效。

```bash
# Rank the whole catalog against what the beat should do
npx hyperframes catalog --query "reveal a headline one line at a time"
npx hyperframes add caption-clip-wipe
```

搜索在本地执行，不会发送任何内容。默认情况下，它根据与项目名称、标题和描述共有的词汇进行排名，因此只能找到复用了你的用词的项目；`--on-device` 则会在一次性下载模型后，改为按语义进行排名。使用 `--json` 时，返回结构会标明由哪个层级给出结果，因此应检查该字段，而不要想当然地认为已经执行了排名。

可安装性筛选是在排名后而非排名前应用的：如果向量中包含某个名称，但此注册表无法提供对应项目，该名称就会从结果中移除并计入 `dropped`，因此非零的 `dropped` 表明两者来自不同版本。有关离线层级、同意授权机制以及如何刷新过期索引的信息，请参阅 `/hyperframes-cli`。

如需浏览或筛选而非搜索：

```bash
npx hyperframes catalog
npx hyperframes catalog --type block
npx hyperframes catalog --type component
npx hyperframes catalog --type block --tag social
npx hyperframes catalog --json
npx hyperframes catalog --human-friendly
```

普通表格模式和 `--json` 模式只会列出匹配项；使用 `hyperframes add <name>` 安装选定的名称。`--human-friendly` 会打开交互式选择器，并立即安装选中的项目。在 CI 或代理工作流中，建议使用 `--json`，然后显式执行 `add`。

如果 CLI 无法访问已配置的注册表，可检查原始清单作为后备方案：

```bash
curl -s https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry/registry.json
```

每个项目的 `registry-item.json` 都包含：名称、类型、标题、描述、标签、尺寸（仅限区块）、时长（仅限区块）以及文件列表。

有关按类型和标签筛选的详细信息，请参阅 [discovery.md](./references/discovery.md)。

## 贡献新的区块或组件

要创作一个新的注册表项目（字幕样式、VFX 区块、转场、字幕条或可复用组件），并通过上游 PR 发布——而不是安装现有项目——请遵循 [contributing.md](./references/contributing.md) 中完整的构思 → 搭建脚手架 → 构建 → 验证 → 预览 → 发布工作流。可直接复制粘贴的入门模板（字幕 / VFX / 组件 / `registry-item.json`）位于 [templates.md](./references/templates.md)。