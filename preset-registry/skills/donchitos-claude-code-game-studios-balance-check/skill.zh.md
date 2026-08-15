---
name: balance-check
description: "Analyzes game balance data files, formulas, and configuration to identify outliers, broken progressions, degenerate strategies, and economy imbalances. Use after modifying any balance-related data or design. Use when user says 'balance report', 'check game balance', 'run a balance check'."
argument-hint: "[system-name|path-to-data-file]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, AskUserQuestion
model: sonnet
agent: economy-designer
---
## 阶段 1：识别平衡性领域

根据 `$ARGUMENTS[0]` 确定平衡性领域：

- **战斗** → 武器/技能 DPS、击杀耗时、伤害类型交互
- **经济** → 资源产出/消耗、获取速率、物品定价
- **成长** → XP/战力曲线、空白期、战力突增
- **掉落** → 稀有度分布、保底机制、物品栏压力
- **给定文件路径** → 直接加载该文件，并根据内容推断领域

如果未提供参数，询问用户要检查哪个系统。

---

## 阶段 2：读取数据文件

针对识别出的领域，读取 `assets/data/` 和 `design/balance/` 中的相关文件。
记录读取的每个文件——它们将出现在报告的“数据来源”部分。

---

## 阶段 3：读取设计文档

从 `design/gdd/` 中读取该系统的 GDD，以了解预期设计目标、
调优参数以及预期值范围。这是判断行为是否“正确”的基准。

---

## 阶段 4：执行分析

运行特定领域的检查：

**战斗平衡性：**
- 计算每个战力层级下所有武器/技能的 DPS
- 检查每个层级的击杀耗时
- 识别任何全面优于其他选项的方案（严格占优）
- 检查防御选项是否会形成无法击杀的状态
- 验证伤害类型/抗性交互是否平衡

**经济平衡性：**
- 绘制所有资源产出和消耗及其流动速率
- 预测资源随时间的累积情况
- 检查是否存在无限资源循环
- 验证金币消耗是否随金币产出相应增长
- 检查是否存在任何永远不值得购买的物品

**成长平衡性：**
- 绘制 XP 曲线和战力曲线
- 检查空白期（长时间没有有意义的成长）
- 检查战力突增（能力突然跃升）
- 验证内容门槛是否与预期玩家战力相匹配
- 检查跳过/刷取策略是否会破坏预期节奏

**掉落平衡性：**
- 计算获取每个稀有度层级物品的预期耗时
- 检查保底机制的数学计算
- 验证任何阶段都不存在完全无用的掉落物
- 检查物品栏压力与获取速率是否匹配

---

## 阶段 5：输出分析结果

```
## Balance Check: [System Name]

### Data Sources Analyzed
- [List of files read]

### Health Summary: [HEALTHY / CONCERNS / CRITICAL ISSUES]

### Outliers Detected
| Item/Value | Expected Range | Actual | Issue |
|-----------|---------------|--------|-------|

### Degenerate Strategies Found
- [Strategy description and why it is problematic]

### Progression Analysis
[Graph description or table showing progression curve health]

### Recommendations
| Priority | Issue | Suggested Fix | Impact |
|----------|-------|--------------|--------|

### Values That Need Attention
[Specific values with suggested adjustments and rationale]
```

---

## 阶段 6：修复与验证循环

展示报告后，使用 `AskUserQuestion`：
- 提示：“平衡性检查已完成。接下来您想做什么？”
- 选项：
  - `[A] 立即修复最高优先级的问题——逐步指导我完成`
  - `[B] 将报告保存到 design/balance/balance-check-[system]-[date].md`
  - `[C] 到此为止——我会手动审查调查结果`

如果 [A]：
- 询问要先处理哪个问题（按优先级行引用“建议”表）
- 引导用户更新 `assets/data/` 中的相关数据文件或 `design/balance/` 中的公式
- 每次修复后，主动提出重新运行相关的平衡性检查，以验证是否引入了新的异常值
- 如果修复更改了 GDD 中定义或 ADR 中引用的调优参数，提醒用户：
  > “此值在设计文档中定义。提交前，请对受影响的 GDD 运行 `/propagate-design-change [path]`，以查找下游影响。”

如果 [B]：
- 将报告写入 `design/balance/balance-check-[system]-[date].md`（如果需要，请创建目录）。[date] 使用 YYYY-MM-DD 格式的当前日期。
- 确认文件已写入，然后以下句结尾：“修复后重新运行 `/balance-check` 以进行验证。”

如果 [C]：
- 总结尚未解决的问题，并以下句结尾：“修复后重新运行 `/balance-check` 以进行验证。”