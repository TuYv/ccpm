---
name: claude-blog-brain
description: >
  Scaffold and operate Claude Blog Brain, a source-cited Obsidian brain for blog content creation, optimization, and management dual-optimized for Google rankings (E-E-A-T, the 2026 core updates) and AI citations (GEO/AEO), spanning writing, rewriting and freshness, SERP-informed briefs and outlines, editorial calendars and strategy, semantic topic clusters, schema and internal linking, multilingual publishing, the FLOW framework, factchecking, personas, distribution, and the blog delivery contract, grounded in the claude-blog skill.
  Use when the user says "claude-blog-brain", "Claude Blog Brain", "create a blog content creation, optimization, and management dual-optimized for Google rankings (E-E-A-T, the 2026 core updates) and AI citations (GEO/AEO), spanning writing, rewriting and freshness, SERP-informed briefs and outlines, editorial calendars and strategy, semantic topic clusters, schema and internal linking, multilingual publishing, the FLOW framework, factchecking, personas, distribution, and the blog delivery contract, grounded in the claude-blog skill brain",
  "import sources", "synthesize plan", "render report", or wants a persistent
  vault-backed operating system for blog content creation, optimization, and management dual-optimized for Google rankings (E-E-A-T, the 2026 core updates) and AI citations (GEO/AEO), spanning writing, rewriting and freshness, SERP-informed briefs and outlines, editorial calendars and strategy, semantic topic clusters, schema and internal linking, multilingual publishing, the FLOW framework, factchecking, personas, distribution, and the blog delivery contract, grounded in the claude-blog skill.
argument-hint: "new | demo | ingest | synthesize | report | visuals | lint | next"
license: Custom license
---
# Claude Blog Brain

优先操作知识库。更改笔记前，请先阅读 `CODEX.md`、`wiki/hot.md` 和 `wiki/index.md`。

## 命令

```bash
/claude-blog-brain new <client-slug> --owner <name>
/claude-blog-brain demo
/claude-blog-brain ingest --vault <path> --file <source>
/claude-blog-brain synthesize --vault <path>
/claude-blog-brain report --vault <path>
/claude-blog-brain visuals --vault <path>
/claude-blog-brain lint --vault <path>
/claude-blog-brain next --vault <path>
```

从源代码检出运行时的等效命令：

```bash
claude-blog-brain new <client-slug> --owner <name>
claude-blog-brain demo
claude-blog-brain ingest --vault <path> --file <source>
claude-blog-brain synthesize --vault <path>
claude-blog-brain report --vault <path> --html-only
```

## 必须遵守的操作规则

1. 阅读 `<vault>/CODEX.md`。
2. 阅读 `<vault>/wiki/hot.md`。
3. 阅读 `<vault>/wiki/index.md`。
4. 将 `.raw/` 保留为不可变的源材料。
5. 切勿在知识库中存储凭据。
6. 如果没有带日期的可信来源，切勿提出特定领域的断言。
7. 确保 `hot`、`index`、`overview` 和 `log` 保持最新。
8. 在 `references/source-ledger.json` 中记录研究证据。
9. 在 `references/adapter-manifest.json` 中记录领域适配器的完成情况。

## 脚本映射

- `new` -> `python scripts/scaffold_vault.py`
- `demo` -> `python scripts/build_demo_vault.py`
- `ingest` -> `python scripts/ingest_source.py`
- `synthesize` -> `python scripts/synthesize_brain.py`
- `report` -> `python scripts/render_brain_report.py`
- `visuals` -> `python scripts/generate_vault_visuals.py`
- `lint` -> `python scripts/lint_vault.py`
- `next` -> `python scripts/guide_next_action.py`

## 质量门槛

- 不保证排名或流量；内容成果具有概率性，绝非确定无疑
- 仓库制品中不得包含凭据、令牌、API 密钥或客户的私密内容
- 不得修改 CMS、GSC、GA4 或发布平台；该知识大脑仅提供建议，并且是只读的
- 如果没有带日期的来源、置信度和回滚说明，则不得提出建议
- 不得将已弃用的建议（HowTo schema、已停止的 FAQ 富媒体搜索结果、FID）作为当前建议
- 不得捏造或引用无来源的统计数据，也不得将泛泛而谈、缺乏依据或低质量的生成式填充内容当作事实

除非 `scripts/audit_brain.py --require
market-ready` 通过，否则不要声称该知识大脑已达到可投放市场的状态。脚手架并不等同于完整的知识大脑。

## 研究更新

针对 Google 算法更新和 Search Central 政策，每月更新一次；针对 E-E-A-T 框架、schema 弃用情况以及 GEO/AEO 引用声明，每次发布前更新；针对 claude-blog skill，则在变更日志更新时同步更新

## 社区

如有问题或需要支持，请使用公开的项目 Discussions：
https://github.com/AgriciDaniel/claude-blog/discussions。
请通过公开的 Issues 报告可复现的缺陷：
https://github.com/AgriciDaniel/claude-blog/issues。