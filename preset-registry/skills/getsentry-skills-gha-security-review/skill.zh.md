---
name: gha-security-review
description: 'GitHub Actions security review for workflow exploitation vulnerabilities. Use when asked to "review GitHub Actions", "audit workflows", "check CI security", "GHA security", "workflow security review", or review .github/workflows/ for pwn requests, expression injection, credential theft, and supply chain attacks. Exploitation-focused with concrete PoC scenarios.'
allowed-tools: Read, Grep, Glob, Bash, Task
---
<!--
攻击模式和真实案例来源于 StepSecurity（2025）对 HackerBot Claw 攻击活动的分析：
https://www.stepsecurity.io/blog/hackerbot-claw-github-actions-exploitation
-->

# GitHub Actions 安全审查

查找 GitHub Actions 工作流中可被利用的漏洞。每项发现都必须包含具体的利用场景——如果无法构建出攻击路径，就不要报告。

此技能编码了来自真实 GitHub Actions 漏洞利用的攻击模式，而非泛泛的 CI/CD 理论。

## 范围

审查所提供的工作流（文件、差异或仓库）。根据需要研究代码库，追踪完整的攻击路径后再进行报告。

### 要审查的文件

- `.github/workflows/*.yml`——所有工作流定义
- `action.yml` / `action.yaml`——仓库中的复合操作
- `.github/actions/*/action.yml`——本地可复用操作
- 工作流加载的配置文件：`CLAUDE.md`、`AGENTS.md`、`Makefile`、`.github/` 下的 shell 脚本

### 范围之外

- 其他仓库中的工作流（仅注明该依赖项）
- GitHub App 安装权限（如相关则注明）

## 威胁模型

仅报告可被**外部攻击者**利用的漏洞，即**没有**仓库写入权限的人。攻击者可以从 fork 发起 PR、创建 issue 以及发表评论。他们无法向分支推送、触发 `workflow_dispatch` 或触发手动工作流。

**不要标记**需要写入权限才能利用的漏洞：
- `workflow_dispatch` 输入注入——需要写入权限才能触发
- 仅由 `push` 触发且针对受保护分支的工作流中的表达式注入
- 所有调用方均为内部调用方时的 `workflow_call` 输入注入
- 仅由 `workflow_dispatch`/`schedule` 触发的工作流中的密钥

## 置信度

仅报告置信度为 **HIGH** 和 **MEDIUM** 的发现。不要报告理论性问题。

| 置信度 | 标准 | 操作 |
|---|---|---|
| **HIGH** | 已追踪完整攻击路径，并确认可被利用 | 连同利用场景和修复方案一起报告 |
| **MEDIUM** | 攻击路径已得到部分确认，但某个环节尚不确定 | 报告为需要验证 |
| **LOW** | 理论性问题或已在其他地方得到缓解 | 不要报告 |

对于每项 HIGH 置信度的发现，提供以下全部五个要素：

1. **入口点**——攻击者如何进入？（fork PR、issue 评论、分支名称等）
2. **载荷**——攻击者发送什么？（实际代码/YAML/输入）
3. **执行机制**——载荷如何运行？（表达式展开、检出 + 脚本等）
4. **影响**——攻击者获得什么？（令牌窃取、代码执行、仓库写入权限）
5. **PoC 概要**——攻击者会遵循的具体步骤

如果无法构建出全部五个要素，则报告为 MEDIUM（需要验证）。

---

## 第 1 步：对触发器进行分类并加载参考资料

对于每个工作流，识别触发器并加载相应的参考资料：

| 触发器 / 模式 | 加载参考资料 |
|---|---|
| `pull_request_target` | `references/pwn-request.md` |
| 带命令解析的 `issue_comment` | `references/comment-triggered-commands.md` |
| `run:` 块中的 `${{ }}` | `references/expression-injection.md` |
| PAT / 部署密钥 / 高权限凭据 | `references/credential-escalation.md` |
| 检出 PR 代码 + 加载配置文件 | `references/ai-prompt-injection-via-ci.md` |
| 第三方操作（尤其是未固定版本的操作） | `references/supply-chain.md` |
| `permissions:` 块或密钥使用 | `references/permissions-and-secrets.md` |
| 自托管运行器、缓存/构件使用 | `references/runner-infrastructure.md` |
| 任何已确认的发现 | `references/real-world-attacks.md` |

选择性加载参考资料——仅加载与发现的触发器相关的内容。

## 第 2 步：检查漏洞类别

### 检查 1：Pwn Request

工作流是否使用 `pull_request_target`，同时检出来自 fork 的代码？
- 查找带有 `ref:` 且指向 PR head 的 `actions/checkout`
- 查找可能来自 fork 的本地 Action（`./.github/actions/`）
- 检查是否有任何 `run:` 步骤执行已检出 PR 中的代码

### 检查 2：表达式注入

