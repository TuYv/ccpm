---
name: wiki-lint
description: >
  Health check the Obsidian wiki vault. Finds orphan pages, dead wikilinks, stale claims,
  missing cross-references, frontmatter gaps, and empty sections. Creates or updates
  Dataview dashboards. Generates canvas maps. Triggers on: "lint", "health check",
  "clean up wiki", "check the wiki", "wiki maintenance", "find orphans", "wiki audit".
---
# wiki-lint：Wiki 健康检查

每完成 10–15 次摄取后或每周运行一次 lint。自动修复任何内容之前需先询问。将 lint 报告输出到 `wiki/meta/lint-report-YYYY-MM-DD.md`。

---

## 传输方式（v1.7+）

Lint 主要执行读取操作，随后写入单个报告文件。两者均遵循标准传输策略。读取 `.vault-meta/transport.json`（由 `bash scripts/detect-transport.sh` 自动创建）：

- **cli** — 单独读取时使用 `obsidian-cli read "$VAULT" "$NOTE"`；`obsidian-cli backlinks "$VAULT" "$NOTE"` 可原生处理反向链接图谱（避免通过 Grep 重新实现）；参见 [`skills/wiki-cli/SKILL.md`](../wiki-cli/SKILL.md)
- **mcp-obsidian** / **mcpvault** — `mcp__obsidian-vault__read_multiple_notes`、`list_all_tags`
- **filesystem** — Claude 的 `Read`/`Glob`/`Grep`（最终兜底方案；当前 v1.6 的行为）

完整决策树：[`wiki/references/transport-fallback.md`](../../wiki/references/transport-fallback.md)。DragonScale 机制 3 的平铺 lint 使用独立的代码路径（Python 脚本），并绕过传输方式选择。

---

## Lint 检查项

按以下顺序执行：

1. **孤立页面**。没有任何入站 Wiki 链接的 Wiki 页面。它们确实存在，但没有任何内容指向它们。
2. **失效链接**。指向不存在页面的 Wiki 链接。
3. **过时论断**。较旧页面中已被较新来源反驳或更新的断言。
4. **缺失页面**。在多个页面中被提及，但没有独立页面的概念或实体。
5. **缺失交叉引用**。页面中提及但未添加链接的实体。
6. **Frontmatter 缺失**。缺少必填字段（type、status、created、updated、tags）的页面。
7. **空章节**。标题下方没有任何内容。
8. **过时的索引条目**。`wiki/index.md` 中指向已重命名或已删除页面的条目。
9. **地址有效性**（DragonScale 机制 2）。对于每个包含 `address:` frontmatter 字段的页面，验证其格式。参见下方的**地址验证**章节。
10. **语义平铺**（DragonScale 机制 3，可选启用）。通过嵌入向量余弦相似度，标记可能重复的候选页面（涵盖所有扫描类型，而不仅限于概念）。参见下方的**语义平铺**章节。

---

## Lint 报告格式

在 `wiki/meta/lint-report-YYYY-MM-DD.md` 创建：

```markdown
---
type: meta
title: "Lint Report YYYY-MM-DD"
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [meta, lint]
status: developing
---

# Lint Report: YYYY-MM-DD

## Summary
- Pages scanned: N
- Issues found: N
- Auto-fixed: N
- Needs review: N

## Orphan Pages
- [[Page Name]]: no inbound links. Suggest: link from [[Related Page]] or delete.

## Dead Links
- [[Missing Page]]: referenced in [[Source Page]] but does not exist. Suggest: create stub or remove link.

## Missing Pages
- "concept name": mentioned in [[Page A]], [[Page B]], [[Page C]]. Suggest: create a concept page.

## Frontmatter Gaps
- [[Page Name]]: missing fields: status, tags

## Stale Claims
- [[Page Name]]: claim "X" may conflict with newer source [[Newer Source]].

## Cross-Reference Gaps
- [[Entity Name]] mentioned in [[Page A]] without a wikilink.
```

---

## 命名约定

在 lint 期间强制执行以下约定：

| 元素 | 约定 | 示例 |
|---------|-----------|---------|
| 文件名 | 使用带空格的标题式大小写 | `Machine Learning.md` |
| 文件夹 | 使用小写字母和连字符 | `wiki/data-models/` |
| 标签 | 使用小写字母，采用层级结构 | `#domain/architecture` |
| Wikilink | 与文件名完全匹配 | `[[Machine Learning]]` |

