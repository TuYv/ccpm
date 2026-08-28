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
  plugins, duplicate direct-copy skills, untracked user skills, project-local
  `.claude/skills` and `.agents/skills` drift, a marketplace cache that must be
  rebuilt from a local source repo, or a newly merged suite whose installed
  state still exposes the old plugin identities.
---
# Skill 治理

此 skill 可使 Claude Code skill 市场及其缓存与源代码仓库保持一致。源目录是唯一事实来源；缓存是派生副本。当源发生变化时，必须通过官方 `claude plugin` 命令重建缓存，而不是手动复制文件。

## 治理原则

1. **源代码为准** — 本地源代码仓库是规范来源。如果缓存较旧或存在差异，则从源代码重建缓存。
2. **仅使用官方方法** — 使用 `claude plugin marketplace`、`claude plugin update`、`claude plugin uninstall` 和 `claude plugin install`。手动删除缓存或复制文件只能作为清理步骤，不能作为主要安装方法。
3. **保留作用域** — 在插件最初安装时所在的作用域（`user` 或 `project`）重新安装每个插件。
4. **缓存中每个 skill 仅保留一个版本** — 同步后，删除旧的 semver 版本子目录，使缓存中只保留最新版本。
5. **空操作安全** — 漂移检查为只读操作。只有在用户确认或存在明确触发条件后，才会运行同步和清理。
6. **工作区目录不是插件** — 在判断缓存中哪些内容属于插件时，忽略 `*-workspace`、`dist`、`scripts`、`tests`、`references`、`demos` 以及其他非插件目录。
7. **退役松散 skill，而不是销毁它们** — 对于没有 SSOT 的未跟踪 userSettings skill，或已过时的重复 skill，将活动目录移至带日期的 `retired-skills/` 备份中，而不是直接删除。
8. **项目双根目录需要一个所有者** — 当相同的 frontmatter `name` 同时存在于 `.claude/skills` 和 `.agents/skills` 下时，应优先采用一个规范 bundle 加上明确的兼容性路由器（或共享符号链接）。两个存在差异的完整 bundle 都属于漂移，即使它们仍然都能加载。

## 比较源代码与缓存时需要忽略的内容

`.git`、`.in_use`、`.security-scan-passed`、`.skill-regression-reviewed`、`.orphaned_at`、`.DS_Store`、`.gitignore`、`__pycache__`、`.pytest_cache`、`.venv`、`node_modules`、`*.pyc`、`*.pyo`。

同时忽略顶层的非 skill 目录：`*-workspace`、`dist`、`scripts`、`tests`、`references`、`demos`。

## 工作流 A：检查 skill 漂移 / 检查 skill 漂移

这是一份只读报告，不会修改任何内容。

1. 确定要检查的市场。默认使用 `daymade-skills` 和 `daymade-skills-pro`；如果用户指定了市场，则使用用户指定的市场。
2. 对于每个市场，通过读取源目录中的 `.claude-plugin/marketplace.json` 找到其源代码仓库。
3. 对于 `marketplace.json` 中的每个插件条目：
   - 定位源目录（`source` 字段）。
   - 如果该插件是带有 `skills` 数组的套件，则将套件根目录视为所包含子 skill 的源目录。不要单独检查各个子 skill 目录。
   - 在 `~/.claude/plugins/cache/<marketplace>/<plugin>/` 中找到最新的 semver 版本子目录。
   - 比较源目录与该版本目录，同时忽略上述模式。
   - 记录：
     - **过期** — 内容存在差异。
     - **版本不匹配** — `marketplace.json` 版本 != 最新缓存版本。
     - **缓存中缺失** — 源代码中已列出，但不存在缓存子目录。
     - **缓存中的孤立项** — 缓存子目录存在，但插件未列于 `marketplace.json` 中。
4. 检查 `~/.claude/skills/` 中的直接复制安装：
   - 其中任何不是符号链接且与其源代码存在差异的目录，都标记为直接复制漂移。
   - 开发 skill 应使用符号链接，因此忽略符号链接。
5. 当目标是一个可能同时通过 `.claude/skills` 和 `.agents/skills` 暴露 Skills 的项目仓库时，运行此 Skill 的 bundle 目录中随附的确定性审计：

