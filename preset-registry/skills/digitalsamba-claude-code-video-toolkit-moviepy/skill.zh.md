---
name: moviepy
description: Python video composition with moviepy 2.x — overlaying deterministic text on AI-generated video (LTX-2, SadTalker), compositing clips, single-file build.py video projects. Use when adding labels/captions/lower-thirds to LTX-2 or SadTalker outputs, building short ad-style spots in pure Python without Remotion, or doing programmatic video composition. Triggers include text overlay on video, label LTX-2 clip, caption SadTalker output, lower third, build.py video, moviepy, Python video composition, sub-30s ad spot.
---
# 用于视频制作的 moviepy

moviepy 是该工具包首选的库，用于**在 AI 生成的视频上叠加确定性的文本**，以及在不使用 Remotion 工具链的情况下构建短小的单文件 Python 视频项目。

更深层的原则是**值得信赖的文本**：任何必须确保文本*可读、准确且一致*的类型（无论出于法律、编辑还是商业原因），都不适合使用 AI 在画面中渲染文本，而应自然地采用 moviepy 叠加步骤来解决。姓名必须拼写正确。价格必须准确无误。来源署名必须做到像素级精确。AI 生成模型无法保证这些要求。

## 何时使用 moviepy，何时使用 Remotion

| 在以下情况下使用 moviepy…… | 在以下情况下使用 Remotion…… |
|-------------------|---------------------|
| 在 LTX-2 或 SadTalker 的输出上叠加文本/标签 | 构建长篇 sprint review 或产品演示 |
| 在单个 `build.py` 中构建时长少于 30 秒的广告风格短片 | 多模板、多品牌、设计密集型工作 |
| 合成数据驱动的视觉内容（matplotlib `FuncAnimation` → mp4） | 任何需要 React 组件或设计系统复用的场景 |
| 对现有视频文件进行一次性转换 | 任何需要关注项目生命周期（规划 → 渲染）的场景 |
| 希望完全不使用 Node.js / 不承担 React 的心智负担 | 希望在 Remotion Studio 中使用热重载预览 |

该 skill 的所有内容都在 `examples/` 中提供了两个可运行的参考示例：

- **`examples/quick-spot/build.py`** — 15 秒的广告风格短片。基于音频的时间线、文本叠加、可选的 VO + 闪避处理后的音乐。无需任何外部资源即可直接渲染出无声视频。
- **`examples/data-viz-chart/build.py`** — 带有确定性标题和来源署名的动画时间序列图表。演示 matplotlib（数据）+ moviepy（值得信赖的文本）的分工。

两者都可以通过 `uv run build.py` 运行，并立即生成真正的 `out.mp4`。请结合本 skill 阅读这些示例——下面的每一种模式都在那里展示了实际用法。

**依赖项。** `moviepy`、`Pillow` 和 `matplotlib` 已在根目录的 `pyproject.toml` 中声明，并通过工具包提供的一行式 Python 设置命令 `uv sync` 安装。如果运行示例时遇到 `Missing dependency`，请从仓库根目录运行该命令——示例中的 `build.py` 文件也会在错误消息中告诉你相同的信息，并在干净退出时避免打印一段无提示的 traceback。

## 主要使用场景：在 AI 生成的视频上添加文本

LTX-2 和 SadTalker 的输出都是没有文字的纯视觉内容：

- **LTX-2** 无法可靠地渲染可读文本（模型会幻觉式地产生字形——参见 ltx2 skill 中的“糟糕的提示词”）。
- **SadTalker** 输出的是没有字幕、标签、下三分之一字幕或上下文信息的说话人头像。

解决方法是先干净地生成视觉内容，然后使用 moviepy 以确定性的方式将文本合成到其上。这是该工具包中的规范模式：

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

常见的应用形式：

| 形式 | LTX-2 用法 | SadTalker 用法 |
|-------|-----------|---------------|
| 英雄镜头上的标题卡 | 在电影感的 LTX-2 B-roll 上叠加“LONGARM 隆重推出” | 不适用 |
| 下三分之一字幕 / 姓名牌 | 不适用 | 在人物头像下方显示“Lugh——古代战神” |
| 引语字幕 | 在 LTX-2 角色客串镜头上叠加“我要回家了。” | 同上，叠加在 SadTalker 人物头像上 |
| 品牌署名 | 在最后一秒叠加淡入的 Logo + URL | 同上 |
| 用于增强对比度的着色叠层 | 在文字后方添加深海军蓝半透明图层 | 同上 |

## 尤其适合的类型

“AI 视觉内容 + 确定性文字叠加”模式是多种视频风格的自然制作流程。如果请求符合以下某种类型，默认使用 moviepy：

| 类型 | 叠加内容 | 为什么 moviepy 是正确选择 |
|-------|------------------|-------------------------------|
| **新闻 / 人物访谈式新闻** | 演讲者姓名牌、地点栏、突发新闻横幅、来源署名、引语 | 姓名必须拼写正确（涉及编辑和法律要求）。按数量计算，这是最大的类别。 |
| **纪录片片段** | 受访者下三分之一字幕、章节标题、档案来源署名、地点标记 | 与新闻相同的信任要求。 |
| **预告片 / 宣传短片** | 标题卡、演职员信息叠加（“来自……导演”）、日期闪现、引语卡片、CTA | 时间安排紧凑、文字密集，每一帧都很重要。`q2-townhall-longarm-ad` 示例正是这种情况。 |
| **社交媒体短视频（Reels、TikTok、Shorts）** | 适合静音观看的逐字准确字幕、主题标签叠加 | 大多数社交媒体视频观看时没有声音；字幕是必需的。 |
| **带注释的产品演示** | 价格提示、功能标签、屏幕录制上的“点击此处”指示、前后对比标签 | 价格和产品名称必须准确。 |
| **教程 / 讲解视频** | 步骤编号叠加、终端命令字幕、键盘快捷键提示 | 步骤编号必须连续，命令必须可以复制粘贴。 |

