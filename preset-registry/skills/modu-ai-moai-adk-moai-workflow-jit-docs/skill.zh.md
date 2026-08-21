---
name: moai-workflow-jit-docs
description: >
  Enhanced Just-In-Time document loading system that discovers, loads,
  and caches relevant documentation based on user intent and project
  context. Use when users need specific documentation on demand.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Grep, Glob, WebFetch, WebSearch, mcp__context7__resolve-library-id, mcp__context7__get-library-docs
user-invocable: false
metadata:
  version: "3.0.0"
  category: "workflow"
  status: "active"
  updated: "2026-01-08"
  modularized: "false"
  tags: "workflow, documentation, jit-loading, context-aware, caching, discovery"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000

# MoAI Extension: Triggers
triggers:
  keywords: ["documentation", "docs", "API reference", "how to", "implement", "best practices", "technology guide", "framework documentation"]
  phases: ["plan", "run", "sync"]
  agents: ["manager-docs", "manager-spec", "expert-backend", "expert-frontend"]
---
## 快速参考（30 秒）

目的：根据用户意图和上下文按需加载相关文档。

主要工具：

- WebSearch：在线查找最新文档和资源
- WebFetch：获取特定文档页面
- Context7 MCP：访问官方库文档（如果可用）
- Read、Grep、Glob：搜索本地项目文档

触发模式：

- 用户提出具体的技术问题
- 在对话中检测到技术关键词
- 完成任务需要领域专业知识
- 需要实现指导

## 实施指南

### 意图检测

系统通过以下几种模式识别文档需求：

基于问题的触发条件：

- 当用户询问具体的实现问题时（例如，“如何实现 JWT 身份验证？”）
- 当用户寻求最佳实践或优化指导时
- 当出现故障排除问题时

特定技术触发条件：

- 检测到框架名称：FastAPI、React、PostgreSQL、Docker、Kubernetes
- 检测到库名称：pytest、TypeScript、GraphQL、Redis
- 检测到工具名称：npm、pip、cargo、maven

特定领域触发条件：

- 身份验证和授权主题
- 数据库和数据建模讨论
- 性能优化咨询
- 安全相关问题

基于模式的触发条件：

- 实现请求：“实现”、“创建”、“构建”
- 架构讨论：“设计”、“结构”、“模式”
- 故障排除：“调试”、“修复”、“错误”、“无法运行”

### 文档来源

系统按照以下优先级顺序从多个来源获取文档：

本地项目文档（最高优先级）：

- 检查 .moai/docs/ 中的项目特定文档
- 检查 .moai/specs/ 中的需求和规范
- 检查 README.md 以了解项目概况
- 检查 docs/ 目录中的综合文档

官方文档来源：

- 使用 WebFetch 获取官方框架文档
- 如果可用，使用 Context7 MCP 工具获取库文档
- 访问特定技术的官方网站

社区资源：

- 使用 WebSearch 查找高质量教程
- 搜索高票数的 Stack Overflow 解决方案
- 查找针对特定问题的 GitHub 讨论

实时 Web 调研：

- 使用 WebSearch 并指定当前年份，以获取最新信息
- 搜索近期的最佳实践和更新
- 查找新功能和弃用通知

### 加载策略

意图分析流程：

- 识别用户请求中提及的技术
- 确定与问题相关的领域
- 对问题类型进行分类（实现、故障排除、概念）
- 评估复杂度，以确定所需的文档深度

来源优先级：

- 如果存在本地文档：首先加载项目特定文档
- 如果有官方文档：获取权威来源
- 如果需要实现示例：搜索社区资源
- 如果需要最新信息：执行 Web 调研

上下文感知缓存：

- 在会话期间缓存检索到的文档
- 根据当前对话上下文保持相关性
- 当上下文发生变化时移除过时内容
- 优先处理经常访问的文档

### 质量评估

内容质量评估：

- 权威性：官方来源具有最高可信度
- 时效性：对于快速发展的技术，优先选择 12 个月内的内容
- 完整性：包含示例的文档排名更高
- 相关性：内容与用户意图之间的匹配程度

相关性排名：

