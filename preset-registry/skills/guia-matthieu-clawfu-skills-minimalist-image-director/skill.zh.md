# 极简主义图像指导

> 一套通过 AI 图像生成器（Flux、Midjourney、DALL-E）生成温暖极简主义摄影作品的艺术指导框架。将构图上的极简主义与情感上的极简主义区分开来，避免陷入“美丽却悲伤”的误区。

## 何时使用此技能

- 为网站生成主视觉图、卡片图片或博客插图
- 在 10 张以上的 AI 生成图像中打造统一的视觉形象
- 以精准的情感表达指导 AI 图像生成器（Replicate/Flux、Midjourney、DALL-E）
- 当之前的极简主义尝试结果“过于冷淡”或“过于悲伤”时
- 为品牌的 AI 生成摄影作品构建视觉风格指南

## 方法论基础

**来源**：
- 编辑摄影原则（Annie Leibovitz、2024-2026 年极简生活方式摄影趋势）
- 情感化设计（Don Norman，2004）——本能层、行为层和反思层处理
- 色彩心理学研究——暖色调（2700-3000K）会激发趋近行为，冷色调会触发回避行为
- 视觉与温度感知的神经科学——80% 的实验表明，操控视觉环境会影响温度感知（红橙色 = 温暖，绿蓝色 = 寒冷）
- Black Forest Labs 官方提示词指南（Flux 1.1 Pro、Flux 2）
- Kodak Portra 400 色彩科学——AI 摄影中呈现温暖肤色的黄金标准

**核心原则**：极简主义关注的是你要保留什么，而不是移除什么。画面中的元素越少，每个元素就越需要承载更多的情感分量。留白具有放大作用——它既能放大寒冷感，也同样能放大温暖感。

**为什么这很重要**：AI 图像生成器默认生成的“美学极简主义”往往给人冷淡、临床化、孤独的感觉。此技能会教你如何将温暖注入极简构图，在获得简洁视觉效果的同时，避免情感上的空洞。

**神经科学依据**：暖色会触发趋近行为并降低认知警觉性——让观看者感到安全。冷色会触发警觉和回避。这并非审美偏好，而是感光细胞和神经通路处理视觉信息的方式。

---

## Claude 负责什么，您决定什么

> “Claude 负责提示词工程。您负责赋予真实的情感。”

| Claude 负责 | 您提供 |
|---------------|-------------|
| 将情感意图转换为 Flux/MJ 提示词语法 | 每张图像必须传达的情感 |
| 一致地应用四层提示词架构 | 品牌配色和视觉形象 |
| 标记会生成悲伤、冷淡图像的提示词反模式 | 验证——感觉对不对？ |
| 生成可确保批次一致性的共享风格前缀 | 每张图像的主题和语境 |
| 优化宽高比和技术参数 | 在生成的选项中做出最终选择 |

**请记住**：AI 可以生成技术上完美、但感觉完全错误的极简主义图像。您对情感的直觉反应才是质量关卡，而不是构图。

---

## 此技能的作用

1. **情感校准** - 在编写任何提示词之前定义目标情感
2. **四层提示词架构** - 每个提示词都包含风格 + 主题 + 情感 + 反模式
3. **批次一致性** - 创建共享风格前缀，确保整组图像在视觉上保持统一
4. **反模式检测** - 标记会触发冷淡、悲伤或临床化输出的词语或指导方向
5. **品牌一致性** - 将品牌调性映射为视觉语言（温暖的品牌 = 温暖的照片）

## 使用方法

### 为网站卡片生成图片
```
I need 3 card images for a child development psychologist website.
Brand palette: cream, coral, warm earth tones.
Cards: Motor Development, Emotional Development, Cognitive Development.
Target emotion: hopeful, warm, possibility.
Generator: Replicate Flux 1.1 Pro, 3:4 aspect ratio.
```

### 创建风格统一的博客图片集
```
Generate prompts for 13 blog articles about parenting and child psychology.
All images must feel like they're from the same photo shoot.
Brand: warm, approachable, Latin American families.
Avoid: clinical, sad, isolated figures, stock photo poses.
```

### 修正生成结果过于冷淡的图片
```
These minimalist images came back sad/cold. Here's the original prompt: [prompt].
Keep the minimalist composition but make it emotionally warm.
The image should make a parent feel "I want to be that parent" not "that's beautiful but lonely."
```

## 说明

生成极简主义图片提示词时，请严格遵循以下方法：