较少见但确实适用的场景：音乐视频（歌词叠加）、反应视频（来源署名）、体育集锦（比分叠加）、房产参观视频（价格 / 平方英尺）、会议演讲（演讲者 + 场次信息牌）。

**对于完整的 SRT 驱动字幕**（长视频、带时间码、多语言），moviepy 可以使用，但并非理想选择——应使用带有 `subtitles` filter 的 `ffmpeg`，或专用字幕工具。moviepy 最适合手动放置的叠加内容，而不是批量字幕轨道。

## 文字渲染——使用 PIL，而不是 `TextClip`

**关键陷阱：**moviepy 2.x 的 `TextClip(method='label')` 存在紧致边界框 bug，会**裁剪字母的上伸部和下伸部**（大写字母的顶部，以及 g/p/y 的尾部）。在 Apple Silicon 上，你会看到字符边缘被切掉，却可能花上数小时都没意识到问题所在。

**解决方法：**通过 PIL 将文字渲染为透明 PNG，然后将其加载为 `ImageClip`。根据内容哈希缓存结果，这样重新构建时无需重复处理。

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

完整的辅助函数（支持用于加粗、位置、淡入淡出以及更简洁易用性的 kwargs）位于 `examples/quick-spot/build.py` 中——请直接复制使用，不要重新实现。

## 以音频为锚点的时间线模式

对于每一帧都至关重要的广告风格剪辑，先为每个场景生成 VO，再将所有视觉元素锚定到已知的绝对时间戳上。这样可以彻底消除时间漂移。完整模式请参阅 **CLAUDE.md → Video Timing → Audio-Anchored Timelines**。简要版本如下：

```python
# Audio-anchored timeline (25s):
#   Scene 1 tired      0.3 → 3.74  (audio 3.44s)
#   Scene 2 worries    4.0 → 8.88  (audio 4.88s)

text_clip("TIRED OF",     start=0.5,  duration=1.2)
text_clip("THIRD-PARTY",  start=1.0,  duration=1.8)
vo_clip("01_tired.mp3",   start=0.3)
vo_clip("02_worries.mp3", start=4.0)
```

## 常见配方

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

### 在 SadTalker 头像视频上添加下三分之一字幕

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

### 在繁杂画面上为文本添加有色叠加层以增强对比度

LTX-2 的 B-roll 通常画面过于繁杂，难以保证文本清晰易读。在视频和文本之间添加一个半透明的海军蓝图层：

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

### 将每个场景的 VO 与经过压低处理的音乐混音

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

## 易错点

- **moviepy 2.x 重命名了方法。** 使用 `subclipped`（而不是 `subclip`）、`with_duration` / `with_start` / `with_position`（而不是 `set_duration` 等），使用 `with_effects([...])` 代替 `.fadein()`/`.fadeout()`。网上很多教程仍然展示 1.x 语法——请谨慎甄别。
- **`TextClip(method='label')` 会裁剪字母的上伸部和下伸部。** 始终使用上文的 PIL 变通方案。
- **`OffthreadVideo` 仅适用于 Remotion。** moviepy 使用 `VideoFileClip`。不要混用二者。
- **调整大小需要 Pillow ≥ 10.0** 才能使用 LANCZOS 重采样。如果看到 `ANTIALIAS` 错误，请升级 Pillow。
- **`ColorClip` 接受 RGB 元组，而不是十六进制字符串。** 使用 `(20, 24, 38)`，不要使用 `"#141826"`。
- **`VideoFileClip` 默认会加载音频。** 如果只需要画面，请调用 `.without_audio()`——在 `CompositeAudioClip` 中合成不需要的音频会导致静默 VO 丢失。
- **始终在 `CompositeVideoClip` 上设置 `size=(W, H)`。** 如果不设置，输出尺寸会跟随第一个片段，而该片段的尺寸可能小于你的目标尺寸。

## 何时使用什么

| 任务 | 工具 |
|------|------|
| 为静态图像添加动画 | `tools/ltx2.py --input` |
| 根据写实肖像生成会说话的人像 | `tools/sadtalker.py` |
| 根据风格化角色生成会说话的人像 | `tools/ltx2.py --input`（参见 ltx2 skill） |
| **为上述任一内容添加标签/字幕/下三分之一字幕** | **moviepy + PIL（本 skill）** |
| 转换 / 压缩 / 调整现有文件大小 | `ffmpeg`（参见 ffmpeg skill） |
| 长篇、由设计系统驱动的视频 | Remotion（参见 remotion skill） |

## 参考资料

- 可运行示例——短广告风格片段：`examples/quick-spot/build.py`
- 可运行示例——带文字叠加的数据可视化：`examples/data-viz-chart/build.py`
- 以音频为锚点的时间线：`CLAUDE.md → Video Timing → Audio-Anchored Timelines`
- 相关 skills：`ltx2`、`ffmpeg`、`remotion`