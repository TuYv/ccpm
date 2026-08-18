---
name: quality-validation
description: Systematic validation methodology for ResearchPacks and Implementation Plans. Provides scoring rubrics and quality gates to ensure outputs meet standards before proceeding to next phase. Prevents garbage-in-garbage-out scenarios.
auto_invoke: true
tags: [validation, quality, verification, gates]
---
# 质量验证 Skill

此 Skill 提供系统化的验证方法，用于确保 ResearchPacks 和 Implementation Plans 在进入实施阶段之前符合质量标准。

## Claude 应使用此 Skill 的时机

Claude 将在以下情况下自动调用此 Skill：
- ResearchPack 完成，需要在规划之前进行验证
- Implementation Plan 完成，需要在编码之前进行验证
- 用户明确请求质量检查（“验证这个”“这完整吗？”）
- 即将进入下一个工作流阶段（触发质量门禁）

## 核心原则（BRAHMA Constitution）

1. **验证优先于推测** - 使用客观标准进行验证
2. **质量门禁** - 不要继续处理质量不佳的输入
3. **可复现性** - 相同的输入质量 = 相同的评分
4. **明确缺陷** - 列出具体问题，而不是模糊地说“可以更好”

## 验证目标

### 研究类型检测

评分之前，先检测研究类型，以应用适当的评分标准：

#### 类型 1：API/Library Research
**指标**：
- 包含 API 端点、函数签名、方法调用
- 包含使用特定库导入语句的代码示例
- 包含外部依赖的配置/设置步骤
- 包含库/框架的版本号

**评分**：使用 API Research Rubric（80 分及以上通过）

#### 类型 2：Philosophy Research
**指标**：
- 包含主题、原则、模式、方法论
- 按主题组织内容（Theme 1、Theme 2 等）
- 跨来源综合分析
- 工程理念或最佳实践分析
- 从多个来源中提取模式

**评分**：使用 Philosophy Research Rubric（70 分及以上通过）

**示例**：工程理念、架构模式、最佳实践、方法论研究

#### 类型 3：Pattern Research
**指标**：
- 包含代码模式、设计模式、反模式
- 架构决策和权衡
- 实施策略
- 性能优化模式

**评分**：使用 Pattern Research Rubric（70 分及以上通过）

**为何采用不同的阈值？**
- API 研究更加客观（API 是否存在、版本是否正确）
- Philosophy 研究更具主观性（主题组织、综合分析质量）
- 即使不如 API 文档那样“完整”，Philosophy 研究仍能提供战略价值

### 1. ResearchPack 验证 - API/Library 类型

**目的**：确保研究在规划之前是完整、准确且可执行的

**API/Library Research 的验证评分标准**（总计 100 分，80 分及以上通过）：

#### 完整性（40 分）
- ✓ 已确定库/API 及其版本（10 分）
- ✓ 至少记录 3 个关键 API（10 分）
- ✓ 提供设置/配置步骤（10 分）
- ✓ 至少提供 1 个完整代码示例（10 分）

#### 准确性（30 分）
- ✓ 所有 API 签名与官方文档完全一致（15 分）
  - 检查：没有改写，参数类型准确，返回值正确
- ✓ 版本号正确且保持一致（5 分）
- ✓ 所有 URL 有效，并指向官方来源（10 分）
  - 测试：每个 URL 都应来自官方域名

#### 引用（20 分）
- ✓ 每个 API 都有来源 URL（10 分）
- ✓ 来源包含版本和章节引用（5 分）
- ✓ 已说明置信度并给出依据（5 分）

#### 可操作性（10 分）
- ✓ 提供实现检查清单（5 分）
- ✓ 开放问题能够识别真实决策（5 分）

**通过分数**：80/100 或更高

**验证流程**：

```python
# Pseudo-code for validation logic
def validate_research_pack(research_pack):
    score = 0
    defects = []

    # Completeness checks
    if has_library_with_version(research_pack):
        score += 10
    else:
        defects.append("CRITICAL: Library/version not identified")

    api_count = count_documented_apis(research_pack)
    if api_count >= 3:
        score += 10
    elif api_count > 0:
        score += (api_count / 3) * 10
        defects.append(f"MINOR: Only {api_count} APIs documented, need 3+")
    else:
        defects.append("CRITICAL: No APIs documented")

    # ... (continue for all criteria)

    return {
        "score": score,
        "grade": "PASS" if score >= 80 else "FAIL",
        "defects": defects,
        "recommendations": generate_recommendations(defects)
    }
```

**输出格式**：

