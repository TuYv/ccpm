---
name: check-updates
description: >
  Check an installed skills-for-fabric plugin bundle or git clone for updates,
  show the matching changelog, and provide host-appropriate update guidance.
  Use when the user wants to: (1) check for skill updates, (2) see what changed,
  (3) verify the installed version. Triggers: "check for updates", "am I up to
  date", "what version", "update skills", "show changelog".
---
# 检查更新

这是一个只读的更新检查器。它会识别提供此技能的安装，比较其版本与仓库的 `main` 分支，并显示当前代理宿主支持的更新路径。它绝不会自动执行更新。

## 执行频率

请将以下两个控制机制分开处理：

- **调用防护：** 其他 Fabric 技能在每个会话中调用此技能一次，然后再继续执行。
- **网络防护：** 对于检测到的每个安装标识，自动调用最多每 7 天执行一次远程查询。

如果用户当前的请求直接要求检查版本、变更日志或更新，请将其视为一次**显式调用**，并绕过 7 天网络防护。如果此技能仅由另一个技能的会话启动通知调用，请将其视为一次**自动调用**。

自动调用后，始终继续执行调用方的原始任务，即使检查被跳过或失败也不例外。

## 步骤

### 步骤 1：解析安装上下文

确定一个候选安装根目录：

1. 如果用户明确提供了安装路径，请使用该确切路径。
2. 否则，从当前生效的 `<skills-root>/check-updates/SKILL.md` 文件开始。
3. 当 `<skills-root>` 名为 `skills` 时，将其父目录视为包含根目录。仅当该包含根目录具有受支持的插件清单，或同时具有 `package.json`、直接位于其中的 `.git` 文件或目录，以及下文定义的 skills-for-fabric Git 正向标识时，才使用该包含根目录。
4. 否则，使用 `<skills-root>` 作为候选根目录。这包括位于 `~/.copilot/skills` 和 `~/.agents/skills` 下的个人副本，以及位于 `.github/skills`、`.agents/skills` 和 `.claude/skills` 下的项目副本。
5. 如果运行时未公开当前生效的技能路径，请将上下文报告为未知。不要猜测。

切勿根据 shell 的当前工作目录推断安装位置。切勿向上遍历到候选根目录之外。项目包含一个无关的上级 `.git` 目录，并不能证明该技能来自该仓库。

应独立于安装渠道解析运行时宿主：

```text
copilot-cli | claude-code | cursor | windsurf | codex | other | unknown
```

使用当前会话或运行时公开的宿主标识。不要根据插件清单、安装路径或工作目录推断它。确定性测试可以提供显式的运行时宿主覆盖值；正常使用时则不可以。如果无法确定宿主，请使用 `unknown`。

对于已安装插件的运行时检测，请按照以下跨工具优先级使用第一个存在的清单：

1. `.plugin/plugin.json`
2. `plugin.json`
3. `.github/plugin/plugin.json`
4. `.claude-plugin/plugin.json`

在此仓库中，`.github/plugin/plugin.json` 是规范的源清单。`.plugin/plugin.json` 和 `plugin.json` 是用于其他安装布局或测试夹具的兼容性后备选项。最后一个位置支持仅提供 Claude 兼容清单的软件包。不要将此运行时探测顺序视为此仓库的编写指导。

然后按以下顺序对候选根目录进行分类：

| 渠道 | 候选根目录中必须存在的文件 | 读取内容 |
|---|---|---|
| 插件 | 一个受支持的插件清单 | 顶层 `name`、`version`、`repository` |
| Git 克隆 | `package.json`、直接位于其中的 `.git` 文件或目录，以及有效的 skills-for-fabric Git 身份 | 顶层 `version`、`repository.url` |
| 复制的技能 | 不符合插件或 Git 布局，且存在根目录 `SKILL.md`，或存在包含 `SKILL.md` 的直接子技能目录 | 仅暂定的技能目录名称 |
| 未知 | 不符合任何确切布局 | 无身份信息或更新命令 |

如果两种布局同时存在，则优先检测为插件。这样，开发测试夹具可以在使用本地 Git 远程仓库的同时保留插件语义。

