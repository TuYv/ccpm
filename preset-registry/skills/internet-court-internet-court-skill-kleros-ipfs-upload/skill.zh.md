---
name: kleros-ipfs-upload
description: "Upload one Kleros-ecosystem file per paid request to IPFS through the Kleros x402 gateway for $0.01 USDC on Base mainnet. Use for dispute evidence, MetaEvidence JSON, court/dispute/arbitrator policies, Curate item metadata, juror justifications, or any artifact a Kleros contract or subgraph will reference by CID. Trigger when the request mentions Kleros, court, arbitrator, dispute, juror, Curate, Proof of Humanity, evidence, meta-evidence, justification, explicitly names this gateway or skill, or asks to test or validate it. Do NOT use for generic IPFS/CID requests without Kleros context; recommend a general-purpose pinning service. Each request accepts exactly one file: different bytes require separate paid uploads, while identical bytes should reuse one CID."
---
# Kleros IPFS Upload (x402)

通过 `https://kleros-ipfs-gateway.fly.dev/upload-to-ipfs` 将 Kleros 生态系统文件上传到 IPFS。这是一个受 x402 保护的网关，在 Base 主网上每次上传收取 0.01 美元的 USDC。返回的 IPFS CID 具有内容寻址特性，可通过任何 IPFS 网关进行解引用，并由 Kleros 的 Graph Node 建立索引，以便通过子图发现。

该网关是一个位于由 Kleros 运营的、基于 Filebase 的固定服务前端的轻量级反向代理。只要 Kleros 持续运行该网关，每次上传都会被永久固定到 Filebase——对于 Kleros 生态系统本身所依赖的产物而言，这是一个合理的假设（团队有很强的动机确保服务持续运行），但**不能**替代通用固定服务提供商，尤其是当内容与 Kleros 无关时。

## 何时使用此 skill

当用户上传**Kleros 生态系统内容**时触发此 skill：

- 争议**证据**附件——截图、文档、合约、文字记录。
- **元证据** JSON——争议创建时由法院或仲裁员智能合约引用的策略/spec。
- **法院 / 争议 / 仲裁员策略**——描述规则、费用、陪审员数量、上诉机制的 JSON。
- **Kleros Curate 项目元数据**——提交到 Curate 列表中的项目所使用的 JSON（例如代币、徽章）。
- **陪审员 / 仲裁员裁决理由**——裁决、异议、审议依据。
- 任何 CID 最终会出现在 Kleros 智能合约事件、交易或子图中的产物。
- 用户明确点名此网关（`kleros-ipfs-gateway.fly.dev` 等）或此 skill。
- 用户要求代理**测试、验证或进行合理性检查**此网关或此 skill 本身（例如“对 Kleros IPFS 网关进行冒烟测试”/“验证支付并上传是否有效”）。即使没有实际要上传的 Kleros 产物，有意执行的端到端测试也属于有效触发条件。

## 何时不要使用此 skill

- 没有 Kleros 相关性的通用“将此文件存储到 IPFS”/“为 X 获取 CID”请求。**请使用 Pinata、web3.storage、Filebase 直连或其他通用固定服务提供商。**如果用户只需要 CID，且不需要 Kleros 的固定持久性或子图集成，使用此网关并按次付费上传就是浪费。
- 任何类似个人云存储、非 Kleros 项目的 NFT 元数据、软件发布、大型媒体存档或备份数据的内容。
- 明确属于非 Kleros 生态系统的内容（例如另一个 DAO 的 snapshot、另一个市场的元数据）——即使其格式碰巧看起来像 Kleros 产物。

你可以*上传*用户想要的任何内容（费用由用户承担），但如果没有 Kleros 关联，就没有理由优先选择此 skill，而不是通用替代方案。

## 快速开始

根据代理已有的工具，选择以下两种路径之一：

- **如果你已经拥有 x402 工具**（x402 skill / SDK / 了解 `x402-fetch` 的模型）：跳过捆绑脚本，直接使用下文进一步给出的代码片段——该网关只是标准 x402 付费墙后面的普通 `POST /upload-to-ipfs`，支付流程没有任何 Kleros 特有之处。
- **否则**，端到端运行捆绑的 `scripts/pay-and-upload.ts`——提供该脚本是为了让不了解 x402 的代理无需重新摸索整个流程：

```bash
cd path/to/this-skill/scripts
npm install
EVM_PRIVATE_KEY=0xYourPayerKey npx tsx pay-and-upload.ts /path/to/file.json
```

