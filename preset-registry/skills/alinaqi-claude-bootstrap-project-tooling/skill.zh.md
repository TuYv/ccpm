---
name: project-tooling
description: gh, vercel, supabase, render CLI and deployment platform setup
when-to-use: When setting up deployment, CI/CD, or when CLI tools are needed
user-invocable: false
effort: low
---
# 项目工具技能


用于项目基础设施管理的标准 CLI 工具。

---

## 必需的 CLI 工具

开始任何项目之前，请确认以下工具已安装并完成身份验证：

### 1. GitHub CLI (gh)
```bash
# Verify installation
gh --version

# Verify authentication
gh auth status

# If not authenticated:
gh auth login
```

### 2. Vercel CLI
```bash
# Verify installation
vercel --version

# Verify authentication
vercel whoami

# If not authenticated:
vercel login
```

### 3. Supabase CLI
```bash
# Verify installation
supabase --version

# Verify authentication (check if linked to a project or logged in)
supabase projects list

# If not authenticated:
supabase login
```

### 4. Render CLI（可选——用于 Render 部署）
```bash
# Verify installation
render --version

# If using Render API instead:
# Ensure RENDER_API_KEY is set in environment
```

---

## 验证脚本

在项目初始化时运行此脚本以验证所有工具：

```bash
#!/bin/bash
# scripts/verify-tooling.sh

set -e

echo "Verifying project tooling..."

# GitHub CLI
if command -v gh &> /dev/null; then
  if gh auth status &> /dev/null; then
    echo "✓ GitHub CLI authenticated"
  else
    echo "✗ GitHub CLI not authenticated. Run: gh auth login"
    exit 1
  fi
else
  echo "✗ GitHub CLI not installed. Run: brew install gh"
  exit 1
fi

# Vercel CLI
if command -v vercel &> /dev/null; then
  if vercel whoami &> /dev/null; then
    echo "✓ Vercel CLI authenticated"
  else
    echo "✗ Vercel CLI not authenticated. Run: vercel login"
    exit 1
  fi
else
  echo "✗ Vercel CLI not installed. Run: npm i -g vercel"
  exit 1
fi

# Supabase CLI
if command -v supabase &> /dev/null; then
  if supabase projects list &> /dev/null; then
    echo "✓ Supabase CLI authenticated"
  else
    echo "✗ Supabase CLI not authenticated. Run: supabase login"
    exit 1
  fi
else
  echo "✗ Supabase CLI not installed. Run: brew install supabase/tap/supabase"
  exit 1
fi

echo ""
echo "All tools verified!"
```

---

## GitHub 仓库设置

### 创建新仓库
```bash
# Create and push in one command
gh repo create <repo-name> --private --source=. --remote=origin --push

# Or public:
gh repo create <repo-name> --public --source=. --remote=origin --push
```

### 连接现有仓库
```bash
# If repo exists on GitHub but not linked locally
gh repo clone <owner>/<repo>

# Or add remote to existing local project
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

### 仓库设置
```bash
# Enable branch protection on main
gh api repos/{owner}/{repo}/branches/main/protection -X PUT \
  -F required_status_checks='{"strict":true,"contexts":["quality"]}' \
  -F enforce_admins=false \
  -F required_pull_request_reviews='{"required_approving_review_count":1}'

# Set default branch
gh repo edit --default-branch main
```

---

## Vercel 部署

### 关联项目
```bash
# Link current directory to Vercel project
vercel link

# Or create new project
vercel
```

### 环境变量
```bash
# Add environment variable
vercel env add ANTHROPIC_API_KEY production

# Pull env vars to local .env
vercel env pull .env.local
```

### 部署
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Supabase 设置

### 创建新项目
```bash
# Create project (interactive)
supabase projects create <project-name> --org-id <org-id>

# Link local to remote
supabase link --project-ref <project-ref>
```

### 本地开发
```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Reset database (apply all migrations fresh)
supabase db reset
```

### 迁移
```bash
# Create new migration
supabase migration new <migration-name>

# Apply migrations to remote
supabase db push

# Pull remote schema to local
supabase db pull
```

### 生成类型
```bash
# Generate TypeScript types from schema
supabase gen types typescript --local > src/types/database.ts

# Or from remote
supabase gen types typescript --project-id <ref> > src/types/database.ts
```

---

## Render 设置（基于 API）

### 环境
```bash
# Set API key
export RENDER_API_KEY=<your-api-key>
```

### 通过 API 执行常见操作
```bash
# List services
curl -H "Authorization: Bearer $RENDER_API_KEY" \
  https://api.render.com/v1/services

