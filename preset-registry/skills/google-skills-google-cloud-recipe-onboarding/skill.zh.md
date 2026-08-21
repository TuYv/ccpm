---
name: google-cloud-recipe-onboarding
metadata:
  category: GettingStarted
description: >-
  Guides a developer's first steps on Google Cloud, covering account creation,
  billing setup, project management, and deploying a first resource.
  Use when a new developer wants to initialize their first Google Cloud project,
  configure billing, and verify deployment.
  Don't use for enterprise organization setup (use Google Cloud Setup guided flow for that instead).
  Don't use for complex multi-project architectures.
---
# Google Cloud 上手指南

此技能为独立开发者提供了一条精简、非交互式的“顺畅路径”，帮助其开始使用 [Google Cloud](https://cloud.google.com/)。它涵盖从环境验证和身份验证，到项目选择、结算账号关联以及后续安全链式衔接的完整流程。

> [!IMPORTANT]
> 对于执行此技能的自主代理：
> 1. **变更前检查审计**：在提议或执行任何项目或结算变更之前，始终以静默方式执行变更前状态审计。
> 2. **单问题策略**：在交互式执行过程中，每次仅向用户询问**一个**操作参数或确认事项。
> 3. **非交互式输出**：为所有变更命令附加非交互式覆盖参数（`--quiet`、`--format="json"`），以确保输出具有确定性且可由机器解析，并防止终端挂起。
> 4. **首轮交互规则（触发轮次）**：当开发者首次通过一般性的上手请求触发此技能时（例如说“我想开始使用 Google Cloud”）：
>    - **前言指引**：主动提供一段简短的引导性前言，指导开发者创建 Google Cloud 账号（指向位于 `https://console.cloud.google.com/` 的控制台），并运行 `gcloud auth login` 以授权其工作站，即使他们看起来已经登录。
>    - **首轮单问题**：以静默方式执行预检审计，但不要在第一轮中提供完整的参数汇总表，也不要请求最终同意。相反，应仅向开发者提出**一个**初始操作问题（例如，*“你想复用现有的活跃项目，还是创建一个全新的项目？”*）。
>    *注意：如果开发者的初始提示明确声明“我批准此上手配置”“让我们继续执行上手流程”，或请求试运行计划（例如“向我展示确切的计划或试运行命令”），则跳过通用前言和初始问题，直接进入所请求的步骤。*

---

## 概述

对于个人开发者而言，开始使用 Google Cloud 需要验证本地终端工具、建立经过身份验证的会话、选择或创建一个工作区（[项目](https://docs.cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy.md.txt)），并将其关联到有效的结算账号。Google Cloud 为首次使用的用户提供免费层级和包含 $300 赠金的免费试用。[在此了解更多信息](https://docs.cloud.google.com/free/docs/free-cloud-features)。

---

## 前提条件

- 个人 Google 账号（例如 `@gmail.com`），或 Google Workspace / Cloud Identity 账号。
- 有效的付款方式（信用卡或银行账户），用于身份验证以及激活“概述”中提到的 $300 免费试用赠金。

---

## 步骤

### 第 1 节：验证主机工具设置

在征求输入或提议变更之前，以静默方式审计主机系统当前使用的工具及环境状态。

1. 检查 `gcloud` CLI 二进制文件是否已安装且可访问：
   
   ```bash
   which gcloud
   ```
2. 检查是否存在有效的已认证身份会话：
   
   ```bash
   gcloud auth list --format="json"
   ```
3. 如果 `which gcloud` 的执行前审计返回有效路径，请直接进入第 2 节：认证并路由会话。
4. 如果缺少该二进制文件，请停止执行，并指引智能体/开发者参阅 [gcloud skill](https://github.com/google/skills/tree/main/skills/cloud/gcloud) 或官方 [Google Cloud CLI 安装指南](https://docs.cloud.google.com/sdk/docs/install-sdk.md.txt)，完成设置和认证后再重试。

---

### 第 2 节：认证并路由会话

授权 gcloud CLI 使用开发者的 Google 账号访问 Google Cloud，并验证该账号是否适合独立开发者入门流程。

1. **执行凭据认证：**
   
   ```bash
   gcloud auth login
   ```
   > [!IMPORTANT]
   > **新用户/未认证用户指引**：
   > 如果执行前状态审计或命令失败确认开发者尚未认证（例如，`gcloud auth list` 为空或缺少有效凭据）：
   > 1. 指引他们前往 [Google Cloud 控制台](https://console.cloud.google.com/)创建 Google Cloud 账号。
   > 2. 指示他们执行 `gcloud auth login` 命令，以授权其本地工作站的终端会话。
   > 3. 在认证成功完成之前，不要尝试创建项目或配置资源。

2. **验证有效身份：**
   
   ```bash
   gcloud config get-value account --format="json"
   ```

3. **程序化企业路由防护措施：**
   在继续之前，请验证该账号是否绑定到企业组织，因为企业设置必须遵循不同的架构：
   
   ```bash
   gcloud organizations list --format="json"
   ```
   - 请注意，新的免费试用账号会自动获得一个自有组织（SOO）。要区分个人免费试用账号和企业组织，请检查 JSON 输出：
     - **企业组织（停止执行）**：如果输出列表包含一个存在 `owner.directoryCustomerId` 的组织节点（确认其为经过域名验证的 Google Workspace 或 Cloud Identity 组织），或者用户的提示明确提及企业着陆区或多租户项目结构：
       - 立即**停止执行**此 skill。
       - 将开发者引导至官方 [Google Cloud 设置引导流程](https://docs.cloud.google.com/docs/enterprise/cloud-setup.md.txt)。
     - **个人账号/免费试用 SOO（继续）**：如果输出列表为空 `[]`，或者其中包含自有组织（其 `owner.directoryCustomerId` 不存在，且 `displayName` 不是经过验证的域名），请进入第 3 节：选择或创建您的 Google Cloud 项目。

---

### 第 3 节：选择或创建 Google Cloud 项目

Google Cloud 资源按**项目**进行组织。当开发者通过控制台注册免费试用时，Google Cloud 会自动创建一个默认项目（例如，“My First Project”）。始终应先审查当前活动环境，以便复用现有项目，并防止消耗令牌的冲突错误。

1. **静默发现项目：**
   列出当前有效且可访问的项目（限制数量以防止上下文窗口溢出）：
   
   ```bash
   gcloud projects list --filter="lifecycleState=ACTIVE" --limit=20 --format="json"
   ```
2. **复用现有项目（推荐）：**
   如果列表返回了有效项目，请将其展示给开发者，并建议将其设置为默认工作项目：
   
   ```bash
   gcloud config set project {PROJECT_ID} --quiet
   ```
3. **创建自定义项目：**
   如果不存在任何项目，或者开发者明确要求使用全新的工作区：
   - 向开发者询问自定义的 `PROJECT_ID` 和 `PROJECT_NAME`（单问题策略）。
   - **结构化确认与同意门控（强制）**：
     在运行任何项目创建或结算账号关联命令之前，代理**必须**展示一个结构化 Markdown 表格，对目标参数进行汇总：
     | 参数 | 值 |
     | :--- | :--- |
     | 目标项目 ID | `{PROJECT_ID}` |
     | 目标项目名称 | `{PROJECT_NAME}` |
     | 当前活动身份账号 | `{ACCOUNT}` |
     | 目标结算账号 ID | `{BILLING_ACCOUNT_ID}` |

     向用户提出以下确切的同意询问：
     `"我已准备好初始化您的 Google Cloud 项目并关联结算账号。您希望我继续吗？"`

     **关键要求**：代理在本轮中**不得**执行任何 `gcloud projects create` 或结算账号关联命令。你必须展示此表格，提出上述确切的同意询问，然后**严格停止操作**，等待用户明确肯定。
    - **项目 ID 冲突后缀恢复**：如果项目创建
      命令因 `PROJECT_ID` 已在全局范围内被占用而失败
      （返回 `PROJECT_ID_COLLISION` 或 `ALREADY_EXISTS` 错误）：
      - 自动附加一个随机的 4 位数字后缀（例如，将 `my-project` 更改为 `my-project-8472`）。
      - 将这个新的可用项目 ID 提议给开发者，并在重试前再次征求同意。
   - **执行项目创建**：获得用户明确同意后：
     
     ```bash
     gcloud projects create {PROJECT_ID} --name="{PROJECT_NAME}" --quiet --format="json"
     ```
   - 设置当前工作项目：
     
     ```bash
     gcloud config set project {PROJECT_ID} --quiet
     ```

---

### 第 4 节：验证并关联结算账号

要在 Google Cloud 上部署资源，您的项目必须关联到有效的 Cloud Billing 账号。

1. **审查结算状态：**
   检查当前项目是否已关联到结算账号：
   
   ```bash
   gcloud billing projects describe {PROJECT_ID} --format="json"
   ```
2. 如果输出包含 `"billingEnabled": true`，则跳过关联操作，立即前往第 5 节：技能链式调用（支出控制与工作负载）。
3. **发现可用的结算账号：**
   如果项目尚未关联，请查询与已通过身份验证的用户身份相关联的可用结算账号句柄：

```bash
   gcloud billing accounts list --format="json"
   ```
4. **关联结算账号：**
   建议将项目关联到发现的结算账号 ID，并执行：
   
   ```bash
   gcloud billing projects link {PROJECT_ID} --billing-account={BILLING_ACCOUNT_ID} --format="json"
   ```

---

### 第 5 节：技能链式调用（支出控制与工作负载）

初始设置现已完成。为了保护您的环境并部署工作负载，您可以链式调用下游的专用技能：

1. **结算支出控制：**
   为避免意外的成本超支，请考虑设置一个程序化控制机制，以自动停用结算功能。停用结算后，项目中的所有 Google Cloud 服务和使用活动都将终止，以阻止产生更多费用：
- 引导开发者查阅官方[通过通知停用结算使用指南](https://docs.cloud.google.com/billing/docs/how-to/disable-billing-with-notifications.md.txt)，其中提供了有关如何在费用超出项目预算时自动停用结算的详细说明。
2.  **部署工作负载**：要部署您的第一个资源，请触发与目标应用程序匹配的下游
    专用技能（例如
    [cloud-run-basics](https://github.com/google/skills/blob/main/skills/cloud/cloud-run-basics)
    或 `bigquery-basics`）。如果本地没有相应的专用技能，
    请引导开发者查阅对应的官方快速入门，例如
    [Cloud Run 容器部署快速入门](https://docs.cloud.google.com/run/docs/quickstarts/deploy-container.md.txt)。
    *注意：这些下游专用技能各自负责在执行过程中动态启用其自身所需的
    服务 API（例如 run.googleapis.com）。*

---

## 验证逻辑

完成初始设置步骤后，使用以下诊断命令以编程方式验证已完成的环境状态：

1. **验证 CLI 安装：**
   
   ```bash
   which gcloud
   ```
2. **验证已进行身份验证的身份：**
   
   ```bash
   gcloud config get-value account
   ```
3. **验证项目工作区是否存在：**
   
   ```bash
   gcloud projects describe {PROJECT_ID} --format="json"
   ```
4. **验证结算关联**（确保 JSON 输出包含 `"billingEnabled": true`）：
   
   ```bash
   gcloud billing projects describe {PROJECT_ID} --format="json"
   ```

---

## 其他资源

- [Google Cloud 入门首页](https://docs.cloud.google.com/docs/get-started.md.txt)
- [Google Cloud 概览](https://docs.cloud.google.com/docs/overview.md.txt)
- [Google Cloud 免费计划](https://docs.cloud.google.com/free/docs/free-cloud-features)
- [Google Cloud Cloud Setup 引导式流程](https://docs.cloud.google.com/docs/enterprise/cloud-setup.md.txt)