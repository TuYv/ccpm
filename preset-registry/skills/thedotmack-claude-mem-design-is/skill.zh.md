---
name: design-is
description: Audit a design against Dieter Rams' ten "Good design is..." principles, then hand off a /make-plan prompt for one of three outcomes — new design, refine design, or redesign. Use when the user says "audit this design", "design review", "check this UI against Rams", "is this UI good", "critique this design", "design audit", or asks for a critique that should lead to a plan.
---
# Design Is

## 不用于

- 常规 UI 代码审查 → 使用 `/review`
- 纯文案编辑 → 使用单独的文案审校轮次
- 尚无产物的设计前构思 → 直接从 `/make-plan` 开始

你是一名编排者。依据 Dieter Rams 的十项原则审计设计，为每项原则结合证据评分，决定结果判定（NEW / REFINE / REDESIGN），并带着可直接运行的提示词交接给 `/make-plan`。

你不编写实现代码。你产出：带证据引用的评分、判定，以及 `/make-plan` 交接提示词。

## 十项原则（Dieter Rams）

按这个确切顺序审计每项原则。每项得分 0–3，并有 ≥1 条证据（`file:line`、截图区域、文案摘录或测量值）。

1. **好的设计是创新的** — 它推进形式，还是模仿？创新依托技术；从来不是目的本身。
2. **好的设计让产品有用** — 它服务于主要任务吗？强调有用性；无视任何减损它的东西。
3. **好的设计是美观的** — 它美吗？只有执行良好的物品才可能美；审美质量影响幸福感。
4. **好的设计让产品易于理解** — 结构是否阐明了功能？还是至多只是自解释？
5. **好的设计是不张扬的** — 它是否不碍事？既不是装饰物，也不是艺术品——为自我表达留出空间。
6. **好的设计是诚实的** — 它只声称自己实际是什么吗？没有虚假承诺、没有操纵、没有虚增价值。
7. **好的设计是经久耐用的** — 它会良好地随时间老化吗？避免时髦；永不显得陈旧。
8. **好的设计细致到最后一处细节** — 边缘、空状态、错误、焦点环、运动曲线是否都被考虑？关怀与准确表达了对用户的尊重。
9. **好的设计是环保的** — 它节约资源吗？将污染降到最低——在软件中即包体积、能量、注意力、认知负荷。
10. **好的设计是尽可能少的设计** — 更少，但更好。专注于本质；回归纯粹，回归简单。

> 用户写的是 “Dieter Braun”——他们指的是 Dieter Rams。不要在正文中纠正；只使用正确的原则。

## 委托模型

使用子代理进行*证据收集*（读取组件、测量对比度、计数元素、检查 token、通过 agent-browser 截图）。将*评分与判定综合*保留给编排者。拒绝未引用证据就评分的子代理报告，并重新部署。

### 子代理报告契约（强制）

每个证据子代理的响应必须包含：
1. 查阅过的来源——精确文件路径和行范围，或截图区域
2. 具体发现——存在什么、缺失什么，并附引用/值
3. 各原则事实（不是观点）——将评分留给编排者
4. 已知缺口——无法检查什么以及原因

## 输出产物

所有产物放在仓库根目录（或用户指定的项目）的 `DESIGN-IS-<YYYY-MM-DD>/` 中：

- `00-scope.md` — 审计了什么（URL、组件路径、屏幕）、输入材料
- `01-evidence.md` — 子代理收集的逐项原则证据
- `02-scorecard.md` — 逐项原则 0–3 分及一行理由 + 总分
- `03-verdict.md` — NEW / REFINE / REDESIGN 及推理
- `04-handoff-prompt.md` — 面向所选结果的可复制粘贴 `/make-plan` 提示词

## 阶段

### 阶段 0：范围锁定（始终第一）

询问用户（或从请求推断）并写入 `00-scope.md`：
- 正在审计什么？（在线 URL、仓库路径、Figma frame、组件名称）
- 谁是主要用户，主要任务是什么？
- 约束（品牌、技术栈、截止时间）
- 参考设计或竞争对手（如有）

如果用户询问的设计尚不存在，跳过阶段 1–2，直接进入阶段 3，且 verdict = **NEW**。

### 阶段 1：证据收集（并行展开）

并行部署子代理。每个子代理必须只返回下列必填字段——不要散文段落，不要评分。

**1. Structural Evidence** 子代理（始终部署）
必须返回的字段：
- 受审界面上的交互元素总数
- 主组件树的最大嵌套深度
- 重复模式数量（同一可供性为同一目的出现在 >1 处）
- Dead-prop / unused-import 数量
- 每个计数的 file:line 引用

