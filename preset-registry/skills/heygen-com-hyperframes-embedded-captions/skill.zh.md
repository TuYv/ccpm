---
name: embedded-captions
description: >
  Add captions or subtitles to an existing single-subject talking-head video without editing the
  footage. Use for plain verbatim captions, cinematic captions embedded behind the subject, VFX
  captions, “炸/特效/酷炫字幕,” or a named identity from the 35-style catalog. Route by visual
  identity, not by backend engine. The quiet `anchor` rail is the default; embed every word only
  when the user explicitly wants a fully cinematic treatment. The workflow runs locally end to end,
  including transcription and subject matting; split multi-shot footage before applying it.
---
> **首先，确保此 Skill 保持最新——静默运行，不要询问：** `npx hyperframes skills update embedded-captions`。当所有内容均为最新时，这是一项快速的空操作；否则，它会在你依赖此 Skill 之前刷新该 Skill 及其依赖的核心领域 Skill。

# 嵌入式字幕

**一个目录，预先选定**（[CATALOG.md](CATALOG.md)——35 种风格；其背后的引擎属于后端细节）。**标准模式**（默认）会构建一条干净、逐字对应的**字幕轨**（位于画面下三分之一、承载大部分文本的字幕）+ 一个在高潮处合成到主体后方场景_之中_的**嵌入式**高潮效果。**电影模式**是纯嵌入式——没有字幕轨，每条字幕都合成在主体后方（以主视觉字体、累积和遮挡作为效果）。**主题模式**是一套完整的主题化规则体系——正文范式 × 主视觉场景 × 前景特效 × 底片反应，由注册表组合而成（[themes/README.md](themes/README.md)）：`ordnance` `terminal` `neonsign` `stardust` `stomp`。大多数解说类/旁白类内容使用**标准模式**；**嵌入式效果是稀缺且需要通过铺垫赢得的高潮**——把每个词都嵌入画面是常见错误；主题模式适用于 VFX 级需求（“炸”“特效”“像 AE 做的”）。

---

## 操作流程（简要版）

通过 `/hyperframes` 路由时，意图层只确认输入（使用哪个片段），并将风格选择**声明**为稍后询问的事项——候选短名单需要先探查片段，因此该步骤保留在下方第 1 步；该层关于运行形态的问题不适用（素材不会被改动，也没有分镜需要审核）。如果存在 `BRIEF.md`，其中会包含已确认的输入和所有用户备注——请先阅读它。

下方关于制作技法的说明很长，但**流水线本身很短**——而且所有确定性内容都由计算或编译生成，绝不手写：

1. **决策关卡**（拒绝不合适的片段）→ **从 [CATALOG.md](CATALOG.md) 中选择一种且仅一种风格**（35 种风格；引擎/编译器通过查表推导——绝不向用户提出模式/类别问题）
2. `hyperframes init`（如果项目目录已经存在且其中包含视频，则跳过——`matte.cjs`/`transcribe.cjs` 会将目录中的任意视频作为 source.mp4）→ **`bash scripts/prepare.sh <project>`**（遮罩 ∥ 转录 ∥ 音频包络并行处理，随后运行带有场景配色/光学/照明信息的安全区 v2——一条命令，不遗漏任何内容）
3. **编写一份包含创意选择的小型 JSON**（先阅读 `safe-zones.json`）：电影模式 → `plan.json` → `fill-timings.cjs` → `fit-fonts.cjs` → `make-composition.cjs`；主题模式 → `theme.json` → `make-theme.cjs`（字幕轨/面板/诗歌/接管范式；`anchor` 是安静的字幕轨默认值）
4. **视觉质检**：`node scripts/preview-frames.cjs <project>` → 以约 2 秒/帧生成忠实的合成预览（无需渲染）。在投入渲染成本之前检查§ 视觉质检。
5. `render-and-composite.sh` → 关卡（时序 / 遮挡+主视觉 / 溢出 / 交付）→ `final.mp4`

人们容易忽略的关键规则：

