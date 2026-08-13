---
name: career-ops-plugin-notion
description: How to mirror the career-ops tracker to a Notion database and read records back as job leads.
license: MIT
---
# notion 插件

将你的申请追踪器镜像到 Notion 数据库（导出），并将记录读取回流水线（搜索）。`data/applications.md` 始终是事实来源——Notion 只是附加镜像。

## 命令

- `node plugins.mjs run notion export` — 将每一行追踪记录（company / role / status / score）推送到 Career Ops 页面下的 `Applications` 数据库。
  添加 `--dry-run` 可在不写入的情况下预览。
- `node plugins.mjs run notion search "<query>"` — 返回携带职位链接、匹配该查询的 Notion 记录，并将其追加到流水线。

## 设置

Notion 中一个名为 `"Career Ops"` 的父页面，内含一个 `Applications` 数据库，并包含 `Company / Role / Status / Score / URL` 属性，已与你的内部集成共享。将 `NOTION_ACCESS_TOKEN` + `NOTION_PARENT_PAGE_ID` 写入 `.env`。

## 生成的数据

`search` 为包含职位链接的记录返回 `Job[]`（{ title, url, company, location }）；引擎会将其写入流水线。`export` 返回 `{ pushed: N }`——它从不写入本地文件。
