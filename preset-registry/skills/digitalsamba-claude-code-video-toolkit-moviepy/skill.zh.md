---
name: moviepy
description: Python video composition with moviepy 2.x — overlaying deterministic text on AI-generated video (LTX-2, SadTalker), compositing clips, single-file build.py video projects. Use when adding labels/captions/lower-thirds to LTX-2 or SadTalker outputs, building short ad-style spots in pure Python without Remotion, or doing programmatic video composition. Triggers include text overlay on video, label LTX-2 clip, caption SadTalker output, lower third, build.py video, moviepy, Python video composition, sub-30s ad spot.
---
# 用于视频制作的 moviepy

moviepy 是该工具包中用于**在 AI 生成的视频上叠加确定性文本**的首选库，也适合在不使用 Remotion 工具链的情况下构建简短、单文件的 Python 视频项目。

其更深层的原则是**可信文本**：在任何文本*必须*清晰可读、准确且一致的类型中（无论出于法律、编辑还是商业原因），由 AI 渲染的画面内文本都是不可接受的，而使用 moviepy 进行叠加处理则是自然的解决方案。姓名的拼写必须正确。价格必须准确。来源标注必须达到像素级精确。AI 生成模型无法保证做到这些。

## 何时使用 moviepy，何时使用 Remotion

| 在以下情况中使用 moviepy… | 在以下情况中使用 Remotion… |
|----------------------------|-----------------------------|
| 在 LTX-2 或 SadTalker 输出上叠加文本/标签 | 构建长篇迭代评审或产品演示 |
| 在单个 `build.py` 中构建 30 秒以内的广告风格短片 | 多模板、多品牌、设计密集型工作 |
| 合成数据驱动的视觉内容（matplotlib `FuncAnimation` → mp4） | 任何需要 React 组件或复用设计系统的内容 |
| 对现有视频文件进行一次性转换 | 任何重视项目生命周期（规划 → 渲染）的工作 |
| 希望完全不使用 Node.js，也不承担 React 的认知负担 | 希望在 Remotion Studio 中获得热重载预览 |

本技能涉及的所有内容都有两个可运行的参考示例，位于 `examples/` 中：

- **`examples/quick-spot/build.py`** — 15 秒广告风格短片。音频锚定时间线、文本叠加、可选旁白和自动压低音量的音乐。无需任何外部资源，开箱即可渲染无声视频。
- **`examples/data-viz-chart/build.py`** — 带有确定性标题和来源标注的动画时间序列图表。展示 matplotlib（数据）与 moviepy（可信文本）之间的分工。

两者都可通过 `python3 build.py` 运行，并立即生成真实的 `out.mp4`。请将它们与本技能文档对照阅读——下文中的每一种模式都在这些示例中展示了可正常运行的实现。

**依赖项。** `moviepy`、`Pillow` 和 `matplotlib` 已在 `tools/requirements.txt` 中声明，可通过该工具包的一行 Python 安装命令进行安装：`python3 -m pip install -r tools/requirements.txt`。如果运行示例时遇到 `Missing dependency`，请从仓库根目录运行该命令——示例中的 `build.py` 文件也会在错误消息中给出相同提示，并正常退出，而不是直接打印未处理的回溯信息。

## 主要用例：在 AI 生成的视频上叠加文本

LTX-2 和 SadTalker 输出的都只是纯视觉内容：

- **LTX-2** 无法可靠地渲染可读文本（模型会臆造字形——请参阅 ltx2 技能中的“Bad Prompts”）。
- **SadTalker** 输出的是不带字幕、标签、下三分之一字幕条或上下文信息的说话头像。

解决方法是先生成干净的视觉内容，再使用 moviepy 以确定性的方式在其上合成文本。这是该工具包中的标准模式：

