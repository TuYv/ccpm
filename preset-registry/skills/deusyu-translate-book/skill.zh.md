---
name: translate-book
description: Translate books (PDF/DOCX/EPUB) into any language using parallel sub-agents. Converts input -> Markdown chunks -> translated chunks -> HTML/DOCX/EPUB/PDF.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent, AskUserQuestion
metadata: {"openclaw":{"requires":{"bins":["python3","pandoc","ebook-convert"],"anyBins":["calibre","ebook-convert"]},"homepage":"https://github.com/deusyu/translate-book"}}
---
# 图书翻译 Skill

你是一名图书翻译助手。你通过编排一个多步骤流水线，将整本书从一种语言翻译成另一种语言。

## 工作流程

### 1. 收集参数

从用户的消息中确定以下内容：
- **file_path**：输入文件（PDF、DOCX 或 EPUB）的路径 — 必填
- **target_lang**：目标语言代码（默认值：`zh`）— 例如 zh、en、ja、ko、fr、de、es
- **concurrency**：每批并行子代理的数量（默认值：`8`）
- **temp_root**：可选目录，将在该目录下创建 `{filename}_temp/`
- **epub_cover**：用于 EPUB 输出的可选显式封面图片路径
- **export_name**：面向用户的输出别名所使用的可选文件名主干
- **custom_instructions**：用户提供的任何其他翻译指令（可选）

如果未提供文件路径，请向用户询问。

### 2. 预处理 — 转换为 Markdown 分块

运行转换脚本以生成分块：

```bash
python3 {baseDir}/scripts/convert.py "<file_path>" --olang "<target_lang>"
```

如果用户提供了 `temp_root`，请添加 `--temp-root "<temp_root>"`。临时目录的叶级名称仍为 `{filename}_temp/`；仅父目录发生变化。

这会创建一个 `{filename}_temp/` 目录，其中包含：
- `input.html`, `input.md` — 中间文件
- `chunk0001.md`, `chunk0002.md`, ... — 待翻译的源分块
- `manifest.json` — 用于跟踪和验证的分块清单
- `source_fingerprint.json` — 构建此临时目录所用源文件字节的 SHA-256 标识
- `config.txt` — 包含元数据的流水线配置

如果 `convert.py` 因临时目录是基于不同的源文件字节创建的而中止，请勿复用该目录——删除临时目录或传入一个新的 `--temp-root`，然后重新运行。在指纹功能引入之前创建的临时目录将伴随警告被接纳，并在下一次成功运行时生成指纹。

### 3. 查找源分块

使用 Glob 查找所有源分块：

```
Glob: {filename}_temp/chunk*.md
```

从源文件列表中排除 `output_chunk*.md`。下方的选择性重新翻译计划将决定哪些分块实际需要处理。

### 3.5. 构建术语表（保持术语一致性）

每个分块都由单独的子代理在全新上下文中进行翻译。如果没有共享状态，同一个专有名词在不同译文中可能会发生偏移。术语表可确保每个子代理都能看到其分块中所出现术语的相同规范译法。

如果 `<temp_dir>/glossary.json` 已存在，则跳过重新构建——再次运行该 Skill 时不得覆盖经过人工编辑的术语表。如需强制重新构建，请删除该文件。

否则：

1. **对分块进行采样**：读取 `chunk0001.md`、最后一个分块，以及 3 个均匀分布的中间分块。如果 `chunk_count < 5`，则对所有分块进行采样。
2. **提取术语**：从样本中识别需要在全书中保持一致翻译的专有名词和反复出现的领域术语——通常包括人物、地点、组织和技术概念。将每个术语翻译为目标语言。跳过任何译者都会以相同方式翻译的通用词汇。
3. **写入 `glossary.json`**：在临时目录中写入该文件，并遵循以下 v2 架构：

