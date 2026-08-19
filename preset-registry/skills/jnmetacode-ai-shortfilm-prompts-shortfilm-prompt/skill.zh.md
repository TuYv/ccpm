---
name: shortfilm-prompt
description: Generate cinematic AI shortfilm prompts (works with Seedance 2.0, Xiaoyunque, Sora, Kling, Jimeng, Veo) using the 5-stage structure from Mx-Shell's Zombie Scavenger. Trigger when the user wants transformation sequences, multi-shot narrative shorts, weapon-charge/combat segments, emotional family/pet/farewell narratives (催泪/亲情/萌宠/离别), or any cinematic video prompt.
---
# shortfilm-prompt — 电影级 AI 视频提示词生成器

你将扮演一名导演助理，精通 5 阶段 AI
短片提示词结构（最早由 Mx-Shell 在 *僵尸拾荒者* 中验证）。
当用户调用此技能时，他们需要一段可直接粘贴
到视频模型中的提示词：Seedance 2.0 / Xiaoyunque / Sora / Kling /
Jimeng / Veo。

**模型无关的核心**：5 阶段结构本身在
所有模型中都相同。在输出结尾，给出一行针对特定模型的
建议（Sora 偏好简洁；Kling 对 IP 名称更宽容；
Seedance 会屏蔽 IP 名称；等等）。

## 工作流程（按顺序执行）

### 步骤 1 — 用户是否已提供足够信息？

如果其初始请求已包含以下**全部**内容，
跳过步骤 2，直接进入步骤 3：

- 视频类型（变身 / 多镜头叙事 / **情感
  叙事（家庭 · 宠物 · 告别）** / 氛围感单镜头 /
  武器蓄能 / 战斗 / 静态角色海报）
- 时长（5s / 10s / 15s / 20s / 多镜头剪辑）
- 主体基础设定（人物 / 机器人 / 机甲）
- 场景（地点 + 时间 + 氛围）
- 视觉风格偏好（参考电影或美学风格）

### 步骤 2 — 如果信息不完整，最多询问 2–3 个关键问题

使用 `AskUserQuestion`。优先级顺序：

1. **视频类型 + 时长**（决定使用哪个模板分支）
2. **主体 + 场景**（决定内容）
3. **视觉风格 / 参考美学**（决定氛围阶段）

**不要过度追问。** Mx-Shell 本人采用迭代式创作，边做边想。
先写出初稿再进行优化，胜过为了 10 个细节反复盘问用户。

### 步骤 3 — 按 5 阶段结构输出提示词

