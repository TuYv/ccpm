---
name: efficient-dispatch
description: Model-routing orchestration for any expensive frontier model (Fable, Opus, GPT-5.x) - the main model keeps judgment and Q&A review, mechanical subagent dispatches carry an explicit cheaper model, and ax measures whether the routing actually worked. Use when orchestrating codebase-heavy or token-heavy work with subagents, when dispatching Agent tasks without a model, when the user says "route to cheaper models", "efficient dispatch", "optimize model spend", or asks where their token spend goes. Pairs with the route-dispatch hook (deterministic backstop) and `ax dispatches` (evidence). Do NOT fire on single-shot questions or tiny tasks with no dispatching.
---
# efficient-dispatch - 路由、度量、验证

主模型负责编排和问答审查。机械性工作由成本更低的模型执行——而且与仅提供指导的方法不同，这里的每一项结论都可以根据你自己的 ax 图进行核查。

## 职责划分

有两个维度。第一，**主模型与子代理**：主模型负责编排和审查；机械性工作交给子代理。第二，也是实际控制支出的维度——**每次子代理调度所使用的层级：**

- **实现者子代理**（任务计划定义明确、机械性编辑、搜索、批量转换）→ 使用 **`model: sonnet`** 调度（纯搜索/定位任务可按照表格使用 haiku）。
- **审查者/判断型子代理**（质量审查 / PR 审查 / 最终审查 / 对抗性审查 / 代码审查、设计、审计、架构设计、批评、评判）→ **保留强模型**：继承主模型，或显式设置 `model: opus`/`fable`。审查是决定问题检出率的关卡；廉价的审查者会漏掉真正的缺陷。

如果把这套分工搞反，你就会付出双重代价：在一次 ax 会话中，实现者运行在昂贵的继承模型上，而审查者却被分配给了廉价模型——超支约 130 美元，问题检出率更低，还经历了三轮修复（记忆 `feedback-review-gets-strong-model`）。默认继承陷阱针对的是实现者，而不是审查者：在 `implement …` 调度中忘记设置 `model:`，就会悄无声息地使用昂贵模型运行。务必设置它。

**由主模型保留的工作**（绝不调度）：任务分解、架构与产品权衡、计划综合、裁决相互冲突的子代理报告、最终集成，以及高度依赖品味的设计/文案工作。

## 隔离重型上下文（调度的第二个原因）

成本层级是进行调度的一个原因。另一个原因是**上下文隔离**——即使工作需要强模型，这一点同样适用。读入主线程的大型输入并非只产生一次成本：它会留在上下文窗口中，并在之后的每一轮中作为输入重新发送。在一个有 40 轮交互的会话中，如果第 5 轮读取了一张 0.5 MB 的截图，它将被重复计费约 35 次，并挤占先前的推理内容。

最大的罪魁祸首是**图像**。读取截图进行视觉判断（是否符合规范？为这个设计评分，找出视觉缺陷）会让主上下文充斥视觉 token，并在会话剩余期间持续存在。应进行如下路由：

- **调度一个以文本形式返回判断结果的子代理。** 子代理在自己短暂存在的上下文中承担视觉 token 的成本并返回结论；主线程只保留廉价的文本，绝不保留图像字节。如果判断任务很难，就为子代理使用强模型——此处的收益来自隔离，而不是模型层级。
- **何时进行路由：** 图像（或任何大型输出）原本会在之后的多轮主线程交互中持续存在，**并且**问题可以用一个可返回的结论来回答。
- **何时不应进行路由：** 紧密迭代式的视觉探索（查看、调整、再次查看，并与主推理交替进行——往返开销会超过节省的成本）、读取一次即结束的短会话（不存在持续驻留的尾部成本），或者无法预先明确判断标准时（文本结论会造成信息损失）。

同样的逻辑适用于任何你只需要从中得出结论的庞大工具输出：巨量日志、大型查询结果转储、为获取一个事实而读取的完整文件。如果你需要的是答案，而不是原始字节，就调度子代理来处理。

## 路由表

