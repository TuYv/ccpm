---
name: mle-workflow
description: Production machine-learning engineering workflow for data contracts, reproducible training, model evaluation, deployment, monitoring, and rollback. Use when building, reviewing, or hardening ML systems beyond one-off notebooks.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---
# 机器学习工程工作流

使用此技能，将模型相关工作转化为生产级 ML 系统，并具备清晰的数据契约、可重复的训练流程、可度量的质量门槛、可部署的制品以及运行监控。

## 何时启用

- 规划或评审生产级 ML 功能、模型更新、排序系统、推荐系统、分类器、嵌入工作流或预测流水线
- 将 Notebook 代码转换为可复用的训练、评估、批量推理或在线推理流水线
- 设计模型晋级标准、离线/在线评估、实验跟踪或回滚路径
- 调试由数据漂移、标签泄漏、特征过期、制品不匹配或训练与服务逻辑不一致导致的故障
- 添加模型监控、金丝雀发布、影子流量或部署后质量检查

## 范围校准

仅使用适合当前系统的环节。此技能适用于排序、搜索、推荐、分类器、预测、嵌入、LLM 工作流、异常检测和批量分析，但不应将同一种架构强加于所有场景。

- 不要假设每个模型都具备监督标签、在线服务、特征存储、PyTorch、GPU、人工审核、A/B 测试或实时反馈。
- 如果数据契约、基线、评估脚本和回滚说明已经足以让变更具备可评审性，就不要引入重量级 MLOps 机制。
- 当项目缺少标签、结果存在延迟、切片定义不明确、没有生产流量或监控责任归属不清时，应明确说明相关假设。
- 将示例视为可替换的脚手架。请使用项目原生的等效方案替换指标、服务模式、数据存储和发布机制。

## 相关技能

- `python-patterns` 和 `python-testing`：用于 Python 实现和 pytest 覆盖
- `pytorch-patterns`：用于深度学习模型、数据加载器、设备处理和训练循环
- `eval-harness` 和 `ai-regression-testing`：用于晋级门槛和代理辅助的回归检查
- `database-migrations`、`postgres-patterns` 和 `clickhouse-io`：用于数据存储和分析界面
- `deployment-patterns`、`docker-patterns` 和 `security-review`：用于服务、密钥、容器和生产加固

## 复用 SWE 能力面

不要将 MLE 与软件工程割裂开来。大多数 ECC SWE 工作流都可以直接应用于 ML 系统，而且 ML 系统的故障模式通常更为严格：

推荐的 `minimal --with capability:machine-learning` 安装方式会在提供此技能的同时保留核心代理能力面。对于仅支持技能或代理受限的运行框架，如果目标支持代理，请将 `skill:mle-workflow` 与 `agent:mle-reviewer` 配合使用。

| SWE 能力面 | MLE 用途 |
|-------------|---------|
| `product-capability` / `architecture-decision-records` | 将模型工作转化为明确的产品契约，并记录不可逆的数据、模型和发布选择 |
| `repo-scan` / `codebase-onboarding` / `code-tour` | 在引入并行 ML 技术栈之前，查找现有的训练、特征、服务、评估和监控路径 |
| `plan` / `feature-dev` | 将模型变更界定为包含数据、评估、服务和回滚阶段的产品能力 |
| `tdd-workflow` / `python-testing` | 在实现之前测试特征转换、拆分逻辑、指标计算、制品加载和推理模式 |
| `code-reviewer` / `mle-reviewer` | 评审代码质量，以及 ML 特有的泄漏、可复现性、晋级和监控风险 |
| `build-fix` / `pr-test-analyzer` | 诊断 CI 故障、不稳定的评估、缺失的固件，以及特定环境下的模型或依赖项故障 |
| `quality-gate` / `test-coverage` | 要求为转换、指标、推理契约、晋级门槛和回滚行为提供自动化证据 |
| `eval-harness` / `verification-loop` | 将离线指标、切片检查、延迟预算和回滚演练转化为可重复执行的门槛 |
| `ai-regression-testing` | 将每个生产故障保留为回归用例：特征缺失、标签过期、制品错误、模式漂移或服务不匹配 |
| `api-design` / `backend-patterns` | 设计预测 API、批处理作业、幂等的重新训练端点和响应信封 |
| `database-migrations` / `postgres-patterns` / `clickhouse-io` | 对标签、特征快照、预测日志、实验指标和漂移分析进行版本管理 |
| `deployment-patterns` / `docker-patterns` | 打包可复现的训练和服务镜像，并提供健康检查、资源限制和回滚能力 |
| `canary-watch` / `dashboard-builder` | 通过展示模型版本、切片、漂移、延迟、成本和延迟标签的仪表板，使发布健康状况清晰可见 |
| `security-review` / `security-scan` | 检查模型制品、Notebook、提示词、数据集和日志中是否存在密钥、PII、不安全的反序列化和供应链风险 |
| `e2e-testing` / `browser-qa` / `accessibility` | 测试使用预测结果的关键产品流程，包括可解释性和回退 UI 状态 |
| `benchmark` / `performance-optimizer` | 测量吞吐量、p95 延迟、内存、GPU 利用率，以及每次预测或重新训练的成本 |
| `cost-aware-llm-pipeline` / `token-budget-advisor` | 根据质量、延迟和预算路由 LLM/嵌入工作负载，而不是默认使用最大的模型 |
| `documentation-lookup` / `search-first` | 在编码之前，验证模型服务、特征存储、向量数据库和评估工具的当前库行为 |
| `git-workflow` / `github-ops` / `opensource-pipeline` | 以清晰的范围组织 MLE 变更以供评审，排除生成的制品，并提供可复现的测试证据 |
| `strategic-compact` / `dmux-workflows` | 将长期 ML 工作拆分为并行轨道：数据契约、评估框架、服务路径、监控和文档 |

