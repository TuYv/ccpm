---
name: transcript-fixer
description: >-
  Corrects speech-to-text transcription errors with dictionary rules and Claude's built-in AI (no external API key required); Native AI Correction is the default, Stage 1 alone is incomplete, and Stage 3 API is only for automation without Claude Code. Builds personalized correction databases, loads person-name ASR variants from the configured global people roster, and reads per-domain contexts for homophones. Before correcting a person name, the agent must consult both the global roster and the owning project's identity roster; project rosters are not auto-loaded, and occurrence frequency is never identity evidence. Use for ASR/STT output with recognition errors, homophones, garbled technical terms, person-name errors, or mixed Chinese/English, and for cleaning meeting notes, lecture transcripts, interviews, or any speech-recognition text—even when the user only says “fix this transcript,” “clean up these meeting notes,” or mentions a garbled name.
---
# 转录修正器

使用双阶段循环：

1. 阶段 1 应用确定性的、已知的修正。
2. 原生 AI 修正读取完整转录稿，修复一次性错误，核实不确定的实体，并积累可复用的修正。

**原生 AI 修正是默认方式。仅执行阶段 1 并不完整。** 阶段 3 API 仅用于没有可用 Claude/Codex 代理的自动化场景。

## 操作约定

- 完成阶段 1 → 原生 AI 修正 → 累积已确认的重复性修正。仅完成阶段 1 后，不要报告转录稿已清理完成。
- 仅当人类明确将本次运行限制为词典处理，或有日期明确的产物证明原生 AI 已经针对这份确切的转录稿运行过时，才跳过原生 AI。
- 在 Claude Code 或 Codex 中，不要运行阶段 3。使用阶段 1 加原生工作流。
- 绝不要为了流畅而改写语音内容。修正必须能够解释一个合理的 ASR 错误，并保留谁说了什么。
- 绝不要推断或重新分配说话人身份。保留说话人标签行；人类确认的标签和用户裁定具有权威性。
- 在修正任何人名之前，直接读取已配置的全局人员名册，以及所属项目明确的身份名册或别名台账。阶段 1 只会自动加载全局 `ASR 变体` 条目；它不会加载项目名册，也不会暴露被抑制、禁用或未列出的条目。如果预期来源缺失或来源之间存在冲突，则保持姓名不变，并将其加入队列或询问一次。绝不要使用出现频率作为身份证据。在确定姓名之前，阅读 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。
- 保持未解决的文本不变，并将其加入队列。可见的乱码比流畅但错误的猜测更安全。
- 将不熟悉的词视为未知，而不是错误。首先穷尽本地证据阶梯。对于仍未解决且会影响整体理解的词，仅当源音频和获准的第二引擎已经可用时，才使用片段级跨识别器环节；否则将其加入队列或询问。真正不同的识别器系列之间的一致结果能够有力地佐证声音，但绝不能在同音异形词之间做出选择，也不能绕过人名检查门槛。使用前阅读原生工作流第 4 步中的第 7 个环节。
- 将单行 `asr_note` 值视为修正溯源信息：它有意引用旧形式，并被排除在匹配范围之外。多行 YAML 台账值不会被屏蔽；关键词、标题、其他源自 ASR 的元数据以及正文仍处于修正范围内。
- 执行原生处理前，完整阅读 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。在执行相应操作前，阅读下方列出的任务专属参考资料。

## 运行上下文

每个入口点都必须通过 `uv run` 运行；需要第三方 Python 包的入口点使用 PEP 723 声明依赖，而仅使用标准库/内部代码的工具可以省略元数据块。从调用此技能时打印出的技能目录执行命令，或在每个脚本路径前加上该目录。不要依赖 `$CLAUDE_SKILL_DIR`；并非所有运行环境都提供该变量。

如果确实不知道 bundle 的位置，请使用 [references/installation_setup.md](references/installation_setup.md) 中的安装解析流程。不要从宽泛的 `find` 结果中选择第一项：缓存、备份和旧版本可能会同时存在。

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

安全模式是 Stage 1 的默认模式：低风险规则会应用；中风险和高风险匹配项会推迟到 `*_needs_review.md` 和持久化审查队列中。`Applied: 0` 是有效结果，并不能证明转录内容没有问题。

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
  "stage2_degraded": false,
  "boundary_refused": 0
}
~~~

