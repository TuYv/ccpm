---
name: bg-remove
description: Remove backgrounds from images using local AI (rembg). Use when removing backgrounds from character art, mascot images, photos, or any image that needs a transparent background.
user_invocable: true
---
# 背景移除 — 本地 AI 背景移除

使用 rembg 移除图像背景（本地、离线，不会向外部发送数据）。输出带有正确透明度的 RGBA PNG。

## 输入

`/bg-remove` 后的参数：
- **源图像路径**（必需）— 图像路径
- **`--trim`**（可选）— 移除背景后自动裁剪透明留白
- **`--output <path>`**（可选）— 自定义输出路径。默认：同一目录下的 `<name>-transparent.png`

示例：
- `/bg-remove assets/character/mascot.png`
- `/bg-remove image.png --trim`
- `/bg-remove image.png --output ~/Desktop/result.png`

## 设置

rembg 已安装在专用 venv 中。使用前始终先激活它：

```bash
source ~/.claude/tools/rembg-env/bin/activate
```

如果 venv 不存在，请安装：

```bash
python3 -m venv ~/.claude/tools/rembg-env && source ~/.claude/tools/rembg-env/bin/activate && pip install "rembg[cpu,cli]"
```

模型文件缓存于 `~/.u2net/`（每个模型首次使用时下载，birefnet-general 约为 170MB）。

## 处理流程

### 第 1 步：验证输入

1. 检查源图像是否存在
2. 获取尺寸：`sips -g pixelWidth -g pixelHeight <path>`
3. 使用 Read 工具查看图像，以了解我们要处理的内容

### 第 2 步：移除背景

使用 `birefnet-general` 模型——测试已验证，该模型对插画/角色艺术图和普通照片均表现良好，能够在这两类图像上生成干净的边缘。

```bash
source ~/.claude/tools/rembg-env/bin/activate && rembg i -m birefnet-general <input> <output>
```

**模型选择：** 默认使用 `birefnet-general`。在并排测试中，它在插画主体和摄影图像上都能生成干净的边缘。避免使用经过动漫图像训练的模型（例如 `isnet-anime`）：在非动漫图像上，甚至在某些插画输入上，这类模型往往会产生伪影，并在边缘周围留下深色斑块。如果 `birefnet-general` 在某张特定图像上的表现不佳，请与其他通用模型进行比较，而不是使用动漫专用模型。

### 第 3 步：验证结果

Read 工具会将透明区域渲染为黑色，因此你**必须**通过在彩色背景上进行合成来验证结果：

```bash
source ~/.claude/tools/rembg-env/bin/activate && python3 -c "
from PIL import Image
import numpy as np

# Load result
img = Image.open('<output>').convert('RGBA')
alpha = np.array(img)[:,:,3]
total = alpha.size
transparent = np.sum(alpha == 0)
opaque = np.sum(alpha == 255)
print(f'Dimensions: {img.size}')
print(f'Transparent: {transparent/total*100:.1f}%')
print(f'Opaque: {opaque/total*100:.1f}%')
print(f'Corners alpha: TL={alpha[0,0]} TR={alpha[0,-1]} BL={alpha[-1,0]} BR={alpha[-1,-1]}')

# Composite on magenta for visual verification
bg = Image.new('RGBA', img.size, (255, 0, 255, 255))
bg.paste(img, (0, 0), img)
bg.save('<output_dir>/verify-magenta.png')
print('Verification image saved')
"
```

然后使用 Read 工具查看洋红色验证图像。洋红色应该只出现在被移除背景的区域。

### 第 4 步：可选裁剪

如果请求了 `--trim`，则裁剪透明留白：

```bash
source ~/.claude/tools/rembg-env/bin/activate && python3 -c "
from PIL import Image
import numpy as np

img = Image.open('<output>').convert('RGBA')
alpha = np.array(img)[:,:,3]

# Find bounding box of non-transparent pixels
rows = np.any(alpha > 0, axis=1)
cols = np.any(alpha > 0, axis=0)
rmin, rmax = np.where(rows)[0][[0, -1]]
cmin, cmax = np.where(cols)[0][[0, -1]]

# Add small padding (2% of dimensions)
pad_h = max(int(img.height * 0.02), 4)
pad_w = max(int(img.width * 0.02), 4)
rmin = max(0, rmin - pad_h)
rmax = min(img.height - 1, rmax + pad_h)
cmin = max(0, cmin - pad_w)
cmax = min(img.width - 1, cmax + pad_w)

cropped = img.crop((cmin, rmin, cmax + 1, rmax + 1))
cropped.save('<output>')
print(f'Trimmed: {img.size} -> {cropped.size}')
"
```

### 步骤 5：报告

```
Done: background removed
  Source: <input_path>
  Output: <output_path>
  Dimensions: <width>x<height>
  Transparent pixels: <percent>%
  Model: birefnet-general (local, offline)
```

**交付前验证：**在 Preview.app 中打开输出文件（或使用任何能显示棋盘格图案的查看器），确认确实为透明背景。Read 工具会将透明区域渲染为纯黑色，因此无法区分透明背景和黑色背景——在某种颜色上合成（步骤 3）或使用棋盘格查看器是唯一可靠的检查方式。

## 重要规则

1. **默认使用 `birefnet-general`**——在并排测试中，它在插画和照片输入上都能生成最干净的边缘；针对动漫训练的模型会增加伪影。只有当某张特定图像上的表现明显不佳时，才切换模型。
2. **运行 rembg 或使用 Pillow/numpy 的 Python 之前，始终激活 venv。**
3. **始终使用品红色合成图进行验证**——不要相信 Read 工具对透明度的渲染结果。
4. **绝不要将图像发送到外部服务**——rembg 100% 在本地运行。
5. **保留原始文件**——输出到新文件，绝不要覆盖源文件。
6. **清理验证图像**——确认质量后删除品红色合成图。