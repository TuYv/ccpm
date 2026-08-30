---
name: thought-based-reasoning
description: Use when tackling complex reasoning tasks requiring step-by-step logic, multi-step arithmetic, commonsense reasoning, symbolic manipulation, or problems where simple prompting fails - provides comprehensive guide to Chain-of-Thought and related prompting techniques (Zero-shot CoT, Self-Consistency, Tree of Thoughts, Least-to-Most, ReAct, PAL, Reflexion) with templates, decision matrices, and research-backed patterns
---
# 面向 LLM 的基于思维的推理技术

## 概述

思维链（CoT）提示及其变体鼓励 LLM 在得出最终答案之前生成中间推理步骤，从而显著提升其在复杂推理任务上的表现。这些技术通过将隐含推理显式化，改变模型处理问题的方式。


## 快速参考

| 技术 | 适用场景 | 复杂度 | 准确率提升 |
|-----------|-------------|------------|---------------|
| 零样本 CoT | 快速推理，没有可用示例 | 低 | +20-60% |
| 少样本 CoT | 有优秀示例，需要一致的格式 | 中 | +30-70% |
| 自洽性 | 高风险决策，需要置信度 | 中 | 比 CoT 高 +10-20% |
| 思维树 | 需要探索的复杂问题 | 高 | 在困难任务上 +50-70% |
| 从最少到最多 | 包含子问题的多步骤问题 | 中 | +30-80% |
| ReAct | 需要外部信息的任务 | 中 | +15-35% |
| PAL | 数学/计算问题 | 中 | +10-15% |
| 反思 | 迭代改进、从错误中学习 | 高 | +10-20% |

---

## 核心技术

### 1. 思维链（CoT）提示

**论文**：《思维链提示引发大型语言模型的推理》（Wei et al., 2022）  
**引用次数**：14,255+

#### 适用场景
- 多步骤算术或数学应用题
- 需要逻辑推导的常识推理
- 符号推理任务
- 拥有展示推理过程的优秀示例时

#### 工作原理
提供包含中间推理步骤的少样本示例，而不仅仅是问题-答案对。模型会学习生成类似的逐步推理过程。

#### 提示模板

```
Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?
A: Roger started with 5 balls. 2 cans of 3 tennis balls each is 6 tennis balls. 5 + 6 = 11. The answer is 11.

Q: The cafeteria had 23 apples. If they used 20 to make lunch and bought 6 more, how many apples do they have?
A: The cafeteria had 23 apples originally. They used 20 to make lunch. So they had 23 - 20 = 3. They bought 6 more apples, so they have 3 + 6 = 9. The answer is 9.

Q: [YOUR QUESTION HERE]
A:
```

#### 优势
- 显著提升推理任务的准确率
- 中间步骤具有可解释性
- 在大型模型（>100B 参数）上表现良好

#### 局限
- 需要精心设计优秀示例
- 在较小模型上效果较差
- 仍可能出现计算错误

---

### 2. 零样本思维链

**论文**：《大型语言模型是零样本推理器》（Kojima et al., 2022）  
**引用次数**：5,985+

#### 适用场景
- 没有可用示例
- 需要快速推理
- 跨任务类型的通用推理
- 在创建少样本示例之前进行原型设计

#### 工作原理
只需在提示末尾附加 "Let's think step by step"（或类似短语）。这会触发模型在没有任何示例的情况下生成推理步骤。

#### Prompt 模板

```
Q: A juggler can juggle 16 balls. Half of the balls are golf balls, and half of the golf balls are blue. How many blue golf balls are there?

Let's think step by step.
```

**替代触发短语**：
- "Let's work this out step by step to be sure we have the right answer."
- "Let's break this down."
- "Let's approach this systematically."
- "First, let me understand the problem..."

#### 两阶段方法（更稳健）

**阶段 1 - 推理提取**：
```
Q: [QUESTION]
A: Let's think step by step.
```

**阶段 2 - 答案提取**：
```
[REASONING FROM STAGE 1]
Therefore, the answer is
```

#### 优势
- 无需设计示例
- 可泛化到各种任务类型
- 实现简单

#### 局限性
- 效果不如少样本 CoT
- 可能生成冗长或不相关的推理
- 对确切措辞敏感

---

### 3. 自洽性