- 计算文档内容与用户问题之间的匹配度
- 按权威性（30%）、时效性（25%）、完整性（25%）、相关性（20%）进行加权
- 优先返回得分最高的文档
- 标明所检索信息的置信度

### 实用工作流

身份验证实现工作流：

- 当用户询问身份验证时：检测所用技术（例如 FastAPI、JWT）
- 确定领域：身份验证、安全
- 通过 WebFetch 加载 FastAPI 安全文档
- 通过 WebSearch 搜索 JWT 最佳实践
- 提供全面的指导并注明来源

数据库优化工作流：

- 当用户询问查询性能时：检测数据库技术
- 确定领域：性能、优化
- 加载官方数据库文档
- 搜索优化指南和教程
- 提供可执行的建议并注明来源

新技术采用工作流：

- 当用户引入不熟悉的技术时：检测技术名称
- 加载官方入门文档
- 在适用时搜索迁移指南
- 查找与现有技术栈的集成模式
- 提供战略性的采用指导

### 错误处理

网络故障：

- 如果网络搜索失败：回退到缓存内容
- 如果 WebFetch 失败：使用可用的本地文档
- 当部分来源无法访问时，注明结果不完整

内容质量问题：

- 如果检索到的内容似乎已过时：搜索更新的来源
- 如果相关性不明确：请求用户澄清
- 如果发现相互冲突的信息：提供多个来源及其日期

相关性不匹配：

- 如果初始搜索结果不佳：优化搜索查询
- 如果用户上下文不明确：在加载前请求澄清
- 如果存在文档缺失：说明相关限制

### 性能优化

缓存策略：

- 为经常访问的文档维护会话级缓存
- 在内存中保留项目特定的文档
- 根据访问时间淘汰陈旧内容

高效加载：

- 仅在明确需要时加载文档
- 避免预加载所有可能用到的文档
- 使用有针对性的搜索，而不是宽泛的查询

批量处理：

- 尽可能合并相关搜索
- 按技术对文档请求进行分组
- 在适当时并行处理多个来源

## 高级模式

多来源聚合：

- 将官方文档与社区示例相结合
- 交叉核对多个权威来源
- 综合多种材料，形成全面的回答

上下文持久化：

- 记住对话中先前加载的文档
- 避免重复加载相同的文档
- 在整个会话中积累知识

主动加载：

- 根据对话流程预判文档需求
- 讨论复杂功能时预先加载相关主题
- 在用户提出请求之前推荐相关文档

---

## 配合使用效果良好

智能体：

- workflow-docs：文档生成
- core-planner：文档规划
- workflow-spec：SPEC 文档

技能：

- moai-docs-generation：文档生成
- moai-workflow-docs：文档验证
- moai-library-nextra：Nextra 文档

命令：

- /moai:3-sync：文档同步
- /moai:9-feedback：文档改进

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “我已经知道文档在哪里了，不需要 JIT 加载” | JIT 文档能够发现你不知道其存在的上下文。手动查找会遗漏交叉引用。 |
| “预先加载所有文档比按需加载更简单” | 预先加载会将 token 浪费在无关内容上。JIT 只加载与当前意图匹配的内容。 |
| “缓存版本已经足够新了” | 过期缓存会给出过时的答案。使用缓存文档前应验证缓存的新鲜度。 |
| “此任务不需要文档” | 每个非简单任务都能从上下文中获益。JIT 文档会主动呈现相关约束。 |
| “我会通过浏览目录找到正确的文档” | 目录浏览的复杂度为 O(n)。对用户而言，基于意图关键词的 JIT 匹配复杂度为 O(1)。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 智能体在未加载任何项目文档的情况下开始实施
- 当源文件的修改时间更新时，仍提供缓存文档
- 已加载文档，但实施理由中未引用这些文档
- 同一会话中多次重复加载文档（重复内容未命中缓存）
- 对于明显映射到现有文档的关键词，JIT 加载器返回零条结果

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 对于非简单任务，至少通过 JIT 匹配加载了一份文档
- [ ] 在智能体的推理或输出中引用了已加载的文档
- [ ] 对照源文件的修改时间验证了缓存命中
- [ ] 同一会话中没有重复加载文档（检查加载日志）
- [ ] JIT 触发关键词与用户所述意图相匹配

<!-- moai:evolvable-end -->