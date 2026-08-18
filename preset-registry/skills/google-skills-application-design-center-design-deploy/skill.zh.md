---
name: application-design-center-design-deploy
description: >-
  Processes GCP infrastructure design and deployment workflows within Application Design Center (ADC).
  Use when:
  - Designing GCP infrastructure with Terraform.
  - Validating local HCL.
  - Performing best-practice plan scans.
  - Importing templates to Application Design Center (ADC).
  - Deploying templates.
  - Troubleshooting deployment failures.
  Boundaries:
  - Only use for GCP-specific cloud infrastructure.
  - Only use for Terraform coding within the ADC context.
license: Apache-2.0
metadata:
  version: v1
  publisher: google
  category: CloudInfrastructure
---
# 使用 Application Design Center 设计和部署 GCP 基础设施

## 概述

此 skill 为 Google Cloud Platform (GCP) 上的整个基础设施生命周期提供了一套规范化的生产级工作流。它使用由 **代理控制的设计和验证循环**取代自动化且不透明的 GAD `design_infra` 工具：该循环利用模块化 Terraform 和本地 CLI 验证，随后在与 Application Design Center (ADC) 注册表同步以进行部署和生命周期管理之前，执行**左移的最佳实践计划扫描**。

始终保持首席云架构师的角色。将本地 Terraform 配置作为事实来源，并确保设计完全符合最佳实践，然后再将其导入云注册表。

--------------------------------------------------------------------------------

## 索引

