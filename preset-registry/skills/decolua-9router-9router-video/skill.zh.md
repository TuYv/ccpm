---
name: 9router-video
description: Generate videos via 9Router /v1/videos/generations using xAI Grok Imagine (grok-imagine-video). Async job flow - submit, poll request_id until done, download MP4. Use when the user wants to create, generate, or render a video, text-to-video (txt2vid), or image-to-video.
---
# 9Router — 视频生成（xAI Grok Imagine）

需要配置 `NINEROUTER_URL`（如果启用了身份验证，还需要配置 `NINEROUTER_KEY`）。设置方法请参阅 https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router/SKILL.md。

需要在 9Router 控制面板中连接一个 **xAI 账户**——可以使用 **Grok Build OAuth**（通过 SuperGrok / X Premium+ 订阅登录），也可以使用来自 console.x.ai 的 **xAI API key**。二者是独立的身份验证类型，计费方式也各自独立；控制面板会显示每个连接所使用的类型。

## 端点（异步任务流程）

视频生成是**异步**的：POST 请求会立即返回一个 `request_id`，之后需要轮询，直到任务状态变为 `done` 或 `failed`。

| 端点 | 用途 |
|---|---|
| `POST /v1/videos/generations` | 文本生成视频 / 图像生成视频 |
| `POST /v1/videos/edits` | 编辑现有视频 |
| `POST /v1/videos/extensions` | 扩展现有视频 |
| `GET /v1/videos/{request_id}` | 轮询任务状态 |

请求字段（原样传递给 xAI——参阅 https://docs.x.ai/developers/rest-api-reference/inference/videos）：

| 字段 | 必填 | 说明 |
|---|---|---|
| `model` | 否 | `xai/grok-imagine-video`（向上游发送前会移除前缀） |
| `prompt` | T2V 时必填 | 视频描述 |
| `duration` | 否 | 秒数 |
| `aspect_ratio` | 否 | `16:9`、`9:16`、`1:1`、`4:3`、`3:4`、`3:2`、`2:3` |
| `resolution` | 否 | `480p`、`720p`、`1080p` |
| `image` | 否 | 图像生成视频时使用 `{ "url": "https://… or data:image/…;base64,…" }` |
| `video` | 编辑/扩展时必填 | `{ "url": "…mp4" }` 或 `{ "file_id": "…" }` |

## 示例

提交任务：

```bash
curl -X POST "$NINEROUTER_URL/v1/videos/generations" \
  -H "Authorization: Bearer $NINEROUTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"xai/grok-imagine-video","prompt":"A cinematic tracking shot through a neon city at night","duration":8,"aspect_ratio":"16:9","resolution":"720p"}'
# → {"request_id":"abc123"}   (response header x-9router-connection-id: <id>)
```

轮询直至完成（将连接响应头传回，以便使用同一账户轮询任务）：

```bash
curl "$NINEROUTER_URL/v1/videos/abc123" \
  -H "Authorization: Bearer $NINEROUTER_KEY" \
  -H "x-connection-id: <id from create response>"
# → {"status":"pending","progress":42}
# → {"status":"done","video":{"url":"https://…mp4","duration":8},"model":"grok-imagine-video"}
# → {"status":"failed","error":{"code":"…","message":"…"}}
```

下载：从 `done` 响应中获取 `video.url`。

## CLI 一次性操作

```bash
9router xai video \
  --prompt "A cinematic tracking shot through a neon city at night" \
  --output video.mp4
# options: --model --duration --aspect-ratio --resolution --image --timeout --port --api-key
```

提交任务、轮询并显示进度，将内容下载到 `video.mp4.part`，成功后以原子方式重命名。按 Ctrl+C 可安全取消；失败时以非零状态码退出。

## 说明与限制

- 上游任务与**账户绑定**：请使用创建任务时所用的同一连接进行轮询（`x-connection-id` 请求头，其值取自创建响应中的 `x-9router-connection-id`）。
- 创建任务的 POST 请求**绝不会自动重试**（重试可能会创建两个视频并产生两次费用）。唯一例外是执行一次 401→刷新令牌→单次重试；在创建任务之前，上游就会拒绝该请求。
- 视频模型带有 `kind: "video"` 标签，不会出现在聊天模型列表和聊天回退组合中。
- Grok Build **订阅 OAuth** 令牌与 API key 一样，会被发送到相同的 `api.x.ai/v1/videos` 端点；特定订阅等级是否包含视频生成配额由 xAI 控制，9Router 不会对此进行验证——如果上游返回 `403`/`permission_denied`，则表示所连接的账户没有视频访问权限。