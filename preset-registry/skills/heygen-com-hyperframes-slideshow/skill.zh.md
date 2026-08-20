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
> **首先，保持此技能为最新状态——静默运行，不要询问：** `npx hyperframes skills update slideshow`。当一切均为最新版本时会快速无操作；否则，它会在你依赖此技能之前刷新此技能及其所依赖的核心领域技能。

> **figma 源**：如果演示文稿的内容或故事板来自 figma.com URL，请先运行 `/figma`——导出资源、品牌令牌，以及（如果源是场景帧条）重建故事板——然后基于其输出进行构建。不要直接通过原始 MCP 工具操作 Figma：这样会跳过 SVG 清理、`.media/manifest.jsonl` 溯源以及品牌令牌 `var()` 绑定，因此后续品牌变更将无法传播，除非进行完整重新导入。

# 幻灯片编写约定

HyperFrames 幻灯片是一个常规的 HyperFrames 合成——场景、片段、GSAP 时间线——外加一种额外要素：一个用于声明哪些场景是幻灯片及其连接方式的 **JSON 岛**。播放器的 `SlideshowController` 会读取该岛，并将连续的 GSAP 时间线转换为可离散导航的演示文稿。

**请先阅读 `/hyperframes-core`**，了解基础合成约定（片段、轨道、`data-*` 属性、确定性规则）。此技能仅涵盖新增内容：岛架构、幻灯片编写规则、片段、分支、验证以及包装组件。

## 输出——可导航的演示文稿，而非线性 MP4

幻灯片的输出是**运行中的演示文稿**：使用 `hyperframes present <project-dir>`（或 Studio 演示模式）提供服务——播放器的 `SlideshowController` 会读取该岛并驱动导航、片段、分支和演讲者模式。请参阅下方的**演示与交付**。

**不要将幻灯片通过 `hyperframes render` 渲染为单个 MP4。** 演示文稿由多个顶层场景合成编写而成（每张幻灯片一个 `data-composition-id`），且**没有主根合成**将它们包裹，因此 `render` 只会解析**第一个**合成，并输出一个**被静默截断的** MP4（例如，40 秒演示文稿只输出 6 秒）。线性主线导出（仅主幻灯片，不包含分支序列）**尚未实现**——在其发布之前，受支持的输出是实时 `present` 演示文稿和逐张幻灯片的 `snapshot` 静态图。如果用户当前需要线性 MP4，请说明此限制，而不要将 `render` 指向该演示文稿。

## 意图确认

如果用户明确要求幻灯片、slide show 或 HyperFrames 幻灯片，请继续使用此技能。当请求通过 `/hyperframes` 到达时，意图层的分类负责此确认——被路由到这里意味着已确认，因此不要再次询问；该层的运行形态问题不适用（交付物是演示文稿，而非渲染的视频）。如存在 `BRIEF.md`，其中包含已确认的意图——请阅读它。

如果技能由相邻请求触发，例如“presentation”、“pitch deck”、“deck”、“interactive deck”或“convert this page”，请在编写前暂停，并在请求确认前说明可选方案。简要说明 HyperFrames 幻灯片意味着一个可运行的演示文稿，具备离散幻灯片、内置导航和演讲者模式、可编辑的演讲者备注、共享媒体处理，以及交付前验证。对于源页面转换，还应说明目标是保留原始页面的视觉设计、交互、运动和媒体行为，同时将页面移动转换为幻灯片之间的过渡。

然后询问一个简短的确认问题：

> 您希望将此内容制作成 HyperFrames 幻灯片吗？

当环境提供是/否选择 UI 时，请使用它；否则，请用纯文本提出问题。

在用户回答“是”之前，不要实现该幻灯片。如果他们回答“否”，请停止使用此 skill——阅读 `/hyperframes` 并让意图层重新路由。此确认是一个**路由决策**，而非偏好门槛——根据 `../hyperframes-core/references/brief-contract.md` § 1，它在自主模式下依然有效（“给我一个惊喜”并不会跳过它）：构建错误的交付物类型属于质量失败，而非创意选择。

---

## 两个组成部分

### 1. 场景——以常规方式声明

每张幻灯片都由一个场景支撑。使用 `data-composition-id`、`data-start`、`data-duration` 和 `data-label` 声明场景：

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

分支幻灯片（只能通过热点访问，且不包含在主线中）以完全相同的方式声明——它们仅出现在 island 中的 `slideSequences` 条目里，而不在主 `slides` 数组中。

