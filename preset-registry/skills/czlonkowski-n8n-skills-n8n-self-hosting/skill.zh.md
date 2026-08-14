---
name: n8n-self-hosting
description: Deploy a production self-hosted n8n end-to-end to a fresh Linux VM over SSH, using Docker Compose behind a Caddy reverse proxy with automatic HTTPS. Use whenever the user wants to self-host, install, set up, provision, or deploy n8n on their own server/VPS/box (Hetzner, DigitalOcean, AWS EC2, bare metal, etc.) — in either single/regular mode or queue mode with workers — or to update, back up, restore, or harden such an instance. This is for SELF-HOSTED n8n (Docker), not n8n Cloud and not building workflows. The skill makes the agent ask single-vs-queue first, collect the domain/SSH/timezone inputs, generate fresh secrets on the box, and bring the stack up with TLS. Trigger on "deploy n8n", "self-host n8n", "install n8n on my server", "n8n docker compose", "n8n queue mode / workers / scaling", "n8n reverse proxy / SSL", or "back up / update my n8n".
---
# 部署自托管 n8n

此技能可将一台**全新的 Linux VM**（Ubuntu/Debian，通过 root 或 sudo 用户进行 SSH 访问）配置为一个通过 Docker Compose 运行、位于 **Caddy** 之后（自动启用 Let's Encrypt TLS）的**生产级 HTTPS n8n 实例**。
它适用于**通过 Docker 自托管 n8n**，而非 n8n Cloud，也不用于构建工作流
（本技能包的其余部分负责这一点）。

有两种部署模式。二者的架构不同，因此**在进行任何操作之前先选择模式**。

你将通过 SSH 端到端完成此过程：预检 → 安装 Docker → 创建项目 →
生成密钥 → 启动 → 验证 TLS → 移交。模板文件位于 `assets/`；
各模式的详细说明和安全细节位于下方列出的参考文件中。

## 规则 0 — 选择模式（询问用户）

不要猜测。先询问，然后确定其中一种：

| | **单实例 / 常规模式** | **队列模式** |
|---|---|---|
| 进程 | 一个 n8n | 主进程 + N 个 worker |
| 额外服务 | 无（SQLite） | Redis（队列）+ Postgres（数据库） |
| 工作流执行位置 | 主进程中 | worker 上，并行执行 |
| 适用场景 | 1 名用户、轻度/中度负载、运维最简单 | 高流量、繁重/长时间执行、水平扩展 |
| Compose | `assets/docker-compose.single.yml` | `assets/docker-compose.queue.yml` |
| 深入说明 | **`SINGLE_MODE.md`** | **`QUEUE_MODE.md`** |

如果不确定，从**单实例模式**开始——这是最简单且正确的选择，能够满足大多数需求。之后迁移
到队列模式意味着需要替换 compose 文件并将 SQLite→Postgres，因此，如果用户
已经预计会有较大流量，则从**队列模式**开始。

## 规则 1 — 密钥安全规范（不可妥协）

这里的任何失误都会泄露客户端凭据。务必谨慎：

1. **在目标主机上全新生成每一个密钥。** 切勿将加密密钥、数据库
   密码或 `.env` 从其他 n8n 实例复制到此实例。有关
   `openssl` 命令，请参阅 `SECURITY.md`。
2. **密钥只能存放在 `.env` 中**（权限模式 600），并在 compose 中以 `${VAR}` 的形式引用。切勿
   将密钥直接写入 `docker-compose.yml`、Caddyfile 或任何要提交的内容中。
3. **`N8N_ENCRYPTION_KEY` 至关重要。** 它用于加密所有存储的凭据。如果丢失
   或发生变化，所有已保存的凭据都将无法解密。请显式设置它，并告知
   用户将其备份到**目标主机之外**。除移交所必需的情况外，不要将其输出到长期保留的日志或聊天记录中。
4. **切勿暴露内部服务。** 只有 Caddy（80/443）可公开访问。n8n（5678）、Postgres
   （5432）、Redis（6379）应保留在私有 Docker 网络中——模板已经省略了它们的
   主机端口映射。不要添加这些映射。
5. **`.env` 和 Caddy 的 `caddy_data` 卷（签发的证书 + ACME 账户密钥）不是
   可共享的制品。** 如果你在 git 仓库中工作，请在任何提交之前确认 `.env` 已被 git 忽略。

