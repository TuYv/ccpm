---
name: media-use
description: Agent Media OS, the single skill for every media need in a HyperFrames project. Resolve BGM, SFX, image, icon, brand logo, voice, color grade, or LUT into a frozen local file or paste-ready block + ledger record (one verb, `resolve`); generate via TTS / music / image models when the catalog misses; produce voiceover, transcription, captions, and background removal through one shared audio engine; operate on media (cut / reframe / transform); and reuse assets across projects. Keeps search noise on disk, hands the agent one path or block. Use for any audio, image, icon, logo, voiceover, caption, color-grading, or media-asset need.
---
# media-use

HyperFrames 的媒体操作系统：解析 · 生成 · 操作 · 记忆，覆盖每一种媒体类型，只需一个技能，零上下文噪声。

## 设置 — 首先安装 heygen（免费使用路径）

```bash
curl -fsSL https://static.heygen.ai/cli/install.sh | bash
heygen update             # free usage needs the OAuth-capable CLI (v0.3.0+)
heygen auth login --oauth # OAuth = free subscription credits; --api-key bills API credits
```

这将解锁 bgm/sfx/image/icon 目录搜索、TTS（语音）和数字人视频的免费路径。使用 `--oauth` 登录——免费额度依托 OAuth 会话提供（使用 API 密钥则会消耗 API 积分）。**media-use 统一要求 heygen >= v0.3.0**（OAuth 免费使用路径需要该版本），因此即使仅使用 API 密钥，`--doctor` 也会提示旧版 CLI 进行更新。在解析任何内容之前，请使用以下命令验证设置：

```bash
node <SKILL_DIR>/scripts/resolve.mjs --doctor
```

## 它负责什么（HyperFrames 留下的空白）

HyperFrames 负责媒体的_播放_；media-use 负责其余一切。每一行都由 `scripts/lib/coverage.test.mjs` 强制验证，确保这些能力声明不会随时间失效。

| HyperFrames 的空白                            | media-use 通过以下方式负责                                                                                                                                                                                                                               |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 仅有音频，没有图像/图标                  | `resolve --type image\|icon`（heygen 资源搜索）                                                                                                                                                                                                  |
| 没有第三方品牌徽标                 | `resolve --type logo`（svgl → simple-icons → GitHub 组织头像 → 域名 favicon）                                                                                                                                                                    |
| 没有语音/音频生成                | `resolve --type voice`（HeyGen TTS 免费使用路径；可选本地 Kokoro）+ 音频引擎（`audio/scripts/audio.mjs`）                                                                                                                           |
| 音频引擎分散/重复          | `audio/` 下的统一引擎（hyperframes-media 已停用）                                                                                                                                                                                  |
| 没有智能体媒体操作（剪切/重构画面/转换） | `references/operations.md` + 使用 `resolve --from` 注册输出                                                                                                                                                                                   |
| 没有基于转录文本的剪辑               | `scripts/transcript-cut.mjs` 将带单词时间戳的编辑编译为剪切列表                                                                                                                                                                           |
| 没有自动闪避/发布响度            | `scripts/audio-duck.mjs` + `references/operations.md` 中的 loudnorm/sidechain 配方                                                                                                                                                                    |
| 没有跨项目记忆                    | 全局内容寻址缓存 + 自动提升（`~/.media`）                                                                                                                                                                                          |
| 没有色彩分级创作                   | `resolve --type grade` 输出可直接粘贴的 `data-color-grading` 块；`resolve --type lut` 固化经过验证的 `.cube` 文件                                                                                                                         |
| 没有图像生成                        | 通过 `scripts/lib/mflux-provider.mjs` 使用按 RAM 分级的本地 mflux（FLUX），以及 codex `image_gen` 升级选项（`scripts/lib/codex-provider.mjs`）                                                                                                                     |
| 没有视频生成                        | HeyGen 数字人视频 + 图生视频（将任意静态图像制作成说话片段）、照片数字人、配音/翻译——`heygen` CLI 免费使用路径（`references/operations.md`）；可选的、受规格约束的本地 LTX（`scripts/lib/local-models.mjs` 中的 `videogen`） |
| 本地模型默认方案较弱                  | 通过 `heygen` CLI 使用 HeyGen 免费路径；本地开源工具仅作为可选择启用的替代方案（`scripts/lib/local-run.mjs`）                                                                                                                      |

