---
name: career-ops-plugin-gmail
description: How to pull job leads from a Gmail label into the career-ops pipeline.
license: MIT
---
# gmail 插件

读取一个 Gmail 标签，从真实（通过 DMARC 验证）的邮件中提取干净的职位链接，并将其作为线索返回。该引擎将它们写入 pipeline。

## Command

- `node plugins.mjs run gmail` — 从已配置的标签中导入新的潜在线索。

## Setup

将 `GMAIL_CLIENT_ID` + `GMAIL_CLIENT_SECRET` + `GMAIL_REFRESH_TOKEN` 放入 `.env`
（OAuth 桌面客户端 + 从授权流程获取的刷新令牌）。在 `config/plugins.yml` 中配置
标签与回溯天数：

```yaml
plugins:
  gmail: { enabled: true, label: "Job Leads", days_back: 7 }
```

## Data it produces

`Job[]` ({ title, url, company, location }) — 该引擎会与
pipeline 进行去重并追加新条目。它在 `data/gmail-state.json` 中维护自己的已处理消息游标，以避免重复读取同一封邮件。
