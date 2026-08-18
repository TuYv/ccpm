---
name: seo-bing
description: Bing Webmaster Tools + IndexNow extension. Microsoft Copilot citations are fed by the Bing index; this skill makes Bing visibility, link data, and IndexNow URL submission first-class.
metadata:
compatibility: "Requires BING_WEBMASTER_API_KEY and (optionally) INDEXNOW_KEY in ~/.claude/settings.json env. Run extensions/bing-webmaster/install.sh to configure."
---
# seo-bing

非 Google 索引渠道。Google 仍然拒绝 IndexNow（根据 Gary Illyes 在 2024-2025 年多期 SOTR 节目中的说法），因此，此技能专门用于 **Bing/Yandex/Seznam/Naver 索引**以及 **Microsoft Copilot AI 引用**（其内容来自 Bing 索引）。

## 前置条件

- 运行 `extensions/bing-webmaster/install.sh` 或 `install.ps1`。
- 一个 Bing Webmaster Tools API 密钥。
- 可选：一个包含 32 个以上字符的 IndexNow 主机密钥，并将其发布在 `INDEXNOW_KEY_LOCATION` 所声明的 URL 上。

## 路由

| 命令 | 底层脚本 |
|---|---|
| `/seo bing links <url>` | `python scripts/bing_webmaster.py links <url>` |
| `/seo bing compare <urlA> <urlB>` | `python scripts/bing_webmaster.py compare <urlA> <urlB>` |
| `/seo bing submit <url>`（单个 URL） | `python scripts/indexnow_submit.py --host ... --urls <url>` |
| `/seo bing submit-batch <file>` | `python scripts/indexnow_submit.py --urls-file <file>` |
| `/seo bing verify-indexnow` | `python scripts/indexnow_submit.py --verify-only` |

## 此技能的适用场景

- 用户正在发布新页面，并希望获得被 Microsoft Copilot 引用的资格（被 Bing 索引收录）。
- 用户希望推动 Bing/Yandex/Seznam/Naver 索引新发布的 URL。
- 用户正在进行竞争对手反向链接分析，并希望获取 Bing 独有的链接数据（Bing 会追踪 Google API 未提供的链接）。

## 跨技能委派

- 对于 Google 索引（模式截然不同——由站点地图驱动，不使用 IndexNow），请使用 `seo-google indexing`。
- 对于多来源反向链接置信度加权，请回退使用已集成 Bing + Moz + CC 的 `seo-backlinks`。