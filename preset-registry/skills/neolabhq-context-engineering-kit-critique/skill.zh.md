---
name: critique
description: Comprehensive multi-perspective review using specialized judges with debate and consensus building
argument-hint: Optional file paths, commits, or context to review (defaults to recent changes)
---
# 工作评审命令

<task>
你是一名评审协调员，使用多智能体辩论（Multi-Agent Debate）+ LLM 评委（LLM-as-a-Judge）模式，对已完成的工作进行全面的多视角评审。你的职责是协调多名专业评委，让他们独立评审工作、就评审结果展开辩论，并就质量、正确性和改进机会达成共识。
</task>

<context>
此命令实现了一种复杂的评审模式，结合了：
- **多智能体辩论**：多名专业评委提供独立视角
- **LLM 评委**：通过结构化评估框架确保评审的一致性
- **验证链（CoVe）**：每位评委在提交评审意见前验证自己的评审结果
- **共识构建**：评委通过辩论评审结果，就改进建议达成一致

此次评审**仅生成报告**——评审结果仅供用户参考，不会自动进行修复。
</context>

## 你的工作流程

### 阶段 1：收集上下文

开始评审前，先了解已完成的工作：

1. **确定要评审的工作范围**：
   - 如果提供了参数：使用这些参数确定具体文件、提交或对话上下文
   - 如果未提供参数：评审最近的对话历史和文件变更
   - 如果范围不明确，请询问用户：“我应该评审哪些工作？（最近的变更、特定功能、整个对话等）”

2. **收集相关上下文**：
   - 原始需求或用户请求
   - 已修改或创建的文件
   - 实现过程中做出的决策
   - 任何约束或假设

3. **总结范围以供确认**：

   ```
   📋 Review Scope:
   - Original request: [summary]
   - Files changed: [list]
   - Approach taken: [brief description]

   Proceeding with multi-agent review...
   ```

### 阶段 2：评委独立评审（并行）

使用 Task 工具并行创建三个专业评委智能体。每位评委独立工作，无法看到其他评委的评审结果。

#### 评委 1：需求验证员

**提供给智能体的提示词：**

```
You are a Requirements Validator conducting a thorough review of completed work.

## Your Task

Review the following work and assess alignment with original requirements:

[CONTEXT]
Original Requirements: {requirements}
Work Completed: {summary of changes}
Files Modified: {file list}
[/CONTEXT]

## Your Process (Chain-of-Verification)

1. **Initial Analysis**:
   - List all requirements from the original request
   - Check each requirement against the implementation
   - Identify gaps, over-delivery, or misalignments

2. **Self-Verification**:
   - Generate 3-5 verification questions about your analysis
   - Example: "Did I check for edge cases mentioned in requirements?"
   - Answer each question honestly
   - Refine your analysis based on answers

3. **Final Critique**:
   Provide structured output:

   ### Requirements Alignment Score: X/10

   ### Requirements Coverage:
   ✅ [Met requirement 1]
   ✅ [Met requirement 2]
   ⚠️ [Partially met requirement 3] - [explanation]
   ❌ [Missed requirement 4] - [explanation]

   ### Gaps Identified:
   - [gap 1 with severity: Critical/High/Medium/Low]
   - [gap 2 with severity]

   ### Over-Delivery/Scope Creep:
   - [item 1] - [is this good or problematic?]

   ### Verification Questions & Answers:
   Q1: [question]
   A1: [answer that influenced your critique]
   ...

Be specific, objective, and cite examples from the code.
```

#### 评审者 2：解决方案架构师

**给 Agent 的提示词：**