### 2. JSON island——每个 composition 一个脚本块

向 composition HTML 添加且仅添加一个 `<script type="application/hyperframes-slideshow+json">` 块。它包含全部幻灯片元数据：

```html
<script type="application/hyperframes-slideshow+json">
  {
    "slides": [...],
    "slideSequences": [...]
  }
</script>
```

该 island 是幻灯片顺序、备注、片段停留点、热点和分支序列的唯一事实来源。请将其放在 `<body>` 顶部附近、场景 div 之前，以便于查找。

不要将幻灯片 manifest 隐藏在备用的 `<script type="application/json">` 块及用于创建 island 的运行时代码之后。`present` 命令会静态读取 composition HTML，并期望真正的 `application/hyperframes-slideshow+json` island 已经存在。

---

## 架构

### `SlideshowManifest`（顶层 island 对象）

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

| 字段                                       | 必填 | 说明                                                                                                                                                   |
| ------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sceneId`                                   | 是   | 必须与场景的 `data-composition-id` 完全匹配（或提供显式的 `startTime`/`endTime`）。lint 规则通过 `data-composition-id` 解析场景。 |
| `notes`                                     | 否   | 仅供演讲者使用的文本。绝不会向观众显示。                                                                                                       |
| `fragments`                                 | 否   | 幻灯片 `[start, end]` 范围内的时间数组（单位：秒）——请参阅下方的 Fragments。                                                                 |
| `hotspots`                                  | 否   | 触发分支的交互式叠加层——请参阅下方的 Branching。                                                                                       |
| `startTime`                                 | 否   | 可选。覆盖匹配场景的时间边界；默认使用场景的开始/结束时间。                                                                  |
| `endTime`                                   | 否   | 可选。覆盖匹配场景的时间边界；默认使用场景的开始/结束时间。                                                                  |
| `ttsScript`, `ttsAudioUrl`, `ttsDurationMs` | 否   | **保留字段。** 架构字段已存在，但 TTS 播放尚未接入。除非您正为未来构建预先填充，否则请省略。                             |

### `SlideHotspot`

```json
{
  "id": "h1",
  "label": "How did we calculate this?",
  "target": "market-deep-dive",
  "region": { "x": 60, "y": 10, "w": 35, "h": 20 }
}
```

| 字段    | 必填     | 说明                                                                                                                           |
| -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `id`     | 是       | 在幻灯片内唯一。                                                                                                               |
| `label`  | 是       | 向观众显示的工具提示 / 按钮文本。                                                                                              |
| `target` | 是       | 必须与 `slideSequences` 中的某个 `SlideSequence.id` 匹配。                                                                     |
| `region` | 否       | 幻灯片百分比边界框：`{x, y, w, h}`，取值范围为 `0–100`。省略后，会将热点渲染为覆盖整张幻灯片的带标签按钮。                     |

### `SlideSequence`

```json
{
  "id": "market-deep-dive",
  "label": "Market sizing methodology",
  "slides": [{ "sceneId": "mkt-1" }, { "sceneId": "mkt-2" }]
}
```

序列内的 `slides` 使用与主线相同的 `SlideRef` 结构。允许使用片段和嵌套热点。

---

## 幻灯片编写规则

这些是硬性约束，而非建议。审核人员一旦发现违反这些规则的幻灯片，就会直接将其替换。

- **标题必须是完整句子的论断，而不是标签。** 写“SMBs spend 14 hours/week on manual scheduling”，而不是“Scheduling problem”。即使忽略视觉内容，该句子也应能独立成立。
- **每张幻灯片一个观点 + 一个视觉元素。** 如果你想添加第二组要点或第二张图表，请拆分为两张幻灯片。
- **以核心结论开场。** 最有力的观点应最先呈现——无论是在单张幻灯片中还是在整套演示文稿的顺序中。投资者从左到右、从上到下阅读，而且他们会停止阅读。
- **仅使用自下而上的市场规模测算。** 不要在未展示计算过程的情况下写“$50B TAM”。应从单位经济模型向上构建：账户数 × ACV，或交易量 × 抽成率。
- **最小字体为等效 30pt。** 在 1920×1080 下，标题为 72–96px；正文为 48px。观众必须阅读的任何文本都不得小于 40px。

## 移植源页面

将现有页面转换为幻灯片时，源内容保真度是约定的一部分。除非用户明确要求重新设计，否则不要用简化的近似实现替换源页面特有的小部件。

- 尽可能贴近地保留原页面的视觉设计、动效语言、交互行为、媒体行为和演示功能。当幻灯片系统支持演讲者模式时，应使用共享的可编辑备注行为添加演讲者备注，而不是采用演示文稿专属实现。
- 尽可能精确地移植源 DOM/CSS/JS 中的机械式视觉元素：自定义播放器、canvas 可视化器、时间线、播放头、音轨分层、扩展圆圈、悬停状态及其他交互细节都应在转换后保留。
- 将原生 `<video>` / `<audio>` 元素视为任何自定义媒体控件、canvas 可视化器、波形、节拍网格或播放头的唯一事实来源。连接源媒体的事件（`play`、`pause`、`timeupdate`、`seeking`、`seeked`、`ended`、`ratechange`、`volumechange`），并从 `media.currentTime` 推导视觉状态；不要运行可能偏离实际播放进度的独立计时器。
- 每个带有 `src` 的复制 `<video>` 或 `<audio>` 元素都必须在 lint 前具备 HyperFrames 时间属性：`data-start` 和 `data-duration`；当应保留可听见的原生音频时，还需具备 `data-has-audio="true"`。对于特定于幻灯片的媒体，使用场景的时间范围；对于可能从多个聚焦幻灯片播放、由用户控制的证据视频，使用整套演示文稿范围。不要在媒体上保留 `preload="none"`；应使用 `metadata` 或 `auto`。
- 在验证前解析源字体令牌。如果要保留自定义源字体，请为本地/捕获的字体文件添加 `@font-face` 规则。如果使用系统回退字体，请将诸如 `font-family: var(--f-body)` 的令牌化声明替换为具体的、渲染安全的字体栈，例如 `system-ui, sans-serif` 或 `ui-monospace, monospace`；不要将 `var(...)` 留作字体族值。
- 审查源页面中非典型的页面移动，尤其是由滚动、滚轮、触摸、hash 状态、窗口调整大小或 requestAnimationFrame 循环驱动的行为。将带有平移/缩放“世界”图层的固定视口、视差效果、固定面板、水平滚动器、滚动驱动时间线、区段吸附和缩放至元素的相机视为源行为。滚动往往是源页面的过渡触发器，因此应通过提取其进度节点、缓动和相机/焦点状态来保留这种过渡，然后通过时间线位置、片段或可复用播放器/工具钩子，在幻灯片导航中重新承载该动效。跳转至幻灯片停留点的独立包装器仍需要显式的导航-相机过渡钩子；仅计算每张幻灯片的相机变换是不够的。不要在幻灯片内模拟字面意义上的页面向下滚动过渡；观众应感受到相机从一个焦点移动/缩放至另一个焦点，而不是看到网页被滚动。保持每次幻灯片间的相机移动连续：避免中间路线停留点反转 x/y 方向或缩放，除非源页面确实在同一边界处如此表现。到达前四处乱窜的过渡，比更简单直接的焦点移动更糟糕。
- 保留源媒体的裁剪语义。将截图、推文/社交帖子、产品 UI 截图、图表、文档、代码、排行榜，以及任何含有可读文本的图像视为内容证据，而不是装饰性媒体：请使用源宽高比（`height: auto`），或在稳定框架内使用 `object-fit: contain`。仅当源内容本身如此处理时，或对于刻意作为装饰/背景/电影感缩略图的内容，才使用 `object-fit: cover`。将这些截图适配进幻灯片后，检查全部四条边缘是否存在被截断的文本、标志、控件或说明文字；除非源内容本身就有裁剪，否则有意义内容出现可见裁剪即为 bug。
- 如果某项行为对幻灯片而言是通用的，请将其放在播放器/控制器或可复用 skill 片段中。不要用一次性的演示文稿脚本解决。
- 堆叠的场景框架绝不得阻止活动幻灯片上的交互。隐藏框架需要同时进行视觉隐藏和事件门控：

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

如果可见性由命令式方式驱动，请在可见性控制器中设置全部三个属性（`opacity`、`visibility` 和 `pointerEvents`）。仅设置 `opacity: 0` 仍会留下一个不可见但可以吞掉点击事件的图层。

---

## Fragments：幻灯片内的展示停留点

Fragment 是幻灯片 `[start, end]` 范围内的绝对合成时间线时间（秒），控制器应在此处停留以展示某个状态。

**工作方式：**

1. 播放器进入包含 fragments 的幻灯片——直接定位到 `fragments[0]` 并停留在那里。
2. 用户按下 Next（或 →）——控制器定位到 `fragments[1]` 并停留。
3. 最后一个 fragment 之后，Next 会前进到下一张幻灯片。
4. 没有 fragments 的幻灯片会在幻灯片内的静止帧进入，通常是其中点，而非恰好在 `slide.end`。

Fragment 时间必须落在 `[start, end]` 范围内（包含两个边界）。lint 规则仅拒绝该范围外的 fragments（`time < start` 或 `time > end`）。

Fragment 时间是**绝对合成时间线位置**——与 `data-start` 使用相同的坐标空间——而不是相对于场景起点的偏移量。

导航由定位驱动，而非播放驱动。控制器绝不会仅为了在 fragments 之间移动而启动播放；每个导航命令都是一次到目标停留时间的确定性定位。请将 fragment 状态设计为在目标时间线时间点正确显示。

---

## 分支：热点和幻灯片序列

分支幻灯片是同一合成时间线中的真实场景。它们仅列在 `slideSequences` 下，并被排除在主线导航之外——除非热点触发，否则播放器不会访问它们。

**导航模型：**

- 点击热点会将 `{sequenceId, slideIndex: 0}` 压入导航栈，并进入分支的第一张幻灯片。
- **back()** 弹出栈并返回到准确的父级幻灯片（即包含该热点的幻灯片）。
- **backToMain()** 清空整个栈并返回根幻灯片。
- 面包屑根据栈渲染：`Main deck › Market sizing methodology › Slide 2`。
- 分支内的幻灯片计数器限定于该序列（`1 of 2`，而不是主 deck 的总数）。

**应避免的做法：**

- 不要将分支场景 ID 添加到主 `slides` 数组中。它们必须只出现在 `slideSequences` 条目内。lint 规则会标记重叠。
- 分支场景包含在连续时间线中，因此简单的线性视频导出会包含它们。导出仅读取主线幻灯片（延后实现；在规范中已标记）。

---

## 完整示例：包含 fragments 和分支的 3 张幻灯片 deck

### 场景 HTML（骨架）

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

### 示例中的关键点

- 岛屿 `sceneId` 值（`"hook"`、`"problem"`、`"solution"`、`"mkt-math"`）与场景 div 上的 `data-composition-id` 值完全匹配。
- `mkt-math` 只出现在 `slideSequences` 中，绝不会出现在顶层 `slides` 数组中。
- 片段时间（`11.0`、`15.0`）位于 `problem` 场景的 `[6, 21]` 范围内（时间是合成时间线中的绝对位置）。
- 热点 `region`（`x: 55, y: 60, w: 40, h: 20`）将可点击区域定位在问题幻灯片的右下象限。
- GSAP 时间线注册在 `window.__timelines` 上并处于暂停状态，HyperFrames 引擎负责驱动播放；不要在构造时调用 `.play()`。

---

## 包装组件

在任何嵌入上下文中，将组合内容包裹在 `<hyperframes-player>` 外层的 `<hyperframes-slideshow>` 中：

```html
<hyperframes-slideshow>
  <hyperframes-player src="deck.html"></hyperframes-player>
