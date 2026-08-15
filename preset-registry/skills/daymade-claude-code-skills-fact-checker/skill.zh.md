---
name: fact-checker
description: Verifies factual claims in documents using web search and official sources, then proposes corrections with user confirmation. Use when the user asks to fact-check, verify information, validate claims, check accuracy, or update outdated information in documents. Supports AI model specs, technical documentation, statistics, and general factual statements.
---
# 事实核查器

核实文档中的事实性声明，并依据权威来源提出更正建议。

## 何时使用

当用户提出以下请求时触发：
- “对这份文档进行事实核查”
- “核实这些 AI 模型规格”
- “检查这些信息是否仍然准确”
- “更新此文件中的过时数据”
- “验证本节中的声明”

## 工作流程

复制此检查清单以跟踪进度：

```
Fact-checking Progress:
- [ ] Step 1: Identify factual claims
- [ ] Step 2: Search authoritative sources
- [ ] Step 3: Compare claims against sources
- [ ] Step 4: Generate correction report
- [ ] Step 5: Apply corrections with user approval
```

### 第 1 步：识别事实性声明

扫描文档，找出可验证的陈述：

**目标声明类型：**
- 技术规格（上下文窗口、定价、功能）
- 版本号和发布日期
- 统计数据和指标
- API 功能和限制
- 基准测试分数和性能数据

**跳过主观内容：**
- 观点和建议
- 解释性文字
- 教程说明
- 架构讨论

### 第 2 步：搜索权威来源

针对每项声明，搜索官方来源：

**AI 模型：**
- 官方公告页面（anthropic.com/news、openai.com/index、blog.google）
- API 文档（platform.claude.com/docs、platform.openai.com/docs）
- 开发者指南和发布说明

**技术库：**
- 官方文档网站
- GitHub 仓库（发布版本、README）
- 软件包注册表（npm、PyPI、crates.io）

**一般性声明：**
- 学术论文和研究
- 政府统计数据
- 行业标准机构

**搜索策略：**
- 使用模型名称 + 规格（例如，“Claude Opus 4.5 context window”）
- 对近期信息加入当前年份
- 尽可能通过多个来源进行验证

### 第 3 步：将声明与来源进行比较

创建比较表：

| 文档中的声明 | 来源信息 | 状态 | 权威来源 |
|-------------------|-------------------|--------|---------------------|
| Claude 3.5 Sonnet：200K tokens | Claude Sonnet 4.5：200K tokens | ❌ 模型名称已过时 | platform.claude.com/docs |
| GPT-4o：128K tokens | GPT-5.2：400K tokens | ❌ 版本和规格不正确 | openai.com/index/gpt-5-2 |

**状态代码：**
- ✅ 准确——声明与来源一致
- ❌ 错误——声明与来源相矛盾
- ⚠️ 过时——声明曾经正确，但已被新信息取代
- ❓ 无法验证——未找到权威来源

### 第 4 步：生成更正报告

以结构化格式呈现核查结果：

```markdown
## Fact-Check Report

### Summary
- Total claims checked: X
- Accurate: Y
- Issues found: Z

### Issues Requiring Correction

#### Issue 1: Outdated AI Model Reference
**Location:** Line 77-80 in docs/file.md
**Current claim:** "Claude 3.5 Sonnet: 200K tokens"
**Correction:** "Claude Sonnet 4.5: 200K tokens"
**Source:** https://platform.claude.com/docs/en/build-with-claude/context-windows
**Rationale:** Claude 3.5 Sonnet has been superseded by Claude Sonnet 4.5 (released Sept 2025)

#### Issue 2: Incorrect Context Window
**Location:** Line 79 in docs/file.md
**Current claim:** "GPT-4o: 128K tokens"
**Correction:** "GPT-5.2: 400K tokens"
**Source:** https://openai.com/index/introducing-gpt-5-2/
**Rationale:** 128K was output limit; context window is 400K. Model also updated to GPT-5.2
```

### 步骤 5：经用户批准后应用更正

**进行更改之前：**

1. 向用户展示更正报告
2. 等待明确批准：“我是否应该应用这些更正？”
3. 仅在确认后继续

**应用更正时：**

```python
# Use Edit tool to update document
# Example:
Edit(
    file_path="docs/03-写作规范/AI辅助写书方法论.md",
    old_string="- Claude 3.5 Sonnet: 200K tokens（约 15 万汉字）",
    new_string="- Claude Sonnet 4.5: 200K tokens（约 15 万汉字）"
)
```

