---
name: baoyu-post-to-x
description: Posts content and articles to X (Twitter). Supports regular posts with images/videos and X Articles (long-form Markdown). In Codex, honor explicit requests for the Codex Chrome plugin/@chrome by using the Chrome Extension workflow; otherwise use Chrome Computer Use when available and fall back to real Chrome CDP scripts only when allowed. Use when user asks to "post to X", "tweet", "publish to Twitter", or "share on X".
version: 1.58.1
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-post-to-x
    requires:
      anyBins:
        - bun
        - npx
---
# 发布到 X（Twitter）

通过真实的 Chrome 浏览器向 X 发布文本、图片、视频和长篇文章。

在 Codex 中，请勿混淆以下浏览器路径：
- **Codex Chrome 插件 / `@chrome` / Chrome 扩展程序**：使用随附的 `chrome:Chrome` skill 及其 Node REPL 浏览器客户端。只要用户提到“Codex Chrome plugin”、“Codex 自带的 Chrome 插件”、`@chrome` 或类似说法，就必须使用此路径。
- **Chrome Computer Use**：仅当用户要求使用 Computer Use，或未说明 Chrome 插件偏好且 Computer Use 可用时，才针对可见的 Google Chrome UI 使用 `mcp__computer_use__.*`。
- **CDP 脚本模式**：仅在所选模式不可用或用户明确要求 CDP/脚本模式时作为回退方案使用。

## 脚本目录

**重要**：所有脚本均位于此 skill 的 `scripts/` 子目录中。

**Agent 执行说明**：
1. 确定此 SKILL.md 文件的目录路径，将其记为 `{baseDir}`
2. 脚本路径 = `{baseDir}/scripts/<script-name>.ts`
3. 将本文档中的所有 `{baseDir}` 替换为实际路径
4. 解析 `${BUN_X}` 运行时：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun

**脚本参考**：
| 脚本 | 用途 |
|--------|---------|
| `scripts/x-browser.ts` | 常规发布（文本 + 图片），CDP 回退 |
| `scripts/x-video.ts` | 视频发布（文本 + 视频），CDP 回退 |
| `scripts/x-quote.ts` | 带评论的引用推文，CDP 回退 |
| `scripts/x-article.ts` | 长篇文章发布（Markdown），CDP 回退 |
| `scripts/md-to-html.ts` | Markdown → HTML 转换 |
| `scripts/copy-to-clipboard.ts` | 将内容复制到剪贴板 |
| `scripts/paste-from-clipboard.ts` | 发送真实的粘贴按键操作 |
| `scripts/check-paste-permissions.ts` | 验证环境和权限 |

## 执行模式选择（必需）

在与 X 交互之前，必须恰好选择一种模式：

1. 如果用户明确要求使用 Codex Chrome 插件、`@chrome`、Chrome 扩展程序或“Codex 自带的 Chrome 插件”，请使用 **Codex Chrome 插件模式**。请勿先调用 Computer Use。
2. 如果用户明确要求使用 Chrome Computer Use，请使用 **Chrome Computer Use 模式**。未经告知用户并获得批准，不得回退到 CDP、Playwright、应用内 Browser 或 Chrome 插件。
3. 如果用户明确要求使用 CDP/脚本模式，请使用 **CDP 脚本模式**。
4. 否则，优先使用 **Chrome Computer Use 模式**。对于包含本地内容图片的 Markdown **X Articles**，请使用经过测试的 X 编辑器流程：在每个占位符位置，通过工具栏插入每张正文图片（`Insert` -> `Media` -> 对话框图标按钮 `Add photos or video`），然后删除占位符文本。仅当所选浏览器控制模式不可用，或 UI 上传/选择流程不可靠时，才使用 CDP 脚本模式。

绝不使用应用内 Browser 处理 X 发布工作流。

## Codex Chrome 插件模式

