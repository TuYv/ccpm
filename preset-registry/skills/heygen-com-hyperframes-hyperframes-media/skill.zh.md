---
name: hyperframes-media
description: Audio and media assets for HyperFrames compositions, produced by one shared audio engine (`scripts/audio.mjs`) — multi-provider TTS (HeyGen / ElevenLabs / Kokoro local), background music + sound effects (HeyGen audio-library retrieval by default, with local Lyria / MusicGen BGM generation and a bundled SFX library as the no-credential fallback), Whisper transcription, background removal, and caption authoring. Use for voiceover / TTS, BGM, SFX / sound effects, transcription, captions / subtitles / lyrics / karaoke / per-word styling, voice + provider selection, and music-mood prompting.
---
# HyperFrames 媒体

创建合成所需的音频和媒体资产——旁白（TTS）、背景音乐 + 音效、转录、字幕、背景移除——然后在 HTML 中使用这些数据并为其添加动画。有关如何将资产放入合成，请参阅 `hyperframes-core`。

## 音频引擎——统一支持 TTS · BGM · SFX

工作流不得自行拼凑音频实现或引入一份供应商代码副本。只有一个引擎——**`scripts/audio.mjs`**——它接收中立格式的 `audio_request.json`，并写入 `audio_meta.json`（以及位于 `assets/voice|bgm|sfx` 下的资产）：

```bash
# <MEDIA_DIR> = this skill's directory
node <MEDIA_DIR>/scripts/audio.mjs --request ./audio_request.json --hyperframes . --out ./audio_meta.json
```

三项功能均根据**同一个开关**进行降级——即是否存在 HeyGen 凭据（从 `$HEYGEN_API_KEY` / `$HYPERFRAMES_API_KEY` / `~/.heygen` 解析，**而不是**通过 CLI）：

| 功能 | 存在 HeyGen 凭据                          | 不存在                                               |
| ---------- | -------------------------------------------------- | ---------------------------------------------------- |
| TTS        | HeyGen Starfish REST（原生单词时间戳）      | → ElevenLabs → Kokoro（串联 `transcribe` 以获取单词时间戳） |
| BGM        | HeyGen 音乐**检索**                         | Lyria → MusicGen 本地**生成**（分离执行）     |
| SFX        | HeyGen 音效**检索**（min_score 0.4） | 内置的 21 文件音效库（`assets/sfx/`）              |

- **请求**（`audio_request.json`）：`{ provider?, lang?, speed?, lines: [{ id, text, sfx?: [names] }], bgm: { mode?, query?, prompt? } }`。`id` 用于将每一行关联回调用方的模型（帧编号、场景 ID 等）。`bgm.mode` = `retrieve | generate | none`；省略时自动选择（有凭据时检索，否则生成）。显式指定 `retrieve` 时会严格执行——它会跳过，而不是启动分离式生成（适用于没有 `wait-bgm` 步骤的调用方）。
- **输出**（`audio_meta.json`，以 ID 为键）：`{ tts_provider, voice_id, bgm, bgm_pending, …, voices: [{ id, path, duration_s, words }], sfx: [{ id, name, file, source, offset_s, duration_s, volume }], total_duration_s }`。
- `--only tts,bgm,sfx` 运行部分功能，并将结果**合并**到现有的 `--out` 中（例如，先处理 TTS+BGM，在提示点确定后再处理 SFX）。
- BGM 生成会以**分离**方式启动（`bgm_pending: true`）——请在组装前运行 `scripts/wait-bgm.mjs`。
- `scripts/heygen-tts.mjs` 是基于同一套代码的单次调用 CLI（一个文本 → wav + 单词时间戳），适用于仅需 HeyGen TTS 而不想使用请求文件的场景。

完整的参数列表和 `audio_meta.json` 模式位于 `scripts/audio.mjs` 的文件头中。以下参考资料涵盖每项功能背后的供应商详情和边界情况。

## 预检——在生成任何音频前显示登录状态

