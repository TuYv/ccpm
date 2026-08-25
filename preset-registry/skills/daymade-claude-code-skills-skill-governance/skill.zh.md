---
name: skill-governance
description: >-
  Enforce source-of-truth discipline for Claude Code skill marketplaces, caches,
  suite migrations, and loose userSettings skills. Use whenever the user says
  "check skill drift", "检查 skill 漂移", "sync skills from source",
  "以源码为准同步 skill 缓存", "reconcile installs after a suite migration",
  "清理旧 standalone skill 安装", "clean old skill cache versions",
  "清理 skill 缓存旧版本", "switch marketplace to local source",
  "marketplace 切到本地源码", "thin skills", "薄 skill", "loose skills",
  "清理 user skills", or reports stale caches, version mismatches, orphaned
  plugins, duplicate direct-copy skills, untracked user skills, a marketplace
  cache that must be rebuilt from a local source repo, or a newly merged suite
  whose installed state still exposes the old plugin identities.
---
# Skill 治理

此 skill 用于使 Claude Code skill 市场及其缓存与源代码仓库保持一致。源目录是唯一事实来源；缓存是派生副本。当源发生变化时，必须通过官方 `claude plugin` 命令重建缓存，而不是手动复制文件。

## 治理原则

1. **源代码是事实来源** — 本地源代码仓库是权威来源。如果缓存较旧或存在差异，应从源代码重建缓存。
2. **仅使用官方方法** — 使用 `claude plugin marketplace`、`claude plugin update`、`claude plugin uninstall` 和 `claude plugin install`。手动删除缓存或复制文件只能作为清理步骤，绝不能作为主要安装方法。
3. **保留作用域** — 在插件最初安装时所使用的作用域（`user` 或 `project`）下重新安装每个插件。
4. **缓存中每个 skill 仅保留一个版本** — 同步完成后，删除旧的 semver 版本子目录，仅保留最新版本。
5. **空操作安全** — 漂移检查为只读操作。只有在用户确认或存在明确触发条件后，才执行同步和清理。
6. **工作区目录不是插件** — 在判断哪些内容属于缓存时，忽略 `*-workspace`、`dist`、`scripts`、`tests`、`references`、`demos` 以及其他非插件目录。
7. **退役松散 skill，不要销毁它们** — 对于没有 SSOT 或属于过时重复项的未跟踪 userSettings skill，将活动目录移动到带日期的 `retired-skills/` 备份中，而不是直接删除。

## 比较源代码与缓存时应忽略的内容

`.git`、`.in_use`、`.security-scan-passed`、`.orphaned_at`、`.DS_Store`、`.gitignore`、`__pycache__`、`.pytest_cache`、`.venv`、`node_modules`、`*.pyc`、`*.pyo`。

同时忽略并非 skill 的顶层目录：`*-workspace`、`dist`、`scripts`、`tests`、`references`、`demos`。

## 工作流 A：检查 skill 漂移 / 检查 skill 漂移

这是只读报告，不会修改任何内容。

1. 确定要检查的市场。默认使用 `daymade-skills` 和 `daymade-skills-pro`；如果用户指定了某个市场，则使用用户指定的市场。
2. 对于每个市场，通过读取源目录中的 `.claude-plugin/marketplace.json` 找到其源代码仓库。
3. 对于 `marketplace.json` 中的每个插件条目：
   - 定位源目录（`source` 字段）。
   - 如果插件是包含 `skills` 数组的套件，则将套件根目录视为其中捆绑子 skill 的源目录。不要单独检查各个子 skill 目录。
   - 在 `~/.claude/plugins/cache/<marketplace>/<plugin>/` 中找到最新的 semver 版本子目录。
   - 比较源目录与该版本目录，并忽略上述模式。
   - 记录：
     - **过时** — 内容存在差异。
     - **版本不匹配** — `marketplace.json` 版本 != 最新缓存版本。
     - **缓存中缺失** — 源代码中已列出，但不存在缓存子目录。
     - **缓存中的孤立项** — 缓存子目录存在，但插件未列入 `marketplace.json`。
4. 检查 `~/.claude/skills/` 中的直接复制安装：
   - 其中任何不是符号链接且与其源代码存在差异的目录，都标记为直接复制漂移。
   - 开发 skill 应使用符号链接，因此忽略符号链接。