读取全部十一字段。`boundary_refused` 统计本次运行中因单词边界检查而被拒绝的词典匹配项，这些匹配项既未应用，也未推迟，因此调用方在比较不同运行结果时可以了解某个推迟项消失的原因；`--apply-all` 会关闭该检查。`stage1_only_incomplete` 是对原有六字段调用方契约的附加字段，在 Stage 1 脚本运行时必须保持为 true；只有调用方运行 Native AI，或明确选择无代理的 Stage 2/3 路径后，才能将其关闭。三个 `stage2_*` 遥测字段始终存在：Stage 1 报告 `0`、`0` 和 `false`；Stage 2/3 会将它们替换为实际的 API 结果。不要根据是否存在 sidecar 来推断操作未产生变化或已成功。

如需了解原生端到端示例，请阅读 [references/example_session_dji_minutes.md](references/example_session_dji_minutes.md)。

## 选择路径

| 路径 | 适用场景 | 必需阅读材料 |
|---|---|---|
| 快速原生路径 | 简短/纯文本转录、说话人已知、风险较低 | 本文件 + [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 完整原生路径 | 领域相关内容较多、实体不熟悉、3 名或更多说话人、篇幅较长或涉及决策的转录 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md)，以及下方的队列和证据参考资料 |
| 调用方集成 | 其他 skill 或导入管道调用 Stage 1 | 下方的 `Cross-skill caller contract` |
| 审查队列/仪表板 | 任何不确定或需要音频的项目 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 无代理 API | 没有可用代理的 CI/批处理自动化 | [glm_api_setup.md](references/glm_api_setup.md) 和 [workflow_guide.md](references/workflow_guide.md) |
| 多文件批处理 | 多份相关转录；尤其是 10 份以上文件 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |

使用词汇和利害程度作为主要分层信号；仅在无法区分时才使用长度作为决胜因素。五分钟的医疗访谈可能需要完整层级，而一份冗长但措辞简单的双人备忘录可以使用快速层级。

## 原生校正检查清单

1. **在阶段 1 之前为文件确定最终名称。** 队列锚点存储绝对路径。应在任何延迟操作可能入队之前，先使用人类可读的项目文件名。如果输入以尚未对应文件的内联文本形式到达——例如斜杠命令参数或粘贴的文本块——应先将其写入文件；`--input` 和队列锚点都需要路径，而在下游不会归档时，使用临时位置即可。如果未提供 `--domain`，且上下文中也没有明显的领域？省略该标志本身就会默认搜索所有领域（`--domain` 自带的默认值），因此不要因为选择领域而阻塞——直接运行不带参数的阶段 1，让安全模式控制哪些内容会自动应用。如果仍需解析某个具体候选项，即使快速层级会跳过其余验证步骤，也应保留验证阶梯中的一步，因为成本足够低：native_ai_full_workflow.md 第 4 步的第 1 级，即进行一次跨领域查询——`--lookup "<term>"` 会输出该术语已有的所有声明（无论词典规则启用还是禁用，无论作为 FROM 还是 TO；上下文规则；名册变体；队列行）——这不是分层表要求跳过的完整验证阶梯，而只是保留这一个查询。
2. **在阅读预校正转录文本之前，恢复原始基线。** 如果 ingest 管道或之前的 API 处理已经接触过文本，应先与原始来源进行差异比较。应将上游编辑视为编辑，而不是事实依据。
3. **加载项目先验信息并阅读完整转录文本。** 如果存在 `~/.transcript-fixer/contexts/<domain>.md`，先读取它，然后在决定早期歧义之前阅读完整文件。
4. **运行阶段 1 并检查真实结果。** 优先使用明确的项目领域以及 `--apply-domain --json`。读取 `deferred` 和 `review_enqueued`；绝不要静默丢弃旁车文件或队列缺口。
5. **将阶段 1 与原始文本/原文进行差异比较。** 如果某条规则改变了正确的语音，应从原文开始处理，使用 `--report-false-positive "<from>" "<to>" --domain <domain>` 使已存储的词对失效，并验证该规则不再触发。
6. **对每个候选项进行分类。**
   - 确信：该语音变化合理，且上下文或权威的本地来源可以确定其含义。
   - 需要验证：人物、公司、产品、模型、股票代码、地点、数字或其他具有关键作用的术语，但缺少来源。
   - 不确定：证据不足以确定；保留原文并入队。
   - 多通道实体分叉：当独立转录在人物姓名或其他专有名词上存在分歧，且没有本地权威来源可以确定时，收集未解决的分叉并一次性询问人工。不要猜测，也不要将多数票视为身份依据。