```markdown
## 📊 ResearchPack 验证报告

**总分**：[X]/100
**等级**：[通过 ✅ / 失败 ❌]

### 分项得分
- 完整性：[X]/40
- 准确性：[X]/30
- 引用：[X]/20
- 可操作性：[X]/10

### 发现的缺陷（[N]）

#### 严重（阻碍实现）
1. [包含示例的具体缺陷]
2. [另一个缺陷]

#### 主要（应在继续之前修复）
1. [缺陷]

#### 次要（可选改进）
1. [缺陷]

### 建议

**要达到通过分数**：
1. [需要采取的具体行动]
2. [另一个行动]

**如果分数 >= 80**：✅ **已批准** - 继续进入 implementation-planner

**如果分数 < 80**：❌ **已阻止** - 修复严重/主要缺陷并重新验证
```

### 1b. ResearchPack 验证 - 理念研究类型

**目的**：确保理念/模式研究组织良好、有来源依据且可执行

**理念研究验证评分标准**（总分 100 分，70 分及以上通过）：

#### 主题组织（30 分）
- ✓ 明确识别主题/模式，并使用描述性名称（10 分）
  - 检查：每个主题都有清晰的标题和范围
  - 示例：“Agent Architecture”、“Context Engineering”、“Multi-Agent Patterns”
- ✓ 每个主题都有示例和证据支持的完整文档（10 分）
  - 检查：主题包含子章节，而不只是项目符号列表
  - 检查：每个主题都有示例或引文支持
- ✓ 解释跨主题的综合分析和相互关系（10 分）
  - 检查：存在“How patterns connect”或“Synthesis”章节
  - 检查：解释主题之间的关联方式，或它们如何层层构建

#### 来源质量（20 分）
- ✓ 引用官方/权威来源（10 分）
  - 检查：使用来自官方域名的 URL（anthropic.com、docs.*、官方仓库）
  - 示例：Anthropic 博客、官方文档、框架指南
- ✓ 每个主题包含多个来源（5 分）
  - 检查：每个主要主题引用 2 个或更多来源
  - 不应存在单一来源主题（这表明研究范围狭窄）
- ✓ 在适用时提供日期/版本信息（5 分）
  - 检查：包含文章日期、发布版本或“截至 [日期]”等信息
  - 有助于判断研究内容是否为最新

#### 可执行洞察（30 分）
- ✓ 提供实现检查清单（15 分）
  - 检查：针对应用研究提出具体的后续步骤
  - 格式："Enhancement 1.1:"、"Step 1:"、"Action Items"
  - 示例："Add think protocol to agents"、"Create context-engineering skill"
- ✓ 提取并记录具体模式（10 分）
  - 检查：包含具有明确模式名称的模式章节
  - 检查：每个模式都有描述以及适用时机
  - 示例："Pattern 1: Minimal Scaffolding"、"Pattern 2: Think Before Act"
- ✓ 识别规划阶段的开放性问题（5 分）
  - 检查：研究承认哪些内容尚不明确或需要做出决策
  - 示例："Which agents need think tool?"、"When to use multi-agent?"

#### 深度与覆盖范围（20 分）
- ✓ 全面覆盖主题（10 分）
  - 检查：覆盖主题的多个方面
  - 检查：不是停留在表面层次（超越基本定义）
  - 示例：7 个以上主题，主要主题有 10 个以上来源
- ✓ 提供足够的实现细节（10 分）
  - 检查：包含足以支持决策的上下文
  - 检查：包含性能指标、权衡取舍和示例
  - 示例："39% improvement"、"15x cost"、具体数字

**通过分数**：70/100 或更高

**为什么阈值低于 API 研究？**

理念研究本质上更具主观性和主题性。即使没有“3+ 个具有精确签名的 API 端点”，只要主题分析组织良好，并且从 11 个来源中提炼出 7 个模式（例如 Anthropic ResearchPack），就应当通过。

理念研究提供**战略价值**：
- 指导如何构建，而不仅仅是调用哪些 API
- 建立适用于不同实现的原则
- 沉淀组织知识和最佳实践
- 支持规划阶段做出更好的决策

**示例：Anthropic Engineering Philosophy ResearchPack**

评分如下：
- **主题组织**：30/30（7 个清晰主题，包含跨主题综合章节）
- **来源质量**：20/20（11 篇 Anthropic 官方文章，全部注明日期）
- **可执行洞察**：28/30（包含实现检查清单，提取出 7 个模式，列出了开放性问题）
- **深度与覆盖范围**：18/20（覆盖全面，但如果有更多示例会更好）
- **总分**：96/100 ✅ **通过**（远高于 70 分阈值）

**输出格式**：

