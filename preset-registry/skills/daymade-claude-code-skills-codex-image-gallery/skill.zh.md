---
name: codex-image-gallery
description: Start or reuse a self-contained local web gallery for browsing Codex-generated images. Use when the user asks to browse Codex generated images, open a local image gallery, inspect ~/.codex/generated_images, view a Codex image output folder, or browse image files produced by Codex.
---
# Codex 图片库

为 Codex 图片输出启动一个本地浏览器图片库。此技能是自包含的：服务器位于 `scripts/server.mjs`，UI 模板位于 `assets/index.html`。

## 快速开始

在此技能目录（即包含此 `SKILL.md` 的目录）中运行命令。

```bash
node scripts/server.mjs
```

服务器会打印实际 URL。它从 `http://127.0.0.1:8765/` 开始，如果默认端口被占用，则会尝试后续端口。

## 工作流程

1. 首先检查默认 URL：

   ```bash
   node -e 'fetch("http://127.0.0.1:8765/api/images").then(r => r.json()).then(j => console.log(j.rootPath, j.items.length)).catch(() => process.exit(1))'
   ```

   如果成功，则复用在 `http://127.0.0.1:8765/` 上运行的服务器。

2. 如果 API 检查失败，请检查是否有正在运行的服务器进程：

   ```bash
   pgrep -fl 'node .*server\.mjs' || true
   ```

   如果进程存在但默认 URL 无法访问，请检查其标准输出或尝试可能的后续端口，因为端口被占用时服务器会自动递增端口号。

3. 在报告成功之前，验证所有复用的 URL：

   ```bash
   node -e 'fetch("http://127.0.0.1:8765/api/images").then(r => r.json()).then(j => console.log(j.rootPath, j.items.length))'
   ```

   如果服务器选择了其他端口，请使用该端口。

4. 如果没有服务器正在运行，请启动服务器：

   ```bash
   node scripts/server.mjs
   ```

   为用户保持该进程运行，并从标准输出中读取 URL。

5. 除非用户要求仅提供 URL，否则请打开浏览器：

   ```bash
   open http://127.0.0.1:8765/
   ```

## 图片根目录

默认图片根目录：

```text
~/.codex/generated_images
```

使用以下命令指定其他文件夹：

```bash
GALLERY_ROOT=/path/to/images node scripts/server.mjs
```

## 验证

编辑后，在确认此技能运行正常之前，请运行：

```bash
node --check scripts/server.mjs
```

然后启动服务器并验证：

- `GET /api/images` 返回包含 `rootPath` 和 `items` 的 JSON
- `/images/<relative-path>` 能够为至少一个列出的条目返回图片内容
- 页面从随附的 `assets/index.html` 加载

## 响应

报告 URL、图片根目录、服务器是被复用还是新启动的，以及任何验证失败。保持回答简短。