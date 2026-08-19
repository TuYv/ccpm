---
name: adaptyv
description: "How to use the Adaptyv Bio Foundry API and Python SDK for protein experiment design, submission, and results retrieval. Use this skill whenever the user mentions Adaptyv, Foundry API, protein binding assays, protein screening experiments, BLI/SPR assays, thermostability assays, or wants to submit protein sequences for experimental characterization. Also trigger when code imports `adaptyv`, `adaptyv_sdk`, or `FoundryClient`, or references `foundry-api-public.adaptyvbio.com`."
license: MIT
compatibility: Requires Python 3.10+, an Adaptyv Foundry account, and an API key from foundry.adaptyvbio.com. Install adaptyv-sdk from GitHub with uv pip install.
metadata:
  version: "1.2"
  skill-author: K-Dense Inc.
---
# Adaptyv Bio Foundry API

Adaptyv Bio 是一个云实验室，可将蛋白质序列转化为实验数据。用户通过 API 或 UI 提交氨基酸序列；Adaptyv 的自动化实验室运行检测（结合、热稳定性、表达、荧光），并在约 21 天内交付结果。

**官方文档：** [docs.adaptyvbio.com/api-reference](https://docs.adaptyvbio.com/api-reference) · [llms.txt 索引](https://docs.adaptyvbio.com/llms.txt) · [OpenAPI 规范](https://foundry-api-public.adaptyvbio.com/api/v1/openapi.json)

## 快速开始

**基础 URL：** `https://foundry-api-public.adaptyvbio.com/api/v1`

**身份验证：** 在 `Authorization` header 中使用 Bearer token。Token 可从 [foundry.adaptyvbio.com](https://foundry.adaptyvbio.com/) 侧边栏获取。

编写代码时，始终从环境变量 `ADAPTYV_API_KEY` 或 `.env` 文件中读取 API key — 切勿将 token 硬编码。首先检查项目根目录中是否存在 `.env` 文件；如果存在，请使用 `python-dotenv` 等库加载它。

[官方 API 文档](https://docs.adaptyvbio.com/api-reference/api-introduction) 在 curl 示例中使用 `FOUNDRY_API_TOKEN`；它与同一个 bearer token，— 为了与 SDK 保持一致，在 Python 和新的 shell 脚本中优先使用 `ADAPTYV_API_KEY`。

```bash
export ADAPTYV_API_KEY="abs0_..."
curl https://foundry-api-public.adaptyvbio.com/api/v1/targets?limit=3 \
  -H "Authorization: Bearer $ADAPTYV_API_KEY"
```

除 `GET /openapi.json` 外，每个请求都需要身份验证。将 token 存储在环境变量或 `.env` 文件中 — 切勿将其提交到源代码管理系统。

## Python SDK

**版本说明：** `adaptyv-sdk` **0.1.0**（beta）尚未发布到 PyPI — 请从 GitHub 安装：

```bash
uv pip install "git+https://github.com/adaptyvbio/adaptyv-sdk.git"
```

在包含 `pyproject.toml` 的项目中：

```bash
uv add "adaptyv-sdk @ git+https://github.com/adaptyvbio/adaptyv-sdk.git"
```

**环境变量**（在 shell 或 `.env` 文件中设置）：

```bash
ADAPTYV_API_KEY=your_api_key
ADAPTYV_API_URL=https://foundry-api-public.adaptyvbio.com/api/v1
ADAPTYV_ORGANIZATION_ID=your_org_id  # optional
```

当未显式传入时，`@lab.experiment` 装饰器和 `FoundryClient` 都会从环境中读取 `ADAPTYV_API_KEY` 和 `ADAPTYV_API_URL`。

### 装饰器模式

```python
from adaptyv import lab

@lab.experiment(target="PD-L1", experiment_type="screening", method="bli")
def design_binders():
    return {"design_a": "MVKVGVNG...", "design_b": "MKVLVAG..."}

result = design_binders()
print(f"Experiment: {result.experiment_url}")
```

### 客户端模式

```python
import os
from adaptyv import FoundryClient

client = FoundryClient(
    api_key=os.environ["ADAPTYV_API_KEY"],
    base_url=os.environ.get(
        "ADAPTYV_API_URL",
        "https://foundry-api-public.adaptyvbio.com/api/v1",
    ),
)

# Browse targets
targets = client.targets.list(search="EGFR", selfservice_only=True)

# Estimate cost
estimate = client.experiments.cost_estimate({
    "experiment_spec": {
        "experiment_type": "screening",
        "method": "bli",
        "target_id": "target-uuid",
        "sequences": {"seq1": "EVQLVESGGGLVQ..."},
        "n_replicates": 3
    }
})

# Create and submit
exp = client.experiments.create({...})
client.experiments.submit(exp.experiment_id)

# Later: retrieve results
results = client.experiments.get_results(exp.experiment_id)
```

## 实验类型

| 类型 | 方法 | 测量指标 | 需要靶标 |
|---|---|---|---|
| `affinity` | `bli` 或 `spr` | KD、kon、koff 动力学 | 是 |
| `screening` | `bli` 或 `spr` | 是否结合 | 是 |
| `thermostability` | — | 熔解温度 (Tm) | 否 |
| `expression` | — | 表达产量 | 否 |
| `fluorescence` | — | 荧光强度 | 否 |

## 实验生命周期

```
Draft → WaitingForConfirmation → QuoteSent → WaitingForMaterials → InQueue → InProduction → DataAnalysis → InReview → Done
```

| 状态 | 执行方 | 描述 |
|---|---|---|
| `Draft` | 你 | 可编辑，不产生费用承诺 |
| `WaitingForConfirmation` | Adaptyv | 审核中，正在准备报价 |
| `QuoteSent` | 你 | 审核并确认报价 |
| `WaitingForMaterials` | Adaptyv | 基因片段和靶标已下单 |
| `InQueue` | Adaptyv | 材料已到达，已排入实验室队列 |
| `InProduction` | Adaptyv | 测定正在运行 |
| `DataAnalysis` | Adaptyv | 正在处理原始数据并执行 QC |
| `InReview` | Adaptyv | 最终验证中 |
| `Done` | 你 | 结果可用 |
| `Canceled` | 任一方 | 实验已取消 |

实验上的 `results_status` 字段记录以下状态：`none`、`partial` 或 `all`。

## 常见工作流

### 1. 提交结合筛选（分步操作）

```python
# 1. Find a target
targets = client.targets.list(search="EGFR", selfservice_only=True)
target_id = targets.items[0].id

# 2. Preview cost
estimate = client.experiments.cost_estimate({
    "experiment_spec": {
        "experiment_type": "screening",
        "method": "bli",
        "target_id": target_id,
        "sequences": {"seq1": "EVQLVESGGGLVQ...", "seq2": "MKVLVAG..."},
        "n_replicates": 3
    }
})

# 3. Create experiment (starts as Draft)
exp = client.experiments.create({
    "name": "EGFR binder screen batch 1",
    "experiment_spec": {
        "experiment_type": "screening",
        "method": "bli",
        "target_id": target_id,
        "sequences": {"seq1": "EVQLVESGGGLVQ...", "seq2": "MKVLVAG..."},
        "n_replicates": 3
    }
})

# 4. Submit for review
client.experiments.submit(exp.experiment_id)

# 5. Poll or use webhooks until Done
# 6. Retrieve results
results = client.experiments.get_results(exp.experiment_id)
```

### 2. 自动化流程（跳过草稿 + 自动接受报价）

```python
exp = client.experiments.create({
    "name": "Auto pipeline run",
    "experiment_spec": {...},
    "skip_draft": True,
    "auto_accept_quote": True,
    "webhook_url": "https://my-server.com/webhook"
})
# Webhook fires on each status transition; poll or wait for Done
```

### 3. 使用 Webhook

创建实验时传入 `webhook_url`。每次状态转换时，Adaptyv 都会向该 URL 发送 POST 请求，其中包含实验 ID、之前的状态和新的状态。

## 序列

- 简单格式：`{"seq1": "EVQLVESGGGLVQPGGSLRLSCAAS"}`
- 丰富格式：`{"seq1": {"aa_string": "EVQLVESGGGLVQ...", "control": false, "metadata": {"type": "scfv"}}}`
- 多链：使用冒号分隔符 — `"MVLS:EVQL"`
- 有效氨基酸：A、C、D、E、F、G、H、I、K、L、M、N、P、Q、R、S、T、V、W、Y（不区分大小写，存储时使用大写）
- 只能向处于 `Draft` 状态的实验中添加序列

## 过滤、排序和分页

所有列表端点都支持分页（`limit` 范围为 1-100，默认值为 50；`offset`）、搜索（针对名称字段的自由文本搜索）和排序。

**过滤**通过 `filter` 查询参数使用 S 表达式语法：
- 比较：`eq(field,value)`、`neq`、`gt`、`gte`、`lt`、`lte`、`contains(field,substring)`
- 范围/集合：`between(field,lo,hi)`、`in(field,v1,v2,...)`
- 逻辑：`and(expr1,expr2,...)`、`or(...)`、`not(expr)`
- Null：`is_null(field)`、`is_not_null(field)`
- JSONB：`at(field,key)` — 例如，`eq(at(metadata,score),42)`
- 类型转换：`float()`、`int()`、`text()`、`timestamp()`、`date()`

**排序**使用 `asc(field)` 或 `desc(field)`，以逗号分隔（最多 8 个）：
```
sort=desc(created_at),asc(name)
```

**示例：** `filter=and(gte(created_at,2026-01-01),eq(status,done))`

## 错误处理

所有错误均返回：
```json
{
  "error": "Human-readable description",
  "request_id": "req_019462a4-b1c2-7def-8901-23456789abcd"
}
```
`request_id` 也会出现在 `x-request-id` 响应标头中 — 联系支持团队时请附上它。

## Token 管理

Token 使用基于 Biscuit 的加密衰减机制。你可以通过 `POST /tokens/attenuate` 创建受限 Token，并按组织、资源类型、操作（read/create/update）和过期时间限定其作用范围。撤销 Token（`POST /tokens/revoke`）会同时撤销该 Token 及其所有后代 Token。

## 详细 API 参考

如需查看包含请求/响应 schema 的全部 32 个端点列表，请阅读 `references/api-endpoints.md`。