---
name: image-batch
description: "Batch process images for marketing. Use when: resizing images for social media; compressing images for web; removing backgrounds; adding watermarks; converting formats to WebP; optimizing for Core Web Vitals"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# 图像批处理

> 使用 Pillow 和 rembg 自动执行重复性图像任务——在几秒钟内调整数百张图像的尺寸、压缩图像、移除背景并添加水印。

## 何时使用此技能

- **社交媒体素材准备** - 一次性将图像调整为适用于多个平台的尺寸
- **网站优化** - 压缩图像并转换为 WebP，以加快加载速度
- **产品照片** - 移除背景并添加统一的样式
- **品牌保护** - 为营销素材添加水印
- **批量转换** - 将旧版格式转换为现代格式


## Claude 负责什么，以及你需要决定什么

| Claude 负责 | 你决定 |
|-------------|------------|
| 规划视频工作流程 | 最终创意愿景 |
| 建议镜头构图 | 设备选择 |
| 创建故事板模板 | 品牌美学 |
| 生成脚本框架 | 最终审批 |
| 识别技术要求 | 预算分配 |

## 依赖项

```bash
pip install Pillow rembg click
# For GPU-accelerated background removal:
# pip install rembg[gpu]
```

## 命令

### 调整图像尺寸
```bash
python scripts/main.py resize ./images/ --width 1200
python scripts/main.py resize ./images/ --format instagram  # 1080x1080
python scripts/main.py resize ./images/ --format linkedin   # 1200x627
```

### 压缩图像
```bash
python scripts/main.py compress ./images/ --quality 80
python scripts/main.py compress ./images/ --max-size 500  # Max 500KB
```

### 移除背景
```bash
python scripts/main.py remove-bg photo.jpg
python scripts/main.py remove-bg ./products/ --output ./transparent/
```

### 添加水印
```bash
python scripts/main.py watermark ./images/ --logo logo.png --position bottom-right
python scripts/main.py watermark ./images/ --text "© 2024 Company" --opacity 0.3
```

### 转换格式
```bash
python scripts/main.py convert ./images/ --format webp
python scripts/main.py convert ./images/ --format avif --quality 80
```

## 示例

### 示例 1：为电子商务准备产品图像
```bash
# Remove backgrounds
python scripts/main.py remove-bg ./raw-products/ --output ./transparent/

# Resize to standard size
python scripts/main.py resize ./transparent/ --width 1000 --height 1000 --fit contain

# Compress for web
python scripts/main.py compress ./transparent/ --quality 85 --format webp

# Output: ./transparent/*.webp (optimized, transparent background)
```

### 示例 2：社交媒体图像套件
```bash
# Create multiple sizes from one source
python scripts/main.py resize hero-image.jpg --format instagram --output hero_ig.jpg
python scripts/main.py resize hero-image.jpg --format linkedin --output hero_li.jpg
python scripts/main.py resize hero-image.jpg --format twitter --output hero_tw.jpg
python scripts/main.py resize hero-image.jpg --format facebook --output hero_fb.jpg

# Or batch process entire folder for one platform
python scripts/main.py resize ./campaign-images/ --format instagram --output ./instagram/
```

### 示例 3：网站图像优化
```bash
# Convert all images to WebP
python scripts/main.py convert ./website-images/ --format webp --quality 80

# Ensure no image exceeds 200KB
python scripts/main.py compress ./website-images/ --max-size 200

# Results in 60-80% smaller file sizes
```

## 社交媒体格式预设

| 格式 | 尺寸 | 宽高比 | 使用场景 |
|--------|------------|--------------|----------|
| `instagram` | 1080x1080 | 1:1 | 信息流帖子 |
| `instagram-story` | 1080x1920 | 9:16 | 快拍/Reels |
| `linkedin` | 1200x627 | 1.91:1 | 链接预览 |
| `linkedin-post` | 1200x1200 | 1:1 | 信息流帖子 |
| `twitter` | 1200x675 | 16:9 | 卡片 |
| `facebook` | 1200x630 | 1.91:1 | 链接预览 |
| `pinterest` | 1000x1500 | 2:3 | 图钉 |
| `youtube` | 1280x720 | 16:9 | 缩略图 |

## 适配模式

| 模式 | 行为 |
|------|----------|
| `cover` | 填满区域，裁剪多余部分（默认） |
| `contain` | 适应区域内部，添加留白 |
| `stretch` | 拉伸变形以精确适配 |
| `crop` | 聚焦主体进行智能裁剪 |

## 输出格式

| 格式 | 最适合 | 压缩 |
|--------|----------|-------------|
| `webp` | Web 图像 | 比 JPEG 小 25-35% |
| `avif` | 现代浏览器 | 比 JPEG 小 50% |
| `jpg` | 照片、渐变图像 | 有损、通用 |
| `png` | 透明图像、图形 | 无损 |

## Skill 边界

### 此 Skill 擅长的工作
- 构建视频制作工作流
- 创建故事板框架
- 建议技术方案
- 提供创意指导模板

### 此 Skill 无法完成的工作
- 取代专业视频拍摄
- 直接编辑视频文件
- 做出最终的创意判断
- 保证受众参与度

## 相关 Skill

- [video-processing](../video-processing/) - 处理视频缩略图
- [lighthouse-audit](../../seo-tools/lighthouse-audit/) - 检查图像对 LCP 的影响

## Skill 元数据


- **模式**：cyborg
```yaml
category: automation
subcategory: image-processing
dependencies: [Pillow, rembg]
difficulty: beginner
time_saved: 5+ hours/week
```