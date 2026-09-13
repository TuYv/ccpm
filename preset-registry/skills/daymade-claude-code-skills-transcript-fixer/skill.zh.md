---
name: transcript-fixer
description: >-
  Corrects speech-to-text transcription errors with dictionary rules and Claude's built-in AI (no external API key required); Native AI Correction is the default, Stage 1 alone is incomplete, and Stage 3 API is only for automation without Claude Code. Builds personalized correction databases, loads person-name ASR variants from the configured global people roster, and reads per-domain contexts for homophones. Before correcting a person name, the agent must consult both the global roster and the owning project's identity roster; project rosters are not auto-loaded, and occurrence frequency is never identity evidence. Use for ASR/STT output with recognition errors, homophones, garbled technical terms, person-name errors, or mixed Chinese/English, and for cleaning meeting notes, lecture transcripts, interviews, or any speech-recognition text—even when the user only says “fix this transcript,” “clean up these meeting notes,” or mentions a garbled name.
---
# 转录修正器

使用两阶段循环：

1. Stage 1 应用确定性的、已知的修正。
2. Native AI Correction 读取完整转录内容，修正一次性错误，核验不确定的实体，并汇总可复用的修正。

**Native AI Correction 是默认流程。仅执行 Stage 1 并不完整。** Stage 3 API 仅用于没有 Claude/Codex agent 可用的自动化场景。

## 操作约定

