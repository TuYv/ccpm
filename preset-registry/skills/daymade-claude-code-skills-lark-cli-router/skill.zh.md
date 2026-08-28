---
name: lark-cli-router
description: >-
  Routes any Feishu/Lark/Doubao operation through the version-matched lark-cli
  domain guide embedded in the installed CLI, then executes and verifies the
  requested task. Use for 飞书/Lark/Doubao docs, drive, sheets, Base, wiki,
  minutes, meetings, calendar, IM, mail, tasks, approval, apps, auth/scope,
  resource URLs or tokens, and lark-cli troubleshooting. This is the single
  Lark entry point; use ima-skill instead for Tencent IMA.
metadata:
  requires:
    bins: ["lark-cli"]
---
# Lark CLI 路由器

将其作为模型可见的唯一 Lark 入口点。CLI 内嵌的 `lark-*`
指南是与版本同步的事实来源；此路由器会选择并加载这些指南，而不是将其中的领域指令复制到另一个静态目录中。

## 边界

- Tencent IMA 是另一款产品。将 IMA 笔记或知识库任务路由到
  `ima-skill`，而不是这里。
- 不要加载所有 Lark 指南。针对当前任务选择最小匹配指南集。
- 当 CLI 或其某个内嵌指南能够覆盖任务时，不要通过浏览器自动化、原始
  `curl` 或猜测的 API 契约绕过 `lark-cli`。

## 工作流

### 1. 确认运行时

运行 `lark-cli --version`。如果二进制文件不存在，应明确失败并报告
需要 `lark-cli`；不要另行编造传输方式，也不要将独立的 Skill 安装命令与 CLI 二进制安装程序混淆。

在此环境中，每次调用都设置 `LARK_CLI_NO_PROXY=1`。需要稳定的机器可读 JSON 时，同时设置
`LARKSUITE_CLI_NO_UPDATE_NOTIFIER=1` 和
`LARKSUITE_CLI_NO_SKILLS_NOTIFIER=1`，以免通知污染结果。

### 2. 选择内嵌指南

运行 `lark-cli skills list --json`。将用户意图以及任何 URL 路径或
token 与返回结果中的 `name`、`description` 和 `metadata.cliHelp` 进行匹配。

不要通过从指南名称中去掉 `lark-` 来推导 CLI 领域：存在例外情况，应以 `metadata.cliHelp` 或指南本身为准。以下高混淆路由需要特别注意：

| 意图 | 指南 |
|---|---|
| auth、login、profile identity、missing scope、user vs bot | `lark-shared` |
| `/wiki/` 文档内容 | `lark-doc` |
| wiki 空间、成员关系或节点层级 | `lark-wiki` |
| 未来的会议或会议室安排 | `lark-calendar` |
| 已结束会议的搜索、参与者或会议产物 | `lark-vc` |
| 已知的 `note_id` | `lark-note` |
| `minute_token`、妙记内容或音频转会议纪要 | `lark-minutes` |
| 实时会议参与或会议中的事件 | `lark-vc-agent` |
| 文件上传、下载、移动、权限、元数据或 Office 导入 | `lark-drive` |

对于普通文档、表格、Base、幻灯片、邮件、IM、任务、审批、应用及其他领域，实时的 `skills list` 描述就是路由表。多领域请求可以选择一个工作流指南，或一组数量较少且有序的领域指南。

### 3. 完整加载所选指令

在执行操作前读取所选指南：

```bash
lark-cli skills read lark-doc
lark-cli skills read lark-doc/references/lark-doc-fetch.md
```

第一种形式会输出该指南的 `SKILL.md`；第二种形式会读取一个被引用的文件。
读取所选指南标记为当前分支所需的每个文件。

内嵌读取会拒绝 `..`。将类似
`../lark-whiteboard/references/x.md` 的同级指针重新定位为：

```bash
lark-cli skills read lark-whiteboard/references/x.md
```

对于 Markdown 和引用文件，始终先尝试 `lark-cli skills read`。如果它返回
`reference ... not found`，则在 `~/.agents/skills/<guide-name>/` 下解析该指南相对路径。对于某个指南，在首次进行此类回退之前，使用主机的 SHA-256 工具确认其已安装的 `SKILL.md` 与 `lark-cli skills read <guide-name>` 的内容逐字节一致；不一致时必须明确失败并触发 bundle 刷新。这样可以明确确保 `lark-apps/creative-design/` 可访问，即使当前二进制文件没有内嵌它。

`scripts/` 或 `assets/` 下的机器资源从不嵌入，因此应直接在同一个已安装的 bundle 中解析它们。如果缺少必需文件，则停止并报告必须安装或刷新磁盘 bundle；不要伪造替代文件。

### 4. 检查、执行并验证

1. 将 `metadata.cliHelp` 视为帮助操作指南，而不总是将其视为字面命令。执行其中的具体命令；先从已加载的指南中解析任意占位符。如果缺少该字段，则使用指南自身的命令或所选域的 `--help`。
2. 优先使用匹配的 `+shortcut`；否则使用类型化资源命令。
3. 在执行参数尚未在指南中明确给出的类型化调用之前，运行 `lark-cli schema <service.resource.method>`。
4. 仅当没有快捷方式或类型化命令涵盖该端点时，才将 `lark-cli api` 用作文档规定的备用方式。
5. 保留显式提供的 `--profile`；绝不要猜测 profile 或身份。在身份信息重要或存在歧义时，使用 `lark-cli whoami`。
6. 对于写入操作，如果命令支持有用的预览，则使用 `--dry-run`。如果高风险写入以 `10` 退出，则展示拟执行的操作并等待明确的人工确认；绝不要自动追加 `--yes`。
7. 只有当进程以 `0` 退出或其 JSON 信封中的 `ok == true` 时，才将命令视为成功。不要测试顶层的 `code == 0`。
8. 写入后，遵循所选指南针对具体域定义的验证契约。如果未定义，则执行范围最窄的独立读取，以证明请求的状态已发生变化。明确禁止机会性二次查询的指南优先级更高。报告部分结果或缺失的覆盖范围。

遇到授权错误时，加载 `lark-shared`，并遵循其中关于用户/机器人以及缺少权限范围的分支处理。不要将授权失败转化为重复重试或浏览器/原始 API 回退。