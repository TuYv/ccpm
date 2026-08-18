---
name: agent-wallet
description: "Give the AI agent its own EVM wallet with admin-controlled policies the agent CANNOT bypass even under prompt injection. Encrypted keystore (AES-256-GCM, scrypt KDF), policy file the agent has no tool to write, deterministic policy gate on every signing operation, optional local HTTP dashboard. Triggers: agent wallet, give the agent a wallet, agent address, fund the agent, agent autonomy, policy gate, kill switch, agent permissions, bounded autonomy, ERC-4337 alternative, session-key alternative."
---
# ChainGPT 代理钱包 Skill

代理在其支持的每条 EVM 链上都有自己的 EOA 钱包。管理员（即你，通过 shell 操作）可设置代理无法违反或撤销的策略——即使恶意提示诱使 LLM 尝试这样做也不行。

## 威胁模型

**攻击者的目标：**通过提示注入诱使代理将其钱包资产转入攻击者的地址。

**插件的防御机制：**策略检查在**代码中执行，而不是在 LLM 的提示词中执行**。每次调用 `chaingpt_agent_wallet_sign_and_send` 时都会：

1. 从磁盘重新加载策略文件（不使用缓存——管理员可在会话期间更新策略）。
2. 运行 `checkPolicy(intent)`——这是完全确定性的纯代码，无法看到 LLM 的上下文。
3. 如果任何规则检查失败，则拒绝操作，并提供明确的原因，由代理反馈给用户。

攻击者可以诱使 LLM 调用 `sign_and_send(to=attacker, value=ALL)`——但工具层会拒绝，因为 `attacker` 不在 `allowedToAddresses` 中，或 `value` 超过 `maxTxValueWei`，或 `killSwitch=true`。**信任边界是工具代码，而不是 LLM。**

不存在可写入策略文件的 MCP 工具。管理员使用文本编辑器直接编辑该文件。也不存在可读取或设置口令的 MCP 工具。口令仅存在于 shell 环境变量**或**操作系统钥匙串中——绝不会出现在密钥库文件中，也绝不会进入 LLM 的上下文。

## 设置（管理员步骤——仅需执行一次）

密钥库口令按以下优先级解析：

1. **`CHAINGPT_AGENT_WALLET_PASSPHRASE` 环境变量**——显式覆盖。最适合 CI、无头环境，以及希望实现进程列表和钥匙串零暴露的高级用户。
2. **操作系统钥匙串**——自动管理。在 macOS（通过 `security` 使用钥匙串）或 Linux（通过 `secret-tool` 使用 libsecret）上，如果未设置环境变量，`chaingpt_agent_wallet_init` 会**生成一个高强度的 256 位口令并将其存储在钥匙串中**。你无需输入或记住该口令；MCP 服务器每次加载时都会从钥匙串中读取它。

### 选项 A——零配置（使用钥匙串的 macOS / Linux）——推荐大多数用户使用

```bash
# Just init — a strong passphrase is generated + stored in your OS keychain.
claude
> initialize the agent wallet
```

初始化输出会告知你它使用了钥匙串，以及如何导出口令进行备份。

### 选项 B——显式环境变量（CI / 无头环境 / 最大控制权）

```bash
# Set a strong passphrase BEFORE starting the MCP server (>= 16 chars)
export CHAINGPT_AGENT_WALLET_PASSPHRASE="your-strong-passphrase-here-min-16-chars"
claude
> initialize the agent wallet
```

> **无论采用哪种方式，都要备份口令。**钥匙串条目：`service=chaingpt-mcp-agent-wallet account=keystore-passphrase`。在 macOS 上使用 `security find-generic-password -s chaingpt-mcp-agent-wallet -a keystore-passphrase -w` 导出。如果丢失口令（以及所有备份）→ 密钥库将无法恢复。不存在任何恢复途径。

