---
name: utility-update-pm-skills
description: >-
  Checks for newer pm-skills releases, compares local vs. latest version,
  previews what would change, and updates local files after user confirmation.
  Generates a structured update report documenting changed files, new
  capabilities, and the value delta between versions. Use when you want to
  bring a local pm-skills installation up to date.
classification: utility
version: "1.0.0"
updated: 2026-04-09
license: Apache-2.0
metadata:
  category: coordination
  frameworks: [triple-diamond]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->

# PM Skills 更新器

此技能会将本地 pm-skills 安装更新到最新公开版本。它会验证连接性、比较版本、预览变更，并生成一份结构化报告，记录已更新的内容以及可用的新功能。

## 使用时机

- 想要将本地 pm-skills 更新到最新版本时
- 想要检查是否有更新版本可用时
- 宣布新的 pm-skills 版本后
- 在开始使用时，想要确认自己拥有最新版本

## 不要使用的情况

- 创建或编辑单个技能 -> 使用 `/pm-skill-builder` 或 `/pm-skill-iterate`
- 根据约定验证技能 -> 使用 `/pm-skill-validate`
- 如果你是直接在 pm-skills 仓库上工作的维护者（使用 git）
- 固定使用某个较旧版本（此技能始终以最新版本为目标）

## 标志

| 标志 | 行为 |
|------|----------|
| *(无)* | 完整更新流程：预检 → 预览 → 确认 → 更新 → 报告 |
| `--report-only` | 预检 → 预览 → 报告（不写入文件） |
| `--status` | 轻量级版本检查 - 打印当前版本和最新版本，然后停止 |

### `--status` 行为

提供 `--status` 时，只运行预检并显示：

```
pm-skills v{local} (installed, from {source})
pm-skills v{latest} (latest, released {date})
{Status: up to date | update available ({type})}

Run /update-pm-skills for details, or /update-pm-skills --report-only for a preview.
```

不会生成报告文件。不会写入任何文件。

## 说明

当要求更新 pm-skills（不带 `--status`）时，按以下步骤操作：

### 步骤 1：预检

继续之前运行三项检查：

1. **网络访问**：访问 GitHub API 或仓库 URL
   (`https://github.com/product-on-purpose/pm-skills`)。使用任何可用的方法：`curl`、`wget`、GitHub CLI（`gh`）或 MCP 工具。

2. **最新版本**：使用以下回退链查询最新版本（按顺序逐一尝试，使用第一个成功的方法）：
   1. GitHub API：`GET /repos/product-on-purpose/pm-skills/releases/latest`
   2. GitHub CLI：`gh release list --repo product-on-purpose/pm-skills --limit 1`
   3. Git：`git ls-remote --tags https://github.com/product-on-purpose/pm-skills.git`

   如果三种方法全部失败（速率限制、404、响应格式错误、无网络），则进入降级模式（见下文）。

   记录：版本字符串、发布日期、发布说明 URL、发布说明正文。

3. **本地版本**：从第一个可用的来源读取：
   - `.claude-plugin/plugin.json` → `version` 字段
   - `marketplace.json` → `plugins[0].version` 字段
   - `CHANGELOG.md` → 最近的版本标题
   - Git 标签 → 最近的 `v*` 标签

   **版本解析：** 移除可选的 `v` 前缀并去除首尾空白，以进行规范化。如果某个来源存在，但得到的字符串为空、不是 semver 或格式错误（JSON 无效、缺少字段），则跳过该来源并发出警告，然后尝试下一个来源。只有在四个来源全部失败后，才回退到 `0.0.0`。

**如果网络访问失败**（降级模式）：
- 报告失败及错误详情。
- 提供手动更新说明：
  > 访问 https://github.com/product-on-purpose/pm-skills/releases
  > 下载最新版本。解压归档，并将
  > `skills/`、`commands/`、`_workflows/` 以及其他内容目录
  > 复制到本地的 pm-skills 安装目录。
- 停止执行。

### 步骤 2：版本比较

使用 semver 将本地版本与最新版本进行比较。

**如果本地版本 >= 最新版本：**
- 报告："你的 pm-skills 安装已是最新版本（v{local}）。"
- 提供仍然生成一份仅报告的选项。
- 停止执行。

**如果本地版本 < 最新版本：**
- 显示版本差异：
  ```
  Local version:  v{local}
  Latest version: v{latest}
  Update type:    {major | minor | patch}
  ```
- **主版本警告**：如果更新是主版本升级（例如从 v2.x
  升级到 v3.x），显示醒目的警告：
  > 这是一次主版本更新，可能包含对技能契约的破坏性变更。
  > 请在继续之前查看发行说明。
- 继续执行步骤 3。

### 步骤 3：预览

向用户展示更新内容：

1. **版本差异**：本地版本、最新版本、更新类型。

