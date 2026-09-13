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
> **首先，保持此技能为最新状态——运行前请先向用户确认：** `npx hyperframes skills update slideshow`。如果所有内容都是最新的，这是一次快速空操作；否则，它会在你依赖这些技能之前，刷新此技能及其所依赖的核心领域技能。

> **figma 源**：如果演示文稿的内容或故事板来自 figma.com URL，请先运行 `/figma`——导出资源、品牌令牌，并在源文件是场景帧条带时重建故事板——然后再根据其输出进行构建。不要直接通过原始 MCP 工具驱动 Figma：这样会跳过 SVG 清理、`.media/manifest.jsonl` 溯源以及品牌令牌 `var()` 绑定，之后品牌发生变化时就无法在不完整重新导入的情况下传播更新。

# 幻灯片创作契约

HyperFrames 幻灯片放映是一个普通的 HyperFrames 组合——由场景、片段和 GSAP 时间线组成——只是额外加入了一个 **JSON 岛**，用于声明哪些场景是幻灯片以及它们如何连接。播放器的 `SlideshowController` 会读取这个 JSON 岛，并将连续的 GSAP 时间线转换为可离散导航的演示文稿。

**请先阅读 `/hyperframes-core`**，了解基础组合契约（片段、轨道、`data-*` 属性、确定性规则）。本技能只涵盖新增内容：JSON 岛架构、幻灯片编写规则、片段、分支、验证以及包装组件。

## 输出——可导航的演示文稿，而不是线性 MP4

幻灯片放映的输出是**正在运行的演示文稿**：使用 `hyperframes present <project-dir>` 提供服务（或使用 Studio 的 present 模式）——播放器的 `SlideshowController` 会读取 JSON 岛并驱动导航、片段、分支和演讲者模式。请参阅下方的「演示与交付」。

**不要将幻灯片放映 `hyperframes render` 为单个 MP4。** 演示文稿应被编写为多个顶层场景组合（每张幻灯片对应一个 `data-composition-id`），**不得**使用包装它们的主根组合；因此，`render` 只会解析第一个组合，并输出一个**静默截断**的 MP4（例如，一个 40 秒的演示文稿最终只有 6 秒）。线性主线导出（仅包含主幻灯片，不包含分支序列）将被**延后提供**——在该功能发布之前，受支持的输出是实时的 `present` 演示文稿和逐张幻灯片的 `snapshot` 静态图。如果用户当前需要线性 MP4，请说明这一限制，不要将 `render` 指向该演示文稿。

## 意图确认

如果用户明确要求制作 slideshow、slide show 或 HyperFrames slideshow，请使用此技能。当请求通过 `/hyperframes` 到达时，意图层的分流流程负责此次确认——既然请求已被路由到这里，就表示确认已经完成，无需再次询问；该层的运行形式问题也不适用（交付物是演示文稿，而不是渲染后的视频）。如果存在 `BRIEF.md`，其中包含已确认的意图——请阅读它。

如果此技能是由相邻请求触发的，例如「presentation」「pitch deck」「deck」「interactive deck」或「convert this page」，请在创作前暂停，先说明可选方案并请求确认。简要解释 HyperFrames slideshow 意味着：一个可运行的演示文稿，具备离散幻灯片、内置导航和演讲者模式、可编辑的演讲者备注、共享媒体处理，以及交付前验证。对于源页面转换，还要说明目标是保留原页面的视觉设计、交互、动效和媒体行为，同时将页面移动转换为幻灯片之间的过渡。

然后提出一个简短的确认问题：

> 你希望将其制作成 HyperFrames 幻灯片吗？

如果环境提供选项 UI，请使用是/否选项；否则以纯文本提出问题。

