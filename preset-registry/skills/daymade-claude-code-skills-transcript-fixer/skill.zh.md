---
name: transcript-fixer
description: >-
  Corrects speech-to-text transcription errors using dictionary rules and Claude's built-in AI (no external API key required — Native AI Correction is the DEFAULT). Stage 1 alone is not the job. Stage 3 API is a backup for automation without Claude Code. Builds personalized correction databases that learn from each fix, auto-loads person-name ASR variants from your people roster, and reads per-domain context files that prime the AI pass for context-dependent homophones. Triggers when working with ASR/STT output containing recognition errors, homophones, garbled technical terms, person-name errors, or Chinese/English mixed content. Also triggers on requests to clean up meeting notes, lecture transcripts, interview recordings, or any text produced by speech recognition. Use this skill even when the user just says "fix this transcript", "clean up these meeting notes", or mentions garbled names without invoking ASR specifically.
---
# 转录修正器

使用两阶段循环：

1. 阶段 1 应用确定性的、已知的修正。
2. 原生 AI 校正读取完整转录内容，修正一次性错误，核实不确定的实体，并累积可复用的修正。

**原生 AI 校正是默认方式。仅执行阶段 1 并不完整。** 阶段 3 API 仅用于没有可用 Claude/Codex agent 的自动化场景。

## 运行约定

- 完成阶段 1 → 原生 AI 校正 → 累积已确认的重复出现修正。不要仅在阶段 1 完成后就报告转录内容已清理完毕。
- 只有在人类明确将本次运行限制为词典处理，或有带日期的制品证明原生 AI 已经针对这份确切的转录内容运行过时，才跳过原生 AI。
- 在 Claude Code 或 Codex 中，不要运行阶段 3。使用阶段 1 加原生工作流。
- 永远不要为了流畅而重写语音。修正必须能够解释合理的 ASR 错误，并保留谁说了什么。
- 永远不要推断或重新分配说话人身份。保留说话人标签行；人类确认的标签和用户裁决具有权威性。
- 保持未解决的文本不变，并将其加入队列。明显的乱码比流畅但错误的猜测更安全。
- 将单行 `asr_note` 值视为修正溯源：它会有意引用旧形式，并且不参与匹配。多行 YAML 账本值不会被屏蔽；关键词、标题、其他源自 ASR 的元数据以及正文仍属于修正范围。
- 在执行原生处理之前，完整阅读 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。在执行相应操作之前，阅读下方列出的任务专用参考资料。

## 运行上下文

通过 `uv run` 运行每个入口点；需要第三方 Python 包的入口点使用 PEP 723 声明这些依赖，而仅依赖标准库/内部模块的工具可以省略元数据块。从调用此技能时打印出的技能目录执行命令，或在每个脚本路径前加上该目录。不要依赖 `$CLAUDE_SKILL_DIR`；并非每个运行环境都提供该变量。

如果确实不知道 bundle 的位置，请使用 [references/installation_setup.md](references/installation_setup.md) 中的安装解析流程。不要从宽泛的 `find` 结果中选择第一项：缓存、备份和旧版本可能会共存。

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

安全模式是 Stage 1 的默认模式：应用低风险规则；中风险/高风险匹配项会转交至 `*_needs_review.md` 和持久化审核队列。`Applied: 0` 是有效结果，并不能证明转录内容没有问题。

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

读取全部十个字段。`stage1_only_incomplete` 是对原六字段调用方契约的补充；对于 Stage 1 脚本运行，该字段必须保持为 true。只有调用方运行 Native AI，或明确选择无代理的 Stage 2/3 路径，才能将其关闭。三个 `stage2_*` 遥测字段始终存在：Stage 1 报告 `0`、`0` 和 `false`；Stage 2/3 则将其替换为实际的 API 结果。不要根据是否存在 sidecar 来推断没有操作或运行成功。

如需查看原生端到端示例，请阅读 [references/example_session_dji_minutes.md](references/example_session_dji_minutes.md)。

## 选择路径

| 路径 | 适用场景 | 必需阅读内容 |
|---|---|---|
| 快速原生 | 简短/纯文本转录、说话人已知、风险较低 | 本文件 + [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 完整原生 | 领域内容较重、实体不熟悉、3 名以上说话人、较长或涉及决策的转录 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md)，以及下方的队列和证据参考资料 |
| 调用方集成 | 其他 skill 或 ingest pipeline 调用 Stage 1 | 下方的 `Cross-skill caller contract` |
| 审核队列/仪表板 | 任何项目存在不确定性或需要音频 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 无代理 API | 没有可用 agent 的 CI/批处理自动化 | [glm_api_setup.md](references/glm_api_setup.md) 和 [workflow_guide.md](references/workflow_guide.md) |
| 多文件批处理 | 有多个相关转录；尤其是 10 个以上文件 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |

