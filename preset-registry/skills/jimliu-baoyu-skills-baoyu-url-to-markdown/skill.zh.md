---
name: baoyu-url-to-markdown
description: Fetch any URL and convert to markdown using baoyu-fetch CLI (Chrome CDP with site-specific adapters). Built-in adapters for X/Twitter, YouTube transcripts, Hacker News threads, and generic pages via Defuddle. Handles login/CAPTCHA via interaction wait modes. Use when user wants to save a webpage as markdown.
version: 1.61.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-url-to-markdown
    requires:
      anyBins:
        - bun
---
# URL 转 Markdown

通过 `baoyu-fetch` CLI（Chrome CDP + 特定网站适配器）获取任意 URL，并将其转换为整洁的 Markdown。

## 用户输入工具

当此技能提示用户时，请遵循以下工具选择规则（按优先级排序）：

1. **优先使用**当前 agent 运行时提供的内置用户输入工具——例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等效工具。
2. **回退方案**：如果不存在此类工具，则输出编号的纯文本消息，并要求用户针对每个问题回复所选编号/答案。
3. **批量提问**：如果工具支持每次调用提出多个问题，则将所有适用的问题合并到一次调用中；如果仅支持单个问题，则按优先级顺序逐一提问。

以下具体的 `AskUserQuestion` 引用仅作为示例——在其他运行时中，请替换为本地等效工具。

## CLI 设置

**重要**：CLI 源代码位于 `{baseDir}/scripts/lib`。`scripts/package.json` 仅安装第三方运行时依赖。

**Agent 执行说明**：
1. 将此 SKILL.md 文件所在的目录路径确定为 `{baseDir}`
2. 解析 `${BUN}` 运行时：如果已安装 `bun` → `bun`；否则建议安装 Bun
3. 如果 `{baseDir}/scripts/node_modules` 不存在，则运行 `${BUN} install --cwd {baseDir}/scripts`
4. `${READER}` = `{baseDir}/scripts/baoyu-fetch`
5. 将本文档中的所有 `${READER}` 替换为解析后的值

## 偏好设置（EXTEND.md）

按优先级顺序检查 EXTEND.md——使用找到的第一个文件：

| 优先级 | 路径 | 范围 |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-url-to-markdown/EXTEND.md` | 项目 |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-url-to-markdown/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-url-to-markdown/EXTEND.md` | 用户主目录 |

| 结果 | 操作 |
|--------|--------|
| 找到 | 读取、解析并应用设置 |
| 未找到 | **必须**运行首次设置（见下文）——不要静默创建默认设置 |

**EXTEND.md 支持**：默认下载媒体、默认输出目录。

### 首次设置 ⛔ 阻塞性要求

当未找到 EXTEND.md 时，**必须**使用 `AskUserQuestion` 收集偏好，然后才能创建 EXTEND.md。**绝不要**使用静默默认值创建 EXTEND.md。设置完成前禁止生成。将以下三个问题批量合并到一次调用中：

- **Q1 — 媒体**（标题为 "Media"）："如何处理页面中的图片和视频？"
  - "每次询问（推荐）" — 每次保存后进行提示
  - "始终下载" — 下载到本地的 `imgs/` 和 `videos/`
  - "从不下载" — 保留远程 URL
- **Q2 — 输出**（标题为 "Output"）："默认输出目录是什么？"
  - "url-to-markdown（推荐）" — 保存到 `./url-to-markdown/{domain}/{slug}.md`
  - 用户可以选择 "Other" 并输入自定义路径
- **Q3 — 保存**（标题为 "Save"）："将偏好设置保存到哪里？"
  - "用户（推荐）" — `~/.baoyu-skills/`（所有项目）
  - "项目" — `.baoyu-skills/`（仅限此项目）

回答后，写入 EXTEND.md，确认“偏好设置已保存到 [path]”，然后继续。

完整模板：[references/config/first-time-setup.md](references/config/first-time-setup.md)。

### 支持的键

| 键 | 默认值 | 值 | 描述 |
|-----|---------|--------|-------------|
| `download_media` | `ask` | `ask` / `1` / `0` | `ask` = 每次提示，`1` = 始终，`0` = 从不 |
| `default_output_dir` | empty | 路径或 empty | 默认输出目录（empty = `./url-to-markdown/`） |

**EXTEND.md → CLI 映射**：

| EXTEND.md 键 | CLI 参数 | 备注 |
|---------------|-------------|-------|
| `download_media: 1` | `--download-media` | 需要设置 `--output` |
| `default_output_dir: ./posts/` | Agent 构造 `--output ./posts/{domain}/{slug}.md` | Agent 生成路径，而不是使用直接标志 |

