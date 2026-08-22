---
name: toprank-portfolio-review
description: Review all registered websites in the Toprank OpenClaw portfolio and rank which site deserves attention next.
metadata: { "openclaw": { "emoji": "📊", "homepage": "https://github.com/nowork-studio/toprank", "requires": { "bins": ["python3"] } } }
---
# Toprank 站点组合审查

1. 阅读 `{baseDir}/../../shared/adapter-rules.md`。
2. 阅读 `{baseDir}/../../shared/artifact-contract.md`。
3. 阅读 `{baseDir}/../../shared/policy.md`。
4. 从 OpenClaw 运行时主目录加载 `portfolio.json`，以及每个活跃站点的 `latest-state.json`。
5. 运行 `python3 {baseDir}/../../bin/portfolio_review.py`，获取当前已排序的站点列表并写入站点组合审查产物。
6. 仅当排名最高的站点需要更深入的分析时，阅读并遵循位于 `{baseDir}/../../../seo/seo-analysis/SKILL.md` 的规范 Toprank Skill。
7. 如果排名最高的站点需要更深入的工作，请为该站点启动 `toprank-weekly-review`，或询问操作人员要深入分析哪个站点。

## 包装器任务

当操作人员拥有多个网站，并且需要在站点组合层面确定优先级时，请使用此任务。

你的工作：
- 扫描所有活跃站点，
- 根据紧迫性和增长潜力对它们进行排序，
- 指出当前最值得关注的一到两个站点，
- 为更深入的站点审查创建队列项或后续任务。

对站点进行排序时，请考虑业务权重、明显的指标倒退以及机会规模。