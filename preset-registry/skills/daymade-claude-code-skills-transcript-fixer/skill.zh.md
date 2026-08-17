---
name: transcript-fixer
description: >-
  Corrects speech-to-text transcription errors using dictionary rules and Claude's built-in AI (no external API key required — Native AI Correction is the DEFAULT). Stage 1 alone is not the job. Stage 3 API is a backup for automation without Claude Code. Builds personalized correction databases that learn from each fix, auto-loads person-name ASR variants from your people roster, and reads per-domain context files that prime the AI pass for context-dependent homophones. Triggers when working with ASR/STT output containing recognition errors, homophones, garbled technical terms, person-name errors, or Chinese/English mixed content. Also triggers on requests to clean up meeting notes, lecture transcripts, interview recordings, or any text produced by speech recognition. Use this skill even when the user just says "fix this transcript", "clean up these meeting notes", or mentions garbled names without invoking ASR specifically.
---
# 转录纠错器

**默认模式：Claude 内置 AI（原生 AI 纠错）——无需任何外部 API key。**
Stage 1 字典纠错（免费、即时）→ Claude 自己读原文做智能纠错 → compound 进字典。
Stage 3 API 仅用于无 Claude Code 的自动化批处理场景（备选）。

两阶段纠错流程：先执行确定性的字典规则（即时、免费），再进行 AI 驱动的错误检测。纠错结果会不断积累到 `~/.transcript-fixer/corrections.db` 中，随时间推移提高准确率。

**各阶段真正擅长的方面**（用于校准认知，而非硬性规则）：字典最擅长处理*重复出现的*错误——产品名称、常见同音词，以及任何你之前纠正过的内容——且成本和延迟均为零。但对于全新的数据库、高质量 ASR（例如来自 Whisper、Otter、飞书或腾讯会议等强大引擎的转录文本），或专业领域（金融、医疗、法律），字典通常几乎匹配不到任何内容——剩余错误往往是它从未见过的专有名词和领域术语。在这些情况下，AI 阶段实际上承担了几乎所有真正的纠错工作。应将 Stage 1 视为针对已知重复错误的低成本预筛选器，而不是主要纠错器；当它在一份干净的转录文本中只修改了寥寥几行时，不必感到意外。

## 前置条件