5. 返回一份简洁的 Markdown 报告，按市场分组，并包含以下部分：过时、版本不匹配、缺失、孤立项、直接复制漂移。

## 工作流 B：从源码同步 skill 缓存 / 以源码为准同步 skill 缓存

此操作会修改缓存状态。除非用户明确触发了同步，否则继续之前请先向用户确认。

1. 确定目标 marketplace。如果未指定，则使用 `daymade-skills` 和 `daymade-skills-pro`。
2. 对每个 marketplace：
   - 运行 `claude plugin marketplace list`，验证该 marketplace 是否指向预期的本地源码路径。
   - 如果指向其他位置，先运行工作流 D，将其切换到本地源码。
   - 运行 `claude plugin marketplace update <marketplace>`。
3. 运行工作流 A 以获取漂移报告。
4. 对于每个过期或缺失的插件：
   - 确定其安装范围。查看 `~/.claude/plugins/cache/<marketplace>/<plugin>/latest/` 中现有的安装元数据，或从 `~/.claude/plugins/installed_plugins.json` 推断。默认使用其最初安装时的范围；如果无法确定，请询问用户。
   - 对于套件插件，只安装一次套件。不要单独安装各个子 skill。
   - 运行：
     ```
     claude plugin uninstall <plugin>@<marketplace> --scope <scope>
     claude plugin install <plugin>@<marketplace> --scope <scope>
     ```
   - 这会强制缓存从当前本地源码重新获取内容。
5. 对于孤立插件，在其安装时所使用的范围内卸载。如果孤立插件是已知套件迁移后被替代的独立插件，则改用工作流 F；卸载前先验证替代套件。
6. 安装完成后，运行工作流 C 以清理旧版本子目录。
7. 报告已更新的内容、已卸载的内容以及所有失败项。

## 工作流 C：清理 skill 缓存旧版本 / 清理 skill 缓存旧版本

此操作会删除缓存目录。继续之前请先向用户确认。

1. 对 `~/.claude/plugins/cache/<marketplace>/` 下的每个 skill 目录：
   - 列出所有 semver 版本子目录（例如 `1.0.0`、`1.1.0`）。
   - 根据 semver 排序确定最新版本。
   - 删除前，验证最新版本与源码一致（例如重新运行工作流 A，或将最新缓存目录与源码进行比较）。如果不一致，则不要删除旧版本；向用户发出警告并停止。
   - 删除除最新版本之外的所有版本子目录。
2. 报告已移除以及保留的版本。

## 工作流 D：marketplace 切到本地源码 / marketplace 切到本地源码

1. 运行 `claude plugin marketplace list` 查看当前源码。
2. 如果该 marketplace 尚未指向所需的本地路径：
   ```
   claude plugin marketplace remove <marketplace-name>
   claude plugin marketplace add <local-path> --scope user
   ```
3. 使用 `claude plugin marketplace list` 进行验证。
4. 报告新的源码路径。

## 工作流 E：审计松散的 userSettings skill / 清理松散 user skill

当用户询问精简 skill 的来源、通用 skill 为何被加载，或是否应移除松散的 user skill 时使用。此工作流涵盖 `~/.claude/skills`、`~/.codex/skills` 和 `~/.agents/skills` 下的直接目录；插件缓存由工作流 A-D 处理。

1. 使用 `find` 加 `wc -l` 枚举直接技能目录及其行数。不要递归进入无关的代码仓库。
2. 对每个候选项进行分类：
   - **由锁定文件管理** — 存在于 `.skill-lock.json` 或已安装的插件元数据中。不要手动移动；使用官方卸载/同步流程。
   - **源代码支持的副本** — 内容与规范源代码仓库一致。在移除副本之前，优先使用符号链接、市场安装或源代码同步。
   - **松散模板** — 简短的通用提示词，不包含脚本/引用/资源，没有用户特定的方法论，也没有源记录。
   - **松散但有价值** — 包含脚本、引用、凭据流程、特定领域的标准操作流程，或用户特定的方法论。在迁移到源代码仓库之前保留。
   - **过时备份** — 活动目录名称或 frontmatter 显示其为备份/已弃用状态，且已有更新的规范技能。
3. 对每个待停用候选项，在移动之前确认以下三点：
   - 它不在由锁定文件管理的来源中。
   - 它有替代项，或不具备有意义的独特能力。
   - 匹配配置文件的 `retired-skills/<reason>-<date>/` 下不存在同名备份目标。