在可由外部触发的工作流中，`${{ }}` 表达式是否用在 `run:` 块内？
- 映射每个 `run:` 步骤中的每个 `${{ }}` 表达式
- 确认该值由攻击者控制（PR 标题、分支名称、评论正文——而非数字 ID、SHA 或仓库名称）
- 确认表达式位于 `run:` 块中，而不是 `if:`、`with:` 或作业级 `env:` 中

### 检查 3：未经授权的命令执行

由 `issue_comment` 触发的工作流是否会在未经授权的情况下执行命令？
- 是否存在 `author_association` 检查？
- 是否任何 GitHub 用户都可以触发该命令？
- 命令处理程序是否也使用了可注入的表达式？

### 检查 4：凭据权限提升

不受信任的代码是否可以访问高权限凭据（PAT、部署密钥）？
- 每个密钥的影响范围有多大？
- 遭入侵的工作流是否能窃取长期有效的令牌？

### 检查 5：配置文件投毒

工作流是否从 PR 提供的文件中加载配置？
- AI 智能体指令：`CLAUDE.md`、`AGENTS.md`、`.cursorrules`
- 构建配置：`Makefile`、shell 脚本

### 检查 6：供应链

**第三方** Action 是否安全地固定到完整 SHA？
- 仅固定第三方/外部 Action 和可复用工作流
- 不要将在版本标签上使用第一方 `actions/*` 或 `github/*` 标记为问题
- 不要将同一仓库中的/内置的（`./.github/actions/...`）Action 标记为供应链固定问题
- 仅当作业拥有密钥、OIDC、写入令牌、发布、部署、软件包或签名权限时才报告——无特权的只读 CI 不算作发现项

### 检查 7：权限和密钥

工作流权限是否遵循最小化原则？密钥的作用域是否适当？

### 检查 8：运行器基础设施

自托管运行器、缓存或制品是否得到安全使用？

## 安全模式（不要标记）

报告之前，请检查该模式是否确实安全：

| 模式 | 安全原因 |
|---|---|
| 使用 `pull_request_target` 但不检出 fork 代码 | 绝不会执行攻击者代码 |
| 在 `run:` 中使用 `${{ github.event.pull_request.number }}` | 仅为数字——不可注入 |
| `${{ github.repository }}` / `github.repository_owner` | 由仓库所有者控制 |
| `${{ secrets.* }}` | 不是表达式注入向量 |
| 在 `if:` 条件中使用 `${{ }}` | 由 Actions 运行时求值，而不是由 shell 求值 |
| 在 `with:` 输入中使用 `${{ }}` | 作为字符串参数传递，不由 shell 求值 |
| 固定到完整 SHA 的第三方 Action | 不可变引用 |
| 在版本标签上使用第一方 `actions/*` / `github/*` | 不属于第三方固定策略的范围——不要标记 |
| 同一仓库中的/内置的本地 Action | 不属于第三方供应链（需单独审查 pwn-request） |
| `pull_request` 触发器（而非 `_target`） | 在 fork 上下文中使用只读令牌运行 |
| `workflow_dispatch`/`schedule`/推送到受保护分支中的任何表达式 | 需要写入权限——不在威胁模型范围内 |

**关键区别：** `${{ }}` 在 `run:` 块中很危险（shell 展开），但在作业/步骤级别的 `if:`、`with:` 和 `env:` 中是安全的（由 Actions 运行时求值）。

## 步骤 3：报告前验证

在纳入任何发现之前，请阅读实际的工作流 YAML 并追踪完整的攻击路径：

1. **阅读完整的工作流** — 不要仅依赖 grep 输出
2. **追踪触发器** — 确认事件，并检查控制执行的 `if:` 条件
3. **追踪表达式/检出操作** — 确认它位于 `run:` 块中，或者确实引用了 fork 中的代码
4. **确认攻击者控制权** — 验证该值是否映射到外部攻击者能够设置的内容
5. **检查现有缓解措施** — 环境变量封装、author_association 检查、受限权限、SHA 固定

如果任何一个环节不成立，则将该发现标记为 MEDIUM（需要验证），或移除该发现。

**如果所有检查均未产生任何发现，请报告零项发现。不要臆造问题。**

## 步骤 4：报告发现

````markdown
## GitHub Actions Security Review

### Findings

#### [GHA-001] [Title] (Severity: Critical/High/Medium)
- **Workflow**: `.github/workflows/release.yml:15`
- **Trigger**: `pull_request_target`
- **Confidence**: HIGH — confirmed through attack path tracing
- **Exploitation Scenario**:
  1. [Step-by-step attack]
- **Impact**: [What attacker gains]
- **Fix**: [Code that fixes the issue]

### Needs Verification
[MEDIUM confidence items with explanation of what to verify]

### Reviewed and Cleared
[Workflows reviewed and confirmed safe]
````

如果没有发现："No exploitable vulnerabilities identified. All workflows reviewed and cleared."