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
> **首先，保持此技能最新——运行前请先向用户确认：** `npx hyperframes skills update embedded-captions`。一切均为最新时会快速空操作；否则会在依赖这些技能之前，刷新此技能及其依赖的核心领域技能。

# Embedded Captions

**一个目录，预先选定**（[CATALOG.md](CATALOG.md) — 35 种身份；背后的引擎属于后端细节）。**Standard**（默认）会构建一条干净的逐字 **rail**（承载大部分文本的下三分之一字幕）+ 一个在高潮处合成到场景**内部**、位于主体身后的 **embed**。**Cinematic** 是纯 embed — 没有 rail，所有字幕都合成在主体后方（英雄式排版、累积、遮挡即为其效果）。**Theme** 是完整的主题化构成 — 身体范式 × 英雄级场面 × 前景 fx × plate 反应，来自注册表组合而成（[themes/README.md](themes/README.md)）：`ordnance` `terminal` `neonsign` `stardust` `stomp`。大多数解释型内容 / 旁白使用 **Standard**；**embed 是稀缺且有 earned 感的高潮** — 把每个词都嵌入是常见错误；Theme 适用于 VFX 级需求（“炸”“特效”“像 AE 做的”）。

---

## Operational flow (TL;DR)

通过 `/hyperframes` 路由时，意图层只确认输入（哪个片段），并将身份选择宣布为延后询问 — 候选列表需要先探测片段，因此仍处于下方第 1 步；该层关于运行形态的问题不适用（素材不会被改动，也没有需要评审的分镜）。如果存在 `BRIEF.md`，其中会记录已确认的输入和用户备注 — 先阅读它。

下面的工艺说明很长；**管线本身很短** — 一切确定性的内容都会被计算或编译，从不手写：

1. **决策关卡**（拒绝不合格的片段）→ 从 [CATALOG.md](CATALOG.md) 中**选择一个身份**（35 种身份；引擎 / 编译器通过查找派生 — 绝不要提出模式 / 类别选择问题）
2. `hyperframes init`（如果项目目录已经存在且其中有视频，则跳过 — `matte.cjs`/`transcribe.cjs` 会将目录中的任意视频作为 source.mp4）→ **`bash scripts/prepare.sh <project>`**（并行执行 matte ∥ transcribe ∥ audio-envelope，然后使用场景调色板 / 光学特征 / 光照执行 safe-zones v2 — 一个命令，不会遗漏任何步骤）
3. **编写一份包含创意选择的小型 JSON**（先阅读 `safe-zones.json`）：Cinematic → `plan.json` → `fill-timings.cjs` → `fit-fonts.cjs` → `make-composition.cjs`；Theme → `theme.json` → `make-theme.cjs`（rail/panel/poem/takeover 范式；`anchor` 是安静的 rail 默认值）
4. **视觉 QA**：`node scripts/preview-frames.cjs <project>` → 约 2 秒 / 帧生成忠实的合成预览（不进行渲染）。在付费渲染前检查 § Visual QA。
5. `render-and-composite.sh` → 关卡（时序 / 遮挡 + hero / 溢出 / 交接）→ `final.mp4`

人们容易漏掉的关键规则：

- **rail（默认）+ embed（晋级）。** `drop`（填充内容，不显示）/ `rail`（逐字的下三分之一字幕，位于前景，承载大部分文本）/ `embed`（合成在主体后方的高潮词）。**Standard 模式同时使用两者**，仅嵌入高潮词。参见 **§ Caption model**。
- 视频会以**未经改动**的状态交付（Standard/Cinematic；**Theme 模式的 PLATE 预算是唯一获准的例外** — 每个主题 DNA 定义了经过注册表门控的反应节拍（charge-dim、punch、shake、grain），并在 matte 合成**之后**应用，使主体 + 文本 + plate 作为一个画面整体移动）——唯一添加的是字幕；matte 只是让主体能够遮挡 embed 轨道。绝不要对素材进行调色 / 重新着色 / 添加 scanline。
- 两套规则手册：**rail → [references/rail.md](references/rail.md)**（精简），**embed 工艺 → [references/composition-craft.md](references/composition-craft.md)**（丰富，仅适用于 embed）。按需略读。

