---
name: transcript-fixer
description: >-
  Corrects speech-to-text transcription errors with dictionary rules and Claude's built-in AI (no external API key required); Native AI Correction is the default, Stage 1 alone is incomplete, and Stage 3 API is only for automation without Claude Code. Builds personalized correction databases, loads person-name ASR variants from the configured global people roster, and reads per-domain contexts for homophones. Before correcting a person name, the agent must consult both the global roster and the owning project's identity roster; project rosters are not auto-loaded, and occurrence frequency is never identity evidence. Use for ASR/STT output with recognition errors, homophones, garbled technical terms, person-name errors, or mixed Chinese/English, and for cleaning meeting notes, lecture transcripts, interviews, or any speech-recognition text—even when the user only says “fix this transcript,” “clean up these meeting notes,” or mentions a garbled name.
---
# 转录修正器

使用两阶段循环：

1. 阶段 1 应用确定性的、已知的修正。
2. Native AI Correction 读取完整转录，修正一次性错误，核实不确定的实体，并累积可复用的修正。

**Native AI Correction 是默认流程。仅执行阶段 1 并不完整。** 阶段 3 API 仅用于没有可用 Claude/Codex 代理的自动化场景。

## 操作约定

- 完成阶段 1 → Native AI Correction → 累积已确认的重复性修正。不要仅在阶段 1 完成后就报告转录内容已清理干净。
- 仅当人类明确将本次运行限制为词典处理，或有带日期的产物证明 Native AI 已经在这份确切的转录上运行过时，才跳过 Native AI。
- 在 Claude Code 或 Codex 中，不要运行阶段 3。使用阶段 1 加上原生工作流。
- 永远不要为了流畅而重写语音内容。修正必须能够解释合理的 ASR 错误，并保留谁说了什么。
- 永远不要推断或重新分配说话人身份。保留说话人标签行；人工确认的标签和用户裁决具有权威性。
- 在修正任何人名之前，直接读取配置的全局人员名册，以及所属项目明确的身份名册或别名账本。阶段 1 只会自动加载全局 `ASR 变体` 条目；它不会加载项目名册，也不会公开被抑制、禁用和未列出的条目。如果预期来源缺失或来源之间存在冲突，则保持人名不变，并将其加入待处理队列或询问一次。永远不要将出现频率作为身份证据。在确定人名之前，阅读 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。
- 保持未解决的文本不变，并将其加入待处理队列。显而易见的乱码也比流畅但错误的猜测更安全。
- 将不熟悉的词视为未知，而不是错误。首先穷尽本地证据阶梯。对于仍未解决且具有承载作用的词，仅当源音频和获准使用的第二引擎均已可用时，才使用片段级交叉识别器阶梯；否则将其加入待处理队列或询问。来自真正不同识别器族的结果一致，可以强力佐证语音内容，但绝不能在同音异形词之间做选择，也不能覆盖人名门禁。在使用该方法之前，阅读原生工作流第 4 步中的第 7 级。
- 将单行 `asr_note` 值视为修正溯源信息：它有意引用旧形式，并被排除在匹配范围之外。多行 YAML 账本值不会被屏蔽；关键词、标题、其他源自 ASR 的元数据以及正文仍在修正范围内。
- 在执行原生处理之前，完整阅读 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。在执行相应操作之前，阅读下方指定的任务专用参考资料。

## 运行上下文

每个入口点都通过 `uv run` 运行；需要第三方 Python 包的入口点使用 PEP 723 声明这些依赖，而仅依赖标准库/内部组件的工具可以省略元数据块。请从调用此技能时打印出的技能目录执行命令，或在每个脚本路径前加上该目录。不要依赖 `$CLAUDE_SKILL_DIR`；并非每个运行环境都提供该变量。

如果 bundle 位置确实未知，请使用 [references/installation_setup.md](references/installation_setup.md) 中的安装解析流程。不要从宽泛的 `find` 结果中选择第一项：缓存、备份和旧版本可能会共存。

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

安全模式是 Stage 1 的默认模式：低风险规则会应用；中风险/高风险匹配项会延后写入 `*_needs_review.md` 和持久化审查队列。`Applied: 0` 是有效结果，并不能证明转录文本没有问题。

