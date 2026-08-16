---
name: supabase
description: "Use when doing ANY task involving Supabase. Triggers: Supabase products (Database, Auth, Edge Functions, Realtime, Storage, Vectors, Cron, Queues); client libraries and SSR integrations (supabase-js, @supabase/ssr) in Next.js, React, SvelteKit, Astro, Remix; auth issues (login, logout, sessions, JWT, cookies, getSession, getUser, getClaims, RLS); Supabase CLI or MCP server; schema changes, migrations, declarative schemas, security audits, Postgres extensions (pg_graphql, pg_cron, pg_vector)."
metadata:
  author: supabase
  version: "0.1.2"
---
# Supabase

## 核心原则

**1. Supabase 经常发生变化——实施前请对照更新日志和当前文档进行验证。**
不要依赖训练数据来判断 Supabase 的功能。函数签名、config.toml 设置和 API 约定会随版本发生变化。

首先，获取 `https://supabase.com/changelog.md`（这是一个轻量级摘要索引，不会产生大量数据拉取），扫描与任务相关的 `breaking-change` 标签，并查看所有适用标签所链接的页面。然后，使用下述文档访问方法查找相关主题。

**2. 验证你的工作。**
实施任何修复后，都要运行测试查询以确认更改有效。未经验证的修复是不完整的。

**3. 从错误中恢复，不要循环重试。**
如果某种方法尝试 2-3 次后仍然失败，请停下来重新考虑。尝试其他方法、查阅文档、更仔细地检查错误，并在日志可用时查看相关日志。Supabase 问题并不总能通过反复重试同一命令来解决，答案也不一定总在日志里，但在继续操作前通常值得检查日志。

