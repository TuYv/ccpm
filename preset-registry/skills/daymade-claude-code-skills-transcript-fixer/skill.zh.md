---
name: transcript-fixer
description: >-
  Corrects speech-to-text transcription errors using dictionary rules and Claude's built-in AI (no external API key required — Native AI Correction is the DEFAULT). Stage 1 alone is not the job. Stage 3 API is a backup for automation without Claude Code. Builds personalized correction databases that learn from each fix, auto-loads person-name ASR variants from your people roster, and reads per-domain context files that prime the AI pass for context-dependent homophones. Triggers when working with ASR/STT output containing recognition errors, homophones, garbled technical terms, person-name errors, or Chinese/English mixed content. Also triggers on requests to clean up meeting notes, lecture transcripts, interview recordings, or any text produced by speech recognition. Use this skill even when the user just says "fix this transcript", "clean up these meeting notes", or mentions garbled names without invoking ASR specifically.
---
# 转录修正器

采用两阶段循环：

1. 阶段 1 应用确定性的、已知的修正。
2. 原生 AI 修正读取完整转录文本，修正一次性错误，核实不确定的实体，并沉淀可复用的修正。

**默认使用原生 AI 修正。仅执行阶段 1 并不完整。** 阶段 3 API 仅适用于无法使用 Claude/Codex 智能体的自动化场景。

## 操作约定

- 完成阶段 1 → 原生 AI 修正 → 沉淀已确认的重复性修正。不得仅在完成阶段 1 后就报告转录文本无误。
- 仅当用户明确将本次运行限制为字典处理，或有注明日期的产物证明已对这份完全相同的转录文本执行过原生 AI 修正时，才可跳过原生 AI 修正。
- 在 Claude Code 或 Codex 中，不要运行阶段 3。应使用阶段 1 加原生工作流。
- 切勿为了提高流畅度而改写原话。每项修正都必须能够解释为合理的 ASR 错误，并保留每句话的原说话者。
- 切勿推断或重新分配说话者身份。保留说话者标签行；经人工确认的标签和用户判定具有最高权威性。
- 对无法确定的文本保持原样，并将其加入待处理队列。保留明显的乱码也比做出流畅但错误的猜测更安全。
- 将单行 `asr_note` 值视为修正溯源信息：其中有意引用了旧形式，因此不会参与匹配。多行 YAML 台账值不会被屏蔽；关键词、标题、其他源自 ASR 的元数据以及正文文本仍在修正范围内。
- 在执行原生处理之前，完整阅读 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。在执行下述各项操作之前，阅读对应的任务专用参考文档。

## 运行上下文

所有入口点均通过 `uv run` 运行；需要第三方 Python 包的入口点使用 PEP 723 声明依赖，而仅使用标准库或内部代码的实用工具可以省略元数据块。请从调用此技能时所显示的技能目录执行命令，或者在每个脚本路径前加上该目录。不要依赖 `$CLAUDE_SKILL_DIR`；并非所有运行环境都提供该变量。

如果确实不知道包的位置，请使用 [references/installation_setup.md](references/installation_setup.md) 中的安装解析流程。不要直接选用宽泛 `find` 命令返回的第一个结果：缓存、备份和旧版本可能同时存在。

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

安全模式是阶段 1 的默认模式：应用低风险规则；中风险和高风险匹配会推迟到 `*_needs_review.md` 和持久化审阅队列中处理。`Applied: 0` 是一种有效结果，并不能证明转录文本没有问题。

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

请读取全部十个字段。`stage1_only_incomplete` 是在原有六字段调用方契约基础上新增的字段，并且在运行阶段 1 脚本时必须保持为 true；只有调用方通过运行原生 AI，或明确选择无代理的阶段 2/3 路线，才能将其关闭。三个 `stage2_*` 遥测字段始终存在：阶段 1 报告 `0`、`0` 和 `false`；阶段 2/3 会将其替换为实际的 API 结果。不要根据伴随文件是否存在来推断未执行任何操作或执行成功。

有关原生端到端示例，请阅读 [references/example_session_dji_minutes.md](references/example_session_dji_minutes.md)。

## 选择路线

