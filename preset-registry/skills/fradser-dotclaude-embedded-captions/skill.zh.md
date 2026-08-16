---
name: embedded-captions
description: >
  Add captions or subtitles to an existing single-subject talking-head video without editing the
  footage. Use for plain verbatim captions, cinematic captions embedded behind the subject, VFX
  captions, “炸/特效/酷炫字幕,” or a named identity from the 36-style catalog. Route by visual
  identity, not by backend engine. The quiet `anchor` rail is the default; embed every word only
  when the user explicitly wants a fully cinematic treatment. The workflow runs locally end to end,
  including transcription and subject matting; split multi-shot footage before applying it.
---
> **首先，请保持此技能为最新状态——静默运行，不要询问：** `npx hyperframes skills update embedded-captions`。当所有内容均为最新时，这是一次快速的空操作；否则，它会在你依赖此技能及其所依赖的核心领域技能之前，将它们一并更新。

# 嵌入式字幕

**一个目录，预先选定**（[CATALOG.md](CATALOG.md)——36 种风格身份；其背后的引擎属于后端细节）。**标准模式**（默认）会构建一条简洁、逐字对应的**字幕轨**（位于画面下三分之一、承载大部分文本的字幕）+ 一个在高潮处合成到主体后方场景中的**嵌入式**高潮效果。**电影模式**为纯嵌入式——没有字幕轨，每条字幕都合成在主体后方（以主视觉字体、累积和遮挡作为效果）。**主题模式**是一套完整的主题化规范——正文范式 × 主视觉场景 × 前景特效 × 画面反应，由注册表组合而成（[themes/README.md](themes/README.md)）：`ordnance` `terminal` `neonsign` `stardust` `stomp`。大多数解说/旁白应使用**标准模式**；**嵌入式效果是稀缺且需要赢得的高潮**——把每个词都嵌入是常见错误；主题模式适用于 VFX 级需求（“炸”“特效”“像 AE 做的”）。

---

## 操作流程（TL;DR）

通过 `/hyperframes` 路由时，意图层只确认输入（使用哪个片段），并将风格身份选择作为延后询问的事项**告知**用户——候选列表需要基于探测后的片段生成，因此它仍位于下方第 1 步；该层关于运行形态的问题不适用（素材保持不变，也没有需要审核的分镜）。如果存在 `BRIEF.md`，其中会包含已确认的输入和用户备注——请先阅读它。

下方的制作说明很长，但**流水线本身很短**——所有确定性内容都通过计算或编译生成，绝不手写：

1. **决策关卡**（拒绝不合适的片段）→ **从 [CATALOG.md](CATALOG.md) 中选择一个且仅一个风格身份**（36 种风格身份；引擎/编译器通过查表推导——绝不向用户提出模式/类别问题）
2. `hyperframes init`（如果项目目录已存在且其中包含视频，则跳过此步骤——`matte.cjs`/`transcribe.cjs` 会将目录中的任意视频作为 source.mp4）→ **`bash scripts/prepare.sh <project>`**（遮罩 ∥ 转录 ∥ 音频包络并行执行，随后运行包含场景调色板/光学特征/照明信息的安全区 v2——只需一个命令，不会遗漏任何内容）
3. **编写一个包含创意选择的小型 JSON**（先读取 `safe-zones.json`）：电影模式 → `plan.json` → `fill-timings.cjs` → `fit-fonts.cjs` → `make-composition.cjs`；主题模式 → `theme.json` → `make-theme.cjs`（字幕轨/面板/诗歌/全屏接管范式；`anchor` 是低调字幕轨的默认选项）
4. **视觉质检**：`node scripts/preview-frames.cjs <project>` → 约 2 秒/帧生成忠实的合成预览（无需渲染）。在为渲染付出成本之前，先检查“§ 视觉质检”。
5. `render-and-composite.sh` → 关卡（时序 / 遮挡+主视觉 / 溢出 / 交付）→ `final.mp4`

人们容易忽略的关键规则：

