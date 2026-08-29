---
name: cc-safety-net
description: "Operate CC Safety Net: explain why a command was blocked, triage false positives, configure custom rulebooks, manage agent CLI integrations, and diagnose protection."
disable-model-invocation: true
---
<!-- 保持下面的正文与 src/integrations/templates/cc-safety-net.ts 同步。 -->

# CC Safety Net

CC Safety Net 接入编码代理 CLI（Claude Code、Codex、Cursor、Gemini CLI 及其他工具），
并在破坏性命令和机密访问执行前将其阻止。`cc-safety-net` CLI 用于检查和控制这项保护。
运行方式为 `npx -y cc-safety-net`。

## 了解当前 CLI

已安装的 CLI 是命令语法的权威来源。不要猜测标志。

```bash
npx -y cc-safety-net --help
npx -y cc-safety-net help <command>
```

运行 `npx -y cc-safety-net rule doc`，并将其输出视为规则手册架构、路径、GitHub
来源、匹配行为和验证方式的完整事实来源。

以下命令是只读的，可以安全地用于探索：`--help`、`--version`、`status`、
`doctor`、`logs`（不带 `--prune-legacy`）、`explain`、`rule list`、`rule verify`、`rule doc`、
`policy check`、`help`。其他所有命令都会修改配置或已安装的集成；只有在下面的工作流中才能运行这些命令。

## 核心模型

- 内置防护始终生效。自定义规则只能增加限制；规则配置中的任何内容都无法绕过
  CC Safety Net 的内置保护。
- 配置文件（`rule.json`）列出规则手册来源。规则定义位于 `rulebook.json` 中，
  而不是直接位于 `rule.json` 中。
- 三种作用域：用户级（所有项目）、项目级（仅当前项目），以及仓库中位于
  `.cc-safety-net/rules/<rulebook-name>/rulebook.json` 的可共享 GitHub 规则手册。
- 规则手册是实时文件。运行时会在每次工具调用时读取每个 `rulebook.json`，因此保存的
  编辑内容会在下一条命令中生效，无需同步步骤。
- `policy.json` 设置安全级别、按功能划分的开关、按规则划分的覆盖设置以及路径列表。
  它有两个作用域：项目文件 `.cc-safety-net/policy.json`，该文件会提交并与团队共享；
  以及适用于每个项目的用户文件。
- 会话安全级别为 `standard`、`strict` 或 `paranoid`，通过环境变量
  `CC_SAFETY_NET_LEVEL` 按会话设置。

## 选择工作流

- 用户询问某条命令为何被阻止，或展示 `BLOCKED by CC Safety Net` 消息：
  解释一次判定。
- 用户认为某次阻止有误：排查误报。
- 用户希望添加、编辑、禁用或迁移阻止规则：配置规则。
- 用户希望更改安全级别、切换某项保护，或调整路径列表：配置策略。
- 用户希望将 CC Safety Net 安装到代理 CLI 中，或从代理 CLI 中移除：管理集成。
- 某条规则未触发，或用户询问保护是否正常工作：诊断。
- 用户询问分析器为何或如何表现出某种行为，而 `explain` 和
  `rule doc` 未作说明：根据源代码回答。

## 解释一次判定

1. 获取被阻止命令的确切内容。如果用户没有该命令，则使用
   `npx -y cc-safety-net logs` 查找（可通过 `--project .`、`--agent <name>` 或 `--since <days>` 缩小范围）。
2. 将确切命令作为一个字面量参数传递给 `npx -y cc-safety-net explain`。优先使用
   支持 argv 的工具；通过 shell 调用时，将整个命令进行 shell 转义，使其成为一个参数。
   切勿将原始命令文本插入双引号中：`$()`、反引号和变量会在 `explain` 接收到命令前展开。
   当判定取决于工作目录时，添加 `--cwd <path>`。接收命令后，`explain` 会分析该字符串，
   绝不会执行它。