</hyperframes-slideshow>
```

`<hyperframes-slideshow>` 提供导航界面（Present、Prev / Next、计数器、存在 `sound` 时的全局静音、全屏）、键盘处理（← / →、Space / Backspace，以及用于 Present 的 P）、触摸滑动和热点覆盖层。

幻灯片组件会在挂载时自动为每个内部 `<hyperframes-player>` 设置 `interactive` 属性，因此组合 iframe 内的可点击控件、链接、原生媒体控件和自定义播放器会按预期接收指针事件。（在幻灯片包装器之外，必须手动在 `<hyperframes-player>` 上添加 `interactive`，因为播放器默认对 iframe 设置 `pointer-events: none`，从而避免对播放器宿主的点击被劫持为切换时间线播放。）

**演讲者模式：** 使用幻灯片导航胶囊中的内置 Present 图标按钮，或按 P。它会调用 `window.open('?mode=audience')` 打开全屏观众标签页；发起标签页则成为演讲者视图（当前幻灯片缩小、下一张幻灯片预览、备注、已用时间计时器）。两个标签页通过 `BroadcastChannel('hf-slideshow:' + location.pathname)` 同步。不要添加自定义的包装器级 Present 按钮；共享组件拥有其位置、图标、样式以及在观众模式中的隐藏逻辑。

**通过 Google Meet / Zoom 演示（屏幕共享）：** 共享_观众_界面，并将演讲者视图保留在自己的屏幕上。

- **Google Meet（或任何 Chrome 内共享）：** Present → 在 Meet 中选择 **Share screen → A tab** → 选择观众标签页 → 切回演讲者标签页。Chrome 会在被捕获的标签页处于后台时继续渲染，因此动画和幻灯片导航会保持实时。**不要**共享 “A window” 或 “Entire screen”——被完全遮挡的窗口会停止渲染（观众看到的幻灯片会冻结），而共享整个屏幕会暴露你的备注。
- **Zoom（桌面应用）：** 将观众标签页拖出为独立窗口，然后共享该窗口。Zoom 通过操作系统进行捕获，因此如果观众窗口被_完全_遮挡，它会冻结——请使用第二台显示器，或让观众窗口的一小部分保持在演讲者视图后方可见。

由演讲者驱动的媒体播放受到自动播放策略限制：`BroadcastChannel` 可以同步意图、时间和状态，但无法将演讲者的用户激活状态传递给观众标签页。共享幻灯片播放器会镜像原生媒体事件，并先以静音方式启动远端观众播放；只有在静音 `media.play()` 被拒绝，或演示文稿明确要求观众端播放声音时，才回退到独立 harness 的观众解锁行为。在播放被拒绝后，不要继续应用远端 `timeupdate` 消息，否则观众端会在不播放的情况下静默地在视频中跳转。

演讲者备注可在演讲者视图中编辑。编辑内容会按演示文稿和幻灯片存储在 `localStorage` 中，并覆盖清单中的备注，而不会重写 composition 文件。不要向演示文稿添加一次性的备注编辑脚本；应依赖共享幻灯片播放器的行为。若独立/自定义包装器确实需要在共享播放器之外实现此功能，请使用 `skills/slideshow/references/standalone-harness.md` 中的确定性存储代码片段。

### 幻灯片退出时的媒体清理

幻灯片控制器负责幻灯片退出时的媒体清理。当导航切换幻灯片或序列时，它会在进入下一张幻灯片前调用 `hyperframes-player.stopMedia()`。该命令会：

- 向 iframe 运行时发送 `stop-media`，以停止 WebAudio 并暂停原生 `<video>` / `<audio>` 元素；
- 直接暂停同源 iframe 媒体作为后备；以及
- 暂停从 iframe 媒体接管的父级 frame 代理。

同一张幻灯片内的片段导航**不会**停止媒体。通过 `audio-src` 连接的背景音轨等全局/演示文稿级父级音频，不会被视为幻灯片媒体。

不要为普通媒体播放器添加每张幻灯片单独的清理脚本。应将幻灯片视频/音频作为 composition 中的普通媒体；仅当播放器应保留可听见的原生视频音频，而不是将其视为静音视觉媒体时，才使用 `data-has-audio="true"`。

如果源页面具有附加到媒体的自定义控件或可视化效果，这些控件必须监听幻灯片播放器停止和静音的同一个原生元素。由幻灯片退出、演讲者同步、原生控件、自定义控件或全局静音按钮引起的暂停，都应通过媒体事件更新可见的自定义 UI，而不是通过并行状态更新。

实现直接 iframe 后备清理时，应将 iframe 媒体视为跨 realm DOM。不要使用父页面的 `el instanceof HTMLMediaElement` 测试 iframe 节点；这在真实浏览器中会返回 false。应在设置 `muted` 或调用 `pause()` 前使用 `el.ownerDocument.defaultView.HTMLMediaElement`（或等效的标签/duck-type 守卫）。

### 全局导航静音

当 `<hyperframes-slideshow sound>` 渲染导航静音按钮时，该按钮就是页面的全局静音控制。它必须静音：

- 子 `<hyperframes-player>` 实例，包括同源 iframe 媒体；
- 顶层页面 `<audio>` / `<video>` 元素；以及
- 通过 `hf-sound` 事件控制的包装器自有 SFX/全局 `Audio` 对象。

不要在 composition 内添加第二个静音按钮。如果包装器脚本创建了未附加到 DOM 的 `new Audio(...)` 对象，它必须监听 `hf-sound`，并在每个对象上设置 `clip.muted = detail.muted`，而不只是跳过未来的播放。

此处同样适用跨 realm 规则：全局静音必须通过子 frame 的 DOM realm 作用于 iframe `<video>` / `<audio>` 元素。单个 DOM realm 中通过的单元测试还不够；请在浏览器中验证，点击导航静音按钮后，实际 iframe 媒体元素报告 `muted: true`。

`hyperframes present` 从 `packages/player/dist` 提供已构建的 bundle。更改播放器或幻灯片 chrome 行为后，请在 `packages/player` 中运行 `bun run build`，并在浏览器测试前重启 present 服务器。

---

## 独立运行幻灯片（临时方案）

**长期解决方案**是由引擎托管：`hyperframes preview --slideshow` / Studio 演示模式将在真实的 HyperFrames 引擎之上托管该组合内容，该引擎负责驱动可定位时间线、管理手势帧，并从组合内容中读取 island。该路径即将推出；发布后应优先使用。

在此之前，独立演示（即在浏览器中通过裸播放器 bundle 打开组合内容，且不经过引擎）需要针对三个缺口采取变通方案：组合内容必须暴露一个可定位的根时间线，必须将 island 复制到包装器中，并且由包装器管理的 SFX/全局音频应位于父帧中。这些模式记录于：

```
skills/slideshow/references/standalone-harness.md
```

不要将其中的模式视为推荐模型——它们仅用于在引擎托管路径落地前填补这一缺口。

## 交付

对于公开或面向用户的幻灯片项目，根目录的 `index.html` 应是可运行的幻灯片入口。用浏览器打开它时，应显示幻灯片导航并响应“下一页”/“上一页”；不应只暴露原始组合内容，并要求用户了解 Studio 或内部包装器文件。如果为了 CLI 兼容性必须保留独立的原始 HyperFrames 组合内容，请将其放在诸如 `composition/index.html` 的子目录中，并让脚本/命令指向该目录。

直接打开的包装器必须依赖 `<hyperframes-slideshow>` 渲染的内置 Present 图标按钮。不要添加自定义的 `#present-btn`、固定定位按钮或包装器专用的 Present 样式。共享组件负责控制栏，在 `?mode=audience` 中隐藏 Present，并支持将 P 作为键盘快捷键。

