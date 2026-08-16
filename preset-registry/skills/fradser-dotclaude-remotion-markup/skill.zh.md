---
name: remotion-markup
description: Best practices for writing Remotion React Markup
metadata:
  tags: remotion, react, markup
---
这是编写 Remotion React 标记的指南。
如果此指南不适用，请改为加载 [Remotion 最佳实践](../remotion-best-practices/SKILL.md)。

## 通用规则

使用 `useCurrentFrame()` 和 `interpolate()` 为属性添加动画。

优先使用 `interpolate()`，而不是 `spring()`。

使用 `Easing.bezier()` 自定义动画时序，包括跳跃或过冲运动。
如果需要弹簧动画，请使用 `Easing.spring()`

在 Studio 中适合设为可交互的 HTML 元素应使用 `Interactive`：`<div>` -> `<Interactive.Div>`。  
为 `Interactive`、`Solid`、`Sequence` 设置描述性的 `name` 属性，例如 `name="Hero title"`。

```tsx
import { useCurrentFrame, Easing, interpolate, Interactive } from "remotion";

export const FadeIn = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Title"
      style={{
        opacity: interpolate(frame, [0, 60], [0, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      Hello World!
    </Interactive.Div>
  );
};
```

将 `interpolate()` 调用以内联方式保留在 `style` 属性中。
优先使用 `scale`、`translate`、`rotate` CSS 属性，而不是 `transform`。

```tsx
// 👍 Inline editable keyframes and transform shorthands
style={{
  scale: interpolate(frame, [0, 100], [0, 1]),
  translate: interpolate(frame, [0, 100], ["0px 0px", "100px 100px"]),
  rotate: interpolate(frame, [0, 100], ["20deg", "90deg"]),
}}

// 👎 Hidden values and transform strings become harder to edit in Studio
const scale = interpolate(frame, [0, 100], [0, 1]);

style={{
  transform: `scale(${scale})`,
}}
```

禁止使用 CSS 过渡或动画——它们无法正确渲染。  
禁止使用 Tailwind 动画类名——它们无法正确渲染。

将资源放在项目根目录下的 `public/` 文件夹中。

使用 `staticFile()` 引用 `public/` 文件夹中的文件。

使用 `@remotion/media` 添加视频和音频。  
使用 `<Img>` 组件添加图像。
对于 `public/` 中的文件，使用 `staticFile()`；也可以直接传入远程 URL：

```tsx
import { Audio, Video } from "@remotion/media";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return (
    <>
      <Video src={staticFile("video.mp4")} style={{ opacity: 0.5 }} />
      <Audio src={staticFile("audio.mp3")} />
      <Img src={staticFile("logo.png")} style={{ width: 100, height: 100 }} />
      <Video src="https://remotion.media/video.mp4" />
    </>
  );
};
```

如需延迟显示内容，请将其包裹在 `<Sequence>` 中并使用 `from`。
如需限制元素的持续时间，请使用 `<Sequence>` 的 `durationInFrames`。
默认情况下，`<Sequence>` 会以绝对定位方式填满整个场景。  
对于行内内容，请使用 `layout="none"`。

```tsx
const Main = () => {
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill>
      <Sequence name="Background">
        <Background />
      </Sequence>
      <Sequence name="Title" from={30} durationInFrames={60} layout="none">
        <Title />
      </Sequence>
      <Sequence name="Subtitle" from={60} durationInFrames={60} layout="none">
        <Subtitle />
      </Sequence>
    </AbsoluteFill>
  );
}

export const Title = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        opacity: interpolate(frame, [0, 60], [0, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      Title
    </div>
  );
};

export const Subtitle = () => {
  return <div>Subtitle</div>;
};
```

## 地图

有关如何在简单静态地图、Mapbox 地图和 MapLibre 地图之间进行选择，请参阅 [map.md](map.md)。

## 旁白

有关如何使用 ElevenLabs TTS 为 Remotion 合成添加 AI 生成的旁白，请参阅 [voiceover.md](voiceover.md)。

## 裁剪

有关裁剪模式（剪除动画的开头或结尾），请参阅 [trimming.md](trimming.md)。

## 嵌入视频

有关嵌入视频的进阶知识（裁剪、音量、速度、循环、音高），请参阅 [embedding-videos.md](embedding-videos.md)。

## 嵌入音频

有关裁剪、音量、速度、音高等进阶音频功能，请参阅 [audio.md](audio.md)。

## 转场

有关场景转场模式，请参阅 [transitions.md](transitions.md)。

## 视觉和像素效果

创建视觉效果时，优先选择：1. 常规的 Remotion/HTML/CSS/SVG/filter/blend/mask 动画；2. 通过 [effects.md](effects.md) 使用列出的效果，包括通过 `<HtmlInCanvas>` 渲染的 HTML；3. 当用户要求可复用或项目专用的效果时，通过 [effects.md](effects.md) 使用自定义 `createEffect()`；4. 仅在没有合适效果时，通过 [html-in-canvas.md](html-in-canvas.md) 使用自定义 `<HtmlInCanvas onPaint>`。