## 何时使用

每当合成内容需要媒体素材时，都应调用 `resolve`：包括背景音乐、音效、图像、图标、品牌徽标、语音、色彩分级或 LUT。对于配音 / TTS、音乐、音效和字幕时间轴，请使用**音频引擎**（见下文）；背景移除交由 `hyperframes` CLI 处理；转录默认通过 `scripts/transcribe.mjs` 使用 Parakeet（优于 whisper.cpp：WER 为 6.05%，后者为 7.44%，且速度快 5-10 倍），并自动回退到 whisper.cpp（参见 `references/operations.md`）。有关剪辑 / 重构画面 / 转换现有媒体素材的信息，请参见 `references/operations.md`。media-use 会先在 HeyGen 目录中搜索媒体文件，通过徽标级联解析官方徽标，对 `grade`/`lut` 使用本地确定性色彩分级，需要文件时会将最佳匹配固定到本地，将其登记到清单中，并只向智能体提供一行结果；所有搜索噪声都会保留在磁盘上。

## 主动发现——执行一次媒体机会检查

用户通常无法判断哪些媒体素材能提升作品质量，而你可以。在构建或审查合成内容时，执行**一次**有依据的检查，然后**只询问一次**——不要擅自添加，也不要针对每项素材反复询问。

仅当存在具体信号时，才提出改进机会：

| 检测到的信号                                         | 建议                                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| 有屏幕文字 / 脚本，但没有配音                          | TTS 配音（音频引擎）                                                                        |
| 使用了 Emoji 或样式设为图标的 `<div>`                 | 使用 `resolve` 获取真实 `icon`                                                              |
| 图像是占位图、尺寸过小或看起来经过放大                | 更好的 `image`（和/或进行超分辨率放大——参见 `references/operations.md`）                    |
| 生硬的场景切换 / 转场没有声音                         | 转场 `sfx`                                                                                  |
| 超过约 10 秒的作品没有背景音乐                        | `bgm`                                                                                       |
| 画面看起来曝光不足/过度或存在偏色                     | 校正性 `grade`（使用 `grade --for` 分析，使用 `hyperframes grade-compare` 预览）             |

以下规则可确保这是一种帮助，而不是骚扰式提示：

- **有依据，而非泛泛而谈。** 没有信号 → 不提出建议。绝不要以“想要更好的图像吗？”开场。
- **有明确主张且具体。** 提出具体的改进方案（“根据脚本添加配音、将 3 个 Emoji 替换为真实图标、替换 400×400 的主视觉图、为 4 次切换添加嗖声”），并选好默认项——用户只需批准**全部 / 部分 / 都不**。
- **每个项目只提一次。** 只进行一次汇总询问，列出少数几个价值最高的项目。尊重“保持原样”的决定，不要再次提出。
- **只提出建议，绝不擅自修改。** 色彩分级尤其如此：提出建议并提供预览，绝不要自动应用——灰度世界式的“校正”会毁掉刻意营造的日落或霓虹效果。

## 解析

```bash
node <SKILL_DIR>/scripts/resolve.mjs --type <type> --intent "<description>" --project <dir>
```

返回一行：`resolved <id> → <path> (<type>, <metadata>)`

### 类型

| 类型    | 查找内容                    | 提供方 / 级联顺序                                           |
| ------- | -------------------------------- | ------------------------------------------------------------ |
| `bgm`   | 背景音乐                 | HeyGen 音频目录（10k+ 首曲目）                           |
| `sfx`   | 音效                    | 内置的 19 文件库 + HeyGen 目录                     |
| `image` | 照片、背景              | HeyGen 素材搜索（75k+ 个向量）                           |
| `icon`  | 图标、符号                   | HeyGen 素材搜索（type=icon）                              |
| `logo`  | 官方品牌标识             | svgl → simple-icons → GitHub 组织头像 → 域名 favicon     |
| `voice` | TTS 旁白                    | HeyGen TTS 免费用量路径；可选本地 Kokoro            |
| `grade` | HyperFrames 调色块 | 核心预设 → 风格索引参数/CDN LUT → 确定性 cube |
| `lut`   | 可复用的 `.cube` LUT 文件       | 风格索引参数/CDN LUT → 确定性 cube               |

