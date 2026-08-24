---
name: dummy-dataset
description: "Generate realistic dummy datasets for testing with customizable columns, constraints, and output formats (CSV, JSON, SQL, Python script). Use when creating test data, building mock datasets, or generating sample data for development and demos."
---
# 虚拟数据集生成

生成用于测试的逼真虚拟数据集，支持自定义列、约束条件和输出格式（CSV、JSON、SQL、Python 脚本）。创建可执行脚本或直接生成数据文件，以便立即使用。

**使用场景：** 创建测试数据、生成示例数据集、构建用于开发的逼真模拟数据，或填充测试环境。

**参数：**
- `$PRODUCT`：产品或系统名称
- `$DATASET_TYPE`：数据类型（例如客户反馈、交易记录、用户档案）
- `$ROWS`：要生成的行数（默认值：100）
- `$COLUMNS`：要包含的具体列或字段
- `$FORMAT`：输出格式（CSV、JSON、SQL、Python 脚本）
- `$CONSTRAINTS`：其他约束条件或业务规则

## 分步流程

1. **识别数据集类型** - 了解数据领域
2. **定义列规范** - 名称、数据类型和值范围
3. **确定行数** - 所需的示例记录数量
4. **选择输出格式** - CSV、JSON、SQL INSERT 或 Python 脚本
5. **应用逼真模式** - 确保数据看起来真实且有效
6. **添加业务约束** - 遵循业务逻辑和数据关系
7. **生成数据或编写脚本** - 创建可执行输出
8. **验证输出** - 确保数据质量和完整性

## 模板：Python 脚本输出

```python
import csv
import json
from datetime import datetime, timedelta
import random

# Configuration
ROWS = $ROWS
FILENAME = "$DATASET_TYPE.csv"

# Column definitions with realistic value generators
columns = {
    "id": "auto-increment",
    "name": "first_last_name",
    "email": "email",
    "created_at": "timestamp",
    # Add more columns...
}

def generate_dataset():
    """Generate realistic dummy dataset"""
    data = []
    for i in range(1, ROWS + 1):
        record = {
            "id": f"U{i:06d}",
            # Generate values based on column definitions
        }
        data.append(record)
    return data

def save_as_csv(data, filename):
    """Save dataset as CSV"""
    with open(filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

if __name__ == "__main__":
    dataset = generate_dataset()
    save_as_csv(dataset, FILENAME)
    print(f"Generated {len(dataset)} records in {FILENAME}")
```

## 示例数据集规范

**数据集类型：** 客户反馈

**列：**
- feedback_id（自动递增，U001、U002……）
- customer_name（逼真的姓名）
- email（有效的电子邮件格式）
- feedback_date（最近 90 天内的日期）
- rating（1-5 星）
- category（Bug、Feature Request、Complaint、Praise）
- text（逼真的反馈内容）
- product（电子产品、服装、家居）

**约束条件：**
- 评分分布倾斜：40% 为 5 星，30% 为 4 星，20% 为 3 星，10% 为 1-2 星
- Bug 类别只能对应 1-3 星评分
- Feature Request 只能对应 3-5 星评分
- 电子邮件域名应具有真实性（gmail、yahoo、company.com）

## 输出交付物

- 可直接执行的 Python 脚本或直接生成的数据文件
- 包含正确表头和格式的 CSV 文件
- 结构和类型有效的 JSON 文件
- 用于填充数据库的 SQL INSERT 语句
- 数据验证和约束符合性检查
- 逼真且符合业务场景的值
- 数据生成逻辑文档
- 数据集使用快速入门说明

## 输出格式

**CSV：** 扁平表格格式，便于导入电子表格和数据库

**JSON：** 嵌套结构，非常适合 API 和 NoSQL 数据库

**SQL：** INSERT 语句，可直接在关系数据库上执行

**Python Script：** 可执行的生成器，用于自定义或大型数据集