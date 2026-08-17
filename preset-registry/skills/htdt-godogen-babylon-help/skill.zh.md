---
name: babylon-help
display_name: Babylon Help
short_description: Babylon.js APIs, loaders, Vite patterns, and browser runtime help
default_prompt: "Use ${BABYLON_HELP_COMMAND} for Babylon.js, Vite, WebGL, loader, or browser-capture questions."
allow_implicit_invocation: false
description: |
  Look up Babylon.js APIs, import paths, examples, loaders, Vite integration, and browser runtime behavior. Use for Babylon-specific API lookup, feature design, rendering setup, asset loading, and capture issues.
---
# Babylon 帮助

使用此技能处理 Babylon.js API 问题、精确导入路径、加载器行为、渲染设置、Vite/HMR 集成、WebGL/浏览器运行时问题以及浏览器捕获问题。

单版本策略：

- 从项目的 `package.json` 和 `package-lock.json` 中确定目标版本。
- 将当前项目版本所安装的 npm 包作为主要的本地参考依据。
- 除非调用方明确请求迁移帮助，否则不要混用旧版 Babylon 的示例。

运行 `npm install` 后的主要本地来源：

```text
node_modules/@babylonjs/core/
node_modules/@babylonjs/loaders/
node_modules/vite/
```

查找顺序：

1. 查看项目的 `package.json` 和锁文件，以确定确切版本。
2. 查看已安装的 `node_modules/@babylonjs/core` 和 `node_modules/@babylonjs/loaders` 的源码/类型定义。
3. 查看已安装的 `node_modules/vite` 的文档/类型定义，以了解 Vite 特定行为。
4. Babylon 官方文档：`https://doc.babylonjs.com/`。
5. 官方 npm 包页面，以获取包元数据。
6. Vite 官方文档，以了解 HMR/服务器行为。

如果已搭建的项目中缺少 `node_modules/`，请在查找前运行 `npm install`。如果项目尚未搭建，请使用官方文档，并说明所针对的包版本。

实用搜索命令：

```bash
rg "class ArcRotateCamera" node_modules/@babylonjs/core
rg "ImportMeshAsync" node_modules/@babylonjs/core node_modules/@babylonjs/loaders
rg "handleHotUpdate" node_modules/vite
```

回答时：

- 首先给出具体建议。
- 列出所查阅的文件或官方页面。
- 将文档记载的事实与推断区分开。
- 提供与已安装包相匹配的导入路径。
- 当浏览器/GPU 限制会影响答案时，请予以说明。

每次成功查找后的强制操作：

- 向 `./.babylon-help.log` 追加一条简短记录。
- 仅记录：
  - `requested`：调用方询问的内容
  - `comment`：简短的解决说明
  - `result_files`：所使用的具体本地文件或官方 URL

保持日志简洁。不要将完整文档或大段代码块粘贴到其中。