整个仓库中的文件名必须唯一。只有在文件名唯一时，不带路径的 Wikilink 才能正常工作。

---

## 写作风格检查

在 lint 期间，标记违反风格指南的页面：

- 未使用陈述性的现在时（使用“X basically does Y”而不是“X does Y”）
- 提出主张时缺少来源引用
- 未使用 `> [!gap]` 标记不确定性
- 未使用 `> [!contradiction]` 标记矛盾

---

## Dataview 仪表板

使用以下查询创建或更新 `wiki/meta/dashboard.md`：

````markdown
---
type: meta
title: "Dashboard"
updated: YYYY-MM-DD
---
# Wiki Dashboard

## Recent Activity
```dataview
TABLE type, status, updated FROM "wiki" SORT updated DESC LIMIT 15
```

## Seed Pages (Need Development)
```dataview
LIST FROM "wiki" WHERE status = "seed" SORT updated ASC
```

## Entities Missing Sources
```dataview
LIST FROM "wiki/entities" WHERE !sources OR length(sources) = 0
```

## Open Questions
```dataview
LIST FROM "wiki/questions" WHERE answer_quality = "draft" SORT created DESC
```
````

---

## Canvas 地图

创建或更新 `wiki/meta/overview.canvas`，以生成可视化领域地图：

```json
{
  "nodes": [
    {
      "id": "1",
      "type": "file",
      "file": "wiki/overview.md",
      "x": 0, "y": 0,
      "width": 300, "height": 140,
      "color": "1"
    }
  ],
  "edges": []
}
```

为每个领域页面添加一个节点。连接存在大量交叉引用的领域。颜色映射到 CSS 配色方案：1=蓝色，2=紫色，3=黄色，4=橙色，5=绿色，6=红色。

---

## 地址验证（DragonScale 机制 2 MVP）

**选择加入的功能。** 仅当仓库使用 DragonScale 时才运行地址验证，检测方式如下：

```bash
if [ -x ./scripts/allocate-address.sh ] && [ -f ./.vault-meta/address-counter.txt ]; then
  DRAGONSCALE_ADDRESSES=1
else
  DRAGONSCALE_ADDRESSES=0
fi
```

当 `DRAGONSCALE_ADDRESSES=0` 时，跳过整个章节。不要标记缺失的 `address:` 字段，即使是信息性提示也不要标记。对于碰巧包含 `address:` 字段的页面，直接传递且不进行验证（将其视为用户管理的元数据）。

当 `DRAGONSCALE_ADDRESSES=1` 时，继续执行下面的上线基准和检查。

上线基准：**2026-04-23**（在该日采用 DragonScale 的仓库中，Phase 2 的发布日期）。较晚采用 DragonScale 的仓库应将任何已分配地址页面中最早的 `created:` 日期设为其个人上线日期，以覆盖此基准。将所选基准记录在 `.vault-meta/legacy-pages.txt` 顶部，作为注释行：`# rollout: YYYY-MM-DD`。

### 分类规则（逐页应用）

在验证任何内容之前，先对页面进行分类：

| 分类 | 条件 |
|---|---|
| **元数据 / fold / 已排除** | 文件位于 `wiki/folds/` 中，或者文件名属于 `{_index.md, index.md, log.md, hot.md, overview.md, dashboard.md, dashboard.base, Wiki Map.md, getting-started.md}`。不要求地址。 |
| **上线后（必须有地址）** | `type` 不是 meta/fold，并且 frontmatter 中的 `created:` 日期 >= 2026-04-23，且文件路径不在旧版基准清单中。 |
| **旧版（可回填）** | `type` 不是 meta/fold，并且 frontmatter 中的 `created:` 日期 < 2026-04-23，或者文件路径在旧版基准清单中。在回填之前不要求地址。 |

**旧版基线清单**：位于 `.vault-meta/legacy-pages.txt` 的可选文件，每行一个相对路径。其中列出的页面无论 `created:` 日期如何，都视为旧版页面。可使用此文件将 `created:` 元数据错误或缺失的页面纳入旧版页面范围。

### 验证检查（按顺序执行）

