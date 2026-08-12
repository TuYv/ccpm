---
name: drift-analysis
description: Use when the user asks about plan drift, reality check, comparing docs to code, project state analysis, roadmap alignment, implementation gaps, or needs guidance on identifying discrepancies between documented plans and actual implementation state.
version: 5.1.0
---
# 漂移分析

用于分析项目状态、检测计划漂移以及创建按优先级排序的重建计划的知识与模式。

## 架构概览

```
/drift-detect
        │
        ├─→ collectors.js (pure JavaScript)
        │   ├─ scanGitHubState()
        │   ├─ analyzeDocumentation()
        │   └─ scanCodebase()
        │
        └─→ plan-synthesizer (Opus)
            └─ Deep semantic analysis with full context
```

**数据收集**：纯 JavaScript（无 LLM 开销）
**语义分析**：在完整上下文中进行单次 Opus 调用

## 漂移检测模式

### 漂移类型

**计划漂移**：文档中的计划与实际实现出现偏差
- PLAN.md 中的事项长时间保持未勾选状态
- 路线图里程碑延期且未更新
- 冲刺/阶段目标未反映在代码变更中

**文档漂移**：文档落后于实现
- 已存在新功能，但没有相应文档
- README 描述了并不存在的功能
- API 文档与实际端点不匹配

**议题漂移**：议题跟踪与实际情况出现偏差
- 已不再适用的陈旧议题
- 工作已完成，但相应议题未关闭
- 高优先级事项受到忽视

**范围漂移**：项目范围扩展到原始计划之外
- 文档中记录的功能超出可交付能力
- 持续添加内容，却没有完成已有内容
- 待办事项不断增加，却从不清理

### 检测信号

```
HIGH-CONFIDENCE DRIFT INDICATORS:
- Milestone 30+ days overdue with open issues
- PLAN.md < 30% completion after 90 days
- 5+ high-priority issues stale > 60 days
- README features not found in codebase

MEDIUM-CONFIDENCE INDICATORS:
- Documentation files unchanged for 180+ days
- Draft PRs open > 30 days
- Issue themes don't match code activity
- Large gap between documented and implemented features

LOW-CONFIDENCE INDICATORS:
- Many TODOs in codebase
- Stale dependencies
- Old git branches not merged
```

## 优先级排序框架

### 优先级计算

```javascript
function calculatePriority(item, weights) {
  let score = 0;

  // Severity base score
  const severityScores = {
    critical: 15,
    high: 10,
    medium: 5,
    low: 2
  };
  score += severityScores[item.severity] || 5;

  // Category multiplier
  const categoryWeights = {
    security: 2.0,    // Security issues get 2x
    bugs: 1.5,        // Bugs get 1.5x
    infrastructure: 1.3,
    features: 1.0,
    documentation: 0.8
  };
  score *= categoryWeights[item.category] || 1.0;

  // Recency boost
  if (item.createdRecently) score *= 1.2;

  // Stale penalty (old items slightly deprioritized)
  if (item.daysStale > 180) score *= 0.9;

  return Math.round(score);
}
```

### 时间段阈值

| 时间段 | 条件 | 最大事项数 |
|--------|----------|-----------|
| 立即处理 | severity=critical OR priority >= 15 | 5 |
| 短期 | severity=high OR priority >= 10 | 10 |
| 中期 | priority >= 5 | 15 |
| 待办 | 其他所有事项 | 20 |

### 优先级权重（默认）

```yaml
security: 10     # Security issues always top priority
bugs: 8          # Bugs affect users directly
features: 5      # New functionality
documentation: 3 # Important but not urgent
tech-debt: 4     # Keeps codebase healthy
```

## 交叉引用模式

### 文档与代码匹配

```javascript
// Fuzzy matching for feature names
function featureMatch(docFeature, codeFeature) {
  const normalize = s => s
    .toLowerCase()
    .replace(/[-_\s]+/g, '')
    .replace(/s$/, ''); // Remove trailing 's'

  const docNorm = normalize(docFeature);
  const codeNorm = normalize(codeFeature);

  return docNorm.includes(codeNorm) ||
         codeNorm.includes(docNorm) ||
         levenshteinDistance(docNorm, codeNorm) < 3;
}
```

### 常见不匹配情况

