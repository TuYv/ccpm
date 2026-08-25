---
name: marketplace-dev
description: >-
  Creates and maintains Claude Code plugin marketplaces, consolidates standalone
  skills into a new or existing suite, and moves skills between suites. Converts any
  Claude Code skills repository into an official plugin marketplace, generates
  spec-conforming .claude-plugin/marketplace.json, validates with `claude plugin
  validate`, tests real installation and cache boundaries, and PRs the upstream repo,
  encoding hard-won schema/version/description anti-patterns. Use when the user
  mentions marketplace, plugin support, one-click install, marketplace.json, plugin
  distribution, auto-update, suite-only migration, "put these skills in a suite",
  "move this skill into daymade-*", or wants a skills repo installable via `claude
  plugin install`.
argument-hint: "[repo-path]"
---
# marketplace-dev

将 Claude Code skills 仓库转换为官方插件 marketplace，以便用户可以通过 `claude plugin marketplace add` 安装 skills 并获取自动更新。

**输入**：包含 `skills/` 目录（其中包含 SKILL.md 文件）的仓库。  
**输出**：`.claude-plugin/marketplace.json` + 已验证 + 已完成安装测试 + 可直接创建 PR。

## 编辑前先确定任务路径

| 用户意图 | 路径 |
|---|---|
| 为尚未支持 marketplace 的仓库创建 marketplace 支持 | 遵循下面的阶段 0–4 |
| 添加或更新普通插件条目 | 遵循“维护现有 marketplace”，然后执行阶段 3 |
| 将独立 skill 合并为套件、基于现有 skill 创建套件、在套件之间移动 skill，或在移动 skill 的同时重命名 skill | 完整阅读 [references/suite_consolidation_workflow.md](references/suite_consolidation_workflow.md)，并遵循其中的流程，而不是通用的阶段 4 约束 |
| 在套件迁移合并后协调已安装的缓存 | 调用 `daymade-skill:skill-governance` 并使用其迁移后流程；不要在此处修改缓存状态 |
| 对整个仓库进行涵盖代码、文档、安全性、PR、issue 和清单完整性的审计 | 仅当用户请求全面健康检查时调用 `marketplace-health-check:marketplace-health-check`；针对性套件迁移不以此为前置条件 |

## 阶段 0：证据收集

在编辑现有 marketplace 之前，先收集证据，不要依赖默认模板：

1. 阅读当前的 `.claude-plugin/marketplace.json`。
2. 阅读此仓库的 marketplace 规则（`CLAUDE.md`、README 安装部分、变更日志）。
3. 阅读 marketplace/plugin 路径语义的官方文档。
4. 将当前对话作为证据。仅当用户明确要求或批准使用该私有来源时，才查阅更早的本地 Claude Code 会话。

当该历史来源获得批准后，每个项目的会话位于：
`~/.claude/projects/<escaped-cwd>/`：
- 顶层文件：`<session-id>.jsonl`
- 子代理记录：`<session-id>/subagents/agent-*.jsonl`

有用的搜索模式（根据你正在调试的故障调整关键词）：

```bash
grep -lc "marketplace.json\|claude plugin validate\|claude plugin install" \
  ~/.claude/projects/<escaped-cwd>/*.jsonl
grep -lc "Unrecognized key\|Plugin not found\|No manifest found\|Duplicate plugin" \
  ~/.claude/projects/<escaped-cwd>/*.jsonl \
  ~/.claude/projects/<escaped-cwd>/*/subagents/*.jsonl
```

将经验提炼为有证据支持的规则：尝试执行的命令、观察到的输出、根本原因、最终可用的命令/配置。不要将凭记忆得出的猜测编码进去。

## 阶段 1：分析目标仓库

### 步骤 1：发现所有 skill

```bash
# Find every SKILL.md
find <repo-path>/skills -name "SKILL.md" -type f 2>/dev/null
```

对于每个 skill，从 SKILL.md frontmatter 中提取：
- `name` — skill 标识符
- `description` — 原始文本，不要重写或翻译

### 步骤 2：读取仓库元数据

- `VERSION` 文件（如果存在）——这将成为 `metadata.version`
- `README.md` ——了解项目、作者信息、分类
- `LICENSE` ——记录许可证类型
- Git remotes ——识别上游仓库与 fork（`git remote -v`）

### 第 3 步：确定分类

按功能对技能进行分组。分类是自由格式的字符串。以下是一些好的模式：
- `business-diagnostics`、`content-creation`、`thinking-tools`、`utilities`
- `developer-tools`、`productivity`、`documentation`、`security`