Stage 1 的 JSON 契约如下：

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

请读取全部十个字段。`stage1_only_incomplete` 是对原始六字段调用方契约的增补；对于 Stage 1 脚本运行，该字段必须保持为 true。只有调用方运行 Native AI，或明确选择无代理的 Stage 2/3 路径，才能将其关闭。三个 `stage2_*` 遥测字段始终存在：Stage 1 报告 `0`、`0` 和 `false`；Stage 2/3 则将其替换为实际的 API 结果。不要根据是否存在 sidecar 来推断无操作或成功。

如需查看原生端到端示例，请阅读 [references/example_session_dji_minutes.md](references/example_session_dji_minutes.md)。

## 选择路径

| 路径 | 适用场景 | 必需阅读内容 |
|---|---|---|
| 快速原生 | 简短/普通转录文本、发言人已知、风险较低 | 本文件 + [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 完整原生 | 领域相关内容较多、实体不熟悉、3 名及以上发言人、篇幅较长或涉及决策的转录文本 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md)，以及下面的队列和证据参考文档 |
| 调用方集成 | 其他 skill 或摄取管道调用 Stage 1 | 下方的 `Cross-skill caller contract` |
| 审查队列/仪表板 | 任何不确定或需要音频的项目 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 无代理 API | 没有可用代理的 CI/批处理自动化 | [glm_api_setup.md](references/glm_api_setup.md) 和 [workflow_guide.md](references/workflow_guide.md) |
| 多文件批处理 | 多份相关转录文本；尤其是 10 份以上的文件 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |

将词汇和利害程度作为主要层级信号；仅在两者无法区分时才使用长度作为决胜因素。五分钟的医疗访谈可能需要完整层级，而一篇很长但内容普通的双人备忘录可以使用快速层级。

## 原生校正检查清单

1. **在 Stage 1 之前为文件确定最终名称。** 队列锚点存储绝对路径。在任何延迟处理可能入队之前，先使用人类可读的项目文件名。如果输入以尚不存在文件的内联文本形式到达——例如斜杠命令参数或粘贴的文本块——要先将其写入文件；`--input` 和队列锚点都需要路径，如果下游不会归档，使用临时位置也可以。没有提供 `--domain`，上下文中也没有明显的域？省略该标志本身就会默认搜索所有域（`--domain` 自身的默认值），因此不要因为选择域而阻塞——直接裸运行 Stage 1，让安全模式决定哪些内容可以自动应用。如果仍需要解析某个具体候选项，即使在快速层级下，也可以保留阶梯中的一步，尽管其余步骤不执行：native_ai_full_workflow.md 第 4 步第 1 级，即进行一次跨域 `corrections.db` 查询——不是完整的验证阶梯（层级表要求你跳过它），只是这一个查询。
2. **在读取预校正转录稿之前恢复原始基线。** 如果摄取管道或之前的 API 处理已经改动过文本，先与原始来源进行差异比较。将上游改动视为改动，而不是视为事实依据。
3. **加载项目先验信息并阅读完整转录稿。** 如果存在，则读取 `~/.transcript-fixer/contexts/<domain>.md`，然后在决定早期歧义之前读完整个文件。
4. **运行 Stage 1 并检查实际结果。** 优先使用明确的项目域以及 `--apply-domain --json`。读取 `deferred` 和 `review_enqueued`；绝不要静默丢弃 sidecar 或队列缺口。
5. **将 Stage 1 与原始/初始内容进行差异比较。** 如果某条规则改变了正确的语音，就从原始内容开始处理，使用 `--report-false-positive "<from>" "<to>" --domain <domain>` 撤销已存储的配对，并验证该规则不再触发。
6. **对每个候选项进行分流。**
   - 确信：该语音变化合理，并且上下文或权威的本地来源可以确定结果。
   - 需要验证：某个人、公司、产品、模型、股票代码、地点、数字或其他承载关键信息的术语缺少来源。
   - 不确定：证据无法确定结果；保留原文并入队。
   - 多通道实体分叉：当独立转录稿中的人名或其他专有名词存在分歧，且没有本地权威来源可以确定结果时，收集未解决的分叉并一次性询问人工。不要猜测，也不要将多数票视为身份依据。
