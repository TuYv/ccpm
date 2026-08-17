---
name: transcript-fixer
description: >-
  Corrects speech-to-text transcription errors using dictionary rules and Claude's built-in AI (no external API key required — Native AI Correction is the DEFAULT). Stage 1 alone is not the job. Stage 3 API is a backup for automation without Claude Code. Builds personalized correction databases that learn from each fix, auto-loads person-name ASR variants from your people roster, and reads per-domain context files that prime the AI pass for context-dependent homophones. Triggers when working with ASR/STT output containing recognition errors, homophones, garbled technical terms, person-name errors, or Chinese/English mixed content. Also triggers on requests to clean up meeting notes, lecture transcripts, interview recordings, or any text produced by speech recognition. Use this skill even when the user just says "fix this transcript", "clean up these meeting notes", or mentions garbled names without invoking ASR specifically.
---
# 转录修正器

**默认模式：Claude 内置 AI（Native AI Correction）——无需任何外部 API key。**
Stage 1 字典纠错（免费、即时）→ Claude 自己读原文做智能纠错 → compound 进字典。
Stage 3 API 仅用于无 Claude Code 的自动化批处理场景（备选）。

两阶段纠错流程：首先执行确定性的字典规则（即时、免费），然后进行 AI 驱动的错误检测。修正会累积到 `~/.transcript-fixer/corrections.db` 中，随时间推移不断提高准确率。

**各阶段实际擅长的方面**（用于校准，而非规则）：字典最擅长处理*重复出现的*错误——产品名称、常见同音词，以及你以前修正过的任何内容——且成本和延迟均为零。但对于新建的数据库、高质量 ASR（例如来自 Whisper、Otter、飞书或腾讯会议等强大引擎的转录），或专业领域（金融、医疗、法律），字典通常几乎匹配不到任何内容——剩余错误往往是它从未见过的专有名词和领域术语。在这些情况下，AI 阶段基本承担了所有真正的纠错工作。应将 Stage 1 视为针对已知重复错误的低成本预过滤器，而非主要纠错器；如果它在一份干净的转录中只修改了寥寥几行，也不必担心。

## 前置条件

