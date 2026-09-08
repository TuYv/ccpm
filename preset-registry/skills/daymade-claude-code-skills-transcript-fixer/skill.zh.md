---
name: transcript-fixer
description: >-
  Corrects speech-to-text transcription errors with dictionary rules and Claude's built-in AI (no external API key required); Native AI Correction is the default, Stage 1 alone is incomplete, and Stage 3 API is only for automation without Claude Code. Builds personalized correction databases, loads person-name ASR variants from the configured global people roster, and reads per-domain contexts for homophones. Before correcting a person name, the agent must consult both the global roster and the owning project's identity roster; project rosters are not auto-loaded, and occurrence frequency is never identity evidence. Use for ASR/STT output with recognition errors, homophones, garbled technical terms, person-name errors, or mixed Chinese/English, and for cleaning meeting notes, lecture transcripts, interviews, or any speech-recognition text—even when the user only says “fix this transcript,” “clean up these meeting notes,” or mentions a garbled name.
---
# Transcript Fixer

使用两阶段循环：

1. 阶段 1 应用确定性的、已知的修正。
2. 原生 AI 修正读取完整转录稿，修复一次性错误，核实不确定的实体，并沉淀可复用的修正。

**原生 AI 修正是默认流程。仅执行阶段 1 并不完整。** 阶段 3 API 仅适用于没有 Claude/Codex 代理可用的自动化场景。

## 操作约定

- 完成阶段 1 → 原生 AI 修正 → 沉淀已确认的重复性修正。不要仅在阶段 1 后就报告转录稿已清理完成。
- 仅当人工明确限制本次运行只执行字典处理，或有带日期的工件证明原生 AI 已对这份完全相同的转录稿运行过时，才跳过原生 AI。
- 在 Claude Code 或 Codex 中，不要运行阶段 3。使用阶段 1 加原生工作流。
- 绝不为了流畅性而改写讲话内容。修正必须能够解释为合理的 ASR 错误，并保留发言者归属。
- 绝不推断或重新分配发言者身份。保留发言者标签行；人工确认的标签和用户裁定具有权威性。
- 在修正任何人名之前，直接读取已配置的全局人员名册，以及所属项目的显式身份名册或别名台账。阶段 1 仅自动加载全局 `ASR 变体` 条目；它不会加载项目名册，也不会暴露已抑制、已禁用和未列出的条目。若预期来源缺失或来源相互冲突，保持名称不变，并加入队列或询问一次。绝不将出现频率作为身份依据。在确定名称前，阅读 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。
- 保持未解决文本不变，并将其加入队列。可见的乱码比流畅却错误的猜测更安全。
- 将不熟悉的词元视为未知，而不是错误。先穷尽本地证据阶梯。对于仍未解决的关键承载词元，仅当源音频和获准使用的第二识别引擎均已可用时，才使用片段级跨识别器阶梯；否则加入队列或询问。来自真正不同识别器家族的一致结果能有力佐证发音，但绝不在同音拼写之间作出选择，也绝不覆盖人名门禁。在使用前阅读原生工作流第 4 步、第 7 阶。
- 将单行 `asr_note` 值视为修正溯源信息：它有意引用旧形式，并被排除在匹配之外。多行 YAML 台账值不会被屏蔽；关键词、标题、其他 ASR 衍生元数据和正文文本仍在修正范围内。
- 在执行原生处理前，完整阅读 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。在执行相应操作前，阅读下方指定的任务专用参考资料。

## 运行上下文

通过 `uv run` 运行每个入口点；需要第三方 Python 包的入口点会通过 PEP 723 声明它们，而仅使用标准库/内部工具的实用程序可以省略元数据块。从调用此技能时打印的技能目录执行命令，或为每个脚本路径添加该目录前缀。不要依赖 `$CLAUDE_SKILL_DIR`；它并非在每个执行环境中都可用。

如果包的位置确实未知，请使用 [references/installation_setup.md](references/installation_setup.md) 中的安装解析流程。不要从宽泛的 `find` 结果中选择第一个：缓存、备份和旧版本可能同时存在。

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

安全模式是 Stage 1 的默认模式：低风险规则会被应用；中高风险匹配会延后写入 `*_needs_review.md` 和持久化审查队列。`Applied: 0` 是有效结果，并不表示转录文本没有问题。

Stage 1 的 JSON 契约为：

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