有效的 Git 身份必须同时通过以下两项检查：

- `package.json` 中 `name` 的最后一个不含作用域的段为
  `skills-for-fabric`。可接受的示例包括 `skills-for-fabric`、
  `@microsoft/skills-for-fabric` 以及贡献者派生仓库的作用域。
- 移除末尾的斜杠和 `.git` 后，仓库路径的最后一段为
  `skills-for-fabric`，比较时不区分大小写。

如果任一检查失败，请勿将该容器根目录提升为 Git 渠道，也不要对其运行 Git。继续解析候选根目录，并独立对最终得到的候选目录进行分类；因此，嵌套的 `skills` 根目录可能会被视为松散副本。仅仅碰巧包含 `skills/` 目录的普通 Node 仓库并不是 skills-for-fabric 安装。

在明确请求确认其来源之前，复制渠道是终止状态：

- 对于自动调用，不要提问。可以选择显示一条简短说明，指出已跳过未经验证的松散副本，并且可以显式检查它，然后继续调用方原本的任务。
- 对于未确认来源的显式调用，列出暂定的已复制技能名称，说明来源和版本未经验证，提出复制渠道章节中的确认问题，然后停止。

这两条路径都不会继续执行网络防护或远程版本步骤。

构建一个上下文对象：

```text
runtimeHost: copilot-cli | claude-code | cursor | windsurf | codex | other | unknown
channel: plugin | git | copy | unknown
root: exact candidate root
installKind: marketplace | direct | none
installScope: user | project | local | managed | none
manifestName: plugin manifest name | none
installedName: marketplace entry name | none
marketplace: marketplace name | none
sourceId: direct-install source ID | none
identity: plugin:<marketplace>/<installed-name> | plugin:direct/<source-id> | git:<repository-url-as-stored>|<root>
localVersion: manifest version
repository: URL exactly as stored in the selected manifest
updateTarget: <installed-name>@<marketplace> | <manifest-name> | <root> | none
copiedSkills: direct skill directory names | none
```

对于插件，请将清单名称与已安装的市场条目名称分开保存。二者可能不同。当原生运行时元数据或原生插件列表能够识别候选根目录时，应从中解析已安装条目。

对于 GitHub Copilot CLI 市场安装，文档规定的路径为
`~/.copilot/installed-plugins/<marketplace>/<installed-name>`，因此这两个路径
段是权威依据。

对于位于
`~/.copilot/installed-plugins/_direct/<source-id>` 的 Copilot CLI 直接安装，请将 `installKind` 设置为
`direct`，仅将源 ID 用于缓存标识，并使用清单名称作为不带限定信息的更新目标。`_direct` 不是市场名称。

对于 Claude Code 市场安装，请从 Claude 的原生插件元数据中解析已安装条目和作用域。`claude plugin list --json` 可以识别该
条目；声明该条目的设置文件可确定其作用域：

- `~/.claude/settings.json` -> `user`
- `.claude/settings.json` -> `project`
- `.claude/settings.local.json` -> `local`
- 托管设置 -> `managed`

如果同一条目存在于多个作用域中，请列出可选项并询问要更新哪一个。不要猜测作用域。仅从 skills
目录、`--plugin-dir` 或 `--plugin-url` 加载的插件没有市场安装记录；
不要为其编造更新命令。

如果原生元数据和安装路径均不可用，仅当映射
无歧义时，才使用清单名称和市场 `fabric-collection`。`fabric-skills` 清单并非无歧义，因为旧版
`skills-for-fabric` 市场条目使用相同的有效负载。在这种情况下，
请报告无法解析已安装条目，要求用户检查
原生插件列表，并且不要猜测标识或更新命令。

对于 Git `package.json`，既可以接受带有 `url` 属性的仓库对象，
也可以接受仓库 URL 字符串。请完全按照存储的形式保留仓库值，并在构建缓存标识时
附加解析出的准确根目录。这可防止一个克隆副本阻止对同一仓库的另一个克隆副本进行检查。
为远程工具解析 GitHub 所有者和仓库时，仅去除
末尾的 `.git` 和末尾的斜杠。不要更改所有者名称的拼写、大小写、
下划线或标点符号。