```bash
   uv run --no-project python scripts/audit_project_skill_roots.py <project-root> --json
   ```

   项目根目录是明确指定的；该脚本不会搜索同级项目，也不会修改任一根目录。它根据 frontmatter 中的 `name`（而不是目录 basename）配对直接子级 bundle，并返回：

   - **`canonical_router`（通过）** — 一个完整的 canonical bundle，以及一个单文件 router；其正文第一个非空行必须是准确的标题
     `# Compatibility router — no business rules live here`；该 router 必须仅通过反引号括起来的、相对于项目的路径指向其配对的 canonical `SKILL.md`，告知运行时完整读取该文件，并在该文件不可用时显式失败。
   - **`shared_target`（通过）** — 两个根目录解析到同一个 canonical `SKILL.md`，例如指向 canonical bundle 的符号链接，并且除该共享目标之外，任一侧都不携带额外的 bundle 内容。
   - **`identical_copy`（通过，报告）** — 两个逐字节完全相同的 bundle。这不属于当前漂移，但仍然是重复债务，因为之后任一副本都可能发生分歧。
   - **`drift`（退出码 1）** — 同名 bundle 存在差异，且任一侧都不满足明确的 router 契约。
   - **`invalid`（退出码 2）** — frontmatter identity 格式错误或重复、符号链接损坏、router 无效、声明的根目录中没有可审计的 `SKILL.md` bundle，或者项目路径没有任何声明的根目录。
   - **`single_root`（通过，报告）** — 该名称只存在于一个根目录中。

   不要根据长度较短或类似 router 的行文来推断 router。若没有准确的标记和 fail-closed 指针契约，则将内容差异视为 drift。审计只负责报告；选择 canonical source 并替换完整副本仍需由仓库所有者决定。
6. 返回一份简洁的 markdown 报告，按 marketplace 和项目分组，并包含以下部分：Stale、Version mismatch、Missing、Orphaned、Direct-copy drift 和 Project dual-root drift。

## Workflow B: Sync skills from source / 以源码为准同步 skill 缓存

这会修改缓存状态。除非用户明确触发同步，否则在继续之前先向用户确认。

1. 确定目标 marketplace。如果未指定，则使用 `daymade-skills` 和 `daymade-skills-pro`。
2. 对每个 marketplace：
   - 运行 `claude plugin marketplace list`，验证该 marketplace 是否指向预期的本地 source path。
   - 如果它指向其他位置，则先运行 Workflow D，将其切换到本地 source。
   - 运行 `claude plugin marketplace update <marketplace>`。
3. 运行 Workflow A 获取 drift 报告。
4. 对于每个 stale 或 missing plugin：
   - 确定其安装 scope。查看 `~/.claude/plugins/cache/<marketplace>/<plugin>/latest/` 中现有的安装元数据，或从 `~/.claude/plugins/installed_plugins.json` 推断。默认使用其最初安装时的 scope；如果未知，则询问用户。
   - 对于 suite plugin，只安装一次 suite。不要单独安装各个 sub-skill。
   - 运行：
     ```
     claude plugin uninstall <plugin>@<marketplace> --scope <scope>
     claude plugin install <plugin>@<marketplace> --scope <scope>
     ```
   - 这会强制缓存从当前本地 source 重新获取。
5. 对于 orphaned plugin，在其安装时使用的 scope 下卸载。如果 orphan 是已知 suite migration 中被取代的 standalone plugin，则改用 Workflow F；卸载前验证替代的 suite。
6. 安装完成后，运行 Workflow C 清理旧的版本子目录。
7. 报告已更新的内容、已卸载的内容以及任何失败。

## 工作流 C：清理 skill 缓存旧版本 / 清理 skill 缓存旧版本

此操作会删除缓存目录。继续之前请先向用户确认。

1. 对于 `~/.claude/plugins/cache/<marketplace>/` 下的每个 skill 目录：
   - 列出所有 semver 版本子目录（例如 `1.0.0`、`1.1.0`）。
   - 按 semver 排序确定最新版本。
   - 删除前，验证最新版本与源一致（例如重新运行工作流 A，或将最新缓存目录与源进行比较）。如果不一致，不要删除旧版本；警告用户并停止操作。
   - 删除除最新版本之外的每个版本子目录。
2. 报告已删除和保留的版本。

## 工作流 D：将 marketplace 切换到本地源码 / marketplace 切到本地源码

1. 运行 `claude plugin marketplace list` 查看当前源。
2. 如果 marketplace 尚未指向所需的本地路径：
   ```
   claude plugin marketplace remove <marketplace-name>
   claude plugin marketplace add <local-path> --scope user
   ```
3. 使用 `claude plugin marketplace list` 进行验证。
4. 报告新的源路径。

## 工作流 E：审计松散的 userSettings skill / 清理松散 user skill

当用户询问精简 skill 的来源、通用 skill 为什么会被加载，或是否应删除松散的用户 skill 时使用。此工作流涵盖 `~/.claude/skills`、`~/.codex/skills` 和 `~/.agents/skills` 下的直接目录；插件缓存由工作流 A-D 处理。

1. 使用 `find` 加 `wc -l` 枚举直接 skill 目录并统计行数。不要递归进入无关仓库。
2. 对每个候选项进行分类：
   - **锁管理** — 存在于 `.skill-lock.json` 或已安装的插件元数据中。不要手动移动；使用官方卸载/同步流程。
   - **源代码支持的副本** — 内容与规范源代码仓库一致。在删除副本之前，优先使用符号链接、marketplace 安装或源代码同步。
   - **松散模板** — 简短的通用提示词，不包含脚本/参考资料/资源，不包含用户特定的方法论，也没有源记录。
   - **松散但有价值** — 包含脚本、参考资料、凭据流程、特定领域的 SOP 或用户特定的方法论。在迁移到源代码仓库之前保留。
   - **过时备份** — 活动目录名称或 frontmatter 表明其为备份/已弃用状态，且存在更新的规范 skill。
