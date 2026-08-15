---
name: claude-migrate-memory-to-doc
description: >-
  Migrates Claude Code personal memory (the per-project memory/ directory) into
  tool-agnostic reference docs, so other AI CLIs that auto-load AGENTS.md (Codex
  primarily; the content architecture transfers to Cursor and others) working in
  the same directory can read the same user profile, collaboration preferences,
  and methodology instead of being blind to them. Use this whenever the user says
  things like "migrate my memory", "my memory is locked to Claude Code", "make
  Codex/Cursor read my profile", "memory should live in docs not one tool", or
  reports that a second AI tool doesn't know who they are; also use it when memory
  has grown bloated with content that should be shared across tools or projects.
  Covers diagnosis, the references/ + CLAUDE.md-inline + AGENTS.md-symlink
  architecture, multi-agent review, empirical codex verification, and memory
  cleanup. Inline only — it orchestrates review subagents and runs codex.
---
# 将 Claude Code 记忆迁移到工具无关的文档

## 此技能为何存在

Claude Code 的个人记忆位于 `~/.claude/projects/<project-slug>/memory/`。它被**锁定在 Claude Code 中**：不会随代码仓库纳入版本控制，其他所有工具也都无法看到它。一旦用户在同一目录中运行 Codex、Cursor 或任何其他 AI CLI，这些工具就无法读取“用户是谁／应如何与其协作”——尽管用户画像和协作偏好恰恰是*任何* AI 助手都应该首先读取的内容。

此技能会将**可跨工具共享的**内容从记忆中移出，放入与工具无关的位置，并让记忆仅作为轻量级的交接缓存。它真正解决的问题是**工具锁定**，而不是“记忆混乱”。

此技能**以内联方式**运行（绝不使用 `context: fork`）：它会生成并行审查子代理，并通过 Bash 运行 `codex`——分叉的子代理无法执行这两项操作。

## 核心洞见——执行任何操作前请先阅读

困难之处不在于移动文件，而在于：

> **仅通过纯文本指针访问的参考文件会按需读取，并且无法保证一定会加载——在*任何一个*工具中都是如此。**

- **Claude Code** 只有通过 `@import` 语法才会自动预加载参考文件。纯文本指针（“参见 `~/.claude/references/user/foo.md`”）是按需处理的：代理必须自行选择是否打开它。
- **Codex** 更为严格：它**不会解析或跟随** CLAUDE.md 中写入的文本路径。它只会沿 `~/.codex → git-root → cwd` 链自动注入文档*文件本身*（即它的 `AGENTS.md`／配置的回退文件）。位于 `~/.claude/references/` 中、使用其他任何名称的参考文件，Codex **绝不会自动加载**。

因此，该架构必须采用**双层拆分**：

| 层 | 位置 | 保证 |
|---|---|---|
| **保证命中**——每轮都必须成立的少数事实 | 内联到 **CLAUDE.md 正文**中（两个工具都会注入它） | 始终存在 |
| **按需详情**——完整画像、经验教训、边缘情况 | `references/` 文件，通过指针访问 | 在相关时加载 |

将关键事实*仅仅*放在参考文件中并信任指针，是导致此次迁移悄无声息地失败的首要原因。请将它们内联。

## 工具无关的架构

```
~/.claude/CLAUDE.md            global instructions — BOTH tools inject this.
                               Inline the hardest user facts here (a short "User context" section).
~/.claude/references/user/     SSOT for profile / preferences / methodology / personal affairs.
~/.claude/references/user-profile.md   hub: condensed core + index into the user/ files
~/.codex/AGENTS.md  ──symlink──▶  ~/.claude/CLAUDE.md
                               so Codex's GLOBAL layer injects the same file Claude Code reads.
~/.codex/config.toml           raise project_doc_max_bytes — Codex truncates docs at 32 KiB by default,
                               which silently drops the back half of a long CLAUDE.md.
```