交付前请验证直接打开路径。如果 `file://` 浏览器限制导致 iframe 媒体、本地脚本或同源播放器访问失效，请使用自包含包装器，或让交付命令启动本地服务器并打开可正常工作的 URL；不要让 `index.html` 处于损坏或含义不明确的状态。

对于完成的幻灯片 deck，面向用户的主要下一步应是演讲者模式，而不是 Studio。请运行或提供：

```bash
npx hyperframes present <project-dir>
```

Studio/`preview` 对编辑组合内容很有用，但它不是幻灯片用户明确的最终目的地。如果你为原始组合内容位于 `composition/` 的幻灯片项目创建了 `package.json`，请让默认可运行脚本启动演讲者模式：

```json
{
  "scripts": {
    "dev": "npx hyperframes present ./composition",
    "studio": "npx hyperframes preview ./composition --background"
  }
}
```

交付时，请包含该命令输出的本地演讲者 URL，以及以下最简说明：“点击 Present，或按 P，以打开观众标签页。”如果用户将在 Google Meet 或 Zoom 中演示，也请传达上文 Presenting 部分中的屏幕共享指引（在 Meet 中共享观众标签页；在 Zoom 中共享拖出的观众窗口）。如果用户要求你启动服务器，请保持服务器运行。

---

## 验证

在编写或编辑幻灯片组合后，运行：

```bash
npx hyperframes lint
```

然后运行运行时验证：

```bash
npx hyperframes check
```

即使命令成功退出，也要将 lint 错误和验证中的 `StaticGuard` 合同消息视为阻塞问题。修复文件并重新运行，直到 lint 报告 `0 error(s)` 且验证未报告运行时错误。

幻灯片 lint 规则检查：

- 每个 `slide.sceneId` 都解析为现有场景（通过 `data-composition-id`）。
- 每个 `hotspot.target` 都引用已定义的 `slideSequence` id。
- 片段时间位于每张幻灯片的 `[start, end]` 范围内。
- 任意两张主线幻灯片在时间上都不重叠。

在预览前修复所有违规项。未通过 lint 的组合无法在播放器中正确解析。