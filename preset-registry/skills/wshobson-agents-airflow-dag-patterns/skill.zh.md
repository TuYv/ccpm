---
name: airflow-dag-patterns
description: Build production Apache Airflow DAGs with best practices for operators, sensors, testing, and deployment. Use when creating data pipelines, orchestrating workflows, or scheduling batch jobs.
---
# Apache Airflow DAG 设计模式

面向 Apache Airflow 的生产级可用模式，涵盖 DAG 设计、算子（operator）、传感器（sensor）、测试以及部署策略。

## 何时使用本技能

- 使用 Airflow 创建数据管道编排
- 设计 DAG 结构与依赖关系
- 实现自定义算子和传感器
- 在本地测试 Airflow DAG
- 在生产环境中部署 Airflow
- 调试失败的 DAG 运行

## 核心概念

### 1. DAG 设计原则

| 原则            | 描述                          |
| --------------- | ----------------------------------- |
| **幂等性（Idempotent）**   | 运行两次产生相同的结果            |
| **原子性（Atomic）**      | 任务要么完全成功，要么彻底失败      |
| **增量性（Incremental）**  | 只处理新增/变更的数据              |
| **可观测性（Observable）** | 每一步都有日志、指标和告警          |

### 2. 任务依赖

```python
# Linear
task1 >> task2 >> task3

# Fan-out
task1 >> [task2, task3, task4]

# Fan-in
[task1, task2, task3] >> task4

# Complex
task1 >> task2 >> task4
task1 >> task3 >> task4
```

## 快速开始

```python
# dags/example_dag.py
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.empty import EmptyOperator

default_args = {
    'owner': 'data-team',
    'depends_on_past': False,
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'retry_exponential_backoff': True,
    'max_retry_delay': timedelta(hours=1),
}

with DAG(
    dag_id='example_etl',
    default_args=default_args,
    description='Example ETL pipeline',
    schedule='0 6 * * *',  # Daily at 6 AM
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['etl', 'example'],
    max_active_runs=1,
) as dag:

    start = EmptyOperator(task_id='start')

    def extract_data(**context):
        execution_date = context['ds']
        # Extract logic here
        return {'records': 1000}

    extract = PythonOperator(
        task_id='extract',
        python_callable=extract_data,
    )

    end = EmptyOperator(task_id='end')

    start >> extract >> end
```

## 详细模式与完整示例

详细的模式文档位于 `references/details.md`。当上方的导航层级信息不足时，请阅读该文件。

## 最佳实践

### 推荐做法

- **使用 TaskFlow API** - 代码更简洁，自动处理 XCom
- **设置超时** - 防止出现僵尸任务
- **使用 `mode='reschedule'`** - 针对传感器，可释放 worker
- **测试 DAG** - 进行单元测试和集成测试
- **任务保持幂等** - 重试安全无副作用

### 避免做法

- **不要使用 `depends_on_past=True`** - 会造成瓶颈
- **不要硬编码日期** - 使用 `{{ ds }}` 宏
- **不要使用全局状态** - 任务应当是无状态的
- **不要盲目跳过 catchup** - 要理解其影响
- **不要把重逻辑放进 DAG 文件** - 应从模块中导入
