---
name: jupiter-vrfd
description: Use when a user mentions Jupiter token verification, VRFD eligibility, paying 1000 JUP to verify a token, submitting a verification request, or updating metadata via the Jupiter express verification flow.
license: MIT
metadata:
  author: jup-ag
  version: "1.0.1"
tags:
  - jupiter
  - jup-ag
  - jupiter-vrfd
  - token-verification
  - verified
  - solana
---
# Jupiter 代币验证

此技能引导代理通过公开的 Jupiter 代币验证流程验证 Solana 代币铸币地址。

**基础 URL**：`https://api.jup.ag`  
**身份验证**：来自 [developers.jup.ag](https://developers.jup.ag/) 的 `x-api-key`（必需）  
**费用**：1000 JUP

## 使用/不使用场景

在以下情况下使用：

- 检查代币是否符合提交条件
- 构造并签署提交付款交易
- 执行提交流程
- 在提交过程中按需更新代币元数据
- 当资格条件允许更新元数据但不允许验证时，提交仅更新元数据的付费更新

在以下情况下不要使用：

- 代理需要使用私有或内部路由
- 代理需要从非公开端点获取或合并现有元数据
- 用户需要兑换、交易或其他无关的 Jupiter 流程

**触发词**：`verify token`、`submit verification`、`check eligibility`、`craft payment transaction`、`execute payment`、`pay for verification`、`update token metadata`、`metadata-only submission`

## 意图路由器

| 用户意图               | 端点                                                               | 方法   |
| ---------------------- | ------------------------------------------------------------------ | ------ |
| 检查资格               | `/tokens/v2/verify/express/check-eligibility?tokenId={TOKEN_ID}`     | `GET`  |
| 构造付款交易           | `/tokens/v2/verify/express/craft-txn?senderAddress={SENDER_ADDRESS}` | `GET`  |
| 签署并执行付款         | `/tokens/v2/verify/express/execute`                                | `POST` |

## 资格判定矩阵

| `canVerify` | `canMetadata` | 操作                                                            |
| ----------- | ------------- | --------------------------------------------------------------- |
| `true`      | `true`        | 验证+元数据（如果用户提供了元数据），或仅验证                  |
| `true`      | `false`       | 仅验证，省略 `tokenMetadata`                                   |
| `false`     | `true`        | 仅更新元数据                                                    |
| `false`     | `false`       | **停止** — 向用户显示 `verificationError` / `metadataError`     |

## 示例

按需加载以下内容：

- **[API Reference](./references/api-reference.md)**，用于了解确切的请求和响应结构、接受的输入格式、规范化规则、提交模式字段要求以及代币元数据字段。这是构造请求的事实依据。
- **[Verify](./examples/verify.md)**，当用户希望执行请求并已确认付款钱包详细信息时使用

## 代理操作规则

- 尽可能复用用户首条消息中的信息。仅询问缺失的必需字段。
- 绝不要要求用户在聊天中粘贴原始私钥或助记词。
- 绝不要打印机密值。只能提及非敏感的文件路径、密钥名称和派生出的公钥地址。
- 除非你获得了真实的 API 响应，或用户明确表示已自行运行本地脚本，否则不要声称请求已提交。
- 如果当前代理运行环境无法访问网络、安装依赖项或访问本地签名者文件，请在执行前停止，并向用户提供确切的本地操作步骤，不得虚构进展。

## 执行说明

对于受限代理环境中的执行请求：

- 出站 HTTP 请求和软件包安装可能需要批准或用户许可
- 等效的 shell 和软件包管理器命令均可使用；如果环境中已有执行相同步骤的等效方式，不要因特定 CLI 而阻塞

## 资源

- **Jupiter Burn Multisig**：`8gMBNeKwXaoNi9bhbVUWFt4Uc5aobL9PeYMXfYDMePE2`
- **JUP Token Mint**：`JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN`
- **Jupiter Docs**：[developers.jup.ag](https://developers.jup.ag)
- **Jupiter Verified**：[verified.jup.ag](https://verified.jup.ag)