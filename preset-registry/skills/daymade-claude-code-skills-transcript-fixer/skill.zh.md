---
name: transcript-fixer
description: >-
  Corrects speech-to-text transcription errors using dictionary rules and Claude's built-in AI (no external API key required — Native AI Correction is the DEFAULT). Stage 1 alone is not the job. Stage 3 API is a backup for automation without Claude Code. Builds personalized correction databases that learn from each fix, auto-loads person-name ASR variants from your people roster, and reads per-domain context files that prime the AI pass for context-dependent homophones. Triggers when working with ASR/STT output containing recognition errors, homophones, garbled technical terms, person-name errors, or Chinese/English mixed content. Also triggers on requests to clean up meeting notes, lecture transcripts, interview recordings, or any text produced by speech recognition. Use this skill even when the user just says "fix this transcript", "clean up these meeting notes", or mentions garbled names without invoking ASR specifically.
---
# 转录修正器

使用两阶段循环：

1. 阶段 1 应用确定性的、已知的修正。
2. 原生 AI 校正读取完整转录文本，修正一次性错误，核实不确定的实体，并沉淀可复用的修正。

**默认使用原生 AI 校正。仅运行阶段 1 是不完整的。** 阶段 3 API 仅适用于没有 Claude/Codex 智能体可用的自动化场景。

## 操作约定

- 完成阶段 1 → 原生 AI 校正 → 沉淀已确认的重复性修正。不要仅在阶段 1 完成后就报告转录文本无误。
- 仅当人工明确将本次运行限制为字典处理，或有带日期的产物证明已对这份完全相同的转录文本运行过原生 AI 校正时，才跳过原生 AI。
- 在 Claude Code 或 Codex 中，不要运行阶段 3。请使用阶段 1 加原生工作流。
- 切勿为了提升流畅度而改写发言。每项修正都必须能够解释为合理的 ASR 错误，并保留每句话的实际发言者。
- 切勿推断或重新分配发言者身份。保留发言者标签行；经人工确认的标签和用户裁定具有最高权威性。
- 对无法确定的文本保持原样，并将其加入队列。明显的乱码比流畅但错误的猜测更安全。
- 将单行 `asr_note` 值视为修正来源记录：它会有意引用旧形式，因此不会参与匹配。多行 YAML 台账值不会被屏蔽；关键词、标题、其他源自 ASR 的元数据以及正文文本仍属于修正范围。
- 在执行原生校正之前，完整阅读 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。在执行下文所述的相应操作之前，阅读对应的任务专用参考资料。

## 运行上下文

通过 `uv run` 运行每个入口点；需要第三方 Python 包的入口点会使用 PEP 723 声明依赖，而仅使用标准库/内部依赖的实用程序可以省略元数据块。请从调用此技能时显示的技能目录执行命令，或者在每个脚本路径前加上该目录。不要依赖 `$CLAUDE_SKILL_DIR`；它并非在所有运行环境中都可用。

如果确实不知道软件包位置，请使用 [references/installation_setup.md](references/installation_setup.md) 中的安装解析流程。不要从宽泛的 `find` 结果中选择第一项：缓存、备份和旧版本可能同时存在。

## 快速开始

~~~bash
# Initialize once
uv run scripts/fix_transcription.py --init

# Stage 1 for one project domain. --apply-domain trusts that explicitly
# selected, human-curated project domain at every risk level.
uv run scripts/fix_transcription.py \
  --input meeting.md --stage 1 \
  --domain myproject --apply-domain --json

# Several sibling domains may be loaded as one union.
uv run scripts/fix_transcription.py \
  --input meeting.md --stage 1 \
  --domain myproject,myproject-alt --apply-domain --json

# Preview without writing the Stage 1 output.
uv run scripts/fix_transcription.py \
  --input meeting.md --stage 1 --domain myproject --dry-run

# Scan all documented context traps after the native read-through.
uv run scripts/fix_transcription.py --scan-traps \
  --context-file ~/.transcript-fixer/contexts/myproject.md \
  --input meeting.md
~~~

安全模式是阶段 1 的默认模式：应用低风险规则；中/高风险匹配项会推迟到 `*_needs_review.md` 和持久化审核队列中处理。`Applied: 0` 是有效结果，并不能证明转录文本没有问题。

阶段 1 的 JSON 约定如下：

