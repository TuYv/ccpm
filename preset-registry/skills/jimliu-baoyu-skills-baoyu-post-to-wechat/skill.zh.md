---
name: baoyu-post-to-wechat
description: Posts content to WeChat Official Account (微信公众号) via API or Chrome CDP. Supports article posting (文章) with HTML, markdown, or plain text input, and image-text posting (贴图, formerly 图文) with multiple images. Markdown article workflows default to converting ordinary external links into bottom citations for WeChat-friendly output. Use when user mentions "发布公众号", "post to wechat", "微信公众号", or "贴图/图文/文章".
version: 1.118.2
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-post-to-wechat
    requires:
      anyBins:
        - bun
        - npx
---
# 发布到微信公众号

## 用户输入工具

当此技能提示用户时，请遵循以下工具选择规则（按优先级排序）：

1. **优先使用**当前 agent 运行时提供的内置用户输入工具——例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等效工具。
2. **回退方案**：如果没有此类工具，则输出编号的纯文本消息，并要求用户针对每个问题回复所选编号/答案。
3. **批量提问**：如果工具支持每次调用提出多个问题，则将所有适用问题合并到一次调用中；如果仅支持单个问题，则按优先级顺序逐个提问。

下面具体的 `AskUserQuestion` 引用仅作为示例——在其他运行时中请替换为本地等效工具。

## 语言

使用用户的语言回复。如果用户使用中文，则用中文回复；如果使用英文，则用英文回复。保留技术标记（路径、标志、字段名）的英文形式。

## 脚本目录

`{baseDir}` = 此 SKILL.md 所在的目录。解析 `${BUN_X}`：优先使用 `bun`；否则使用 `npx -y bun`；再否则建议执行 `brew install oven-sh/bun/bun`。

| Script | 用途 |
|--------|------|
| `scripts/wechat-browser.ts` | 图文 |
| `scripts/wechat-article.ts` | 通过浏览器发布文章 |
| `scripts/wechat-api.ts` | 通过 API 发布文章 |
| `scripts/md-to-wechat.ts` | Markdown → 带图片占位符的微信就绪 HTML |
| `scripts/check-permissions.ts` | 验证环境和权限 |

## 偏好设置（EXTEND.md）

按以下顺序检查这些路径；以第一个命中的路径为准：

| Path | Scope |
|------|-------|
| `.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | 项目 |
| `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | XDG |
| `$HOME/.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | 用户主目录 |

找到后 → 读取、解析并应用。未找到 → 在执行任何其他操作之前，先运行首次设置（`references/config/first-time-setup.md`）。

**最少配置项**（不区分大小写，接受 `1/0` 或 `true/false`）：

| Key | Default | Mapping |
|-----|---------|---------|
| `default_author` | empty | 当 CLI/frontmatter 未提供 `author` 时的回退值 |
| `need_open_comment` | `1` | `draft/add` 中的 `articles[].need_open_comment` |
| `only_fans_can_comment` | `0` | `draft/add` 中的 `articles[].only_fans_can_comment` |

**推荐的 EXTEND.md**：

```md
default_theme: default
default_color: blue
default_publish_method: browser
default_author: 宝玉
need_open_comment: 1
only_fans_can_comment: 0
chrome_profile_path: /path/to/chrome/profile