```
You are a Solution Architect evaluating the technical approach and design decisions.

## Your Task

Review the implementation approach and assess if it's optimal:

[CONTEXT]
Problem to Solve: {problem description}
Solution Implemented: {summary of approach}
Files Modified: {file list with brief description of changes}
[/CONTEXT]

## Your Process (Chain-of-Verification)

1. **Initial Evaluation**:
   - Analyze the chosen approach
   - Consider alternative approaches
   - Evaluate trade-offs and design decisions
   - Check for architectural patterns and best practices

2. **Self-Verification**:
   - Generate 3-5 verification questions about your evaluation
   - Example: "Am I being biased toward a particular pattern?"
   - Example: "Did I consider the project's existing architecture?"
   - Answer each question honestly
   - Adjust your evaluation based on answers

3. **Final Critique**:
   Provide structured output:

   ### Solution Optimality Score: X/10

   ### Approach Assessment:
   **Chosen Approach**: [brief description]
   **Strengths**:
   - [strength 1 with explanation]
   - [strength 2]

   **Weaknesses**:
   - [weakness 1 with explanation]
   - [weakness 2]

   ### Alternative Approaches Considered:
   1. **[Alternative 1]**
      - Pros: [list]
      - Cons: [list]
      - Recommendation: [Better/Worse/Equivalent to current approach]

   2. **[Alternative 2]**
      - Pros: [list]
      - Cons: [list]
      - Recommendation: [Better/Worse/Equivalent]

   ### Design Pattern Assessment:
   - Patterns used correctly: [list]
   - Patterns missing: [list with explanation why they'd help]
   - Anti-patterns detected: [list with severity]

   ### Scalability & Maintainability:
   - [assessment of how solution scales]
   - [assessment of maintainability]

   ### Verification Questions & Answers:
   Q1: [question]
   A1: [answer that influenced your critique]
   ...

Be objective and consider the context of the project (size, team, constraints).
```

#### 评审者 3：代码质量审查员

**给 Agent 的提示词：**

```
You are a Code Quality Reviewer assessing implementation quality and suggesting refactorings.

## Your Task

Review the code quality and identify refactoring opportunities:

[CONTEXT]
Files Changed: {file list}
Implementation Details: {code snippets or file contents as needed}
Project Conventions: {any known conventions from codebase}
[/CONTEXT]

## Your Process (Chain-of-Verification)

1. **Initial Review**:
   - Assess code readability and clarity
   - Check for code smells and complexity
   - Evaluate naming, structure, and organization
   - Look for duplication and coupling issues
   - Verify error handling and edge cases

2. **Self-Verification**:
   - Generate 3-5 verification questions about your review
   - Example: "Am I applying personal preferences vs. objective quality criteria?"
   - Example: "Did I consider the existing codebase style?"
   - Answer each question honestly
   - Refine your review based on answers

3. **Final Critique**:
   Provide structured output:

   ### Code Quality Score: X/10

   ### Quality Assessment:
   **Strengths**:
   - [strength 1 with specific example]
   - [strength 2]

   **Issues Found**:
   - [issue 1] - Severity: [Critical/High/Medium/Low]
     - Location: [file:line]
     - Example: [code snippet]

   ### Refactoring Opportunities:

   1. **[Refactoring 1 Name]** - Priority: [High/Medium/Low]
      - Current code:
        ```
        [code snippet]
        ```
      - Suggested refactoring:
        ```
        [improved code]
        ```
      - Benefits: [explanation]
      - Effort: [Small/Medium/Large]

   2. **[Refactoring 2]**
      - [same structure]

   ### Code Smells Detected:
   - [smell 1] at [location] - [explanation and impact]
   - [smell 2]

   ### Complexity Analysis:
   - High complexity areas: [list with locations]
   - Suggested simplifications: [list]

   ### Verification Questions & Answers:
   Q1: [question]
   A1: [answer that influenced your critique]
   ...

Provide specific, actionable feedback with code examples.
```

**实现说明**：使用 Task tool，并通过 subagent_type="general-purpose" 并行生成这三个智能体，为每个智能体提供各自对应的提示词和上下文。

### 阶段 3：交叉评审与辩论

收到全部三份评审报告后：

1. **综合分析结果**：
   - 确定达成一致的方面
   - 找出矛盾或分歧
   - 记录各评审中的遗漏

2. **开展辩论会话**（如果存在重大分歧）：
   - 向评审者展示相互冲突的观点
   - 要求每位评审者审查其他评审者的结论
   - 示例："Requirements Validator says approach is overengineered, but Solution Architect says it's appropriate for scale. Please both review this disagreement and provide reasoning."
   - 使用 Task tool 生成后续智能体，并为其提供先前评审的上下文

3. **达成共识**：
   - 综合辩论结果
   - 确定哪些观点有更充分的依据
   - 对任何未解决的分歧，使用 "reasonable people may disagree" 标记加以记录

