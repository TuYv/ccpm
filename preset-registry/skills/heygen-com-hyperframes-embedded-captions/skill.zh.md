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
> **首先，请保持此技能为最新状态——运行前先向用户确认：** `npx hyperframes skills update embedded-captions`。如果所有内容均为最新版本，该命令会快速执行空操作；否则，它会刷新此技能及其依赖的核心领域技能，之后你再使用它们。

# 嵌入式字幕

**一个目录，预先选定**（[CATALOG.md](CATALOG.md)——包含 35 种风格身份；其背后的引擎属于后端实现细节）。**Standard**（默认）会构建简洁、逐字一致的**字幕轨**（位于下三分之一区域、承载大部分文本的字幕）+ 一个在高潮处合成到主体后方场景中的**嵌入式**高潮效果。**Cinematic** 使用纯嵌入式效果——没有字幕轨，每条字幕都合成在主体后方（以主视觉字体、累积和遮挡作为效果）。**Theme** 是一套完整的主题化规范——正文范式 × 主视觉场景 × 前景特效 × 画面响应，由注册表组合而成（[themes/README.md](themes/README.md)）：`ordnance` `terminal` `neonsign` `stardust` `stomp`。大多数解说／旁白都使用 **Standard**；**嵌入式效果是稀缺且必须通过铺垫赢得的高潮**——把每个词都嵌入画面是常见错误；Theme 适用于 VFX 级需求（“炸”“特效”“像 AE 做的”）。

---

## 操作流程（简要版）

通过 `/hyperframes` 路由时，意图层仅确认输入（使用哪个片段），并将风格身份选择作为延后确认项进行**告知**——候选名单需要基于探测后的片段生成，因此该环节保留在下方第 1 步；该层关于运行形式的问题不适用（素材不会被改动，也没有故事板需要审查）。如果存在 `BRIEF.md`，其中会包含已确认的输入和所有用户备注——请先阅读它。

下面的制作说明很长；但**流程本身很短**——所有确定性内容都通过计算或编译生成，绝不手写：

1. **决策门禁**（拒绝不合适的片段）→ **从 [CATALOG.md](CATALOG.md) 中选择一种且仅一种风格身份**（共 35 种；引擎／编译器通过查表推导——绝不向用户提出模式／类别问题）
2. `hyperframes init`（如果项目目录已存在且其中已有视频，则跳过此步骤——`matte.cjs`/`transcribe.cjs` 会将目录中的任意视频接管为 source.mp4）→ **`bash scripts/prepare.sh <project>`**（并行处理遮罩 ∥ 转录 ∥ 音频包络，然后使用场景调色板／光学特征／光照生成 safe-zones v2——一个命令，绝不遗漏任何步骤）
3. **编写一个包含创意选择的小型 JSON**（先读取 `safe-zones.json`）：Cinematic → `plan.json` → `fill-timings.cjs` → `fit-fonts.cjs` → `make-composition.cjs`；Theme → `theme.json` → `make-theme.cjs`（字幕轨／面板／诗歌／接管范式；`anchor` 是安静字幕轨的默认值）
4. **视觉质检**：`node scripts/preview-frames.cjs <project>` → 约 2 秒／帧生成忠实的合成预览（无需渲染）。在付出渲染成本前，先检查“视觉质检”一节。
5. `render-and-composite.sh` → 门禁（时序／遮挡+主视觉／溢出／交付）→ `final.mp4`

人们容易忽略的关键规则：

- **字幕轨（默认）+ 嵌入式效果（晋升）。** `drop`（填充词，不显示）/ `rail`（逐字一致的下三分之一区域字幕，位于前景，承载大部分文本）/ `embed`（合成在主体后方的高潮词）。**Standard 模式会同时使用二者**，仅将高潮词嵌入画面。参见**§ 字幕模型**。
- **交付的视频保持完全不变（Standard/Cinematic；**Theme 模式的 PLATE 预算是唯一获准的例外**——由注册表控制的响应节拍（蓄力变暗、冲击、震动、颗粒），按照各主题 DNA 定义，并在遮罩合成之后应用，使主体+文本+底片作为同一帧整体运动）**——字幕是唯一添加的内容；遮罩仅用于让主体遮挡嵌入式轨道。绝不要对素材进行调色／重新着色／添加扫描线。
- 两套规则手册：**字幕轨 → [references/rail.md](references/rail.md)**（精简），**嵌入式效果制作 → [references/composition-craft.md](references/composition-craft.md)**（详尽，仅适用于嵌入式效果）。按需浏览。

