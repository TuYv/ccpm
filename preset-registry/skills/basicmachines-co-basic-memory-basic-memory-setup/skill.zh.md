---
name: basic-memory-setup
description: Guide Basic Memory setup in Tau. Use when a user wants to install or configure the Tau memory extension, choose a memory destination or capture policy, verify connectivity, or troubleshoot setup. Check compatibility and obtain approval before installation, configuration changes, or test writes.
---
# 在 Tau 中设置 Basic Memory

帮助用户选择记忆存放位置以及要保存的内容。一次只询问一个决定。设置 Basic Memory 的共享工作流：由 schema 支持的检查点、任务、决策、分类观察结果，以及其他代理可以找到的已验证关系。Tau 提供生命周期回调；它不定义独立的记忆系统。不要将创建项目、重新组织笔记、更改凭据或安装软件包作为附带设置工作。

## 1. 更改任何内容前先检查

- 定位集成目录：通过 `bm install tau` 安装的 `~/.tau/extensions/basic-memory`，或者某个已明确指出的 Basic Memory 检出目录中的 `integrations/tau`。不要假设当前目录或此 skill 的目录包含该扩展。打包安装不需要源代码检出。
- 阅读集成目录中的 `README.md`、`pyproject.toml`、`bridge.py` 和 `knowledge.py`，了解安装说明、依赖固定版本、Settings，以及通用和 coding 配置文件的模型。
  已发布的参考文档：https://github.com/basicmachines-co/basic-memory/blob/feat-tau-1487/integrations/tau/README.md
- 使用 `command -v uv`、`command -v bm` 和 `command -v tau` 检查可执行文件是否可用。仅检查实际存在的可执行文件的版本或帮助信息。
  该集成要求 Python 3.13+、uv，以及已配置的 Basic Memory CLI。
- 区分用户已安装的 Tau 与隔离的集成环境。原版 Tau 0.4.1 缺少连续性 API。上游贡献来自 Basic Machines，地址为 https://github.com/huggingface/tau/pull/687。使用已签入的不可变依赖固定版本，不要使用自行编造的版本或会变动的分支。仅凭版本字符串无法区分原版 0.4.1 与其兼容分支。
- 确定实际生效的配置路径：如果显式设置了 `TAU_BASIC_MEMORY_CONFIG`，则使用该路径；否则使用 `~/.tau/basic-memory.json`。只检查该文件，不要检查无关的 Tau 目录清单、凭据、日志或对话存储。绝不要将其内容完整输出。不要接受仓库本地配置作为捕获目标。
- 如果扩展已加载，请要求用户运行 `/bm-status`。文本回复不会运行斜杠命令，也不会控制当前 Tau 会话。不要针对当前会话的存储启动第二个 Tau 进程。

如果缺少前置条件，请说明缺少的前置条件，并针对具体安装操作获得批准。查阅当前的 Basic Memory 安装文档，不要猜测软件包版本或更改用户全局的 Tau 安装。

## 2. 选择目标位置和策略

提供 **仅工具**、**仅回忆** 或 **完整连续性** 三种选项。只有在解释其成本和信息披露影响之后，才针对普通编码工作推荐完整连续性。

对于回忆或连续性，使用可用的 `bm_list_memory_projects` 工具列出现有项目，或者使用 `bm project list`。检查当前 CLI 帮助信息或工具 schema，以确定路由参数。针对确切目标识别本地、云端或团队路由；如果无法确定路由，则停止并询问用户。不要输出 Basic Memory 的配置或身份验证材料。要求用户明确选择一个现有项目，并在适用时包含其工作区。绝不要替用户选择默认项目或团队工作区。

说明：
- 完整连续性会将新的公开用户文本/最终助手文本以及之前的交接内容发送给 Tau 的活动模型进行综合。这样会增加请求次数、延迟和模型计费。
- 笔记会保存到所选的 Basic Memory 项目中。云端/团队目标会让这些笔记在相应位置公开；对于该目标，必须获得明确批准。
- 仅召回仍会将笔记内容检索到 Tau 的模型上下文中。本地笔记并不意味着模型推理也在本地进行。它会禁用自动写入，但不会禁用显式工具调用，或 `/bm-checkpoint` 和 `/bm-remember` 请求。
- 除非另行请求，否则不会保存转录内容。隐藏推理、原始工具负载和图像不会被自动捕获。凭据遮蔽仅是尽力而为，并不是通用的机密检测器；对于敏感会话，建议使用仅工具模式；即使是显式工具调用，也可能泄露数据。

此外，还要询问是否启用可选的 `read_projects`（最多六个明确指定的只读来源）。
说明共享上下文并不授权向这些项目写回内容。
根据对现有笔记进行的小范围批准检查，选择 `placement_conventions`。检查点应放在其配置的文件夹中；持久性决策和任务应与其主题放在一起，并从检查点链接过去，而不是在每一轮重复。