```python
from moviepy import VideoFileClip, ImageClip, CompositeVideoClip

# 1. AI-generated visual (LTX-2 or SadTalker output)
bg = VideoFileClip("lugh_ltx.mp4").without_audio()

# 2. Text rendered via PIL → ImageClip (see "Text rendering" below)
title = (
    ImageClip("text_cache/intro_title.png")
    .with_duration(2.0)
    .with_start(0.5)
    .with_position(("center", 880))
)

# 3. Composite
final = CompositeVideoClip([bg, title], size=(1920, 1080))
final.write_videofile("lugh_with_caption.mp4", fps=30, codec="libx264")
```

常见形式如下：

| 形式 | LTX-2 用法 | SadTalker 用法 |
|-------|-----------|---------------|
| 主画面上的标题卡 | 在电影感的 LTX-2 补充镜头上叠加“隆重推出 LONGARM” | n/a |
| 下三分之一字幕 / 姓名条 | n/a | 在讲话者画面下方显示“Lugh — 古代战神” |
| 引语字幕 | 在 LTX-2 角色客串画面上叠加“我要回家了。” | 同样叠加在 SadTalker 讲话者画面上 |
| 品牌署名 | 在最后一秒淡入徽标 + URL | 同上 |
| 用于增强对比度的着色叠加层 | 在文字后方添加深海军蓝半透明图层 | 同上 |

## 最适合采用这种方式的视频类型

“AI 视觉画面 + 确定性文字叠加”模式是多种视频风格的自然制作流程。如果请求符合以下任一类型，默认使用 moviepy：

| 类型 | 叠加的内容 | 为什么 moviepy 是正确选择 |
|-------|------------------|-------------------------------|
| **新闻 / 讲话者新闻报道** | 讲话者姓名条、地点栏、突发新闻横幅、来源署名、重点引语 | 姓名拼写必须正确（涉及编辑规范 / 法律要求）。这是数量最多的类别。 |
| **纪录片片段** | 受访者下三分之一字幕、章节标题、档案来源说明、地点标记 | 与新闻具有相同的可信度要求。 |
| **预告片 / 宣传短片** | 标题卡、演职员信息叠加（“来自……的导演”）、日期闪现、引语卡、行动号召 | 时序必须精准、文字密集，每一帧都至关重要。`q2-townhall-longarm-ad` 示例正是这种类型。 |
| **社交媒体短视频（Reels、TikTok、Shorts）** | 逐字准确的字幕，供静音观看；话题标签叠加 | 大多数社交媒体视频都是静音观看的；字幕不可或缺。 |
| **带标注的产品演示** | 在屏幕录制画面上叠加价格提示、功能标签、“点击此处”指示、前后对比标签 | 价格和产品名称必须准确无误。 |
| **教程 / 解说视频** | 步骤编号叠加、终端命令字幕、键盘快捷键提示 | 步骤编号必须连续，命令必须可以直接复制粘贴。 |

其他同样适用但相对少见的类型：音乐视频（歌词叠加）、反应视频（来源署名）、体育赛事回顾（比分叠加）、房地产看房视频（价格 / 平方英尺）、会议演讲（讲者 + 议题信息条）。

**对于完整的 SRT 驱动字幕制作**（长视频、带时间码、多语言），moviepy 虽然可用，但并非理想选择——应使用带有 `subtitles` 滤镜的 `ffmpeg`，或专用字幕工具。moviepy 最适合手动放置叠加内容，而不是批量字幕轨道。

## 文字渲染——使用 PIL，而不是 `TextClip`

**关键陷阱：**moviepy 2.x 的 `TextClip(method='label')` 存在紧边界框错误，会**裁切字母的上伸部和下伸部**（大写字母的顶部，以及 g/p/y 的尾部）。在 Apple Silicon 上，你会看到字符边缘像被切掉一样，却可能花上数小时也意识不到问题所在。

**解决方法：**通过 PIL 将文字渲染成透明 PNG，然后将其作为 `ImageClip` 加载。按内容哈希缓存结果，这样重新构建就无需重复渲染。

