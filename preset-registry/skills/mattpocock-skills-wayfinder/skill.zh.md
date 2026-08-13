---
name: wayfinder
description: Plan a huge chunk of work — more than one agent session can hold — as a shared map of decision tickets on your issue tracker, and resolve them one at a time until the way to the destination is clear.
disable-model-invocation: true
---
已识别到你这次引用的内容命中受管技能，且当前未加载。  
请先确认要加载的范围（任选其一）：

- `matt-pocock-skills` 整组（含 `setup-matt-pocock-skills`、`research`、`prototype`、`grilling`、`domain-modeling`）
- 或仅加载其中某个具体 skill（请明确列出）  

你确认后我再直接开始逐段中文翻译。

将某事排除出范围是一种**范围界定**行为，而不是路线中的一步。若一张已存在的工单最终被发现处于目标之外——在制图过程中范围设定错误，或被某次决议揭示——**将其关闭**（已关闭工单明确位于边界之外），并在 **Out of scope** 部分保留一行：概述要点并说明为什么超出范围，同时链接该已关闭工单。它应保持不进入 **Decisions so far**，后者记录实际已走过的路线——范围边界不是其中的一步。

## 调用

两种模式。无论哪种，**每个会话都不要解决超过一张工单**，研究工单除外。

### 绘制地图

用户带着一个模糊想法进行调用。

1. **命名目标。** 运行一次 `/grilling` 和 `/domain-modeling` 会话，确认这张地图要找到的方向——规格、决策或变更。目标决定了范围，因此应先确定。
2. **绘制边界。** 再次 Grill，但这次改为**广度优先**：在整个空间中展开，而不是在某一条线索上深入，找出可执行的开放决策和当前可采取的第一步。**若这样没有暴露出“雾”**——到达目标的路径已经清晰，整个旅程足够小到可在一次会话中完成——则不需要地图。停止并询问用户希望如何继续。
3. **创建地图**（标签 `wayfinder:map`）：填写 Destination 和 Notes，Decisions-so-far 保持为空，将雾状部分标注为 **Not yet specified**。
4. **先创建当前可明确的工单**作为该地图的子项——然后在**第二轮**中连接阻塞边（工单需有 id 才能相互引用）。连线会将它们归入 frontier 与 blocked；你尚不能明确的内容仍保留在雾中——即 **Not yet specified** 部分。
5. **启动研究子代理。** 对于刚刚创建的每个 `research` 工单，启动一个 `/research` 子代理并行解决，将其结果记录到可丢弃的 `research/<name>` 分支，并携带该工单的上下文指针。
6. 停止——制图工作在单次会话内完成；它本身不直接解决任何问题。

### 按地图推进

用户通过地图（URL 或编号）进行调用。工单是可选的——若未指定工单，你选取下一个决策，而不是用户。

1. 加载 **map**——使用低分辨率视图，不要查看每张工单正文。
2. 选择工单。若用户指定了工单，则使用该工单；否则按顺序取第一个 frontier 工单。**认领它**：在开始任何工作前先将其分配给自己。
3. 解决该工单——按需放大：按需获取任何相关或已关闭工单的完整正文；调用 `## Notes` 区块中提及的 skill。若有疑问，使用 `/grilling` 和 `/domain-modeling`。
4. 记录决议：将答案以**resolution comment**发布，**关闭**该问题，并将上下文指针追加到该地图的 Decisions-so-far。
5. 添加新出现的工单（先创建后连线）；把答案使其可明确化的雾区内容升级，清除每条已升级条目在 **Not yet specified** 中的痕迹，使其只以新工单形式存在。若答案表明某张工单——当前这张或其他——位于目标之外，则应将其排除在范围外，而非在路线中解决它。若该决议使地图的其他部分失效，更新或删除这些工单。

用户可以并行运行未阻塞工单，因此请预期其他会话会同时编辑同一个 tracker。