1. **格式检查**：任何设置了 `address:` 的页面都必须匹配以下格式之一：
   - `^c-[0-9]{6}$` — 推出后创建的地址。
   - `^l-[0-9]{6}$` — 旧版回填地址。
   - `wiki/folds/` 下的页面使用 `fold_id`，而不是 `address`；不要在那里应用 `c-`/`l-` 正则表达式。

2. **唯一性检查**：任意两个页面不得共享相同的地址值。报告两个路径。

3. **计数器一致性**：`./scripts/allocate-address.sh --peek` 返回下一个计数器值。观察到的每个 `c-NNNNNN` 都必须满足 `NNNNNN < peek_value`。违反此条件 = 计数器漂移。

4. **推出后强制要求**：每个被归类为“推出后（必须有地址）”但缺少 `address:` 字段的页面都属于 lint **错误**，而非提示信息。这可以防止新页面跳过地址分配的静默回归路径。

5. **旧版识别**：每个被归类为“旧版”但缺少地址的页面都属于提示信息。lint 报告会将它们列在“待回填”下，并给出总数。

6. **地址映射一致性**（`.raw/.manifest.json`）：对于 `address_map` 中的每个页面路径，该页面必须存在，并且其 frontmatter 中的 `address` 必须与映射一致。不一致属于错误（可能是重命名时遗漏了映射更新，或手动编辑导致两者出现差异）。

### Lint 处理方式摘要

- 已有地址但格式错误的页面：**错误**。
- 已有地址但地址发生冲突的页面：**错误**。
- 被归类为**推出后**但没有地址的页面：**错误**。
- 被归类为**旧版**但没有地址的页面：**提示信息**（符合预期）。
- 没有 `address` 的元页面和折叠页面：**忽略**（不适用）。
- 计数器漂移（观察到的计数器 >= peek）：**错误**。
- 地址映射不一致：**错误**。

Lint 只负责观察。不要在 lint 期间自动分配缺失的地址。地址分配仅由 `wiki-ingest` 负责。

### Lint 报告中的输出部分

```markdown
## Address Validation

- Counter state: `$(./scripts/allocate-address.sh --peek)`
- Highest c- address observed: c-XXXXXX
- Post-rollout pages checked: N (X passing, Y errors)
- Legacy pages pending backfill: M

### Errors
- [[Page Name]]: invalid address format `{value}`. Expected `c-NNNNNN` or `l-NNNNNN`.
- [[Page A]] and [[Page B]] share address `c-000042`.
- [[Post-Rollout Page]]: missing address. Page created 2026-04-25 (post-rollout); address required. Run wiki-ingest or manually run `./scripts/allocate-address.sh` and add to frontmatter.
- [[Page Name]] has address `c-000100` but counter peek is `50`. Counter drift; run `./scripts/allocate-address.sh --rebuild`.
- `.raw/.manifest.json` maps `wiki/foo.md` -> `c-000010` but page frontmatter has `c-000012`. Resolve mismatch.

### Pending backfill (informational)
- M legacy pages without addresses. See `.vault-meta/legacy-pages.txt` for the canonical legacy set, or filter by `created:` < 2026-04-23.
```

---

## 语义平铺（DragonScale 机制 3 MVP，选择启用）

**选择启用的功能。** 语义平铺使用嵌入向量的余弦相似度，标记可能重复的*页面*（不仅限于概念页面——参见下方的范围）。默认仅使用本地 ollama；远程端点需要显式指定覆盖标志。

### 检测与委派

```bash
if [ -x ./scripts/tiling-check.py ] && command -v python3 >/dev/null 2>&1; then
  ./scripts/tiling-check.py --peek > /tmp/tiling-peek.json 2>/dev/null
  PEEK_EXIT=$?
  case $PEEK_EXIT in
    0)  TILING_READY=1 ;;                                  # ready
    2)  TILING_READY=0 ; echo "tiling ERROR: usage error (exit 2); inspect /tmp/tiling-peek.json" ;;
    3)  TILING_READY=0 ; echo "tiling ERROR: cache corrupt (exit 3); inspect .vault-meta/tiling-cache.json" ;;
    4)  TILING_READY=0 ; echo "tiling ERROR: vault exceeds scale hard-fail (exit 4); batching required" ;;
    10) TILING_READY=0 ; echo "tiling skipped: ollama not reachable (exit 10)" ;;
    11) TILING_READY=0 ; echo "tiling skipped: run 'ollama pull nomic-embed-text' to enable (exit 11)" ;;
    *)  TILING_READY=0 ; echo "tiling ERROR: unexpected exit code $PEEK_EXIT from tiling-check.py --peek" ;;
  esac
else
  TILING_READY=0
  echo "tiling skipped: scripts/tiling-check.py or python3 not available"
fi
```