---

## 字幕模型 — rail + embed

每个口语短语都属于以下三类之一：

|           | 含义                                             | 呈现方式                                                                                                                                                    |
| --------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **drop**  | 填充词——um/uh、口吃、自我纠正       | 不显示                                                                                                                                                         |
| **rail**  | 默认类型——普通口语内容（逐字呈现） | 简洁的下三分之一字幕，**位于前景**，清晰易读。重点词可以获得行内 `emphasis` 高亮（强调色 / 活跃词弹出效果）——它仍然位于 rail 上。 |
| **embed** | 提升后的峰值——标题式节拍              | 一个大词合成在**主体后方**（遮罩遮挡），带有设计好的入场和出场效果                                                                        |

**大部分文本由 rail 承载；embed 是稀缺且来之不易的峰值。** 稀缺性是**按节拍/区块计算，而不是按片段计算**：每个区块（一个思绪）最多 1 个 hero，绝不允许两个 hero 同时可见；hero 窗口之间至少间隔一个节拍（编译器会对小于 0.6 秒的情况发出警告）。短片通常有 1–2 个；较长的讲解视频则每个章节大约 1 个。在多个 hero 中，**作者指定的最大者是 APEX**（只有它会获得完整的锁定式 embed + 宽度适配提升）；较小的 hero 是随其列排列的超大强调行（前景色、减弱的动效），属于 **MINOR 峰值**——并非每个节拍都需要使用遮罩展示，而这正是让 apex 成为一个事件的关键。将每个词都嵌入仍然是最常见的错误。

Rail-surface identities 正是这样构建的（rail = `rail.html`，embed = `index.html` 中的高潮部分）。Column-flow identities 会移除 rail，让所有内容都采用 embed 风格——仅在用户更看重氛围而非逐字呈现时推荐它们；对于讲解 / 旁白场景，文字必须清晰可读，因此绝不要推荐这种方式（CATALOG.md 按 identity 对此进行了编码）。

---

## 第 0 步 — 从 CATALOG 中选择一个 identity

**一个前端，背后三种引擎。** 用户从 [CATALOG.md](CATALOG.md) 中选择一个 IDENTITY（共 35 个条目：10 个经典款 + 25 个主题款）；引擎、编译器和创作文件通过目录行查找得出。**绝不要将“Standard vs Cinematic vs Theme”作为问题抛给用户**——这些是后端名称（即使一个产品拥有多个引擎，它仍然只有一个 UX）。目录编码了路由所需的全部信息：阅读界面、声音、推荐用途、场景需求，以及对确实相近的配对项（loud↔ordnance、neon↔neonsign、cream↔stardust）的邻接说明。

identity 的选择是一个**偏好门槛**（`../hyperframes-core/references/brief-contract.md` § 1）：在自主模式（“给我个惊喜” / “你来决定”）下，从你的候选列表中自行选择，并说明一句话的理由，而不是提问。

流程：探查视频片段 → 从目录中筛选 2–3 个身份 → 用一句话说明原因并推荐一个 → **由用户选择**（自主模式：由你选择，并说明原因）→ 编写该身份的文件。身份与引擎锁定（不支持跨身份组合；打开一个身份就是一次验证事件——参见 dna/README.md）。

**始终先给出你的推荐，并让用户在你编写文件之前进行选择。** 不要默默使用默认值。

（完整的身份表位于 [CATALOG.md](CATALOG.md) —— 它是路由的唯一事实来源。下面的引擎文档说明了每个后端的编写契约。）

**此处的全部可选答案空间就是 CATALOG.md：此工作流不会搜索 HyperFrames 组件注册表。** 组合工作流会在编写命名风格之前运行 `npx hyperframes catalog`；但此工作流不得运行。它的引擎是锁定的编译器，使用 `cinematic.json` / `theme.json` 作为输入，并自行生成组合，因此注册表项目——包括 `caption-*` 模块——没有可挂载的对象。注册表模块是在设计好的画布上为文本设置样式；而此技能则是通过遮罩将字幕烧录到他人的视频素材中。当没有身份适合该请求时，请说明这一点并选择最接近的身份，不要跳出目录范围。

