---
name: genomic-intelligence
description: "Predict regulatory features, gene structure, and expression directly from DNA sequence using Genomic Intelligence's hosted transformer DNA language models — no local GPU or model weights. Six tasks over a REST API and a hosted MCP server (keyless public demo): promoter regions, splice donor/acceptor sites, enhancer activity, chromatin state, sequence-to-expression (log TPM), and de-novo gene annotation, plus a composite find-genes-then-predict-expression workflow. Use when the user has a gene symbol, a genomic region, or a DNA/FASTA sequence and wants any of these predictions, mentions Genomic Intelligence, genomicintelligence.ai, api.genomicintelligence.ai, or mcp.genomicintelligence.ai."
license: MIT
compatibility: Python 3.10+ with the `requests` library for the REST path (no dedicated SDK). Network access required. The REST `/v1` API needs a `GI_API_KEY` (a `gi_` bearer); the hosted MCP server at mcp.genomicintelligence.ai/mcp works keyless against a capped public demo quota, key optional.
metadata:
  version: "1.0"
  skill-author: Genomic Intelligence
  trigger-keywords: DNA sequence prediction, regulatory genomics, promoter prediction, splice site prediction, enhancer activity, chromatin state, gene expression prediction, sequence to expression, log TPM, gene annotation, transcript prediction, DNA language model, genomic intelligence, hosted inference, Ensembl sequence, FASTA prediction, cis-regulatory, TSS window, DeepSEA, DeepSTARR, BigBird splice, MCP genomics
  openclaw:
    primaryEnv: GI_API_KEY
    envVars:
    - name: GI_API_KEY
      required: false
      description: Optional gi_ bearer key for the REST /v1 API and a higher MCP quota. The hosted MCP demo runs keyless; request a key at contact@genomicintelligence.ai.
---
# 基因组智能 — DNA 序列模型

Genomic Intelligence (GI) 在托管 GPU 上为六项序列分析任务提供 transformer DNA 语言模型服务。向它提供一个**基因符号**、一个**基因组区域**或一段 **DNA/FASTA 序列**；它会返回结构化预测结果——启动子区域、剪接位点、增强子活性、染色质状态、表达量（log TPM）以及从头基因注释。所有操作均不在本地运行：无需模型权重、GPU 或庞大的 Python 技术栈。它只是托管式、版本化推理 API 的轻量客户端。

