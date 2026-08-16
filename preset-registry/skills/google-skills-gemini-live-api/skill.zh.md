---
name: gemini-live-api
metadata:
  category: AiAndMachineLearning
description: >-
  Generates a Gemini LiveAPI client service class in the user's chosen programming
  language. Use when the user wants to build, scaffold, or integrate a client
  that connects to the Gemini Enterprise LiveAPI websocket endpoint, handles
  session setup/resumption, bearer token refresh, and sending/receiving
  `ClientMessage`/`ServerMessage` protos. Don't use for general (non-live,
  non-bidirectional) Gemini API usage such as one-shot `generateContent`,
  embeddings, image/video generation, or fine-tuning — use the `gemini-api`
  skill for those.
---
# LiveAPI 服务技能

此技能提供了生成 **LiveAPI 客户端服务类**的说明，该类通过 WebSocket 连接到 Gemini Enterprise Live API。生成的客户端支持双向流式传输、通过应用默认凭据（ADC）进行不记名令牌身份验证、透明会话恢复，以及 `ClientMessage` / `ServerMessage` proto 消息交换。

此技能还会生成一个演示前端和后端服务，以便用户以交互方式验证生成的客户端（包括文本、音频、视频、转写和中断处理）。

## 前提条件

运行生成流程之前，请确保主机上具备以下条件：

-   已启用 Vertex AI / Gemini Enterprise Agent Platform API 的 Google Cloud 项目。
-   已在运行生成客户端的主机上配置应用默认凭据：

    ```bash
    gcloud auth application-default login
    ```

-   用户提供的目标输出文件夹（例如 `/tmp/liveapi_out`），生成的代码、环境和演示将在其中写入。**绝不要**修改主机的系统 Python 环境。

-   用户选择的实现语言（Python 是此技能的默认语言和参考语言）。

## 参考文件

`references/` 中提供的文件（**不要**将其视为独立技能——它们会按需加载）：

-   `client_server_messages.md`：Live API 所使用的 `ClientMessage` / `ServerMessage` 模式的公开参考文档。
-   `client_server_messages.proto`：根据 `client_server_messages.md` 生成的 proto 定义。
-   `session_manager.md`：说明如何正确处理会话、缓冲以及断开连接后的恢复。

## 步骤

### 第 1 步：复制参考文件

将 `client_server_messages.md`、`client_server_messages.proto` 和 `session_manager.md` 从此技能的 `references/` 文件夹复制到用户的目标输出文件夹。这些文件将成为生成客户端的事实来源。

### 第 2 步：与公开文档保持一致

检查 `client_server_messages.md` 中链接的公开文档。如果公开文档与复制的 `client_server_messages.md` / `client_server_messages.proto` 之间存在任何差异，请更新目标文件夹中的副本，确保生成的客户端能够针对当前的服务器契约完成编译并运行。

### 第 3 步：实现客户端类

使用用户选择的语言实现一个类，该类：

-   导入本地 `client_server_messages.proto` 类型（`ClientMessage`、`ServerMessage`）。
-   打开与 Live API 端点的 WebSocket 连接。
-   公开异步方法，以便用户向模型发送数据以及从模型接收数据。

对于需要隔离运行时的语言（例如 Python），请在**目标文件夹内**创建隔离环境（例如 `venv`），并生成一个用于重建环境和安装依赖项的 bash 脚本（例如 `setup.sh`）。**绝不要**安装到系统解释器或用户的全局 site-packages 中，也绝不要指示用户运行 `sudo pip install`。

#### 初始化参数

用户在构造时提供以下内容：

-   `project_id`
-   `location`
-   `model_id`
-   `config`：一个已填充 `setup` 字段的 `ClientMessage`。

#### 身份验证

通过应用默认凭据获取不记名令牌，并将其作为 `Authorization: Bearer <token>` 附加到
WebSocket 连接请求；在令牌到期前或到期时刷新令牌，并在每次重新连接时
（包括 `go_away` 和意外断开连接）复用刷新后的令牌。**不要**将硬编码的
长期有效 API 密钥用作唯一的身份验证机制。

#### 公共异步 API

该类必须公开以下异步方法，并且必须在收到
`setup_complete` `ServerMessage` 后才能发送：

-   `send_realtime_data(data)`：发送实时输入。`data` 是一个携带
    `realtime_input` 字段的 `ClientMessage`。
-   `send_client_content(data)`：发送会纳入历史记录的非实时、基于轮次的内容。
    `data` 是一个携带 `client_content` 字段的 `ClientMessage`。
-   `receive()`：生成从 WebSocket 流中解析出的 `ServerMessage` 实例。

不要将同步阻塞变体作为主要 API 接口公开。

