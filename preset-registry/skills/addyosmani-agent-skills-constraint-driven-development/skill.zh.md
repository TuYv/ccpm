---
name: constraint-driven-development
description: Establishes a project's quality bar as a written contract and stops agents quietly lowering it. Interviews the user on which dimensions matter, supplies sane default thresholds when they have no number in mind, records everything in CONSTRAINTS.md, and watches the diff for a weakened bar — new @ts-ignore or eslint-disable suppressions, skipped or deleted tests, assertions stripped out, unimplemented stubs, thresholds edited down. Use when no quality bar is written down, when the user says "set up constraints" or "define our standards", when the user wants dimensions they care about — accessibility, web performance, coverage — set up as enforced constraints, when an agent keeps silencing checks or skipping tests to get to green, when you need a coverage or performance threshold and don't know what number to pick, or when an agent writes more code than anyone will read.
---
# 约束驱动开发

## 概览

这个包里的其他技能描述了什么是好的。`code-review-and-quality` 给出五个轴。`test-driven-development` 给出一个循环。`security-and-hardening` 给出一份威胁清单。所有这些都写在代理会读、也可能不遵守的散文里，而且在会话结束后都不会保留下来。

这个技能提供的是不同的东西：一份关于**这个项目**的标准书面记录，带有数字，并且能长久保留在对话之外，还能被机械地检查。

原因很重要。你写代码时，读它能告诉你它是否足够好。代理一个下午写出的内容，比你那一周会读的还多，所以判断会从你脑子里转移到循环运行的检查里。这些检查需要存在，需要有你实际选定的数字，而且需要在靠近工作的地方触发，这样代理才能修正自己的输出。

规范驱动开发说明要做什么。测试驱动开发证明它能工作。约束驱动开发在任何人开始在拉取请求里争论之前，就先定义“足够好到可以发布”是什么意思。

## 何时使用

在以下情况下应用此技能：

- 正在启动一个项目或重大功能，但没有写下质量标准
- 用户要求“设置约束”、“添加质量门槛”、“定义我们的标准”或“阻止代理交付垃圾”
- 代理产出大量内容，而没有人逐行阅读
- CI 有检查，但没人能说清哪些会阻止合并，哪些只是摆设
- 覆盖率、性能或可访问性指标开始在每个 PR 里争论，而不是一次性决定
- 你正要运行 `/build auto` 或任何自主循环，而唯一挡在它和 main 之间的是一个代理自己也写出来的测试套件

**不适用的情况：**

- 项目已经有一个 `CONSTRAINTS.md`，而用户并没有要修改它——先读它并遵循它
- 一次性脚本、探索性尝试、一次性原型
- 用户现在想要的是代码审查（`code-review-and-quality`）或 CI 流水线构建（`ci-cd-and-automation`）
- 预产品市场匹配、预计生命周期只有两周的代码——下面的底线仍然值得做，其余的就不必了

## 加载约束

访谈需要一个真实用户。**不要在非交互式上下文中运行它**（CI、`/loop`、自主运行）。如果约束缺失，而你处于这些上下文之一，就应用下面的底线，说明你已经这样做了，并把其余部分标记给人类处理。

## 流程

### 第 1 步：先检测，再提问

不要问你本可以读取的东西。在提问之前，先收集：

| 需要什么 | 去哪里找 |
|------|---------------|
| 语言和技术栈 | `package.json`、`pyproject.toml`、`go.mod`、`Cargo.toml` |
| 测试运行器 | 开发依赖、`test` 脚本、现有测试文件 |
| 现有 lint 工具 | `eslint.config.*`、`biome.json`、`.ruff.toml` |
| 当前覆盖率 | `coverage/` 输出，或先运行一次测试套件 |
| CI | `.github/workflows/`、`.gitlab-ci.yml` |
| 代理挂载 | `.claude/`、`.codex/`、`AGENTS.md` |

用两行报告你找到的内容，然后只问剩下的部分。

### 第 2 步：四个问题，每个都有默认选项

遵循 `interview-me` 中一次只问一个问题的原则，但有一个变化：这里的每个问题都有默认选项，因此“我不知道”也是一个完整的回答，仍能生成可用的配置。

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

到四个问题就停止。十二个问题的调研只会产生一份没人看得懂的配置，以及一个后悔开始这件事的用户。

### 第 3 步：编写 CONSTRAINTS.md

在仓库根目录放置一个文件。任何运行在任何执行环境中的代理都可以读取它，而且对它的更改会在代码审查中出现，这正是它该出现的地方。

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

然后在 `AGENTS.md` 和 `CLAUDE.md` 中各添加一行：`Read CONSTRAINTS.md before writing code. Do not weaken it to make a change pass.`

