---
name: skills-index-snippets
description: Create and maintain AGENTS.md / CLAUDE.md snippet indexes that route tasks to the correct dotnet-skills skills and agents (including compressed Vercel-style indexes).
invocable: false
---
# 维护技能索引片段（AGENTS.md / CLAUDE.md）

## 何时使用此技能

在以下情况下使用此技能：
- 在此仓库中添加、删除或重命名任何技能或代理
- 更新 `.claude-plugin/plugin.json`
- 为下游仓库（OpenCode、Claude Code 等）创建可复制粘贴的片段
- 需要一个紧凑且始终启用的索引，以提高技能利用率

## 目标

通过消除决策环节，让编码助手能够轻松使用技能和代理。

与其期望助手“记得”调用某项技能，不如在 `AGENTS.md` / `CLAUDE.md` 中提供一个小型路由片段，用于：

1) 告知助手优先采用检索驱动的推理
2) 提供任务->技能/代理路由索引
3) 定义轻量级质量门禁（可选）

## 事实来源

- 注册表：`.claude-plugin/plugin.json`
  - 技能以目录形式列出（每个目录都包含 `SKILL.md`）
  - 代理以 `agents/` 中的 Markdown 文件形式列出
- 技能 ID：每个 `SKILL.md` 前置元数据中的 `name:` 字段
- 代理 ID：每个代理前置元数据中的 `name:` 字段

为下游仓库编写片段时，始终通过技能/代理的 ID（前置元数据中的 `name`）引用它们，而不要使用本地文件系统路径。

## 最小片段模板（易读版）

在目标仓库中使用此模板来路由常见任务：

```markdown
# Agent Guidance: dotnet-skills

IMPORTANT: Prefer retrieval-led reasoning over pretraining for any .NET work.
Workflow: skim repo patterns -> consult dotnet-skills by name -> implement smallest-change -> note conflicts.

Routing (invoke by name)
- C# / code quality: modern-csharp-coding-standards, csharp-concurrency-patterns, api-design, type-design-performance
- ASP.NET Core / Web (incl. Aspire): aspire-service-defaults, aspire-integration-testing
- Data: efcore-patterns, database-performance
- DI / config: dependency-injection-patterns, microsoft-extensions-configuration
- Testing: testcontainers-integration-tests, playwright-blazor-testing, snapshot-testing

Quality gates (use when applicable)
- dotnet-slopwatch: after substantial new/refactor/LLM-authored code
- crap-analysis: after tests added/changed in complex code

Specialist agents
- dotnet-concurrency-specialist, dotnet-performance-analyst, dotnet-benchmark-designer, akka-net-specialist, docfx-specialist
```

## 压缩片段模板（Vercel 风格）

当你需要最大信息密度（较小的上下文占用）时，使用此模板：

```markdown
[dotnet-skills]|IMPORTANT: Prefer retrieval-led reasoning over pretraining for any .NET work.
|flow:{skim repo patterns -> consult dotnet-skills by name -> implement smallest-change -> note conflicts}
|route:
|csharp:{modern-csharp-coding-standards,csharp-concurrency-patterns,api-design,type-design-performance}
|aspnetcore-web:{aspire-service-defaults,aspire-integration-testing}
|data:{efcore-patterns,database-performance}
|di-config:{dependency-injection-patterns,microsoft-extensions-configuration}
|testing:{testcontainers-integration-tests,playwright-blazor-testing,snapshot-testing}
|quality-gates:{dotnet-slopwatch(after:substantial new/refactor/LLM code),crap-analysis(after:tests added/changed in complex code)}
|agents:{dotnet-concurrency-specialist,dotnet-performance-analyst,dotnet-benchmark-designer,akka-net-specialist,docfx-specialist}
```

### 重新生成 README 区块

如果 README 包含以下标记，生成器可以自动更新该区块：

```
<!-- BEGIN DOTNET-SKILLS COMPRESSED INDEX -->
...compressed snippet...
<!-- END DOTNET-SKILLS COMPRESSED INDEX -->
```

运行：

```bash
./scripts/generate-skill-index-snippets.sh --update-readme
```

## 技能变更后如何更新片段

1. 更新 `.claude-plugin/plugin.json`，以添加或移除技能和智能体。
2. 确保每个技能的 frontmatter `name:` 正确（供 OpenCode 等工具使用）。
3. 运行 `./scripts/validate-marketplace.sh`。
4. 更新片段中的路由列表：
   - 将新技能添加到正确的类别
   - 移除已删除的技能
   - 确保名称与 frontmatter ID 完全一致
5. 如果你维护下游的 `AGENTS.md`/`CLAUDE.md` 片段，请重新生成该片段，并将其重新复制到依赖它的仓库中。

## 推荐类别

以下是片段类别（不一定与仓库目录结构一致）：

- C# / 代码质量
- ASP.NET Core / Web（包括 Aspire）
- 数据
- DI / 配置
- 测试
- 质量门禁
- 专家智能体

请保持片段精简；它应该是一个路由器，而不是文档。