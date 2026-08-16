---
name: design-deploy
description: >-
  Processes GCP infrastructure design and deployment workflows.
  Use when:
  - Designing GCP infrastructure with Terraform.
  - Validating local HCL.
  - Performing best-practice plan scans.
  - Importing templates to Application Design Center (ADC).
  - Deploying templates.
  - Troubleshooting deployment failures.
  Don't use for non-GCP cloud providers, or general Terraform coding outside the ADC context.
license: Apache-2.0
metadata:
  version: v1
  publisher: google
  category: CloudInfrastructure
---
# 自定义基础设施设计与部署技能

## 概述

此技能为 Google Cloud Platform (GCP) 上的整个基础设施生命周期提供了一套规范化、生产级的工作流。它使用模块化 Terraform 和本地 CLI 验证的**智能体控制式设计与验证循环**，取代自动化、不透明的 GAD `design_infra` 工具；随后，在与 Application Design Center (ADC) 注册表同步以进行部署和生命周期管理之前，执行**左移式最佳实践计划扫描**。

始终保持首席云架构师的角色。将本地 Terraform 配置作为事实来源，并确保设计完全符合最佳实践，然后再将其导入云注册表。

--------------------------------------------------------------------------------

## 索引

1.  [前置条件：设置与确认](#pre-requisites-setup-confirmation)
2.  [阶段 1：本地基础设施设计与验证](#phase-1-local-infrastructure-design-validation)
3.  [阶段 2：左移式最佳实践评估与迭代修复](#phase-2-shifted-left-best-practices-assessment-iterative-remediation)
4.  [阶段 3：将 IaC 导入 Application Design Center](#phase-3-import-iac-to-application-design-center)
5.  [阶段 4：应用部署与监控](#phase-4-application-deployment-monitoring)
6.  [阶段 5：排查部署故障](#phase-5-troubleshoot-deployment-failures)
7.  [阶段 6：验证与端到端测试](#phase-6-verification-e2e-testing)

--------------------------------------------------------------------------------

## 前置条件：设置与确认

在执行阶段 1 之前，你**必须**完成以下设置步骤：

1.  **确认目标项目和位置**：

    *   明确要求用户确认目标 GCP **项目 ID**和**位置**（区域）。
    *   如果用户未指定位置，则默认使用 **`us-central1`**。
    *   验证本地环境是否已设置活动项目：

        ```bash
        gcloud config set project <project_id>
        ```

--------------------------------------------------------------------------------

## 阶段 1：本地基础设施设计与验证

**目标**：在本地将用户需求和代码库特征转化为经过 100% 验证、安全且可编译的 Terraform 配置。

1.  **调用 `design` 技能**：针对用户的提示词，调用并执行
    [design](references/design/SKILL.md) 中定义的 `design` 技能。
    *   `design` 技能将在专用暂存目录中自主执行代码库分析、查询目录注册表、规划、HCL 生成以及本地 CLI 验证循环（`terraform init`、`validate`、`plan`）。
2.  **定位已验证的 HCL**：确定 `design` 技能保存已验证、可编译 Terraform 文件的暂存目录（例如 `scratch/tf_validate_<session_id>/`）。
3.  **验证交接（强制）**：继续操作之前，确保 `design` 技能中的本地验证循环已成功完成，并生成无异常的计划。仔细检查 HCL，以验证：
    *   **密钥安全策略**：确认 `terraform.tfvars` 或 HCL 资源块中未写入任何明文凭据、密码或硬编码密钥。所有敏感输入都必须通过 GCP Secret Manager 进行连接。
    *   **状态隔离策略**：确认 HCL 文件中不存在远程后端块（例如 `backend "gcs" {}`）。验证期间，状态必须保留在暂存文件夹本地，以便 ADC 在导入时处理远程状态注册表。
    *   *修复*：如果发现任何违规项，请在 HCL 中进行修正，重新运行本地验证，然后再次进行核验。不得继续使用未经验证或不安全的代码。
4.  **将 Terraform 计划导出为 JSON（强制）**：在暂存目录中运行以下命令，生成二进制计划并将其转换为整洁的 JSON 表示形式：

```bash
    terraform plan -out=tfplan && terraform show -json tfplan > tfplan.json
    ```

    验证 `tfplan.json` 文件是否已成功写入暂存目录。

--------------------------------------------------------------------------------

## 阶段 2：左移式最佳实践评估与迭代修复

**目标**：在将本地计划导入云注册表之前，使用原生 ADC 计划评估 API，
验证该计划是否符合安全性、成本和可靠性基准。

1.  **发现 Space ID（强制）**：在运行评估或创建模板之前，
    你**必须**动态发现目标位置中处于活动状态的 ADC Space ID：

    *   **列出 Space**：运行以下命令：

        ```bash
        gcloud design-center spaces list --project=<project_id> --location=<location>
        ```

    *   **选择 Space**：解析输出以识别处于活动状态的 Space（例如
        `test-deploy` 或 `googlespace`）。如果存在多个 Space，请让用户
        确认。如果不存在 Space，请询问用户或创建一个：

        ```bash
        gcloud design-center spaces create <space_id> --project=<project_id> --location=<location>
        ```

2.  **通过 gcloud 执行计划评估**：使用已发现的 Space ID 和导出的
    `tfplan.json` 文件运行基于计划的评估。直接在终端中执行以下命令：

    ```bash
    gcloud design-center spaces generate-terraform-assessment-report <space_id> \
        --location=<location> \
        --project=<project_id> \
        --terraform-plan="<scratch_directory_path>/tfplan.json" \
        --format=json
    ```

3.  **分析发现项**：以清晰的表格格式向用户展示所有发现项，详细说明
    具体违规项、资源范围及相关严重级别。

4.  **本地修复循环**：

    *   **不要**尝试导入或提交不安全的代码。
    *   编辑暂存目录中的**本地 HCL 文件**，以修复报告的违规项
        （例如，添加加密密钥、启用 OS Login 或限制 IAM 范围）。
    *   重新运行阶段 1 的本地验证并导出计划：

        ```bash
        terraform validate && terraform plan -out=tfplan && terraform show -json tfplan > tfplan.json
        ```

    *   重新运行步骤 2 中所示的计划评估命令。

5.  **退出条件**：

    *   所有高危/严重发现项均已解决，或已记录可接受的权衡。
    *   最多进行三（3）次迭代尝试。达到无问题或可接受状态后，
        继续进入阶段 3。

--------------------------------------------------------------------------------

## 阶段 3：将 IaC 导入 Application Design Center

**目标**：将经过全面验证且符合最佳实践的本地 HCL 配置与 ADC 云注册表
同步，以建立可部署的模板资源。

1.  **验证或创建 Application Template（强制）**：导入 HCL 之前，
    你**必须**确保父级 Application Template 资源存在于已发现的 ADC Space 中。

*   **检查是否存在**：运行 `gcloud design-center spaces
        application-templates describe <template_id> --space=<space_id>
        --project=<project_id> --location=<location>` 检查模板是否存在。
    *   **缺失时创建**：如果 describe 命令返回 `NOT_FOUND`
        错误，请先运行以下命令创建模板资源：

        ```bash
        gcloud design-center spaces application-templates create <template_id> --space=<space_id> --project=<project_id> --location=<location> --display-name="<Name>" --description="<Description>"
        ```

2.  **严格的 HCL 解析器约束（关键）：** 在调用导入操作之前，请确保本地 HCL
    符合 ADC 注册表的严格摄取规则：

    *   **纯模块策略（禁止资源块）：** ADC 解析器严格
        **禁止导入的 HCL 中包含任何 `resource` 块**。仅允许
        `module`、`variable`、`output` 和 `provider` 块。如果需要某项
        资源（例如 Private Service Access 对等互连），但目录中没有为其注册
        独立模块，则你必须检查现有的已注册模块内是否将其作为内置配置选项
        支持（例如在 `module "vpc"` 中设置 `private_service_access_config`）。
    *   **严格的字符串类型：** ADC 解析器不会执行从布尔值到字符串的隐式
        类型强制转换。例如，子网专用访问必须声明为字符串字面量：
        `subnet_private_access = "true"`，而**不能**使用布尔值 `true`。
    *   **禁止 Terraform 块：** 解析器严格禁止 `terraform {}`
        版本约束块。请将其从 `providers.tf` 或
        `main.tf` 中完全省略。

3.  **导入 ADC 模板**：确认模板资源存在且 HCL 已根据上述约束完成验证后，
    调用托管的 `application_design_center:manage_application_template` MCP 工具，
    并使用 `APPLICATION_TEMPLATE_OPERATION_IMPORT_IAC` 操作：

    *   **参数**：

        *   `project`：目标项目 ID。
        *   `location`：GCP 部署区域（例如 `us-central1`）。
        *   `spaceId`：已发现的 ADC 空间 ID。
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

    *   **弹性与重试（强制要求）**：

        *   如果 `IMPORT_IAC` 调用因暂时性错误（例如 `502
            Bad Gateway`、`504 Gateway Timeout` 或 `429 Rate Limit`）而失败，**不要
            立即重试**。
        *   使用**带抖动的指数退避**（例如等待 2 秒、4 秒、8 秒，
            再加上随机的不足一秒时长）。
        *   **重试前验证修订版本**：如果发生超时，请先调用
            `gcloud alpha design-center spaces application-templates describe`
            检查导入是否已在后台成功完成。仅当模板未更新时才重试。

4.  **获取模板 URI**：成功后，这将在您的空间中创建模板
    资源。使用以下模式构造 `applicationTemplateUri`：
    `projects/{project}/locations/{location}/spaces/{spaceId}/applicationTemplates/{applicationTemplateId}`

--------------------------------------------------------------------------------

## 阶段 4：应用部署与监控

**目标**：将经过验证且符合最佳实践的应用模板部署到
GCP 环境。

1.  **部署应用**：调用托管的
    `application_design_center:manage_application` MCP 工具，并使用
    `APPLICATION_OPERATION_DEPLOY` 操作：
    *   **参数**：
        *   `project`：目标项目 ID。
        *   `location`：目标部署位置。
        *   `spaceId`：目标空间 ID。
        *   `applicationId`：已部署应用实例的唯一 ID。
        *   `applicationTemplateUri`：在阶段 3 中创建的 URI。
        *   `serviceAccount`：部署服务账号。
    *   **韧性与重试（强制）**：
        *   如果 `DEPLOY` 操作因暂时性网络或网关
            错误（例如 `502`、`504`）而失败，请在重试前应用**带
            抖动的指数退避**。
        *   如果部署 LRO 超时或因状态冲突而失败，
            请使用 `gcloud design-center spaces
            applications describe` 验证应用状态，以便在重试
            部署调用之前确认其状态，避免发生并发部署冲突。
2.  **主动监控 LRO**：
    *   该工具会返回一个长时间运行的操作（LRO）。告知用户
        部署已开始。
    *   在轮询部署状态期间**不要休眠**。使用命令 `gcloud
        design-center operations describe <operation_name>` 每 30–60 秒主动轮询一次 LRO，
        直到 `done: true`。
3.  **处理结果**：
    *   **成功**：如果 `done` 为 `true` 且不存在 `error` 字段，则继续
        执行阶段 6。
    *   **失败**：如果存在 `error` 字段，请分析错误类型并
        继续执行阶段 5。

--------------------------------------------------------------------------------

## 阶段 5：排查部署失败问题

**目标**：使用专门的故障排查技能和既有的云端解决模式，
以迭代方式诊断并修复部署失败问题。

1.  **迭代式云端解决模式（关键）：** 如果部署因
    `REVISION_FAILED` 或 `TERRAFORM` 错误而失败，请检查以下常见的
    资源冲突：

    *   **服务账号 409 冲突（`alreadyExists`）：** 如果部署
        因模块生成的服务账号（例如
        `frontend-service-us-central-sa`）已存在于项目中而失败，
        请通过禁用服务账号创建并引用现有服务账号来修复本地 HCL：

        ```hcl
        create_service_account = false
        service_account        = "<existing_service_account_email>"
        ```

*   **容器镜像 404 NotFound：** 如果部署因找不到容器镜像而失败，请确认该镜像存在于你的注册表中。对于测试或 hello-world 部署，请使用 Google 官方的公开 hello-world 镜像：
        `us-docker.pkg.dev/cloudrun/container/hello`

2.  **委托给故障排查 Skill**：如果发生部署失败且不符合上述模式，请调用并执行专门的 `infra-deployment-debugging` Skill（位于 [infra-deployment-debugging](references/infra-deployment-debugging/SKILL.md)）。

3.  **选择故障排查上下文**：

    *   **对于本地验证错误（阶段 1/2）**：按照故障排查 Skill 中的 **Case B: Raw Terraform Deployment** 说明，隔离语法、编译和计划阶段的验证错误。
    *   **对于云部署失败（阶段 4）**：按照故障排查 Skill 中的 **Case A: ADC Application Deployment** 说明，分析 LRO 错误、检索服务日志并诊断云环境问题。

4.  **优先应用本地修复**：

    *   按照故障排查 Skill 的修复指南制定修复方案。
    *   **强制要求**：将修复直接应用于暂存目录中的**本地 HCL 文件**，重新运行本地验证、重新导入 HCL，并触发新的部署。
    *   重新运行阶段 1 的本地验证和计划导出：

        ```bash
        terraform validate && terraform plan -out=tfplan && terraform show -json tfplan > tfplan.json
        ```

    *   重新运行计划评估（阶段 2），确保未引入新的违规项。

    *   使用 `APPLICATION_TEMPLATE_OPERATION_IMPORT_IAC` 将修正后的 HCL 重新导入 ADC。

    *   使用 `APPLICATION_OPERATION_DEPLOY` 触发新的部署。

5.  **迭代次数上限**：重复执行故障排查、验证、导入和重新部署循环，最多五（5）次。如果仍然失败，请向用户报告完整历史记录和诊断信息。

--------------------------------------------------------------------------------

## 阶段 6：验证与 E2E 测试

**目标**：确认已部署的服务运行状况良好且功能完全正常。

1.  **检索已部署资源**：调用托管的 `application_design_center:manage_application` MCP 工具并使用 `APPLICATION_OPERATION_GET` 操作，以检索资源详细信息、公共端点和输出参数。
2.  **运行状况检查**：验证所有服务均使用正确的容器镜像 URL，并且其运行时状态正常。
3.  **E2E 验证**：执行简单的演示测试（例如，检查公共 HTTP 端点或触发试运行事务），以确保 E2E 功能正常。向用户提供测试结果和公共 URL，以结束任务。

## 报告问题

请在 [Google Skills Issues](https://github.com/google/skills/issues) 报告此 Skill 的错误或改进建议。