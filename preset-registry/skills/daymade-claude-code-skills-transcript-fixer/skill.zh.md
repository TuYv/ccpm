---
name: transcript-fixer
description: >-
  Corrects speech-to-text transcription errors with dictionary rules and Claude's built-in AI (no external API key required); Native AI Correction is the default, Stage 1 alone is incomplete, and Stage 3 API is only for automation without Claude Code. Builds personalized correction databases, loads person-name ASR variants from the configured global people roster, and reads per-domain contexts for homophones. Before correcting a person name, the agent must consult both the global roster and the owning project's identity roster; project rosters are not auto-loaded, and occurrence frequency is never identity evidence. Use for ASR/STT output with recognition errors, homophones, garbled technical terms, person-name errors, or mixed Chinese/English, and for cleaning meeting notes, lecture transcripts, interviews, or any speech-recognition text—even when the user only says “fix this transcript,” “clean up these meeting notes,” or mentions a garbled name.
---
# Transcript Fixer

使用两阶段循环：

1. Stage 1 应用确定性的、已知的更正。
2. 原生 AI 校正读取完整转录文本，修复一次性错误，核实不确定的实体，并累积可复用的更正。

**原生 AI 校正是默认流程。仅执行 Stage 1 是不完整的。** Stage 3 API 仅用于没有可用 Claude/Codex agent 的自动化场景。

## 操作约定