### 示例

```bash
# Background music
node <SKILL_DIR>/scripts/resolve.mjs --type bgm --intent "upbeat tech launch" --project .
# → resolved bgm_001 → .media/audio/bgm/bgm_001.mp3 (bgm, 25s)

# Sound effect
node <SKILL_DIR>/scripts/resolve.mjs --type sfx --intent "whoosh" --project .
# → resolved sfx_001 → .media/audio/sfx/sfx_001.mp3 (sfx, 0.57s)

# Image
node <SKILL_DIR>/scripts/resolve.mjs --type image --intent "gradient tech background" --project .
# → resolved image_001 → .media/images/image_001.jpg (image)

# Icon
node <SKILL_DIR>/scripts/resolve.mjs --type icon --intent "rocket" --project .
# → resolved icon_001 → .media/images/icon_001.png (icon, transparent)

# Brand logo (official mark — never redrawn by hand)
node <SKILL_DIR>/scripts/resolve.mjs --type logo --entity linkedin --intent "LinkedIn logo" --project .
# → resolved logo_001 → .media/images/logo_001.svg (logo, official mark)

# Color grade block
node <SKILL_DIR>/scripts/resolve.mjs --type grade --intent "warm daylight" --project . --json
# → {"ok":true,"preset":"warm-daylight","grading":{"preset":"warm-daylight","intensity":1},...}

# LUT file
node <SKILL_DIR>/scripts/resolve.mjs --type lut --intent "teal orange blockbuster" --project .
# → resolved lut_001 → .media/luts/lut_001.cube (lut)
```

### 标志

| 标志            | 说明                                                                          |
| --------------- | ------------------------------------------------------------------------------------ |
| `--type, -t`    | 媒体类型：bgm、sfx、image、icon、logo、voice、grade、lut                           |
| `--intent, -i`  | 所需内容（自然语言）                                                     |
| `--entity, -e`  | 用于缓存匹配的实体名称（可选）                                            |
| `--project, -p` | 项目目录（默认值：.）                                                       |
| `--candidates`  | 列出 `--type` 的可复用素材（项目 + 全局缓存）；不下载、不修改 |
| `--reuse <sha>` | 导入指定的全局缓存素材（按内容 sha/前缀，从 `--candidates` 中选择）    |
| `--from`        | 固化本地文件或直接公开 URL（摄取）                                    |
| `--for`         | 分析本地图像/视频并添加测量得出的调整建议（仅限 `grade`）       |
| `--local-only`  | 离线：跳过所有网络提供方（仅使用缓存 + 本地资源）                            |
| `--provider`    | 强制使用一个生成器（例如 `codex`、`mflux`、`kokoro`、`heygen`）                      |
| `--adopt`       | 将现有 assets/ 批量导入清单                                           |
| `--doctor`      | 检查本地 CLI 依赖项；不更改清单                                    |
| `--stats`       | 输出 `.media/` 和 `~/.media` 中的本地使用情况统计；不更改清单           |
| `--days N`      | 将 `--stats` 限制为最近 N 天带时间戳的记录/未命中项                   |
| `--json`        | 输出 JSON，而不是单行结果                                               |

## 解析前先复用

在解析 bgm/sfx/image/icon/logo/grade/lut 之前，**先检查已有内容，并在合适时复用。** media-use 不会替你进行语义匹配——你才是判断者。它会列出候选项；由你决定。

```bash
node <SKILL_DIR>/scripts/resolve.mjs --type bgm --intent "upbeat tech launch" --candidates --project .
#   [project] upbeat tech launch (25s, heygen.audio.sounds)
#           .media/audio/bgm/bgm_001.wav
#   [global]  energetic tech intro (22s, heygen.audio.sounds)
#           --reuse 06e052c075fd2b80
```

阅读列表并自行判断语义是否匹配——根据描述判断 "upbeat tech launch" ≈ "energetic tech intro"，只有你能作出这一决定。然后：

- **某个项目候选项合适** → 只需在合成内容中引用其路径。无需运行其他命令。
- **某个全局候选项合适** → `resolve --type bgm --reuse <sha>` 会将其复制到当前项目中（实现自包含渲染）并记录下来。
- **没有合适的候选项** → 重新解析（`--type ... --intent ...`）。

