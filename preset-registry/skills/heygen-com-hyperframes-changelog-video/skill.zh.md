---
name: changelog-video
description: Turn a weekly changelog .md into a finished branded changelog video (square 1080, ~45-60s, Annie VO, animated brand background, mock-UI visualizations, lowkey captions). Use when the user provides a changelog/digest markdown and wants the weekly video, or says "changelog video". Self-contained — fonts, background, lexicon, and scripts ship in this skill.
---
# 更新日志 → 品牌化视频

输入：一份更新日志 .md（包含主题和条目，类似每周 HyperFrames 摘要）。
输出：一个通过 lint 检查且 seam gate 全绿的 HyperFrames 项目，位于
`projects/active/weekly-changelog-<range>/`。仅在被要求时渲染。

**必须首先加载，不得妥协：** `motion-doctrine`（如果出现光标，还需加载 `cut-the-curve`、
`oversized-cursor`）和 `seam-craft`，以及 `captions-overlay`。
本技能提供更新日志专用流程；doctrine 则提供动效法则。

## 首要准则：可视化，不要罗列

每个主题都必须通过**实际 UI 的动画模拟或忠实的类似界面**来演示体验上的变化——绝不能使用文本项目符号。
在编写脚本之前，先将每个主题/条目交由 `references/visualization-registry.md` 处理；
该注册表会决定使用 ui-recreate / ui-analog / terminal /
checklist。文本清单是最后的手段，仅限真正无法可视化的条目
（可靠性修复列表）。

## 流程

### 0 · 使用本技能的资产初始化项目——不得妥协

**必须在编写任何合成 HTML 之前完成此步骤。跳过这一步，产出的视频必然会看起来像你之前制作过的某个类似项目，而不是本技能的品牌风格——这是本技能偏离品牌最常见的原因，没有之一。** 本技能的资产、字体和脚手架就是技能本身；SKILL.md 提示词只是一个路由器。

```bash
mkdir -p project/assets/fonts
cp <SKILL_DIR>/assets/fonts/*.woff2 project/assets/fonts/
cp <SKILL_DIR>/assets/bgm.mp3 project/bgm.mp3
ffmpeg -y -stream_loop 15 -i <SKILL_DIR>/assets/bg-pattern.mp4 -t <TOTAL> \
  -vf "scale=1080:1080,fps=30,eq=saturation=0.72,drawbox=c=black@0.5:t=fill" \
  -an -c:v libx264 -crf 20 -pix_fmt yuv420p project/assets/bg-pattern-<TOTAL>s.mp4
cp <SKILL_DIR>/examples/master-skeleton.html project/index.html
```

然后**从头到尾阅读 `references/build-spec.md`**（不得略读）——它定义了所有场景从脚手架继承的品牌设计标记（TT Norms Pro + ABC Solar Display + TT Norms Mono、奶油色 `#f5f6f4`、节制使用的绿色 `#5ef17c`、带绿色调边框的玻璃卡片、kicker/sec-chip 胶囊形状，以及位于 `top: 990` 的 32px 字幕栏）。

只有完成这些之后，才能开始下面的第 1-6 步。第 1-4 步（解析、路由、脚本、旁白）用于规划要放入脚手架的内容；第 5 步则在已复制的 `project/index.html` 中填充占位符（`<RANGE>`、`<TOTAL>`、`<CUT_N>`、`<DUR_N>`、场景主体）——不得重写脚手架的装饰框架、字体、调色板或布局外壳。

如果你发现自己准备从先前视频的 `index.html` 执行 `cp`，或自行编写 `@font-face` 声明，或设计 WebGL 着色器背景而不是使用上面已编码的 bg-pattern MP4：立即停止。删除当前的 `index.html`，回到复制 master-skeleton 脚手架的 `cp` 步骤并重新开始。在正确的脚手架上重建场景内容，比事后将品牌风格硬套进错误的脚手架成本更低。

### 1 · 解析 + 编辑取舍

- 提取：周次范围、核心统计数据（发布次数、提交次数）、主题和条目。
- **总时长预算：45-60 秒。** 标题 ≤2 秒，片尾 ≤3.5 秒，4 个主题各约 9-12 秒。
- 每个主题保留一个主视觉呈现，以及最多 3 个口播条目。其他所有内容仅通过片尾的“完整摘要”指引呈现。取舍本身就是工作：
  即使一份更新日志包含 30 个条目，口播节拍也仍应 ≤14 个。