```markdown
## 📊 ResearchPack Validation Report (Philosophy Research)

**Overall Score**: [X]/100
**Grade**: [PASS ✅ / FAIL ❌]
**Research Type**: Philosophy/Pattern Research

### Breakdown

**Thematic Organization** ([X]/30):
- Clear themes: [Y/10] [✓/✗]
- Theme documentation: [Y/10] [✓/✗]
- Cross-synthesis: [Y/10] [✓/✗]

**Source Quality** ([X]/20):
- Official sources: [Y/10] [✓/✗]
- Multiple sources per theme: [Y/5] [✓/✗]
- Date/version info: [Y/5] [✓/✗]

**Actionable Insights** ([X]/30):
- Implementation checklist: [Y/15] [✓/✗]
- Patterns extracted: [Y/10] [✓/✗]
- Open questions: [Y/5] [✓/✗]

**Depth & Coverage** ([X]/20):
- Comprehensive coverage: [Y/10] [✓/✗]
- Sufficient detail: [Y/10] [✓/✗]

### Defects Found ([N])

#### CRITICAL (blocks implementation)
1. [Defect - if no themes identified, no patterns extracted, etc.]

#### MAJOR (should fix before proceeding)
1. [Defect - if only 1 source per theme, missing implementation checklist, etc.]

#### MINOR (nice to have)
1. [Defect - if some themes lack examples, could use more sources, etc.]

### Recommendations

**To reach passing score** (if < 70):
1. [Specific action to take]
2. [Another action]

**If score >= 70**: ✅ **APPROVED** - Proceed to implementation-planner

**If score < 70**: ❌ **BLOCKED** - Fix critical/major defects and re-validate

**Philosophy Research Note**: This research provides strategic guidance for implementation. Even if specific API details are needed later, the principles and patterns documented here are valuable for decision-making.
```

### 2. 实现计划验证

**目的**：确保计划在编码前完整、安全且可执行

**验证标准**（总分 100 分）：

#### 完整性（35 分）
- ✓ 列出所有文件变更及其用途（10 分）
- ✓ 提供分步实现顺序（10 分）
- ✓ 每个步骤都有验证方法（10 分）
- ✓ 包含测试计划（5 分）

#### 安全性（30 分）
- ✓ 回滚计划完整且具体（15 分）
  - 必须包括：确切命令、验证步骤、触发条件
- ✓ 完成风险评估（10 分）
  - 至少识别 3 项风险并提供缓解措施
- ✓ 变更最小化（尽可能少的文件）（5 分）

#### 清晰度（20 分）
- ✓ 步骤可执行（无歧义）（10 分）
- ✓ 定义成功标准（5 分）
- ✓ 提供时间估算（5 分）

#### 一致性（15 分）
- ✓ 计划与 ResearchPack API 匹配（10 分）
- ✓ 计划涵盖用户提出的所有要求（5 分）

**通过分数**：85/100 或更高（标准高于研究阶段）

**验证流程**：

```python
def validate_implementation_plan(plan, research_pack):
    score = 0
    defects = []

    # Completeness checks
    if has_file_changes_list(plan):
        score += 10
    else:
        defects.append("CRITICAL: No file changes specified")

    steps = extract_steps(plan)
    if all(step_has_verification(s) for s in steps):
        score += 10
    else:
        missing = [s for s in steps if not step_has_verification(s)]
        score += (len(steps) - len(missing)) / len(steps) * 10
        defects.append(f"MAJOR: Steps {missing} lack verification")

    # Safety checks
    rollback = extract_rollback_plan(plan)
    if has_exact_commands(rollback) and has_triggers(rollback):
        score += 15
    elif has_rollback_section(plan):
        score += 8
        defects.append("MAJOR: Rollback plan incomplete (missing commands or triggers)")
    else:
        defects.append("CRITICAL: No rollback plan")

    # Alignment checks
    apis_used = extract_apis_from_plan(plan)
    research_apis = extract_apis_from_research(research_pack)
    if all(api_matches_research(a, research_apis) for a in apis_used):
        score += 10
    else:
        mismatches = find_api_mismatches(apis_used, research_apis)
        defects.append(f"CRITICAL: APIs don't match ResearchPack: {mismatches}")

    # ... (continue for all criteria)

    return {
        "score": score,
        "grade": "PASS" if score >= 85 else "FAIL",
        "defects": defects,
        "recommendations": generate_recommendations(defects)
    }
```

**输出格式**：

```markdown
## 📊 Implementation Plan Validation Report

**Overall Score**: [X]/100
**Grade**: [PASS ✅ / FAIL ❌]

### Breakdown
- Completeness: [X]/35
- Safety: [X]/30
- Clarity: [X]/20
- Alignment: [X]/15

### Defects Found ([N])

#### CRITICAL (blocks implementation)
1. [Specific defect]

#### MAJOR (should fix)
1. [Defect]

#### MINOR (nice to have)
1. [Defect]

### API Alignment Check
✅ All APIs match ResearchPack
OR
❌ Mismatches found:
- Plan uses `foo(x, y)` but ResearchPack shows `foo(x: string, y?: number)`

### Recommendations

**To reach passing score**:
1. [Action]

**If score >= 85**: ✅ **APPROVED** - Proceed to code-implementer

**If score < 85**: ❌ **BLOCKED** - Fix defects and re-validate
```

