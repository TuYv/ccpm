---
name: qwen-edit
description: AI image editing prompting patterns for Qwen-Image-Edit. Use when editing photos while preserving identity, reframing cropped images, changing clothing or accessories, adjusting poses, applying style transfers, or character transformations. Provides prompt patterns, parameter tuning, and examples.
---
# Qwen-Image-Edit 技能

通过 RunPod 无服务器服务使用 Qwen-Image-Edit-2511 进行 AI 图像编辑。

**状态：** 持续演进中——正在记录实验过程中获得的经验

## 何时使用此技能

当用户希望执行以下操作时使用：
- 在保留人物身份特征的同时编辑或转换照片
- 重新构图被裁剪的图像（修复头部被截断等问题）
- 更换服装、添加配饰
- 改变姿势（手臂位置、手部摆放）
- 应用风格迁移（赛博朋克、动漫、油画）
- 调整光照或色彩分级
- 添加或移除对象
- 角色形象转换（邦德、尼奥等）

## 何时不应使用

- **背景替换（单张图像）**——会产生抠图伪影和光晕
- **换脸**——无法根据参考图保留人物身份特征
- **扩图**——无法可靠地扩展画布

## 谨慎使用

- **多图像合成**——使用明确的身份特征锚点时可以奏效（提示词模式参见 examples.md）。需要描述鲜明特征（头发纹理/颜色、族裔、服装），并使用约 2.0 的引导强度
- **改变相机角度**——结果不稳定。垂直角度（低角度/高角度）的效果优于旋转角度（四分之三视角）

## 快速参考

```bash
# Basic edit
python tools/image_edit.py --input photo.jpg --prompt "Add sunglasses"

# With negative prompt (recommended)
python tools/image_edit.py --input photo.jpg \
  --prompt "Reframe as portrait with full head visible" \
  --negative "blur, distortion, artifacts"

# Style transfer
python tools/image_edit.py --input photo.jpg --style cyberpunk

# Background (use cautiously - often fails)
python tools/image_edit.py --input photo.jpg --background office

# Higher quality
python tools/image_edit.py --input photo.jpg --prompt "..." --steps 16 --guidance 3.0

# Multi-image composite (identity-preserving)
python tools/image_edit.py --input person.jpg background.jpg \
  --prompt "The [ethnicity] [gender] with [hair description] from first image is now in [scene] from second image. Same [features], [outfit]." \
  --negative "different ethnicity, different hair color, different face shape, generic stock photo" \
  --steps 16 --guidance 2.0
```

## 关键文件

- `prompting.md`——提示词模式和结构
- `examples.md`——实验中的良好/不良示例
- `parameters.md`——调整步数、引导强度和负面提示词

## 工具位置

`tools/image_edit.py`——RunPod 端点的 CLI 封装工具

## 相关文档

- `docs/qwen-edit-patterns.md`——角色形象转换模式
- `.ai_dev/qwen-edit-research.md`——研究笔记