以词汇和风险级别作为主要分层信号；仅在两者无法区分时才使用长度作为次要判断依据。五分钟的医疗访谈可能需要完整层级，而一份较长的普通双人备忘录则可以使用快速层级。

## 原生校正清单

1. **在 Stage 1 之前为文件确定最终名称。** 队列锚点会存储绝对路径。在任何延后处理可能将其加入队列之前，先使用便于人类阅读的项目文件名。当输入是尚未保存为文件的内联文本时——例如斜杠命令参数或粘贴的一段内容——先将其写入文件；`--input` 和队列锚点都需要路径；如果下游不会归档，使用临时位置即可。没有给出 `--domain`，且上下文中也没有明显领域？省略该标志本身就会默认搜索所有领域（这是 `--domain` 自身的默认值），因此不要因为选择领域而阻塞——直接裸运行 Stage 1，让安全模式决定哪些内容可以自动应用。如果仍有某个具体候选项需要解析，即使处于快速层级，也值得保留校验阶梯中的一步，虽然不需要执行其余步骤：`native_ai_full_workflow.md` 第 4 步的第 1 级，一次跨领域的 `corrections.db` 查询——不是层级表要求跳过的完整验证阶梯，而只是这一条查询。
2. **在读取预校正转录之前恢复原始基线。** 如果 ingest pipeline 或之前的 API 处理已经改动过文本，先与原始来源进行差异比较。应将上游编辑视为编辑结果，而不是事实依据。
3. **加载项目先验信息并阅读完整转录。** 如存在 `~/.transcript-fixer/contexts/<domain>.md`，先阅读它，然后通读整个文件，再决定早期的歧义项。
4. **运行 Stage 1 并检查实际结果。** 优先使用明确的项目领域以及 `--apply-domain --json`。读取 `deferred` 和 `review_enqueued`；绝不要默默丢弃 sidecar 或队列缺口。
5. **将 Stage 1 与原始/原始版本进行差异比较。** 如果某条规则改动了正确的语音，应以原始版本为基础，使用 `--report-false-positive "<from>" "<to>" --domain <domain>` 退役已存储的词对，并验证该规则不再触发。
6. **对每个候选项进行分类。**
   - 确信：该声音变化合理，且上下文或权威的本地来源能够确定结果。
   - 需要验证：人物、公司、产品、型号、股票代码、地点、数字或其他承载关键信息的术语，但没有来源支持。
   - 不确定：证据无法确定结果；保留原文并加入队列。
   - 多通道实体分叉：当独立转录对人物姓名或其他专有名词存在分歧，且没有本地权威来源能够确定结果时，收集未解决的分叉并一次性询问人工。不要猜测，也不要将多数票视为身份凭据。
7. **应用能够解释该声音的最小编辑。** 不要添加说话人没有说过的词。也要校正 ASR 派生的元数据，同时保留 `asr_note` 不变。
8. **运行第二轮处理。**
   - 所有层级：运行 `--scan-traps`，并检查命中项和 `unparsed`。
   - 完整层级：让使用全新上下文的审核者仅针对一个已校正文件进行审核。要求返回简洁的残留问题表，或明确写出 `no new residuals`；空响应或被截断的响应都表示审核失败。
   - 高风险多录音场景：抽样片段只能确定该锚定项目。如果用户要求更高质量或完整转录，且存在基线音频，请加载 **`/daymade-audio:asr-transcribe-to-text`**，并在最清晰/规范的完整录音上运行其完整文件转录路径，然后才能声称覆盖整个转录；否则报告 `sampled cross-check only — incomplete`。优先使用与规范正文生成者不同的识别器。如果只有相同的识别器可用，则此次运行证明覆盖了完整来源，但不能算作独立的跨识别器佐证；应明确说明这一边界。