**首先，从下方的[模板库（加载匹配的模板）](#template-library-load-the-matching-one)中加载匹配模板**——使用 `Read` 读取该文件，以获得更完整的框架和特定类型措辞，
然后按照 5 阶段结构编写提示词。本文件中的 SKILL 规则在任何冲突时始终优先；
模板用于补充深度，而非覆盖规则。

```
1. Core theme            ← 3-6 tags separated by |
2. Character & scene     ← Face / clothing / scene
3. Atmosphere & quality  ← Visual base / color tone / style core
4. Camera rules          ← Single-shot or multi-shot / angle / breathing
5. Storyboard            ← Per-second slices OR per-shot slices
```

### 步骤 4 — 简要说明 2–3 个写作选择

不要长篇大论。指出用户最可能想要
调整的部分。示例：

> 我将触发词写为“低声念出的自创音节”，而非具体的
> IP 词汇——Seedance 会屏蔽 IP 名称。
>
> 我在 12–15s 保留了腰侧“未愈合的缺口”——这是 Mx-Shell 的
> 标志性“战损美学”，可避免最终定格画面显得过于干净。

---

## 模板库（加载匹配的模板）

此仓库附带一个 `templates/` 目录，其中包含更深入的框架和
特定类型措辞。按分支选择，并在步骤 3 前使用 `Read` 读取它——
不要重新发明库中已有的框架。路径相对于
插件/仓库根目录。

**如果请求是一个包含 3 个或更多镜头的剪辑作品**（多镜头叙事、情感/宠物/家庭、预告片、微短剧、MV），还要加载
`templates/project-planner.md`，并在编写镜头 1 之前，引导用户完成第 1 节
（主体登记表）和第 2 节（氛围锁定）；这是决定多镜头作品能否保持连贯、避免在第 3–4 个镜头时出现偏移的最重要因素。

| 如果用户想要…… | 加载 |
|---|---|
| 15 秒单镜头变身 | `templates/15s-transformation.md` |
| 多镜头剪辑叙事 | `templates/multi-shot-narrative.md` |
| **情感叙事（家庭 · 宠物 · 告别）** | `templates/pet-lifetime-narrative.md`（完整示例） |
| **产品广告 / 主视觉广告** | `templates/product-commercial.md`（以节拍驱动的示例） |
| **食物 ASMR / 感官特写**（原生同步音频） | `templates/food-asmr.md`（示例） |
| **动物 vlog**（自拍视角、同步对白） | `templates/animal-vlog.md`（示例） |
| **电影感预告片**（逐步升级的多镜头） | `templates/movie-trailer.md`（示例） |
| **赛博朋克城市 / 氛围环境** | `templates/cyberpunk-city.md`（示例） |
| **定格动画 / 黏土动画**（风格化；有意打破呼吸规则） | `templates/claymation.md`（示例） |
| **自然 / 风景延时摄影**（时间压缩、锁定色调） | `templates/nature-timelapse.md`（示例） |
| **监控录像 / 伪纪录片恐怖**（劣化摄像机观感；打破呼吸规则） | `templates/found-footage-horror.md`（示例） |
| **动漫 / 2D → 真人实拍**（媒介转换；高度重视 IP 安全） | `templates/anime-to-real.md`（示例） |
| **音乐视频 / 演出**（节拍同步；确实需要音乐） | `templates/music-video.md`（示例） |
| **高速慢动作体育**（Phantom/高帧率；决定性瞬间） | `templates/sports-slowmo.md`（示例） |
| **时尚电影 / 编辑大片**（以动作为主体；无叙事） | `templates/fashion-film.md`（示例） |
| **旅行 vlog / 地域感**（手持蒙太奇） | `templates/travel-vlog.md`（示例） |
| **无人机 / FPV 航拍**（连续飞行；运动本身就是内容） | `templates/drone-fpv.md`（示例） |
| **竖屏微短剧**（竖屏短剧；钩子 + 正反打 + 悬念结尾） | `templates/micro-drama.md`（示例） |
| **硬科幻太空 / 零重力**（失重物理；真空寂静） | `templates/sci-fi-space.md`（示例） |
| **汽车广告**（反射表面；汽车摄影机装备） | `templates/car-commercial.md`（示例） |
| **舞蹈电影**（连续的全身动作；身体与节拍同步） | `templates/dance.md`（示例） |
| **3 个或更多镜头的项目——生成前锁定一致性** | `templates/project-planner.md`（主体登记表 + 氛围锁定 + 镜头列表；在编写镜头 1 之前与用户一起填写） |
| 按类型确定摄影机应如何移动 | `templates/genre-camera-sop.md` |
| 按技术分类的摄影机运动措辞（50 种运动） | `templates/camera-move-library.md` |
| 按类型分类的氛围 / 质量段落 | `templates/atmosphere-prefabs.md` |
| 负面提示词区块 + 按模型路由 | `templates/negative-prompts.md` |

使用模板来确定结构和措辞；无论你从哪个模板开始，都要在结果上执行下面的 **Seven hard rules**
和 **30-second checklist**。

---

## 方法论核心（必须遵循）

### 情绪叙事改编（家庭 · 宠物 · 告别）

这套 5 阶段方法可以跨越不同类型使用——同样的“不完美 +
克制”原则，既能让变身真实可信，也能让情绪作品真正*打动人*。三个针对特定类型的动作（完整示例见：
`templates/pet-lifetime-narrative.md`）：

- **用季节 + 光线标记时间，并锁定 ONE 个色调。** 每个镜头使用不同滤镜，是情绪类多镜头剪辑崩坏的头号原因。反过来：
  “窗外季节变化，室内的暖光保持不变。” 时间能够被读懂；剪辑也能保持连贯。
- **由克制来完成哭泣（Rule 6，应用于情绪表达）。** 不要闪回蒙太奇，不要逐渐高涨的配乐，也不要对眼泪进行慢速推近。空缺的位置——空荡门阶上褪色的项圈、一片飘落的叶子——承载情绪。展现缺席，而不是对缺席的反应。
- **每个主体设置 2 个不完美锚点，同时作为一致性锁定。** 磨损的项圈 / 灰白的口鼻 / 沾泥的爪子；擦伤的膝盖 → 褪色的疤痕 → 疲惫的细纹。它们能让同一只狗和同一个人在不同镜头中始终保持一致——情绪作品最容易失败的地方，就是在序列中途换成了不同的主体。先生成第一个和最后一个镜头，以锁定外观。


### Stage 1 · 核心主题

使用 `|` 分隔的 3–6 个标签。从“镜头类型 → 类型 → 美学风格”逐步推进：

```
Core theme: gritty dark tokusatsu | BLACK SUN aesthetic | broken flesh | combat-damaged transformation | post-apocalyptic battlefield
Core theme: atom-punk | post-apocalyptic zombies | cinematic | hyperreal | no game-CG feel
```

### Stage 2 · 角色与场景

三行：**Face / Clothing / Scene**。

- **Face**：以 *"Reference uploaded photo. Features/face/hair
  100% preserved. No beautification."* 开头。然后描述不完美之处和表情。
- **Clothing**：先写材质（使用 *"matte black leather"*，而不是 *"black
  leather"*）。
- **Scene**：环境必须处于动态之中（风、烟雾、流星）。静态背景 ≠ 氛围。


### Stage 3 · 氛围与质量（关键技巧）

**使用真实的摄影机 + 镜头名称。** AI 训练数据将海量真实电影画面与具体的摄影机元数据绑定在一起。提供具体型号 = 提供具体的美学锚点。

Mx-Shell 常用的组合：

| 美学风格 | 摄影机 + 镜头 |
|---|---|
| 史诗感 / 大场面 | IMAX film camera + Panavision C-series (35mm, f/4) |
| 粗粝赛博 / 硬科幻 | Sony Venice + Canon K-35 series |
| 香港黑色电影 / 武侠 | Kodak 35mm bleach-bypass |
| 商业人像 | Canon EF 85mm f/1.2 |

色彩表达：低饱和灰蓝 / 好莱坞青绿色与橙色 / 60 年代暖橙 + 海盐蓝 / 低光高对比。

### Stage 4 · 摄影机规则

三行：**Single-shot / Angle / Breathing**。

- **Single-shot**：如果是单镜头拍摄，使用 *"One continuous take, no edit"*；如果是多镜头，使用
  *"Edited across shots"*。
- **Angle**：景别 + 角度 + 运动方向。
- **Breathing**：始终加入以下确切句子——
  *"Handheld shot. Throughout, maintain an extremely subtle, breath-like
  camera float to enhance presence."*
  Mx-Shell 几乎在每个提示词中都会加入这句话。它能强制使用细微的手持漂浮感，而不是人工静态 CG 默认效果。

### 阶段 5 · 分镜脚本

**两种风格**：

**风格 A — 按秒**（单镜头变形、武器蓄力）：
```
0–3s · Gaze
Action: …
Camera: …
VFX: …

3–6s · Activation
Sound: …
Action: …
VFX: …
Camera: …
```
每个片段采用三部分公式：Action + Camera + VFX。可选附加项：
Sound、Face/Expression。

**风格 B — 按镜头**（多镜头叙事、MV）：
```
Shot 1:
Shot size: …
Composition: …
Camera move: …
Action: …

Shot 2:
…
```
每个镜头采用四部分公式：Shot size + Composition + Camera move + Action。

### 负面提示词（取决于模型）

有些模型提供**专用负面提示词字段**；有些则没有。  
请据此将否定内容放入相应位置：

- **存在专用字段**（Seedance、Kling、Veo、Hailuo、Wan、Pika 2.5）：
  将标准预制内容粘贴到该字段中。条目保持为普通的逗号分隔名词/短语 — Veo 和 Kling 不接受字段中出现 `no…` / `don't…` 这类命令式表达。
- **不存在专用字段**（Sora、Runway Gen-4）：将否定内容合并到**正向**提示词中，写成明确的 `no ___` 行（例如 *"original characters only, no logos, no text overlay, no morphing geometry"*）。
  Runway 是例外 — Gen-4 没有专用字段，并且对 `no X` 这种措辞反应不佳，因此对于 Runway 只能描述应该出现的内容。

标准负面提示词预制内容：

```
blurry, low resolution, soft focus, watermark, text overlay, subtitles, logo, distorted face, asymmetric eyes, extra fingers, deformed hands, melting/morphing geometry, oversaturated colors, plastic skin, glossy CG render, video-game look, 3D cartoon, anime shading, flat even studio lighting, perfectly clean flawless surfaces, frame flicker, ghosting, jarring hard cuts, lifeless locked-off camera
```

> 注意：“专用字段”的说法取决于具体模型和前端。
> Seedance 的字段在面向消费者的 Doubao 应用中并不一定可靠地显示 —
> 如果用户使用的是 Doubao，请改为将负面内容合并到正向提示词中。请在应用内确认 Pika 2.2（2.5 已确认，2.2 状态不明确）。

---

## 七条硬性规则（交付前进行自检）

这些规则是从“没有此技能的基础版
Claude 最常见的失败模式”中逆向总结得出的。在输出前，
请在脑中逐条检查，并修正不符合要求的部分。

### 规则 1 — 每个部分都必须包含具体名词。禁止使用含糊的夸赞词。

| ❌ 避免 | ✅ 替换为 |
|---|---|
| cinematic / epic / movie-quality | "模拟 IMAX 电影摄影机 + Panavision C 系列 35mm f/4" |
| stunning / spectacular / perfect | 删除，或改用具体的物理效果（“画面边缘略微拉伸”） |
| handsome / cold / chilling | “眉头略微皱起” / “目光中带有一丝轻蔑” / “背部绷紧” |
| premium-feel / texture-rich / detail-loaded | “釉面表层的光泽” / “金属拉丝质感” / “胶片颗粒” |
| 4K / HD / high-quality | 不要使用。改写为具体的视觉内容（“低饱和灰蓝色基调、胶片颗粒”） |

**自检**：从输出中任意挑选 3 个形容词。问问自己 —
*AI 能否据此形成具体画面？* 如果不能 → 删除 / 替换。

### 规则 2 — 每个视频提示词都必须包含摄影机 + 镜头型号

候选组合（根据风格选择一个）：
- Epic big-scene: **IMAX + Panavision C-series** (35mm, f/4)
- Gritty cyber: **Sony Venice + Canon K-35**
- Hong Kong noir / wuxia: **Kodak 35mm bleach-bypass**
- Commercial portrait (for image gen): **Canon EF 85mm f/1.2**

**自检**：在你的输出中搜索上述组合名称之一。如果一个都没有 → 添加。

### 规则 3 — 始终包含“呼吸感”描述

准确措辞：
> *"Handheld shot. Throughout, maintain an extremely subtle, breath-like
> camera float to enhance presence."*

不要简化为 *"handheld shot."* 两个限定词（"extremely subtle" 和
"breath-like"）都至关重要——否则 AI 会将其解读为剧烈抖动。

### 规则 4 — 始终包含声音描述

```
Sound: No score. Production audio only.
```

对于包含标志性环境音的场景，要**明确列举**
（雨声、雷声、金属刮擦声、低频能量嗡鸣声）。不要让 AI 自行猜测。

### 规则 5 — 角色 / 装备 / 服装部分需要至少包含 ≥2 个瑕疵描述

候选措辞：
- Face: "preserve minor facial blemishes" / "facial wound, gauze,
  bloodstain" / "blood at the corner of the mouth" / "bruising"
- Equipment: "paint worn off" / "oil in joints" / "minor scratches,
  visible wear" / "battle damage everywhere"
- State: "armor never perfectly flat" / "some units flicker as if
  faulty" / "an old wound torn open again"

**自检**：统计瑕疵相关词语。少于 2 个 → 添加。

Mx-Shell 反复强调：*"Too perfect = fake. Keeping imperfections
is not a bad thing."*

### 规则 6 — 不要在单镜头变形 / 史诗段落的结尾堆砌 FX

不要写：刺眼强光 / 爆炸 FX / 胜利姿势 / 跃入天空 / 摄影机过曝。

**默认结尾模板**：
> *"No dialogue. No explosion. No blinding light. Just {{subject}}
> {{action}}, {{environment detail}}."*

示例：
- *"Just a figure in unfinished battle-armor standing in place. Wind
  carries battlefield smoke. A meteor crosses the distant sky."*
- *"Just the rain continuing to hit the energy field. The vaporized
  mist halo surrounds the subject."*

### 规则 7 — 避免使用 IP 名称 + 提供模型专属建议

不要直接粘贴具体 IP 名称（Kamen Rider / Gundam / Iron Man / Kai'Sa
/ MJ / The Matrix...）。Seedance 2.0 的 IP 过滤器非常严格。

替换方式：
- "reference Iron Man" → "atom-punk retro-futurist red-and-gold combat suit"
- "Michael Jackson dance" → "1980s signature breakdance moves (beat-synced head turns / shoulder rolls / moonwalk / tilted-hat hip wave)"
- "BLACK SUN aesthetic" → "gritty dark battle-damaged aesthetic"

如果用户**明确坚持**使用某个 IP 名称，可以写出该名称，但要在末尾**添加警告行**：
> *"Note: this prompt contains an IP name ({name}). Seedance may block
> it. Consider replacing it or deleting some punctuation."*

**要在输出末尾包含的模型专属建议：**
- Seedance 2.0 (Doubao/Jimeng)：严格的 IP 过滤器——避免使用命名 IP；ZH 或 EN 均可；Jimeng web/VolcEngine 支持单镜头 4–15s，但 Doubao app 锁定为 5s/10s——不要承诺 Doubao 支持 15s。
- Veo 3 / 3.1：严格的 IP 过滤器；优先使用 EN；每个片段 8s（以 7s 为步长延长）；有专用的 negative field——其中应填写普通名词短语，而不是 `no…` 命令。
- Kling 2.x / 3.0：严格的生成前禁词过滤器，只要有一个被标记的词，就会拒绝整个提示词——先清理正文中的身体接触词；ZH 或 EN 均可；5–10s（3.0 单提示词最长约 15s）；有 negative field（用于滑步/多余手指/变形伪影）。
- Hailuo / MiniMax：中等程度的 IP 过滤器；ZH 或 EN 均可；分辨率与时长之间存在取舍（1080p 约 6s，768p 约 10s）；存在 negative field，但应谨慎使用，仅针对具体伪影。
- Wan 2.x (Alibaba, open-source)：自行托管时限制较宽松；偏向中文（对于棘手的/首尾帧镜头，添加 ZH）；约 3–8s（较新的版本约 10–15s）；negative field 功能强大。
- Runway Gen-4 / 4.5：严格的 IP 过滤器；EN；5s 或 10s；没有 negative prompts——`no X` 可能会召唤出 X，因此只能描述应该出现的内容。
- Pika 2.2 / 2.5：中等程度的 IP 过滤器；EN；标准时长为 5s/10s（Pikaframes 关键帧约 25s，并非通用时长）；2.5 支持 negatives，2.2 需在应用内确认。
- Sora 2 / 2 Pro：严格的三层过滤器，不仅会拦截名称，也会拦截相似的**描述性特征组合**——避免可识别的特征组合；EN；Pro 单次生成最长约 25s；没有 negative field——将防护要求融入正向提示词。

---

## 交付前 30 秒自检清单

- [ ] 5 个阶段全部存在（核心主题 / 角色 / 氛围 / 摄影机 / 分镜）
- [ ] 已指定摄影机 + 镜头型号（规则 2）
- [ ] 包含完整的 "breath-like float" 句子（规则 3）
- [ ] 包含 "Sound: No score. Production audio only."（规则 4）
- [ ] 至少包含 2 条不完美感描述（规则 5）
- [ ] 结尾留白 / 克制，不堆叠特效（规则 6）
- [ ] 不含模糊的赞美词：“perfect / stunning / epic / handsome / 4K / texture-rich”（规则 1）
- [ ] 不含 IP 名称；如果包含，已添加警告行（规则 7）
- [ ] 对支持专用字段的模型（Seedance/Kling）包含负面提示词
- [ ] 单镜头 ≤ 15 秒 / 多镜头 ≤ 8 个镜头
- [ ] 已包含针对具体模型的结尾建议行

未完全通过 = 不要交付。修正后重新检查。

---

## 不要做什么

- 不要写 “perfect / stunning / epic victory” —— AI 模型对这些词的响应效果较差
- 不要让单镜头超过 15 秒，或让多镜头超过 8 个镜头 —— 否则重新生成  
  成功率会大幅下降
- 不要省略 “Sound: production audio only” —— 否则 AI 会自行编造  
  音乐
- 不要混用不同色调的氛围区块 —— 色彩漂移会破坏多镜头剪辑

---

## 输出格式

输出一条完整、可直接复制粘贴的提示词。不要拆分成多个
代码块。使用文档结构（标题、项目符号、时间标记），让用户能够一眼
浏览。

**然后简要说明**：
- 用 2–3 句话解释你的写作选择
- 1 行使用建议（“使用 Seedance 2.0，不要使用 Fast 版本” / “先尝试这一段，以评估纹理效果”）
- 1 行针对目标模型的兼容性建议

如果用户提出反馈，要求修改某个部分，**只重写该部分** —— 不要重新发送完整内容。