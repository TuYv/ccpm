---
name: sprint-plan
description: "Plan a sprint with capacity estimation, story selection, dependency mapping, and risk identification. Use when preparing for sprint planning, estimating team capacity, selecting stories, or balancing sprint scope against velocity."
---
## Sprint 规划

通过估算团队容量、选择并排序用户故事以及识别风险来规划 Sprint。

### 上下文

你正在帮助为 **$ARGUMENTS** 规划一个 Sprint。

如果用户提供了文件（待办事项、速率数据、团队成员名单或之前的 Sprint 报告），请先阅读这些文件。

### 指示

1. **估算团队容量**：
   - 团队成员数量及其可用时间（休假、会议、值班）
   - 历史速率（最近 3 个 Sprint 的平均故事点数）
   - 容量缓冲：为意外工作、缺陷和技术债务预留 15-20%
   - 以故事点或理想工时计算可用容量

2. **审查并选择用户故事**：
   - 从已排序的待办事项中选择（优先级最高的优先）
   - 确认每个用户故事符合就绪定义（验收标准清晰、已完成估算、没有阻塞项）
   - 标记提交前需要细化的用户故事
   - 达到容量上限后停止添加用户故事

3. **梳理依赖关系**：
   - 识别依赖其他用户故事或外部团队的用户故事
   - 适当地安排有依赖关系的用户故事顺序
   - 标记外部依赖及其负责人
   - 识别关键路径

4. **识别风险并制定缓解措施**：
   - 不确定性或复杂性较高的用户故事
   - 可能延期的外部依赖
   - 知识集中风险（只有一个人能够完成相关工作）
   - 为每项风险提出缓解措施

5. **创建 Sprint 计划摘要**：

   ```
   Sprint Goal: [One sentence describing what success looks like]
   Duration: [2 weeks / 1 week / etc.]
   Team Capacity: [X story points]
   Committed Stories: [Y story points across Z stories]
   Buffer: [remaining capacity]

   Stories:
   1. [Story title] — [points] — [owner] — [dependencies]
   ...

   Risks:
   - [Risk] → [Mitigation]
   ```

6. **定义 Sprint 目标**：用一句清晰的话概括 Sprint 交付的主要价值。

逐步思考。保存为 Markdown。

---

### 延伸阅读

- [产品负责人和产品经理：有什么区别？](https://www.productcompass.pm/p/product-manager-vs-product-owner)