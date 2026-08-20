---
name: ln-510-quality-coordinator
description: "Use when coordinating story quality evaluation with mandatory research, worker summaries, agent review, regression evidence, and bounded refinement."
license: MIT
---
> **路径：**文件路径（`references/`、`../ln-*`）均相对于此技能目录。

**类型：** L2 协调器
**类别：** 5XX 质量

# 质量协调器

用于故事质量审查的评估平台协调器。

## 必读

**必读：**加载 `references/evaluation_coordinator_runtime_contract.md`、`references/evaluation_summary_contract.md`、`references/evaluation_research_contract.md`、`references/loop_health_contract.md`
**必读：**加载 `references/agent_delegation_pattern.md`
**必读：**加载 `references/criteria_validation.md`、`references/gate_levels.md`

智能体审查策略：运行健康检查；当没有可用顾问时，记录跳过原因；在作出裁决前核实每一项顾问声明；将传输、身份验证或工具故障视为操作方证据，而不是质量发现。仅当调试评估运行时之外的生命周期/存活性细节时，才加载 `references/agent_review_workflow.md`。

## 目的

- 调用 `ln-511-code-quality-checker`
- 调用 `ln-512-tech-debt-cleaner`
- 调用 `ln-513-regression-checker`
- 调用 `ln-514-test-log-analyzer`
- 在收集只读证据的同时，并行运行内联智能体审查
- 保持合并、优化和裁决按顺序执行
- 返回规范化的质量结果

## 输入

主要输入：
- `storyId`
- `--previous-cycle-focus`（可选，来自 ln-500）：上一轮 FAIL 周期中的阻塞类别，以逗号分隔

状态筛选器：
- `To Review`

## 关键规则

不允许使用跳过研究的快速通道。

每次质量检查都必须包括：
1. 官方文档或标准
2. MCP Ref
3. 涉及框架或库时使用 Context7
4. 当前的 Web 最佳实践研究

## 运行时契约

运行时系列：
- `evaluation-runtime`

标识符：
- `quality-{storyId}`

阶段顺序：
1. `PHASE_0_CONFIG`
2. `PHASE_1_DISCOVERY`
3. `PHASE_2_READ_ONLY_EVIDENCE`
4. `PHASE_3_CLEANUP`
5. `PHASE_4_AGENT_BARRIER`
6. `PHASE_5_MERGE`
7. `PHASE_7_REFINEMENT`
8. `PHASE_8_VERDICT`
9. `PHASE_9_SELF_CHECK`

## 工作器调用（强制）

**宿主技能调用：**必须使用 `Skill(skill: "...", args: "...")` 进行委派。
- Claude：严格按照所示方式调用 Skill 工具。
- Codex：如果不存在 Skill 工具，则在可用技能中找到指定技能，读取其 `SKILL.md`，将 `args` 视为 `$ARGUMENTS`，执行该技能的工作流，然后携带其结果/产物返回此处。
- 不要内联工作器逻辑，也不要在未执行目标技能的情况下将工作器标记为完成。

使用 Skill 工具调用委派的工作器。不要在协调器中内联工作器逻辑。

TodoWrite 格式（强制）：
- `Resolve Story and build runtime manifest`
- `Load Story metadata and detect changed files`
- `Run quality checkers and research in parallel`
- `Apply safe tech-debt cleanup`
- `Sync agents and wait for all evidence`
- `Merge and deduplicate all findings`
- `Run bounded refinement loop`
- `Compute quality verdict and score`
- `Verify runtime cleanup and self-check`

代表性调用：

```text
Skill(skill: "ln-511-code-quality-checker", args: "{storyId}")
Skill(skill: "ln-512-tech-debt-cleaner", args: "{storyId}")
Skill(skill: "ln-513-regression-checker", args: "{storyId}")
Skill(skill: "ln-514-test-log-analyzer", args: "{storyId}")
```

## 工作流

### 阶段 0：配置

1. 解析 `storyId`。
2. 使用 `required_research=true` 构建评估运行时清单。
3. 启动 `evaluation-runtime`。

### 阶段 1：发现

1. 加载用户故事元数据和已完成的实现任务范围。
2. 检测已更改的文件和项目技术栈。
3. 在可用时为语义图建立索引。

### 阶段 2：只读证据

此阶段允许并行开展以下工作：
- 由协调器进行内联研究（依据 `references/evaluation_research_contract.md`）
- `ln-511-code-quality-checker`
- `ln-513-regression-checker`
- `ln-514-test-log-analyzer`
- 启动外部代理

