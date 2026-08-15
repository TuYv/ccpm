---
name: user-story-mapping-workshop
argument-hint: "[system or workflow]"
description: Run a user story mapping workshop with adaptive questions and a structured map output. Use when you need backbone activities, tasks, and release slices for a workflow.
intent: >-
  Guide product managers through creating a user story map by asking adaptive questions about the system, users, workflow, and priorities—then generating a two-dimensional map with backbone (activities), user tasks, and release slices. Use this to move from flat backlogs to visual story maps that communicate the big picture, identify missing functionality, and enable meaningful release planning—avoiding "context-free mulch" where stories lose connection to the overall system narrative.
type: interactive
---
## 目的
通过针对系统、用户、工作流和优先级提出自适应问题，引导产品经理创建用户故事地图，然后生成一张包含主干（活动）、用户任务和发布切片的二维地图。使用这种方法，可以从扁平的待办事项列表转向能够传达全局概貌的可视化故事地图，识别缺失的功能，并支持有意义的发布规划，从而避免故事与整个系统叙事失去联系，沦为“脱离上下文的碎料”。

这不是一个待办事项生成器，而是一个可视化沟通框架，它按照用户工作流（水平方向）和优先级（垂直方向）组织工作。

## 输入

**最适合提供：** 要绘制地图的系统或工作流。  
**同样有用：** 主要用户、你已经了解的工作流步骤，以及该地图必须帮助确定的事项（MVP 范围、发布计划）。

调用时一并提供的任何内容——技能名称后的文本、粘贴的上下文内容，或附加的 `ARGUMENTS:` 行——都视为已经给出的答案。请使用这些内容并跳过它们已经涵盖的问题；不要重复提问。

**什么都没准备？也没问题。** 工作坊首先会询问系统及其用户（Q1），然后按照引导流程继续进行。

**调用示例：** `Run a story mapping workshop for our vendor onboarding portal — output should give us a first release slice.`

## 核心概念

### 什么是用户故事地图？

故事地图（Jeff Patton）从**两个维度**组织用户故事：

**水平轴（从左到右）：** 按叙事或工作流顺序排列的活动，也就是向他人讲解系统时采用的顺序

**垂直轴（从上到下）：** 每项活动内部的优先级，最重要的任务位于顶部

**结构：**
```
Backbone (Activities across top)
↓
User Tasks (descending vertically by priority)
↓
Details/Acceptance Criteria (at the bottom)
```

### 核心原则

**主干：** 基本活动构成系统的结构核心——这些活动之间不进行优先级比较；它们共同组成叙事流程。

**步行骨架：** 所有活动中优先级最高的任务共同构成最小可行产品，也就是能够端到端运行的最小功能集合。

**肋骨：** 支持性任务在每项活动下方纵向排列，通过所处位置表示优先级。

**从左到右、从上到下的构建策略：** 跨越所有主要功能进行增量构建，而不是先完整完成一项功能，再开始另一项功能。

### 为什么这种方法有效
- **可视化沟通：** 故事地图会持续展示，充当信息辐射源，帮助团队始终关注全局概貌
- **叙事结构：** 按用户工作流而非技术架构组织内容
- **发布规划：** 水平切片可以揭示 MVP 和增量发布方案
- **识别缺口：** 揭示扁平待办事项列表所掩盖的缺失功能

### 反模式（这不是什么）
- **不是甘特图：** 故事地图展示的是优先级，而不是时间估算
- **不是技术架构：** 地图遵循用户工作流，而不是系统分层（UI → API → DB）
- **不是项目计划：** 它是一种发现和沟通工具，而不是进度安排

### 何时使用此技能
- 启动新产品或重大功能时
- 重新梳理现有待办事项（从扁平列表转为可视化地图）
- 就范围和优先级与利益相关者达成一致时
- 规划 MVP 或增量发布时

### 何时不应使用此技能
- 仅包含单个功能的项目（使用故事地图会显得过度）
- 待办事项已得到充分理解并确定优先级时
- 技术重构工作（没有可供映射的用户工作流）

---

### 引导流程的唯一事实来源

将 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 作为此技能的默认交互协议。