验证必填字段是否存在，并验证 `localVersion` 是否为语义化
版本文本。如果验证失败，请报告格式错误的字段，并将
上下文归类为未知，而不是使用不完整的元数据。

### 步骤 2：应用网络防护

仅在确定性测试中使用调用方提供的确切缓存路径。
否则，请使用以下持久化缓存文件：

```text
~/.config/fabric-collection/last-update-check.json
```

在 Windows 上，该路径为：

```text
$env:USERPROFILE\.config\fabric-collection\last-update-check.json
```

该文件是一个以安装标识为键的扁平 JSON 对象：

```json
{
  "plugin:fabric-collection/fabric-consumption": "2026-07-15",
  "plugin:direct/github-com-example-skills": "2026-07-15",
  "git:https://github.com/example/skills-for-fabric.git|C:\\repos\\skills-for-fabric": "2026-07-14"
}
```

使用 `YYYY-MM-DD` 格式的 UTC 日期。

- 对于自动调用，如果该标识具有
  过去 7 天内的有效日期，则跳过远程查询。
- 对于显式调用，即使存在新鲜的缓存
  条目，也要执行远程查询。
- 不同已安装插件条目或 Git 克隆根目录的条目不会
  相互阻止检查。
- 写入文件时保留所有不相关的条目。
- 如果文件包含格式错误的 JSON，请发出警告且不要覆盖该文件。
- 对于复制或未知上下文，不要读取或写入缓存条目。

远程尝试完成后，无论该尝试发现了更新、未发现更新，还是失败，都要为检测到的身份记录今天的 UTC 日期，除非缓存文件格式错误。这样可以防止自动网络请求失败后在每个会话中重复尝试。当网络保护机制跳过该尝试时，不要重写此标记。

### 步骤 3：读取远程版本

从同一仓库和同一 `main` 引用中读取 `package.json` 和 `CHANGELOG.md`。按顺序尝试以下方法，并在第一个方法成功后停止：

1. **Git CLI：** 仅当候选根目录本身直接包含 `.git` 文件或目录时使用。不要使用 `git rev-parse` 作为可用性检查，因为它可能会发现无关的父级仓库。

   ```bash
   git -C "<root>" fetch origin main --quiet
   git -C "<root>" show origin/main:package.json
   git -C "<root>" show origin/main:CHANGELOG.md
   ```

2. **经过身份验证的 GitHub 工具：** 使用 GitHub MCP 文件工具或 `gh api`，其中所有者和仓库名称必须严格从清单 URL 中解析。读取 `main` 引用下的 `package.json` 和 `CHANGELOG.md`。
3. **公开原始内容：** 对于公开仓库，从 `https://raw.githubusercontent.com/<owner>/<repo>/main/` 读取这两个文件。

不要使用最新的 GitHub Release 标签作为远程版本。插件市场更新以仓库内容为准，而发布标签可能会落后于插件用户可用的版本。

如果版本获取失败，请显示检测到的渠道、身份和本地版本，并附上一条简洁的警告。不要捏造远程版本。如果只有变更日志获取失败，仍要报告版本比较结果，并注明变更日志不可用。

### 步骤 4：比较并报告

比较语义化版本：

- `remoteVersion > localVersion`：有可用更新。
- `remoteVersion <= localVersion`：已是最新版本。

如果有更新，请显示本地版本与远程版本之间相关的 `CHANGELOG.md` 条目，然后仅提供已针对检测到的渠道和 `runtimeHost` 验证过的指导。

**插件渠道**

绝不要为某个宿主输出另一个宿主的插件命令。