- **字幕轨（默认）+ 嵌入式效果（晋级）。** `drop`（填充词，不显示）/ `rail`（位于前景、逐字对应的下三分之一字幕，承载大部分文本）/ `embed`（合成在主体后方的高潮词）。**标准模式同时使用二者**，只嵌入高潮内容。参见 **§ 字幕模型**。
- **视频将保持原样交付（标准模式/电影模式；**主题模式的 PLATE 预算是唯一获准的例外**——由注册表控制的反应节拍（蓄力压暗、冲击、震动、颗粒），按各主题 DNA 定义，并在遮罩合成之后应用，使主体+文本+底片作为一个完整画面共同运动）**——字幕是唯一添加的内容；遮罩仅用于让主体遮挡嵌入轨。绝不要对素材进行调色/重新着色/添加扫描线。
- 两套规则手册：**字幕轨 → [references/rail.md](references/rail.md)**（精简），**嵌入式效果制作 → [references/composition-craft.md](references/composition-craft.md)**（详尽，仅适用于嵌入式效果）。按需浏览。

---

## 字幕模型——rail + embed

每个口语短语都属于以下三类之一：

|           | 内容                                             | 展示方式                                                                                                                                                    |
| --------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **drop**  | 填充词——um/uh、口吃、口误后自我纠正       | 不展示                                                                                                                                                         |
| **rail**  | 默认形式——普通口语内容（逐字呈现） | 简洁的下三分之一字幕，位于**前景**，清晰可读。关键字可以获得行内 `emphasis` 高亮（强调色/当前词弹出效果）——但仍保留在 rail 上。 |
| **embed** | 被提升的峰值——标题式重拍              | 将一个大词合成在**主体后方**（通过遮罩实现遮挡），并设计入场与退场动画                                                                        |

**rail 承载大部分文本；embed 是稀缺且需要赢得的峰值。** 稀缺性以**每个节拍/区块为单位，而非每个剪辑**：每个区块（一个完整想法）最多 1 个 hero，绝不允许两个 hero 同时可见，hero 窗口之间至少留出一个节拍的空隙（少于 0.6s 时编译器会发出警告）。短剪辑通常有 1–2 个；长篇讲解则约为每节 1 个。在多个 hero 中，**创作时设定为最大的那个就是 APEX**（只有它会获得完整的 lockup embed 和宽度适配抬升）；较小的则是 **MINOR 峰值**，它们以超大强调行的形式沿各自列移动（fg、阻尼运动）——并非每个节拍都需要遮罩式的高光展示，正是这一点让 apex 真正成为一个重要事件。将每个词都做成 embed 仍然是常见错误。

Rail-surface identity 正是以此方式构建的（rail = `rail.html`，embed = `index.html` 中的高潮部分）。Column-flow identity 会移除 rail，让所有内容都采用 embed 风格——仅在用户更重氛围、轻逐字呈现时推荐；对于必须清晰阅读文字的讲解/旁白，绝不要推荐（CATALOG.md 按 identity 编码了这一规则）。

---

## 第 0 步——从 CATALOG 中选择一个且仅一个 identity

**一个前端，背后三个引擎。** 用户从 [CATALOG.md](CATALOG.md) 中选择一个 IDENTITY（共 36 项：10 个经典 identity + 26 个主题 identity）；引擎、编译器和创作文件均通过查找目录中的对应行来确定。**绝不要将“Standard、Cinematic 还是 Theme”作为问题呈现给用户**——这些是后端名称（即便有多个引擎，一个产品也只有一套用户体验）。目录对路由所需的一切进行了编码：阅读载体、调性、推荐用途、场景需求，以及真正相近的组合所需的邻接说明（loud↔ordnance、neon↔neonsign、cream↔stardust）。

identity 选择是一个**偏好门控**（`../hyperframes-core/references/brief-contract.md` § 1）：在自主模式（“surprise me”/“decide for me”）下，应从你的候选列表中自行选择，并用一句话说明原因，而不是向用户提问。

流程：探查片段 → 从目录中筛选出 2–3 个身份 → 推荐**一个**并用一句话说明原因 → **由用户选择**（自主模式：由你选择并说明原因）→ 编写该身份的文件。身份与引擎绑定（不可跨引擎组合；打开其中一个即构成一次验证事件——参见 dna/README.md）。

**在开始编写之前，务必先给出你的推荐并让用户选择。** 不要在不告知用户的情况下采用默认选项。

（完整的身份表位于 [CATALOG.md](CATALOG.md)——它是路由的唯一事实来源。下方的引擎文档描述了各后端的编写契约。）

