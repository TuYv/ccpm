# AgentLink 技能

AgentLink 为 AI agent 提供经过验证、有人类背书的链上身份。借助此技能，agent 可以为任意 HTTP 请求签名，以受信任 agent 的身份出现在链上注册表中，并访问 Base 主网上合作伙伴提供的免费端点。

## 技能条件

当以下两项均满足时，agent 持有 AgentLink 技能：

- **已关联并注册** — agent 钱包已关联到经过生物映射的人类所有者；这也是在 `BiomapperAgentRegistry` 中注册该 agent 的同一笔链上写入操作。`agentlink status --network base --json` 会报告 `"linked": true` 和 `"active": true`。
- **签名** — agent 能生成有效的 `agentlink` 标头，该标头由 agent 密钥签名（密钥保存在加密的 CLI 密钥库中，或由 SDK 的外部签名者持有）。

---

## 阶段 1 — 获取

使用 `npx` 运行 CLI（无需全局安装）并存储 agent 私钥。此时尚不会进行链上写入操作——注册会在阶段 2 的 Linker 步骤中创建。

```bash
# 将 agent 私钥存储在加密的本地密钥库中。
# 系统会提示你输入密钥和密码。
npx @techdigger/humanode-agentlink-cli keystore set

# 显示根据已存储密钥派生出的 agent 钱包地址
npx @techdigger/humanode-agentlink-cli keystore address
```

更倾向于全局安装？`npm install -g @techdigger/humanode-agentlink-cli` 会使 `agentlink` 命令可以直接使用（从这里开始，本指南将使用简写形式 `agentlink ...`）。对于 CI 或密钥管理器流程，请使用 `--private-key-stdin`，而不是交互式密钥库。

---

## 阶段 2 — 验证

人类所有者必须完成生物映射，并将其钱包关联到 agent。agent 无法独自完成此阶段——它会生成一个 URL，供人类打开。

### 人类前置条件

人类所有者必须先完成以下两个步骤：

1. 打开 [Biomapper](https://mainnet.biomapper.hmnd.app/biomap) 并完成生物映射。
2. 将其生物映射桥接到 Base。

### 生成 Linker URL

将 `0x<OWNER_ADDRESS>` 替换为人类所有者经过生物映射的钱包地址：

```bash
agentlink link --owner 0x<OWNER_ADDRESS> --network base --open
```

此命令会打印一个自包含的 URL（并可选择将其打开）。将此 URL 发送给人类所有者。他们打开该 URL，在 [app.agentlink.id](https://app.agentlink.id/) 的 AgentLink Linker 中查看请求，并签署关联交易。

### 确认技能已激活

```bash
agentlink status --network base --json
```

当 JSON 输出显示 `"linked": true` 和 `"active": true` 时，技能即已获取，阶段 2 也已完成。

`active` 反映所有者的生物映射状态。如果已关联的所有者钱包在当前 Biomapper generation 中不再处于生物映射状态，状态会变为 `"active": false`，免费增值访问会暂停，直到其重新进行生物映射——但关联本身会保留。

---

## 阶段 3 — 使用

### 使用 SDK 为请求签名

将 SDK 添加到 agent 项目中（这是 `@techdigger/humanode-agentlink` 运行时包，与上文使用的 `@techdigger/humanode-agentlink-cli` 分开）：

```bash
npm install @techdigger/humanode-agentlink
```

`createAgentLinkClient` 返回一个 `fetch` 包装器，会自动为每个请求附加 `agentlink` 请求头。请根据你的代理当前持有密钥的方式，采用对应形式提供代理密钥。

**选项 A — 原始私钥。** 最适合将密钥保存在环境变量或密钥管理服务中的自托管代理：

```typescript
import { createAgentLinkClient } from '@techdigger/humanode-agentlink'

const { fetch: agentFetch } = createAgentLinkClient({
  network: 'base',
  privateKey: process.env.AGENT_PRIVATE_KEY as `0x${string}`,
})
```

**选项 B — 外部签名器。** 当密钥位于 KMS、HSM 或密钥管理器中，且你不希望它进入进程时使用此选项——传入代理的公开地址以及一个 `sign` 回调：

```typescript
const { fetch: agentFetch } = createAgentLinkClient({
  network: 'base',
  address: agentAddress, // 你的代理公开地址
  sign: (message) => signer.sign(message), // 密钥保留在 KMS / HSM / 密钥管理器中
})
```

两种客户端都会以相同方式对请求进行签名并发送：

```typescript
// agentlink 请求头会自动附加
const response = await agentFetch('https://api.xona-agent.com/base-main/image/nano-banana', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'a futuristic city at sunset', aspect_ratio: '1:1', referenceImage: [] }),
})
```

如需构建仅供 curl、axios 或任意 HTTP 客户端使用的请求头值，`buildAgentLinkHeader` 接受相同的两种选项形式：

```typescript
import { buildAgentLinkHeader } from '@techdigger/humanode-agentlink'

// 选项 A — 原始密钥
const header = await buildAgentLinkHeader('https://api.xona-agent.com/base-main/image/nano-banana', {
  network: 'base',
  privateKey: process.env.AGENT_PRIVATE_KEY as `0x${string}`,
})

// 选项 B — 外部签名器
const header = await buildAgentLinkHeader('https://api.xona-agent.com/base-main/image/nano-banana', {
  network: 'base',
  address: agentAddress,
  sign: (message) => signer.sign(message),
})
// 按以下方式传递：agentlink: <header>
```

> 请将代理密钥保存在你现有的密钥管理位置。对于能够控制自身主机的自托管代理，将原始密钥放在环境变量中是可行的——只需确保它不会进入源代码管理或日志。如果密钥位于 KMS 或 HSM 中，请使用选项 B，以确保它永远不会跨越该边界。

### 对已签名请求进行冒烟测试

```bash
agentlink request https://api.xona-agent.com/base-main/image/nano-banana --network base
```

> `agentlink request` 仅发送 `agentlink` 请求头——不含请求正文。用它验证代理是否已关联且签名是否被接受。对于带有 JSON 请求正文的实际 POST 请求，请使用上述 SDK。

---

## 免费端点（Base 主网，现已上线）

这些合作伙伴端点对已关联的代理免费开放。完整示例和机器可读索引位于 [agentlink.id/docs/freemium-endpoints](https://agentlink.id/docs/freemium-endpoints)。

### XONA — 创意 AI 代理

| 端点 | 功能 |
| --- | --- |
| `POST https://api.xona-agent.com/base-main/video/short-generation` | 根据文本提示生成短视频 |
| `POST https://api.xona-agent.com/base-main/image/nano-banana` | 根据文本提示生成图像 |

所需请求头：`Content-Type: application/json` 和 `agentlink: <signed payload>`。

### WURK — 任务市场

WURK 在两个端点之间总共提供 **一次免费使用**。

| 端点 | 功能 |
| --- | --- |
| `GET https://wurkapi.fun/base/agentlink/xraid/xverified/small` | 委托一次 X（Twitter）刷屏任务 |
| `GET https://wurkapi.fun/base/agentlink/agenttohuman` | 委托一次代理到人工的任务 |

WURK 使用服务器签发的挑战流程——完整的签名步骤请参阅 [agentlink.id/docs/freemium-endpoints](https://agentlink.id/docs/freemium-endpoints)。

---

## 网络参考

| 配置 | 链 | 注册表 |
| --- | --- | --- |
| `base`（主网） | `eip155:8453` | `0x7Ef35Bf180dcDAA5AB6cdEC7e9DED6230aD12263` |