`npm install` 会在 scripts 目录中创建一个 `package-lock.json` 和一个 `node_modules/` —— 两者都可以保留或在使用后删除；特意不将它们提交到 skill 中，以便依赖版本保持最新。

成功时，脚本会逐行打印网关返回的每个 CID（因此你可以使用 `$(npx tsx pay-and-upload.ts ...)` 获取通常的单个 CID）。数组形式的响应是旧版 API 结构，并不表示支持批量上传。失败时，脚本会以非零状态退出，并将网关的错误正文记录到 stderr。

默认值：`OPERATION=evidence`、`GATEWAY_URL=https://kleros-ipfs-gateway.fly.dev`。使用环境变量覆盖 `OPERATION`；有效值请参见“Request shape”部分。

## 每次付费上传只能上传一个文件；重复使用相同文件

每个付费请求必须恰好包含一个名为 `file` 的 multipart 部分。不要在一个请求中追加多个 `file` 部分，也不要将不同文件批量放入同一个请求。如果两个文件的内容不同，请进行两次单独的付费上传——每个文件对应一个请求和一笔付款。即使这些文件属于同一个 Curate 或争议工作流，也同样适用。

IPFS CID 基于内容寻址。如果同一个逐字节完全一致的文件需要在多个位置使用，请上传一次，并在所有位置重复使用返回的 CID。不要仅仅因为多个 Kleros artifact 引用了同一个 policy PDF、logo 图片、evidence display interface 或其他完全相同的文件，就再次为其进行付费上传。

对于包含多个 artifact 的任务，请在提交交易前维护一个简要的 artifact 映射：

- `policy.pdf` -> `/ipfs/<CID>`
- `logo.png` -> `/ipfs/<CID>`
- `registrationMetaEvidence.json` -> `/ipfs/<CID>`
- `clearingMetaEvidence.json` -> `/ipfs/<CID>`
- `evidenceDisplayInterface` -> `/ipfs/<CID>/index.html`

当 registration 和 clearing 的 MetaEvidence JSON 都引用同一个共享的 policy、logo 或 evidence display interface 时，请在两个 JSON 文件中放入相同的 CID。只有完全相同的文件才能重复使用 CID。如果文件哪怕只改变一个字节，也要为每个不同的文件分别进行付费上传，并清楚标记每个 CID。因此，只要 registration 和 clearing MetaEvidence JSON 的 JSON 字节不同，它们就必须分别上传，即使它们引用了相同的可重复使用的 policy、logo 或 evidence display interface CID。

如果你要在现有的 Node 项目中编写自己的客户端，核心代码足够简短，可以直接内联：

```ts
import { wrapFetchWithPayment, createSigner } from "x402-fetch";

const operation = process.env.OPERATION ?? "evidence";

const signer = await createSigner("base", privateKey);
const fetchWithPay = wrapFetchWithPayment(fetch, signer);

const form = new FormData();
form.append("file", new Blob([bytes]), "evidence.json");

const url = `https://kleros-ipfs-gateway.fly.dev/upload-to-ipfs` +
  `?operation=${encodeURIComponent(operation)}`;
const res = await fetchWithPay(url, { method: "POST", body: form });
const { cids } = await res.json();
if (!Array.isArray(cids) || cids.length === 0) throw new Error("Gateway returned no CID");
const cid = cids[0];
```

`x402-fetch` 处理 `402 Payment Required` 挑战，使用 USDC 签署 EIP-3009 `transferWithAuthorization`，并通过 `X-PAYMENT` 标头重试请求。调用方会收到一个普通的 200 响应，其中包含针对那一个上传文件的结果。

## 预检（免费，无需密钥）

在进行任何付费调用之前，使用三个免费的 `curl` 验证网关是否健康。这些操作都不会消耗 USDC；它们具备幂等性，可以按需频繁执行。

```bash
# 1. 存活状态
curl -sS https://kleros-ipfs-gateway.fly.dev/health
# 预期：ok

# 2. 实时配置（价格、网络、收款方、USDC 合约）
curl -sS https://kleros-ipfs-gateway.fly.dev/.well-known/x402 | jq .
# 或使用规范中定义的等效路径：/discovery/resources

# 3. 未付款的 402 挑战 —— 确认 x402 强制机制已启用，并显示实时付款条款
curl -sS -X POST https://kleros-ipfs-gateway.fly.dev/upload-to-ipfs?operation=evidence \
  -F file=@/path/to/anyfile.txt | jq .