**推荐启发式规则**：使用 [CATALOG.md](CATALOG.md) 中的“Shortlisting heuristics”——它们针对的是身份层级（例如“炸”会筛选 ordnance/stomp/terminal/loud，并根据“应该炸掉什么”来选择），而不是类别层级。不确定时 → `anchor`。

- **Cinematic** → 为锁定模板编写 `plan.json`，由 `make-composition.cjs` 编译。
- **Theme** → 阅读 [themes/README.md](themes/README.md)，编写 `theme.json`，运行 `scripts/render-theme.sh`（编译 + 渲染 + 素材反应 → **final_fx.mp4**）。

---

## 决策关卡 — 首先运行

在任一模式之前，先探查视频并对场景进行分类。

```bash
ffprobe <video.mp4>                    # specs
ffmpeg -ss <t> -i <video.mp4> -vframes 1 sample.png   # at 20/50/80%
```

读取这些采样图像。如果出现以下情况，则拒绝处理：

- 多位说话者 / 硬切（拆分并分别渲染每个镜头，或拒绝处理）
- 没有人类主体（此技能用于真人出镜视频）
- 少于 3 秒、**没有语音**，或面部始终无法清晰可见 — `transcribe.cjs` 会在音频接近静音时发出警告（Whisper 会在静音上幻觉生成诸如 "Thank you." 之类的词）；**请遵守该警告并拒绝处理**，不要为虚构的词语添加字幕
- **源视频已经带有烧录字幕 / 字幕轨 / 大量文字图形** — 再添加第二套字幕系统会产生冲突，而视频素材会原样交付（不会进行遮盖/修复）。烧录文字通常只会在片段中段出现：请采样一张 **1fps 联系表**（`ffmpeg -i in.mp4 -vf "fps=1,scale=160:-1,tile=10x5" sheet.png`），不要只相信 3 个定点画面。
- **转录内容很差** — 非母语者/口音较重的语音可能会被转录成看似确信、实则毫无意义的乱码。在编写文件之前，先检查 `transcript.json` 是否能正确理解；如果内容无法解析为正常语言，则尝试一次 `WHISPER_MODEL=medium`，否则拒绝处理（逐字呈现虚构词语的字幕条，比不加字幕更糟糕）。
- 手持拍摄且画面繁忙、运动快速（遮罩会闪烁）

### 预检探测（零成本，可避免最严重的失败）

1. **跳切探测。** 在 20%、50%、80% 处采样帧。如果出现不同的主体/场景，**请在切点之前裁剪片段**。
2. **信箱 / 柱箱探测。** 第一帧是否有黑边？计算安全内容矩形，并将字幕放置限制在其内部。
3. **亮度探测。** 采样字幕区域的平均亮度——`under 60` → 浅色文字按原样显示，`60-180` → 添加字形遮罩，`180+` → 不透明文字 + 遮罩（绝不使用无遮罩的浅色文字）。**电影感模板为 cream+`screen` 且已锁定**——使用此探测来 _选择合适的身份_（明亮场景 → `ink`，或使用不透明轨道的 `anchor` 主题），而不是重新为其着色。
4. **按语调推荐身份（由你推荐；用户选择——参见 Step 0 + CATALOG.md）。** 讲解 / 访谈 / 必须读出的文字 → 轨道/面板表面身份；诗意 / 社交媒体 / “cinematic” → 按语域选择流栏身份；“炸 / 特效 / VFX” / 具名世界 → 主题身份。不确定时 → `anchor`（文字清晰可读，场景安全）——但要提供候选列表，让用户选择。

---

## 流程 — 5 个步骤

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

Step 1 的 `init` 会将已安装的技能与 GitHub 上的最新版本进行检查；如果有任何技能过期，则更新全局技能集。

步骤 3 因模式而异：

### 步骤 3 — Cinematic 模式（纯嵌入）

