---
name: auth-guide
description: Guide to setting up third-party authentication for a Notion Worker. Covers brokered credentials for external-service API keys / personal access tokens, OAuth, and plaintext environment secrets only when worker code needs the value. Use when the worker needs credentials for a non-Notion API, not for Notion API tokens or `ntn login`.
user-invocable: false
---
## 本指南的用途

本指南用于对 Worker 所集成的**第三方服务**进行身份验证，也就是数据来源或去向所在的服务（GitHub、Stripe、Salesforce、Google、Slack 等）。

当 Worker 需要非 Notion API 的凭据时，请使用本指南。不要将其用于 Notion API 令牌、`ntn login` 或常规的 Notion 工作区设置。

绝不要要求用户在聊天中发送机密值或环境变量值。对于环境机密，应告知用户需要哪些变量，并让他们自行直接在 `.env` 中输入值。用户添加这些值后，不要打开或输出 `.env`。

大多数 Worker 会使用上游服务提供的以下两种身份验证模式之一：

- 个人 API 密钥 / 个人访问令牌
- OAuth

对于个人 API 密钥 / PAT，除非 Worker 代码必须读取其明文值，否则请使用代理凭据。

## 决策框架

在提出任何建议之前，请查看提供商当前的开发者文档。确认其是否提供：

- 个人 API 密钥 / 个人访问令牌
- OAuth
- 两者均不提供

在向用户提供建议之前，务必先在 Web 上查阅提供商当前的身份验证文档。不要依赖记忆来判断身份验证方式是否可用、设置步骤或设置位置。

然后按以下规则进行选择：

1. **服务是否提供个人 API 密钥 / PAT？** 当凭据仅用于发送到已知域名的出站请求标头时，优先推荐代理凭据。否则，请将 API 密钥 / PAT 用作环境机密，因为 Worker 代码需要其明文值。对于限定到个人范围的 Worker，这通常是最简单合适的方案。
2. **服务是否仅支持 OAuth？** 使用 OAuth。
3. **两者均可用，但 Worker 不应依赖某个人的凭据，或者当此人离开后应能轻松重新授权？** 推荐 OAuth。
4. **服务两者均不提供？** 请参阅本指南末尾的“当两种选项均不可用时”。

用一句话说明建议及其原因。示例：“Linear 提供个人 API 密钥，因此请使用代理凭据；这是最简单合适的方案，并且能让令牌不进入 Worker 运行时。”

## 设置：代理凭据

模式：使用 `worker.credential()` 声明可注入凭据的位置。Workers 服务会在 Worker 运行时之外，将其注入出站请求标头。

```ts
import { CREDENTIAL_VALUE } from "@notionhq/workers"

worker.credential("LINEAR_API_TOKEN", {
  network: [
    {
      domain: "api.linear.app",
      transform: [{ headers: { Authorization: CREDENTIAL_VALUE } }],
    },
  ],
})
```

不要从 `process.env` 读取代理凭据，也不要在 `fetch` 中添加其标头。部署该声明，然后让用户自行使用 `ntn workers env set LINEAR_API_TOKEN=<paste token>` 设置其值。请使用能够正常工作的最小范围精确域名。

## 设置：将 API 密钥用作环境机密

仅当 Worker 代码必须读取明文值时，才使用此备用方案，例如用于 Webhook 验证、签名或加密、请求正文或查询参数，或者非 HTTP 客户端。

模式：将凭据存储在 `.env` 中（或直接存储在已部署 Worker 的机密中），在能力的 `execute` 内部从 `process.env` 读取该凭据，并在正式上线前将 `.env` 推送到已部署的 Worker。

1. 查阅提供商当前关于创建令牌的文档。尽可能向用户提供确切设置页面的链接。

2. **让用户自行将令牌添加到 `.env`**（如果文件不存在，则创建该文件），或者告诉他们等效的 `ntn workers env set` 命令。告知他们要使用的变量名：

   ```
   GITHUB_API_TOKEN=<paste your token here>
   ```

   本地执行（`--local`）时会自动加载 `.env`。

3. 在 `execute` 中读取令牌（这是你需要编写的部分）：

   ```ts
   const token = process.env.GITHUB_API_TOKEN ?? ""

   const res = await fetch("https://api.github.com/user", {
     headers: { Authorization: `Bearer ${token}` },
   })
   ```

4. 如果身份验证似乎存在问题，请先在 worker 外部使用提供商文档中的简单身份验证端点测试令牌。以下是 GitHub 的示例：

   ```shell
   curl -H "Authorization: Bearer $GITHUB_API_TOKEN" https://api.github.com/user
   ```

5. 使用 `ntn workers exec <capability> --local` 在本地进行测试。确认身份验证正常后再部署。

