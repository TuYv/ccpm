---
name: wiki-ingest
description: "Ingest sources into the Obsidian wiki vault. Reads a source, extracts entities and concepts, creates or updates wiki pages, cross-references, and logs the operation. Supports files, URLs, and batch mode. Triggers on: ingest, process this source, add this to the wiki, read and file this, batch ingest, ingest all of these, ingest this url."
---
# wiki-ingest：来源摄取

阅读来源。编写 wiki。交叉引用所有内容。单个来源通常会涉及 8-15 个 wiki 页面。

**语法标准**：使用规范的 Obsidian Flavored Markdown 编写所有 Obsidian Markdown。Wiki 链接使用 `[[Note Name]]`，标注框使用 `> [!type] Title`，嵌入使用 `![[file]]`，属性使用 YAML frontmatter。如果已安装 kepano/obsidian-skills 插件，优先使用其规范的 obsidian-markdown skill 作为 Obsidian 语法参考。否则，请遵循此 skill 中的指导。

---

## 传输方式（v1.7+）

在修改任何 vault 文件之前，请查看 `.vault-meta/transport.json`（由 `bash scripts/detect-transport.sh` 自动创建）。按照回退链使用 `preferred` 传输方式：

- **cli** — `obsidian-cli write "$VAULT" "$NOTE" < content.md`（或 `append`、`property:set`）；参见 [`skills/wiki-cli/SKILL.md`](../wiki-cli/SKILL.md)
- **mcp-obsidian** / **mcpvault** — `mcp__obsidian-vault__write_note` 及相关工具；参见 [`skills/wiki/references/mcp-setup.md`](../wiki/references/mcp-setup.md)
- **filesystem** — Claude 的 `Write`/`Edit` 工具，并使用基于 vault 根目录的绝对路径（最终兜底方案；始终可用）

完整决策树：[`wiki/references/transport-fallback.md`](../../wiki/references/transport-fallback.md)。

---

## 模式感知（v1.8+）

在创建任何新的 wiki 页面之前，通过 `python3 scripts/wiki-mode.py route <type> "<name>"` 查看 vault 的方法论模式。路由器会返回该页面应归档到的 vault 相对路径。

```bash
SRC_PATH=$(python3 scripts/wiki-mode.py route source "Karpathy 2025 LLM Wiki essay")
# generic:      wiki/sources/Karpathy-2025-LLM-Wiki-essay.md
# lyt:          wiki/notes/Karpathy-2025-LLM-Wiki-essay.md  (also update relevant MOC)
# para:         wiki/resources/incoming/Karpathy-2025-LLM-Wiki-essay.md
# zettelkasten: wiki/20260517123456-Karpathy-2025-LLM-Wiki-essay.md

ENT_PATH=$(python3 scripts/wiki-mode.py route entity "Andrej Karpathy")
CON_PATH=$(python3 scripts/wiki-mode.py route concept "Compounding Vault Pattern")
```

如果 `.vault-meta/mode.json` 不存在，路由器将返回 mode=generic 路径（与 v1.7 的行为相同）。此 skill 无需进行特殊处理。

特定模式的后续操作：
- **LYT**：归档原子笔记后，更新相关 MOC（`wiki/mocs/<topic>-moc.md`），使其链接到新笔记。如果该主题不存在 MOC，请使用 `skills/wiki-mode/templates/lyt/moc-template.md` 创建一个。
- **Zettelkasten**：文件名已包含时间戳 ID。填充 `id:` frontmatter 字段，使其与文件名一致。
- **PARA**：默认情况下，新摄取的内容会放入 `wiki/resources/incoming/`。请勿自动猜测主题；将其留在 incoming/ 中供用户审核。

## 并发（v1.7+）

**v1.7 中多写入者是安全的。** v1.6 中潜在的数据损坏缺陷——两个并行子代理写入同一页面时可能会在无提示的情况下相互覆盖——现已通过逐文件咨询锁解决。每次写入 wiki 页面之前，都必须执行 `wiki-lock acquire <path>`。

