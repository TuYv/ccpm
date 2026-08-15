---
name: marketplace-health-check
description: >-
  Run a full 6-dimension health check of this Claude Code skills marketplace repo — code/script
  safety, documentation/SSOT consistency, security/PII leaks, open-PR triage, open-issue triage,
  and marketplace-manifest integrity — via a parallel fan-out Dynamic Workflow, then verify the
  serious findings and report them by priority. Use this whenever the user asks to check the repo,
  run a health check, do a full sweep/audit before a release, 全面体检, 检查仓库状态, 看看仓库健康吗,
  审计一下仓库, or asks whether the PRs / issues / docs / versions / PII are in good shape across the
  board — even if they never say the word "workflow". Reach for it for any broad "is this whole repo
  OK" request, not just one-file checks.
---
# Marketplace 健康检查

使用并行扇出的动态工作流，对此 Claude Code skills marketplace 仓库执行全面且基于证据的健康检查。六个独立检查器并行覆盖：

1. **代码与脚本安全** — 危险删除、NO-FALLBACK 机密泄露、硬编码的真实路径、裸 `except`、注入、缺少 shebang
2. **文档 / SSOT 一致性** — marketplace.json / README×2 / CHANGELOG / git release 之间的版本一致性、skill 与 plugin 数量、失效引用、派生值漂移
3. **安全 / PII** — gitleaks 无法捕获的不含关键词的泄露（真实姓名、私有域名）、`.security-scan-passed` 标记缺口、case-file 审计
4. **开放 PR 分类处置** — 对每个 PR 进行分类（值得合并 / 需要修改 / 作为推广内容拒绝）
5. **开放 issue 分类处置** — 区分真实 bug、skill 请求与推广内容，并检查安装命令失效这一类 bug
6. **Marketplace manifest 完整性** — `check_marketplace.sh` + `check_doc_skill_lists.py`、孤立项、套件注册

然后由你验证严重发现，并按优先级报告。随附的脚本（`scripts/repo-health-check.workflow.js`）是已经验证、可直接运行的工作流；本文档说明如何运行并解读它。

## 为什么使用工作流——以及为什么它必须以内联方式运行

这六个维度彼此独立，因此将它们扇出给六个并行 agent，远快于让一个 agent 依次全面检查；同时，每个检查器都能专注于一个关注点，并生成各自的结构化输出。

**此 skill 必须以内联方式运行（不能使用 `context: fork`）。** 它通过 Workflow 工具编排并行 agent，而 fork 出的 subagent 无法生成 subagent 或启动工作流——以 fork 方式运行会悄无声息地破坏扇出过程。Workflow 工具还要求用户明确选择启用；用户请求“运行健康检查”即表示选择启用，因此可以继续执行。

## 如何运行

### 第 1 步——侦察当前规模（一次快速检查，供全部六个 agent 共享）

工作流脚本接受一个 `args` 对象，使所有 agent 共享同一份准确快照，而不必各自重复探查。收集：

```bash
gh repo view --json nameWithOwner,stargazerCount,isPrivate | jq -c .
echo "skills: $(find . -name SKILL.md -not -path '*-workspace/*' | wc -l | tr -d ' ')"
echo "open PRs: $(gh pr list --state open --json number | jq length)"
echo "open issues: $(gh issue list --state open --json number | jq length)"
grep -A1 '"metadata"' .claude-plugin/marketplace.json | grep -oE '"version": "[^"]*"' | head -1
git rev-parse --short HEAD; gh release view --json tagName -q .tagName 2>/dev/null
```

在将 PII 视为发布风险之前，确认 `isPrivate: false`——关键在于这是一个公开仓库。

### 第 2 步——启动工作流

读取随附的脚本，并通过 `script` 参数**以内联方式**启动它（传入脚本的完整内容，从而不依赖该 skill 的安装位置）：

```
Workflow({
  script: <full contents of scripts/repo-health-check.workflow.js>,
  args: { repo: "<owner/name>", scale: "<one-line summary from Step 1>" }
})
```

它会并行运行六个检查器（约 15-20 分钟，约产生 400-500k 输出 token——请预先告知用户成本），并返回 `{ checks: [...] }`，每个维度对应一个结构化结果：`health` + `summary` + `findings[]`（每项包含 severity / title / detail / location / recommendation）+ `stats`。

运行期间，你可以进行其他有用的准备工作，但不要开始编辑检查器正在读取的文件。