它定义了：
- 会话预告 + 进入模式（引导式、上下文转储、最佳推测）
- 每轮只问一个问题，并使用通俗易懂的提示语
- 进度标签（例如 Context Qx/8 和 Scoring Qx/5）
- 中断处理以及暂停/恢复行为
- 在决策点提供编号建议
- 为常规问题提供可快速选择的编号选项（适用时包括 `Other (specify)`）

此文件定义特定领域的评估内容。如果存在冲突，请遵循此文件中的领域逻辑。

## 应用

此交互式技能会提出**最多 5 个自适应问题**，每一步提供 **3-4 个编号选项**。

使用 `template.md` 获取引导议程和输出检查清单。

交互模式：如果希望采用一次一个步骤的流程，并在决策点提供编号建议、为常规问题提供可快速选择的选项，请与 `skills/workshop-facilitation/SKILL.md` 配合使用。如果用户要求一次性输出，则跳过多轮引导。

---

### 第 0 步：收集上下文（提问前）

**智能体建议：**

在创建故事地图之前，让我们先收集上下文：

**产品/功能上下文：**
- 你要映射的是什么系统或功能？
- 产品概念、PRD 草稿或现有待办事项
- 网站文案、定位材料或用户流程
- 现有用户故事（如果要从扁平待办事项过渡）

**用户上下文：**
- 目标用户画像或用户群体
- 用户研究、访谈或旅程地图
- 待完成的任务或问题陈述

**你可以直接粘贴这些内容，也可以简要描述该系统。**

---

### 问题 1：定义范围

**智能体提问：**
“你要映射什么？（范围是什么？）”

**提供 4 个编号选项：**

1. **整个产品** — “从发现到完成的完整端到端系统”（常用于新产品或全面重写）
2. **主要功能领域** — “大型产品中的特定工作流（例如‘用户引导’‘结账’‘报告’）”（常用于功能发布）
3. **用户旅程** — “特定的用户目标或待完成的任务（例如‘雇用承包商’‘报税’）”（常用于由 JTBD 驱动的映射）
4. **重新设计/重构** — “正在重建或简化的现有产品/功能”（常用于旧有系统现代化）

**或者描述你的具体范围。**

**用户回答：** [选择或自定义回答]

---

### 问题 2：识别用户/用户画像

**智能体提问：**
“此地图的主要用户是谁？（请列出用户画像或用户群体。）”

**提供 4 个编号选项：**

1. **单一角色** — “一种主要用户类型（例如，‘小企业主’）”（简化映射，适合 MVP）
2. **多个角色，共享工作流** — “不同的用户类型，但核心活动相同（例如，‘买家’和‘卖家’都会浏览商品列表）”（常见于交易平台）
3. **多个角色，不同工作流** — “不同的用户类型拥有各自独立的工作流（例如，‘管理员’与‘最终用户’）”（需要单独的地图或泳道）
4. **组织内的角色** — “不同的工作职能（例如，‘PM’、‘设计师’、‘工程师’）”（常见于内部工具）

**或者描述你的用户。**

**调整：** 使用第 0 步所提供上下文中的用户角色（原型角色、JTBD 等）

**用户回答：** [选择或自定义回答]

---

### 问题 3：生成骨干（活动）

**智能体说：**
“让我们构建骨干——即用户为实现目标而执行各项活动的叙事流程。”

**智能体根据范围（问题 1）和用户（问题 2）生成 5-8 项活动**，并按照工作流顺序从左到右排列。

**示例（如果范围 = “电子商务结账”）：**

```
Backbone Activities (left to right):

1. Browse Products
2. Add to Cart
3. Review Cart
4. Enter Shipping Info
5. Enter Payment Info
6. Confirm Order
7. Receive Confirmation
```

**智能体询问：**
“这个骨干是否涵盖了完整的工作流？我们是否应该添加、删除活动或调整活动顺序？”

**用户回答：** [批准、修改或添加自定义活动]

---

### 问题 4：生成用户任务（位于每项活动下）

**智能体说：**
“现在，让我们在每项活动下添加用户任务，并按优先级组织（顶部 = 必须具备，底部 = 最好具备）。”

**智能体为每项活动生成 3-5 个用户任务**，并按优先级从上到下排列。

