---
name: doubt-driven-development
description: Subjects every non-trivial decision to a fresh-context adversarial review before it stands. Use when you want every assumption cross-examined before proceeding, when stress-testing a plan for hidden failure modes, when correctness matters more than speed, when working in unfamiliar code, when stakes are high (production auth, security-sensitive logic, a high-stakes migration, irreversible operations), or any time a confident output would be cheaper to verify now than to debug later.
---
# 怀疑驱动开发

## 概述

自信的答案并不等于正确答案。长时间的会话会不断积累上下文，悄悄地把假设变成“事实”，而没有人察觉。怀疑驱动开发是一种在任何非平凡产出最终确定之前，构建一名新鲜上下文审查者的纪律，这名审查者的偏向是**证伪**，而不是认可。

这不是 `/review`。`/review` 是对已完成成果的裁决。这是一种进行中的工作方式：在仍然可以低成本纠正方向时，对非平凡决策进行交叉质询。

## 使用时机

当以下至少一项为真时，一个决策就是**非平凡的**：

- 引入或修改分支逻辑
- 跨越模块或服务边界
- 声明类型系统或编译器无法验证的属性（线程安全、幂等性、顺序、不变量）
- 正确性依赖于未来读者无法看到的上下文
- 影响范围不可逆（生产部署、数据迁移、公共 API 变更）

在以下情况下应用此技能：

- 即将在不确定的情况下做出架构决策
- 即将提交非平凡代码
- 即将声称某个非显而易见的事实（“这是安全的”“它可以扩展”“它符合规范”）
- 在尚未完全理解的代码中工作

**不使用时：**

- 机械操作（重命名、格式化、移动文件）
- 遵循清晰、明确的用户指令
- 阅读或总结现有代码
- 一行且正确性显而易见的改动
- 纯工具操作（运行测试、列出文件）
- 用户明确要求优先考虑速度而不是验证

如果你怀疑每一次击键，就什么也交付不了。此技能仅适用于上述定义的非平凡决策。

## 加载限制

此技能专为**主会话编排器**设计，其中第 3 步（DOUBT，详见下文）可以生成一名新鲜上下文的审查者。

- **不要将此技能添加到 persona 的 `skills:` frontmatter 中。** 遵循第 3 步的 persona 会再生成另一个 persona，这正是 `../../references/orchestration-patterns.md` 中明确禁止的编排反模式（“persona 不调用其他 persona”）。
- **如果你发现自己正在子代理上下文中应用此技能**（Claude Code 会阻止嵌套的子代理生成）：首选路径是向用户说明怀疑驱动开发无法嵌套运行，并让主会话处理。只有在万不得已时，才使用一种降级的自我质询回退方案：将 ARTIFACT + CONTRACT 重写为一条新鲜的自我提示词，并与此前的推理进行明确的心理分隔，然后执行第 1–5 步。这**不是新鲜上下文审查**（你仍携带着自己的上下文），因此必须将结果标记为降级结果；只要用户可联系，就应优先升级处理。

## 流程

应用此技能时复制下面的检查清单：

```
Doubt cycle:
- [ ] Step 1: CLAIM — wrote the claim + why-it-matters
- [ ] Step 2: EXTRACT — isolated artifact + contract, stripped reasoning
- [ ] Step 3: DOUBT — invoked fresh-context reviewer with adversarial prompt
- [ ] Step 4: RECONCILE — classified every finding against the artifact text
- [ ] Step 5: STOP — met stop condition (trivial findings, 3 cycles, or user override)
```

### 第 1 步：CLAIM — 明确当前立场

用两三行说明决策：

```
CLAIM: "The new caching layer is thread-safe under the
        read-heavy workload described in the spec."
WHY THIS MATTERS: a race here corrupts user data and is
                  hard to detect in QA.
```

如果你无法将其如此简洁地写出来，那你只有一种感觉，而不是一个决策。先明确它，再对其进行审视。

### 第 2 步：EXTRACT — 最小可审查单元

一个全新上下文中的审查者需要的是**工件**和**契约**，而不是过程。

- 代码：差异或函数，而不是整个文件
- 决策：用 3–5 句话描述提案，以及它必须满足的约束
- 断言：主张加上据称支持它的证据（与第 1 步的 CLAIM 块区分开来；后者是编排者正在审视的假设）