# Trigger deploy
curl -X POST -H "Authorization: Bearer $RENDER_API_KEY" \
  https://api.render.com/v1/services/<service-id>/deploys

# Get deploy status
curl -H "Authorization: Bearer $RENDER_API_KEY" \
  https://api.render.com/v1/services/<service-id>/deploys/<deploy-id>
```

---

## Package.json 脚本

添加以下脚本以执行常见操作：

```json
{
  "scripts": {
    "verify-tools": "./scripts/verify-tooling.sh",
    "deploy:preview": "vercel",
    "deploy:prod": "vercel --prod",
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:reset": "supabase db reset",
    "db:migrate": "supabase db push",
    "db:types": "supabase gen types typescript --local > src/types/database.ts"
  }
}
```

---

## CI/CD 集成

### GitHub Actions 与 Vercel 集成
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: ${{ github.ref == 'refs/heads/main' && '--prod' || '' }}
```

### GitHub Actions 与 Supabase 集成
```yaml
# .github/workflows/migrate.yml
name: Migrate Database

on:
  push:
    branches: [main]
    paths:
      - 'supabase/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Push migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

---

## 部署平台设置

**必需**：初始化项目时，始终根据技术栈创建用于连接部署平台的待办事项。

### 按技术栈选择平台

| 技术栈 | 默认平台 | 必需操作 |
|-------|-----------------|-----------------|
| Next.js / Node.js | **Vercel** | 将 Git 仓库连接到 Vercel |
| Python (FastAPI, Flask) | **Render** | 将 Git 仓库连接到 Render，并获取 API 密钥 |
| 静态网站 | **Vercel** 或 **Cloudflare Pages** | 连接 Git 仓库 |

### Vercel：连接 Git 仓库

当部署平台为 Vercel 时，创建以下待办事项：
```
TODO: Connect Git repository to Vercel for automatic deployments
```

步骤：
```bash
# Option 1: Via CLI
vercel link
vercel git connect

# Option 2: Via Dashboard (recommended for first setup)
# 1. Go to vercel.com/new
# 2. Import Git repository
# 3. Configure project settings
# 4. Deploy
```

连接后：
- 推送到 `main` → 生产环境部署
- 推送到其他分支 → 预览环境部署
- PR 会自动获得部署预览

### Render：连接 Git 仓库（Python）

当 Python 项目使用 Render 作为部署平台时：

**第 1 步：向用户索取 Render API 密钥**
```
Before proceeding, please provide your Render API key.
Get it from: https://dashboard.render.com/u/settings/api-keys

Store it securely - we'll add it to your environment.
```

**第 2 步：创建待办事项**
```
TODO: Get Render API key from user
TODO: Connect Git repository to Render
TODO: Configure Render service (web service or background worker)
TODO: Set environment variables on Render
```

**第 3 步：通过控制面板连接（推荐）**
```bash
# 1. Go to dashboard.render.com/create
# 2. Select "Web Service" for APIs, "Background Worker" for async
# 3. Connect your GitHub/GitLab repository
# 4. Configure:
#    - Name: <project-name>
#    - Runtime: Python 3
#    - Build Command: pip install -r requirements.txt
#    - Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

**第 4 步：存储用于 CI/CD 的 API 密钥**
```bash
# Add to GitHub secrets for CI/CD
gh secret set RENDER_API_KEY

# Or add to local env
echo "RENDER_API_KEY=<your-key>" >> .env
```

**第 5 步：配置 render.yaml（可选——基础设施即代码）**
```yaml
# render.yaml
services:
  - type: web
    name: <project-name>-api
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: "3.11"
      - key: DATABASE_URL
        fromDatabase:
          name: <project-name>-db
          property: connectionString

databases:
  - name: <project-name>-db
    plan: free
```

### 部署检查清单模板

设置部署时，将以下内容添加到项目待办事项中：

```markdown
## Deployment Setup
- [ ] Create Git repository (gh repo create)
- [ ] Choose deployment platform (Vercel/Render/other)
- [ ] Connect Git to deployment platform
- [ ] Configure environment variables
- [ ] Set up CI/CD workflow
- [ ] Verify preview deployments work
- [ ] Configure production domain
```

---

## 工具使用反模式

- ❌ 硬编码密钥——使用 CLI 环境管理或 GitHub secrets
- ❌ 手动部署——通过 CI/CD 实现自动化
- ❌ 跳过本地 Supabase——始终先在本地进行开发
- ❌ 直接更改生产数据库——使用 migrations
- ❌ 无分支保护——要求进行 PR 审查和 CI 检查
- ❌ 缺少环境隔离——保持 dev/staging/prod 相互独立