~~~json
{
  "applied": 0,
  "deferred": 0,
  "output_path": null,
  "needs_review_path": null,
  "input_unchanged": true,
  "review_enqueued": 0,
  "stage1_only_incomplete": true,
  "stage2_total_chunks": 0,
  "stage2_failed_chunks": 0,
  "stage2_degraded": false
}
~~~

请读取全部十个字段。`stage1_only_incomplete` 是在原有六字段调用方约定基础上新增的字段，并且在运行阶段 1 脚本时必须保持为 true；只有调用方可以通过运行原生 AI，或明确选择无代理的阶段 2/3 路径来将其关闭。三个 `stage2_*` 遥测字段始终存在：阶段 1 报告 `0`、`0` 和 `false`；阶段 2/3 会将它们替换为实际的 API 结果。不要根据辅助文件是否存在来推断未执行任何操作或执行成功。

有关原生端到端示例，请阅读 [references/example_session_dji_minutes.md](references/example_session_dji_minutes.md)。

## 选择路径

| 路径 | 适用场景 | 必读内容 |
|---|---|---|
| 快速原生 | 转录文本简短/直白、说话者已知、风险较低 | 本文件 + [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 完整原生 | 涉及大量领域知识、陌生实体、3 位以上说话者，或转录文本很长或承载决策 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md)，以及下方的队列和证据参考资料 |
| 调用方集成 | 由其他技能或采集流水线调用阶段 1 | 下方的 `Cross-skill caller contract` |
| 审核队列/仪表板 | 任何条目存在不确定性或需要音频 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 无代理 API | 没有可用代理时的 CI/批处理自动化 | [glm_api_setup.md](references/glm_api_setup.md) 和 [workflow_guide.md](references/workflow_guide.md) |
| 多文件批处理 | 多个相关的转录文件；尤其是 10 个以上文件时 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |

将词汇和风险作为主要分级信号；仅将长度用作平局时的判定依据。一段五分钟的医疗访谈可能需要完整级别，而一份很长但内容直白的双人备忘录可以使用快速级别。

## 原生纠正检查清单

1. **在阶段 1 之前为文件指定最终名称。** 队列锚点存储绝对路径。在任何推迟项可能入队之前，请使用人类可读的项目文件名。当输入是尚无文件的内联文本（例如斜杠命令参数或粘贴的文本块）时，首先将其写入文件；`--input` 和队列锚点都需要路径，如果下游不会归档该文件，使用临时位置即可。没有提供 `--domain`，且无法从上下文中明显判断领域？省略该标志本身就会默认搜索所有领域（即 `--domain` 自身的默认值），因此不要因选择领域而停滞——直接运行阶段 1，让安全模式控制自动应用的内容。如果仍需解析某个特定候选项，即使在快速级别，验证阶梯中的一个步骤成本也足够低，值得保留，尽管其余步骤并非如此：即 native_ai_full_workflow.md 步骤 4 的第 1 级，执行一次跨领域 `corrections.db` 查询——不是分级表要求你跳过的完整验证阶梯，只是这一项查询。
2. **在阅读预先纠正过的转录文本之前恢复原始基线。** 如果采集流水线或之前的 API 处理已经修改过文本，请先与原始来源进行差异比较。将上游修改视为修改，而不是事实依据。
3. **加载项目先验信息并阅读完整转录文本。** 如果存在 `~/.transcript-fixer/contexts/<domain>.md`，请先阅读该文件，然后通读整个文件，再判断前文中的歧义。
4. **运行阶段 1 并检查实际结果。** 优先使用明确的项目领域以及 `--apply-domain --json`。读取 `deferred` 和 `review_enqueued`；绝不要悄无声息地丢弃辅助文件或忽略队列缺口。
5. **比较阶段 1 与原始文本之间的差异。** 如果某条规则修改了原本正确的话语，请以原始文本为准，使用 `--report-false-positive "<from>" "<to>" --domain <domain>` 停用已存储的纠正对，并验证它不会再次触发。
6. **对每个候选项进行分类处置。**
   - 确信：语音变化合理，并且上下文或权威的本地来源能够确定结果。
   - 需要验证：涉及人员、公司、产品、型号、股票代码、地点、数字或其他关键术语，但没有来源。
   - 不确定：证据无法确定结果；保留原文并将其加入队列。
7. **应用能够解释该语音的最小修改。** 不要添加说话者没有说过的词。也要纠正由 ASR 生成的元数据，同时保持 `asr_note` 不变。
8. **执行第二轮检查。**
   - 所有级别：运行 `--scan-traps`，并检查命中项和 `unparsed`。
   - 完整级别：使用全新上下文的审核器，仅审核一个已纠正文件。要求其提供紧凑的残留问题表，或明确返回 `no new residuals`；空响应或截断响应均视为审核失败。