### 第 4 步：安装每个维度所需的工具

选择一个维度就意味着要安装相应工具。不要只留给用户一个数字而没有对应机制；在已有事实标准时，也不要自行发明检查器。这些工具之所以列在这里，是因为生态系统中的其他工具都以它们的规则格式和阈值为目标，因此团队已有的配置可以继续工作。

| 维度 | 工具 | 安装 | 运行 | 拦截条件 |
|-----------|------|---------|-----|---------|
| 类型（TS） | tsc | 已有 | `tsc --noEmit` | 任意错误 |
| 类型（Python） | mypy | `pip install mypy` | `mypy .` | 任意错误 |
| Lint | 你现有的配置 | 已有 | `eslint .` / `biome check` / `ruff check` | 任意错误 |
| 覆盖率（JS） | 你的测试运行器 | 已有 | `vitest run --coverage`（或 `jest --coverage`） | 变更行的覆盖率 |
| 覆盖率（Python） | pytest-cov | `pip install pytest-cov` | `pytest --cov --cov-report=lcov` | 相同 |
| 安全：代码 | Semgrep | `pipx install semgrep` | `semgrep scan --config p/default --config p/owasp-top-ten` | 任意高严重性发现 |
| 安全：密钥 | gitleaks | `brew install gitleaks` | `gitleaks detect --redact --no-banner` | 任意发现 |
| 安全：依赖项 | osv-scanner | `brew install osv-scanner` | `osv-scanner scan source -r .` | 高严重性或更高 |
| 性能：页面 | Lighthouse | `npm i -D lighthouse` | `lighthouse $URL --output=json --quiet` | LCP、CLS、性能评分 |
| 性能：包体积 | size-limit | `npm i -D size-limit` | `size-limit --json` | 每个入口的字节预算 |
| 无障碍性 | axe-core | `npm i -D @axe-core/cli` | `axe $URL --tags wcag2a,wcag2aa,wcag21aa` | 零个严重或关键问题 |
| 架构 | dependency-cruiser | `npm i -D dependency-cruiser` | `depcruise --validate src` | 任意违规 |
| 断言质量 | Stryker | `npm i -D @stryker-mutator/core` | `stryker run --mutate <changed files>` | 变异评分 |

跳过以下五点会带来麻烦：

1. **gitleaks 的 `--redact` 不是可选项。** 不使用它，匹配到的密钥会进入代理的转录记录，这就是泄露的密钥如何最终出现在日志、摘要或提交信息中的原因。只报告规则和位置，绝不要报告值。
2. **Lighthouse 和 axe 需要一个 URL。** 它们只能针对运行中的应用工作，因此应当归入运行时阶段，针对预览部署或你先启动的本地服务器执行。如果项目没有可访问的 URL，例如 CLI、库或桌面应用，应明确说明并移除该维度，而不是编造一个无法运行的检查。
3. **将昂贵的检查限定到 diff 范围。** 对整个仓库运行 `stryker run --mutate` 需要数小时，最终会被关闭；对变更触及的文件运行则不到一分钟。Semgrep 也是如此，它接受路径列表。
4. **覆盖率不需要第二次测试运行。** 读取测试套件已经写入的 lcov，并将其与 `git diff` 取交集。为了得到一个数字而运行两次测试套件，是让人们讨厌它最快的方式。
5. **Semgrep 的注册表规则可免费运行；重新分发前请检查许可证。** 如果这对你的法务团队很重要，`opengrep` 是一个即插即用的分支，具有相同的规则格式和 JSON 输出。

把每一个都加到项目自己的脚本里，这样就能在没有 agent 的情况下复现：

```json
{
  "scripts": {
    "check:fast": "tsc --noEmit && eslint . && gitleaks detect --redact --no-banner",
    "check:task": "npm run check:fast && vitest run --coverage",
    "check:full": "npm run check:task && semgrep scan --config p/default && osv-scanner scan source -r ."
  }
}
```

这种映射比工具本身更重要。`check:fast` 是在每次编辑后运行的，`check:task` 是 agent 认为自己完成时运行的，`check:full` 则用于 CI。

现在这些命令分散在两个地方——`CONSTRAINTS.md` 里的 `Checked by` 列，以及这些脚本。`CONSTRAINTS.md` 是规范的唯一来源：它会为每条命令附带原因，而且会出现在 review 里。脚本只是便利包装器，必须与之保持一致，而不是第二套真相；一旦两者不一致，以文件为准。

### 第 5 步：把它接到生命周期里

最大的错误是到处都跑所有检查。会拖慢 agent 的检查会被关掉，而人们已经关掉的门禁比没有门禁更糟，因为门槛看起来还像是存在。

