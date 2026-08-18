---
name: pattern-recognition
description: Systematic methodology for identifying, capturing, and documenting reusable patterns from implementations. Enables automatic learning and knowledge-core.md updates. Claude invokes this after successful implementations to preserve institutional knowledge.
auto_invoke: true
tags: [patterns, learning, knowledge, documentation]
---
# 模式识别技能

此技能提供了一套系统化的方法，用于从已完成的工作中识别可复用模式，并自动更新知识核心，以便跨会话保留组织知识。

## Claude 应使用此技能的时机

Claude 将在以下情况下自动调用此技能：
- 实现成功完成（测试通过）
- @code-implementer 完成重要功能开发
- 首席架构师综合多个代理的结果
- 用户明确请求记录模式
- 停止钩子触发（会话结束）

## 核心原则（BRAHMA 宪章）

1. **知识保留** - 捕获模式以供未来使用
2. **可复现性** - 记录足够详细的信息，以便复现模式
3. **简洁性** - 提取核心模式，而非记录每个细节
4. **验证** - 模式应通过实际代码进行验证
5. **自适应学习** - 从结果中学习，以建议经过验证的模式（新增 v3.1）

## 实现之前（模式建议 - 新增 v3.1）

**触发条件**：用户通过 /workflow、/implement 或直接调用代理来请求功能实现

**目的**：主动建议经过验证的模式，利用过去成功的实现来加速当前工作

### 模式建议工作流

**步骤 1：上下文提取**（少于 5 秒）

从用户请求中提取上下文标签，以查找过去类似的实现：
- **技术关键词**："nodejs"、"python"、"redis"、"postgresql"、"express"、"fastapi"
- **问题领域**："authentication"、"caching"、"logging"、"error-handling"、"validation"
- **解决方案类型**："service-layer"、"repository"、"factory"、"middleware"、"api"

**示例**：
```
User request: "Add JWT authentication to Express API"
Extracted tags: ["nodejs", "express", "authentication", "jwt", "security"]
```

**步骤 2：模式查找**（少于 2 秒）

```markdown
Read ~/.claude/data/pattern-index.json
Find patterns with ≥60% context tag overlap (similarity matching)
Filter to HIGH confidence patterns only (confidence ≥ 0.80)
Rank by: confidence DESC, quality DESC, recency DESC
Return top 3 patterns
```

**优雅降级**：
```python
try:
    pattern_index = read_json('~/.claude/data/pattern-index.json')
    suggestions = suggest_patterns(context_tags, pattern_index)
except (FileNotFoundError, JSONDecodeError):
    logger.warning("pattern-index.json unavailable, skipping suggestions")
    suggestions = []  # Proceed without suggestions
    # User impact: ZERO (workflow continues normally)
```

**步骤 3：展示建议**（用户交互）

如果找到高置信度模式，则展示排名最高的 3 个：

```markdown
💡 Suggested patterns based on past implementations:

1. [HIGH CONFIDENCE: 92%] JWT Authentication Middleware Pattern
   - Used 8 times, 7 successes (88% success rate)
   - Average time: 12 minutes, Average quality: 89/100
   - Context match: 85% similar to your request
   - See: knowledge-core.md#jwt-authentication-middleware-pattern

2. [HIGH CONFIDENCE: 85%] Token Refresh Pattern
   - Used 5 times, 4 successes (80% success rate)
   - Average time: 15 minutes, Average quality: 85/100
   - See: knowledge-core.md#token-refresh-pattern

Use suggested pattern? (y/n/view)
```

**第 4 步：用户响应处理**

- **用户接受（y）**：记录接受情况，在实现中使用该模式
- **用户拒绝（n）**：记录拒绝情况，不使用该模式继续执行
- **用户查看（view）**：从 knowledge-core.md 中显示完整模式，再次询问
- **无响应**：不使用该模式继续执行（不要阻塞工作流）

**第 5 步：记录用户反馈**

更新 pattern-index.json 中的模式接受跟踪信息：
```json
{
  "user_acceptance_rate": (accepted_count + 1) / (total_suggestions + 1),
  "total_suggestions": total_suggestions + 1
}
```

