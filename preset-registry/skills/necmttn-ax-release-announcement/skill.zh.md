---
name: release-announcement
description: Draft or revise ax release announcements and website changelog pages. Triggers when the user says "write release notes", "draft release announcement", "prepare changelog", "release page", "version page", "what changed in vX.Y.Z", "generate announcement for vX.Y.Z", or asks for a release narrative. Uses Release Please range evidence, git changed files/commits, and ax sessions/recall to explain how the release got there. Do NOT trigger for ordinary commit messages or unrelated docs.
role: framing
---
# ax:release-announcement

编写基于实际发布范围及生成该版本的代理会话的发布公告。此技能负责维护
`docs/releases/` 下的精选内容层；`CHANGELOG.md` 仍由 Release Please 负责。

假定 `ax` 已位于 PATH 中，且本地 ax 数据库可访问。如果 `ax` 因数据库连接错误
而失败，请告知用户启动仓库数据库；只有在用户提出要求时，才仅依据 git 证据继续操作。

## 何时触发

以下情况使用此技能：

- “编写发布说明”/“起草发布公告”
- “准备变更日志”/“更新网站变更日志”
- “发布页面”/“版本页面”/“SEO 发布页面”
- “vX.Y.Z 中有哪些变更”
- “为 vX.Y.Z 生成公告”
- “解释我们如何推进到此版本”

不要将此技能用于单条提交消息、常规 README 编辑或
非发布类功能文档。

## 工作流程

### 1. 确定版本和范围

如果版本已知：

```bash
bun run release:announcement -- X.Y.Z
```

此命令会起草 `docs/releases/vX.Y.Z.md`，并且当存在 Release Please 比较
标题时，嵌入：

- 上一个发布标签（`BASE_REF`）
- 发布标签或 `HEAD`（`HEAD_REF`）
- `git diff --name-status "$BASE_REF..$HEAD_REF"`
- `git log --reverse --format='%h %cs %s' "$BASE_REF..$HEAD_REF"`

如果需要手动检查：

```bash
BASE_REF=<previous-release-tag>
HEAD_REF=<release-head-or-tag>
git diff --name-status "$BASE_REF..$HEAD_REF"
git log --reverse --format='%h %cs %s' "$BASE_REF..$HEAD_REF"
```

### 2. 将提交和文件映射到代理会话

使用文件列表识别受影响的子系统。使用提交列表选取
重要的 SHA。然后查询 ax：

```bash
ax ingest here --since=30d
ax sessions here --days=30
ax sessions near <important-sha>
ax recall "<subsystem or decision>" --sources=turn,commit --scope=here
```

对于大型发布，至少检查：

- 每个主要主题对应的一个 SHA
- 每项主要 schema/API/CLI 变更附近的一个 SHA
- 与意外的错误修复或方案回退相关的任何 SHA
- 合并/发布 PR 附近的会话时间窗口（如果可用）

### 3. 编写公告

用按主题组织的叙述替换生成的草稿。保持简洁，但要确保
内容实用：

- **我们如何走到这一步**——问题、决策树、权衡，以及最终方案
  胜出的原因。在正文中引用会话/提交证据。
- **变更内容**——按主题分组，而不是使用一个扁平的提交列表。
- **示例**——当发布改变了行为时，提供 CLI 命令、配置片段、输出示例、schema 片段，
  或变更前后的工作流程。
- **视觉证据**——当 UI、CLI、仪表板、TUI 或工作流程通过视觉形式更容易理解时，
  提供截图、图表或输出捕获。
- **重要意义**——对日常工作的实际影响。

不要臆造动机。如果缺少 ax 会话证据，请说明提交和变更文件
能够证明的内容，并适当缩小叙述范围。

### 4. 资源与渲染

将网站可见的发布图片放在此处：

```text
apps/site/public/releases/assets/
```

在发布 Markdown 中引用它们：

```md
![Focused release screenshot](/releases/assets/vX.Y.Z-topic.png)
```

网站的发布内容渲染器支持标题、列表、链接、加粗范围、
围栏代码块和图片。请使用这些语法，而不是手写 HTML。

### 5. 验证

运行：

```bash
bun run typecheck
cd site && bun run build
```

如果页面发生了更改，请预览并对特定版本页面进行冒烟测试：

```bash
cd site
bun run preview -- --host 127.0.0.1 --port 4175
```

检查 `/changelog` 和 `/changelog/vX.Y.Z`。