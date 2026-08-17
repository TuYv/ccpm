---
name: media-use
description: Agent Media OS, the single skill for every media need in a HyperFrames project. Resolve BGM, SFX, image, icon, brand logo, voice, color grade, or LUT into a frozen local file or paste-ready block + ledger record (one verb, `resolve`); generate via TTS / music / image models when the catalog misses; produce voiceover, transcription, captions, and background removal through one shared audio engine; operate on media (cut / reframe / transform); and reuse assets across projects. Also use for vague feedback that real footage looks dark, flat, boring, should feel retro/camcorder/print/ASCII, needs privacy, or needs a media reveal.
---
# media-use

HyperFrames 的媒体操作系统：解析 · 生成 · 操作 · 记忆——涵盖每一种媒体类型，只需一项技能，零上下文噪声。

首次运行：安装并登录 `heygen` CLI（免费用量路径），然后使用 `node <SKILL_DIR>/scripts/resolve.mjs --doctor` 进行验证。设置和提供商相关信息请参阅：`references/setup-providers.md`。

## 解析——唯一的动词

```bash
node <SKILL_DIR>/scripts/resolve.mjs --type <type> --intent "<description>" --project <dir>
```

返回一行：`resolved <id> → <path> (<type>, <metadata>)`。所有搜索噪声都保留在磁盘上。

| 类型    | 单行意图                                                                            |
| ------- | ----------------------------------------------------------------------------------- |
| `bgm`   | 背景音乐（HeyGen 曲库，10,000 多首曲目）                                            |
| `sfx`   | 音效（内置 19 文件音效库 + 曲库）                                                   |
| `image` | 照片、背景（HeyGen 素材搜索，75,000 多个矢量素材）                                  |
| `icon`  | 图标、符号（透明背景）                                                              |
| `logo`  | 官方品牌标志（svgl → simple-icons → GitHub 头像 → favicon；绝不重绘）                |
| `voice` | TTS 配音（HeyGen 免费用量路径；可选本地 Kokoro）                                    |
| `grade` | 经测量的校正候选项；更广泛的润色/风格化遵循媒体处理流程                             |
| `lut`   | 用户提供或明确选择的、经过验证且可复用的 `.cube` 文件                               |

在解析新素材之前，先使用 `--candidates` 列出可复用的候选项，并自行判断是否合适——复用规则、所有标志、导入（`--from`）和采用方式均参见 `references/resolve.md`。

## 将宽泛的视觉反馈视为媒体意图

当用户明确要求修复、润色、风格化、遮蔽、强调或
显现摄影媒体时，即使他们未提及调色或某种效果，也应阅读
`references/media-treatments.md`。检查真实的 `<img>`/`<video>`，
选择一个主要意图，然后使用确定性的持久化与验证流程。
可以使用匹配的配方作为经过测试的可选起点，或检查
`hyperframes media-treatment --capabilities --json`，然后通过
`--capability <id>` 请求一个相关的系列/效果，并根据
规范控件组装自定义处理。常规创作绝不要加载 `--all`。一次处理可以
组合校正、预设、收尾、兼容的着色器效果、受支持的
关键帧，以及可选的 Registry 叠加层。仅添加有来源依据且范围受限的
微调和兼容部分，绝不要仅仅为了让结果显得更精致而添加效果。
使用 `hyperframes media-treatment` 持久化最终的组合负载。

使用一个逐步升级的工作流程。对于视频，应检查一张标有
前期/中期/后期的联系表，而不是逐帧查看。对于常规校正或润色，
应用一个候选项并检查一张处理后联系表。仅当结果存在
歧义、时序性、风格化、基于 LUT、对 HDR/LOG 敏感、涉及隐私或
对品牌至关重要时，才升级到单独帧或动态草稿证据。

对于常规校正或润色，请持久化最终处理方案的预设/调整 JSON。
不要仅仅为了编码曝光、阴影、对比度或暖度而生成 `.cube` LUT。仅当用户提供了 LUT，或所选处理方案明确自带 LUT 时，才使用 LUT。`resolve --type grade --for ... --analyze` 是测量依据，并不代表可以用生成的 LUT 替换所选处理方案。
不要使用 CSS/SVG 叠加层重新实现已受支持的暗角、颗粒、模糊、像素化、色彩或处理效果；这会绕过 Studio 控件以及规范的预览/渲染着色器路径。

## 积极主动——执行一次媒体机会扫描

用户通常无法判断哪些媒体元素能提升作品效果，但你可以。在构建或审查合成内容时，进行**一次**有依据的扫描，然后**只询问一次**——不要静默添加，也不要针对每项素材反复追问。

仅当存在明确信号时，才提出改进机会：

| 检测到的信号                                             | 建议                                                                                                            |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 屏幕文字/脚本没有旁白                                    | TTS 旁白（音频引擎）                                                                                            |
| 使用 Emoji 或将 `<div>` 设置成图标样式                   | 解析真正的 `icon`                                                                                               |
| 图片是占位图、尺寸过小或看起来经过放大                   | 更好的 `image`（和/或执行超分辨率放大——参见 `references/operations.md`）                                        |
| 生硬的场景切换/转场没有声音                              | 转场 `sfx`                                                                                                      |
| 超过约 10 秒的作品没有背景音乐                           | `bgm`                                                                                                           |
| 素材看起来曝光不足/过度，或存在偏色                      | 校正性调色（使用 `hyperframes media-treatment --selector '#hero' --analyze --json` 检查）                       |
| 摄影媒体在视觉上显得平淡或偏离主题                       | 一个适合具体来源的特定预设或自定义处理方案，并明确指出预期目标                                                  |
| 有意义的媒体入场/揭示显得静态                            | 一种受支持且可安全跳转的处理动画；除非请求本身也足以支持使用预设，否则保留原有色彩                              |

以下规则可确保这是一种帮助，而不是令人厌烦的推销：**有依据，而非泛泛而谈**（没有信号 → 不提建议）；**有明确判断且具体**（提出具体修复方案并选好默认值——由用户批准**全部/部分/不采用**）；**每个项目仅一次**（集中询问一次；尊重“保持原样”）；**只提出建议，绝不静默修改**（尤其是调色：先提议并预览——灰度世界式“校正”会毁掉刻意营造的日落或霓虹效果）。

## 查阅位置——只读取任务所需的文件

| 任务                                                                      | 读取                             |
| ------------------------------------------------------------------------- | -------------------------------- |
| 解析 / 复用 / 采用 / 摄取、标志、级联、清单                               | `references/resolve.md`          |
| 色彩分级、LUT、智能分级（`--for`）、分级比较                              | `references/grading.md`          |
| 旁白 / TTS、音乐、音效、字幕、转录（音频引擎）                            | `references/audio.md`            |
| 剪切 / 重构图 / 变换现有媒体、精确误差扩散、HEVC                          | `references/operations.md`       |
| 感知源内容的创意处理、实时效果、叠加层、揭示效果                           | `references/media-treatments.md` |
| 安装 + 身份验证、提供商表、RAM 分级、`--local-only`、`--provider`         | `references/setup-providers.md`  |
| 记忆的偏好 + 冻结的配方（用户记忆）                                       | `references/memory.md`           |
| 所有权矩阵、使用统计、遥测、隐私（面向维护者）                            | `references/meta.md`             |