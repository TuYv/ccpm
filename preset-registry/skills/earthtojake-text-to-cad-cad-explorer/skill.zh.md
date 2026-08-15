---
name: cad-explorer
description: Start or reuse the CAD Explorer GUI and return review links for explicit CAD and robot-description files. Use when rendering or visually reviewing `.step`, `.stp`, `.stl`, `.3mf`, `.dxf`, `.urdf`, `.srdf`, or `.sdf` files, especially when handed off from CAD, URDF, SRDF, or SDF generation skills.
---
# CAD Explorer

使用此技能可在 CAD Explorer 中打开已生成或修改的 CAD 和机器人描述文件。预期输入为一个或多个明确的文件路径，这些文件应已存在，或刚刚由其他技能生成。

支持的文件：`.step`、`.stp`、`.stl`、`.3mf`、`.dxf`、`.urdf`、`.srdf`、`.sdf`。

## 交接约定

- 接受来自 CAD、URDF、SRDF 或 SDF 工作流的明确文件路径。
- 使用 `dev:ensure` 启动或复用 CAD Explorer；不要假定端口固定。
- 为每个请求的文件返回打印出的 Explorer URL。
- 如果启动失败，请报告失败情况，并让负责该工作流的技能继续执行其非 GUI 验证。

## 命令

在此技能目录中：

```bash
npm --prefix scripts/explorer run dev:ensure -- --file path/to/model.step
```

如果工作区根目录已知，请显式传递：

```bash
npm --prefix scripts/explorer run dev:ensure -- \
  --workspace-root /path/to/workspace \
  --file path/to/model.step
```

仅在手动开发 Explorer 时使用前台 Vite：

```bash
npm --prefix scripts/explorer run dev
```

`dev:ensure` 会探测现有的本地 CAD Explorer 服务器，复用扫描根目录匹配的服务器，或在首个可用端口上启动一个分离式 Vite 服务器。请使用其打印出的 URL。

## MoveIt2 控件

对于 SRDF Explorer 审查，仅当用户需要交互式 IK 或路径规划控件时才启动 MoveIt2 服务器。SRDF 生成和普通的 Explorer 链接不需要该服务器。

在此技能目录中：

```bash
scripts/moveit2_server/setup.sh
scripts/moveit2_server/check-moveit2-server.sh
scripts/moveit2_server/run-moveit2-server.sh
```

服务器默认使用 `ws://127.0.0.1:8765/ws`。在本地开发环境中，除非设置了 `EXPLORER_MOVEIT2_WS_URL` 或浏览器的 `?moveit2Ws=` 查询参数覆盖值，否则 CAD Explorer 会连接到该 URL。

有关协议和报告的详细信息，请阅读 `references/moveit2-server.md`。

实用的 Explorer 环境变量：

```text
EXPLORER_PORT
EXPLORER_PORT_END
EXPLORER_ROOT_DIR
EXPLORER_DEFAULT_FILE
EXPLORER_WORKSPACE_ROOT
EXPLORER_GITHUB_URL
EXPLORER_MOVEIT2_WS_URL
```

保持 GUI 工作轻量化：仅在需要链接或审查时启动服务器；在代理工作流中优先使用 `dev:ensure`；除非用户提出要求，否则不要停止现有的 Explorer 服务器。