---
name: transcript-fixer
description: >-
  Corrects speech-to-text transcription errors with dictionary rules and Claude's built-in AI (no external API key required); Native AI Correction is the default, Stage 1 alone is incomplete, and Stage 3 API is only for automation without Claude Code. Builds personalized correction databases, loads person-name ASR variants from the configured global people roster, and reads per-domain contexts for homophones. Before correcting a person name, the agent must consult both the global roster and the owning project's identity roster; project rosters are not auto-loaded, and occurrence frequency is never identity evidence. Use for ASR/STT output with recognition errors, homophones, garbled technical terms, person-name errors, or mixed Chinese/English, and for cleaning meeting notes, lecture transcripts, interviews, or any speech-recognition text—even when the user only says “fix this transcript,” “clean up these meeting notes,” or mentions a garbled name.
---
# 转录修正器

使用两阶段循环：

1. 阶段 1 应用确定性的、已知的修正。
2. 原生 AI 修正读取完整转录内容，修正一次性错误，核实不确定的实体，并沉淀可复用的修正。

**原生 AI 修正是默认流程。仅执行阶段 1 是不完整的。** 阶段 3 API 仅用于没有可用 Claude/Codex agent 的自动化场景。

## 操作约定

- 完成阶段 1 → 原生 AI 修正 → 沉淀已确认的重复出现修正。不要仅在阶段 1 完成后就报告转录内容已经清理完毕。
- 仅当人工明确将本次运行限制为词典处理，或带日期的产物证明原生 AI 已经在此份确切转录内容上运行过时，才跳过原生 AI。
- 在 Claude Code 或 Codex 中，不要运行阶段 3。使用阶段 1 加原生工作流。
- 永远不要为了流畅而重写语音内容。修正必须能够解释合理的 ASR 错误，并保留谁说了什么。
- 永远不要推断或重新分配说话人身份。保留说话人标签行；人工确认的标签和用户裁定具有权威性。
- 在修正任何人名之前，直接读取配置的全局人员名册，以及所属项目明确的身份名册或别名账本。阶段 1 仅自动加载全局 `ASR 变体` 条目；它不会加载项目名册，也不会暴露被抑制、禁用或未列出的条目。如果预期来源缺失或来源之间存在冲突，则保持名称不变，并将其加入队列或询问一次。永远不要使用出现频率作为身份证据。确定名称之前，阅读 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。
- 保持未解决文本不变，并将其加入队列。可见的乱码比流畅但错误的猜测更安全。
- 将不熟悉的词视为未知，而不是错误。首先穷尽本地证据阶梯。对于仍未解决且承载关键含义的词，仅当源音频和获准的第二引擎已经可用时，才使用片段级交叉识别器这一层；否则将其加入队列或询问。真正不同的识别器系列之间的一致性能够有力佐证声音，但永远不能在同音异形拼写之间做选择，也不能绕过人名校验门槛。使用前阅读原生工作流第 4 步、第 7 层。
- 将单行 `asr_note` 值视为修正溯源信息：它有意引用旧形式，并被排除在匹配范围之外。多行 YAML 账本值不会被屏蔽；关键词、标题、其他源自 ASR 的元数据和正文仍在修正范围内。
- 执行原生处理之前，完整阅读 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。在执行相应操作之前，阅读下方列出的任务特定参考资料。

## 运行上下文

通过 `uv run` 运行每个入口点；需要第三方 Python 包的入口点使用 PEP 723 声明依赖，而仅依赖标准库/内部模块的工具可以省略元数据块。从调用此 skill 时打印出的 skill 目录执行命令，或在每个脚本路径前加上该目录。不要依赖 `$CLAUDE_SKILL_DIR`；并非每个 harness 都提供该变量。

如果确实不知道 bundle 的位置，请使用 [references/installation_setup.md](references/installation_setup.md) 中的安装解析流程。不要从宽泛的 `find` 结果中选择第一项：缓存、备份和旧版本可能同时存在。

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

