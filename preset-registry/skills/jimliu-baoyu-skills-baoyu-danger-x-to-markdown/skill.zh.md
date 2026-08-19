---
name: baoyu-danger-x-to-markdown
description: Converts X (Twitter) tweets and articles to markdown with YAML front matter. Uses reverse-engineered API requiring user consent. Use when user mentions "X to markdown", "tweet to markdown", "save tweet", or provides x.com/twitter.com URLs for conversion.
version: 1.117.3
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-danger-x-to-markdown
    requires:
      anyBins:
        - bun
        - npx
---
# X 转 Markdown

将 X 内容转换为 markdown：
- 推文/线程 → 带有 YAML 前言的 Markdown
- X 文章 → 完整内容提取

## 用户输入工具

当此技能提示用户时，请遵循以下工具选择规则（按优先级排序）：

1. **优先使用当前智能体运行时公开的内置用户输入工具** — 例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等效工具。
2. **回退方案**：如果不存在此类工具，则输出一条编号的纯文本消息，并要求用户针对每个问题回复所选编号/答案。
3. **批量处理**：如果该工具支持单次调用多个问题，请将所有适用的问题合并为一次调用；如果仅支持单个问题，则按优先级逐一提问。

以下具体的 `AskUserQuestion` 引用仅为示例 — 在其他运行时中请替换为本地等效工具。

## 脚本目录

脚本位于 `scripts/` 子目录中。

**路径解析**：
1. `{baseDir}` = 此 SKILL.md 所在的目录
2. 脚本路径 = `{baseDir}/scripts/main.ts`
3. 解析 `${BUN_X}` 运行时：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun

## 同意要求

**在进行任何转换之前**，检查并获取同意。

### 同意流程

**步骤 1**：检查同意文件

```bash
# macOS
cat ~/Library/Application\ Support/baoyu-skills/x-to-markdown/consent.json

# Linux
cat ~/.local/share/baoyu-skills/x-to-markdown/consent.json
```

**步骤 2**：如果 `accepted: true` 且 `disclaimerVersion: "1.0"` → 输出警告并继续：
```
Warning: Using reverse-engineered X API. Accepted on: <acceptedAt>
```

**步骤 3**：如果文件缺失或版本不匹配 → 显示免责声明：
```
DISCLAIMER

This tool uses a reverse-engineered X API, NOT official.

Risks:
- May break if X changes API
- No guarantees or support
- Possible account restrictions
- Use at your own risk

Accept terms and continue?
```

使用 `AskUserQuestion`，选项为："Yes, I accept" | "No, I decline"

**步骤 4**：接受后 → 创建同意文件：
```json
{
  "version": 1,
  "accepted": true,
  "acceptedAt": "<ISO timestamp>",
  "disclaimerVersion": "1.0"
}
```

**步骤 5**：拒绝后 → 输出 "User declined. Exiting." 并停止。

## 偏好设置（EXTEND.md）

按优先级顺序检查 EXTEND.md — 找到的第一个即生效：

| 优先级 | 路径 | 范围 |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-danger-x-to-markdown/EXTEND.md` | 项目 |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-danger-x-to-markdown/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-danger-x-to-markdown/EXTEND.md` | 用户主目录 |

| 结果 | 操作 |
|--------|--------|
| 找到 | 读取、解析并应用设置 |
| 未找到 | **必须**运行首次设置（见下文）— 不得静默创建默认配置 |

**EXTEND.md 支持**：默认下载媒体、默认输出目录。

### 首次设置（阻塞性操作）

**关键**：当未找到 EXTEND.md 时，您**必须使用 `AskUserQuestion`** 在创建 EXTEND.md 之前询问用户的偏好。**绝不**得在未询问的情况下使用默认值创建 EXTEND.md。这是一个**阻塞性**操作 — 在设置完成之前，不得继续进行任何转换。

使用 `AskUserQuestion` 在**一次调用**中询问所有问题：

