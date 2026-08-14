---
name: review-renovate
description: Review Renovate bot PRs that update GitHub Actions dependencies. Verifies supply chain integrity by checking pinned commit SHAs against upstream tagged releases, reviews changelogs for breaking changes, and confirms compatibility with existing workflow configurations. Use when a Renovate PR updates GitHub Actions in .github/workflows/.
---
# 审查 Renovate GitHub Actions PR

你正在审查一个由 Renovate 机器人创建的 PR，该 PR 用于更新 GitHub Actions 依赖项。你的工作是验证供应链完整性，并确保升级不会破坏 CI/CD 工作流。

## 输入

你将获得一个 PR 编号或 URL。使用 `gh` CLI 获取 PR 详情和差异。

## 步骤

### 1. 获取 PR 元数据和差异

```
gh pr view <PR> --json title,body,files,commits,author,headRefName
gh pr diff <PR>
```

确认 PR 作者是 `app/renovate`。如果不是，请立即标记——这可能不是自动化依赖项更新。

### 2. 识别所有 Action 版本变更

从差异中提取每个发生变更的 Action：
- 完整的 Action 名称（例如 `oven-sh/setup-bun`）
- 旧版本标签和固定的 SHA
- 新版本标签和固定的 SHA
- 更新类型（补丁、次要、主要）

### 3. 根据上游标签验证固定的 SHA

对于每个要更新的 Action，验证**旧版和新版** SHA 均与声称的版本标签匹配：

```
gh api repos/{owner}/{repo}/git/ref/tags/{version} --jq '.object.sha'
```

将每个结果与工作流文件中的 SHA 进行比较。如果任何 SHA 不匹配，**立即停止并报告供应链完整性失败**。不要批准该 PR。

### 4. 审查变更日志中的破坏性变更

根据 PR 正文（Renovate 会包含发布说明），检查每个更新后的 Action 是否存在以下情况：
- 移除了工作流当前使用的输入或输出
- 更改了工作流所依赖输入的默认行为
- 新增了必需输入
- 主要版本升级（这类升级几乎总是包含破坏性变更）

### 5. 检查工作流兼容性

阅读受影响的工作流文件并验证：
- 未使用已移除或重命名的输入
- 默认值变更不会影响当前行为
- 仍然满足该 Action 的运行时要求（例如 Node.js 版本兼容性）

### 6. 报告结果

提供汇总表：

| Action | 旧版 | 新版 | 类型 | SHA 已验证 |
|--------|-----|-----|------|-------------|
| ... | ... | ... | 补丁/次要/主要 | 是/否 |

然后说明：
- 是否所有 SHA 均已验证
- 是否发现任何破坏性变更
- 工作流是否仍然兼容
- 给出明确的**可以安全合并**或**不要合并**建议