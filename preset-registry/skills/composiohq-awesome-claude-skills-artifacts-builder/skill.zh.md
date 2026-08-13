---
name: artifacts-builder
description: Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts.
license: Complete terms in LICENSE.txt
---
# Artifacts 构建器

要构建强大的前端 `claude.ai` artifacts，请按以下步骤操作：
1. 使用 `scripts/init-artifact.sh` 初始化前端仓库
2. 通过编辑生成的代码来开发你的 artifact
3. 使用 `scripts/bundle-artifact.sh` 将所有代码打包为单个 HTML 文件
4. 将 artifact 展示给用户
5. （可选）测试 artifact

**技术栈**：React 18 + TypeScript + Vite + Parcel（打包）+ Tailwind CSS + shadcn/ui

## 设计与样式指南

非常重要：为避免常被称为“AI slop”的现象，请避免过度使用居中布局、紫色渐变、统一圆角，以及 Inter 字体。

## 快速入门

### 第 1 步：初始化项目

运行初始化脚本以创建一个新的 React 项目：
```bash
bash scripts/init-artifact.sh <project-name>
cd <project-name>
```

这会创建一个完全配置好的项目，包含以下内容：
- ✅ React + TypeScript（通过 Vite）
- ✅ 带 shadcn/ui 主题系统的 Tailwind CSS 3.4.1
- ✅ 配置好的路径别名（`@/`）
- ✅ 预安装的 40+ shadcn/ui 组件
- ✅ 包含所有 Radix UI 依赖
- ✅ 已配置打包工具 Parcel（通过 `.parcelrc`）
- ✅ Node 18+ 兼容性（自动检测并锁定 Vite 版本）

### 第 2 步：开发你的 Artifact

要构建 artifact，请编辑生成的文件。请参见下方的 **Common Development Tasks** 以获取指导。

### 第 3 步：打包为单个 HTML 文件

将 React 应用打包为单个 HTML artifact：
```bash
bash scripts/bundle-artifact.sh
```

这会创建 `bundle.html`，它是一个自包含 artifact，内联了所有 JavaScript、CSS 和依赖项。该文件可以直接在 Claude 会话中作为 artifact 分享。

**要求**：你的项目必须在根目录中包含 `index.html`。

**脚本执行内容**：
- 安装打包依赖（parcel、@parcel/config-default、parcel-resolver-tspaths、html-inline）
- 创建支持路径别名的 `.parcelrc` 配置
- 使用 Parcel 进行构建（无 source maps）
- 使用 html-inline 将所有资源内联到单个 HTML 文件中

### 第 4 步：与用户共享 Artifact

最后，在会话中共享打包后的 HTML 文件，供用户作为 artifact 查看。

### 第 5 步：测试/可视化 Artifact（可选）

注意：这是一个完全可选步骤，仅在必要或被要求时执行。

要测试/可视化 artifact，请使用可用工具（包括其他 `Skills` 或内置工具，如 Playwright 或 Puppeteer）。通常建议不要提前测试 artifact，因为这会增加请求与最终 artifact 出现之间的延迟。若用户请求或出现问题，请在展示 artifact 之后再进行测试。

## 参考资料

- **shadcn/ui components**: https://ui.shadcn.com/docs/components