| 文档中的名称 | 实现中的名称 |
|---------------|----------------|
| “用户身份验证” | auth/, login/, session/ |
| “API 端点” | routes/, api/, handlers/ |
| “数据库模型” | models/, entities/, schemas/ |
| “缓存层” | cache/, redis/, memcache/ |
| “日志系统” | logger/, logs/, telemetry/ |

## 输出模板

### 偏差报告章节

```markdown
## Drift Analysis

### {drift_type}
**Severity**: {severity}
**Detected In**: {source}

{description}

**Evidence**:
{evidence_items}

**Recommendation**: {recommendation}
```

### 缺口报告章节

```markdown
## Gap: {gap_title}

**Category**: {category}
**Severity**: {severity}

{description}

**Impact**: {impact_description}

**To Address**:
1. {action_item_1}
2. {action_item_2}
```

### 重建计划章节

```markdown
## Reconstruction Plan

### Immediate Actions (This Week)
{immediate_items_numbered}

### Short-Term (This Month)
{short_term_items_numbered}

### Medium-Term (This Quarter)
{medium_term_items_numbered}

### Backlog
{backlog_items_numbered}
```

## 最佳实践

### 分析偏差时

1. **比较时间戳，而不只是内容**
   - 文档上次更新与代码上次变更分别是什么时候？
   - 里程碑的日期是否现实？

2. **寻找规律，而不是关注单个项目**
   - 一个过时的问题不算偏差；10 个过时的问题才形成规律
   - 一个未记录的功能不算偏差；5 个未记录的功能才算

3. **考虑上下文**
   - 活跃开发自然会产生一些偏差
   - 成熟项目的偏差应该尽可能小
   - 发布后的项目通常会出现文档滞后

4. **按影响确定权重**
   - 面向用户的偏差比内部偏差更重要
   - 公共 API 的偏差比实现细节的偏差更重要

### 制定计划时

1. **注重可执行性，而不是面面俱到**
   - 列出最优先的 5 个即时处理项目，而不是 50 个
   - 每个项目都应该能在合理时间内完成

2. **对相关项目进行分组**
   - 使用“更新身份验证文档”，而不是“更新登录页面文档”+“更新注册文档”

3. **包含成功标准**
   - 如何确定这个偏差项目已经解决？

4. **平衡各个类别**
   - 所有安全问题优先，但不要忽略其他一切
   - 将可快速完成的工作与重要工作结合起来

## 数据收集（JavaScript）

collectors.js 模块无需 LLM 开销即可提取数据：

### GitHub 数据
- 按标签分类的开放议题
- 包含草稿状态的开放 PR
- 包含截止日期的里程碑
- 陈旧项目（超过 90 天无活动）
- 基于标题的主题分析

### 文档数据
- 已解析的 README、PLAN.md、CLAUDE.md、CHANGELOG.md
- 复选框完成数量
- 章节分析
- 功能列表

### 代码数据
- 目录结构
- 框架检测
- 测试框架是否存在
- 健康度指标（CI、代码检查、测试）

## 语义分析（Opus）

plan-synthesizer 接收所有收集的数据并执行：

1. **交叉核对**：将文档中的功能与实现进行匹配
2. **偏差识别**：查找偏差模式
3. **差距分析**：识别缺失内容
4. **优先级排序**：结合上下文进行排名
5. **报告生成**：提供可操作的建议

## 输入/输出示例

### 收集的数据（来自 collectors.js）

```json
{
  "github": {
    "issues": [...],
    "categorized": { "bugs": [...], "features": [...] },
    "stale": [...]
  },
  "docs": {
    "files": { "README.md": {...}, "PLAN.md": {...} },
    "checkboxes": { "total": 15, "checked": 3 }
  },
  "code": {
    "frameworks": ["Express"],
    "health": { "hasTests": true, "hasCi": true }
  }
}
```

### 分析输出（来自 plan-synthesizer）

```markdown
# Reality Check Report

## Executive Summary
Project has moderate drift: 8 stale priority issues and 20% plan completion.
Strong code health (tests + CI) but documentation lags implementation.

## Drift Analysis
### Priority Neglect
**Severity**: high
8 high-priority issues inactive for 60+ days...

## Prioritized Plan
### Immediate
1. Close #45 (already implemented)
2. Update README API section...
```