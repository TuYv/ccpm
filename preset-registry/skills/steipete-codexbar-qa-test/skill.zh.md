---
name: qa-test
description: "CodexBar live QA/e2e testing: run provider usage matrix checks, validate real app config, use Peekaboo for menu proof, use Browser Use/official docs for API spec or logged-in dashboard checks, and handle 1Password credentials safely."
---
# CodexBar 实机 QA

用于实机 provider 测试、发布冒烟测试、菜单验证，或调试“provider 可用/不可用”的报告。

## 规则

- 在 CodexBar 仓库的 checkout 目录中工作。
- 优先使用打包的 CLI：`CodexBar.app/Contents/Helpers/CodexBarCLI`。
- 不要使用 `CodexBar.app/Contents/MacOS/codexbar`；那是应用主程序，作为 CLI 运行时可能表现为挂起。
- 绝不运行宽泛的 `env`、`set` 输出或机密正则转储。
- 使用 `$one-password` 处理机密：所有 `op` 命令在同一个持久 tmux 会话中执行，优先使用服务账户，不输出原始机密。
- 将浏览器 cookie/钥匙串流程视为有提示风险。除非用户明确要求实机 UI，优先使用 CLI/API-token 检查以及 `KeychainNoUIQuery` 安全的测试。
- 查询当前 API 行为时，只浏览 provider 官方文档。

## CLI 矩阵

运行随附脚本：

```bash
.agents/skills/qa-test/scripts/live_provider_matrix.sh --enabled
```

常用模式：

```bash
.agents/skills/qa-test/scripts/live_provider_matrix.sh --provider all
.agents/skills/qa-test/scripts/live_provider_matrix.sh --providers openai,zai,deepseek
.agents/skills/qa-test/scripts/live_provider_matrix.sh --default
```

结果解读：

- `--enabled` 通过 `CodexBarCLI config providers` 查询已启用的 provider，并遵循 `CODEXBAR_CONFIG` 和默认开关状态。
- `--default` 运行面向应用的默认命令，不覆盖 provider。
- `--provider all` 强制运行每个已注册的 provider，对于没有会话/密钥的 provider，预期会失败。
- 应用配置要达到绿色状态，需要 `--enabled` 和 `--default` 干净通过；`--provider all` 是一个发现/分诊工具。

## 配置 QA

校验配置：

```bash
CodexBar.app/Contents/Helpers/CodexBarCLI config validate
stat -f '%Lp %N' "$HOME/.codexbar/config.json"
```

脱敏后查看配置结构：

```bash
jq '(.providers // []) |= map(.apiKey = (if .apiKey then "<redacted>" else .apiKey end) |
  .secretKey = (if .secretKey then "<redacted>" else .secretKey end) |
  .cookieHeader = (if .cookieHeader then "<redacted>" else .cookieHeader end) |
  (if .id == "stepfun" and has("region") then .region = "<redacted>" else . end) |
  .tokenAccounts = (if .tokenAccounts then (.tokenAccounts | .accounts = (.accounts | map(.token = "<redacted>"))) else .tokenAccounts end))' \
  "$HOME/.codexbar/config.json"
```

编辑配置前先做备份：

```bash
cp "$HOME/.codexbar/config.json" "$HOME/.codexbar/config.pre-qa-$(date +%Y%m%d%H%M%S).json"
chmod 600 "$HOME/.codexbar"/config.pre-qa-*.json
```

## 实机菜单 QA

在 CLI 检查之后使用 Peekaboo：

```bash
pkill -x CodexBar || pkill -f 'CodexBar.app/Contents/MacOS/CodexBar' || true
open -n "$PWD/CodexBar.app"
peekaboo menu list-all --json | rg -i 'codexbar'
peekaboo menu click-extra --title codexbar-merged --json
screencapture -x /tmp/codexbar-live-menu.png
```

如有需要，裁剪右上角菜单区域：

```bash
sips --cropToHeightWidth 900 340 --cropOffset 20 2650 /tmp/codexbar-live-menu.png \
  --out /tmp/codexbar-live-menu-crop.png >/dev/null
```

使用 `view_image` 进行目视确认。确认 provider 标签页/行与已启用的配置一致，并且没有处于失败状态的 provider 占满首屏。

## 浏览器使用

仅当已登录的控制台、API 密钥页面或 provider 文档需要浏览器/配置文件状态时，才使用 `$browser-use`。

现有的 Chrome 路径：

```bash
mcporter call chrome-devtools.list_pages --args '{}' --output text
mcporter call chrome-devtools.navigate_page --args '{"url":"https://provider.example"}' --output text
mcporter call chrome-devtools.take_snapshot --args '{}' --output text
```

如果浏览器使用功能不可用，请如实说明，并使用网络搜索查找公开的官方文档；不要用隔离的 Playwright 代替处理依赖登录/配置文件的页面。

## 修复分诊

- 缺少认证/会话：如有可用的密钥/会话则进行配置；否则保持该 provider 禁用，或报告认证受阻。
- provider API/规格有误：查阅官方文档，然后修补 fetcher/设置/测试。
- provider 密钥存在但被实机 API 拒绝：如有用处则保留已存储的密钥；如果菜单会显示持续错误，则禁用该 provider。
- 面向用户的行为变更需要更新 `CHANGELOG.md`。
- 代码修复在合入前需要针对性测试、`make check`、`$autoreview` 以及实机 CLI 验证。

## 已知的 CodexBar QA 注意事项

- OpenAI Admin API 密钥才是可用的 usage provider 密钥。项目级 `OPENAI_API_KEY` 的值可能使旧版信用余额回退以 403 失败。
- Deepgram 的用量查询需要具备 Management API 权限的密钥/项目；仅限转写的密钥可能返回 403。
- Groq 的用量查询使用 Prometheus 指标 API，而不是普通的推理端点。
- MiniMax 按量付费的 API 密钥与 Token Plan/Coding Plan 密钥不同；密钥类型用错会导致用量数据不可用。
