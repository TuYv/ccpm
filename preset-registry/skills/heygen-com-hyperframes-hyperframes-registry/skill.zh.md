---
name: hyperframes-registry
description: Install, discover, and wire registry blocks and components into HyperFrames compositions. Use when running hyperframes add or hyperframes catalog, installing one item or every block matching a tag, wiring an installed item into index.html, or working with hyperframes.json. Covers discovery, install locations, block sub-composition wiring, component snippet merging, and authoring a new block or component to contribute upstream (idea → scaffold → validate → PR).
---
# HyperFrames 注册表

注册表提供可通过 `hyperframes add <name>` 安装的可复用区块和组件。

- **区块** — 独立的子合成（拥有自己的尺寸、持续时间和时间轴）。通过宿主合成中的 `data-composition-src` 引入。
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

安装完成后，CLI 会输出已写入的文件，以及需要粘贴到宿主合成中的代码片段。该片段只是一个起点——在接入区块时，你需要添加 `data-composition-id`（必须与区块内部的合成 ID 匹配）、`data-start` 和 `data-track-index` 属性。

位置参数值会首先按精确的项目名称进行解析。如果没有项目匹配，并且该值是一个标签，则命令会安装带有该标签的所有区块。系统会先安装注册表依赖项，再安装请求的项目。`hyperframes add` 仅适用于区块和组件；对于示例，请改用 `hyperframes init <dir> --example <name>`。

## 安装位置

默认情况下，区块安装到 `compositions/<name>.html`。默认情况下，组件安装到 `compositions/components/<name>.html`。

可在 `hyperframes.json` 中配置这些路径：

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

区块是独立的合成——请在宿主 `index.html` 中通过 `data-composition-src` 引入它们：

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
- `data-duration` — 区块播放的持续时间
- `data-width` / `data-height` — 区块画布的尺寸
- `data-track-index` — 图层顺序（值越大越靠前）

完整详情请参阅 [wiring-blocks.md](./references/wiring-blocks.md)。

## 接入组件

组件是代码片段——将其 HTML 粘贴到合成的标记中，将其 CSS 粘贴到样式块中，并将其 JS 粘贴到脚本中（如有）：

1. 读取已安装的文件（例如 `compositions/components/grain-overlay.html`）
2. 将 HTML 元素复制到合成的 `<div data-composition-id="...">` 中
3. 将 `<style>` 块复制到合成的样式中
4. 将所有 `<script>` 内容复制到合成的脚本中（放在时间轴代码之前）
5. 如果组件提供 GSAP 时间轴集成（请参阅代码片段中的注释块），请将这些调用添加到你的时间轴中

完整详情请参阅 [wiring-components.md](./references/wiring-components.md)。

## 发现

将 CLI 作为主要的发现入口。**先按意图搜索，再进行浏览：**注册表中的项目多到无法靠肉眼逐一查看，因此先列出项目、再根据名称或标签进行匹配是一条效率低下的路径；而且只要作者使用的措辞与你不同，这种方式就会失效。

```bash
# Rank the whole catalog against what the beat should do
npx hyperframes catalog --query "reveal a headline one line at a time"
npx hyperframes add caption-clip-wipe
```

搜索在本地进行，不会发送任何内容。默认情况下，它会根据项目名称、标题和描述中与你的查询共用的词汇进行排序，因此只能找到复用了你的用词的项目；`--on-device` 则会按语义进行排序，但首次使用前需要下载一次模型。使用 `--json` 时，返回结果的封装对象会说明由哪个层级作答，因此应检查该字段，而不要想当然地认为已经进行了排序。

**无论视频使用什么语言，都必须用英语查询。**目录使用英语编写，两个层级也都以英语建立索引（端侧模型同样仅支持英语）。使用其他文字系统进行查询不会产生可搜索的词，因此根本不会返回任何结果。在日语或中文项目中很容易犯这个错误，因为项目简介、字幕和旁白全都使用相应语言，查询也就会自然而然地沿用该语言：请用英语描述这个_动效_，然后再根据视频需要，使用相应语言编写画面中的文案。如果查询返回 `No searchable words in query`，原因就是这条规则，而不是缺少组件，因此不值得提交缺口报告。