3. 对于每个准备退役的候选项，在移动之前验证以下三点：
   - 它不属于锁管理的源。
   - 它有替代项，或不具备有意义的独特能力。
   - 匹配配置文件下的 `retired-skills/<reason>-<date>/` 中不存在相同的备份目标。
4. 使用 `mv` 将准备退役的候选项移出活动 skill 根目录，并保留完整目录。不要使用 `rm -rf`。
5. 验证：
   - 活动 skill 根目录中不再包含已退役的 frontmatter 名称。
   - 保留的有价值 skill 仍然存在。
   - 已退役目录包含预期的 `SKILL.md` 文件及其哈希值。
6. 报告保留项、已退役项、备份位置、未解决的漂移，以及当前运行中的会话是否仍可能持有缓存的 skill 列表。

## 工作流 F：套件迁移后协调已安装状态

仅在规范源迁移已合并，且用户明确要求更新当前机器的已安装状态后使用。此工作流使用已声明的迁移映射；它不会设计或编辑市场拓扑。源迁移本身请使用
`daymade-claude-code:marketplace-dev`。

1. 要求提供已被取代的独立插件名称到替代套件插件及调用名称的明确映射。如果映射不可用，则停止；不要根据匹配的目录名称推断映射。
2. 读取当前源 `marketplace.json` 和 `installed_plugins.json`。验证每个替代套件都存在，具有非空的 `skills` 数组，并且包含预期的成员路径。
3. 按作用域对已安装的被取代插件进行分组。保留每个原始作用域；不要将项目级安装合并到用户作用域，反之亦然。
4. 运行 `claude plugin marketplace update <marketplace>`。
5. 在每个所需作用域安装一次替代套件。
6. 在移除任何内容之前进行验证：
   - `claude plugin list` 显示该套件已在该作用域启用；
   - 已安装的套件版本与源清单匹配；
   - 套件缓存包含每个预期成员的 `SKILL.md`；
   - 新的 `<suite>:<skill>` 调用名称与成员的 frontmatter 名称匹配。
7. 仅在替代套件通过第 6 步后，才在其原始作用域卸载每个被取代的独立插件。
8. 重新运行工作流 A。仅当用户同时确认要清理旧版本缓存时，才运行工作流 C。
9. 报告已安装的套件、已退役的独立插件标识、保留的作用域、剩余的孤立状态，以及用户必须更新的任何调用变更。

## 动态发现套件插件

绝不要维护手写的套件清单。每次运行时都从当前源清单中推导：

```bash
jq -r '.plugins[] | select(((.skills // []) | length) > 0) | .name' \
  .claude-plugin/marketplace.json
```

将顶层插件条目中包含非空 `skills` 数组的插件视为套件。安装或重新安装该插件一次；除非清单单独注册了其成员路径，否则绝不要将成员路径作为独立插件安装。如果清单缺失或无效，则快速失败，而不是回退到记忆中的套件列表。

## 报告格式

对漂移报告和同步摘要使用以下 Markdown 模板：

```markdown
# Skill Governance Report: <Marketplace>

## Drift Summary
- Stale: N
- Version mismatch: N
- Missing from cache: N
- Orphaned in cache: N
- Direct-copy drift: N

## Stale Plugins
| Plugin | Cache Version | Source Version | Scope |
|--------|---------------|----------------|-------|

## Version Mismatch
| Plugin | Cache Version | Marketplace Version |
|--------|---------------|---------------------|

## Missing from Cache
| Plugin | Source Version |
|--------|----------------|

## Orphaned in Cache
| Plugin | Cache Version |
|--------|---------------|

## Direct-Copy Drift in ~/.claude/skills/
| Skill | Issue |
|-------|-------|

## Actions Taken
- ...

## Failures
- ...
```

## 故障排除

- **缓存版本不同，但市场更新没有任何效果** — 市场可能仍然指向旧的源。先运行工作流 D。
- **由于作用域错误而卸载失败** — 重新检查 `installed_plugins.json` 或缓存目录元数据，以确认实际作用域。
- **同步后最新缓存目录与源不匹配** — 市场可能缓存了元数据。再次运行 `claude plugin marketplace update <marketplace>`，然后重新安装。
- **套件子技能被单独报告** — 这是一个错误。套件应作为一个整体安装；仅为进行比较而捆绑子技能，不要将其用于安装/卸载。
- **清理后旧版本再次出现** — 过时的市场源或活动中的 Claude Code 会话可能会重新创建它们。先重新运行工作流 B，然后运行工作流 C。