---
name: ab-test-analysis
description: "Analyze A/B test results with statistical significance, sample size validation, confidence intervals, and ship/extend/stop recommendations. Use when evaluating experiment results, checking if a test reached significance, interpreting split test data, or deciding whether to ship a variant."
---
## A/B 测试分析

以严谨的统计方法评估 A/B 测试结果，并将发现转化为清晰的产品决策。

### 背景

你正在分析 **$ARGUMENTS** 的 A/B 测试结果。

如果用户提供了数据文件（CSV、Excel 或分析平台导出文件），请直接读取并分析。如有需要，生成用于统计计算的 Python 脚本。

### 说明

1. **了解实验**：
   - 假设是什么？
   - 做了哪些改动（实验变体）？
   - 主要指标是什么？是否有护栏指标？
   - 测试运行了多长时间？
   - 流量如何分配？

2. **验证测试设置**：
   - **样本量**：样本是否足以检测预期的效应量？
     - 使用公式：n = (Z²α/2 × 2 × p × (1-p)) / MDE²
     - 如果测试的统计功效不足（<80% power），则进行标记
   - **持续时间**：测试是否至少运行了 1-2 个完整的业务周期？
   - **随机化**：是否有样本比例失配（SRM）的迹象？
   - **新奇效应/首因效应**：是否有足够时间让初期行为变化的影响消退？

3. **计算统计显著性**：
   - 对照组和实验组的**转化率**
   - **相对提升**：(variant - control) / control × 100
   - **p 值**：使用双尾 z 检验或卡方检验
   - **置信区间**：差值的 95% CI
   - **统计显著性**：p < 0.05 吗？
   - **实际显著性**：这一提升对业务是否有实际意义？

   如果用户提供了原始数据，请生成并运行 Python 脚本来完成这些计算。

4. **检查护栏指标**：
   - 是否有任何护栏指标（收入、参与度、页面加载时间）出现下降？
   - 主要指标胜出但护栏指标恶化，可能并不是真正的胜利

5. **解读结果**：

   | 结果 | 建议 |
   |---|---|
   | 显著的正向提升，护栏指标无异常 | **发布** — 推广至 100% |
   | 显著的正向提升，但护栏指标存在隐患 | **调查** — 发布前了解其中的权衡 |
   | 不显著，但呈正向趋势 | **延长测试** — 需要更多数据或更大的效应 |
   | 不显著，表现持平 | **停止测试** — 未检测到有意义的差异 |
   | 显著的负向提升 | **不要发布** — 恢复为对照版本并分析原因 |

6. **提供分析摘要**：
   ```
   ## A/B Test Results: [Test Name]

   **Hypothesis**: [What we expected]
   **Duration**: [X days] | **Sample**: [N control / M variant]

   | Metric | Control | Variant | Lift | p-value | Significant? |
   |---|---|---|---|---|---|
   | [Primary] | X% | Y% | +Z% | 0.0X | Yes/No |
   | [Guardrail] | ... | ... | ... | ... | ... |

   **Recommendation**: [Ship / Extend / Stop / Investigate]
   **Reasoning**: [Why]
   **Next steps**: [What to do]
   ```

逐步思考。保存为 Markdown。如果提供了原始数据，则生成用于计算的 Python 脚本。

---

### 延伸阅读

- [A/B 测试入门及示例](https://www.productcompass.pm/p/ab-testing-101-for-pms)
- [测试产品创意：终极验证实验库](https://www.productcompass.pm/p/the-ultimate-experiments-library)
- [你正在追踪正确的指标吗？](https://www.productcompass.pm/p/are-you-tracking-the-right-metrics)