---
name: pydub-automation
description: "Automate repetitive audio tasks with Python using PyDub for batch processing, format conversion, normalization, and content assembly. Use when: Processing large numbers of audio files consistently; Converting between audio formats at scale; Normalizing loudness across a batch of files; Assembling intros/outros automatically to episodes; Trimming silence or extracting segments programmatically"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# PyDub 音频自动化

> 使用 Python 和 PyDub 自动执行重复性音频任务，包括批量处理、格式转换、标准化和内容组装。

## 何时使用此技能

- 以一致的方式处理大量音频文件
- 大规模转换音频格式
- 对一批文件进行响度标准化
- 自动为节目添加片头和片尾
- 以编程方式修剪静音或提取片段
- 为内容制作构建音频流水线

## 方法论基础

**来源**：PyDub 库（James Robert）+ Python 音频处理

**核心原则**：“手动处理需要数小时的音频操作，通过代码几分钟即可完成。”PyDub 提供了一个抽象 FFmpeg 复杂性的高级接口，让非音频工程师也能轻松完成常见操作。

**为何重要**：定期制作播客、课程或视频内容的内容团队，会在重复性音频任务上花费大量时间。自动化能够在规模化处理时确保质量一致，同时让人们腾出时间从事创意工作。


## Claude 执行的工作与需要你决定的事项

| Claude 执行的工作 | 需要你决定的事项 |
|-------------|------------|
| 构建制作工作流 | 最终创意方向 |
| 建议技术方案 | 设备和工具选择 |
| 创建模板和检查清单 | 质量标准 |
| 识别最佳实践 | 品牌/声音风格决策 |
| 生成脚本大纲 | 最终脚本审批 |

## 此技能的功能

1. **批量处理音频文件** - 对数百个文件应用相同的操作
2. **转换格式** - MP3、WAV、FLAC、OGG 等
3. **标准化响度** - 确保各期节目之间的音量一致
4. **组装内容** - 拼接片头、正文和片尾
5. **提取片段** - 以编程方式修剪、拆分和切割音频

## 使用方法

### 生成处理脚本
```
Help me write a PyDub script to [describe task].
Input files: [format, location]
Output requirements: [format, specs]
```

### 创建批处理工作流
```
Create a Python script that processes all audio files in a folder:
- Input: [source folder, file type]
- Operations: [what to do]
- Output: [destination, naming convention]
```

### 调试音频脚本
```
This PyDub script isn't working as expected:
[paste code]
Expected: [what you want]
Actual: [what's happening]
```

## 操作说明

使用 PyDub 自动处理音频时，请遵循以下方法：

### 第 1 步：设置和前置条件

```python
## Installation

# Install PyDub
pip install pydub

# FFmpeg is required (PyDub uses it under the hood)
# macOS:
brew install ffmpeg

# Ubuntu/Debian:
sudo apt-get install ffmpeg

# Windows:
# Download from ffmpeg.org, add to PATH
```

```python
## Basic Imports

from pydub import AudioSegment
from pydub.effects import normalize, compress_dynamic_range
from pydub.silence import detect_silence, split_on_silence
import os
from pathlib import Path
```

---

### 第 2 步：核心操作

```python
## Loading and Saving Audio

# Load audio file (format auto-detected from extension)
audio = AudioSegment.from_file("input.mp3")
audio = AudioSegment.from_file("input.wav", format="wav")

# Save audio file
audio.export("output.mp3", format="mp3", bitrate="192k")
audio.export("output.wav", format="wav")

# Export with metadata
audio.export(
    "output.mp3",
    format="mp3",
    bitrate="192k",
    tags={"artist": "Brand Name", "album": "Podcast"}
)
```

```python
## Basic Properties

print(f"Duration: {len(audio)} ms")
print(f"Channels: {audio.channels}")
print(f"Frame rate: {audio.frame_rate} Hz")
print(f"Sample width: {audio.sample_width} bytes")
print(f"dBFS: {audio.dBFS}")  # Volume level
```

---

### 第 3 步：音量与标准化

