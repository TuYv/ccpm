---
name: cc-safety-net
description: "Operate CC Safety Net: explain why a command was blocked, triage false positives, configure custom rulebooks, manage agent CLI integrations, and diagnose protection."
disable-model-invocation: true
---
<!-- Keep the body below in sync with src/hosts/templates/cc-safety-net.ts. -->

# CC Safety Net

CC Safety Net 接入编码代理 CLI（Claude Code、Codex、Cursor、Gemini CLI 及其他工具），
并在破坏性命令和访问机密信息之前阻止它们执行。`cc-safety-net` CLI
用于检查和控制这项保护。运行 `npx -y cc-safety-net`。

## 了解当前 CLI

已安装的 CLI 是命令语法的权威来源。不要猜测标志。

```bash
npx -y cc-safety-net --help
npx -y cc-safety-net help <command>
```

运行 `npx -y cc-safety-net rule doc`，并将其输出视为规则手册架构、路径、
GitHub 源、匹配行为和验证方式的完整事实来源。

以下命令是只读的，可以安全地用于发现信息：`--help`、`--version`、`status`、
`doctor`、不带 `--prune-legacy` 的 `logs`、`explain`、`rule list`、`rule verify`、`rule doc`、
`policy check`、`help`。其他命令都会修改配置或已安装的集成；只能在下面的工作流中运行这些命令。

## 核心模型

- 内置防护始终生效。自定义规则只会增加限制；规则配置中的任何内容都无法绕过 CC Safety Net 的内置保护。
- 配置文件（`rule.json`）列出规则手册源。规则定义位于 `rulebook.json` 中，而不是直接位于 `rule.json` 中。
- 三种作用域：用户（所有项目）、项目（仅当前项目），以及仓库中位于 `.cc-safety-net/rules/<rulebook-name>/rulebook.json` 的可共享 GitHub 规则手册。
- 规则手册是实时文件。运行时会在每次工具调用时读取每个 `rulebook.json`，因此保存的编辑无需同步步骤即可应用于下一条命令。
- `policy.json` 设置安全级别、各功能开关、各规则覆盖项和路径列表。它有两个作用域：项目文件 `.cc-safety-net/policy.json`，该文件会提交并与团队共享；以及适用于所有项目的用户文件。
- 会话安全级别为 `standard`、`strict` 或 `paranoid`，通过环境变量 `CC_SAFETY_NET_LEVEL` 按会话设置。

## 选择工作流

- 用户询问某条命令为何被阻止，或显示 `BLOCKED by CC Safety Net` 消息：
  解释决策。
- 用户认为某次阻止是错误的：排查误报。
- 用户希望添加、编辑、禁用或迁移阻止规则：配置规则。
- 用户希望更改安全级别、切换保护功能或调整路径列表：配置策略。
- 用户希望将 CC Safety Net 安装到某个代理 CLI 中，或从中移除：管理集成。
- 某条规则没有触发，或用户询问保护是否正常工作：诊断。
- 用户询问分析器的行为方式或原因，而 `explain` 和 `rule doc` 未能说明：根据源代码回答。

## 解释决策

1. 获取确切的被阻止命令。如果用户没有提供，通过
   `npx -y cc-safety-net logs` 查找（使用 `--project .`、`--agent <name>` 或 `--since <days>` 缩小范围）。
2. 将确切命令作为一个字面参数传递给 `npx -y cc-safety-net explain`。优先使用支持 argv 的工具；通过 shell 调用时，将整个命令作为一个参数进行 shell 转义。绝不要将原始命令文本插入双引号：`$()`、反引号和变量会在 `explain` 接收命令之前展开。决策取决于工作目录时，添加 `--cwd <path>`。命令接收后，`explain` 会分析该字符串，绝不会执行它。
3. 阅读跟踪信息：命令是如何拆分的、匹配了哪条规则，以及 RESULT 状态和原因。对于允许和阻止两种判定，`explain` 都会以 0 退出；应从输出中读取判定，而不是读取退出状态。
4. 用通俗语言说明原因。对于确实存在的风险，建议原因中提到的更安全替代方案，例如先运行 `git stash`，再运行 `git reset --hard`。

## 排查误报

