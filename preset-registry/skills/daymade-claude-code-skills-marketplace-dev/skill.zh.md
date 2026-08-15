---
name: marketplace-dev
description: >-
  Converts any Claude Code skills repository into an official plugin marketplace —
  generates spec-conforming .claude-plugin/marketplace.json, validates with
  `claude plugin validate`, tests real installation, and PRs the upstream repo,
  encoding hard-won schema/version/description anti-patterns. Use when the user
  mentions marketplace, plugin support, one-click install, marketplace.json,
  plugin distribution, auto-update, or wants a skills repo installable via
  `claude plugin install`.
argument-hint: "[repo-path]"
---
# marketplace-dev

将 Claude Code 技能仓库转换为官方插件市场，使用户能够通过 `claude plugin marketplace add` 安装技能并获得自动更新。

**输入**：一个包含 `skills/` 目录及 SKILL.md 文件的仓库。  
**输出**：`.claude-plugin/marketplace.json` + 已验证 + 已完成安装测试 + 可提交 PR。

## 阶段 0：证据收集

在编辑现有市场之前，应收集证据，而不是依赖默认模板：

1. 阅读当前的 `.claude-plugin/marketplace.json`。
2. 阅读此仓库的市场规则（`CLAUDE.md`、README 安装部分、变更日志）。
3. 阅读有关市场/插件路径语义的官方文档。
4. 如果是在先前失败的基础上进行改进，请挖掘本地 Claude Code 会话历史记录。

每个项目的会话都位于 `~/.claude/projects/<escaped-cwd>/` 下：
- 顶层文件：`<session-id>.jsonl`
- 子代理记录：`<session-id>/subagents/agent-*.jsonl`

实用的搜索模式（根据你正在调试的失败情况调整关键字）：

```bash
grep -lc "marketplace.json\|claude plugin validate\|claude plugin install" \
  ~/.claude/projects/<escaped-cwd>/*.jsonl
grep -lc "Unrecognized key\|Plugin not found\|No manifest found\|Duplicate plugin" \
  ~/.claude/projects/<escaped-cwd>/*.jsonl \
  ~/.claude/projects/<escaped-cwd>/*/subagents/*.jsonl
```

将经验提炼为有证据支持的规则：尝试过的命令、观察到的输出、根本原因、最终有效的命令/配置。不要将凭记忆做出的猜测编码进去。

## 阶段 1：分析目标仓库

### 步骤 1：发现所有技能

```bash
# Find every SKILL.md
find <repo-path>/skills -name "SKILL.md" -type f 2>/dev/null
```

对于每个技能，从 SKILL.md 的 frontmatter 中提取：
- `name` — 技能标识符
- `description` — 原始文本，请勿重写或翻译

### 步骤 2：读取仓库元数据

- `VERSION` 文件（如果存在）— 其内容将成为 `metadata.version`
- `README.md` — 了解项目、作者信息和分类
- `LICENSE` — 记录许可证类型
- Git 远程仓库 — 识别上游仓库与分叉仓库（`git remote -v`）

### 步骤 3：确定分类

按功能对技能进行分组。分类是自由格式的字符串。良好的模式包括：
- `business-diagnostics`、`content-creation`、`thinking-tools`、`utilities`
- `developer-tools`、`productivity`、`documentation`、`security`

如果分组存在歧义，请让用户确认分类。

### 步骤 4：选择插件边界

Claude Code 分为三个独立层级：

```text
marketplace -> plugin -> skill
```

- 市场名称用于安装标识：`plugin@marketplace`。
- 插件名称是斜杠命名空间：`/plugin-name:skill-name`。
- 当技能路径指向直接包含 `SKILL.md` 的目录时，技能名称来自 `SKILL.md` frontmatter。

根据安装、更新和缓存意图选择每个插件的边界：

- **单技能插件**：当技能应独立安装、更新和回滚，并使用范围较小的缓存时使用。
- **套件插件**：当相关技能应共享一个命名空间和一条安装命令时使用，例如 `/daymade-docs:mermaid-tools`。

有关详细的 source/cache 模式和常见陷阱，请在更改 `source` 或 `skills` 之前阅读
`references/cache_and_source_patterns.md`。

## 阶段 2：创建 marketplace.json

### 官方 schema（请牢记）

请阅读 `references/marketplace_schema.md` 以获取完整的字段参考。
以下是文档中不明显的关键规则：

1. **`$schema` 字段会被 `claude plugin validate` 拒绝**。不要包含该字段。
2. **`metadata` 只有 3 个有效字段**：`description`、`version`、`pluginRoot`。没有其他字段。
   `metadata.homepage` 并不存在——验证器会默默接受它，但它不在规范中。
3. **`metadata.version`** 是 marketplace 目录的版本，而不是各个 plugin 的版本。
   它应与仓库中的 VERSION 文件一致（例如 `"2.3.0"`）。
