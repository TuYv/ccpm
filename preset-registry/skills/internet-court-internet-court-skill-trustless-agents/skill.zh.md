---
name: trustless-agents
description: ERC-8004 Trustless Agents — on-chain agent identity + reputation. Resolve an agent by id (Identity Registry ERC-721 → owner + AgentCard), list the canonical registry addresses, and generate a spec-compliant agent registration card (registration-v1, with x402 support + trust models). Custody-free, read + scaffolding. Triggers: ERC-8004, trustless agent, agent identity, agent registry, AgentCard, agent reputation, on-chain agent, A2A, agent discovery, agent card, 8004.
---
# ERC-8004 无信任代理技能

ERC-8004（草案 EIP）为 AI 代理提供可移植的链上身份和信誉：
**Identity Registry** 是一个 ERC-721（“AgentIdentity”），以单例形式部署在多个链上的特定地址
`0x8004A169…`（已在 Base
主网上验证）。代理的 `tokenURI` 指向一个 AgentCard，用于描述其功能、
端点（A2A/MCP）、信任模型以及对 x402 的支持。

## 工具

| 工具 | 用途 |
|---|---|
| `chaingpt_erc8004_resolve_agent` | 将 `agentId` 解析为所有者和解码后的 AgentCard（支持 `data:` 和 https/ipfs tokenURI）。只读。 |
| `chaingpt_erc8004_registries` | 提供规范的 Identity + Reputation registry 地址及其所在链。 |
| `chaingpt_erc8004_agentcard` | 生成 `registration-v1` AgentCard JSON（包括 name、services、`supportedTrust`、`x402Support`），以托管在 tokenURI / `/.well-known/agent-card.json`。也可选择生成 `data:` URI 形式。 |

`chaingpt_erc8004_resolve_agent agentId=0 chain=base` → Genesis Agent。

## 范围

读取和脚手架功能已经发布并完成验证。**写入路径**（register /
giveFeedback / validation）暂时有意延后：ERC-8004 仍是草案，其
写入 ABI（尤其是 Validation Registry）仍在修订，因此我们不会发布未经验证的、会修改身份或信誉的 calldata。请在此处生成
AgentCard，然后待写入 ABI 最终确定后，通过项目的参考合约完成注册。

读取使用公共 RPC 的备用链；设置 `BASE_RPC_URL` 可提高可靠性。
0 ChainGPT credits。