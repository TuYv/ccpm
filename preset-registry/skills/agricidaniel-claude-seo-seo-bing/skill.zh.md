---
name: seo-bing
description: Bing Webmaster Tools + IndexNow extension. Microsoft Copilot citations are fed by the Bing index; this skill makes Bing visibility, link data, and IndexNow URL submission first-class.
metadata:
  version: "2.2.6"
compatibility: "Requires BING_WEBMASTER_API_KEY and (optionally) INDEXNOW_KEY in ~/.claude/settings.json env. Run extensions/bing-webmaster/install.sh to configure."
---
# seo-bing

非 Google 的索引渠道。Google 仍拒绝 IndexNow（据 Gary Illyes 在 2024-2025 年多期 SOTR 节目中所述），因此该技能专门用于 **Amazon/Bing/Naver/Seznam.cz/Yandex/Yep 索引**以及 **Microsoft Copilot AI 引用**（后者从 Bing 索引中提取内容）。

## 前置条件

- 运行 `extensions/bing-webmaster/install.sh` 或 `install.ps1`。
- 一个 Bing Webmaster Tools API 密钥。
- 可选：一个 IndexNow 主机密钥（32 个以上字符），发布在由 `INDEXNOW_KEY_LOCATION` 声明的 URL 上。

## 路由

| 命令 | 底层脚本 |
|---|---|
| `/seo bing links <url>` | `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run bing_webmaster.py links <url>` |
| `/seo bing compare <urlA> <urlB>` | `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run bing_webmaster.py compare <urlA> <urlB>`；两个属性都必须已注册到该 API 账户 |
| `/seo bing submit <url>`（单个 URL） | `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run indexnow_submit.py --host ... --urls <url>` |
| `/seo bing submit-batch <file>` | `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run indexnow_submit.py --host ... --urls-file <file>` |
| `/seo bing verify-indexnow` | `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run indexnow_submit.py --host ... --verify-only` |

## 此技能适用的场景

- 用户正在发布新页面，并希望获得 Microsoft Copilot 引用资格（Bing 索引收录）。
- 用户希望推动 Amazon/Bing/Naver/Seznam.cz/Yandex/Yep 对新 URL 的索引。
- 用户同时管理两个属性，并希望比较它们的 Bing 链接数据。
  对于任意竞争对手，请路由至 DataForSEO、Moz 或 Common Crawl。

## 跨技能委派

- 对于 Google 索引（模型截然不同，依赖站点地图，不使用 IndexNow），请使用 `seo-google indexing`。
- 对于多来源反向链接置信度加权，请回退至 `seo-backlinks`，它已集成 Bing + Moz + CC。