7. **应用能够解释该语音的最小编辑。** 不要添加说话者没有说出的词。也要校正 ASR 派生的元数据，但保留 `asr_note` 不变。若你现在同意阶段 1 的延迟项，应通过其队列行关闭，而不是使用 sed 重新应用：`--resolve-review <id> --decision accepted`（id 来自 `--list-review --review-file "<absolute-canonical-file>" --json`）会执行编辑，或者在你已经手动应用修复但不写入文件时记录该修复。无论哪种方式，该行最终都应为 `accepted`；`kept_original` 表示转录文本按实际语音来说是正确的，绝不能用于你已应用修复时的退出。
8. **运行第二遍处理。**
   - 所有层级：运行 `--scan-traps` 并检查命中项和 `unparsed`。
   - 完整层级：对恰好一个已校正文件使用全新上下文的审阅者。要求提供简洁的残留问题表，或明确写出 `no new residuals`；空响应或被截断的响应都表示审阅失败。
   - 高风险多录音场景：采样片段只能确定对应锚定项。如果用户要求更高质量或完整的转录，且基线音频可用，应加载 **`/daymade-audio:asr-transcribe-to-text`**，并在完整且最清晰/规范的录音上运行其整文件转录流程，然后才能声称覆盖整个转录文本；否则应报告 `sampled cross-check only — incomplete`。优先使用与规范正文生成者不同的识别器。如果只有同一个识别器可用，该运行可以证明完整来源覆盖，但不能证明不同识别器之间的独立交叉佐证；应明确说明这一边界。
9. **将每个未解决项入队，并且只打开此文件。** 遵循下方的 `Review queue safety` 和 [review_queue_dashboard.md](references/review_queue_dashboard.md)。检测和入队不等于校正：若要提出更高质量/最终版本的声明，锚定到此确切文件的每一行队列记录都必须离开 `pending` 状态。使用 `uv run scripts/review-dashboard/server.py --file "<absolute-canonical-file>"` 启动仪表板；添加 `--item <id>` 可直接定位到某个分叉。如果人工不可用，应明确将产物标记为 `draft / unresolved — incomplete` 并列出所有记录；不要在声称已完成质量处理的情况下交付包含可疑原文的文件。
10. **读取人工状态，然后完成最终处理。** 当人工表示已在仪表板中完成标记时，不要重新运行 ASR，也不要再次询问相同问题。首先运行 `uv run scripts/fix_transcription.py --list-review --review-file "<absolute-canonical-file>" --review-status all --json`，应用由此得到的文件状态，并要求针对该确切路径满足 `stats.pending_total == 0`；在提出高质量/最终版本声明之前，必须保证待处理队列记录为零。然后比较实际编辑过的文件，运行数字一致性检查（数字重要时），重新运行普通阶段 1，重新搜索已知校正，并确认每项变更都可追溯到分类决策。全局队列计数不能关闭或重新打开此文件的质量声明。最后运行 `--close-sidecars --input "<absolute-canonical-file>"`：它会针对文件和队列重新读取每一条 `*_changes.md`/`*_needs_review.md` 记录；只要某条记录仍显示原文且没有裁决，或任何一行仍为待处理状态，就会拒绝执行；只有在所有内容都已关闭时才会删除旁车文件（参见 `Finalization`）。
11. **在同一轮中沉淀经验。** 将每种稳定模式归入正确的位置；不要只把已确认的修复留在聊天中。原生处理阶段的编辑不会进入阶段 1 的校正历史，因此应在最终差异比较之后立即以机械方式收集这些编辑：