在用户回答“是”之前，不要实现幻灯片。如果用户回答“否”，请停止使用此 skill，读取 `/hyperframes`，让意图层重新路由。此确认是一个**路由决策**，而不是偏好门槛：根据 `../hyperframes-core/references/brief-contract.md` § 1，它在自主模式下仍然有效（“给我惊喜”不会跳过它）：构建错误的交付类型属于质量问题，而不是创意决策。

---

## 两个组成部分

### 1. 场景 — 按正常方式声明

每张幻灯片都由一个场景支持。使用 `data-composition-id`、`data-start`、`data-duration` 和 `data-label` 声明场景：

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

分支幻灯片（只能通过热点访问，不包含在主线中）也完全以相同方式声明，只是它们仅出现在 island 中的某个 `slideSequences` 条目内，而不会出现在主 `slides` 数组中。

### 2. JSON island — 每个 composition 一个 script 块

向 composition HTML 添加且仅添加一个 `<script type="application/hyperframes-slideshow+json">` 块。它包含所有幻灯片元数据：

```html
<script type="application/hyperframes-slideshow+json">
  {
    "slides": [...],
    "slideSequences": [...]
  }
</script>
```

island 是幻灯片顺序、备注、片段停留点、热点和分支序列的唯一事实来源。请将它放在 `<body>` 顶部附近、场景 div 之前，以便查找。

不要将幻灯片清单隐藏在另一个 `<script type="application/json">` 块和用于创建 island 的运行时代码之后。`present` 命令会静态读取 composition HTML，并要求其中已经存在真正的 `application/hyperframes-slideshow+json` island。

---

