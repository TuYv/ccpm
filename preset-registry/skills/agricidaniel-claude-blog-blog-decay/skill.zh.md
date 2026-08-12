---
name: blog-decay
description: Detect content decay from Google Search Console exports by comparing current and previous page performance, flagging quarter-over-quarter traffic drops, dropped pages, and refresh, consolidate, prune, or query-shift actions. Use when the user says "/blog decay", "content decay", "traffic drop", "QoQ decline", "GSC decay", or "refresh declining posts".
argument-hint: "<current-gsc.json> <previous-gsc.json> [threshold] [metric]"
user-invokable: true
license: MIT
---
# 博客内容衰退

使用 `/blog decay` 查找 Google Search Console 表现较上一季度下降的页面。该命令会将当前周期的导出数据与上一周期的导出数据进行比较，默认标记下降幅度达到或超过 20% 的页面，并建议下一步的内容处理操作。

## 默认离线工作流

对两份 GSC 页面导出数据运行本地分析器：

```bash
python3 scripts/content_decay.py current.json previous.json
```

常用选项：

```bash
python3 scripts/content_decay.py current.json previous.json --threshold 0.30
python3 scripts/content_decay.py current.json previous.json --metric impressions
python3 scripts/content_decay.py current.json previous.json --format markdown --output decay-report.md
```

该脚本接受由页面数据行组成的 JSON 列表，其中包含 `page` 或 `url`、`clicks` 和 `impressions`。它也接受 `blog-google` 返回的对象结构，其中数据行位于顶层 `rows` 键下。

## 可选的实时 GSC 导出

对于实时数据，使用 `/blog google gsc` 或底层的 `blog-google` 命令创建每个周期的导出数据，然后运行离线分析器：

```bash
python3 skills/blog-google/scripts/run.py gsc_query --property sc-domain:example.com --dimensions page --start-date YYYY-MM-DD --end-date YYYY-MM-DD --json > gsc-current.json
python3 skills/blog-google/scripts/run.py gsc_query --property sc-domain:example.com --dimensions page --start-date YYYY-MM-DD --end-date YYYY-MM-DD --json > gsc-previous.json
python3 scripts/content_decay.py gsc-current.json gsc-previous.json --format markdown
```

进行短期检查时，请使用长度相近的相邻周期。要考虑季节性，还应使用相同的日期长度、筛选条件、搜索类型、设备、国家/地区和资源，进行同比比较。在条件允许的情况下，在诊断流量下降之前，请检查最多 16 个月的 GSC 历史数据。

## 衰退模型

默认指标为 `clicks`。在选择处理操作之前，还应检查展示次数、CTR、平均排名、查询与页面组合、设备、国家/地区以及搜索结果呈现形式的变化。

严重程度：

| 下降幅度 | 严重程度 |
| --- | --- |
| 20% 至 39.9% | 警告 |
| 40% 至 59.9% | 高 |
| 60% 或以上 | 严重 |

只有在确认筛选条件完全相同、行数限制充足、维度匹配并完成 URL 检查后，才能将上一周期中存在但当前导出数据中缺失的页面视为已掉出。否则，应将其标记为 `needs_validation`，而不是 `dropped_out`。

## 建议的处理操作

只有在检查索引状态、规范网址状态、查询流失、内部链接、反向链接、季节性和业务价值之后，才应将相应操作作为首要排查路径：

| 操作 | 适用情况 |
| --- | --- |
| 刷新/更新内容 | 页面仍有需求，并且可能需要更新时效性内容、标题、内部链接或章节。 |
| 调查查询变化 | 点击次数下降而展示次数保持稳定，表明 CTR、排名、SERP 或查询组合可能发生了变化。 |
| 合并/重定向 | 页面已掉出，或流失情况足够严重，以至于合并到更强的 URL 可能更快地挽回价值。 |
| 修剪 | 页面之前的需求非常低，可能不值得投入重写工作。 |

## 交叉引用

当有可用的实时凭据时，使用 `blog-google` 收集 Search Console 导出数据。检测到内容衰退后，如果建议的操作是刷新/更新内容，并且该页面值得改进，则使用 `blog-rewrite`。