7. **应用能够解释该语音的最小修改。** 不要添加说话者没有说过的词。也要校正 ASR 派生的元数据，同时保留 `asr_note`。
8. **运行第二遍处理。**
   - 所有层级：运行 `--scan-traps`，并检查命中项和 `unparsed`。
   - 完整层级：使用全新上下文的审阅者，仅针对一个已校正文件进行审阅。必须要求提供简明的残留问题表，或明确返回 `no new residuals`；空响应或截断响应都表示审阅失败。
   - 高风险多录音场景：采样片段只能确定与该锚定项目对应的内容。如果用户要求更高质量或完整的转录稿，且基线音频可用，则加载 **`/daymade-audio:asr-transcribe-to-text`**，并在完整的最清晰/规范录音上运行其完整文件转录流程，然后才能声称覆盖整个转录稿；否则报告 `sampled cross-check only — incomplete`。优先使用与规范正文生成器不同的识别器。如果只有同一个识别器可用，则该运行证明了完整来源覆盖，但不构成独立的跨识别器佐证；要说明这一边界。
9. **将每个未解决项目入队，并且只打开此文件。** 遵循下面的 `Review queue safety` 和 [review_queue_dashboard.md](references/review_queue_dashboard.md)。检测和入队并不等于校正：若要声称更高质量/最终版本，所有锚定到该确切文件的队列行都必须离开 `pending` 状态。使用 `uv run scripts/review-dashboard/server.py --file "<absolute-canonical-file>"` 启动仪表板；添加 `--item <id>` 可直接定位到某个分叉。如果人工无法参与，则明确将产物标记为 `draft / unresolved — incomplete` 并列出各行；不要在声称已完成质量处理的情况下交付包含原始可疑文本的内容。
10. **读取人工处理状态，然后完成定稿。** 当人工表示他们已经在仪表板中完成标记时，不要重新运行 ASR，也不要再次询问相同问题。首先运行 `uv run scripts/fix_transcription.py --list-review --review-file "<absolute-canonical-file>" --review-status all --json`，应用由此得到的文件状态，并要求该确切路径满足 `stats.pending_total == 0`；在声称高质量/最终版本之前，必须确保待处理行数为零。然后对实际编辑过的文件进行差异比较，在数字很重要时运行数字一致性检查，重新运行普通 Stage 1，再次搜索已知校正，并确认每项改动都能追溯到一次分流决策。全局队列计数不能关闭或重新打开该文件的质量声明。
11. **在同一轮中沉淀所学内容。** 将每个稳定模式归入正确的位置；不要只把已确认的修复留在聊天中。原生处理阶段的改动不会进入 Stage 1 的校正历史，因此要在最终差异比较之后立即机械化地收集这些改动：

~~~bash
    # Diff raw vs corrected into parseable trap candidates (review artifact —
    # you adjudicate the printed list; --write auto-appends only the recurring
    # (≥2x) non-bare candidates; --write-all also appends the one-off set)
    uv run scripts/harvest_corrections.py raw.md corrected.md \
      --context-file ~/.transcript-fixer/contexts/<domain>.md
    ~~~

    每个输出的项目符号在打印前都会通过真实的 trap parser 进行往返验证，并跳过 context file 中已经记录的配对项。高频候选是强陷阱；单次出现的候选需要人工判断——这就是 `--write` 默认将其排除在外的原因——而 ⚠️ 裸形 candidates 永远不会被自动写入。这取代了凭记忆手动编写 trap 项。

12. **有意识地传播实体修复。** 仅搜索所属项目的派生笔记/摘要，检查每个命中项，并排除原始 ASR 和校正 sidecar，因为它们需要保留证据链。

详细的溯源标准、本地优先的实体阶梯、第二轮提示词、队列负载和最终化规则，参见 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。

## 跨 skill 调用方契约

调用方 pipeline 有两项彼此独立的义务：