> **范围说明**：连接配置（`~/.codex/` 符号链接、配置编辑和阶段 5 验证）是 **Codex 专用的**，且仅针对 Codex 完成了验证（2026-06）。`~/.claude/references/user/` 内容层可以迁移到任何会自动加载项目文档的工具，但 Cursor 和其他工具需要各自的连接配置（Cursor 读取 `.cursor/rules`／项目根目录中的 `AGENTS.md`，而不是 `~/.codex/`）——此处尚未实现或验证。

## 工作流程

将此检查清单复制到你的工作笔记中，并逐项勾选：

```
Memory → Tool-Agnostic Doc Migration:
- [ ] Phase 1: Diagnose & scope — classify every memory file by SCOPE
- [ ] Phase 2: Tool-agnostic migration — references/ + inline hardcore + symlink + config
- [ ] Phase 3: Multi-agent review — 4 parallel reviewers
- [ ] Phase 4: Fix everything review surfaced
- [ ] Phase 5: VERIFY BY RUNNING CODEX (not by reasoning)
- [ ] Phase 6: Memory cleanup — clean / thin / keep + soft-delete to backup
```

### 阶段 1 — 诊断并确定范围

**预检 — 找到 memory 目录。** Claude Code memory 位于 `~/.claude/projects/<project-slug>/memory/`，其中 `<project-slug>` 是将工作目录路径中的 `/` 替换为 `-` 后得到的值。用户可能在多个项目中都有 memory——使用 `ls ~/.claude/projects/*/memory/` 列出它们，并选择（或合并）其中包含跨工具用户内容的项目所对应的 memory。

列出该 memory 目录下的每个文件。按**范围**对每个文件进行分类，而不是按“它是否混乱”分类。有关完整的决策表，以及智能体无法判断私有上下文时的注意事项，请阅读 **[references/diagnosis_and_scoping.md](references/diagnosis_and_scoping.md)**。

简要版本如下：

- **团队规则 / 标准 / SOP** → 项目 `CLAUDE.md` 或 `docs/`（受版本控制、团队可见）。
- **跨工具用户画像 / 协作偏好 / 方法论 / 个人事务** → `~/.claude/references/user/`（与工具无关）。**这是需要迁移的类别。**
- **临时交接快照 / 外部系统指针** → **保留在 memory 中**。这是 memory 的合理用途；不要迁移它们。

不要迁移所有内容。将交接状态过度迁移到长期文档中，本身也是一种错误。**但务必查看整个目录**——不要只看 `feedback_*.md`——因为项目 SOP 和实际运维经验通常位于 `project_*.md` 或 `architecture_*.md` 文件中，而它们应当归入仓库的文档。

在此阶段还要标记**私有上下文 / PII**：如果某个 memory 文件将系统用户名映射到真实姓名，或包含私人联系方式及其他个人身份信息，那么即使它与项目相关，也应当**保留在私有 memory 中**。项目文档受版本控制且可能被共享；身份映射信息应归入精简的交接层。

### 阶段 2 — 与工具无关的迁移

**先为 CLAUDE.md 创建快照**（`cp ~/.claude/CLAUDE.md ~/.claude/CLAUDE.md.bak`）——你马上要编辑它。如果 `~/.claude/CLAUDE.md` 不存在，请创建该文件（有些用户只有项目级文件）。

**如果 `command -v codex` 没有输出**（未安装 Codex）：仅执行下面的步骤 1 和 4（`references/` 和内联 CLAUDE.md 工作），并**跳过**符号链接（2）、配置（3）以及整个阶段 5。内容迁移仍然有效；留下一条说明，指出之后接入 Codex 时需要添加符号链接和 `project_doc_max_bytes`。

对于每个“需要迁移”的条目，将其内容移入 `~/.claude/references/user/`（按主题归并为少量文件，并建立一个 `user-profile.md` 中心文件）。然后接入双层架构：