**更正后：**

1. 验证所有编辑是否均已成功应用
2. 记录更正摘要（例如，“已更新第 2.1 节中的 4 项陈述”）
3. 提醒用户提交更改

## 搜索最佳实践

### 查询构建

**良好的查询**（具体、具有时效性）：
- "Claude Opus 4.5 context window 2026"
- "GPT-5.2 official release announcement"
- "Gemini 3 Pro token limit specifications"

**不佳的查询**（模糊、宽泛）：
- "Claude context"
- "AI models"
- "Latest version"

### 来源评估

**优先选择官方来源：**
1. 产品官方网站（权威性最高）
2. API 文档
3. 官方博客公告
4. GitHub 发布记录（适用于开源项目）

**谨慎使用：**
- 第三方聚合网站（llm-stats.com 等）——需与官方来源核对
- 博客文章和其他文章——需交叉核实其中的陈述
- 社交媒体——仅用于获取公告，并需从其他来源核实

**避免使用：**
- 过时的文档
- 没有引用来源的非官方 Wiki
- 推测和传言

### 处理歧义

当来源相互冲突时：

1. 优先采用最新的官方文档
2. 在报告中注明差异
3. 向用户提供双方的来源
4. 如果事关重大，建议联系供应商

当找不到来源时：

1. 标记为 ❓ 无法验证
2. 建议采用替代表述：“根据 [Source] 截至 [Date] 的信息……”
3. 建议添加限定词：“大约”“据报道为”

## 特殊注意事项

### 时效性信息

始终包含时间背景：

**良好的更正：**
- “截至 2026 年 1 月”
- “Claude Sonnet 4.5（2025 年 9 月发布）”

**不佳的更正：**
- “最新版本”（会变得过时）
- “当前模型”（时间范围不明确）

### 数值精度

使用与来源一致的精度：

**来源表述：**“约 100 万个 token”
**应写为：**“1M tokens（约）”

**来源表述：**“200,000 token 上下文窗口”
**应写为：**“200K tokens”（精确值）

### 引用格式

在更正中包含引用：

```markdown
> **注**：具体上下文窗口以模型官方文档为准，本书写作时使用 Claude Sonnet 4.5 为主要工具。
```

尽可能链接到来源。

## 示例

### 示例 1：技术规格更新

**用户请求：**“对第 2.1 节中的 AI 模型上下文窗口进行事实核查”

**流程：**
1. 识别陈述：Claude 3.5 Sonnet（200K）、GPT-4o（128K）、Gemini 1.5 Pro（2M）
2. 在官方文档中搜索当前模型
3. 找到：Claude Sonnet 4.5、GPT-5.2、Gemini 3 Pro
4. 生成展示差异的报告
5. 经批准后应用更正

### 示例 2：统计数据验证

**用户请求：**“核实第 5 章中的基准测试分数”

**流程：**
1. 提取数值声明
2. 搜索官方基准测试出版物
3. 对比报告值与来源值
4. 标记所有差异并附上来源链接
5. 使用经核实的数据进行更新

### 示例 3：版本号验证

**用户请求：**“检查这些库版本是否仍为当前版本”

**流程：**
1. 列出提到的所有版本号
2. 检查软件包注册表（npm、PyPI 等）
3. 识别过时版本
4. 建议更新并附上变更日志引用
5. 在用户确认后更新

## 质量检查清单

完成事实核查前：

- [ ] 已识别所有事实性声明并进行分类
- [ ] 已根据官方来源核实每项声明
- [ ] 来源具有权威性且为最新
- [ ] 更正报告清晰且可执行
- [ ] 已在相关情况下包含时间背景
- [ ] 更改前已获得用户批准
- [ ] 已确认所有编辑均成功完成
- [ ] 已向用户提供摘要

## 限制

**此技能无法：**
- 核实主观意见或判断
- 访问付费墙后的来源或受限来源
- 判定争议性声明的“真相”
- 预测未来的规格或功能

**对于此类情况：**
- 在报告中注明限制
- 建议使用限定性措辞
- 建议用户自行研究或咨询专家

## 下一步：导出经核实的内容

事实核查后，建议导出经核实的文档：

```
Fact-check complete: [N] claims verified, [M] corrections proposed.

Options:
A) Export as PDF — run /daymade-docs:pdf-creator (Recommended for formal documents)
B) Create slides — run /daymade-docs:ppt-creator from verified content
C) No thanks — I'll use the corrected document directly
```