1.  [先决条件：设置与确认](#pre-requisites-setup-confirmation)
2.  [阶段 1：本地基础设施设计与验证](#phase-1-local-infrastructure-design-validation)
3.  [阶段 2：左移的最佳实践评估与迭代式修复](#phase-2-shifted-left-best-practices-assessment-iterative-remediation)
4.  [阶段 3：将 IaC 导入 Application Design Center](#phase-3-import-iac-to-application-design-center)
5.  [阶段 4：应用部署与监控](#phase-4-application-deployment-monitoring)
6.  [阶段 5：排查部署失败问题](#phase-5-troubleshoot-deployment-failures)
7.  [阶段 6：验证与端到端测试](#phase-6-verification-e2e-testing)

--------------------------------------------------------------------------------

## 先决条件：设置与确认

在执行阶段 1 之前，你**必须**完成以下设置步骤：

1.  **确认目标项目和位置**：

    *   明确要求用户确认目标 GCP **项目 ID** 和**位置**（区域）。
    *   如果用户未指定位置，则使用 **`us-central1`** 作为默认值。
    *   验证本地环境是否已设置活动项目：

        ```bash
        gcloud config set project <project_id>
        ```

--------------------------------------------------------------------------------

## 阶段 1：本地基础设施设计与验证

**目标**：将用户需求和代码库特征转换为一份经过 100% 验证、安全且可编译的 Terraform 配置。

1.  **调用 `design` Skill**：针对用户的提示调用并执行 `design` skill（定义于
    [design](references/design_guide.md)）。
    *   `design` skill 将在专用临时目录中自主执行代码库分析、查询目录注册表、规划、HCL 生成以及本地 CLI 验证循环（`terraform init`、`validate`、`plan`）。
2.  **定位已验证的 HCL**：识别 `design`
    skill 保存已验证且可编译 Terraform 文件的临时目录（例如：
    `scratch/tf_validate_<session_id>/`）。
3.  **验证交接（强制）**：确保 `design` skill 中的本地验证循环已成功完成，并生成无变更的计划，然后再继续。仔细检查 HCL，确认：
    *   **安全存储策略**：确认 `terraform.tfvars` 或 HCL 资源块中没有以明文形式写入的凭据、密码或硬编码密钥。所有敏感输入都必须通过 GCP Secret Manager 接入。
    *   **状态隔离策略**：确认 HCL 文件中没有远程后端块（例如 `backend "gcs" {}`）。在验证期间，状态必须保留在临时文件夹的本地，以便 ADC 在导入时处理远程状态注册表。
    *   *修复*：如果发现任何违规问题，请在 HCL 中进行修正，重新运行本地验证，并再次确认。不要继续使用未经验证或不安全的代码。
4.  **将 Terraform 计划导出为 JSON（强制）**：在临时目录中运行以下命令，以生成二进制计划并将其转换为干净的 JSON 表示：

```bash
    terraform plan -out=tfplan && terraform show -json tfplan > tfplan.json
    ```

    验证 `tfplan.json` 文件已成功写入暂存目录。

--------------------------------------------------------------------------------

## 阶段 2：左移最佳实践评估与迭代修复

**目标**：在将本地计划导入云注册表之前，使用原生 ADC 计划评估 API，验证本地计划是否符合安全性、成本和可靠性基准。

1.  **发现 Space ID（必须）**：在运行评估或创建模板之前，**必须**动态发现目标位置中的活动 ADC Space ID：

    *   **列出 Spaces**：运行以下命令：

        ```bash
        gcloud design-center spaces list --project=<project_id> --location=<location>
        ```

    *   **选择 Space**：解析输出以识别活动 space（例如 `test-deploy` 或
        `googlespace`）。如果存在多个 space，请要求用户确认。如果不存在
        space，请询问用户或创建一个：

        ```bash
        gcloud design-center spaces create <space_id> --project=<project_id> --location=<location>
        ```

2.  **通过 gcloud 执行计划评估**：使用发现的 Space ID 和导出的 `tfplan.json`
    文件运行基于计划的评估。直接在终端中执行以下命令：

    ```bash
    gcloud design-center spaces generate-terraform-assessment-report <space_id> \
        --location=<location> \
        --project=<project_id> \
        --terraform-plan="<scratch_directory_path>/tfplan.json" \
        --format=json
    ```

3.  **分析发现结果**：以清晰的表格格式向用户展示所有发现结果，详细说明具体违规项、资源范围和相应的严重级别。

4.  **本地修复循环**：

    *   **不得**尝试导入或提交不安全的代码。
    *   编辑暂存目录中的**本地 HCL 文件**，修复报告的违规项（例如，添加加密密钥、启用 OS Login 或限制 IAM 范围）。
    *   重新运行阶段 1 的本地验证和计划导出：

        ```bash
        terraform validate && terraform plan -out=tfplan && terraform show -json tfplan > tfplan.json
        ```

    *   重新运行步骤 2 中所示的计划评估命令。

5.  **退出标准**：

    *   所有高危/严重发现结果均已解决，或已记录可接受的权衡。
    *   最多进行三（3）次迭代尝试。完成清理或达到可接受状态后，继续执行阶段 3。

--------------------------------------------------------------------------------

## 阶段 3：将 IaC 导入 Application Design Center

**目标**：将经过完整验证并符合最佳实践的本地 HCL 配置同步到 ADC 云注册表，以建立可部署的模板资源。

1.  **验证或创建 Application Template（必须）**：在导入 HCL 之前，**必须**确保父级 Application Template 资源存在于已发现的 ADC space 中。

*   **检查是否存在**：运行 `gcloud design-center spaces
        application-templates describe <template_id> --space=<space_id>
        --project=<project_id> --location=<location>`，检查模板是否存在。
    *   **缺失时创建**：如果 describe 命令返回 `NOT_FOUND`
        错误，请先运行以下命令创建模板资源：

        ```bash
        gcloud design-center spaces application-templates create <template_id> --space=<space_id> --project=<project_id> --location=<location> --display-name="<Name>" --description="<Description>"
        ```

2.  **严格的 HCL 解析器限制（重要）：** 在调用导入
    操作之前，请确保本地 HCL 符合 ADC 注册表的严格摄取规则：

    *   **纯模块策略（不允许资源块）：** ADC 解析器严格
        **禁止**导入的 HCL 中包含任何 `resource` 块。只允许使用
        `module`、`variable`、`output` 和 `provider` 块。如果需要某个资源（例如 Private Service Access
        对等连接），但目录中没有为其注册独立模块，则必须检查它是否作为现有已注册模块中的内置配置选项受到支持（例如在
        `module "vpc"` 中设置 `private_service_access_config`）。
    *   **严格的字符串类型要求：** ADC 解析器不会执行从布尔值到字符串的隐式类型转换。例如，子网私有访问必须声明为字面量字符串：
        `subnet_private_access = "true"`，而不能声明为布尔值 `true`。
    *   **不允许使用 Terraform 块：** 解析器严格禁止使用
        `terraform {}` 版本约束块。请完全不要在 `providers.tf` 或 `main.tf` 中添加该块。

3.  **导入到 ADC 模板：** 确认模板资源存在，并根据上述限制验证 HCL
    后，使用 `APPLICATION_TEMPLATE_OPERATION_IMPORT_IAC` 操作调用托管的
    `application_design_center:manage_application_template` MCP 工具：

    *   **参数**：

        *   `project`：目标项目 ID。
        *   `location`：GCP 部署区域（例如 `us-central1`）。
        *   `spaceId`：发现的 ADC 空间 ID。
        *   `applicationTemplateId`：应用模板的唯一名称。
        *   `operation`：`APPLICATION_TEMPLATE_OPERATION_IMPORT_IAC`
        *   `iacModule`：包含文件列表的结构化对象：

            ```json
            {
              "files": [
                { "name": "main.tf", "content": "<content of main.tf>" },
                { "name": "variables.tf", "content": "<content of variables.tf>" },
                { "name": "terraform.tfvars", "content": "<content of terraform.tfvars>" }
              ]
            }
            ```

    *   **弹性与重试（强制要求）：**

        *   如果 `IMPORT_IAC` 调用因暂时性错误（例如 `502
            Bad Gateway`、`504 Gateway Timeout` 或 `429 Rate Limit`）失败，**不要立即重试**。
        *   使用**带抖动的指数退避**（例如等待 2 秒、4 秒、8 秒，
            再加上随机的小数秒）。
        *   **重试前验证修订版本**：如果发生超时，首先调用
            `gcloud alpha design-center spaces application-templates describe`
            检查导入是否已在后台实际成功。仅当模板未更新时才重试。

4.  **捕获模板 URI**：成功后，这将在您的空间中建立模板
    资源。使用以下模式构造 `applicationTemplateUri`：
    `projects/{project}/locations/{location}/spaces/{spaceId}/applicationTemplates/{applicationTemplateId}`

--------------------------------------------------------------------------------

## 阶段 4：应用部署与监控

**目标**：将经过验证且符合最佳实践的应用模板部署到
GCP 环境中。

1.  **部署应用**：调用托管的
    `application_design_center:manage_application` MCP 工具，并使用
    `APPLICATION_OPERATION_DEPLOY` 操作：
    *   **参数**：
        *   `project`：目标项目 ID。
        *   `location`：目标部署位置。
        *   `spaceId`：目标空间 ID。
        *   `applicationId`：已部署应用实例的唯一 ID。
        *   `applicationTemplateUri`：在阶段 3 中建立的 URI。
        *   `serviceAccount`：部署服务账号。
    *   **弹性与重试（强制）**：
        *   如果 `DEPLOY` 操作因瞬态网络或网关错误（例如 `502`、`504`）失败，请在重试前应用**带抖动的指数退避**。
        *   如果部署 LRO 超时或因状态冲突失败，请使用 `gcloud design-center spaces
            applications describe` 验证应用状态，在重试 deploy 调用前确认其状态，从而避免并发的冲突部署。
2.  **主动监控 LRO**：
    *   该工具会返回一个长时间运行的操作（LRO）。告知用户部署已开始。
    *   **不要在部署期间休眠**进行状态轮询。每隔 30–60 秒主动轮询一次 LRO，直到 `done: true`，使用命令 `gcloud
        design-center operations describe <operation_name>`。
3.  **处理结果**：
    *   **成功**：如果 `done` 为 `true` 且不存在 `error` 字段，则继续执行阶段 6。
    *   **失败**：如果存在 `error` 字段，则分析错误类型并继续执行阶段 5。

--------------------------------------------------------------------------------

## 阶段 5：排查部署失败

**目标**：使用专门的故障排查技能和既定的云端解决模式，迭代诊断并修复部署失败。

1.  **迭代式云端解决模式（关键）**：如果部署因 `REVISION_FAILED` 或 `TERRAFORM` 错误失败，请检查以下常见资源冲突：

    *   **服务账号 409 冲突（`alreadyExists`）**：如果部署失败的原因是模块生成的服务账号（例如
        `frontend-service-us-central-sa`）已存在于项目中，
        请通过禁用服务账号创建并引用现有服务账号来修复本地 HCL：

        ```hcl
        create_service_account = false
        service_account        = "<existing_service_account_email>"
        ```

*   **容器映像 404 NotFound：**如果部署失败是因为找不到容器映像，请确认该映像存在于您的注册表中。对于测试或 hello-world 部署，请使用官方公开的 Google hello-world 映像：
        `us-docker.pkg.dev/cloudrun/container/hello`

2.  **委托给故障排除 Skill**：如果发生部署失败且不符合上述模式，请调用并执行专用的
    `infra-deployment-debugging` 指南（位于
    [infra-deployment-debugging](references/troubleshooting_guide.md)）。

3.  **选择故障排除上下文**：

    *   **对于本地验证错误（阶段 1/2）**：按照故障排除 Skill 中的**案例 B：原始
        Terraform 部署**说明操作，以隔离语法、编译和计划时验证错误。
    *   **对于云部署失败（阶段 4）**：按照故障排除 Skill 中的**案例 A：ADC
        应用部署**说明操作，以分析 LRO 错误、获取服务日志并诊断云环境问题。

4.  **应用本地优先的修复措施**：

    *   按照故障排除 Skill 的修复指南制定解决方案。
    *   **必须执行**：直接在临时目录中的**本地 HCL 文件**应用修复，重新运行本地验证，重新导入 HCL，并触发新的部署。
    *   重新运行阶段 1 的本地验证和计划导出：

        ```bash
        terraform validate && terraform plan -out=tfplan && terraform show -json tfplan > tfplan.json
        ```

    *   重新运行计划评估（阶段 2），确保没有引入新的违规项。

    *   使用
        `APPLICATION_TEMPLATE_OPERATION_IMPORT_IAC`
        将修正后的 HCL 重新导入 ADC。

    *   使用 `APPLICATION_OPERATION_DEPLOY` 触发新的部署。

5.  **迭代阈值**：最多重复故障排除、验证、导入和重新部署流程五（5）次。如果仍然失败，请向用户报告完整的历史记录和诊断信息。

--------------------------------------------------------------------------------

## 阶段 6：验证与 E2E 测试

**目标**：确认已部署的服务运行状况良好且功能完整。

1.  **获取已部署资源**：调用托管的
    `application_design_center:manage_application` MCP 工具，并使用
    `APPLICATION_OPERATION_GET` 操作获取资源详细信息、
    公共端点和输出参数。
2.  **健康检查**：验证所有服务是否使用正确的容器映像 URL，以及其运行时状态是否健康。
3.  **E2E 验证**：执行简单的演示测试（例如检查公共 HTTP 端点或触发试运行事务），以确保 E2E 功能正常。向用户展示结果和公共 URL，以完成任务。

## 报告问题

请在 [Google Skills Issues](https://github.com/google/skills/issues) 中报告此 Skill 的错误或改进建议。