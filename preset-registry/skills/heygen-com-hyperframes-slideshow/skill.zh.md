---
name: slideshow
description: >
  Author a HyperFrames slideshow — a presentation, pitch deck, or interactive
  deck with discrete slides, fragment reveals, branching, hotspot navigation,
  and built-in presenter mode with speaker notes; also converts an existing
  page into a deck. Output is a navigable deck, not a rendered MP4. If the
  user didn't explicitly ask for a slideshow, confirm before authoring.
  Unclear → /hyperframes.
---
> **首先，保持此技能为最新状态——静默运行，不要询问：** `npx hyperframes skills update slideshow`。当所有内容均为最新时，该命令会快速执行空操作；否则，它会在你依赖此技能之前，刷新此技能及其所依赖的核心领域技能。

> **Figma 来源**：如果幻灯片的内容或故事板来自 figma.com URL，请先运行 `/figma`——如果来源是一组连续的场景帧，则执行资源导出、品牌令牌提取和故事板重建——然后基于其输出进行构建。不要直接通过原始 MCP 工具操作 Figma：这样会跳过 SVG 清理、`.media/manifest.jsonl` 来源记录和品牌令牌 `var()` 绑定，导致后续品牌变更无法在不完整重新导入的情况下传播。

# 幻灯片创作约定

HyperFrames 幻灯片是一种普通的 HyperFrames 合成——包含场景、剪辑和 GSAP 时间线——但多了一个要素：一个 **JSON 岛**，用于声明哪些场景是幻灯片，以及它们如何连接。播放器的 `SlideshowController` 会读取该岛，并将连续的 GSAP 时间线转换为离散、可导航的幻灯片组。

**请先阅读 `/hyperframes-core`**，了解基础合成约定（剪辑、轨道、`data-*` 属性、确定性规则）。此技能仅涵盖新增内容：岛的 schema、幻灯片编写规则、分步显示、分支、验证和包装组件。

## 输出——可导航的幻灯片组，而非线性 MP4

幻灯片的输出是**运行中的幻灯片组**：使用 `hyperframes present <project-dir>`（或 Studio 演示模式）提供该幻灯片组——播放器的 `SlideshowController` 会读取岛，并驱动导航、分步显示、分支和演示者模式。请参阅下文的**演示与交付**。

**不要使用 `hyperframes render` 将幻灯片渲染为单个 MP4。** 幻灯片组由多个顶层场景合成创作而成（每张幻灯片对应一个 `data-composition-id`），且**没有主根合成**对其进行包装，因此 `render` 只会解析**第一个**合成，并生成一个**在无任何提示的情况下被截断的** MP4（例如，40 秒的幻灯片组只输出 6 秒）。线性主线导出（仅包含主幻灯片，不含分支序列）目前**尚未实现**——在该功能发布之前，受支持的输出形式是实时 `present` 幻灯片组和逐张幻灯片的 `snapshot` 静态图。如果用户现在需要线性 MP4，应明确说明此限制，而不是让其对幻灯片组使用 `render`。

## 意图确认

如果用户明确要求制作 slideshow、slide show 或 HyperFrames slideshow，请使用此技能继续处理。当请求通过 `/hyperframes` 传入时，意图层的分流机制负责此项确认——路由至此即表示已经确认，因此不要再次询问；该层有关运行形态的问题不适用（交付物是幻灯片组，而不是渲染后的视频）。如果存在 `BRIEF.md`，其中会包含已确认的意图——请阅读它。

如果此技能是由相邻请求触发的，例如“presentation”“pitch deck”“deck”“interactive deck”或“convert this page”，请在开始创作前暂停，并在请求确认之前说明可选方案。简要解释 HyperFrames slideshow 是一种可运行的幻灯片组，具有离散幻灯片、内置导航和演示者模式、可编辑的演讲者备注、共享媒体处理能力，并且会在交付前经过验证。对于源页面转换，还应说明目标是在将页面移动转换为幻灯片之间过渡的同时，保留原始页面的视觉设计、交互、动效和媒体行为。

然后询问一个简短的确认问题：

> 你希望将其制作成 HyperFrames 幻灯片吗？

