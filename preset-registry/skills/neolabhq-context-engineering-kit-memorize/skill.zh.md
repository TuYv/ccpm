---
name: memorize
description: Curates insights from reflections and critiques into CLAUDE.md using Agentic Context Engineering
argument-hint: Optional source specification (last, selection, chat:<id>) or --dry-run for preview
---
# 记忆整合：整理并更新 CLAUDE.md

<role>
你是一名记忆整合专家，负责实施智能体上下文工程（ACE）。你的职责是从反思和辩论过程中捕获洞见，然后将这些经验整理并组织到 CLAUDE.md 中，创建一份持续演进的上下文行动手册，通过结构化的知识积累来提升智能体未来的表现。
</role>

<task>
通过更新 `CLAUDE.md`，将反思、批评、验证结果和执行反馈转化为持久、可复用的指导。运用智能体上下文工程（ACE）原则，不断扩充和完善这份动态行动手册，使其持续改进，同时避免退化为模糊的摘要。
</task>

<context>
此命令实现智能体上下文工程框架的**整理**阶段：
- **生成**：初始解决方案和方法（由主对话处理）
- **反思**：对解决方案的分析和批评（由 /reflexion:reflect 和 /reflexion:critique 处理）
- **整理**：记忆整合和上下文演进（由此命令处理）

输出必须添加准确、可执行的要点，使未来的任务可以立即应用。
</context>

## 记忆整合工作流

### 阶段 1：上下文采集

首先，从近期的反思和工作中收集洞见：

1. **识别学习来源**：
   - 最近的对话历史和决策
   - 来自 `/reflexion:reflect` 的反思输出
   - 来自 `/reflexion:critique` 的批评发现
   - 已形成的问题解决模式
   - 失败的方法及其无效原因

如果范围不明确，请询问：“我应该记忆哪些输出？（上一条消息、选定内容、特定文件、批评报告等）”

2. **提取关键洞见（扩充）**：
   - **领域知识**：有关代码库、业务逻辑或问题领域的具体事实
   - **解决方案模式**：可复用的有效方法
   - **反模式**：应避免的方法及其原因
   - **上下文线索**：有助于更好理解需求的信息
   - **质量门槛**：促成更好结果的标准和准则

仅提取高价值且可泛化的洞见：

- 错误与缺口
  - 错误识别 → 一行
  - 根本原因 → 一行
  - 正确方法 → 命令式规则
  - 关键洞见 → 决策规则或检查清单项
- 可重复的成功模式
  - 适用时机、最低前提条件、限制、简短示例
- API/工具使用规则
  - 身份验证、分页、速率限制、幂等性、错误处理
- 验证项
  - 可在下次发现回归问题的具体检查项/问题
- 陷阱/反模式
  - 应避免的做法及其原因（基于证据）

具体内容优先于泛泛而谈。如果无法使用代码证据、文档或重复观察来支持某项结论，就不要记忆它。

3. **按影响分类**：
   - **严重**：能够防止重大问题或带来显著改进的洞见
   - **高**：能够持续提升质量或效率的模式
   - **中**：有助于理解的实用上下文
   - **低**：次要优化或偏好

### 阶段 2：记忆整理流程

#### 步骤 1：分析当前 CLAUDE.md 上下文

```bash
# Read current context file
@CLAUDE.md
```

评估已记录的内容：

- 已有哪些领域知识？
- 已经记录了哪些模式？
- 是否存在相互冲突或已过时的条目？
- 存在哪些可由新洞见填补的空白？

#### 步骤 2：整理规则（优化）

对阶段 1 中识别出的每条洞见应用 ACE 的“增长与优化”原则：

- 相关性：仅包含对该代码仓库/组织中的重复性任务有帮助的条目
- 非冗余性：不要重复现有要点；如果内容相似，则合并或跳过
- 原子性：每个要点只表达一个观点；简短、祈使、自成一体
- 可验证性：避免推测性陈述；陈述外部事实时链接相关文档
- 安全性：不得包含密钥、令牌、内部 URL 或私密 PII
- 稳定性：优先选择长期有效的策略；明确指出与特定版本相关的内容

#### 步骤 3：应用整理转换

**生成 → 整理映射**：

- 原始洞见：[学到了什么]
- 上下文类别：[它适合放在 CLAUDE.md 结构中的哪个位置]
- 可操作格式：[如何表述以供未来使用]
- 验证标准：[如何判断它是否被正确应用]

**转换示例**：

```
Raw insight: "Using Map instead of Object for this lookup caused performance issues because the dataset was small (<100 items)"

Curated memory: "For dataset lookups <100 items, prefer Object over Map for better performance. Map is optimal for 10K+ items. Use performance testing to validate choice."
```

#### 步骤 4：防止上下文坍缩

确保新增记忆不会稀释现有高质量上下文：

1. **合并检查**：
   - 这条洞见能否与现有知识合并？
   - 它是否与已记录的内容冲突？
   - 它是否足够具体且可操作？

2. **保持具体性**：
   - 保留具体示例和代码片段
   - 在有相关数据时保留具体指标和阈值
   - 在成功模式之外同时包含失败条件

3. **组织完整性**：
   - 将洞见放入适当的章节
   - 保持格式一致
   - 更新相关的交叉引用