请读取全部十一个字段。`boundary_refused` 统计本次被词边界检查拒绝的词典匹配项，它们既未应用也未延后，因此比较多次运行结果的调用方能够了解某项延后为何消失；`--apply-all` 会关闭该检查。`stage1_only_incomplete` 是对原有六字段调用方契约的附加字段，并且对于 Stage 1 脚本运行必须始终为 true；只有调用方能够通过运行 Native AI，或明确选择无代理的 Stage 2/3 路线来将其关闭。三个 `stage2_*` 遥测字段始终存在：Stage 1 分别报告 `0`、`0` 和 `false`；Stage 2/3 会替换为实际 API 结果。不要根据是否存在旁车文件来推断无操作或成功。

有关原生端到端示例，请阅读 [references/example_session_dji_minutes.md](references/example_session_dji_minutes.md)。

## 选择路线

| 路线 | 适用场景 | 必读内容 |
|---|---|---|
| 快速原生 | 简短/plain 的转录文本、已知说话人、低风险 | 本文件 + [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 完整原生 | 领域术语密集、实体不熟悉、3 位以上说话人、较长或包含决策内容的转录文本 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md)，以及下方的队列和证据参考资料 |
| 调用方集成 | 另一项技能或摄取管道调用 Stage 1 | 下方的 `Cross-skill caller contract` |
| 审查队列/仪表板 | 任意项目存在不确定性或需要音频 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 无代理 API | 没有可用代理的 CI/批处理自动化 | [glm_api_setup.md](references/glm_api_setup.md) 和 [workflow_guide.md](references/workflow_guide.md) |
| 多文件批处理 | 多份相关转录文本；尤其是 10 个以上文件 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |

将词汇和风险级别作为主要分级信号；仅将长度用作决胜因素。五分钟的医疗访谈可能需要完整层级，而一份篇幅很长、使用朴素语言的双人备忘录则可以使用快速层级。

## 原生校正检查清单

1. **在阶段 1 之前为文件确定最终名称。** 队列锚点存储绝对路径。在任何延后项可以入队之前，请使用人类可读的项目文件名。当输入以尚无文件的内联文本形式到达时，例如斜杠命令参数、粘贴的文本块，首先将其写入文件；`--input` 和队列锚点都需要路径，而在没有下游归档流程时，临时位置即可。未提供 `--domain` 且上下文中也没有明显领域？无需因选择领域而阻塞，省略该标志默认会搜索所有领域（即 `--domain` 自身的默认值），因此直接裸运行阶段 1，并让安全模式控制哪些内容会自动应用。若特定候选项仍需消歧，即使快速层级要求跳过其余验证阶梯，也保留阶梯中的一个步骤成本很低：native_ai_full_workflow.md 第 4 步的第 1 级，一次跨领域查询——`--lookup "<term>"` 会打印该术语上的每个现有声明（无论词典规则启用或禁用、作为 FROM 还是 TO；上下文规则；名册变体；队列行）——这不是分级表要求跳过的完整验证阶梯，而只是那一次查询。
2. **在阅读已预校正的转录稿之前，恢复原始基线。** 如果摄取管道或先前的 API 处理已经修改过文本，请先与原始来源进行差异比对。将上游修改视为修改，而非事实依据。
3. **加载项目先验信息并阅读完整转录稿。** 存在时读取 `~/.transcript-fixer/contexts/<domain>.md`，然后在判定早期歧义之前阅读整个文件。
4. **运行阶段 1 并检查真实结果。** 优先使用显式项目领域加 `--apply-domain --json`。阅读 `deferred` 和 `review_enqueued`；绝不可悄然丢弃侧车文件或队列缺口。
5. **将阶段 1 与原始内容进行差异比对。** 如果规则修改了正确的语音，请以原始内容为准，使用 `--report-false-positive "<from>" "<to>" --domain <domain>` 退役存储的配对，并验证它不再触发。
6. **分诊每个候选项。**
   - 有把握：音变合理，且上下文或权威的本地来源能够确定结果。
   - 需要验证：没有来源支持的人名、公司、产品、型号、股票代码、地点、数字或其他承重术语。
   - 不确定：证据无法确定结果；保留原文并入队。
   - 多通道实体分叉：当独立转录稿对人名或其他专有名词存在分歧，且没有本地权威来源能够确定时，收集未解决的分叉项并只向人工询问一次。不要猜测，也不要将多数投票视为身份依据。