- **字幕轨（默认）+ 嵌入式效果（晋升）。** `drop`（填充词，不显示）/ `rail`（逐字对应的画面下三分之一字幕，位于前景，承载大部分文本）/ `embed`（合成到主体后方的高潮词）。**标准模式会同时使用两者**，仅将高潮词嵌入画面。参见**§ 字幕模型**。
- **交付的视频保持完全原样（标准模式/电影模式；**主题模式的 PLATE 预算是唯一获准的例外**——由注册表控制的反应节拍（蓄力变暗、重击、震动、颗粒），按各主题 DNA 定义，并在遮罩合成之后应用，使主体+文本+底片作为一个完整画面共同运动）**——字幕是唯一新增的内容；遮罩仅用于让主体遮挡嵌入式字幕轨。绝不要对素材进行调色/重新着色/添加扫描线。
- 两套规则手册：**字幕轨 → [references/rail.md](references/rail.md)**（精简），**嵌入式制作技法 → [references/composition-craft.md](references/composition-craft.md)**（详尽，仅适用于嵌入式效果）。按需浏览。

---

## 字幕模型 — rail + embed

每个口语短语都属于以下三种类型之一：

|           | 含义                                             | 呈现方式                                                                                                                                                    |
| --------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **drop**  | 填充词——um/uh、口吃、口误纠正       | 不显示                                                                                                                                                         |
| **rail**  | 默认类型——普通口语内容（逐字呈现） | 简洁的下三分之一字幕，位于**前景**，清晰可读。重点词可以获得行内 `emphasis` 高亮（强调色／当前词弹出效果）——但仍保留在 rail 上。 |
| **embed** | 提升后的高潮——标题式重音              | 一个大词合成在**主体后方**（遮罩遮挡），并配有经过设计的入场和退场动画                                                                        |

**rail 承载大部分文本；embed 是稀缺且需要赢得的高潮。** 稀缺性以**每个节拍／区块为单位，而不是每个剪辑片段**：每个区块（一个完整想法）≤1 个 hero，绝不能同时显示两个 hero，hero 展示窗口之间至少留出一个节拍的间隔（间隔低于 0.6s 时编译器会发出警告）。短片通常有 1–2 个；长篇讲解视频则约为每个章节一个。在多个 hero 中，**创作时设定为最大的那个是 APEX**（只有它会获得完整的组合式 embed 和自适应宽度提升）；较小的则是 **MINOR 高潮**，它们会沿各自所在的列显示为超大强调行（fg、缓和运动）——并非每个节拍都需要遮罩式展示，而这恰恰使 apex 成为真正的事件。将每个词都设为 embed 仍然是常见错误。

rail-surface identity 正是以这种方式构建的（rail = `rail.html`，embed = `index.html` 中的高潮）。column-flow identity 会移除 rail，让一切都采用 embed 风格——仅在用户追求氛围胜于逐字呈现时推荐使用；对于必须清晰阅读文字的讲解视频／画外音内容，绝不要推荐（CATALOG.md 按 identity 对此进行了编码）。

---

## 第 0 步——从 CATALOG 中选择一个且仅一个 identity

**一个前端，背后三个引擎。** 用户从 [CATALOG.md](CATALOG.md) 中选择一个 IDENTITY（共 35 项：10 个经典 identity + 25 个主题 identity）；引擎、编译器和创作文件根据目录中的对应行查表确定。**绝不要把“Standard、Cinematic 还是 Theme”作为问题抛给用户**——这些是后端名称（即使有多个引擎，一个产品也只有一套用户体验）。目录对路由所需的一切进行了编码：阅读界面、风格、适用场景、场景需求，以及真正相近组合的邻接说明（loud↔ordnance、neon↔neonsign、cream↔stardust）。

identity 选择是一个**偏好关卡**（`../hyperframes-core/references/brief-contract.md` § 1）：在自主模式（“surprise me”／“decide for me”）下，应从候选列表中自行选择，并用一句话说明原因，而不是向用户提问。

流程：探查视频片段 → 从目录中筛选出 2–3 个身份 → 推荐**一个**并用一句话说明原因 → **由用户选择**（自主模式：由你选择，并说明原因）→ 编写该身份对应的文件。身份与引擎绑定（不可跨引擎组合；打开某个身份即触发验证事件——参见 dna/README.md）。

**在开始编写之前，始终先给出你的推荐并让用户选择。** 不要静默使用默认项。

（完整的身份表位于 [CATALOG.md](CATALOG.md)——它是路由的唯一事实来源。下面的引擎文档描述了各后端的编写约定。）