9. **将每个未解决的条目加入队列。** 遵循下方的 `Review queue safety` 和 [review_queue_dashboard.md](references/review_queue_dashboard.md)。
10. **验证并完成处理。** 比较实际编辑文件的差异；当数字很重要时，运行数值一致性检查；重新运行普通阶段 1；再次搜索已知纠正项；并确认每项更改都可以追溯到相应的分类处置决定。
11. **在同一轮处理中沉淀学习成果。** 将每个稳定模式归入正确的位置；不要让已确认的修正仅停留在聊天中。原生处理中的修改绝不会进入阶段 1 的纠正历史，因此请在最终差异比较后立即以机械化方式收集这些修改：

~~~bash
    # Diff raw vs corrected into parseable trap candidates (review artifact —
    # you adjudicate the printed list; --write auto-appends only the recurring
    # (≥2x) non-bare candidates; --write-all also appends the one-off set)
    uv run scripts/harvest_corrections.py raw.md corrected.md \
      --context-file ~/.transcript-fixer/contexts/<domain>.md
    ~~~

    每个输出的项目符号在打印前，都会通过实际的陷阱解析器进行往返验证；上下文文件中已有记录的配对会被跳过。高频候选项很可能是有效陷阱；仅出现一次的候选项需要人工判断——这就是 `--write` 默认将其排除的原因——并且 ⚠️ 裸形候选项永远不会被自动写入。这取代了凭记忆手动编写陷阱项目符号的做法。
12. **有意识地传播实体修正。** 仅搜索归属项目派生出的笔记/摘要，审查每个匹配项，并排除原始 ASR 和校正伴随文件，因为它们保留了证据链。

详细的来源追溯标准、本地优先实体阶梯、第二轮提示词、队列载荷和最终处理规则，请参阅 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。

## 跨 Skill 调用方契约

调用方流水线有两项相互独立的义务：

1. 使用显式配置的项目领域、`--apply-domain` 和 `--json` 运行阶段 1。如果 `deferred > review_enqueued`，则将审查伴随文件持久化到任何临时目录之外，或将该缺口作为失败暴露出来。
2. 在加载此 Skill 的情况下运行原生 AI，或者报告 `Stage 1 only — incomplete`。无智能体自动化可以改用阶段 3。

规范调用方式：

~~~bash
uv run scripts/fix_transcription.py \
  --input "$staged" --stage 1 \
  --domain "$domains" --apply-domain --json
~~~

仅接入脚本路径的调用方永远不会加载此契约。因此，仅通过脚本路径进行集成只是阶段 1 预筛选，而不是转录校正。

保持项目领域持续更新：原生处理阶段确认的每个重复修正都必须添加回正确的项目领域、人员名册或上下文文件。

## 词典与身份安全

添加规则之前，请阅读 [references/false_positive_guide.md](references/false_positive_guide.md) 和 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。

| 模式 | 目标位置 |
|---|---|
| 稳定的非单词或唯一乱码 → 规范术语 | `--add ... --domain <project>` |
| 重要且反复出现的人物及观察到的 ASR 变体 | 人员名册 |
| 仅在特定提示条件下错误的常见词/真实词 | 领域上下文陷阱，绝不能使用裸规则 |
| 真实姓名 → 另一个真实姓名 | 领域上下文 + 人工/音频验证，绝不能使用裸规则 |
| 已确认正确但反复被重新质疑的实体 | 已确认正确的上下文记录 |
| 仅出现一次、只适用于句子局部的措辞 | 仅编辑；不要添加 |

上下文陷阱是一种提示，而不是允许盲目替换。`--scan-traps` 支持规范的 `→` 映射和旧版 `≈` 映射，两者遵循相同的方向约定：左侧是观察到的 ASR，右侧是预期文本。对于包含空格的精确 FROM 短语，请用反引号包裹：

- **`CC 思维链`/`CC 思维连` → 目标术语** — 仅在该领域记录的提示条件下生效
~~~

这展示的是一个精确的 ASR 短语候选项，而不是人名候选项。领域上下文仍然是实际目标和提示条件的权威依据；扫描器只负责定位字面上的 FROM 形式。

在添加任何形似真实词语的规则之前，请先测量项目语料库：

~~~bash
uv run scripts/fix_transcription.py \
  --probe "candidate" --corpus /path/to/project-transcripts/