## Schema

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
| ------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sceneId`                                   | 是   | 必须与场景的 `data-composition-id` 完全匹配（或提供明确的 `startTime`/`endTime`）。lint 规则通过 `data-composition-id` 解析场景。 |
| `notes`                                     | 否   | 仅供演示者使用的文本。永远不会显示给观众。                                                                                                              |
| `fragments`                                 | 否   | 幻灯片 `[start, end]` 范围内的时间数组（单位：秒），请参阅下文的 Fragments。                                                                            |
| `hotspots`                                  | 否   | 触发分支的交互式叠加层，请参阅下文的 Branching。                                                                                                        |
| `startTime`                                 | 否   | 可选。覆盖匹配场景的时间边界；默认为场景的开始/结束时间。                                                                                               |
| `endTime`                                   | 否   | 可选。覆盖匹配场景的时间边界；默认为场景的开始/结束时间。                                                                                               |
| `ttsScript`, `ttsAudioUrl`, `ttsDurationMs` | 否   | **保留字段。** Schema 字段已存在，但 TTS 播放尚未接入。除非你要为未来的构建预先填充，否则请省略。                                                      |

### `SlideHotspot`

```json
{
  "id": "h1",
  "label": "How did we calculate this?",
  "target": "market-deep-dive",
  "region": { "x": 60, "y": 10, "w": 35, "h": 20 }
}
```

| Field    | Required | Notes                                                                                                                           |
| -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `id`     | 是       | 在当前幻灯片中必须唯一。                                                                                                        |
| `label`  | 是       | 向观众显示的工具提示/按钮文本。                                                                                    |
| `target` | 是       | 必须与 `slideSequences` 中的某个 `SlideSequence.id` 匹配。                                                                            |
| `region` | 否       | 以幻灯片百分比表示的边界框：`{x, y, w, h}`，取值范围为 `0–100`。省略时，热点将渲染为一个覆盖整张幻灯片的带标签按钮。 |

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

这些是硬性约束，而不是建议。违反这些规则的幻灯片在评审者看到后将被直接替换。

- **标题必须是完整句子的主张，而不是标签。** 写成“SMB 每周在手动排班上花费 14 小时”，而不是“排班问题”。即使忽略视觉内容，这句话也应当能够独立成立。
- **每张幻灯片只包含一个想法和一个视觉元素。** 如果你想添加第二组要点或第二张图表，就拆分幻灯片。
- **先给出结论。** 最有力的观点必须最先出现，既要在幻灯片中最先出现，也要在演示文稿顺序中最先出现。投资者从左到右、从上到下阅读，而且会停下来。
- **市场规模只能自下而上地计算。** 切勿在没有展示计算过程的情况下写“$50B TAM”。应从单位经济效益开始构建：账户数 × ACV，或交易数 × 抽成率。
- **字体最小为相当于 30pt。** 在 1920×1080 分辨率下，标题应为 72–96px；正文应为 48px。观众必须阅读的任何文本都不得小于 40px。
- **在手动制作任何命名视觉元素之前，先搜索实时目录。** 对于幻灯片所需的每一种外观、效果、图表、处理方式或转场——“CRT 扫描线”、“故障效果”、“竞速条形图”、“闪光扫掠”、“终端窗口”——运行 `npx hyperframes catalog --query "<the visual, in plain English>" --json`，并在编写幻灯片片段之前阅读排名靠前的结果。搜索**无需安装任何内容**：不需要项目，不需要事先执行 `add`，也不需要账户。它可以从任意目录对整个托管注册表（约 400 个区块和组件）进行排名。`npx hyperframes add <name>` 会将区块的源代码放入演示文稿中，你可以直接在其中进行定制。迁移源页面时尤其必须遵守这一点：真实区块优于下方移植规则所禁止的简化近似实现。

## 移植源页面

将现有页面转换为幻灯片时，源页面保真度是约定的一部分。除非用户明确要求重新设计，否则不要用简化的近似实现替换源页面特有的小部件。

- 尽可能保留原始页面的视觉设计、动效语言、交互行为、媒体行为和演示辅助功能。当幻灯片系统支持演讲者模式时，使用共享的可编辑备注行为包含演讲者备注，而不是采用特定于该演示文稿的实现。
- 尽可能准确地从源 DOM/CSS/JS 移植机械视觉效果：自定义播放器、画布可视化效果、时间线、播放头、音轨、扩展圆形、悬停状态以及其他交互细节都应保留。
- 将原生 `<video>` / `<audio>` 元素视为所有自定义媒体控件、画布可视化效果、波形、节拍网格或播放头的事实来源。接入源媒体事件（`play`、`pause`、`timeupdate`、`seeking`、`seeked`、`ended`、`ratechange`、`volumechange`），并根据 `media.currentTime` 推导视觉状态；不要运行可能与实际播放产生偏差的独立计时器。
- 每个带有 `src` 的复制 `<video>` 或 `<audio>` 在 lint 之前都必须具备 HyperFrames 时间属性：`data-start` 和 `data-duration`；当应保留原生音频且音频可听时，还要添加 `data-has-audio="true"`。对于仅属于单张幻灯片的媒体，使用场景的时间范围；对于可能在多张聚焦幻灯片中播放、由用户控制的证据视频，使用整个演示文稿的时间范围。不要在媒体上保留 `preload="none"`；使用 `metadata` 或 `auto`。
- 在验证之前解析源字体令牌。如果要保留源自定义字体，为本地/捕获的字体文件添加 `@font-face` 规则。如果使用系统回退字体，将 `font-family: var(--f-body)` 等令牌化声明替换为 `system-ui, sans-serif` 或 `ui-monospace, monospace` 等具体且可安全渲染的字体栈；不要将 `var(...)` 留作字体族值。
- 审查源页面是否存在非典型的页面移动行为，尤其是由滚动、滚轮、触摸、哈希状态、调整大小或 `requestAnimationFrame` 循环驱动的行为。将固定视口与经过平移/缩放的“世界”图层、视差、固定面板、水平滚动器、滚动控制的时间线、分区吸附以及缩放至元素的摄像机视为源行为。滚动通常是源页面的过渡触发器，因此应提取其进度停靠点、缓动和摄像机/焦点状态，然后通过时间线位置、片段或可复用的播放器/工具钩子，将该动效重新承载到幻灯片导航上。即使独立包装器会跳转到幻灯片停留点，也仍需要明确的导航摄像机过渡钩子；仅计算每张幻灯片的摄像机变换是不够的。不要在幻灯片中模拟字面意义上的页面向下滚动过渡；观众应感受到摄像机从一个焦点移动/缩放到另一个焦点，而不是看到网页正在被滚动。保持每次幻灯片之间的摄像机移动连续：除非源页面确实在该边界这样做，否则避免出现中间路线停靠点导致 x/y 方向或缩放反转。在落到目标位置之前四处乱窜的过渡，不如更简单的直接焦点移动。
- 保留源页面的媒体裁剪语义。将截图、推文/社交媒体帖子、产品 UI 截图、图表、文档、代码、排行榜以及任何包含可读文本的图像视为内容证据，而不是装饰性媒体：使用源宽高比（`height: auto`），或在稳定的框架内使用 `object-fit: contain`。仅当源页面使用了 `object-fit: cover`，或该媒体是有意设置的装饰性/背景/电影感缩略图时，才使用 `object-fit: cover`。将这些截图适配到幻灯片后，检查四条边缘是否截断了文本、徽标、控件或说明文字；除非源页面本身进行了裁剪，否则有意义内容出现可见裁剪就是一个 bug。
- 如果某种行为对幻灯片放映来说是通用的，应将其放入播放器/控制器或可复用的 skill 片段中。不要用一次性的演示文稿脚本解决它。
- 堆叠的场景框绝不能阻止当前活动幻灯片的交互。隐藏的框架必须同时具备视觉隐藏和事件门控：

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

如果可见性由命令式逻辑驱动，请在可见性控制器中设置全部三个属性（`opacity`、`visibility` 和 `pointerEvents`）。仅设置 `opacity: 0` 仍会留下一个不可见的层，该层可能拦截点击。

---

## Fragments：在幻灯片中显示保持点

fragment 是幻灯片 `[start, end]` 范围内的一个绝对合成时间（秒），控制器应在该时间点保持某个显示状态。

**工作方式：**

1. 播放器进入包含 fragments 的幻灯片时，会直接 seek 到 `fragments[0]` 并停留在那里。
2. 用户按下 Next（或 →）后，控制器会 seek 到 `fragments[1]` 并停留。
3. 在最后一个 fragment 之后，Next 会前进到下一张幻灯片。
4. 不包含 fragments 的幻灯片会进入幻灯片内部的一个静止帧，通常是其中点，而不是恰好位于 `slide.end`。

fragment 时间必须位于 `[start, end]` 范围内（包括两个边界值）。lint 规则只会拒绝超出该范围的 fragment（`time < start` 或 `time > end`）。

fragment 时间是**绝对合成时间轴位置**，与 `data-start` 使用相同的坐标空间，而不是相对于场景起点的偏移量。

导航由 seek 驱动，而不是由播放驱动。控制器不会仅为了在 fragment 之间移动而启动播放；每条导航命令都会确定性地 seek 到目标保持时间。请确保 fragment 状态在目标时间轴位置上是正确的。

---

## Branching：热点与幻灯片序列

分支幻灯片是同一合成时间轴中的真实场景。它们只列在 `slideSequences` 下，并从主线导航中排除，除非触发了热点，否则播放器永远不会访问它们。

**导航模型：**

- 点击热点会将 `{sequenceId, slideIndex: 0}` 压入导航栈，并进入分支的第一张幻灯片。
- **back()** 会弹出导航栈，并返回到确切的父级幻灯片（即包含该热点的幻灯片）。
- **backToMain()** 会清空整个导航栈，并返回根幻灯片。
- 面包屑根据导航栈渲染：`Main deck › Market sizing methodology › Slide 2`。
- 分支中的幻灯片计数器以该序列为范围（`1 of 2`，而不是主 deck 的总数）。

**需要避免的事项：**

- 不要将分支场景 ID 添加到主 `slides` 数组中。它们必须只出现在 `slideSequences` 条目中。lint 规则会标记重叠。
- 分支场景包含在连续时间轴中，因此朴素的线性视频导出会包含它们。导出只读取主线幻灯片（已延期；规范中已标记）。

---

## 完整示例：包含 fragments 和分支的 3 张幻灯片 deck

### Scene HTML（骨架）

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

- 岛屿的 `sceneId` 值（`"hook"`、`"problem"`、`"solution"`、`"mkt-math"`）与场景 div 上的 `data-composition-id` 值完全匹配。
- `mkt-math` 只出现在 `slideSequences` 中，绝不会出现在顶层的 `slides` 数组中。
- 片段时间（`11.0`、`15.0`）位于 `problem` 场景的 `[6, 21]` 范围内（时间是绝对的 composition-timeline 位置）。
- 热点的 `region`（`x: 55, y: 60, w: 40, h: 20`）将可点击区域定位在 problem 幻灯片的右下象限。
- GSAP 时间线注册在 `window.__timelines` 上，并且处于暂停状态 — HyperFrames 引擎负责驱动播放；不要在构造时调用 `.play()`。

---

## 包装组件

在任何嵌入环境中，将 composition 包装在 `<hyperframes-slideshow>` 和 `<hyperframes-player>` 外层：

```html
<hyperframes-slideshow>
  <hyperframes-player src="deck.html"></hyperframes-player>