~~~bash
    # Diff raw vs corrected into parseable trap candidates (review artifact —
    # you adjudicate the printed list; --write auto-appends only the recurring
    # (≥2x) non-bare candidates; --write-all also appends the one-off set)
    uv run scripts/harvest_corrections.py raw.md corrected.md \
      --context-file ~/.transcript-fixer/contexts/<domain>.md
    ~~~

    每个输出的项目在打印前都会通过真实的 trap parser 进行往返验证，并跳过 context file 中已经记录的配对。bullet grammar 无法承载的配对会在噪声过滤阶段被丢弃，例如某一侧没有词汇内容，或其中包含 `*`，如将供应商的 `***` redaction mask 与真实单词进行差分；任何仍然解析失败的项目都会报告到 stderr，并被排除，而不会中止运行。高频候选是强陷阱；单次出现的候选需要人工判断，这也是 `--write` 默认将其排除的原因；⚠️ 裸形候选永远不会被自动写入。这取代了凭记忆手写 trap bullet 的做法。
12. **有意识地传播实体修复。** 只搜索所属项目的派生笔记/摘要，审查每个命中项，并排除原始 ASR 和 correction sidecars，因为它们保留了证据链。

详细的溯源标准、local-first entity ladder、second-pass prompt、queue payload 和 finalization rules 见 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。

## 跨 skill 调用方契约

调用方 pipeline 有两项相互独立的义务：

1. 使用显式配置的项目 domain(s)、`--apply-domain` 和 `--json` 运行 Stage 1。如果 `deferred > review_enqueued`，则必须将 review sidecar 持久化到任何临时目录之外，或将该缺口标记为失败。
2. 在加载此 skill 的情况下运行 Native AI，或报告 `Stage 1 only — incomplete`。无 agent 自动化可以改用 Stage 3。

规范调用方式：

~~~bash
uv run scripts/fix_transcription.py \
  --input "$staged" --stage 1 \
  --domain "$domains" --apply-domain --json
~~~

只接入脚本路径的调用方永远不会加载此契约。因此，仅接入脚本路径只能算作 Stage 1 prefilter，而不是 transcript correction。

保持项目 domains 持续更新：native pass 中每个确认的重复修正都必须添加回正确的项目 domain、roster 或 context file。

## 词典与身份安全

添加规则前，请阅读 [references/false_positive_guide.md](references/false_positive_guide.md) 和 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。

| Pattern | Destination |
|---|---|
| 稳定的非单词或独特乱码 → canonical term | `--add ... --domain <project>` |
| 重要的重复出现的人物及其观测到的 ASR 变体 | People roster |
| 仅在特定重复短语中才正确的修正 | `--add-context-rule PATTERN REPLACEMENT --domain <project>`（regex，限定 domain；全局规则则省略 `--domain`） |
| 在某个 cue 下才错误的普通/真实单词 | Domain context trap，绝不能使用 bare rule（裸数字或单个姓氏 + 老师/总会在 roster load 时被拒绝，`--add` / `--import` 也会拒绝，包括 `--force`） |
| 真实姓名 → 另一个真实姓名 | Domain context + human/audio verification，绝不能使用 bare rule |
| 已确认正确但反复被重新打开的实体 | Confirmed-correct context record |
| 一次性的句子局部措辞 | 仅编辑；不要添加 |

Stage 1 的匹配时层（[references/false_positive_guide.md](references/false_positive_guide.md) 中三个层级中的第三层：添加时、应用时、匹配时）在风险评分前的三项检查中，即使单独进行字典匹配，也会拒绝匹配：超集检查（修正后的形式已经存在）、短规则的常用词边界检查，以及词边界检查。最后一项会按脚本判断匹配项是否是真实词语的片段：如果 ASCII 匹配项旁边直接有 ASCII 字母，则它位于更长的词语内部（`Cloud` 位于 `iCloud` 中；数字不计入，因此 `cloud3` 仍会被修正）；CJK 匹配项只有在以下情况下才会被拒绝：与其重叠的、仅使用字典进行 jieba 切分得到的每个片段都是多字符词语，并且其中一个跨越了匹配边界（新一 in 更新|一下、问题记 in 问题|记录、同龄 in 同龄人）——如果匹配项下方存在一个单字符片段（巨|神智|能、叫|新|一下|单），则意味着这是未知片段，匹配会继续进行。拒绝次数会计入 `Refused at word boundaries` 和 JSON 中的 `boundary_refused`，列在 Stage 1 摘要中，并且绝不会延后处理。上下文规则（`--add-context-rule`）会跳过此项检查，但仍会经过风险评分，因此在安全模式下，其匹配会被延后到审核队列，而不是直接应用——可以在那里接受它，或者运行 `--apply-all`，该选项会关闭此检查并应用每个匹配；`--apply-domain` 会保留此检查。这些层级列在 [references/false_positive_guide.md](references/false_positive_guide.md) 中。

