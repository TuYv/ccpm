---
name: prior-work-retrieval
description: >-
  Finds and verifies the user's existing successful work before producing a new
  implementation, plan, report, workflow, document, or external message. Use
  whenever the task may already have an answer in another project, repository,
  Skill, SOP, decision record, meeting transcript, WeChat archive, or prior
  Claude conversation; especially when the user says “以前做过”, “已有代码”,
  “历史经验”, “别重复造轮子”, “先看看项目最近进展”, “retrieve before produce”,
  or asks to generalize a previous solution. Produces an auditable retrieval
  receipt with source coverage, authority/freshness checks, and explicit
  reuse/adapt/reject decisions. Never treats zero ranked hits as absence.
argument-hint: "<task or question>"
---
# 既有工作检索

在进行实质性产出之前运行此流程。它的目的不是再生成一份摘要，而是回答：**已经有什么、哪个来源是当前版本、应该复用什么，以及哪些内容确实是全新的？**

## 完成标准

只有满足以下五项，检索流程才算完成：

1. 将任务真正的业务结果写成一句话。
2. 清单中声明的每个相关载体都报告 `searched`、`manual_completed`，或明确的失败/覆盖范围缺口。
3. 候选声明必须在其原始路径或记录中打开核验，不能仅凭搜索摘要接受。
4. 每个采用的项目都必须有 `reuse` 或 `adapt` 决策，并附有与当前任务相关的理由。如果没有采用任何项目，回执必须包含具体的 `no_reuse_reason`。
5. `scripts/prior_work.py check` 接受本次会话的回执。

`retrieved` 不等于 `verified`；`verified` 不等于 `reused`。请保持这些状态彼此独立，以免“我搜索过”冒充“我使用了已有的最佳工作成果”。

## 工作流程

### 1. 先阅读本地运行上下文

在查询之前，阅读当前项目的 `AGENTS.md`/`CLAUDE.md`、导航索引，以及它们指定的任何 North Star/当前决策文件。历史材料不能覆盖更新的明确决策。

### 2. 验证显式来源清单

清单是唯一的发现范围。某个目录不会仅仅因为某种约定认为它应该存在，就实际存在。默认路径：

```bash
uv run --no-project python scripts/prior_work.py \
  --manifest <path> validate-manifest
```

默认值为 `~/.config/daymade/prior-work/sources.json`；项目可以指定其他路径。全局选项必须位于子命令之前。架构和载体示例位于 `references/source-manifest.md`。

### 3. 跨已声明的载体进行检索

写出结果句，然后提供 3–8 个具有区分度的术语：产品/实体名称、技术名词、旧项目名称和故障症状。不要单独传入“做 / 优化 / 系统”这类通用动词。

```bash
uv run --no-project python scripts/prior_work.py retrieve \
  --query 'the real task in one sentence' \
  --term 'distinctive entity' \
  --term 'old workflow name' \
  --term 'failure symptom' \
  --session-id "$CODEX_SESSION_ID"
```

当某个通常可选的实时载体与请求密切相关时，使用 `--require-source live-wechat` 显式提升其优先级。在记录该人工路径之前，回执无法完成。

该命令使用 `rg` 搜索文件系统载体，调用显式声明的命令适配器（例如正式的 Claude 历史记录查找器），并展示诸如实时 WeChat 之类的人工路径。它会在清单的 `state_dir` 下写入不可变的运行 JSON，并返回其 `run_id`。

如果某个必需载体报告 `manual_required`，请执行指定的 Skill 路径，并在完成前记录其结果。在本地 WeChat 归档中进行搜索，并不能证明已覆盖实时 WeChat；会话索引也不能证明已覆盖会议或代码。

### 4. 在权威来源处核验候选项

打开有希望的候选项，查看其原始路径。检查：

- **匹配度**：它解决的是同一个业务问题，而不只是共享了一些词语吗？
- **权威性**：当前实现/SSOT 的优先级高于历史提案；
  原始记录能够证明当时说过什么，但不能证明它现在仍然正确。
- **新鲜度**：比较当前 Git HEAD、文件修改时间、决策日期以及任何已取代标记。不要使用归档内容覆盖当前行为。
- **结果证据**：相较于仅仅看起来流程完整的过程，应优先参考代码/测试/已验收交付物以及实际运行结果。

### 5. 完成复用回执

