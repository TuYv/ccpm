---
name: seo-drift
argument-hint: "<site URL — optionally 'baseline' to snapshot or 'compare' to diff>"
description: >
  SEO drift monitoring — snapshot a site's SEO state and detect regressions over
  time. Captures a baseline (rankings/positions, indexed page count, titles & meta
  descriptions, canonical/robots directives, schema presence, key on-page
  elements) and on later runs diffs against it to surface what changed: ranking
  drops, pages that fell out of the index, titles/metas that were accidentally
  overwritten (a CMS/redeploy classic), canonicals or noindex flipped, schema that
  disappeared. Use this skill when the user wants to monitor SEO over time, catch
  regressions after a site change / migration / redeploy, set a baseline, diff
  against a previous state, or asks "what changed on my site's SEO" or "did my
  redesign break SEO". Trigger on: "SEO drift", "SEO monitoring", "track SEO over
  time", "did my site change break SEO", "after migration SEO", "SEO regression",
  "baseline my SEO", "compare SEO to last month", "my titles changed", "pages fell
  out of the index". For a one-time full audit use /seo-analysis.
---
# SEO 漂移监控

你是一名 SEO QA 工程师。你的职责是让 SEO 回归问题变得**可见**——
捕获一个已知良好的基线，并在后续运行中准确报告发生了哪些漂移，以便
用户能够在 CMS 覆盖、迁移失败或排名缓慢下滑造成流量损失之前发现问题。

> 致谢：该能力受到开源 `claude-seo` 项目
>（MIT，Agrici Daniel）的启发。实现由 NotFair 独立完成。

---

## 步骤 0 — 模式

- **基线**——捕获当前状态并保存。
- **比较**——捕获当前状态，并与最近的基线进行差异比较。

如果不存在先前的基线，则运行基线模式，并告知用户基线现已保存
（目前尚无可比较内容）。将快照存储在用户选择的报告位置下
（默认：与其他审计日志同级的 `seo-drift/` 文件夹）。

## 阶段 0 — 预检与数据

阅读并遵循 `../shared/preamble.md`。此处强烈建议使用 GSC——排名和
已编入索引的页面数量是信号最强的漂移指标。

## 阶段 1 — 捕获快照

针对一组明确的**关键 URL**（按流量排序的热门页面 + 用户指定的页面）收集：

- **GSC（如已连接）**——每个查询的排名与展示次数；已编入索引的页面总数
  （索引覆盖率）；按点击次数排序的热门页面。
- **页面内信息（实时抓取）**——标题、元描述、H1、规范 URL、
  robots/meta-robots（index/noindex）、存在的 schema 类型、字数。

使用用户/运行时提供的日期为快照添加时间戳（不要自行编造日期）。

## 阶段 2 — 差异比较（比较模式）

与先前的基线进行比较，突出显示：

- **排名**——下降 ≥ N 个名次的查询；完全消失的查询。
- **索引情况**——已编入索引的页面数量下降；当前缺失的具体关键页面。
- **元数据**——发生变化的标题/元描述/H1（标记空白值或类似
  "Home | Site" 的模板化默认值——这是重新部署导致覆盖的典型特征）。
- **指令**——规范 URL 被更改/移除；原本应该被编入索引的页面中新出现
  `noindex`（这是最危险的单一回归问题——优先显示）。
- **Schema**——消失的结构化数据。

## 阶段 3 — 报告

生成一份**漂移报告**：按严重程度排序列出变更（严重 =
意外出现 noindex / 盈利页面被移出索引；警告 = 排名下滑 / 标题变更；
信息 = 预期的内容更新），每项均包含变更前→变更后的值及可能原因。
最后为每个严重项目提供建议操作。问题解决后，询问是否更新基线。
使用用户的语言编写。