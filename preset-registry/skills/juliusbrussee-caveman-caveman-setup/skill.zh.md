---
name: caveman-setup
description: >
  Wire a repository through the Caveman Cloud gateway so every LLM request is
  measured, with no behavior change. Use for "set up caveman" or adding LLM
  spend observability.
---
你正在通过 Caveman 网关接入此仓库。Caveman 是一个保留字节的 LLM 代理：在记录模式下，它会衡量你的应用发送了什么以及产生的成本，除此之外不做任何改动。你的任务是完成一次最小化且经过验证的集成——而不是重构。

引导你来到这里的提示提供了四个值。请将它们称为：

- `GATEWAY` — 网关基础 URL（例如 `https://gateway.caveman.so` 或 `http://127.0.0.1:8787`）
- `CAVE_API_KEY` — 网关认证密钥（像对待任何 API 密钥一样：仅使用环境变量，绝不提交，绝不完整打印）
- `PROVIDER_KEYS` — `stored`（提供商密钥加密存储在 Caveman Cloud 中）或 `byok`（此应用在每个请求中发送自己的提供商密钥）
- `DASHBOARD` — 仪表板基础 URL（例如 `https://app.caveman.so`）

如果缺少任何值，请停止并询问该值。不要猜测 URL，也不要生成密钥。

## 规则（不可妥协）

1. **集成必须连贯。** 通过现有配置和负责的衔接点接入每一个实际运行的 LLM 调用点。只修改正确性所需的每一层。不要顺手进行重构或统一格式；只有在能够明确所有权或降低生命周期成本时，才添加抽象。
2. **密钥必须保存在环境变量中。** 将 `CAVE_API_KEY` 写入仓库已经使用的环境文件（`.env`、`.env.local` 等）。如果该文件未被 git 忽略，请将其添加到 `.gitignore`，并说明这一点。绝不要将密钥硬编码到源代码中。
3. **只报告实际观察到的结果。** 最终报告必须说明真实验证响应中的 HTTP 状态和用量数字——绝不能假设成功。如果验证失败，则改用末尾文件中的失败模板进行报告。
4. **仅使用记录模式。** 你是在添加测量功能。不要启用任何优化，也不要声称有任何节省——在明确启用优化器并通过其评估门槛之前，经过验证的节省金额均为 $0。
5. **不要处理提供商密钥。** 使用 `PROVIDER_KEYS: stored` 时，你不会看到提供商密钥。使用 `byok` 时，应用现有的提供商密钥必须原封不动地保留在原有位置。

## 第 1 步——查找每一个实际运行的 LLM 调用点

读取依赖文件（`package.json`、`requirements.txt`、`pyproject.toml`、`go.mod`、锁定文件），并搜索源代码中的 LLM 客户端：

- SDK 导入：`openai`、`@anthropic-ai/sdk`、`anthropic`、`ai` + `@ai-sdk/*`（Vercel）、`langchain*`、`litellm`、`google-genai` / `@google/genai`、`crewai`、`pydantic_ai`、`openai-agents` / `agents`
- 指向 `api.openai.com`、`api.anthropic.com`、`generativelanguage.googleapis.com` 的原始 HTTP 请求
- 现有的 base URL 环境变量：`OPENAI_BASE_URL`、`OPENAI_API_BASE`、`ANTHROPIC_BASE_URL`、`GEMINI_BASE_URL`、`GOOGLE_GEMINI_BASE_URL`

在进行任何修改之前，列出你找到的内容（每个调用点一行，格式为 file:line）。如果你**没有**找到任何 LLM 调用点，请停止，并在文件末尾使用“无需接入”模板进行报告——不要臆造集成。

## 第 2 步——选择应用 slug

一个 slug 用于在网关路径中标识此应用：`GATEWAY/w/<app>`。根据包名/模块名推导该 slug（例如 `support-bot`、`acme-api`）。规则：首字符为小写 `[a-z0-9]`，后续字符为 `[a-z0-9._-]`，最长 64 个字符。整个应用的支出会在仪表板上归入该 slug。

## 第 3 步 — 接入每个调用点

模式始终相同：**基础 URL → 网关，并添加 `/w/<app>`，
再加一个身份验证标头。** 网关身份验证使用 `x-cave-api-key: CAVE_API_KEY`
（在标头不便添加的场景中，`Authorization: Bearer CAVE_API_KEY` 也可用）。
使用 `PROVIDER_KEYS: byok` 时，还要发送 `x-cave-upstream-key: <the provider key
the app already uses>`。

有两个事实可以确保接入是安全的（两者都由网关强制执行，而不是靠假设）：
网关会从头重建上游身份验证标头，因此客户端的
`Authorization`/`x-api-key` 值绝不会被转发给提供商；而在 `stored` 模式下，上游身份验证信息会在服务端从加密连接中获取。因此在
`stored` 模式下，如果某个 SDK 强制要求提供 api-key 参数，请将其设置为
Cave key — 它只用于对网关进行身份验证，不会继续向下传递。