| 运行时宿主 | 已验证的指导 |
|---|---|
| GitHub Copilot CLI | 对于通过市场安装的插件，显示 `/plugin update <installed-name>@<marketplace>`。对于直接安装的插件，显示 `/plugin update <manifest-name>`。 |
| Claude Code | 对于已解析作用域的市场安装，显示 `claude plugin update <installed-name>@<marketplace> --scope <scope>`，然后告知用户运行 `/reload-plugins` 或重启 Claude Code。 |
| Cursor | 引导用户前往 **Customize > Plugins**。对于团队市场，管理员可以使用 **Refresh** 或 **Enable Auto Refresh**。不要输出插件 CLI 命令。 |
| Windsurf、Codex、其他或未知 | 报告可用版本和仓库，但不要提供任何可执行的插件命令，因为尚未验证此布局适用的命令。 |

GitHub Copilot CLI 市场安装：

```text
/plugin update <installed-name>@<marketplace>
```

已安装的市场条目是权威依据。例如，已安装的 `fabric-consumption@fabric-collection` 条目会生成：

```text
/plugin update fabric-consumption@fabric-collection
```

如果已安装的条目是旧版 `skills-for-fabric` 别名，请先更新该别名，以便已安装的条目能够接收当前有效载荷，即使其复制的清单名为 `fabric-skills`：

```text
/plugin update skills-for-fabric@fabric-collection
```

之后，可以选择迁移到规范条目：

```text
/plugin uninstall skills-for-fabric@fabric-collection
/plugin install fabric-skills@fabric-collection
```

GitHub Copilot CLI 直接安装：

```text
/plugin update <manifest-name>
```

直接安装时，原生 CLI 的更新目标是不带任何限定的清单名称。不要追加 `@_direct`，也不要使用不透明的源 ID 作为更新目标。

Claude Code 市场安装：

```text
claude plugin update <installed-name>@<marketplace> --scope <scope>
```

条目名称和作用域必须来自 Claude 的已安装插件元数据。不要将 Copilot 的 `_direct` 行为复用于 Claude Code。

**Git 渠道**

```text
git -C "<detected-root>" pull --ff-only
```

**未知渠道**

说明缺少了哪些预期文件，并且不要提供更新命令。绝不要默认使用 `fabric-skills`。

**复制技能渠道**

松散副本没有可信的仓库、已安装版本或原生更新目标。这包括通过 `copilot skill add` 从本地文件或 URL 实体化的技能，且没有附带源元数据的情况。

对于自动调用，不要用来源问题打断调用方。跳过复制技能更新流程，可以选择说明显式更新检查能够识别受支持的替代项，然后继续执行调用方的任务。不要列出可执行命令。

对于显式调用，列出在候选根目录中找到的暂定技能名称，说明仅凭这些文件无法验证其来源，并询问：

```text
这些技能是从 https://github.com/microsoft/skills-for-fabric 复制的吗？
如果是，我可以检查官方公共仓库，并展示能够刷新这些技能的受支持
插件包。未经你的确认，我不会安装或移除任何内容。
```

在用户确认来源之前，不要访问网络、比较版本、写入缓存状态，也不要提供可执行的安装/更新命令。

显式确认后：

1. 从 `microsoft/skills-for-fabric` 的 `main` 引用中读取 `.github/plugin/marketplace.json`，优先使用经过身份验证的 GitHub 工具，其次使用公开的原始内容。
2. 将暂定的技能目录名称与每个市场插件源中的技能路径进行匹配。仅将完全一致的路径匹配视为证据。
3. 优先选择一个覆盖所有已匹配非实用技能的专用插件。如果有多个插件符合条件，请列出有效选项并要求用户选择。绝不要仅仅因为 `check-updates` 出现在 `fabric-skills` 中就选择它。
4. 仅提供 `runtimeHost` 支持的替代路径：

   GitHub Copilot CLI：

   ```text
   /plugin marketplace add microsoft/skills-for-fabric
   /plugin install <matched-plugin>@fabric-collection
   ```

Claude Code：个人复制技能根目录使用 `user`，项目复制技能根目录使用 `project`：

   ```text
   /plugin marketplace add microsoft/skills-for-fabric
   claude plugin install <matched-plugin>@fabric-collection --scope <scope>
   ```

   告知用户安装后运行 `/reload-plugins` 或重启 Claude Code。如果无法确定 Claude 作用域，应询问用户，而不是猜测。

   对于 Cursor、Windsurf、Codex、其他或未知宿主，应提供官方仓库安装说明的链接，不要提供可执行的替代命令。当前公开仓库并未为这些宿主提供经过验证的原生插件市场。