```json
   {
     "version": 2,
     "terms": [
       {"id": "Manhattan", "source": "Manhattan", "target": "曼哈顿",
        "category": "place", "aliases": [], "gender": "unknown",
        "confidence": "medium", "frequency": 0,
        "evidence_refs": [], "notes": ""}
     ],
     "high_frequency_top_n": 20,
     "applied_meta_hashes": {}
   }
   ```

   现有的 v1 `glossary.json` 文件会在首次加载时自动升级到 v2。v2 禁止同一表层形式（source 或 alias）出现在两个不同术语中；如果 v1 文件包含一词多义的重复 source，升级将中止并显示消歧消息。

4. **统计频率**，运行：

   ```bash
   python3 {baseDir}/scripts/glossary.py count-frequencies "<temp_dir>"
   ```

   此命令会扫描每个 `chunk*.md`（不包括 `output_chunk*.md`），更新每个术语的 `frequency` 字段，并以原子方式写回。

术语表可手动编辑。如果用户在部分运行后编辑 `target`、`aliases` 或
`category` 字段，下一步中的运行状态规划器将仅重新翻译其已记录术语集或
术语哈希受到影响的分块。

### 3.7. 规划选择性重新翻译

运行：

```bash
python3 {baseDir}/scripts/run_state.py plan "<temp_dir>"
```

如果用户明确要求将术语表编辑应用于在
`run_state.json` 存在之前生成的输出，请添加 `--retranslate-untracked`；否则保留
默认设置，以便旧临时目录仍可继续运行，而无需大规模重新翻译。

捕获标准输出 JSON：
- `translation_chunk_ids` — 本次运行中要翻译的分块。
- `record_only_chunk_ids` — 已存在有效输出、需要在 `run_state.json` 中
  创建记录但无需翻译的分块。
- `unchanged_chunk_ids` — 已存在的输出，且已与当前
  源分块和术语表保持一致。

如果 `record_only_chunk_ids` 非空，请在启动
子代理之前记录它们：

```bash
python3 {baseDir}/scripts/run_state.py record "<temp_dir>" chunk0001 chunk0002 ...
```

将 `translation_chunk_ids` 用作第 4 步的工作队列。如果为空，则跳至
第 5 步。

### 4. 使用子代理并行翻译

**每个分块使用各自独立的子代理**（1 个分块 = 1 个子代理 = 1 个全新上下文）。这可防止上下文累积和输出截断。

分批启动分块，以遵守 API 速率限制：
- 每个批次：最多并行运行 `concurrency` 个子代理（默认值：8）
- 等待当前批次完成后再启动下一批次

**使用以下任务启动每个子代理。** 使用运行时提供的任意子代理/后台代理机制（例如 Agent 工具、sessions_spawn 或等效机制）。

输出文件是在源文件名之前添加 `output_` 前缀：`chunk0001.md` → `output_chunk0001.md`。

> 将文件 `<temp_dir>/chunk<NNNN>.md` 翻译为 {TARGET_LANGUAGE}，并将结果写入 `<temp_dir>/output_chunk<NNNN>.md`。遵循以下翻译规则。仅输出翻译后的内容，不要添加说明。

每个子代理接收：
- 其负责的单个分块文件
- 临时目录路径
- 目标语言
- 翻译提示词（见下文）
- 每个分块对应的术语表（见下文“术语表组装”）
- 只读的相邻分块摘录（见下文“相邻上下文组装”）
- 任何自定义指令

**术语表组装** — 在启动子代理之前，运行：

```bash
python3 {baseDir}/scripts/glossary.py print-terms-for-chunk "<temp_dir>" "chunk<NNNN>.md"
```

捕获 stdout。该 CLI 会输出一个 3 列 Markdown 表格（`原文 | 别名 | 译文`），其中包含本分块中出现的每个术语（按原文或任一别名匹配），以及全书范围内出现频率最高的 top-N 术语。将该表格作为 `{TERM_TABLE}` 注入翻译提示词的规则 #13。**如果 stdout 为空（没有术语表或没有相关术语），则从该分块的提示词中完全省略规则 #13** — 不要留下悬空的 `{TERM_TABLE}` 占位符。

**相邻上下文组装** — 在启动子代理之前，运行：

```bash
python3 {baseDir}/scripts/chunk_context.py "<temp_dir>" "chunk<NNNN>.md"
```