> **钥匙串选项的安全权衡：**密钥不会以明文形式存储在磁盘上，也不会进入 LLM 上下文，但在你登录期间，钥匙串处于解锁状态——能够访问已解锁会话的本地攻击者可能会读取它。与明文文件相比，这种攻击的门槛要高得多，适合低价值、受限额约束的热钱包。若要实现本地零暴露，请使用选项 B。

这会创建两个文件：

| 文件 | 内容 | 由谁编辑 |
|---|---|---|
| `~/.chaingpt-mcp/agent-wallet/keystore.json` | 使用 AES-256-GCM 加密的私钥 | 由初始化工具生成一次。切勿手动编辑。请做好备份。 |
| `~/.chaingpt-mcp/agent-wallet/policy.json` | 纯 JSON 规则 | **由你（管理员）使用文本编辑器编辑。** 智能体没有任何能够写入此文件的工具。 |

两者均默认位于 `~/.chaingpt-mcp/agent-wallet/`，但可以通过 `CHAINGPT_KEYSTORE_FILE` 和 `CHAINGPT_AGENT_POLICY_FILE` 覆盖。

## 工具

| 工具 | 是否修改状态？ | 说明 |
|---|---|---|
| `chaingpt_agent_wallet_init` | 创建密钥库 | 一次性操作。如果文件已存在，则拒绝执行。 |
| `chaingpt_agent_wallet_address` | 否 | 返回智能体的 EOA 地址。使用此地址接收资金。 |
| `chaingpt_agent_wallet_status` | 否 | 地址 + 策略摘要 + 终止开关状态。**在执行任何签名前运行此工具。** |
| `chaingpt_agent_wallet_balances` | 否 | 返回所请求链上的原生代币余额。 |
| `chaingpt_agent_wallet_policy` | 否（只读） | 显示当前策略 JSON。无法修改。 |
| `chaingpt_agent_wallet_sign_and_send` | **签名并广播交易** | 唯一能够转移资金的工具。受策略约束。 |
| `chaingpt_agent_wallet_serve_ui` | 启动本地 HTTP 服务器 | 仪表板位于 `http://127.0.0.1:8787`。仅供查看。 |

## 策略文件格式

默认的 `policy.json`（首次读取时延迟创建）采用 **Balanced DeFi** 策略：`killSwitch: false`、主流 DEX/借贷路由器已加入允许列表、每笔交易的原生代币上限为 0.1、每个滚动 24 小时内的原生代币上限为 0.3 且交易数上限为 20（`maxDailySpendWei` / `maxDailyTxCount`），并要求填写备注。策略文件损坏或字段部分缺失时，始终回退到故障关闭状态（`killSwitch: true`）——篡改绝不可能放开限制。应用“Locked down”模板（或设置 `killSwitch: true`）即可拒绝所有操作。

**生产环境策略**示例（允许在 Base 上进行 DEX 再平衡，每笔交易上限为 0.1 ETH，并要求填写审计备注）：

```json
{
  "version": 1,
  "killSwitch": false,
  "allowedChains": [8453],
  "allowedToAddresses": [
    "0x6352a56caadc4f1e25cd6c75970fa768a3304e64",
    "0x111111125421ca6dc452d289314280a0f8842a65"
  ],
  "blockedToAddresses": [
    "0x0000000000000000000000000000000000000000"
  ],
  "maxTxValueWei": "100000000000000000",
  "maxTxGas": "500000",
  "blockedSelectors": [],
  "requireMemo": true,
  "notes": "Base only, OpenOcean + 1inch routers only, 0.1 ETH cap, memo required for audit",
  "updatedAt": "2026-05-18T20:00:00Z"
}
```

### 字段参考