安全模式是 Stage 1 的默认模式：低风险规则会应用；中风险和高风险匹配项会延后到 `*_needs_review.md` 和持久化审核队列中。`Applied: 0` 是有效结果，并不能证明转录内容干净。

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

请读取全部十个字段。`stage1_only_incomplete` 是对原六字段调用方契约的增补，并且对于 Stage 1 脚本运行必须保持为 true；只有调用方运行 Native AI，或明确选择无 agent 的 Stage 2/3 路径，才能将其关闭。三个 `stage2_*` 遥测字段始终存在：Stage 1 报告 `0`、`0` 和 `false`；Stage 2/3 则将其替换为实际的 API 结果。不要根据是否存在 sidecar 来推断无操作或成功。

如需查看原生端到端示例，请阅读 [references/example_session_dji_minutes.md](references/example_session_dji_minutes.md)。

## 选择路径

| 路径 | 适用场景 | 必需阅读内容 |
|---|---|---|
| 快速原生 | 简短/纯文本转录、说话人已知、低风险 | 本文件 + [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 完整原生 | 领域相关内容较多、实体不熟悉、3 名或以上说话人、转录内容较长或涉及决策 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md)，以及下面的队列和证据参考资料 |
| 调用方集成 | 其他 skill 或摄取流程调用 Stage 1 | 下面的 `Cross-skill caller contract` |
| 审核队列/仪表板 | 任何不确定或需要音频的项目 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 无 agent API | 没有可用 agent 的 CI/批处理自动化 | [glm_api_setup.md](references/glm_api_setup.md) 和 [workflow_guide.md](references/workflow_guide.md) |
| 多文件批处理 | 多个相关转录文件；尤其是 10 个以上文件 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |
|

使用词汇和风险级别作为主要分层信号；只有在无法区分时才使用长度作为决胜因素。一次五分钟的医疗访谈可能需要完整层级，而一份篇幅很长但内容直白的双人备忘录可以使用快速层级。

## 原生修正检查清单

1. **在 Stage 1 之前为文件确定最终名称。** 队列锚点存储绝对路径。在任何延迟操作可能入队之前，使用人类可读的项目文件名。如果输入以尚不存在文件的内联文本形式到达，例如斜杠命令参数或粘贴的文本块，请先将其写入文件；`--input` 和队列锚点都需要路径，而当下游不会归档时，使用临时位置即可。未提供 `--domain` 且上下文中也没有明显的域？省略该标志本身就会默认搜索所有域（`--domain` 自身的默认值），因此不要因为选择域而阻塞；直接运行不带参数的 Stage 1，让安全模式决定自动应用哪些内容。如果仍需要解析某个具体候选项，即使快速层级不执行其余步骤，也可以保留验证阶梯中的一步：native_ai_full_workflow.md 第 4 步的第 1 级，只进行一次跨域 `corrections.db` 查询；不是层级表要求跳过的完整验证阶梯，而仅仅是这一次查询。
2. **在阅读预修正转录文本之前恢复原始基线。** 如果摄取管道或之前的 API 处理已经改动过文本，先与原始来源进行差异比较。将上游修改视为修改内容，而不是事实基准。
3. **加载项目先验信息并阅读完整转录文本。** 如果存在，请阅读 `~/.transcript-fixer/contexts/<domain>.md`，然后在提前决定有歧义的内容之前读完整个文件。
4. **运行 Stage 1 并检查实际结果。** 优先使用明确的项目域以及 `--apply-domain --json`。读取 `deferred` 和 `review_enqueued`；绝不要默默丢弃 sidecar 或队列缺口。
5. **将 Stage 1 与原始/初始内容进行差异比较。** 如果某条规则改动了正确的语音，请基于原始内容处理，使用 `--report-false-positive "<from>" "<to>" --domain <domain>` 撤销已存储的配对，并验证该规则不再触发。
6. **对每个候选项进行分流。**
   - 确信：语音变化合理，并且上下文或权威的本地来源能够确定结果。
   - 需要验证：人物、公司、产品、模型、股票代码、地点、数字或其他关键术语缺少来源。
   - 不确定：证据无法确定结果；保留原文并入队。
   - 多通道实体分叉：当独立转录文本中的人名或其他专有名词存在分歧，且没有本地权威来源能够确定结果时，收集未解决的分叉并一次性询问人工。不要猜测，也不要将多数票视为身份证据。