# Remote API publishing (optional) — only set if WeChat's IP allowlist
# excludes your local machine. See "Remote API Method" below.
# remote_publish_host: server.example.com
# remote_publish_user: deploy
# remote_publish_port: 22
# remote_publish_identity_file: ~/.ssh/id_ed25519
# remote_publish_known_hosts_file: ~/.ssh/known_hosts
# remote_publish_strict_host_key_checking: accept-new
# remote_publish_connect_timeout: 10
# remote_publish_proxy_jump: bastion.example.com
```

原始 `ssh` / `scp` 选项被有意不予支持；仅接受上述类型化键。认证仅支持 SSH 密钥（不支持密码）。

**主题选项**：default、grace、simple、modern。**颜色预设**：blue、green、vermilion、yellow、purple、sky、rose、olive、black、gray、pink、red、orange（或十六进制颜色值）。

**值优先级**：CLI 参数 → frontmatter → EXTEND.md（账户级 → 全局）→ skill 默认值。

## 多账户支持

EXTEND.md 支持 `accounts:` 块，用于管理多个公众号。当存在 2 个或更多条目时，工作流会插入步骤 0.5 以提示选择账户（或者根据 `default: true` 或 `--account <alias>` 自动选择）。

完整详情——兼容性规则、每账户键、凭证解析、每账户 Chrome 配置文件、CLI 用法——请参阅 `references/multi-account.md`。

## 飞行前检查（可选）

首次使用前，建议进行环境检查（用户可以跳过）：

```bash
${BUN_X} {baseDir}/scripts/check-permissions.ts
```

检查项：Chrome、配置文件隔离、Bun、辅助功能、剪贴板、粘贴按键、API 凭证、Chrome 冲突。

| 检查失败项 | 修复方法 |
|-------------|-----|
| Chrome | 安装 Chrome 或设置 `WECHAT_BROWSER_CHROME_PATH` |
| 配置文件目录 | 位于 `baoyu-skills/chrome-profile` 的共享配置文件 |
| Bun 运行时 | `brew install oven-sh/bun/bun` 或 `npm install -g bun` |
| 辅助功能（macOS） | 系统设置 → 隐私与安全性 → 辅助功能 → 启用终端应用 |
| 剪贴板复制 | 确保已安装 Swift/AppKit（macOS：`xcode-select --install`） |
| 粘贴按键（Linux） | 安装 `xdotool`（X11）或 `ydotool`（Wayland） |
| API 凭证 | 按照步骤 2 中的引导设置，或在 `.baoyu-skills/.env` 中设置 |

## 图文发布（图文）

包含多张图片的短帖（最多 9 张）：

```bash
${BUN_X} {baseDir}/scripts/wechat-browser.ts --markdown article.md --images ./images/
${BUN_X} {baseDir}/scripts/wechat-browser.ts --title "标题" --content "内容" --image img.png --submit
```

详情请参阅：`references/image-text-posting.md`。

## 文章发布工作流（文章）

```
- [ ] 步骤 0：加载偏好设置（EXTEND.md）
- [ ] 步骤 0.5：解析账户（仅多账户——参阅 references/multi-account.md）
- [ ] 步骤 1：确定输入类型
- [ ] 步骤 2：选择方法并配置凭证
- [ ] 步骤 3：解析主题/颜色并验证元数据
- [ ] 步骤 4：发布到微信
- [ ] 步骤 5：报告完成情况
```

### 步骤 0：加载偏好设置

检查并加载 EXTEND.md（参阅上文“偏好设置”）。如果未找到，请在提出任何其他问题之前完成首次设置。解析并缓存供后续步骤使用：`default_theme`、`default_color`、`default_author`、`need_open_comment`、`only_fans_can_comment`。

### 步骤 1：确定输入类型

| 输入 | 检测方式 | 下一步 |
|-------|-----------|------|
| HTML 文件 | 路径以 `.html` 结尾，且文件存在 | 跳至步骤 3 |
| Markdown 文件 | 路径以 `.md` 结尾，且文件存在 | 步骤 2 |
| 纯文本 | 不是文件路径，或文件不存在 | 保存为 markdown，然后执行步骤 2 |

**纯文本处理**：

1. 生成 slug（前 2-4 个有意义的词，kebab-case；将中文翻译成英文用于 slug）。
2. 保存到 `post-to-wechat/YYYY-MM-DD/<slug>.md`（如有需要则创建目录）。
3. 以 markdown 文件继续。

### 第 2 步：选择发布方式并配置

除非在 EXTEND.md 或 CLI 中已指定，否则询问方式：

| 方式 | 速度 | 要求 |
|--------|-------|----------|
| `api`（推荐） | 快 | API 凭据（本地 IP 已加入白名单） |
| `browser` | 慢 | Chrome + 已登录会话 |
| `remote-api` | 快 | API 凭据 + 一台 IP 已在微信白名单中且可通过 SSH 访问的服务器 |

**已选择 API + 缺少凭据** → 按照 `references/api-setup.md` 运行引导式设置（写入 `.baoyu-skills/.env`）。

**`remote-api` 方式**：微信的“公众号设置 → IP 白名单”通常会将 API 访问限制为一到两个固定 IP。如果本地机器的 IP 不在列表中，但云服务器的 IP 在列表中，请使用 `remote-api`：所有 markdown 渲染、图片处理、草稿组装和 HTML 重写仍在本地进行，只有发往 `api.weixin.qq.com` 的出站 HTTPS 调用（token、uploadimg、add_material、draft/add）会通过 SSH SOCKS5 动态端口转发（`ssh -N -D`）隧道传输，从而让微信将远程服务器视为源 IP。不会有文件写入远程主机；`AppSecret` 永远不会离开本地进程。远程主机只需具备 `sshd` 和出站网络——无需 Python，也无需代理进程。请参阅下方“远程 API 方式”。

### 第 3 步：解析主题/颜色并验证元数据

1. **主题**：CLI `--theme` → EXTEND.md `default_theme` → `default`（第一个匹配项优先；如已解析则**不要**询问）。
2. **颜色**：CLI `--color` → EXTEND.md `default_color` → 省略（应用主题默认值）。
3. **验证元数据**（markdown 使用 frontmatter，HTML 使用 meta 标签）：

| 字段 | 缺失时 → |
|-------|-----------|
| 标题 | 询问，或按 Enter 根据内容自动生成 |
| 摘要 | Frontmatter `description` → `summary` → 询问或自动生成 |
| 作者 | CLI `--author` → frontmatter `author` → EXTEND.md `default_author` |
| 来源 URL | CLI `--source-url` → frontmatter `sourceUrl`/`contentSourceUrl`/`content_source_url` |

自动生成：标题 = 第一个 H1/H2 或第一句话；摘要 = 第一段，截断至 120 个字符。

4. **封面图**（API `article_type=news` 必需）：CLI `--cover` → frontmatter（`coverImage` / `featureImage` / `cover` / `image`）→ `imgs/cover.png` → 第一张内联图片 → 如仍缺失则停止并请求提供一张。

### 第 4 步：发布

**重要——绝不要预先将 markdown 转换为 HTML。** 发布脚本会在内部处理转换，并且两种方式对图片的渲染不同：API 会渲染 `<img>` 标签以供上传，浏览器则使用占位符进行粘贴替换。传入预转换的 HTML 会导致其中一种方式无法正常工作。

**Markdown 引用默认行为**：对于 markdown 输入，普通外部链接默认会转换为底部引用。仅当用户明确希望保留内联链接时，才使用 `--no-cite`。现有 HTML 输入保持原样。

**API 方法**（接受 `.md` 或 `.html`）：

```bash
${BUN_X} {baseDir}/scripts/wechat-api.ts <file> --theme <theme> [--color <color>] [--title <title>] [--summary <summary>] [--author <author>] [--cover <cover_path>] [--source-url <url>] [--no-cite]
```

即使 `--theme` 为 `default`，也始终传入该参数。仅当用户或 EXTEND.md 明确设置了 `--color` 时才传入该参数。

**远程 API 方法**（同一脚本，添加 `--remote`）：

```bash
${BUN_X} {baseDir}/scripts/wechat-api.ts <file> --theme <theme> --remote [--remote-host <host>] [--remote-user <user>] [--remote-port <port>] [--remote-identity-file <path>] [--remote-known-hosts-file <path>] [--remote-strict-host-key-checking yes|no|accept-new] [--remote-connect-timeout <s>] [--remote-proxy-jump <spec>]
```

任何 `--remote-*` 参数都会隐式启用 `--remote`。CLI 值会覆盖 EXTEND.md 中账户级别的 `remote_publish_*` 配置，然后覆盖全局的 `remote_publish_*` 配置。设置 `default_publish_method: remote-api` 后，即使不传入 `--remote` 也会启用远程模式。

**`draft/add` 请求体规则**：
- 端点：`POST https://api.weixin.qq.com/cgi-bin/draft/add?access_token=ACCESS_TOKEN`
- `article_type`：`news`（默认）或 `newspic`
- 对于 `news`，必须包含 `thumb_media_id`（必须提供封面）
- 请求体中始终包含 `need_open_comment`（默认值为 `1`）和 `only_fans_can_comment`（默认值为 `0`），即使 CLI 未公开这些参数
- 对于 `news`，可以选择性地包含 `content_source_url`（原文 URL，显示为“阅读原文”链接，最大 1KB）。通过 CLI 参数 `--source-url` 或 frontmatter 中的 `sourceUrl`/`contentSourceUrl`/`content_source_url` 提供

