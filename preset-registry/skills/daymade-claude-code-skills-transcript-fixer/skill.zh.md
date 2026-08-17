---
name: transcript-fixer
description: >-
  Corrects speech-to-text transcription errors using dictionary rules and Claude's built-in AI (no external API key required — Native AI Correction is the DEFAULT). Stage 1 alone is not the job. Stage 3 API is a backup for automation without Claude Code. Builds personalized correction databases that learn from each fix, auto-loads person-name ASR variants from your people roster, and reads per-domain context files that prime the AI pass for context-dependent homophones. Triggers when working with ASR/STT output containing recognition errors, homophones, garbled technical terms, person-name errors, or Chinese/English mixed content. Also triggers on requests to clean up meeting notes, lecture transcripts, interview recordings, or any text produced by speech recognition. Use this skill even when the user just says "fix this transcript", "clean up these meeting notes", or mentions garbled names without invoking ASR specifically.
---
# 转录纠错器

**默认模式：Claude 内置 AI（原生 AI 纠错）——无需任何外部 API key。**
Stage 1 字典纠错（免费、即时）→ Claude 自己读原文做智能纠错 → 复合词进字典。
Stage 3 API 仅用于无 Claude Code 的自动化批处理场景（备选）。

两阶段纠错流程：先执行确定性的字典规则（即时、免费），再进行 AI 驱动的错误检测。纠错结果会累积到 `~/.transcript-fixer/corrections.db` 中，随时间推移不断提高准确率。

**各阶段真正擅长的方面**（用于校准认知，而非规则）：字典最擅长处理*重复出现的*错误——产品名称、常见同音词，以及任何你之前纠正过的内容——而且零成本、零延迟。但对于刚创建的数据库、高质量 ASR（例如来自 Whisper、Otter、飞书或腾讯会议等强大引擎的转录文本），或金融、医疗、法律等专业领域，字典通常几乎匹配不到任何内容——剩余错误往往是它从未见过的专有名词和领域术语。在这些情况下，AI 阶段实际上承担了几乎所有真正的纠错工作。应将 Stage 1 视为针对已知重复错误的低成本预筛选器，而非主要纠错器；如果它在一份干净的转录文本中只修改了寥寥几行，也不必担心。

## 前置条件

