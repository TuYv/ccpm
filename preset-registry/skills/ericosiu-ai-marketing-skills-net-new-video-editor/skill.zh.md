---
name: net-new-video-editor
description: Turn newly recorded talking-head footage into review-ready vertical video drafts with an explicit edit plan, deterministic FFmpeg rendering, captions, hook cards, audio normalization, and visual QA. Use for original Instagram Reels, TikTok videos, YouTube Shorts, LinkedIn videos, founder-led recordings, multiple takes of a new script or idea card, or requests to automate the first video-editing pass. Do not use to mine clips from long-form source videos.
---
# 全新视频编辑器

使用新录制的素材创建可逆的初剪版本。将创意决策保存在 JSON 中，并使用随附的渲染器执行像素操作。

## 前置步骤

当可选的共享遥测辅助工具存在时，从仓库根目录运行：

```bash
python3 telemetry/version_check.py 2>/dev/null || true
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

远程遥测为选择加入，并且绝不会包含内容、文件路径、仓库名称或凭据。

## 建立项目包

阅读 `references/project-contract.md`。找到确切的源录制素材、转录文本、创意卡片或简报、佐证素材和屏幕录制素材。绝不要使用其他录制素材、品牌、账号或素材库作为替代。

仅在目标位置明确时初始化新项目：

```bash
python3 scripts/net_new_video_editor.py init --project <project-dir>
```

仅将用户授权的输入复制到生成的项目包中，或将其指向这些输入。保留原始文件。

## 编辑前检查

运行：

```bash
python3 scripts/net_new_video_editor.py inspect --project <project-dir>
```

检查 `intake-report.json`。如果项目包中没有可播放的录制片段、请求的目标与所提供的素材不匹配，或缺少必需的外部素材，请停止操作。

## 制定编辑计划

使用转录文本和简报创建 `edit-plan-clean.json`。将口播钩子和观点边界视为基准依据。

- 明确选择一个源录制片段。
- 有意识地安排片段顺序，并确保时间戳处于源素材时长范围内。
- 仅在剪辑效果仍然自然时，删除明显的错误开头、过长的无内容停顿和孤立的填充词。
- 保留有助于表达含义的呼吸声。
- 钩子在屏幕上的显示时间不得超过五秒。
- 使用简短且易读的短语作为字幕。
- 仅在已提供相关素材时添加佐证内容或屏幕插入内容。随附的渲染器负责基础组装；复杂叠加内容应在单独且有文档记录的流程中添加。
- 对语音进行响度标准化，避免削波。

如需制作第二个版本，请将计划复制为 `edit-plan-aggressive.json`，并且只进行明确列出的留存率优化编辑。不要暗中更改事实性陈述。

验证每个计划：

```bash
python3 scripts/net_new_video_editor.py validate --project <project-dir> --plan <plan.json>
```

## 确定性渲染

从此技能目录运行渲染器：

```bash
python3 scripts/net_new_video_editor.py render \
  --project <project-dir> \
  --plan <plan.json>
```

渲染器会同步裁剪配对的音频和视频、拼接选定片段、创建中心安全的 9:16 画面、使用 Pillow 栅格化字幕和钩子卡片、使用 FFmpeg 合成这些内容、对音频进行响度标准化、写出 H.264/AAC MP4，并创建三张 QA 帧以及 `qa-report.json`。

使用 `--dry-run` 检查 FFmpeg 命令。仅在确定要替换完全对应的派生导出文件时使用 `--force`。

## 检查输出

检查导出的 MP4、全部三张 QA 帧、`qa-report.json`，以及不同版本之间的计划差异。验证：

- 每次剪辑后，音频与口型都保持同步；
- 没有单词的开头或结尾被突然截断；
- 字幕与语音一致，并且位于安全边距以内；
- 裁剪后，发言者仍保持可见；
- 钩子清晰易读，并且视频兑现了钩子所作的承诺；
- 响度保持一致，并且峰值不会失真；
- 每个佐证插入内容和数字声明都有已提供的来源；
- 除非简报要求其他格式，否则导出文件为 1080x1920 H.264/AAC。

返回计划、导出路径、QA 证据以及任何必需的补录项。未经当前明确批准，绝不得发布、上传、删除原始文件或覆盖已批准的母版。

## 完成状态

- `DONE`：渲染和 QA 均通过，且审核材料已存在。
- `DONE_WITH_CONCERNS`：草稿可用，但仍存在已明确指出的创意或素材问题。
- `NEEDS_CONTEXT`：缺少录制片段、转录稿、需求简报或已批准的素材。
- `BLOCKED`：FFmpeg、源文件访问或格式验证问题导致无法安全渲染。