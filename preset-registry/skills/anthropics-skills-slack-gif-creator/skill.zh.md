---
name: slack-gif-creator
description: Knowledge and utilities for creating animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts. Use when users request animated GIFs for Slack like "make me a GIF of X doing Y for Slack."
license: Complete terms in LICENSE.txt
---
# Slack GIF 生成器

一个提供实用工具和知识的工具包，用于创建为 Slack 优化的动画 GIF。

## Slack 要求

**尺寸：**
- 表情符号 GIF：128x128（推荐）
- 消息 GIF：480x480

**参数：**
- FPS：10-30（越低文件越小）
- 颜色：48-128（更少则文件更小）
- 时长：表情符号 GIF 保持低于 3 秒

## 核心流程

```python
from core.gif_builder import GIFBuilder
from PIL import Image, ImageDraw

# 1. Create builder
builder = GIFBuilder(width=128, height=128, fps=10)

# 2. Generate frames
for i in range(12):
    frame = Image.new('RGB', (128, 128), (240, 248, 255))
    draw = ImageDraw.Draw(frame)

    # Draw your animation using PIL primitives
    # (circles, polygons, lines, etc.)

    builder.add_frame(frame)

# 3. Save with optimization
builder.save('output.gif', num_colors=48, optimize_for_emoji=True)
```

## 绘制图形

### 处理用户上传的图片
如果用户上传了图片，请考虑他们是否希望：
- **直接使用**（例如：“animate this”，“split this into frames”）
- **作为灵感参考**（例如：“make something like this”）

使用 PIL 加载并处理图片：
```python
from PIL import Image

uploaded = Image.open('file.png')
# Use directly, or just as reference for colors/style
```

### 从零开始绘制
从零绘制图形时，使用 PIL ImageDraw 原语：

```python
from PIL import ImageDraw

draw = ImageDraw.Draw(frame)

# Circles/ovals
draw.ellipse([x1, y1, x2, y2], fill=(r, g, b), outline=(r, g, b), width=3)

# Stars, triangles, any polygon
points = [(x1, y1), (x2, y2), (x3, y3), ...]
draw.polygon(points, fill=(r, g, b), outline=(r, g, b), width=3)

# Lines
draw.line([(x1, y1), (x2, y2)], fill=(r, g, b), width=5)

# Rectangles
draw.rectangle([x1, y1, x2, y2], fill=(r, g, b), outline=(r, g, b), width=3)
```

**不要使用：** 表情符号字体（在不同平台上不稳定）或假设该技能中预先打包了图形素材。

### 让图形看起来更好

图形应显得精致且有创意，而非基础。方法如下：

**使用更粗的线条**——轮廓和线条请始终设置 `width=2` 或更高。细线（`width=1`）看起来会很锯齿和业余。

**增加视觉层次**：
- 使用渐变作为背景（`create_gradient_background`）
- 叠加多个形状以增强复杂度（例如：一颗星星内部再画一颗更小的星）

**让形状更有趣**：
- 不要只画一个普通圆形——添加高光、环形或图案
- 星星可以带有发光效果（在后方绘制更大、更半透明的版本）
- 组合多个形状（星星+闪光，圆形+圆环）

**注意配色**：
- 使用鲜艳且互补的颜色
- 增加对比度（浅色形状使用深色轮廓，深色形状使用浅色轮廓）
- 考虑整体构图

**对于复杂形状**（爱心、雪花等）：
- 使用多边形和椭圆的组合
- 仔细计算对称的点
- 添加细节（例如心形可以有高光曲线，雪花具有复杂枝干）

要有创意并注重细节！优质的 Slack GIF 应该看起来是精心制作的，而不是占位图形。

## 可用实用工具

### GIFBuilder (`core.gif_builder`)
组装帧并针对 Slack 进行优化：
```python
builder = GIFBuilder(width=128, height=128, fps=10)
builder.add_frame(frame)  # Add PIL Image
builder.add_frames(frames)  # Add list of frames
builder.save('out.gif', num_colors=48, optimize_for_emoji=True, remove_duplicates=True)
```

### 验证器 (`core.validators`)
检查 GIF 是否符合 Slack 要求：
```python
from core.validators import validate_gif, is_slack_ready

# Detailed validation
passes, info = validate_gif('my.gif', is_emoji=True, verbose=True)

# Quick check
if is_slack_ready('my.gif'):
    print("Ready!")
```