</hyperframes-slideshow>
```

`<hyperframes-slideshow>` 提供导航控件（Present、Prev / Next、计数器、存在 `sound` 时显示全局静音、全屏）、键盘处理（← / →、Space / Backspace，以及用于 Present 的 P 键）、触摸滑动和热点覆盖层。

slideshow 会在挂载时自动为其中的每个 `<hyperframes-player>` 设置 `interactive` 属性，因此 composition iframe 内的可点击控件、链接、原生媒体控件和自定义播放器能够按预期接收指针事件。（在 slideshow 包装器之外，必须手动在 `<hyperframes-player>` 上添加 `interactive` — 播放器默认会在 iframe 上设置 `pointer-events: none`，以避免播放器宿主上的点击被劫持为切换时间线播放。）

**Presenter 模式：** 使用 slideshow 导航胶囊中的内置 Present 图标按钮，或按 P 键。它会调用 `window.open('?mode=audience')` 打开一个全屏 audience 标签页；原始标签页会变为 presenter 视图（缩小显示当前幻灯片、下张幻灯片预览、备注、已用时间计时器）。两个标签页通过 `BroadcastChannel('hf-slideshow:' + location.pathname)` 同步。不要添加自定义的包装器级 Present 按钮；共享组件负责其位置、图标、样式以及 audience 模式下的隐藏。

**通过 Google Meet / Zoom 演示（屏幕共享）：** 共享 _audience_ 界面，将 presenter 视图保留在自己的屏幕上。

- **Google Meet（或任何 Chrome 内的共享）：** 点击 Present → 在 Meet 中选择 **Share screen → A tab** → 选择 audience 标签页 → 切回 presenter 标签页。Chrome 会继续渲染被捕获的标签页，即使它处于后台，因此动画和幻灯片导航仍保持实时。不要共享 **A window** 或 **Entire screen** — 被完全遮挡的窗口会停止渲染（观众看到的幻灯片会冻结），而共享整个屏幕会暴露你的备注。
- **Zoom（桌面应用）：** 将 audience 标签页拖出，使其成为独立窗口，然后共享该窗口。Zoom 通过操作系统进行捕获，因此如果 audience 窗口被完全遮挡就会冻结 — 使用第二台显示器，或让 audience 窗口的一小部分保持在 presenter 视图后方可见。

由 presenter 驱动的媒体播放受自动播放策略限制：`BroadcastChannel` 可以同步意图、时间和状态，但无法将 presenter 的用户激活状态传递给 audience 标签页。共享的 slideshow 播放器会镜像原生媒体事件，并先以静音状态启动远程 audience 播放；只有在静音的 `media.play()` 被拒绝，或 deck 明确要求 audience 播放声音时，才回退到独立 harness 的 audience 解锁行为。如果播放被拒绝，不要继续应用远程 `timeupdate` 消息，否则 audience 会在视频未播放的情况下静默地不断跳转。

演示者视图中的演示者备注可编辑。编辑内容按 deck 和 slide 存储在 `localStorage` 中，并覆盖 manifest 备注，而不会重写 composition 文件。不要向 deck 添加一次性的备注编辑脚本；依赖共享的 slideshow player 行为。如果独立/自定义 wrapper 确实需要在共享 player 之外实现此功能，请使用 `skills/slideshow/references/standalone-harness.md` 中确定性的存储代码片段。

### 幻灯片退出时的媒体清理

slideshow controller 负责幻灯片退出时的媒体清理。当导航切换幻灯片或 sequence 时，它会在进入下一张幻灯片之前调用 `hyperframes-player.stopMedia()`。该命令：

- 向 iframe runtime 发送 `stop-media`，停止 WebAudio 并暂停原生 `<video>` / `<audio>` 元素；
- 直接暂停同源 iframe 中的媒体，作为回退机制；以及
- 暂停从 iframe 媒体中采用的父 frame 代理。

同一张幻灯片内的 fragment 导航**不会**停止媒体。通过 `audio-src` 接入的全局/ deck 级父级音频（例如背景音轨）不被视为幻灯片媒体。

对于普通媒体播放器，不要添加逐张幻灯片的清理脚本。将幻灯片视频/音频作为 composition 中的普通媒体；仅当播放器应保留可听见的原生视频音频，而不是将其视为静音的视觉媒体时，才使用 `data-has-audio="true"`。

如果源页面具有绑定到媒体的自定义控件或可视化效果，这些控件必须监听 slideshow player 停止和静音的同一个原生元素。由幻灯片退出、演示者同步、原生控件、自定义控件或全局静音按钮导致的暂停，都应通过媒体事件更新可见的自定义 UI，而不是通过并行状态更新。

实现直接的 iframe 回退清理时，请将 iframe 媒体视为跨 realm DOM。不要使用父页面的 `el instanceof HTMLMediaElement` 检查 iframe 节点；在真实浏览器中该检查会返回 false。设置 `muted` 或调用 `pause()` 前，请使用 `el.ownerDocument.defaultView.HTMLMediaElement`（或等效的标签/鸭子类型检查）。

### 全局导航静音

当 `<hyperframes-slideshow sound>` 渲染导航静音按钮时，该按钮就是页面的全局静音控件。它必须将以下媒体静音：

- 子 `<hyperframes-player>` 实例，包括同源 iframe 媒体；
- 顶层页面的 `<audio>` / `<video>` 元素；以及
- 通过 `hf-sound` 事件管理的 wrapper 所有 SFX/全局 `Audio` 对象。

不要在 composition 内添加第二个静音按钮。如果 wrapper 脚本创建了未附加到 DOM 的 `new Audio(...)` 对象，则必须监听 `hf-sound`，并对每个对象设置 `clip.muted = detail.muted`，而不能只是跳过后续播放。

这里同样适用跨 realm 规则：全局静音必须通过子 frame 的 DOM realm 触达 iframe `<video>` / `<audio>` 元素。在单一 DOM realm 中通过的单元测试并不足够；请在浏览器中验证点击导航静音按钮后，实际 iframe 媒体元素报告 `muted: true`。

`hyperframes present` 从 `packages/player/dist` 提供构建后的 bundle。更改 player 或 slideshow chrome 行为后，请在 `packages/player` 中运行 `bun run build`，并重启 present server，然后再在浏览器中测试。

---

## 独立运行幻灯片（临时方案）

**持久性的解决方案**由引擎托管：`hyperframes preview --slideshow` / Studio 演示模式将在真正的 HyperFrames 引擎上托管合成内容，由引擎驱动可跳转时间线、管理手势帧，并从合成内容中读取 island。该路径即将推出；发布后应优先使用它。

在此之前，独立演示（在浏览器中通过裸 player bundle 打开合成内容、不使用引擎）需要针对三个缺口采取变通方案：合成内容必须暴露可跳转的根时间线，island 必须复制到 wrapper 中，并且由 wrapper 所有的 SFX/全局音频应位于父级 frame 中。这些模式记录在：

```
skills/slideshow/references/standalone-harness.md
```

不要将其中的模式视为正式推荐模型——它们只是用于弥补引擎托管路径推出前的空缺。

## 交接

对于面向公众或用户的幻灯片项目，根目录下的 `index.html` 应是一个可运行的幻灯片入口。用浏览器打开后，应显示幻灯片导航并响应 Next/Prev；不应只暴露原始合成内容，并要求用户了解 Studio 或内部 wrapper 文件。如果原始 HyperFrames 合成内容必须保持独立以兼容 CLI，请将其放在 `composition/index.html` 等子目录中，并让脚本/命令指向该目录。

直接打开的 wrapper 必须依赖 `<hyperframes-slideshow>` 渲染的内置 Present 图标按钮。不要添加自定义的 `#present-btn`、固定位置按钮或 wrapper 专用的 Present 样式。共享组件负责控制栏，在 `?mode=audience` 中隐藏 Present，并支持使用键盘快捷键 P。