## 需要预先收集的输入

- **SSH 目标** — `user@host` 以及身份验证方式（密钥路径，或由用户确认 agent 已经拥有访问权限）。使用 root 或 sudo 用户。
- **域名** — n8n 将使用的完整主机名，例如 `n8n.example.com`（→ `SUBDOMAIN=n8n`、`DOMAIN_NAME=example.com`）。用户必须能够控制其 DNS。
- **TLS 邮箱** — 用于 Let's Encrypt（`SSL_EMAIL`）。
- **时区** — 用于 Schedule/Cron 节点的 IANA 名称（例如 `Europe/Warsaw`），否则使用 `Etc/UTC`。
- **模式** — 单实例模式或队列模式（规则 0）。队列模式 → 确认主机拥有足够的 RAM（粗略下限约为 4 GB；每个 worker 需要约 1–2 GB）。

## 部署流程

按顺序完成以下步骤。`SINGLE_MODE.md` / `QUEUE_MODE.md` 提供特定于模式的命令详情；`SECURITY.md` 涵盖密钥生成和安全加固；`DAY2.md` 涵盖更新/备份/恢复。

### 1. 预检（成本最低的故障，就是在这里发现的故障）
- 通过 SSH 登录；确认操作系统类似 Debian/Ubuntu（`. /etc/os-release`）。
- **DNS 必须已经指向该服务器。** 比较服务器的公网 IP（`curl -s ifconfig.me`）
  和 `dig +short <fqdn>` 的结果（在服务器上运行，最好也在你的笔记本电脑上运行）。如果两者不匹配，
  **停止**——Caddy 的 ACME 质询将会失败。让用户创建 A 记录，等待其传播，然后再继续。
- 端口 **80 和 443** 必须可以从互联网访问。检查主机防火墙以及所有
  云安全组/网络防火墙（Hetzner Cloud、AWS SG 等）——这些位于
  服务器外部，是一种常见且不易察觉的阻碍因素。

### 2. 安装 Docker（如果尚未安装）
- 检查 `docker --version` 和 `docker compose version`。如果缺失，则安装 Docker Engine +
  Compose 插件（在 Ubuntu/Debian 上使用 Docker 官方的 `get.docker.com` 脚本即可）。
  继续之前，再次检查 `docker compose version`。

### 3. 部署项目文件
- 选择 `DATA_FOLDER`——一个**绝对路径**，例如 `/opt/n8n`。`.env` 中的 `DATA_FOLDER` 值
  **必须与该目录完全一致**（compose 会挂载 `${DATA_FOLDER}/caddy_config/Caddyfile`，
  而 `init-data.sh` 通过相对 `./` 路径挂载），因此始终从
  此处运行 `docker compose`。创建该目录，并在其中创建 `caddy_config/` 和 `local_files/`。
- **将模板文件传到服务器上。** 它们位于*你的*计算机上此 skill 的 `assets/` 中，
  而不在服务器上——请逐个传输。可以使用 `scp` 上传，也可以（无需本地副本）通过 SSH 写入
  每个文件的内容，例如
  `ssh <target> 'cat > <DATA_FOLDER>/docker-compose.yml' < assets/docker-compose.single.yml`。
  使用以下确切名称放置文件：
  - 所选的 compose 文件 → `<DATA_FOLDER>/docker-compose.yml`（将其重命名为这个确切名称）
  - `Caddyfile` → `<DATA_FOLDER>/caddy_config/Caddyfile`
  - **仅队列模式：** `init-data.sh` → `<DATA_FOLDER>/init-data.sh`，然后对其执行 `chmod +x`
  - 匹配的 `.env.*.example` → `<DATA_FOLDER>/.env`

### 4. 填写 `.env` + 生成密钥
- 设置 `DATA_FOLDER`、`DOMAIN_NAME`、`SUBDOMAIN`、`SSL_EMAIL`、`GENERIC_TIMEZONE`。
- 在服务器上使用 `openssl` 生成每个密钥（命令见 `SECURITY.md`），并**将其
  写入 `.env`，替换匹配的 `REPLACE_WITH_…` 占位符**：`N8N_ENCRYPTION_KEY`；
  队列模式还包括 `POSTGRES_PASSWORD` + `POSTGRES_NON_ROOT_PASSWORD`。
