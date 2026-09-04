---
name: data-quality-frameworks
description: Implement data quality validation with Great Expectations, dbt tests, and data contracts. Use when building data quality pipelines, implementing validation rules, or establishing data contracts.
---
# 数据质量框架

使用 Great Expectations、dbt 测试和数据契约实现数据质量的生产级模式，确保可靠的数据管道。

## 何时使用此技能

- 在管道中实现数据质量检查
- 设置 Great Expectations 验证
- 构建全面的 dbt 测试套件
- 在团队之间建立数据契约
- 监控数据质量指标
- 在 CI/CD 中自动化数据验证

## 核心概念

### 1. 数据质量维度

| 维度             | 描述                     | 示例检查                                            |
| ---------------- | ------------------------ | -------------------------------------------------- |
| **完整性**       | 无缺失值                 | `expect_column_values_to_not_be_null`              |
| **唯一性**       | 无重复值                 | `expect_column_values_to_be_unique`                |
| **有效性**       | 值在预期范围内           | `expect_column_values_to_be_in_set`                |
| **准确性**       | 数据与现实相符           | 交叉引用验证                                        |
| **一致性**       | 无矛盾                   | `expect_column_pair_values_A_to_be_greater_than_B` |
| **时效性**       | 数据是近期的             | `expect_column_max_to_be_between`                  |

### 2. 数据测试金字塔

```
          /\
         /  \     Integration Tests (cross-table)
        /────\
       /      \   Unit Tests (single column)
      /────────\
     /          \ Schema Tests (structure)
    /────────────\
```

## 快速开始

### Great Expectations 设置

```bash
# Install
pip install great_expectations

# Initialize project
great_expectations init

# Create datasource
great_expectations datasource new
```

```python
# great_expectations/checkpoints/daily_validation.yml
import great_expectations as gx

# Create context
context = gx.get_context()

# Create expectation suite
suite = context.add_expectation_suite("orders_suite")

# Add expectations
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToNotBeNull(column="order_id")
)
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeUnique(column="order_id")
)

# Validate
results = context.run_checkpoint(checkpoint_name="daily_orders")
```

## 详细模式与实操示例

详细的模式文档位于 `references/details.md`。当上方的导航层级不够用时，请阅读该文件。

## Summary: {total_passed}/{total_tables} tables passed")
        report.append("")

        for table, result in results.items():
            status = "✅" if result.passed else "❌"
            report.append(f"### {status} {table}")
            report.append(f"- Expectations: {result.total_expectations}")
            report.append(f"- Failed: {result.failed_expectations}")

            if not result.passed:
                report.append("- Failed checks:")
                for detail in result.details:
                    if not detail["success"]:
                        report.append(f"  - {detail['expectation']}: {detail['observed_value']}")
            report.append("")

        return "\n".join(report)

# Usage
context = gx.get_context()
pipeline = DataQualityPipeline(context)

tables_to_validate = {
    "orders": "orders_suite",
    "customers": "customers_suite",
    "products": "products_suite",
}

results = pipeline.run_all(tables_to_validate)
report = pipeline.generate_report(results)

# Fail pipeline if any table failed
if not all(r.passed for r in results.values()):
    print(report)
    raise ValueError("Data quality checks failed!")
```

## 最佳实践

### 推荐做法

- **尽早测试** - 在转换前验证源数据
- **增量测试** - 在发现问题时逐步添加测试
- **记录期望** - 为每个测试提供清晰的描述
- **失败时告警** - 与监控集成
- **对契约进行版本管理** - 跟踪 schema 变更

### 避免做法

- **不要测试所有内容** - 专注于关键列
- **不要忽略警告** - 警告往往是故障的前兆
- **不要跳过新鲜度检查** - 过期数据就是坏数据
- **不要硬编码阈值** - 使用动态基线
- **不要孤立测试** - 也要测试数据之间的关系