| 路线 | 适用场景 | 必读材料 |
|---|---|---|
| 快速原生 | 简短/朴素的转录文本、说话者已知、风险较低 | 本文件 + [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 完整原生 | 领域内容密集、实体陌生、有 3 位以上说话者，或转录文本较长/涉及决策 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md)，以及下方的队列和证据参考资料 |
| 调用方集成 | 由另一个 Skill 或摄取流水线调用阶段 1 | 下方的 `Cross-skill caller contract` |
| 审阅队列/仪表板 | 任何项目存在不确定性或需要音频 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 无代理 API | 没有可用代理的 CI/批处理自动化 | [glm_api_setup.md](references/glm_api_setup.md) 和 [workflow_guide.md](references/workflow_guide.md) |
| 多文件批处理 | 多份相互关联的转录文本；尤其是 10 个以上文件 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |

将词汇和影响程度作为主要分级信号，仅将长度作为平局判定因素。五分钟的医疗访谈可能需要完整层级，而一份冗长但内容朴素的双人备忘录可以使用快速层级。

## 原生纠正检查清单

1. **在阶段 1 之前为文件指定最终名称。** 队列锚点会存储绝对路径。在任何推迟项可能进入队列之前，请使用人类可读的项目文件名。
2. **在阅读预先纠正过的转录文本之前恢复原始基线。** 如果摄取流水线或之前的 API 处理已修改文本，请先与原始来源进行差异比较。应将上游编辑视为编辑，而不是事实依据。
3. **加载项目先验信息并阅读完整转录文本。** 如果存在 `~/.transcript-fixer/contexts/<domain>.md`，请先读取它，然后通读整个文件，再判断前文中的歧义。
4. **运行阶段 1 并检查真实结果。** 优先使用明确的项目领域以及 `--apply-domain --json`。读取 `deferred` 和 `review_enqueued`；绝不要在不作说明的情况下丢弃伴随文件或忽略队列缺口。
5. **将阶段 1 的结果与原始文本/原始文件进行差异比较。** 如果某条规则改动了原本正确的话语，请基于原始文本继续操作，使用 `--report-false-positive "<from>" "<to>" --domain <domain>` 停用已存储的配对，并验证它不再触发。
6. **对每个候选项进行分流。**
   - 确信：声音变化合理，并且上下文或权威的本地来源可以确定答案。
   - 需要验证：没有来源佐证的人名、公司、产品、型号、股票代码、地点、数字或其他关键术语。
   - 不确定：证据无法得出结论；保留原文并加入队列。
7. **采用能够解释声音的最小改动。** 不要添加说话者没有说过的词。也要纠正 ASR 衍生的元数据，同时保持 `asr_note` 不变。
8. **执行第二轮检查。**
   - 所有层级：运行 `--scan-traps`，并检查命中项和 `unparsed`。
   - 完整层级：使用具有全新上下文的审阅者，仅审阅一个已纠正文件。要求其提供紧凑的残留问题表格或明确的 `no new residuals`；空白或被截断的响应视为审阅失败。
9. **将每个未解决的项目加入队列。** 遵循下方的 `Review queue safety` 和 [review_queue_dashboard.md](references/review_queue_dashboard.md)。
10. **验证并完成定稿。** 对实际编辑过的文件进行差异比较；如果数字很重要，则运行数值一致性检查；重新运行普通阶段 1；再次检索已知纠正项；并确认每项更改都可追溯到某个分流决策。
11. **在同一轮中沉淀学习成果。** 将每个稳定模式归入其正确位置；不要让已确认的修复只保留在聊天中。
12. **有意识地传播实体修复。** 仅搜索所属项目的衍生笔记/摘要，审查每个命中项，并排除原始 ASR 和纠正伴随文件，因为它们需要保留证据链。

详细的溯源栏、本地优先实体阶梯、第二轮提示词、队列载荷和最终定稿规则位于 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。

## 跨 Skill 调用方契约

调用方流水线有两项相互独立的义务：

1. 使用显式配置的项目领域、`--apply-domain` 和 `--json` 运行 Stage 1。如果 `deferred > review_enqueued`，则将审查 sidecar 持久化到任何临时目录之外，或者将此差额作为失败报告。
2. 在加载此 Skill 的情况下运行 Native AI，或者报告 `Stage 1 only — incomplete`。无 Agent 的自动化可以改用 Stage 3。

规范调用方式：

~~~bash
uv run scripts/fix_transcription.py \
  --input "$staged" --stage 1 \
  --domain "$domains" --apply-domain --json
~~~

仅接入脚本路径的调用方永远不会加载此契约。因此，仅集成脚本路径只是一个 Stage 1 预过滤器，而不是转录纠正。

保持项目领域持续更新：原生处理阶段确认的每一项重复出现的纠正，都必须补充回正确的项目领域、人员名册或上下文文件中。

## 词典与身份安全