- **启动前，确认没有任何值仍未设置：** `grep REPLACE_WITH_ .env` 必须不返回任何内容
  ——遗留的占位符会成为字面密码，导致 Postgres/n8n 无法连接。
- 执行 `chmod 600 .env`。记录加密密钥，以便用户可以将其备份到服务器之外。

### 5. 防火墙
- `ufw`：允许 OpenSSH + 80 + 443，然后启用。**不要**开放 5678/5432/6379。

### 6. 启动
- `cd <DATA_FOLDER> && docker compose up -d`。
- 队列模式会启动 Redis + Postgres + main + workers（workers 通过 `replicas` 配置）。要增加
  容量，请运行：`docker compose up -d --scale n8n-worker=N`。

### 7. 验证（未经验证不要宣告成功）
- `docker compose ps` — 每个服务均为 `Up`/healthy（队列模式：postgres 和 redis 应先达到 `healthy` 状态）。
- **n8n 本身已启动（内部）：** `docker compose exec n8n wget -qO- http://localhost:5678/healthz`
  → `{"status":"ok"}`。这可以区分“n8n 正在运行”和“TLS 尚未就绪”。
- **证书已签发：** `docker compose logs caddy | grep -i 'certificate obtained'`。首次启动时，ACME
  可能需要一两分钟；在完成之前，公共 `https://` 请求会因 TLS 而失败——这意味着
  证书仍在等待签发，**并不**意味着 n8n 已宕机。
- **公网可达性（带重试）：** `curl -fsS --retry 5 --retry-delay 10 https://<fqdn>/healthz`
  → `{"status":"ok"}`。（`/healthz` 只能证明进程可访问；`/healthz/readiness`
  还会确认数据库已连接并完成迁移——调试启动循环时请使用它。）
- 打开 `https://<fqdn>` → 进入**所有者设置**界面。**谁先完成该注册表单，
  谁就会取得此实例的所有权**——将尚无所有者的实例暴露在公网会形成抢占风险，因此应在共享 URL
  之前立即创建所有者账户。启用双重身份验证。 （自动化部署也可以改用环境变量预配置
  所有者——请参阅 `SECURITY.md` 中的所有者条目。）

### 8. 移交
- 向用户提供：URL、项目所在位置、需要安全保存的加密密钥，以及
  **`DAY2.md`** 中的第 2 天基础操作（更新 / 备份 / 恢复）。

## 不要做什么

- **不要跳过 DNS/端口预检。** A 记录错误或云防火墙端口关闭，是
  Caddy 无法获取证书并导致 n8n 看起来“损坏”的首要原因。
- **不要将 5678/5432/6379 发布**到主机。Caddy 通过私有网络访问 n8n。
- **不要复用其他实例的加密密钥或 `.env`。** 每台机器都应使用全新的密钥。
- **不要在 SQLite 上运行队列模式。** 队列模式需要 Postgres（模板已完成相关连接配置）。
- **不要将密钥放入 `docker-compose.yml` 或 Caddyfile。** 只能放在 `.env` 中。
- **不要盲目使用 `:latest`。** 固定 `N8N_IMAGE_TAG`；有计划地进行更新（`DAY2.md`）。

## 参考文件

- **`SINGLE_MODE.md`** — 单实例模式的具体说明、SQLite 与 Postgres 的比较，以及何时应升级到队列模式。
- **`QUEUE_MODE.md`** — 队列架构、工作进程/并发/扩缩容、共享加密密钥、二进制数据（`database` 模式——队列模式不支持文件系统；S3/Azure = 企业版）、webhook 处理器、多主节点许可。
- **`SECURITY.md`** — 生成密钥、加密密钥规则、完整的安全加固检查清单（关闭遥测、阻止环境变量访问、公共 API、防火墙、安全 Cookie）。
- **`DAY2.md`** — 更新镜像、备份（加密密钥 + 卷 + Postgres）以及恢复。
- **`assets/`** — 模板：`docker-compose.single.yml`、`docker-compose.queue.yml`、`Caddyfile`、`.env.single.example`、`.env.queue.example`、`init-data.sh`。

权威的上游参考资料：官方托管文档位于
<https://docs.n8n.io/deploy/host-n8n>（于 2026 年中从旧的 `/hosting/` 路径重构而来——
请优先使用这些 URL）。环境变量参考索引位于
<https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/use-environment-variables>。
当此技能与在线文档存在冲突时，以文档为准，并告知用户。