---
name: caveman-setup
description: >
  Wire the current repository through the Caveman Cloud gateway so every LLM
  request is measured — cost, tokens, latency — with zero behavior change.
  Use when the user pastes the Caveman setup prompt, says "set up caveman",
  or wants LLM spend observability added to an app. Requires the gateway URL
  and a Cave API key (the setup prompt carries both).
---
你正在通过 Caveman 网关接线该仓库。Caveman 是一个字节级保留的 LLM 代理：在 record 模式下，它会衡量你的应用发送了什么以及花费了多少，并且不修改其他任何内容。你的任务是进行最小化且已验证的集成——不是重构。

把你来到这里的提示里给你的四个值记为：

- `GATEWAY` — 网关基础 URL（例如 `https://gateway.caveman.so` 或 `http://127.0.0.1:8787`）
- `CAVE_API_KEY` — 网关认证密钥（像所有 API key 一样处理：仅环境变量，切勿提交，也不要完整打印）
- `PROVIDER_KEYS` — `stored`（供应商密钥存于 Caveman Cloud）或 `byok`（本应用对每个请求发送自己的供应商密钥）
- `DASHBOARD` — 仪表盘基础 URL（例如 `https://app.caveman.so`）

如果任一值缺失，请停止并索要。不要猜测 URL 或伪造密钥。

## 规则（不可协商）

1. **一致的集成。** 通过现有配置和有责任边界的接入点，将每个真实的 LLM 调用点接入。触及每一层时，保证正确性。不要进行顺手改动或格式化清理；只有当它能澄清所有权边界或降低生命周期成本时，才新增抽象。
2. **密钥保留在环境变量中。** `CAVE_API_KEY` 写入仓库已在使用的环境文件（`.env`、`.env.local`，等等）。如果该文件未被 gitignore，请将其加入 `.gitignore` 并说明原因。不要在源码中硬编码该密钥。
3. **只汇报你观察到的内容。** 最终报告要写明真实验证响应中的 HTTP 状态和用量数字——绝不能假设成功。如果验证失败，请改为报告失败模板。
4. **仅记录模式。** 你只是在增加测量能力。你既不启用任何优化，也不声称任何节省——在显式开启优化器并通过其评估门槛之前，已验证的节省均为 $0。
5. **供应商密钥不归你处理。** 当 `PROVIDER_KEYS: stored` 时你不会看到供应商密钥。当 `byok` 时，应用现有的供应商密钥必须准确保留在原位置。

## 第 1 步 — 查找每个真实 LLM 调用点

读取依赖文件（`package.json`、`requirements.txt`、`pyproject.toml`、`go.mod`、锁文件）并搜索源码中的 LLM 客户端：

- SDK 导入：`openai`、`@anthropic-ai/sdk`、`anthropic`、`ai` + `@ai-sdk/*`（Vercel）、`langchain*`、`litellm`、`google-genai` / `@google/genai`、`crewai`、`pydantic_ai`、`openai-agents` / `agents`
- 对 `api.openai.com`、`api.anthropic.com`、`generativelanguage.googleapis.com` 的原始 HTTP 调用
- 现有 base-URL 环境变量：`OPENAI_BASE_URL`、`OPENAI_API_BASE`、`ANTHROPIC_BASE_URL`、`GEMINI_BASE_URL`、`GOOGLE_GEMINI_BASE_URL`

在修改任何内容之前，先列出你找到的内容（按文件:行标注每个调用点）。如果你没有找到任何 LLM 调用点，停止并在本文末尾使用“nothing to wire”模板报告——不要凭空编造集成。

## 第 2 步 — 选择 app slug

一个 slug 用于在网关路径中标识该应用：`GATEWAY/w/<app>`。从包名/模块名推导它（例如 `support-bot`、`acme-api`）。语法规则：
首字符为小写 `[a-z0-9]`，之后为 `[a-z0-9._-]`，最长 64 个字符。在仪表盘下，整个应用组都应按该 slug 计费。