7. **应用能够解释该语音的最小修改。** 不要添加说话者没有说出的词。也要修正 ASR 派生的元数据，同时保留 `asr_note`。
8. **运行第二遍处理。**
   - 每个层级：运行 `--scan-traps` 并检查命中项和 `unparsed`。
   - 完整层级：对恰好一个已修正文件使用全新上下文的审查者。要求提供紧凑的残留问题表，或明确给出 `no new residuals`；空响应或截断响应都表示审查失败。
   - 高风险多录音场景：抽样片段只能确定所锚定的那一项。如果用户要求更高质量或完整的转录文本，且存在基线音频，请加载 **`/daymade-audio:asr-transcribe-to-text`**，并在完整且最清晰/权威的录音上运行其完整文件转录路径，然后才能声称覆盖整个转录文本；否则报告 `sampled cross-check only — incomplete`。优先使用与规范正文生成者不同的识别器。如果只能使用同一个识别器，则该运行证明了完整源覆盖，但不构成独立的跨识别器佐证；请说明这一边界。
9. **将每个未解决的项目入队，并且只打开此文件。** 遵循下面的 `Review queue safety` 和 [review_queue_dashboard.md](references/review_queue_dashboard.md)。检测和入队不等于修正：若要声称更高质量/最终版本，锚定到此确切文件的每一行队列记录都必须离开 `pending` 状态。使用 `uv run scripts/review-dashboard/server.py --file "<absolute-canonical-file>"` 启动仪表板；添加 `--item <id>` 可直接定位到某个分叉。如果人工无法处理，请明确将产物标记为 `draft / unresolved — incomplete` 并列出各行记录；不要在声称已完成质量处理的情况下交付原始可疑文本。
10. **读回人工处理状态，然后完成定稿。** 当人工表示他们已在仪表板中完成标记时，不要重新运行 ASR，也不要再次询问相同的问题。首先运行 `uv run scripts/fix_transcription.py --list-review --review-file "<absolute-canonical-file>" --review-status all --json`，应用由此得到的文件状态，并要求该确切路径满足 `stats.pending_total == 0`；在声称高质量/最终版本之前，必须保证待处理记录数为零。然后对实际编辑的文件进行差异比较，在数字重要时运行数值一致性检查，重新运行普通 Stage 1，重新搜索已知修正，并确认每项修改都能追溯到一次分流决策。全局队列计数不能关闭或重新打开此文件的质量声明。
11. **在同一轮中沉淀所学内容。** 将每种稳定模式路由到正确的归属位置；不要只把已确认的修正留在聊天中。原生处理阶段的修改不会进入 Stage 1 的修正历史，因此请在最终差异比较之后立即机械化地收集这些修改：

~~~bash
    # Diff raw vs corrected into parseable trap candidates (review artifact —
    # you adjudicate the printed list; --write auto-appends only the recurring
    # (≥2x) non-bare candidates; --write-all also appends the one-off set)
    uv run scripts/harvest_corrections.py raw.md corrected.md \
      --context-file ~/.transcript-fixer/contexts/<domain>.md
    ~~~

    每个输出的项目在打印前都会通过真实的 trap parser 进行往返验证，并跳过 context file 中已经记录的配对。高频候选是强 trap；单次出现的候选需要人工判断，这就是为什么 `--write` 默认会将它们排除在外；⚠️ 裸形式候选永远不会被自动写入。这取代了凭记忆手写 trap 项目。