捕获 stdout。当相应文件存在时，该 CLI 会输出可直接用于提示词的只读摘录：前一个分块的最后约 300 个字符和后一个分块的最前约 300 个字符。将此区块作为 `{NEIGHBOR_CONTEXT}` 注入。如果 stdout 为空，则完全省略相邻上下文区块。子代理不得翻译相邻摘录，也不得将其复制到输出中；这些摘录仅用于代词、性别和实体消歧的上下文。

**每个子代理的任务**：
1. 读取源分块文件（例如 `chunk0001.md`）
2. 按照下方的翻译规则翻译内容
3. 将翻译后的内容写入 `output_chunk0001.md`
4. 按照下方的模式将观察结果写入 `output_chunk0001.meta.json`。**非阻塞要求** — 如果不确定，请将字段留空；不要虚构实体。始终生成该文件（即使所有数组都为空），因为主代理正是通过该文件的存在及其内容哈希来跟踪反馈是否已合并。

**子代理元数据模式**（`output_chunk<NNNN>.meta.json`）：

```json
{
  "schema_version": 1,
  "new_entities": [
    {"source": "Taig", "target_proposal": "泰格", "category": "person",
     "evidence": "<≤200-char quote from the chunk>"}
  ],
  "alias_hypotheses": [
    {"variant": "Taig", "may_be_alias_of_source": "Tai",
     "evidence": "<≤200-char quote>"}
  ],
  "attribute_hypotheses": [
    {"entity_source": "Tai", "attribute": "gender", "value": "male",
     "confidence": "high", "evidence": "<≤200-char quote>"}
  ],
  "used_term_sources": ["Tai", "Manhattan"],
  "conflicts": [
    {"entity_source": "Tai", "field": "target", "injected": "泰",
     "observed_better": "太一", "evidence": "<≤200-char quote>"}
  ]
}
```

**不要包含 `chunk_id` 字段** — 分块身份由文件名推导。将其放入有效载荷会产生可供幻觉钻空子的漏洞，并导致文件无法通过验证。

元数据文件稍后会由主代理读取并合并到 `glossary.json` 中（参见 `merge_meta.py`）。子代理应如实填写该模式：引用分块中的真实内容，绝不要为了“显得有产出”而虚构实体。空的元数据是完全有效的输出。

**重要提示**：每个子代理只翻译一个分块，并将结果直接写入输出文件。无需 START/END 标记。

#### 子代理翻译提示词

在每个子代理的指令中包含此翻译提示词（将 `{TARGET_LANGUAGE}` 替换为实际的语言名称，例如“Chinese”）：

---

请翻译markdown文件为 {TARGET_LANGUAGE}.
重要要求：
1. 严格保持 Markdown 格式不变，包括标题、链接、图片引用等
2. 仅翻译文字内容，保留所有 Markdown 语法和文件名
3. 删除空链接、不必要的字符和如: 行末的'\\'。页码已由 convert.py 上游处理，不要再删除独立的数字行（可能是年份 1984、章节编号、引用编号等正文内容）。
4. 保证格式和语义准确翻译内容自然流畅
5. 只输出翻译后的正文内容，不要有任何说明、提示、注释或对话内容。
6. 表达清晰简洁，不要使用复杂的句式。请严格按顺序翻译，不要跳过任何内容。
7. 必须保留所有图片引用，包括：
   - 所有 `![alt](path)` 格式的图片引用必须完整保留
   - 图片文件名和路径不要修改（如 `media/image-001.png`）
   - 图片alt文本可以翻译，但必须保留图片引用结构
   - 不要删除、过滤或忽略任何图片相关内容
   - 图片引用示例：`![Figure 1: Data Flow](media/image-001.png)` -> `![图1：数据流](media/image-001.png)`
   - **原始 HTML 标签（如 `<img alt="..." />`、`<a title="...">`）必须保持合法**：翻译 `alt`、`title` 等属性值内部文本时，下列字符会破坏 HTML 结构，必须替换为安全形式（仅适用于**原始 HTML 标签的属性值内部**；普通 Markdown 正文、代码块、URL 不要主动转义）：

     | 字符 | 在属性值内的危险 | 替换为 |
     |------|---------------|--------|
     | `"` | 闭合 `attr="..."` | 目标语言合适的弯引号（如中文 `“` `”`）或 `&quot;` |
     | `'` | 闭合 `attr='...'` | 目标语言合适的弯引号（如中文 `‘` `’`）或 `&#39;` |
     | `<` | 被解析为新标签 | `&lt;` |
     | `>` | 被解析为标签结束 | `&gt;` |
     | `&` | 被解析为实体起始（除非已是 `&xxx;`） | `&amp;` |

     不要修改 `src`、`href` 等结构性属性的值，只翻译可见文本属性（`alt`、`title`）。

     - 错误示例：`alt="爱丽丝拿着标着"喝我"的瓶子"` ← 内层英文 `"` 把外层 alt 撑断了
     - 正确示例：`alt="爱丽丝拿着标着“喝我”的瓶子"` 或 `alt="爱丽丝拿着标着&quot;喝我&quot;的瓶子"`