**论文**：《自洽性提升语言模型的思维链推理能力》（Wang 等，2022）
**引用次数**：5,379+

#### 适用场景
- 需要高置信度的高风险决策
- 存在多条有效推理路径的问题
- 需要降低输出方差时
- 验证推理的正确性

#### 工作原理
采样多条不同的推理路径，然后通过多数投票选择最一致的答案。其直觉是：正确答案可以通过多条推理路径得到。

#### Prompt 模板

```
[Use any CoT prompt - zero-shot or few-shot]

[Generate N samples with temperature > 0]

[Extract final answers from each sample]

[Return the most frequent answer (majority vote)]
```

#### 实现示例

```python
def self_consistency(prompt, n_samples=5, temperature=0.7):
    answers = []
    for _ in range(n_samples):
        response = llm.generate(prompt, temperature=temperature)
        answer = extract_answer(response)
        answers.append(answer)

    # Majority vote
    return Counter(answers).most_common(1)[0][0]
```

#### 优势
- 相比单路径 CoT，准确率有显著提升
- 提供置信度指标（一致程度）
- 与任务无关的改进

#### 局限性
- 计算成本更高（生成次数增加至 N 倍）
- 需要可提取的离散答案
- 超过约 10-20 个样本后，收益递减

---

### 4. 思维树（ToT）

**论文**：《思维树：使用大型语言模型进行审慎的问题求解》（Yao 等，2023）
**引用次数**：3,026+

#### 适用场景
- 需要探索/回溯的复杂问题
- 初始决策具有关键作用的任务
- 创意问题求解（写作、谜题）
- 仅使用 CoT 时准确率低于 50%

#### 工作原理
将 CoT 泛化为树结构，其中每个节点都是一个“思维”（连贯的语言单元）。使用搜索算法（BFS/DFS）结合自我评估来探索并选择有前景的推理路径。

#### Prompt 模板

**思维生成**：
```
Given the current state:
[STATE]

Generate 3-5 possible next steps to solve this problem.
```

**状态评估**：
```
评估以下部分解是否：
- “sure”（一定能得出解）
- “maybe”（可能可行）
- “impossible”（无法得出解）

部分解：
[目前为止的思考]
```

**BFS/DFS 搜索**：
```python
def tree_of_thoughts(problem, max_depth=3, beam_width=3):
    queue = [(problem, [])]  # (state, thought_path)

    while queue:
        state, path = queue.pop(0)

        if is_solved(state):
            return path

        # Generate candidate thoughts
        thoughts = generate_thoughts(state, k=5)

        # Evaluate and keep top-k
        evaluated = [(t, evaluate(state, t)) for t in thoughts]
        top_k = sorted(evaluated, key=lambda x: x[1])[:beam_width]

        for thought, score in top_k:
            if score != "impossible":
                new_state = apply_thought(state, thought)
                queue.append((new_state, path + [thought]))

    return None
```

#### 示例：24 点游戏

```
问题：使用 4、9、10、13 得到 24（使用 +、-、*、/，且每个数字只能使用一次）

思路 1：13 - 9 = 4（现在有：4、4、10）
评估：“maybe”——有两个 4 和一个 10，可能可行

思路 2：10 - 4 = 6（现在有：4、6、13）
评估：“maybe”——4 * 6 = 24，但还需要使用 13

思路 3：4 + 9 = 13（现在有：10、13、13）
评估：“impossible”——无法从这些数字得到 24
```

#### 优势
- 显著提升困难任务上的性能（在 24 点游戏中从 4% 提升至 74%）
- 支持回溯和探索
- 自我评估能够及早发现错误

#### 局限性
- 计算成本显著更高
- 需要针对任务进行思路分解
- 实现复杂

---

### 5. 从易到难提示

**论文**：“从易到难提示使大型语言模型能够进行复杂推理”（Zhou 等，2022）
**引用次数**：1,466+

#### 适用场景
- 难度高于示例的问题
- 组合泛化任务
- 具有明确子问题的多步骤问题
- 符号操作和类似 SCAN 的任务

#### 工作原理
分为两个阶段：
1. **分解**：将复杂问题拆分为更简单的子问题
2. **依次求解**：按顺序解决子问题，并使用之前的答案

#### 提示模板