**问题 1** — 标题："Media"，问题："如何处理推文中的图片和视频？"
- "Ask each time (Recommended)" — 保存 markdown 后，询问是否下载媒体文件
- "Always download" — 始终将媒体文件下载到本地 `imgs/` 和 `videos/` 目录
- "Never download" — 在 markdown 中保留原始远程 URL

**问题 2** — 标题："Output"，问题："默认输出目录？"
- "x-to-markdown (Recommended)" — 保存到 `./x-to-markdown/{username}/{tweet-id}.md`
- （用户可以选择 "Other" 以输入自定义路径）

**问题 3** — 标题："Save"，问题："将偏好设置保存到哪里？"
- "User (Recommended)" — `~/.baoyu-skills/`（所有项目）
- "Project" — `.baoyu-skills/`（仅当前项目）

用户回答后，在所选位置创建 EXTEND.md，确认“偏好设置已保存到 [path]”，然后继续。

完整参考：[references/config/first-time-setup.md](references/config/first-time-setup.md)

### 支持的键

| 键 | 默认值 | 值 | 描述 |
|-----|---------|--------|-------------|
| `download_media` | `ask` | `ask` / `1` / `0` | `ask` = 每次提示，`1` = 始终下载，`0` = 从不下载 |
| `default_output_dir` | 空 | 路径或空 | 默认输出目录（空 = `./x-to-markdown/`） |

**值优先级**：
1. CLI 参数（`--download-media`、`-o`）
2. EXTEND.md
3. Skill 默认值

## 用法

```bash
${BUN_X} {baseDir}/scripts/main.ts <url>
${BUN_X} {baseDir}/scripts/main.ts <url> -o output.md
${BUN_X} {baseDir}/scripts/main.ts <url> --download-media
${BUN_X} {baseDir}/scripts/main.ts <url> --json
```

## 选项

| 选项 | 描述 |
|--------|-------------|
| `<url>` | 推文或文章 URL |
| `-o <path>` | 输出路径 |
| `--json` | JSON 输出 |
| `--download-media` | 将图片/视频资源下载到本地 `imgs/` 和 `videos/`，并将 markdown 链接重写为本地相对路径 |
| `--login` | 仅刷新 Cookie |

## 支持的 URL

- `https://x.com/<user>/status/<id>`
- `https://twitter.com/<user>/status/<id>`
- `https://x.com/i/article/<id>`

## 输出

```markdown
---
url: "https://x.com/user/status/123"
author: "Name (@user)"
tweetCount: 3
coverImage: "https://pbs.twimg.com/media/example.jpg"
---

Content...
```

**文件结构**：`x-to-markdown/{username}/{tweet-id}/{content-slug}.md`

启用 `--download-media` 后：
- 图片会保存到 markdown 文件旁边的 `imgs/`
- 视频会保存到 markdown 文件旁边的 `videos/`
- Markdown 媒体链接会被重写为本地相对路径

## 媒体下载流程

基于 EXTEND.md 中的 `download_media` 设置：

| 设置 | 行为 |
|---------|----------|
| `1`（始终） | 使用 `--download-media` 标志运行脚本 |
| `0`（从不） | 不使用 `--download-media` 标志运行脚本 |
| `ask`（默认） | 遵循以下每次询问流程 |

### 每次询问流程

1. **不使用** `--download-media` 运行脚本 → markdown 已保存
2. 检查已保存的 markdown 是否包含远程媒体 URL（图片/视频链接中的 `https://`）
3. **如果未发现远程媒体** → 完成，无需提示
4. **如果发现远程媒体** → 使用 `AskUserQuestion`：
   - 标题："Media"，问题："将 N 张图片/视频下载到本地文件？"
   - "Yes" — 下载到本地目录
   - "No" — 保留远程 URL
5. 如果用户确认 → **再次**使用 `--download-media` 运行脚本（以本地化链接覆盖 markdown）

## 身份验证

1. **环境变量**（首选）：`X_AUTH_TOKEN`、`X_CT0`
2. **Chrome 登录**（备用）：自动打开 Chrome，并在本地缓存 Cookie

## 扩展支持

通过 EXTEND.md 使用自定义配置。有关路径和支持的选项，请参阅**偏好设置**部分。