- 按叙事逻辑排列主题：重磅功能 → 产品界面 → 性能 →
  可靠性（摘要通常已经采用这一顺序）。

### 2 · 可视化路由

对于每个主题，从 `references/visualization-registry.md` 中选择呈现界面，并写成一行：`主题 → 呈现界面 → 模拟画面依次执行的 2-4 个操作，每个操作都与一句脚本台词对应`。如果注册表中没有合适的呈现界面，也不存在忠实的类比形式，则使用清单场景——不要为无法如实呈现的内容虚构假 UI。

### 3 · 双层脚本（口播与显示）

按照 `references/script-voice.md`，将脚本编写为**词元行**：
采用对话式语体，每个技术术语都要带有来自 `references/lexicon.json` 的 `spoken` 注音形式，而 `display` 则保留标准拼写。
字幕显示 `display`；画外音朗读 `spoken`。对于词典中不存在的任何术语：
停止并询问用户它的发音方式，然后将其添加到词典中。
在项目中保存为 `script-tokens.json`。

### 4 · 画外音 — Annie（HeyGen，固定）

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

需要已完成身份验证的 `heygen` CLI ≥0.3.0（`heygen auth login --oauth`）。
然后将口播时间戳重新对齐到显示词元：

```bash
node <SKILL_DIR>/scripts/align-captions.mjs \
  --tokens script-tokens.json --words vo-words.json --out captions.json
```

`captions.json` 是字幕轨的输入（显示拼写、口播时间）。
对齐工具会输出 `MISMATCH` 警告——在构建之前解决每一条警告
（通常是因为词典中的某个拼写被 TTS 渲染为多个单词）。**音频就是时钟**：所有节拍时间都来自 `vo-words.json`；重新生成画外音会使每个衔接点都需要重新处理。

**单词时间信息是一道硬性关卡。** 在继续执行第 5 步之前，请确认
`vo-words.json` 非空，并且包含一个 `words: [...]` 数组，其中每个单词都有 `start`/`end`。
如果该文件为空（0 字节）或缺少此数组——这是 TTS 提供商返回音频但未返回时间戳数据时的一种已知故障模式——则切勿在没有这些信息的情况下继续。
备用方案：使用本地 whisper，将生成的音频与显示脚本进行强制对齐：

```bash
uvx --from openai-whisper whisper voiceover.mp3 \
  --model base.en --language en --word_timestamps True \
  --output_format json --output_dir .
# then run align-captions.mjs with --words voiceover.json (same shape)
```

Whisper 会错误识别 TTS 的发音结果（“gee-sap” → “gsap”、“heyjen” → “hey Jen”等）——字幕仍使用 `script-tokens.json` 中的显示拼写；
whisper 只提供时间戳。`align-captions.mjs` 负责完成关联。
这一备用方案决定了最终得到的是带字幕的构建，还是一个悄无声息地缺少字幕的构建。

### 5 · 构建

严格遵循 `references/build-spec.md`：品牌令牌 + 字体（捆绑在
`<SKILL_DIR>/assets/` 中）、动画背景编码、场景脚手架、
界面框架、字幕栏、每个场景仅限一次绿色时刻。然后按以下规范
顺序执行：`ledger.json`（所有普通接缝均使用 cut-the-curve LEFT）→ seam-stamp →
在 VO 单词上设置内部节拍 → seam-gate 验证。

**字幕不是可选项。** master-skeleton 附带一个字幕栏 IIFE，
它会读取 `LINES` 数组——让该数组保持为空是交付缺陷，而不是
风格选择。在继续执行第 6 步之前，使用 `captions.json` 填充该数组：

```javascript
// paste in place of "const LINES = /* … */ []" in the caption-rail IIFE:
const LINES = /* contents of captions.json */ [
  { id: 0, end: 2.74, w: [["This", 0.0], ["week,", 0.30], …] },
  …
];
```

如果跳过了 `align-captions.mjs`，或 `LINES` 为 `[]`，第 6 步中的
帧检查将失败——不要通过从脚手架中移除 `#cap-line` 来掩盖问题。

