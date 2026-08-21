---
name: transcript-fixer
description: >-
  Corrects speech-to-text transcription errors using dictionary rules and Claude's built-in AI (no external API key required — Native AI Correction is the DEFAULT). Stage 1 alone is not the job. Stage 3 API is a backup for automation without Claude Code. Builds personalized correction databases that learn from each fix, auto-loads person-name ASR variants from your people roster, and reads per-domain context files that prime the AI pass for context-dependent homophones. Triggers when working with ASR/STT output containing recognition errors, homophones, garbled technical terms, person-name errors, or Chinese/English mixed content. Also triggers on requests to clean up meeting notes, lecture transcripts, interview recordings, or any text produced by speech recognition. Use this skill even when the user just says "fix this transcript", "clean up these meeting notes", or mentions garbled names without invoking ASR specifically.
---
# 转录修正器

使用两阶段循环：

1. 第一阶段应用确定性的、已知的修正。
2. 原生 AI 校正读取完整转录稿，修正一次性错误，核实不确定的实体，并沉淀可复用的修正。

**原生 AI 校正是默认流程。仅执行第一阶段并不完整。** 第三阶段 API 仅适用于无法使用 Claude/Codex 智能体的自动化场景。

## 操作约定

- 完成第一阶段 → 原生 AI 校正 → 沉淀已确认的重复性修正。不得在仅完成第一阶段后就报告转录稿无误。
- 仅当人工明确将本次运行限定为字典处理，或有带日期的产物证明已对这份完全相同的转录稿执行过原生 AI 校正时，才可跳过原生 AI 校正。
- 在 Claude Code 或 Codex 中，不要运行第三阶段。请使用第一阶段加原生工作流。
- 切勿为了语言流畅而改写话语。每项修正都必须能够解释为合理的 ASR 错误，并保留每句话的原说话者。
- 切勿推断或重新分配说话者身份。保留说话者标签行；经人工确认的标签和用户裁定具有最高权威性。
- 保持尚未解决的文本不变，并将其加入待处理队列。保留明显的乱码也比做出流畅但错误的猜测更安全。
- 将单行 `asr_note` 值视为修正来源说明：它会有意引用旧形式，因此被排除在匹配范围之外。多行 YAML 台账值不会被屏蔽；关键词、标题、其他源自 ASR 的元数据以及正文文本仍属于修正范围。
- 执行原生校正前，请完整阅读 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。执行下文所列的相应操作前，请先阅读该任务对应的参考文档。

## 运行上下文

所有入口点都通过 `uv run` 运行；需要第三方 Python 包的入口点使用 PEP 723 声明依赖，而仅使用标准库或内部组件的实用工具可以省略元数据块。请从调用此技能时所显示的技能目录执行命令，或者为每个脚本路径添加该目录作为前缀。不要依赖 `$CLAUDE_SKILL_DIR`；并非所有运行环境都提供该变量。

如果确实不知道资源包位置，请使用 [references/installation_setup.md](references/installation_setup.md) 中的安装解析流程。不要从范围宽泛的 `find` 结果中直接选择第一项：缓存、备份和旧版本可能同时存在。

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

阶段 1 的 JSON 契约如下：

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

请读取全部十个字段。`stage1_only_incomplete` 是对原有六字段调用方契约的补充，在运行阶段 1 脚本时必须保持为 true；只有调用方运行原生 AI，或明确选择无智能体的阶段 2/3 路径，才能将其关闭。三个 `stage2_*` 遥测字段始终存在：阶段 1 报告 `0`、`0` 和 `false`；阶段 2/3 会将它们替换为实际的 API 结果。不要根据是否存在伴随文件来推断未执行任何操作或执行成功。

有关原生端到端示例，请阅读 [references/example_session_dji_minutes.md](references/example_session_dji_minutes.md)。

## 选择路径

| 路径 | 适用场景 | 必读内容 |
|---|---|---|
| 快速原生路径 | 简短/朴素的转录文本、说话者已知、风险较低 | 本文件 + [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 完整原生路径 | 领域内容密集、实体陌生、说话者达到 3 人以上、转录文本较长或涉及决策 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md)，以及下方的队列和证据参考资料 |
| 调用方集成 | 另一个技能或摄取管道调用阶段 1 | 下方的 `Cross-skill caller contract` |
| 审核队列/仪表板 | 任何条目不确定或需要音频 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 无智能体 API | 没有可用智能体的 CI/批处理自动化 | [glm_api_setup.md](references/glm_api_setup.md) 和 [workflow_guide.md](references/workflow_guide.md) |
| 多文件批处理 | 多份相关转录文本；尤其是 10 个以上文件 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |

