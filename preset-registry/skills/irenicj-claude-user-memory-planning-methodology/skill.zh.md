---
name: planning-methodology
description: Systematic approach for creating minimal-change, reversible implementation plans. Claude invokes this skill when transforming requirements/research into executable blueprints. Emphasizes simplicity, safety, and clear verification steps.
auto_invoke: true
tags: [planning, architecture, minimal-change, reversibility]
---
# 规划方法论技能

该技能提供了一套系统化的方法论，用于创建精准、可逆、低风险且清晰度最高的实施计划。

## Claude 应使用此技能的时机

Claude 会在以下情况下自动调用此技能：
- ResearchPack 已准备就绪，需要制定实施计划
- 用户询问“我们应该如何实现……”“创建一个……的计划”
- 复杂功能需要采用结构化方法
- 需要将需求拆解为可执行步骤
- 将研究结果转化为可执行蓝图

## 核心原则（BRAHMA 宪章）

1. **简单优于复杂**（KISS、YAGNI）
2. **仅进行最小变更** - 尽可能少地修改文件
3. **必须具备可逆性** - 每项变更都必须可以撤销
4. **逐步验证** - 为每一步设定明确的成功标准

## 规划方法论协议

### 步骤 1：代码库探索（< 90 秒）

**目标**：在规划变更之前了解现有结构

**操作**：

1. **结构扫描**（使用 Glob 工具）：
   ```
   Search patterns:
   - Source files: src/**/*.{ext}
   - Config files: *.config.{ext}, .{ext}rc
   - Test files: **/*.test.{ext}, **/*.spec.{ext}
   - Documentation: docs/*.md, README.md
   ```

2. **模式识别**（使用 Grep + Read）：
   - 当前如何实现类似功能
   - 命名约定（文件名、函数名）
   - 代码风格（缩进、格式化）
   - 导入/导出模式
   - 测试模式和框架

3. **集成点识别**：
   - 新代码应在哪里连接到现有代码？
   - 哪些配置文件需要更新？
   - 入口点在哪里（main.ts、index.js 等）？
   - 是否采用依赖注入模式？

4. **约束发现**：
   - 现有依赖会限制哪些选择
   - 必须遵循哪些框架约定
   - 必须保持哪些安全性/身份验证模式
   - 需要满足哪些性能 SLA

**输出**：
```
Codebase Profile:
- Primary language: [TypeScript/Python/Go/etc.]
- Framework: [Next.js/Django/Gin/etc.]
- Structure: [src/ organization pattern]
- Test framework: [Jest/pytest/etc.]
- Key patterns: [Dependency injection / Factory / etc.]
- Integration points: [config.ts, app.ts, etc.]
```

**防止停滞**：最多 90 秒 - 如果代码库规模较大，则只关注与功能相关的区域

### 步骤 2：最小变更分析（< 60 秒）

**目标**：确定能够实现目标的最小变更集合

**需要回答的问题**：

1. **新增还是修改**：
   - 可以扩展现有代码（更佳），还是必须修改现有代码？
   - 新功能是否可以放在新文件中（优先考虑）？
   - 新代码与现有代码之间最小的接口是什么？

2. **复用还是重建**：
   - 哪些现有工具/服务可以复用？
   - 可以参考哪些类似功能的实现模式？
   - 哪些部分必须从头构建（尽量减少）？

3. **范围边界**：
   - 要使功能正常运行，绝对最低限度需要做什么？
   - 哪些属于“锦上添花”，可以推迟？
   - 哪些边界情况必须处理，哪些可以作为限制记录？

4. **可逆性**：
   - 每项更改有多容易撤销？
   - 我们是否正在修改核心/关键文件（风险更高）？
   - 我们能否使用功能开关进行渐进式发布？

**输出**：
```
Minimal Change Strategy:
- New files: [N] (primary work here)
- Modified files: [N] (minimal edits)
- Deleted files: 0 (avoid deletions, use deprecation)
- Core files touched: [N] (minimize this)
- Reversibility: [Git revert / Config toggle / Feature flag]
```

