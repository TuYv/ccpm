---
name: research-methodology
description: Systematic approach for gathering authoritative, version-accurate documentation. Claude invokes this skill when research is needed before implementation. Ensures truth over speed while achieving both.
auto_invoke: true
tags: [research, documentation, verification, truth]
---
# 研究方法论技能

此技能提供了一套系统化的方法论，用于开展快速、准确的文档研究，使实现建立在事实基础上，而不是可能已经过时的 LLM 记忆之上。

## Claude 应使用此技能的场景

Claude 会在以下情况下自动调用此技能：
- 用户提到要实现或使用特定库或 API
- 用户询问某项技术的当前文档
- 用户请求验证 API 签名或方法
- 任务需要外部依赖或第三方集成
- 将框架更新或升级到新版本

## 核心原则（BRAHMA 宪章）

1. **事实优先于速度** - 但通过系统化方法同时实现两者
2. **绝不猜测 API** - 始终从权威来源获取信息
3. **引用所有内容** - 包含版本、URL 和章节引用
4. **确定性** - 相同的研究查询应产生一致的结果

## 研究方法论协议

### 步骤 1：快速评估（< 30 秒）

**目标**：
- 确定需要研究的内容
- 从项目文件中检测当前版本
- 澄清任何歧义

**操作**：
1. **解析请求** - 提取其中提到的库/API 名称
2. **版本检测** - 检查项目依赖文件：
   - `package.json` → Node.js 项目
   - `requirements.txt`、`pyproject.toml`、`Pipfile` → Python
   - `go.mod` → Go
   - `Cargo.toml` → Rust
   - `build.gradle`、`pom.xml` → Java
   - `*.csproj` → C#/.NET
   - `pubspec.yaml` → Dart/Flutter
   - `composer.json` → PHP

3. **收集上下文** - 记录运行时、平台和现有依赖

**输出**：
```
Target: [library-name]
Current Version: [X.Y.Z] (detected from [file])
Platform: [Node.js 20.x / Python 3.11 / etc.]
```

**如果不明确**：提出一个具体的澄清问题，而不是基于假设继续执行

### 步骤 2：来源优先级排序（< 10 秒）

**来源层级**（按优先顺序排列）：

1. **官方文档**（主要来源）
   - 项目官方网站
   - 官方 API 参考
   - 官方入门指南

2. **官方迁移/升级指南**（如果发生版本变更）
   - 破坏性变更文档
   - 迁移路径
   - 弃用通知

3. **官方发行说明/变更日志**（用于获取特定版本信息）
   - 此版本中的新增内容
   - 与使用场景相关的错误修复
   - 已知问题

4. **官方 GitHub 仓库**（如果文档不够完善）
   - README.md
   - Examples 目录
   - Issue 跟踪器（用于了解已知问题）

5. **避免使用**（除非没有其他选择）：
   - 博客文章（可能已经过时）
   - Stack Overflow（可能针对错误的版本）
   - AI 生成的内容（存在循环幻觉风险）

### 步骤 3：信息检索（< 90 秒）

**检索策略**：

```
1. 尝试使用 context7 系统（如果可用）
   └─ 速度最快、经过整理且具备版本感知能力的文档

2. 对已知的官方文档 URL 使用 WebFetch
   └─ 直接从来源获取内容

3. 如果不知道 URL，则使用 WebSearch
   查询格式："[library name] [version] official documentation"
   └─ 先找到官方网站，然后再获取内容

4. 仅提取相关章节
   └─ 不要下载完整文档，只针对所需的具体信息进行检索
```

**提取内容**：
- **API 签名** - 函数名称、参数、返回类型
- **设置/初始化** - 如何配置并开始使用
- **代码示例** - 最小可运行示例（附带源代码 URL）
- **注意事项** - 已知问题、破坏性变更、特定版本警告
- **最佳实践** - 文档中推荐的使用模式

### 防止停滞：
- 为每个来源设置 60 秒超时
- 如果来源获取失败，报告失败情况并尝试下一个来源
- 如果所有来源都失败，报告已尝试的内容，并建议进行手动研究

### 第 4 步：验证与引用（< 30 秒）

**对于提取的每一条信息**：