1. 使用 `npx -y cc-safety-net logs --suspect --since 7` 列出近期可疑的拒绝记录，或使用 `npx -y cc-safety-net logs --id <id>` 获取一条记录。
2. 使用 `explain` 复现该决策，并查看触发了哪条规则。
3. 如果触发的是自定义规则，请修复该规则手册：使用覆盖项禁用或改写它，或者编辑该规则（请参阅配置规则），然后重新运行 `explain` 以确认新的判定结果。
4. 如果触发的是内置规则，则无法通过规则编辑将其放宽。检查该原因是否有已记录的豁免机制，例如用于链接工作树中本地 git 丢弃操作的 `CC_SAFETY_NET_WORKTREE=1`，或当受信任的透明包装器向分析器隐藏了真实命令时使用 `rule wrapper add`。将包装器名称作为单独的 argv 值传入，或者将其 shell 转义为一个参数。如果用户明确希望关闭该内置规则，请从 `explain --json` 的 `ruleId` 字段读取其 ID，并提出按规则的策略覆盖方案（请参阅配置策略）。否则，请说明该规则防范的风险，并建议在 https://github.com/kenryu42/cc-safety-net/issues 报告该情况。

## 配置规则

使用用户提示中已提供的信息。仅当范围、操作、规则意图、合并行为或目标命令不明确时才提问。

1. 尽可能从提示中确定请求的范围：
   - 用户：适用于所有项目。
   - 项目：仅适用于当前项目。
   - GitHub：在当前仓库中编辑或创建可共享的规则手册结构。
2. 尽可能从提示中确定是添加规则、编辑规则、禁用规则、覆盖原因、信任透明包装器、迁移旧版规则，还是解释自定义规则。
3. 修改已安装的本地规则之前，先检查现有配置：
   - 运行 `npx -y cc-safety-net rule verify`
   - 运行 `npx -y cc-safety-net rule list`
4. 仅当用户要求规则建议，或者请求的规则依赖项目上下文时，才检查相关项目文件。查看清单、脚本、任务运行器、CI、基础设施、数据库、迁移和部署文件，以了解存在风险的命令。
5. 使用 `rule doc` 将请求转换为有效的 CC Safety Net JSON。
   - 对于用户或项目范围，添加或编辑所选本地 `rule.json` 和 `<rulebook-name>/rulebook.json`。
   - 对于 GitHub 范围，在当前仓库中添加或编辑 `.cc-safety-net/rules/<rulebook-name>/rulebook.json`。
   - 不要提出添加 `owner/repo` 形式的 GitHub 来源；从 GitHub 来源安装规则不属于此工作流程。
   - 如果用户明确要求安装现有 GitHub 规则手册而不是编写规则，请使用 `npx -y cc-safety-net rule add owner/repo --only <rulebook...>`；仅当他们希望安装所有规则手册时才省略 `--only`，且仅当他们指定非默认 ref 时才添加 `--ref <ref>`。不带来源的 `rule add --only <rulebook...>` 会从官方 `cc-safety-net/rulebooks` 仓库中选择，其精选规则手册会阻止破坏性的 Terraform、AWS、gcloud 和 Azure CLI 操作；当其已覆盖请求时，应优先安装其中之一，而非自行编写。
   - 对于透明包装器，优先使用 `npx -y cc-safety-net rule wrapper add`，并将受信任的包装器名称作为单独的 argv 值传入，或者 shell 转义为一个参数，而非手动编辑 `rule.json`。
6. 保留无关的现有规则手册来源、覆盖项和规则手册。在创建新的规则手册、与现有配置合并或解决歧义时，先预览拟议的 JSON，再写入。
7. 对于 GitHub 规则，确保仓库布局为 `.cc-safety-net/rules/<rulebook-name>/rulebook.json`，并确保来源名称、目录名称和规则手册 `name` 完全一致。
8. 编辑后进行验证：
   - 用户或项目规则：运行 `npx -y cc-safety-net rule verify` 和 `npx -y cc-safety-net rule list`。两个命令均覆盖所有范围，因此都不接受 `--global`。
   - 仅编辑可共享 GitHub 规则手册：运行 `npx -y cc-safety-net rule verify`。仅当规则手册也安装在本地 `rule.json` 中时才运行 `list`。
9. 如果验证失败，显示确切错误并进行最小修复。
10. 确认已保存的路径或 GitHub 规则手册路径，并总结新增或更新的规则。

规则不变量：

