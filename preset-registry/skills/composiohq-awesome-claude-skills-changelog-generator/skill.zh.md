---
name: changelog-generator
description: Automatically creates user-facing changelogs from git commits by analyzing commit history, categorizing changes, and transforming technical commits into clear, customer-friendly release notes. Turns hours of manual changelog writing into minutes of automated generation.
---
# 变更日志生成器

这个技能可将技术性的 Git 提交转化为精致、用户友好的变更日志，让你的客户和用户真正看得懂并感到受益。

## 何时使用本技能

- 为新版本准备发布说明
- 创建每周或每月的产品更新总结
- 为客户记录变更内容
- 为应用商店提交撰写变更日志条目
- 生成更新通知
- 创建内部发布文档
- 维护公开的变更日志/产品更新页面

## 本技能作用

1. **扫描 Git 历史**：分析特定时间段或版本之间的提交
2. **对变更进行分类**：将提交分组到逻辑类别（功能、改进、修复、重大变更、安全性）
3. **从技术语言到用户友好语言转换**：将开发者提交转化为用户可理解的表述
4. **专业排版**：生成清晰、结构化的变更日志条目
5. **过滤噪音**：排除内部提交（重构、测试等）
6. **遵循最佳实践**：应用变更日志规范并匹配你的品牌语气

## 使用方法

### 基本用法

从你的项目仓库中：

```
Create a changelog from commits since last release
```

```
Generate changelog for all commits from the past week
```

```
Create release notes for version 2.5.0
```

### 使用具体日期范围

```
Create a changelog for all commits between March 1 and March 15
```

### 使用自定义规范

```
Create a changelog for commits since v2.4.0, using my changelog 
guidelines from CHANGELOG_STYLE.md
```

## 示例

**User**: "Create a changelog for commits from the past 7 days"

**Output**:
```markdown
# Updates - Week of March 10, 2024

## ✨ New Features

- **Team Workspaces**: Create separate workspaces for different 
  projects. Invite team members and keep everything organized.

- **Keyboard Shortcuts**: Press ? to see all available shortcuts. 
  Navigate faster without touching your mouse.

## 🔧 Improvements

- **Faster Sync**: Files now sync 2x faster across devices
- **Better Search**: Search now includes file contents, not just titles

## 🐛 Fixes

- Fixed issue where large images wouldn't upload
- Resolved timezone confusion in scheduled posts
- Corrected notification badge count
```

**启发自：** 来自 Lenny 的新闻通讯中 Manik Aggarwal 的使用案例

## 提示

- 在你的 git 仓库根目录运行
- 为定向变更日志指定日期范围
- 使用你的 CHANGELOG_STYLE.md 来保持格式一致
- 发布前复核并调整生成的变更日志
- 直接将输出保存到 CHANGELOG.md

## 相关用例

- 创建 GitHub 发布说明
- 撰写应用商店更新说明
- 生成用户电子邮件更新
- 创建社交媒体公告帖子