只要用户请求使用 Codex Chrome 插件、`@chrome` 或 Chrome Extension 路径，就使用此模式。此模式通过随附的 Chrome 插件使用用户真实的 Chrome 配置文件和 X 登录状态，而非 Computer Use 或 CDP。

**设置**
1. 在进行浏览器操作前加载 `chrome:Chrome` skill。
2. 如果 Node REPL `js` 工具尚未显示，请使用 `tool_search` 查找 `node_repl js`。
3. 严格按照 Chrome skill 的指定方式初始化 Chrome 浏览器客户端，然后运行一个轻量调用，例如 `browser.user.openTabs()`，以验证扩展连接。
4. 如果第一次轻量调用失败，等待 2 秒后重试一次。如果仍然失败，请按照 Chrome skill 的扩展检查和恢复步骤操作。如果检查通过但通信仍然失败，请在打开新的 Chrome 窗口前询问用户。不要悄悄切换到 Computer Use 或 CDP。

**通用规则**
- 对于 X UI 操作，使用 Chrome 插件的 `browser.tabs.*`、`tab.playwright.*`、`tab.cua.*` 和文件选择器 API。
- 允许使用 Shell 命令进行 Markdown 预处理和富 HTML 剪贴板准备。对于 X Article 正文中的图片，不要依赖图片剪贴板粘贴；应使用编辑器的 `Insert` -> `Media` 上传流程。
- 如果文件上传失败并显示 `Not allowed`，请告知用户：`To enable file upload, go to chrome://extensions in Chrome, click Details under the Codex extension, and enable "Allow access to file URLs." See https://developers.openai.com/codex/app/chrome-extension#upload-files for details.`
- 如果 Chrome 插件报告 `native pipe is closed`，请在 2 秒后重试一次轻量浏览器调用，然后运行 Chrome skill 的健康检查。如果 Chrome 正在运行、扩展已启用且 native host manifest 正确，请请求允许打开新的 Chrome 窗口并重试。不要继续通过损坏的管道发送浏览器操作。
- 未经用户在当前对话中明确的最终确认，绝不要点击 `Publish`、`Post` 或任何对外可见的提交操作。

**X Articles**
1. 转换 Markdown 并保留图片映射：
   ```bash
   ${BUN_X} {baseDir}/scripts/md-to-html.ts article.md --save-html /tmp/x-article-body.html > /tmp/x-article.json
   ```
2. 读取 JSON 输出中的 `title`、`coverImage` 和 `contentImages`（`placeholder` → `localPath`）。
3. 打开或创建位于 `https://x.com/compose/articles` 的文章草稿。
4. 使用 Chrome 插件文件选择器流程上传封面。如果扩展权限阻止上传，请停止操作并报告上面给出的确切权限修复方法。
5. 填写标题，然后复制富 HTML：
   ```bash
   ${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts html --file /tmp/x-article-body.html
   ```
6. 通过 Chrome 插件使用真实的粘贴按键将内容粘贴到文章正文中。在 macOS 上使用 `Meta+V`。
7. 验证编辑器文本包含文章正文和 `XIMGPH_` 占位符。不要将 `tab.clipboard.readText()` 作为 Shell 写入剪贴板后系统剪贴板内容的依据；如有需要，在 macOS 上使用 `pbpaste` 进行验证。
8. 对于按占位符顺序排列的每个 `contentImages` 项：
   - 定位可见的占位符文本（`XIMGPH_N`），并点击它以将光标置于该处。
   - 打开工具栏菜单 `Insert` -> `Media`。
   - 在模态框中，点击带有 `aria-label="Add photos or video"` 的图标按钮；不要点击文本/拖放区域或隐藏的文件输入框。
   - 使用文件选择器上传该图片的 `localPath`。
   - 图片出现后，如果 `XIMGPH_N` 仍位于图片上方，先准确选中该占位符并按 `Delete`。仅当 `Delete` 失败且已确认选中的文本正好是该占位符时，才使用 `Backspace`。
   - 验证该 `XIMGPH_N` 的占位符数量为 `0`。
