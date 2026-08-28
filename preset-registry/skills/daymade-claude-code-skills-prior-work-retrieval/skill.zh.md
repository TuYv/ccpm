---
name: prior-work-retrieval
description: >-
  Only for explicit prior-work/reuse/history requests; never for read-only status or inspection.
  Finds and verifies existing successful work before substantial new production when reuse is
  materially plausible. Use when the user explicitly references earlier work, existing code/SOPs,
  history, prior decisions, another project, or says 以前做过, 已有代码, 别重复造轮子, reuse, or
  retrieve before produce. Also use when a genuinely new implementation would likely duplicate a
  known artifact. Do not invoke for read-only repo status, current-file inspection, simple
  explanation, mechanical verification, or merely because the final answer is a report/summary.
  Produces a source-verified reuse/adapt/reject receipt; zero hits never prove absence.
argument-hint: "<task or question>"
---
# 既有工作检索

仅当上方的触发条件存在时，才在进行大量产出**之前**运行此步骤。只读的当前状态检查仍应直接进行，除非用户要求查看历史。它的目的不是再生成一份摘要，而是回答：**已经存在什么、哪个来源是当前版本、应复用什么，以及哪些内容确实是新的？**

## 完成标准

仅当以下五项全部满足时，一次检索流程才算完成：

1. 任务真正的业务结果已用一句话写明。
2. 清单中声明的每个相关载体都报告为 `searched`、`manual_completed`，或明确的失败/覆盖范围缺口。
3. 候选声明已在其原始路径或记录中打开，而不是仅凭搜索结果摘要接受。
4. 每个采用的项目都有 `reuse` 或 `adapt` 决策，并附有与当前任务相关的理由。如果没有采用任何项目，回执中必须包含具体的 `no_reuse_reason`。
5. `scripts/prior_work.py check` 接受本次会话的回执。

`retrieved` 不等于 `verified`；`verified` 也不等于 `reused`。请保持这些状态彼此分离，以免“我搜索过了”冒充“我使用了我们已有的最佳工作”。

## 工作流

### 1. 先读取本地运行上下文

在查询之前，先读取当前项目的 `AGENTS.md`/`CLAUDE.md`、导航索引，以及其中指明的任何 North Star/当前决策文件。历史材料不能覆盖更新的明确决策。

### 2. 验证显式来源清单

清单是唯一的发现范围。某个目录不会仅仅因为约定认为它应该存在，就实际存在。默认路径：

```bash
uv run --no-project python scripts/prior_work.py \
  --manifest <path> validate-manifest
```

默认值为 `~/.config/daymade/prior-work/sources.json`；项目可以指定其他路径。全局选项必须位于子命令之前。架构和载体示例见 `references/source-manifest.md`。

### 3. 跨声明的载体进行检索

将用户世界中的结果与拟议的实现分开书写。然后提供两组术语：

- `--outcome-term`：1–5 个工件/事件/实体/日期术语，可用于定位已经完成的结果（已接受的交付物、规范记录、已部署的服务、决策或运营证据）。
- `--term`：1–8 个实现术语（代码符号、旧工作流名称、技术名词、故障症状）。

运行时会将业务结果查询发送到文档、会议、存档和对话中；将实现查询发送到代码和 Skill 载体中。结果候选会优先排序。因此，代码搜索不再能够替代对所请求结果是否已经存在的检查。不要只传入“做 / 优化 / 系统”等通用动词。

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

当通常可选的实时载体对请求具有实质性影响时，应显式将其提升为必需项：`--require-source live-wechat`。在记录该手动路径之前，回执无法完成。

该命令使用 `rg` 搜索文件系统载体，调用显式声明的命令适配器（例如正式的 Claude 历史记录查找器），并展示实时微信等手动路径。内容搜索始终受声明的 glob 限制；只有当结果/实现术语明确呈现为路径形式（文件名、路径或 ISO 日期）时，才会执行完整路径枚举。诸如 `project_doc_max_bytes` 这样的符号不足以证明需要遍历工作区中的每个文件名。该命令会在清单的 `state_dir` 下写入不可变的运行 JSON，并返回其 `run_id`。

如果某个必需载体标记为 `manual_required`，请执行该命名的 Skill 路径，并在完成前记录其结果。本地微信归档搜索不能证明已覆盖实时微信；对话索引不能证明已覆盖会议或代码。

### 4. 在权威来源处验证候选项

在其原始路径打开有希望的候选项。检查：

- **匹配性**：它是否解决了相同的业务问题，而不仅仅是共享某些词语？
- **权威性**：当前实现/SSOT 优于历史提案；原始转录证明曾经说过什么，但不能证明其目前仍然正确。
- **新鲜度**：比较当前 Git HEAD、文件 mtime、决策日期以及任何已取代标记。不要使用归档内容覆盖当前行为。
- **结果证据**：相较于仅仅看起来已完成的流程，应优先考虑代码/测试/已接受的交付物和运行结果。

