---
name: pr-create
description: Use when explicitly creating or updating a Basic Memory pull request. This compatibility entry point delegates the full workflow to pull-request and the latest-head Codex gate to pr-review-loop.
---
# 创建 Basic Memory PR

完整应用 `pull-request` 来创建或更新拉取请求。使用
`pr-description` 编写正文，并在 PR 打开或发生实质性更新后立即进入
`pr-review-loop`。此技能绝不会合并 PR。

## 兼容性

`$pr-create` 仍可用于现有提示词，但其原有的 BM Bossbot
和自动 PR 信息图工作流已被弃用。不要等待已删除的
`BM Bossbot Approval` 状态或 `.github/workflows/bm-bossbot.yml`。

如果旧版 `$pr-create "<theme>"` 提示词包含图片主题，请勿添加
已弃用的托管主题或来源信息块。说明自动 PR
图片流程已不再属于此工作流。

## 工作流

1. 阅读并遵循 `pull-request`，以处理分支规范、验证、推送以及
   PR 创建或复用。
2. 创建或实质性更新 PR 正文时，阅读并遵循 `pr-description`。
3. 确认提交已签署，标题遵循仓库的语义化
   PR 标题格式，并且针对变更范围的适当验证已通过。
4. 推送分支并创建或复用 PR。不要启用自动合并。
5. 针对最新的 head SHA 阅读并遵循 `pr-review-loop`。仅 CI 通过
   并不代表已获批准。
6. 如果 Codex 或 CI 报告阻塞问题，请使用 `fix-pr-issues`，推送修复，并
   针对新的 head 重新启动 `pr-review-loop`。

## 报告

返回 PR URL、当前 head SHA、已运行的验证、检查状态以及 Codex
门禁证据。明确报告待处理或阻塞状态。除非
用户另行请求且当前 head 门禁允许，否则不要合并。