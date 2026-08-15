---

## Preamble (runs on skill start)

```bash
# Version check (silent if up to date)
python3 telemetry/version_check.py 2>/dev/null || true

# Telemetry opt-in (first run only, then remembers your choice)
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

> **Privacy:** This skill logs usage locally to `~/.ai-marketing-skills/analytics/`. Remote telemetry is opt-in only. No code, file paths, or repo content is ever collected. See `telemetry/README.md`.

---
name: clone-site
description: 将任何网站克隆为像素级还原的 Next.js 副本。将其指向一个 URL，它便会对设计进行逆向工程、提取资源，并使用并行构建智能体逐个区块地重建网站。当用户要求克隆、复制、复刻、重建任何网站或落地页，或对其进行逆向工程时使用。也适用于“让它看起来像这个网站”或“基于这个 URL 构建一个页面”等请求。
---

# 克隆网站

对任何网站进行逆向工程，并将其重建为像素级还原的 Next.js 副本。

## 快速开始

用户说：“克隆 yourcompany.com”或“制作一个类似这样的落地页：[url]”

## 工作原理

1. **侦察** — 分别截取目标网站的桌面端和移动端截图，提取所有设计令牌（字体、颜色、间距），并下载所有资源
2. **基础搭建** — 使用目标网站完全一致的字体、颜色和全局样式设置 Next.js
3. **组件规格** — 使用 `getComputedStyle()` 获取的精确 CSS 值，为每个区块编写详细规格
4. **并行构建** — 在 Git 工作树中分派构建智能体，每个区块对应一个智能体
5. **组装与质量保证** — 合并所有内容、连接页面，并与原始网站进行视觉差异对比

## 要求

- 必须启用 Chrome MCP：`claude --chrome`
- Node.js 20+
- 使用 Next.js + Tailwind v4 + shadcn/ui 脚手架作为基础项目

## 设置（仅首次需要）

```bash
cd /path/to/your-clone-project
npm install
```

## 克隆网站

```bash
cd /path/to/your-clone-project
```

在 `TARGET.md` 中编辑 URL 和范围，然后在 Claude Code 中运行该技能。

或者直接告诉任意智能体：“克隆 [url]”，它们会完成处理。

## 完整技术参考

完整的克隆方法（侦察、提取、并行分派、质量保证）位于：
`references/FULL_METHODOLOGY.md`

仅在实际执行克隆时阅读此文件——其中包含约 500 行详细说明。

## 输出

- 项目目录中像素级还原的 Next.js 网站
- 所有资源均下载至 `public/`
- 组件规格位于 `docs/research/components/`
- 截图位于 `docs/design-references/`
- 运行 `npm run dev` 进行预览