**2. Visual Evidence** 子代理（始终部署）
模式：如果目标是可访问的 URL 或正在运行的开发服务器 → 使用 `agent-browser` 技能进行截图和计算样式检查。如果目标是没有运行实例的静态仓库 → 读取源 CSS / token / 组件文件，并仅报告推断事实（将这些标记为 "INFERRED"）。
必须返回的字段：
- 观察到的间距尺度（px 数组）
- 观察到的字号尺度（px 数组）
- 不同颜色数量（实际渲染或引用的唯一 hex/oklch token 数）
- 主要文本中观察到的最低对比度
- 状态存在清单：空 / 加载 / 错误 / 成功 / 聚焦 / 禁用——逐项标注存在或缺失

**3. Copy & Honesty** 子代理（始终部署）
必须返回的字段：
- 每个面向用户的字符串列表，附 file:line
- 被标记的夸大表述（没有依据的营销最高级）
- 被标记的暗黑模式（强制连续性、隐藏成本、虚假稀缺、confirmshaming）
- 被标记的术语 / 不清晰标签，并附建议的通俗替代
- 标签→行为不匹配，附两者的 file:line

**4. Weight & Friction** 子代理（始终部署）
必须返回的字段：
- 初始 JS 字节数（数字）
- 主视图的网络请求数量（数字）
- Time-to-interactive 毫秒数（数字；测量值或估算值并注明方法）
- 空闲屏幕上的动画数量（数字）
- 初始加载时的通知 / 徽标 / 模态框数量（数字）

**5. Accessibility Evidence** 子代理（可选——仅当目标具有有意义的交互式 UI 界面时部署；对没有交互的静态落地页跳过）
必须返回的字段：
- 每个文本 token 的 WCAG 对比度通过/失败
- 主要控件间的焦点顺序列表
- 每个主要操作的键盘可达性（每个操作是/否）
- ARIA landmark 数量
- 是否存在 skip-link（是/否）

**原则 → 子代理映射**（编排者评分时使用）：

| Principle | Fed by |
|-----------|--------|
| #1 innovative | orchestrator-only（基于所有证据判断） |
| #2 useful | Structural、Accessibility |
| #3 aesthetic | Visual |
| #4 understandable | Structural、Copy & Honesty、Accessibility |
| #5 unobtrusive | Structural、Visual |
| #6 honest | Copy & Honesty |
| #7 long-lasting | orchestrator-only（基于所有证据判断） |
| #8 thorough | Visual |
| #9 environmentally friendly | Weight & Friction |
| #10 as little design as possible | Structural |

编排者写入 `01-evidence.md`，汇总所有子代理报告。拒绝任何没有来源引用的发现。明确禁止子代理评分——只有编排者使用阶段 2 的评分标准评分。

### 阶段 2：评分卡（编排者）

编排者自行为十项原则评分——不要委托评分。

对每项原则，写入 `02-scorecard.md`：

```
N. Good design is <principle> — Score: X/3
   Evidence: <one-line summary citing 01-evidence.md anchors>
   Justification: <one sentence on why this score, not the one above or below>
```

逐项原则评分锚点（逐字适用——选择其信号最匹配受审界面的等级）：

#1 innovative — 3: 引入一种在 5 个以上同类产品中未见过的模式，并有节制地交付。2: 以明确改进刷新既有模式。1: 以细微变化模仿竞争对手。0: 整体照抄竞争对手的流程。
#2 useful — 3: 主要任务以最少可能步骤完成；没有诱饵操作。2: 主要任务可完成，但相邻界面增加了步骤。1: 主要任务需要不必要的绕路。0: 受审屏幕上没有直接支持主要任务。
#3 aesthetic — 3: 间距/排版/颜色遵循单一可见系统；没有孤立样式。2: 受审界面上有 ≤2 处轻微不一致。1: 3–5 处不一致或一处突兀违例。0: 没有可见系统或存在主动视觉噪音。
#4 understandable — 3: 首次使用者能正确命名每个主要控件。2: 有 1 个控件需要提示。1: 2–3 个控件不清晰；存在术语。0: 没有帮助就无法识别主要操作。
#5 unobtrusive — 3: 界面框架退后；内容为图，UI 为底。2: 框架可见但安静。1: 装饰与内容竞争。0: 框架支配内容。
#6 honest — 3: 每个声明、徽章和标签都与实际行为一一对应。2: ≤1 处轻微夸大（例如 “powerful” 出现一次）。1: 2+ 处夸大或一个暗黑模式。0: 任何欺骗性流程（强制连续性、隐藏成本、虚假稀缺）。
#7 long-lasting — 3: 视觉语言没有过时趋势标记；3 年后仍会显得现代。2: 1 个过时标记。1: 2–3 个过时标记（拟物残留、流行渐变、潮流字体）。0: 设计读起来像某一年份的趋势。
#8 thorough — 3: 空 / 加载 / 错误 / 成功 / 聚焦 / 禁用全部存在并经过考虑。2: 缺失或粗糙的状态有 1 个。1: 缺失 2–3 个状态。0: 缺失 4+ 个状态或使用默认浏览器状态。
#9 environmentally friendly — 3: 初始 JS <100KB，无空闲动画，尊重深色模式，尊重 prefers-reduced-motion。2: <500KB，动画受控。1: 500KB–2MB，动画始终开启。0: >2MB 或自动播放视频或忽略深色模式。
#10 as little design as possible — 3: 每个元素都有存在理由；移除任何一个都会破坏任务。2: ≤2 个可移除元素。1: 3–5 个可移除元素。0: 页面由装饰或重复可供性主导。