---

## 字幕模型 — 字幕轨 + 嵌入

每个口语片段都属于以下三类之一：

|           | 含义                                             | 呈现方式                                                                                                                                                    |
| --------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **drop**  | 填充语——嗯/呃、结巴、自我纠正       | 不显示                                                                                                                                                         |
| **rail**  | 默认形式——普通口语内容（逐字呈现） | 简洁的下三分之一字幕，位于**前景**，清晰可读。重点词可以获得行内 `emphasis` 高亮（强调色/当前词弹出效果）——它仍保留在字幕轨上。 |
| **embed** | 被提升的峰值——标题式节拍              | 一个大字词合成在**主体后方**（遮罩遮挡），并配有精心设计的入场和退场效果                                                                        |

**字幕轨承载大部分文本；嵌入则是稀缺且需要赢得的峰值。** 稀缺性是**按节拍/区块计算，而不是按剪辑片段计算**：每个区块（思路）最多 1 个主视觉，绝不允许两个同时可见，主视觉窗口之间至少留出一个节拍的空隙（低于 0.6 秒时编译器会发出警告）。短片通常有 1–2 个；较长的讲解视频则大约每个章节一个。在多个主视觉中，**创作尺寸最大的一个是 APEX**（只有它会获得完整的锁定式嵌入和宽度适配抬升效果）；较小的是 **MINOR 峰值**，它们以超大强调行的形式沿所在列移动（前景、阻尼运动）——并非每个节拍都需要遮罩式重点展示，正因如此，APEX 才能成为一个真正的事件。把每个词都嵌入仍然是常见错误。

字幕轨表层类身份正是用于构建这种效果（字幕轨 = `rail.html`，嵌入 = `index.html` 中的高潮）。列流式身份会去掉字幕轨，让所有内容都采用嵌入风格——仅在用户更重氛围、轻逐字呈现时推荐使用；对于文字必须清晰可读的讲解/旁白内容，绝不要推荐（CATALOG.md 会按身份编码此项信息）。

---

## 第 0 步——从 CATALOG 中选择一个身份

**一个前端，背后三个引擎。** 用户从 [CATALOG.md](CATALOG.md)（35 个条目：10 个经典身份 + 25 个主题身份）中选择一个 IDENTITY；引擎、编译器和创作文件均通过查询目录中的对应行得出。**绝不要把“Standard、Cinematic 还是 Theme”作为问题抛给用户**——这些是后端名称（即使有多个引擎，一个产品也只有一套用户体验）。目录编码了路由所需的一切信息：阅读表层、风格、推荐用途、场景需求，以及确实相近的组合所对应的邻接说明（loud↔ordnance、neon↔neonsign、cream↔stardust）。

身份选择是一个**偏好门控**（`../hyperframes-core/references/brief-contract.md` § 1）：在自主模式（“给我个惊喜”/“替我决定”）下，直接从候选列表中自行选择，并用一句话说明理由，而不是向用户提问。

流程：探查剪辑 → 从目录中筛选出 2–3 个身份方案 → 推荐**一个**并用一句话说明原因 → **由用户选择**（自主模式：由你选择并说明原因）→ 编写该身份方案的文件。身份方案与引擎锁定绑定（不可跨引擎组合；打开其中一个即视为一次验证事件——参见 dna/README.md）。

**在编写文件之前，始终先给出你的推荐并让用户选择。** 不要静默采用默认方案。

（完整的身份方案表位于 [CATALOG.md](CATALOG.md)——它是路由选择的唯一事实来源。下方的引擎文档描述了每个后端的编写契约。）

**推荐启发式规则**：使用 [CATALOG.md](CATALOG.md) 中的“筛选启发式规则”——这些规则以身份方案为粒度（例如，“炸”会筛选出 ordnance/stomp/terminal/loud，再根据应该让**什么**爆炸来选择），绝不是以类别为粒度。不确定时 → `anchor`。