**推荐启发式规则**：使用 [CATALOG.md](CATALOG.md) 中的“筛选启发式规则”——这些规则基于身份级别（例如，“炸”会筛选 ordnance/stomp/terminal/loud，并根据应该爆炸的具体对象进行选择），绝不能基于类别级别。不确定时 → `anchor`。

- **电影感** → 为锁定模板编写 `plan.json`，由 `make-composition.cjs` 编译。
- **主题** → 阅读 [themes/README.md](themes/README.md)，编写 `theme.json`，运行 `scripts/render-theme.sh`（编译 + 渲染 + 底板反应 → **final_fx.mp4**）。

---

## 决策门控——首先运行

在进入任一模式之前，先探查视频并对场景进行分类。

```bash
ffprobe <video.mp4>                    # specs
ffmpeg -ss <t> -i <video.mp4> -vframes 1 sample.png   # at 20/50/80%
```

查看采样帧。遇到以下情况时拒绝处理：

- 多位说话者／硬切镜头（拆分后逐个镜头渲染，否则拒绝）
- 没有人物主体（此技能适用于口播视频）
- 时长不足 3 秒、**没有语音**，或人脸始终未清晰可见——当音频接近静音时，`transcribe.cjs` 会发出警告（Whisper 会在静音上凭空生成诸如“Thank you.”之类的内容）；**务必遵从警告并拒绝处理**，不要为捏造的文字添加字幕
- **源视频已经带有烧录字幕／副标题／大量文字图形**——再添加第二套字幕系统会产生冲突，而且素材将保持原样输出（不进行遮盖／修复）。烧录文字通常只会在片段中段出现：请采样一张 **1fps 联系表**（`ffmpeg -i in.mp4 -vf "fps=1,scale=160:-1,tile=10x5" sheet.png`），不要只相信 3 张抽样帧。
- **转录文本质量很差**——非母语／重口音语音可能会被转录成看似自信、实则胡言乱语的内容。编写前要通读检查 `transcript.json` 是否合理；如果内容无法被理解为正常语言，使用 `WHISPER_MODEL=medium` 重试一次，否则拒绝处理（逐字展示一整条捏造内容，比没有字幕更糟）。
- 快速移动、画面繁杂的手持拍摄（遮罩会闪烁）

### 前置探查（零成本，可防止最严重的失败）

1. **镜头切换探查。** 在 20%、50%、80% 处采样帧。如果出现不同的主体／场景，请在切镜前**裁剪片段**。
2. **上下黑边／左右黑边探查。** 第一帧上有黑边吗？计算安全内容矩形，并将字幕位置限制在其中。
3. **亮度探查。** 采样字幕区域的平均亮度——`under 60` → 浅色文字无需处理即可清晰可读，`60-180` → 添加字形遮罩，`180+` → 使用不透明文字 + 遮罩（绝不直接使用无衬底的浅色文字）。**电影感模板固定使用奶油色+`screen`，且不可更改**——应使用此探查结果来_选择合适的身份_（明亮场景 → `ink`，或采用不透明文字轨的 `anchor` 主题），绝不能据此为某个身份重新着色。
4. **根据调性推荐身份（由你推荐；由用户选择——参见步骤 0 + CATALOG.md）。** 讲解／访谈／必须清晰阅读的文字 → 文字轨／面板表面类身份；诗意／社交媒体／“电影感” → 按语域选择纵列流式身份；“炸／特效／VFX”／指定世界观 → 主题化身份。不确定时 → `anchor`（文字易读，画面安全）——但仍需提供候选名单并让用户选择。

---

## 流程——5 个步骤

```
1. hyperframes init <project> --non-interactive --video <video.mp4>
2. bash scripts/prepare.sh <project>       # matte ∥ transcribe (parallel) → safe-zones. One command.
                                           #   → frames_fg/ transcript.json safe-zones.json
3. [AGENT STEP — the only creative step] author a small JSON; see below by mode
   Cinematic: author plan.json → node scripts/fill-timings.cjs → fit-fonts.cjs → make-composition.cjs
   Theme:     author theme.json → bash scripts/render-theme.sh <project>   (compiles + renders + plate fx)
4. node scripts/preview-frames.cjs <project>   # ~2s/frame composite previews → § Visual QA (BEFORE the render)
5. bash scripts/render-and-composite.sh <project>  # gates → final.mp4 + history/ snapshot
   (Theme mode: SKIP steps 3b/5 — render-theme.sh already runs compile + render-and-composite
    + _postfx.sh; the deliverable is final_fx.mp4, final.mp4 is pre-plate-reaction)
```