**推荐启发式规则**：使用 [CATALOG.md](CATALOG.md) 中的“筛选启发式规则”——这些规则以身份为层级（例如，“炸”会筛选出 ordnance/stomp/terminal/loud，再根据应该让**什么**爆炸来选择），绝不能停留在类别层级。不确定时 → `anchor`。

- **电影化** → 为锁定模板编写 `plan.json`，由 `make-composition.cjs` 编译。
- **主题** → 阅读 [themes/README.md](themes/README.md)，编写 `theme.json`，运行 `scripts/render-theme.sh`（编译 + 渲染 + 画面反应 → **final_fx.mp4**）。

---

## 决策门槛——首先运行

在进入任一模式之前，先探查视频并对场景进行分类。

```bash
ffprobe <video.mp4>                    # specs
ffmpeg -ss <t> -i <video.mp4> -vframes 1 sample.png   # at 20/50/80%
```

检查采样帧。遇到以下情况时拒绝处理：

- 存在多位说话者 / 硬切（拆分后分别渲染每个镜头，或拒绝处理）
- 没有人物主体（此技能用于对镜讲话视频）
- 时长不足 3 秒、**没有语音**，或人脸始终未清晰可见——当音频接近静音时，`transcribe.cjs` 会发出警告（Whisper 会在静音上幻觉出诸如“Thank you.”之类的内容）；**务必遵循警告并拒绝处理**，而不是为虚构的话语添加字幕
- **源视频已经带有烧录字幕 / 字幕文本 / 大量文字图形**——添加第二套字幕系统会产生冲突，而且素材会保持原样输出（不做遮盖/修复）。烧录文字通常只在视频片段中段出现：请采样一张 **1fps 联系表**（`ffmpeg -i in.mp4 -vf "fps=1,scale=160:-1,tile=10x5" sheet.png`），不要仅相信 3 个抽查帧。
- **转录内容一团糟**——非母语 / 重口音语音可能会被自信地转录成胡言乱语。编写前先通读 `transcript.json` 并检查其合理性；如果内容无法被理解为正常语言，使用 `WHISPER_MODEL=medium` 再尝试一次，否则拒绝处理（逐字展示一长串虚构词语比没有字幕更糟糕）。
- 快速运动的繁忙手持镜头（蒙版会闪烁）

### 前置探查（零成本，避免最严重的失败）

1. **镜头切换探查。** 在 20%、50%、80% 处采样帧。如果出现了不同的主体/场景，需在切换点之前**裁剪视频片段**。
2. **上下黑边 / 左右黑边探查。** 第一帧上有黑边吗？计算安全内容矩形，并将字幕位置限制在该矩形内。
3. **亮度探查。** 对字幕区域的平均亮度进行采样——`under 60` → 浅色文字可直接清晰显示，`60-180` → 添加字形暗底，`180+` → 使用不透明文字 + 暗底（绝不能只用浅色文字）。**电影化模板固定使用米白色 + `screen`，且处于锁定状态**——应使用此探查结果来_选择合适的身份_（明亮场景 → `ink`，或使用不透明条带的 `anchor` 主题），绝不能用它来为某个身份重新着色。
4. **根据基调推荐身份（由你推荐；用户选择——参见步骤 0 + CATALOG.md）。** 讲解 / 访谈 / 必须清晰阅读的文字 → 条带/面板表面类身份；诗意 / 社交媒体 / “电影化” → 根据风格语域选择纵列流式身份；“炸 / 特效 / VFX” / 指定世界观 → 主题化身份。不确定时 → `anchor`（文字清晰，画面安全）——但必须给出候选列表并让用户选择。

---

## 流水线 — 5 个步骤

