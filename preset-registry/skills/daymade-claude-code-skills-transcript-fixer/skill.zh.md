---
name: transcript-fixer
description: >-
  Corrects speech-to-text transcription errors with dictionary rules and Claude's built-in AI (no external API key required); Native AI Correction is the default, Stage 1 alone is incomplete, and Stage 3 API is only for automation without Claude Code. Builds personalized correction databases, loads person-name ASR variants from the configured global people roster, and reads per-domain contexts for homophones. Before correcting a person name, the agent must consult both the global roster and the owning project's identity roster; project rosters are not auto-loaded, and occurrence frequency is never identity evidence. Use for ASR/STT output with recognition errors, homophones, garbled technical terms, person-name errors, or mixed Chinese/English, and for cleaning meeting notes, lecture transcripts, interviews, or any speech-recognition text—even when the user only says “fix this transcript,” “clean up these meeting notes,” or mentions a garbled name.
---
# Transcript Fixer

使用双阶段循环：

1. Stage 1 应用确定性的、已知的修正。
2. Native AI Correction 读取完整转录稿，修复一次性错误，验证不确定的实体，并积累可复用的修正。

**Native AI Correction 是默认流程。仅执行 Stage 1 并不完整。** Stage 3 API 仅用于没有 Claude/Codex agent 可用的自动化场景。

## Operating contract

- 完成 Stage 1 → Native AI Correction → 积累已确认的重复性修正。不要仅在 Stage 1 完成后就报告转录稿已清理完毕。
- 只有在人类明确将本次运行限制为词典处理，或有日期标记的工件证明 Native AI 已经在该确切转录稿上运行过时，才跳过 Native AI。
- 在 Claude Code 或 Codex 中，不要运行 Stage 3。使用 Stage 1 加原生工作流。
- 永远不要为了流畅而改写语音内容。修正必须能够解释合理的 ASR 错误，并保留谁说了什么。
- 永远不要推断或重新分配说话人身份。保留说话人标签行；人工确认的标签和用户裁决具有权威性。
- 在修正任何人名之前，直接读取已配置的全局人员名单，以及所属项目明确的身份名单或别名账本。Stage 1 只会自动加载全局 `ASR 变体` 条目；它不会加载项目名单，也不会公开被抑制、禁用或未列出的条目。如果预期来源缺失或来源之间存在冲突，则保持人名不变，并将其加入待处理队列或询问一次。永远不要将出现频率作为身份证据。在确定人名之前，阅读 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。
- 保持未解决文本不变，并将其加入待处理队列。可见的乱码比流畅但错误的猜测更安全。
- 将不熟悉的词视为未知，而不是错误。首先穷尽本地证据阶梯。对于仍未解决且具有关键作用的词，仅当源音频和获准的第二引擎都已可用时，才使用片段级交叉识别器这一阶；否则将其加入待处理队列或询问。来自真正不同识别器家族的一致结果可以强力佐证语音，但永远不能在同音异形词之间做选择，也不能覆盖人名关卡。使用前阅读原生工作流第 4 步、第 7 阶。
- 单行 `asr_note` 值属于修正溯源信息：它有意引用旧形式，并会被排除在匹配范围之外。多行 YAML 账本值不会被屏蔽；关键词、标题、其他源自 ASR 的元数据以及正文仍处于修正范围内。
- 在执行原生处理之前，完整阅读 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。在执行相应操作之前，阅读下方指定的任务专用参考资料。

## Run context

每个入口点都通过 `uv run` 运行；需要第三方 Python 包的入口点使用 PEP 723 声明这些依赖，而仅依赖标准库/内部模块的工具可以省略元数据块。从调用此 skill 时打印出的 skill 目录执行命令，或为每个脚本路径添加该目录前缀。不要依赖 `$CLAUDE_SKILL_DIR`；并非所有 harness 都提供该变量。

如果捆绑位置确实未知，请使用 [references/installation_setup.md](references/installation_setup.md) 中的安装解析过程。不要从广泛的 `find` 中选择第一个结果：缓存、备份和旧版本可以共存。

## Quick start

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

安全模式是 Stage 1 的默认模式：低风险规则适用；中/高风险匹配推迟到 `*_needs_review.md` 和持久的审查队列。`Applied: 0` 是一个有效的结果，并非转录内容干净的证明。

