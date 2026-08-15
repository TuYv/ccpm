---
name: eas-simulator
description: "EAS service (paid). Run and control a user's app on a remote iOS/Android simulator hosted on EAS cloud. Read before running any `eas simulator:*` commands - it has the current syntax for this experimental API. Use whenever the user needs a simulator they can't run locally - 'run my app on a cloud simulator', 'use eas simulator to run/install/screenshot my app', 'I'm on Linux/Cursor and need an iOS device', 'no sim on this box / headless CI', 'let an agent click through my app and screenshot it', 'test my dev build on a remote sim with live reload', 'stream a sim to my browser' - even when they don't say 'EAS Simulator' or 'cloud'. On a host WITHOUT a local simulator (Linux, CI, cloud sandbox) it's the default; on macOS, do NOT auto-trigger for a plain 'run on the simulator' - use it only for a cloud/remote/shareable sim, an iOS version they lack, or an agent-driven session. NOT for local sims (expo run:ios, Xcode, Android Studio), EAS Build/Update, web preview, or physical devices."
version: 1.0.0
license: MIT
allowed-tools: "Bash(npx *eas-cli@*), Bash(npx *agent-device@*), Bash(npx expo *), Bash(eas *), Bash(expo *), Bash(xcodebuild*), Bash(pod*), Bash(argent *), Bash(ffmpeg*)"
---
# EAS Simulator

> **EAS 服务会产生费用。** EAS Simulator 运行在 Expo Application Services 云基础设施上，该服务为付费产品，并提供有限的免费额度；远程模拟器会话会占用你的套餐计算额度。请参阅 https://expo.dev/pricing。

EAS Simulator 会在 EAS 基础设施上运行远程 iOS 模拟器或 Android 模拟器，并允许你从自己的机器进行操控——可以通过 CLI、AI 智能体（借助 `agent-device`）以及浏览器预览来操作。它为**无法在本地运行模拟器的环境**（Linux 主机、Cursor Cloud 等云端/后台智能体）解锁了模拟器能力，也让智能体能够在真实设备上*验证*更改，而不只是根据代码进行推理。

`simulator:*` 命令是**实验性且隐藏的**，需要较新版本的 eas-cli（撰写本文时要求 ≥ 20.3.0）——因此，此 Skill 通过 `npx --yes eas-cli@latest` 运行所有命令。标志和动词可能会发生变化；如果命令失败，请以 **`<cmd> --help` 为准。**

## 何时使用

frontmatter 中的 `description` 包含触发短语。简而言之：使用此 Skill 可将用户的应用部署到**云端**模拟器并与之交互——尤其适用于没有 Mac 的智能体或云端/沙盒智能体。**不适用于**本地模拟器（`expo run:ios`、Xcode、Android Studio）、应用商店构建/签名（那属于 EAS Build），也不适用于物理设备。对于 macOS 情况，请参阅下一节的*云端与本地对比*。

## 云端与本地：首先做出选择

- **非 macOS**（Linux / CI / Cursor Cloud 等云端沙盒，可通过 `uname -s` ≠ `Darwin` 检测）：这是获得模拟器的唯一方式——**确认拥有访问权限后即可继续**（请参阅下方的*首先检查可用性*）。
- **macOS：**本地已有模拟器可用，而云端会话会产生费用并增加延迟，因此应**先询问用户**（“是使用远程云端模拟器——以便共享实时预览、卸载本地计算负载，或测试本机缺少的 iOS 版本——还是直接在本地运行？”），除非用户已经明确提出使用云端/远程/可共享环境。
- 始终遵从用户的明确选择；对于“在本地运行”，请转交给 `expo run:ios` / Xcode。

```bash
# Programmatic detection — run this to decide before doing anything else:
if [ "$(uname -s)" != "Darwin" ] || ! xcrun --find simctl &>/dev/null 2>&1; then
  echo "no local sim — proceed with EAS Simulator"
else
  echo "local sim available — ask the user (cloud or local?)"
fi
```

## 前置条件