```markdown
API: someFunction(param1: Type): ReturnType
Source: official-docs.com/api-reference/someFunction [version X.Y.Z]
```

**验证清单**：
- ✓ 版本与项目依赖项匹配
- ✓ 来源为官方来源（而非第三方）
- ✓ URL 链接到具体章节（而不只是主页）
- ✓ 信息是最新的（检查文档中显示的版本/日期）
- ✓ 示例完整且可运行

**置信度级别**：
- **HIGH**：对应确切版本的官方文档，且有多个来源相互印证
- **MEDIUM**：官方文档但存在轻微版本不匹配，或只有单一来源
- **LOW**：仅有非官方来源、版本不匹配，或文档已弃用

**报告置信度**：始终在研究输出中标明置信度级别

### 第 5 步：结构化输出（< 30 秒）

**以 ResearchPack 格式交付**：

```markdown
# 📋 ResearchPack: [Library Name]

## Quick Reference
- Library: [name] v[X.Y.Z]
- Official Docs: [URL]
- Confidence: [HIGH/MEDIUM/LOW]

## Key APIs
[Concise list with signatures and sources]

## Setup
[Essential steps only, not every option]

## Gotchas
[Version-specific issues to avoid]

## Example
[Minimal working code with source link]

## Implementation Checklist
[Files to modify, steps in order]

## Sources
[Numbered list with URLs and versions]

## Open Questions
[Any decisions/clarifications needed]
```

**保持简洁**：
- 使用项目符号，而不是段落
- 仅包含实现所需的关键信息
- 提供进一步阅读的链接（不要摘录全部内容）

## 质量保证

**交付研究结果前**：

1. **完整性检查**：
   - ✓ 已识别库及其版本
   - ✓ 至少记录 3 个关键 API
   - ✓ 提供设置步骤
   - ✓ 至少提供 1 个代码示例
   - ✓ 所有声明均附带来源引用

2. **准确性检查**：
   - ✓ API 签名与文档完全一致（未进行改写）
   - ✓ 版本号正确
   - ✓ 所有 URL 均有效，并指向官方来源
   - ✓ 未虚构函数/参数

3. **实用性检查**：
   - ✓ 实现清单具有可操作性
   - ✓ 示例完整（可以运行）
   - ✓ 注意事项与检测到的版本相关
   - ✓ 开放问题指出了确实需要做出的决策

## 需要避免的常见陷阱

❌ **不要**：
- 使用错误版本的文档
- 根据 LLM 记忆猜测或填补空白
- 复制整个文档页面（提取关键信息）
- 相信非官方博客/教程，而不是官方文档
- 不引用来源就继续进行
- 跳过版本检测步骤

✅ **应该做**：
- 始终先从项目文件中检测版本
- 为每个 API 引用来源 URL + 章节
- 仅提取简洁且相关的信息
- 如实报告置信度
- 链接到具体文档章节，而不只是首页
- 明确注明特定版本的注意事项

## 性能目标

- **总耗时**：典型库研究时间 < 2 分钟
- **准确性**：100% 的 API 必须与官方文档一致
- **引用**：100% 的声明都必须有来源
- **完整性**：覆盖实现所需信息的 95% 以上

## 使用示例

**场景**：用户说“为 product service 添加 Redis 缓存”

**Claude（使用此 skill）**：

```text
[Internal: This requires research on Redis client library]

🔍 Activating research-methodology skill

📦 Detecting Redis version from package.json... Found redis@4.6.0

🌐 Fetching official docs from redis.io...

[Follows methodology: assess → prioritize → retrieve → verify → output]

# 📋 ResearchPack: Redis Client (Node.js)

## Quick Reference
- Library: redis v4.6.0
- Official Docs: https://redis.io/docs/clients/nodejs/
- Confidence: HIGH

## Key APIs
1. `createClient(options)` - Initialize connection
   Source: redis.io/docs/clients/nodejs/v4.6#createClient

2. `client.get(key: string): Promise<string | null>` - Retrieve value
   Source: redis.io/docs/clients/nodejs/v4.6#get

[...rest of ResearchPack]

✅ Research complete - Ready for planning phase
```

---

**此 skill 确保所有实现都以当前且权威的文档为依据，而不是依赖可能已经过时的 LLM 知识。**