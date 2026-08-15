---
name: eas-update-insights
description: "EAS service (paid). Check the health of published EAS Update: crash rates, install/launch counts, unique users, payload size, and the split between embedded and OTA users per channel. Use when the user asks how an update is performing, whether a rollout is healthy, how many users are on the embedded build vs OTA, or wants to gate CI on update health."
version: 1.0.0
license: MIT
allowed-tools: "Bash(eas *)"
---
# EAS Update 洞察

> **EAS 服务——会产生费用。** 洞察功能涵盖通过 EAS Update 发布的更新。EAS Update 是一项付费的 Expo Application Services 产品，设有免费套餐限额。更新交付以及这些命令所依赖的数据都会计入你套餐的 EAS Update 使用量。请查看 https://expo.dev/pricing。

直接通过 CLI 查询已发布 EAS Update 的健康状况：启动次数、启动失败次数、崩溃率、唯一用户数、负载大小、各渠道中使用内嵌更新与 OTA 更新的用户占比，以及各运行时版本中最受欢迎的更新。这些数据与 expo.dev 上更新详情页和渠道详情页所使用的数据相同；这些命令会在终端中以人类可读格式和 JSON 格式提供这些数据。

## 何时使用此技能

当用户希望评估已发布 EAS Update 的健康状况或采用情况时，请使用此技能：崩溃率、安装次数、唯一用户数、包大小，或某个渠道中使用内嵌更新与 OTA 更新的用户占比。

示例提示：

- “最新更新的表现如何？”
- “最新更新是否健康？”
- “新版本是否比上一个版本更容易崩溃？”
- “有多少用户使用最新更新，有多少用户使用内嵌版本？”
- “目前生产环境中哪个更新最受欢迎？”
- “我们的更新包有多大？”

同样适用于：发布后的灰度监控和回归检测。

如果用户需要每位用户的崩溃详情或设备级报告，请勿使用此技能；此技能仅提供汇总的 EAS 指标。

## 前提条件

- 已安装 `eas-cli`（`npm install -g eas-cli`）。
- 已登录：`eas login`。
- 对于 `channel:insights`：需从 Expo 项目目录运行（该命令会从 `app.json` 中解析项目 ID）。`update:insights` 只需要登录。

## 命令概览

| 命令 | 用途 |
|---|---|
| `eas update:list` | 查找最近的更新组、其 `group` ID 和分支名称 |
| `eas update:insights <groupId>` | 各平台的启动次数、启动失败次数、崩溃率、唯一用户数、负载大小及每日明细 |
| `eas update:view <groupId> --insights` | 更新组详情，并附加相同的指标 |
| `eas channel:insights --channel <name> --runtime-version <version>` | 某个渠道和运行时的内嵌/OTA 用户数、最受欢迎的更新及累计指标 |

所有这些命令都支持使用 `--json --non-interactive` 进行程序化解析。

## 查找 ID

在查询更新组的洞察数据之前，需要获取其 `group` ID。使用 `eas update:list`，并指定 `--branch <name>`（该分支上的更新）或 `--all`（所有分支上的更新）。以非交互方式运行时，始终传入 `--json --non-interactive`；如果不指定分支或 `--all` 标志，该命令会提示选择分支：

```bash
# Latest group id across all branches
eas update:list --all --json --non-interactive | jq -r '.currentPage[0].group'

# Latest group id on a specific branch
eas update:list --branch production --json --non-interactive | jq -r '.currentPage[0].group'
```

JSON 响应包含一个 `currentPage` 数组，其中每个更新组对应一个条目（同一次发布的两个平台会合并为一个条目）：

```json
{
  "currentPage": [
    {
      "branch": "production",
      "message": "\"Fix checkout crash\" (1 week ago by someone)",
      "runtimeVersion": "1.0.6",
      "group": "03d5dfcf-736c-475a-8730-af039c3f4d06",
      "platforms": "android, ios",
      "isRollBackToEmbedded": false
    }
  ]
}
```

条目还会包含 `codeSigningKey` 和 `rolloutPercentage`，但仅当组正在使用这些功能时才会包含（未定义的值会从 JSON 输出中省略）。

使用 `--branch <name>` 调用时，响应的顶层还会包含 `name`（分支名称）和 `id`（分支 ID）。

## `eas update:insights <groupId>`