The Stage 1 JSON contract is:

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
  "stage2_degraded": false,
  "boundary_refused": 0
}
~~~

读取所有十一个字段。`boundary_refused` 计数字典匹配中 word-boundary 检查在此运行中拒绝的次数——既未应用也未推迟，因此比较运行的调用者可以看到为什么推迟消失；`--apply-all` 切换关闭此检查。`stage1_only_incomplete` 是对原始六字段调用者合同的附加项，必须在 Stage 1 脚本运行时保持为真；只有调用者可以通过运行 Native AI 或明确选择无代理的 Stage 2/3 路线来关闭它。三个 `stage2_*` 遥测字段始终存在：Stage 1 报告 `0`，`0` 和 `false`；Stage 2/3 用实际 API 结果替换它们。不要从是否存在侧车来推断无操作或成功。

要了解端到端的原生示例，请阅读 [references/example_session_dji_minutes.md](references/example_session_dji_minutes.md)。

## Choose the route

| Route | Use when | Required reading |
|---|---|---|
| Fast native | Short/plain transcript, known speakers, low stakes | This file + [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| Full native | Domain-heavy, unfamiliar entities, 3+ speakers, long or decision-bearing transcript | [native_ai_full_workflow.md](references/native_ai_full_workflow.md), plus queue and evidence references below |
| Caller integration | Another skill or ingest pipeline invokes Stage 1 | `Cross-skill caller contract` below |
| Review queue/dashboard | Any item is uncertain or needs audio | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| Agent-less API | CI/batch automation with no agent available | [glm_api_setup.md](references/glm_api_setup.md) and [workflow_guide.md](references/workflow_guide.md) |
| Multi-file batch | Several related transcripts; especially 10+ files | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |

将词汇和风险等级作为主要分层信号；仅在无法区分时才使用长度作为决胜因素。一次五分钟的医疗访谈可能需要完整层级，而一篇篇幅较长、内容平实的双人备忘录则可以使用快速层级。

## 原生修正检查清单

1. **在 Stage 1 之前为文件确定最终名称。** 队列锚点存储绝对路径。在任何延迟处理可以入队之前，先使用人类可读的项目文件名。输入以内联文本形式到达、尚未有文件时——例如斜杠命令参数或粘贴的文本块——先将其写入文件；`--input` 和队列锚点都需要路径，而下游不会归档时使用临时位置即可。未提供 `--domain` 且上下文中也没有明显的域？省略该标志本身就会默认搜索所有域（`--domain` 自身的默认值），因此不要因为选择域而阻塞——直接运行不带参数的 Stage 1，让安全模式决定自动应用哪些内容。如果仍需解析某个具体候选项，即使处于快速层级，也可以保留验证阶梯中的一步，因为成本足够低：native_ai_full_workflow.md 第 4 步的第 1 级，即进行一次跨域查询——`--lookup "<term>"` 会输出该术语的所有现有声明（字典规则启用或禁用时，作为 FROM 或 TO；上下文规则；名册变体；队列行）——而不是按照层级表要求跳过的完整验证阶梯，只执行这一次查询。
2. **在阅读预修正的转录文本之前恢复原始基线。** 如果摄取流水线或之前的 API 处理已经接触过文本，先与原始来源进行差异比较。将上游编辑视为编辑，而不是事实依据。
3. **加载项目先验信息并阅读完整转录文本。** 如果存在，先读取 `~/.transcript-fixer/contexts/<domain>.md`，然后通读整个文件，再决定早期歧义。
4. **运行 Stage 1 并检查实际结果。** 优先使用明确的项目域以及 `--apply-domain --json`。读取 `deferred` 和 `review_enqueued`；绝不要默默丢弃 sidecar 或队列缺口。
5. **将 Stage 1 与原始文本/原文进行差异比较。** 如果某条规则改变了正确的语音内容，应从原文着手，使用 `--report-false-positive "<from>" "<to>" --domain <domain>` 撤销存储的配对，并验证该配对不再触发。
6. **对每个候选项进行分诊。**
   - 确信：语音变化合理，且上下文或权威本地来源已经解决了该问题。
   - 需要验证：人物、公司、产品、型号、股票代码、地点、数字或其他承载关键信息的术语，但没有来源。
   - 不确定：证据不足以解决问题；保留原文并入队。
   - 多通道实体分叉：当独立转录文本中的人名或其他专有名词不一致，且没有本地权威来源可以解决时，收集未解决的分叉并一次性询问人工。不要猜测，也不要将多数票视为身份依据。
7. **应用能够解释该语音的最小编辑。** 不要添加说话者没有说出的词。也要修正 ASR 派生的元数据，同时保留 `asr_note` 不变。对于如今已经同意的 Stage 1 延迟项，应通过其队列行关闭，而不是使用 sed 重新应用：`--resolve-review <id> --decision accepted`（id 来自 `--list-review --review-file "<absolute-canonical-file>" --json`）会执行编辑，或者记录你已经手动应用的修复而不写入文件。无论哪种情况，该行最终都应为 `accepted`；`kept_original` 表示转录文本按原样就是正确的，绝不能用于已经手动应用修复的情况。
8. **运行第二遍处理。**
   - 每个层级：运行 `--scan-traps`，并检查命中项和 `unparsed`。
   - 完整层级：对恰好一个已修正文件使用新上下文审查者。要求提供简洁的残留问题表，或明确写出 `no new residuals`；空响应或被截断的响应都表示审查失败。
   - 高风险多录音场景：采样片段只能解决对应锚定项。如果用户要求更高质量或完整转录，且基线音频可用，请加载 **`/daymade-audio:asr-transcribe-to-text`**，并在完整且最清晰的规范录音上运行其完整文件转录流程，然后才能声称覆盖整个转录文本；否则应报告 `sampled cross-check only — incomplete`。优先使用不同于规范正文生成器的识别器。如果只有同一个识别器可用，则本次运行能够证明完整源覆盖，但不能证明不同识别器之间的独立佐证；应明确说明这一界限。
9. **将每个未解决项入队，并且只打开此文件。** 遵循下方的 `Review queue safety` 和 [review_queue_dashboard.md](references/review_queue_dashboard.md)。检测和入队不等于修正：若要声称更高质量/最终版本，锚定到此确切文件的每个队列行都必须离开 `pending` 状态。使用 `uv run scripts/review-dashboard/server.py --file "<absolute-canonical-file>"` 启动仪表板；添加 `--item <id>` 可直接定位到一个分叉项。如果人工不可用，应明确将产物标记为 `draft / unresolved — incomplete` 并列出各行；不要在声称已完成质量处理的情况下发布包含可疑原文的内容。
10. **读回人工处理状态，然后完成最终化。** 当人工表示已经在仪表板中完成标记时，不要重新运行 ASR，也不要再次提出相同问题。首先运行 `uv run scripts/fix_transcription.py --list-review --review-file "<absolute-canonical-file>" --review-status all --json`，应用由此产生的文件状态，并要求该确切路径满足 `stats.pending_total == 0`；在声称高质量/最终版本之前，必须确保待处理行数为零。然后对实际编辑的文件进行差异比较，在数字重要时运行数字一致性检查，重新运行普通 Stage 1，重新搜索已知修正，并确认每项变更都能追溯到一个分诊决定。全局队列计数不能关闭或重新打开此文件的质量声明。最后运行 `--close-sidecars --input "<absolute-canonical-file>"`：它会重新依据文件和队列检查每个 `*_changes.md`/`*_needs_review.md` 条目；如果某个条目仍显示原始内容但没有裁决，或仍有任何行处于 pending 状态，它就会拒绝执行；只有在全部内容关闭后才会删除 sidecar（参见 `Finalization`）。
11. **在同一轮处理中沉淀经验。** 将每个稳定模式路由到正确的归属位置；不要只将已确认的修复留在聊天中。原生处理阶段的编辑不会进入 Stage 1 的修正历史，因此应在最终差异比较之后立即机械化收集：

~~~bash
    # Diff raw vs corrected into parseable trap candidates (review artifact —
    # you adjudicate the printed list; --write auto-appends only the recurring
    # (≥2x) non-bare candidates; --write-all also appends the one-off set)
    uv run scripts/harvest_corrections.py raw.md corrected.md \
      --context-file ~/.transcript-fixer/contexts/<domain>.md
    ~~~

    每个输出的项目在打印前都会通过真实的 trap 解析器进行往返验证，并跳过上下文文件中已经记录的配对。trap 项目语法无法承载的配对会在噪声过滤阶段被丢弃，例如一侧没有词汇内容，或包含 `*`；这包括将供应商的 `***` 脱敏掩码与真实词语进行比较的情况。任何仍然无法解析的项目都会报告到 stderr，并被排除，而不会中止运行。高频候选是强陷阱；单次出现的候选需要人工判断，这也是 `--write` 默认将其排除的原因；⚠️ 裸形候选永远不会被自动写入。这取代了凭记忆手写陷阱项目的做法。
12. **有意识地传递实体修复。** 只搜索所属项目的派生笔记/摘要，审查每个命中项，并排除原始 ASR 和修正 sidecar，因为它们要保留证据链。

详细的溯源标准、本地优先的实体阶梯、第二轮提示词、队列负载和最终化规则见 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。

## 跨 skill 调用方契约

调用方流水线有两项相互独立的义务：

1. 使用明确配置的项目域运行 Stage 1，并指定 `--apply-domain` 和 `--json`。如果 `deferred > review_enqueued`，则必须将审核 sidecar 持久化到临时目录之外，或将该缺口标记为失败。
2. 在加载此 skill 的情况下运行 Native AI，或报告 `Stage 1 only — incomplete`。无代理自动化可以改用 Stage 3。

规范调用：

~~~bash
uv run scripts/fix_transcription.py \
  --input "$staged" --stage 1 \
  --domain "$domains" --apply-domain --json
~~~

只接入脚本路径的调用方永远不会加载此契约。因此，仅接入脚本路径只能算作 Stage 1 预过滤，而不是转录修正。

保持项目域处于最新状态：Native AI 阶段确认的每个重复修正都必须添加回正确的项目域、人员名册或上下文文件。

## 词典与身份安全

添加规则前，请阅读 [references/false_positive_guide.md](references/false_positive_guide.md) 和 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。

| 模式 | 目标位置 |
|---|---|
| 稳定的非词语或唯一乱码 → 规范术语 | `--add ... --domain <project>` |
| 重要的重复出现人员及其已观察到的 ASR 变体 | People roster |
| 仅在特定重复短语中才正确的修正 | `--add-context-rule PATTERN REPLACEMENT --domain <project>`（正则表达式，限定域；全局规则省略 `--domain`） |
| 仅在某个提示语下错误的常见词/真实词 | 域上下文陷阱，绝不使用裸规则 |
| 真实姓名 → 不同的真实姓名 | 域上下文 + 人工/音频验证，绝不使用裸规则 |
| 已确认正确但反复被重新打开的实体 | Confirmed-correct context record |
| 一次性的句子级措辞 | 仅编辑；不要添加 |

Stage 1 的匹配时间层（[references/false_positive_guide.md](references/false_positive_guide.md) 中三个层的第三层：添加时间、应用时间、匹配时间）在风险评分前的三个检查点上，也会单独拒绝字典匹配：超集检查（修正后的形式已经存在）、短规则的常见词边界检查，以及词边界检查。最后一项会通过脚本判断匹配内容是否只是实际词语的片段：如果 ASCII 匹配内容旁边直接有 ASCII 字母，则它位于更长的词中（`Cloud` 出现在 `iCloud` 中）；数字不计入其中，因此 `cloud3` 仍会被修正；CJK 匹配只有在与其重叠的、仅使用字典进行 jieba 切分所得的每个片段都是多字符词，并且其中一个跨越匹配边界时才会被拒绝（更新|一下中的新一、问题|记录中的问题记、同龄人中的同龄）——如果匹配内容下方存在一个单字符片段（巨|神智|能、叫|新|一下|单），则说明这是未知片段，匹配会继续执行。拒绝会计入 `Refused at word boundaries`，并在 JSON 的 `boundary_refused` 中记录，列在 Stage 1 摘要中，且绝不会被延后处理。上下文规则（`--add-context-rule`）会跳过此检查，但仍会进行风险评分，因此在安全模式下，其匹配会被延后到审核队列，而不是直接应用——可以在那里接受它，或者运行 `--apply-all`，该选项会关闭此检查并应用每个匹配；`--apply-domain` 会保留此检查。各层列于 [references/false_positive_guide.md](references/false_positive_guide.md) 中。

上下文陷阱是提示，而不是允许盲目替换的许可。领域上下文文件中的两类注释属于 **Stage 1 强制执行的机器可读否决项**（当通过 `--domain` 指定领域时——整库运行没有可执行否决的所有者）：标记为 `禁裸词`/`禁入词典` 的陷阱会将任何 FROM 相同的字典规则降级到审核队列，而已确认正确的（勿修）记录会将任何 FROM 为该词的规则降级——降级优先于 `--apply-domain` 的信任扁平化，因此真实词规则（绿点→绿电这一类：在业务上下文中正确，在 UI 上下文中错误）可以保留在字典中，而不会被盲目触发。`--apply-all` 仍然是操作者明确的覆盖选项。如果没有该否决项，唯一的退出方式是 `--report-false-positive`，但这也会在该规则正确的上下文中一并禁用它。`--scan-traps` 支持规范的 `→` 和旧版的 `≈` 映射，并遵循相同的方向约定：左侧是观察到的 ASR，右侧是预期文本。包含空格的精确 FROM 短语请用反引号包裹：

~~~markdown
- **`CC 思维链`/`CC 思维连` → 目标术语** — only under the domain's documented cue
~~~

这表示一个精确的 ASR 短语候选，而不是人名候选。领域上下文仍然是实际目标和提示的权威来源；扫描器只负责定位字面 FROM 形式。

在添加任何形似真实词语的规则之前，请先测量项目语料库：

~~~bash
uv run scripts/fix_transcription.py \
  --probe "candidate" --corpus /path/to/project-transcripts/

uv run scripts/fix_transcription.py \
  --add "candidate" "canonical" --domain myproject \
  --check-corpus --corpus /path/to/project-transcripts/
~~~

用户裁决会立即确定该次出现的处理结果，但不会使替换规则可复用。先修复文件，然后根据上表处理结果：只有稳定的重复模式才进入词典/名册/上下文；罕见的、仅限于句子局部的误听只保留在文件中。当用户确认两个合法姓名或昵称指的是同一个人时，保留实际说出的形式，并将身份关系作为上下文存储，而不是作为替换规则。

## 审核队列安全

在入队或解决之前，请阅读 [references/review_queue_dashboard.md](references/review_queue_dashboard.md)。

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

- `file` 是此工作流的必填字段。没有它，接受操作可能记录裁决，却无法编辑转录稿。
- `original` 只能填写可疑词元/片段；不要在其中放入整个句子。
- `context` 必须逐字复制；`line` 是关键字段，不是 `line_hint`。
- `suggested` 是关键字段，不是 `suggestion`。使用 `actions`，不要使用 `action_pack`。
- 一次只解决一个出现位置；只有在整个批次解决后，才能批量处理同一实体的其他出现位置。
- `pending` 行对于高质量/最终转录稿而言是阻塞状态，并不表示问题已经处理。仅检测到问题并将其加入队列、但没有人工/证据裁决，会使产物处于不完整状态。
- 覆盖后读取 `resolved_text`；列表中仍可能显示被拒绝的建议。
- 单行 `asr_note` 台账在接受路径上也会被屏蔽，因此解决项目时不会编辑引用旧形式的溯源行。如果你在解决之前已经手动应用了修复，仍应使用 `--decision accepted` 关闭该项目（对于使用覆盖文本的情况，则使用 `overridden`）：当入队时记录的上下文在文件中的任意位置再次出现，且建议文本位于原始文本所占的位置时，裁决会在不写入文件的情况下被记录（`already in place at the anchor — recorded without writing`）。行号漂移不影响此行为；原始文本在提示位置很远的其他话语中继续存在也不影响，原始文本出现在建议文本内部也不影响（阿里→阿里云）。以下情况会以 `ReAnchorNeeded` 失败关闭，并在消息中说明具体原因：原始文本仍位于提示位置的解决窗口内、但不在建议文本中（锚定话语或其旁边的相似话语仍然是乱码——请单独为该行处理，或手动修复后再解决；不要使用 `--reanchor-review` 将此项目重新锚定到该行）；记录的邻域还以第三种形式出现（在文件中匹配宽度的任意位置，或在提示位置附近以每侧缩小到两个字符的任意宽度出现）；或者编辑触及了文本位置旁边的字符。它无法识别的情况是：锚定话语被删除，或在两个相邻字符之外被重写，而文件中其他位置的相同话语已经被修正——此时它会在没有写入任何内容的情况下记录 `accepted`，而文件中残留的乱码会在下一次 Stage 1 运行时重新延后处理。`--reanchor-review <id>` 会修复原始文本已移动或发生漂移的项目，但如果其上下文已经是修正后的文本，则会拒绝该操作。对于队列既无法重新锚定、也无法识别的项目，使用 `--decision skipped --note <what happened>` 关闭。`kept_original` 表示转录稿保留原始形式——对于你已经应用修复的项目，绝不能以此作为退出方式。
- 如果文件已移动或发生漂移，请运行 `--reanchor-review`。在被要求时添加 `--reanchor-root` 或 `--reanchor-to`。不要围绕待处理项目手动编辑。
- 根据含义提升每个 `decision_note`；存储备注不会更改词典、名册、上下文或误报状态。

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

## 数字、工件与批次

在满足以下任一条件时，阅读 [references/advanced_correction_evidence.md](references/advanced_correction_evidence.md)：

- 数字、界限、价格、份额、截止日期或数量级会影响决策。
- 同一会议存在两份录音。
- 一个承载关键信息的名称或术语经过本地阶梯流程后仍未解决，源音频可用，并且当前授权已允许使用第二个识别器。
- 白板、幻灯片或拍摄的书面工件可以独立确定名称或术语。
- 多个相关文件应共享同一份修正列表。
- 正在委派一个包含 10 个或更多文件的批次。

数字槽扫描：

~~~bash
uv run scripts/scan_numeric_consistency.py transcript.md --domain myproject
~~~

其输出是候选项，绝不会自动编辑。对于单个承载关键信息的数字，将原始音频接入审查面板并通过听辨做出决定。

对于委派的批次，每个代理负责一个文件，不得跨文件替换，并返回残留列表。之后，将 `git diff --name-only` 与明确的文件列表进行比较，并根据仓库工作区安全规则检查每个意外出现的文件。

## 最终化

- 原生模式会直接编辑原始文件。重新运行普通的 `--stage 1` 以确认；干净的无操作不会写入 Stage 1 sidecar。
- 当较新的 `*_stage1.md` 存在且原始文件在其生成后未被编辑时，普通的 Stage 1 重运行会以原子方式将其提升，并移除一次性 sidecar。它会保留 `*_changes.md` 和 `*_needs_review.md`：这些是审查证据，`--close-sidecars` 才是决定它们已关闭的命令。`--apply-all` 永远不会走这条提升路径。
- 不要将输出文件是否存在作为成功信号；读取 JSON/退出状态，并独立读取最终文件。
- 在 `--close-sidecars --input "<absolute-canonical-file>"` 报告 `closed` 之前，保留原始转录、`*_changes.md` 和 `*_needs_review.md` 作为证据：每个条目都必须显示已应用于文件中（或者原始形式不再出现在应用账本遮罩后的转录中），或由针对该确切文件的已决定队列行回答——每次出现对应一行，按最近行匹配，因此第二次出现若没有自己的行仍会保持未决定状态——并且文件不得有待处理行。它在以下情况下退出并返回 1（`open`），列出未决定的条目和待处理的 id；当 `*_stage1.md` 比文件更新、仍在等待普通 Stage 1 重运行，或报告包含解析器无法读取的条目时返回 2（`blocked`）（无法读取的报告是证据，不代表报告为空）；移除证据和过期的运行输出后返回 0。对于仍显示为原始内容且完全没有对应行的条目，`--decide-raw kept_original|skipped --by <who> --note <why>` 会在关闭时通过队列记录裁决——这是审计跟踪，而不是静默删除。`--dry-run` 会显示裁决但不删除；`--json` 会返回裁决。
- `*_stage2.md` 和 `*_dryrun.md` 是 API 路由和预览所产生的、限定于本次运行的输出，不是归档材料：应在生成它们的会话中提升或丢弃它们。任何一个文件只要比转录文件新，就表示尚未提升——`--close-sidecars` 会保留它、说明这一点，并且只有使用 `--discard-unpromoted` 才会移除它。
- 在最终文件中重新搜索已知的修正形式，并确认没有修正只存在于 `asr_note` 或 sidecar 中。
- 如果某个排队项目被重命名移走，应使用 `--reanchor-review` 修复，而不是用虚假的终止裁决将其解决。

## 无代理 API 路由

仅当没有 Claude/Codex agent 能够执行 Native AI Correction 时：

~~~bash
export GLM_API_KEY="<api-key>"
uv run scripts/fix_transcript_enhanced.py input.md --output ./corrected
~~~

该路由会将 `<stem>_stage2.md` 写入输入文件旁边。这是本次运行的输出，而不是第二份 transcript：请先验证它，然后在会话结束前将其提升为 transcript，或将其丢弃。放在 transcript 旁边的 `_stage2.md` 如果不是当前使用的那份，一个月后将无法与已审核的工作区分开来。

请阅读 [references/glm_api_setup.md](references/glm_api_setup.md)、[references/installation_setup.md](references/installation_setup.md)，以及 [references/workflow_guide.md](references/workflow_guide.md) 中明确面向 API 的部分。当某个 chunk 在重试后失败时，API 路由会逐字节保留该 chunk 及其原始周围分隔符，并打印警告；如果所有 chunk 都失败，完整输出将等于输入。对于 `fix_transcription.py --stage 2|3 --json`，请读取附加的 `stage2_total_chunks`、`stage2_failed_chunks` 和 `stage2_degraded` 字段：即使安全保留的 artifact 已生成，`stage2_degraded: true` 也不表示本次运行已完成纠正。如果任意 Stage 2 chunk 处于 degraded 状态，增强版包装器会在写入该保留 artifact 后以非零状态退出。请验证输出，不要假定警告意味着已经存在经过纠正的结果。

增强版 API 包装器还可以添加段落分隔、减少重复的填充词，并提供交互式审核的纠正结果。这些属于 API 包装器功能；它们并不授权 Native AI 为追求流畅而改写措辞。

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

# Every existing claim on a term: dictionary (active/disabled), context rules, roster, queue
uv run scripts/fix_transcription.py --lookup "候选词"

# Decide whether one finished transcript's review sidecars are closed, then remove them
uv run scripts/fix_transcription.py --close-sidecars \
  --input "/absolute/meeting.md" --dry-run

# Setup health
uv run scripts/fix_transcription.py --validate
~~~

在使用不常见的 flags 前，请阅读 [references/script_parameters.md](references/script_parameters.md)。在使用自定义 SQL 前，请阅读 [references/database_schema.md](references/database_schema.md)；纠正列为 `from_text` 和 `to_text`。

## 参考索引

所有参考资料都位于此文件下一级目录中。

| 需求 | 阅读 |
|---|---|
| 完整的原生校正流程 | [原生 AI 完整工作流](references/native_ai_full_workflow.md) |
| 词典、人员名册、领域上下文 | [词典、身份与上下文](references/dictionary_identity_and_context.md) |
| 误报处理策略 | [误报指南](references/false_positive_guide.md) |
| 队列、仪表板、音频、重新锚定 | [审核队列、仪表板](references/review_queue_dashboard.md) |
| 数字、照片、多段录音、片段交叉核对、批次 | [高级校正证据](references/advanced_correction_evidence.md) |
| 上下文文件语法/模板 | [领域上下文指南](references/domain_context_guide.md) |
| CLI 参数和审核项目架构 | [脚本参数](references/script_parameters.md) |
| 数据库架构和查询 | [数据库架构](references/database_schema.md)、[SQL 查询](references/sql_queries.md) |
| 快速命令查询 | [快速参考](references/quick_reference.md)、[词典指南](references/dictionary_guide.md) |
| 学习循环 | [迭代工作流](references/iteration_workflow.md) |
| 原生示例 | [示例会话 DJI 会议纪要](references/example_session_dji_minutes.md) |
| 无代理 API 示例/配置 | [示例会话](references/example_session.md)、[GLM API 设置](references/glm_api_setup.md)、[安装设置](references/installation_setup.md) |
| 架构和格式 | [架构](references/architecture.md)、[文件格式](references/file_formats.md) |
| 操作指南 | [最佳实践](references/best_practices.md)、[故障排查](references/troubleshooting.md)、[团队协作](references/team_collaboration.md)、[工作流指南](references/workflow_guide.md) |

随附的脚本会被执行，而不会加载到上下文中。主要入口点是 `fix_transcription.py`、`scan_numeric_consistency.py`、`fetch_minute_audio.py`、`review-dashboard/server.py`，以及上文列出的差异/时间戳/拆分工具。

## 交接

校正完成后，仅当用户需要结构化摘要时，才交接给 `/daymade-audio:meeting-minutes-taker`。不要自动创建会议纪要：转录校正和摘要属于不同范围。