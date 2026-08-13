---
name: acceptance-orchestrator
description: Use when a coding task should be driven end-to-end from issue intake through implementation, review, deployment, and acceptance verification with minimal human re-intervention.
risk: safe
source: community
date_added: "2026-03-12"
---
# 验收编排器

## 概述

将编码工作编排为一个状态机，仅在使用证据验证验收标准或任务被明确升级时才结束。

核心规则：**不要以“代码变更”为优化目标，而要以“已验证 DoD”为优化目标。**

## 适用场景
- 任务已有 issue 或明确的验收标准，并且应尽量少人工干预地端到端运行。
- 你需要在实现、评审、部署和最终验证之间进行结构化交接。
- 你希望有明确的停止条件和升级机制，而不是静默地部分完成。

## 必需的子技能

- `create-issue-gate`
- `closed-loop-delivery`
- `verification-before-completion`

可选支持技能：
- `deploy-dev`
- `pr-watch`
- `pr-review-autopilot`
- `git-ship`

## 输入项

需要以下输入：
- issue id 或 issue body
- issue 状态
- 验收标准（DoD）
- 目标环境（默认 `dev`）

固定默认值：
- 最大迭代轮次 = `2`
- PR 评审轮询 = `3m -> 6m -> 10m`

## 状态机

- `intake`
- `issue-gated`
- `executing`
- `review-loop`
- `deploy-verify`
- `accepted`
- `escalated`

## 工作流

1. **Intake**
   - 阅读 issue 并提取任务目标 + DoD。

2. **Issue gate**
   - 使用 `create-issue-gate` 逻辑。
   - 如果 issue 不是 `ready` 或执行闸门为 `allowed`，则立即停止。
   - 当 issue 仍为 `draft` 时，不要执行任何实现。

3. **Execute**
   - 交由 `closed-loop-delivery` 进行实现和本地验证。

4. **Review loop**
   - 如果 PR 反馈相关，则按批次轮询窗口处理：
     - 等待 `3m`
     - 然后 `6m`
     - 再然后 `10m`
   - 在 `10m` 这一轮后，停止等待并一次性处理所有可见评论。

5. **部署与运行时验证**
   - 如果 DoD 依赖运行时行为，默认仅部署到 `dev`。
   - 使用真实日志/API/Lambda 行为进行验证，而非假设。

6. **Completion gate**
   - 在任何完成声明之前，需进行 `verification-before-completion`。
   - 没有新证据，不得宣称成功。

## 停止条件

仅当每一项验收标准都有匹配证据时，才转入 `accepted`。

在以下任一情况发生时转入 `escalated`：
- DoD 在 `2` 个完整轮次后仍然失败
- 缺少 secrets/权限/外部依赖阻塞进度
- 任务需要生产环境操作或破坏性操作批准
- 评审指令冲突且无法同时满足

## 人工干预点

以下情况务必停止并等待人工确认：
- 超出约定范围的 prod/stage 部署
- 破坏性 git/数据操作
- 计费或安全态势变更
- 缺少用户提供的验收标准

## 输出契约

报告状态时，始终包含：
- `Status`: intake / executing / accepted / escalated
- `Acceptance Criteria`: pass/fail 检查清单
- `Evidence`: 命令、日志、API 结果或运行时证明
- `Open Risks`: 仍不确定的内容
- `Need Human Input`: 若被阻塞，则需要的最小下一个决策

在状态为 `accepted` 之前，不要报告“done”。

## 局限性
- 仅在任务明显符合上述范围时使用此技能。
- 不要把该输出视为环境特定验证、测试或专家审查的替代。
- 如果缺少所需输入、权限、安全边界或成功标准，请停止并请求澄清。