- 完成 Stage 1 → 原生 AI 校正 → 累积已确认的重复性更正。不要仅在 Stage 1 完成后就报告转录文本已清理完毕。
- 只有在人类明确将本次运行限制为词典处理，或有带日期的产物证明原生 AI 已经在这份确切的转录文本上运行过时，才跳过原生 AI。
- 在 Claude Code 或 Codex 中，不要运行 Stage 3。使用 Stage 1 加原生工作流。
- 永远不要为了流畅而改写语音内容。更正必须能够解释一种合理的 ASR 错误，并保留谁说了什么。
- 永远不要推断或重新分配说话人身份。保留说话人标签行；人类确认的标签和用户裁决具有权威性。
- 在更正任何人名之前，直接读取已配置的全局人员名册，以及所属项目明确的身份名册或别名台账。Stage 1 只会自动加载全局 `ASR 变体` 条目；它不会加载项目名册，也不会暴露已抑制、已禁用和未列出的条目。如果预期来源缺失或来源之间存在冲突，则保持姓名不变，并将其加入待处理队列或询问一次。在任何情况下都不要将出现频率作为身份证据。确定姓名前请阅读 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。
- 在升级处理之前，先利用可用证据解决疑问。音频下载是一种证据渠道，并非执行原生校正的前提。当音频不可用时，遵循[证据选择与升级处理](references/native_ai_full_workflow.md#evidence-selection-and-escalation)；不要要求用户更改下载权限，也不要将每一条待处理记录都视为只有用户才能回答的问题。
- 对确实无法解决的文本保持不变，并将其加入待处理队列。可见的乱码比流畅但错误的猜测更安全；待处理记录代表不确定性，而不是自动移交给人类处理。
- 将不熟悉的词视为未知，而不是错误。先彻底走完本地证据阶梯。对于仍未解决且具有承载作用的词元，仅当源音频和获准使用的第二引擎均已可用时，才使用片段级跨识别器环节；否则按照上述升级策略，继续利用现有证据。在确实不同的识别器系列之间达成一致，可以强力佐证语音内容，但绝不能在同音异形词之间做出选择，也不能覆盖人名校验门槛。使用该环节前请阅读原生工作流第 4 步的第 7 个梯级。
- 将单行 `asr_note` 值视为更正溯源信息：它会有意引用旧形式，并被排除在匹配范围之外。多行 YAML 台账值不会被屏蔽；关键词、标题、其他源自 ASR 的元数据以及正文仍属于更正范围。
- 执行原生处理前，请完整阅读 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。在执行相应操作前，请阅读下方列出的特定任务参考文档。

## 运行上下文

通过 `uv run` 运行每个入口点；需要第三方 Python 包的入口点使用 PEP 723 声明依赖，而仅使用标准库/内部模块的工具可以省略元数据块。请从调用此 skill 时打印出的 skill 目录执行命令，或为每个脚本路径添加该目录前缀。不要依赖 `$CLAUDE_SKILL_DIR`；并非每个 harness 都提供该变量。

如果确实不知道 bundle 的位置，请使用 [references/installation_setup.md](references/installation_setup.md) 中的安装解析流程。不要从宽泛的 `find` 结果中选择第一项：缓存、备份和旧版本可能共存。

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

安全模式是第 1 阶段的默认模式：低风险规则会应用；中风险/高风险匹配项会延后到 `*_needs_review.md` 和持久化审查队列中。`Applied: 0` 是有效结果，并不能证明转录文本没有问题。

第 1 阶段的 JSON 契约如下：

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

读取结果中的每个字段。`boundary_refused` 统计本次运行中词边界检查拒绝的字典匹配项——这些匹配项既未应用，也未延后，因此调用方在比较多次运行结果时可以看到某个延后项为何消失；`--apply-all` 会关闭该检查。`stage1_only_incomplete` 是对原始调用方契约的附加字段，在运行第 1 阶段脚本时必须保持为 true；只有调用方运行 Native AI，或明确选择无 agent 的第 2/3 阶段路径后，才能将其关闭。`stage2_*` telemetry 字段始终存在：第 1 阶段报告 `0`、`0` 和 `false`；第 2/3 阶段则将其替换为实际的 API 结果。不要根据是否存在 sidecar 来推断无操作或成功。

如需查看原生端到端示例，请阅读 [references/example_session_dji_minutes.md](references/example_session_dji_minutes.md)。

## 选择路径

| 路径 | 使用场景 | 必需阅读材料 |
|---|---|---|
| 快速原生 | 简短/纯文本转录、说话人已知、风险较低 | 本文件 + [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 完整原生 | 领域相关内容较多、实体不熟悉、3 名以上说话人、篇幅较长或涉及决策的转录 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md)，以及下方的队列和证据相关参考资料 |
| 调用方集成 | 其他 skill 或 ingest pipeline 调用第 1 阶段 | 下方的 `Cross-skill caller contract` |
| 审查队列/仪表板 | 任何不确定或需要音频的项目 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 无 agent API | 没有可用 agent 的 CI/批处理自动化 | [glm_api_setup.md](references/glm_api_setup.md) 和 [workflow_guide.md](references/workflow_guide.md) |
| 多文件批处理 | 多个相关转录；尤其是 10 个以上文件 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |

将词汇和风险等级作为主要分层信号；只有在无法区分时才使用长度作为决胜因素。一次五分钟的医疗访谈可能需要完整层级，而一份篇幅很长但内容朴素的双人备忘录可以使用快速层级。

## 原生校正检查清单

1. **在 Stage 1 之前为文件确定最终名称。** 队列锚点存储绝对路径。必须在任何延迟操作可能入队之前，先使用人类可读的项目文件名。如果输入以尚无文件的内联文本形式到达——例如斜杠命令参数或粘贴的文本块——请先将其写入文件；`--input` 和队列锚点都需要路径，而当下游不会归档任何内容时，使用临时位置即可。未提供 `--domain` 且上下文中也没有明显的域？省略该标志本身就会默认搜索所有域（这是 `--domain` 自身的默认值），因此不要因为需要选择域而阻塞——直接裸运行 Stage 1，让安全模式决定哪些内容可以自动应用。如果仍需解析某个具体候选项，即使在快速层级中，也可以保留验证阶梯中的一步，尽管其余步骤不执行：`native_ai_full_workflow.md` 第 4 步的第 1 级，即进行一次跨域查询——`--lookup "<term>"` 会输出该术语上所有现有声明（词典规则启用或禁用时均包括，作为 FROM 或 TO；上下文规则；名册变体；队列行）——这不是层级表要求跳过的完整验证阶梯，而只是保留这一个查询。
2. **在读取预校正转录稿之前，恢复原始基线。** 如果摄取流水线或之前的 API 处理已经改动过文本，先与原始来源进行差异比较。将上游编辑视为编辑，而不是视为事实依据。
3. **加载项目先验信息并阅读完整转录稿。** 在存在时读取 `~/.transcript-fixer/contexts/<domain>.md`，然后在决定早期歧义之前阅读完整文件。
4. **运行 Stage 1 并检查真实结果。** 优先使用明确的项目域以及 `--apply-domain --json`。读取 `deferred` 和 `review_enqueued`；绝不要静默丢弃 sidecar 或队列缺口。
5. **将 Stage 1 与原始内容进行差异比较。** 如果某条规则改动了正确的语音，就从原始内容开始处理，使用 `--report-false-positive "<from>" "<to>" --domain <domain>` 撤销已存储的词对，并验证该规则不再触发。
6. **对每个候选项进行分流。**
   - 有把握：语音变化合理，并且上下文或权威的本地来源可以确定结果。
   - 需要验证：某个人、公司、产品、模型、股票代码、地点、数字或其他关键术语缺少来源。
   - 不确定：证据不足以确定；保留原文并入队。
   - 多渠道实体分叉：当独立转录稿中的人名或其他专有名词不一致，且没有本地权威来源可以确定结果时，收集未解决的分叉并一次性询问人类。不要猜测，也不要把多数票当作身份证据。
7. **应用能够解释该语音的最小改动。** 不要添加说话人没有说出的词语。也要校正 ASR 派生的元数据，但保留 `asr_note` 不变。现在已经同意的 Stage 1 延迟项，应通过其队列行关闭，而不是使用 sed 重新应用：`--resolve-review <id> --decision accepted`（id 来自 `--list-review --review-file "<absolute-canonical-file>" --json`）会执行编辑，或者在你已经手动修复但不写入文件时记录该修复。无论哪种方式，该行最终都应为 `accepted`；`kept_original` 表示转录稿按实际语音是正确的，绝不能用于已应用修复的情况。
8. **运行第二遍处理。**
   - 所有层级：运行 `--scan-traps`，并检查命中项和 `unparsed`。
   - 完整层级：使用新上下文复核。对于单个未拆分的复核，分配一个已校正文件，并要求提供简洁的残留项表或明确写出 `no new residuals`；空响应或截断响应都表示复核失败。
   - 对于拆分的多文件复核，或恢复执行的完整复核，请按照 [native_review_packets.md](references/native_review_packets.md) 处理数据包分配、JSON 结果、验证和恢复。
   - 高风险的多录音场景：采样片段只能确定与其锚定的那一项。如果用户要求更高质量或完整的转录，且基线音频可用，则加载 **`/daymade-audio:asr-transcribe-to-text`**，并在声学条件最清晰的完整/规范录音上执行其完整文件转录路径，然后才能声称覆盖整个转录稿；否则报告 `sampled cross-check only — incomplete`。优先使用与规范正文生成器不同的识别器。如果只能使用同一个识别器，则本次运行能够证明完整源文件覆盖，但不能证明不同识别器之间的独立交叉佐证；应明确说明这一边界。
9. **将所有未解决项入队；有选择地升级处理。** 首先应用 [证据选择与升级处理](references/native_ai_full_workflow.md#evidence-selection-and-escalation)，然后遵循下面的 `Review queue safety` 和 [review_queue_dashboard.md](references/review_queue_dashboard.md)。只有在需要人工复核时才打开该文件。进行人工复核时，使用 `uv run scripts/review-dashboard/server.py --file "<absolute-canonical-file>"` 启动仪表板；添加 `--item <id>` 可直接定位到某个分叉。若无人可进行人工复核，则明确将产物标记为 `draft / unresolved — incomplete` 并列出各行；不要在声称已完成质量保证的情况下交付含有可疑原文的内容。检测和入队并不等于校正：若要提出更高质量/最终版本的声明，锚定到该确切文件的每一条队列行都必须离开 `pending` 状态。 
10. **读取人类处理状态，然后完成定稿。** 当人类表示已在仪表板中完成标记后，不要重新运行 ASR，也不要再次询问相同问题。首先运行 `uv run scripts/fix_transcription.py --list-review --review-file "<absolute-canonical-file>" --review-status all --json`，应用由此产生的文件状态，并要求该确切路径满足 `stats.pending_total == 0`；在提出高质量/最终版本声明之前，必须没有待处理行。然后对实际编辑过的文件进行差异比较，在数字重要时运行数字一致性检查，重新运行普通 Stage 1，重新搜索已知校正项，并确认每项变更都能追溯到分流决策。全局队列计数不能关闭或重新打开该文件的质量声明。最后运行 `--close-sidecars --input "<absolute-canonical-file>"`：它会根据文件和队列重新读取每一条 `*_changes.md`/`*_needs_review.md` 记录；如果某条记录仍显示为原始内容且没有判定，或任何行仍处于待处理状态，它就会拒绝执行；只有在全部关闭后才会移除 sidecar（参见 `Finalization`）。
11. **在同一轮中沉淀经验。** 将每种稳定模式归入正确的位置；不要只把已确认的修复留在聊天中。原生处理阶段的编辑不会进入 Stage 1 的校正历史，因此应在最终差异比较之后立即机械地收集这些编辑：

~~~bash
    # 将原始文本与修正后文本进行差异比较，生成可解析的陷阱候选项（审阅工件 —
    # 由你裁定打印出的列表；--write 仅自动追加反复出现的
    # （≥2 次）非裸形候选项；--write-all 还会追加仅出现一次的候选项集合）
    uv run scripts/harvest_corrections.py raw.md corrected.md \
      --context-file ~/.transcript-fixer/contexts/<domain>.md
    ~~~

    每个输出的项目在打印前都会通过真实的陷阱解析器进行往返验证，并且上下文文件中已经记录的配对会被跳过。陷阱项目语法无法承载的配对 — 某一侧没有词汇内容，或其中包含 `*`，例如将供应商的 `***` 遮罩与真实单词进行差异比较 — 会在噪声过滤阶段被丢弃；任何仍然无法解析的项目都会报告到 stderr，并被排除，而不会中止运行。高频候选项是强陷阱；仅出现一次的候选项需要人工判断 — 这就是 `--write` 默认将其排除的原因 — 而 ⚠️ 裸形候选项永远不会被自动写入。这取代了凭记忆手动编写陷阱项目的做法。
12. **有意识地传播实体修复。**

    首先完成同文件扫描：检查 `harvest_corrections.py --json`
    中 `remaining` 非零的条目，然后检查每个已确认实体或技术标识符在正文和源自 ASR 的元数据中的实际拼写族。使用权威拼写和惯用的文件名大小写；用户非正式的口述并不表示要求保留拼写错误。保留真实的其他指代对象、别名和通用字符命中项。不要把同文件扫描变成未经审阅的批量替换，也不要重复已经解决的问题。然后仅搜索所属项目的派生笔记/摘要，并审阅每个命中项；排除原始 ASR 和修正 sidecar，因为它们保留了证据链。

详细的溯源标准、本地优先的实体阶梯、第二轮提示词、队列负载和最终化规则，见 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。

## 跨技能调用方契约

调用方流水线必须：

1. 使用显式配置的项目域运行 Stage 1，并指定 `--apply-domain` 和 `--json`。如果 `deferred > review_enqueued`，则将审阅 sidecar 持久化到临时目录之外，或将该缺口作为失败报告。
2. 在加载此技能的情况下运行 Native AI，否则报告 `Stage 1 only — incomplete`。无代理自动化可以改用 Stage 3。

规范调用方式：

~~~bash
uv run scripts/fix_transcription.py \
  --input "$staged" --stage 1 \
  --domain "$domains" --apply-domain --json
~~~

只接入脚本路径的调用方从未加载此契约。因此，仅通过脚本路径进行集成只能作为 Stage 1 预过滤，而不是转录文本修正。

保持项目域处于最新状态：Native AI 阶段确认的每个反复出现的修正，都必须添加回正确的项目域、名册或上下文文件中。

## 词典与身份安全

在添加规则前，阅读 [references/false_positive_guide.md](references/false_positive_guide.md) 和 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。

| 模式 | 目标位置 |
|---|---|
| 稳定的非词项或独特乱码 → 规范术语 | `--add ... --domain <project>` |
| 重要且反复出现的人物及观测到的 ASR 变体 | 人物名册 |
| 仅在特定的反复出现短语中才需要进行的更正 | `--add-context-rule PATTERN REPLACEMENT --domain <project>`（正则表达式，限定域；全局规则省略 `--domain`） |
| 仅在特定提示下才错误的常见词/真实词 | 域上下文陷阱，绝不能使用裸规则（单独的数字或单个姓氏 + 老师/总会在名册加载时以及通过 `--add` / `--import` 添加时被拒绝，包括使用 `--force` 的情况） |
| 真实姓名 → 另一个真实姓名 | 域上下文 + 人工/音频核验，绝不能使用裸规则 |
| 已确认正确但反复被重新打开的实体 | 已确认正确的上下文记录 |
| 一次性句内措辞 | 仅编辑；不要添加 |

Stage 1 的匹配时层（[references/false_positive_guide.md](references/false_positive_guide.md) 中三层的第三层：添加时、应用时、匹配时）还会在风险评分前进行三项检查，单独拒绝字典匹配：超集检查（更正后的形式已经存在）、短规则的常见词边界检查，以及词边界检查。最后一项会通过脚本判断匹配项是否只是实际词语中的片段：如果一个 ASCII 匹配项紧邻 ASCII 字母，则它位于更长的词中（`Cloud` 位于 `iCloud` 中；数字不计入，因此 `cloud3` 仍会被更正）；只有当与 CJK 匹配项重叠的、仅基于字典进行的 jieba 切分中的每个片段都是多字符词，并且其中一个片段跨越了匹配边界时，CJK 匹配项才会被拒绝（新一 in 更新|一下，问题记 in 问题|记录，同龄 in 同龄人）——匹配项下存在一个单字符片段（巨|神智|能，叫|新|一下|单）意味着这是未知片段，匹配将继续进行。被拒绝的匹配会计入 `Refused at word boundaries` 以及 JSON 中的 `boundary_refused`，列在 Stage 1 摘要中，并且绝不会延后处理。上下文规则（`--add-context-rule`）会跳过此检查，但仍会经过风险评分，因此在安全模式下，其匹配会被延后到审核队列，而不是直接应用——可以在那里接受它，或运行 `--apply-all`，该命令会关闭此项检查并应用所有匹配；`--apply-domain` 则保留此检查。这些层列于 [references/false_positive_guide.md](references/false_positive_guide.md) 中。

上下文陷阱是提示，而不是允许盲目替换的授权。域上下文文件中的两类标注属于 **Stage 1 强制执行的机器可读否决项**（通过 `--domain` 指定域时才适用——整库运行没有可执行否决的所有者）：标记为 `禁裸词`/`禁入词典` 的陷阱会将 FROM 相同的任何字典规则降级为审核；而已确认正确的（勿修）记录会将 FROM 是该词条的任何规则降级——降级优先于 `--apply-domain` 的信任扁平化，因此真实词规则（绿点→绿电这一类：在业务上下文中正确，在 UI 上下文中错误）可以保留在字典中，而不会被盲目触发。`--apply-all` 仍然是操作者明确指定的覆盖选项。如果没有该否决项，唯一的退出方式就是使用 `--report-false-positive`，但这也会在规则本应正确的上下文中禁用它。`--scan-traps` 支持规范的 `→` 和旧版的 `≈` 映射，并遵循相同的方向约定：左侧是观测到的 ASR，右侧是预期文本。包含空格的精确 FROM 短语请用反引号包裹：

- **`CC 思维链`/`CC 思维连` → 目标术语** — 仅在该领域记录的提示词下使用
~~~

这展示的是一个精确的 ASR 短语候选，而不是人名候选。领域上下文仍然是确定实际目标和提示词的依据；扫描器只定位字面上的 FROM 形式。

在添加任何形似真实词语的规则之前，先测量项目语料库：

~~~bash
uv run scripts/fix_transcription.py \
  --probe "candidate" --corpus /path/to/project-transcripts/

uv run scripts/fix_transcription.py \
  --add "candidate" "canonical" --domain myproject \
  --check-corpus --corpus /path/to/project-transcripts/
~~~

用户的裁定会立即确定该次出现的处理方式，但不会让某个替换变得可复用。先修复文件，然后通过上表处理结果：只有稳定且反复出现的模式才进入词典/名册/上下文；罕见的、仅限句子本地的误听则只保留在文件中。当用户确认两个合法姓名或昵称指向同一个人时，保留实际说出的形式，并将身份关系作为上下文存储，而不是作为替换规则。

## 审核队列安全

在加入队列或解决项目之前，先阅读 [references/review_queue_dashboard.md](references/review_queue_dashboard.md)。

最小项目：

~~~json
[
  {
    "file": "/absolute/path/to/transcript.md",
    "line": 142,
    "original": "<suspect-token-only>",
    "suggested": "<best-candidate>",
    "kind": "entity",
    "context": "<verbatim sentence, or unique clause/span for same-line repeats>",
    "evidence": "<what was checked>"
  }
]
~~~

安全规则：

- `file` 是此工作流中的必填项。没有它，接受操作可能记录裁定，却无法编辑转录稿。
- `original` 只能是可疑词元/跨度；绝不能在其中放入整句。
- `context` 按原样复制；关键字段是 `line`，而不是 `line_hint`。
- `suggested` 是关键字段，而不是 `suggestion`。使用 `actions`，而不是 `action_pack`。
- 一次只处理一个出现位置；只有在整个批次都处理完毕后，才扫描处理同类实体的其他出现位置。
- `pending` 行对于高质量/最终转录稿而言是一种阻塞状态，并不表示问题已得到处理。仅加入队列而没有人工/证据裁定，会使产物保持不完整。
- 覆盖后读取 `resolved_text`；列表中仍可能显示被拒绝的建议。
- 单行的 `asr_note` 台账在接受路径上也会被屏蔽，因此解决项目时绝不会编辑引用旧形式的溯源行。若你在解决前已手动应用修复，仍应使用 `--decision accepted`（如果有覆盖文本，则使用 `overridden`）关闭该项目：当加入队列时记录的上下文在文件中的任意位置再次出现，并且建议文本位于原始文本所占的位置时，系统会在不写入文件的情况下记录裁定（`already in place at the anchor — recorded without writing`）。行号漂移不影响此过程；原始文本在远离提示位置的其他话语中继续存在也不影响，原始文本出现在建议文本内部也不影响（阿里→阿里云）。如果原始文本仍位于提示位置的解决窗口内且处于建议文本之外，系统会以 `ReAnchorNeeded` 安全失败，并在消息中说明具体情况：锚定话语或其旁边的相似话语仍然是乱码——请单独在该行建立项目，或手动处理，然后再解决；不要使用 `--reanchor-review` 将此行重新锚定到该处。如果记录的邻域还以第三种形式出现在匹配宽度范围内的文件任意位置，或在提示位置附近、以每侧最少两个字符的任意宽度出现，系统也会安全失败；如果编辑触及槽位相邻的字符，同样会安全失败。系统无法识别的情况是：锚定话语被删除，或在两个相邻字符之外被改写，而文件中其他位置的相同话语已经显示为修正形式——此时系统会记录 `accepted` 而不写入任何内容，文件中残留的乱码则会在下一次 Stage 1 运行时重新延期处理。`--reanchor-review <id>` 可修复原始文本已移动或漂移的项目，但如果其上下文已经显示为修正形式，则会拒绝该操作。对于队列既无法重新锚定、也无法识别的项目，使用 `--decision skipped --note <what happened>` 关闭。`kept_original` 表示转录稿保留原始形式——绝不能将其用于已经应用修复的情况。
- 如果文件已移动或发生漂移，请运行 `--reanchor-review`。在收到要求时，添加 `--reanchor-root` 或 `--reanchor-to`。不要围绕待处理项目手动编辑。
- 按含义提升每个 `decision_note`；存储备注不会改变词典、名册、上下文或误报状态。

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

出现以下任一情况时，阅读 [references/advanced_correction_evidence.md](references/advanced_correction_evidence.md)：

- 数字、边界、价格、份额、截止时间或数量级会影响决策。
- 同一场会议存在两份录音。
- 一个承重名称或术语经过本地阶梯流程后仍未解决，源音频可用，且当前授权已允许使用第二个识别器。
- 白板、幻灯片或拍摄的书面工件可以独立确定名称或术语。
- 几个相关文件应共享同一个修正列表。
- 正在委派一个包含 10 个或更多文件的批次。

数字槽位扫描：

~~~bash
uv run scripts/scan_numeric_consistency.py transcript.md --domain myproject
~~~

其输出是候选项，绝不会自动编辑。对于承重数字，遵循 [证据选择与升级](references/native_ai_full_workflow.md#evidence-selection-and-escalation)。当可以访问原始音频时，使用审核面板通过听辨来决定。否则，除非其他证据能够确定其中一种读法，否则保留相互竞争的读法，并继续处理剩余项目；不要要求导出权限。

对于委派的批次，每个代理负责一个文件，不能跨文件替换，并返回残留列表。之后，将 `git diff --name-only` 与明确的文件列表进行比较，并根据仓库工作区安全规则检查每个意外出现的文件。

## 最终化

- 原生模式会直接编辑原始文件。重新运行普通的 `--stage 1` 以确认；干净的空操作不会写入 Stage 1 sidecar。
- 当存在较新的 `*_stage1.md`，且原始文件在此之后未被编辑时，普通的 Stage 1 重新运行会以原子方式将其提升，并移除临时 sidecar。它会保留 `*_changes.md` 和 `*_needs_review.md`：这些是审核证据，而 `--close-sidecars` 才是决定它们已关闭的命令。`--apply-all` 永远不会走这条提升路径。
- 不要将输出文件是否存在作为成功信号；读取 JSON/退出状态，并独立读取最终文件。
- 在 `--close-sidecars --input "<absolute-canonical-file>"` 报告 `closed` 之前，保留原始转录、`*_changes.md` 和 `*_needs_review.md` 作为证据：每条记录都必须在文件中显示为已应用（或者原始形式不再出现在经过台账屏蔽的转录中），或由针对该确切文件的已作出决定的队列行回答——每次出现对应一行，按最近行匹配，因此第二次出现若没有自己的行，仍保持未决定状态——或者属于一条后来已作为误报禁用的 FROM→TO 规则（`disabled`：不再是问题），并且文件中没有待处理行。若存在未决定的记录和待处理 id，它会以退出码 1（`open`）退出并列出它们；若某个晚于文件的 `*_stage1.md` 仍在等待普通 Stage 1 重新运行，或报告包含解析器无法读取的记录，则以退出码 2（`blocked`）退出（无法读取的报告是证据，不能视为空报告）；移除证据和过时的运行输出后，以退出码 0 退出。对于仍显示为原始内容且完全没有对应行的记录，可在关闭时通过队列使用 `--decide-raw kept_original|skipped --by <who> --note <why>` 记录裁决——这是审计轨迹，而不是静默删除。`--dry-run` 会显示裁决但不删除；`--json` 会返回裁决结果。
- `*_stage2.md` 和 `*_dryrun.md` 是 API 路由和预览产生的、限定于本次运行的输出，不是归档材料：应在生成它们的会话中提升或丢弃它们。如果有文件比转录更新但尚未提升，`--close-sidecars` 会保留它并说明这一点，只有使用 `--discard-unpromoted` 才会移除它。
- 在最终文件中重新搜索已知的修正形式，并确认没有修正仅存在于 `asr_note` 或 sidecar 中。
- 如果某个队列项目被重命名移走，应使用 `--reanchor-review` 修复它，而不是用虚假的终结性裁决解决它。

## 无 Agent 的 API 路径

仅当没有 Claude/Codex agent 能够执行 Native AI 纠错时：

~~~bash
export GLM_API_KEY="<api-key>"
uv run scripts/fix_transcript_enhanced.py input.md --output ./corrected
~~~

该路径会在输入文件旁写入 `<stem>_stage2.md`。这是本次运行的输出，而不是第二份转录稿：请先验证它，然后在会话结束前将其提升为转录稿，或将其丢弃。一个留在转录稿旁、但并非转录稿本身的 `_stage2.md`，一个月后将无法与已审核的工作区分开来。

阅读 [references/glm_api_setup.md](references/glm_api_setup.md)、[references/installation_setup.md](references/installation_setup.md) 以及 [references/workflow_guide.md](references/workflow_guide.md) 中明确面向 API 的部分。当某个分块在重试后仍失败时，API 路径会逐字节保留该分块及其原始的相邻分隔符，并打印警告；如果所有分块都失败，则完整输出等于输入。对于 `fix_transcription.py --stage 2|3 --json`，请读取附加的 `stage2_total_chunks`、`stage2_failed_chunks` 和 `stage2_degraded` 字段：即使安全保留的产物已输出，`stage2_degraded: true` 也不代表运行已完成全面纠错。当任意 Stage 2 分块降级时，增强包装器会在写入该保留产物后以非零状态退出。请验证输出，不要想当然地认为警告意味着存在已纠正的结果。

增强 API 包装器还可以添加段落分隔、减少重复的填充词，并呈现纠正内容供交互式审核。这些属于 API 包装器功能；它们并不授权 Native AI 为追求流畅性而改写措辞。

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

在使用不常见的标志之前，请阅读 [references/script_parameters.md](references/script_parameters.md)。在使用自定义 SQL 之前，请阅读 [references/database_schema.md](references/database_schema.md)；纠正列为 `from_text` 和 `to_text`。

## 参考索引

所有参考资料都位于此文件下一级目录中。

| 需求 | 阅读 |
|---|---|
| 完整的原生校正流程 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 拆分/批量冷审查数据包、结果验证和中断恢复 | [native_review_packets.md](references/native_review_packets.md) |
| 词典、人员名册、领域上下文 | [dictionary_identity_and_context.md](references/dictionary_identity_and_context.md) |
| 误报策略 | [false_positive_guide.md](references/false_positive_guide.md) |
| 队列、仪表板、音频、重新锚定 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 数字、照片、多录音、片段交叉核对、批次 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |
| 上下文文件语法/模板 | [domain_context_guide.md](references/domain_context_guide.md) |
| CLI 标志和审查项架构 | [script_parameters.md](references/script_parameters.md) |
| 数据库架构和查询 | [database_schema.md](references/database_schema.md)、[sql_queries.md](references/sql_queries.md) |
| 简短命令查询 | [quick_reference.md](references/quick_reference.md)、[dictionary_guide.md](references/dictionary_guide.md) |
| 学习循环 | [iteration_workflow.md](references/iteration_workflow.md) |
| 原生示例 | [example_session_dji_minutes.md](references/example_session_dji_minutes.md) |
| 无代理 API 示例/配置 | [example_session.md](references/example_session.md)、[glm_api_setup.md](references/glm_api_setup.md)、[installation_setup.md](references/installation_setup.md) |
| 架构和格式 | [architecture.md](references/architecture.md)、[file_formats.md](references/file_formats.md) |
| 操作指南 | [best_practices.md](references/best_practices.md)、[troubleshooting.md](references/troubleshooting.md)、[team_collaboration.md](references/team_collaboration.md)、[workflow_guide.md](references/workflow_guide.md) |

随附的脚本会被执行，而不会加载到上下文中。主要入口点是 `fix_transcription.py`、`scan_numeric_consistency.py`、`fetch_minute_audio.py`、`review-dashboard/server.py`，以及上文列出的差异、时间戳和拆分工具。

## 交接

校正完成后，仅当用户希望获得结构化摘要时，才交接给 `/daymade-audio:meeting-minutes-taker`。不要自动创建会议纪要：转录校正和摘要属于不同范围。