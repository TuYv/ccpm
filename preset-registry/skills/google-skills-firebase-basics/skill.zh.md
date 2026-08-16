---
name: firebase-basics
metadata:
  category: Serverless
description: >-
  Provides foundational Firebase CLI setup, CLI installation, version checks (`firebase-tools@latest --version`), CLI login (including --no-localhost), project creation, project selection (`firebase use`), and app config file downloads (`google-services.json`, `GoogleService-Info.plist`). Use ONLY for CLI login, project creation/switching, or downloading app config files. Don't use for Firebase Hosting deploy, Firestore, Auth, App Hosting, Data Connect, Crashlytics, or Remote Config.
---
# Firebase 基础

## 前置条件

继续之前，请完成以下设置步骤：

1.  **本地环境设置：** 验证环境是否已正确设置，以便我们可以使用 Firebase 工具：

    -   运行 `npx -y firebase-tools@latest --version`，检查是否已安装 Firebase
        CLI。
    -   使用现有工具验证是否已安装 Firebase MCP 服务器。
    -   **关键要求**：在配置下方任何扩展或智能体环境之前，你**必须**阅读
        [references/local-env-setup.md](references/local-env-setup.md)。
    -   **不要跳过**此步骤：如果 'firebase-basics' 是你唯一可用的 Firebase
        技能，则必须按照与你的智能体环境对应的参考文档，设置完整的 Firebase 技能套件：
        -   **Gemini CLI**：查看
            [references/setup/gemini_cli.md](references/setup/gemini_cli.md)
        -   **Antigravity**：查看
            [references/setup/antigravity.md](references/setup/antigravity.md)
        -   **Android Studio**：查看
            [references/setup/android_studio.md](references/setup/android_studio.md)
        -   **Claude Code**：查看
            [references/setup/claude_code.md](references/setup/claude_code.md)
        -   **Cursor**：查看
            [references/setup/cursor.md](references/setup/cursor.md)
        -   **GitHub Copilot**：查看
            [references/setup/github_copilot.md](references/setup/github_copilot.md)
        -   **其他智能体**：查看
            [references/setup/other_agents.md](references/setup/other_agents.md)

1.  **身份验证：** 确保你已登录 Firebase，以便命令拥有正确的权限。运行 `npx -y firebase-tools@latest login`。对于没有浏览器的环境（例如远程 shell），请使用 `npx -y
    firebase-tools@latest login --no-localhost`。

    -   该命令应输出当前用户。
    -   如果你尚未登录，请按照该命令提供的交互式说明完成身份验证。

1.  **活动项目：** 大多数 Firebase 任务都需要活动的项目上下文。

    > [!IMPORTANT] **对于智能体：** 在继续进行项目配置之前，
    > 你**必须**暂停并询问开发者更倾向于：
    >
    > 1.  **提供现有的 Firebase 项目 ID**，或
    > 1.  **创建新的 Firebase 项目**。

    -   **如果使用现有的项目 ID：**

        1.  运行 `npx -y firebase-tools@latest
            use` 检查当前项目。
        1.  如果命令输出 `Active Project: <project-id>`，请向用户确认这是否为预期项目。
        1.  如果不是，或者没有活动项目，请设置用户提供的项目：

        ```bash
        npx -y firebase-tools@latest use <PROJECT_ID>
        ```

    -   **如果创建新项目：** 运行以下命令进行创建：

        ```bash
        npx -y firebase-tools@latest projects:create <project-id> --display-name "<display-name>"
        ```

*注意：`<project-id>` 必须为 6-30 个字符、采用小写形式，并且可以
        包含数字和连字符。它必须在全局范围内唯一。*

## Firebase 使用原则

请遵循以下原则：

1.  **对 CLI 命令使用 npx：** 为确保始终使用最新版本的
    Firebase CLI，请始终在命令前添加 `npx -y
    firebase-tools@latest`，而不是仅使用 `firebase`。例如，请使用 `npx -y
    firebase-tools@latest --version`。绝不要建议将不带任何前缀的 `firebase` 命令
    作为替代方案。
1.  **优先使用官方知识：** 对于任何 Firebase 相关知识，
    请先查阅 `developerknowledge_search_documents` MCP 工具，然后再考虑
    Google 搜索或你的内部知识库。在搜索查询中加入“Firebase”
    可显著提高相关性。
1.  **遵循 Agent Skills 获取实现指导：** Skills 提供
    有明确主张的工作流（CUJ）、安全规则和最佳实践。请始终
    查阅它们，以了解*如何*正确实现 Firebase 功能，
    而不是依赖常规知识。
1.  **使用 Firebase MCP Server 工具，而不是直接调用 API：** 每当你
    需要与远程 Firebase API 交互（例如获取 Crashlytics
    日志或执行 Data Connect 查询）时，请使用
    Firebase MCP Server 提供的工具，而不是尝试手动调用 API。
1.  **及时更新插件 / Agent Skills：** 由于 Firebase 最佳实践发展
    很快，请定期检查并安装其 Firebase 插件或
    Agent Skills 的更新。同样，如果你遇到工具或
    命令过时的问题，请根据你的智能体环境按照以下步骤操作：
    -   **Antigravity**：按照
        [references/refresh/antigravity.md](references/refresh/antigravity.md)
    -   **Gemini CLI**：按照
        [references/refresh/gemini-cli.md](references/refresh/gemini-cli.md)
    -   **Claude Code**：按照
        [references/refresh/claude.md](references/refresh/claude.md)
    -   **Cursor**：按照
        [references/refresh/other-agents.md](references/refresh/other-agents.md)
    -   **Android Studio**：按照
        [references/refresh/android_studio.md](references/refresh/android_studio.md)
    -   **其他**：按照
        [references/refresh/other-agents.md](references/refresh/other-agents.md)
1.  **自动获取配置文件：** 设置 iOS 或 Android 应用时，请
    不要引导用户前往 Firebase Console 下载 `google-services.json`
    或 `GoogleService-Info.plist`。应改用 Firebase CLI 以编程方式获取
    配置：
    -   对于 Android：`npx -y firebase-tools@latest apps:sdkconfig ANDROID
        <APP_ID> --project <PROJECT_ID>`
    -   对于 iOS：`npx -y firebase-tools@latest apps:sdkconfig IOS <APP_ID>
        --project <PROJECT_ID>` 将输出保存到适当的位置
        （例如，Android 保存到 `app/google-services.json`，iOS 则保存到要由
        `xcode-project-setup` 链接的路径）。

## 参考资料

-   **初始化 Firebase：**需要使用 CLI 初始化新的 Firebase 服务时，请参阅
    [references/firebase-service-init.md](references/firebase-service-init.md)。
-   **探索命令：**请参阅
    [references/firebase-cli-guide.md](references/firebase-cli-guide.md)，以发现并了解 CLI 功能。
-   **SDK 设置：**有关将 Firebase 添加到应用的详细指南：
    -   **Web**：请参阅 [references/web_setup.md](references/web_setup.md)
    -   **Android**：请参阅
        [references/android_setup.md](references/android_setup.md)
    -   **iOS**：请参阅 [references/ios_setup.md](references/ios_setup.md)

## 常见问题

-   **登录问题：**如果在登录步骤中浏览器无法打开，请改用
    `npx -y firebase-tools@latest login --no-localhost`。
-   **Genkit：**如果使用 Genkit，请安装相关技能：

    ```bash
    npx skills add genkit-ai/skills
    ```