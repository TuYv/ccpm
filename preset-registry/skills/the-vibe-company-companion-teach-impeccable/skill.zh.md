---
name: teach-impeccable
description: One-time setup that gathers design context for your project and saves it to your AI config file. Run once to establish persistent design guidelines.
user-invokable: true
---
为该项目收集设计背景信息，然后将其持久化，供所有未来会话使用。

## 第 1 步：探索代码库

在提问之前，先彻底扫描项目，尽可能发现你能了解到的信息：

- **README 和文档**：项目目的、目标受众、任何明确陈述的目标
- **Package.json / 配置文件**：技术栈、依赖项、现有的设计库
- **现有组件**：当前使用的设计模式、间距、排版
- **品牌资产**：Logo、网站图标、已定义的颜色值
- **Design tokens / CSS 变量**：现有的配色方案、字体栈、间距比例
- **任何样式指南或品牌文档**

记录你已了解的内容以及尚不清楚的内容。

## 第 2 步：提出以用户体验为中心的问题

停下来，调用 AskUserQuestionTool 进行澄清。只关注你无法从代码库中推断出的内容：

### 用户与目的
- 谁在使用它？他们使用时的场景是什么？
- 他们想要完成什么任务？
- 界面应该唤起什么情绪？（自信、愉悦、平静、紧迫感等）

### 品牌与个性
- 你会用哪 3 个词来描述品牌个性？
- 有没有能够体现正确感觉的参考网站或应用？具体是它们的哪些方面？
- 这个项目明确*不应该*是什么样子？有没有反面参考？

### 审美偏好
- 对视觉方向有没有强烈偏好？（极简、大胆、优雅、俏皮、技术感、自然有机等）
- 浅色模式、深色模式，还是两者都要？
- 有没有必须使用或必须避免的颜色？

### 无障碍与包容性
- 有具体的无障碍要求吗？（WCAG 等级、已知的用户需求）
- 是否需要考虑减少动态效果、色盲或其他辅助适配？

对于通过代码库探索已经能明确回答的问题，直接跳过。

## 第 3 步：撰写设计背景

将你的发现和用户的回答综合整理成一个 `## Design Context` 小节：

```markdown
## Design Context

### Users
[Who they are, their context, the job to be done]

### Brand Personality
[Voice, tone, 3-word personality, emotional goals]

### Aesthetic Direction
[Visual tone, references, anti-references, theme]

### Design Principles
[3-5 principles derived from the conversation that should guide all design decisions]
```

将这一小节写入项目根目录的 CLAUDE.md。如果该文件已存在，则追加或更新 Design Context 小节。

确认完成，并总结此后将指导所有后续工作的关键设计原则。
