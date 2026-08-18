---
name: antseed-connect
description: Connect coding agents, AI SDKs, and LLM tools to the AntSeed buyer proxy. Use when configuring Claude Code, Codex, OpenCode, Pi, OpenClaw, Hermes, GenLayer Studio, Vercel AI SDK, LangChain, or raw HTTP to route inference through AntSeed at localhost:8377.
---
# AntSeed — 集成技能

> 此文件是 https://antseed.com/integrations 的代理可读配套文档。
> 它会准确告知任何 AI 代理（Claude、Codex、OpenClaw、Hermes、自定义代理）
> 如何将其选择的工具接入 AntSeed 点对点推理网络。

## AntSeed 是什么？

AntSeed 是一个 AI 推理点对点市场。买方运行一个小型本地守护进程（**买方代理**），该代理在
`http://localhost:8377` 提供 HTTP API，并支持三种面向调用方的 LLM API 协议：
Anthropic Messages、OpenAI Chat Completions 和 OpenAI Responses。
Legacy OpenAI Completions 在内部通过适配器转换支持。代理会从 DHT 发现服务提供方，将请求
路由到某个对等节点，并在需要时通过
`@antseed/api-adapter` 在协议之间进行转换，最后在 Base 上使用 USDC 完成结算。

需要注意，AntSeed 面向的是增值型 AI 服务（专用模型、代理、TEE、微调模型、托管工作流），
而不是 API 密钥或订阅访问权限的原始转售。服务提供方必须遵守上游服务条款。

从任何工具、SDK 或代理的角度来看，**AntSeed 就只是一个本地的 OpenAI/Anthropic 兼容端点**
——将 `base_url` 指向它即可完成配置。

## 术语表（心智模型）

- **买方代理** — 运行在 `localhost:8377` 上的本地服务器，接收工具发出的 API 调用并将其转发给 AntSeed 对等节点。你的编辑器 / 代理 / SDK 唯一会直接通信的对象就是它。
- **对等节点** — 出售推理服务的一方。每个对等节点都有一个 `peerId`（40 个字符的十六进制字符串）、一个显示名称和一组服务。使用 `antseed network browse` 列出。
- **服务** — 单个模型 id，例如 `claude-sonnet-4-6` 或 `deepseek-v4-flash`。
  *这是你在工具配置中作为 `model` 传入的值。* 每个服务都有自己的原生协议列表，以及自己的
  `in` / `cachedIn` / `out` 定价。
- **协议**（每个服务分别定义）— 服务**原生**接受的线格式，发布在每个对等节点的
  `providerServiceApiProtocols[provider].services[service]` 中。
  值包括 `anthropic-messages`、
  `openai-chat-completions`、`openai-responses`、`openai-completions`。**应将此字段
  与工具使用的线格式进行匹配。**如果工具的线格式在此列表中，请求会原样直接传递；否则，
  api-adapter 会即时进行转换。
- **缓存输入定价** — 对于跨请求重复使用的 token，服务会采用单独且低得多的费率（通常低
  4–10 倍）：系统提示词、工具 schema、之前的对话轮次、持续引用的长文件等。CLI 将其
  暴露为 `cachedInputUsdPerMillion`。对于长时间运行的代理和聊天机器人，这通常是成本中
  占比最高的一项。
- **固定节点（Pin）** — 告诉买方代理“将请求路由到*这个*对等节点”。在默认的手动流程中，
  不会自动选择对等节点；你必须选择一个对等节点、发送每请求固定节点标头，或使用执行选择
  的路由器插件启动代理。常见的显式路由方式：
  - **会话固定节点**：`antseed buyer connection set --peer <peerId>`。持久化在
    `~/.antseed/buyer.state.json` 中，并应用于每个请求，直到你进行更改。
  - **每请求标头**：每次调用时在 `x-antseed-pin-peer: <peerId>` 中指定。它会覆盖该请求的会话固定节点设置，并且完全不需要设置会话固定节点。
  - **模型前缀**：将 `model` 设置为 `<peerId>@<service>`。代理会使用此前缀固定对等节点，并且只将 `<service>` 转发给卖方。

如果同时存在 header 和模型前缀固定，header 会选择 peer；
  模型前缀仍会在路由前被剥离。
  在至少一种方式生效前，每个请求都会返回 `no_peer_pinned`。

## 通用设置（仅需执行一次）

### 选项 A — VPR 桌面应用（最简单）

从 https://antseed.com 下载 — 它在 GUI 中提供买方代理、钱包和
peer 浏览器。应用打开期间，代理可通过
`http://localhost:8377` 访问。

### 选项 B — CLI（无头环境 / 服务器 / 智能体）

```bash
# 1. Install
npm install -g @antseed/cli

# 2. Identity (an EVM private key — 64 hex chars). Save this somewhere safe;
#    you will reuse it across machines and it controls your USDC deposits.
export ANTSEED_IDENTITY_HEX=$(openssl rand -hex 32)
# SECURITY: never paste this key into chat, logs, GitHub issues, or a file
# committed to git. It controls the buyer identity and access to deposits.

# 3. Start the buyer proxy on :8377
antseed buyer start &

# 4. Browse the network and list every service (= model) each peer offers,
#    along with its native protocols and USD-per-1M-tokens pricing.
#    `service` is the model id you pass to your tool. `protocols` is the
#    wire format(s) the service accepts natively — match it against your
#    tool. `in` / `cachedIn` / `out` are fresh-input / cached-input / output.
antseed network browse --json --top 5 \
  | jq '.peers | map({
      peerId, name: .displayName,
      services: [
        (.providerServiceApiProtocols | to_entries[]) as $p
        | ($p.value.services | to_entries[]) as $s
        | {
            service:  $s.key,
            protocols: $s.value,
            in:       (.providerPricing[$p.key].services[$s.key].inputUsdPerMillion       // .providerPricing[$p.key].defaults.inputUsdPerMillion),
            cachedIn: (.providerPricing[$p.key].services[$s.key].cachedInputUsdPerMillion // null),
            out:      (.providerPricing[$p.key].services[$s.key].outputUsdPerMillion      // .providerPricing[$p.key].defaults.outputUsdPerMillion)
          }
      ]
    })'

# 5. Inspect one peer in detail. Use `matchingServices[]` for pricing/tags and
#    `peer.providerServiceApiProtocols` for native protocol support.
#    `cachedIn` is typically 4–10× cheaper than `in` and often dominates the
#    cost line for long-running agents and chatbots — always include it when
#    comparing peers.
antseed network peer <peerId> --json \
  | jq '{
      peer: (.peer | { peerId, name: .displayName,
                       sessions: .onChainChannelCount,
                       ghosts:   .onChainGhostCount }),
      services: [
        (.peer.providerServiceApiProtocols | to_entries[]) as $p
        | ($p.value.services | to_entries[]) as $s
        | (.matchingServices[] | select(.provider == $p.key and .service == $s.key)) as $m
        | {
            provider: $p.key,
            service: $s.key,
            protocols: $s.value,
            in:       $m.inputUsdPerMillion,
            cachedIn: $m.cachedInputUsdPerMillion,
            out:      $m.outputUsdPerMillion,
            tags:     $m.tags
          }
      ]
    }'

# 6. Pin a peer (session-wide). Until you do, every request returns
#    `no_peer_pinned` UNLESS the request includes an `x-antseed-pin-peer`
#    header (see Per-request peer selection below).
antseed buyer connection set --peer <peerId>

# 7. Verify the proxy advertises the services you expect
curl -s http://localhost:8377/v1/models | jq '.data[].id'

# 8. (Optional) Deposit USDC on Base for paid services
antseed payments  # opens portal at 127.0.0.1:3118?token=<hex> — connect a wallet, deposit USDC
```

### Agent 和部署的安全注意事项

- 将 `ANTSEED_IDENTITY_HEX` / `~/.antseed/identity.key` 视为热钱包密钥。
  切勿打印、粘贴到聊天中、提交，或将其复制到买方主机之外。
- 让买方代理绑定到 `127.0.0.1` / `localhost`。不要将
  `:8377` 直接暴露到公共互联网；如果其他进程必须远程访问，请使用 SSH 隧道或私有网络。
- 对于自主代理，从小额 USDC 存款和保守的储备上限开始。资金钱包在存款后无需保持连接。
- 如果某个工具需要 API key，请使用非机密占位符，例如 `antseed`；
  买方代理会改用本地身份密钥进行身份验证。

## 买方代理公开的端点

| 路径 | 线路格式 | 常见调用方 |
|------|-------------|----------------|
| `POST /v1/messages` | Anthropic Messages | Claude Code、Anthropic SDK、OpenClaw |
| `POST /v1/chat/completions` | OpenAI Chat Completions | Codex、Hermes、OpenAI SDK、Vercel AI SDK、LangChain、大多数工具 |
| `POST /v1/responses` | OpenAI Responses | Codex（较新的构建版本）、使用 Responses API 的工具 |

`@antseed/api-adapter` 支持全部四种协议（包括旧版
`openai-completions`）的转换，但只有上面的三个端点对调用方公开。
转换会自动进行：以一种格式到达的请求，如果被路由到其服务声明的
`protocols` 值不同的对等方，则会在两个方向上进行转换（请求和流式响应）。

买方代理不要求 `Authorization` header。它使用本地节点的身份密钥和链上 USDC 存款对对等方进行身份验证和付款。

### 按请求选择对等方（无需固定会话）

有两种方式可以告诉代理使用哪个对等方：

1. **会话固定** — `antseed buyer connection set --peer <peerId>`。会持久化到
   `~/.antseed/buyer.state.json`（`pinnedPeerId`），并应用于每个请求，直到你进行更改。
   最适合单租户设置（笔记本电脑、专用代理）。
2. **按请求设置 header** — 在每次调用中发送 `x-antseed-pin-peer: <peerId>`。
   仅对该请求覆盖会话固定。**如果每个请求都包含此 header，则完全无需调用
   `antseed buyer connection set`** — 代理会接受并路由这些请求。
   最适合脚本、调度程序和需要在每次调用中将请求分发到不同对等方的多租户部署。

示例（按请求设置，无会话固定）：

```bash
curl http://localhost:8377/v1/chat/completions \
  -H 'content-type: application/json' \
  -H 'x-antseed-pin-peer: 4668854ba3e8b094e6f48fbeb59cec1cfde162f2' \
  -d '{ "model": "minimax-m2.7", "messages": [{"role":"user","content":"hi"}] }'
```

其他可选 header：

- `x-antseed-provider: <providerName>` — 当某个对等方通过多个 seller-plugin
  暴露相同服务时，强制使用其中指定的一个（这种情况很少见）。大多数工具都不需要此项。

## CLI 在 `~/.antseed/` 中创建的文件

了解 `~/.antseed/` 中存放的内容对于备份、容器部署和调试很重要。
该目录会在首次执行 `antseed buyer start`（或首次运行任何需要它的 `antseed` 命令）时创建。

