---
name: fp-check
description: "Systematically verifies suspected security bugs to eliminate false positives, producing a TRUE POSITIVE or FALSE POSITIVE verdict with documented evidence for each. Use when asked whether a specific finding is real, exploitable, or a false positive, or to verify or validate a suspected vulnerability — not for hunting or discovering new bugs."
allowed-tools: Read Grep Glob LSP Bash Task Write Edit AskUserQuestion TaskCreate TaskUpdate TaskList TaskGet
---
# 误报检查

## 何时使用

- “这个 bug 是真的吗？”或“这是一个真阳性吗？”
- “这是误报吗？”或“验证这个发现”
- “检查这个漏洞是否可被利用”
- 任何要求验证或核实某个特定疑似 bug 的请求

## 何时不使用

- 查找或搜寻 bug（"find bugs"、"security analysis"、"audit code"）
- 针对风格、性能或可维护性的常规代码审查
- 功能开发、重构或非安全类任务
- 当用户明确要求只做快速扫描、不做验证时

## 必须拒绝的合理化借口

如果你发现自己在想以下任何一条，立刻停下。

| 合理化借口 | 为什么是错的 | 必须采取的行动 |
|---|---|---|
| “快速分析剩余的 bug” | 每个 bug 都必须经过完整验证 | 回到任务列表，对所有阶段逐一验证下一个 bug |
| “这个模式看起来危险，所以是漏洞” | 模式识别不等于分析 | 在得出任何结论之前完成数据流追踪 |
| “为了效率跳过完整验证” | 不允许只做部分分析 | 按所选的验证路径执行所有步骤 |
| “代码看起来不安全，不做数据流追踪就直接报告” | 看起来不安全的代码可能在上游已有校验 | 追踪从 source 到 sink 的完整路径 |
| “别处的类似代码存在漏洞” | 每个上下文的校验、调用方和保护措施都不同 | 独立验证这一个具体实例 |
| “这显然是严重漏洞” | LLM 天然倾向于看出 bug 并高估严重性 | 完成魔鬼代言人审查；用证据证明它 |

---

## 第 0 步：理解主张与上下文

在进行任何分析之前，先用自己的话复述这个 bug。如果你无法清晰地做到这一点，请向用户寻求澄清。一半的误报在这一步就会不攻自破——因为当你精确复述时，这个主张本身就说不过去。

需要记录的内容：

- **确切的漏洞主张是什么？**（例如："`parse_header()` 在 `content_length` 超过 4096 时发生堆缓冲区溢出"）
- **声称的根本原因是什么？**（例如："第 142 行 `memcpy` 之前缺少边界检查"）
- **假设的触发条件是什么？**（例如：“攻击者发送带有超大 Content-Length 头的 HTTP 请求”）
- **声称的影响是什么？**（例如：“通过受控的堆破坏实现远程代码执行”）
- **威胁模型是什么？** 这段代码以什么权限级别运行？是否处于沙箱中？在触发这个 bug 之前，攻击者已经能做什么？（例如：“未经认证的远程攻击者 vs 特权本地用户”；“在 Chrome 渲染器沙箱内运行” vs “以 root 身份运行且无沙箱”）
- **漏洞类别是什么？** 对 bug 进行分类，并查阅 [bug-class-verification.md]({baseDir}/references/bug-class-verification.md)，获取特定类别的验证要求，作为对下文通用阶段的补充。
- **执行上下文**：在正常执行过程中，何时以及如何会到达这条代码路径？
- **调用方分析**：哪些函数调用了这段代码，它们施加了什么输入约束？
- **架构上下文**：它是否是具有多层防护的更大型安全系统的一部分？
- **历史上下文**：这块代码区域近期是否有变更、已知问题或以往的安全审查？

## 路由选择：标准验证 vs 深度验证

完成第 0 步后，选择一条验证路径。

### 标准验证

当以下条件全部满足时使用：

- 清晰、具体的漏洞主张（不模糊、无歧义）
- 单一组件——bug 路径中不存在跨组件交互
- 广为人知的漏洞类别（缓冲区溢出、SQL 注入、XSS、整数溢出等）
- 触发机制不涉及并发或异步
- 从 source 到 sink 的数据流简单直接

请遵循 [standard-verification.md]({baseDir}/references/standard-verification.md)。无需任务跟踪——按顺序完成线性检查清单，并就地记录各项发现。

### 深度验证

当以下任一条件满足时使用：

- 存在歧义、可有多种解读方式的主张
- 跨组件的 bug 路径（数据流经 3 个以上模块或服务）
- 触发机制中存在竞态条件、TOCTOU 或并发
- 没有明确规范可供对照验证的逻辑 bug
- 标准验证无法得出结论或已升级
- 用户明确要求完整验证

请遵循 [deep-verification.md]({baseDir}/references/deep-verification.md)。将每个阶段作为带显式依赖关系的任务来跟踪，并使用该插件的分析代理执行各阶段。

### 默认做法

默认从标准验证开始。标准验证内置两个升级检查点，当复杂度超出线性检查清单的承载范围时，会转入深度验证。

## 批量分诊

一次验证多个 bug 时：

1. 先对所有 bug 执行第 0 步——复述每条主张往往能立即推翻明显的误报
2. 独立地为每个 bug 选择路由（有些可能走标准验证，其他可能走深度验证）
3. 先处理所有路由到标准验证的 bug，再处理路由到深度验证的 bug
4. 所有 bug 验证完毕后，检查是否存在**利用链**——那些单独未能通过门控审查的发现，组合起来可能构成可行的攻击

## 最终总结

处理完所有疑似 bug 后，提供：

1. **数量**：X 个真阳性，Y 个误报
2. **真阳性列表**：每项附简短的漏洞描述
3. **误报列表**：每项附简短的否决理由

## 参考文档

- [标准验证]({baseDir}/references/standard-verification.md)——针对简单直接 bug 的线性单遍检查清单
- [深度验证]({baseDir}/references/deep-verification.md)——针对复杂 bug 的完整基于任务的编排
- [门控审查]({baseDir}/references/gate-reviews.md)——六个强制门控及裁决格式
- [漏洞类别验证]({baseDir}/references/bug-class-verification.md)——针对内存破坏、逻辑 bug、竞态条件、整数问题、密码学、注入、信息泄露、DoS 和反序列化的特定类别验证要求
- [误报模式]({baseDir}/references/false-positive-patterns.md)——13 项检查清单及常见误报模式的危险信号
- [证据模板]({baseDir}/references/evidence-templates.md)——用于数据流、数学证明、攻击者控制能力以及魔鬼代言人审查的文档模板