### 第 1 步：定义情感目标

在编写任何提示词之前，请先回答：

```
## Emotional Brief

**This image should make the viewer feel:** ________________
**The viewer should want to:** ________________
**This is NOT about:** ________________

**Emotional quadrant:**
        WARM
         |
ACTIVE --+-- CALM
         |
        COLD

Target: [e.g., Warm + Calm = nurturing serenity]
```

**关键原则**：如果无法用两个词说清楚情感，图片就会显得含糊不清。

**暖系极简主义的情感词汇：**

| 温暖 + 活跃 | 温暖 + 平静 |
|--------------|-------------|
| 愉悦、玩耍、探索 | 宁静、联结、信任 |
| 勇气、决心、自豪 | 陪伴、亲密、安全 |
| 自由、可能性、惊奇 | 耐心、温柔、专注 |

| 冷淡 + 活跃（避免） | 冷淡 + 平静（避免） |
|----------------------|---------------------|
| 焦虑、紧迫、压力 | 孤独、忧郁、空虚 |
| 沮丧、愤怒、挫败 | 孤立、临床感、无菌感 |

**用于情感定位的色彩心理学：**

| 色彩范围 | 情感效果 | 适用场景…… |
|-------------|-----------------|-------------|
| 奶油色/象牙色（#FAF8F5） | 柔和、亲切、舒适的基调 | 每张暖系极简主义图片（背景） |
| 赤陶色（#C2704F） | 质朴温暖、值得信赖、持久稳定 | 家庭、健康、教练辅导类品牌 |
| 暖粉色（#FFC0CB） | 关爱、温柔、舒缓 | 儿童发展、幼儿阶段 |
| 金色/黄色（2700K） | 快乐、活力、阳光、温馨 | 黄金时刻拍摄、客厅场景 |
| 橙色系 | 友好、驱散低落、亲切宜人 | 面向社交/社区的图片 |
| 鼠尾草绿/橄榄绿（低饱和绿色） | 自然、沉稳、值得信赖 | 与赤陶色搭配的质朴品牌配色 |

---

### 第 2 步：构建四层提示词

每个提示词都必须恰好包含四层：

```
## Prompt Architecture

[LAYER 1: STYLE] Technical photography direction
[LAYER 2: SUBJECT] Who/what is in the frame
[LAYER 3: EMOTION] Specific emotional cues
[LAYER 4: ANTI-PATTERNS] What to explicitly exclude
```

**第 1 层 — 风格前缀**（在批次中复用）：
```
Warm minimalist photography. Soft natural light, shallow depth of field,
[BRAND PALETTE TONES]. Candid moment, not posed. [DEMOGRAPHIC].
Shot on 85mm f/1.8 lens, Kodak Portra 400 film look, natural skin texture.
No text, no logos, no watermarks. Warm color temperature.
```

**胶片型号技巧**：添加“Kodak Portra 400”或“Kodak Portra 800”，可以立即带来有机的温暖感、细腻颗粒和自然肤色。与其他任何修饰语相比，仅这一条短语就能更有效地抑制 AI 默认的塑料感和临床感渲染效果。

**HEX 颜色精度**（Flux 2+）：将 HEX 代码与具体对象关联起来——`"The wall is #FAF8F5 cream"` 比 `"use #FAF8F5 in the image"` 效果更好。始终将 HEX 与颜色名称搭配使用。

关键风格调节项：
| 调节项 | 温暖方向 | 冷感方向（避免） |
|-------|---------------|----------------------|
| 光线 | 柔和自然光、黄金时刻、窗户光 | 影棚闪光灯、头顶荧光灯 |
| 背景 | 奶油色、暖色木材、洒满阳光的房间 | 纯白空间、混凝土、灰色 |
| 景深 | 浅景深（f/1.8）——亲密感 | 深景深（f/11）——纪实感 |
| 色温 | 暖色（2700-3000K 金色调，3200-4500K 日光） | 冷色（6500K+） |
| 构图 | 近距离、平视、具有包容感 | 广角、俯视、疏离 |
| 胶片型号 | Kodak Portra 400、Fujifilm Pro 400H | 不指定胶片（默认数字感） |
| 纹理 | “自然皮肤纹理、毛孔、雀斑” | “光滑皮肤、毫无瑕疵”（= 塑料感） |

**第 2 层 — 主体：**
```
A [age] [demographic] child [action verb + specific detail].
[Body language cue]. [One environmental detail].
```