添加规则前，请阅读 [references/false_positive_guide.md](references/false_positive_guide.md) 和 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。

| 模式 | 目标位置 |
|---|---|
| 稳定的非单词或独特乱码 → 规范术语 | `--add ... --domain <project>` |
| 重要且重复出现的人物及观察到的 ASR 变体 | 人员名册 |
| 仅在特定提示条件下出错的常见词/真实词 | 领域上下文陷阱，绝不能使用无条件规则 |
| 真实姓名 → 另一个真实姓名 | 领域上下文 + 人工/音频核验，绝不能使用无条件规则 |
| 反复被重新提出的已确认正确实体 | 已确认正确的上下文记录 |
| 仅出现一次、局限于句子上下文的措辞 | 仅编辑；不要添加 |

上下文陷阱是一种提示，而不是盲目替换的许可。`--scan-traps` 支持规范的 `→` 映射和旧版的 `≈` 映射，二者遵循相同的方向约定：左侧是观察到的 ASR，右侧是预期文本。对于包含空格的精确 FROM 短语，请使用反引号包裹：

~~~markdown
- **`CC 思维链`/`CC 思维连` → 目标术语** — only under the domain's documented cue
~~~

这展示的是一个精确的 ASR 短语候选项，而不是人物姓名候选项。领域上下文仍然是实际目标和提示条件的权威来源；扫描器只负责定位字面上的 FROM 形式。

添加任何形似真实词的规则之前，请先衡量项目语料库：

~~~bash
uv run scripts/fix_transcription.py \
  --probe "candidate" --corpus /path/to/project-transcripts/

uv run scripts/fix_transcription.py \
  --add "candidate" "canonical" --domain myproject \
  --check-corpus --corpus /path/to/project-transcripts/
~~~

用户判定会立即产生复合影响：修复文件、更新正确的目标位置，并记录已确认正确的结果，以免后续运行再次询问。

## 审查队列安全

入队或解决问题之前，请阅读 [references/review_queue_dashboard.md](references/review_queue_dashboard.md)。

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

- `file` 是此工作流的必填项。缺少它时，接受操作可以记录裁决，但不会编辑转录稿。
- `original` 仅包含可疑词元/文本片段；绝不要将整个句子放入其中。
- `context` 必须逐字复制；键名是 `line`，而不是 `line_hint`。
- 键名是 `suggested`，而不是 `suggestion`。使用 `actions`，而不是 `action_pack`。
- 一次处理一个出现位置；只有在整个批次都处理完毕后，才能扫描同类实体的其他出现位置。
- 覆盖后读取 `resolved_text`；列表仍可能显示已被否决的建议。
- 如果文件已移动或内容已发生漂移，请运行 `--reanchor-review`。按要求添加 `--reanchor-root` 或 `--reanchor-to`。不要在存在待处理条目时绕过它进行手动编辑。
- 根据含义落实每条 `decision_note`；存储备注不会更改词典、名册、上下文或误报状态。

核心命令：

~~~bash
uv run scripts/fix_transcription.py --enqueue-review items.json
uv run scripts/fix_transcription.py --list-review --review-status all --json
uv run scripts/fix_transcription.py --show-review <id> --json
uv run scripts/fix_transcription.py --reanchor-review <id>
uv run scripts/fix_transcription.py \
  --resolve-review <id> --decision accepted --by reviewer
~~~

## 数字、资料和批次

出现以下任一情况时，请阅读 [references/advanced_correction_evidence.md](references/advanced_correction_evidence.md)：

- 某个数字、界限、价格、占比、截止日期或数量级会影响决策。
- 同一场会议存在两份录音。
- 白板、幻灯片或拍摄的书面资料可以独立确认某个人名/术语。
- 多个相关文件应共用一份纠正列表。
- 正在委派一个包含 10 个以上文件的批次。

数值槽位扫描：

~~~bash
uv run scripts/scan_numeric_consistency.py transcript.md --domain myproject
~~~

其输出仅为候选项，绝不会自动编辑。对于单个起关键作用的数字，请接入原始音频，并通过审核面板凭听觉作出判断。

对于委派的批次，每个代理仅负责一个文件，不得跨文件替换，并需返回遗留问题列表。之后，将 `git diff --name-only` 与明确的文件列表进行比较，并按照仓库的工作树安全规则检查每个意外出现的文件。

## 最终处理