9. 打开预览，并验证标题、封面、正文、链接和图片。
10. 在点击 `Publish` 前请求明确确认。

## 偏好设置（EXTEND.md）

按优先级顺序检查 EXTEND.md —— 找到的第一个文件生效：

| 优先级 | 路径 | 作用域 |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-post-to-x/EXTEND.md` | 项目 |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-post-to-x/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-post-to-x/EXTEND.md` | 用户主目录 |

如果都未找到，则使用默认设置。

**EXTEND.md 支持**：默认 Chrome 配置文件

## 前置条件

- Google Chrome 或 Chromium
- `bun` 运行时
- 首次运行：手动登录 X（会保存会话）

## 运行前检查（可选）

首次使用前，建议运行环境检查。用户可以选择跳过。

```bash
${BUN_X} {baseDir}/scripts/check-paste-permissions.ts
```

检查项目：Chrome、配置文件隔离、Bun、辅助功能、剪贴板、粘贴快捷键、Chrome 冲突。

**如果任何检查失败**，请根据以下项目提供修复指导：

| 检查项 | 修复方法 |
|-------|-----|
| Chrome | 安装 Chrome，或设置 `X_BROWSER_CHROME_PATH` 环境变量 |
| 配置文件目录 | 位于 `baoyu-skills/chrome-profile` 的共享配置文件（参见 CLAUDE.md 中的 Chrome Profile 部分） |
| Bun 运行时 | `brew install oven-sh/bun/bun`（macOS）或 `npm install -g bun` |
| 辅助功能（macOS） | 系统设置 → 隐私与安全性 → 辅助功能 → 启用终端应用 |
| 复制到剪贴板 | 确保 Swift/AppKit 可用（macOS Xcode 命令行工具：`xcode-select --install`） |
| 粘贴快捷键（macOS） | 同上面的辅助功能修复方法 |
| 粘贴快捷键（Linux） | 安装 `xdotool`（X11）或 `ydotool`（Wayland） |

## 参考资料

- **常规帖子**：参见 `references/regular-posts.md`，了解手动工作流、故障排查和技术细节
- **X Articles**：参见 `references/articles.md`，了解长篇文章发布指南

---

## Chrome 计算机使用模式

当用户明确要求使用 Chrome 计算机使用模式，或者未指定 Chrome 插件偏好且 Codex 可以通过计算机使用控制 `Google Chrome` 时，使用此模式。此模式使用用户现有的 Chrome 窗口、Cookie、登录状态、扩展和 X 会话。

**一般规则**：
- 每个控制 Chrome 的助手回合都必须先调用 `get_app_state` 获取 `Google Chrome` 的状态。
- 可用时优先使用元素索引操作；仅在编辑器中选择文本或拖动选择时使用坐标。
- 在此模式下，除非用户批准切换模式，否则不得使用内置 Browser、Chrome 插件、Playwright 或 CDP 执行 X UI 操作。
- 未经用户在当前对话中明确进行最终确认，绝不得点击 `Publish`、`Post` 或任何对外可见的提交操作。

**常规帖子**：
1. 打开 Chrome 或导航至 `https://x.com/compose/post`。
2. 使用计算机使用功能将帖子文本输入编辑器。
3. 对于每张图片，运行：
   ```bash
   ${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts image /absolute/path/to/image.png
   ```
4. 使用计算机使用功能粘贴（macOS 使用 `super+v`，Windows/Linux 使用 `control+v`），然后等待 X 完成媒体上传。
5. 在点击 `Post` 前请求确认。

**视频帖子**：
1. 在 Chrome 中打开或导航至 `https://x.com/compose/post`。
2. 在编辑器中输入帖子文本。
3. 使用可见的媒体上传/文件选择器界面附加视频。
4. 等待上传和处理完成。
5. 在点击 `Post` 之前请求确认。

