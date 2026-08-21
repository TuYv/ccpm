---
name: hns-oss-docs-i18n-rules
description: >
  HARD i18n rules digest for the oss-docs harness specialists working on
  moai-adk-go README 4-locale set and the docs-site (adk.mo.ai.kr). Covers the
  canonical-locale chains, the 4-locale same-PR obligation, Mermaid TD-only,
  the no-emoji + icon-shortcode rule, emphasis-marker spacing, the URL
  blacklist, version SSOT, vercel.json redirect pattern, and the immutable
  Vercel binding. Loaded FIRST by every oss-docs specialist before any edit.
allowed-tools: Read, Grep, Glob, Bash
user-invocable: false
metadata:
  version: "1.1.0"
  category: "harness"
  status: "active"
  updated: "2026-08-17"
  tags: "oss-docs,i18n,4-locale,readme,docs-site,adk.mo.ai.kr"
---
# oss-docs 硬性 i18n 规则

SSOT：`.moai/docs/docs-site-i18n-rules.md`（另见 CLAUDE.local.md §17.1 中的设计/图标规范）。本技能是供实际工作使用的摘要；如有冲突，以 SSOT 为准——但下文「§ 已知过时项」中的两个过时项除外，此时以实际情况为准。

## 1. 规范语言链 [硬性]

| 界面 | 规范语言 | 派生链 | 派生文件 |
|---------|-----------|------------------|---------------|
| docs-site | **ko** | ko → en → ja/zh，同一 PR | `docs-site/content/{en,ja,zh}/` |
| README | **ko**（`README.ko.md`） | ko → en/ja/zh，同一 PR | `README.md`、`README.ja.md`、`README.zh.md` |

> README 的规范语言已由 en → ko 切换（卡片 t47，操作方决定于 2026-08-17）：
> ko 新骨架（面向功能的 12 节结构）已提升为规范版本，
> en/ja/zh 均由其重新派生。现在两个界面均以
> ko 为规范语言——各界面的派生链已保持一致。

- 仅使用规范语言编写内容；其余语言均从中派生。绝不要在译文中“修正”规范内容——应改为报告该差异。

## 2. 4 种语言同步更新义务 [硬性]

每次规范内容变更都必须在同一 PR 中提交全部 4 种语言的版本。
如果规范内容发生编辑，却没有对应的 3 个派生版本，则判定语言一致性失败
（Sprint 合约 `locale-parity` 阈值为 1.0，必须通过）。

## 3. Mermaid 仅限 TD [硬性]

- 允许：`flowchart TD`、`graph TB`。
- 禁止：`LR` / `RL` 方向（`flowchart LR`、`graph LR`、
  `flowchart RL`、`graph RL`）。
- 翻译时必须原样保留图表方向。

## 4. 正文中禁止使用 emoji [硬性]

- 改用图标 shortcode：`{{</* icon <name> [variant] */>}}`
  （定义于 `docs-site/layouts/shortcodes/icon.html`；变体：
  `ok|warn|danger|primary|muted`）。
- 应保留（并非 emoji——不要移除）：排版符号 `→ ← ↓ ✓ ✗`，以及
  MoAI 编排器横幅示例代码块中的品牌 emoji。

## 5. 强调标记间距 [硬性]

- 正确：`**바이브코딩** (Vibe Coding)`——括号内容位于标记之外。
- 错误：`**바이브코딩(Vibe Coding)**`。

## 6. URL 黑名单 [硬性]

只有 `adk.mo.ai.kr` 是有效的 docs-site 域名。以下内容均被禁止（所有出现位置，
包括链接标签和翻译后的正文）：

- `docs.moai-ai.dev`
- `adk.moai.com`
- `adk.moai.kr`

## 7. 版本 SSOT [硬性]

`docs-site/hugo.toml` 中的 `params.version` / `params.releaseDate` 是唯一的
版本信息来源。除发布流程同步的内容外，绝不要在页面、
菜单或 README 中硬编码不一致的版本/日期字符串。

**发布同步义务（操作方决定于 2026-08-18）：**每次发布都必须在同一 PR 中
将所有版本显示更新为发布版本号——包括 `hugo.toml` 中的 `version` +
`releaseDate`（该文件自身的两行契约）、README 发布徽章（全部 4 种语言），
以及展示产品版本的页面内示例输出（状态栏示例 `🗿 vX.Y.Z`、
更新提示示例 `X ⬆️ Y`、版本列示例值）。历史引用（“在 vX.Y.Z 中引入”、
“在 v3.0.0 中废弃”、“自 v3.0.0 起默认启用”）不属于版本显示，
应保持不变。验证方案中的版本字符串检查（技能 "hns-oss-docs-verify" §6）
会在退出门禁处强制执行此规则。

## 8. 移动页面时需要添加重定向 [硬性要求]

每次移动或重命名文档站点页面时，都需要在 `docs-site/vercel.json` 中添加：

1. 支持区域设置：`/:locale(ko|en|ja|zh)/old-path → /:locale/new-path`
2. 不含区域设置的回退：`/old-path → /ko/new-path`

## 9. Vercel 绑定不可变 [硬性要求]

此工具绝不会更改 Vercel 项目绑定和部署配置（重定向数组除外）。
推送即会在 adk.mo.ai.kr 上进行生产环境部署，因此专家绝不能提交或推送——发布操作必须由人工把关。

## SSOT 文档中的已知过时项

SSOT 文档 `.moai/docs/docs-site-i18n-rules.md` 编写于当前站点之前，
其中包含 2 项过时信息——以实际情况为准：

1. 其中称主题为 **Hextra** → 实际为：**hugo-geekdoc**。
2. 其中称配置文件为 **hugo.yaml** → 实际为：**`docs-site/hugo.toml`**
   (defaultContentLanguage=ko)。

此外：其中引用的脚本 `docs-i18n-check.sh` 和 `gen_menu.py` 并不存在。
切勿通过 shell 调用它们——请改为运行
Skill("hns-oss-docs-verify") 中的内联检查。