---
name: notfair-improve-page
description: Improve one URL inside a registered site by producing a focused diagnosis, proposal, and verification artifact.
metadata: { "openclaw": { "emoji": "🧱", "homepage": "https://github.com/nowork-studio/notfair", "requires": { "bins": ["python3"] } } }
---
# NotFair 页面改进

1. 阅读 `{baseDir}/../../shared/adapter-rules.md`。
2. 阅读 `{baseDir}/../../shared/artifact-contract.md`。
3. 阅读 `{baseDir}/../../shared/policy.md`。
4. 加载站点工作文件夹，然后聚焦目标 URL，并选择最适合该问题的规范页面级技能。
5. 阅读并遵循位于 `{baseDir}/../../../seo/seo-page/SKILL.md` 的规范 NotFair 技能。
6. 使用 `python3 {baseDir}/../../bin/improve_page.py <site> --url <url> --issue-summary "..." --proposal-summary "..."` 将页面诊断转换为结构化提案。
7. 如果你还有文件级编辑建议，请包含 `--patch-path` 和 `--patch-summary`，以便写入 `patch-set.json` 构件。
8. 验证本次运行是否写入了 `proposal.json` 和 `verification.json`，并在适用时写入了 `patch-set.json`。
9. 如果下一步操作需要编辑站点仓库或 CMS、发布内容或创建 PR，请停止操作并先请求批准。

## 封装器任务

当操作者希望改进单个页面时，请使用此任务。

典型组合：
- 使用 `seo-page` 进行诊断，
- 使用 `meta-tags-optimizer` 生成标题/元描述候选方案，
- 使用 `schema-markup-generator` 提出结构化数据方案，
- 使用 `content-writer` 编写内容简报或改写草稿。

至少写入 `proposal.json` 和 `verification.json`。如果生成了补丁或文件级更改，还需写入 `patch-set.json`。