9. **将每个未解决项目加入队列，并且只打开这个文件。** 遵循下方的 `Review queue safety` 以及 [review_queue_dashboard.md](references/review_queue_dashboard.md)。检测和加入队列并不等于校正：若要声称质量更高/已完成，则锚定到此确切文件的每一行队列记录都必须离开 `pending` 状态。使用 `uv run scripts/review-dashboard/server.py --file "<absolute-canonical-file>"` 启动仪表板；添加 `--item <id>` 可直接定位到某个分叉。如果人工审核者不可用，则明确将产物标记为 `draft / unresolved — incomplete` 并列出各行记录；不要在声称质量已完成的情况下交付原始的可疑文本。
10. **读取人工处理状态，然后完成定稿。** 当人工审核者表示已经在仪表板中完成标记时，不要重新运行 ASR，也不要再次询问相同问题。首先运行 `uv run scripts/fix_transcription.py --list-review --review-file "<absolute-canonical-file>" --review-status all --json`，应用由此得到的文件状态，并要求对于该确切路径满足 `stats.pending_total == 0`；在声称质量更高/已完成之前，必须保证待处理记录数为零。然后对实际编辑过的文件进行差异比较，在数字重要时运行数字一致性检查，重新运行普通 Stage 1，再次检索已知校正项，并确认每项变更都可追溯到一次分类决策。全局队列计数不能关闭或重新打开此文件的质量声明。
11. **在同一轮中沉淀经验。** 将每种稳定模式路由到正确的归属位置；不要只把已确认的修复留在聊天中。原生处理阶段的编辑不会进入 Stage 1 的校正历史，因此应在最终差异比较之后立即机械化地收集这些编辑：

~~~bash
    # Diff raw vs corrected into parseable trap candidates (review artifact —
    # you adjudicate the printed list; --write auto-appends only the recurring
    # (≥2x) non-bare candidates; --write-all also appends the one-off set)
    uv run scripts/harvest_corrections.py raw.md corrected.md \
      --context-file ~/.transcript-fixer/contexts/<domain>.md
    ~~~

    每个输出的项目在打印前都会通过真实的 trap 解析器进行往返验证，并且上下文文件中已经记录的配对会被跳过。高频候选项是强陷阱；单次出现的候选项需要人工判断——这就是为什么 `--write` 默认会将它们排除在外——而 ⚠️ 裸形候选项永远不会被自动写入。这取代了凭记忆手写陷阱项目的做法。
12. **有意地传播实体修复。** 仅搜索所属项目的派生笔记/摘要，审查每个命中项，并排除原始 ASR 和修正 sidecar，因为它们需要保留证据链。

详细的溯源标准、本地优先的实体阶梯、第二轮提示词、队列载荷和最终化规则，详见 [references/native_ai_full_workflow.md](references/native_ai_full_workflow.md)。

## 跨 skill 调用方契约

调用方流水线有两项相互独立的义务：

1. 使用明确配置的项目域运行 Stage 1，并指定 `--apply-domain` 和 `--json`。如果 `deferred > review_enqueued`，则必须将 review sidecar 持久化到任何临时目录之外，或将该缺口作为失败上报。
2. 在加载此 skill 的情况下运行 Native AI，或报告 `Stage 1 only — incomplete`。无代理自动化可以改用 Stage 3。

规范调用方式：

~~~bash
uv run scripts/fix_transcription.py \
  --input "$staged" --stage 1 \
  --domain "$domains" --apply-domain --json
~~~

仅接入脚本路径的调用方永远不会加载此契约。因此，仅通过脚本路径进行集成只能算作 Stage 1 预过滤，而不是转录修正。

保持项目域处于最新状态：Native AI 阶段确认的每个重复修正，都必须添加回正确的项目域、名册或上下文文件中。

## 词典与身份安全

在添加规则之前，请阅读 [references/false_positive_guide.md](references/false_positive_guide.md) 和 [references/dictionary_identity_and_context.md](references/dictionary_identity_and_context.md)。

| 模式 | 目标位置 |
|---|---|
| 稳定的非单词或独特乱码 → 规范术语 | `--add ... --domain <project>` |
| 重要且反复出现的人物及其观察到的 ASR 变体 | 人员名册 |
| 仅在特定重复短语中才正确的修正 | `--add-context-rule PATTERN REPLACEMENT --domain <project>`（正则表达式，限定域；全局规则可省略 `--domain`） |
| 只有在某个提示条件下才错误的常见/真实单词 | 域上下文陷阱，绝不能使用裸规则 |
| 真实姓名 → 不同的真实姓名 | 域上下文 + 人工/音频验证，绝不能使用裸规则 |
| 已确认正确但反复被重新打开的实体 | 已确认正确的上下文记录 |
| 一次性、仅限句子局部的措辞 | 仅编辑；不要添加 |