**引用推文**：
1. 在 Chrome 中打开推文 URL。
2. 使用可见的引用/转发界面选择 Quote。
3. 输入评论。
4. 在点击 `Post` 之前请求确认。

**X Articles**：
1. 转换 Markdown 并保留图片映射：
   ```bash
   ${BUN_X} {baseDir}/scripts/md-to-html.ts article.md --save-html /tmp/x-article-body.html > /tmp/x-article.json
   ```
2. 读取 JSON 输出中的 `title`、`coverImage` 和 `contentImages`（`placeholder` → `localPath`）。
3. 在 Chrome 中打开 `https://x.com/compose/articles`，创建或打开草稿（如有封面则上传），并填写标题。
4. 将富 HTML 复制到剪贴板：
   ```bash
   ${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts html --file /tmp/x-article-body.html
   ```
5. 使用 Computer Use 粘贴到文章正文中。
6. 按 `contentImages` 中的占位符顺序处理每个条目：
   - 定位确切的可见占位符文本，例如 `XIMGPH_3`，并点击它以设置插入点。
   - 打开工具栏中的 `Insert` 下拉菜单，选择 `Media`，然后点击模态框中标有 `Add photos or video` 的图标按钮。
   - 使用原生文件选择器选择图片的 `localPath`。
   - 等待图片块出现并完成所有上传活动。
   - 如果占位符仍位于插入图片上方，则重新准确选中该占位符文本，并先按 `Delete`。仅当 `Delete` 无效且已确认选中的文本恰好是该占位符时，才使用 `Backspace`。
7. 确认不再有 `XIMGPH_` 占位符，并且预期图片均已出现。
8. 打开 Preview，确认标题、封面、正文、链接和图片。
9. 在点击 `Publish` 之前请求明确确认。

如果 Computer Use 的选择、工具栏上传或文件选择器控制变得不可靠，请停止并报告阻塞问题，而不要静默切换到 Chrome 插件或 CDP。

---

## CDP 脚本模式（回退方案）

仅当所选浏览器控制模式不可用、不可靠或未被明确请求时，才使用下面的脚本部分。这些脚本会通过 CDP 启动或复用真实的 Chrome 实例，并保持浏览器打开以供检查。

如果用户明确要求使用 Codex Chrome 插件或 Chrome Computer Use，请勿使用 CDP 脚本模式，除非在解释阻塞问题后用户批准使用回退方案。

---

## 帖子类型选择

除非用户明确指定帖子类型：
- **纯文本** + 不超过 10,000 个字符 → **普通帖子**（Premium 会员最多支持 10,000 个字符，非 Premium 用户：280 个字符）
- **Markdown 文件**（`.md`）→ **X Article**

## 普通帖子

```bash
${BUN_X} {baseDir}/scripts/x-browser.ts "Hello!" --image ./photo.png
```

**参数**：
| 参数 | 描述 |
|-----------|-------------|
| `<text>` | 帖子内容（位置参数） |
| `--image <path>` | 图片文件（可重复，最多 4 个） |
| `--profile <dir>` | 自定义 Chrome 配置文件 |

**注意**：脚本会打开浏览器，并预先填入内容。用户手动审核并发布。

**Codex 模式注意**：如果用户明确请求使用 Codex Chrome 插件，请使用 **Codex Chrome Plugin Mode**。否则，如果已启用 Chrome Computer Use，请使用 **Chrome Computer Use Mode**，而不是运行 `x-browser.ts`。

---

## 视频帖子

文本 + 视频文件。

```bash
${BUN_X} {baseDir}/scripts/x-video.ts "Check this out!" --video ./clip.mp4
```

**参数**：
| 参数 | 描述 |
|-----------|-------------|
| `<text>` | 帖子内容（位置参数） |
| `--video <path>` | 视频文件（MP4、MOV、WebM） |
| `--profile <dir>` | 自定义 Chrome 配置文件 |

**注意**：脚本会打开浏览器，并预先填入内容。用户手动审核并发布。

