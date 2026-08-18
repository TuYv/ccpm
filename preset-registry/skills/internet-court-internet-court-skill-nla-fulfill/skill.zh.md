---
name: nla-fulfill
description: Fulfill an existing NLA escrow and collect tokens. Use when the user wants to submit fulfillment text for an on-chain escrow, check arbitration results, and collect approved funds. Covers the full fulfill-arbitrate-collect lifecycle.
metadata:
  author: arkhai
  version: "1.0"
compatibility: Requires nla CLI installed (npm install -g nla). Requires a funded Ethereum wallet and access to an EVM chain.
allowed-tools: Bash(nla:*) Read
---
# 履行 NLA 托管

通过提交满足托管要求的文本，帮助用户履行链上托管；获批后再收取代币。

## 分步说明

### 1. 了解托管

从用户处获取托管 UID，然后检查其要求：

```bash
nla escrow:status --escrow-uid <uid>
```

其中会显示：
- 要求文本
- 仲裁模型和提供方
- 预言机地址
- 现有的履行及其仲裁状态

### 2. 编写履行内容

帮助用户编写满足要求的履行文本：
- 仔细阅读要求
- 履行文本是 AI 仲裁器针对要求进行评估的内容
- 内容应具体，并直接回应要求中的事项
- 默认仲裁提示词会评估“履行”是否满足“要求”，并返回 true/false

### 3. 提交履行

```bash
nla escrow:fulfill \
  --escrow-uid <escrow_uid> \
  --fulfillment "<fulfillment text>" \
  --oracle <oracle_address>
```

该命令会执行多步骤的链上提交-揭示流程：
1. 计算承诺哈希
2. 提交附带保证金的承诺
3. 等待下一个区块确认
4. 揭示履行义务并返还保证金
5. 向预言机请求仲裁

命令会输出一个**履行 UID**，请记录下来以便收取代币。

### 4. 监控仲裁

检查预言机是否已作出决定：

```bash
nla escrow:status --escrow-uid <escrow_uid>
```

如果预言机正在运行，通常会在几秒内响应。请在输出中查找“APPROVED”或“REJECTED”。

### 5. 收取代币（如果获批）

预言机批准后：

```bash
nla escrow:collect \
  --escrow-uid <escrow_uid> \
  --fulfillment-uid <fulfillment_uid>
```

这会将托管中的代币转给履行者。

## 关键细节

- 履行文本会永久记录在链上
- 提交-揭示流程需要为多笔交易支付 gas
- 如果被拒绝，代币会继续留在托管中；任何人都可以再次尝试履行
- 预言机地址必须与创建托管时指定的地址一致（可在状态输出中查看）
- 只有在预言机记录批准后，收取操作才会成功

## 前置条件

- 已安装并配置 `nla` CLI
- 已通过 `nla wallet:set`、`--private-key` 标志或 `PRIVATE_KEY` 环境变量设置私钥
- 履行者账户中有用于支付 gas 的 ETH
- 预言机必须正在运行（或使用 Sepolia 上的公共演示）

## 完整流程示例

```bash
# 1. Check what the escrow demands
nla escrow:status --escrow-uid 0xabc123...

# 2. Submit fulfillment
nla escrow:fulfill \
  --escrow-uid 0xabc123... \
  --fulfillment "The sky appears blue due to Rayleigh scattering" \
  --oracle 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

# 3. Check arbitration result
nla escrow:status --escrow-uid 0xabc123...

# 4. Collect if approved
nla escrow:collect \
  --escrow-uid 0xabc123... \
  --fulfillment-uid 0xdef456...
```