- 完成 Stage 1 → Native AI Correction → 汇总已确认的重复性修正。不要仅在完成 Stage 1 后报告转录内容已清理干净。
- 只有在人工明确将本次运行限制为词典处理，或有日期明确的制品证明 Native AI 已经针对这一确切转录内容运行过时，才跳过 Native AI。
- 在 Claude Code 或 Codex 中，不要运行 Stage 3。使用 Stage 1 加原生工作流。
- 永远不要为了流畅而改写语音内容。修正必须能够解释合理的 ASR 错误，并保留发言者与发言内容的对应关系。
- 永远不要推断或重新分配发言者身份。保留发言者标签行；人工确认的标签和用户判定具有权威性。
- 在修正任何人名之前，直接读取配置的全局人员名单，以及所属项目的显式身份名单或别名账本。Stage 1 只会自动加载全局 `ASR 变体` 条目；它不会加载项目名单，也不会暴露被抑制、禁用或未列出的条目。如果缺少预期来源，或来源之间存在冲突，则保持姓名不变并加入待处理队列，或询问一次。永远不要使用出现频率作为身份证据。在确定姓名之前，阅读 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。
- 使用可用证据解决疑问后再升级处理。音频下载是一种证据渠道，而不是执行 Native 修正的前提。音频不可用时，遵循 [证据选择与升级处理](references/native_ai_full_workflow.md#evidence-selection-and-escalation)；不要要求用户更改下载权限，也不要把每个待处理行都视为只能由用户回答的问题。
- 对确实无法解析的文本保持不变，并将其加入队列。保留明显乱码比自信地猜出错误内容更安全；待处理行记录的是不确定性，并不意味着必须自动转交人工。
- 将陌生词元视为未知内容，而不是错误。首先穷尽本地证据阶梯。对于仍未解析且会影响关键内容的词元，仅当源音频和获准使用的第二引擎已经可用时，才使用逐片段交叉识别器这一层；否则按照上述升级策略使用现有证据继续处理。来自真正不同识别器家族的结果一致，能够强力佐证声音，但绝不能在同音异形之间做选择，也不能绕过人名关卡。在使用前阅读原生工作流第 4 步中的第 7 层。**一批已穷尽证据的待处理项就是这一层的批处理形式**：当原生处理留下一个本地无法解析的行队列时，不要将整个队列原样交给用户，而应使用 `verify_queue_audio.py` 进行裁定（每个转录内容使用一个源音频、一个第二引擎，每行使用两个窗口）；裁定矩阵和时间戳映射陷阱位于 `advanced_correction_evidence.md` § 批量待处理项裁定中。只有两个窗口结果不一致或保持静默的行才交给人工。
- 将单行 `asr_note` 值视为修正来源信息：它有意引用旧形式，并被排除在匹配范围之外。多行 YAML 账本值不会被屏蔽；关键词、标题、其他源自 ASR 的元数据以及正文仍属于修正范围。
- 在执行原生处理之前，完整阅读 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。在执行对应操作之前，阅读下方指定的任务相关参考资料。

## 运行上下文

通过 `uv run` 运行每个入口点；需要第三方 Python 包的入口点使用 PEP 723 声明依赖，而仅依赖标准库/内部代码的工具可以省略元数据块。请从调用此 skill 时输出的 skill 目录执行命令，或为每个脚本路径添加该目录前缀。不要依赖 `$CLAUDE_SKILL_DIR`；并非所有 harness 都提供此变量。

如果确实不知道 bundle 的位置，请使用 [references/installation_setup.md](references/installation_setup.md) 中的安装解析流程。不要从宽泛的 `find` 结果中选择第一个结果：缓存、备份和旧版本可能同时存在。

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

安全模式是 Stage 1 的默认模式：应用低风险规则；中风险/高风险匹配项会延后处理到 `*_needs_review.md` 和持久化审查队列中。`Applied: 0` 是有效结果，并不代表转录内容没有问题。

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

读取结果中的每个字段。`boundary_refused` 统计本次运行中因单词边界检查而被拒绝的字典匹配项——这些匹配项既未应用，也未延后处理，因此调用方在比较多次运行时可以知道某个延后项为何消失；`--apply-all` 会关闭该检查。`stage1_only_incomplete` 是对原始调用方契约的补充，并且在 Stage 1 脚本运行时必须保持为 true；只有调用方运行 Native AI，或明确选择无 agent 的 Stage 2/3 路径，才能将其关闭。`stage2_*` 遥测字段始终存在：Stage 1 报告 `0`、`0` 和 `false`；Stage 2/3 会将其替换为实际的 API 结果。不要根据是否存在 sidecar 来推断无操作或成功。

如需查看原生端到端示例，请阅读 [references/example_session_dji_minutes.md](references/example_session_dji_minutes.md)。

## 选择路径

| 路径 | 使用场景 | 必需阅读内容 |
|---|---|---|
| 快速原生 | 简短/纯文本转录、说话人已知、风险较低 | 本文件 + [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 完整原生 | 领域相关性强、实体不熟悉、3 位及以上说话人、较长或涉及决策的转录 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md)，以及下面的队列和证据参考资料 |
| 调用方集成 | 其他 skill 或 ingest pipeline 调用 Stage 1 | 下方的 `Cross-skill caller contract` |
| 审查队列/仪表板 | 任何不确定或需要音频的项目 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 无 agent API | 没有可用 agent 的 CI/批处理自动化 | [glm_api_setup.md](references/glm_api_setup.md) 和 [workflow_guide.md](references/workflow_guide.md) |
| 多文件批处理 | 多个相关转录；尤其是 10 个以上文件 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |

使用词汇和风险等级作为主要层级信号；仅在无法区分时才使用长度作为决胜因素。一次五分钟的医疗访谈可能需要完整层级，而一份冗长的普通双人备忘录则可以使用快速层级。

## 原生修正检查清单

1. **在 Stage 1 之前为文件确定最终名称。** 队列锚点存储绝对路径。务必在任何延迟处理可以入队之前，使用人类可读的项目文件名。若输入以尚未生成文件的内联文本形式到达，例如斜杠命令参数或粘贴的文本块，请先将其写入文件；`--input` 和队列锚点都需要路径，而下游不会归档时使用临时位置即可。未提供 `--domain` 且上下文中也没有明显领域时？省略该标志本身就会默认搜索所有领域（`--domain` 自身的默认行为），因此不要因为选择领域而阻塞流程；直接裸运行 Stage 1，让安全模式决定哪些内容可以自动应用。如果仍需解析某个具体候选项，即使是在快速层级，也可以保留验证阶梯中的一个步骤，尽管其余步骤都不执行：native_ai_full_workflow.md 第 4 步的第 1 级，即执行一次跨领域查询；`--lookup "<term>"` 会打印该术语上现有的每条声明（无论词典规则启用还是禁用，无论作为 FROM 还是 TO；包括上下文规则、名册变体和队列行）；这不是层级表要求跳过的完整验证阶梯，而只是其中的那一次查询。
2. **在阅读预修正转录稿之前恢复原始基线。** 如果摄取管道或之前的 API 处理已经接触过文本，请先与原始来源进行差异比较。应将上游修改视为修改，而不是视为事实依据。
3. **加载项目先验信息并阅读完整转录稿。** 在存在时读取 `~/.transcript-fixer/contexts/<domain>.md`，然后在决定早期歧义之前阅读整个文件。
4. **运行 Stage 1 并检查真实结果。** 优先使用明确的项目领域和 `--apply-domain --json`。读取 `deferred` 和 `review_enqueued`；绝不要静默丢弃旁车文件或队列缺口。
5. **将 Stage 1 与原始/初始内容进行差异比较。** 如果某条规则更改了正确的语音，应从原始内容着手，使用 `--report-false-positive "<from>" "<to>" --domain <domain>` 撤销已存储的映射对，并验证该规则不再触发。
6. **对每个候选项进行分诊。**
   - 确信：发音变化合理，且上下文或权威的本地来源能够确定结果。
   - 需要验证：人员、公司、产品、型号、股票代码、地点、数字或其他承载关键信息的术语缺少来源。
   - 不确定：证据无法确定结果；保留原文并入队。
   - 多通道实体分叉：当独立转录稿中的人名或其他专有名词存在分歧，且没有本地权威来源能够确定结果时，收集未解决的分叉并一次性询问人工。不要猜测，也不要将多数票视为身份证据。
7. **应用能够解释该发音的最小修改。** 不要添加说话者没有说过的词。也要修正 ASR 派生的元数据，但保留 `asr_note` 不变。现在确认同意的 Stage 1 延迟项应通过其队列行关闭，而不是使用 sed 重新应用：`--resolve-review <id> --decision accepted`（id 来自 `--list-review --review-file "<absolute-canonical-file>" --json`）会执行修改，或者在你已经手动应用修改时记录该修复而不写入文件。无论哪种方式，该行最终都应为 `accepted`；`kept_original` 表示转录内容按实际发音是正确的，绝不能作为已手动应用修复时的退出结果。
8. **运行第二遍处理。**
   - 每个层级：运行 `--scan-traps`，并检查命中项和 `unparsed`。
   - 完整层级：使用新鲜上下文进行审查。对于单个未拆分的审查，指定一个修正后的文件，并要求提供简洁的残留项表格或明确写出 `no new residuals`；空响应或截断响应都表示审查失败。
   - 对于拆分的、多文件的或恢复进行的 Full 审查，按照 [native_review_packets.md](references/native_review_packets.md) 执行数据包分配、JSON 结果、验证和恢复。
   - 高风险多录音场景：采样片段只能确定该锚定条目。如果用户要求更高质量或完整的转录稿，并且基线音频可用，请加载 **`/daymade-audio:asr-transcribe-to-text`**，并在声明覆盖整个转录稿之前，针对完整且最清晰/规范的录音运行其全文件转录路径；否则应报告 `sampled cross-check only — incomplete`。优先使用与规范正文生成者不同的识别器。如果只有同一个识别器可用，则此次运行能够证明完整来源覆盖，但不能证明不同识别器之间的独立交叉佐证；请明确说明这一边界。
9. **将每个未解决项入队；有选择地升级处理。** 首先应用 [证据选择和升级处理](references/native_ai_full_workflow.md#evidence-selection-and-escalation)，然后遵循下方的 `Review queue safety` 和 [review_queue_dashboard.md](references/review_queue_dashboard.md)。需要人工审查时，仅打开此文件。使用 `uv run scripts/review-dashboard/server.py --file "<absolute-canonical-file>"` 启动仪表板；添加 `--item <id>` 可直接定位到某个分叉。若无法获得人工处理，应明确将产物标记为 `draft / unresolved — incomplete` 并列出各行；不要在声称已完成质量处理的情况下交付包含可疑原文的结果。
10. **读回人工状态，然后完成定稿。** 当人工表示他们已在仪表板中完成标记时，不要重新运行 ASR，也不要再次询问相同问题。首先运行 `uv run scripts/fix_transcription.py --list-review --review-file "<absolute-canonical-file>" --review-status all --json`，应用由此产生的文件状态，并要求该确切路径满足 `stats.pending_total == 0`；在声明高质量/最终结果之前，必须确保没有待处理队列行。全局队列计数不能关闭或重新打开该文件的质量声明。然后对实际编辑的文件进行差异比较，在数字重要时运行数字一致性检查，重新运行普通 Stage 1，重新搜索已知修正，并确认每个变更都可追溯到一个分诊决定。最后运行 `--close-sidecars --input "<absolute-canonical-file>"`：它会根据文件和队列重新读取每条 `*_changes.md`/`*_needs_review.md` 记录；只要某条记录仍显示为原始状态但没有裁决，或任何行仍处于待处理状态，就会拒绝执行；仅当所有内容都已关闭时才会删除旁车文件（参见 `Finalization`）。
11. **在同一轮中固化所学内容。** 将每个稳定模式归档到正确的位置；不要只把已确认的修复留在聊天中。原生处理流程中的编辑不会进入 Stage 1 的修正历史，因此应在最终差异比较之后立即机械化地收集这些编辑：

~~~bash
    # Diff raw vs corrected into parseable trap candidates (review artifact —
    # you adjudicate the printed list; --write auto-appends only the recurring
    # (≥2x) non-bare candidates; --write-all also appends the one-off set)
    uv run scripts/harvest_corrections.py raw.md corrected.md \
      --context-file ~/.transcript-fixer/contexts/<domain>.md
    ~~~

    每个输出的项目符号在打印前都会通过真实的陷阱解析器进行往返验证，并且上下文文件中已经记录的配对会被跳过。项目符号语法无法承载的配对会在噪声过滤阶段被丢弃，例如某一侧没有词汇内容，或其中包含 `*`，如供应商的 `***` 遮盖符与真实单词之间的差异。任何仍然无法解析的项目符号都会报告到 stderr，并被排除，而不会中止运行。高频候选是强陷阱；单次出现的候选需要人工判断，这正是 `--write` 默认将其排除的原因；⚠️ 裸形候选永远不会被自动写入。这取代了凭记忆手写陷阱项目符号的做法。
12. **有意识地传播实体修复。**

    首先完成同文件扫描：检查 `harvest_corrections.py --json` 中 `remaining` 非零的条目，然后检查每个已确认实体或技术标识符在正文和源自 ASR 的元数据中的实际拼写族。使用权威拼写和约定的文件名大小写；用户非正式的口述并不表示其要求保留拼写错误。保留真实的其他指代对象、别名和通用字符命中项。不要将同文件扫描变成未经审查的批量替换，也不要重复已经解决的问题。然后仅搜索所属项目的派生笔记/摘要，并审查每个命中项；排除原始 ASR 和修正 sidecar，因为它们保留了证据链。

详细的溯源标准、本地优先的实体阶梯、第二轮提示词、队列负载和最终化规则见 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。

## 跨技能调用方契约

调用方流水线必须：

1. 使用明确配置的项目域、`--apply-domain` 和 `--json` 运行 Stage 1。如果 `deferred > review_enqueued`，则必须将审查 sidecar 持久化到临时目录之外，或将该缺口作为失败报告。
2. 在加载此技能的情况下运行 Native AI，或报告 `Stage 1 only — incomplete`。无代理自动化可以改用 Stage 3。

规范调用方式：

~~~bash
uv run scripts/fix_transcription.py \
  --input "$staged" --stage 1 \
  --domain "$domains" --apply-domain --json
~~~

只接入脚本路径的调用方永远不会加载此契约。因此，仅接入脚本路径只能算作 Stage 1 预过滤，而不是转录稿修正。

保持项目域处于最新状态：Native AI 阶段确认的每个重复修正都必须添加回正确的项目域、名册或上下文文件中。

## 词典与身份安全

在添加规则前阅读 [references/false_positive_guide.md](references/false_positive_guide.md) 和 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。

| 模式 | 目标位置 |
|---|---|
| 稳定的非单词或唯一乱码 → 规范术语 | `--add ... --domain <project>` |
| 重要且反复出现的人名及观测到的 ASR 变体 | 人员名册 |
| 仅在特定反复出现的短语中才正确的修正 | `--add-context-rule PATTERN REPLACEMENT --domain <project>`（正则表达式，限定域；全局规则省略 `--domain`） |
| 在提示词下才会错误的常见词/真实词 | 域上下文陷阱，绝不能使用裸规则（裸数字或单个姓氏 + 老师/总在名册加载时，以及 `--add` / `--import` 时都会被拒绝，包括 `--force`） |
| 真实姓名 → 另一个真实姓名 | 域上下文 + 人工/音频核验，绝不能使用裸规则 |
| 已确认正确却反复被重新打开的实体 | 已确认正确的上下文记录 |
| 一次性、句子局部的措辞 | 仅编辑；不要添加规则 |

第 1 阶段的匹配时层（[references/false_positive_guide.md](references/false_positive_guide.md) 中三个层的第三个：添加时、应用时、匹配时）会在风险评分前的三项检查中拒绝仅凭字典匹配进行修正：超集检查（修正后的形式已经存在）、短规则的常见词边界检查，以及单词边界检查。最后一项会根据脚本判断匹配是否只是实际单词的一部分：如果 ASCII 匹配的紧邻一侧是 ASCII 字母，则它位于更长单词内部（`iCloud` 中的 `Cloud`；数字不计入，因此 `cloud3` 仍会被修正）；对于 CJK 匹配，只有当与其重叠的、仅使用字典进行 jieba 切分得到的每个片段都是多字符词，且其中至少一个跨越了匹配边界时，才会拒绝匹配（更新|一下中的 新一，问题|记录中的 问题记，同龄人中的 同龄）——如果匹配下存在一个单字符片段（巨|神智|能，叫|新|一下|单），则视为未知片段，匹配会继续执行。拒绝会计入 `Refused at word boundaries` 和 JSON 中的 `boundary_refused`，并列在第 1 阶段摘要中，绝不会延后处理。上下文规则（`--add-context-rule`）会跳过此项检查，但仍会进入风险评分，因此在安全模式下，其匹配会被延后到审核队列——在那里接受它，或运行 `--apply-all`，后者会关闭该检查并应用所有匹配；`--apply-domain` 则保留该检查。这些层级列在 [references/false_positive_guide.md](references/false_positive_guide.md) 中。

上下文陷阱是提示，而不是允许盲目替换的许可。在域上下文文件中，有两类注释是**第 1 阶段会强制执行的机器可读否决项**（通过 `--domain` 指定域时才适用——整库运行没有可执行否决的所有者）：标记为 `禁裸词`/`禁入词典` 的陷阱会将所有 FROM 相同的字典规则降级到审核队列；已确认正确的（勿修）记录会将 FROM 为该词条的所有规则降级——降级优先于 `--apply-domain` 的信任扁平化，因此真实词规则（绿点→绿电这一类：在业务上下文中正确，在 UI 上下文中错误）可以保留在字典中，而不会盲目触发。`--apply-all` 仍然是操作者明确指定的覆盖选项。如果没有该否决项，唯一的退出方式就是 `--report-false-positive`，但它会在该规则本来正确的上下文中也禁用规则。`--scan-traps` 支持规范的 `→` 和旧版的 `≈` 映射，并遵循相同的方向约定：左侧是观测到的 ASR，右侧是预期文本。将包含空格的精确 FROM 短语包裹在反引号中：

~~~markdown
- **`CC 思维链`/`CC 思维连` → 目标术语** — 仅在该领域记录的提示语下使用
~~~

这展示的是一个精确的 ASR 短语候选，而不是人名候选。领域上下文仍然是确定实际目标和提示语的依据；扫描器只负责定位字面上的 FROM 形式。

在添加任何形似真实词语的规则之前，先测量项目语料库：

~~~bash
uv run scripts/fix_transcription.py \
  --probe "candidate" --corpus /path/to/project-transcripts/

uv run scripts/fix_transcription.py \
  --add "candidate" "canonical" --domain myproject \
  --check-corpus --corpus /path/to/project-transcripts/
~~~

用户的判定会立即确定该次出现的处理方式，但不会使替换规则可复用。先修复文件，然后将结果按照上表归类：只有稳定且反复出现的模式才进入词典/名册/上下文；罕见的、仅限句内的误听则只保留在文件中。当用户确认两个合法姓名或昵称指的是同一个人时，保留实际说出的形式，并将身份关系存储为上下文，而不是替换规则。

## Review queue 安全性

在入队或解决问题之前，先阅读 [references/review_queue_dashboard.md](references/review_queue_dashboard.md)。

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

- 对此工作流而言，`file` 是必需的。没有它，接受操作可能会记录判定，却无法编辑转录稿。
- `original` 只能填写可疑 token/span；不要在其中放入整个句子。
- `context` 按原文逐字复制；`line` 是关键字段，而不是 `line_hint`。
- `suggested` 是关键字段，而不是 `suggestion`。使用 `actions`，而不是 `action_pack`。
- 一次只解决一个出现位置；只有在整个批次解决后，才扫描处理同一实体的其他出现位置。
- `pending` 行是高质量/最终转录稿的阻塞状态，并不代表问题已经处理。只进行队列检测而没有人工/证据判定，会使产物仍然不完整。
- 覆盖后读取 `resolved_text`；列表中仍可能显示被拒绝的建议。
- 单行的 `asr_note` ledger 在接受路径上也会被屏蔽，因此解决某个项目时绝不会编辑引用旧形式的 provenance 行。如果你在解决之前手动应用了修复，仍应使用 `--decision accepted` 关闭该项目（如果使用了覆盖文本，则使用 `overridden`）：当入队时记录的上下文在文件中的任意位置重新出现，且建议文本位于原始文本所占的位置时，系统会记录该判定但不写入文件（`already in place at the anchor — recorded without writing`）。行号漂移无关紧要；原始文本在远离提示位置的其他话语中仍然存在也无关紧要，原始文本出现在建议文本内部也无关紧要（阿里→阿里云）。当原始文本仍位于提示位置的解决窗口内、且出现在建议文本之外时，系统会以 `ReAnchorNeeded` 失败关闭，并说明具体原因（锚定的话语或旁边相似的话语仍然存在乱码，请单独为该行建立项目或手动处理，然后再解决；不要使用 `--reanchor-review` 将此行重新锚定到那里）；当记录的邻域在文本槽位中还以第三种形式出现时（无论是在文件中匹配宽度的任意位置，还是在提示附近缩小到两侧各两个字符的任意宽度），或者编辑触及槽位旁边的字符时，也会如此。它无法识别的情况是：锚定的话语被删除，或在两个相邻字符之外被重写，而文件中其他相同话语已经显示为修正后的形式；此时系统会记录 `accepted` 且不写入任何内容，而文件中残留的乱码会在下一次 Stage 1 运行时重新进入延后处理。`--reanchor-review <id>` 可以修复原始文本发生移动或漂移的项目，但如果上下文已经显示为修正后的形式，则会拒绝处理。对于队列既无法重新锚定、也无法识别的项目，使用 `--decision skipped --note <what happened>` 关闭。`kept_original` 表示转录稿保留原始形式；对于已经应用的修复，绝不能用它来退出。
- 如果文件发生移动或漂移，请运行 `--reanchor-review`。根据请求添加 `--reanchor-root` 或 `--reanchor-to`。不要围绕 pending 项目手动编辑。
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

- 数字、边界、价格、份额、截止日期或量级会影响决策。
- 同一会议存在两份录音。
- 一个关键名称或术语经过本地阶梯流程后仍未解决，并且源音频可用，当前授权也已允许使用第二个识别器。
- 白板、幻灯片或拍摄的书面工件可以独立确定名称或术语。
- 多个相关文件应共用一个更正列表。
- 正在委派一个包含 10 个或更多文件的批次。

数字槽位扫描：

~~~bash
uv run scripts/scan_numeric_consistency.py transcript.md --domain myproject
~~~

其输出是候选项，不会自动编辑。对于关键数字，请遵循[证据选择与升级](references/native_ai_full_workflow.md#evidence-selection-and-escalation)。当可以访问原始音频时，使用审核面板通过听辨来决定。否则保留存在竞争关系的读法，除非其他证据能够确定其中一种，并继续处理剩余项目；不要要求导出权限。

对于委派的批次，每个代理负责一个文件，不得跨文件替换，并返回残留列表。之后，将 `git diff --name-only` 与明确的文件列表进行比较，并依据仓库工作区安全规则检查每个意外出现的文件。

## 最终化

- Native 模式直接编辑原始文件。重新运行普通的 `--stage 1` 进行确认；干净的无操作不会写入 Stage 1 sidecar。
- 当较新的 `*_stage1.md` 存在且原始文件在此之后未被编辑时，普通的 Stage 1 重运行会以原子方式将其提升，并移除临时 sidecar。它会保留 `*_changes.md` 和 `*_needs_review.md`：这些是审核证据，`--close-sidecars` 命令负责决定它们是否已关闭。`--apply-all` 永远不会走这条提升路径。
- 不要将输出文件是否存在作为成功信号；读取 JSON/退出状态，并独立读取最终文件。
- 在 `--close-sidecars --input "<absolute-canonical-file>"` 报告 `closed` 之前，保留原始转录、`*_changes.md` 和 `*_needs_review.md` 作为证据：每条记录都必须已在文件中显示为已应用（或者原始形式不再出现在经过 ledger 掩码处理的转录中），或由针对该确切文件的已决定队列行回答——每次出现对应一行，并按最近行匹配，因此第二次出现如果没有属于自己的行，仍保持未决定状态——或属于一个后来因误报而被禁用的 FROM→TO 规则（`disabled`：不再是一个问题），并且文件中没有待处理行。它在 `open` 状态下退出 1，并列出未决定的条目和待处理的 id；当某个比文件更新的 `*_stage1.md` 仍在等待普通 Stage 1 重运行，或报告包含解析器无法读取的条目时，以 `blocked` 状态退出 2（无法读取的报告是证据，不应视为空报告）；移除证据和过时的运行输出后，以 0 状态退出。对于仍显示为原始内容且完全没有对应行的条目，使用 `--decide-raw kept_original|skipped --by <who> --note <why>` 在关闭时通过队列记录裁决——这是审计轨迹，而不是静默删除。`--dry-run` 显示裁决但不删除；`--json` 返回裁决结果。
- `*_stage2.md` 和 `*_dryrun.md` 是 API 路由和预览生成的、限定于本次运行的输出，不是归档材料：在生成它们的会话中提升或丢弃它们。如果它们比转录文件更新，则表示尚未提升——`--close-sidecars` 会保留它并说明原因，只有使用 `--discard-unpromoted` 才会将其移除。
- 在最终文件中重新搜索已知的更正形式，并确认没有更正内容只存在于 `asr_note` 或 sidecar 中。
- 如果队列中的项目已被重命名而无法匹配，请使用 `--reanchor-review` 修复，而不要以错误的终态裁决解决它。

## 无代理 API 路由

仅当没有 Claude/Codex agent 能够执行 Native AI Correction 时：

~~~bash
export GLM_API_KEY="<api-key>"
uv run scripts/fix_transcript_enhanced.py input.md --output ./corrected
~~~

该路由会将 `<stem>_stage2.md` 写入输入文件旁边。这是本次运行的输出，而不是第二份 transcript：请先验证它，然后在会话结束前将其提升为 transcript，或将其丢弃。一个留在 transcript 旁边、但并非 transcript 本身的 `_stage2.md`，一个月后将无法与已审核的工作区分开来。

请阅读 [references/glm_api_setup.md](references/glm_api_setup.md)、[references/installation_setup.md](references/installation_setup.md)，以及 [references/workflow_guide.md](references/workflow_guide.md) 中明确面向 API 的部分。当某个 chunk 在重试后仍然失败时，API 路由会逐字节保留该 chunk 及其原始周围分隔符，并打印警告；如果所有 chunk 都失败，则完整输出等于输入。对于 `fix_transcription.py --stage 2|3 --json`，请读取新增的 `stage2_total_chunks`、`stage2_failed_chunks` 和 `stage2_degraded` 字段：即使安全保留的 artifact 已输出，`stage2_degraded: true` 也不表示这是一次完全纠正的运行。当任何 Stage 2 chunk 降级时，增强 API wrapper 会在写入该保留 artifact 后以非零状态退出。请验证输出，不要假设警告意味着存在已纠正的结果。

增强 API wrapper 还可以添加段落分隔、减少重复的填充词，并提供交互式审核的纠正结果。这些属于 API-wrapper 功能；它们并不授权 Native AI 为了语言流畅而改写措辞。

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

# Batch-adjudicate a transcript's pending queue rows via clip-level
# cross-recognition (one source audio, one second engine, both windows)
uv run scripts/verify_queue_audio.py \
  --transcript /abs/meeting.md --audio /abs/source.wav \
  --speed 1.0 --engine-script /abs/stepfun-asr/scripts/asr_transcribe.py

# Multi-format Stage 1/API comparison report
uv run scripts/generate_diff_report.py \
  original.md original_stage1.md original_stage2.md \
  --output ./diff_reports

# Every existing claim on a term: dictionary (active/disabled), context rules, roster, queue
uv run scripts/fix_transcription.py --lookup "候选词"
~~~

# 判断一份已完成的 transcript 的 review sidecar 是否已关闭，然后将其移除
uv run scripts/fix_transcription.py --close-sidecars \
  --input "/absolute/meeting.md" --dry-run

# Setup health
uv run scripts/fix_transcription.py --validate
~~~

在使用不常见的 flags 前，请先阅读 [references/script_parameters.md](references/script_parameters.md)。在使用自定义 SQL 前，请先阅读 [references/database_schema.md](references/database_schema.md)；correction columns 为 `from_text` 和 `to_text`。

## Reference map

所有 references 都与此文件位于同一层级。

| Need | Read |
|---|---|
| 完整的 native correction sequence | [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| Split/batch cold-review packets、result validation 和 interruption recovery | [native_review_packets.md](references/native_review_packets.md) |
| Dictionary、people roster、domain contexts | [dictionary_identity_and_context.md](references/dictionary_identity_and_context.md) |
| False-positive policy | [false_positive_guide.md](references/false_positive_guide.md) |
| Queue、dashboard、audio、re-anchor | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| Numbers、photos、multi-recording、clip cross-check、batches、batch pending-queue audio adjudication | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |
| Context-file grammar/template | [domain_context_guide.md](references/domain_context_guide.md) |
| CLI flags 和 review-item schema | [script_parameters.md](references/script_parameters.md) |
| Database schema 和 queries | [database_schema.md](references/database_schema.md)、[sql_queries.md](references/sql_queries.md) |
| Short command lookup | [quick_reference.md](references/quick_reference.md)、[dictionary_guide.md](references/dictionary_guide.md) |
| Learning loop | [iteration_workflow.md](references/iteration_workflow.md) |
| Native examples | [example_session_dji_minutes.md](references/example_session_dji_minutes.md) |
| Agent-less API example/config | [example_session.md](references/example_session.md)、[glm_api_setup.md](references/glm_api_setup.md)、[installation_setup.md](references/installation_setup.md) |
| Architecture 和 formats | [architecture.md](references/architecture.md)、[file_formats.md](references/file_formats.md) |
| Operational guidance | [best_practices.md](references/best_practices.md)、[troubleshooting.md](references/troubleshooting.md)、[team_collaboration.md](references/team_collaboration.md)、[workflow_guide.md](references/workflow_guide.md) |

Bundled scripts 会被执行，而不会加载到上下文中。主要 entry points 为 `fix_transcription.py`、`scan_numeric_consistency.py`、`fetch_minute_audio.py`、`review-dashboard/server.py`，以及上文列出的 diff/timestamp/splitting utilities。

## Handoff

完成 correction 后，仅当用户希望获得结构化摘要时，才将任务交接给 `/daymade-audio:meeting-minutes-taker`。不要自动创建 meeting minutes：transcript correction 和 summarization 属于不同的 scope。