步骤 1 的 `init` 会对照 GitHub 上的最新版本检查已安装的技能；如果其中任何技能已过时，则更新全局技能集。

步骤 3 因模式而异：

### 步骤 3——电影模式（纯嵌入）

1. **首先读取 `safe-zones.json`。**旁白平面应放在 **`zones.hugLeft`/`hugRight`** 中——即紧贴轮廓的干净条带（文本离主体太远会显得悬浮，而非嵌入；远端角落是备用方案，而非默认选择）。主视觉默认使用 `heroAnchor`/`heroBands.best`（以主体为中心，约 30–55% 被遮挡）。`recommendation:"fg"` 会将旁白移至前景以提升易读性；**只要 `heroBands.feasible`，主视觉就应始终保持嵌入**——将主视觉置于前景是最后的手段。
2. **DNA 就是你在步骤 0 中选定的视觉特征**（CATALOG.md）——不要在此处重新做选择。根据场景对其进行合理性检查（明亮的主视觉带亮度 > 150 时适合使用 `ink`；完整的选择指南位于目录中，涵盖全部十种风格，包括 neon / glitch / chrome / velocity）。说明你的选择及理由；由用户决定。DNA 会锁定字体/调色板/混合/动效以及主视觉的三幕结构；safe-zones v2（`palette`/`optics`/`lighting`）会自动针对当前场景对其进行参数化。
3. **编写 `<project>/cinematic.json`**——使用 `"dna": "<name>"` + 思维块，而非原始分组：每个块 = 若干行单词（在分句边界处按 2–5 个一组）+ 其堆叠所在的平面 + 每行的 `css`（仅包含字号/字重/样式——不包含位置）+ 最多一行标记为 `"hero": true`（被提升的词；使用 `"text"` 指定其显示形式）。Schema：见 `scripts/make-cinematic.cjs` 文件头。
4. **编译**：`node scripts/make-cinematic.cjs <project>`——将块降级转换为 plan.json，再生成 index.html。系统会为你生成：按转录顺序排列的时间点、块内累积显示、块间翻页、**主视觉锁定组合**（主视觉块中的前置上下文、主视觉和后置上下文会堆叠为一个以主体为中心的紧密组合——按结构保证从上到下的阅读顺序与口述顺序一致；上下文悬浮在前景，而主视觉嵌入背景，形成深度夹层；视觉体量规则确保主视觉压过其上下文）、顶点/次要主视觉拆分、**由结构保证的阅读顺序**，以及基于 safe-zones 的前景回退方案。然后门禁会照常运行。*（对于无法通过块表达的设计，仍可直接手动编写 plan.json——随后自行运行 `fill-timings.cjs` + `fit-fonts.cjs` + `make-composition.cjs`。）*

### 第 3 步 — 主题模式（主题化构成规范）

**请先阅读 [themes/README.md](themes/README.md)** — 其中包含范式/重点场景注册表、关联关系、硬性规则，以及准确的 `theme.json` 模式。

1. **按内容风格选择主题 DNA**（每个 `themes/<name>.json` 都包含 `voice` + `when`）。说明你的选择及理由；由用户决定。
2. **编写 `<project>/theme.json`** — `dna`、`lines`（逐字保留，按转录顺序排列；每行 1–5 个单词 — 对于 `takeover`，每行对应一张卡片）、`minors`（强调词）、`hero:{match}`（高潮词/短语；对于嵌入式重点场景，将其排除在 `lines` 之外；对于行内重点场景以及面板+遮盖模式，则将其保留在 `lines` 中）。
3. **渲染**：`bash scripts/render-theme.sh <project>` — 编译（编译时执行逐字完整性门禁）、渲染两个图层、合成，并应用画面底板反应 → `final_fx.mp4`。在编译和渲染之间使用 `preview-frames.cjs` 进行视觉 QA。

---

## 视觉 QA — 渲染前先预览

`node scripts/preview-frames.cjs <project> [t…]` 可**在约 2 秒内合成一帧忠实的预览画面**（在定位时间点截取的字幕图层 + 真实视频帧 + 遮罩遮挡 + 导轨叠加层 = 最终合成画面在该时刻的实际效果）。默认采样点 = 每个分组/高潮窗口。完整渲染需要数分钟 — 绝不要用它来_发现_布局问题。