```bash
# Acquire — blocks (returns 75 EX_TEMPFAIL) if another writer holds the lock
if bash scripts/wiki-lock.sh acquire wiki/concepts/Foo.md; then
  # ... do the write via the §Transport-selected method ...
  bash scripts/wiki-lock.sh release wiki/concepts/Foo.md
else
  # rc=75: another writer is in flight. Retry once after 2s; if still held,
  # log to wiki/log.md and skip this page rather than overwrite.
  sleep 2
  bash scripts/wiki-lock.sh acquire wiki/concepts/Foo.md && {
    # write …
    bash scripts/wiki-lock.sh release wiki/concepts/Foo.md
  } || echo "skipped wiki/concepts/Foo.md (locked); logged to wiki/log.md"
fi
```

属性：
- **文件级粒度。** 锁以 `sha1(<vault-relative-path>)` 为键；对不同页面的并发写入可并行运行。
- **基于时长的过期机制。** 默认值为 `STALE_AFTER_SEC=60`。持锁进程崩溃后，无需人工干预即可在不超过 60 秒内解除阻塞。完整语义请参阅 `scripts/wiki-lock.sh` 的文件头。
- **跨进程释放。** 释放操作为 `rm -f`（无需匹配 PID）。技能作者应负责释放其获取的锁；跨技能释放是设计允许的行为（由清理程序运行 `wiki-lock clear-stale --max-age 0` 是标准恢复路径）。
- **如果当前有任何锁被持有，PostToolUse 钩子现在会延迟执行 `git add`**，因此自动提交不会在摄取过程中触发并产生不完整的提交。请参阅 `hooks/hooks.json`。

在 v1.7+ 中，`wiki-lock` 是无条件启用的——没有功能开关，也没有回退方案。不获取锁的技能会与任何其他写入者产生竞争。该脚本位于核心组件中，并非可选启用。

v1.6 中的子代理规则——*"子代理不得调用 `scripts/allocate-address.sh`"*——得以保留（编排器仍会回填地址，以保持计数器单调递增）。新规则是：*子代理现在可以写入页面，但必须先获取锁。* 请参阅 `agents/wiki-ingest.md`。

---

## 增量跟踪

在摄取任何文件之前，请检查 `.raw/.manifest.json`，以避免重新处理未发生变化的源文件。

```bash
# Check if manifest exists
[ -f .raw/.manifest.json ] && echo "exists" || echo "no manifest yet"
```

**清单格式**（若不存在则创建）：
```json
{
  "sources": {
    ".raw/articles/article-slug-2026-04-08.md": {
      "hash": "abc123",
      "ingested_at": "2026-04-08",
      "pages_created": ["wiki/sources/article-slug.md", "wiki/entities/Person.md"],
      "pages_updated": ["wiki/index.md"]
    }
  }
}
```

**摄取文件之前：**
1. 计算哈希值：`md5sum [file] | cut -d' ' -f1`（在 Linux 上也可使用 `sha256sum`）。
2. 检查 `.manifest.json` 中是否存在相同路径和相同哈希值。
3. 如果哈希值匹配，则跳过。报告：“已摄取（未发生变化）。使用 `force` 重新摄取。”
4. 如果路径不存在或哈希值不同，则继续摄取。

**摄取文件之后：**
1. 在 `.manifest.json` 中记录 `{hash, ingested_at, pages_created, pages_updated}`。
2. 将更新后的清单写回。

如果用户说“强制摄取”或“重新摄取”，则跳过增量检查。

---

## URL 摄取

触发条件：用户传入以 `https://` 开头的 URL。

步骤：

1. **获取**：使用 WebFetch 获取页面。
2. **清理**（可选）：如果 `defuddle` 可用（`which defuddle 2>/dev/null`），则运行 `defuddle [url]` 以移除广告、导航和杂乱内容。通常可节省 40-60% 的 token。如果未安装，则回退到原始 WebFetch 输出。
3. **派生 slug**：从 URL 路径中派生 slug（取最后一段、转换为小写、空格→连字符、去除查询字符串）。
4. **保存**：保存至 `.raw/articles/[slug]-[YYYY-MM-DD].md`，并包含以下 frontmatter 文件头：
   ```markdown
   ---
   source_url: [url]
   fetched: [YYYY-MM-DD]
   ---
   ```
5. 从第 2 步开始继续执行**单一来源摄取**（文件现在位于 `.raw/` 中）。

---

## 图像 / 视觉内容摄取

触发条件：用户传入图像文件路径（`.png`、`.jpg`、`.jpeg`、`.gif`、`.webp`、`.svg`、`.avif`）。

