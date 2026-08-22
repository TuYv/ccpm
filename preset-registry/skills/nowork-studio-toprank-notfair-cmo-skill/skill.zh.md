---
name: cmo
argument-hint: "<or just run '/notfair:cmo'>"
description: >
  Launch the local NotFair CMO portal (a browser UI for specialist marketing agents)
  on this machine and open it in the browser. Use when the user asks to "open notfair-cmo",
  "launch the CMO", "open the marketing portal", "start the local CMO", or any phrasing
  that implies they want the local web UI for NotFair's marketing agents instead of the
  Claude Code CLI flow. The portal source lives at `notfair-cmo/` in this repo and is
  published to npm as `notfair-cmo`.
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---
# /notfair:cmo

在用户的浏览器中打开本地 NotFair CMO 门户。

该门户是一个运行在 `http://127.0.0.1:3327` 上的 Node 应用（`notfair-cmo`），用户可以通过它与专业营销智能体（CMO、Google Ads、SEO）聊天、安排周期性工作，并实时查看内联显示的工具调用。源代码：[`notfair-cmo/`](../notfair-cmo/)。通过 `npx notfair-cmo@latest` 分发。

此技能**不负责实现门户**——它只负责启动门户。如果需要更改门户行为，请编辑 `notfair-cmo/`，并通过其自身的 npm 版本发布流程进行发布。

---

## 默认端口

除非用户另有指定（`--port`），否则使用 `3327`。如果 3327 已被占用，门户 CLI 会自动探测接下来的 5 个端口。（开发服务器使用 `3326`；已发布的门户使用 `3327`。）

---

## 第 0 步：检查 NotFair 更新

在执行**任何其他操作之前**运行此命令——该技能自身的步骤（端口、标志）随插件一起发布，因此过期的插件会执行过期的指令。

```bash
_UPD_BIN=$(ls ~/.claude/plugins/cache/nowork-studio/notfair/*/bin/notfair-update-check 2>/dev/null | head -1)
[ -n "$_UPD_BIN" ] && _UPD=$("$_UPD_BIN" 2>/dev/null || true) || _UPD=""
[ -n "$_UPD" ] && echo "$_UPD" || true
```

如果输出包含 `UPGRADE_AVAILABLE <old> <new>`：立即按照 `/notfair:upgrade` 技能中的内联升级流程（从第 1 步开始）执行自动升级。升级完成后，**从新的插件缓存中重新读取此 `/notfair:cmo` 技能，并从第 1 步重新开始**（无需再次运行升级检查）——更新后的技能可能会使用不同的默认端口。

如果输出包含 `JUST_UPGRADED <old> <new>`：简要说明“NotFair 已从 v{old} 升级到 v{new}”，然后继续执行第 1 步。

如果两者均未出现：不作提示，继续执行第 1 步。

---

## 第 1 步：探测——是否已在运行？

```bash
PORT=3327
if curl -fsS --max-time 1 -o /dev/null "http://127.0.0.1:$PORT/" 2>/dev/null; then
  echo "RUNNING"
else
  echo "NOT_RUNNING"
fi
```

- 如果为 `RUNNING` → 跳至**第 4 步（打开浏览器）**。
- 如果为 `NOT_RUNNING` → 继续执行第 2 步。

---

## 第 2 步：预检——运行 `notfair-cmo doctor`

该门户提供了一个 `doctor` 命令，用于检查 Node ≥ 20、`openclaw` 是否位于 PATH 中、OpenClaw 网关是否可访问、是否已配置 LLM 提供商、数据目录是否可写，以及端口是否空闲。检查失败时，它会以非零状态退出，并输出包含 `Fix:` 的行。

```bash
npx -y notfair-cmo@latest doctor 2>&1
```

- 退出状态为 0 → 继续执行第 3 步。
- 退出状态非零 → **停止**。逐字显示 doctor 的输出（其中包含 `Fix:` 指令）。不要尝试启动。

如果缺少 `npx` 本身（未安装 Node），请显示：*“需要 Node 20+。请从 https://nodejs.org 安装，或通过 `nvm install 20` 安装，然后重新运行 `/notfair:cmo`。”*

---

## 第 3 步：启动门户（分离模式）

让它在后台运行，以便技能交还控制权。门户会通过其 `open` 依赖自行打开浏览器，但我们仍会在第 4 步再次尝试打开，以防它已经在无界面模式下运行。

```bash
LOG=$(mktemp -t notfair-cmo.XXXXXX.log)
nohup npx -y notfair-cmo@latest start --no-open > "$LOG" 2>&1 &
echo "Launched notfair-cmo (PID $!), log: $LOG"
```

等待端口响应（最多 30 秒）：

```bash
for i in $(seq 1 30); do
  if curl -fsS --max-time 1 -o /dev/null "http://127.0.0.1:$PORT/" 2>/dev/null; then
    echo "READY"
    break
  fi
  sleep 1
done
```

如果 30 秒后端口仍未响应，显示 `$LOG` 的最后 40 行并停止。

---

## 步骤 4：打开浏览器

```bash
URL="http://127.0.0.1:$PORT/"
if command -v open >/dev/null 2>&1; then
  open "$URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL"
elif command -v wslview >/dev/null 2>&1; then
  wslview "$URL"
else
  echo "Could not auto-open a browser. Visit: $URL"
fi
echo "NotFair CMO is open at $URL"
```

---

## 参数

如果用户传入端口（`/notfair:cmo --port 4001` 或直接使用 `/notfair:cmo 4001`），请用它替换上面的 `PORT`，并将 `--port <n>` 传递给 `notfair-cmo start`。

---

## 此技能*不会*执行的操作

- 它不会配置 LLM 提供商——该配置由 OpenClaw 的 `agents.defaults.model` 负责。如果缺少配置，doctor 会显示相应的错误。
- 它不会安装 OpenClaw。如果 `openclaw` 不在 PATH 中，doctor 的 `Fix:` 行会给出安装命令。
- 它不会创建项目或运行代理——用户需要在浏览器 UI 中执行这些操作。

如果用户想查看项目源代码或未解决的问题，请引导他们查看此仓库中的 `notfair-cmo/`。