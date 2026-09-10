---
name: hyperframes-registry
description: Search, install, and wire registry blocks and components into HyperFrames compositions. Use BEFORE hand-building any named visual — whenever a brief, a user, or a storyboard names a look, effect, treatment, or transition such as CRT scanlines, glitch, chromatic aberration, film grain, a shimmer sweep, a chart, a code or terminal window, a map, or a confetti burst — because roughly 400 hosted items already cover many of them and the search ranks all of them with nothing installed, no project, and no account. Also use when running hyperframes add or hyperframes catalog, installing one item or every block matching a tag, wiring an installed item into index.html, or working with hyperframes.json. Covers discovery, install locations, block sub-composition wiring, component snippet merging, and authoring a new block or component to contribute upstream (idea → scaffold → validate → PR).
---
# HyperFrames 注册表

该注册表提供可通过 `hyperframes add <name>` 安装的可复用区块和组件。

- **区块** — 独立的子组合（拥有自己的尺寸、时长和时间线）。在宿主组合中通过 `data-composition-src` 引入。
- **组件** — 效果片段（没有自己的尺寸）。直接粘贴到宿主组合的 HTML 中。

## 快速参考

```bash
hyperframes add data-chart              # install a block
hyperframes add grain-overlay           # install a component
hyperframes add captions                # install every block tagged captions
hyperframes add shimmer-sweep --dir .   # target a specific project
hyperframes add data-chart --json       # machine-readable output
hyperframes add data-chart --no-clipboard  # skip clipboard (CI/headless)
```

安装完成后，CLI 会输出已写入的文件以及要粘贴到宿主组合中的代码片段。该片段只是起点：连接区块时，你还需要添加 `data-composition-id`（必须与区块内部的组合 ID 匹配）、`data-start` 和 `data-track-index` 属性。

位置参数会先按完全匹配的项目名称解析。如果没有匹配的项目，而该值是一个标签，则命令会安装所有带有该标签的区块。注册表依赖项会在请求的项目之前安装。`hyperframes add` 仅适用于区块和组件；对于示例，请改用 `hyperframes init <dir> --example <name>`。

## 安装位置

默认情况下，区块会安装到 `compositions/<name>.html`。组件会安装到 `compositions/components/<name>.html`。

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

## 连接区块

区块是独立的组合，在宿主 `index.html` 中通过 `data-composition-src` 引入：

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

组件是代码片段：将其 HTML 粘贴到组合的标记中，将其 CSS 粘贴到样式块中，并将其 JS（如果有）粘贴到脚本中：

1. 读取已安装的文件（例如 `compositions/components/grain-overlay.html`）
2. 将 HTML 元素复制到组合的 `<div data-composition-id="...">` 中
3. 将 `<style>` 块复制到组合的样式中
4. 将所有 `<script>` 内容复制到组合的脚本中（位于时间线代码之前）
5. 如果组件提供 GSAP 时间线集成（参见代码片段中的注释块），将这些调用添加到你的时间线中

详情请参阅 [wiring-components.md](./references/wiring-components.md)。

## 发现

使用 CLI 作为主要发现入口。**先按意图搜索，再浏览：**注册表中的项目数量多于你可以逐一查看的数量，因此列出项目并根据名称或标签匹配是较慢的路径；而且当作者使用的措辞与你不同，它就会失效。

```bash
# Rank the whole catalog against what the beat should do
npx hyperframes catalog --query "reveal a headline one line at a time"
npx hyperframes add caption-clip-wipe
```

搜索在本地进行，不会发送任何内容。默认情况下，它根据项目名称、标题和描述中与搜索词共有的词汇进行排名，因此只能找到复用你所用词语的项目；`--on-device` 则改为按含义进行排名，但需要先下载一次模型。使用 `--json` 时，返回的数据封装会标明是哪个层级提供了结果，因此请检查该字段，不要假定搜索确实执行了语义排名。

