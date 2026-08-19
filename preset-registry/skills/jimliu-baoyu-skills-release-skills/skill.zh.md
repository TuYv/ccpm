---
name: release-skills
description: Universal release workflow. Auto-detects version files and changelogs. Supports Node.js, Python, Rust, Claude Plugin, GitHub Releases, annotated tags, historical release backfill, and generic projects. Use when user says "release", "发布", "new version", "bump version", "push", "推送", "release notes", "GitHub Release", or "回填 Release".
---
# 发布技能

支持任何项目类型并提供多语言变更日志的通用发布工作流。

## 用户输入工具

当此技能提示用户时，请遵循以下工具选择规则（按优先级排序）：

1. **优先使用**当前代理运行时提供的内置用户输入工具 — 例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等效工具。
2. **回退方案**：如果不存在此类工具，则输出编号的纯文本消息，并要求用户针对每个问题回复所选编号/答案。
3. **批处理**：如果工具支持每次调用提出多个问题，则将所有适用问题合并到一次调用中；如果仅支持单个问题，则按优先级顺序逐个提问。

下面的 `AskUserQuestion` 引用仅为示例 — 在其他运行时中请替换为本地等效工具。

## 快速开始

只需运行 `/release-skills` - 自动检测项目配置。

## 支持的项目

| 项目类型 | 版本文件 | 自动检测 |
|--------------|--------------|---------------|
| Node.js | package.json | ✓ |
| Python | pyproject.toml | ✓ |
| Rust | Cargo.toml | ✓ |
| Claude Plugin | marketplace.json | ✓ |
| Generic | VERSION / version.txt | ✓ |

## 选项

| 标志 | 描述 |
|------|-------------|
| `--dry-run` | 预览变更但不执行 |
| `--major` | 强制提升主版本号 |
| `--minor` | 强制提升次版本号 |
| `--patch` | 强制提升补丁版本号 |
| `--backfill-releases` | 根据变更日志章节，为现有标签创建缺失的 GitHub Releases |

## 工作流

### 步骤 1：检测项目配置

1. 检查 `.releaserc.yml`（可选配置覆盖）
   - 如果存在，检查其中是否定义了发布钩子
2. 按以下优先级顺序扫描版本文件并自动检测：
   - `package.json`（Node.js）
   - `pyproject.toml`（Python）
   - `Cargo.toml`（Rust）
   - `marketplace.json` 或 `.claude-plugin/marketplace.json`（Claude Plugin）
   - `VERSION` 或 `version.txt`（Generic）
3. 使用 glob 模式扫描变更日志文件：
   - `CHANGELOG*.md`
   - `HISTORY*.md`
   - `CHANGES*.md`
4. 根据文件名后缀识别每个变更日志所使用的语言
5. 检测 GitHub 发布支持：
   - 检查 `origin` 是否指向 GitHub
   - 检查是否已安装并完成身份验证的 `gh`
   - 在可用时，使用 `gh release list --limit 5` 检查现有发布
6. 显示检测到的配置

**项目钩子契约**：

如果 `.releaserc.yml` 定义了 `release.hooks`，则保持发布工作流通用，并将项目特定的打包/发布工作委托给这些钩子。

支持的钩子：

| 钩子 | 用途 | 预期职责 |
|------|---------|---------|
| `prepare_artifact` | 使一个目标可发布 | 验证目标是自包含的，同步/嵌入本地依赖项，可选暂存额外文件 |
| `publish_artifact` | 发布一个可发布目标 | 上传已准备好的目标（如果项目使用暂存目录，则上传暂存目录），附加版本/变更日志/标签 |

支持的占位符：

| 占位符 | 含义 |
|-------------|---------|
| `{project_root}` | 仓库根目录的绝对路径 |
| `{target}` | 正在发布的模块/skill 的绝对路径 |
| `{artifact_dir}` | 此目标的临时暂存目录的绝对路径（如果项目使用暂存目录） |
| `{version}` | 发布工作流选定的版本 |
| `{dry_run}` | `true` 或 `false` |
| `{release_notes_file}` | 包含发布说明/变更日志文本的 UTF-8 文件的绝对路径 |

