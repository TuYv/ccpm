---
name: seo-unlighthouse
description: Multi-page Lighthouse audit via the MIT-licensed Unlighthouse CLI. Free-tier alternative to running PageSpeed against every URL on a site — no API quota burn, runs locally.
metadata:
compatibility: "Requires Node 18+ and the unlighthouse-cli npm package. Run extensions/unlighthouse/install.sh to pre-warm."
---
# seo-unlighthouse

对站点上的每个 URL 运行 Lighthouse（最多达到可配置的上限），并汇总结果。适用于以下情况：

- PageSpeed Insights 的免费配额（每日 2.5 万次）不足以覆盖大型站点。
- 你希望离线或在本地测量 CWV（CI 集成、受限环境）。
- 部署后需要快速执行全站回归检查。

## 前置条件

- 运行 `extensions/unlighthouse/install.sh`（无需 API 密钥）。
- `$PATH` 中需提供 Node 18+。

## 路由

| 命令 | 效果 |
|---|---|
| `/seo unlighthouse <url>` | 移动端审计，最多 200 条路由，在临时目录中生成 JSON+HTML 报告 |
| `/seo unlighthouse <url> --device desktop` | 桌面端设备类型 |
| `/seo unlighthouse <url> --max-routes 50 --output-dir ./reports` | 限制路由数量并持久化保存 |

所有标志都会转发给 `scripts/unlighthouse_run.py`，该脚本负责处理
url_safety 预检和子进程超时管理。

## 输出处理

封装器会从 Unlighthouse 输出目录中读取 `ci-result.json` 并
返回解析后的结果。汇总字段包括：

- `score.performance`（所有已审计路由的中位数）
- `score.accessibility`、`score.bestPractices`、`score.seo`
- 每条路由的详细结果可在 `<output_dir>/ci-result.json` 中获取

## 跨技能委派

- 对于单个 URL 的真实用户数据（CrUX），请使用 `seo-google psi` / `seo-google crux`。
- 对于缓慢页面的 LCP 子部分分解，请使用
  `scripts/lcp_subparts.py` 工作流（阶段 C）。