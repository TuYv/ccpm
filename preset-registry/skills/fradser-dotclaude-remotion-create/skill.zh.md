---
name: remotion-create
description: Creating a new Remotion video
metadata:
  tags: remotion
---
这些是创建新的 Remotion 项目和合成的说明。  
如果接下来的任务并非此项，请参阅 [Remotion 最佳实践](../remotion-best-practices/SKILL.md)

## 搭建项目

如果项目已存在，请跳过此步骤。
确保已安装 Node.js 和 Git，并且当前文件夹适合用于创建新项目。

使用以下命令搭建项目：

```bash
npx create-video@latest --yes --blank --no-tailwind my-video
cd my-video
npm i
```

将 `my-video` 替换为合适的项目名称。

## 设计视频

保留搭建好的项目，并添加 React 标记。遵循 [Remotion React 标记最佳实践](../remotion-markup/SKILL.md)和[视频布局规则](video-layout.md)，获取视频优先的布局和文本大小调整指南。

## 交互性最佳实践

按照 [Remotion 交互性最佳实践](../remotion-interactivity/SKILL.md)组织 React 标记，可让用户在 Studio 中进行编辑，并将更改写回代码。

## TailwindCSS

如果要求使用 Tailwind，请参阅 [tailwind.md](tailwind.md)，了解如何在 Remotion 中使用 TailwindCSS。

## 启动预览

```bash
npx remotion studio --no-open
```

这将启动一个长时间运行的进程，并输出用于预览的服务器 URL。

## 后续操作

视频创建过程已完成。
对于后续提示，请使用 [Remotion 最佳实践](../remotion-best-practices/SKILL.md)