事实来源：`~/.ax/hooks/routing-table.json`（使用
`ax dispatches compile-routing` 重新生成）。如果该文件存在，请查阅它；以下内置规则
与其保持一致：

<!-- ax:routing-table -->
| 类别 | 描述模式 | 模型 |
|---|---|---|
| spec-review | `^spec review` | sonnet |
| search-locate | `^(pattern-find\|locate\|find\|map\|sweep\|grep)` | haiku |
| research | `^(research\|investigate docs\|study)` | sonnet |
| well-specified-impl | `^implement ` | sonnet |
| bulk-mechanical | `^(write announcements\|regenerate\|standardize\|merge main)` | sonnet |
| task-N-impl | `^Task \d+:` | sonnet |
| bug-fix | `^Fix\s` | sonnet |
| feature-add | `^Add\s` | sonnet |
| 代理类型 | Explore、codebase-locator、codebase-pattern-finder → haiku；codebase-analyzer → sonnet | |
<!-- /ax:routing-table -->

任何未匹配的工作：仅当该工作确实需要主模型判断时，才不设置模型——否则选择 sonnet。

## 分派规范

1. 在自己通读所有内容**之前**，先将工作拆分为相互独立的部分；
   当各部分需要编辑文件时，让并行子代理在隔离的工作树中运行。
2. 每份任务简报都必须自包含：仓库路径、确切目标、范围内/范围外事项、
   需返回的证据格式（文件、行引用、命令、差异、失败信息）、
   验证命令、停止条件。
3. 对每个机械性分派显式设置 `model:`。route-dispatch
   钩子能够感知配额，但仅提供建议（Claude Code 钩子无法强制指定子代理分派的模型——
   它们只能通过 additionalContext 注入上下文）：
   在节省模式下，如果某个机械性分派忘记指定模型，它会建议使用
   `model:<cheaper>` 重新分派；临近 7 天配额重置时（宽松模式），它会保持静默，
   以便工作使用继承而来的强模型运行；当判断型工作
   （评审/设计/审计）被发送给廉价模型时，它也会发出建议。真正的强制执行依赖于你的
   规范操作，以及在每次分派时显式设置 `model:`。
   应将该建议视为重新分派信号，而不是噪声。
4. **工作流脚本**（`.claude/workflows/*.js`）在沙箱中运行，无法
   导入 ax 代码。根据 `ax routing show`，手动为每个 `agent(...)` 调用设置
   `model:`：机械性阶段 → `model: 'sonnet'`；判断/评审
   阶段 → 保留强模型。`routing-tune.workflow.js` 是参考实现。
   树内进行分派的 Effect/axctl 代码应调用 `resolveDispatchModel`
   （来自 `@ax/hooks-sdk`），而不是硬编码。
5. 将子代理报告视为线索。在依据高影响发现采取行动或
   宣布完成之前，重新打开所引用的文件，并亲自重新运行关键验证。
   预期每个委派阶段都能发现一个真实 bug。

## 衡量（仅提供指导的 Skill 无法做到的事项）

- `ax dispatches --days=7`——继承率（目标：为所有
  机械性类别显式指定模型）
- `ax dispatches --candidates`——遗漏的路由 + 估算节省额，基于
  实际 token 桶重新定价
- `ax cost split --days=7`——按模型统计主代理与子代理的支出；占主导地位的
  成本通常是主循环缓存读取，因此应将工具密集型循环（构建/测试
  周期、浏览器 QA）完全移入子代理
- `ax cost images --days=7`——每个会话中的图像读取上下文，主代理与子代理对比。
  主线程 MB 数较高 = 截图持续保留在主窗口中；应将此类
  视觉判断路由给子代理（参见上文“隔离重型上下文”）
- `ax improve recommend`——当遗漏的节省额累积时，
  自动给出路由建议

## 验证

采用此技能后，对比采用前后的窗口数据：`ax cost split` + 继承率。如果继承率没有下降，则说明路由没有生效——请检查 `ax hooks backtest ~/.ax/hooks/route-dispatch.ts --days=7`，并确认分派是否绕过了该表。