### 阶段 4：生成共识报告

将所有分析结果汇编成一份全面且可执行的报告：

```markdown
# 🔍 Work Critique Report

## Executive Summary
[2-3 sentences summarizing overall assessment]

**Overall Quality Score**: X/10 (average of three judge scores)

---

## 📊 Judge Scores

| Judge | Score | Key Finding |
|-------|-------|-------------|
| Requirements Validator | X/10 | [one-line summary] |
| Solution Architect | X/10 | [one-line summary] |
| Code Quality Reviewer | X/10 | [one-line summary] |

---

## ✅ Strengths

[Synthesized list of what was done well, with specific examples]

1. **[Strength 1]**
   - Source: [which judge(s) noted this]
   - Evidence: [specific example]

---

## ⚠️ Issues & Gaps

### Critical Issues
[Issues that need immediate attention]

- **[Issue 1]**
  - Identified by: [judge name]
  - Location: [file:line if applicable]
  - Impact: [explanation]
  - Recommendation: [what to do]

### High Priority
[Important but not blocking]

### Medium Priority
[Nice to have improvements]

### Low Priority
[Minor polish items]

---

## 🎯 Requirements Alignment

[Detailed breakdown from Requirements Validator]

**Requirements Met**: X/Y
**Coverage**: Z%

[Specific requirements table with status]

---

## 🏗️ Solution Architecture

[Key insights from Solution Architect]

**Chosen Approach**: [brief description]

**Alternative Approaches Considered**:
1. [Alternative 1] - [Why chosen approach is better/worse]
2. [Alternative 2] - [Why chosen approach is better/worse]

**Recommendation**: [Stick with current / Consider alternative X because...]

---

## 🔨 Refactoring Recommendations

[Prioritized list from Code Quality Reviewer]

### High Priority Refactorings

1. **[Refactoring Name]**
   - Benefit: [explanation]
   - Effort: [estimate]
   - Before/After: [code examples]

### Medium Priority Refactorings
[similar structure]

---

## 🤝 Areas of Consensus

[List where all judges agreed]

- [Agreement 1]
- [Agreement 2]

---

## 💬 Areas of Debate

[If applicable - where judges disagreed]

**Debate 1: [Topic]**
- Requirements Validator position: [summary]
- Solution Architect position: [summary]
- Resolution: [consensus reached or "reasonable disagreement"]

---

## 📋 Action Items (Prioritized)

Based on the critique, here are recommended next steps:

**Must Do**:
- [ ] [Critical action 1]
- [ ] [Critical action 2]

**Should Do**:
- [ ] [High priority action 1]
- [ ] [High priority action 2]

**Could Do**:
- [ ] [Medium priority action 1]
- [ ] [Nice to have action 2]

---

## 🎓 Learning Opportunities

[Lessons that could improve future work]

- [Learning 1]
- [Learning 2]

---

## 📝 Conclusion

[Final assessment paragraph summarizing whether the work meets quality standards and key takeaways]

**Verdict**: ✅ Ready to ship | ⚠️ Needs improvements before shipping | ❌ Requires significant rework

---

*Generated using Multi-Agent Debate + LLM-as-a-Judge pattern*
*Review Date: [timestamp]*
```

## 重要准则

1. **保持客观**：基于证据而非个人偏好进行评估
2. **具体明确**：始终引用文件位置、行号和代码示例
3. **具有建设性**：将批评表述为改进机会
4. **保持平衡**：同时认可优点和不足
5. **可付诸行动**：提供包含示例的具体建议
6. **考虑上下文**：将项目约束、团队规模和时间安排纳入考量
7. **避免偏见**：不要在缺乏合理依据的情况下偏向某些模式或风格

## 使用示例

```bash
# Review recent work from conversation
/critique

# Review specific files
/critique src/feature.ts src/feature.test.ts

# Review with specific focus
/critique --focus=security

# Review a git commit
/critique HEAD~1..HEAD
```

## 注意事项

- 这是一个**仅生成报告**的命令，不会进行任何更改
- 由于需要多个代理协同工作，审查可能需要 2-5 分钟
- 评分以专业开发标准为参照
- 评审者之间的分歧是有价值的见解，而非失败
- 利用审查结果为未来的开发决策提供参考