---
name: gmail
description: This skill should be used when the user asks to "check email", "read emails", "send email", "reply to email", "search inbox", or manages Gmail. Supports multi-account Gmail integration for reading, searching, sending, and label management.
---
# Gmail 技能

通过 Gmail API 管理邮件——支持跨多个 Google 账户读取、搜索、发送和整理邮件。

## 账户设置

**在运行任何命令之前，请先读取 `accounts.yaml` 查看已注册的账户。**

> 如果 `accounts.yaml` 缺失或为空 → 阅读 `references/setup-guide.md` 进行初始设置

```yaml
# accounts.yaml example
accounts:
  personal:
    email: user@gmail.com
    description: Personal Gmail
  work:
    email: user@company.com
    description: Work account
```

## 邮件发送工作流（5 个步骤）

发送邮件时，**使用 TaskCreate 创建 5 个任务**，并按顺序执行：

| 步骤 | 任务 | 关键操作 |
|------|------|----------|
| 1 | 收集上下文 | **并行**运行 Explore SubAgents：收件人信息、相关项目、背景上下文 |
| 2 | 查看历史对话 | 搜索 `--query "to:recipient OR from:recipient newer_than:90d"` → 通过 AskUserQuestion 选择邮件会话 |
| 3 | 起草邮件 | 撰写草稿 → 通过 AskUserQuestion 征求反馈 |
| 4 | 测试发送 | 向用户自己的地址发送 `[TEST]` 邮件 → 在 Gmail 网页版中打开 → 请求确认 |
| 5 | 正式发送 | 发送给收件人 → 报告完成 |

**签名**：在所有外发邮件末尾追加 `---\nSent with Claude Code`

### 工作流示例：“给 John 发送一封会议邮件”

```
1. Create 5 Tasks
2. Step 1: Run parallel Explore SubAgents
   - Search recipient (John) info (partners/, projects/, context.md, etc.)
   - Search meeting context (calendar, recent meeting notes, etc.)
3. Step 2: Search "to:john@company.com OR from:john@company.com"
   → If previous conversation exists, AskUserQuestion (reply/new email)
4. Step 3: Draft email → AskUserQuestion (proceed/revise)
5. Step 4: Test send to my email → Open in Gmail web (`open "https://mail.google.com/mail/u/0/#inbox/{message_id}"`) → Request confirmation
6. Step 5: Actual send → Done
```

## CLI 快速参考

```bash
# List messages
uv run python scripts/list_messages.py --account work --query "is:unread" --max 10

# Send email
uv run python scripts/send_message.py --account work --to "user@example.com" --subject "Subject" --body "Content"

# Check profile
uv run python scripts/manage_labels.py --account work profile
```

> 详细 CLI 用法：`references/cli-usage.md`
> 搜索查询参考：`references/search-queries.md`

## 在网页版中查看邮件

发送后，使用返回的 Message ID 直接在 Gmail 网页版中查看：

```bash
# URL format
https://mail.google.com/mail/u/0/#inbox/{message_id}

# Example: Open in browser after test send
open "https://mail.google.com/mail/u/0/#inbox/19c145bbd47ddd01"
```

> **注意**：`u/0` 是第一个登录的账户，`u/1` 是第二个账户

## 文件结构

```
skills/gmail/
├── SKILL.md
├── accounts.yaml           # Account metadata
├── scripts/                # CLI scripts
├── references/
│   ├── setup-guide.md      # Initial setup guide
│   ├── cli-usage.md        # Detailed CLI usage
│   ├── search-queries.md   # Search query reference
│   └── credentials.json    # OAuth Client ID (gitignore)
├── assets/
│   ├── accounts.default.yaml  # Account config template
│   ├── email-templates.md     # Email body templates
│   └── signatures.md          # Signature templates (Plain/HTML)
└── accounts/               # Per-account tokens (gitignore)
```

## 错误处理

| 情况 | 解决方法 |
|-----------|------------|
| accounts.yaml 缺失 | 阅读 `references/setup-guide.md` 进行初始设置 |
| Token 缺失 | 引导用户运行 `setup_auth.py --account <name>` |
| Token 过期 | 自动刷新；若失败，则引导重新认证 |
