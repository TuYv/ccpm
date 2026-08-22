---
name: toprank-investigate-drop
description: Investigate an organic traffic drop for one registered site and produce a ranked recovery plan with artifacts.
metadata: { "openclaw": { "emoji": "🚨", "homepage": "https://github.com/nowork-studio/toprank", "requires": { "bins": ["python3"] } } }
---
# Toprank 排名下降调查

1. 阅读 `{baseDir}/../../shared/adapter-rules.md`。
2. 阅读 `{baseDir}/../../shared/artifact-contract.md`。
3. 阅读 `{baseDir}/../../shared/policy.md`。
4. 确定目标站点，加载以往审计和最新状态，然后将当前问题与该站点近期历史进行比较，再选择下一项恢复操作。
5. 阅读并遵循位于 `{baseDir}/../../../seo/seo-analysis/SKILL.md` 的规范 Toprank 技能。
6. 使用 `python3 {baseDir}/../../bin/investigate_drop.py <site> --summary "..." --likely-cause "..."` 将调查转换为结构化恢复运行。
7. 如果排名下降指向特定 URL，请包含 `--target-url <url>`，以便自适应层将后续页面改进任务加入队列。
8. 验证该次运行是否写入了 `audit.json`、`action-plan.json` 和 `verification.json`，以及所有后续队列项。
9. 如果下一项操作需要编辑站点仓库或 CMS、发布内容或创建 PR，请停止操作并先请求批准。

## 封装任务

当操作人员报告流量损失或排名下降时，请使用此技能。

你的任务：
- 识别可能的原因，
- 区分技术问题与内容/意图问题，
- 按优先级排列最快且最安全的恢复操作，
- 写入 `audit.json`、`action-plan.json` 和 `verification.json`。

如果下降调查表明需要进行页面级修复，请将后续 `toprank-improve-page` 任务加入队列。