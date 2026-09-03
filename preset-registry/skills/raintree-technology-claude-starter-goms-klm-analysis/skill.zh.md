---
name: goms-klm-analysis
description: "GOMS and Keystroke-Level Model analysis for decomposing UI workflows into goals, operators, methods, selections, and expert-user execution estimates. Use when the user asks to compare task flows, count interaction cost, reduce clicks or keystrokes, evaluate command/menu/navigation choices, model expert performance, or redesign a workflow using GOMS, KLM, CMN-GOMS, or cognitive walkthrough style reasoning."
---
# GOMS / KLM 分析

当有用的产出物是一个明确的工作流模型时，请使用此技能。它最适合步骤已知的可重复任务，例如仪表盘分诊、表单提交、搜索/筛选/打开流程、命令面板、编辑器工作流以及移动端设置任务。

## 选择模型

- 当任务属于程序性操作且用户已经知道要做什么时，使用 **KLM**。它估算的是专家级的、无差错的执行时间。
- 当存在有实际意义的备选方案、决策规则或达成同一目标的多种方法时，使用 **GOMS**。
- 当风险在于可发现性、理解难度或首次使用而非速度时，使用轻量级的认知走查。

## KLM 操作符

从以下操作符类别入手，并根据产品情境进行调整：

- `K`：按键、轻触、点击、按压按钮或离散命令。
- `P`：指向或视觉上获取某个目标。
- `M`：一组动作开始前的心智准备。
- `H`：输入设备之间或不同操作姿势之间的手部移动。
- `R`：系统响应等待时间。
- `V`：继续操作前所需的视觉确认或阅读。

不要过度拟合精确的计时。先统计被移除的操作符和等待状态；仅当对比需要粗略总时长时才加入计时。

## 工作流

1. 命名任务并标明用户的专业水平。
2. 将当前方法记录为带编号的用户动作。
3. 为每个动作标注操作符。
4. 在决策、策略转换、模式切换或不明显的命令之前插入心智操作符。
5. 仅在 UI 阻塞下一步动作时插入响应等待。
6. 使用相同的操作符规则构建提议的方法。
7. 比较操作符数量、等待次数以及易出错的转换。
8. 推荐能够移除操作符或使所选方法显而易见的最小 UI 变更。

## 选择规则

对于 GOMS，需将选择规则明确写出来：

- 如果用户知道项目的确切名称，使用搜索。
- 如果项目是最近使用的或在空间位置上稳定，使用最近使用项或固定导航。
- 如果任务需要比较，使用带有常驻控件的列表/表格。
- 如果任务具有破坏性，仅当较慢的方法能降低错误风险时才使用它。

糟糕的选择规则会暴露设计问题。如果规则依赖于隐性知识，应重新设计流程，而不是把规则记录成文档。

## 输出

对于单一流程：

```text
Task:
User:
Current method:
Operator model:
Findings:
Recommendations:
```

对于备选方案：

```text
Option A:
- Operators:
- Waits:
- Error-prone transitions:

Option B:
- Operators:
- Waits:
- Error-prone transitions:

Decision:
```

## 护栏

- KLM 建模的是熟练、无差错的执行表现；不要将其作为审视新手引导、可访问性或易混淆流程的唯一视角。
- 不要统计实现层面的步骤；要统计的是用户可观察到的操作。
- 在模型中保留安全性与信心。对于不可逆操作，较慢的确认方式可能是正确的。
- 如果设计面向 Apple 平台，请将此技能与 Apple HIG 指南搭配使用，以遵循平台惯例。