所有脚本都使用 PEP 723 内联元数据——`uv run` 会自动安装依赖项。需要安装 `uv`（[安装指南](https://docs.astral.sh/uv/getting-started/installation/)）。

以下命令使用相对脚本路径（`scripts/<name>.py`），因此只能从该技能自身的目录中运行——而且在代理运行环境中，shell 的工作目录会在每次调用之间重置，这会导致第一条命令就出现 `Failed to spawn: scripts/fix_transcription.py`。**请从调用此技能时打印的“Base directory for this skill”行中获取技能目录**，然后在同一条命令中先 `cd` 到该目录，或者为每个脚本路径添加该目录前缀。不要依赖 `$CLAUDE_SKILL_DIR`——至少在某些运行环境中该变量未设置（已于 2026-08 验证），因此基于它构建的命令会以同样的错误失败，而这个变量原本正是为了避免该错误。如果你已找不到调用时打印的那一行，可以使用 `find -L ~/.claude ~/.codex -name SKILL.md -path '*transcript-fixer*'` 定位技能包——但它会返回数十个结果，包括每个已安装的*版本*，以及备份、暂存副本和编辑前快照——第一个结果并不是最新版本。跳过路径中包含 `skill-before`、`-workspace`、`source-sync-backups`、`.tmp` 或 `.staging` 的任何结果。在剩余结果中，优先选择版本号最高的目录；有些安装来源（如某个市场检出副本或另一个代理的技能目录）根本不带版本号，因此如果最终需要在这些目录之间选择，请选取修改时间最新的目录，并在信任它之前，将其内容与本文件进行合理性核对。

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

在 Stage 1 之后，Claude 会读取输出，并利用内置能力修复剩余的 ASR 错误（无需 API key）——**这是主要路径，即使只是快速生成转录稿，也不能将其跳过作为捷径**（“快速、干净”的转录稿恰恰是词典最薄弱的场景，也是内置能力通读最重要的场景）。完整方法——按置信度分类、核实而非猜测、二次检查、待核查列表——详见下方的 **内置 AI 校正**；请将该节视为权威依据。对于快速、干净的转录稿，可以简化为：如果存在该领域的上下文文件，则先读取它（`~/.transcript-fixer/contexts/<domain>.md`）→ 通读整篇转录稿 → 直接修复明显的一次性错误 → 使用 `--add` 将所有重复出现或项目特有的错误（尤其是姓名）添加到 `--domain` 词典中，使其下次能够自动修复（参见“项目特定内容与人名校正”）。**如果你在 Stage 1 后就结束处理，必须明确说明为什么不适用内置校正环节——“流水线运行了脚本”并不是理由。** 唯一有效的豁免情况是：人类用户明确将本次运行限定为仅执行词典环节（调用方流水线中固定配置的“运行 Stage 1”并不属于此豁免——参见下方“由其他 skill 调用时”），或者你有证据表明该转录稿已经执行过内置校正环节（文件中带日期的备注或摄取日志）。“转录稿看起来很短/很干净”、“词典已经应用了 N 项修复”以及“我赶时间”都不属于豁免情况——这些恰恰就是失败。

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

1. **初始化**（仅一次）：`uv run scripts/fix_transcription.py --init`
2. **添加领域校正项**：`--add "错误词" "正确词" --domain <domain>`
3. **阶段 1——词典**：`--input file.md --stage 1`（即时、免费）
4. **阶段 2——AI 校正（默认: Claude 内置 AI）**：Claude 读取 Stage 1 的输出，并利用内置能力修复剩余错误——**这是主要路径，无需 API key**。完整方法详见下方的 **内置 AI 校正**。备选: `--stage 3` API 模式仅限无 Claude Code 的自动化批处理(需额外配置 GLM API key——见上方 §⚠️ Stage 3 API)。**在 Claude Code 内不要跑 `--stage 3`。**
5. **保存稳定模式**：每次会话后使用 `--add "错误词" "正确词"`
6. **审核已学习的模式**：使用 `--review-learned`，并通过 `--approve` 批准高置信度建议

**领域**：`general`、`embodied_ai`、`finance`、`medical`、`tech` 或自定义领域（例如 `legal`、`gaming`）
**学习机制**：重复出现的 AI 校正会写入 SQLite 历史记录；`--review-learned` 会将高置信度的重复模式转换为待处理建议，而 `--approve FROM TO` 会将对应的建议原样提升至词典中。

### 新增安全与审查命令

- **安全模式现为阶段 1 的默认模式**：仅自动应用低风险（非单词、高置信度）纠正；中/高风险纠正（常用词、≤2 个字符、真实单词片段）会记录到 `*_needs_review.md`，而不会被静默应用。因此，**对干净的转录文本显示 `Applied: 0` 是正确行为，并非错误**——高风险规则正在 `*_needs_review.md` 中等待你或 AI 处理流程进行判断。传入 `--apply-all` 可应用所有风险级别的规则（即旧行为）；`--review` 作为已弃用的空操作保留。此变更重新启用了之前虽已计算却被忽略的风险分类器——但它并不能消除所有误报：`from_text` 为 4 个或更多字符的有效短语的规则仍会被评为低风险并自动应用（参见 `references/false_positive_guide.md` →“4 个或更多字符的真实单词盲区”）。
- **应用前预览更改**：`--dry-run` 会将所有计划执行的阶段 1 更改及其风险级别写入 `*_dryrun.md`。
- **始终生成更改报告**：`--changes-file` 会将每项纠正的更改前内容、更改后内容和风险级别写入 `*_changes.md`（安全模式下默认启用）。
- **供调用方使用的机器可读状态**（`--json`）：在 stdout 上输出一行 `{applied, deferred, output_path, needs_review_path, input_unchanged, review_enqueued}`（该次运行的可读日志会转发到 stderr）。使用方应读取此状态，而不是根据磁盘上是否存在 `*_stage1.md` 来推断是否未执行任何操作——对于某个领域，`input_unchanged: true`（或 `output_path: null`）**才是**权威的无操作信号。这是一项跨技能约定（调用方的预分类链会使用它）；请保持字段名称和语义稳定（`review_enqueued` 是以向后兼容方式新增的字段：表示有多少项安全模式下暂缓的纠正进入了持久化审查队列——参见“审查队列与仪表板”）。未使用 `--json` 时，可读输出保持不变。
- **提取不确定的 ASR 词元**：`--extract-uncertain -i file.md` 会将可能的错误（较短的全大写词元、音译片段、重复词语）写入 `*_uncertain.md`，而不更改原文件。
- **加载领域预设**：`--load-presets tech` 会导入一组精选的技术/Claude Code ASR 纠正规则。
- **报告误报**：`--report-false-positive "<from_text>" "<to_text>" -d domain` 会禁用错误的字典规则（请传入该规则存储的 from→to 对——对于误报规则，这与语义上的错误→正确方向相反；参见“原生 AI 纠正”步骤 2）。
- **审计高风险规则**：`--audit` 会标记看起来可能导致误报的现有规则（常用词、≤2 个字符、子字符串冲突，以及在使用 jieba 时的 4 个或更多字符的真实词语短语）。**它仅供参考：只会列出候选项，绝不会禁用任何规则。**是否禁用必须由人工决定——请逐项手动审查，并先备份数据库，因为审计无法了解你的上下文，而且会将大量有效规则误判为问题规则（例如，`GDP 5.5→GPT 5.5` 一般看起来是错误的，但对大量讨论 AI 的用户而言却是正确的修复）。参见 `references/false_positive_guide.md`。

### 由另一个技能调用时（跨技能调用约定）

此技能通常会接入另一个技能的摄取管线——例如，meeting-sync 技能会在归档转录文本之前，将阶段 1 作为预分类钩子运行。该调用方管线改变了一个会悄然引发问题的假设，因此调用方**必须**遵循此契约，否则就会触发以下两个已验证故障之一：运行阶段 1，几乎不应用任何更正，却报告成功（延迟处理的更正被悄然丢弃——见下一节）；或者运行阶段 1，完全跳过原生处理流程，却报告转录文本无误（见下文的“**阶段 1 就是完整的脚本调用**”段落）。**此契约包含两项强制要求；仅遵守第一项，会让第二个故障在一种自以为操作正确的错觉中被发布出去。**

**故障模式（已验证、可复现）。** 安全模式不会应用中高风险更正，而是将其延迟写入 `*_needs_review.md`。对于手动编辑的单个文件，这没问题——接下来读取伴随文件即可。但调用方管线通常会在 `TemporaryDirectory` 内运行 transcript-fixer，并且只读回更正后的 `transcript.txt`。**`*_needs_review.md` 伴随文件位于该临时目录中，并会随之被删除**——因此，字典中超过 95% 的更正会悄然消失，而运行结果却报告“完成”。对一份时长 95 分钟、使用包含 108 条规则的领域词典的转录文本进行实际测量后发现：安全模式仅应用了 **2/108** 条规则，并将 **106 条延迟到一个随后立即被丢弃的伴随文件中**。这次运行看起来没有问题，但只有约 2% 的已知更正真正生效。之后，用户不得不手动再运行一次 transcript-fixer，才能应用其余 98% 的更正。

**调用方规则——对于经人工确认的项目领域，传入 `--apply-domain`。** 管线接入的领域（其配置中的 `domains:` 列表）正是那些规则已由人工针对该项目词汇进行整理的领域。此处的领域匹配并非猜测，而是已确认的修复，因此管线应像批处理运行一样信任它：

```bash
# CORRECT for a caller pipeline — trust the configured project domains
uv run scripts/fix_transcription.py --input "$staged" --stage 1 \
  --domain "$domain" --apply-domain --json
```

使用 `--apply-domain` 后，同一组包含 108 条规则的运行会以低风险应用 **97/97** 条规则，而不是 2/108。`general` 领域（兜底领域，整理程度较低）可以继续使用安全模式——只有项目特定领域获得了完全信任。如果调用方无法传入 `--apply-domain`，则必须改为从 `--json` 状态对象中读取 `deferred`，并将 `*_needs_review.md` 伴随文件持久化到非临时位置以供下游流程处理，或者将非零的 `deferred` 计数作为失败呈现给用户。悄然丢弃延迟处理的更正并报告成功，就是这里所说的缺陷。

**`--json` 状态行是契约接口。** 它会在 stdout 的一行中输出 `{applied, deferred, output_path, needs_review_path, input_unchanged}`。`deferred` 是绝不能被悄然丢失的数值。`input_unchanged: true` / `output_path: null` 是“此领域有 0 项更正”的权威信号——不要根据磁盘上是否存在 `*_stage1.md` 来推断是否无操作（正是这种文件存在性检查曾经中止整个处理链并丢弃更正）。请保持这些字段名及其语义稳定不变；调用方的预分类处理链依赖它们。

**与之互补的一面：让字典保持活跃。** 信任 `--apply-domain` 的调用方流水线，其价值取决于项目领域字典的充实程度。下游原生修正流程作出的每一项已确认修正，都应通过 `--add` 添加回该领域（`--add "ASR-variant" "correct" --domain <project>`），这样下一次摄取时就能自动修正，而原生修正流程的负担也会持续减轻。冷启动的领域字典 + `--apply-domain` 仍然几乎不会应用任何修正——正确做法是将 `--apply-domain` 与持续遵守 `--add` 规范结合起来。

**Stage 1 是整个脚本调用——但绝不能是整个作业。** 上述契约可防止 Stage 1 悄无声息地丢弃自身的修正；但它并未涵盖在一份干净转录稿上完成大部分工作的修正流程。调用方如果在 Stage 1 之后就停止，会交付一份原生 AI 修正流程从未审阅过的转录稿，却将其报告为干净。因此，调用方的摄取步骤必须满足以下两者之一：自行运行原生 AI 修正流程（将已归档的转录稿交给一个已加载**此 skill** 的智能体〔可能就是当前智能体〕——加载的是 skill，而不只是脚本路径；无智能体的 CI 自动化则改为通过上面的 Stage 3 API 流程完成），或者向用户明确显示“仅完成 Stage 1”，将其作为未完成状态，绝不能报告为成功。还要注意此 skill 接入方式中的陷阱：如果调用方仅通过脚本路径引用它（例如 `transcript_fixer.script_path` 配置项），就永远不会加载此文件，因此其中的每一项契约——包括这一项——对该次运行都是不可见的。只接入脚本路径而不接入 skill，正是导致 2026-08“0 次命中、宣称干净、遗漏 54 个错误”事故的配置。

**修正后，始终将可复用的修正保存到字典中。** 这是此 skill 的核心价值——完整检查清单请参阅 `references/iteration_workflow.md`。

### 修正后添加到字典

完成原生 AI 修正后，检查所有已应用的修正，并决定哪些需要保存。使用以下决策矩阵：

| 模式类型 | 示例 | 操作 |
|-------------|---------|--------|
| 非词语 → 正确术语 | 克劳锐→Claude, cloucode→Claude Code | ✅ 添加（误报风险为零） |
| 生僻词 → 正确术语 | 拉行链→LangChain, 哈金费斯→Hugging Face | ✅ 添加（先确认它不是一个真实词语） |
| 人名/公司名 ASR 错误 | 卡帕西→Karpathy, Anthropics→Anthropic | 对于**重要且反复出现的人物**，应改为添加到你的**人物名册**中（参见下面的“人物名册”）——它能携带关系上下文，并在数据库重置后继续保留。对于一次性出现的名字：✅ `--add --domain`（稳定、唯一） |
| 常用词 → 上下文词语 | 争→蒸, 减→剪, affect→effect | ❌ 切勿添加为规则——改为在该领域的上下文文件中记录此陷阱及其消歧线索（参见“领域修正上下文”） |
| 真实品牌 → 其他品牌 | Xcode→Claude Code, Clover→Claude | ❌ 跳过（在其他上下文中是真实词语） |
| 真实姓名 → 其他真实姓名 | `李明`→`黎明`（不同项目中的两个真实人物） | ❌ 切勿设为规则——其风险与真实品牌 → 品牌相同，但它会错误篡改真实人物的姓名。应改为使用带有消歧线索的领域上下文陷阱（参见原生 AI 修正步骤 4 中基于用户裁定的细化规则） |

**折中方案，而且它只适用于标有 ❌ 的行中的一行。**
*常用词 → 上下文词*这一行（`争`→`蒸`）禁止将**孤立的**常用词设为
规则，因为这种规则会在该词的所有正常使用场景中触发。它并不禁止用足够多的周边文本
承载同一修正，使该短语只会出现在误听场景中——`村里商量` → `<name>商量`
是可以辩护的，而仅使用 `村里` 则会过于冒险。**这并不放宽
*真实姓名 → 另一个真实姓名*这一行的限制，且绝不能将其锚定后加入词典**：
应按照该行本身的说明，将其保留在领域上下文文件中。

之所以坚持排除，是因为**无论验证器如何判断，都不能在姓名问题上信任它。**
`--add` 会运行 jieba 检查：当 FROM 侧可被拆分为全部已知词时发出警告，
而某个姓名是否算作“已知”只是 jieba 词典造成的偶然结果：实测中，
`李娜商量` 会触发警告（`李娜` 的词频为 438），而 `张伟商量` 不会有任何提示
（`张伟` 不在词汇表中，词频为 0）。因此，一个静默通过的姓名锚定规则不能说明
任何问题，一个触发警告的规则同样不能说明任何问题。对于这类规则，由于没有可靠信号，
而其影响范围涉及未来每一份转写稿中的真实姓名，所以该行必须排除在外。（同样的理由也
排除了*真实品牌 → 另一个品牌*这一行：`Xcode`→`Claude Code` 在一个项目中是正确的，
却会在下一个项目中毁掉构建日志，而没有任何验证器知道你身处哪种项目。）

**警告与错误，因为它们会导致不同的结果。** `valid_phrase` 警告
表示*请手动审查此项*，**而不是** *它已被拒绝*——规则仍会被添加，并且
`--add` 以状态码 0 退出。`common_word` 和 `both_common` 是**错误**：
`--add` 以状态码 1 退出且不写入任何内容，只有 `--force` 才能绕过。
`substring_collision` **两者都可能是**，取决于触发的是哪个分支——命中精选的冲突
映射时属于错误，而更宽泛的动态检查只会发出警告，规则仍会写入。因此，应查看退出状态，
而不是只关注提示有多吵闹：一次伴随大量警告的添加操作可能已经成功，而一条你以为已保存的
规则可能根本没有写入数据库。只有在看清楚*究竟是哪项*检查提出异议之后，才应使用
`--force`，因为它也会压制那些阻断性的检查。

有一个注意事项决定了锚定规则是否值得添加：应锚定到**反复出现的搭配**，
而不是仅出现一次的句子片段。某个特定句子的片段以后再也不会匹配——它会占用一条词典记录，
却不会产生任何复利效果，而正是这些无效记录让领域加载缓慢且难以审计。
当即使使用搭配也会过于狭窄时，应将该陷阱及其消歧线索放入领域上下文文件中。

**添加前先测量语料库——验证器看不到你的项目。**
内置安全检查能回答“这在中文中是不是一个真实词语”；但它们无法回答真正决定项目领域规则
是否成立的问题：*"当这个词出现在此项目的转写稿中时，它是否有任何一次表达的是真实含义？"*
这是一个实证问题，而证据只需一条命令即可获得：

```bash
# How does this term actually appear across the project's transcripts?
uv run scripts/fix_transcription.py --probe "候选误识词" --corpus /path/to/transcripts/

# Or probe as part of the add itself (prints the evidence before writing):
uv run scripts/fix_transcription.py --add "候选误识词" "正确词" --domain myproject \
  --check-corpus --corpus /path/to/transcripts/
```

探测脚本会输出每个文件中的出现次数及抽样上下文窗口，并附带判定规则：如果抽样到的每次出现都是 ASR 错误 → 使用无锚点规则是安全的；如果存在任何真实语义 → 使用锚定形式，或者不要添加规则（改为在领域上下文文件中记录这个陷阱）；如果出现次数为零 → 无锚点规则的风险为零，但也不会产生任何复利效应。这可以消除一种意外：直觉认为“这显然是一个错误形式”，但经过 30 秒的扫描，却发现这个词在整个语料库中承载着完全真实的含义；反之亦然，一个“真实词语”在语料库中的每一次出现其实都是误听，因此使用无锚点规则是安全的，而词语检查器原本可能会让你因担忧而放弃添加它。

在一个会话中批量添加多项纠正：
```bash
uv run scripts/fix_transcription.py --add "错误1" "正确1" --domain tech
uv run scripts/fix_transcription.py --add "错误2" "正确2" --domain business
# Chain with && for efficiency
```

## 审核队列与仪表板（不确定项 → 一键判定）

已确认的纠正会通过字典持续产生复利效应；而**不确定**的纠正过去却会消失——原生处理流程会在聊天中列出它们（会话结束后即消失），安全模式下延后处理的项目会留在 `*_needs_review.md` 辅助文件中（被使用临时目录的调用方丢弃），而学习到的建议则在无人运行的 CLI 后等待。审核队列为这三类项目提供了一个位于 `corrections.db`（`review_items`）中的统一持久化归宿，而仪表板则让判定它们几乎不费力——正是这种操作阻力，横亘在“AI 怀疑存在错误”与“字典学会答案”之间。

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

每个项目都包含：原始文本（在文件中保持不变）、预填的建议、`kind`（`entity`/`unknown` 排在队列前面——它们会进入字典和名册并持续产生复利效应；`homophone`/`wording` 排在后面）、搜索阶梯所生成的证据，以及一个可选的、在接受时执行的**操作包**：`file_edit`（替换转录文本中的内容）、`dict_add`（添加到 `--domain` 字典）、`append_note`（向领域上下文文件添加一条陷阱记录）。如果没有操作包但存在文件锚点，则默认为执行一次 `file_edit`。

**失败时关闭的锚点防护机制**：整个操作包会针对文件的当前状态在内存中进行规划（每项编辑都会基于该操作包之前各项操作执行后留下的内容进行验证），只有当所有操作都成功完成规划后，才会有任何内容写入磁盘——原始文本缺失（文件在入队后已被编辑）、存在歧义（出现多次，且在行号提示附近没有唯一匹配项），或者上下文已漂移（附近没有任何行与入队时记录的片段匹配）→ 不会写入任何内容，CLI 以退出码 2 退出并返回 `{"error": "re_anchor_needed"}` 状态对象，而该项目仍保持待处理状态。错误的自动编辑比漏掉一次编辑更糟。机器调用方应解析 stdout 中的 `error` 字段，而不是仅依赖返回码（argparse 用法错误也会以退出码 2 退出）。当判定为 `overridden` 时，仅执行重新指定目标的 `file_edit`——针对原建议的 `dict_add`/`append_note` 操作会被丢弃（它们是为被人工否决的建议规划的）。（一个范围说明：只有当原始文本出现超过一次时，才会执行上下文检查——唯一出现的文本不存在需要拒绝的相似匹配项，因此单次出现的编辑无需参考该片段即可应用。）

**当守卫拒绝时：`--reanchor-review` 可修复该条目。** 拒绝并不意味着无路可走，也绝不是提示你绕过队列手动编辑文件——那会导致条目永远处于待处理状态，并且编辑未经审计。请先重新锚定，然后再次进行裁决：

```bash
uv run scripts/fix_transcription.py --reanchor-review <id> [<id>...]
# file itself is gone (moved/renamed/cleaned)? add search root(s):
uv run scripts/fix_transcription.py --reanchor-review <id> --reanchor-root <dir-with-transcripts>
```

系统会根据磁盘当前状态修复两种漂移情况，并且两者都会以失败关闭方式处理：**上下文/行漂移**（文件在入队后被编辑——在文件中重新定位 `original`，相比单纯依据距离，会优先选择仍与已记录上下文片段匹配的行，并刷新行号和逐字上下文）和 **文件丢失**（在已记录的父目录以及每个 `--reanchor-root` 中搜索包含 `original` 的 `*.md`；恰好有一个候选文件时会重新指向锚点，没有候选时不做任何更改，有多个候选时则要求使用 `--reanchor-to FILE`——即显式指定目标的形式；如果目标文件中不存在 `original`，这种形式本身也会被拒绝）。成功重新锚定后，守卫的上下文检查即可通过，`A`/`W`/CLI 解析会正常继续（显式操作包会将其 `file_edit` 路径重写为新文件的路径）。拒绝消息本身也会指出此命令。（根因追溯于 2026-08-03：使用改述后的上下文入队的条目永远无法得到裁决——人工覆盖在守卫处失败，而在此命令出现之前，只能绕过队列手动编辑文件。）

**将每个 `decision_note` 提升为规则；队列只负责存储它。** 仪表板的备注字段和 CLI 的 `--note` 会记录审核者的理由，但两者都不会将该理由转化为可复用的规则。完成一批审核后，请检查完整的队列 JSON：

```bash
uv run scripts/fix_transcription.py --list-review --review-status all --json
```

人类可读的列表从不显示 `decision_note`。人类可读的 `--show-review` 仅在条目离开 `pending` 后显示该字段；JSON 则始终包含此字段，包括 `reopen` 将条目恢复为 `pending` 后的情况。检查每个备注非空的条目，无论其状态如何；不要预先限定字段列表，否则可能丢弃审核者提供的字段。

应根据备注的含义而不是裁决结果来分流：

| 备注内容 | 将其提升至 | 不要 |
|---|---|---|
| 某个看似错误的内容实际上是依赖上下文的有意替换 | 领域上下文文件，并注明用于判断何时应保留该内容的线索 | 使用 `--add`，因为它会重写文本 |
| 某条词典规则在不该触发的地方触发了 | `--report-false-positive "<from>" "<to>" -d <domain>` | 仅在上下文备注中说明，却让该规则继续生效 |
| 某个稳定的 FROM→TO 修正会在此领域重复出现 | `--add "<from>" "<to>" --domain <project>`，但须遵循下文的实词规则 | |
| 某个反复出现的人名具有不直观的拼写 | 人员名册，该文件需手动编辑 | |

`decision_note` 从来都不是操作。预先规划的 `append_note` 操作仅在其条目为 `accepted` 时运行；`overridden` 会丢弃建议特有的 `dict_add` 和 `append_note` 操作，而 `kept_original` 和 `skipped` 不会运行任何操作。请在裁决后显式提升该备注。这与下文的 **“覆盖不会自行产生复合效果”** 所描述的是同一个缺口：修正后的文本止于 `resolved_text`，而理由止于 `decision_note`。

**入队会逐字验证锚点——编写错误会在入队时终止，而不是等到裁决时。** 当条目声明了一个可读的 `file` 时，`--enqueue-review` 会检查 `original`（以及给定的 `context`）是否逐字出现在该文件中，并修正指向唯一匹配项解析窗口（±3 行）之外的行号提示（窗口内的提示可直接使用，因此会保持不变；修正信息会打印到 stderr）。其他任何情况都会立即被拒绝并给出原因，运行会以状态码 3 退出——JSON 会将被拒绝的条目放在 `rejected_unanchored` 下（`added` 下的条目确实已入队；请修正被拒绝的条目并重新入队）。`context` 必须逐字从文件中复制；一旦周围内容首次被编辑，意译就会使锚点发生偏移。（尚不存在的文件不会被验证——例如，为另一台机器上的文件入队的条目；这种情况由解析时的防护机制负责。`stage1_deferred` 条目也不受此限制——其 `from_text` 是先前规则在内存中应用后由引擎逐步生成的文本，因此尚未出现在输入文件中是合理的。）

**一次裁决只修复一个出现位置——其他同类位置需要你自行清理。** 一个已解析的条目只会编辑一个文本范围。当原始文本出现多次时，防护机制不会编辑全部位置：它会选取上下文匹配且距离所记录行号提示最近的出现位置；如果无法做出选择——完全没有行号提示、提示附近没有匹配项，或者两个出现位置与提示的距离相同——则会拒绝处理（`re_anchor_needed`）。无论哪种情况，其他出现位置都会保留下来，**包括裁决刚刚编辑过的同一行中的其他位置**，而重复名称最有可能出现在这里。对一个真实批次的测量结果是：十个条目得到解析，其中四个留下了另外六个未处理的出现位置，而这些位置中有两个位于裁决已经修改过的行中。因此，裁决批次还有后半部分：

```bash
# 1. See what was actually decided. The default listing shows PENDING only —
#    the items you just resolved are precisely the ones it hides.
uv run scripts/fix_transcription.py --list-review --review-status accepted
uv run scripts/fix_transcription.py --list-review --review-status overridden
# 2. Read the verdict that was recorded, per item.
uv run scripts/fix_transcription.py --show-review <id> --json
```

**替换文本应取自 `resolved_text`，绝不能取自列表行。** 在覆盖裁决中，人工输入的文本会写入 `resolved_text`，而 `suggested_text` 仍然保留他们*拒绝*的建议——且供人阅读的列表打印的是该建议。从那一行传播替换会把被拒绝的答案应用到所有剩余的出现位置，这比不做处理还要糟糕。覆盖裁决允许输入任意文本，因此在传播前应先阅读它：否则，一次输入的拼写错误会变成五处拼写错误。

使用 Edit 修复剩余的出现位置，或者使用仅限于**那一个文件**的 `sed`——这是在单个文件内传播人工已经作出的决定，而不是批处理规则所禁止的跨文件查找替换——然后再次执行 grep 进行确认。

**仅清理 `entity` 类型的条目。** `homophone` 或 `wording` 裁决是针对*该句子*作出的判断——它们属于步骤 5 所述需要锚定到周围文本的上下文相关类别，也是 `争`→`蒸` 这一行避免纳入一概而论规则的类别。将其中一个裁决传播到整个文件，正是字典矩阵旨在防止的错误。

**而在 `entity` 内，裁决所确定的是该实体，而不是每个听起来都与它相似的词元**——这是第 4 步的例外规定，保持不变。如果某次出现指的是被提及的第三方，而非正在被称呼的人（“我会向银行的 `<token>` 询问”），那么它完全可能需要相反的处理：保留该处，并将其单独加入队列。人工**仅通过听取一个音频片段**得出的裁决也应同样谨慎对待——那几秒音频只能确定该次话语，而第二次出现就是另一次话语。应清理那些显然以相同含义指向同一实体的出现位置；这是通常情况，也是上述测量所统计的情况。

**应在整个批次都处理完毕后再清理，而不是在两次裁决之间清理。** 如果仍处于待处理状态的条目锚定到了一个已被清理的出现位置，该条目的防护检查将失败（`re_anchor_needed`，退出码 2），必须重新加入队列。

**覆盖操作本身不会自动产生后续效果——请使用 `--add` 完成它。** 当状态为 `overridden` 时，队列会丢弃 `dict_add` / `append_note` 操作（它们原本是为被人工拒绝的建议而规划的），因此整个循环中最强的信号——人工亲自纠正 AI——反而是唯一不会进入词典的情况，除非你主动将其添加进去：
`--add "<original>" "<resolved_text>" --domain <project>`，同时须遵守上述真实词语规则。

**仪表板**（单审核员，本地运行）：

```bash
uv run scripts/review-dashboard/server.py   # opens http://127.0.0.1:8767
```

Prodigy 风格的单焦点卡片：显示实时文件上下文并突出显示锚点行、预填建议、展示证据、键盘优先——
`Q` 播放该话语 · `A` 接受 · `R` 原文正确 · `W` 覆盖
（输入正确文本）· `S` 跳过/无法判断 · `Z` 撤销 · `↑↓`/`J K` 导航
（裁决键特意集中在左手区域；右手可始终放在鼠标上）。环境变量调节项：`REVIEW_DASHBOARD_PORT`（默认值 8767），
设置 `REVIEW_DASHBOARD_NO_BROWSER=1` 可跳过自动打开浏览器标签页。
读取操作直接访问数据库（只读）；**每次写入都会通过 shell 调用 CLI**，因此状态机、锚点防护检查和审计日志始终保持为唯一事实来源，而智能体（CLI）和人工（页面）具有同等的写入权限。

**音频播放（`Q`）**——审核员往往无法仅凭文本判断一段含混不清的话语；听取原始录音中的那一秒即可作出判断。转录稿通过在 frontmatter 中显式声明其录音来启用此功能（不会隐式扫描目录——如果缺少该字段，卡片就不会显示播放按钮）：

```yaml
---
date: 2026-08-02
minute_token: abc123
audio: /absolute/path/to/recording.m4a
---
```

需要添加的是 `audio:` 这一行；其他内容代表转录稿中原本已有的任意字段。该行**有意采用不加修饰的裸格式**——见下文；另请注意，这个示例经常被逐字复制，以至于该行末尾的 `#` 注释不止一次作为真实缺陷被发布出去。

**请将这一行添加到转录稿已有的块中——不要在末尾追加第二个块。** 同步后的转录稿通常已带有 frontmatter（`date`、`minute_token`、`participants`……），而解析器遇到第一个 `---` 结束标记时便会停止，因此其下方的第二个块永远不会被读取。

**值应直接填写——末尾不要添加注释。** 解析器会读取第一个冒号之后的所有内容
（`line.split(":", 1)[1].strip()`），且不会移除 `#`，因此
`audio: /path/x.m4a  # same timeline` 会被解析成一个以 `# same timeline`
结尾的路径，而该路径并不存在。块的结构也是如此：它必须从第 1 行开始，以对应的
`---` 结束，并且键必须不带缩进。

这些错误的表现完全相同——卡片上**既没有播放按钮，也没有错误提示**，看起来就像
“这份转写没有音频”。如果你原以为某张卡片应该有音频，但实际没有，请先排查前置元数据，
再怀疑录音本身。

该文件必须与**转写时间戳所指向的时间线完全相同**——也就是输入 ASR 的那个确切文件。
基于 1.3 倍速输入生成的转写只能与 1.3 倍速文件配对；如果将它与原始文件配对，
每个片段都会播放错误的时间段。

仪表板会根据锚点前后的说话人时间戳行
（`<speaker> HH:MM:SS.mmm`）确定片段的时间窗口，通过 HTTP Range 流式传输文件
（即时跳转，无需完整下载），并且只播放该段话；当切分点落在句子中间时，`± 3s` 会扩大
时间窗口。每种录音来源都应验证一次时间线配对
（`ffprobe` 时长 ≈ 转写中的最后一个时间戳）——速度倍率不匹配会导致所有位置都播放错误的时间段。

**为飞书妙记转写接入音频**（当转写来自 minutes-sync 流水线时，这是最常见的情况）
——使用随附脚本，它会执行下载、时间线检查，并输出前置元数据行：

```bash
uv run scripts/fetch_minute_audio.py \
  --token <minute-token> --profile <lark-cli-profile> \
  --output ~/.transcript-fixer/cache/audio/<name>.m4a \
  --transcript <path/to/transcript.md>
```

**这两个参数都来自转写正文之外。** `--token` 是转写自身前置元数据中的
`minute_token:` 字段（minutes-sync 流水线会将它写入其中；如果该字段不存在，
妙记 URL 的最后一个路径段就是同一个值）。`--profile` 是 lark-cli 配置名称——使用
`lark-cli profile list` 列出所有配置，然后选择属于该录音所有者账户的配置；
转写中不会记录它，因此如果所有者并不明确，请询问而不要猜测（错误的配置会以如下所述的
无提示方式失败）。

请将音频保存在文档仓库之外——媒体二进制文件不应被提交进其 git。

**退出码**——检查状态，而不是输出：诊断信息会写入 stderr，而 `audio:` 行会写入
stdout，因此即使某次运行未完成任何验证，也仍会输出一行看似可用的内容。

| 代码 | 含义 |
|---|---|
| `0` | 已验证——音频与转写使用相同的时间线 |
| `1` | 时间线不匹配：文件已下载，但**不要**接入 |
| `2` | 已下载，但配对未经验证——`ffprobe` 不存在或其输出不可用、未提供 `--transcript`、转写中没有 `<speaker> HH:MM:SS.mmm` 行，或者所有这些行都是 `00:00:00`（调用格式错误时，argparse 也会以状态码 2 退出；其消息会明确说明这一点） |
| `3` | 未生成任何可用内容——`--transcript` 路径错误（会在执行任何网络操作之前检查），或者获取失败：lark-cli 报错、curl 失败、下载内容过小，或者**该 `--profile` 无权读取这条妙记**；这是最常见的原因，并不表示 token 错误 |

由缺少说话人时间戳行导致的 `2` 值得停下来处理，而不是设法绕过：仪表板使用的也是这些行来构建音频片段窗口，因此，关联到此类转写稿的音频将没有任何可播放的内容。

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

脚本对三件事进行了处理，而手动操作时，它们每一项都会导致实际失败：

- **lark-cli 自身的 SSRF 防护机制会拒绝它自己的下载主机。** 错误信息为
  `blocked download URL: local/internal host is not allowed`——飞书的
  签名下载域名实际上就叫作 `internal-api-drive-stream.…`，而
  `internal-` 前缀会触发该防护机制。备用方案是使用 `--url-only`，再自行执行
  `curl -L`，脚本采用的正是这种方式。
- **`--url-only` 的封装内容是真正的 JSON——请解析它，而不要进行模式匹配。**
  URL 位于 `data.download_url`（它是嵌套字段，而不是顶层字段），使用正则表达式
  抓取会将 `&` 等 JSON 转义保留为字面值，导致 URL 在第一个参数处被截断，并下载
  一个重定向存根而不是音频。`json.loads` 可以原生处理这一点，而转义错误正是由
  手写提取逻辑引起的。
- **妙记是按租户、按用户划分的资源，因此通常出错的是 `--profile`，而不是令牌。**
  来自其他租户的配置文件——或者所属账号从未获享该妙记的配置文件——可以正常完成
  身份验证，但仍然不会返回 `download_url`。请传入录音所属账号对应的配置文件。

请在将那些需要通过听音频来评判的条目加入队列**之前**关联音频（第 4 步会将跨语言专有名词路由到那里）——否则，审核者打开卡片时不会看到播放按钮，也就无法回答你提出的问题。

**Stage 1 集成**：safe-mode 延后项会在运行时自动加入队列
（`source: stage1_deferred`），因此调用方即使丢弃 sidecar，也不再会丢失这些项。例外情况：位于操作系统临时目录下的输入不会加入队列
（暂存副本消失后，锚点将成为失效指针）——`--json` 的 `deferred` 计数仍会向调用方报告这些项，而新增的
`review_enqueued` 字段则表示有多少项已进入队列。

## 防止误报

添加错误的字典规则会悄无声息地破坏未来的转录文本。**添加任何纠正规则之前，请先阅读 `references/false_positive_guide.md`**，尤其是针对短词（≤2 个字符）或在普通文本中本来就会正确出现的常见中文词语。

## 项目特定纠正与人名纠正（`--domain` 隔离）

对于**反复出现的项目特定错误**——人名、项目术语、内部代号——最重要的处理模式是使用 `--domain` 标志。这也是对上述误报担忧的*解决方案*：某个人名修正可能**在你的项目中**是正确的（例如 ASR 总是识别错误的一位同事的名字），但可能会与其他人的转录文本中真实存在、拼写不同的人名冲突——因此绝不能将其加入全局（`general`）字典。

`--domain` 通过隔离这些规则来确保安全：

```bash
# Add the rule under an isolated, project-named domain (not 'general')
uv run scripts/fix_transcription.py --add "<ASR-garbled-name>" "<correct-name>" --domain <project>
# Apply ONLY that domain's rules to this project's transcripts
uv run scripts/fix_transcription.py --input meeting.md --stage 1 --domain <project>
```

在 `--domain <project>` 下添加的规则，只有在纠正时传入 `--domain <project>` 才会生效。其他项目（使用它们自己的 domain，或默认的 `all`）不受影响——因此，即使是存在风险的短词／常见词人名规则也是安全的，因为它只会在该规则确实正确的项目中生效。

### 为什么这胜过一次性脚本（核心价值，请勿跳过）

面对一份——甚至整批——充斥着相同 ASR 人名识别错误的转录文本，最诱人的做法是快速使用 `sed` / `python` 进行查找和替换。**不要这样做。** 这是使用此 skill 时最严重的反模式：

- 一次性脚本只能修复*当前这批*文本，之后这些知识就会消失：下一批、下周、下一个项目，你还得从头重写。它无法积累价值。
- 字典可以**持续积累**：只需执行一次 `--add`，之后每份转录文本都会通过 `--stage 1 --domain <project>` 自动纠正。将这一条命令接入项目的摄取步骤，人名从此都会被自动修正，无须额外成本。
- 字典具备误报防护机制（短词警告、`audit` 命令、`--report-false-positive`）；原始的 `sed` 则没有任何防护，会悄无声息地破坏相似词。

**经验法则：反复出现或项目特定的错误 → `--add ... --domain <project>`（可持续积累）。绝不要使用一次性的 sed/python 替换。** 只有当某项修正确实仅出现一次、永远不会再次发生时，才可以使用一次性脚本——但即便如此，使用字典通常也更省力。

ASR 在识别中文姓名时尤其不稳定：一个人的姓名可能会碎裂成十几个同音变体（在一个真实项目中，某个姓名曾出现 13 种以上的 `[姓变体]×[名变体]` 组合）。使用 `--add --domain <project>` 记录每个已确认的变体，以便它们在今后的每次运行中都归并为规范姓名。


### 人员名册（长期人员姓名 SSOT）

对于姓名经常被 ASR 错误识别的**重要且经常出现的人员**
（同事、客户、家人、工作坊参与者），应维护一份**人员名册**
Markdown 文件——作为人员姓名的 SSOT——而不是将其逐个添加到
数据库中。当 `~/.transcript-fixer/config.json` 中设置了
`people_roster_path` 时，Transcript-fixer 会在阶段 1 自动从此名册加载
人员姓名纠正规则。

**名册格式**（规范格式：`### Name` + `- **ASR 变体**: variant1, variant2`）：
```markdown
### Nina Zhao
- **ASR 变体**: Nena, 妮娜

### 小雨
- **ASR 变体**: 晓雨, 小宇老师
```

这两种示例形式都值得照搬。在中文语音中说出的英文名字会产生
*两类*变体——拼写错误（`Nena`）和中文音译（`妮娜`）——而中文昵称则会产生
同音变体以及带敬称的形式（`小宇老师`）。列出你实际见过的每一种形式；
每一种形式都会成为一条无需额外操作即可生效的规则。

**设置**（仅需一次）：
```bash
# Edit ~/.transcript-fixer/config.json and add:
#   "paths": { "people_roster_path": "/path/to/people.md" }
```

此后，每次 `--stage 1` 运行都会自动合并名册中的纠正规则
（仅存在于内存中——绝不会写入数据库）。发生冲突时始终以数据库为准，因此
名册会填补空缺，而不会覆盖手动调优的条目。解析器见
`scripts/core/people_roster.py`。

**优先级分为三层，其中第三层受域范围约束，而名册是全局的**
——这种不对称性经常出人意料：

1. 在本次运行的域中处于活动状态的数据库规则优先。
2. 否则，由名册提供该配对。
3. **除非**该配对在本次运行的域中已被禁用——此时名册中的对应规则也会被
   抑制，并且运行时会输出 `🚫 People roster: N variant(s) suppressed`。

第 3 层按域生效，因此使用 `--report-false-positive
--domain A` 停用某个配对，并**不会**使其在 `--domain B` 下停用：名册是全局的，
而且在 B 中没有任何规则阻止它，因此该规则仍会继续生效。这是有意为之（某个
域中的误报在另一个域中往往是正确的），但这意味着“我已经禁用了它，它却仍然
生效”几乎总是因为使用了*不同的域*——在编辑名册之前先检查这一点，因为编辑
名册会一次性在所有地方停用该配对，包括共享同一文件的其他项目。
`--report-false-positive` 现在会列出该配对仍处于活动状态的域，并以 `3`（此处
已禁用）或 `4`（仅存在于名册中，没有可禁用的数据库记录）退出，以便自动化
流程将这些情况与真正的失败区分开来。

**何时使用名册，何时使用 `--add` 添加到数据库：**

| 人员 | 添加到 | 原因 |
|--------|-------|-----|
| 长期反复出现（同事、客户、家人、工作坊参与者） | **people.md** | 包含关系上下文的 SSOT；数据库重置后仍可保留 |
| 一次性出现／次要姓名 | **数据库**（`--add --domain`） | 快捷，无需上下文 |

**姓名变体爆炸——同一个人，所有声母都可能出现。** 一个人的姓名即使已被说话人分离系统标注过一次，在正文中仍可能裂变成一整个变体家族，有时甚至横跨*不同的声母*（在一次 56 分钟的通话中，同一个姓被听成了 h/f/w/g/zh 等形式——2026-08-08 的真实案例：一位说话人以七种不同姓氏声母的形式出现）。这不是一个需要逐个追查变体的 bug；它其实是伪装起来的规范姓名问题。应将其作为一个整体处理：

1. **首先确定规范姓名**——询问用户，或使用经确认的人工标注说话人分离标签，敲定一种拼写，然后再进行全量扫除。自动分配的标签，或来源不明的标签，仍然只是候选项，必须遵循下方的验证阶梯。若未确定规范姓名便处理一个变体家族，只会产生七个修了一半的结果和一份混乱的名册。
2. **在一次处理中扫除文件里的所有变体**（对单个文件使用一次 `sed` 命令并在其中包含所有变体，然后重新 grep，直至结果为零），不要逐个变体处理。
3. **在名册的 `ASR 变体` 行中记录整个家族**——包括你实际看到的每一种形式，无论多么古怪。下一份转写稿还会产生这个家族的新成员，而名册能在家族不断扩大的同时保持规范姓名稳定不变。
4. **敬称形式（`X老师` / `X总`）也是变体**——敬称是说话人实际说出的内容，因此绝不要用不带敬称的姓名来*替换*它，但其中的姓氏要接受同样的扫除，并加入同一条名册记录。

**对话中途给出的判定必须立即沉淀——绝不要推迟。** 当用户在你仍在工作时回答姓名/数字问题（消息中途的纠正，或对候选短名单的一词回答），该判定就是整个循环中最有力的信息来源，而且立即记录它毫无成本：修复文件、使用 `--add` 添加已确认的变体，并在同一轮中更新名册/上下文——不要等到“批次处理完后”，因为推迟的事项往往就死在那里。在一次真实的批处理会话中，四个中途判定全都在给出的当轮立即沉淀（2026-08-08），其中一个还纠正了审核者自己关于版本号的过时训练数据。当用户的判定与你的搜索结果冲突时，应以用户判定为准，而不是把它视为需要再次核查的异常。

## 领域纠错上下文（各领域的 AI 先验）

词典负责确定性替换；人员名册负责姓名。还有第三类错误无法安全地归入其中任何一类：**依赖上下文的同音词**——只有在特定讨论语境中才是错误的词。例如，在讨论每天制作 N 条视频片段的会议中，将 `减`→`剪`；又如在财经通话中，某个常用词与股票代码昵称发生冲突。针对常用词设置词典规则，会悄无声息地破坏其他所有转写稿；而通用 AI 处理又缺乏足够的领域先验，无法有把握地纠正它——要么猜错，要么留给人工处理。（真实案例：一份转写稿中有四处 `减到 N 条`，实际含义全都是 `剪到`；AI 处理虽然有所怀疑，但在没有领域先验的情况下不愿修改，最终只能由用户手动修复。）

领域上下文文件可以弥合这一差距。每个领域对应一个 Markdown 文件，存放在**用户空间**中，与你的 `corrections.db` 和 `people.md` 相邻（绝不能放在 Skill 包内部——这样它才能在 Skill 更新后继续保留，并确保项目知识的私密性）：

```
~/.transcript-fixer/contexts/<domain>.md
```

（如果你通过 `TRANSCRIPT_FIXER_CONFIG_DIR` 更改了配置目录的位置，上下文文件应放在该目录下的 `contexts/` 中。）

在进行原生校正时（参见下方工作流），请先读取转录稿所属领域的上下文文件，然后再进行分类处理。该文件应包含三类内容：

1. **一行业务上下文**——该领域的录音通常讨论什么
2. **已知的同音字陷阱**——每项都应附带能够消除歧义的*上下文线索*（“当句子讨论制作/编辑片段时，应使用 `剪`”），还可以选择性附上一条带日期的真实示例
3. **权威名称来源的指引**——项目的别名台账、相关的人员名册章节、现有的数据库领域——以便验证阶梯（见下方第 4 步）知道应优先查找哪些位置

上下文文件中绝不能包含：硬性替换规则。作为规则的 `减→剪` 既不应放入上下文文件，也不应放入词典——该文件通过先验信息和线索帮助你进行判断；它绝不授权盲目替换。每项修复仍须经过下方的置信度分类处理。

维护循环（与词典的 `--add` 习惯相呼应）：当原生会话中出现**依赖上下文**的重复性错误——你在这里修复了它，并且它还会在该领域未来的转录稿中再次出现——请将其连同消除歧义的线索追加到该领域的上下文文件中。确定性的非词语/名称修复仍像以前一样记录到 `--add --domain` / 名册中。

格式和完整示例模板：`references/domain_context_guide.md`。

注意：上下文由**原生工作流**使用（由代理读取文件——不涉及代码）。API 模式（`--stage 2/3`，备用通道）目前尚不会注入这些上下文；如果该通道后续完成，也应将这些文件提供给它的提示词。

## 原生 AI 校正（默认模式）

在 Claude Code 中运行时，请在第 2 阶段使用 Claude 自身的语言理解能力——对于高质量 ASR，几乎所有真正的校正都发生在这里。**根据转录稿调整投入的工作量。**不要把一段 10 秒的备忘录变成研究项目，但也不要对一场 90 分钟的战略会议敷衍了事。应根据录音的特征选择级别，而不是根据你的心情：

| 判断信号 | **快速级别**（花几分钟，而不是几小时） | **完整级别**（整套阶梯都能发挥作用） |
|---|---|---|
| 长度 | 较短（≤ 约 15 分钟 / 数百行） | 较长（30 分钟以上 / 1000 行以上） |
| 说话者 | 一到两人，姓名都是你已知的 | 3 名以上说话者，或存在陌生姓名 |
| 词汇 | 日常语言，无领域术语 | 领域术语密集（金融/医疗/法律/项目代号）或包含大量专有名词 |
| 重要程度 | 内部备忘录、用完即弃 | 面向客户、将提交到共享仓库、会影响决策 |

- **快速级别**——执行第 1 阶段（`--apply-domain`）；如果存在领域上下文文件，则读取它；完整通读一次；直接修复明显的一次性错误；使用 `--add` 将任何重复出现或项目特有的术语添加到某个 `--domain` 中。**跳过：**跨领域名称验证阶梯、第二轮子代理检查、待核查流程。完成一次线性检查即可。
- **完整级别**——执行下方的全部流程：使用名称验证阶梯进行完整分类处理、由独立子代理进行第二轮检查，并明确列出待核查项。投入这些精力是合理的，因为较长或领域术语密集的转录稿不仅错误更多，错误也更难确认；而且，提交到共享仓库中的错误专有名词还会继续传播。

一段录音可能很长，但仍属于快速层级（两位已知说话者、语言直白）；也可能很短，却属于完整层级（一次 5 分钟的通话，充斥着陌生的药物名称，而且这些内容还会进入报告）。应根据*词汇和风险程度*来确定层级，以长度作为平局时的判定依据——这才是真正需要下功夫的地方。

**纠正范围包括元数据行，而不仅仅是正文。** 归档的转录文本通常带有源自 ASR 的元数据——例如 `Keywords:` 行、frontmatter、标题——这些行包含与口语正文中*相同的*识别错误（例如，即使正文中每一处提及都已从 `克劳锐` 纠正为 `Claude`，`Keywords:` 行中仍列着 `克劳锐`）。请按照相同的规则纠正它们。不存在“元数据不可触碰，应保持原样”的例外：元数据同样是搜索/grep 的检索面，而且以 ASR 乱码形式遗留的关键词会让未来每一次 `grep Claude` 都悄无声息地失败，即使正文看起来已经干净无误。重新对最终文件执行 grep 以确认纠正已生效时，也要将元数据行纳入检查。

1. 对所有文件运行阶段 1（字典）（若有多个文件，可并行处理）
2. 验证阶段 1——与原始文件进行 diff。如果字典引入了误报，请改为基于**原始**文件进行编辑。**这里的误报是你欠字典的一笔债**：同一条错误规则会继续作用于未来的每一份转录文本，直到它被停用。因此，一旦发现误报——某条规则把原本正确的话改错了，尤其是“真实词 → 真实词”规则（两边看起来都是有效词，因此非词防护机制无法捕获它们；而且在 `--apply-domain` 下，所有匹配的规则都会应用，无论其风险类别如何）——例如，某条 `买买→卖卖` 规则把正确的“买买工作流”改成了“卖卖工作流”——就要在同一会话中使用 `--report-false-positive <from_text> <to_text> -d <domain>` 将其停用——必须严格按照阶段 1 的 `*_changes.md` 中所示（From/To 列）或字典中存储的规则，传入该规则的 from→to 对，而不是按照“错误词 → 正确词”的语义传入。处理误报时，这个方向有些反直觉：`买买→卖卖` 规则存储的是 `from=买买, to=卖卖`（它把正确的“买买”改成了错误的“卖卖”），因此你应传入 `"买买" "卖卖"`——也就是该规则存储的 from→to 对，工具正是以此作为键。一条调用就会停用该规则并降低其置信度（工具会输出“The rule has been disabled”）；它不会再作用于下一份转录文本。如果该词确实存在*歧义*（在某些上下文中正确，只在此处错误），而不是规则本身完全错误，就不要停用该规则——应改为将消除歧义的线索记录到领域上下文文件中。只修复当前转录文本却让陷阱继续处于启用状态，只会确保下一份转录文本再次中招。
   **而且，当输入已经经过自动纠正器处理时**（同步流水线的 pre-classify 阶段、之前的阶段 3 API 运行），你的输入就不是原始 ASR——上游纠正已经固化其中，而且没有证据链。分类之前，应与原始来源进行 diff（调用方的原始转录文本——同步引擎通常会在纠正后的副本旁保留一份，例如 `transcript_raw.txt`——或者从源 API 重新拉取）。该 diff 会得出方向相反的两点结论：**(a)** 上游进行的每一次实体替换本身都应作为步骤 4 分类中的可疑项，因为上游 AI 的“纠正”可能是流畅但错误的猜测——真实案例：原始 ASR 中的「新的车辆」被流水线 AI“润色”为「新出来的反馈」（语法正确、看似合理，但其实错误：说话者说的是一个近音名称），只有与原始文本进行 diff 才发现了这一点；**(b)** 上游已经正确修复的内容应视为已解决——在提出一个实际上已经应用的修复之前，先检查 diff，否则你不仅会重复劳动，还有可能把正确形式“修正”回错误形式

**如何判断上游的每一项改动——一个有效的测试，以及一个无效的测试。** 对上游的每一处编辑，都按第 6 步所写的方向执行*声音距离*测试：**如果两边在语音上的差异大到任何 ASR 都不可能产生这种替换，那它就不是纠错——而是模型改写了说话者所说的内容，必须将其还原。** ASR 会听错声音；它不会把一个词换成同义词，也不会改变代词。有两种形式反复出现，而且在页面上看起来都不像错误：
   - **将一个术语替换为一个看似合理的近义词。** 两个词没有任何共同音素，因此任何引擎都不可能混淆它们——而决定性的线索来自整个语料库：替换后的词在项目材料的其他任何地方都未出现，而原词则是该项目的标准词汇（由之前某次会议定义的术语）。接受任一形式之前，先在整个语料库中 grep 这两种形式。
   - **改写代词或主语。** 改写后的内容读起来比原文*更*合乎逻辑，却悄然改变了某句话所指的人——这是事实变更，而不是转录修复。在大多数语言中，不同代词在语音上彼此无关；如果引擎把一个代词误听成另一个，它应该会把整句话都弄得面目全非。

   **为什么这需要专门的测试，而不能依赖你的判断：上游纠错器以流畅性为优化目标，因此它输出的所有内容读起来都很通顺——这使得“结果是否合理？”这一检查，对于识别这种特定故障完全没有区分能力。** 你不可能仅靠阅读发现它，而且流水线越顺畅，错误文本看起来就越可信。diff 是唯一能发现它的工具。由此有两个值得提前规划的后果：在自己通读之前先运行 diff，让上游的编辑以候选项的形式呈现，而不是直接成为你校对的文本；当你确实还原某项改动时，还要全面检查此前已写下并引用了受污染形式的所有内容（第 9 步的衍生文档检查——根据还原前文本写成的笔记和摘要会携带相同的污染，而且与转录稿不同，它们没有任何标记来说明这一点）。
3. **加载该领域的先验信息，然后阅读完整转录稿。** 如果该转录稿所属领域存在 `~/.transcript-fixer/contexts/<domain>.md`，请先阅读它——它会提示需要警惕哪些同音词陷阱，并列出第 4 步搜索阶梯所需的权威来源（参见上文“领域纠错上下文”）。然后，在提出更正之前阅读**整份**转录稿——后文语境会消除前文错误的歧义（开头附近被转录错的人名，往往在后文会变得很明显）。对于大文件，可以分块阅读，但在做出任何决定之前必须读完整份文件
4. **将每个候选错误分到三个类别之一**——这种分类正是需要判断力的部分。**首先要克服三种会反复错误归类人名的下意识反应**（这三种都是真实且反复出现的故障——它们会把本可修复的人名直接送入“询问用户”）：
   - **先看说话者标签——转录稿通常已经包含这些姓名。**
     在搜索任何地方之前，先收集文件中的全部说话者标签；
     如果一个转录错的词元按声音与其中某个标签匹配，那么它几乎肯定就是
     同一个人，而标签提供了正确拼写——标签复制自姓名
     *注册表*（由人工标注录音，或者由说话者分离系统根据参会者名单 /
     声纹注册信息进行匹配），而正文则是对口语声音的原始
     ASR 结果。这里有四项限定条件，第一项不是可选项。
     **(a) 仅将其用于正被称呼或自我介绍的姓名，绝不能用于
     正被提及的姓名。** “你好，<词元>”和“我的名字是<词元>”能够识别一位
     说话者；“我会去问银行的<词元>”指的是可能只是
     *听起来*像某位说话者的第三方——将其改写成某位说话者的姓名，会篡改一个
     真实人物，这正是字典表中所称的“真实姓名 →
     另一个真实姓名 ❌ 永远不能作为规则”这一风险。仅仅由于这个原因，同一文件中两个语音完全相同的词元
     也可能需要相反的处理，因此被提及的姓名应继续沿搜索阶梯查找，而不是
     在这里解决。
     **(b) 与所有标签进行匹配——包括但不限于该文本块
     上方的标签**——转录错的姓名通常出现在由
     其他人说出的文本块中（`A` 向 `B` 打招呼），有时也会出现在该说话者自己的文本块中
     （自我介绍）。**(c) 标签确定是谁；名单仍用于
     确定规范拼写**——手动输入的 `Joe` 应规范化为名单中的
     `Jo`，只修正拼写，绝不扩充长度。**(d) 人工标注的标签就是人工身份识别结果：
     应直接应用，不要把该姓名加入待检查列表，也不要让用户
     确认——用户在添加标签时已经回答了这个问题。**（真实案例：对一个印在
     该说话者每个文本块上方的姓名走完了整个搜索阶梯，一无所获，随后又要求用户
     确认。那些标签正是用户自己添加的。）
     如果无法判断标签是人工标注还是自动分配，
     **则假定为自动分配**：声纹匹配可能把一个拼写完全正确的
     姓名分配给错误的说话者，而且这绝不会显得像转录错误——因此应将
     该标签视为需要通过搜索阶梯确认的强候选项，而不是
     终止条件。对于 `说话人 N` / `Speaker N`、
     角色标签（`主持人` / `Interviewer`）、不属于说话者的第三方，
     或者本身就明显转录错误的标签，应继续进入搜索阶梯。只修正**正文**
     ——绝不要编辑标签或重新分配谁说了什么——并保持编辑幅度最小
     （不要把名字扩展成没人说过的全名），然后使用 `--add` 将
     已确认的变体添加到某个 `--domain`，以便下一份转录稿能够自动修复。
   - **根据声音而不是字形判断 ASR 错误。** 中文 ASR 错误通常是同音字 / 近音字替换，因此判断“是否为同一实体？”时应依据发音，而不是看字符是否完全匹配。如果一个姓名被转录为 `X小Y`，而名单或字典中已经有 `X晓Y`（小/晓同音），那么这就是**同一个人 → 确信修复**——不要仅仅因为页面上的小≠晓就将其降级为不确定。对于音节在发音上都对应近音译名的外国姓名，也适用相同逻辑。字典中存在发音相近的规范形式，是*支持*该修复的证据，而不是可以忽略的不匹配。
   - **但声音相似是判定身份的*充分*证据，而非*必要*证据——并且这种例外是一整个类别，而不是罕见情况。** 当姓名以一种语言说出，而引擎却按另一种语言进行转录时（中文语音中夹杂的英文名字、音译姓氏），结果可能在语音上与规范形式**毫不相关**，而且更糟的是，它可能读起来像另一个完全正常的*真实*姓名。在一个实际测量的案例中，同一个人以三个不同词元出现，没有一个与她的姓名近音，而且每一个看起来都很像另一个真实人物；之所以能识别这些词元，仅仅是因为它们都出现在同一位缺席负责人理应出现的位置，而最终*确认*它们的是人工听取那几秒钟的音频。
     **这并不会推翻上面的 (a) 条。** 该规则禁止将一个*被提及的*词元解析为某位**说话者**的姓名，并以说话者标签为来源——其故障模式是将第三方错误覆盖成房间里的某个人。这里的类别方向恰恰相反：该词元解析为已知的**非说话者**，其规范形式来自名单或项目台账，并由人工听辨而不是标签来确定。如果两种情况难以区分，则以 (a) 条为准，该词元继续沿搜索阶梯查找。
     因此，一个未通过声音测试、但位于某个已知人物应出现位置的候选项，**既不能忽略，也不能改写**：将其以 `kind: entity` 加入队列，等待音频验证（仪表板中的 `Q` 正是为此而设的工具）。即使你不确定，也要把最佳候选项填入 `suggested`——完全没有建议的项目无法被接受（对其执行 `--decision accepted` 会报错），否则审阅者将被迫为每张卡片重新输入答案。在加入队列**之前**接好转录稿对应的音频（参见仪表板的音频章节）：前置元数据会在查看时实时读取，因此稍后添加仍会使播放按钮可用——但编辑转录稿会导致行号相对于记录每个项目锚点时使用的 ±3 行窗口发生偏移，而这是修复成本高昂的部分。
   - **无法识别的姓名默认进入下面的搜索阶梯，而不是询问用户。** “只有用户知道这个姓名”是最常见的错误下意识反应。规范拼写几乎总是已经存在于这台机器上的**另一个项目领域**中——因此必须一次查询**所有**领域（使用下面搜索阶梯中的跨领域 SQL），而不能只查询恰好传给 `--stage 1` 的那个领域，因为它可能是全新的空领域。只查询该领域后就放弃，看起来完全像是“我检查过了”，实际上却没有找到本来就在那里等着你的结果。
   - **确信修复**——非单词、明显的乱码、你已经认识的产品名称变体，或者在上下文中不存在歧义的同音词（上下文明确要求使用 `there` 时，将 `their`→`there`；其他所有提及都写作 `彭博` 时，将 `彭波`→`彭博`）。直接应用（第 5 步）。
   - **需要验证**——无法从上下文确认的专有名词：人名 / 公司名 / 股票代码 / 产品名 / 地名（医学访谈中听错的药品名、播客中研究人员的姓氏、财报电话会议中的股票代码），或者任何你无法指出具体来源的术语——即使你认为自己认得它也一样（“我相当确定”正是错误姓名混入文本的方式）。**在询问用户之前，先通过本地优先的搜索阶梯解决它。** 对于项目 / 个人实体，权威拼写几乎总是已经存在于这台机器上，而 WebSearch 对内部姓名几乎毫无用处——它会返回同名的错误人物，或者什么都找不到——更糟的是，一个流畅却错误的猜测会变成日后很难发现的确信修复。按以下顺序搜索：

0. **人员名册** — `people.md`（或 `~/.transcript-fixer/config.json` 中
         `people_roster_path` 指向的任何位置）。这是你精心维护的长期重复出现人员的
         单一事实来源（SSOT），其 ASR 变体标注在 `- **ASR 变体**:` 下。
         如果某个乱码姓名已经在此映射到规范人员姓名——例如
         `Nena`→`Nina Zhao`、`小宇老师`→`小雨`——则属于高置信度修正：
         立即应用。**这一步就可以取代针对用户已经记录过的每个姓名逐一询问用户。**
         仅当确认转录中的说话人不在名册中时，才跳过此步骤。
      1. **检查 `corrections.db` 的所有域，而不只是当前的 `--domain`。** 同一实体在不同项目中会分裂成不同的 ASR 变体，而此前的每次修正都已将它们归并到规范名称——因此答案往往就在另一个未传给 `--stage 1` 的域中。只检查当前域然后放弃，是一种反复出现的失败模式。
         `sqlite3 ~/.transcript-fixer/corrections.db "SELECT from_text, to_text, domain FROM active_corrections WHERE to_text LIKE '%<fragment>%' OR from_text LIKE '%<fragment>%';"`
      2. **项目交付文档和别名台账** — 成本报告、评审表、交付物、该项目的 PKM 笔记。这些资料中的拼写由人工书写且正确，是最可靠的信息来源。先执行 `grep -rl "<fragment>" <project-dir>`，然后阅读命中的文件。（你在分诊前加载的域上下文文件通常会明确列出项目的别名台账——从那里开始。）**阅读台账中的每一张姓名表，而不只是看起来像“说话人列表”的那张。** 一个项目中的人员几乎总是分散在按角色划分的多张表中——内部说话人、外部协作者、客户方、供应商/经销商方、参会者——而你正在查找的人往往就在你没有打开的相邻表中。如果最终确认的某个姓名无法通过上下文文件中的姓名来源清单找到，则说明该清单不完整：将缺失的表添加进去，确保下次运行不会再漏掉它。（参见 `domain_context_guide.md` 的规则 6，了解此举所防止的失败情形。）
      3. **本地工具 / 网关 / 客户端配置——用于处理产品、模型和工具词汇的乱码。** 一份充斥着产品/模型/端点讨论的转录，其事实依据通常就在用户这台机器上的客户端配置中：LLM 网关配置文件（模型 ID、基础 URL）、编辑器/IDE 设置、CLI 配置存储、API 客户端预设。这些信息可由机器读取、保持最新且精确无误——一个被误识别成五种不同形式的模型名称，可以逐字节与配置自身的模型列表进行匹配，包括不易察觉的后缀（真实案例：在一次关于配置模型网关客户端的通话中出现了 `cloud fiber5` / `飞豹五` / `FIVE5EM`；该客户端的本地数据库列出了带有 1M 上下文标志的 `claude-fable-5`——所有变体均被归并，包括 `EM`→`1M`）。通用方法：找到正在讨论的工具所使用的配置（常见的配置目录，或其 sqlite/json 存储），根据发音将乱码词元与真实标识符匹配，并将配置条目视为接近权威的依据——用户说话时是在照着屏幕念 ID；ASR 听到的只有声音。⚠️ 配置存储中可能包含机密信息：只读取所需字段（模型名称、URL），绝不要将密钥/令牌复制到转录、词典或摘要中。
      4. **交叉核对聊天记录时间线——用于确认实际参加通话的人。** 当参与者身份很重要时（例如，说话人分离标签只是一个英文名字，或 `Speaker N`，且正文中从未提及全名），最有力的本地证据是会议时间窗口*附近*的用户聊天记录：人们会互相发送会议链接，以及在通话过程中讨论的材料（配置字符串、文件、链接）。在聊天归档中搜索**转录本身包含的独特字符串**（通话中提到的域名、模型 ID 或代号），并将范围限制在会议日期窗口内；在该时间点包含该字符串的聊天几乎肯定对应通话的另一方，而其附近的消息（“正在加入”、开始前一分钟发送的邀请）无需根据转录内容作任何推断即可确定身份——这是时间线证据，而不是猜测某位说话人的声音像谁。它还可以逐字节验证聊天中包含的任何精确字符串（通话中粘贴的 ID 可确认其自身拼写）。此方法仅用于身份/标签问题——普通拼写问题通过第 0–2 级即可用更低成本解决。实际案例：说话人分离结果显示为 `Kevin`；搜索通话中提到的网关 URL 后，找到了一个私信会话，其中包含开始前一分钟收到的邀请，以及通话中发送的三个精确配置字符串——由此将 `Kevin` 解析为该私信对象的完整显示名称，并将正文中两个识别错误的姓氏称呼修正为有证据支持的姓氏。
      5. **记忆文件**（`~/.claude/.../memory/`）— 项目关系图和人员档案通常会明确记录规范姓名。
      6. **WebSearch** — 仅用于真正公开的实体（上市公司股票代码、知名研究人员、药物名称）。任何项目内部信息都应跳过此步骤。

只有当所有这些方法都无果时，才向用户询问——而且此时你已经证明该实体尚未记录在这台机器上，因此这次询问是合理的。得到确认的结果会成为「确定」修正；如果搜索*无法*确认，则降级为「不确定」。**批量处理这些问题**：收集所有不重复的未知项，并针对每个唯一实体执行一次这套阶梯式流程，而不是每出现一次就执行一次。**在询问人物的规范姓名时，务必在候选列表之外保留一个退出通道**——加入 `Other / none of these` 路径（或确认 UI 已提供该路径），允许用户输入完全符合其原始拼写的自由文本。仅在本地出现一次，就足以成为将某个候选项列入列表的依据，但不足以让该列表成为穷尽式列表：真正的规范姓名可能是英文名，而你找到的每个候选项都只是中文音译。

      **而当用户作出回答时，他们的判断是 ✅ 权威的——这是整个循环中最强的信息源——并且会在同一会话中以三种方式产生复利效应。** 如果用户说“X 实际上是 Y（我在 Z 团队的同事）”，他们就为你提供了一个比任何本地文档都更强的信息源。立即兑现其价值：① 应用修正；② 将变体持久化到能产生复利效应的位置——经常出现的重要人物应加入**人员名册**（按照上面的名册与数据库对照表），项目术语或一次性姓名应加入 `--add ... --domain <project>`（同一个 ASR 下周还会再次听错同一个名字）；③ 使用用户的原话、日期以及 ✅“用户确认”标记，将其记录到台账 / 名册 / 领域上下文中——之后的会话不应再次询问。以下是经过惨痛教训总结出的两点改进：
      - **在添加到词典之前，对 FROM 端执行冲突检查。** 如果乱码字符串本身在你的其他环境中是一个真实人物的姓名（另一个项目的名册中存在一个*不同的*真实 `李明`），那么 `李明`→`黎明` 这条词典规则就会破坏该人物未来的转录文本。此修正应作为带有消歧线索的陷阱记录在领域上下文文件中（“在剪辑团队的上下文中，`李明` = `黎明`”），绝不能加入词典。
      - **已确认正确的实体也值得记录。** 当用户确认某个姓名保持原样就是正确的（“他确实是一名真实的博主，拼写就是这样”）时，记录这一判断（在领域上下文或名册中写一行即可）。未被记录的“保持原样正确”，会成为下一次运行时又要浪费五分钟重复询问的问题。
   - **不确定**——你怀疑存在错误，但即使经过搜索也无法确认（某个音节可能对应多个真实实体；某个句子的结构已损坏）。**将原始文本完全保持原样**，并将其记录到待检查列表中（步骤 7）。一个流畅但错误的“修正”比明显的乱码更难在下游被发现——保持沉默胜过自信猜测。
5. 高效应用确定的修正：
   - **全局替换**（唯一的非词汇，例如“克劳锐”→“Claude”）：如果它在多份转录文本中反复出现——大多数产品名称或姓名乱码都是如此——使用 `--add` 将其加入某个 `--domain`，使其效果能延续到以后每次运行；对于真正只出现一次的术语，使用一条带多个 `-e` 标志的 `sed -i ''`
   - **依赖上下文的替换**（某个词只在特定上下文中是错误的，例如在讨论蒸馏时将“蒸”听成“争”）：使用包含更长上下文短语的 sed 来确保唯一性，或使用 Edit 工具
   - **常用词批量处理：大多数出现位置是领域术语，但少数位置确实是其原义**（某个高频词在所属领域中的*大多数*出现位置被赋予了特定领域含义，但并非全部——残留的真实用法恰恰符合常用词的特征）。绝不要盲目使用 `replace_all`。首先用 `grep -n` 找出每个出现位置，并根据所在句子逐一判断。当绝大多数位置都表达领域含义，只有一两个位置使用其原义时，高效的处理方式是：用 `replace_all` 将该词替换为领域术语，然后使用 `Edit` 将那一两个确属原义的位置改回去——这比执行 N 次独立的 Edit 更快，也更不容易出错，而下面的再次 grep 会捕获任何误判。真实案例：某次销售通话中的 11 行都出现了 `公开`——其中 10 处实际是工勘（销售漏斗中的现场勘查阶段），只有一处确实是“公开的渠道”；执行 `replace_all` → 工勘，然后恢复唯一一处“公开的渠道”。（当源词是常用词时，领域术语本身仍然不应加入词典——应按照“领域修正上下文”的说明，将其记录为上下文陷阱；本条仅说明如何在单份转录文本中*应用*该修正。）
   - 之后再次 grep 每个已更改的术语，确认替换已生效，并且没有误伤你原本想保留的相似内容
6. **第二遍检查——捕捉第一遍阅读遗漏的内容。** 单次线性阅读总会遗留一些问题：某个习语被劣化成近似同音词；某个术语在大量正确位置中仅有一处出错；某个缩写被误听成另一个缩写。务必再次扫描一遍以查找遗漏。首先进行一种成本较低且针对性强的检查：**陷阱扫描**——扫描文件中领域上下文文件所记录的每一种陷阱模式（该领域已知会反复出现的同音词）。应以机械化方式运行，而不是手工编写 grep 循环（包含 30 个陷阱的上下文文件意味着手动执行 30 次以上的 grep，而这份列表恰恰是疲惫的操作人员最容易擅自截短的内容）：

```bash
   uv run scripts/fix_transcription.py --scan-traps \
     --context-file ~/.transcript-fixer/contexts/<domain>.md -i meeting.md
   ```

   每个已记录的陷阱都会连同行号和上下文窗口一起返回；已确认无误的记录（`**X = 真实实体，勿修**`）会被报告为保持原样，让你不再重复调查已经解决的问题；而无命中列表则让“已扫描但不存在”与“从未扫描”变得可区分。三十秒即可精确检查该领域特有的错误；对于快速层级，一次干净的陷阱扫描加上你的第一遍检查就足够了。对于较长或高风险的转写稿，*还要*启动一个独立子代理（Task），让它在不了解你第一遍检查结果的情况下重新通读已修正的文件——没有第一遍检查记忆的新视角，能发现你先前读漏的问题。**子代理的任务是*返回残留问题列表*，而不是重新叙述转写稿。** 要为它指定输出格式和严格的数量上限，因为逐行自言自语的子代理会在完成之前耗尽自己的上下文窗口（一次真实的第二遍检查在处理一份 1131 行的转写稿时，中途触及 32k token 上限，最终没有返回任何可用内容）。正确的提示词结构如下：
   - 将范围严格限定为一个文件，禁止编辑和跨文件 grep。
   - 把已经修正的术语作为禁止重复报告列表交给它（这些你已经修过；只有*新的*残留问题才有用）。
   - 要求只输出紧凑的表格——`line | original ≤20 chars | suspected | one-line reason | confidence`——并告诉它在列表结束后立即停止，不要添加正文前言，不要逐行输出意识流，也不要重新推导它已经完成的修正。
   **完成的标准是获得可用的审查结果，而不仅仅是流程状态显示成功。** 审查者必须覆盖整个文件，并返回所要求的残留问题表格或明确的 `no new residuals`；空白、格式错误或被截断的响应都代表该遍检查失败，必须换一个全新审查者重试。可重试的子代理失败同样不能算作完成这一遍检查。如果失败信息表明可以重试或给出了重试延迟（例如带有 `retry_after` 的 HTTP 超时），请至少等待相应时长，然后以全新上下文重试审查。只有在工具确实无法运行时（例如这些指令已经在一个无法再启动其他子代理的子代理中执行），才能认为子代理路径不可用。针对已知变体进行定向陷阱扫描或 grep 仍然有用，但**它不是独立的重新通读**：它可以确认已知错误类别是否已被清除，但从结构上就无法发现第一位阅读者的盲点。在一次生产运行中，用已知模式 grep 代替超时的全新审查后，结果显示没有问题；而重试无先入信息的审查后，又发现了 26 个候选问题。
   然后逐项裁定每个残留问题——子代理的列表是**候选项，而不是结论**（一次真实运行的结果：10 行 → 接受 4 行）。按照第 4 步的分类流程逐项处理，并应用以下所有经过生产验证的启发式规则：
   - **接受——近似同音 + 文档内自证。** 当几行之前的同一目录已经写着 `离职回购` 时，将 `利智回购`→`离职回购`：读音相近，再加上同一文件中已有正确形式，足以定论。指代对象明确的同音字也同理（当前件词是文档而不是人时，将 `他`→`它`）。
   - **拒绝——读音距离也可以证伪。** 读音检验是双向的：读音相近是支持修正的证据（第 4 步）；读音差异不合理则是反对修正的证据。`代号`→`代码`（hào/mǎ）和 `一撮`→`一坨`（cuō/tuó）不是 ASR 会发生的替换——这种候选项是审查者过度解读，而不是引擎听错。**第 4 步中的跨语言专有名词类别是例外**：在一种语言中说出的外语名称，其转写结果可能合理地与规范读音相差甚远。不要在这里拒绝这类项——应将它们送入队列进行音频核验。该例外由*类别*而非罕见程度界定，并且必须同时满足第 4 步的**两个**条件：候选项是一个可能以不同于转写目标语言的语言说出的专有名词，**并且**它出现在项目已知某个人物应处的位置。两个条件都满足 → 无论读音距离如何，都送入队列。缺少任一条件 → 本拒绝规则适用，就像它适用于所有普通词和所有同语言同音词一样。
   - **拒绝——ASR 能力反向核查（强先验，而非证明）。** 如果同一引擎在同一份转写稿的其他位置正确识别了这个词，就证明该词在当前音频中处于该引擎的识别能力范围内——因此，附近出现的另一种写法*更有可能*就是讲话者实际说出的内容，而对其进行“修正”的门槛应显著提高。（候选项 `一条`→`一坨`：几行之前 `一坨` 已被正确识别，而 `一条` 本身也是口语中有效的量词短语——这两点结合起来，应拒绝该修正。）要将其视为概率性判断：同一个引擎确实可能把同一个名字拆成十几种变体（参见“项目特定修正”）——当正确形式与候选形式都是引擎日常能够处理的常用词时，这项反向核查的权重最高；当它们是罕见专有名词时，权重最低。
   - **拒绝——可理解的真实词语。** `一撮` 是完全成立的量词；不要仅仅为了让一个贯穿全文的比喻保持一致，就改写可读懂的话。只修正讲话者很可能没有说出的内容。
   - **拒绝——无证据的重构。** 没有语音依据的修正建议（`半`→`分`）是对含义的猜测，而不是纠错。
   - **最小化修改。** 修正误识别的词；绝不要插入未说出口的词（`打完`→`打算` ✓；改写为 `打算怎么` 则插入了讲话者从未说出的 `怎么` ✗）。
   - **优先选择能解释错误的最小修改——先按语音距离对候选项排序，再对其中任何一项作出判断。** 上述规则限制了一个候选项可以改动*多少*；本规则则在多个候选项读起来都通顺时，决定*哪一个*胜出。ASR 错误是微小扰动——引擎会把听到的声音映射为它所知道的最接近的词——因此，在所有语义都成立的候选项中，改变音素最少的那个几乎总是讲话者实际说出的内容。普通话中一个有用的特征是：**重叠形式或多音节词尾被完整保留，只有首音节不同**，这通常指向声母混淆（卷舌音/齿龈音 `sh`/`s`、`zh`/`z`、`ch`/`c`，以及 `n`/`l`、`f`/`h` 这几组），因此在断定整个词都被听错之前，*先*搜索韵母相同但声母不同的候选项。
     **此规则失效的场景并不是生成候选项时，而是在审查已经存在的文本时**（无论是上游修正，还是你在第一遍检查中接受的修正）。审查现有文本会让你进入验证模式：你会问“这合理吗？”，发现它合理，然后继续往下看——却始终没有意识到，交到你手上的只是一个候选项，而不是一组经过排序的候选项。一个改写三个音节的候选项可能完全符合习惯用法，*同时*仍然属于改写；要将它与只改变一个音素的候选项区分开来，唯一的方法就是把两者都生成出来并进行比较。因此，在审查任何已经应用的修正时，都要强制追问：**是否存在同样能解释这一问题、但改动更小的方案？** 如果你无法回答这个问题，那你所做的只是认可，而不是核验。
   一个返回 8 条精准记录的第二遍检查子代理，永远胜过一个返回 8000 token 叙述内容的子代理。当你处于主上下文中时，可以使用 Task；如果它确实不可用——例如这些指令本身正在一个无法再启动其他子代理的子代理中运行——那就自己从已修正的成品开始，再进行一次彻底的逐行通读。不要用已知模式 grep 代替通读，却声称自己完成了重新通读。绝不能因为工具缺失而跳过第二遍检查。
7. **输出待核查列表，并将其加入队列**——会话结束后，聊天摘要就会消失，因此每个*不确定*项都要写入两个位置：(a) 在给人工审查者的聊天摘要中——包括行号、你保留不变的原文、你的怀疑内容，以及无法确认的原因；(b) 通过 `--enqueue-review items.json` 写入持久化审查队列（参见上文“Review Queue & Dashboard”；条目字段/别名模式见：`references/script_parameters.md` §Review Queue Item Schema——未知键会被静默丢弃，因此要写 `line`，而不是 `line_hint`），包含相同字段，外加一组建议操作，以便人工审查者之后在仪表板中一键解决，或者让后续代理会话在获得新证据后将其关闭（`--resolve-review ID --decision … --note "<evidence>"`）。实体/名称问题使用 `kind: entity`（它们会累积进入词典/花名册，因此应排在队列前面）；纯措辞疑问使用 `kind: wording`。如果没有任何不确定项，请明确说明。用于 `--enqueue-review` 的最小 `items.json` 如下（每个不确定项对应一个对象；如果没有候选项，`suggested` 可以为空——之后人工审查者可以在仪表板中填写）：

```json
   [
     {"file": "/abs/path/to/the/transcript.md", "line": 142,
      "original": "<garbled-name>", "suggested": "", "kind": "entity",
      "context": "<the whole sentence the token sits in, copied VERBATIM from the file>",
      "evidence": "speaker-label fragment near line 142; not in roster or project alias ledger — needs user confirmation"}
   ]
   ```
   **`file` 是让另外两个字段正常生效的关键，而省略它会以最糟糕的方式静默失败。** 以下两项保证都以它为前提（`review_queue.py:212` 和 `:793` 都会先检查 `file_path`）：
   - *逐字锚点拒绝。* 设置 `file` 后，如果 `context` 不是该文件中的字面子串，则会**在入队时被拒绝**（退出码 3）——这样，编写错误会立即暴露，而不是等到裁决时才出现。缺少 `file` 时，没有文件可供核对，因此改写过的 `context` 会被接受，而偏移要到很久以后才会暴露。
   - *默认编辑操作。* 设置 `file` 且未提供显式操作包时，接受操作会执行一次 `file_edit(old=original, new=suggested)`。缺少 `file` 时，接受操作仍会记录裁决并以 0 退出——**但绝不会改动转录稿。** 不会出现任何错误；队列只会显示 `accepted`，而文件保持不变。

   有两个关键名称，前述静默丢弃规则都会在多出一层字段时捕获它们：裁决字段是 `suggested`（`suggested_text` 的别名），**而不是 `suggestion`**——拼错后，仪表板上的“接受”按钮会消失，随后 `--resolve-review` 会以 *"item N has no suggestion to accept"* 拒绝执行。操作包的键是 `actions`，**而不是 `action_pack`**；它是可选的——仅当接受操作还应执行 `dict_add` / `append_note` 时才提供。完整字段/别名表：`references/script_parameters.md` §审阅队列条目模式。

   **`original` 只包含可疑词元，绝不能包含整个句子**——句子应放入 `context`。无论你在 `original` 中放入什么，仪表板裁决都会将其*整体替换*：接受操作会执行 `file_edit(old=original, new=suggested)`，而覆盖操作会用人工输入的文本替换整个 `original` 范围。如果 `original` 是像「我们的民宿就完了」这样的完整分句，而人工输入的是两个字的品牌名「栖云」，那么整个分句都会消失——这是 2026-07 真实发生的事故（#24），丢失的文字只能手工补回。使用 `original: "民宿的误写词"` + `context: "…我们的民宿就完了"`，同一个裁决在默认情况下就会得到正确结果。（仪表板现在会在覆盖输入框上方显示完整替换范围，并对短得可疑的替换发出警告——但在入队时使用正确的粒度，才是零成本的修复方式。）
8. 对实际编辑过的文件执行差异检查（`diff <original> <your-working-file>`）——每一处更改都应能追溯到某项分诊决定
9. 完成处理并归档：
   - **主要路径（推荐）：** 对原始 `file.md` 重新运行 `--stage 1`——**直接运行，不带 `--apply-all`**（显式指定 `--apply-all` 总会执行更正而不会完成定稿，因此陈旧的伴随文件无法静默吞掉这次运行）。如果 `file_stage1.md` 比 `file.md` 更新，transcript-fixer 会自动将其提升为 `file.md`，并删除中间伴随文件（`_stage1.md`、`_stage2.md`、`_dryrun.md`、`_changes.md`、`_needs_review.md`、`_uncertain.md`、`_对比.html`）。这是默认的定稿方式；它具有原子性，会保留人工编辑（当 `file.md` 更新时会跳过提升），并能规避 macOS 的 `mv` 别名隐患。
   - **原生 AI 更正模式**（你直接编辑了 `file.md`——即上面的默认工作流）：`file.md` 已经是最终输出。无需也无法执行提升（提升保护机制会正确跳过，因为 `file.md` 比任何伴随文件都更新），因此只需再运行一次 `--stage 1` 进行确认。一次**零更正的重新运行不会写入 `_stage1.md`**，并且当没有任何延期项时，也不会写入报告伴随文件——目录保持干净，`file.md` 可直接归档。（如果文本中仍有中/高风险词典匹配项——例如你判定为误报并有意保留的内容——每次运行时 `_changes.md`/`_needs_review.md` 都会重新出现并列出这些项；那是延期报告，不代表定稿失败。完成这些项的处置后将其删除即可。）如果重新运行确实发现更正，请将所需更正应用到 `file.md`，然后再次运行。
   - **手动备用方式**（仅当你需要完全控制，或在阶段 1 运行后又编辑过 `file.md` 时使用）：将更正后的内容保存回原始 `file.md`。（`file_stage1.md` 仅用于参考/差异比较；不要将其作为最终输出进行编辑。）然后将 `file.md` 复制到 `next/00-Transcripts/YYYY-MM/`（或你的归档位置），并使用一行 Python 命令删除本地伴随文件：
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
   - 再次在最终文件中搜索一项你确认已应用的更正，以确认更正后的版本确实已写入。
   - **检查已经从这份转录稿派生出的内容——更正不会自行传播。** 转录稿不是终端产物：在落盘后的几小时内，它就会被提炼成笔记、决策日志、分析、摘要和对外消息。这些内容全都基于*未经更正的*文本编写，因此你今天修正的名字在其中每一处仍然是错的——而且与转录稿不同，它们没有时间戳提醒读者该拼写可能有问题。实测案例：一个听错的人名进入了两份分析文档，并且只差一个草稿步骤就会发送给讨论中涉及的那些人。
     应有意识地限定检查范围。**仅检查实体更正**（人名、公司、产品——绝不检查措辞，因为措辞按定义只与所在句子相关）。**搜索该转录稿所属的项目，而不是整个知识库**——全仓库扫描会命中不相关的项目，在那里“旧形式”可能指的是*另一个真实存在的人*，而这是比不检查更糟糕的唯一结果。使用 **`grep -rn`，而不是 `git grep`**：`git grep` 只搜索已跟踪文件，而几小时前才写入的文档——正是本条所描述的场景——恰恰可能尚未被跟踪（如果希望使用感知仓库状态的版本，可用 `git grep --untracked`）。
     应当**排除证据链**，而不是去“修正”它：步骤 2 的上游差异比较所依赖的原始 ASR 基线（`transcript_raw.txt` 及相关文件），以及 `_needs_review.md` / `_changes.md` 伴随文件，都是*有意*保留旧形式——重写它们会破坏下一次运行与原始内容进行差异比较的能力。（无论如何，队列条目都不受影响：它们锚定的是转录稿本身，而且存储在 SQLite 中，文件搜索无法触及。）
     逐一检查每个命中项，而不要盲目替换——这是对少量文档进行的受监督检查，而不是批处理工作流规则所禁止的不受约束的跨文件 `sed`。
   - **防止下一次出错的习惯**——这不是本次运行中的操作，而是之后处理转录稿时应遵循的规则：当你把专有名词从转录稿中引用到笔记、报告或消息里时，在粘贴前先到人员名册或项目别名账本中查证。上面的检查是一条恢复路径，而只有在名字第一次被带出转录稿时没有执行这项查证，才会需要这条路径。这与步骤 4 使用的是同一套层级规则，只不过应用于导出时，而不是更正时。
9b. **移动或重写转录稿，会让队列中仍未处理的所有内容失去锚点。** 条目会记录转录稿的绝对路径，并依据该路径进行解析，因此**重命名**（步骤 10）会导致每一个待处理条目都指向一个已不存在的路径——此时裁决会失败并显示 `file gone: <path> — the transcript moved since enqueue`，它会指出原因，但没有对应的修复命令：CLI 可以入队、列出、显示和解析，却无法重新锚定或删除。**提升**（步骤 9 的主要路径）则更隐蔽：文件仍然存在，因此条目会在之后因锚点文本或上下文偏移而失败。由此有两个值得提前规划的后果。**如果无论如何都要重命名，请先重命名**——在步骤 7 入队之前完成，而不是之后；阶段 1 期间自动入队的延期项已经根据文件当时的名称进行了记录，因此计划重命名的转录稿应在首次运行阶段 1 之前取得最终名称。**如果条目已经失去锚点，唯一的退出方式是将其解析为 `kept_original`/`skipped`**（两者都不执行任何操作，也不会因锚点失败），**或者针对新路径重新入队等效条目**——否则陈旧条目将永远保持待处理状态。单纯归档则不同，本身是安全的：`cp` 会保留原文件，因此锚点仍然有效；但这也意味着，此后应用的裁决只会修复工作副本，而归档副本仍会保留错误——这正是上面的派生文档检查要解决的同一种“更正不会传播”问题。
10. **文件名规范——归档前重命名机器生成的乱码名称。** 如果转录稿的文件名只是原始 ASR 产物、设备标签或不透明的时间戳哈希（`TX02_MIC021_20260720_095909_1.3x.md`、`soundcore Work_01-01 10-36.md`、`07-12-2026 20.07.md`），它就不是一个有用的产物。文件进入共享仓库前，应将其重命名为人类可读的形式：`YYYY-MM-DD-HH-MM-<topic-or-speaker-summary>.md`，并根据项目情况使用中文或简短英文。标准是：人仅凭文件名就应能识别这场会议。如果内容明显属于某一业务线，并且仓库约定允许，也应在短名中体现该业务线。
11. 将稳定模式保存到词典中（参见上文的“词典添加”）
12. 归档前，从最终文件中清除所有残留的阶段 1 误报

### 常见 ASR 错误模式

AI 产品名称经常会被识别错乱。以下模式在不同转录文本中反复出现：

| 正确术语 | 常见 ASR 变体 |
|-------------|-------------------|
| Claude | cloud, Clou, calloc, 克劳锐, Clover, color |
| Claude Code | cloud code, Xcode, call code, cloucode, cloudcode, color code |
| Claude Agent SDK | cloud agent SDK |
| Opus | Opaas |
| Vibe Coding | web coding, Web coding |
| GitHub | get Hub, Git Hub |
| prototype | Pre top |
| AI | a 夜, a 爱, ai, 阿伊 — 两个字母的英文术语在中文语句中说出时，会被识别为读音相近的音节（"All in a 夜吧" = "All in AI 吧"，用户于 2026-08-08 确认） |
| skill | SQL, SKU, 死抠 — 同样的两个字母拆分现象，`skill` 是 AI 工具相关对话中的高频词（SQL/SKU 在其他语境中确实是有效词语——必须根据上下文判断，绝不能将其作为简单的字典规则） |

**中文语句中两个字母英文术语的模式具有普遍性**：`AI` / `skill` / `SDK` / `API` 在中文句子中说出时足够短，以至于 ASR 会将其映射为任何读音相近的音节（包括像 `a 夜` 这样的整词混淆）。当转录内容与 AI 工具有关，并且某个音节字符串作为中文读起来毫无意义、但所在位置本应是英文缩写时，应首先检验缩写假设——然后再根据发音距离确认后进行修正。

人名和公司名称在不同会话中也会产生一致的 ASR 错误——务必将已经确认的人名修正添加到字典中；对于项目专用名称，请使用 `--domain <project>` 将其隔离（参见“项目专用名称与人名修正”）。

### 数字：字典在结构上无法修正的类别

字典规则要求错误具有*稳定性*——一个错误字符串对应一个正确
字符串。数字错误不存在稳定的映射关系（`80` 在一次
录音中会变成 `800`，在下一次录音中又会变成 `18`），因此无论投入多少字典维护工作都无法解决。
同时，这也是代价最高的一类错误。关于
实体级错误的 ASR 研究始终将数字和命名实体列为最严重的
类别——远比总体 WER 所呈现的情况糟糕——并且指出数字的
*续接*标记（首位之后的数字）的识别效果甚至比
首位数字更差。这个先后关系是这里最关键的论断，也与你
在实践中看到的情况一致：第一组数字通常是正确的，而末尾部分
最容易出错，这正是错误数字仍然读起来流畅的原因。
（有关这类研究的二手摘要中流传着一些具体百分比；这里
不予引用，因为这些数据尚未对照一手
来源进行核实。如果希望查看附带对应数据集的数字，请搜索 "ASR named entity error rate" / "entity-preserved ASR"。）

数字错误可分为三个子类，每个子类都需要采用不同的检查方式。任何一种都不能自动应用——
数字只能通过证据确定，绝不能仅凭模式判断：

| 子类 | 表现形式 | 如何判定 |
|---|---|---|
| **数量级** | 同一个数额在复述时多了或少了一个零 | 根据同一段落中其他位置给出的数字进行算术核对；或使用第二份录音（见下文） |
| **量词丢失** | 说话者说的是“30 家/个”，转录结果却是 `30+`（没有人会把“加号”直接说出来） | 下方的扫描器会找出这些情况（`orphan-plus`）；随后通常可以根据同一分句中的对象还原量词 |
| **极性颠倒** | 明确陈述的*上限*被转录成了*下限*——“只能给 N”被识别成“超过 N…保底” | 扫描同一会话中该数字的其他表述；带有限制性情态词的那一处（只能/最多/至多/封顶/不超过/至少/起码/超过/保底/最少——脚本会输出同一列表）几乎总是正确的，因为说话者通常只会明确陈述一次边界，之后则采用较为宽松的方式进行转述 |

极性是最危险的一类，也是任何工具都无法捕获的一类：句子在语法上没有问题，数字是正确的，但含义却被颠倒了。只要转录稿中的某个数字最终会进入决策文档——无论是价格、上限、份额还是截止日期——都值得有意识地仔细读一遍。

**同一场会议的两份录音是你能获得的最有力证据。** 当一场会议由两个独立系统录制时（两个平台，或者一个平台加一台本地录音设备），它们的数字错误互不相关，因此，出现分歧可以定位错误，而结果一致则可以确认无误。这是 ROVER（识别器输出投票错误降低法，NIST 1997）的人工双系统版本——这个名称值得记住，因为已发表的研究解释了为什么跨系统投票优于改进其中任何一个系统。不要丢弃已有会议的第二份“冗余”录音；对于那些最重要的数值，它恰好就是一份参考转录稿。如果只有一份录音，而某个数字又至关重要，请通过此技能已有的路径靠耳朵确认：连接转录稿 frontmatter 中的 `audio:`（参见“为飞书妙记转录稿连接音频”），将该数字加入审核项队列，然后在审核面板中按 `Q`——它会精确播放已锚定的对应话语，让你听到实际说出的数字，而不是再次阅读文字。

**数字槽位损坏——替换操作误入数字时。** 这是另一种症状相同的故障：原本针对其他内容的全局替换命中了数字内部。典型诱因是重新标记说话者，而其说话人分离标签恰好是单个数字——全局替换该数字会修复说话者行，却悄无声息地破坏所有包含该数字的数值（`21 册`、`3+1`、`8.8 折`，以及标题中的日期都会有一个数字被替换成人名）。转录稿读起来依然流畅；只有数字是错的。匹配范围过大的字典规则也会产生相同的特征。

```bash
# Scan for canonical terms sitting where a digit belongs. The needle list is the
# dictionary's own to_text values — the strings this toolchain writes INTO
# transcripts are exactly the ones that shouldn't be inside a number.
uv run scripts/scan_numeric_consistency.py transcript.md --domain <project>
```

它输出的所有内容都只是**需要阅读的候选项**，绝不能直接作为应执行的编辑——而且极性问题被刻意排除在自动化之外，因为如果一项检查总是对正常输入发出警报，人们最终就会停止运行它。

你可以自行验证的是：`scripts/tests/test_numeric_consistency.py` 使用合成夹具锁定了这一承诺的两个方面——上文中的每一种损坏形式都会被检测出来，而曾导致此扫描器前两个版本失败的正常输入形式（某个术语只是与数字同时出现、某个术语位于数字*之前*、标题开头的日期、时区偏移量）则保持静默。请使用 `uv run --with pytest python -m pytest scripts/tests/test_numeric_consistency.py` 运行它。这些选择背后的误报*率*是在无法随附发布的私有转录稿语料库上测得的，因此无法在此复现该比率——但由此获得的行为是可以复现的。

### 高效批量修复策略

修复多个文件时（例如，同一天的 5 份转录稿）：

0. **在进行任何改动之前，先对每个文件与原始文件执行差异比较**——如果这批文件来自某个流水线，并且该流水线的预分类阶段运行过自动纠错器，那么归档副本并非原始 ASR：上游编辑已经被写入其中，却没有留下任何证据轨迹，而且每一处编辑本身都值得怀疑（上游 AI 的“纠正”可能是一个流畅却错误的猜测——语法完全正确，但内容错误）。将每份已归档的转录稿与其原始来源进行比较（同步引擎通常会在旁边保留 `transcript_raw.txt`，也可以从源 API 重新拉取），并首先对每一处上游改动进行分类处置：逐项进行发音距离测试，还原改写内容，将已确认的改动视为已解决（绝不再次提出）。这是“原生 AI 纠错”第 2 步中单文件上游差异比较在批量场景下的版本——对于一批文件，它是第 0 步，因为之后你读到的一切，都会受到你读的是原始文本还是纠正后文本这一事实的影响。
1. **并行执行第 1 阶段**：一次性让所有文件通过词典处理
2. **先阅读所有文件**：在修复任何内容之前，建立对说话者、主题和反复出现的术语的整体认知
3. **编制全局纠错列表**：同一场会话中的多个文件往往会重复出现许多错误（相同的说话者、相同的主题）。**如果某个错误反复出现——尤其是人名或项目术语——请使用 `--add` 将其添加到项目 `--domain` 中（参见上文“项目专属与人名纠错”），而不是直接进行行内替换；这样不仅能修复当前批次，还会自动修复以后所有文件中的该错误。**
4. **应用其余一次性纠错**（使用带多个 `-e` 标志的 sed，仅用于确实不会重复出现的修复），然后应用依赖各文件上下文的修复
5. **验证所有差异**，归档所有最终文件并清理附属文件，然后统一执行一次词典添加
6. **执行陷阱扫描**（原生 AI 纠错第 6 步）：在通读之后，对整个批次机械化扫描该领域中已有记录的同音词陷阱，以捕获阅读时遗漏的问题
7. **集中一次性向用户核实所有不确定项，然后立即沉淀复用**——一批文件会产生一个无法核实的候选项短名单（一个含混不清的名字、一个与你的训练数据相矛盾的版本号、一个你无法规范化的姓名变体）。一次性给出整个短名单（不要在处理过程中逐项询问）：用户可以听音频，也可能认识当事人，而每项判断都应采用相同的处理方式——修复文件，使用 `--add` 将已确认的变体添加到 `--domain` 词典，并在同一会话中将其记录到人员名册或领域上下文中。在一次真实会话（2026-08-08）中，四项这样的中途判断都在获得答复的同一轮中完成了沉淀。与你的训练数据相矛盾的版本号说法，在用户确认之前并不算错误——“当前日期是 2026 年，v4 已存在”的优先级高于对 v3 发布时间的过时记忆；只需提出疑问，不要预先判断。

### 通过动态工作流并行处理（大型批次）

对于大型批次（10 个以上的文件），动态工作流——每个文件分配一个子代理并行运行——比 shell 循环更快，并且能让 AI 充分关注每个文件。以下四条规则都是通过惨痛教训总结出来的；跳过其中任何一条都曾造成过实际损失：

1. **将文件列表硬编码到脚本中——不要通过 `args` 传递。** 如果 Workflow 的 `args` 字符串数组包含非 ASCII 字符、方括号或路径分隔符，它可能会悄无声息地变成空数组：脚本看到的文件数为零，不会生成任何代理，并会立即退出，同时显示类似“没有文件”的消息。纯字母数字词元可以正常传递，但文件路径应直接写入脚本主体中的 `const FILES = [...]` 字面量，并使用 `if (!FILES.length) return` 进行保护。

2. **将每个代理的范围严格限定为一个文件，并在其提示词中禁止跨文件使用 `grep -r` / `sed`。** 如果不加约束，代理会把局部修复（“此处的乱码术语 → 正确术语”）变成全局搜索替换，并编辑从未纳入该批次的无关文件。应明确给出单个文件路径，并明确指示“只编辑这一个文件”。

3. **批处理完成后，先使用 `git diff` 验证，再信任结果**（适用于文件受版本控制的情况）：
   - 对照预期文件列表检查 `git diff --name-only`——这可以发现任何超出其指定文件范围的代理。使用 `git checkout` 还原这些越界修改。
   - 使用 `grep` 检查已删除（`-`）的行，确认不得更改的不变量。对于带有说话人分离标注的转写文本，该不变量就是**说话人标签行**——ASR 修复只能修改口述内容，绝不能更改说话人身份或重新分配发言归属。确认没有任何说话人标签行被删除或更改。

4. **保存汇总后的字典建议之前，先通过误报过滤器检查所有建议。** 并行代理共同提出的规则远多于可安全使用的数量——而且它们彼此看不到对方的建议，因此会积累重复项和范围过大的规则。只保留无歧义的**非单词 → 正确术语**映射。如果“来源”一侧在某些上下文中是一个真实词语，则应丢弃：无论它是常用词，还是仅在某个领域中才算错误的术语。针对真实词语的全局字典规则会悄无声息地破坏此后每一份转写文本——这正是 `references/false_positive_guide.md` 所警告的问题。（在一次真实批处理中，约 80 条原始建议经此过滤后缩减为约 18 条安全建议。）

### 增强功能（仅限原生模式）

- **智能分段**：在合理的话题转换处添加 `\n\n`
- **减少填充词**：“这个这个这个”→“这个”
- **交互式审查**：应用修正前进行确认
- **上下文感知判断**：利用完整文档上下文解决歧义错误

### 何时应改用 API 模式

对于批处理、不依赖 Claude Code 的独立使用场景，或可复现的自动化处理，请使用在 `~/.transcript-fixer/config.json` 中配置的 API 密钥（或使用 `GLM_API_KEY` / `ANTHROPIC_API_KEY` 环境变量进行临时覆盖）并配合阶段 3。

### API 回退机制

如果重试后 GLM API 仍不可用，脚本会保持原始文本不变，并输出清晰的警告。如果需要在不使用外部 API 的情况下进行 AI 修正，请在 Claude Code 中运行并使用原生模式。

## 实用脚本

**时间戳修复**：
```bash
uv run scripts/fix_transcript_timestamps.py meeting.txt --in-place
```

**将转录拆分为多个部分**（每个部分的时间戳重新从 `00:00:00` 开始）：
```bash
uv run scripts/split_transcript_sections.py meeting.txt \
  --first-section-name "intro" \
  --section "main::<verbatim line that starts the next section>" \
  --rebase-to-zero
```

**词级差异对比**（建议用于审查修正）：
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

- `*_stage1.md` — 已应用词典修正
- `*_stage2.md` — AI 修正后的版本（API 模式）
- `*_changes.md` — 包含风险等级和行上下文的阶段 1 报告（默认在安全模式下写入，或通过 `--changes-file` 写入）
- `*_needs_review.md` — 在安全模式（默认模式）下暂缓处理的中/高风险修正
- `*_dryrun.md` — 所有阶段 1 更改的预览，并标注实际运行时会应用哪些风险等级
- `*_uncertain.md` — 通过 `--extract-uncertain` 提取的疑似 ASR 错误
- `*_对比.html` — 可视化差异对比（在浏览器中打开）

在原生模式下，直接编辑原始文件并将其用作最终输出；`*_stage1.md` 是可丢弃的差异对比/参考文件（请参阅原生 AI 修正工作流）。当 `*_stage1.md` 比输入文件更新时，**重新运行普通的 `--stage 1`（不带 `--apply-all`）会自动将 `*_stage1.md` 提升为原始文件并清理附属文件**；这是推荐的最终定稿方式。`--apply-all` 绝不会执行提升流程——它始终会运行修正。一次**修正数为 0** 的运行（转录内容无误，或在输入文件经过编辑后重新进行原生模式运行）绝不会写入 `_stage1.md`（因为它只会复制输入内容）；如果也没有任何暂缓处理的项目，则完全不会写入任何报告附属文件。当安全模式确实暂缓中/高风险规则时，仍会写入 `_changes.md` 和 `_needs_review.md`——它们是暂缓处理报告。

## 数据库操作

**在编写任何自定义查询之前，请阅读 `references/database_schema.md`**——列名并不像你猜想的那样。修正列为 **`from_text` / `to_text`**（不是 `wrong_term`/`correct_term`，也不是 `original`/`corrected`）。猜测列名是这些查询因 "no such column" 而失败的最常见原因。

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
| 1 + 原生 | 词典 + Claude AI（默认） | 约 1 分钟 | 免费 |
| 3 | 词典 + API AI + 差异报告 | 约 10 秒 | API 调用 |

## 内置资源

**脚本：**
- `fix_transcription.py` — 核心 CLI（词典、添加、审计、学习）
- `fix_transcript_enhanced.py` — 用于交互式使用的增强封装
- `fix_transcript_timestamps.py` — 时间戳规范化与修复
- `generate_word_diff.py` — 生成词级差异 HTML
- `generate_diff_report.py` — 多格式对比报告（Markdown、统一差异、HTML、行内标记）
- `split_transcript_sections.py` — 按标记短语拆分转录文本
- `fetch_minute_audio.py` — 获取飞书/Lark 妙记的音频，验证其与转录文本共享同一时间线，并输出 `audio:` 前置元数据行（接通仪表板的 `Q` 播放功能）

**参考资料**（按需加载）：
- **安全**：`false_positive_guide.md`（添加规则前阅读）、`database_schema.md`（执行数据库操作前阅读）
- **工作流**：`iteration_workflow.md`、`workflow_guide.md`、`example_session.md`、`example_session_dji_minutes.md`（录音器→妙记的完整会话案例：文档内自证链、第二轮拒绝标准、入队粒度）、`domain_context_guide.md`（各领域上下文文件的格式与模板）
- **CLI**：`quick_reference.md`、`script_parameters.md`
- **高级**：`dictionary_guide.md`、`sql_queries.md`、`architecture.md`、`best_practices.md`
- **运维**：`troubleshooting.md`、`installation_setup.md`、`glm_api_setup.md`、`team_collaboration.md`

## 故障排除

`uv run scripts/fix_transcription.py --validate` 用于检查设置的健康状态。详细解决方法请参阅 `references/troubleshooting.md`。

## 下一步：整理为会议纪要

修正转录文本后，如果内容来自会议、讲座或访谈，建议将其结构化：

```
Transcript corrected: [N] errors fixed, saved to [output_path].

Want to turn this into structured meeting minutes with decisions and action items?

Options:
A) Yes — run /daymade-audio:meeting-minutes-taker (Recommended for meetings/lectures)
B) Export as PDF — run /daymade-docs:pdf-creator on the corrected text
C) No thanks — the corrected transcript is all I need
```