---
name: make-git-escrow
description: Create a new git escrow bounty for a test suite. Use when the user wants to submit a challenge with escrowed token rewards for passing a failing test suite. Requires the git-escrows CLI (npm i -g git-escrows).
compatibility: Requires git-escrows CLI, a configured .env with PRIVATE_KEY, and network access to an Ethereum RPC endpoint.
allowed-tools: Bash Read Glob Grep
metadata:
  author: arkhai-io
  version: "1.0"
  openclaw:
    requires:
      bins:
        - git-escrows
        - git
      config:
        - .env
    primaryEnv: PRIVATE_KEY
    homepage: https://github.com/arkhai-io/git-commit-trading
    emoji: "\U0001F512"
---
# 创建 Git Escrow

你正在通过 `git-escrows submit` CLI 命令自动创建 git escrow 悬赏。该命令会将 ERC20 代币锁定在托管中，作为奖励，提供给能够让失败测试套件通过的人。

## 步骤 1：检查 CLI 是否可用

运行 `git-escrows --help`，确认 CLI 已安装。如果失败，尝试 `npx git-escrows --help` 或 `bunx git-escrows --help`。后续所有命令都使用其中可用的命令。如果都不可用，请告知用户使用 `npm i -g git-escrows` 进行安装。

## 步骤 2：检查 .env 配置

检查当前目录中是否存在 `.env` 文件。如果不存在，请告知用户需要创建该文件，并建议运行：
```
git-escrows new-client --privateKey "0x..." --network "sepolia"
```

确认其中至少包含 `PRIVATE_KEY` 和 `NETWORK`（或使用 anvil 作为默认值）。对于 base-sepolia 和 sepolia 网络，合约地址会自动配置。

## 步骤 3：收集参数

运行 submit 命令需要以下全部参数：

1. **`--tests-repo`**（必需）：包含失败测试套件的 Git 仓库 URL。
   - 如果用户以参数形式提供了 URL，则使用该 URL。
   - 否则，检查当前目录是否为 git 仓库，并提供使用其远程 URL 的选项。
   - 如果两者都不可用，则询问用户。

2. **`--tests-commit`**（必需）：测试套件的提交哈希。
   - 如果使用当前仓库，则通过 `git rev-parse HEAD` 检测 HEAD。
   - 否则询问用户。

3. **`--reward`**（必需）：要托管的代币数量，单位为 wei。
   - 询问用户。如果用户提供的是人类可读的数量，则帮助其进行换算（例如，6 位小数的代币中，“1 USDC” = “1000000”；18 位小数的代币中，“价值 1 ETH” = “1000000000000000000”）。

4. **`--oracle`**（必需）：负责仲裁的 oracle 的以太坊地址。
   - 询问用户。告知用户 Sepolia 上的公共演示 oracle：`0xc5c132B69f57dAAAb75d9ebA86cab504b272Ccbc`。

5. **`--arbiter`**（必需）：仲裁者合约地址。
   - 询问用户。通常这是其网络上的 TrustedOracleArbiter 合约。

6. **`--token`**（必需）：用于奖励的 ERC20 代币合约地址。
   - 询问用户。

询问所有缺失的参数；在可能的情况下，将相关问题合并提问，以尽量减少来回沟通。

## 步骤 4：执行

使用收集到的全部参数运行 submit 命令：

```
git-escrows submit \
  --tests-repo "<repo-url>" \
  --tests-commit "<commit-hash>" \
  --reward "<amount>" \
  --arbiter "<address>" \
  --oracle "<address>" \
  --token "<address>"
```

## 步骤 5：报告结果

执行成功后：
- 显著展示 **Escrow UID**
- 显示完整的 escrow 详情（attester、recipient、schema、reward、token、oracle）
- 提供 solver 可使用的 fulfill 命令：
  ```
  git-escrows fulfill --escrow-uid <UID> --solution-repo "<url>" --solution-commit "<hash>"
  ```
- 提及用户可以通过以下命令跟踪状态：`git-escrows list --status open`

如果命令失败，帮助诊断问题（余额不足、网络错误、缺少授权等）。