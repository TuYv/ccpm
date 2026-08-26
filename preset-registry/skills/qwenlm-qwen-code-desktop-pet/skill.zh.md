---
name: desktop-pet
description: Create pixel-art desktop pet companions for Qwen Code. Generates a customized chibi spritesheet (1536×1872, 8×9 grid) for any character the user names — F1 drivers, anime characters, celebrities, fictional characters, animals, etc. Use when the user says "desktop pet", "桌宠", "桌面宠物", "想要XXX当桌宠", "换个宠物", or similar.
---
# 桌面宠物创建器

为 Qwen Code 的悬浮宠物窗口创建像素风格的迷你桌面宠物伙伴。
给定任意角色名称，生成包含动画精灵图的完整宠物包，
并将其放置在 `~/.qwen/pets/` 中，Qwen Code 会自动发现它。

## 前置条件

- Python 3 和 Pillow（`pip3 install Pillow`）。运行脚本前请检查：

```bash
python3 -c "from PIL import Image; print('OK')" 2>/dev/null || echo "Pillow not installed — run: pip3 install Pillow"
```

## 第 1 步：确定角色

如果用户尚未指定，请询问他们希望将谁作为桌面宠物。
然后研究该角色的视觉外观：

- **团队/组织颜色**（例如，迈凯伦木瓜橙、法拉利红）
- **服装/制服**（赛车服、校服、铠甲等）
- **显著特征**（头发颜色/样式、配饰、号码、头盔）
- **性格特征**（用于确定动画风格——活泼、沉稳、滑稽、严肃）
- **标志性物品**（方向盘、光剑、吉他等）

如有需要，使用网络搜索。对于知名角色（F1 车手、热门动漫角色等），可以依靠训练知识。

## 第 2 步：设计调色板

为角色定义 8–12 种颜色。所有颜色必须彼此 distinct，并且适用于小像素尺寸（3× = 9 px 细节）。

| 颜色角色 | 示例（F1 车手） | 示例（动漫） |
|---|---|---|
| `outfit` | 团队颜色 `[255,135,32]` | 制服 `[30,30,50]` |
| `outfit_dark` | 更深的色调 | 更深的色调 |
| `outfit_light` | 更浅的色调 | 更浅的色调 |
| `skin` | 暖肤色 | 肤色 |
| `skin_dark` | 阴影肤色 | 阴影肤色 |
| `hair` | 角色发色 | 角色发色 |
| `accent` | 号码/标志颜色 | 眼睛颜色 |
| `shoe` | 深灰色/黑色 | 鞋子颜色 |

## 第 3 步：生成精灵图

运行生成脚本。始终相对于技能的基础目录解析路径：

```bash
python3 <skill_dir>/scripts/gen_spritesheet.py \
  --output ~/.qwen/pets/<character_id>/spritesheet.webp \
  --config '{"colors":{...},"features":{...}}'
```

**图集格式：**1536×1872 px、RGBA、8 列 × 9 行，每个单元格为 192×208 px。

**动画行：**

| 行 | 状态 | 描述 |
|---|---|---|
| 0 | idle | 呼吸 + 眨眼（8 帧） |
| 1 | running-right | 向右奔跑（8 帧） |
| 2 | running-left | 向左奔跑（8 帧） |
| 3 | waving | 向用户挥手（8 帧） |
| 4 | jumping | 跳跃庆祝（8 帧） |
| 5 | failed | 出错时悲伤/瘫倒（8 帧） |
| 6 | waiting | 原地等待并轻敲（8 帧） |
| 7 | running | 通用奔跑（8 帧） |
| 8 | review | 思考/检查（8 帧） |

## 第 4 步：创建 `pet.json`

将清单写入 `~/.qwen/pets/<character_id>/pet.json`：

```json
{
  "id": "<character_id>",
  "displayName": "<Display Name>",
  "description": "<Short description — who is this character?>",
  "spritesheetPath": "spritesheet.webp"
}
```