| 字段 | 类型 | 未设置时的行为 | 设置后的行为 |
|---|---|---|---|
| `killSwitch` | bool | 拒绝所有操作（故障关闭） | `true` 拒绝所有操作；`false` 继续执行其他检查 |
| `allowedChains` | int[] | 允许任何链 | 如果 `chainId` 不在列表中，则拒绝 |
| `allowedToAddresses` | string[] | 允许任何地址 | 如果 `to` 不在列表中，则拒绝（不区分大小写） |
| `blockedToAddresses` | string[] | 不阻止任何地址 | 如果 `to` 匹配，则拒绝（不区分大小写） |
| `maxTxValueWei` | string | 无上限 | 如果原生代币 `value > max`，则拒绝 |
| `maxTxGas` | string | 无上限 | 如果 `gasLimit > max`，则拒绝；必须显式提供 `gasLimit`（自动估算会绕过该上限） |
| `maxDailySpendWei` | string | 无速率上限 | 如果 24 小时账本支出加上本笔交易的 `value` 将超过上限，则拒绝（如果账本无法读取，则故障关闭） |
| `maxDailyTxCount` | int | 无速率上限 | 滚动 24 小时内已签名交易数达到上限后拒绝 |
| `blockedSelectors` | string[] | 不阻止任何选择器 | 如果 `data` 的前 4 个字节匹配，则拒绝（例如，`0xa9059cbb` 会阻止 ERC-20 `transfer`） |
| `requireMemo` | bool | 不要求备注 | 如果缺少 `memo` 参数，则拒绝 |

**优先级：**紧急停用开关 > blockedToAddresses > allowedToAddresses > 金额上限 > gas 上限 > 每日速率上限 > blockedSelectors > 备注要求。任何一项检查失败都会拒绝该交易。

## Solana 钱包（v1.19+）

在 Solana 上采用相同的有限自主模型。使用独立的 Ed25519 密钥库（`solana-keystore.json`，采用相同的加密方式和相同的管理员口令），并受 `solana` 策略子对象约束——与此处其他所有内容一样，任何 MCP 工具都无法写入该对象。

```text
chaingpt_agent_wallet_solana_init           # one-time keystore
chaingpt_agent_wallet_solana_address        # fund this (the balance is the outermost cap)
<any builder: jupiter swap / marginfi / kamino / transfer>  → unsigned VersionedTransaction (base64)
chaingpt_agent_wallet_solana_sign_and_send txBase64=<…> memo=<…>
```

策略块（仅限管理员，通过仪表板或文本编辑器配置）：

```json
"solana": {
  "enabled": true,
  "allowedPrograms": ["11111111111111111111111111111111", "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"],
  "maxTxLamports": "100000000",
  "maxDailySpendLamports": "300000000",
  "maxDailyTxCount": 20,
  "requireMemo": true
}
```

必须准确传达的事实：
- **故障关闭式迁移：**如果策略文件中没有 `solana.enabled: true`，则会拒绝所有 Solana 签名操作。`unrestricted` 也无法绕过此限制。
- **支出按模拟结果计价：**工具会先执行模拟，并根据 `maxTxLamports` 和 24 小时时间窗口，计量手续费支付者的 lamport 余额变化。无法模拟或模拟失败 ⇒ 拒绝，绝不会盲目广播。
- **程序允许列表限定了代理可以进入哪些协议（顶层指令）。**它无法看到内部 CPI——lamport 上限和交易次数才是真正的支出边界。SPL 代币流出不会改变手续费支付者的 lamport 余额，因此这类流出受允许列表和交易次数限制，而非 lamport 上限限制。
- 代理必须是**唯一签名者和手续费支付者**——为他人的交易联合签名或代付手续费会在结构层面被拒绝。

## 链上上限——ERC-4337 会话密钥（v1.21+）

最终形态：用户的 ERC-7579 智能账户向代理的 EOA 授予一个具有明确作用域的链上会话（Smart Sessions 模块）。上限存在于经过审计的合约中，并由 EntryPoint 验证。**状态：BETA——模块地址已确认部署在 Base Sepolia 上，编码器也已通过单元测试，但端到端的线上证明尚未发布。请将下方链上列视为设计层面的保证，而不是已经独立验证的保证；目前，本地门控才是经过测试的防线。**

