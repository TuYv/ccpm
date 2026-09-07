---
name: dev
description: >
  Local development guide for the Happy monorepo. How to build, install,
  test, and run the CLI, server, mobile app, and desktop (Tauri) locally.
  Use when the user types /dev, asks how to "build", "start dev", "install
  locally", or "run the ___ package".
---
# /dev - 本地开发

Happy 是一个 pnpm monorepo。所有操作都使用 pnpm workspaces —— 不要直接使用 `npm` 或 `yarn`。

## 首次设置

```bash
pnpm install                       # installs deps for every package
pnpm --filter happy cli:install    # builds happy-cli + links it as the global `happy` binary
```

`cli:install` 会把你 PATH 上的 `happy`（无论是否通过 npm 安装）替换为指向 `packages/happy-cli/` 的符号链接。守护进程会作为脚本的一部分被重启。它使用 `~/.happy/` —— 与生产环境相同。

撤销方法：`npm unlink -g happy && npm i -g happy@latest`。

## 软件包

    packages/happy-cli     # the `happy` CLI and daemon, published to npm
    packages/happy-server  # Node + Prisma server, deployed via TeamCity
    packages/happy-app     # Expo app: iOS, Android, web, Tauri desktop
    packages/happy-agent   # agent runtime
    packages/happy-wire    # shared Zod schemas + wire types

## happy-cli

    packages/happy-cli
    scripts in package.json:
      typecheck      # tsc --noEmit
      build          # rm -rf dist && tsc --noEmit && pkgroll
      test           # build + vitest run
      cli:install    # build + stop daemon + npm link + start daemon
      prepublishOnly # pnpm test (runs build inside test)
      postinstall    # unpacks difft + rg binaries into tools/unpacked/

工作循环：

```bash
pnpm --filter happy cli:install   # rebuild + relink + restart daemon
happy daemon status               # confirm your build is running
happy doctor                      # list all happy processes
tail -f ~/.happy/logs/$(ls -t ~/.happy/logs/ | head -1)
```

快速运行单个测试文件：

```bash
pnpm --filter happy exec vitest run src/path/to/file.test.ts
```

仅运行单元测试（快，约 1 分钟）：

```bash
pnpm --filter happy exec vitest run --project unit
```

集成测试会调用真实 API 且容易不稳定 —— 按需运行，绝不纳入发布门禁。

### 开发数据沙盒（可选）

`happy` 会读取 `HAPPY_HOME_DIR` 来覆盖 `~/.happy/`。要在不触碰生产环境认证信息的情况下并行运行两个版本：

```bash
HAPPY_HOME_DIR=~/.happy-dev happy daemon start
HAPPY_HOME_DIR=~/.happy-dev happy auth
```

指向本地服务器的方式相同：

```bash
HAPPY_SERVER_URL=http://localhost:3005 happy daemon start
```

## happy-server

```bash
pnpm --filter happy-server standalone:dev   # localhost:3005, embedded PGlite, no Docker
```

源码变更时应用会自动重载。通过 `HAPPY_SERVER_URL=http://localhost:3005` / `EXPO_PUBLIC_HAPPY_SERVER_URL=...` 让 CLI 或 Expo 应用指向它。

## happy-app (Expo)

```bash
pnpm --filter happy-app start           # expo start (Metro bundler)
pnpm --filter happy-app ios:dev         # iOS simulator, development variant
pnpm --filter happy-app android:dev
pnpm --filter happy-app web             # web build, served locally
pnpm --filter happy-app tauri:dev       # macOS desktop app
```

变体：

    development    com.slopus.happy.dev       # hot reload, internal
    preview        com.slopus.happy.preview   # OTA / beta testing
    production     com.ex3ndr.happy           # App Store

### 重新构建并重新安装桌面版 .app

当用户要求“重新构建桌面应用”、“关掉正在运行的那个并重新安装”，或任何类似意思的表述时 —— 按顺序完整执行全部四个步骤，不要在构建完成后就停下。

变体 → 产品名称 → 构建脚本：

    production    Happy.app           pnpm --filter happy-app tauri:build:production
    preview       Happy (preview).app pnpm --filter happy-app tauri:build:preview
    dev           Happy (dev).app     pnpm --filter happy-app tauri:build:dev