可安装性是在排序之后而非之前应用的：如果某个名称存在于向量索引中，但当前注册表无法提供该项目，它就会从结果中移除，并计入 `dropped`，因此非零的 `dropped` 表示两者属于不同版本。有关离线层级、授权门槛以及如何刷新过期索引的信息，请参阅 `/hyperframes-cli`。

如需浏览或筛选而不是搜索：

```bash
npx hyperframes catalog
npx hyperframes catalog --type block
npx hyperframes catalog --type component
npx hyperframes catalog --type block --tag social
npx hyperframes catalog --json
npx hyperframes catalog --human-friendly
```

普通表格模式和 `--json` 模式只会列出匹配项；请使用 `hyperframes add <name>` 安装选定的名称。`--human-friendly` 会打开交互式选择器，并立即安装选中的项目。在 CI 或智能体工作流中，优先使用 `--json`，随后显式执行 `add`。

### 报告目录中缺少的内容

当搜索返回结果，但其中没有任何项目能够完成所需效果时，请在手动编写该动效之前进行报告：

```bash
npx hyperframes feedback --search-miss "<the query you ran>" --wanted "<the move you needed>" --tier on-device
```

`catalog --query` 会为你输出这行已预先填好的命令，而 `--json` 会通过 `report_gap` 携带该命令——因此，当你判定没有合适项目时，它已经触手可得。

**无论使用哪个层级，只要结果中没有任何项目能够完成所需效果，就应进行报告。**不要等到端侧层级返回结果后再报告：它需要经用户同意后下载 33 MB 的内容，因此除非明确选择启用，否则智能体运行时使用的是 `words`；如果将报告条件绑定到 `on-device`，几乎所有报告都会被抑制。`--tier` 的值会随报告一起传递，这样在读取这些报告时，词汇匹配失败仍可与语义匹配失败区分开来。请描述你想要的效果，而不是你设想的项目名称：最终得到的应是一份值得构建的动效列表，而报告一个不存在的项目名称无法提供任何有用信息。这是唯一会将查询发送到其他地方的路径，正因如此，它被设计成一条独立且需要主动执行的命令，而不是由搜索自行完成。它不包含评分，也永远不会计入评分指标。

这就是目录的全部需求信号。跳过这一步，就意味着你发现的空白只能根据安装量来推测，而安装量无法反映那些无人能够安装的内容。

如果 CLI 无法访问已配置的注册表，请检查原始清单作为备用方案：

```bash
curl -s https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry/registry.json
```

CLI 无法访问注册表，并**不会**导致用于**发现**的目录变空：如果重新验证失败，之前获取的清单在超过 24 小时刷新期限后仍会继续使用，因此 `catalog` 和 `catalog --query` 仍会基于磁盘上的最后一份副本进行列举和排序。

**`add` 仍然需要网络，即使是安装你昨天装过的条目。** 缓存的只有清单；每次安装时都会重新获取条目的实际文件。因此，离线时你可以搜索，也可以查看条目的内容，但安装会在获取文件时失败。不要向用户承诺可以离线安装。

每个条目的 `registry-item.json` 包含：名称、类型、标题、描述、标签、尺寸（仅限区块）、时长（仅限区块）和文件列表。

有关按类型和标签筛选的详细信息，请参阅 [discovery.md](./references/discovery.md)。

## 贡献新的区块或组件

要创作一个新的注册表条目（字幕样式、VFX 区块、转场、下三分之一字幕或可复用组件），并通过上游 PR 发布——而不是安装现有条目——请遵循 [contributing.md](./references/contributing.md) 中完整的构思 → 搭建脚手架 → 构建 → 验证 → 预览 → 发布工作流。可直接复制粘贴的入门模板（字幕 / VFX / 组件 / `registry-item.json`）位于 [templates.md](./references/templates.md)。