| 威胁 | 本地策略门控（已测试） | 链上会话上限（设计中，beta） |
|---|---|---|
| 提示词注入 | ✅ 阻止 | ✅ 设计为可阻止 |
| 策略文件被篡改/重写 | ❌ 失效 | ✅ 设计为可阻止 |
| 主机完全失陷（密钥库被盗） | ❌ 失效 | ✅ 设计为可阻止，损失受剩余额度和到期时间限制（线上证明待完成） |

```text
chaingpt_aa_session_build_grant chain=base account=<user SCW> tokenCaps=[{token: USDC, cap: "100000000"}] validUntil=<unix>
  → OWNER signs the userOpHash externally → chaingpt_aa_submit_userop
chaingpt_aa_session_status                    # chain-authoritative: enabled? remaining?
chaingpt_agent_wallet_4337_sign_and_send …    # the agent acts; local gates AND chain caps both apply
chaingpt_aa_session_build_revoke …            # incident response: chain-level kill
```

硬性事实：`erc4337.enabled` 策略采用显式启用机制，默认在所有位置均为关闭状态，并遵循故障时关闭原则（因为此功能会操作第三方账户）。构建时会拒绝无限额度授权。Bundler 拒绝超出上限的操作，说明产品正在正常发挥作用——绝不要通过重试来绕过它。v1 支持 Biconomy Nexus 1.x 账户。

## 执行前检查清单

```text
1. chaingpt_agent_wallet_status   # see address + policy digest + kill switch state
2. chaingpt_agent_wallet_balances # confirm funded on the target chain
3. chaingpt_agent_wallet_policy   # read the active rules in full
4. chaingpt_agent_wallet_sign_and_send chain=… to=… valueWei=… data=… memo="…"
```

如果调用因策略原因遭到拒绝：**不要尝试从代理端绕过它**。将拒绝原因告知管理员，让他们自行编辑策略文件（或覆盖配置）。

## 本地管理仪表板

```text
> Use chaingpt_agent_wallet_serve_ui
```

返回一个 `http://127.0.0.1:8787` URL，**以及一个一次性管理员令牌**，该令牌会打印在工具输出中（同时保存至 `~/.chaingpt-mcp/agent-wallet/.admin-token`，权限为 0600）。每次重启时都会轮换令牌。

在浏览器中打开该 URL。在登录界面粘贴管理员令牌。随后，仪表板会显示：

- 带二维码的**充值地址**
- **多链原生代币余额**（刷新页面即可更新）
- **一键终止开关**——单击按钮即可启用或禁用
- **策略 JSON 编辑器**——完整的内嵌编辑器，支持服务端验证，并通过原子写入保存，同时创建 `.bak` 备份
- **密钥库和策略文件路径**，供参考

### 为什么即使仪表板能够编辑策略，它仍然是安全的

回顾一下威胁模型：攻击者通过提示词注入控制 LLM。防御措施分为以下几层：

1. **没有任何 MCP 工具暴露策略文件的写入能力。**LLM 实际上无法访问 `savePolicy` 函数——该函数仅由 localhost HTTP 服务器导入。
2. **localhost HTTP 服务器在代理内部没有客户端。**该插件没有提供能够向 localhost 发起任意 HTTP POST 请求的 MCP 工具。即使 LLM 尝试这样做，也无法触发仪表板的 POST 端点。
3. **必须通过管理员身份验证。**即使未来某个工具以某种方式获得了 HTTP 访问能力，每个 POST 端点仍要求提供有效的会话 Cookie，而该 Cookie 仅会在管理员粘贴令牌后设置。令牌会在每次重启时轮换，并且仅存在于管理员控制的状态中（环境变量 / 权限为 0600 的文件）。
4. **检查 Origin 和 Referer。**跨源 POST 请求（CSRF）会被拒绝。浏览器提交表单时始终会设置 `Origin`。
5. **严格的模式验证。**即使拥有有效会话，策略编辑器仍会拒绝未知字段、无效的链 ID、格式错误的地址、非整数 wei 值等。无效数据无法写入磁盘。
6. **原子写入 + `.bak`。**失败的保存操作不会在写入过程中损坏策略文件，并且可以恢复到之前的版本。
7. **仅绑定到 `127.0.0.1`。**绝不会绑定到 `0.0.0.0`——网络中的其他机器无法访问该仪表板。