1. 使用明确配置的项目 domain、`--apply-domain` 和 `--json` 运行 Stage 1。如果 `deferred > review_enqueued`，请将 review sidecar 持久化到任何临时目录之外，或将该缺口作为失败报告。
2. 在加载此 skill 的情况下运行 Native AI，或报告 `Stage 1 only — incomplete`。无 agent 的自动化可以改用 Stage 3。

标准调用：

~~~bash
uv run scripts/fix_transcription.py \
  --input "$staged" --stage 1 \
  --domain "$domains" --apply-domain --json
~~~

仅接入脚本路径的调用方永远不会加载此契约。因此，仅接入脚本路径只是 Stage 1 预筛选，而不是转录校正。

保持项目 domain 最新：native pass 中确认的每个重复性校正都必须添加回正确的项目 domain、名册或 context file。

## 词典和身份安全

在添加规则前，阅读 [references/false_positive_guide.md](references/false_positive_guide.md) 和 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。

| Pattern | Destination |
|---|---|
| 稳定的非词语或独特乱码 → 规范术语 | `--add ... --domain <project>` |
| 重要的重复出现人物及其观测到的 ASR 变体 | People roster |
| 仅在特定重复短语中才正确的校正 | `--add-context-rule PATTERN REPLACEMENT --domain <project>`（regex，按 domain 作用域限定；全局规则省略 `--domain`） |
| 仅在某个提示下出错的常见/真实词语 | Domain context trap，绝不能使用裸规则 |
| 真实姓名 → 不同的真实姓名 | Domain context + 人工/音频验证，绝不能使用裸规则 |
| 已确认正确却被反复重新审查的实体 | Confirmed-correct context record |
| 一次性、句子局部的措辞 | 仅编辑；不要添加 |

上下文陷阱是提示，而不是盲目替换的许可。领域上下文文件中的两类注释是 **由第 1 阶段强制执行的机器可读否决项**（当通过 `--domain` 指定领域时——整库运行没有可执行否决的所有者）：标记为 `禁裸词`/`禁入词典` 的陷阱会将 FROM 相同的任何词典规则降级为待审核，而一条已确认正确的（勿修）记录会将 FROM 为该词的任何规则降级——降级优先于 `--apply-domain` 的信任扁平化，因此真实词规则（绿点→绿电这一类：在业务上下文中正确、在 UI 上下文中错误）可以保留在词典中而不会盲目触发。`--apply-all` 仍然是操作员明确指定的覆盖选项。没有该否决项时，唯一的退出方式是 `--report-false-positive`，但它也会在规则正确的上下文中禁用该规则。`--scan-traps` 支持规范的 `→` 映射和传统的 `≈` 映射，两者遵循相同的方向约定：左侧是观测到的 ASR，右侧是目标文本。包含空格的精确 FROM 短语请用反引号括起来：

~~~markdown
- **`CC 思维链`/`CC 思维连` → 目标术语** — only under the domain's documented cue
~~~

这展示的是一个精确的 ASR 短语候选，而不是人名候选。领域上下文仍然负责确定真正的目标和提示；扫描器只负责定位字面形式的 FROM。

在添加任何形似真实词语的规则之前，先测量项目语料库：

~~~bash
uv run scripts/fix_transcription.py \
  --probe "candidate" --corpus /path/to/project-transcripts/

uv run scripts/fix_transcription.py \
  --add "candidate" "canonical" --domain myproject \
  --check-corpus --corpus /path/to/project-transcripts/
~~~

用户裁决会立即确定该次出现的处理方式，但不会使某个替换可复用。先修复文件，再将结果按照上表归类：只有稳定且反复出现的模式才进入词典/名单/上下文；罕见的、仅限句子局部的误听只保留在文件中。当用户确认两个合法姓名或昵称指的是同一个人时，保留实际说出的形式，并将身份关系作为上下文存储，而不是作为替换规则。

## 审核队列安全

在加入队列或解决问题之前，请阅读 [references/review_queue_dashboard.md](references/review_queue_dashboard.md)。

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