每当状态含义不明确时，请检查 `/tmp/tiling-peek.json`（结构化诊断信息：脚本路径、Python 解释器、ollama URL、缓存状态、阈值状态）。绝不要在不作说明的情况下将未知退出码归为“未知状态”。

当 `TILING_READY=1` 时：

```bash
./scripts/tiling-check.py --report wiki/meta/tiling-report-YYYY-MM-DD.md
REPORT_EXIT=$?
case $REPORT_EXIT in
  0)  echo "tiling report written" ;;
  2)  echo "tiling ERROR: usage error during --report" ;;
  3)  echo "tiling ERROR: cache corrupt during --report" ;;
  4)  echo "tiling ERROR: scale hard-fail during --report" ;;
  10) echo "tiling ERROR: ollama became unreachable between --peek and --report" ;;
  11) echo "tiling ERROR: model became unavailable between --peek and --report" ;;
  *)  echo "tiling ERROR: unexpected exit code $REPORT_EXIT from tiling-check.py --report" ;;
esac
```

### 范围（辅助程序扫描的内容）

- 包含：`wiki/` 下的每个 `.md` 文件，**但不包括**下方列出的排除项。范围是“候选可平铺页面”，而不仅仅是 `type: concept`。
- 排除（路径）：`wiki/folds/` 或 `wiki/meta/` 下的任何内容。
- 排除（文件名）：`_index.md`、`index.md`、`log.md`、`hot.md`、`overview.md`、`dashboard.md`、`Wiki Map.md`、`getting-started.md`。
- 排除（frontmatter）：`type: meta` 或 `type: fold`。
- 排除（安全性）：符号链接。任何本身为符号链接，或解析后路径超出仓库根目录的页面文件都会被跳过。

如果将真实概念放在 `wiki/meta/` 下，无论其内容如何，都会因路径而被排除。请将概念保存在其规范文件夹中。

### 辅助程序的工作原理

- 默认通过 ollama 的 `nomic-embed-text` 模型，为每个包含在范围内的页面计算一个嵌入向量。
- 将嵌入向量缓存在 `.vault-meta/tiling-cache.json`，以 `sha256(model + body)` 为键，因此模型漂移会自动使缓存失效。Frontmatter 不属于哈希或嵌入输入的一部分——纯粹的 frontmatter 编辑（标签变更、状态提升）不会触发重新计算。
- 对孤立项执行 GC：当缓存中的页面路径不再存在于磁盘上时，其条目会在保存时被删除。
- 并发安全：在缓存 I/O 期间对 `.vault-meta/.tiling.lock` 使用独占 flock；使用按 PID 区分的临时文件实现原子写入。

### 安全态势

- 默认使用 `http://127.0.0.1:11434`。仅当指定 `--allow-remote-ollama` 时才接受 `OLLAMA_URL` 环境变量覆盖，因为页面正文会通过 POST 请求作为嵌入输入发送。
- 拒绝符号链接以及逃逸出知识库根目录的路径。

### 默认分段（保守的初始值，未经校准）

| 分段 | 相似度 | 报告章节 |
|---|---|---|
| 错误 | `>= 0.90` | **错误** — 高度近似重复，很可能是同一概念 |
| 审查 | `0.80 - 0.90` | **审查** — 可能存在知识单元重叠；需要人工判断 |
| 通过 | `< 0.80` | 不输出 |

**这些值是保守的初始值，并非基于文献的插值结果。** 已发布的参考点：Sentence Transformers 的 `community_detection` 默认值为 0.75；根据目标函数的不同，Quora 重复问题校准结果约为 0.7715-0.8352。0.80 的审查下限已经比至少一个引用的 Quora 最优值更严格，因此相较于这些基准，预计会出现**假阴性**。如果希望获得更高的敏感度，请在校准期间降低审查下限。

### 校准流程（手动，每个知识库执行一次）

