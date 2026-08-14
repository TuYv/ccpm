---
name: verify
description: Build, launch, and drive the mindwalk web UI end-to-end for verification.
---
# 验证 mindwalk

## 构建与启动

```sh
npm --prefix web run build                  # tsc -b && vite build → web/dist
go build -o bin/mindwalk ./cmd/mindwalk
bin/mindwalk serve --no-open --dev --port <PORT> # --dev serves web/dist from the working tree
```

注意事项：

- 自动化验证期间始终传入 `--no-open`，以免反复启动服务器时创建新标签页或抢走用户当前工作的焦点。
- 端口 8765 是 vite-proxy 的约定端口，通常已被开发服务器占用；请选择其他端口，并检查日志中是否出现 `bind: address already in use`。
- 会话来自 `~/.claude/projects`、`~/.codex/sessions` 和
  `~/.pi/agent/sessions`——这台机器上有真实数据，无需固件。
  `testdata/claude-session.jsonl` 可通过 `mindwalk open` 使用。
- `bin/mindwalk map <repo>`（或 `/?map=1&repo=<path>` URL）可提供不含会话的静态城市地图。

## 驱动（无头 Chrome + CDP，无需安装 npm 包）

可以通过 Node 内置的 WebSocket 使用系统 Chrome + 原始 CDP。WebGL 在真实 GPU 上使用普通的 `--headless=new` 即可渲染（Metal，约 120fps）；仅当 GPU 初始化失败时添加
`--use-angle=swiftshader --enable-unsafe-swiftshader`
（软件渲染速度约慢 3 倍）：

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --remote-debugging-port=9333 --user-data-dir=<tmp> \
  --window-size=1440,900 --no-first-run about:blank &
```

新标签页端点需要使用 PUT：`fetch('http://127.0.0.1:9333/json/new?<url>', {method:'PUT'})`。

## 值得驱动验证的流程

- 通过 `/?session=<key>` 深层链接加载（旧版的纯会话 ID 仅在其唯一时才能解析）；断言 `.session-row.active .session-title`。
- 加载后，读数 `.deck-pos-count` 显示 `N / N`（播放头从末尾开始）。
- `[aria-label="Restart playback"]` → `1 / N`；`[aria-label="Play playback"]`
  → 在 1× 速度下约每秒 3 个刻度（`.speed-btn` / `S` 键循环切换倍速）；
  播放时会绘制余烬轨迹和萤火虫。
- 场景视图位于停靠栏的场景分区中：顶部条带图标（树木/
  山峰形状会反映当前视图）会打开一个紧凑弹出框，其中包含 `Tree` /
  `Terrain` 单选行以及编码图例；按 `V` 可直接循环切换视图。
  切换时会重建场景——注意是否出现 `Runtime.exceptionThrown`。
  该弹出框可与已打开的面板共存（切换时报告会保持打开）。
- `/?map=1&repo=<abs-path>` 会渲染不含轨迹和传输控件的城市地图
  （仅地图模式）；轨道顶部的文件夹图标（`[aria-label="Open a repository
  map"]`）会打开弹出框——首先是当前会话仓库的主卡片（名称 +
  路径），然后是一个“或打开任意仓库”的路径输入框——并通过
  `window.open` 打开地图，因此在无头驱动中应直接访问该 URL，而不是点击。
- 右侧边缘的停靠条是一个面板注册表，分为两个分区（场景 /
  会话，以细线分隔）：View（弹出框）、`Crosshair` = Inspect（面板；文件
  详情，未选择任何内容时显示教学式空状态）、`Sparkles` =
  Evaluate（面板；评审报告，状态点会反映 running/done/stale/failed）。
  点击报告中的发现项会将播放头跳转到其证据序列号并选中文件；
  轨道行通过 `.rail-eval` 徽章反映评估状态。
- `[aria-label="Export video"]` 在客户端录制播放过程（MediaRecorder →
  webm 下载）：标签会切换为 `Recording video`，录制期间传输控件、轨道和
  视图切换会被锁定，之后播放头会恢复原位。
  使用 `Browser.setDownloadBehavior` 在 CDP 中捕获下载。
- 快速切换会话（点击未缓存的行，150ms 后点击已缓存的行）后，最终必须
  显示最后一次点击的会话数据。
- 无效的 `?session=` 必须回退到最新会话，并输出 console.warn。