有关漏光叠加层，请参阅 [light-leaks.md](light-leaks.md)。文档：https://www.remotion.dev/docs/effects

可用效果：`brightness()`、`contrast()`、`colorKey()`、`duotone()`、`grayscale()`、`hue()`、`invert()`、`saturation()`、`tint()`、`linearGradient()`、`linearGradientTint()`、`thermalVision()`、`blur()`、`linearProgressiveBlur()`、`radialProgressiveBlur()`、`zoomBlur()`、`dropShadow()`、`glow()`、`lightTrail()`、`evolve()`、`venetianBlinds()`、`mirror()`、`scale()`、`uvTranslate()`、`xyTranslate()`、`barrelDistortion()`、`chromaticAberration()`、`fisheye()`、`cornerPin()`、`wave()`、`burlap()`、`emboss()`、`dotGrid()`、`halftone()`、`noise()`、`noiseDisplacement()`、`paper()`、`roughenEdges()`、`pattern()`、`pixelate()`、`pixelDissolve()`、`scanlines()`、`speckle()`、`shine()`、`shrinkwrap()`、`vignette()`、`contourLines()`、`checkerboard()`、`halftoneLinearGradient()`、`gridlines()`、`whiteNoise()`、`tvSignalOff()`、`lines()`、`rings()`、`waves()`、`zigzag()`、`lightLeak()`、`starburst()`。

## 3D 内容

有关如何使用 Three.js 和 React Three Fiber 在 Remotion 中创建 3D 内容，请参阅 [3d.md](3d.md)。

## 音效

需要使用音效时，请加载 [./sfx.md](./sfx.md) 文件以获取更多信息。

## 音频可视化

需要将音频可视化（频谱条、波形、低音响应效果）时，请加载 [./audio-visualization.md](./audio-visualization.md) 文件以获取更多信息。

## 字幕

处理字幕时，请加载 [Remotion Captions](../remotion-captions/SKILL.md) skill 以获取更多信息。

## Google Fonts

这是在 Remotion 中加载字体的推荐方式。有关如何加载 Google Fonts，请参阅 [google-fonts.md](google-fonts.md)。

## 本地字体

有关如何加载本地字体，请参阅 [local-fonts.md](local-fonts.md)。

## GIF

有关如何显示与 Remotion 时间轴同步的 GIF，请参阅 [gifs.md](gifs.md)。

## 高级图像

有关图像尺寸和定位、动态图像路径以及获取图像尺寸的信息，请参阅 [images.md](images.md)。

## Lottie 动画

有关在 Remotion 中嵌入 Lottie 动画的信息，请参阅 [lottie.md](lottie.md)。

## 高级时间控制

有关使用 `interpolate`、贝塞尔缓动和弹簧实现高级时间控制的信息，请参阅 [timing.md](timing.md)。

## 参数化视频

有关通过添加 Zod schema 使合成可参数化的信息，请参阅 [parameters.md](parameters.md)。

## 测量 DOM 节点

有关在 Remotion 中测量 DOM 元素尺寸的信息，请参阅 [measuring-dom-nodes.md](measuring-dom-nodes.md)。

## 测量文本

有关测量文本尺寸、使文本适应容器以及检查溢出的信息，请参阅 [measuring-text.md](measuring-text.md)。

## 使用 FFmpeg

对于某些视频操作，例如裁剪视频或检测静音，应使用 FFmpeg。加载 [./ffmpeg.md](./ffmpeg.md) 文件以获取更多信息。

## 静音检测

需要检测并裁剪视频或音频文件中的静音片段时，请加载 [./silence-detection.md](./silence-detection.md) 文件。

## 动态时长、尺寸和数据

有关动态设置合成的时长、尺寸和 props 的信息，请参阅 [calculate-metadata.md](calculate-metadata.md)。

## 高级合成

有关如何定义静态图、文件夹、默认 props 以及如何嵌套合成的信息，请参阅 [compositions.md](compositions.md)。

## 高级序列编排

有关更多序列编排模式（延迟、裁剪、限制项目时长）的信息，请参阅 [sequencing.md](sequencing.md)。

## 安装模块

使用 `npx remotion add` 添加版本正确的新软件包：

```
npx remotion add @remotion/media
```

这适用于 `@remotion/*` 软件包、`mediabunny`、`@mediabunny/*` 和 `zod`。

## 预览标记内容

仅当你认为用户希望查看预览时才执行此操作。

```bash
npx remotion studio --no-open
```

这将启动一个长期运行的进程，并输出用于预览的服务器 URL。  
如果该进程已经启动，则会输出 URL。

## 可选：单帧渲染检查

你可以使用 CLI 渲染单个帧，以快速检查布局、颜色或时间控制是否合理。  
对于简单编辑、纯重构，或者已经通过 Studio 或之前的渲染获得足够信心时，请跳过此步骤。

```bash
npx remotion still [composition-id] --scale=0.25 --frame=30
```

在 30 fps 下，`--frame=30` 对应一秒处（`--frame` 从零开始计数）。