评分规则：
- **平局裁决规则**：在两个分数之间不确定时，选择较低者。收敛优先于慷慨。
- **按最差评分，而非平均**：当某项原则在受审计界面上有多个代表性实例时，按最差实例评分——而不是平均值。
- **不加分、不加权**：分数保持 0–3 的整数。各项原则权重相等。总分为十个分数之和，最高 30 分。

### 阶段 3：结论（ORCHESTRATOR）

编写 `03-verdict.md`，从三种结论中选择一种，选择规则如下：

- **NEW DESIGN** — 尚不存在设计，或现有产物只是线框图/占位实现，没有值得保留的真实决策。
- **REFINE** — 总分 ≥ 20 且没有任何单项原则得 0。基础良好；继续迭代。
- **REDESIGN** — 总分 < 20，或任何原则在承重维度上得 0（通常是 #2 有用、#4 可理解或 #6 诚实）。从目的开始重来。

用一句话陈述结论。然后列出 3–5 个最高杠杆动作——每个都对应具体原则和证据锚点。这些将成为下一阶段计划的骨架。

**在你自己的结论中要拒绝的反模式：**
- 因为代码库庞大而推荐 REFINE（沉没成本不是设计原则）
- 因为单个界面难看而推荐 REDESIGN（应限定范围）
- 在诚实的 REDESIGN 才合理时推荐 NEW（不要回避批评）

### 阶段 4：/make-plan 交接

编写 `04-handoff-prompt.md`，其中必须恰好包含一个与结论匹配的围栏 `/make-plan` 提示词。该提示词必须自包含——下一个会话看不到这份审计，除非内容被引用进来。

使用下方匹配的模板。填写每一个 `<bracket>`。逐字包含阶段 3 中的前 3–5 个动作，并附上各自的证据锚点。

**引用步骤（强制，适用于以下全部三个模板）：** 在发出交接提示之前，用审计中的具体内容替换每一个 `<bracket>` 占位符。将 `03-verdict.md` 中的结论段落以及前 3–5 个动作逐字内联到模板中。不要留下“见 DESIGN-IS-.../03-verdict.md”这类裸引用——下一个会话无法访问审计文件。发出的交接提示必须无需任何外部查找即可阅读和执行。

#### 模板：NEW DESIGN

````
/make-plan Design <product/screen/component name> from scratch.

Primary user: <who>
Primary task: <one sentence>
Constraints: <brand, stack, deadline, accessibility floor>

Non-goals (do not design these now):
- <explicit out-of-scope item 1>
- <explicit out-of-scope item 2>
- <explicit out-of-scope item 3>