所有脚本都使用 PEP 723 内联元数据——`uv run` 会自动安装依赖项。需要安装 `uv`（[安装指南](https://docs.astral.sh/uv/getting-started/installation/)）。

以下命令使用相对脚本路径（`scripts/<name>.py`），因此只能在该 skill 自身的目录中运行——而且在 agent harness 中，shell 的工作目录会在每次调用之间重置，这会导致第一条命令就出现 `Failed to spawn: scripts/fix_transcription.py`。**请从调用此 skill 时打印的“Base directory for this skill”行中获取 skill 目录**，然后在同一条命令中先 `cd` 到该目录，或者为每个脚本路径添加该目录前缀。不要依赖 `$CLAUDE_SKILL_DIR`——至少在某些 harness 中它未被设置（已于 2026-08 验证），因此基于它构建的命令会触发原本试图避免的同一错误。如果你已无法找到调用时打印的那一行，可使用 `find -L ~/.claude ~/.codex -name SKILL.md -path '*transcript-fixer*'` 定位 bundle——但它会返回数十个结果，包括每个已安装的*版本*，以及备份、暂存副本和编辑前快照——而第一个结果并不是最新的。跳过路径中包含 `skill-before`、`-workspace`、`source-sync-backups`、`.tmp` 或 `.staging` 的任何结果。在其余结果中，优先选择版本号最高的目录；某些安装位置（marketplace checkout、其他 agent 的 skills 目录）完全不包含版本号，因此如果最终需要在这些目录之间选择，请选取 mtime 最新的目录，并在信任它之前，将其内容与此文件进行合理性核对。

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

Stage 1 之后，Claude 会读取输出并以原生方式修复剩余的 ASR 错误（无需 API key）——**这是主要路径，即使只是快速生成一份转录稿，也不能将其跳过作为捷径**（恰恰是在处理“快速、干净”的转录稿时，字典的能力最弱，而原生通读最为重要）。完整方法——按置信度分类、验证而非猜测、二次检查、待核查列表——见下方的 **原生 AI 校正**；请将该节视为唯一权威说明。对于快速、干净的转录稿，该流程可简化为：如果存在对应领域的上下文文件，则读取该文件（`~/.transcript-fixer/contexts/<domain>.md`）→ 通读全文 → 直接修复明显的一次性错误 → 对所有重复出现或项目特有的错误（尤其是姓名）使用 `--add` 将其添加到 `--domain` 字典中，以便下次自动修复（参见“项目特定与人名校正”）。**如果你打算在 Stage 1 后结束，必须明确说明原生校正为何不适用——“流水线运行了脚本”不能算作理由。** 仅有以下情况可以豁免：人类用户明确将本次运行限定为仅执行字典校正（调用方流水线中固定配置的“运行 Stage 1”不属于此豁免——参见下方“由另一个 skill 调用时”），或者你有证据表明该转录稿已经执行过原生校正（文件中带日期的说明或摄取日志中的记录）。“转录稿看起来很短/很干净”、“字典已经应用了 N 项修复”和“我赶时间”均不属于豁免——这些正是失败的表现。

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
3. **Phase 1 — 字典校正**：`--input file.md --stage 1`（即时、免费）
4. **Phase 2 — AI Correction（默认: Claude 内置 AI）**：Claude 读取 Stage 1 的输出，并以原生方式修复剩余错误——**这是主要路径，无需 API key**。完整方法见下方的 **原生 AI 校正**。备选: `--stage 3` API 模式仅限无 Claude Code 的自动化批处理(需额外配置 GLM API key——见上方 §⚠️ Stage 3 API)。**在 Claude Code 内不要跑 `--stage 3`。**
5. **保存稳定模式**：每次会话结束后使用 `--add "错误词" "正确词"`
6. **审核已学习的模式**：使用 `--review-learned`，并通过 `--approve` 批准高置信度建议

**领域**：`general`、`embodied_ai`、`finance`、`medical`、`tech` 或自定义领域（例如 `legal`、`gaming`）
**学习机制**：重复出现的 AI 校正会写入 SQLite 历史记录；`--review-learned` 会将高置信度的重复模式转换为待处理建议，而 `--approve FROM TO` 会将对应的建议原样提升到字典中。

### 新增安全与审查命令

- **安全模式是阶段 1 的默认模式**：仅自动应用低风险（非单词、高置信度）纠正；中/高风险纠正（常见单词、≤2 个字符、真实单词片段）会被记录到 `*_needs_review.md`，而不是静默应用。因此，**在干净的转录文本上出现 `Applied: 0` 是正确行为，并非错误**——有风险的规则正在 `*_needs_review.md` 中等待你或 AI 审查流程进行判断。传入 `--apply-all` 可应用所有风险级别的规则（即旧行为）；`--review` 被保留为已弃用的空操作。这重新接入了之前虽已计算但被忽略的风险分类器——但它并不能消除所有误报：`from_text` 为 4 个及以上字符有效短语的规则仍会被评为低风险并自动应用（请参阅 `references/false_positive_guide.md` →“4 个及以上字符真实单词的盲区”）。
- **应用前预览更改**：`--dry-run` 会将所有计划执行的阶段 1 更改及其风险级别写入 `*_dryrun.md`。
- **始终生成更改报告**：`--changes-file` 会将每项纠正的更改前内容、更改后内容和风险写入 `*_changes.md`（在安全模式下默认启用）。
- **供调用方使用的机器可读状态**（`--json`）：在 stdout 上输出一行 `{applied, deferred, output_path, needs_review_path, input_unchanged, review_enqueued}`（该次运行的可读日志会被路由到 stderr）。使用方应读取此状态，而不是通过磁盘上是否存在 `*_stage1.md` 来推断是否未执行任何操作——`input_unchanged: true`（或 `output_path: null`）**才是**某个领域未执行任何操作的权威信号。这是一项跨技能契约（调用方的预分类链会使用它）；请保持字段名和语义稳定（`review_enqueued` 是以向后兼容方式新增的字段：表示安全模式下有多少延后项进入了持久化审查队列——请参阅“审查队列与仪表板”）。不使用 `--json` 时，可读输出保持不变。
- **提取不确定的 ASR 词元**：`--extract-uncertain -i file.md` 会将可能的错误（较短的全大写词元、音译片段、重复单词）写入 `*_uncertain.md`，而不更改文件。
- **加载领域预设**：`--load-presets tech` 会导入一组精选的技术/Claude Code ASR 纠正规则。
- **报告误报**：`--report-false-positive "<from_text>" "<to_text>" -d domain` 会禁用错误的词典规则（请传入该规则中存储的 from→to 对——对于误报规则，它与语义上的错误→正确方向相反；请参阅原生 AI 纠正步骤 2）。
- **审计高风险规则**：`--audit` 会标记看起来可能导致误报的现有规则（常见单词、≤2 个字符、子字符串冲突，以及——使用 jieba 时——4 个及以上字符的真实单词短语）。**它仅提供建议：只会展示候选项，绝不会禁用任何内容。**是否禁用应由人工决定——请逐一手动审查每项结果，并先备份数据库，因为审计无法了解你的上下文，而且会将大量正确规则错误标记（例如，`GDP 5.5→GPT 5.5` 一般看起来不正确，但对于大量讨论 AI 的用户而言却是正确的修复）。请参阅 `references/false_positive_guide.md`。

### 被其他技能调用时（跨技能调用契约）

此技能通常会接入另一个技能的摄取流水线——例如，meeting-sync 技能会在归档转录文本之前，将 Stage 1 作为预分类钩子运行。该调用方流水线改变了一个会悄然引发问题的假设，因此调用方必须遵循此契约，否则将触发两种已验证的故障之一：它会运行 Stage 1，几乎不应用任何内容，却报告成功（延迟处理的更正被悄然丢弃——见下一节）；或者它会运行 Stage 1，完全跳过原生处理阶段，却报告转录文本没有问题（见下文“**Stage 1 就是完整的脚本调用**”段落）。**此契约包含两项必须遵守的要求；仅遵守第一项，会让第二种故障在一种误以为已经正确完成的错觉中被发布出去。**

**故障模式（已验证、可复现）。**安全模式不会应用中/高风险更正，而是将其延迟写入 `*_needs_review.md`。对于手动编辑的单个文件，这没有问题——接下来读取伴随文件即可。但调用方流水线通常会在 `TemporaryDirectory` 中运行 transcript-fixer，并且只读回更正后的 `transcript.txt`。**`*_needs_review.md` 伴随文件位于该临时目录中，并会随目录一起被删除**——因此，字典中超过 95% 的更正会悄然消失，而运行仍会报告“完成”。对一份时长 95 分钟、使用包含 108 条规则的领域的转录文本进行实际测量后发现：安全模式仅应用了 **2/108**，并将 **106 条延迟写入一个随后立即被丢弃的伴随文件**。运行结果看起来没有问题，但实际仅应用了约 2% 的已知更正。之后，用户不得不手动再次运行 transcript-fixer，才能应用其余 98% 的更正。

**调用方规则——对于经人工确认的项目领域，传入 `--apply-domain`。**流水线接入的领域（其配置中的 `domains:` 列表）正是人工已经针对该项目词汇整理过规则的领域。其中的领域匹配并非猜测，而是已确认的修复，因此流水线应像批处理运行一样信任它：

```bash
# CORRECT for a caller pipeline — trust the configured project domains
uv run scripts/fix_transcription.py --input "$staged" --stage 1 \
  --domain "$domain" --apply-domain --json
```

使用 `--apply-domain` 后，同一个包含 108 条规则的运行会以低风险应用 **97/97**，而不是 2/108。`general` 领域（兜底领域，整理程度较低）可以继续使用安全模式——只有项目特定领域获得了完全信任。如果调用方无法传入 `--apply-domain`，则必须从 `--json` 状态对象中读取 `deferred`，并将 `*_needs_review.md` 伴随文件持久化到非临时位置以供下游处理，或者将非零的 `deferred` 计数作为失败呈现给用户。悄然丢弃延迟处理的更正并报告成功，就是此缺陷。

**`--json` 状态行是契约接口。**它会在 stdout 的一行中输出 `{applied, deferred, output_path, needs_review_path, input_unchanged}`。`deferred` 是绝不能被悄然丢失的数值。`input_unchanged: true` / `output_path: null` 是“此领域有 0 项更正”的权威信号——不要根据磁盘上是否存在 `*_stage1.md` 来推断是否无操作（正是这种文件存在性检查曾经中止整个处理链并丢弃更正）。请保持这些字段名及其语义稳定；调用方的预分类处理链依赖它们。

**互补的一面：让词典保持活跃。** 信任 `--apply-domain` 的调用方流水线所能实现的价值，取决于其项目域的充实程度。下游原生处理流程每确认一项修正，都应通过 `--add` 将其添加回该域（`--add "ASR-variant" "correct" --domain <project>`），这样下一次摄取时便会自动修正，而原生处理流程的负担也会不断减轻。冷域 + `--apply-domain` 仍然几乎不会应用任何修正——解决办法是将 `--apply-domain` *与* 持续遵守 `--add` 规范结合起来。

**阶段 1 是完整的脚本调用——但绝不能是完整的任务。** 上述契约可防止阶段 1 悄无声息地丢弃自身的修正；但它并未涵盖在干净转录稿上完成大部分工作的处理流程。如果调用方在阶段 1 后便停止，就会交付一份原生 AI 修正流程从未审阅过的转录稿，并将其报告为干净。因此，调用方的摄取步骤必须满足以下两者之一：自行运行原生 AI 修正流程（将已归档的转录稿交给加载了**此技能**的智能体〔可能就是当前智能体〕——必须加载此技能，而不只是提供脚本路径；无智能体的 CI 自动化则改为通过上述阶段 3 API 流程完成），或者向用户明确显示“仅完成阶段 1”，将其标记为未完成状态，绝不能标记为成功。还要注意此技能接线方式中的陷阱：如果调用方仅通过脚本路径引用它（例如 `transcript_fixer.script_path` 配置项），就永远不会加载此文件，因此其中的所有契约——包括本条契约——对该次运行都不可见。只接入脚本路径而不接入技能，正是导致 2026-08“0 次命中、宣告干净、漏掉 54 个错误”事故的配置。

**修正后，始终将可复用的修正保存到词典中。** 这是此技能的核心价值——完整检查清单请参阅 `references/iteration_workflow.md`。

### 修正后的词典添加

完成原生 AI 修正后，检查所有已应用的修正，并决定应保存哪些修正。使用以下决策矩阵：

| 模式类型 | 示例 | 操作 |
|-------------|---------|--------|
| 非词语 → 正确术语 | 克劳锐→Claude, cloucode→Claude Code | ✅ 添加（误报风险为零） |
| 生僻词 → 正确术语 | 拉行链→LangChain, 哈金费斯→Hugging Face | ✅ 添加（先确认它不是实际存在的词语） |
| 人名/公司名 ASR 错误 | 卡帕西→Karpathy, Anthropics→Anthropic | 对于**重要且反复出现的人物**，应改为添加到你的**人物名册**中（参见下文“人物名册”）——它可以携带关系上下文，并能在数据库重置后继续保留。对于一次性出现的名称：✅ `--add --domain`（稳定、唯一） |
| 常用词 → 上下文词语 | 争→蒸, 减→剪, affect→effect | ❌ 绝不能添加为规则——应改为在相应域的上下文文件中记录此陷阱及其消歧线索（参见“域修正上下文”） |
| 真实品牌 → 其他品牌 | Xcode→Claude Code, Clover→Claude | ❌ 跳过（它们在其他上下文中是真实存在的词语） |
| 真实姓名 → 其他真实姓名 | `李明`→`黎明`（不同项目中的两个真实人物） | ❌ 绝不能设为规则——其风险与“真实品牌 → 其他品牌”相同，但它会错误篡改真实人物的姓名。应改为使用带有消歧线索的域上下文陷阱（参见原生 AI 修正步骤 4 中基于用户判定的细化规则） |

**中间路径，而且它只适用于带 ❌ 的行中的一行。***常用词 → 上下文词*这一行（`争`→`蒸`）禁止将**孤立的**常用词作为规则，因为它会在该词被合理使用的所有地方触发。但这并不禁止在同一修正中携带足够多的周边文本，使该短语只会出现在误听情形中——`村里商量` → `<name>商量` 尚可辩护，而孤立的 `村里` 则会过于冒险。**这并不会放宽*真实姓名 → 另一个真实姓名*这一行的限制，而且绝不能将其锚定后加入词典**：应按照该行本身的说明，将其保留在领域上下文文件中。

之所以维持这一排除规则，是因为**无论验证器对人名给出哪种结果，都不可信。**`--add` 会运行 jieba 检查；如果 FROM 侧可被分解为全部已知的词，就会发出警告，而某个人名是否算作“已知”纯粹取决于 jieba 词典的偶然收录情况：实测中，`李娜商量` 会触发警告（`李娜` 的词频为 438），而 `张伟商量` 不会触发任何警告（`张伟` 不在词汇表中，词频为 0）。因此，一条以人名为锚点的规则安静地通过并不能说明任何问题，触发警告同样不能说明任何问题。对于这类规则，没有可靠的判断信号，而其影响范围却会波及今后每一份转写稿中的真实人名，因此这一行仍不能加入词典。（同样的推理也排除了*真实品牌 → 另一个品牌*这一行：`Xcode`→`Claude Code` 在一个项目中是正确的，却会在下一个项目中毁掉构建日志，而且没有任何验证器知道你当前处于哪种情形。）

**警告与错误的区别，因为它们的最终结果不同。**`valid_phrase` 警告意味着*需要手动审查*，**而不是** *规则已被拒绝*——该规则仍会被添加，并且 `--add` 以状态码 0 退出。`common_word` 和 `both_common` 是**错误**：`--add` 以状态码 1 退出且不会写入任何内容，只有 `--force` 才能绕过。`substring_collision` 则可能是*二者中的任意一种*，具体取决于触发了哪个分支——命中精心维护的冲突映射时是错误，而更宽泛的动态检查只会发出警告，规则仍会写入。因此，应查看退出状态，而不要只看输出有多吵：一次输出大量警告的添加操作可能已经成功，而一条你以为已经保存的规则可能根本不在数据库中。只有在弄清楚是*哪项*检查提出异议后才使用 `--force`，因为它也会压制那些具有阻断作用的检查。

有一个注意事项决定了以锚点限定的规则是否值得添加：应锚定到**反复出现的搭配**，而不是一次性的句子片段。某个特定句子的片段永远不会再次匹配——它占用一条词典记录，却无法产生复用价值，而正是这些失效规则让领域加载变慢并且难以审计。如果即使采用搭配仍会过于狭窄，则应将这个陷阱及其消歧线索放入领域上下文文件中。

**添加之前先测量语料库——验证器看不到你的项目。**内置安全检查回答的是“这是不是一个真实存在的中文词语”；它们无法回答真正决定是否应添加项目领域规则的问题：*“当这个词出现在本项目的转写稿中时，它是否曾表达过其真实含义？”*这是一个实证问题，而获取证据只需一条命令：

```bash
# How does this term actually appear across the project's transcripts?
uv run scripts/fix_transcription.py --probe "候选误识词" --corpus /path/to/transcripts/

# Or probe as part of the add itself (prints the evidence before writing):
uv run scripts/fix_transcription.py --add "候选误识词" "正确词" --domain myproject \
  --check-corpus --corpus /path/to/transcripts/
```

探查脚本会输出每个文件的出现次数以及抽样的上下文窗口，并附带
判定规则：如果每个抽样出现位置都是 ASR 错误 → 使用无锚定规则是
安全的；如果存在任何真实含义 → 使用锚定形式，或者不要添加（改为将该陷阱
记录在领域上下文文件中）；如果出现次数为零 → 无锚定规则的风险为零，
但也不会产生任何复利效应。这能消除一种意外：直觉认为“这显然是一个
错误形式”，但一次 30 秒的扫描却发现，这个词在整个语料库中到处都承载着
完全真实的含义——反之亦然，一个“真实词”在语料库中的每一次出现实际上
都是误听，因此使用无锚定规则是安全的，而词语检查器原本可能会让你不敢使用它。

在一个会话中批量添加多项纠正：
```bash
uv run scripts/fix_transcription.py --add "错误1" "正确1" --domain tech
uv run scripts/fix_transcription.py --add "错误2" "正确2" --domain business
# Chain with && for efficiency
```

## 审核队列与仪表板（不确定项 → 一键裁决）

已确认的纠正会通过词典持续产生复利效应；而**不确定**的纠正过去常常
凭空消失——原生处理流程会在聊天中列出它们（会话结束后即丢失），
安全模式下延后处理的项目位于 `*_needs_review.md` 辅助文件中（会被临时目录
调用方丢弃），而学习到的建议则一直滞留在一个无人运行的 CLI 后面。审核
队列为这三类项目在 `corrections.db`（`review_items`）中提供了统一的持久化归宿，
而仪表板让裁决它们几乎不费力——正是这种操作阻力，一直横亘在“AI 怀疑存在错误”
与“词典学会答案”之间。

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

每个项目都包含：原始文本（在文件中保持不变）、预先填充的建议、
`kind`（`entity`/`unknown` 排在队列前面——它们会对词典和名册产生复利效应；
`homophone`/`wording` 排在后面）、搜索阶梯产生的证据，以及一个可选的
**操作包**，在接受时执行：`file_edit`（替换转录稿中的内容）、
`dict_add`（添加到某个 `--domain` 词典）、`append_note`（向领域上下文文件
添加一行陷阱说明）。如果没有操作包但存在文件锚点，则默认执行单个
`file_edit`。

**失败时关闭的锚点防护**：整个操作包会基于当前文件状态在内存中进行规划
（每项编辑都会依据该操作包中先前操作执行后留下的内容进行验证），只有当
所有操作都成功完成规划后，才会向磁盘写入任何内容——原始文本缺失（文件在
入队后被编辑过）、存在歧义（出现多次，且在行号提示附近没有唯一匹配项），
或者上下文已漂移（附近没有任何行与入队时记录的片段匹配）→ 不会写入任何
内容，CLI 以退出码 2 退出并输出 `{"error": "re_anchor_needed"}` 状态对象，
该项目仍保持待处理状态。错误的自动编辑比遗漏一次编辑更糟。机器调用方应
解析 stdout 中的 `error` 字段，而不是只看返回码（argparse 用法错误同样以
退出码 2 退出）。当使用 `overridden` 时，仅运行重新定向的 `file_edit`；
针对原建议的 `dict_add`/`append_note` 操作会被丢弃（它们原本是为已被人工
否决的建议规划的）。（关于适用范围的一点说明：只有当原始文本出现超过
一次时才会运行上下文检查——唯一出现的位置没有需要拒绝的相似匹配项，
因此单次出现的编辑无需查阅片段即可应用。）

**当守卫拒绝时：`--reanchor-review` 会修复该条目。** 拒绝并非死路，也绝不是绕过队列手动编辑文件的信号——那样会使条目永远处于待处理状态，并且编辑未经审计。请先执行重新锚定，然后再次作出裁决：

```bash
uv run scripts/fix_transcription.py --reanchor-review <id> [<id>...]
# file itself is gone (moved/renamed/cleaned)? add search root(s):
uv run scripts/fix_transcription.py --reanchor-review <id> --reanchor-root <dir-with-transcripts>
```

系统会根据磁盘的当前状态修复两种漂移情形，并且两者均采用失败关闭策略：**上下文/行漂移**（文件在条目入队后被编辑——在文件中重新定位 `original`，相比单纯依据距离，会优先选择仍与已记录上下文片段匹配的行，并刷新行号及逐字上下文）和**文件消失**（在已记录的父目录以及每个 `--reanchor-root` 中搜索包含 `original` 的 `*.md`；恰好找到一个候选文件时会将锚点重新指向该文件，未找到时不会做任何更改，找到多个时会要求使用 `--reanchor-to FILE`——即显式指定目标的形式；如果目标文件中不包含 `original`，该形式本身也会被拒绝）。成功重新锚定后，守卫的上下文检查便会通过，`A`/`W`/CLI 解析将照常进行（显式操作包中的 `file_edit` 路径会被重写为新文件的路径）。拒绝消息本身会指出此命令。（根因查明于 2026-08-03：一个使用了释义后上下文入队的条目永远无法被裁决——人工覆盖在守卫处失败，并且在此命令出现之前，文件被绕过队列手动编辑了。）

**提升每条 `decision_note`；队列只负责存储它。** 仪表板的备注字段和 CLI 的 `--note` 会记录审核者的理由，但两者都不会将该理由转化为可复用规则。完成一批审核后，请检查完整的队列 JSON：

```bash
uv run scripts/fix_transcription.py --list-review --review-status all --json
```

人类可读的列表从不显示 `decision_note`。人类可读的 `--show-review` 仅在条目离开 `pending` 状态后显示它；JSON 则始终包含该字段，包括对已由 `reopen` 返回至 `pending` 状态的条目。检查每个备注非空的条目，无论其状态如何，并且不要预先限定字段列表，以免丢弃审核者提供的字段。

请根据备注的含义而非裁决结果进行归类：

| 备注所述内容 | 将其提升至 | 不要 |
|---|---|---|
| 某个看似错误的内容实际上是有意且依赖上下文的替换 | 领域上下文文件，并注明用于判断何时应保留它的线索 | 使用 `--add`，因为它会重写文本 |
| 某条字典规则在不应触发的地方触发了 | `--report-false-positive "<from>" "<to>" -d <domain>` | 只添加上下文备注却仍让该规则保持启用 |
| 某项稳定的 FROM→TO 更正会在该领域中再次出现 | `--add "<from>" "<to>" --domain <project>`，但须遵守下文的真实词规则 | |
| 某位反复出现的人名具有不易推断的拼写 | 人员名册，该名册需手动编辑 | |

`decision_note` 绝不是操作。预先规划的 `append_note` 操作仅在其条目为 `accepted` 时运行；`overridden` 会丢弃特定于建议的 `dict_add` 和 `append_note` 操作，而 `kept_original` 和 `skipped` 不会运行任何操作。请在裁决后显式提升该备注。这与下文的 **“覆盖本身不会形成复合效果”** 是同一个缺口：更正后的文本止于 `resolved_text`，理由则止于 `decision_note`。

**入队会逐字验证锚点——编写错误会在入队时失败，而不是等到判定时。** 当某个条目声明了可读的 `file` 时，`--enqueue-review`
会检查 `original`（以及给定的 `context`）是否逐字出现在该文件中，并在 UNIQUE 匹配的解析窗口（±3 行）之外修正行号提示（窗口内的提示可直接使用并保持不变；修正信息会打印到 stderr）。其他任何情况都会被当场 REJECTED 并给出原因，运行会以状态码 3 退出——JSON 会将被拒绝的条目放在 `rejected_unanchored` 下（`added` 下的条目确实已入队；请修正被拒绝的条目并重新将其入队）。`context` 必须逐字从文件中复制；改述会在首次编辑周边内容时使锚点发生漂移。（尚不存在的文件不会被验证——例如，为另一台机器上的文件入队的条目；这种情况由解析时防护负责。`stage1_deferred` 条目也不受此限制——其 `from_text` 是先前规则在内存中应用后引擎不断演变的文本，因此此时尚未出现在输入文件中是合理的。）

**一次判定只修复一个出现位置——其他同类位置需要你自行排查。** 一个已解析的条目只会编辑一个文本跨度。当原始文本出现多次时，防护机制不会将它们全部编辑：它会选取上下文匹配且距离所记录行号提示最近的出现位置；如果无法作出选择——完全没有行号提示、提示附近没有匹配项，或两个出现位置距离提示同样近——则会拒绝（`re_anchor_needed`）。无论是哪种情况，其他出现位置都会原样保留，**包括判定刚刚编辑过的同一行中的出现位置**，而重复名称最可能出现在那里。对一个真实批次的测量结果是：十个条目得到解析，其中四个仍遗留了另外六个出现位置，而这些位置中有两个位于判定已经修改过的行上。因此，一个判定批次还有后半部分：

```bash
# 1. See what was actually decided. The default listing shows PENDING only —
#    the items you just resolved are precisely the ones it hides.
uv run scripts/fix_transcription.py --list-review --review-status accepted
uv run scripts/fix_transcription.py --list-review --review-status overridden
# 2. Read the verdict that was recorded, per item.
uv run scripts/fix_transcription.py --show-review <id> --json
```

**替换文本应取自 `resolved_text`，绝不能取自列表行。** 在覆盖判定中，人工输入的文本会进入 `resolved_text`，而 `suggested_text` 仍然保留人工*拒绝*的建议——且供人阅读的列表会打印该建议。若从该列表行进行传播，就会把被拒绝的答案推送到所有剩余的出现位置，这比保持不变更糟。覆盖判定允许输入任意文本，因此传播前应先阅读它：否则，一次输入的拼写错误会变成五处拼写错误。

使用 Edit 修复剩余的出现位置，或者使用限定于**该单个文件**的 `sed`——这是在同一文件内传播人工已经作出的决定，而不是批处理规则所禁止的跨文件查找替换——然后再次执行 grep 以确认。

**只排查 `entity` 类条目。** `homophone` 或 `wording` 判定是针对*该句子*作出的判断——它们属于第 5 步要求锚定到周边文本的上下文相关类别，也是 `争`→`蒸` 这一行所排除、不应纳入通用规则的类别。将其中一个判定传播到整个文件，正是字典矩阵旨在防止的错误。

**而在 `entity` 内，裁决针对的是该实体，而不是每个听起来与之相似的 token**——这正是第 4 步的例外规则，保持不变。如果某次出现指的是一个*被提及的*第三方，而不是正在与之交谈的人（“我会向银行的 `<token>` 询问”），那么它完全可能需要相反的处理：保留它，并将它单独加入队列。如果人工是**通过听取某一个片段**得出裁决的，也应保持同样的谨慎——那几秒音频只能确定那一次话语，而第二次出现就是另一次话语。清扫那些显然以相同含义指代同一实体的出现；这是通常情况，也是上面的度量所统计的情况。

**应在整个批次解决完毕后进行清扫，而不是在各次裁决之间进行。** 如果某个仍在等待处理的条目锚定到了已被清扫的出现，该条目的防护检查就会失败（`re_anchor_needed`，退出码 2），并且必须重新加入队列。

**覆盖操作本身不会自动完成后续步骤——请使用 `--add` 收尾。** 当状态为 `overridden` 时，队列会丢弃 `dict_add` / `append_note` 操作（这些操作原本是为被人工否决的建议规划的），因此整个循环中最强的信号——人工亲自纠正 AI——反而是唯一一种永远不会进入词典的情况，除非你使用以下命令将其加入：
`--add "<original>" "<resolved_text>" --domain <project>`，同时须遵守上面的真实词语规则。

**仪表板**（单名审核者，本地运行）：

```bash
uv run scripts/review-dashboard/server.py   # opens http://127.0.0.1:8767
```

Prodigy 风格的单焦点卡片：显示实时文件上下文并高亮锚点行，预填建议，展示证据，键盘优先——
`Q` 播放该段话语 · `A` 接受 · `R` 原文正确 · `W` 覆盖
（输入正确文本）· `S` 跳过/无法判断 · `Z` 撤销 · `↑↓`/`J K` 导航
（裁决键特意集中在左手区域；右手留在鼠标上）。环境变量选项：`REVIEW_DASHBOARD_PORT`（默认值为 8767），
设置 `REVIEW_DASHBOARD_NO_BROWSER=1` 可跳过自动打开浏览器标签页。
读取操作直接访问数据库（只读）；**每次写入都会通过 shell 调用 CLI**，因此状态机、锚点防护和审计日志始终是唯一事实来源，并且智能体（CLI）与人工（页面）拥有同等的写入权限。

**音频播放（`Q`）**——审核者往往无法仅凭文本判断一段含混不清的话语；听取原始音频中的对应几秒即可确定。转写稿必须在 frontmatter 中显式声明其录音，才能启用此功能（不会隐式扫描目录——如果缺少该字段，卡片就不会显示播放按钮）：

```yaml
---
date: 2026-08-02
minute_token: abc123
audio: /absolute/path/to/recording.m4a
---
```

`audio:` 行是你需要添加的内容；其他行代表转写稿已有的任意内容。该行**有意不加任何修饰**——参见下文，并请注意，由于这个示例经常被逐字复制，该行末尾的 `#` 注释已不止一次作为真实 bug 被带入实际代码。

**请将该行添加到转写稿已有的块中——不要在末尾追加第二个块。** 同步后的转写稿通常已有 frontmatter（`date`、`minute_token`、`participants`……），而解析器会在遇到第一个 `---` 结束标记时停止，因此其下方的第二个块永远不会被读取。

**值必须直接填写——末尾不要添加注释。** 解析器会获取第一个冒号之后的所有内容（`line.split(":", 1)[1].strip()`），且不会去除 `#`，因此 `audio: /path/x.m4a  # same timeline` 会被解析为一个以 `# same timeline` 结尾的路径，而该路径并不存在。前置元数据块的结构同样如此：它必须从第 1 行开始，以对应的 `---` 结束，并且键不能缩进。

上述每一种错误都会以相同的方式表现出来——卡片上**既没有播放按钮，也没有错误提示**，看起来就像“这份转录没有音频”。如果某张你认为应该有音频的卡片没有音频，请先检查前置元数据，再怀疑录音本身。

该文件必须与**转录时间戳所指的时间线完全一致**——也就是输入 ASR 的那个文件。从 1.3 倍速输入生成的转录只能与 1.3 倍速文件配对；如果将其与原始文件配对，每个片段都会播放错误的时间段。

仪表板会根据锚点前后的说话者时间戳行（`<speaker> HH:MM:SS.mmm`）推导片段的时间窗口，通过 HTTP Range 流式传输文件（即时定位，无需完整下载），并且只播放该段话；当切分点落在句子中间时，`± 3s` 会扩大播放窗口。每个录音来源都应验证一次时间线配对关系（`ffprobe` 时长 ≈ 转录中的最后一个时间戳）——速度倍率不匹配会导致所有位置都播放错误的时间段。

**为飞书妙记转录接入音频**（转录来自妙记同步流水线时的常见情况）——使用随附的脚本，它会执行下载和时间线检查，并输出前置元数据行：

```bash
uv run scripts/fetch_minute_audio.py \
  --token <minute-token> --profile <lark-cli-profile> \
  --output ~/.transcript-fixer/cache/audio/<name>.m4a \
  --transcript <path/to/transcript.md>
```

**这两个参数都来自转录正文之外。** `--token` 是转录自身前置元数据中的 `minute_token:` 字段（妙记同步流水线会将其写入该处；如果缺失，妙记 URL 的最后一个路径段就是相同的值）。`--profile` 是 lark-cli 配置文件名称——使用 `lark-cli profile list` 列出所有配置文件，并选择属于该录音所有者账户的配置文件；转录中不会记录这个信息，因此如果所有者并不明确，应当询问而不是猜测（错误的配置文件会以下文所述的静默方式失败）。

请将音频保存在文档仓库之外——不应让媒体二进制大文件进入其 git 仓库。

**退出码**——检查状态而非输出：诊断信息会发送到 stderr，而 `audio:` 行会发送到 stdout，因此即使某次运行没有完成任何验证，也仍然会输出一行看似可用的内容。

| 代码 | 含义 |
|---|---|
| `0` | 已验证——音频与转录使用相同的时间线 |
| `1` | 时间线不匹配：文件已下载，但**不要**将其接入 |
| `2` | 已下载，但配对未经验证——`ffprobe` 不存在或其输出无法使用、未提供 `--transcript`、转录中没有 `<speaker> HH:MM:SS.mmm` 行，或所有这些时间戳均为 `00:00:00`（调用格式错误时，argparse 也会以状态码 2 退出；其消息中会明确说明） |
| `3` | 未生成任何可用内容——`--transcript` 路径无效（会在任何网络操作之前检查），或获取失败：lark-cli 出错、curl 失败、下载内容过小，或者 **`--profile` 无权读取此妙记**；这是最常见的原因，并不表示 token 有误 |

因缺少说话人时间戳行而导致的 `2` 值得停下来处理，而不是设法绕过：仪表板会根据这些相同的行构建音频片段窗口，因此，关联到此类转写文本的音频将没有任何可播放的内容。

**手动操作方式**，适用于 lark-cli 不可用或脚本失败的情况：

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

该脚本处理了三件事，而手动操作时，每一件都可能导致实际故障：

- **lark-cli 自身的 SSRF 防护会拒绝它自己的下载主机。** 错误信息为
  `blocked download URL: local/internal host is not allowed`——飞书的
  签名下载域名确实就叫作 `internal-api-drive-stream.…`，而
  `internal-` 前缀会触发该防护。回退方案是使用 `--url-only`，再自行执行
  `curl -L`，这也正是脚本所做的操作。
- **`--url-only` 返回的信封是真正的 JSON——应解析它，不要进行模式匹配。**
  URL 位于 `data.download_url`（是嵌套字段，不在顶层），而使用正则表达式
  抓取会将 `&` 等 JSON 转义保留为字面值，导致 URL 在第一个参数处被截断，
  下载到的是重定向存根而不是音频。`json.loads` 可以原生处理此问题，而
  手写提取逻辑正是转义错误的来源。
- **妙记是按租户、按用户归属的资源，因此通常出问题的是 `--profile`，
  而不是令牌。** 来自其他租户的配置文件——或属于从未获共享该妙记的用户的
  配置文件——可以成功通过身份验证，但仍不会返回 `download_url`。请传入
  录音所属账户对应的配置文件。

请在将你希望通过听音频进行评审的条目加入队列**之前**关联音频
（步骤 4 会将跨语言专有名词路由到那里）——否则，评审者打开卡片时将看不到
播放按钮，也无法回答你提出的问题。

**阶段 1 集成**：安全模式下延后的项目会在运行时自动加入队列
（`source: stage1_deferred`），因此调用方即使丢弃伴随文件，也不再会丢失这些项目。
例外：位于操作系统临时目录下的输入不会加入队列
（暂存副本消失后，锚点将成为无效指针）——`--json` 中的 `deferred`
计数仍会向调用方报告这些项目，而新增的 `review_enqueued`
字段则表示其中有多少项目进入了队列。

## 防止误报

添加错误的字典规则会悄无声息地破坏未来的转录文本。**添加任何纠正规则之前，请阅读 `references/false_positive_guide.md`**，尤其是针对短词（≤2 个字符）或在普通文本中本就可能正确出现的常见中文词语。

## 项目特定纠正和人名纠正（`--domain` 隔离）

对于**反复出现的项目特定错误**——人名、项目术语、内部代号——最重要的处理方式是使用 `--domain` 标志。这也是对上述误报担忧的*解决方案*：某个人名纠正在**你的项目中**可能是正确的（例如 ASR 总是识别错误的某位同事的姓名），但它可能会与其他人的转录文本中真实存在、拼写不同的人名发生冲突——因此绝不能将其放入全局（`general`）字典。

`--domain` 通过隔离此类规则来确保其安全性：

```bash
# Add the rule under an isolated, project-named domain (not 'general')
uv run scripts/fix_transcription.py --add "<ASR-garbled-name>" "<correct-name>" --domain <project>
# Apply ONLY that domain's rules to this project's transcripts
uv run scripts/fix_transcription.py --input meeting.md --stage 1 --domain <project>
```

使用 `--domain <project>` 添加的规则，只有在纠正时传入 `--domain <project>` 才会生效。其他项目（使用各自的域或默认的 `all`）不会受到影响——因此，即使是存在风险的短词／常见词人名规则也是安全的，因为它只会在该规则确实正确的项目中生效。

### 为什么这比一次性脚本更好（核心价值，请勿跳过）

面对一份——乃至一整批——充斥着相同 ASR 人名识别错误的转录文本，最诱人的做法是快速使用 `sed` / `python` 进行查找和替换。**不要这样做。** 这是使用此技能时最大的一种反模式：

- 一次性脚本只能修复*这一批*内容，随后这些知识便会消失：下一批、下周、下一个项目，你还得从头重写。它无法积累复用。
- 字典能够**持续积累**：只需执行一次 `--add`，之后每份转录文本都会通过 `--stage 1 --domain <project>` 自动纠正。将这一条命令接入项目的导入步骤，人名便会永久自动得到纠正，不再需要额外操作。
- 字典具有误报防护机制（短词警告、`audit` 命令、`--report-false-positive`）；原始的 `sed` 则完全没有这些保护，会悄无声息地破坏形似的词语。

**经验法则：反复出现或项目特定的错误 → `--add ... --domain <project>`（可以持续积累）。绝不要使用一次性的 sed/python 替换。** 只有在确实只出现一次、永远不会再次发生的修复场景中，一次性脚本才可以接受——即便如此，使用字典通常也更省事。

ASR 在中文人名上尤其不稳定：同一个人的名字可能会裂变成十几个同音变体（在一个真实项目中，某个完整姓名曾被识别为 13 种以上的 `[姓变体]×[名变体]` 组合）。使用 `--add --domain <project>` 记录每一个已确认的变体，这样在未来每次运行时，它们都会统一归并为规范姓名。


### 人员名册（长期人员姓名 SSOT）

对于姓名经常被 ASR 错误识别的**重要且反复出现的人员**
（同事、客户、家人、工作坊参与者），应维护一个作为人员姓名 SSOT 的**人员名册**
Markdown 文件，而不是逐个将其添加到数据库中。当
`~/.transcript-fixer/config.json` 中设置了 `people_roster_path` 时，
Transcript-fixer 会在阶段 1 自动从该名册加载人员姓名纠正规则。

**名册格式**（规范格式：`### Name` + `- **ASR 变体**: variant1, variant2`）：
```markdown
### Nina Zhao
- **ASR 变体**: Nena, 妮娜

### 小雨
- **ASR 变体**: 晓雨, 小宇老师
```

这两种示例形式都值得照搬。在中文语音中说出的英文名字会产生*两类*变体——
拼写错误（`Nena`）和中文音译（`妮娜`）；而中文昵称则会产生同音变体以及
带敬称的形式（`小宇老师`）。列出你实际见过的每一种形式；每一种形式都是一条
无需额外操作便会生效的规则。

**设置**（仅需一次）：
```bash
# Edit ~/.transcript-fixer/config.json and add:
#   "paths": { "people_roster_path": "/path/to/people.md" }
```

此后，每次 `--stage 1` 运行都会自动合并名册中的纠正规则
（仅保存在内存中——绝不会写入数据库）。发生冲突时始终以数据库为准，因此
名册只会填补空缺，而不会覆盖手动调优的条目。解析器请参见
`scripts/core/people_roster.py`。

**优先级分为三层，其中第三层限定于域，而名册是全局的**——这种不对称性往往会
令人意外：

1. 在本次运行所属域中处于启用状态的数据库规则优先。
2. 否则，由名册提供该配对。
3. **除非**该配对在本次运行所属域中已被禁用——此时，名册中的对应规则也会被
   抑制，运行时会输出 `🚫 People roster: N variant(s) suppressed`。

第三层按域生效，因此使用 `--report-false-positive
--domain A` 停用某个配对，**不会**使其在 `--domain B` 中停用：名册是全局的，
而在 B 中没有任何规则否决它，因此该规则会继续生效。这是有意为之的（在一个域中
属于误报的规则，在另一个域中往往是正确的），但这也意味着，出现“我已经禁用了它，
它却仍然生效”的情况时，几乎总是因为使用了*不同的域*——在编辑名册之前先检查这一点，
因为编辑名册会一次性在所有地方停用该配对，包括共享同一文件的其他项目。
`--report-false-positive` 现在会列出该配对仍处于启用状态的域，并以 `3`
（此处已禁用）或 `4`（仅存在于名册中，没有可禁用的数据库行）退出，以便自动化流程
将这些情况与真正的故障区分开来。

**何时使用名册，何时使用 `--add` 添加到数据库：**

| 人员 | 添加到 | 原因 |
|--------|-------|-----|
| 长期反复出现的人员（同事、客户、家人、工作坊参与者） | **people.md** | 包含关系上下文的 SSOT；数据库重置后仍可保留 |
| 一次性出现／不重要的姓名 | **数据库**（`--add --domain`） | 快捷，无需上下文 |

**姓名变体爆炸——同一个人，出现各种不同的声母。** 某个人的姓名即使被说话人分离工具标注过一次，在正文中仍可能分裂成一整个变体家族，有时甚至横跨*不同的声母*（在一次 56 分钟的通话中，同一个姓被听成了 h/f/w/g/zh 等不同形式——2026-08-08 的真实案例：一位说话人以七种不同的姓氏声母形式出现）。这不是一个需要逐一追查各个变体的问题；它其实是规范姓名问题的另一种表现。应将其作为一个整体处理：

1. **首先确定规范姓名**——询问用户，或采用已经人工确认的说话人分离标签，确定一种拼写，然后再进行全面清理。自动分配的标签，或来源不明的标签，仍然只是候选项，必须遵循下文的验证阶梯。若未确定规范姓名就处理变体家族，只会产生七个修了一半的结果和一份混乱的人员名册。
2. **在一次操作中清理文件里的所有变体**（对单个文件使用一条包含所有变体的 `sed` 命令，然后再次执行 grep，直至结果为零），不要逐个变体处理。
3. **在人员名册的 `ASR 变体` 行中记录整个变体家族**——包括你实际见到的每一种形式，即使它们很怪异。下一份转录稿还会产生这个家族的新成员，而人员名册能在家族不断扩大的同时保持规范姓名稳定不变。
4. **敬称形式（`X老师` / `X总`）也属于变体**——敬称是说话人实际说出的内容，因此绝不要将其*替换*为不带敬称的姓名；但敬称中的姓氏需要进行同样的全面清理，并写入同一条人员名册记录。

**对话中途得到的裁定必须立即落实——绝不要推迟。** 当你仍在处理任务时，用户回答了一个姓名或数字问题（消息中途给出的纠正、对候选列表的一词回答），该裁定就是整个闭环中最可靠的信息来源，而且立即记录几乎没有成本：修复文件，对已确认的变体执行 `--add`，并在同一轮中更新人员名册/上下文——不要等到“批处理结束之后”，因为推迟的事项往往会不了了之。在一次真实的批处理会话中，四项中途裁定都在给出的当轮立即落实（2026-08-08），其中一项还纠正了审核者自己的陈旧训练数据中有关版本号的错误。若用户裁定与搜索结果矛盾，应以用户裁定为准，而不是将其视为需要再次核查的异常情况。

## 领域纠错上下文（按领域设置的 AI 先验）

词典负责确定性替换；人员名册负责姓名。还有第三类错误无法安全地放入其中任何一处：**依赖上下文的同音词**——只有在特定讨论语境中才算错误的词。例如，在讨论每天制作 N 条视频片段的会议中，将 `减`→`剪`；或者在金融通话中，某个常用词与股票代码昵称发生冲突。针对常用词设置词典规则，会悄无声息地破坏其他所有转录稿；而通用 AI 处理又缺乏足够的领域先验，无法有把握地进行修正——它要么猜错，要么把问题留给人工处理。（真实案例：一份转录稿中出现了四处 `减到 N 条`，实际含义全都是 `剪到`；AI 处理虽然有所怀疑，但由于缺少领域先验而没有修改，最终只能由用户手动修正。）

领域上下文文件弥补了这一空白。每个领域对应一个 Markdown 文件，存放在**用户空间**中，与 `corrections.db` 和 `people.md` 并列（绝不能放在技能包内——这样它既能在技能更新后保留下来，也能确保项目知识的私密性）：

```
~/.transcript-fixer/contexts/<domain>.md
```

（如果你通过 `TRANSCRIPT_FIXER_CONFIG_DIR` 重新指定了配置目录，则上下文文件位于该目录的 `contexts/` 下。）

在原生纠错期间（参见下方工作流），应先读取转录文本的领域上下文文件，再进行分类处理。该文件应包含三类内容：

1. **一行业务上下文**——该领域的录音通常讨论什么
2. **已知的同音字陷阱**——每项都应附上能够消除歧义的*上下文线索*（“当句子讨论制作/编辑片段时，应使用 `剪`”），还可选择附上带日期的真实示例
3. **权威名称来源的指引**——项目的别名台账、相关的人员名册章节、现有的数据库领域——以便验证阶梯（见下方第 4 步）知道应优先查找哪些位置

上下文文件中绝不能包含：硬性替换规则。将 `减→剪` 作为规则，既不应放入上下文文件，也不应放入词典——该文件通过先验信息和线索辅助你的判断；它绝不允许盲目替换。每项修复仍须经过下方的置信度分类处理。

维护循环（与词典的 `--add` 习惯一致）：当一次原生会话中出现**依赖上下文**的重复性错误——你在此处修复了它，而且它还会在该领域未来的转录文本中再次出现——就将它连同消除歧义的线索追加到该领域的上下文文件中。与之前一样，确定性的非词语/名称修复应继续添加到 `--add --domain` / 名册中。

格式和完整示例模板：`references/domain_context_guide.md`。

注意：上下文由**原生工作流**使用（代理读取文件——不涉及代码）。API 模式（`--stage 2/3`，备用通道）目前尚不会注入这些上下文；如果该通道得以完善，应将相同的文件提供给其提示词。

## 原生 AI 纠错（默认模式）

在 Claude Code 中运行时，阶段 2 应使用 Claude 自身的语言理解能力——对于高质量 ASR，几乎所有真正的纠错都发生在这一阶段。**根据转录文本调整投入力度。** 不要把一段 10 秒的备忘录变成研究项目，但也不要对一场 90 分钟的战略会议投入不足。应根据录音本身的特征选择层级，而不是凭你的心情：

| 信号 | **快速层级**（几分钟，而非几小时） | **完整层级**（整套阶梯都能发挥作用） |
|---|---|---|
| 长度 | 较短（≤ 约 15 分钟 / 几百行） | 较长（30 分钟以上 / 1000 行以上） |
| 说话者 | 一两个人，姓名是你已知的 | 3 位以上说话者，或姓名不熟悉 |
| 词汇 | 日常语言，无领域术语 | 领域术语密集（金融/医疗/法律/项目代号），或包含大量专有名词 |
| 重要程度 | 内部备忘录、用完即弃 | 面向客户、将提交到共享仓库、会影响决策 |

- **快速层级**——阶段 1（`--apply-domain`），如果存在领域上下文文件，则读取该文件；完整通读一次，直接修复明显的一次性错误，并使用 `--add` 将任何重复出现或项目特有的术语添加到某个 `--domain`。**跳过：**跨领域名称验证阶梯、第二轮子代理、待核查流程。一次线性检查，完成。
- **完整层级**——执行下方所有步骤：使用名称验证阶梯进行完整分类处理、运行独立的第二轮子代理，并明确列出待核查项。这样的投入是合理的，因为较长或领域术语密集的转录文本不仅错误更多，难以确认的错误也更多，而且一旦将错误的专有名词提交到共享仓库中，它还会继续传播。

一段录音可能很长，但仍属于快速层级（两位已知说话者、使用通俗语言）；也可能很短，却属于完整层级（一次 5 分钟的通话，其中充斥着陌生的药品名称，并将用于生成报告）。应由*词汇和风险程度*决定采用哪个层级，时长仅作为无法判断时的辅助依据——这才是真正需要下功夫的地方。

**纠正范围包括元数据行，而不仅仅是正文。** 归档的转录稿通常带有由 ASR 生成的元数据——`Keywords:` 行、frontmatter、标题——这些行中包含与口述正文中*相同的*识别错误（例如，尽管正文中的每一处都已纠正为 `Claude`，`Keywords:` 行中却仍列着 `克劳锐`）。应使用相同的规则纠正它们。不存在“元数据不可触碰，原样保留”的例外：元数据同样是搜索/grep 的检索面，如果某个关键词仍保留 ASR 误识别后的形式，那么以后每次执行 `grep Claude` 都会悄无声息地失败，即使正文看起来已经很干净。重新对最终文件执行 grep 以确认纠正已经生效时，也要将元数据行纳入检查范围。

1. 对所有文件运行第一阶段（字典）（如有多个文件，可并行处理）
2. 验证第一阶段——与原始文件进行 diff。如果字典引入了误报，则应改为基于**原始**文件进行处理，并在原始文件上应用你的编辑。**这里的误报是你欠字典的一笔债**：同一条错误规则会在未来的每一份转录稿上触发，直到它被停用。因此，一旦发现误报——某条规则将原本正确的话改错了，尤其是“真实词 → 真实词”规则（两边看起来都是有效词，因此非词防护机制无法捕获它们；而且使用 `--apply-domain` 时，无论风险类别如何，每一条匹配的规则都会被应用）——例如，某条 `买买→卖卖` 规则将正确的“买买工作流”改写成了“卖卖工作流”——就应在同一会话中使用 `--report-false-positive <from_text> <to_text> -d <domain>` 将其停用——必须严格按照第一阶段的 `*_changes.md` 中所示（From/To 列）或字典中存储的规则，传入该规则保存的 from→to 对，而不是按照“错误词 → 正确词”的语义传参。对于误报而言，这个方向有违直觉：`买买→卖卖` 规则存储的是 `from=买买, to=卖卖`（它把正确的买买改写成了错误的卖卖），因此你应传入 `"买买" "卖卖"`——也就是该规则存储的 from→to 对，因为工具正是以此为键进行匹配。一次调用会停用该规则并降低其置信度（工具会输出 "The rule has been disabled"）；它不会再对下一份转录稿生效。如果这个词确实存在*歧义*（在某些上下文中正确，只在这里错误），而不是规则本身完全错误，就不要停用该规则——应改为在领域上下文文件中记录用于消歧的线索。只修复当前这份转录稿，却让陷阱继续处于启用状态，必然会让下一份转录稿再次踩中它。
   **如果输入已经经过自动纠正器处理**（同步管线的预分类阶段、之前的第三阶段 API 运行），那么你的输入就不是原始 ASR——上游纠正结果已经写入其中，却没有留下证据链。在进行分流之前，应与原始来源进行 diff（调用方的原始转录稿——同步引擎通常会在纠正后的副本旁保留一份，例如 `transcript_raw.txt`——或者从源 API 重新拉取）。这次 diff 会产生两个方向相反的结论：**(a)** 在来源得到核验之前（见下文），每一处上游实体替换本身都应在第 4 步的分流中被视为可疑项，因为上游 AI 的“纠正”可能是一个流畅但错误的猜测——真实案例：原始 ASR 中的「新的车辆」被管线 AI “润色”为「新出来的反馈」（语法正确、看似合理，但实际上错误：说话者说的是一个近似同音的名称），只有与原始内容进行 diff 才发现了这个问题；**(b)** 上游已经正确修复的内容就无需再处理——在提出可能已经应用过的修复之前，先检查 diff，否则不仅会重复劳动，还可能把正确形式“修复”回错误形式

**如何判断每一处上游更改——一个有效的测试，以及一个无效的测试。** 对每一处上游编辑，按照步骤 6 中写明的方向运行*语音距离*测试：**如果两边在语音上相差太远，不可能是任何 ASR 造成的替换，那么它就不是纠错——而是模型改写了说话者所说的内容，应当将其还原。** ASR 会听错声音；它不会把一个词换成同义词，也不会改变代词。以下两种形式反复出现，而且从页面上看都不像错误：
   - **将一个术语替换为看似合理的近义词。** 这两个词没有任何共同的语音，因此任何引擎都不可能混淆它们——而暴露问题的线索存在于语料库层面：替换后的词在项目材料的其他任何地方都没有出现，而原词是该项目的标准词汇（即之前某次会议定义过的术语）。接受任一形式之前，先在整个语料库中 grep 这两种形式。
   - **改写代词或主语。** 改写后的内容读起来比原文*更加*合乎逻辑，却悄然改变了一句话所指的对象——这是事实变更，而不是转录修正。大多数语言中的不同代词在语音上彼此无关；一个会把某个代词误听成另一个代词的引擎，势必会把整句话都弄得面目全非。

   **但首先要问上游更改是从*哪里*来的——语音测试只能对 AI 的猜测进行排序。** 即使调用方丢弃了 sidecar 文件，来源仍可通过机械方式核查：`*_changes.md` 报告会标明每项更改的来源；如果该报告未被保留，则查询数据库中跨**所有**域的 from→to 对（`SELECT from_text, to_text, domain, source, confidence FROM active_corrections WHERE from_text='<the raw form>'`）——命中意味着该替换有规则支持，domain 列会告诉你应参考哪个域的先验信息，而该行本身会提供规范形式（`to_text`），供你按下述方式搜索。由词典规则支持的替换在构造上就是语音相近的，因此它会通过语音测试，看起来已成定论；恰恰是在这种情况下，你不能轻率地自行决定将其还原。规则支持的替换是一项**先前已经敲定的决定**——某个人或某次更早的运行已经判断过这个 from→to，并将其提交到该域中（`source` 列的值为 `manual`/`learned`/`imported`，但这些值都不会记录是*谁*确认了它——无论如何，都应将每条活动规则视为已经敲定；下述不对称性并不取决于决定者的身份）。将其还原是在推翻一项决定，而不是在标记一个疑点，因此门槛是存在肯定性证据，证明该规则*不适用于这份转录稿*。以下情况可算作肯定性证据：
   - **备选指代对象必须得到本次对话的支持**——该人在场、被直接称呼，或在此处的话题中被提及——而不能仅仅是在其他地方可以查到。另一个项目的人员名单或目录中有一个发音相同的名字，并不能说明当时谁在这个房间里。（2026-08 的真实案例：一名审阅者还原了一处原本正确的称呼形式应用——该称呼形式规则是在转录稿自身所属的域中维护的——原因是一个*不同的*项目列出了一位同事，其称呼形式的发音完全相同；实际指代对象是规则所对应的规范人物，即两位说话者共同认识的联系人，该域的上下文文件和项目文档均对此有所记录，而那位同事在对话中从未出现。用户不得不当场撤销这次还原。）
   - **搜索规范名称/全名，而不只是表面称呼形式。** 文档通常使用全名记录人物，而不是昵称：对两个称呼形式执行 grep 会返回 0，但该人物可能以全名形式在域上下文文件和项目文档中有详尽记录。窄范围 grep 的零命中只是工具报告，而不是不存在的证据——在得出任何结论之前，应将搜索范围扩大到规范名称（规则行的 `to_text`）、罗马化形式和已知别名。只有在*扩大后的*模式仍然零命中时，才应开始怀疑该规则。
   - **在文档内部、经原始文本验证且与规则相反的自证，也足以达到门槛。** 如果该对话自身的原始文本实例表明，说话者在指代*另一个*实体时正确使用了这个词——而且该段落讨论的正是那个实体，并非只是与其共同出现——那么该规则在此处误触发了：先还原，再按照上述误报处理路径停用该规则或限制其适用范围，因为它还会继续触发。要使该证据成立，需要注意两点：“其他地方的正确实例”必须根据**原始**文本核查（如果这些实例本身也是由同一个上游处理流程写入的，那么判断者与被判断者来源相同，证据就是循环论证）；此外，如果*两个*候选词都在该段落中正确出现，那么该证据不具区分力——此时应退回到语音最小改动原则或审阅队列。
   - 即使经过这些检查，仍然无法确定本次对话所指的是哪个实体时，应使用审阅队列（`kind: entity`），而不是还原：在问题待决期间，由规则支持的形式会保留在文本中。这种做法刻意偏向保留规则支持的形式——代价是，在队列解决问题之前，错误规则的输出会继续存在于交付文本中。这个方向是有意为之：一个已入队、可见的错误修正，胜过一个流畅却悄无声息的错误还原；而且队列会迫使人们重新判断的是*规则*，而不仅仅是这一个实例。

**同一项“对话支持”测试还要提前一步，在审批时执行——延迟替换只是候选项，并非已经确定的决定。** 安全模式会把有风险的名称替换准确地延迟到 `*_needs_review.md`，交由人工或原生流程判断，而“判断”并不意味着对名单条目做模式匹配。在批准人名替换之前——尤其是来自全局人员名单或*其他*项目领域的人名替换——应正向应用撤销标准的第一条：**这条规则所指的人物是否得到当前对话的支持**（此人在场、被直接称呼，或在此处的话题中被提及）？名单条目对于其编制来源项目而言是正确的，并不能说明当时谁在这个房间里；常见称呼形式（「X老师」「X总」）之所以会在不同项目间冲突，恰恰是因为它们很常见。（真实案例，2026-08-17，与上面的撤销案例互为镜像：一份转录稿中包含一个称呼形式，而全局人员名单将其映射到了从*另一个*项目线的会话中整理出来的联系人。审核者仅凭名单依据就批准了替换——实际所指的是当前对话所属项目中的一名参与者，用户当场发现了这一错误归因。规则本身没有错；审批过程跳过了“对话支持”测试。）如果无法在当前对话中找到该指代对象的证据，既不要批准也不要拒绝——将其以 `kind: entity` 加入队列，并保留原始形式。此外，当你使用 `--add` 将某个人的称呼形式变体添加到名单或领域中时，也要同时注明其冲突范围：如果某个称呼形式与另一个项目中的联系人共用，就需要在领域上下文文件中添加作用域注释，否则它会在下一份实际指代另一个人的转录稿中误触发。

   **为什么这需要一项独立测试，而不能依赖你的判断：上游纠正器以流畅性为优化目标，因此它输出的所有内容读起来都很通顺——这使得“结果是否合理？”这一检查对于识别这种特定故障完全没有区分能力。** 你无法仅靠阅读发现它，而且流程越顺畅，错误文本看起来就越可信。diff 是唯一能够识别它的工具。由此有两项值得纳入规划的结果：在你自己通读之前*先*运行 diff，这样上游的编辑会以候选项而非待校对正文的形式呈现；而当你确实撤销某项编辑时，要全面检查你已经写下并引用了受污染形式的所有内容（第 9 步的派生文档检查——根据撤销前文本编写的笔记和摘要会携带相同的污染，而且与转录稿不同，它们没有任何标记来说明这一点）。
3. **加载该领域的先验信息，然后阅读整份转录稿。** 如果该转录稿所属领域存在 `~/.transcript-fixer/contexts/<domain>.md`，请先阅读它——它会提示你应警惕哪些同音词陷阱，并列出第 4 步检索阶梯中的权威来源（参见上文“领域纠正上下文”）。然后，在提出纠正建议之前阅读**整份**转录稿——后文语境能够消除前文错误的歧义（靠近开头处被错误识别的姓名，往往会在后文变得显而易见）。对于大文件，可以分块阅读，但在作出任何决定之前必须读完整份文件
4. **将每个候选错误分到三个类别之一**——这种分类是最需要判断力的部分。**首先要抑制三种会反复导致姓名误分类的下意识反应**（这三种都是真实且反复出现的故障——它们会把原本可以修正的姓名直接送入“询问用户”类别）：
   - **先看说话人标签——转录稿通常已经包含姓名。**
     在搜索任何位置之前，先收集文件中的全部说话人标签；
     如果某个乱码词元在发音上与其中一个标签匹配，那么它几乎肯定就是
     同一个人，而标签提供了正确拼写——标签是从姓名
     *登记表*中复制而来的（可能来自为录音添加标注的人工，也可能来自参会者名单／
     说话人日志系统匹配所依据的声纹注册信息），而正文则是对语音声音的原始
     ASR 结果。这里有四项限定条件，第一项并非可选。
     **(a) 仅将此规则用于被直接称呼或自我介绍的姓名，绝不能用于
     被提及的姓名。** “你好，<词元>”和“我的名字是<词元>”能够识别一名
     说话人；“我会问银行的<词元>”所识别的则是可能只是
     *听起来*像某位说话人的第三方——将其改写为说话人的姓名，会篡改
     一名真实人物，这正是词典表格所称的“真实姓名 →
     另一个真实姓名 ❌ 绝不能成为规则”这一风险。仅凭这一点，同一文件中
     两个发音完全相同的词元也可能需要得出相反答案，因此被提及的
     姓名应继续沿检索阶梯查找，而不能在这里确定。
     **(b) 与所有标签进行匹配——包括但不限于当前文本块
     上方的标签**——错误识别的姓名通常位于其他人说出的文本块中
     （`A` 向 `B` 打招呼），有时也位于该说话人自己的文本块中
     （自我介绍）。**(c) 标签确定是谁；名单仍然负责确定
     规范拼写**——手工输入的 `Joe` 应规范化为名单中的 `Jo`，
     只改拼写，绝不扩展长度。**(d) 人工标注的标签就是人工身份识别结果：
     直接应用它，不要将该姓名放入待检查列表，也不要要求用户
     确认——用户在添加标签时已经给出了答案。**（真实案例：对一个打印在
     该说话人每个文本块上方的姓名走完了整套检索阶梯，什么也没找到，
     然后又要求用户确认。其实这些标签就是用户自己添加的。）
     如果无法判断标签是人工标注还是自动分配，
     **则假定为自动分配**：声纹匹配可能会把一个拼写完全正确的
     姓名分配给错误的说话人，而且这绝不会显得像乱码——因此应将
     标签视为需要通过检索阶梯确认的强候选项，而不是终止条件。
     对于 `说话人 N` / `Speaker N`、角色标签（`主持人` / `Interviewer`）、
     并非说话人之一的第三方，或本身就明显乱码的标签，应继续进入检索阶梯。
     只修正**正文**——绝不要编辑标签或重新分配发言归属——并保持编辑最小化
     （不要把仅说出的名字扩展成无人说过的全名），同时使用 `--add` 将
     已确认的变体添加到一个 `--domain`，这样下一份转录稿就能自动修正它。
   - **依据发音而非字形判断 ASR 错误。** 中文 ASR 错误通常是同音／近音替换，因此判断“是否为同一实体”时应依据读音，而不是字符是否完全一致。如果名单或词典中已经存在 `X晓Y`，而某个姓名被识别成 `X小Y`（小／晓同音），那么这就是**同一个人 → 确信修正**——不要仅仅因为页面上的小≠晓就将其降级为不确定。同样的逻辑也适用于外文姓名：只要其各音节在发音上都能映射到近音音译，就应如此处理。词典中存在发音相近的规范形式，是*支持*修正的证据，而不是应被忽略的不匹配。
   - **但发音相似是判定身份的*充分*证据，而非*必要*证据——这种例外是一个完整类别，并非罕见情况。** 当姓名以一种语言说出，而引擎按另一种语言进行转录时（例如中文语音中夹杂的英文名、音译姓氏），其结果在语音上可能与规范形式**毫不相关**，甚至更糟——它可能看起来像另一个完全正常的*不同*真实姓名。在一个经过测量的案例中，同一个人被转录成三个不同的词元，没有一个与她的姓名近音，而且每一个看起来都完全可能是其他人的姓名；之所以能识别这些词元，只是因为它们都出现在同一位未到场负责人应当出现的位置，而最终*确认*它们靠的是人工收听对应的几秒音频。
     **这并不会推翻上面的 (a) 条。** 该规则禁止利用说话人标签作为来源，将一个*被提及的*词元解析为某位**说话人**的姓名——这种故障模式会用房间中的某个人覆盖一名第三方。此类别的方向恰恰相反：该词元应解析为一名已知的**非说话人**，其规范形式来自名单或项目台账，并由人工听辨而不是标签来确定。如果两种情况难以区分，则以 (a) 条为准，该词元继续沿检索阶梯查找。
     因此，某个候选项即使未通过发音测试，只要它出现在某个已知人物应当出现的位置，就**既不能忽略，也不能改写**：将其以 `kind: entity` 加入队列，等待音频验证（仪表板中的 `Q` 正是为此设计的工具）。即使你有所怀疑，也要将最佳候选项放入 `suggested`——没有建议值的条目根本无法被接受（对其使用 `--decision accepted` 会报错），否则审核者将被迫为每张卡片重新输入答案。在加入队列*之前*关联转录稿的音频（参见仪表板的音频部分）：查看时会实时读取 frontmatter，因此稍后添加音频确实能让播放按钮启用——但编辑转录稿会导致行号相对于记录每个条目锚点时使用的 ±3 行窗口发生偏移，而这才是代价高昂、难以撤销的部分。
   - **无法确定身份的姓名默认应进入下面的检索阶梯，而不是询问用户。** “只有用户知道这个姓名”是最常见的错误下意识反应。规范拼写几乎总是已经存在于这台机器上，只是位于**另一个项目的领域**中——因此你必须一次查询**所有**领域（使用下面检索阶梯中的跨领域 SQL），而不是只查询你碰巧传给 `--stage 1` 的那个领域，因为它可能是全新的空领域。只查询该领域然后放弃，看起来完全就像“我检查过了”，实际上却漏掉了近在眼前的答案。
   - **确信修正**——非词语、明显乱码、你已经认识的产品名称变体，或在上下文中毫无歧义的同音词（上下文明确要求使用 `there` 时将 `their`→`there`；其他所有提及都写作 `彭博` 时将 `彭波`→`彭博`）。直接应用（第 5 步）。
   - **需要验证**——无法从上下文确认的专有名词：人名／公司名／股票代码／产品名／地名（医学访谈中听错的药名、播客中研究人员的姓氏、财报电话会议中的股票代码），或任何你无法指出具体来源的术语——即使你自认为认识它（“我相当确定”恰恰是错误姓名混入流程的方式）。**在询问用户之前，先通过本地优先的检索阶梯解决它。** 对于项目／个人实体，权威拼写几乎总是已经存在于这台机器上，而 WebSearch 对内部姓名几乎毫无用处——它要么返回姓名相同但身份错误的人，要么什么也找不到——更糟糕的是，一个流畅但错误的猜测会变成难以在后续发现的确信修正。按以下顺序搜索：

0. **人员名册** — `people.md`（或 `~/.transcript-fixer/config.json` 中 `people_roster_path` 指向的任何位置）。这是你精心维护的长期重复出现人员的唯一事实来源（SSOT），其 ASR 变体标注在 `- **ASR 变体**:` 下。若某个乱码姓名已在此处映射到规范人员姓名——例如 `Nena`→`Nina Zhao`、`小宇老师`→`小雨`——则属于高置信度修正：立即应用。**此步骤无需再针对用户已经记录过的每个姓名逐一询问用户。** 仅当确认转录中的说话者不在名册中时，才跳过此步骤。
      1. **`corrections.db` 的所有域，而不只是当前的 `--domain`。** 同一个实体在不同项目中会分裂成不同的 ASR 变体，而之前的每次修正都已将它们归并为规范名称——因此答案往往就在另一个未传给 `--stage 1` 的域中。只检查当前域然后放弃，是反复出现的失败模式。
         `sqlite3 ~/.transcript-fixer/corrections.db "SELECT from_text, to_text, domain FROM active_corrections WHERE to_text LIKE '%<fragment>%' OR from_text LIKE '%<fragment>%';"`
      2. **项目交付文档和别名台账** — 成本报告、审阅表、交付物、该项目的 PKM 笔记。这些资料包含由人工书写的正确拼写，是最可靠的信息来源。运行 `grep -rl "<fragment>" <project-dir>`，然后阅读命中的文件。（你在分类排查前加载的域上下文文件通常会明确指出项目的别名台账——从那里开始。）**阅读台账中的每一张姓名表，而不只是看起来像“说话者名单”的那一张。** 项目人员几乎总是分散在按角色划分的多张表中——内部说话者、外部协作者、客户方、供应商/经销商方、参会者——而你正在查找的人往往就在你没有打开的同级表中。如果你最终确认的某个姓名无法通过上下文文件中的姓名来源清单找到，则说明该清单不完整：将缺失的表添加进去，确保下一次运行不会再遗漏。（有关此规则所防止的失败情形，请参阅 `domain_context_guide.md` 的规则 6。）
      3. **本地工具 / 网关 / 客户端配置——用于处理产品、模型和工具词汇的乱码。** 如果一份转录中充斥着产品、模型和端点相关讨论，其事实依据通常就在用户这台机器上的客户端配置中：LLM 网关配置文件（模型 ID、基础 URL）、编辑器/IDE 设置、CLI 配置存储、API 客户端预设。这些信息可供机器读取、保持最新且完全精确——一个以五种不同方式识别错误的模型名称，可以逐字节地与配置自身的模型列表进行匹配，包括不明显的后缀（真实案例：在一次讨论如何配置模型网关客户端的通话中，出现了 `cloud fiber5` / `飞豹五` / `FIVE5EM`；该客户端的本地数据库列出了带有 1M 上下文标志的 `claude-fable-5`——所有变体都被归并，包括 `EM`→`1M`）。通用方法：找到正在讨论的工具所使用的配置（常见配置目录、其 sqlite/json 存储），根据读音将乱码词元与真实标识符进行匹配，并将配置项视为近乎权威的依据——用户说话时是从该界面上照着读 ID，而 ASR 只能听见声音。⚠️ 配置存储中可能包含机密信息：仅阅读所需字段（模型名称、URL），绝不要将密钥/令牌复制到转录、词典或总结中。
      4. **聊天记录时间线交叉核对——用于确定实际参加通话的人。** 当参与者身份很重要时（例如，说话者分离标签只是一个英文名字，或是 `Speaker N`，且正文从未提及全名），最有力的本地证据是会议时间窗口*前后*的用户聊天记录：人们会相互发送会议链接，以及通话期间讨论的材料（配置字符串、文件、链接）。在聊天归档中搜索**转录本身包含的一个独特字符串**（例如通话中提到的域名、模型 ID 或代号），并将范围限定在会议日期窗口内；在该时间点包含此字符串的聊天对象几乎可以确定就是通话另一方，而上下文消息（“正在加入”、开始前一分钟发送的邀请）能够**完全不根据转录内容进行推断**便确定身份——这是时间线证据，而不是根据说话者的声音猜测身份。它还可以逐字节验证聊天中出现的任何精确字符串（通话中途粘贴的 ID 可确认其自身的拼写）。此方法仅用于身份/标签问题——普通拼写问题通过第 0–2 级方法解决成本更低。真实案例：说话者分离结果显示为 `Kevin`；搜索通话中提到的网关 URL 后，找到了一段私信，其中对方在开始前一分钟收到了邀请，并在通话中途收到了三个精确配置字符串——由此将 `Kevin` 解析为该私信对象的完整显示名称，正文中两个识别错误的姓氏称呼也被修正为有证据支持的姓氏。
      5. **记忆文件**（`~/.claude/.../memory/`）— 项目关系图和人员档案通常会明确记录规范姓名。
      6. **WebSearch** — 仅用于真正公开的实体（上市公司股票代码、知名研究人员、药品名称）。任何项目内部实体都应跳过此项。

只有在所有这些方法都无结果后，你才询问用户——而到那时，你已经证明该实体尚未记录在这台机器上，因此这个询问是合理的。得到确认的结果会成为「确信」修正；如果搜索*无法*确认，则归为「不确定」。**批量处理这些项**：收集去重后的未知项，并针对每个唯一实体执行一次上述阶梯式流程，而不是每出现一次就执行一次。**询问人物的规范姓名时，始终要在候选列表之外保留一个退出通道**——提供 `Other / none of these` 路径（或确认 UI 已提供该路径），以便用户输入其确切的自由文本拼写。一次本地出现足以证明可以将某个候选项列入列表，但不足以证明该列表是穷尽的：真正的规范姓名可能是英文名，而你找到的所有候选项都是中文音译名。

      **而当用户作出回答时，其判断是 ✅ 权威的——这是整个循环中最强的信息来源——并且会在同一会话中通过三种方式产生复利效应。** 如果用户说“X 实际上是 Y（我在 Z 团队的同事）”，他们就为你提供了一个比任何本地文档都更强的信息来源。立即兑现它：① 应用修正；② 在能够产生复利效应的位置持久化该变体——重要且反复出现的人物应加入**人员名册**（遵循上面的名册与数据库对照表），项目术语或一次性姓名应加入 `--add ... --domain <project>`（同一个 ASR 下周还会以相同方式听错这个姓名）；③ 使用用户的原话、日期和 ✅ “用户已确认”标记，将其记录到台账 / 名册 / 领域上下文中——后续会话不应再次询问。以下是两条通过惨痛教训总结出的改进原则：
      - **添加到词典之前，先对 FROM 端进行冲突检查。** 如果乱码字符串本身在你的其他场景中是一个真实人物的姓名（另一个项目的名册中存在一个*不同的*真实 `李明`），那么 `李明`→`黎明` 这条词典规则会破坏此人未来的转录文本。该修正应作为陷阱记录在领域上下文文件中，并附上用于消歧的提示（“在编辑团队上下文中，`李明` = `黎明`”），绝不能加入词典。
      - **确认无误的实体也值得记录。** 当用户确认某个姓名保持原样就是正确的（“他是真实存在的博主，拼写就是这样”）时，记录这个判断（在领域上下文或名册中写一行）。未记录的“原样正确”会成为下一次运行时又要耗费五分钟重新询问的问题。
   - **不确定**——你怀疑存在错误，但即使经过搜索也无法确认（某个音节可能对应多个真实实体；某个句子的结构已损坏）。**将原文完全保持原样**，并将其记录到待检查列表中（第 7 步）。流畅但错误的“修正”比明显的乱码更难在下游被发现——沉默胜过自信的猜测。
5. 高效应用确信的修正：
   - **全局替换**（唯一的非词语，如“克劳锐”→“Claude”）：如果它在多份转录文本中反复出现——大多数产品名 / 姓名乱码都会如此——使用 `--add` 将其添加到一个 `--domain` 中，使其能够惠及未来的每次运行；对于确实只出现一次的术语，使用一条带多个 `-e` 标志的 `sed -i ''`
   - **依赖上下文的修正**（某个词仅在特定上下文中错误，例如在蒸馏讨论中将“蒸”误写为“争”）：使用包含更长周边短语的 sed 来确保唯一性，或使用 Edit 工具
   - **大多数出现位置都是领域术语、但少数位置确实是常用词的批量处理**（某个高频词在其*大多数*出现位置被该领域赋予了特殊含义，但并非全部——残留的真实用法恰恰体现了它为何是常用词）。绝不要盲目使用 `replace_all`。首先使用 `grep -n` 找出每个出现位置，并根据所在句子逐一判断。当绝大多数位置表达的是领域含义，只有一两个位置是常规含义时，高效的处理方式是：使用 `replace_all` 将该词替换为领域术语，然后用 `Edit` 将那一两个常规用法的位置改回去——这比执行 N 次单独的 Edit 更快，也更不容易出错，而且下面的重新 grep 会捕获任何误判。真实案例：在一次销售通话的 11 行文本中出现了 `公开`——其中 10 处实际是工勘（销售漏斗中的现场勘察阶段），只有一处是真正的“公开的渠道”；先通过 `replace_all` → 工勘，再将唯一的“公开的渠道”改回去。（当源词是常用词时，领域术语本身仍然不能加入词典——应按照“领域修正上下文”将其记录为上下文陷阱；本条仅说明如何在单份转录文本中*应用*修正。）
   - 之后重新 grep 每个已更改的术语，确认替换已生效，并且没有误伤原本要保留的相似项
6. **第二遍检查——捕获第一遍阅读遗漏的内容。** 单次线性阅读必然会留下残余问题：一个习语退化成近音表达、一个在多个正确位置中仅有一处错误的术语，或一个被误听成另一个缩写的首字母缩略词。始终再扫描一遍，查找遗漏。首先进行一种成本较低的针对性检查：**陷阱扫描**——扫描文件，查找该领域上下文文件中记录的每一种陷阱模式（该领域已知会反复产生的同音误听）。以机械化方式执行，不要手写 grep 循环（包含 30 个陷阱的上下文文件意味着要手动执行 30 次以上 grep，而这份列表恰恰是疲惫的操作人员最容易擅自缩减的内容）：

```bash
   uv run scripts/fix_transcription.py --scan-traps \
     --context-file ~/.transcript-fixer/contexts/<domain>.md -i meeting.md
   ```

   每个已记录的陷阱都会连同行号和上下文窗口一起返回；已确认正确的记录（`**X = 真实实体，勿修**`）会被报告为保持原样，因此你无需反复调查已经解决的问题；而无命中列表则让“已扫描但不存在”与“从未扫描”能够区分开来。三十秒即可精准检查该领域特有的错误；对于快速层级，一次干净的陷阱扫描加上你的第一遍检查就足够了。对于很长或高风险的转录稿，*还要*启动一个独立子代理（Task），让它在不知道你第一遍检查结果的情况下重新通读修正后的文件——没有第一遍记忆的新视角能发现那些你已经看漏的问题。**子代理的任务是*返回残留问题列表*，而不是重新叙述转录稿。** 请为它指定输出格式和严格的数量上限，因为逐行自言自语的子代理会在完成之前耗尽自己的上下文窗口（一次真实的第二遍检查在扫描一份 1131 行的转录稿时，中途触及 32k token 上限，最终没有返回任何可用结果）。正确的提示词结构如下：
   - 将范围严格限定为一个文件，禁止编辑和跨文件 grep。
   - 把已经修正的术语作为“不要再次报告”列表交给它（这些你已经修过；只有*新的*残留问题才有用）。
   - 要求它只输出紧凑表格——`line | original ≤20 chars | suspected | one-line reason | confidence`——并告诉它列完即止，不要写正文前言，不要逐行输出思维过程，也不要重新推导它已经完成的修正。
   **完成的标准是获得可用的审查结果，而不仅仅是进程状态显示成功。** 审查者必须覆盖整个文件，并返回所要求的残留问题表格或明确的 `no new residuals`；空白、格式错误或被截断的响应都表示该遍检查失败，必须换一个全新的审查者重试。可重试的子代理失败同样不算完成这一遍检查。如果失败信息表明可以重试或给出了重试延迟（例如带有 `retry_after` 的 HTTP 超时），请至少等待相应时长，然后以全新上下文重试审查。只有当该工具确实无法运行时，才将子代理路径视为不可用（例如，这些指令已经在一个无法再启动其他子代理的子代理中执行）。针对已知变体进行定向陷阱扫描或 grep 仍然有用，但**这不属于独立重读**：它可以确认已知错误类别已被清除，却因其结构所限，无法发现第一位审查者的盲点。在一次生产运行中，用已知模式 grep 代替超时的全新审查后，结果显示没有问题；但重试冷启动审查后，又发现了 26 个候选问题。
   然后裁定每个残留问题——子代理的列表只是**候选项，而非结论**（一次真实运行：10 行 → 接受 4 行）。按照第 4 步的分诊流程逐项处理，并应用以下全部经过生产验证的启发式规则：
   - **接受——近同音 + 文档内自证。** 当几行前的同一目录中已经写着 `离职回购` 时，将 `利智回购`→`离职回购`：发音相近，加上同一文件内存在正确形式，足以定案——**前提是作为证据的出现位置已在原始文本中核实**（由同一个上游处理过程写出的出现位置不能证明任何事情：裁判与被裁判者共享同一来源，属于循环论证），**并且只有一个候选项以正确形式出现**（两者都出现 = 证据不具区分力；此时退回到语音最小改动原则或加入队列）。指代对象明确的同音词也同样适用（当前文指的是文档而不是人时，将 `他`→`它`）。
   - **拒绝——发音距离也可以证伪。** 发音测试是双向的：发音相近是支持修正的证据（第 4 步）；发音不可能相近则是反对修正的证据。`代号`→`代码`（hào/mǎ）和 `一撮`→`一坨`（cuō/tuó）并不是 ASR 会产生的替换——这类候选项是审查者过度解读，而不是引擎听错。**第 4 步中的跨语言专有名词类别除外**：在另一种语言中说出的外国人名，与其规范读音相差很远也完全可能。不要在此处拒绝这类情况——应将其加入队列以便通过音频核实。该例外由*类别*而非罕见程度定义，并且必须同时满足第 4 步的**两个**条件：候选项是一个可能以不同于转录语言的语言说出的专有名词，**并且**它所处的位置对应项目已知的某个人。两项都满足 → 无论发音距离多大，都将其加入队列。缺少任意一项 → 应用此拒绝规则，就像处理所有普通词和同语言同音词一样。
   - **拒绝——ASR 能力反向核查（强先验，而非证明）。** 如果同一个引擎在同一份转录稿的其他位置正确识别了该词，就说明对于这段音频，该词明确处于此引擎的识别能力范围内——因此，附近出现不同写法时，*更有可能*是说话者确实说了不同内容，而要“修正”它的证据门槛就会显著提高。（候选项 `一条`→`一坨`：几行前 `一坨` 已被正确识别，而 `一条` 本身也是口语中有效的量词——两者结合即可否决该修正。）仍要将其视为概率判断：同一个引擎确实可能把一个名字拆成十几种变体（参见“项目特定修正”）——当正确形式和候选项都是引擎经常处理的常用词时，这项反向核查的权重最高；当它们是罕见专有名词时，权重最低。
   - **拒绝——可理解的真实词语。** `一撮` 是完全有效的量词；不要仅仅为了让一个贯穿全文的比喻保持一致，就改写原本可读的话语。只修正那些说话者不太可能实际说过的内容。
   - **拒绝——无证据重构。** 没有语音依据的拟议修正（`半`→`分`）只是对含义的猜测，而不是纠错。
   - **最小编辑。** 只修正误识别的词；绝不插入说话者没有说出的词（`打完`→`打算` ✓；改写为 `打算怎么` 会插入说话者从未说过的 `怎么` ✗）。
   - **优先选择能够解释错误的最小改动——在判断任何候选项之前，先按语音距离对它们排序。** 上述规则限制一个候选项可以改动*多少*；而当多个候选项读起来都通顺时，本规则决定*哪一个*胜出。ASR 错误是小幅扰动——引擎会把听到的声音映射到它所知道的最接近的词——因此，在所有语义合理的候选项中，改变音素最少的那个几乎总是说话者实际说出的内容。普通话中的一个实用特征是：**叠词或多音节词的尾部完整保留，只有开头音节不同**，这表明可能是声母混淆（卷舌音/齿龈音 `sh`/`s`、`zh`/`z`、`ch`/`c`，以及 `n`/`l`、`f`/`h` 这些音对），因此在断定整个词都被听错之前，*先*搜索韵母相同而声母不同的候选项。
     **该方法失效的场景并不是生成候选项时，而是审查已经存在的文本时**（上游修正，或你在第一遍检查中接受的修正）。审查现有文本会让你进入验证模式：你会问“这样是否合理？”，发现合理后便继续前进——完全没有意识到你拿到的只是一个候选项，而不是一个已经排序的候选集。一个改写三个音节的候选项可能非常地道，*同时*也可能只是改写；要把它与只改变一个音素的候选项区分开来，唯一的方法就是同时生成两者并进行比较。因此，在审查任何已经应用的修正时，必须强制追问：**是否存在也能解释这个问题的更小改动？** 如果你无法回答，就只是认可了结果，而没有真正核验。**有一项优先级高于语音最小改动原则：文档内自证——预期的词在该段其他位置正确出现，该段内容*确实围绕*这个指代对象展开，并且作为证据的出现位置已与原始文本核对无误**（由同一个上游处理过程写出的出现位置不能证明任何事情——裁判与被裁判者共享同一来源，属于循环论证）。如果两个候选项都以正确形式出现，则证据不具区分力；此时退回到语音最小改动原则或加入队列。当正在审查的修正有规则支持时，经过原始文本核实、且与该修正相矛盾的自证，*就是*第 2 步的恢复门槛所要求的肯定性证据——恢复原文，然后在此处停用该规则或缩小其适用范围。（2026-08 的真实案例：一处已应用的修正将原文中的「原全」改成了「完全」——发音最接近，也完全通顺——但周围对话在原始文本中三次提到「全职」，并且内容*就是围绕*全职展开；语音上改动更小的候选项反而是错的，只有自证检查发现了这一点。）
   第二遍检查的子代理若能返回 8 行精准结果，每次都胜过返回 8000 个 token 叙述内容的子代理。当你处于主上下文中时，可以使用 Task；如果它确实不可用——例如，这些指令本身正在一个无法再启动其他子代理的子代理中运行——就由你自己基于修正后的产物再进行一次彻底的逐行重读。不要用已知模式 grep 代替重读，然后声称已经完成。绝不能因为缺少工具而跳过第二遍检查。
7. **输出待检查列表，并将其加入队列**——聊天摘要会在会话结束时消失，因此每个 *Uncertain* 项都要双重写入：(a) 写入给人类看的聊天摘要——包括行号、你保留在原处的原始文本、你的怀疑内容，以及无法确认的原因；(b) 通过 `--enqueue-review items.json` 写入持久化审查队列（参见上文“审查队列与仪表板”；条目字段/别名模式见 `references/script_parameters.md` §Review Queue Item Schema——未知键会被静默丢弃，因此应写 `line`，而不是 `line_hint`），字段与聊天摘要相同，外加一组拟议操作，以便人类稍后在仪表板中通过一次按键解决它——或者由后续代理会话在获得新证据后将其关闭（`--resolve-review ID --decision … --note "<evidence>"`）。实体/姓名问题使用 `kind: entity`（它们会累积进入词典/名册，因此排在队列前面）；纯措辞疑问使用 `kind: wording`。如果没有任何不确定项，请明确说明。用于 `--enqueue-review` 的最小 `items.json`（每个不确定项对应一个对象；没有候选项时，`suggested` 可以为空——稍后人类可以在仪表板中填写）：

```json
   [
     {"file": "/abs/path/to/the/transcript.md", "line": 142,
      "original": "<garbled-name>", "suggested": "", "kind": "entity",
      "context": "<the whole sentence the token sits in, copied VERBATIM from the file>",
      "evidence": "speaker-label fragment near line 142; not in roster or project alias ledger — needs user confirmation"}
   ]
   ```
   **`file` 是让另外两项机制生效的关键字段，而遗漏它会以最糟糕的方式静默失败。** 以下两项保障都以它为前提（`review_queue.py:212` 和 `:793` 都会先检查 `file_path`）：
   - *逐字锚点拒绝。* 设置 `file` 后，如果 `context` 不是该文件中的字面子串，系统会**在入队时拒绝**（退出码 3）——这样，编写错误会立即暴露，而不是等到裁决时才出现。如果没有 `file`，就没有可供核对的文件，因此改写过的 `context` 会被接受，而偏移问题要到很久之后才会暴露。
   - *默认编辑操作。* 设置 `file` 且未显式提供操作包时，接受操作会执行一次 `file_edit(old=original, new=suggested)`。如果没有 `file`，接受操作仍会记录裁决结果，并且仍以退出码 0 结束——**但绝不会修改转录稿。** 不会出现任何错误；队列只会显示 `accepted`，而文件保持不变。

   有两个关键字段名，上述静默丢弃规则会在偏差一个字段的位置捕获它们：裁决字段是 `suggested`（`suggested_text` 的别名），**不是 `suggestion`**——拼写错误会让仪表板上的 Accept 按钮消失，随后 `--resolve-review` 会以 *"item N has no suggestion to accept"* 为由拒绝执行。操作包的字段名是 `actions`，**不是 `action_pack`**；它是可选的——只有在接受时还应执行 `dict_add` / `append_note`，才需要提供它。完整字段/别名表：`references/script_parameters.md` §审阅队列条目模式。

   **`original` 只包含可疑词元，绝不能包含整个句子**——句子应放在 `context` 中。无论你在 `original` 中放入什么，仪表板裁决都会将其*整体替换*：接受操作会执行 `file_edit(old=original, new=suggested)`，而覆盖操作则会用人工输入的文本替换整个 `original` 范围。如果 `original` 是像「我们的民宿就完了」这样的完整分句，而人工输入了两个字的品牌名「栖云」，那么整个分句都会消失——这是 2026-07 发生过的真实事故（#24），丢失的文字最后只能手工补回。使用 `original: "民宿的误写词"` + `context: "…我们的民宿就完了"`，就能让同一项裁决默认得到正确结果。（仪表板现在会在覆盖输入框上方显示完整替换范围，并在替换内容短得可疑时发出警告——但在入队时采用正确的粒度，才是零成本的解决办法。）
8. 对你实际编辑的文件进行差异验证（`diff <original> <your-working-file>`）——每一项更改都应能追溯到一项分诊决策
9. 完成定稿并归档：
   - **主要路径（推荐）：** 对原始 `file.md` 重新运行 `--stage 1`——**直接运行，不要使用 `--apply-all`**（显式指定 `--apply-all` 总会执行更正而不会完成定稿，因此陈旧的伴随文件无法静默吞掉这次运行）。如果 `file_stage1.md` 比 `file.md` 更新，transcript-fixer 会自动将其提升为 `file.md`，并删除中间伴随文件（`_stage1.md`、`_stage2.md`、`_dryrun.md`、`_changes.md`、`_needs_review.md`、`_uncertain.md`、`_对比.html`）。这是默认的定稿方式；它具备原子性，会保留手工编辑（当 `file.md` 更新时会跳过提升），并可避免 macOS 的 `mv` 别名隐患。
   - **原生 AI 更正模式**（你直接编辑了 `file.md`——也就是上述默认工作流）：`file.md` 已经是最终输出。无需也无法执行提升（提升保护机制会正确跳过，因为 `file.md` 比任何伴随文件都新），因此只需重新运行一次 `--stage 1` 进行确认。一次**更正数为 0 的重新运行不会写入 `_stage1.md`**；当没有任何内容被推迟处理时，也不会写入报告伴随文件——目录保持整洁，`file.md` 可以归档。（如果文本中仍存在中/高风险词典匹配项——例如你判定为误报并有意保留的内容——每次运行时都会重新生成 `_changes.md`/`_needs_review.md` 并列出这些匹配项；这是延期处理报告，并不表示定稿失败。完成这些条目的处置后将其删除。）如果重新运行确实发现了更正项，请将你需要的更正应用到 `file.md`，然后再次运行。
   - **手动备用方案**（仅当你需要完全控制，或者自阶段 1 运行后 `file.md` 又被编辑过时使用）：将更正后的内容保存回原始 `file.md`。（`file_stage1.md` 仅供参考/差异比较；不要将其作为最终输出进行编辑。）然后将 `file.md` 复制到 `next/00-Transcripts/YYYY-MM/`（或你的归档位置），并使用一条 Python 单行命令删除本地伴随文件：
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
   - 对最终文件重新执行 grep，搜索一项你确认已经应用的更正，以验证更正后的版本确实已写入。
   - **清查已从此转录稿派生的内容——更正不会自行传播。** 转录稿并不是终点产物：在生成后的几小时内，它就会被提炼为笔记、决策日志、分析、摘要和对外消息。所有这些内容都是依据*未更正的*文本编写的，因此你今天修正的名字在其中每一处仍然是错的——而且与转录稿不同，它们没有时间戳来提醒读者该拼写可能有问题。实测案例：一个听错的人名进入了两份分析文档，并且距离写入一条发给相关当事人的消息草稿只差一步。
     要有意识地限定范围。**仅清查实体更正**（人名、公司、产品——绝不包括措辞，因为措辞从定义上说只与当前句子相关）。**搜索该转录稿所属的项目，而不是整个知识库**——在整个仓库中清查会命中无关项目，而其中的“旧形式”可能指的是*另一个真实存在的人*；这种结果比完全不清查还要糟糕。使用 **`grep -rn`，不要使用 `git grep`**：`git grep` 只搜索已跟踪的文件，而几小时前刚写出的文档——也就是本条所描述的整个场景——恰恰很可能尚未被跟踪（如果需要能感知仓库的版本，请使用 `git grep --untracked`）。
     应当**排除证据链**，而不是对其进行“修正”：步骤 2 的上游差异比较所依赖的原始 ASR 基线（`transcript_raw.txt` 及类似文件），以及 `_needs_review.md` / `_changes.md` 伴随文件，都是*有意*保留旧形式的——重写它们会破坏下一次运行与原始内容进行差异比较的能力。（无论如何，队列条目都不会受到影响：它们锚定的是转录稿本身，并且存储在文件 grep 无法触及的 SQLite 中。）
     逐项审查每个命中结果，而不要盲目替换——这是对少量文档进行的受监督检查，不是批处理工作流规则所禁止的、不受约束的跨文件 `sed`。
   - **防止下一次发生同类问题的习惯**——这不是本次运行中的操作，而是之后处理转录稿时应遵循的规则：当你把专有名词从转录稿中引用到笔记、报告或消息里时，应先在人员名册或项目别名台账中查证，再进行粘贴。上述清查是一条补救路径，而之所以需要它，只是因为这个名字第一次被带出转录稿时没有进行查证。采用与步骤 4 相同的查证阶梯，只不过应用时机从更正时改为导出时。
9b. **移动或重写转录稿会使队列中尚未处理的条目失去关联。** 条目会记录转录稿的绝对路径，并依据该路径执行解决操作，因此**重命名**（步骤 10）会让所有待处理条目继续指向一个已不存在的路径——之后裁决会失败，并显示 `file gone: <path> — the transcript moved since enqueue`；该消息指出了原因，但没有相应的修复命令：CLI 可以入队、列出、显示和解决条目，但没有重新锚定或删除功能。**提升**（步骤 9 的主要路径）的问题更加隐蔽：文件仍然存在，因此条目稍后才会因锚点文本或上下文漂移而失败。这里有两个值得提前规划的后果。**如果无论如何都要重命名，就先重命名**——在步骤 7 入队之前，而不是之后；阶段 1 期间自动入队的延期处理项已经按当时的文件名记录，因此计划重命名的转录稿应在第一次运行阶段 1 之前就取得最终名称。**如果条目已经失去关联，唯一的退出方式是将其解决为 `kept_original`/`skipped`**（这两种操作都不会执行任何动作，也不会因锚点而失败），**或者针对新路径重新入队等效条目**——否则陈旧条目会永远保持待处理状态。单纯归档则不同，本身是安全的：`cp` 会保留原文件，因此锚点仍然有效；但这也意味着之后应用的裁决只会修正工作副本，而归档副本会继续保留错误——这与上文派生文档清查所要解决的“更正不会传播”问题相同。
10. **文件名规范——归档前重命名机器生成的乱码名称。** 如果转录稿的文件名是原始 ASR 产物、设备标签或不透明的时间戳哈希（`TX02_MIC021_20260720_095909_1.3x.md`、`soundcore Work_01-01 10-36.md`、`07-12-2026 20.07.md`），它就不是一个实用的产物。在文件进入共享仓库之前，将其重命名为人类可读的形式：`YYYY-MM-DD-HH-MM-<topic-or-speaker-summary>.md`，并根据项目情况使用中文或简短英文。标准是：人们应当仅凭文件名就能识别这场会议。如果内容显然属于某一业务线，并且仓库约定允许，也应将该业务线编码进 slug。
11. 将稳定模式保存到词典中（参见上文的“词典添加”）
12. 归档前，从最终文件中清除阶段 1 剩余的所有误报

### 常见 ASR 错误模式

AI 产品名称经常被转写错乱。以下模式会在不同的转写文本中反复出现：

| 正确术语 | 常见 ASR 变体 |
|-------------|-------------------|
| Claude | cloud, Clou, calloc, 克劳锐, Clover, color |
| Claude Code | cloud code, Xcode, call code, cloucode, cloudcode, color code |
| Claude Agent SDK | cloud agent SDK |
| Opus | Opaas |
| Vibe Coding | web coding, Web coding |
| GitHub | get Hub, Git Hub |
| prototype | Pre top |
| AI | a 夜, a 爱, ai, 阿伊 — 两个字母的英文术语在中文语句中说出时，会被识别成读音相近的音节（"All in a 夜吧" = "All in AI 吧"，用户于 2026-08-08 确认） |
| skill | SQL, SKU, 死抠 — 同样是两个字母拆分问题；`skill` 是 AI 工具相关对话中的高频词（SQL/SKU 在其他语境中确实是有意义的词——应根据上下文判断，绝不能仅凭字典规则处理） |

**中文语句中两个字母英文术语的模式具有普遍性**：在中文句子中说出的 `AI` / `skill` / `SDK` / `API` 足够短，因此 ASR 会将它们映射为任意读音相近的音节（包括像 `a 夜` 这样的整词混淆）。当转写内容讨论的是 AI 工具，而某段音节字符串作为中文毫无意义、但所处位置应当是英文缩写时，应首先检验缩写假设——然后在修正前通过发音距离进行确认。

人名和公司名称在不同会话中也会产生一致的 ASR 错误——务必将已确认的名称修正添加到字典中；对于项目特定的名称，请使用 `--domain <project>` 将它们隔离保存（参见“项目特定名称与人名修正”）。

### 数字：字典在结构上无法修正的类别

字典规则要求错误必须是*稳定的*——一个错误字符串对应一个正确字符串。数字错误不存在稳定的映射关系（`80` 在一次录音中变成 `800`，在另一次录音中又变成 `18`），因此无论投入多少字典维护工作都无法解决这类错误。它们同时也是代价最高的错误。关于实体级错误的 ASR 文献始终将数字和命名实体列为最糟糕的类别——远比总体 WER 所呈现的情况严重——并指出数字的*后续*标记（首位之后的数字）比首位数字表现得更差。这一排序是此处最关键的论断，也与你将在实践中观察到的情况一致：第一组数字通常是正确的，出错的往往是尾部，这正是错误数字依然读起来流畅的原因。（这类文献的二手摘要中流传着一些具体百分比；此处不予列出，因为尚未对照一手来源进行验证。如果你希望查看附带对应数据集的数字，请搜索 "ASR named entity error rate" / "entity-preserved ASR"。）

以下三个子类别分别需要采用不同的检查方法。任何一个都不能自动应用——数字只能依据证据判定，绝不能依据模式判定：

| 子类别 | 表现形式 | 如何判定 |
|---|---|---|
| **数量级** | 同一数额在复述时多了或少了一个零 | 根据同一段落中其他位置提到的数字进行算术核对；或使用第二份录音（见下文） |
| **量词丢失** | 说话者说的是“30 家/个”，却被转写为 `30+`（没有人会把“加号”念出来） | 下方的扫描器会找出这些情况（`orphan-plus`）；随后通常可以根据同一分句中的对象还原量词 |
| **极性反转** | 陈述的*上限*被转写成了*下限*——“只能给 N”被转写成“超过 N…保底” | 扫描同一会话中对该数字的其他表述；带有限制性情态词的那一处（只能/最多/至多/封顶/不超过/至少/起码/超过/保底/最少——脚本会输出同一份列表）几乎总是真实表述，因为说话者通常只会明确陈述一次界限，之后则以较宽松的方式进行复述 |

极性是最危险的一类，也是任何工具都无法捕获的一类：句子在语法上没有问题，数字也是对的，但含义却反了。只要转写稿中的某个数字最终会进入决策文档——例如价格、上限、份额或截止日期——就值得刻意通读检查。

**同一场会议的两份录音，是你能获得的最有力证据。** 当一次会议由两个独立系统录制时（两个平台，或一个平台加一台本地录音设备），它们的数字错误互不相关，因此，出现分歧可以定位错误，结果一致则可以确认无误。这就是 ROVER（Recognizer Output Voting Error Reduction，识别器输出投票错误降低，NIST 1997）的人工双系统版本——这个名称值得记住，因为已发表的研究解释了为什么跨系统投票优于改进其中任何单个系统。不要丢弃已有会议的“冗余”第二份录音；对于那些最重要的数值，它正是一份参考转写稿。如果只有一份录音，而某个数字又至关重要，就通过此技能已有的路径靠耳朵确认：连接转写稿前置元数据中的 `audio:`（参见“为飞书妙记转写稿连接音频”），将该数字加入待复核项，然后在复核仪表板中按 `Q`——它会准确播放锚定的那段话，让你听到实际说出的数字，而不是再次阅读转写文本。对于姓名和术语，而非数字，拍摄的会议室内实物资料可以充当第二个系统——参见下文“会议室内实物资料是另一种独立引擎”。

**数字槽位损坏——替换操作误伤数字时。** 还有一种不同的故障会产生相同的症状：本来针对其他内容的全局替换命中了数字内部。典型触发方式是重新标记某位说话人，而其说话人分离标签恰好是一个纯数字——全局替换该数字虽然修复了说话人行，却悄无声息地破坏了所有包含该数字的数值（`21 册`、`3+1`、`8.8 折`，以及标题中的日期，都会有一个数字被替换成人名）。转写稿读起来仍然流畅；只有数字错了。范围过大的字典规则也会产生相同的特征。

```bash
# Scan for canonical terms sitting where a digit belongs. The needle list is the
# dictionary's own to_text values — the strings this toolchain writes INTO
# transcripts are exactly the ones that shouldn't be inside a number.
uv run scripts/scan_numeric_consistency.py transcript.md --domain <project>
```

它输出的所有内容都只是**需要阅读的候选项**，绝不是要直接应用的编辑——而极性类别被刻意排除在自动化之外，因为一种会对正常输入发出警报的检查，人们最终会停止运行它。

你可以自行验证：`scripts/tests/test_numeric_consistency.py` 使用合成测试样例固定验证了上述承诺的两个方面——上面列出的每一种损坏形态都能被检测到，而曾导致此扫描器前两个版本失效的正常输入形态（术语仅仅与数字同时出现、术语出现在数字*之前*、标题开头的日期、时区偏移量）则保持静默。使用 `uv run --with pytest python -m pytest scripts/tests/test_numeric_consistency.py` 运行它。这些选择背后的误报*率*是在无法随项目发布的私有转写稿语料库上测得的，因此无法在此复现该比率——但由此获得的行为是可以复现的。

### 室内产物是另一个独立引擎（白板和幻灯片照片）

上述双录音规则还有一个跨模态的对应规则。当会议产生了书面产物——白板、挂纸白板、投影幻灯片——其照片就是录音之外的独立识别器：如果有一份录音，它是第二个引擎；如果有两份录音，它是第三个引擎。手写识别会在笔画上出错（潦草到无法辨认），而 ASR 会在声音上出错（同音词），因此原则上二者的错误基本不相关——这就是其机制主张；文末报告的收益只是一个观察到的案例（n=1），并非测得的比率。

在进行分流之前先询问是否存在产物：有没有白板或幻灯片的照片？会议纪要流水线的转录稿附近通常会有会议附件；如果不清楚谁持有这些附件，应当询问，而不是猜测。然后定位产物被**创建**时的片段——在转录稿中搜索产物自身包含的短语；如果找不到，则依次借助拍照相关话语线索、照片文件时间戳与转录稿时间线的对照，或说话人轮次结构。对白板上的某个词执行 grep 后零命中，是工具给出的报告，并不代表该词不存在：白板上的词恰恰可能是 ASR 识别错的内容。还要注意，你拿到的照片可能拍摄于文本中任何拍照相关话语之后——这些话语定位的是书写时刻，不一定是这张照片的拍摄时刻。

应优先匹配短语，并将时间戳回退方案视为这四种方法中最弱的一种，因为对于转发过的媒体，时间戳不仅可能缺失，还会*系统性地出错*：通过聊天应用转发的照片携带的是**重新导出**时间，而不是拍摄时间。在一张经微信转发的白板照片上进行测量后发现，文件系统创建日期与其 `mmexport…` 文件名中嵌入的毫秒级 epoch 时间都解码为同一个值——即照片被重新下载的时刻，比它所记录的会议晚了数小时。依赖这个时间会把该产物置于讨论*之后*，并得出反对二者配对的结论，而短语匹配随后证实了这一配对。因此，当文件时间显示“更晚”时，应将其视为尚未解决的问题，而不是证据，并转而寻找短语。

**以白板为先，并记住，识别错的人名会呈现为流畅文本，而不是噪声。**对于白板上的每个词元，找到它被写下的时刻，并判断该话语中的哪些内容与之对应。ASR 对人名的错误识别通常会表现为一个流畅、语义却不相关的短语，出现在正确的槽位中（例如，一个拉丁字母拼写的公司名称被识别成普通的双词中文短语）——因此要检验槽位；搜索乱码不会有任何发现。共有四种结果：

- **语音识别错误，白板内容清晰**——*只有在书写者理应知道规范写法时*（他们自己的组织、他们的客户、他们每天使用的名称），才以白板拼写为准。如果书写者也是在同一场会议中第一次听到该名称，那么这属于同源错误——书写者也可能听错了——而不是第二个引擎：将其送入队列。当这个锚点成立且原始文本也予以确认时，该条目可免除步骤 6 中“送入队列”的例外要求；如果没有这个锚点，则仍按步骤 6 执行。
- **白板内容无法辨认，语音清晰**——用口述内容还原潦草字迹。
- **两个通道对同一槽位给出了看似合理但彼此不同的解读**——这属于分歧，绝不能作为乱码消解，即使其中一方看起来更可信。将其作为不确定条目加入队列（原生 AI 校正步骤 7，`kind: entity`）；在批处理中，它也会加入下文批处理策略的步骤 7 候选清单。
- **只有一个通道包含该条目**（无人说出口的白板词语、从未写下的口述名称）——属于单一来源：是线索，而不是确认。

由两个渠道共同锚定的修正，达到了两个独立识别器所设定的门槛——**但证据强度不会改变目标路由**。词典添加矩阵中的实词规则仍然完全适用：真实姓名／真实品牌所在的行无论锚定得多充分，都仍为 ❌；确定性的非词修正进入 `--add`／名册，依赖上下文的修正进入领域上下文文件；仍需执行 FROM 侧冲突检查和语料库探查。记录修正时，应在目标位置本身注明由哪两个渠道共同锚定（上下文文件的陷阱行或名册的变体行——例如 `双证:白板+口述
2026-08`）。

一次观察记录（2026-08，一段 8 分钟边写边说的片段 × 一张手机照片）：四处由白板锚定的转录修正——其中两处是两个引擎单独都无法确定的公司名称——另有三处白板潦草字迹通过语音得到确认，还有一处双方解读都合理的分歧被正确地保留为未决状态。

### 高效批量修正策略

修正多个文件时（例如同一天的 5 份转录）：

0. **在改动任何内容之前，先对每个文件与原始版本做 diff**——如果这批文件来自某个在预分类阶段运行过自动修正器的流水线，那么归档的副本并非原始 ASR：上游编辑已被固化其中，却没有任何证据轨迹；在核实其来源之前，每一处编辑本身都应视为可疑项（上游 AI 的“修正”可能是一个流畅但错误的猜测——语法完美，但内容错误）。将每份已归档转录与其原始来源进行比较（同步引擎通常会在旁边保留 `transcript_raw.txt`，也可以从源 API 重新拉取），并首先分流处理每一处上游改动：对每项改动执行声音距离测试——先核查每处替换的来源（若背后有词典规则，则表示这是先前已确定的决策，撤销门槛更高，参见步骤 2）——撤销重写内容，将已确认的改动视为已确定项（绝不再次提出）。这是原生 AI 修正步骤 2 中单文件上游 diff 的批量版本——对于批处理，它是步骤 0，因为之后你读到的一切，都会受到你正在阅读的是原始文本还是修正后文本这一事实的影响。
1. **并行执行阶段 1**：一次性让所有文件通过词典处理
2. **先读完所有文件**：在修正任何内容之前，先形成对说话者、主题和反复出现的术语的整体认识
3. **编制全局修正列表**：同一场会话中的多个文件往往会重复出现许多错误（相同的说话者、相同的主题）。**如果某个错误反复出现——尤其是人名或项目术语——应使用 `--add` 将其添加到项目 `--domain`（参见上文“项目专用修正与人名修正”），而不是进行行内替换；这样它就能自动修正今后的每个文件，而不仅仅是当前这一批。**
4. **应用其余的一次性修正**（使用带多个 `-e` 标志的 sed，仅用于确实不会重复出现的修正），然后应用各文件中依赖上下文的修正
5. **核验所有 diff**，归档全部最终文件并清理附属文件，然后统一执行一次词典添加
6. **运行陷阱扫描**（原生 AI 修正步骤 6），一次性覆盖整批文件——在通读之后，以机械方式检查该领域中已记录的同音词陷阱，捕捉阅读时遗漏的问题
7. **一次性与用户核对所有不确定项，然后立即沉淀**——批处理会产生一份无法核实的候选项短名单（含混不清的人名、与你的训练数据相矛盾的版本号、无法规范化的姓名变体）。一次性提交整份短名单（不要在处理过程中逐项询问）：用户可以听音频／认识当事人，而每项结论都以相同方式落地——修正文件，使用 `--add` 将已确认的变体添加到 `--domain` 词典，并在同一轮处理中将其记录到人员名册或领域上下文中。在一次真实会话（2026-08-08）中，四项此类轮次中途给出的结论，都在给出的同一轮中完成了沉淀。与你的训练数据相矛盾的版本号说法，在用户确认之前并不是错误——“当前日期是 2026 年，v4 已存在”的可信度高于对 v3 发布时间的过时记忆；应提交确认，而不是预先判断。

### 通过动态工作流并行处理（大批量）

对于大批量文件（10 个以上），动态工作流（Dynamic Workflow）——每个文件对应一个子代理并并行运行——比 shell 循环更快，并且能让 AI 充分处理每个文件。以下四条规则都是通过惨痛教训总结出来的；忽略其中任何一条都曾造成过实际损失：

1. **将文件列表硬编码到脚本中——不要通过 `args` 传递。** 如果 Workflow 的 `args` 字符串数组包含非 ASCII 字符、括号或路径分隔符，它可能会悄无声息地变成空数组：脚本看到的文件数为零，不会生成任何代理，并会立即退出，同时显示类似“no files”的消息。纯字母数字标记可以正常传递，但文件路径应直接写入脚本主体中的 `const FILES = [...]` 字面量，并使用 `if (!FILES.length) return` 进行保护。

2. **将每个代理的作用域严格限定为一个文件，并在提示词中禁止跨文件使用 `grep -r` / `sed`。** 如果不加限制，代理会将局部修复（“此处的这个乱码术语 → 正确术语”）变成全局搜索替换，并编辑从未包含在该批次中的无关文件。请明确写出单个文件路径，并明确指示“仅编辑这一个文件”。

3. **批处理完成后，在信任结果之前使用 `git diff` 进行验证**（文件处于版本控制之下时适用）：
   - 对照预期文件列表检查 `git diff --name-only`——这可以发现任何越过其指定文件范围的代理。使用 `git checkout` 还原这些越界修改。
   - 对已删除的（`-`）行执行 `grep`，检查绝不能更改的不变量。对于已进行说话人分离的转录文本，这个不变量就是**说话人标签行**——ASR 修复只能修改口述内容，绝不能更改或重新分配“谁说了什么”。确认没有任何说话人行被删除或更改。

4. **保存任何汇总后的词典建议之前，先使用误报过滤器对其进行筛选。** 并行代理共同提出的规则远多于可安全使用的数量——而且它们看不到彼此的建议，因此重复和过度泛化的问题会不断累积。仅保留明确无歧义的**非单词 → 正确术语**映射。删除所有“来源”一侧在某些语境中是真实词语的映射：无论是常用词，还是仅在某一领域中才算错误的术语。针对真实词语的全局词典规则会悄无声息地破坏此后生成的每一份转录文本——这正是 `references/false_positive_guide.md` 所警告的问题。（在一次真实批处理中，约 80 条原始建议经过此过滤器后缩减为约 18 条安全建议。）

### 增强功能（仅限原生模式）

- **智能分段**：在符合逻辑的主题转换处添加 `\n\n`
- **减少填充词**：“这个这个这个”→“这个”
- **交互式审查**：应用更正前进行确认
- **上下文感知判断**：利用完整文档上下文消除歧义错误

### 何时改用 API 模式

对于批处理、不使用 Claude Code 的独立使用场景，或可复现的自动化处理，请使用在 `~/.transcript-fixer/config.json` 中配置的 API 密钥（或使用 `GLM_API_KEY` / `ANTHROPIC_API_KEY` 环境变量进行临时覆盖）+ Stage 3。

### API 回退

当 GLM API 在重试后仍不可用时，脚本会保持原始文本不变，并输出明确的警告。如果你需要在不使用外部 API 的情况下进行 AI 校正，请在 Claude Code 中运行并使用原生模式。

## 实用脚本

**时间戳修复**：
```bash
uv run scripts/fix_transcript_timestamps.py meeting.txt --in-place
```

**将转录文本拆分为多个章节**（将每个章节的时间重新基准化为 `00:00:00`）：
```bash
uv run scripts/split_transcript_sections.py meeting.txt \
  --first-section-name "intro" \
  --section "main::<verbatim line that starts the next section>" \
  --rebase-to-zero
```

**词级差异对比**（推荐用于审查校正结果）：
```bash
uv run scripts/generate_word_diff.py original.md corrected.md output.html
```

**完整的多格式差异报告**（Markdown 摘要 + 统一差异 + HTML + 行内标记）：
```bash
uv run scripts/generate_diff_report.py \
  original.md \
  original_stage1.md \
  original_stage2.md \
  -o ./diff_reports
```

## 输出文件

- `*_stage1.md` — 已应用词典校正
- `*_stage2.md` — AI 校正后的版本（API 模式）
- `*_changes.md` — 包含风险级别和行上下文的第一阶段报告（默认在安全模式下写入，也可通过 `--changes-file` 指定）
- `*_needs_review.md` — 在安全模式（默认模式）下推迟处理的中高风险校正
- `*_dryrun.md` — 所有第一阶段更改的预览，并标注实际运行时会应用哪些风险级别
- `*_uncertain.md` — 通过 `--extract-uncertain` 提取的疑似 ASR 错误
- `*_对比.html` — 可视化差异对比（在浏览器中打开）

在原生模式下，请直接编辑原始文件并将其用作最终输出；`*_stage1.md` 是可丢弃的差异对比/参考文件（请参阅原生 AI 校正工作流）。当 `*_stage1.md` 比输入文件更新时，**重新运行普通的 `--stage 1`（不使用 `--apply-all`）会自动将 `*_stage1.md` 提升为原始文件并清理附属文件**；这是推荐的最终定稿方式。`--apply-all` 绝不会进入提升流程——它始终会运行校正。**0 项校正**的运行（转录文本无误，或在输入文件已编辑后重新运行原生模式）绝不会写入 `_stage1.md`（否则只会复制输入文件）；如果也没有任何推迟处理的内容，则完全不会写入任何报告附属文件。当安全模式确实推迟处理中高风险规则时，仍会写入 `_changes.md` 和 `_needs_review.md`——它们就是推迟处理报告。

## 数据库操作

**编写任何自定义查询前，请先阅读 `references/database_schema.md`**——列名并不像你猜测的那样。校正列为 **`from_text` / `to_text`**（不是 `wrong_term`/`correct_term`，也不是 `original`/`corrected`）。猜测列名是这些查询因“no such column”而失败的最常见原因。

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

| 阶段 | 说明 | 速度 | 成本 |
|-------|-------------|-------|------|
| 1 | 仅使用词典 | 即时 | 免费 |
| 1 + Native | 词典 + Claude AI（默认） | ~1min | 免费 |
| 3 | 词典 + API AI + 差异报告 | ~10s | API 调用 |

## 随附资源

**脚本：**
- `fix_transcription.py` — 核心 CLI（词典、添加、审计、学习）
- `fix_transcript_enhanced.py` — 用于交互式使用的增强封装器
- `fix_transcript_timestamps.py` — 时间戳规范化与修复
- `generate_word_diff.py` — 生成单词级差异 HTML
- `generate_diff_report.py` — 多格式对比报告（Markdown、统一差异、HTML、行内标记）
- `split_transcript_sections.py` — 按标记短语拆分转录文本
- `fetch_minute_audio.py` — 获取飞书/Lark 妙记的音频，验证其与转录文本使用相同的时间线，并输出 `audio:` frontmatter 行（接通仪表板的 `Q` 播放功能）

**参考资料**（按需加载）：
- **安全性**：`false_positive_guide.md`（添加规则前阅读）、`database_schema.md`（执行数据库操作前阅读）
- **工作流**：`iteration_workflow.md`、`workflow_guide.md`、`example_session.md`、`example_session_dji_minutes.md`（录音器→妙记的完整会话案例：文档内自证链、第二轮拒绝标准、入队粒度）、`domain_context_guide.md`（各领域上下文文件的格式与模板）
- **CLI**：`quick_reference.md`、`script_parameters.md`
- **高级内容**：`dictionary_guide.md`、`sql_queries.md`、`architecture.md`、`best_practices.md`
- **运维**：`troubleshooting.md`、`installation_setup.md`、`glm_api_setup.md`、`team_collaboration.md`

## 故障排除

`uv run scripts/fix_transcription.py --validate` 用于检查设置是否正常。有关详细的解决方法，请参阅 `references/troubleshooting.md`。

## 下一步：整理为会议纪要

修正转录文本后，如果内容来自会议、讲座或访谈，建议将其整理为结构化内容：

```
Transcript corrected: [N] errors fixed, saved to [output_path].

Want to turn this into structured meeting minutes with decisions and action items?

Options:
A) Yes — run /daymade-audio:meeting-minutes-taker (Recommended for meetings/lectures)
B) Export as PDF — run /daymade-docs:pdf-creator on the corrected text
C) No thanks — the corrected transcript is all I need
```