3. 阅读跟踪信息：命令是如何拆分的、哪条规则匹配，以及 RESULT 状态和原因。
   对于允许和阻止两种判定，`explain` 都会以 0 退出；应从输出中读取判定结果，而不是退出状态。
4. 用通俗语言说明原因。对于确实存在的危险，建议原因中提到的更安全替代方案，
   例如在 `git reset --hard` 之前执行 `git stash`。

## 处理误报

1. 使用 `npx -y cc-safety-net logs --suspect --since 7` 列出最近疑似误拒绝的记录，或使用 `npx -y cc-safety-net logs --id <id>` 获取一条记录。
2. 使用 `explain` 重现该决策，并查看触发了哪条规则。
3. 如果触发的是自定义规则，请修复该规则集：使用覆盖项禁用或重新措辞，或者编辑该规则（参见配置规则），然后重新运行 `explain` 以确认新的判定结果。
4. 如果触发的是内置规则，则无法通过编辑规则放宽限制。请检查触发原因，查看是否存在文档中说明的规避方式，例如在链接工作树中执行本地 git 丢弃操作时使用 `CC_SAFETY_NET_WORKTREE=1`，或者在可信的透明包装器隐藏了分析器需要的真实命令时使用 `rule wrapper add`。将包装器名称作为单独的 argv 值传入，或将其作为一个参数进行 shell 转义。否则，请解释该规则所防范的风险，并建议在 https://github.com/kenryu42/cc-safety-net/issues 报告该情况。

## 配置规则

使用用户提示中已经提供的信息。仅当作用范围、操作、规则意图、合并行为或目标命令不明确时才询问。

1. 尽可能根据提示确定所请求的作用范围：
   - User：应用于所有项目。
   - Project：仅应用于当前项目。
   - GitHub：在当前仓库中编辑或创建可共享的规则集结构。
2. 尽可能根据提示确定是要添加规则、编辑规则、禁用规则、覆盖某个原因、信任透明包装器、迁移旧版规则，还是解释自定义规则。
3. 修改已安装的本地规则前，先检查现有配置：
   - 运行 `npx -y cc-safety-net rule verify`
   - 运行 `npx -y cc-safety-net rule list`
4. 仅当用户要求提供规则建议，或所请求的规则依赖于项目上下文时，才检查相关项目文件。查看能够说明高风险命令的清单文件、脚本、任务运行器、CI、基础设施、数据库、迁移和部署文件。
5. 使用 `rule doc` 将请求转换为有效的 CC Safety Net JSON。
   - 对于 User 或 Project 作用域，在所选的本地 `rule.json` 和
     `<rulebook-name>/rulebook.json` 中添加或编辑内容。
   - 对于 GitHub 作用域，在当前仓库中的
     `.cc-safety-net/rules/<rulebook-name>/rulebook.json` 中添加或编辑内容。
   - 不要提议使用 `owner/repo` 添加 GitHub 源；从 GitHub 源安装规则不属于此工作流。
   - 如果用户明确要求安装现有的 GitHub 规则集，而不是编写规则集，请使用 `npx -y cc-safety-net rule add owner/repo --only <rulebook...>`；只有在用户希望安装所有规则集时才省略 `--only`，并且仅当用户指定了非默认 ref 时才添加 `--ref <ref>`。
   - 对于透明包装器，优先使用 `npx -y cc-safety-net rule wrapper add`，并将可信的包装器名称作为单独的 argv 值传入，或将其作为一个参数进行 shell 转义，而不是手动编辑 `rule.json`。
6. 保留无关的现有规则集源、覆盖项和规则集。创建新规则集、与现有配置合并或解决歧义时，在写入前预览拟写入的 JSON。
7. 对于 GitHub 规则，确保仓库布局为
   `.cc-safety-net/rules/<rulebook-name>/rulebook.json`，并确保源名称、目录名称和规则集 `name` 完全一致。