上下文陷阱是提示，而不是盲目替换的许可。域上下文文件中的两类注释是 **由 Stage 1 强制执行的机器可读否决项**（当通过 `--domain` 指定域时才适用——整库运行没有可供否决的所有者）：标记为 `禁裸词`/`禁入词典` 的陷阱会将任何 FROM 相同的词典规则降级为待审核，而一条已确认正确的（勿修）记录会将任何 FROM 为该词元的规则降级——降级优先于 `--apply-domain` 的信任扁平化，因此，真实词规则（绿点→绿电这一类：在业务上下文中正确、在 UI 上下文中错误）可以保留在词典中，而不会被盲目触发。`--apply-all` 仍然是操作员明确指定的覆盖选项。没有该否决项时，唯一的规避方式是使用 `--report-false-positive`，但这也会在规则本应正确的上下文中一并禁用它。`--scan-traps` 支持规范的 `→` 和旧版的 `≈` 映射，并遵循相同的方向约定：左侧是观测到的 ASR，右侧是目标文本。包含空格的精确 FROM 短语请使用反引号括起来：

~~~markdown
- **`CC 思维链`/`CC 思维连` → 目标术语** — only under the domain's documented cue
~~~

这展示的是一个精确的 ASR 短语候选，而不是人名候选。域上下文仍然是实际目标和提示的权威来源；扫描器只负责定位字面上的 FROM 形式。

在添加任何形似真实词语的规则之前，先测量项目语料库：

~~~bash
uv run scripts/fix_transcription.py \
  --probe "candidate" --corpus /path/to/project-transcripts/

uv run scripts/fix_transcription.py \
  --add "candidate" "canonical" --domain myproject \
  --check-corpus --corpus /path/to/project-transcripts/
~~~

用户裁决会立即确定该次出现的处理结果，但不会使某个替换变得可复用。先修复文件，然后将结果按照上表归类：只有稳定且反复出现的模式才进入词典/名册/上下文；罕见的、局限于单个句子的误听仅保留在文件中。当用户确认两个合法姓名或昵称指的是同一个人时，保留实际说出的形式，并将这种身份关系作为上下文存储，而不是作为替换规则。

## 审核队列安全

在入队或解决问题之前，请阅读 [references/review_queue_dashboard.md](references/review_queue_dashboard.md)。

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

- 在此工作流中，`file` 是必填项。没有它，接受操作可能会记录裁决，却不会编辑转录稿。
- `original` 只能填写可疑词元/片段；绝不能在其中放入整句。
- `context` 必须逐字复制；`line` 是关键字段，而不是 `line_hint`。
- `suggested` 是关键字段，而不是 `suggestion`。请使用 `actions`，而不是 `action_pack`。
- 一次只解决一个出现位置；只有在整个批次解决后，才能批量处理同级的实体出现位置。
- `pending` 行对于高质量/最终版转录稿而言是一种阻塞状态，并不代表问题已经得到处理。仅检测到问题并入队，而没有人工/证据裁决，会使产物处于不完整状态。
- 覆盖后请读取 `resolved_text`；列表仍可能显示被拒绝的建议。
- 如果文件已移动或内容发生漂移，请运行 `--reanchor-review`。在收到请求时添加 `--reanchor-root` 或 `--reanchor-to`。不要围绕待处理项目手动编辑。
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
- 白板、幻灯片或拍摄的书面材料可以独立确定名称/术语。
- 多个相关文件应共用同一份修正列表。
- 正在委派一个包含 10 个以上文件的批次。

数字槽位扫描：

~~~bash
uv run scripts/scan_numeric_consistency.py transcript.md --domain myproject
~~~

其输出是候选项，绝不会自动修改。对于单个起决定作用的数字，接入原始音频，并通过审核面板凭听感做出判断。

对于委派的批次，每个代理负责一个文件，不能跨文件替换，并返回残余列表。之后将 `git diff --name-only` 与明确的文件列表进行比较，并根据仓库工作区安全规则检查每个意外出现的文件。

## 最终化

- 原生模式会直接编辑原始文件。重新运行普通的 `--stage 1` 进行确认；干净的无操作运行不会写入 Stage 1 sidecar。
- 当存在更新的 `*_stage1.md` 且原始文件在其生成后未被编辑时，普通的 Stage 1 重新运行会以原子方式将其提升，并移除一次性 sidecar。它会保留 `*_changes.md` 和 `*_needs_review.md`，因为只有审核者才能确认所有相关决策都已关闭。`--apply-all` 永远不会走这条提升路径。
- 不要将输出文件是否存在作为成功信号；读取 JSON/退出状态，并独立读取最终文件。
- 在所有相关决策关闭之前，保留原始转录、`*_changes.md` 和 `*_needs_review.md` 作为证据。
- 在最终文件中重新搜索已知的修正形式，并确认没有修正仅存在于 `asr_note` 或 sidecar 中。
- 如果排队的项目被重命名移走，请使用 `--reanchor-review` 修复它，而不是用虚假的终止性结论将其解决。

