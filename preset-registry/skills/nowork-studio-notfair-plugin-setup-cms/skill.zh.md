---
name: setup-cms
argument-hint: "<CMS name: wordpress, strapi, contentful, or ghost>"
description: >
  Connect a CMS to notfair SEO tools. Guides users through configuring
  WordPress, Strapi, Contentful, or Ghost — tests the connection, and writes
  credentials to .env.local. Once set up, seo-analysis automatically cross-
  references CMS content against Google Search Console data. Use whenever the
  user says "connect my CMS", "set up WordPress", "configure Strapi", "add
  Contentful", "connect Ghost", or "CMS setup". Also trigger if the user asks
  why no CMS data appears in a seo-analysis report.
allowed-tools:
  - Bash
  - Read
  - Write
  - AskUserQuestion
---
# /setup-cms

指导用户将其 CMS 连接到 notfair 的 SEO 分析工具。

配置完成后，`/seo-analysis` 会自动从 CMS 获取已发布内容，并将其与 Google Search Console 数据交叉比对——找出不可见页面、内容缺口、陈旧文章以及缺失的 SEO 字段。

---

## 步骤 0 — 设置

阅读并遵循 `../shared/preamble.md`——它会定位 SEO 脚本目录。以下所有脚本调用都使用前置说明中的 `$SKILL_SCRIPTS`。

## 步骤 1 — 检测现有 CMS 配置

```bash
CMS_TYPE=$(python3 "$SKILL_SCRIPTS/cms_detect.py" 2>/dev/null)
CMS_STATUS=$?
echo "CMS_TYPE=$CMS_TYPE  EXIT=$CMS_STATUS"
```

- `CMS_STATUS=0` → 已配置 CMS（`$CMS_TYPE` 是其名称）。
  向用户显示：“你已经连接了 **[$CMS_TYPE]**。你想重新配置它，还是切换到其他 CMS？”
  等待用户回复。如果用户选择重新配置/切换，则继续执行步骤 2。
  如果用户选择测试或验证，则跳转到步骤 5（跳到连接测试）。

- `CMS_STATUS=2` → 尚未进行任何配置。继续执行步骤 2。

---

## 步骤 2 — 选择 CMS

询问用户：

> “你要连接哪个 CMS？我支持：
>
> 1. **WordPress** — 自托管或 WordPress.com（使用 REST API + Application Password）
> 2. **Strapi** — v4 或 v5，自托管（使用 API Token）
> 3. **Contentful** — 云端无头 CMS（使用 Delivery API key）
> 4. **Ghost** — Ghost.org 或自托管（使用 Content API key）
>
> 请回复名称或编号。”

等待用户回答。映射为：`wordpress`、`strapi`、`contentful`、`ghost`。

---

## 步骤 3 — 根据 CMS 设置凭据

跳转到所选 CMS 对应的小节。

---

### 3A — WordPress

WordPress 使用内置的 **Application Passwords** 功能（在 WP 5.6 中引入）。
这是授予 API 访问权限最安全的方式——它绝不会暴露你的主密码，并且可以随时撤销。

告知用户：

> “我需要三项信息来连接 WordPress：
>
> 1. **你的 WordPress URL**（例如 `https://myblog.com`）
> 2. **你的 WordPress 用户名**（即你登录时使用的用户名）
> 3. **一个 Application Password**——请在以下位置创建：
>    WordPress Admin → Users → Profile → 向下滚动到 **Application Passwords**
>    → 输入类似 "notfair" 的名称 → 点击 **Add New** → 复制生成的密码
>
> 准备好后，请依次粘贴每个值。”

逐一收集值：
1. 请求 `WP_URL` → 验证它是否以 `http://` 或 `https://` 开头
2. 请求 `WP_USERNAME`
3. 请求 `WP_APP_PASSWORD`
4. 请求 `WP_CONTENT_TYPE`：
   > “你希望我分析哪种内容类型？常见值：`posts`、`pages`。
   > 按 Enter 使用 `posts`（默认值），或输入自定义文章类型的 slug。”

收集完这四项后，继续执行步骤 4（测试连接）。

写入 `.env.local`：
```
WP_URL=<value>
WP_USERNAME=<value>
WP_APP_PASSWORD=<value>
WP_CONTENT_TYPE=<value or posts>
```

---

### 3B — Strapi

告知用户：

> “我需要两项信息来连接 Strapi：
>
> 1. **你的 Strapi URL**（例如 `https://cms.example.com`）
> 2. **一个具有完整访问权限的 API Token**——请在以下位置创建：
>    Strapi Admin → Settings → Global settings → API Tokens → Create new API Token
>    → Type: **Full access** → 复制该令牌
>
> 可选：
> - **内容类型**——内容集合的复数 API ID（默认值：`articles`）。
>   可在以下位置找到：Content-Type Builder → [your type] → API ID (plural)
> - **Strapi 版本**——`4` 或 `5`（如果省略则自动检测）
>
> 准备好后，请依次粘贴每个值。”

收集：
1. `STRAPI_URL`
2. `STRAPI_API_KEY`
3. `STRAPI_CONTENT_TYPE`（可选，默认值：`articles`）
4. `STRAPI_VERSION`（可选）

写入 `.env.local`：
```
STRAPI_URL=<value>
STRAPI_API_KEY=<value>
STRAPI_CONTENT_TYPE=<value or articles>
```
仅当用户指定了该值时，才包含 `STRAPI_VERSION=<value>`。