7. **应用能解释该语音的最小修改。** 不要添加说话者未说出的词。也要校正 ASR 生成的元数据，同时保持 `asr_note` 不变。你现在同意的阶段 1 延后项应通过其队列行关闭，而不是用 sed 重新应用：`--resolve-review <id> --decision accepted`（ID 来自 `--list-review --review-file "<absolute-canonical-file>" --json`）会执行修改，或记录你已手动应用且无需写入的修复。无论哪种方式，该行最终均为 `accepted`；`kept_original` 断言转录稿按原话就是正确的，绝不能作为你已应用修复的退出方式。
8. **运行第二轮检查。**
   - 每个层级：运行 `--scan-traps` 并检查命中项和 `unparsed`。
   - 完整层级：对恰好一个已校正文件使用全新上下文的审阅者。要求提供紧凑的残余问题表，或明确说明 `no new residuals`；空响应或截断响应均视为审阅失败。
   - 对于拆分、多文件或恢复后的完整审阅，阅读 [native_review_packets.md](references/native_review_packets.md)，并使用 `scripts/native_review.py prepare` / `check` 对完整文件集进行核验，并在编辑前验证结果。中断后重用有效结果；过去的配额失败并不能证明审阅者当前仍不可用。该辅助工具只检查覆盖范围和锚点，绝不检查校正事实或人工批准。
   - 高风险多录音：抽样片段只能确定该锚定项。若用户要求更高质量或完整的转录稿，并且基线音频可用，请加载 **`/daymade-audio:asr-transcribe-to-text`**，并在完整且最清晰/规范的录音上运行其全文件转录路径，然后才能声称覆盖整个转录稿；否则报告 `sampled cross-check only — incomplete`。优先使用与生成规范正文的识别器不同的识别器。如果只有同一个识别器可用，该运行能证明完整来源覆盖，但不能构成独立的跨识别器佐证；请明确说明这一边界。
9. **将每个未解决项入队，并且只打开此文件。** 遵循下方的 `Review queue safety` 和 [review_queue_dashboard.md](references/review_queue_dashboard.md)。检测和入队不是校正：若要声称更高质量/最终版本，所有锚定到这个确切文件的队列行都必须不再处于 `pending`。使用 `uv run scripts/review-dashboard/server.py --file "<absolute-canonical-file>"` 启动仪表板；添加 `--item <id>` 可直接定位到某个分叉项。如果人工不可用，必须将产物明确标记为 `draft / unresolved — incomplete` 并列出这些行；不要在已完成质量声明下交付原始可疑文本。
10. **读取人工状态，然后完成定稿。** 当人工表示已在仪表板中标记时，不要重新运行 ASR 或重复询问相同问题。首先运行 `uv run scripts/fix_transcription.py --list-review --review-file "<absolute-canonical-file>" --review-status all --json`，应用任何由此产生的文件状态，并要求该确切路径的 `stats.pending_total == 0`；在作出高质量/最终版本声明之前，待处理行必须为零。然后对实际编辑的文件进行差异比对，在数字重要时运行数字一致性检查，重新运行普通阶段 1，重新 grep 已知校正项，并确认每项修改都可追溯至分诊决策。全局队列计数不能关闭或重新开启此文件的质量声明。最后，运行 `--close-sidecars --input "<absolute-canonical-file>"`：它会依据文件和队列重新读取每个 `*_changes.md`/`*_needs_review.md` 条目，在任何条目仍显示原始内容却没有结论，或任一行仍处于待处理状态时拒绝执行，并且仅在一切关闭后移除侧车文件（参见 `Finalization`）。
11. **在同一轮中积累学习成果。** 将每个稳定模式路由至其正确归宿；不要仅将已确认的修复留在聊天中。原生处理修改不会进入阶段 1 的校正历史，因此请在最终差异比对后立即以机械方式收集它们：

~~~bash
    # Diff raw vs corrected into parseable trap candidates (review artifact —
    # you adjudicate the printed list; --write auto-appends only the recurring
    # (≥2x) non-bare candidates; --write-all also appends the one-off set)
    uv run scripts/harvest_corrections.py raw.md corrected.md \
      --context-file ~/.transcript-fixer/contexts/<domain>.md
    ~~~

    每个输出的要点在打印前都会通过真实的陷阱解析器进行往返验证，且上下文文件中已记录的配对会被跳过。要点语法无法承载的配对，例如某一侧没有词汇内容或其中含有 `*`，如供应商的 `***` 脱敏掩码与真实单词之间的差异，会在噪声过滤器处丢弃；任何仍然无法解析的要点都会报告到 stderr 并排除，而不会中止运行。高频候选项是强陷阱；仅出现一次的候选项需要人工判断，因此 `--write` 默认不写入它们，并且 ⚠️ 裸形候选项绝不会被自动写入。这取代了凭记忆手写陷阱要点的方式。