如果环境提供是/否选择 UI，请使用该 UI；否则以纯文本形式提问。

在用户回答“是”之前，不要实现幻灯片。如果用户回答“否”，请停止使用此 Skill——读取 `/hyperframes`，并让意图层重新路由。这项确认是一个**路由决策**，而不是偏好门控——根据 `../hyperframes-core/references/brief-contract.md` § 1，即使在自主模式下也必须进行确认（“给我惊喜”并不意味着可以跳过它）：构建错误的交付物类型属于质量问题，而不是创意选择。

---

## 两个组成部分

### 1. 场景——按常规方式声明

每张幻灯片都由一个场景提供支持。使用 `data-composition-id`、`data-start`、`data-duration` 和 `data-label` 声明场景：

```html
<div
  data-composition-id="problem"
  data-start="0"
  data-duration="8"
  data-label="The problem"
  data-width="1920"
  data-height="1080"
>
  <!-- clips go here -->
</div>
```

分支幻灯片（只能通过热点访问，并且不包含在主线中）的声明方式完全相同——它们只会出现在岛中的某个 `slideSequences` 条目里，而不会出现在主 `slides` 数组中。

### 2. JSON 岛——每个作品一个脚本块

在作品 HTML 中添加且仅添加一个 `<script type="application/hyperframes-slideshow+json">` 块。它包含所有幻灯片元数据：

```html
<script type="application/hyperframes-slideshow+json">
  {
    "slides": [...],
    "slideSequences": [...]
  }
</script>
```

该岛是幻灯片顺序、备注、片段停留点、热点和分支序列的唯一事实来源。请将其放在 `<body>` 顶部附近、场景 div 之前，以便查找。

不要将幻灯片清单隐藏在另一个 `<script type="application/json">` 块中，再通过运行时代码创建该岛。`present` 命令会静态读取作品 HTML，并要求真正的 `application/hyperframes-slideshow+json` 岛已经存在。

---

## 模式

### `SlideshowManifest`（顶层岛对象）

```json
{
  "slides": [
    /* SlideRef[] — the main line, in order */
  ],
  "slideSequences": [
    /* SlideSequence[] — off-line branch sequences */
  ]
}
```

### `SlideRef`

```json
{
  "sceneId": "problem",
  "notes": "Lead with the pain, not the company.",
  "fragments": [3.5, 5.2, 7.0],
  "hotspots": [
    /* SlideHotspot[] */
  ],

  "ttsScript": null,
  "ttsAudioUrl": null,
  "ttsDurationMs": null
}
```