12. **有意识地传播实体修复。** 只搜索所属项目的派生笔记/摘要，审查每个命中项，并排除原始 ASR 和 correction sidecars，因为它们保留了证据链。

详细的溯源标准、本地优先的实体梯度、第二遍提示词、队列负载和最终化规则，参见 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。

## 跨 skill 调用方契约

调用方流水线有两项相互独立的义务：

1. 使用明确配置的项目 domain(s)、`--apply-domain` 和 `--json` 运行 Stage 1。如果 `deferred > review_enqueued`，则将 review sidecar 持久化到任意临时目录之外，或将该缺口作为失败报告。
2. 在加载此 skill 的情况下运行 Native AI，或报告 `Stage 1 only — incomplete`。无 agent 的自动化可以改用 Stage 3。

规范调用：

~~~bash
uv run scripts/fix_transcription.py \
  --input "$staged" --stage 1 \
  --domain "$domains" --apply-domain --json
~~~

只接入脚本路径的调用方永远不会加载此契约。因此，仅进行脚本路径集成只能算 Stage 1 预过滤，而不是 transcript correction。

保持项目 domains 热状态：native pass 中每个已确认的重复修正都必须添加回正确的项目 domain、roster 或 context file。

## 字典与身份安全

在添加规则前，阅读 [references/false_positive_guide.md](references/false_positive_guide.md) 和 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。

| Pattern | Destination |
|---|---|
| 稳定的非单词或独特乱码 → canonical term | `--add ... --domain <project>` |
| 重要的重复出现人物及其已观察到的 ASR 变体 | People roster |
| 仅在特定重复短语中正确的修正 | `--add-context-rule PATTERN REPLACEMENT --domain <project>`（regex，按 domain 作用域；省略 `--domain` 则为全局） |
| 仅在某个提示语境下错误的常见/真实单词 | Domain context trap，绝不使用 bare rule |
| 真实姓名 → 另一个真实姓名 | Domain context + human/audio verification，绝不使用 bare rule |
| 反复被重新打开但已确认正确的实体 | Confirmed-correct context record |
| 一次性、句子局部的措辞 | 仅编辑；不要添加 |

上下文陷阱是提示，而不是允许盲目替换的许可。在领域上下文文件中，有两类注释是**由 Stage 1 强制执行的机器可读否决项**（仅当通过 `--domain` 指定领域时生效——整库运行没有可供否决的所有者）：标记为`禁裸词`/`禁入词典`的陷阱会将 FROM 相同的任何词典规则降级为待审核，而一条已确认正确的（勿修）记录会将 FROM 为该词元的任何规则降级——降级优先于 `--apply-domain` 的信任扁平化，因此，一个真实词语规则（绿点→绿电这一类：在业务上下文中正确，在 UI 上下文中错误）可以保留在词典中，而不会被盲目触发。`--apply-all` 仍然是操作员明确指定的覆盖选项。没有该否决项时，唯一的退出方式是 `--report-false-positive`，但这也会在该规则正确的上下文中禁用它。`--scan-traps` 支持规范的 `→` 和旧版的 `≈` 映射，并遵循相同的方向约定：左侧是观测到的 ASR，右侧是目标文本。将包含空格的精确 FROM 短语包裹在反引号中：

~~~markdown
- **`CC 思维链`/`CC 思维连` → 目标术语** — only under the domain's documented cue
~~~

这展示的是一个精确的 ASR 短语候选，而不是人名候选。领域上下文仍然是实际目标和提示的权威来源；扫描器只负责定位字面 FROM 形式。

在添加任何形似真实词语的规则之前，先测量项目语料库：

~~~bash
uv run scripts/fix_transcription.py \
  --probe "candidate" --corpus /path/to/project-transcripts/