1. 使用默认值运行辅助工具。收集落入**审查**分段的配对。
2. 暂时将 `.vault-meta/tiling-thresholds.json` 中的 `bands.review` 降低到 `0.70`，以获取范围更广的样本。目标是获得至少 50 个分布在 0.70-0.95 范围内的配对。
3. 为每个配对标注：`duplicate`、`similar`、`distinct`。
4. 选择分段，使其满足：(a) `error` 分段包含至少 95% 的真实重复项；(b) `review` 分段能够捕获 `similar` 配对，同时避免报告被 `distinct` 配对淹没。
5. 编辑 `.vault-meta/tiling-thresholds.json`：设置新的 `bands.error` 和 `bands.review`，将 `calibrated: true`，并将 `calibration_pairs_labeled` 设置为已标注数量。
6. 重新运行 lint。报告页脚现在会显示 `calibrated: true`。

### 规模

- 冷缓存成本为向 ollama 发出 O(N) 次 POST 请求。热缓存成本为在纯 Python 中执行 O(N^2) 次余弦相似度计算。
- 当页面数超过 500 时，辅助工具会输出警告；超过 5000 时则会硬失败（退出码 4）。在超过任一限制之前，请重新评估实现方式（批处理、向量化余弦相似度计算或外部工具）。

### 嵌入 lint 报告

```markdown
## Semantic Tiling
See [[tiling-report-YYYY-MM-DD]] for the full pair listing.
- Errors (>=0.90): N pairs
- Review (0.80-0.90): M pairs
- Calibrated: true|false
```

### 不变量

- 只读。`tiling-check.py` 绝不会修改 Wiki 页面。
- 不自动合并。只列出重复项，绝不自动解决。
- 缓存采用增量方式，并按模型划分。不会重新嵌入未发生变化的页面。
- 退出码：`0` 表示正常，`2` 表示用法错误，`3` 表示缓存损坏，`4` 表示规模硬失败，`10` 表示 ollama 无法访问，`11` 表示模型缺失。应明确呈现所有这些退出码；不要将其归入单一的“未知”类别。

---

## 自动修复之前

始终先显示 lint 报告。询问：“应该自动修复这些问题，还是逐一审查？”

可安全地自动修复：
- 使用占位值添加缺失的 frontmatter 字段
- 为缺失的实体创建存根页面
- 为未链接的提及添加 Wiki 链接

修复前需要审查：
- 删除孤立页面（它们可能是有意隔离的）
- 解决矛盾（需要人工判断）
- 合并重复页面

---

## 如何思考（10 项原则映射）

处理此技能时，请应用 10 项原则循环。规范框架请参阅 [`skills/think/SKILL.md`](../think/SKILL.md)。

| # | 原则 | 在此处的应用 |
|---|------|--------------|
| 1 | 观察（外部） | 扫描每个页面、每个 Wiki 链接和每个前置元数据块。不要因为内容量大或看起来显而易见而跳过。 |
| 2 | 观察（内部） | 我是否倾向于认为“看起来没问题”？假装自己是一名抱有敌意的读者，寻找真正存在的问题。 |
| 3 | 倾听 | 用户是否在本次会话中提到了具体问题？优先处理这些问题，而非进行通用检查。 |
| 4 | 思考 | 哪些检查最重要？按严重程度（阻断 / 高 / 中 / 低）对发现的问题分级，而不是按修复难易程度分级。 |
| 5 | 连接（横向） | 孤立页面、失效链接和前置元数据缺失等模式经常同时出现。将发现的问题归类，以揭示根本原因。 |
| 6 | 连接（系统） | 平铺检查 + Dataview 仪表板 + Canvas 概览——需要整合多个 lint 检查界面。 |
| 7 | 感受 | lint 报告应该帮助人，而不是让人感到羞愧。可操作的事项胜过面面俱到的问题清单。 |
| 8 | 接受 | 某些 lint 发现是有意为之的（特意设计的孤立页面、有意保留的存根）。标记它们，但不要强制修改。 |
| 9 | 创造 | 在 `wiki/meta/lint-report-YYYY-MM-DD.md` 生成包含分级发现的 lint 报告。 |
| 10 | 成长 | 反复出现的 lint 发现应成为流程改进目标，而不只是一次性修复。 |