1. **首先读取 `safe-zones.json`。** 旁白平面应放置在 **`zones.hugLeft`/`hugRight`** 中——紧贴轮廓的干净条带（文字离人物太远会显得像漂浮，而不是嵌入；远处角落是备用方案，不是默认方案）。主角默认使用 `heroAnchor`/`heroBands.best`（位于主体正中，约被遮挡 30–55%）。`recommendation:"fg"` 会将旁白移到前景以提高可读性；**只要 `heroBands.feasible`，主角就应保持嵌入**——hero-fg 是最后手段。
2. **DNA 就是你在 Step 0 中选定的身份**（CATALOG.md）——不要在这里重新做选择。根据场景进行合理性检查（明亮主角区域的亮度 > 150 时需要 `ink`；完整的选择指导位于目录中，涵盖包括 neon / glitch / chrome / velocity 在内的全部十种身份）。说明你的选择 + 原因；由用户决定。DNA 会锁定字体/调色板/混合模式/动效以及主角的三幕结构；safe-zones v2（`palette`/`optics`/`lighting`）会自动针对**当前场景**对其进行参数化。
3. **编写 `<project>/cinematic.json`**——使用 `"dna": "<name>"` 加上思维块（thought-BLOCKS），而不是原始分组：每个块由词语组成的行（在从句边界处分组，每组 2–5 个词）+ 其堆叠所在的平面 + 每行的 `css`（仅包含大小/字重/样式，不包含位置）组成；最多只能有一行标记为 `"hero": true`（被提升的词；显示形式使用 `"text"`）。Schema：参见 `scripts/make-cinematic.cjs` 的文件头。
4. **编译**：`node scripts/make-cinematic.cjs <project>`——将块降级为 plan.json → index.html。以下内容会自动为你生成：按转录顺序排列的时间轴、块内累积、块之间翻页、**主角锁定组合**（主角块的前置上下文、HERO 与后置上下文会作为一个绑定组合堆叠，并以主体为中心——从上到下的阅读顺序通过构造确保与说话顺序一致；上下文漂浮在前景，而主角嵌入在背景中——形成深度夹层；质量规则会确保主角压过其上下文）、顶点/次要主角拆分、**通过构造确保的阅读顺序**、按 safe-zones 设置的前景备用方案。随后照常运行各项门禁。_对于无法由块表达的设计，仍可直接手工编写 plan.json——然后自行运行 `fill-timings.cjs` + `fit-fonts.cjs` + `make-composition.cjs`。_

### 第 3 步 — 主题模式（主题化构成）

**先阅读 [themes/README.md](themes/README.md)** — 范式/场景构件注册表、关联关系、硬性规则，以及确切的 `theme.json` 结构。

1. **按内容语域选择主题 DNA**（每个 `themes/<name>.json` 都包含 `voice` + `when`）。说明你的选择 + 原因；由用户决定。
2. **编写 `<project>/theme.json`** — `dna`、`lines`（逐字记录，按转录顺序；每条 1–5 个词 — 对于 `takeover`，每条都是一张卡片）、`minors`（强调词）、`hero:{match}`（高潮词/短语；对于嵌入式场景构件，将其从 `lines` 中排除；对于内联式场景构件和 panel+redact，则保留在其中）。
3. **渲染**：`bash scripts/render-theme.sh <project>` — 进行编译（编译时执行逐字完整性门禁）、渲染两个图层、合成，并应用底板反应 → `final_fx.mp4`。在编译和渲染之间使用 `preview-frames.cjs` 进行视觉质量检查。

---

## 视觉质量检查 — 渲染前先预览

`node scripts/preview-frames.cjs <project> [t…]` 会在每个时间点约 2 秒内合成**忠实的预览帧**（在定位时间截取的字幕图层 + 真实视频帧 + 遮罩遮挡 + 导轨叠加层 = 最终合成画面在该时刻的效果）。默认采样点 = 每个组/高潮窗口。完整渲染需要几分钟 — 绝不要用它来_发现_布局问题。

对照以下列表检查预览（`<project>/preview/sheet.png`） — 这些是几何门禁**无法**捕获的失败：