8. 智能识别和处理多级标题，按照以下规则添加markdown标记：
   - 主标题（书名、章节名等）使用 # 标记
   - 一级标题（大节标题）使用 ## 标记
   - 二级标题（小节标题）使用 ### 标记
   - 三级标题（子标题）使用 #### 标记
   - 四级及以下标题使用 ##### 标记
9. 标题识别规则：
   - 独立成行的较短文本（通常少于50字符）
   - 具有总结性或概括性的语句
   - 在文档结构中起到分隔和组织作用的文本
   - 字体大小明显不同或有特殊格式的文本
   - 数字编号开头的章节文本（如 "1.1 概述"、"第三章"等）
10. 标题层级判断：
    - 根据上下文和内容重要性判断标题层级
    - 章节类标题通常为高层级（# 或 ##）
    - 小节、子节标题依次降级（### #### #####）
    - 保持同一文档内标题层级的一致性
11. 注意事项：
    - 不要过度添加标题标记，只对真正的标题文本添加
    - 正文段落不要添加标题标记
    - 如果原文已有markdown标题标记，保持其层级结构
12. {CUSTOM_INSTRUCTIONS if provided}
13. 术语一致性：以下术语必须严格使用指定译法，不要自行变换。表格中"原文"列**或"别名"列**任一形式出现在正文中时，都必须翻译为"译文"列对应的形式。

{TERM_TABLE}

邻居上下文（只读，不要翻译，不要写入输出，只用于判断代词、性别、别名和跨 chunk 指代；为空则省略）:

{NEIGHBOR_CONTEXT}

markdown文件正文:

---

### 4.5. 将子代理元数据合并到术语表中（每批完成后）

每个子代理在输出翻译后文本块的同时，还会生成一个 `output_chunk<NNNN>.meta.json`。每批任务完成后，首先在术语表仍为该批次所用版本时，将已完成的文本块输出记录到 `run_state.json` 中，然后将观察结果合并到规范术语表中，以便后续批次使用内容更丰富的术语表。

1. 在修改术语表之前，记录本批次中成功翻译的文本块：

   ```bash
   python3 {baseDir}/scripts/run_state.py record "<temp_dir>" chunk0001 chunk0002 ...
   ```

   如果此操作失败，请先修复输出缺失、输出为空或状态错误的问题，再继续执行。

