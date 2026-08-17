---
name: happy-video-gen
description: Universal AI video generation supporting OpenAI Sora, Google Veo 2/3, Runway Gen-3/Gen-4, Pika 2.2, Luma Dream Machine (Ray 2), FAL (Kling / Wan / Veo / Sora wrappers), Ark Seedance 1.5 Pro/Lite, Bailian Wanx (i2v), MiniMax Hailuo-02, and Vidu Q3. Use this skill whenever the user asks to generate, create, make, or synthesize a video from a text prompt or from a first-frame image. Covers text-to-video and image-to-video, with optional last-frame control on providers that support it. Typical phrases include "generate a video of ...", "make a 5-second clip of ...", "animate this image", "生成一段视频", "做个短片", or any mention of video-generation model families like Sora, Veo, Runway Gen, Kling, Wan, Seedance, Hailuo, Pika, Dream Machine, Vidu. Always use this skill even if the user does not name a specific model — pick a provider from their EXTEND.md defaults or available API keys. Do NOT use this skill when the user explicitly mentions 即梦 / Dreamina / Jimeng — those go to happy-dreamina instead.
version: 0.1.0
---
# happy-video-gen

通过一个 CLI 跨 10 个提供商生成短视频（文生视频或图生视频）：`bun scripts/main.ts ...`。所有提供商均采用异步方式——CLI 会提交任务，轮询直至提供商完成生成，然后下载 MP4 / WebM 文件。

## 快速使用

```bash
# Text-to-video
bun scripts/main.ts --prompt "camera slowly pushes into a calico cat on grass" --ar 16:9 --duration 5 --video ./out.mp4

# Image-to-video (first frame)
bun scripts/main.ts --prompt "subtle zoom, leaves swaying" --image ./keyframe.png --duration 5 --video ./out.mp4

# Image-to-video with last-frame control (provider-dependent)
bun scripts/main.ts --prompt "seamless morph" --image ./a.png --last-frame ./b.png --video ./out.mp4
```

## 何时调用此技能

- 用户要求根据文本生成 / 创建 / 制作 / 合成视频。
- 用户要求让静态图像动起来，或提供了首帧路径。
- 用户提到任何视频模型系列（Sora、Veo、Runway、Kling、Wan、Seedance、Hailuo、Pika、Dream Machine、Vidu）。

如果用户明确提到即梦 / Jimeng / dreamina CLI，则路由到 `happy-dreamina`。如果用户实际想要的是静态图像，则路由到 `happy-image-gen`。

## 第 0 步：预检（阻塞性）

1. **查找 EXTEND.md**（解析顺序与 happy-image-gen 相同）：
   - `./.happy-skills/happy-video-gen/EXTEND.md`
   - `$XDG_CONFIG_HOME/happy-skills/happy-video-gen/EXTEND.md`
   - `~/.happy-skills/happy-video-gen/EXTEND.md`

   如果均不存在，请运行 `bun scripts/main.ts --setup`，并按照 `references/config/first-time-setup.md` 引导用户完成操作。

2. **验证至少一个提供商已配置凭据。** 按照 CLI 自动检测的顺序检查环境变量（参见 providers.md）。如果没有可用的提供商，请勿继续。

3. **验证 Bun**。如果缺失，则回退使用 `npx -y bun`。

4. **提醒成本。** 单次视频生成的费用比图像生成高 10–100 倍。如果用户要求生成 HD 1080P / 10 秒的视频片段，请在执行前先确认——向用户展示 `references/providers.md` 中该提供商的预计费用区间。

## 第 1 步：选择提供商

优先顺序：

1. 显式传入的 `--provider <id>`。
2. EXTEND.md 中的 `default_provider`。
3. 根据环境变量自动检测：`fal > ark > minimax > runway > luma > pika > vidu > google > bailian > openai`。

根据实际任务的优势选择：

- **中文提示词 / 画面中的中文文本** → `ark`（Seedance）或 `bailian`（Wanx）。
- **照片级写实人像** → `google`（Veo 3）或 `runway`（Gen-4）。
- **动漫 / 风格化内容** → `fal`（Kling）或 `luma`。
- **低成本草稿** → `ark` Seedance Lite、`fal` Kling v2.5 turbo、`vidu` Q1。
- **语音同步的对话视频**（如适用）→ `google` Veo 3、`openai` Sora 2。

## 第 2 步：填写参数

- **`--prompt`**：始终使用双引号。
- **`--image <path>`** / **`--last-frame <path>`**：本地路径，将自动进行 Base64 编码并转换为数据 URI。`--last-frame` 仅受 Luma 和少数 FAL 端点支持。
- **`--duration <seconds>`**：通用默认值为 5。上限：Sora-2 / Kling 最多 10 秒；Seedance 最多 10 秒；Luma 最多 9 秒。
- **`--ar <ratio>`**：`16:9 / 9:16 / 1:1 / 4:3 / 3:4`。有关各提供商的特殊差异，请参见 `references/aspect_ratio_map.md`。
- **`--resolution`**：`480p / 720p / 1080p`。并非所有提供商都会遵循此设置；大多数提供商的低价层级最高仅支持 720p。
- **`--poll-timeout`**：默认值为 600 秒（10 分钟）。对于 1080P 或时长超过 5 秒的视频片段，请增大该值。

## 第 3 步：提交并等待

```bash
bun scripts/main.ts \
  --prompt "..." \
  --video ./out.mp4 \
  --provider ark \
  --duration 5 \
  --ar 16:9 \
  --resolution 720p
```

等待期间，**不要**在同一提供商上提交另一个任务——低价套餐的并发限制非常严格（通常为 1）。成功后，CLI 会写入 MP4 文件，并报告文件大小和路径。JSON 输出：

```json
{ "success": true, "provider": "ark", "model": "doubao-seedance-1-0-lite-t2v-250408", "video": "/abs/out.mp4", "size_bytes": 4823456, "format": "mp4" }
```

## 第 4 步：超时与恢复

如果轮询超过 `--poll-timeout`，CLI 会抛出错误，其中包含提供商特定的外部 ID（任务 ID / 作业 ID / 操作名称 / 请求 ID）。从 stderr 中捕获该 ID，稍后使用提供商特定的工具恢复任务。有关各提供商的 ID 格式和手动恢复命令，请参阅 `references/async-protocol.md`。

## 参考资料

- **`references/providers.md`** — 全部 10 个提供商及其环境变量、默认值、成本说明和功能矩阵。
- **`references/async-protocol.md`** — 各提供商的外部 ID 格式，以及如何恢复卡住的任务。
- **`references/aspect_ratio_map.md`** — 各提供商的 `--ar` 映射。
- **`references/error_codes.md`** — 常见错误及修复方法。
- **`references/config/first-time-setup.md`** — 设置操作指南。
- **`references/config/extend-schema.md`** — EXTEND.md 模式。
- **`assets/EXTEND.template.md`** — 配置模板。