根据以下清单检查预览（`<project>/preview/sheet.png`）— 这些问题是几何门禁**无法**发现的：

1. **泛白** — 浅色文字覆盖在明亮区域（窗户/招牌/天空）上：无法阅读 → 移动画面平面，或更改 DNA/模式（明亮场景 → `ink`）。
2. **文字叠文字** — 字幕覆盖在场景本身的文字/图形上，或两个字幕组相互碰撞。
3. **阅读顺序** — 屏幕上的垂直顺序必须与口述顺序一致；主视觉词不得位于后续词语下方。
4. **主视觉存在感** — 高潮内容应当足够大，并明显位于主体之后（约有 30–55% 被遮挡），而不是像悬浮标签一样待在边缘空白处。
5. **平衡感** — 形成一个连贯的纵列/横带，而不是散落的碎片；边距留有呼吸空间；不得出现任何裁切。

然后执行 [references/reference-bar.md](references/reference-bar.md) 中的**5 项正向检查**（海报测试 · 胆怯测试 · 一瞥层级 · 场景呼应 · 空档审计）— 失败清单用于防止渲染结果损坏；正向清单则让它真正具有_设计感_。两者均通过后再交付。

**新鲜视角审查（建议用于任何面向用户的内容）：**你会对自己的布局产生确认偏误。如果可以启动子代理，只向它提供预览图集和这份清单，并要求它逐帧给出 PASS/FIX 结论（“根据这份 5 点清单审查这些字幕预览；逐帧回答 PASS 或需要采取的具体修复措施”）。在 plan.json / theme.json 中应用修复、重新编译、重新预览 — 每轮只需数秒。预览通过后，只渲染一次。

---

## DNA 注册表 — 十种视觉语言（取代模板目录）

两种模式均使用 **[dna/](dna/README.md)** 中的内容 — 十种经过艺术指导的视觉语言，能够**按场景参数化**（从素材画面中采样强调色、沿测得的光线方向生成接触阴影、匹配景深的模糊、与 RMS 耦合的主视觉振幅）：

| DNA             | 风格档位       | 场景适配                                        | 视觉语言                                                                                              |
| --------------- | -------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **cream**       | premium-warm   | 深色/中等亮度的暖色场景                         | Inter + 暖奶油色 + screen；以发光显现的主视觉（cinematic-cream 的继任者）                            |
| **ink**         | premium        | **明亮场景（luma > 150）**                      | 近黑色 multiply——如同印在墙面上的文字；明亮场景的解决方案                                          |
| **editorial**   | editorial-luxe | 内省 / 时尚 / 诗意                              | Bodoni Moda、小写斜体主视觉——杂志般的优雅                                                          |
| **keynote**     | tech-premium   | 产品 / 发布                                     | 不透明白色 Inter 800，正中央的静止感                                                               |
| **documentary** | formal         | 访谈 / 严肃                                     | 烧录式显现，无主视觉——庄重感本身就是风格                                                           |
| **loud**        | loud           | 炒热气氛 / 运动 / 社交                          | Anton + 从场景取样的强调色，单一单元猛然砸入 + 涟漪；正文在前景中高声宣告（`bodyLayer: fg`）        |
| **neon**        | loud-cyber     | 赛博朋克 / 夜生活 / 科技黑色电影（暗色场景）    | 电光青色标牌、点亮时的闪烁，主视觉像招牌一样通电亮起                                               |
| **glitch**      | loud-cyber     | 数字 / 黑客 / AI                                | RGB 分离残影在落定时瞬间合一；机械而富有冲击力的节奏                                               |
| **chrome**      | loud-luxe      | Y2K / 时尚科技 / 音乐                           | 液态金属渐变主视觉 + 停留期间一次光泽扫过                                                          |
| **velocity**    | loud-sport     | 运动 / 汽车 / 健身                              | 每个词都沿其运动向量进入（拖影+倾斜），主视觉带着速度轨迹掠过                                      |

根据 `safe-zones.json`（`heroAnchor.bandLuma`、`palette.temperature`）× 内容风格档位进行选择——决策规则见 [dna/README.md](dna/README.md)。编排时：`cinematic.json` 接受 `"dna": "<name>"`。