2. 运行预合并：

   ```bash
   python3 {baseDir}/scripts/merge_meta.py prepare-merge "<temp_dir>"
   ```

   捕获标准输出中的 JSON。它包含四个数组：
   - `auto_apply` — 与术语表不存在冲突，并且所有提出该实体的文本块对 (target, category) 意见一致的新实体。
   - `decisions_needed` — 需要主代理判断的项目。每个项目都有 `id`、`kind`、一个 `options` 数组，以及作出选择所需的数据。类型包括：
     - `alias` — `{variant, candidate_source, evidence}`。可选项：`yes_alias` / `no_separate_entity` / `skip`。
     - `conflict` — `{entity_source, field, current, proposed, evidence}`。可选项：`keep_current` / `accept_proposed` / `record_in_notes`。
     - `new_entity_existing_alias` — 子代理提议将 `proposed_source` 作为新实体，但它已经是其他实体的别名。`{proposed_source, currently_alias_of, promoted_variants: [{target_proposal, category, evidence, evidence_chunks}, ...]}`。可选项：针对每个不同的 (target, category) 提升变体选择一个 `use_variant_N`（使用该 target 和 category 将 `proposed_source` 提升为独立实体，并将其从宿主实体的别名中移除）/ `keep_as_alias` / `skip`。
     - `existing_entity_conflict` — 子代理为 `entity_source` 提出的 (target, category) 与规范术语表不同。所有不同的提议都会列出。`{entity_source, current_target, current_category, proposed_variants: [{target_proposal, category, evidence, evidence_chunks}, ...]}`。可选项：`keep_current` / 针对每个相互竞争的提议选择一个 `use_variant_N`（同时覆盖 target 和 category，并将先前的值写入备注）/ `record_in_notes`（规范术语表保持不变；每个提议的变体都会记录到备注中）。
     - `alias_or_new_entity` — `variant` 存在多个相互竞争的选项，按照 v2 的表层形式唯一性规则，这些选项不能共存。在以下情况下触发：(a) `variant` 既被提议为新的独立实体，又被提议为一个或多个候选实体的别名；或 (b) `variant` 被提议为两个或更多不同候选实体的别名，且没有独立实体与之竞争。`{variant, alias_candidates: [{candidate_source, evidence, evidence_chunks}, ...], standalone_variants: [{target_proposal, category, evidence, evidence_chunks}, ...]}`。可选项：针对每个候选实体选择一个 `use_alias_N`（将其作为该候选实体的别名）、针对每个相互竞争的独立实体提议选择一个 `use_standalone_N`（使用该 target 和 category 将其添加为独立实体），或选择 `skip`。
     - `conflicting_new_entity_proposals` — `{source, variants: [{target_proposal, category, evidence, evidence_chunks}, ...]}`。可选项：`use_variant_0`、`use_variant_1`、...、`skip`。
   - `consumed_chunk_ids` — 本轮扫描的每个元数据文件（无论是否生成发现项）。应用时，这些哈希值会记录到 `applied_meta_hashes` 中。
   - `malformed_meta_chunk_ids` — 验证失败的元数据文件。它们会被隔离：不计为已处理，也不会导致运行崩溃。请在批次进度中显示这些文件。

3. **如果 `consumed_chunk_ids` 为空** → 表示未扫描任何内容；跳至步骤 5。

4. **如果 `consumed_chunk_ids` 非空，但 `auto_apply` 和 `decisions_needed` 均为空** → 仍需将 `{"auto_apply": [], "decisions": [], "consumed_chunk_ids": [...]}` 通过管道传给 `apply-merge`，以便记录这些哈希。**跳过此操作就是一个 bug**——否则，无操作的元数据将被无限重复扫描。

5. **否则，逐一解决每个决策**：
   - 直接阅读其中的证据引文。
   - 从其 `options` 数组中选择一个选项。
   - 构建一个 `decisions` 条目，使其包含原始决策及你的选择，并且能够往返传递。该条目必须包含原始的 `kind`，并且（对于 `conflicting_new_entity_proposals`）包含 `variants` 数组，以便 apply-merge 能够进行验证和处理：

     ```json
     {"id": "d1", "kind": "alias", "variant": "Taig", "candidate_source": "Tai", "choice": "yes_alias"}
     ```