---

### 3C — Contentful

告诉用户：

> “我需要三项信息来连接 Contentful：
>
> 1. **空间 ID** — 可在以下位置找到：Contentful → 设置 → 常规设置 → 空间 ID
> 2. **内容分发 API 令牌** — 可在以下位置找到：
>    设置 → API 密钥 → [你的密钥] → 内容分发 API - 访问令牌
>    （如果没有密钥，请在设置 → API 密钥 → 添加 API 密钥下创建一个）
> 3. **内容类型 ID** — 内容类型的 API 标识符。
>    可在以下位置找到：内容模型 → [你的类型] → API 标识符
>
> 可选：
> - **环境**（默认值：`master`）
>
> 准备好后，请逐一粘贴各个值。”

收集：
1. `CONTENTFUL_SPACE_ID`
2. `CONTENTFUL_DELIVERY_TOKEN`
3. `CONTENTFUL_CONTENT_TYPE`
4. `CONTENTFUL_ENVIRONMENT`（可选，默认值：`master`）

写入 `.env.local`：
```
CONTENTFUL_SPACE_ID=<value>
CONTENTFUL_DELIVERY_TOKEN=<value>
CONTENTFUL_CONTENT_TYPE=<value>
CONTENTFUL_ENVIRONMENT=<value or master>
```

---

### 3D — Ghost

告诉用户：

> “我需要两项信息来连接 Ghost：
>
> 1. **你的 Ghost URL**（例如 `https://myblog.ghost.io`）
> 2. **内容 API 密钥** — 在以下位置创建：
>    Ghost 管理后台 → 设置 → 集成 → 添加自定义集成
>    → 复制**内容 API 密钥**
>
> 可选：
> - **内容类型**：`posts`（默认）或 `pages`
>
> 准备好后，请逐一粘贴各个值。”

收集：
1. `GHOST_URL`
2. `GHOST_CONTENT_KEY`
3. `GHOST_CONTENT_TYPE`（可选，默认值：`posts`）

写入 `.env.local`：
```
GHOST_URL=<value>
GHOST_CONTENT_KEY=<value>
GHOST_CONTENT_TYPE=<value or posts>
```

---

## 第 4 步 — 写入 .env.local

查找项目的 `.env.local` 文件。搜索该文件：
```bash
ENV_FILE=""
for candidate in ".env.local" "$HOME/.env.local"; do
  [ -f "$candidate" ] && ENV_FILE="$candidate" && break
done
[ -z "$ENV_FILE" ] && ENV_FILE=".env.local"
echo "Writing to: $ENV_FILE"
```

**合并策略** — 不要覆盖整个文件。对于每个环境变量：
1. 如果该键已存在于文件中，则替换对应行。
2. 如果该键不存在，则将其追加到文件末尾。

先读取文件（如果存在），然后逐个更新键，最后写回。

如果文件尚不存在，则创建该文件。

写入后，确认：
> “凭据已写入 `[path]`。现在正在测试连接……”

---

## 第 5 步 — 测试连接

运行相应的预检脚本并捕获退出代码：

```bash
# WordPress
python3 "$SKILL_SCRIPTS/preflight_wordpress.py" 2>&1; PREFLIGHT_EXIT=$?

# Strapi
python3 "$SKILL_SCRIPTS/preflight_strapi.py" 2>&1; PREFLIGHT_EXIT=$?

# Contentful
python3 "$SKILL_SCRIPTS/preflight_contentful.py" 2>&1; PREFLIGHT_EXIT=$?

# Ghost
python3 "$SKILL_SCRIPTS/preflight_ghost.py" 2>&1; PREFLIGHT_EXIT=$?
```

`2>&1` 重定向会使错误消息显示在输出中，以便你向用户展示。

**`PREFLIGHT_EXIT=0`** — 连接成功。向用户显示“OK: …”这一行，
然后继续执行步骤 6。

**`PREFLIGHT_EXIT=1`** — 连接失败。逐字显示完整的错误输出。
帮助用户诊断：
- `401 Unauthorized` → 令牌/密码错误 — 建议重新生成
- `403 Forbidden` → 令牌缺少权限 — 建议使用拥有完全访问权限、不受限制的令牌
- `404 Not Found` → URL 错误或内容类型 slug 错误
- 网络错误 → URL 无法访问 — 先在浏览器中检查该 URL

询问：“要修复凭据并重试吗（我会返回步骤 3），还是暂时跳过 CMS 设置？”

**`PREFLIGHT_EXIT=2`** → 凭据在步骤之间被从 `.env.local` 中移除了。从步骤 3 重新开始。

---

## 步骤 6 — 确认并总结

连接成功后，显示摘要：

```
CMS connected successfully!

  CMS:          [WordPress/Strapi/Contentful/Ghost]
  URL:          [cms_url]
  Content type: [content_type]
  Published:    [N] entries found

What this enables in /seo-analysis:
  • Cross-reference [N] published articles against Google Search Console data
  • Find published content with zero GSC impressions (unindexed or invisible)
  • Identify content gaps: queries ranking 11-30 with no matching article
  • Flag stale content: articles >6 months old with declining clicks
  • Audit SEO fields: missing meta titles/descriptions, length violations
```

然后提供以下选项：
> “运行 `/seo-analysis`，查看包含 CMS 内容的完整审计，
> 或再次输入 `/setup-cms` 以连接其他 CMS。”