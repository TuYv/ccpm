---
name: ln-71-system-design-baseline-builder
description: "Creates a project baseline of architecture drivers and constraints. Use before design or planning; not for target design, plan review, implementation, or architecture audit."
---
# 系统设计基线构建器

**目标：** 为项目的架构驱动型需求和约束创建或更新一个持久的唯一事实来源。只修改经过批准的架构文档；不要设计解决方案、评审计划、审计实现、编辑产品代码或臆造缺失的目标。

**执行契约：** 将以下有序复选框工作流视为此技能的完成定义。将每个复选框标记为 `PENDING`，然后使用具体证据将其解决为 `PROVEN`，使用表明其条件触发器不存在的证据将其解决为 `CLEARED`，或解决为 `UNPROVEN`；阅读、提及、委派、跳过或工具失败都不构成证明。
返回前，解决所有 `PENDING`，仅将 `PROVEN` 和 `CLEARED` 项计为完成，根据此技能的判定、决策和批准规则处理每个 `UNPROVEN`，并在开头添加 **Checklist: X/Y complete**<br>**Incomplete: None | section/item — reason; outcome impact; exact next action**；列出每一项 `UNPROVEN`。

## 工具路由

| 需求 | 首选能力 | 备用方案 |
|---|---|---|
| 仓库规则和文档约定 | 原生文件读取加定向搜索 | 用户提供的约定，并明确说明限制 |
| 现有需求和架构产物 | 窄范围仓库搜索和直接读取 | 标明来源的对话证据 |
| 当前工作负载或服务证据 | 指标、仪表板、日志、清单或已提交的报告 | 标记为 `UNKNOWN`；绝不编造生产数据 |
| 当前外部限制或标准 | 官方文档或规范 | 将该声明标记为 `UNVERIFIED` |
| 文档变更 | 对经过批准的 Markdown 产物进行最小化补丁修改 | 如果没有获得授权的安全可写路径，则返回 `BLOCKED` |

仅当时效性事实会改变约束时，才使用外部研究。不要为那些必须来自产品负责人、运营人员、仓库或测量所得工作负载的数值进行浏览查询。

## 产物规则

- 优先使用现有且明确无歧义的架构需求文档。
- 否则使用 `docs/architecture/system-design-baseline.md`。
- 写入前先读取，保留无关内容，并在原位置更新事实，而不是创建并行事实来源。
- 分别将适用性分类为 `APPLICABLE` 或 `NOT_APPLICABLE`，并为排除项提供证据。
- 将每个适用项分别分级为 `DRIVER`、`SUPPORTING` 或 `INFORMATIONAL`。
- 分别将证据分类为 `CONFIRMED`、`ASSUMED` 或 `UNKNOWN`。
- 为每个架构驱动因素记录来源、负责人、确认日期和复审触发条件。
- 区分当前观测值、必需目标、硬性限制和未来演进触发条件。
- 使用可度量的质量属性场景；避免在没有响应度量的情况下使用“快速”“可扩展”或“安全”等词语。
- 将基线视为有版本的项目知识，而不是不可变的承诺。

## 检查清单

### 1. 确定范围和目标位置

- [ ] 确定项目、业务成果、目标读者、获批准的文档范围和语言。
- [ ] 阅读适用的仓库说明并检查 Git 状态，以确保不触及无关变更。
- [ ] 搜索现有的需求、架构、SLO、恢复、安全、成本和归属文档。
- [ ] 选择一个规范产物：复用明确的等价文档，或选择默认路径；说明为何不会创建重复文档。
- [ ] 如果目标位置存在歧义，且选择其中一个可能导致项目事实来源分裂，则返回 `BLOCKED`。

### 2. 构建证据台账

- [ ] 提取已确认的业务目标、参与者、关键旅程、范围、非目标以及决策时间范围。
- [ ] 记录当前工作负载、数据量、服务行为、平台限制和现有承诺的来源。
- [ ] 区分仓库事实、利益相关者选择和估算。
- [ ] 检测文档、代码、配置和已声明需求之间的矛盾；在解决之前保留双方的说法。
- [ ] 仅针对缺失后会实质性改变架构的选择提问；将其他所有缺口标记为 `UNKNOWN`。

### 3. 定义并确定架构驱动因素的优先级

- [ ] **业务和范围：** 记录参与者、关键旅程、业务时间范围、范围、非目标以及外部承诺的结果。
- [ ] **需求和数据规模：** 在相关情况下，记录当前用户数和目标用户数、速率、并发量、负载、增长、保留期限以及预测时间范围。
- [ ] **用户可感知的服务质量：** 为可用性、延迟、吞吐量、错误率、正确性或新鲜度定义带有度量窗口的 SLI 和 SLO。
- [ ] **数据语义和恢复：** 在受影响的边界定义一致性、顺序、幂等性、对账、持久性、备份、RTO、RPO 以及可接受的数据丢失。
- [ ] **安全、隐私和合规：** 定义信任边界、数据分类、驻留要求、访问权限、审计以及破坏性操作约束。
- [ ] **运维和经济性：** 定义所有权、运维能力、成本范围、支持的区域、交付节奏以及平台或供应商限制。
- [ ] **演进：** 记录能够证明应重新审视某项假设、目标或延期能力的阈值、业务事件或证据。
- [ ] 区分适用性、关键性和证据状态；不要使用 `UNKNOWN` 表示不重要或 `NOT_APPLICABLE`。
- [ ] 优先考虑最可能影响架构的少数场景，并将每个场景表达为来源/刺激/环境/制品/响应/度量。

### 4. 编写基线

- [ ] 创建或更新包含以下内容的制品：标识和状态；业务背景；范围和非目标；关键场景；工作负载和数据；质量目标；恢复；一致性；安全；成本和运维；约束；假设和未知项；评审触发条件。
- [ ] 为每个重要参数提供其主题、适用性、关键性、证据状态、值或范围、来源、负责人、截至日期和评审触发条件。
- [ ] 确保计算可复现，并将估算与观测数据分开标注。
- [ ] 仅通过仓库路径或文档标题链接共享的架构制品；绝不要要求特定的工作流或工具。
- [ ] 保留理解变更需求所需的历史背景，而不是默默改写之前的承诺。

### 5. 验证并报告

- [ ] 重新阅读已编写的制品，并确认没有将任何未知项转换为确定事实。
- [ ] 检查目标是否可度量、内部一致，并与有证据支持的业务时间范围相称。
- [ ] 检查每个架构关键缺口是否都有负责人或明确的下一步证据行动。
- [ ] 确认没有修改产品代码、测试、无关文档或外部系统。
- [ ] 仅当基线可用于决策，且没有任何重要未知项缺少安全处置规则时，才使用 `READY`；对于包含具有后果的开放驱动因素但仍有实用价值的制品，使用 `INCOMPLETE`；当范围、权限或目标位置阻碍安全创建时，使用 `BLOCKED`。

## 输出契约

```markdown
# System Design Baseline

**Verdict:** READY | INCOMPLETE | BLOCKED
**Artifact:** path

## Established drivers
- Prioritized architecture-driving scenarios
- Applicable business, demand, quality, data, security, operational, economic, and evolution constraints

## Driver register
| Theme | Parameter | Applicability | Criticality | Evidence status | Value or measure | Source and owner | Review trigger |
|---|---|---|---|---|---|---|---|

## Changes made
- Created or updated sections
- Preserved conventions and related artifacts

## Residual risks
Only constraints that can still reverse an architecture decision.
```