具体格式（为每个调用点使用与其匹配的格式 — 这些是产品发布的配置方式，而不是建议）：

**OpenAI SDK (TS)** — Chat Completions 和 Responses 都通过以下方式路由：
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

**OpenAI SDK (Python)** — 格式相同：`base_url=f"{gw}/w/<app>/openai/v1"`，
`default_headers={"x-cave-api-key": ..., "x-cave-upstream-key": ...}`。

**Anthropic SDK (TS/Python)** — SDK 会自行追加 `/v1/messages`。这里在两种模式下都必须提供
`x-cave-api-key` 标头（该 SDK 自身的 key 参数会放入 `x-api-key`，而这不是网关身份验证标头）：
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

**Vercel AI SDK** — `createOpenAICompatible({ baseURL: `${gw}/w/<app>/openai/v1`,
headers: { "x-cave-api-key": ... } })`；Anthropic 模型则使用
`createAnthropic({ baseURL: `${gw}/w/<app>/v1`, headers: { ... } })`。

**LangChain / LangGraph** — `ChatOpenAI(base_url=f"{gw}/w/<app>/openai/v1",
default_headers={...})`；`ChatAnthropic(base_url=f"{gw}/w/<app>",
default_headers={...})`。LangGraph 会继承你传入的模型的所有配置。

**LiteLLM** — 每次调用时使用 `api_base=f"{gw}/w/<app>/openai/v1"` +
`extra_headers={...}`，或者在 LiteLLM 代理的 `config.yaml` 中对整个服务集群进行配置。

**原始 HTTP / 其他任何方式** — 替换主机，保留提供商的原生路径：
`GATEWAY/w/<app>/v1/chat/completions`（OpenAI 协议）或
`GATEWAY/w/<app>/v1/messages`（Anthropic 协议），并添加相应的标头。

具体来说，使用 slug `support-bot` 和托管网关时，OpenAI-SDK 的基础
URL 为 `https://gateway.caveman.so/w/support-bot/openai/v1`。此外，在
`stored` 模式下，完整删除所有 `x-cave-upstream-key` 行 — 它仅适用于 byok。

对于未列出的框架（google-genai、crewai、pydantic-ai、openai-agents），
获取 `<docs origin>/docs/integrations/` 下对应的页面 — 使用该 skill 来源的同一 origin
并遵循其中的说明。

添加到仓库的 env 文件中（并从代码中引用 — 不要使用字面量）：

```text
CAVE_GATEWAY_URL=<GATEWAY>
CAVE_API_KEY=<CAVE_API_KEY>
```

## 第 4 步 — 使用一次真实请求进行验证

用户粘贴的设置提示正是为了授权这一次操作：发送一个小型
验证请求。现在就发送 — 不要暂停下来请求许可。
由于犹豫而导致集成最终未经验证，其结果比发送一次微小请求更糟；自主完成验证和报告正是此 skill 的目的。

通过你刚刚构建的连接发送一个最小请求 — 如果应用有脚本，则使用应用自身最便宜的路径；否则使用 curl，**并且必须使用与你刚刚接入的协议匹配的路径**，以及应用自身的模型和较小的上限
（`max_tokens` ≤ 32）：

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

（byok：添加 `-H "x-cave-upstream-key: $PROVIDER_KEY"`。）这是一次真实的、
会产生费用的提供商请求 — 这正是目的：真实流量，真实测量。

读取响应。成功 = HTTP 200 且包含 `usage` 块。其他任何情况 =
使用下面对应的失败模板。

## 第 5 步 — 报告

结束时必须严格使用以下格式，并根据你实际执行和观察到的内容填写值：

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

## 失败模板（原样使用，填入内容 — 绝不要弱化措辞）

- **Nothing to wire**："I found no LLM callsites in this repo (searched SDKs,
  raw provider HTTP, base-URL env vars). If this repo runs a coding agent
  rather than shipping LLM code, use `caveman wrap <agent>` instead — see
  <DASHBOARD>/getting-started."
- **Gateway unreachable**："The verification request could not reach GATEWAY
  (<error>). Wiring is in place but unverified — nothing will be measured
  until the gateway is reachable. Check the URL and network, then re-run the
  verification curl above."
- **401 cave_invalid_api_key**："The gateway rejected CAVE_API_KEY. Mint a new
  key at <DASHBOARD>/getting-started and update the env file; the wiring
  itself is unchanged."
- **404 cave_route_not_found**："The gateway matched no route — usually a
  malformed /w/<app> slug (lowercase [a-z0-9] first, then [a-z0-9._-], max 64)
  or a path that doesn't match the SDK's protocol. Fix the URL and re-verify."
- **Provider error (4xx/5xx via gateway)**：逐字报告状态和正文；网关可访问且鉴权已通过，上游调用失败 — 通常是应用本身的提供商密钥或模型名称问题。

绝不要将其中任何一项报告为成功。未经验证的集成应报告为“未经验证”。