---
name: runpod
description: Cloud GPU processing via RunPod serverless. Use when setting up RunPod endpoints, deploying Docker images, managing GPU resources, troubleshooting endpoint issues, or understanding costs. Covers all 5 toolkit images (qwen-edit, realesrgan, propainter, sadtalker, qwen3-tts).
---
# RunPod 云 GPU

通过 RunPod 无服务器服务在云 GPU 上运行开源 AI 模型。按秒付费，无最低消费。

## 设置

```bash
# 1. Create account at https://runpod.io
# 2. Add API key to .env
echo "RUNPOD_API_KEY=your_key_here" >> .env

# 3. Deploy any tool with --setup
python tools/image_edit.py --setup
python tools/upscale.py --setup
python tools/dewatermark.py --setup
python tools/sadtalker.py --setup
python tools/qwen3_tts.py --setup
```

每条 `--setup` 命令都会：
1. 根据 Docker 镜像创建一个 RunPod **模板**
2. 使用合适的 GPU 创建一个无服务器**端点**
3. 将端点 ID 保存到 `.env`（例如 `RUNPOD_QWEN_EDIT_ENDPOINT_ID`）

## 可用镜像

所有镜像均公开托管在 GHCR 上——无需身份验证。

| 工具 | Docker 镜像 | GPU | VRAM | 典型成本 |
|------|-------------|-----|------|-------------|
| image_edit | `ghcr.io/conalmullan/video-toolkit-qwen-edit:latest` | A6000/L40S | 48GB+ | ~$0.05-0.15/job |
| upscale | `ghcr.io/conalmullan/video-toolkit-realesrgan:latest` | RTX 3090/4090 | 24GB | ~$0.01-0.05/job |
| dewatermark | `ghcr.io/conalmullan/video-toolkit-propainter:latest` | RTX 3090/4090 | 24GB | ~$0.05-0.30/job |
| sadtalker | `ghcr.io/conalmullan/video-toolkit-sadtalker:latest` | RTX 4090 | 24GB | ~$0.05-0.15/job |
| qwen3_tts | `ghcr.io/conalmullan/video-toolkit-qwen3-tts:latest` | ADA 24GB | 24GB | ~$0.01-0.05/job |

**每月总成本：** 即使频繁使用，也很少超过 10 美元。

## 工作原理

所有工具都遵循相同的模式：

```
Local CLI → Upload input to cloud storage → RunPod API → Poll for result → Download output
```

1. **文件传输：** 配置后，工具会使用 Cloudflare R2（`R2_ACCOUNT_ID`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_BUCKET_NAME`），否则回退到免费上传服务
2. **RunPod API：** 工具调用 `/run` 端点，然后轮询 `/status/{job_id}`，直到任务完成
3. **冷启动与热启动：** 空闲后的首次请求会启动一个工作器（约 30-90 秒）。后续请求会很快（约 5-15 秒）

## 端点管理

### 工作器

```
workersMin: 0    — Scale to zero when idle (no cost)
workersMax: 1    — Max concurrent jobs (increase for throughput)
idleTimeout: 5   — Seconds before worker scales down
```

所有端点共享一个总工作器池，其大小取决于你的 RunPod 套餐。如果达到限制，请降低当前未使用端点的 `workersMax`。

### 检查端点状态

每个工具都将其端点 ID 存储在 `.env` 中：

| 工具 | 环境变量 |
|------|---------|
| image_edit | `RUNPOD_QWEN_EDIT_ENDPOINT_ID` |
| upscale | `RUNPOD_UPSCALE_ENDPOINT_ID` |
| dewatermark | `RUNPOD_DEWATERMARK_ENDPOINT_ID` |
| sadtalker | `RUNPOD_SADTALKER_ENDPOINT_ID` |
| qwen3_tts | `RUNPOD_QWEN3_TTS_ENDPOINT_ID` |

### 禁用端点

若要在不删除端点的情况下释放工作器槽位，请通过 RunPod 控制面板或 GraphQL API 设置 `workersMax=0`。

## RunPod API 参考

使用以下内容以编程方式查询和管理端点。RunPod 禁用了 GraphQL 内省，因此这些字段名均已验证，必须完全准确。

### 身份验证

所有 API 调用都需要 `Authorization: Bearer $RUNPOD_API_KEY`。

- **GraphQL：** `POST https://api.runpod.io/graphql`
- **REST（无服务器）：** `https://api.runpod.ai/v2/{endpoint_id}/...`

### GraphQL 查询

**列出所有端点：**
```graphql
query { myself { endpoints { id name gpuIds templateId workersMax workersMin } } }
```

**当前支出速率：**
```graphql
query { myself { currentSpendPerHr spendDetails { localStoragePerHour networkStoragePerHour gpuComputePerHour } } }
```

**列出 Pod：**
```graphql
query { myself { pods { id name runtime { uptimeInSeconds } machine { gpuDisplayName } desiredStatus } } }
```

> **常见错误：** 字段名使用完整单词的驼峰命名法——应为 `localStoragePerHour`，而不是 `localStoragePerHr`。端点字段是 `endpoints`，而不是 `serverlessWorkers`。`spending` 不是有效字段——请使用 `currentSpendPerHr` 和 `spendDetails`。