12. **有意识地传播实体修正。** 仅搜索所属项目的派生笔记/摘要，审查每一处命中，并排除原始 ASR 和修正侧车文件，因为它们保留了证据链。

    先完成同文件扫描：检查 `harvest_corrections.py --json`
    中 `remaining` 非零的条目，然后检查每个已确认实体或技术标识符在正文和 ASR 派生
    元数据中的实际拼写变体。使用权威拼写和惯用的文件名大小写；
    用户的非正式口述并不表示要求保留拼写错误。保留真实的
    替代指代、别名和通用字符命中。不要把同文件扫描变成未经审查的批量替换，也不要重复已解决的问题。

详细的溯源要求、本地优先实体阶梯、二次扫描提示、队列载荷和最终确认规则位于 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。

## 跨技能调用方契约

调用方流水线有两项彼此独立的义务：

1. 使用显式配置的项目领域、`--apply-domain` 和 `--json` 运行 Stage 1。若 `deferred > review_enqueued`，则将审查侧车文件持久化到任何临时目录之外，或将此缺口作为失败暴露出来。
2. 在加载此技能的情况下运行 Native AI，或报告 `Stage 1 only — incomplete`。无代理自动化可以改用 Stage 3。

规范调用：

~~~bash
uv run scripts/fix_transcription.py \
  --input "$staged" --stage 1 \
  --domain "$domains" --apply-domain --json
~~~

仅连接脚本路径的调用方从未加载此契约。因此，仅集成脚本路径只是 Stage 1 预过滤器，而不是转录修正。

保持项目领域的更新：来自原生处理阶段的每一项已确认的重复修正，都必须添加回正确的项目领域、名册或上下文文件。

## 字典和身份安全

添加规则前，请阅读 [references/false_positive_guide.md](references/false_positive_guide.md) 和 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。

| 模式 | 目标 |
|---|---|
| 稳定的非词或独特乱码 → 规范术语 | `--add ... --domain <project>` |
| 重要的重复出现的人名及其观察到的 ASR 变体 | 人员名单 |
| 只有在某个特定重复短语内部才需要更正 | `--add-context-rule PATTERN REPLACEMENT --domain <project>`（正则，域限定；全局则省略 `--domain`） |
| 常见/真实词只在某个提示下才会错 | 域上下文陷阱，绝不要用裸规则（在名单加载以及 `--add` / `--import` 时，单独的数字或单个姓氏 + 老师/总 会被拒绝，即使带 `--force` 也一样） |
| 真实姓名 → 另一个真实姓名 | 域上下文 + 人工/音频核验，绝不要用裸规则 |
| 已确认正确但被反复重新打开的实体 | 已确认正确的上下文记录 |
| 一次性的句内措辞 | 只编辑；不要添加 |

Stage 1 的匹配时层（[references/false_positive_guide.md](references/false_positive_guide.md) 中三层里的第三层：添加时、应用时、匹配时）在风险评分之前，也会在三项检查中拒绝单独的字典匹配：超集检查（更正后的形式已经存在）、短规则的常见词边界检查，以及词边界检查。最后一项会按脚本判断匹配是否是正常词的一部分：ASCII 匹配若左右紧贴 ASCII 字母，则它位于更长的单词中（`Cloud` 在 `iCloud` 里；数字不算，所以 `cloud3` 仍会被更正）；CJK 匹配只有在与之重叠的每个仅字典的 jieba 切分片段都是多字词，并且其中有一个跨越了匹配边界时才会被拒绝（更新|一下 里的 新一，问题|记录 里的 问题记，同龄人 里的 同龄）；只要有一个单字符片段落在匹配之下（巨|神智|能，叫|新|一下|单），就说明这是未知片段，匹配会继续。被拒绝的情况会记为 `Refused at word boundaries`，在 JSON 中记为 `boundary_refused`，列在 Stage 1 摘要里，而且不会延后处理。上下文规则（`--add-context-rule`）会跳过这项检查，但仍要经过风险评分，所以在安全模式下，它的匹配会进入审核队列而不是直接应用——在那里面接受它，或者运行 `--apply-all`，它会关闭这项检查并应用所有匹配；`--apply-domain` 会保留这项检查。各层列在 [references/false_positive_guide.md](references/false_positive_guide.md) 中。