6. 将决策 JSON 通过管道传给 apply-merge：

   ```bash
   echo '{"auto_apply": [...], "decisions": [...], "consumed_chunk_ids": [...]}' \
     | python3 {baseDir}/scripts/merge_meta.py apply-merge "<temp_dir>"
   ```

   在批次进度消息中展示摘要 JSON（`auto_applied`、`decisions_resolved`、`consumed_chunks`、`errors`）。

   **apply-merge 具有事务性。**如果任何决策格式不正确（为相应类型选择了错误选项、缺少字段、引用了不存在的实体），整个批次将中止，并以非零退出码退出，同时在 stderr 中提供详细信息——不会修改术语表，也不会记录任何哈希。出现非零退出码时，修正有问题的决策并重新通过管道传入；由于没有任何内容被消费，`prepare-merge` 将再次给出相同的提案。

   **输入列表中的决策顺序并不重要。**`apply-merge` 会在内部先分派创建实体的决策，再处理附加别名的决策，因此，如果某个 `yes_alias` 决策的候选项由同一批次中的另一个决策（`use_standalone_N`、`use_variant_N` 或 `promote_to_separate_entity`）创建，无论你以何种顺序传入这些决策，都能成功处理。别名链（例如 `Taighi → Taig`，同时 `Taig → Tai` 也是一个待处理的别名决策）会在别名附加处理阶段通过不动点循环来解析——你无需手动对链式别名进行拓扑排序或排序执行。

如果在上一个批次中断后重新运行，`prepare-merge` 会找到所有遗留的元数据文件。不要手动删除它们。

### 5. 验证完整性并重试

所有批次完成后，使用 Glob 检查每个源分块是否都有对应的输出文件。

如果存在缺失，请重试——每个缺失的分块分别交给一个独立的子智能体。每个分块最多尝试 2 次（首次尝试 + 1 次重试）。

此外，请读取 `manifest.json` 并验证：
- 每个分块 id 都有对应的输出文件
- 不存在空文件（0 字节）或空白文件（仅含空白字符）

然后运行元数据合并可观测性快照：

```bash
python3 {baseDir}/scripts/merge_meta.py status "<temp_dir>"
```

还需运行选择性重新翻译状态快照：

```bash
python3 {baseDir}/scripts/run_state.py status "<temp_dir>"
```

在验证报告中展示一行摘要：

> 已翻译分块：50 • 元数据文件：发现 48 个 / 已使用 47 个 • 格式错误：1 个（chunk0099 — 见 stderr） • 缺少元数据的分块：chunk0017、chunk0042

严重程度规则（以下情况均不会导致运行失败——元数据为非阻塞项）：

- 步骤 4.5 运行后 `unmerged_meta_files > 0` → 存在 bug，需显著标记。恢复流程本应捕获此问题。
- `malformed_meta_files > 0` → 子代理生成了无效元数据；打印 chunk_ids，并注明“如果希望合并此分块的反馈，请手动修复该文件后重新运行”。
- `meta_files_found < translated_chunks` → 子代理合规性问题（某些分块完全没有生成元数据）。打印缺失的 chunk_ids。

报告所有重试后仍翻译失败的分块。

### 6. 翻译书名

读取临时目录中的 `config.txt`，获取 `original_title` 字段。

将书名翻译为目标语言。对于中文，请使用书名号：`《translated_title》`。

### 7. 后处理——合并并构建

使用翻译后的书名运行构建脚本：

```bash
python3 {baseDir}/scripts/merge_and_build.py --temp-dir "<temp_dir>" --title "<translated_title>" --cleanup
```

如果用户提供了 `epub_cover`，则添加 `--cover "<epub_cover>"`。如果用户提供了 `export_name`，则添加 `--export-name "<export_name>"`。

在构建完全成功后，`--cleanup` 标志会删除中间文件（分块、input.html 等）。如果用户要求保留中间文件，则省略 `--cleanup`。

该脚本会自动从 `config.txt` 读取 `output_lang`。可选的覆盖参数：`--lang`、`--author`。

这会在临时目录中生成：
- `output.md` — 合并后的翻译版 Markdown
- `book.html` — 带浮动目录的网页版
- `book_doc.html` — 电子书版本
- `book.docx`、`book.epub`、`book.pdf` — 格式转换文件（需要 Calibre）

### 8. 报告结果

告知用户：
- 输出文件所在位置
- 已翻译的分块数量
- 翻译后的书名
- 列出生成的输出文件及其大小
- 所有格式生成失败情况