唯一能够绕过所有这些防御措施的失效模式是：运行在管理员机器上的恶意软件既能读取管理员令牌文件，又能向 localhost 发起 HTTP 请求。此时，攻击者已经拥有 shell 访问权限，可以直接读取密钥库；策略文件已不再是最薄弱的环节。

### 控制面板端点

| 方法 | 路径 | 行为 |
|---|---|---|
| `GET /` | 登录表单（未认证时），或重定向到 /dashboard | — |
| `POST /login` | 检查管理员令牌、设置会话 Cookie，并重定向到 /dashboard | 需要 Origin |
| `GET /dashboard` | 完整的管理界面（需要认证） | — |
| `GET /api/policy` | 当前策略的 JSON | 需要会话 |
| `POST /api/policy` | 验证后保存新策略 | 需要会话 + Origin |
| `POST /api/killswitch` | 切换终止开关（set=on/off） | 需要会话 + Origin |
| `GET /api/status` | 包含地址、余额和策略摘要的 JSON | 需要会话 |
| `GET /logout` | 清除会话 Cookie，并重定向到登录页面 | — |

## 此 Skill 不会做什么

- **Solana / 非 EVM 签名。** Agent 钱包仅支持 EVM。Solana 程序指令签名是另一条尚未接入的路径。
- **多重签名。** 这是一个单一 EOA。对于较大金额，请使用 Safe / Gnosis 多重签名，并将 Agent 的 EOA 设为签名者之一；该策略仍适用于 Agent 的签名操作。
- **会话密钥 / ERC-4337。** 受限的智能账户自主权是另一种模型（智能账户持有资金，Agent 获得一个可撤销的会话密钥）。此 Skill 采用更简单的 EOA + 策略文件方案；ERC-4337 是一项未来功能。
- **找回丢失的口令。** 丢失 `CHAINGPT_AGENT_WALLET_PASSPHRASE` → 密钥库将无法恢复。不存在任何恢复途径。请通过带外方式备份口令（1Password、硬件保险箱等）。
- **通过 Agent 的工具读取或更改策略。** 这是刻意如此设计的。请使用文本编辑器编辑该文件。

## 为 Agent 提供资金

1. 获取地址：`chaingpt_agent_wallet_address`
2. 从任意钱包（CEX 提现、MetaMask、硬件钱包等）向该地址发送资金，所用链须为策略允许的任意链。
3. 确认：`chaingpt_agent_wallet_balances chains=[base,arbitrum]`

Agent 现在已准备好在其策略限制范围内运行。

## 积分核算

所有 Agent 钱包工具的成本均为 **0 ChainGPT 积分**。钱包由用户本地计算机托管（而非由 ChainGPT 托管）。积分消耗来自用户/Agent 在决定部署之前调用的上游工具（`chaingpt_research_token`、`chaingpt_risk_token`、`chaingpt_intel_token`）。

## 参考信息

- 密钥库格式：使用 scrypt (N=2^14) KDF 的 AES-256-GCM。文件版本 1。
- 默认路径：`~/.chaingpt-mcp/agent-wallet/{keystore.json,policy.json}`（可通过环境变量覆盖）。
- 文件权限：密钥库为 0600，父目录为 0700（POSIX）。