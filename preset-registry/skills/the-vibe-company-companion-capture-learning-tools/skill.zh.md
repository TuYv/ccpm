---
name: capture-learning-tools
description: "Turn technical conversations, bugs, CI failures, review comments,
  and repeated agent mistakes into durable project improvements. Use when the
  user asks what should be automated, documented, tested, added to
  AGENTS.md/CLAUDE.md, wired into CI, or changed so the same issue does not
  happen again. This skill is for both non-technical and technical users: it
  explains the learning in plain English, inspects the repository, chooses the
  right prevention layer, proposes changes first, and only edits project files
  when explicitly asked."
metadata: {}
allowed-tools: Bash Read Write Edit Grep Glob Agent
---
# 工程学习循环

本技能是技术工作之后的预防层。它会分析对话和代码仓库，然后把有用的经验教训沉淀到项目本身：代理指令、测试、CI、脚本、模板、文档或架构决策。

项目是唯一事实来源。不要依赖私有记忆系统、个人知识库或单一代理宿主。好的结果应让仓库对下一个人或代理来说更易于协作。

## 受保护的不变量

1. 先提议，后编辑。仅在用户明确要求或任务明确需要实施时才应用变更。
2. 优先使用可强制执行的保障措施，而非文字说明。如果测试、脚本或 CI 检查能够可靠地捕获问题，应先推荐这种方式，再考虑添加提醒。
3. 让非技术用户保持清晰认知。在给出技术细节之前，先用通俗语言给出结论。
4. 保持指令的可移植性。不要硬编码私有路径、组织、账号名、密钥或仅适用于特定工具的假设。
5. 不要把每个错误都变成规则。有些学习属于一次性的判断取舍，应保留为手动处理。
6. 除非被明确要求，绝不进行 stage、commit、push、创建 PR，或变更对计费敏感的 CI 行为。

## 参考资料路由

只阅读任务所需的内容：

- `references/conversation-analysis.md`，用于从对话、转录文本、评审、缺陷或用户纠正中提取经验教训。
- `references/promotion-matrix.md`，用于判断该经验应归于指令、测试、CI、脚本、文档、ADR，还是哪里都不放。
- `references/agent-instructions.md`，用于变更或提议 `AGENTS.md`、`CLAUDE.md`、`.claude/rules/`、Cursor 规则或其他代理指导时。
- `references/ci-policy.md`，在推荐 CI 之前阅读，尤其是针对私有仓库、付费 runner、耗时较长的检查或开源项目。
- `references/testing-policy.md`，在推荐回归测试或覆盖率变更之前阅读。
- `references/project-memory.md`，用于仓库需要一个持久存放决策、运维手册、模板或常用项目知识的地方时。
- `references/cross-agent-linking.md`，用于多个代理宿主需要相同指令的情况。
- `references/non-technical-mode.md`，用于用户并非明显属于技术人员或要求简单解释的情况。
- `references/examples.md`，用于查看具体的改造前后模式。

在有帮助时使用脚本：

- `scripts/inspect_project_guidance.py --cwd <repo>` 查找 `AGENTS.md`、`CLAUDE.md`、symlink、导入关系以及相邻的代理规则文件。
- `scripts/inspect_ci_surface.py --cwd <repo>` 汇总工作流、脚本和 CI 成本信号。
- `scripts/classify_learning.py --text "<lesson>"` 为一条经验教训给出初步归属建议。

## 工作流

### 1. 捕获经验教训

阅读当前对话或提供的转录文本。识别：

- 用户的指令、纠正或不满
- 技术事件：缺陷、CI 失败、评审意见、缺失的测试、错误假设、重复的手工操作、不清晰的配置说明，或项目惯例
- 不应再次发生的失败模式
- 谁需要下一道保障：非技术用户、开发者、评审者、代理、CI，还是部署环节

如果请求含糊不清，请凭借最佳判断继续并说明假设。仅当缺失的细节会改变所推荐的保障措施时才提问。

### 2. 检查项目

在推荐变更之前先摸清仓库情况：

- 项目指令：`AGENTS.md`、`CLAUDE.md`、`.claude/CLAUDE.md`、`.claude/rules/`、`.cursor/rules/`、`.github/copilot-instructions.md`
- 验证命令：包脚本、Makefile、任务运行器配置、README、CI 工作流
- 测试与模式：单元测试、集成测试、e2e、fixtures、迁移、内容校验器、类型检查
- 项目记忆：`docs/`、ADR、运维手册、模板、变更日志、issue/PR 模板

当 `CLAUDE.md` 存在而 `AGENTS.md` 不存在时，应将其视为可移植性缺口。提议一个共享的 `AGENTS.md` 加上 `CLAUDE.md` 适配器或 symlink，除非有充分理由保留仅面向 Claude 的指令。

### 3. 选择预防层

使用晋升矩阵：

- 可复用的项目规则 -> `AGENTS.md` 或等同的共享项目指令
- Claude 专属指令 -> 置于共享指令之后的 `CLAUDE.md` 适配器
- 特定路径的行为 -> 限定文件夹范围的代理规则
- 可复现的缺陷 -> 回归测试
- 已有测试未运行 -> CI 接入
- 重复的手工验证 -> 脚本或任务命令
- 开销较大的检查 -> 定时触发、发布时触发或可选参与的 CI
- 架构/产品决策 -> ADR 或决策记录
- 配置知识 -> README 或运维手册
- 通用的代理工作流 -> 现有技能或可复用的软件包
- 一次性偏好 -> 不做自动化

### 4. 考虑 CI 成本与受众

区分以下情况：

- 公开的开源仓库，通常可以接受标准托管 CI
- 私有仓库，CI 分钟数、付费 runner 和耗时较长的检查会产生成本
- 原型项目，记录在案的本地预检可能优于完整的 CI 门禁
- 生产级或安全敏感项目，较慢的检查可能是合理的

如果用户是非技术人员，请用成本/风险的措辞解释 CI 选择，而不是 runner 术语。

### 5. 先报告

默认使用以下输出契约：

```markdown
# Engineering Learning Loop Review

## Plain-English Verdict
<what should change and why, in non-technical language>

## Technical Diagnosis
- Conversation signal:
- Project gap:
- Earlier detection point:
- Best prevention layer:

## Recommended Changes
| Priority | Destination | Change | Why | Cost |
| --- | --- | --- | --- | --- |

## Proposed Instruction Text
<exact AGENTS.md/CLAUDE.md/rule text, or "None">

## Proposed Test Or CI
<specific test/check/command and where it should run, or "None">

## Documentation Or Decision Record
<doc/runbook/ADR/template update, or "None">

## Not Worth Automating
<items deliberately left manual and why>

## Apply Plan
1. <smallest safe patch step>
2. <verification step>
```

### 6. 应用模式

当被要求应用时：

1. 在编辑之前立即重新阅读目标文件。
2. 保持补丁范围窄且可回退。
3. 对于 `AGENTS.md` 和 `CLAUDE.md`，在编辑前先检查二者是否存在一方导入或 symlink 到另一方。
4. 相比重复的规则，优先采用单一共享事实来源加宿主专属适配器。
5. 当回归可被机器校验时，先添加或更新测试，再补充文字说明。
6. 除非用户接受该权衡，否则避免扩展付费或缓慢的 CI。
7. 运行最小范围的相关验证，并报告哪些通过了、哪些无法运行。

## 黄金标准

一次成功的运行会减少未来的中断。下一个人或代理能够发现规则、运行检查、理解决策，并在不需要本次对话的情况下避免重复同一类错误。
