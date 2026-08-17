---
name: asset-gen
display_name: Asset Generator
short_description: Generate game images, GLB 3D models, rigged characters, and animated sprites
default_prompt: "Use ${ASSET_SKILL_COMMAND} to generate images, 3D models, or animated sprites for this game."
allow_implicit_invocation: true
description: |
  Generate visual assets from text prompts: PNG images (Gemini / xAI Grok), GLB 3D models (Tripo3D), rigged biped characters, retargeted animations, and frame-by-frame animated sprites, plus background removal. Use whenever a game needs generated art.
---
# 资源生成器

根据文本提示词生成 PNG 图像（Gemini 或 xAI Grok）和 GLB 3D 模型（Tripo3D）。这些是付费 API——每次调用都会产生实际费用。工具位于 `${ASSET_GEN_SKILL_DIR}/tools/`；请从项目根目录运行，并将运行时加载的输出保存在 `${RUNTIME_ASSET_DIR}/` 下。

## 模型

| 模型 | 标志 | 费用 | 最适合 |
|-------|------|------|----------|
| Gemini | `--model gemini` | 5¢（512）· 7¢（1K）· 10¢（2K）· 15¢（4K） | 精确遵循提示词——参考图、角色、3D 参考图、精确布局 |
| Grok | `--model grok`（默认） | 2¢ | 质量高但不够精确——纹理、简单物体、物品套件、风景背景 |

Grok 能生成非常美观的结果，但经常忽略具体指令；当结果必须与你的描述一致时，请使用 Gemini。

## 图像

```bash
python3 ${ASSET_GEN_SKILL_DIR}/tools/asset_gen.py image \
  --prompt "the full prompt" -o ${RUNTIME_ASSET_DIR}/img/car.png
```

`--model`（默认 `grok`）· `--size`（默认 `1K`；Gemini 还支持 `512`/`4K`）· `--aspect-ratio`（默认 `1:1`；还支持 `16:9`、`9:16`、`4:3`、`3:4`、`3:2`、`2:3`）。

**图生图：**传入 `--image ref.png` 后，模型便能看到参考图——提示词中只需描述需要更改的内容（角度、姿势、重新着色），不要重新描述外观。可将其用于创建风格统一的系列（一个核心资源 → 其余资源）、变体和多视图集合。

**小型精灵图：**生成尺寸最小为 1K，因此将一张 1024px 图像缩小到 64px 后会显得模糊。请设计为显示尺寸 ≥128px，或者生成一个套件（一张 1K 图像中包含多个物体），然后使用 `tools/grid_slice.py ... --grid 2x2 --names "a,b,c,d"` 进行切分；也可以在提示词中要求使用粗犷、扁平的造型，使其缩小后仍能保持清晰。

在进行任何 GLB 转换之前，请检查每一张 PNG——质量不佳的图像会在后续流程中浪费 30¢ 以上。

### 背景移除

阅读 `${ASSET_GEN_SKILL_DIR}/rembg.md`。关键规则：**切勿在提示词中要求“透明背景”**（生成器会将棋盘格直接绘制到图像中）——应要求使用纯色背景，然后通过蒙版将其移除。

## 动画精灵图

流程：**参考图 → 姿势 → 视频 → 提取帧 → 循环裁剪 → 移除背景。**

1. 参考图（Gemini 1K、中立姿势、纯色背景）——作为所有内容的基准；请仔细检查。
2. 为每个动作生成姿势：使用参考图进行图生图，提示词中只描述动作。
3. 从姿势帧生成视频：`asset_gen.py video --image pose.png --duration 2 -o walk.mp4`（`--duration` 为 1–15 秒，`--resolution` 为 720p；费用为 5¢/秒）。
4. 提取：`ffmpeg -i walk.mp4 -vsync 0 frames/%04d.png`。
5. 对循环动作（行走/待机）进行循环裁剪：`tools/find_loop_frame.py frames/` 会返回循环帧；删除该帧之后的帧。一次性动作（攻击/死亡）跳过此步骤。
6. 批量蒙版抠图：`tools/rembg_matting.py --batch frames/ -o clean/`。

同一角色的所有动作应复用同一张参考图。**串联**（将动作 A 的最后一帧作为动作 B 的起始帧）可保持位置连续性——串联深度应 ≤2，否则会产生漂移。

## 3D 模型

```bash
python3 ${ASSET_GEN_SKILL_DIR}/tools/asset_gen.py glb  --image ref.png -o model.glb     # 30¢ default / 60¢ --quality hd
python3 ${ASSET_GEN_SKILL_DIR}/tools/asset_gen.py rig  --image ref.png -o rigged.glb    # +25¢, biped only
python3 ${ASSET_GEN_SKILL_DIR}/tools/asset_gen.py retarget --rigged rigged.glb \
  --animation preset:biped:walk -o walk.glb                                             # 10¢ per clip
```