```python
## Volume Adjustments

# Increase volume by 6 dB
louder = audio + 6

# Decrease volume by 3 dB
quieter = audio - 3

# Normalize to target level (0 dB = maximum)
normalized = normalize(audio)

# Normalize to specific headroom
def normalize_to_target(audio, target_dBFS=-16):
    """Normalize audio to target loudness."""
    change_in_dBFS = target_dBFS - audio.dBFS
    return audio.apply_gain(change_in_dBFS)

normalized = normalize_to_target(audio, target_dBFS=-16)
```

```python
## Batch Normalization

def normalize_folder(input_dir, output_dir, target_dBFS=-16):
    """Normalize all audio files in a folder."""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    for file in input_path.glob("*.mp3"):
        audio = AudioSegment.from_file(file)
        normalized = normalize_to_target(audio, target_dBFS)

        output_file = output_path / file.name
        normalized.export(output_file, format="mp3", bitrate="192k")
        print(f"Processed: {file.name}")

# Usage
normalize_folder("raw_episodes/", "processed_episodes/", target_dBFS=-16)
```

---

### 第 4 步：拼接与组装

```python
## Basic Concatenation

intro = AudioSegment.from_file("intro.mp3")
content = AudioSegment.from_file("episode.mp3")
outro = AudioSegment.from_file("outro.mp3")

# Concatenate (+ operator)
full_episode = intro + content + outro

# Add silence between segments
silence = AudioSegment.silent(duration=2000)  # 2 seconds
full_episode = intro + silence + content + silence + outro

full_episode.export("final_episode.mp3", format="mp3")
```

```python
## Podcast Assembly Script

def assemble_episode(
    content_file,
    intro_file="assets/intro.mp3",
    outro_file="assets/outro.mp3",
    output_file=None,
    intro_fade_ms=500,
    outro_fade_ms=500
):
    """
    Assemble podcast episode with intro and outro.
    Includes crossfade for professional sound.
    """
    intro = AudioSegment.from_file(intro_file)
    content = AudioSegment.from_file(content_file)
    outro = AudioSegment.from_file(outro_file)

    # Apply fade out to intro, fade in to content
    intro = intro.fade_out(intro_fade_ms)
    content = content.fade_in(intro_fade_ms).fade_out(outro_fade_ms)
    outro = outro.fade_in(outro_fade_ms)

    # Crossfade join
    episode = intro.append(content, crossfade=intro_fade_ms)
    episode = episode.append(outro, crossfade=outro_fade_ms)

    # Generate output filename if not provided
    if output_file is None:
        output_file = content_file.replace(".mp3", "_final.mp3")

    episode.export(output_file, format="mp3", bitrate="192k")
    print(f"Assembled: {output_file} ({len(episode)/1000:.1f}s)")
    return output_file

# Usage
assemble_episode("episode_042_raw.mp3")
```

---

### 步骤 5：裁剪和分割

```python
## Time-Based Trimming

# Extract segment (milliseconds)
# audio[start:end]
first_30_seconds = audio[:30000]
last_minute = audio[-60000:]
middle_section = audio[60000:120000]

# Remove first 5 seconds (skip intro)
without_intro = audio[5000:]
```

```python
## Silence-Based Operations

from pydub.silence import detect_silence, split_on_silence

# Detect silence regions
# Returns list of [start, end] in milliseconds
silence_ranges = detect_silence(
    audio,
    min_silence_len=1000,  # Minimum 1 second silence
    silence_thresh=-40     # dB threshold for "silence"
)

# Split on silence (useful for chapter markers)
chunks = split_on_silence(
    audio,
    min_silence_len=500,
    silence_thresh=-40,
    keep_silence=250  # Keep 250ms of silence on each side
)

# Export chunks
for i, chunk in enumerate(chunks):
    chunk.export(f"segment_{i:03d}.mp3", format="mp3")
```

```python
## Trim Silence from Start/End

def trim_silence(audio, silence_thresh=-50, chunk_size=10):
    """Remove silence from beginning and end of audio."""

    # Find first non-silent moment
    start_trim = 0
    for i in range(0, len(audio), chunk_size):
        if audio[i:i+chunk_size].dBFS > silence_thresh:
            start_trim = max(0, i - 100)  # Keep 100ms before
            break

    # Find last non-silent moment
    end_trim = len(audio)
    for i in range(len(audio), 0, -chunk_size):
        if audio[i-chunk_size:i].dBFS > silence_thresh:
            end_trim = min(len(audio), i + 100)  # Keep 100ms after
            break

    return audio[start_trim:end_trim]
```