### 缓动函数 (`core.easing`)
用平滑运动代替线性变化：
```python
from core.easing import interpolate

# Progress from 0.0 to 1.0
t = i / (num_frames - 1)

# Apply easing
y = interpolate(start=0, end=400, t=t, easing='ease_out')

# Available: linear, ease_in, ease_out, ease_in_out,
#           bounce_out, elastic_out, back_out
```

### 帧辅助函数 (`core.frame_composer`)
处理常见需求的便捷函数：
```python
from core.frame_composer import (
    create_blank_frame,         # Solid color background
    create_gradient_background,  # Vertical gradient
    draw_circle,                # Helper for circles
    draw_text,                  # Simple text rendering
    draw_star                   # 5-pointed star
)
```

## 动画概念

### 抖动/振动
用振荡偏移对象位置：
- 使用 `math.sin()` 或 `math.cos()` 配合帧索引
- 添加小的随机变化以增强自然感
- 应用于 x 和/或 y 方向位置

### 脉冲/心跳
让对象尺寸有节奏地缩放：
- 使用 `math.sin(t * frequency * 2 * math.pi)` 实现平滑脉冲
- 心跳效果：两次快速脉冲后暂停（调整正弦波）
- 缩放范围在基础尺寸的 0.8 到 1.2 之间

### 弹跳
对象下落并反弹：
- 使用 `interpolate()` 并设置 `easing='bounce_out'` 实现着陆
- 使用 `easing='ease_in'` 实现下落（加速）
- 通过每帧增加 y 方向速度来模拟重力

### 旋转/转动
围绕中心旋转对象：
- PIL：`image.rotate(angle, resample=Image.BICUBIC)`
- 对于摆动，角度可使用正弦波而非线性变化

### 淡入/淡出
逐渐显现或消失：
- 创建 RGBA 图片，调整 alpha 通道
- 或使用 `Image.blend(image1, image2, alpha)`
- 淡入：alpha 从 0 到 1
- 淡出：alpha 从 1 到 0

### 滑动
将对象从屏幕外移动到目标位置：
- 起始位置：在画面边界外
- 结束位置：目标位置
- 使用 `interpolate()` 并设置 `easing='ease_out'` 以实现平滑停止
- 需要超调时：使用 `easing='back_out'`

### 缩放
缩放和定位以实现变焦效果：
- 放大：从 0.1 缩放到 2.0，并裁剪中心
- 缩小：从 2.0 缩放到 1.0
- 可添加运动模糊提升戏剧性（PIL 滤镜）

### 爆炸/粒子爆发
创建向外辐射的粒子：
- 生成带随机角度和速度的粒子
- 更新每个粒子：`x += vx`、`y += vy`
- 添加重力：`vy += gravity_constant`
- 随时间使粒子淡出（降低 alpha）

## 优化策略

仅在用户要求减小文件大小时，实施以下若干方法：

1. **减少帧数** - 降低 FPS（10 而非 20）或缩短时长
2. **减少颜色** - 使用 `num_colors=48` 而非 128
3. **减小尺寸** - 128x128 而非 480x480
4. **移除重复帧** - 在 `save()` 中设置 `remove_duplicates=True`
5. **表情符号模式** - `optimize_for_emoji=True` 自动优化

```python
# Maximum optimization for emoji
builder.save(
    'emoji.gif',
    num_colors=48,
    optimize_for_emoji=True,
    remove_duplicates=True
)
```

## 设计理念

本技能提供：
- **知识**：Slack 的要求和动画概念
- **实用工具**：GIFBuilder、validators、easing 函数
- **灵活性**：使用 PIL 原语创建动画逻辑

本技能不提供：
- 刚性的动画模板或预制函数
- 表情符号字体渲染（在不同平台上不稳定）
- 技能中内置的预打包图形库

**关于用户上传的说明：** 本技能不包含预置图形，但如果用户上传了图片，请使用 PIL 加载并处理——根据用户请求判断他们是想直接使用图片，还是仅作为灵感参考。

发挥创意！结合不同概念（如弹跳+旋转、脉冲+滑动等）并充分利用 PIL 的全部能力。

## 依赖项

```bash
pip install pillow imageio numpy
```