**Codex 模式注意**：如果用户明确请求使用 Codex Chrome 插件，请使用 **Codex Chrome Plugin Mode**。否则，如果已启用 Chrome Computer Use，请使用 **Chrome Computer Use Mode**，而不是运行 `x-video.ts`。

**限制**：普通用户最长 140 秒，Premium 用户最长 60 分钟。处理时间：30-60 秒。

---

## 引用帖子

引用已有帖子并添加评论。

```bash
${BUN_X} {baseDir}/scripts/x-quote.ts https://x.com/user/status/123 "Great insight!"
```

**参数**：
| 参数 | 描述 |
|-----------|-------------|
| `<tweet-url>` | 要引用的 URL（位置参数） |
| `<comment>` | 评论文本（位置参数，可选） |
| `--profile <dir>` | 自定义 Chrome 配置文件 |

**注意**：脚本会打开浏览器，并预先填入内容。用户手动审核并发布。

**Codex 模式注意**：如果用户明确请求使用 Codex Chrome 插件，请使用 **Codex Chrome Plugin Mode**。否则，如果已启用 Chrome Computer Use，请使用 **Chrome Computer Use Mode**，而不是运行 `x-quote.ts`。

---

## X 文章

长篇 Markdown 文章（需要 X Premium）。

```bash
${BUN_X} {baseDir}/scripts/x-article.ts article.md
${BUN_X} {baseDir}/scripts/x-article.ts article.md --cover ./cover.jpg
```

**参数**：
| 参数 | 描述 |
|-----------|-------------|
| `<markdown>` | Markdown 文件（位置参数） |
| `--cover <path>` | 封面图片 |
| `--title <text>` | 覆盖标题 |

**Frontmatter**：YAML front matter 支持 `title`、`cover_image`。

**Codex 模式注意**：如果用户明确请求使用 Codex Chrome 插件，请遵循上面的 **Codex Chrome Plugin Mode**。如果用户明确请求使用 Chrome Computer Use，请遵循 **Chrome Computer Use Mode**。否则，优先使用 Chrome Computer Use；对于包含本地内容图片的 Markdown 文章，请先使用工具栏中的 `Insert` -> `Media` 图片上传流程，然后再回退到 **CDP Script Mode** 中的 `x-article.ts`。

**CDP 回退注意**：脚本会打开浏览器，并预先填入文章内容。除非使用 `--submit`，否则用户手动审核并发布。

**发布安全**：除非用户明确确认最终公开发布操作，否则不要使用 `--submit` 或点击 `Publish`。

**发布后组成检查**：所有图片插入后，脚本会自动验证：
- 编辑器内容中剩余的 `XIMGPH_` 占位符
- 预期图片数量与实际图片数量的对比

如果检查失败（输出中包含警告），请在用户发布前告知其具体问题。

---

## 故障排除

### Chrome 调试端口未就绪

仅限 CDP 回退：如果脚本失败并显示 `Chrome debug port not ready` 或 `Unable to connect`，请先终止现有的 Chrome CDP 实例，然后重试：

```bash
pkill -f "Chrome.*remote-debugging-port" 2>/dev/null; pkill -f "Chromium.*remote-debugging-port" 2>/dev/null; sleep 2
```

**重要**：此操作应自动执行——遇到此错误时，终止 Chrome CDP 实例并重试该命令，无需询问用户。

## 注意事项

- 首次运行：需要手动登录（会话会持续保留）
- 在 Codex Chrome Plugin Mode 和 Chrome Computer Use Mode 中，使用用户现有的 Chrome 会话，不要启动单独的 CDP 配置文件
- 默认情况下，CDP 脚本只会将内容填入浏览器；除非明确使用 `--submit`，否则用户必须手动审核并发布
- 跨平台：macOS、Linux、Windows

## 扩展支持

通过 EXTEND.md 使用自定义配置。有关路径和支持的选项，请参阅 **偏好设置** 部分。