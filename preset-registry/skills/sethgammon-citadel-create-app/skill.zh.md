---
name: create-app
license: MIT
description: >-
  End-to-end app creation from a single description. Five tiers: blank project,
  guided, templated, fully generated, or feature addition to existing codebase.
  Routes through PRD, architecture, and Archon campaign with verification at every step.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - create app
  - build app
  - build me
  - make an app
  - new app
  - generate app
  - add auth
  - add payments
  - integrate
effort: max
---
# /create-app — 从描述到经过验证的应用

## 概述

**使用场景：** 从零开始构建一个新应用——基于单段描述完成完整的脚手架、设计系统和功能集。
**不适用场景：** 为现有应用添加功能（请使用 /marshal 或 /archon）；生成单个组件（请使用 /scaffold）。

## 层级判定

当用户想要创建应用、添加功能或为项目搭建脚手架时使用。将输入归类为以下五个层级之一：

### 层级 1：空白项目
- 触发条件：“创建一个空白项目”、“新项目”、“搭建脚手架”
- 操作：运行 /scaffold 并进行技术栈检测。不产出 PRD，不做架构设计。

### 层级 2：引导式
- 触发条件：“我想构建……”、“帮我创建……”、带有疑问的描述
- 操作：/prd → 用户批准 → /architect → 用户批准 → /archon
- 人工检查点：PRD 之后、架构之后、每个主要阶段之前。

### 层级 3：模板式
- 触发条件：描述一种广为人知的应用类型（“一个待办事项应用”、“一个博客”、“一个带身份验证的仪表盘”）
- 操作：如可用则加载模板 PRD → 使用模板默认值运行 /architect → /archon
- 模板检测：检查 `.planning/_templates/app-types/` 中是否有匹配的模板。如果没有匹配的模板，则回落到层级 2。

### 层级 4：生成式（完全自主）
- 触发条件：“帮我构建[详细描述]”、“创建[应用]并部署”
- 操作：/prd（最少提问）→ /architect（置信度高时自动批准）→ 带自我纠正循环的 /archon
- 人工检查点：仅在 PRD 之后。架构与执行均为自主进行。
- 安全机制：启用全部 Archon 自我纠正机制。每 2 个阶段进行一次方向对齐。每个阶段进行质量抽查。熔断器已启用。

### 层级 5：功能添加（现有代码库）
- 触发条件：现有项目 + 功能描述（“添加身份验证”、“添加一个仪表盘”、“添加深色模式”）
- 检测：项目包含源文件（src/、app/、lib/、带依赖的 package.json），且描述的是一个功能而非独立应用
- 操作：以功能模式运行 /prd → 以现有代码库模式运行 /architect → /archon
- 与全新项目层级的关键差异：
  - PRD 在提问之前先阅读现有代码库
  - 架构描述的是对现有文件的更改，而非一套独立系统
  - 阶段 0 始终为“基线”——记录当前类型检查/测试状态
  - 每个阶段的结束条件都包含“无新增类型检查错误”+“现有测试通过”
  - 风险登记册始终包含“现有功能回归”
- 人工检查点：功能规格（PRD）之后。如果功能范围界定清晰且所有条件均可机器验证，架构可以自动批准。

### 层级分类

| 输入模式 | 层级 |
|---|---|
| “空白项目”、“搭建脚手架”、“新建空白” | 1 |
| “帮我构建”、“我想创建”、“引导我” | 2 |
| “待办事项应用”、“博客”、“仪表盘”等广为人知的应用类型 | 3 |
| “帮我构建[详细描述]”、“创建[应用]”、明确自信的描述 | 4 |
| “添加[功能]”、“实现[功能]”、现有项目 + 功能描述 | 5 |
| 含糊不清 | 默认为层级 2（最安全） |

## 流程

### 第 1 步：分类

阅读用户输入。判定层级。用通俗易懂的语言宣布你接下来要做什么——不要报层级编号。如果分类有误，接受用户的覆盖指令（“直接搭脚手架” → 层级 1，“直接构建” → 层级 4）。

### 第 2 步：执行对应层级

**层级 1：** 调用 /scaffold。完成。

**层级 2：** /prd → 用户批准 → /architect → 用户批准 → Archon 战役 → 每个主要阶段结束后向用户简要汇报。

**层级 3：** 检查 `.planning/_templates/app-types/` 中的模板 → 展示 PRD，询问是否需要修改 → 使用模板默认值运行 /architect → Archon 战役。

**层级 4：**
1. /prd 快速模式（0-1 个问题）
2. 用户批准 PRD（唯一强制检查点）
3. /architect（若所有结束条件均可机器验证则自动批准）
4. 启用全部安全系统的 Archon 战役：
   - 每 2 个阶段进行一次方向对齐，每个阶段进行质量抽查
   - 熔断器：3 次失败 = 采用新方法，5 个以上类型错误 = 搁置
5. 自主执行，直至完成或被搁置
6. 对所有 PRD 结束条件进行全面验证，并呈现结果

**层级 5（功能添加）：**
1. 阅读现有代码库——文件树、package.json、关键入口点、现有模式
2. 以功能模式运行 /prd（最多 2 个问题）
3. 用户批准功能规格（一个强制检查点）
4. 以现有代码库模式运行 /architect——阶段 0 始终为“基线”（运行类型检查 + 测试，记录数量）。若可机器验证则自动批准。
5. Archon 战役——每个阶段的结束条件都包含“相较基线无新增类型检查错误”和“现有测试通过”
6. 完成时：验证所有功能结束条件 + 基线回归检查，并呈现结果

### 第 3 步：验证（除层级 1 外的所有层级）

逐条检查 PRD 结束条件（运行命令、检查文件、调用 /live-preview 进行可视化检查）。以 PASS / PARTIAL / FAIL 报告结果，并附具体细节。

### 第 4 步：交付

呈现以下内容：构建了什么、验证了什么、哪些需要关注、如何运行，以及建议的下一步（例如 /postmortem 或部署命令）。

## 质量关卡

- 在编写任何代码之前，PRD 已存在并已获得批准
- 在 Archon 启动之前，架构已存在
- 战役的每个阶段都有可机器验证的结束条件
- 最终验证检查所有 PRD 结束条件
- 用户会收到一份清晰的报告，说明构建了什么以及哪些需要关注

## 边缘情况

**需求含糊：** 默认采用层级 2，并在产出 PRD 之前先提出澄清问题。

**项目已初始化：** 存在源文件（src/、app/、带依赖的 package.json）→ 自动归类为层级 5。不要在现有项目之上覆盖搭建脚手架。

**如果 .planning/ 不存在：** /prd 和 /architect 会创建它。若无法创建，则以内联方式呈现，并请用户先运行 `/do setup`。

**层级误判：** 用户纠正后立即切换，无需重新读取输入。

## 退出流程

战役完成且验证运行之后，输出：

```
---HANDOFF---
- App: {name}
- Built: {feature ledger summary}
- Verified: {N}/{total} end conditions passed
- Status: {complete | partial | failed}
- To run: {start command}
- Next: {suggested next step, e.g., /postmortem or deploy command}
- Reversibility: amber -- multi-tier creation, revert the creation commits
---
```
