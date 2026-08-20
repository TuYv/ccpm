---
name: conversation-analyzer
description: Analyzes your Claude Code conversation history to identify patterns, common mistakes, and opportunities for workflow improvement. Use when user wants to understand usage patterns, optimize workflow, identify automation opportunities, or check if they're following best practices.
---
# 对话分析器

分析你的 Claude Code 对话历史，以识别使用模式、常见错误和工作流改进机会。

## 何时使用

- “分析我的对话”
- “审查我的 Claude Code 历史记录”
- “你从我的使用方式中发现了哪些模式”
- “我该如何改进工作流”
- “我是否在有效地使用 Claude Code”

## 分析内容

1. **请求类型分布**（错误修复、功能开发、重构、查询、测试）
2. **最活跃的项目**
3. **常见错误关键词**
4. **时段模式**
5. **重复性任务**（自动化机会）
6. **导致反复沟通的模糊请求**
7. **未进行规划就尝试的复杂任务**
8. **反复出现的错误/故障**

## 分析范围

默认：**最近 200 次对话**，以确保时效性和相关性。

## 方法

### 1. 请求类型分布
分类为：错误修复、功能添加、重构、信息查询、测试、其他。

### 2. 项目活跃度
跟踪哪些项目占用的时间最多，并识别特定于项目的模式。

### 3. 时间模式
按小时统计使用情况，识别生产力最高的时段。

### 4. 常见错误
- **模糊请求**：缺少上下文的初始请求与可接受的后续请求
- **重复修复**：相同问题多次出现
- **复杂任务**：未经规划的多步骤请求
- **重复命令**：可以自动化的手动任务

### 5. 错误分析
分析错误相关请求的频率、常见错误关键词和反复出现的问题。

### 6. 自动化机会
识别完全重复的请求，并建议使用技能、斜杠命令或脚本。

## 输出

结构化报告包含：
- **统计信息**：请求类型、活跃项目、时间模式
- **模式**：常见任务、重复命令、复杂度指标
- **问题**：带有示例的具体问题
- **建议**：按优先级排列且可执行的改进措施

## 使用的工具

- **Read**：加载历史记录文件（`~/.claude/history.jsonl`）
- **Write**：按需创建分析报告
- **Bash**：执行 Python 分析脚本
- **直接分析**：以编程方式解析 JSON

## 分析脚本

使用 `scripts/analyze_history.py` 进行全面分析：

**功能：**
- 加载并解析 `~/.claude/history.jsonl`
- 从多个维度分析模式
- 识别常见错误和低效之处
- 生成可执行的建议
- 输出详细报告

**在技能中的用法：**
当用户请求分析时自动运行。

**独立用法：**
```bash
cd ~/.claude/plugins/*/productivity-skills/conversation-analyzer/scripts
python3 analyze_history.py
```

输出：
- `conversation_analysis.txt` - 详细的模式分析
- `recommendations.txt` - 具体的改进建议

## 输出示例

```
Analyzed last 200 conversations:
- 60% general tasks, 15% bug fixes, 13% feature additions
- Project "ultramerge" dominates 58% of activity
- Same test-fixing request made 8 times
- 19 multi-step requests without planning
- Peak productivity: 13:00-15:00

Recommendations:
- Use test-fixing skill for recurring test failures
- Create project-specific utilities for ultramerge
- Use feature-planning skill for complex requests
- Add tests to prevent recurring bugs
- Schedule complex work during peak hours
```

## 成功标准

- 用户理解使用模式
- 提供具体、可操作的建议
- 提供来自历史记录的具体示例
- 按影响程度确定优先级（快速见效的改进与长期改进）
- 用户可以立即应用改进

## 集成

- **feature-planning**：实施建议的改进
- **test-fixing**：解决反复出现的测试失败
- **git-pushing**：提交工作流改进

## 隐私说明

所有分析均在本地进行。对话历史记录绝不会离开用户的计算机。