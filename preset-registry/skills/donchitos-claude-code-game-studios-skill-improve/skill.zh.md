---
name: skill-improve
description: "Improve a skill using a test-fix-retest loop. Runs static checks, proposes targeted fixes, rewrites the skill, re-tests, and keeps or reverts based on score change."
argument-hint: "[skill-name]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Bash
model: sonnet
---
# Skill Improve

对单个技能运行改进循环：
测试 → 修复 → 重新测试 → 保留或还原。

---

## 阶段 1：解析参数

从第一个参数中读取技能名称。如果缺失，则输出用法并停止：

```
Usage: /skill-improve [skill-name]
Example: /skill-improve tech-debt
```

验证 `.claude/skills/[name]/SKILL.md` 是否存在。如果不存在，则停止并输出：
“未找到技能 '[name]'。”

---

## 阶段 2：基线测试

运行 `/skill-test static [name]` 并记录基线分数：
- FAIL 的数量
- WARN 的数量
- 具体哪些检查失败（Check 1–7）

向用户显示：
```
Static baseline:   [N] failures, [M] warnings
Failing: Check 4 (no ask-before-write), Check 5 (no handoff)
```

如果基线为 0 个 FAIL 和 0 个 WARN，请注明这一点，然后继续进入阶段 2b。

### 阶段 2b：类别基线

在 `CCGS Skill Testing Framework/catalog.yaml` 中查找该技能的 `category:` 字段。

如果未找到 `category:` 字段，则显示：
“类别：尚未分配 — 跳过类别检查。”
然后跳至阶段 3。

如果找到了类别，则运行 `/skill-test category [name]` 并记录类别基线：
- FAIL 的数量
- WARN 的数量
- 具体哪些类别评分指标失败

向用户显示：
```
Category baseline: [N] failures, [M] warnings  ([category] rubric)
```

如果静态基线和类别基线均为 0 个 FAIL 和 0 个 WARN，则停止：
“此技能已通过所有静态检查和类别检查。无需改进。”

---

## 阶段 3：诊断

读取 `.claude/skills/[name]/SKILL.md` 中的完整技能文件。

针对每个失败或发出警告的**静态**检查，确定具体缺口：

- **Check 1 失败** → 缺少哪个 frontmatter 字段
- **Check 2 失败** → 找到了多少个阶段，以及最低要求是多少
- **Check 3 失败** → 技能正文中完全没有裁定关键词
- **Check 4 失败** → allowed-tools 中包含 Write 或 Edit，但没有写入前询问的措辞
- **Check 5 警告** → 末尾没有后续操作或下一步部分
- **Check 6 警告** → 设置了 `context: fork`，但找到的阶段少于 5 个
- **Check 7 警告** → argument-hint 为空或与文档中说明的模式不匹配

针对每个失败或发出警告的**类别**检查（如果已在阶段 2b 中分配类别），
确定技能文本中的具体缺口。例如：
- 如果 G2 失败（门控模式，未生成全部指挥代理）：技能正文从未引用全部 4 个
  PHASE-GATE 指挥代理提示词
- 如果 A2 失败（创作模式，没有逐节询问是否可以写入）：技能只在末尾询问一次，而不是
  在写入每一节之前询问
- 如果 T3 失败（团队模式，未显式呈现 BLOCKED）：技能不会在代理受阻时暂停依赖于它的工作

在提出任何更改建议之前，向用户展示完整的综合诊断。

---

## 阶段 4：提出修复方案

针对每个失败和警告编写有针对性的修复方案。使用清晰标记的更改前/更改后区块
展示拟议更改。只更改失败的内容——不要重写已经通过检查的部分。

询问：“可以将这个改进后的版本写入 `.claude/skills/[name]/SKILL.md` 吗？”

如果用户拒绝，则在此停止。

---

## 阶段 5：写入并重新测试

记录技能文件的当前内容（以便需要时还原）。

将改进后的技能写入 `.claude/skills/[name]/SKILL.md`。

重新运行 `/skill-test static [name]` 并记录新的静态检查分数。
如果已分配类别，还需重新运行 `/skill-test category [name]` 并记录新的类别检查分数。

显示对比结果：
```
Static:   Before [N] failures, [M] warnings  →  After [N'] failures, [M'] warnings
Category: Before [N] failures, [M] warnings  →  After [N'] failures, [M'] warnings  (if applicable)
Combined change: improved / no change / worse
```

---

## 阶段 6：结论

计算合计失败总数：静态检查 FAIL 数 + 类别检查 FAIL 数 + 静态检查 WARN 数 + 类别检查 WARN 数。

**如果合计分数有所改善（合计失败数低于基线）：**
报告：“分数有所改善。保留更改。”
按各个维度汇总已修复的内容。

**如果合计分数不变或变差：**
报告：“合计分数没有改善。”
说明发生了哪些变化，以及这些变化可能未起作用的原因。
询问：“是否允许我使用 git checkout 还原 `.claude/skills/[name]/SKILL.md`？”
如果允许：运行 `git checkout -- .claude/skills/[name]/SKILL.md`

---

## 阶段 7：后续步骤

- 运行 `/skill-test static all`，查找下一个存在失败项的技能。
- 运行 `/skill-improve [next-name]`，继续对另一个技能执行此循环。
- 运行 `/skill-test audit`，查看总体覆盖进度。