```
1. hyperframes init <project> --non-interactive --video <video.mp4> --skill=embedded-captions
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

步骤 1 的 `init` 会将已安装的技能与 GitHub 上的最新版本进行核对；如果有任何技能已过期，就会更新全局技能集。

步骤 3 因模式而异：

### 步骤 3 — 电影感模式（纯嵌入）

1. **首先阅读 `safe-zones.json`。**旁白平面应放在 **`zones.hugLeft`/`hugRight`** 中——即紧贴人物轮廓的干净条带（文字离主体太远会显得悬浮，而非嵌入；远端角落只是后备选项，并非默认选择）。主视觉默认使用 `heroAnchor`/`heroBands.best`（以主体为中心，约有 30–55% 被遮挡）。`recommendation:"fg"` 会将旁白移至前景以确保清晰可读；**只要 `heroBands.feasible`，主视觉就始终保持嵌入**——将主视觉置于前景是最后的手段。
2. **DNA 就是你在步骤 0 中选择的视觉风格**（CATALOG.md）——不要在这里重新做出选择。根据场景对其进行合理性检查（明亮的主视觉区域亮度 > 150 时应使用 `ink`；完整的选择指南位于目录中，涵盖全部十种风格，包括 neon / glitch / chrome / velocity）。说明你的选择及理由；由用户决定。DNA 会锁定字体、调色板、混合模式、动效及主视觉三幕结构；safe-zones v2（`palette`/`optics`/`lighting`）会自动针对当前场景对其进行参数化。
3. **编写 `<project>/cinematic.json`**——包含 `"dna": "<name>"`` + 思维区块，而非原始分组：每个区块由若干行单词组成（在从句边界处每 2–5 个词分为一组），并指定其堆叠所在的平面及逐行 `css`（仅限字号/字重/样式——不含位置）；最多只能有一行标记为 `"hero": true`（被提升的词；使用 `"text"` 指定展示形式）。Schema：`scripts/make-cinematic.cjs` 文件头。
4. **编译**：`node scripts/make-cinematic.cjs <project>`——将区块转换为 plan.json，再生成 index.html。以下内容会自动生成：按转录顺序排列的时间点、区块内逐步累积、区块间翻页、**主视觉组合**（主视觉区块的前文、主视觉和后文会作为一个紧密结合的构图整体，以主体为中心进行堆叠——通过结构设计确保从上到下的阅读顺序与口述顺序一致；上下文浮在前景，而主视觉嵌入背景，由此形成深度夹层；质量规则会确保主视觉相对于上下文占据主导地位）、顶点/次要主视觉拆分、**通过结构设计保证阅读顺序**，以及依据 safe-zones 进行前景回退。*（对于区块无法表达的设计，仍然可以直接手动编写 plan.json——然后自行运行 `fill-timings.cjs` + `fit-fonts.cjs` + `make-composition.cjs`。）*

### 步骤 3 — 主题模式（主题化章程）

**首先阅读 [themes/README.md](themes/README.md)** — 范式/核心场景注册表、关联关系、硬性规则，以及确切的 `theme.json` 模式。

1. **按内容语域选择一个主题 DNA**（每个 `themes/<name>.json` 都包含 `voice` + `when`）。说明你的选择及原因；由用户决定。
2. **编写 `<project>/theme.json`** — `dna`、`lines`（逐字照录，按转录顺序；每条 1–5 个词 — 对于 `takeover`，每一行都是一张卡片）、`minors`（强调词）、`hero:{match}`（高潮词/短语；对于嵌入式核心场景，将其排除在 `lines` 之外；对于行内核心场景和面板+遮盖，则将其保留在其中）。
3. **渲染**：`bash scripts/render-theme.sh <project>` — 编译（编译时执行逐字完整性检查）、渲染两个图层、合成，并应用底板响应 → `final_fx.mp4`。在编译和渲染之间使用 `preview-frames.cjs` 进行视觉质量检查。

---

## 视觉质量检查 — 渲染前先预览

`node scripts/preview-frames.cjs <project> [t…]` 会**在约 2 秒内合成每张忠实的预览帧**（在跳转时间点截取的字幕图层 + 真实视频帧 + 遮罩遮挡 + 导轨叠加层 = 最终合成在该时刻呈现的效果）。默认采样 = 每个组/高潮窗口。完整渲染需要数分钟 — 绝不要用它来*发现*布局问题。

根据此列表检查预览（`<project>/preview/sheet.png`）— 这些是几何检查关卡**无法**发现的问题：