步骤：

1. 使用 Read 工具**读取**图像文件。Claude 可以原生处理图像。
2. **描述**图像内容：提取所有文本（OCR），识别图像中可见的关键概念、实体、图表和数据。
3. 将描述保存到 `.raw/images/[slug]-[YYYY-MM-DD].md`：
   ```markdown
   ---
   source_type: image
   original_file: [original path]
   fetched: YYYY-MM-DD
   ---
   # Image: [slug]

   [Full description of image contents, transcribed text, entities visible, etc.]
   ```
4. 如果图像尚未存入知识库，则将其复制到 `_attachments/images/[slug].[ext]`。
5. 对保存的描述文件继续执行**单一来源摄取**。

使用场景：白板照片、屏幕截图、图表、信息图、文档扫描件。

---

## 单一来源摄取

触发条件：用户将文件放入 `.raw/` 或粘贴内容。

步骤：

1. **完整阅读**来源内容。不要略读。
2. 与用户**讨论**关键要点。询问：“我应该重点关注什么？粒度要多细？”如果用户说“直接摄取即可”，则跳过此步骤。
3. 在 `wiki/sources/` 中**创建**来源摘要。使用 `references/frontmatter.md` 中的来源 frontmatter schema。按照下方的**地址分配**章节分配地址。
4. 为提及的每个人物、组织、产品和仓库**创建或更新**实体页面。每个实体对应一个页面。为新的实体页面分配地址。
5. 为重要的思想和框架**创建或更新**概念页面。为新的概念页面分配地址。
6. **更新**相关领域页面及其 `_index.md` 子索引。
7. 如果整体情况发生变化，则**更新** `wiki/overview.md`。
8. **更新** `wiki/index.md`。为所有新页面添加条目。
9. 使用本次摄取的上下文**更新** `wiki/hot.md`。
10. **追加**内容到 `wiki/log.md`（新条目置于顶部）：
    ```markdown
    ## [YYYY-MM-DD] ingest | Source Title
    - Source: `.raw/articles/filename.md`
    - Summary: [[Source Title]]
    - Pages created: [[Page 1]], [[Page 2]]
    - Pages updated: [[Page 3]], [[Page 4]]
    - Key insight: One sentence on what is new.
    ```
11. **检查矛盾。**如果新信息与现有页面冲突，请在两个页面中都添加 `> [!contradiction]` 标注。

---

## 批量摄取

触发条件：用户放入多个文件，或说“摄取所有这些文件”。

步骤：

1. 列出所有要处理的文件。开始前请用户确认。
2. 按照单一来源摄取流程处理每个来源。将来源之间的交叉引用推迟到步骤 3。
3. 处理完所有来源后：执行一次交叉引用检查。寻找新摄取的来源之间的联系。
4. 仅在最后统一更新索引、热缓存和日志（而不是逐个来源更新）。
5. 报告：“已处理 N 个来源。创建了 X 个页面，更新了 Y 个页面。以下是我发现的关键联系。”

批量摄取的交互性较低。对于 30 个以上的来源，预计需要较长的处理时间。每处理 10 个来源后向用户汇报一次进度。

---

## 上下文窗口规范

令牌预算很重要。摄取期间请遵循以下规则：

- 首先阅读 `wiki/hot.md`。如果其中包含相关上下文，就不要重新阅读完整页面。
- 创建新页面前，先阅读 `wiki/index.md` 以查找现有页面。
- 每次摄取仅阅读 3-5 个现有页面。如果需要阅读 10 个以上，说明你的阅读范围过于宽泛。
- 使用 PATCH 进行局部修改。绝不要为了更新一个字段而重新读取整个文件。
- 保持 Wiki 页面简短。最多 100-300 行。如果页面超过 300 行，请将其拆分。
- 使用搜索（`/search/simple/`）查找特定内容，而无需阅读完整页面。

---

## 矛盾

> [!note] 自定义标注框依赖项
> 下文使用的 `[!contradiction]` 标注框类型是在 `.obsidian/snippets/vault-colors.css` 中定义的**自定义标注框**（由 `/wiki` 脚手架自动安装）。启用该代码片段后，它会以红棕色样式和警告三角形图标呈现。如果缺少该代码片段，Obsidian 会回退到默认标注框样式，因此页面仍然可以正常使用，只是没有视觉上的修饰效果。有关四种自定义标注框（`contradiction`、`gap`、`key-insight`、`stale`），请参阅 [[skills/wiki/references/css-snippets.md]]。