执行规则：
- 保持 skill 的通用性：不要将注册表/包管理器/项目布局的详细信息硬编码到此 SKILL 中。
- 如果存在 `prepare_artifact`，则在需要最终可发布目标状态的发布相关检查之前，为每个目标运行一次。
- 将发布说明写入临时文件，并将该文件路径传递给 `publish_artifact`；不要将多行变更日志文本直接内联到 shell 命令中。
- 如果不存在钩子，则回退到默认的与项目无关的发布工作流。

**语言检测规则**：

变更日志文件遵循 `CHANGELOG_{LANG}.md` 或 `CHANGELOG.{lang}.md` 模式，其中 `{lang}` / `{LANG}` 是语言或地区代码。

| 模式 | 示例 | 语言 |
|---------|---------|----------|
| 无后缀 | `CHANGELOG.md` | en（默认） |
| `_{LANG}`（大写） | `CHANGELOG_CN.md`、`CHANGELOG_JP.md` | 对应语言 |
| `.{lang}`（小写） | `CHANGELOG.zh.md`、`CHANGELOG.ja.md` | 对应语言 |
| `.{lang-region}` | `CHANGELOG.zh-CN.md` | 对应地区变体 |

常见语言代码：`zh`（中文）、`ja`（日语）、`ko`（韩语）、`de`（德语）、`fr`（法语）、`es`（西班牙语）。

**输出示例**：
```
Project detected:
  Version file: package.json (1.2.3)
  Changelogs:
    - CHANGELOG.md (en)
    - CHANGELOG.zh.md (zh)
    - CHANGELOG.ja.md (ja)
```

### 第 2 步：分析自上一个标签以来的变更

```bash
LAST_TAG=$(git tag --sort=-v:refname | head -1)
git log ${LAST_TAG}..HEAD --oneline
git diff ${LAST_TAG}..HEAD --stat
```

按约定式提交类型进行分类：

| 类型 | 描述 |
|------|-------------|
| feat | 新功能 |
| fix | Bug 修复 |
| docs | 文档 |
| refactor | 代码重构 |
| perf | 性能改进 |
| test | 测试变更 |
| style | 格式、样式 |
| chore | 维护（在变更日志中跳过） |

**破坏性变更检测**：
- 提交消息以 `BREAKING CHANGE` 开头
- 提交正文/页脚包含 `BREAKING CHANGE:`
- 移除公共 API、重命名导出、变更接口

如果检测到破坏性变更，警告用户："检测到破坏性变更。请考虑进行主版本升级（`--major` 标志）。"

### 第 3 步：确定版本升级幅度

规则（按优先级排序）：
1. 用户标志 `--major/--minor/--patch` → 使用指定的版本升级幅度
2. 检测到 BREAKING CHANGE → 主版本升级（1.x.x → 2.0.0）
3. 存在 `feat:` 提交 → 次版本升级（1.2.x → 1.3.0）
4. 否则 → 补丁版本升级（1.2.3 → 1.2.4）

显示版本变更：`1.2.3 → 1.3.0`

### 第 4 步：生成多语言变更日志

对于检测到的每个变更日志文件：

1. **从文件名后缀识别语言**
2. **检测第三方贡献者**：
   - 检查合并提交：`git log ${LAST_TAG}..HEAD --merges --pretty=format:"%H %s"`
   - 对于每个合并的 PR，使用 `gh pr view <number> --json author --jq '.author.login'` 识别 PR 作者
   - 使用 `gh repo view --json owner --jq '.owner.login'` 与仓库所有者进行比较
   - 如果 PR 作者 ≠ 仓库所有者 → 第三方贡献者
3. **以该语言生成内容**：
   - 使用目标语言书写章节标题
   - 使用自然的目标语言书写变更描述（而非翻译）
   - 日期格式：YYYY-MM-DD（通用）
   - **第三方贡献**：在变更日志条目中附加贡献者署名 `(by @username)`
4. **插入文件头部**（保留现有内容）

**章节标题翻译**（内置）：

| Type | en | zh | ja | ko | de | fr | es |
|------|----|----|----|----|----|----|-----|
| feat | Features | 新功能 | 新機能 | 새로운 기능 | Funktionen | Fonctionnalités | Características |
| fix | Fixes | 修复 | 修正 | 수정 | Fehlerbehebungen | Corrections | Correcciones |
| docs | Documentation | 文档 | ドキュメント | 문서 | Dokumentation | Documentation | Documentación |
| refactor | Refactor | 重构 | リファクタリング | 리팩토링 | Refactoring | Refactorisation | Refactorización |
| perf | Performance | 性能优化 | パフォーマンス | 성능 | Leistung | Performance | Rendimiento |
| breaking | Breaking Changes | 破坏性变更 | 破壊的変更 | 주요 변경사항 | Breaking Changes | Changements majeurs | Cambios importantes |

