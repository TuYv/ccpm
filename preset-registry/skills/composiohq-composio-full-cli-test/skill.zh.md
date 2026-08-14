---
description: Full CLI test pipeline — monitor CI for types/lint, then run local binary test, then run bundled binary test via CI.
---
# 完整 CLI 测试

端到端 CLI 验证流水线：首先确保类型检查和 lint 在 CI 中通过，然后测试从源代码构建的 CLI 二进制文件，最后测试由 CI 打包的二进制文件。

## 概述

此技能依次运行三个阶段：

1. **阶段 1：CI Lint/类型检查** — 轮询 CI，直到 CLI 的类型检查和 lint 作业通过。
2. **阶段 2：本地二进制文件测试** — 从源代码构建并测试 CLI 二进制文件（`/cli-test`）。
3. **阶段 3：打包二进制文件测试** — 触发 CI 二进制文件构建，下载并进行测试（`/cli-test-with-bundling`）。

## 阶段 1：监控 CI 类型检查/Lint

使用 `/loop 5m` 每 5 分钟轮询一次当前分支的 CI 状态。继续之前，请检查并确认 CLI 包的**所有类型检查和 lint 作业均已通过**。

### 检查方法

```bash
# Get the latest CI run for the current branch
gh run list \
  --repo ComposioHQ/composio \
  --branch "$(git rev-parse --abbrev-ref HEAD)" \
  --limit 5 \
  --json databaseId,status,conclusion,name,headBranch
```

查找包含类型检查和 lint 的工作流运行记录（例如主 CI 工作流）。如果尚无正在运行或已完成的记录，请等待其出现。

### 验证内容

- 所有类型检查作业：**通过**
- 所有 lint 作业：**通过**
- 如果有任何作业失败，请向用户报告失败情况并停止——不要继续执行阶段 2。

使用 `/loop 5m` 进行轮询：每 5 分钟运行一次 `gh run list` / `gh run view` 命令，直到相关作业成功。所有类型检查/lint 检查均变为绿色后，再继续执行下一阶段。

## 阶段 2：本地二进制文件测试（`/cli-test`）

CI lint/类型检查通过后，运行 `/cli-test` 技能：

1. 安装依赖项：`pnpm install`
2. 构建所有包：`pnpm turbo build`
3. 构建独立二进制文件：`pnpm --dir ts/packages/cli build:binary`
4. 测试二进制文件：
   ```bash
   ./ts/packages/cli/dist/composio version
   ./ts/packages/cli/dist/composio whoami
   ./ts/packages/cli/dist/composio --help
   ```