**性能目标**：建议工作流总耗时 < 7 秒

---

## 模式识别方法

### 第 1 步：实现分析（< 30 秒）

**目标**：审查刚刚完成的实现，以识别其中的模式

**分析问题**：

1. **架构模式**：
   - 使用了什么高层结构？（Service 层、Repository、Factory 等）
   - 如何分离关注点？（业务逻辑、数据访问、表示层）
   - 应用了哪些设计模式？（Singleton、Strategy、Observer 等）

2. **集成模式**：
   - 新代码如何连接到现有代码？
   - 建立了哪些接口/契约？
   - 如何处理依赖注入？

3. **错误处理模式**：
   - 如何捕获和处理错误？
   - 添加了哪些日志记录/监控？
   - 错误如何传播给调用方？

4. **测试模式**：
   - 使用了什么测试结构？（AAA：Arrange-Act-Assert 等）
   - 如何创建 mocks/stubs？
   - 覆盖了哪些边界情况？

5. **配置模式**：
   - 如何管理特定于环境的值？
   - 默认值存放在哪里？
   - 如何验证配置？

**要提取的数据**：
- 展示该模式的文件路径
- 展示关键概念的代码片段
- 该模式应当/不应当使用的场景
- 考虑过哪些替代方案，以及为何放弃

### 第 2 步：模式分类（< 15 秒）

**归类到 knowledge-core.md 的各个章节**：

#### 第 1 节：架构原则（高层规则）
- 影响整个代码库的广泛指导原则
- 示例：“对所有外部服务使用依赖注入”
- 示例：“所有 API 路由都必须包含 auth middleware”
- 示例：“数据库查询必须通过 repository 层”

#### 第 2 节：已建立的模式（具体实现）
- 具体且可复用的实现模式
- 包含：模式名称、上下文、实现示例、文件
- 示例：“用于业务逻辑的 Service Layer Pattern”
- 示例：“用于创建 Redis 客户端的 Factory pattern”

#### 第 3 节：关键决策与经验（按时间顺序记录）
- 在特定实现过程中做出的决策
- 包含：日期、决策、理由、考虑过的替代方案
- 示例：“2025-10-17：选择 Redis 而不是 Memcached 用于缓存（原因：对数据结构的支持更好）”
- 从错误或发现中总结的经验

**分类标准**：
- **原则**：适用于多个功能/文件
- **模式**：针对特定问题的可复用模板
- **决策**：具有长期影响的一次性选择
- **经验**：发现的新洞见或易错点

### 第 3 步：模式文档编写（< 30 秒）

**针对识别出的每个模式，编写文档**：

```markdown
### Pattern: [Descriptive Name]

**Context**: [When to use this pattern]
- Use when: [Specific scenarios]
- Don't use when: [Scenarios where it doesn't fit]

**Problem**: [What problem does this solve?]

**Solution**:
[Brief description of the pattern]

**Implementation Example**:
```[language]
// Minimal code example showing pattern
// File: path/to/example.ts
```

**Files Demonstrating Pattern**:
- `path/to/file1.ts` - [What aspect it demonstrates]
- `path/to/file2.ts` - [What aspect it demonstrates]

**Related Patterns**:
- [Other patterns that work well with this]

**Trade-offs**:
- ✅ Benefits: [List]
- ⚠️ Costs: [List]

**Alternatives Considered**:
1. [Alternative 1] - Rejected because [reason]
2. [Alternative 2] - Rejected because [reason]
```

**质量标准**：
- **可操作**：其他开发者可以根据描述应用此模式
- **具体明确**：不能是模糊的泛泛而谈（“使用优质代码” → ❌）
- **已验证**：模式确实已在所引用的文件中实现
- **完整**：包括何时使用以及何时不使用

### 第 4 步：更新知识核心（< 20 秒）

**按照 `knowledge-core.md` 的结构进行更新**：

