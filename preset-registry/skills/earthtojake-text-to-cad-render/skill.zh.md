---
name: render
description: Start or reuse the CAD Explorer viewer, return review links, and create saved snapshots for explicit CAD and robot-description files. Use when rendering or visually reviewing `.step`, `.stp`, `.glb`, `.stl`, `.3mf`, `.dxf`, `.urdf`, `.srdf`, or `.sdf` files, especially when handed off from CAD, URDF, SRDF, or SDF generation skills.
---
# 渲染

使用此技能可在 CAD Explorer 中打开已生成或修改过的 CAD 和机器人描述文件。预期输入是一个或多个明确的文件路径，这些文件已存在或刚刚由其他技能生成。

支持的文件：`.step`、`.stp`、`.glb`、`.stl`、`.3mf`、`.dxf`、`.urdf`、`.srdf`、`.sdf`。

## 交接约定

- 接受来自 CAD、URDF、SRDF、SDF、SendCutSend 或标准零件工作流的明确文件路径。
- 使用 `dev:ensure` 启动或复用 CAD Explorer；不要假定固定端口。将 `dev:ensure` 视为所返回链接的查看器存活状态检查。
- 必须复用端口：如果 `dev:ensure` 报告本地绑定/探测被拒绝，例如 `EPERM` 或 `EACCES`，请使用所需的本地绑定权限/提权重新运行同一个 `dev:ensure` 命令，而不要自行选择新端口。
- 在正常的智能体交接中，不要使用 `npm run dev -- --port ...`、原始的 `vite dev` 或原始的 `vite preview`；这些方式会绕过复用策略，并可能导致多个重复的本地主机 Explorer 服务器持续运行。
- 为每个请求的文件返回打印出的 Explorer URL。
- 对于生成结果审查或视觉反馈，优先使用快照 CLI，而不是手动打开查看器或使用 Playwright。仍需返回查看器链接，以便交接和实时审查。
- 仅为 CAD STEP 模块的参数动画审查生成 GIF。其他情况下使用静态快照，而不是 GIF。
- 如果启动失败，请报告失败情况，并让所属技能继续执行其非 GUI 验证。

## 命令

在此技能目录中：

```bash
npm --prefix scripts/viewer run dev:ensure -- --file path/to/model.step
```

对于已保存的无头快照，请使用技能级快照包装器。它会委托给查看器包中的 `scripts/viewer/snapshot` 实现：

```bash
python3 scripts/snapshot --job path/to/render-job.json
python3 scripts/snapshot --job -
```

仅对于常用主题快照，可以使用快捷参数：

```bash
python3 scripts/snapshot \
  --input path/to/model.step \
  --output /tmp/model.png \
  --mode view \
  --theme technical \
  --camera iso \
  --view-labels
```

对于静态图或参数动画 GIF，可以使用 `--params` 提供 STEP 模块的伴随参数：

```bash
python3 scripts/snapshot \
  --input path/to/model.step \
  --output /tmp/model.png \
  --params '{"drive":180,"ringVisible":false}'

python3 scripts/snapshot \
  --input path/to/model.step \
  --output /tmp/model.gif \
  --params '{"values":{"ringVisible":true},"animate":{"drive":{"from":0,"to":1260}},"durationSeconds":6,"fps":18,"loop":true}'
```

快照 CLI 默认使用 `--theme technical`，这是一种扁平、高对比度的主题，旨在用于视觉诊断而非展示。`--theme` 接受内置主题名称、内联 JSON 主题对象或 JSON 主题文件的路径；将 `theme.display.mode` 设置为 `solid` 或 `wireframe`，可分别输出表面或线框视图。`--params` 针对的是 Explorer `.step.js` STEP 模块的伴随参数，而不是 Python/build123d 重新生成参数。如果省略宽度/高度，快照 CLI 会根据请求上下文选择默认尺寸：诊断用静态图为 1600x1200，简单的无标签零件为 1200x900，剖面图/带标签视图/带尺寸视图至少为 1600x1200，复杂装配体通过 `render.sizeProfile` 使用 1800x1200 或 1920x1440，展示用渲染图通过 `render.sizeProfile` 使用 2400x1600 或 2800x1800，STEP 模块参数 GIF 为 960x640，联系表宽度至少为 2400 px。除非透明快照能够解答具体的重叠、碰撞或内部关系问题，否则应将其用于展示目的。对于自定义主题设置、选择项、剖面、环绕设置、机器人关节值、STEP 模块参数、DXF 厚度/折弯选项以及多输出快照，请使用 JSON 作业。支持的渲染模式为 `view`、`orbit`、`section` 和 `list`。支持的输入为 `.step`、`.stp`、`.glb`、`.stl`、`.3mf`、`.dxf`、`.urdf`、`.srdf` 和 `.sdf`。

