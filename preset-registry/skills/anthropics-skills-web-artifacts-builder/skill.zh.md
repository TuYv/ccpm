---
name: web-artifacts-builder
description: Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts.
license: Complete terms in LICENSE.txt
---
# Web Artifacts 构建器

要构建强大的前端 `claude.ai` artifacts，请按以下步骤操作：
1. 使用 `scripts/init-artifact.sh` 初始化前端仓库
2. 通过编辑生成的代码来开发你的 artifact
3. 使用 `scripts/bundle-artifact.sh` 将全部代码打包为单个 HTML 文件
4. 向用户展示 artifact
5. （可选）测试该 artifact

**Stack**：React 18 + TypeScript + Vite + Parcel（打包）+ Tailwind CSS + shadcn/ui

## 设计与样式指南

非常重要：为避免通常所说的“AI slop”，请避免使用过度居中的布局、紫色渐变、统一的圆角，以及 Inter 字体。

## 快速开始

### 步骤 1：初始化项目

运行初始化脚本来创建一个新的 React 项目：
```bash
bash scripts/init-artifact.sh <project-name>
cd <project-name>
```

这将创建一个完整配置的项目，包含：
- ✅ React + TypeScript（通过 Vite）
- ✅ 带 shadcn/ui 主题系统的 Tailwind CSS 3.4.1
- ✅ 已配置路径别名（`@/`）
- ✅ 预安装 40+ 个 shadcn/ui 组件
- ✅ 包含所有 Radix UI 依赖
- ✅ 已配置 Parcel 打包（通过 `.parcelrc`）
- ✅ Node 18+ 兼容性（自动检测并固定 Vite 版本）

### 步骤 2：开发你的 Artifact

要构建 artifact，请编辑生成的文件。具体可参见下方 **Common Development Tasks**。

### 步骤 3：打包为单个 HTML 文件

要将 React 应用打包为单个 HTML artifact：
```bash
bash scripts/bundle-artifact.sh
```

这会创建 `bundle.html` —— 一个自包含的 artifact，内联了全部 JavaScript、CSS 和依赖。该文件可直接在 Claude 会话中作为 artifact 分享。

**要求**：你的项目必须在根目录中包含 `index.html`。

**脚本会执行以下操作**：
- 安装打包依赖（parcel、@parcel/config-default、parcel-resolver-tspaths、html-inline）
- 创建带路径别名支持的 `.parcelrc` 配置
- 使用 Parcel 构建（不生成 source maps）
- 使用 html-inline 将所有资源内联到单一 HTML 中

### 步骤 4：与用户共享 Artifact

最后，在会话中共享打包后的 HTML 文件，让用户可以将其作为 artifact 查看。

### 步骤 5：测试/可视化 Artifact（可选）

注意：此步骤是完全可选的，仅在必要或被要求时执行。

要测试/可视化 artifact，可使用可用工具（包括其他 Skills 或内置工具，如 Playwright、Puppeteer）。通常应避免提前测试 artifact，因为这会增加请求与最终 artifact 可见之间的延迟。若用户有要求或出现问题，请在展示 artifact 后再进行测试。

## 参考

- **shadcn/ui components**: https://ui.shadcn.com/docs/components
