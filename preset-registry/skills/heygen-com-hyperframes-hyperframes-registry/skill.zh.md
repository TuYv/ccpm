---
name: hyperframes-registry
description: Install, discover, and wire registry blocks and components into HyperFrames compositions. Use when running hyperframes add or hyperframes catalog, installing one item or every block matching a tag, wiring an installed item into index.html, or working with hyperframes.json. Covers discovery, install locations, block sub-composition wiring, component snippet merging, and authoring a new block or component to contribute upstream (idea → scaffold → validate → PR).
---
# HyperFrames 注册表

注册表提供可通过 `hyperframes add <name>` 安装的可复用区块和组件。

- **区块** — 独立的子合成（拥有自己的尺寸、时长和时间轴）。通过宿主合成中的 `data-composition-src` 引入。
- **组件** — 效果代码片段（没有自己的尺寸）。直接粘贴到宿主合成的 HTML 中。

## 快速参考

```bash
hyperframes add data-chart              # install a block
hyperframes add grain-overlay           # install a component
hyperframes add captions                # install every block tagged captions
hyperframes add shimmer-sweep --dir .   # target a specific project
hyperframes add data-chart --json       # machine-readable output
hyperframes add data-chart --no-clipboard  # skip clipboard (CI/headless)
```

安装后，CLI 会输出写入了哪些文件，以及一个可粘贴到宿主合成中的代码片段。该片段只是一个起点 — 在接入区块时，你需要添加 `data-composition-id`（必须与区块内部的合成 ID 匹配）、`data-start` 和 `data-track-index` 属性。

系统会先尝试将位置参数值解析为完全匹配的项目名称。如果没有匹配的项目且该值是一个标签，则命令会安装带有该标签的所有区块。注册表依赖项会先于所请求的项目安装。`hyperframes add` 仅适用于区块和组件；对于示例，请改用 `hyperframes init <dir> --example <name>`。

## 安装位置

默认情况下，区块安装到 `compositions/<name>.html`。组件默认安装到 `compositions/components/<name>.html`。

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

区块是独立的合成 — 请在宿主 `index.html` 中通过 `data-composition-src` 引入它们：

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
- `data-composition-id` — 必须与区块内部的 ID 匹配
- `data-start` — 区块在宿主时间轴中出现的时间（秒）
- `data-duration` — 区块播放的时长
- `data-width` / `data-height` — 区块画布尺寸
- `data-track-index` — 图层顺序（值越高越靠前）

完整详情请参阅 [wiring-blocks.md](./references/wiring-blocks.md)。

## 接入组件

组件是代码片段 — 将其 HTML 粘贴到合成的标记中，将其 CSS 粘贴到样式块中，并将其 JS 粘贴到脚本中（如有）：

1. 读取已安装的文件（例如 `compositions/components/grain-overlay.html`）
2. 将 HTML 元素复制到合成的 `<div data-composition-id="...">` 中
3. 将 `<style>` 块复制到合成的样式中
4. 将所有 `<script>` 内容复制到合成的脚本中（放在时间轴代码之前）
5. 如果组件提供 GSAP 时间轴集成（请参阅代码片段中的注释块），请将这些调用添加到你的时间轴中

完整细节请参阅 [wiring-components.md](./references/wiring-components.md)。

## 发现

将 CLI 作为主要的发现入口。**先按意图搜索，再进行浏览：**注册表中的条目数量多到无法逐一查看，因此先列出条目，再按名称或标签进行匹配是一种低效方式；只要作者使用的措辞与你不同，这种方式就会失效。

```bash
# Rank the whole catalog against what the beat should do
npx hyperframes catalog --query "reveal a headline one line at a time"
npx hyperframes add caption-clip-wipe
```

搜索在本地进行，不会发送任何内容。默认情况下，它会根据条目名称、标题和描述中与你的查询共有的词汇进行排序，因此只能找到复用了你所用词语的条目；`--on-device` 则会按语义排序，但首次使用前需要下载一次模型。使用 `--json` 时，返回数据会标明由哪个层级给出结果，因此请检查该字段，而不要想当然地认为已经执行了排序。

