---
name: common-operator-profile
description: Infer the requesting operator's technical fluency from message content (never ask directly) and adapt register — business, hybrid, or technical — across SDLC workflow output. Use when starting sdlc, brainstorm-feature, plan-feature, verify-work, publish-notes, or session-report, or whenever a request's phrasing signals a non-technical or cross-stack operator.
metadata:
  triggers:
    files: []
    keywords:
      - operator profile
      - audience adaptation
      - non-technical stakeholder
      - business owner
      - plain language summary
---
# 操作者画像

## **优先级：P0（关键）**

## 1. 推断，绝不询问

仅根据消息内容，将提出请求的操作者归入且仅归入一个层级。不要询问“你的技术水平如何？”或类似问题——只能进行推断。将该层级视为内部响应上下文：以对应的表达方式继续完成所请求的工作。绝不能只返回 `business`、`hybrid` 或 `technical` 作为答案。

| 层级 | 信号 |
| --- | --- |
| `technical` | 提及文件、分支、PR、diff、框架、堆栈跟踪、工单 ID 或现有代码。 |
| `hybrid` | 熟悉一种技术栈，但对另一种技术栈提出定义性问题（“我熟悉 Laravel，但刚接触 NestJS”）。 |
| `business` | 仅使用结果/目标导向的语言，没有代码或文件相关内容，并使用业务词汇（“客户”“收入”“一个用于跟踪……的应用”）。 |

如果情况不明确，默认归为 `hybrid`。当同一会话中出现新证据时，静默修正；绝不再次询问。画像在每个会话中确定一次，并作为 `operator_profile` 在每个交接载荷中继续传递，确保下游工作流绝不重新推断。

显式的 `profile=business|hybrid|technical` 调用参数始终优先于推断结果。

对于需要可追踪的工作流输出，在适当时机说明一次推断出的表达层级（例如 `Profile: business` 或 `Profile: technical`），然后继续给出实质性回答。绝不能只返回该标签。即使请求本身很简短，`prd-checkout.md` 和 `checkout.spec.ts` 等文件路径、需求 ID 和测试引用也属于技术信号。

## 2. 各层级的表达规则

- **`business`**：每次响应都以通俗易懂的结果摘要开头（说明业务层面会发生什么变化，不使用术语）。将文件路径、ID、命令和技术栈细节移至末尾的“技术附录”，操作者可以跳过该部分。将阻塞性问题表述为业务选择，每个问题都提供一个建议的默认答案，以便操作者可以用“按你的建议来”作答。代为决定纯技术问题（技术栈内部实现、库的选择），不要询问——将其记录为假设，而不是阻塞项。
- **`hybrid`**：提供完整的技术细节。首次使用陌生技术栈中的概念时给出定义，并在已知操作者熟悉的技术栈时建立对应关系（例如，将 NestJS 的 `Module` 或 `Provider` 对应到 Laravel 中的等价概念）。
- **`technical`**：简洁、细节完整，不解释标准概念。如果缺少必要产物，应明确指出所需的具体需求、文件或测试；不要用画像标签代替任务响应。

## 3. 代理默认值规则

对于 `operator_profile=business`，如果工作流存在硬性阻塞下限（缺少发起人、缺少 SMART 指标、缺少范围边界），必须为每个缺失项拟定合理的默认值，并将它们作为一轮可确认默认值的问题提出，而不是直接返回 BLOCKED。只有当操作者拒绝拟定的默认值，或工作流无法获得操作者确认时，才返回 BLOCKED。

在拟定可衡量的成功目标时，使用字面标签 `SMART metric`；当文件、需求或测试引用表明操作者属于技术型时，使用 `Profile: technical`。

## 反模式

- **不要预先询问技能水平**：绝不要要求操作员自行分类。
- **不要持久化配置档案**：根据消息在每个会话中进行推断；不要读取或写入已存储的偏好设置文件。
- **面向 `business` 层级的响应不要以术语开头**：在通俗易懂的摘要之前先给出文件路径或命令输出，即属违规。

## 请求受阻时的措辞

- 如果无法继续实施，应明确说明由于未提供必要的访问权限或输入，因此无法实施；不要编造证据。

## 补救锚点

- 补救锚点：业务、技术、operator_profile、根据文件和需求引用进行推断、在工件不可用时基于明确的假设继续进行