```markdown
# Knowledge Core

Last Updated: [ISO date]
Version: [increment version number]

## 1. Architectural Principles

### [New principle if identified]
[Description]

**Rationale**: [Why this principle]
**Established**: [Date]
**Applies to**: [Which parts of codebase]

---

## 2. Established Patterns

### [New pattern from Step 3]
[Full pattern documentation]

---

## 3. Key Decisions & Learnings

### [YYYY-MM-DD] [Decision Title]
**Decision**: [What was decided]
**Context**: [What prompted this decision]
**Alternatives**: [What else was considered]
**Rationale**: [Why this was chosen]
**Implementation**: See `[files]`
**Status**: [Active / Superseded by [link]]

---
```

**更新协议**：
1. 读取当前的 `knowledge-core.md`
2. 检查重复项（如果模式已经存在，则不要添加）
3. 将新模式追加到适当的章节
4. 递增版本号
5. 更新“Last Updated”时间戳
6. 写入更新后的文件

**合并策略**（如果模式已部分存在）：
- 使用新的示例/文件完善现有模式
- 注明该模式在最新实现中得到“reinforced”
- 不要创建重复条目

### 第 5 步：捕获结果指标（< 10 秒）- 新增 v3.1

**目的**：跟踪实现结果，用于模式学习和置信度评分

**需要捕获的指标**：

1. **成功/失败分类**：
   ```python
   success = (
       all_tests_passing AND
       quality_gates_passed AND
       no_rollback_required
   )
   ```

2. **实现时长**：
   ```python
   duration_minutes = (end_time - start_time).total_seconds() / 60
   # Start time: When @code-implementer begins
   # End time: When tests pass and implementation complete
   ```

3. **质量分数**（如果可从 /workflow 获取）：
   ```python
   quality_score = (research_pack_score + implementation_plan_score) / 2
   # Only available if full workflow used (research + plan phases)
   ```

4. **自我纠正次数**：
   ```python
   retry_count = number_of_self_correction_attempts
   # Reported by @code-implementer (0-3 range, lower is better)
   ```

5. **用户接受度**（如果建议了模式）：
   ```python
   pattern_was_accepted = user_selected_yes_to_suggestion
   ```

**数据结构**：
```python
outcome_metrics = {
    "success": True,  # or False
    "duration_minutes": 12.5,
    "quality_score": 87,  # or None if not available
    "retry_count": 1,
    "pattern_used": "JWT Authentication Middleware Pattern",  # or None
    "pattern_was_suggested": True,
    "pattern_was_accepted": True,
    "timestamp": "2025-10-25T14:30:00Z"
}
```

**采集流程**：
1. 在实现结束时从 @code-implementer 收集指标
2. 根据测试和质量门禁对成功/失败进行分类
3. 根据时间戳计算持续时间
4. 从研究/计划阶段获取质量评分（如果可用）
5. 打包到 outcome_metrics 结构中
6. 传递给 pattern-index.json 更新步骤

---

### 步骤 6：pattern-index.json 更新（< 15 秒）- v3.1 新增

**目的**：更新模式指标，以支持自适应学习和未来建议

**更新工作流**：

**1. 读取当前的 pattern-index.json**：
```python
try:
    pattern_index = read_json('~/.claude/data/pattern-index.json')
except (FileNotFoundError, JSONDecodeError):
    logger.warning("pattern-index.json missing/corrupted, skipping metrics update")
    return  # Continue with knowledge-core.md update only (graceful degradation)
```

**2. 查找或创建模式条目**：
```python
pattern_name = "JWT Authentication Middleware Pattern"  # From pattern recognition

if pattern_name not in pattern_index['patterns']:
    # Create new pattern entry with conservative defaults
    pattern_index['patterns'][pattern_name] = {
        "pattern_id": generate_kebab_case_id(pattern_name),
        "total_uses": 0,
        "successes": 0,
        "failures": 0,
        "avg_time_minutes": 0,
        "avg_quality_score": 0,
        "quality_scores": [],
        "last_used": today_iso(),
        "first_used": today_iso(),
        "confidence": 0.5,  # Start conservative (MEDIUM)
        "confidence_level": "MEDIUM",
        "context_tags": extract_tags_from_pattern(),
        "related_patterns": [],
        "anti_pattern": False,
        "deprecation_warning": None,
        "user_acceptance_rate": 0.0,
        "self_correction_avg": 0.0
    }
```

