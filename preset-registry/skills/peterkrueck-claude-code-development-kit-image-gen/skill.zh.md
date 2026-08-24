---
name: image-gen
description: Generate character art and image variations using AI image generation (Google Gemini) with reference images for style and character consistency. Use this skill when the user asks to generate new character poses, mascot variations, art assets, illustrations, or any AI-generated images — especially when maintaining consistency with an existing character or style.
user_invocable: true
---
# AI 图像生成（Gemini）

使用 Google 的 Gemini 图像生成模型，结合参考图像生成多个图像变体，以保持风格和角色一致性。该模型每次请求最多支持 14 张参考图像，并且能够在多个角色之间保持一致性。

## 前提条件

- 必须设置 **GEMINI_API_KEY** 环境变量
  - 在 https://aistudio.google.com/apikey 获取密钥
  - 图像生成需要启用计费功能（1K 分辨率下约为 $0.067/张）
- 已安装 **Deno** 运行时（用于运行生成脚本）

## 工作流程

### 第 1 步 — 了解用户需求

明确主体、姿势、表情、使用场景，以及素材将用于何处（应用界面、社交媒体、网站等）。这些背景信息有助于编写合适的提示词并选择正确的宽高比。

### 第 2 步 — 选择参考图像

始终使用 **1-2 张参考图像** 以保持一致性：

1. **主要参考图像（始终放在第一位）：** 角色或主体最具代表性的图像。这张图用于锁定身份特征——脸型、配色和标志性特征。

2. **风格/姿势参考图像（第二张，可选）：** 选择与目标姿势最接近的现有已批准素材。这张图用于锁定比例和艺术风格。

主要参考图像锁定身份；风格参考图像锁定比例。两者结合可以生成最一致的结果。

### 第 3 步 — 编写提示词

编写详细的提示词，描述准确的姿势、表情和风格：

1. **角色/主体描述** — 定义角色的身体特征（以避免模型生成结果发生偏移）
2. **姿势和表情** — 角色正在做什么
3. **风格指令** — 艺术风格、线条风格、阴影处理方式
4. **背景** — 颜色、场景或透明背景
5. **构图范围** — 全身、半身、四分之三视角等

**提示词模板：**
``` 
[CHARACTER_DESCRIPTION]. [POSE_AND_EXPRESSION]. [STYLE_DIRECTIVES]. [BACKGROUND]. [VIEW/FRAMING].
```

**提示：**
- 具体说明每只手/每条手臂的动作——模糊的描述会导致姿势随机
- 始终明确指定背景
- 持续使用风格关键词（例如 `"flat color fills"`、`"3D render"`、`"watercolor"`）

### 第 4 步 — 生成变体

运行捆绑的生成脚本：

```bash
deno run --allow-env --allow-read --allow-write --allow-net \
  .claude/skills/image-gen/scripts/generate.ts \
  --prompt "your prompt here" \
  --ref path/to/primary-reference.png \
  --ref path/to/style-reference.png \
  --output-dir /tmp/image-gen \
  --variants 4 \
  --aspect "<choose based on use case>" \
  --size "2K"
```

**参数：**
| 标志 | 默认值 | 选项 |
|------|---------|---------|
| `--variants` | 4 | 1-8（每个变体都会单独调用一次 API） |
| `--aspect` | 1:1 | 1:1、3:4、4:3、9:16、16:9、2:3、3:2 |
| `--size` | 1K | 512、1K、2K、4K |

**始终将 `2K` 作为 size 的默认值**——更高的分辨率可以提供更好的质量，并且始终可以缩小。

**根据使用场景选择宽高比：**
| 使用场景 | 宽高比 |
|----------|-------------|
| 全身角色姿势 | `3:4` |
| 应用图标、头像、社交资料页 | `1:1` |
| 移动端屏幕、应用内卡片 | `9:16` 或 `3:4` |
| 横幅/页眉图像、OG 图像 | `16:9` 或 `4:3` |
| 半身/上半身肖像 | `1:1` 或 `4:3` |

**成本：**2K 分辨率下每张图片约 0.10 美元 = 4 个变体约 0.40 美元。

### 第 5 步——挑选最佳变体

使用 Read 工具目视检查所有生成的图片。根据以下标准为每张图片评分：

**一致性（最重要）：**
- 是否与参考图片匹配——面部、比例、颜色、风格？
- 艺术风格是否保持一致（没有偏向照片写实、3D 等）？

**质量（决胜因素）：**
- 图片是否具有个性和视觉吸引力？
- 是否适合作为生产素材？

**选出唯一的最佳变体**，并将其复制到项目的 assets 目录中，使用具有描述性的名称。简要说明选择它的原因。

如果没有任何图片达到要求，请说明出现了什么问题，并提出通过调整提示词重新生成。

### 第 6 步——后期处理

选出最佳变体后：
- 将选中的文件复制到适当的 assets 目录
- 清理：删除被拒绝的变体和临时输出目录
- 如果用户需要不同的裁剪或尺寸，请使用 **image-edit** 技能

## 速率限制

如果某些变体因 429 错误而失败：等待 60 秒，然后仅重新运行缺失数量的变体。不要重试全部变体——只需补齐缺失的部分。

如果全部变体都因 429 失败：等待 60 秒后重试。如果仍然持续失败，可能是每日配额已用尽——请稍后再试，或启用计费以获得更高的限制。

## 故障排除

- **未设置 "GEMINI_API_KEY"**——在 https://aistudio.google.com/apikey 获取密钥
- **未启用计费**或出现 403——在 Google AI Studio 中为图片生成启用计费
- **429 速率限制**——等待 60 秒后重试
- **角色外观不正确**——更具体地描述外貌特征，确保同时包含两张参考图片
- **风格发生偏移**——在提示词中更加强调风格关键词
- **姿势不正确**——极其具体地说明每只手臂和手正在做什么