### 步骤 4：编写测试文件

客户端实现完成后，生成一个测试文件，用于初始化连接，并测试发送
`text`、`audio` 和 `video` 数据以及接收响应。向用户询问运行测试所需的任何信息
（项目、模型、媒体样本）。

### 步骤 5：生成 `how_to_run.md`

在目标文件夹中提供一个 `how_to_run.md`，用于说明生成的类。包含完整示例，展示如何为
每种受支持的模态构建 `ClientMessage` 负载、如何发送它们，以及如何从
模型接收数据。

### 步骤 6：生成演示前端 + 后端服务

创建脚本，将实现部署为包含前端 UI 和后端服务（可使用任何语言）的服务。该服务必须复用
步骤 1 中的 `ClientMessage` / `ServerMessage` proto 进行线上流量传输。通过
UI，用户应能够：

-   启动新连接／关闭当前连接。
-   选择要使用的模型。
-   选择输入源（来自摄像头或屏幕截图的音频和／或视频），并将其流式传输给模型。
-   向模型发送文本消息。
-   收听模型音频，并查看交错显示的模型和用户转写内容／对话历史记录。

实现音频和转写播放时，请遵循
[Live API 最佳实践](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/live-api/best-practices)中的指导。

#### 处理 `interrupt` 信号

当 `ServerMessage` 的 `server_content` 到达且 `interrupted: true` 时，
UI 必须：

-   确保已播放的音频及其对应的转写内容在时间上保持对齐。
-   立即停止当前正在播放的模型音频，并停止向正在进行的转写气泡追加内容。
-   清除未播放的音频缓冲区以及任何待渲染的转写内容，避免过时内容混入下一轮。
-   为下一轮用户和模型内容创建新的聊天气泡。

#### 处理转录的 `finished` 信号

对于流式传输的 `input_transcription` / `output_transcription` 数据块，当 `finished` 未设置时，将其追加到当前活跃的气泡中；当检测到 `finished` 时，关闭该气泡并新建一个气泡。将 `input_transcription` 文本路由到用户角色气泡，将 `output_transcription` 文本路由到模型角色气泡。

### 第 7 步：生成 `how_to_test_with_ui.md`

编写 `how_to_test_with_ui.md`，说明如何启动和使用演示服务。它必须包括：

-   启动后端服务所需的确切 shell 命令或脚本调用方式。
-   启动前端 UI 所需的确切 shell 命令或脚本调用方式。
-   用户应在浏览器中打开的主机和端口（例如 `http://localhost:PORT`）。
-   如何启动会话、选择模型、选择输入源（麦克风、摄像头、屏幕）、发送文本消息，以及在 UI 中观察模型音频和转录文本。

## 验证清单

在确认生成完成之前，请验证以下每一项：

-   [ ] `client_server_messages.md`、`client_server_messages.proto` 和 `session_manager.md` 已复制到目标文件夹中。
-   [ ] 生成的客户端导入了由本地 proto 生成的 `ClientMessage` 和 `ServerMessage` 类型。
-   [ ] 客户端连接到位于 `wss://{location}-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent`（或全局变体 `wss://aiplatform.googleapis.com/...`）的 Live API WebSocket，并将 setup 的 `model` 字段格式化为 `projects/{project_id}/locations/{location}/publishers/google/models/{model_id}`。
-   [ ] 身份验证使用 ADC 提供的 bearer token，并以 `Authorization: Bearer <token>` 的形式发送；token 会在过期前刷新，并在每次重新连接时重新附加。
-   [ ] 存在公共异步方法 `send_realtime_data`、`send_client_content` 和 `receive`，这些方法具有正确的类型标注，并受 `setup_complete` 状态控制。
-   [ ] 已启用透明会话恢复（`session_resumption.transparent = true`），会跟踪最新的 `new_handle`，已发送消息的索引从 1 开始，缓冲区通过 `last_consumed_client_message_index` 进行清理，并且会在重新连接时重放缓冲的消息（包括发生 `go_away` 以及 WebSocket 关闭代码为 1000 / 1006 时）。
-   [ ] 如果使用 python，则目标文件夹内存在隔离环境（例如 `venv`）以及 `setup.sh` 和 `requirements.txt`（或等效文件）；未对系统级或用户全局 Python 进行任何更改。
-   [ ] `how_to_run.md` 和 `how_to_test_with_ui.md` 均已存在，并且演示 UI 复用了相同的 `ClientMessage` / `ServerMessage` proto。
-   [ ] 中断处理和转录 `finished` 处理的行为符合上述说明。
-   [ ] 客户端**不**以 `generativelanguage.googleapis.com` 为目标，并且**不**通过查询字符串中的 API key 进行身份验证。