**信任护栏——不确定时，重新解析。** 重复下载的代价很低；交付错误素材的代价却不低。请根据描述 + 提示词 + 类型 + 时长/尺寸判断是否匹配。对于**品牌/实体**素材，仅当实体完全一致时才复用_全局_候选项——全局缓存汇集了你处理过的所有项目，因此 `--candidates` 列表可能会显示其他客户的品牌标识及其提示词文本。绝不要因为宽松匹配而跨项目复用品牌素材。

确定性底线仍会自动运行：完全相同（忽略大小写/空白差异）的重复请求会自动复用，无需执行 `--candidates` 步骤。`--candidates` 仅用于该底线之上的语义层——模糊匹配**绝不会**自动应用；是否复用始终由你明确决定。当解析未命中该底线并即将获取素材时，如果存在相似的缓存素材，media-use 会在 stderr 中输出一行提示，将你引导回此处。

## 色彩分级

当你需要实际的 HyperFrames `data-color-grading` 值，以便粘贴到 `<img>` 或 `<video>` 上时，请使用 `grade`。核心预设和基于参数的库内风格可在本地解析；未来基于 CDN 的库内风格需要网络连接，除非已被冻结：

**绝不要将 `.cube` 文件 `cat`/读取到上下文中。** 一个 3D LUT 包含约 size^3 行原始数字（默认尺寸下 33^3 ≈ 36k 行）。它会导致上下文膨胀，而且不包含任何人类或智能体可理解的有效信息。要了解或选择 LUT，请使用 `hyperframes grade-compare` 查看其渲染效果，或使用 `cube-validate.mjs` 进行单行 `{ok,size}` 检查。请阅读 `.media/index.md` 或 `luts/index.json` 中的描述。绝不要读取 LUT 正文。

```bash
node <SKILL_DIR>/scripts/resolve.mjs --type grade --intent "warm daylight" --project . --json
```

预设优先的输出使用核心运行时词汇表，并且不会冻结文件：

```json
{
  "preset": "warm-daylight",
  "intensity": 1
}
```

完成 JSON 字符串转义后，将其粘贴为属性值：

```html
<video
  class="clip"
  src="./media/scene.mp4"
  data-color-grading='{"preset":"warm-daylight","intensity":1}'
></video>
```

超出预设词汇表的风格会将经过验证的 `.cube` 冻结到 `.media/luts/` 下，并返回一个引用它的块：

```bash
node <SKILL_DIR>/scripts/resolve.mjs --type grade --intent "teal orange blockbuster" --project . --json
```

```json
{
  "intensity": 1,
  "lut": { "src": ".media/luts/grade_001.cube", "intensity": 0.85 }
}
```

如果只需要可复用的 `.cube` 文件，请使用 `lut`：

```bash
node <SKILL_DIR>/scripts/resolve.mjs --type lut --intent "teal orange blockbuster" --project .
```

对于可描述的技术风格，请使用 `--params` 编写显式的参数化 LUT：

```bash
node <SKILL_DIR>/scripts/resolve.mjs --type lut --params '{"contrast":0.2,"temperature":-0.3}' --project .
node <SKILL_DIR>/scripts/resolve.mjs --type grade --params '{"exposure":0.2}' --project . --json
```

对于由你自己的脚本生成的 LUT，请使用 `--from` 将其导入；media-use 会在注册前对其进行验证，并拒绝无效或尺寸过大的色彩立方体：

```bash
node <SKILL_DIR>/scripts/resolve.mjs --type lut --from custom.cube --project .
```

参数化数学方法（`buildCube`）无法复现真实胶片或乳剂风格。对于此类风格，请使用由 CDN 支持的扫描 `.cube` 条目，或导入真实的扫描 `.cube`。

若要进行视觉选择，请使用 `resolve --type grade --candidates` 列出可复用的风格，将有潜力的条目写入 `grades.json`，运行 `hyperframes grade-compare --for <frame> --grades grades.json`，然后使用 `resolve -t grade` 提交胜出者，作为最终的 `data-color-grading` 块。

