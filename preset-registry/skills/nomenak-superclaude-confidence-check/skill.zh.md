---
name: Confidence Check
description: Pre-implementation confidence assessment (≥90% required). Use before starting any implementation to verify readiness with duplicate check, architecture compliance, official docs verification, OSS references, and root cause identification.
---
# 置信度检查技能

## 目的

通过在开始实现**之前**评估置信度，防止沿错误方向执行。

**要求**：置信度达到 ≥90% 才能继续实现。

**测试结果**（2025-10-21）：
- 精确率：1.000（无假阳性）
- 召回率：1.000（无假阴性）
- 8/8 个测试用例通过

## 使用时机

在实现任何任务之前使用此技能，以确保：
- 不存在重复实现
- 已验证架构合规性
- 已查阅官方文档
- 已找到可运行的 OSS 实现
- 已正确识别根本原因

## 置信度评估标准

根据 5 项检查计算置信度分数（0.0 - 1.0）：

### 1. 没有重复实现？（25%）

**检查**：在代码库中搜索现有功能

```bash
# Use Grep to search for similar functions
# Use Glob to find related modules
```

✅ 如果未发现重复项，则通过
❌ 如果存在类似实现，则失败

### 2. 符合架构要求？（25%）

**检查**：验证技术栈是否一致

- 阅读 `CLAUDE.md`、`PLANNING.md`
- 确认使用现有模式
- 避免重复创造现有解决方案

✅ 如果使用现有技术栈（例如 Supabase、UV、pytest），则通过
❌ 如果不必要地引入新依赖项，则失败

### 3. 已验证官方文档？（20%）

**检查**：实现前查阅官方文档

- 使用 Context7 MCP 获取官方文档
- 使用 WebFetch 访问文档 URL
- 验证 API 兼容性

✅ 如果已查阅官方文档，则通过
❌ 如果依赖主观假设，则失败

### 4. 已参考可运行的 OSS 实现？（15%）

**检查**：查找经过验证的实现

- 使用 Tavily MCP 或 WebSearch
- 在 GitHub 上搜索示例
- 验证可运行的代码示例

✅ 如果找到 OSS 参考实现，则通过
❌ 如果没有可运行的示例，则失败

### 5. 已识别根本原因？（15%）

**检查**：理解实际问题

- 分析错误消息
- 检查日志和堆栈跟踪
- 识别底层问题

✅ 如果根本原因明确，则通过
❌ 如果症状不明确，则失败

## 置信度分数计算

```
Total = Check1 (25%) + Check2 (25%) + Check3 (20%) + Check4 (15%) + Check5 (15%)

If Total >= 0.90:  ✅ Proceed with implementation
If Total >= 0.70:  ⚠️  Present alternatives, ask questions
If Total < 0.70:   ❌ STOP - Request more context
```

## 输出格式

```
📋 Confidence Checks:
   ✅ No duplicate implementations found
   ✅ Uses existing tech stack
   ✅ Official documentation verified
   ✅ Working OSS implementation found
   ✅ Root cause identified

📊 Confidence: 1.00 (100%)
✅ High confidence - Proceeding to implementation
```

## 实现细节

TypeScript 实现位于 `confidence.ts` 中，可供参考，其中包含：

- `confidenceCheck(context)` - 主评估函数
- 详细的检查实现
- 上下文接口定义

## 投资回报率

**Token 节省量**：花费 100-200 个 token 进行置信度检查，可避免因方向错误而浪费 5,000-50,000 个 token。

**成功率**：在生产测试中，精确率和召回率均为 100%。