## 十项 MLE 任务模拟

在规划或审查 MLE 工作时，使用这些模拟作为覆盖检查。一个强健的 MLE 工作流应将每项任务归结为明确的契约、可复用的 SWE 工作面、自动化证据以及可审查的产物。

| ID | 常见 MLE 任务 | 精简的 ECC 路径 | 必需输出 | 覆盖的流水线环节 |
|----|-----------------|----------------------|-----------------|------------------------|
| MLE-01 | 界定一项含糊的预测、排序、推荐、分类、嵌入或预测能力 | `product-capability`, `plan`, `architecture-decision-records`, `mle-workflow` | 迭代简约契约，其中明确关注者、决策负责人、成功指标、不可接受的错误、假设、约束和首个实验 | 产品契约、利益相关者损失、风险、发布 |
| MLE-02 | 定义指标目标、标签、数据源和错误预算 | `repo-scan`, `database-reviewer`, `database-migrations`, `postgres-patterns`, `clickhouse-io` | 数据和指标契约，其中包含实体粒度、标签时机、标签置信度、特征时机、时点关联、拆分策略和数据集快照 | 数据契约、指标设计、泄漏、可复现性 |
| MLE-03 | 在增加复杂性之前构建基线模型和评分路径 | `tdd-workflow`, `python-testing`, `python-patterns`, `code-reviewer` | 基线评分器，其中包含混淆矩阵、校准说明、延迟/成本估算、已知弱点，以及针对分数形状和确定性的测试 | 基线、评分、测试、服务一致性 |
| MLE-04 | 根据区分结果的相关假设生成特征 | `python-patterns`, `pytorch-patterns`, `docker-patterns`, `deployment-patterns` | 特征计划和转换模块，涵盖信号来源、缺失值、异常值、相关性、泄漏检查以及训练/服务等价性 | 特征流水线、泄漏、训练、产物 |
| MLE-05 | 在权衡取舍下调优阈值、配置和模型复杂度 | `eval-harness`, `ai-regression-testing`, `quality-gate`, `test-coverage` | 阈值/配置报告，对比精确率、召回率、F1、AUC、校准、群体切片、延迟、成本、复杂度和可接受的错误类别 | 评估、阈值、晋级、回归 |
| MLE-06 | 运行错误分析，并将错误转化为下一项实验 | `eval-harness`, `ai-regression-testing`, `mle-reviewer`, `silent-failure-hunter` | 错误聚类报告，涵盖假阳性、假阴性、模糊标签、过时特征、缺失信号和缺陷追踪，并记录经验教训 | 错误分析、缺陷追踪、迭代、回归 |
| MLE-07 | 为批量或在线推理打包模型产物 | `api-design`, `backend-patterns`, `security-review`, `security-scan` | 带版本的产物包，其中包含预处理、配置、依赖约束、模式验证、安全加载和保护 PII 的日志 | 产物、安全、推理契约 |
| MLE-08 | 发布在线服务或批量评分，并捕获反馈 | `api-design`, `backend-patterns`, `e2e-testing`, `browser-qa`, `accessibility` | 预测端点或批处理作业，其中包含响应封装、超时、批处理、回退、模型版本、置信度、反馈日志和产品流程测试 | 服务、批量推理、回退、用户工作流 |
| MLE-09 | 通过影子流量、金丝雀发布、A/B 测试或回滚来推出模型 | `canary-watch`, `dashboard-builder`, `verification-loop`, `performance-optimizer` | 发布计划，其中明确流量拆分、仪表板、p95 延迟、成本、质量护栏、回滚产物和回滚触发条件 | 部署、金丝雀发布、回滚 |
| MLE-10 | 在上线后运维、调试和刷新生产模型 | `silent-failure-hunter`, `dashboard-builder`, `mle-reviewer`, `doc-updater`, `github-ops` | 观测台账和刷新计划，其中包含漂移检查、延迟标签健康状况、告警负责人、运行手册更新、再训练标准和 PR 证据 | 监控、事件响应、再训练 |

