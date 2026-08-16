---
name: gsap-plugins
description: Official GSAP skill for GSAP plugins — registration, ScrollToPlugin, ScrollSmoother, Flip, Draggable, Inertia, Observer, SplitText, ScrambleText, SVG and physics plugins, CustomEase, EasePack, CustomWiggle, CustomBounce, GSDevTools. Use when the user asks about a GSAP plugin, scroll-to, flip animations, draggable, SVG drawing, or plugin registration.
license: MIT
---
# GSAP 插件

## 何时使用此技能

在使用或审查采用 GSAP 插件的代码时应用此技能，包括：注册插件、滚动定位、Flip/FLIP 动画、可拖拽元素、SVG（DrawSVG、MorphSVG、MotionPath）、文本（SplitText、ScrambleText）、物理效果、缓动插件（CustomEase、EasePack、CustomWiggle、CustomBounce）或 GSDevTools。ScrollTrigger 有其专属技能（gsap-scrolltrigger）。

**相关技能：** 对于核心补间动画，请使用 **gsap-core**；对于 ScrollTrigger，请使用 **gsap-scrolltrigger**；对于 React，请使用 **gsap-react**。

## 许可与安装（重要）

所有 GSAP 插件都是**免费的**，包括商业用途。自 [Webflow 收购 GSAP](https://gsap.com/blog/webflow-GSAP/) 后，Club GSAP 不再是付费层级，且**任何插件都不再需要会员资格、许可证密钥或身份验证令牌**——其中也包括以前仅限 Club 使用的插件（**SplitText**、**MorphSVG** 等）。

- ✅ 从公开的 `gsap` npm 包安装所有内容：`npm install gsap`。其中已包含所有插件——可通过 `gsap/SplitText`、`gsap/MorphSVGPlugin` 等路径导入。
- ❌ **不要**生成包含 GreenSock 身份验证令牌的 `.npmrc`，不要建议使用私有的 `npm.greensock.com` 注册表，也不要告诉用户注册 Club GSAP 才能访问插件。这些说明已经过时。

## 注册插件

每个插件注册一次，以便 GSAP（以及打包工具）知道需要包含它。使用 **gsap.registerPlugin()** 注册项目中使用的每个插件：

```javascript
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Flip } from "gsap/Flip";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(ScrollToPlugin, Flip, Draggable);
```

- ✅ 在任何补间动画或 API 调用中使用插件之前完成注册。
- ✅ 在 React 中，应在顶层或应用中注册一次（例如在首次使用 useGSAP 之前）；不要在会重新渲染的组件内部注册。useGSAP 本身也是一个插件，需要在使用前注册。

## 滚动

### ScrollToPlugin

为滚动位置（窗口或可滚动元素）添加动画。适用于不借助 ScrollTrigger 实现“滚动到元素”或“滚动到位置”。

```javascript
gsap.registerPlugin(ScrollToPlugin);

gsap.to(window, { duration: 1, scrollTo: { y: 500 } });
gsap.to(window, { duration: 1, scrollTo: { y: "#section", offsetY: 50 } });
gsap.to(scrollContainer, { duration: 1, scrollTo: { x: "max" } });
```

**ScrollToPlugin — 关键配置（scrollTo 对象）：**

| 选项 | 说明 |
|--------|-------------|
| `x`, `y` | 目标滚动位置（数字），或使用 `"max"` 表示最大值 |
| `element` | 要滚动到的选择器或元素（用于滚动到可视区域） |
| `offsetX`, `offsetY` | 相对于目标位置的像素偏移量 |

### ScrollSmoother

平滑滚动包装器（让原生滚动更加平滑）。需要 ScrollTrigger 和特定的 DOM 结构（内容包装器 + 平滑包装器）。在需要平滑、具有惯性效果的滚动时使用。设置方法请参阅 GSAP 文档；应在 ScrollTrigger 之后注册。DOM 结构如下所示：

```html
<body>
	<div id="smooth-wrapper">
		<div id="smooth-content">
			<!--- ALL YOUR CONTENT HERE --->
		</div>
	</div>
	<!-- position: fixed elements can go outside --->
</body>
```

## DOM / UI

### Flip

使用 `Flip.getState()` 捕获状态，然后应用更改（例如布局或类更改），再使用 `Flip.from()` 从先前状态动画过渡到新状态（FLIP：First、Last、Invert、Play）。适用于在两种布局状态之间制作动画（列表、网格、展开/折叠）。

```javascript
gsap.registerPlugin(Flip);

const state = Flip.getState(".item");
// change DOM (reorder, add/remove, change classes)
Flip.from(state, { duration: 0.5, ease: "power2.inOut" });
```

**Flip — 关键配置（Flip.from vars）：**

| 选项 | 说明 |
|--------|-------------|
| `absolute` | 在翻转期间使用 `position: absolute`（默认值：`false`） |
| `nested` | 为 true 时，仅测量第一层子元素（更适合嵌套变换） |
| `scale` | 为 true 时，缩放元素以适应尺寸（避免拉伸）；默认值为 `true` |
| `simple` | 为 true 时，仅对位置/缩放制作动画（速度更快，但准确度较低） |
| `duration`, `ease` | 标准补间选项 |

#### 更多信息

https://gsap.com/docs/v3/Plugins/Flip

### Draggable

使元素可通过鼠标/触摸进行拖动、旋转或抛掷。适用于滑块、卡片、可重新排序的列表或任何拖动交互。

```javascript
gsap.registerPlugin(Draggable, InertiaPlugin);

Draggable.create(".box", { type: "x,y", bounds: "#container", inertia: true });
Draggable.create(".knob", { type: "rotation" });
```

**Draggable — 关键配置选项：**

| 选项 | 说明 |
|--------|-------------|
| `type` | `"x"`、`"y"`、`"x,y"`、`"rotation"`、`"scroll"` |
| `bounds` | 用于限制拖动范围的元素、选择器或 `{ minX, maxX, minY, maxY }` |
| `inertia` | 设为 `true` 以启用抛掷/动量（需要 InertiaPlugin） |
| `edgeResistance` | 0–1；拖动超出边界时的阻力 |
| `cursor` | 拖动期间的 CSS 光标 |
| `onDragStart`, `onDrag`, `onDragEnd` | 回调；接收事件和目标 |
| `onThrowUpdate`, `onThrowComplete` | 惯性启用时的回调 |

### 惯性（InertiaPlugin）

与 Draggable 配合使用，可在释放后产生动量；也可以跟踪任意对象的任意属性的惯性/速度，使其随后通过简单的补间动画无缝滑行至停止。使用 `inertia: true` 时，与 Draggable 一起注册：

```javascript
gsap.registerPlugin(Draggable, InertiaPlugin);
Draggable.create(".box", { type: "x,y", inertia: true });
```

或者跟踪某个属性的速度： 
```javascript
InertiaPlugin.track(".box", "x");
```

然后使用 `"auto"` 延续当前速度并滑行至停止： 

```javascript
gsap.to(obj, { inertia: { x: "auto" } });
```

### Observer

统一不同设备上的指针和滚动输入。适用于滑动、滚动方向或自定义手势逻辑，而无需像 ScrollTrigger 那样直接绑定到滚动位置。

```javascript
gsap.registerPlugin(Observer);

Observer.create({
  target: "#area",
  onUp: () => {},
  onDown: () => {},
  onLeft: () => {},
  onRight: () => {},
  tolerance: 10
});
```

**Observer — 关键配置选项：**

| 选项 | 说明 |
|--------|-------------|
| `target` | 要观察的元素或选择器 |
| `onUp`, `onDown`, `onLeft`, `onRight` | 当滑动/滚动在相应方向超过容差时触发的回调 |
| `tolerance` | 检测到方向前所需的像素数；默认值为 10 |
| `type` | `"touch"`、`"pointer"` 或 `"wheel"`（默认值：`"touch,pointer"`） |

## 文本

### SplitText

将元素的文本拆分为字符、单词和/或行（每个单元都位于各自的元素中），以实现交错动画或逐单元动画。适用于逐字符、逐单词或逐行动画。返回一个包含 **chars**、**words**、**lines**（设置 `mask` 时还包含 **masks**）的实例。可使用 **revert()** 恢复原始标记，也可让 **gsap.context()** 执行恢复。可与 **gsap.context()**、**matchMedia()** 和 **useGSAP()** 集成。API：**SplitText.create(target, vars)**（target = 选择器、元素或数组）。

```javascript
gsap.registerPlugin(SplitText);

const split = SplitText.create(".heading", { type: "words, chars" });
gsap.from(split.chars, { opacity: 0, y: 20, stagger: 0.03, duration: 0.4 });
// later: split.revert() or let gsap.context() cleanup revert
```

使用 **onSplit()**（v3.13.0+）时，动画会在每次拆分时运行；使用 **autoSplit** 时，也会在重新拆分时运行。从 **onSplit()** 返回补间动画或时间线，可让 SplitText 在重新拆分时执行清理并同步进度：

```javascript
SplitText.create(".split", {
  type: "lines",
  autoSplit: true,
  onSplit(self) {
    return gsap.from(self.lines, { y: 100, opacity: 0, stagger: 0.05, duration: 0.5 });
  }
});
```

**SplitText — 关键配置（SplitText.create vars）：**

| 选项 | 说明 |
|--------|-------------|
| **type** | 以逗号分隔：`"chars"`、`"words"`、`"lines"`。默认为 `"chars,words,lines"`。为提高性能，只拆分所需的类型（例如，不使用行时采用 `"words, chars"`）。避免仅拆分字符而不拆分单词/行，或者使用 **smartWrap: true** 防止异常换行。 |
| **charsClass**, **wordsClass**, **linesClass** | 每个拆分元素上的 CSS 类。追加 `"++"` 可添加递增类名（例如 `linesClass: "line++"` → `line1`、`line2`、…）。 |
| **aria** | `"auto"`（默认）、`"hidden"` 或 `"none"`。无障碍功能：`"auto"` 会向拆分元素添加 `aria-label`，并向行/单词/字符元素添加 `aria-hidden`，使屏幕阅读器读取该标签；`"hidden"` 会对阅读器隐藏所有内容；`"none"` 保持 aria 不变。如果必须向屏幕阅读器公开嵌套链接/语义，请使用 `"none"` 并添加一个仅供屏幕阅读器读取的副本。 |
| **autoSplit** | 当设为 `true` 时，会在字体加载完成或元素宽度发生变化时（并且拆分了行）恢复并重新拆分，从而避免错误换行。**动画必须在 onSplit() 内创建**，使其以新拆分的元素为目标；从 **onSplit()** **返回**动画，可在重新拆分时自动清理并同步时间。 |
| **onSplit(self)** | 拆分完成时的回调（如果 **autoSplit** 为 `true`，则每次重新拆分时也会调用）。接收 SplitText 实例。返回 GSAP 补间动画或时间线后，可在重新拆分时自动恢复/同步该动画。 |
| **mask** | `"lines"`、`"words"` 或 `"chars"`。将每个单元包装在一个带有 `overflow: clip` 的额外元素中，以实现遮罩/显现效果。只能指定一种类型；可通过实例的 **masks** 数组访问包装元素（如果设置了类，也可使用类 `-mask`）。 |
| **tag** | 包装元素的标签；默认为 `"div"`。内联场景请使用 `"span"`（注意：在某些浏览器中，旋转/缩放等变换可能无法在内联元素上渲染）。 |
| **deepSlice** | 当设为 `true`（默认）时，会细分跨越多行的嵌套元素（例如 `<strong>`），使各行不会在垂直方向上被拉伸。仅在拆分行时适用。 |
| **ignore** | 保持不拆分的选择器或元素（例如 `ignore: "sup"`）。 |
| **smartWrap** | 仅拆分 **chars** 时，会将单词包装在 `white-space: nowrap` 的 span 中，以避免在单词中间换行。如果拆分了单词或行，则忽略此选项。默认为 `false`。 |
| **wordDelimiter** | 单词边界：字符串（默认为 `" "`）、RegExp，或用于自定义拆分的 `{ delimiter: RegExp, replaceWith: string }`（例如用于话题标签或非拉丁文字的零宽连接符）。 |
| **prepareText(text, parent)** | 接收原始文本和父元素的函数；返回拆分前修改后的文本（例如，为不使用空格的语言插入换行标记）。 |
| **propIndex** | 当设为 `true` 时，会在每个拆分元素上添加包含索引的 CSS 变量（例如 `--word: 1`、`--char: 2`）。 |
| **reduceWhiteSpace** | 折叠连续空格；默认为 `true`。从 v3.13.0 起，还会遵循换行，并可为 `<pre>` 插入 `<br>`。 |
| **onRevert** | 实例恢复时的回调。 |

**提示：** 只拆分会被动画处理的内容（例如，如果只对单词做动画，则跳过字符拆分）。对于自定义字体，请在字体加载完成后再拆分（例如 `document.fonts.ready.then(...)`），或者使用 **autoSplit: true** 和 **onSplit()**。为了避免拆分字符时字距发生偏移，请使用 CSS `font-kerning: none; text-rendering: optimizeSpeed;`。避免使用 `text-wrap: balance`；它可能会干扰拆分。SplitText 不支持 SVG `<text>`。

**了解更多：** [SplitText](https://gsap.com/docs/v3/Plugins/SplitText/)

### ScrambleText

使用扰乱/故障效果为文本添加动画。适用于通过扰乱效果显示文本或在文本之间进行过渡。

```javascript
gsap.registerPlugin(ScrambleTextPlugin);

gsap.to(".text", {
  duration: 1,
  scrambleText: { text: "New message", chars: "01", revealDelay: 0.5 }
});
```

## SVG

### DrawSVG（DrawSVGPlugin）

通过为 `stroke-dashoffset` / `stroke-dasharray` 添加动画来显示或隐藏 SVG 元素的描边。适用于 `<path>`、`<line>`、`<polyline>`、`<polygon>`、`<rect>`、`<ellipse>`。用于“绘制”或“擦除”描边。

**drawSVG 值：** 描述描边沿路径的**可见区段**（起始位置和结束位置），而不是“随时间从 A 动画到 B”。格式为以百分比或长度表示的 `"start end"`。示例：`"0% 100%"` = 完整描边；`"20% 80%"` = 仅显示 20% 到 80% 之间的描边（两端留有空隙）。补间动画会从元素的**当前**区段动画到**目标**区段——例如，`gsap.to("#path", { drawSVG: "0% 100%" })` 会从其当前状态动画到完整描边。单个值（例如 `0`、`"100%"`）表示起始位置为 0：`"100%"` 等同于 `"0% 100%"`。

**必要条件：** 元素必须具有可见描边——请在 CSS 中或通过 SVG 属性设置 `stroke` 和 `stroke-width`；否则不会绘制任何内容。

```javascript
gsap.registerPlugin(DrawSVGPlugin);

// draw from nothing to full stroke
gsap.from("#path", { duration: 1, drawSVG: 0 });
// or explicit segment: from 0–0 to 0–100%
gsap.fromTo("#path", { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 1 });
// stroke only in the middle (gaps at ends)
gsap.to("#path", { duration: 1, drawSVG: "20% 80%" });
```

**注意事项：** 仅影响描边（不影响填充）。建议使用单区段 `<path>` 元素；多区段路径在某些浏览器中可能会出现异常渲染。无法从视觉上更改 `<use>` 的内容。**DrawSVGPlugin.getLength(element)** 和 **DrawSVGPlugin.getPosition(element)** 分别返回描边长度和当前位置。

**了解更多：** [DrawSVG](https://gsap.com/docs/v3/Plugins/DrawSVGPlugin)

### MorphSVG（MorphSVGPlugin）

通过为 `d` 属性（路径数据）添加动画，将一个 SVG 形状变形为另一个形状。起始形状和结束形状不需要具有相同数量的点——MorphSVG 会将它们转换为三次贝塞尔曲线，并根据需要添加点。适用于图标之间的变形、形状过渡或基于路径的动画。支持 `<path>`、`<polyline>` 和 `<polygon>`；`<circle>`、`<rect>`、`<ellipse>` 和 `<line>` 会在内部进行转换，也可以通过 **MorphSVGPlugin.convertToPath(selector | element)** 进行转换（将 DOM 中的元素替换为 `<path>`）。

**morphSVG 值：** 可以是**选择器**（例如 `"#lightning"`）、**元素**、**原始路径数据**（例如 `"M47.1,0.8 73.3,0.8..."`），对于 polygon/polyline，也可以是**点字符串**（例如 `"240,220 240,70 70,70 70,220"`）。如需完整配置，请使用**对象形式**，其中只有 **shape** 是必需属性。

```javascript
gsap.registerPlugin(MorphSVGPlugin);

// convert primitives to path first if needed:
MorphSVGPlugin.convertToPath("circle, rect, ellipse, line");

gsap.to("#diamond", { duration: 1, morphSVG: "#lightning", ease: "power2.inOut" });
// object form:
gsap.to("#diamond", {
  duration: 1,
  morphSVG: { shape: "#lightning", type: "rotational", shapeIndex: 2 }
});

```

**MorphSVG — 关键配置（morphSVG 对象）：**

| 选项 | 说明 |
|--------|-------------|
| **shape** | _（必需。）_ 目标形状：选择器、元素或原始路径字符串。 |
| **type** | `"linear"`（默认）或 `"rotational"`。旋转方式使用角度/长度插值，可以避免变形过程中出现折角；当线性方式效果不正确时可以尝试使用。 |
| **map** | 线段的匹配方式：`"size"`（默认）、`"position"` 或 `"complexity"`。当起始与结束线段无法对齐时使用；如果都不起作用，请拆分为多条路径并分别进行变形。 |
| **shapeIndex** | 对起始路径中的哪个点映射到结束路径中的第一个点进行偏移（避免形状“交叉”或反转）。单线段路径使用数字；多线段路径使用**数组**（例如 `[5, 1, -8]`）。负值会反转相应线段。使用一次 **shapeIndex: "log"** 来记录自动计算出的值，然后将该数字/数组粘贴到补间动画中。**findShapeIndex(start, end)**（独立工具）提供交互式 UI，用于查找合适的值。仅适用于闭合路径。 |
| **smooth** | （v3.14+）。添加平滑点。可以是数字（例如 `80`）、`"auto"` 或对象：`{ points: 40 \| "auto", redraw: true \| false, persist: true \| false }`。`redraw: false` 会保留原始锚点（完全保真，但间距不够均匀）。`persist: false` 会在补间动画结束时移除添加的点。当默认变形效果呈锯齿状或不自然时使用。 |
| **curveMode** | 布尔值（v3.14+）。对控制手柄的角度/长度进行插值，而不是对原始 x/y 值进行插值，以避免曲线上出现折角。如果变形过程中出现折角，可以尝试启用。 |
| **origin** | **type: "rotational"** 的旋转原点。字符串：`"50% 50%"`（默认），或使用 `"20% 60%, 35% 90%"` 为起始和结束状态设置不同的原点。 |
| **precision** | 输出路径数据的小数位数；默认值为 `2`。 |
| **precompile** | 预计算路径字符串的数组（也可以使用一次 **precompile: "log"**，然后从控制台复制）。跳过开销较大的启动计算；适用于非常复杂的变形。仅适用于 `<path>`（请先转换 polygon/polyline）。 |
| **render** | 每次更新时调用的函数(rawPath, target)——例如绘制到 canvas。RawPath 是线段数组（每条线段 = 由交替排列的 x、y 三次贝塞尔坐标组成的数组）。 |
| **updateTarget** | 使用 **render** 时（例如仅使用 canvas），请设置 **updateTarget: false**，这样原始 `<path>` 就不会被更新。**MorphSVGPlugin.defaultUpdateTarget** 用于设置默认值。 |

**实用工具：** **MorphSVGPlugin.convertToPath(selector | element)** 可将 DOM 中的 circle/rect/ellipse/line/polygon/polyline 转换为 `<path>`。**MorphSVGPlugin.rawPathToString(rawPath)** 和 **stringToRawPath(d)** 可在路径字符串与原始数组之间进行转换。该插件会在目标上存储原始的 `d`（例如，要补间回原始形状，可使用 `morphSVG: "#originalId"` 或同一元素）。

**提示：** 对于扭曲或反转的变形，请设置 **shapeIndex**（使用 `"log"` 或 findShapeIndex()）。对于多段路径，**shapeIndex** 是一个数组（每段对应一个值）。仅当第一帧较慢时才进行预编译；它无法解决补间期间的卡顿问题（如有需要，请简化 SVG 或减小尺寸）。

**了解更多：** [MorphSVG](https://gsap.com/docs/v3/Plugins/MorphSVGPlugin)

### 运动路径（MotionPathPlugin）

使元素沿 SVG 路径运动。适用于沿路径（例如曲线或自定义路线）移动对象。

```javascript
gsap.registerPlugin(MotionPathPlugin);

gsap.to(".dot", {
  duration: 2,
  motionPath: { path: "#path", align: "#path", alignOrigin: [0.5, 0.5] }
});
```

**MotionPath — 关键配置（motionPath 对象）：**

| 选项 | 描述 |
|--------|-------------|
| `path` | SVG 路径元素、选择器或路径数据字符串 |
| `align` | 用于对齐目标的路径元素或选择器 |
| `alignOrigin` | `[x, y]` 原点（0–1）；默认为 `[0.5, 0.5]` |
| `autoRotate` | 旋转元素，使其跟随路径切线 |
| `curviness` | 0–2；路径平滑度 |

### MotionPathHelper

MotionPath 的可视化编辑器（对齐、偏移）。在开发期间用于调整路径对齐。

```javascript
gsap.registerPlugin(MotionPathPlugin, MotionPathHelperPlugin);

const helper = MotionPathHelper.create(".dot", "#path", { end: 0.5 });
// adjust in UI, then use helper.path or helper.getProgress() in your animation
```

## 缓动

### CustomEase

自定义缓动曲线（三次贝塞尔曲线或 SVG 路径）。适用于内置缓动无法满足需求的情况。gsap-core 中已涵盖基本用法；使用时请进行注册：

```javascript
gsap.registerPlugin(CustomEase);
const ease = CustomEase.create("name", ".17,.67,.83,.67");
gsap.to(".el", { x: 100, ease: ease, duration: 1 });
```

### EasePack

添加更多具名缓动（例如 SlowMo、RoughEase、ExpoScaleEase）。注册后，在补间中使用这些缓动名称。

### CustomWiggle

摆动/抖动缓动。适用于值需要“摆动”（多次振荡）的情况。

### CustomBounce

可配置强度的弹跳式缓动。

## 物理效果

### Physics2D（Physics2DPlugin）

二维物理效果（速度、角度、重力）。适用于通过简单物理效果制作动画（例如抛射物、弹跳）。

```javascript
gsap.registerPlugin(Physics2DPlugin);

gsap.to(".ball", {
  duration: 2,
  physics2D: {
    velocity: 250,
    angle: 80,
    gravity: 500
  }
});
```

### PhysicsProps（PhysicsPropsPlugin）

将物理效果应用于属性值。适用于由物理效果驱动的属性动画。

```javascript
gsap.registerPlugin(PhysicsPropsPlugin);

gsap.to(".obj", {
  duration: 2,
  physicsProps: {
    x: { velocity: 100, end: 300 },
    y: { velocity: -50, acceleration: 200 }
  }
});
```

## 开发

### GSDevTools

用于拖动浏览时间轴、切换动画以及调试的 UI。仅在开发期间使用；请勿随产品发布。注册后，使用时间轴引用创建一个实例。

```javascript
gsap.registerPlugin(GSDevTools);
GSDevTools.create({ animation: tl });
```

## 其他

### Pixi (PixiPlugin)

将 GSAP 与 PixiJS 集成，用于为 Pixi 显示对象添加动画。使用 GSAP 为 Pixi 对象添加动画时，请注册此插件。

```javascript
gsap.registerPlugin(PixiPlugin);

const sprite = new PIXI.Sprite(texture);
gsap.to(sprite, { pixi: { x: 200, y: 100, scale: 1.5 }, duration: 1 });
```

## 最佳实践

- ✅ 首次使用前，通过 **gsap.registerPlugin()** 注册所用的每个插件。
- ✅ 对于布局过渡，请使用 **Flip.getState()** → 更改 DOM → **Flip.from()**；对于带惯性的拖动，请使用 **Draggable** + **InertiaPlugin**。
- ✅ 当组件卸载或元素被移除时，恢复插件实例（例如 `SplitTextInstance.revert()`）。

## 禁止事项

- ❌ 未事先注册插件（**gsap.registerPlugin()**），就不得在补间动画或 API 中使用该插件。
- ❌ 请勿将 GSDevTools 或仅供开发使用的插件发布到生产环境。

### 了解更多

https://gsap.com/docs/v3/Plugins/