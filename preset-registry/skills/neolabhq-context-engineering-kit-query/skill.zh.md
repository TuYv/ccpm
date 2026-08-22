---
name: query
description: "Search the FPF knowledge base and display hypothesis details with assurance information"
---
# 查询知识库

搜索 FPF 知识库，并显示假设详情及其保证信息。

## 操作（运行时）

1. 根据用户查询搜索 `.fpf/knowledge/` 和 `.fpf/decisions/`。
2. **对于找到的每个假设**，显示：
   - 基本信息：标题、层级（L0/L1/L2）、类型、适用范围
   - 如果层级 >= L1：读取审计部分以获取 R_eff
   - 如果存在依赖项：显示依赖关系图
   - 如果存在证据摘要，则显示该摘要
3. **以表格格式呈现结果**。

## 搜索位置

| 位置 | 内容 |
|----------|----------|
| `.fpf/knowledge/L0/` | 已提出的假设 |
| `.fpf/knowledge/L1/` | 已验证的假设 |
| `.fpf/knowledge/L2/` | 已确认有效的假设 |
| `.fpf/knowledge/invalid/` | 已否决的假设 |
| `.fpf/decisions/` | 设计理由记录 |
| `.fpf/evidence/` | 证据和审计文件 |

## 输出格式

```markdown
## Search Results for "<query>"

### Hypotheses Found

| Hypothesis | Layer | Kind | R_eff |
|------------|-------|------|-------|
| redis-caching | L2 | system | 0.85 |
| cdn-edge | L2 | system | 0.72 |

### redis-caching (L2)

**Title**: Use Redis for Caching
**Kind**: system
**Scope**: High-load systems, Linux only

**R_eff**: 0.85
**Weakest Link**: internal test (0.85)

**Dependencies**:
```
[redis-caching R:0.85]
  └── (no dependencies)
```

**Evidence**:
- ev-benchmark-redis-caching-2025-01-15 (internal, PASS)

### cdn-edge (L2)

**Title**: Use CDN Edge Cache
**Kind**: system
**Scope**: Static content delivery

**R_eff**: 0.72
**Weakest Link**: external docs (CL1 penalty)

**Evidence**:
- ev-research-cdn-2025-01-10 (external, PASS)
```

## 搜索方法

### 按关键词

搜索文件内容以查找匹配文本：

```
/fpf:query caching
-> Finds all hypotheses with "caching" in title or content
```

### 按特定 ID

查找特定假设：

```
/fpf:query redis-caching
-> Shows full details for redis-caching
-> Displays dependency tree
-> Shows R_eff breakdown
```

### 按层级

按知识层级筛选：

```
/fpf:query L2
-> Lists all L2 hypotheses with R_eff scores
```

### 按决策

搜索决策记录：

```
/fpf:query DRR
-> Lists all Design Rationale Records
-> Shows what each DRR selected/rejected
```

## R_eff 显示

对于 L1+ 假设，读取审计部分并显示：

```markdown
**R_eff Breakdown**:
- Self Score: 1.00
- Weakest Link: ev-research-redis (0.90)
- Dependency Penalty: none
- **Final R_eff**: 0.85
```

## 依赖关系树显示

如果假设具有 `depends_on`，则显示该树：

```
[api-gateway R:0.80]
  └──(CL:3)── [auth-module R:0.85]
  └──(CL:2)── [rate-limiter R:0.90]
```

图例：
- `R:X.XX` = R_eff 分数
- `CL:N` = 一致性级别（1-3）

## 示例

**按关键词搜索：**
```
User: /fpf:query caching

Results:
| Hypothesis | Layer | R_eff |
|------------|-------|-------|
| redis-caching | L2 | 0.85 |
| cdn-edge-cache | L2 | 0.72 |
| lru-cache | invalid | N/A |
```

**查询特定假设：**
```
User: /fpf:query redis-caching

# redis-caching (L2)

Title: Use Redis for Caching
Kind: system
Scope: High-load systems
R_eff: 0.85
Evidence: 2 files
```

**查询决策：**
```
User: /fpf:query DRR

# Design Rationale Records

| DRR | Date | Winner | Rejected |
|-----|------|--------|----------|
| DRR-2025-01-15-caching | 2025-01-15 | redis-caching | cdn-edge |
```