这会安装完整的当前版本捆绑包，而不是覆盖零散文件并留下版本混杂的依赖项。在原生插件安装并验证完成之前，请保留零散副本。移除它之前需另行询问。如果不存在完全匹配的官方映射，或公开仓库不可用，请如实报告，不要虚构捆绑包或复制单个文件。

## 示例

### 聚焦式插件捆绑包

```text
Host: copilot-cli
Detected: plugin:fabric-collection/fabric-consumption
Current: 0.3.7
Latest: 0.3.8
Update: /plugin update fabric-consumption@fabric-collection
```

### Claude Code 插件捆绑包

```text
Host: claude-code
Detected: plugin:fabric-collection/fabric-consumption
Current: 0.3.7
Latest: 0.3.8
Update: claude plugin update fabric-consumption@fabric-collection --scope user
Reload: /reload-plugins
```

### Git 克隆

```text
Detected: git:https://github.com/example/skills-for-fabric.git|C:\repos\skills-for-fabric
Current: 0.3.7
Latest: 0.3.8
Update: git -C "C:\repos\skills-for-fabric" pull --ff-only
```

### 未知布局

```text
Could not determine the skills-for-fabric installation at <candidate-root>.
Expected a supported plugin manifest, or a positively identified
skills-for-fabric package.json plus a direct .git entry.
No update command was guessed.
```

### 已确认的官方零散副本

```text
Host: copilot-cli
Detected loose skills: check-updates, powerbi-report-planning
Confirmed source: https://github.com/microsoft/skills-for-fabric
Supported refresh:
  /plugin marketplace add microsoft/skills-for-fabric
  /plugin install powerbi-authoring@fabric-collection
The loose files were not changed or removed.
```

## 必须

- 从当前技能根目录或用户明确指定的路径解析身份。
- 独立于安装布局解析运行时宿主。
- 将每会话一次的调用与 7 天网络访问限制分开处理。
- 在插件身份和更新命令中使用已安装的市场条目，而不只是清单名称。
- 区分直接安装与市场安装。
- 仅在确认包和仓库身份后，才能使用 Git 渠道。
- 按仓库和确切的克隆根目录隔离 Git 缓存条目。
- 保留不相关的缓存条目，并使用 UTC 日期。
- 在官方公开仓库中查找零散副本之前，必须确认其来源。
- 将复制的技能名称与公开市场中的确切技能路径进行匹配。
- 仅输出已针对运行时宿主验证过的更新或替换命令。
- 自动检查后以非阻塞方式继续。

## 推荐

- 在使用需要身份验证的 GitHub 工具之前，优先使用根目录本地的 Git 远程仓库。
- 从同一仓库引用中获取版本和变更日志。
- 对于已确认的官方散装副本，应通过完整的原生插件包进行替换，而不是覆盖单个文件。
- 输出简洁且可直接复制粘贴的内容。

## 避免

- 根据当前工作目录推断安装上下文。
- 让 `git` 自动发现父级仓库。
- 将无关的软件包加上 `.git` 视为 skills-for-fabric 克隆。
- 根据清单或安装路径推断运行时宿主。
- 向其他宿主显示 Copilot 或 Claude 插件命令。
- 默认将聚焦型插件包归入 `fabric-skills`。
- 使用 GitHub Release 标签作为插件市场版本。
- 每个会话都重复执行已失败的自动网络检查。
- 将同名的散装文件夹视为其来自官方仓库的证据。
- 在缺少完整插件包依赖项的情况下替换单个复制文件。
- 未经用户明确同意便执行更新。

## 错误处理

失败时，报告失败的操作并继续：

```text
Could not check plugin:fabric-collection/fabric-consumption for updates: remote package.json was unavailable.
Current installed version: 0.3.7
The automatic check is non-blocking; continuing with the requested task.
```

如果用户只说“更新我的技能”，应确认他们是想检查更新，还是执行检测到的原生更新命令。不要在意图不明确的情况下执行更新。