1. **褪白** — 浅色文字叠在明亮区域（窗户/标牌/天空）上：难以阅读 → 移动平面或更改 DNA/模式（明亮场景 → `ink`）。
2. **文字压文字** — 字幕叠在场景自身的文字/图形上，或两个字幕组相互碰撞。
3. **阅读顺序** — 画面上的垂直顺序必须与说话顺序一致；高潮词不得位于后续词语的下方。
4. **高潮词存在感** — 高潮词应当足够大，并且明显位于主体之后（被遮挡约 30–55%），而不是漂浮在边缘的标签。
5. **平衡** — 应形成一个连贯的列/带，而不是散落的碎片；留出舒展的边距；不得有任何内容被裁切。

然后执行 [references/reference-bar.md](references/reference-bar.md) 中的**5 项正向检查**（海报测试 · 胆怯测试 · 一眼层级 · 场景握手 · 空白审计） — 失败列表可以阻止一次渲染出错；正向列表则决定它是否经过设计。两者都通过后再交付。

**新鲜视角审查（建议用于任何面向用户的内容）：**你对自己的布局存在确认偏误。如果可以生成子代理，只向它提供预览图表 + 此检查清单，并要求它逐帧给出 PASS/FIX 判定（“根据这份 5 点清单审查这些字幕预览；逐帧回答 PASS 或具体修复项”）。在 plan.json / theme.json 中应用修复，重新编译、重新预览 — 每轮只需几秒。预览通过后再渲染一次。

---

## DNA 注册表 — 十种视觉语言（取代模板目录）

两种模式都取自 **[dna/](dna/README.md)** — 十种按艺术指导设计的视觉语言，会针对每个场景进行参数化（从素材中采样的强调色、沿测量光线方向的接触阴影、景深匹配模糊、与 RMS 耦合的高潮词振幅）：

| DNA             | Register       | Scene fit                                       | Voice                                                                                              |
| --------------- | -------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **cream**       | 高端暖调       | 深色/中等暖色场景                                | Inter + 暖奶油色 + 屏幕；发光浮现式主视觉（cinematic-cream 的后继者）                 |
| **ink**         | 高端           | **明亮场景（luma > 150）**                  | 近黑色正片叠底——文字仿佛印在墙上；明亮场景的答案                            |
| **editorial**   | 编辑风奢华     | 内省 / 时尚 / 诗意                | Bodoni Moda、小写斜体主视觉——杂志般的优雅                                             |
| **keynote**     | 科技高端       | 产品 / 发布                                | 不透明白色 Inter 800，绝对居中的静止感                                                      |
| **documentary** | 正式           | 访谈 / 严肃                             | 烧录式显现，无主视觉——庄重感本身就是风格                                                   |
| **loud**        | 高调           | 造势 / 运动 / 社交                           | Anton + 从场景采样的强调色，单体重击 + 波纹；主体在前景中“宣告” (`bodyLayer: fg`) |
| **neon**        | 高调霓虹       | 霓虹黑色电影 / 夜生活 / 科技黑色电影（深色场景） | 电光青色标牌，点火闪烁，主视觉像标牌一样通电                            |
| **glitch**      | 高调霓虹       | 数字 / 黑客 / AI                           | RGB 分离的回声在落点处骤然合拢；机器打击乐般的节奏                               |
| **chrome**      | 高调奢华       | Y2K / 科技时尚 / 音乐                      | 液态金属渐变主视觉 + 停留期间的一次光泽扫过                                       |
| **velocity**    | 高调运动       | 运动 / 汽车 / 健身                          | 每个词都沿其运动向量到达（拖影 + 倾斜），主视觉带着速度轨迹掠过            |

根据 `safe-zones.json`（`heroAnchor.bandLuma`、`palette.temperature`）× 内容风格进行选择——[dna/README.md](dna/README.md) 中有决策规则。编写时：`cinematic.json` 使用 `"dna": "<name>"`。

引擎会根据 DNA 生成**主视觉三幕结构**（无需编写）：同屏字幕变暗（铺垫）→ 振幅与语音响度成正比的逐字母入场（冲击）→ 呼吸 + 发光，直至退出（余辉）。

