---
name: google-ads-api-mcp-setup
description: Guides developers through downloading, configuring, and installing the official open-source Google Ads MCP Server. Use this skill when a user wants to connect their AI assistant (such as Gemini, Claude Code, or Cursor) to their Google Ads account to query campaigns or retrieve reporting metrics using natural language.
compatibility: Python 3.12+, pipx
metadata:
  author: google-ads-api-team
  version: "1.0"
  category: GoogleAds
---
# Google Ads API MCP 服务器安装

此技能提供了一份结构化的设置指南，用于安装、配置和集成官方开源的 **[Google Ads 模型上下文协议（MCP）服务器](https://github.com/googleads/google-ads-mcp)**。

---

## 系统要求与兼容性（代理操作：说明必备条件）

在回答有关安装或设置 MCP 服务器的问题时，你
**必须**向用户明确说明，**Python 3.12+** 和 **`pipx`**
均为安装时严格要求的必备条件。

> [!IMPORTANT]
> **安装前环境检查：**
> *   **Python 运行时：**严格要求版本为 **`3.12+`**。
> *   **软件包管理器：**必须安装 **`pipx`**，并且能够通过
>     系统路径全局访问。
> *   **网络连接：**需要具备出站 HTTPS 访问权限，以连接
>     Google Ads API 端点（`googleads.googleapis.com`）和 PyPI。
---
## ⚠️ 必备条件：需要凭据
> [!WARNING]
> **依赖项检查：**MCP 服务器**需要**与标准集成相同的 5 项身份验证凭据。
>
> 如果你**尚未**获得开发者令牌、客户端 ID、客户端密钥、刷新令牌和客户 ID：
> 1. **停止**执行此技能。
> 2. 首先**转到** **`google-ads-api-quickstart`** 技能以生成这些凭据，然后再返回此处。

---

## 步骤 1：验证你的 Google Ads API 凭据

Google Ads MCP 服务器需要与标准客户端库相同的五个参数。在继续安装之前，请验证你已妥善保管这些值，并且其格式正确：

1.  **开发者令牌：**你从**API 中心**（经理账号）获取的唯一 API 访问密钥。
2.  **OAuth2 客户端 ID 和客户端密钥：**来自 Google Cloud Console 的桌面应用凭据。
3.  **OAuth2 刷新令牌：**通过 OAuth 同意流程生成的长期有效令牌。
4.  **客户端客户 ID：**作为目标的 10 位 Google Ads 账号 ID。
    *   > [!IMPORTANT]
    *   > **格式：**必须**仅包含数字，不得包含连字符**（例如 `1234567890`，而不是 `123-456-7890`）。
5.  **登录客户 ID（MCC 层级结构必需）：**10 位经理账号（MCC）ID。
    *   **格式：****仅包含数字，不得包含连字符**（例如 `9876543210`）。
    *   **注意：**如果你的 OAuth 凭据属于经理账号管理员，而不是直接属于客户账号，则此项必不可少。

---

*确认所有五个参数均已提供且格式正确后，继续执行步骤 2。*

## 步骤 2：安装必备组件（Python 和 pipx）

在提出任何安装命令之前，你**必须**先验证必备组件是否已经安装。

### 1. 验证阶段（代理操作）
你**必须**运行以下命令来检查环境：

1.  检查 Python 版本：`python3 --version`（确认其版本为 `3.12+`）。
2.  检查是否已安装 pipx：`pipx --version`。

*   **如果两者均已存在：**跳过安装阶段，直接继续执行**步骤 3**。
*   **如果 Python 缺失或版本过旧：**停止并要求用户在其主机上将 Python 升级到 `3.12+`。
*   **如果 pipx 缺失：**继续执行下方的安装阶段。

---

### 2. 安装阶段（特定于操作系统）
检测操作系统，并使用终端工具提出安装 `pipx` 的适当命令：

#### macOS
如果环境是 macOS，请提出：

```bash
brew install pipx && pipx ensurepath
# Or alternatively (if Homebrew is not installed):
pip install pipx && pipx ensurepath
```

#### Windows（PowerShell）
如果环境是 Windows，请提出：

```powershell
scoop install pipx
# Or alternatively:
pip install pipx && pipx ensurepath
```

#### Linux（Ubuntu/Debian）
如果环境是 Linux，请提出：

```bash
sudo apt install pipx && pipx ensurepath
```

> [!WARNING]
> **需要重启 Shell：** 如果你安装了 `pipx` 并运行了 `pipx ensurepath`，更新后的 `PATH` 在当前终端会话中将不可用。
> 1. **不要**立即尝试在同一会话中运行 `pipx` 命令。
> 2. **指示用户**重启终端或重新加载 Shell 配置，然后再继续执行**步骤 3**。

---

## 步骤 3：安装 Google Ads MCP 服务器

你必须安装服务器软件包。默认情况下，你**必须**安装 PyPI 上的稳定版本。仅当用户明确要求时，才安装 GitHub 开发版本。

### 1. 安装命令
提出并执行安装命令：

```bash
# Install stable release from PyPI (Using required package manager pipx)
pipx install google-ads-mcp
```

如果用户明确要求安装 GitHub 上的最新开发版本，请提出：

```bash
# Install development version from GitHub (Only if explicitly requested)
pipx install git+https://github.com/googleads/google-ads-mcp.git
```

### 2. 验证阶段

要验证安装，请执行：

```bash
google-ads-mcp --help
```

### `PATH` 问题故障排除（智能体操作）
`pipx` 会将二进制文件安装到特定的本地目录中（通常为 `~/.local/bin`）。如果用户的 Shell 配置（例如 `.bashrc` 或 `.zshrc`）尚未重新加载，当前 `PATH` 中可能找不到 `google-ads-mcp`。

如果 `google-ads-mcp --help` 因“找不到命令”错误而失败：

1. **不要**认为安装失败，也不要陷入安装循环。
2. 使用 `pipx` 二进制文件目录的绝对路径验证安装：

   ```bash
   ~/.local/bin/google-ads-mcp --help
   ```
3. 如果使用绝对路径验证成功，请向用户解释这一情况：告知他们安装已成功，但需要通过重新加载 Shell 配置（例如运行 `source ~/.bashrc` 或 `source ~/.zshrc`，或者重启终端）来更新其 `PATH` 环境变量。

### 3. 通信协议：Stdio 传输

> [!IMPORTANT]
> **强制性智能体指令（安装与协议检查清单）：**
> 当用户询问如何安装、下载或设置官方 Google Ads MCP 服务器时，你的回复**必须**系统地包含以下所有内容：
> 1. [ ] **说明前置条件：** 明确说明 Python 3.12+ 和 `pipx` 是必需的前置条件。
> 2. [ ] **提供官方安装命令：** 指示开发者使用 `pipx install google-ads-mcp` 安装官方 `google-ads-mcp` 软件包。不要推荐未经审核的第三方服务器。
> 3. [ ] **解释 Stdio 传输：** 你**必须**使用准确的术语明确解释通信架构：说明 MCP 服务器通过**模型上下文协议（MCP）**，使用**标准输入/输出（`stdio`）传输**进行通信。不得遗漏“标准输入/输出”或“传输”这两个词。

#### 需要向用户说明的关于 Stdio 传输的要点：

*   **子进程执行：** 主机客户端（例如 Cursor、Claude Desktop）将 MCP 服务器作为后台子进程启动。
*   **命令行启动：** 必须在主机客户端中配置用于运行服务器的准确命令（`google-ads-mcp`），以及包含 Google Ads 凭据的环境变量。
*   **无网络端口：** 由于使用 `stdio`，服务器不会监听网络端口（如 HTTP 或 WebSockets）。通信完全通过 stdin/stdout 管道进行。

> [!NOTE]
> **输出限制：** 由于 `stdio` 专用于传输 MCP 协议消息，因此服务器**不得**将标准日志消息或调试信息输出到 `stdout`。所有日志和调试信息均被定向到 `stderr`。

---

## 第 4 步：配置环境变量

Google Ads MCP 服务器通过系统环境变量读取您的凭据。您可以通过以下两种方式进行配置：

*   **方法 A（推荐）：** 直接在 MCP 客户端的 JSON 配置文件（例如 Cursor 或 Claude Desktop 的设置）中传递这些变量。这样可将凭据隔离到特定工具。
*   **方法 B（备选）：** 在 shell 配置文件（例如 `~/.bashrc`、`~/.zshrc` 或 Windows 环境变量）中进行全局设置。

### 必需的环境变量

| 环境变量 | 说明 | 格式 |
|---|---|---|
| `GOOGLE_ADS_DEVELOPER_TOKEN` | 您的 Google Ads 开发者令牌。 | 字母数字 |
| `GOOGLE_ADS_CLIENT_ID` | 您的 Google Cloud OAuth 客户端 ID。 | `*.apps.googleusercontent.com` |
| `GOOGLE_ADS_CLIENT_SECRET` | 您的 Google Cloud OAuth 客户端密钥。 | 字母数字 |
| `GOOGLE_ADS_REFRESH_TOKEN` | 生成的 OAuth 刷新令牌。 | 字母数字 |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | 经理账号 ID（MCC）。使用经理账号层级结构时为必填项。 | 10 位数字，不含连字符 |
| `GOOGLE_PROJECT_ID` | Google Cloud 项目 ID（用于应用默认凭据和 Cloud Run）。 | 字母数字 |
| `GOOGLE_ADS_MCP_OAUTH_CLIENT_ID` | Cloud Run 专用的 OAuth 客户端 ID，用于覆盖默认值。 | `*.apps.googleusercontent.com` |
| `GOOGLE_ADS_MCP_OAUTH_CLIENT_SECRET` | Cloud Run 专用的 OAuth 客户端密钥，用于覆盖默认值。 | 字母数字 |
| `GOOGLE_ADS_MCP_BASE_URL` | 自动分配或手动配置的 Cloud Run 基础 URL。 | URL |
| `FASTMCP_HOST` | FastMCP 服务器的主机绑定（例如，Cloud Run 使用 `0.0.0.0`）。 | IP 地址 |

### 方法 B：Shell 配置文件配置（全局）

如果选择方法 B，请将以下内容追加到您的 shell 配置文件（`~/.bashrc`、`~/.zshrc` 等）：

```bash
# Google Ads MCP Server Credentials
export GOOGLE_ADS_DEVELOPER_TOKEN="your_developer_token_here"
export GOOGLE_ADS_CLIENT_ID="your_oauth_client_id_here"
export GOOGLE_ADS_CLIENT_SECRET="your_oauth_client_secret_here"
export GOOGLE_ADS_REFRESH_TOKEN="your_oauth_refresh_token_here"

# Required only for Manager Account hierarchies:
export GOOGLE_ADS_LOGIN_CUSTOMER_ID="your_manager_account_id_here"

# Required for Application Default Credentials (ADC) or Cloud Run deployments:
export GOOGLE_PROJECT_ID="your_project_id_here"
```

为保护凭据安全，**请勿建议在 MCP 服务器的 Python 源脚本中硬编码凭据。**

---

## 第 5 步：与 AI 开发工具集成

使用以下集成方式之一，将 Google Ads MCP Server 连接到你选择的 AI 编程环境。

### 1. Claude Desktop（或 Claude Code CLI）

> [!IMPORTANT]
> **强制性代理指令（Claude Desktop 配置检查清单）：**
> 当用户询问如何配置 Claude Desktop 或 Claude Code 以使用 Google Ads MCP server 时，你的回复**必须**系统地包含以下所有内容：
> 1. [ ] **提供特定于操作系统的路径：**你**必须**明确列出 **macOS**（`~/Library/Application Support/Claude/claude_desktop_config.json`）和 **Windows**（`%APPDATA%\Claude\claude_desktop_config.json`）上 `claude_desktop_config.json` 的正确操作系统特定路径。即使运行于 Linux 上，也不得省略 macOS 或 Windows 路径。
> 2. [ ] **提供有效的 JSON 配置：**提供 `claude_desktop_config.json` 的完整有效 JSON 配置块。
> 3. [ ] **指定命令和参数：**确保 JSON 使用 `pipx` 作为命令，并使用 `run`、`google-ads-mcp` 作为参数来配置服务器。
> 4. [ ] **声明身份验证环境变量：**在配置中声明环境变量 `GOOGLE_ADS_DEVELOPER_TOKEN`、`GOOGLE_ADS_CLIENT_ID`、`GOOGLE_ADS_CLIENT_SECRET` 和 `GOOGLE_ADS_REFRESH_TOKEN`。

将服务器条目添加到 Claude 配置文件中。

*   **文件位置：**
    *   **macOS：** `~/Library/Application Support/Claude/claude_desktop_config.json`
    *   **Windows：** `%APPDATA%\Claude\claude_desktop_config.json`
    *   **Linux：** `~/.config/Claude/claude_desktop_config.json`

*   **配置 JSON：**

    ```json
    {
      "mcpServers": {
        "google-ads": {
          "command": "pipx",
          "args": [
            "run",
            "google-ads-mcp"
          ],
          "env": {
            "GOOGLE_ADS_DEVELOPER_TOKEN": "YOUR_DEVELOPER_TOKEN",
            "GOOGLE_ADS_CLIENT_ID": "YOUR_OAUTH_CLIENT_ID",
            "GOOGLE_ADS_CLIENT_SECRET": "YOUR_OAUTH_CLIENT_SECRET",
            "GOOGLE_ADS_REFRESH_TOKEN": "YOUR_OAUTH_REFRESH_TOKEN",
            "GOOGLE_ADS_LOGIN_CUSTOMER_ID": "YOUR_MANAGER_ACCOUNT_ID_IF_APPLICABLE"
          }
        }
      }
    }
    ```
    *（注意：建议使用 `pipx run`，因为它会自动管理执行路径。如果你使用的是 GitHub 开发版本或应用默认凭据，也可以将其配置为 `"args": ["run", "--spec", "git+https://github.com/googleads/google-ads-mcp.git", "google-ads-mcp"]`，并在 `env` 块中加入 `"GOOGLE_PROJECT_ID": "YOUR_PROJECT_ID"`）。*

---

### 2. Cursor AI 编辑器

1.  打开 Cursor 并转到：**Settings 🡒 Features 🡒 MCP**。
2.  单击 **+ New MCP Server**。
3.  配置以下字段：
    *   **名称：** `google-ads`
    *   **类型：** `stdio`
    *   **命令：** `pipx run google-ads-mcp`
4.  在**环境变量**下，添加所需的键和值：
    *   `GOOGLE_ADS_DEVELOPER_TOKEN`
    *   `GOOGLE_ADS_CLIENT_ID`
    *   `GOOGLE_ADS_CLIENT_SECRET`
    *   `GOOGLE_ADS_REFRESH_TOKEN`
    *   `GOOGLE_ADS_LOGIN_CUSTOMER_ID` *（如适用）*
5.  单击 **Save**。

---

### 3. Antigravity IDE 与 CLI 集成

在回答有关将 Google Ads MCP 服务器连接到 Antigravity（IDE 或 CLI）的问题时，你**必须**明确说明以下架构和配置细节：

*   **必要的环境设置**：指导用户在终端会话或 IDE 环境中配置并导出标准环境变量（例如 `GOOGLE_ADS_DEVELOPER_TOKEN`、`GOOGLE_ADS_CLIENT_ID`、`GOOGLE_ADS_CLIENT_SECRET`、`GOOGLE_ADS_REFRESH_TOKEN`）。
*   **服务器注册**：指导用户在 Antigravity 的设置中注册服务器，或使用标准的 `stdio` 集成方式（例如，将命令配置为 `pipx run google-ads-mcp`）。
*   **自动工具发现（核心架构）**：明确说明服务器连接后，Antigravity 会利用**模型上下文协议（MCP）**自动发现服务器提供的工具。
*   **无需自定义编译**：明确说明，由于 Antigravity 原生支持 MCP，因此使用该 MCP 服务器**不需要**单独编译自定义插件或加载自定义扩展。

#### 在 Antigravity CLI 中验证是否已激活

1.  **配置环境**：在当前 shell 会话中导出 Google Ads API 所需的全部环境变量。
2.  **启动 Antigravity CLI**：启动 CLI：

    ```bash
    agy
    ```
3.  **验证 MCP 状态**：在 Antigravity CLI 提示符中运行 `/mcp` 命令，以列出已激活的工具和服务器：

    ```text
    /mcp
    ```
4.  **确认激活**：确认活动工具响应中列出了 `google-ads-mcp`。

> [!IMPORTANT]
> 如果活动工具列表中缺少 `google-ads-mcp`，请退出 CLI，确认环境变量已正确设置并导出，然后重新启动 `agy`。

---

## 步骤 5.5：部署到 Google Cloud（Cloud Run）

除了在本地托管此 MCP 服务器之外，你还可以将其托管在 Google Cloud Run 或任何其他基于云的基础设施上。如果你希望在不同智能体之间共享该服务器，或将其作为 Web 服务运行，这种方式会很有用。

### 1. 前提条件

1. 一个 Google Cloud 项目。
2. 已安装并完成身份验证，且已配置活动项目的 [`gcloud` 命令行工具](https://cloud.google.com/cli)：

   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

### 2. 构建并推送 Docker 镜像
你可以使用 Cloud Build 构建镜像并将其推送到 Artifact Registry，无需在本地安装 Docker：

1. 在 Artifact Registry 中创建一个仓库：

   ```bash
   gcloud artifacts repositories create mcp-servers --repository-format=docker --location=us-central1
   ```
2. 构建并提交镜像：

   ```bash
   gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/mcp-servers/google-ads-mcp:latest .
   ```
   *（注意：每当你希望将已部署的服务器更新到最新版本时，都必须执行此步骤。）*

### 3. 部署到 Google Cloud Run
部署容器，并确保设置 `FASTMCP_HOST=0.0.0.0` 以及所有必需的环境变量：

```bash
gcloud run deploy google-ads-mcp \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/mcp-servers/google-ads-mcp:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_PROJECT_ID=YOUR_PROJECT_ID,GOOGLE_ADS_DEVELOPER_TOKEN=YOUR_DEVELOPER_TOKEN,GOOGLE_ADS_MCP_OAUTH_CLIENT_ID=YOUR_CLIENT_ID,GOOGLE_ADS_MCP_OAUTH_CLIENT_SECRET=YOUR_CLIENT_SECRET,GOOGLE_ADS_MCP_BASE_URL=YOUR_BASE_URL,FASTMCP_HOST=0.0.0.0"
```

### 4. 配置 MCP 客户端
部署后，更新 MCP 客户端配置（例如 `~/.gemini/settings.json` 或 Claude/Cursor 配置），使其使用 Cloud Run URL：

```json
{
  "mcpServers": {
    "google-ads-mcp": {
      "httpUrl": "https://your-cloud-run-url.a.run.app/mcp"
    }
  }
}
```

---

## 第 6 步：验证集成（测试）

在回答如何在任何 AI 客户端（例如 Cursor、Claude Desktop 或 VS Code）中验证或测试 MCP 服务器集成的问题时，你**必须**建议先使用 Antigravity CLI 执行基准验证，然后在客户端中运行自然语言测试查询。

### 1. 通过 Antigravity CLI 进行基准验证（Agent 必须执行的操作）

无论用户正在配置哪个 AI 客户端，都要指示用户在 Antigravity CLI 提示符中使用 `/mcp` 命令，验证 `google-ads-mcp` 是否处于活动且健康的状态：

```bash
agy
```

```text
/mcp
```

*   **解释原因：**告知用户，首先通过 Antigravity CLI 进行验证，是隔离核心凭据、网络或服务器启动问题的最快方法。一旦确认 `google-ads-mcp` 在 CLI 中处于活动状态，Cursor/Claude 中的任何剩余问题都可以被严格限定为 IDE 特定的配置错误。

### 2. 在你的 AI 助手中运行测试查询
在 AI 助手的聊天界面中运行以下查询之一。*请务必将 `1234567890` 替换为你的实际 Google Ads Customer ID（不含连字符）：*

*   *“检索我的 Google Ads 账号 `1234567890` 中的所有广告系列。”*
*   *“Google Ads 账号 `1234567890` 中广告系列的状态是什么？”*

### 3. 预期行为（成功标准）
成功的集成将触发以下流程：

1.  **工具发现**：AI 助手自动检测 `google-ads-mcp` 服务器工具。
2.  **执行**：助手构造参数，通过 `stdio` 传输方式调用服务器并执行查询。
3.  **响应**：助手将检索到的广告系列数据呈现为整洁、易读的 Markdown 表格（通常显示广告系列名称、ID、状态和预算）。

### 4. 故障排查
如果助手无法检索数据或连接到 MCP 服务器，请检查以下常见故障点：

*   **身份验证/权限错误（IDE 环境陷阱）**：外部 IDE（如 Cursor 或 VS Code）通常运行在隔离环境或后台进程中，无法继承 shell RC 文件（例如 `~/.bashrc` 或 `~/.zshrc`）。请确保 `GOOGLE_ADS_DEVELOPER_TOKEN`、OAuth 客户端凭据和 `GOOGLE_ADS_REFRESH_TOKEN` 已显式配置在 IDE 可以访问的位置（首选方法 A：直接在 MCP 客户端的 JSON 配置中设置它们）。
*   **“找不到工具”/必须重启客户端**：MCP 服务器仅在应用程序启动时加载；对配置文件的更改不会动态生效。保存配置后，你**必须**彻底重启 AI 工具（Cursor 或 Claude Desktop）。验证 MCP 服务器是否已在 IDE 的配置文件中正确注册（例如 Cursor 的 `project.json` 或 Claude Desktop 配置中的 `mcpServers` 块）。
*   **PATH 和可执行文件问题（`spawn pipx ENOENT`）**：如果连接失败或日志显示 `spawn pipx ENOENT`，则说明 `pipx` 不在 IDE 环境的系统 PATH 中。在配置的 "command" 字段中提供 `pipx` 的绝对路径（例如 `/usr/local/bin/pipx` 或 `~/.local/bin/pipx`）。
*   **服务器启动时崩溃**：如果助手无法连接，请直接在终端中运行 MCP 服务器命令，以检查语法错误、缺失的依赖项或 node/python 路径问题。

> [!IMPORTANT]
> **验证连接状态和日志：**
> *   在 **Cursor** 中，确保 MCP 设置里的 `google-ads` 服务器旁显示绿点。
> *   在 **Claude** 中，如果工具未显示，请检查本地 MCP 日志文件中的错误：
>     *   *macOS 日志路径：* `~/Library/Logs/Claude/mcp.log`
>     *   *Windows 日志路径：* `%APPDATA%\Claude\Logs\mcp.log`

---

## 第 7 步：可用的 MCP 工具与使用指南

Google Ads MCP Server 安装完成并成功连接到 AI 助手后，该服务器会提供特定工具，供助手自主发现和调用。

> [!IMPORTANT]
> **强制性智能体指令（工具说明检查清单）：**
> 当用户询问 Google Ads MCP 服务器提供哪些工具或如何使用这些工具时，你的回复**必须**系统地包含以下所有内容：
> 1. [ ] **列出全部 3 个工具：** 明确指出 `list_accessible_customers`、`get_resource_metadata` 和 `search`。
> 2. [ ] **说明用途和用法：** 准确解释每个工具的作用，以及如何调用和何时调用。
> 3. [ ] **指定确切的参数名称：** 你**必须**在说明中明确指出每个工具所需的参数。例如，对于 `search`，你**必须**明确说明它需要确切的参数 `customer_id`（10 位客户 ID）和 `query`（GAQL 查询字符串）。不得将 `customer_id` 改述为“账号”。
> 4. [ ] **声明只读范围：** 明确说明该服务器目前严格为只读模式。

在协助用户或构建查询时，请参考以下工具定义和最佳实践：

### 1. `list_accessible_customers`

*   **用途：** 返回经过身份验证的用户可以访问的 Google Ads 客户 ID 和账号名称列表。
*   **使用方法：** 开始新会话或目标客户 ID 未知时，首先调用此工具。它不需要任何参数。
*   **意图示例：** *“我可以访问哪些 Google Ads 账号？”*

### 2. `get_resource_metadata`

*   **用途：** 获取特定 Google Ads API 资源类型（例如 `campaign`、`ad_group`、`customer`）的详细结构元数据。
*   **使用方法：** 在构建 GAQL 查询之前，调用此工具检查资源的架构、可用字段、指标和细分维度。
*   **参数：**
    *   `resource`（字符串，必需）：要检查的资源名称（例如 `campaign`）。
*   **意图示例：** *“我可以查询广告组的哪些字段和指标？”*

### 3. `search`

*   **用途：** 执行 Google Ads Query Language（GAQL）查询，以获取资源指标、属性、细分维度和状态。
*   **使用方法：** 根据资源元数据构建有效的 GAQL 查询字符串，并针对特定客户账号执行搜索。
*   **参数：**
    *   `customer_id`（字符串，必需）：目标 Google Ads 客户的 10 位客户 ID（仅限数字，不含连字符）。
    *   `query`（字符串，必需）：有效的 GAQL 查询字符串（例如 `SELECT campaign.id, campaign.name, campaign.status, metrics.impressions FROM campaign WHERE campaign.status = 'ENABLED'`）。
*   **意图示例：** *“获取账号 1234567890 下所有已启用广告系列的展示次数和状态。”*

> [!NOTE]
> **只读范围：** Google Ads MCP Server 目前严格限制为只读。它无法修改出价、暂停广告系列或创建新的广告资产。