将词汇和风险程度作为主要分级信号；仅将长度用作决胜因素。五分钟的医疗访谈可能需要完整分级，而一份篇幅较长、语言朴素的双人备忘录则可以使用快速分级。

## 原生纠正检查清单

1. **在阶段 1 之前为文件指定最终名称。** 队列锚点会存储绝对路径。在任何推迟项可能进入队列之前，请使用人类可读的项目文件名。如果输入以内联文本形式到达且尚无文件——例如斜杠命令参数或粘贴的文本块——请先将其写入文件，再执行其他任何操作；`--input` 和队列锚点都需要路径，如果后续流程不会将其归档，使用临时位置也可以。没有提供 `--domain`，且无法根据上下文明确判断领域？省略该标志本来就会默认搜索所有领域（即 `--domain` 自身的默认行为），因此不要因为需要选择领域而阻塞流程——直接运行阶段 1，让安全模式控制哪些内容可以自动应用。如果某个特定候选项仍需解析，即使在快速分级下，验证阶梯中的一步也足够低成本，值得保留，尽管其余步骤并非如此：即 native_ai_full_workflow.md 步骤 4 的第 1 级，执行一次跨领域 `corrections.db` 查询——不是分级表要求跳过的完整验证阶梯，只执行这一次查询。
2. **在阅读经过预纠正的转录文本之前恢复原始基线。** 如果摄取管道或之前的 API 处理已经修改过文本，请先与原始来源进行差异比较。将上游修改视为编辑，而不是事实依据。
3. **加载项目先验信息并阅读完整转录文本。** 如果存在 `~/.transcript-fixer/contexts/<domain>.md`，请先阅读它，然后通读整个文件，再判断前文中的歧义。
4. **运行阶段 1 并检查实际结果。** 优先使用明确的项目领域以及 `--apply-domain --json`。读取 `deferred` 和 `review_enqueued`；绝不要默默丢弃伴随文件或队列缺口。
5. **将阶段 1 的结果与原始文本/原文进行差异比较。** 如果某条规则修改了正确的语音内容，请基于原文处理，使用 `--report-false-positive "<from>" "<to>" --domain <domain>` 停用已存储的映射对，并验证它不再触发。
6. **分诊每个候选项。**
   - 确信：语音变化合理，并且上下文或权威的本地来源能够确定答案。
   - 需要验证：没有来源支持的人名、公司、产品、型号、股票代码、地点、数字或其他关键术语。
   - 不确定：证据不足以得出结论；保留原文并加入队列。
7. **应用能够解释该语音的最小编辑。** 不要添加说话者未说过的词。也要纠正由 ASR 生成的元数据，同时保持 `asr_note` 不变。
8. **执行第二轮处理。**
   - 所有分级：运行 `--scan-traps`，并检查命中项和 `unparsed`。
   - 完整分级：使用全新上下文的审核者，仅审核一个已纠正的文件。要求其提供精简的残留问题表，或明确回复 `no new residuals`；空响应或被截断的响应均视为审核失败。
9. **将每个未解决项加入队列。** 遵循下方的 `Review queue safety` 和 [review_queue_dashboard.md](references/review_queue_dashboard.md)。
10. **验证并完成处理。** 对实际编辑的文件执行差异比较，在数字至关重要时运行数值一致性检查，重新运行普通的阶段 1，再次使用 grep 搜索已知纠正项，并确认每项更改都可追溯到某个分诊决定。
11. **在同一轮处理中积累学习成果。** 将每个稳定模式归入其正确的存储位置；不要让已确认的修复仅留在聊天中。
12. **有意识地传播实体修复。** 仅搜索所属项目派生出的笔记/摘要，审核每个命中项，并排除原始 ASR 和纠正伴随文件，因为它们需要保留证据链。

详细的溯源栏、本地优先实体阶梯、第二轮提示词、队列负载和最终定稿规则见 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。

## 跨技能调用方契约

调用方流水线有两项彼此独立的义务：

1. 使用明确配置的项目领域、`--apply-domain` 和 `--json` 运行阶段 1。如果 `deferred > review_enqueued`，则须将审查辅助文件持久化到任何临时目录之外，或者将该缺口作为失败报告。
2. 在加载此技能的情况下运行 Native AI，或者报告 `Stage 1 only — incomplete`。无智能体自动化可改用阶段 3。

规范调用方式：

~~~bash
uv run scripts/fix_transcription.py \
  --input "$staged" --stage 1 \
  --domain "$domains" --apply-domain --json
~~~

仅接入脚本路径的调用方永远不会加载此契约。因此，只集成脚本路径只能算作阶段 1 预筛选，而不是转录纠正。