如果分组存在歧义，请让用户确认分类。

### 第 4 步：选择插件边界

Claude Code 有三个不同的层级：

```text
marketplace -> plugin -> skill
```

- Marketplace 名称用于安装标识：`plugin@marketplace`。
- Plugin 名称是斜杠命名空间：`/plugin-name:skill-name`。
- Skill 名称来自 `SKILL.md` frontmatter，前提是技能路径直接指向包含 `SKILL.md` 的目录。

根据安装、更新和缓存意图选择每个插件的边界：

- **单技能插件**：当技能需要独立安装、更新和回滚，并使用范围较窄的缓存时使用。
- **套件插件**：当相关技能应共享一个命名空间和一条安装命令时使用，例如 `/daymade-docs:mermaid-tools`。

如需了解详细的源代码/缓存模式和注意事项，请在修改 `source` 或 `skills` 前阅读
`references/cache_and_source_patterns.md`。

## 第 2 阶段：创建 marketplace.json

### 官方 schema（请牢记）

阅读 `references/marketplace_schema.md` 以获取完整的字段参考。
以下关键规则在文档中并不明显：

1. **`$schema` 字段会被 `claude plugin validate` 拒绝**。不要包含它。
2. **`metadata` 只有 3 个有效字段**：`description`、`version`、`pluginRoot`。不能有其他字段。
   `metadata.homepage` **不存在**——验证器会静默接受它，但它不在规范中。
3. **`metadata.version`** 是 marketplace catalog 版本，而不是单个插件的版本。
   它应与仓库的 VERSION 文件一致（例如 `"2.3.0"`）。
4. **插件条目的 `version`** 是独立的。首次注册 marketplace 时，使用 `"1.0.0"`。
5. **没有 `plugin.json` 时必须使用 `strict: false`**。
   使用 `strict: false` 时，marketplace 条目就是完整的插件定义。
   同时存在 `strict: false` 和包含组件的 `plugin.json` 会导致加载失败。
6. **`source` 定义已安装插件的根目录**。对于单技能插件，应将 `source` 直接指向技能目录（例如 `"./tunnel-doctor"`），并完全省略 `skills`——这是 `anthropics/claude-plugins-official` 中 167/168 个插件使用的官方模式。对于套件插件，使用
   `source: "./<suite>"`，并通过显式的 `skills` 数组列出子目录。
   避免使用 `source: "./"`（会将整个仓库安装为缓存）和
   `skills: ["./"]`（会被 Claude Code 2.1.x 的路径逃逸验证器拒绝）。
7. **保留的 marketplace 名称**，不能使用：`claude-code-marketplace`、
   `claude-code-plugins`、`claude-plugins-official`、`anthropic-marketplace`、
   `anthropic-plugins`、`agent-skills`、`knowledge-work-plugins`、`life-sciences`。
8. **`tags` 与 `keywords`**：两者都是可选的。在当前 Claude Code 源代码中，`keywords` 已定义但从未用于搜索。`tags` 仅在值为 `"community-managed"` 时对 UI 产生影响（显示一个标签）。两者都不会影响发现功能。
   Discover 标签页仅搜索 `name` + `description` + `marketplaceName`。
   为面向未来的兼容性考虑，可以包含 `keywords`，但不要在这方面投入过多精力。

### 生成 marketplace.json

使用此模板，并根据分析结果填写：

```json
{
  "name": "<marketplace-name>",
  "owner": {
    "name": "<github-org-or-username>"
  },
  "metadata": {
    "description": "<one-line description of the marketplace>",
    "version": "<from-VERSION-file-or-1.0.0>"
  },
  "plugins": [
    {
      "name": "<skill-name>",
      "description": "<EXACT text from SKILL.md frontmatter, do NOT rewrite>",
      "source": "./<skill-name>",
      "strict": false,
      "version": "1.0.0",
      "category": "<category>",
      "keywords": ["<relevant>", "<keywords>"]
    }
  ]
}
```

### 为 marketplace 命名

`name` 字段是用户在安装命令中 `@` 后输入的内容：
`claude plugin install dbs@<marketplace-name>`

选择名称时应满足：
- 简短易记
- 使用 kebab-case（仅限小写字母和连字符）
- 与项目身份相关，而非通用名称

### 描述规则