- 原生模式会直接编辑原始文件。重新运行普通的 `--stage 1` 以确认；干净的无操作运行不会写入 Stage 1 辅助文件。
- 当存在更新的 `*_stage1.md`，且原始文件在其生成后未被编辑时，普通的 Stage 1 重新运行会以原子方式将其提升为正式文件，并移除可丢弃的辅助文件。它会保留 `*_changes.md` 和 `*_needs_review.md`，因为只有审核者才能确认所有相关决策均已结束。`--apply-all` 绝不会采用此提升路径。
- 不要将输出文件是否存在作为成功信号；请读取 JSON/退出状态，并独立读取最终文件。
- 在所有相关决策结束前，请保留原始转录稿、`*_changes.md` 和 `*_needs_review.md` 作为证据。
- 在最终文件中重新 grep 一个已知的纠正形式，并确认没有任何纠正仅存在于 `asr_note` 或辅助文件中。
- 如果某个已入队条目因重命名而失去对应项，请使用 `--reanchor-review` 修复，而不是通过错误的终止裁决来处理它。

## 无代理 API 路径

仅当没有 Claude/Codex 代理能够执行原生 AI 纠正时：

~~~bash
export GLM_API_KEY="<api-key>"
uv run scripts/fix_transcript_enhanced.py input.md --output ./corrected
~~~

请阅读 [references/glm_api_setup.md](references/glm_api_setup.md)、[references/installation_setup.md](references/installation_setup.md)，以及 [references/workflow_guide.md](references/workflow_guide.md) 中明确面向 API 的部分。当某个分块在重试后仍然失败时，API 路径会逐字节保留该分块及其原始的周边分隔符，并输出警告；如果所有分块均失败，则完整输出与输入一致。对于 `fix_transcription.py --stage 2|3 --json`，请读取新增的 `stage2_total_chunks`、`stage2_failed_chunks` 和 `stage2_degraded` 字段：即使安全保留的产物已输出，`stage2_degraded: true` 也不代表一次完全纠正的运行。当任何第二阶段分块出现降级时，增强包装器会在写入该保留产物后以非零状态退出。请验证输出，不要仅凭警告就假定已存在纠正后的结果。

增强 API 包装器还可以添加段落分隔、减少重复的填充词，
并提供纠正内容以供交互式审阅。这些是 API 包装器的功能；
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

使用较少见的标志之前，请阅读 [references/script_parameters.md](references/script_parameters.md)。执行自定义 SQL 之前，请阅读 [references/database_schema.md](references/database_schema.md)；纠正列为 `from_text` 和 `to_text`。

## 参考资料索引

所有参考资料都位于此文件的上一级目录中。

| 需求 | 阅读 |
|---|---|
| 完整的原生纠正流程 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 词典、人员名册、领域上下文 | [dictionary_identity_and_context.md](references/dictionary_identity_and_context.md) |
| 误报处理策略 | [false_positive_guide.md](references/false_positive_guide.md) |
| 队列、仪表板、音频、重新锚定 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 数字、照片、多录音、批处理 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |
| 上下文文件语法/模板 | [domain_context_guide.md](references/domain_context_guide.md) |
| CLI 标志和审阅项架构 | [script_parameters.md](references/script_parameters.md) |
| 数据库架构和查询 | [database_schema.md](references/database_schema.md)、[sql_queries.md](references/sql_queries.md) |
| 命令快速查阅 | [quick_reference.md](references/quick_reference.md)、[dictionary_guide.md](references/dictionary_guide.md) |
| 学习循环 | [iteration_workflow.md](references/iteration_workflow.md) |
| 原生示例 | [example_session_dji_minutes.md](references/example_session_dji_minutes.md) |
| 无代理 API 示例/配置 | [example_session.md](references/example_session.md)、[glm_api_setup.md](references/glm_api_setup.md)、[installation_setup.md](references/installation_setup.md) |
| 架构和格式 | [architecture.md](references/architecture.md)、[file_formats.md](references/file_formats.md) |
| 操作指南 | [best_practices.md](references/best_practices.md)、[troubleshooting.md](references/troubleshooting.md)、[team_collaboration.md](references/team_collaboration.md)、[workflow_guide.md](references/workflow_guide.md) |

捆绑的脚本会被执行，而不会加载到上下文中。主要入口点包括 `fix_transcription.py`、`scan_numeric_consistency.py`、`fetch_minute_audio.py`、`review-dashboard/server.py`，以及上文列出的差异比较、时间戳和拆分工具。

## 交接

修正完成后，仅当用户需要结构化摘要时，才交接给 `/daymade-audio:meeting-minutes-taker`。不要自动创建会议纪要：转录文本修正与摘要生成属于两个独立的工作范围。