### 6 · 门禁（展示前必须全部通过）

1. `bun run --cwd packages/cli hyperframes check`（或仓库本地
   `skills/hyperframes-cli/` skill 中已安装的 `hyperframes` CLI）——
   0 个错误（对比度：暗色文本的 alpha ≥ .66）。切勿转而使用
   `npx hyperframes@latest`；受版本控制的仓库本地 CLI，才是此 skill
   所生成合成内容之规范契约的权威来源。
2. `seam-gate.mjs verify`——0 个失败。
3. 重启预览服务器（它会缓存 bundle），在原始合成页面上通过
   `__player.seek` 抽查 3-4 个节拍。
4. 除非用户明确要求，否则不要渲染。完成用户要求的渲染后，
   从 MP4 中验证帧（`ffmpeg -ss <t> … -frames:v 1`）：字幕存在、
   背景视频不是黑屏、没有微小帧或冻结帧。
5. **字幕存在性门禁——硬性失败项。** 在 VO 的有声时间窗口内均匀抽取
   3-4 帧（例如，对于 48 秒的 VO，取 `t=3`、`t=15`、`t=30`、`t=42`），
   并确认位于 `top: 990` 的字幕栏在每一帧上都渲染了可见文本。
   如果有声区间内的任何一帧缺少字幕，则构建产物交付时没有字幕——
   将其视为红色门禁，并重新检查第 5 步中的 `LINES`
   填充情况。这正是 Jul 13-20 v4 构建中出现的问题。

## 项目布局

```
projects/active/weekly-changelog-<range>/
├── index.html            # single-doc master (scenes as slides, stamped seams)
├── ledger.json           # vector ledger (seam-stamp input)
├── script-tokens.json    # two-layer script (source of truth for VO + captions)
├── vo-spoken.txt         # generated: spoken layer, one line
├── voiceover.mp3 + vo-words.json + captions.json
├── bgm.mp3               # copy from <SKILL_DIR>/assets/bgm.mp3 (the house track) unless the user supplies one
└── assets/fonts/ + assets/bg-pattern-<dur>s.mp4
```

## 反模式

| 不要这样做                                            | 应该这样做                                                                                                                                                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 使用项目符号幻灯片展示 UI 变更                        | 模拟实际界面来演示变更                                                                                                                                                                           |
| 为无法具象呈现的项目制作虚假 UI                       | 使用如实呈现的检查清单场景                                                                                                                                                                       |
| 在 TTS 文本中直接使用“JSON”/“CLI”                     | 使用词典中的口语形式；显示形式保持标准写法                                                                                                                                                        |
| 在字幕中使用音标拼写                                  | 字幕始终渲染显示层                                                                                                                                                                               |
| 猜测未知术语的发音                                    | 先询问，再扩充词典                                                                                                                                                                               |
| 朗读更新日志中的每个项目                              | 每个主题不超过 3 项；其余内容由摘要链接承载                                                                                                                                                       |
| 到处使用绿色强调色                                    | 每个场景仅使用一次绿色时刻 (#5ef17c)                                                                                                                                                             |
| 从之前视频的 index.html 开始制作                      | 第 0 步——始终将此 skill 中的 `examples/master-skeleton.html` 复制到 `project/index.html`                                                                                                         |
| 手工制作 `@font-face` / WebGL shader / 自定义 BGM     | 第 0 步——原样复制此 skill 的 `assets/`；该 skill 的资源就是品牌本身                                                                                                                              |
| 未执行 CloudFront 失效处理就交付                      | 每次替换 S3 内容后，都要针对确切路径在分配 `E2BSLVSZ7FG3U0` 上运行 `aws cloudfront create-invalidation`——否则 CDN 会继续缓存旧文件                                                               |
| 交付时脚手架中的 `LINES` 数组为空                     | 第 4 步必须生成已填充的 `captions.json`；第 5 步必须将其粘贴到 IIFE 中；第 6 步的门禁 5 必须确认渲染帧上存在字幕。空的 `LINES` = 无字幕交付 = 重新执行整个流程 |
| 没有 `vo-words.json` → 跳过字幕并照常交付             | 对生成的音频回退使用 whisper 强制对齐；字幕不是可选项                                                                                                                                            |