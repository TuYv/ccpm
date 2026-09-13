---
name: genomic-intelligence
description: "Predict regulatory features, gene structure, and expression directly from DNA sequence using Genomic Intelligence's hosted transformer DNA language models — no local GPU or model weights. Six tasks over a REST API and a hosted MCP server (keyless public demo): promoter regions, splice donor/acceptor sites, enhancer activity, chromatin state, sequence-to-expression (log TPM), and de-novo gene annotation, plus a composite find-genes-then-predict-expression workflow. Use when the user has a gene symbol, a genomic region, or a DNA/FASTA sequence and wants any of these predictions, mentions Genomic Intelligence, genomicintelligence.ai, api.genomicintelligence.ai, or mcp.genomicintelligence.ai."
license: MIT
compatibility: Python 3.10+ with the `requests` library for the REST path (no dedicated SDK). Network access required. The REST `/v1` API needs a `GI_API_KEY` (a `gi_` bearer); the hosted MCP server at mcp.genomicintelligence.ai/mcp works keyless against a rate- and concurrency-limited public demo tier, key optional.
metadata:
  version: "1.2"
  skill-author: Genomic Intelligence
  trigger-keywords: DNA sequence prediction, regulatory genomics, promoter prediction, splice site prediction, enhancer activity, chromatin state, gene expression prediction, sequence to expression, log TPM, gene annotation, transcript prediction, DNA language model, genomic intelligence, hosted inference, Ensembl sequence, FASTA prediction, cis-regulatory, TSS window, DeepSEA, DeepSTARR, BigBird splice, MCP genomics
  openclaw:
    primaryEnv: GI_API_KEY
    envVars:
    - name: GI_API_KEY
      required: false
      description: Optional gi_ bearer key for the REST /v1 API and higher MCP rate and concurrency limits. The hosted MCP demo runs keyless; request a key at contact@genomicintelligence.ai.
---
# 基因组智能 — DNA 序列模型

基因组智能（GI）通过托管 GPU，为六类序列分析任务提供 transformer DNA 语言模型服务。提供**基因符号**、**基因组区域**或 **DNA/FASTA 序列**；它将返回结构化预测结果 — 启动子区域、剪接位点、增强子活性、染色质状态、表达量（log TPM）以及从头基因注释。没有任何内容在本地运行：无需模型权重、GPU 或庞大的 Python 技术栈。它是托管式、版本化推理 API 的轻量客户端。

