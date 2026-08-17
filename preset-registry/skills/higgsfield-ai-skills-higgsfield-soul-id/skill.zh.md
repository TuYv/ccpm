---
version: 0.12.0
name: higgsfield-soul-id
description: |
  Train a Soul Character — a personalized model on a person's face that
  Higgsfield uses for identity-faithful image and video generation.
  Use when: "create my Soul", "train my face", "make my digital twin",
  "build me an avatar", "learn my appearance", "create a character of me",
  "set up identity for video", "I want my face in generated images".
  Chain: train Soul (one-time, returns reference_id) → use in
  higgsfield-generate via `--soul-id <id>` with models like
  `text2image_soul_v2` or `soul_cinema_studio`.
  NOT for: one-shot face swaps (use higgsfield-generate with --image),
  named-character / non-photo avatars (use higgsfield-generate with prompt).
argument-hint: "[name] [photo paths...]"
allowed-tools: Bash
---
# Higgsfield Soul 角色

训练一个忠实还原面部特征的身份模型。可在所有由 Soul 驱动的生成任务中重复使用。

## 步骤 0 — 初始化

执行任何其他命令之前：

1. 如果 `$PATH` 中没有 `higgsfield`，请安装：
   ```bash
   curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh
   ```
2. 如果 `higgsfield account status` 执行失败并显示 `Session expired` / `Not authenticated`，请让用户运行 `higgsfield auth login`（交互式），然后等待确认。
3. Soul 训练需要付费套餐（Basic+）。如果 `higgsfield account status` 显示为免费套餐，请在提交前告知用户。

## 用户体验规则

1. 保持简洁。不要在聊天中显示原始 ID。只需引用名称并告知“​​Soul 已就绪”。
2. 检测用户使用的语言并以该语言回复。CLI 标志保持英文。
3. 只询问最少量的输入：名称 + 照片。选择合理的模型变体。
4. 静默轮询——训练需要几分钟。不要重复发送状态更新。

## 工作流程

1. **获取名称。** 使用一个单词，供后续引用。如果缺失，请询问。
2. **获取照片。** 5–20 张人脸照片，角度和光照应多样化。可以使用本地路径或已上传的 ID——`--image` 两者都接受。
3. **选择变体。**
   - `--soul-2` — 用于图像生成（默认）
   - `--soul-cinematic` — 用于电影级内容／视频工作
   根据用户说明的下游用途进行选择。默认使用 `--soul-2`。
4. **提交。**
   ```bash
   higgsfield soul-id create --name "<name>" --soul-2 --image ./photo1.png --image ./photo2.png ...
   higgsfield soul-id create --name "<name>" --soul-2 --image <upload_id> --image <upload_id> ...
   ```
   CLI 会自动上传路径对应的文件。获取返回的引用 ID。
5. **等待。** `higgsfield soul-id wait <id>`。保持静默。默认超时时间为 30 分钟。
6. **交付。** “Soul `<name>` 已就绪。生成时使用 `--soul-id <id>`。”

## 使用 Soul

训练完成后，将其传递给 `higgsfield-generate`：

```bash
higgsfield generate create text2image_soul_v2 --prompt "..." --soul-id <ref_id> --quality 2k --wait
higgsfield generate create soul_cinematic --prompt "..." --soul-id <ref_id> --quality 2k --wait
```

## 列出现有 Soul

```bash
higgsfield soul-id list                   # all references
higgsfield soul-id get <id>               # one by id
```

## 错误

- `Minimum Basic plan required` — 用户正在使用免费套餐；请告知用户。
- `Training failed` — 检查照片质量（5 张以上不同的人脸照片，光照良好）。
- `Session expired` → `higgsfield auth login`。

## 参考文档

- `references/photo-guide.md` — 哪些照片效果最佳
- `references/troubleshooting.md` — 常见训练失败问题