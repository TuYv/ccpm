---
name: prior-work-retrieval
description: >-
  Only for explicit prior-work/reuse/history requests; never for read-only status or inspection.
  Finds and verifies existing successful work before substantial new production when reuse is
  materially plausible. Use when the user explicitly references earlier work, existing code/SOPs,
  history, prior decisions, another project, or says 以前做过, 已有代码, 别重复造轮子, reuse, or
  retrieve before produce. A mention of current/现有 tests, README, files, implementation, behavior,
  or validation is not a prior-work request. Do not infer the trigger merely because new work might
  duplicate something. Do not invoke for current-file inspection, ordinary bug fixes, mechanical
  verification, or merely because the final answer is a report/summary.
  Produces a source-verified reuse/adapt/reject receipt; zero hits never prove absence.
argument-hint: "<task or question>"
---
# 既有工作检索

仅当存在上述触发条件时，才在进行实质性产出**之前**运行此步骤。只读的当前状态检查仍应直接进行，除非用户要求查看历史记录。其目的不是再生成一份摘要，而是回答：**已经存在什么、哪个来源是当前版本、应复用什么，以及哪些内容确实是新的？**

## 完成标准

只有满足以下五项全部条件，检索流程才算完成：

1. 将任务真正的业务结果写成一个句子。
2. 清单中声明的每个相关载体都报告为 `searched`、`manual_completed` 或明确的失败/覆盖范围缺口。
3. 候选声明均已在其原始路径或记录中打开，而不是仅凭搜索结果摘要接受。
4. 每个采用的条目都有 `reuse` 或 `adapt` 决策，并附有与当前任务相关的理由。如果没有采用任何条目，回执中必须包含具体的 `no_reuse_reason`。
5. `scripts/prior_work.py check` 接受本次会话的回执。

`retrieved` 不等于 `verified`；`verified` 不等于 `reused`。请保持这些状态彼此分离，以免“我搜索过了”冒充“我使用了我们已有的最佳工作”。

## 工作流程

### 1. 首先读取本地运行上下文

查询之前，先读取当前项目的 `AGENTS.md`/`CLAUDE.md`、导航索引，以及其中指定的任何 North Star/当前决策文件。历史材料不能覆盖更新的明确决策。

### 2. 验证显式来源清单

清单是唯一的发现范围。某个目录不会仅仅因为约定认为它应该存在就自动存在。默认路径：

```bash
uv run --no-project python scripts/prior_work.py \
  --manifest <path> validate-manifest
```

默认值为 `~/.config/daymade/prior-work/sources.json`；项目可以指定其他路径。全局选项必须位于子命令之前。架构和载体示例位于 `references/source-manifest.md` 中。

### 3. 跨已声明的载体进行检索

将用户世界中的结果与提议的实现分开书写。然后提供两组术语：

- `--outcome-term`：1–5 个工件/事件/实体/日期术语，可用于定位已经完成的结果（已接受的交付物、规范化记录、已部署的服务、决策或运行证据）。
- `--term`：1–8 个实现术语（代码符号、旧工作流名称、技术名词、故障症状）。

运行时会将业务结果查询发送到文档、会议、档案和对话中；将实现查询发送到代码和 Skill 载体中。结果候选会优先排序。因此，代码搜索不再能够代替对所请求结果是否已经存在的检查。不要单独传入“做 / 优化 / 系统”等通用动词。

```bash
uv run --no-project python scripts/prior_work.py retrieve \
  --business-outcome 'the observable result the user actually needs' \
  --outcome-term 'accepted artifact, entity, event, or date' \
  --query 'the implementation or workflow currently being considered' \
  --term 'distinctive entity' \
  --term 'old workflow name' \
  --term 'failure symptom' \
  --session-id "$CODEX_SESSION_ID"
```

`--session-id`：仅与 `retrieve`、`complete` 和 `check` 一起使用；`validate-manifest` 不接受该参数。在 Codex 中使用 `$CODEX_SESSION_ID`。Claude Code 没有此环境变量，因此应使用 prior-work hook 消息中逐字携带的确切 id（UserPromptSubmit inject / PreToolUse deny / Stop block）。其旁显示的回执文件名是该 id 的 sha256，而不是 id 本身；使用猜测的 id 完成回执会写入一个 `check` 永远不会读取的文件，门禁也会持续拒绝。绝不要用看起来像哈希的文件名替代 id。

当某个通常可选的实时载体对请求至关重要时，应显式提升其要求级别：`--require-source live-wechat`。在记录该手动路径之前，回执无法完成。

