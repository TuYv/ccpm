---
name: job-stories
description: "Create job stories using the 'When [situation], I want to [motivation], so I can [outcome]' format with detailed acceptance criteria. Use when writing job stories, creating JTBD-style backlog items, or expressing user situations and motivations."
---
# Job Stories

使用“When [情境], I want to [动机], so I can [结果]”格式创建 Job Stories。生成具有详细验收标准的故事，重点关注用户情境和结果。

**适用场景：** 编写 Job Stories、表达用户情境和动机、创建 JTBD 风格的待办事项，或聚焦用户上下文而非角色。

**参数：**
- `$PRODUCT`：产品或系统名称
- `$FEATURE`：需要拆分为 Job Stories 的新功能
- `$DESIGN`：设计文件链接（Figma、Miro 等）
- `$CONTEXT`：用户情境或任务场景

## 分步流程

1. **识别用户情境**，即触发需求的情境
2. **定义动机**，即用户行为背后的动机
3. **明确结果**，即用户希望实现的结果
4. **应用 JTBD 框架：** 聚焦任务，而非角色
5. **创建验收标准**，验证结果是否已经实现
6. **使用可观察、可衡量的语言**
7. **链接到设计稿**或原型
8. **输出 Job Stories**，并附上详细的验收标准

## 故事模板

**标题：** [任务结果或成果]

**描述：** When [情境], I want to [动机], so I can [结果].

**设计：** [设计文件链接]

**验收标准：**
1. [正确识别情境]
2. [系统支持实现预期动机]
3. [进度或反馈清晰可见]
4. [高效实现结果]
5. [妥善处理边界情况]
6. [集成和通知正常工作]

## Job Story 示例

**标题：** 跟踪每周零食支出

**描述：** When I'm preparing my weekly allowance for snacks (情境), I want to quickly see how much I've spent so far (动机), so I can make sure I don't run out of money before the weekend (结果).

**设计：** [Figma 链接]

**验收标准：**
1. 显示支出摘要，其中包含“每周支出概览”部分
2. 记录支出时实时更新
3. 提供进度指示器（进度条显示每周预算的 0-100%）
4. 使用醒目颜色突出显示剩余预算
5. 提供详细支出日志，并按类别细分
6. 达到预算的 80% 时发送通知
7. 如果截至周四晚已达到预算的 90%，则发送周末专属提醒
8. 可轻松访问和导航至详细明细

## 输出交付物

- 该功能的一整套 Job Stories
- 每个故事均遵循“When...I want...so I can”格式
- 6-8 条以结果为重点的验收标准
- 故事突出用户情境和动机
- 提供清晰的设计稿和原型链接

---

### 延伸阅读

- [Tony Ulwick 和 Sabeen Sattar 的 Jobs-to-be-Done 大师课](https://www.productcompass.pm/p/jobs-to-be-done-masterclass-with)（视频课程）