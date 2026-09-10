---
name: seo-bing
description: Bing Webmaster Tools + IndexNow extension. Microsoft Copilot citations are fed by the Bing index; this skill makes Bing visibility, link data, and IndexNow URL submission first-class.
metadata:
  version: "2.3.1"
compatibility: "Requires BING_WEBMASTER_API_KEY and (optionally) INDEXNOW_KEY in ~/.claude/settings.json env. Run extensions/bing-webmaster/install.sh to configure."
---
# seo-bing

非 Google 的索引入口。Google 仍然拒绝 IndexNow（根据 Gary Illyes 在 2024-2025 年多期 SOTR 中的说法），因此此 skill 专门用于 **Amazon/Bing/Naver/Seznam.cz/Yandex/Yep 索引**以及**Microsoft Copilot AI 引用**（其内容来源于 Bing 索引）。

## 前置条件

- 运行 `extensions/bing-webmaster/install.sh` 或 `install.ps1`。
- Bing Webmaster Tools API 密钥。
- 可选：IndexNow 主机密钥（32 个或更多字符），并发布在 `INDEXNOW_KEY_LOCATION` 所声明的 URL 上。

## 路由

| 命令 | 底层脚本 |
|---|---|
| `/seo bing links <url>` | `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run bing_webmaster.py links <url>` |
| `/seo bing compare <urlA> <urlB>` | `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run bing_webmaster.py compare <urlA> <urlB>`；两个属性都必须已注册到 API 账户 |
| `/seo bing submit <url>`（单个 URL） | `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run indexnow_submit.py --host ... --urls <url>` |
| `/seo bing submit-batch <file>` | `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run indexnow_submit.py --host ... --urls-file <file>` |
| `/seo bing verify-indexnow` | `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run indexnow_submit.py --host ... --verify-only` |

## 此 skill 的适用场景

- 用户正在发布新页面，并希望获得 Microsoft Copilot
  引用资格（接入 Bing 索引）。
- 用户希望推动 Amazon/Bing/Naver/Seznam.cz/Yandex/Yep 为新鲜
  URL 建立索引。
- 用户同时管理两个属性，并希望比较它们的 Bing 链接数据。
  对于任意竞争对手，应转交给 DataForSEO、Moz 或 Common Crawl。

## 跨 skill 委派

- 对于 Google 索引（模型完全不同、由 sitemap 驱动且不使用
  IndexNow），使用 `seo-google indexing`。
- 对于多来源反向链接置信度加权，回退到
  `seo-backlinks`，该 skill 已集成 Bing + Moz + CC。