## 第 3 步 — 接线每个调用点

模式始终一致：**base URL → 网关并加上 `/w/<app>`，再加一个鉴权头。** 网关鉴权是 `x-cave-api-key: CAVE_API_KEY`（也可以使用 `Authorization: Bearer CAVE_API_KEY`，如果某个请求头不便设置）。当 `PROVIDER_KEYS: byok` 时，还要发送 `x-cave-upstream-key: <the provider key the app already uses>`。

有两个事实使接线安全（均由网关强制执行，而非“希望”）：
网关会从头重建上游鉴权头，因此客户端的 `Authorization`/`x-api-key` 值不会被转发到上游；并且在 `stored` 下，上游鉴权由服务端加密连接里提供。所以在 `stored` 模式下，如果某 SDK 要求传 api-key 参数，请将其设置为 Cave key——它用于网关鉴权，不会继续向下游传递。

精确形态（按每个调用点选择其一——以下为产品发布的配方，不是建议）：

**OpenAI SDK (TS)** — Chat Completions 和 Responses 都走：
```ts
const client = new OpenAI({
  baseURL: `${process.env.CAVE_GATEWAY_URL}/w/<app>/openai/v1`,
  apiKey: process.env.OPENAI_API_KEY,           // byok: unchanged · stored: use CAVE_API_KEY
  defaultHeaders: {
    "x-cave-api-key": process.env.CAVE_API_KEY!,
    // byok only:
    "x-cave-upstream-key": process.env.OPENAI_API_KEY!,
  },
});
```

**OpenAI SDK (Python)** — 形态相同：`base_url=f"{gw}/w/<app>/openai/v1"`、`default_headers={"x-cave-api-key": ..., "x-cave-upstream-key": ...}`。

**Anthropic SDK (TS/Python)** — SDK 自行拼接 `/v1/messages`。在这两种模式都必须提供 `x-cave-api-key` 头（该 SDK 的 key 参数走 `x-api-key`，这不是网关鉴权头）：
```python
client = anthropic.Anthropic(
    base_url=f"{os.environ['CAVE_GATEWAY_URL']}/w/<app>",
    api_key=os.environ["ANTHROPIC_API_KEY"],      # byok: unchanged · stored: use CAVE_API_KEY
    default_headers={
        "x-cave-api-key": os.environ["CAVE_API_KEY"],
        # byok only:
        "x-cave-upstream-key": os.environ["ANTHROPIC_API_KEY"],
    },
)
```

**Vercel AI SDK** — `createOpenAICompatible({ baseURL: `${gw}/w/<app>/openai/v1`, headers: { "x-cave-api-key": ... } })`；Anthropic 模型通过 `createAnthropic({ baseURL: `${gw}/w/<app>/v1`, headers: { ... } })`。

**LangChain / LangGraph** — `ChatOpenAI(base_url=f"{gw}/w/<app>/openai/v1", default_headers={...})`；`ChatAnthropic(base_url=f"{gw}/w/<app>", default_headers={...})`。LangGraph 会继承你传入的 model。

**LiteLLM** — 每次调用使用 `api_base=f"{gw}/w/<app>/openai/v1"` + `extra_headers={...}`，或在 LiteLLM proxy `config.yaml` 中进行 fleet-wide 配置。

**Raw HTTP / 其他任意形式** — 替换 host，保留供应商原生路径：
`GATEWAY/w/<app>/v1/chat/completions`（OpenAI 协议）或 `GATEWAY/w/<app>/v1/messages`（Anthropic 协议），并添加对应头。

具体来说，slug 为 `support-bot` 且使用托管网关时，OpenAI SDK 的 base URL 为 `https://gateway.caveman.so/w/support-bot/openai/v1`。而在 `stored` 模式下，去掉所有 `x-cave-upstream-key` 行——该字段仅在 byok 下使用。

对于未列出的框架（google-genai、crewai、pydantic-ai、openai-agents），请抓取同一来源下
`<docs origin>/docs/integrations/` 的对应页面并按其执行。