规则：
- `id`：小写、无空格、符合 URL 安全规范（例如，`piastri`、`satoru`、`goku`）
- `displayName`：界面中显示的名称（例如，"Piastri"、"五条悟"、"悟空"）
- `description`：用一个简短句子描述该角色

## 步骤 5：验证并激活

1. 确认文件存在：

```bash
ls -lh ~/.qwen/pets/<character_id>/
```

2. 打开 spritesheet 供用户检查：

```bash
open ~/.qwen/pets/<character_id>/spritesheet.webp
```

3. 告知用户进行激活：打开 Qwen Code **Settings → Appearance → Pet
Companion**，点击 **Refresh**，然后选择新的宠物。

## 设计指南

### Chibi 比例

- **头部**：约占总高度的 40%（大头 = 可爱）
- **身体**：约占总高度的 30%
- **腿部**：约占总高度的 25%
- **缩放**：图像中的每个“像素”= 实际的 3×3 像素（scale=3）
- **角色中心**：在 192×208 单元格内约为 (96, 124)

### 绘制顺序（从后到前）

1. 腿部（位于身体后方）
2. 身体 / 服装
3. 手臂
4. 头部轮廓
5. 头发（后层）
6. 头发（前层 / 顶层）
7. 面部特征（眼睛、嘴巴、表情）
8. 配饰（帽子、头盔、眼镜等）
9. 前景细节（数字、徽标、徽章）

### 动画提示

- **待机**：细微的 Y 轴上下移动（0 到 −2 px）+ 每第 3–4 帧眨一次眼
- **奔跑**：交替改变腿部偏移（±4 px）、身体倾斜（±2 px）、手臂摆动
- **挥手**：一只手臂高举，交替切换帧
- **跳跃**：Y 轴偏移曲线（0 → −30 → 0），手臂向上
- **失败**：身体倾斜幅度增加，然后瘫坐下来
- **开心表情**：弯曲的眼睛（∧ 形），脸颊上添加红晕线
- **悲伤表情**：平直的眉毛，嘴角向下

### 头部装备选项（`features.headgear`）

`cap` · `helmet` · `hat` · `hood` · `crown` · `horns` · `ears` · `halo` · `headband` · `none`

### 发型（`features.hair_style`）

`short` · `long` · `spiky` · `ponytail` · `bald`

### 额外元素（`features.extras` 列表）

`glasses` · `scarf` · `tail` · `wings` · `number`（设置 `features.number`）· `logo` · `sweat_drop`

## 角色示例

### F1 车手（例如 Piastri）

```json
{
  "colors": {
    "outfit": [255, 135, 32],
    "outfit_dark": [220, 110, 20],
    "outfit_light": [255, 170, 80],
    "hair": [120, 80, 40],
    "accent": [30, 30, 30]
  },
  "features": {
    "headgear": "cap",
    "number": "81",
    "extras": ["logo"]
  }
}
```

### 动漫角色（例如 Gojo Satoru）

```json
{
  "colors": {
    "outfit": [30, 30, 50],
    "outfit_dark": [20, 20, 35],
    "outfit_light": [60, 60, 80],
    "hair": [230, 230, 250],
    "accent": [100, 180, 255]
  },
  "features": {
    "headgear": "none",
    "hair_style": "spiky",
    "extras": ["glasses"]
  }
}
```

### 动物（例如柴犬）

```json
{
  "colors": {
    "outfit": [220, 170, 100],
    "outfit_dark": [180, 130, 70],
    "outfit_light": [240, 200, 140],
    "hair": [220, 170, 100]
  },
  "features": {
    "headgear": "ears",
    "extras": ["tail"]
  }
}
```

## 故障排除

- **宠物未显示**：在 Settings → Appearance → Pet Companion 中点击 Refresh
- **颜色显示不正确**：检查 RGB 值是否为元组，而不是十六进制字符串
- **Spritesheet 过大**：必须小于 5 MB（webp 无损格式通常约为 8–50 KB）
- **动画抖动**：确保每行的 8 帧在视觉上各不相同，但变化不会令人不适