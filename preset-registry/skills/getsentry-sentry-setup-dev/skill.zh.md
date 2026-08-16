---
name: setup-dev
description: Set up and manage the Sentry development environment using devenv. Handles fresh setup, updating existing environments, starting dev services, resetting the database, per-worktree environment setup (each worktree needs its own devenv sync/.venv), and troubleshooting. Use when asked to "set up sentry", "setup dev environment", "get sentry running", "start dev server", "devenv setup", "devservices not working", "sentry won't start", "reset the database", "new worktree venv/devenv setup", or any development environment issue.
---
# 设置 Sentry 开发环境

引导用户在本地运行 Sentry。从一台未配置的机器开始，完整流程需要 **30-45 分钟**——其中大部分时间用于下载依赖项和 Docker 镜像。请在每个步骤中清楚说明所需时间和预期情况。

**AL MCP**：如果 `al` MCP 服务器可用，请使用 `al_search_docs` 和 `al_read_doc` 进行详细的故障排查。AL 文档深入涵盖了 devenv、devservices 和常见问题。AL 服务器是 [devinfra-mcp](https://github.com/getsentry/devinfra-mcp) 项目的一部分——如果尚未配置该服务器，请参阅该仓库中的设置说明。SSE 端点配置在 `.pi/mcp.json`（pi）或 `.mcp.json` / `.cursor/mcp.json`（Claude Code / Cursor）中。

## 步骤 1：检测当前状态

在执行任何操作之前，先评估已经安装了哪些组件。运行以下所有命令：

```bash
# Check OS
uname -s && uname -m

# Check shell
echo $SHELL

# Check if devenv exists
which devenv 2>/dev/null || ls ~/.local/share/sentry-devenv/bin/devenv 2>/dev/null

# Check devenv version (outdated versions cause failures)
devenv --version 2>/dev/null || ~/.local/share/sentry-devenv/bin/devenv --version 2>/dev/null

# Check Docker runtime
docker context ls 2>/dev/null
docker info --format '{{.Name}}' 2>/dev/null

# Check OrbStack
which orbctl 2>/dev/null && orbctl status 2>/dev/null

# Check Colima
which colima 2>/dev/null && colima status 2>/dev/null

# Check direnv
which direnv 2>/dev/null

# Check if repo is already set up
ls .venv/bin/sentry 2>/dev/null && ls node_modules/.bin 2>/dev/null
```

根据结果，跳转到适当的步骤。如果所有组件均已安装，请直接跳到步骤 6。

## 步骤 2：安装前置依赖（macOS）

### Xcode 命令行工具

```bash
xcode-select -p 2>/dev/null || xcode-select --install
```

如果尚未安装，用户必须完成交互式安装对话框中的操作（约 10 分钟）。等待安装完成。

### Homebrew

```bash
which brew || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Docker 运行时——OrbStack 或 Colima

询问用户更喜欢哪一个。说明两者的权衡：

| 运行时         | 优点                                                   | 缺点                                                     |
| ------------ | ------------------------------------------------------ | -------------------------------------------------------- |
| **Colima**   | Sentry 官方推荐，所有脚本均支持                        | WiFi 发生变化时可能出现 DNS 问题                         |
| **OrbStack** | 速度更快、资源占用更低、UI 更好                        | 部分 Sentry 脚本默认使用 Colima——可能需要变通方案       |

**如果选择 OrbStack：**

```bash
brew install --cask orbstack
```

然后从“应用程序”中启动 OrbStack。验证：`docker info`

**如果选择 Colima：**
Colima 会由 `devenv bootstrap` 安装——无需单独执行安装步骤。

**重要**：不要同时运行 Docker Desktop 和上述任一运行时——这会导致冲突。

## 步骤 3：安装 devenv

```bash
# For external (non-Sentry-employee) contributors:
# export SENTRY_EXTERNAL_CONTRIBUTOR=1

curl -fsSL https://raw.githubusercontent.com/getsentry/devenv/main/install-devenv.sh | bash
```

这会将其安装到 `~/.local/share/sentry-devenv/bin/devenv`。

### Shell 配置

用户的 Shell 必须将 devenv 加入 PATH，并启用 direnv hook。检查并修复：

```bash
# Check if already configured
grep -q "sentry-devenv" ~/.zshrc 2>/dev/null || grep -q "sentry-devenv" ~/.bashrc 2>/dev/null
```

如果尚未配置，请将以下内容添加到相应的 Shell 配置文件中（zsh 使用 `~/.zshrc`，bash 使用 `~/.bashrc`）：

```bash
# devenv
export PATH="$HOME/.local/share/sentry-devenv/bin:$PATH"

# direnv
eval "$(direnv hook zsh)"   # or: eval "$(direnv hook bash)"
```

完成此更改后，**告诉用户重启终端**（或运行 `source ~/.zshrc`）。

### 验证 devenv 版本

最低版本要求经常变化。如果已安装 devenv，请检查其版本是否过旧：

```bash
devenv --version
```

如果版本较旧（例如低于 1.22），请升级：

```bash
devenv update
```

如果由于版本过旧，连 `devenv update` 本身也无法运行，请重新安装：

```bash
curl -fsSL https://raw.githubusercontent.com/getsentry/devenv/main/install-devenv.sh | bash
```

## 第 4 步：引导初始化（仅首次需要）

对于全新的设置，请先运行引导初始化：

```bash
devenv bootstrap
```

这是一个交互式过程（约 5 分钟）——它会询问 SSH 密钥、coderoot 目录等信息，并安装 Homebrew、Colima、Docker CLI 和 direnv。

**引导初始化完成后，请关闭并重新打开终端。**

## 第 5 步：同步环境

这是耗时最长的步骤。请告诉用户：

> **首次运行需要 10-20 分钟**。它会安装 Python、Node、所有 pip/npm 依赖项，并运行数据库迁移。后续同步会快得多（2-5 分钟）。

### 如果 direnv 卡住

`.envrc` 会运行 Docker 检查。如果 Docker 运行时未启动，direnv 就会卡住。症状如下：

```
direnv: ([...]/direnv export zsh) is taking a while to execute. Use CTRL-C to give up.
```

**解决方法**：先启动 Docker 运行时：

- OrbStack：打开 OrbStack.app 或运行 `open -a OrbStack`
- Colima：运行 `devenv colima start`

然后再次运行 `direnv allow`。

### 先有鸡还是先有蛋的问题

direnv 会检查 node 版本和 sentry 安装。在全新设置中，这些尚不存在，因此 direnv 会失败。这是正常现象。**绕过 direnv，直接运行 devenv sync：**

```bash
~/.local/share/sentry-devenv/bin/devenv sync
```

或者，如果 devenv 已加入 PATH：

```bash
devenv sync
```

同步完成后，`direnv allow` 应该就能成功运行。

### 如果 devenv sync 失败

常见原因：

1. **devenv 版本过旧**——运行 `devenv update` 或重新安装
2. **Docker 未运行**——先启动 OrbStack/Colima
3. **网络问题**——重试；某些下载文件较大

运行 `devenv doctor` 进行自动诊断。

## 第 6 步：启动服务

### 首先：启动 Docker 镜像

```bash
devservices up
```

**⏱️ 首次运行：5-10 分钟。**它会拉取许多 Docker 镜像（PostgreSQL、Redis、Kafka、ClickHouse、Snuba、Relay 等）。这是一次性耗时。请告诉用户：

> 这正在下载 Sentry 所需的所有 Docker 镜像。看起来数量很多——这是正常的。后续启动大约需要 30 秒。

**后续运行：约 30 秒。**

### OrbStack 套接字问题

如果 `devservices up` 或 `devservices serve` 失败并显示：

```
Make sure colima is running. Run `devenv colima start`.
```

……但用户使用的是 OrbStack，那么 `devservices.py` 命令只检查了 Colima 套接字。检查 `src/sentry/runner/commands/devservices.py`：

```bash
grep -n "colima\|docker.sock\|orbstack" src/sentry/runner/commands/devservices.py
```

`_find_docker_socket()` 函数需要检查多个套接字路径。在 macOS 上，它应按以下顺序尝试：

1. `~/.colima/default/docker.sock`（Colima）
2. `~/.orbstack/run/docker.sock`（OrbStack）
3. `/var/run/docker.sock`（Docker Desktop / 默认路径）

如果只检查了 Colima，请对其进行修补以支持所有运行时。确切的实现模式请阅读 `references/orbstack-fix.md`。

### 然后：初始化数据库数据

如果这是首次设置，则需要初始化数据库数据：

```bash
.venv/bin/sentry upgrade --noinput
```

这会运行所有 Django 迁移，并创建默认数据（组织、角色、项目）。如果不执行此操作，开发服务器访问任何页面都会返回 500 错误。

**不要只运行 `sentry django migrate`**——它只会运行迁移，而不会初始化所需的默认数据。

### 创建超级用户

```bash
.venv/bin/sentry createuser --superuser --email admin@sentry.io --password admin --no-input
```

## 第 7 步：启动开发服务器

```bash
devservices serve
```

或者直接运行：

```bash
.venv/bin/sentry devserver
```

### 启动时会出现什么

**Kafka 主题警告是正常现象。** 首次启动时，你会看到许多类似这样的行：

```
[WARNING] sentry.batching-kafka-consumer: Topic 'taskworker' or its partitions are not ready, retrying...
```

随着 Kafka 自动创建主题，这些警告会在 30-60 秒后逐渐消失。不要惊慌。

### 访问开发服务器

- **URL**：http://dev.sentry.localhost:8000
- **登录信息**：admin@sentry.io / admin

### 必需：Sentry Cookie Sync 扩展程序

**如果没有此扩展程序，UI 将显示空白白屏。** 请安装：

https://chromewebstore.google.com/detail/sentry-cookie-sync/kchlmkcdfohlmobgojmipoppgpedhijh

它会在 sentry.io 和 dev.sentry.localhost 之间同步身份验证 Cookie。这不是可选项。

## 日常使用命令

初始设置完成后，日常工作流程如下：

```bash
cd ~/Projects/sentry    # (or wherever the repo lives)
devservices up           # start background services (~30s)
devservices serve        # start dev server
# → http://dev.sentry.localhost:8000
```

拉取新代码后：

```bash
devenv sync              # update dependencies + migrations (2-5 min)
```

### 重置数据库

```bash
make reset-db
```

### Git 工作树

每个工作树都有自己的 `.venv`。当你使用 `git worktree add` 创建工作树时，检出后钩子会在其中运行 `devenv sync`，以设置开发环境。否则，请在新工作树中运行一次 `devenv sync`，然后运行 `direnv allow` 进行验证并激活该环境。

## 故障排除决策树

| 症状                                            | 可能原因                                  | 修复方法                                               |
| ----------------------------------------------- | ----------------------------------------- | ------------------------------------------------------ |
| direnv 卡住                                     | Docker 运行时未运行                       | 启动 OrbStack / Colima                                 |
| `devenv sync` 因版本错误而失败                  | devenv 版本过旧                           | `devenv update` 或重新安装                             |
| `devservices up` 提示“colima 未运行”            | 使用 OrbStack，但脚本只检查 Colima        | 修补 `devservices.py`——参见第 6 步                     |
| 服务器访问任何页面都返回 500 错误               | 数据库未初始化默认数据                    | `.venv/bin/sentry upgrade --noinput`                   |
| `relation "sentry_organization" does not exist` | 未运行迁移                                | `.venv/bin/sentry upgrade --noinput`                   |
| 浏览器中显示白屏/空白屏幕                       | 缺少 Cookie Sync 扩展程序                 | 安装 Chrome 扩展程序                                   |
| 启动时出现 Kafka 主题警告                       | 首次启动时的正常行为                      | 等待 30-60 秒                                          |
| 端口已被占用                                    | 存在残留容器                              | 运行 `docker rm -f $(docker ps -aq)`，然后重试         |
| 所有功能都已损坏                                | 终极方案                                  | `devservices purge && devenv sync && devservices up`   |
| Docker 中出现 DNS 故障                          | Colima DNS 已过期                         | `devenv doctor` 或 `devenv colima restart`             |

如需进行更深入的故障排查，请使用 AL MCP（如果可用）（[devinfra-mcp](https://github.com/getsentry/devinfra-mcp)）：

```
al_search_docs(query="<symptom keywords>")
al_read_doc(path="devenv/troubleshooting.md", query="<specific issue>")
```