uv run scripts/fix_transcription.py \
  --add "candidate" "canonical" --domain myproject \
  --check-corpus --corpus /path/to/project-transcripts/
~~~

用户裁决会立即确定该次出现的处理结果，但不会使替换可复用。先修复文件，然后将结果按照上表归类：只有稳定且反复出现的模式才进入词典/名册/上下文；罕见的句子局部误听仅保留在文件中。当用户确认两个合法姓名或昵称指的是同一个人时，保留实际说出的形式，并将身份关系作为上下文存储，而不是作为替换规则。

## 审核队列安全

在加入或解决审核项之前，阅读 [references/review_queue_dashboard.md](references/review_queue_dashboard.md)。

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

- `file` 是此工作流的必填项。没有它，接受操作可以记录裁决，却无法编辑转录稿。
- `original` 只能是可疑词元/跨度；绝不能在其中放入整句。
- `context` 按原文逐字复制；`line` 是关键字段，不是 `line_hint`。
- `suggested` 是关键字段，不是 `suggestion`。使用 `actions`，不要使用 `action_pack`。
- 一次只解决一个出现位置；只有在整个批次解决后，才批量处理同一实体的其他出现位置。
- `pending` 行对于高质量/最终转录稿而言是阻塞状态，并不表示问题已得到处理。仅完成队列检测而没有人工/证据裁决，会使产物不完整。
- 覆盖后读取 `resolved_text`；列表仍可能显示被拒绝的建议。
- 单行 `asr_note` 台账在接受路径上也会被屏蔽，因此解决项目时绝不会编辑引用旧形式的溯源行。如果你在解决之前手动应用了修复，该项目现在会以 `ReAnchorNeeded` 失败并停止写入——使用 `--decision kept_original` 解决，或者先使用 `--reanchor-review <id>`，前提是锚点只是发生了漂移。
- 如果文件已移动或发生漂移，运行 `--reanchor-review`。按要求添加 `--reanchor-root` 或 `--reanchor-to`。不要围绕待处理项目手动编辑。
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

当满足以下任一条件时，阅读 [references/advanced_correction_evidence.md](references/advanced_correction_evidence.md)：

- 数字、界限、价格、份额、截止期限或数量级会影响决策。
- 同一会议存在两份录音。
- 一个关键名称或术语经过本地阶梯流程后仍未解决，源音频可用，并且当前授权已经允许使用第二个识别器。
- 白板、幻灯片或拍摄的书面工件可以独立确定名称或术语。
- 多个相关文件应共享同一个更正列表。
- 正在委派一个包含 10 个或更多文件的批次。

数字槽位扫描：

~~~bash
uv run scripts/scan_numeric_consistency.py transcript.md --domain myproject
~~~

其输出是候选项，绝不会自动进行编辑。对于单个关键数字，将原始音频接入审核仪表板，通过听辨做出决定。

对于委派的批次，每个代理负责一个文件，不得跨文件替换，并返回残留列表。之后，将 `git diff --name-only` 与明确的文件列表进行比较，并根据仓库工作树安全规则检查每个意外出现的文件。

## 最终化

- Native 模式直接编辑原始文件。重新运行普通的 `--stage 1` 进行确认；干净的无操作不会写入 Stage 1 sidecar。
- 当存在更新的 `*_stage1.md` 且原始文件在此之后未被编辑时，普通的 Stage 1 重跑会以原子方式将其提升，并移除临时 sidecar。它会保留 `*_changes.md` 和 `*_needs_review.md`，因为只有审核者才能知道所有相关决策是否已经关闭。`--apply-all` 永远不会采用此提升路径。
- 不要将输出文件是否存在作为成功信号；读取 JSON/退出状态，并独立读取最终文件。
- 在所有相关决策关闭之前，保留原始转录、`*_changes.md` 和 `*_needs_review.md` 作为证据。
- 在最终文件中重新搜索已知的更正形式，并确认没有更正内容仍只存在于 `asr_note` 或 sidecar 中。
- 如果排队的条目被重命名移走，使用 `--reanchor-review` 修复它，而不要通过虚假的终态裁决来解决它。

