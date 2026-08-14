---
name: update-deps
description: Audit and update npm/Bun dependencies with supply chain integrity checks — verifies maintainers, publish age, tarball diffs, and provenance before bumping. Defers risky packages to ~/.supply-chain/notes/.
disable-model-invocation: true
---
# 更新依赖项

审查过时的软件包，验证供应链完整性，升级可安全更新的部分，推迟需要审查的部分，并记录所有操作。

此流程分为三个阶段：发现、完整性审计和执行。完整性审计是最重要的环节——每个软件包在写入锁文件之前都必须经过检查。

## 阶段 1：发现

运行 `bun outdated`，获取所有存在可用更新的软件包列表。

```bash
bun outdated
```

将输出解析为结构化列表。对于每个软件包，记录：
- 软件包名称
- 当前版本
- 可用的更新版本
- 是否受发布时间限制（在输出中以 `*` 表示——脚注“The * indicates that version isn't true latest due to minimum release age”对此进行了确认）
- 它是运行时依赖、开发依赖还是对等依赖

还要检查是否有任何软件包完全被发布时间限制阻止（例如，当 `@pierre/diffs` 的最低 semver 范围无法解析时就是如此）。单独标记这些软件包——它们可能需要在 `bunfig.toml` 中配置 `minimumReleaseAgeExcludes`。

## 阶段 2：完整性审计

这是该流程的核心。为每个软件包启动一个 **Sonnet 子代理**，并行执行完整性检查。这里使用 Sonnet，是因为这些任务相互独立、结构明确，不需要更强的推理能力。

每个子代理都会收到软件包名称、当前版本和目标版本，并执行以下检查：

### 子代理提示词模板

对于每个过时的软件包，启动一个 Sonnet 代理并为其分配以下任务：

```
You are auditing the npm package "{package}" for a version bump from {current} to {target}.

Run these checks and report back with a JSON object:

1. **Maintainer verification**: Check if maintainers changed between versions.
   npm view {package}@{current} maintainers --json
   npm view {package}@{target} maintainers --json
   Compare the two lists. Flag any additions or removals.

2. **Publish date and age**: Get the publish timestamp.
   npm view {package} time --json
   Extract the date for version {target}. Calculate days since publication.
   Flag if younger than 7 days.

3. **Provenance**: Check if the package has registry signatures or attestations.
   npm audit signatures (if not already run this session)
   Note whether the package has provenance attestations.

4. **Tarball diff**: Show what actually changed in the published package.
   npm diff --diff={package}@{current} --diff={package}@{target}
   Summarize the changes:
   - How many files changed
   - Are changes limited to version bumps, deps, and rebuilt dist? Or are there meaningful source changes?
   - Any new runtime dependencies added?
   - Any suspicious patterns (obfuscated code, eval(), network calls in unexpected places)

5. **Release notes**: Try to find what changed.
   Check the package's repository for release notes or changelog:
   npm view {package}@{target} repository.url
   gh release view v{target} --repo <owner/repo> (try with and without v prefix)
   Summarize the changelog if found.

Report your findings as JSON:

{{
  "package": "{package}",
  "from": "{current}",
  "to": "{target}",
  "age_days": <number>,
  "maintainers_changed": <boolean>,
  "maintainers_added": [],
  "maintainers_removed": [],
  "provenance": <boolean>,
  "new_runtime_deps": [],
  "files_changed": <number>,
  "has_source_changes": <boolean>,
  "changelog_summary": "<brief summary>",
  "suspicious_patterns": [],
  "verdict": "safe" | "review" | "defer",
  "verdict_reason": "<one sentence explanation>"
}}

Verdict guidelines:
- "safe": Same maintainers, no new runtime deps, changes match what changelog describes, no suspicious patterns
- "review": Minor concerns (e.g., new maintainer who is clearly from the same org, small new dep from known publisher)
- "defer": Maintainer changes from unknown accounts, new runtime deps with unclear purpose, suspicious code patterns, substantive API changes that need integration testing
```

### 收集结果

当各子代理完成任务后，收集它们的 JSON 报告。如果某个子代理失败或超时，则将该软件包标记为 "defer"，原因为 "audit failed"。

### 层级分类

收集所有结果后，将软件包划分为不同层级。这有助于用户一目了然地了解风险状况：

| 层级 | 说明 | 典型操作 |
|------|-------------|----------------|
| **运行时、高影响面** | 代码直接调用的库（解析器、差异比较引擎、UI 库） | 检查来源、审查差异、运行测试 |
| **SDK/API 依赖项** | 第三方服务 SDK（代理 SDK、平台集成） | 阅读变更日志以了解 API 变更、测试集成 |
| **仅开发环境** | 类型定义、构建工具、测试框架 | 可放心更新——这些依赖不会随产品发布 |
| **构建工具链** | Bun 本身、编译器、打包器 | 最需谨慎——破坏性变更会影响所有输出 |

## 阶段 3：执行

### 升级安全的软件包

对于所有结论为 "safe" 的软件包：

```bash
bun update pkg1@version1 pkg2@version2 ...
```

如果更新因发布时间门槛冲突而失败（软件包的最低 semver 无法解析），请将其添加到 `bunfig.toml` 的 `minimumReleaseAgeExcludes` 中，并记录原因。

### 记录到供应链备注

将完整的审计结果写入 `~/.supply-chain/notes/<YYYY-MM-DD>.json`：

```json
{
  "date": "YYYY-MM-DD",
  "project": "plannotator",
  "bumped": [
    {
      "package": "...",
      "from": "...",
      "to": "...",
      "age_days": 0,
      "maintainers_changed": false,
      "provenance": false,
      "notes": "..."
    }
  ],
  "deferred": [
    {
      "package": "...",
      "current": "...",
      "available": "...",
      "age_days": 0,
      "maintainers_changed": false,
      "reason": "...",
      "review_by": "YYYY-MM-DD"
    }
  ],
  "excluded_from_age_gate": [
    {
      "package": "...",
      "reason": "..."
    }
  ]
}
```

对于推迟处理的软件包，将 `review_by` 设置为从今天起 7 天后的日期。

### 检查之前推迟的软件包

读取 `~/.supply-chain/notes/` 中的所有文件，并收集以往审计中已推迟、且当前锁文件中版本仍未变化的软件包。这些软件包之前被推迟处理，至今仍未更新。

检查方法：对于之前推迟记录中的每一项，查看当前安装版本是否与推迟备注中的 `current` 字段匹配。如果匹配，则该软件包仍处于推迟状态。

## 阶段 4：总结

向用户清晰地呈现总结：

### 已更新
列出每个已升级的软件包、版本变化，以及说明其安全的一句话理由。

### 已推迟
列出每个推迟处理的软件包、版本变化及推迟原因。

### 仍处于推迟状态（来自之前的审计）
列出之前审计会话中被推迟且至今仍未升级的所有软件包。包括最初推迟的日期和原因。这是“你一直在拖延处理”的部分——它可以避免推迟的软件包被遗忘。

如果仍处于推迟状态的列表为空，请明确说明——这是一个好兆头。

### 发布时间门槛排除项
如果有任何软件包被添加到 `minimumReleaseAgeExcludes`，请注明这些软件包及其原因。