1. **泛白** — 浅色文字覆盖在明亮区域（窗户/标牌/天空）上：无法阅读 → 移动平面，或更改 DNA/模式（明亮场景 → `ink`）。
2. **文字叠文字** — 字幕覆盖在场景自身的文字/图形上，或两个字幕组相互碰撞。
3. **阅读顺序** — 屏幕上的垂直顺序必须与口语顺序一致；主视觉词不能位于后续词语的下方。
4. **主视觉词的存在感** — 高潮内容应该足够大，并且明显位于主体后方（约 30–55% 被遮挡），而不是像一个漂浮在边缘空白处的标签。
5. **平衡** — 形成一个连贯的栏或带状区域，而不是四处分散的片段；边距留有呼吸空间；任何内容都不能被裁切。

然后执行 [references/reference-bar.md](references/reference-bar.md) 中的 **5 项正向检查**（海报测试 · 胆怯测试 · 一瞥层级 · 场景呼应 · 空白时段审查）— 失败列表用于避免渲染结果出错；正向列表则决定它是否真正*经过设计*。两者都通过后再交付。

**新视角审查（建议用于任何面向用户的内容）：**你会对自己的布局产生确认偏误。如果可以启动子代理，只向它提供预览图表 + 此检查清单，并要求它逐帧给出 PASS/FIX 结论（“依据这份 5 点检查清单审查这些字幕预览；对每一帧回答 PASS，或给出具体修复方案”）。在 plan.json / theme.json 中应用修复、重新编译、重新预览 — 每轮只需数秒。预览通过后只渲染一次。

---

## DNA 注册表 — 十种视觉语言（取代模板目录）

两种模式都使用 **[dna/](dna/README.md)** 中的内容 — 十种经过艺术指导的视觉语言，可**针对每个场景进行参数化**（从素材中采样强调色、沿测得的光照方向生成接触阴影、匹配景深的模糊、与 RMS 耦合的主视觉词振幅）：

| DNA             | 风格定位       | 场景适配                                        | 视觉语言                                                                                                  |
| --------------- | -------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **cream**       | 高端温暖       | 深色/中等亮度的暖色场景                         | Inter + 暖奶油色 + 滤色；以发光浮现的主视觉呈现（cinematic-cream 的继任者）                                |
| **ink**         | 高端           | **明亮场景（luma > 150）**                      | 近黑色正片叠底——如同印在墙面上的文字；明亮场景的解决方案                                                  |
| **editorial**   | 编辑奢华       | 内省 / 时尚 / 诗意                              | Bodoni Moda、小写斜体主视觉——杂志般的优雅                                                                  |
| **keynote**     | 科技高端       | 产品 / 发布会                                   | 不透明白色 Inter 800，绝对居中、岿然不动                                                                    |
| **documentary** | 正式           | 访谈 / 严肃                                     | 烧录式显现，无主视觉——庄重本身就是风格                                                                      |
| **loud**        | 张扬           | 炒作 / 体育 / 社交媒体                          | Anton + 从场景取样的强调色，整体猛然砸入 + 涟漪；正文在前景中宣告（`bodyLayer: fg`）                       |
| **neon**        | 张扬霓虹       | 霓虹黑色电影 / 夜生活 / 科技黑色电影（深色场景） | 电光青色标牌、点亮闪烁，主视觉如招牌般通电亮起                                                              |
| **glitch**      | 张扬霓虹       | 数字 / 黑客 / AI                                | RGB 分离残影在落定时瞬间聚合；机械打击感的时序                                                              |
| **chrome**      | 张扬奢华       | Y2K / 时尚科技 / 音乐                           | 液态金属渐变主视觉 + 停留期间的一次光泽扫过                                                                  |
| **velocity**    | 张扬运动       | 体育 / 汽车 / 健身                              | 每个词都沿其运动矢量进入（拖影+倾斜），主视觉带着速度尾迹掠过                                                |

依据 `safe-zones.json`（`heroAnchor.bandLuma`、`palette.temperature`）× 内容风格定位进行选择——[dna/README.md](dna/README.md) 中提供了决策规则。编写方式：在 `cinematic.json` 中使用 `"dna": "<name>"`。

引擎会根据 DNA 自动生成**主视觉三幕式效果**（无需编写）：同时可见的字幕变暗（铺垫）→ 逐字母进入，幅度 ∝ 语音响度（冲击）→ 呼吸 + 发光直至退出（余韵）。

