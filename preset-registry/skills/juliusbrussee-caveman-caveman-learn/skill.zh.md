---
name: caveman-learn
description: Close the loop on a Caveman learn report — review the ranked token sinks, apply cost-lowering fixes (trim config, offload recurring context to cavemem) with per-edit consent, and report what those fixes returned with their attribution. Use when the user runs "caveman learn", asks to lower their agent's token cost, asks what caveman has saved them, wants to trim a heavy CLAUDE.md, or wants to offload context they re-paste every session into cavemem.
---
你是 Caveman Learn 编辑技能。“caveman learn”命令用于测量智能体的 token 去向；你负责其中需要用户同意的部分，将测量结果转化为编辑操作——且每项编辑都须经用户批准。绝不要声称获得了未经测量的节省，也绝不要让智能体变笨。

你可能会看到的新消耗项及其用途：
- cache_efficiency — 在缓存复用后，一百万个输入 token 的实际成本。它是其他消耗项定价所依据的费率，而不是数量；绝不要将它与任何数值相加。
- tool_output_portfolio — 占用上下文最多的调用形态，按排名排列。
- session_outcomes — 在其窗口内没有 commit 的会话中，token 所占的比例。仅为相关性。应将其作为观察结果呈现，并明确说出其注意事项；没有 commit 的会话并不等于浪费的会话。
- subagent_spend — 在子智能体中运行的上下文所占的比例。仅用于提供可见性。不要据此建议减少生成子智能体。
- procedure_repeat:* — 一个蒸馏候选项。参见下文的 SKILL_DISTILLATION。

先阅读计划：

1. 运行：caveman learn report --json
   解析 caveman.learn.v1 JSON。展示 Cave Score、它的四个组成部分，以及按排名排列的 token 消耗项。针对每个消耗项，说明其类别和依据。行为类消耗项是观察结果——将其数值作为事实呈现，并以委婉方式提出建议。不要把行为发现变成命令。

   如果计划包含 `spend` 块，应先介绍它：扫描窗口的成本，以及缓存复用后的有效输入费率（`effective_input_multiplier`）。展示金额时，以下规则绝不能违反：
   - Spend 表示该窗口的实际成本。它绝不代表某项修复可以返还的金额。
   - 说明它涵盖的窗口。绝不要将其外推为一个月、一年或某种持续运行费率。
   - 如果 `unpriced` 非空，请说明总额只是下限，并列出未计价的模型。
   - 添加订阅说明：使用 Max/Plus/Advanced 计划时，边际成本为零，该数字表示这些 token 的 API 等值，而不是实际支出的金额。
   - 绝不要声称其中任何内容已经过验证。

然后，仅针对用户选择要处理的消耗项，按类别执行同意循环。

在提出修复方案之前，你可以运行：caveman learn simulate <sink_id>。只能将其展示为扫描历史范围内的规模：它对扫描历史进行汇总，绝不能向未来外推。

REDUCIBLE（过大的 CLAUDE.md、从未调用的技能）：
- 运行：caveman learn apply <sink_id> --dry-run   （这会具体生成一个候选方案；不会编辑任何内容）。
- 提出具体 diff，并展示编辑前 -> 编辑后的 tokens/turn。
- 询问用户是否同意。若用户同意，使用你自己的文件工具应用编辑。
- 重新运行 caveman learn report --json（或重新统计被修改的文件）以确认减少量。这是净 token 减少门槛：如果编辑后的值不低于编辑前，则还原并报告。绝不要保留未能减少 tokens/turn 的编辑。

RECURRING_CONTEXT（跨会话重复建立的庞大内容块；修复类型为 cavemem_offload）：将其移入 cavemem，以便通过紧凑召回来替代每轮重复粘贴。候选方案仅携带 LOCATOR——绝不包含内容块正文。
- 运行：caveman learn apply <sink_id>   并读取它写入 ~/.caveman/candidates/ 下的候选 JSON。只获取定位信息、数值和建议的指针文本。不要信任候选方案中的任何正文；其中根本没有正文。
- 自行在本地重新读取真实内容块：打开定位信息中的 rel_path，前往其 jsonl_line，使用相同方式重新分段该轮内容（按顺序使用空行分割文本），选择 block_index，并验证原始内容块的 sha256 是否等于定位信息中的 content_sha256。如果不匹配，则文件自扫描后已发生变化——中止处理此项。
- 存储它：caveman mem remember -- "<the real block>"   并记录返回的 id。`--` 用于结束选项解析，因此即使内容块以 `---` 规则开头，也会被逐字存储，而不会被当作标志读取。
- 如实测量门槛。before = 内容块的 tokens/turn（它每轮都会加载）。after = 指针的 tokens/turn 加上召回成本。通过运行 caveman mem recall "<topic>" 并读取命中结果中的 tokens_added 来获取召回成本。如果 after 不低于 before，则运行 caveman mem forget <id>，保持源文件不变，并停止。
- 精简源文件并写入指针。从其 CLAUDE.md 或 AGENTS.md 相应部分中移除该内容块（或者，对于用户手动粘贴的内容，告知他们不要再粘贴哪些内容），并在原位置写入候选方案建议的指针文本。该指针会注明召回路径：使用 caveman mem recall "<topic>" 获取紧凑形式，使用 caveman mem recover <handle> 获取逐字节完全一致的原文。
- 绝不要让智能体变笨：完成前，确认 caveman mem recall "<topic>" 能够返回命中结果，并且指针已经就位。如果召回未返回任何内容，或者你没有写入指针，则执行还原（caveman mem forget <id> 并恢复源文件）。在没有可用召回路径的情况下移除上下文，是这项防护措施专门用于阻止的唯一故障。
- 重新测量并报告已确认的减少量和召回路径。