### GraphQL 变更

**更新端点 GPU 或配置：**
```graphql
mutation { saveEndpoint(input: {
  id: "endpoint_id",
  name: "endpoint-name",
  templateId: "template_id",
  gpuIds: "AMPERE_24",
  workersMin: 0,
  workersMax: 1
}) { id gpuIds } }
```

即使只是进行更新，`saveEndpoint` 也需要 `name` 和 `templateId`——请先查询以获取当前值。

### REST API（无服务器）

| 操作 | 方法 | URL |
|--------|--------|-----|
| 提交作业 | POST | `/v2/{id}/run` |
| 检查状态 | GET | `/v2/{id}/status/{job_id}` |
| 取消作业 | POST | `/v2/{id}/cancel/{job_id}` |
| 列出待处理作业 | GET | `/v2/{id}/requests` |
| 健康状态/统计信息 | GET | `/v2/{id}/health` |

**健康状态响应**包含作业数量和工作节点状态：
```json
{
  "jobs": { "completed": 16, "failed": 1, "inProgress": 0, "inQueue": 2, "retried": 0 },
  "workers": { "idle": 0, "initializing": 1, "ready": 0, "running": 0, "throttled": 0 }
}
```

> **注意：** `/requests` 仅返回待处理/排队中的作业。无法通过 API 获取已完成作业的历史记录——请在 RunPod Web 控制台中查看日志。

### GPU 类型 ID

| ID | GPU | VRAM | 典型成本 |
|----|-----|------|-------------|
| `AMPERE_24` | RTX 3090 | 24GB | ~$0.34/hr |
| `ADA_24` | RTX 4090 | 24GB | ~$0.69/hr |
| `AMPERE_48` | A6000 | 48GB | ~$0.76/hr |
| `AMPERE_80` | A100 | 80GB | ~$1.99/hr |

**可用性说明：** `ADA_24`（4090）在 RunPod 上经常受到限流或不可用。请始终为端点配置**多个备用 GPU 类型**（以逗号分隔），以免作业无限期卡在队列中：

```graphql
gpuIds: "AMPERE_24,ADA_24"   # Try 3090 first, fall back to 4090
```

所有工具包工具还会强制执行 5 分钟的队列超时——如果 300 秒内没有可用的 GPU，作业将自动取消，以防止初始化循环失败导致费用失控。

### 通过 AWS CLI 使用 Cloudflare R2

R2 使用兼容 S3 的 API，但要求指定 `--region auto`：

```bash
AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID" \
AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY" \
aws s3api list-objects-v2 \
  --bucket "$R2_BUCKET_NAME" \
  --endpoint-url "https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com" \
  --region auto
```

> **常见错误：** 省略 `--region auto` 会导致 `InvalidRegionName` 错误。R2 的有效区域包括：`wnam`、`enam`、`weur`、`eeur`、`apac`、`oc`、`auto`。

## 故障排除

### 强制拉取镜像

推送新的 Docker 镜像版本后，RunPod 可能仍会使用缓存的旧版本。要强制拉取：

1. 更新模板的 `imageName`，使用 `@sha256:DIGEST` 表示法
2. 等待工作进程重启
3. 确认无误后恢复为 `:latest` 标签

### 冷启动太慢

- **qwen3-tts：** 冷启动约 70 秒，热启动约 7 秒
- **sadtalker：** 冷启动约 60 秒，热启动约 10 秒
- **image_edit：** 冷启动约 90 秒，热启动约 15 秒

如果冷启动是个问题，请设置 `workersMin: 1`（空闲时也会产生费用）。

### 作业因 OOM 而失败

模型所需的 VRAM 超出了 GPU 可提供的容量。可选方案：
- 使用更高档位的 GPU
- 对于去水印：减小 `--resize-ratio`（为安全起见，默认值为 0.5）
- 对于 image_edit：减小 `--steps`

### “没有可用的工作进程”

你已达到当前套餐的并发工作进程上限。可以：
- 等待正在运行的作业完成
- 在未使用的端点上设置 `workersMax=0`
- 升级 RunPod 套餐

## Docker 镜像

所有 Dockerfile 都位于 `docker/runpod-*/` 中。镜像使用 `runpod/pytorch` 作为基础镜像，以便在各工具之间共享镜像层。

为 RunPod 构建镜像（在 Apple Silicon Mac 上）：
```bash
docker buildx build --platform linux/amd64 -t ghcr.io/conalmullan/video-toolkit-<name>:latest docker/runpod-<name>/
docker push ghcr.io/conalmullan/video-toolkit-<name>:latest
```

GHCR 软件包默认为**私有**——你必须手动将其设为公开，RunPod 才能拉取。前往 GitHub > Packages > Package Settings > Change Visibility。

## 成本优化

- 在所有端点上保持 `workersMin: 0`（缩容至零）
- 仅部署你正在使用的端点
- 使用 `workersMax=0` 禁用空闲端点，而无需将其删除
- 对于配音，Qwen3-TTS 比 ElevenLabs 便宜得多
- 在 RunPod 控制面板中查看使用量和账单