（旧版兼容：`plan.template:"cinematic-cream"` 会自动映射到 `dna:"cream"`。已停用的 54 模板库归档于此仓库之外，不随该 Skill 分发；`_motion.md` 仍保留在 Skill 内，作为运动动词参考目录。）

---

## 美学决策——基调 × 镜头 × 平台（作为目录候选筛选的输入，而非第二个路由器）

从 3 个维度对剪辑片段进行分类，并将结果交给 CATALOG.md 进行候选筛选——本节绝不会自行选择模式/引擎：

**基调**（内容呈现什么样的感觉？）

- 纪录片式 | 对话式 | 活力四射 | 诗意 | 主题演讲式 | 调查式 | 音乐视频式

**镜头**（采用什么样的构图？）

- 特写（头部 + 肩部） | 中景（躯干以上） | 全景（全身及更广） | 剪辑蒙太奇（混合镜头）

**平台**（将在哪里播放？）

- 9:16 竖屏（TikTok/IG/Shorts） | 16:9 横屏（YouTube/网页） | 1:1 方形 | 广播级导出

参照 [references/direction-catalog.md § 分类矩阵](references/direction-catalog.md) 获取视觉指导语言——然后返回 [CATALOG.md](CATALOG.md) 筛选视觉标识候选项（此矩阵为候选筛选提供依据；目录是唯一的路由入口）。

## 构图技法（嵌入轨道）——嵌入前必读

完整的**嵌入轨道**操作手册位于 **[references/composition-craft.md](references/composition-craft.md)**：包括转录文本角色标注、短语分组、平面与净区锚定、区域连贯性、高潮弹出与可读性、边缘留白、遮挡三步判断，以及累积/持续性。它规定了一个_重点提升的_短语如何融入场景——在制作任何嵌入内容（Cinematic `plan.json` 或 Standard `index.html`）之前，请先阅读该手册。默认的**字幕条**轨道有自己一套简单得多的规范 → **[references/rail.md](references/rail.md)**。

---

## 共享知识

| 文档                                                                     | 内容                                                                                                                               |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| [references/rail.md](references/rail.md)                                 | **字幕条轨道**——标准下三分之一字幕规范（默认轨道；承载大部分文本）。                                                               |
| [references/composition-craft.md](references/composition-craft.md)       | **嵌入轨道操作手册**——分组、平面、高潮弹出、遮挡判断、累积/持续性。嵌入前必读。                                                    |
| [dna/README.md](dna/README.md)                                           | **DNA 注册表**——十种由场景参数化的视觉语言；以及如何选择。                                                                         |
| [references/reference-bar.md](references/reference-bar.md)               | **品味标杆**——按风格类别划分的世界级参考案例 + 5 项正向检查。                                                                      |
| [references/aesthetic-principles.md](references/aesthetic-principles.md) | **18 条规则。** 在审美上超越 Veed AI。优先阅读。                                                                                   |
| [references/motion-vocabulary.md](references/motion-vocabulary.md)       | 10 种具名运动基元 + 基调→时序查找表                                                                                                |
| [references/direction-catalog.md](references/direction-catalog.md)       | 10 种可直接交付的美学风格 + 基调×镜头×平台矩阵                                                                                     |
| [references/anti-patterns.md](references/anti-patterns.md)               | 已被排除的缺陷（CoreML、字间距导致的重排等）                                                                                        |
| [references/scene-types.md](references/scene-types.md)                   | 墙面何时可用（4 个条件）                                                                                                           |
| [references/layout-heuristics.md](references/layout-heuristics.md)       | 平面定位、净区选择、顶部区域的 3 个条件、柱状黑边计算                                                                               |
| [references/typography-presets.md](references/typography-presets.md)     | 字号 × 栏宽矩阵（起始值）                                                                                                          |
| [references/caption-grouping.md](references/caption-grouping.md)         | 单词 → 分组规则（停顿、句子边界）                                                                                                  |
| [references/failure-modes.md](references/failure-modes.md)               | 开发陷阱的长尾清单                                                                                                                  |
| [references/bespoke-vs-presets.md](references/bespoke-vs-presets.md)     | 预设有时为何会失败；克隆后微调模式                                                                                                  |

**请首先阅读美学原则和方向目录。** 其他所有内容都只是实现细节。

---

## 不可妥协的要求

