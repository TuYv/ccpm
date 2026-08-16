---
name: google-ads-api-quickstart
description: |
  Guides developers through Google Ads API quickstart: credential setup, choosing from 6 client libraries/REST, configuring environments, and running a "retrieve campaigns" script. Troubleshoots common setup errors: USER_PERMISSION_DENIED, login_customer_id issues, and DEVELOPER_TOKEN_NOT_APPROVED.

  Use this skill when:
  - The user asks how to get started with the Google Ads API.
  - The user needs to set up Google Ads credentials or developer tokens.
  - The user wants to write a quickstart/example script for Google Ads.
  - The user encounters errors like USER_PERMISSION_DENIED or DEVELOPER_TOKEN_NOT_APPROVED.
compatibility: "Outbound HTTPS connectivity required to access the Google Ads API and documentation. Note: If network access is restricted, the agent will fall back to using the last-known stable versions cached within the skill resources."
metadata:
  author: google-ads-api-team
  version: "1.0"
  category: GoogleAds
---
# Google Ads API 快速入门
本技能将引导你从零开始，成功运行第一个用于检索广告系列的请求。

## 支持的使用方式
你可以选择通过以下方式使用本技能：

1. **官方客户端库：** Python、Java、.NET、PHP、Ruby 或 Perl。
2. **直接使用 REST：** 原始 HTTP REST 请求。

---

## 关键要求：动态版本解析与运行时解析

> [!IMPORTANT]
> 为确保集成安全、稳定并保持最新，你必须动态解析所有 API 和运行时版本。不要依赖硬编码的默认值。

### 严格约束：

*   **禁止硬编码：** 除非用户明确要求特定版本，否则绝不能在生成的代码或环境设置说明中使用硬编码的 Google Ads API 版本（例如 `v24`）或语言运行时版本（例如 `Python 3.8+`、`Java 11+`）。
*   **必须动态解析：** 在生成任何代码或配置之前，你必须在*执行开始时*使用下文详述的流程动态解析最新的稳定版本。

### A. 动态解析 API 版本
为确保集成安全、稳定并保持最新，你**必须**动态解析 Google Ads API 最新的稳定主版本。

#### 执行步骤：