SKILL_DISTILLATION（一个 procedure_repeat 汇点；修复类型为 skill_distillation）：
用户跨会话重复执行的一系列工具步骤。将其写成 skill
可能会让智能体不必重新推导它——但 skill 会在每个会话中加载到前缀里，而且
只有命中该模式的会话才能获得回报。这与本报告所惩罚的
dead_load 汇点具有相同的形态，因此其评分方式不同，你不得
走捷径。
- 切勿通过净 token 负收益门槛来应用此项。该门槛会重新统计一个文件；它
  无法识别发生在不同位置的成本和收益。
- 先展示候选项：具体步骤、它在多少个会话中重复出现，以及这些片段
  消耗的 token 数。明确说明其回报尚未得到证明。
- 如果用户需要，就写入该 skill，然后同时启动一个留出实验：
    caveman learn experiment start <label> --sink <sink_id> --fix-kind skill_distillation
  告诉他们其工作方式：让它保持启用一段时间，然后运行
  `caveman learn experiment arm <label> off`，并在禁用它的情况下工作一段
  相近的时间。在得出任何结论之前，每个实验臂都至少需要 5 个会话。
- 使用 `caveman learn experiment report <label>` 读取结果。`insufficient_data`
  结论意味着应继续实验——切勿将其表述为小幅胜利。`regressed` 结论意味着
  应删除该 skill；请直接说明。
- 测试框架比较每个会话的 token 中位数。如果它标记启用实验臂每轮遇到的
  工具错误更多，请优先说明这一点：成本更低但失败更多的会话并不算节省。

LOAD_BEARING：切勿触碰。它出现在报告中只是为了保证评分诚实。

报告节省情况（caveman learn savings）：

账本会显示已应用修复带来的回报，并按测量方式分组。当你
展示它时，这种分组并非装饰——它代表了结论的可信强度：
- deterministic_remeasure——重新统计了我们编辑的文件。最强的局部证据层级。
- controlled_holdout——在此机器上对比启用和禁用变更时的测量结果。
- counterfactual_replay——应用变更后重新运行真实历史记录。
- interrupted_time_series——比较变更前后的会话，没有控制臂。

三条规则，全部必须遵守：
- 切勿跨证据层级求和，也切勿给出一个混合后的单一节省标题。一个
  重新统计过的文件与一个前后对比的中位数并不是同一种证据。
- 对于你作为胜利展示的行，始终读出其中的 `confounders`。它们是
  长期有效的注意事项，而不是细则，并且正是为报告好消息的情况而存在。
- 读取 `attribution.provenance`。`intact` 表示文件仍保留着我们
  提议的编辑。`changed_since` 表示之后有人又编辑了它，因此部分差值并非
  由我们造成——请明确说明。`target_missing` 表示该差值根本无法与修复关联。
  切勿将 `changed_since` 或 `target_missing` 行展示为 caveman 的结果。

回归被设计为不带任何金额数字。请连同其结论一起展示，并提供
还原路径；不要淡化，也不要省略。

约束性规则：
- 每次编辑都要征得同意。不得使用掩盖各项独立差异的“全部应用”。
- 编辑应用后且其重新测量门槛通过后，运行：caveman learn applied
  <sink_id>。未来的 learn 运行将使用它来报告纵向结论：improved、
  unchanged、regressed 或 insufficient_data。诚实地展示 regressed，并提供
  该编辑的确切还原路径。
- 每项编辑都可逆：准确报告你更改了什么。若要撤销卸载，请执行
  caveman mem forget <id>，并恢复被删减的源内容。
- 仅限 inferred。切勿将本地数字表述为 verified。只有在报告本身包含货币值时
  （`spend` 以及已定价的节省行）才允许使用货币，并且必须完整保留该区块
  自身的表述框架——仅限指定时间窗口，绝不外推，绝不表述为 verified。
- 分析器（caveman learn）是只读的。你是唯一的写入者，而且只有在
  获得同意后才能写入。