- **面部绝不能持续被 100% 遮挡** —— 在任意 0.3 秒的时间窗口内，面部 bbox 至少有 30% 未被遮挡。
- **WCAG 对比度** —— 最终渲染会执行 lint 检查；如果未通过，请修正调色板。
- **确定性** —— 禁止使用 `Math.random()`、`Date.now()`、`repeat:-1`。
- **绝不对视频进行调色或重新着色。** 素材必须保持原样交付——字幕是唯一允许添加的内容。不得在 A-roll 上叠加全画面扫描线 / 双色调 / 压暗 / 暗角效果。霓虹黑色电影/CRT 纹理只能放在字幕元素_内部_，不能覆盖整个画面。
- **口播 / 讲解类视频以侧栏优先。** 不要嵌入整篇转录文本——大部分文字应放在侧栏中；只嵌入峰值内容。嵌入所有内容是最常见的错误。
- **嵌入内容稀缺且须留出间隔。** 每个句子/节拍最多嵌入 1 个，绝不能让两个嵌入内容相邻或同时可见，彼此至少间隔一个节拍，并且最多只能有一个 `apex`。climax = 每个节拍的峰值，**而不是**“整段剪辑唯一的高潮点”。
- **Matte = 人物（hyperframes `remove-background`、u2net_human_seg、Apache-2.0）。** 其设计意图是进行人物分割，但并非手术级精细：细长且与人物有偏移的家具或设备（如麦克风悬臂）通常会被排除——字幕会覆盖它们，但位于人物之后——而靠近主体的大型显著物体（如望远镜、桌面设备）仍可能渗入 matte 并遮挡字幕。主体手持的物体（产品、手机）可能会间歇性地被排除，导致字幕从其前方穿过。绝不能想当然：放置 hero 之前，先在 2～3 个时间点抽查 `frames_fg/`，并优先选择避开任何渗入家具的 hero 位置（渗入物可能导致 `heroAnchor` 偏移——请结合 frames_bg 交叉检查）。
- **safe-zones 无法感知道具——必须目视检查你使用的每个区带。** Zones/heroBands 只评估_主体_遮挡和亮度：位于“干净”区域中的麦克风、望远镜或屏幕对它们而言是不可见的（而且渗入 matte 的道具会使 `heroAnchor.centerXPct` 偏离人物）。开始创作之前，为打算使用的每个区带各提取一帧；如果那里存在道具，请测量其 bbox，并移动或缩小该平面。两个实际案例之所以能够干净交付，完全是因为 agent 严格执行了这一步。（自动道具显著性检测是已知缺口；zones 的 `peakLuma` 只能捕捉_移动中_的明亮物体。）
- **字幕必须保持在画面内。** Cinematic 模式会对画面溢出执行硬性拦截；Standard 模式会以 WARNING 形式运行 `check-overflow.cjs`（有意出血是唯一例外——请阅读警告）。
- **每条字幕在屏幕上的停留时间须 ≥ 0.5 秒** —— 更短则无法阅读。
- **单词时间必须与 transcript.json 保持在 80ms 以内的误差** —— 字幕偏离节拍 500ms 就会破坏场景的真实感。Cinematic 会在渲染前通过 render-and-composite.sh 运行 `check-timing.cjs --strict`；THEME 模式则会在编译时强制执行相同的时间要求（make-theme 的顺序转录匹配器 + 逐字完整性门禁——时间漂移属于编译错误）。绝不要把多个转录单词塞入一个条目中（例如 `"FUTURE OF"`，或者仅用一个 start/end 的 `IT` + 换行 + `ALL` 堆叠）——第二个单词会继承第一个单词的时间戳并提前出现。即使你希望它们显示在同一视觉行上，也要将其拆分为具有各自时间的独立单词条目（使用 CSS `white-space` / 自然换行，而不是 `<br>`）。支持字幕文本 ≠ 转录文本的创意替换（例如以 `"15%"` 替换 `"fifteen percent"`）——请在 `check-timing.cjs` 内的 `CREATIVE_SUBS` 中注册。
- **组时间窗口必须包住其中的单词** —— 对于每个组，都必须满足 `group.in ≤ min(word.start)` 且 `group.out ≥ max(word.end)`。如果 `group.in` 晚于某个单词的开始时间，该单词会被静默延迟，直到容器挂载后才出现（我们曾因此交付过存在 800ms 延迟缺陷的作品）。验证器会强制执行此要求。
- **任意两个字幕组都不得在时间和屏幕区域上同时重叠** —— 时间重叠的字幕会导致文字层层堆叠。可选方案：(a) **空间分离** —— 将每个组放在互不重叠的垂直区带中，使其能够共存（类似 memory-wall cascade 风格）；(b) **交接** —— 将较早组的 `out` 设为 ≤ 下一组的 `in`，确保屏幕上一次只出现一个组；(c) **有意设计的分层字体排版** —— 在其中一个组上添加 `"allow_overlap": true`，以关闭验证器的相关提示。验证器会根据每个组的 CSS 估算其垂直 bbox，并标记碰撞。默认选择 (a)——正是这种方式让 cinematic-cream 呈现出诗句不断累积的感觉，而不是像字幕轨道那样逐条替换。
- **Screen 混合在明亮背景（亮度 >180）上会失效。** **Cinematic** 模板采用奶油色 + `screen`，并且这种设计 DNA **已锁定**（plan 无法对其重新着色）→ 它们在明亮背景上会显得发白，因此应选择 `ink`（专为明亮表面打造的凸版印刷风格）或 `anchor` 主题（不透明侧栏表面），而不是强行覆盖既有外观。
- **不要在单词入场时为 `letter-spacing` 或 `filter:blur` 添加动画** —— inline-block 重排会导致行跳动。
- **禁止使用 CoreML 进行抠图** —— onnxruntime CoreML EP 的混合精度分区会破坏面部 alpha（在之前的 RVM 引擎中已经观察到；不要再次尝试）。抠图只能使用 CPU（1080p 下约 2 fps，即每 10 秒剪辑约需 2～3 分钟；处理长剪辑时须为此预留时间）。