（旧版：`plan.template:"cinematic-cream"` 会自动映射为 `dna:"cream"`。已弃用的 54 个模板库已归档在本仓库之外，不随该 skill 分发；`_motion.md` 仍作为 skill 内的运动动词参考目录保留。）

---

## 美学决策——基调 × 镜头 × 平台（作为目录候选短名单的输入，而不是第二个路由器）

从 3 个维度对片段进行分类，并将结果输入 `CATALOG.md` 的候选筛选流程——本节本身绝不会选择模式/引擎：

**基调**（内容呈现出怎样的感觉？）

- documentary | conversational | energetic | poetic | keynote | investigative | music-video

**镜头**（画面取景如何？）

- close-up (头部 + 肩部) | mid-shot (躯干以上) | wide (全身以上) | cut-montage (混合镜头)

**平台**（将在哪里播放？）

- 9:16 portrait (TikTok/IG/Shorts) | 16:9 landscape (YouTube/web) | 1:1 square | broadcast export

参照 [references/direction-catalog.md § 分类矩阵](references/direction-catalog.md) 中的方向语言——然后返回 [CATALOG.md](CATALOG.md) 筛选身份（此矩阵为候选筛选提供依据；目录是唯一的路由入口）。

## 构图技法（嵌入轨道）——嵌入前阅读

完整的 **嵌入轨道**操作手册位于 **[references/composition-craft.md](references/composition-craft.md)**：包括转录文本角色标注、短语分组、平面与净区锚定、区域一致性、高潮弹出与可读性、边缘留白、遮挡 3 步判断，以及累积/持久显示。它规定了一个 _被突出显示的_ 短语如何 INTO 场景——在编写任何嵌入内容（Cinematic `plan.json` 或 Standard `index.html`）前阅读。默认的 **rail** 轨道有自己更简单的规范 → **[references/rail.md](references/rail.md)**。

---

## 共享知识

| 文档                                                                     | 内容                                                                                                                               |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| [references/rail.md](references/rail.md)                                 | **rail 轨道**——标准 lower-third 字幕规范（默认设置；承载大部分文本）。                                                             |
| [references/composition-craft.md](references/composition-craft.md)       | **嵌入轨道操作手册**——分组、平面、高潮弹出、遮挡判断、累积/持久显示。嵌入前阅读。                                                  |
| [dna/README.md](dna/README.md)                                           | **DNA 注册表**——十种经过场景参数化的视觉语言；以及如何选择。                                                                       |
| [references/reference-bar.md](references/reference-bar.md)               | **品味标杆**——每种风格档位的世界级参考 + 5 项正向检查。                                                                            |
| [references/aesthetic-principles.md](references/aesthetic-principles.md) | **18 条规则。**在品味上超越 Veed AI。首先阅读。                                                                                     |
| [references/motion-vocabulary.md](references/motion-vocabulary.md)       | 10 个命名动作原语 + 基调→时序对照                                                                                                  |
| [references/direction-catalog.md](references/direction-catalog.md)       | 10 种可直接交付的美学风格 + 基调×镜头×平台矩阵                                                                                      |
| [references/anti-patterns.md](references/anti-patterns.md)               | 已被排除的问题（CoreML、letter-spacing 重排等）                                                                                    |
| [references/scene-types.md](references/scene-types.md)                   | 何时可以使用墙面表面（4 个条件）                                                                                                    |
| [references/layout-heuristics.md](references/layout-heuristics.md)       | 平面定位、净区选择、顶部空间的 3 个条件、柱箱数学                                                                                  |
| [references/typography-presets.md](references/typography-presets.md)     | 字号 × 列宽矩阵（起始参考值）                                                                                                       |
| [references/caption-grouping.md](references/caption-grouping.md)         | 单词 → 分组规则（停顿、句子边界）                                                                                                   |
| [references/failure-modes.md](references/failure-modes.md)               | 开发中容易踩坑的长期问题                                                                                                            |
| [references/bespoke-vs-presets.md](references/bespoke-vs-presets.md)     | 预设有时为何会失效；克隆并调整模式                                                                                                  |