- `file` 对此工作流是必填项。没有它，接受操作可以记录裁决，却无法编辑转录稿。
- `original` 只能填写可疑词元/片段；绝不能在其中放入整句。
- `context` 按原文逐字复制；`line` 是关键字段，不是 `line_hint`。
- `suggested` 是关键字段，不是 `suggestion`。使用 `actions`，不要使用 `action_pack`。
- 一次只解决一个出现位置；只有在整个批次解决后，才能批量处理同一实体的其他出现位置。
- `pending` 行对于高质量/最终转录稿而言是阻塞状态，并不代表问题已得到处理。没有人工/证据裁决的队列检测会使产物保持不完整。
- 覆盖后请读取 `resolved_text`；列表中仍可能显示被拒绝的建议。
- 如果文件已移动或内容发生漂移，请运行 `--reanchor-review`。在提出要求时添加 `--reanchor-root` 或 `--reanchor-to`。不要围绕待处理项目手动编辑。
- 按含义提升每一条 `decision_note`；存储备注不会改变词典、名单、上下文或误报状态。

核心命令：

~~~bash
uv run scripts/fix_transcription.py --enqueue-review items.json
uv run scripts/fix_transcription.py \
  --list-review --review-file "<absolute-canonical-file>" \
  --review-status all --json
uv run scripts/fix_transcription.py --show-review <id> --json
uv run scripts/fix_transcription.py --reanchor-review <id>
uv run scripts/fix_transcription.py \
  --resolve-review <id> --decision accepted --by reviewer
~~~

## 数字、工件和批次

满足以下任一条件时，阅读 [references/advanced_correction_evidence.md](references/advanced_correction_evidence.md)：

- 数字、界限、价格、份额、截止时间或数量级会影响决策。
- 同一会议存在两份录音。
- 一个承载关键信息的名称或术语在本地阶梯中仍未解决，源音频可用，且当前授权已允许使用第二个识别器。
- 白板、幻灯片或拍摄的书面工件可以独立确定名称/术语。
- 多个相关文件应共用一个修正列表。
- 正在委派一个包含 10 个或更多文件的批次。

数字槽位扫描：

~~~bash
uv run scripts/scan_numeric_consistency.py transcript.md --domain myproject
~~~

其输出是候选项，绝不会自动编辑。对于单个承载关键信息的数字，将原始音频接入审查面板，然后通过听辨作出决定。

对于委派的批次，每个代理负责一个文件，不得跨文件替换，并返回剩余问题列表。之后，将 `git diff --name-only` 与明确的文件列表进行比较，并根据仓库工作树安全规则检查每个意外出现的文件。

## 最终化

- 原生模式会直接编辑原始文件。重新运行普通的 `--stage 1` 进行确认；干净的无操作运行不会写入 Stage 1 sidecar。
- 当存在较新的 `*_stage1.md` 且原始文件在此之后未被编辑时，普通的 Stage 1 重新运行会以原子方式提升该文件，并移除可丢弃的 sidecar。它会保留 `*_changes.md` 和 `*_needs_review.md`，因为只有审阅者才能知道每个相关决策是否都已关闭。`--apply-all` 永远不会走这条提升路径。
- 不要将输出文件是否存在作为成功信号；读取 JSON/退出状态，并独立读取最终文件。
- 在每个相关决策关闭之前，保留原始转录、`*_changes.md` 和 `*_needs_review.md` 作为证据。
- 在最终文件中重新搜索已知的修正形式，并确认没有任何修正只存在于 `asr_note` 或 sidecar 中。
- 如果某个已排队项目被重命名移走，请使用 `--reanchor-review` 修复它，而不要用虚假的终止性裁决来解决它。

## 无代理 API 路径

仅在没有 Claude/Codex 代理能够执行 Native AI Correction 时使用：

~~~bash
export GLM_API_KEY="<api-key>"
uv run scripts/fix_transcript_enhanced.py input.md --output ./corrected
~~~

阅读 [references/glm_api_setup.md](references/glm_api_setup.md)、[references/installation_setup.md](references/installation_setup.md) 以及 [references/workflow_guide.md](references/workflow_guide.md) 中明确面向 API 的部分。当某个块在重试后失败时，API 路径会逐字节保留该块及其原始周围分隔符，并打印警告；如果所有块都失败，完整输出将等于输入。对于 `fix_transcription.py --stage 2|3 --json`，读取新增的 `stage2_total_chunks`、`stage2_failed_chunks` 和 `stage2_degraded` 字段：即使安全保留的工件已生成，`stage2_degraded: true` 也表示这次运行并未得到完全修正。任何 Stage 2 块降级后，增强包装器会在写入该保留工件后以非零状态退出。请验证输出，不要想当然地认为出现警告就意味着存在修正后的结果。