在交接前验证直接打开的路径。如果 `file://` 浏览器限制导致 iframe 媒体、本地脚本或同源 player 访问出现问题，请使用自包含 wrapper，或让交接命令启动本地服务器并打开可用的 URL；不要让 `index.html` 处于损坏或含义不明确的状态。

对于已完成的幻灯片文稿，面向用户的首要后续步骤应是演示模式，而不是 Studio。运行或提供：

```bash
npx hyperframes present <project-dir>
```

Studio/`preview` 适合编辑合成内容，但对于幻灯片用户而言，它不是清晰的最终使用入口。如果你为原始合成内容位于 `composition/` 中的幻灯片项目创建 `package.json`，应让默认的可运行脚本启动演示模式：

```json
{
  "scripts": {
    "dev": "npx hyperframes present ./composition",
    "studio": "npx hyperframes preview ./composition --background"
  }
}
```

交接时，附上命令打印出的本地演示 URL，并提供最简说明：“点击 Present，或按 P，打开观众标签页。”如果用户将通过 Google Meet 或 Zoom 进行演示，还应转达上方 Presenting 部分中的屏幕共享指南（在 Meet 中共享观众标签页；在 Zoom 中共享拖出的观众窗口）。如果用户要求你启动服务器，请保持服务器运行。

---

## 验证

编写或编辑幻灯片组合后，运行：

```bash
npx hyperframes lint
```

然后运行运行时验证：

```bash
npx hyperframes check
```

即使命令成功退出，也要将 lint 错误和验证中的 `StaticGuard` 契约消息视为阻塞问题。修复文件并重新运行，直到 lint 报告 `0 error(s)`，且验证报告没有运行时错误。

幻灯片 lint 规则检查：

- 每个 `slide.sceneId` 都解析到一个现有场景（通过 `data-composition-id`）。
- 每个 `hotspot.target` 都引用一个已定义的 `slideSequence` id。
- Fragment 时间位于每张幻灯片的 `[start, end]` 范围内。
- 主线幻灯片之间不存在时间重叠。

在预览前修复所有违规项。未通过 lint 的组合无法在播放器中正确解析。