上下文陷阱是提示，而不是允许盲目替换的许可。领域上下文文件中的两类标注是 **Stage 1 会强制执行的机器可读否决条件**（通过 `--domain` 指定领域时才适用——整个词库运行没有可执行否决的所有者）：标记为 `禁裸词`/`禁入词典` 的陷阱会将 FROM 相同的任何字典规则降级到审核队列，而已确认正确的（勿修）记录会将任何 FROM 为该词元的规则降级——降级优先于 `--apply-domain` 的信任扁平化，因此真实词语规则（绿点→绿电这一类：在业务上下文中正确，在 UI 上下文中错误）可以保留在字典中，而不会被盲目触发。`--apply-all` 仍然是操作者明确指定的覆盖选项。没有该否决条件时，唯一的退出方式是 `--report-false-positive`，但它也会在该规则正确的上下文中禁用规则。`--scan-traps` 支持规范的 `→` 和旧版的 `≈` 映射，并遵循相同的方向约定：左侧是观察到的 ASR，右侧是预期文本。将包含空格的精确 FROM 短语包裹在反引号中：

~~~markdown
- **`CC 思维链`/`CC 思维连` → 目标术语** — only under the domain's documented cue
~~~

这演示的是一个精确的 ASR 短语候选，而不是人名候选。领域上下文仍然是实际目标和提示的权威来源；扫描器只负责定位字面形式的 FROM。

在添加任何形似真实词语的规则前，先测量项目语料库：

~~~bash
uv run scripts/fix_transcription.py \
  --probe "candidate" --corpus /path/to/project-transcripts/

uv run scripts/fix_transcription.py \
  --add "candidate" "canonical" --domain myproject \
  --check-corpus --corpus /path/to/project-transcripts/
~~~

用户裁决会立即确定该次出现的结果，但不会使替换规则可复用。先修复文件，然后根据上表对结果进行归类：只有稳定的重复模式才进入词典/名册/上下文；罕见的句内误听仅保留在文件中。当用户确认两个合法姓名或昵称指的是同一个人时，保留实际说出的形式，并将身份关系作为上下文存储，而不是替换规则。

## Review queue 安全性

在入队或解决之前，阅读 [references/review_queue_dashboard.md](references/review_queue_dashboard.md)。

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

- 在此工作流中，`file` 为必填项。没有它，接受操作可能记录裁决，却无法编辑转录文本。
- `original` 只能是可疑的 token/span；不要在其中放入整句。
- `context` 按原样复制；`line` 是关键字段，而不是 `line_hint`。
- `suggested` 是关键字段，而不是 `suggestion`。使用 `actions`，而不是 `action_pack`。
- 一次只解决一个出现位置；只有在整个批次解决后，才扫描同类实体的其他出现位置。
- `pending` 行对于高质量/最终转录文本来说是一种阻塞状态，并不表示问题已经处理。仅进行队列检测而没有人工/证据裁决，会使产物仍不完整。
- 覆盖后读取 `resolved_text`；列表仍可能显示被拒绝的建议。
- 单行 `asr_note` 台账在接受路径上也会被屏蔽，因此解决项目不会编辑引用旧形式的溯源行。若你在解决前已手动应用修复，仍使用 `--decision accepted` 关闭该项目（若使用覆盖文本，则使用 `overridden`）：当入队时记录的上下文在文件任意位置再次出现，且建议文本位于原始文本所占的位置时，会记录裁决但不写入（`already in place at the anchor — recorded without writing`）。行号漂移不影响此过程，原始文本在提示位置以外的其他话语中继续存在也不影响，原始文本出现在建议文本内部也不影响（阿里→阿里云）。当原始文本仍位于提示位置的解决窗口内、且不在建议文本内部时，会因 `ReAnchorNeeded` 失败，并说明具体原因（锚定话语或旁边的相似话语仍然有误；应在其自己的行上或手动解决，不要使用 `--reanchor-review` 将此行重新锚定到那里）；当记录的邻域在文本槽位中又以第三种形式出现时也会失败（包括文件中任何达到匹配宽度的位置，或提示位置附近宽度缩小到两侧各两个字符的位置）；当编辑触及槽位相邻字符时也会失败。它无法识别的情况是：锚定话语在两个相邻字符之外被删除或重写，而文件其他位置的相同话语已经修正；此时它会将 `accepted` 记录为无需写入，而下一次 Stage 1 运行会再次将文件中残留的误听延后处理。`--reanchor-review <id>` 会修复原始文本已移动或发生漂移的行，但会拒绝上下文已经修正的行。无法重新锚定或识别的队列行，使用 `--decision skipped --note <what happened>` 关闭。`kept_original` 表示转录文本保留原始形式；对于已应用的修复，绝不能用它作为退出方式。
- 如果文件已移动或发生漂移，运行 `--reanchor-review`。在提出要求时添加 `--reanchor-root` 或 `--reanchor-to`。不要围绕待处理项目手动编辑。
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

