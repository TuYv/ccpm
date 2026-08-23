---
name: prior-auth-packet-builder
description: Build a concise prior authorization packet from local case files and payer policy docs.
---
# 事先授权资料包构建器

当病例需要事先授权审核、转诊验证、影像检查审核或付款方特定政策核查时，请使用此技能。

## 工作流程

1. 检查 `case/scenario.json` 和 `case/transcript.txt`。
2. 在 `policies/` 中搜索付款方、事先授权、转诊、影像检查和 PPO 相关指南：
   - 将首选搜索命令和备用命令作为一条 shell 命令运行：
     `rg -n -i 'prior authorization|prior-auth|imaging|referral|billing|PPO|Blue Cross' policies ||
     grep -RniE 'prior authorization|prior-auth|imaging|referral|billing|PPO|Blue Cross' policies`。
   - `rg` 启动器或引导程序失败并不能证明不存在匹配的政策。
3. 仅阅读最相关的政策文件。
4. 创建 `output/policy_findings.md`，并使用以下完全一致的标题：
   - `## Case summary`
   - `## Matched policy files`
   - `## Prior authorization`
   - `## Referral`
   - `## Missing information`
   按文件名引用每个匹配的政策。
5. 创建 `output/human_review_checklist.md`，其中包含：
   - 人工审核员应核实的内容
   - 应告知患者的内容
   - 应由哪个队列负责处理该病例
6. 仅在两个产物均已存在后调用 `finalize_policy_packet`。

## 规则

- 优先使用针对性搜索，而不是广泛读取文件。
- 仅当 `rg` 无法完成搜索时，才使用针对性的 `grep -RniE` 备用命令。
- 仅引用你实际检查过的政策文件。
- 输出应简洁且便于执行。
- 只有当 `finalize_policy_packet` 成功时，工作流程才算完成。
- 如果转诊状态为待处理且事先授权情况不明确，建议进行人工审核。