可安装性是在排序后应用的，而不是在排序前：如果向量中包含某个名称，但当前注册表无法提供该条目，它就会从结果中被移除，并计入 `dropped`，因此 `dropped` 非零意味着二者属于不同代际。有关离线层级、同意门控以及如何刷新过期索引的信息，请参阅 `/hyperframes-cli`。

如需浏览或筛选而非搜索：

```bash
npx hyperframes catalog
npx hyperframes catalog --type block
npx hyperframes catalog --type component
npx hyperframes catalog --type block --tag social
npx hyperframes catalog --json
npx hyperframes catalog --human-friendly
```

普通表格模式和 `--json` 模式只会列出匹配项；请使用 `hyperframes add <name>` 安装选定的名称。`--human-friendly` 会打开交互式选择器，并立即安装所选条目。在 CI 或智能体工作流中，建议使用 `--json`，然后显式执行 `add`。

### 报告目录中缺少的内容

当搜索返回结果，但其中没有任何内容能完成所需工作时，请在手动编写该动效之前进行报告：

```bash
npx hyperframes feedback --search-miss "<the query you ran>" --wanted "<the move you needed>" --tier on-device
```

`catalog --query` 会为你输出这条已预填充的命令，而 `--json` 会将其放在 `report_gap` 中——因此，当你判定没有合适结果时，它已经触手可及。

**无论使用哪个层级，只要结果中没有任何内容能完成所需工作，就要进行报告。** 不要等待设备端层级返回结果：它需要在用户同意后下载 33 MB 的内容，因此智能体运行时默认使用 `words`，除非明确选择启用设备端层级；如果将报告条件限定为 `on-device`，几乎所有报告都会被阻断。`--tier` 值会随报告一同发送，因此读取这些报告时，仍可区分词汇匹配遗漏与语义匹配遗漏。请描述你想要的效果，而不是你设想的条目名称：最终得到的是一份值得构建的动效清单，而报告一个不存在的条目名称无法提供任何有用信息。这是唯一会将查询发送到其他地方的路径，也正因如此，它是一个独立且需要主动执行的命令，而不是由搜索自行完成的操作。它不包含评分，也绝不会计入评分指标。

这是目录的全部需求信号。跳过此步骤意味着只能根据安装次数来猜测你遇到的缺口，而安装次数无法反映那些无人能够安装的动效。

如果 CLI 无法访问已配置的注册表，请检查原始清单作为备用方案：

```bash
curl -s https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry/registry.json
```

CLI 无法访问注册表并**不会**导致用于**发现**的目录变为空：如果重新验证失败，之前获取的清单即使超过了 24 小时刷新期限，也会继续提供服务，因此 `catalog` 和 `catalog --query` 仍会基于磁盘上的最后一个副本进行列出和排序。

**`add` 仍然需要网络，即使要添加的是你昨天安装过的项目。** 只有清单会被缓存；每次安装时都会重新获取该项目的实际文件。因此，离线时你可以进行搜索，也可以查看项目的相关信息，但安装会在获取文件时失败。不要向用户承诺可以离线安装。

每个项目的 `registry-item.json` 都包含：name、type、title、description、tags、dimensions（仅限 blocks）、duration（仅限 blocks）和文件列表。

有关按 type 和 tags 进行筛选的详细信息，请参阅 [discovery.md](./references/discovery.md)。

## 贡献新的 block 或 component

要创作一个新的注册表项目（caption style、VFX block、transition、lower third 或 reusable component）并以向上游提交 PR 的方式发布，而不是安装现有项目，请遵循 [contributing.md](./references/contributing.md) 中完整的构思 → 搭建脚手架 → 构建 → 验证 → 预览 → 发布工作流。可复制粘贴的入门模板（caption / VFX / component / `registry-item.json`）位于 [templates.md](./references/templates.md)。