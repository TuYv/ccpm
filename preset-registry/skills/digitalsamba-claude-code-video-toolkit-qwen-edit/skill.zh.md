---
name: qwen-edit
description: AI image editing prompting patterns for Qwen-Image-Edit. Use when editing photos while preserving identity, reframing cropped images, changing clothing or accessories, adjusting poses, applying style transfers, or character transformations. Provides prompt patterns, parameter tuning, and examples.
---
# Qwen-Image-Edit 技能

通过 RunPod serverless 使用 Qwen-Image-Edit-2511 进行 AI 图像编辑。

**状态：**持续演进中——我们会在实验过程中不断记录经验

## 适用场景

在用户希望执行以下操作时使用：
- 编辑/变换照片，同时保留人物身份特征
- 重新构图被裁剪的图像（修复头部被截断等问题）
- 更换服装、添加配饰
- 更改姿势（手臂位置、手部摆放）
- 应用风格迁移（赛博朋克、动漫、油画）
- 调整光照/色彩分级
- 添加/移除物体
- 角色变换（邦德、尼奥等）

## 不适用场景

- **背景替换（单张图像）** - 会产生抠图伪影和光晕
- **换脸** - 无法保留参考图中的身份特征
- **扩图** - 无法可靠地扩展画布

## 谨慎使用

- **多图合成** - 使用明确的身份锚点时可以实现（提示词模式参见 examples.md）。需要描述 distinctive features（头发的纹理/颜色、族裔、服装），并使用约 2.0 的 guidance
- **相机角度变化** - 结果不稳定。垂直角度（低角度/高角度）的效果优于旋转角度（三分之四视角）

## 快速参考

```bash
# Basic edit
uv run tools/image_edit.py --input photo.jpg --prompt "Add sunglasses"

# With negative prompt (recommended)
uv run tools/image_edit.py --input photo.jpg \
  --prompt "Reframe as portrait with full head visible" \
  --negative "blur, distortion, artifacts"

# Style transfer
uv run tools/image_edit.py --input photo.jpg --style cyberpunk

# Background (use cautiously - often fails)
uv run tools/image_edit.py --input photo.jpg --background office

# Higher quality
uv run tools/image_edit.py --input photo.jpg --prompt "..." --steps 16 --guidance 3.0

# Multi-image composite (identity-preserving)
uv run tools/image_edit.py --input person.jpg background.jpg \
  --prompt "The [ethnicity] [gender] with [hair description] from first image is now in [scene] from second image. Same [features], [outfit]." \
  --negative "different ethnicity, different hair color, different face shape, generic stock photo" \
  --steps 16 --guidance 2.0
```

## 关键文件

- `prompting.md` - 提示词模式和结构
- `examples.md` - 实验中的好/坏示例
- `parameters.md` - steps、guidance、negative prompts 的调优

## 工具位置

`tools/image_edit.py` - RunPod endpoint 的 CLI 封装

## 相关文档

- `docs/qwen-edit-patterns.md` - 角色变换模式
- `.ai_dev/qwen-edit-research.md` - 研究笔记