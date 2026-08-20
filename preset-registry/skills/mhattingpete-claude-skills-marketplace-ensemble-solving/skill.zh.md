---
name: ensemble-solving
description: Generate multiple diverse solutions in parallel and select the best. Use for architecture decisions, code generation with multiple valid approaches, or creative tasks where exploring alternatives improves quality.
---
# 集成式问题求解

通过生成 3 个采用不同方法的子代理，并行产出多个解决方案，然后进行评估并选择最佳结果。

## 何时使用

**触发短语：**
- “给我一些……的选项”
- “……的最佳方式是什么？”
- “探索不同的方法……”
- “我想看看替代方案……”
- “比较……的不同方法”
- “我应该使用哪种方法？”

**适合的任务：**
- 需要权衡取舍的架构决策
- 存在多种有效实现方式的代码生成
- 采用不同理念的 API 设计
- 命名、品牌塑造、文档风格
- 重构策略
- 算法选择

**以下情况跳过集成：**
- 简单查询或语法问题
- 单一原因导致的错误修复
- 文件操作、git 命令
- 确定性的配置更改
- 只有一个显而易见解决方案的任务

## 功能说明

1. **分析任务**，判断集成方法是否有价值
2. **生成 3 个不同的提示词**，使用适当的多样化策略
3. **生成 3 个并行子代理**，让它们独立制定解决方案
4. **使用加权标准评估所有解决方案**
5. **返回最佳解决方案**，并附带说明和替代方案摘要

## 方法

### 第 1 步：对任务类型进行分类

确定任务属于以下哪个类别：
- **代码生成**：函数、类、API、算法
- **架构/设计**：系统设计、数据模型、模式
- **创意**：写作、命名、文档

### 第 2 步：调用集成编排器

```
Task tool with:
- subagent_type: 'ensemble-orchestrator'
- description: 'Generate and evaluate 3 parallel solutions'
- prompt: [User's original task with full context]
```

编排器负责：
- 提示词多样化
- 并行执行
- 解决方案评估
- 最佳方案选择

### 第 3 步：呈现结果

编排器返回：
- 完整的获胜解决方案
- 3 种方法各自的评估分数
- 选择获胜方案的原因
- 可能更适合使用替代方案的情形

## 多样化策略

**对于代码（约束变化）：**
| 方法 | 重点 |
|----------|-------|
| 简洁性 | 最少的代码，最大的可读性 |
| 性能 | 高效、经过优化 |
| 可扩展性 | 清晰的抽象，易于扩展 |

**对于架构（方法变化）：**
| 方法 | 重点 |
|----------|-------|
| 自顶向下 | 需求 → 接口 → 实现 |
| 自底向上 | 基础元素 → 组合 → 结构 |
| 横向思考 | 借鉴其他领域的类比 |

**对于创意（角色变化）：**
| 方法 | 重点 |
|----------|-------|
| 专家型 | 技术精准、权威 |
| 务实型 | 聚焦交付、注重实用 |
| 创新型 | 富有创意、不拘一格 |

## 评估标准

| 标准 | 基础权重 | 说明 |
|-----------|-------------|-------------|
| 正确性 | 30% | 正确解决问题 |
| 完整性 | 20% | 满足所有要求 |
| 质量 | 20% | 完成品质 |
| 清晰度 | 15% | 易于理解的程度 |
| 优雅性 | 15% | 简洁、优美的程度 |

权重会根据任务类型进行调整。

## 示例

**用户：**“实现速率限制器的最佳方式是什么？”

**技能：**
1. 分类为代码生成
2. 调用 ensemble-orchestrator
3. 生成三种方案：
   - 简单方案：使用内存计数器的令牌桶
   - 性能方案：使用原子操作的滑动窗口
   - 可扩展方案：采用可插拔后端的策略模式
4. 评估后选择可扩展方案（得分 8.4）
5. 返回完整实现及说明

**输出：**
```
## Selected Solution

[Full rate limiter implementation with strategy pattern]

## Why This Solution Won

The extensible approach scored highest (8.4) because it provides
a clean abstraction that works for both simple use cases and
complex distributed scenarios. The strategy pattern allows
swapping Redis/Memcached backends without code changes.

## Alternatives

- **Simple approach**: Best if you just need basic in-memory
  limiting and will never scale beyond one process.

- **Performance approach**: Best for high-throughput scenarios
  where every microsecond matters.
```

## 成功标准

- 生成 3 种真正不同的解决方案
- 提供清晰的评估依据
- 有把握地选出优胜方案
- 概述替代方案及其适用场景
- 用户理解其中的权衡

## Token 成本

与单次尝试相比，开销约为 4 倍。以下情况值得采用：
- 高风险的架构决策
- 首次尝试通常难以达到最优的创意工作
- 查看不同方案有助于学习的场景
- 需要长期维护的代码

## 集成

- **feature-planning**：可以对架构决策采用集成方法
- **code-auditor**：可以整合不同的分析视角
- **plan-implementer**：执行优胜方案