---

### 步骤 6：格式转换

```python
## Batch Format Conversion

def convert_folder(input_dir, output_dir, output_format="mp3", **export_kwargs):
    """
    Convert all audio files to specified format.

    Example kwargs for MP3:
        bitrate="192k"
    Example kwargs for WAV:
        parameters=["-ac", "1"]  # mono
    """
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    # Supported input formats
    extensions = ["*.mp3", "*.wav", "*.flac", "*.ogg", "*.m4a"]

    for ext in extensions:
        for file in input_path.glob(ext):
            audio = AudioSegment.from_file(file)

            output_file = output_path / f"{file.stem}.{output_format}"
            audio.export(output_file, format=output_format, **export_kwargs)
            print(f"Converted: {file.name} → {output_file.name}")

# Usage: Convert WAVs to MP3
convert_folder("recordings/", "mp3_output/", output_format="mp3", bitrate="192k")

# Usage: Convert to mono WAV
convert_folder("stereo/", "mono/", output_format="wav", parameters=["-ac", "1"])
```

---

### 步骤 7：完整流程示例

```python
## Full Podcast Processing Pipeline

from pydub import AudioSegment
from pydub.effects import normalize
from pathlib import Path
import json
from datetime import datetime

class PodcastProcessor:
    """
    Complete podcast processing pipeline.

    Operations:
    1. Normalize loudness
    2. Trim silence
    3. Add intro/outro
    4. Export with metadata
    """

    def __init__(self, config_file="podcast_config.json"):
        with open(config_file) as f:
            self.config = json.load(f)

        self.intro = AudioSegment.from_file(self.config["intro_file"])
        self.outro = AudioSegment.from_file(self.config["outro_file"])

    def process_episode(self, input_file, episode_number, title):
        """Process a single episode through the full pipeline."""

        print(f"Processing Episode {episode_number}: {title}")

        # 1. Load and normalize
        audio = AudioSegment.from_file(input_file)
        target_db = self.config.get("target_loudness", -16)
        audio = self._normalize_to_target(audio, target_db)
        print(f"  ✓ Normalized to {target_db} dBFS")

        # 2. Trim silence
        audio = self._trim_silence(audio)
        print(f"  ✓ Trimmed silence (duration: {len(audio)/1000:.1f}s)")

        # 3. Add intro/outro with crossfade
        fade_ms = self.config.get("crossfade_ms", 500)
        intro = self.intro.fade_out(fade_ms)
        outro = self.outro.fade_in(fade_ms)
        audio = audio.fade_in(fade_ms).fade_out(fade_ms)

        final = intro.append(audio, crossfade=fade_ms)
        final = final.append(outro, crossfade=fade_ms)
        print(f"  ✓ Added intro/outro (total: {len(final)/1000:.1f}s)")

        # 4. Export with metadata
        output_dir = Path(self.config["output_dir"])
        output_dir.mkdir(exist_ok=True)

        filename = f"episode_{episode_number:03d}.mp3"
        output_path = output_dir / filename

        final.export(
            output_path,
            format="mp3",
            bitrate=self.config.get("bitrate", "192k"),
            tags={
                "title": f"Episode {episode_number}: {title}",
                "artist": self.config["podcast_name"],
                "album": self.config["podcast_name"],
                "track": episode_number,
                "date": datetime.now().strftime("%Y"),
            }
        )
        print(f"  ✓ Exported: {output_path}")

        return output_path

    def _normalize_to_target(self, audio, target_dBFS):
        change = target_dBFS - audio.dBFS
        return audio.apply_gain(change)

    def _trim_silence(self, audio, threshold=-50):
        # Simple trim - just first/last 100ms chunks
        chunk_size = 100
        start = 0
        for i in range(0, min(5000, len(audio)), chunk_size):
            if audio[i:i+chunk_size].dBFS > threshold:
                start = max(0, i - 100)
                break

        end = len(audio)
        for i in range(len(audio), max(0, len(audio)-5000), -chunk_size):
            if audio[i-chunk_size:i].dBFS > threshold:
                end = min(len(audio), i + 100)
                break

        return audio[start:end]


# Example config file (podcast_config.json):
"""
{
    "podcast_name": "Marketing Mastery",
    "intro_file": "assets/intro.mp3",
    "outro_file": "assets/outro.mp3",
    "output_dir": "processed_episodes/",
    "target_loudness": -16,
    "crossfade_ms": 500,
    "bitrate": "192k"
}
"""

# Usage:
# processor = PodcastProcessor("podcast_config.json")
# processor.process_episode("raw/ep42.mp3", 42, "The Power of Audio")
```