## 迭代摘要

在修改模型代码之前，先将工作压缩成一份可供评审的产物。它应足够简短，能够放入 PR 描述中，同时足够精确，让其他工程师能够质疑其中的权衡取舍。

```text
Goal:
Who cares:
Decision owner:
User or system action changed by the model:
Success metric:
Guardrail metrics:
Mistake budget:
Unacceptable mistakes:
Acceptable mistakes:
Assumptions:
Constraints:
Labels and data snapshot:
Baseline:
Candidate signals:
Threshold or config plan:
Eval slices:
Known risks:
Next experiment:
Rollback or fallback:
```

这份摘要相当于 MLE 领域中一份高质量的 SWE 设计说明。它可以避免团队去优化一个无人信任的指标、添加无法解决真实错误模式的特征，或在没有回滚方案的情况下上线复杂功能。

## 决策思维

每当任务含糊不清、影响重大或高度依赖指标时，都应使用以下循环：

1. 从决策出发，而不是从模型出发。明确会改变下游行为的操作。
2. 明确谁关心这件事，以及原因。不同利益相关方为误报、漏报、延迟、计算支出、不透明性或错失机会所付出的代价不同。
3. 将模糊性转化为假设。思考什么信号能够区分不同结果、什么证据能够推翻该假设，以及什么简单基线应该难以被超越。
4. 在发明定制系统之前，先研究已有工作或与之相近的已知问题。
5. 使用 `(probability, confidence) x (cost, severity, importance, impact)` 对选项进行评分。
6. 考虑对抗性行为、激励机制、选择性披露、分布偏移和反馈循环。
7. 优先选择能够减少最重要错误的最简单改动。简单并不等于懒惰；它是在保持迭代速度的同时尽量减少重大失误的一种方式。
8. 记录决策、证据、反对意见以及下一项可逆步骤。

## 指标与错误成本

根据失败成本而非习惯来选择指标：

- 尽早使用混淆矩阵，以便团队讨论具体的误报和漏报，而不是抽象的准确率。
- 当错误地作出正类决策所带来的成本占主导地位时，优先考虑精确率。
- 当漏掉正类所带来的成本占主导地位时，优先考虑召回率。
- 只有当精确率与召回率之间的权衡确实均衡且可解释时，才使用 F1。
- 当排序质量比单一阈值更重要时，使用 AUC 或排序指标。
- 将延迟、吞吐量、内存和成本作为一等指标进行跟踪，因为它们决定了可行的模型复杂度。
- 在庆祝离线提升之前，先与基线和当前生产模型进行比较。
- 将真实世界的反馈信号视为存在偏差、延迟和覆盖缺口的延后标签；未经分析，不要将其视为真实标签。

每项指标的选择都应说明：它降低了哪种错误的成本、增加了哪种错误发生的可能性，以及由谁承担该成本。

## 数据与特征假设

特征应来源于一种关于可分性的理论：