**原则**：
- 优先扩展，而不是修改
- 优先新建文件，而不是编辑现有文件
- 优先使用配置，而不是代码
- 优先使用组合，而不是继承

### 第 3 步：风险评估（< 30 秒）

**目标**：识别可能出错的地方并规划缓解措施

**风险类别**：

1. **破坏性更改**：
   - 这会影响现有功能吗？
   - 我们是否正在修改共享/核心模块？
   - 这可能会破坏其他功能吗？

2. **性能风险**：
   - 这会增加关键路径的延迟吗？
   - 会对现有操作产生怎样的内存/CPU 影响？
   - 会导致数据库查询性能下降吗？

3. **安全风险**：
   - 这会处理用户输入吗（验证并清理）？
   - 凭据/密钥是否得到了妥善管理？
   - 这可能会引入注入漏洞吗？

4. **集成风险**：
   - 是否依赖外部服务（如果服务不可用会怎样）？
   - 是否存在 API 版本不匹配？
   - 是否存在竞态条件或并发问题？

5. **测试缺口**：
   - 哪些内容难以进行单元测试（应改用集成测试）？
   - 我们可能会遗漏哪些场景？
   - 如果测试未能捕获问题，备用方案是什么？

**针对每项已识别的风险**：
```
Risk: [Description]
Probability: [High/Medium/Low]
Impact: [High/Medium/Low]
Mitigation: [How to prevent]
Detection: [How we'll know if it happens]
Contingency: [What we'll do if it happens]
```

**反模式**：不要只识别风险而不提供缓解措施——每项风险都必须有应对方案

### 第 4 步：实施顺序（< 30 秒）

**目标**：以安全且清晰的方式安排工作顺序

**排序原则**：

1. **先处理依赖**：先构建基础，再构建依赖于基础的功能
2. **同步编写测试**：在实现功能的同时编写测试（或提前编写——TDD）
3. **渐进式集成**：逐步接入现有系统
4. **设置验证检查点**：每一步都应有明确的通过/失败标准

**步骤结构**：
```
Step N: [Action verb] [What]
- Task: [Detailed description]
- Files: [Which files to change]
- Code: [Specific code examples]
- Verification: [How to confirm success]
- Time estimate: [X minutes]
```

**验证方法**：
- 单元测试通过：`npm test path/to/test`
- 构建成功：`npm run build`
- 手动检查：“导航到 X 并确认 Y 可见”
- 集成测试：`npm run test:integration`
- 性能检查：`npm run benchmark`（如适用）

**预计总时间**：所有步骤预计时间之和 + 20% 缓冲时间

### 第 5 步：回滚规划（< 20 秒）

**目标**：确保每项更改都可以安全撤销

**回滚机制**（按优先级排序）：

1. **Git revert**（最简单）：
   ```bash
   git reset --hard [checkpoint-commit]
   ```
   适用场景：所有更改都在一个提交中，且没有数据库迁移

2. **Feature flag toggle**（逐步发布）：
   ```javascript
   if (featureFlags.newFeature === true) {
     // new code
   } else {
     // old code
   }
   ```
   适用场景：希望在生产环境中进行测试，需要快速回滚

3. **Configuration rollback**：
   恢复之前的配置文件
   适用场景：更改主要由配置驱动

4. **Partial rollback**：
   保留正常工作的部分，回滚出现问题的部分
   适用场景：存在多个相互独立的更改，且其中一部分可以正常工作

**Rollback plan must include**：
- 要执行的准确命令
- 回滚后的验证步骤
- 数据迁移回滚（如果进行了数据库更改）
- 缓存失效处理（如果涉及缓存）

**Rollback triggers**（何时执行回滚）：
- 测试在生产环境中失败
- 性能下降超过 [threshold]%
- 错误率增加超过 [threshold]%
- 关键功能失效

### Step 6: Plan Documentation（< 30 秒）

**Objective**：将上述所有发现整理成清晰、可执行的计划

**Implementation Plan Format**：