持续更新项目领域：原生处理阶段确认的每个重复出现的纠正，都必须回填到正确的项目领域、人员名册或上下文文件中。

## 词典与身份安全

添加规则前，请阅读 [references/false_positive_guide.md](references/false_positive_guide.md) 和 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。

| 模式 | 目标位置 |
|---|---|
| 稳定的非单词或唯一乱码 → 规范术语 | `--add ... --domain <project>` |
| 重要且反复出现的人名及观测到的 ASR 变体 | 人员名册 |
| 仅在某种线索下错误的常见词或真实词 | 领域上下文陷阱，绝不能使用无条件规则 |
| 真实姓名 → 另一个真实姓名 | 领域上下文 + 人工/音频验证，绝不能使用无条件规则 |
| 反复被重新提起的已确认正确实体 | 已确认正确的上下文记录 |
| 仅出现一次、只适用于当前句子的措辞 | 只编辑；不要添加 |

上下文陷阱是一种线索，并不代表可以盲目替换。`--scan-traps` 同时支持规范的 `→` 映射和旧版 `≈` 映射，两者遵循相同的方向约定：左侧是观测到的 ASR，右侧是预期文本。若精确的 FROM 短语包含空格，请用反引号括起：

~~~markdown
- **`CC 思维链`/`CC 思维连` → 目标术语** — only under the domain's documented cue
~~~

这展示的是一个精确的 ASR 短语候选项，而不是人名候选项。领域上下文仍然是确定真实目标和线索的权威依据；扫描器只负责定位字面上的 FROM 形式。

添加任何形似真实单词的规则之前，请先测量项目语料库：

~~~bash
uv run scripts/fix_transcription.py \
  --probe "candidate" --corpus /path/to/project-transcripts/

uv run scripts/fix_transcription.py \
  --add "candidate" "canonical" --domain myproject \
  --check-corpus --corpus /path/to/project-transcripts/
~~~

用户判定会立即累积生效：修复文件、更新到正确的目标位置，并记录已确认正确的结果，以免后续运行再次询问。

## 审查队列安全

入队或解决问题前，请阅读 [references/review_queue_dashboard.md](references/review_queue_dashboard.md)。

最小条目：

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

- 此工作流必须提供 `file`。如果缺少该字段，接受操作可能只记录裁决，而不编辑转录稿。
- `original` 只能包含可疑词元/片段；绝不要将整个句子放入其中。
- `context` 必须逐字复制；键名是 `line`，而不是 `line_hint`。
- 键名是 `suggested`，而不是 `suggestion`。使用 `actions`，而不是 `action_pack`。
- 一次处理一个出现位置；只有在解决整个批次后，才能扫描同一实体的其他出现位置。
- 覆盖后读取 `resolved_text`；列表仍可能显示已被拒绝的建议。
- 如果文件已移动或内容已发生漂移，请运行 `--reanchor-review`。按要求添加 `--reanchor-root` 或 `--reanchor-to`。不要在存在待处理条目时手动编辑其周边内容。
- 根据含义提升每个 `decision_note`；存储备注不会更改字典、名册、上下文或误报状态。

核心命令：

~~~bash
uv run scripts/fix_transcription.py --enqueue-review items.json
uv run scripts/fix_transcription.py --list-review --review-status all --json
uv run scripts/fix_transcription.py --show-review <id> --json
uv run scripts/fix_transcription.py --reanchor-review <id>
uv run scripts/fix_transcription.py \
  --resolve-review <id> --decision accepted --by reviewer
~~~

## 数字、书面材料和批次

出现以下任一情况时，请阅读 [references/advanced_correction_evidence.md](references/advanced_correction_evidence.md)：

- 某个数字、界限、价格、占比、截止日期或数量级会影响决策。
- 同一次会议存在两份录音。
- 白板、幻灯片或拍摄的书面材料能够独立确认某个名称/术语。
- 多个相关文件应共用一份纠正列表。
- 正在委派一个包含 10 个以上文件的批次。

数字槽位扫描：

~~~bash
uv run scripts/scan_numeric_consistency.py transcript.md --domain myproject
~~~

其输出仅为候选项，绝不会自动编辑。对于单个影响重大的数字，请接入原始音频，并通过审核仪表板凭听觉作出判断。

对于委派的批次，每个代理仅负责一个文件，不得跨文件替换，并须返回剩余问题列表。随后，将 `git diff --name-only` 与明确的文件列表进行比较，并按照仓库的工作树安全规则检查每个非预期文件。

## 最终处理

