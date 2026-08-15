---
name: scrapling-skill
description: Install, troubleshoot, and use Scrapling CLI to extract HTML, Markdown, or text from webpages. Use this skill whenever the user mentions Scrapling, `uv tool install scrapling`, `scrapling extract`, WeChat/mp.weixin articles, browser-backed page fetching, or needs help deciding between static and dynamic extraction.
---
# Scrapling 技能

## 概述

默认通过 Scrapling 的 CLI 使用 Scrapling。从能够正常工作的最小命令开始，验证保存的输出，只有当静态抓取不包含真实页面内容时，才升级到由浏览器支持的抓取方式。

不要假定用户安装的 Scrapling 运行正常。请先进行验证。

## 默认工作流程

复制此检查清单，并在工作过程中持续更新：

```text
Scrapling Progress:
- [ ] Step 1: Diagnose the local Scrapling install
- [ ] Step 2: Fix CLI extras or browser runtime if needed
- [ ] Step 3: Choose static or dynamic fetch
- [ ] Step 4: Save output to a file
- [ ] Step 5: Validate file size and extracted content
- [ ] Step 6: Escalate only if the previous path failed
```

## 步骤 1：诊断安装情况

首先运行随附的诊断脚本：

```bash
python3 scripts/diagnose_scrapling.py
```

将诊断结果作为下一步操作的事实依据。

## 步骤 2：修复安装

### 如果安装 CLI 时未包含额外依赖

如果 `scrapling --help` 因缺少 `click` 而失败，或显示一条有关安装带额外依赖的 Scrapling 的消息，请使用 CLI 额外依赖重新安装：

```bash
uv tool uninstall scrapling
uv tool install 'scrapling[shell]'
```

除非用户明确需要更广泛的功能集，否则不要默认使用 `scrapling[all]`。

### 如果需要由浏览器支持的抓取器

安装 Playwright 运行时：

```bash
scrapling install
```

如果安装过程看起来很慢或不透明，请先阅读 `references/troubleshooting.md`，不要凭空猜测。除非满足以下任一条件，否则不要声称安装成功：
- `scrapling install` 报告依赖项已安装，或
- 诊断脚本确认 Chromium 和 Chrome Headless Shell 均已存在。

## 步骤 3：选择抓取器

使用以下决策规则：

- 对于普通页面、文章页面和大多数微信公众号文章，首先使用 `extract get`。
- 当静态 HTML 不包含真实内容或页面依赖 JavaScript 渲染时，使用 `extract fetch`。
- 仅当 `fetch` 仍因反机器人机制或验证挑战行为而失败时，才使用 `extract stealthy-fetch`。不要将其作为默认选项。

## 步骤 4：运行最简且实用的命令

在 shell 命令中，URL 必须始终用引号括起来。当 URL 包含 `?`、`&` 或其他特殊字符时，这在 `zsh` 中是强制要求。

### 将完整页面保存为 HTML

```bash
scrapling extract get 'https://example.com' page.html
```

### 将主要内容保存为 Markdown

```bash
scrapling extract get 'https://example.com' article.md -s 'main'
```

### 使用浏览器自动化抓取经 JS 渲染的页面

```bash
scrapling extract fetch 'https://example.com' page.html --timeout 20000
```

### 微信公众号文章正文

首先使用 `#js_content`。这是在 `mp.weixin.qq.com` 页面上提取文章正文时的默认选择器。

```bash
scrapling extract get 'https://mp.weixin.qq.com/s/ARTICLE_ID?scene=1' article.md -s '#js_content'
```

## 步骤 5：验证输出

每次提取后都要验证文件，而不是假定提取成功：

```bash
wc -c article.md
sed -n '1,40p' article.md
```

对于 HTML 输出，请检查预期的标题、容器或选择器目标是否确实存在：

```bash
rg -n '<title>|js_content|rich_media_title|main' page.html
```

如果文件很小、为空或缺少预期容器，则说明提取未成功。返回步骤 3，并更换抓取器或选择器。

## 步骤 6：处理已知故障模式

### 本地 TLS 信任存储问题

如果 `extract get` 失败并显示 `curl: (60) SSL certificate problem`，应先将其视为本地信任存储问题，而不是 Scrapling 内容提取失败。

使用以下选项重试同一命令：

```bash
--no-verify
```

仅在确认故障符合本地证书验证错误模式后才这样做。默认情况下，不要在不作说明的情况下禁用验证。

### 微信文章页面

对于 `mp.weixin.qq.com`：
- 先尝试 `extract get`，再尝试 `extract fetch`
- 使用 `-s '#js_content'` 提取文章正文
- 立即验证保存的 Markdown 或 HTML

### 浏览器支持的抓取失败

如果 `extract fetch` 失败：
1. 使用 `python3 scripts/diagnose_scrapling.py` 重新检查安装情况
2. 确认 Chromium 和 Chrome Headless Shell 均已安装
3. 使用稍长的超时时间重试
4. 仅在站点行为确有必要时才升级到 `stealthy-fetch`

## 命令模式

### 诊断并对 URL 进行冒烟测试

```bash
python3 scripts/diagnose_scrapling.py --url 'https://example.com'
```

### 诊断并对微信文章正文进行冒烟测试

```bash
python3 scripts/diagnose_scrapling.py \
  --url 'https://mp.weixin.qq.com/s/ARTICLE_ID?scene=1' \
  --selector '#js_content' \
  --no-verify
```

### 诊断并对浏览器支持的抓取进行冒烟测试

```bash
python3 scripts/diagnose_scrapling.py \
  --url 'https://example.com' \
  --dynamic
```

## 约束规则

- 不要让用户盲目重新安装。应先进行验证。
- 当用户明确询问 CLI 时，不要默认改用 Python 库 API。
- 除非静态抓取结果缺少实际内容，否则不要直接改用浏览器支持的抓取方式。
- 不要仅根据退出码就声称成功。应检查保存的文件。
- 不要在输出或文档中硬编码用户特定的绝对路径。

## 资源

- 安装与冒烟测试辅助脚本：`scripts/diagnose_scrapling.py`
- 已验证的故障模式与恢复路径：`references/troubleshooting.md`