1.  **执行前版本解析：** 使用网页搜索或 URL 读取工具，检查 [Google Ads API 版本说明](https://developers.google.com/google-ads/api/docs/release-notes.md.txt)中的最新条目，或 [Googleapis Github 代码库](https://github.com/googleapis/googleapis/tree/master/google/ads/googleads)中版本号最高的目录，以解析 `RESOLVED_API_VERSION`（例如 `v24`）。如果使用 Java，你还**必须**解析 Google Ads Java 客户端库的最新稳定发行版本（称为 `RESOLVED_LIBRARY_VERSION`，例如 `34.0.0`）。

2.  **强制响应锚点：** 你**必须**将以下确认块作为回复用户时的**第一行**输出。不得在此块之前输出任何问候语、客套话或介绍性文字。
    
    ```text
    [SYSTEM: Using Google Ads API version: RESOLVED_API_VERSION (Resolved from release notes)]
    ```

3.  **严格的占位符映射表：** 你**必须**使用下方映射表，对所有代码模板和参考文件即时执行搜索和替换。最终输出中不得遗留未经替换的占位符。

    | 目标语言／技术 | 模板中的占位符 | 替换模式 | 示例（假设 API 为 `v24`） |
    | :--- | :--- | :--- | :--- |
    | **Java**（Maven/Gradle） | `LATEST_LIBRARY_VERSION` | 搜索并替换为该库最新的 Maven 发行版本。 | `34.0.0` |
    | **Java**（导入） | `vXX` | 替换为**小写形式**的 API 版本。 | `com.google.ads.googleads.v24` |
    | **.NET / C#**（命名空间） | `VXX` | 替换为**首字母大写形式**的 API 版本。 | `Google.Ads.GoogleAds.V24` |
    | **PHP**（命名空间） | `VXX` | 替换为**首字母大写形式**的 API 版本。 | `Google\Ads\GoogleAds\V24` |
    | **REST**（端点 URL） | `vXX` | 替换为**小写形式**的 API 版本。 | `https://googleads.googleapis.com/v24/...` |

> [!TIP]
> **离线回退：** 如果 URL 无法访问或抓取失败，请勿停止执行。请回退到以下最后已知的稳定版本：
> *   **Google Ads API 主版本（`RESOLVED_API_VERSION`）：** `v24`
> *   **Java 客户端库版本（`RESOLVED_LIBRARY_VERSION`）：** `34.0.0`

### B. 动态解析语言运行时版本
为防止生成的设置指南因语言弃用周期而过时，你**必须**动态解析语言要求。

#### 执行步骤：

1.  **获取实时要求：** 使用你的 URL 读取工具查看官方的 [Google Ads 客户端库 - 支持的版本](https://developers.google.com/google-ads/api/docs/client-libs.md.txt#supported_api_versions)页面。

2.  **提取最低版本：** 通过查看概览页面或兼容性表格，确定用户所选语言支持的最低运行时版本（例如，查找 Python 3.8+、Java 11+、.NET 6.0+、PHP 8.1+、Ruby 3.0+ 等明确要求）。

3.  **即时应用：** 使用解析出的版本替换所生成设置指南中的所有运行时占位符（例如 `<PYTHON_MIN_VERSION>`）。

> [!TIP]
> **离线回退：** 如果 URL 无法访问或抓取失败，请勿停止执行。请回退到以下最后已知的安全最低版本：
> *   **Python：** `3.9+`
> *   **Java：** `11+`
> *   **.NET：** `6.0+`
> *   **PHP：** `8.1+`
> *   **Ruby：** `3.0+`
> *   **Perl：** `5.28.1+`

---

## 步骤 1：获取 Google Ads API 凭据

在安装库或进行 API 调用之前，你必须获取五个必需的身份验证参数。

### 1. 开发者令牌

*   **用途：** 标识你的开发者访问权限和 API 配额。
*   **获取方式：**
    1. 直接前往你的 Google Ads 经理账号中的 **API 中心**：https://ads.google.com/aw/apicenter *（注意：你必须使用经理账号登录，而不是标准投放账号）*。
    2. 复制你的开发者令牌。

> [!WARNING]
> **待审核令牌限制：** 如果你的开发者令牌状态为“待审核”（未获批准），你**必须仅**以 **Google Ads 测试账号**为目标。尝试使用待审核令牌调用生产账号将失败，并出现以下错误：`DEVELOPER_TOKEN_NOT_APPROVED`。

### 2. OAuth2 客户端 ID 和客户端密钥

*   **用途：** 向 Google 的 OAuth 2.0 服务器标识你的应用，并允许你请求用户授权。
*   **获取方式：**
    1. 打开 [Google Cloud Console](https://console.cloud.google.com/)。
    2. 创建新项目（或选择现有项目）。
    3. 在 API 库中搜索 **Google Ads API**，然后点击**启用**。
    4. 配置 **OAuth 权限请求页面**：
       *   选择**外部**用户类型。
       *   将发布状态设置为**测试**。
       *   > [!IMPORTANT]
       *   > **添加测试用户：** 在此步骤中，你**必须**将用于登录 Google Ads 的 Google 账号电子邮件地址添加为**测试用户**。否则，你将在授权过程中被阻止。
    5. 创建 OAuth 客户端：
       *   前往 **API 和服务 🡒 凭据**。
       *   点击**创建凭据 🡒 OAuth 客户端 ID**。
       *   选择**桌面应用**作为应用类型。
       *   为客户端命名，然后点击**创建**。
    6. **下载密钥：** 点击新创建的客户端 ID 旁边的下载图标（JSON）。将此文件保存到本地并命名为 `client_secrets.json`。

### 3. OAuth2 刷新令牌

*   **用途：** 允许你的应用程序自动获取新的访问令牌，而无需用户每小时手动登录。
*   **获取方式：**
    你必须运行 Google Cloud (`gcloud`) CLI 来生成刷新令牌。

    #### 1. 安装并验证 gcloud CLI：
    确保已安装 [gcloud CLI](https://cloud.google.com/sdk/docs/install)，并且可在终端中使用。

    #### 2. 执行登录流程：
    在终端中运行以下命令，并传入上一步下载的 `client_secrets.json` 文件的路径：
    
    ```bash
    gcloud auth application-default login \
      --scopes=https://www.googleapis.com/auth/adwords,https://www.googleapis.com/auth/cloud-platform \
      --client-id-file=client_secrets.json
    ```

    #### 3. 在浏览器中授权：
    1. 该命令会在浏览器中打开 Google 账号登录窗口。
    2. 使用在 OAuth 同意屏幕设置中注册的**测试用户**电子邮件地址登录。
    3. 如果你的应用尚未通过验证，请点击**高级**并继续前往该项目。点击**继续**以授予权限。

    #### 4. 获取刷新令牌：
    成功后，`gcloud` 将输出一条消息，指明凭据的保存位置（通常为 `~/.config/gcloud/application_default_credentials.json`）。打开该文件并复制你的 `refresh_token`。

### 4. 客户账号 ID

*   **用途：** 你想要查询或更改的特定 Google Ads 账号的 10 位 ID。
*   **格式：** 必须是**不含连字符**的 10 位数字（例如 `1234567890`，而不是 `123-456-7890`）。
*   **查找方式：** 登录 Google Ads 界面；该 ID 显示在右上角用户图标旁边。

> [!IMPORTANT]
> **测试账号要求：** 如果你的开发者令牌处于待审批（未获批准）状态，则此 ID **必须**是**测试账号**的客户账号 ID。测试账号的界面右上角会显示一个红色的“测试账号”横幅。

---

### 5. 登录客户 ID

*   **含义：** 拥有或管理目标客户账号的 Google Ads 经理账号的 10 位客户 ID。
*   **格式：** 必须是**不含连字符**的 10 位数字（例如 `9876543210`）。
*   **何时使用：** 如果你的 OAuth 凭据（以及开发者令牌）属于经理账号，但你查询的是子账号/客户账号（客户账号 ID），则此项为**必填项**。

> [!CAUTION]
> **防止出现 `USER_PERMISSION_DENIED`：**
> 如果你通过经理账号层级访问客户账号，则**必须**设置此参数。
> *   `login_customer_id` = **经理**账号 ID。
> *   `client_customer_id` = **子账号/客户**账号 ID。
> 在经理账号与客户账号的层级关系中，将 `login_customer_id` 留空是导致权限错误的首要原因。

---

## 第 2 步：选择集成策略

开发者可以使用官方高级客户端库或直接通过 HTTPS REST 请求连接到 Google Ads API。

### 路径 A：官方客户端库（推荐）

> [!IMPORTANT]
> **强制性智能体指令：** 用户选择语言后，你**必须**：
> 1. 使用 `view_file` 工具延迟加载下方列出的对应参考文件。
> 2. 在生成代码**之前**，应用**动态版本解析**（B 节），动态替换所有 `vXX`/`VXX` 占位符和库版本。

#### Python
如果需要为 Python 设置 Google Ads API 环境，请勿猜测配置。
请改为阅读详细的设置指南：

*   [Google Ads API Python 设置参考](references/python.md)
*（软件包：`google-ads`）*

#### Java
如果需要为 Java 设置 Google Ads API 环境，请勿猜测配置。
请改为阅读详细的设置指南：

*   [Google Ads API Java 设置参考](references/java.md)
*（构件：`com.google.api-ads:google-ads`）*

#### .NET / C#
如果需要为 .NET/C# 设置 Google Ads API 环境，请勿猜测配置。
请改为阅读详细的设置指南：

*   [Google Ads API .NET 设置参考](references/dotnet.md)
*（软件包：`Google.Ads.GoogleAds`）*

#### PHP
如果需要为 PHP 设置 Google Ads API 环境，请勿猜测配置。
请改为阅读详细的设置指南：

*   [Google Ads API PHP 设置参考](references/php.md)
*（软件包：`googleads/google-ads-php`）*

#### Ruby
如果需要为 Ruby 设置 Google Ads API 环境，请勿猜测配置。
请改为阅读详细的设置指南：

*   [Google Ads API Ruby 设置参考](references/ruby.md)
*（Gem：`google-ads-ruby`）*

#### Perl
如果需要为 Perl 设置 Google Ads API 环境，请勿猜测配置。
请改为阅读详细的设置指南：

*   [Google Ads API Perl 设置参考](references/perl.md)
*（软件包：`Google::Ads::GoogleAds::Client`）*

### 路径 B：直接使用 HTTP REST（无库开销）

如果用户的环境不支持官方客户端库（例如，轻量级无服务器函数、自定义语言技术栈或受限运行时），请使用此路径。

> [!IMPORTANT]
> **强制性智能体指令：** 如果用户选择 REST 路径，你**必须**：
> 1. 使用 `view_file` 工具延迟加载下方的 REST 参考文件。
> 2. 应用**动态版本解析**（B 节）替换端点 URL 中的所有 `vXX` 占位符（例如，在 `https://googleads.googleapis.com/v24/...` 中将 `vXX` 解析为 `v24`）。

#### REST (HTTP)
如果需要为 REST (HTTP) 设置 Google Ads API 环境，请勿猜测配置。
请改为阅读详细的设置指南：

*   [Google Ads API REST 设置参考](references/rest.md)
*（协议：原始 HTTP POST JSON）*

---

## 交叉引用：AI 助手与 MCP 连接

> [!TIP]
> **AI 助手 / MCP 集成交接：**
> 如果目标是将 **AI 助手**（例如 Gemini、Cursor 或 Claude Code）连接到 Google Ads，以便通过自然语言进行查询：
> 1. **不要**编写自定义脚本或客户端库代码。
> 2. **停止**执行此技能。
> 3. **立即切换**到 **`google-ads-api-mcp-setup`** 技能，以安装并配置官方 Google Ads 模型上下文协议 (MCP) 服务器。

---

## 第 4 步：排查常见错误

> [!IMPORTANT]
> **静态诊断约束：**进行故障排查时，你**不得**执行 bash 命令、运行本地测试脚本或尝试在工作区中复现错误。应完全依赖静态代码分析、配置审查以及下面的诊断指南，以避免陷入无休止的失败执行循环。

### 1. 错误：`USER_PERMISSION_DENIED`

*   **症状：**执行 API 请求（例如检索广告系列）时收到 `USER_PERMISSION_DENIED` 错误。
*   **可能原因：**进行身份验证的 OAuth2 用户通过一个**经理帐号**间接拥有目标客户帐号的访问权限，但请求标头中缺少该经理帐号的 ID。

#### 必需的代理响应检查清单：
帮助用户解决此错误时，你的响应**必须**包括：

1.  [ ] **解释层级结构：**说明进行身份验证的用户可能属于一个位于目标客户帐号上层的经理帐号。
2.  [ ] **提供修复方法：**指导用户将其 10 位经理帐号 ID 作为 `login_customer_id` 添加到配置文件中。
3.  [ ] **解释路由逻辑：**说明 `login_customer_id` 会告知 API 通过经理帐号路由 OAuth 凭据，以验证对子帐号的访问权限。
4.  [ ] **提供配置模板：**展示下面的确切 YAML 配置块。

> [!CAUTION]
> **安全护栏：**在任何情况下，都不应建议暴露原始密码、创建未经批准的新开发者令牌，或将 OAuth 范围扩大到标准 `adwords` 范围之外来绕过此错误。

#### 配置修复示例（`google-ads.yaml`）：

```yaml
developer_token: INSERT_DEVELOPER_TOKEN_HERE
client_id: INSERT_OAUTH2_CLIENT_ID_HERE
client_secret: INSERT_OAUTH2_CLIENT_SECRET_HERE
refresh_token: INSERT_OAUTH2_REFRESH_TOKEN_HERE

# Add your 10-digit Manager Account ID here to resolve USER_PERMISSION_DENIED:
login_customer_id: INSERT_LOGIN_CUSTOMER_ID_HERE
```

### 2. 错误：`DEVELOPER_TOKEN_NOT_APPROVED`

*   **症状：**脚本失败并显示 `DEVELOPER_TOKEN_NOT_APPROVED` 错误消息。
*   **可能原因：**你的开发者令牌目前处于“待审批”（未获批准）状态，而你正尝试以正式环境中的 Google Ads 帐号为目标。

#### 必需的代理响应检查清单：
帮助用户解决此错误时，你的响应**必须**包括：

1.  [ ] **解释“待审批”限制：**说明未获批准（待审批）的开发者令牌功能完整，但**仅限用于 Google Ads 测试帐号**。
2.  [ ] **定义正式环境访问权限级别：**你**必须**明确列出全部三个访问权限级别的名称：说明若要以正式环境中的真实帐号为目标，令牌必须经 Google Ads API 合规团队批准为 **Explorer Access**、**Basic Access** 或 **Standard Access**。不要将其缩略或改述为“至少拥有 Basic Access”。
3.  [ ] **提供沙盒设置步骤：**指导用户如何设置沙盒环境：
    *   创建一个**测试经理帐号**（无需已获批准的令牌）。
    *   在该测试经理帐号下创建**测试客户帐号**。
    *   在配置中使用测试客户 Customer ID。
4.  [ ] **提供指南链接：**引导用户查阅官方 [Google Ads API 测试帐号指南](https://developers.google.com/google-ads/api/docs/best-practices/test-accounts.md.txt)。

> [!CAUTION]
> **安全与完整性防护规则：**你**绝不能**建议开发者修改客户端库源代码、绕过令牌验证检查，或使用第三方“破解版”封装来绕过此错误。该限制由 Google 在服务器端强制执行，客户端修改不会生效。