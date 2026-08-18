---
name: bnbchain-mcp
displayName: bnbchain-mcp
version: 1.0.0
description: BNB Chain MCP server connection and tool usage. Covers npx @bnb-chain/mcp@latest, PRIVATE_KEY and RPC, and every MCP tool — blocks, transactions, contracts, ERC20/NFT transfers, wallet, ERC-8004 agent registration, Greenfield. Use when connecting to bnbchain-mcp, querying or transacting on BNB Chain/opBNB/EVM, registering as ERC-8004 agent, or using Greenfield.
---
# BNB Chain MCP Skill

如何连接到 BNB Chain MCP 服务器并使用其工具：区块、交易、合约、代币、NFT、钱包、ERC-8004 代理和 Greenfield。通过 MCP 处理 BNB Chain / opBNB / EVM 或 Greenfield 时使用此技能。

---

## 连接和凭据

- **运行服务器：** `npx @bnb-chain/mcp@latest`（运行时从 npm 获取）。源码：[github.com/bnb-chain/bnbchain-mcp](https://github.com/bnb-chain/bnbchain-mcp)。
- **RPC：** 默认链使用内置 RPC；除非自行托管或使用自定义 RPC，否则无需配置。
- **PRIVATE_KEY：** 对于只读操作（区块、余额、合约读取）可省略或留空。对于会改变状态的工具（转账、`write_contract`、`approve_token_spending`、ERC-8004 注册/设置 URI、Greenfield 写入），请在 MCP 服务器的 `env` 中设置。绝不要记录或暴露私钥。
- **只读与改变状态：** 区块/余额/合约读取工具无需密钥；转账和写入操作要求服务器环境中设置 `PRIVATE_KEY`。

---

## 1. MCP 服务器配置

将 `bnbchain-mcp` 服务器添加到 MCP 客户端配置中（例如 Cursor MCP 设置、Claude Desktop 的 `claude_desktop_config.json`）。

**默认（stdio）：**

```json
{
  "mcpServers": {
    "bnbchain-mcp": {
      "command": "npx",
      "args": ["-y", "@bnb-chain/mcp@latest"],
      "env": {
        "PRIVATE_KEY": ""
      }
    }
  }
}
```

**SSE 模式：** `"args": ["-y", "@bnb-chain/mcp@latest", "--sse"]`（以及客户端要求的 SSE URL）。**本地开发服务器**（例如 bnbchain-mcp 中的 `bun dev:sse`）：使用 `"url": "http://localhost:3001/sse"`，并配置相同的 `env`。

修改配置后，重启或重新加载 MCP 客户端，以便启动服务器。

---

## 2. 凭据和环境

- **RPC：** 默认链使用内置配置。
- **PRIVATE_KEY：** 需要使用会改变状态的工具时，在服务器的 `env` 中设置；只读操作则留空。不要提交或回显密钥。

---

## 3. 代理注册（ERC-8004）

1. 使用 MCP 工具 **`register_erc8004_agent`** 在链上注册代理（参见 [references/erc8004-tools-reference.md](references/erc8004-tools-reference.md)）。
2. 随后，所有者可以在 8004scan（主网）或 8004scan（测试网）上检查注册情况。

---

## 4. 快速参考——工具和提示

### 网络参数

- **只读工具**（区块、余额、合约读取、get_chain_info 等）：**`network`** 为可选参数；默认为 `bsc`。使用 **`get_supported_networks`** 列出可用选项。
- **写入操作**（`transfer_native_token`、`transfer_erc20`、`transfer_nft`、`transfer_erc1155`、`approve_token_spending`、`write_contract`、`register_erc8004_agent`、`set_erc8004_agent_uri`、Greenfield 写入）：**`network` 为必填参数。**写入操作没有默认网络。如果用户未指定网络，你**必须先询问**，然后才能调用工具。不要假设或默认使用主网（`bsc`）；意外在主网上执行可能造成不可逆的资金损失。

### 工具类别

| 类别 | 示例 | 需要 PRIVATE_KEY？ |
|----------|----------|--------------------|
| 区块 | `get_latest_block`、`get_block_by_number`、`get_block_by_hash` | 否 |
| 交易 | `get_transaction`、`get_transaction_receipt`、`estimate_gas` | 否（仅估算时） |
| 网络 | `get_chain_info`、`get_supported_networks` | 否 |
| 钱包 / 余额 | `get_native_balance`、`get_erc20_balance`、`get_address_from_private_key` | 余额：地址或 privateKey 可选 |
| 转账 / 写入 | `transfer_native_token`、`transfer_erc20`、`transfer_nft`、`transfer_erc1155`、`approve_token_spending`、`write_contract` | 是 |
| 合约 | `read_contract`、`is_contract` | 读取时否 |
| 代币 / NFT | `get_erc20_token_info`、`get_nft_info`、`get_erc1155_token_metadata`、`check_nft_ownership`、`get_nft_balance`、`get_erc1155_balance` | 读取时否 |
| ERC-8004 | `register_erc8004_agent`、`set_erc8004_agent_uri`、`get_erc8004_agent`、`get_erc8004_agent_wallet` | 注册/设置 URI：是 |
| Greenfield | `gnfd_*` bucket/object/payment 工具 | 写入时：是 |

### 提示词（MCP prompts）

当用户需要分析或指导时，使用 MCP 提示词名称：

- **analyze_block** — 分析区块及其内容
- **analyze_transaction** — 分析特定交易
- **analyze_address** — 分析 EVM 地址
- **interact_with_contract** — 提供与智能合约交互的指导
- **explain_evm_concept** — 解释 EVM 概念
- **compare_networks** — 比较兼容 EVM 的网络
- **analyze_token** — 分析 ERC20 或 NFT 代币
- **how_to_register_mcp_as_erc8004_agent** — 提供将 MCP 注册为 ERC-8004 agent 的指导

---

## 5. 参考文件（按工具使用）

有关每个工具的**参数名称、示例和详细用法**，请参阅：

| 参考文件 | 内容 |
|-----------|---------|
| [references/evm-tools-reference.md](references/evm-tools-reference.md) | 区块、交易、网络、钱包、合约、代币、NFT —— 所有 EVM 工具 |
| [references/erc8004-tools-reference.md](references/erc8004-tools-reference.md) | register_erc8004_agent、set_erc8004_agent_uri、get_erc8004_agent、get_erc8004_agent_wallet |
| [references/greenfield-tools-reference.md](references/greenfield-tools-reference.md) | 存储桶、对象、文件夹、支付账户 —— 所有 Greenfield 工具 |
| [references/prompts-reference.md](references/prompts-reference.md) | 所有 MCP 提示词及其适用时机 |

---

## 6. 安全性与最佳实践

1. **发送交易前进行确认：** 对于 `transfer_*`、`write_contract` 或 `approve_token_spending`，在调用工具前确认收款人、金额和网络。
2. **写操作必须指定网络：** 对于任何写操作（转账、`write_contract`、`approve_token_spending`、ERC-8004 register/set_uri），你**必须**拥有用户明确指定的网络。如果未指定，**请询问** —— 不要默认使用主网。不要使用“建议优先使用测试网”等建议性措辞来替代这一要求；约束条件是：未指定网络 → 在用户确认前不要调用写工具。
3. **私钥：** 仅可存放在 MCP server `env` 中；绝不能出现在聊天或日志中。
4. **ERC-8004 agentURI：** 根据 Agent Metadata Profile 提供 JSON 元数据（名称、描述、图像、服务，例如 MCP endpoint）。

---

## 文档链接

- **BNB Chain MCP 仓库：** https://github.com/bnb-chain/bnbchain-mcp
- **npm：** `npx @bnb-chain/mcp@latest`
- **ERC-8004**（Identity Registry）；**Agent Metadata Profile** 用于规定 agentURI 格式。