## 示例

### 示例 1：批量标准化播客待处理内容

**背景**：50 期播客的响度级别不一致。

**输入**：
> 编写一个脚本，将我 episodes/ 文件夹中的所有 MP3 文件标准化到 -16 LUFS，并将原始文件保留为备份。

**输出**：

```python
#!/usr/bin/env python3
"""
Batch normalize podcast episodes to -16 dBFS.
Creates backups before processing.
"""

from pydub import AudioSegment
from pathlib import Path
import shutil

def batch_normalize(
    input_dir: str,
    target_dBFS: float = -16,
    create_backup: bool = True
):
    """
    Normalize all MP3 files in directory to target loudness.

    Args:
        input_dir: Folder containing MP3 files
        target_dBFS: Target loudness level
        create_backup: If True, saves originals to backup/ folder
    """
    input_path = Path(input_dir)

    # Create backup folder if needed
    if create_backup:
        backup_path = input_path / "backup"
        backup_path.mkdir(exist_ok=True)

    # Find all MP3 files
    mp3_files = list(input_path.glob("*.mp3"))
    print(f"Found {len(mp3_files)} MP3 files")

    for i, file in enumerate(mp3_files, 1):
        print(f"\n[{i}/{len(mp3_files)}] Processing: {file.name}")

        # Backup original
        if create_backup:
            shutil.copy(file, backup_path / file.name)

        # Load and check current level
        audio = AudioSegment.from_file(file)
        original_dBFS = audio.dBFS
        print(f"  Original level: {original_dBFS:.1f} dBFS")

        # Calculate adjustment needed
        adjustment = target_dBFS - original_dBFS

        if abs(adjustment) < 0.5:
            print(f"  Already at target, skipping")
            continue

        # Apply normalization
        normalized = audio.apply_gain(adjustment)

        # Export (overwrite original)
        normalized.export(file, format="mp3", bitrate="192k")
        print(f"  Normalized: {original_dBFS:.1f} → {target_dBFS} dBFS")

    print(f"\n✓ Complete! Processed {len(mp3_files)} files")
    if create_backup:
        print(f"  Backups saved to: {backup_path}")


if __name__ == "__main__":
    import sys

    input_dir = sys.argv[1] if len(sys.argv) > 1 else "episodes/"
    batch_normalize(input_dir, target_dBFS=-16)
```

**用法**：
```bash
python normalize_episodes.py episodes/
```

---

### 示例 2：自动为新节目添加片头和片尾

**背景**：每周播客需要为每段新录音添加片头和片尾。

**输入**：
> 创建一个脚本，用于监视文件夹中的新录音，并自动添加我的标准片头和片尾。

**输出**：

