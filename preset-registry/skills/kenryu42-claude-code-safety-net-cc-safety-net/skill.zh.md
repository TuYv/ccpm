---
name: cc-safety-net
description: Configure CC Safety Net rulebooks for user, project, or shareable GitHub scope.
---
<!-- 保持以下工作流与 src/integrations/templates/cc-safety-net.ts 同步。 -->

## 工作流

帮助用户为 CC Safety Net 配置自定义阻止规则。

使用用户提示中已经提供的信息。仅当作用域、操作、规则意图、合并行为或目标命令不明确时才提问。

1. 运行 `npx -y cc-safety-net rule doc`，并将其输出视为关于架构、路径、GitHub 源、匹配行为和验证的完整事实来源。
2. 尽可能根据提示确定请求的作用域：
   - 用户：适用于所有项目。
   - 项目：仅适用于当前项目。
   - GitHub：在当前仓库中编辑或创建可共享的规则手册结构。
3. 尽可能根据提示确定是添加规则、编辑规则、禁用规则、覆盖原因、迁移旧版规则，还是解释自定义规则。
4. 在修改已安装的本地规则前检查现有配置：
   - 运行 `npx -y cc-safety-net rule verify`
   - 运行 `npx -y cc-safety-net rule list`
5. 仅当用户要求提供规则建议，或请求的规则依赖项目上下文时，才检查相关项目文件。查看可说明高风险命令的清单、脚本、任务运行器、CI、基础设施、数据库、迁移和部署文件。
6. 使用 `rule doc` 将请求转换为有效的 CC Safety Net JSON。
   - 对于用户或项目作用域，添加或编辑所选的本地 `rule.json` 和 `<rulebook-name>/rulebook.json`。
   - 对于 GitHub 作用域，添加或编辑当前仓库中的 `.cc-safety-net/rules/<rulebook-name>/rulebook.json`。
   - 不要提议使用 `owner/repo` 添加 GitHub 源；从 GitHub 源安装规则不在此工作流范围内。
7. 保留不相关的现有规则手册源、覆盖项和规则手册。创建新规则手册、与现有配置合并或消除歧义时，在写入前预览拟议的 JSON。
8. 对于 GitHub 规则，确保仓库布局为 `.cc-safety-net/rules/<rulebook-name>/rulebook.json`，并确保源名称、目录名称和规则手册的 `name` 完全匹配。
9. 编辑后进行验证：
   - 项目规则：运行 `npx -y cc-safety-net rule sync`、`npx -y cc-safety-net rule verify` 和 `npx -y cc-safety-net rule list`。
   - 用户规则：运行 `npx -y cc-safety-net rule sync --global`、`npx -y cc-safety-net rule verify` 和 `npx -y cc-safety-net rule list`。
   - 仅编辑可共享的 GitHub 规则手册：运行 `npx -y cc-safety-net rule verify`。仅当该规则手册也安装在本地 `rule.json` 中时，才运行 `sync` 和 `list`。
10. 如果验证失败，显示确切错误并进行最小幅度的修复。
11. 确认已保存的路径或 GitHub 规则手册路径，并总结已添加或更新的规则。

## 规则

- 如果命令输出 `UPDATE_AVAILABLE:` 行，询问用户一次是否运行 `npx -y cc-safety-net@latest update`，无论如何都继续执行工作流而不等待，并且不要再次询问。
- 自定义规则只能增加限制；不能绕过 CC Safety Net 的内置保护。
- 配置文件列出规则手册源。规则定义位于 `rulebook.json` 中，而不是直接位于 `rule.json` 中。
- 不要使用旧版内联 `.safety-net.json` 或 `~/.cc-safety-net/config.json` 规则。使用 `npx -y cc-safety-net rule migrate` 转换现有旧版文件。
- 每条规则命令都必须列在 `allowed_commands` 中。`tests` 固件是可选的，并且永远不会执行。
- 如果存在被阻止的固件，则必须指定预期的 `rule`，并且该规则必须存在于规则手册中。
- 本地源名称应为 `project-rules` 这样的纯名称；不要在 `rules` 中放置文件系统路径。
- 已编辑或无效的本地规则手册会继续强制执行其上一次已同步并通过摘要验证的版本，而编辑内容将保持待处理状态，直到 `npx -y cc-safety-net rule sync` 对其完成验证。
- 缺少锁定条目或缓存、缓存摘要不匹配或缓存的规则手册无效，都会使该源处于非活动状态；缺少锁定文件或 `rule.json` 不可读，则会使其作用域内的所有源处于非活动状态：这些规则将停止应用，而其他自定义规则和内置保护仍保持活动。修复问题后，运行 `npx -y cc-safety-net rule sync`——刚添加的规则在同步之前不会生效，也不会给出任何提示。如果规则未触发，请运行 `npx -y cc-safety-net status`；与 `rule list` 不同，它还会报告处于降级状态的 `policy.json`。
- 如果规则手册名称重复，将保留首次声明，用户作用域优先于项目作用域，并忽略后面的规则手册。
- 当同步的作用域仍无法正常加载时，`rule sync` 会报告失败并附上剩余的诊断信息，而不是报告成功。