| 阶段 | 命令 | 运行内容 | 预算 |
|-------|---------|-----------|--------|
| BUILD | `/build` | 类型检查、lint、secrets、底线检查 | 少于 5s，仅限已改文件 |
| VERIFY | `/test` | 相关测试，修改行覆盖率 | 少于 90s |
| REVIEW | `/review` | 全部内容，再加下面的守卫 | 数分钟 |
| SHIP | `/ship` | 方向性检查，无回归 | CI |

让这件事还能忍受的两个规则：

1. **范围限制在 diff 内。** 检查这次变更碰到的行，不要扫整个仓库。变更行覆盖率是 agent 可以推进的数字；项目整体覆盖率是它继承来的数字。
2. **成本决定放置位置。** 任何超过几秒的东西都要移出编辑循环。对整个仓库做 mutation testing 需要数小时；只对变更涉及的文件做则不到一分钟，这就是“会有人跑”的检查和“没人会跑”的检查之间的差别。

### 第 6 步：保护门槛本身

总会有人指出，如果是 agent 写代码和检查，那这些检查就什么也证明不了。说对了一半，而且值得围绕这点做工程设计。

Agent 不会设计巧妙的漏洞。它们遇到红色检查，就会走最便宜的路把它变成绿色。审查时留意 diff 里的这五种动作：

1. **阈值被改了。** 预算被调低、严重级别被降了、检查从快速阶段里移除了。把 `CONSTRAINTS.md` 和分支起点时的版本对比。
2. **测试变简单了。** 新增了 `.skip`，删除了测试文件，把仍然保留的测试里的断言拿掉了。
3. **检查器被静音了。** 新增了 `@ts-ignore` 或 `eslint-disable`。下面四类 suppressions 值得特别关注，因为它们会关闭你依赖的检查：`istanbul ignore` 会把代码从覆盖率里排除，而不是去测试它；`Stryker disable` 会隐藏一个存活的 mutant；`nosemgrep` 和 `gitleaks:allow` 对安全发现也是同样的做法。
4. **工作还没做完。** 一个会抛异常的 stub，一个把失败吞掉的空 `catch`，一个本该是实现的位置却放着 `TODO`。
5. **出现了例外。** `Exceptions` 表里新增了一行，而没人讨论过。

这一切都不需要超出 `git diff` 的工具。收紧门槛应该静默进行；放宽门槛应该大声提示。

与编号维度不同，下限没有自己的事实标准工具，所以被要求强制执行它的 agent 往往会从头写一个检查器，而两个 agent 会写出两个不同的检查器。这五项检查的参考实现随这个 skill 一起提供，位于 [references/floor-guard.md](references/floor-guard.md)（以 diff 为范围，退出码 `0`/`1`/`2`，模式可按不同生态适配）。应当沿用它，而不是重新发明，原因和每个维度都要指定一个事实标准工具是一样的：这样机制在不同运行和技术栈之间保持一致。

**并非所有检查都同样“循环”。** 用一个问题来排序：agent 能不能通过写出实际上不工作的代码让它通过？

- **外部** — axe-core 编码了 WCAG，`osv-scanner` 读取漏洞数据库，Lighthouse 测量真实浏览器。agent 无法和这些争辩。
- **项目内** — 你的 lint 规则，你的层边界。文件由人来负责。
- **测试套件** — 你自己的测试。最有用，也是真正唯一循环的那一类。

一套完全由第三类组成的门槛，价值不如一套包含外部意见的门槛。检查至少存在一项外部约束。

### 第 7 步：没有数字时的棘轮

把代码库的覆盖率从 62% 设到 80%，你会得到一个永远红着的构建，然后是一个学会忽视红色构建的团队。

替代方案不要求做决定：记录你现在的位置，然后拒绝变差。把它写进“已测量，尚未强制”的表里，填上今天的数字和趋势方向。每一项检查都与记录值比较，而不是与某种愿望比较。当数字变好时，更新它；当数字变差时，那就是发现。

这也回应了一个关于训练的合理质疑。模型会因为通过测试而得到奖励，而这类测试你可以在几秒内评估。架构性腐化会在数月里显现，而且永远不会进入权重。棘轮就是缺失的惩罚，被写在构建能看到的地方。

## 合理默认值

当用户没有意见时，就用这些。它们的选择标准是：大多数代码库在第一天就能满足。

