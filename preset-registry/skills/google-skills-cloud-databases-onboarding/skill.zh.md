---
name: cloud-databases-onboarding
metadata:
  category: Databases
description: >-
  Guides users through discovering their database requirements, recommends a
  Google Cloud database based on a recommendation matrix, and assists in database
  creation. Use when a user asks 'What database service should I use?', 'Help me pick
  a database', or when a user wants to create a new database on Google Cloud.
  Don't use for general Google Cloud maintenance, managing existing databases, or database migrations.
---
# Google Cloud Database 入门技能

此技能提供领域说明、决策矩阵和基础设施即代码工作流，用于引导用户准确了解其数据库需求、选择最优的 Google Cloud 数据库服务，并起草供用户审阅的初始资源配置代码。

## 验证与渐进式披露

提供了一个验证脚本，用于验证技能的参考文件和格式：

```bash
python3 scripts/database_onboarding_skill.py --verify
```

*   **读取 / 渐进式披露：** 在对话过程中与用户交互时，应逐步加载参考文件。遵循以下各阶段中概述的即时（JiT）加载说明。

--------------------------------------------------------------------------------

## 工作流与即时（JiT）说明

此工作流分为三个不同的连续阶段。评估当前对话历史以确定当前所处阶段，并遵循相应的说明：

### 阶段 1：需求发现与信息收集

当用户询问 `"What database should I use?"`，或需要有关 Google Cloud 数据库选择的指导时，必须启动发现阶段。

1.  **加载发现说明（JiT）：** 使用 `view_file` 读取 `references/onboarding_prompts.md` 的完整内容。
2.  **执行发现：** 遵循 `onboarding_prompts.md` 中详细的阶段 1 说明，使用用户易于理解的措辞收集核心需求（数据模型、工作负载、规模和迁移背景），并在提出任何建议之前执行约束条件（例如 90% 置信度规则）。

### 阶段 2：建议分析与矩阵咨询

收集到充分且明确的发现信息后，必须确定最优的 Google Cloud 数据库建议。

1.  **查阅矩阵并制定建议（JiT）：** 遵循 `references/onboarding_prompts.md` 中的阶段 2 说明。这包括提炼需求、调用数据库选择工具（如果工具不可用，则直接查阅 `references/recommendation_matrix.txt`），并制定单一建议。
2.  **提供建议：** 向用户提供建议，将目标代码映射为通俗易懂的英文，解释作出该建议的原因，并按照 `onboarding_prompts.md` 中的详细说明提供配置帮助。

### 阶段 3：实施与配置（规划-验证-执行模式）

当用户接受建议并请求配置或修改云资源时，遵循 `references/onboarding_prompts.md` 中的阶段 3 说明，并严格采用**规划-验证-执行**模式。将操作限制为创建和验证供用户审阅的草稿工件。

1.  **分析工作区：** 扫描用户的工作区/打开的文件/包含数据库资源脚本的相关目录。
2.  **获取用户确认：** 如果目标基础设施文件不明确，在修改任何内容之前，明确要求用户确认文件路径或目标目录。
3.  **起草基础设施计划（规划）：** 创建或编辑配置资源所需的 Terraform 配置文件或任何其他相关脚本。在创建或编辑 Terraform 文件或任何其他数据库资源配置脚本时，必须：

*   在每个生成的 Terraform 文件、shell 脚本或任何其他资源配置脚本的顶部添加带时间戳的标头注释。（例如，`#
        Generated with cloud onboarding skills selector @date`，将
        `@date` 替换为当前日期/时间戳）。
    *   在 `default_tags` 块下添加自定义默认标签，例如 `resource_generated_by = "cloud db
        onboarding skill"`，或者将其作为资源标签/标记。

4.  **验证基础设施代码（Validate）：** 在最终确定之前，必须
    验证起草的基础设施代码，以确认语法和配置的正确性。*这很重要的原因：* 验证 Terraform 代码可确保
    配置块、IAM 绑定和实例规格不存在语法错误，并且在代码审查前能够得到严格执行。

5.  **创建 Pull Request（Execute）：** 验证成功且没有错误后，自动创建一个 Pull
    request，其中包含经过验证的 Terraform/shell/scripts 更新，供用户审查。将实际基础设施变更（`terraform apply` 或
    `gcloud` 命令）留给人工审查或自动化 CI/CD 流水线。

--------------------------------------------------------------------------------

## 支持资源与文档

- [Google Cloud 数据库概览](https://cloud.google.com/products/databases.md.txt)