删去你的推理过程。如果你把结论交给审查者，你得到的将是对结论的验证。这个单元必须小到让审查者一遍阅读就能记住；如果是一个 500 行的 PR，就先进行拆分。

### 第 3 步：DOUBT — 调用全新上下文中的审查者

审查者的提示词**必须具有对抗性**。措辞会决定答案。

```
Adversarial review. Find what is wrong with this artifact.
Assume the author is overconfident. Look for:
- Unstated assumptions
- Edge cases not handled
- Hidden coupling or shared state
- Ways the contract could be violated
- Existing conventions this might break
- Failure modes under unexpected input

Do NOT validate. Do NOT summarize. Find issues, or state
explicitly that you cannot find any after thorough examination.

ARTIFACT: <paste artifact>
CONTRACT: <paste contract>
```

**只传入 ARTIFACT + CONTRACT。不要传入 CLAIM。** 将你的结论交给审查者会使其倾向于认同。审查者必须独立判断工件是否满足契约。

在 Claude Code 中，`agents/` 中基于角色的审查者默认会以隔离上下文启动，因此可以在此处使用；请参阅 `agents/` 了解审查者名单以及各领域的匹配关系。

**上述对抗性提示词优先于角色默认的响应格式。** 诸如 `code-reviewer` 这样的角色通常会以同时包含优点和缺点的平衡结论作为输出；而由疑虑驱动的审查需要仅输出问题。将上述对抗性提示词原样粘贴到调用中，以覆盖角色默认设置。如果某个角色的响应格式无法被干净地覆盖，则改用带有该对抗性提示词的通用子代理。

#### 跨模型升级

单一模型的审查者会与原作者共享盲点；更冷静、采用不同架构的模型能够发现这些盲点。对于非平凡决策，疑虑驱动的审查本身就是选择性启用的，因此在这一范围内提供跨模型审查是该技能价值的一部分，而不是可选的额外阻力。

**交互式会话：始终提供该选项。绝不要默默跳过。**

**第 1 步：询问用户**

完成上述第 3 步的单一模型审查后、RECONCILE 之前，暂停并询问：

Single-model review complete. Want a cross-model second opinion? Options: Gemini CLI, Codex CLI, manual external review (you paste it elsewhere), or skip.

### 第 4 步：协调 — 将发现回纳

审查者的输出是数据，而不是结论。**你仍然是编排者。** 在分类前，针对每项发现重新对照工件文本阅读，不要直接采纳审查者的意见；一味附和审查者与忽视审查者是同一种失败模式。

按以下**优先级顺序**对每项发现分类（第一个匹配的类别优先）：

1. **合同误读** — 审查者之所以专门指出某项问题，是因为你提供的 CONTRACT 不清晰或不完整。先修正合同，并在下一个周期重新分类。
2. **有效且可操作** — 真实存在、需要修改工件的问题。修改后重新循环。
3. **有效的权衡** — 问题确实存在，但修复成本高于接受它的成本。明确记录这项权衡，让用户能够看到。
4. **噪声** — 审查者指出的内容在其缺少的上下文中看似有问题，实际上是正确的。记录下来并继续，然后问：如果在合同中补充该上下文，是否能避免这次误报？

新的审查者可能因为缺少上下文而出错。不要仅因为它是“新的”就让步。

### 第 5 步：停止 — 有界循环，而非递归

在以下情况停止：

- 下一次迭代只返回琐碎或已考虑过的发现，**或**
- 已完成 3 个周期（向用户升级，不要独自进行第四次循环），**或**
- 用户明确表示“ship it”

如果经过 3 个周期，审查者仍然发现实质性问题，工件可能尚未准备就绪。向用户说明这一点；三个未解决的周期本身就是关于工件的信息，而不是继续循环的理由。

如果工件很大，导致 3 个周期“明显不足”：说明工件过大，应返回第 2 步进行拆分。不要提高这个上限。

## 常见的合理化说辞

