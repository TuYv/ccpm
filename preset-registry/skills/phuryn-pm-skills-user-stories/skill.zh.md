---
name: user-stories
description: "Create user stories following the 3 C's (Card, Conversation, Confirmation) and INVEST criteria with descriptions, design links, and acceptance criteria. Use when writing user stories, breaking down features into backlog items, or defining acceptance criteria."
---
# 用户故事

按照 3 C（卡片、对话、确认）和 INVEST 原则创建用户故事。生成包含描述、设计链接和验收标准的用户故事。

**使用时机：** 编写用户故事、将功能拆分为多个故事、创建待办事项，或定义验收标准。

**参数：**
- `$PRODUCT`：产品或系统名称
- `$FEATURE`：要拆分为用户故事的新功能
- `$DESIGN`：设计文件链接（Figma、Miro 等）
- `$ASSUMPTIONS`：关键假设或上下文

## 分步流程

1. 根据提供的设计和上下文**分析功能**
2. **识别用户角色**和不同的用户旅程
3. **应用 3 C 框架：**
   - 卡片（Card）：简洁的标题和一句话描述
   - 对话（Conversation）：对意图的详细讨论
   - 确认（Confirmation）：清晰的验收标准
4. **遵循 INVEST 原则：**独立（Independent）、可协商（Negotiable）、有价值（Valuable）、可估算（Estimable）、小型（Small）、可测试（Testable）
5. **使用通俗易懂的语言**，确保小学毕业生能够理解
6. **链接到设计文件**，供视觉参考
7. **以结构化格式输出用户故事**

## 故事模板

**标题：** [功能名称]

**描述：** 作为一名[用户角色]，我希望[操作]，以便[收益]。

**设计：** [设计文件链接]

**验收标准：**
1. [清晰、可测试的标准]
2. [可观察的行为]
3. [系统能够正确验证]
4. [边界情况处理]
5. [性能或无障碍方面的考虑]
6. [集成点]

## 用户故事示例

**标题：** 最近浏览部分

**描述：** 作为一名在线购物者，我希望在商品页面上看到“最近浏览”部分，以便轻松回访我曾考虑过的商品。

**设计：** [Figma 链接]

**验收标准：**
1. 对于此前至少浏览过 1 件商品的每位用户，“最近浏览”部分都会显示在商品页面底部。
2. 对于在本次会话中访问第一个商品页面的用户，不显示该部分。
3. 当前商品本身不会出现在所显示的商品中。
4. 该部分展示包含图片、标题和价格的商品卡片或缩略图。
5. 每张商品卡片都会标明浏览时间（例如“5 分钟前浏览”）。
6. 点击商品卡片会将用户带到对应的商品页面。

## 输出交付物

- 针对该功能的完整用户故事集
- 每个故事都包含标题、描述、设计链接和 4-6 条验收标准
- 故事彼此独立，可以按任意顺序开发
- 故事的规模适合一个冲刺周期
- 故事引用相关的设计文档

---

### 延伸阅读

- [如何编写用户故事：终极指南](https://www.productcompass.pm/p/how-to-write-user-stories)