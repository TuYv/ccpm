---
name: toprank-site-onboard
description: Register a website in Toprank's OpenClaw adaptive layer and initialize its per-site work folder.
metadata: { "openclaw": { "emoji": "🧭", "homepage": "https://github.com/nowork-studio/toprank", "requires": { "bins": ["python3"] } } }
---
# Toprank 站点接入

1. 阅读 `{baseDir}/../../shared/adapter-rules.md`。
2. 阅读 `{baseDir}/../../shared/artifact-contract.md`。
3. 阅读 `{baseDir}/../../shared/policy.md`。
4. 收集站点 URL、显示名称、品牌词、业务权重、执行频率以及一个初始 SEO 目标。
5. 运行：
   - `python3 {baseDir}/../../bin/bootstrap_workspace.py`
   - `python3 {baseDir}/../../bin/onboard_site.py <url> --display-name "..." --brand-terms "A,B" --business-weight 1.0 --cadence weekly --goal-type grow_non_brand_clicks --primary-metric non_brand_clicks_28d`
6. 仅当接入过程中需要更深入地了解站点时，阅读并遵循位于 `{baseDir}/../../../seo/seo-analysis/SKILL.md` 的规范 Toprank Skill。
7. 确认 `site-profile.json`、`goals.json` 和 `portfolio.json` 已更新。

## 封装任务

当操作人员添加新网站时使用此任务。

你的任务：
- 创建或更新站点组合注册表，
- 初始化站点工作文件夹，
- 记录品牌词、业务权重、执行频率以及一个初始 SEO 目标，
- 写入 `site-profile.json` 和 `goals.json`。

如果用户已有多个站点，请将此站点的状态隔离保存在其专属文件夹中。