```markdown
# 🗺️ Implementation Plan: [Feature Name]

## Summary
[2-3 lines: what + why + approach]

## 📁 File Changes
[New: N, Modified: N, with specific purposes]

## 🔢 Implementation Steps
[Numbered steps with verification]

## 🧪 Test Plan
[Unit + integration + manual tests]

## ⚠️ Risks & Mitigations
[Each risk with mitigation and contingency]

## 🔄 Rollback Plan
[Exact rollback procedure]

## ✅ Success Criteria
[Clear definition of "done"]
```

**Checklist before delivering**：
- ✓ 每项文件更改都有明确用途
- ✓ 每个步骤都有验证方法
- ✓ 所有风险都有缓解措施
- ✓ 回滚计划完整并经过测试（如可行）
- ✓ 成功标准可衡量
- ✓ 时间估算切合实际

## Quality Standards

### Completeness
- **File changes**：尽可能指定确切文件以及具体到行级别的更改
- **Steps**：每个步骤都是原子的（可以独立执行和验证）
- **Tests**：涵盖正常路径 + 至少 2 个边界情况 + 1 个错误情况
- **Risks**：识别所有主要风险（破坏性更改、性能、安全性）

### Clarity
- **Actionable**：开发者无需进一步提问即可执行
- **Verifiable**：每个步骤都有客观的通过/失败标准
- **Unambiguous**：不得使用“可能”或“也许”——只能给出具体指令

### Safety
- **Reversible**：每项更改都可以撤销
- **Incremental**：更改逐步累积（而非一次性完成）
- **Validated**：测试在每个步骤中验证正确性
- **Isolated**：某个步骤失败不会破坏整个系统

## Common Pitfalls to Avoid

❌ **Don't**：
- 同时规划对许多文件的修改（难以验证）
- 跳过风险评估（“听天由命”）
- 忘记回滚计划
- 制定要求完美执行的计划（应为错误留出余地）
- 过度工程化（“以后可能需要这个”）
- 低估时间（计划应当切合实际）

✅ **应该做**：
- 尽可能少地修改文件（将影响范围降至最低）
- 明确识别风险，并显式规划缓解措施
- 始终包含回滚流程
- 在每个步骤设置验证检查点
- 遵循 YAGNI（You Aren't Gonna Need It）原则——只实现当前所需的内容
- 为意外问题预留 20% 的时间缓冲

## 与 knowledge-core.md 集成

**规划前**：
读取 `knowledge-core.md`，检查以下内容：
- 过往项目中确立的架构模式
- 可能约束当前工作的决策
- 此代码库中已知的易错点

**规划后**：
如果计划确立了新的模式，请记录下来，以便更新 knowledge-core：
```
New Pattern Established:
- Pattern: [Name/description]
- Context: [When to use this]
- Example: [Which files demonstrate this]
```

## 性能目标

- **规划总用时**：典型功能少于 3 分钟
- **计划准确率**：正确识别的文件达到 95% 以上
- **风险覆盖率**：识别出 100% 的主要风险
- **时间估算**：与实际实现时间的偏差在 30% 以内

## 使用示例

**场景**：ResearchPack 已准备好使用 Redis 缓存，需要制定实现计划

**Claude（使用此 skill）**：

```
[Internal: Need to plan Redis integration systematically]

📐 Activating planning-methodology skill

🔎 Analyzing codebase structure...
[Follows methodology: discover → analyze → assess → sequence → rollback → document]

# 🗺️ Implementation Plan: Redis Caching

## Summary
Add Redis-based caching layer to ProductService to reduce database load.
Approach: Create separate CacheService wrapper, inject into ProductService,
maintain backward compatibility via optional usage.

## 📁 File Changes (5 files)

### New Files (2)
1. `src/services/CacheService.ts` (~80 lines)
   - Purpose: Redis client wrapper with get/set/del/ttl operations
   - Exports: CacheService class
   - Dependencies: redis@4.6.0, config

[...rest of detailed plan following format]

✅ Plan ready for implementation
```

---

**此 skill 可确保计划安全、简洁、清晰且可执行，为 @code-implementer 的成功实施做好准备。**