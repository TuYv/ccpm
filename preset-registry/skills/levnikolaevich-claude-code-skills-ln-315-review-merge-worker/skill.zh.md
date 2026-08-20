---
name: ln-315-review-merge-worker
description: "Use when an evaluation run must merge research, findings, documentation, and repair outputs into one verified result."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此 Skill 目录。

**类型：** L3 工作单元
**类别：** 3XX 规划

# 审查合并工作单元

## 必读内容

**必须阅读：** 加载 `references/evaluation_worker_runtime_contract.md`、`references/evaluation_summary_contract.md`

## 目的

- 在只读证据通道通过汇合屏障后对其进行合并
- 根据既往审查历史去除重复内容
- 为协调器生成一份经过验证的汇总结果

## 等待/耐心协议

此工作单元不会启动智能体。它会在评估运行时屏障之后使用工作单元摘要和现有的智能体结果产物。不要仅因经过了一段时间就将智能体标记为失败；仅接受运行时解析后的状态或结果元数据作为完成信号。

## 智能体发现项验证

对于每条智能体建议：
- 将传输、身份验证、权限、无输出超时或工具缺失结果视为运维证据，而非领域发现项
- 接受之前，针对代码、文档、测试、运行时日志或工作单元摘要验证有依据的主张
- 拒绝无依据、过时、重复或使用架构垫片的建议
- 绝不重写由运行器管理的结果文件

## 运行时

运行时系列：
- `evaluation-worker-runtime`

清单必填字段：
- `identifier`
- `phase_order`
- `summary_kind=review-merge`
- `operation=merge`

建议的 `phase_order`：
1. `PHASE_0_CONFIG`
2. `PHASE_1_LOAD_WORKER_RESULTS`
3. `PHASE_2_DEDUPLICATE_AND_VERIFY`
4. `PHASE_3_WRITE_SUMMARY`
5. `PHASE_4_SELF_CHECK`

## 工作流

### 阶段 1：加载工作单元结果

1. 加载所有输入工作单元摘要（ln-311、ln-312、ln-313、ln-314）。
2. 加载所有已启动外部智能体的发现项。
3. 加载 `.hex-skills/agent-review/review_history.md` 中既往的审查条目。

### 阶段 2：去重并验证

1. 对当前发现项进行去重，比较范围包括：
   - 自身分析
   - 工作单元发现项
   - 智能体发现项
   - 既往审查历史
2. 对于每条智能体建议：根据智能体发现项验证策略进行独立验证。
3. 将每条建议标记为 `AGREE` 或 `REJECT`。
4. **架构门禁：** 在接受任何标记为 AGREE 的建议之前，验证：“这是否直接实现了正确的架构，而没有使用向后兼容垫片或遗留规避方案？”如果建议引入了不必要的兼容层，则将 AGREE 改为 REJECT。
5. 拒绝无依据的发现项。

### 阶段 3：写入摘要

生成 `summary_kind=review-merge`。

有效负载必须包含：
- `worker=ln-315`
- `status`
- `operation=merge`
- `warnings`

在可用时优先使用以下字段：
- `merge_summary.accepted_count`
- `merge_summary.rejected_count`
- `merge_summary.dedup_removed`
- `merge_summary.architecture_gate_rejections`

将更新后的审查摘要保存至 `.hex-skills/agent-review/review_history.md`。

### 阶段 4：自检

1. 验证去重已完成。
2. 验证已对所有标记为 AGREE 的建议应用架构门禁。
3. 仅在写入摘要后记录 `pass=true`。

## 完成定义

- [ ] 已加载输入工作单元摘要
- [ ] 已根据关键验证要求加载并验证智能体结果
- [ ] 已移除重复项（与发现项及审查历史进行比对）
- [ ] 已对所有接受的建议应用架构门禁
- [ ] 审查摘要已保存至 `review_history.md`
- [ ] 已写入 `review-merge` 摘要
- [ ] 自检已通过

**版本：** 1.0.0
**最后更新：** 2026-04-10