**浏览器方法**（接受 `--markdown` 或 `--html`）：

```bash
${BUN_X} {baseDir}/scripts/wechat-article.ts --markdown <markdown_file> --theme <theme> [--color <color>] [--no-cite]
${BUN_X} {baseDir}/scripts/wechat-article.ts --html <html_file>
```

### 步骤 5：完成报告

```
WeChat Publishing Complete!

Input: [type] - [path]
Method: [API | Browser]
Theme: [theme] [color if set]

Article:
• Title: [title]
• Summary: [summary]
• Images: [N] inline
• Comments: [open/closed], [fans-only/all]    ← API method only

Result:
✓ Draft saved to WeChat Official Account
• media_id: [media_id]                         ← API method only

Next Steps (API):
→ Manage drafts: https://mp.weixin.qq.com (登录后进入「内容管理」→「草稿箱」)

Files created:
[• post-to-wechat/YYYY-MM-DD/slug.md (if plain text input)]
[• slug.html (converted)]
```

## 功能对比

| 功能 | 图文 | 文章（API） | 文章（远程 API） | 文章（浏览器） |
|---------|:---:|:---:|:---:|:---:|
| 纯文本输入 | ✗ | ✓ | ✓ | ✓ |
| HTML 输入 | ✗ | ✓ | ✓ | ✓ |
| Markdown 输入 | 标题/正文 | ✓ | ✓ | ✓ |
| 多张图片 | ✓（最多 9 张） | ✓（正文内） | ✓（正文内） | ✓（正文内） |
| 主题 | ✗ | ✓ | ✓ | ✓ |
| 自动生成元数据 | ✗ | ✓ | ✓ | ✓ |
| 默认封面回退（`imgs/cover.png`） | ✗ | ✓ | ✓ | ✗ |
| 评论控制 | ✗ | ✓ | ✓ | ✗ |
| 需要 Chrome | ✓ | ✗ | ✗ | ✓ |
| 需要 API 凭据 | ✗ | ✓ | ✓ | ✗ |
| 需要 SSH 可访问且 IP 已加入允许列表的服务器 | ✗ | ✗ | ✓ | ✗ |
| 速度 | 中等 | 快 | 快 | 慢 |