**阶段 1：分解**
```
Q: 四年前，Kody 的年龄只有 Mohamed 的一半。如果 Mohamed 目前是 30 岁的两倍，那么 Kody 多大？

要解决“四年前，Kody 的年龄只有 Mohamed 的一半。如果 Mohamed 目前是 30 岁的两倍，那么 Kody 多大？”，我们首先需要解决：
- “如果 Mohamed 目前是 30 岁的两倍，那么 Mohamed 多大？”
然后我们需要解决：
- “四年前，Kody 的年龄只有 Mohamed 的一半。Kody 多大？”
```

**阶段 2：依次求解**
```
Q: 如果 Mohamed 目前是 30 岁的两倍，那么 Mohamed 多大？
A: Mohamed 是 30 的两倍，所以 Mohamed 的年龄是 30 * 2 = 60 岁。

Q: 四年前，Kody 的年龄只有 Mohamed 的一半。Mohamed 现在 60 岁。Kody 多大？
A: 四年前，Mohamed 的年龄是 60 - 4 = 56 岁。Kody 的年龄是其一半，因此四年前 Kody 是 56 / 2 = 28 岁。所以 Kody 目前是 28 + 4 = 32 岁。

答案是 32。
```

#### 优势
- 擅长泛化到更困难的问题
- 在组合任务上表现良好
- 明确的问题分解有助于可解释性

#### 局限性
- 需要两阶段提示
- 分解步骤可能无法处理新颖结构
- 设置比单阶段 CoT 更复杂

---

### 6. ReAct（推理 + 行动）

**论文**：“ReAct：在语言模型中协同推理与行动”（Yao 等，2022）
**引用次数**：5,012+

#### 使用场景
- 需要外部信息的任务（搜索、API）
- 交互式决策环境
- 多跳问答
- 纯推理容易导致幻觉时

#### 工作原理
将推理轨迹（“Thought”）与行动（“Action”）及观察结果（“Observation”）交错进行。推理有助于规划行动；行动则为推理提供新信息。

#### 提示模板

```
Question: What is the elevation range for the area that the eastern sector of the Colorado orogeny extends into?

Thought 1: I need to search Colorado orogeny, find the area that the eastern sector extends into, then find the elevation range of that area.
Action 1: Search[Colorado orogeny]
Observation 1: The Colorado orogeny was an episode of mountain building (an orogeny) in Colorado and surrounding areas.

Thought 2: It does not mention the eastern sector. So I need to look up eastern sector.
Action 2: Lookup[eastern sector]
Observation 2: The eastern sector extends into the High Plains.

Thought 3: The eastern sector extends into the High Plains. I need to search High Plains and find its elevation range.
Action 3: Search[High Plains]
Observation 3: High Plains refers to one of two distinct land regions: High Plains (United States)...

Thought 4: I need to search High Plains (United States).
Action 4: Search[High Plains (United States)]
Observation 4: The High Plains are a subregion of the Great Plains... elevation of around 1,800 to 7,000 ft (550 to 2,130 m).

Thought 5: The elevation range is 1,800 to 7,000 ft.
Action 5: Finish[1,800 to 7,000 ft]
```

#### 行动类型
- `Search[query]` - 搜索信息
- `Lookup[keyword]` - 在当前上下文中查找关键词
- `Finish[answer]` - 返回最终答案

#### 优势
- 通过基于外部知识减少幻觉
- 可解释的行动轨迹
- 通过自适应推理处理异常情况

#### 局限性
- 需要与外部工具集成
- 编排更加复杂
- 必须定义行动空间

---

### 7. PAL（程序辅助语言模型）

**论文**：“PAL：程序辅助语言模型”（Gao 等，2022）
**引用次数**：608+

#### 使用场景
- 数学/算术推理
- 需要精确计算的问题
- 符号操作
- CoT 容易出现计算错误时

#### 工作原理
生成代码（通常是 Python），而不是使用自然语言进行推理。执行代码以获得答案。LLM 负责处理分解；解释器负责计算。

#### 提示模板