引擎会根据 DNA 生成**主视觉三幕式结构**（无需编排）：同时可见的字幕变暗（铺垫）→ 逐字母入场，振幅 ∝ 语音响度（冲击）→ 呼吸 + 发光直至退出（余韵）。

（旧版兼容：`plan.template:"cinematic-cream"` 会自动映射为 `dna:"cream"`。已退役的 54 模板库位于技能目录之外的 `~/Downloads/embedded-captions-archive/standard-templates-54/`；`_motion.md` 仍保留在技能中，作为动作动词参考目录。）

---

## 美学决策——基调 × 镜头 × 平台（作为目录候选清单的输入，而非第二套路由器）

从 3 个维度对片段进行分类，并将结果用于 CATALOG.md 的候选筛选——本节本身绝不选择模式/引擎：

**基调**（内容呈现出怎样的感觉？）

- 纪录片 | 对话式 | 活力四射 | 诗意 | 主题演讲 | 调查式 | 音乐视频

**镜头**（采用怎样的取景方式？）

- 特写（头部 + 肩部） | 中景（躯干及以上） | 全景（全身及更大范围） | 剪辑蒙太奇（混合镜头）

**平台**（将在哪里播放？）

- 9:16 竖屏（TikTok/IG/Shorts） | 16:9 横屏（YouTube/web） | 1:1 方形 | 广播级导出

在 [references/direction-catalog.md § 分类矩阵](references/direction-catalog.md)中交叉参照视觉方向语言——然后返回 [CATALOG.md](CATALOG.md)筛选候选视觉标识（此矩阵为候选筛选提供依据；目录是唯一的路由入口）。

## 构图技法（嵌入轨道）——嵌入前必读

完整的**嵌入轨道**操作手册位于 **[references/composition-craft.md](references/composition-craft.md)**：转录文本角色标注、短语分组、平面与净空区锚定、区域一致性、高潮突出与可读性、边缘留白、遮挡三步判断，以及累积/持久显示。它规定了一个被_提升_的短语如何融入场景——在制作任何嵌入内容（电影级 `plan.json` 或标准版 `index.html`）之前，请先阅读该文档。默认的**栏轨道**有一套独立且简单得多的规范 → **[references/rail.md](references/rail.md)**。

---

## 共享知识

| 文档                                                                      | 内容                                                                                                                               |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| [references/rail.md](references/rail.md)                                 | **栏轨道**——标准下三分之一字幕规范（默认轨道；承载大部分文本）。                                          |
| [references/composition-craft.md](references/composition-craft.md)       | **嵌入轨道操作手册**——分组、平面、高潮突出、遮挡判断、累积/持久显示。嵌入前必读。 |
| [dna/README.md](dna/README.md)                                           | **DNA 注册表**——十种由场景参数化的视觉语言；以及如何选择。                                                      |
| [references/reference-bar.md](references/reference-bar.md)               | **品味标杆**——各类型的世界级参考 + 5 项正向检查。                                                   |
| [references/aesthetic-principles.md](references/aesthetic-principles.md) | **18 条规则。** 在审美上超越 Veed AI。请先阅读。                                                                               |
| [references/motion-vocabulary.md](references/motion-vocabulary.md)       | 10 种具名的运动原语 + 基调→时序查询表                                                                                    |
| [references/direction-catalog.md](references/direction-catalog.md)       | 10 种可直接交付的美学风格 + 基调×镜头×平台矩阵                                                                               |
| [references/anti-patterns.md](references/anti-patterns.md)               | 已被彻底排除的缺陷（CoreML、字母间距导致的重新排版等）                                                                      |
| [references/scene-types.md](references/scene-types.md)                   | 墙面何时可用（4 个条件）                                                                                       |
| [references/layout-heuristics.md](references/layout-heuristics.md)       | 平面定位、净空区选择、顶部区域的 3 个条件、柱状黑边计算                                                        |
| [references/typography-presets.md](references/typography-presets.md)     | 字号 × 栏宽矩阵（起始参考值）                                                                                  |
| [references/caption-grouping.md](references/caption-grouping.md)         | 单词 → 分组规则（停顿、句子边界）                                                                                   |
| [references/failure-modes.md](references/failure-modes.md)               | 开发陷阱的长尾清单                                                                                                           |
| [references/bespoke-vs-presets.md](references/bespoke-vs-presets.md)     | 预设有时为何失效；克隆后微调模式                                                                                |