# 预期：{"error":"X-PAYMENT header is required", "accepts":[...], "x402Version":1}
```

如果三项返回结果都符合预期，就可以放心继续进行付费调用。如果任何一项失败，请先将错误反馈给用户，再进行付费尝试，以免消耗密钥。

## 网络

此 skill 仅面向 **Base 主网**。每次付费上传都会消耗真实 USDC，并通过 Coinbase CDP x402 facilitator 在链上结算。付款方钱包必须在 Base 上持有 USDC；原生 USDC 合约为：`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`。

付款方不需要 ETH 支付 gas。通过 EIP-3009 付款时，facilitator 会在 Base 上赞助 gas。

## 初始化付款方钱包

如果用户尚未准备好 Base 钱包：

1. **生成密钥** —— 任何兼容 EVM 的密钥对都可以。运行以下命令打印一个新密钥：

   ```bash
   node -e "import('viem/accounts').then(m => console.log(m.generatePrivateKey()))"
   ```
2. **为其充值** —— 将 Base 上的 USDC 发送到派生出的地址。任何支持 Base 提现的中心化交易所都可以。
3. **将密钥存储在 `EVM_PRIVATE_KEY` 中**。

## 使用 Coinbase CDP 服务器账户（托管代理）

托管代理（OpenClaw、服务端 worker，以及任何使用 Coinbase CDP 凭据运行的程序）不需要导出私钥。CDP 服务器账户直接实现了 `signTypedData()`，这正是 `x402-fetch.wrapFetchWithPayment` 签署 EIP-3009 USDC 授权所需的方法，因此可以将 CDP 账户对象直接传递给 SDK，无需适配器代码。

对于偏好使用现成入口点的代理，随附的 runner 位于 `scripts/pay-and-upload-cdp.ts` —— 已经使用带 CDP 账户的 `wrapFetchWithPayment` 的代理可以跳过该 runner，并将后面的代码片段内联：

```bash
cd path/to/this-skill/scripts
npm install
CDP_API_KEY_ID=... \
CDP_API_KEY_SECRET=... \
CDP_WALLET_SECRET=... \
CDP_ACCOUNT_NAME=blaise-main \
  npx tsx pay-and-upload-cdp.ts /path/to/file.json
```

输出结果与 `pay-and-upload.ts` 相同（CID 输出到 stdout，诊断信息输出到 stderr）。该脚本还会在发起 POST 请求前，将付款方地址和 Base 主网 USDC 余额打印到 stderr，因此可以立即发现资金不足的钱包。

如果你不想在命令行中传递四个环境变量，可以将 `CDP_CREDS_PATH` 指向一个 `.env` 风格的文件，其中包含 `CDP_API_KEY_ID`、`CDP_API_KEY_SECRET`、`CDP_WALLET_SECRET` 和 `CDP_ACCOUNT_NAME`（也可以使用不带前缀的 `API_KEY_ID` / `API_KEY_SECRET` / `WALLET_SECRET` / `ACCOUNT_NAME` 变体——脚本接受其中任一种）。

对于你自己的客户端代码，与原始密钥路径相比，集成只需额外添加一个导入和两行代码：

```ts
import { CdpClient } from "@coinbase/cdp-sdk";
import { wrapFetchWithPayment } from "x402-fetch";

