---
name: my-first-skill
description: Example skill demonstrating Anthropic SKILL.md format. Load when learning to create skills or testing the OpenSkills loader.
---
# 我的第一个 Skill

这是一个演示 Anthropic SKILL.md 格式的示例 Skill。

## 用途

此 Skill 展示了如何使用渐进式披露为 AI 编码智能体构建流程指导。

## 何时使用

在以下情况下加载此 Skill：
- 学习 Skill 的工作原理
- 测试 OpenSkills 加载器
- 了解 SKILL.md 格式

## 说明

要创建一个 Skill：

1. 创建目录：`mkdir my-skill/`
2. 添加包含 YAML 前置元数据的 SKILL.md：
   ```yaml
   ---
   name: my-skill
   description: When to use this skill
   ---
   ```
3. 使用祈使形式编写说明（不要使用第二人称）
4. 根据需要引用捆绑资源

## 捆绑资源

有关 SKILL.md 规范的详细信息：

请参阅 `references/skill-format.md`

## 最佳实践

- 使用祈使形式/不定式形式编写：“要执行 X，请执行 Y”
- 不要使用第二人称：避免使用“你应该……”
- 将 SKILL.md 控制在 5,000 字以内
- 将详细内容移至 references/
- 使用 scripts/ 存放可执行代码
- 使用 assets/ 存放模板和输出文件

## 资源解析

加载此 Skill 时，会提供基础目录：

```
Base directory: /path/to/my-first-skill
```

相对路径从基础目录开始解析：
- `references/skill-format.md` → `/path/to/my-first-skill/references/skill-format.md`
- `scripts/helper.sh` → `/path/to/my-first-skill/scripts/helper.sh`