| 约束 | 默认值 | 为什么是这个数字 |
|------------|---------|-----------------|
| 变更行覆盖率 | ≥ 80% | 足够高，能迫使写测试；又足够低，允许一行配置 |
| 项目覆盖率 | 今天的值，且不得下降 | 采纳时无需争论 |
| Mutation score（如果使用） | 起步 ≥ 60% | 对从未做过 mutation 的测试套件来说很典型；80% 则比较成熟 |
| 依赖漏洞 | high 或以上为空 | 低于这个阈值大多只是噪音 |
| LCP | ≤ 2500 ms | Core Web Vitals 的“good”阈值 |
| CLS | ≤ 0.1 | 同上 |
| 可访问性 | 零个 critical 或 serious 的 axe 违规 | moderate 和 minor 往往有争议 |
| 异常生命周期 | 90 天 | 足够长，便于安排修复；又足够短，不会忘记 |
| 棘轮容差 | 0.5% | 当无关文件移动了这个数字时，能吸收漂移 |

把数字和理由一起写出来。没有理由的阈值，下一位碰到它的人会把它删掉。

## 升级路径

约束具有三个层级的约束力。从第一个开始。

1. **仅书面。** `CONSTRAINTS.md` 存在且代理会读取它。不花成本，能捕获诚实的错误，依赖代理遵守。
2. **脚本化。** 一个运行快速检查的 `npm run check`（或 `make check`），接入代理的编辑后钩子和 CI。确定性，无新增依赖。
3. **工具支持。** 一个专用运行器，用于处理差异范围、预算、棘轮和守卫检查。当配置复杂到超出 shell 脚本的承载范围时使用。位于 [references/floor-guard.md](references/floor-guard.md) 的底线守卫参考是守卫检查部分的起点。

大多数项目应止步于第 2 级。当你需要维护超过约三十行的检查运行 shell 时，升级到第 3 级。

**首次运行可以只设底线。** 底线守卫仅检查差异且无需安装，因此你可以在第一天就实施底线，并在安装各工具时逐步添加带编号的维度，而无需在首次提交受保护前搭建所有检查器。需要在机器范围安装的安全工具（gitleaks、osv-scanner）也可以仅在 CI 中运行，以免开发者电脑变得臃肿；请在 `Runs at` 列中声明每个维度在哪里运行。

## 常见托词

| 托词 | 现实 |
|--------|---------|
| “等代码稳定后再加约束” | 代码会围绕其变动期间被允许的内容稳定下来 |
| “测试就是约束” | 你写的测试只能证明你同意自己的观点；它们无法说明新代码的覆盖率、依赖风险或包体积增长 |
| “我们无法达到 80% 覆盖率” | 那就不要设为 80%。设为今天的数值并守住它 |
| “这会拖慢代理” | 只有将慢速检查放进快速循环时才会如此。这是放置错误，而不是反对约束的理由 |
| “我会记得我们的标准” | 代理不会，而它正在编写大部分代码 |
| “约束会阻碍我们发布” | 由负责人和日期明确的例外能为你解除阻塞。删除约束则会永远为所有人解除阻塞 |

## 危险信号

如果你发现以下情况，请停下来重新考虑：

- 访谈超过了四个问题，或生成了用户无法解释的配置
- 设置的预算当前代码库无法通过，却没有达成该预算的计划
- 在 CONSTRAINTS.md 中为某个维度写了数字，却没有工具支撑
- 明明存在事实标准工具，却手写了检查器，导致团队现有配置被忽略
- 每个约束都由项目自身的测试套件检查，没有外部意见
- `CONSTRAINTS.md` 与导致失败的功能在同一提交中被修改
- 例外没有负责人，或到期时间超过一年
- 代理提议放宽阈值，而不是修复代码
- 慢速检查进入编辑循环，且有人开始传递 `--no-verify`
- 自 `CONSTRAINTS.md` 编写以来，没有人打开过它

## 验证

正确应用此技能时，应满足：

- [ ] `CONSTRAINTS.md` 存在，且其中每个数字都有明确理由
- [ ] 底线已实施，并且无需修改即可在当前代码库中通过
- [ ] 用户选择的每个维度都已安装工具，并且有今天就能运行的命令
- [ ] 每项约束都说明了运行位置，且快速阶段保持在数秒以内
- [ ] 至少一项约束是外部的（并非由本项目自身测试判定）
- [ ] 仅测量型指标记录了今天的值和趋势方向
- [ ] 例外有负责人和到期日期
- [ ] `AGENTS.md` 或 `CLAUDE.md` 指向该文件
- [ ] 在当前分支上的试运行不会产生用户不同意的失败

## 另请参阅

- `interview-me` — 本技能的需求收集所借鉴的“一次一个问题”原则
- `code-review-and-quality` — 如何进行审查；本技能决定审查要执行哪些规则
- `ci-cd-and-automation` — 构建运行这些约束的流水线
- `test-driven-development` — 覆盖率和变异约束所衡量的测试套件
- `security-and-hardening` — 安全维度应包含的内容
- `performance-optimization` — 性能指标的来源