**在生成语音或 BGM 前务必运行此预检——无论是在完整工作流中，还是一次性的“为我生成 BGM/旁白”请求中。** 缺少 HeyGen 凭据**不应**成为静默回退到本地引擎的理由：应先建议用户登录，并由用户决定。运行共享预检，并**逐字转达其输出**——不要自行编写“缺少密钥”的提示，也不要提出将密钥写入各仓库自己的 `.env`：

```bash
npx hyperframes auth status
```

- **已登录** → 它会输出账户信息；继续。
- **未登录**（此处预期会出现 `exit 1`——“未登录”是正常状态，并非失败）→ 它会首先输出注册引导。建议登录：`npx hyperframes auth login` 使用浏览器 OAuth——它会**登录并创建账户**（始终可通过此仓库的 CLI 使用）。要使用现有的 HeyGen API 密钥（来自 app.heygen.com/settings/api），请运行 `npx hyperframes auth login --api-key`——它会将密钥保存到共享的 `~/.heygen`（不使用每个仓库单独的 `.env`）。输出还会列出语音/BGM 将回退使用的本地引擎，并在缺少依赖项时给出 `pip` 提示。**请原样转达此输出——不要用自己的措辞改述。**然后**停止并等待**用户选择——登录，或回复“go”/“local”以继续离线操作——**之后才能生成任何内容。**这是一个真正需要做出决定的节点，不是顺带说明：不要将它并入另一个问题，也不要自行越过此节点继续操作。（例外：在自主/非交互模式下，注明状态并继续离线操作。）
- `npx hyperframes auth status --json` 返回 `{ configured, recommended_action, offline_engines }`，用于确定性分支处理。
- **如果 CLI 无法运行**（不在 PATH 中且 `npx` 无法获取它）→ 仍然需要**建议登录**（`npx hyperframes auth login`）并**停止以等待用户选择**——不要将“没有凭据”视为可以直接进行本地生成的默认许可。

凭据解析、完整的密钥优先级以及本地依赖项列表见 `references/requirements.md`。

## 提供商链（引擎背后的详细机制）

**TTS**——使用第一个可用的提供商（通过引擎或 `npx hyperframes tts "..."`）：

| 顺序 | 提供商                        | 检测条件                                     | 单词时间戳                                                       |
| ----- | ----------------------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| 1     | HeyGen (Starfish)             | `$HEYGEN_API_KEY` / `hyperframes auth login` | **支持，原生提供**——传入 `--words narration.words.json` 以捕获 |
| 2     | ElevenLabs                    | 已设置 `$ELEVENLABS_API_KEY`                 | 不支持——之后串联调用 `transcribe`                               |
| 3     | Kokoro-82M（本地，54 种语音） | 始终可用（无需密钥）                         | 不支持——之后串联调用 `transcribe`                               |

> 已发布的 `hyperframes tts` CLI 通常是仅支持本地运行的版本（其 `--help` 中显示“Kokoro-82M”，且没有 `--provider`/`--words`），即使设置了 `$HEYGEN_API_KEY`，它也会静默回退到 Kokoro。因此，引擎的 HeyGen 路径使用自包含的 `scripts/heygen-tts.mjs`（REST），而**不是** CLI；CLI 仅用于 Kokoro 路径。参见 `references/tts.md`。

**BGM 与 SFX**——默认从 HeyGen 音频库（`/v3/audio/sounds`）中**检索**，使用与 HeyGen TTS 相同的凭据；无凭据时，使用上述切换流程中的回退方案：

| 资产 | HeyGen `type`                   | 存放位置                                                   | 回退方案（无凭据）                                         |
| ----- | ------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| BGM   | `music`                         | `assets/bgm/track.mp3`（检索）· `track.wav`（生成）        | Lyria / MusicGen 生成                                      |
| SFX   | `sound_effects`（min_score 0.4） | `assets/sfx/<slug>.mp3`                                    | 内置的 21 文件库（`assets/sfx/*` + `manifest.json`）       |

