---
name: constraint-driven-development
description: Establishes a project's quality bar as a written contract and stops agents quietly lowering it. Interviews the user on which dimensions matter, supplies sane default thresholds when they have no number in mind, records everything in CONSTRAINTS.md, and watches the diff for a weakened bar — new @ts-ignore or eslint-disable suppressions, skipped or deleted tests, assertions stripped out, unimplemented stubs, thresholds edited down. Use when no quality bar is written down, when the user says "set up constraints" or "define our standards", when an agent keeps silencing checks or skipping tests to get to green, when you need a coverage or performance threshold and don't know what number to pick, or when an agent writes more code than anyone will read.
---
# 约束驱动开发

## 概述

本套件中的其他技能描述了优秀的标准。`code-review-and-quality` 提供了五个评估维度。`test-driven-development` 提供了一个循环。`security-and-hardening` 提供了一份威胁清单。所有这些都存在于代理阅读后可能遵循、也可能不遵循的文字说明中，而且会随着会话结束而消失。

这项技能会产生不同的成果：一份带有数字、记录了**本项目**标准的书面文档。它的有效期比对话更长，并且可以通过机械化方式进行检查。

其原因很重要。当代码由你编写时，阅读代码就能判断其质量。代理一个下午编写的代码量，可能比你一周能读完的还多，因此判断标准需要从你的脑中转移到围绕开发循环运行的检查中。这些检查必须实际存在，必须包含由你亲自选定的数值，并且必须在足够接近工作发生的环节触发，让代理能够修复自己的输出。

规格驱动开发说明要构建什么。测试驱动开发证明它能够工作。约束驱动开发则在任何人于拉取请求中为此争论之前，定义什么才算“好到足以上线”。

## 何时使用

在以下情况下应用此技能：

- 启动一个项目或重大功能，但尚未明确记录质量标准
- 用户要求“设置约束”“添加质量门禁”“定义我们的标准”或“阻止代理交付垃圾代码”
- 代理正在大量产出无人逐行阅读的内容
- CI 中存在检查，但没人能说清哪些会阻止合并，哪些只是摆设
- 覆盖率、性能或无障碍方面的数值在每个 PR 中反复争论，而不是一次性确定
- 你即将运行 `/build auto` 或任何自主循环，而阻止它直接进入 main 的唯一防线，是一套同样由代理编写的测试

**不应使用的情况：**

- 项目已有 `CONSTRAINTS.md`，且用户并未要求修改它——应直接阅读并遵循
- 一次性脚本、技术探索、用完即弃的原型
- 用户当前想要的是代码审查（`code-review-and-quality`）或构建 CI 流水线（`ci-cd-and-automation`）
- 尚未实现产品市场匹配、预期生命周期只有两周的代码——下文的最低标准仍然值得采用，其余部分则不值得

## 加载约束

访谈需要有真实用户实时参与。**不要在非交互式上下文中运行它**（CI、`/loop`、自主运行）。如果缺少约束，并且你正处于这类上下文中，请应用下文的最低标准，注明你已这样做，并将其余事项标记为需要人工处理。

## 流程

### 第 1 步：提问前先检测

绝不要询问能够自行读取的信息。在提出第一个问题之前，先收集以下信息：

| 内容 | 查找位置 |
|------|---------------|
| 语言和技术栈 | `package.json`、`pyproject.toml`、`go.mod`、`Cargo.toml` |
| 测试运行器 | 开发依赖、`test` 脚本、现有测试文件 |
| 现有代码检查工具 | `eslint.config.*`、`biome.json`、`.ruff.toml` |
| 当前覆盖率 | `coverage/` 输出，或先运行一次测试套件 |
| CI | `.github/workflows/`、`.gitlab-ci.yml` |
| 代理工具框架 | `.claude/`、`.codex/`、`AGENTS.md` |

用两行报告你的发现，然后只询问尚未获知的信息。

### 第 2 步：四个问题，每个问题都有默认答案

遵循 `interview-me` 中一次只问一个问题的原则，但有一点不同：这里的每个问题都有默认答案，因此即使回答“我不知道”，也仍然可以生成一份可用的配置。

```
Q1: Beyond the floor, which of these do you want enforced?
    (a) Test coverage on new code
    (b) Security scanning
    (c) Performance budgets
    (d) Accessibility
    (e) Architecture boundaries
GUESS: (a) and (b) — you have a test runner already and you're handling user input.
DEFAULT if unsure: (a) and (b).
Say what each pick costs: (c) and (d) need a running URL, (e) needs a rules file written.
```

