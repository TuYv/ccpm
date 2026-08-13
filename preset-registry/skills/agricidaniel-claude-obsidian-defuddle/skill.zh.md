---
name: defuddle
description: "Strip clutter from web pages before ingesting into the wiki. Removes ads, navigation, headers, footers, and boilerplate: leaving clean readable markdown that saves 40-60% tokens. Triggers on: defuddle, clean this page, strip this url, fetch and clean, clean web content before ingesting, strip ads, remove clutter, clean URL content, readable markdown from URL."
allowed-tools: Read Bash
---
# defuddle：网页清理器

Defuddle 会从网页中提取有意义的内容，并丢弃其他一切内容：广告、Cookie 横幅、导航栏、相关文章、页脚、社交分享按钮。最终保留下来的是采用干净 Markdown 格式的文章正文。

在摄取任何 URL 之前使用此工具。它是可选的，但强烈推荐使用。对于典型的网页文章，它可以减少 40-60% 的 Token 使用量，并生成更干净的 Wiki 页面。

**Substrate 说明（v1.7+）**：与 `obsidian-markdown` / `obsidian-bases` / `json-canvas`（我们将 kepano/obsidian-skills 作为这些技能的上游）不同，`defuddle` 技能由 claude-obsidian 原创——kepano 的市场并未提供 defuddle 技能。这是规范版本。底层的 `defuddle-cli` 独立于这两个市场，位于 [github.com/kepano/defuddle](https://github.com/kepano/defuddle)。

---

## 安装

```bash
npm install -g defuddle-cli
```

验证：`defuddle --version`

---

## 用法

### 直接清理 URL
```bash
defuddle https://example.com/article
```
将干净的 Markdown 输出到 stdout。

### 保存到 .raw/
```bash
defuddle https://example.com/article > .raw/articles/article-slug-$(date +%Y-%m-%d).md
```

### 保存后添加 frontmatter 标头
运行 defuddle 后，在文件开头添加源 URL 和获取日期：
```bash
SLUG="article-slug-$(date +%Y-%m-%d)"
{ echo "---"; echo "source_url: https://example.com/article"; echo "fetched: $(date +%Y-%m-%d)"; echo "---"; echo ""; defuddle https://example.com/article; } > .raw/articles/$SLUG.md
```

### 清理本地 HTML 文件
```bash
defuddle page.html
```

---

## 何时使用

**在以下情况下使用 defuddle：**
- 从 URL 摄取新闻文章、博客文章或文档页面
- 页面包含大量外围内容（大多数网页都是如此）
- 处理长文章时，希望将用量控制在 Token 预算内

**在以下情况下跳过 defuddle：**
- 源文件已经是干净的 Markdown 或 PDF 文件
- 页面是仪表板、应用或结构化数据（defuddle 预期处理的是文章式内容）
- 未安装 defuddle，且文章足够短，可以直接处理原始内容

---

## 回退方案

如果未安装 defuddle，请检查：

```bash
which defuddle 2>/dev/null || echo "not installed"
```

如果未安装：直接使用 WebFetch。内容会不那么干净，但仍然可用。

---

## 与 /wiki-ingest 集成

传入 URL 时，`/wiki-ingest` 技能会自动检查 defuddle。摄取 URL 之前，无需手动运行 defuddle。如果 defuddle 可用，摄取技能会调用它。

要在摄取前手动清理并保存页面：
1. 运行上面的保存命令
2. 然后运行：`ingest .raw/articles/[slug].md`

---

## 如何思考（10 原则映射）

处理此技能时，请应用 10 原则循环。规范框架请参阅 [`skills/think/SKILL.md`](../think/SKILL.md)。

| # | 原则 | 在此处的应用 |
|---|-----------|-------------------|
| 1 | 观察（外部） | 是哪个 URL？页面上实际有什么内容？不要假设标题与内容相符。 |
| 2 | 观察（内部） | 我是否假设页面包含用户预期的内容？提取前先进行验证。 |
| 3 | 倾听 | 用户说的是“文章”（仅主要内容）还是“链接”（所有可见内容）？ |
| 4 | 思考 | 去除样板内容、保留结构并捕获元数据。在 shell 中为 URL 加引号，以避免注入。 |
| 5 | 连接（横向） | 这个域名通常如何渲染？某些网站会扰乱 defuddle 的启发式规则；记录这些网站。 |
| 6 | 连接（系统） | 通过 shell 调用 defuddle-cli（kepano）；输出保存到 `.raw/`，供 wiki-ingest 获取。 |
| 7 | 感受 | 干净的 Markdown，读起来应像原文，而不是残留的样板内容。 |
| 8 | 接受 | 某些页面无法良好提取。标记后继续处理；当启发式规则失效时，不要强行提取。 |
| 9 | 创造 | 将 Markdown 输出到 stdout，并重定向到 `.raw/articles/<slug>-<date>.md`。 |
| 10 | 成长 | 提取失败意味着可能需要升级 defuddle-cli 或使用替代提取器——将其记录到待办事项中。 |