显示单个更新组的启动次数、启动失败次数、崩溃率、唯一用户数、启动资源数量和平均有效载荷大小，并按**各平台**（iOS、Android）细分，此外还提供启动和失败情况的每日明细。

### 基本用法

```bash
eas update:insights 03d5dfcf-736c-475a-8730-af039c3f4d06
```

### 标志

| 标志 | 说明 |
|---|---|
| `--days <N>` | 回溯 N 天。默认值：**7**。不能与 `--start`/`--end` 同时使用。 |
| `--start <iso-date>` / `--end <iso-date>` | 明确指定时间范围，例如 `--start 2026-04-01 --end 2026-04-15`。 |
| `--platform <ios\|android>` | 筛选单个平台。省略此项可查看组中的所有平台。 |
| `--json` | 机器可读输出。隐含启用 `--non-interactive`。 |
| `--non-interactive` | 编写脚本时必需。 |

### JSON 输出结构

顶层包含：`groupId`、`timespan`（`start`、`end`、`daysBack`）以及 `platforms[]`，其中该组发布到的每个平台对应一个条目。每个平台条目都包含 `updateId`、`totals`（`uniqueUsers`、`installs`、`failedInstalls`、`crashRatePercent`）、`payload`（`launchAssetCount`、`averageUpdatePayloadBytes`），以及由 `{ date, installs, failedInstalls }` 组成的 `daily[]` 时间序列。

有关完整架构和字段参考，请参阅 [references/update-insights-schema.md](./references/update-insights-schema.md)。

对健康状况评估重要的字段：

- `platforms[].totals.crashRatePercent`，计算方式为 `failedInstalls / (installs + failedInstalls) * 100`。没有安装时为零。
- `platforms[].totals.installs` 和 `uniqueUsers` 提供采用情况信号。
- `platforms[].daily` 是一个时间序列，可用于发现失败次数的突然激增。

### 错误

- `Could not find any updates with group ID: "<id>"` — 组不存在或你没有访问权限。
- `Update group "<id>" has no ios update (available platforms: android)` — 使用了 `--platform ios`，但该组尚未针对 iOS 发布。
- `EAS Update insights is not supported by this version of eas-cli. Please upgrade ...` — 服务器已弃用 CLI 所依赖的字段。运行 `npm install -g eas-cli@latest`。

## `eas update:view <groupId> --insights`

使用相同的按平台洞察数据以内联方式扩展标准 `update:view` 输出。

```bash
# Human-readable
eas update:view 03d5dfcf-... --insights
eas update:view 03d5dfcf-... --insights --days 30

# JSON: wrapped as { updates: [...], insights: {...} }
eas update:view 03d5dfcf-... --json --insights
```

不使用 `--insights` 时，`update:view` 的行为与之前完全一致——现有使用方所接收的 JSON 结构不会发生变化。`--days` / `--start` / `--end` 标志仅在设置了 `--insights` 时生效；单独传入这些标志会报错。

## `eas channel:insights --channel <name> --runtime-version <version>`

按频道显示有多少用户正在使用嵌入式构建与无线更新，以及哪些更新吸引了最多流量。必须在 Expo 项目目录中运行。

### 基本用法

```bash
eas channel:insights --channel production --runtime-version 1.0.6
```

### 标志

| 标志 | 说明 |
|---|---|
| `--channel <name>` | **必填。**频道名称（例如 `production`、`staging`）。 |
| `--runtime-version <version>` | **必填。**必须与发布时的值完全匹配。请检查 `update:list` 中的 `runtimeVersion` 值。 |
| `--days <N>` | 回溯 N 天。默认值：**7**。 |
| `--start` / `--end` | 明确指定时间范围，与 `update:insights` 类似。 |
| `--json` / `--non-interactive` | 机器可读输出。 |

### JSON 输出结构

顶层包含：`channel`、`runtimeVersion`、`timespan`、`embeddedUpdateTotalUniqueUsers`、`otaTotalUniqueUsers`、`mostPopularUpdates[]`（每项包含 `rank`、`groupId`、`message`、`platform`、`totalUniqueUsers`）、`cumulativeMetricsAtLastTimestamp[]`，以及采用图表数据结构的 `uniqueUsersOverTime` 和 `cumulativeMetricsOverTime` 对象，其中包含 `labels` 和 `datasets`。

有关完整的模式和字段参考，请参阅 [references/channel-insights-schema.md](./references/channel-insights-schema.md)。

