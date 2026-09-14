---
name: avoid-ai-writing-router
description: Use when a request combines AI-writing audit, rewrite, file editing, voice preservation, false-positive interpretation, verification, or when the user invokes Avoid AI Writing without naming a mode.
---
# 避免 AI 写作路由器

协调公共 Skills，形成有界工作流。将请求路由给最窄范围的负责人，在阶段之间保留上下文，并在请求的工作完成后停止。此 Skill 不取代原始的 `avoid-ai-writing` 规则手册。

## 权威链

1. `../avoid-ai-writing/SKILL.md` 是权威编辑规范。
2. `references/handoff-contract.md` 定义可跨越 Skill 边界传递的上下文和证据。
3. `references/skill-graph.json` 是节点、类型化边、守卫条件和循环限制的机器可读来源。
4. `references/routing-matrix.md` 是人类可读的路由表。
5. `references/agency-role-lenses.md` 定义用于检查该网络的架构、AI 证据、实现和呈现审查视角。

不得削弱、重复或违背规范 Skill 的保留规则、证据注意事项、语气规则、模式层级或通过行为。

## 编排模型

只对请求进行一次分类，创建最小但有用的交接封装，然后向前传递该封装，而不是让每个下游 Skill 再次推断相同的上下文。

该封装应只携带已观察到的事实或用户提供的事实，例如：

- 意图和来源类型
- 通用或技术上下文
- 请求的语气或提供的风格示例
- 受保护的语义约束
- 是否实际执行了检测器、变异器或验证器
- 可用时的检测器摘要
- 可用时的保留状态
- 风险标记
- 当前通过索引和停止限制

没有宿主证据时，绝不得将执行字段标记为 `executed`。

## 主要路由

1. 扫描、检测、审计、评分或仅标记请求交由 `ai-writing-detector`。
2. 返回文本的重写、人工化、清理或移除 AI 写作痕迹请求交由 `voice-preserving-rewriter`。
3. 指定文件并明确要求修改该文件的请求交由 `file-edit-in-place`。
4. 原文加重写文本、前后对比或保留内容验证请求交由 `preservation-verifier`。
5. 关于证明 AI 使用、作弊、欺诈、不诚实、是否适合录用或类似后果性结论的主张交由 `false-positive-reviewer`。
6. 对原始 Skill 的明确调用可以保留在 `avoid-ai-writing` 中，除非请求明确需要专门阶段。

## 多阶段顺序

对于“扫描这段文本、重写它，并确保没有重要内容发生变化”之类的请求：

1. 在可执行确定性检测的情况下，`ai-writing-detector` 收集信号；否则根据规范规则手册执行仅基于模型的审计。
2. `voice-preserving-rewriter` 重写返回的文本，或者由 `file-edit-in-place` 修改明确指定的文件。
3. `preservation-verifier` 检查前后材料。
4. 验证器返回 `FAIL` 时，将请求一次性返回给正确的修复负责人。
5. 在可能的情况下，修复后再运行一次验证。
6. 只有当用户请求收敛处理或残留审计时，才运行残留检测。
7. 在规范规定的通过次数上限后停止。不得无限循环。

## 类型化边

使用 `references/handoff-contract.md` 中的边语义：

- `ROUTE`：选择负责人。
- `FEED`：传递证据，但不要将其转化为命令。
- `VERIFY`：要求执行前后保留情况检查。
- `REPAIR`：将失败的保留结果返回给正确的变更负责人。
- `RECHECK`：在请求时执行一次有界的残留检查。
- `ESCALATE`：将不确定或具有影响的作者身份解释交由 `false-positive-reviewer` 处理。

条件守卫不是图边。在 `skill-graph.json` 的 `guards` 以及交接信封中的 `protected_constraints`、`human_representation_sensitive` 字段中，根据 `references/handoff-contract.md` 对其进行编码。

## 条件性人物表现守卫

如果源内容本身是描述人物的图像提示词、视频提示词、分镜脚本、镜头描述或创意简报，请设置 `human_representation_sensitive: true`，并将身份相关细节保留为受保护约束。

使用 `references/agency-role-lenses.md` 中的 `agency-inclusive-visuals-specialist` 视角，保护文化、地理、年龄、残障、着装、肤色/光照以及物理现实细节。不要仅仅因为普通散文提到人物，就将其路由到视觉工作流。

## 审查视角

当网络发生变化，或复杂请求暴露出边界问题时，应用以下设计检查：

- `agency-software-architect`：负责人归属、依赖方向、有界循环、回退、可逆性。
- `agency-ai-engineer`：检测器语义、不确定性、误报处理、上下文传播、评估。
- `agency-senior-developer`：可执行路径、错误传播、文件变更证据、CI 和漂移检查。
- `agency-inclusive-visuals-specialist`：仅针对涉及人物的视觉提示词和简报，检查表现保真度。

这些是审查视角，而不是隐藏的公共依赖。如果当前宿主无法使用外部 agency Skill，请应用已编码的视角，但不要声称该视角已运行。

## 边界变更

在以下情况下，将控制权交还给路由器，而不是继续在本地处理：

- 任务从只读变为变更；
- 目标从返回文本变为指定文件，或反之；
- 缺少必要的变更前/后证据；
- 工作流要求的确定性执行不可用；
- 用户从模式分析转向具有影响的作者身份声明；
- 验证器失败并指出了不同的修复负责人。

保留现有的交接信封，只更改新决策所影响的字段。

## 停止条件

当用户请求的阶段已完成，并且所有必需的验证门已通过，或已明确报告其不可用时，停止。

不要：

- 根据检测器输出推断作者身份；
- 未经用户授权修改文件；
- 隐藏验证器失败；
- 仅仅因为存在另一个 Skill 就重新运行阶段；
- 超过规范规定的重写轮次上限；
- 仅仅因为提到 AI，就将无关的写作或编码请求路由到此 Plugin。

## 输出

返回选定的工作流结果。对于多阶段工作，请说明实际运行了哪些阶段、哪些阶段仅由模型完成、执行了哪些确定性检查、是否发生过修复循环，以及在可用时提供最终保留状态。