2. **价值摘要**：根据两个版本之间的 CHANGELOG 条目、GitHub 发行说明
   和目录差异（新增的 skills/、新增的 _workflows/ 文件）得出：
   - 新增的技能及其支持的功能
   - 更新的技能及改进之处
   - 新增的工作流及其连接的内容
   - 其他值得注意的变更

3. **文件清单**：按目录分组列出将要写入的文件和文件夹，并显示数量：
   ```
   Files to be written:
     skills/       31 files (2 new, 29 updated)
     commands/     38 files (2 new, 36 updated)
     _workflows/    9 files (1 new, 8 updated)
     other          7 files
     Total:        85 files
   ```

**如果使用 `--report-only`：** 使用 `references/TEMPLATE.md` 生成报告，并添加横幅
"仅报告 - 未应用更新。"将其保存到
`_pm-skills/updates/update-report_v{latest}_report-only_{YYYY-MM-DD_HHMMSS}.md`。停止
执行。

### 步骤 4：确认

询问用户两个决定：

1. **更新确认**：
   "这些文件将被覆盖。是否继续？[yes / no]"
   - 如果是主版本升级：必须明确输入 "yes"。
   - 如果用户拒绝：保存一份仅报告并停止。

2. **备份选项**：
   "是否在更新前创建当前文件的备份？
   [yes (推荐) / no]"
   - 如果选择 yes：将所有范围内的文件复制到
     `_pm-skills/backups/v{current}_{YYYY-MM-DD_HHMMSS}/`
   - 如果不存在，则创建 `_pm-skills/` 目录。

### 步骤 5：更新

通过先验证再复制并创建备份来执行更新：

1. **下载**：从 GitHub Release 页面将发行版 ZIP 资源（`pm-skills-vX.Y.Z.zip`）
   获取到临时目录。这是由 `build-release.sh` 生成的精选构建产物——其中仅包含面向用户的内容，
   不包含 `docs/internal/`。

2. **验证**：确认解压后的归档包含 `skills/`、
   `commands/`、`AGENTS.md` 和 `.claude-plugin/plugin.json`。如果验证失败，
   报告错误并停止，不写入任何文件。

3. **复制**：将解压归档中的范围内文件覆盖到安装根目录。按目录显示进度：
   ```
   Updating pm-skills v2.9.0 -> v2.10.0...
     skills/       31/31 ████████████████████  done
     commands/     38/38 ████████████████████  done
     _workflows/    9/9  ████████████████████  done
     other files    7/7  ████████████████████  done
   ```

4. **清理**：删除临时目录。

### 第 6 步：更新后操作

1. **冒烟测试**：
   - 版本一致性：`plugin.json`、`marketplace.json` 和
     `CHANGELOG.md` 都反映新版本。（注意：第 1 步中的版本检测采用首次匹配；
     冒烟测试会验证所有来源是否一致。此处不一致表示发布打包可能存在问题。）
   - 文件完整性：`AGENTS.md`、`skills/`、`commands/`、
     `_workflows/` 均存在。
   - 技能数量变化：分别统计更新前后的技能数量，并报告变化。
   - 如果任何检查失败：向用户发出警告并提供具体详情。**不要**自动回滚。提供恢复指导：
     - **版本不一致**："Run the update again, or manually edit
       {file} to set the version to {expected}."
     - **文件缺失**："Re-run `/update-pm-skills` to re-download,
       or restore from backup: `cp -r _pm-skills/backups/{dir}/* .`"
     - **如果存在备份**：始终提醒用户备份位置和恢复命令。

2. **摘要行**：显示一行便于快速查看的确认信息：
   ```
   Updated v{old} -> v{new} | +{n} skills, +{n} workflows | Report: _pm-skills/updates/{file}
   ```

3. **完成报告**：使用 `references/TEMPLATE.md` 生成，
   并保存到 `_pm-skills/updates/update-report_v{from}-to-v{to}_{YYYY-MM-DD_HHMMSS}.md`

4. **MCP 提示**：如果 `../pm-skills-mcp/` 存在，尝试读取
   `pm-skills-source.json`。如果文件缺失或格式错误，显示：
   "pm-skills-mcp detected but pm-skills-source.json not found or
   unreadable. Check the MCP repo manually." 如果可读，显示：
   ```
   pm-skills-mcp detected at ../pm-skills-mcp/
     Embedded skills version: v{embedded}
     Updated pm-skills version: v{new}

     To update the MCP server's embedded skills:
       cd ../pm-skills-mcp && npm run embed-skills && npm run build
   ```

5. **后续步骤**：
   ```
   Next Steps:
   - Review the update report at _pm-skills/updates/{report-file}
   - Run /pm-skill-validate --all to verify skill integrity
   - Run local CI: bash scripts/lint-skills-frontmatter.sh
   - Check release notes: {release-url}
   ```

## 文件范围

更新程序只写入发布 ZIP 资源（`pm-skills-vX.Y.Z.zip`）中存在的文件；
该 ZIP 是由 `build-release.sh` 生成的精选构建产物。ZIP 排除了
`docs/internal/` 和其他面向非用户的内容——复制时无需任何排除逻辑。