重要字段：

- `embeddedUpdateTotalUniqueUsers` 是正在运行嵌入式（二进制文件内置）构建的用户数量。
- `mostPopularUpdates[]` 是按 `totalUniqueUsers` 排名的更新。**注意**：这是服务器返回的前 N 项；`otaTotalUniqueUsers` 是该列表中各项之和，因此当活跃更新数量超过前 N 项时，可能会低估 OTA 更新的总覆盖人数。
- `uniqueUsersOverTime` 和 `cumulativeMetricsOverTime` 是用于绘制图表的每日数据序列。

### 错误

- `Could not find channel with the name <name>` — 名称拼写错误或账号不正确。
- 表格中显示“No update launches recorded”/ JSON 中的 `mostPopularUpdates` 为空——该频道与运行时组合尚未启动任何 OTA 更新。通常意味着该频道仍然仅提供嵌入式构建。

## 常见工作流

### 验证我刚刚发布的更新是否运行正常

```bash
# 1. Grab the latest publish on production
GROUP_ID=$(eas update:list --branch production --json --non-interactive \
  | jq -r '.currentPage[0].group')

# 2. Give it some adoption time (minutes to hours), then check crash rate
eas update:insights "$GROUP_ID" --json --non-interactive \
  | jq '.platforms[] | {platform, installs: .totals.installs, crashRate: .totals.crashRatePercent}'
```

比较不同平台之间的 `crashRate`，并将其与之前的版本进行比较；突然激增或不对称的表现（iOS 激增而 Android 保持平稳，或反之）就是需要进一步调查的信号。

### 比较两个频道之间的采用情况

```bash
for channel in production staging; do
  echo "--- $channel ---"
  eas channel:insights --channel "$channel" --runtime-version 1.0.6 --json --non-interactive \
    | jq '{
        channel,
        embedded: .embeddedUpdateTotalUniqueUsers,
        ota: .otaTotalUniqueUsers,
        topUpdate: .mostPopularUpdates[0]
      }'
done
```

### 检测过去 24 小时内的灰度发布回归

```bash
eas update:insights "$GROUP_ID" --days 1 --json --non-interactive \
  | jq '.platforms[] | select(.totals.crashRatePercent > 1)'
```

### 汇总用于发布说明的组指标

```bash
eas update:view "$GROUP_ID" --insights --days 30
```

提供易于阅读的组详细信息，以及每个平台 30 天内的启动和失败数据——适合粘贴到变更日志或事件审查中。

## 输出提示

- 使用管道将 JSON 传给 `jq`；载荷采用结构化格式，便于筛选。
- `--json` 隐含启用 `--non-interactive`，但同时传入两者意图更明确，也更适合编写脚本。
- `daily[].date` 中的日期是 UTC ISO 时间戳；易于阅读的表格会将其呈现为 `YYYY-MM-DD`（UTC）。
- CLI 表格中的标签为 "Launches" / "Crashes"，而 JSON 使用 `installs` / `failedInstalls`。它们是相同的字段，只是显示名称不同。

## 限制

- **跨平台的唯一用户数**可能会重复计算同时在 iOS 和 Android 上运行同一发布版本的用户。同样的注意事项也适用于渠道洞察中的 `otaTotalUniqueUsers`，因为它是对 `mostPopularUpdates` 求和得出的。
- **新发布的版本**可能会在短时间内显示为零，直至指标流水线完成数据同步。
- **安装次数是下载次数，而不是启动次数**：`installs` / "Launches" 字段统计下载了清单和启动资源的用户。只有在用户*下一次*检查更新时，已确认的运行才会被登记（通常最多延迟 24 小时，具体取决于应用的更新策略）。因此，指标相对于实际状态会略有延迟。
- **崩溃由客户端自行报告**：`failedInstalls` / "Crashes" 统计在安装或启动期间出错，并在下一次检查更新时报告的更新。未触发更新请求的崩溃（例如在恢复前进程被终止）不会显示。

## 提交反馈
如果你发现此技能中存在错误、误导性信息或过时信息，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "eas-update-insights" "<actionable feedback>"
```
仅当你有具体且可操作的问题需要报告时才提交。请尽可能提供相关上下文。
如果 AI 代理反复失败，或者用户不得不接手 Expo 任务，请加载 expo-skill-feedback 技能并遵循其 eval-candidate 流程，而不要重复使用上述命令。