**首先阅读美学原则和方向目录。** 其他一切都是实现细节。

---

## 不可协商项

- **脸部绝不能被连续 100% 覆盖** —— 每个 0.3s 窗口内，face bbox 必须 ≥30% 未被遮挡。
- **WCAG 对比度** —— 最终渲染会 lint；如果失败，修正调色板。
- **确定性** —— 不使用 `Math.random()`，不使用 `Date.now()`，不使用 `repeat:-1`。
- **绝不对视频调色/重新着色。** 素材原样交付 —— 字幕是唯一新增内容。不要在 a-roll 上添加全帧 scanlines / duotone / darken / vignette。neon-noir/CRT 纹理属于字幕元素_内部_，而不是覆盖整个画面。
- **对于 talking-head / explainer，优先使用 rail。** 不要嵌入整段转录文本 —— 大多数文本放在 rail；只嵌入峰值。嵌入所有内容是默认错误。
- **Embed 稀缺且要有间隔。** 每个句子/节拍 ≤1 个 embed，绝不相邻或同时可见，至少间隔一个节拍，最多一个 `apex`。climax = 每个节拍的峰值，**不是**“整个片段唯一的 payoff”。
- **Matte = 人物（hyperframes `remove-background`，u2net_human_seg，Apache-2.0）。** 目标上是人体分割，但不是外科级：细的偏移家具（麦克风悬臂）通常会被排除 —— 字幕会渲染在其上方、人物后方 —— 而主体附近的大型显著物体（望远镜、桌面设备）仍可能泄漏进 matte 并遮挡字幕。主体手持的物体（产品、手机）可能间歇性掉出，让字幕从前方穿过。绝不要假设：在放置 hero 前，先在 2-3 个时间戳采样 `frames_fg/`，并优先选择避开任何泄漏家具的 hero 位置（`heroAnchor` 可能会被泄漏物偏移 —— 与 frames_bg 交叉核对）。
- **safe-zones 对道具不可见 —— 你使用的每个 band 都要目视检查。** Zones/heroBands 只评估_主体_遮挡 + luma：处于“clean” zone 内的麦克风、望远镜或屏幕对它们是不可见的（而泄漏进 matte 的道具会让 `heroAnchor.centerXPct` 偏离人物）。在创作前，为你打算使用的每个 band 提取一帧；如果那里有道具，测量其 bbox 并移动/缩小平面。两个真实案例之所以干净交付，只是因为 agent 确实这样做了。（自动道具显著性是已知缺口；zones 的 `peakLuma` 只能捕捉_移动的_明亮物体。）
- **字幕保持在画面内。** Cinematic mode 会硬性 gate frame-overflow；Standard mode 将 `check-overflow.cjs` 作为 WARNING 运行（有意 bleed 是唯一例外 —— 阅读警告）。
- **每条字幕在屏幕上 ≥ 0.5s** —— 更短 = 不可读。
- **词级时间必须与 transcript.json 在 80ms 内匹配** —— 字幕偏离节拍 500ms 会摧毁场景幻觉。Cinematic 在渲染前（通过 render-and-composite.sh）运行 `check-timing.cjs --strict`；THEME mode 则在编译时强制相同的时间（make-theme 的 sequential transcript matcher + verbatim completeness gate —— drift 是编译错误）。绝不要把多个转录词打包进一个 entry（例如 `"FUTURE OF"`，或一个带有 line-break 的 `IT` + `ALL` 堆叠共用一个 start/end）—— 第二个词会继承第一个词的时间戳并过早触发。将它们拆成独立的 word entry，各自拥有自己的时间，即使你希望它们位于同一视觉行（使用 CSS `white-space` / natural wrap，而不是 `<br>`）。支持 caption text ≠ transcript 的创意替换（例如用 `"15%"` 替换 `"fifteen percent"`）—— 在 `check-timing.cjs` 内的 `CREATIVE_SUBS` 中注册它们。
- **Group windows 必须包住其 words** —— 对每个 group，`group.in ≤ min(word.start)` 且 `group.out ≥ max(word.end)`。如果 `group.in` 晚于某个词的 start，该词会被静默延迟到容器 mount（我们曾因此交付过 800ms 延迟 bug）。验证器会强制这一点。
- **任意两个 caption groups 不得同时在时间和屏幕区域上重叠** —— 时间上重叠的字幕会造成文本叠文本的堆积。选项：(a) **空间分离** —— 将每个 group 放在不重叠的垂直 band 中，使它们可以共存（memory-wall cascade 风格）；(b) **交接** —— 设置前一个 group 的 `out` ≤ 下一个 group 的 `in`，让屏幕上一次只有一个；(c) **有意的分层排版** —— 在其中一个 group 上添加 `"allow_overlap": true` 以关闭验证器提示。验证器会根据 CSS 估算每个 group 的垂直 bbox 并标记碰撞。默认选择 (a) —— 这让 cinematic-cream 感觉像一首逐渐积累的诗，而不是一条替换自身的字幕轨。
- **Screen-blend 在明亮背景（>180 luminance）上会失效。** **Cinematic** templates 是 cream + `screen`，且该 DNA **锁定**（plan 不能重新着色它们）→ 在明亮背景上会被洗掉，所以应选择 `ink`（专为明亮表面打造的 letterpress）或 `anchor` theme（不透明 rail surface），而不是覆盖某种 look。
- **不要在词入场时动画化 `letter-spacing` 或 `filter:blur`** —— inline-block reflow 会导致行跳动。
- **CoreML 禁用于 matting** —— onnxruntime CoreML EP 的混合精度分区破坏了脸部 alpha（在之前的 RVM 引擎中观察到；不要重新尝试）。Matting 仅 CPU（约 2 fps @1080p ≈ 每 10s 片段 2-3 分钟；长片段要为此预留预算）。

