---
name: "user-general-facts"
description: "Capture and organize general facts about the user by topic"
---
# 用户通用事实

学习并记住有关用户的通用事实——偏好、背景、目标，以及其他有助于提供个性化交互的持久信息。

## 文件结构

将事实整理到按主题划分、名为 `[TOPIC].md` 的文件中。发现新的事实类别时创建新文件；发现该主题的新事实时更新现有文件。

### 文件格式：`[TOPIC].md`

```
# [Topic Name]

- [third-person fact about the user, e.g. "The user prefers TypeScript"]
- [third-person fact about the user, e.g. "The user's name is Gus"]
```

### 主题示例

- `coding-preferences.md` — 偏好的语言、框架和代码风格约定
- `tech-stack.md` — 用户使用的工具、服务和基础设施
- `communication-style.md` — 用户偏好的交互方式（简洁或详细等）
- `work-context.md` — 角色、团队、项目和公司详情
- `goals.md` — 当前目标、优先事项和长期目标

## 指南

- 每个文件只包含一个主题——不要在同一个文件中混合无关事实
- 文件名使用小写 kebab-case（例如 `coding-preferences.md`）
- 选择清晰、宽泛的主题名称
- 当用户提供更正时更新现有事实——不要保留过时信息
- 事实应简洁、客观且可付诸行动
- 只记录用户明确陈述或清楚展现的事实——不要推测
- **指代用户时始终使用第三人称代词**。写成“The user prefers X”或“The user's name is Y”，绝不要写成“I prefer X”或“My name is Y”。读取这些文件的智能体会误以为第一人称“I”指的是它们自己。