**示例（针对活动 2：“添加到购物车”）：**

```
Add to Cart (Activity)
├─ Add single item to cart (must-have, walking skeleton)
├─ Adjust quantity (must-have)
├─ Add multiple items at once (should-have)
├─ Save item for later (nice-to-have)
└─ Add gift wrapping (nice-to-have)
```

**智能体对所有骨干活动重复此操作**，展示完整地图。

**智能体询问：**
“这是否涵盖了关键任务？优先级是否正确（顶部 = MVP，底部 = 后续版本）？”

**用户回答：** [批准、修改或添加自定义任务]

---

### 问题 5：确定发布切片（行走骨架 + 增量）

**智能体说：**
“让我们通过在地图上绘制水平线来定义发布切片。”

**智能体生成 3 个发布切片：**

**版本 1（行走骨架）：** 涵盖所有活动的最高优先级任务——最小化的端到端功能

**版本 2（下一个增量）：** 用于增强核心工作流的次优先级任务

**版本 3（完善/扩展）：** 第三优先级任务（最好具备的功能、边缘情况、优化）

**示例：**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Release 1 (Walking Skeleton):
- Browse products (basic list view)
- Add single item to cart
- Review cart (line items + total)
- Enter shipping info (name, address)
- Enter payment info (credit card only)
- Confirm order (basic confirmation)
- Receive email confirmation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Release 2 (Enhanced):
- Product filtering/search
- Adjust quantity in cart
- Save for later
- Multiple shipping options
- Multiple payment methods
- Order tracking link
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Release 3 (Polish):
- Product recommendations
- Guest checkout
- Gift wrapping
- Promo codes
- Advanced payment options
- Post-purchase surveys
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**智能体询问：**
“这些发布切片是否合理？我们是否应该调整范围或优先级？”

**用户回答：** [批准或修改]

---

### 输出：用户故事地图

完成流程后，智能体输出：

```markdown
# User Story Map: [Scope from Q1]

**Users:** [From Q2]
**Date:** [Today's date]

---

## Backbone (Activities)

[Activity 1] → [Activity 2] → [Activity 3] → [Activity 4] → [Activity 5] → [Activity 6]

---

## Full Story Map

### [Activity 1: Name]
- **[Task 1.1]** — Must-have (Release 1)
- **[Task 1.2]** — Should-have (Release 2)
- **[Task 1.3]** — Nice-to-have (Release 3)

### [Activity 2: Name]
- **[Task 2.1]** — Must-have (Release 1)
- **[Task 2.2]** — Should-have (Release 2)
- **[Task 2.3]** — Nice-to-have (Release 3)

[...repeat for all activities...]

---

## Release Slices

### Release 1: Walking Skeleton (MVP)
**Goal:** Minimal end-to-end functionality

**Stories:**
- [Task 1.1] — [Activity 1]
- [Task 2.1] — [Activity 2]
- [Task 3.1] — [Activity 3]
- [Task 4.1] — [Activity 4]
- [Task 5.1] — [Activity 5]
- [Task 6.1] — [Activity 6]

**Why this is the walking skeleton:** Delivers complete workflow with simplest version of each activity.

---

### Release 2: Enhanced Functionality
**Goal:** Improve core workflow with priority enhancements

**Stories:**
- [Task 1.2] — [Activity 1]
- [Task 2.2] — [Activity 2]
- [Task 3.2] — [Activity 3]
[...]

---

### Release 3: Polish & Expansion
**Goal:** Nice-to-haves, edge cases, optimizations

**Stories:**
- [Task 1.3] — [Activity 1]
- [Task 2.3] — [Activity 2]
[...]

---

## Next Steps

1. **Refine stories:** Use `skills/user-story/SKILL.md` to write detailed stories with acceptance criteria
2. **Estimate effort:** Score stories (story points, t-shirt sizes)
3. **Validate with stakeholders:** Walk through map left-to-right, confirm priorities
4. **Display map:** Print/post as information radiator for ongoing reference

---

**Ready to write user stories? Let me know if you'd like to refine the map or break down specific stories.**
```

---

## 示例

### 示例 1：优秀的故事地图（电商结账）

**Q1 回答：** “主要功能领域——电商结账工作流”