8. 编辑后进行验证：
   - User 或 Project 规则：运行 `npx -y cc-safety-net rule verify` 和 `npx -y cc-safety-net rule
     list`。这两个命令会涵盖所有作用域，因此都不使用 `--global`。
   - 仅涉及可共享 GitHub 规则集的编辑：运行 `npx -y cc-safety-net rule verify`。只有当该规则集也安装在本地 `rule.json` 中时，才运行 `list`。
9. 如果验证失败，显示确切的错误，并进行最小程度的修复。
10. 确认已保存的路径或 GitHub 规则集路径，并总结已添加或更新的规则。

规则不变量：

- 不要使用旧版内联 `.safety-net.json` 或 `~/.cc-safety-net/config.json` 规则。使用 `npx -y cc-safety-net rule migrate` 转换现有的旧版文件。
- 每个规则命令都必须列在 `allowed_commands` 中。`tests` fixtures 是可选的；`rule verify` 会根据规则簿自身的规则评估 `rulebook_version` 2 fixtures，而 fixture 命令只是分析器输入，CC Safety Net 绝不会执行这些命令。
- 如果存在被阻止的 fixture，则必须指定预期的 `rule`，且该规则必须存在于规则簿中。
- 本地源名称必须是 `project-rules` 这类不带路径的名称；不要在 `rules` 中放入文件系统路径。
- 已保存的规则簿会立即生效。不存在待处理状态，也没有之后需要运行的操作，因此应验证编辑结果，而不是激活它。
- 缺失或无效的规则簿文件会使该源处于非活动状态；不可读或无效的 `rule.json` 会使其作用域内的每个源都处于非活动状态：这些规则将停止应用，而其他自定义规则和内置保护仍保持活动状态。修复诊断信息中指出的文件。
- 重复的规则簿名称会保留第一次声明的名称，用户作用域优先于项目作用域，并忽略后出现的规则簿。
- `npx -y cc-safety-net rule add owner/repo` 会获取远程规则簿、验证它们，并将每个规则簿供应到 `<rulebook-name>/rulebook.json`；`npx -y cc-safety-net rule update [source]` 会重新获取并覆盖这些副本，同时打印发生的更改。运行时绝不会获取远程内容；如果远程源没有已供应的文件，则会报告必须先运行 `rule update` 来供应该文件。
- `rule sync` 已弃用：它只会迁移早期版本遗留的锁和缓存。绝不要将其作为验证或激活步骤运行。

## 配置策略

两个 `policy.json` 文件都受到保护：由你提出更改，用户应用更改。允许读取，但不允许写入。

1. 检查当前状态：使用 `npx -y cc-safety-net status` 查看生效的策略及其加载的文件路径，使用 `npx -y cc-safety-net rule list` 查看自定义规则，并补充请求所依赖的项目上下文。提出更改前，先读取现有的 `policy.json`。
2. 将提议的策略 JSON 写入未受保护的路径，例如 `policy-proposal.json`。对于项目作用域，只设置团队打算控制的字段；未设置的字段会继承用户策略，而 `apply` 只会写入提案中设置的字段。
   应用操作会替换目标文件，因此提案必须是完整策略，而不是补丁。审计设置仅适用于用户作用域；项目提案不能设置这些设置。
3. 运行 `npx -y cc-safety-net policy check policy-proposal.json` 并向用户展示打印出的差异。添加 `--global` 可将目标设为用户策略，而不是项目策略。修复报告的每个错误并重新检查，直到通过。
4. 要求用户在自己的终端中运行应用命令，并引用确切命令：
   `npx -y cc-safety-net policy apply policy-proposal.json`（如果作用域为用户作用域，则加上 `--global`）。该命令会要求交互式确认，不存在 `--yes` 标志；并且出于设计原因，代理调用 `policy apply` 会被阻止，因此绝不要运行它、包装它，或自行写入该文件。
5. 用户确认已应用后，运行 `npx -y cc-safety-net status` 并报告生效的策略，包括它打印出的任何项目作用域差异。

