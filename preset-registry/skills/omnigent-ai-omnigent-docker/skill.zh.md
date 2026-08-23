---
name: deploy-docker-compose
description: Run the Omnigent server as a Docker compose stack (server + Postgres) on any Docker host — your laptop, a VPS, EC2 by hand, or as the base layer of any container-platform deploy. Invoke when the user wants to build the image, bring up the compose stack, debug the stack on a host they already have, or extend the stack for a new platform.
---
# 以 Docker Compose 堆栈方式运行 Omnigent

这里的 `Dockerfile` 是所有非 Databricks 部署路径共用的单一镜像。它将 FastAPI 服务器和预构建的 Web SPA 打包到精简的 Python 运行时中。Compose 文件将其与 Postgres 配套运行，并通过 8000 端口暴露服务器。

该镜像“仅支持外部运行器”——它不包含 `tmux`、执行框架 SDK，也不包含任何可供其在进程内执行智能体代码的组件。运行器位于用户机器上，并通过 WebSocket 隧道接入。这使镜像保持较小体积（约 250 MB）、安全边界清晰（服务器不执行用户代码），并确保不同主机上的部署形态一致。

同一个 Dockerfile 还包含一个 `host` 目标——即远程沙箱启动时使用的预构建 Omnigent HOST 镜像（`omnigent-host`）（`omnigent sandbox create --provider modal`、由服务器启动的托管主机）。它采用相反的配置：完整安装 omnigent，并包含 git 和 tmux，但不包含 SPA、psycopg，也没有服务器入口点。两个镜像均由相同的工作流发布，并采用相同的 `:sha-<short>` / `:latest` / `:vX.Y.Z` 标签方案。请参阅此处 `README.md` 中的“Host image”部分。

## TL;DR — 启动服务

```bash
cd deploy/docker
cp .env.example .env             # edit POSTGRES_PASSWORD at minimum
docker compose up -d --build
docker compose logs -f omnigent   # Ctrl-C when you see "Uvicorn running"
```

服务器位于 http://localhost:8000。

## 文件

| | |
|---|---|
| `Dockerfile` | 包含两个最终目标的多阶段构建。`web-builder`（node:20）在 `web/` 上运行 `npm install && npm run build`。`builder`（python:3.12）将 omnigent 安装到 `/opt/venv`；`server-builder` 在 `web-builder` 的基础上叠加 SPA 构建产物，并添加 psycopg。默认目标（`runtime`）从 `server-builder` 复制 venv 和 `/build/`，然后运行 `entrypoint.py`。使用 `--target host` 则改为构建主机镜像（基于 `builder`：omnigent + git/tmux，不包含 SPA/psycopg/entrypoint）。 |
| `Dockerfile.dockerignore` | 支持 BuildKit 的排除文件。排除 `deploy/databricks/`、`deploy/aws/`、测试和开发工具，从而减小构建上下文。 |
| `entrypoint.py` | 服务器进程入口点。读取 `DATABASE_URL`、运行 Alembic 迁移、构建 SQLAlchemy 存储、调用 `create_app()`，然后运行 uvicorn。它是容器所支持环境变量的唯一事实来源。 |
| `docker-compose.yaml` | 包含两个服务：`postgres`（16-alpine，使用持久化卷）和 `omnigent`（由 Dockerfile 构建，依赖 postgres 健康检查）。构建上下文为 `../..`（仓库根目录）。 |
| `.env.example` | 记录 Compose 文件传递的所有环境变量：`POSTGRES_PASSWORD`、`OMNIGENT_PORT`、所有 `OMNIGENT_AUTH_*` 和 `OMNIGENT_OIDC_*` 变量。 |
| `README.md` | 面向客户的快速入门指南和 OIDC 操作说明（GitHub OAuth、Google Workspace、通用 OIDC）。 |

## 迭代开发镜像

```bash
# Force a clean rebuild after a Dockerfile or source change
docker compose build --no-cache omnigent

# Reset everything (drops the DB + artifact volumes)
docker compose down -v
docker compose up -d --build
```

`POSTGRES_PASSWORD` 仅在数据卷首次初始化时生效。
如果在 `.env` 中更改了它，则需要先运行 `docker compose down -v`，再运行
`up -d`，否则服务器将无法通过现有集群的身份验证。

## 常见问题调试

| 症状 | 可能的原因 | 首先检查 |
|---|---|---|
| 根 URL 返回 `{"service":"omnigent",…}` 而不是 SPA | npm 构建未能在容器内生成 bundle | `docker compose exec omnigent ls /build/omnigent/server/static/web-ui/` — 为空表示 `web-builder` 阶段未正常运行。使用 `--no-cache` 重新构建。 |
| 启动时出现 `ModuleNotFoundError: No module named 'uvicorn'` | 复制 venv 时未包含已安装的内容 | 检查 Dockerfile 中是否在调用 `uv pip install` 之前设置了 `VIRTUAL_ENV=/opt/venv`。 |
| `psycopg.OperationalError: password authentication failed` | 数据卷初始化后更改了 `.env` 中的 `POSTGRES_PASSWORD` | 运行 `docker compose down -v`，然后运行 `up -d`（这会清空数据库）。 |
| Web UI 可以加载，但新聊天一直卡住 | 这是预期行为——runner 位于外部。UI 的落地页会显示用于启动 runner 的 CLI 命令。 |

## 扩展到新平台

Cloud Run、Fly.io、Render、k8s、HF Spaces——它们都使用同一个
镜像。平台特定的部分是清单（`fly.toml`、
`service.yaml`、Helm chart、Spaces config）以及由平台管理的
TLS / DB 连接配置。将其放在 `docker/` 旁边的
`deploy/<platform>/` 下，并提供其自己的 README + SKILL。

## 相关技能与文档

- [`deploy/README.md`](../README.md) — 部署选项菜单。
- `designs/OIDC_AUTH.md` — 完整的原生 OIDC 设计。