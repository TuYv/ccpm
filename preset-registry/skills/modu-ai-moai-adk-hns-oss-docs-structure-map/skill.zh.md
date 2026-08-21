---
name: hns-oss-docs-structure-map
description: >
  docs-site structure map for the oss-docs harness structure-curator: exact
  paths and schemas for hugo.toml, per-locale content/<locale>/_meta.yaml,
  data/menu/main.yaml (4-locale name maps + icon values), the icon-to-SVG-case
  coupling in layouts/partials/menu.html, shortcodes, the FROZEN
  moai-brand.css, vercel.json redirect examples, and the known
  design-vs-guides divergence. Loaded by the structure-curator before any
  navigation or config edit.
allowed-tools: Read, Grep, Glob, Bash
user-invocable: false
metadata:
  version: "1.0.0"
  category: "harness"
  status: "active"
  updated: "2026-07-13"
  tags: "oss-docs,docs-site,hugo,geekdoc,menu,redirects,structure"
---
# docs-site 结构图

位于 `docs-site/` 的 Hugo **geekdoc** 站点，通过 Vercel 部署至 **adk.mo.ai.kr**（推送时自动部署）。以下所有路径均相对于 `docs-site/`。

## 路径图

| 表面 | 路径 | 说明 |
|---------|------|-------|
| 站点配置 | `hugo.toml` | 不是 hugo.yaml。`defaultContentLanguage = "ko"`；版本 SSOT 为 `params.version` / `params.releaseDate` |
| 内容 | `content/{ko,en,ja,zh}/` | ko 为规范版本；4 个语言区域目录树彼此镜像 |
| 章节顺序 | `content/<locale>/_meta.yaml` | 各语言区域独立；章节变更须应用到全部四个文件 |
| 侧边栏菜单 | `data/menu/main.yaml` | 4 个语言区域的名称映射 + 每个条目的 `icon:` |
| 菜单图标 | `layouts/partials/menu.html` | 根据 `icon:` 值设置 SVG `switch`/case——耦合关系见下文 |
| 短代码 | `layouts/shortcodes/` | `icon.html`（支持 ok/warn/danger/primary/muted 变体）等 |
| CSS | `static/moai-brand.css`（**已冻结**——绝不可编辑）、`static/moai-design.css` | Claude Warm Editorial，仅支持浅色主题 |
| 重定向 | `vercel.json` | `redirects` 数组——此工具仅会触及这一 Vercel 配置表面 |

## main.yaml 条目模式

每个侧边栏条目都包含一个 4 语言区域名称映射和一个图标：

```yaml
- name:
    ko: 시작하기
    en: Getting Started
    ja: はじめに
    zh: 快速开始
  ref: /getting-started
  icon: rocket
```

## icon ↔ menu.html SVG-case 耦合关系 [硬性要求]

`main.yaml` 中的每个 `icon:` 值都必须在 `layouts/partials/menu.html` 内的 SVG switch 中有匹配的 case。未匹配的值会渲染为空的 `<svg>`——这是一种无构建警告的隐性视觉缺陷。完成任何图标编辑后：

```bash
grep -n '"<icon-value>"' docs-site/layouts/partials/menu.html
```

如果不存在，请在同一次变更中添加对应的 SVG path case。

## vercel.json 重定向模式

移动或重命名页面时，必须同时添加以下两个条目：

```json
{
  "redirects": [
    { "source": "/:locale(ko|en|ja|zh)/old-path", "destination": "/:locale/new-path" },
    { "source": "/old-path", "destination": "/ko/new-path" }
  ]
}
```

Vercel 项目绑定本身不可变——此工具仅编辑 `redirects` 数组。

## 需要协调的已知差异

`content/<locale>/_meta.yaml` 包含 **`design`** 章节，而 `data/menu/main.yaml` 包含 **`guides`**。修改任一文件时，请按照 SSOT 设计报告中的 12→11 章节重构方案（`.moai/reports/readme-docs-redesign-20260713.md`）进行协调，并在报告中记录解决方向。

## 工具实际情况

- `gen_menu.py`（旧版 i18n 规则文档中引用）并不存在——菜单编辑需手动完成；请使用上述耦合关系 grep 命令。
- 构建检查：`cd docs-site && hugo --minify --gc` 必须无警告完成（格式错误的 `_meta.yaml` 或菜单条目会在此暴露）。完整流程：Skill("hns-oss-docs-verify")。