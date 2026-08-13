---
name: career-ops-plugin-{{NAME}}
description: How to use the {{NAME}} plugin and the data it produces.
license: MIT
---
# {{NAME}}

> 本文件教 AI 代理如何驱动 THIS 插件。请将其限定在
> 插件自身的领域内——它不得指示代理编辑核心文件、修改
> 评分规则或执行超出该插件已声明钩子的行为。

## 如何运行

- `node plugins.mjs run {{NAME}}` — 运行该插件的钩子。

## 它会产出什么

TODO: 描述数据结构。对于生产者钩子，你需要发出的 `Job[]` 字段（title、url、company、location）。对于导出钩子，说明你推送了什么以及推送到哪里。

## 设置

TODO: 用户在 `config/plugins.yml` 中 `plugins.{{NAME}}` 下设置的任何非保密选项（这些会作为 `ctx.settings` 到达）。