```
Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?

# solution in Python:
def solution():
    """Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?"""
    tennis_balls_initial = 5
    bought_cans = 2
    tennis_balls_per_can = 3
    tennis_balls_bought = bought_cans * tennis_balls_per_can
    tennis_balls_total = tennis_balls_initial + tennis_balls_bought
    return tennis_balls_total

Q: The bakers at the Beverly Hills Bakery baked 200 loaves of bread on Monday morning. They sold 93 loaves in the morning and 39 loaves in the afternoon. A grocery store returned 6 unsold loaves. How many loaves of bread did they have left?

# solution in Python:
def solution():
    """The bakers baked 200 loaves. They sold 93 in morning, 39 in afternoon. A store returned 6. How many left?"""
    loaves_baked = 200
    loaves_sold_morning = 93
    loaves_sold_afternoon = 39
    loaves_returned = 6
    loaves_left = loaves_baked - loaves_sold_morning - loaves_sold_afternoon + loaves_returned
    return loaves_left
```

#### 优势
- 消除算术错误
- 清晰的变量命名有助于理解
- 利用代码执行进行验证

#### 局限性
- 需要代码解释器
- 不适用于非计算类推理
- 模型必须生成语法正确的代码

---

### 8. Auto-CoT

**论文**：“大型语言模型中的自动思维链提示”（Zhang 等，2022）
**引用次数**：838+

#### 适用场景
- 没有手动编写的示例
- 希望自动化少样本 CoT 设置
- 将 CoT 扩展到许多任务
- 零样本 CoT 不够充分时

#### 工作原理
1. 按多样性对问题进行聚类
2. 使用 Zero-shot CoT 为代表性问题生成推理链
3. 将这些自动生成的推理链用作少样本示例

#### 提示模板

**步骤 1：生成多样化示例**
```python
# Cluster questions
clusters = cluster_questions(all_questions, k=8)

# For each cluster, pick representative and generate CoT
demonstrations = []
for cluster in clusters:
    question = select_representative(cluster)
    reasoning = zero_shot_cot(question)  # "Let's think step by step"
    demonstrations.append((question, reasoning))
```

**步骤 2：用作少样本示例**
```
Q: [Demo question 1]
A: Let's think step by step. [Generated reasoning 1]

Q: [Demo question 2]
A: Let's think step by step. [Generated reasoning 2]

...

Q: [New question]
A: Let's think step by step.
```

#### 优势
- 无需手动创建示例
- 多样性采样提升稳健性
- 达到与手动 CoT 相当的性能

#### 局限性
- 质量取决于零样本 CoT 的质量
- 聚类需要相似度指标
- 某些生成的推理链包含错误

---

### 9. Reflexion

**论文**：“Reflexion：通过语言强化学习实现的语言智能体”（Shinn 等，2023）
**引用次数**：2,179+

#### 适用场景
- 需要在多次尝试中迭代改进
- 无需微调即可从错误中学习
- 复杂的编码或决策任务
- 单次推理不足以完成任务时

#### 工作原理
任务失败后，智能体会生成一段分析出错原因的文字“反思”。该反思会被存储在记忆中，并用于后续尝试，以避免重复犯错。

#### 提示模板

**初次尝试**：
```
Task: [TASK DESCRIPTION]

Thought: [REASONING]
Action: [ACTION]
...
Result: [FAILURE/PARTIAL SUCCESS]
```

**反思**：
```
The previous attempt failed because:
1. [SPECIFIC ERROR ANALYSIS]
2. [WHAT SHOULD HAVE BEEN DONE]
3. [KEY INSIGHT FOR NEXT ATTEMPT]

Reflection: In the next attempt, I should...
```

**后续尝试（带记忆）**：
```
Task: [TASK DESCRIPTION]

Previous reflections:
- [REFLECTION 1]
- [REFLECTION 2]

Using these insights, I will now attempt the task again.

Thought: [IMPROVED REASONING]
Action: [BETTER ACTION]
```

#### 示例：代码生成

```
Task: Write a function to find the longest palindromic substring.

Attempt 1: [CODE WITH BUG]
Test Result: Failed on "babad" - expected "bab" or "aba", got "b"

Reflection: My solution only checked single characters. I need to:
1. Consider substrings of all lengths
2. Use expand-around-center technique for efficiency
3. Track both start position and maximum length

Attempt 2: [IMPROVED CODE USING REFLECTION]
Test Result: Passed all tests
```

#### 优势
- 无需更新权重即可从错误中学习
- 在 HumanEval 上达到 91%（超过 GPT-4 的 80%）
- 构建对洞见的情景记忆

#### 局限性
- 需要多次尝试
- 长会话中的记忆管理
- 反思质量会影响改进效果

---