当新信息与现有 Wiki 页面矛盾时：

在现有页面中添加：
```markdown
> [!contradiction] Conflict with [[New Source]]
> [[Existing Page]] claims X. [[New Source]] says Y.
> Needs resolution. Check dates, context, and primary sources.
```

在新来源摘要中引用该矛盾：
```markdown
> [!contradiction] Contradicts [[Existing Page]]
> This source says Y, but existing wiki says X. See [[Existing Page]] for details.
```

不要悄悄覆盖旧有论断。标记矛盾并让用户决定。

---

## 不应执行的操作

- **`.raw/` 下的源文件不可修改。**不要修改用户放入其中的文件（文章、转录文本、图像）。`.raw/.manifest.json` 增量跟踪器及其 `address_map`（DragonScale 机制 2）是 `wiki-ingest` 自身维护的 `.raw/` 下仅有的文件。将 `.raw/` 下的其他所有文件视为只读源内容。
- 不要创建重复页面。创建前务必检查索引并进行搜索。
- 不要跳过日志条目。每次摄取都必须记录。
- 不要跳过热缓存更新。它能让未来的会话保持高效。

---

## 地址分配（DragonScale 机制 2 MVP）

**可选功能**。仅当 `scripts/allocate-address.sh` 存在且 `.vault-meta/` 存在时，才会运行 DragonScale 地址分配。否则，请跳过整个章节并正常进行摄取。

**功能检测（每次摄取开始时运行）**：

```bash
if [ -x ./scripts/allocate-address.sh ] && [ -d ./.vault-meta ]; then
  DRAGONSCALE_ADDRESSES=1
else
  DRAGONSCALE_ADDRESSES=0
fi
```

当 `DRAGONSCALE_ADDRESSES=0` 时，创建页面时不包含 `address:` frontmatter 字段，并且会完全跳过 `wiki-lint` 的地址验证部分（缺少地址不会被标记为任何严重级别）。这可以为尚未采用 DragonScale 的仓库保留默认插件行为。

当 `DRAGONSCALE_ADDRESSES=1` 时，继续执行本节的其余内容。

---

每个**新创建的非元数据 Wiki 页面**都会在其 frontmatter 中获得一个稳定地址：

```yaml
address: c-000042
```

格式：`c-<6-digit-counter>`。`c-` 前缀表示“创建顺序计数器”。使用零填充。

启用基准日期：**2026-04-23**（Phase 2 发布日期）。`created:` >= 此日期的页面属于启用后的页面，必须具有地址（下文排除的页面除外）。`created:` 早于此日期的页面属于豁免的旧版页面，直到通过有意执行的回填流程为其分配 `l-NNNNNN` 地址。

### 必需工具：`scripts/allocate-address.sh`

地址分配由一个原子化 Bash 辅助脚本负责。该辅助脚本使用 `flock` 锁定 `.vault-meta/.address.lock`，以防止读取—使用—递增过程中的竞态条件；如果计数器文件缺失，它会通过扫描现有 frontmatter 来恢复计数器。

```bash
ADDR=$(./scripts/allocate-address.sh)
# ADDR is now e.g. "c-000042"; counter is already incremented
```

**关键要求**：绝不要对 `.vault-meta/address-counter.txt` 使用 Write 或 Edit 工具。否则会触发 PostToolUse hook，该 hook 会运行 `git add wiki/ .raw/`，并可能以通用提交消息意外提交其他尚未提交的 Wiki 更改。计数器只能通过辅助脚本（Bash 工具）进行修改。

### 辅助脚本模式

- `./scripts/allocate-address.sh` — 以原子方式预留并返回下一个地址。
- `./scripts/allocate-address.sh --peek` — 输出下一个值但不预留（安全、只读）。
- `./scripts/allocate-address.sh --rebuild` — 根据现有 frontmatter 中观察到的最大 `c-NNNNNN` 重新计算计数器。如果页面已有地址，绝不会静默重置为 1。如果怀疑计数器文件损坏，请运行此命令。

### 分配流程（针对每个新页面）