用于 `glb` 的源图像：3/4 俯视角、纯白色/灰色背景、哑光材质、不透明玻璃、单个居中主体——并且**不要**对其执行 rembg（Tripo3D 需要纯色背景）。`rig` 仅适用于双足角色，如果网格不是类人形态，则会中止；四足角色使用普通 `glb`。`retarget` 会复用已绑定骨骼的任务 ID——针对同一个已绑定骨骼的 GLB，为每个动画运行一次（无需重新绑定骨骼）。不要假定预设名称会保留到 GLB 中；在连接播放逻辑之前，请检查导入后的剪辑名称。

双足重定向预设（以 `preset:biped:<name>` 的形式传递）：

```
afraid agree angry_01/02/03 basketball_shot bow box_01/02/03 cast_a_spell cheer chop
clap climb complain_01/02 cross_body_crunch crossover_dribble cry dance_01..06
defeat_02/03 depressed dig dive dribble fall fire flee_01/02 flip fold_arms
football_catch/save/pass freaky frightened front_kick_01/02 frustrated_01/02 golf
greet_01..04 heart_pose hit_to_body_01/02 hit_to_head/side/stomach hug hurt idle
jump jump_down jump_rope_01/02 laugh_01/02 lift_heavy look_around make_a_call_01/02
pitch_baseball play_mobile_game play_video_game press-up run run_upstairs scared_01/02
scratch shoot shovel sing_01..04 sit slash sob standing_relax surf swagger swim turn
victory_celebration volleyball wait walk warm_up wave_goodbye_01/02
```

### Tripo3D 操作（重要——避免重复计费）

- 任务通常会长时间停留在 99%，并且输出为空。让默认超时机制继续运行。
- `glb`/`rig`/`retarget` 中发生超时并**不**意味着服务器故障。任务 ID 已保存在 `<output>.tripo.json` 辅助文件中。**不要重新提交——这会导致重复计费。**应改为免费恢复：
  ```bash
  python3 ${ASSET_GEN_SKILL_DIR}/tools/asset_gen.py resume -o model.glb
  ```
  可以安全地重复运行；任务完成后不会执行任何操作。删除辅助文件可强制从头开始。

## 费用

每次生成都会产生实际费用，因此在生成前请先与用户确认。快速参考：纹理/简单精灵图（Grok）2 美分 · 角色/参考图（Gemini 1K）7 美分 · 背景 2 美分（Grok）或 10 美分（Gemini 2K）· 完整 3D 资产 37 美分（图像 7 美分 + GLB 30 美分）· 已绑定骨骼的角色行走/待机/攻击动画约 92 美分。

## 输出与日志记录

每条命令都会将 JSON 打印到标准输出：`{"ok": true, "path": "...", "cost_cents": 7}`。进度信息会输出到标准错误——将其重定向到临时文件，并且仅在失败时读取，以保持上下文整洁：

```bash
_log=$(mktemp)
result=$(python3 ${ASSET_GEN_SKILL_DIR}/tools/asset_gen.py image --prompt "..." -o p.png 2>"$_log") || tail -20 "$_log"
```

并行生成相互独立的图像（在一条消息中进行多次 Bash 调用）。

## 视觉问题

生成器和视觉检查的空间感知能力较弱——在重要情况下，请通过截图进行验证。

- **方向/朝向**并不可靠（“面向左侧”与“面向右侧”通常会生成相同的结果）。只生成一个方向，然后在运行时进行水平翻转，而不要为镜像版本付费。
- **尺寸混杂：**图像帧约为 1024px，视频帧约为 720px。在进行遮罩合成之前，将所有内容缩小到最小源尺寸（`magick in.png -resize 720x720 out.png`）。
- **播放帧率：**源视频约为 24fps——根据经过的时间，以约 1/24 秒的间隔驱动精灵动画播放，并且仅在动画状态实际发生变化时重新启动循环。

## 资源清单（位于 README.md 中）

在 `README.md` 中记录每个生成的资源，并包含**游戏内尺寸**列——如果缺少该列，程序员经常会错误地缩放资源：

- 3D 模型：以米为单位，例如 `4m long`、`1.8m tall`、`0.3m`
- 纹理：平铺尺寸，例如 `2m tile`
- 背景：像素尺寸 + 行为，例如 `1920x1080, fullscreen`
- 精灵图：显示像素，例如 `128x128 px`

| 名称 | 描述 | 尺寸 | 路径 | 成本 |
|------|-------------|------|------|------|
| car | 带扰流板的轿车 | 4m long | ${RUNTIME_ASSET_DIR}/glb/car.glb | 37¢ |