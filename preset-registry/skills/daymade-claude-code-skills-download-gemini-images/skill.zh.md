---
name: download-gemini-images
description: Download, export, save, or package images from a Google Gemini conversation/chat/app page, especially uploaded images or generated image previews visible in a Gemini thread. Use when the task needs logged-in Chrome/Gemini state, opening Gemini image lightboxes, downloading the larger displayed image files, renaming them in order, and producing a ZIP archive.
---
# 下载 Gemini 图片

## 概述

从用户已登录的 Chrome 会话中下载 Gemini 对话图片。优先使用灯箱中的图片，而不是缩略图/页面预览资源，因为 Gemini 通常只有在用户打开预览后才会提供更大的 `blob:` 图片。

## 工作流程

1. 使用 Chrome 插件，而不是全新的未认证浏览器，因为 Gemini 对话通常需要用户现有的 Google 会话。
2. 按照 Chrome skill 初始化 Chrome；如果已打开 Gemini 标签页，则接管该标签页，否则在 Chrome 中打开用户提供的 Gemini URL。
3. 在 `browser` 可用后，通过 `node_repl` JS 调用导入并运行 `scripts/download_gemini_images.mjs`。
4. 使用 `scripts/package_images.sh` 打包输出目录。
5. 报告 ZIP 路径、图片数量以及是否使用了较低分辨率的回退方案。
6. 下载完成后结束对 Chrome 的控制，并在适当情况下保持用户原有的 Gemini 标签页处于打开状态。

## 主脚本

解析相对于此 skill 目录的脚本路径，然后在用于 Chrome 自动化的同一 Node REPL 会话中导入该脚本：

```js
var { downloadGeminiImagesFromChrome } = await import("/absolute/path/to/download-gemini-images/scripts/download_gemini_images.mjs");
var result = await downloadGeminiImagesFromChrome({
  browser,
  tabUrlIncludes: "gemini.google.com/app",
  expectedCount: 20,
  outputDir: `${nodeRepl.homeDir}/Downloads/gemini_conversation_images_${new Date().toISOString().slice(0, 10).replaceAll("-", "")}`
});
nodeRepl.write(JSON.stringify(result, null, 2));
```

仅当用户给出了具体数量时才设置 `expectedCount`。省略该参数可下载所有可见的 `Show the uploaded image in a lightbox` 按钮对应的图片。

## 打包

主脚本返回 `outputDir` 后，运行：

```bash
/absolute/path/to/download-gemini-images/scripts/package_images.sh "$outputDir" "$HOME/Downloads/gemini_conversation_images.zip"
```

打包脚本会创建 ZIP、运行 `zip -T`，并验证归档中包含的有序图片文件与目录中的一致。

## 回退方案

如果灯箱自动化失败，但页面明显已加载，请使用标签页的 `pageAssets` 功能：

```js
var pageAssets = await tab.capabilities.get("pageAssets");
var inventory = await pageAssets.list();
var uploaded = inventory.assets.filter(a => a.kind === "image" && a.url.includes("lh3.googleusercontent.com/gg/"));
var bundle = await pageAssets.bundle({ inventoryId: inventory.id, assetIds: uploaded.map(a => a.id) });
nodeRepl.write(JSON.stringify(bundle, null, 2));
```

这通常会获取 512px 的预览 JPEG，而不是尺寸更大的灯箱文件。使用此回退方案时，请告知用户。

## 注意事项

- 不要检查浏览器 Cookie、本地存储、密码或会话存储。
- 下载文件属于入站传输，本身不需要确认。
- 如果 Gemini 要求用户登录，请暂停并让用户在 Chrome 中完成登录。
- 如果用户希望图片顺序与对话线程一致，请使用脚本生成的有序名称：`image_01.jpg`、`image_02.jpg` 等。