uv run scripts/fix_transcription.py \
  --add "candidate" "canonical" --domain myproject \
  --check-corpus --corpus /path/to/project-transcripts/
~~~

用户判定会立即累积生效：修复文件、更新正确的目标位置，并记录经确认无误的结果，以便后续运行时不再询问。

## 审核队列安全

在入队或解决项目之前，请阅读 [references/review_queue_dashboard.md](references/review_queue_dashboard.md)。

最小项目：

~~~json
[
  {
    "file": "/absolute/path/to/transcript.md",
    "line": 142,
    "original": "<suspect-token-only>",
    "suggested": "<best-candidate>",
    "kind": "entity",
    "context": "<verbatim whole sentence>",
    "evidence": "<what was checked>"
  }
]
~~~

安全规则：

- 此工作流必须提供 `file`。如果缺少该字段，接受操作可能只记录判定结果，而不会编辑转录文件。
- `original` 只包含可疑词元/片段；切勿将整个句子放入其中。
- `context` 应逐字复制；正确的键是 `line`，而不是 `line_hint`。
- 正确的键是 `suggested`，而不是 `suggestion`。应使用 `actions`，而不是 `action_pack`。
- 每次只解决一个出现位置；只有在整个批次都解决后，才扫描同一实体的其他出现位置。
- 覆盖后读取 `resolved_text`；列表仍可能显示已被拒绝的建议。
- 如果文件已移动或内容发生偏移，请运行 `--reanchor-review`。在要求时添加 `--reanchor-root` 或 `--reanchor-to`。不要通过手动编辑来绕过待处理项目。
- 根据含义落实每条 `decision_note`；仅存储备注不会改变字典、名册、上下文或误报状态。

核心命令：

~~~bash
uv run scripts/fix_transcription.py --enqueue-review items.json
uv run scripts/fix_transcription.py --list-review --review-status all --json
uv run scripts/fix_transcription.py --show-review <id> --json
uv run scripts/fix_transcription.py --reanchor-review <id>
uv run scripts/fix_transcription.py \
  --resolve-review <id> --decision accepted --by reviewer
~~~

## 数字、材料和批次

当满足以下任一条件时，请阅读 [references/advanced_correction_evidence.md](references/advanced_correction_evidence.md)：

- 某个数字、上下限、价格、份额、截止日期或量级会影响决策。
- 同一场会议存在两份录音。
- 白板、幻灯片或拍摄的书面材料可以独立确认某个名称/术语。
- 多个相关文件应共用一份纠正列表。
- 正在委派一个包含 10 个以上文件的批次。

数字槽位扫描：

~~~bash
uv run scripts/scan_numeric_consistency.py transcript.md --domain myproject
~~~

其输出始终是候选项，绝不会自动编辑。对于单个起关键作用的数字，请关联原始音频，并通过审查仪表板靠听觉判断。

对于委派的批处理任务，每个代理仅负责一个文件，不得跨文件替换，并返回残留问题列表。之后，将 `git diff --name-only` 与明确的文件列表进行比较，并按照仓库的工作树安全规则检查每个非预期文件。

## 最终处理

- 原生模式会直接编辑原始文件。重新运行普通的 `--stage 1` 进行确认；如果是没有任何更改的干净操作，则不会写入 Stage 1 辅助文件。
- 当存在更新的 `*_stage1.md`，且原始文件在此之后未被编辑时，普通的 Stage 1 重新运行会以原子方式将其提升为正式文件，并删除一次性辅助文件。它会保留 `*_changes.md` 和 `*_needs_review.md`，因为只有审查者才能确认所有相关决策均已完结。`--apply-all` 绝不会采用此提升路径。
- 不要将输出文件是否存在作为成功信号；请读取 JSON/退出状态，并独立读取最终文件。
- 在所有相关决策完结之前，保留原始转录、`*_changes.md` 和 `*_needs_review.md` 作为证据。
- 在最终文件中重新 grep 一个已知的修正形式，并确认不存在仅保留在 `asr_note` 或辅助文件中的修正。
- 如果某个排队项因重命名而丢失，请使用 `--reanchor-review` 修复，而不是用虚假的终结裁定将其标记为已解决。

## 无代理 API 路径

仅当没有 Claude/Codex 代理能够执行原生 AI 修正时：

~~~bash
export GLM_API_KEY="<api-key>"
uv run scripts/fix_transcript_enhanced.py input.md --output ./corrected
~~~

