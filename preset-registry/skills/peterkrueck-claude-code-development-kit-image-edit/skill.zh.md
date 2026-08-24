---
name: image-edit
description: Edit images with precision — crop, resize, mirror, rotate, trim, and reframe. Use this skill whenever the user asks to crop, resize, trim, mirror, flip, rotate, reframe, or otherwise manipulate an image. Also use for creating square crops, portraits/headshots from full-body images, icon sizes, or any image transformation. Even if the request sounds simple, this skill prevents common pitfalls and ensures correct results on the first try.
user_invocable: true
---
# 图像编辑 — 裁剪、调整大小与变换

使用 Python/Pillow 进行精确的图像处理。创建此技能是因为 macOS `sips` 的裁剪偏移行为不可靠，仅凭视觉检查也容易导致坐标错误——图像中经常存在数百像素的不可见留白，从而使简单裁剪产生偏差。

## 设置

这些脚本需要 Pillow 和 numpy。首次使用时创建临时 venv：

```bash
python3 -m venv /tmp/imgcrop && /tmp/imgcrop/bin/pip install Pillow numpy -q
```

每个会话只需执行一次。`/tmp/imgcrop` 中的 venv 会一直保留到重启。

## 黄金法则：裁剪前先测量

绝不要通过视觉检查猜测裁剪坐标。图像中通常存在大片不可见区域——透明留白、纯色边框或无效空间——会使视觉估算产生很大偏差。

始终先运行分析脚本，以获取实际内容所在位置的精确像素坐标。

## 工作流程

### 第 1 步 — 视觉检查

使用 Read 工具查看图像。了解图像中包含的内容，以及用户希望聚焦的部分。

### 第 2 步 — 分析内容边界

运行随附的分析脚本，查找实际内容所在的位置：

```bash
/tmp/imgcrop/bin/python3 .claude/skills/image-edit/scripts/analyze_bounds.py <image_path>
```

该脚本会输出包含以下字段的 JSON：
- `content_bounds` — 非背景内容的精确像素坐标
- `padding` — 每一侧存在的无效空间大小
- `suggested_square_crops` — 按不同缩放级别预先计算的裁剪区域：
  - `tight_head` (35%) — 面部/头部特写
  - `upper_body` (55%) — 从头部到胸部/手臂
  - `three_quarter` (75%) — 从头部到腰部
  - `full` (100%) — 整个主体

使用 `--threshold` 调整灵敏度（默认值为 30）。

### 第 3 步 — 计算裁剪坐标

使用分析输出计算精确的裁剪坐标：

- **头部留白**：在内容顶部上方增加 40-70px
- **居中**：以内容的中心 x 坐标为水平中心，而不是以图像中心为准
- **宽高比**：对于正方形裁剪，使用 `max(width, height)` 作为边长
- **边界限制**：确保裁剪区域不会超出图像尺寸

### 第 4 步 — 应用操作

使用随附的脚本。所有操作都是可选且可组合的——按以下顺序应用：裁剪 -> 镜像 -> 旋转 -> 调整大小。

```bash
/tmp/imgcrop/bin/python3 .claude/skills/image-edit/scripts/crop_image.py \
  <input_path> <output_path> \
  [--left L --top T --right R --bottom B] \
  [--mirror horizontal|vertical] \
  [--rotate DEGREES] \
  [--resize WxH]
```

**标志：**

| 标志 | 必需 | 描述 |
|------|----------|-------------|
| `--left/--top/--right/--bottom` | 否（但只要使用其中任意一个，就必须全部提供） | 以像素为单位的裁剪区域。(0,0) 位于左上角。 |
| `--mirror` | 否 | `horizontal`（或 `h`）左右翻转。`vertical`（或 `v`）上下翻转。 |
| `--rotate` | 否 | 逆时针旋转的角度。90/180/270 可实现像素级精确旋转；其他角度会扩展画布。 |
| `--resize` | 否 | 最终尺寸，例如 `512x512`。在所有其他操作之后应用。使用 LANCZOS 重采样。 |

**重要**：始终保存到一个新文件。绝不要覆盖原始文件。

### 第 5 步 — 验证

使用 Read 工具读取输出图像，以直观确认结果。如果效果不正确，请调整后重新运行——原始文件不会受到影响。

## 常见任务

### 裁剪主体为正方形
1. 分析边界以找到内容区域
2. 使用适合的建议裁剪方式（`upper_body`、`three_quarter` 等）
3. 调整头部上方留白和居中效果

### 镜像图像
```bash
/tmp/imgcrop/bin/python3 .claude/skills/image-edit/scripts/crop_image.py \
  input.png output-mirrored.png --mirror horizontal
```

### 调整为指定尺寸
1. 如有需要，先进行裁剪（以设置正确的宽高比）
2. 使用 `--resize WxH` 进行缩放

### 裁剪透明/白色留白
1. 分析边界——`padding` 字段会告知你存在多少无效空间
2. 将图像裁剪到 `content_bounds` 加上少量边距（10-20px）

### 生成多种尺寸（例如应用图标）
1. 从分辨率最高的裁剪结果开始
2. 使用不同的 `--resize` 值运行多个命令

## 不要使用 macOS `sips`

`sips` 命令行工具的 `--cropOffset` 行为不可靠。请改用 Python 脚本。