| 路径 | 用途 | 重启后保留？ | 可以安全删除？ |
|------|---------|--------------------|------------------|
| `identity.key` | 买方钱包的原始 32 字节 EVM 私钥。未设置 `ANTSEED_IDENTITY_HEX` 时的备用方案。 | 是 | 否 — 删除后将无法访问你的 USDC 存款。请备份此文件。 |
| `identity.enc` | `identity.key` 的加密副本（桌面应用设置密码短语时生成）。 | 是 | 仅当 `identity.key` 仍然完整时可以删除 |
| `config.json` | 静态设置：链 ID、代理端口、最高定价上限、引导节点、支付偏好。可手动编辑。 | 是 | 是（默认值合理） |
| `buyer.state.json` | 实时运行状态：`pinnedPeerId`、已发现节点缓存（`discoveredPeers`）、链上统计信息、代理的 `pid` 和 `port`。下次启动时会从网络重新构建。 | 是（固定节点会在重启后保留） | 是（会丢失固定节点和缓存的节点列表——下次浏览时会重新填充） |
| `metering.db` | 代理服务的每个请求的 SQLite 日志（模型、节点、令牌、USDC）。供 `antseed buyer status` 和支付门户使用。 | 是 | 是（会丢失请求历史；结算不受影响） |
| `payments/` | 卖方结算流程使用的每个通道的状态（仅当你同时运行 `antseed seller` 时相关）。 | 是 | 仅当你不运行卖方时可以删除 |
| `plugins/` | 已下载提供商插件的缓存。 | 是 | 是（下次使用时会重新下载） |
| `chat/`、`projects/` | 桌面应用用于保存本地聊天历史。仅使用 CLI 的设置中为空。 | 是 | 是 |

### `config.json`（常见编辑项）

```json title="~/.antseed/config.json"
{
  "buyer": {
    "proxyPort": 8377,                  // change if 8377 conflicts on the host
    "minPeerReputation": 0,             // optional: raise to filter lower-reputation peers
    "maxPricing": {                     // refuse to route to peers above this rate
      "defaults": { "inputUsdPerMillion": 100, "outputUsdPerMillion": 100 }
    }
  },
  "payments": {
    "preferredMethod": "crypto",
    "crypto": { "chainId": "base-mainnet" }   // or "base-sepolia" for testnet
  },
  "network": { "bootstrapNodes": [] }   // empty = use built-in defaults
}
```

编辑后，重启买方代理。**不要硬编码合约地址** —
链预设（`base-mainnet` / `base-sepolia`）会自动解析 Deposits、Channels、
USDC 和 RPC URL。

### `buyer.state.json`（实际上为只读）

代理可能希望检查的顶层字段：

- `pinnedPeerId` — 当前固定的节点（或 `null`）。
- `pid` / `port` — 正在运行的代理。如果 `pid` 不为 `null` 但进程已经退出，`antseed buyer start` 会检测到过期的锁文件并进行清理。
- `discoveredPeers` — 上次 DHT 浏览得到的缓存节点列表。在执行 `antseed network browse` 时刷新。
- `peersUpdatedAt`、`onChainStatsRefreshedAt` — 缓存时间戳（epoch 毫秒）。

要在不丢失钱包的情况下，强制清除固定节点和缓存并执行干净重置：

```bash
antseed buyer stop || true
rm ~/.antseed/buyer.state.json
antseed buyer start &
```

## 如何集成 <your tool>

下面列出了我们目前记录的所有集成方式。找到你的工具，复制配置块即可。如果你的工具未在列表中，但接受自定义的 OpenAI 或 Anthropic base URL，请参照最接近的示例（或查看 **curl / Raw HTTP** 条目 —— 接口契约是稳定的）。

## Claude Code

*Anthropic 官方 CLI agent - 通过 AntSeed 使用 `antseed claude` 启动。*

- **类别：** Coding agents
- **通信格式：** Anthropic Messages
- **配置时间：** 约 2 分钟
- **页面：** https://antseed.com/integrations/claude-code

**面向 agents 的简要说明：** 优先使用 `antseed claude --model <service-id>`。它会为 Claude Code 设置 ANTHROPIC_BASE_URL 和 ANTHROPIC_API_KEY。手动执行等价于：设置 ANTHROPIC_BASE_URL=http://localhost:8377 和 ANTHROPIC_API_KEY=antseed，然后运行 `claude --model <service-id>`。

Claude Code 是 Anthropic 官方推出的 CLI coding agent。它原生使用 Anthropic Messages API，因此可以通过 `antseed claude` wrapper 接入 AntSeed，也可以将 `ANTHROPIC_BASE_URL` 指向本地 proxy。

`antseed claude` 会解析当前启用的 buyer proxy，为子进程设置占位用的 Anthropic API key，并原样转发其余 Claude Code flags。如果你希望直接运行 `claude`，也可以继续使用手动设置的环境变量。

不需要真实的 Anthropic API key - AntSeed proxy 会使用你的本地身份（`ANTSEED_IDENTITY_HEX`）验证每个请求，并在链上结算付款。`ANTHROPIC_API_KEY` 的值仅由 Anthropic SDK 要求作为非空占位符存在。

当 Claude Code 调用 Messages API 时，proxy 会将请求转发给你在上述配置步骤 3 中固定的 peer。该 peer 所公布的任何 *service ids*（可在 `antseed network peer <peerId>` 中查看）都会成为有效的 `--model` 值。

**安装**

- **全局安装 Claude Code**
  ```bash
  npm install -g @anthropic-ai/claude-code
  ```
- **验证其是否可以运行**
  ```bash
  claude --version
  ```
  *输出示例：*
  ```
  1.4.2 (Claude Code)
  ```

**配置**

```bash
antseed claude --model claude-sonnet-4-6
```

_推荐：wrapper 会从 `buyer.state.json` 或 config 中读取当前启用的 buyer proxy，为 Claude Code 设置 `ANTHROPIC_BASE_URL` 和 `ANTHROPIC_API_KEY`，并转发额外的 Claude args。只有当你的 proxy 位于其他位置时，才添加 `--antseed-base-url http://host:port`。_

```bash
export ANTHROPIC_BASE_URL="http://localhost:8377"
export ANTHROPIC_API_KEY="antseed"
```

_如果你希望直接运行 `claude` 而不是通过 `antseed claude` 运行，手动设置环境变量等价于上述配置。_

**建议使用的模型：** `claude-sonnet-4-6`、`claude-opus-4-7`、`deepseek-v4-flash`

`antseed claude --model <service-id>` 会将该值原样传递给 Claude Code。有效值集合取决于你固定的 peer 所公布的内容 - 请参阅下面的发现命令。

**测试**

- **查看你固定的 peer 提供哪些模型**
  ```bash
  curl -s http://localhost:8377/v1/models | jq '.data[].id'
  ```
  *响应示例：*
  ```
  "claude-opus-4-7"
  "claude-sonnet-4-6"
  "deepseek-v4-flash"
  "gpt-oss-120b"
  ```
  > 这些是 `--model` 唯一可用的 id。要切换 peer，请运行 `antseed network browse`，然后运行 `antseed buyer connection set --peer <peerId>`，并重新检查此列表。
- **通过 wrapper 启动 Claude Code 会话**
  ```bash
  antseed claude --model claude-sonnet-4-6
  ```
  > 在导出上述环境变量后，手动执行等价于：`claude --model claude-sonnet-4-6`。

**故障排查**

- *“invalid x-api-key” 或 Anthropic SDK 返回 401* — `antseed claude` 会自动为你设置 `ANTHROPIC_API_KEY=antseed`。如果你直接运行 `claude`，请将该变量设置为任意非空字符串；代理会忽略其值。
- *第一条消息永久卡住* — 尚未固定对等节点。运行 `antseed network browse` 查看对等节点，然后运行 `antseed buyer connection set --peer <peerId>`。
- *预期可以使用的模型名称返回 `model_not_found`* — 已固定的对等节点没有公布该服务 id。使用 `antseed network peer <peerId>`（或 `curl http://localhost:8377/v1/models`）检查它实际提供的服务。如有需要，请固定其他对等节点。
- *想确认请求确实经过了 AntSeed（而不是直接发送到 Anthropic）* — 请求完成后，运行 `antseed buyer metering` - 你会看到 Claude Code 路由到的对等节点对应的通道、token 数量以及已结算的 USDC。`antseed buyer status` 会显示快照（已固定的对等节点、活跃通道数量、存款）。

**Claude Code 如何与 AntSeed 通信**

- **Claude Code 发送的线路格式：** Anthropic Messages（访问买方代理的 `/v1/messages`）。
- **最匹配的服务：** `protocols` 数组中包含 `anthropic-messages` 的任意服务 — 这表示该对等节点宣称原生支持该协议，因此流量可以直接通过，无需任何转换开销。
- **如何检查对等节点：** 运行 `antseed network peer <peerId> --json`，并针对每个模型查看 `peer.providerServiceApiProtocols[provider].services[service]`。`browse` 命令会按对等节点公开相同字段。
- **协议不一致时：** AntSeed 的 `@antseed/api-adapter` 会在运行时将 Anthropic Messages 与服务的原生协议相互转换。因此，Claude Code 发出的请求仍然可以到达只公布了其他协议的服务，只是会增加一个小型转换步骤。
- **注意事项：** 唯一公布 `openai-responses` 协议的服务要求使用流式传输。如果 Claude Code 发送非流式请求，而代理将其路由到其中某个服务，调用会失败，并返回 `HTTP 400: Stream must be set to true`。请选择 `protocols` 包含 `anthropic-messages`（或其他非 responses 协议）的服务，以避免此问题。

**链接**