**变更日志格式**：

```markdown
## {VERSION} - {YYYY-MM-DD}

### Features
- Description of new feature
- Description of third-party contribution (by @username)

### Fixes
- Description of fix

### Documentation
- Description of docs changes
```

仅包含有变更的章节。省略空章节。

**第三方署名规则**：
- 仅为不是仓库所有者的贡献者添加 `(by @username)`
- 使用带有 `@` 前缀的 GitHub 用户名
- 将其放在变更日志条目行末尾
- 所有语言保持一致（始终使用 `(by @username)` 格式，不进行翻译）

**多语言示例**：

English (CHANGELOG.md):
```markdown
## 1.3.0 - 2026-01-22

### Features
- Add user authentication module (by @contributor1)
- Support OAuth2 login

### Fixes
- Fix memory leak in connection pool
```

Chinese (CHANGELOG.zh.md):
```markdown
## 1.3.0 - 2026-01-22

### 新功能
- 新增用户认证模块 (by @contributor1)
- 支持 OAuth2 登录

### 修复
- 修复连接池内存泄漏问题
```

Japanese (CHANGELOG.ja.md):
```markdown
## 1.3.0 - 2026-01-22

### 新機能
- ユーザー認証モジュールを追加 (by @contributor1)
- OAuth2 ログインをサポート

### 修正
- コネクションプールのメモリリークを修正
```

### 步骤 5：按 Skill/模块分组变更

分析自上一个标签以来的提交，并按受影响的 skill/模块进行分组：

1. **识别**每个提交中发生变更的文件
2. **按 skill/模块分组**：
   - `skills/<skill-name>/*` → 归入对应 skill
   - 根目录文件（CLAUDE.md 等）→ 归入 "project"
   - 一个提交涉及多个 skill → 拆分为多个分组
3. **对于每个分组**，识别相关的 README 更新需求

**分组示例**：
```
baoyu-cover-image:
  - feat: add new style options
  - fix: handle transparent backgrounds
  → README updates: options table

baoyu-comic:
  - refactor: improve panel layout algorithm
  → No README updates needed

project:
  - docs: update CLAUDE.md architecture section
```

### 步骤 6：分别提交每个 Skill/模块

按照变更顺序处理每个 skill/模块分组：

1. **检查是否需要更新 README**：
   - 扫描 `README*.md` 中对该 skill/模块的提及
   - 验证选项/标志的文档是否正确
   - 如果语法发生变化，更新使用示例
   - 如果行为发生变化，更新功能描述

2. **暂存并提交**：
   ```bash
   git add skills/<skill-name>/*
   git add README.md README.zh.md  # If updated for this skill
   git commit -m "<type>(<skill-name>): <meaningful description>"
   ```

3. **提交消息格式**：
   - 使用 conventional commit 格式：`<type>(<scope>): <description>`
   - `<type>`：feat、fix、refactor、docs、perf 等
   - `<scope>`：skill 名称或 "project"
   - `<description>`：清晰、有意义的变更描述

**提交示例**：
```bash
git commit -m "feat(baoyu-cover-image): add watercolor and minimalist styles"
git commit -m "fix(baoyu-comic): improve panel layout for long dialogues"
git commit -m "docs(project): update architecture documentation"
```

**常见的 README 更新需求**：
| 变更类型 | 需要检查的 README 部分 |
|-------------|------------------------|
| 新增选项/标志 | 选项表、使用示例 |
| 重命名选项 | 选项表、使用示例 |
| 新增功能 | 功能描述、示例 |
| 破坏性变更 | 迁移说明、弃用警告 |
| 内部结构重组 | 架构部分（如果对用户可见） |

### 步骤 7：生成变更日志并更新版本

1. **生成多语言变更日志**（如步骤 4 所述）
2. **更新版本文件**：
   - 读取版本文件（JSON/TOML/文本）
   - 更新版本号
   - 写回文件（保留格式）