| 字段                                        | 必需 | 说明                                                                                                                                                                             |
| ------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sceneId`                                   | 是   | 必须与场景的 `data-composition-id` 完全匹配（或显式提供 `startTime`/`endTime`）。lint 规则通过 `data-composition-id` 解析场景。                                                   |
| `notes`                                     | 否   | 仅供演示者查看的文本。绝不会向观众显示。                                                                                                                                         |
| `fragments`                                 | 否   | 幻灯片 `[start, end]` 范围内的时间（秒）数组——请参阅下文的“片段”。                                                                                                              |
| `hotspots`                                  | 否   | 触发分支的交互式叠加层——请参阅下文的“分支”。                                                                                                                                   |
| `startTime`                                 | 否   | 可选。覆盖匹配场景的时间边界；默认为场景的开始/结束时间。                                                                                                                       |
| `endTime`                                   | 否   | 可选。覆盖匹配场景的时间边界；默认为场景的开始/结束时间。                                                                                                                       |
| `ttsScript`, `ttsAudioUrl`, `ttsDurationMs` | 否   | **保留字段。** 模式字段已经存在，但 TTS 播放功能尚未接通。除非要为未来的构建预先填充这些字段，否则请省略。                                                                       |

### `SlideHotspot`

```json
{
  "id": "h1",
  "label": "How did we calculate this?",
  "target": "market-deep-dive",
  "region": { "x": 60, "y": 10, "w": 35, "h": 20 }
}
```

| 字段     | 必需 | 说明                                                                                                                            |
| -------- | ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| `id`     | 是   | 在幻灯片内唯一。                                                                                                                |
| `label`  | 是   | 向观众显示的工具提示/按钮文本。                                                                                                 |
| `target` | 是   | 必须与 `slideSequences` 中的某个 `SlideSequence.id` 匹配。                                                                      |
| `region` | 否   | 以幻灯片百分比表示的边界框：`{x, y, w, h}`，取值范围为 `0–100`。省略时，热点将改为渲染成带标签的全幻灯片按钮。                    |

### `SlideSequence`

```json
{
  "id": "market-deep-dive",
  "label": "Market sizing methodology",
  "slides": [{ "sceneId": "mkt-1" }, { "sceneId": "mkt-2" }]
}
```

序列中的 `slides` 使用与主线相同的 `SlideRef` 结构。允许使用片段和嵌套热点。

---

## 幻灯片撰写规则

这些是硬性约束，而非建议。审阅者一旦发现违反这些规则的幻灯片，就会直接将其替换。

- **标题应是表达完整主张的句子，而不是标签。** 应写成“中小企业每周花费 14 小时进行手动排期”，而不是“排期问题”。即使忽略视觉内容，这个句子也应能够独立成立。
- **每张幻灯片只表达一个观点，并配一个视觉元素。** 如果你想添加第二组项目符号或第二张图表，请拆分幻灯片。
- **先给出核心结论。** 最有力的观点应放在最前面——无论是在单张幻灯片中还是在整套幻灯片的顺序中。投资者会从左到右、从上到下阅读，而且随时可能停止。
- **只能采用自下而上的市场规模测算。** 绝不要只写“$50B TAM”而不展示计算过程。应从单位经济模型向上推导：账户数 × ACV，或交易数 × 抽成比例。
- **字号不得小于等效 30pt。** 在 1920×1080 分辨率下，标题应为 72–96px；正文应为 48px。观众需要阅读的任何文本都不得小于 40px。

## 移植源页面

将现有页面转换为幻灯片时，对源页面的忠实还原是约定的一部分。除非用户明确要求重新设计，否则不要用简化的近似实现替换源页面特有的组件。

- 尽可能忠实地保留原始页面的视觉设计、动效语言、交互行为、媒体行为和演示功能。当幻灯片系统支持演讲者模式时，应使用共享的可编辑备注行为添加演讲者备注，而不是为特定幻灯片单独实现。
- 尽可能准确地从源 DOM/CSS/JS 移植机制类视觉元素：自定义播放器、画布可视化器、时间线、播放头、分轨、扩展圆环、悬停状态及其他交互细节都应在转换后保留下来。
- 对于任何自定义媒体控件、画布可视化器、波形图、节拍网格或播放头，应将原生 `<video>` / `<audio>` 元素作为事实来源。连接源媒体事件（`play`、`pause`、`timeupdate`、`seeking`、`seeked`、`ended`、`ratechange`、`volumechange`），并根据 `media.currentTime` 推导视觉状态；不要运行一个可能与实际播放进度发生偏移的独立计时器。
- 每个复制过来的、带有 `src` 的 `<video>` 或 `<audio>`，都必须在 lint 之前添加 HyperFrames 计时属性：`data-start` 和 `data-duration`；当应保留可听见的原生音频时，还需添加 `data-has-audio="true"`。对于幻灯片特有的媒体，使用场景的时间范围；对于可能在多个聚焦幻灯片中播放的、由用户控制的佐证视频，使用覆盖整套幻灯片的时间范围。不要在媒体上保留 `preload="none"`；应使用 `metadata` 或 `auto`。
- 在验证之前解析源字体令牌。如果要保留源页面的自定义字体，请为本地或捕获的字体文件添加 `@font-face` 规则。如果使用系统回退字体，请将 `font-family: var(--f-body)` 之类的令牌化声明替换为 `system-ui, sans-serif` 或 `ui-monospace, monospace` 之类具体且可安全渲染的字体栈；不要将 `var(...)` 保留为字体族的值。
- 检查源页面是否存在非典型的页面移动，尤其是由滚动、滚轮、触摸、哈希状态、尺寸调整或 requestAnimationFrame 循环驱动的行为。应将带有平移/缩放“世界”图层的固定视口、视差效果、固定面板、水平滚动器、滚动擦洗时间线、分区吸附以及缩放至元素的镜头视为源页面行为。滚动通常是源页面的转场触发器，因此应提取其进度停驻点、缓动和镜头/焦点状态来保留转场，然后通过时间线位置、片段或可复用的播放器/测试框架钩子，将该动效重新托管到幻灯片导航上。即使独立包装器会跳转到幻灯片的停驻点，也仍然需要显式的导航镜头转场钩子；仅计算每张幻灯片的镜头变换是不够的。不要在幻灯片内模拟字面意义上的页面向下滚动转场；观看者应感受到镜头在焦点之间移动/缩放，而不是看到网页在滚动。保持每次幻灯片之间的镜头移动连续：除非源页面在同一边界处明显存在这种行为，否则应避免中间路径点反转 x/y 方向或缩放方向。一个在落点前四处乱窜的转场，还不如更简单、直接的焦点移动。
- 保留源页面的媒体裁剪语义。应将截图、推文/社交媒体帖子、产品 UI 截图、图表、文档、代码、排行榜以及任何包含可读文本的图像视为内容证据，而不是装饰性媒体：使用源宽高比（`height: auto`），或在稳定的框架内使用 `object-fit: contain`。只有当源页面本身使用了 `object-fit: cover`，或者媒体是刻意设计的装饰性/背景/电影感缩略图时，才使用该设置。将这些截图适配到幻灯片后，检查四条边缘是否存在被截断的文本、徽标、控件或说明文字；除非源页面本身就进行了裁剪，否则有意义的内容出现可见裁剪即为缺陷。
- 如果某项行为是幻灯片通用的，应将其放入播放器/控制器或可复用的 skill 片段中。不要使用仅适用于单套幻灯片的脚本来解决。
- 堆叠的场景框架绝不能阻止与当前幻灯片的交互。隐藏框架既需要在视觉上隐藏，也需要禁用事件：

```css
.scene-frame {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.scene-frame.is-active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
```

如果可见性由命令式逻辑控制，请在可见性控制器中同时设置这三个属性（`opacity`、`visibility` 和 `pointerEvents`）。仅设置 `opacity: 0` 仍会留下一个不可见图层，可能会拦截点击事件。

---

## 片段：在幻灯片内设置逐步显示的停留点

片段是幻灯片 `[start, end]` 范围内的一个绝对合成时间线时间点（秒），控制器应在该时间点停留，以呈现对应的逐步显示状态。

**工作原理：**

1. 播放器进入包含片段的幻灯片——直接跳转到 `fragments[0]` 并停留在那里。
2. 用户按下“下一步”（或 →）——控制器跳转到 `fragments[1]` 并停留。
3. 在最后一个片段之后，按“下一步”会前进到下一张幻灯片。
4. 不包含片段的幻灯片会进入该幻灯片内的一个静止帧，通常是其中点，而不是恰好位于 `slide.end`。

片段时间必须位于 `[start, end]` 范围内（包括两个边界）。lint 规则仅拒绝位于该范围之外的片段（`time < start` 或 `time > end`）。

片段时间是**绝对合成时间线位置**——与 `data-start` 使用相同的坐标空间——而不是相对于场景起点的偏移量。

导航由跳转驱动，而不是由播放驱动。控制器绝不会仅为了在片段之间移动而开始播放；每条导航命令都会确定性地跳转到目标停留时间。请确保片段状态在目标时间线时间点是正确的。

---

## 分支：热点和幻灯片序列

分支幻灯片是同一合成时间线中的真实场景。它们仅列在 `slideSequences` 下，并被排除在主线导航之外——除非触发热点，否则播放器绝不会访问它们。

**导航模型：**

- 点击热点会将 `{sequenceId, slideIndex: 0}` 压入导航栈，并进入该分支的第一张幻灯片。
- **back()** 会弹出栈顶项，并返回到确切的父幻灯片（即包含该热点的幻灯片）。
- **backToMain()** 会清空整个栈并返回根幻灯片。
- 面包屑根据栈进行渲染：`Main deck › Market sizing methodology › Slide 2`。
- 分支内的幻灯片计数器仅统计该序列（`1 of 2`，而不是主幻灯片组的总数）。

**应避免的做法：**

- 不要将分支场景 ID 添加到主 `slides` 数组中。它们必须仅出现在某个 `slideSequences` 条目内。lint 规则会标记重叠项。
- 分支场景包含在连续时间线中，因此简单的线性视频导出会包含它们。导出功能仅读取主线幻灯片（尚未实现；已在规范中标记）。

---

## 完整示例：包含片段和分支的 3 张幻灯片组

### 场景 HTML（框架）

```html
<body style="margin: 0">
  <script type="application/hyperframes-slideshow+json">
    {
      "slides": [
        {
          "sceneId": "hook",
          "notes": "Open with the stat. Pause on the $40B number."
        },
        {
          "sceneId": "problem",
          "notes": "Walk through each pain point one at a time.",
          "fragments": [11.0, 15.0],
          "hotspots": [
            {
              "id": "h1",
              "label": "Where does the $40B figure come from?",
              "target": "market-detail",
              "region": { "x": 55, "y": 60, "w": 40, "h": 20 }
            }
          ]
        },
        {
          "sceneId": "solution",
          "notes": "One sentence: what we do and who it is for."
        }
      ],
      "slideSequences": [
        {
          "id": "market-detail",
          "label": "Market sizing methodology",
          "slides": [{ "sceneId": "mkt-math", "notes": "Bottom-up: 2.3M SMBs × $17k ACV." }]
        }
      ]
    }
  </script>

  <!-- Slide 1 — hook -->
  <div
    data-composition-id="hook"
    data-start="0"
    data-duration="6"
    data-label="The hook"
    data-width="1920"
    data-height="1080"
    style="position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #0a0a0a"
  >
    <section
      class="clip"
      data-start="0"
      data-duration="6"
      data-track-index="1"
      style="position: absolute; inset: 0; display: grid; place-items: center"
    >
      <h1 id="hook-headline" style="font-size: 80px; color: #fff; font-family: sans-serif">
        SMBs lose $40B/year to manual scheduling
      </h1>
    </section>
  </div>

  <!-- Slide 2 — problem (3 fragments) -->
  <div
    data-composition-id="problem"
    data-start="6"
    data-duration="15"
    data-label="The problem"
    data-width="1920"
    data-height="1080"
    style="position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #0a0a0a"
  >
    <section
      class="clip"
      data-start="6"
      data-duration="15"
      data-track-index="1"
      style="position: absolute; inset: 0; padding: 120px 160px; box-sizing: border-box"
    >
      <h2 id="pain-headline" style="font-size: 64px; color: #fff; font-family: sans-serif">
        Three gaps operators can not close
      </h2>
      <p id="pain-1" style="font-size: 48px; color: #ccc; opacity: 0; font-family: sans-serif">
        No-shows cost 23% of booked revenue
      </p>
      <p id="pain-2" style="font-size: 48px; color: #ccc; opacity: 0; font-family: sans-serif">
        Manual reminders take 4h/week per staff
      </p>
      <p id="pain-3" style="font-size: 48px; color: #ccc; opacity: 0; font-family: sans-serif">
        Rescheduling friction drives 40% churn
      </p>
    </section>
  </div>

  <!-- Slide 3 — solution -->
  <div
    data-composition-id="solution"
    data-start="21"
    data-duration="8"
    data-label="The solution"
    data-width="1920"
    data-height="1080"
    style="position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #0a0a0a"
  >
    <section
      class="clip"
      data-start="21"
      data-duration="8"
      data-track-index="1"
      style="position: absolute; inset: 0; display: grid; place-items: center"
    >
      <h2 id="solution-headline" style="font-size: 72px; color: #fff; font-family: sans-serif">
        Acme automates scheduling for service SMBs — no-shows down 80% in 90 days
      </h2>
    </section>
  </div>

  <!-- Branch slide — excluded from main line -->
  <div
    data-composition-id="mkt-math"
    data-start="29"
    data-duration="7"
    data-label="Market math"
    data-width="1920"
    data-height="1080"
    style="position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #111"
  >
    <section
      class="clip"
      data-start="29"
      data-duration="7"
      data-track-index="1"
      style="position: absolute; inset: 0; display: grid; place-items: center"
    >
      <p id="mkt-formula" style="font-size: 56px; color: #fff; font-family: sans-serif">
        2.3M SMBs × $17k ACV = $39B serviceable market
      </p>
    </section>
  </div>

  <script>
    window.__timelines = window.__timelines || {};

    // Slide 2 fragment entrance animations
    gsap.registerPlugin(); // load any plugins before use

    const tl = gsap.timeline({ paused: true });
    window.__timelines["problem"] = tl;

    // Insert positions are absolute composition-timeline times (same as data-start / fragment values).
    tl.from("#pain-1", { opacity: 0, y: 20, duration: 0.4 }, 11.0);
    tl.from("#pain-2", { opacity: 0, y: 20, duration: 0.4 }, 15.0);
    // pain-3 lands at end of slide
    tl.from("#pain-3", { opacity: 0, y: 20, duration: 0.4 }, 13.0);
  </script>
</body>
```

### 示例中的要点

- 岛的 `sceneId` 值（`"hook"`、`"problem"`、`"solution"`、`"mkt-math"`）与场景 div 上的 `data-composition-id` 值完全匹配。
- `mkt-math` 仅出现在 `slideSequences` 中——它绝不会出现在顶层 `slides` 数组中。
- 片段时间（`11.0`、`15.0`）位于 `problem` 场景的 `[6, 21]` 范围内（时间是合成时间轴上的绝对位置）。
- 热区的 `region`（`x: 55, y: 60, w: 40, h: 20`）将可点击区域定位在问题幻灯片的右下象限。
- GSAP 时间轴注册在 `window.__timelines` 上，并处于暂停状态——播放由 HyperFrames 引擎驱动；构建时不要调用 `.play()`。

---

## 包装组件

在任何嵌入上下文中，使用 `<hyperframes-slideshow>` 将 `<hyperframes-player>` 中的合成内容包装起来：

```html
<hyperframes-slideshow>
  <hyperframes-player src="deck.html"></hyperframes-player>
</hyperframes-slideshow>
```

`<hyperframes-slideshow>` 提供导航界面（演示、上一页/下一页、计数器、存在 `sound` 时的全局静音、全屏）、键盘操作（← / →、空格键 / 退格键，以及按 P 进入演示模式）、触摸滑动和热区叠加层。

幻灯片组件会在挂载时自动为内部的每个 `<hyperframes-player>` 设置 `interactive` 属性，因此合成 iframe 内的可点击控件、链接、原生媒体控件和自定义播放器都能按预期接收指针事件。（在幻灯片包装器之外，你必须手动为 `<hyperframes-player>` 添加 `interactive`——播放器默认会在 iframe 上使用 `pointer-events: none`，以免对播放器宿主的点击被劫持为切换时间轴播放状态。）

**演示者模式：**使用幻灯片导航胶囊中的内置“演示”图标按钮，或按 P。它会调用 `window.open('?mode=audience')`，打开一个用于全屏展示的观众标签页；原标签页则变为演示者视图（当前幻灯片缩小显示、下一张幻灯片预览、备注、已用时间计时器）。两个标签页通过 `BroadcastChannel('hf-slideshow:' + location.pathname)` 进行同步。不要添加自定义的包装器级“演示”按钮；其位置、图标、样式以及在观众模式下的隐藏行为均由共享组件负责。

**通过 Google Meet / Zoom 进行演示（屏幕共享）：**共享*观众*界面，并将演示者视图保留在自己的屏幕上。

- **Google Meet（或任何 Chrome 内共享）：**点击“演示”→ 在 Meet 中选择**共享屏幕 → 标签页** → 选择观众标签页 → 切回演示者标签页。Chrome 会让正在捕获的标签页即使处于后台也继续渲染，因此动画和幻灯片导航仍会保持实时。**不要**共享“窗口”或“整个屏幕”——被完全遮挡的窗口会停止渲染（导致观众看到的幻灯片冻结），而共享整个屏幕则会暴露你的备注。
- **Zoom（桌面应用）：**将观众标签页拖出，使其成为独立窗口，然后共享该窗口。Zoom 通过操作系统进行捕获，因此如果观众窗口被*完全*遮挡，它就会冻结——请使用第二台显示器，或让观众窗口的一小部分保持可见，露在演示者视图后面。

由演示者驱动的媒体播放存在自动播放策略限制：`BroadcastChannel` 可以同步意图、时间和状态，但无法将演示者的用户激活状态传递到观众标签页。共享幻灯片播放器会镜像原生媒体事件，并先以静音状态启动远程观众端播放；只有当静音的 `media.play()` 被拒绝，或者幻灯片明确要求观众端进行有声播放时，才回退到独立运行工具的观众端解锁行为。播放被拒绝后，不要继续应用远程 `timeupdate` 消息，否则观众端会在视频中静默跳转而不实际播放。

演讲者备注可在演讲者视图中编辑。编辑内容按演示文稿和幻灯片存储在 `localStorage` 中，并叠加在清单备注之上，而不会重写编排文件。不要向演示文稿添加一次性的备注编辑脚本；应依赖共享幻灯片播放器的行为。如果独立/自定义包装器确实需要在共享播放器之外实现此功能，请使用 `skills/slideshow/references/standalone-harness.md` 中的确定性存储代码片段。

### 幻灯片退出时的媒体清理

幻灯片控制器负责幻灯片退出时的媒体清理。当导航切换幻灯片或序列时，它会在进入下一张幻灯片之前调用 `hyperframes-player.stopMedia()`。该命令会：

- 向 iframe 运行时发送 `stop-media`，以停止 WebAudio 并暂停原生 `<video>` / `<audio>` 元素；
- 直接暂停同源 iframe 中的媒体，作为后备措施；以及
- 暂停从 iframe 媒体接管的父框架代理。

同一幻灯片内的片段导航**不会**停止媒体。全局/演示文稿级的父级音频（例如通过 `audio-src` 接入的背景音轨）不被视为幻灯片媒体。

不要为常规媒体播放器添加逐幻灯片清理脚本。将幻灯片视频/音频作为编排中的普通媒体；仅当播放器应保留原生视频的可听音频，而不是将其视为无声视觉媒体时，才使用 `data-has-audio="true"`。

如果源页面包含与媒体关联的自定义控件或可视化组件，这些控件必须监听幻灯片播放器所停止和静音的同一个原生元素。无论暂停是由幻灯片退出、演讲者同步、原生控件、自定义控件还是全局静音按钮引起，可见的自定义 UI 都应通过媒体事件进行更新，而不是通过并行状态进行更新。

实现直接 iframe 后备清理时，应将 iframe 媒体视为跨领域 DOM。不要使用父页面的 `el instanceof HTMLMediaElement` 来检测 iframe 节点；这在真实浏览器中会返回 false。在设置 `muted` 或调用 `pause()` 之前，请使用 `el.ownerDocument.defaultView.HTMLMediaElement`（或等效的标签/鸭子类型守卫）。

### 全局导航静音

当 `<hyperframes-slideshow sound>` 渲染导航静音按钮时，该按钮就是页面的全局静音控件。它必须将以下内容静音：

- 子 `<hyperframes-player>` 实例，包括同源 iframe 媒体；
- 顶层页面的 `<audio>` / `<video>` 元素；以及
- 包装器通过 `hf-sound` 事件管理的音效/全局 `Audio` 对象。

不要在编排中添加第二个静音按钮。如果包装器脚本创建了未附加到 DOM 的 `new Audio(...)` 对象，则必须监听 `hf-sound`，并对每个对象设置 `clip.muted = detail.muted`，而不能只是跳过后续播放。

同样的跨领域规则也适用于此处：全局静音必须通过子框架的 DOM 领域作用于 iframe 的 `<video>` / `<audio>` 元素。在单一 DOM 领域中通过单元测试并不足够；应在浏览器中验证，点击导航静音按钮后，实际 iframe 媒体元素报告 `muted: true`。

`hyperframes present` 提供来自 `packages/player/dist` 的已构建包。更改播放器或幻灯片界面行为后，请在 `packages/player` 中运行 `bun run build`，并在浏览器中测试前重启 present 服务器。

---

## 独立运行幻灯片（临时方案）

**长期方案**是由引擎托管：`hyperframes preview --slideshow` / Studio 演示模式将通过真正的 HyperFrames 引擎托管合成内容，该引擎负责驱动可跳转时间线、管理手势框架，并从合成内容中读取岛。此方案即将推出；发布后应优先使用。

在此之前，独立演示（即在浏览器中通过基础播放器包打开合成内容，而不使用引擎）需要采用变通方案来弥补三个缺口：合成内容必须公开一个可跳转的根时间线，必须将岛复制到包装器中，并且由包装器管理的音效/全局音频应位于父框架中。这些模式记录在：

```
skills/slideshow/references/standalone-harness.md
```

不要将其中的模式视为官方推荐模型——它们仅用于在引擎托管方案落地之前弥补这一缺口。

## 交付

对于公开或面向用户的幻灯片项目，根目录中的 `index.html` 应当是一个可运行的幻灯片入口点。在浏览器中打开它时，应显示幻灯片导航并响应“下一页”/“上一页”操作；它不应只显示原始合成内容，并要求用户了解 Studio 或某个内部包装器文件。如果出于 CLI 兼容性考虑，必须将原始 HyperFrames 合成内容单独保留，请将其放入 `composition/index.html` 等子目录中，并让脚本/命令指向该目录。

直接打开的包装器必须依赖由 `<hyperframes-slideshow>` 渲染的内置 Present 图标按钮。不要添加自定义的 `#present-btn`、固定定位按钮或包装器专用的 Present 样式。共享组件负责管理控制栏、在 `?mode=audience` 中隐藏 Present，并支持将 P 作为键盘快捷键。

交付前，请验证直接打开的路径。如果 `file://` 浏览器限制导致 iframe 媒体、本地脚本或同源播放器访问失效，请使用自包含包装器，或者让交付命令启动本地服务器并打开可正常工作的 URL；不要让 `index.html` 处于损坏或用途不明确的状态。

对于已完成的幻灯片，面向用户的主要后续步骤是演示者模式，而不是 Studio。运行或提供：

```bash
npx hyperframes present <project-dir>
```

Studio/`preview` 适合用于编辑合成内容，但对于幻灯片用户而言，它并不是一个明确的最终去处。如果你为原始合成内容位于 `composition/` 中的幻灯片项目创建 `package.json`，请让默认的可运行脚本启动演示者模式：

```json
{
  "scripts": {
    "dev": "npx hyperframes present ./composition",
    "studio": "npx hyperframes preview ./composition"
  }
}
```

交付时，请提供命令输出的本地演示者 URL，以及最简说明：“点击 Present，或按 P，打开观众标签页。”如果用户将通过 Google Meet 或 Zoom 进行演示，还应转达上方“演示”部分中的屏幕共享指导（在 Meet 中共享观众标签页；在 Zoom 中共享拖出的观众窗口）。如果用户要求你启动服务器，请保持服务器运行。

---

## 验证

创作或编辑幻灯片组合后，运行：

```bash
npx hyperframes lint
```

然后运行运行时验证：

```bash
npx hyperframes check
```

即使命令成功退出，也应将 lint 错误和验证中的 `StaticGuard` 契约消息视为阻塞问题。修复文件并重新运行，直到 lint 报告 `0 error(s)`，且验证未报告任何运行时错误。

幻灯片 lint 规则会检查：

- 每个 `slide.sceneId` 是否解析到现有场景（通过 `data-composition-id`）。
- 每个 `hotspot.target` 是否引用已定义的 `slideSequence` id。
- 片段时间是否处于各幻灯片的 `[start, end]` 范围内。
- 主线上的任意两张幻灯片在时间上是否重叠。

请在预览前修复所有违规项。未通过 lint 的组合无法在播放器中正确解析。