请参阅 `references/bgm.md` 和 `references/sfx.md`。

## 路由

| 任务                                                                | 阅读                                         |
| ------------------------------------------------------------------- | -------------------------------------------- |
| 音频引擎——请求/元数据模式、`--only`、切换机制                       | `scripts/audio.mjs`（文件头注释）            |
| `npx hyperframes tts` / `heygen-tts.mjs`——提供商、语音、单词        | `references/tts.md`                          |
| BGM——HeyGen 检索 + 本地 Lyria / MusicGen 生成                       | `references/bgm.md`                          |
| SFX——HeyGen 检索（min_score 0.4）+ 内置本地库                       | `references/sfx.md`                          |
| `npx hyperframes transcribe`——Whisper、模型规则、输出结构           | `references/transcribe.md`                   |
| `npx hyperframes remove-background`——透明抠图                       | `references/remove-background.md`            |
| TTS → 转录 → 字幕（无录制的旁白）                                   | `references/tts-to-captions.md`              |
| 字幕制作——样式检测、布局、单词分组、退出效果                        | `references/captions/authoring.md`           |
| 转录文本处理——输入格式、质量门槛、清理、API                         | `references/captions/transcript-handling.md` |
| 字幕动效——卡拉 OK、标记效果、音频响应                               | `references/captions/motion.md`              |
| 模型缓存、系统依赖项、故障排除                                      | `references/requirements.md`                 |

## 不可妥协的规则

- **只用一个引擎，不要引入其副本。** 通过 `scripts/audio.mjs` 生成音频（或使用 `heygen-tts.mjs` 进行一次性 HeyGen TTS）。不要在工作流内部重新实现 TTS/BGM/SFX——编写一个 `audio_request.json` 适配器并调用该引擎。
- **“HeyGen 可用”是指存在可解析的凭据，而不是存在 CLI。** 整个切换机制以 `heygenCredential()` 为依据；已发布的 `hyperframes tts` 可能仅支持 Kokoro，而且根本不存在 `hyperframes bgm` / `hyperframes sfx` 命令。
- **语音 ID 是提供商特定的。** `am_michael` 仅适用于 Kokoro；HeyGen UUID 无法用于 Kokoro。如果传递 `--voice`，也要固定 `--provider`，以避免用户环境变化时提供商在不知不觉中发生漂移。
- **始终向 `transcribe` 传递 `--model`。** CLI 的默认值 `small.en` 会在不作提示的情况下翻译非英语音频。请参阅 `references/transcribe.md` →“语言规则”。
- **HeyGen 返回单词时间戳；ElevenLabs / Kokoro 不返回。** 对于后两者，引擎会自动串联调用 `transcribe`；独立使用时，请向 HeyGen 传递 `--words`，或对音频文件运行 `transcribe`。
- **字幕使用扁平单词数组格式**，其中包含 `{ id, text, start, end }`。请参阅 `references/transcribe.md` →“输出结构”。
- **`remove-background --background-output` 是挖空，而不是修复填充。** 若要获得“移除人物后的场景”，需要使用其他工具。请参阅 `references/remove-background.md` →“何时不适合使用此工具”。
- **BGM/SFX 默认使用 HeyGen 检索；无凭据时的回退方案是生成 BGM，或对 SFX 使用内置库。** `/audio/sounds` 根据文本查询进行排序——应具体命名音效（`glass shatter`，而不是 `dramatic sound`）；没有匹配项时会**跳过**，绝不会阻塞渲染。SFX 的音量约为 0.35，位于语音 + BGM 之下。请参阅 `references/sfx.md` / `references/bgm.md`。
- **将工作流字幕 HTML 视为生成的输出。** 对于基于预设的视频，可复用的皮肤源文件位于 `.hyperframes/caption-skin.html`，工作流脚本会写入 `compositions/captions.html`；不要通过编辑生成的 `compositions/captions.html` 来修复皮肤。请通过工作流的 `captions.mjs` 重新构建，或在相应工作流提供明确的覆盖机制时使用该机制。