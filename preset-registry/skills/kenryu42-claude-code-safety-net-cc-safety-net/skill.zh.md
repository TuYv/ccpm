---
name: cc-safety-net
description: "Operate CC Safety Net: explain why a command was blocked, triage false positives, configure custom rulebooks, manage agent CLI integrations, and diagnose protection."
disable-model-invocation: true
---
<!-- 将下面的正文与 src/integrations/templates/cc-safety-net.ts 保持同步。 -->

# CC Safety Net

CC Safety Net 接入编码代理 CLI（Claude Code、Codex、Cursor、Gemini CLI 等），
在破坏性命令和机密访问执行前将其拦截。`cc-safety-net` CLI 用于检查和控制这项保护。
使用 `npx -y cc-safety-net` 运行它。

## 了解当前 CLI

已安装的 CLI 是命令语法的权威来源。不要猜测标志。

```bash
npx -y cc-safety-net --help
npx -y cc-safety-net help <command>
```

运行 `npx -y cc-safety-net rule doc`，并将其输出视为规则架构、路径、GitHub
源、匹配行为和验证的完整事实来源。

以下命令是只读的，可安全地用于发现：`--help`、`--version`、`status`、
`doctor`、不带 `--prune-legacy` 的 `logs`、`explain`、`rule list`、`rule verify`、`rule doc`、
`policy check`、`help`。其他所有命令都会修改配置或已安装的集成；仅在下方的工作流中运行这些命令。

## 核心模型

- 内置防护始终生效。自定义规则只会增加限制；规则配置中的任何内容都无法绕过
  CC Safety Net 的内置保护。
- 配置文件（`rule.json`）列出规则簿源。规则定义位于 `rulebook.json` 中，
  而不是直接位于 `rule.json` 中。
- 三种作用域：用户（所有项目）、项目（仅当前项目），以及仓库中
  `.cc-safety-net/rules/<rulebook-name>/rulebook.json` 处可共享的 GitHub
  规则簿。
- 规则簿是实时文件。运行时会在每次工具调用时读取每个 `rulebook.json`，因此保存的
  编辑内容会应用到下一条命令，无需同步步骤。
- `policy.json` 设置安全级别、各功能开关、各规则覆盖项和路径列表。它有两个作用域：
  项目文件 `.cc-safety-net/policy.json`（提交并与团队共享），以及应用于每个项目的用户文件。
- 会话安全级别为 `standard`、`strict` 或 `paranoid`，通过环境变量
  `CC_SAFETY_NET_LEVEL` 按会话设置。

## 选择工作流

- 用户询问某条命令为何被拦截，或显示 `BLOCKED by CC Safety Net` 消息：
  解释一次决策。
- 用户认为某次拦截有误：排查误报。
- 用户想要添加、编辑、禁用或迁移拦截规则：配置规则。
- 用户想要更改安全级别、切换保护功能或调整路径列表：配置策略。
- 用户想要将 CC Safety Net 安装到代理 CLI 中，或从代理 CLI 中移除：管理集成。
- 某条规则未触发，或用户询问保护是否正常工作：进行诊断。
- 用户询问分析器以某种方式运行的具体原因或机制，而 `explain` 和
  `rule doc` 未作说明：根据源代码回答。

## 解释一次决策

1. 获取被拦截命令的准确内容。如果用户没有提供，使用
   `npx -y cc-safety-net logs` 查找（使用 `--project .`、`--agent <name>` 或
   `--since <days>` 缩小范围）。
2. 将准确命令作为一个字面量参数传给 `npx -y cc-safety-net explain`。优先使用支持
   argv 的工具；通过 shell 调用时，将整个命令进行 shell 转义，使其作为一个参数。
   永远不要将原始命令文本插入双引号中：`$()`、反引号和变量会在 `explain` 接收到命令前展开。
   当决策取决于工作目录时，添加 `--cwd <path>`。收到命令后，`explain` 会分析该字符串，
   绝不会执行它。
3. 阅读跟踪信息：命令是如何拆分的、哪条规则匹配，以及 RESULT 状态和原因。
   `explain` 对允许和拦截两种判定都会以 0 退出；应从输出中读取判定结果，而不是退出状态。
4. 用通俗语言说明原因。对于确实存在的危险，建议原因中提到的更安全替代方案，
   例如先执行 `git stash`，再执行 `git reset --hard`。