规则：
- 一个动作动词、一个细节（不要写成一整段）
- 对 Flux 而言，肢体语言 > 面部表情
- 一个环境细节可以让场景更加落地（木地板、阳光明媚的花园）
- “动作进行中” > “摆姿势”（双手正在放置积木 > 手持积木）
- **始终明确指定人口统计特征**——Flux 存在训练偏差，若未指定，它会采用默认设定

**肢体语言科学**——温暖信号与冷漠信号：

| 温暖信号（使用） | 冷漠信号（避免） |
|-------------------|---------------------|
| 杜兴式微笑（眼睛眯起 + 嘴巴微笑） | 假笑（只有嘴巴笑，眼睛没有参与） |
| 直接的眼神接触、保持注视 | 眼睛转向侧面或向下看 |
| 开放姿态、双臂不交叉 | 双臂交叉于胸前（形成屏障） |
| 放松、自信的站姿 | 僵硬姿态、头向后仰 |
| 身体靠近或轻柔触碰 | 主体之间保持距离 |
| 身体前倾、保持平视 | 身体后倾、从上方俯视 |

**第 3 层 — 情绪注入：**
```
[Mood word]. [Light descriptor that reinforces mood].
```

经过验证的情绪到提示词映射：
| 目标情绪 | 提示词语言 |
|---------------|-----------------|
| 喜悦/愉悦 | “纯粹的喜悦”“大笑”“张开双臂” |
| 联结感 | “眼神接触”“面庞靠近”“保持平视” |
| 好奇心 | “高度专注”“双手正在动作”“微微一笑” |
| 安全感 | “轻柔触碰”“双方都很自在”“平静交谈” |
| 自豪感 | “昂首挺立”“坚定”“刚刚完成某事” |
| 可能性 | “向上看/向前看”“即将”“发生前的瞬间” |

**第 4 层——反模式拦截器：**

会使 AI 生成器产出冷清/悲伤氛围的词语：

| 绝不要使用 | 改用 |
|-----------|-------------|
| `alone`, `solitary`, `quiet room` | `single subject, clean background` |
| `studio lighting`, `white background` | `soft natural light, warm background` |
| `looking at camera`, `posing` | `candid moment`, `mid-action` |
| `dark`, `moody`, `dramatic` | `warm`, `soft`, `gentle` |
| `black and white`, `monochrome` | `warm tones`, `earth tones` |
| `empty`, `vast`, `sparse` | `minimal`, `clean`, `uncluttered` |
| `pensive`, `thoughtful`（单独出现时） | `focused`, `curious`, `engaged` |
| `sitting alone` | `sitting with [object/activity]` |
| `perfect`, `flawless`, `symmetry` | `natural`, `authentic`, `organic` |
| `smooth skin`, `airbrushed` | `natural skin texture`, `pores`, `subtle imperfections` |
| `3D render`, `CGI`, `hyperrealistic` | `photography`, `candid`, `film look` |

**负面提示词后缀**（附加到每个用于 Flux 的提示词末尾）：
```
--no plastic skin, glossy surfaces, artificial lighting, airbrushed,
sterile, clinical, 3D render, CGI, harsh shadows, cool tones
```

---

### 第 3 步：生成前验证

发送到 API 之前，请检查以下清单：

```
## Pre-Generation Checklist

- [ ] Can I name the target emotion in 2 words?
- [ ] Does the subject have an ACTION (not just a state)?
- [ ] Is there at least one warmth signal (light, touch, smile, color)?
- [ ] Are there zero isolation signals (alone, empty, quiet)?
- [ ] Is the demographic consistent with the brand?
- [ ] Does the style prefix match the batch?
```

---

### 第 4 步：评估生成的图像

对每张生成的图像进行评分：

```
## Image Evaluation

**Emotional hit?** [Yes/No] — Does it trigger the target emotion within 2 seconds?
**Warmth level:** [1-5] — 1=clinical, 3=neutral, 5=cozy
**Brand fit:** [Yes/No] — Does it feel like it belongs on the brand's site?
**Minimalism quality:** [Clean/Busy] — Is the composition uncluttered?
**Stock photo test:** [Pass/Fail] — Would you mistake this for generic stock?

If emotional hit = No → rewrite Layer 3 (emotion) first
If warmth < 3 → add warm lighting/color cues to Layer 1
If stock photo test = Fail → make Layer 2 more specific (exact age, exact action)
```