### 5. 完成复用回执

对你实际检查过的项目进行分类：

```bash
uv run --no-project python scripts/prior_work.py complete \
  --run <run_id> \
  --reuse '<candidate_id>=reuse unchanged because ...' \
  --adapt '<candidate_id>=adapt boundary X because ...' \
  --session-id "$CODEX_SESSION_ID"
```

如果没有任何项目符合条件，请使用 `--no-reuse-reason` 并填写经过验证的不匹配原因。“没有命中”不是理由；它只是一次检索观察，可能需要扩大术语范围或解决失败的载体。

已完成的回执会保留 `business_outcome` 和 `outcome_terms`；`check` 会拒绝缺少任一字段的旧版或手工构造回执。回执的新鲜度与**必需**载体的定义绑定。编辑可选载体不会使已经验证的必需覆盖失效；但更改必需根目录、路径、模式、权威来源或限制条件会使其失效。完整的清单哈希仍作为溯源信息保留。然后进行验证：

```bash
uv run --no-project python scripts/prior_work.py check \
  --session-id "$CODEX_SESSION_ID"
```

只有在此步骤通过后，才应开始实质性的生产工作。在实现/计划中引用已采用的候选项 ID，使回执与结果建立关联，而不是让它沦为形式主义的文书工作。

## 配套钩子

在清单有效且自测通过后安装：

```bash
scripts/prior-work-retrieval.sh --selftest
scripts/prior-work-retrieval.sh --install
```

安装程序会向 Claude 和 Codex 各添加三个处理器，而不会替换无关的 hook：

- `UserPromptSubmit` 标记新的提示词范围内需求，并在存在既有工作或生产信号时注入 Skill 路由。
- `PreToolUse` 会阻止大规模的新写入/大规模写入、补丁、委派生产，以及携带写入信号或未知可执行文件的 Bash/Codex 执行路径，直到当前需求拥有回执。只读发现、小型机械编辑和 `tinkle_` 临时文件仍然可用。
- `Stop` 会验证一个已经由当前提示词或一次大规模工具尝试创建的需求。它不会仅仅因为最终回答很长、呈列表形式或包含代码，就凭空创建新需求。

它会将范围更窄的、未版本化的 `recall-first-evidence` UserPromptSubmit
处理器迁移到这个超集，同时将其脚本保留在磁盘上以便恢复。旧的触发词族（“我们之前”、“什么来着”、模糊记忆）属于回归测试。安装后运行机器的配置文件设置同步器，以便每个 Claude 配置文件都获得主设置。Codex 需要通过 `/hooks` 完成一次人工信任审核；安装程序绝不会伪造该审核。

用户可以明确表示不要为当前提示词搜索既有工作。该选择退出会成为提示词范围内的状态，而不是通过环境变量绕过。清单或回执状态格式错误/缺失时，仅在大规模生产操作中采取默认拒绝；只读调查以及针对清单路径本身的写入仍然可以进行，以便代理修复该门禁而不绕过它。

## 搜索路由

| 需求 | 路由 |
|---|---|
| 已知的精确字符串、符号、路径 | 文件系统载体（`rg`） |
| 记得含义，但措辞已改变 | 已声明的语义适配器（gbrain 或 Claude-history 混合召回） |
| 精确的既有 Claude 工具/思考/文件历史证据 | `read-claude-code-history search` |
| 会议决策或发言者主张 | 项目转录载体；打开原始发言者话轮 |
| 已归档的微信文本/语音转录 | 已声明的微信归档载体 |
| 当前代码行为 | 在当前 Git 修订版本中打开实现/测试 |

## 边界

- 清单是显式的，并与可变的索引状态分开进行版本控制。
- 搜索结果属于假设。回执记录验证和复用情况。
- 不要将私有项目数据复制到公开示例或 Skill fixture 中。
- 所需载体失败时，不要静默回退。记录该缺口。
- 外部网络研究应在本地既有工作之后开始，除非用户明确要求当前的外部事实，或本地证据无法回答。
- 此 Skill 就是工作流。配套 hook 可能要求在 `Write`/`Edit` 前获取新的回执；Stop 可能会强制执行同一项既有义务，但最终回答的形式不能创建新的义务。Hook 不负责决定哪个候选项是好的。

## 维护者验证

```bash
uv run --no-project python -m unittest discover -s tests -p 'test_*.py'
uv run --no-project python scripts/prior_work.py \
  --manifest tests/fixtures/manifest.json validate-manifest
scripts/prior-work-retrieval.sh --selftest
```

回归用例必须涵盖真实的失败类型：未加载跨项目规则、忽略现有的 provider contract、旧决策胜过 North Star、声明了不存在的 artifact capability、遗漏相邻 agent 的证据，以及被全局“searched”声明掩盖的 conversation/meeting/WeChat 载体缺口。