## 处理误报

1. 使用 `npx -y cc-safety-net logs --suspect --since 7` 列出最近疑似误判的拒绝记录，或使用 `npx -y cc-safety-net logs --id <id>` 获取一条记录。
2. 使用 `explain` 重现该决策，并查看触发了哪条规则。
3. 如果触发的是自定义规则，请修复该规则集：使用覆盖配置禁用或重新表述该规则，或编辑该规则（参见配置规则），然后重新运行 `explain` 以确认新的判定结果。
4. 如果触发的是内置规则，则无法通过编辑规则来放宽限制。请检查原因，确认是否有文档记录的规避方式，例如在链接工作树中执行本地 git 丢弃操作时使用 `CC_SAFETY_NET_WORKTREE=1`，或者当可信的透明包装器向分析器隐藏了真实命令时使用 `rule wrapper add`。将包装器名称作为单独的 argv 值传递，或将其 shell 转义为一个参数。如果用户明确希望关闭该内置规则，请从 `explain --json` 的 `ruleId` 字段中读取其 id，并建议使用按规则的策略覆盖（参见配置策略）。否则，请解释该规则所防范的风险，并建议在 https://github.com/kenryu42/cc-safety-net/issues 报告此情况。

## 配置规则

尽可能使用用户提示中已经提供的信息。只有在作用范围、操作、规则意图、合并行为或目标命令不明确时才提问。

1. 尽可能根据提示确定请求的作用范围：
   - 用户：适用于所有项目。
   - 项目：仅适用于当前项目。
   - GitHub：在当前仓库中编辑或创建可共享的规则集结构。
2. 尽可能根据提示确定是要添加规则、编辑规则、禁用规则、覆盖某个原因、信任透明包装器、迁移旧版规则，还是解释自定义规则。
3. 在修改已安装的本地规则之前检查现有配置：
   - 运行 `npx -y cc-safety-net rule verify`
   - 运行 `npx -y cc-safety-net rule list`
4. 仅当用户要求提供规则建议，或所请求的规则依赖项目上下文时，才检查相关项目文件。查看能够说明高风险命令的清单文件、脚本、任务运行器、CI、基础设施、数据库、迁移和部署文件。
5. 使用 `rule doc` 将请求转换为有效的 CC Safety Net JSON。
   - 对于用户或项目作用域，添加或编辑选定的本地 `rule.json` 和
     `<rulebook-name>/rulebook.json`。
   - 对于 GitHub 作用域，在当前仓库中添加或编辑 `.cc-safety-net/rules/<rulebook-name>/rulebook.json`。
   - 不要提议使用 `owner/repo` 添加 GitHub 源；从 GitHub 源安装规则不属于此工作流程。
   - 如果用户明确要求安装现有的 GitHub 规则集，而不是编写规则集，请使用 `npx -y cc-safety-net rule add owner/repo --only <rulebook...>`；只有在用户希望安装全部规则集时才省略 `--only`，并且只有在用户指定了非默认 ref 时才添加 `--ref <ref>`。
     不带源的 `rule add --only <rulebook...>` 会从官方 `cc-safety-net/rulebooks` 仓库中选择规则集。该仓库中经过整理的规则集会阻止具有破坏性的 Terraform、AWS、gcloud 和 Azure CLI 操作；如果其中已有规则集能够满足请求，优先安装相应规则集，而不是自行编写。
   - 对于透明包装器，优先使用 `npx -y cc-safety-net rule wrapper add`，将可信包装器名称作为单独的 argv 值传递，或将其 shell 转义为一个参数，而不是手动编辑 `rule.json`。
6. 保留无关的现有规则集源、覆盖配置和规则集。在创建新规则集、与现有配置合并或解决歧义时，先预览拟写入的 JSON。
7. 对于 GitHub 规则，确保仓库布局为
   `.cc-safety-net/rules/<rulebook-name>/rulebook.json`，并确保源名称、目录名称和规则集 `name` 完全一致。
8. 编辑后进行验证：
   - 用户或项目规则：运行 `npx -y cc-safety-net rule verify` 和 `npx -y cc-safety-net rule
     list`。这两个命令会覆盖所有作用域，因此都不接受 `--global`。
   - 仅编辑可共享的 GitHub 规则集：运行 `npx -y cc-safety-net rule verify`。只有在该规则集也安装到了本地 `rule.json` 中时，才运行 `list`。