**3. 更新指标**：
```python
pattern = pattern_index['patterns'][pattern_name]

# Increment usage
pattern['total_uses'] += 1

# Update success/failure counts
if outcome_metrics['success']:
    pattern['successes'] += 1
else:
    pattern['failures'] += 1

# Update time metrics (running average)
if outcome_metrics['duration_minutes'] > 0:
    old_avg = pattern['avg_time_minutes']
    old_count = pattern['total_uses'] - 1
    pattern['avg_time_minutes'] = round(
        (old_avg * old_count + outcome_metrics['duration_minutes']) / pattern['total_uses'],
        2
    )

# Update quality scores (keep last 10 to prevent bloat)
if outcome_metrics['quality_score'] is not None:
    pattern['quality_scores'].append(outcome_metrics['quality_score'])
    pattern['quality_scores'] = pattern['quality_scores'][-10:]  # Keep last 10 only
    pattern['avg_quality_score'] = round(
        sum(pattern['quality_scores']) / len(pattern['quality_scores']),
        2
    )

# Update timestamps
pattern['last_used'] = today_iso()

# Update user acceptance rate (if pattern was suggested)
if outcome_metrics.get('pattern_was_suggested'):
    old_rate = pattern['user_acceptance_rate']
    old_suggestions = pattern.get('total_suggestions', 0)
    new_suggestions = old_suggestions + 1
    accepted = 1 if outcome_metrics.get('pattern_was_accepted') else 0
    pattern['user_acceptance_rate'] = round(
        (old_rate * old_suggestions + accepted) / new_suggestions,
        2
    )
    pattern['total_suggestions'] = new_suggestions

# Update self-correction average
old_avg_retries = pattern['self_correction_avg']
pattern['self_correction_avg'] = round(
    (old_avg_retries * (pattern['total_uses'] - 1) + outcome_metrics['retry_count']) / pattern['total_uses'],
    2
)
```

**4. 重新计算置信度**（使用下方步骤 7 中的算法）：
```python
pattern['confidence'] = calculate_confidence(pattern)
pattern['confidence_level'] = classify_confidence_level(pattern['confidence'])
```

**5. 检查反模式状态**：
```python
# If pattern failed 3+ times consecutively with no successes, mark as anti-pattern
if pattern['failures'] >= 3 and pattern['successes'] == 0:
    pattern['anti_pattern'] = True
    pattern['deprecation_warning'] = "This pattern has failed repeatedly. Consider alternatives."

# If pattern rejected 3+ times, reduce confidence
if pattern.get('total_suggestions', 0) >= 3 and pattern['user_acceptance_rate'] < 0.30:
    pattern['confidence'] *= 0.8  # Reduce by 20%
    pattern['deprecation_warning'] = "This pattern has been rejected frequently."
```

**6. 写入更新后的 JSON**：
```python
# Update metadata
pattern_index['metadata']['total_implementations'] += 1
pattern_index['metadata']['last_updated'] = today_iso()

# Recalculate overall success rate
total_successes = sum(p['successes'] for p in pattern_index['patterns'].values())
total_uses = sum(p['total_uses'] for p in pattern_index['patterns'].values())
pattern_index['metadata']['overall_success_rate'] = round(
    total_successes / total_uses if total_uses > 0 else 0.0,
    2
)

# Write updated JSON
write_json('~/.claude/data/pattern-index.json', pattern_index)

# Validate JSON is still valid
verify_json_valid('~/.claude/data/pattern-index.json')
```

**性能目标**：完整指标更新耗时 < 15 秒

---

### 步骤 7：验证（< 10 秒）

**在最终确定更新之前**：

✓ **完整性检查**：
- 模式具有名称、上下文、问题和解决方案
- 至少提供 1 个文件引用
- 已记录权衡