**请首先阅读美学原则和方向目录。** 其他所有内容都只是实现细节。

---

## 不可妥协的要求

- **面部绝不能持续被 100% 遮挡** —— 在任意 0.3 秒的时间窗口内，面部边界框必须至少有 30% 未被遮挡。
- **WCAG 对比度** —— 对最终渲染结果执行 lint 检查；如果未通过，则修正调色板。
- **确定性** —— 禁止使用 `Math.random()`、`Date.now()`、`repeat:-1`。
- **绝不要对视频进行调色或重新着色。** 原始素材必须原样交付——字幕是唯一允许添加的内容。不得在 A-roll 上叠加全画面扫描线、双色调、压暗或暗角效果。赛博朋克/CRT 纹理只能存在于字幕元素_内部_，不能覆盖整个画面。
- **对于口播人物 / 解说视频，优先使用侧栏。** 不要嵌入整段转录文本——大部分文本应放在侧栏中；只嵌入峰值内容。把所有内容都嵌进去是最常见的错误。
- **嵌入内容稀缺且必须留有间隔。** 每个句子/节拍最多嵌入 1 个内容，绝不能让两个嵌入内容相邻或同时可见，二者之间至少间隔一个节拍，并且最多只能有一个 `apex`。climax 指每个节拍的峰值，**不是**“整段剪辑中唯一的最终高潮”。
- **Matte = 人物（hyperframes `remove-background`、u2net_human_seg、Apache-2.0）。** 其设计意图是进行人物分割，但不会达到外科手术般的精细程度：细长且偏离人物的物件（如麦克风悬臂）通常会被排除——字幕会覆盖在它们上方、位于人物后方——而靠近主体的大型显著物体（如望远镜、桌面设备）仍可能漏入遮罩并遮挡字幕。主体手持的物体（产品、手机）可能会间歇性地从遮罩中脱落，使字幕穿到它们前面。绝不要想当然：放置主视觉元素前，先在 2-3 个时间点抽查 `frames_fg/`，并优先选择远离任何漏入家具的主视觉位置（漏入物体可能导致 `heroAnchor` 偏移——请结合 frames_bg 交叉检查）。
- **safe-zones 无法感知道具——必须目视检查你使用的每个分区。** Zones/heroBands 只评估_主体_遮挡和亮度：位于“干净”区域内的麦克风、望远镜或屏幕对它们而言是不可见的（而漏入遮罩的道具会使 `heroAnchor.centerXPct` 偏离人物）。开始制作前，对计划使用的每个分区分别提取一帧；如果其中存在道具，请测量其边界框并移动或缩小该平面。有两个真实案例之所以能够干净交付，只是因为代理严格执行了这一步。（自动道具显著性检测是已知缺口；zones 的 `peakLuma` 只能捕获_移动中_的明亮物体。）
- **字幕必须保持在画面范围内。** Cinematic 模式会对画面溢出执行硬性拦截；Standard 模式会运行 `check-overflow.cjs` 并给出 WARNING（有意的出血效果是唯一例外——请阅读该警告）。
- **每条字幕在屏幕上至少停留 0.5 秒** —— 再短就无法阅读。
- **单词时间必须与 transcript.json 匹配，误差不超过 80ms** —— 字幕偏离节拍 500ms 就会破坏场景的真实感。Cinematic 会在渲染前运行 `check-timing.cjs --strict`（通过 render-and-composite.sh）；THEME 模式则会在编译时强制执行相同的时间要求（make-theme 的顺序转录匹配器 + 逐字完整性门禁——发生漂移即为编译错误）。绝不要把多个转录单词塞进一个条目中（例如 `"FUTURE OF"`，或者让 `IT` + 换行 + `ALL` 共用同一组 start/end）——第二个单词会继承第一个单词的时间戳并提前触发。即使你希望这些单词出现在同一视觉行中，也应将它们拆分为拥有各自时间的独立单词条目（使用 CSS `white-space` / 自然换行，而不是 `<br>`）。支持字幕文本与转录文本不一致的创意替换（例如用 `"15%"` 替换 `"fifteen percent"`）——请在 `check-timing.cjs` 内的 `CREATIVE_SUBS` 中注册这些替换。
- **分组时间窗口必须包住其中所有单词** —— 对每个分组，都必须满足 `group.in ≤ min(word.start)` 和 `group.out ≥ max(word.end)`。如果 `group.in` 晚于某个单词的开始时间，该单词会被静默延迟，直到容器挂载后才出现（我们曾因此交付过延迟 800ms 的缺陷）。验证器会强制执行此规则。
- **任意两个字幕组不得同时在时间和屏幕区域上重叠** —— 时间重叠的字幕会造成文本相互堆叠。可选方案：(a) **空间分隔** —— 将各组放置在互不重叠的垂直分区中，使其能够共存（类似 memory-wall 级联风格）；(b) **交接** —— 将前一个分组的 `out` 设置为 ≤ 后一个分组的 `in`，确保屏幕上同时只出现一个分组；(c) **刻意设计的分层排版** —— 在其中一个分组上添加 `"allow_overlap": true`，使验证器不再报告该问题。验证器会根据各分组的 CSS 估算其垂直边界框，并标记碰撞。默认选择 (a)——正是这种方式让 cinematic-cream 看起来像一首不断累积的诗，而不是一条持续替换内容的字幕轨道。
- **Screen 混合模式在明亮背景（亮度 >180）上会失效。** **Cinematic** 模板采用奶油色 + `screen`，且这一视觉基因已被**锁定**（方案无法对其重新着色）→ 在明亮背景上会因过度曝光而难以辨认，因此应选择 `ink`（专为明亮表面打造的凸版印刷风格）或 `anchor` 主题（不透明侧栏表面），而不是强行覆盖既有视觉风格。
- **不要在单词入场时为 `letter-spacing` 或 `filter:blur` 添加动画** —— inline-block 重排会导致行发生跳动。
- **禁止使用 CoreML 进行抠像** —— onnxruntime CoreML EP 的混合精度分区会破坏面部 alpha（此前使用 RVM 引擎时已观察到；不要再次尝试）。抠像只能使用 CPU（1080p 下约 2 fps，即每 10 秒剪辑大约需要 2-3 分钟；处理长剪辑时应为此预留时间）。