3. **创建发布说明文件**：
   - 优先使用 `CHANGELOG.md` 中的新版本部分
   - 如果不存在英文/默认变更日志，则使用第一个检测到的变更日志
   - 仅提取从准确的 `## {VERSION} - {YYYY-MM-DD}` 部分开始、到下一个 `##` 之前的内容
   - 必要时同时匹配普通版本号和带标签前缀的标题，例如 `1.2.3` 和 `v1.2.3`
   - 将破坏性变更放在靠前位置；如有需要，在其他部分之前添加简短的重点说明
   - 将说明写入 UTF-8 临时文件，并将其复用于带注释的标签消息、GitHub Releases 和 `publish_artifact`
   - 在正常模式下，如果找不到说明，则停止操作，而不是创建空标签或 GitHub Release

**按文件类型划分的版本路径**：

| 文件 | 路径 |
|------|------|
| package.json | `$.version` |
| pyproject.toml | `project.version` |
| Cargo.toml | `package.version` |
| marketplace.json | `$.metadata.version` |
| VERSION / version.txt | 直接内容 |

### 步骤 8：用户确认

在创建发布提交之前，请用户确认：

**使用 AskUserQuestion 提出三个问题**：

1. **版本提升**（单选）：
   - 显示基于步骤 3 分析得出的推荐版本
   - 选项：推荐版本（带标签）、其他 semver 选项
   - 示例：`1.2.3 → 1.3.0 (Recommended)`、`1.2.3 → 1.2.4`、`1.2.3 → 2.0.0`

2. **推送到远程仓库**（单选）：
   - 选项："Yes, push after commit"、"No, keep local only"

3. **发布 GitHub Release**（单选）：
   - 仅在支持 GitHub release 时提供此选项
   - 当用户同时选择推送时，默认选择 "Yes, publish after tag push"
   - 如果用户将发布保留在本地，则不要创建或编辑 GitHub Release

**确认前的输出示例**：
```
Commits created:
  1. feat(baoyu-cover-image): add watercolor and minimalist styles
  2. fix(baoyu-comic): improve panel layout for long dialogues
  3. docs(project): update architecture documentation

Changelog preview (en):
  ## 1.3.0 - 2026-01-22
  ### Features
  - Add watercolor and minimalist styles to cover-image
  ### Fixes
  - Improve panel layout for long dialogues in comic

Release notes source: CHANGELOG.md#1.3.0
Ready to create release commit, annotated tag, and GitHub Release.
```

### 步骤 9：创建发布提交和附注标签

用户确认后：

1. **暂存版本文件和变更日志文件**：
   ```bash
   git add <version-file>
   git add CHANGELOG*.md
   ```

2. **创建发布提交**：
   ```bash
   git commit -m "chore: release v{VERSION}"
   ```

3. **创建附注标签**：
   ```bash
   git tag -a v{VERSION} -F <release-notes-file>
   ```
   如果 `.releaserc.yml` 设置了 `tag.sign: true`，则使用 `git tag -s` 和同一个 notes 文件。

4. **如果用户已确认则推送**（步骤 8）：
   ```bash
   git push origin main
   git push origin v{VERSION}
   ```

**注意**：不要添加 Co-Authored-By 行。这是发布提交，而不是代码贡献。

### 步骤 10：发布构件和 GitHub Release

项目构件发布和 GitHub Releases 是两个独立的输出：

1. **项目构件**：
   - 如果存在 `release.hooks.publish_artifact`，则针对每个已准备的目标运行一次
   - 传入用于标签和 GitHub Release 的同一个 `{release_notes_file}`
   - 在 dry-run 模式下，传入 `{dry_run}=true`，并报告将要发布的内容

2. **GitHub Release**：
   - 仅当用户已确认远程发布且 GitHub 支持可用时运行
   - 创建 release 前，确保远程仓库中已存在该标签
   - 使用提取出的 notes 创建或更新：
     ```bash
     if gh release view v{VERSION} >/dev/null 2>&1; then
       gh release edit v{VERSION} --title "v{VERSION}" --notes-file <release-notes-file>
     else
       gh release create v{VERSION} --title "v{VERSION}" --notes-file <release-notes-file> --verify-tag
     fi
     ```
   - 绝不要将多行 release notes 直接嵌入 shell 命令中

**发布后输出**：
```
Release v1.3.0 created.

Commits:
  1. feat(baoyu-cover-image): add watercolor and minimalist styles
  2. fix(baoyu-comic): improve panel layout for long dialogues
  3. docs(project): update architecture documentation
  4. chore: release v1.3.0

Tag: v1.3.0
Tag type: annotated
GitHub Release: published  # or "skipped/local only"
Status: Pushed to origin  # or "Local only - run git push when ready"
```