9. 如果验证失败，显示确切的错误，并进行最小程度的修复。
10. 确认已保存的路径或 GitHub 规则集路径，并总结新增或更新的规则。

规则不变量：

- 不要使用旧版内联 `.safety-net.json` 或 `~/.cc-safety-net/config.json` 规则。使用 `npx -y cc-safety-net rule migrate` 转换现有旧版文件。
- 每个规则命令都必须列在 `allowed_commands` 中。`tests` fixtures 是可选的；`rule verify` 会根据规则簿自身的规则评估 `rulebook_version` 2 fixtures，而 fixture 命令只是分析器输入，CC Safety Net 绝不会执行它们。
- 如果存在被阻止的 fixture，则必须指定预期的 `rule`，且该规则必须存在于规则簿中。
- 本地源名称必须是 `project-rules` 这样的裸名称；不要将文件系统路径放入 `rules` 中。
- 已保存的规则簿会立即生效。不存在待处理状态，也没有之后需要运行的操作，因此应验证编辑结果，而不是激活它。
- 缺失或无效的规则簿文件会使该源处于非活动状态；不可读或无效的 `rule.json` 会使其作用域内的每个源处于非活动状态：这些规则将停止应用，而其他自定义规则和内置保护仍保持活动状态。修复诊断信息中指出的文件。
- 重复的规则簿名会保留第一个声明的名称，用户作用域优先于项目作用域，并忽略后面的规则簿。
- `npx -y cc-safety-net rule add owner/repo` 会获取远程规则簿、验证它们，并将每个规则簿 vendoring 到 `<rulebook-name>/rulebook.json`；`npx -y cc-safety-net rule update [source]` 会重新获取并覆盖这些副本，同时打印发生了哪些更改。运行时绝不会获取远程内容；如果某个远程源没有 vendored 文件，则会报告必须先运行 `rule update` 将其 vendoring。
- `rule sync` 已弃用：它只会迁移早期版本遗留的锁和缓存。绝不要将其作为验证或激活步骤运行。

## 配置策略

两个 `policy.json` 文件都受保护：由你提出更改，由用户应用更改。允许读取，但不允许写入。

`policy.json` 字段除了 `version: 1` 外都可选（`policy check` 会报告所有架构错误，因此应根据它进行验证，而不是继续猜测其他字段）：

- `safety.level`：`standard`、`strict` 或 `paranoid`。`safety.overrides`：用于固定某项能力、独立于级别设置的布尔值，包括 `fail_closed`、`paranoid_rm` 和 `paranoid_interpreters`。
- `workflow.worktree_mode`：布尔值，允许在关联工作树中执行本地 git 丢弃操作。
- `destructive_command_protection` 和 `secret_protection`：包含一个 `enabled` 布尔值，以及一个 `overrides` 映射，可将内置规则 id（`git.reset-hard`、`secret.basename.env`）设为 `"on"` 或 `"off"`。对于被阻止的命令，可从 `explain --json` 的 `ruleId` 字段获取其 id。
- `destructive_command_protection.allow_paths`：允许递归删除目标的绝对路径或 `~/` 路径。`secret_protection.allow_paths`：免受 secret 保护的、由用户管理的精确路径；不接受 glob。`secret_protection.deny_paths`：像内置 secret 一样受保护的额外路径。
- `audit.retention_days`：保留审计历史的天数，仅限用户作用域。

1. 检查当前状态：使用 `npx -y cc-safety-net status` 查看生效的策略及其加载的文件路径，使用 `npx -y cc-safety-net rule list` 查看自定义规则，并查看请求所依赖的其他项目上下文。在提出更改之前，先读取现有的 `policy.json`。
2. 将拟议的策略 JSON 写入未受保护的路径，例如 `policy-proposal.json`。对于项目作用域，只设置团队打算控制的字段；未设置的字段会继承用户策略，而 `apply` 只会写入提案中设置的字段。应用操作会替换目标文件，因此提案必须是完整策略，而不是补丁。审计设置仅限用户作用域；项目提案不能设置这些设置。
3. 运行 `npx -y cc-safety-net policy check policy-proposal.json` 并向用户展示打印出的差异。添加 `--global` 可将目标设为用户策略而不是项目策略。修复报告的每个错误，并反复检查，直到通过。
4. 要求用户在自己的终端中运行 apply，并引用确切命令：
   `npx -y cc-safety-net policy apply policy-proposal.json`（当作用域为用户作用域时添加 `--global`）。该命令会进行交互式确认，不存在 `--yes` 标志；并且出于设计原因，agent 调用 `policy apply` 会被阻止，因此绝不要运行它、包装它或自行写入文件。