- **通过 `npx --yes eas-cli@latest …` 运行每一条 `eas` 命令**——这可确保 CLI 版本足够新并包含 `simulator:*`（全局安装的 `eas` 通常版本过旧），而 `--yes` 会跳过 npx 的提示。（如果 `eas --version` 显示的是当前版本，也可以直接使用 `eas`。）
- **已完成身份验证。** 交互式机器 → `npx --yes eas-cli@latest login`。**云端沙盒 / CI / 无头智能体无法通过浏览器登录——请改为在环境中设置 `EXPO_TOKEN`**（expo.dev → Account → Access Tokens）。无论采用哪种方式，都请使用 `npx --yes eas-cli@latest whoami` 进行验证。
- 从 Expo **项目目录**运行。新应用需要进行一次性设置：当不存在 `projectId` 时，运行 `npx --yes eas-cli@latest init` 来创建/关联项目；如果应用配置中缺少 **`ios.bundleIdentifier`，还需进行设置**——新建的 `create-expo-app` 项目通常没有此项，而 `prebuild`/`eas build` 需要它（若缺失，这些命令会提示输入或执行失败；例如 `dev.<owner>.<slug>`）。使用 `npx expo config --json` 读取当前配置（配置可能位于 `app.config.js` 中）。第一次运行 Mode-C 会比较慢（需要原生构建）；后续运行会复用该构建。
- 需要一个控制器来操控设备。此 Skill 使用 **agent-device**（开源，MIT），通过 `npx agent-device@latest` 按需运行——无需全局安装任何内容。**argent** 是另一种选择（在 `simulator:start` 中使用 `--type argent`）；请参阅 [references/controllers.md](./references/controllers.md)。
- **`.env.eas-simulator`** 由 eas-cli 写入/管理（而非此 Skill）：其中包含会话 ID（`EAS_SIMULATOR_SESSION_ID`）以及守护进程 URL/**令牌**，因此 `get`/`stop`/`exec` 默认以该会话为目标（通常应**省略 `--id`**；传入 `--id <id>` 可指定另一个会话）。该文件包含**令牌 → 请确保将其加入 gitignore**（eas-cli 会将其标记为“请勿提交”，但可能不会添加忽略规则，而新应用的 `.gitignore` 也不会涵盖它——如果缺少，请添加 `.env.eas-simulator`）。
- `--max-duration-minutes` 仅适用于付费套餐；否则会采用默认值。
- **这些命令块假定使用 POSIX shell**（bash/zsh）——`printf`、`lsof`、`$(seq …)` 循环无法在 cmd/PowerShell 中运行。在 Windows 上，请在 WSL 或 Git Bash 中运行，或者在执行过程中自行转换（`eas-cli`/`agent-device` 调用本身是跨平台的）。

## 首先检查可用性

EAS Simulator 是一项仍在逐步推出的**限量开放** EAS 功能，因此并非每个账户都已启用。请在启动会话**之前**确认是否有访问权限——这是一项只读检查：不会创建会话，也不会产生费用。

```bash
npx --yes eas-cli@latest simulator:availability --json
# → {"available": true, ...}  enabled → continue to the core loop
# → {"available": false, ...} not enabled → do NOT start a session
```

如果该功能**不可用**，请勿调用 `simulator:start`（它会失败）。应改为妥善转交，以便在不使用此 Skill 的情况下继续推进：
- 告知用户，其账户尚未获得 EAS Simulator 的使用权限——该功能即将开放。
- 回退到其实现实际目标时通常使用的本地路径——使用 `expo run:ios` / Xcode / Android Studio 启动本地模拟器，使用 EAS Build，或采用其他合适的方式。不要因为云端模拟器不可用而陷入僵局；用户的请求几乎从来都不是“必须使用 EAS Simulator”。

（如果无法识别 `simulator:availability`，则说明 CLI 版本太旧——请升级；或者，如果 `simulator:start` 返回 `not enabled for this account` 错误，也应以相同方式处理：停止并回退。）

## 核心循环（始终相同）

一个会话的流程是：**启动 →（安装你的应用）→ 操作 → 停止。** `eas-cli` 负责管理*会话*；设备*操作命令*（打开/点按/截图）由控制器提供，而 `npx --yes eas-cli@latest simulator:exec` 会在加载会话连接环境变量后为你运行这些命令。

```bash
# 1. Start a session (boots the remote sim + agent-device daemon; writes .env.eas-simulator).
printf '# managed by eas-cli\n' > .env.eas-simulator   # clear any stale session first
npx --yes eas-cli@latest simulator:start --platform ios --type agent-device --non-interactive \
  --name "Checkout flow screenshots"   # always name it — see 'Always name the session'
#    Then confirm it's live: simulator:get --json → status IN_PROGRESS (bounded poll in run-your-app.md).

# 2. Drive it through `exec` (loads the session env, then runs the command you give it).
#    agent-device runs on demand via npx — nothing installed globally.
npx --yes eas-cli@latest simulator:exec npx agent-device@latest open <app-or-url> --platform ios
npx --yes eas-cli@latest simulator:exec npx agent-device@latest snapshot -i          # interactive UI tree → @e1, @e2 refs
npx --yes eas-cli@latest simulator:exec npx agent-device@latest press @e2            # tap a ref (NOTE: 'press', not 'tap')
npx --yes eas-cli@latest simulator:exec npx agent-device@latest screenshot ./shot.png

# 3. Stop (ends billing; tears down the VM) and reset the dotenv. Omit --id to target the dotenv session.
npx --yes eas-cli@latest simulator:stop
printf '# managed by eas-cli\n' > .env.eas-simulator
```

如需**实时查看**，请将 `start` 输出的 `webPreviewUrl` 提供给用户（`--type agent-device` 类型的 iOS 会话会在运行守护进程的同时运行 serve-sim，因此会生成该 URL——一个会话中同时提供代理控制和浏览器预览；Android 不提供预览，而 `--type serve-sim` 仅提供预览）。**此 URL 是供*用户*在浏览器中打开的——你无法替用户打开，并且绝不能将它传入模拟器：**
- **“在这里打开”（Cursor/VS Code）** → 单独一行输出该 URL，并告诉用户打开 Simple Browser（`Cmd/Ctrl+Shift+P` → "Simple Browser: Show"）并粘贴该 URL。然后**停止操作**：不要通过 shell 调用系统浏览器或 Cursor/VS Code URL 处理程序，也不要询问“是否出现了标签页？”——你无法确认这一点，转交操作已经完成。
- **绝不要在模拟器中 `open` `webPreviewUrl`。** 它是浏览器预览地址，不是深层链接，也不能作为 `agent-device open` 的参数；将它传给设备会导致浏览器中嵌套浏览器的显示效果（这是真实发生过的故障）。
- **无界面代理**（没有显示环境）→ 只需将该 URL 作为交付结果返回。
- **保持会话运行以供用户操作** → 为其设置边界：启动时使用 `--max-duration-minutes N`，以便会话自动停止；告知用户会话在停止前会持续计费，以及何时会自动停止；会话结束后，可提出重新开启或延长会话。（这是唯一不适用“立即停止”原则的情况；一次性的 `screenshot`/`get` 操作仍应立即停止。）

`start` 还会输出作业运行 URL。

## 始终为会话命名

每次调用 `simulator:start` 时都要传入 `--name "<description>"`。该名称会显示在 `simulator:list`、`simulator:get` 以及 expo.dev 上的 **Simulator sessions** 页面中，并替代每一行的通用标题。如果不命名，每一行都会在随机 id 上方显示“Simulator session”——满屏都是完全相同、无人能够浏览定位的条目。名称应该写给**几天后查看该列表的人**，而不是写给本次运行期间的自己。

用几个简单的词说明会话的*用途*：

```bash
--name "Checkout flow screenshots"     # what you did
--name "Dev build — dark mode fix"     # what you were testing
--name "Login repro for issue 412"     # why it exists
```

规则：
- 根据用户的请求命名，而不是根据模式或工具命名。`Mode C session`、`agent-device ios` 和 `test` 都无法说明任何信息。
- **长度：以 3–6 个单词、约 40 个字符为目标，并将 50 个字符视为实际限制。** 它会作为单行标题显示在狭窄的表格列中，因此过长的名称会被截断。API 最多接受 **255 个字符**，并会拒绝空名称或仅包含空白字符的名称，但 255 是永远不应接近的上限，而不是目标。使用一个名词短语，不要写句子。
- 在该长度范围内尽量具体。如果有工单号或 PR 编号，请将其包含在内。
- **句首大写：**仅将第一个单词的首字母大写，标识符则保留其实际大小写（`Dev build for expo-router v4`、`Repro for EXPO-1234`）。这是一个行标题，因此不要使用标题式大小写，不要全部小写，也不要在末尾添加句号。
- **不要重复表格中已有的信息。** 每一行已经显示会话 id、平台、开始时间、持续时间和创建者，因此不要添加 id、`iOS`、日期或你自己的名字。将全部字数用于说明这些列无法表达的信息：用途。
- 如果用户指定了名称，请原样使用。
- 会话按每次运行创建，因此请为每次新运行单独命名。不要将旧名称复用于不同的工作。

`--name` 比 `simulator:start` 本身更新，因此较旧版本的已安装 `eas-cli` 可能会拒绝该参数。如果发生这种情况，请通过 `npx --yes eas-cli@latest` 运行或升级；作为最后的手段，可以不带 `--name` 重试一次（会话将以未命名状态启动）。请参阅 [references/troubleshooting.md](./references/troubleshooting.md)。

## 命令速览

| 命令 | 用途 |
|---|---|
| `npx --yes eas-cli@latest simulator:start --platform ios\|android --name "<description>" [--type agent-device\|argent\|serve-sim] [--package-version X] [--max-duration-minutes N] [--non-interactive] [--json]` | 创建会话；启动模拟器和控制器；写入 `.env.eas-simulator`；输出 `webPreviewUrl` 和作业运行 URL。**始终传入 `--name`**（参见*始终为会话命名*）。**`--json` 会阻止写入 `.env.eas-simulator`**——在 `exec` 流程中请省略该参数，或者自行根据 `remoteConfig` 设置环境。 |
| `npx --yes eas-cli@latest simulator:exec <cmd> [args…]` | 加载 `.env.eas-simulator`，然后使用该环境运行 `<cmd>`。这是连接控制器的桥梁。 |
| `npx --yes eas-cli@latest simulator:get [--id] [--json]` | 获取会话状态和连接详细信息，包括会话的 `--name`。**使用此命令确认是否就绪**（参见*操作原则*）。 |
| `npx --yes eas-cli@latest simulator:list [--status …] [--type …] [--platform …]` | 按名称列出应用的会话——这正是向 `start` 传入 `--name` 的用途 |
| `npx --yes eas-cli@latest simulator:stop [--id]` | 停止会话（幂等操作） |

## 运行用户的应用——选择一种模式

远程模拟器启动时是**空白的——没有 Expo Go，也没有任何应用。**先安装一个构建，然后再操作它——但首先要**让构建的*类型*与目标相匹配**（参见下方提示框）；实时会话往往就是在这里出问题。完整流程请参阅：[references/run-your-app.md](./references/run-your-app.md)——运行某种模式前请先阅读。

> **在安装任何内容之前，先让构建与目标相匹配——实时会话往往就是在这里出问题。**有两个陷阱，但根本原因相同（拿到的构建不符合请求）：
> 1. **类型错误。**实时编辑（模式 C）**需要开发构建。***静态*构建——本地 Release 构建（A）、默认的 EAS 模拟器构建（B），或**之前截图运行后遗留在模拟器上的任何构建**——都会在构建时固化其 JS，且**永远无法热重载。**对于实时请求，请**完全忽略现有构建**，并安装一个**开发**构建（本地 Debug 构建，或带有 `developmentClient: true` 的 EAS 构建）。绝不要把 Metro 重新连接到静态构建，并指望它能够重载——它不会。
> 2. **过时。**静态呈现必须与当前源代码一致——仅可复用指纹匹配的构建，否则应重新构建；只有明确要求时才能复用。
>
> 因此，遗留的 EAS/release 构建**不是**“实时迭代”的捷径——它是错误的二进制文件。某个构建*存在*这一事实，绝不意味着它就是正确的构建。

| 模式 | 它是什么 | 何时选择 | 实时编辑？ |
|---|---|---|---|
| **A——本地 release 构建** | 在本地构建一个 Release `.app`，并使用 `agent-device install` 安装它（上传） | 用户拥有 Mac 工具链，并希望快速“在云设备上运行我当前的代码” | 否（需要重新构建才能看到更改） |
| **B——EAS 构建**（很少使用，仅限明确要求） | 使用 `eas build` 创建模拟器构建，再执行 `agent-device install-from-source <url>`（由 VM 下载） | **仅当用户明确要求时**——用户指定了现有/EAS 构建，或希望获得用于 CI/共享的静态 EAS 制品。不适用于“展示给我看”/“迭代”（请使用 C）。模拟器构建不需要凭据。 | 否 |
| **C——本地开发构建 + 隧道** | 开发（Debug）构建 + `EXPO_UNSTABLE_TUNNEL_V2=1 expo start --tunnel` + 将开发客户端连接到 Metro | **智能体式的编辑并查看循环**——修改代码并实时查看效果（Fast Refresh） | **是** |

快速决策——**默认使用 C；A 和 B 仅限明确要求：**
- **C（几乎适用于所有情况）：**迭代、交互、探索应用、实时编辑——以及大多数“展示我的应用”请求（当前代码无论如何都需要构建，因此实时且最新的方案更优）。有 Mac → 在本地构建开发客户端；没有 Mac → 在 EAS 上构建（`developmentClient: true`）。**不确定 → 选择 C。**
- **A：**仅用于在 Mac 上明确要求的一次性**静态**截图。
- **B：**仅当用户指定现有/EAS 构建，或希望获得静态 EAS 制品（CI/共享）时使用——关于为什么静态构建不适合“迭代”，请参阅上方提示框。

## 操作设备（agent-device）

`agent-device` 是控制器。常用动词如下（每个都以 `npx --yes eas-cli@latest simulator:exec npx agent-device@latest <verb>` 的形式运行）：

| 动词 | 作用 |
|---|---|
| `apps --platform ios` | 列出用户安装的应用（空白模拟器不会显示任何应用）；添加 `--all` 可包含系统应用 |
| `install <appId> <path> --platform ios` | 安装本地 `.app`（上传它） |
| `install-from-source <url> --platform ios` | 从 URL 安装——由 VM 下载（用于 EAS 制品） |
| `open <appId\|deep-link> --platform ios` | 启动应用（bundle id）或打开应用的**深层链接**（`exp+slug://…`）。首次打开深层链接时会弹出系统的**“要在 ‘<app>’ 中打开吗？”**对话框——请预先考虑到这一点（不要浪费一次快照才发现它），并执行 `press 'label="Open"'` 进行交接；此操作可能很慢，因此请使用 agent-device 自身的 `--timeout` 限制等待时间（例如 `press 'label="Open"' --timeout 120000`）——**不要**使用 shell 的 `timeout` 包装器（macOS 没有 `timeout` 二进制文件）。（模式 C 通过“手动输入 URL”来处理 Metro 连接链接，从而绕过此对话框——参见 run-your-app.md。）**不要**用于 `webPreviewUrl`——那是供用户使用的浏览器预览地址，绝不能用于设备。 |
| `snapshot -i` | 交互式无障碍树 → `@e1` 形式的引用 |
| `press <ref\|selector>` | 点击（例如 `press @e2` 或 `press 'label="Open"'`）——**点击动词是 `press`，不是 `tap`** |
| `fill <ref> "text"` | 在字段中输入文本 |
| `screenshot <path>` | 将屏幕捕获为本地 PNG（从守护进程下载）——要求已有应用处于打开状态（先执行 `open`） |
| `record start` / `record stop <path>` | 将屏幕录制为视频——用于捕捉**动态效果**（动画、手势、转场、时序），这些内容无法通过单张截图捕获 |
| `metro prepare` / `metro reload` | 将开发客户端指向 Metro / 重新加载（模式 C） |

**截图与视频。** 对于静态状态，默认使用 `screenshot`；但对于任何会*运动*的内容——动画、过渡、手势，或有关时序/卡顿的问题——应改为**录制视频并检查各帧**；静态图像无法证明运动情况。两种控制器都支持录制（agent-device 使用 `record start`/`stop`，argent 使用 `screen-recording-start`/`stop`）。录制采样率约为 30fps——足以看出肉眼可见的卡顿，但无法证明发生了帧间隔以内的 60/120Hz 卡顿。特别是对于**时序**，argent 默认会丢弃静态帧（关闭 `trimStatic`）——这一点以及其他各控制器特有的注意事项，请参阅 [references/controllers.md](./references/controllers.md)。

有关完整的动词集以及备选的 `argent` 控制器，请参阅 [references/controllers.md](./references/controllers.md)。

## 操作原则

以下是值得内化的、不那么显而易见的思维模型。具体的错误→修复对照（动词命令挂起、`tap`→`press`、`--platform`、`--json`、`pod install` 区域设置、孤立会话、启动时间差异）请参阅 [references/troubleshooting.md](./references/troubleshooting.md)。

1. **先确认实际状态，再重置——不要陷入反复打补丁的循环。** 绝不要假设现有会话或 Metro 属于你，或处于健康状态。开始操作前，请确认：
   - **当前工作目录**——你位于目标 Expo 项目目录中（在错误目录执行 `start`/`exec` 会为*错误的应用*创建会话，并遗留一个无关的 `.env.eas-simulator`；运行 `pwd` / 检查 `app.json`）。
   - **会话仍然有效**——通过 `simulator:get --json` 确认状态为 `IN_PROGRESS`（已停止的会话仍会保留其 id 和 `remoteConfig`，因此仅凭 dotenv 文件不能证明会话有效）。
   - **Metro 使用独立端口**——仅当 Metro 是你在本次会话中启动的，才可复用；否则请在空闲端口上启动一个新实例（`--port <N>`，例如 8082），不要为了抢占 `:8081` 而终止其他服务器（run-your-app.md）。
   - **构建符合预期用途**——**发布构建无法进行实时重新加载**；如果需要实时编辑，但安装的是发布构建，应该**安装开发构建，而不是重新连接**。

   如果**第一次**连接后当前代码仍未渲染，请停止反复调整实时状态：**重置到基线状态**（停止会话 → 清除 dotenv → 终止你的 Metro），然后将该模式**重新执行一次**；如果第二次仍然失败 → 停止并报告。绝不要原地重启 Metro、重新连接超过一次、为修复 JS/连接问题而重新构建原生客户端，或在状态未知时提供预览 URL。（守护进程断开——`ERR_NGROK_3200` / `Remote daemon is unavailable`——也应采用相同处理方式：重置，不要重试。）
2. **`exec` 是包装器，不是驱动器。** `simulator:exec` 会加载 `.env.eas-simulator`，然后生成你传入的命令对应的进程；设备动词命令来自控制器（`npx agent-device@latest`）。不存在 `simulator:tap`。
3. **立即操作；不要让会话闲置。** 会话生命周期很短——执行 `start` 后应立即安装并操作。会话闲置会导致隧道/守护进程断开（→ 按第 1 条重置）。
4. **在所有退出路径上停止会话（计费），并重置 dotenv。** `--non-interactive` 不会自动停止会话，忘记停止的会话会持续计费，直至被停止。不要再次执行 `start` 来“重试”缓慢的启动——这会遗留第二个仍在计费的孤立会话。
5. **只截取正确且最新的构建。** 模式 C 只能在开发客户端连接到 Metro 后使用；模式 A/B 只能使用与当前源代码匹配的构建——复用已有构建是“我的编辑没有显示”的首要原因（请参阅上面的构建注意事项）。（状态栏中的 `9:41` 是模拟器的默认时间，并不表示内容陈旧。）

## 停止并清理

停止会话（终止计费），**并重置 dotenv**，以免后续运行尝试复用已失效的会话：

```bash
npx --yes eas-cli@latest simulator:stop          # omit --id → stops the dotenv session (or pass --id <id>)
printf '# managed by eas-cli\n' > .env.eas-simulator   # clear the stale session id so it isn't reused
# if you started Metro for Mode C, stop it too (Ctrl+C in its terminal, or kill the expo process)
```

## 参考资料

- [references/run-your-app.md](./references/run-your-app.md) — 模式 A、B 和 C 的完整命令序列（运行某个模式前请先阅读）。
- [references/controllers.md](./references/controllers.md) — agent-device 操作指令参考以及 `argent` 替代方案。
- [references/troubleshooting.md](./references/troubleshooting.md) — 具体的错误和修复方法。

权威来源：Expo 文档以及 `eas` / `agent-device` CLI（`npx --yes eas-cli@latest simulator:* --help`、`agent-device --help`）。此技能讲解如何使用它们，但不能取代它们。

## 提交反馈
如果你在此技能中遇到错误、误导性信息或过时信息，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "eas-simulator" "<actionable feedback>"
```
仅当你有具体且可付诸行动的问题需要报告时才提交。请尽可能提供相关上下文。
如果 AI 代理反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback 技能并遵循其 eval-candidate 流程，而不要重复使用上述命令。