---
name: acceptance-orchestrator
description: Use when a coding task should be driven end-to-end from issue intake through implementation, review, deployment, and acceptance verification with minimal human re-intervention.
risk: safe
source: community
date_added: "2026-03-12"
---
# 接受编排器

## 概览

将编码工作编排为一个状态机，仅在接受标准经由证据验证通过或任务被明确升级时才结束。

核心规则：**不要以“代码已修改”为优化目标；以“DoD 已证明”为优化目标。**

## 何时使用
- 任务已有问题单或明确的接受标准，并且应在最小化人工干预下端到端运行。
- 你需要在实现、评审、部署与最终验证之间实现结构化交接。
- 你希望有明确的停止条件和升级机制，而不是静默的部分完成。

## 所需子技能

- `create-issue-gate`
- `closed-loop-delivery`
- `verification-before-completion`

可选支撑技能：
- `deploy-dev`
- `pr-watch`
- `pr-review-autopilot`
- `git-ship`

## 输入

需要以下输入：
- 问题 ID 或问题正文
- 问题状态
- 接受标准（DoD）
- 目标环境（`dev` 默认）

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

1. **接收（Intake）**
   - 阅读问题并提取任务目标 + DoD。

2. **问题门禁（Issue gate）**
   - 使用 `create-issue-gate` 逻辑。
   - 如果问题不是 `ready` 或执行门禁未 `allowed`，则立即停止。
   - 在问题仍处于 `draft` 状态时，不得实现任何内容。

3. **执行（Execute）**
   - 交给 `closed-loop-delivery` 进行实现与本地验证。

4. **评审循环（Review loop）**
   - 如果 PR 反馈相关，则按以下方式分批轮询：
     - 等待 `3m`
     - 然后是 `6m`
     - 再到 `10m`
   - 在 `10m` 轮次后，停止等待并一起处理所有可见评论。

5. **部署与运行时验证（Deploy and runtime verification）**
   - 若 DoD 依赖运行时行为，默认仅部署到 `dev`。
   - 使用真实日志/API/Lambda 行为进行验证，而非凭假设。

6. **完成门禁（Completion gate）**
   - 在任何“完成”声明之前，要求 `verification-before-completion`。
   - 没有新证据不得宣称成功。

## 停止条件

仅当每个接受标准都有匹配的证据时，才能转入 `accepted`。

以下任一情况转入 `escalated`：
- DoD 在 `2` 轮完整周期后仍然失败
- 缺失凭据/权限/外部依赖阻塞进展
- 任务需要生产环境操作或破坏性操作审批
- 评审指令存在冲突且无法同时满足

## 人工门禁

始终在以下情况停下并等待人工确认：
- 超出约定范围的生产/预发布部署
- 破坏性 git/数据操作
- 计费或安全姿态变更
- 缺少用户提供的接受标准

## 输出约定

报告状态时，始终包含：
- `Status`：intake / executing / accepted / escalated
- `Acceptance Criteria`：pass/fail 清单
- `Evidence`：命令、日志、API 结果或运行时证据
- `Open Risks`：任何仍不确定的内容
- `Need Human Input`：若受阻，下一步最小决策点

除非状态为 `accepted`，否则不要报告“done”。

## 限制
- 仅在任务明显符合上述范围时使用该技能。
- 不要将输出视为替代特定环境验证、测试或专家评审。
- 如果缺少所需输入、权限、安全边界或成功标准，请停止并请求澄清。