- 不要使用旧版内联 `.safety-net.json` 或 `~/.cc-safety-net/config.json` 规则。使用 `npx -y cc-safety-net rule migrate` 转换现有旧版文件。
- 每条规则命令都必须列在 `allowed_commands` 中。`tests` fixtures 是可选的；`rule verify` 会根据规则簿自身的规则评估 `rulebook_version` 2 fixtures，而 fixture 命令只是分析器输入，CC Safety Net 永远不会执行它们。
- 如果存在被阻止的 fixture，则必须指定预期的 `rule`，且该规则必须存在于规则簿中。
- 本地源名称应为 `project-rules` 这样的裸名称；不要将文件系统路径放入 `rules`。
- 已保存的规则簿会立即生效。不存在待处理状态，也不需要之后运行任何命令，因此应验证编辑结果，而不是激活它。
- 缺失或无效的规则簿文件会使该源处于非活动状态；不可读或无效的 `rule.json` 会使其作用域内的所有源处于非活动状态：这些规则将停止应用，但其他自定义规则和内置保护仍保持活动状态。修复诊断信息中指出的文件。
- 重复的规则簿名会保留首次声明的名称，用户作用域优先于项目作用域，并忽略后续规则簿。
- `npx -y cc-safety-net rule add owner/repo` 会获取远程规则簿、验证它们，并将每个规则簿以 `<rulebook-name>/rulebook.json` 的形式纳入本地；`npx -y cc-safety-net rule update [source]` 会重新获取并覆盖这些副本，同时打印发生的更改。运行时永远不会获取远程内容；如果远程源没有已纳入本地的文件，则会报告 `rule update` 必须先将其纳入本地。
- `rule sync` 已弃用：它只会迁移早期版本遗留的锁和缓存。永远不要将其作为验证或激活步骤运行。

## 配置策略

两个 `policy.json` 文件都受到保护：你提出更改，由用户应用。允许读取，但不允许写入。

`policy.json` 字段除 `version: 1` 外均为可选字段（`policy check` 会报告所有 schema 错误，因此应根据 schema 验证，而不是继续猜测其他字段）：

- `safety.level`：`standard`、`strict` 或 `paranoid`。`safety.overrides`：用于固定某项能力的布尔值，包括 `fail_closed`、`paranoid_rm` 和 `paranoid_interpreters`，其优先级高于级别设置。
- `workflow.worktree_mode`：布尔值，允许在链接的 worktree 中执行本地 git 丢弃操作。
- `destructive_command_protection` 和 `secret_protection`：包含一个 `enabled` 布尔值，以及将内置规则 id（`git.reset-hard`、`secret.basename.env`）映射到 `"on"` 或 `"off"` 的 `overrides`。要获取被阻止命令的 id，请查看 `explain --json` 输出中的 `ruleId` 字段。
- `destructive_command_protection.allow_paths`：允许递归删除目标的绝对路径或 `~/` 路径。`secret_protection.allow_paths`：免受 secret 保护的、由用户管理的精确路径，不接受 glob。`secret_protection.deny_paths`：按内置 secret 的保护方式进行额外保护的路径。
- `audit.retention_days`：保留审计历史的天数，仅限用户作用域。

1. 检查当前状态：使用 `npx -y cc-safety-net status` 查看生效的策略及其加载的文件路径，使用 `npx -y cc-safety-net rule list` 查看自定义规则，并补充查看请求所依赖的项目上下文。在提出更改之前，先读取现有的 `policy.json`。
2. 将拟议的策略 JSON 写入未受保护的路径，例如 `policy-proposal.json`。对于项目作用域，只设置团队明确计划控制的字段；未设置的字段会继承用户策略，而 `apply` 只会写入提案中设置的字段。应用操作会替换目标文件，因此提案必须是完整策略，而不是补丁。审计设置仅限用户作用域；项目提案不能设置这些设置。
3. 运行 `npx -y cc-safety-net policy check policy-proposal.json` 并向用户展示打印出的差异。添加 `--global` 可将目标设为用户策略，而不是项目策略。修复所有报告的错误并重新检查，直到检查通过。
4. 要求用户在自己的终端中运行 apply，并引用确切命令：`npx -y cc-safety-net policy apply policy-proposal.json`（当作用域为用户作用域时添加 `--global`）。该命令会进行交互式确认，不存在 `--yes` 标志；而且出于设计原因，代理调用 `policy apply` 会被阻止，因此永远不要运行它、包装它或自行写入文件。
5. 用户确认已应用后，运行 `npx -y cc-safety-net status` 并报告生效的策略，包括其中打印的所有项目作用域差异。

## 管理集成