**发布 ZIP 中包含的文件（已更新）：**

| 路径 | 原因 |
|------|-----------|
| `skills/` | 核心 skill 文件 |
| `commands/` | 斜杠命令定义 |
| `_workflows/` | 工作流链 |
| `library/` | 示例库和 skill 输出示例（注意：用户添加的示例可能会被覆盖） |
| `AGENTS.md` | IDE 的 skill 发现 |
| `.claude-plugin/plugin.json` | 版本和插件元数据 |
| `marketplace.json` | Marketplace 元数据 |
| `CHANGELOG.md` | 发布历史 |
| `README.md` | 公共文档 |
| `docs/`（公共指南、参考文档、工作流） | 面向用户的文档 |
| `scripts/` | CI/验证脚本 |
| `mkdocs.yml` | 文档站点配置 |

**发布 ZIP 中不包含的文件（绝不会被覆盖）：**

| 路径 | 原因 |
|------|-----------|
| `docs/internal/` | 被 `build-release.sh` 从 ZIP 中排除 |
| `_NOTES/` | 仅限本地使用，由 gitignore 忽略，不在 ZIP 中 |
| `_pm-skills/` | 本地状态（报告、备份），不在 ZIP 中 |
| `.github/` | CI 工作流，不在 ZIP 中 |
| `CONTRIBUTING.md`、`LICENSE` | 不在 ZIP 中（仓库级文件） |

## 输出约定

该 skill 必须：
- 在执行任何远程操作前验证网络访问
- 在写入任何文件前显示预览
- 在覆盖文件前要求用户明确确认
- 在覆盖文件前提供备份选项
- 使用先验证后复制的方式（下载到临时位置，验证后再复制；备份是复制过程中发生失败时的恢复路径）
- 在两种模式下都生成报告（仅报告模式和完成模式）
- 运行更新后的冒烟测试
- 检测到同级仓库时显示 MCP 提示

该 skill 不得：
- 未经用户确认写入文件
- 未确认网络访问就继续执行
- 修改 pm-skills 目录之外的文件
- 使用上游内容修改 `docs/internal/`、`_NOTES/` 或 `_pm-skills/`
- 在冒烟测试失败时自动回滚（应告知用户）
- 删除上游发布版本中不存在的本地文件

## 质量检查清单

在将更新标记为完成前，验证：

- [ ] 预检已通过：网络、已检测到的版本
- [ ] 在写入任何文件前已向用户显示预览
- [ ] 用户已明确确认后才继续执行更新
- [ ] 已提供备份选项（如用户接受则已创建）
- [ ] 已将归档下载到临时位置，并在复制前完成验证
- [ ] 所有范围内的文件均已成功写入
- [ ] 版本一致性：plugin.json、marketplace.json、CHANGELOG 匹配
- [ ] 文件完整性：AGENTS.md、skills/、commands/、_workflows/ 存在
- [ ] 已报告 skill 数量变化（更新前 -> 更新后）
- [ ] 报告已生成并保存到 `_pm-skills/updates/`
- [ ] 如果检测到同级仓库，已显示 MCP 提示
- [ ] 已提供后续步骤
- [ ] 已显示摘要行

## 常见问题

**我是克隆了仓库的贡献者。我应该使用这个 skill 吗？**
不应该。请改用 `git pull` 或 `git fetch && git merge`。此 skill
面向已将 pm-skills 安装为插件或下载了发布版本的最终用户。

**我可以更新到特定版本，而不是最新版本吗？**
v1 中不可以。此 skill 始终针对最新发布版本。要安装特定版本，请
从发布页面手动下载。

**我的本地笔记和规划文档会怎样？**  
它们绝不会被修改。该 skill 明确排除了 `docs/internal/`、  
`_NOTES/` 和 `_pm-skills/`，不会对这些目录进行更新。请参阅文件范围表。

**我添加的、不在上游版本中的文件会怎样？**  
它们不会被修改。该 skill 只会覆盖新版本中存在的文件——绝不会删除本地文件。

**如何撤销更新？**  
如果你创建了备份（默认会提供此选项），请恢复备份：  
`cp -r _pm-skills/backups/v{version}_{timestamp}/* .`  
如果你没有创建备份但使用了 git，请使用 `git checkout .`  
将已跟踪文件恢复到最近一次提交时的状态。

**更新过程中途失败了。我该怎么办？**  
该 skill 会在复制前进行验证（下载到临时位置、检查，然后写入），  
因此部分失败的情况很少发生。如果确实发生了：有可用备份时请从备份恢复，  
或者重新运行 `/update-pm-skills` 进行重试。

## 延伸阅读

如需查看可视化操作演示和更多背景信息，请参阅  
[更新 PM Skills 指南](../../docs/guides/updating-pm-skills.md)。