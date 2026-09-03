---
name: skill-creator
description: Guides repo-local skill creation and updates. Use when adding or editing .agents/skills, root AGENTS.md routing, SKILL.md frontmatter, description trigger quality, references layout, skill scripts, or skill file line budgets.
---
# Skill Creator

`.agents/skills/` 是仓库本地 skill 的唯一可信来源。`.claude/skills` 由 `agent-skills-nix` 通过 Nix dev-shell hook 生成，且已被 gitignore——绝不编辑或提交它。

`nix/agent-skills.nix` 存放仅限本地的接线配置，flake 的 `nix-filter` 在 skill 源中只包含 `.agents/skills`。这里有意不设全局的 `agent-skills-nix` 目标，也没有基于 git hook 的 skill 同步。

## 添加或编辑 Skill

当重复性的仓库工作需要工作流、本地参考资料、命令序列或应按需加载的策略时，添加一个 Skill。否则应扩展现有 Skill。

1. 编写 `.agents/skills/<skill-name>/SKILL.md`，包含 frontmatter 加上简洁的 Markdown 内容。
2. 把条件性细节——较长的清单、API、示例——移入 `references/*.md`，并在 `SKILL.md` 中链接每个文件，同时用一行说明何时阅读它。
3. 把确定性的重复操作放入 `scripts/`，而不是写成散文描述。
4. 把该 Skill 添加到根目录 `AGENTS.md` 的 Skill Routing 列表中，以便 agent 能发现它。
5. 编辑后运行 `just fmt`。

## Frontmatter

Frontmatter 包含两个必填字段：`name` 和 `description`。

`description` 是主要的发现机制：以第三人称书写，约 20-35 个词，既说明 Skill 做什么，也说明具体的触发条件（文件类型、命令、任务类别）。像“用于测试”这样光秃秃的标签会让 agent 无法完成路由。Frontmatter 总是会被加载，因此请将其长度控制在接近 Anthropic 约 100 词的预算之内。

可选的路由字段：`paths` 用于 Claude 风格的文件匹配（逗号分隔的 glob 或 YAML 列表），`globs` 作为跨运行时的兼容性提示——参见 `.agents/skills/typescript/SKILL.md`。Codex 风格的发现机制读取的是 `description`，因此触发条件也应写在其中。

## 正文

只写 agent 自己推断不出来的内容：带有精确标志位的命令、需要阅读的文件、容易被忽略的本地约定、过去有意做出的决策，以及变更后预期的验证。复述模型本来就会遵循的良好实践，只会与任务上下文争夺空间。

- **渐进式披露。** 根目录的 `AGENTS.md` 在每次会话中都会被加载，因此它只保存 agent 在弄清自己要做什么之前所需的内容：仓库形态、路由、易错点。只有在任务开始后才重要的内容，应归属于负责该任务的 Skill。
- **每条规则只有一个家。** 同一条规则同时出现在 `AGENTS.md` 和某个 Skill 中，会两次消耗 token 并产生偏差。`AGENTS.md` 保留单行路由；Skill 保留规则本身。两个 Skill 之间应按名称交叉链接而不是复制，只有当两者中任何一半都无法挣得自己的触发条件时才合并。
- **指向真实代码。** `rust/adapters/codex/src/loader.rs`、一个 fixture 或一个现有测试，胜过用一段文字转述该模式。
- **绝不抄录 CLI 帮助。** 用法行、标志列表和子命令表都会过时，而且 agent 可以运行 `<tool> --help`。写下帮助输出给不了的判断——何时该用这个工具、在多个工具中该选哪个——并指向该工具。
- **链接外部文档，而不是粘贴它们。** 当 URL 本身已能自述时，将其单独放在一行，不带标题也不带摘要句；仅当读者需要知道为何或何时打开它时，才补充上下文。

https://simonwillison.net/2026/Jul/21/cat-and-thariq/

https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models

## 行数预算

某些 agent 可能只预览文件的前 200 行，因此请将 `SKILL.md` 保持在 160 行以内、每个 `references/*.md` 保持在 180 行以内，并将路由、安全和workflow 指令放在示例和背景之前。较长的材料应按决策点或工作流阶段拆分，但总是被一起阅读的细节应保留在同一个文件中，而不是迫使读者多次打开。参考文件直接从 `SKILL.md` 链接；嵌套的引用链容易被遗漏。

用以下方法审计长度：

```sh
fd . .agents/skills -t f -e md -x wc -l {} | sort -nr
```
