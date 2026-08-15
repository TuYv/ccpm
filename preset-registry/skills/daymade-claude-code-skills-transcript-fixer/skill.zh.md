---
name: transcript-fixer
description: >-
  Corrects speech-to-text transcription errors using dictionary rules and Claude's built-in AI (no external API key required — Native AI Correction is the DEFAULT). Stage 1 alone is not the job. Stage 3 API is a backup for automation without Claude Code. Builds personalized correction databases that learn from each fix, auto-loads person-name ASR variants from your people roster, and reads per-domain context files that prime the AI pass for context-dependent homophones. Triggers when working with ASR/STT output containing recognition errors, homophones, garbled technical terms, person-name errors, or Chinese/English mixed content. Also triggers on requests to clean up meeting notes, lecture transcripts, interview recordings, or any text produced by speech recognition. Use this skill even when the user just says "fix this transcript", "clean up these meeting notes", or mentions garbled names without invoking ASR specifically.
---
# 转录纠错器

**默认模式：Claude 内置 AI（原生 AI 纠错）——无需任何外部 API 密钥。**
Stage 1 字典纠错（免费、即时）→ Claude 自己读原文做智能纠错 → 复合词进入字典。
Stage 3 API 仅用于无 Claude Code 的自动化批处理场景（备选）。

两阶段纠错流程：先执行确定性的字典规则（即时、免费），再进行由 AI 驱动的错误检测。纠错结果会累积存储在 `~/.transcript-fixer/corrections.db` 中，随着时间推移不断提高准确率。

**各阶段实际擅长的内容**（用于校准预期，而非硬性规则）：字典最擅长处理*反复出现的*错误——产品名称、常见同音词，以及你以前纠正过的任何内容——而且成本和延迟均为零。但对于刚建立的数据库、高质量 ASR（例如来自 Whisper、Otter、飞书或腾讯会议等强大引擎的转录文本），或专业领域（金融、医疗、法律），字典通常几乎匹配不到任何内容——剩余错误往往是它从未见过的专有名词和领域术语。在这些情况下，AI 阶段实际上承担了几乎所有真正的纠错工作。应将 Stage 1 视为针对已知重复错误的低成本预过滤器，而不是主要纠错器；如果它在一份干净的转录文本中只修改了寥寥几行，也不必惊讶。

## 前置条件