---

### 第 5 步：针对失败结果进行迭代

常见的失败模式及修复方法：

| 问题 | 根本原因 | 修复方法 |
|---------|-----------|-----|
| 图像很美，但显得悲伤 | 提示词中存在孤立信号 | 添加联结（人物+人物或人物+活动） |
| 图像温暖，但很普通 | 主体过于模糊 | 添加一个极其具体的细节（使用“木制积木”而不是“玩具”） |
| 图像看起来像图库照片 | “看着镜头”或“微笑” | 改为抓拍动作进行中的瞬间 |
| 同一批次的风格不一致 | 风格前缀不同 | 完整复制粘贴完全相同的第 1 层 |
| 年龄/人群特征错误 | 生成器采用默认设定 | 明确指定：`4-year-old`、`Latin American` |

## 平台专用指南：Flux 1.1 Pro

> Flux 是生成温暖极简摄影图像的首选生成器。以下规则专用于 Flux。

### 语法规则
- **要像在与摄影师交谈一样写作**，而不是像在搜索引擎中输入关键词
- Flux 使用自然语言——使用完整句子，**不要**使用逗号分隔的关键词列表
- **30-80 个单词是最佳长度**——控制在 200 个 token 以内可获得最佳质量
- **不要使用提示词权重**——`(text:1.5)` 会被忽略。请改用“with emphasis on X”
- **明确指定人口统计特征**——Flux 的训练数据存在偏差，如果未指定，默认会生成西方人、白人或年轻人

### 推荐结构
```
[Subject + specific details] performing [action] in [environment],
[lighting: direction + quality + time of day],
shot on [camera/lens], [film stock reference],
[composition note], [emotional tone],
natural skin texture, candid moment
--no [anti-patterns]
```

### 相机文件名技巧（Raw 模式）
若要获得超写实效果，请在提示词前添加相机文件名：
- `IMG_2847.HEIC`——iPhone 随手拍的真实感
- `IMG_5847.CR2`——佳能 DSLR 原始影像美学
- `DSC03291.ARW`——索尼相机质感

**示例**：`IMG_2847.HEIC A mother and child laughing together at a café table, soft window light, slightly grainy, Kodak Portra 400 warmth, authentic moment`

### Raw 模式
Flux Raw 模式会加入自然的不完美之处：皮肤纹理、真实光线和自然的不对称。最适合人像和生活方式摄影。使用简洁的提示词——让写实引擎自行发挥。

### 宽高比
- **3:4**——纵向卡片、服务页面（推荐用于网站卡片）
- **4:5**——Instagram、竖版生活方式图片
- **16:9**——博客头图、主视觉图片
- **1:1**——社交媒体、头像图片

---

## 示例

### 示例 1：儿童发展网站卡片

**背景**：为儿童心理学家的网站制作 3 张服务领域卡片。品牌风格温暖、亲切，采用奶油色/珊瑚色配色。目标受众：希望了解孩子成长发展的父母。

**输入**：
> 为 Desarrollo Motor、Emocional、Cognitivo 生成 3 张卡片图片。温暖极简风格，Flux 1.1 Pro，3:4 比例。

**输出**：

**风格前缀（共用）：**
```
Warm minimalist photography. Soft natural light, shallow depth of field,
warm cream and beige tones. Candid moment, not posed. Latin American family.
Shot on 85mm f/1.8 lens. No text, no logos, no watermarks.
Warm color temperature, hopeful joyful mood.
```

**卡片 1——Desarrollo Motor**（情感：充满喜悦的可能性）
```
[STYLE PREFIX] A 4-year-old child mid-jump on warm wooden floor, arms wide
open, barefoot. Pure delight and concentration on face. Soft motion blur on
hands. Single subject, clean warm background. The moment right before
landing — suspended possibility.
```

**卡片 2——Desarrollo Emocional**（情感：亲密联结）
```
[STYLE PREFIX] A mother crouching at eye level with her 5-year-old daughter,
faces close, gentle smiles, eye contact. Golden hour light. Intimate
connection between adult and child. Minimal warm background, soft cream tones.
```

**卡片 3——Desarrollo Cognitivo**（情感：宁静的好奇心）
```
[STYLE PREFIX] A 6-year-old child sitting cross-legged on the floor, deeply
focused building a tall wooden block tower. Hands mid-action placing a block.
Calm concentration on face, slight smile. Soft overhead natural light,
earth tones.
```