### 第 3 步——在报告严重发现之前进行反向审查

**代理的发现只是假设，而非结论。绝不要逐字转述。** 对于每一项 `high`/`critical` 发现，都要亲自使用一条快速命令进行验证——用 grep 搜索泄露值、用 `sed -n` 查看损坏的行、用 `gh repo view` 检查所声称的状态——确认它 (a) 确实存在，(b) 位于代理所说的位置，以及 (c) 并非过度推断。这样既能发现误报，也同样重要地能识别那些实际上错误的代理*建议*。（在提炼出此技能的那次会话中，一名安全检查器曾建议将真实私有域名添加到公开的 `.gitleaks.toml` 中——这是一种必须拒绝的反向暴露做法；参见方法论参考文档。）

用四个问题筛选每一项发现：**概率**（它真的会发生吗？）、**成本**（修复与忽略的成本对比）、**真实场景**（它在实践中会造成影响吗？）、**可验证性**（能否用一行命令确认或否定它？）。

## 报告格式

先给出表格，再按优先级分层说明。要分类，不要倾倒：

- **一句话结论 + 六维健康状况表**（每个维度使用 good / minor-issues / needs-attention / critical）
- **🔴 必须修复**——每一项已经验证的 high/critical 问题，附准确位置 + 具体修复方案
- **🟠 待办事项**——PR/议题分类结果、扫描标记缺口（这些属于决策，通常面向外部——标明它们会影响外部贡献者）
- **🟢 可选事项**——low/info 级别的小问题，每项一行
- **💡 关键洞察**——值得指出的元层面发现（例如工具中的结构性盲区、反复出现的缺陷类型）

为每个呈现的项目标记 ✅ 真实 / ⚠️ 部分属实 / ❌ 误报。代理的大部分原始输出都是噪声；你的职责是揭示所有者尚不知晓的真实风险，而不是转发 25 项发现让他们自行筛选。

## 判断原则

在解读发现和提出修复方案时应用以下原则。完整推理以及每项原则背后的真实失败案例，见 [references/health-check-methodology.md](references/health-check-methodology.md)——在处理 PII 或 PR/议题相关发现之前，请先阅读它。

- **防止反向暴露**：绝不要通过将真实值列入公开的允许列表（例如仓库自身的 `.gitleaks.toml`）来“修复” PII 泄露——公开列举真实资产的列表本身就是一种泄露。应就地清理该值；针对真实私有值的检测规则应放在所有者的私有全局防护中，而不是这个公开仓库里。
- **历史记录说明**：清理工作副本只能清理*当前*版本，但此前已经存在的泄露仍会留在 git 历史记录中。应如实指出历史记录中的暴露；重写历史记录（强制推送）是一个独立的高风险决策，会影响每个 fork——绝不要在未经请求的情况下执行。
- **扫描标记是必要但不充分的**：`.security-scan-passed` 标记表示“未发现已知格式的密钥”，而不是“已经过清理”。它无法发现不含关键词的泄露，因此对于任何包含真实数据示例的技能，都应同时进行人工/语义审查。
- **必须递增版本号**：对某个技能文件的任何更改，都必须递增 marketplace.json 中该技能的 `version`（并添加一条 CHANGELOG 记录）。外部贡献者提交的 PR 几乎总会遗漏这一点——应标明该问题，在修正前不要合并。
- **默认拒绝推广**：对于推广第三方目录 / 工具 / 市场的 PR 和议题，默认予以拒绝——该仓库是个人精选市场，而不是生态系统目录。拒绝政策模板是仓库根目录中的参考文档（位于此技能包之外）。

## 捆绑资源

- `scripts/repo-health-check.workflow.js` — 包含六个检查器的动态工作流。通过 Workflow 工具的 `script` 参数运行它（步骤 2）。添加或停用检查维度时，请编辑此文件。
- `references/health-check-methodology.md` — 反向审查过滤器、报告规范，以及反目标、历史记录、扫描标记和拒绝规则；每项规则都附有促使其制定的真实失败案例。

## 后续步骤

报告交付后，通常的后续操作应由负责人决策，而不是自动执行——例如修复已验证的 HIGH 级问题（清理 PII、纠正错误命令），或对积压的 PR/议题进行分类处理。请将这些操作作为选项提出；未经用户同意，不要自动修复 PR/议题或在其中自动发表评论，因为这些操作面向外部，并会影响外部贡献者。