**官方文档：** [docs.genomicintelligence.ai](https://docs.genomicintelligence.ai) ·
REST 合约见 [api.genomicintelligence.ai/v1/openapi.json](https://api.genomicintelligence.ai/v1/openapi.json) ·
托管 MCP 服务器位于 `https://mcp.genomicintelligence.ai/mcp`

## 何时使用此技能

当用户拥有 DNA 并希望获取模型预测时，使用 GI：

- **查找启动子**：在基因组区域中查找（`promoter`）
- **预测剪接**：供体/受体位点（`splice`）
- **评估增强子活性**：发育相关和管家基因（`enhancer`）
- **注释染色质状态**：跨数百个轨道进行注释（`chromatin`）
- **预测表达量**：根据序列和细胞类型上下文预测 log(TPM+1)（`expression`）
- **注释基因/转录本**：从头注释，无需参考序列（`annotation`）
- **查找区域内的基因并预测每个基因的表达量**（组合任务）

不适用于本地比对、变异检测或文件 I/O——这些任务请使用本地工具
（BioPython、bcftools）。GI 用于**基于序列的模型推理**。

> 用于研究和开发，**不得用于临床或诊断决策**。

## 调用 GI 的两种方式

### 托管 MCP 服务器（最适合 AI 智能体——无需密钥）

GI 在 `https://mcp.genomicintelligence.ai/mcp` 托管了一个 MCP 服务器（可流式传输的
HTTP）。当你的智能体宿主支持 MCP 时，优先使用它：它可以在无需密钥的情况下使用
受限的公开演示配额（零配置），而可选的 `gi_` bearer key 可以提高配额。它提供用于获取数据的工具，这些工具会返回一个**序列句柄**
（`sequence_ref`），而 `predict_*` 工具接受该句柄——因此大型序列不会使上下文膨胀。请参阅下方的
[MCP 工作流](#mcp-workflow-handle-based)和
`references/mcp.md`。

### REST API（通用方式）

通过 `requests` 对 `https://api.genomicintelligence.ai/v1` 发起普通 HTTP 请求。REST 路径**需要**
一个 `GI_API_KEY`（`gi_` bearer）。可在任何主机或脚本中使用它，或者在需要原始封装时使用。请参阅[核心 REST 工作流](#core-rest-workflow)。

## 访问与身份验证

1. **托管 MCP 演示无需密钥**——无需设置任何内容即可试用。
2. **REST `/v1` API 需要密钥**，通过 `Authorization: Bearer <key>` 发送。
   请通过 [contact@genomicintelligence.ai](mailto:contact@genomicintelligence.ai) 申请。
3. **绝不要将密钥硬编码。** 从 `GI_API_KEY` 环境变量中读取（或通过 `python-dotenv` 从 `.env` 中读取）。绝不要提交密钥。

```bash
export GI_API_KEY="gi_yourkeyhere"     # optional for MCP; required for REST
export GI_BASE_URL="https://api.genomicintelligence.ai"   # override for staging
```

密钥按合作伙伴层级进行限定，并设有并发数和每分钟上限。`429`
表示你触达了上限——请退避并重试，或请求 GI 提升你的层级。

## 六项任务

所有 REST 任务共用同一种形式：`POST /v1/tasks/{task}/predict`，请求体为
`{sequence, sequence_name, model?, options?}`，返回一个 `{data, meta}`
封装。各任务的差异如下：

| 任务 | 模式 | 长度限制 | 说明 |
|---|---|---|---|
| `promoter` | 同步 | 1–500,000 bp | 滑动窗口启动子区域 |
| `splice` | 同步 | 1–500,000 bp | 供体/受体位点（长上下文 BigBird） |
| `enhancer` | 同步 | 1–500,000 bp | 发育 + 管家基因评分（DeepSTARR，*Drosophila*） |
| `chromatin` | 同步 | 1–500,000 bp | 数百条轨迹（DeepSEA） |
| `expression` | 同步 | **恰好 9,198 bp** | log(TPM+1)；需要细胞类型 `description` |
| `annotation` | **异步** | 1–500,000 bp | 从头转录本；提交 + 轮询 |

**省略 `model`，API 会使用该任务的默认模型**——这是推荐的调用方式。默认模型 ID
在此处特意**不予记录**：默认值会发生变化，已退役的 ID 会直接失败，因此绝不要硬编码模型
ID。若要固定模型，或选择非人类模型（多个任务提供果蝇、酵母和拟南芥模型），请在调用时使用
`GET /v1/tasks/{task}/models`（REST）或 `list_models`（MCP）发现 ID——并且**绝不要凭空编造 ID**。每项任务的完整输出结构见
`references/tasks.md`。

模型会强制执行两条规则：

- **`expression` 需要恰好 9,198 bp**，并且窗口必须**以 TSS 为中心**
  （上游 4,599 bp + TSS + 下游 4,598 bp）。任何其他长度都会被拒绝。请使用下面的序列获取辅助工具来
  构建该窗口——不要手动截断。
- **`expression` 需要 `description`**——一个细胞类型 / 检测字符串（例如
  `"K562 cells"`），作为 `options.description` 传入。

## 序列获取

你很少会从一个原始的 9,198 bp 字符串开始。请先获取序列：

- **从基因符号获取** → MCP `fetch_ensembl_sequence(gene=...)`；**从
  坐标获取** → `fetch_region(region=...)`。两者都会获取公开的 Ensembl 参考
  序列（无需密钥）。REST 用户可以直接查询 Ensembl REST。（`find_genes` 是注释任务，而非序列获取工具。）
- **对于 `expression`** → 使用以 TSS 为中心的获取方式，使窗口恰好为
  9,198 bp。MCP：`fetch_gene_for_expression`（负责居中）。不要手动构建窗口。
- **从本地 FASTA 获取** → MCP `store_inline_sequence`，或在 REST 中自行读取文件。（`load_local_fasta` 仅存在于本地部署中，托管服务器不提供。）
- **获取演示序列** → MCP `load_demo_sequence(name=...)` 返回一个可直接使用的句柄（非常适合进行无需密钥的冒烟测试）；`name` 为必填项。

有关准确的 Ensembl 调用方式和表达窗口计算公式，请参阅
`references/sequence-acquisition.md`。

## 核心 REST 工作流

同步任务（promoter、splice、enhancer、chromatin、expression）只需一次调用：

```python
import os, requests

BASE = os.environ.get("GI_BASE_URL", "https://api.genomicintelligence.ai")
HEADERS = {"Authorization": f"Bearer {os.environ['GI_API_KEY']}"}

def predict(task, sequence, sequence_name, model=None, options=None):
    body = {"sequence": sequence, "sequence_name": sequence_name}
    if model:   body["model"] = model
    if options: body["options"] = options
    r = requests.post(f"{BASE}/v1/tasks/{task}/predict", headers=HEADERS, json=body)
    r.raise_for_status()          # 400 invalid; 401 no/bad key; 413 too long; 429 rate limit
    return r.json()               # {"data": {...}, "meta": {...}}

# Promoter:
out = predict("promoter", seq, "TP53_region")
print(out["data"]["summary"])

# Expression — exactly 9,198 bp + a cell-type description:
out = predict("expression", tss_window_9198bp, "HBB",
              options={"description": "K562 cells"})
print(out["data"]["prediction"]["expression_log_tpm"])
```

### 异步：annotation

`annotation` 是提交后轮询。发送 `Prefer: respond-async`，获取 `job_id`，
持续轮询直到终止状态：

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

在 MCP 主机上，先获取句柄，然后针对该句柄进行预测——序列不会进入
上下文：

```
# 1. Acquire a sequence handle (each returns a sequence_ref):
load_demo_sequence(name="promoter_tp53")  # keyless smoke test; `name` is REQUIRED
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

## 组合操作：查找基因，然后预测表达

要回答“该区域内有哪些基因，以及它们如何表达？”，请使用组合操作：

- **MCP：** `find_genes_and_predict_expression(sequence_ref=..., description=...)`
  ——接受**句柄，而不是区域**（先使用 `fetch_region` 获取句柄）；
  `description` 是必需的。查找序列中的基因，并返回每个基因的表达预测。
- **REST：** 调用基因发现接口，然后为每个基因循环调用 `expression`（通过序列获取辅助工具为每个基因构建以 TSS 为中心的 9,198 bp 窗口）。

## 错误

| 代码 | 含义 | 操作 |
|---|---|---|
| 400 | 请求无效 / 序列错误 | 检查请求正文；expression 必须恰好为 9,198 bp，并携带 `description` |
| 401 | 缺少/无效的密钥（REST） | 设置 `GI_API_KEY`；或使用无需密钥的 MCP 演示 |
| 413 | 序列过长 | 保持在任务的长度限制内（≤500,000 bp） |
| 429 | 速率 / 并发上限 | 降低请求频率并重试；请求 GI 提高你的层级 |
| 422 | 验证失败（`validation_failed`） | 最常见的失败原因：expression 不是恰好 9,198 bp，或序列短于模型的最小长度 |
| 5xx | 服务器错误 | 重试；如果问题持续存在，请联系支持团队 |

## 参考文件

- `references/tasks.md` — 每项任务的输出形状、模型注册表、异步
  注解契约。
- `references/api-and-auth.md` — REST 端点、`{data, meta}` 封装、
  身份验证、基础 URL 覆盖、层级。
- `references/mcp.md` — 托管的 MCP 工具列表、基于句柄的流程，以及
  `gi://` 资源。
- `references/sequence-acquisition.md` — Ensembl 获取调用，以及
  表达窗口（9,198 bp，以 TSS 为中心）的计算方法。