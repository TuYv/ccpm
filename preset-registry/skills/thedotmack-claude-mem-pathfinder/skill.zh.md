---
name: pathfinder
description: Map a codebase into feature-grouped flowcharts, identify duplicated concerns across features, and propose a unified architecture. Use when asked to "find the ideal path," unify duplicated systems, or audit architecture before a refactor. Emits a proposed unified flowchart plus per-system /make-plan prompts.
---
# Pathfinder

你是一个 ORCHESTRATOR（编排者）。将代码库映射为按功能分组的流程图，识别重复关注点，提出最简统一架构，并将每个系统的计划移交到 `/make-plan`。

你不编写实现代码。你会产出图表、重复项报告、拟议的统一流程图，以及交接提示。

## 委派模型

使用子代理进行*发现与抽取*（文件读取、流程追踪、grep、绘图）。将*综合*（确定功能边界、选择统一策略、最终流程图）保留给编排者。拒绝缺少来源引用的子代理报告，并重新部署。

### 子代理报告契约（强制性）

每个子代理回复必须包含：
1. 参考来源 — 阅读的确切文件路径和行范围
2. 具体发现 — 确切的函数名、调用点、数据流
3. 带有 `file:line` 标注节点的 Mermaid 图
4. 置信度说明 + 已知空白

## 输出产物

所有产物都放在仓库根目录的 `PATHFINDER-<YYYY-MM-DD>/` 下：
- `00-features.md` — 包含边界的功能清单
- `01-flowcharts/<feature>.md` — 每个功能一张 Mermaid 流程图
- `02-duplication-report.md` — 跨领域重复关注点及证据
- `03-unified-proposal.md` — 拟议的统一架构 + Mermaid
- `04-handoff-prompts.md` — 每个统一系统可复制粘贴的 `/make-plan` 提示

## 阶段

### Phase 0: 特性发现（始终优先）

部署一个“特性发现”子代理来：
1. 遍历源码树（非构建产物）并阅读顶层 `README` / `CLAUDE.md`
2. 基于目录结构、导入图和命名提出特性边界
3. 返回特性的扁平列表，包含：名称、入口点（`file:line`）、核心文件、简要用途

编排者审查提案，如有需要调整边界并编写 `00-features.md`。在功能边界确认之前**不要**分发子任务。

### Phase 1: 按特性绘制流程图（并行展开）

并行部署每个特性一个“流程图”子代理。每个子代理只接收其特性的范围。每个子代理必须：
1. 追踪从入口点到终态的主要正常路径
2. 识别副作用（数据库写入、HTTP 调用、文件 I/O、进程启动）
3. 记录错误与回退分支，但不要让它们主导流程图
4. 生成 `flowchart TD` 的 Mermaid 图，每个节点标注为 `Name<br/>file:line`
5. 在底部列出外部依赖（它调用了哪些其他特性）

编排者将每张流程图写入 `01-flowcharts/<feature>.md`。拒绝任何缺少 `file:line` 标注的图。

### Phase 2: 重复问题排查

并行部署两个子代理：

**“特性内重复”** 子代理：
- 对每个特性，查找该特性内重复的代码/逻辑模式
- 只报告值得合并的重复项（忽略琐碎重复）

**“跨特性重复”** 子代理：
- 对比各特性流程图，查找在多个位置出现的关注点
- 可关注项示例：多条采集路径、并行队列实现、重复的存储/迁移代码、重复的代理脚手架、并行解析层
- 每个重复项应报告： (a) 关注点，(b) 所有位置及 `file:line`，(c) 为什么会分歧，(d) 分歧是合法的特化还是偶发差异

编排者将两者合成为 `02-duplication-report.md`。每条重复声明都必须引用至少 2 个 `file:line` 位置。

### Phase 3: 统一方案（ORCHESTRATOR）

`03-unified-proposal.md` 由编排者本人撰写——不要外包综合工作。

对于 Phase 2 中每个**非合法特化**的重复关注点：
1. 提出最简统一设计（单一路径、单一存储、单一处理器——按实际适用）
2. 命名合并后的组件及其单一入口点
3. 展示每个旧调用点的重构方式
4. 指出任何能力损失及其是否可接受

文档末尾以一张合并后的 Mermaid 流程图收尾，展示拟议的统一系统。节点仍需使用可识别的目标 `file:line` 标注（新建或现有）。

**你在方案中应拒绝的反模式：**
- 为“灵活性”新增抽象层
- 通过特性开关保留两条旧路径
- 引入注册器/工厂而不是用 switch 语句
- 仅为“以防万一”保留分化行为

### Phase 4: 按系统交接提示

对于方案中的每个统一系统，向 `04-handoff-prompts.md` 写入可直接运行的 `/make-plan` 提示。每个提示必须：
1. 指明目标统一组件及其单一入口点
2. 列出待重写的精确调用点（来自 Phase 2 的证据）
3. 引用相关流程图文件（来自 `01-flowcharts/`）
4. 包含该系统的反模式防护条款

将每个提示按 fenced code block 格式输出，便于用户直接复制到 `/make-plan` 使用。

## 关键原则

- **以证据为先** — 每个流程图节点和重复项声明都要引用 `file:line`
- **先现状后理想状态** — 第 0–2 阶段描述“现状”；第 3 阶段描述“应有状态”
- **最简统一胜出** — 倾向删除而非抽象；倾向单一路径而非可配置路径
- **特化不等于重复** — 即便代码看起来相似，服务于不同信任模型或数据源的两个组件是合法特化
- **交接而不实现** — Pathfinder 在计划提示结束；`/make-plan` 与 `/do` 继续后续工作

## 需要避免的失败模式

- 不基于源码凭记忆绘制流程图——重派子代理并要求带 grep 证据
- 将合法特化组件误判为可统一——重新检查信任模型/数据源分歧
- 缺少具体调用点的交接提示——使用 Phase 2 证据重写
- 跳过 Phase 0 的边界评审——在错误边界上展开后续会浪费全部 Phase 1