当工作区根目录已知时，请显式传入：

```bash
npm --prefix scripts/viewer run dev:ensure -- \
  --workspace-root /path/to/workspace \
  --file path/to/model.step
```

仅在手动开发 Explorer 时使用前台 Vite：

```bash
npm --prefix scripts/viewer run dev
```

`dev:ensure` 会首先探测并检查其完整端口范围内已注册的本地 CAD Explorer 服务器，尽可能复用扫描根目录匹配的服务器，然后才会在第一个可用端口上启动一个分离运行的 Vite 服务器。请使用它输出的 URL。

## MoveIt2 控件

对于 SRDF Explorer 审查，仅当用户需要交互式 IK 或路径规划控件时才启动 MoveIt2 服务器。SRDF 生成和普通 Explorer 链接不需要该服务器。

在此 Skill 目录中运行：

```bash
scripts/moveit2_server/setup.sh
scripts/moveit2_server/check-moveit2-server.sh
scripts/moveit2_server/run-moveit2-server.sh
```

服务器默认为 `ws://127.0.0.1:8765/ws`。在本地开发环境中，除非设置了 `EXPLORER_MOVEIT2_WS_URL` 或浏览器的 `?moveit2Ws=` 查询参数覆盖值，否则 CAD Explorer 会连接到该 URL。

有关协议和报告的详细信息，请阅读 `references/moveit2-server.md`。

常用的 Explorer 环境变量：

```text
EXPLORER_PORT
EXPLORER_PORT_END
EXPLORER_ROOT_DIR
EXPLORER_DEFAULT_FILE
EXPLORER_WORKSPACE_ROOT
EXPLORER_GITHUB_URL
EXPLORER_MOVEIT2_WS_URL
EXPLORER_ALLOWED_HOSTS
EXPLORER_SERVER_REGISTRY
```

通过 remotehost/Tailscale Serve 暴露 CAD Explorer 时，请在启动或重启 `dev:ensure` 前，将 `EXPLORER_ALLOWED_HOSTS` 设置为 Serve 主机名：

```bash
EXPLORER_ALLOWED_HOSTS=macbook-pro-108.tail3c8ded.ts.net \
  npm --prefix scripts/viewer run dev:ensure -- \
    --workspace-root /path/to/workspace \
    --root-dir models \
    --file path/to/model.urdf
```

在返回远程链接之前，请先在本地验证 Host 标头路径：

```bash
curl -I -H 'Host: macbook-pro-108.tail3c8ded.ts.net' \
  'http://127.0.0.1:PORT/?file=path/to/model.urdf'
```

预期响应为 `200 OK`。

如果远程手机通过 Vite 开发服务器加载了页面外壳，但显示空白或黑屏，请先尝试生产预览，再进行更深入的渲染修改。使用相同的扫描根目录和默认文件执行构建，使用相同的 `EXPLORER_ALLOWED_HOSTS` 主机名启动 `vite preview`，验证 Host 标头路径，然后将 remotehost/Tailscale Serve 重新指向预览端口：

```bash
EXPLORER_WORKSPACE_ROOT=/path/to/workspace \
EXPLORER_ROOT_DIR=models \
EXPLORER_DEFAULT_FILE=robots/elrobot/elrobot-follower.urdf \
  npm --prefix scripts/viewer run build

cd scripts/viewer
EXPLORER_WORKSPACE_ROOT=/path/to/workspace \
EXPLORER_ROOT_DIR=models \
EXPLORER_DEFAULT_FILE=robots/elrobot/elrobot-follower.urdf \
EXPLORER_ALLOWED_HOSTS=macbook-pro-108.tail3c8ded.ts.net \
EXPLORER_PORT=4202 \
  npm exec vite preview -- --host 127.0.0.1 --port 4202 --strictPort
```

这样可以从手机访问路径中移除 Vite 的开发客户端和 HMR WebSocket，同时保留相同的 `?file=` URL。

GUI 操作应保持轻量：仅在需要链接或审查时启动服务器；对于智能体工作流，优先使用 `dev:ensure`；除非用户提出要求，否则不要停止现有的 Explorer 服务器。