所有变体的构建输出：

    packages/happy-app/src-tauri/target/release/bundle/macos/<ProductName>.app

如果变体不明确，可用 `ps aux | grep "/Applications/.*Happy" | grep -v grep` 查看正在运行的是哪一个并进行匹配。默认为 production。

步骤（将 `$NAME` 替换为产品名称，例如 `Happy` 或 `Happy (dev)`）：

```bash
# 1. build (slow: ~3–10 min, expo web export then cargo release build)
pnpm --filter happy-app tauri:build:production

# 2. quit the running app gracefully (no-op if not running)
osascript -e 'tell application "$NAME" to quit' || true

# 3. replace the installed bundle
rm -rf "/Applications/$NAME.app"
cp -R "packages/happy-app/src-tauri/target/release/bundle/macos/$NAME.app" /Applications/

# 4. relaunch
open -a "$NAME"
```

注意：
- 在后台运行构建（在 Bash 上设置 `run_in_background: true`）并轮询输出文件。它在接近尾声时会打印 `Finished \`release\` profile`。
- `osascript ... to quit` 是优雅退出 —— 它给应用一个刷新状态的机会。只有当退出操作卡住时，才回退到 `pkill -f "/Applications/$NAME.app/Contents/MacOS/app"`。
- 不要跳过 `cp` 之前的 `rm -rf` —— 对已有的 `.app` 直接执行 `cp -R` 会合并目录并留下过期文件。
- 如果重新启动时 macOS Gatekeeper 报错，执行 `xattr -dr com.apple.quarantine "/Applications/$NAME.app"` 即可清除。本地构建的产物未签名。

## happy-app-logs（远程日志接收器）

```bash
pnpm --filter happy-app-logs dev       # starts on http://0.0.0.0:8787
```

接收移动应用经补丁修改的 console（参见 `consoleLogging.ts`）发往 `/logs` 的 POST 请求。
日志写入 stdout 和 `~/.happy/app-logs/<timestamp>.log`。

连接方法：在应用的开发设置中，将日志服务器 URL 设置为 `http://<LAN_IP>:8787`。
配置后，应用的 `consoleLogging.ts` 会将所有 console.log/warn/error 发送到该端点。

必须在应用中启用控制台输出（dev/preview 变体默认开启，production 默认关闭，
可在开发设置界面中切换）。

## 横切关注点

- **提升的依赖：** pnpm 会将 node_modules 提升到仓库根目录。`packages/*/node_modules/` 基本为空。Node 的模块解析会逐级向上查找，因此导入可以透明地正常工作。
- **工作区依赖：** `"@slopus/happy-wire": "workspace:*"` 解析到 `packages/happy-wire/` —— 对它的修改会即时生效。
- **`$npm_execpath`：** 属于遗留逻辑；happy-cli 直接字面使用 `pnpm`。Windows 的 cmd.exe 不会展开 `$VAR`。
- **先构建再测试：** 测试会启动构建好的 CLI 二进制文件（用于守护进程集成），因此 `pnpm test` 会先运行 `build`。不要移除。

## 发布

不要手动发布。使用 `/release` —— 它会处理 npm 发布、git 标签、GitHub releases 以及冒烟检查。

## 故障排查

    happy: command not found     → pnpm --filter happy cli:install
    daemon won't start           → happy daemon stop; rm ~/.happy/daemon.state.json.lock; happy daemon start
    wrong `happy` version        → which happy && ls -la $(which happy) — confirms where it resolves to
    tools/unpacked missing       → pnpm install (postinstall re-extracts)
    stale deps after branch swap → pnpm install (pnpm is picky about lockfile drift)

## 规则

- 绝不使用 `npm install` 或 `yarn install` —— 只能使用 pnpm。
- 绝不要向 happy-cli 重新添加基于 tsx 的 `dev` / `cli` 脚本。构建步骤不是可选项 —— 守护进程会启动构建好的二进制文件，跳过构建会导致不同步。
- 绝不重新引入 `release-it`。发布一律通过 `/release` 进行。
- 绝不把 `~/.happy-dev` 引入为默认值。它只作为通过 `HAPPY_HOME_DIR` 显式启用的选项存在，仅此而已。