**无论视频使用何种语言，都始终使用英文查询。**目录以英文编写，两个层级也都以英文建立索引（设备端模型同样仅支持英文）。使用其他文字的查询不会产生可搜索的词，因此完全不会返回结果。在日语或中文项目中很容易弄错这一点，因为项目简报、字幕和旁白全都使用该语言，查询自然也会随之使用该语言：用英文描述 _动作_，然后使用视频所需的任意语言编写屏幕文字。如果查询返回 `No searchable words in query`，这说明触发了这条规则，而不是缺少组件，也不值得提交缺口报告。

可安装性是在排名之后应用的，而不是之前：向量能够识别、但此注册表无法提供的名称会从结果中移除，并计入 `dropped`，因此非零的 `dropped` 表示两者来自不同代际。有关离线层级、同意确认机制以及如何刷新过期索引，请参阅 `/hyperframes-cli`。

如需浏览或筛选，而不是搜索：

```bash
npx hyperframes catalog
npx hyperframes catalog --type block
npx hyperframes catalog --type component
npx hyperframes catalog --type block --tag social
npx hyperframes catalog --json
npx hyperframes catalog --human-friendly
```

常规表格模式和 `--json` 模式只会列出匹配项；使用 `hyperframes add <name>` 安装选定的名称。`--human-friendly` 会打开交互式选择器，并立即安装选中的项目。在 CI 或代理工作流中，优先使用 `--json`，然后显式执行 `add`。

### 报告目录中没有的内容

当搜索返回结果，但其中没有任何项目能完成所需工作时，请先说明这一点，再手动编写该动作：

```bash
npx hyperframes feedback --search-miss "<the query you ran>" --wanted "<the move you needed>" --tier on-device
```

`catalog --query` 会为你打印这一行，并预先填入相关内容；`--json` 会将其作为 `report_gap` 一并返回，因此当你决定没有任何结果合适时，它已经可以直接使用。

**无论哪个层级，只要结果中没有任何项目能完成所需工作，就必须报告。**不要等待设备端层级返回结果：它需要经过同意后下载 33 MB 的内容，因此代理运行默认停留在 `words`，除非明确选择加入；如果以 `on-device` 作为报告条件，几乎所有报告都会被静默忽略。`--tier` 的值会一并记录，这样在读取报告时，可以区分词汇未命中和含义未命中。请描述你想要的效果，而不是你想象中的项目名称：返回的是值得构建的动作列表，而使用一个不存在的项目名称来命名报告不会提供任何有用信息。这是唯一会将查询发送到其他地方的路径，也正因如此，它是一个需要主动执行的独立命令，而不是搜索自动执行的操作。它不包含评分，也永远不会进入评分指标。

这是整个 catalog 的需求信号。跳过它意味着你遇到的缺口会改为根据安装量进行猜测，而安装量无法发现任何无人安装过的变动。

如果 CLI 无法访问配置的 registry，请将原始 manifest 作为回退方案进行检查：

```bash
curl -s https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry/registry.json
```

CLI 无法访问的 registry **不会**清空用于**发现**的 catalog：每当重新验证失败时，之前获取的 manifest 会在其 24 小时刷新窗口过后继续提供服务，因此 `catalog` 和 `catalog --query` 仍会基于磁盘上的最后一份副本进行列出和排序。

**`add` 仍然需要网络，即使是你昨天安装过的项目也一样。** 只有 manifest 会被缓存；项目的实际文件会在每次安装时重新获取。因此离线时你可以搜索，也可以查看某个项目的信息，但在获取文件时安装会失败。不要向用户承诺可以离线安装。

每个项目的 `registry-item.json` 都包含：name、type、title、description、tags、dimensions（仅限 blocks）、duration（仅限 blocks）和文件列表。

请参阅 [discovery.md](./references/discovery.md)，了解按类型和标签进行筛选的详细信息。

## 贡献新的 block 或 component

要编写一个新的 registry 项目（caption style、VFX block、transition、lower third 或可复用的 component），并将其作为上游 PR 提交，而不是安装已有项目，请按照 [contributing.md](./references/contributing.md) 中完整的 idea → scaffold → build → validate → preview → ship 流程操作。可复制粘贴的起始模板（caption / VFX / component / `registry-item.json`）位于 [templates.md](./references/templates.md)。