1. 在写入新的非元数据页面之前，调用 `./scripts/allocate-address.sh` 并捕获其输出。
2. 在页面的 frontmatter 中包含 `address: c-XXXXXX`。
3. 在 `.raw/.manifest.json` 的新顶级键 `address_map` 下记录路径到地址的映射（参见下方 schema）。

### `.raw/.manifest.json` 中的 `address_map`

```json
{
  "sources": { ... },
  "address_map": {
    "wiki/concepts/Example.md": "c-000042",
    "wiki/entities/Another.md": "c-000043"
  }
}
```

重新摄取同一来源时（无论是通过 `--force` 还是哈希发生变化），始终先查阅 `address_map`。如果目标页面路径已有地址，则复用该地址。不要分配新地址。

重命名页面时，skill 必须更新 `address_map` 键（旧路径 -> 新路径），同时保留地址值。

### 排除项（不要为其分配地址）

- 元数据文件：`_index.md`、`index.md`、`log.md`、`hot.md`、`overview.md`、`dashboard.md`、`dashboard.base`、`Wiki Map.md`、`getting-started.md`。
- `wiki/folds/` 下的折叠页面（它们使用自身确定性的 `fold_id`）。
- 启用前的旧版页面（`created:` < 2026-04-23）。只有通过有意执行的回填操作，旧版页面才会获得 `l-NNNNNN` 地址。

### 幂等性规则

- 如果正在（重新）写入的页面当前内容中已有 `address:` 字段，则复用该字段。不要分配新地址。
- 如果某个来源被重新摄取，并且 `address_map` 中存在目标路径的映射，则复用该映射。
- 如果该来源之前已被摄取过，并且目标页面没有地址，同时页面的 `created:` 日期处于启用日期之后，则分配一个地址并记录下来。这涵盖了以下情况：较早的摄取操作在 Phase 2 启用前生成了页面；启用截止日期仍然适用（日期早于 2026-04-23 的页面仍视为旧版页面）。

### 并发策略

- 阶段 2 中**仅允许单写入者**。不要从多个会分配地址的 Claude 会话或子代理并行执行摄取。辅助工具中的 `flock` 可以防止计数器损坏，但并不会对页面写入本身进行串行化。
- 为研究或审查而调度的子代理（codex、general-purpose）绝不能调用分配器。在这方面，它们是只读的。
- 多写入者支持是一项延期实现的功能。

### 批量摄取

对每个来源执行单来源摄取时，按顺序分配地址。不要预留一段计数器值。辅助工具的开销很低（一次加锁、一次整数读写）。

---

## 如何思考（10 项原则映射）

使用此技能时，请应用 10 项原则循环。规范框架请参阅 [`skills/think/SKILL.md`](../think/SKILL.md)。

| # | 原则 | 在此处的应用 |
|---|-----------|-------------------|
| 1 | 观察（外部） | 在提取任何内容之前，完整阅读源文件。即使来源很长，也不要走捷径。 |
| 2 | 观察（内部） | 我是否偏向于来源的叙事框架？我的异议在哪里？将其记录为矛盾提示。 |
| 3 | 倾听 | 用户选择来源的意图——是什么让这个来源值得摄取，用户希望从中提取什么？ |
| 4 | 思考 | 哪些实体值得建立页面？哪些概念？需要哪些交叉引用？与现有页面有哪些矛盾？ |
| 5 | 连接（横向） | 此来源的论断与 Wiki 中已有其他来源的论断之间的对照。矛盾是信号最强的发现。 |
| 6 | 连接（系统） | 使用 `wiki-mode.py route` 确定路径，使用 `wiki-lock.sh` 保障安全，并通过索引、日志和热点内容确保使用者可见。 |
| 7 | 感受 | 创建能够持续积累价值的页面——不仅在今天有用，6 个月后也仍然有用。跳过填充内容；优先综合提炼，而非照搬转录。 |
| 8 | 接受 | 并非每项论断都值得写入 Wiki。编辑判断是摄取过程的一部分，而不是需要消除的缺陷。 |
| 9 | 创造 | 创建包含完整 frontmatter 的来源、实体和概念页面；添加交叉引用；必要时添加矛盾提示。 |
| 10 | 成长 | 摄取过程中发现的矛盾是最有价值的 Wiki 信号。将其记录为待跟进的问题，不要悄然略过。 |