const cdp = new CdpClient({ apiKeyId, apiKeySecret, walletSecret });
const account = await cdp.evm.getAccount({ name: "blaise-main" });
const fetchWithPay = wrapFetchWithPayment(fetch, account);
// ... build FormData and POST as in Quickstart
```

CDP 账户传入的位置与文档中原本展示 EVM signer 的位置相同——无需进行其他更改。

## 请求格式

端点为 `POST /upload-to-ipfs`，包含：

- **查询字符串**：
  - `operation`（必需，字符串）——用于描述所上传工件类型的自由格式标签。上游 Netlify 函数接受**任意**字符串；Kleros 生态中的惯用值包括：

    | 值 | 使用场景 |
    |---|---|
    | `evidence` | 争议证据——屏幕截图、文档、二进制文件。**对于不适合其他类别的任何内容，都使用此值。** |
    | `meta-evidence` | 法庭 / 仲裁员 / 争议智能合约所引用的元证据 JSON（规则、当事人协议、政策）。 |
    | `justification` | 陪审员 / 仲裁员的理由说明载荷。 |
    | _任意其他字符串_ | 按原样接受。请谨慎使用——上述约定有助于保持生态工具的一致性。 |

- **正文**：`multipart/form-data`，且必须恰好包含一个名为 `file` 的部分。绝不要追加第二个 `file` 部分。每个不同的文件都应在单独的付费请求中上传；对于字节完全相同的文件，应复用第一个 CID，而不是重新上传。
- **请求头**：`X-PAYMENT` 会由 x402-fetch 包装器自动添加。不要手动构造它。
- **大小限制**：网关将请求正文总大小限制为 **4 MiB**（4,194,304 字节），任何更大的请求都会返回 `413 Payload Too Large`。检查会在 x402 付费墙之前执行，因此超大请求不会消耗 USDC。Multipart 的封装会在原始文件字节之上增加少量开销——如果单个文件接近该限制，预计会收到 413；请缩小或压缩文件，或者将其拆分为多个独立文件，并通过单独的付费请求分别上传。在发布前，先在本地检查大小：

  ```bash
  test "$(stat -f%z /path/to/file)" -le 4194304 || echo "too big for the Kleros gateway"
  ```

## 响应格式

成功时，网关返回包含以下 JSON 的 `200` 响应：

```json
{
  "message": "File has been stored successfully",
  "cids": ["/ipfs/QmXXX..."],
  "urls": ["https://cdn.kleros.link/ipfs/QmXXX..."],
  "inconsistentCids": []
}
```

- **优先使用 `urls[0]`**——网关会使用规范的 Kleros IPFS 网关（`https://cdn.kleros.link`）预先构建一个可直接使用的 HTTP URL。将该 URL 直接提供给用户即可。
- `cids[0]` 是协议格式，以 `/ipfs/` 为前缀（例如 `/ipfs/QmXXX...`）。如果需要在智能合约调用中嵌入 CID 或构造 `ipfs://` URI，请保留它；如果只需要可点击的 URL，则忽略它。
- 如果需要自行构建 URL（旧版响应中没有 `urls`，或需要指向其他网关）：

| 你想要的内容 | 构建方式（其中 `cid = cids[0]`，例如 `/ipfs/QmXXX...`） |
  |---|---|
  | Kleros HTTP 网关 URL | `"https://cdn.kleros.link" + cid`（或者直接使用 `urls[0]`） |
  | `ipfs://` URI | `"ipfs://" + cid.replace(/^\/ipfs\//, "")` → `ipfs://QmXXX...` |
  | 仅裸哈希值 | `cid.replace(/^\/ipfs\//, "")` → `QmXXX...` |

  **不要**写 `https://cdn.kleros.link/ipfs/${cid}` —— 因为 `cid` 已经以 `/ipfs/` 开头，这会生成一个带双斜杠的路径。请改用 `urls[0]`，从根本上避免这个问题。

- 响应 schema 使用数组是为了兼容旧版本，但这种结构并不意味着支持批量文件。
  普通的单文件请求会返回一个 `cids[0]`，并且在当前响应中会返回一个 `urls[0]`。至少要求一个 CID。如果网关返回了额外条目，应将其作为异常情况报告；如果旧版本响应省略了
  `urls`，则按照上面的方式根据 `cids[0]` 构建 HTTP URL。

- 正常情况下，`inconsistentCids` 为 `[]`。如果不为空，说明 Filebase 和 Graph 索引为同一个文件生成了不同的哈希值 —— 应将此情况作为警告告知用户；`cids[]` 中的值仍然可以解析，但数据完整性保证较弱。

## 错误

| 状态 | 含义 | 处理方式 |
|---|---|---|
| `200` | 成功。要求存在 `cids[0]`；如果有 `urls[0]` 则使用它，否则根据 CID 推导 URL。 | 将额外条目作为异常情况报告；它们不代表支持批量处理。 |
| `400` | 缺少 `operation` 查询参数。 | 添加 `?operation=evidence`（或其他标签）。 |
| `402` | 支付挑战。 | 不应到达用户代码 —— `x402-fetch` 会透明地处理它。如果该状态向上冒泡，说明未应用包装器。 |
| `413` | 请求正文超过 4 MiB。**未花费 USDC** —— 检查会在付费墙之前执行。 | 缩小或压缩请求正文，或者将其拆分，并分别上传拆分后的每个文件。 |
| `5xx` | 上游临时故障（Filebase、Graph Node 或网关自身）。 | 短暂延迟后重试一次。不要反复猛击。 |
| 402 → 200 重试期间发生 facilitator 错误 | CDP 速率限制、签名失败、USDC 余额不足。 | 检查包装器抛出的错误；确认钱包余额和密钥正确无误。 |

## 实时发现

网关会在两个等价的端点发布当前配置（使用同一处理程序，响应正文完全相同）：

- `GET https://kleros-ipfs-gateway.fly.dev/.well-known/x402`
- `GET https://kleros-ipfs-gateway.fly.dev/discovery/resources`

