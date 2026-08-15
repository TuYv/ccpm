---
name: remotion-best-practices
description: Best practices for Remotion - Video creation in React
metadata:
  tags: remotion, video, react, animation, composition
---
## 何时使用

每当你处理 Remotion 代码时，都应使用此技能来获取领域特定知识。

## 新项目设置

当处于空文件夹或工作区，且其中没有现有的 Remotion 项目时，使用以下命令搭建项目：

```bash
npx create-video@latest --yes --blank --no-tailwind my-video
```

将 `my-video` 替换为合适的项目名称。

## 设计视频

使用 `useCurrentFrame()` 和 `interpolate()` 为属性添加动画。使用 Easing 自定义动画的时间变化。

```tsx
import { useCurrentFrame, Easing } from "remotion";

export const FadeIn = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return <div style={{ opacity }}>Hello World!</div>;
};
```

禁止使用 CSS 过渡或动画——它们无法正确渲染。  
禁止使用 Tailwind 动画类名——它们无法正确渲染。

将资源放置在项目根目录的 `public/` 文件夹中。

使用 `staticFile()` 引用 `public/` 文件夹中的文件。

使用 `<Img>` 组件添加图像：

```tsx
import { Img, staticFile } from "remotion";

export const MyComposition = () => {
  return <Img src={staticFile("logo.png")} style={{ width: 100, height: 100 }} />;
};
```

使用 `@remotion/media` 中的 `<Video>` 组件添加视频：

```tsx
import { Video } from "@remotion/media";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <Video src={staticFile("video.mp4")} style={{ opacity: 0.5 }} />;
};
```

使用 `@remotion/media` 中的 `<Audio>` 组件添加音频：

```tsx
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <Audio src={staticFile("audio.mp3")} />;
};
```

也可以通过远程 URL 引用资源：

```tsx
import { Video } from "@remotion/media";

export const MyComposition = () => {
  return <Video src="https://remotion.media/video.mp4" />
};
```

要延迟显示内容，请将其包装在 `<Sequence>` 中并使用 `from`。
要限制元素的持续时间，请使用 `<Sequence>` 的 `durationInFrames`。
`<Sequence>` 默认采用绝对定位填充。对于行内内容，请使用 `layout="none"`。

```tsx
import { Sequence } from "remotion";

export const Title = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return <div style={{ opacity }}>Title</div>;
};

export const Subtitle = () => {
  return <div>Subtitle</div>;
};

const Main = () => {
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill>
      <Sequence>
        <Background />
      </Sequence>
      <Sequence from={1 * fps} durationInFrames={2 * fps} layout="none">
        <Title />
      </Sequence>
      <Sequence from={2 * fps} durationInFrames={2 * fps} layout="none">
        <Subtitle />
      </Sequence>
    </AbsoluteFill>
  );
}
```

视频的宽度、高度、fps 和时长在 `src/Root.tsx` 中定义：

```tsx
import { Composition } from "remotion";
import { MyComposition } from "./MyComposition";

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComposition}
      durationInFrames={100}
      fps={30}
      width={1080}
      height={1080}
    />
  );
};
```

元数据也可以动态计算：