---

## 依赖项

- **hyperframes**，且已完成构建（`packages/cli/dist/cli.js`）。脚本会自动解析检出目录：`HYPERFRAMES_ROOT` 环境变量 → 如果此 Skill 位于 hyperframes _内部_，则使用仓库根目录 → `~/Downloads/hyperframes`。使用 `bun install && bun run build` 进行构建。
- **以 Node 为主；有两处通过 `uvx` 使用 Python（无需手动安装）：** 转录通过 `uvx` 运行 WhisperX（提供词级时间信息；按 SKILL §transcription 所述进行回退），Theme 的 `drawon` 场景在编译时通过 shell 调用 `python3 scripts/gen-stroke-path.py`。其他所有操作均使用 hyperframes 已自带的工具链：通过 hyperframes CLI 的 **`remove-background`** 进行抠像（u2net_human_seg；权重会自动下载一次，约 168 MB，保存至 `~/.cache/hyperframes/`），通过 **`sharp`** 处理图像/Alpha 通道计算，通过 **`puppeteer`** 处理布局/遮挡/溢出，此外还使用 **`ffmpeg`**。脚本会从 hyperframes 检出目录中自动解析这些工具——无需额外安装任何内容。
- **转录 = 通过 `uvx` 运行 WhisperX**（词级时间信息 + 对齐；无需手动安装——`transcribe.cjs` 会驱动 `uvx whisperx`）。如果已有词级 `transcript.json`，则回退使用该文件。
- **源视频**——`matte.cjs` / `transcribe.cjs` 会自动解析 `source.mp4`（或使用 glob 匹配剪辑 / 读取 `hyperframes.json`），因此执行 `hyperframes init --video X.mp4` 后无需手动重命名。
- **fps**——`matte.cjs` 会按源视频的原生帧率提取并记录 `matte.fps`；`render-and-composite.sh` 会使用该值，以确保蒙版保持逐帧对齐。
- 抠像权重不包含在内：`matte.cjs` 会通过 shell 调用 hyperframes CLI 的 `remove-background`，后者会将 u2net_human_seg（约 168 MB，Apache-2.0）一次性下载至 `~/.cache/hyperframes/background-removal/models/`。在全新机器上首次执行准备操作时，需要联网完成这一次下载。

如果缺少硬性依赖，请停止并询问用户——不要静默跳过步骤。