- 文本、分类字段、数值历史、图关系、时效性、频率和聚合值是候选信号类别，而不是应自动采用的特征。
- 对每一类特征，都应说明它为何能够区分不同结果，以及它可能如何泄露未来信息。
- 对于噪声标签，应考虑裁决、标签置信度、软目标或置信度加权。
- 对于类别不平衡，应比较加权损失、重采样、阈值调整和校准后的决策规则。
- 对于缺失值，应判断缺失本身是否具有信息、是否可以插补，或者是否应当因此拒绝决策。
- 对于异常值，应判断是截断、分桶、调查，还是将其保留为罕见但重要的信号。
- 对于相关特征，应检查它们是否冗余、不稳定，或是否代理了不可获得的未来状态。

在错误分析表明基线失败的原因确实可能通过额外信号或容量解决之前，不要增加模型复杂度。

## 错误分析循环

在每次基线评估、训练运行、阈值变更或配置变更之后：

1. 将错误分为假阳性、假阴性、弃权、低置信度案例和系统故障。
2. 按共同特征对错误进行聚类：语言、实体类型、来源、时间、地理位置、设备、稀疏性、时效性、特征新鲜度、标签来源或模型版本。
3. 将模型错误与数据缺陷、标签歧义、产品歧义、监测缺口和服务不匹配区分开来。
4. 将每个主要错误簇归因于四类措施之一：更好的标签、更好的特征、更合适的阈值/配置，或更好的产品回退机制。
5. 将每个重要错误保留为回归测试、评估切片、仪表板面板或运行手册条目。
6. 将下一次迭代设计为可证伪的实验，而不是模糊的“改进模型”任务。

最强的 MLE 循环不是训练 -> 指标 -> 发布，而是错误 -> 聚类 -> 假设 -> 实验 -> 证据 -> 更简单的系统。

## 观察台账

在代码、PR、实验报告或运行手册旁维护一份精简的决策与证据记录：

```text
Iteration:
Change:
Why this mattered:
Metric movement:
Slice movement:
False positives:
False negatives:
Unexpected errors:
Decision:
Tradeoff accepted:
Lesson captured:
Regression added:
Debt created:
Next iteration:
```

使用台账让模型工作不断积累。目标是让每次迭代都使下一次决策变得更容易，而不只是再产出一个制品。

## 核心工作流

### 1. 定义预测契约

在编写模型代码之前，先明确产品层面的契约：

- 预测目标和决策负责人
- 输入实体、输出模式、置信度/校准字段和允许的延迟
- 批处理、在线、流式或混合服务模式
- 模型、特征存储或依赖项不可用时的回退行为
- 高影响决策的人工审核或覆盖路径
- 输入、预测和标签的隐私、保留与审计要求

不要接受“改进模型”作为需求。将模型与可观察的产品行为和可衡量的验收门槛关联起来。

### 2. 锁定数据契约

每项 ML 任务都需要明确的数据契约：

- 实体粒度和主键
- 标签定义、标签时间戳和标签可用延迟
- 特征时间戳、新鲜度 SLA 和时间点连接规则
- 训练、验证、测试和回测的拆分策略
- 必需列、允许的空值、范围、类别和单位
- 不得进入训练制品或日志的 PII 或敏感字段
- 用于复现的数据集版本或快照 ID

首先防范泄漏。如果某个特征在预测时不可用，或使用未来信息进行连接，请将其移除或转移到仅用于分析的路径。

### 3. 构建可复现的流水线

训练代码应当能够由另一名工程师运行，且不依赖隐藏的笔记本状态：

- 对所有超参数和路径使用类型化配置文件或数据类
- 固定软件包和模型依赖项的版本
- 设置随机种子，并记录所有非确定性的 GPU 行为
- 记录数据集版本、代码 SHA、配置哈希、指标和制品 URI
- 将预处理逻辑与模型制品一起保存，而不是单独保存在笔记本中
- 让训练、评估和推理转换共用同一份实现，或从同一来源生成
- 确保每个步骤都具有幂等性，使重试不会损坏制品或指标

优先使用不可变值和纯转换函数。在特征生成期间，避免修改共享数据帧或全局配置。

```python
import hashlib
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class TrainingConfig:
    dataset_uri: str
    model_dir: Path
    seed: int
    learning_rate: float
    batch_size: int


def artifact_name(config: TrainingConfig, code_sha: str) -> str:
    config_key = f"{config.dataset_uri}:{config.seed}:{config.learning_rate}:{config.batch_size}"
    config_hash = hashlib.sha256(config_key.encode("utf-8")).hexdigest()[:12]
    return f"{code_sha[:12]}-{config_hash}"
```