- **电影感** → 为锁定模板编写 `plan.json`，由 `make-composition.cjs` 编译。
- **主题** → 阅读 [themes/README.md](themes/README.md)，编写 `theme.json`，运行 `scripts/render-theme.sh`（编译 + 渲染 + 画面反应 → **final_fx.mp4**）。

---

## 决策关卡——首先运行

在进入任一模式前，先探查视频并对场景进行分类。

```bash
ffprobe <video.mp4>                    # specs
ffmpeg -ss <t> -i <video.mp4> -vframes 1 sample.png   # at 20/50/80%
```

查看采样画面。遇到以下情况时拒绝处理：

- 有多个说话者／硬切镜头（拆分后逐个镜头渲染，否则拒绝）
- 没有人物主体（此技能适用于对镜讲话视频）
- 时长不足 3 秒、**没有语音**，或人脸始终无法清晰看见——当音频接近静音时，`transcribe.cjs` 会发出警告（Whisper 会在静音上凭空生成诸如“Thank you.”之类的文字）；**务必听从警告并拒绝处理**，而不是为捏造的内容添加字幕
- **源视频已经带有内嵌字幕／副标题／大量文字图形**——再添加第二套字幕系统会产生冲突，而且素材会原样输出（不会进行遮盖／修复）。内嵌文字通常只在剪辑中段出现：请生成一张 **1fps 接触表**（`ffmpeg -i in.mp4 -vf "fps=1,scale=160:-1,tile=10x5" sheet.png`），不要只相信 3 个抽样帧。
- **转录内容一团糟**——非母语／重口音语音可能被自信地转录成毫无意义的文字。编写文件前先通读 `transcript.json` 并进行合理性检查；如果内容不像正常语言，使用 `WHISPER_MODEL=medium` 再尝试一次，否则拒绝处理（逐字展示一长串捏造的文字，比没有字幕更糟）。
- 快速运动且画面繁杂的手持拍摄（遮罩会闪烁）

### 预检探查（零成本，可避免最严重的失败）

1. **镜头切换探查。** 在 20%、50%、80% 的位置采样画面。如果出现不同的主体／场景，需在切换前**裁剪剪辑**。
2. **上下黑边／左右黑边探查。** 第一帧上有黑边吗？计算安全内容矩形，并将字幕位置限制在其中。
3. **亮度探查。** 对字幕区域的平均亮度进行采样——`under 60` → 浅色文字可直接清晰显示，`60-180` → 添加字形遮罩，`180+` → 使用不透明文字 + 遮罩（绝不能直接使用无衬底的浅色文字）。**电影感模板采用米白色+`screen` 且已锁定**——应利用此探查来_选择合适的身份方案_（明亮场景 → `ink`，或采用不透明字幕轨的 `anchor` 主题），绝不能据此为某个身份方案重新着色。
4. **根据基调推荐身份方案（由你推荐；用户选择——参见步骤 0 + CATALOG.md）。** 讲解／访谈／必须清晰阅读的文字 → 字幕轨／面板表面类身份方案；诗意／社交媒体／“电影感” → 按风格语域选择纵向流动类身份方案；“炸／特效／VFX”／指定世界观 → 主题类身份方案。不确定时 → `anchor`（文字清晰，画面安全）——但仍需给出候选清单并让用户选择。

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

步骤 1 的 `init` 会将已安装的技能与 GitHub 上的最新版本进行核对，如果有任何技能已过时，就会更新全局技能集。

步骤 3 因模式而异：

### 步骤 3 — 电影感模式（纯嵌入）