1. 将**硬核信息内联**到 `~/.claude/CLAUDE.md` 靠近**顶部**的 `# User context` 部分中（位于前约 32 KiB 内，以便 Codex 能看到）：即每轮都必须成立的 3–6 项事实（例如如何称呼用户、强偏好，以及最重要的单一身份事实）。其他所有内容仍保留为指针。
2. 创建**符号链接** `~/.codex/AGENTS.md → ~/.claude/CLAUDE.md`（仅当 `~/.codex/AGENTS.md` 不存在或只是空占位文件时——绝不要覆盖真实文件）。
3. 如果 CLAUDE.md 超过 32 KiB，请提高 `~/.codex/config.toml` 中的 `project_doc_max_bytes`。
4. **更新项目的知识存储规则**（如果存在），使“用户偏好 → memory”不再与新的“用户画像 → `~/.claude/references/user/`”实际情况相矛盾。

确切的目录布局、中心辐射模式和治理规则修复方式：**[references/tool_agnostic_migration.md](references/tool_agnostic_migration.md)**。

### 阶段 3 — 多智能体审查

并行启动 4 个审查子智能体（一条消息，多个 Task 调用）。每个智能体审查一个维度：**内容完整性**（是否有任何事实被遗漏或改动）、**交叉引用损坏**（如果删除 memory，哪些 `[[links]]` 会成为悬空链接）、**工具无关的链接完整性**（符号链接/指针链是否确实能解析；Codex 是否真的会读取它）、**重复/漂移**（某个参考文件是否重复了 CLAUDE.md 中的规则）。确切的提示词：**[references/review_and_verification.md](references/review_and_verification.md)**。

智能体的发现是假设，而不是定论——采取行动前先进行筛选（概率 × 成本 × 是否确实会发生）。

### 阶段 4 — 修复

处理审查发现的问题。常见的真实问题（全部来自一次实际运行）：中心文件忘记索引自己的某个子文件；硬核事实只保留在参考文件中（将其移至内联位置）；保留文件中的 `[[links]]` 指向即将删除的 memory（将其重新指向新的参考文件）；治理表格中的某一行已更新，但同一部分中的判断语句仍与之矛盾。

### 阶段 5 — 通过运行 CODEX 进行验证（不要跳过，也不要交给用户）

你很可能会忍不住用“看起来没问题”或“你之后可以自行检查”来替代这一步。不要这样做。**从任意目录使用 `--skip-git-repo-check` 运行 codex，通过 session id（而不是 mtime）匹配其会话日志，并 grep 你内联的硬核信息部分以及文件后部的一个字符串。** 内联部分的标题可能是 `# User context`、`# 用户上下文`，或用户所使用的其他本地化形式——grep 时应使用*实际的*标题字符串，而不是硬编码的英文标题。验证通过时，该标题的 grep 结果为 `1`，文件后半部分字符串的 grep 结果也为 `1`（如果 CLAUDE.md > 32 KiB）。经过实证验证的确切命令块——包括 `--skip-git-repo-check`、session-id 提取（它位于头部，而不是尾部）、32 KiB 检查，以及 `< 32 KiB` 和 `codex-not-installed` 的快捷处理方式与预期控制台输出——位于 **[references/review_and_verification.md](references/review_and_verification.md)** 中。请逐字使用；不要在此自行编写变体（这正是两个副本产生漂移的原因）。

### 阶段 6 — 内存清理

对于未迁移的内存文件，请采取以下三种处理方式之一（决策细节见 **[references/diagnosis_and_scoping.md](references/diagnosis_and_scoping.md)**）：

- **清理** — 已过期（日期已过的交接事项）或已陈旧（本应动态计算而非存储的派生计数）→ 归档。
- **精简** — 某个交接文件重复陈述了其他位置的 SSOT → 删除重复内容，仅保留指针和易变状态（例如“实例 X 仍在计费，请将其关闭”）。
- **保留** — 合法的交接文件 / 已经是清晰的指针 → 保持原样。

更新内存索引（例如 `MEMORY.md`），移除已迁移的条目，并添加一个迁移指针。

**在移动任何内容之前，先在整个内存目录以及项目文档 / CLAUDE.md 中 grep 搜索对即将归档文件的引用。** 如果仍然保留的文件或活跃文档链接到了已归档文件，就会产生悬空引用。请将这些链接重新指向新的文档位置或纯文本指针。内存交叉链接并不是唯一的风险——项目 `CLAUDE.md` 和交接文档也经常按名称引用内存文件。