**官方文档：**[docs.genomicintelligence.ai](https://docs.genomicintelligence.ai) ·
REST 契约位于 [api.genomicintelligence.ai/v1/openapi.json](https://api.genomicintelligence.ai/v1/openapi.json) ·
托管 MCP 服务器位于 `https://mcp.genomicintelligence.ai/mcp`

## 何时使用此技能

当用户拥有 DNA 并需要模型预测时，使用 GI：

- 在基因组区域中**查找启动子**（`promoter`）
- **预测剪接**供体/受体位点（`splice`）
- **评估增强子活性** — 发育型与管家型（`enhancer`）
- 跨数百条轨道**注释染色质状态**（`chromatin`）
- 根据序列 + 细胞类型上下文**预测表达量**，表示为 log(TPM+1)（`expression`）
- 无需参考序列，进行从头**基因/转录本注释**（`annotation`）
- **查找区域内的基因并预测每个基因的表达量**（组合任务）

不适用于本地比对、变异检测或文件 I/O — 请使用本地工具
（BioPython、bcftools）完成这些任务。GI 用于**基于序列的模型推理**。

> 仅限研究和开发用途。不得用于临床或诊断决策。

## 调用 GI 的两种方式

### 托管 MCP 服务器（免密钥；MCP 主机首选）

GI 在 `https://mcp.genomicintelligence.ai/mcp` 上托管 MCP 服务器（Streamable
HTTP）。当你的代理主机支持 MCP 时，优先使用它：它可在无需密钥的情况下运行于
受速率和并发限制的公开演示层级，也可以使用可选的 `gi_` bearer
密钥来提高这些限制。它提供返回**序列句柄**
（`sequence_ref`）的获取工具，以及接受该句柄的 `predict_*` 工具，因此大型序列
无需进入上下文。请参阅下方的 [MCP 工作流](#mcp-workflow-handle-based)以及
`references/mcp.md`。

### REST API（通用）

通过 `requests` 对 `https://api.genomicintelligence.ai/v1` 发起普通 HTTP 请求。REST
路径**需要**一个 `GI_API_KEY`（`gi_` bearer）。可在任何主机、脚本中使用，或者在你
需要原始封装时使用。请参阅 [核心 REST 工作流](#core-rest-workflow)。

## 访问与身份验证

1. **托管 MCP 演示服务无需密钥** — 无需设置任何内容即可尝试。
2. **REST `/v1` API 需要密钥**，通过 `Authorization: Bearer <key>` 发送。
   请通过 [contact@genomicintelligence.ai](mailto:contact@genomicintelligence.ai) 申请。
3. **绝不可硬编码密钥。**从 `GI_API_KEY` 环境变量
   （或通过 `python-dotenv` 加载的 `.env`）读取。绝不可提交密钥。

```bash
export GI_API_KEY="gi_yourkeyhere"     # MCP 可选；REST 必需
export GI_BASE_URL="https://api.genomicintelligence.ai"   # 覆盖为暂存环境
```

Key 按合作伙伴层级进行作用域划分，并受并发和每分钟上限限制。`429`
表示你触及了某个上限，请退避并重试，或请求 GI 提升你的层级。

## 六项任务

每项任务都是**各自发布的操作**，拥有自己的请求 schema、自己的最小长度，以及各自封闭的
`options` 对象：`POST
/v1/tasks/promoter/predict`、`/v1/tasks/splice/predict`、
`/v1/tasks/enhancer/predict`、`/v1/tasks/chromatin/predict`、
`/v1/tasks/annotation/predict`、`/v1/tasks/expression/predict`。每个路径都是
字面字符串，因此无需构造，也不存在共享的 `PredictRequest` schema。请求体为
`{sequence, sequence_name?, model?, options?}`，返回 `{data, meta}` 封装。各任务之间的差异如下：

| 任务 | 推荐模式 | 接受的长度 | `context_window_bp` | 备注 |
|---|---|---|---|---|
| `promoter` | sync | 300–500,000 bp | 2,000 bp | 滑动窗口启动子区域 |
| `splice` | sync | 100–500,000 bp | 15,000 bp | 供体/受体位点（长上下文 BigBird）；具有链特异性，请输入转录本方向 |
| `enhancer` | sync | 50–500,000 bp | 249 bp | 发育 + 管家基因评分（DeepSTARR，*Drosophila*） |
| `chromatin` | sync | 200–500,000 bp | 1,000 bp | 数百条轨道（DeepSEA） |
| `expression` | sync | **9,198–500,000 bp** | n/a（`trained_window_bp` 9,198） | log(TPM+1)；除非长度恰好为 9,198 bp，否则需要 `tss_index`，以及细胞类型 `description` |
| `annotation` | async | 1,000–500,000 bp | n/a | 从头生成转录本；提交后轮询；超过 200,000 bp 时，同步请求会返回 `413 sync_too_large` |

`Recommended mode` 是指导而非限制——每项任务都同时接受两种模式。省略
`Prefer` 可获得同步 `200`；发送 `Prefer: respond-async` 可获得 `202`，然后通过
`GET /v1/tasks/jobs/{job_id}` 查询。每个操作唯一强制执行的限制是：如果
`/v1/openapi.json` 在某个 `POST` 上发布了 `x-sync-limit-bp`，则长度超过该限制的同步请求会返回
`413 sync_too_large`——截至 `info.version` 2026.09.10.1，`annotation` 的限制为
200,000 bp，复合工作流的限制为 50,000 bp。请读取该字段，而不是记忆这些数字；其他 predict
任务目前没有限制。

**最小值是准入控制，而不是适用范围。** 请求长度高于下限、但短于所选模型的
`bio_spec.context_window_bp` 时，仍会被*接受并评分*——评分所依据的窗口会填充至上下文窗口长度。
`enhancer` 是最明显的例子：下限为 50 bp，但上下文窗口为 249 bp，因此 50–248 bp 的序列大部分会基于填充内容进行评分。
将序列长度与
`GET /v1/tasks/{task}/models` 返回的 `context_window_bp` 进行比较，即可判断模型是否看到了真实序列。
超过上下文窗口的输入没有问题——扫描器每次处理一个预测窗口，并且只会填充最后一个不完整窗口。

低于下限以及超过 500,000 bp 上限的请求，**都会**返回
`422 validation_failed`，位置为 `loc ["body","sequence"]`；长度超限**不会**返回 `413`。
所有长度均在去除空白后计算，因此可以直接粘贴按行换行的 FASTA 正文（但 `>` 标题行仍会因不符合字母表检查而失败）。

`options` 按任务定义了类型且**封闭**（`additionalProperties: false`）——未知键会导致硬性 `422 validation_failed`，其 `type: "extra_forbidden"`，绝不会被忽略：

| 任务 | `options` 键 |
|---|---|
| promoter | `threshold`（0–1，默认值 0.5） |
| splice | `threshold`（0–1，默认值 0.5）、`site_types`（`["donor","acceptor"]` 的子集，默认两者都有） |
| enhancer | *(无)* |
| chromatin | `threshold`（0–1，默认值 0.5） |
| annotation | `batch_size`（1–128，默认值 8）、`shift_coordinates`、`reverse_complement`（默认值 true） |
| expression | `description` —— **必填**，且是唯一的键 |

`Prefer: respond-async` 是全部六个预测操作以及复合操作的已声明请求头，并非仅适用于 `annotation` ——参见 [Async](#async-any-task-recommended-for-annotation)。

**省略 `model` 后，API 会使用该任务的默认模型**——这是推荐调用方式。此处特意不记录默认模型 ID：默认值会变化，而已退役的 ID 会硬性失败，因此绝不要硬编码。若要固定模型，或选择非人类模型（多个任务提供果蝇、酵母和拟南芥模型），请在调用时通过 `GET /v1/tasks/{task}/models`（REST）或 `list_models`（MCP）发现 ID——并且**绝不要编造一个**。完整的按任务输出形状见 `references/tasks.md`。

`expression` 是六个任务中最严格的：它是唯一一个除 `sequence` 外还要求提供 `options` 的任务。它强制执行以下三条硬性规则——每项违规都会返回 `422`，不会填充或截断，并且不存在退出标志、请求头或查询参数：

- **它始终只评分一个恰好 9,198 bp、以 TSS 为中心的窗口**——`sequence[tss_index-4599 : tss_index+4599]`。端点本身接受 **9,198–500,000 bp**；任何少于 9,198 bp 的内容都会被直接拒绝。
- **除非序列恰好为 9,198 bp，否则 `tss_index` 必填。** 它是经**去除空白字符**后的序列中的、以 0 为起点的 TSS 偏移量，范围为 `4599 ≤ tss_index ≤ len(sequence) − 4599`。当长度恰好为 9,198 bp 时，它默认值为 4,599，且这也是该长度下唯一合法的值。因此，您可以提交完整位点（最多 500 kb）并让服务器截取窗口——但服务器**不会**为您发现 TSS（这是复合工作流的职责），也**不会**进行反向互补：请提交基因正义链序列。
- **`options.description`**——一个细胞类型 / 测定字符串（例如 `"K562 cells"`）——必填，且是 `expression` 在 `options` 中唯一接受的键。未知的顶层请求体字段也会被拒绝。

> 注意：合法的 `tss_index` 范围很宽，因此仅仅是*错误的*偏移量（例如，基于包含换行符的原始 FASTA 字符计数，或相对于位点起始位置而非所提交切片计数）不会报错——它会针对错误的窗口自信地返回 `200`。请对响应中的 `meta.task_specific_counts.scored_window` / `.tss_index` 进行断言。您提交的长度为 `meta.sequence_length`（也会以 `data.input.submitted_sequence_length` 回显）；评分宽度始终为 9,198，即 `scored_window[1] - scored_window[0]`。（`data.input.sequence_length` 已在合同修订版 13 中移除。）
>
> 两种 `tss_index` 违规情形——“除非恰好为 9,198 bp，否则必填”以及范围检查——均来自整个模型验证器，因此会在请求体层级呈现，而非位于 `tss_index` 下。请匹配 `error.code == "validation_failed"`，并且仅将消息用于显示。本 skill 中引用的任何 `loc` 元组都只是该形状的示例，并非合同的一部分：它未在 schema 中发布，且不得据此进行分支处理。

## 序列获取

你很少会从原始的 9,198 bp 字符串开始。请先获取序列：

- **根据基因符号** → MCP `fetch_ensembl_sequence(gene=...)`；**根据坐标** → `fetch_region(region=...)`。两者都会获取公开的 Ensembl 参考序列（无需密钥）。REST 用户可以直接查询 Ensembl REST。（`find_genes` 是注释任务，不是获取工具。）
- **对于 `expression`** → 使用以 TSS 为中心的获取方式，使窗口精确为 9,198 bp。MCP：`fetch_gene_for_expression`（负责居中）。否则获取更宽的基因座，并传入 `tss_index`，让服务器截取窗口，但请基于去除空白字符后的核苷酸字符串计算该偏移量，而不是基于文件字符计算。
- **从本地 FASTA 获取** → MCP `store_inline_sequence`，或者在使用 REST 时自行读取文件。（`load_local_fasta` 仅存在于本地部署中，托管服务器不提供。）
- **演示序列** → MCP `load_demo_sequence(name=...)` 会返回一个可直接使用的句柄，用于无需密钥的冒烟测试；必须提供 `name`。

关于确切的 Ensembl 调用方式和表达窗口计算方法，请参阅 `references/sequence-acquisition.md`。

## 核心 REST 工作流

调用是同步的，这是每个任务的默认方式；一次预测只需调用一次：

```python
import os, requests

BASE = os.environ.get("GI_BASE_URL", "https://api.genomicintelligence.ai")
HEADERS = {"Authorization": f"Bearer {os.environ['GI_API_KEY']}"}

def predict(task, sequence, sequence_name, model=None, options=None, tss_index=None):
    body = {"sequence": sequence, "sequence_name": sequence_name}
    if model:   body["model"] = model
    if options: body["options"] = options
    if tss_index is not None: body["tss_index"] = tss_index   # expression only
    # Each task is its own published operation, but the URL string is unchanged.
    r = requests.post(f"{BASE}/v1/tasks/{task}/predict", headers=HEADERS, json=body)
    # 422 validation_failed  — sequence under the task floor OR over 500,000 bp,
    #                          bad tss_index, missing options.description,
    #                          or ANY unknown body/options key (options is closed)
    # 401 no/bad key · 404 unknown task · 413 body over 16 MiB · 429 rate limit
    r.raise_for_status()
    return r.json()               # {"data": {...}, "meta": {...}}

# Promoter:
out = predict("promoter", seq, "TP53_region")
print(out["data"]["summary"])

# Expression — a pre-cut 9,198 bp TSS-centred window (tss_index defaults to 4,599):
out = predict("expression", tss_window_9198bp, "HBB",
              options={"description": "K562 cells"})
print(out["data"]["prediction"]["expression_log_tpm"])

# Expression — a whole locus; the server slices ±4,599 bp around the TSS you name.
# tss_index is 0-based into the whitespace-stripped sequence.
out = predict("expression", locus_seq, "HBB",
              options={"description": "K562 cells"}, tss_index=tss_offset_in_locus)
print(out["meta"]["task_specific_counts"]["scored_window"])   # confirm the window scored
```

### 异步（适用于任何任务；推荐用于注释）

`Prefer: respond-async` 是所有六个预测操作以及复合操作中声明的请求头参数。`202` 与同步 `200` 使用相同的 `{data, meta}` 信封，其中 `data = {job_id, status: "accepted", links}`；作业 ID 也会出现在 `Content-Location` 和 `X-Job-Id` 响应头中。异步仅支持 JSON——与文本 `format` 组合会被拒绝。`annotation` 是需要异步的任务：

```python
import time

r = requests.post(f"{BASE}/v1/tasks/annotation/predict",
                  headers={**HEADERS, "Prefer": "respond-async"},
                  json={"sequence": seq, "sequence_name": "TP53"})
r.raise_for_status()              # 202 Accepted
job_id = r.json()["data"]["job_id"]

while True:
    j = requests.get(f"{BASE}/v1/tasks/jobs/{job_id}", headers=HEADERS)
    if j.status_code == 200:      # terminal: body is the final {data, meta}
        break
    j.raise_for_status()          # 202 = still running (2xx, won't raise)
    time.sleep(5)                 # ~20 s typical for ~20 kb
transcripts = j.json()["data"]["transcripts"]
```

## MCP 工作流（基于句柄）

在 MCP 主机上，先获取一个句柄，然后针对它进行预测——序列无需进入上下文：

```
# 1. Acquire a sequence handle (each returns a sequence_ref):
load_demo_sequence(name="promoter_tp53")  # keyless smoke test; name is required
fetch_ensembl_sequence(gene="TP53")       # gene symbol or Ensembl ID -> handle
fetch_region(region="chr11:5,225,000-5,235,000")   # coordinates -> handle
fetch_gene_for_expression(gene="HBB")     # TSS-centred 9,198 bp handle for expression

# 2. Predict against the handle:
predict_promoter(sequence_ref=<ref>)
predict_expression(sequence_ref=<ref>, description="K562 cells")
predict_splice(sequence_ref=<ref>)        # + predict_enhancer / predict_chromatin

# 3. Annotation on MCP is `find_genes` (there is no predict_annotation).
#    It takes a handle, not a region, and runs async internally:
find_genes(sequence_ref=<ref>)            # wait=True (default) returns the result
find_genes(sequence_ref=<ref>, wait=False)  # -> job_id; poll get_job(job_id)

# Discover models with list_models(task); reference context lives in the
# gi://models, gi://docs/tasks, and gi://account MCP resources.
```

## 复合操作：查找基因，然后预测表达

要回答“该区域中有哪些基因，以及它们如何表达？”，请使用复合操作：

- **MCP：** `find_genes_and_predict_expression(sequence_ref=..., description=...)`
  — 接受的是**句柄，而不是区域**（先使用 `fetch_region` 获取一个）；`description` 为必填项。它会在序列中查找基因，并为每个基因返回表达预测。
- **REST：** 一次调用——`POST /v1/workflows/find-genes-and-predict-expression`，
  请求体为 `{sequence, options}`，其中 `sequence` 为 1,000–500,000 bp，且
  `options.description`（细胞类型 / 检测）为必填项；缺少或为空的描述会返回 `422 validation_failed`。它会进行注释，以每个发现基因的 TSS 为中心截取一个 9,198 bp 窗口（通过最多填充至窗口一半的 `N`，而不是丢弃边缘基因），并为每个基因返回预测。
  `meta.task_specific_counts` = `{genes_found, genes_predicted, genes_skipped}`，其中 `genes_predicted + genes_skipped == genes_found`；每个基因的原因位于 `data.expression_predictions[].skip_reason`。超过 **50,000 bp**（其 `x-sync-limit-bp`）时会强制异步：超过该大小的同步请求会返回 `413 sync_too_large`，其中
  `error.details = {sequence_length, threshold}`——使用 `Prefer: respond-async` 和相同的请求体重试。

## 错误

| 代码 | `error.code` | 含义 | 操作 |
|---|---|---|---|
| 400 | `bad_request` | 请求格式错误 | 检查请求体结构 |
| 401 / 403 | `unauthorized` / `forbidden` | 缺少或无效的密钥（REST） | 设置 `GI_API_KEY`；或使用无密钥的 MCP 演示 |
| 404 | `not_found` | **未知任务**（`/v1/tasks/bogus/predict`）或未知作业 | 检查任务名称 —— 无法识别的任务返回 404，而不是 422 |
| 413 | `payload_too_large` | 原始请求体超过 **16 MiB** | 拆分输入 —— 这是请求体上限，不是序列长度上限 |
| 413 | `sync_too_large` | 同步请求超过操作的 `x-sync-limit-bp`（`annotation` 为 200,000 bp，composite 为 50,000 bp） | 使用 `Prefer: respond-async` 重试 |
| 415 | `unsupported_format` | 不支持的 `format` 查询值 | 使用任务支持的格式；不会静默回退到 JSON |
| 422 | `validation_failed` | 最常见的失败：序列**低于任务下限或超过 500,000 bp**、表达序列短于 9,198 bp、缺少或超出范围的 `tss_index`、缺少 `options.description`，或存在**任何未知的请求体或 `options` 键** | 阅读消息；修正请求体 |
| 429 | `rate_limited` / `too_many_requests` | 速率或并发上限 | 降低请求频率（遵守 `Retry-After`）；请求 GI 提升级别 |
| 5xx | `internal_error` / `service_unavailable` / `model_loading` / `timeout` | 服务器错误 | 重试；如果持续发生，请联系支持人员 |

`error.code` 是一个包含 21 个值的封闭枚举（`bad_request`、`unauthorized`、
`forbidden`、`not_found`、`conflict`、`job_expired`、`payload_too_large`、
`sync_too_large`、`unsupported_format`、`validation_failed`、
`too_many_requests`、`rate_limited`、`internal_error`、`timeout`、
`insufficient_memory`、`model_not_found`、`task_not_supported_by_model`、
`model_loading`、`service_unavailable`、`http_error`、`unknown`）；将未列出的
值视为通用失败，而不是解析错误。

**根据 `code` 分支处理，绝不要根据 `details` 或 `loc` 分支处理。** `details` 以同级
`code` 为键；对于 `validation_failed`，它是架构声明的
`{errors: [{loc, msg, type}, …]}` 对象。将其视为仅用于显示的数据 —— `code` 才是稳定的判别字段。

为便于关联，每个响应都会设置 `error.request_id` 和 `X-Request-Id` **标头**，
成功响应封装中还会携带 `meta.request_id`。优先读取标头仍然是安全的默认做法。
每个响应都会携带 `RateLimit-Limit`、`RateLimit-Remaining`、
`RateLimit-Reset`、`RateLimit-Policy`；`429` 响应还会添加 `Retry-After`。

> 已根据 OpenAPI 的 `info.version` **2026.08.20.7** 完成验证。契约会发生变化，
> `/v1/openapi.json` 中的 `info.version` 会报告特定部署所提供的版本：如果该版本
> 高于上述版本，请重新对照该文档检查本文件中的数字；如果两者不一致，应以该文档为准。

## 参考文件

- `references/tasks.md` — 各任务的输出结构、模型注册表、异步
  annotation 契约。
- `references/api-and-auth.md` — REST 端点、`{data, meta}` 封装、
  身份验证、基础 URL 覆盖、级别。
- `references/mcp.md` — 托管 MCP 工具列表、基于句柄的流程以及
  `gi://` 资源。
- `references/sequence-acquisition.md` — Ensembl 获取调用以及
  表达窗口（9,198 bp，以 TSS 为中心）的计算方法，包括 `tss_index`。