上下文陷阱是提示，不是无条件替换的许可。域上下文文件中的两类标注是**Stage 1 会强制执行的机器可读否决项**（当通过 `--domain` 指定了域时——整个库范围运行没有可供否决的归属者）：标记为 `禁裸词`/`禁入词典` 的陷阱会把任何 FROM 相同的字典规则降级到审核；而标记为已确认正确的 （勿修） 记录会把任何 FROM 是该 token 的规则降级——这种降级优先于 `--apply-domain` 的信任平铺，因此一个真实词规则（绿点→绿电 这一类：在业务语境中正确，在 UI 语境中错误）可以留在字典里而不会盲目触发。`--apply-all` 仍然是操作者显式的覆盖。没有这个否决项时，唯一的逃逸方式是 `--report-false-positive`，它会在该规则本来也正确的上下文中禁用它。`--scan-traps` 同时支持规范的 `→` 和旧式的 `≈` 映射，并保持相同的方向性约定：左边是观察到的 ASR，右边是预期文本。若 FROM 短语包含空格，请用反引号包起来：

~~~markdown
- **`CC 思维链`/`CC 思维连` → 目标术语** — 仅在该域文档化的 cue 下适用
~~~

这展示的是一个精确的 ASR 短语候选，而不是人名候选。真实目标和 cue 仍以域上下文为准；扫描器只定位字面上的 FROM 形式。

在添加任何真实词形的规则之前，请先测量项目语料库：

~~~bash
uv run scripts/fix_transcription.py \
  --probe "candidate" --corpus /path/to/project-transcripts/

uv run scripts/fix_transcription.py \
  --add "candidate" "canonical" --domain myproject \
  --check-corpus --corpus /path/to/project-transcripts/
~~~

用户裁决会立即敲定该出现项，但不会让一次替换变得可复用。先修文件，再把结果通过上面的表格路由：只有稳定、重复出现的模式才进入 dictionary/roster/context；罕见的、句子局部的误听保持为 file-only。當用户确认两个合法的名字或昵称指向同一个人时，保留实际说出的那个形式，并把身份关系存为 context，而不是 replacement rule。

## Review queue 安全性

在 enqueueing 或 resolving 之前先阅读 [references/review_queue_dashboard.md](references/review_queue_dashboard.md)。

最小项：

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

- `file` 是此工作流的必填项。没有它，acceptance 可以记录裁决，但不会编辑 transcript。
- `original` 只写可疑的 token/span；绝不要把整句放进去。
- `context` 需逐字复制；`line` 是关键字段，不是 `line_hint`。
- `suggested` 是关键字段，不是 `suggestion`。使用 `actions`，不要使用 `action_pack`。
- 一次只解决一个 occurrence；只有在整批都解决后，才统一处理相邻的 entity occurrences。
- 对于高质量/final transcript，`pending` 行是阻塞状态，不是问题已处理的证明。没有 human/evidence 裁决的队列检测，会让 artifact 处于不完整状态。
- 在 override 之后读取 `resolved_text`；列表里仍可能显示被拒绝的 suggestion。
- 单行 `asr_note` ledger 在 accept 路径上也会被屏蔽，所以 resolve 一个条目并不会编辑那条引用旧形式的 provenance line。你在 resolve 之前手动应用的修正，仍然用 `--decision accepted`（若其 override text 则用 `overridden`）关闭：当 enqueue 时记录的 context 在文件中任何位置再次出现，且 suggestion 已经出现在原本由 original 占据的位置时，裁决会被记录而不写入（`already in place at the anchor — recorded without writing`）。行漂移不重要；original 仍残留在离提示很远的其他话语中，或者在 suggestion 本身内部（阿里→阿里云），也不影响。它会在以下情况失败并关闭为 `ReAnchorNeeded`，消息会说明是哪一种：当 original 仍位于 hint 的 resolve window 内（锚定的话语，或其旁边的相似片段）且仍然乱码时——单独处理那一行，或先手工修正再 resolve；不要把这个 row 用 `--reanchor-review` 重新锚定到它上面；当记录的邻域在 slot 中也出现了第三种形式（在文件中任何与匹配宽度相同的位置，或者在 hint 附近、向两侧缩到只剩两个字符时仍成立）；或者当编辑碰到了 slot 相邻的字符。它看不见的情况是：锚定话语被删除或重写，连同两侧邻居一起都变了，而别处的同一条已被修正——那会记录为 `accepted` 且不写入任何内容；而文件里仍然存在的乱码，会在下一次 Stage 1 运行中再次被延后处理。`--reanchor-review <id>` 用于修复 original 已经移动或漂移的 row，并会拒绝 context 已经读作 corrected 的 row。队列既无法重新锚定也无法识别的 row，应以 `--decision skipped --note <what happened>` 关闭。`kept_original` 断言 transcript 保留的是 original 形式——它绝不是你已经手工修正过的条目的退出方式。
- 如果文件移动或漂移了，请运行 `--reanchor-review`。在要求时添加 `--reanchor-root` 或 `--reanchor-to`。不要围绕 pending item 手工编辑。
- 依据含义提升每个 `decision_note`；存储 note 不会改变 dictionary、roster、context 或 false-positive 状态。

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