使用以下策略覆盖配置；只有在获得批准后，才能替换 `CHOSEN_PROJECT`：

### 仅工具

```json
{
  "project": null,
  "auto_recall": false,
  "capture_knowledge": false,
  "checkpoint_on_compact": false,
  "summarize_on_shutdown": false,
  "capture_transcript": false
}
```

### 仅召回

```json
{
  "project": "CHOSEN_PROJECT",
  "auto_recall": true,
  "capture_knowledge": false,
  "checkpoint_on_compact": false,
  "summarize_on_shutdown": false,
  "capture_transcript": false
}
```

### 完整连续性

```json
{
  "project": "CHOSEN_PROJECT",
  "auto_recall": true,
  "capture_knowledge": true,
  "checkpoint_on_compact": true,
  "summarize_on_shutdown": true,
  "capture_transcript": false
}
```

编码会话在所选项目中默认使用 `tau/{repo name}`，其中使用已确认仓库标识的最后一个组成部分，而不是工作树目录名称。
一般会话默认使用 `tau/checkpoints`；单独启用的转录内容使用 `tau/transcripts`。
对于自动放置，应省略 `checkpoint_folder`（或使用 null）；只有在用户批准覆盖时，才显式设置它。
除非用户批准更改，否则保留现有的文件夹、命令、参数、超时和预算设置。
永远不要将 API 密钥放入此文件；Basic Memory 负责身份验证和项目路由。

### 一般或编码配置

询问当前检出内容用于编码还是一般工作。不要仅因为存在 Git 就推断用户同意编码。
一般检查点使用 `session`；编码检查点使用共享的 `coding_session` 合约。

对于编码任务，解析 Git 顶层根目录和稳定的仓库标识，例如 `owner/name`。谨慎检查远程仓库，不要回显其中嵌入的凭据。要求用户确认两者；当远程仓库信息不明确时，不要自行编造标识。
说明分支、SHA、cwd 和可选的 PR 元数据都会随检查点保存。
仓库标签是用户确认的标识，并不是写入目标。

仅将编码配置文件存储在用户拥有的 `repositories` 列表中。每个条目都包含绝对 checkout `root`、`repository`、`kind: coding`，以及该条目自身明确的项目、读取源和放置规则。它不会继承全局项目。使用匹配的最近 `root`；在进行编码写入前，Git 必须确认该精确 root。使用相同的仓库身份显式注册另一个 worktree。绝不要将父级映射静默复制到嵌套的 Git checkout 中。

以下是在一个已批准 checkout 中进行编码、在其他位置仅使用工具的配置示例（全局生命周期标志仍适用于每个配置文件）：

```json
{
  "project": null,
  "repositories": [
    {
      "kind": "coding",
      "root": "/absolute/path/to/approved-checkout",
      "repository": "owner/repository",
      "project": "CHOSEN_PROJECT",
      "read_projects": [],
      "placement_conventions": "Decisions in decisions/, tasks in tasks/. Search before creating notes."
    }
  ],
  "auto_recall": true,
  "capture_knowledge": true,
  "checkpoint_on_compact": true,
  "summarize_on_shutdown": true,
  "capture_transcript": false
}
```

更新此 checkout 时，不要替换其他仓库条目。通用的用户级项目适用于已配置编码 root 之外的位置；请明确确认这一更宽泛的范围。停用标志会禁用所有配置文件中的自动操作。现有的旧版 Tau 回执仍可使用；不会静默重写旧笔记来补充仓库元数据。

## 3. 应用已批准的配置

显示拟议目标、策略、有效配置路径和变更的安全摘要。写入前请求批准。这些示例是叠加配置，不代表可以整体覆盖现有配置。

严格解析现有 JSON。如果格式错误或包含未知字段，则停止并解释问题，不要打印敏感值；不要用默认值替换它。合并已批准的字段，并在集成环境中使用 `tau.bridge.Settings.model_validate` 验证完整候选配置，然后再写入。不要打印配置、验证输入值或未经过滤的异常。报告无效字段路径和安全的解释。验证不得启动 MCP 或调用模型。保留现有文件的权限；对于新配置，使用私有文件；避免在 checkout 中留下包含私有参数的备份。

只有在验证成功后才写入。将配置验证与连接或端到端验证分开报告。如果配置已经正确，则保持不变并继续验证。

### 在获得批准后初始化共享 schema

读取 `<integration-directory>/schemas/` 中的 schema 文件。它们是仓库 `integrations/shared/schemas/` 的随附副本，与其他主机共享。

重述确切的写入项目并获得批准后，搜索现有的 schema 笔记，并读取所有匹配的定义。仅提供缺失的 schema：
- 编码使用 `coding-session.md`，通用使用 `session.md`。
- 两种配置文件都使用 `task.md` 和 `decision.md`。