- **使用每个 SKILL.md frontmatter 中的原始描述**
- 不要翻译、修饰或“改进”描述
- 如果仓库面向中文用户，保留中文描述
- 如果是双语描述，使用 SKILL.md description 字段中的第一种语言
- marketplace 级别的 `metadata.description` 可以使用新的摘要

## 维护现有 marketplace

普通条目添加或元数据更新请使用本节。对于套件整合、源位置迁移、套件成员关系转移或从独立项目迁移到套件，请使用路由表中链接的专用工作流；与普通条目添加相比，这些操作涉及更广泛的破坏性变更和文档范围。

向现有 marketplace.json 添加新插件时：

1. **递增 `metadata.version`** — 这是 marketplace 目录版本。
   遵循 semver：新增插件 = 次版本递增，破坏性变更 = 主版本递增。
2. **更新 `metadata.description`** — 附加新 skill 的摘要。
3. **将新插件的 `version` 设置为 `"1.0.0"`** — 它是 marketplace 中的新插件。
4. **当现有插件的 SKILL.md 内容发生变化时，递增其 `version`**。
   Claude Code 使用版本来检测更新 — 版本相同 = 跳过更新。
5. **当现有插件的 `source` 或 `skills` 发生变化时，递增其 `version`**。
   即使 SKILL.md 未发生变化，已安装的缓存路径和组件解析也发生了变化。
6. **检查 `metadata` 中是否存在无效字段** — `metadata.homepage` 是常见错误（不在规范中，会被静默忽略）。如发现则移除。

## 第 3 阶段：验证

### 步骤 1：一次性预检

运行随附的验证器。它会依次执行四项检查，任何必需检查失败时都会以非零状态退出：

```bash
bash scripts/check_marketplace.sh          # validates current repo
bash scripts/check_marketplace.sh /path    # validates a target repo
```

检查内容：

| # | 检查项 | 失败意味着 |
|---|-------|-----------|
| 1 | `.claude-plugin/marketplace.json` 的 JSON 语法 | 文件不是可解析的 JSON |
| 2 | `claude plugin validate .`（如果缺少 `claude` CLI，则跳过） | 架构级拒绝（例如 `Unrecognized key: "$schema"`、名称重复） |
| 3 | 每个插件条目的 `source` + `skills` 解析 | 插件条目指向磁盘上不存在的 SKILL.md |
| 4 | 反向同步（磁盘 → manifest） | 仅警告：磁盘上的 SKILL.md 未在任何插件条目中注册 |

常见的 schema 失败及修复方法：
- `Unrecognized key: "$schema"` → 删除 `$schema` 字段
- `Duplicate plugin name` → 确保所有名称唯一
- `Path contains ".."` → 仅使用 `./` 相对路径
- 在验证已安装的缓存路径时出现 `No manifest found in directory` → 验证 marketplace manifest 或插件源，而不是 `strict: false` 的缓存目录。

### 步骤 2：安装测试

```bash
# Add as local marketplace
claude plugin marketplace add .

# Install a plugin
claude plugin install <plugin-name>@<marketplace-name>

# Verify it appears
claude plugin list | grep <plugin-name>

# Check for updates (should say "already at latest")
claude plugin update <plugin-name>@<marketplace-name>

# Clean up
claude plugin uninstall <plugin-name>@<marketplace-name>
claude plugin marketplace remove <marketplace-name>
```

### 步骤 3：缓存内容测试

安装或更新后，检查实际缓存。这是确认 `source` 是否生成预期快照的唯一方法：

```bash
PLUGIN=<plugin-name>
MARKET=<marketplace-name>
CACHE=$(jq -r --arg id "$PLUGIN@$MARKET" '.plugins[$id][0].installPath' ~/.claude/plugins/installed_plugins.json)
find "$CACHE" -maxdepth 1 -mindepth 1 -exec basename {} \; | sort
```

预期结果：

- 单技能插件缓存：包含 `SKILL.md`，以及其自身的 `scripts/`、`references/`、`assets/`（如适用）。
- 技能套件插件缓存：仅包含套件成员技能目录和套件范围内的资源。
- 如果出现无关的技能目录，说明 `source` 范围过宽。
- 如果缓存条目是符号链接，说明插件不是自包含的；应使用规范源目录，而不是符号链接目录集合。

### 步骤 4：GitHub 安装测试（如果已推送）