✓ **准确性检查**：
- 引用的文件确实存在
- 代码片段是真实代码（不是凭空编造的）
- 模式已在列出的文件中得到展示

✓ **唯一性检查**：
- 模式不是现有模式的重复项
- 或者，如果相似，则说明了差异/增强之处

✓ **有用性检查**：
- 模式可复用（不是仅针对此功能的一次性方案）
- 模式解决的是会反复出现的问题
- 模式足够清晰，便于未来使用

**如果任何检查失败**：在更新 knowledge-core.md 之前修复问题

## 通过 Hooks 实现自动化

**Stop Hook 集成**：

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "command": "update-knowledge-core.sh",
        "description": "Automatically capture patterns from session"
      }
    ]
  }
}
```

**Hook 脚本**（`.claude/hooks/update-knowledge-core.sh`）：
```bash
#!/bin/bash
# Triggered at end of session to update knowledge core

# Check if any implementations occurred this session
if [ -f ".claude/session-summary.json" ]; then
    # Extract patterns from session
    # Call Claude with pattern-recognition skill
    # Update knowledge-core.md
    echo "🧠 Updating knowledge core with session learnings..."
fi
```

## 模式类别

### 要识别的常见模式

**1. 服务层模式**：
```typescript
// Business logic separated into services
class ProductService {
  constructor(private repo: ProductRepository) {}

  async getProduct(id: string) {
    // Business logic here
    return this.repo.findById(id);
  }
}
```

**2. 仓储模式**：
```typescript
// Data access abstracted
interface ProductRepository {
  findById(id: string): Promise<Product>;
  save(product: Product): Promise<void>;
}
```

**3. 工厂模式**：
```typescript
// Complex object creation encapsulated
class CacheFactory {
  static createClient(config: CacheConfig): CacheClient {
    // Creation logic
  }
}
```

**4. 中间件模式**：
```typescript
// Request processing pipeline
app.use(authMiddleware);
app.use(loggingMiddleware);
app.use(errorHandlingMiddleware);
```

**5. 配置模式**：
```typescript
// Environment-specific config
const config = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  }
};
```

**6. 错误处理模式**：
```typescript
// Consistent error handling
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', { error, context });
  throw new ApplicationError('User-friendly message', { cause: error });
}
```

### 需要记录的反模式

**同时记录哪些做法不可取**：

```markdown
### Anti-Pattern: Direct Database Access in Controllers

**Problem**: Controller directly queries database

**Why It's Bad**:
- Violates separation of concerns
- Hard to test
- Business logic mixed with HTTP handling

**Instead Use**: Repository pattern (see Section 2)

**Files that demonstrate BAD approach** (for reference):
- ❌ `old-code/legacy-controller.ts` (before refactor)

**Files that demonstrate GOOD approach**:
- ✅ `src/controllers/ProductController.ts` (uses ProductService)
```

## 知识核心维护

**定期审查**（建议每月进行）：
1. 检查已记录的模式是否仍然适用
2. 将已弃用的模式标记为“由 [新模式] 取代”
3. 如果发现相似模式，则进行合并
4. 如果文件路径发生变化，则更新示例

**版本控制**：
- `knowledge-core.md` 应纳入 git
- 持续跟踪变更
- 在发生重大架构变更时标记版本

## 性能目标

- **模式识别**：< 30 秒
- **文档编写**：每个模式 < 30 秒
- **知识核心更新**：< 20 秒
- **总耗时**：每次完成的实现 < 90 秒

## 使用示例

**场景**：`@code-implementer` 刚刚完成 Redis 缓存实现

**Claude（使用此技能）**：

```
[Internal: Implementation complete, capture patterns]

🧠 Activating pattern-recognition skill

🔍 Analyzing implementation for patterns...

Identified patterns:
1. Service Layer Pattern (CacheService wraps Redis client)
2. Factory Pattern (createRedisClient() encapsulates connection)
3. Configuration Pattern (TTL and host via env vars)
4. Error Handling Pattern (try-catch with logging + fallback)