---

## 依赖

- **hyperframes**，已构建（`packages/cli/dist/cli.js`）。脚本会自动解析检出目录：`HYPERFRAMES_ROOT` 环境变量 → 如果此 skill 位于 hyperframes _内部_，则使用仓库根目录 → `~/Downloads/hyperframes`。使用 `bun install && bun run build` 构建。
- **Node 优先；通过 `uvx` 使用两个 Python 触点（无需手动安装）：** 转录通过 `uvx` 运行 WhisperX（词级时间戳；按 SKILL §transcription 回退），Theme 的 `drawon` 场景会在编译时 shell 调用 `python3 scripts/gen-stroke-path.py`。其他所有内容都运行在 hyperframes 已自带的工具链上：通过 hyperframes CLI 的 **`remove-background`**（u2net_human_seg；权重会自动下载一次，约 168 MB，到 `~/.cache/hyperframes/`）进行抠像，通过 **`sharp`** 进行图像/alpha 计算，通过 **`puppeteer`** 进行布局/遮挡/溢出处理，外加 **`ffmpeg`**。脚本会从 hyperframes 检出目录自动解析这些工具——无需额外安装。
- **转录 = 通过 `uvx` 运行 WhisperX**（词级时间戳 + 对齐；无需手动安装——`transcribe.cjs` 会驱动 `uvx whisperx`）。如果存在已有的词级 `transcript.json`，则回退使用它。
- **源视频** —— `matte.cjs` / `transcribe.cjs` 会自动解析 `source.mp4`（或 glob 该片段 / 读取 `hyperframes.json`），因此 `hyperframes init --video X.mp4` 无需手动重命名。
- **fps** —— `matte.cjs` 会按源视频的原生帧率提取，并记录 `matte.fps`；`render-and-composite.sh` 会使用该值，因此抠像会保持帧对齐。
- 抠像权重未打包：`matte.cjs` 会 shell 调用 hyperframes CLI 的 `remove-background`，它会将 u2net_human_seg（约 168 MB，Apache-2.0）下载一次到 `~/.cache/hyperframes/background-removal/models/`。在全新机器上首次准备需要联网完成这一次下载。

如果缺少硬性依赖，请停止并询问用户——不要静默跳过步骤。