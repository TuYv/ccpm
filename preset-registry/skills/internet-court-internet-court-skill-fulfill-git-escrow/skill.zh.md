---
name: fulfill-git-escrow
description: Fulfill a git escrow bounty by writing a solution or submitting an existing one. Use when the user wants to solve a test suite challenge, write code to pass tests, and claim a token reward. Requires the git-escrows CLI (npm i -g git-escrows).
compatibility: Requires git-escrows CLI, git, a configured .env with PRIVATE_KEY, and network access to an Ethereum RPC endpoint.
allowed-tools: Bash Read Write Edit Glob Grep
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
    emoji: "\U0001F3AF"
---
# 完成 Git Escrow

你正在帮助用户完成一个 git escrow bounty。这意味着提交能够通过失败测试套件的代码，以领取托管的代币奖励。

有两种模式：
- **模式 A（编写 + 提交）**：你编写解决方案代码，提交代码，然后提交履约结果。当用户未提供 `--solution-repo` 时，这是默认模式。
- **模式 B（提交现有解决方案）**：用户已经拥有解决方案仓库和提交记录。你只需提交履约结果。

根据用户的输入确定模式：
- 如果用户提供了 `--solution-repo`，使用**模式 B**。
- 否则，使用**模式 A**。

始终需要提供 escrow UID。

## 第 1 步：检查 CLI 是否可用

运行 `git-escrows --help` 以验证 CLI 是否已安装。如果失败，尝试 `npx git-escrows --help` 或 `bunx git-escrows --help`。后续所有命令都使用其中可用的命令。如果都不可用，告诉用户使用 `npm i -g git-escrows` 进行安装。

## 第 2 步：检查 `.env` 配置

检查当前目录中是否存在 `.env` 文件。如果不存在，告诉用户需要创建该文件，并建议运行：
```
git-escrows new-client --privateKey "0x..." --network "sepolia"
```

## 第 3 步：验证 escrow

运行 `git-escrows list --verbose --format json`，并找到与所提供 UID 匹配的 escrow。确认：
- escrow 存在且处于**开放**状态
- 记录测试仓库 URL、测试提交哈希、奖励金额和预言机地址

如果未提供 escrow UID，向用户索要。你可以通过 `git-escrows list --status open` 帮助用户浏览。

## 模式 A：编写解决方案 + 提交

### A1：理解测试

克隆或读取测试仓库，以了解测试所期望的内容：
1. 从 escrow 详情中确定测试仓库 URL 和提交记录
2. 将其克隆到临时位置：`git clone <url> /tmp/escrow-tests-<uid> && cd /tmp/escrow-tests-<uid> && git checkout <commit>`
3. 阅读测试文件，了解：
   - 测试导入了哪些函数/模块/API
   - 测试断言了哪些行为
   - 使用了哪种测试框架
   - 所需的项目结构

### A2：编写解决方案

在**当前工作目录**（或用户指定的子目录）中：
1. 创建/修改文件，实现能够通过测试的代码
2. 遵循测试所期望的项目结构（例如，如果测试从 `src/math.ts` 导入，则创建该文件）
3. 包含所有必要的配置文件（`package.json`、`Cargo.toml` 等）
4. 确保测试框架所需的依赖已包含在内

### A3：提交并获取仓库详情

1. 暂存并提交解决方案：`git add -A && git commit -m "solution for escrow <uid>"`
2. 获取提交哈希：`git rev-parse HEAD`
3. 获取远程 URL：`git remote get-url origin`
   - 如果不存在远程仓库，请要求用户将代码推送到公开 git 仓库，并提供其 URL

### A4：提交履约结果

```
git-escrows fulfill \
  --escrow-uid "<uid>" \
  --solution-repo "<repo-url>" \
  --solution-commit "<commit-hash>"
```

## 模式 B：提交现有解决方案

### B1：收集参数

从用户的输入中提取：
- `--solution-repo`：包含解决方案的 git 仓库 URL
- `--solution-commit`：解决方案的提交哈希

如果缺少其中任一项，请询问用户。

### B2：提交履约

```
git-escrows fulfill \
  --escrow-uid "<uid>" \
  --solution-repo "<repo-url>" \
  --solution-commit "<commit-hash>"
```

## 第 4 步：报告结果（两种模式均适用）

成功执行后：
- 突出显示 **履约 UID**
- 说明预言机现在将自动测试解决方案
- 提供仲裁通过后的收取命令：
  ```
  git-escrows collect --escrow-uid <escrow-uid> --fulfillment-uid <fulfillment-uid>
  ```
- 建议使用以下命令检查状态：`git-escrows list --verbose`

如果命令失败，请帮助诊断问题（托管已完成履约、网络错误、密钥未注册等）。如果用户的 git 密钥尚未注册，建议使用 `git-escrows register-key`。