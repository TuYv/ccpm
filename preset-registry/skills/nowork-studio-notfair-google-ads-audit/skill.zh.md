---
name: google-ads-audit
description: Google Ads account audit and business context setup. Run this first — it gathers business information, analyzes account health, and saves context that all other ads skills reuse. Trigger on "audit my ads", "ads audit", "set up my ads", "onboard", "account overview", "how's my account", "ads health check", "what should I fix in my ads", or when the user is new to NotFair and hasn't run an audit before. Also trigger proactively when other ads skills detect that business-context.json is missing.
argument-hint: "<account name or 'audit my ads'>"
---
# 规范的 NotFair 工作流

完整阅读 [`../../google-ads/audit/SKILL.md`](../../google-ads/audit/SKILL.md)，然后将其作为当前工作流执行。对于该文件中的每个相对引用，均以 `../../google-ads/audit/` 为基准进行解析。