4. Plugin 条目的 **`version`** 是独立的。首次注册 marketplace 时，请使用 `"1.0.0"`。
5. 当仓库中没有 `plugin.json` 时，必须设置 **`strict: false`**。
   使用 `strict: false` 时，marketplace 条目就是完整的 plugin 定义。
   同时存在 `strict: false` 和包含组件的 `plugin.json` 会导致加载失败。
6. **`source` 定义已安装 plugin 的根目录**。对于单 skill plugin，应将
   `source` 直接指向 skill 目录（例如 `"./tunnel-doctor"`），并完全省略
   `skills`——这是 `anthropics/claude-plugins-official` 中 168 个 plugin 里有 167 个采用的官方模式。对于套件 plugin，请使用
   `source: "./<suite>"`，并通过显式的 `skills` 数组列出子目录。
   避免使用 `source: "./"`（会将整个仓库安装为 cache）和 `skills: ["./"]`
   （会被 Claude Code 2.1.x 的路径逃逸验证器拒绝）。
7. **不能使用的保留 marketplace 名称**：`claude-code-marketplace`、
   `claude-code-plugins`、`claude-plugins-official`、`anthropic-marketplace`、
   `anthropic-plugins`、`agent-skills`、`knowledge-work-plugins`、`life-sciences`。
8. **`tags` 与 `keywords`**：两者均为可选字段。在当前 Claude Code 源码中，
   `keywords` 已被定义，但从未用于搜索。`tags` 只有在值为
   `"community-managed"` 时才会影响 UI（显示一个标签）。两者都不会影响内容发现。
   Discover 选项卡仅搜索 `name` + `description` + `marketplaceName`。
   为了适应未来变化，可以包含 `keywords`，但不要投入过多精力。

### 生成 marketplace.json

使用此模板，并填入分析所得的信息：

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

### marketplace 的命名

用户在安装命令中的 `@` 之后输入的就是 `name` 字段：
`claude plugin install dbs@<marketplace-name>`

选择一个符合以下要求的名称：
- 简短且易于记忆
- 采用 kebab-case（仅使用小写字母和连字符）
- 与项目身份相关，而非通用名称

### 描述规则

- **使用每个 SKILL.md frontmatter 中的原始描述**
- 不要翻译、修饰或“改进”描述
- 如果仓库面向中文受众，请保留中文描述
- 如果是双语描述，请使用 SKILL.md description 字段中的第一种语言
- 市场级别的 `metadata.description` 可以是新的摘要

## 维护现有市场

向现有 marketplace.json 添加新插件时：

1. **提升 `metadata.version`** — 这是市场目录的版本。
   遵循 semver：新增插件 = 提升次版本号，破坏性变更 = 提升主版本号。
2. **更新 `metadata.description`** — 追加新技能的摘要。
3. **将新插件的 `version` 设置为 `"1.0.0"`** — 它对该市场而言是全新的。
4. **当现有插件的 SKILL.md 内容发生变化时，提升其 `version`**。
   Claude Code 使用版本号检测更新 — 版本号相同 = 跳过更新。
5. **当现有插件的 `source` 或 `skills` 发生变化时，提升其 `version`**。
   即使 SKILL.md 未发生变化，已安装的缓存路径和组件解析方式也已改变。
6. **检查 `metadata` 中是否存在无效字段** — `metadata.homepage` 是一个常见错误
   （不在规范中，会被静默忽略）。如发现，请将其删除。

## 阶段 3：验证

### 步骤 1：一次性预检

运行随附的验证器。它会依次执行四项检查，并在任何必要检查失败时以非零状态码退出：

```bash
bash scripts/check_marketplace.sh          # validates current repo
bash scripts/check_marketplace.sh /path    # validates a target repo
```

检查内容：

| # | 检查 | 失败意味着 |
|---|-------|---------------|
| 1 | `.claude-plugin/marketplace.json` 的 JSON 语法 | 文件不是可解析的 JSON |
| 2 | `claude plugin validate .`（如果缺少 `claude` CLI，则跳过） | schema 级别的拒绝（例如 `Unrecognized key: "$schema"`、名称重复） |
| 3 | 每个插件条目的 `source` + `skills` 解析 | 某个插件条目指向磁盘上不存在的 SKILL.md |
| 4 | 反向同步（磁盘 → manifest） | 仅 WARN：磁盘上的某个 SKILL.md 未注册到任何插件条目中 |

常见的 schema 失败及修复方法：
- `Unrecognized key: "$schema"` → 删除 `$schema` 字段
- `Duplicate plugin name` → 确保所有名称均唯一
- `Path contains ".."` → 仅使用以 `./` 开头的相对路径
- 验证已安装的缓存路径时出现 `No manifest found in directory` → 应验证
  marketplace manifest 或插件源，而不是 `strict: false` 缓存目录。

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

