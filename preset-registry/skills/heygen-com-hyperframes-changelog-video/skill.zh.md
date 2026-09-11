---
name: changelog-video
description: Turn a weekly changelog .md into a finished branded changelog video (square 1080, ~45-60s, Annie VO, animated brand background, mock-UI visualizations, lowkey captions). Use when the user provides a changelog/digest markdown and wants the weekly video, or says "changelog video". Self-contained — fonts, background, lexicon, and scripts ship in this skill.
metadata:
  internal: true
---
# Changelog → 品牌视频

输入：一个 changelog `.md`（包含主题 + 条目，类似每周的 HyperFrames digest）。
输出：位于
`projects/active/weekly-changelog-<range>/` 中、通过 lint 检查且 seam gate 通过的 HyperFrames 项目。仅在收到要求时渲染。

**首先加载，不可省略：**`motion-doctrine`（以及出现光标时加载 `cut-the-curve`、
`oversized-cursor`，还有 `seam-craft`）和 `captions-overlay`。
此 skill 提供 changelog 专用流程；doctrine 提供运动规则。

## 首要原则：可视化，而不是罗列

每个主题都必须通过一个**实际 UI 的动画模拟，或忠实的类比界面**来呈现体验变化，而不是文字项目符号。编写脚本前，必须先将每个主题/条目经过 `references/visualization-registry.md`；该注册表决定使用 ui-recreate / ui-analog / terminal / checklist。文字 checklist 是最后手段，仅限于确实不可视化的项目（可靠性修复列表）。

## 流程

### 0 · 使用此 skill 的资源初始化项目 — 不可省略

**在编写任何 composition HTML 之前完成此步骤。跳过这一步总会生成一个看起来像你之前构建过的类似项目的视频，而不是此 skill 的品牌风格——这是此 skill 最常见的偏离品牌方式。此 skill 的资源、字体和脚手架就是 skill 本身；SKILL.md 提示词只是路由器。**

```bash
mkdir -p project/assets/fonts
cp <SKILL_DIR>/assets/fonts/*.woff2 project/assets/fonts/
cp <SKILL_DIR>/assets/bgm.mp3 project/bgm.mp3
ffmpeg -y -stream_loop 15 -i <SKILL_DIR>/assets/bg-pattern.mp4 -t <TOTAL> \
  -vf "scale=1080:1080,fps=30,eq=saturation=0.72,drawbox=c=black@0.5:t=fill" \
  -an -c:v libx264 -crf 20 -pix_fmt yuv420p project/assets/bg-pattern-<TOTAL>s.mp4
cp <SKILL_DIR>/examples/master-skeleton.html project/index.html
```

然后**从头到尾阅读 `references/build-spec.md`**（不要略读）——它定义了品牌 tokens（TT Norms Pro + ABC Solar Display + TT Norms Mono、奶油色 `#f5f6f4`、限量使用的绿色 `#5ef17c`、带绿色边框的玻璃卡片、kicker/sec-chip 胶囊形状，以及 `top: 990` 处 32px 的字幕轨道），每个场景都必须继承脚手架中的这些规范。

只有完成上述步骤后，才能开始下面的步骤 1-6。步骤 1-4（解析、路由、脚本、VO）用于规划要放入脚手架的内容；步骤 5 则在已经复制好的 `project/index.html` 中填充占位符（`<RANGE>`、`<TOTAL>`、`<CUT_N>`、`<DUR_N>` 和场景主体）——不要重写脚手架的 chrome、字体、配色或布局外壳。

如果发现自己想要从之前的视频中使用 `cp` 复制 `index.html`，或想要自行编写 `@font-face` 声明，或想要设计 WebGL shader 背景而不是使用上面编码生成的 bg-pattern MP4：**立即停止。删除当前的 `index.html`，然后从复制 master-skeleton 脚手架的步骤重新开始。**在正确的脚手架上重建场景内容，比把品牌风格改造到错误的脚手架上便宜得多。

### 1 · 解析 + 编辑性删减

- 提取：周范围、标题统计数据（发布数量、提交数量）、主题和条目。
- **总时长预算：45-60 秒。**标题 ≤2 秒，结尾 ≤3.5 秒，4 个主题各约 9-12 秒。
- 每个主题保留一个主视觉演示 + 最多 3 个口播条目。其余内容只存在于结尾的“完整 digest”指引中。删减就是这一步的职责：
  即使 changelog 有 30 个条目，最终也应保持 ≤14 个口播节拍。