**4. 向 Data API 公开表：** 根据用户的 [Data API 设置](https://supabase.com/dashboard/project/<ref>/integrations/data_api/settings)，新创建的表可能不会自动通过 Data（REST）API 公开。如果属于这种情况，则需要显式授予 `anon` 和 `authenticated` 角色访问权限。

> 请注意，这与 RLS 是两回事。RLS 控制的是表可访问后哪些_行_可见，而不是表本身是否可访问。

当用户报告通过 SQL 创建的表意外无法访问时，请检查其 Data API 设置，以及是否已通过显式的 `GRANT` SQL 授予相关角色访问权限。在授予公共（`anon`/`authenticated`）访问权限时，始终也要启用 RLS。有关完整的设置工作流，请参阅[向 Data API 公开表](https://supabase.com/docs/guides/api/securing-your-api.md)。

**5. 已公开 schema 中的 RLS。**
在任何已公开 schema 的每张表上启用 RLS，默认情况下这包括 `public`。这一点在 Supabase 中至关重要，因为当 `anon`/`authenticated` 角色拥有访问权限时，已公开 schema 中的表可以通过 Data API 访问（请参阅[向 Data API 公开表](https://supabase.com/docs/guides/api/securing-your-api.md)）。对于私有 schema，建议使用 RLS 作为纵深防御。启用 RLS 后，应创建符合实际访问模型的策略，而不是默认为每张表使用相同的 `auth.uid()` 模式。

**6. 安全检查清单。**
在处理任何涉及身份验证、RLS、视图、存储或用户数据的 Supabase 任务时，请逐项检查此清单。这些是 Supabase 特有的安全陷阱，可能在不易察觉的情况下造成漏洞：

- **身份验证和会话安全**
  - **切勿在基于 JWT 的授权决策中使用 `user_metadata` 声明。** 在 Supabase 中，`raw_user_meta_data` 可由用户编辑，并且可能出现在 `auth.jwt()` 中，因此将其用于 RLS 策略或任何其他授权逻辑都是不安全的。请改为将授权数据存储在 `raw_app_meta_data` / `app_metadata` 中。
  - **删除用户不会使现有访问令牌失效。** 应先登出或撤销会话；对于敏感应用，应缩短 JWT 的有效期；如果需要严格保证，请在敏感操作中根据 `auth.sessions` 验证 `session_id`。
  - **如果使用 `app_metadata` 或 `auth.jwt()` 进行授权，请记住，在用户的令牌刷新之前，JWT 声明不一定是最新的。**

- **API 密钥和客户端暴露**
  - **绝不要在公共客户端中暴露 `service_role` 或密钥。** 前端代码应优先使用可发布密钥。旧版 `anon` 密钥仅用于兼容。在 Next.js 中，任何 `NEXT_PUBLIC_` 环境变量都会发送到浏览器。

- **RLS、视图和特权数据库代码**
  - **视图默认绕过 RLS。** 在 Postgres 15 及更高版本中，使用 `CREATE VIEW ... WITH (security_invoker = true)`。在较旧版本的 Postgres 中，应通过撤销 `anon` 和 `authenticated` 角色的访问权限，或将视图放入未暴露的 schema 中来保护视图。
  - **UPDATE 需要 SELECT 策略。** 在 Postgres RLS 中，UPDATE 需要先 SELECT 对应的行。如果没有 SELECT 策略，更新操作会静默返回 0 行——不会报错，只是不会发生任何更改。
  - **`auth.role()` 已弃用——请改用 `TO` 子句。** Supabase 已弃用 `auth.role()`，建议通过 `TO authenticated` 或 `TO anon` 直接在策略中指定目标角色。除了被弃用之外，启用匿名登录后，`auth.role() = 'authenticated'` 还会静默失效，因为匿名用户同样具有 Postgres 的 `authenticated` 角色，无论用户是否真正登录都能通过检查。
    ```sql
    -- Deprecated (do not use)
    create policy "example" on table_name for select
    using ( auth.role() = 'authenticated' );
    ```
  - **仅使用 `TO authenticated` 只是身份认证，并未进行授权（BOLA / IDOR）。** 使用 `TO authenticated` 只会检查角色——它不会限制用户可以访问哪些行。正确的模式是将 `TO authenticated` 与 `USING` 中的所有权谓词结合使用：
    ```sql
    create policy "example" on table_name for select
    to authenticated
    using ( (select auth.uid()) = user_id );
    ```
  - **UPDATE 策略同时需要 `USING` 和 `WITH CHECK`。** 如果没有 `WITH CHECK`，用户可以将某一行的 `user_id` 重新分配给其他用户：
    ```sql
    create policy "example" on table_name for update
    to authenticated
    using ( (select auth.uid()) = user_id )
    with check ( (select auth.uid()) = user_id );
    ```
  - **`SECURITY DEFINER` 函数会绕过 RLS。** `SECURITY DEFINER` 函数会以其创建者的权限运行——通常是具有 `bypassrls` 权限的角色（例如 `postgres`）。绝不要为了消除权限错误而添加 `SECURITY DEFINER`；这样做会在不修复根本原因的情况下静默移除访问控制。应优先使用 `SECURITY INVOKER`。
  - **`public` 中的 `SECURITY DEFINER` 函数可由所有角色调用。** Postgres 默认会为每个新函数向 `PUBLIC` 授予 `EXECUTE` 权限，因此，`public` 中的任何 `SECURITY DEFINER` 函数都是可由 `anon` 和 `authenticated`（它们继承自 `PUBLIC`）调用的公共 API 端点，无需任何额外授权。当确实需要 `SECURITY DEFINER` 时（例如绕过内部查找表上的 RLS），应将函数放在未暴露的 schema 中，始终在函数体中包含 `auth.uid()` 检查，并在更改后运行 `supabase db advisors`。

- **存储访问控制**
  - **存储 upsert 需要 INSERT + SELECT + UPDATE。** 仅授予 INSERT 权限可以上传新文件，但文件替换（upsert）会静默失败。你需要同时授予这三项权限。

- **依赖项与供应链安全**
  - 安装 Supabase 软件包（`supabase-js`、`@supabase/ssr`、`supabase-py` 等）时，**始终固定软件包版本并提交锁文件**。完整检查清单请参阅 [npm 安全指南](https://supabase.com/docs/guides/security/npm-security.md)。

对于上述未涵盖的任何安全问题，请获取 Supabase 产品安全索引：`https://supabase.com/docs/guides/security/product-security.md`

## Supabase CLI

始终通过 `--help` 查找命令——切勿猜测。CLI 结构会随版本而变化。

```bash
supabase --help                    # All top-level commands
supabase <group> --help            # Subcommands (e.g., supabase db --help)
supabase <group> <command> --help  # Flags for a specific command
```

**Supabase CLI 已知注意事项：**

- `supabase db query` 需要 **CLI v2.79.0+** → 使用 MCP `execute_sql` 或 `psql` 作为备用方案
- `supabase db advisors` 需要 **CLI v2.81.3+** → 使用 MCP `get_advisors` 作为备用方案
- 在命令式迁移项目中，应先使用 `supabase migration new <name>` 创建新的手工编写迁移文件。切勿自行编造迁移文件名，也不要凭记忆确定预期格式。声明式 schema 项目从 `supabase/schemas/` 生成迁移；请参阅下文的“进行并提交 Schema 更改”。

**版本检查与升级：**运行 `supabase --version` 进行检查。有关 CLI 变更日志和特定版本功能，请查阅 [CLI 文档](https://supabase.com/docs/reference/cli/introduction)或 [GitHub 发布页面](https://github.com/supabase/cli/releases)。

## Supabase MCP 服务器

有关设置说明、服务器 URL 和配置，请参阅 [MCP 设置指南](https://supabase.com/docs/guides/getting-started/mcp)。

**连接问题排查**——请按顺序执行以下步骤：

1. **检查服务器是否可访问：**
   `curl -so /dev/null -w "%{http_code}" https://mcp.supabase.com/mcp`
   返回 `401` 属于预期情况（无 token），表示服务器正在运行。超时或“connection refused”表示服务器可能已宕机。

2. **检查 `.mcp.json` 配置：**
   验证项目根目录中是否存在有效的 `.mcp.json`，且其中包含正确的服务器 URL。如果缺失，请创建一个指向 `https://mcp.supabase.com/mcp` 的配置文件。

3. **对 MCP 服务器进行身份验证：**
   如果服务器可访问且 `.mcp.json` 正确，但工具仍不可见，则用户需要进行身份验证。Supabase MCP 服务器使用 OAuth 2.1——请告知用户在其代理中触发身份验证流程，在浏览器中完成验证，然后重新加载会话。

## Supabase 文档

在实现任何 Supabase 功能之前，请先查找相关文档。按以下优先顺序使用这些方法：

1. **MCP `search_docs` 工具**（首选——直接返回相关片段）
2. **以 markdown 格式获取文档页面**——在任意文档页面的 URL 路径末尾附加 `.md` 即可获取。
3. 当你不知道应该查看哪个页面时，**通过 Web 搜索**查找 Supabase 相关主题。

## 进行并提交 Schema 更改

首先确定项目使用哪种 Schema 工作流。

### 选项 A：声明式 Schema

当 `supabase/schemas/` 存在或 `config.toml` 设置了 `schema_paths` 时，使用此方式。在这些文件中编辑所需的 Schema 状态，然后生成并审查迁移。不要从手动编写迁移开始。请参阅[声明式数据库 Schema 指南](https://supabase.com/docs/guides/local-development/declarative-database-schemas)。

### 选项 B：命令式迁移

当项目不使用声明式 Schema 时，使用此方式。

**若要进行 Schema 更改，请使用 `execute_sql`（MCP）或 `supabase db query`（CLI）。** 它们会直接在数据库上运行 SQL，而不会创建迁移历史记录，因此你可以自由迭代，并在准备就绪后生成整洁的迁移。

不要使用 `apply_migration` 更改本地数据库 Schema——它会在每次调用时写入一条迁移历史记录，这意味着你无法进行迭代，并且 `supabase db diff` / `supabase db pull` 会生成空的或相互冲突的差异。如果使用它，你将只能接受第一次尝试时传入的 SQL，无法再做调整。

**准备好将更改提交**到迁移文件时：

1. **运行顾问检查** → `supabase db advisors`（CLI v2.81.3+）或 MCP `get_advisors`。修复所有问题。
2. **审查上面的安全检查清单**（如果更改涉及视图、函数、触发器或存储）。
3. **生成迁移** → `supabase db pull <descriptive-name> --local --yes`
4. **验证** → `supabase migration list --local`

## 参考指南

- **Skill 反馈** → [references/skill-feedback.md](references/skill-feedback.md)
  **必须阅读的情况**：用户报告此 Skill 提供了错误指导或缺少信息。