6. **将密钥推送到已部署的 worker。** 令牌已添加到 `.env` 后，运行：

   ```shell
   ntn workers env push
   ```

   如果用户不希望将令牌保存在 `.env` 中，可以改用直接设置的形式：

   ```shell
   ntn workers env set GITHUB_API_TOKEN=<paste token>
   ```

7. 告知用户如何轮换令牌：在服务中撤销旧令牌，生成新令牌，更新 `.env`（或直接使用 `ntn workers env set`），并在需要时重新推送。

## 设置：OAuth

`worker.oauth()` 声明一个 OAuth 能力。运行时会处理授权重定向、令牌交换和刷新——你可以在 `execute` 内调用 `accessToken()` 来获取最新令牌。

用户必须先向提供商注册 OAuth 应用，然后填入凭据：

```ts
const myAuth = worker.oauth("myAuth", {
  name: "my-provider",
  authorizationEndpoint: "https://provider.example.com/oauth/authorize",
  tokenEndpoint: "https://provider.example.com/oauth/token",
  scope: "read write",
  clientId: process.env.MY_OAUTH_CLIENT_ID ?? "",
  clientSecret: process.env.MY_OAUTH_CLIENT_SECRET ?? "",
})
```

如果提供商要求额外的授权参数，请添加一个具体的字符串值对象，例如 `authorizationParams: { access_type: "offline" }`。

设置步骤：

1. **查看提供商当前的 OAuth 文档。** 确认授权端点、令牌端点、作用域、所有额外的授权参数，以及提供商对重定向 URL 的配置要求。

2. **向提供商注册 OAuth 应用。** 如果提供商要求预先填写重定向 URL，而你尚未获得该 URL，请先创建应用框架，首次部署后再回来填写重定向 URL。

3. **让用户自行将凭据添加到 `.env`**，或者告诉他们等效的 `ntn workers env set` 命令。告知他们要使用的变量名：

   ```
   MY_OAUTH_CLIENT_ID=<paste client id>
   MY_OAUTH_CLIENT_SECRET=<paste client secret>
   ```

4. **将 `worker.oauth()` 声明添加到 `src/index.ts`。** 从 `process.env` 读取 `clientId`/`clientSecret`。

5. **创建 worker（如果尚未创建）、推送密钥并部署。** 已部署的 worker 在能力注册期间从环境变量中读取 `clientSecret`，因此在执行 `deploy` 之前，密钥必须已存在于远程环境中。让用户自行运行以下命令：

   ```shell
   ntn workers create --name <name>    # if not already created
   ntn workers env push                  # push .env to remote
   # or, to set values directly without putting them in .env:
   # ntn workers env set MY_OAUTH_CLIENT_SECRET=<paste secret>
   ntn workers deploy
   ```

   **重要提示：**每当客户端 ID 或客户端密钥发生变化时，都必须重新部署（`ntn workers deploy`）——OAuth 能力会在注册时绑定这些值，因此仅更新环境变量不会生效。

6. **获取重定向 URL，并让用户将其添加到提供商的应用设置中。** 重定向 URL 来自已部署的 worker。使用以下命令获取：

   ```shell
   ntn workers oauth show-redirect-url
   ```

   在启动 OAuth 流程之前，用户必须将这个确切值粘贴到其 OAuth 应用的“redirect URI”（或“authorized redirect URL”，或“callback URL”）设置中。**务必提醒用户完成此步骤——如果缺失或填写错误，OAuth 将因重定向不匹配错误而失败。**

7. **启动 OAuth 流程：**

   ```shell
   ntn workers oauth start <oauthCapabilityKey>
   ```

   这会打开用户的浏览器，引导他们完成提供商的授权同意页面，并存储由此获得的令牌。

8. **在 `execute` 内使用令牌：**

   ```ts
   const token = await myAuth.accessToken()
   const res = await fetch("https://provider.example.com/v1/things", {
     headers: { Authorization: `Bearer ${token}` },
   })
   ```

   `accessToken()` 返回一个有效且已刷新的访问令牌。运行时会自动处理刷新——你不需要自行跟踪过期时间。

### 使用 OAuth 进行本地测试

OAuth 能力可以在本地测试，但需要先完成一次性的初始化——访问令牌必须先存在于某处，`accessToken()` 才能读取它。流程如下：

1. 部署 worker，配置重定向 URL，并完成一次 OAuth 流程（上述步骤 5–7）。
2. 将已部署 worker 的环境变量（其中现在包含 OAuth 访问令牌）拉取到本地 `.env`：

   ```shell
   ntn workers env pull
   ```

3. 现在 `ntn workers exec <key> --local` 可以正常工作——`accessToken()` 会从本地 `.env` 中读取令牌。

注意事项：