```
Q2: When a check fails while the agent is mid-task, should it block or warn?
GUESS: Block. You're running agents unattended and a warning nobody reads is a warning.
DEFAULT if unsure: Block on the floor, warn on everything else for the first two weeks.
```

```
Q3: Do you have target numbers in mind, or should I measure where you are today and hold that line?
GUESS: Measure. Most teams don't have a number, and an invented one gets ignored.
DEFAULT if unsure: Measure and hold. See "Ratchets" below.
```

```
Q4: What's the slowest check you'll tolerate before the agent hands work back?
GUESS: About 90 seconds. Longer and you'll stop running it.
DEFAULT if unsure: 90 seconds at task end, unlimited in CI.
```

到四个问题为止。一份包含十二个问题的初始信息收集表，只会生成一份没人理解的配置，并让用户后悔开始这个过程。

### 第 3 步：编写 CONSTRAINTS.md

在仓库根目录放置一个文件。任何运行框架上的任何智能体都可以读取它，而且对它的更改会出现在代码审查中——这正是它应当出现的地方。

```markdown
# Constraints

Last reviewed: 2026-08-08 by @addy

## Floor (always enforced, no setup required)

- No new suppression comments: `@ts-ignore`, `eslint-disable`, `# noqa`, `# type: ignore`
- No unimplemented stubs: `throw new Error("Not implemented")`, empty `catch {}`
- No skipped or deleted tests without a reason in the commit message
- No secrets in source
- This file does not get weakened to make a change pass

## Enforced with numbers

| Dimension | Rule | Checked by | Runs at |
|-----------|------|-----------|---------|
| Types | Zero type errors | `tsc --noEmit` | every edit |
| Lint | Zero errors from our config | `biome check` | every edit |
| Secrets | No secrets in source | `gitleaks detect --redact` | every edit |
| Coverage | Changed lines ≥ 80% covered | `vitest run --coverage` + git diff | task end, CI |
| Security: code | No high findings | `semgrep scan --config p/default` | CI |
| Security: deps | Nothing at high or above | `osv-scanner scan source -r .` | CI |
| Accessibility | Zero critical or serious | `axe $PREVIEW_URL --tags wcag2a,wcag2aa,wcag21aa` | preview deploy |
| Performance | LCP ≤ 2500ms, CLS ≤ 0.1 | `lighthouse $PREVIEW_URL --output=json` | preview deploy |

Every row names the command that produces the verdict. A dimension with a
number and no command in this column is an aspiration, not a constraint.

## Measured, not yet enforced

| Metric | Today | Direction |
|--------|-------|-----------|
| Project coverage | 62.4% | must not fall |
| Bundle size (main) | 184 kB | must not grow |

## Exceptions