5. 用户确认已应用后，运行 `npx -y cc-safety-net status` 并报告生效的策略，包括它打印出的任何项目作用域差异。

## 管理集成

1. 先运行 `npx -y cc-safety-net doctor`。它会将每个受支持的平台报告为已检测、已配置和已验证，并为过时的安装列出确切的修复命令。
2. 使用显式的目标标志进行安装，例如 `npx -y cc-safety-net install --claude-code`。运行 `npx -y cc-safety-net help install` 查看完整的目标列表。不带参数的 `install` 会打开交互式选择器；请将其留给用户自己的终端。
3. 运行 `npx -y cc-safety-net@latest update`，一次性更新所有已安装的集成。
4. 只有当用户明确要求移除保护时，才卸载，并使用相匹配的目标标志。
5. 每次安装、更新或卸载后，再次运行 `doctor`，并确认受影响的平台行显示为已验证。

## 诊断

1. `npx -y cc-safety-net status` 会显示运行时当前强制执行的内容，包括 `rule list` 未报告的降级 `policy.json`。
2. `npx -y cc-safety-net doctor` 会验证安装：平台检测和钩子配置、合成防护自检，以及配置作用域。解析结果时使用 `--json`。
3. 自定义规则未触发时，按以下顺序运行：`rule verify`、`rule list`，然后使用 `explain` 重新测试该命令。

## 根据源代码回答

对于 CLI 输出无法确定的问题，例如分析器为何以某种方式处理某个构造，或某个缺口是否属于已知限制，请阅读已安装版本的源代码。

1. 从 `npx -y cc-safety-net --version` 获取 `<version>`。
2. 定位仓库。插件安装会包含完整仓库，该技能文件位于其中的 `<repo>/skills/cc-safety-net/SKILL.md`，因此仓库根目录位于技能文件向上两级的位置。只有当候选目录的 `package.json` 包含 `"name": "cc-safety-net"` 且版本为 `<version>`，并且其旁边存在 `src/` 目录时，才使用该候选目录。如果包版本不同，运行 `doctor` 报告过时的集成，然后将该候选目录视为不可用并继续下一步。
3. 如果不存在匹配的本地根目录（仅安装了技能、插件不匹配，或指导内容没有文件路径），则使用 `npm view "cc-safety-net@<version>" gitHead` 解析已发布包中记录的不可变提交。要求提交为 40 个字符的小写十六进制值，并将该确切提交提取到一个全新的、仅所有者可访问的临时目录中：

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

永远不要从 `main` 回答问题；其中可能包含已发布版本尚未具备的未发布行为。
4. 首先阅读 `docs/`；`residual-risk.md` 和 `secret-protection-known-limitations.md` 用于回答某项内容是否属于已知缺口。对于行为相关问题，继续查看
   `src/analyzer`、`src/guards` 和 `src/rules`。
5. 在回答中说明源代码来自哪个版本。将找到的源代码视为只读参考；不要编辑、构建或运行它。
6. 检查源代码后删除临时检出目录：`rm -rf -- "<source_dir>"`。

## 安全规则

- 帮助用户使用 CC Safety Net，绝不要规避它。除非用户明确要求这样做，并且了解拦截所防范的风险，否则不要更改级别、卸载、编辑配置，或提出会削弱保护以使被拦截命令通过的策略。
- 永远不要运行 `hook`；它是从标准输入读取 hook JSON 的集成入口，而不是面向用户的命令。
- `logs --prune-legacy` 会永久删除旧版日志。仅在用户明确要求时运行，并先使用 `--dry-run` 运行。
- `rule remove --delete-source` 会删除本地源代码目录。使用前请先询问。
- 优先使用 `gui --no-open`，并向用户提供 URL，而不是在会话中打开浏览器。
- 如果某条命令输出了 `UPDATE_AVAILABLE:` 行，请询问用户是否运行 `npx -y cc-safety-net@latest update`；无论用户是否等待回复，都要继续工作流，并且不要再次提及此事。