**Q2 回答：** “单一角色——在线购物者”

**Q3——生成的骨干：**
```
Browse → Add to Cart → Review Cart → Enter Shipping → Enter Payment → Confirm → Receive Confirmation
```

**Q4——生成的用户任务：**

```
Browse Products
├─ View product list (R1)
├─ Search/filter (R2)
└─ Product recommendations (R3)

Add to Cart
├─ Add single item (R1)
├─ Adjust quantity (R2)
└─ Save for later (R3)

Review Cart
├─ View line items + total (R1)
├─ Apply promo code (R2)
└─ Estimate shipping cost (R3)

[...etc...]
```

**Q5——发布切片：**
- **发布 1：** 行走骨架——没有额外功能的基础流程
- **发布 2：** 搜索、数量调整、促销码
- **发布 3：** 推荐、游客结账、礼品选项

**这样设计有效的原因：**
- 骨干遵循用户叙事（而非技术分层）
- 行走骨架交付端到端价值
- 增量发布在不破坏核心流程的情况下逐步提升完善程度

---

### 示例 2：糟糕的故事地图（技术分层）

**主干（错误）：**
```
UI Layer → API Layer → Database Layer → Deployment
```

**失败原因：**
- 不以用户为中心（用户并不关心技术架构）
- 无法以增量方式交付端到端价值
- 这是伪装成故事地图的瀑布式思维

**修正方法：**
- 按用户工作流绘制地图：“注册 → 配置设置 → 邀请团队 → 启动项目”
- 每个发布版本都交付完整的工作流，而不是单一层

---

## 常见陷阱

### 陷阱 1：伪装的扁平待办列表
**表现：** 故事地图只是一个垂直列表，没有横向叙事

**后果：** 失去沟通价值；仍然是“脱离上下文的一团乱麻”

**修正方法：** 强制采用横向结构——顶部横向排列活动，任务在其下方纵向展开

---

### 陷阱 2：以技术架构作为主干
**表现：** 主干 =“前端 → 后端 → 数据库”

**后果：** 不以用户为中心，无法以增量方式交付价值

**修正方法：** 主干应遵循用户工作流，而不是系统分层

---

### 陷阱 3：功能完备式瀑布开发
**表现：** 发布版本 1 =“完整构建活动 1”，发布版本 2 =“完整构建活动 2”

**后果：** 在所有活动完成之前，无法交付端到端价值

**修正方法：** 步行骨架 = 横跨所有活动的薄切片，并逐步增强

---

### 陷阱 4：过早加入过多细节
**表现：** 试图预先绘制每个边界情况和验收标准

**后果：** 陷入分析瘫痪，丢失整体视角

**修正方法：** 从主干和高层级任务开始，之后再逐步细化

---

### 陷阱 5：将地图隐藏在工具中
**表现：** 故事地图只存在于 Jira/Miro 中，从不展示

**后果：** 失去其作为信息辐射器的价值

**修正方法：** 将地图打印出来或张贴在实体空间中；让团队每天都能看到它

---

## 参考资料

### 相关技能
- `skills/user-story-mapping/SKILL.md` — 包含故事地图模板的组件技能
- `skills/user-story/SKILL.md` — 将地图中的任务转换为详细的用户故事
- `skills/proto-persona/SKILL.md` — 定义用于绘制地图的用户
- `skills/jobs-to-be-done/SKILL.md` — 为主干活动提供依据

### 外部框架
- Jeff Patton，*用户故事地图*（2014）— 故事地图框架的起源
- Jeff Patton，“新的用户故事待办列表是一张地图”（博客）— 解释主干概念

### Dean 的工作
- [如果 Dean 有故事地图相关资源，请在此处添加链接]

### 来源
- 派生自 `skills/user-story/SKILL.md`、`skills/user-story-splitting/SKILL.md` 和 `skills/user-story-mapping/SKILL.md`。

---

**技能类型：** 交互式
**建议的文件名：** `user-story-mapping-workshop.md`
**建议的存放位置：** `/skills/interactive/`
**依赖项：** 使用 `skills/user-story-mapping/SKILL.md`、`skills/user-story/SKILL.md`、`skills/proto-persona/SKILL.md`