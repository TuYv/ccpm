---
name: notfair-weekly-review
description: Run a weekly SEO review for one registered website, write audit artifacts, and choose the next best safe action.
metadata: { "openclaw": { "emoji": "📈", "homepage": "https://github.com/nowork-studio/notfair", "requires": { "bins": ["python3"] } } }
---
# NotFair 每周审查

1. 阅读 `{baseDir}/../../shared/adapter-rules.md`。
2. 阅读 `{baseDir}/../../shared/artifact-contract.md`。
3. 阅读 `{baseDir}/../../shared/policy.md`。
4. 阅读 `{baseDir}/../../shared/recommendation-quality.md`。
5. 阅读 `{baseDir}/../../../seo/shared/seo-best-practices.md`，并使用其中的 MECE 分区说明为什么首要行动属于正确类型的 SEO 工作。
6. 解析目标 `site_id`；如果未指定站点且有多个活跃站点，请先运行站点组合审查，或询问用户要审查哪个站点。
7. 阅读并遵循位于 `{baseDir}/../../../seo/seo-analysis/SKILL.md` 的规范 NotFair 技能。
8. 优先使用自动化运行器：
   - `python3 {baseDir}/../../bin/weekly_review.py <site_id-or-url>`
   - 如果站点配置中尚未包含 GSC 资源，请添加 `--gsc-property`
   - 使用已保存的 GSC 分析 JSON 固件进行测试时，请添加 `--analysis-file`
9. 运行器将自动生成并持久化审查产物，并在适用时自动针对最主要的 CTR/摘要/内容机会执行深度诊断。
10. 验证本次运行是否写入了 `audit.json`、`action-plan.json` 和 `verification.json`，刷新了 `latest-state.json`，并创建了队列项。首要提案在获批前应包含 `best_practice_alignment`，以及涵盖 SERP、当前摘要、首屏内容和零点击检查的 `deep_dive`。
11. 如果运行器的标准输出包含 `user_message`，请将其用作面向用户的摘要。如果其中包含 `business_context_request`，请在聊天中明确提出这些问题；不要只报告产物路径，也不要只说业务上下文不完整。
12. 如果下一步行动需要编辑站点代码仓库或 CMS、发布内容或创建 PR，请停止操作并先请求批准。缺少业务上下文会阻止批准和编辑，但不会阻止调查。

## 包装器任务

将此流程用作单个站点的默认每周循环。

你的任务：
- 加载站点配置、目标和最新状态，
- 使用规范的 SEO 分析技能运行一次全新审查，
- 找出最主要的三个问题，
- 仅确定一个优先级最高的下一步最佳行动，
- 写入 `audit.json`、`action-plan.json` 和 `verification.json`。

如果可行，还应创建一个用于 14 天或 28 天后续检查的队列项。