## 决策矩阵：应使用哪种技术

```
                           Need Examples?
                          /              \
                        No                Yes
                        |                  |
                Zero-shot CoT          Few-shot CoT
                        |                  |
                Need higher accuracy?  Need computation?
                /                \           |
              Yes               No          PAL
               |                |
    Self-Consistency    Done with CoT
               |
        Still not enough?
        /              \
      Yes              No
       |                |
  Problem decomposable?  Done
  /                    \
Yes                    No
 |                      |
Least-to-Most     Need exploration?
                  /              \
                Yes              No
                 |                |
          Tree of Thoughts   Need external info?
                             /              \
                           Yes              No
                            |                |
                          ReAct         Need iteration?
                                        /           \
                                      Yes           No
                                       |             |
                                   Reflexion      Use CoT
```

---

## 最佳实践

### 1. 从简单开始
先从 Zero-shot CoT（“让我们一步一步地思考”）开始；如有需要，再逐步使用更复杂的技术。

### 2. 让技术匹配任务
- **数学/逻辑**：CoT、PAL、Self-Consistency
- **多跳问答**：ReAct、Least-to-Most
- **创意/谜题**：Tree of Thoughts
- **迭代任务**：Reflexion

### 3. 组合使用技术
技术通常可以互相补充：
- ReAct + Self-Consistency，用于获得稳健的事实性答案
- ToT + PAL，用于复杂的计算探索
- Least-to-Most + Reflexion，用于困难的多步问题

### 4. 提示工程技巧
- 使用清晰的步骤标记（“步骤 1：”“首先，”等）
- 包含涵盖边界情况的多样化示例
- 在示例之间保持格式一致
- 添加验证步骤（“让我验证一下……”）

---

## 常见错误

| 错误 | 为什么不对 | 修复方法 |
|---------|---------------|-----|
| 对简单查询使用 CoT | 增加了不必要的 token 和延迟 | 仅在需要多步推理时使用 |
| Self-Consistency 中的样本过少 | 多数投票需要足够的样本 | 至少使用 5-10 个样本 |
| 使用泛泛的“让我们一步一步地思考”，却不检查输出 | 模型可能生成无关的推理 | 验证推理质量，而不只是检查是否存在推理过程 |
| 不理解权衡就混用技术 | 增加了计算成本，却没有带来收益 | 了解每种技术在何时能够增加价值 |
| 没有代码解释器却使用 PAL | 没有执行，代码生成就毫无用处 | 确保执行环境可用 |
| 不测试 few-shot CoT 中示例的质量 | 糟糕的示例会导致糟糕的推理 | 验证示例能够正确解决问题 |
| 对线性问题应用 Tree of Thoughts | 没有收益，却产生了巨大的额外开销 | 仅在需要探索时使用 ToT |

---

## 参考文献

1. Wei, J. 等（2022）。“思维链提示促使大型语言模型进行推理。” [arXiv:2201.11903](https://arxiv.org/abs/2201.11903)

2. Kojima, T. 等（2022）。“大型语言模型是零样本推理器。” [arXiv:2205.11916](https://arxiv.org/abs/2205.11916)

3. Wang, X. 等（2022）。“自洽性提升语言模型中的思维链推理能力。” [arXiv:2203.11171](https://arxiv.org/abs/2203.11171)

4. Yao, S. 等（2023）。“思维树：利用大型语言模型进行审慎的问题求解。” [arXiv:2305.10601](https://arxiv.org/abs/2305.10601)

5. Zhou, D. 等（2022）。“由易到难的提示使大型语言模型能够进行复杂推理。” [arXiv:2205.10625](https://arxiv.org/abs/2205.10625)

6. Yao, S. 等（2022）。“ReAct：协同语言模型中的推理与行动。” [arXiv:2210.03629](https://arxiv.org/abs/2210.03629)

7. Gao, L. 等（2022）。“PAL：程序辅助语言模型。” [arXiv:2211.10435](https://arxiv.org/abs/2211.10435)

8. Zhang, Z. 等（2022）。“大型语言模型中的自动思维链提示。” [arXiv:2210.03493](https://arxiv.org/abs/2210.03493)

9. Shinn, N. 等（2023）。“Reflexion：采用语言强化学习的语言智能体。” [arXiv:2303.11366](https://arxiv.org/abs/2303.11366)