### 4. 在晋级前进行评估

应在训练完成前声明晋级标准：

- 与基线模型和当前生产模型进行比较
- 主要指标应与产品行为保持一致
- 针对延迟、校准、公平性切片、成本和错误集中度设置护栏指标
- 针对重要群体、地域、设备、语言或数据源设置切片指标
- 当指标噪声较大时，使用置信区间或多次运行的方差
- 对于影响重大的模型，由人工审核失败样例
- 明确规定“不得发布”的阈值

```python
PROMOTION_GATES = {
    "auc": ("min", 0.82),
    "calibration_error": ("max", 0.04),
    "p95_latency_ms": ("max", 80),
}


def assert_promotion_ready(metrics: dict[str, float]) -> None:
    missing = sorted(name for name in PROMOTION_GATES if name not in metrics)
    if missing:
        raise ValueError(f"Model promotion metrics missing required gates: {missing}")

    failures = {
        name: value
        for name, (direction, threshold) in PROMOTION_GATES.items()
        for value in [metrics[name]]
        if (direction == "min" and value < threshold)
        or (direction == "max" and value > threshold)
    }
    if failures:
        raise ValueError(f"Model failed promotion gates: {failures}")
```

将离线指标用作门槛，而非保证。当模型会改变产品行为时，应在全面发布之前规划影子评估、金丝雀发布或 A/B 测试。

### 5. 打包以供服务

只有当服务契约可测试时，机器学习制品才算为生产环境做好准备：

- 模型制品包含版本、训练数据引用、配置和预处理逻辑
- 输入模式拒绝无效、陈旧或超出范围的特征
- 输出模式包含模型版本，以及在有用时提供置信度或解释字段
- 服务路径具备超时、批处理、资源限制和回退行为
- 明确说明并测试 CPU/GPU 要求
- 预测日志应避免包含个人身份信息，并包含足以用于调试和标签关联的标识符
- 集成测试覆盖特征缺失、特征陈旧、类型错误、空批次和回退路径

绝不要让仅用于训练的特征代码与在线服务的特征代码产生分歧，除非有测试能够证明二者等价。

### 6. 运行模型

模型监控需要同时覆盖系统信号和质量信号：

- 可用性、错误率、超时率、队列深度以及 p50/p95/p99 延迟
- 特征空值率、取值范围漂移、类别漂移和新鲜度漂移
- 预测分布漂移和置信度分布漂移
- 标签到达状况和延迟质量指标
- 业务 KPI 护栏和回滚触发条件
- 用于灰度发布和回滚的按版本仪表板

每次部署都应制定回滚计划，明确上一版本的制品、配置、数据依赖项和流量切换机制。

## 审查清单

- [ ] 预测契约明确且可测试
- [ ] 数据契约定义了实体粒度、标签时间、特征时间以及快照/版本
- [ ] 已根据预测时刻的可用性检查数据泄漏风险
- [ ] 可根据代码、配置、数据版本和随机种子复现训练
- [ ] 指标与基线模型和当前生产模型进行了比较
- [ ] 针对高风险群体提供了分群指标和护栏
- [ ] 模型晋级门禁已自动化，并采用失败时关闭策略
- [ ] 训练与在线服务转换逻辑共享，或已通过等价性测试
- [ ] 模型制品包含版本、配置、数据集引用和预处理逻辑
- [ ] 在线服务路径会验证输入，并具备超时、降级和回滚机制
- [ ] 监控覆盖系统健康状况、特征漂移、预测漂移和延迟标签
- [ ] 制品、日志、提示词和示例中不包含敏感数据

## 反模式

- 必须依赖 Notebook 状态才能复现模型
- 随机划分导致未来数据泄漏到验证集或测试集
- 特征关联忽略事件时间和标签可用时间
- 离线指标有所提升，但重要分群的指标出现退化
- 反复使用测试集调优阈值
- 将训练预处理逻辑手动复制到在线服务代码中
- 预测日志中缺少模型版本
- 监控只检查服务正常运行时间，而不检查数据或预测质量
- 回滚需要重新训练，而不是切换到已知可靠的制品

## 输出要求

使用此技能时，应返回具体的产出物：数据契约、模型晋级门禁、流水线步骤、测试计划、部署计划或审查结果。对于阻碍生产就绪的未知事项，应明确指出，而不是用假设加以填补。