## 无代理 API 路径

仅当没有 Claude/Codex 代理能够执行 Native AI Correction 时：

~~~bash
export GLM_API_KEY="<api-key>"
uv run scripts/fix_transcript_enhanced.py input.md --output ./corrected
~~~

阅读 [references/glm_api_setup.md](references/glm_api_setup.md)、[references/installation_setup.md](references/installation_setup.md) 以及 [references/workflow_guide.md](references/workflow_guide.md) 中明确面向 API 的部分。当某个分块在重试后失败时，API 路径会逐字节保留该分块及其原始周围分隔符，并打印警告；如果所有分块都失败，完整输出将等于输入。对于 `fix_transcription.py --stage 2|3 --json`，读取新增的 `stage2_total_chunks`、`stage2_failed_chunks` 和 `stage2_degraded` 字段：即使安全保留的工件已经生成，`stage2_degraded: true` 也不表示运行已完成完整更正。任何 Stage 2 分块降级后，增强包装器会在写入该保留工件后以非零状态退出。请验证输出，不要想当然地认为警告意味着存在已更正的结果。

增强版 API 封装还可以添加段落分隔、减少重复填充词，并呈现更正内容供交互式审阅。这些属于 API 封装功能；它们并不授权 Native AI 为了表达流畅而改写措辞。

## 工具命令

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

使用不常见的标志前，请先阅读 [references/script_parameters.md](references/script_parameters.md)。使用自定义 SQL 前，请先阅读 [references/database_schema.md](references/database_schema.md)；更正列名为 `from_text` 和 `to_text`。

## 参考资料索引

所有参考资料都位于此文件的下一级目录中。

| 需求 | 阅读 |
|---|---|
| 完整的原生更正流程 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 词典、人员名册、领域上下文 | [dictionary_identity_and_context.md](references/dictionary_identity_and_context.md) |
| 误报策略 | [false_positive_guide.md](references/false_positive_guide.md) |
| 队列、仪表板、音频、重新锚定 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 数字、照片、多录音、片段交叉核对、批次 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |
| 上下文文件语法/模板 | [domain_context_guide.md](references/domain_context_guide.md) |
| CLI 标志和审阅项架构 | [script_parameters.md](references/script_parameters.md) |
| 数据库架构和查询 | [database_schema.md](references/database_schema.md)、[sql_queries.md](references/sql_queries.md) |
| 简短命令查询 | [quick_reference.md](references/quick_reference.md)、[dictionary_guide.md](references/dictionary_guide.md) |
| 学习循环 | [iteration_workflow.md](references/iteration_workflow.md) |
| 原生示例 | [example_session_dji_minutes.md](references/example_session_dji_minutes.md) |
| 无代理 API 示例/配置 | [example_session.md](references/example_session.md)、[glm_api_setup.md](references/glm_api_setup.md)、[installation_setup.md](references/installation_setup.md) |
| 架构和格式 | [architecture.md](references/architecture.md)、[file_formats.md](references/file_formats.md) |
| 操作指南 | [best_practices.md](references/best_practices.md)、[troubleshooting.md](references/troubleshooting.md)、[team_collaboration.md](references/team_collaboration.md)、[workflow_guide.md](references/workflow_guide.md) |
|

捆绑脚本会被执行，而不会加载到上下文中。主要入口点包括 `fix_transcription.py`、`scan_numeric_consistency.py`、`fetch_minute_audio.py`、`review-dashboard/server.py`，以及上文列出的差异/时间戳/分割实用工具。

## 交接

完成校正后，仅当用户需要结构化摘要时，才移交给 `/daymade-audio:meeting-minutes-taker`。不要自动创建会议纪要：转录校正和摘要属于不同的工作范围。