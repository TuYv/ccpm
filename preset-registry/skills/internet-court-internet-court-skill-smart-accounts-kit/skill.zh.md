---
name: smart-accounts-kit
description: Build dApps with MetaMask Smart Accounts Kit — ERC-4337 smart accounts, delegations, and Advanced Permissions (ERC-7715)
---
# MetaMask Smart Accounts Kit

## 使用场景

- 你想创建 ERC-4337 智能账户（Hybrid、MultiSig 或 Stateless7702）
- 你想通过 bundler 发送用户操作或批量交易
- 你想配置签名者（EOA、passkey/WebAuthn、多签、钱包客户端）
- 你想通过 paymaster 实现 Gas 抽象
- 你想创建、签名或兑换委托（ERC-7710）
- 你想通过 MetaMask 扩展请求 Advanced Permissions（ERC-7715）
- 你想使用委托构建自动化后端服务（DCA bot、keeper 服务）
- 你想为 AI 代理或自动化交易实现会话账户
- 你想使用 nonce keys 设置并行用户操作

## 安装

```bash
npm install @metamask/smart-accounts-kit permissionless
```

## 应使用哪种智能账户类型

| 名称 | 用途 |
|------|-------|
| Hybrid | 一种灵活的账户，支持 EOA、钱包客户端和 passkey（WebAuthn）签名者。对于标准 dApp 用户来说，这是最灵活的选项。 |
| MultiSig | 需要多个签名者达到阈值后才能执行交易。最适合资金库、DAO 或共享托管场景。 |
| Stateless7702 | 使用 EIP-7702 将现有 EOA 升级为智能账户，同时保留相同地址。最适合已有嵌入式 EOA 的用户。 |

如果用户未指定所需的实现方式，请展示这些选项。

## Delegations 与 Advanced Permissions 的区别

| 名称 | 用途 |
|------|-------|
| Delegations (ERC-7710) | 你以编程方式创建、签名和管理委托。委托者是你控制的智能账户。你负责完整的生命周期：创建、签名、存储和兑换。 |
| Advanced Permissions (ERC-7715) | 你通过扩展中的人类可读界面向 MetaMask 用户请求权限。MetaMask 在内部创建并强制执行委托。用户可以在批准前查看并调整参数。 |

Advanced Permissions 的底层使用 Delegations，即 ERC-7715 会在内部创建 ERC-7710 委托。如果用户未指定要使用哪一种，请展示这些选项。

## API 参考

| 使用场景 | 参考 | 工作流 |
|----------|-----------|-----------|
| 创建智能账户 | [toMetaMaskSmartAccount](./references/smart-accounts.md) | [创建 Hybrid 账户](./workflows/create-hybrid-account.md)、[创建 MultiSig 账户](./workflows/create-multisig-account.md)、[创建 7702 账户](./workflows/create-7702-account.md) |
| 创建委托 | [createDelegation](./references/delegations.md) | [创建委托](./workflows/create-delegation.md)、[创建再委托](./workflows/create-redelegation.md) |
| 请求 ERC-7715 权限 | [requestExecutionPermissions](./references/advanced-permissions.md) | [请求权限](./workflows/request-permissions.md)、[兑换 — 智能账户](./workflows/redeem-permissions-smart-account.md)、[兑换 — EOA](./workflows/redeem-permissions-eoa.md) |

## 工作流

| 使用场景 | 工作流 |
|----------|----------|
| 创建 Hybrid 智能账户 | [创建 Hybrid 账户](./workflows/create-hybrid-account.md) |
| 创建 MultiSig 智能账户 | [创建 MultiSig 账户](./workflows/create-multisig-account.md) |
| 创建 Stateless7702 智能账户 | [创建 7702 账户](./workflows/create-7702-account.md) |
| 创建并签名委托 | [创建委托](./workflows/create-delegation.md) |
| 创建委托链（再委托） | [创建再委托](./workflows/create-redelegation.md) |
| 委托对象为智能账户时兑换委托 | [兑换委托 — 智能账户](./workflows/redeem-delegation-smart-account.md) |
| 委托对象为 EOA 时兑换委托 | [兑换委托 — EOA](./workflows/redeem-delegation-eoa.md) |
| 请求 ERC-7715 Advanced Permissions | [请求权限](./workflows/request-permissions.md) |
| 对 ERC-7715 权限上下文进行再委托 | [为权限创建再委托](./workflows/create-redelegation-permissions.md) |
| 会话账户为智能账户时兑换 ERC-7715 权限 | [兑换权限 — 智能账户](./workflows/redeem-permissions-smart-account.md) |
| 会话账户为 EOA 时兑换 ERC-7715 权限 | [兑换权限 — EOA](./workflows/redeem-permissions-eoa.md) |

## 重要说明

- 始终使用限制条件，绝不要创建不受限制的委托。
- 先部署委托方，账户必须先完成部署，才能兑换委托。
- 函数调用范围默认不包含原生代币，使用 `valueLte` 才能允许原生代币。
- 委托链中的限制条件会累积，限制会逐层叠加。
- ERC-7715 要求使用 MetaMask Flask 13.5.0+ 或 MetaMask stable 13.23.0+，并且用户必须拥有智能账户。
- 修改后始终检查项目是否能够成功构建。
- Smart Accounts Kit 版本：1.6.0 | Delegation Framework 版本：1.3.0

## 资源

- NPM：`@metamask/smart-accounts-kit`
- 合约部署：[Delegation Framework deployments](https://github.com/MetaMask/delegation-framework/blob/main/documents/Deployments.md)
- 文档：https://docs.metamask.io/smart-accounts-kit
- MetaMask Flask：https://metamask.io/flask