使用宣传的 `bm_write_note` schema，设置 `note_type="schema"`，目录为
`schemas`，将 schema frontmatter 作为元数据，将 Markdown 正文作为内容。不要将 YAML frontmatter 粘贴到正文中。禁用覆盖。即使用户自定义的 schema 与 bundle 不同，也不要替换它。解释不兼容之处，并在单独进行迁移前征得同意。不需要空文件夹、虚构任务或生命周期事件笔记。播种不需要发明新的 `captureEvents` 设置；Tau 不使用 hook CLI 的审计收件箱。

## 4. 启动兼容环境

对于打包安装，在获得依赖安装许可后，使用：

```bash
bm install tau --sync
```

然后向用户提供以下命令，让其在终端中运行：

```bash
uv run --project ~/.tau/extensions/basic-memory tau
```

已安装的扩展会被自动发现；不要同时传递 `-e`。对于源码开发，在获得许可后，运行
`uv sync --project <integration-directory>`，并使用
`uv run --project <integration-directory> tau -e <integration-directory>` 启动。
使用实际解析后的路径，不要原样使用占位符。不要在现有源码/副本安装旁边再安装第二份副本，除非先决定保留哪一份。

这会启动固定版本的隔离环境，而不是用户的全局 Tau。
`bm install tau` 会分别安装此设置 skill 和提示模板；
仅从源码加载并不会发现它们。使用源码开发时，请按照 README 中的手动 skill 复制说明操作。

在已经兼容的 Tau 会话中，配置更改后要求用户执行 `/reload`。**重新加载/替换会先关闭旧的生命周期：**如果之前启用了自动捕获，该关闭过程仍可能使用旧设置写入内容。在切换目标位置或禁用捕获前发出警告。编辑配置并不能立即保证正在运行的会话已经停止捕获。

## 5. 分阶段验证

1. **配置：**候选配置通过实际的 Settings 模型验证。这本身既不能证明连接正常，也不能证明记忆持久化正常。
2. **连接和结构：**`/bm-status` 报告已连接，并显示预期的项目、通用/编码 profile、读取源和控件。使用读取/搜索工具确认所选 schema 存在。如果配置了共享源，请在每个获准源中验证一次只读查询。
3. **回忆：**对于回忆/连续性策略，请先征得许可以检索一条现有的非敏感笔记，然后使用 `/bm-orient <topic>`，并确认笔记内容已插入。空项目可以成功连接，同时没有任何可供回忆的内容；请说明这一差异。
4. **可选写入/读取：**获得批准后，在确切的项目中创建一条名称唯一且不敏感的设置测试笔记。使用宣传的 `bm_write_note` schema 并禁用覆盖，然后对返回的路径使用 `bm_read_note`。比较内容。不要仅根据命令确认或搜索成功就推断已保存。不确定的写入不得自动重试。
5. **可选连续性：**说明 `/bm-checkpoint` 汇总的是符合条件的公开会话内容，而不只是合成的测试标记，并且可能产生模型费用。让用户调用它之前先征得同意。通过读取已保存的路径进行验证。在可用时，对该笔记使用宣传的 `bm_schema_validate`。对于编码，检查仓库/root/branch/SHA 元数据和仓库过滤查询；然后在获得批准的重新加载后验证回忆。不要仅仅为了设置测试而压缩正在运行的会话。功能门后不可用的工具属于未验证阶段，不得据此默默启用功能。

在删除任何测试备注之前，必须单独征求同意。绝不要将检查点或回执作为自动清理的一部分删除。
报告实际测试过的内容，并明确将未运行的阶段标记为未经验证。不要仅凭写入/读取就宣布已验证完整连续性。

## 故障排除与交接

- 不支持的主机：使用固定环境；绝不要修改已安装的 Tau 文件。
- 已断开连接：验证已配置的可执行文件和参数、项目访问权限以及安全诊断状态。不要暴露服务器 stderr 或凭据值。
- 缺少工具：使用已公布的清单和服务器功能门控。不要臆造工具，也不要静默启用已禁用的服务器功能。
- 检查点失败/未确认：检查可用性和已确认的路径。
  `/reload` 通过读取来协调待处理意图；它不是盲目重试写入。
- 没有项目：自动记忆是有意关闭的，并非故障。
- 要禁用自动记忆，请在获得批准后应用仅工具覆盖层，并在重新加载前说明旧生命周期关闭的注意事项。现有备注会保留。

结束时提供：所选策略和目标位置、配置路径、兼容的启动命令、已验证的阶段、剩余阻塞项，以及 `/bm-status`、`/bm-orient`、`/bm-checkpoint` 和 `/bm-remember`。不要虚构保存确认，也不要声称已通过回复改变当前 Tau 会话。