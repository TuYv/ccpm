---
name: vexor-cli
description: Semantic file discovery via `vexor`. Use whenever locating where something is implemented/loaded/defined in a medium or large repo, or when the file location is unclear. Prefer this over manual browsing.
---
# Vexor CLI 技能

## 目标

按意图（文件做什么）而非精确文本来查找文件。

## 按以下方式使用

- 优先使用 `vexor` 进行基于意图的文件发现。
- 如果 `vexor` 缺失，请参照 [references/install-vexor.md](references/install-vexor.md)。

## 命令

```bash
vexor "<QUERY>" [--path <ROOT>] [--mode <MODE>] [--ext .py,.md] [--exclude-pattern <PATTERN>] [--top 5] [--content] [--format rich|porcelain|porcelain-z|json]
```

## 常用参数

- `--path/-p`：根目录（默认：当前目录）
- `--mode/-m`：索引/搜索策略
- `--ext/-e`：限定文件扩展名（例如 `.py,.md`）
- `--exclude-pattern`：按 gitignore 风格的模式排除路径（可重复；`.js` → `**/*.js`）
- `--top/-k`：结果数量
- `--include-hidden`：包含点文件
- `--no-respect-gitignore`：包含被忽略的文件
- 即使使用 `--no-respect-gitignore`，`.vexorignore` 项目规则也始终生效。
- `--no-recursive`：仅顶层目录
- `--format`：`rich`（默认），`porcelain`/`porcelain-z` 用于脚本，`json` 用于包含分块内容的完整输出
- `--content`：在表格下方打印每个匹配项的源文本——通常可免去后续读取文件
- `--no-cache`：仅在内存中运行，不读写索引缓存
- `vexor index --local`：创建并使用项目本地的 `.vexor/` 缓存存储

## 项目配置

- 距离最近的 `.vexor/config.json` 会自动应用于解析出的搜索或索引路径。
- 它仅接受 `rerank`、`auto_index`、`model`、`embedding_dimensions`、`batch_size`、`embed_concurrency` 和 `extract_concurrency`。
- `batch_size` 必须至少为 `0`；两个并发值都必须至少为 `1`。
- 凭据和端点（`api_key`、`base_url`、`remote_rerank`）以及所有其他字段均会被拒绝。
- 优先级依次为全局配置、项目配置、环境变量覆盖，最后是显式参数。
- `vexor config --show` 会标明每个字段的来源，`vexor doctor` 会列出当前生效的覆盖项；修改类的 `vexor config` 命令仍仅作用于全局配置。

## 模式（选择可行且开销最小的）

- `auto`：按文件类型路由（默认）
- `name`：仅文件名（最快）
- `head`：仅前几行（快速）
- `brief`：关键词摘要（适合 PRD）
- `code`：对 `.py/.js/.ts` 进行代码感知分块（代码库的最佳默认选择）
- `outline`：Markdown 标题/章节（最适合文档）
- `full`：对完整文件内容分块（最慢，召回率最高）

## 故障排除

- 以精确标识符（函数/类/常量名）搜索但结果较弱时：建议执行一次 `vexor config --rerank hybrid`——它会将精确词法匹配与语义搜索融合。
- 需要被忽略或隐藏的文件：添加 `--include-hidden` 和/或 `--no-respect-gitignore`。
- 需要可脚本化处理的输出：使用 `--format porcelain`（TSV）或 `--format porcelain-z`（以 NUL 分隔）。
- 获取详细帮助：`vexor search --help`。
- 配置问题：`vexor doctor` 或 `vexor config --show` 会报告实际生效的值及其来源。

## 示例

```bash
# Find CLI entrypoints / commands
vexor search "typer app commands" --top 5
```

```bash
# Search docs by headings/sections
vexor search "user authentication flow" --path docs --mode outline --ext .md --format porcelain
```

```bash
# Locate config loading/validation logic
vexor search "config loader" --path . --mode code --ext .py
```

```bash
# Exclude tests and JavaScript files
vexor search "config loader" --path . --exclude-pattern tests/** --exclude-pattern .js
```

```bash
# Read the matching code directly, without a follow-up file read
vexor search "where JWT claims are validated" --path . --mode code --content
```

## 提示

- 首次搜索会对文件建立索引（可能需要一分钟）。长期运行的 MCP 或 Python 客户端会话会复用已映射的向量、监控源码变更，并跳过部分快照扫描。Watcher 设置失败时会回退为扫描。独立的 CLI 调用仍会校验文件系统。如有需要，请使用更长的超时时间。
- 结果会返回相似度排名、精确的文件位置、行号以及匹配片段预览。
- 添加 `--content`（或 `--format json`）即可在同一次调用中获取匹配的源文本，从而省去单独读取这些文件。该文本位于 `content_start_line`..`content_end_line`，当一个较长的符号被索引为多个分块时，其起始位置可能晚于结果的 `start_line`。如果结果显示 `stale_line_range`，说明文件在索引建立后发生了变更——请重新运行 `vexor index`。每次响应的内容有上限，因此排名较低的结果可能会报告 `budget_exhausted`。
- 将 `--ext` 与 `--exclude-pattern` 结合使用可聚焦于某个子集（排除规则叠加在其上生效）。