当满足以下任一条件时，阅读 [references/advanced_correction_evidence.md](references/advanced_correction_evidence.md)：

- 数字、上限、价格、份额、截止日期或数量级会影响决策。
- 一次会议存在两段录音。
- 一个负载较高的名称或术语在本地层级中仍未解决，且源音频可用，并且当前授权已经允许第二个识别器。
- 白板、幻灯片或拍摄的书面工件可以独立确定某个名称/术语。
- 多个相关文件应共享同一个修正列表。
- 正在委派一个 10+ 文件的批次。

数字槽位扫描：

~~~bash
uv run scripts/scan_numeric_consistency.py transcript.md --domain myproject
~~~

其输出只是候选项，不会自动编辑。对于单个负载较高的数字，将原始音频接入，并通过审阅面板凭听觉决定。

对于委派的批次，每个代理只负责一个文件，不能跨文件替换，并返回一个残余列表。之后将 `git diff --name-only` 与显式文件列表进行比较，并按照仓库的工作区安全规则检查所有意外文件。

## 最终定稿

- 原生模式会直接编辑原始文件。重新运行纯 `--stage 1` 以确认；干净的无操作不会写入 Stage 1 sidecar。
- 当存在更新的 `*_stage1.md`，且原始文件在此之后未被编辑时，纯 Stage 1 重新运行会以原子方式提升它并移除可丢弃的 sidecar。它会保留 `*_changes.md` 和 `*_needs_review.md`：这些是审阅证据，而 `--close-sidecars` 是决定它们已关闭的命令。`--apply-all` 永远不会走这条提升路径。
- 不要把输出文件的存在当作成功信号；要读取 JSON/退出状态，并独立读取最终文件。
- 在 `--close-sidecars --input "<absolute-canonical-file>"` 报告为 `closed` 之前，保留原始转录、`*_changes.md` 和 `*_needs_review.md` 作为证据：每个条目都已在文件中应用（或者原始形式已不再出现在带账本遮罩的转录中），或者被该文件的某个已决队列行所回答——每个出现一行，并按最近的行匹配，因此第二次出现若没有自己的行仍然未决——或者属于一个后来已作为误报而禁用的 FROM→TO 规则（`disabled`：不再是疑问），并且该文件没有任何待处理行。它以 1 退出（`open`），并列出未决条目和待处理 id；在有一个比文件更新的 `*_stage1.md` 仍在等待纯 Stage 1 重新运行，或者某份报告带有解析器无法读取的条目时，它以 2 退出（`blocked`；不可读的报告是证据，不是空报告）；在移除证据和过时运行输出后，它以 0 退出。对于仍然读作原始内容且完全没有对应行的条目，`--decide-raw kept_original|skipped --by <who> --note <why>` 会在关闭时通过队列记录裁定——这是审计轨迹，不是静默删除。`--dry-run` 会显示裁定但不会删除；`--json` 会返回它。
- `*_stage2.md` 和 `*_dryrun.md` 是 API 路由及其预览的运行范围输出，不是归档材料：在生成它们的会话里就应当提升或丢弃它们。比转录更新的那个如果未被提升就是未完成的——`--close-sidecars` 会保留它，说明这一点，并且只有在 `--discard-unpromoted` 下才会将其移除。
- 在最终文件中重新 grep 一个已知已更正的形式，并确认没有修正只残留在 `asr_note` 或 sidecar 中。
- 如果某个已入队条目在重命名后不见了，应使用 `--reanchor-review` 修复它，而不是用错误的终局裁定去解决它。