| ID | Rule | Path | Reason | Owner | Expires |
|----|------|------|--------|-------|---------|
| W1 | `no-explicit-any` | `src/legacy/**` | Rewrite tracked in ENG-441 | @addy | 2026-11-01 |
```

然后在 `AGENTS.md` 和 `CLAUDE.md` 中添加一行：`Read CONSTRAINTS.md before writing code. Do not weaken it to make a change pass.`

### 第 4 步：安装每个维度所需的工具

选择一个维度意味着要安装相应的工具。不要只给用户一个数字，却不给出实现机制；当已有事实标准的检查工具时，也不要自行发明检查器——之所以列出这些工具，是因为生态系统中的其他工具都以它们的规则格式和阈值为目标，因此团队现有的配置能够继续生效。

| 维度 | 工具 | 安装 | 运行 | 门禁条件 |
|-----------|------|---------|-----|---------|
| 类型（TS） | tsc | 已安装 | `tsc --noEmit` | 任何错误 |
| 类型（Python） | mypy | `pip install mypy` | `mypy .` | 任何错误 |
| 代码检查 | 现有配置对应的工具 | 已安装 | `eslint .` / `biome check` / `ruff check` | 任何错误 |
| 覆盖率（JS） | 现有测试运行器 | 已安装 | `vitest run --coverage`（或 `jest --coverage`） | 变更行的覆盖率 |
| 覆盖率（Python） | pytest-cov | `pip install pytest-cov` | `pytest --cov --cov-report=lcov` | 同上 |
| 安全性：代码 | Semgrep | `pipx install semgrep` | `semgrep scan --config p/default --config p/owasp-top-ten` | 任何高危发现 |
| 安全性：密钥 | gitleaks | `brew install gitleaks` | `gitleaks detect --redact --no-banner` | 任何发现 |
| 安全性：依赖项 | osv-scanner | `brew install osv-scanner` | `osv-scanner scan source -r .` | 高危或更高级别 |
| 性能：页面 | Lighthouse | `npm i -D lighthouse` | `lighthouse $URL --output=json --quiet` | LCP、CLS、性能评分 |
| 性能：包体积 | size-limit | `npm i -D size-limit` | `size-limit --json` | 每个入口的字节预算 |
| 无障碍性 | axe-core | `npm i -D @axe-core/cli` | `axe $URL --tags wcag2a,wcag2aa,wcag21aa` | 严重或重大问题为零 |
| 架构 | dependency-cruiser | `npm i -D dependency-cruiser` | `depcruise --validate src` | 任何违规 |
| 断言质量 | Stryker | `npm i -D @stryker-mutator/core` | `stryker run --mutate <changed files>` | 变异测试得分 |

如果忽略以下五点，它们会让你吃尽苦头：

1. **gitleaks 的 `--redact` 不是可选项。** 如果不使用它，匹配到的密钥就会出现在智能体的会话记录中，这正是泄露的密钥最终进入日志、摘要或提交消息的途径。只报告规则和位置，绝不要报告具体值。
2. **Lighthouse 和 axe 需要 URL。** 它们只能针对正在运行的应用工作，因此应放在运行时阶段，针对预览部署或预先启动的本地服务器运行。如果项目没有可供访问的 URL——例如 CLI、库或桌面应用——应明确说明并放弃该维度，而不是凭空发明一个无法运行的检查。
3. **将开销较大的工具限定在差异范围内。** 对整个仓库运行 `stryker run --mutate` 需要数小时，最终只会被关闭；只针对变更涉及的文件运行时，则不到一分钟即可完成。Semgrep 也是如此，它接受路径列表。
4. **覆盖率不需要再次运行测试。** 读取测试套件已经写出的 lcov，并将其与 `git diff` 取交集。为了得到一个数字而运行两次测试套件，是让人们讨厌这套机制的最快方式。
5. **Semgrep 的注册表规则可免费运行；重新分发前请检查许可证。** 如果这对你的法务团队很重要，`opengrep` 是一个直接替代的分支，使用相同的规则格式和 JSON 输出。

将每一项添加到项目自己的脚本中，以便无需智能体也能复现：

```json
{
  "scripts": {
    "check:fast": "tsc --noEmit && eslint . && gitleaks detect --redact --no-banner",
    "check:task": "npm run check:fast && vitest run --coverage",
    "check:full": "npm run check:task && semgrep scan --config p/default && osv-scanner scan source -r ."
  }
}
```

这种映射关系比具体使用哪些工具更重要。`check:fast` 在每次编辑后运行，`check:task` 在智能体认为任务已完成时运行，`check:full` 则在 CI 中运行。

这些命令现在存在于两个位置——`CONSTRAINTS.md` 中的 `Checked by` 列，以及这些脚本中。`CONSTRAINTS.md` 是规范来源：它在每条命令旁记录了采用该命令的原因，也会出现在评审中。这些脚本只是必须与其保持一致的便捷封装，而不是另一个事实来源；如果二者出现偏差，以该文件为准。

### 第 5 步：将其接入生命周期

最严重的错误就是在所有阶段运行所有检查。拖慢智能体的检查最终会被关闭，而被人关闭的门禁比没有门禁更糟，因为表面上看起来标准仍然存在。

| 阶段 | 命令 | 运行内容 | 时间预算 |
|-------|---------|-----------|--------|
| 构建 | `/build` | 类型、lint、密钥以及最低标准 | 5 秒以内，仅检查已更改的文件 |
| 验证 | `/test` | 相关测试、已更改行的覆盖率 | 90 秒以内 |
| 评审 | `/review` | 所有检查，再加上下文所述的防护措施 | 数分钟 |
| 发布 | `/ship` | 方向检查、无回归 | CI |

以下两条规则可以让这一过程保持在可接受的范围内：

1. **将范围限定在差异内容。** 检查本次变更涉及的行，而不是整个代码仓库。已更改行的覆盖率是智能体能够改善的指标；项目覆盖率则是它继承而来的指标。
2. **根据成本决定执行阶段。** 任何耗时超过几秒的检查都应移出编辑循环。对整个代码仓库执行变异测试需要数小时；仅对变更涉及的文件执行则不到一分钟，这正是人们愿意运行某项检查与不愿运行它之间的区别。

### 第 6 步：保护标准本身

有人会指出，如果代码和检查都是智能体编写的，那么这些检查什么也证明不了。这个观点对了一半，也确实值得通过工程手段加以防范。

智能体不会精心设计巧妙的漏洞。它们会遇到一项未通过的检查，然后选择成本最低的方式让检查变绿。在评审时，应注意差异内容中是否出现以下五种做法：

1. **阈值发生了变化。** 预算被调低、严重级别被降低，或某项检查从快速阶段中移除。将 `CONSTRAINTS.md` 与分支起点时的状态进行比较。
2. **测试变得更宽松。** 添加了 `.skip`、删除了测试文件，或从仍然保留的测试中移除了断言。
3. **检查器被静默禁用。** 新增了 `@ts-ignore` 或 `eslint-disable`。有四种抑制方式需要特别注意，因为它们会关闭你所依赖的检查：`istanbul ignore` 会将代码排除在覆盖率统计之外，而不是对其进行测试；`Stryker disable` 会隐藏存活的变异体；`nosemgrep` 和 `gitleaks:allow` 则会对安全问题执行相同的隐藏操作。
4. **工作尚未完成。** 抛出异常的存根、将失败悄然吞掉的空 `catch`，或本应实现功能之处留下的 `TODO`。
5. **出现了例外。** 例外表中新增了未经任何人讨论的行。

这些都不需要 `git diff` 之外的工具。提高标准应该悄无声息；降低标准则应该明确告知。

与编号维度不同，底线本身没有事实上的标准工具，因此，当要求代理强制执行底线时，它往往会从头编写检查器，而两个代理会写出两个不同的检查器。本技能在 [references/floor-guard.md](references/floor-guard.md) 中附带了这五项检查的参考实现（限定于差异范围、退出码为 `0`/`1`/`2`、模式可按不同生态系统调整）。应基于它进行改造，而不是重新发明一套，原因与每个维度都指定一个事实上的标准工具相同：确保不同运行过程和技术栈使用同一种机制。

**并非所有检查都具有同等程度的循环性。** 用一个问题来衡量它们：代理能否通过编写无法正常工作的代码来让这项检查通过？

- **外部约束** — axe-core 编码了 WCAG 标准，`osv-scanner` 读取漏洞数据库，Lighthouse 对真实浏览器进行测量。代理无法与这些结果争辩。
- **项目约束** — 你的 lint 规则、你的分层边界。对应文件由人来负责。
- **测试套件约束** — 你自己的测试。最有用，也是唯一真正具有循环性的约束。

完全由第三类约束构成的标准，不如包含外部意见的标准有价值。检查是否至少存在一项外部约束。

### 第 7 步：没有数字时，使用棘轮机制

如果在覆盖率为 62% 的代码库上设定 80% 的覆盖率要求，你会得到一个永远标红的构建，随后团队就会学会忽略标红的构建。

另一种方案不需要做任何决策：记录当前状态，然后拒绝退步。将它放入“已度量，尚未强制执行”表格，填入今天的数值和变化方向。每项检查都与记录值比较，而不是与期望值比较。数值提升时就更新记录；数值下降时，这就是需要报告的问题。

这也回应了一个对训练的合理质疑。模型会因为通过测试而获得奖励，而测试可以在几秒钟内完成评估。架构腐化要经过数月才会显现，并且永远不会反映到权重中。棘轮机制正是缺失的惩罚措施，它被明确记录在构建系统可以看到的地方。

## 合理的默认值

当用户没有明确意见时，使用以下默认值。选择这些值的目的是让大多数代码库从第一天起就能满足要求。

| 约束 | 默认值 | 采用该数值的原因 |
|------------|---------|-----------------|
| 变更行覆盖率 | ≥ 80% | 足以强制要求测试，同时又允许存在一行配置变更 |
| 项目覆盖率 | 使用今天的数值，不得下降 | 采用时无需争论 |
| 变异测试分数（如使用） | 初始值 ≥ 60% | 对于此前从未进行过变异测试的测试套件，这是典型水平；80% 属于成熟水平 |
| 依赖项漏洞 | 不得存在高危或更高级别的漏洞 | 低于该级别的大多只是噪声 |
| LCP | ≤ 2500 ms | Core Web Vitals 的“良好”阈值 |
| CLS | ≤ 0.1 | 同上 |
| 无障碍性 | axe 的严重或极严重违规数为零 | 中等和轻微违规通常存在争议 |
| 例外有效期 | 90 天 | 足以安排修复计划，又短到不至于遗忘 |
| 棘轮容差 | 0.5% | 当不相关文件导致数值变化时，用于吸收波动 |

同时说明数值及其理由。没有理由支撑的阈值，会被下一个触发它的人删除。

## 升级路径

约束有三个不同强度的层级。从第一级开始。

1. **仅书面约束。** `CONSTRAINTS.md` 存在且代理会读取它。无需成本，能够捕捉无意中犯下的错误，但依赖代理自觉遵守。
2. **脚本化约束。** 使用运行快速检查的 `npm run check`（或 `make check`），并将其接入代理的编辑后钩子和 CI。结果确定，无需新增依赖。
3. **工具支持的约束。** 使用专门的运行器来处理差异范围限定、预算、棘轮机制和防护检查。当配置规模超出 shell 脚本的承载能力时使用。对于其中的防护检查部分，可以从 [references/floor-guard.md](references/floor-guard.md) 中的底线防护参考实现开始。

大多数项目应该止步于第 2 级。当你维护的检查运行 shell 脚本超过大约三十行时，再升级到第 3 级。

**首次运行可以只实施底线约束。** 底线防护仅检查差异且无需安装任何工具，因此你可以从第一天起就强制执行底线约束，然后随着各个工具的安装逐步添加带编号的维度，而不必等所有检查器都配置完成后才保护首次提交。如果你希望保持开发者电脑的整洁，需要在系统范围安装的安全工具（gitleaks、osv-scanner）也可以仅在 CI 中运行；请在 `Runs at` 列中声明每个维度的运行位置。

## 常见的自我辩解

| 借口 | 事实 |
|--------|---------|
| “等代码稳定下来后，我们再添加约束” | 代码会围绕其变动期间被允许的任何行为稳定下来 |
| “测试就是约束” | 你自己编写的测试只能证明你认同自己的判断；它们无法说明新代码的覆盖率、依赖风险或包体积增长 |
| “我们无法达到 80% 的覆盖率” | 那就不要设为 80%。以今天的数值为基准，并确保不再下降 |
| “这会拖慢代理的速度” | 只有把慢速检查放进快速循环时才会如此。这是检查位置安排错误，不是反对约束的理由 |
| “我会记得我们的标准是什么” | 代理不会记得，而大部分代码都是它写的 |
| “约束会阻碍我们发布” | 带有负责人和日期的例外可以解除阻碍。删除约束则会永久为所有人解除限制 |

## 危险信号

如果发现以下情况，请停下来重新考虑：

- 访谈超过了四个问题，或生成了用户无法解释的配置
- 设定的预算是代码库目前无法达到的，而且没有实现该预算的计划
- 某个维度以数值形式写入了 CONSTRAINTS.md，但背后没有工具支持
- 在已有事实标准工具的情况下自行编写检查器，导致团队现有的配置被忽略
- 所有约束都由项目自身的测试套件检查，没有任何外部评判
- `CONSTRAINTS.md` 与未能通过约束的功能在同一次提交中发生了更改
- 例外没有负责人，或到期时间超过一年
- 代理建议放宽阈值，而不是修复代码
- 慢速检查进入了编辑循环，并且已经有人开始使用 `--no-verify`
- `CONSTRAINTS.md` 编写完成后再也没有人打开过它

## 验证

正确应用此技能时，应满足以下条件：

- [ ] `CONSTRAINTS.md` 存在，并且其中的每个数值都说明了设定理由
- [ ] 底线约束已强制执行，且当前代码库无需更改即可通过
- [ ] 用户选择的每个维度都安装了相应工具，并且有一条目前可以运行的命令
- [ ] 每项约束都说明了运行位置，并且快速阶段保持在几秒以内
- [ ] 至少有一项约束来自外部（不由本项目自身的测试来评判）
- [ ] 仅测量的指标记录了当前值和变化方向
- [ ] 例外有负责人和到期日期
- [ ] `AGENTS.md` 或 `CLAUDE.md` 指向该文件
- [ ] 在当前分支上试运行时，不会出现用户不认同的失败

## 另请参阅

- `interview-me` — 此技能的需求收集所借鉴的逐次单问原则
- `code-review-and-quality` — 如何审查；此技能决定审查要执行哪些要求
- `ci-cd-and-automation` — 构建运行这些约束的流水线
- `test-driven-development` — 覆盖率和变异测试约束所衡量的测试套件
- `security-and-hardening` — 安全维度应包含的内容
- `performance-optimization` — 性能数据的来源