- 按故事顺序排列主题：主打功能 → 产品界面 → 性能 → 可靠性（digest 通常已经按照这一顺序组织）。

### 2 · 可视化路由

对于每个主题，从 `references/visualization-registry.md` 中选择对应的界面，
并写下一行：`theme → surface → the 2-4 sequenced actions the mock
performs, each tied to a script phrase`。如果注册表中没有合适的界面，也没有
忠实的类比方案，那么它就是一个核对清单场景——不要为无法诚实呈现的内容
虚构 UI。

### 3 · 双层脚本（口播与显示）

按照 `references/script-voice.md` 的要求，以**令牌行**的形式编写脚本：
使用对话式语体，每个技术术语都必须携带来自 `references/lexicon.json` 的
`spoken` 音标形式，而 `display` 保持标准拼写。字幕显示 `display`；VO
朗读 `spoken`。任何不在词典中的术语：停止并询问用户其发音，然后将其添加
到词典中。将其保存为项目中的 `script-tokens.json`。

### 4 · VO — Annie（已固定）

```bash
# spoken-layer text only; words JSON = ground-truth timestamps of the SPOKEN text
# Repo-native path: the changelog-video skill runs from the hyperframes repo root,
# so it uses the tracked hyperframes-media TTS helper directly (no `npx hyperframes
# skills` install step). If you've copied the skill into another repo, swap in
# your own path to the media-use / hyperframes-media heygen-tts.mjs.
node skills/hyperframes-media/scripts/heygen-tts.mjs ./vo-spoken.txt \
  -o voiceover.mp3 --words vo-words.json \
  --voice 330290724a1b470fb63153f34d4c0183   # Annie — lifelike (do not substitute)
```

需要已完成认证的 `heygen` CLI ≥0.3.0（`heygen auth login --oauth`）。
然后将口播时间戳重新对齐到显示令牌：

```bash
node <SKILL_DIR>/scripts/align-captions.mjs \
  --tokens script-tokens.json --words vo-words.json --out captions.json
```

`captions.json` 是字幕轨道的输入（显示拼写、口播时间）。对齐器会打印
`MISMATCH` 警告——在构建之前解决所有警告（通常是词典中某个拼写被 TTS
渲染成了多个单词）。**音频就是时钟**：所有节拍时间都来自 `vo-words.json`；
重新生成 VO 会重新打开每个衔接点。

**单词时间戳是硬性门槛。** 在进入第 5 步之前，验证 `vo-words.json` 非空，
并且包含带有每个单词 `start`/`end` 的 `words: [...]` 数组。如果它为空（0
字节）或缺少该数组——这是 TTS 提供商返回音频但没有时间戳载荷时的已知故障
模式——**不要**在没有时间戳的情况下继续。回退方案：使用本地 whisper
对生成的音频与显示脚本进行强制对齐：

```bash
uvx --from openai-whisper whisper voiceover.mp3 \
  --model base.en --language en --word_timestamps True \
  --output_format json --output_dir .
# then run align-captions.mjs with --words voiceover.json (same shape)
```

Whisper 可能会误听 TTS 的发音（“gee-sap” → “gsap”，“heyjen” →
“hey Jen”等）——字幕仍使用 `script-tokens.json` 中的显示拼写；
Whisper 仅提供时间戳。`align-captions.mjs` 会处理连接过程。
这正是带字幕的构建与悄无声息地缺少字幕的构建之间的区别。

### 5 · 构建

严格遵循 `references/build-spec.md`：品牌令牌 + 字体（捆绑在
`<SKILL_DIR>/assets/` 中）、动画背景编码、场景脚手架、
界面框架、字幕轨道、每个场景仅一个配额内的绿色时刻。然后按以下教义顺序执行：
`ledger.json`（所有普通接缝均执行 cut-the-curve LEFT）→ seam-stamp
→ 在 VO 单词上添加内部节拍 → seam-gate verify。

**字幕不是可选项。** master-skeleton 自带一个读取 `LINES` 数组的 caption-rail IIFE — 留空该数组是已发布的 bug，而不是样式选择。继续执行步骤 6 之前，请从 `captions.json` 填充它：

```javascript
// paste in place of "const LINES = /* … */ []" in the caption-rail IIFE:
const LINES = /* contents of captions.json */ [
  { id: 0, end: 2.74, w: [["This", 0.0], ["week,", 0.30], …] },
  …
];
```

如果跳过了 `align-captions.mjs` 或 `LINES` 为 `[]`，步骤 6 中的帧检查将会失败 — 不要通过移除脚手架中的 `#cap-line` 来掩盖问题。