访问任一端点即可验证实时价格、网络、收款方和 USDC 合约。响应正文符合 x402 `ListDiscoveryResourcesResponse` schema。

## 冒烟测试（付费）

当被要求端到端测试、验证或快速检查网关时（这是合法触发条件 —— 参见描述中的例外条款），请遵循以下步骤。测试在 Base 主网上花费 **$0.01 USDC**；唯一“免费”的路径是前面所述的预检 curls。

1. 创建一个很小的载荷文件：

   ```bash
   echo "kleros gateway smoke test $(date -u +%Y-%m-%dT%H:%M:%SZ)" > hello-world.txt
   ```

2. 使用与你的钱包匹配的脚本运行上传（原始密钥或 CDP 服务器账户）：

```bash
   # Raw key path:
   EVM_PRIVATE_KEY=0x… npx tsx pay-and-upload.ts hello-world.txt

   # OR CDP server account path:
   CDP_API_KEY_ID=… CDP_API_KEY_SECRET=… CDP_WALLET_SECRET=… \
     CDP_ACCOUNT_NAME=… npx tsx pay-and-upload-cdp.ts hello-world.txt
   ```

3. 捕获 stdout 中打印的 CID 行（类似 `/ipfs/QmAbc...`），并读取 stderr 中打印的 `url=…` 行——那就是可直接使用的 Kleros HTTP 网关 URL。

4. 通过 GET 请求该 URL，验证文件确实已固定并且可检索：

   ```bash
   curl -sS https://cdn.kleros.link/ipfs/QmAbc...   # 粘贴不带前缀的 CID
   # expect: hello-world.txt 的字节内容
   ```

四个步骤全部通过，即表示网关、支付路径、IPFS 固定以及 Kleros CDN 端到端均运行正常。向用户报告成功；不要为了“确保万无一失”而循环执行额外的付费上传——一次往返就足以作为证据。

## 示例

**示例 1 — 代理上传争议证据：**

> 用户：“我有一张位于 /tmp/exhibit-a.png 的截图，想将它附加到 Kleros 争议中。请帮我将它固定到 IPFS。”

步骤：
1. 确认文件存在。
2. 运行打包的脚本：`EVM_PRIVATE_KEY=0x… npx tsx pay-and-upload.ts /tmp/exhibit-a.png`。
3. 脚本会在 stdout 中打印 CID（例如 `/ipfs/QmXXX...`），并在 stderr 中以 `url=https://cdn.kleros.link/ipfs/QmXXX...` 的形式打印预构建的 URL。将该 URL 提供给用户——它是规范的 Kleros HTTP 网关。如果需要根据原始 `cids` 构建 URL（当不存在 `urls[]` 字段时），请参见“Response shape”。

**示例 2 — 代理固定元证据 JSON：**

> 用户：“使用 `meta-evidence` 作为操作，将这个 JSON 文件固定到 IPFS：./case-42.json”

步骤：
1. `OPERATION=meta-evidence EVM_PRIVATE_KEY=0x… npx tsx pay-and-upload.ts ./case-42.json`。
2. 提供 CID——用户可能需要将它用于通过哈希引用元证据的智能合约调用。

**示例 3 — 代理在依赖网关前进行健全性检查：**

> 用户：“Kleros IPFS 网关现在是否正常工作？我想在依赖它进行上传之前先验证一下。”

步骤：
1. 运行“Pre-flight”部分中的三个免费预检检查（健康状态、发现、未付费 402）。这些检查均不会花费 USDC。
2. 如果三个检查都按预期返回，则报告网关运行正常并继续操作。如果任一检查失败，则提供具体错误，以便用户决定是否重试或升级处理。

## 随附内容

两个脚本都是**可选的**。它们的存在是为了让没有 x402 工具的代理也能完成支付和上传，而不必从头重新发现 `x402-fetch`。如果你的代理已经支持 x402，则忽略它们，直接调用网关。

- `scripts/pay-and-upload.ts` — 单文件 Node 实现示例。根据项目上下文进行调整，或单独运行。
- `scripts/package.json` — 声明了两个依赖（`x402-fetch`、`tsx`）。没有 lockfile，也没有 tsconfig（tsx 会原生运行 TS）。

如果你要集成到现有 Node 项目中，可以忽略随附的 `package.json`，只需在自己的项目中运行 `npm i x402-fetch`。

## 反馈

**此 skill 中是否有内容损坏或令人困惑？** 请报告：fetch [feedback/SKILL.md](../feedback/SKILL.md) — 这有助于维护者修复代理在无提示情况下容易遇到的问题。