```python
import hashlib
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

def render_text_png(txt, size, hex_color, cache_dir="./text_cache"):
    cache = Path(cache_dir); cache.mkdir(parents=True, exist_ok=True)
    key = hashlib.sha1(f"{txt}|{size}|{hex_color}".encode()).hexdigest()[:16]
    path = cache / f"{key}.png"
    if path.exists():
        return str(path)

    font = ImageFont.truetype(ARIAL_BOLD, size)
    bbox = ImageDraw.Draw(Image.new("RGBA", (1, 1))).textbbox((0, 0), txt, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad = max(20, size // 4)

    img = Image.new("RGBA", (tw + pad * 2, th + pad * 2), (0, 0, 0, 0))
    rgb = tuple(int(hex_color.lstrip("#")[i:i+2], 16) for i in (0, 2, 4))
    ImageDraw.Draw(img).text((pad - bbox[0], pad - bbox[1]), txt, font=font, fill=(*rgb, 255))
    img.save(path)
    return str(path)
```

完整的辅助函数（包含用于粗体、位置、淡入淡出和更简洁易用接口的 kwargs）位于 `examples/quick-spot/build.py` 中——请直接复制使用，而不要重新实现。

## 音频锚定时间线模式

对于每一帧都至关重要的广告式剪辑，请先为每个场景生成 VO，然后将每个视觉元素锚定到已知的绝对时间戳。这样可以彻底消除时序漂移。完整模式请参阅 **CLAUDE.md → 视频时序 → 音频锚定时间线**。简要版本如下：

```python
# Audio-anchored timeline (25s):
#   Scene 1 tired      0.3 → 3.74  (audio 3.44s)
#   Scene 2 worries    4.0 → 8.88  (audio 4.88s)

text_clip("TIRED OF",     start=0.5,  duration=1.2)
text_clip("THIRD-PARTY",  start=1.0,  duration=1.8)
vo_clip("01_tired.mp3",   start=0.3)
vo_clip("02_worries.mp3", start=4.0)
```

## 常用方案

### 在单个 AI 生成的视频片段上添加文本

```python
from moviepy import VideoFileClip, ImageClip, CompositeVideoClip

bg = VideoFileClip("ltx_hero.mp4").without_audio()
caption = (
    ImageClip(render_text_png("THE FUTURE OF AGENTS", 140, "#FFFFFF"))
    .with_duration(bg.duration)
    .with_position(("center", 880))
)
CompositeVideoClip([bg, caption], size=bg.size).write_videofile("captioned.mp4", fps=30)
```

### 在 SadTalker 说话头像上添加下三分之一字幕条

```python
from moviepy import VideoFileClip, ImageClip, ColorClip, CompositeVideoClip

talking = VideoFileClip("narrator_sadtalker.mp4")
W, H = talking.size

# Semi-transparent bar across the bottom for contrast
bar = (
    ColorClip((W, 140), color=(20, 24, 38))
    .with_duration(talking.duration)
    .with_opacity(0.75)
    .with_position(("center", H - 160))
)
name = (
    ImageClip(render_text_png("LUGH", 72, "#F06859"))
    .with_duration(talking.duration)
    .with_position((80, H - 150))
)
title = (
    ImageClip(render_text_png("Ancient Warrior God", 36, "#FFFFFF"))
    .with_duration(talking.duration)
    .with_position((80, H - 80))
)
CompositeVideoClip([talking, bar, name, title]).write_videofile("with_lower_third.mp4", fps=30)
```

### 使用着色叠加层增强复杂画面上的文本对比度

LTX-2 的补充镜头通常在视觉上过于复杂，导致文本难以辨认。可在视频和文本之间添加一层半透明的海军蓝图层：