## 无代理 API 路径

仅当没有 Claude/Codex agent 能够执行 Native AI Correction 时：

~~~bash
export GLM_API_KEY="<api-key>"
uv run scripts/fix_transcript_enhanced.py input.md --output ./corrected
~~~

阅读 [references/glm_api_setup.md](references/glm_api_setup.md)、[references/installation_setup.md](references/installation_setup.md) 以及 [references/workflow_guide.md](references/workflow_guide.md) 中明确面向 API 的部分。当某个 chunk 在重试后失败时，API 路径会逐字节保留该 chunk 及其原始周围分隔符，并打印警告；如果所有 chunk 都失败，则完整输出与输入相同。对于 `fix_transcription.py --stage 2|3 --json`，读取附加的 `stage2_total_chunks`、`stage2_failed_chunks` 和 `stage2_degraded` 字段：即使安全保留的工件已生成，`stage2_degraded: true` 也不表示运行已完全修正。任何 Stage 2 chunk 降级后，增强包装器会在写入该保留工件后以非零状态退出。请验证输出，不要想当然地认为警告意味着已经存在修正后的结果。

增强型 API 封装还可以添加段落分隔、减少重复的填充内容，并提供修正结果供交互式审阅。这些属于 API 封装功能；它们并不授权 Native AI 为了语言流畅而改写措辞。

## 实用命令

~~~bash
# 提取可能的错误，不进行编辑
uv run scripts/fix_transcription.py --extract-uncertain \
  --input meeting.md --output ./review

# 导入精选的预设规则
uv run scripts/fix_transcription.py --load-presets tech

# 修复时间戳
uv run scripts/fix_transcript_timestamps.py meeting.txt --in-place

# 拆分并重新设定各节的基准
uv run scripts/split_transcript_sections.py meeting.txt \
  --first-section-name "intro" \
  --section "main::<verbatim marker>" \
  --rebase-to-zero

# 逐词审阅差异
uv run scripts/generate_word_diff.py original.md corrected.md output.html

# 将 native-pass 编辑收集为上下文陷阱候选项
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
| 完整的 native 修正流程 | [native_ai_full_workflow.md](references/native_ai_full_workflow.md) |
| 词典、人员名册、领域上下文 | [dictionary_identity_and_context.md](references/dictionary_identity_and_context.md) |
| 误报策略 | [false_positive_guide.md](references/false_positive_guide.md) |
| 队列、仪表板、音频、重新锚定 | [review_queue_dashboard.md](references/review_queue_dashboard.md) |
| 数字、照片、多录音、批次 | [advanced_correction_evidence.md](references/advanced_correction_evidence.md) |
| 上下文文件语法/模板 | [domain_context_guide.md](references/domain_context_guide.md) |
| CLI 标志和审阅项目架构 | [script_parameters.md](references/script_parameters.md) |
| 数据库架构和查询 | [database_schema.md](references/database_schema.md)、[sql_queries.md](references/sql_queries.md) |
| 简短命令查询 | [quick_reference.md](references/quick_reference.md)、[dictionary_guide.md](references/dictionary_guide.md) |
| 学习循环 | [iteration_workflow.md](references/iteration_workflow.md) |
| Native 示例 | [example_session_dji_minutes.md](references/example_session_dji_minutes.md) |
| 无代理 API 示例/配置 | [example_session.md](references/example_session.md)、[glm_api_setup.md](references/glm_api_setup.md)、[installation_setup.md](references/installation_setup.md) |
| 架构和格式 | [architecture.md](references/architecture.md)、[file_formats.md](references/file_formats.md) |
| 操作指南 | [best_practices.md](references/best_practices.md)、[troubleshooting.md](references/troubleshooting.md)、[team_collaboration.md](references/team_collaboration.md)、[workflow_guide.md](references/workflow_guide.md) |

随附的脚本会被执行，而不是加载到上下文中。主要入口点包括 `fix_transcription.py`、`scan_numeric_consistency.py`、`fetch_minute_audio.py`、`review-dashboard/server.py`，以及上文列出的差异、时间戳和分割工具。

## 交接

更正完成后，仅当用户希望获得结构化摘要时，才交接给 `/daymade-audio:meeting-minutes-taker`。不要自动创建会议纪要：转录文本更正和摘要属于不同的工作范围。