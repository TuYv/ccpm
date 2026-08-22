---
name: toprank-weekly-review
description: Run a weekly SEO review for one registered website, write audit artifacts, and choose the next best safe action.
metadata: { "openclaw": { "emoji": "📈", "homepage": "https://github.com/nowork-studio/toprank", "requires": { "bins": ["python3"] } } }
---
# Toprank 每周审查

1. 阅读 `{baseDir}/../../shared/adapter-rules.md`。
2. 阅读 `{baseDir}/../../shared/artifact-contract.md`。
3. 阅读 `{baseDir}/../../shared/policy.md`。
4. 阅读 `{baseDir}/../../shared/recommendation-quality.md`。
5. 阅读 `{baseDir}/../../../seo/shared/seo-best-practices.md`，并使用其中的 MECE 分类来解释为什么首要行动属于正确类型的 SEO 工作。
6. 确定目标 `site_id`；如果未指定站点且有多个站点处于活跃状态，请先运行站点组合审查，或询问用户要审查哪个站点。
7. 阅读并遵循位于 `{baseDir}/../../../seo/seo-analysis/SKILL.md` 的规范 Toprank 技能。
8. 优先使用自动化运行器：
   - `python3 {baseDir}/../../bin/weekly_review.py <site_id-or-url>`
   - 如果站点配置中尚未包含 GSC 资源，请添加 `--gsc-property`
   - 使用已保存的 GSC 分析 JSON 固定测试数据进行测试时，请添加 `--analysis-file`
9. 运行器将自动生成并持久化审查产物，包括在适用时自动对首要的 CTR、摘要或内容机会进行深入诊断。
10. 验证本次运行是否写入了 `audit.json`、`action-plan.json` 和 `verification.json`，刷新了 `latest-state.json`，并创建了队列项。首要提案在获批前应包含 `best_practice_alignment`，以及带有 SERP、当前摘要、首屏和零点击检查的 `deep_dive`。
11. 如果运行器的标准输出包含 `user_message`，请将其用作面向用户的摘要。如果其中包含 `business_context_request`，请在聊天中明确提出这些问题；不要只是报告产物路径或声称业务背景信息不完整。
12. 如果下一步行动需要编辑站点仓库或 CMS、发布内容或创建 PR，请停止操作并先请求批准。缺少业务背景信息会阻止批准或编辑，但不会阻止调查。

## 包装器任务

将此流程用作单个站点的默认每周循环。

你的任务：
- 加载站点配置、目标和最新状态，
- 使用规范 SEO 分析技能运行全新的审查，
- 找出最主要的三个问题，
- 明确优先选择一个最佳后续行动，
- 写入 `audit.json`、`action-plan.json` 和 `verification.json`。

如有可能，还应创建一个队列项，用于在 14 天或 28 天后进行后续检查。