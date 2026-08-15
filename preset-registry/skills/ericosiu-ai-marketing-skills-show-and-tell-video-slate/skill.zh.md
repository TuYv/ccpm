---
name: show-and-tell-video-slate
description: Turn authorized current builds, workflows, dashboards, analytics, and completed work into proof-led founder videos, then rank and combine the strongest filmable artifacts into exact 15-minute long-form slates with strict title and thumbnail evaluation. Use when deciding what to film, creating show-and-tell business videos, combining thin topics into complete episodes, or requiring packaging concepts to clear explicit quality gates.
---
# 展示讲解型视频策划单

将真实工作转化为视频，让开头许下的承诺通过可见的产物、工作流、结果或前后对比得到兑现。

## 前言

在仓库根目录中，如果以下脚本可用，请运行保护隐私的版本检查和遥测初始化程序：

```bash
python3 telemetry/version_check.py 2>/dev/null || true
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

远程遥测采用自愿加入机制。绝不记录内容、URL、路径、凭据、姓名、业务数据或证明材料。

## 设定范围

说明已获授权的数据源、所有者、频道、观众、时长、交付物和停止条件。对源系统仅进行只读操作。绝不搜索无关的账号、仓库、对话或凭据。

如果尚不清楚，请让用户对以下成果进行排序：

1. 创造收入；
2. 节省资金；
3. 创造生产能力。

在撰写标题或开场钩子之前，加载用户提供的任何创作者风格指南。即使数值评分达标，也要拒绝违反该指南的内容方案。

## 盘点可拍摄的证据

仅检查用户提供或授权的构建成果、仓库、演示、智能体运行记录、仪表板、分析数据和工作流输出。针对每个候选项，记录：

- 观众和业务成果；
- 可见的产物和演示路径；
- 声明状态：已实现、估算、轶事、预测、目标或计划；
- 证明材料指针、时效性和隐私限制；
- 机制、经验和观众行动；
- 缺失的补拍、采集、脱敏或验证。

不要将记忆中的结果升级为已验证的证据。为暂定候选项添加标记。

## 应用展示讲解准入标准

阅读 [references/selection-rubric.md](references/selection-rubric.md)。除非候选项满足以下条件，否则应将其淘汰或修正：

- 前 30 秒能够展示真实成果、构建内容、屏幕画面、输出或实体产物；
- 演示能够解释或证明该内容方案；
- 一个承诺足以支撑 15 分钟内容，无须注水；
- 观众能够获得可实际使用的机制或决策依据；
- 结尾能够完整兑现开头的承诺。

纯框架型主题必须使用真实案例研究。产品演示必须以观众成果为切入点，而不是罗列功能。

## 谨慎组合

仅当多个创意共享同一种机制、同一类观众和同一项回报时，才将它们组合起来。例如，使用相同触达闭环的销售和招聘工作流、同一审计系统内的多项成本控制措施，或将已证实的内容成果与产生该成果的闭环配对。

不要仅仅为了凑够时长而组合互不相关的证明点。内容单薄的创意应转为更短的形式。

## 构建精确的 15 分钟内容主线

除非用户另有指定，否则使用 900 秒：

1. `0:00-0:30` 展示成果并作出承诺；
2. `0:30-2:00` 说明利害关系和基准；
3. `2:00-5:00` 展示构建了什么；
4. `5:00-10:00` 演示其工作原理；
5. `10:00-13:00` 展示证明材料、局限性和经验；
6. `13:00-15:00` 给出实施路径并兑现承诺。

## 评分与包装

使用 [references/selection-rubric.md](references/selection-rubric.md) 中的九个单集评估维度。平均分必须达到 90 分以上，其中 Demoability 和 Payoff Integrity 均不得低于 90 分。

创建恰好三个实质不同的包装方案：

1. 结论裁定或反常识结论；
2. 具体证据或转变；
3. 决策价值或实施框架。

要求每个包装方案的评分至少达到 9.0/10，且任何维度不得低于 8.5。缩略图使用零到四个词，主要视觉组不超过三个。优先使用真实工件、结果页面、仪表板、输出或实体道具，而不是抽象隐喻。

候选清单通过后，如果已安装相应技能，则使用 `content-eval` 进行更深入的评审小组审查，使用 `video-content-engine` 制定制作计划，并使用 `shortform-idea-grill` 生成完整的短视频衍生内容。如果有兼容的缩略图包装技能，也应使用。将已实现的结果与计划和预测明确区分开来。

## 验证

阅读 [references/output-contract.md](references/output-contract.md)，将结构化候选清单保存为 JSON，然后运行：

```bash
python3 scripts/evaluate_slate.py slate.json --output slate-eval.json
python3 scripts/evaluate_slate.py slate.json --validate-only
```

验证器会检查时长、工件证据、主张证明、单集评分、包装路线、缩略图词数、组件预算以及包装方案评分下限。

## 交付

返回排序后的候选清单、组合决策、精确的节目流程、前 30 秒承诺、证明与补拍台账、每集的三个包装方案、评估结果回读、胜出包装方案以及拍摄顺序。

将 `ready` 与 `repair` 分开。强有力的包装方案绝不能凌驾于缺失的证明之上。未经明确批准，不得渲染、发布、排期、上传或更改线上资产。

## 生命周期

- **跟踪状态：**将运行证据、候选清单 JSON、评估报告和决策保存在用户选择的私有运行时文件夹中，而不是技能中。
- **成功测试：**至少有一集通过单集和展示讲解门槛，所有呈现的包装方案都通过确定性验证，并且每项已实现的主张都有证明指针。
- **重复触发条件：**在选择录制候选清单、重要构建发布后，或收到新的第一方结果时运行。默认情况下不要安排排期。
- **学习回写：**将用户修正、失败的证明检查以及发布后的表现证据存储在私有运行时文件夹中。
- **晋级：**在一个真实构建产出通过验证的候选清单和完整录制内容后进行验证。在产出三个有用的候选清单并获得至少两次经过衡量的内容反馈后，视为已达到生产就绪状态。
- **退役：**如果连续三次运行都没有新增差异化的就绪单集，或者另一个工作流吸收了完整流程，则将其归档。