**为什么有效**：每张图片都有一种明确的情绪、一个具体的动作、温暖的光线，并且没有孤立感信号。共用的风格前缀确保了整组图片在视觉上的一致性。

---

### 示例 2：修复一张“美丽但悲伤”的图片

**背景**：为一篇关于“不吼叫也能设定界限”的博客文章生成了一幅极简主义插画，画面中一名女性独自蹲着。艺术方向是“极简主义”，但生成结果给人一种忧郁感。

**输入**：
> 生成的极简主义线稿太悲伤了。画面是黑白的，一个女人独自蹲着。修复它。

**失败原因分析：**
- `alone` → 孤立感信号
- `black and white` → 消除了温暖感
- `crouching` 缺乏上下文 → 看起来像是受挫落败
- 没有其他人物或活动 → 传达出孤独感

**修复后的提示词：**
```
Warm minimalist photography. Soft natural light, shallow depth of field,
warm cream and beige tones. Candid moment, not posed.
Shot on 85mm f/1.8 lens. No text, no logos, no watermarks.
Warm color temperature.

A mother and 4-year-old child sitting face to face on a couch, mother
holding both of child's hands gently, calm conversation. Both at ease.
Warm living room light filtering through curtains.
```

**改动内容：**
- 独自一人 → 两人相伴（联结感消除了孤独感）
- 黑白 → 暖色调（色彩 = 生命力）
- 蹲着 → 面对面坐着（彼此平等，而非受挫落败）
- 增加了环境的温暖感（沙发、客厅灯光）

---

## 技能边界（前沿识别）

### 此技能擅长：
- 生成由 3 至 20 多张图片组成、风格一致的系列
- 温暖／亲切的品牌（家庭、健康、教育、教练服务）
- 照片级写实 AI 生成器（Flux、Midjourney v6+、DALL-E 3）

### 此技能不适合：
- 需要冷峻／临床式美学的品牌（科技、奢侈品、医疗）→ 相应调整第 1 层
- 抽象／概念性图片（信息图、示意图）→ 改用 `data-visualizer` 技能
- 产品摄影 → 需要不同的提示词架构
- 插画风格（水彩、矢量、线稿）→ 针对插画类生成器调整第 1 层

### 质量检查点

接受输出之前，请确认：
- [ ] 2 秒直觉检查：图片是否能让你感受到目标情绪？
- [ ] 温暖度评分 >= 5 分中的 4 分
- [ ] 构图中没有意外的孤立感信号
- [ ] 与同批次的其他图片保持一致（相同光线、相同色调）
- [ ] 不会被误认为普通的图库照片

---

## 迭代指南

> “第一次输出只是起点，而不是终点。”

### 推荐的迭代模式

| 轮次 | 重点 | 要提出的问题 |
|------|-------|------------------|
| **第 1 轮** | 情绪 | “能否在 2 秒内让人感觉情绪是对的？” |
| **第 2 轮** | 具体性 | “这是否过于普通？加入哪个细节能让它变得独特？” |
| **第 3 轮** | 一致性 | “这是否与系列中的其他图片一致？” |
| **第 4 轮** | 品牌 | “客户能否认出这是他们的品牌？” |

### 实用的后续提示词

- “图片很温暖，但感觉过于普通。为主体添加一个极其具体的细节。”
- “情绪过于[强烈／含蓄]。通过调整肢体语言将其[减弱／增强]。”
- “背景太杂乱了。将其简化为[一个元素]，并增强散景效果。”
- “这看起来像图库照片。让孩子的动作更具体——他们的手究竟在做什么？”

---

## 检查清单与模板

### 批次简报模板

```
## Image Batch Brief

**Brand:** ________________
**Palette:** ________________
**Demographic:** ________________
**Generator:** Flux 1.1 Pro / Midjourney v6 / DALL-E 3
**Aspect ratio:** ________________
**Number of images:** ________________

### Style Prefix (copy-paste for ALL prompts)
[Write once, use everywhere]

### Per-Image Briefs
| # | Subject | Target emotion (2 words) | Specific action |
|---|---------|--------------------------|-----------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
```

### 危险信号检查清单

```
## Warning Signs in Your Prompts

- [ ] Any word from the "NEVER use" list (alone, empty, dark, moody, studio)
- [ ] Subject has no action verb (just standing/sitting with no activity)
- [ ] No warmth signal (no mention of light quality, color temperature, or human connection)
- [ ] Demographic not specified (generator will default to its biases)
- [ ] More than 3 adjectives in a row (over-direction = generic output)
- [ ] Prompt longer than 80 words (Flux sweet spot is 30-80 words, degrades past 200 tokens)
```

