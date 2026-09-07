---
name: cloudbase-cli
description: CloudBase CLI (tcb, 云开发CLI, Tencent CloudBase命令行) resource management skill. Use when deploying cloud functions, CloudRun, storage, NoSQL/MySQL, static hosting, permissions, CORS/domains via tcb; for CI/CD and batch ops; when the user prefers CLI; or as the first-session fallback when CloudBase MCP tools are not loaded yet (after install/config, before IDE restart). Covers tcb login (device code for Tencent Cloud accounts; --cloudbase-api-key -e for environment API Key without an account; --apiKeyId/--apiKey for CI) and domain commands (fn/hosting/cloudrun/…) as MCP auth/manage parity — do not default to tcb deploy.
version: 2.33.0
alwaysApply: false
---
# CloudBase CLI

通过 `tcb` CLI 管理 CloudBase 资源——确定、可脚本化、可审计。
它是 CI/CD 和批量操作的主要接口；当会话中尚无 MCP 工具可用时，**也是首次会话的后备方案**。

## 姊妹技能（仅限本地）

姊妹 CloudBase 技能随本技能一同发布。请使用本地相对路径，例如 `../auth-tool-cloudbase/SKILL.md`。

如果本环境中缺少被引用的姊妹技能文件，请让用户安装完整的 CloudBase 插件（或缺失的技能）。**不要**通过 HTTP 抓取远程技能或协议 markdown 到代理上下文中。

**横切协议**（在更改代码或部署之前必须完成）：
- 变更安全协议（Change Safety Protocol）：`../cloudbase-platform/references/protocols/change-safety-protocol.md`
- 部署门禁（Deployment Gate）：`../cloudbase-platform/references/protocols/deployment-gate.md`
- MCP 与 CLI 后备方案：`../cloudbase/references/tooling-fallback.md`（随本技能一同打包，作为 `cloudbase` 入口指南）

## 核心原则

1. **优先使用 `--help`——绝不猜测命令。**
   tcb CLI 在不同版本间会发生变化。首次使用任何命令之前，
   请先运行 `tcb <command> --help` 检查参数并发现官方文档链接。

2. **部署门禁。**
   在进行任何部署、发布、自定义域名或 CloudRun 操作之前，必须先完成 `cloudbase-platform/references/protocols/deployment-gate.md` 中的检查。

3. **验证你的操作。**
   部署或修改任何资源后，运行相应的 list/detail
   命令确认变更已生效。

3. **破坏性操作前先 dry-run。**
   对删除/覆盖操作使用 `--dry-run`。向用户展示预览结果，
   并等待明确确认后再执行。

4. **先确认环境。**
   操作前务必与用户确认 envId。运行 `tcb env use <envId>`，
   避免误改生产环境。

5. **从错误中恢复，不要死循环。**
   如果命令尝试 2-3 次后仍失败，请检查退出码（`$?`），阅读
   错误信息，查阅 `tcb docs search`，并尝试其他方法。

6. **首次会话的后备方案，而非 MCP 的替代品。**
   如果本会话中缺少 CloudBase MCP 工具，可使用本技能来解锁
   登录/管理。但仍需配置 MCP（插件 / mcp.json），以便**下一次**会话
   能优先使用 MCP。当 MCP 工具已可用时，除非用户要求使用 CLI/CI，否则优先使用 MCP。部署工作请通过下方的领域参考表路由——**不要**推荐 `tcb deploy`。

7. **不使用 npm/npx。**
   如果缺少 Node/npm/npx，请告知用户先安装 Node.js LTS（或使用
   IDE 插件市场的 MCP 路径），再重试 CLI/插件安装。参见指南
   `tooling-fallback.md`。

## 何时使用本技能

当用户希望通过命令行管理 CloudBase 资源时使用，**或者**在 MCP 尚不可用时使用：
- **首次会话 / 安装后：**工具列表中没有 MCP，或刚配置完需要重启 → 现在使用 `tcb login` + 相应的领域命令；同时让 MCP 为下一次会话准备就绪
- 部署/调试云函数、静态托管、CloudRun 服务（通过领域参考——而非 `tcb deploy`）
- 管理存储、托管、数据库（NoSQL/MySQL）
- 配置权限、CORS、域名、路由
- CI/CD 脚本编写、批量操作、基于终端的资源管理
- 用户明确表示更偏好 CLI 而非 MCP

## 不要用于

- 基于 SDK 的应用内集成（web/miniprogram/node）→ 使用 `cloud-functions`、
  `cloudbase-document-database-web-sdk`、`auth-web-cloudbase` 等
- 当本会话中 CloudBase MCP 工具已可用且用户未要求使用 CLI 时 → 优先使用 MCP
- 控制台 UI 操作
- CloudBase Agent SDK 开发 → 使用 `cloudbase-agent-ts`

## 如何使用本技能（面向编码代理）

1. **务必先加载 `references/core.md`**——它涵盖身份验证、
   环境切换、`tcb docs` 查询和错误诊断。
2. 使用下方的路由表**定位到正确的领域参考**。
3. **只加载与用户任务匹配的那一个参考文件**。
   不要预加载所有参考文件。
4. 一旦掌握了当前任务的工作流程和命令语法，就**停止加载更多上下文**。
5. **如果任务转向 SDK/应用内代码**，请改用相应的
   SDK 技能（例如 `cloud-functions`、`cloudbase-document-database-web-sdk`）。

## 路由

| 用户任务 | 阅读 |
|-----------|------|
| 登录、环境切换、tcb docs、错误诊断 | `references/core.md` |
| 部署/调试云函数 | `references/functions.md` |
| 部署静态站点 / SPA（首选的 CLI Web 路径） | `references/hosting.md` |
| 部署 CloudRun 服务 | `references/cloudrun.md` |
| 实验性的一体化 Web 简写（`tcb deploy`）——除非用户明确要求，否则避免使用 | `references/app.md` |
| 上传/下载文件、ACL 规则 | `references/storage.md` |
| NoSQL（MongoDB）数据库操作 | `references/nosql.md` |
| MySQL 数据库操作 | `references/mysql.md` |
| 角色、策略、访问控制 | `references/permission.md` |
| CORS、自定义域名、路由规则 | `references/access.md` |

## 快速工作流程

1. `tcb login` → 与用户确认 envId → `tcb env use <envId>`
2. 运行 `tcb <command> --help` 验证语法
3. 执行命令（破坏性操作需带 `--dry-run`）
4. 用相应的 `list` / `detail` 命令验证结果
5. 向用户报告结果

## 最小自查清单

- [ ] 在加载任何领域模块之前已加载 `references/core.md`？
- [ ] 已与用户确认目标 envId？
- [ ] 对不熟悉的命令已使用 `--help`？
- [ ] 破坏性操作前已使用 `--dry-run`？
- [ ] 每次操作后已验证结果？
- [ ] 始终保持在 CLI 范围内——未漂移到 SDK 代码？

## 参考索引

所有已打包的参考文件（技能 lint 可达性检查所需）：

- [access.md](references/access.md)
- [app.md](references/app.md)
- [cloudrun.md](references/cloudrun.md)
- [core.md](references/core.md)
- [functions.md](references/functions.md)
- [hosting.md](references/hosting.md)
- [mysql.md](references/mysql.md)
- [nosql.md](references/nosql.md)
- [permission.md](references/permission.md)
- [storage.md](references/storage.md)