### 6 · 门禁（全部通过后才能交付）

1. `bun run --cwd packages/cli hyperframes check --caption-zone "x0=0;y0=.90;x1=1;y1=1;severity=error;seek=.02,.06,.10,.14,.18,.22,.26,.30,.34,.38,.42,.46,.50,.54,.58,.62,.66,.70,.74,.78,.82,.86,.90,.94,.98"`（或使用仓库本地
   `skills/hyperframes-cli/` skill 中已安装的
   `hyperframes` CLI）— 0 个错误（对比度：暗色文字 ≥ .66 alpha；场景内容保持在字幕轨道上方）。不要使用
   `npx hyperframes@latest`；受版本控制的仓库本地 CLI 是该 skill 生成的构图契约的唯一依据。
2. `seam-gate.mjs verify` — 0 fail。
3. 重启预览服务器（它会缓存 bundle），在原始 comp 页面上通过 `__player.seek` 抽查 3-4 个节拍。
4. 除非用户要求，否则不要渲染。用户要求渲染后，通过 MP4 验证帧（`ffmpeg -ss <t> … -frames:v 1`）：字幕存在、背景视频不是黑屏、没有过小/冻结的帧。
5. **字幕存在性门禁 — 硬失败。** 在 VO 的语音时间窗口内均匀抽取 3-4 帧（例如，对于 48 秒的 VO，使用 `t=3`、`t=15`、`t=30`、`t=42`），确认 `top: 990` 处的字幕轨道在每一帧都渲染出可见文字。如果语音区间内的任何帧缺少字幕，则构建产物将以无字幕状态交付 — 将其视为红色门禁，并重新检查步骤 5 中的 `LINES` 填充。这正是 Jul 13-20 v4 构建中出现的问题。

## 项目布局

```
projects/active/weekly-changelog-<range>/
├── index.html            # 单文档 master（场景作为幻灯片，带 stamped seams）
├── ledger.json           # 向量账本（seam-stamp 输入）
├── script-tokens.json    # 双层脚本（VO + 字幕的真实来源）
├── vo-spoken.txt         # 生成文件：spoken layer，单行
├── voiceover.mp3 + vo-words.json + captions.json
├── bgm.mp3               # 从 <SKILL_DIR>/assets/bgm.mp3 复制（house track），除非用户提供了其他文件
└── assets/fonts/ + assets/bg-pattern-<dur>s.mp4
```

## 反模式

| 不要做                                             | 应该做                                                                                                                                                                                         |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 用项目符号幻灯片展示 UI 更改                         | 模拟该界面实际执行更改的过程                                                                                                                                                                   |
| 为无法表示的项目伪造 UI                            | 使用诚实的检查清单场景                                                                                                                                                                         |
| 在 TTS 文本中直接使用普通的 “JSON”/“CLI”           | 使用词汇表中的口语形式；显示内容保持标准形式                                                                                                                                                   |
| 在字幕中使用音标拼写                               | 字幕始终渲染显示层                                                                                                                                                                             |
| 猜测未知术语的发音                                 | 先询问，然后扩充词汇表                                                                                                                                                                         |
| 说出每一项变更日志内容                             | 每个主题 ≤3 项；其余内容由摘要链接承载                                                                                                                                                         |
| 到处使用绿色强调                                   | 每个场景仅一个绿色时刻（#5ef17c）                                                                                                                                                              |
| 从之前视频的 index.html 开始                        | 步骤 0 — 始终将此 skill 中的 `examples/master-skeleton.html` 复制到 `project/index.html`                                                                                                      |
| 手工编写 `@font-face` / WebGL shader / custom BGM | 步骤 0 — 原样复制此 skill 的 `assets/`；该 skill 的 assets 就是品牌                                                                                                                            |
| 未执行 CloudFront invalidation 就交付               | 在任何 S3 替换后，针对确切路径对分发 `E2BSLVSZ7FG3U0` 运行 `aws cloudfront create-invalidation` — 否则 CDN 会缓存旧文件                                                                          |
| 脚手架中的 `LINES` 数组为空                         | 步骤 4 必须生成已填充的 `captions.json`；步骤 5 必须将其粘贴到 IIFE 中；步骤 6 的门禁 5 必须确认渲染帧中存在字幕。空的 `LINES` = 无字幕交付 = 重新执行整个流程 |
| 没有 `vo-words.json` → 跳过字幕并照常交付           | 对生成的音频使用 whisper 强制对齐作为回退方案；字幕不是可选项                                                                                                                                  |