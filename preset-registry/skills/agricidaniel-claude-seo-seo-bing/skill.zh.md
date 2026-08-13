---
name: seo-bing
description: Bing Webmaster Tools + IndexNow extension. Microsoft Copilot citations are fed by the Bing index; this skill makes Bing visibility, link data, and IndexNow URL submission first-class.
metadata:
  version: "2.2.4"
compatibility: "Requires BING_WEBMASTER_API_KEY and (optionally) INDEXNOW_KEY in ~/.claude/settings.json env. Run extensions/bing-webmaster/install.sh to configure."
---
# seo-bing

非 Google 的索引渠道。Google 仍然拒绝采用 IndexNow（根据 Gary Illyes 在 2024-2025 年多期 SOTR 节目中的说法），因此，此技能专门用于 **Amazon/Bing/Naver/Seznam.cz/Yandex/Yep 索引收录**和 **Microsoft Copilot AI 引用**（其内容来自 Bing 索引）。

## 前置条件

- 运行 `extensions/bing-webmaster/install.sh` 或 `install.ps1`。
- 一个 Bing Webmaster Tools API 密钥。
- 可选：一个包含 32 个以上字符的 IndexNow 主机密钥，并发布在 `INDEXNOW_KEY_LOCATION` 所声明的 URL 上。

## 路由

| 命令 | 底层脚本 |
|---|---|
| `/seo bing links <url>` | `claude-seo run bing_webmaster.py links <url>` |
| `/seo bing compare <urlA> <urlB>` | `claude-seo run bing_webmaster.py compare <urlA> <urlB>`；两个站点都必须注册到该 API 账户 |
| `/seo bing submit <url>`（单个 URL） | `claude-seo run indexnow_submit.py --host ... --urls <url>` |
| `/seo bing submit-batch <file>` | `claude-seo run indexnow_submit.py --host ... --urls-file <file>` |
| `/seo bing verify-indexnow` | `claude-seo run indexnow_submit.py --host ... --verify-only` |

## 此技能的适用场景

- 用户正在发布新页面，并希望获得被 Microsoft Copilot 引用的资格（录入 Bing 索引）。
- 用户希望推动 Amazon/Bing/Naver/Seznam.cz/Yandex/Yep 收录新 URL。
- 用户同时管理两个站点，并希望比较它们的 Bing 链接数据。对于任意竞争对手，请转交给 DataForSEO、Moz 或 Common Crawl。

## 跨技能委派

- 对于 Google 索引收录（其模式截然不同，由站点地图驱动，不使用 IndexNow），请使用 `seo-google indexing`。
- 对于多来源反向链接的置信度加权，请回退到已集成 Bing + Moz + CC 的 `seo-backlinks`。