1. **首先读取 `safe-zones.json`。**旁白平面应放在 **`zones.hugLeft`/`hugRight`** 中——即紧贴轮廓的干净条带（文字离主体太远会显得悬浮，而非嵌入；远端角落是后备选项，并非默认选择）。主视觉默认使用 `heroAnchor`/`heroBands.best`（在主体上居中，约 30–55% 被遮挡）。`recommendation:"fg"` 会将旁白移至前景以确保可读性；**只要 `heroBands.feasible`，主视觉就应保持嵌入状态**——将主视觉置于前景是最后的手段。
2. **DNA 就是你在步骤 0**（CATALOG.md）中选择的视觉身份——不要在这里重新做选择。根据场景对其进行合理性检查（明亮的主视觉带亮度 > 150 时适合 `ink`；完整的选择指南位于目录中，涵盖全部十种风格，包括 neon / glitch / chrome / velocity）。说明你的选择及理由；由用户决定。DNA 会锁定字体/调色板/混合/动效 + 主视觉三幕结构；safe-zones v2（`palette`/`optics`/`lighting`）会自动针对当前场景对其进行参数化。
3. **编写 `<project>/cinematic.json`**——包含 `"dna": "<name>"`` + 思维区块，而不是原始分组：每个区块 = 若干行单词（在从句边界处按 2–5 个词分组）+ 这些行堆叠所在的平面 + 每行的 `css`（仅限字号/字重/样式——不含位置）+ 最多一行标记为 `"hero": true`（被提升的词；使用 `"text"` 指定其显示形式）。模式定义：见 `scripts/make-cinematic.cjs` 文件头。
4. **编译**：`node scripts/make-cinematic.cjs <project>`——将区块降级转换为 plan.json，再生成 index.html。系统会为你生成：按转录顺序排列的时间轴、区块内累积显示、区块间翻页、**主视觉组合**（主视觉区块中的前置上下文、主视觉和后置上下文会堆叠成一个结合紧密的整体构图，并在主体上居中——按照构造，阅读顺序从上到下即为口述顺序；上下文悬浮在前景中，而主视觉嵌入在后方，形成景深夹层；视觉质量规则会确保主视觉压过其上下文）、顶点/次要主视觉拆分、**由构造保证的阅读顺序**、基于 safe-zones 的前景后备方案。然后照常运行各项门禁检查。_（对于区块无法表达的设计，仍可直接手动编写 plan.json——随后自行运行 `fill-timings.cjs` + `fit-fonts.cjs` + `make-composition.cjs`。）_

### 第 3 步 — 主题模式（主题化章程）

**首先阅读 [themes/README.md](themes/README.md)** — 范式/重点场景注册表、关联关系、硬性规则，以及准确的 `theme.json` 模式。

1. **根据内容语域选择主题 DNA**（每个 `themes/<name>.json` 都包含 `voice` + `when`）。说明你的选择及原因；由用户决定。
2. **编写 `<project>/theme.json`** — `dna`、`lines`（逐字保留，按转录顺序；每行 1–5 个词 — 对于 `takeover`，每一行都是一张 CARD）、`minors`（强调词）、`hero:{match}`（高潮词/短语；对于嵌入式重点场景，将其排除在 `lines` 之外；对于行内重点场景以及 panel+redact，则将其保留在其中）。
3. **渲染**：`bash scripts/render-theme.sh <project>` — 编译（在编译时执行逐字完整性门禁）、渲染两个图层、合成，并应用底板响应 → `final_fx.mp4`。在编译与渲染之间使用 `preview-frames.cjs` 进行视觉质量检查。

---

## 视觉质量检查 — 渲染前先预览

`node scripts/preview-frames.cjs <project> [t…]` 会合成**忠实的预览帧，每帧约需 2 秒**（在跳转时间点截取的字幕图层 + 真实视频帧 + 遮罩遮挡 + 轨道叠加层 = 最终合成在该时刻呈现的效果）。默认采样点 = 每个分组/高潮窗口。完整渲染需要几分钟 — 绝不要用它来*发现*布局问题。

按照以下清单检查预览（`<project>/preview/sheet.png`）— 这些是几何门禁**无法**发现的问题：

1. **过度泛白** — 浅色文字覆盖在明亮区域（窗户/标牌/天空）上：无法阅读 → 移动平面或更换 DNA/模式（明亮场景 → `ink`）。
2. **文字叠文字** — 字幕覆盖场景本身的文字/图形，或两个字幕组相互碰撞。
3. **阅读顺序** — 屏幕上的垂直顺序必须与口语顺序一致；主视觉不得位于后续词语的下方。
4. **主视觉存在感** — 高潮内容应当醒目巨大，并明显位于主体后方（约 30–55% 被遮挡），而不是像一个漂浮在边缘空白处的标签。
5. **平衡** — 形成一个连贯的纵列/横带，而不是散落的碎片；边距留有呼吸空间；任何内容都不得被裁切。

然后执行 [references/reference-bar.md](references/reference-bar.md) 中的 **5 项正向检查**（海报测试 · 胆怯测试 · 一瞥层级 · 场景呼应 · 空白时段审查）— 失败清单用于避免渲染结果出错；正向清单则让它真正具有*设计感*。两者都通过后再交付。

**新鲜视角审查（建议用于任何面向用户的内容）：**你会对自己的布局产生确认偏误。如果可以启动子代理，只向它提供预览表和此清单，并要求它逐帧给出 PASS/FIX 结论（“请根据 5 点清单审查这些字幕预览；逐帧回答 PASS 或具体修复方案”）。在 plan.json / theme.json 中应用修复、重新编译并再次预览 — 每轮只需几秒。预览通过后，只渲染一次。

---

## DNA 注册表 — 十种视觉语言（取代模板目录）

两种模式都取自 **[dna/](dna/README.md)** — 十种经过艺术指导的视觉语言，可**根据每个场景进行参数化**（从素材中采样强调色、沿测得的光照方向生成接触阴影、匹配景深的模糊、与 RMS 耦合的主视觉振幅）：

| DNA             | 风格定位       | 场景适配                                        | 视觉语言                                                                                           |
| --------------- | -------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **cream**       | 高端温暖       | 深色/中等亮度的暖色场景                         | Inter + 暖奶油色 + screen；以辉光浮现的主视觉（cinematic-cream 的继任者）                          |
| **ink**         | 高端           | **明亮场景（luma > 150）**                      | 近黑色 multiply——仿佛文字直接印在墙上；适用于明亮场景                                             |
| **editorial**   | 编辑奢华       | 内省 / 时尚 / 诗意                              | Bodoni Moda、小写斜体主视觉——杂志般的优雅                                                         |
| **keynote**     | 科技高端       | 产品 / 发布                                     | 不透明白色 Inter 800，正中央的静止感                                                              |
| **documentary** | 正式           | 访谈 / 严肃                                     | 烧入式显现，无主视觉——庄重感本身即是风格                                                          |
| **loud**        | 高调           | 炒热气氛 / 体育 / 社交                          | Anton + 从场景采样的强调色，单元式猛击 + 涟漪；正文在前景中高声宣告（`bodyLayer: fg`）             |
| **neon**        | 高调霓虹       | 霓虹黑色电影 / 夜生活 / 科技黑色电影（暗色场景） | 电光青色标牌、点亮时的闪烁，主视觉如标牌般通电亮起                                                |
| **glitch**      | 高调霓虹       | 数字 / 黑客 / AI                                | RGB 分离的重影在落定时瞬间合一；机械而富有冲击力的节奏                                            |
| **chrome**      | 高调奢华       | Y2K / 时尚科技 / 音乐                           | 液态金属渐变主视觉 + 停留期间的一次光泽扫过                                                        |
| **velocity**    | 高调运动       | 体育 / 汽车 / 健身                              | 每个词都沿其运动矢量入场（拖影+倾斜），主视觉伴随速度轨迹掠过                                     |

根据 `safe-zones.json`（`heroAnchor.bandLuma`、`palette.temperature`）× 内容风格定位进行选择——决策规则参见 [dna/README.md](dna/README.md)。编写方式：在 `cinematic.json` 中使用 `"dna": "<name>"`。

引擎会根据 DNA 生成**主视觉三幕结构**（无需编写）：共同可见的字幕变暗（铺垫）→ 逐字母入场，幅度 ∝ 语音响度（冲击）→ 呼吸 + 发光直至退场（余韵）。

（旧版兼容：`plan.template:"cinematic-cream"` 会自动映射到 `dna:"cream"`。已退役的 54 模板库归档于此仓库之外，不随该 Skill 分发；`_motion.md` 仍保留在 Skill 内，作为动作动词参考目录。）

---

## 美学决策——基调 × 镜头 × 平台（作为目录候选筛选的输入，而非第二套路由器）

从 3 个维度对片段进行分类，并将结果用于 CATALOG.md 的候选筛选——本节本身绝不选择模式/引擎：

**基调**（内容呈现什么样的感觉？）

- 纪实 | 对话感 | 活力 | 诗意 | 主题演讲 | 调查式 | 音乐视频

**镜头**（画面如何取景？）

- 特写（头部 + 肩部） | 中景（躯干及以上） | 全景（全身及更大范围） | 剪辑蒙太奇（混合镜头）

**平台**（将在何处播放？）

- 9:16 竖屏（TikTok/IG/Shorts） | 16:9 横屏（YouTube/网页） | 1:1 方形 | 广播级导出

请交叉参阅 [references/direction-catalog.md § 分类矩阵](references/direction-catalog.md)以获取视觉方向语言——然后返回 [CATALOG.md](CATALOG.md)筛选候选视觉标识（该矩阵为候选筛选提供依据；目录是唯一的路由入口）。

## 构图技法（嵌入轨道）——嵌入前必读

完整的**嵌入轨道**手册位于 **[references/composition-craft.md](references/composition-craft.md)**：转录文本角色标注、短语分组、平面与留白区锚定、区域连贯性、高潮突显与可读性、边缘留白、遮挡三步判断，以及累积/持续。它规定了被_提升_的短语如何融入场景——在制作任何嵌入内容（Cinematic `plan.json` 或 Standard `index.html`）之前，请先阅读。默认的**字幕栏**轨道有一套独立且简单得多的规范 → **[references/rail.md](references/rail.md)**。

---

## 共享知识

| 文档                                                                     | 内容                                                                                                                               |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| [references/rail.md](references/rail.md)                                 | **字幕栏轨道**——标准下三分之一字幕规范（默认轨道；承载大部分文本）。                                                               |
| [references/composition-craft.md](references/composition-craft.md)       | **嵌入轨道手册**——分组、平面、高潮突显、遮挡判断、累积/持续。嵌入前必读。                                                          |
| [dna/README.md](dna/README.md)                                           | **DNA 注册表**——十种由场景参数驱动的视觉语言；以及如何选择。                                                                       |
| [references/reference-bar.md](references/reference-bar.md)               | **品味标杆**——按风格分类的世界级参考 + 5 项正向检查。                                                                              |
| [references/aesthetic-principles.md](references/aesthetic-principles.md) | **18 条规则。**在审美品味上超越 Veed AI。优先阅读。                                                                                |
| [references/motion-vocabulary.md](references/motion-vocabulary.md)       | 10 种具名动效原语 + 基调→时序查询表                                                                                                |
| [references/direction-catalog.md](references/direction-catalog.md)       | 10 种可直接交付的美学风格 + 基调×镜头×平台矩阵                                                                                     |
| [references/anti-patterns.md](references/anti-patterns.md)               | 已经排除的缺陷（CoreML、字间距导致的重排等）                                                                                       |
| [references/scene-types.md](references/scene-types.md)                   | 墙面何时可用（4 个条件）                                                                                                           |
| [references/layout-heuristics.md](references/layout-heuristics.md)       | 平面定位、留白区选择、顶部区域的 3 个条件、柱状黑边计算方法                                                                        |
| [references/typography-presets.md](references/typography-presets.md)     | 字号 × 栏宽矩阵（起始参考值）                                                                                                      |
| [references/caption-grouping.md](references/caption-grouping.md)         | 单词 → 分组规则（停顿、句子边界）                                                                                                  |
| [references/failure-modes.md](references/failure-modes.md)               | 大量不常见的开发陷阱                                                                                                               |
| [references/bespoke-vs-presets.md](references/bespoke-vs-presets.md)     | 预设有时失效的原因；克隆并微调模式                                                                                                 |

**首先阅读美学原则和方向目录。** 其他一切都只是实现细节。

---

## 不可妥协的要求

- **面部绝不能持续被 100% 遮挡**——在任意 0.3 秒的时间窗口内，面部边界框必须至少有 30% 未被遮挡。
- **WCAG 对比度**——对最终渲染结果执行 lint 检查；如果未通过，则修正配色方案。
- **确定性**——不得使用 `Math.random()`、`Date.now()`、`repeat:-1`。
- **绝不对视频进行调色或重新着色。** 原始素材必须原样交付——字幕是唯一允许添加的内容。不得在 A-roll 整个画面上叠加全屏扫描线、双色调、压暗或暗角效果。霓虹黑色电影/CRT 纹理只能放在字幕元素*内部*，不能覆盖整个画面。
- **访谈式出镜/讲解视频应以侧栏为主。** 不要嵌入整份转录文本——大部分文本应放在侧栏中；只嵌入高潮点。嵌入所有内容是最常见的错误。
- **嵌入内容应稀少且保持间隔。** 每个句子/节拍最多嵌入 1 个，绝不能有两个相邻或同时可见，彼此至少间隔一个节拍，并且最多只能有一个 `apex`。climax 指每个节拍的峰值，**而不是**“整个片段唯一的最终爆点”。
- **Matte 指人物（hyperframes `remove-background`、u2net_human_seg、Apache-2.0）。** 其意图是进行人物分割，但并非外科手术般精确：细长且偏离人物的家具或设备（如麦克风悬臂）通常会被排除——字幕会覆盖在它们上方、位于人物后方——而人物附近显眼的大型物体（如望远镜、桌面设备）仍可能漏入 Matte 并遮挡字幕。人物手持的物体（产品、手机）可能会间歇性地从 Matte 中消失，导致字幕从其前方穿过。绝不能想当然：放置主视觉元素之前，先在 2～3 个时间点抽查 `frames_fg/`，并优先选择避开任何漏入家具的主视觉位置（泄漏物可能导致 `heroAnchor` 偏移——应与 frames_bg 交叉核对）。
- **safe-zones 无法识别道具——务必目视检查你使用的每个区域。** Zones/heroBands 只评估*主体*遮挡和亮度：位于“干净”区域内的麦克风、望远镜或屏幕对它们而言是不可见的（而漏入 Matte 的道具还会使 `heroAnchor.centerXPct` 偏离人物）。制作之前，为计划使用的每个区域提取一帧；如果那里存在道具，请测量其边界框并移动或缩小平面。两个真实项目之所以能够干净交付，正是因为代理严格执行了这一步。（自动道具显著性检测是已知缺口；Zones 的 `peakLuma` 只能捕捉*移动中*的明亮物体。）
- **字幕必须保持在画面内。** Cinematic 模式会对画面溢出进行硬性拦截；Standard 模式通过 `check-overflow.cjs` 将其作为 WARNING 报告（刻意出血是唯一例外——请阅读警告）。
- **每条字幕在屏幕上至少停留 0.5 秒**——时间更短则无法阅读。
- **单词时间必须与 transcript.json 保持在 80ms 以内的误差**——字幕若偏离节拍 500ms，就会破坏场景幻觉。Cinematic 会在渲染前（通过 render-and-composite.sh）运行 `check-timing.cjs --strict`；THEME 模式则会在编译时强制执行相同的时间要求（make-theme 的顺序转录文本匹配器 + 逐字完整性门禁——时间漂移属于编译错误）。绝不要将多个转录文本单词合并到一个条目中（例如 `"FUTURE OF"`，或将 `IT` + 换行 + `ALL` 堆叠在一起却只设置一组 start/end）——第二个单词会继承第一个单词的时间戳并提前触发。即使希望它们显示在同一视觉行中，也应将其拆分为拥有各自时间的独立单词条目（使用 CSS `white-space` / 自然换行，而不是 `<br>`）。支持字幕文本 ≠ 转录文本的创意替换（例如用 `"15%"` 替换 `"fifteen percent"`）——请在 `check-timing.cjs` 内的 `CREATIVE_SUBS` 中注册这些替换。
- **分组时间窗口必须包住其中的所有单词**——对于每个分组，都必须满足 `group.in ≤ min(word.start)` 且 `group.out ≥ max(word.end)`。如果 `group.in` 晚于某个单词的开始时间，该单词会被静默延迟，直到容器挂载时才出现（我们曾因此交付过存在 800ms 延迟问题的项目）。验证器会强制执行此要求。
- **任意两个字幕分组都不得在时间和屏幕区域上同时重叠**——时间重叠的字幕会形成文本堆叠。可选方案：(a) **空间分隔**——将每个分组放在互不重叠的垂直区域中，使其能够共存（类似 memory-wall cascade 风格）；(b) **交接**——将前一个分组的 `out` 设为 ≤ 后一个分组的 `in`，确保屏幕上同时只显示一个分组；(c) **有意设计的分层排版**——在其中一个分组上添加 `"allow_overlap": true`，以禁止验证器报错。验证器会根据每个分组的 CSS 估算其垂直边界框，并标记碰撞。默认选择 (a)——正是这种方式让 cinematic-cream 呈现出诗句逐渐累积的感觉，而不是像字幕轨一样不断相互替换。
- **Screen 混合模式在明亮背景（亮度 >180）上会失效。** **Cinematic** 模板采用奶油色 + `screen`，且这一设计基因已被**锁定**（方案无法对其重新着色）→ 在明亮背景上会显得褪色，因此应选择 `ink`（专为明亮表面打造的 letterpress 风格）或 `anchor` 主题（不透明侧栏表面），而不是强行覆盖某种外观。
- **不要在单词入场时为 `letter-spacing` 或 `filter:blur` 设置动画**——inline-block 重排会导致跳行。
- **禁止使用 CoreML 进行抠像**——onnxruntime CoreML EP 的混合精度分区会破坏面部 Alpha（此前使用 RVM 引擎时已观察到这一问题；不要再次尝试）。抠像只能使用 CPU（1080p 下约 2 fps，即每 10 秒片段约需 2～3 分钟；处理长片段时应为此预留时间）。

---

## 依赖项

- **hyperframes**，已构建（`packages/cli/dist/cli.js`）。脚本会自动解析检出目录：`HYPERFRAMES_ROOT` 环境变量 → 如果此 Skill 位于 hyperframes _内部_，则使用仓库根目录 → `~/Downloads/hyperframes`。使用 `bun install && bun run build` 进行构建。
- **Node 优先；通过 `uvx` 使用两个 Python 接入点（无需手动安装）：** 转录通过 `uvx` 运行 WhisperX（提供词级时间信息；按 SKILL §transcription 所述进行回退），Theme 的 `drawon` 场景组件则会在编译时通过 shell 调用 `python3 scripts/gen-stroke-path.py`。其余所有操作均使用 hyperframes 已自带的工具链：通过 hyperframes CLI 的 **`remove-background`** 进行抠图（u2net_human_seg；权重会自动下载一次，约 168 MB，保存到 `~/.cache/hyperframes/`），通过 **`sharp`** 进行图像/Alpha 运算，通过 **`puppeteer`** 处理布局/遮挡/溢出，此外还使用 **`ffmpeg`**。脚本会从 hyperframes 检出目录中自动解析这些工具——无需额外安装任何内容。
- **转录 = 通过 `uvx` 运行 WhisperX**（词级时间信息 + 对齐；无需手动安装——`transcribe.cjs` 会驱动 `uvx whisperx`）。如果已有词级 `transcript.json`，则回退使用该文件。
- **源视频**——`matte.cjs` / `transcribe.cjs` 会自动解析 `source.mp4`（或通过 glob 查找剪辑文件 / 读取 `hyperframes.json`），因此使用 `hyperframes init --video X.mp4` 时无需手动重命名。
- **fps**——`matte.cjs` 会以源视频的原生帧率提取并记录 `matte.fps`；`render-and-composite.sh` 会使用该值，使蒙版保持逐帧对齐。
- 抠图权重未包含在内：`matte.cjs` 会通过 shell 调用 hyperframes CLI 的 `remove-background`，后者会将 u2net_human_seg（约 168 MB，Apache-2.0）一次性下载到 `~/.cache/hyperframes/background-removal/models/`。在新机器上首次执行准备操作时，需要联网完成这一次下载。

如果缺少硬性依赖项，请停止并询问用户——不要静默跳过步骤。