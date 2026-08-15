---
name: skill-governance
description: >-
  Enforce source-of-truth discipline for Claude Code skill marketplaces, caches, and loose userSettings skills. Use whenever the user says "check skill drift", "检查 skill 漂移", "sync skills from source", "以源码为准同步 skill 缓存", "clean old skill cache versions", "清理 skill 缓存旧版本", "switch marketplace to local source", "marketplace 切到本地源码", "thin skills", "薄 skill", "loose skills", "清理 user skills", or talks about skill caches being stale, version mismatches, orphaned plugins, duplicate direct-copy skills, untracked user skills, or rebuilding the marketplace cache from a local source repo.
---
# Skill 治理

此 skill 用于使 Claude Code skill 市场及其缓存与源代码仓库保持一致。源目录是唯一事实来源；缓存是派生副本。当源目录发生变化时，必须通过官方 `claude plugin` 命令重建缓存，而不能手动复制文件。

## 治理原则

1. **源目录是事实来源** — 本地源代码仓库是规范来源。如果缓存较旧或存在差异，请根据源目录重建缓存。
2. **仅使用官方方法** — 使用 `claude plugin marketplace`、`claude plugin update`、`claude plugin uninstall` 和 `claude plugin install`。手动删除缓存或复制文件只能作为清理步骤，绝不能作为主要安装方法。
3. **保留作用域** — 在每个插件最初安装的作用域（`user` 或 `project`）中重新安装该插件。
4. **缓存中每个 skill 仅保留一个版本** — 同步后，删除旧的 semver 版本子目录，确保只保留最新版本。
5. **无操作安全性** — 漂移检查是只读的。只有在用户确认或明确触发后，才执行同步和清理。
6. **工作区目录不是插件** — 在判断哪些内容应纳入缓存时，忽略 `*-workspace`、`dist`、`scripts`、`tests`、`references`、`demos` 以及其他非插件目录。
7. **停用零散 skill，而不是将其销毁** — 对于没有 SSOT 或属于过时重复项的未跟踪 userSettings skill，将活动目录移动到带日期的 `retired-skills/` 备份中，而不是直接删除。

## 比较源目录和缓存时应忽略的内容

`.git`、`.in_use`、`.security-scan-passed`、`.orphaned_at`、`.DS_Store`、`.gitignore`、`__pycache__`、`.pytest_cache`、`.venv`、`node_modules`、`*.pyc`、`*.pyo`。

同时忽略不是 skill 的顶层目录：`*-workspace`、`dist`、`scripts`、`tests`、`references`、`demos`。

## 工作流 A：检查 skill 漂移 / 检查 skill 漂移

这是一份只读报告，不会修改任何内容。

1. 确定要检查的市场。默认为 `daymade-skills` 和 `daymade-skills-pro`；如果用户指定了某个市场，则使用用户指定的市场。
2. 对于每个市场，通过读取源目录中的 `.claude-plugin/marketplace.json` 找到其源代码仓库。
3. 对于 `marketplace.json` 中的每个插件条目：
   - 找到源目录（`source` 字段）。
   - 如果插件是包含 `skills` 数组的套件，则将套件根目录视为所捆绑子 skill 的源目录。不要单独检查各个子 skill 目录。
   - 在 `~/.claude/plugins/cache/<marketplace>/<plugin>/` 中找到最新的 semver 版本子目录。
   - 比较源目录和该版本目录，并忽略上述模式。
   - 记录：
     - **已过期** — 内容存在差异。
     - **版本不匹配** — `marketplace.json` 中的版本 != 最新缓存版本。
     - **缓存中缺失** — 已在源目录中列出，但不存在缓存子目录。
     - **缓存中存在孤立项** — 缓存子目录存在，但插件不在 `marketplace.json` 中。
4. 检查 `~/.claude/skills/` 中的直接复制安装：
   - 其中任何不是符号链接且与其源目录存在差异的目录，都标记为直接复制漂移。
   - 对于开发中的 skill，符号链接是预期行为，应予以忽略。
5. 返回一份按市场分组的简洁 Markdown 报告，其中包含以下部分：已过期、版本不匹配、缺失、孤立项、直接复制漂移。

## 工作流 B：从源码同步 skill / 以源码为准同步 skill 缓存

此操作会修改缓存状态。除非用户明确触发了同步，否则在继续之前应先征得用户确认。

1. 确定目标 marketplace。如果未指定，则同时使用 `daymade-skills` 和 `daymade-skills-pro`。
2. 对于每个 marketplace：
   - 运行 `claude plugin marketplace list`，验证该 marketplace 是否指向预期的本地源码路径。
   - 如果它指向其他位置，请先运行工作流 D，将其切换到本地源码。
   - 运行 `claude plugin marketplace update <marketplace>`。