```python
from moviepy import ColorClip

tint = (
    ColorClip((W, H), color=(20, 24, 38))
    .with_duration(duration)
    .with_opacity(0.55)
)
# Composite order: bg → tint → text
CompositeVideoClip([bg, tint, text_clip])
```

### 并排合成

```python
from moviepy import VideoFileClip, CompositeVideoClip, ColorClip

left  = VideoFileClip("demo_a.mp4").resized(width=960).with_position((  0, "center"))
right = VideoFileClip("demo_b.mp4").resized(width=960).with_position((960, "center"))
bg    = ColorClip((1920, 1080), color=(0, 0, 0)).with_duration(max(left.duration, right.duration))
CompositeVideoClip([bg, left, right]).write_videofile("split.mp4", fps=30)
```

### 将各场景的 VO 与降低音量的音乐混合

```python
from moviepy import AudioFileClip, CompositeAudioClip
from moviepy.audio.fx.MultiplyVolume import MultiplyVolume
from moviepy.audio.fx.AudioFadeIn import AudioFadeIn
from moviepy.audio.fx.AudioFadeOut import AudioFadeOut

music = AudioFileClip("music.mp3").with_effects([
    MultiplyVolume(0.22),  # duck under VO
    AudioFadeIn(0.5),
    AudioFadeOut(1.5),
])
vo = [
    AudioFileClip(f"scenes/0{i}.mp3").with_effects([MultiplyVolume(1.15)]).with_start(start)
    for i, start in [(1, 0.3), (2, 4.0), (3, 9.1)]
]
final_audio = CompositeAudioClip([music] + vo)
```

## 注意事项

- **moviepy 2.x 重命名了方法。** 请使用 `subclipped`（而不是 `subclip`）、`with_duration` / `with_start` / `with_position`（而不是 `set_duration` 等），并使用 `with_effects([...])` 替代 `.fadein()`/`.fadeout()`。网上许多教程仍在使用 1.x 语法，请谨慎辨别。
- **`TextClip(method='label')` 会裁剪字母的上伸部和下伸部。** 请始终使用上文中的 PIL 变通方案。
- **`OffthreadVideo` 仅适用于 Remotion。** moviepy 使用 `VideoFileClip`。不要混用两者。
- **调整尺寸需要 Pillow ≥ 10.0**，以支持 LANCZOS 重采样。如果遇到 `ANTIALIAS` 错误，请升级 Pillow。
- **`ColorClip` 接受 RGB 元组，而不是十六进制字符串。** 请使用 `(20, 24, 38)`，而不是 `"#141826"`。
- **默认情况下，`VideoFileClip` 会加载音频。** 如果只需要画面，请调用 `.without_audio()`——在 `CompositeAudioClip` 中混入不需要的音频，会导致旁白音轨在没有提示的情况下丢失。
- **务必在 `CompositeVideoClip` 上设置 `size=(W, H)`。** 如果不设置，输出尺寸将取决于第一个剪辑，而它可能小于目标尺寸。

## 何时使用哪种工具

| 任务 | 工具 |
|------|------|
| 为静态图像添加动画 | `tools/ltx2.py --input` |
| 基于写实肖像生成口播人物 | `tools/sadtalker.py` |
| 基于风格化角色生成口播人物 | `tools/ltx2.py --input`（参见 ltx2 skill） |
| **为上述任一内容添加标签、字幕或下三分之一字幕条** | **moviepy + PIL（本 skill）** |
| 转换、压缩现有文件或调整其尺寸 | `ffmpeg`（参见 ffmpeg skill） |
| 长篇、由设计系统驱动的视频 | Remotion（参见 remotion skill） |

## 参考资料

- 可运行示例——短篇广告风格视频：`examples/quick-spot/build.py`
- 可运行示例——带文本叠加的数据可视化：`examples/data-viz-chart/build.py`
- 音频锚定时间线：`CLAUDE.md → Video Timing → Audio-Anchored Timelines`
- 相关 skill：`ltx2`、`ffmpeg`、`remotion`