---
name: seo-unlighthouse
description: Multi-page Lighthouse audit via the MIT-licensed Unlighthouse CLI. Free-tier alternative to running PageSpeed against every URL on a site, no API quota burn, runs locally.
metadata:
  version: "2.3.1"
compatibility: "Requires Node 18+ and the unlighthouse npm package. Run extensions/unlighthouse/install.sh to pre-warm."
---
# seo-unlighthouse

对网站上的每个 URL 运行 Lighthouse（最多不超过可配置的上限），
并汇总结果。适用于：

- PageSpeed Insights 的免费配额（每日 25k QPD）不足以覆盖大型网站。
- 希望进行离线 / 本地 CWV 测量（CI 集成、受限环境）。
- 部署后需要快速进行全站回归检查。

## 前置条件

- 运行 `extensions/unlighthouse/install.sh`（无需 API key）。
- `$PATH` 中需要有 Node 18+。

## 路由

| 命令 | 效果 |
|---|---|
| `/seo unlighthouse <url>` | 移动端审计，最多 200 条路由，在临时目录中生成 JSON+HTML 报告 |
| `/seo unlighthouse <url> --device desktop` | 桌面端设备类型 |
| `/seo unlighthouse <url> --max-routes 50 --output-dir ./reports` | 设置上限并持久化报告 |

所有标志都会通过 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run unlighthouse_run.py` 传递，该脚本负责
`url_safety` 预检和子进程超时管理。

## 输出处理

该封装程序从 Unlighthouse 输出目录读取 `ci-result.json`，对其进行规范化处理（默认的 `jsonSimple` reporter 会写入一个扁平的、包含每条路由结果的 JSON 数组；兼容性回退逻辑也接受 `jsonExpanded` 对象格式），
并返回：

- `route_count`：实际完成审计的路由数量
- `aggregate_scores`：所有已审计路由中每个 Lighthouse 类别的中位数得分（`performance`、`accessibility`、`best-practices`、`seo`）
- `routes`：每条路由的明细（磁盘上的 `<output_dir>/ci-result.json` 中也包含此内容）

路由上限和每页超时时间通过生成的 `unlighthouse.config.mjs` 设置，并通过 `--config-file` 传入（这是设置 `scanner.maxRoutes` 的唯一 CLI 文档化方式；unlighthouse-ci 没有 `--max-routes` 标志）。使用 `--page-timeout <seconds>` 可以修改每页 Lighthouse 任务的超时时间（默认为 60s）；这与整体的 `--timeout` 子进程保护机制不同（默认为 600s）。

## 跨技能委派

- 对于单个 URL 的现场数据（CrUX），使用 `seo-google psi` / `seo-google crux`。
- 对于慢速页面的 LCP 子部分拆解，使用 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run lcp_subparts.py` 工作流（阶段 C）。