3. 运行工作流 A 以获取差异报告。
4. 对于每个过期或缺失的 plugin：
   - 确定其安装 scope。查看 `~/.claude/plugins/cache/<marketplace>/<plugin>/latest/` 中的现有安装元数据，或根据 `~/.claude/plugins/installed_plugins.json` 进行推断。默认使用最初安装时的 scope；如果无法确定，请询问用户。
   - 对于套件 plugin，只安装一次该套件。不要单独安装各个子 skill。
   - 运行：
     ```
     claude plugin uninstall <plugin>@<marketplace> --scope <scope>
     claude plugin install <plugin>@<marketplace> --scope <scope>
     ```
   - 这会强制缓存从当前本地源码重新获取内容。
5. 对于孤立的 plugin，按其安装时使用的 scope 将其卸载。
6. 安装完成后，运行工作流 C，清理旧版本子目录。
7. 报告更新了哪些内容、卸载了哪些内容，以及所有失败情况。

## 工作流 C：清理旧 skill 缓存版本 / 清理 skill 缓存旧版本

此操作会删除缓存目录。继续之前应先征得用户确认。

1. 对于 `~/.claude/plugins/cache/<marketplace>/` 下的每个 skill 目录：
   - 列出所有 semver 版本子目录（例如 `1.0.0`、`1.1.0`）。
   - 按 semver 排序确定最新版本。
   - 删除之前，验证最新版本是否与源码匹配（例如，重新运行工作流 A，或将最新缓存目录与源码进行比较）。如果不匹配，不要删除旧版本；警告用户并停止。
   - 删除除最新版本之外的所有版本子目录。
2. 报告移除了哪些版本，以及保留了哪些版本。

## 工作流 D：将 marketplace 切换到本地源码 / marketplace 切到本地源码

1. 运行 `claude plugin marketplace list` 查看当前源码。
2. 如果 marketplace 尚未指向所需的本地路径：
   ```
   claude plugin marketplace remove <marketplace-name>
   claude plugin marketplace add <local-path> --scope user
   ```
3. 使用 `claude plugin marketplace list` 进行验证。
4. 报告新的源码路径。

## 工作流 E：审计松散的 userSettings skill / 清理松散 user skill

当用户询问精简 skill 来自何处、为什么加载了通用 skill，或是否应移除松散的 user skill 时使用。此工作流涵盖 `~/.claude/skills`、`~/.codex/skills` 和 `~/.agents/skills` 下的直接目录；plugin 缓存由工作流 A-D 处理。

1. 使用 `find` 配合 `wc -l` 枚举直接 skill 目录及其行数。不要递归进入无关的 repo。
2. 对每个候选项进行分类：
   - **由锁管理** — 存在于 `.skill-lock.json` 或已安装 plugin 的元数据中。不要手动移动它；应使用官方卸载/同步流程。
   - **有源码支撑的副本** — 内容与规范源码 repo 匹配。移除副本之前，优先使用符号链接、marketplace 安装或源码同步。
   - **松散模板** — 简短的通用 prompt，不包含脚本/参考资料/资源，不包含用户特定的方法论，也没有源码记录。
   - **松散但有价值** — 包含脚本、参考资料、凭据流程、领域特定 SOP 或用户特定的方法论。在将其迁移到源码 repo 之前予以保留。
   - **过时备份** — 活动目录名称或 frontmatter 表明其处于备份/弃用状态，并且存在更新的规范 skill。
3. 对于每个待退役候选项，在移动前验证以下三点：
   - 它不存在于由锁管理的来源中。
   - 它已有替代项，或不具备有意义的独特能力。
   - 对应 profile 的 `retired-skills/<reason>-<date>/` 下尚不存在备份目标位置。
4. 使用 `mv` 将待退役候选项移出活动 skill 根目录，并保留完整目录。不要使用 `rm -rf`。
5. 验证：
   - 活动 skill 根目录不再包含已退役的 frontmatter 名称。
   - 保留的有价值 skill 仍然存在。
   - 已退役目录包含预期的 `SKILL.md` 文件和哈希值。
6. 报告保留项、退役项、备份位置、未解决的差异，以及当前运行中的 session 是否可能仍缓存着 skill 列表。

## 套件插件

以下套件捆绑了多个子技能。只需安装或重新安装一次套件；切勿尝试单独安装其中的各个子技能：

- `daymade-audio`
- `daymade-claude-code`
- `daymade-docs`
- `daymade-financial`
- `daymade-skill`

## 报告格式

漂移报告和同步摘要请使用以下 Markdown 模板：

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

- **缓存版本不同，但市场更新未产生任何效果** — 市场可能仍指向旧源。请先运行工作流 D。
- **因作用域错误导致卸载失败** — 重新检查 `installed_plugins.json` 或缓存目录元数据，以确定实际作用域。
- **同步后最新缓存目录与源不匹配** — 市场可能缓存了元数据。请再次运行 `claude plugin marketplace update <marketplace>` 并重新安装。
- **套件子技能被单独报告** — 这是错误的做法。套件应作为一个整体安装；仅在比较时整理套件中的子技能，不要单独安装/卸载。
- **清理后旧版本再次出现** — 过期的市场源或活跃的 Claude Code 会话可能会重新创建它们。请先重新运行工作流 B，然后运行工作流 C。