在满足以下任一条件时，阅读 [references/advanced_correction_evidence.md](references/advanced_correction_evidence.md)：

- 数字、界限、价格、份额、截止时间或数量级会影响决策。
- 同一会议存在两份录音。
- 一个承载重要信息的名称或术语在本地阶梯中仍未解决，源音频可用，并且当前授权已允许使用第二个识别器。
- 白板、幻灯片或拍摄的书面工件可以独立确定名称或术语。
- 多个相关文件应共享同一份修正列表。
- 正在委派一个包含 10 个或更多文件的批次。

数字槽扫描：

~~~bash
uv run scripts/scan_numeric_consistency.py transcript.md --domain myproject
~~~

其输出是候选项，绝不会自动编辑。对于单个承载重要信息的数字，接入原始音频，并通过审查面板凭听觉做出决定。

对于委派的批次，每个代理负责一个文件，不得跨文件替换，并返回剩余项列表。之后，将 `git diff --name-only` 与明确的文件列表进行比较，并根据仓库的工作区安全规则检查每个意外出现的文件。

## 最终化

- 原生模式会直接编辑原始文件。重新运行普通的 `--stage 1` 进行确认；干净的无操作运行不会写入 Stage 1 sidecar。
- 当较新的 `*_stage1.md` 存在且原始文件在其生成后未被编辑时，普通的 Stage 1 重运行会以原子方式将其提升，并移除临时 sidecar。它会保留 `*_changes.md` 和 `*_needs_review.md`：这些是审查证据，而 `--close-sidecars` 是决定它们已关闭的命令。`--apply-all` 永远不会走这条提升路径。
- 不要将输出文件是否存在作为成功信号；读取 JSON/退出状态，并独立读取最终文件。
- 保留原始转录、`*_changes.md` 和 `*_needs_review.md` 作为证据，直到 `--close-sidecars --input "<absolute-canonical-file>"` 报告 `closed`：每条记录都已显示为应用到文件中（或者原始形式不再出现在经过台账屏蔽的转录中），或由针对该精确文件的已决定队列行回答——每次出现对应一行，按最近行匹配，因此第二次出现如果没有属于自己的行，仍会保持未决定状态——或者属于一条之后已作为误报禁用的 FROM→TO 规则（`disabled`：不再是问题），并且文件没有待处理行。当存在未决定的记录和待处理 id 时，它会以退出码 1（`open`）退出并列出这些内容；当文件中仍有一个比文件更新的 `*_stage1.md` 等待普通 Stage 1 重运行，或报告包含解析器无法读取的记录时，它会以退出码 2（`blocked`）退出（无法读取的报告是证据，不应视为空报告）；移除证据和过时的运行输出后，它会以退出码 0 退出。对于仍显示为原始内容且完全没有对应行的记录，`--decide-raw kept_original|skipped --by <who> --note <why>` 会在关闭时通过队列记录该判定——这是审计跟踪，而不是静默删除。`--dry-run` 会显示判定但不删除；`--json` 会返回判定结果。
- `*_stage2.md` 和 `*_dryrun.md` 是 API 路由和预览产生的、限定于本次运行的输出，而不是归档材料：应在生成它们的会话中提升或丢弃它们。比转录文件更新的此类文件表示尚未提升——`--close-sidecars` 会保留它并说明这一点，只有使用 `--discard-unpromoted` 才会将其移除。
- 在最终文件中重新 grep 已知的修正形式，并确认没有修正仅存在于 `asr_note` 或 sidecar 中。
- 如果某个队列项对应的内容已被重命名移走，应使用 `--reanchor-review` 修复它，而不是用虚假的终态判定解决它。

