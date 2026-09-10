---
name: seo-unlighthouse
description: Multi-page Lighthouse audit via the MIT-licensed Unlighthouse CLI. Free-tier alternative to running PageSpeed against every URL on a site, no API quota burn, runs locally.
metadata:
  version: "2.2.6"
compatibility: "Requires Node 18+ and the unlighthouse npm package. Run extensions/unlighthouse/install.sh to pre-warm."
---
# seo-unlighthouse

对网站上的每个 URL 运行 Lighthouse（最多不超过可配置的上限），并汇总结果。适用于：

- PageSpeed Insights 的免费配额（25k QPD）不足以覆盖大型网站。
- 需要离线/本地 CWV 测量（CI 集成、受限环境）。
- 部署后需要快速进行全站回归检查。

## 前置条件

- 运行 `extensions/unlighthouse/install.sh`（无需 API 密钥）。
- `$PATH` 中需要有 Node 18+。

## 路由

| 命令 | 效果 |
|---|---|
| `/seo unlighthouse <url>` | 移动端审计，最多 200 个路由，在临时目录中生成 JSON+HTML 报告 |
| `/seo unlighthouse <url> --device desktop` | 桌面端设备类型 |
| `/seo unlighthouse <url> --max-routes 50 --output-dir ./reports` | 设置上限并持久化输出 |

所有标志都会透传到 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run unlighthouse_run.py`，该脚本负责
`url_safety` 预检和子进程超时管理。

## 输出处理

包装器会从 Unlighthouse 输出目录中读取 `ci-result.json`，并返回解析后的结果。聚合字段：

- `score.performance`（所审计路由的中位数）
- `score.accessibility`、`score.bestPractices`、`score.seo`
- 每个路由的明细位于 `<output_dir>/ci-result.json`

## 跨技能委派

- 对于单个 URL 的字段数据（CrUX），使用 `seo-google psi` / `seo-google crux`。
- 对于慢页面的 LCP 子部分分解，使用 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run lcp_subparts.py` 工作流（阶段 C）。