规则：
- 研究是强制性的
- 工作进程摘要是唯一的完成信号
- 此阶段不进行合并或修改

当提供 `previous_cycle_focus` 时：
- 优先收集所列阻塞类别的证据。
- ln-511 代码质量检查器应首先关注指定区域。
- 这并不排除其他证据——只是调整其优先顺序。

### 阶段 3：清理

1. 仅在收集完只读证据后运行 `ln-512-tech-debt-cleaner`。
2. 清理仍须按顺序执行，因为它会修改文件。
3. 记录工作进程摘要和所有清理证据。

### 阶段 4：代理屏障

1. 通过 `evaluation-runtime` 同步代理。
2. 在所有必需代理均已解决或明确跳过之前，不得越过此屏障。
3. 将代理结果中的 `failure_class` 视为传输层证据：
   - `rate_limited`、`tool_missing`、`auth_missing`、`permission_denial` 和 `asked_question` 本身不属于质量 `FAIL` 发现。
   - 仅当存在输出、日志或会话证据时，`timeout_productive` 才能继续进入合并/审查。
   - 如果工作进程/代理反复出现相同失败且没有新产物，则在开始下一轮之前，通过循环健康检查暂停流程。

### 阶段 5：合并

合并输入：
- 内联研究证据
- `ln-511` 摘要
- `ln-512` 摘要
- `ln-513` 摘要
- `ln-514` 摘要
- 代理发现

规则：
- 评分前去重
- 拒绝没有依据的论断
- 安全性和正确性问题仍具有高优先级

### 阶段 6：精炼

精炼依据 `references/agents/prompt_templates/iterative_refinement.md` 和 `references/agents/prompt_templates/refinement_perspectives.md`，对每个流程采用两阶段状态机：
- 阶段 1（并行）：`dry_run_executor`、`new_dev_tester`、`adversarial_reviewer`
- 阶段 2（合并后）：`final_sweep`

规则：
- 阶段 1 并行运行，阶段 2 在合并后运行
- 生成的进程必须提供清理证据
- 不得跳过研究

### 阶段 7：结论

使用以下内容计算标准化质量结论：
- 代码质量
- 清理结果
- 代理审查
- 标准验证
- 代码检查工具结果
- 回归测试结果
- 日志分析结果

最终结论值：
- `PASS`
- `CONCERNS`
- `FAIL`

### 阶段 8：自检

必需检查：
- [ ] runtime 已启动
- [ ] 强制研究已完成
- [ ] 已记录所有 worker 摘要
- [ ] 合并前所有必需的 agent 均已解决
- [ ] 已验证清理工作
- [ ] 适用时已记录优化过程
- [ ] 已编写 coordinator 摘要

## 摘要契约

写入 `summary_kind=evaluation-coordinator`。

推荐的 payload：
- `status`
- `final_result`
- `report_path`
- `worker_count`
- `agent_count`
- `issues_total`
- `severity_counts`
- `warnings`
- `cleanup_verified`
- `research_completed`

## 完成定义

- [ ] 评估 runtime 已启动
- [ ] 强制研究已完成
- [ ] 只读证据 worker 已完成
- [ ] 清理 worker 已完成或已说明理由
- [ ] agent 屏障已解决
- [ ] 合并已完成
- [ ] 已执行优化或明确说明未执行的理由
- [ ] 已计算最终裁定
- [ ] 已写入 `evaluation-coordinator` 摘要
- [ ] runtime 已完成

## 元分析

可选参考：仅当用户请求运行后元分析或协议格式的运行复盘时，才加载 `references/meta_analysis_protocol.md`。

如果在 coordinator 运行结束后收到请求，请按照协议第 7 节分析会话，并在最终质量裁定中包含协议格式的输出。

## 参考资料

- Runtime：`references/evaluation_coordinator_runtime_contract.md`、`references/evaluation_summary_contract.md`
- 研究：`references/evaluation_research_contract.md`
- Worker：`../ln-511-code-quality-checker/SKILL.md`、`../ln-512-tech-debt-cleaner/SKILL.md`、`../ln-513-regression-checker/SKILL.md`、`../ln-514-test-log-analyzer/SKILL.md`
- 质量标准：`references/criteria_validation.md`、`references/gate_levels.md`

---
**版本：** 7.0.0
**最后更新：** 2026-02-09