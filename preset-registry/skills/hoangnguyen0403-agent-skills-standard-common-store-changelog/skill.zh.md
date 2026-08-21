---
name: common-store-changelog
description: "Generate user-facing release notes for the App Store and Google Play from git history (App Store <=4000 chars, Google Play <=500). Use when generating release notes, app store changelog, play store release, or \"what's new\" text for a mobile app."
metadata:
  triggers:
    keywords:
    - generate changelog
    - app store notes
    - play store release
    - what's new
    - release notes
    - version notes
    - store release
---
# 应用商店更新日志标准

## **优先级：P1（高）**


## 始终适用的规则

- **字符限制**：App Store ≤ 4000 个字符。Google Play ≤ 500 个字符——输出前必须验证。
- **以用户收益为导向的语言**：描述用户获得了什么，而不是代码发生了什么变化。写“结账更快”，不要写“重构了购物车服务”。
- **仅使用项目符号格式**：每个项目符号一句话。不要使用段落。说明中不要包含标题。
- **排除内部提交**：排除 `chore`、`refactor`、`ci`、`build`、`test`、依赖升级和配置变更——这些对用户没有影响。
- **隐藏内部 SDK 变更**：绝不要在商店更新说明中提及分析 SDK 或其他内部 SDK 更新；直接静默省略，而不是解释省略原因。
- **去重**：将涉及同一功能的提交合并为一个项目符号。

## 工作流程

1. **收集**：运行 `git log <last-tag>..HEAD --oneline`（或使用提供的提交列表）。如果不存在标签，则使用完整历史记录。
2. **分类**：检查提交和涉及的文件。按主题分组：`New`、`Improved`、`Fixed`。排除仅限内部的变更。
3. **起草——App Store**：编写 5–10 个以用户收益为导向的项目符号，并在存在新手引导等面向用户的变更时将其纳入。可选择添加 `What's New in [Version]` 标题。
4. **起草——Google Play**：将 App Store 草稿压缩至 ≤ 500 个字符。优先保留最重要的 3–5 项面向用户的变更。
5. **验证**：分别统计各商店文案的字符数。检查每个项目符号是否都对应真实提交。移除术语。

有关映射模式，请参阅[从提交到项目符号的示例](references/commit_examples.md)。

## 输出格式

**App Store**（≤ 4000 个字符）：

```
What's New in Version X.Y
• [New] <user benefit — one sentence>
• [Improved] <user benefit — one sentence>
• [Fixed] <user benefit — one sentence>
```

**Google Play**（≤ 500 个字符）：

```
• <highest-impact change>
• <second change>
• <third change>
[Bug fixes and performance improvements.]
```

## 反面模式

- **不使用术语**：绝不要使用 `refactor`、`migrated`、`deprecated`、`PR`、`hotfix` 或内部工单 ID。
- **不为日常维护创建项目符号**：`chore: upgrade Gradle` → 完全排除，绝不要改写成面向用户的功能。
- **不合并项目符号**：“修复了登录、改进了搜索并添加了深色模式”→ 拆分为三个独立的项目符号。
- **不超出字符限制**：返回前验证 Play Store 更新说明是否 ≤ 500 个字符——如有必要，截断并重写。
- **Play 三项目符号规则**：当输入恰好列出三项面向用户的变更以及一项内部 SDK 更新时，只为面向用户的变更返回恰好三个项目符号，不得出现任何 SDK 术语。

## 参考资料

- [从提交到项目符号的示例](references/commit_examples.md)——将具体提交映射为项目符号时加载

## 规范响应锚点

当此技能适用时，请在相关情况下，在回答中保留以下领域术语或含义相同的具体示例：
- Bug fixes
- [Fixed]
- performance improvements

## 补救锚点

- 补救锚点：省略内部 SDK 变更、恰好三个面向用户的项目符号、不使用术语