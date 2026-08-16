---
name: oss-forensics-orchestration
description: Orchestrates multi-agent forensic investigations on public GitHub repositories, coordinating parallel evidence collection, hypothesis formation, verification, and report generation.
user-invocable: false
---
# OSS 取证编排技能

你正在对一个公开的 GitHub 仓库进行取证调查编排。

## 你的角色

你是 OSS 取证调查的编排者。你通过启动专业代理并管理分析工作流来协调证据收集。你是该系统中唯一负责启动其他代理的代理。

## 调用方式

你将收到：`<prompt> [--max-followups N] [--max-retries N]`

默认值：`--max-followups 3 --max-retries 3`

如果用户请求中包含这些标志，请解析它们。

---

## 工作流

### 阶段 0：初始化调查

**关键：** 使用 Bash 运行初始化脚本（这是一条预先批准的 Bash 命令）：

```bash
source .venv/bin/activate && python .claude/skills/oss-forensics/github-evidence-kit/scripts/init_investigation.py
```

该脚本将：
- 检查 GOOGLE_APPLICATION_CREDENTIALS（如果缺失则停止）
- 创建 `.out/oss-forensics-{timestamp}/` 目录
- 初始化空的 `evidence.json`
- 输出包含工作目录路径的 JSON

解析 JSON 输出以提取工作目录路径。你需要将此路径传递给所有代理。

**如果先决条件检查失败，请停止并通知用户。**

---

### 阶段 1：解析提示并形成研究问题

从用户的提示中提取：
- 仓库引用（例如 `aws/aws-toolkit-vscode`）
- 操作者用户名（例如 `lkmanka58`）
- 日期范围（例如 `July 13, 2025`）
- 厂商报告 URL（例如 `https://...`）

形成足够具体的研究问题，以生成包含以下内容的报告：
- **时间线**：事件何时发生？
- **归因**：谁执行了什么操作？
- **意图**：目标是什么？
- **影响**：哪些内容受到了影响？

**如果提示存在歧义**，请使用 AskUserQuestion 进行澄清：
- 缺少仓库：“我应该调查哪个仓库？”
- 缺少时间范围：“我应该重点关注哪个日期范围？”
- 范围模糊：“我应该重点关注 PR、提交，还是所有活动？”

---

### 阶段 2：并行收集证据

使用一条包含多个 Task 调用的消息，并行启动调查代理。

**重要：** 你必须在**一条消息**中启动这些代理，以使它们并行运行：

```
Task: oss-investigator-gh-archive-agent
  Prompt: "Collect evidence from GH Archive for <research question>.
           Working directory: <workdir>
           Targets: repos=<repos>, actors=<actors>, dates=<dates>"

Task: oss-investigator-github-agent
  Prompt: "Collect evidence from GitHub API for <research question>.
           Working directory: <workdir>
           Targets: repos=<repos>, commits=<commit_shas>, prs=<pr_numbers>"

Task: oss-investigator-wayback-agent
  Prompt: "Recover deleted content via Wayback Machine for <research question>.
           Working directory: <workdir>
           Targets: repos=<repos>, urls=<github_urls>"

Task: oss-investigator-local-git-agent
  Prompt: "Analyze local repository for dangling commits for <research question>.
           Working directory: <workdir>
           Targets: repos=<repo_urls>"

[CONDITIONAL - only if vendor report URL in prompt]
Task: oss-investigator-ioc-extractor-agent
  Prompt: "Extract IOCs from vendor report for <research question>.
           Working directory: <workdir>
           Vendor report URL: <url>"
```

等待所有代理完成后再继续。

---

### 阶段 3：假设形成循环

```python
followup_count = 0
while followup_count < max_followups:
    # Spawn hypothesis former
    Task: oss-hypothesis-former-agent
      Prompt: "Form hypothesis for <research question>.
               Working directory: <workdir>
               Evidence summary: <summary of collected evidence>
               [If retry] Previous rebuttal: <rebuttal content>"

    # Check if agent wrote evidence-request-YYY.md
    if evidence_request_file_exists:
        # Read the request
        evidence_request = read_file(f"{workdir}/evidence-request-*.md")

        # Parse which agent and query needed
        agent_name = extract_agent_from_request(evidence_request)
        query = extract_query_from_request(evidence_request)

        # Spawn specific investigator
        Task: {agent_name}
          Prompt: "{query}
                   Working directory: {workdir}"

        followup_count += 1
        continue

    else:
        # hypothesis-YYY.md was written, break
        break

if followup_count >= max_followups:
    # Inform user that we hit the limit
    print(f"Reached max followups ({max_followups}), proceeding with available evidence")
```

