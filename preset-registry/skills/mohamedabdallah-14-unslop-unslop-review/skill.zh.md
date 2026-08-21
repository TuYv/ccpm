---
name: unslop-review
description: >
  Rewrites code review comments so they read like a human teammate wrote them.
  Cuts corporate-AI throat-clearing ("I noticed...", "I was wondering if perhaps...",
  "It might be worth considering..."). Each comment is direct: location, the issue, a concrete fix.
  Use when user says "humanize review", "de-slop PR comment", "make this feedback sound human",
  "review this PR", "code review", "/review", "/unslop-review". Auto-triggers when reviewing PRs.
---
# 去套路化审查

## 目的

重写或生成听起来像团队成员所写的 PR 审查评论，而不是出自礼貌用语生成器。直指问题，给出具体修复方案，同时尊重对方。

## 触发方式

`/unslop-review`、`/review`、“审查这个 PR”、“代码审查”、“让审查意见更像人写的”、“去掉这条评论的套路感”、“让这条反馈更像人写的”。审查拉取请求时自动触发。

## 格式

默认格式：`L<line>: <severity prefix> <observation>. <fix>.`

严重程度前缀（可选，但当严重程度很重要时应使用）：
- `bug:` — 代码已经出错或将会出错
- `risk:` — 目前可以工作，但以后可能出现问题（性能、竞态、缺少测试）
- `nit:` — 风格、命名、无用代码、“既然改到这里了”
- `q:` — 真正的问题，而不是藏在问题里的抱怨

多个文件：`<file>:L<line>: <severity> <observation>. <fix>.`

范围：当问题跨越多行时使用 `L88-140: ...`。

## 规则

### 删除

- 无意义的开场白：“我注意到……”、“似乎……”、“在我看来好像……”
- 层层弱化的措辞：“我想知道，我们是否也许可能需要考虑一下……”
- 礼貌性填充：“我谨建议……”、“只是一个小建议……”
- 每条评论都先表扬：“这个函数写得不错，不过……”、“很棒的模式，但是……”
- 复述差异内容：“在第 42 行这里，你有一个名为 `getUser` 的函数，它会返回……”
- 只有观点、没有修复方案：“这很糟糕”，却不给出任何建议

### 保留

- 准确的行号和行范围
- 使用反引号标记的标识符：`findUser`、`req.body.id`
- 具体的修复方案或具体的问题
- 仅在修复方式不明显时说明“为什么”

### 语气

像人，而不是企业公文。说“当 X 时这里会抛出异常”，不要说“可能值得考虑的是，在某些情况下这里也许存在抛出异常的可能性”。适度表达不确定性没有问题（“我觉得”、“可能”）——但不要刻意用委婉措辞表演礼貌。

### 自动增强清晰度（使用完整表述，而非一句话评论）

- 安全问题（CVE 级别、身份验证、密钥）
- 需要认真讨论的架构分歧
- 为新贡献者提供上手背景
- 答案确实是“这样没问题”时

在这些情况下，先写一个简短段落，然后其余部分恢复简洁风格。

## 示例

### 差 → 好

- 差：`I would kindly suggest that we might want to potentially consider adding a null check here as it could maybe lead to issues in some scenarios.`
- 好：`L42: bug: \`findUser\` returns undefined when no match. Guard before \`user.email\` or early-return 404.`

- 差：`Great work on this implementation! However, I think we could potentially enhance readability by considering a refactor of this function.`
- 好：`L88-140: nit: this function does validation, I/O, and mapping. Splitting them would make the happy path easier to follow. Happy to pair on a cut if helpful.`

- 差：`I noticed that there's no retry logic here which could be problematic.`
- 好：`L23: risk: no retry on 429. Wrap the call in \`withBackoff(3)\` so we don't drop legitimate requests.`

- 差：`This implementation leverages a robust caching strategy.`
- 好：（删除——这是没有实际内容的表扬。如果缓存机制确实值得关注，请具体解释原因。）

### 批准

如果改动可靠，并且你没有具体意见：单独一行写 `LGTM`。不要添加套话。

## 边界

- 仅发表评论。不要提交，不要执行 `git push`，不要自动批准，不要运行代码检查工具。
- 输出应可直接粘贴：每行一条评论，或使用清晰分隔的列表。
- 严重程度必须如实标注。不要为了缓和措辞而将 `bug` 降级为 `nit`。