**值的优先级**：CLI 参数 → EXTEND.md → skill 默认值。

## 用法

```bash
# Default: headless capture, markdown to stdout
${READER} <url>

# Save to file
${READER} <url> --output article.md

# Save with media download
${READER} <url> --output article.md --download-media

# Wait for interaction (login/CAPTCHA) — auto-detect and continue
${READER} <url> --wait-for interaction --output article.md

# Wait for interaction — manual control (Enter to continue)
${READER} <url> --wait-for force --output article.md

# JSON output
${READER} <url> --format json --output article.json

# Force specific adapter
${READER} <url> --adapter youtube --output transcript.md
```

## 选项

| 选项 | 描述 |
|--------|-------------|
| `<url>` | 要获取的 URL |
| `--output <path>` | 输出文件路径（默认：stdout） |
| `--format <type>` | 输出格式：`markdown`（默认）或 `json` |
| `--json` | `--format json` 的简写 |
| `--adapter <name>` | 强制使用适配器：`x`、`youtube`、`hn` 或 `generic`（默认：自动检测） |
| `--headless` | 强制使用无头 Chrome（不显示窗口） |
| `--wait-for <mode>` | 交互等待模式：`none`（默认）、`interaction` 或 `force` |
| `--wait-for-interaction` | `--wait-for interaction` 的别名 |
| `--wait-for-login` | `--wait-for interaction` 的别名 |
| `--timeout <ms>` | 页面加载超时（默认：30000） |
| `--interaction-timeout <ms>` | 登录/CAPTCHA 等待超时（默认：600000 = 10 分钟） |
| `--interaction-poll-interval <ms>` | 交互检查的轮询间隔（默认：1500） |
| `--download-media` | 将图片/视频下载到本地 `imgs/` 和 `videos/`，并重写 markdown 链接。需要 `--output` |
| `--media-dir <dir>` | 下载媒体的基础目录（默认：与 `--output` 目录相同） |
| `--cdp-url <url>` | 复用现有的 Chrome DevTools Protocol 端点 |
| `--browser-path <path>` | 自定义 Chrome/Chromium 二进制文件路径 |
| `--chrome-profile-dir <path>` | Chrome 用户数据目录（默认：`BAOYU_CHROME_PROFILE_DIR` 环境变量指定的目录或 `./baoyu-skills/chrome-profile`） |
| `--debug-dir <dir>` | 写入调试产物（document.json、markdown.md、page.html、network.json） |

## Agent 质量门槛

**关键**：将默认的无头捕获视为临时结果。某些网站在无头模式下的渲染方式不同，可能会在 CLI 未失败的情况下静默返回低质量内容。

每次无头运行后，检查保存的 markdown。完整检查清单、恢复工作流和捕获模式表请参阅 [references/quality-gate.md](references/quality-gate.md)。每当运行结果看起来可疑，或用户询问登录/CAPTCHA 处理方式时，都要阅读该文档。

## 输出路径生成

代理必须构造输出文件路径——`baoyu-fetch` 不会自动生成路径。

**算法**：
1. 从 EXTEND.md 的 `default_output_dir` 或默认值 `./url-to-markdown/` 确定基础目录
2. 从 URL 中提取域名（例如 `example.com`）
3. 根据 URL 路径或页面标题生成 slug（kebab-case，2-6 个单词）
4. 构造：`{base_dir}/{domain}/{slug}/{slug}.md`——每个 URL 使用独立目录，以确保媒体文件彼此隔离
5. 冲突处理：追加时间戳 `{slug}-YYYYMMDD-HHMMSS/{slug}-YYYYMMDD-HHMMSS.md`

将构造的路径传递给 `--output`。媒体文件（`--download-media`）会保存到 markdown 文件旁边的子目录中，从而使每个 URL 的资源彼此独立。

## 适配器与媒体

适配器目录（X、YouTube、Hacker News、通用适配器）、各适配器的注意事项、媒体下载流程（`ask` / always / never）以及 JSON 输出架构请参阅 [references/adapters.md](references/adapters.md)。在回答适配器相关问题或处理媒体提示之前，请阅读该文档。

## 环境变量

| 变量 | 描述 |
|----------|-------------|
| `BAOYU_CHROME_PROFILE_DIR` | Chrome 用户数据目录（也可以使用 `--chrome-profile-dir`） |

**故障排除**：找不到 Chrome → 使用 `--browser-path`。超时 → 增大 `--timeout`。登录/CAPTCHA → `--wait-for interaction`。调试 → 使用 `--debug-dir` 检查捕获的 HTML 和网络日志。

## 扩展支持

通过 EXTEND.md 使用自定义配置。路径和支持的键请参阅上方的**首选项**部分。