---
name: infra-deployment-debugging
description: >-
  Troubleshoots infrastructure deployment failures.
  Use when analyzing deployment failures of ADC applications or direct/raw Terraform deployment errors.
  Don't use for design, local validation, plan assessment, or non-deployment troubleshooting.
license: Apache-2.0
metadata:
  version: v1
  publisher: google
  category: CloudInfrastructure
---
# 部署故障排除 Skill

使用此 Skill 分析并解决部署失败问题。此 Skill 支持排查：

1.  **ADC 应用**：部署在 Application Design Center 中的高层级设计。
2.  **原始 Terraform (TF)**：直接通过 Terraform HCL 文件管理的基础设施配置。

## 约束

-   **使用标准工具**：与 GCP 的所有交互都必须使用标准命令（例如 `gcloud`、`terraform`）。不得使用自定义内部后端 API。
-   **不得进行真实部署**：在任何情况下都绝不能运行会更改资源的部署命令（例如 `gcloud design-center spaces applications deploy` 或 `terraform apply`），因为这是一个只读验证和试运行故障排除工作流。
-   **只读式发现**：在发现阶段不得运行会更改资源的命令。发现过程必须严格保持只读。
-   **严格遵循步骤**：你必须依次执行所选故障排除模板中的所有步骤。不得跳过步骤或直接进行修复，即使错误看起来显而易见。必须执行每个步骤（例如初始化、验证、计划，或获取描述信息/日志）并验证其输出。

## 故障排除流程（渐进式披露）

首先，你必须根据用户的输入确定适当的故障排除上下文。

### 第 1 步：确定入口点

评估用户提供的输入：

-   **情形 A：ADC 应用部署**：
    *   **判断依据**：输入包含 `application_uri`（例如 `projects/P/locations/L/spaces/S/applications/A`），或提及 App Design Center 上下文。
    *   **操作**：阅读并遵循 [adc_application_troubleshooting.md](templates/adc_application_troubleshooting.md) 中的详细说明，以完成故障排除任务。
-   **情形 B：原始 Terraform 部署**：
    *   **判断依据**：输入包含原始 Terraform 配置代码（HCL 内容）、`.tf` 文件，或直接执行 Terraform plan/apply 时产生的错误。
    *   **操作**：阅读并遵循 [raw_terraform_troubleshooting.md](templates/raw_terraform_troubleshooting.md) 中的详细说明，以完成故障排除任务。

## 报告问题

请前往 [Google Skills Issues](https://github.com/google/skills/issues) 报告此 Skill 的错误或改进建议。