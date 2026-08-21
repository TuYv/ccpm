---
name: common-software-requirements
description: Standardize SRS and FRS specifications for technical behavior, interfaces, data contracts, quality constraints, and verification mapping. Use when writing SRS, functional specification, system behavior requirements, API/data contracts, or non-functional thresholds.
metadata:
  triggers:
    files:
      - "SRS.md"
      - "docs/srs/srs-*.md"
      - "specs/*.md"
    keywords:
      - create srs
      - software requirements
      - functional specification
      - system behavior spec
      - technical requirements
      - non-functional requirements
---
# 软件需求专家

## **优先级：P0（关键）**

通过可验证的需求定义技术层面的“如何实现”。

## 1. SRS/FRS 需求发现

- 确认关联的 PRD 需求（`REQ-*`）和 AC ID。
- 保留追踪链路：`BRD-OBJ-* -> REQ-* -> AC-* -> SRS-* -> test evidence`。
- 当缺少 `REQ-*` 或 `AC-*` 输入时，阻止流程继续或将其退回 PRD（`plan-feature`）；不得根据代码推断产品范围。
- 定义功能流程：触发条件、输入、校验、输出、错误。
- 对于复杂流程，每个流程只使用一个参与者、一个目标和一个会话；拆分正常流程、替代流程和异常流程。
- 定义接口契约：API、事件、存储、外部集成。
- 定义 NFR 阈值：延迟、可用性、安全性、可扩展性。
- 定义约束：迁移、兼容性、合规性、发布。

## 2. 起草工作流

- 加载 `references/srs-template.md`。
- **Slug 对齐**：使用源文件 `docs/prd/prd-[slug].md` 中相同的 `[slug]`，以保持文件名级别的可追溯性。
- 每条陈述编写一张需求卡片，并使用稳定的 `SRS-*` ID。
- 将每个 `SRS-*` 映射到源 PRD 的 `REQ-*` 和验证通道。
- 将每项技术行为映射到 PRD AC、测试通道和证据目标。
- 包含陈述、优先级、状态、输入/输出/错误行为、NFR 影响、测量方法和证据目标。
- 添加结果报告：`feature_status`、需求追踪、已完成/缺失的证据、所需决策以及建议的下一工作流。
- 写入 `docs/srs/srs-[slug].md`。

## 3. 验证映射

- 每个 `SRS-*` 都有测试证据计划（单元测试/集成测试/E2E/手动测试）。
- 明确定义失败模式和回退行为。
- 将权限和隐私控制映射到需求。
- 每项 NFR 都有对应的测量方法。

## 反模式

- 不得在同一条陈述中混合需求和实现任务。
- 不得在没有数值阈值的情况下提出 NFR 声明。
- 不得在没有输入/输出/错误模式的情况下定义接口契约。
- 不得存在没有源追踪链接和验证方式的需求。
- 不得在未映射 PRD AC ID 和测试通道的情况下进行实现交接。
- 对于复杂的用户/系统交互，不得只定义成功路径流程。

## 参考资料

- [SRS 模板](references/srs-template.md)
- [FRS 检查清单](references/frs-checklist.md)
- [需求基线](references/standards-baseline.md)