```tsx
import { Composition, CalculateMetadataFunction } from "remotion";
import { MyComposition, MyCompositionProps } from "./MyComposition";

const calculateMetadata: CalculateMetadataFunction<
  MyCompositionProps
> = async ({ props, abortSignal }) => {
  const data = await fetch(`https://api.example.com/video/${props.videoId}`, {
    signal: abortSignal,
  }).then((res) => res.json());

  return {
    durationInFrames: Math.ceil(data.duration * 30),
    props: {
      ...props,
      videoUrl: data.url,
    },
    width: 1080,
    height: 1080,
  };
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComposition}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{ videoId: "abc123" }}
      calculateMetadata={calculateMetadata}
    />
  );
};
```

## 启动预览

启动 Remotion Studio 以预览视频：

```bash
npx remotion studio
```

## 可选：单帧渲染检查

你可以使用 CLI 渲染单帧，以快速检查布局、颜色或时间设置是否合理。  
对于简单编辑、纯重构，或者你已经通过 Studio 或之前的渲染结果获得足够信心时，可以跳过此步骤。

```bash
npx remotion still [composition-id] --scale=0.25 --frame=30
```

在 30 fps 下，`--frame=30` 对应一秒处（`--frame` 从零开始计数）。

## 字幕

处理字幕时，请加载 [./rules/subtitles.md](./rules/subtitles.md) 文件以获取更多信息。

## 使用 FFmpeg

对于某些视频操作，例如裁剪视频或检测静音，应使用 FFmpeg。请加载 [./rules/ffmpeg.md](./rules/ffmpeg.md) 文件以获取更多信息。

## 静音检测

需要检测并裁剪视频或音频文件中的静音片段时，请加载 [./rules/silence-detection.md](./rules/silence-detection.md) 文件。

## 音频可视化

需要将音频可视化（频谱条、波形、低音响应效果）时，请加载 [./rules/audio-visualization.md](./rules/audio-visualization.md) 文件以获取更多信息。

## 音效

需要使用音效时，请加载 [./rules/sfx.md](./rules/sfx.md) 文件以获取更多信息。

## 3D 内容

有关在 Remotion 中使用 Three.js 和 React Three Fiber 创建 3D 内容的信息，请参阅 [rules/3d.md](rules/3d.md)。

## 高级音频

有关裁剪、音量、速度、音高等高级音频功能，请参阅 [rules/audio.md](rules/audio.md)。

## 动态时长、尺寸和数据

有关动态设置合成的时长、尺寸和 props，请参阅 [rules/calculate-metadata.md](rules/calculate-metadata.md)。

## 高级合成

有关如何定义静态画面、文件夹、默认 props 以及如何嵌套合成，请参阅 [rules/compositions.md](rules/compositions.md)。

## Google Fonts

这是在 Remotion 中加载字体的推荐方式。有关如何加载 Google Fonts，请参阅 [rules/google-fonts.md](rules/google-fonts.md)。

## 本地字体

有关如何加载本地字体，请参阅 [rules/local-fonts.md](rules/local-fonts.md)。

## 获取音频时长

有关如何使用 Mediabunny 获取音频文件的时长（以秒为单位），请参阅 [rules/get-audio-duration.md](rules/get-audio-duration.md)。

## 获取视频尺寸

有关如何使用 Mediabunny 获取视频文件的宽度和高度，请参阅 [rules/get-video-dimensions.md](rules/get-video-dimensions.md)。

## 获取视频时长

有关如何使用 Mediabunny 获取视频文件的时长（以秒为单位），请参阅 [rules/get-video-duration.md](rules/get-video-duration.md)。

## GIF

有关如何显示与 Remotion 时间轴同步的 GIF，请参阅 [rules/gifs.md](rules/gifs.md)。

## 高级图像

有关图像的尺寸调整和定位、动态图像路径以及获取图像尺寸，请参阅 [rules/images.md](rules/images.md)。

## 漏光

有关使用 `@remotion/light-leaks` 实现漏光叠加效果，请参阅 [rules/light-leaks.md](rules/light-leaks.md)。

## Lottie 动画

有关在 Remotion 中嵌入 Lottie 动画，请参阅 [rules/lottie.md](rules/lottie.md)。

## canvas 中的 HTML

如果需要将 HTML 渲染到 `<canvas>` 中，以便通过 `<HtmlInCanvas>` 应用 2D 或 WebGL 效果，请参阅 [rules/html-in-canvas.md](rules/html-in-canvas.md)。

## 测量 DOM 节点

有关在 Remotion 中测量 DOM 元素尺寸，请参阅 [rules/measuring-dom-nodes.md](rules/measuring-dom-nodes.md)。

## 测量文本

有关测量文本尺寸、使文本适应容器以及检查溢出，请参阅 [rules/measuring-text.md](rules/measuring-text.md)。

## 高级序列编排

有关更多序列编排模式——延迟、裁剪、限制项目时长，请参阅 [rules/sequencing.md](rules/sequencing.md)。

## TailwindCSS

有关在 Remotion 中使用 TailwindCSS，请参阅 [rules/tailwind.md](rules/tailwind.md)。

## 文本动画

有关排版和文本动画模式，请参阅 [rules/text-animations.md](rules/text-animations.md)。

## 高级时序

有关使用 `interpolate`、贝塞尔缓动和弹簧的高级时序，请参阅 [rules/timing.md](rules/timing.md)。

## 转场

有关场景转场模式，请参阅 [rules/transitions.md](rules/transitions.md)。

## 透明视频

有关渲染带透明度的视频，请参阅 [rules/transparent-videos.md](rules/transparent-videos.md)。

## 裁剪

有关裁剪模式——剪除动画的开头或结尾，请参阅 [rules/trimming.md](rules/trimming.md)。

## 高级视频

有关嵌入视频的高级知识——裁剪、音量、速度、循环和音高，请参阅 [rules/videos.md](rules/videos.md)。

## 参数化视频

有关通过添加 Zod schema 使合成可参数化，请参阅 [rules/parameters.md](rules/parameters.md)。

## 地图

对于仅含少量飞越效果的简单地图，请考虑使用静态地图图像。
对于包含动画路线或飞越效果的复杂地图，请加载地图规则：[rules/maplibre.md](rules/maplibre.md)

## 旁白

有关使用 ElevenLabs TTS 为 Remotion 合成添加 AI 生成旁白的方法，请参阅 [rules/voiceover.md](rules/voiceover.md)。