增强版 API 封装还可以添加段落分隔、减少重复的填充词，并提供修正内容以供交互式审核。这些属于 API 封装功能；它们并不授权 Native AI 为了语言流畅而改写措辞。

## 实用命令

~~~bash
# 提取可能的错误，但不进行编辑
uv run scripts/fix_transcription.py --extract-uncertain \
  --input meeting.md --output ./review

# 导入整理后的预设规则
uv run scripts/fix_transcription.py --load-presets tech

# 修复时间戳
uv run scripts/fix_transcript_timestamps.py meeting.txt --in-place

# 拆分并重新设置各节的基准
uv run scripts/split_transcript_sections.py meeting.txt \
  --first-section-name "intro" \
  --section "main::<verbatim marker>" \
  --rebase-to-zero

# 生成逐词审核差异
uv run scripts/generate_word_diff.py original.md corrected.md output.html

# 将 native-pass 编辑整理为上下文陷阱候选项
uv run scripts/harvest_corrections.py raw.md corrected.md \
  --context-file ~/.transcript-fixer/contexts/myproject.md --write

# 多格式 Stage 1/API 对比报告
uv run scripts/generate_diff_report.py \
  original.md original_stage1.md original_stage2.md \
  --output ./diff_reports

# 设置健康检查
uv run scripts/fix_transcription.py --validate
~~~

在使用不常见的标志之前，请阅读 [references/script_parameters.md](references/script_parameters.md)。在使用自定义 SQL 之前，请阅读 [references/database_schema.md](references/database_schema.md)；修正列为 `from_text` 和 `to_text`。

## 参考资料索引

所有参考资料都位于此文件下一级目录中。

| 需求 | 阅读 |
|---|---|
| 完整的 native correction 流程 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 词典、人员名册、领域上下文 | [dictionary_identity_and_context.md](references/dictionary_identity_and_context.md) |
| 误报策略 | [false_positive_guide.md](references/false_positive_guide.md) |
| 队列、仪表板、音频、重新锚定 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 数字、照片、多录音、片段交叉核对、批处理 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |
| 上下文文件语法/模板 | [domain_context_guide.md](references/domain_context_guide.md) |
| CLI 标志和审核项目架构 | [script_parameters.md](references/script_parameters.md) |
| 数据库架构和查询 | [database_schema.md](references/database_schema.md)、[sql_queries.md](references/sql_queries.md) |
| 简短命令查询 | [quick_reference.md](references/quick_reference.md)、[dictionary_guide.md](references/dictionary_guide.md) |
| 学习循环 | [iteration_workflow.md](references/iteration_workflow.md) |
| Native 示例 | [example_session_dji_minutes.md](references/example_session_dji_minutes.md) |
| 无代理 API 示例/配置 | [example_session.md](references/example_session.md)、[glm_api_setup.md](references/glm_api_setup.md)、[installation_setup.md](references/installation_setup.md) |
| 架构和格式 | [architecture.md](references/architecture.md)、[file_formats.md](references/file_formats.md) |
| 运行指导 | [best_practices.md](references/best_practices.md)、[troubleshooting.md](references/troubleshooting.md)、[team_collaboration.md](references/team_collaboration.md)、[workflow_guide.md](references/workflow_guide.md) |

捆绑的脚本会被执行，而不会加载到上下文中。主要入口点包括 `fix_transcription.py`、`scan_numeric_consistency.py`、`fetch_minute_audio.py`、`review-dashboard/server.py`，以及上文列出的差异比较/时间戳/分割工具。

## 交接

校正完成后，仅当用户希望获得结构化摘要时，才交接给 `/daymade-audio:meeting-minutes-taker`。不要自动创建会议纪要：转录校正和摘要属于不同的范围。