所有脚本都使用 PEP 723 内联元数据——`uv run` 会自动安装依赖项。需要安装 `uv`（[安装指南](https://docs.astral.sh/uv/getting-started/installation/)）。

以下命令使用相对脚本路径（`scripts/<name>.py`），因此只能从该 skill 自身的目录中运行——而且在 agent 运行环境中，shell 的工作目录会在每次调用之间重置，这会导致第一条命令就出现 `Failed to spawn: scripts/fix_transcription.py`。**请从调用此 skill 时输出的 "Base directory for this skill" 行中获取 skill 目录**，然后在同一条命令中先 `cd` 到该目录，或者为每个脚本路径添加此前缀。不要依赖 `$CLAUDE_SKILL_DIR`——至少在某些运行环境中未设置该变量（已于 2026-08 验证），因此基于它构建的命令会发生它原本要避免的同一种错误。如果你已无法找到调用时输出的那一行，可以使用 `find -L ~/.claude ~/.codex -name SKILL.md -path '*transcript-fixer*'` 定位该 bundle——但它会返回数十个结果，包括每个已安装的*版本*，以及备份、暂存副本和编辑前快照——而第一个结果并不是最新版本。跳过路径中包含 `skill-before`、`-workspace`、`source-sync-backups`、`.tmp` 或 `.staging` 的任何结果。在剩余结果中，优先选择版本号最高的目录；某些安装位置（例如 marketplace checkout 或另一个 agent 的 skills 目录）完全没有版本号，因此如果最终需要在这些目录之间选择，请选取修改时间最新的目录，并在信任它之前，将其内容与本文件进行合理性核对。

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

在阶段 1 之后，Claude 会读取输出，并以原生方式修复剩余的 ASR 错误（无需 API 密钥）——**这是主要路径，即使只是快速生成转录稿，跳过此步骤也不是有效的捷径**（“快速、干净”的转录稿恰恰是词典最薄弱的场景，也是原生读取最重要的场景）。完整方法——按置信度分类、验证而非猜测、第二遍检查、待核查列表——详见下方的**原生 AI 校正**；请将该节视为权威依据。对于快速、干净的转录稿，该流程可简化为：如果存在相应领域的上下文文件，则读取该文件（`~/.transcript-fixer/contexts/<domain>.md`）→ 通读全文 → 直接修复明显的一次性错误 → 对任何重复出现或项目特有的错误（尤其是人名），使用 `--add` 将其添加到 `--domain` 词典，以便下次自动修复（参见“项目特定与人名校正”）。**如果你在阶段 1 之后就结束处理，必须明确说明原生校正不适用的原因——“流水线运行了脚本”不构成理由。** 唯一有效的豁免情况是：人类用户明确将本次运行的范围限定为词典校正（调用方流水线中固定配置的“运行阶段 1”不属于此豁免——参见下方的“由其他 skill 调用时”），或者你有证据表明该转录稿已经执行过原生校正（文件中带日期的注释或导入日志）。“转录稿看起来很短/很干净”“词典已经应用了 N 项修复”和“我赶时间”都不属于豁免情况——这些恰恰就是失败。

有关具体的输入/输出演示，请参阅 `references/example_session.md`。

### ⚠️ 阶段 3 API — 备选方案（仅限无 Claude Code 的自动化批处理）

**如果你正在 Claude Code 里运行此 skill，跳过本节——直接用上面的阶段 1 + 原生 AI 校正，不要跑 `--stage 3`。**
阶段 3 是给 CI/脚本/无 Claude 环境的批量自动化用的，需要额外配置 GLM API 密钥。

```bash
# 备选: 仅限无 Claude Code 的批处理
export GLM_API_KEY="<api-key>"  # From https://open.bigmodel.cn/
uv run scripts/fix_transcript_enhanced.py input.md --output ./corrected
```

有关完整的配置文件格式，请参阅 `references/installation_setup.md`；有关 GLM 端点的详细信息，请参阅 `references/glm_api_setup.md`。

## 核心工作流

具备持久化学习能力的两阶段流水线：

1. **初始化**（一次）：`uv run scripts/fix_transcription.py --init`
2. **添加领域校正项**：`--add "错误词" "正确词" --domain <domain>`
3. **阶段 1 — 词典校正**：`--input file.md --stage 1`（即时、免费）
4. **阶段 2 — AI 校正（默认：Claude 内置 AI）**：Claude 读取阶段 1 的输出，并以原生方式修复剩余错误——**这是主要路径，无需 API 密钥**。完整方法请参阅下方的**原生 AI 校正**。备选：`--stage 3` API 模式仅限无 Claude Code 的自动化批处理（需额外配置 GLM API 密钥——见上方 §⚠️ 阶段 3 API）。**在 Claude Code 内不要跑 `--stage 3`。**
5. **保存稳定模式**：每次会话后使用 `--add "错误词" "正确词"`
6. **审核已学习的模式**：使用 `--review-learned`，并通过 `--approve` 批准高置信度建议

**领域**：`general`、`embodied_ai`、`finance`、`medical`、`tech` 或自定义领域（例如 `legal`、`gaming`）
**学习机制**：重复出现的 AI 校正会写入 SQLite 历史记录；`--review-learned` 会将高置信度的重复模式转换为待处理建议，而 `--approve FROM TO` 会将完全匹配的建议提升至词典中。

### 新增安全与审查命令

- **安全模式是第 1 阶段的默认模式**：只有低风险（非单词、高置信度）的修正会自动应用；中高风险的修正（常见单词、≤2 字符、真实单词片段）会记录到 `*_needs_review.md`，而不是静默应用。因此，**干净的转写文本显示 `Applied: 0` 是正确行为，并非错误**——高风险规则会在 `*_needs_review.md` 中等待你或 AI 处理步骤进行判断。传入 `--apply-all` 可应用所有风险级别的规则（即旧有行为）；`--review` 被保留为已弃用的空操作。这样重新接入了之前虽有计算却被忽略的风险分类器——但这并不能消除所有误报：`from_text` 为 4 个及以上字符的有效短语时，规则仍会被评为低风险并自动应用（参见 `references/false_positive_guide.md` →“4 个及以上字符的真实单词盲区”）。
- **应用前预览变更**：`--dry-run` 会将第 1 阶段计划进行的每项变更及其风险级别写入 `*_dryrun.md`。
- **始终生成变更报告**：`--changes-file` 会将每项修正的修改前内容、修改后内容和风险级别写入 `*_changes.md`（在安全模式下默认启用）。
- **供调用方使用的机器可读状态**（`--json`）：在标准输出中打印一行 `{applied, deferred, output_path, needs_review_path, input_unchanged, review_enqueued}`（此次运行的人类可读日志会被重定向到标准错误）。使用方应读取此状态，而不是根据磁盘上是否存在 `*_stage1.md` 来推断是否执行了操作——对于某个领域，`input_unchanged: true`（或 `output_path: null`）**才是**权威的无操作信号。这是一项跨 Skill 契约（调用方的预分类链会使用它）；请保持字段名称和语义稳定（`review_enqueued` 是以增量方式添加的字段：表示有多少安全模式下延后处理的项目进入了持久化审查队列——参见“审查队列与仪表板”）。不使用 `--json` 时，人类可读输出保持不变。
- **提取不确定的 ASR 词元**：`--extract-uncertain -i file.md` 会将可能的错误（全大写短词元、音译片段、重复单词）写入 `*_uncertain.md`，而不修改原文件。
- **加载领域预设**：`--load-presets tech` 会导入一组精选的技术/Claude Code ASR 修正规则。
- **报告误报**：`--report-false-positive "<from_text>" "<to_text>" -d domain` 会禁用错误的词典规则（请传入该规则中存储的原文→目标文本对——对于误报规则，这与语义上的错误→正确方向相反；参见原生 AI 修正步骤 2）。
- **审计高风险规则**：`--audit` 会标记看起来可能导致误报的现有规则（常见单词、≤2 字符、子字符串冲突，以及——使用 jieba 时——4 个及以上字符的真实单词短语）。**它仅提供建议：只会找出候选规则，绝不会禁用任何内容。** 是否禁用必须由人工决定——请逐一手动审查每个命中项，并先备份数据库，因为审计无法了解你的上下文，而且会将很大一部分正确规则误标为问题规则（例如，`GDP 5.5→GPT 5.5` 通常看起来是错误的，但对于大量讨论 AI 的用户而言却是正确的修正）。参见 `references/false_positive_guide.md`。

### 由另一个 Skill 调用时（跨 Skill 调用契约）

此 Skill 通常会接入另一个 Skill 的摄取流水线——例如，某个会议同步 Skill 会在归档转写稿之前，将阶段 1 作为预分类钩子运行。该调用方流水线改变了一个会悄无声息地引发问题的前提，因此调用方必须遵守以下约定，否则就会遭遇两种已验证的故障之一：它会运行阶段 1，几乎不应用任何修正，却报告成功（延后的修正被悄无声息地丢弃——见下一节）；或者，它会运行阶段 1，完全跳过原生处理流程，却报告转写稿没有问题（见下文“**阶段 1 就是完整的脚本调用**”段落）。**此约定包含两个必须遵守的要求；只满足第一个要求，会让第二种故障在一种自以为操作正确的错觉中进入交付。**

**故障模式（已验证、可复现）。** 安全模式不会应用中高风险修正，而是将它们延后写入 `*_needs_review.md`。对于你手动编辑的单个文件，这没有问题——接下来读取伴随文件即可。但调用方流水线通常会在 `TemporaryDirectory` 内运行 transcript-fixer，并且只从中读回修正后的 `transcript.txt`。**`*_needs_review.md` 伴随文件位于该临时目录中，并会随目录一起被删除**——因此，字典中超过 95% 的修正会悄无声息地消失，而该次运行仍报告“完成”。对一份 95 分钟的转写稿和一个包含 108 条规则的领域进行实际测量时，安全模式仅应用了 **2/108**，并将 **106 条延后到一个随即被丢弃的伴随文件中**。该次运行看起来没有问题，但已知修正中只有约 2% 真正生效。随后，用户不得不手动再次运行 transcript-fixer，才能应用其余 98% 的修正。

**调用方规则——对于经人工确认的项目领域，传入 `--apply-domain`。** 流水线接入的领域（即其配置中的 `domains:` 列表）正是那些其规则已由人工针对该项目词汇进行整理的领域。此处的领域匹配并非猜测，而是已确认的修正，因此流水线应像批处理运行一样信任它：

```bash
# CORRECT for a caller pipeline — trust the configured project domains
uv run scripts/fix_transcription.py --input "$staged" --stage 1 \
  --domain "$domain" --apply-domain --json
```

使用 `--apply-domain` 后，同样的 108 条规则运行会以低风险应用 **97/97** 条修正，而不是 2/108。`general` 领域（兜底领域，整理程度较低）可以继续使用安全模式——只有项目特定领域赢得了完全信任。如果调用方无法传入 `--apply-domain`，则必须改为从 `--json` 状态对象中读取 `deferred`，并且要么将 `*_needs_review.md` 伴随文件持久化到非临时位置，以供下游流程处理；要么将非零的 `deferred` 数量作为失败呈现给用户。悄无声息地丢弃延后的修正并报告成功，正是这个缺陷。

**`--json` 状态行是约定接口。** 它会在 stdout 的一行中输出 `{applied, deferred, output_path, needs_review_path, input_unchanged}`。`deferred` 是绝不能被悄无声息地丢失的数值。`input_unchanged: true` / `output_path: null` 是“此领域有 0 条修正”的权威信号——切勿根据磁盘上是否存在 `*_stage1.md` 来推断是否未执行任何操作（正是这种文件存在性检查曾经中止整个处理链并丢失修正）。请保持这些字段名及其语义稳定不变；调用方的预分类处理链依赖它们。

**互补的另一面：让词典保持活跃。** 信任 `--apply-domain` 的调用方流水线，其价值取决于项目领域词典的充实程度。下游原生修正流程做出的每一项已确认修正，都应通过 `--add` 添加回该领域（`--add "ASR-variant" "correct" --domain <project>`），这样下次导入时就能自动修正，而原生修正流程的工作量也会越来越少。冷启动的领域词典 + `--apply-domain` 仍然几乎不会应用任何修正——解决办法是将 `--apply-domain` 与持续执行 `--add` 的规范结合起来。

**阶段 1 是完整的脚本调用——但绝不能是整个作业。** 上述约定可防止阶段 1 悄无声息地丢弃它自己的修正；但它并未规定如何处理那道负责完成干净转录稿大部分修正工作的流程。调用方如果在阶段 1 后就停止，交付的将是一份原生 AI 修正流程从未审阅过的转录稿，却还把它报告为干净。因此，调用方的导入步骤必须满足以下二者之一：自行运行原生 AI 修正流程（将已归档的转录稿交给加载了**此技能**的智能体〔也可以是当前智能体〕——必须加载技能，而不只是提供脚本路径；无智能体的 CI 自动化则改为通过上述阶段 3 API 流程完成）；或者向用户明确显示“仅完成阶段 1”，将其标记为未完成状态，绝不能报告为成功。还要注意此技能接入方式中的陷阱：如果调用方仅通过脚本路径引用它（例如 `transcript_fixer.script_path` 配置项），就永远不会加载此文件，因此其中的所有约定——包括这一项——对该次运行都是不可见的。只接入脚本路径而不接入技能，正是导致 2026 年 8 月“命中 0 项、宣告干净、漏掉 54 个错误”事故的配置。

**修正后，始终将可复用的修正保存到词典。** 这是此技能的核心价值——完整检查清单请参阅 `references/iteration_workflow.md`。

### 修正后添加到词典

完成原生 AI 修正后，检查所有已应用的修正，并决定哪些需要保存。请使用以下决策矩阵：

| 模式类型 | 示例 | 操作 |
|-------------|---------|--------|
| 非词语 → 正确术语 | 克劳锐→Claude, cloucode→Claude Code | ✅ 添加（误报风险为零） |
| 生僻词 → 正确术语 | 拉行链→LangChain, 哈金费斯→Hugging Face | ✅ 添加（先确认它不是实际存在的词） |
| 人名/公司名 ASR 错误 | 卡帕西→Karpathy, Anthropics→Anthropic | 对于**重要且反复出现的人物**，改为将其添加到你的**人物名册**中（参见下文“人物名册”）——名册可携带人物关系上下文，并且在数据库重置后仍可保留。对于仅出现一次的名称：✅ `--add --domain`（稳定、唯一） |
| 常用词 → 上下文词 | 争→蒸, 减→剪, affect→effect | ❌ 绝不能添加为规则——应改为在该领域的上下文文件中记录这一陷阱及其消歧线索（参见“领域修正上下文”） |
| 真实品牌 → 另一品牌 | Xcode→Claude Code, Clover→Claude | ❌ 跳过（这些词在其他上下文中是真实有效的词） |
| 真实姓名 → 另一真实姓名 | `李明`→`黎明`（不同项目中的两个真实人物） | ❌ 绝不能设为规则——其风险与真实品牌 → 品牌相同，但它会错误篡改真实人物的姓名。应改为记录成带有消歧线索的领域上下文陷阱（参见原生 AI 修正步骤 4 中基于用户裁定的细化规则） |

**折中方案，而且它只适用于标有 ❌ 的行中的一行。***常见词 → 上下文词*这一行（`争`→`蒸`）禁止将**孤立的**常见词设为规则，因为该规则会在这个词被合理使用的所有地方触发。但这并不禁止在同一个修正中携带足够多的周边文本，使该短语只出现在误听情形中——`村里商量` → `<name>商量` 是可以辩护的，而单独使用 `村里` 则会非常鲁莽。**这并不能放宽*真实姓名 → 另一个真实姓名*这一行的限制，并且绝不能将其锚定到词典中**：按照该行本身的说明，应将其保留在领域上下文文件中。

之所以排除这种情况，是因为**无论验证器给出哪种结果，在人名问题上都不可信。** `--add` 会运行 jieba 检查；当 FROM 侧可以拆分成全部已知的词时，它会发出警告，而某个人名是否算作“已知”纯粹取决于 jieba 词典的偶然收录情况：经实测，`李娜商量` 会触发警告（`李娜` 的词频为 438），而 `张伟商量` 不会有任何提示（`张伟` 不在词表中，词频为 0）。因此，一条以人名为锚点的规则安静通过并不能说明任何问题，而它触发警告同样不能说明任何问题。对于这种会在今后每一份转写稿中影响真实人名、且又没有可靠信号可供判断的类别，该行规则必须排除在外。（同样的推理也适用于*真实品牌 → 另一个品牌*这一行：`Xcode`→`Claude Code` 在一个项目中是正确的，却会在下一个项目中毁掉构建日志，而且没有任何验证器知道你当前处于哪一种情况。）

**警告与错误，因为它们最终导致的结果不同。** `valid_phrase` 警告表示*需要人工检查*，**而不是** *规则已被拒绝*——规则仍会被添加，并且 `--add` 以状态码 0 退出。`common_word` 和 `both_common` 是**错误**：`--add` 以状态码 1 退出且不会写入任何内容，只有 `--force` 才能绕过。`substring_collision` 则可能是*两者中的任意一种*，取决于触发的是哪个分支——命中精心维护的冲突映射时是错误，而更广泛的动态检查只会发出警告，规则仍会被写入。因此，应查看退出状态，而不是只关注输出信息：一次动静很大的添加操作可能已经成功，而一条你以为已经保存的规则可能根本没有进入数据库。只有在弄清楚是*哪项*检查提出异议之后才应使用 `--force`，因为它也会让阻断性检查失效。

有一个注意事项决定了是否值得添加锚定规则：应锚定到**反复出现的搭配**，而不是一次性的句子片段。某个特定句子的片段永远不会再次匹配——它会占用一条词典记录，无法产生任何累积收益，而正是这些无效记录让领域加载变慢并难以审计。即使搭配也会过于狭窄时，这类陷阱也应该连同用于消歧的线索一起放入领域上下文文件。

**添加之前先测量语料库——验证器看不到你的项目。** 内置安全检查回答的是“这在中文中是不是一个真实存在的词”；它们无法回答真正决定某条项目领域规则是否成立的问题：*“当这个词出现在此项目的转写稿中时，它是否曾经表达其真实含义？”* 这是一个实证问题，而获取证据只需一条命令：

```bash
# How does this term actually appear across the project's transcripts?
uv run scripts/fix_transcription.py --probe "候选误识词" --corpus /path/to/transcripts/

# Or probe as part of the add itself (prints the evidence before writing):
uv run scripts/fix_transcription.py --add "候选误识词" "正确词" --domain myproject \
  --check-corpus --corpus /path/to/transcripts/
```

该探测工具会输出每个文件的计数和采样的上下文窗口，并附带
判定规则：如果采样到的每次出现都是 ASR 错误 → 使用裸规则是
安全的；如果存在任何真实语义 → 使用带锚点的形式，或者不要添加（转而将这个陷阱
记录在领域上下文文件中）；出现次数为零 → 裸规则的风险为零，但也不会产生
任何累积收益。它消除的意外情况是：直觉上认为“这显然是一种错误形式”，
但经过 30 秒的快速检查，却发现该词在整个语料库中承载着完全真实的
含义——或者反过来，一个“真实词”在语料库中的每一次出现其实都是误听，
因此裸规则是安全的，而词语检查工具却可能会让你不敢使用它。

在一个会话中批量添加多项纠正：
```bash
uv run scripts/fix_transcription.py --add "错误1" "正确1" --domain tech
uv run scripts/fix_transcription.py --add "错误2" "正确2" --domain business
# Chain with && for efficiency
```

## 审核队列与仪表板（不确定项 → 一键判定）

已确认的纠正会通过词典持续积累；而**不确定的**纠正过去则会
消失——原生处理过程会在聊天中列出它们（会话结束后即丢失），
安全模式下推迟处理的项目会留在 `*_needs_review.md` 边车文件中（会被使用临时目录的
调用方丢弃），而学习到的建议则停留在一个无人运行的 CLI 后面。审核
队列在 `corrections.db`（`review_items`）中为这三类项目提供了统一的持久化存储位置，
而仪表板让判定它们几乎不费力——正是这种操作阻力横亘在
“AI 怀疑存在错误”和“词典学会答案”之间。

**队列 CLI**（均支持 `--json`）：

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

每个项目都包含：原始文本（在文件中保持不变）、预先填入的
建议、`kind`（`entity`/`unknown` 排在队列前面——它们会累积到
词典和名录中；`homophone`/`wording` 排在后面）、搜索阶梯
生成的证据，以及一个可选的**操作包**，它会在接受时执行：`file_edit`
（替换转录文本中的内容）、`dict_add`（添加到某个 `--domain` 词典）、
`append_note`（向领域上下文文件添加一条陷阱说明）。没有操作包但存在
文件锚点时，默认执行单个 `file_edit`。

**失败时关闭的锚点防护机制**：整个操作包会在内存中
基于文件的当前状态进行规划（每项编辑都会依据该操作包中之前操作执行后的
内容进行验证），只有当所有操作都成功完成规划后，
才会向磁盘写入任何内容——原始文本缺失（文件在入队后已被编辑）、
存在歧义（出现多次，且行提示附近没有唯一匹配项），或
上下文已漂移（附近没有任何行与入队时记录的片段匹配）→
不会写入任何内容，CLI 以退出码 2 退出，并输出 `{"error": "re_anchor_needed"}`
状态对象，同时该项目仍保持待处理状态。错误的自动编辑比
漏掉一次编辑更糟。机器调用方应解析标准输出中的 `error` 字段，而不是
仅依据返回码（argparse 用法错误也会以退出码 2 退出）。当判定为 `overridden` 时，只会
执行重新指定目标的 `file_edit`——针对原建议的 `dict_add`/`append_note`
操作会被丢弃（它们原本是为已被人工否决的建议规划的）。
（一个关于适用范围的说明：仅当原始内容出现次数超过
一次时才会执行上下文检查——唯一出现项不存在需要拒绝的相似匹配，因此
单次出现的编辑无需检查片段即可应用。）

**当防护机制拒绝时：`--reanchor-review` 会修复该条目。** 拒绝并非
死路，也绝不意味着应该绕过队列手动编辑文件——那会使条目永远处于待处理状态，
且编辑未经审计。运行重新锚定，然后再次进行裁决：

```bash
uv run scripts/fix_transcription.py --reanchor-review <id> [<id>...]
# file itself is gone (moved/renamed/cleaned)? add search root(s):
uv run scripts/fix_transcription.py --reanchor-review <id> --reanchor-root <dir-with-transcripts>
```

系统会根据磁盘当前状态修复两种漂移情况，且两者均采用失败时关闭的策略：
**上下文/行漂移**（文件入队后被编辑——在文件中重新定位 `original`，
优先选择仍与已记录的上下文片段匹配的行，而不是仅按距离选择，并刷新行号和逐字上下文）
以及**文件消失**（在记录的父目录以及每个 `--reanchor-root` 中搜索包含
`original` 的 `*.md`；恰好有一个候选文件时重新指向锚点，没有候选时不做任何更改，
有多个候选时则要求使用 `--reanchor-to FILE`——即显式指定目标的形式；如果目标文件中
不存在 `original`，该形式本身也会被拒绝）。成功重新锚定后，
防护机制的上下文检查将通过，`A`/`W`/CLI 解析会正常继续
（显式操作包会将其 `file_edit` 路径重写为新文件）。拒绝消息本身会指出此命令。
（根因追溯于 2026-08-03：一个使用改写后上下文入队的条目永远无法完成裁决——人工
覆盖在防护机制处失败，而在此命令出现之前，文件已被绕过队列手动编辑。）

**应提升每条 `decision_note`；队列只负责存储它。** 仪表板的
备注字段和 CLI 的 `--note` 会记录审阅者的理由，但二者都不会将该理由
转化为可复用的规则。完成一批审阅后，检查完整的队列 JSON：

```bash
uv run scripts/fix_transcription.py --list-review --review-status all --json
```

人类可读列表从不显示 `decision_note`。人类可读的
`--show-review` 仅在条目离开 `pending` 后显示它；JSON 始终携带该字段，
包括被 `reopen` 恢复为 `pending` 的条目。检查每个备注非空的条目，
无论其状态如何，并且不要预先限定字段列表，以免丢弃审阅者提供的字段。

应根据备注含义而非裁决结果来分流：

| 备注内容 | 将其提升至 | 不要 |
|---|---|---|
| 某个表面上的错误其实是有意且依赖上下文的替换 | 领域上下文文件，并注明用于判断何时应保留该替换的线索 | 使用 `--add`，因为它会重写文本 |
| 某条字典规则在不该触发的地方触发了 | `--report-false-positive "<from>" "<to>" -d <domain>` | 仅在上下文备注后保留该规则为启用状态 |
| 某个稳定的 FROM→TO 修正会在该领域中再次出现 | `--add "<from>" "<to>" --domain <project>`，但须遵守下方的真实词规则 | |
| 某个反复出现的人名具有不易推断的拼写 | 人员名册，该名册需手动编辑 | |

`decision_note` 从来都不是操作。预先规划的 `append_note` 操作仅在其条目
为 `accepted` 时运行；`overridden` 会丢弃特定于建议的 `dict_add` 和
`append_note` 操作，而 `kept_original` 和 `skipped` 不运行任何操作。
应在裁决后显式提升该备注。这与下方的 **“覆盖本身不会自行复合”** 属于同一缺口：
修正后的文本止于 `resolved_text`，而理由止于 `decision_note`。

**入队会逐字验证锚点——创作错误会在入队时失败，而不是等到裁决时。** 当某个条目声明了可读的 `file` 时，`--enqueue-review`
会检查 `original`（以及提供了 `context` 时的 `context`）是否原样出现在其中，并修正指向某个
唯一匹配项解析窗口（±3 行）之外的行提示（窗口内的提示可直接使用，因此不会改动；修正信息会
打印到 stderr）。其他任何情况都会被当场拒绝并给出原因，运行会以状态码 3 退出——JSON 会将
被拒绝的条目置于 `rejected_unanchored` 下（`added` 下的条目**已经**入队；请修正被拒绝的条目并
重新将其入队）。`context` 必须逐字从文件中复制；意译会在周边内容第一次发生编辑时使锚点漂移。
（尚不存在的文件不会进行验证——例如，为另一台机器上的文件入队的条目；这种情况由解析时的
防护机制负责。`stage1_deferred` 条目也可豁免——其 `from_text` 是先前规则在内存中应用后由引擎
逐步演变出的文本，因此此时尚未出现在输入文件中是合理的。）

**一次裁决只修复一处——其他同类项需要你自行清理。** 一个已解析的条目只会编辑一个文本范围。
当原始文本出现多次时，防护机制不会将它们全部编辑：它会选择上下文匹配且距离记录的行提示最近
的那一处；如果无法做出选择——完全没有行提示、行提示附近没有匹配项，或两处匹配项与其距离
相同——则会拒绝（`re_anchor_needed`）。无论哪种情况，其他匹配项都会保留下来，**包括裁决刚刚
编辑过的同一行上的匹配项**，而重复名称最有可能出现在这里。在一个真实批次中的测量结果是：
十个条目得到解析，其中四个仍留下了另外六处匹配项，而这些匹配项中有两处位于裁决已经修改过的
行上。因此，一个裁决批次还有后半部分：

```bash
# 1. See what was actually decided. The default listing shows PENDING only —
#    the items you just resolved are precisely the ones it hides.
uv run scripts/fix_transcription.py --list-review --review-status accepted
uv run scripts/fix_transcription.py --list-review --review-status overridden
# 2. Read the verdict that was recorded, per item.
uv run scripts/fix_transcription.py --show-review <id> --json
```

**替换文本应取自 `resolved_text`，绝不能取自列表行。** 在覆盖裁决中，人工输入的文本会写入
`resolved_text`，而 `suggested_text` 仍会保留他们*拒绝*的建议——并且人类可读的列表会打印该
建议。从该行进行传播会把被拒绝的答案写入所有剩余匹配项，这比完全不处理它们更糟。覆盖内容是
自由文本，因此请在传播前阅读它：否则，一次输入的拼写错误会变成五处拼写错误。

使用 Edit 修复其余匹配项，或使用限定于**该单个文件**的 `sed`——这是在同一文件内传播已经由
人工做出的决定，而不是批处理规则所禁止的跨文件查找替换——然后再次使用 grep 进行确认。

**只清理 `entity` 类型的条目。** `homophone` 或 `wording` 裁决是针对*该句子*的判断——这些是
第 5 步所说的需要锚定到周边文本的上下文相关类别，也是 `争`→`蒸` 这一行排除在一揽子规则之外
的类别。将其中一项传播到整个文件，正是词典矩阵旨在防止的错误。

**即使在 `entity` 内，裁决针对的也是该实体，而不是每个听起来像它的 token**——这是步骤 4 中的例外规定，保持不变。如果某次出现指的是一个*被提及的*第三方，而不是正在被称呼的人（“I'll ask
`<token>` from the bank”），则完全可能需要做出相反的处理：保留它，并将其单独加入队列。人工**仅通过听取一个片段**得出的裁决也应同样谨慎对待——那几秒音频只能确定该次话语，而第二次出现就是另一次话语。批量处理那些显然是同一实体且含义相同的出现位置；这是常见情况，也是上文度量所统计的情况。

**应在整个批次完成裁决后再进行批量处理，而不要在两次裁决之间处理。** 如果某个仍待处理的项目锚定到一个已被批量处理的出现位置，该项目的保护检查就会失败
（`re_anchor_needed`，退出码 2），因而必须重新加入队列。

**覆盖操作本身不会自动产生后续效果——请使用 `--add` 完成它。** 当状态为
`overridden` 时，队列会丢弃 `dict_add` / `append_note` 操作（它们原本是针对被人工否决的建议而规划的），因此，整个循环中最强的信号——人工亲自纠正 AI——反而是唯一一种永远不会进入词典的情况，除非你将其显式加入：
`--add "<original>" "<resolved_text>" --domain <project>`，同时遵循上文的真实词规则。

**仪表板**（单个审核者，本地运行）：

```bash
uv run scripts/review-dashboard/server.py   # opens http://127.0.0.1:8767
```

Prodigy 风格的单焦点卡片：实时显示文件上下文并高亮锚点行，预先填入建议，展示证据，以键盘操作为主——
`Q` 播放该段话语 · `A` 接受 · `R` 原文正确 · `W` 覆盖
（输入正确文本）· `S` 跳过/无法判断 · `Z` 撤销 · `↑↓`/`J K` 导航
（裁决键特意集中在左手区域；右手可以始终放在鼠标上）。环境变量选项：`REVIEW_DASHBOARD_PORT`（默认值为 8767），
`REVIEW_DASHBOARD_NO_BROWSER=1` 可跳过自动打开浏览器标签页。
读取操作直接访问数据库（只读）；**每次写入都会通过 shell 调用 CLI**，因此状态机、锚点保护检查和审计日志始终是唯一事实来源，而代理（CLI）和人工（页面）拥有同等的写入权限。

**音频播放（`Q`）**——审核者往往无法仅凭文本判断一段含混不清的话语；听取原始音频中的那一秒即可确定。转录文本需在 frontmatter 中显式声明其录音文件，才能启用此功能（不会隐式扫描目录——如果缺少该字段，卡片就不会显示播放按钮）：

```yaml
---
date: 2026-08-02
minute_token: abc123
audio: /absolute/path/to/recording.m4a
---
```

你需要添加的是 `audio:` 这一行；其他字段代表转录文本中已有的任意内容。它被**有意写成不带任何修饰的形式**——原因见下文；还请注意，这个示例经常被逐字复制，以至于该行末尾的 `#` 注释不止一次作为真实 bug 被发布出去。

**请将该行添加到转录文本已有的块中——不要在末尾追加第二个块。** 同步后的转录文本通常已经带有 frontmatter（`date`、`minute_token`、`participants`……），而解析器会在遇到第一个 `---` 终止符时停止，因此不会读取位于其下方的第二个块。

**值必须裸写——末尾不要添加注释。** 解析器会获取第一个冒号之后的所有内容（`line.split(":", 1)[1].strip()`），且不会移除 `#`，因此 `audio: /path/x.m4a  # same timeline` 会被解析为一个以 `# same timeline` 结尾的路径，而该路径并不存在。区块的格式同样有严格要求：必须从第 1 行开始，以其对应的 `---` 结束，并且键必须顶格书写，不能缩进。

上述任何错误都会导致相同的结果——卡片**既不显示播放按钮，也不显示错误**，看起来就像“这份转录没有音频”。如果你原本认为某张卡片应该有音频却没有，请先检查前置元数据，再怀疑录音文件。

该文件必须与**转录时间戳所指向的时间线完全一致**——也就是实际提供给 ASR 的那个文件。由 1.3 倍速输入生成的转录只能与 1.3 倍速文件配对；如果将其与原始文件配对，每个片段都会播放错误的时间段。

仪表板会根据锚点附近的说话人时间戳行（`<speaker> HH:MM:SS.mmm`）推导片段的时间窗口，通过 HTTP Range 流式传输文件（即时跳转，无需完整下载），并且只播放该段话；当剪切点落在句子中间时，`± 3s` 会扩大时间窗口。每种录音来源都应验证一次时间线配对（`ffprobe` 时长 ≈ 转录中的最后一个时间戳）——速率不匹配会导致所有位置都播放错误的时间段。

**为飞书妙记转录接入音频**（当转录来自 minutes-sync 流水线时，这是最常见的情况）——使用随附的脚本，它会完成下载、时间线检查，并输出前置元数据行：

```bash
uv run scripts/fetch_minute_audio.py \
  --token <minute-token> --profile <lark-cli-profile> \
  --output ~/.transcript-fixer/cache/audio/<name>.m4a \
  --transcript <path/to/transcript.md>
```

**这两个参数都来自转录正文之外。** `--token` 是转录自身前置元数据中的 `minute_token:` 字段（minutes-sync 流水线会将其写入其中；如果该字段不存在，妙记 URL 的最后一个路径段就是同一个值）。`--profile` 是 lark-cli 配置名称——使用 `lark-cli profile list` 列出所有配置，然后选择属于该录音所有者账户的配置；转录不会记录此信息，因此如果所有者不明确，应询问而不是猜测（使用错误的配置会以如下所述的静默方式失败）。

请将音频保存在文档仓库之外——媒体二进制大文件不应被提交进其 git。

**退出码**——检查状态，而不是输出：诊断信息会写入 stderr，而 `audio:` 行会写入 stdout，因此即使某次运行没有验证任何内容，也仍会输出一行看起来可用的信息。

| 代码 | 含义 |
|---|---|
| `0` | 已验证——音频和转录共享同一时间线 |
| `1` | 时间线不匹配：文件已下载，但**不要**接入 |
| `2` | 已下载，但配对未经验证——`ffprobe` 不存在或其输出不可用、未提供 `--transcript`、转录中没有 `<speaker> HH:MM:SS.mmm` 行，或所有这些行都是 `00:00:00`（argparse 也会在调用格式错误时以 2 退出；其消息会明确说明这一点） |
| `3` | 未生成任何可用内容——`--transcript` 路径错误（会在任何网络操作之前检查），或获取失败：lark-cli 报错、curl 失败、下载文件过小，或者 **`--profile` 无权读取此妙记**；这是最常见的原因，并不表示 token 错误 |

由缺少说话人时间戳行导致的 `2` 值得停下来处理，而不是设法绕过：仪表板使用这些相同的行来构建音频片段窗口，因此，与这种转写文本关联的音频没有任何可播放内容。

**手动操作方式**，用于 lark-cli 不可用或脚本失败时：

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

该脚本编码了三项处理逻辑，手动操作时每一项都可能导致实际失败：

- **lark-cli 自身的 SSRF 防护会拒绝它自己的下载主机。** 错误信息是
  `blocked download URL: local/internal host is not allowed`——飞书的
  签名下载域名确实名为 `internal-api-drive-stream.…`，而
  `internal-` 前缀会触发该防护。备用方案是使用 `--url-only`，再通过你自己的
  `curl -L` 下载，这也正是脚本执行的操作。
- **`--url-only` 的封装内容是真正的 JSON——请解析它，不要用模式匹配。**
  URL 位于 `data.download_url`（是嵌套字段，不在顶层），而正则表达式抓取会将
  `&` 等 JSON 转义保留为字面值，导致 URL 在第一个参数处被截断，并下载到重定向存根而不是
  音频。`json.loads` 可以原生处理这一点，而手写提取逻辑正是此转义错误的来源。
- **妙记是按租户、按用户归属的资源，因此通常出问题的是 `--profile`，
  而不是 token。** 来自其他租户的 profile——或对应账号从未获共享该妙记的
  profile——能够正常通过身份验证，但仍不会返回
  `download_url`。请传入属于录音所有者账号的 profile。

在将你打算交由听音判断的项目加入队列**之前**关联音频
（第 4 步会将跨语言专有名词路由到那里）——否则，审核者打开的卡片没有播放按钮，也无法回答你提出的问题。

**阶段 1 集成**：安全模式下延后的项目会在运行时自动入队
（`source: stage1_deferred`），因此调用方即使丢弃附属文件，也不会再丢失这些项目。例外情况：位于操作系统临时目录下的输入不会入队
（一旦暂存副本消失，锚点就会成为悬空指针）——`--json` 中的 `deferred` 计数仍会向调用方报告这些项目，而新增的
`review_enqueued` 字段则表示其中有多少项目已进入队列。

## 防止误报

添加错误的字典规则会悄无声息地破坏后续转写文本。**添加任何纠正规则之前，请先阅读 `references/false_positive_guide.md`**，对于短词（≤2 个字符）或在普通文本中本来就会正确出现的常见中文词，尤其如此。

## 项目特定纠正和人名纠正（`--domain` 隔离）

对于**反复出现的项目特定错误**——人名、项目术语、内部代号——最重要的处理方式是使用 `--domain` 标志。它也是对上述误报担忧的*解决方案*：在**你的项目中**正确的人名修复规则（例如 ASR 总是识别错误的某位队友姓名），可能会与其他人的转写文本中一个真实存在但写法不同的人名冲突——因此绝不能将其放入全局（`general`）字典。

`--domain` 通过隔离此类规则来确保其安全性：

```bash
# Add the rule under an isolated, project-named domain (not 'general')
uv run scripts/fix_transcription.py --add "<ASR-garbled-name>" "<correct-name>" --domain <project>
# Apply ONLY that domain's rules to this project's transcripts
uv run scripts/fix_transcription.py --input meeting.md --stage 1 --domain <project>
```

通过 `--domain <project>` 添加的规则，只有在纠正时传入 `--domain <project>` 才会生效。其他项目（使用它们自己的域或默认的 `all`）不会受到影响——因此，即使是存在风险的短词、常见词或人名规则也是安全的，因为它只会在该规则确实正确的项目中生效。

### 为什么这优于一次性脚本（核心价值，请勿跳过）

面对一份——或整批——充斥着相同 ASR 人名识别错误的转写文本，很容易让人想用简单的 `sed` / `python` 查找替换来解决。**不要这样做。** 这是使用此技能时最严重的反模式：

- 一次性脚本只能修复*当前这批内容*，随后这些知识便会消失：到了下一批、下一周、下一个项目，你还得从头重写。它无法积累价值。
- 字典能够**持续积累**：只需执行一次 `--add`，今后每份转写文本都会通过 `--stage 1 --domain <project>` 自动纠正。将这条命令接入项目的导入步骤，这些人名此后就会永久、自动得到修复。
- 字典具备误报防护机制（短词警告、`audit` 命令、`--report-false-positive`）；原始的 `sed` 完全不具备这些机制，会悄无声息地破坏形似的词语。

**经验法则：反复出现或项目特定的错误 → `--add ... --domain <project>`（它会持续积累价值）。绝不要使用一次性的 sed/python 替换。** 只有对于真正仅出现一次、永不复现的修复，一次性脚本才可以接受——即便如此，使用字典通常也更省力。

ASR 在中文人名上的表现尤其不稳定：同一个人可能会被识别成十几个同音变体（在一个真实项目中，某个姓名出现了 13 种以上的 `[姓变体]×[名变体]` 组合）。使用 `--add --domain <project>` 记录每一个已确认的变体，这样在未来每次运行时，它们都会统一归并为规范姓名。


### 人员名册（长期维护的人名 SSOT）

对于姓名总是被 ASR 错误识别的**重要且经常出现的人员**
（同事、客户、家人、工作坊参与者），应维护一个作为人名 SSOT 的**人员名册**
Markdown 文件，而不是逐个将其添加到 DB 中。当
`~/.transcript-fixer/config.json` 中设置了 `people_roster_path` 时，
Transcript-fixer 会在 Stage 1 阶段自动从该名册加载人名纠正规则。

**名册格式**（规范格式：`### Name` + `- **ASR 变体**: variant1, variant2`）：
```markdown
### Nina Zhao
- **ASR 变体**: Nena, 妮娜

### 小雨
- **ASR 变体**: 晓雨, 小宇老师
```

这两种示例形式都值得照搬。在中文语音中说出的英文名字会产生*两种*
变体：拼写错误（`Nena`）和中文音译（`妮娜`）；而中文昵称则会产生同音
变体以及带敬称的形式（`小宇老师`）。列出你实际见过的每一种形式；每一种
都会成为一条无需额外操作即可生效的规则。

**设置**（仅需一次）：
```bash
# Edit ~/.transcript-fixer/config.json and add:
#   "paths": { "people_roster_path": "/path/to/people.md" }
```

完成设置后，每次运行 `--stage 1` 都会自动合并名册中的纠正规则
（仅存在于内存中，绝不会写入 DB）。发生冲突时始终以 DB 为准，因此名册
只会填补空缺，而不会覆盖手动调优的条目。解析器参见
`scripts/core/people_roster.py`。

**优先级分为三层，其中第三层限定于域，而名册则是全局的**——这种不对称性
往往出人意料：

1. 在本次运行的域中处于启用状态的 DB 规则优先。
2. 否则，由名册提供该纠正对。
3. **除非**该纠正对在本次运行的域中已被禁用——此时名册中的对应规则也会
   被抑制，并且运行时会打印 `🚫 People roster: N variant(s) suppressed`。

第 3 层按域生效，因此使用 `--report-false-positive
--domain A` 停用某个纠正对，**不会**使其在 `--domain B` 下也被停用：名册
是全局的，并且在 B 中没有任何规则否决它，因此该规则仍会在 B 中生效。
这是有意为之的（一条规则在某个域中是误报，并不代表它在另一个域中也是
错误的），但这意味着“我已经禁用了它，它却仍然生效”几乎总是因为运行在
*另一个域*中——在编辑名册之前，请先检查这一点；编辑名册会立即在所有地方
停用该纠正对，包括共享同一文件的其他项目。`--report-false-positive`
现在会列出该纠正对仍处于启用状态的域，并以 `3`（已在当前域中禁用）或
`4`（仅存在于名册中，没有可禁用的 DB 记录）退出，以便自动化流程能够将
这两种情况与真正的失败区分开来。

**何时应使用名册，何时应通过 `--add` 添加到 DB：**

| 人员 | 添加到 | 原因 |
|--------|-------|-----|
| 长期反复出现（同事、客户、家人、工作坊参与者） | **people.md** | 包含关系上下文的 SSOT；DB 重置后仍会保留 |
| 一次性出现或次要的人名 | **DB**（`--add --domain`） | 快捷，无需上下文 |

**人名变体爆炸——同一个人，各种声母都可能出现。** 一个被说话人分离标注器标注过一次姓名的人，在正文中仍可能裂变成一整个变体家族，有时甚至横跨*不同的声母*（在一次 56 分钟的通话中，同一个姓被听成了 h/f/w/g/zh——真实案例 2026-08-08：一位说话人出现了七种不同的姓氏声母）。这不是一个需要逐个追查变体的问题；它其实是规范姓名问题的另一种表现。应将它作为一个整体处理：

1. **首先确定规范姓名**——询问用户，或使用经确认的人工标注说话人分离标签，确定一种拼写，然后再进行全面清理。自动分配的标签，或来源不明的标签，仍然只是候选项，必须遵循下方的验证阶梯。未确定规范姓名就处理变体家族，只会产生七个修了一半的结果和一份混乱的人员名册。
2. **在一次操作中全面清理文件里的每个变体**（对单个文件使用一条包含所有变体的 `sed` 命令，然后再次 grep，直至结果为零），不要逐个变体处理。
3. **在人员名册的 `ASR 变体` 行中记录整个变体家族**——包括你实际看到的每一种形式，无论它们多么古怪。下一份转录稿还会产生这个家族的新成员，而人员名册能在家族不断扩大的同时保持规范姓名稳定。
4. **敬称形式（`X老师` / `X总`）也是变体**——敬称是说话人实际说出的内容，因此绝不能将其*替换*为不带敬称的姓名，但其中的姓氏要进行同样的全面清理，并记入同一条人员名册记录。

**工作进行中收到的裁定必须立即累积——绝不要推迟处理。** 当用户在你仍在工作时回答姓名/数字问题（消息中途给出更正，或用一个词回答你的候选列表），该裁定就是整个循环中最有力的信息来源，而且记录它不费任何成本：在**同一轮**中修复文件、使用 `--add` 添加已确认的变体，并更新人员名册/上下文——不要等到“批处理完成后”，因为推迟的事项往往就此不了了之。在一次真实的批处理会话中，四项中途裁定都在收到的当轮立即完成了累积处理（2026-08-08），其中一项还纠正了审阅者自己关于版本号的过时训练数据。如果用户的裁定与搜索结果相矛盾，应以用户的裁定为准，而不是将其视为需要再次核查的异常情况。

## 领域纠错上下文（各领域的 AI 先验）

词典负责确定性替换；人员名册负责人名。还有第三类错误无法安全地归入其中任何一类：**依赖上下文的同音词**——只有在特定讨论语境中才算错误的词。例如，在讨论每天制作 N 条视频片段的会议中将 `减`→`剪`，或在财经通话中某个常用词与股票代码昵称发生冲突。针对常用词设置词典规则会悄无声息地破坏其他所有转录稿，而通用 AI 处理又缺少足够的领域先验，无法有把握地修正它——它要么猜错，要么将问题留给人工处理。（真实案例：一份转录稿中有四处 `减到 N 条`，实际都应为 `剪到`；AI 处理发现了疑点，但没有领域先验便不敢修改，最终只能由用户手动修正。）

领域上下文文件可以弥补这一缺口。每个领域对应一个 Markdown 文件，存放在**用户空间**中，与 `corrections.db` 和 `people.md` 相邻（绝不能放在 Skill 包内——这样它可以在 Skill 更新后继续保留，并确保项目知识的私密性）：

```
~/.transcript-fixer/contexts/<domain>.md
```

（如果你通过 `TRANSCRIPT_FIXER_CONFIG_DIR` 迁移了配置目录，上下文文件应放在该目录下的 `contexts/` 中。）

在进行原生校正时（参见下方工作流），应先读取该转录文本的领域上下文文件，再进行分类处理。该文件应包含三类内容：

1. **一行业务上下文**——该领域的录音通常涉及什么内容
2. **已知的同音词陷阱**——每项都应包含用于消歧的*上下文线索*（“当句子涉及制作/编辑片段时，应使用 `剪`”），还可以附上带日期的真实示例
3. **权威名称来源的指引**——项目的别名台账、相关人员名册章节、现有数据库领域——以便验证阶梯（下方第 4 步）知道应优先查找哪些位置

上下文文件中绝不能包含：硬性替换规则。将 `减→剪` 作为规则，既不应放入上下文文件，也不应放入词典——该文件只是通过先验信息和线索来辅助你的判断；它绝不授权盲目替换。每项修正仍须经过下方的置信度分类流程。

维护循环（与词典的 `--add` 习惯一致）：当原生会话中出现**依赖上下文的**重复性错误时——你在此处修复了它，而且它还会在该领域未来的转录文本中再次出现——请将其连同消歧线索追加到该领域的上下文文件中。确定性的非单词/名称修正仍应像以前一样添加到 `--add --domain` / 名册中。

格式和完整示例模板：`references/domain_context_guide.md`。

注意：上下文由**原生工作流**使用（由智能体读取文件——不涉及代码）。API 模式（`--stage 2/3`，备用通道）目前尚未注入这些上下文；如果该通道后续得以完善，也应将相同的文件提供给其提示词。

## 原生 AI 校正（默认模式）

在 Claude Code 中运行时，第二阶段应使用 Claude 自身的语言理解能力——对于高质量 ASR，几乎所有真正的校正都发生在这一阶段。**应根据转录文本调整投入力度。** 不要把一段 10 秒钟的备忘录变成研究项目，也不要对一场 90 分钟的战略会议敷衍了事。应根据录音本身的特征选择层级，而不是取决于你的心情：

| 判断信号 | **快速层级**（以分钟计，而非数小时） | **完整层级**（完整验证阶梯都有用武之地） |
|---|---|---|
| 长度 | 较短（≤ 约 15 分钟 / 几百行） | 较长（30 分钟以上 / 1000 行以上） |
| 说话者 | 一到两人，且姓名都是你已知的 | 3 位以上说话者，或存在陌生姓名 |
| 词汇 | 日常语言，无领域术语 | 领域术语密集（金融/医疗/法律/项目代号）或包含大量专有名词 |
| 重要程度 | 内部备忘录，用完即弃 | 面向客户、将提交至共享仓库，或会影响决策 |

- **快速层级**——执行阶段 1（`--apply-domain`）；如果存在领域上下文文件，则读取该文件；完整通读一次；直接修正明显的一次性错误；使用 `--add` 将所有重复出现的/项目特有的术语添加到某个 `--domain`。**跳过：**跨领域名称验证阶梯、第二遍子智能体检查、待核查流程。线性处理一遍即可完成。
- **完整层级**——执行下方的所有步骤：使用名称验证阶梯进行完整分类处理、由独立子智能体进行第二遍检查，并明确列出待核查项。这些投入是合理的，因为篇幅较长/领域术语密集的转录文本不仅错误更多，难以确认的错误也更多；而一旦错误的专有名词被提交到共享仓库中，就会传播开来。

录音可能很长，但仍属于快速层级（两位已知说话者、使用通俗语言）；也可能很短，却属于完整层级（一通 5 分钟的电话，充斥着陌生的药物名称，而且内容会用于生成报告）。应根据*词汇和风险程度*确定层级，时长仅作为平局时的判定依据——真正的工作重点就在这里。

**纠正范围包括元数据行，而不仅仅是正文。** 归档的转录文本通常带有由 ASR 生成的元数据——例如 `Keywords:` 行、frontmatter、标题——而这些行包含与口述正文中*相同的*识别错误（例如，正文中的每处提及都已从 `克劳锐` 纠正为 `Claude`，但 `Keywords:` 行仍然列着 `克劳锐`）。请按照相同规则纠正这些内容。不存在“元数据不可更改，保持原样”的例外：元数据同样是搜索/grep 的检索面，如果某个关键词仍保留 ASR 误识别后的形式，那么未来每次执行 `grep Claude` 都会悄无声息地漏掉它，即使正文看起来已经很干净。重新对最终文件执行 grep 以确认纠正确实生效时，也要将元数据行纳入检查。

1. 对所有文件运行阶段 1（字典）（如有多个文件则并行处理）
2. 验证阶段 1——与原始文件进行 diff。如果字典引入了误报，请改为从**原始**文件开始处理，并在原始文件上应用编辑。**这里出现的误报是你欠字典的一笔债**：同一条错误规则会在未来的每份转录文本上触发，直到它被停用。因此，一旦发现这样的规则——它把正确的话改错了，尤其是“真实词 → 真实词”规则（两边看起来都是有效词，因此非词防护机制无法捕获它们；而且使用 `--apply-domain` 时，无论风险类别如何，每条匹配规则都会被应用）——例如，一条 `买买→卖卖` 规则把正确的“买买工作流”改成了“卖卖工作流”——就应在同一会话中使用 `--report-false-positive <from_text> <to_text> -d <domain>` 将其禁用——参数必须严格按照阶段 1 的 `*_changes.md` 中显示的规则存储方向（From/To 列），或者按照字典中的实际记录传入，而**不是**按照“错误词 → 正确词”的语义传入。对于误报来说，这个方向有违直觉：`买买→卖卖` 规则存储的是 `from=买买, to=卖卖`（它把正确的“买买”改成了错误的“卖卖”），因此应传入 `"买买" "卖卖"`——也就是规则存储的 from→to 对，因为工具正是以此作为键。调用一次即可禁用该规则并降低其置信度（工具会输出 "The rule has been disabled"）；它不会再对下一份转录文本生效。如果该词确实存在*歧义*（在某些上下文中正确，只在此处错误），而不是规则本身明显有误，则不要禁用该规则——应改为在领域上下文文件中记录用于消除歧义的线索。只修复当前转录文本却不解除这个陷阱，就必然会让下一份转录文本再次踩中它。
   **而当输入已经经过自动纠正器处理时**（同步流水线的预分类阶段、之前的阶段 3 API 运行），你的输入就**不是**原始 ASR——上游纠正结果已经固化在其中，而且没有留下证据轨迹。在进行分流之前，应与原始来源进行 diff（调用方的原始转录文本——同步引擎通常会在纠正后的副本旁保留一份，例如 `transcript_raw.txt`——或者从源 API 重新拉取）。该 diff 会得出方向相反的两项结果：**(a)** 在核实其来源（见下文）之前，上游进行的每一次实体替换本身都应被视为步骤 4 分流中的可疑项，因为上游 AI 的“纠正”可能只是一个流畅但错误的猜测——真实案例：原始 ASR 中的「新的车辆」被流水线 AI “润色”为「新出来的反馈」（语法正确、看似合理，但实际错误：说话者说的是一个近音名称），而只有与原始文本的 diff 才发现了这一点；**(b)** 上游已经正确修复的内容应视为已解决——在提出一个其实已经应用的修复之前，先检查 diff，否则不仅会重复工作，还可能冒着把正确形式“修复”回错误形式的风险

**如何判断每一处上游更改——唯一有效的测试，以及无效的测试。** 对每一处上游编辑执行第 6 步中的*声音距离*测试，并遵循该步骤中写明的方向：**如果两边在语音上相差太远，不可能是任何 ASR 造成的替换，那么这就不是纠正——而是模型改写了说话者所说的内容，必须将其还原。** ASR 会听错声音；它不会把一个词换成同义词，也不会改变代词。有两种模式反复出现，而它们在页面上看起来都不像错误：
   - **将某个术语替换为一个看似合理的近义词。** 这两个词没有任何共同的声音，因此任何引擎都不可能混淆它们——而真正暴露问题的是语料库层面的情况：替换后的词在项目材料的其他任何地方都没有出现，而原词则是该项目的标准词汇（由之前某次会议定义的术语）。接受任一形式之前，先在整个语料库中 grep 这两种形式。
   - **改写代词或主语。** 改写后的内容读起来比原文*更*合乎逻辑，却悄然改变了陈述所指的人——这属于事实变更，而不是转录修正。在大多数语言中，不同代词在语音上彼此无关；如果引擎把一个代词误听成另一个，就会把整个句子都弄得面目全非。

   **但首先要问清楚上游更改来自*哪里*——声音测试只能对 AI 的猜测进行排序。** 即使调用方丢弃了伴随文件，来源仍然可以通过机械方式核查：`*_changes.md` 报告会标明每项更改的来源；如果该报告没有保留下来，就在 DB 中跨**所有**域查询对应的 from→to 组合（`SELECT from_text, to_text, domain, source, confidence FROM active_corrections WHERE from_text='<the raw form>'`）——只要命中，就说明该替换有规则支持；domain 列会告诉你应查看谁的先验信息，而该行本身会提供规范形式（`to_text`），供你在下文中搜索。由字典规则支持的替换在设计上就是声音相近的，因此会通过声音测试，看起来也已尘埃落定；恰恰是在这种情况下，不能轻率地自行决定还原。有规则支持的替换是一个**先前已经敲定的决定**——某个人或某次较早的运行已经判断过这个 from→to，并将其提交到该域中（`source` 列的值包括 `manual`/`learned`/`imported`，但其中没有一个会记录由*谁*确认——无论来源如何，都应将每条有效规则视为已敲定；下文所述的不对称性并不取决于作者身份）。还原它是在推翻一项决定，而不只是标记一个疑点，因此门槛是必须有肯定性证据，证明该规则*对于这份转录*是错误的。以下情况可视为肯定性证据：
   - **备选指代对象必须得到本次对话的支持**——此人在场、被直接称呼，或在这里被作为话题提及——而不能只是能在其他地方找到。另一个项目的人员名单或目录中有一个发音相同的名字，并不能说明当时房间里有谁。（2026-08 的真实案例：一名审阅者还原了一次正确的称呼形式应用——这条称呼形式规则是在该转录所属域中整理维护的——理由是一个*不同的*项目列出了一位称呼形式发音相同的同事；实际指代对象是规则中的规范人物，即两位说话者共同认识的联系人，并且在该域的上下文文件和项目文档中均有记录，而那位同事在对话中从未出现。用户不得不当场撤销这次还原。）
   - **搜索规范名/全名，而不只是表面的称呼形式。** 人物是以全名而非昵称记录的：对两种称呼形式执行 grep 会返回 0，但此人可能以全名在域上下文文件和项目文档中得到详尽记录。窄范围 grep 的零命中只是工具报告，不是不存在的证据——得出任何结论之前，应将搜索范围扩大到规范名称（规则行中的 `to_text`）、罗马字转写以及已知别名。只有在*扩大后的*模式仍然零命中时，才应该开始怀疑该规则。
   - **文档内经过原始文本核验的自证，如果与规则相悖，也足以达到该门槛。** 如果对话自身的原始文本中存在一些用例，表明说话者正确地使用了该词来指代*另一个*实体——而且该段落讨论的正是该实体，并非只是与之共同出现——那么该规则在这里就是误触发：先还原，然后按照上文的误报处理路径停用该规则或缩小其适用范围，因为它还会继续触发。要让这种证明真正成立，需要注意两点：“其他地方的正确用例”必须依据**原始**文本核查（如果这些用例本身也是由同一个上游处理流程写入的，那么判断者与被判断者同源，证明就是循环论证）；而且，如果*两个*候选词都在该段落中被正确使用，那么这种证明就不具区分性——应退回到语音最小差异原则或审阅队列。
   - 即使完成这些检查后，仍然无法确定本次对话真正指的是哪个实体，正确做法也是放入审阅队列（`kind: entity`），而不是还原：在问题等待处理期间，文本中应保留有规则支持的形式。这是有意偏向保留规则支持的形式——代价是，在队列完成处理之前，错误规则的输出会继续留在交付文本中。这个方向是刻意选择的：一个已入队、可见的错误修正，胜过一个流畅却隐蔽的错误还原；而且队列会迫使人们重新判断的是这条*规则*，而不仅仅是当前这个实例。

**为什么这需要专门的测试，而不能依赖你的判断：上游纠错器针对流畅性进行了优化，因此它输出的所有内容读起来都很顺畅——这使得“结果是否合理？”这一检查对于识别这种特定故障完全不具备区分能力。** 你不可能仅靠阅读发现它，而且流水线越流畅，错误文本看起来就越可信。diff 是唯一能够发现它的工具。由此有两个值得提前规划的后果：在你自己通读之前运行 diff，这样上游的编辑会以候选项而非你正在校对的文本的形式出现；而当你确实回退某项编辑时，要全面检查你已经写下的、引用了错误形式的所有内容（即步骤 9 的派生文档检查——根据回退前文本撰写的笔记和摘要会带有同样的错误，并且与转录文本不同，它们没有任何标记表明这一点）。
3. **加载该领域的先验信息，然后阅读完整的转录文本。** 如果此转录文本所属领域存在 `~/.transcript-fixer/contexts/<domain>.md`，请先阅读它——它会提示你应当留意哪些同音词陷阱，并列出步骤 4 的检索阶梯所使用的权威来源（参见上文“领域纠错上下文”）。然后，在提出纠正建议之前阅读**完整的**转录文本——后文语境可以消除前文错误的歧义（靠近开头处被识别错的人名，通常会在后文变得显而易见）。对于大型文件，可以分块阅读，但必须读完整个文件后再做任何决定
4. **将每个候选错误分入三个类别之一**——这种分类是最需要判断力的部分。**首先要克服三种反复导致人名被错误分类的本能反应**（这三种都是真实且反复出现的失败模式——它们会把本可修正的人名直接送入“询问用户”类别）：
   - **先看说话人标签——转录文本通常已经包含了这些姓名。**
     在进行任何搜索之前，先收集文件中的所有说话人标签；
     如果某个识别错误的词在发音上与其中一个标签匹配，那么它几乎肯定就是
     同一个人，而标签提供了正确拼写——标签是从姓名
     *登记表*中复制而来的（由标注录音的人提供，或来自说话人分离系统用于匹配的与会者名单 /
     声纹注册信息），而正文则是对语音声音进行的原始
     ASR 识别。这里有四项限定条件，其中第一项不是可选项。
     **(a) 仅当姓名用于称呼某人或自我介绍时才适用，绝不能用于指代他人。**
     “你好，<姓名>”和“我的名字是<姓名>”可以识别一位
     说话人；“我会去问银行的<姓名>”指的是第三方，而此人的名字可能只是
     *听起来*像某位说话人的名字——将其改写为某位说话人的姓名会篡改
     一个真实人物，这正是词典表中所称的“真实姓名 →
     另一个真实姓名 ❌ 永远不能作为规则”这一风险。仅仅因为这个原因，同一文件中
     两个发音完全相同的词也可能需要采用相反的处理方式，因此，被指代者的
     姓名必须继续沿检索阶梯查证，不能在这里直接确定。
     **(b) 与所有标签进行匹配——包括但不限于该文本块上方的标签**
     ——识别错误的姓名通常位于由其他人说出的文本块中
     （`A` 向 `B` 打招呼），有时也位于该说话人自己的文本块中
     （自我介绍）。**(c) 标签确定是谁；名单仍用于确定规范拼写**
     ——手工输入的 `Joe` 应规范为名单中的 `Jo`，只修正拼写，绝不扩充姓名长度。**(d) 由人工标注的标签代表人工身份确认：应直接采用，
     不要将该姓名放入待检查列表，也不要要求用户确认——
     他们已经通过添加标签回答了这个问题。**（真实案例：对一个打印在
     该说话人每个文本块上方的姓名走完了整个检索阶梯，一无所获，随后又要求用户
     确认。其实这些标签正是用户自己添加的。）
     如果无法判断标签是人工标注还是自动分配，
     **则假定为自动分配**：声纹匹配可能会把一个拼写完全正确的
     姓名分配给错误的说话人，而这绝不会显得像识别乱码——因此应将
     该标签视为需要通过检索阶梯确认的强候选项，而不是终止条件。
     对于 `说话人 N` / `Speaker N`、角色标签（`主持人` / `Interviewer`）、
     并非说话人的第三方，或本身明显存在识别错误的标签，
     应继续进入检索阶梯。只修正**正文**
     ——绝不要编辑标签或重新分配发言归属——并保持最小化编辑
     （不要把名字扩展成没人说过的全名），然后使用 `--add` 将
     已确认的变体添加到某个 `--domain` 中，以便下次免费自动修正该转录错误。
   - **根据发音而非字形判断 ASR 错误。** 中文 ASR 错误通常是同音字 /
     近音字替换，因此应根据发音而非字符是否完全相同来判断“是否为同一实体”。
     如果名单或词典中已有 `X晓Y`，而某个姓名被识别为 `X小Y`
     （小/晓发音相同），那么这就是**同一个人 → 确信无疑的修正**
     ——不要仅仅因为页面上的小≠晓就将其降级为不确定项。
     同样的逻辑也适用于外文姓名，只要其所有音节在发音上都能映射到
     近似同音的音译形式即可。词典中存在发音相近的规范形式，是支持该修正的
     *证据*，而不是应当忽略的不匹配项。
   - **但发音相似是确认身份的*充分*证据，而不是*必要*证据——且例外情况并非罕见个案，而是一整个类别。**
     当姓名以一种语言说出、而引擎却以另一种语言转录时（例如中文语音中的英文名字、
     音译的姓氏），识别结果在语音上可能与其规范形式**毫不相关**，
     更糟的是，它甚至可能看起来像另一个完全正常的*真实姓名*。
     在一个实际测量的案例中，同一个人被识别成了三个不同的词，
     没有一个与她的姓名近似同音，并且每个词看起来都可能是另一个完全不同的人；
     之所以能识别出这些词，只是因为三者都出现在同一位缺席的负责人理应出现的位置，
     而最终*确认*它们的是人工收听对应几秒钟的音频。
     **这并不会推翻上面的 (a) 条。** 该规则禁止以说话人标签为来源，
     将一个*被指代者*的词解析为某位**说话人**的姓名——这种失败模式会让
     第三方被错误替换为房间内的某个人。这里讨论的类别方向恰好相反：
     该词应解析为一位已知的**非说话人**，其规范形式来自名单或项目台账，
     并由人工听辨而不是标签来确定。当两种情况难以区分时，以 (a) 条为准，
     该词必须继续沿检索阶梯查证。
     因此，如果某个候选项未通过发音测试，但出现在某位已知人物应当出现的位置，
     则**既不能忽略，也不能直接改写**：应将其以 `kind: entity` 加入队列，
     等待音频核验（仪表板中的 `Q` 正是专门用于此目的的工具）。
     即使你有所怀疑，也要将最佳候选项填入 `suggested`——没有建议值的项目根本无法被接受
     （对其使用 `--decision accepted` 会报错），否则审核者将被迫为每张卡片
     重新输入答案。在将项目加入队列之前，先接好转录文本对应的音频
     （参见仪表板的音频部分）：前置元数据会在查看时实时读取，因此稍后添加音频确实会
     点亮播放按钮——但编辑转录文本会导致行号相对于记录每个项目锚点时所用的
     ±3 行窗口发生偏移，而这才是撤销起来代价高昂的部分。
   - **无法确定的人名默认进入下面的检索阶梯，而不是去询问用户。**
     “只有用户知道这个名字”是最常见的错误本能反应。
     规范拼写几乎总是已经存在于此机器上的**另一个项目领域**中——因此你必须同时查询
     **所有**领域（使用下面检索阶梯中的跨领域 SQL），而不是只查询你碰巧传给
     `--stage 1` 的那个领域，因为它可能是全新且为空的。
     只查询该领域然后放弃，看起来完全像是“我检查过了”，实际上正确答案明明就在那里。
   - **确信无疑的修正**——非词语、明显的识别乱码、你已经认识的产品名称变体，
     或者在上下文中没有歧义的同音词（当上下文明确要求使用 `there` 时将 `their`→`there`；
     当其他所有提及都写作 `彭博` 时将 `彭波`→`彭博`）。直接应用修正（步骤 5）。
   - **需要核验**——无法从上下文确认的专有名词：人名 / 公司名 / 股票代码 /
     产品名 / 地名（医学访谈中听错的药品名称、播客中研究人员的姓氏、
     财报电话会议中的股票代码），或任何你无法指出具体来源的术语——
     即使你自认为认识它也一样（“我相当确定”恰恰是错误姓名混入文本的方式）。
     **在询问用户之前，先通过本地优先的检索阶梯解决。**
     对于项目 / 个人实体，权威拼写几乎总是已经存在于此机器上，而 WebSearch 对内部姓名
     几乎毫无用处——它会返回同名但错误的人，或者什么都找不到——更糟的是，
     一个流畅但错误的猜测会变成难以在后续发现的确信无疑的修正。按以下顺序搜索：

0. **人员名册** — `people.md`（或 `~/.transcript-fixer/config.json` 中
         `people_roster_path` 指向的位置）。这是你精心维护的长期重复出现人员的
         单一事实来源（SSOT），其 ASR 变体标注在 `- **ASR 变体**:` 下。若此处已将
         某个识别错误的姓名映射到规范姓名——例如 `Nena`→`Nina Zhao`、`小宇老师`→`小雨`——
         则属于高置信度修正：立即应用。**这一个步骤就不必再为用户已经记录过的每个姓名
         逐一询问用户。**仅当已确认转录中的说话者不在名册中时，才跳过此步骤。
      1. **检查 `corrections.db` 的所有域，而不只是当前的 `--domain`。**同一个实体在不同项目中会分裂成不同的 ASR 变体，而此前的每次修正都已将它们归并为规范名称——因此答案往往就在另一个未传给 `--stage 1` 的域中。只检查当前域便放弃，是一种反复出现的失败模式。
         `sqlite3 ~/.transcript-fixer/corrections.db "SELECT from_text, to_text, domain FROM active_corrections WHERE to_text LIKE '%<fragment>%' OR from_text LIKE '%<fragment>%';"`
      2. **项目交付文档和别名台账** — 成本报告、审核表、交付物、该项目的 PKM 笔记。这些资料包含由人工书写的正确拼写，是最可靠的来源。先运行 `grep -rl "<fragment>" <project-dir>`，再阅读命中的文件。（你在分类处理前加载的域上下文文件通常会明确指出项目的别名台账——从那里开始。）**阅读台账中的每一张姓名表，而不只是看起来像“说话者列表”的那一张。**项目相关人员几乎总是分散在按角色划分的多张表中——内部说话者、外部协作者、客户方、供应商/经销商方、参会者——而你正在查找的人往往就在你没有打开的同级表中。如果最终确认的某个姓名无法通过上下文文件中的姓名来源清单找到，说明该清单并不完整：将缺失的表添加进去，避免下次运行再次漏掉。（此举所预防的失败案例参见 `domain_context_guide.md` 规则 6。）
      3. **本地工具 / 网关 / 客户端配置——用于处理产品、模型和工具词汇的识别错误。**如果转录中充斥着产品、模型和端点相关讨论，其真实准确的信息通常就在用户这台机器上的客户端配置中：LLM 网关配置文件（模型 ID、基础 URL）、编辑器/IDE 设置、CLI 配置存储、API 客户端预设。这些信息可供机器读取、内容最新且完全精确——一个被以五种不同方式错误识别的模型名称，可以逐字节地与配置自身的模型列表核对，包括并不明显的后缀（真实案例：在一次关于配置模型网关客户端的通话中出现了 `cloud fiber5` / `飞豹五` / `FIVE5EM`；该客户端的本地数据库列出了带有 1M 上下文标志的 `claude-fable-5`——所有变体都被归并，包括 `EM`→`1M`）。通用做法：找到所讨论工具的配置（众所周知的配置主目录或其 sqlite/json 存储），根据发音将识别错误的词元与其中的真实标识符进行匹配，并将配置条目视为近乎权威的依据——用户说话时是从该界面上照着读 ID；ASR 听到的只有声音。⚠️ 配置存储中可能包含机密信息：只读取所需字段（模型名称、URL），绝不要将密钥/令牌复制到转录、词典或总结中。
      4. **交叉参照聊天记录时间线——用于确认通话中实际有哪些人。**当参与者身份十分重要时（例如说话者分离标签只有一个英文名字，或是 `Speaker N`，且正文从未提及其全名），最可靠的本地证据是用户自己在*会议时间窗口附近*的聊天记录：人们会互相发送会议链接，以及通话期间讨论的资料（配置字符串、文件、链接）。在限定的会议日期窗口内，搜索一个**转录本身包含的独特字符串**（例如通话中提到的域名、模型 ID 或代号）；当时包含该字符串的聊天几乎必然对应通话的另一方，而其前后的消息（“现在加入”、会议开始前一分钟发出的邀请）能够在**完全不根据转录内容进行推断**的情况下确定身份——这是时间线证据，而不是猜测某位说话者听起来像谁。聊天中包含的任何精确字符串也能通过这种方式得到逐字节验证（通话中粘贴的 ID 可以确认其自身拼写）。此方法仅用于身份/标签问题——普通拼写问题通过第 0–2 级处理成本更低。实际案例：说话者分离结果标为 `Kevin`；搜索通话中提到的网关 URL 后，找到了一段私聊，其中在会议开始前一分钟收到了邀请，并在通话中途收到了三个完全一致的配置字符串——由此将 `Kevin` 确认为该私聊对象的完整显示名称，正文中两个识别错误的姓氏称呼也被修正为有证据支持的姓氏。
      5. **记忆文件**（`~/.claude/.../memory/`）— 项目关系图和人员档案通常会明确记录规范姓名。
      6. **WebSearch** — 仅用于真正公开的实体（上市公司股票代码、知名研究人员、药品名称）。任何项目内部信息都不要使用。

只有当这些方法全都无果后，才向用户询问——而到那时，你已经证明该实体尚未记录在这台机器上，因此询问是合理的。得到确认的结果会成为「确定」修复；如果搜索*无法*确认，则归为「不确定」。**批量处理这些问题**：收集所有唯一的未知项，并针对每个唯一实体执行一次这套阶梯式流程，而不是每出现一次就执行一次。**询问规范的人名时，始终要在候选列表之外保留一个退出通道**——包含一个 `Other / none of these` 选项（或确认 UI 已提供该选项），允许用户输入完全符合其意愿的自由文本拼写。单个本地出现记录足以支持将某个候选项列入列表，但不足以将该列表视为穷尽：真正的规范名称可能是英文名，而你找到的所有候选项都是中文音译。

      **而当用户回答时，其判断具有 ✅ 权威性——这是整个循环中最强的信息来源——并且会在同一会话中通过三种方式产生复利效应。** 如果用户说“X 其实是 Y（我在 Z 团队的同事）”，那么他们提供的信息来源比任何本地文档都更可靠。立即充分利用它：① 应用修复；② 将变体持久化到能够持续产生复利效应的位置——重要且反复出现的人物应加入**人员名册**（遵循上方的名册与数据库对照表），项目术语或一次性姓名则使用 `--add ... --domain <project>`（下周同一套 ASR 还会再次听错同一个名字）；③ 使用用户的原话、日期以及 ✅“用户已确认”标记，将其记录到台账 / 名册 / 领域上下文中——后续任何会话都不应再次询问。以下是通过艰难实践总结出的两项改进：
      - **添加到词典前，先对 FROM 端进行冲突检查。** 如果乱码字符串本身在你的其他场景中是一个真实人名（另一个项目的名册中有一个*不同的*真实 `李明`），那么 `李明`→`黎明` 这条词典规则会破坏该人员今后的转录文本。这种修复应作为陷阱写入领域上下文文件，并附带消歧线索（“在编辑团队上下文中，`李明` = `黎明`”），绝不能写入词典。
      - **经确认无误的实体也值得记录。** 当用户确认某个名字原样就是正确的（“他是一名真实的博主，拼写完全就是这样”）时，记录该判断（在领域上下文或名册中写一行）。未记录的“原样正确”结论，会变成下一次运行中又要花五分钟重新询问的问题。
   - **不确定**——你怀疑存在错误，但即使搜索后仍无法确认（某个音节可对应多个真实实体；句子结构破损）。**将原文完全保持原样**，并将其记录到待检查列表中（第 7 步）。一个流畅但错误的“修复”比明显的乱码更难在下游被发现——保持沉默胜过自信地猜测。
5. 高效应用确定的修复：
   - **全局替换**（唯一的非词项，如“克劳锐”→“Claude”）：如果它在多个转录文本中反复出现——多数产品名/名称乱码都是如此——请使用 `--add` 将其添加到某个 `--domain`，使其效果复利到今后的每次运行中；对于真正的一次性术语，使用一次带多个 `-e` 标志的 `sed -i ''`
   - **依赖上下文**（某个词仅在特定上下文中错误，例如在蒸馏讨论中“争”→“蒸”）：使用包含更长周边短语的 sed 以确保唯一性，或使用 Edit 工具
   - **常用词批量处理：多数出现位置表示领域术语，但少数位置确为原义**（某个高频词在该领域中的*大多数*出现位置被赋予了特殊含义，但并非全部——剩余的真实用法正是常用词之所以常用的体现）。切勿盲目使用 `replace_all`。首先用 `grep -n` 找出每个出现位置，并根据所在句子逐一判断。当绝大多数位置都表达领域含义，只有一两个位置是原义时，高效的处理方式是：先对该词执行 `replace_all`，将其替换为领域术语，再使用 `Edit` 将那一两个真实用法的位置改回去——这比执行 N 次单独的 Edit 更快，也更不容易出错，而下方的重新 grep 会捕获任何误判。真实案例：一次销售通话中，`公开` 出现在 11 行里——其中 10 处实际是工勘（现场勘察的销售漏斗阶段），只有一处确实表示“公开的渠道”；执行 `replace_all` → 工勘，然后还原唯一一处“公开的渠道”。（当源词是常用词时，领域术语本身仍然不应写入词典——应按照“领域纠正上下文”中的说明，将其记录为上下文陷阱；本条仅说明如何在单个转录文本中*应用*修复。）
   - 随后重新 grep 每个已更改的术语，确认替换已生效，并且没有误伤你原本想保留的相似项
6. **第二遍检查——捕获第一遍阅读遗漏的问题。** 单次线性阅读必然会留下残余问题：成语退化成近音词、一个在多数位置正确但在某一处错误的术语、一个被误听成其他内容的缩写。始终重新扫描一次，查找遗漏。首先进行一种成本较低的定向检查：**陷阱扫描**——针对领域上下文文件中记录的每个陷阱模式扫描文件（即该领域已知会反复产生的同音误听）。以机械化方式运行，不要手工拼写 grep 循环（包含 30 个陷阱的上下文文件意味着手动执行 30 次以上 grep，而这份列表恰恰是疲惫的操作人员最容易擅自缩短的内容）：

```bash
   uv run scripts/fix_transcription.py --scan-traps \
     --context-file ~/.transcript-fixer/contexts/<domain>.md -i meeting.md
   ```

   每个已记录的陷阱都会连同行号和上下文窗口一起返回；已确认正确的记录（`**X = 真实实体，勿修**`）会被报告为保持原样，这样你就不会反复调查已经解决的问题；而无命中列表则可以区分“已扫描但不存在”和“从未扫描”。三十秒即可准确检查该领域常见的错误；一次无异常的陷阱扫描加上你的第一遍检查，就足以满足快速层级的要求。对于较长或高风险的转录文本，*还要*启动一个独立子代理（Task），让它在不了解你第一遍检查结果的情况下重新通读修正后的文件——没有第一遍检查记忆的新视角，能够发现你之前忽略的问题。**子代理的任务是*返回残留问题列表*，而不是重新复述转录文本。** 要为它指定输出格式和严格的数量上限，因为逐行自言自语的子代理会在完成前耗尽自己的上下文窗口（一次真实的第二遍检查在扫描一份 1131 行的转录文本时，中途触及 32k token 上限，最终没有返回任何可用内容）。正确的提示词结构如下：
   - 将范围严格限定为一个文件，禁止编辑和跨文件 grep。
   - 把已经修正的术语作为禁止重复报告列表交给它（这些你已经修正了；只有*新的*残留问题才有用）。
   - 要求只输出紧凑表格——`line | original ≤20 chars | suspected | one-line reason | confidence`——并告诉它输出列表后立即停止，不要写说明性前言，不要逐行输出意识流，也不要重新推导它已经完成的修正。
   **完成检查要求得到可用的审查结果，而不仅仅是进程状态显示成功。** 审查者必须覆盖整个文件，并返回所要求的残留问题表格或明确的 `no new residuals`；空白、格式错误或被截断的响应都属于检查失败，必须换一个新的审查者重试。可重试的子代理失败同样不能算作完成这一遍检查。如果失败信息表明可以重试或给出了重试延迟（例如带有 `retry_after` 的 HTTP 超时），则至少等待相应时长，然后以全新上下文重试检查。只有当工具确实无法运行时，才将子代理路径视为不可用（例如，这些指令已经在一个无法再启动其他子代理的子代理内部执行）。针对已知变体的定向陷阱扫描或 grep 仍然有用，但**它不是独立的重新通读**：它可以确认已知错误类型已经消失，却在结构上无法发现第一位审查者的盲点。在一次生产运行中，用已知模式 grep 替代超时的全新检查后，结果显示无异常；但重试无先入印象的检查后，又发现了 26 个候选问题。
   然后逐一裁定每个残留问题——子代理的列表是**候选项，而不是结论**（一次真实运行：10 行 → 接受 4 行）。对每个候选项执行第 4 步的分类判断，并结合以下这些均已在生产环境中验证的启发式规则：
   - **接受——近似同音 + 文档内自证。** 当几行之前的同一目录中已经写着 `离职回购` 时，将 `利智回购`→`离职回购`：发音相近，加上同一文件中存在正确形式，足以确定修正——**前提是作为证据的出现位置已在原始文本中核实**（由同一个上游处理步骤写入的出现位置不能证明任何事情：裁判和被裁判者共享同一来源，属于循环论证），**并且只有一个候选项以正确形式出现**（两者均有出现 = 证据无法区分；退回到语音最小改动原则或加入队列）。指代对象明确的同音字同样适用（当先行词是文档而非人时，将 `他`→`它`）。
   - **拒绝——发音距离同样可以证伪。** 发音测试是双向的：发音相近是*支持*修正的证据（第 4 步）；发音不可能相近则是*反对*修正的证据。`代号`→`代码`（hào/mǎ）和 `一撮`→`一坨`（cuō/tuó）不是 ASR 会产生的替换——这样的候选项是审查者过度解读，而不是引擎听错。**例外是第 4 步中的跨语言专有名词类别**：在另一种语言的语境中说出的外文名称，转录结果可能确实与其规范发音相差很远。不要在此处拒绝这类候选项——应将其送入队列，通过音频核实。这个例外由*类别*定义，而非由罕见程度定义，并且必须同时满足第 4 步的**两个**条件：候选项是可能使用不同于转录语言的另一种语言说出的专有名词，**并且**它位于项目已知人物应出现的位置。两者均满足 → 无论发音距离如何都送入队列。任一条件不满足 → 应用本拒绝规则，就像处理所有常用词和同语言同音词一样。
   - **拒绝——ASR 能力反向核查（强先验，而非证明）。** 如果同一个引擎在同一份转录文本的其他位置正确识别了该词，就说明对于这段音频而言，该词明确处于此引擎的识别能力范围内——因此，附近出现不同写法时，*更有可能*是说话者确实说了不同的内容，而“修正”它所需达到的证据门槛会大幅提高。（候选项 `一条`→`一坨`：几行之前已经正确识别出 `一坨`，而 `一条` 本身也是口语中有效的量词短语——两者结合即可拒绝该修正。）要将其视为概率判断：同一个引擎确实可能将一个名称拆成十几种变体（参见“项目特定修正”）——当正确形式和候选形式都是引擎通常能够处理的常用词时，这项反向核查的权重最高；当它们是罕见专有名词时，权重最低。
   - **拒绝——可理解的真实词语。** `一撮` 是完全正确的量词；不要仅仅为了让贯穿上下文的比喻保持一致，就改写本来可读的表述。只修正说话者不太可能说出的内容。
   - **拒绝——无证据重构。** 没有语音依据的修正建议（`半`→`分`）只是对含义的猜测，而不是纠错。
   - **最小改动。** 修正识别错误的词；绝不插入说话者没有说过的词（`打完`→`打算` ✓；改写为 `打算怎么` 会插入说话者从未说出的 `怎么` ✗）。
   - **优先选择能够解释错误的最小改动——在评判任何候选项之前，先按语音距离对候选项排序。** 上述规则限制了一个候选项可以改动*多少*；本规则则在多个候选项读起来都通顺时，决定*选择哪一个*。ASR 错误是微小扰动——引擎会将听到的声音映射到它所知的最近词语——因此，在所有语义合理的候选项中，改变音素最少的那个几乎总是实际说出的内容。普通话中一个有用的特征是：**叠词或多音节词的尾部完整保留，只有首音节不同**，这通常表明声母发生了混淆（卷舌音/齿龈音 `sh`/`s`、`zh`/`z`、`ch`/`c`，以及 `n`/`l`、`f`/`h` 这几组）；因此，在判定整个词都被听错之前，*先*搜索韵母相同、声母不同的候选项。
     **这一方法失效的地方，不是在生成候选项时，而是在审查已经存在的文本时**（无论是上游修正，还是你在第一遍检查中接受的修正）。审查已有文本会使你进入验证模式：你会问“这样合理吗？”，发现合理后便继续往下——完全没有意识到你拿到的只是一个候选项，而不是一组已经排序的候选项。一个改写了三个音节的候选项可能非常地道，*但同时*也可能是改写；它与只改变一个音素的候选项之间唯一的区分方式，就是你同时生成两者并进行比较。因此，在审查任何已经应用的修正时，都要强制追问：**是否存在同样能够解释这一问题、但改动更小的方案？** 如果你无法回答，就说明你只是确认了其合理性，而没有真正核实。**有一项优先级高于语音最小改动原则：文档内自证——目标词在段落其他位置正确出现，该段落*讨论的正是*该指代对象，并且作为证据的出现位置已对照原始文本核实**（由同一个上游处理步骤写入的出现位置不能证明任何事情——裁判和被裁判者共享同一来源，属于循环论证）。如果两个候选项都以正确形式出现，则证据无法区分；退回到语音最小改动原则或加入队列。而且，当正在审查的修正有规则支撑时，经过原始文本核实、且与该修正相冲突的自证，*就是*第 2 步中撤销门槛所要求的肯定性证据——撤销该修正，然后废弃该规则或缩小其适用范围。（2026-08 的真实案例：一个已经应用的修正写成了「完全」，而原始文本是「原全」——发音最接近，也完全通顺——但周围对话在原始文本中三次出现「全职」，并且讨论的*正是*全职；语音上改动更小的候选项反而是错的，只有自证检查发现了这一点。）
   第二遍检查的子代理若能返回 8 条精准的问题，永远胜过返回 8000 个 token 的叙述。处于主上下文时可以使用 Task；如果它确实不可用——例如这些指令本身正在一个无法再启动其他子代理的子代理中运行——则由你自己基于修正后的产物，再进行一次彻底的逐行通读。不要用已知模式 grep 替代重新通读，并声称已经完成。绝不能因为工具缺失而跳过第二遍检查。
7. **输出待检查列表并将其加入队列**——会话结束后，聊天摘要就会消失，因此每个*不确定*项都要双写：(a) 写入你提供给人工审查者的聊天摘要——包括行号、你保留在原处的原始文本、你的怀疑内容，以及无法确认的原因；(b) 通过 `--enqueue-review items.json` 写入持久化审查队列（参见上文“审查队列与仪表板”；项目字段/别名模式：`references/script_parameters.md` §Review Queue Item Schema——未知键会被静默丢弃，因此应写 `line`，而不是 `line_hint`），使用相同字段并额外提供一套建议操作，以便人工审查者之后可以在仪表板中一键解决——或者后续代理会话可以凭借新证据将其关闭（`--resolve-review ID --decision … --note "<evidence>"`）。实体/名称问题使用 `kind: entity`（它们会累积进入词典/人员名册，因此排在队列前面）；纯措辞疑问使用 `kind: wording`。如果没有任何不确定项，请明确说明。用于 `--enqueue-review` 的最小 `items.json`（每个不确定项对应一个对象；当你没有候选项时，`suggested` 可以为空——仪表板允许人工审查者之后补充）：

```json
   [
     {"file": "/abs/path/to/the/transcript.md", "line": 142,
      "original": "<garbled-name>", "suggested": "", "kind": "entity",
      "context": "<the whole sentence the token sits in, copied VERBATIM from the file>",
      "evidence": "speaker-label fragment near line 142; not in roster or project alias ledger — needs user confirmation"}
   ]
   ```
   **`file` 是使另外两个字段正常工作的关键；省略它会以最糟糕的方式静默失败。** 下述两项保证都以它为前提（`review_queue.py:212` 和 `:793` 都会先检查 `file_path`）：
   - *逐字锚点拒绝。* 设置 `file` 后，如果 `context` 不是该文件中的字面子字符串，则会**在入队时被拒绝**（退出码 3）——这样，编写错误会立即暴露，而不是拖到裁决时才出现。未提供 `file` 时，没有文件可供核对，因此改写过的 `context` 会被接受，文本漂移要到很久以后才会显现。
   - *默认编辑操作。* 设置 `file` 且未显式提供操作包时，接受操作会执行一次 `file_edit(old=original, new=suggested)`。未提供 `file` 时，接受操作仍会记录裁决并以 0 退出——**但绝不会触碰转录稿。** 不会报错；队列只会显示 `accepted`，而文件保持不变。

   有两个关键字段名，上述静默丢弃规则都能在多越过一个字段时捕获它们：裁决字段是 `suggested`（`suggested_text` 的别名），**不是 `suggestion`**——拼错会让控制面板上的“接受”按钮消失，随后 `--resolve-review` 会以 *“条目 N 没有可接受的建议”* 为由拒绝执行。操作包的字段名是 `actions`，**不是 `action_pack`**；它是可选的——仅当接受操作还应执行 `dict_add` / `append_note` 时才提供。完整字段/别名表：`references/script_parameters.md` §审阅队列条目架构。

   **`original` 只承载可疑词元，绝不能放整个句子**——句子应放入 `context`。无论你在 `original` 中放入什么，控制面板裁决都会将其*整体替换*：接受操作会执行 `file_edit(old=original, new=suggested)`，而覆盖操作会用人工输入的文本替换整个 `original` 范围。如果 `original` 是类似「我们的民宿就完了」的完整分句，而人工输入的是两个字的品牌名「栖云」，那么整个分句都会消失——这是 2026 年 7 月真实发生的事故（#24），丢失的词语不得不手动补回。使用 `original: "民宿的误写词"` + `context: "…我们的民宿就完了"`，同一项裁决默认就会得到正确结果。（控制面板现在会在覆盖输入框上方显示完整替换范围，并在替换文本短得可疑时发出警告——但在入队时采用正确的粒度，才是不增加任何成本的解决办法。）
8. 对实际编辑的文件执行差异核验（`diff <original> <your-working-file>`）——每一处改动都应能追溯到某项分诊决策
9. 完成定稿并归档：
   - **主要路径（推荐）：** 对原始 `file.md` 重新运行 `--stage 1`——**直接运行，不要带 `--apply-all`**（显式指定 `--apply-all` 总会执行更正而不会完成定稿，因此过期的伴随文件不会静默吞掉本次运行）。如果 `file_stage1.md` 比 `file.md` 更新，transcript-fixer 会自动将其提升为 `file.md`，并删除中间伴随文件（`_stage1.md`、`_stage2.md`、`_dryrun.md`、`_changes.md`、`_needs_review.md`、`_uncertain.md`、`_对比.html`）。这是默认的定稿方式；它具有原子性，能保留手动编辑（当 `file.md` 更新时会跳过提升），并可避免 macOS 的 `mv` 别名隐患。
   - **原生 AI 更正模式**（你直接编辑了 `file.md`——即上述默认工作流）：`file.md` 已经是最终输出。无需也无法执行提升（提升保护机制会正确地跳过，因为 `file.md` 比所有伴随文件都更新），因此只需重新运行一次 `--stage 1` 以进行确认。一次**零更正的重新运行不会写入 `_stage1.md`**，而且当没有任何内容被暂缓处理时，也不会写入报告伴随文件——目录整洁，`file.md` 已可归档。（如果文本中仍有中/高风险字典匹配——例如你判断为误报并有意保留的匹配项——每次运行时都会重新生成 `_changes.md`/`_needs_review.md` 并列出它们；那是暂缓处理报告，并非定稿失败。处置完这些条目后将其删除即可。）如果重新运行确实发现更正项，请将需要的更正应用到 `file.md`，然后再次运行。
   - **手动备用方案**（仅当你需要完全控制，或 `file.md` 在阶段 1 运行后又被编辑过时）：将更正后的内容保存回原始 `file.md`。（`file_stage1.md` 仅供参考/差异比较；不要将其作为最终输出来编辑。）然后将 `file.md` 复制到 `next/00-Transcripts/YYYY-MM/`（或你的归档位置），并使用一行 Python 命令删除本地伴随文件：
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
   - 再次在最终文件中 grep 一项你确定已应用的更正，以确认更正后的版本已正确写入。
   - **清查已从此转录稿派生出的内容——更正不会自行传播。** 转录稿并非终端产物：在归档后的数小时内，它就会被提炼成笔记、决策日志、分析、摘要和对外消息。所有这些内容都源自*未经更正的*文本，因此你今天修正的姓名在其中每一处仍然是错的——而且与转录稿不同，它们没有时间戳来提醒读者该拼写可能有问题。实际案例：一个听错的人名进入了两份分析文档，并且只差一份草稿就会被发送给正在讨论的那些人。
     要有意识地限定范围。**仅清查实体更正**（姓名、公司、产品——绝不清查措辞，因为措辞按定义仅与所在句子相关）。**搜索转录稿所属的项目，而不是整个知识库**——全仓库清查会命中无关项目，其中“旧形式”可能指的是*另一个真实存在的人*，这比完全不清查的后果更糟。使用 **`grep -rn`，不要使用 `git grep`**：`git grep` 只搜索已跟踪文件，而数小时前刚写成的文档——也就是本条所述场景——恰恰可能尚未被跟踪（如果需要感知仓库的版本，可使用 `git grep --untracked`）。
     应当**排除证据链**，而不是对其进行“更正”：第 2 步的上游差异比较所依赖的原始 ASR 基线（`transcript_raw.txt` 及类似文件），以及 `_needs_review.md` / `_changes.md` 伴随文件，都会*有意*保留旧形式——重写它们会破坏下一次运行与原始文本进行差异比较的能力。（无论如何，队列条目都不受影响：它们锚定转录稿本身，并存储在文件 grep 无法触及的 SQLite 中。）
     逐项审阅搜索结果，不要盲目替换——这是对少量文档进行的受监督检查，不是批处理工作流规则所禁止的不受约束的跨文件 `sed`。
   - **防止下次再犯的习惯**——这不是本次运行中的操作，而是之后处理转录稿时应遵守的规则：当你把专有名词从转录稿中引用到笔记、报告或消息时，在粘贴前先到人员名册或项目别名台账中查证。上述清查是一条补救路径，而只有在姓名首次被带出转录稿时没有完成该查证，它才会变得必要。采用与第 4 步相同的核验阶梯，只不过是在导出时应用，而不是在更正时应用。
9b. **移动或重写转录稿会使队列中尚未处理的所有内容失去锚点。** 条目会记录转录稿的绝对路径，并据此执行解析，因此**重命名**（第 10 步）会使每个待处理条目都指向一个不再存在的路径——随后裁决会失败并显示 `file gone: <path> — the transcript moved since enqueue`；该信息虽指出了原因，却没有对应的修复命令：CLI 可以入队、列出、显示和解析，但无法重新锚定或删除。**提升**（第 9 步的主要路径）则更隐蔽：文件仍然存在，因此条目会在稍后因锚点文本或上下文漂移而失败。这里有两个值得提前规划的后果。**如果打算重命名，应首先执行重命名**——在第 7 步入队之前，而不是之后；阶段 1 期间自动入队的暂缓项已经绑定到文件当时的名称，因此计划重命名的转录稿应在首次运行阶段 1 之前取得最终名称。**如果条目已经失去锚点，唯一的退出方式是将其解析为 `kept_original`/`skipped`**（两者都不会执行操作，也不会因锚点而失败），**或者针对新路径重新将等效条目入队**——否则旧条目会永远保持待处理状态。归档本身则不同，而且是安全的：`cp` 会保留原始文件，因此锚点仍然有效；但这意味着之后应用的裁决只会修复工作副本，而归档副本仍会保留错误——这与上述派生文档清查所针对的“更正不会传播”问题相同。
10. **文件名卫生——归档前重命名机器生成的乱码式文件名。** 文件名如果只是原始 ASR 产物、设备标签或不透明的时间戳哈希（`TX02_MIC021_20260720_095909_1.3x.md`、`soundcore Work_01-01 10-36.md`、`07-12-2026 20.07.md`），这样的转录稿就不是有用的产物。在文件进入共享仓库之前，将其重命名为人类可读的形式：`YYYY-MM-DD-HH-MM-<topic-or-speaker-summary>.md`，根据项目情况使用中文或简短英文。判断标准是：仅凭文件名，人就应该能够识别是哪场会议。如果内容明确属于某条业务线，并且仓库约定允许，也应在 slug 中体现该业务线。
11. 将稳定模式保存到字典中（参见上文“字典添加”）
12. 归档前，从最终文件中清除所有剩余的阶段 1 误报

### 常见的 ASR 错误模式

AI 产品名称经常被识别错乱。以下模式在不同转录文本中反复出现：

| 正确术语 | 常见 ASR 变体 |
|-------------|-------------------|
| Claude | cloud, Clou, calloc, 克劳锐, Clover, color |
| Claude Code | cloud code, Xcode, call code, cloucode, cloudcode, color code |
| Claude Agent SDK | cloud agent SDK |
| Opus | Opaas |
| Vibe Coding | web coding, Web coding |
| GitHub | get Hub, Git Hub |
| prototype | Pre top |
| AI | a 夜, a 爱, ai, 阿伊 — 双字母英语术语夹在中文语句中说出时，会被识别为读音相近的音节（"All in a 夜吧" = "All in AI 吧"，用户于 2026-08-08 确认） |
| skill | SQL, SKU, 死抠 — 同样的双字母拆分问题，`skill` 是 AI 工具相关对话中的高频词（SQL/SKU 在其他语境中确实是有意义的词——应结合上下文判断，绝不能仅凭简单的字典规则） |

**中文语句中双字母英语术语的模式具有普遍性**：`AI` / `skill` / `SDK` / `API` 夹在中文语句中说出时，因为过于简短，ASR 会将其映射为任何读音相近的音节（包括像 `a 夜` 这样的整词混淆）。当转录内容与 AI 工具相关，而某个音节字符串作为中文毫无意义、但所处位置本应是英语缩写时，应首先检验缩写假设——然后在修正前通过发音距离进行确认。

人名和公司名称在不同会话中也会产生一致的 ASR 错误——务必将已确认的人名修正添加到字典中；对于特定项目的名称，请使用 `--domain <project>` 将其隔离（参见“特定项目与人名修正”）。

### 数字：字典在结构上无法修正的类别

字典规则要求错误具有*稳定性*——一个错误字符串对应一个正确字符串。数字错误没有稳定的映射关系（在一段录音中，`80` 会变成 `800`，而在下一段中又会变成 `18`），因此再多的字典工作也无法解决它们。这类错误造成的损失也最大。ASR 领域关于实体级错误的研究始终将数字和命名实体列为最糟糕的类别——远比总体 WER 所呈现的情况严重——并指出数字的*续接*词元（首位之后的数字）比首位数字更容易出错。这里真正起支撑作用的结论正是这一排序，而且它与你在实践中看到的情况一致：第一组数字通常是正确的，后半部分才是出错之处，这也正是错误数字仍然读起来流畅的原因。（这些研究的二手摘要中流传着一些具体百分比；这里不予引用，因为尚未对照一手来源进行核实。如果你希望查看附带对应数据集的数字，请搜索 "ASR named entity error rate" / "entity-preserved ASR"。）

共有三个子类别，每个都需要不同的检查方法。任何一种都不能自动应用——数字只能通过证据确定，绝不能仅凭模式判断：

| 子类别 | 表现形式 | 如何确定 |
|---|---|---|
| **数量级** | 同一数额在重新表述时多了或少了一个零 | 根据同一段落其他位置所述的数字进行算术核对；或使用第二份录音（见下文） |
| **量词缺失** | 说话者说的是“30 家/个”，转录却成了 `30+`（没有人会把“加号”念出来） | 下方的扫描器会找出这些情况（`orphan-plus`）；随后通常可以根据同一分句中的对象还原量词 |
| **极性反转** | 陈述的*上限*被转录成了*下限*——“只能给 N”变成了“超过 N…保底” | 扫描同一会话中对该数字的其他陈述；带有限制性情态词的那一处（只能/最多/至多/封顶/不超过/至少/起码/超过/保底/最少——脚本会输出完全相同的列表）几乎总是真实表述，因为说话者通常只会明确陈述一次边界，之后再进行较为宽泛的改述 |

极性是最危险的一类问题，也是任何工具都无法捕获的问题：句子语法正确，数字也正确，但含义却被颠倒了。只要转录文本中的数字最终会进入决策文档——无论是价格、上限、份额还是截止日期——都值得专门仔细通读一遍。

**同一场会议的两份录音，是你能获得的最有力证据。** 当一次会议由两个独立系统录制时（两个平台，或一个平台加一台本地录音设备），它们的数字错误互不相关，因此，出现分歧可以定位错误，结果一致则可以确认无误。这是 ROVER（Recognizer Output Voting Error Reduction，识别器输出投票错误降低，NIST 1997）的人工双系统版本——这个名称值得记住，因为已发表的研究解释了为什么跨系统投票优于改进其中任何一个系统。不要丢弃你已有会议的“冗余”第二份录音；对于那些最重要的数值，它正是一份参考转录文本。如果只有一份录音，而某个数字又至关重要，请通过此技能已有的路径靠听觉确认：配置转录文本前言中的 `audio:`（参见“为飞书妙记转录文本配置音频”），将该数字加入审核项，然后在审核仪表板中按 `Q`——它会精确播放锚定的那段话，让你听到口述的数字，而不是再次阅读转录内容。

**数字槽位损坏——替换操作误伤数字时。** 还有一种症状相同但性质不同的故障：原本针对其他内容的全局替换误命中了数字的一部分。经典诱因是重新标注某位说话人，而其说话人分离标签恰好是一个单独的数字——全局替换该数字虽然修复了说话人行，却会悄无声息地破坏所有包含该数字的数值（`21 册`、`3+1`、`8.8 折`，以及标题中的日期，都会有一个数字被姓名取代）。转录文本读起来仍然流畅，只是数字错了。匹配范围过大的词典规则也会产生同样的特征。

```bash
# Scan for canonical terms sitting where a digit belongs. The needle list is the
# dictionary's own to_text values — the strings this toolchain writes INTO
# transcripts are exactly the ones that shouldn't be inside a number.
uv run scripts/scan_numeric_consistency.py transcript.md --domain <project>
```

它输出的所有内容都只是**需要阅读核查的候选项**，绝不是要直接应用的编辑——而且极性问题被刻意排除在自动化检查之外，因为如果某项检查会对正常输入发出警报，人们最终就会停止运行它。

你可以自行验证的是：`scripts/tests/test_numeric_consistency.py` 使用合成固件固定验证了上述承诺的两个方面——上面的每一种损坏形式都能被检测到，而那些曾导致此扫描器前两个版本失败的正常输入形式（某个术语仅仅与数字共同出现、某个术语位于数字*之前*、标题开头的日期、时区偏移量）不会触发警报。请使用 `uv run --with pytest python -m pytest scripts/tests/test_numeric_consistency.py` 运行测试。这些选择背后的误报*率*是在无法随附发布的私有转录文本语料库上测得的，因此无法在此复现该比率——但由此获得的行为可以复现。

### 高效批量修复策略

修复多个文件时（例如，同一天的 5 份转录稿）：

0. **在进行任何修改之前，先对每个文件与原始文本进行差异比较**——如果这批文件来自一个在预分类阶段运行过自动纠错器的流水线，那么归档副本就不是原始 ASR：上游编辑已被直接写入，且没有任何证据链；在核实来源之前，每个文件本身都应被视为可疑对象（上游 AI 的“纠正”可能是一个流畅但错误的猜测——语法完美，但内容错误）。将每份归档转录稿与其原始来源进行比较（同步引擎通常会在旁边保留 `transcript_raw.txt`，也可以从源 API 重新拉取），并首先分诊每一项上游更改：在核查每处替换的来源后，对每项更改进行发音距离测试（如果背后有字典规则，则表示它是此前已确定的决定，撤销门槛更高，参见步骤 2）——撤销这些改写，将确认无误的更改视为已确定项（永远不要再次提出）。这是“原生 AI 纠错”步骤 2 中单文件上游差异比较的批量版本——对于批处理而言，它是步骤 0，因为之后阅读到的一切都会受到你所读内容究竟是原始文本还是纠正后文本的影响。
1. **并行执行阶段 1**：一次性让所有文件通过字典处理
2. **先阅读所有文件**：在修复任何内容之前，先建立对说话者、主题和重复术语的整体认知
3. **汇总全局纠错列表**：同一场会话中的多个文件经常会重复出现许多错误（相同的说话者、相同的主题）。**如果某个错误反复出现——尤其是人名或项目术语——请使用 `--add` 将其添加到项目的 `--domain` 中（参见上文“项目专用与人名纠错”），而不是直接进行内联替换；这样它就会自动修复今后的每个文件，而不只是当前这一批。**
4. **应用其余的一次性纠正**（使用带多个 `-e` 标志的 sed，仅用于确实不会重复出现的修复），然后执行依赖各文件上下文的修复
5. **核验所有差异**，归档所有最终文件并清理伴随文件，然后统一执行一次字典添加操作
6. **运行陷阱扫描**（“原生 AI 纠错”步骤 6），一次性覆盖整个批次——在通读之后，以机械方式检查该领域记录在案的同音词陷阱，捕获阅读过程中遗漏的问题
7. **集中一次性向用户核实所有不确定项，然后立即将结果沉淀下来**——批处理会产生一份无法核实的候选项短名单（一个含混不清的名字、一个与你的训练数据相矛盾的版本号，或一个你无法规范化的姓名变体）。一次性提交整个短名单（不要在处理过程中逐项询问）：用户可以听音频或认识相关人员，而每项判定都以相同方式落实——修复文件，使用 `--add` 将确认后的变体添加到 `--domain` 字典，并在同一会话中将其记录到人员名册或领域上下文中。在一次真实会话（2026-08-08）中，用户在会话中途给出的四项此类判定都在收到判定的同一轮中完成了沉淀。与你的训练数据相矛盾的版本号声明，在用户确认之前并不是错误——“当前日期是 2026 年，v4 已存在”的效力高于关于 v3 发布时间的过时记忆；应将其提交给用户判断，而不是预先判定。

### 通过动态工作流并行处理（大批量）

对于大批量文件（10 个以上），动态工作流——每个文件分配一个子代理并行运行——比 shell 循环更快，也能让 AI 充分关注每个文件。以下四条规则都是从惨痛教训中总结出来的；忽略其中任何一条都曾造成实际损害：

1. **将文件列表硬编码到脚本中——不要通过 `args` 传递。** 如果工作流的 `args` 字符串数组包含非 ASCII 字符、方括号或路径分隔符，它可能会悄无声息地变成空数组：脚本检测到零个文件，不会生成任何代理，并立即退出，同时显示类似于“no files”的信息。纯字母数字标记可以正常传递，但文件路径应直接写入脚本主体中的 `const FILES = [...]` 字面量，并使用 `if (!FILES.length) return` 进行保护。

2. **将每个代理的范围严格限定为一个文件，并在提示词中禁止跨文件使用 `grep -r` / `sed`。** 如果不加约束，代理可能会把局部修复（“此处：这个乱码术语 → 正确术语”）变成全局搜索和替换，进而编辑从未纳入该批次的无关文件。请明确写出单个文件路径，并明确说明“仅编辑这一个文件”。

3. **批处理完成后，在信任结果之前使用 `git diff` 进行验证**（适用于文件受版本控制的情况）：
   - 将 `git diff --name-only` 的结果与你的预期文件列表进行对照——这样可以发现任何越界修改了其指定文件之外内容的代理。使用 `git checkout` 还原这些越界修改。
   - 使用 `grep` 检查已删除的（`-`）行中是否包含绝不能更改的不变量。对于经过说话人分离的转录文本，这个不变量就是**说话人标签行**——ASR 修复只能修改口述内容，绝不能更改或重新分配谁说了什么。确认没有任何说话人标签行被删除或更改。

4. **在保存任何汇总后的词典建议之前，先通过误报过滤器筛选它们。** 并行代理集体提出的规则远多于安全可用的数量——而且它们看不到彼此的建议，因此重复项和过度扩展的规则会不断累积。只保留明确无歧义的**非单词 → 正确术语**映射。删除所有“from”一侧在某些语境中属于真实词语的映射：无论是常用词，还是仅在某个领域中才算错误的术语。针对真实词语的全局词典规则会悄无声息地破坏未来的每一份转录文本——这正是 `references/false_positive_guide.md` 所警告的问题。（在一次真实批处理中，约 80 条原始建议经过此过滤器后缩减为约 18 条安全建议。）

### 增强功能（仅限原生模式）

- **智能分段**：在符合逻辑的主题转换处添加 `\n\n`
- **减少填充词**："这个这个这个" → "这个"
- **交互式审查**：应用更正前先进行确认
- **上下文感知判断**：利用完整文档上下文消除歧义错误

### 何时改用 API 模式

对于批处理、脱离 Claude Code 的独立使用或可复现的自动化处理，请使用在 `~/.transcript-fixer/config.json` 中配置的 API 密钥（或使用 `GLM_API_KEY` / `ANTHROPIC_API_KEY` 环境变量进行临时覆盖）并配合第 3 阶段。

### API 回退

当 GLM API 在重试后仍不可用时，脚本会保持原文不变，并输出明确的警告。如果你需要在不使用外部 API 的情况下进行 AI 校正，请在 Claude Code 中运行并使用原生模式。

## 实用工具脚本

**时间戳修复**：
```bash
uv run scripts/fix_transcript_timestamps.py meeting.txt --in-place
```

**将转录文本拆分为多个章节**（将每个章节的时间戳重置为从 `00:00:00` 开始）：
```bash
uv run scripts/split_transcript_sections.py meeting.txt \
  --first-section-name "intro" \
  --section "main::<verbatim line that starts the next section>" \
  --rebase-to-zero
```

**词级差异对比**（建议用于审查校正结果）：
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
- `*_changes.md` — 包含风险级别和行上下文的阶段 1 报告（默认在安全模式下写入，也可通过 `--changes-file` 指定）
- `*_needs_review.md` — 在安全模式（默认模式）下延后处理的中/高风险校正
- `*_dryrun.md` — 所有阶段 1 更改的预览，其中标注了实际运行时会应用哪些风险级别
- `*_uncertain.md` — 由 `--extract-uncertain` 提取的疑似 ASR 错误
- `*_对比.html` — 可视化差异对比（在浏览器中打开）

在原生模式下，直接编辑原始文件并将其用作最终输出；`*_stage1.md` 是可丢弃的差异对比/参考文件（请参阅原生 AI 校正工作流）。当 `*_stage1.md` 比输入文件更新时，**重新运行普通的 `--stage 1`（不带 `--apply-all`）会自动将 `*_stage1.md` 提升为原始文件并清理附属文件**；这是建议采用的最终定稿路径。`--apply-all` 永远不会进入提升路径——它始终会运行校正。一次 **0 处校正**的运行（转录文本已无问题，或输入文件经编辑后再次进行原生模式运行）绝不会写入 `_stage1.md`（因为它只会复制输入内容）；如果也没有任何延后处理的内容，则完全不会写入报告附属文件。当安全模式确实延后处理中/高风险规则时，仍会写入 `_changes.md` 和 `_needs_review.md`——它们就是延后处理报告。

## 数据库操作

**在编写任何自定义查询之前，请先阅读 `references/database_schema.md`**——列名并不是你可能猜测的名称。校正列为 **`from_text` / `to_text`**（不是 `wrong_term`/`correct_term`，也不是 `original`/`corrected`）。猜测列名是这些查询因“no such column”而失败的最常见原因。

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
| 1 + Native | 词典 + Claude AI（默认） | ~1min | 免费 |
| 3 | 词典 + API AI + 差异报告 | ~10s | API 调用 |

## 内置资源

**脚本：**
- `fix_transcription.py` — 核心 CLI（词典、添加、审计、学习）
- `fix_transcript_enhanced.py` — 用于交互式使用的增强封装器
- `fix_transcript_timestamps.py` — 时间戳规范化与修复
- `generate_word_diff.py` — 生成词级差异 HTML
- `generate_diff_report.py` — 多格式对比报告（Markdown、统一差异、HTML、行内标记）
- `split_transcript_sections.py` — 按标记短语拆分转录文本
- `fetch_minute_audio.py` — 获取飞书/Lark 妙记的音频，验证其与转录文本使用相同的时间线，并输出 `audio:` frontmatter 行（接通仪表板的 `Q` 播放功能）

**参考资料**（按需加载）：
- **安全**：`false_positive_guide.md`（添加规则前阅读）、`database_schema.md`（执行数据库操作前阅读）
- **工作流**：`iteration_workflow.md`、`workflow_guide.md`、`example_session.md`、`example_session_dji_minutes.md`（录音器→妙记的完整会话案例：文档内自证链、第二轮拒绝标准、入队粒度）、`domain_context_guide.md`（各领域上下文文件的格式与模板）
- **CLI**：`quick_reference.md`、`script_parameters.md`
- **高级**：`dictionary_guide.md`、`sql_queries.md`、`architecture.md`、`best_practices.md`
- **运维**：`troubleshooting.md`、`installation_setup.md`、`glm_api_setup.md`、`team_collaboration.md`

## 故障排除

`uv run scripts/fix_transcription.py --validate` 用于检查配置是否正常。有关详细的解决方法，请参阅 `references/troubleshooting.md`。

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