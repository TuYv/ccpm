---
name: systematic-debugging
description: Four-phase debugging methodology with root cause analysis. Use when investigating bugs, fixing test failures, or troubleshooting unexpected behavior. Emphasizes NO FIXES WITHOUT ROOT CAUSE FIRST.
---
# 系统化调试

## 核心原则

**未先调查根本原因，绝不修复。**

切勿采用只关注症状、掩盖底层问题的补丁。在尝试修复之前，先弄清楚问题失败的原因。

## 四阶段框架

### 阶段 1：根本原因调查

在修改任何代码之前：

1. **仔细阅读错误消息** - 每个字都很重要
2. **稳定复现问题** - 如果无法复现，就无法验证修复是否有效
3. **检查近期变更** - 在问题开始出现之前，发生了哪些变化？
4. **收集诊断证据** - 日志、堆栈跟踪、状态转储
5. **跟踪数据流** - 沿调用链查找错误值的来源

**根本原因追踪技巧：**
```
1. Observe the symptom - Where does the error manifest?
2. Find immediate cause - Which code directly produces the error?
3. Ask "What called this?" - Map the call chain upward
4. Keep tracing up - Follow invalid data backward through the stack
5. Find original trigger - Where did the problem actually start?
```

**关键原则：**切勿只在错误出现的位置修复问题——始终追踪到最初的触发点。

### 阶段 2：模式分析

1. **查找可正常工作的示例** - 找到能够正确运行的类似代码
2. **完整比较实现** - 不要只是粗略浏览
3. **找出差异** - 正常实现与故障实现之间有何不同？
4. **了解依赖项** - 这段代码依赖什么？

### 阶段 3：提出假设并测试

应用科学方法：

1. **提出一个明确的假设** - “错误发生是因为 X”
2. **设计最小化测试** - 每次只更改一个变量
3. **预测结果** - 如果假设正确，应该发生什么？
4. **运行测试** - 执行并观察
5. **验证结果** - 实际表现是否符合预测？
6. **迭代或继续** - 如果假设错误，则完善假设；如果正确，则实施修复

### 阶段 4：实施

1. **创建失败测试用例** - 捕获缺陷行为
2. **实施单一修复** - 解决根本原因，而非症状
3. **验证测试通过** - 确认修复有效
4. **运行完整测试套件** - 确保没有回归
5. **如果修复失败，立即停止** - 重新评估假设

**关键规则：**如果连续三次或更多次修复均告失败，请立即停止。这表明存在需要讨论的架构问题，不应继续打补丁。

## 危险信号——流程违规

如果发现自己产生以下想法，请立即停止：

- “现在先快速修复，以后再调查”
- “再尝试一次修复”（在多次失败之后）
- “这应该能行”（却不明白为什么）
- “让我直接试试……”（没有假设）
- “在我的机器上可以运行”（却没有调查环境差异）

## 深层问题的警示信号

**连续修复却在不同区域暴露出新问题**，表明存在架构问题：

- 停止打补丁
- 记录已发现的问题
- 继续之前先与团队讨论
- 考虑是否需要重新审视设计

## 常见调试场景

### 测试失败

```
1. Read the FULL error message and stack trace
2. Identify which assertion failed and why
3. Check test setup - is the test environment correct?
4. Check test data - are mocks/fixtures correct?
5. Trace to the source of unexpected value
```

### 运行时错误

```
1. Capture the full stack trace
2. Identify the line that throws
3. Check what values are undefined/null
4. Trace backward to find where bad value originated
5. Add validation at the source
```

### “之前还能正常工作”

```
1. Use git bisect to find the breaking commit
2. Compare the change with previous working version
3. Identify what assumption changed
4. Fix at the source of the assumption violation
```

### 间歇性故障

```
1. Look for race conditions
2. Check for shared mutable state
3. Examine async operation ordering
4. Look for timing dependencies
5. Add deterministic waits or proper synchronization
```

## 调试检查清单

在声称错误已修复之前：

- [ ] 已识别并记录根本原因
- [ ] 已提出并验证假设
- [ ] 修复解决的是根本原因，而非症状
- [ ] 已创建可复现该错误的失败测试
- [ ] 应用修复后，该测试现已通过
- [ ] 完整测试套件已通过
- [ ] 未使用“快速修复”的合理化说辞
- [ ] 修复最小且聚焦

## 成功指标

系统化调试的首次修复成功率约为 95%，而临时随意调试方法的成功率约为 40%。

表明你的做法正确的迹象：
- 修复不会引入新的错误
- 你可以解释错误发生的原因
- 类似错误不会再次出现
- 修复后的代码质量更好，而不仅仅是“能运行”

## 与其他技能的集成

- **testing-patterns**：在修复前创建可复现该错误的测试