| 合理化说辞 | 现实 |
|---|---|
| “我很有把握，跳过怀疑步骤吧” | 在新颖问题上，信心与正确性的相关性很低。恰恰在确信无疑的时刻，盲点最容易隐藏。 |
| “启动一个审查者太昂贵了” | 在生产环境中调试错误提交的代价更高。这项检查是有边界的，漏洞不是。 |
| “审查者只会吹毛求疵” | 只有在没有限定范围时才会如此。将提示词约束为“会导致此工件不符合合同的那些问题”。 |
| “我会在最后用 `/review` 来进行怀疑” | `/review` 是最终关卡。由怀疑驱动的检查会在改正方向成本较低时及早发现错误方向。到 PR 阶段就太晚了。 |
| “如果我质疑每一步，就永远无法交付” | 这项技能适用于非琐碎决策，而不是每一次按键。重新阅读“何时不应使用”。 |
| “两个意见总是比一个更好” | 当第二个意见掌握的上下文更少且会产生噪声时，并非如此。协调，不要盲从。 |
| “审查者不同意，所以我错了” | 审查者缺少你的上下文；分歧是信息，不是结论。重新阅读工件，分类，然后再决定。 |
| “跨模型总是更好” | 跨模型能捕捉单一模型与自身共享的盲点，但它会增加成本和工具脆弱性。在每个交互式怀疑周期都应提供这一选项，由用户决定工件是否值得。代理的职责是呈现选择，而不是设置门槛。 |
| “用户同意过一次，所以我可以持续调用 CLI” | 每次调用都是独立授权。工件、提示词和标志在调用之间都会变化；每次运行前，都应向用户重新确认准确的命令。 |

## 警示信号

- 针对一行重命名或格式变更启动一个全新上下文的审查者
- 将审查者输出视为权威，而不重新阅读产物文本
- 循环超过 3 次却未向用户升级处理
- 用“这样好吗？”而非“找出问题”来提示审查者
- 在高风险决策中因时间压力而跳过质疑
- 针对未变更的产物重新启动全新上下文（你会得到相同的发现；这只是在拖延）
- **质疑表演（可检查信号）**：在 2 次或更多轮次中，审查者提出了实质性发现，但零项发现被归类为可操作。你是在验证，而不是质疑。停止并升级给用户。
- 仅在提交后才质疑，这属于 `/review`，而不是质疑驱动开发
- 未与用户确认工具存在、已配置且接受该确切语法，就硬编码外部 CLI 调用
- **在交互式质疑循环中静默跳过跨模型。** 即使不建议使用，也必须让用户看见这一选项。可以跳过，但不能静默跳过。
- 当外部 CLI 出错或缺失时静默回退，应展示失败情况并让用户重新决定方向
- 从审查者输入中剥离契约
- 将 CLAIM 传给审查者（这会使其倾向于认同）

## 与其他技能的交互

- **`code-review-and-quality` / `/review`**：互补。`/review` 是事后 PR 结论；质疑驱动开发针对每项决策在过程中进行。两者都应使用。
- **`source-driven-development`**：SDD 根据官方文档验证*关于框架的事实*。质疑驱动开发验证*你对产物的推理*。SDD 检查 API 是否存在；质疑驱动开发检查你是否在契约约束下正确使用了它。
- **`test-driven-development`**：TDD 的 RED 步骤是将质疑具体化，失败的测试即为一次反证尝试。当 TDD 适用时，该失败测试*就是*针对行为性主张的质疑步骤。
- **`debugging-and-error-recovery`**：当审查者发现真实的失败模式时，转入调试技能以定位并修复。
- **仓库编排规则**（`../../references/orchestration-patterns.md`）：该技能从主会话进行编排。由一个角色调用另一个角色属于反模式 B，参见“加载约束”。

## 验证

在应用质疑驱动开发后：

- [ ] 每项非平凡决策（依照上述定义）在确定前均已明确命名为 CLAIM
- [ ] 每个非平凡产物至少经过一次全新上下文审查（对于行为性主张，TDD 的 RED 步骤产生的失败测试满足此要求，详见“与其他技能的交互”）
- [ ] 审查者收到的是 ARTIFACT + CONTRACT，而**不是** CLAIM，也不是你的推理
- [ ] 审查者的提示是对抗性的（“找出问题”），而非验证性的（“这样好吗？”）
- [ ] 已依据产物文本对发现进行分类（而非照单全收），并采用以下优先级：误读契约 / 可操作 / 权衡 / 噪声
- [ ] 已满足停止条件（平凡发现、3 次循环或用户覆盖）
- [ ] 在交互模式中，已向用户**明确提供**跨模型选项（无论产物风险如何），且输出中已确认用户的回应
- [ ] 在非交互模式中，已跳过跨模型，并已说明跳过情况
- [ ] 所有外部 CLI 调用前均已进行 PATH 检查、工作二进制测试、与用户确认语法，并获得运行的明确授权