**只做软删除，绝不要直接 `rm`。** 将已迁移/清理的文件移动到 `memory/` **之外**带日期的备份目录中（例如同级目录 `~/.claude/projects/<slug>/.memory-archive-2026-07-06/`——使用**实际当前日期**，不要使用占位日期）。将归档放在 `memory/` 内会使其仍可作为活跃内存被读取，从而使清理失去意义。更新索引指针，使其指向新的内存目录外路径。告知用户，在用几周时间确认两个工具均运行正常后，可以对该备份执行 `rm`。

**如果某次迁移让你学到了新内容，请在迁移后更新此 skill。** 如果遇到了 `references/failure_cases.md` 中未列出的失败模式，请将其追加进去；如果某个步骤的说明不够明确，请完善 SKILL.md 检查清单。一个不将自身经验教训反馈回去的 skill，会反复犯下同样的错误。

## 禁止事项（每一项都是在实际运行中犯错后总结出的教训）

- **不要一上来就想到“删除”。** 人们的本能是删除混乱的内存。正确顺序不是这样：首先分类为迁移 / 精简 / 保留。大多数“混乱”的内存要么包含可迁移的价值，要么是合法的交接内容——删除会使这些价值丢失。
- **不要假设“引用 + 指针”就等于工具无关。** 指针在两个工具中都需要按需读取。核心事实必须内联到 CLAUDE.md 正文中，否则它们会悄无声息地无法加载。
- **不要相信 Codex 会跟随文本指针。** 它读取的是 AGENTS.md/CLAUDE.md 文件本身，而不是文件中写出的路径。这一点已通过官方文档和真实会话日志验证。
- **不要忘记 Codex 的 32 KiB 文档截断限制。** 除非提高 `project_doc_max_bytes`，否则过长的 CLAUDE.md 在 Codex 中会丢失后半部分。用户可能几个月来一直在不知情的情况下只使用了半份 CLAUDE.md。
- **不要修改治理表格中的某一行，却让同一章节中的判断逻辑继续与之矛盾。** 编辑某项事实后，请 grep 搜索整个章节。
- **在 grep 搜索指向某个内存文件的 `[[cross-references]]` 之前，不要删除该文件。** 如果保留下来的文件指向已删除文件，就会产生悬空链接。
- **当内容取决于用户的私有上下文时，不要让代理批量决定删除或保留哪些内容。** 代理不了解“用户实际重视什么”；请列出候选项，让用户（或掌握完整上下文的你）做出决定。
- **不要让用户负责验证。** 运行 codex 并 grep 搜索日志是代理能够完成的工作——请自行负责整个验证闭环，不要把它交还给用户。
- **不要将“符号链接存在”当作 Codex 验证结果。** 正确的符号链接是必要条件，但并不充分；唯一的证明是一次真实的 `codex exec` 会话，且其 rollout 日志中包含你内联的核心内容章节。
- **不要将归档放在 `memory/` 内。** 放在那里后，它仍可作为活跃内存被读取，从而使清理失去意义。请将其移动到 `memory/` 之外的同级目录。
- **不要将真实姓名身份映射或 PII 迁移到项目文档中。** 项目文档受版本控制并会被共享。如果某个内存文件包含 `user3 → 慧如` 这样的映射，请将其保留在私有内存中（如果 SSOT 位于其他位置，则将其精简为指针）——不要将其移动到 `docs/`。
- **在进行 diff 比较之前，不要用内存中的重复文件覆盖现有文档。** 许多内存文件只是文档的*部分*重复内容（例如 `architecture_v2_decision.md` 与 `docs/decisions/2026-02-21-v2-architecture.md`）。只迁移其中的**独有**细节；将这些内容追加到现有文档中，而不是替换现有文档。
- **不要忘记重新指向项目文档中的链接，而不只是内存中的链接。** `CLAUDE.md` 和交接文档经常按 basename 引用内存文件。请在归档前对它们进行 grep 搜索。

## 失败案例（完整的踩坑实录）

“禁止事项”背后的原因，以及每次实际出现的问题：**[references/failure_cases.md](references/failure_cases.md)**。