```bash
# Test from GitHub (requires the branch to be pushed)
claude plugin marketplace add <github-user>/<repo>
claude plugin install <plugin-name>@<marketplace-name>

# Verify
claude plugin list | grep <plugin-name>

# Clean up
claude plugin uninstall <plugin-name>@<marketplace-name>
claude plugin marketplace remove <marketplace-name>
```

## 上线前检查清单（继续进行 PR 前必须通过）

每次修改 `marketplace.json` 后都要运行此检查清单。不要跳过任何项目。

### 自动化检查

```bash
bash scripts/check_marketplace.sh
```

四项检查都必须通过。将反向同步 WARN 视为真实信号：磁盘上未注册的 `SKILL.md` 几乎总是以下两种情况之一：你忘记注册而意外遗漏的技能，或者应该删除的死代码。

### 元数据检查

通过阅读 marketplace.json 验证以下内容：

- [ ] `metadata.version` 相比之前的版本已递增
- [ ] `metadata.description` 提及所有技能类别
- [ ] 没有 `metadata.homepage`（规范中未定义，会被静默忽略）
- [ ] 没有 `$schema` 字段（验证器会拒绝）

### 逐个插件检查

对每个插件条目：

- [ ] `description` 与 SKILL.md 的 frontmatter 完全一致（不得改写）
- [ ] 新插件的 `version` 为 `"1.0.0"`，有变更的插件已递增版本号
- [ ] `source` 直接指向技能目录（例如 `"./skill-name"`）
- [ ] 单技能插件省略 `skills` 字段（从 `source` 自动发现）
- [ ] 技能套件插件列出相对于 `source` 的 `skills` 路径
- [ ] `strict` 为 `false`（仓库中没有 plugin.json）
- [ ] `name` 使用 kebab-case，并且在所有条目中唯一

### 最终验证

```bash
bash scripts/check_marketplace.sh
```

在创建 PR 之前，必须打印 `RESULT: PASSED`。只有当你经过慎重考虑，决定让某个 SKILL.md 保持未注册状态时，`WARN [4/4]` 才是可接受的。

## 阶段 4：创建 PR

### 原则
- 仅当为上游仓库添加 marketplace 支持时，才应用这些纯增量约束。经用户批准的套件整合必然会移动现有的 skill 目录并更新仓库的安装文档；对于该路径，请遵循专门的整合工作流。
- **纯增量（仅适用于新 marketplace 路径）**：不要修改现有的 skill 文件；仅在需要公开新的安装路径时更新 README
- **合并提交**：避免迭代更改导致 git 历史产生二进制膨胀
- 只添加：`.claude-plugin/marketplace.json`，可选的 `scripts/`，以及可选的 README 更新

### README 更新（如适用）
在现有安装说明之前添加 marketplace 安装方式：

```markdown
## 安装

![demo](demo.gif)  <!-- 仅当 demo 存在时添加 -->

**Claude Code plugin marketplace（单击安装，自动更新）：**

\`\`\`bash
claude plugin marketplace add <owner>/<repo>
claude plugin install <skill>@<marketplace-name>
\`\`\`
```

### PR 描述模板
包括：
- 添加的内容（包含 N 个 skill、M 个类别的 marketplace.json）
- 合并后用户将使用的安装命令
- 设计决策（纯增量、原始描述等）
- 验证证据（`claude plugin validate .` 已通过）
- 测试计划（用于验证的安装命令）

## 捆绑的 hooks（可选，自动激活）

此 skill 在 `hooks/` 下附带两个 PostToolUse hooks：

- `hooks/post_edit_validate.sh` — 每当写入或编辑 `marketplace.json` 文件时运行 `claude plugin validate`。
- `hooks/post_edit_sync_check.sh` — 当编辑 `SKILL.md`，但 `marketplace.json` 中匹配的 plugin 条目没有提升其 `version` 时发出警告。

这两个 hooks 都在此插件自身的清单条目（`plugins[].hooks`）中声明，因此当插件在 Claude Code 会话中启用时，它们会自动激活。无需手动编辑 `settings.json`。要禁用它们，请从用户已安装副本中的此插件条目移除 `hooks` 块，或使用 `/plugin disable marketplace-dev`（它们仅在插件启用时生效）。

这些 hooks 是编辑时的防护措施。它们不会取代 `scripts/check_marketplace.sh` — 始终在创建 PR 前运行预检。

## 反模式（出现的问题及修复方法）

阅读 `references/anti_patterns.md`，了解在实际 marketplace 开发过程中发现的完整问题列表。这些问题**并非**理论情况 — 每一个都曾在生产环境中遇到并调试过。