## 无代理 API 路由

仅当没有 Claude/Codex agent 能够执行 Native AI Correction 时：

~~~bash
export GLM_API_KEY="<api-key>"
uv run scripts/fix_transcript_enhanced.py input.md --output ./corrected
~~~

该路由会在输入文件旁写入 `<stem>_stage2.md`。这是本次运行的输出，而不是第二份 transcript：请先验证它，然后在会话结束前将其提升为 transcript，或将其丢弃。一个留在 transcript 旁边、但并非 transcript 本身的 `_stage2.md`，一个月后将无法与已审核的工作区分开来。

请阅读 [references/glm_api_setup.md](references/glm_api_setup.md)、[references/installation_setup.md](references/installation_setup.md)，以及 [references/workflow_guide.md](references/workflow_guide.md) 中明确面向 API 的部分。当某个 chunk 在重试后仍然失败时，API 路由会逐字节保留该 chunk 及其原始周围分隔符，并打印警告；如果所有 chunk 都失败，完整输出将等于输入。对于 `fix_transcription.py --stage 2|3 --json`，请读取新增的 `stage2_total_chunks`、`stage2_failed_chunks` 和 `stage2_degraded` 字段：即使安全保留的产物已生成，`stage2_degraded: true` 也表示本次运行并未完成全部校正。任何 Stage 2 chunk 降级后，增强包装器会在写入该保留产物后以非零状态退出。请验证输出，不要假定警告意味着已经生成了校正结果。

增强 API 包装器还可以添加段落分隔、减少重复的填充词，并提供交互式审核的校正结果。这些属于 API 包装器的功能；它们并不授权 Native AI 为追求流畅性而改写措辞。

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

使用不常见的标志前，请阅读 [references/script_parameters.md](references/script_parameters.md)。执行自定义 SQL 前，请阅读 [references/database_schema.md](references/database_schema.md)；校正列为 `from_text` 和 `to_text`。

## 参考映射

所有参考资料都位于此文件下一级目录中。

| 需求 | 阅读 |
|---|---|
| 完整的原生校正流程 | [原生 AI 完整工作流](references/native_ai_full_workflow.md) |
| 词典、人员名册、领域上下文 | [词典、身份与上下文](references/dictionary_identity_and_context.md) |
| 误报策略 | [误报指南](references/false_positive_guide.md) |
| 队列、仪表板、音频、重新锚定 | [审核队列、仪表板](references/review_queue_dashboard.md) |
| 数字、照片、多段录音、片段交叉核对、批次 | [高级校正证据](references/advanced_correction_evidence.md) |
| 上下文文件语法/模板 | [领域上下文指南](references/domain_context_guide.md) |
| CLI 标志和审核项架构 | [脚本参数](references/script_parameters.md) |
| 数据库架构和查询 | [数据库架构](references/database_schema.md)、[SQL 查询](references/sql_queries.md) |
| 简短命令查询 | [快速参考](references/quick_reference.md)、[词典指南](references/dictionary_guide.md) |
| 学习循环 | [迭代工作流](references/iteration_workflow.md) |
| 原生示例 | [示例会话：DJI 会议纪要](references/example_session_dji_minutes.md) |
| 无代理 API 示例/配置 | [示例会话](references/example_session.md)、[GLM API 设置](references/glm_api_setup.md)、[安装设置](references/installation_setup.md) |
| 架构和格式 | [架构](references/architecture.md)、[文件格式](references/file_formats.md) |
| 操作指南 | [最佳实践](references/best_practices.md)、[故障排除](references/troubleshooting.md)、[团队协作](references/team_collaboration.md)、[工作流指南](references/workflow_guide.md) |

捆绑脚本会被执行，而不会加载到上下文中。主要入口点包括 `fix_transcription.py`、`scan_numeric_consistency.py`、`fetch_minute_audio.py`、`review-dashboard/server.py`，以及上文列出的差异、时间戳和拆分工具。

## 交接

校正完成后，仅当用户希望获得结构化摘要时，才交接给 `/daymade-audio:meeting-minutes-taker`。不要自动创建会议纪要：转录校正和摘要属于不同的范围。