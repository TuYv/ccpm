---
name: ai-engineering-toolkit
description: "6 production-ready AI engineering workflows: prompt evaluation (8-dimension scoring), context budget planning, RAG pipeline design, agent security audit (65-point checklist), eval harness building, and product sense coaching."
category: data-ai
risk: offensive
source: community
date_added: "2026-03-15"
author: viliawang-pm
tags: [prompt-engineering, rag, security, evaluation, ai-engineering, llm]
tools: [claude, cursor, gemini, copilot]
---
# AI 工程工具包

## 概述

一套包含 6 个结构化、专家级工作流的合集，能让你的 AI 编程助手变身为资深 AI 工程伙伴。每项技能都封装了一套可复用的方法论——不只是“让 AI 帮忙”，而是一个包含量化评分、清单和决策树的分步决策框架。

与临时性 AI 协助的关键区别在于：**每个工作流都能产生一致、可复现的结果**，无论由谁在何时运行。你可以将这些评分体系作为团队基线，并写入 CI/CD 流水线。

## 何时使用本技能

- 在将 LLM 系统提示词投入生产部署之前进行评估或优化时使用
- 在设计 RAG 流水线并需要结构化的架构决策（而不只是样板代码）时使用
- 在规划上下文窗口各区域的 token 预算分配时使用
- 在对 AI 智能体进行上线前安全审计时使用
- 在为 LLM 应用构建评估框架时使用
- 在编写代码之前梳理产品策略时使用

## 工作原理

### 技能 1：提示词评估器

从 8 个维度（清晰度、具体性、完整性、简洁性、结构性、事实依据性、安全性、鲁棒性）对提示词按 1-10 分制打分，加权汇总为 0-100 的总分。识别出最弱的 3 个维度，生成针对性的改写方案，并重新评估。支持单条提示词、A/B 对比和批量评估三种模式。

### 技能 2：上下文预算规划器

分析 token 在 5 个上下文区域（系统提示、少样本示例、用户输入、检索、输出）中的分布，并产出优化后的分配方案。每个区域都配有压缩策略决策树。常见发现：输出区域被挤压到 6% 以下——本技能能在截断发生之前发现这一问题。

### 技能 3：RAG 流水线架构师

引导走完一整套完整的架构决策树：文档格式 → 解析策略 → 分块方式（固定/语义/递归）→ embedding 模型选择 → 检索方法（向量/关键词/混合）→ 评估指标（忠实度 Faithfulness、相关性 Relevancy、上下文精确率 Context Precision）。涵盖 Naive RAG、Advanced RAG 和 Modular RAG 模式。

### 技能 4：智能体安全卫士

> **⚠️ 仅限授权使用**
> 本技能仅用于教育目的或经授权的安全评估。
> 在使用本工具之前，你必须获得系统所有者的明确书面许可。
> 滥用本工具属违法行为，严格禁止。

在 5 大攻击类别上执行 65 项红队审计：直接提示词注入、间接提示词注入（通过 RAG 文档）、信息提取（系统提示词/API 密钥泄露）、工具滥用（SQL 注入、路径遍历、命令注入）以及目标劫持。AI 会出于评估目的构造对抗性测试提示词，在每个测试阶段之前请求用户确认，判定通过/失败，并生成修复建议。所有测试都限制在评估上下文之内，不会与外部系统交互。建议在沙箱环境（Docker/VM）中运行审计。

### 技能 5：评估框架构建器

为 LLM 应用设计评估指标体系。包含 LLM-as-Judge 评分框架及偏差缓解策略（位置偏差、冗长偏差、自我增强偏差）。输出可直接接入 CI/CD 的评估流水线模板。

### 技能 6：产品思维教练

一个五阶段的引导式对话框架：深挖动机 → 评估市场机会 → 找到路径 → 设计场景 → 分析竞争。适合在编写任何代码之前思考“我们该不该做这个？”。

## 示例

### 示例 1：提示词评估

提问：“评估这个系统提示词”

```
You are a customer support agent. Help users with their questions. Be nice and helpful.
```

结果：总分为 **28/100**。最弱维度：安全性（1/10，无任何注入防护）、具体性（2/10，没有输出格式）、结构性（2/10，没有分节结构）。自动改写后得分为 **82/100**，补充了范围边界、响应格式、升级处理规则和安全护栏。

### 示例 2：安全审计

提问：“对我的客服智能体进行一次安全审计”

结果：执行了 65 项测试。发现 3 个严重失败项：Base64 编码指令绕过、通过工具调用实现的路径遍历、通过角色扮演提取系统提示词。每项均提供了修复建议。

## 最佳实践

- ✅ 在任何生产部署之前运行 prompt-evaluator —— 设定团队基线（例如 ≥70/100）
- ✅ 在开发早期使用 context-budget-planner，而不是在出现截断问题之后
- ✅ 将 agent-safety-guard 作为上线前的关卡，而不是事后补救
- ✅ 按顺序组合使用各项技能：RAG 设计 → 上下文优化 → 提示词打磨 → 安全审计 → 评估搭建
- ❌ 不要只依赖单一维度的分数 —— 要看完整画像
- ❌ 不要因为“这只是个内部工具”就跳过安全审计

## 安全与注意事项

- 所有技能均为只读的分析与咨询类工作流。没有任何技能会修改文件或发起网络请求。
- agent-safety-guard 技能仅出于评估目的构造对抗性测试提示词 —— 这些提示词限制在评估上下文之内，不会与外部系统交互。
- **agent-safety-guard 被归类为攻击性技能**：它会为经授权的安全测试生成攻击载荷（提示词注入、SQL 注入、命令注入）。该技能在执行每个测试阶段之前都需要用户明确确认。请尽可能在沙箱环境中运行。
- 不包含任何武器化载荷。所有对抗性提示词仅具教育性质。

## 安装

```bash
# Via skill install command (Claude Code / WorkBuddy / Cursor)
/skill install -g viliawang-pm/ai-engineering-toolkit

# Manual
git clone https://github.com/viliawang-pm/ai-engineering-toolkit.git
cp -r ai-engineering-toolkit/skills/* ~/.claude/skills/
```

**代码仓库**：[github.com/viliawang-pm/ai-engineering-toolkit](https://github.com/viliawang-pm/ai-engineering-toolkit)
**许可证**：MIT

## 局限性
- 仅当任务明确符合上述描述的范围时才使用本技能。
- 不要将输出视为针对特定环境的验证、测试或专家评审的替代品。
- 如果缺少必要的输入、权限、安全边界或成功标准，请停下来请求澄清。