---

## 依赖项

- **hyperframes**，已构建（`packages/cli/dist/cli.js`）。脚本会自动解析检出目录：`HYPERFRAMES_ROOT` 环境变量 → 如果此 Skill 位于 hyperframes _内部_，则使用仓库根目录 → `~/Downloads/hyperframes`。使用 `bun install && bun run build` 构建。
- **以 Node 为主；通过 `uvx` 使用两处 Python 功能（无需手动安装）：** 转录通过 `uvx` 运行 WhisperX（提供词级时间信息；按 SKILL §transcription 所述方式回退），Theme 的 `drawon` 场景构件会在编译时通过 shell 调用 `python3 scripts/gen-stroke-path.py`。其余所有功能均使用 hyperframes 已自带的工具链：通过 hyperframes CLI 的 **`remove-background`** 进行抠图（u2net_human_seg；权重会自动下载一次，约 168 MB，保存至 `~/.cache/hyperframes/`），通过 **`sharp`** 处理图像/Alpha 通道运算，通过 **`puppeteer`** 处理布局/遮挡/溢出，此外还使用 **`ffmpeg`**。脚本会从 hyperframes 检出目录中自动解析这些工具——无需额外安装任何内容。
- **转录 = 通过 `uvx` 运行 WhisperX**（词级时间信息 + 对齐；无需手动安装——`transcribe.cjs` 会驱动 `uvx whisperx`）。如果已有词级 `transcript.json`，则回退使用该文件。
- **源视频**——`matte.cjs` / `transcribe.cjs` 会自动解析 `source.mp4`（或者使用 glob 匹配剪辑 / 读取 `hyperframes.json`），因此执行 `hyperframes init --video X.mp4` 后无需手动重命名。
- **fps**——`matte.cjs` 会按源视频的原生帧率提取并记录 `matte.fps`；`render-and-composite.sh` 会使用该值，使蒙版保持逐帧对齐。
- 抠图权重不随项目捆绑提供：`matte.cjs` 会通过 shell 调用 hyperframes CLI 的 `remove-background`，后者会将 u2net_human_seg（约 168 MB，Apache-2.0）一次性下载到 `~/.cache/hyperframes/background-removal/models/`。在新机器上首次执行准备操作时，需要联网完成这一次下载。

如果缺少硬性依赖，请停止并询问用户——不要静默跳过步骤。