4. 使用 `mv` 将待停用候选项移出活动技能根目录，并保留完整目录。不要使用 `rm -rf`。
5. 验证：
   - 活动技能根目录不再包含已停用的 frontmatter 名称。
   - 保留的有价值技能仍然存在。
   - 已停用目录包含预期的 `SKILL.md` 文件及其哈希值。
6. 报告保留项、已停用项、备份位置、未解决的漂移，以及当前运行的会话是否仍可能缓存技能列表。

## 工作流 F：套件迁移后协调已安装状态

仅在规范源代码迁移已合并，且用户明确要求更新当前机器的已安装状态之后使用。此工作流使用已声明的迁移映射；它不设计或编辑市场拓扑。源代码迁移本身请使用 `daymade-claude-code:marketplace-dev`。

1. 要求提供从已被取代的独立插件名称到替代套件插件及调用名称的明确映射。如果映射不可用，则停止；不要根据匹配的目录名称推断映射。
2. 读取当前源代码中的 `marketplace.json` 和 `installed_plugins.json`。验证每个替代套件都存在，具有非空的 `skills` 数组，并包含预期的成员路径。
3. 按作用域对已安装的被取代插件进行分组。保留每个原始作用域；不要将项目级安装合并到用户作用域，反之亦然。
4. 运行 `claude plugin marketplace update <marketplace>`。
5. 在每个所需作用域安装一次替代套件。
6. 在移除任何内容之前验证：
   - `claude plugin list` 显示该作用域已启用该套件；
   - 已安装的套件版本与源清单一致；
   - 套件缓存包含每个预期成员的 `SKILL.md`；
   - 新的 `<suite>:<skill>` 调用名称与成员的 frontmatter 名称一致。
7. 仅在替代套件通过第 6 步之后，才在其原始作用域卸载每个被取代的独立插件。
8. 重新运行工作流 A。仅当用户同时确认要清理旧版本缓存时，才运行工作流 C。
9. 报告已安装的套件、已停用的独立插件标识、保留的作用域、剩余的孤立状态，以及用户必须更新的任何调用名称变更。

## 动态发现套件插件

绝不要维护手写的套件清单。每次运行时，都应从当前源清单中推导：

```bash
jq -r '.plugins[] | select(((.skills // []) | length) > 0) | .name' \
  .claude-plugin/marketplace.json
```

将顶层插件条目中 `skills` 数组非空的插件视为一个套件。安装或重新安装该插件一次；除非清单单独注册了其中的成员路径，否则绝不要将其成员路径作为独立插件安装。如果清单缺失或无效，应快速失败，而不是回退到记忆中的套件列表。

## 报告格式

对漂移报告和同步摘要使用以下 Markdown 模板：

```markdown
# 技能治理报告：<Marketplace>

## 漂移摘要
- 过时：N
- 版本不匹配：N
- 缓存中缺失：N
- 缓存中孤立：N
- 直接复制漂移：N

## 过时插件
| 插件 | 缓存版本 | 源版本 | 范围 |
|--------|---------------|----------------|-------|

## 版本不匹配
| 插件 | 缓存版本 | Marketplace 版本 |
|--------|---------------|---------------------|

## 缓存中缺失
| 插件 | 源版本 |
|--------|----------------|

## 缓存中孤立
| 插件 | 缓存版本 |
|--------|---------------|

## ~/.claude/skills/ 中的直接复制漂移
| 技能 | 问题 |
|-------|-------|

## 已采取的操作
- ...

## 失败项
- ...
```

## 故障排除

- **缓存版本不同，但 marketplace 更新没有任何效果** — marketplace 可能仍然指向旧源。先运行 Workflow D。
- **卸载因范围错误而失败** — 重新检查 `installed_plugins.json` 或缓存目录元数据，以确认实际范围。
- **同步后最新缓存目录与源不匹配** — marketplace 可能缓存了元数据。再次运行 `claude plugin marketplace update <marketplace>` 并重新安装。
- **套件子技能被单独报告** — 这是错误的。套件应作为一个整体安装；仅为比较目的捆绑子技能，不要单独安装或卸载。
- **清理后旧版本重新出现** — 过时的 marketplace 源或活动中的 Claude Code 会话可能会重新创建它们。先重新运行 Workflow B，然后运行 Workflow C。