请阅读 [references/glm_api_setup.md](references/glm_api_setup.md)、[references/installation_setup.md](references/installation_setup.md)，以及 [references/workflow_guide.md](references/workflow_guide.md) 中明确面向 API 的部分。当某个分块在重试后仍失败时，API 路径会逐字节保留该分块及其原始的前后分隔符，并输出警告；如果所有分块均失败，则完整输出与输入相同。对于 `fix_transcription.py --stage 2|3 --json`，请读取新增的 `stage2_total_chunks`、`stage2_failed_chunks` 和 `stage2_degraded` 字段：即使已输出安全保留的产物，`stage2_degraded: true` 也不代表这是一次完全修正的运行。当任何 Stage 2 分块发生降级时，增强包装器会在写入该保留产物后以非零状态退出。请验证输出，而不要仅凭警告就假定已存在修正后的结果。

增强型 API 包装器还可以添加段落分隔、减少重复的填充词，
并呈现修正内容以供交互式审查。这些是 API 包装器的功能；
它们并不授权原生 AI 为提升流畅度而改写措辞。

## 实用命令

~~~bash
# Extract likely errors without editing
uv run scripts/fix_transcription.py --extract-uncertain \
  --input meeting.md --output ./review

# Import curated preset rules
uv run scripts/fix_transcription.py --load-presets tech

# Repair timestamps
uv run scripts/fix_transcript_timestamps.py meeting.txt --in-place

# Split and rebase sections
uv run scripts/split_transcript_sections.py meeting.txt \
  --first-section-name "intro" \
  --section "main::<verbatim marker>" \
  --rebase-to-zero

# Word-level review diff
uv run scripts/generate_word_diff.py original.md corrected.md output.html

# Harvest native-pass edits into context-trap candidates
uv run scripts/harvest_corrections.py raw.md corrected.md \
  --context-file ~/.transcript-fixer/contexts/myproject.md --write

# Multi-format Stage 1/API comparison report
uv run scripts/generate_diff_report.py \
  original.md original_stage1.md original_stage2.md \
  --output ./diff_reports

# Setup health
uv run scripts/fix_transcription.py --validate
~~~

使用不常用的标志前，请阅读 [references/script_parameters.md](references/script_parameters.md)。编写自定义 SQL 前，请阅读 [references/database_schema.md](references/database_schema.md)；纠错列为 `from_text` 和 `to_text`。

## 参考资料索引

所有参考资料都位于此文件的下一级目录中。

| 需求 | 阅读 |
|---|---|
| 完整的原生纠错流程 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 词典、人员名册、领域上下文 | [dictionary_identity_and_context.md](references/dictionary_identity_and_context.md) |
| 误报处理策略 | [false_positive_guide.md](references/false_positive_guide.md) |
| 队列、仪表板、音频、重新锚定 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 数字、照片、多份录音、批处理 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |
| 上下文文件语法/模板 | [domain_context_guide.md](references/domain_context_guide.md) |
| CLI 标志和审阅项模式 | [script_parameters.md](references/script_parameters.md) |
| 数据库模式和查询 | [database_schema.md](references/database_schema.md)、[sql_queries.md](references/sql_queries.md) |
| 快速命令查询 | [quick_reference.md](references/quick_reference.md)、[dictionary_guide.md](references/dictionary_guide.md) |
| 学习循环 | [iteration_workflow.md](references/iteration_workflow.md) |
| 原生示例 | [example_session_dji_minutes.md](references/example_session_dji_minutes.md) |
| 无代理 API 示例/配置 | [example_session.md](references/example_session.md)、[glm_api_setup.md](references/glm_api_setup.md)、[installation_setup.md](references/installation_setup.md) |
| 架构和格式 | [architecture.md](references/architecture.md)、[file_formats.md](references/file_formats.md) |
| 操作指南 | [best_practices.md](references/best_practices.md)、[troubleshooting.md](references/troubleshooting.md)、[team_collaboration.md](references/team_collaboration.md)、[workflow_guide.md](references/workflow_guide.md) |

捆绑的脚本会被执行，而不会加载到上下文中。主要入口点包括 `fix_transcription.py`、`scan_numeric_consistency.py`、`fetch_minute_audio.py`、`review-dashboard/server.py`，以及上面列出的差异比较、时间戳和拆分工具。

## 移交

校正后，仅当用户需要结构化摘要时，才移交给 `/daymade-audio:meeting-minutes-taker`。不要自动创建会议纪要：转写校正与摘要生成属于不同的任务范围。