### 第 3 步：缓存内容测试

安装或更新后，检查实际缓存。这是确认 `source` 是否生成预期快照的唯一方法：

```bash
PLUGIN=<plugin-name>
MARKET=<marketplace-name>
CACHE=$(jq -r --arg id "$PLUGIN@$MARKET" '.plugins[$id][0].installPath' ~/.claude/plugins/installed_plugins.json)
find "$CACHE" -maxdepth 1 -mindepth 1 -exec basename {} \; | sort
```

预期结果：

- 单技能插件缓存：`SKILL.md`，以及适用情况下其自身的 `scripts/`、`references/`、`assets/`。
- 套件插件缓存：仅包含套件成员的技能目录和套件范围内的资源。
- 如果出现不相关的技能目录，则 `source` 范围过大。
- 如果缓存条目是符号链接，则该插件并非自包含；应使用规范源目录，而不是符号链接集合。

### 第 4 步：GitHub 安装测试（如果已推送）

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

## 预检清单（继续创建 PR 前必须通过）

每次更改 marketplace.json 后都要运行此清单。不要跳过任何项目。

### 自动化检查

```bash
bash scripts/check_marketplace.sh
```

所有四项检查都必须通过。应将反向同步 WARN 视为真实信号：磁盘上未注册的 `SKILL.md` 几乎总是你忘记注册的意外遗漏技能，或者是应当删除的无用代码。

### 元数据检查

通过阅读 marketplace.json 验证以下各项：

- [ ] `metadata.version` 已在先前版本基础上递增
- [ ] `metadata.description` 提及所有技能类别
- [ ] 不存在 `metadata.homepage`（不在规范中，会被静默忽略）
- [ ] 不存在 `$schema` 字段（验证器会拒绝）

### 各插件检查

对于每个插件条目：

- [ ] `description` 与 SKILL.md frontmatter 完全一致（未经改写）
- [ ] 新插件的 `version` 为 `"1.0.0"`，已更改插件的版本已递增
- [ ] `source` 直接指向技能目录（例如 `"./skill-name"`）
- [ ] 单技能插件省略 `skills` 字段（从 `source` 自动发现）
- [ ] 套件插件列出相对于 `source` 的 `skills` 路径
- [ ] `strict` 为 `false`（仓库中没有 plugin.json）
- [ ] `name` 使用 kebab-case，并且在所有条目中唯一

### 最终验证

```bash
bash scripts/check_marketplace.sh
```

创建 PR 前，必须输出 `RESULT: PASSED`。仅当你有意决定不注册某个 SKILL.md 时，`WARN [4/4]` 才可以接受。

## 阶段 4：创建 PR

### 原则
- **纯增量**：不要修改任何现有文件（技能、README 等）
- **压缩提交**：避免迭代更改导致 Git 历史中出现二进制膨胀
- 仅添加：`.claude-plugin/marketplace.json`，可选添加 `scripts/`，可选更新 README

### README 更新（如果适用）
在现有安装说明之前添加上述 marketplace 安装方法：

```markdown
## 安装

![演示](demo.gif)  <!-- 仅当演示存在时 -->

**Claude Code 插件市场（一键安装、自动更新）：**

\`\`\`bash
claude plugin marketplace add <owner>/<repo>
claude plugin install <skill>@<marketplace-name>
\`\`\`
```

### PR 描述模板
包括：
- 添加了什么（包含 N 个技能、M 个类别的 marketplace.json）
- 合并后用户将使用的安装命令
- 设计决策（纯增量、原创描述等）
- 验证证据（`claude plugin validate .` 已通过）
- 测试计划（用于验证的安装命令）

## 捆绑钩子（可选，自动激活）

此技能在 `hooks/` 下提供了两个 PostToolUse 钩子：

- `hooks/post_edit_validate.sh` — 每当写入或编辑
  `marketplace.json` 文件时，运行 `claude plugin validate`。
- `hooks/post_edit_sync_check.sh` — 当编辑了 `SKILL.md`，但
  `marketplace.json` 中对应插件条目的 `version` 未递增时发出警告。

这两个钩子均在此插件自身的清单条目（`plugins[].hooks`）中声明，
因此，当在 Claude Code 会话中启用该插件时，它们会自动激活。
无需手动编辑 `settings.json`。要禁用它们，请从用户已安装副本中的
此插件条目里移除 `hooks` 块，或使用
`/plugin disable marketplace-dev`（它们仅在启用该插件时生效）。

这些钩子是编辑期间的防护机制。它们不能替代
`scripts/check_marketplace.sh`——在提交 PR 前务必运行预检。

## 反模式（曾出现的问题及其修复方法）

请阅读 `references/anti_patterns.md`，查看在实际市场开发过程中发现的完整陷阱列表。
这些并非理论问题——每一个都曾在生产环境中遇到并经过调试。