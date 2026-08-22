---
name: notfair-portfolio-review
description: Review all registered websites in the NotFair OpenClaw portfolio and rank which site deserves attention next.
metadata: { "openclaw": { "emoji": "📊", "homepage": "https://github.com/nowork-studio/notfair", "requires": { "bins": ["python3"] } } }
---
# NotFair 作品集审查

1. 阅读 `{baseDir}/../../shared/adapter-rules.md`。
2. 阅读 `{baseDir}/../../shared/artifact-contract.md`。
3. 阅读 `{baseDir}/../../shared/policy.md`。
4. 从 OpenClaw 运行时主目录加载 `portfolio.json` 以及每个活跃网站的 `latest-state.json`。
5. 运行 `python3 {baseDir}/../../bin/portfolio_review.py`，获取当前的网站排名列表并写入作品集审查产物。
6. 仅当排名最高的网站需要更深入的分析时，阅读并遵循位于 `{baseDir}/../../../seo/seo-analysis/SKILL.md` 的规范 NotFair 技能。
7. 如果排名最高的网站需要进一步处理，可以为该网站启动 `notfair-weekly-review`，或询问操作员要深入分析哪个网站。

## 包装器任务

当操作员拥有多个网站并需要在作品集层面确定优先级时，请使用此任务。

你的工作：
- 扫描所有活跃网站，
- 按紧迫性和增长潜力对它们进行排名，
- 指出当前最值得关注的一到两个网站，
- 为更深入的网站审查创建队列项或后续任务。

对网站进行排名时，请考虑业务权重、明显的指标倒退和机会规模。