```python
#!/usr/bin/env python3
"""
Auto-assemble podcast episodes when new recordings are added.
Watch 'incoming/' folder, output to 'ready/' folder.
"""

from pydub import AudioSegment
from pathlib import Path
import time

# Configuration
WATCH_DIR = Path("incoming/")
OUTPUT_DIR = Path("ready/")
INTRO_FILE = Path("assets/intro.mp3")
OUTRO_FILE = Path("assets/outro.mp3")
CROSSFADE_MS = 500
TARGET_DBFS = -16

def assemble_episode(input_file: Path) -> Path:
    """Add intro/outro and normalize a podcast episode."""

    print(f"\nProcessing: {input_file.name}")

    # Load audio
    intro = AudioSegment.from_file(INTRO_FILE)
    content = AudioSegment.from_file(input_file)
    outro = AudioSegment.from_file(OUTRO_FILE)

    # Normalize content to target
    adjustment = TARGET_DBFS - content.dBFS
    content = content.apply_gain(adjustment)
    print(f"  Normalized: {content.dBFS:.1f} dBFS")

    # Apply fades
    intro = intro.fade_out(CROSSFADE_MS)
    content = content.fade_in(CROSSFADE_MS).fade_out(CROSSFADE_MS)
    outro = outro.fade_in(CROSSFADE_MS)

    # Assemble with crossfade
    episode = intro.append(content, crossfade=CROSSFADE_MS)
    episode = episode.append(outro, crossfade=CROSSFADE_MS)

    # Export
    output_file = OUTPUT_DIR / input_file.name
    episode.export(output_file, format="mp3", bitrate="192k")
    print(f"  Created: {output_file} ({len(episode)/1000/60:.1f} min)")

    return output_file


def watch_and_process():
    """Watch folder and process new files."""

    WATCH_DIR.mkdir(exist_ok=True)
    OUTPUT_DIR.mkdir(exist_ok=True)

    processed = set()
    print(f"Watching {WATCH_DIR} for new recordings...")
    print(f"Output to: {OUTPUT_DIR}")
    print("Press Ctrl+C to stop\n")

    while True:
        for file in WATCH_DIR.glob("*.mp3"):
            if file.name not in processed:
                try:
                    assemble_episode(file)
                    processed.add(file.name)
                    # Move original to archive
                    archive = WATCH_DIR / "processed"
                    archive.mkdir(exist_ok=True)
                    file.rename(archive / file.name)
                except Exception as e:
                    print(f"  Error: {e}")

        time.sleep(5)  # Check every 5 seconds


if __name__ == "__main__":
    watch_and_process()
```

## 检查清单与模板

### PyDub 项目设置

```
## Requirements

□ Python 3.7+ installed
□ pip install pydub
□ FFmpeg installed and in PATH
□ Test: python -c "from pydub import AudioSegment; print('OK')"

## Project Structure

project/
├── scripts/
│   ├── normalize.py
│   ├── assemble.py
│   └── convert.py
├── assets/
│   ├── intro.mp3
│   └── outro.mp3
├── incoming/      # Raw recordings
├── processed/     # Final output
└── config.json    # Settings
```

---

### 常用操作参考

```python
## Quick Reference

# Load
audio = AudioSegment.from_file("file.mp3")

# Save
audio.export("out.mp3", format="mp3", bitrate="192k")

# Volume
louder = audio + 6  # +6 dB
quieter = audio - 3  # -3 dB

# Trim
first_30s = audio[:30000]  # milliseconds
last_min = audio[-60000:]

# Concatenate
combined = audio1 + audio2 + audio3

# Fade
audio = audio.fade_in(500).fade_out(500)

# Crossfade
combined = audio1.append(audio2, crossfade=500)

# Normalize
from pydub.effects import normalize
normalized = normalize(audio)

# Silence
silence = AudioSegment.silent(duration=2000)

# Properties
print(len(audio))  # duration in ms
print(audio.dBFS)  # volume level
```

## 技能边界

### 此技能擅长的事项
- 构建音频制作工作流
- 提供技术指导
- 创建质量检查清单
- 提出创意方法建议

### 此技能无法完成的事项
- 取代音频工程专业知识
- 作出主观的创意决策
- 直接访问或编辑音频文件
- 保证商业成功

## 参考资料

- PyDub。《GitHub 仓库》(jiaaro/pydub) - 库文档
- GeeksforGeeks。《使用 PyDub 在 Python 中创建音频编辑器》
- Real Python。《在 Python 中处理音频》
- FFmpeg 文档 - 底层编码器

## 相关技能

- [音频编辑](../audio-editing/) - 手动编辑基础
- [转录内容处理](../transcription-to-content/) - 处理转录文本
- [播客制作](../podcast-production/) - 完整的播客工作流

---

## 技能元数据（内部使用）

```yaml
name: pydub-automation
category: audio
subcategory: automation
version: 1.0
author: MKTG Skills
source_expert: PyDub Library
source_work: jiaaro/pydub
difficulty: intermediate
estimated_value: Hours saved per batch (5-50 hours depending on scale)
tags: [python, automation, audio, batch-processing, pydub]
created: 2026-01-26
updated: 2026-01-26
```