## 回填现有 GitHub Releases

当用户要求回填历史发布，或传入 `--backfill-releases` 时，使用此模式。

1. 不要递增版本、编辑变更日志或创建发布提交。
2. 按版本顺序列出现有标签，并检测缺失的 release：
   ```bash
   git tag --sort=v:refname
   gh release view <tag>
   ```
3. 对于没有 GitHub Release 的每个标签：
   - 通过去除配置的标签前缀来规范化变更日志查找，例如 `v1.2.3` -> `1.2.3`
   - 从 `CHANGELOG.md` 中提取匹配的章节；如果没有匹配项，则回退到第一个匹配的变更日志文件
   - 如果不存在匹配的变更日志章节，则跳过发布或在发布前询问
   - 使用以下命令创建 release：
     ```bash
     gh release create <tag> --title "<tag>" --notes-file <release-notes-file> --verify-tag
     ```
4. 使用 `git cat-file -t <tag>` 检测轻量标签（`commit` 表示轻量标签，`tag` 表示附注标签）。
5. 默认不要重写公开的轻量标签。将现有远程标签转换为附注标签需要用户明确确认，因为这会重写已发布的引用。

## 配置（`.releaserc.yml`）

项目根目录中的可选配置文件，用于覆盖默认设置：

```yaml
# .releaserc.yml - Optional configuration

# Version file (auto-detected if not specified)
version:
  file: package.json
  path: $.version  # JSONPath for JSON, dotted path for TOML

# Changelog files (auto-detected if not specified)
changelog:
  files:
    - path: CHANGELOG.md
      lang: en
    - path: CHANGELOG.zh.md
      lang: zh
    - path: CHANGELOG.ja.md
      lang: ja

  # Section mapping (conventional commit type → changelog section)
  # Use null to skip a type in changelog
  sections:
    feat: Features
    fix: Fixes
    docs: Documentation
    refactor: Refactor
    perf: Performance
    test: Tests
    chore: null

# Commit message format
commit:
  message: "chore: release v{version}"

# Tag format
tag:
  prefix: v  # Results in v1.0.0
  sign: false

# Additional files to include in release commit
include:
  - README.md
  - package.json
```

## 试运行模式

指定 `--dry-run` 时：

```
=== DRY RUN MODE ===

Project detected:
  Version file: package.json (1.2.3)
  Changelogs: CHANGELOG.md (en), CHANGELOG.zh.md (zh)

Last tag: v1.2.3
Proposed version: v1.3.0

Changes grouped by skill/module:
  baoyu-cover-image:
    - feat: add watercolor style
    - feat: add minimalist style
    → Commit: feat(baoyu-cover-image): add watercolor and minimalist styles
    → README updates: options table

  baoyu-comic:
    - fix: panel layout for long dialogues
    → Commit: fix(baoyu-comic): improve panel layout for long dialogues
    → No README updates

Changelog preview (en):
  ## 1.3.0 - 2026-01-22
  ### Features
  - Add watercolor and minimalist styles to cover-image
  ### Fixes
  - Improve panel layout for long dialogues in comic

Changelog preview (zh):
  ## 1.3.0 - 2026-01-22
  ### 新功能
  - 为 cover-image 添加水彩和极简风格
  ### 修复
  - 改进 comic 长对话的面板布局

Commits to create:
  1. feat(baoyu-cover-image): add watercolor and minimalist styles
  2. fix(baoyu-comic): improve panel layout for long dialogues
  3. chore: release v1.3.0

No changes made. Run without --dry-run to execute.
```

## 使用示例

```
/release-skills              # Auto-detect version bump
/release-skills --dry-run    # Preview only
/release-skills --minor      # Force minor bump
/release-skills --patch      # Force patch bump
/release-skills --major      # Force major bump (with confirmation)
/release-skills --backfill-releases  # Create missing GitHub Releases for existing tags
```

## 使用时机

当用户请求以下内容时触发此技能：
- “release”、“发布”、“create release”、“new version”、“新版本”
- “bump version”、“update version”、“更新版本”
- “prepare release”
- “release notes”、“GitHub Release”、“回填 Release”
- “push to remote”（存在未提交更改时）

**重要**：如果用户在存在未提交更改时说“just push”或“直接 push”，仍然必须先遵循上述所有步骤。