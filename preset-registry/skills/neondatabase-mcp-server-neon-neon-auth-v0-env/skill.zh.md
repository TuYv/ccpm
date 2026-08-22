---
name: neon-auth-v0-env
description: >-
  Provisions Neon Auth on a Neon branch, adds the user’s v0 sandbox URL to the
  Better Auth trusted-origins list, then prints shell exports for
  NEON_AUTH_BASE_URL and a 63-bit AUTH_SECRET. Use when wiring v0 (Vercel)
  sandboxes to Neon Auth, configuring trusted origins, or setting local env
  vars for Better Auth against Neon.
disable-model-invocation: true
---
# Neon Auth + v0 沙盒环境变量导出

如果此仓库的服务器提供 **Neon MCP** 工具（`provision_neon_auth`、`configure_neon_auth`、`get_neon_auth_config`），请使用这些工具。否则，请通过 Neon API / Console 执行相同操作。

## 首先收集输入信息

- `PROJECT_ID` — Neon 项目 ID。
- `BRANCH_ID` — 可选；省略时使用默认分支。
- `V0_TRUSTED_ORIGIN` — 要信任的 v0 沙盒 URL。Better Auth 将可信来源列表同时用于 CSRF 防护（验证请求的 `Origin`/`Referer` 标头）以及作为回调/重定向 URL 的允许列表，身份验证服务器会在登录、OAuth 提供商、电子邮件验证、密码重置和魔法链接流程中将用户重定向到这些 URL（`callbackURL`、`redirectTo`、`errorCallbackURL`、`newUserCallbackURL`）。常见格式如下（请替换为用户实际的预览 URL）：

  - 完整来源：`https://<preview-host>.vercel.app`
  - 完整回调 URL：`https://<preview-host>.vercel.app/api/auth/callback`
  - 通配符模式（涵盖该项目的所有 v0 预览）：`https://*.vercel.app`

  上游支持通配符（`*`、`?`、`**`）和自定义方案（`myapp://`、`exp://...`）——传入与用户预览主机名模式匹配的最宽泛条目，通常可以避免因预览 URL 变化而重复更新。

## 工作流程

1. **预配 Neon Auth**（如果已经预配，此操作是幂等的）：

   - 工具：`provision_neon_auth`
   - 参数：`{ "projectId": "<PROJECT_ID>", "branchId": "<BRANCH_ID optional>" }`
   - 从结果文本中记下 **`base_url`**（该分支兼容 Better Auth 的服务 URL）。

2. **将 v0 沙盒 URL 添加到 Neon Auth 的可信来源中**：

   - 工具：`configure_neon_auth`
   - 参数：
     ```json
     {
       "operation": "add_trusted_origin",
       "projectId": "<PROJECT_ID>",
       "branchId": "<BRANCH_ID optional>",
       "trusted_origin": "<V0_TRUSTED_ORIGIN>"
     }
     ```
   - 如果该值已受信任，工具可能会报告成功且不返回错误；将其视为正常情况。

3. **读取 `base_url` / `jwks_url`（可选，但建议执行）**：

   - 工具：**`get_neon_auth_config`**
   - 参数：`{ "projectId": "<PROJECT_ID>", "branchId": "<BRANCH_ID optional>" }`
   - JSON 包含顶层的 **`base_url`**、**`jwks_url`**、**`db_name`**、**`branch_name`**，以及一个 **`integration`** 对象，其中包含来自 API 的完整 Neon Auth 集成有效负载。

   如果 Neon Auth 已完成预配，而你只需要 URL，则可以跳过第 1 步：仅使用 **`get_neon_auth_config`** 即可读取 **`base_url`** 和 **`jwks_url`**。

4. **输出 shell 导出语句**，供用户粘贴到终端或 `.env.local` 中：

   - **`NEON_AUTH_BASE_URL`** — 设置为 Neon Auth 的 **`base_url`**（除非应用要求，否则不要包含尾部斜杠）。
   - **`AUTH_SECRET`**（或其框架要求的名称，例如 `BETTER_AUTH_SECRET`）— 一个采用 URL 安全格式、由加密安全随机方式生成的 **63 位**密钥。

   **生成一个 63 位密钥（恰好具有 63 位熵）：**

   ```bash
   node -e "const c=require('crypto');const b=c.randomBytes(8);b[0]&=0x7f;process.stdout.write(b.toString('base64url'))"
   ```

**输出 export 命令**（如果值中包含 `'`，请针对 shell 进行转义）：

   ```bash
   export NEON_AUTH_BASE_URL='https://…'   # from Neon Auth base_url
   export AUTH_SECRET='<output of node one-liner above>'
   ```

   提醒用户：**绝不要提交**真实的 `AUTH_SECRET` 值；对于 v0 部署，请使用平台密钥（Vercel 环境变量等）。

## 检查清单

- [ ] `provision_neon_auth` 已成功执行（或已完成配置）。
- [ ] `add_trusted_origin` 使用的值与浏览器实际访问的 URL 匹配（可以是源、完整的回调 URL，或类似 `https://*.vercel.app` 的通配符模式）。
- [ ] `NEON_AUTH_BASE_URL` 与该分支在 Neon 中的 **`base_url`** 匹配。
- [ ] `AUTH_SECRET` 已使用上面的 63 位 `node -e` 代码片段生成。

## 说明

- 为本地开发**允许 localhost** 是一项独立设置；仅在需要时使用 `configure_neon_auth`，并将 `operation: "set_allow_localhost"` 传给它。
- v0 预览主机名会随部署而变化。可以预先信任通配符模式（例如 `https://*.vercel.app`）；或者，当新的预览部署完成时，通过 `configure_neon_auth` 使用 `add_trusted_origin` **添加**新值（并可选择使用 `remove_trusted_origin` 移除旧值）。