- 访问令牌会过期。已部署的运行时会自动刷新；本地 `.env` 不会。当本地令牌失效时，请再次运行 `ntn workers env pull`（或者，如果刷新令牌也已过期，请重新执行 `ntn workers oauth start <key>`，然后执行 `env pull`）。
- 在首次部署并完成 OAuth 之前，不能使用 `--local`。可运行 `npm run check` 进行类型验证；如果需要测试其余逻辑，也可以在测试文件中模拟 `accessToken()`。

## 常见陷阱

1. **在源代码中硬编码凭据。** 请使用托管凭据，或者在 worker 代码需要明文值时使用 `process.env`——绝不要将密钥直接写入 `src/index.ts`。即使在个人仓库中，已提交的密钥也会被自动抓取。

2. **忘记执行 `ntn workers env push`。** 本地运行正常，部署后却因身份验证错误而失败。每次更改 `.env` 后都要推送密钥。已部署的 worker 无法读取本地 `.env`。

3. **在测试原始令牌之前就调试 worker 代码。** 如果 API 密钥身份验证失败，请先使用 `curl` 请求一个简单的、需要身份验证的端点，以便区分是凭据无效还是 worker 存在 bug。

4. **对于 OAuth，在执行 `ntn workers deploy` 之后才推送密钥。** 能力注册期间会从 `process.env` 读取 OAuth `clientId`——请在 `deploy` *之前*推送密钥，或者使用 `create` → `env push` → `deploy` 的顺序。

5. **OAuth 重定向 URL 错误。** `redirect_uri_mismatch` 是 OAuth 最常见的失败原因。务必运行 `ntn workers oauth show-redirect-url`，并确认用户已在提供商处设置了完全一致的 URL。

6. **请求过多的 OAuth 作用域。** 只请求能够满足需求的最小作用域集合。作用域不断扩大会让用户对授权同意页面心生顾虑，也会拖慢生产应用的 OAuth 审核。

7. **未告知用户需要手动轮换。** API 密钥不会自行刷新。请预先告知用户需要进行轮换，并说明如何操作。

## CLI 参考

```shell
# Push .env secrets to the deployed worker (run after any .env change)
ntn workers env push

# Pull remote env vars into local .env (useful for OAuth: brings access tokens
# down so `ntn workers exec --local` can read them)
ntn workers env pull

# List remote env vars (without values)
ntn workers env list

# Set a single env var
ntn workers env set KEY=value

# OAuth: get the redirect URL to configure at the provider
ntn workers oauth show-redirect-url

# OAuth: start the authorization flow (opens browser)
ntn workers oauth start <oauthCapabilityKey>

# OAuth: inspect token state
ntn workers oauth token <oauthCapabilityKey>
```

## 两种选项都不可用时

如果服务既不提供 API 密钥，也不提供 OAuth 流程，那么坦率地说，首要结论往往是无法在该服务上实现这种集成。

在放弃之前，还可以考虑一些**间接途径**。

- **通过 OAuth 连接到已拥有这些数据的相关服务。** 有时数据会向下游流转到一个你*能够*通过适当身份验证访问的位置——例如日历提供商、文件存储服务或共享工作区。沿着数据流向，通过获准的接口访问数据，要优于强行连接原始数据源。
- **让用户导出并上传。** 如果服务提供手动数据导出功能（CSV/JSON），用户可以将文件放到 worker 能够读取的位置（S3、Drive 等），然后由 worker 从那里同步。这样做操作成本较高，但毫无疑问是获准的方式。
- **从用户自己的电子邮件中提取数据。** 如果服务会向用户发送包含相关数据的电子邮件（摘要、通知、导出内容、收据），可以通过 OAuth 连接用户自己的电子邮件账户（Gmail 等），并解析这些邮件。收件箱归用户所有，服务也是有意将数据发送给用户，而电子邮件提供商则提供了真正的 OAuth API。这种方式虽然间接，但很稳定。
- **使用服务自身的内部/前端端点**（其 Web 应用调用的 JSON 路由）。有时服务唯一公开的是其自身 UI 所使用的 API——你可以以已登录用户的身份进行身份验证（会话 Cookie、捕获的持有者令牌），并从 worker 调用这些路由。需要坦率说明以下注意事项：这种方式通常不稳定（任何前端版本发布都可能导致路由变更），依赖的凭据可能并非设计用于程序化访问，而且在这样做之前，**用户需要确认这不会违反该服务的服务条款**。这种方式适合个人工具或业余集成，不应作为严肃生产用途所依赖的方案。不要将其作为首选建议——但如果用户在知情的情况下选择这种方式，请帮助他们谨慎实施（合理控制请求节奏、使用具有描述性的 `User-Agent`、手动轮换凭据、不规避速率限制）。

**发现技巧：**请用户从浏览器开发者工具中导出 `.har` 文件（“网络”标签页 → 右键单击 → “将所有内容另存为 HAR”）。HAR 文件会捕获页面发出的每个请求和收到的每个响应——包括 URL、方法、标头和正文——这样你无需用户描述，就能看到端点的确切形式。