📝 Documenting patterns...

[Creates detailed pattern documentation for each]

📚 Updating knowledge-core.md...

Added to Section 2 (Established Patterns):
- Pattern: Redis Client Factory
- Pattern: Cache Service Layer
- Pattern: Environment-Based TTL Configuration

Added to Section 3 (Key Decisions):
- 2025-10-17: Chose Redis client v4.6.0 (promise-based over callback)
- 2025-10-17: TTL configured per-environment (dev: 60s, prod: 300s)

✅ Knowledge core updated (version 1.3 → 1.4)

New patterns available for future implementations!
```

---

## 置信度计算算法（新版 v3.1）

### 带时间衰减的贝叶斯置信度

**目的**：基于成功率、时效性和证据质量计算模式可靠性

**公式**：
```
confidence = base_confidence × time_decay_factor × evidence_factor
```

**组成部分**：

**1. 基础置信度**（成功率）：
```python
base_confidence = successes / total_uses
# Range: 0.0 to 1.0
# Example: 7 successes / 10 uses = 0.70
```

**2. 时间衰减因子**（时效性惩罚）：
```python
days_since_use = (today - last_used).days

if days_since_use > 180:  # 6+ months
    time_decay_factor = 0.5  # Reduce confidence by 50%
elif days_since_use > 90:  # 3-6 months
    time_decay_factor = 0.75  # Reduce confidence by 25%
else:  # < 3 months
    time_decay_factor = 1.0  # No reduction
```

**理由**：模式会逐渐过时（库会更新，最佳实践会变化）

**3. 证据因子**（样本量要求）：
```python
if total_uses < 3:
    evidence_factor = 0.5  # Low confidence, need more data
elif total_uses < 5:
    evidence_factor = 0.75  # Moderate confidence
else:  # 5+ uses
    evidence_factor = 1.0  # High confidence, sufficient evidence
```

**理由**：在信任模式之前要求最低限度的证据（避免因仅使用 1-2 次而产生虚假置信度）

### 置信度等级分类

```python
if confidence >= 0.80:
    level = "HIGH"  # Auto-suggest prominently
elif confidence >= 0.50:
    level = "MEDIUM"  # Suggest with caveat
else:
    level = "LOW"  # Don't suggest, review pattern
```

**阈值理由**：
- **80%**：高置信度确保建议准确率达到 80% 以上
- **50%**：中等置信度的模式可能有效，但需要审核
- **<50%**：低置信度的模式需要更多证据或停用

### 计算示例

**案例 1：经过验证且近期使用的模式**（理想情况）
```
Success rate: 8/10 = 0.80
Last used: 20 days ago → decay = 1.0
Total uses: 10 → evidence = 1.0
Confidence: 0.80 × 1.0 × 1.0 = 0.80 (HIGH)
```

**案例 2：未经验证的模式**（证据不足）
```
Success rate: 2/2 = 1.00
Last used: 5 days ago → decay = 1.0
Total uses: 2 → evidence = 0.5
Confidence: 1.00 × 1.0 × 0.5 = 0.50 (MEDIUM)
```

**案例 3：过时的模式**（旧且未使用）
```
Success rate: 5/5 = 1.00
Last used: 200 days ago → decay = 0.5
Total uses: 5 → evidence = 1.0
Confidence: 1.00 × 0.5 × 1.0 = 0.50 (MEDIUM)
```

**案例 4：失败的模式**（成功率较低）
```
Success rate: 1/5 = 0.20
Last used: 10 days ago → decay = 1.0
Total uses: 5 → evidence = 1.0
Confidence: 0.20 × 1.0 × 1.0 = 0.20 (LOW)
```

### 实现参考

**脚本**：`~/.claude/scripts/calculate-confidence.sh`

该算法使用 bash 实现，用于独立计算和测试。pattern-recognition skill 在更新 pattern-index.json 时使用相同的计算方式。

---

**该 skill 确保机构知识能够被自动捕获，并且能够从结果中学习，以主动建议经过验证的模式，从而使未来的实现速度提升 30-40%。**