该命令使用 `rg` 搜索文件系统载体，调用显式声明的命令适配器（例如正式的 Claude-history finder），并展示诸如实时 WeChat 之类的手动路径。内容搜索始终受声明的 glob 限制；只有当某个结果/实现术语明确呈现为路径形式（文件名、路径或 ISO 日期）时，才会进行完整路径枚举。诸如 `project_doc_max_bytes` 这样的符号不足以证明应遍历工作区中的每个文件名。该命令会在 manifest 的 `state_dir` 下写入不可变的运行 JSON，并返回其 `run_id`。

如果某个必需载体表示 `manual_required`，请执行所命名的 Skill 路径，并在完成前记录其结果。在本地 WeChat 存档中进行搜索，并不能证明覆盖了实时 WeChat；会话索引也不能证明覆盖了会议或代码。

### 4. 在权威来源处验证候选项

在其原始路径打开有希望的候选项。检查：

- **匹配度**：它是否解决了相同的业务问题，而不仅仅是共享某些词语？
- **权威性**：当前实现/SSOT 优先于历史提案；原始转录证明曾经说过什么，但不能证明其当前仍然正确。
- **新鲜度**：比较当前 Git HEAD、文件 mtime、决策日期以及任何已取代标记。不要使用存档覆盖当前行为。
- **结果证据**：相比一个看起来只是流程完整的过程，应优先采用代码/测试/已接受的交付物和实际运行结果。

### 5. 完成复用回执

对实际检查过的项目进行分类：

```bash
uv run --no-project python scripts/prior_work.py complete \
  --run <run_id> \
  --reuse '<candidate_id>=reuse unchanged because ...' \
  --adapt '<candidate_id>=adapt boundary X because ...' \
  --session-id "$CODEX_SESSION_ID"
```

如果没有任何项目符合条件，请使用 `--no-reuse-reason` 并说明已验证的不匹配之处。“No hits”不是理由；它只是一次检索观察，可能需要扩展术语或解决失败的载体。

完成的回执会保留 `business_outcome` 和 `outcome_terms`；`check` 会拒绝缺少任一字段的旧版或手工构造回执。回执的新鲜度与**必需**载体的定义绑定。编辑可选载体不会使已经验证的必需覆盖范围失效；但更改必需的根路径、路由、模式、权威来源或限制会使其失效。完整的 manifest 哈希仍作为溯源信息保留。然后进行验证：

```bash
uv run --no-project python scripts/prior_work.py check \
  --session-id "$CODEX_SESSION_ID"
```

只有在此检查通过后，才应开始实质性的生产工作。在实现/计划中引用已采用的候选项 ID，使回执与结果建立关联，而不是让回执沦为形式主义的文书工作。

## 配套 hooks

在清单有效且自测通过后安装：

```bash
scripts/prior-work-retrieval.sh --selftest
scripts/prior-work-retrieval.sh --install
```

版本化的包装器是同步 hook-runtime 的 SSOT。它会解析一个直接的 Python 解释器，且永远不会进入包管理器/缓存生命周期；请将上面的 `uv run ... prior_work.py` 命令保留为明确的检索和回执操作，而不是 hook 启动器。

安装器会将所需的处理器添加到 Claude 和 Codex，同时不会替换无关的 hooks：

- `UserPromptSubmit` 仅针对明确的既有工作/复用/历史信号创建限定于 prompt 的要求，并注入 Skill 路由。过滤器会避免该信号在用户未提出相关请求时触发：
  - **并非用户发言。** 内部模板（`You are a/an …`、`# Overview`）、harness 信封（`<agent-message …>`、`<task-notification …>`、`<system-reminder …>`）以及粘贴的对话记录行（`⏺ …`）都会作为 prompts 到达此处理器。它们永远不会激活要求。
  - **执行器无法满足 gate。** 禁止读取 skills 或运行 shell 的 prompt 已经移除了完成回执所需的能力；为其设置 gate 会在没有解除路径的情况下阻塞工作。明确表示退出既有工作检索的 prompt，会按照人们实际使用的写法（`Do NOT perform prior-work retrieval`、`opts out of prior-work retrieval`）予以遵守，而不只是识别 `skip`/`disable`。
  - **被否定的复用。** “不要复用 X”、“别沿用”、`don't reuse` 表示不要采用既有工作；将某项工作描述为很久以前的旧内容（“很久之前写的”）表示它已经过时，而不是要求查找它。两者都会在匹配前被排除，因此同一句话中的真实请求仍会计入；而“别重复造轮子”/“不希望你重新造”——这些表达要求复用——仍会激活要求。
  - **含糊的回忆需要一个远距离指代对象。** 上次 / 好像是 / 我记得是 / 记不清，只有同时搭配带有远指或不定指示词的工作名词（那个/某个/哪个 脚本）时才会激活，因为这个脚本就是眼前的对象——“这个脚本好像是死循环”是 bug 报告，而不是回忆请求。单独出现的 `history` 同样需要一个承载对象（`conversation history`，而不是 `git history`）。
  - **有效回执已经覆盖此会话。** 含糊措辞的回忆不再创建新的要求，以免已完成的回执被搁置。明确提出新的既有工作请求仍然会创建要求。