智能调色使用 `grade --for <media>`。它会运行本地 `ffmpeg`/`ffprobe` signalstats，将一个有界的 `adjust` 建议合并到返回的块中，并将测量证据打印到 stderr。在使用 `--json` 时，stdout 仍是有效的 JSON；该建议是供智能体进一步调整的起点，而不是自动中和有意为之的色彩。

```bash
node <SKILL_DIR>/scripts/resolve.mjs --type grade --intent "warm cinematic" --for ./frame.png --project . --json
```

库中的风格位于 `luts/index.json`。每个条目保留 `id`、`description`、`tags` 和 `intensity`，然后提供紧凑的 `params`，用于按需生成 `buildCube(params)`，或者为将来的扫描 `.cube` 文件提供直接的 CDN `url`。不要提交生成的 `.cube` 内容；resolve 会在将生成或下载的色彩立方体冻结到 `.media/luts/` 下时对其进行验证。

```bash
node skills/media-use/scripts/resolve.mjs --type lut --intent "teal orange blockbuster" --project . --json
node skills/media-use/scripts/lib/cube-validate.mjs .media/luts/lut_001.cube
```

## 提供商

media-use 不持有任何密钥；每个外部工具自行负责其身份验证。生成流程
以 HeyGen CLI 的免费使用路径为核心。在解析 bgm/sfx/image/icon/voice/avatar-video 之前，
请安装 `heygen` 并完成身份验证。如果存在本地工具，它们可作为需主动启用的
替代方案：图像使用 mflux，语音使用 Kokoro，转录使用 Parakeet，本地视频生成使用 LTX。
`resolve` 会根据 AVAILABLE RAM 对这些本地阶梯进行规格检查
（`describeModelLadder`）；智能体可以查看该阶梯并进行覆盖。

| 类型      | 提供商 / 路径                                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| bgm/sfx   | heygen 目录免费使用路径                                                                              |
| image     | heygen 搜索免费使用路径；可选的本地 mflux；codex `image_gen` 增值选项                               |
| voice     | heygen tts 免费使用路径；可选的本地 **Kokoro**（免费、在设备上运行）                                     |
| icon      | heygen 资源搜索免费使用路径                                                                         |
| logo      | 依次使用 svgl、simple-icons、GitHub 组织头像、域名 favicon（全部免费）                             |
| grade/lut | 本地核心预设映射、参数/CDN 风格索引、确定性的 `buildCube` 后备方案                            |
| video     | heygen 数字人 / 图生视频 / 照片数字人 / 配音免费使用路径；可选的本地 LTX（`videogen` 阶梯方案） |

本地 Kokoro（语音）、mflux（图像）和 LTX（视频）均在设备上运行（免费、
私密，缓存后可离线使用）。`codex` CLI 仍是 ChatGPT 订阅中的图像
增值选项。成本规则（X4）：在由代理发起付费调用前，代理会请求确认；
由用户请求的调用则直接运行。

要强制使用特定生成器（例如用户说“使用 codex 制作此图像”），
请传入 `--provider codex`：它会将解析固定到该提供商，并跳过
默认的免费使用路径。有关 RAM 阶梯方案和
提供商配置方法，请参阅 `references/operations.md`。

`--local-only` 会跳过所有网络提供商，包括免费的 HeyGen 提供商，
只保留项目缓存、全局缓存以及任何已安装的本地提供商。对于
仅由 HeyGen 支持的类型，这意味着不会进行新的解析。

## 工作原理

`resolve` 会先执行自动保底流程，然后在未命中时转为获取：

1. 检查项目的 `.media/manifest.jsonl` 是否存在与提示词匹配的内容（忽略大小写和空白差异）——自动复用
2. 扫描现有的 `assets/` 目录，查找尚未注册且与需求共享某个单词的文件
3. 检查全局缓存 `~/.media/`，查找基于相同规范化提示词匹配的可复用资源——自动复用
4. 通过提供商搜索（HeyGen 音频目录、HeyGen 资源搜索），或在本地解析颜色
5. 将文件固化到 `.media/<type>/`，在清单中注册，重新生成 `index.md`，并自动提升至 `~/.media/`