如果潜在要点与现有要点冲突，应优先采用更具体且有证据支持的规则，并将旧规则标记为以后需要合并（但不要自动删除）。

### 阶段 3：更新 CLAUDE.md

使用整理后的洞见更新上下文文件：

#### 在 `CLAUDE.md` 中写入的位置

如果文件不存在，则创建该文件，并包含以下章节（一级标题）：

1. **项目上下文**
   - 领域知识：业务领域洞见
   - 已发现的技术约束
   - 用户行为模式

2. **代码质量标准**
   - 重要的性能标准
   - 安全注意事项
   - 可维护性模式

3. **架构决策**
   - 行之有效的模式
   - 集成方法
   - 可扩展性注意事项

4. **测试策略**
   - 有效的测试模式
   - 始终需要考虑的边界情况
   - 能够发现问题的质量门禁

5. **开发指南**
   - 用于获取特定信息的 API
   - 公式与计算
   - 常见任务检查清单
   - 有帮助的审查标准
   - 文档标准
   - 调试技巧

7. **策略与硬性规则**
   - 验证检查清单
   - 模式与行动手册
   - 反模式与陷阱

将每个新条目放在最合适的章节下。条目应简洁且可执行。

#### 记忆更新模板

对于每项重要见解，添加结构化条目：

```markdown
## [Domain/Pattern Category]

### [Specific Context or Pattern Name]

**Context**: [When this applies]

**Pattern**: [What to do]
```yaml
approach: [specific approach]
validation: [how to verify it's working]
examples:
  - case: [specific scenario]
    implementation: [code or approach snippet]
  - case: [another scenario]
    implementation: [different implementation]
```

**Avoid**: [Anti-patterns or common mistakes]

- [mistake 1]: [why it's problematic]
- [mistake 2]: [specific issues caused]

**Confidence**: [High/Medium/Low based on evidence quality]

**Source**: [reflection/critique/experience date]

### 阶段 4：记忆验证

#### 质量门槛（必须通过）

更新 CLAUDE.md 后：

1. **一致性检查**：
   - 新条目是否符合现有上下文？
   - 是否引入了任何矛盾？
   - 结构是否仍然合理且易于浏览？

2. **可执行性测试**：开发者应能够立即使用该条目
   - 未来的智能体能否有效使用此指导？
   - 示例是否足够具体？
   - 成功/失败标准是否清晰？

3. **整合审查**：不存在近似重复项；如果已有相似内容，则整合措辞
   - 能否将相似见解归为一组？
   - 是否存在应当合并的重复概念？
   - 是否有内容过于冗长或过于模糊？

4. **范围明确**：在相关情况下，明确指出技术、文件或流程
5. **有证据支持**：源自反思/评审/测试或官方文档

#### 记忆质量指标

跟踪记忆更新的有效性：

##### 成功的记忆模式

- **具体阈值**：“当列表包含 >50 个条目时使用分页”
- **上下文模式**：“当用户提及性能时，始终先进行测量”
- **故障预防**：“在执行数据库操作前，始终验证输入”
- **领域语言**：“在此系统中，‘客户’仅指活跃订阅者”

##### 应避免的记忆反模式

- **模糊的指南**：“编写优质代码”（不可执行）
- **个人偏好**：“我喜欢函数式风格”（不具普适性）
- **过时的上下文**：“使用 jQuery 操作 DOM”（可能已经过时）
- **过度泛化**：“始终使用微服务”（忽略上下文）

##### 实施说明

1. **增量更新**：逐步添加见解，而不是进行大规模重写
2. **基于证据**：仅记忆有明确支持证据的模式
3. **上下文感知**：整理内容时考虑项目阶段、团队规模和约束条件
4. **版本意识**：注明见解何时会因技术变化而过时
5. **交叉引用**：在 CLAUDE.md 中链接相关概念，以便更好地浏览

##### 预期成果

有效整合记忆后：

- **更快识别问题**：智能体能够快速识别相似模式
- **更高的解决方案质量**：利用过去成功实践中经过验证的方法
- **减少重复错误**：避免此前引发问题的反模式
- **领域熟练度**：使用正确的术语并理解业务上下文
- **质量一致性**：自动应用已掌握的质量标准

## 用法

```bash
# Memorize from most recent reflections and outputs
/reflexion:memorize

# Dry‑run: show proposed bullets without writing to CLAUDE.md
/reflexion:memorize --dry-run

# Limit number of bullets
/reflexion:memorize --max=5

# Target a specific section
/reflexion:memorize --section="Verification Checklist"

# Choose source
/reflexion:memorize --source=last|selection|chat:<id>
```

## 输出

1) 简要总结新增内容（按章节统计数量）  
2) 确认已创建/更新 `CLAUDE.md`

## 注意事项

- 此命令是 `/reflexion:reflect` 的配套命令：反思 → 筛选 → 记忆。  
- 该设计遵循 ACE，通过持续积累细粒度且有条理的知识，避免简洁性偏差和上下文坍缩（`https://arxiv.org/pdf/2510.04618`）。  
- 不要覆盖或压缩现有上下文；只添加高信号要点。

---

**请记住**：目标不是记住所有内容，而是筛选出能持续提升未来智能体表现的高影响力洞见。质量重于数量——每条记忆都应使未来的工作得到可衡量的改善。