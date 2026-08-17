---
name: happy-dreamina
description: ByteDance Jimeng (Dreamina) image and video generation via the official `dreamina` CLI. Use this skill whenever the user mentions 即梦, Dreamina, Jimeng, or asks to generate images or videos specifically through ByteDance's Jimeng service. Covers text2image, image2image, text2video, image2video, plus async task query and task-history browsing via list_task. Trigger this skill instead of happy-image-gen or happy-video-gen whenever the user explicitly names 即梦 or dreamina — it uses browser-based login (`dreamina login`) rather than API keys and has access to Jimeng-exclusive models. Common phrases include "用即梦画张...", "Jimeng generate a video of...", "Dreamina 文生视频", "用 dreamina CLI 做图", "查下我即梦的历史任务".
version: 0.1.0
---
# happy-dreamina

通过字节跳动官方 `dreamina` CLI 生成图像和视频。此技能是一个轻量级指令层——它不封装任何 SDK。每项操作都映射到用户 shell 中已有的一个 `dreamina` 子命令。

## 何时调用此技能

满足以下任一条件时使用此技能：

- 用户提到 **即梦**、**Jimeng** 或 **Dreamina**（任何语言）。
- 用户明确提到 `dreamina` CLI 或其子命令。
- 用户询问其即梦任务历史记录、账户积分或登录状态。

如果用户只说“generate an image”或“画张图”，**但未提及即梦**，则应优先使用 `happy-image-gen` / `happy-video-gen`，并且不要触发此技能。原因是即梦使用浏览器登录，并且只是一个特定的提供商——其他技能允许用户通过 EXTEND.md 中的默认设置从多个提供商中进行选择。

## 步骤 0：预检（阻塞性——执行任何其他操作前，必须运行这两项检查）

并行运行以下命令：

1. `command -v dreamina`——是否已安装二进制文件？
2. `dreamina user_credit`——登录是否仍然有效？正常响应应为包含积分信息的 JSON。

### 如果未安装 `dreamina`

告知用户缺少 `dreamina` CLI，并提出为其安装。官方安装命令为：

```bash
curl -fsSL https://jimeng.jianying.com/cli | bash
```

这是一个**会写入用户计算机的 shell 安装操作**——不要静默运行。先征得确认，再运行该命令，然后重新检查 `command -v dreamina`。有关平台说明（macOS、Linux x86_64/arm64），请参阅 `references/install-and-login.md`。对于任何其他平台（例如 Windows），或安装程序发生变化时，请引导用户访问官方安装页面：https://jimeng.jianying.com/ai-tool/install。

### 如果 `user_credit` 失败（退出码非零，或 JSON 中缺少积分）

用户尚未登录，或者令牌已过期。请让他们运行：

```bash
dreamina login
```

此命令会打开默认浏览器进行即梦授权。凭据会自动保存到 `~/.dreamina_cli/credential.json`——用户无需手动处理该文件。如果浏览器未打开或流程卡住，请升级为使用 `dreamina login --debug`（参阅 `references/troubleshooting.md`）。

**在 `dreamina user_credit` 成功之前，不要继续执行生成操作。**

## 步骤 1：选择正确的子命令

将用户意图映射到且仅映射到一个子命令：

| 用户希望…… | 命令 |
|---|---|
| 根据文本生成图像 | `dreamina text2image` |
| 转换现有图像或更改其风格 | `dreamina image2image` |
| 根据文本生成视频 | `dreamina text2video` |
| 为静态图像制作动画（i2v） | `dreamina image2video` |
| 获取之前的异步结果 | `dreamina query_result` |
| 浏览历史任务 | `dreamina list_task` |

## 步骤 2：根据用户意图填充参数

使用 `references/ratio-resolution-map.md` 将自然语言（“竖屏 / 1080P / 高清 / 方图 / 横屏”）转换为标志。请注意用户**没有**说明的内容——使用安全的默认值进行补全，不要要求用户重新说明显而易见的信息。

### 图像生成——`text2image` / `image2image`
- `--prompt="..."`——始终使用双引号，避免 shell 元字符（中文引号、逗号）导致命令出错。
- `--ratio`——`1:1 / 16:9 / 9:16 / 3:4 / 4:3`。默认值为 `1:1`。
- `--resolution_type`——`1k / 2k / 4k`。默认值为 `2k`；快速草稿使用 `1k`，仅当用户要求超高清或印刷级质量时使用 `4k`。
- 仅适用于 `image2image`：**`--images <path>`**（复数形式——接受参考图像包，多个路径以空格分隔）。
- 始终包含 `--poll=30`。

### 视频生成 — `text2video` / `image2video`
- `--prompt="..."` — 引号规则相同。
- `--duration` — 整数秒。默认值为 `5`。
- `--ratio` — 横向画面意图默认为 `16:9`，竖向画面默认为 `9:16`，方形画面默认为 `1:1`。
- `--video_resolution` — `480P / 720P / 1080P`。默认值为 `720P`。
- 仅适用于 `image2video`：**`--image <path>`**（单数形式——单个关键帧）。
- 始终包含 `--poll=60`（视频生成所需时间比图像更长）。

> ⚠ **容易混淆**：`image2image` 使用 `--images`（复数形式，参考图集）。`image2video` 使用 `--image`（单数形式，一个关键帧）。混用会导致 "unknown flag" 错误。

## 第 3 步：提交并读取结果

通过 Bash 运行命令。成功后，CLI 会将 JSON 输出到 stdout——其中包含结果 URL；如果传入了 `--download_dir`，则包含本地文件路径。将路径/URL 返回给用户。

**示例——文生图**：
```bash
dreamina text2image \
  --prompt="一只戴墨镜的橘猫,背光,电影感" \
  --ratio=1:1 \
  --resolution_type=2k \
  --poll=30
```

**示例——图生视频**：
```bash
dreamina image2video \
  --image=./keyframe.png \
  --prompt="镜头缓缓推近,橘猫眼神闪动" \
  --duration=5 \
  --ratio=16:9 \
  --video_resolution=720P \
  --poll=60
```

如果用户希望将结果下载到本地而不是获取 URL，请添加 `--download_dir=./out`（先创建该目录）。

## 第 4 步：处理异步超时

如果 `--poll` 超时，CLI 会返回状态为 `querying` 且包含 `submit_id` 的 JSON。告知用户你将重试，然后运行：

```bash
dreamina query_result --submit_id=<submit_id> --download_dir=./out
```

如果任务仍在进行中，请等待并重试。如果任务失败，请从 `query_result` 响应中提取错误消息并逐字转达——不要猜测。

## 高级功能：历史记录和会话

- `dreamina list_task --gen_status=success` — 列出已完成的任务。
- `dreamina list_task --submit_id=<id>` — 获取某个特定任务。
- **会话**（v1.3.5+）允许用户为不同项目保留相互独立的工作区。仅当用户明确要求“切换会话”“在会话 X 中工作”或“列出会话”时才对其进行操作。否则使用默认会话即可。

## 参考资料

按需加载这些文件——不要一开始就全部读取：

- **`references/cli-commands.md`** — 所有 `dreamina` 子命令的完整参数表。
- **`references/install-and-login.md`** — 安装程序详情、浏览器登录、凭据文件位置、版本升级。
- **`references/ratio-resolution-map.md`** — 用户表述与 `--ratio` / `--resolution_type` / `--video_resolution` 之间的映射。
- **`references/troubleshooting.md`** — 登录过期、队列超时、submit_id 恢复、账户切换。