## 无代理 API 路由

仅当没有 Claude/Codex 代理能够执行 Native AI Correction 时：

~~~bash
export GLM_API_KEY="<api-key>"
uv run scripts/fix_transcript_enhanced.py input.md --output ./corrected
~~~

该路由会将 `<stem>_stage2.md` 写入输入文件旁边。这是本次运行的输出，而不是第二份 transcript：请先验证它，然后在会话结束前将其提升为 transcript，或将其丢弃。一个遗留在 transcript 旁边的 `_stage2.md` 文件，一个月后将无法与已审阅的工作区分开来。

阅读 [references/glm_api_setup.md](references/glm_api_setup.md)、[references/installation_setup.md](references/installation_setup.md) 以及 [references/workflow_guide.md](references/workflow_guide.md) 中明确面向 API 的部分。当某个 chunk 在重试后失败时，API 路由会逐字节保留该 chunk 及其原始周围分隔符，并打印警告；如果所有 chunk 都失败，完整输出将等于输入。对于 `fix_transcription.py --stage 2|3 --json`，请读取附加的 `stage2_total_chunks`、`stage2_failed_chunks` 和 `stage2_degraded` 字段：即使安全保留的产物已经输出，`stage2_degraded: true` 也不表示运行已完全修正。任何 Stage 2 chunk 降级后，增强包装器会在写入该保留产物后以非零状态退出。请验证输出，不要想当然地认为出现警告就意味着存在已修正的结果。

增强 API 包装器还可以添加段落分隔、减少重复填充词，并提供交互式审阅的修正建议。这些是 API 包装器的功能；它们并不授权 Native AI 为了流畅性而重写措辞。

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

使用不常见的标志前，请阅读 [references/script_parameters.md](references/script_parameters.md)。使用自定义 SQL 前，请阅读 [references/database_schema.md](references/database_schema.md)；修正列为 `from_text` 和 `to_text`。

## 参考资料索引

所有参考资料均位于此文件下一级目录中。

| 需求 | 阅读 |
|---|---|
| 完整的原生校正流程 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 拆分/批处理冷审查数据包、结果验证和中断恢复 | [native_review_packets.md](references/native_review_packets.md) |
| 词典、人员名册、领域上下文 | [dictionary_identity_and_context.md](references/dictionary_identity_and_context.md) |
| 误报策略 | [false_positive_guide.md](references/false_positive_guide.md) |
| 队列、仪表板、音频、重新锚定 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 数字、照片、多录音、片段交叉核对、批次 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |
| 上下文文件语法/模板 | [domain_context_guide.md](references/domain_context_guide.md) |
| CLI flags 和 review-item schema | [script_parameters.md](references/script_parameters.md) |
| 数据库 schema 和查询 | [database_schema.md](references/database_schema.md)、[sql_queries.md](references/sql_queries.md) |
| 简短命令查询 | [quick_reference.md](references/quick_reference.md)、[dictionary_guide.md](references/dictionary_guide.md) |
| 学习循环 | [iteration_workflow.md](references/iteration_workflow.md) |
| 原生示例 | [example_session_dji_minutes.md](references/example_session_dji_minutes.md) |
| 无 Agent API 示例/配置 | [example_session.md](references/example_session.md)、[glm_api_setup.md](references/glm_api_setup.md)、[installation_setup.md](references/installation_setup.md) |
| 架构和格式 | [architecture.md](references/architecture.md)、[file_formats.md](references/file_formats.md) |
| 运维指南 | [best_practices.md](references/best_practices.md)、[troubleshooting.md](references/troubleshooting.md)、[team_collaboration.md](references/team_collaboration.md)、[workflow_guide.md](references/workflow_guide.md) |

捆绑的脚本会被执行，而不会加载到上下文中。主要入口点包括 `fix_transcription.py`、`scan_numeric_consistency.py`、`fetch_minute_audio.py`、`review-dashboard/server.py`，以及上文列出的差异/时间戳/拆分工具。

## 交接

校正完成后，仅当用户需要结构化摘要时，才移交给 `/daymade-audio:meeting-minutes-taker`。不要自动创建会议纪要：转录校正和摘要属于不同范围。