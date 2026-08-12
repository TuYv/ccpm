---
name: generate-prompt-request
description: This skill should be used to generate a "prompt request" one-pager that summarizes the current session for a pull request. It produces one consolidated User block folding together every ask and decision from the session, plus one Assistant block summarizing what was built. Use it when the user asks to "generate a prompt request", recap or summarize the session for a PR, or capture what was requested. Also use it automatically when opening a pull request or writing a PR description, so the PR body includes the asks and decisions behind the change. Works on the current session only and outputs inline markdown ready to paste into a PR.
---
# 生成提示请求

## 概述

将当前工作会话整理成一份紧凑的拉取请求“提示请求”单页文档：
用一个 `User:` 块汇总会话期间提出的所有要求和做出的所有决定，
然后用一个 `Assistant:` 块总结实际构建或完成的内容。这是一份供审阅者快速浏览的
单页文档，而不是逐轮对话记录。

## 何时使用

- 用户要求“生成提示请求”、为 PR 总结会话，或记录所提出的需求。
- 在创建拉取请求或编写 PR 描述时自动使用。生成此内容并将其包含在 PR 正文中，
  以便审阅者了解变更背后的要求和决定。仓库的 AGENTS.md 或
  CLAUDE.md 可以用一行配置启用此功能，例如：“创建 PR 时，调用
  generate-prompt-request skill，并将其输出包含在 PR 正文中。”

## 输出格式

直接在回复中以内联形式呈现结果。不要写入文件。严格按照以下结构生成：

```
# <Session topic> — Prompt Request

**User:**
> <one consolidated request: all the asks first, then "Decisions made along the way: ..."
> folding in every choice the user made or approved>

**Assistant:**
> <a short summary of what was actually built or done, plus status>
```

## 构建方法

1. 重新阅读整个当前会话，从第一条用户消息一直读到现在。
2. 收集每一项不同的要求或需求，以及用户做出或批准的每一项决定，
   包括会话过程中出现的决定，例如技术栈选择、“保持简单”的约束或被放弃的功能。
3. 编写一个 `User:` 块：将所有内容压缩成一个自然流畅的请求。先说明他们想要什么，
   然后以“过程中做出的决定：……”结尾，在同一段中列出所有已确定的选择。
4. 编写一个 `Assistant:` 块：简洁总结交付了什么，包括构建的内容、关键属性和状态。
   使用两到四句话。
5. 标题：根据会话的主要交付物拟定，例如“白标模板 — 提示请求”。

## 规则

- 仅限当前会话。绝不要虚构本次会话中未出现的要求、决定或结果。
  如果某项内容不确定，请将其省略。
- 高度压缩。每个块只写一个短段落。不要使用多轮对话记录，也不要添加单独的摘要或
  注意事项部分。
- 使用加粗的 `User:` / `Assistant:` 标签，并将内容放在块引用中。
- 正文中不要使用长破折号或短破折号。改用句号、逗号，或重新组织句子。
- 在生成 PR 的过程中调用时，只输出该块，以便直接粘贴到 PR 正文中。

## 示例

以下是一次设计白标模板应用的会话所生成的真实单页文档：

```
# White-Label Template — Prompt Request

**User:**
> I want a white-label, open-source GitHub template built on our existing B2B Agents API
> (`/v1`), a bare-bones version of our B2C dashboard that people fork and rebrand. It needs
> workspaces per user (members + shareable invite links) and the basics the API supports:
> instance lifecycle (create / list / start / stop / restart / update / resize / delete),
> budget + usage, and opening each agent's own UIs (dashboard / terminal / files) via signed
> URLs. No Stripe. Decisions made along the way: one server-side `sk_live_` key with logical
> app-level workspaces (there is no API to mint per-tenant Agent37 keys, so tenancy is enforced
> in our own layer); no in-app chat, just open the agent's real UIs in a new tab; stack is
> Next.js + Supabase (magic-link auth, Postgres, RLS); and keep it simple, no Docker (setup
> provisions a hosted Supabase project for you).

**Assistant:**
> Built it as a standalone Next.js 15 repo wrapping `/v1`: Supabase magic-link auth, logical
> workspaces with admin/viewer roles and invite links, the full instance lifecycle plus
> budget/usage, signed-url "open" actions, and a template list, backed by a Supabase `instances`
> mirror refreshed from `/v1`. Isolation is RLS plus server-side role checks, the `sk_live_` key
> stays server-side, branding is env-only, and there is no Stripe. Setup provisions a hosted
> Supabase project via an access token (no Docker); typecheck and build pass. Not pushed, the
> adopter creates the GitHub repo.
```