运行 `scripts/prior_work.py audit`，查看 gate 是否正常工作：它会报告触发类型、空 gate 比率（已激活但从未产生回执的要求——这是对无法遵从的请求设置 gate 的特征）、搁置的回执、非用户输入触发的要求，以及每个仍会激活的条目背后所匹配的 token。使用 `--json` 获取机器可读的输出。应根据这个数值评估 gate，而不是根据其自身测试是否通过。
- `PreToolUse` 仅在该明确要求已经存在且缺少有效回执时阻止实质性写入。它永远不会将普通写入转变为检索义务。在要求处于激活状态时，只读发现和小型机械编辑仍然可用。
- `Stop` 会验证已经存在的明确要求。它永远不会根据输出长度、代码、工具使用情况或通用的生产请求凭空创建要求。

它将范围更窄、未版本化的 `recall-first-evidence` UserPromptSubmit
处理程序迁移到这个超集之中，同时将其脚本保留在磁盘上以便恢复。旧的触发词族（“我们之前”、“什么来着”、模糊记忆）属于回归测试。安装后运行机器的 profile-settings synchronizer，使每个
Claude 配置文件都能获得主设置。Codex 需要通过 `/hooks` 进行一次人工信任审核；安装程序绝不会伪造这一审核。

用户可以明确表示不要为当前提示搜索之前的工作。这一选择退出会成为仅作用于当前提示的状态，而不是环境变量绕过方式。格式错误或缺失的清单或回执状态只会在实质性生产阶段 fail closed；只读调查以及恰好针对清单路径的写入仍然可以进行，从而使代理能够修复这一门控，而不绕过它。

## 搜索路由

| 需求 | 路由 |
|---|---|
| 已知的精确字符串、符号、路径 | 文件系统载体（`rg`） |
| 记得含义但措辞已改变 | 声明的语义适配器（gbrain，或 Claude-history 混合召回——该索引仅涵盖 Claude 会话） |
| 之前 Claude 的精确工具调用/思考/文件历史证据 | `read-claude-code-history search` |
| 之前的对话证据，但平台未知、涉及多个平台，或并非 Claude | `local-conversation-history`；每个提供方都是独立存储，因此仅 Claude 的答案无法支持“我们从未讨论过它”这一说法 |
| 会议决策或发言者声明 | 项目转录载体；打开原始发言者轮次 |
| 已归档的微信文字/语音转写 | 声明的微信归档载体 |
| 实时/最新微信 | `read-wechat-messages`；记录手动覆盖范围 |
| 当前代码行为 | 在当前 Git 修订版本中打开实现/测试 |

## 边界

- 清单是显式的，并且与可变的索引状态分开进行版本控制。
- 搜索结果是待验证的假设。回执记录验证和复用情况。
- 不要将私有项目数据复制到公开示例或 Skill fixture 中。
- 不要在必需的载体失败后静默回退。记录这一缺口。
- 外部网页研究应在本地既有工作之后开始，除非用户明确要求当前的外部事实，或本地证据无法回答。
- 此 Skill 定义工作流。配套 hook 可能要求在 `Write`/`Edit` 之前获取新的回执；Stop 可能强制执行同一项既有义务，但最终答案的形状不能创建新的义务。Hook 不负责决定哪个候选项是好的。

## 维护者验证

```bash
uv run --no-project python -m unittest discover -s tests -p 'test_*.py'
uv run --no-project python scripts/prior_work.py \
  --manifest tests/fixtures/manifest.json validate-manifest
scripts/prior-work-retrieval.sh --selftest
```

回归用例必须包含真实的失败类型：未加载跨项目规则、忽略已有的提供方契约、旧决策胜过 North Star、声明了不存在的工件能力、遗漏相邻代理的证据，以及被全局“已搜索”声明掩盖的对话/会议/微信载体缺口。