5. 运行 Slack 集成测试（参见下方的 [Slack 集成测试](#slack-integration-test)）：
   ```bash
   ./ts/packages/cli/dist/composio run '<SLACK_TEST_SCRIPT>'
   ```

如果有任何命令失败，请向用户报告并停止——不要继续执行阶段 3。

## 阶段 3：打包二进制文件测试（`/cli-test-with-bundling`）

本地二进制文件测试通过后，运行 `/cli-test-with-bundling` 技能：

1. 从 `ts/packages/cli/package.json` 读取版本，并附加 `-beta.<timestamp>` 后缀（例如 `1.2.3-beta.20260331143022`）——**始终以 beta 版本触发**
2. 使用 beta 版本，通过 `gh workflow run` 触发 `build-cli-binaries.yml` 工作流
3. 监控工作流运行情况（使用 `/loop 5m` 轮询）
4. 下载适用于当前平台的二进制构件
5. 测试二进制文件：
   ```bash
   $BINARY version
   $BINARY whoami
   $BINARY --help
   $BINARY run 'console.log("hello from composio run")'
   $BINARY run 'const result = await experimental_subAgent({ goal: "What is 2+2?", toolNames: [] }); console.log(result)'
   ```
6. 运行 Slack 集成测试（参见下方的 [Slack 集成测试](#slack-integration-test)）：
   ```bash
   $BINARY run '<SLACK_TEST_SCRIPT>'
   ```
7. 如果当前位于 PR 中，则将结果发布为 PR 评论

## Slack 集成测试

此测试用于验证 `execute()`、`experimental_subAgent()` 以及端到端 Slack 连接。必须在**阶段 2 和阶段 3**中都运行此测试，以确保它能够同时适用于本地构建的二进制文件和 CI 打包的二进制文件。

### 频道

**`#buzz-skill-based-cli-testing`** — 专用于自动化 CLI 测试运行的 Slack 频道。

### 测试脚本

使用 `composio run`（或阶段 3 中的 `$BINARY run`）运行以下脚本。请将 `$BINARY` 替换为相应阶段的二进制文件路径。

```bash
$BINARY run '
  // Step 1: Find the #buzz-skill-based-cli-testing channel
  const channels = await execute("SLACK_LIST_CHANNELS", {
    types: "public_channel",
    limit: 200,
  });
  const channel = channels.data?.channels?.find(
    (c) => c.name === "buzz-skill-based-cli-testing"
  );
  if (!channel) throw new Error("Channel #buzz-skill-based-cli-testing not found");

  // Step 2: Send an initial message tagging @cryogenicplanet
  const buildType = "local";  // use "bundled" in Phase 3
  await execute("SLACK_SEND_A_MESSAGE_TO_A_SLACK_CHANNEL", {
    channel: channel.id,
    text: `<@cryogenicplanet> CLI test run started (${buildType} build) at ${new Date().toISOString()}`,
  });

  // Step 3: Fetch recent channel history for the subAgent to summarize
  const history = await execute("SLACK_GET_CHANNEL_HISTORY", {
    channel: channel.id,
    limit: 20,
  });

  // Step 4: Use experimental_subAgent to summarize what happened in the channel
  const summary = await experimental_subAgent(
    `Summarize the recent activity in this Slack channel in 2-3 sentences. Focus on what tests were run and their outcomes.\n\n${history.prompt()}`,
    {
      schema: z.object({
        summary: z.string(),
        messageCount: z.number(),
      }),
    }
  );

  // Step 5: Post the summary back to the channel
  await execute("SLACK_SEND_A_MESSAGE_TO_A_SLACK_CHANNEL", {
    channel: channel.id,
    text: `CLI Test Summary (${buildType} build):\n${summary.structuredOutput.summary}\n(${summary.structuredOutput.messageCount} messages analyzed)`,
  });

  console.log("Slack integration test passed:", summary.structuredOutput);
'
```

### 此测试验证的内容

| 功能 | 测试方式 |
|---|---|
| 将 `execute()` 与 Slack 工具配合使用 | 列出频道、发送消息、获取历史记录 |
| `experimental_subAgent()` | 通过 `z` schema 使用结构化输出总结频道历史记录 |
| `z` (Zod) 全局变量 | 用于 subAgent schema 定义 |
| `result.prompt()` | 将频道历史记录传入 subAgent |
| 端到端 Slack 连接 | 从真实 Slack 频道读取数据并向其写入数据 |

### 重要说明

- 在阶段 3 中运行时，将 `buildType` 更改为 `"bundled"`。
- Slack 用户标签 `<@cryogenicplanet>` 应能解析为你工作区中的正确用户。如果提及无法解析，请先找到 Slack 用户 ID，然后使用 `<@U_XXXXX>` 格式。
- 此测试要求 Composio 中存在有效的 Slack 连接。如果尚未连接，请先运行 `composio connect slack`。

## 失败处理

- **阶段 1 失败（lint/types）：** 报告失败的作业并附上链接。不要继续。
- **阶段 2 失败（本地构建/测试）：** 报告错误输出。不要继续。
- **阶段 3 失败（捆绑构建/测试）：** 报告失败的命令。如适用，将结果发布到 PR。

## 参考文件

| 文件 | 用途 |
|---|---|
| `.github/workflows/build-cli-binaries.yml` | 构建二进制文件的 CI 工作流 |
| `ts/packages/cli/package.json` | CLI 版本的来源 |
| `ts/packages/cli/scripts/build-binary.ts` | 本地二进制文件构建脚本 |
| `ts/packages/cli/dist/composio` | 构建生成的二进制文件 |