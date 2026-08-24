---
name: openweb
description: "Typed JSON access to 90+ real websites — Google, Amazon, Reddit, YouTube, GitHub, Instagram, Bloomberg, Zillow, and more — across search, shopping, travel, finance, social, news, and dev tools. Use to read, search, post, comment, message, or otherwise interact with these sites (prices, products, articles, stock quotes, flights, posts, comments, DMs, etc.). Run `openweb sites` for the full list."
license: MIT
compatibility: "Requires the `openweb` CLI (npm: @openweb-org/openweb). Some sites need a managed Chrome session. See references/cli.md for runtime details."
metadata:
  version: "0.1.5"
  openclaw:
    links:
      homepage: "https://getopenweb.com"
      repository: "https://github.com/openweb-org/openweb"
    requires:
      bins: [openweb]
      env: [OPENWEB_HOME]
      config: ["$OPENWEB_HOME/config.json"]
    install:
      - kind: node
        package: "@openweb-org/openweb"
        bins: [openweb]
---
# OpenWeb

通过 API 访问任何网站的 Agent 原生方式。连接 Agent CLI 与 Web GUI。

## 加载规范

- 不要读取此文件夹中的每个文件。
- 从 SKILL.md 开始。一次只遵循一条路径。

## 使用现有站点

### 1. 查找站点

```bash
openweb sites                        # list all available sites
```

如果站点没有软件包，请**不要**说“不支持”。转到 add-site/guide.md。

### 2. 检查就绪状态

```bash
openweb <site>                       # transport, auth, operations list
```

- `Requires browser: yes` — 需要时会自动启动浏览器；无需手动设置
- `Requires login: yes` — 用户必须已通过其浏览器会话登录

### 3. 阅读站点说明

如果工作区中存在站点文档，请优先使用：

- **源代码仓库：**先阅读 `src/sites/<site>/SKILL.md` 以了解工作流和意图映射，然后阅读 `src/sites/<site>/DOC.md` 以了解内部机制。
- **已发布/运行时软件包：**仅保证包含 `DOC.md`、规范、清单、示例和适配器。每个站点的 `SKILL.md` 和 `PROGRESS.md` 是源代码树文档，不会发布到 `$OPENWEB_HOME/sites/<site>/` 中。

如果只有已发布的软件包可用，请依赖 `openweb <site>`、`openweb <site> <op>`、示例和 `DOC.md`。

### 4. 检查操作

```bash
openweb <site> <op>                  # params, response shape, permission tier
openweb <site> <op> --example        # real example params from fixtures
```

执行前，请检查操作的权限级别：

| 级别 | 默认设置 | 行为 |
|---|---|---|
| `read` | 允许 | 类 GET 操作——可直接执行 |
| `write` | 提示 | 创建/更新——执行前询问用户 |
| `delete` | 提示 | 破坏性操作——执行前询问用户 |
| `transact` | 拒绝 | 金融/不可逆操作——始终跳过 |

### 5. 执行

```bash
openweb <site> <op> '{"key":"value"}'    # stdout=JSON, stderr=JSON error
```

自动溢出：超过 4096 字节的响应会写入临时文件。

`openweb <site> exec <op> '{...}'` 与其等效——当第三个参数为 JSON 时，可以省略 `exec`。

### 6. 失败时

stderr 中的错误包含 `failureClass`：

| failureClass | 操作 |
|---|---|
| `needs_browser` | 浏览器会自动启动；如果启动失败，请检查 Chrome 安装。备用方案：`openweb browser start` |
| `needs_login` | 执行 `openweb login <site>`，然后执行 `openweb browser restart` |
| `needs_page` | 打开一个访问该站点 URL 的标签页 |
| `bot_blocked` | 执行 `openweb browser restart --no-headless`，由用户在可见浏览器中完成 CAPTCHA，然后重试。对于持续出现此问题的站点，请在配置中设置 `"browser": {"headless": false}` |
| `permission_denied` | 更新 `$OPENWEB_HOME/config.json` 中的 `permissions` |
| `permission_required` | 请求用户确认，然后重试 |
| `retriable` | 等待几秒后重试（最多 2 次） |
| `fatal` | 不要重试——修正参数或检查站点名称 |

如果上表无法解决问题，请阅读 references/troubleshooting.md。

### 7. 缺少站点或功能覆盖

站点不存在或缺少所需操作？请阅读 add-site/guide.md。

## 添加 / 扩展 / 升级站点

阅读 add-site/guide.md

## 修复问题

阅读 references/troubleshooting.md

## 文件映射

所有路径均相对于 `skills/openweb/`。

### add-site/（工作流——按顺序加载）

| 文件 | 加载时机 |
|---|---|
| `add-site/guide.md` | 添加/扩展工作流的入口点 |
| `add-site/probe.md` | 探查步骤：通过 CDP 在浏览器端进行发现 |
| `add-site/capture.md` | 捕获步骤：记录浏览器流量 |
| `add-site/review.md` | 审查步骤：读取 analysis-summary.json |
| `add-site/curate-operations.md` | 整理：命名、噪声、参数、权限 |
| `add-site/curate-runtime.md` | 整理：身份验证、传输、提取 |
| `add-site/curate-schemas.md` | 整理：响应模式、示例、PII |
| `add-site/verify.md` | 验证：运行时 + 规范 + 文档循环 |
| `add-site/document.md` | 文档化：各站点的 SKILL.md + DOC.md + PROGRESS.md，以及知识更新 |

### references/（参考资料——独立加载）

| 文件 | 加载时机 |
|---|---|
| `references/cli.md` | CLI 命令语法、标志、stdout/stderr |
| `references/x-openweb.md` | 完整的 x-openweb 字段模式 |
| `references/troubleshooting.md` | 出现故障时——分类、诊断、修复 |

### knowledge/（模式——在决策点加载）

| 文件 | 加载时机 |
|---|---|
| `knowledge/archetypes.md` | 按站点类别划分的预期操作 |
| `knowledge/auth-routing.md` | 身份验证类型未知时——从信号到类型族的查找 |
| `knowledge/auth-primitives.md` | 配置身份验证时——配置及注意事项 |
| `knowledge/bot-detection.md` | 传输/捕获决策 |
| `knowledge/extraction.md` | 提取信号——SSR/DOM 模式 |
| `knowledge/graphql.md` | GraphQL——持久化查询、批处理 |
| `knowledge/ws.md` | WebSocket——消息/连接模式 |
| `knowledge/adapter-recipes.md` | 适配器模式、代码模板、陷阱 |
| `knowledge/transport-upgrade.md` | 传输层级决策、Node 可行性、API 发现 |