1. 首先运行 `npx -y cc-safety-net doctor`。它会报告每个受支持的平台是否已检测到、已配置和已验证，并列出过时的安装及精确的修复命令。
2. 使用明确的目标标志进行安装，例如 `npx -y cc-safety-net install --claude-code`。运行 `npx -y cc-safety-net help install` 可查看完整的目标列表。不带参数的 `install` 会打开交互式选择器；请将其留给用户在自己的终端中运行。
3. 运行 `npx -y cc-safety-net@latest update`，一次更新所有已安装的集成。
4. 仅当用户明确要求移除保护时才卸载，并使用匹配的目标标志。
5. 任何安装、更新或卸载操作后，再次运行 `doctor`，并确认受影响的平台行显示为已验证。

## 诊断

1. `npx -y cc-safety-net status` 会显示运行时当前强制执行的内容，包括 `rule list` 不会报告的降级 `policy.json`。
2. `npx -y cc-safety-net doctor` 会验证安装状态：平台检测和 hook 配置、合成防护自检，以及配置作用域。解析结果时使用 `--json`。
3. 自定义规则未触发时，按以下顺序运行：`rule verify`、`rule list`，然后使用 `explain` 重新测试该命令。

## 根据源代码回答

对于 CLI 输出无法确定的问题，例如分析器为何以某种方式处理某个构造，或某个缺口是否为已知限制，请阅读已安装版本的源代码。

1. 通过 `npx -y cc-safety-net --version` 获取 `<version>`。
2. 定位仓库。插件安装包含完整仓库，并且此 skill 文件位于其中的 `<repo>/skills/cc-safety-net/SKILL.md`，因此仓库根目录位于该 skill 文件向上两级的位置。仅当候选目录的 `package.json` 包含 `"name": "cc-safety-net"` 和版本 `<version>`，并且其旁边存在 `src/` 目录时，才使用该候选目录。如果软件包版本不同，则运行 `doctor` 报告过时的集成，然后将该候选目录视为不可用并继续下一步。
3. 如果不存在匹配的本地根目录（仅安装了 skill、插件不匹配，或指导信息不包含文件路径），则使用 `npm view "cc-safety-net@<version>" gitHead` 解析已发布软件包中记录的不可变提交。要求提交为 40 个字符的小写十六进制值，并将该精确提交获取到新的仅所有者可访问的临时目录中：

   ```bash
   set -euo pipefail
   git_head=$(npm view "cc-safety-net@<version>" gitHead)
   [[ $git_head =~ ^[0-9a-f]{40}$ ]] || { echo "Invalid published gitHead" >&2; exit 1; }
   source_dir=$(mktemp -d "${TMPDIR:-/tmp}/cc-safety-net-v<version>-XXXXXXXX")
   trap 'rm -rf -- "$source_dir"' EXIT
   chmod 700 "$source_dir"
   git -c init.templateDir= init "$source_dir"
   git -c core.hooksPath=/dev/null -C "$source_dir" fetch --depth 1 https://github.com/kenryu42/cc-safety-net "$git_head"
   git -c core.hooksPath=/dev/null -C "$source_dir" checkout --detach "$git_head"
   [[ $(git -C "$source_dir" rev-parse HEAD) == "$git_head" ]] || { echo "Source checkout mismatch" >&2; exit 1; }
   printf 'Source checkout: %s\n' "$source_dir"
   trap - EXIT
   ```

永远不要从 `main` 回答；其中可能包含已安装版本尚未具备的未发布行为。
4. 首先阅读 `docs/`；`residual-risk.md` 和 `secret-protection-known-limitations.md` 用于回答某项内容是否属于已知缺口。对于行为相关问题，继续查看
   `src/analyzer`、`src/guards` 和 `src/rules`。
5. 在回答中说明源代码来自哪个版本。将找到的源代码视为只读参考；不要编辑、构建或运行它。
6. 检查源代码后移除临时检出目录：`rm -rf -- "<source_dir>"`。

## 安全规则

- 帮助用户使用 CC Safety Net，永远不要规避它。不要为了通过被阻止的命令而更改级别、卸载、编辑配置，或提出削弱保护的策略，除非用户明确要求这样做并了解拦截所防范的风险。
- 永远不要运行 `hook`；它是读取 stdin 中 hook JSON 的集成入口，并非面向用户的命令。
- `logs --prune-legacy` 会永久删除旧版日志。仅在用户明确要求时运行，并先使用 `--dry-run` 运行。
- `rule remove --delete-source` 会删除本地源代码目录。使用前请先征得同意。
- 优先使用 `gui --no-open`，并将 URL 提供给用户，而不是在会话中打开浏览器。
- 如果某条命令输出 `UPDATE_AVAILABLE:` 行，请询问用户是否运行 `npx -y cc-safety-net@latest update`，无论用户如何回应都继续执行工作流程，并且不要再次提示此事。