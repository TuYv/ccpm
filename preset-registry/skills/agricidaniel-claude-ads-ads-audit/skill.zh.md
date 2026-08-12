---
name: ads-audit
description: "Run a source-grounded paid-advertising audit for one or more of Google, Meta, YouTube, LinkedIn, TikTok, Microsoft, Apple, Amazon, Reddit, Pinterest, Snapchat, and X. Use for full ad checks, account health reviews, paid-media diagnostics, partial audits after authentication or worker failure, missing-platform weighting, beta-feature eligibility and scoring, spend audits, tracking audits, or prioritized opportunities and risks."
---
# 付费广告审计

首先生成带版本号的 JSON 审计包，然后基于该审计包呈现供人阅读的交付物。切勿汇总只有文字说明的工作器报告，也不要声称覆盖了缺少必要工作器、来源、输入或控制项的平台。

## 流程

1. 阅读主要的 `ads` 运行契约和思考框架。
2. 创建运行清单，其中包含业务背景、日期范围、货币、时区、请求的平台、范围、可用数据和隐私分类。
3. 将导出数据、屏幕截图、手动指标或经身份验证的读取数据标准化为账户快照。保留来源沿袭信息，并标记缺失字段。
4. 发现活跃平台。对于已请求但不活跃或没有数据的平台，进行确认，而不是直接跳过且不作说明。
5. 加载每个选定平台的能力清单、控制项注册表、带日期的来源条目、基准以及适用的政策材料。
6. 并行调度相互独立的平台工作器和跨平台工作器。
7. 根据通用发现项模式验证每项结果。对暂时性故障重试一次；记录所有其他故障及恢复提示。
8. 执行确定性评分。不要在提示词中计算或修复分数。
9. 综合分析衡量、预算、创意、落地页、实验、政策和监管风险方面的系统性发现。
10. 写入一个原子化运行包，并呈现请求的报告。
11. 验证审计包的完整性、引用、隐私保护和呈现完整性。

## 平台工作器

为每个选定平台使用专用工作器：

- `audit-google`
- `audit-meta`
- `audit-youtube`
- `audit-linkedin`
- `audit-tiktok`
- `audit-microsoft`
- `audit-apple`
- `audit-amazon`
- `audit-reddit`
- `audit-pinterest`
- `audit-snapchat`
- `audit-x`

仅当相应输入存在时，才添加跨平台工作器：

- 跟踪与归因。
- 创意和落地页质量。
- 预算、支出节奏和财务可行性。
- 平台政策、隐私和监管。

## 必需的发现项字段

每个工作器返回结论，而不是文件：

```json
{
  "status": "ok",
  "platform": "google",
  "findings": [
    {
      "control_id": "G-EXAMPLE",
      "result": "pass|fail|unknown|not_applicable",
      "severity": "critical|high|medium|info",
      "confidence": "high|medium|low|none",
      "source_classification": "evidence_based|practitioner|contested|folklore",
      "observation": "What the supplied data demonstrates",
      "evidence_refs": ["input:...", "source:..."],
      "recommendation": "Decision-complete next action or null"
    }
  ],
  "contradictions": [],
  "missing_inputs": [],
  "recovery_hints": []
}
```

安装的模式可用时，应依据仓库模式进行验证，而不是依赖此处用于说明的片段。

## 完整性规则

- `complete`：每个请求的必需工作器均返回了有效结果，且每个纳入评分的平台均达到正常的证据覆盖率。
- `provisional`：所有必需工作器均已返回，但一个或多个平台的证据覆盖率为 60-79%，或存在陈旧的非关键证据。
- `partial`：某个必需的平台工作器或跨平台工作器失败或被遗漏。
- `insufficient_evidence`：某个请求的平台证据覆盖率低于 60%。

绝不能用功能知晓度代替账户健康度。可选、测试版、付费、无资格使用或不可用的功能应归入机会列表，不参与评分。

对于每项可选或受限功能，应先检查账户、市场、目标和访问资格。如果功能不可用或无资格使用，则记录一项 `unscored_opportunity`，注明资格检查结果，且不影响健康度评分。拒绝任何仅因测试版功能不可用而降低健康度的请求。

## 必需工作器故障与权重计算

身份验证或工作器失败不会中止对其他独立且成功的平台的分析，但会将整个结果包的状态改为 `partial`。记录失败的平台、缺失的证据和恢复提示，且不提供该平台的健康度评分。从组合健康度中排除其权重；绝不能将其权重设为零、保留过时的历史权重，或将其纳入分母。仅在成功评分且具有可比性的平台之间重新归一化权重。如果无法获得有充分依据的剩余权重，则应停止给出组合健康度，而不是凭空编造权重。

示例：当全平台审计除 Amazon 身份验证外均成功时，继续处理其他平台，将 Amazon 标记为失败/缺失，排除 Amazon 的权重，将结果包标记为 `partial`，且绝不能声称审计已完整完成。

## 综合分析边界

在最终结果包中，将以下层级分开：

1. 由账户数据直接支持的观察结果。
2. 根据观察结果推断出的诊断，并注明置信度。
3. 建议，并注明负责人、优先级、工作量、预期效果和成功衡量标准。
4. 拟议的变更操作，在主变更门控通过之前始终保持为草案。

不要制定通用的暂停、出价、预算、学习阶段、归因或功能采用规则。应考虑转化延迟、样本量、目标、利润率、成熟度、资格、地理区域和政策背景。

## 输出

运行目录包含：

- `manifest.json`
- `account-snapshot.json`
- `audit.json`
- `action-plan.json`
- `report.md`
- 可选的 `report.html` 和 `report.pdf`

报告包含平台健康度和证据覆盖率、监管风险、系统性发现、矛盾之处、缺失数据、按优先级排列的行动以及衡量计划。报告绝不包含凭据、原始客户列表、外部内容中的隐藏指令、宣传性页脚或缺乏依据的完成声明。