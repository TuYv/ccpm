---
name: version-check
description: Recommend which Claude Code version to run, or whether to update. Use when asked which Claude Code version is best/safe, whether to update now, whether a recent release is buggy, or what changed since the installed version.
---
# Claude Code 版本检查

目标是给出一个建议：留在当前版本、更新，还是固定到某个特定版本。Claude Code 发布 `latest` 非常频繁（通常每天 1-2 次），所以『最佳版本』是一个移动的靶子，答案通常是一个*区间*，而不是某一个具体构建。

## 启发式规则（先读这部分）

- **`stable` 落后于 `latest`，而且它不是 LTS。** npm 的 `stable` dist-tag 只是一个落后 `latest` 若干个补丁版本的指针。它甚至可能*落后于*某个重要的修复版本，所以“稳定”并不等于“修复了最多 bug”。不要盲目推荐 `@stable`。
- **安静的版本 = 好兆头。** 如果没有人抱怨最近的某个版本，那就是一个积极信号。要避免的是针对某个特定构建的大量集中吐槽。
- **版本对比是最强的信号。** 人们对比不同构建的帖子（“X 弄坏了 Y，所以回滚到了 Z”）能直接告诉你该避开哪个版本。
- **比最前沿晚大约一天。** 避免使用只发布了几小时的版本——先让别人把当天的回归问题暴露出来。
- **但当追踪器很安静、而当天的版本又修复了你在踩的问题时，用它也没问题。** 如果几个小时过去了没有出现成堆的问题，而且更新日志显示它修复了你已安装版本范围内确实存在的回归，那么装上它通常比等待更好。把你在做的取舍说清楚：用几个小时的实战时间换取一天。
- **真正的杠杆在于*何时*更新，而不是 stable 与 latest 之争。** Claude Code 默认会持续自动更新到 `latest`，这正是你会漂移到当天回归版本上的原因。

## 1. 已安装的版本 vs 已发布的版本

```bash
claude --version
npm view @anthropic-ai/claude-code dist-tags --json
```

`dist-tags` 会显示 `latest`、`stable` 和 `next`。与已安装的版本对比，就能看出每个指针领先或落后多少。

近期版本及其发布时间（用于判断发布节奏）：

```bash
npm view @anthropic-ai/claude-code time --json | python3 -c "import sys,json;d=json.load(sys.stdin);print('\n'.join(f'{k}: {v}' for k,v in list(d.items())[-8:]))"
```

## 2. 扫描版本差距内的更新日志，查找回归

获取更新日志，阅读已安装版本与 `latest` *之间*的条目。留意“修复了 X 中的……回归”这样的行——如果某个近期构建引入了尚未修复的回归，那就是要避开的版本。

```bash
curl -sL https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md | awk '/## <LATEST>/,/## <INSTALLED>/'
```

（把两个版本号替换进去。）在一个人声鼎沸的版本之后、内容以“Fixed …”为主的版本，通常是一个安全的落脚点。

## 3. 社区情绪（很有价值——要做这一步，别跳过）

### GitHub issues（首要来源——可靠且可抓取）

最可靠的信号。搜索近期处于打开状态的 bug 报告，按反应数排序：

```bash
gh api -X GET search/issues \
  -f q="repo:anthropics/claude-code is:issue is:open created:>=<DATE> label:bug" \
  -f sort=reactions -f per_page=25 \
  --jq '.items[] | "\(.created_at[:10]) +\(.reactions.total_count) c\(.comments) #\(.number) \(.title)"'
```

（把 `<DATE>` 设为今天往前约 3 天。）一次版本回归表现为某个版本发布后立刻涌现的*一批*高反应数 issue。反应数为 0-1 的零散报告是噪声，不是信号——追踪器里总会有源源不断的这类报告。

把这些标题与更新日志中的版本差距交叉对照：如果排名靠前的 issue 已经被 `latest` 中的修复或开关解决了，那个构建反而*更安全*，而不是更危险。大多是些小问题或服务端问题（API 500/529）= 安静的版本 = 好兆头。