## 管理集成

1. 首先运行 `npx -y cc-safety-net doctor`。它会将每个受支持的平台报告为已检测、已配置和已验证，并列出过时的安装及准确的修复命令。
2. 使用明确的目标标志进行安装，例如 `npx -y cc-safety-net install --claude-code`。
   运行 `npx -y cc-safety-net help install` 查看完整的目标列表。不带参数的 `install` 会打开交互式选择器；请将其留给用户在自己的终端中运行。
3. 运行 `npx -y cc-safety-net@latest update`，一次性更新所有已安装的集成。
4. 仅当用户明确要求移除保护时，才使用对应的目标标志进行卸载。
5. 每次安装、更新或卸载后，再次运行 `doctor`，并确认受影响的平台行显示为已验证。

## 诊断

1. `npx -y cc-safety-net status` 会显示运行时当前强制执行的内容，包括 `rule list` 不会报告的已降级 `policy.json`。
2. `npx -y cc-safety-net doctor` 会验证安装情况：平台检测和 hook 配置、合成防护自检，以及配置作用域。解析结果时使用 `--json`。
3. 自定义规则未触发时，按以下顺序运行：`rule verify`、`rule list`，然后使用 `explain` 重新测试该命令。

## 从源代码中获取答案

对于 CLI 输出无法确定的问题，例如分析器为何以某种方式处理某个构造，或某个缺口是否属于已知限制，请阅读已安装版本的源代码。

1. 从 `npx -y cc-safety-net --version` 获取 `<version>`。
2. 定位仓库。插件安装会附带完整仓库，此 skill 文件位于其中的 `<repo>/skills/cc-safety-net/SKILL.md`，因此仓库根目录位于该 skill 文件向上两级的位置。仅当候选目录的 `package.json` 包含 `"name": "cc-safety-net"` 且版本为 `<version>`，并且其旁边存在 `src/` 目录时，才使用该候选目录。
   如果软件包版本不同，则运行 `doctor` 报告过时的集成，然后将该候选目录视为不可用并继续下一步。
3. 如果不存在匹配的本地根目录（仅安装了 skill、插件不匹配，或指南中没有文件路径），则使用 `npm view "cc-safety-net@<version>" gitHead` 解析已发布软件包中记录的不可变提交。必须要求提交为 40 个字符的小写十六进制值，并将该确切提交获取到一个全新的、仅所有者可访问的临时目录中：

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

永远不要基于 `main` 作答；其中可能包含已发布版本尚不具备的未发布行为。
4. 先阅读 `docs/`；`residual-risk.md` 和 `secret-protection-known-limitations.md` 用于回答某项内容是否属于已知缺口。对于行为相关问题，继续查看
   `src/analyzer`、`src/guards` 和 `src/rules`。
5. 在回答中说明源代码来自哪个版本。将定位到的源代码视为只读参考；不要编辑、构建或运行它。
6. 检查完源代码后删除临时检出目录：`rm -rf -- "<source_dir>"`。

## 安全规则

- 帮助用户使用 CC Safety Net，绝不规避它。除非用户明确要求这样做，并且了解拦截所防范的风险，否则不要为了让被拦截的命令通过而更改级别、卸载、编辑配置或提出弱化保护的策略。
- 永远不要运行 `hook`；它是从 stdin 读取 hook JSON 的集成入口，而不是面向用户的命令。
- `logs --prune-legacy` 会永久删除旧版日志。仅在用户明确要求时运行，并先使用 `--dry-run` 运行。
- `rule remove --delete-source` 会删除本地源代码目录。使用前请先询问。
- 优先使用 `gui --no-open`，并将 URL 提供给用户，而不是在会话中打开浏览器。
- 如果某条命令输出包含 `UPDATE_AVAILABLE:` 行，询问用户一次是否运行 `npx -y cc-safety-net@latest update`；无论用户如何回应，都继续工作流而无需等待，并且不要再次提及此事。