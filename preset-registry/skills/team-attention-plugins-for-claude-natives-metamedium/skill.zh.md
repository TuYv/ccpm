---
name: metamedium
description: This skill should be used when the user is building, planning, or strategizing and the key question is whether to optimize content (what) or change form (how/medium). Trigger on "내용 vs 형식", "content vs form", "metamedium", "형식을 바꿔볼까", "새로운 포맷", "관점 전환", "perspective shift", "다른 방법 없을까", "같은 방식이 안 먹혀", "diminishing returns". Applies Alan Kay's metamedium concept to surface form-level alternatives. For requirement clarification use vague; for strategy blind spots use unknown.
---
# Metamedium：内容与形式透镜

区分**内容**（所说/所构建的东西）与**形式**（传递它所依托的媒介/结构），以此揭示真正的杠杆究竟在于优化内容，还是在于发明一种新形式。基于 Alan Kay 的「元媒介」概念。

> "换一种视角，价值 80 点智商。" — Alan Kay

## 核心概念

大多数人只改变**内容**——他们说什么、写什么、构建什么。而真正的杠杆来自改变**形式**——媒介、格式或结构本身。

| | 内容（是什么） | 形式（怎么做/媒介） |
|--|----------------|-------------------|
| 示例 | 写一篇 LinkedIn 帖子 | 构建一个从客户工作中生成帖子的工具 |
| 示例 | 手动编写单元测试 | 构建一个基于类型签名的测试生成器 |
| 示例 | 举办一场工作坊 | 发明一种让参与者共同创作产出物的格式 |
| 杠杆 | 线性——每件作品只对应一次产出 | 指数级——每种新形式都能带来无限内容 |

## 何时使用

- 规划项目时，不确定该优化产出还是流程
- 在内容优化上陷入收益递减
- 正在构建某个东西，想检验形式层面的改变是否会带来更大杠杆
- 评估正确的做法是「更多同类」还是「结构上不同的东西」

如需澄清需求，请使用 **vague** 技能。如需分析战略盲点，请使用 **unknown** 技能。

## 协议

对第 2 阶段的分叉问题，**始终使用 AskUserQuestion 工具**——绝不要用纯文本询问内容/形式的选择。

### 第 1 阶段：识别与标注

阅读用户当前的工作、计划或任务。将每个组成部分归类为内容或形式：

```
[CONTENT] Writing a blog post about AI consulting
[FORM]    Building a pipeline that turns consulting retros into blog posts
[CONTENT] Deploying a new API endpoint
[FORM]    Building a codegen that auto-generates endpoints from schemas
[CONTENT] Fixing a flaky test
[FORM]    Building a test infrastructure that prevents flaky tests by design
```

将标注结果作为简短诊断呈现给用户。

### 第 2 阶段：呈现分叉

使用 AskUserQuestion 呈现内容/形式的选择：

```
questions:
  - question: "This is currently [CONTENT/FORM]-level work. Where should effort go?"
    header: "Level"
    options:
      - label: "Proceed with content"
        description: "Optimize within the current form — faster, lower risk"
      - label: "Explore form change"
        description: "What if the medium/structure itself changed? Higher leverage"
      - label: "Content now, note form"
        description: "Do the content work, but flag the form opportunity for later"
    multiSelect: false
```

### 第 3 阶段：分支

**若选择 "Proceed with content"**：确认并继续。在输出中包含一条 `Form Opportunity` 备注，供日后参考。

**若选择 "Explore form change"**：生成 2-3 种形式替代方案。针对每种替代方案说明：

- 新形式具体是什么样子
- 它将具备哪些新属性（自动化、可重复、可扩展、可组合）
- 用于验证该形式的最小可行版本

**若选择 "Content now, note form"**：继续内容工作，并将形式机会附加到输出中。

### 输出

附加到任何交付物之后，或单独呈现：

```markdown
## Content/Form Analysis

**Current work**: [description]
**Classification**: [CONTENT / FORM]

### Form Opportunity
| | Detail |
|---|--------|
| **Alternative form** | [what it would look like] |
| **New properties** | [what it enables that current form doesn't] |
| **Minimum test** | [smallest version to validate] |
| **Status** | [exploring / noted for later / not applicable] |
```

## 元媒介之问

当陷入停滞，或优化开始收益递减时：

> **"什么样的新形式/新媒介能让这个问题彻底消失？"**

示例：
- 写更多帖子写不下去了？→ 一种能自动把客户工作转化为帖子的格式
- 测试覆盖率停滞不前？→ 一个从类型签名生成测试的工具
- 新人上手太慢？→ 一种由代码库自我讲解的自引导格式

## 俄罗斯方块测试

> 改变方块。然后你就会意识到，最初的方块是经过数学计算的。

要真正理解一种形式
