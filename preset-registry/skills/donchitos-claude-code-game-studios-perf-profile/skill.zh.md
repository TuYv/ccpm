---
name: perf-profile
description: "Structured performance profiling workflow. Identifies bottlenecks, measures against budgets, and generates optimization recommendations with priority rankings."
argument-hint: "[system-name or 'full']"
user-invocable: true
agent: performance-analyst
allowed-tools: Read, Glob, Grep, Bash
model: sonnet
---
## 阶段 1：确定范围

读取参数：

- 系统名称 → 将性能分析聚焦于该特定系统
- `full` → 对所有系统运行全面的性能分析

---

## 阶段 2：加载性能预算

检查设计文档或 CLAUDE.md 中已有的性能目标：

- 目标 FPS（例如，60fps = 16.67ms 帧预算）
- 内存预算（总预算和各系统预算）
- 加载时间目标
- 绘制调用预算
- 网络带宽限制（如果是多人游戏）

---

## 阶段 3：分析代码库

**CPU 性能分析目标：**
- `_process()` / `Update()` / `Tick()` 函数——列出所有函数并估算开销
- 对大型集合的嵌套循环
- 热路径中的字符串操作
- 每帧代码中的内存分配模式
- 对游戏实体执行的未优化搜索/排序
- 每帧执行的高开销物理查询（射线检测、重叠检测）

**内存性能分析目标：**
- 大型数据结构及其增长模式
- 纹理/资源内存占用估算
- 对象池与实例化/销毁模式的对比
- 泄漏的引用（本应释放但未释放的对象）
- 缓存大小和淘汰策略

**渲染目标（如适用）：**
- 绘制调用估算
- 透明对象相互重叠造成的过度绘制
- 着色器复杂度
- 未优化的粒子系统
- 缺少 LOD 或遮挡剔除

**I/O 目标：**
- 保存/加载性能
- 资源加载模式（同步与异步）
- 网络消息频率和大小

---

## 阶段 4：生成性能分析报告

```markdown
## Performance Profile: [System or Full]
Generated: [Date]

### Performance Budgets
| Metric | Budget | Estimated Current | Status |
|--------|--------|-------------------|--------|
| Frame time | [16.67ms] | [estimate] | [OK/WARNING/OVER] |
| Memory | [target] | [estimate] | [OK/WARNING/OVER] |
| Load time | [target] | [estimate] | [OK/WARNING/OVER] |
| Draw calls | [target] | [estimate] | [OK/WARNING/OVER] |

### Hotspots Identified
| # | Location | Issue | Estimated Impact | Fix Effort |
|---|----------|-------|------------------|------------|

### Optimization Recommendations (Priority Order)
1. **[Title]** — [Description]
   - Location: [file:line]
   - Expected gain: [estimate]
   - Risk: [Low/Med/High]
   - Approach: [How to implement]

### Quick Wins (< 1 hour each)
- [Simple optimization 1]

### Requires Investigation
- [Area that needs actual runtime profiling to confirm impact]
```

输出报告并附上摘要：排名前三的热点、相对于预算的预计余量，以及建议采取的下一步行动。

---

## 阶段 5：范围和时间线决策

仅当任一热点的修复工作量被评为 M 或 L 时，才启用此阶段。

列出需要大量投入的项目，并让用户为每个项目作出选择：

- **A) 实施优化**（立即进行修复或安排修复计划）
- **B) 缩减功能范围**（运行 `/scope-check [feature]` 以分析取舍）
- **C) 接受性能损失并推迟到打磨阶段处理**（记录为已知问题）
- **D) 上报给 technical-director 进行架构决策**（运行 `/architecture-decision`）

如果有多个项目被推迟到打磨阶段（选择 C），请将它们记录在 `### Deferred to Polish` 下。

此技能为只读——不会写入任何文件。结论：**COMPLETE**——性能分析报告已生成。

---

## 阶段 6：后续步骤

- 如果瓶颈需要通过架构变更来解决：运行 `/architecture-decision`。
- 如果需要缩减范围：运行 `/scope-check [feature]`。
- 如需安排优化工作：运行 `/sprint-plan update`。

### 规则
- 未经测量，绝不进行优化——对性能的直觉判断并不可靠
- 建议必须包含预估影响——“让它更快”不具备可操作性
- 应在目标硬件上进行性能分析，而不应只在开发机器上进行
- 静态分析（此技能）用于识别候选项；运行时性能分析用于确认