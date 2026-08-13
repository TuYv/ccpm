---
name: seo-unlighthouse
description: Multi-page Lighthouse audit via the MIT-licensed Unlighthouse CLI. Free-tier alternative to running PageSpeed against every URL on a site, no API quota burn, runs locally.
metadata:
  version: "2.2.4"
compatibility: "Requires Node 18+ and the unlighthouse npm package. Run extensions/unlighthouse/install.sh to pre-warm."
---
# seo-unlighthouse

对网站上的每个 URL 运行 Lighthouse（不超过可配置的上限），并汇总结果。适用于以下情况：

- PageSpeed Insights 的免费配额（25k QPD）不足以覆盖大型网站。
- 你希望进行离线/本地 CWV 测量（CI 集成、受限环境）。
- 部署后需要快速执行全站回归检查。

## 前置条件

- 运行 `extensions/unlighthouse/install.sh`（无需 API 密钥）。
- `$PATH` 中需有 Node 18+。

## 路由

| 命令 | 效果 |
|---|---|
| `/seo unlighthouse <url>` | 移动端审计，最多 200 个路由，JSON+HTML 报告保存在临时目录中 |
| `/seo unlighthouse <url> --device desktop` | 桌面端设备类型 |
| `/seo unlighthouse <url> --max-routes 50 --output-dir ./reports` | 限制数量并持久化保存 |

所有标志都会转发给 `scripts/unlighthouse_run.py`，由该脚本处理
url_safety 预检和子进程超时管理。

## 输出处理

封装器从 Unlighthouse 输出目录中读取 `ci-result.json`，解析后将其
返回。汇总字段：

- `score.performance`（所有已审计路由的中位数）
- `score.accessibility`、`score.bestPractices`、`score.seo`
- 每个路由的明细可在 `<output_dir>/ci-result.json` 中查看

## 跨 Skill 委派

- 对于单个 URL 的现场数据（CrUX），请使用 `seo-google psi` / `seo-google crux`。
- 对于慢速页面的 LCP 子部分分解，请使用
  `scripts/lcp_subparts.py` 工作流（阶段 C）。