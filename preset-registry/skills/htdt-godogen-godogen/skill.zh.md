---
name: godogen
display_name: Godogen
short_description: Generate or update complete Godot games
default_prompt: "Use ${GODOGEN_COMMAND} to build or update this Godot game from a natural-language design brief."
description: |
  Generate or update a complete Godot game from a natural-language description. Use when the user wants ${AGENT_NAME} to make, rebuild, or substantially extend a Godot project end to end.
---
# 游戏生成器 — 编排器

根据自然语言生成和更新 Godot 游戏。

## 能力

仅在到达相应阶段时，才从 `${GODOGEN_SKILL_DIR}/` 读取各阶段文件。

| 文件 | 用途 | 何时读取 |
|------|---------|--------------|
| `visual-target.md` | 生成参考图像 | 流程开始时 |
| `decomposer.md` | 分解为任务计划 | 完成视觉目标后 |
| `scaffold.md` | 架构 + 骨架 | 完成任务分解后 |
| `asset-planner.md` | 制定资产预算和计划 | 提供了预算时 |
| `asset-gen.md` | 资产生成 CLI 参考 | 生成资产时 |
| `rembg.md` | 移除背景 | 仅当资产需要移除背景以获得透明效果时 |
| `task-execution.md` | 任务工作流 + 命令 | 开始第一个任务前 |
| `quirks.md` | Godot 注意事项 | 编写代码前 |
| `scene-generation.md` | 场景构建器 | 目标包含 `.tscn` 时 |
| `test-harness.md` | SceneTree 验证脚本 | 编写捕获/测试脚本前 |
| `capture.md` | 屏幕截图/视频捕获 + 最终结果包 | 自动截取屏幕截图或录制视频前 |
| `android-build.md` | APK 导出 | 用户请求 Android 时 |
| *（godot-api 技能）* | C# Godot 语法参考 | 不确定 Godot API 细节时 |

## 流程

```text
User request
    |
    +- Check if PLAN.md exists (resume check)
    |   +- If yes: read PLAN.md, STRUCTURE.md, MEMORY.md, ASSETS.md if present -> skip to task execution
    |   +- If no: continue with fresh pipeline below
    |
    +- Generate visual target -> reference.png + ASSETS.md (art direction only)
    +- Analyze risks + define verification criteria -> PLAN.md
    +- Design architecture -> STRUCTURE.md + project.godot + stubs
    |
    +- If budget provided (and no asset tables in ASSETS.md):
    |   +- Plan and generate assets -> ASSETS.md + updated PLAN.md with asset assignments
    |
    +- Show user a concise plan summary (risk tasks if any, main build scope)
    |
    +- Execute (see Execution below)
    |
    +- If final presentation media is required:
    |   +- Read test-harness.md and capture.md, produce a fresh screenshots/result/{N}/ bundle with raw frames and video.mp4
    |
    +- If user requested Android app:
    |   +- Read android-build.md, add ETC2/ASTC to project.godot, create export_presets.cfg, export APK
    |
    +- Summary of completed game
```

## 资产

**如果提供了预算，生成适当的资产就是任务的一部分，并非可选项。** 当预算允许使用真实资产时，不要退而使用程序化图元（把盒子堆成人、用球体表示头部、用彩色四边形表示道具）——应通过 `asset-planner.md` / `asset-gen.md` 规划并生成资产。仅当形状确实是抽象的（平台、方块、粒子），或者资产规划器已明确以预算为由排除某项资产时，才可以接受程序化替代物。

游戏代码中出现占位图元，说明跳过了资产步骤——继续之前，请返回并生成该资产。

## 执行

开始前阅读 `task-execution.md`。分为两个阶段：

1. **风险任务**（如有）——逐个隔离实施、验证并提交
2. **主要构建**——实施其余所有内容、验证、展示结果并提交

如果 `PLAN.md` 要求提供演示媒体，请完成 Godot 测试工具和捕获流程，并在 `test-harness.md` / `capture.md` 中记录，最后留下一个全新的 `screenshots/result/{N}/` 证明材料包。

## Godot API 查询

当你需要查询 Godot 类 API 或 C# Godot 模式时，请使用 `godot-api` 技能进行针对性查询。这样可以避免大型 API 文档进入主流水线。

如果你已经知道要检查的类或符号，并且通过搜索 `_common.md` / `_other.md` 再阅读少量特定文档即可获得答案，请直接使用该技能。如果你需要发现候选类、比较多个类，或阅读多份或大型文档并将其归纳为简洁答案，请使用专门的辅助代理。

请具体说明你的需求：

- **针对性查询**——询问特定方法、信号或语法：`"CharacterBody3D: what method applies velocity and slides along collisions?"`
- **完整 API**——仅在需要全面了解整个类时使用：`"full API for AnimationPlayer"`

## 上下文管理

将重要状态保存在文件中，以便流水线在长对话或上下文压缩后能够顺利恢复：

- **PLAN.md**——任务状态和验证标准
- **STRUCTURE.md**——架构参考
- **MEMORY.md**——发现的问题、特殊情况、变通方法，以及有效或失败的做法
- **ASSETS.md**——包含路径和生成详情的资源清单

完成每项任务后：更新 `PLAN.md`，将发现的问题写入 `MEMORY.md`，然后提交。如果对话变得杂乱，请将重要状态汇总到这些文件中，并依靠这些产物继续工作，而不是依赖对话记忆。

## 视觉验证

**不要只相信代码——请通过截图、捕获的帧和视频进行验证。** 看起来正确的代码在交付时往往仍存在位置错误、比例不正确、几何体被裁剪、元素缺失或运动时序不佳等问题。

当代码与媒体不一致时，以媒体为准。保持审慎：你的工作是找出仍然存在的问题，而不是辩称它大概没问题。如果某项要求无法清晰看到，就将其视为尚未完成。

在工作过程中直接检查捕获内容，最后生成一个全新的 `screenshots/result/{N}/` 证明材料包，其中包含 `video.mp4` 以及用于编码该视频的原始 `frameXXX.png` 序列。