第 1 步和第 3 步是**确定性保底机制**：它们只会自动复用规范化后完全匹配的内容，绝不会复用模糊匹配的内容。语义复用（“足够接近”）由代理通过[解析前先复用](#reuse-before-you-resolve)显式决定——它绝不会自动发生。代理仅会收到**一行**结果；候选项、评分和来源信息均保留在磁盘上。

## 接入现有项目

大多数 HyperFrames 项目的 `assets/` 中已经包含资源。media-use 会接入这些资源：

```bash
node <SKILL_DIR>/scripts/resolve.mjs --adopt --project .
# → adopted 9 assets from assets/
#   bgm_001 → assets/bgm/mango-fizz.mp3 (bgm, 146.6s)
#   image_001 → assets/images/avatar.jpg (image, 400×400)
```

`ffprobe` 会提取真实的时长和尺寸。在解析期间，`assets/` 中符合意图但尚未注册的文件会被即时纳入使用。

## 查看资产清单

解析或纳入后，读取 `.media/index.md` 以查看完整的资产清单：

```
# .media · 4 assets

id         type   dur   dims       path                          description
bgm_001    bgm    25s   -          .media/audio/bgm/bgm_001.mp3  upbeat tech launch
sfx_001    sfx    0.6s  -          .media/audio/sfx/sfx_001.mp3  whoosh
image_001  image  -     1920×1080  .media/images/image_001.jpg   gradient tech background
icon_001   icon   -     200×200    .media/images/icon_001.png    rocket
```

## 跨项目复用

资产会在解析时自动缓存。每个已解析/摄取的资产都会自动提升至 `~/.media/` 中的全局缓存，因此之后在任何项目中解析相同（或近乎相同）的提示词时，都会命中缓存，无需重新下载，也无需调用提供商。

对于另一个项目中在_语义上_相似（但不完全相同）的需求，精确匹配阈值不会触发——请使用[解析前复用](#reuse-before-you-resolve)：`--candidates` 会列出全局资产，而 `--reuse <sha>` 会导入你选择的资产。这就是当措辞不同时，在一个项目中解析出的音轨如何被复用到下一个项目中。

## 偏好设置——记住的默认值

用户记忆的轻量级层级：已确认的简报答案（目标平台、宽高比、语言、流程、故事板、语音、样式预设）会按照与资产相同的双层结构持久化——项目级 `.media/preferences.json`（提交到版本库，供团队继承）和个人级 `~/.media/preferences.json`。某个值只有在**两个不同的项目**中均得到确认，才会进入个人层级，因此一次性的选择绝不会污染全局默认值。

```bash
node <SKILL_DIR>/scripts/prefs.mjs get --hyperframes . --json      # merged view (project overrides user)
node <SKILL_DIR>/scripts/prefs.mjs record --hyperframes . --key destination --value x-feed
node <SKILL_DIR>/scripts/prefs.mjs record --hyperframes . --key style_preset --value pin-and-paper --workflow faceless-explainer
```

只有用户实际确认过的内容才会被记录——绝不会记录推断出的值或默认值。工作流如何使用这些值（记住的值会成为附带依据的推荐默认值，并且绝不会跳过问题），由简报契约中的以下规则规定：`hyperframes-core/references/brief-contract.md` § 2，记住的默认值。

## 配方——冻结的视频包

用户记忆的重量级层级：将一次已获批准的运行冻结为一个具有名称和版本的包——`frame.md`、故事板骨架（保留结构，将内容留空为逐帧填写项）、简报骨架（当项目中存在 `BRIEF.md` 时从中获取——保留可复用的 frontmatter，将运行形态和正文留空），以及已确认的简报值。同样采用两个层级：项目级 `.media/recipes/<name>/`（提交到版本库）和 `~/.media/recipes/<name>/`（冻结内容本身已是经过确认的包，因此会立即提升——不受双项目规则限制）。使用同一名称重新冻结会递增 `version`，并将旧文件夹归档为 `<name>@v<N>`。

```bash
node <SKILL_DIR>/scripts/recipe.mjs freeze --hyperframes . --name weekly-promo   # workflow read from BRIEF.md (--workflow only for briefless projects)
node <SKILL_DIR>/scripts/recipe.mjs list --hyperframes . --workflow product-launch-video
node <SKILL_DIR>/scripts/recipe.mjs use --hyperframes . --name weekly-promo   # also: resolve.mjs --type recipe --entity weekly-promo
```

最终批准后会提供一次冻结选项（`hyperframes-core/references/review-loop.md` § 4），而意图层（`/hyperframes` § 4）会在提出第一个问题之前检查是否存在匹配项。采用配方会填充简报、设计规范和故事板框架——而且与偏好设置不同，它可以跳过已由配方回答的问题：该捆绑包已作为一个整体获得批准，而采用操作本身就是问题。

## 使用情况统计

使用 `resolve --stats` 可根据当前项目的 `.media/` 清单、全局 `~/.media/` 缓存以及本地解析未命中记录，生成一份可在本地使用和共享的报告。供人阅读的输出较为紧凑；添加 `--json` 可获得单个机器可读对象，添加 `--days N` 可限定带时间戳记录的时间范围。

```bash
node <SKILL_DIR>/scripts/resolve.mjs --stats --project . --days 7
# media-use stats
# total resolves: 12
# misses: 2
# hit rate: 86%
```

## 文件

- `.media/manifest.jsonl`：机器可读的 SSOT，每行一条 JSON 记录
- `.media/index.md`：智能体可读的表格（id、type、dur、dims、path、description）
- `.media/preferences.json`：项目记忆的默认设置（已提交）
- `~/.media/`：跨项目复用的全局缓存（按内容寻址，SHA-256）
- `~/.media/preferences.json`：个人记忆的默认设置（在两个项目后提升）
- `.media/recipes/<name>/`：冻结的视频捆绑包——recipe.json + frame.md + 故事板框架（已提交）
- `~/.media/recipes/<name>/`：个人配方层级（冻结时提升）
- `~/.media/misses.jsonl`：仅限本地的解析未命中记录，其中包括供 `--stats` 使用的意图文本

## 音频引擎：旁白、音乐、音效、字幕、转录

如需一次性完成完整的音频处理（TTS 旁白 + 背景音乐 + 音效），请使用位于 `audio/scripts/audio.mjs` 的共享引擎。它接收中立格式的 `audio_request.json`，并写入 `audio_meta.json`，同时将资源写入 `.media/audio/{voice,bgm,sfx}`：

```bash
node <SKILL_DIR>/audio/scripts/audio.mjs --request ./audio_request.json --out ./audio_meta.json
```

- **请求** `{ provider?, lang?, speed?, lines: [{ id, text, sfx?: [names] }], bgm: { mode?, query?, prompt? } }`：`id` 将每一行关联回你的模型；`bgm.mode` = `retrieve | generate | none`（省略则自动选择）。`--only tts,bgm,sfx` 会运行其中一部分，并合并到现有的 `--out` 中。
- **输出** `audio_meta.json`（以 id 为键）：`voices[].{path,duration_s,words[]}`（用于字幕的单词时间戳）、`sfx[]`、`bgm`、`total_duration_s`。
- **HeyGen 免费使用路径**：HeyGen CLI 身份验证可解锁 TTS 以及音乐/音效检索。在已安装的情况下，本地或特定于提供商的生成器是明确的替代方案；在假定检索或 TTS 能够正常工作之前，请运行 `node <SKILL_DIR>/scripts/resolve.mjs --doctor`。
- 如果 BGM 采用了生成路径（`bgm_pending: true`），请在最终渲染前运行 `audio/scripts/wait-bgm.mjs`。

单次辅助工具：`audio/scripts/heygen-tts.mjs`（单个语音文件）。转录 / 背景移除 / 字幕使用 `hyperframes` CLI（`transcribe`、`remove-background`），请参阅 `audio/references/` 中按主题划分的指南（`tts.md`、`bgm.md`、`sfx.md`、`transcribe.md`、`remove-background.md`、`captions/`）。

## 对媒体执行操作（剪切、重新构图、变换）

media-use 负责解析 + 记忆；有关如何对素材**执行操作**，请参阅
`references/operations.md`：本地工具操作方案（ffmpeg 修剪/重新构图/蒙太奇、
auto-editor、scenedetect），以及本地与 HeyGen 的变换方式对照表（背景
移除、放大、口型同步、翻译）。运行工具，然后使用
`resolve --from <output> --type <type>` 注册输出，使其加入台账 + 全局
缓存。

## 使用的 CLI 工具（运行什么，以及如何启用每个工具）

`resolve` 会自动级联；每个提供方都会调用一个 CLI。HeyGen 是
bgm/sfx/image/icon 目录搜索、TTS（语音）和虚拟人
视频的免费用量路径，因此这些能力需要安装 `heygen` 并完成身份验证。本地
工具是在相应工具存在时可选择启用的替代方案；安装其中一个，即可针对该类型解锁其免费、
私密、设备端的处理路径，用来替代 HeyGen 或优先于 HeyGen 使用。只有
`ffmpeg`/`ffprobe` 是该工具能够正常运行所严格必需的。

| 工具               | 用途                                                                          | 安装                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `ffmpeg`/`ffprobe` | 采纳探测、smart-grade signalstats、剪切、烘焙闪避处理、loudnorm                | 系统软件包（`brew install ffmpeg`）                                                                          |
| `heygen`           | 目录（bgm/sfx/image/icon）+ TTS（语音）+ 虚拟人视频——免费用量路径 | `curl -fsSL https://static.heygen.ai/cli/install.sh \| bash`，然后运行 `heygen auth login --oauth`（需要 >= v0.3.0） |
| `mflux-generate`   | 本地图像生成（FLUX），最适合内存受限场景                                            | `uv venv ~/.venvs/mflux && VIRTUAL_ENV=~/.venvs/mflux uv pip install mflux==0.9.6`                              |
| `codex`            | 图像生成增值选项（ChatGPT 订阅）                                                  | Codex CLI，通过 ChatGPT 登录（使用其自身的身份验证）                                                            |
| `parakeet-mlx`     | 本地转录（默认 ASR，效果最佳）                                         | `uv venv ~/.venvs/parakeet && VIRTUAL_ENV=~/.venvs/parakeet uv pip install parakeet-mlx`                        |
| `ltx-2-mlx`        | 本地视频生成                                                                 | `git clone https://github.com/dgrauet/ltx-2-mlx && cd ltx-2-mlx && uv sync --all-extras`                        |
| `npx hyperframes`  | Kokoro TTS（语音）、whisper.cpp（转录后备方案）、背景移除        | 随 hyperframes CLI 捆绑提供                                                                                |

按 RAM 分级的本地模型候选列表，以及各层级确切的安装/调用方式，位于
`scripts/lib/local-models.mjs` 中（代理可以读取 `describeModelLadder(cap, specs)`
以了解哪种模型适合本机）。如果 PATH 中没有相应工具，其提供商会向 stderr
输出一行诊断信息；如果存在其他提供商，resolve 将继续回退处理（例如，没有 `mflux` -> Codex 图像增购推荐；没有 `parakeet-mlx` -> whisper.cpp）。

`heygen asset search` 是一个未在 `heygen --help` 中显示的预发布命令，但它
可以运行；提供商会使用允许列表中的 `X-HeyGen-Client-Source` 标头标记请求
（v0.3.0+）。

## 遥测

`resolve` 和编辑工具（transcribe / transcript-cut / audio-duck）会向 PostHog
发送匿名使用事件（`scripts/lib/telemetry.mjs`），以便我们了解实际使用了
哪些功能。它仅记录媒体 TYPE、解析 SOURCE 和胜出的 PROVIDER：绝不会记录意图文本、文件名
或路径，并设置 `$ip:null`，因此不会存储 IP。遥测采用尽力而为且非阻塞的方式（
resolve 绝不会等待遥测，也不会因遥测而失败）。

可通过 `DO_NOT_TRACK=1` 或 `HYPERFRAMES_NO_TELEMETRY=1` 选择退出（在 CI 和
dev 环境中也会关闭）。使用与 `hyperframes` CLI 相同的公共 PostHog 项目密钥和退出选项。

## 隐私

media-use 与 `hyperframes` CLI/studio 使用同一个共享安装 ID
（`~/.hyperframes/config.json`）。当你登录 HeyGen 后，使用情况会关联到
你的账户电子邮件；如果电子邮件不可用，则关联到用户名，这与
CLI 的行为一致。事件始终保持粗粒度：仅包含媒体类型、来源、提供商和
少量计数；意图文本和路径始终保留在本地。可通过
`HYPERFRAMES_NO_TELEMETRY=1` 或 `DO_NOT_TRACK=1` 禁用遥测。