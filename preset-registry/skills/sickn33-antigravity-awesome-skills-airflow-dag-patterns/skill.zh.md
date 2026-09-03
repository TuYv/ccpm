---
name: airflow-dag-patterns
description: "Build production Apache Airflow DAGs with best practices for operators, sensors, testing, and deployment. Use when creating data pipelines, orchestrating workflows, or scheduling batch jobs."
risk: safe
source: community
date_added: "2026-02-27"
---
# Apache Airflow DAG 模式

适用于 Apache Airflow 的生产级模式，涵盖 DAG 设计、算子、传感器、测试和部署策略。

## 何时使用此技能

- 使用 Airflow 进行数据管道编排
- 设计 DAG 结构与依赖关系
- 实现自定义算子和传感器
- 在本地测试 Airflow DAG
- 在生产环境中搭建 Airflow
- 调试失败的 DAG 运行

## 何时不应使用此技能

- 你只需要简单的 cron 作业或 shell 脚本
- 工具链中不包含 Airflow
- 任务与工作流编排无关

## 操作说明

1. 识别数据源、调度计划和依赖关系。
2. 设计职责明确、支持重试的幂等任务。
3. 实现带有可观测性和告警钩子的 DAG。
4. 在预发布环境中验证，并编写运维手册。

详细的模式、清单和模板请参阅 `resources/implementation-playbook.md`。

## 安全事项

- 避免在未经批准的情况下更改生产环境的 DAG 调度计划。
- 谨慎测试回填和重试，防止数据重复。

## 资源

- `resources/implementation-playbook.md`：详细的模式、清单和模板。

## 局限性

- 仅当任务明确符合上述范围时才使用此技能。
- 不要将输出视为针对特定环境的验证、测试或专家评审的替代。
- 如果缺少必需的输入、权限、安全边界或成功标准，请停止并请求澄清。