## 参考资料

### 核心方法论
- Norman, Don。《情感化设计》（2004）——设计处理的三个层次（本能层、行为层、反思层）
- Annie Leibovitz。人像摄影大师课——以光线表达情感
- Kittl x Savee。《2026 年设计趋势报告》——暖调极简主义成为主导趋势

### Flux 与 AI 图像生成
- [Black Forest Labs 提示词指南](https://docs.bfl.ai/guides/prompting_summary)——Flux 官方提示词最佳实践
- [Flux 2 提示词指南（fal.ai）](https://fal.ai/learn/devs/flux-2-prompt-guide)——使用 JSON/HEX 颜色的结构化提示词
- [Flux Raw 模式指南（Segmind）](https://blog.segmind.com/flux-1-1-pro-raw-mode-for-creating-natural-realistic-images/)——自然的不完美感
- [BFL 官方 Skills 仓库](https://github.com/black-forest-labs/skills)——符合 AgentSkills 规范的提示词模式
- [Kodak Portra 400 Midjourney 风格（Midlibrary）](https://midlibrary.io/styles/kodak-portra-400)——胶片参考

### 色彩心理学与神经科学
- [摄影中的色彩心理学（Skylum）](https://skylum.com/blog/color-psychology-for-photographers)——冷暖色调与情绪反应
- [视觉环境与热感觉（ScienceDirect）](https://www.sciencedirect.com/science/article/pii/S0306456523000293)——80% 的实验表明视觉与热感觉之间存在关联
- [照片中的低温感会增强认知控制（ScienceDaily）](https://www.sciencedaily.com/releases/2017/04/170410085010.htm)——暖色令人放松，冷色使人警觉

### 摄影技巧
- [摄影师必备的肢体语言指南（SLR Lounge）](https://www.slrlounge.com/photographers-essential-guide-body-language/)——传递温暖与冷漠的姿态线索
- [摄影构图权威指南（Anton Gorlin）](https://antongorlin.com/blog/photography-composition-definitive-guide/)——使用框中框构图营造亲密感
- [修复 AI 塑料感皮肤（Rezience）](https://andyhtu.com/fixing-plastic-ai-skin/)——用于呈现真实纹理的负面提示词
- [120 多个 Stable Diffusion 负面提示词（ClickUp）](https://clickup.com/blog/stable-diffusion-negative-prompts/)——反模式词汇列表

### 温暖极简主义趋势
- [2026 年温暖极简主义趋势（Good Housekeeping）](https://www.goodhousekeeping.com/home/decorating-ideas/a69926948/new-warm-minimalism-trend/) - “少而精”
- [大地色系配色灵感（Rose Benedict Design）](https://rosebenedictdesign.com/2025/01/31/earthy-color-palettes/) - 大地色调在品牌中的应用

### 艺术指导方法论
- [如何撰写摄影简报（Milanote）](https://milanote.com/guide/photoshoot-brief) - 简报中的情感目标
- [面向摄影师的创意简报（VSCO）](https://www.vsco.co/learn/creative-photography-briefs) - SMART 情感标准

## 相关技能

- [design-trends-2026](../design-trends-2026/) - 可与之保持一致的当前视觉趋势
- [brand-strategy](../../branding/brand-strategy/) - 确定视觉方向前的品牌基础
- [image-batch](../../automation/image-batch/) - 后期处理（调整尺寸、压缩、WebP）

---

## 技能元数据

```yaml
name: minimalist-image-director
category: ai-design
subcategory: art-direction
version: 2.0
author: GUIA
source_expert: Editorial Photography + Don Norman (Emotional Design) + Color Psychology + Neuroscience of Visual Perception + Black Forest Labs (Flux)
source_work: null
difficulty: intermediate
mode: centaur
estimated_value: Art director day rate (~500-800 EUR/day)
tags: [image-generation, art-direction, minimalism, flux, replicate, midjourney, brand-photography, emotional-design, color-psychology, warm-minimalism, kodak-portra]
created: 2026-02-12
updated: 2026-02-12
```

---

*此技能是 GUIA 高级营销技能库的一部分——该技能库的 201 层连接了 AI 基础知识与技术实现。*