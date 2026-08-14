---
name: promo-director
description: Generates 15-second vertical promo videos for social media from mastered audio. Use after mastering is complete and before release, when the user wants social media content.
model: sonnet
effort: low
prerequisites:
  - mastering-engineer
  - album-art-director
allowed-tools:
  - Read
  - Bash
  - Glob
  - bitwize-music-mcp
requirements:
  external:
    - name: ffmpeg
      purpose: Video generation and audio visualization
      install: "brew install ffmpeg (macOS) or apt install ffmpeg (Linux)"
      notes: "Requires showwaves, showfreqs, drawtext, gblur filters"
  python:
    - pillow
    - librosa
    - pyyaml
---
# 宣传片导演 Skill

根据母带音频生成专业的社交媒体宣传视频。创建针对 Instagram Reels、Twitter 和 TikTok 优化的 15 秒竖屏视频（9:16，1080x1920）。

## 用途

音频母带制作完成后，生成包含以下元素的宣传视频：
- 专辑封面
- 音频波形可视化（提供 9 种样式）
- 曲目标题 + 艺术家名称
- 从封面中自动提取的配色方案
- 智能片段选择（查找能量最强的 15 秒）

## 何时使用

- 母带制作完成后、发行前
- 用户说“生成宣传视频”或“为 [album] 创建宣传视频”
- 专辑的母带音频和封面均已准备就绪时

## 工作流中的位置

```
Generate → Master → **[Promo Videos]** → Release
```

这是 mastering-engineer 与 release-director 之间的可选步骤。

## 工作流

### 1. 设置验证

**检查 ffmpeg：**
```bash
ffmpeg -filters | grep showwaves
```

所需滤镜：`showwaves`、`showfreqs`、`drawtext`、`gblur`

如果缺失：
```
Error: ffmpeg not found or missing required filters

Install ffmpeg:
  macOS: brew install ffmpeg
  Linux: apt install ffmpeg

After installing, run this command again.
```

**检查 Python 依赖项：**

调用 `get_python_command()` 验证 venv 是否存在。如果 `venv_exists` 为 false，则显示警告并建议使用 `/bitwize-music:setup`。

### 2. 专辑检测

**通过 MCP 解析音频路径：**

调用 `resolve_path("audio", album_slug)`——返回包含艺术家文件夹在内的完整音频目录路径。

结果示例：`~/bitwize-music/audio/artists/bitwize/albums/electronic/sample-album/`

**验证内容：**
- ✓ 母带音频文件（.wav、.mp3、.flac、.m4a）
- ✓ 专辑封面（album.png 或 album.jpg）

如果缺少封面：
```
Error: No album artwork found in {audio_root}/artists/{artist}/albums/{genre}/{album}/

Expected: album.png or album.jpg

Options:
  1. Use /bitwize-music:import-art to place artwork
  2. Specify path manually: --artwork /path/to/art.png

Which option?
```

### 3. 用户偏好设置

**首先检查配置默认值：**

从 `~/.bitwize-music/config.yaml` 中读取 `promotion` 部分以获取默认值：
- `promotion.default_style` - 默认可视化样式
- `promotion.duration` - 默认片段时长
- `promotion.include_sampler` - 是否默认生成专辑试听合辑
- `promotion.sampler_clip_duration` - 试听合辑中每首曲目的秒数

如果配置部分不存在，则使用内置默认值（pulse、15 秒、启用试听合辑、每个片段 12 秒）。

**询问：要生成什么？**

选项（默认值取自配置，或为“both”）：
1. 单曲宣传视频（每个 15 秒）+ 专辑试听合辑（所有曲目）
2. 仅生成单曲宣传视频
3. 仅生成专辑试听合辑

**询问：使用哪种可视化样式？**

默认值取自 `promotion.default_style`；如果未设置，则为 `pulse`。

| 样式 | 最适合 | 描述 |
|-------|----------|-------------|
| `pulse` | 电子、嘻哈 | 带有强烈辉光的示波器/心电图样式（默认） |
| `bars` | 流行、摇滚 | 快速响应的频谱条 |
| `line` | 原声、民谣 | 经典简洁的波形 |
| `mirror` | 氛围、驰放 | 具有对称效果的镜像波形 |
| `mountains` | EDM、重低音音乐 | 双声道频谱（外观类似山脉） |
| `colorwave` | 独立、另类 | 带有微妙辉光的简洁波形 |
| `neon` | 合成器浪潮、80 年代风格 | 带有强烈霓虹辉光的锐利波形 |
| `dual` | 实验音乐 | 两个独立波形（主色 + 互补色） |
| `circular` | 抽象、实验音乐 | 矢量示波器（狂野的圆形图案） |

**默认建议：**
- 电子乐/嘻哈 → `pulse`
- 摇滚/流行 → `bars`
- 民谣/原声 → `line`
- 氛围/舒缓 → `mirror`

**询问：是否自定义时长？**

默认：15 秒（最适合 Instagram/Twitter）

选项：
- 15 秒（推荐，Instagram Reels 的最佳时长）
- 30 秒（较长的预览）
- 60 秒（完整片段，较少使用）

**对于采样集：**

默认：每首曲目 12 秒

计算总时长：
```
Total duration = (tracks * clip_duration) - ((tracks - 1) * crossfade)
Twitter limit: 140 seconds
```

如果超过 140 秒：
```
WARNING: Expected duration {duration}s exceeds Twitter limit (140s)

Recommendation: Reduce --clip-duration to {140 / tracks}s
```

### 4. 生成

**单曲宣传视频：**

```
generate_promo_videos(album_slug, style="pulse", duration=15)
```

**仅生成单首曲目：**
```
generate_promo_videos(album_slug, style="pulse", track_filename="01-track-name.wav")
```

**专辑采样集：**

```
generate_album_sampler(album_slug, clip_duration=12, crossfade=0.5)
```

**处理错误：**

常见问题：
- **ffmpeg 滤镜错误** → 检查 ffmpeg 安装是否包含滤镜
- **找不到字体** → 安装 dejavu 字体或指定自定义字体
- **封面提取失败** → 使用默认的青色配色方案
- **librosa 不可用** → 回退到曲目 20% 处进行片段选择
- **音频文件损坏** → 跳过该曲目，报告问题，然后继续处理其他曲目

### 5. 结果摘要

**报告已生成的文件：**

```
## Promo Videos Generated

**Location:** {audio_root}/artists/{artist}/albums/{genre}/{album}/

**Individual Track Promos:**
- {audio_root}/artists/{artist}/albums/{genre}/{album}/promo_videos/
- 10 videos generated
- Format: 1080x1920 (9:16), H.264, 15s each
- Style: pulse
- File size: ~10-12 MB per video

**Album Sampler:**
- {audio_root}/artists/{artist}/albums/{genre}/{album}/album_sampler.mp4
- Duration: 114.5s (under Twitter 140s limit ✓)
- Format: 1080x1920 (9:16), H.264
- File size: 45.2 MB

**Next Steps:**
1. Review videos: Open promo_videos/ folder
2. Test on phone: Transfer one video and verify quality
3. Populate social copy: Fill in promo/ templates (twitter.md, instagram.md, etc.)
4. [Optional] Upload to cloud: /bitwize-music:cloud-uploader {album}
5. Ready for release workflow: /bitwize-music:release-director {album}
```


## 技术参考

请参阅 [technical-reference.md](technical-reference.md)，了解：
- 输出规格（分辨率、格式、比特率）
- 可视化样式（pulse、bars、line 等）
- 平台兼容性（Instagram、Twitter、TikTok）
- 依赖项（必需和可选）
- 常见问题排查