对你实际检查过的项目进行分类：

```bash
uv run --no-project python scripts/prior_work.py complete \
  --run <run_id> \
  --reuse '<candidate_id>=reuse unchanged because ...' \
  --adapt '<candidate_id>=adapt boundary X because ...' \
  --session-id "$CODEX_SESSION_ID"
```

如果没有任何项目符合条件，请使用 `--no-reuse-reason` 并说明经过验证的不匹配原因。“没有命中”不是理由；它只是一次检索观察，可能需要扩大检索词范围或解决载体失败的问题。

然后进行验证：

```bash
uv run --no-project python scripts/prior_work.py check \
  --session-id "$CODEX_SESSION_ID"
```

只有通过此检查后，才能开始实质性的生产工作。在实现/计划中引用已采用的候选项 ID，使回执与最终结果建立关联，而不是让它沦为形式主义的文书工作。

## 配套钩子

在清单有效且自测通过后安装：

```bash
scripts/prior-work-retrieval.sh --selftest
scripts/prior-work-retrieval.sh --install
```

安装程序会向 Claude 和 Codex 各添加三个处理器，同时不会替换无关的钩子：

- `UserPromptSubmit` 会标记新的提示词范围需求，并在检测到既往工作或生产信号时注入 Skill 路由。
- `PreToolUse` 会阻止实质性的新建/大规模写入、补丁、委派生产，以及携带写入信号或未知可执行文件的 Bash/Codex 执行路径，直到当前需求拥有回执。只读发现、小型机械式编辑以及 `tinkle_` 临时文件仍然可用。
- `Stop` 会捕获从未写入文件的实质性纯聊天交付物。

它会将范围更窄且未版本化的 `recall-first-evidence` `UserPromptSubmit` 处理器迁移到这个超集，同时将其脚本保留在磁盘上以便恢复。旧的触发词族（“我们之前”、“什么来着”、模糊记忆）属于回归测试。安装后运行机器的配置文件设置同步器，以便每个 Claude 配置文件都获得主设置。Codex 需要通过 `/hooks` 完成一次人工信任审核；安装程序绝不会伪造该审核。

用户可以明确表示当前提示词不应搜索既往工作。这个选择退出会成为提示词范围内的状态，而不是通过环境变量绕过检查。清单或回执状态格式错误/缺失时，只有实质性生产会默认拒绝；只读调查以及恰好以清单路径为目标的写入仍然可以进行，以便代理修复此门禁而不绕过它。

## 搜索路由

| 需求 | 路由 |
|---|---|
| 已知的精确字符串、符号、路径 | 文件系统载体（`rg`） |
| 记得含义，但措辞已改变 | 已声明的语义适配器（gbrain 或 Claude-history 混合召回） |
| 精确的既往 Claude 工具/思考/文件历史证据 | `claude-code-history-files-finder search` |
| 会议决定或发言者主张 | 项目转录载体；打开原始发言轮次 |
| 已归档的微信文本/语音转录 | 已声明的微信归档载体 |
| 实时/最新微信 | `read-wechat-messages`；记录手动覆盖范围 |
| 当前代码行为 | 在当前 Git 修订版本中打开实现/测试 |

## 边界

- 清单是显式的，并且与可变的索引状态分开进行版本管理。
- 搜索结果只是待验证的假设。回执记录验证和复用情况。
- 不要将私有项目数据复制到公开示例或 Skill fixture 中。
- 所需载体失败时，不要默默回退。记录该缺口。
- 外部网络研究应在本地既有工作之后开始，除非用户明确要求当前的外部事实，或本地证据无法回答。
- 此 Skill 就是工作流。配套钩子可能要求在`Write`/`Edit`或较长的最终响应之前获取新的回执，但钩子不决定哪个候选项是合适的。

## 维护者验证

```bash
uv run --no-project python -m unittest discover -s tests -p 'test_*.py'
uv run --no-project python scripts/prior_work.py \
  --manifest tests/fixtures/manifest.json validate-manifest
scripts/prior-work-retrieval.sh --selftest
```

回归用例必须包含真实的失败类型：未加载跨项目规则、忽略现有的 provider 合约、旧决策胜过北极星、声明了不存在的工件能力、遗漏相邻代理证据，以及会话/会议/微信载体缺口被全局“已搜索”声明所掩盖。