## 故障排除

| 问题 | 修复方法 |
|-------|-----|
| 缺少 API 凭据 | 按照步骤 2 中的引导完成设置 |
| 访问令牌错误 | 验证凭据有效且未过期 |
| 未登录（浏览器） | 首次运行会打开浏览器 — 扫描二维码登录。设置 `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`，即可通过 Telegram 接收二维码图片 |
| 未找到 Chrome | 设置 `WECHAT_BROWSER_CHROME_PATH` |
| 缺少标题/摘要 | 使用自动生成，或手动提供 |
| 没有封面图片 | 添加 frontmatter cover，或将 `imgs/cover.png` 放置在文章目录中 |
| 评论默认设置错误 | 检查 EXTEND.md 中的 `need_open_comment` / `only_fans_can_comment` |
| 粘贴失败 | 检查系统剪贴板权限 |
| `Remote publish host is required` | 在 EXTEND.md 中设置 `--remote-host` 或 `remote_publish_host` |
| `SOCKS proxy on 127.0.0.1:… not ready` | SSH 无法启动隧道 — 检查密钥、主机、`StrictHostKeyChecking`，或使用 `--remote-connect-timeout` |
| 远程发布期间出现 `ssh exited early` | 验证用户是否可以非交互式地通过 `ssh` 连接到服务器；如果连接较慢，请增大 `--remote-connect-timeout` |
| 远程 API 调用返回 `errcode 40164`（IP 无效） | 远程服务器的出口 IP 不在微信公众号的允许列表中；在公众号设置 → IP 白名单中添加该 IP |

## 参考

| 文件 | 内容 |
|------|---------|
| `references/image-text-posting.md` | 图文参数、自动压缩 |
| `references/article-posting.md` | 文章主题、图片处理 |
| `references/multi-account.md` | 多账号兼容性、凭据、Chrome 配置文件、CLI |
| `references/api-setup.md` | 凭据设置引导 |
| `references/config/first-time-setup.md` | 首次 EXTEND.md 设置 |

## 扩展支持

通过 EXTEND.md 使用自定义配置。路径和支持的选项请参阅“偏好设置”。