Reference principles to optimize for, in order:
1. Useful (#2) — <what useful looks like here>
2. Understandable (#4) — <what clarity looks like here>
3. As little design as possible (#10) — <what restraint looks like here>

Deliverables for the plan:
- Information architecture (one screen map or component tree)
- Primary flow wireframe (low-fi, labeled)
- Token decisions (type scale, spacing scale, color count cap)
- States checklist (empty, loading, error, success, focus, disabled)
- Honesty audit on every user-facing string before ship

Anti-patterns to guard against (specific to NEW):
- Decoration without function
- Novel interactions without precedent
- Copy that overpromises
- Designing for screens the Non-goals list excluded
````

#### 模板：REFINE DESIGN

````
/make-plan Refine <product/screen/component name> based on a Dieter Rams audit (total <X>/30).

Verdict paragraph (quoted from 03-verdict.md):
> <paste the one-sentence verdict here>

Keep (already strong, do NOT touch in this pass):
- Principle #<N> (<name>) scored 3 — Evidence: <file:line or anchor>. Regression check: <what to grep / re-test to confirm it still scores 3 after the refine>.
- <repeat for every principle that scored 3>

Fix in priority order (top 3–5 moves from the audit, verbatim):
1. <Principle # — short name>: <specific move>. Evidence: <file:line or anchor>.
2. <Principle # — short name>: <specific move>. Evidence: <file:line or anchor>.
3. <Principle # — short name>: <specific move>. Evidence: <file:line or anchor>.
4. <optional 4th>
5. <optional 5th>

Out of scope for this refine pass: <explicit list — what NOT to touch>

Deliverables for the plan:
- Per-fix: target files, exact change, verification step
- Token/spec changes consolidated in one place
- Regression checklist for every "Keep" item above

Anti-patterns to guard against (specific to REFINE):
- Adding new abstractions where a direct change suffices
- Restyling areas that already scored 3
- Scope creep into structural redesign (if structure must change, this should be REDESIGN, not REFINE)
- Letting fixes mutate principles outside the priority list
````

#### 模板：REDESIGN

````
/make-plan Redesign <product/screen/component name>. Current design failed audit at <X>/30 with critical gaps in principles <comma-separated list of 0-scored or 1-scored load-bearing principles>.

Verdict paragraph (quoted from 03-verdict.md):
> <paste the one-sentence verdict here>

Why redesign and not refine: <one sentence — usually a load-bearing principle (#2, #4, or #6) scored 0, or total is below threshold>

Preserve from current design (MUST be non-empty — at minimum, name the brand tokens):
- <specific element 1, with file:line>
- <specific element 2, with file:line>
- (if structurally nothing survives, write: "Brand tokens only — color palette and logo. Discard everything else.")

Discard (MUST be non-empty — name the structural patterns causing the failures):
- <pattern 1>. Evidence: <file:line>. Caused failure on principle #<N>.
- <pattern 2>. Evidence: <file:line>. Caused failure on principle #<N>.

Top 3–5 moves from the audit (verbatim):
1. <Principle # — short name>: <specific move>. Evidence: <file:line>.
2. <Principle # — short name>: <specific move>. Evidence: <file:line>.
3. <Principle # — short name>: <specific move>. Evidence: <file:line>.

Redesign principles in priority order:
1. <Principle # — name> — <what success looks like>
2. <Principle # — name> — <what success looks like>
3. <Principle # — name> — <what success looks like>

Deliverables for the plan:
- New information architecture (not derived from old)
- New primary flow (low-fi, labeled, compared side-by-side to current)
- States checklist (empty, loading, error, success, focus, disabled)
- Migration path for users currently on the old design
- Cutover criteria (when is the old design retired)

Anti-patterns to guard against (specific to REDESIGN):
- Porting old structure under new styling
- Keeping both designs behind a flag indefinitely
- Redesigning to follow a trend rather than the principles above
- Treating the Preserve list as optional — it must be filled before this handoff is valid
````

## 关键原则（供审计者参考）

- **证据高于品味** — 每个分数都要引用来源；“感觉不对”不是发现
- **评现状，而非意图** — 设计是发布出来的东西，不是画出来的东西
- **诚实同样适用于审计** — 如果总分是 28/30，即使客户想要重设计也要说 REFINE；如果是 12/30，即使客户想要微调也要说 REDESIGN
- **一个结论，而不是三个** — 选择 NEW、REFINE 或 REDESIGN 中的一种；不要含糊
- **交接，不要实现** — `design-is` 到 `/make-plan` 提示词为止；之后交给 `/make-plan` 和 `/do` 处理
- **结论承诺** — 一旦写好 `02-scorecard.md`，结论就机械地遵循阶段 3 规则。绝不要为了凑出偏好的结论而重新评分；如果记分卡表明是 REDESIGN，交接提示就是 REDESIGN。

## 需要防止的失败模式

- 只根据截图评分而不阅读代码 —— 用结构性子代理重新部署
- 给代码库评分而不是给设计评分 —— 重新锚定到面向用户的证据
- 慷慨给出 3 分以软化结论 —— 用阶段 2 中各原则的锚点重新校准
- 产出没有引用结论和最高优先级动作的交接提示 —— 下一个会话在没有它们时会失明
- 跳过阶段 0 的范围锁定 —— 审计错误界面会浪费阶段 1
- **沉没成本推理** — 因为代码库庞大而推荐 REFINE；沉没成本不是设计原则
- **在多个结论之间摇摆** — “可能是 REFINE，也可能是 REDESIGN，取决于……” —— 选择一个
- **为了让分数匹配期望结论而抬高评分** — 先给证据评分，再按规则读出结论
- **让阶段 0 的用户偏好覆盖阶段 3 的证据** — 用户可以不同意结论，但审计报告的是证据所说的内容