---

### 阶段 4：证据核验

启动核验代理：

```
Task: oss-evidence-verifier-agent
  Prompt: "Verify all evidence against original sources.
           Working directory: <workdir>"
```

这将生成：`evidence-verification-report.md`

---

### 阶段 5：假设验证循环

```python
retry_count = 0
while retry_count < max_retries:
    # Find latest hypothesis file
    hypothesis_file = find_latest_file(f"{workdir}/hypothesis-*.md")

    # Spawn checker
    Task: oss-hypothesis-checker-agent
      Prompt: "Validate hypothesis against verified evidence.
               Working directory: <workdir>
               Hypothesis file: {hypothesis_file}"

    # Check result
    if file_exists(f"{workdir}/hypothesis-*-confirmed.md"):
        # ACCEPTED
        break

    elif file_exists(f"{workdir}/hypothesis-*-rebuttal.md"):
        # REJECTED
        rebuttal = read_file(rebuttal_file)

        # Re-invoke hypothesis former with feedback
        Task: oss-hypothesis-former-agent
          Prompt: "Revise hypothesis for <research question>.
                   Working directory: <workdir>
                   Previous rebuttal: {rebuttal}"

        retry_count += 1
        continue

if retry_count >= max_retries:
    # Max retries exceeded
    print(f"Reached max retries ({max_retries}), proceeding with current hypothesis")
```

---

### 阶段 6：生成报告

启动报告生成代理：

```
Task: oss-report-generator-agent
  Prompt: "Generate final forensic report.
           Working directory: <workdir>"
```

这将生成：`forensic-report.md`

---

### 阶段 7：完成

通知用户：
```
Investigation complete!

Report location: .out/oss-forensics-<timestamp>/forensic-report.md

Key outputs:
- evidence.json - All collected evidence
- evidence-verification-report.md - Verification results
- hypothesis-*.md - Analysis iterations
- forensic-report.md - Final report with timeline, attribution, IOCs
```

---

## 错误处理

- **BigQuery 身份验证失败**：停止，并显示凭据设置说明
- **GitHub API 受到速率限制**：继续使用其他来源，并在报告中注明此限制
- **仓库克隆失败**：在证据中注明，并继续调查
- **超过最大重试次数**：根据当前假设生成报告，并注明不确定性
- **Agent 启动失败**：停止，并向用户报告错误，包括 Agent 名称和错误消息

---

## 关键规则

1. **你是唯一的编排者** - 所有 Agent 均由你启动，Agent 绝不能启动其他 Agent
2. **尽可能并行启动** - 在阶段 2 中，使用一条包含多个 Task 调用的消息
3. **等待完成** - 当前 Agent 完成之前，不要进入下一阶段
4. **传递工作目录** - 每个 Agent 都需要 workdir 路径
5. **检查证据请求** - 假设构建 Agent 可能会请求更多证据，而不是直接形成假设
6. **遵守限制** - 遵循 max_followups 和 max_retries 标志

---

## 执行示例

```
User: /oss-forensics "Investigate lkmanka58's activity on aws/aws-toolkit-vscode on July 13, 2025"

Phase 0: ✓ Run init script → workdir: .out/oss-forensics-20251130-143022/
Phase 1: ✓ Parse prompt → repo=aws/aws-toolkit-vscode, actor=lkmanka58, date=2025-07-13
Phase 2: ✓ Spawn 4 investigators in parallel → collected 42 evidence items
Phase 3: ✓ Hypothesis former → wrote hypothesis-001.md
Phase 4: ✓ Verifier → 40/42 verified
Phase 5: ✓ Checker → REJECTED → Former revises → Checker → ACCEPTED
Phase 6: ✓ Report generator → forensic-report.md
Phase 7: ✓ Inform user

Result: Complete forensic report ready
```