要评估一个只发布了几个小时的版本，去掉 `label:bug` 和 `is:open`，并把日期设为今天——你想看到的是它发布以来的所有报告，此时还没人做过分诊或打标签。

还要确认这些 issue 到底是不是关于 CLI 的。关于 Claude Desktop 或 VS Code 扩展的问题扎堆，并不能说明某个 Claude Code CLI 构建是否安全。

### Reddit（次要来源——可通过 DuckDuckGo 跳板访问）

r/ClaudeAI 的版本对比帖子很有价值，但**Reddit 现在硬性封锁了所有直接的自动化访问路径**——curl（宿主机 + 容器）、WebSearch 爬虫（被 user-agent 拒绝），以及冷启动的 Playwright 导航（网络安全验证页）。可靠的进入方式是 `reddit-fetch` 技能的 **DuckDuckGo 跳板解锁**：先用 Playwright 导航一次到 `html.duckduckgo.com/html/?q=site:reddit.com/r/ClaudeAI+...` 的结果跳转，借此设置会话 cookie，之后直接的 `.json` 导航就能用了：

```
https://www.reddit.com/r/ClaudeAI/search.json?q=claude+code+update+broke+OR+regression&restrict_sr=on&sort=new&t=week&limit=25
```

套用前面的启发式规则：一条积极或平静的近期更新讨论帖令人安心；一条高赞的“X 坏掉了”帖则点名了该跳过的构建。

## 4. 用实测验证说法，而不是争论

当问题是“我真的需要这个版本才能用上 X 吗”——通常 X 是个新模型——直接跑一下就行。新模型在服务端，所以在旧客户端上通常也能用；旧客户端*搞错*的是围绕它的元数据。

```bash
claude -p "Reply with exactly: ok" --model <model-id> --output-format json 2>&1 \
  | python3 -c "import sys,json;u=json.load(sys.stdin)['modelUsage'];print(json.dumps({m:{'contextWindow':v['contextWindow'],'costUSD':v['costUSD']} for m,v in u.items()},indent=2))"
```

`modelUsage` 是诚实的答案：它指明了实际服务该轮对话的模型（忽略 Haiku 那一行，那是后台辅助进程），并报告客户端正在套用的 `contextWindow`。如果新模型能在旧客户端上响应，但显示的窗口是 200000，而更新日志承诺的是 1000000，那么说明模型本身是好的，是*客户端*在限制它——这是一个具体的、可验证的更新理由，而不是一个含糊的理由。

更新之后重新跑一遍同样的命令，确认数字变了。

## 5. 给出建议

- 如果已安装版本处于近期口碑良好的区间内，且版本差距内没有发生回归：**留在原地**，不要去追一个只发布了几个小时的版本。
- 如果某个构建存在已知回归，推荐上一个良好版本，并固定到该版本或回滚到它。
- 对于吃过亏的人：**禁用自动更新器，改为有意识地手动更新**（本仓库的 setup 脚本就是这么做的），而不是虔诚地追踪 `@stable`。

### 安装特定版本——先检查它是怎么装的

`npm install -g @anthropic-ai/claude-code@X.Y.Z` 并**不是**通用的。在原生安装下它会以 `EEXIST: file already exists /Users/<you>/.local/bin/claude` 失败，因为那个路径是指向 `~/.local/share/claude/versions/` 的符号链接，npm 不会去覆盖它。不要用 `--force` 硬闯——那会把原生启动器替换成一个 npm shim。

```bash
ls -la "$(command -v claude)"   # symlink into ~/.local/share/claude/versions/ = native install
```

- **原生安装** → `claude install X.Y.Z`（回滚也是同一条命令）
- **npm 安装** → `npm install -g @anthropic-ai/claude-code@X.Y.Z`

无论哪种方式，之后都用 `claude --version` 确认一下——包管理器报告成功，并不等于启动器已经指向了新的构建。