所有脚本都使用 PEP 723 内联元数据——`uv run` 会自动安装依赖项。需要安装 `uv`（[安装指南](https://docs.astral.sh/uv/getting-started/installation/)）。

以下命令使用相对脚本路径（`scripts/<name>.py`），因此只能从该技能自身的目录中运行——而在智能体运行环境中，shell 的工作目录会在每次调用之间重置，这会导致第一条命令就出现 `Failed to spawn: scripts/fix_transcription.py`。**请从调用该技能时输出的 "Base directory for this skill" 行中获取技能目录**，然后在同一条命令中先 `cd` 到该目录，或者为每个脚本路径添加该目录前缀。不要依赖 `$CLAUDE_SKILL_DIR`——至少在某些运行环境中它并未设置（已于 2026-08 验证），因此基于它构建的命令会以本想避免的同一种错误失败。如果你已经找不到调用时输出的那一行，`find -L ~/.claude ~/.codex -name SKILL.md -path '*transcript-fixer*'` 可以定位该技能包——但它会返回数十个结果，包括每个已安装的*版本*，以及备份、暂存副本和编辑前快照——而第一个结果并不是最新版本。跳过路径中包含 `skill-before`、`-workspace`、`source-sync-backups`、`.tmp` 或 `.staging` 的任何结果。在剩余结果中，优先选择版本号最高的目录；某些安装位置（例如市场检出的副本或另一个智能体的技能目录）完全没有版本号，因此如果最终需要在这些目录之间选择，请选取修改时间最新的目录，并在信任它之前，将其内容与本文件进行合理核对。

## 快速开始

```bash
# First time: Initialize database
uv run scripts/fix_transcription.py --init

# Single file — Stage 1 runs in SAFE MODE by default: only low-risk
# (non-word, high-confidence) corrections auto-apply. Medium/high-risk ones
# (common words, <=2-char, real-word fragments) are written to
# *_needs_review.md for you / the AI pass to judge, not applied silently.
uv run scripts/fix_transcription.py --input meeting.md --stage 1

# Trust ONE project domain's rules (recommended for batches): rules of the
# domain you explicitly pass via --domain apply at every risk level — they were
# hand-confirmed for this project's vocabulary, so domain match = trust. The
# roster and everything else keep safe-mode deferral. One pass instead of three
# (safe run -> review sidecar -> --apply-all rerun).
uv run scripts/fix_transcription.py --input meeting.md --stage 1 --domain myproject --apply-domain

# Sibling domains load together (comma-separated) — one project's vocabulary
# often lives in several domains that grew at different times (myproject,
# myproject-alt, ...), and a transcript that straddles them should be fixed in
# ONE pass, not one rerun each. --apply-domain trusts the whole union.
uv run scripts/fix_transcription.py --input meeting.md --stage 1 --domain myproject,myproject-alt --apply-domain

# Which domains does this project even have? A 0-correction run prints the
# hint listing every OTHER domain with its rule count — read it, then rerun
# with the siblings added. (Write commands like --add stay single-domain.)

# Apply EVERY risk level regardless of origin (the pre-safe-mode behavior).
# Higher false-positive risk — only when you've reviewed ALL loaded rules.
uv run scripts/fix_transcription.py --input meeting.md --stage 1 --apply-all

# Dry run: preview all Stage 1 changes (with risk levels) without writing *_stage1.md
uv run scripts/fix_transcription.py --input meeting.md --stage 1 --dry-run

# Extract likely ASR errors without applying any corrections
uv run scripts/fix_transcription.py --extract-uncertain -i meeting.md -o ./review

# Batch: multiple files in parallel (use shell loop)
for f in /path/to/*.txt; do
  uv run scripts/fix_transcription.py --input "$f" --stage 1
done

# ⚠️ STOP — Stage 1 alone is NOT the job. It is the pre-filter, not the
# corrector: on clean ASR (Feishu / Tencent / Whisper) the dictionary often
# matches almost nothing, and the Native AI pass below does essentially all
# the real work. Reporting "transcript clean" after Stage 1 alone is the
# recurring failure this skill exists to prevent (real case, 2026-08: an
# ingest pipeline ran Stage 1 on a 73-min transcript, got 0 hits, declared
# it clean — 54 errors were later found by the native pass it skipped).
# "The dictionary applied N fixes" does not change this either.
# "Done" = Stage 1 → Native AI Correction → --add the confirmed fixes.
```

在 Stage 1 之后，Claude 会读取输出并使用内置能力修复剩余的 ASR 错误（无需 API key）——**这是主要路径，即使只是快速生成转写稿，跳过此步骤也不是有效的捷径**（“快速、干净”的转写稿恰恰是字典能力最弱、最需要内置能力通读检查的场景）。完整方法——按置信度分类、核实而非猜测、二次检查、待检查列表——请参阅下方的 **内置 AI 校正**；该节是权威依据。对于快速、干净的转写稿，该流程可简化为：如果存在对应领域的上下文文件，则读取该文件（`~/.transcript-fixer/contexts/<domain>.md`）→ 通读全文 → 直接修复明显的一次性错误 → 使用 `--add` 将任何重复出现或项目特有的错误（尤其是姓名）添加到 `--domain` 字典中，以便下次自动修复（参见“项目特定及人名校正”）。**如果你在 Stage 1 后就结束，必须明确说明为何不适用内置校正环节——“流水线运行了脚本”不构成理由。** 仅有以下情况可以豁免：人类用户明确将本次运行的范围限定为字典校正环节（调用方流水线中固定配置的“运行 Stage 1”并不属于此豁免——参见下方的“由另一个 skill 调用时”），或者你有证据表明该转写稿已经执行过内置校正环节（文件中带日期的备注或采集日志）。“转写稿看起来很短/很干净”、“字典已经应用了 N 项修复”和“我赶时间”均不属于豁免情况——它们正是失败所在。

有关具体的输入/输出操作演示，请参阅 `references/example_session.md`。

### ⚠️ Stage 3 API — 备选方案（仅限无 Claude Code 的自动化批处理）

**如果你正在 Claude Code 里运行此 skill，跳过本节——直接用上面的 Stage 1 + Native AI Correction，不要跑 `--stage 3`。**
Stage 3 是给 CI/脚本/无 Claude 环境的批量自动化用的，需要额外配置 GLM API key。

```bash
# 备选: 仅限无 Claude Code 的批处理
export GLM_API_KEY="<api-key>"  # From https://open.bigmodel.cn/
uv run scripts/fix_transcript_enhanced.py input.md --output ./corrected
```

有关完整的配置文件格式，请参阅 `references/installation_setup.md`；有关 GLM 端点的详细信息，请参阅 `references/glm_api_setup.md`。

## 核心工作流

具有持久化学习能力的两阶段流水线：

1. **初始化**（一次）：`uv run scripts/fix_transcription.py --init`
2. **添加领域校正项**：`--add "错误词" "正确词" --domain <domain>`
3. **阶段 1 — 字典校正**：`--input file.md --stage 1`（即时、免费）
4. **阶段 2 — AI Correction（默认: Claude 内置 AI）**：Claude 读取 Stage 1 的输出，并使用内置能力修复剩余错误——**这是主要路径，无需 API key**。完整方法请参阅下方的 **内置 AI 校正**。备选: `--stage 3` API 模式仅限无 Claude Code 的自动化批处理(需额外配置 GLM API key——见上方 §⚠️ Stage 3 API)。**在 Claude Code 内不要跑 `--stage 3`。**
5. **保存稳定模式**：每次会话后使用 `--add "错误词" "正确词"`
6. **审核学习到的模式**：使用 `--review-learned`，并通过 `--approve` 批准高置信度建议

**领域**：`general`、`embodied_ai`、`finance`、`medical`、`tech` 或自定义领域（例如 `legal`、`gaming`）
**学习机制**：AI 重复执行的校正会写入 SQLite 历史记录；`--review-learned` 会将高置信度的重复模式转化为待处理建议，而 `--approve FROM TO` 会将完全匹配的建议提升为字典条目。

### 新增安全与审查命令

- **安全模式是阶段 1 的默认模式**：仅自动应用低风险（非单词、高置信度）更正；中/高风险更正（常用词、≤2 个字符、真实词片段）会记录到 `*_needs_review.md`，而不会静默应用。因此，在干净的转录稿上出现 **`Applied: 0` 是正确行为，并非错误**——高风险规则正在 `*_needs_review.md` 中等待你或 AI 处理步骤进行判断。传入 `--apply-all` 可应用所有风险级别的规则（即旧有行为）；`--review` 保留为已弃用的空操作。此变更重新接入了此前虽已计算却被忽略的风险分类器——但它并不能消除所有误报：`from_text` 为 4 个及以上字符有效短语的规则仍会被评为低风险并自动应用（参见 `references/false_positive_guide.md` →“4 个及以上字符真实词盲区”）。
- **应用前预览更改**：`--dry-run` 会将阶段 1 中计划进行的每项更改及其风险级别写入 `*_dryrun.md`。
- **始终生成更改报告**：`--changes-file` 会将每项更正的更正前内容、更正后内容及风险写入 `*_changes.md`（在安全模式下默认启用）。
- **面向调用方的机器可读状态**（`--json`）：在标准输出中打印一行 `{applied, deferred, output_path, needs_review_path, input_unchanged, review_enqueued}`（该次运行的人类可读日志会被重定向到标准错误）。使用方应读取此状态，而不是通过磁盘上是否存在 `*_stage1.md` 来推断是否未执行任何操作——`input_unchanged: true`（或 `output_path: null`）**才是**某个领域未执行任何操作的权威信号。这是一项跨 Skill 契约（调用方的预分类链会使用它）；请保持字段名称及语义稳定（`review_enqueued` 是以附加方式新增的字段：表示有多少项安全模式下延后的内容进入了持久化审查队列——参见“审查队列与仪表板”）。不使用 `--json` 时，人类可读输出保持不变。
- **提取不确定的 ASR 词元**：`--extract-uncertain -i file.md` 会将疑似错误（较短的全大写词元、音译片段、重复词）写入 `*_uncertain.md`，而不会更改原文件。
- **加载领域预设**：`--load-presets tech` 会导入一组精选的技术/Claude Code ASR 更正规则。
- **报告误报**：`--report-false-positive "<from_text>" "<to_text>" -d domain` 会禁用错误的字典规则（传入规则中存储的 from→to 对——对于误报规则，它与语义上的错误→正确方向相反；参见原生 AI 更正步骤 2）。
- **审计高风险规则**：`--audit` 会标记看起来可能导致误报的现有规则（常用词、≤2 个字符、子字符串冲突，以及——使用 jieba 时——4 个及以上字符的真实词短语）。**它仅供参考：只会呈现候选项，绝不会禁用任何内容。** 是否禁用应由人工决定——请逐项手动审查，并先备份数据库，因为审计无法了解你的上下文，且会将大量正确规则误标（例如，从一般角度看，`GDP 5.5→GPT 5.5` 似乎不正确，但对于大量讨论 AI 的用户而言，这是一项正确修复）。参见 `references/false_positive_guide.md`。

### 由另一个 Skill 调用时（跨 Skill 调用契约）

此技能通常会接入另一个技能的摄取管线——例如，meeting-sync 技能会在归档转录稿之前，将阶段 1 作为预分类钩子运行。调用方管线会改变一个容易悄无声息地引发问题的假设，因此调用方必须遵循此契约，否则将遭遇以下两个已验证的故障之一：它会运行阶段 1，几乎不应用任何更正，却报告成功（延迟处理的更正被悄无声息地丢弃——见下一节）；或者，它会运行阶段 1，完全跳过原生处理流程，并报告转录稿没有问题（见下文“**阶段 1 就是整个脚本调用**”段落）。**此契约包含两个必须遵守的要求；只遵守第一个要求，会让第二种故障在一种误以为操作正确的错觉下随之交付。**

**故障模式（已验证、可复现）。** 安全模式不会应用中高风险更正，而是将它们延迟写入 `*_needs_review.md`。对于你手动编辑的单个文件，这没有问题——接下来读取伴随文件即可。但调用方管线通常会在 `TemporaryDirectory` 中运行 transcript-fixer，并且只从中读回已更正的 `transcript.txt`。**`*_needs_review.md` 伴随文件位于该临时目录中，并会随目录一起被删除**——因此，字典中超过 95% 的更正会悄无声息地消失，而运行仍报告“完成”。在对一份 95 分钟的转录稿和一个包含 108 条规则的领域进行实际测量时，安全模式应用了 **2/108**，并将 **106 条延迟到一个随后立即被丢弃的伴随文件中**。该次运行看起来没有问题，但已知更正中只有约 2% 真正生效。随后，用户不得不手动再次运行 transcript-fixer，才能应用其余 98% 的更正。

**调用方规则——对于经人工确认的项目领域，请传递 `--apply-domain`。** 管线接入的领域（其配置中的 `domains:` 列表）正是那些规则已经由人工针对该项目词汇进行整理的领域。其中的领域匹配并非猜测，而是已经确认的修复，因此管线应当像批处理运行一样信任它：

```bash
# CORRECT for a caller pipeline — trust the configured project domains
uv run scripts/fix_transcription.py --input "$staged" --stage 1 \
  --domain "$domain" --apply-domain --json
```

使用 `--apply-domain` 后，同一次包含 108 条规则的运行会以低风险应用 **97/97**，而不是 2/108。`general` 领域（兜底领域，整理程度较低）可以继续使用安全模式——只有项目特定领域获得了完全信任。如果调用方无法传递 `--apply-domain`，则必须从 `--json` 状态对象中读取 `deferred`，并选择以下方式之一：将 `*_needs_review.md` 伴随文件持久化到非临时位置，供下游流程处理；或者，将非零的 `deferred` 计数作为失败信息呈现给用户。悄无声息地丢弃延迟处理的更正并报告成功，就是这个缺陷。

**`--json` 状态行是契约接口。** 它会在标准输出的一行中打印 `{applied, deferred, output_path, needs_review_path, input_unchanged}`。`deferred` 是绝不能悄无声息地丢失的数字。`input_unchanged: true` / `output_path: null` 是表示“此领域有 0 项更正”的权威信号——不要根据磁盘上是否存在 `*_stage1.md` 来推断是否无操作（正是这种文件存在性检查曾经中止了整个处理链并丢弃更正）。请保持这些字段名及其语义稳定；调用方的预分类处理链依赖它们。

**互补的一面：让词典保持活跃。** 调用方流水线只有在其项目领域词典得到充分填充时，才能真正从 `--apply-domain` 中获益。下游原生校正流程所做的每一项已确认校正，都应通过 `--add` 添加回该领域（`--add "ASR-variant" "correct" --domain <project>`），这样下次摄取时就会自动修正，原生校正流程的工作量也会持续减轻。冷启动领域词典 + `--apply-domain` 仍然几乎不会应用任何校正——正确做法是将 `--apply-domain` 与持续执行 `--add` 的纪律结合起来。

**第 1 阶段是完整的脚本调用——但绝不能是整个任务。** 上述约定可防止第 1 阶段静默丢弃其自身的校正；但它并未涉及那项在干净转录稿上承担大部分工作的校正流程。如果调用方在第 1 阶段后就停止，它交付的将是一份原生 AI 校正流程从未审阅过的转录稿，却将其报告为干净。因此，调用方的摄取步骤必须执行以下两者之一：要么自行运行原生 AI 校正流程（将已归档的转录稿交给某个已**加载此 skill** 的代理〔也可以是当前代理〕——必须加载该 skill，而不只是提供脚本路径；无代理的 CI 自动化则改为通过上述第 3 阶段 API 流程完成），要么向用户明确显示“仅完成第 1 阶段”，将其标记为未完成状态，绝不能报告为成功。还要注意此 skill 接入方式中的陷阱：如果调用方仅通过脚本路径引用它（例如某个 `transcript_fixer.script_path` 配置项），就永远不会加载此文件，因此其中的所有约定——包括本约定——对于该次运行都是不可见的。只接入脚本路径而不接入 skill，正是导致 2026-08“命中 0 项、宣布干净、漏掉 54 个错误”事故的配置。

**修正后，始终将可复用的校正保存到词典中。** 这是此 skill 的核心价值——完整检查清单请参阅 `references/iteration_workflow.md`。

### 修正后添加到词典

完成原生 AI 校正后，审查所有已应用的修正，并决定应保存哪些修正。使用以下决策矩阵：

| 模式类型 | 示例 | 操作 |
|-------------|---------|--------|
| 非词语 → 正确术语 | 克劳锐→Claude, cloucode→Claude Code | ✅ 添加（误报风险为零） |
| 生僻词 → 正确术语 | 拉行链→LangChain, 哈金费斯→Hugging Face | ✅ 添加（先确认它不是一个真实存在的词） |
| 人名/公司名 ASR 错误 | 卡帕西→Karpathy, Anthropics→Anthropic | 对于**经常出现的重要人物**，应改为添加到你的**人物名册**中（参见下文的“人物名册”）——它能够携带关系上下文，并在数据库重置后继续保留。对于仅出现一次的名字：✅ `--add --domain`（稳定、唯一） |
| 常用词 → 上下文相关词 | 争→蒸, 减→剪, affect→effect | ❌ 绝不能作为规则添加——应改为在该领域的上下文文件中记录此陷阱及其消歧线索（参见“领域校正上下文”） |
| 真实品牌 → 另一品牌 | Xcode→Claude Code, Clover→Claude | ❌ 跳过（它们在其他上下文中是真实存在的词） |
| 真实姓名 → 另一真实姓名 | `李明`→`黎明`（不同项目中的两个真实人物） | ❌ 绝不能作为规则——其风险与真实品牌 → 另一品牌相同，但它会错误篡改真实人物的姓名。应改为将其作为带有消歧线索的领域上下文陷阱（参见原生 AI 校正第 4 步中根据用户判定所做的细化） |

**折中方案，而且它只适用于标有 ❌ 的行中的一行。***常见词 → 上下文词*这一行（`争`→`蒸`）禁止将**无锚点的**常见词作为规则，因为它会在该词每次被正常使用时触发。但这并不禁止使用包含足够上下文的相同修正，使该短语只出现在误听情况下——`村里商量` → `<name>商量` 尚可辩护，而仅使用 `村里` 则会非常鲁莽。**这并不放宽*真实姓名 → 另一个真实姓名*这一行的限制，而且绝不能通过锚定将其加入词典**：正如该行本身所述，应将其保留在领域上下文文件中。

之所以维持这项排除，是因为**对于人名，无论验证器给出什么结果都不可信。**`--add` 会运行 jieba 检查，当 FROM 侧可拆分为全部已知词语时发出警告，而一个姓名是否算作“已知”只是 jieba 词典造成的偶然结果：经测量，`李娜商量` 会触发警告（`李娜` 的词频为 438），而 `张伟商量` 不会触发警告（`张伟` 未登录，词频为 0）。因此，一条以姓名为锚点且顺利通过的规则说明不了任何问题，而一条触发警告的规则同样说明不了任何问题。对于这种会在未来每份转写稿中波及真实人名、却没有可靠信号可供判断的类别，该行必须排除在外。（同样的推理也排除了*真实品牌 → 另一个品牌*这一行：`Xcode`→`Claude Code` 在一个项目中是正确的，却会在下一个项目中毁掉构建日志，而任何验证器都不知道你当前身处哪种情况。）

**警告与错误的区别，因为它们会导致不同的结果。**`valid_phrase` 警告表示*需要人工复核*，**而不是** *已被拒绝*——规则仍会被添加，且 `--add` 以状态码 0 退出。`common_word` 和 `both_common` 是**错误**：`--add` 以状态码 1 退出且不写入任何内容，只有 `--force` 才能绕过。`substring_collision` 则可能是*两者中的任一种*，具体取决于触发了哪个分支——命中经过整理的冲突映射时属于错误，而范围更广的动态检查只会发出警告，规则仍会写入。因此，应查看退出状态，而不是被输出的动静误导：一次声势浩大的添加操作可能已经成功，而一条你以为已保存的规则可能根本不在数据库中。只有在看清楚是*哪项*检查提出异议后才应使用 `--force`，因为它也会让阻断性检查失效。

有一个注意事项决定了锚定规则是否值得添加：应锚定到**反复出现的搭配**，而不是某个只出现一次的句子片段。某个特定句子的片段永远不会再次匹配——它占用一个词典条目，却无法产生复用价值，而失效条目正是导致领域加载缓慢且难以审核的原因。如果连搭配都显得过于狭窄，则应将这个陷阱连同用于消歧的线索放入领域上下文文件中。

**添加前先测量语料库——验证器看不到你的项目。**内置安全检查回答的是“这是不是一个真实存在的中文词语”；它们无法回答真正决定是否应添加项目领域规则的问题：*“当这个词出现在本项目的转写稿中时，它有没有可能表达其真实含义？”*这是一个实证问题，而获取证据只需一条命令：

```bash
# How does this term actually appear across the project's transcripts?
uv run scripts/fix_transcription.py --probe "候选误识词" --corpus /path/to/transcripts/

# Or probe as part of the add itself (prints the evidence before writing):
uv run scripts/fix_transcription.py --add "候选误识词" "正确词" --domain myproject \
  --check-corpus --corpus /path/to/transcripts/
```

该探针会输出每个文件中的出现次数以及抽样的上下文窗口，并附带判定规则：如果每个抽样出现位置都是 ASR 错误 → 使用无锚定规则是安全的；只要存在任何真实语义 → 使用锚定形式，或者不要添加规则（改为在领域上下文文件中记录这个陷阱）；出现次数为零 → 无锚定规则的风险为零，但也不会产生任何复利效应。它消除的意外情况是：直觉认为“这显然是一个错误形式”，但经过 30 秒的扫描后，却发现该词在整个语料库中承载着完全真实的语义；反过来也可能，一个“真实词语”在语料库中的每一次出现其实都是误听，这使得无锚定规则是安全的，而词语检查器原本可能会吓得你不敢使用它。

在一个会话中批量添加多项纠正：
```bash
uv run scripts/fix_transcription.py --add "错误1" "正确1" --domain tech
uv run scripts/fix_transcription.py --add "错误2" "正确2" --domain business
# Chain with && for efficiency
```

## 审核队列与仪表板（不确定项 → 一键裁决）

已确认的纠正会通过词典不断积累复利；而**不确定**的纠正过去却会消失——原生处理流程会在聊天中列出它们（会话结束后便不复存在），安全模式下延后处理的项目存放在 `*_needs_review.md` 辅助文件中（使用临时目录的调用方会将其丢弃），而学习得到的建议则一直等在一个无人运行的 CLI 后面。审核队列为这三类项目提供了位于 `corrections.db`（`review_items`）中的统一持久化归宿，而仪表板让裁决它们几乎不费力——正是这种操作阻力横亘在“AI 怀疑存在错误”和“词典学会答案”之间。

**队列 CLI**（全部支持 `--json`）：

```bash
# Enqueue uncertain items (native pass step 7 does this; '-' reads stdin)
uv run scripts/fix_transcription.py --enqueue-review items.json
# Inspect
uv run scripts/fix_transcription.py --list-review            # pending, priority-sorted
uv run scripts/fix_transcription.py --show-review 12         # full evidence + action pack
# Decide (agent path — humans use the dashboard)
uv run scripts/fix_transcription.py --resolve-review 12 --decision accepted --by reviewer
uv run scripts/fix_transcription.py --resolve-review 12 --decision overridden --override-to "正确词" --note "<evidence>"
uv run scripts/fix_transcription.py --resolve-review 12 --decision kept_original   # transcript was right
uv run scripts/fix_transcription.py --resolve-review 12 --decision reopen          # undo (reverts applied edits)
```

每个项目都包含：原始文本（在文件中保持不变）、预填充的建议、`kind`（`entity`/`unknown` 排在队列前面——它们会复利积累到词典和名册中；`homophone`/`wording` 排在后面）、搜索阶梯所产生的证据，以及一个可选的**操作包**，该操作包会在接受时执行：`file_edit`（替换转录文本中的内容）、`dict_add`（添加到一个 `--domain` 词典）、`append_note`（将一条陷阱说明添加到领域上下文文件）。如果没有操作包但有文件锚点，则默认执行单个 `file_edit`。

**失败时关闭的锚点保护机制**：系统会根据当前文件状态在内存中规划整个操作包（每次编辑都会根据操作包中此前操作执行后留下的内容进行验证），只有当所有操作都规划成功后，才会向磁盘写入任何内容——原始文本缺失（文件在项目入队后已被编辑）、存在歧义（出现多次，且在行提示附近没有唯一的最优匹配），或上下文发生漂移（附近没有任何行与入队时记录的片段匹配）→ 不会写入任何内容，CLI 以退出码 2 退出并返回一个 `{"error": "re_anchor_needed"}` 状态对象，而该项目会保持待处理状态。错误的自动编辑比漏掉一次编辑更糟。机器调用方应解析 stdout 中的 `error` 字段，而不是仅依赖返回码（argparse 用法错误也会以退出码 2 退出）。当决策为 `overridden` 时，只会运行重新定向后的 `file_edit`；针对原建议的 `dict_add`/`append_note` 操作会被丢弃（它们原本是为已被人工否决的建议而规划的）。（一项范围说明：仅当原始内容出现**多次**时才会执行上下文检查——唯一出现的位置不存在需要拒绝的相似匹配，因此单次出现的编辑无需检查片段即可应用。）

**当保护机制拒绝时：`--reanchor-review` 可修复该条目。** 拒绝并非死路，也绝不意味着应绕过队列手动编辑文件——那会导致该条目永远处于待处理状态，并且编辑未经审计。先执行重新锚定，然后再次裁决：

```bash
uv run scripts/fix_transcription.py --reanchor-review <id> [<id>...]
# file itself is gone (moved/renamed/cleaned)? add search root(s):
uv run scripts/fix_transcription.py --reanchor-review <id> --reanchor-root <dir-with-transcripts>
```

系统会根据磁盘当前状态修复两种漂移情形，且两者均遵循失败关闭原则：**上下文/行漂移**（文件入队后被编辑——在文件中重新定位 `original`，优先选择仍与已记录上下文片段匹配的行，而非仅依据距离，并刷新行号和逐字上下文）和**文件消失**（在已记录的父目录以及每个 `--reanchor-root` 中搜索包含 `original` 的 `*.md`；恰好找到一个候选文件时会重新指向锚点，找不到时不做任何更改，找到多个时则要求使用 `--reanchor-to FILE`——即显式指定目标的形式；如果其中不含 `original`，该形式本身也会被拒绝）。成功重新锚定后，保护机制的上下文检查将会通过，`A`/`W`/CLI 解析会照常进行（显式操作包会将其 `file_edit` 路径重写为新文件的路径）。拒绝消息本身会指明此命令。（根因追溯至 2026-08-03：使用意译上下文入队的条目永远无法完成裁决——人工覆盖在保护机制处失败，并且在此命令出现之前，文件被绕过队列手动编辑。）

**提升每个 `decision_note`；队列只负责存储它。** 仪表板的备注字段和 CLI 的 `--note` 会记录审核者的理由，但两者都不会将该理由转化为可复用的规则。完成一批审核后，检查完整的队列 JSON：

```bash
uv run scripts/fix_transcription.py --list-review --review-status all --json
```

人类可读的列表从不输出 `decision_note`。人类可读的 `--show-review` 仅在条目不再处于 `pending` 状态后才输出该字段；JSON 则始终包含该字段，包括被 `reopen` 恢复为 `pending` 的条目。检查每个备注非空的条目，无论其状态为何，并且不要预先投射可能会丢弃审核者所提供字段的字段列表。

应根据备注的含义而非裁决结果来确定其去向：

| 备注内容 | 将其提升到 | 不要 |
|---|---|---|
| 某个表面错误实际上是有意且取决于上下文的替换 | 领域上下文文件，并注明用于判断何时应保留该替换的线索 | 使用 `--add`，因为这会重写文本 |
| 某条字典规则在不应触发的地方触发了 | `--report-false-positive "<from>" "<to>" -d <domain>` | 在上下文备注背后继续启用该规则 |
| 某个稳定的 FROM→TO 修正会在此领域中反复出现 | `--add "<from>" "<to>" --domain <project>`，但须遵守下文的真实单词规则 | |
| 某个反复出现的人名具有不直观的拼写 | 人员名册，该名册需手动编辑 | |

`decision_note` 从来都不是操作。预先规划的 `append_note` 操作仅在其条目为 `accepted` 时运行；`overridden` 会丢弃特定于建议的 `dict_add` 和 `append_note` 操作，而 `kept_original` 和 `skipped` 不运行任何操作。裁决后应显式提升该备注。这与下文的 **“覆盖本身不会产生复合效果”** 属于同一缺口：修正后的文本止于 `resolved_text`，而理由止于 `decision_note`。

**入队会逐字验证锚点——编写错误会在入队时失败，而不是等到裁决时。** 当一个条目声明了一个可读的 `file` 时，`--enqueue-review` 会检查 `original`（以及提供了 `context` 时的 `context`）是否逐字出现在其中，并修正超出唯一匹配项解析窗口（±3 行）的行号提示（窗口内的提示可以直接使用，因此会保持不变；修正信息会输出到标准错误）。其他任何情况都会当场被拒绝并给出原因，运行将以状态码 3 退出——JSON 会将被拒绝的条目放在 `rejected_unanchored` 下（`added` 下的条目已经入队；请修复被拒绝的条目并重新将它们入队）。`context` 必须逐字从文件中复制；改写会使锚点在周边内容首次编辑时发生漂移。（尚不存在的文件不会被验证——例如，为另一台机器上的文件入队的条目；这种情况由解析时的防护机制负责。`stage1_deferred` 条目同样豁免——它们的 `from_text` 是引擎在内存中应用先前规则后不断演变的文本，此时尚未出现在输入文件中是合理的。）

**一次裁决只修复一处——你需要自行清扫其他同类项。** 一个已解析的条目只会编辑一个文本范围。当原始文本出现多次时，防护机制不会全部编辑：它会选择上下文匹配且最接近所记录行号提示的出现位置；如果无法做出选择——完全没有行号提示、提示附近没有匹配项，或两个出现位置与提示的距离相同——则会拒绝（`re_anchor_needed`）。无论哪种情况，其他出现位置都会保留下来，**包括裁决刚刚编辑过的同一行上的其他位置**，而重复名称最有可能出现在这里。对一个真实批次的统计结果是：十个条目得到解析，其中四个还遗留了另外六处出现位置，而其中两处位于裁决已经修改过的行上。因此，裁决批次还有后半部分：

```bash
# 1. See what was actually decided. The default listing shows PENDING only —
#    the items you just resolved are precisely the ones it hides.
uv run scripts/fix_transcription.py --list-review --review-status accepted
uv run scripts/fix_transcription.py --list-review --review-status overridden
# 2. Read the verdict that was recorded, per item.
uv run scripts/fix_transcription.py --show-review <id> --json
```

**替换内容应取自 `resolved_text`，绝不能取自列表行。** 对于覆盖操作，人工输入的文本会进入 `resolved_text`，而 `suggested_text` 仍保留他们*拒绝*的建议——并且供人阅读的列表会打印该建议。根据该行进行传播，会把被拒绝的答案应用到所有剩余出现位置，这比不处理它们更糟。覆盖内容是自由文本，因此在传播之前应先阅读它：否则，一次输入的拼写错误可能会变成五处拼写错误。

使用 Edit 修复剩余出现位置，或者使用限定于**这一个文件**的 `sed`——这是对人工已作出决定的文件内传播，而不是批处理规则所禁止的跨文件查找替换——然后重新使用 grep 进行确认。

**只清扫 `entity` 类型的条目。** `homophone` 或 `wording` 裁决是针对*那个句子*作出的判断——它们属于第 5 步所述需要锚定到周边文本的上下文相关类别，也正是 `争`→`蒸` 这一行所排除在一揽子规则之外的类别。将其中一项传播到整个文件，正是词典矩阵旨在防止的错误。

**而在 `entity` 内，裁定所确定的是该实体，而不是每个听起来像它的 token**——这是第 4 步的例外规则，保持不变。如果某次出现指的是一个*被提及的*第三方，而不是正在被称呼的人（“我会向银行的 `<token>` 询问”），那么它完全可能需要相反的处理：保留它，并将其单独加入队列。人工**通过听取某一个音频片段**得出的裁定也应当同样谨慎对待——那几秒音频只能确定那一次话语，而第二次出现就是另一次话语。清扫那些显然以相同含义指向同一实体的出现位置；这是通常情况，也是上述测量所统计的情况。

**应在整个批次都处理完毕后再进行清扫，而不是在各次裁定之间进行。** 如果仍待处理的项目锚定到了某个已被清扫的出现位置，该项目将无法通过保护检查（`re_anchor_needed`，退出码 2），并且必须重新加入队列。

**覆盖操作本身不会产生累积效果——请用 `--add` 完成它。** 当状态为 `overridden` 时，队列会丢弃 `dict_add` / `append_note` 操作（这些操作原本是为人工拒绝的建议而规划的），因此整个循环中最强的信号——人工亲自纠正 AI——反而成了唯一一种永远不会进入词典的情况，除非你明确将其加入：
`--add "<original>" "<resolved_text>" --domain <project>`，同时须遵守上述真实词规则。

**仪表板**（单一审核者，本地运行）：

```bash
uv run scripts/review-dashboard/server.py   # opens http://127.0.0.1:8767
```

Prodigy 风格的单焦点卡片：实时显示文件上下文并高亮锚点行，预先填入建议，展示证据，并以键盘操作为优先——
`Q` 播放该话语 · `A` 接受 · `R` 原文正确 · `W` 覆盖
（输入正确文本）· `S` 跳过/无法判断 · `Z` 撤销 · `↑↓`/`J K` 导航
（裁定键有意集中在左手区域；右手保持操作鼠标）。环境变量调节项：`REVIEW_DASHBOARD_PORT`（默认值为 8767），
设置 `REVIEW_DASHBOARD_NO_BROWSER=1` 可跳过自动打开浏览器标签页。
读取操作直接访问数据库（只读）；**每次写入都会通过 shell 调用 CLI**，
因此状态机、锚点保护检查和审计日志仍是唯一事实来源，而智能体（CLI）与人工（页面）拥有同等的写入权限。

**音频播放（`Q`）**——审核者通常无法仅凭文本判断一段含混不清的话语；听取原始音频中的那一秒即可作出判断。转录稿必须在 frontmatter 中显式声明其录音文件，才能选择启用此功能（不会隐式扫描目录——如果缺少该字段，卡片就不会显示播放按钮）：

```yaml
---
date: 2026-08-02
minute_token: abc123
audio: /absolute/path/to/recording.m4a
---
```

`audio:` 这一行是你需要添加的；其他行代表转录稿中已有的任意内容。它被**刻意写成不带任何修饰的形式**——原因见下文；还要注意，这个示例经常被逐字复制，以至于该行末尾的 `#` 注释不止一次作为真实 bug 被发布出去。

**请将这一行添加到转录稿已有的块中——不要追加第二个块。** 同步后的转录稿通常自带 frontmatter（`date`、`minute_token`、`participants`……），而解析器会在遇到第一个 `---` 终止标记时停止，因此其下方的第二个块永远不会被读取。

**直接写值——末尾不要添加注释。** 解析器会获取第一个冒号之后的所有内容（`line.split(":", 1)[1].strip()`），且不会移除 `#`，因此 `audio: /path/x.m4a  # same timeline` 会被解析为一个以 `# same timeline` 结尾的路径，而该路径并不存在。块的格式同样如此：它必须从第 1 行开始，以对应的 `---` 结束，并且键必须顶格书写，不得缩进。

上述任何一种错误都会以相同的方式失败——卡片上**既没有播放按钮，也没有错误提示**，看起来就像“这份转录没有音频”。如果你原本预期某张卡片应当有音频却没有，请先检查前置元数据，再怀疑录音本身。

该文件必须与**转录时间戳所指向的时间线完全相同**——也就是实际输入 ASR 的那个文件。由 1.3 倍速输入生成的转录只能与 1.3 倍速文件配对；如果将它与原始文件配对，每个片段都会播放错误的时间段。

仪表板会根据锚点前后的说话人时间戳行（`<speaker> HH:MM:SS.mmm`）确定片段时间窗口，通过 HTTP Range 流式传输文件（即时跳转，无需完整下载），并且只播放该段话；当剪切点落在句子中间时，`± 3s` 会扩大时间窗口。每个录音来源都应验证一次时间线配对（`ffprobe` 时长 ≈ 转录的最后一个时间戳）——速度倍率不匹配会导致所有位置都播放错误的时间段。

**为飞书妙记转录接入音频**（当转录来自 minutes-sync 流水线时，这是常见情况）——使用随附的脚本，它会完成下载和时间线检查，并输出前置元数据行：

```bash
uv run scripts/fetch_minute_audio.py \
  --token <minute-token> --profile <lark-cli-profile> \
  --output ~/.transcript-fixer/cache/audio/<name>.m4a \
  --transcript <path/to/transcript.md>
```

**这两个参数都来自转录正文之外。** `--token` 是转录自身前置元数据中的 `minute_token:` 字段（minutes-sync 流水线会将其写入其中；如果该字段不存在，妙记 URL 的最后一个路径段就是同一个值）。`--profile` 是 lark-cli 配置文件名称——使用 `lark-cli profile list` 列出这些配置文件，并选择属于该录音所有者账号的配置文件；转录中不会记录它，因此如果无法确定所有者，应询问而不是猜测（错误的配置文件会以上述静默方式失败）。

请将音频保存在文档仓库之外——媒体二进制大文件不应随仓库一起进入 git。

**退出代码**——检查状态，而不是输出：诊断信息会写入 stderr，而 `audio:` 行会写入 stdout，因此即使某次运行没有验证任何内容，仍会输出一行看似可用的内容。

| 代码 | 含义 |
|---|---|
| `0` | 已验证——音频与转录使用相同的时间线 |
| `1` | 时间线不匹配：文件已下载，但**不要**接入该文件 |
| `2` | 已下载，但配对未经验证——`ffprobe` 不存在或其输出不可用、未提供 `--transcript`、转录中没有 `<speaker> HH:MM:SS.mmm` 行，或者所有这些行都是 `00:00:00`（调用格式错误时 argparse 也会以代码 2 退出；其消息会明确说明这一点） |
| `3` | 未生成任何可用内容——`--transcript` 路径错误（会在进行任何网络操作之前检查），或获取失败：lark-cli 报错、curl 失败、下载内容过小，或者 **`--profile` 无法读取该妙记**；这是最常见的原因，并非 token 错误 |

因缺少说话人时间戳行而产生的 `2` 值值得停下来处理，而不是设法绕过：仪表板正是根据这些行构建音频片段窗口，因此，关联到此类转录文本的音频将没有任何可播放的内容。

**手动操作方式**，适用于 lark-cli 不可用或脚本执行失败的情况：

```bash
mkdir -p ~/.transcript-fixer/cache/audio && cd $_   # --output below accepts only
                                                    # a relative path inside the
                                                    # CURRENT dir ("../" refused)
LARK_CLI_NO_PROXY=1 lark-cli minutes +download \
  --minute-tokens <token> --profile <profile> --output ./audio.m4a
# If that trips the SSRF guard, take the signed URL and fetch it yourself.
# Parse the envelope as JSON — a regex scrape leaves escapes literal and
# truncates the URL at its first parameter:
URL=$(LARK_CLI_NO_PROXY=1 lark-cli minutes +download \
        --minute-tokens <token> --profile <profile> --url-only \
      | python3 -c 'import sys,json
raw = sys.stdin.read()                      # the CLI may print prose around the
s, e = raw.find("{"), raw.rfind("}")        # JSON, so isolate the object first
print(json.loads(raw[s:e+1])["data"]["download_url"])')
[ -n "$URL" ] || { echo "no download_url — check the profile"; exit 3; }
curl -sSL --noproxy '*' -o audio.m4a "$URL"
# Verify the pairing yourself: compare the duration against the transcript's
# LAST speaker timestamp. Treat a gap over max(60s, 5% of that timestamp) as a
# mismatch — recordings usually run a minute or two past the last utterance,
# but a speed-rate mismatch shows up as a large proportional gap.
ffprobe -v quiet -show_entries format=duration -of csv=p=0 audio.m4a
```

脚本编码了以下三项处理逻辑，而手动操作时，每一项都可能导致实际故障：

- **lark-cli 自身的 SSRF 防护机制会拒绝它自己的下载主机。**错误信息是
  `blocked download URL: local/internal host is not allowed`——飞书的
  签名下载域名确实名为 `internal-api-drive-stream.…`，而
  `internal-` 前缀会触发该防护机制。回退方案是使用 `--url-only`，再通过你自己的
  `curl -L` 下载，这也正是脚本所执行的操作。
- **`--url-only` 返回的封装内容是真正的 JSON——应解析它，而不是进行模式匹配。**
  URL 位于 `data.download_url`（是嵌套字段，而非顶层字段），使用正则表达式抓取会使
  `&` 等 JSON 转义字符保持为字面值，从而生成一个在第一个参数处就被截断的 URL，并导致下载到
  重定向存根而不是音频。`json.loads` 可以原生处理这种情况，而手动编写提取逻辑正是产生
  此类转义错误的根源。
- **妙记是按租户、按用户归属的资源，因此通常出问题的是 `--profile`，
  而不是 token。**来自其他租户的 profile——或者妙记从未共享给其所属用户的 profile——
  可以正常完成身份验证，但仍然不会返回 `download_url`。请传入录音所有者账户对应的
  profile。

在将你打算通过听音频来评判的条目加入队列**之前**关联音频
（第 4 步会将跨语言专有名词路由到那里）——否则，审核者打开卡片时将看不到播放按钮，也无法回答你提出的问题。

**阶段 1 集成**：安全模式下暂缓处理的内容会在运行时自动加入队列
（`source: stage1_deferred`），因此调用方即使丢弃 sidecar 文件，也不再会丢失这些内容。例外情况：位于操作系统临时目录下的输入不会加入队列
（暂存副本消失后，锚点将成为失效指针）——`--json` 中的 `deferred` 计数仍会向调用方报告这些内容，而新增的
`review_enqueued` 字段则表示其中有多少内容已进入队列。

## 防止误报

添加错误的词典规则会悄无声息地破坏未来的转录文本。**添加任何纠正规则之前，请先阅读 `references/false_positive_guide.md`**，对于短词（≤2 个字符）或在普通文本中本来就可能正确出现的常见中文词语，尤其要如此。

## 项目专属与人名纠正（通过 `--domain` 隔离）

对于**反复出现的项目专属错误**——人名、项目术语、内部代号——最重要的处理模式是使用 `--domain` 标志。这也是对上述误报担忧的*解决方案*：某个人名修正在**你的项目中**可能是正确的（例如 ASR 总是识别错误的一位队友的名字），但它也可能与其他人的转录文本中某个真实存在但拼写不同的人名发生冲突——因此绝不能将其加入全局（`general`）词典。

`--domain` 通过隔离这些规则来确保安全：

```bash
# Add the rule under an isolated, project-named domain (not 'general')
uv run scripts/fix_transcription.py --add "<ASR-garbled-name>" "<correct-name>" --domain <project>
# Apply ONLY that domain's rules to this project's transcripts
uv run scripts/fix_transcription.py --input meeting.md --stage 1 --domain <project>
```

通过 `--domain <project>` 添加的规则，只有在纠正时传入 `--domain <project>` 才会生效。其他项目（使用它们自己的域或默认的 `all`）不会受到影响——因此，即便是有风险的短词／常见词人名规则也是安全的，因为它只会在该规则确实正确的项目中生效。

### 为什么这优于一次性脚本（核心价值，请勿跳过）

面对一份——或整批——充斥着相同 ASR 错误人名的转录文本，最容易想到的做法是快速编写一个 `sed` / `python` 查找替换命令。**不要这样做。** 这是使用此 Skill 时最严重的反模式：

- 一次性脚本只能修复*当前这批内容*，之后相关知识便会消失：下一批、下周、下一个项目，你还得从头重写。它无法积累收益。
- 词典则会**持续积累收益**：只需执行一次 `--add`，今后所有转录文本都会通过 `--stage 1 --domain <project>` 自动纠正。将这一条命令接入项目的摄取步骤，人名从此便会永久、自动得到修正。
- 词典具备误报防护机制（短词警告、`audit` 命令、`--report-false-positive`）；原始的 `sed` 则没有任何此类保护，会悄无声息地破坏形似的词语。

**经验法则：反复出现或项目专属的错误 → `--add ... --domain <project>`（可持续积累收益）。绝不要使用一次性的 sed/python 替换。** 只有在确实仅出现一次、永远不会复现的修正场景中，才可以接受一次性脚本——即便如此，使用词典通常也更省力。

ASR 对中文姓名尤其不稳定：同一个人可能被识别成十几个同音变体（在一个真实项目中，某个姓名曾出现 13 种以上的 `[姓变体]×[名变体]` 组合）。请使用 `--add --domain <project>` 记录每个已确认的变体，以便在今后的每次运行中将它们全部归并为规范姓名。


### 人员名册（长期人员姓名 SSOT）

对于姓名总是被 ASR 错误识别的**重要常驻人员**
（同事、客户、家人、工作坊参与者），应维护一个作为人员姓名 SSOT 的**人员名册**
Markdown 文件，而不是逐个将其添加到数据库。
当 `~/.transcript-fixer/config.json` 中设置了 `people_roster_path` 时，
Transcript-fixer 会在 Stage 1 阶段自动从此名册加载人员姓名纠正规则。

**名册格式**（规范格式：`### Name` + `- **ASR 变体**: variant1, variant2`）：
```markdown
### Nina Zhao
- **ASR 变体**: Nena, 妮娜

### 小雨
- **ASR 变体**: 晓雨, 小宇老师
```

这两种示例形式都值得照着使用。中文语句中说出的英文名字会产生*两种*
变体——拼写错误（`Nena`）和中文音译（`妮娜`）——而中文昵称则会产生
同音变体以及带敬称的形式（`小宇老师`）。请列出你实际见过的每一种形式；
每一种形式都会成为一条自动生效的规则。

**设置**（仅需一次）：
```bash
# Edit ~/.transcript-fixer/config.json and add:
#   "paths": { "people_roster_path": "/path/to/people.md" }
```

此后，每次 `--stage 1` 运行都会自动合并名册中的纠正规则
（仅存在于内存中——绝不会写入数据库）。发生冲突时始终以数据库为准，因此
名册只会填补空缺，不会覆盖手动调优的条目。解析器请参阅
`scripts/core/people_roster.py`。

**优先级分为三层，第三层限定于域，而名册是全局的**——这种不对称性
最容易让人感到意外：

1. 在本次运行所属域中生效的数据库规则优先。
2. 否则，由名册提供该纠正对。
3. **除非**该纠正对已在本次运行所属域中被禁用——此时名册中的对应规则也会
   被抑制，并且运行时会输出 `🚫 People roster: N variant(s) suppressed`。

第三层按域生效，因此使用 `--report-false-positive
--domain A` 停用某个纠正对，并**不会**使它在 `--domain B` 中失效：名册是全局的，
而在 B 中没有任何规则阻止它，因此该规则仍会继续生效。这是有意为之的
（在一个域中属于误报的规则，在另一个域中往往是正确的），但这意味着“我已经
禁用它了，它却仍然生效”几乎总是因为运行使用了*另一个域*——在编辑名册前
请先检查这一点，因为编辑名册会一次性在所有位置停用该纠正对，包括共享同一
文件的其他项目。`--report-false-positive` 现在会列出该纠正对仍然生效的域，
并以 `3`（已在此处禁用）或 `4`（仅存在于名册中，没有可禁用的数据库记录）
退出，以便自动化程序将这两种情况与真正的失败区分开来。

**何时使用名册，何时使用 `--add` 添加到数据库：**

| 人员 | 添加位置 | 原因 |
|--------|-------|-----|
| 长期反复出现（同事、客户、家人、工作坊参与者） | **people.md** | 带有关系上下文的 SSOT；数据库重置后仍可保留 |
| 一次性出现或次要姓名 | **数据库**（`--add --domain`） | 快捷，无需上下文 |

**姓名变体爆炸——同一个人，名字首辅音却各不相同。** 一个人的姓名即使已被说话人分离工具标注过一次，在正文中仍可能分裂成一整个变体家族，有时甚至横跨*不同的首辅音*（在一次 56 分钟的通话中，同一个姓氏被听成了 h/f/w/g/zh——2026-08-08 的真实案例：一名说话人出现了七种不同的姓氏首辅音）。这并不是一个需要逐个追查变体的 bug；它其实是典范姓名问题的另一种表现。应将其作为一个整体处理：

1. **先确定典范姓名**——询问用户或采用说话人分离标签，确定一种拼写，然后再全面清扫。如果没有确定典范姓名就处理变体家族，只会产生七个不完整的修复和一份混乱的名册。
2. **一次性清扫文件中的所有变体**（对单个文件使用一次 `sed` 命令包含所有变体，然后重新 grep，直至结果为零），不要逐个变体处理。
3. **在名册的 `ASR 变体` 行中记录整个家族**——包括你实际看到的每一种形式，即使再怪异也要记录。下一份转写稿还会产生这个家族的新成员，而名册能在家族不断扩大的同时保持典范姓名稳定不变。
4. **敬称形式（`X老师` / `X总`）也是变体**——敬称是说话人实际说出的内容，因此绝不能将其*替换*为不带敬称的姓名，但其中的姓氏应接受同样的清扫，并记入同一份名册条目。

**对话中途给出的裁定应立即累积——绝不要推迟处理。** 当你仍在工作时，用户回答了有关姓名或数字的问题（在消息中途给出更正，或用一个词回答你的候选列表），这一裁定就是整个循环中最强的依据，而且立即记录它不费任何成本：修复文件，对已确认的变体执行 `--add`，并在**同一轮**更新名册/上下文——不要等到“批次结束后”，因为延后处理的事项往往就此丢失。在一次真实的批处理会话中，四项对话中途给出的裁定都在收到的当轮完成了累积（2026-08-08），其中一项还纠正了审阅者自己关于版本号的过时训练数据。如果用户的裁定与你的搜索结果相矛盾，应以用户裁定为准，而不是将其视为需要再次核查的异常。

## 领域纠错上下文（各领域的 AI 先验知识）

词典负责确定性替换；人员名册负责姓名。还有第三类错误无法安全地放入其中任何一处：**依赖上下文的同音词**——只有在特定讨论语境中才是错误的词。例如，在讨论每天制作 N 个视频片段的会议中，将 `减`→`剪`；又或者在财经通话中，某个常用词与股票代码昵称发生冲突。针对常用词设置词典规则，会在不知不觉中破坏其他所有转写稿；而通用 AI 处理又缺少足以让它自信修正的领域先验知识——它要么猜错，要么把问题留给人工处理。（真实案例：一份转写稿中出现了四处 `减到 N 条`，实际全都应为 `剪到`；AI 处理虽有所怀疑，但在没有领域先验知识的情况下不敢修改，用户只得手动修正。）

领域上下文文件填补了这一空白。每个领域对应一个 markdown 文件，存放在**用户空间**中，与 `corrections.db` 和 `people.md` 并列（绝不要放在 skill 包内部——这样它既能在 skill 更新后继续保留，也能确保项目知识的私密性）：

```
~/.transcript-fixer/contexts/<domain>.md
```

（如果你通过 `TRANSCRIPT_FIXER_CONFIG_DIR` 重新指定了配置目录，context 文件将位于该目录下的 `contexts/` 中。）

在进行原生校正时（参见下方工作流），请先读取转录文本对应领域的 context 文件，再进行分类处理。该文件应包含以下三项内容：

1. **一行业务背景** — 该领域的录音通常涉及什么内容
2. **已知的同音字陷阱** — 每项都应附带用于消除歧义的*上下文线索*（“当句子涉及制作/编辑片段时，应使用 `剪`”），还可选择性地附上带日期的真实示例
3. **权威名称来源的指引** — 项目的别名台账、相关人员名册章节、现有数据库领域等，以便验证阶梯（下方第 4 步）知道应优先查找何处

context 文件中绝对不能包含：硬性替换规则。将 `减→剪` 作为规则既不应放入 context 文件，也不应放入词典——该文件通过先验信息和线索辅助你进行判断；它绝不授权盲目替换。每项修正仍须经过下方的置信度分类流程。

维护闭环（与词典的 `--add` 习惯相呼应）：当原生会话中出现**依赖上下文**的重复性错误时——你已在此处修正该错误，并且它还会在该领域未来的转录文本中再次出现——请将其连同用于消除歧义的线索追加到该领域的 context 文件中。确定性的非词语/名称修正仍像以前一样添加到 `--add --domain` / 名册中。

格式和完整示例模板：`references/domain_context_guide.md`。

注意：context 文件由**原生工作流**使用（由代理读取文件——不涉及代码）。API 模式（`--stage 2/3`，备用通道）目前尚未注入这些文件；如果该通道开发完成，则应将相同的文件提供给其提示词。

## 原生 AI 校正（默认模式）

在 Claude Code 中运行时，阶段 2 应使用 Claude 自身的语言理解能力——对于高质量 ASR，几乎所有真正的校正都发生在这一阶段。**根据转录文本调整投入力度。** 不要把一段 10 秒的备忘录变成研究项目，但也不要对一场 90 分钟的战略会议敷衍了事。应根据录音本身的特征选择档位，而不是凭你的心情决定：

| 指标 | **快速档**（几分钟，而非几小时） | **完整档**（整套阶梯流程都能发挥价值） |
|---|---|---|
| 长度 | 较短（≤ 约 15 分钟 / 几百行） | 较长（30 分钟以上 / 1000 行以上） |
| 说话者 | 一两人，且姓名是你已经知道的 | 3 位以上说话者，或有不熟悉的姓名 |
| 词汇 | 日常语言，无领域术语 | 领域术语密集（金融/医疗/法律/项目代号）或包含大量专有名词 |
| 重要程度 | 内部备忘录、用后即弃 | 面向客户、将提交到共享仓库、会影响决策 |

- **快速档** — 阶段 1（`--apply-domain`），如果存在领域 context 文件则读取它，完整通读一次，就地修正明显的一次性错误，并使用 `--add` 将重复出现的/项目特有的术语添加到某个 `--domain`。**跳过：**跨领域名称验证阶梯、第二遍子代理复查、待核查流程。线性处理一遍，即告完成。
- **完整档** — 执行下方所有内容：使用名称验证阶梯进行完整分类、由独立的第二遍子代理复查，并明确列出待核查清单。这样的投入是合理的，因为篇幅较长/领域术语密集的转录文本不仅错误更多，错误也更难确认，而且一旦将错误的专有名词提交到共享仓库，错误就会传播。

录音可能很长，但仍属于快速层级（两位已知说话者、语言直白）；也可能很短，但属于完整层级（一次仅 5 分钟的通话，却充斥着陌生的药品名称，而且这些内容要用于生成报告）。应根据*词汇和风险程度*确定层级，并将时长作为平局时的决胜因素——这才是真正需要下功夫的地方。

**纠正范围包括元数据行，而不仅仅是正文。** 归档后的转录稿通常包含由 ASR 生成的元数据——`Keywords:` 行、frontmatter、标题——而这些行会包含与口语正文中*相同的*识别错误（例如，正文中的每处提及都已从 `克劳锐` 纠正为 `Claude`，但 `Keywords:` 行仍然列着 `克劳锐`）。应使用相同的规则纠正它们。不存在“元数据不可改动，保持原样”这种例外：元数据同样是搜索/grep 的检索面，而且某个关键词如果仍保留 ASR 误识别后的形式，那么以后每次执行 `grep Claude` 都会悄无声息地失败，即使正文看起来已经很干净。重新 grep 最终文件以确认纠正确实生效时，也要将元数据行纳入检查范围。

1. 对所有文件运行第一阶段（字典）（如有多个文件则并行处理）
2. 验证第一阶段——与原始文件进行 diff。如果字典引入了误报，请改为基于**原始**文件进行处理，并在那里应用你的编辑。**这里出现的误报，就是你欠字典的一笔技术债**：同一条错误规则会在未来的每份转录稿上触发，直到被停用。因此，一旦发现误报——即某条规则把正确的语音改错了，尤其是“真实词 → 真实词”规则（两边看起来都是有效词，因此非词防护机制无法捕捉它们；而在使用 `--apply-domain` 时，无论风险类别如何，每条匹配规则都会应用）——例如，一条 `买买→卖卖` 规则把正确的“买买工作流”改成了“卖卖工作流”——就应在同一次会话中使用 `--report-false-positive <from_text> <to_text> -d <domain>` 将其禁用——必须严格按照第一阶段的 `*_changes.md` 中所示（From/To 列）或字典中存储的规则传入 from→to 对，而不是按照“错误词 → 正确词”的语义传入。对误报而言，这个方向有些反直觉：`买买→卖卖` 规则存储的是 `from=买买, to=卖卖`（它把正确的“买买”改成了错误的“卖卖”），因此你应传入 `"买买" "卖卖"`——也就是规则中存储的 from→to 对，因为工具正是以此作为键。调用一次即可禁用该规则并降低其置信度（工具会输出“The rule has been disabled”）；它不会在下一份转录稿中再次触发。如果这个词确实存在*歧义*（在某些上下文中正确，只在此处错误），而不是规则本身明显有误，则不要禁用该规则——应改为在领域上下文文件中记录用于消歧的线索。只修复当前转录稿却仍让陷阱保持启用，必然会让下一份转录稿再次中招。
   **而且，当输入已经经过自动纠正器处理时**（同步流水线的预分类阶段、先前的第三阶段 API 运行），你的输入就不是原始 ASR——上游纠正结果已经被直接写入，且没有证据轨迹。进行分流判断之前，请与原始来源进行 diff（调用方的原始转录稿——同步引擎通常会在纠正后的副本旁保留一份，例如 `transcript_raw.txt`——或者从源 API 重新拉取）。该 diff 会揭示两个方向相反的结果：**(a)** 每一处上游实体替换本身都应作为第 4 步分流判断中的可疑项，因为上游 AI 的“纠正”可能是流畅但错误的猜测——一个真实案例是：原始 ASR 的「新的车辆」被流水线 AI“润色”为「新出来的反馈」（语法正确、听起来合理，但实际错误：说话者说的是一个近音名称），而只有与原始内容进行 diff 才发现了这一点；**(b)** 上游已经正确修复的内容应视为定论——在提出一个实际上已经应用的修复之前，先检查 diff，否则你不仅会重复劳动，还可能把正确形式“修复”回错误形式

**如何判断上游的每一处更改——唯一有效的测试，以及无效的那个。** 对上游的每一处编辑执行第 6 步中的*声音距离*测试，并严格按照该步骤所写的方向进行：**如果两边在语音上相差太远，任何 ASR 都不可能产生这种替换，那么它就不是纠错——而是模型改写了说话者所说的内容，必须将其还原。** ASR 会听错声音；它不会把一个词换成同义词，也不会更改代词。有两种形式反复出现，而且在页面上看起来都不像错误：
   - **一个术语被替换为貌似合理的近义词。** 两个词没有任何共同的声音，因此任何引擎都不可能混淆它们——而暴露问题的是语料库层面的证据：替换后的词在项目材料的其他任何地方都没有出现，而原词则是该项目的标准词汇（即先前会议中定义过的术语）。接受任一形式之前，先在整个语料库中 grep 搜索这两种形式。
   - **代词或主语被改写。** 改写后读起来比原文*更*合乎逻辑，却悄然改变了一段话所指的人——这是事实变更，而不是转写修正。在大多数语言中，不同代词在语音上彼此无关；如果引擎把一个代词误听成另一个，它应该会把整个句子都弄得乱七八糟。

   **为什么这需要专门的测试，而不能依靠你的判断：上游纠错器以流畅度为优化目标，因此它输出的一切都读起来很好——这使得“结果是否合理？”这个检查面对这种故障时完全没有区分能力。** 仅靠阅读无法发现它，而且流水线越流畅，错误文本看起来就越可信。diff 是唯一能识别它的工具。由此产生的两个后果值得预先规划：在你自己通读之前先运行 diff，这样上游的编辑会以候选更改的形式呈现，而不是直接成为你正在校对的文本；当你确实还原某处更改时，还要全面检查你已经写下并引用了错误形式的任何内容（第 9 步中的派生文档检查——根据还原前文本编写的笔记和摘要会携带同样的错误，而且与转写稿不同，它们没有任何标记指出这一点）。
3. **加载领域先验信息，然后阅读完整转写稿。** 如果该转写稿所属领域存在 `~/.transcript-fixer/contexts/<domain>.md`，请先阅读它——它会预先提示应警惕哪些同音词陷阱，并列出第 4 步搜索阶梯所需的权威来源（参见上文的“领域纠错上下文”）。然后在提出修正之前阅读**完整的**转写稿——后文语境可以消除前文错误的歧义（开头附近被转写错误的名字，往往会在后面变得显而易见）。对于大型文件，可以分块阅读，但必须先读完整份文件再做任何决定
4. **将每个候选错误分入三个类别之一**——这种分类正是需要判断力的部分。**首先克服三种会反复导致姓名被错误分类的下意识反应**（这三种都是真实且反复发生的故障——它们会把一个本可修正的姓名直接送入“询问用户”类别）：
   - **先看说话者标签——转写稿中通常已经包含姓名。**
     在搜索任何地方之前，先收集文件中的说话者标签集合；
     如果一个转写错误的词元在声音上与其中某个标签匹配，那么它几乎肯定就是
     同一个人，而标签提供了正确拼写——标签复制自姓名
     *登记表*（由人工标注录音，或者来自说话人分离工具进行匹配时所依据的
     参会者名单／声纹注册信息），而正文则是对语音声音进行的原始
     ASR。这里有四项限定条件，其中第一项不可省略。
     **(a) 仅将其应用于正在被称呼或正在自我介绍的姓名，绝不能应用于
     被提及的姓名。** “你好，<词元>”和“我的名字是<词元>”可以识别一位
     说话者；“我会问一下银行的<词元>”所指的是第三方，而此人的姓名可能
     只是恰好与某位说话者的姓名*听起来相似*——将其改写成某位说话者的姓名会损害
     一个真实人物，这正是词典表格中“真实姓名 →
     另一个真实姓名 ❌ 绝不能作为规则”所描述的风险。仅仅因为这一点，同一个文件中
     两个声音完全相同的词元就可能需要得出相反的答案，因此被提及的
     姓名应继续沿搜索阶梯查找，而不能在此处直接解决。
     **(b) 与所有标签进行匹配——包括但不限于该文本块
     上方的标签**——转写错误的姓名通常出现在由
     其他人说出的文本块中（`A` 问候 `B`），有时也会出现在该说话者自己的文本块中
     （自我介绍）。**(c) 标签确定这个人是谁；人员名单仍然
     决定规范拼写**——手工输入的 `Joe` 应规范为人员名单中的
     `Jo`，只更正拼写，绝不扩展长度。**(d) 人工标注的标签代表人工身份识别：
     直接采用，而且不要把该姓名放到待检查列表中，也不要要求
     用户确认——他们通过添加标签已经给出了答案。**（真实案例：对一个印在
     该说话者每个文本块上方的姓名走完了整个搜索阶梯，却一无所获，最后又要求用户
     确认。他们明明已经亲自标注了该姓名。）
     如果无法判断标签是人工标注还是自动分配，
     **则假定为自动分配**：声纹匹配可能会把一个拼写完全正确的
     姓名分配给错误的说话者，而这种情况看起来绝不会像转写错误——因此应将
     该标签视为需要通过搜索阶梯确认的强候选项，而不是
     终止条件。遇到 `说话人 N` / `Speaker N`、
     角色标签（`主持人` / `Interviewer`）、不属于说话者之一的第三方，
     或者标签本身明显有误时，继续进入搜索阶梯。只修正**正文**
     ——绝不要编辑标签或重新分配谁说了什么——并让编辑保持最小化
     （不要把一个名字扩展成没人说过的全名），同时使用 `--add` 将
     已确认的变体添加到某个 `--domain`，以便下一份转写稿能够自动修正它。
   - **根据声音而不是字形判断 ASR 错误。** 中文 ASR 错误通常是同音字／近音字替换，因此应根据发音判断“是否为同一实体？”，而不是看字符是否完全匹配。如果某个姓名被转写为 `X小Y`，而人员名单或词典中已经有 `X晓Y`（小／晓发音相同），那么这就是**同一个人 → 确信修正**——不要仅仅因为页面上小≠晓就将其降级为“不确定”。同样的逻辑也适用于外文姓名：如果其所有音节在声音上都能映射到近似同音的音译形式，就应作相同处理。词典中存在发音相似的规范形式，是*支持*该修正的证据，而不是应被忽略的不匹配。
   - **但声音相似只是确认身份的*充分*证据，而非*必要*证据——并且例外是一整个类别，而不是罕见情况。** 当一个姓名用一种语言说出，而引擎使用另一种语言转写时（中文语音中的英文名、音译姓氏），其结果在语音上可能与规范形式**毫不相关**，而且更糟的是，结果可能读起来像一个完全普通的*另一个*真实姓名。在一个经过测量的案例中，同一个人被转写成三个不同的词元，没有一个与她的姓名近似同音，而且每个都完全可能是其他人的姓名；之所以能识别这些词元，仅仅是因为三者都出现在同一位缺席负责人应当出现的位置，而最终*确认*它们的方法，是由人工听取对应几秒钟的音频。
     **这并不会推翻上面的 (a) 条。** 该规则禁止使用说话者标签作为来源，将一个*被提及的*词元解析为某个**说话者**的姓名——这种故障模式会把第三方覆盖成房间里的某个人。这里所说的类别方向正好相反：词元被解析为一位已知的**非说话者**，其规范形式来自人员名单或项目台账，并通过人工听辨而不是标签来确定。当两种情况难以区分时，以 (a) 条为准，该词元继续沿搜索阶梯查找。
     因此，一个未通过声音测试但出现在某个已知人物应当出现的位置的候选项，既**不能被忽略，也不能被改写**：将其以 `kind: entity` 加入队列，等待音频验证（仪表板中的 `Q` 正是用于此目的的工具）。即使存疑，也要把你认为最可能的候选项放入 `suggested`——完全没有建议的项目无法被接受（对其使用 `--decision accepted` 会报错），否则审核者将不得不为每张卡片重新输入答案。在加入队列*之前*连接转写稿的音频（参见仪表板的音频部分）：前言元数据会在查看时实时读取，因此稍后再添加确实能点亮播放按钮——但编辑转写稿会使行号相对于记录每个项目锚点时所使用的 ±3 行窗口发生偏移，而这才是代价高昂、难以撤销的部分。
   - **无法确定的姓名默认进入下方的搜索阶梯，而不是询问用户。** “只有用户知道这个姓名”是最常见的错误下意识反应。规范拼写几乎总是已经存在于这台机器上某个**不同项目的领域**中——因此必须一次查询**所有**领域（使用下方搜索阶梯中的跨领域 SQL），而不能只查询碰巧传递给 `--stage 1` 的那个领域，因为它可能是全新且为空的。只查询这一个领域然后放弃，看起来完全像是“我检查过了”，却没有找到明明就在那里存在的内容。
   - **确信修正**——非词、明显的转写乱码、你已经识别出的产品名称变体，或者在上下文中毫无歧义的同音词（上下文明确要求 `their`→`there`；其他所有提及都写作 `彭博` 时，将 `彭波`→`彭博`）。直接应用（第 5 步）。
   - **需要验证**——无法根据上下文确认的专有名词：人名／公司名／股票代码／产品名／地名（医学访谈中被听错的药品名、播客中研究人员的姓氏、财报电话会议中的股票代码），或者任何你无法指出具体来源的术语——即使你认为自己认得它也不例外（“我相当确定”恰恰是错误姓名混入文本的原因）。**先通过本地优先的搜索阶梯解决，再询问用户。** 对于项目／个人实体，权威拼写几乎总是已经存在于这台机器上，而 WebSearch 对内部姓名几乎毫无用处——它会返回姓名相同但身份错误的人，或者什么也找不到——更糟糕的是，一个流畅但错误的猜测会变成确信修正，之后很难被发现。按以下顺序搜索：

0. **人员名册** — `people.md`（或 `~/.transcript-fixer/config.json` 中
         `people_roster_path` 指向的任何位置）。这是你精心维护的长期重复出现人员的
         单一事实来源，其中各人的 ASR 变体标注在
         `- **ASR 变体**:` 下。如果某个错乱的姓名已在这里映射到规范姓名
         — 例如 `Nena`→`Nina Zhao`、`小宇老师`→`小雨` — 就属于
         确信无疑的修正：立即应用。**这一步取代了针对用户已经记录过的每个姓名
         逐一询问用户。**仅当确认转录中的说话者不在名册中时，才跳过此步骤。
      1. **`corrections.db` 的所有域，而不仅仅是当前的 `--domain`。**同一实体在不同项目中会分裂成不同的 ASR 变体，而此前的每次修正都已将它们归并为规范姓名 — 因此答案往往就在另一个未传给 `--stage 1` 的域中。只检查当前域然后放弃，是反复出现的失败模式。
         `sqlite3 ~/.transcript-fixer/corrections.db "SELECT from_text, to_text, domain FROM active_corrections WHERE to_text LIKE '%<fragment>%' OR from_text LIKE '%<fragment>%';"`
      2. **项目交付文档与别名台账** — 成本报告、审核表、交付物、该项目的 PKM 笔记。这些资料包含人工书写的正确拼写，是最可靠的来源。先执行 `grep -rl "<fragment>" <project-dir>`，然后阅读命中的内容。（在分类处理前加载的域上下文文件通常会明确指出项目的别名台账 — 从那里开始。）**阅读台账中的每一个姓名表，而不仅仅是看起来像“说话者列表”的那一个。**项目人员几乎总是分散在按角色划分的多个表中 — 内部说话者、外部协作者、客户侧人员、供应商/经销商侧人员、参会者 — 而你要找的人往往就在你没有打开的同级表中。如果最终确认的某个姓名无法通过上下文文件中的姓名来源清单找到，则该清单并不完整：将缺失的表加入其中，确保下次运行不会再遗漏。（参见 `domain_context_guide.md` 规则 6，了解此举所防止的失败情形。）
      3. **本地工具 / 网关 / 客户端配置 — 用于修正产品、模型和工具词汇的错乱。**充斥着产品/模型/端点讨论的转录，其事实依据通常就在用户这台机器自己的客户端配置中：LLM 网关配置档案（模型 ID、基础 URL）、编辑器/IDE 设置、CLI 配置存储、API 客户端预设。这些信息机器可读、处于最新状态且精确无误 — 一个以五种不同方式识别错乱的模型名称，可以逐字节与配置自身的模型列表匹配，包括不易察觉的后缀（真实案例：在一次关于配置模型网关客户端的通话中出现了 `cloud fiber5` / `飞豹五` / `FIVE5EM`；该客户端的本地数据库列出了带有 1M 上下文标志的 `claude-fable-5` — 所有变体都被归并，包括 `EM`→`1M`）。通用方法：找到所讨论工具的配置（常见的配置主目录、其 sqlite/json 存储），根据发音将错乱词元与其真实标识符进行匹配，并将配置条目视为接近权威的依据 — 用户说话时是在照着该界面念 ID；ASR 只能听到声音。⚠️ 配置存储可能包含机密信息：只读取所需字段（模型名称、URL），绝不要将密钥/令牌复制到转录、词典或总结中。
      4. **聊天记录时间线交叉核对 — 用于确认实际参加通话的人。**当参与者身份很重要时（说话人分离标签只是一个英文名字，或者是 `Speaker N`，且正文从未提及全名），最有力的本地证据是用户在会议时间段*前后*的聊天记录：人们会互相发送会议链接，以及通话过程中讨论的资料（配置字符串、文件、链接）。在限定为会议日期时间窗口的聊天归档中，搜索**转录本身包含的独特字符串**（通话中提到的域名、模型 ID、代号）；在该时间点包含此字符串的聊天几乎必然对应通话的另一方，而该字符串附近的消息（“正在加入”、会议开始前一分钟发出的邀请）无需根据转录内容作任何推断即可确定身份 — 这是时间线证据，而不是猜测某位说话者听起来像谁。它还可以逐字节验证聊天中包含的任何确切字符串（通话中粘贴的 ID 可以确认其自身拼写）。仅将此方法用于身份/标签问题 — 普通拼写需求通过第 0–2 级处理成本更低。真实案例的形式是：说话人分离结果显示 `Kevin`；搜索通话中提到的网关 URL 后，找到了一段私信，其中在会议开始前一分钟收到了邀请，并在通话过程中收到了三个确切的配置字符串 — `Kevin` 被确定为该私信联系人显示的全名，正文中两个识别错乱的姓氏称呼也依据证据修正为该姓氏。
      5. **记忆**（`~/.claude/.../memory/`）— 项目关系图和人员档案通常会明确记录规范姓名。
      6. **WebSearch** — 仅用于真正公开的实体（上市公司股票代码、知名研究人员、药物名称）。任何项目内部实体都不要使用。

只有在所有这些方法都无果之后，才向用户询问——而到那时，你已经证明该实体尚未记录在这台机器上，因此这次询问是合理的。得到确认的结果会成为「确定」修正；如果搜索*无法*确认，则降为「不确定」。**批量处理这些问题**：收集所有不重复的未知项，并针对每个唯一实体执行一次这套逐级查找流程，而不是每出现一次就执行一次。

      **而当用户回答时，他们的判断是 ✅ 权威结论——这是整个循环中最有力的来源——并且会在同一会话中通过三种方式产生复利。** 如果用户说「X 实际上是 Y（我在 Z 团队的同事）」，他们就为你提供了一个比任何本地文档都更有力的来源。立即兑现这一信息：① 应用修正；② 将变体持久化到能够产生复利的位置——重要且反复出现的人物应加入**人员名册**（遵循上面的名册与数据库对照表），项目术语或一次性名称应加入 `--add ... --domain <project>`（同一个 ASR 下周还会再次听错同一个名称）；③ 使用用户的原话、日期和 ✅「用户已确认」标记，将其记录在台账／名册／领域上下文中——之后的会话不应再次询问。以下是两条从惨痛经验中总结出的细化规则：
      - **在添加到字典之前，先对 FROM 侧执行冲突检查。** 如果乱码字符串本身在你的其他场景中也是一个真实姓名（另一个项目的名册中存在一个*不同的真实人物* `李明`），那么一条 `李明`→`黎明` 的字典规则就会破坏此人未来的转写结果。这类修正应作为陷阱及其消歧提示记录在领域上下文文件中（「在剪辑团队上下文中，`李明` = `黎明`」），绝不能加入字典。
      - **经确认正确的实体也值得记录。** 当用户确认某个名称原样就是正确的（「他是一位真实存在的博主，拼写就是这样」）时，记录这一判断（在领域上下文或名册中写一行）。未被记录的「原样正确」结论，会变成下一次运行时又要浪费五分钟重新询问的问题。
   - **不确定**——你怀疑存在错误，但即使搜索后仍无法确认（一个音节对应多个真实实体；句子结构残缺）。**将原文完全保持原样**，并将其记录到待检查列表中（步骤 7）。流畅但错误的「修正」比明显的乱码更难在下游被发现——保持沉默胜过自信地猜测。
5. 高效应用确定的修正：
   - **全局替换**（唯一的非词语，如「克劳锐」→「Claude」）：如果它在多份转写稿中反复出现——大多数产品名／名称乱码都是如此——使用 `--add` 将其加入一个 `--domain`，让它在未来的每次运行中持续产生复利；对于真正只出现一次的术语，使用一次带有多个 `-e` 标志的 `sed -i ''`
   - **依赖上下文的修正**（某个词只在特定上下文中是错误的，例如在讨论蒸馏时将「蒸」识别成「争」）：使用带有更长周边短语的 sed 来确保唯一性，或者使用 Edit 工具
   - **常用词批量处理：大多数出现位置表示领域术语，但少数位置确实使用其本义**（一个高频词在其*大多数*出现位置被领域重新赋予了含义，但并非全部——剩余的本义用法恰恰体现了它是常用词）。绝不要盲目使用 `replace_all`。先用 `grep -n` 查找每个出现位置，并根据所在句子逐一判断。当绝大多数位置都表示领域含义，而只有一两个位置使用本义时，高效的处理方式是：先用 `replace_all` 将该词替换为领域术语，然后使用 `Edit` 将那一两个确实使用本义的位置改回去——这比执行 N 次单独的编辑更快，也更不容易出错，而且下面的再次 grep 会发现任何误判。真实案例：某次销售通话中，「公开」出现在 11 行里——其中 10 处实际是工勘（销售漏斗中的现场勘察阶段），只有一处是真正的「公开的渠道」；先用 `replace_all` → 工勘，然后恢复唯一一处「公开的渠道」。（当源词是常用词时，领域术语本身仍然不能加入字典——应按照「领域修正上下文」的说明，将其记录为上下文陷阱；本条仅讨论如何在一份转写稿中*应用*修正。）
   - 之后再次 grep 每个已更改的术语，确认替换已经生效，并且没有误伤你原本要保留的相似项
6. **第二遍检查——找出第一遍阅读遗漏的内容。** 一次线性阅读必然会留下残余问题：成语退化成近音表达、一个在多处都正确的术语仅在某一处出错、一个首字母缩略词被误听成另一个。务必再次扫描一遍，查找遗留问题。先采用一种成本较低的针对性方法：**陷阱扫描**——扫描文件中该领域上下文文件记录的每一种陷阱模式（该领域已知会反复产生的同音错误）。以机械化方式执行，不要手写 grep 循环（包含 30 个陷阱的上下文文件意味着需要手动执行 30 多次 grep，而疲惫的操作者最容易缩减的恰恰就是这份列表）：

```bash
   uv run scripts/fix_transcription.py --scan-traps \
     --context-file ~/.transcript-fixer/contexts/<domain>.md -i meeting.md
   ```

   每个已记录的陷阱都会连同行号和上下文窗口一起返回；已确认正确的记录（`**X = 真实实体，勿修**`）会被报告为保持原样，这样你就不会再去调查已经解决的问题；而未命中列表则让“已扫描但不存在”与“从未扫描”得以区分。三十秒即可准确检查该领域会出现的错误；一次无异常的陷阱扫描加上你的第一遍检查，足以满足快速层级的要求。对于较长或高风险的转写稿，*还要*启动一个独立的子代理（Task），让它在不了解你第一遍检查过程的情况下重新通读已修正的文件——没有第一遍检查记忆的新视角，能发现那些你已经看习惯而忽略的问题。**子代理的任务是*返回残留问题列表*，而不是重新叙述转写稿。** 为它指定输出格式和严格的数量上限，因为逐行自言自语式思考的子代理会在完成之前耗尽自己的上下文窗口（一次真实的第二遍检查在扫描一份 1131 行的转写稿时，中途触及 32k token 上限，最终没有返回任何可用内容）。正确的提示词结构如下：
   - 将范围严格限定为一个文件，禁止编辑和跨文件 grep。
   - 把已经修正的术语作为“不得再次报告”列表交给它（你已经修正了这些内容；只有*新的*残留问题才有用）。
   - 要求只输出紧凑的表格——`line | original ≤20 chars | suspected | one-line reason | confidence`——并让它在列完清单后立即停止，不要写散文式前言，不要逐行输出意识流，也不要重新推导它已经完成的修正。
   然后逐项裁决每个残留问题——子代理的列表只是**候选项，而不是结论**（一次真实运行的结果：10 行 → 接受 4 行）。让每一项都经过步骤 4 的分诊，并应用以下全部经过生产环境验证的启发式规则：
   - **接受——近似同音 + 文档内自证。** 当几行前同一目录中已经写有 `离职回购` 时，可将 `利智回购`→`离职回购`：发音相近，再加上同一文件中存在正确形式，足以定论。指代对象明确的同音词同样如此（当前件是文档而非人时，将 `他`→`它`）。
   - **拒绝——语音距离同样可以证伪。** 语音测试是双向的：发音接近是支持修正的证据（步骤 4）；发音明显不合理则是反对修正的证据。`代号`→`代码`（hào/mǎ）和 `一撮`→`一坨`（cuō/tuó）都不是 ASR 会产生的替换——这类候选项是审阅者过度解读，而不是引擎听错。**例外是步骤 4 中的跨语言专有名词类别**：在一种语言中说出的外语名称，与其规范发音相差很远也完全可能。不要在此拒绝这类项——应将其转入队列，等待音频核验。该例外由*类别*而非罕见程度定义，并且必须同时满足步骤 4 的**两个**条件：候选项是一个可能以不同于转写语言的另一种语言说出的专有名词，**并且**它出现在项目已知某个人物应当出现的位置。两项都满足 → 无论语音距离多大，都将其转入队列。缺少任意一项 → 应用此拒绝规则，就像对所有普通词和所有同语言同音词所做的那样。
   - **拒绝——ASR 能力反向检查（强先验，但并非证明）。** 如果同一引擎在同一份转写稿的其他位置正确识别了这个词，就说明对于这段音频，该词显然处于此引擎的识别能力范围内——因此，附近出现的另一种识别结果*更有可能*就是讲话者实际说出的内容，而“修正”它所需达到的证据门槛也会大幅提高。（候选项 `一条`→`一坨`：几行前已正确识别出 `一坨`，而 `一条` 本身也是口语中有效的量词搭配——两者结合足以拒绝该修正。）保持概率性判断：同一引擎确实可能把一个名字打散成十几种变体（参见“项目特定修正”）——当正确形式和候选形式都是引擎经常处理的常用词时，这项反向检查的权重最高；当它们是罕见专有名词时，权重最低。
   - **拒绝——可理解的真实词语。** `一撮` 是完全有效的量词；不要仅仅为了让一个贯穿全文的比喻保持一致，就改写可读的原话。只修正讲话者不太可能说过的内容。
   - **拒绝——无证据重构。** 没有语音依据的拟议修正（`半`→`分`）是在猜测含义，而不是纠错。
   - **最小化修改。** 修正识别错误的词；绝不插入讲话者没有说过的词（`打完`→`打算` ✓；改写为 `打算怎么` 会插入讲话者从未说过的 `怎么` ✗）。
   - **优先选择能够解释错误的最小修改——先按语音距离对候选项排序，再评判任何候选项。** 上面的规则限制一个候选项可以改动*多少*；这条规则则在多个候选项读起来都通顺时，决定*哪一个*胜出。ASR 错误是微小扰动——引擎会把听到的声音映射到它所知的最接近的词——因此，在所有都说得通的候选项中，改变音素最少的那个几乎总是实际说出的内容。普通话中一个实用的特征是：**叠词或多音节词的尾部完整保留，而只有首音节不同**，这表明可能发生了声母混淆（卷舌音/齿龈音 `sh`/`s`、`zh`/`z`、`ch`/`c`，以及 `n`/`l`、`f`/`h` 这几组），因此在断定整个词都被听错之前，应*先*搜索韵母相同、声母不同的候选项。
     **这种方法失效的地方，不是在你生成候选项时，而是在你审查已经存在的文本时**（上游修正，或你在第一遍检查中接受的修正）。审阅现有文本会让你进入验证模式：你会问“这样合理吗？”，发现它合理，然后继续往下看——完全没有意识到你拿到的只是一个候选项，而不是经过排序的一组候选项。一个改写三个音节的候选项可能完全符合习惯用法，*同时*也可能只是一次改写；唯一能够将它与只改动一个音素的候选项区分开的办法，就是同时生成两者并进行比较。因此，在审查任何已经应用的修正时，都要强制追问：**是否存在同样能够解释这一问题、但改动更小的方案？** 如果你无法回答这个问题，那么你做的只是认可，而不是核验。
   每次都应选择能返回 8 行精准结果的第二遍检查子代理，而不是返回 8000 token 叙述内容的子代理。当你处于主上下文中时，可以使用 Task；如果它不可用——例如，这些指令本身正在一个无法再启动其他子代理的子代理中运行——那就亲自再进行一次彻底且独立的重读。绝不能因为缺少工具而跳过第二遍检查。
7. **输出待检查列表，并将其加入队列**——会话结束后，聊天摘要就会消失，因此每个*不确定*项都必须写入两个位置：(a) 在提供给人工的聊天摘要中写明——行号、你保留在原位的原始文本、你的怀疑内容，以及无法确认的原因；(b) 通过 `--enqueue-review items.json` 写入持久化审阅队列（参见上文“审阅队列与仪表板”；项目字段/别名模式：`references/script_parameters.md` §Review Queue Item Schema——未知键会被静默丢弃，因此应写 `line`，而不是 `line_hint`），其中应包含相同字段以及一套建议操作，以便人工稍后在仪表板中按一个键即可解决，或者后续代理会话可以在获得新证据后通过 `--resolve-review ID --decision … --note "<evidence>"` 将其关闭。实体/名称问题使用 `kind: entity`（它们会逐步汇入词典/名册，因此在队列中优先处理）；纯措辞疑问使用 `kind: wording`。如果没有任何不确定项，请明确说明。下面是用于 `--enqueue-review` 的最小 `items.json`（每个不确定项对应一个对象；当你没有候选项时，`suggested` 可以为空——人工之后可在仪表板中填写）：

```json
   [
     {"file": "/abs/path/to/the/transcript.md", "line": 142,
      "original": "<garbled-name>", "suggested": "", "kind": "entity",
      "context": "<the whole sentence the token sits in, copied VERBATIM from the file>",
      "evidence": "speaker-label fragment near line 142; not in roster or project alias ledger — needs user confirmation"}
   ]
   ```
   **`file` 是让另外两项保证生效的关键，遗漏它会以最糟糕的方式静默失败。** 以下两项保证都以它为前提（`review_queue.py:212` 和 `:793` 都会先检查 `file_path`）：
   - *逐字锚点拒绝。* 设置 `file` 后，如果 `context` 不是该文件中的字面子串，就会**在入队时被拒绝**（退出码 3）——因此，编写错误会立即暴露，而不是拖到裁决时才出现。缺少 `file` 时，没有文件可供核对，因此改述过的 `context` 会被接受，偏差要到很久以后才会显现。
   - *默认编辑操作。* 设置 `file` 且未显式提供操作包时，接受操作会执行一次 `file_edit(old=original, new=suggested)`。缺少 `file` 时，接受操作仍会记录裁决并以 0 退出——**但绝不会修改转写稿。** 不会报错；队列只会显示 `accepted`，而文件保持不变。

   有两个关键名称，上述静默丢弃规则会在偏移一个字段的位置捕获这两种错误：裁决字段是 `suggested`（`suggested_text` 的别名），**不是 `suggestion`**——拼写错误会让仪表板上的 Accept 按钮消失，随后 `--resolve-review` 会以 *“项目 N 没有可接受的建议”* 为由拒绝执行。操作包的键是 `actions`，**不是 `action_pack`**；它是可选的——只有当接受操作还应执行 `dict_add` / `append_note` 时才提供。完整字段/别名表：`references/script_parameters.md` §审核队列项目模式。

   **`original` 只包含可疑词元，绝不能包含整个句子**——句子应放入 `context`。无论你在 `original` 中放入什么，仪表板裁决都会将其*整体替换*：接受操作会执行 `file_edit(old=original, new=suggested)`，覆盖操作则会把整个 `original` 范围替换为人工输入的文本。如果 `original` 是像「我们的民宿就完了」这样的完整分句，而人工输入的是两个字的品牌名「栖云」，整个分句都会消失——这是一起真实发生于 2026-07 的事故（#24），丢失的文字最后不得不手动补回。使用 `original: "民宿的误写词"` + `context: "…我们的民宿就完了"`，同样的裁决默认就会得到正确结果。（现在仪表板会在覆盖输入框上方显示完整替换范围，并对短得可疑的替换发出警告——但在入队时选择正确粒度，才是不增加任何成本的解决办法。）
8. 对你实际编辑的文件执行差异核验（`diff <original> <your-working-file>`）——每一处更改都应能追溯到一项分诊决定
9. 定稿并归档：
   - **主要路径（推荐）：** 对原始 `file.md` 重新运行 `--stage 1`——**直接运行，不要带 `--apply-all`**（显式指定 `--apply-all` 始终会执行更正而不会定稿，因此过期的伴随文件无法静默吞掉本次运行）。如果 `file_stage1.md` 比 `file.md` 更新，transcript-fixer 会自动将其提升为 `file.md`，并删除中间伴随文件（`_stage1.md`、`_stage2.md`、`_dryrun.md`、`_changes.md`、`_needs_review.md`、`_uncertain.md`、`_对比.html`）。这是默认的定稿方式；它具有原子性，会保留手动编辑（当 `file.md` 更新时会跳过提升），并避免 macOS 的 `mv` 别名风险。
   - **原生 AI 更正模式**（你直接编辑了 `file.md`——即上述默认工作流）：`file.md` 已经是最终输出。不需要也无法进行提升（提升保护机制会正确跳过，因为 `file.md` 比任何伴随文件都更新），因此只需重新运行一次 `--stage 1` 进行确认。**更正数为 0 的重新运行不会写入 `_stage1.md`**；如果没有延后处理任何内容，也不会写入报告伴随文件——目录保持干净，`file.md` 可直接归档。（如果文本中仍存在中/高风险词典匹配——例如你判定为误报并有意保留的内容——每次运行时都会重新生成 `_changes.md`/`_needs_review.md` 并列出这些项目；这是延后处理报告，并非定稿失败。处理完这些项目后删除报告即可。）如果重新运行确实发现了更正，请将你需要的更正应用到 `file.md`，然后再次运行。
   - **手动后备方案**（仅当你需要完全控制，或自 Stage 1 运行后 `file.md` 已被编辑时）：将更正后的内容保存回原始 `file.md`。（`file_stage1.md` 仅用于参考/差异对比；不要将其作为最终输出进行编辑。）然后将 `file.md` 复制到 `next/00-Transcripts/YYYY-MM/`（或你的归档位置），并使用一行 Python 命令删除本地伴随文件：
     ```bash
     uv run python -c "
     from pathlib import Path
     stem = 'meeting'
     for suffix in ['_stage1.md','_dryrun.md','_changes.md','_needs_review.md','_uncertain.md','_stage2.md','_对比.html']:
         p = Path(f'{stem}{suffix}')
         p.exists() and p.unlink()
     "
     ```
   - 如果需要，可以保留原始 `.txt` 或将其移入归档；否则将其删除。
   - 再次用 grep 搜索最终文件中一项你确认已应用的更正，以确认更正后的版本确实已写入。
   - **全面检查已经从这份转写稿派生出的内容——更正不会自行传播。** 转写稿并非终端产物：在落地后的数小时内，它就会被提炼为笔记、决策日志、分析、摘要和对外消息。这些内容无一例外都是根据*未更正的*文本编写的，因此你今天修正的名字在其中每一处仍然是错的——而且与转写稿不同，它们没有时间戳提醒读者该拼写可能有问题。实测案例：一个听错的人名进入了两份分析文档，并且只差一份草稿就会出现在发给所讨论对象本人的消息中。
     应有意识地限定范围。**仅检查实体更正**（姓名、公司、产品——绝不包括措辞，因为措辞按定义只与具体句子相关）。**搜索转写稿所属的项目，而不是整个知识库**——全仓库扫描会命中无关项目，而其中的“旧形式”可能指向*另一个真实人物*，这是比不检查更糟糕的唯一结果。使用 **`grep -rn`，而不是 `git grep`**：`git grep` 只搜索已跟踪文件，而数小时前刚写成的文档——正是本条所描述的情形——很可能尚未跟踪（如果想使用感知仓库的版本，请使用 `git grep --untracked`）。
     应**排除证据轨迹**，而不是去“修正”它：原始 ASR 基线（`transcript_raw.txt` 及类似文件）是步骤 2 的上游差异对比所依赖的内容，而 `_needs_review.md` / `_changes.md` 伴随文件也都*有意*保留旧形式——改写它们会破坏下一次运行与原始文本进行差异对比的能力。（无论如何，队列项目都不受影响：它们锚定的是转写稿本身，并存储在 SQLite 中，文件 grep 无法触及。）
     应逐一审核每个命中项，而不是盲目替换——这是对少量文档进行的受监督检查，而不是批处理工作流规则所禁止的不受约束的跨文件 `sed`。
   - **防止下次再发生的习惯**——这不是本次运行中的操作，而是之后处理转写稿时应遵循的规则：当你把转写稿中的专有名词引用到笔记、报告或消息中时，请在粘贴前到人员名册或项目别名账本中查证。上述全面检查是一条恢复路径，而只有在名称首次被带出转写稿时没有执行这项查证，它才会成为必要步骤。所用的核验阶梯与步骤 4 相同，只是应用时机从更正时改为导出时。
9b. **移动或改写转写稿会使队列中尚未处理的项目失去依托。** 项目会记录转写稿的绝对路径，并通过该路径解析，因此**重命名**（步骤 10）会让所有待处理项目继续指向一个已不存在的路径——此时裁决会失败并显示 `file gone: <path> — the transcript moved since enqueue`，它指出了原因，却没有提供对应的修复命令：CLI 可以入队、列出、显示和裁决，但没有重新锚定或删除功能。**提升**（步骤 9 的主要路径）更为隐蔽：文件仍然存在，因此项目会在之后因锚点文本或上下文偏移而失败。这里有两项值得提前规划的后果。**如果无论如何都要重命名，请先重命名**——在步骤 7 入队之前，而不是之后；Stage 1 期间自动入队的延后处理项，已经按当时的文件名进行了记录，因此计划重命名的转写稿应在首次运行 Stage 1 之前就使用最终名称。**如果项目已经失去依托，唯一的出路是将其裁决为 `kept_original`/`skipped`**（两者都不会执行操作，也不会因锚点而失败），**或者针对新路径重新入队等效项目**——否则，旧项目将永远保持待处理状态。归档有所不同，本身是安全的：`cp` 会保留原文件，因此锚点仍可继续工作；但这也意味着之后应用的裁决只会修正工作副本，而归档副本会保留错误——这正是上述派生文档全面检查所针对的同一种“更正不会传播”问题。
10. **文件名卫生——归档前重命名机器生成的乱码名称。** 如果转写稿的文件名只是原始 ASR 产物、设备标签或不透明的时间戳哈希（`TX02_MIC021_20260720_095909_1.3x.md`、`soundcore Work_01-01 10-36.md`、`07-12-2026 20.07.md`），那它就不是一个有用的产物。在文件进入共享仓库之前，将其重命名为人类可读的形式：`YYYY-MM-DD-HH-MM-<topic-or-speaker-summary>.md`，并根据项目情况使用中文或简短英文。标准是：人们仅凭文件名就应能识别出对应的会议。如果内容明确属于某一业务线，并且仓库约定允许，也应在 slug 中体现该业务线。
11. 将稳定模式保存到词典中（参见上文“词典条目添加”）
12. 归档前，从最终文件中清除所有剩余的 Stage 1 误报

### 常见的 ASR 错误模式

AI 产品名称经常被识别错乱。以下模式在不同转写文本中反复出现：

| 正确术语 | 常见 ASR 变体 |
|-------------|-------------------|
| Claude | cloud, Clou, calloc, 克劳锐, Clover, color |
| Claude Code | cloud code, Xcode, call code, cloucode, cloudcode, color code |
| Claude Agent SDK | cloud agent SDK |
| Opus | Opaas |
| Vibe Coding | web coding, Web coding |
| GitHub | get Hub, Git Hub |
| prototype | Pre top |
| AI | a 夜, a 爱, ai, 阿伊 — 双字母英文术语在中文语句中间说出时，会被识别为近似发音的音节（"All in a 夜吧" = "All in AI 吧"，用户于 2026-08-08 确认） |
| skill | SQL, SKU, 死抠 — 同样的双字母拆分现象，`skill` 是 AI 工具相关对话中的高频词（SQL/SKU 在其他语境中也是实际存在的词——应结合上下文判断，绝不能作为孤立的字典规则） |

**中文语句中的双字母英文模式具有普遍性**：在中文句子中说出的 `AI` / `skill` / `SDK` / `API` 足够短，因此 ASR 会将它们映射为任意发音相近的音节（包括像 `a 夜` 这样的整词混淆）。当转写内容讨论的是 AI 工具，而某串音节作为中文毫无意义、所处位置却应该是英文缩写时，应优先考虑缩写假设——然后根据发音距离进行确认，再予以修正。

人名和公司名称在不同会话中也会产生一致的 ASR 错误——务必将已经确认的人名修正添加到字典中；对于项目专属名称，请使用 `--domain <project>` 将它们隔离保存（参见“项目专属名称与人名修正”）。

### 数字：字典在结构上无法修正的类别

字典规则要求错误必须是*稳定的*——一个错误字符串对应一个正确字符串。数字错误不存在稳定的映射关系（`80` 在一段录音中会变成 `800`，在下一段中又会变成 `18`），因此无论对字典投入多少工作，都无法解决这类问题。它们也是代价最高的错误。关于实体级错误的 ASR 文献一直将数字和命名实体列为最糟糕的类别——远比总体 WER 所显示的情况严重——并指出数字的*后续*词元（首个数字之后的数字）表现甚至比首位数字更差。这一排序是此处的关键论点，而且与实际情况相符：第一组数字通常是正确的，出错的往往是尾部，而这也正是错误数字仍然读起来流畅的原因。（这类文献的二手摘要中流传着一些具体百分比；此处不予复述，因为尚未对照一手来源进行验证。如果想查看附带对应数据集的数字，请搜索 "ASR named entity error rate" / "entity-preserved ASR"。）

这里有三个子类别，每个都需要采用不同的检查方式。任何一种都不能自动套用——数字只能通过证据来确定，绝不能依靠模式：

| 子类别 | 表现形式 | 如何确定 |
|---|---|---|
| **数量级** | 同一数值在重新表述时多了或少了一个零 | 根据同一段落其他位置给出的数字进行计算；或使用第二份录音（见下文） |
| **量词丢失** | 说话者说的是“30 家/个”，却被转写为 `30+`（没有人会把“加号”直接念出来） | 下方的扫描器会找到这些情况（`orphan-plus`）；随后通常可以根据同一分句中的对象还原量词 |
| **极性颠倒** | 原本陈述的*上限*被转写为*下限*——“只能给 N”变成了“超过 N…保底” | 扫描同一会话中关于该数字的其他陈述；带有限制性情态词的那一处（只能/最多/至多/封顶/不超过/至少/起码/超过/保底/最少——脚本会输出同一列表）几乎总是真实表述，因为说话者通常只会明确陈述一次界限，之后则用较宽泛的方式改述 |

极性是最危险的一类，也是没有任何工具能够捕获的一类：句子语法正确，数字无误，但含义却被颠倒了。只要转录文本中的数字最终会进入决策文档——例如价格、上限、份额或截止日期——就值得专门仔细核读一遍。

**同一场会议的两份录音是你能获得的最有力证据。** 如果一次会议由两个独立系统录制（两个平台，或一个平台加一台本地录音设备），它们的数字错误互不相关，因此出现分歧可以定位错误，结果一致则可以确认无误。这就是 ROVER（Recognizer Output Voting Error Reduction，NIST 1997）的人工双系统版本——值得记住这个名称，因为已发表的研究解释了为何跨系统投票优于改进其中任何一个系统。不要丢弃已有会议的“冗余”第二份录音；对于最重要的那些数值，它正是一份参考转录文本。如果只有一份录音，而某个数字又至关重要，就通过此技能已有的路径靠听觉来确认：连接转录文本 frontmatter 中的 `audio:`（参见“Wiring audio for a Feishu-minute transcript”），将该数字加入复核项队列，然后在复核仪表板中按 `Q`——系统会精准播放已锚定的对应话语，让你直接听到说出的数字，而不是再次阅读它们。

**数字槽位损坏——当替换操作越界进入数字时。** 还有一种症状相同但成因不同的故障：原本针对其他内容的全局替换命中了数字内部。典型触发情形是重新标记某位说话人，而其说话人分离标签恰好是一个纯数字——全局替换该数字会修正说话人标记行，却悄无声息地破坏所有包含该数字的数值（`21 册`、`3+1`、`8.8 折`，以及标题中的日期都会丢失一个数字，取而代之的是人名）。转录文本读起来依然流畅，只有数字是错的。匹配范围越界的字典规则也会产生同样的特征。

```bash
# Scan for canonical terms sitting where a digit belongs. The needle list is the
# dictionary's own to_text values — the strings this toolchain writes INTO
# transcripts are exactly the ones that shouldn't be inside a number.
uv run scripts/scan_numeric_consistency.py transcript.md --domain <project>
```

它输出的所有内容都只是**需要核读的候选项**，绝不能作为要应用的编辑——而且极性这一类问题被刻意排除在自动化之外，因为如果一项检查总是对正常输入发出警报，人们最终就不会再运行它。

你可以自行验证的是：`scripts/tests/test_numeric_consistency.py` 使用合成测试夹具固定验证了上述承诺的两个方面——上面的每一种损坏形式都能被检测到，而曾导致此扫描器前两个版本失效的正常输入形式（术语仅仅与数字同时出现、术语位于数字*之前*、标题开头的日期、时区偏移量）则不会触发警报。使用 `uv run --with pytest python -m pytest scripts/tests/test_numeric_consistency.py` 运行测试。这些选择背后的误报*率*是在无法随附发布的私有转录文本语料库上测得的，因此无法在此复现该比率——但由此获得的行为是可以复现的。

### 高效的批量修复策略

修复多个文件时（例如，同一天的 5 份转录稿）：

0. **在进行任何修改之前，先对每个文件与原始版本执行差异比较**——如果这批文件来自某条流水线，且其预分类阶段运行过自动校正器，那么已归档的副本就不是原始 ASR：上游修改已被写入其中，却没有留下任何证据轨迹，并且每一处修改本身都值得怀疑（上游 AI 的“校正”可能是一个流畅但错误的猜测——语法完美，但内容错误）。将每份已归档的转录稿与其原始来源进行比较（同步引擎通常会在旁边保留 `transcript_raw.txt`，也可以从源 API 重新拉取），并首先对每一处上游修改进行分类研判：逐项进行发音距离测试，撤销改写，将确认无误的修改视为已解决（绝不再次提出）。这是“原生 AI 校正”第 2 步中单文件上游差异比较的批量版本——对于批处理而言，它是第 0 步，因为你之后读到的所有内容，都会受到你读的是原始文本还是校正后文本这一事实的影响。
1. **并行执行阶段 1**：一次性让所有文件通过词典处理
2. **先阅读所有文件**：在修复任何内容之前，建立对说话者、主题和重复出现的术语的整体认知
3. **编制全局校正列表**：同一场会话中的多个文件往往会重复出现许多错误（相同的说话者、相同的主题）。**如果某个错误反复出现——尤其是人名或项目术语——请使用 `--add` 将其添加到项目 `--domain`（参见上文“项目专用校正与人名校正”），而不是直接进行内联替换；这样它就能自动修复未来的每个文件，而不只是当前这批文件。**
4. **应用其余一次性校正**（使用带多个 `-e` 标志的 sed，仅用于确实不会重复出现的修复），然后应用依赖各文件上下文的修复
5. **验证所有差异**，归档所有最终文件并清理辅助文件，然后统一执行一次词典添加
6. **运行陷阱扫描**（原生 AI 校正第 6 步），一次性扫描整批文件——在通读之后，以机械方式检查该领域已记录的同音词陷阱，从而捕捉阅读时遗漏的问题
7. **集中一次性向用户核实所有不确定项，然后立即沉淀**——批处理会产生一份无法验证的候选项短名单（一个含混不清的名字、一个与你训练数据相矛盾的版本号、一个无法规范化的姓名变体）。一次性展示整份短名单（不要边处理边逐项询问）：用户可以听音频或认识相关人员，而每项判定都以相同方式落实——修复文件，使用 `--add` 将确认的变体添加到 `--domain` 词典，并在同一轮处理中将其记录到人员名册或领域上下文中。在一次真实会话（2026-08-08）中，四项此类会话中途给出的判定，都在收到判定的同一轮中完成了沉淀。与你训练数据相矛盾的版本号说法，在用户确认之前并不算错误——“当前日期是 2026 年，v4 已存在”的优先级高于对 v3 发布时间的过时记忆；应提出疑问，而不是预先判断。

### 通过动态工作流并行处理（大型批次）

对于大型批次（10 个以上文件），动态工作流——每个文件分配一个子代理并行运行——比 shell 循环更快，也能让每个文件都得到 AI 的充分关注。以下四条规则都是从惨痛教训中总结出来的；任何一条被忽略，都曾造成过实际损害：

1. **将文件列表硬编码到脚本中——不要通过 `args` 传递。** 如果 Workflow 的 `args` 字符串数组包含非 ASCII 字符、方括号或路径分隔符，它可能会悄无声息地变成空数组：脚本看到的文件数为零，不会生成任何智能体，并立即退出，同时显示类似“没有文件”的消息。纯字母数字标记可以正常传递，但文件路径应直接写入脚本主体中的 `const FILES = [...]` 字面量，并使用 `if (!FILES.length) return` 进行保护。

2. **将每个智能体的范围严格限定为一个文件，并在提示词中禁止跨文件使用 `grep -r` / `sed`。** 如果不加约束，智能体会把局部修复（“将此处的乱码术语 → 正确术语”）变成全局搜索和替换，并编辑从未包含在该批次中的无关文件。请明确指定单个文件路径，并给出“只编辑这一个文件”的明确指令。

3. **批处理完成后，先使用 `git diff` 验证，再信任结果**（适用于受版本控制的文件）：
   - 将 `git diff --name-only` 的结果与你的预期文件列表进行比对——这样可以发现任何超出其指定文件范围的智能体。使用 `git checkout` 还原这些越界修改。
   - 对已删除（`-`）的行执行 `grep`，检查绝不能发生变化的不变量。对于已进行说话人分离的转录稿，这个不变量就是**说话人标签行**——ASR 修复只能修改口述内容，绝不能更改说话人身份或将内容重新归到其他说话人名下。确认没有任何说话人行被删除或更改。

4. **在保存任何汇总后的词典建议之前，先让它们通过误报过滤器。** 并行智能体共同提出的规则远多于可以安全使用的数量——而且它们无法看到彼此的建议，因此重复和过度扩展的问题会不断累积。只保留明确无歧义的**非词语 → 正确术语**映射。如果“来源”一侧在某些上下文中是真实存在的词语，就应将其丢弃：无论它是常用词，还是只在某个领域中才算错误的术语。针对真实词语的全局词典规则会悄无声息地破坏今后所有转录稿——这正是 `references/false_positive_guide.md` 所警告的问题。（在一个真实批次中，约 80 条原始建议经过此过滤器后只剩下约 18 条安全建议。）

### 增强功能（仅限原生模式）

- **智能分段**：在符合逻辑的主题转换处添加 `\n\n`
- **减少填充词**：“这个这个这个” → “这个”
- **交互式审查**：应用修正前进行确认
- **上下文感知判断**：利用完整文档上下文消除歧义错误

### 何时改用 API 模式

对于批处理、不依赖 Claude Code 的独立使用场景，或可复现的自动化处理，请使用在 `~/.transcript-fixer/config.json` 中配置的 API 密钥（也可以使用 `GLM_API_KEY` / `ANTHROPIC_API_KEY` 环境变量进行临时覆盖）并配合阶段 3。

### API 回退机制

如果 GLM API 在重试后仍不可用，脚本会保持原始文本不变，并打印清晰的警告。如果你需要在不使用外部 API 的情况下进行 AI 修正，请在 Claude Code 中运行并使用原生模式。

## 实用脚本

**时间戳修复**：
```bash
uv run scripts/fix_transcript_timestamps.py meeting.txt --in-place
```

**将转录稿拆分为多个章节**（每个章节的时间戳都重新从 `00:00:00` 开始）：
```bash
uv run scripts/split_transcript_sections.py meeting.txt \
  --first-section-name "intro" \
  --section "main::<verbatim line that starts the next section>" \
  --rebase-to-zero
```

**词级差异对比**（建议用于审核修正）：
```bash
uv run scripts/generate_word_diff.py original.md corrected.md output.html
```

**完整的多格式差异报告**（Markdown 摘要 + unified diff + HTML + 行内标记）：
```bash
uv run scripts/generate_diff_report.py \
  original.md \
  original_stage1.md \
  original_stage2.md \
  -o ./diff_reports
```

## 输出文件

- `*_stage1.md` — 已应用字典修正
- `*_stage2.md` — 经 AI 修正的版本（API 模式）
- `*_changes.md` — 阶段 1 报告，包含风险等级和行上下文（默认在安全模式下写入，或通过 `--changes-file` 写入）
- `*_needs_review.md` — 在安全模式（默认模式）下被暂缓处理的中/高风险修正
- `*_dryrun.md` — 所有阶段 1 更改的预览，其中标注了实际运行时会应用哪些风险等级的更改
- `*_uncertain.md` — 通过 `--extract-uncertain` 提取的疑似 ASR 错误
- `*_对比.html` — 可视化差异对比（在浏览器中打开）

在原生模式下，请直接编辑原始文件并将其用作最终输出；`*_stage1.md` 是可丢弃的差异对比/参考文件（请参阅原生 AI 修正工作流）。**当 `*_stage1.md` 比输入文件更新时，重新运行普通的 `--stage 1`（不带 `--apply-all`）会自动将 `*_stage1.md` 提升为原始文件并清理附属文件**；这是推荐的最终定稿方式。`--apply-all` 永远不会进入提升流程，而是始终运行修正。修正数量为 **0** 的运行（转录稿没有问题，或在输入文件已编辑后原生模式下重新运行）绝不会写入 `_stage1.md`（因为它只会复制一份输入文件）；如果也没有任何被暂缓的修正，则完全不会写入任何报告附属文件。当安全模式确实暂缓处理中/高风险规则时，仍会写入 `_changes.md` 和 `_needs_review.md`——它们是暂缓处理报告。

## 数据库操作

**编写任何自定义查询之前，请先阅读 `references/database_schema.md`**——列名并非你直觉猜测的那样。修正列是 **`from_text` / `to_text`**（不是 `wrong_term`/`correct_term`，也不是 `original`/`corrected`）。猜错列名是这些查询因 "no such column" 而失败的最常见原因。

```bash
# Share domain dictionaries through JSON exports
uv run scripts/fix_transcription.py --export tech_corrections.json --domain tech
uv run scripts/fix_transcription.py --import tech_corrections.json --domain tech --merge

# Inspect corrections — real column names are from_text, to_text, domain
sqlite3 ~/.transcript-fixer/corrections.db "SELECT from_text, to_text, domain FROM active_corrections;"
# Count rules per domain
sqlite3 ~/.transcript-fixer/corrections.db "SELECT domain, COUNT(*) FROM active_corrections GROUP BY domain;"
# Schema version
sqlite3 ~/.transcript-fixer/corrections.db "SELECT value FROM system_config WHERE key='schema_version';"
```

## 阶段

| 阶段 | 描述 | 速度 | 成本 |
|-------|-------------|-------|------|
| 1 | 仅使用词典 | 即时 | 免费 |
| 1 + Native | 词典 + Claude AI（默认） | 约 1 分钟 | 免费 |
| 3 | 词典 + API AI + 差异报告 | 约 10 秒 | API 调用 |

## 内置资源

**脚本：**
- `fix_transcription.py` — 核心 CLI（词典、添加、审计、学习）
- `fix_transcript_enhanced.py` — 用于交互式使用的增强封装器
- `fix_transcript_timestamps.py` — 时间戳规范化与修复
- `generate_word_diff.py` — 生成词级差异 HTML
- `generate_diff_report.py` — 多格式比较报告（Markdown、统一差异、HTML、行内标记）
- `split_transcript_sections.py` — 按标记短语拆分转写文本
- `fetch_minute_audio.py` — 获取飞书/Lark 妙记的音频，验证其与转写文本使用相同的时间线，并输出 `audio:` frontmatter 行（连接仪表盘的 `Q` 播放功能）

**参考资料**（按需加载）：
- **安全性**：`false_positive_guide.md`（添加规则前阅读）、`database_schema.md`（执行数据库操作前阅读）
- **工作流**：`iteration_workflow.md`、`workflow_guide.md`、`example_session.md`、`example_session_dji_minutes.md`（录音设备→妙记的完整会话案例：文档内自证链、第二轮拒绝标准、入队粒度）、`domain_context_guide.md`（各领域上下文文件的格式与模板）
- **CLI**：`quick_reference.md`、`script_parameters.md`
- **高级内容**：`dictionary_guide.md`、`sql_queries.md`、`architecture.md`、`best_practices.md`
- **运维**：`troubleshooting.md`、`installation_setup.md`、`glm_api_setup.md`、`team_collaboration.md`

## 故障排除

`uv run scripts/fix_transcription.py --validate` 用于检查设置是否正常。有关详细的解决方法，请参阅 `references/troubleshooting.md`。

## 下一步：整理为会议纪要

修正转写文本后，如果内容来自会议、讲座或访谈，建议将其结构化：

```
Transcript corrected: [N] errors fixed, saved to [output_path].

Want to turn this into structured meeting minutes with decisions and action items?

Options:
A) Yes — run /daymade-audio:meeting-minutes-taker (Recommended for meetings/lectures)
B) Export as PDF — run /daymade-docs:pdf-creator on the corrected text
C) No thanks — the corrected transcript is all I need
```