## 质量门协议

**质量门是强制性的检查点** - 未通过验证不得进入下一阶段。

### 质量门 1：研究 → 规划

```
Trigger: @docs-researcher completes ResearchPack
Action: Validate ResearchPack
Decision:
  - Score >= 80: ✅ Allow @implementation-planner to proceed
  - Score < 80: ❌ Block, return to @docs-researcher with defect list
```

### 质量门 2：规划 → 实现

```
Trigger: @implementation-planner completes Implementation Plan
Action: Validate Implementation Plan + check alignment with ResearchPack
Decision:
  - Score >= 85 AND APIs match: ✅ Allow @code-implementer to proceed
  - Score < 85 OR APIs mismatch: ❌ Block, return to @implementation-planner with defect list
```

### 质量门 3：实现 → 完成

```
Trigger: @code-implementer reports completion
Action: Validate tests passed, build succeeded, no regressions
Decision:
  - All checks pass: ✅ Mark complete
  - Any check fails: ❌ Trigger self-correction loop (up to 3 attempts)
```

## 验证自动化

**这些验证应通过 hooks 自动执行**（参见 hooks 实现）：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "implementation-planner",
        "command": "validate-research-pack.sh",
        "action": "block_if_fails"
      },
      {
        "matcher": "code-implementer",
        "command": "validate-implementation-plan.sh",
        "action": "block_if_fails"
      }
    ]
  }
}
```

**验证脚本返回**：
- Exit code 0：验证通过，继续执行
- Exit code 1：验证失败，缺陷打印到 stdout，并阻止继续执行

## 常见验证失败

### ResearchPack 失败

**虚构的 API**：
```
❌ CRITICAL: API `redis.client.fetch()` not found in official docs
   ResearchPack cites: redis.io/docs/clients/nodejs
   Actual API: `client.get()` (verified at redis.io/docs/clients/nodejs#get)
   FIX: Replace all instances of `fetch` with correct `get` API
```

**版本不匹配**：
```
❌ MAJOR: ResearchPack uses v3.x docs but project has v4.6.0
   Example: v3 uses callbacks, v4 uses promises
   FIX: Re-fetch docs for v4.6.0 specifically
```

**缺少引用**：
```
❌ MAJOR: 5 APIs listed without source URLs
   APIs: set(), del(), ttl(), exists(), keys()
   FIX: Add source URL for each (format: docs.com/path#section)
```

### Implementation Plan 失败

**没有回滚计划**：
```
❌ CRITICAL: Rollback plan missing
   FIX: Add section "## 🔄 Rollback Plan" with:
   - Exact git commands to revert
   - Configuration restoration steps
   - Verification after rollback
   - Triggers for when to rollback
```

**步骤含义不明确**：
```
❌ MAJOR: Step 3 says "Update the service" (too vague)
   FIX: Specify:
   - Which service? (path/to/ServiceName.ts)
   - What update? (Add method X, modify method Y)
   - How to verify? (run `npm test path/to/test.ts`)
```

**API 不一致**：
```
❌ CRITICAL: Plan uses `client.fetch(key)` but ResearchPack shows `client.get(key)`
   FIX: Update plan to use correct API signature from ResearchPack
```

## 性能目标

- **验证时间**：每次验证 < 15 秒
- **缺陷检测率**：捕获 95% 以上的重大问题
- **误报率**：< 5%（不要阻碍高质量工作）

## 与 Hooks 集成

Hooks 提供确定性的强制执行机制（始终运行，不依赖 LLM）：

**Research 验证 hook**：
```bash
#!/bin/bash
# .claude/hooks/validate-research-pack.sh

RESEARCH_FILE="$1" # Path to ResearchPack file

# Check completeness
if ! grep -q "Target Library:" "$RESEARCH_FILE"; then
    echo "❌ CRITICAL: Library not identified"
    exit 1
fi

# Check API count
API_COUNT=$(grep -c "^###.*API" "$RESEARCH_FILE" || echo 0)
if [ "$API_COUNT" -lt 3 ]; then
    echo "❌ MINOR: Only $API_COUNT APIs documented, need 3+"
    # Don't block for this, just warn
fi

# Check citations
if ! grep -q "Source:" "$RESEARCH_FILE"; then
    echo "❌ CRITICAL: No source citations found"
    exit 1
fi

echo "✅ ResearchPack validation passed (score: [calculated]/100)"
exit 0
```

**Plan 验证 hook**（结构类似）。

---

**此 skill 确保质量门禁客观、自动化，并以确定性的方式强制执行 Research → Plan → Implement 工作流。**