将以下内容添加到仓库的 env 文件中（并在代码中引用——不可使用字面量）：

```
CAVE_GATEWAY_URL=<GATEWAY>
CAVE_API_KEY=<CAVE_API_KEY>
```

## 第 4 步 — 用一次真实请求进行验证

用户粘贴了该设置提示，目的是明确授权仅此一次：一个小型校验请求。请立即发送——不要暂停去征求许可。一个未验证完而因为犹豫中断的集成，远不如发出一个小请求；完成验证和报告才是该 skill 的目标。

请发送一条最小请求，走你刚才搭好的接线：若应用有脚本则用其自有最便宜路径，否则按你刚接线的协议使用 curl，并使用应用自己的 model 与小 token 上限（`max_tokens` ≤ 32）：

```bash
# OpenAI-protocol wiring:
curl -sS "$CAVE_GATEWAY_URL/w/<app>/v1/chat/completions" \
  -H "x-cave-api-key: $CAVE_API_KEY" \
  -H "content-type: application/json" \
  -d '{"model":"<model the repo already uses>","max_tokens":16,"messages":[{"role":"user","content":"ping"}]}'

# Anthropic-protocol wiring:
curl -sS "$CAVE_GATEWAY_URL/w/<app>/v1/messages" \
  -H "x-cave-api-key: $CAVE_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"<model the repo already uses>","max_tokens":16,"messages":[{"role":"user","content":"ping"}]}'
```

(byok: add `-H "x-cave-upstream-key: $PROVIDER_KEY"`.) 这是一条真实、可计费的供应商请求——这正是目的：真实流量、真实计量。

读取响应。成功 = HTTP 200 且包含 `usage` 块。其他任何情况 = 采用对应失败模板。

## 第 5 步 — 报告

请以完全相同的形状结束，并使用你实际做了的事情和看到的内容填充数值：

``` 
## Caveman is live in this repo

Wired: <n> callsite(s) in <n> file(s)
  - <file> — <one-line what changed>
App slug: <app> — spend for this app groups under it
Verified: HTTP 200 · model <model> · <in> in / <out> out tokens (one real request)
Mode: record — measured only. No model-visible bytes changed, no optimization
enabled. Verified savings are $0 until you turn an optimizer on and it passes
its eval gate. That honesty is the product.

See the dollars: <DASHBOARD>/traces — your request is the top row, priced from
the public catalog. <DASHBOARD>/getting-started flips to "First request received."

Want spend split by workflow (e.g. support-reply vs nightly-digest), not just
by app? Say "discover workflows" — I'll fetch <docs origin>/docs/discover-workflows.md
and label every callsite by the job it does.
```

## 失败模板（按原文逐字使用，填充后请勿软化）

- **Nothing to wire**: "I found no LLM callsites in this repo (searched SDKs,
  raw provider HTTP, base-URL env vars). If this repo runs a coding agent
  rather than shipping LLM code, use `caveman wrap <agent>` instead — see
  <DASHBOARD>/getting-started."
- **Gateway unreachable**: "The verification request could not reach GATEWAY
  (<error>). Wiring is in place but unverified — nothing will be measured
  until the gateway is reachable. Check the URL and network, then re-run the
  verification curl above."
- **401 cave_invalid_api_key**: "The gateway rejected CAVE_API_KEY. Mint a new
  key at <DASHBOARD>/getting-started and update the env file; the wiring
  itself is unchanged."
- **404 cave_route_not_found**: "The gateway matched no route — usually a
  malformed /w/<app> slug (lowercase [a-z0-9] first, then [a-z0-9._-], max 64)
  or a path that doesn't match the SDK's protocol. Fix the URL and re-verify."
- **Provider error (4xx/5xx via gateway)**: report status + body verbatim; the
  gateway is reachable and auth passed, the upstream call failed — usually a
  provider key or model-name issue in the app itself.

Never report success on any of these. An unverified integration is reported as
unverified。