- 原生模式会直接编辑原始文件。重新运行普通的 `--stage 1` 以确认；无任何操作的干净运行不会写入 Stage 1 附属文件。
- 如果存在较新的 `*_stage1.md`，且原始文件此后未被编辑，则普通的 Stage 1 重新运行会以原子方式提升该文件，并删除可丢弃的附属文件。它会保留 `*_changes.md` 和 `*_needs_review.md`，因为只有审核者才能确认所有相关决策均已关闭。`--apply-all` 绝不会采用此提升路径。
- 不要将输出文件是否存在作为成功信号；请读取 JSON/退出状态，并独立读取最终文件。
- 在所有相关决策均关闭之前，将原始转录稿、`*_changes.md` 和 `*_needs_review.md` 保留为证据。
- 在最终文件中重新搜索一个已知的纠正后形式，并确认没有任何纠正仅存在于 `asr_note` 或附属文件中。
- 如果某个已入队条目因重命名而失去对应位置，请使用 `--reanchor-review` 修复，而不要以错误的终结裁决解决它。

## 无代理 API 路径

仅当没有 Claude/Codex 代理能够执行原生 AI 校正时：

~~~bash
export GLM_API_KEY="<api-key>"
uv run scripts/fix_transcript_enhanced.py input.md --output ./corrected
~~~

请阅读 [references/glm_api_setup.md](references/glm_api_setup.md)、[references/installation_setup.md](references/installation_setup.md)，以及 [references/workflow_guide.md](references/workflow_guide.md) 中明确面向 API 的部分。当某个分块在重试后仍然失败时，API 路径会逐字节保留该分块及其原始的前后分隔符，并输出警告；如果所有分块均失败，则完整输出与输入相同。对于 `fix_transcription.py --stage 2|3 --json`，请查看新增的 `stage2_total_chunks`、`stage2_failed_chunks` 和 `stage2_degraded` 字段：即使已输出安全保留的产物，`stage2_degraded: true` 也不代表此次运行已完成全面校正。当任何 Stage 2 分块发生降级时，增强包装器会在写入该保留产物后以非零状态退出。请验证输出，不要因看到警告便假定已存在校正后的结果。

增强 API 包装器还可以添加段落分隔、减少重复的填充词，
并提供校正内容以供交互式审阅。这些属于 API 包装器的功能；
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

# Multi-format Stage 1/API comparison report
uv run scripts/generate_diff_report.py \
  original.md original_stage1.md original_stage2.md \
  --output ./diff_reports

# Setup health
uv run scripts/fix_transcription.py --validate
~~~

使用不常见的标志前，请阅读 [references/script_parameters.md](references/script_parameters.md)。执行自定义 SQL 前，请阅读 [references/database_schema.md](references/database_schema.md)；校正列为 `from_text` 和 `to_text`。

## 参考资料索引

所有参考资料均位于本文件的下一级目录中。

| 需求 | 阅读 |
|---|---|
| 完整的原生校正流程 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 词典、人员名单、领域上下文 | [dictionary_identity_and_context.md](references/dictionary_identity_and_context.md) |
| 误报处理策略 | [false_positive_guide.md](references/false_positive_guide.md) |
| 队列、仪表板、音频、重新锚定 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 数字、照片、多份录音、批处理 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |
| 上下文文件语法/模板 | [domain_context_guide.md](references/domain_context_guide.md) |
| CLI 标志和审阅项模式 | [script_parameters.md](references/script_parameters.md) |
| 数据库模式和查询 | [database_schema.md](references/database_schema.md)、[sql_queries.md](references/sql_queries.md) |
| 命令速查 | [quick_reference.md](references/quick_reference.md)、[dictionary_guide.md](references/dictionary_guide.md) |
| 学习循环 | [iteration_workflow.md](references/iteration_workflow.md) |
| 原生示例 | [example_session_dji_minutes.md](references/example_session_dji_minutes.md) |
| 无代理 API 示例/配置 | [example_session.md](references/example_session.md)、[glm_api_setup.md](references/glm_api_setup.md)、[installation_setup.md](references/installation_setup.md) |
| 架构和格式 | [architecture.md](references/architecture.md)、[file_formats.md](references/file_formats.md) |
| 操作指南 | [best_practices.md](references/best_practices.md)、[troubleshooting.md](references/troubleshooting.md)、[team_collaboration.md](references/team_collaboration.md)、[workflow_guide.md](references/workflow_guide.md) |

捆绑的脚本会被执行，而不会加载到上下文中。主要入口点包括 `fix_transcription.py`、`scan_numeric_consistency.py`、`fetch_minute_audio.py`、`review-dashboard/server.py`，以及上文列出的差异比较、时间戳和拆分工具。

## 交接

纠正完成后，仅当用户需要结构化摘要时，才交接给 `/daymade-audio:meeting-minutes-taker`。不要自动创建会议纪要：转写纠正与摘要生成属于不同的工作范围。