- [Claude Code 文档](https://docs.anthropic.com/en/docs/claude-code)
- [AntSeed skill: join-buyer](https://github.com/AntSeed/antseed/tree/main/skills/join-buyer)

---

## OpenAI Codex CLI

*OpenAI 官方 CLI 编码代理 - 使用 `antseed codex` 配置每次运行的代理。*

- **类别：** 编码代理
- **线路格式：** OpenAI Chat Completions
- **设置时间：** 约 2 分钟
- **页面：** https://antseed.com/integrations/codex

**面向代理的 TL;DR：** 优先使用 `antseed codex --model <service-id>`。它会在单次运行中注入 AntSeed Codex provider，并使用 base_url=http://localhost:8377/v1 和 wire_api="responses"。手动替代方案：创建用户级 `~/.codex/antseed.config.toml`，其中包含顶层的 model/model_provider 以及 [model_providers.antseed]，然后运行 `codex --profile antseed`。

Codex 是 OpenAI 的终端编码代理。较新版本会忽略 `OPENAI_BASE_URL`，转而从 Codex 设置中读取 provider 配置。

`antseed codex` 会通过 Codex 的 `-c` 覆盖项为本次运行提供该 provider 配置，将其指向当前活跃的 buyer proxy，设置占位 API key，并保持你真实的 `CODEX_HOME` 不变。

如果你更喜欢持久化的手动配置，请创建 `~/.codex/antseed.config.toml`，然后使用 `codex --profile antseed` 启动 Codex；对于一次性会话，wrapper 仍然是最简便的方式。

**安装**

- **全局安装 Codex**
  ```bash
  npm install -g @openai/codex
  ```
- **验证是否可以运行**
  ```bash
  codex --version
  ```

**配置**

```bash
antseed codex --model claude-sonnet-4-6
```

_推荐：wrapper 会解析 proxy URL，注入一个 `wire_api = "responses"` 的 AntSeed model provider，设置 `ANTSEED_API_KEY=antseed`，并转发额外的 Codex 参数。当子命令参数看起来像 wrapper 参数时，请将它们放在 `--` 之后。_

```toml title="~/.codex/antseed.config.toml"
# Loaded by: codex --profile antseed
# Set this to a service id returned by http://localhost:8377/v1/models
# after pinning an AntSeed peer.
model = "claude-sonnet-4-6"
model_provider = "antseed"

[model_providers.antseed]
name = "AntSeed"
base_url = "http://localhost:8377/v1"
wire_api = "responses"
```

_仅适用于手动 profile：这必须是你的**用户级** `~/.codex/antseed.config.toml`，然后使用 `codex --profile antseed` 启动。如果你的 buyer proxy 使用非默认端口，请更新 `base_url` 以匹配该端口。Codex 会忽略项目本地 `./.codex/config.toml` 中的 provider 配置块。_

> **GUI：**
>
> 不需要真实的 OpenAI key。AntSeed proxy 使用你本地的 buyer identity 进行身份验证；wrapper 和手动 profile 都会将 Codex 指向本地 proxy，而不是 OpenAI。

**建议模型：** `claude-sonnet-4-6`、`deepseek-v3.1`、`kimi-k2.5`、`qwen-3-coder-480b`

将 peer service id 传给 `antseed codex --model <service-id>`。对于手动 profile，请在 `~/.codex/antseed.config.toml` 中设置顶层的 `model = "<service-id>"`，或使用 `codex --profile antseed --model <service-id>` 覆盖。

**测试**

- **查看已固定 peer 暴露的 service id**
  ```bash
  curl -s http://localhost:8377/v1/models | jq '.data[].id'
  ```
  *示例响应：*
  ```
  "claude-opus-4-7"
  "claude-sonnet-4-6"
  "deepseek-v4-flash"
  "gpt-oss-120b"
  ```
  > 这里显示的任何值都可以作为 `~/.codex/antseed.config.toml` 中顶层 `model = ...` 的有效值（也可以用于 `codex --profile antseed --model <id>`）。
- **通过 wrapper 运行 Codex**
  ```bash
  antseed codex --model deepseek-v4-flash
  ```
  > 手动 profile 的等效命令：`codex --profile antseed --model deepseek-v4-flash`。
- **验证推理请求确实通过 AntSeed 付费**
  ```bash
  open http://localhost:3118   # or: antseed buyer status
  ```
  *执行一次真实提示词后需要查看的内容：*
  ```
  Deposits available: 4.289391 USDC → 3.289391 USDC
  Deposits reserved:           0 USDC → 1 USDC
  ```
  > http://localhost:3118 上的 buyer dashboard 是权威的实时信号：执行一次真实提示词后，如果 `Reserved` 非零（channel 已打开），和/或 `Available` 减少（已结算的支出），就可以确认请求由 AntSeed 提供服务。`antseed buyer status` CLI 输出使用缓存，可能会落后于 dashboard；请刷新 Web 视图以进行确认。不要依赖 `lsof -i | grep codex` 或 `~/.codex/log/codex-tui.log`：Codex 会为了非推理用途与 Cloudflare/ChatGPT IP（例如 172.64.0.0/13）保持持久 TCP 连接（测试期间尚未确定具体原因），并且 TUI 日志中的 `provider=OpenAI` 行并不能可靠地表明推理请求发送到了 OpenAI；即使出现该日志行，链上数据仍然可以显示请求由 AntSeed 提供服务。

**故障排除**

- *`OPENAI_BASE_URL` / `OPENAI_API_KEY` 被忽略* — 在较新的 Codex 构建版本中，这是预期行为。请使用 `antseed codex --model <service-id>`，使包装器为当前运行注入提供商配置；或者使用上面的手动 `~/.codex/antseed.config.toml` 配置文件。
- *如何判断 Codex 是否实际通过 AntSeed 路由？* — 发送测试提示后，检查买方仪表板 http://localhost:3118（或运行 `antseed buyer status`）。`Reserved` 从 $0 变为非零值（表示已打开一个通道）和/或 `Available` 降低（表示支出已结算），即可确认 AntSeed 已处理该请求。如果发送真实提示后两者都没有变化，说明配置文件未被应用。不要相信到 Cloudflare IP 的 `lsof` 连接或 `~/.codex/log/codex-tui.log` 中的 `provider=OpenAI` 行，因为两者都不是可靠的路由信号。
- *Codex 输出 `Ignored unsupported project-local config keys … model_provider, model_providers`* — 提供商设置必须位于你的**用户级** Codex 配置文件中。对于此手动流程，请将顶层 `model`、`model_provider` 以及 `[model_providers.antseed]` 块放入 `~/.codex/antseed.config.toml`，然后通过 `codex --profile antseed` 重新启动。Codex 会静默拒绝项目本地 `./.codex/config.toml` 中的提供商块，并回退到其默认提供商。
- *手写的 Codex `-c` 提供商覆盖行为不一致* — 请使用 `antseed codex --model <service-id>`，让 AntSeed 为当前运行提供完整的提供商块（`base_url`、`wire_api` 和 `model_provider`）。如果自行管理配置，请将完整的提供商/配置文件保留在用户级 `~/.codex/antseed.config.toml` 中。
- *使用手动配置文件时，流式传输在第一个块后停止* — 使用 `antseed codex`，或者在手动 `[model_providers.antseed]` 块中设置 `wire_api = "responses"`。
- *`unknown profile: antseed`* — Codex 会在启动时缓存配置文件。确认你已保存 `~/.codex/antseed.config.toml`，然后启动新的 `codex --profile antseed` 会话。
- *第一条消息永久挂起* — 尚未固定任何对等节点。运行 `antseed network browse`，然后运行 `antseed buyer connection set --peer <peerId>`。

**OpenAI Codex CLI 如何与 AntSeed 通信**

- **OpenAI Codex CLI 发送的线格式：** OpenAI Chat Completions（在买方代理上访问 `/v1/chat/completions`）。
- **最匹配的服务：** 任何 `protocols` 数组包含 `openai-chat-completions` 的服务——这是对等节点声明的原生支持协议，因此流量可零转换开销直通。
- **如何检查对等节点：** 运行 `antseed network peer <peerId> --json`，并针对每个模型查看 `peer.providerServiceApiProtocols[provider].services[service]`。浏览命令也会针对每个对等节点公开相同字段。
- **协议不同时：** AntSeed 的 `@antseed/api-adapter` 会在运行时于 OpenAI Chat Completions 与服务原生协议之间进行转换。因此，来自 OpenAI Codex CLI 的请求仍可到达仅声明不同协议的服务，只是会增加一个小型转换步骤。
- **注意事项：** 唯一声明协议为 `openai-responses` 的服务需要使用流式传输。如果 OpenAI Codex CLI 发送非流式请求，而代理将其路由到这类服务之一，调用将因 `HTTP 400: Stream must be set to true` 失败。请选择 `protocols` 包含 `openai-chat-completions`（或其他非 responses 协议）的服务，以避免此问题。

**链接**

- [Codex repo](https://github.com/openai/codex)
- [Codex sample config](https://developers.openai.com/codex/config-sample)

---

## OpenCode

*开源 AI 编程代理 - 通过 `antseed opencode` 启动。*

- **类别：** 编程代理
- **通信格式：** OpenAI Chat Completions
- **配置时间：** 约 2 分钟
- **页面：** https://antseed.com/integrations/opencode

**代理 TL;DR：** 优先使用 `antseed opencode --model <service-id>`。它会使用 npm="@ai-sdk/openai-compatible"、baseURL="http://localhost:8377/v1"、apiKey="antseed" 以及一个模型条目创建临时 OpenCode provider 配置。手动替代方案：将相同的 provider 放入 opencode.json，然后运行 `opencode`。

OpenCode 是一个基于 Vercel AI SDK 构建、采用 MIT 许可证的终端编程代理。它开箱即用地支持 75+ 个 provider，并允许你通过 `opencode.json` 注册自定义 provider。

`antseed opencode` 会在临时的 `opencode.json` 中创建该自定义 provider 配置，将 OpenCode 指向该配置以启动子进程，并在会话退出时删除它。如果你希望 OpenCode 在 wrapper 之外记住 AntSeed，也可以使用手动项目级或全局配置。

AntSeed 使用 `@ai-sdk/openai-compatible` 适配器作为**自定义 provider**接入 - 这是 OpenCode 针对任何兼容 OpenAI 的端点（LM Studio、llama.cpp、Atomic Chat 等）所推荐使用的适配器。不需要设置 `ANTHROPIC_BASE_URL`：OpenCode 从 JSON 中读取 provider 配置。

你想使用的每个模型都必须列在 `models` 下。其 id 必须与买方代理从 `GET /v1/models` 返回的内容一致 - 也就是说，必须是当前固定对等节点所公布的 service id。

**安装**

- **安装 OpenCode**
  ```bash
  npm install -g opencode-ai
  ```
- **验证其是否正常运行**
  ```bash
  opencode --version
  ```

**配置**

```bash
antseed opencode --model gpt-oss-120b
```

_推荐：wrapper 会解析代理 URL，写入包含一个 AntSeed 模型的临时 OpenCode 配置，为子进程设置 `OPENCODE_CONFIG`，并转发额外的 OpenCode 参数。_

```json title="opencode.json  (project root, or ~/.config/opencode/opencode.json for global)"
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "antseed": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "AntSeed (peer-to-peer)",
      "options": {
        "baseURL": "http://localhost:8377/v1",
        "apiKey": "antseed"
      },
      "models": {
        "claude-sonnet-4-6":  { "name": "Claude Sonnet 4.6 (via AntSeed)" },
        "deepseek-v4-flash":  { "name": "DeepSeek v4 Flash (via AntSeed)" },
        "gpt-oss-120b":       { "name": "gpt-oss 120B (via AntSeed)" }
      }
    }
  }
}
```

_如果你希望 OpenCode 在其正常的项目级或全局配置中保留 AntSeed，这是手动配置的等效方式。_

**建议的模型：** `claude-sonnet-4-6`、`claude-opus-4-7`、`deepseek-v4-flash`、`gpt-oss-120b`

`antseed opencode --model <service-id>` 会为该 id 单独生成临时配置。在手动配置中，`models` 下的键必须与 `curl http://localhost:8377/v1/models` 返回的 service ids 完全匹配。

**测试**

- **确认代理列出的 id 与配置中引用的相同**
  ```bash
  curl -s http://localhost:8377/v1/models | jq '.data[].id'
  ```
  *示例响应：*
  ```
  "claude-opus-4-7"
  "claude-sonnet-4-6"
  "deepseek-v4-flash"
  "gpt-oss-120b"
  ```
  > 在 `opencode.json` 的 `models` 下添加或移除条目，使其与此列表匹配。
- **通过包装器启动 OpenCode**
  ```bash
  antseed opencode --model gpt-oss-120b
  ```
  > 额外的 OpenCode 参数会被转发，因此 `antseed opencode --model gpt-oss-120b run` 也可以正常工作。手动配置等价操作：运行 `opencode`，然后从 `/models` 中选择一个 AntSeed 条目。

**故障排除**

- *AntSeed 没有出现在 `/connect` 或 `/models` 中* — 使用 `antseed opencode` 时，通过 `--model` 传入服务 id；包装器会提供临时配置。使用手动配置时，确保 `opencode.json` 位于项目根目录（或 `~/.config/opencode/opencode.json`），并且 JSON 有效 - 多余的逗号可能会静默禁用整个 provider。
- *模型已列出，但每次调用都返回 `model_not_found`* — 固定的 peer 没有声明该服务 id。运行 `antseed network peer <peerId>` 查看它实际提供的服务，或固定到其他 peer。
- *OpenCode 要求输入 API key* — 代理会忽略身份验证，但 AI SDK 有时仍会询问。可以跳过提示（在空输入时按回车），或者在 `opencode.json` 的 `options` 中设置 `"apiKey": "antseed"`。

**OpenCode 如何与 AntSeed 通信**

- **OpenCode 发送的线路格式：** OpenAI Chat Completions（访问买方代理上的 `/v1/chat/completions`）。
- **最匹配的服务：** `protocols` 数组包含 `openai-chat-completions` 的任何服务 - 这是 peer 声明的原生支持协议，因此流量无需任何转换即可通过。
- **检查 peer 的方式：** 运行 `antseed network peer <peerId> --json`，并查看每个模型对应的 `peer.providerServiceApiProtocols[provider].services[service]`。browse 命令会按 peer 暴露相同的字段。
- **协议不同时：** AntSeed 的 `@antseed/api-adapter` 会实时在 OpenAI Chat Completions 与服务的原生协议之间进行转换。因此，来自 OpenCode 的请求仍然可以到达只声明了其他协议的服务 - 只是会增加一个小型转换步骤。
- **注意事项：** 唯一声明的协议是 `openai-responses` 的服务要求流式传输。如果 OpenCode 发送非流式请求，而代理将其路由到这些服务之一，调用会失败并返回 `HTTP 400: Stream must be set to true`。请选择 `protocols` 包含 `openai-chat-completions`（或其他非 responses 协议）的服务，以避免此问题。

**链接**

- [OpenCode 文档 → 自定义 provider](https://opencode.ai/docs/providers/#custom-provider)
- [OpenCode 仓库](https://github.com/sst/opencode)

---

## Pi

*开源终端编码代理，提供一流的 AntSeed 扩展。*

- **类别：** 编码代理
- **线路格式：** OpenAI Responses
- **设置时间：** 约 3 分钟
- **页面：** https://antseed.com/integrations/pi

**面向代理的 TL;DR：** 安装 Pi：`npm install -g @mariozechner/pi-coding-agent`。安装 AntSeed 扩展：`pi install git:github.com/AntSeed/pi-antseed`。重启或执行 `/reload`。该扩展会调用 `pi.registerProvider("antseed", { api: "openai-responses", baseUrl: "http://localhost:8377/v1" })`，并通过 GET /v1/models 从固定的 peer 自动发现模型。使用 `/model antseed/<service-id>` 切换。使用 `ANTSEED_BASE_URL` 环境变量覆盖 base URL；使用 `ANTSEED_API_KEY` 配置身份验证。

**Pi 是什么。** Pi（`@mariozechner/pi-coding-agent`）是 Mario Zechner 开发的一个精简、可 hack 的终端编码代理，与 [pi-mono](https://github.com/badlogic/pi-mono) 属于同一项目体系。它自带四个默认工具（`read`、`write`、`edit`、`bash`），并允许你通过 TypeScript *扩展*、*技能* 和 *提示词模板* 扩展其他所有部分，包括命令、提供商、主题，甚至编辑器 UI。无需 fork。

**AntSeed 扩展的作用。** [`pi-antseed`](https://github.com/AntSeed/pi-antseed) 是一个 Pi 扩展，它将本地 buyer proxy 注册为名为 `antseed` 的 Pi provider。安装后，你的固定 peer 所公布的每个服务都会以 `antseed/<id>` 的形式显示在 Pi 的模型选择器中（Ctrl+L 或 `/model`），你可以像使用任何内置模型一样，通过 `/model antseed/minimax-m2.7` 进行切换。

**为什么使用扩展，而不是环境变量。** Pi 原生支持数十种 provider 协议。该扩展会调用 `pi.registerProvider("antseed", { api: "openai-responses", authHeader: true, baseUrl: "http://localhost:8377/v1" })`，然后由 Pi 处理身份验证请求头、流式传输、重试和工具调用。对于支持推理的模型，Responses API 路径可以在多轮对话中保留 reasoning items；同时，该扩展仍会从 `GET /v1/models` 自动刷新模型列表，因此菜单会反映固定 peer 能够提供的服务。

**安装**

- **安装 Pi 本身（编码代理 CLI）**
  ```bash
  npm install -g @mariozechner/pi-coding-agent
  ```
  > Pi 要求 Node.js 20+。其二进制文件名为 `pi`。使用 `pi --version` 验证。没有任何扩展时，Pi 已经可以通过 API key 或 OAuth 连接 Claude / GPT / Gemini / Groq / 等服务；下面的 AntSeed 扩展负责让它通过本地 buyer proxy 进行路由。
- **将 AntSeed 扩展安装到 Pi 中**
  ```bash
  pi install git:github.com/AntSeed/pi-antseed
  ```
  > Pi 支持从 git URL 或本地路径安装扩展。替代方式：`pi -e git:github.com/AntSeed/pi-antseed` 可以在不安装的情况下运行一次该扩展，适合试用。使用本地 clone 时，可以运行 `pi install ./pi-antseed`。
- **重新加载 Pi，使其识别新的 provider**
  ```bash
  /reload
  ```
  > 在 Pi REPL 内运行此命令（先输入 `pi` 启动它）。该命令会重新扫描扩展、技能、提示词模板、键绑定和上下文文件。完全重启同样有效。

**配置**

```bash
export ANTSEED_BASE_URL="http://localhost:8377/v1"
```

> **GUI：**
>
> 在常见情况下无需 GUI 配置；该扩展会读取 `ANTSEED_BASE_URL`（默认为 `http://localhost:8377/v1`），并自动从固定 peer 发现模型。只有在你为 buyer proxy 配置了自己的身份验证层时，才需要设置 `ANTSEED_API_KEY`；或者设置 `ANTSEED_MODELS="id1,id2"` 以跳过发现并注册固定列表。

**建议模型：** `minimax-m2.7`、`claude-sonnet-4-6`、`deepseek-v4-flash`、`qwen3-coder-480b`

Pi 加载完成后，扩展会通过 `GET /v1/models` 自动发现模型，因此你的固定对等节点所发布的任何模型都会显示在 `antseed/...` 下。重新固定其他对等节点后，在 Pi 中运行 `/reload` 以刷新模型列表。

**测试**

- **启动 Pi**
  ```bash
  pi
  ```
  > 你会看到 Pi 的启动标题，其中列出了已加载的扩展。在列表中查找 `antseed`（或 `pi-antseed`）- 如果存在，说明扩展已成功加载。
- **打开模型选择器并选择一个由 AntSeed 路由的模型**
  ```bash
  /model
  ```
  > 或按 Ctrl+L。选择器支持模糊搜索；输入 "antseed" 进行筛选。你应该会看到类似 `antseed/claude-sonnet-4-6`、`antseed/deepseek-v4-flash` 等条目 - 你的固定对等节点发布的每项服务各对应一个条目。
- **或者直接通过斜杠命令切换**
  ```bash
  /model antseed/minimax-m2.7
  ```
  > 将 `minimax-m2.7` 替换为 `curl http://localhost:8377/v1/models` 返回的任意 id。此后，每条提示都会经由 AntSeed → 你的固定对等节点 → 模型进行路由。

**故障排除**

- *安装后出现 `pi: command not found`* — 你的全局 npm bin 目录不在 `PATH` 中。运行 `npm prefix -g` 查找该目录，然后在 shell rc 中将 `<that-path>/bin` 添加到 `PATH`。或者使用 Node 版本管理器（nvm、fnm、volta），它们会自动处理此问题。
- *`antseed` 没有出现在模型选择器中（`/model` 或 Ctrl+L）* — 扩展未加载。重新运行 `pi install git:github.com/AntSeed/pi-antseed`，重启 Pi，并查看启动标题 - 它会列出所有已加载的扩展，并在那里显示加载错误。
- *选择器只显示少量硬编码的 `antseed/...` id，而不是我的对等节点所提供的模型* — Pi 启动时 buyer proxy 尚未运行，因此扩展回退到了内置的 seed 列表。确保 `antseed buyer start` 正在运行且已有固定对等节点，然后在 Pi 中运行 `/reload` 以刷新模型列表。
- *代理返回空的 `/v1/models`* — 没有连接对等节点。运行 `antseed network browse` 查看可用选项，然后运行 `antseed buyer connection set --peer <peerId>`。或者使用 `antseed buyer start --router <name>` 启动代理，以自动选择对等节点。
- *对话过程中代理返回 5xx* — 通常意味着固定的对等节点不提供你请求的模型，或者刚刚离线。通过 `antseed buyer connection set --peer <peerId>` 重新固定对等节点，然后在 Pi 中运行 `/reload`。
- *想要使用自定义 buyer proxy URL（远程主机、自定义端口）* — 在启动 `pi` 的 shell 中设置 `ANTSEED_BASE_URL=http://your-host:8377/v1`。扩展会在启动时读取该变量。如果你的代理前面配置了身份验证，还要设置 `ANTSEED_API_KEY=<token>`。

**Pi 如何与 AntSeed 通信**

- **Pi 发送的 Wire format：** OpenAI Responses（请求发送到 buyer proxy 的 `/v1/responses`）。
- **最匹配的服务：** `protocols` 数组包含 `openai-responses` 的任何服务 - 这表示该协议是对等节点声明的原生支持协议，因此流量无需任何转换开销即可通过。
- **如何检查对等节点：** 运行 `antseed network peer <peerId> --json`，并针对每个模型查看 `peer.providerServiceApiProtocols[provider].services[service]`。browse 命令会为每个对等节点公开相同字段。
- **协议不一致时：** AntSeed 的 `@antseed/api-adapter` 会在运行时即时转换 OpenAI Responses 与服务原生协议之间的格式。因此，Pi 发送的请求仍然可以到达只声明了其他协议的服务 - 只是会增加一个小型转换步骤。

**链接**

- [Pi coding agent (npm)](https://www.npmjs.com/package/@mariozechner/pi-coding-agent)
- [Pi 源代码 (badlogic/pi-mono)](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent)
- [pi-antseed 扩展](https://github.com/AntSeed/pi-antseed)

---

## OpenClaw

*开源自主代理运行时 - 在 `openclaw.json` 中将 AntSeed 注册为自定义 provider。*

- **类别：** 自主代理
- **通信格式：** Anthropic Messages
- **设置时间：** 约 3 分钟
- **页面：** https://antseed.com/integrations/openclaw

**代理 TL;DR：** 编辑 ~/.openclaw/openclaw.json：在 models.providers 下添加一个 `antseed` 条目，其 baseUrl=http://127.0.0.1:8377、api="anthropic-messages"、apiKey="antseed-p2p"，以及一个 `models[]` 数组，其中的 `id` 值与 GET /v1/models 返回的 service ids 相匹配。也可以运行 `openclaw config set agents.defaults.model.primary "antseed/<id>"`。使用 `openclaw config reload` 重新加载。

**OpenClaw 是什么。** OpenClaw 是一个开源代理运行时，用于执行自主、长期运行的任务（研究、编码、网页自动化）。它从 `~/.openclaw/openclaw.json` 加载 provider catalog - 每个条目都包含一个 HTTP endpoint、一个通信协议（`anthropic-messages`、`openai-chat` 等）以及一个模型列表。

**AntSeed 如何接入。** 添加一个名为 `antseed` 的 provider 条目，将其指向 `http://127.0.0.1:8377`，并设置 `api: "anthropic-messages"`。你在该 provider 下列出的每个模型 id，都必须是你的 pinned peer 所公布的 service id - OpenClaw 会在模型选择器中以 `antseed/<service-id>` 的形式展示它们。

**为什么使用配置条目而不是环境变量。** OpenClaw 会并行运行多个 provider（每个任务一个，有时每个代理一个）。单一的 base-URL 覆盖会迫使所有代理都通过 AntSeed；命名 provider 则允许你按代理混合使用 AntSeed、托管的 Anthropic、OpenAI 或本地模型。

**安装**

- **安装 OpenClaw**
  ```bash
  npm install -g openclaw
  ```
  > 使用 `openclaw --version` 验证。配置文件位于 `~/.openclaw/openclaw.json`，并会在首次启动时创建。

**配置**

```json title="~/.openclaw/openclaw.json  (merge into the existing `models.providers` object)"
{
  "models": {
    "providers": {
      "antseed": {
        "baseUrl": "http://127.0.0.1:8377",
        "apiKey": "antseed-p2p",
        "api": "anthropic-messages",
        "models": [
          {
            "id": "claude-sonnet-4-6",
            "name": "Claude Sonnet 4.6 (via AntSeed)",
            "reasoning": false,
            "input": ["text"],
            "contextWindow": 200000,
            "maxTokens": 8192
          },
          {
            "id": "deepseek-v4-flash",
            "name": "DeepSeek v4 Flash (via AntSeed)",
            "reasoning": false,
            "input": ["text"],
            "contextWindow": 128000,
            "maxTokens": 8192
          }
        ]
      }
    }
  }
}
```

```bash
# Set AntSeed as the default model for new agents:
openclaw config set agents.defaults.model.primary "antseed/claude-sonnet-4-6"
```

**建议使用的模型：** `claude-sonnet-4-6`、`claude-opus-4-7`、`deepseek-v4-flash`、`gpt-oss-120b`

`models[]` 下的每个 `id` 都必须与 `curl http://127.0.0.1:8377/v1/models` 返回的服务 ID 匹配。`apiKey` 是 OpenClaw 的验证器所必需的，但会被代理忽略，任何非空字符串均可。`"antseed-p2p"` 只是约定俗成的值。

**测试**

- **确认代理公布了你在配置中填写的服务 ID**
  ```bash
  curl -s http://127.0.0.1:8377/v1/models | jq '.data[].id'
  ```
  *响应示例：*
  ```
  "claude-opus-4-7"
  "claude-sonnet-4-6"
  "deepseek-v4-flash"
  "gpt-oss-120b"
  ```
  > 如果你在 `openclaw.json` 中列出的模型 ID 没有出现在这里，说明你固定连接的对等节点并未提供该模型。请固定连接其他对等节点，或移除该条目。
- **重新加载 OpenClaw 并检查提供商列表**
  ```bash
  openclaw config reload && openclaw providers list
  ```
  > 或者重启 OpenClaw。你应该会看到 `antseed`，以及你配置的模型数量。
- **通过 AntSeed 运行代理**
  ```bash
  openclaw run "Summarize the README in this repo" --model antseed/claude-sonnet-4-6
  ```

**故障排除**

- *启动代理时出现 `provider "antseed" not found`* — `openclaw.json` 中存在 JSON 解析错误，或者你将该条目放在了错误的嵌套层级中。提供商必须位于 `models.providers.antseed` 下。运行 `openclaw config validate` 以显示解析错误。
- *OpenClaw 列出了 `antseed/<id>`，但每次调用都返回 `404 model_not_found`* — 固定连接的对等节点未公布该服务 ID。运行 `antseed network peer <peerId>` 查看它实际提供的服务，或者使用 `antseed buyer connection set --peer <peerId>` 固定连接其他对等节点。
- *长时间运行的代理出现流式传输错误* — AntSeed 支持 SSE 流式传输。如果响应被截断，请检查 OpenClaw 前方是否有代理正在缓冲响应（Cloudflare、nginx）。买方代理本身不会缓冲。
- *部署后代理在第一次请求时停滞* — AntSeed 会在向新对等节点发起第一次请求时打开支付通道（一次链上交易，在 Base 上约需 5–15 秒）。后续请求会复用该通道。可在启动代理前先运行一次快速 `curl` 进行预热。

**OpenClaw 如何与 AntSeed 通信**

- **OpenClaw 发送的线格式：** Anthropic Messages（请求会命中买方代理的 `/v1/messages`）。
- **最适配的服务：** `protocols` 数组包含 `anthropic-messages` 的任何服务——这是对等节点公布的原生支持协议，因此流量可直接通过，没有转换开销。
- **如何检查对等节点：** 运行 `antseed network peer <peerId> --json`，并针对每个模型查看 `peer.providerServiceApiProtocols[provider].services[service]`。浏览命令也会为每个对等节点公开相同的字段。
- **协议不同时：** AntSeed 的 `@antseed/api-adapter` 会在运行时在 Anthropic Messages 与服务原生协议之间进行转换。因此，来自 OpenClaw 的请求仍可到达仅公布其他协议的服务，只是会增加一个小型转换步骤。
- **注意事项：** 唯一公布协议为 `openai-responses` 的服务要求使用流式传输。如果 OpenClaw 发送非流式请求，而代理将其路由到此类服务，调用将失败并返回 `HTTP 400: Stream must be set to true`。请选择 `protocols` 包含 `anthropic-messages`（或其他非 responses 协议）的服务，以避免此问题。

**链接**

- [OpenClaw 仓库](https://github.com/openclaw/openclaw)
- [AntSeed skill：openclaw-antseed（完整指南）](https://github.com/AntSeed/antseed/tree/main/skills/openclaw-antseed)

---

## Hermes

*Nous Research 的智能体框架 - 在 `config.yaml` 中将 AntSeed 注册为自定义提供商。*

- **类别：** 自主智能体
- **通信格式：** OpenAI Chat Completions
- **配置时间：** 约 3 分钟
- **页面：** https://antseed.com/integrations/hermes

**智能体速览：** 编辑 ~/.hermes/config.yaml：添加一个名为 `antseed` 的 `custom_providers` 条目，其中包含 base_url=http://127.0.0.1:8377/v1、api_mode=chat_completions、api_key="antseed-p2p"，以及一个 `models:` 列表，其 ids 与 GET /v1/models 返回的服务 ids 匹配。将 `model.default` 设置为其中一个 id，并将 `model.provider: antseed`。将 `auxiliary.title_generation.model` 和 `auxiliary.compression.model` 固定为 chat_completions 模型，以避免针对 openai-responses 对等节点时出现流式传输错误。

**Hermes 是什么。** Hermes 是 [Nous Research](https://nousresearch.com/) 的智能体框架（OpenClaw 系列的后继者）。它专为自主的多步骤工作流而设计，例如研究智能体、编程智能体和智能体集群，并从 `~/.hermes/config.yaml` 读取其模型目录。

**AntSeed 如何接入。** 在 `custom_providers` 下添加一个条目，其中包含 `base_url: http://127.0.0.1:8377/v1`、`api_mode: chat_completions` 和一个 `models` 列表。每个模型 id 都必须是你固定的对等节点所公布的服务 id。然后将 `model.default` 指向你希望作为主要模型使用的模型。

**Hermes 特有的一个注意事项。** 一些对等节点通过 `openai-responses` 协议提供 GPT 风格模型，该协议 *要求* 使用流式传输。Hermes 的辅助调用（标题生成、上下文压缩）不会使用流式传输，针对这些模型调用时会失败，并返回 `HTTP 400: Stream must be set to true`。请将辅助配置项固定到一个 `chat_completions` 模型（配置示例见下方）。

**安装**

- **安装或构建 Hermes**
  ```bash
  # Follow Nous Research setup at https://github.com/NousResearch/hermes-agent
  ```
  > Hermes 通常作为长期运行的进程运行（服务器上通常由 systemd 管理）。配置文件 `~/.hermes/config.yaml` 会在启动时读取，修改后需要重启。

**配置**

```yaml title="~/.hermes/config.yaml  (merge into your existing config)"
model:
  default: claude-sonnet-4-6
  provider: antseed

custom_providers:
  - name: antseed
    base_url: http://127.0.0.1:8377/v1
    api_key: antseed-p2p
    api_mode: chat_completions
    models:
      - claude-sonnet-4-6
      - claude-opus-4-7
      - deepseek-v4-flash
      - gpt-oss-120b
      - minimax-m2.7

# Pin auxiliary calls to a chat_completions model so non-streaming
# requests (title generation, compression) don't break against
# openai-responses peers.
auxiliary:
  title_generation:
    provider: antseed
    model: minimax-m2.7
  compression:
    provider: antseed
    model: minimax-m2.7
```

**推荐模型：** `claude-sonnet-4-6`、`minimax-m2.7`、`deepseek-v4-flash`、`gpt-oss-120b`

只有列在 `models:` 下的 ID 才会显示在 Hermes 的选择器中——请将其与 `curl http://127.0.0.1:8377/v1/models` 的结果保持一致，避免展示没有任何节点提供的模型。`model.provider: antseed` 会将默认提供商固定为此自定义提供商。

**测试**

- **确认代理提供的 ID 与配置引用的 ID 一致**
  ```bash
  curl -s http://127.0.0.1:8377/v1/models | jq '.data[].id'
  ```
  *示例响应：*
  ```
  "claude-opus-4-7"
  "claude-sonnet-4-6"
  "deepseek-v4-flash"
  "gpt-oss-120b"
  "minimax-m2.7"
  ```
- **重启 Hermes 以加载新的提供商**
  ```bash
  sudo systemctl restart hermes
  ```
  > 或使用你所采用的其他监管程序。然后检查日志：`sudo journalctl -u hermes --no-pager -n 30`。
- **首次请求后，确认通道已打开并正在计量**
  ```bash
  antseed buyer status
  antseed buyer metering
  ```
  > 首次请求结算后（在 Base 上约需 5–15 秒，即一笔链上交易来打开通道），`status` 会显示 `Active channels: 1`。`metering` 会显示每个通道对应节点的 token 和 USDC 累计值。如需轮询：`watch -n 1 antseed buyer metering`。

**故障排除**

- *辅助调用返回 `HTTP 400: Stream must be set to true`* —— 你正在通过一个使用 `openai-responses` 提供模型的节点进行路由（该协议要求流式传输），但 Hermes 的辅助调用不使用流式传输。请将 `auxiliary.*` 槽位固定到使用 `chat_completions` 的模型（参见上面的配置代码块）。使用 `antseed network peer <peerId>` 检查模型协议——查找 `protocols: openai-chat-completions` 与 `openai-responses`。
- *Hermes 加载了提供商，但每次调用都返回 `no_peer_pinned`* —— 在默认的手动流程中，AntSeed 不会自动选择节点——请使用 `antseed buyer connection set --peer <peerId>` 固定一个节点，在每个请求中发送 `x-antseed-pin-peer`，或通过路由器插件启动 buyer。会话固定信息在 buyer-proxy 重启后仍然保留（已持久化到 `~/.antseed/buyer.state.json`）。
- *Hermes 运行在远程主机上，无法访问 `127.0.0.1:8377`* —— 可以将 buyer proxy 运行在与 Hermes 相同的主机上（推荐，这样热签名密钥会保留在本地），或者通过 SSH 隧道暴露代理：`ssh -N -L 127.0.0.1:8377:127.0.0.1:8377 user@hermes-host`。不要将 buyer proxy 绑定到公共网络接口。
- *想在不重启 AntSeed 的情况下更换路由模型* —— 编辑 `config.yaml` 中的 `model.default`（以及需要时的 `models:`），重新固定一个提供该模型的节点（`antseed buyer connection set --peer <peerId>`），然后执行 `sudo systemctl restart hermes`。buyer proxy 会保持运行状态；不会调用合约。

**Hermes 如何与 AntSeed 通信**

- **Hermes 发送的线路格式：** OpenAI Chat Completions（访问 buyer proxy 上的 `/v1/chat/completions`）。
- **最匹配的服务：** `protocols` 数组中包含 `openai-chat-completions` 的任意服务——这表示该协议是节点声明的原生支持协议，因此流量无需任何转换即可通过。
- **如何检查节点：** 运行 `antseed network peer <peerId> --json`，并针对每个模型查看 `peer.providerServiceApiProtocols[provider].services[service]`。browse 命令会为每个节点公开相同的字段。
- **协议不一致时：** AntSeed 的 `@antseed/api-adapter` 会在运行时将 OpenAI Chat Completions 与服务的原生协议相互转换。因此，Hermes 发送的请求仍然可以到达只声明了其他协议的服务——只是会增加一个小型转换步骤。
- **注意事项：** 唯一声明的协议为 `openai-responses` 的服务要求流式传输。如果 Hermes 发送非流式请求，而代理将其路由到其中某个服务，请求会失败并返回 `HTTP 400: Stream must be set to true`。请选择 `protocols` 包含 `openai-chat-completions`（或其他非 responses 协议）的服务，以避免此问题。

**链接**

- [Hermes Agent (Nous Research)](https://github.com/NousResearch/hermes-agent)
- [AntSeed skill: hermes-antseed（包含 systemd、远程主机、支付门户的完整演练）](https://github.com/AntSeed/antseed/tree/main/skills/hermes-antseed)

---

## GenLayer Studio

*在 GenLayer Studio 验证器中将 AntSeed 用作推理提供商。*

- **类别：** 框架
- **线格式：** OpenAI Chat Completions
- **设置时间：** 约 5 分钟
- **页面：** https://antseed.com/integrations/genlayer-studio

**面向代理的简要说明：** 在 GenLayer Studio 中：针对每个模型，将一个 JSON 文件放入 `backend/node/create_nodes/default_providers/`，其中包含 `provider: "antseed"`、`plugin: "openai-compatible"`、`model: "<service-id>"` 和 `plugin_config.api_url: "http://host.docker.internal:8377"`（不要添加 `/v1` 后缀，插件会自动追加）。将 `"antseed"` 添加到提供商枚举，并将 if/then 规则同时添加到 `backend/.../providers_schema.json` 和 `frontend/.../providers_schema.json`。在 `.env` 中设置 `ANTSEED_API_KEY=antseed`。使用 `genlayer up --reset` 重启。用户必须运行 VPR 或 `antseed buyer start`，并固定一个提供所列 `model` ID 的对等节点。

**GenLayer Studio 是什么。** Studio 运行会咨询 LLM 以达成共识的 *智能合约* 验证器。每个验证器都通过一个提供商条目进行配置，该条目包含 `provider` 名称、`plugin`（`openai-compatible` / `anthropic` / `google` / `ollama` / `custom` 之一）、`model` ID，以及包含 `api_url` 和 `api_key_env_var` 的 `plugin_config`。

**AntSeed 如何接入。** 针对每个模型，将一个 JSON 文件放入 `backend/node/create_nodes/default_providers/`，其中包含 `plugin: "openai-compatible"` 和 `api_url: "http://host.docker.internal:8377"`。Studio 的 openai-compatible 插件会自动追加 `/v1/chat/completions`，因此买方代理会收到标准的 OpenAI Chat 请求，并将其路由到你固定的对等节点。参照现有的 LibertAI 条目（PR #1526），这是最接近的对应实现：一个 openai-compatible 主机，其托管基础 URL 被替换为你的本地代理。

**为什么使用 `host.docker.internal`，而不是 `localhost`。** Studio 的后端通过 `genlayer up` 在 Docker 中运行。在容器内部，`localhost` 指向容器自身，而不是你的主机，因此无法访问主机上的 AntSeed 买方代理。Mac/Windows Docker 将主机暴露为 `host.docker.internal`；在 Linux 上，必须在 `docker-compose.yml` 中为后端服务添加 `extra_hosts: ["host.docker.internal:host-gateway"]`，或使用 `--network=host` 运行。

**前置条件**

- 已克隆并在本地使用 `genlayer up` 运行 GenLayer Studio（参见 https://docs.genlayer.com/developers/intelligent-contracts/tools/genlayer-studio）

**安装**

- **仅限 Linux：让 `host.docker.internal` 能够在后端容器内部解析**
  ```yaml
  # docker-compose.yml - patch the backend (jsonrpc) service
  services:
    jsonrpc:
      extra_hosts:
        - "host.docker.internal:host-gateway"
  ```
  > Mac 和 Windows Docker Desktop 已自动将主机暴露为 `host.docker.internal`，请在这些平台上跳过此步骤。编辑后使用 `genlayer up --reset` 重启。

**配置**

```json title="backend/node/create_nodes/default_providers/antseed_claude-sonnet-4-6.json"
{
  "provider": "antseed",
  "plugin": "openai-compatible",
  "model": "claude-sonnet-4-6",
  "config": {},
  "plugin_config": {
    "api_key_env_var": "ANTSEED_API_KEY",
    "api_url": "http://host.docker.internal:8377"
  }
}
```

```json title="backend/node/create_nodes/default_providers/antseed_deepseek-v4-flash.json"
{
  "provider": "antseed",
  "plugin": "openai-compatible",
  "model": "deepseek-v4-flash",
  "config": {},
  "plugin_config": {
    "api_key_env_var": "ANTSEED_API_KEY",
    "api_url": "http://host.docker.internal:8377"
  }
}
```

```bash title=".env  (next to docker-compose.yml)"
# AntSeed authenticates with your local identity key, not this value.
# Studio's openai-compatible plugin still requires the env var to be set.
ANTSEED_API_KEY=antseed
```

```json title="backend/node/create_nodes/providers_schema.json  AND  frontend/src/assets/schemas/providers_schema.json"
// In each schema, add "antseed" to the provider enum's examples…
"provider": {
  "type": "string",
  "examples": ["ollama", "openrouter", "libertai", "antseed", …]
},

// …and add an if/then block locking provider:antseed to plugin:openai-compatible
{
  "if":   { "properties": { "provider": { "const": "antseed" } } },
  "then": { "properties": { "plugin":   { "const": "openai-compatible" } } }
}
```

_两个 schema 文件必须保持同步：后端使用其中一个进行验证，前端使用另一个生成 UI 下拉菜单。这正是 PR #1526 为 LibertAI 所做的改动。_

**建议的模型：** `claude-sonnet-4-6`、`deepseek-v4-flash`、`gpt-oss-120b`、`qwen3-coder-480b`

每个 provider JSON 文件恰好固定一个 `model`。Studio 会在验证器创建 UI 中枚举这些模型；请选择你确认已固定的对等节点提供的服务（使用 `antseed network peer <peerId> --json | jq '.matchingServices[].service'` 检查）。后续若要公开更多模型，只需添加更多 `antseed_<model>.json` 文件，无需编辑 schema。

**测试**

- **重启 Studio，使其重新扫描 `default_providers/`**
  ```bash
  genlayer up --reset
  ```
  > `backend/node/create_nodes/providers.py` 中的 `get_default_providers()` 会在启动时读取该目录中的每个 `*.json` 文件，根据 `providers_schema.json` 进行验证，并缓存结果。Schema 验证错误会中止启动，并显示出错文件路径，请留意日志。
- **在 Studio UI 中使用 provider "antseed" 创建新的验证器**
  > 你应当能在下拉菜单中看到 `antseed_*.json` 模型 ID。保存并触发一个调用 `genlayer.eq_principle.prompt(…)` 的合约：请求将命中 AntSeed 代理上的 `http://host.docker.internal:8377/v1/chat/completions`，并被转发到你固定的对等节点。
- **确认验证器调用已命中 AntSeed**
  ```bash
  antseed buyer metering
  ```
  > 每次验证器调用都会为你固定的对等节点向通道增加 token 和 USDC。在 Studio 发起请求后运行此命令，即可看到总量更新。要实时轮询：`watch -n 1 antseed buyer metering`。

**故障排除**

- *在 `genlayer up` 时出现 `Error validating file … antseed_*.json`* — Schema 拒绝了你的 provider JSON。最常见的原因是缺少针对 `provider:antseed` 的 if/then 规则，导致它以错误的 `plugin` 继续匹配。在 *`backend/.../providers_schema.json`* 和 *`frontend/.../providers_schema.json`* 中都添加该规则。编辑后运行 `genlayer up --reset`。
- *验证器挂起，然后报错连接 `host.docker.internal:8377` 时出现 `Connection refused`* — 后端容器无法访问你的主机。在 Linux 上，于 `docker-compose.yml` 的 backend service 下添加 `extra_hosts: ["host.docker.internal:host-gateway"]`（参见安装步骤 2）。在 Mac/Windows 上，确认 Docker Desktop 正在运行，并且 AntSeed 代理已启动：使用 `docker compose exec jsonrpc curl …` 从容器内运行 `curl http://host.docker.internal:8377/v1/models`。
- *验证器返回 `no_peer_pinned`* — 买方代理中没有固定任何 peer。运行 `antseed network browse`，选择一个，然后执行 `antseed buyer connection set --peer <peerId>`。或者，通过扩展 openai-compatible plugin 发送按请求设置的 `x-antseed-pin-peer` header；标准 schema 目前未公开此项，因此会话固定是最省事的方式。
- *使用例如 `claude-sonnet-4-6` 的验证器返回 `404 model_not_found`* — 你固定的 peer 未声明该 service id。运行 `antseed network peer <peerId> --json | jq '.matchingServices[].service'` 查看它实际提供的服务。固定另一个 peer，或者移除该 `antseed_<model>.json` 文件。
- *重启后的首次调用需要 5–15 秒* — AntSeed 会在向新 peer 发送的第一个请求中打开支付通道（一次 Base-mainnet 交易）。后续调用会复用该通道。在触发 Studio 前，使用 `curl -s http://localhost:8377/v1/chat/completions -d '{"model":"<id>","messages":[{"role":"user","content":"hi"}]}'` 进行预热。

**注意事项**

- AntSeed 是本地守护进程，而非托管端点。每个 Studio 操作员都必须在自己的机器上运行 VPR 或 `antseed buyer start`，并为其钱包充值；不存在中央账户。
- AntSeed 网络中存在免费服务（`in: 0, out: 0`），但使用付费服务需要在 Base 上存入 USDC。VPR 会在首次启动时引导用户完成此操作；CLI 将其作为 `antseed payments` 提供。

**GenLayer Studio 如何与 AntSeed 通信**

- **GenLayer Studio 发送的线格式：** OpenAI Chat Completions（访问买方代理上的 `/v1/chat/completions`）。
- **最匹配的服务：** `protocols` 数组中包含 `openai-chat-completions` 的任何服务 — 这是 peer 声明为原生支持的协议，因此流量可直接通过，不产生转换开销。
- **如何检查 peer：** 运行 `antseed network peer <peerId> --json`，并查看每个模型的 `peer.providerServiceApiProtocols[provider].services[service]`。browse 命令也会为每个 peer 显示相同字段。
- **协议不同时：** AntSeed 的 `@antseed/api-adapter` 会实时在 OpenAI Chat Completions 与服务原生协议之间转换。因此，来自 GenLayer Studio 的请求仍可以访问仅声明其他协议的服务 — 只是会额外经过一个小型转换步骤。
- **注意：** 唯一声明的协议为 `openai-responses` 的服务需要流式传输。如果 GenLayer Studio 发送非流式请求，而代理将其路由到这些服务之一，调用会因 `HTTP 400: Stream must be set to true` 而失败。请选择 `protocols` 包含 `openai-chat-completions`（或其他非 responses 协议）的服务以避免此问题。

**链接**

- [GenLayer Studio 仓库](https://github.com/genlayerlabs/genlayer-studio)
- [Studio 文档](https://docs.genlayer.com/developers/intelligent-contracts/tools/genlayer-studio)
- [参考 PR（LibertAI）](https://github.com/genlayerlabs/genlayer-studio/pull/1526)
- [providers_schema.json（事实来源）](https://github.com/genlayerlabs/genlayer-studio/blob/main/backend/node/create_nodes/providers_schema.json)

---

## Vercel AI SDK

*使用 `@ai-sdk/openai-compatible`，通过 `generateText` / `streamText` / `generateObject` 调用 AntSeed。*

- **类别：** 框架
- **网络格式：** OpenAI Chat Completions
- **配置时间：** 约 5 分钟
- **页面：** https://antseed.com/integrations/vercel-ai-sdk

**面向 agent 的 TL;DR：** 创建 `createOpenAICompatible({ name: 'antseed', baseURL: 'http://localhost:8377/v1', apiKey: 'antseed' })`，然后使用 `antseed('<service-id>')` 作为模型。使用 @ai-sdk/openai-compatible（不要使用 @ai-sdk/openai）。服务 id 来自 GET http://localhost:8377/v1/models。针对单个请求覆盖 peer：在 generateText/streamText 中传入 headers: { 'x-antseed-pin-peer': '<peerId>' }。

**AI SDK 是什么。** Vercel 的 `ai` 包是一个与 provider 无关的 TypeScript 工具包，用于构建 LLM 应用和 agent。你选择一个*provider*（一个小型适配器包），从中实例化模型，然后将该模型传入框架提供的某个原语：`generateText`、`streamText`、`generateObject` 或 `streamObject`。AI SDK 会为你处理工具调用、结构化输出、消息历史记录和流式传输。

**AntSeed 如何接入。** AntSeed 在 `http://localhost:8377/v1` 提供 OpenAI Chat 兼容接口，因此正确的适配器是 `@ai-sdk/openai-compatible`（不是 `@ai-sdk/openai`）。官方 OpenAI provider 被限制在 OpenAI 的 API 表面上，并且会静默丢弃第三方字段；openai-compatible provider 才是 Vercel 自己的文档针对代理、网关以及任何支持 Chat Completions 的非 OpenAI 服务器所推荐的 provider。你只需通过 `baseURL` 将其指向 AntSeed proxy，并传入任意非空的 `apiKey` 占位符即可 - proxy 使用你的本地 identity key 进行身份验证，而不是使用此 header。

**哪些模型 id 可用。** provider 调用的第一个参数是 AntSeed 的*服务 id*（例如 `claude-sonnet-4-6`、`deepseek-v4-flash`）。它必须与已固定 peer 所声明的服务匹配 - 使用 `curl http://localhost:8377/v1/models` 进行确认。

**前置条件**

- Node.js 18 或更高版本

**安装**

- **安装 SDK 和 openai-compatible provider**
  ```bash
  npm install ai @ai-sdk/openai-compatible zod
  ```
  > 只有在调用 `generateObject` / `streamObject` 时才需要 `zod`。如果只是生成普通文本，可以跳过它。

**配置**

```typescript
// antseed.ts - a single provider instance you can import everywhere
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export const antseed = createOpenAICompatible({
  name: 'antseed',
  baseURL: 'http://localhost:8377/v1',
  apiKey: 'antseed', // any non-empty string - proxy ignores this header
  includeUsage: true, // surface token counts in streaming responses too
});
```

```typescript
// stream.ts
import { streamText } from 'ai';
import { antseed } from './antseed';

const result = streamText({
  model: antseed('claude-sonnet-4-6'), // an AntSeed service id
  prompt: 'Why is the sky blue?',
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}

console.log('\nusage:', await result.usage);
```

```typescript
// structured.ts - generateObject works the same way
import { generateObject } from 'ai';
import { z } from 'zod';
import { antseed } from './antseed';

const { object } = await generateObject({
  model: antseed('claude-sonnet-4-6'),
  schema: z.object({
    title: z.string(),
    bullets: z.array(z.string()).min(3).max(5),
  }),
  prompt: 'Summarize the AntSeed buyer-proxy README as a slide.',
});
console.log(object);
```

**推荐模型：** `claude-sonnet-4-6`、`deepseek-v4-flash`、`gpt-oss-120b`、`qwen3-coder-480b`

你传递给 `antseed('<id>')` 的字符串会原样作为 `model` 转发到 OpenAI Chat 请求中。运行 `curl -s http://localhost:8377/v1/models | jq '.data[].id'`，即可准确查看固定对等端提供的模型。

**测试**

- **使用 `tsx` 运行冒烟测试**
  ```bash
  npx tsx stream.ts
  ```
  *输出示例：*
  ```
  The sky is blue because shorter (blue) wavelengths of sunlight
  scatter much more than longer (red) wavelengths in Earth's atmosphere…
  
  usage: { promptTokens: 14, completionTokens: 78, totalTokens: 92 }
  ```
  > 如果看到 `404 model_not_found`，说明固定对等端没有提供你传入的 id。如果看到 `no_peer_pinned`，请先运行 `antseed buyer connection set --peer <peerId>`，或者发送按请求设置的请求头（下一步）。
- **按请求覆盖对等端（无需固定会话）**
  ```typescript
  // Use `headers` to fan out to different peers per call.
  const result = streamText({
    model: antseed('claude-sonnet-4-6'),
    prompt: 'hi',
    headers: {
      'x-antseed-pin-peer': 'cccccccccccccccccccccccccccccccccccccccc',
    },
  });
  ```
  > 当一个 Node 进程为多个租户提供服务，并且希望将每个请求路由到不同对等端时，这种方式很有用。该请求头会覆盖会话固定设置，但只对当前调用生效。

**故障排查**

- *TypeScript 报错，指出 `antseed` 没有调用签名* —— 你从 `@ai-sdk/openai` 而不是 `@ai-sdk/openai-compatible` 导入了。请切换包 - SDK 的官方 OpenAI provider 被锁定为 OpenAI 的服务 id，并会拒绝未知的服务 id。
- *`generateObject` 返回格式错误的 JSON* —— AI SDK 对 JSON Schema 支持的要求很严格。只有在固定对等端的服务原生支持 OpenAI 风格的结构化输出时，才将 `supportsStructuredOutputs: true` 传递给 `createOpenAICompatible`。如果不确定，请保持关闭 - SDK 会回退到基于工具调用的 JSON，这种方式适用于所有环境。
- *已设置 `includeUsage`，但 `result.usage` 未定义* —— AntSeed 后面的某些上游 provider 不会在流式响应中发送 usage。若需要确定的 token 计数，请尝试使用 `generateText` 而不是 `streamText`；否则运行 `antseed buyer metering`，以获取 AntSeed 自身测量的权威分渠道 token + USDC 总量。
- *浏览器/edge runtime 因 `fetch` 错误而失败* —— AntSeed proxy 监听 `127.0.0.1:8377`，部署网站上的浏览器标签页无法访问该地址。AI SDK 设计为在服务器端运行（Route Handlers、Server Actions、你自己的机器上的 edge functions，或 Node 进程）；当模型是 AntSeed 时，不要从 client component 调用它。

**Vercel AI SDK 如何与 AntSeed 通信**

- **Vercel AI SDK 发送的线路格式：** OpenAI Chat Completions（在买方代理上访问 `/v1/chat/completions`）。
- **最匹配的服务：** `protocols` 数组包含 `openai-chat-completions` 的任何服务 —— 这是对等方声明的原生支持协议，因此流量无需任何转换开销即可通过。
- **如何检查对等方：** 运行 `antseed network peer <peerId> --json`，并针对每个模型查看 `peer.providerServiceApiProtocols[provider].services[service]`。browse 命令会按对等方公开相同的字段。
- **协议不一致时：** AntSeed 的 `@antseed/api-adapter` 会在运行时将 OpenAI Chat Completions 与服务的原生协议相互转换。因此，来自 Vercel AI SDK 的请求仍然可以访问只声明了其他协议的服务，只是会增加一个小型转换步骤。
- **注意事项：** 唯一声明 `openai-responses` 协议的服务要求使用流式传输。如果 Vercel AI SDK 发送非流式请求，而代理将其路由到这些服务之一，调用会失败并返回 `HTTP 400: Stream must be set to true`。请选择 `protocols` 包含 `openai-chat-completions`（或其他非 responses 协议）的服务，以避免此问题。

**链接**

- [AI SDK 文档](https://ai-sdk.dev/docs)
- [@ai-sdk/openai-compatible provider 文档](https://ai-sdk.dev/providers/openai-compatible-providers)
- [`ai` on npm](https://www.npmjs.com/package/ai)

---

## LangChain（Python）

*即插即用的 `ChatOpenAI(base_url=…)` —— 可用于 chains、LCEL 和 LangGraph agents。*

- **类别：** 框架
- **线路格式：** OpenAI Chat Completions
- **设置时间：** 约 5 分钟
- **页面：** https://antseed.com/integrations/langchain-python

**面向 agents 的 TL;DR：** 使用 `langchain-openai` 中的 `ChatOpenAI(model='<service-id>', base_url='http://localhost:8377/v1', api_key='antseed')`。可直接用于 LCEL、create_react_agent、RAG 和 with_structured_output。按请求覆盖对等方：`extra_headers={'x-antseed-pin-peer': '<peerId>'}`。服务 id 来自 `GET http://localhost:8377/v1/models`。ChatOpenAI 不会保留推理轨迹（reasoning_content 等）——如需这些信息，请使用 Responses endpoint。

**LangChain 是什么。** LangChain 是用于组合 LLM、工具、检索器、记忆和 agents 的 Python 框架。聊天模型接口是 `BaseChatModel`；`langchain-openai` 中的 `ChatOpenAI` 是一个具体子类，通过 OpenAI Chat Completions 线路格式进行通信。

**AntSeed 如何接入。** 将 `base_url="http://localhost:8377/v1"` 和任意非空的 `api_key` 传递给 `ChatOpenAI`。实例创建完成后，所有接受聊天模型的基础组件 —— LCEL 管道（`prompt | llm | parser`）、工具调用 agents、`create_react_agent`、LangGraph 节点、RAG chains，以及通过 `with_structured_output` 绑定结构化输出 —— 都会经由 AntSeed 路由，无需进一步修改。

**需要了解的一点。** LangChain 的 `ChatOpenAI` 在设计上严格遵循 OpenAI 规范：它不会保留某些第三方服务器返回的非标准响应字段，例如 `reasoning_content`、`reasoning` 或 `reasoning_details`。对于聊天、工具调用和结构化输出，这没有问题。如果你明确需要模型的推理轨迹，可以通过其他 provider package 使用带有 OpenAI Responses endpoint（`/v1/responses`）的 AntSeed 买方代理，或者使用会将推理内容内联返回的模型。

**前提条件**

- Python 3.10 或更高版本

**安装**

- **安装 LangChain 和 OpenAI 集成**
  ```bash
  pip install -U langchain langchain-openai
  ```

**配置**

```python
# antseed_llm.py - import this once, reuse everywhere.
from langchain_openai import ChatOpenAI

antseed = ChatOpenAI(
    model="claude-sonnet-4-6",          # an AntSeed service id
    base_url="http://localhost:8377/v1",
    api_key="antseed",                   # any non-empty string
    temperature=0.7,
    # max_completion_tokens=2048,        # uncomment for hard caps
)

print(antseed.invoke("Hello").content)
```

```python
# pipeline.py - LCEL chain. Identical to OpenAI; the swap is invisible.
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from antseed_llm import antseed

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a concise technical writer."),
    ("human", "Explain {topic} in one paragraph."),
])

chain = prompt | antseed | StrOutputParser()
print(chain.invoke({"topic": "payment channels"}))
```

```python
# tools.py - tool-calling agent. Works because AntSeed forwards OpenAI tool calls verbatim.
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from antseed_llm import antseed

@tool
def get_weather(city: str) -> str:
    """Return the current weather for a city."""
    return f"It's 22°C and sunny in {city}."

agent = create_react_agent(antseed, [get_weather])
result = agent.invoke({
    "messages": [("user", "What's the weather in Lisbon?")]
})
print(result["messages"][-1].content)
```

**建议模型：** `claude-sonnet-4-6`、`deepseek-v4-flash`、`gpt-oss-120b`、`qwen3-coder-480b`

选择 `protocols` 数组中包含 `openai-chat-completions` 的服务（大多数原生支持；其余服务会由 `@antseed/api-adapter` 自动转换）。工具调用和结构化输出依赖于服务支持 OpenAI 风格的函数调用语法；在构建大型 Agent 前，请先通过快速冒烟测试确认。

**测试**

- **运行基础示例**
  ```bash
  python antseed_llm.py
  ```
  *示例输出：*
  ```
  Hello! How can I help you today?
  ```
- **按请求覆盖对等节点（无需固定会话）**
  ```python
  # extra_headers is forwarded as-is to the proxy.
  from langchain_openai import ChatOpenAI
  
  llm = ChatOpenAI(
      model="claude-sonnet-4-6",
      base_url="http://localhost:8377/v1",
      api_key="antseed",
      extra_headers={
          "x-antseed-pin-peer": "cccccccccccccccccccccccccccccccccccccccc",
      },
  )
  print(llm.invoke("hi").content)
  ```
  > 当单个 Python 进程需要针对每次调用分发到不同对等节点时使用此方式（多租户、计划任务、跨对等节点 A/B 测试）。
- **验证请求确实经过 AntSeed**
  ```bash
  antseed buyer metering
  ```
  > `buyer metering` 会读取本地 SQLite 日志，并打印每个通道的 token 和 USDC 总计。执行 `python` 调用后，你固定的对等节点对应通道应显示非零的输入/输出 token。(`buyer status` 是快照视图，它显示活跃通道数量，但不显示每次调用的用量。)

**故障排查**

- *`openai.NotFoundError: 404 … model_not_found`* — 固定的对等节点未提供你传入的 id。使用 `curl http://localhost:8377/v1/models | jq` 确认，并固定到其他对等节点，或修改 `model=` 参数。
- *`openai.APIConnectionError: Connection refused`* — buyer 代理未运行。使用 `antseed buyer start` 启动（或打开 VPR 桌面应用）。重试 Python 请求前，确认 `curl http://localhost:8377/v1/models` 能正常工作。
- *`with_structured_output` 返回正确的 schema，但字段为空* — 固定的对等节点背后的模型可能不支持 OpenAI 工具调用语法，或者你对不支持该模式的服务使用了 `method="json_mode"`。尝试使用 `method="function_calling"`（默认值），并优先选择在 `antseed network peer <peerId> --json` 中标记为 `coding` 或 `tools` 的服务。
- *使用 `stream=True` 流式传输时响应在中途被截断* — 你的代码与 buyer 代理之间存在缓冲代理（nginx、Cloudflare）。AntSeed 代理本身不会缓冲 SSE。请绕过中间代理，或关闭其缓冲（在 nginx 中设置 `proxy_buffering off;`）。
- *已知会生成推理内容的模型却缺少推理轨迹* — 请参阅上面的第三段：`langchain-openai` 不会保留非标准响应字段。如需完整的推理支持，请使用支持 Responses 的客户端，通过 OpenAI Responses 端点（代理上的 `POST /v1/responses`）路由请求，或者选择将推理内容直接放入 `content` 的模型。

**LangChain (Python) 如何与 AntSeed 通信**

- **LangChain (Python) 发送的线路格式：** OpenAI Chat Completions（访问 buyer 代理上的 `/v1/chat/completions`）。
- **最匹配的服务：** `protocols` 数组中包含 `openai-chat-completions` 的任何服务 — 这是对等节点声明原生支持的协议，因此流量无需任何转换即可通过。
- **如何检查对等节点：** 运行 `antseed network peer <peerId> --json`，并针对每个模型查看 `peer.providerServiceApiProtocols[provider].services[service]`。浏览命令会按对等节点公开相同的字段。
- **协议不一致时：** AntSeed 的 `@antseed/api-adapter` 会在运行时将 OpenAI Chat Completions 与服务的原生协议相互转换。因此，来自 LangChain (Python) 的请求仍然可以访问仅声明了其他协议的服务 — 只是会增加一个小型转换步骤。
- **注意事项：** 唯一声明的协议为 `openai-responses` 的服务要求使用流式传输。如果 LangChain (Python) 发送非流式请求，而代理将其路由到此类服务，调用会失败并返回 `HTTP 400: Stream must be set to true`。请选择 `protocols` 包含 `openai-chat-completions`（或其他非 responses 协议）的服务，以避免此问题。

**链接**

- [LangChain 文档](https://python.langchain.com)
- [ChatOpenAI 集成页面](https://docs.langchain.com/oss/python/integrations/chat/openai)
- [`langchain-openai` on PyPI](https://pypi.org/project/langchain-openai/)

---

## curl / 原始 HTTP

*通过普通 HTTP 访问代理，适用于脚本和调试。*

- **类别：** 原始 HTTP
- **传输格式：** 多格式
- **设置时间：** 约 1 分钟
- **页面：** https://antseed.com/integrations/curl

**面向代理的 TL;DR：** 将 JSON POST 到 http://localhost:8377/v1/messages、/v1/chat/completions 或 /v1/responses。无需 Authorization 请求头。

买方代理是一个原生 HTTP 服务器。任何能够发起 HTTP POST 的工具都可以使用。代理公开了三个端点：

• `POST /v1/messages` - Anthropic Messages 格式  
• `POST /v1/chat/completions` - OpenAI Chat Completions  
• `POST /v1/responses` - OpenAI Responses API

**配置**

```bash
# Anthropic format
curl http://localhost:8377/v1/messages \
  -H 'content-type: application/json' \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# OpenAI Chat format
curl http://localhost:8377/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{
    "model": "deepseek-v3.1",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

**curl / 原始 HTTP 如何与 AntSeed 通信**

curl / 原始 HTTP 可以发送 AntSeed 支持的任意传输格式。将请求格式与每个服务的 `protocols` 数组进行匹配（每个服务通过 `providerServiceApiProtocols` 发布该数组）——如果匹配，请求将原样透传；如果不匹配，`@antseed/api-adapter` 会即时进行转换。

| 端点 | 传输格式 | 原生匹配（发布该格式的服务） |
|----------|-------------|------------------------------------|
| `/v1/messages` | Anthropic Messages | `anthropic-messages` |
| `/v1/chat/completions` | OpenAI Chat Completions | `openai-chat-completions` |
| `/v1/responses` | OpenAI Responses | `openai-responses` |

---

## 面向编写集成的代理

如果你是正在帮助用户接入 AntSeed 的编码代理，标准流程如下：

1. 检测用户正在使用的工具。
2. 按工具名称在此文件中查找。
3. 如果工具尚未安装，执行 **安装**步骤。
4. 编辑配置文件之前，先读取现有文件，保留无关的用户设置，只合并 AntSeed provider/profile 配置块。
5. 应用**配置**块（环境变量、配置文件编辑或 GUI 操作说明）。
6. 使用 **测试**命令进行验证。
7. 选择一个 peer：`antseed network browse` → `antseed network peer <peerId> --json`。
   将工具的传输格式与服务的 `protocols` 数组进行匹配——不要匹配
   `provider` 字段。然后执行 `antseed buyer connection set --peer <peerId>`。
8. 如果工具未列出：选择 **curl / 原始 HTTP** 条目并进行适配——其契约保持稳定。

如果某一步失败，请阅读**故障排除**条目；大多数故障都能明确对应到相关条目。

## 添加新的集成

编辑 `apps/website/src/integrations/integrations.ts`（位于
https://github.com/AntSeed/antseed）并提交 PR。/integrations Hub、每个工具的页面以及此 skill.md 都由同一个文件生成。