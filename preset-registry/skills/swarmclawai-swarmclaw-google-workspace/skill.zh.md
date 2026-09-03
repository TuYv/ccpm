---
name: google-workspace
description: Use Google Workspace CLI (`gws`) for Drive, Docs, Sheets, Gmail, Calendar, Chat, and related Workspace API tasks.
homepage: https://github.com/googleworkspace/cli
metadata:
  openclaw:
    toolNames: [google_workspace, gws]
    capabilities: [google-workspace, google-docs, google-drive, google-sheets, gmail, google-calendar, google-chat]
    requires:
      bins: [gws]
---
# Google Workspace CLI

当任务涉及 Google Workspace 资源或 Google Workspace API 自动化时，使用 `gws`。

在可能的情况下优先使用 `gws` 而非通用 HTTP 调用，因为它已经了解 Workspace API 的接口范围，并且默认返回结构化 JSON。

## 规则

1. 在修改 Workspace 状态之前，先使用读取/列表/获取命令。
2. 先确认 ID：文档 ID、电子表格 ID、文件 ID、邮件 ID、日历 ID、空间 ID。
3. 不要在智能体工具调用中运行交互式身份验证流程。如果缺少身份验证，请报告 `gws` 需要在插件设置中配置，或通过手动终端登录。
4. 保持命令输出对机器可读。优先使用 JSON 输出并对其进行解析，而不是抓取人类可读的文本。
5. 对于大型列表操作，先限制范围，然后再分页或过滤。

## 常用命令

检查安装和健康状态：

```bash
gws doctor
```

查看某个资源或方法的帮助：

```bash
gws help
gws drive help
gws drive files help
```

Google Docs：

```bash
gws docs get --document-id <DOC_ID>
```

Google Drive：

```bash
gws drive files list --params '{"pageSize":10}'
gws drive files get --file-id <FILE_ID>
```

Google Sheets：

```bash
gws sheets spreadsheets get --spreadsheet-id <SPREADSHEET_ID>
```

Gmail：

```bash
gws gmail users messages list --user-id me --params '{"maxResults":10}'
gws gmail users messages get --user-id me --message-id <MESSAGE_ID>
```

Google Calendar：

```bash
gws calendar events list --calendar-id primary --params '{"maxResults":10,"singleEvents":true}'
```

Google Chat：

```bash
gws chat spaces messages list --parent spaces/<SPACE_ID>
```

## 在 SwarmClaw 中的工具用法

使用 `google_workspace` 工具时：

- 将位于二进制文件之后的 `gws` 命令放入 `args`，例如：
  `{"args":["drive","files","list"],"params":{"pageSize":5}}`
- 用 `params` 对应 `--params`
- 用 `jsonInput` 对应 `--json`
- 当你有意获取所有页面时，使用 `pageAll: true`
- 如果不确定，在执行有风险的变更之前使用 `dryRun: true`

## 错误处理

- 如果缺少 `gws`：告知用户安装 Google Workspace CLI。
- 如果身份验证缺失或过期：告知用户配置插件设置或手动对 `gws` 进行身份验证。
- 如果命令因缺少某个 ID 而失败：先切换到列表/搜索命令并找到正确的 ID。
