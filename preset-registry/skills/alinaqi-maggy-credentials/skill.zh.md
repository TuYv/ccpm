---
name: credentials
description: Centralized API key management from Access.txt
when-to-use: When setting up a new project that needs API keys or environment variables
user-invocable: false
effort: low
---
# 凭证管理技能


用于从集中式访问文件中安全加载 API 密钥并配置项目环境。

---

## 凭证文件发现

**必需**：当项目需要 API 密钥时，询问用户：

```
我需要 [service] 的 API 凭证。你是否有集中式访问密钥文件？

请提供路径（例如：~/Documents/Access.txt），或输入 'manual' 以直接输入密钥。
```

### 要检查的默认位置

```bash
~/Documents/Access.txt
~/Access.txt
~/.secrets/keys.txt
~/.credentials.txt
```

---

## 支持的文件格式

凭证文件可以使用以下任一格式：

### 格式 1：冒号分隔
```
Render API: rnd_xxxxx
OpenAI API: sk-proj-xxxxx
Claude API: sk-ant-xxxxx
Reddit client id: xxxxx
Reddit secret: xxxxx
```

### 格式 2：Key=Value
```
RENDER_API_KEY=rnd_xxxxx
OPENAI_API_KEY=sk-proj-xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 格式 3：混合/非正式格式
```
Reddit api access:
client id Y1FgKALKmb6f6UxFtyMXfA
and secret is -QLoYdxMqOJkYrgk5KeGPa6Ps6vIiQ
```

---

## 密钥识别模式

使用以下模式识别文件中的密钥：

| 服务 | 模式 | 环境变量 |
|---------|---------|--------------|
| OpenAI | `sk-proj-*` 或 `sk-*` | `OPENAI_API_KEY` |
| Claude/Anthropic | `sk-ant-*` | `ANTHROPIC_API_KEY` |
| Render | `rnd_*` | `RENDER_API_KEY` |
| Eleven Labs | `sk_*`（不是 sk-ant/sk-proj） | `ELEVEN_LABS_API_KEY` |
| Replicate | `r8_*` | `REPLICATE_API_TOKEN` |
| Supabase | URL + `eyJ*`（JWT） | `SUPABASE_URL`、`SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY` |
| Reddit | client_id + secret 对 | `REDDIT_CLIENT_ID`、`REDDIT_CLIENT_SECRET` |
| GitHub | `ghp_*` 或 `github_pat_*` | `GITHUB_TOKEN` |
| Vercel | `*_*`（来自 vercel.com） | `VERCEL_TOKEN` |
| Stripe（测试） | `sk_test_*`、`pk_test_*` | `STRIPE_SECRET_KEY`、`STRIPE_PUBLISHABLE_KEY` |
| Stripe（正式） | `sk_live_*`、`pk_live_*` | `STRIPE_SECRET_KEY`、`STRIPE_PUBLISHABLE_KEY` |
| Stripe Webhook | `whsec_*` | `STRIPE_WEBHOOK_SECRET` |
| Twilio | `SK*` + Account SID | `TWILIO_API_KEY`、`TWILIO_ACCOUNT_SID` |
| SendGrid | `SG.*` | `SENDGRID_API_KEY` |
| AWS | `AKIA*` + secret | `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` |
| PostHog | `phc_*` | `POSTHOG_API_KEY`、`NEXT_PUBLIC_POSTHOG_KEY` |

---

## 解析凭证文件

读取用户的访问文件时，使用以下规则提取密钥：

```python
# Python parsing logic
import re
from pathlib import Path

def parse_credentials_file(file_path: str) -> dict[str, str]:
    """Parse various credential file formats."""
    content = Path(file_path).expanduser().read_text()
    credentials = {}

    # Pattern matching for known key formats
    patterns = {
        'OPENAI_API_KEY': r'sk-proj-[A-Za-z0-9_-]+',
        'ANTHROPIC_API_KEY': r'sk-ant-[A-Za-z0-9_-]+',
        'RENDER_API_KEY': r'rnd_[A-Za-z0-9]+',
        'REPLICATE_API_TOKEN': r'r8_[A-Za-z0-9]+',
        'ELEVEN_LABS_API_KEY': r'sk_[a-f0-9]{40,}',
        'GITHUB_TOKEN': r'ghp_[A-Za-z0-9]+|github_pat_[A-Za-z0-9_]+',
        'STRIPE_SECRET_KEY': r'sk_(live|test)_[A-Za-z0-9]+',
        'STRIPE_PUBLISHABLE_KEY': r'pk_(live|test)_[A-Za-z0-9]+',
        'STRIPE_WEBHOOK_SECRET': r'whsec_[A-Za-z0-9]+',
        'POSTHOG_API_KEY': r'phc_[A-Za-z0-9]+',
    }

    # Supabase requires special handling (URL + JWT tokens)
    supabase_url = re.search(r'https://[a-z0-9]+\.supabase\.co', content)
    anon_key = re.search(r'anon[^:]*:\s*(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)', content, re.I)
    service_role = re.search(r'service.?role[^:]*:\s*(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)', content, re.I)

    if supabase_url:
        credentials['SUPABASE_URL'] = supabase_url.group(0)
    if anon_key:
        credentials['SUPABASE_ANON_KEY'] = anon_key.group(1)
    if service_role:
        credentials['SUPABASE_SERVICE_ROLE_KEY'] = service_role.group(1)

    for env_var, pattern in patterns.items():
        match = re.search(pattern, content)
        if match:
            credentials[env_var] = match.group(0)

    # Reddit requires special handling (client_id + secret pair)
    reddit_id = re.search(r'client.?id[:\s]+([A-Za-z0-9_-]+)', content, re.I)
    reddit_secret = re.search(r'secret[:\s]+([A-Za-z0-9_-]+)', content, re.I)
    if reddit_id:
        credentials['REDDIT_CLIENT_ID'] = reddit_id.group(1)
    if reddit_secret:
        credentials['REDDIT_CLIENT_SECRET'] = reddit_secret.group(1)

    return credentials
```

```typescript
// TypeScript parsing logic
function parseCredentialsFile(content: string): Record<string, string> {
  const credentials: Record<string, string> = {};

  const patterns: Record<string, RegExp> = {
    OPENAI_API_KEY: /sk-proj-[A-Za-z0-9_-]+/,
    ANTHROPIC_API_KEY: /sk-ant-[A-Za-z0-9_-]+/,
    RENDER_API_KEY: /rnd_[A-Za-z0-9]+/,
    REPLICATE_API_TOKEN: /r8_[A-Za-z0-9]+/,
    ELEVEN_LABS_API_KEY: /sk_[a-f0-9]{40,}/,
    GITHUB_TOKEN: /ghp_[A-Za-z0-9]+|github_pat_[A-Za-z0-9_]+/,
    STRIPE_SECRET_KEY: /sk_(live|test)_[A-Za-z0-9]+/,
    STRIPE_PUBLISHABLE_KEY: /pk_(live|test)_[A-Za-z0-9]+/,
    STRIPE_WEBHOOK_SECRET: /whsec_[A-Za-z0-9]+/,
    POSTHOG_API_KEY: /phc_[A-Za-z0-9]+/,
  };

  for (const [envVar, pattern] of Object.entries(patterns)) {
    const match = content.match(pattern);
    if (match) credentials[envVar] = match[0];
  }

  // Reddit pair
  const redditId = content.match(/client.?id[:\s]+([A-Za-z0-9_-]+)/i);
  const redditSecret = content.match(/secret[:\s]+([A-Za-z0-9_-]+)/i);
  if (redditId) credentials.REDDIT_CLIENT_ID = redditId[1];
  if (redditSecret) credentials.REDDIT_CLIENT_SECRET = redditSecret[1];

  return credentials;
}
```

---

## 验证命令

提取密钥后，对其进行验证：

### OpenAI
```bash
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
# 200 = valid
```

### Anthropic/Claude
```bash
curl -s -o /dev/null -w "%{http_code}" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  https://api.anthropic.com/v1/models
# 200 = valid
```

### Render
```bash
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  https://api.render.com/v1/services
# 200 = valid
```

### Reddit
```bash
# Get OAuth token first
TOKEN=$(curl -s -X POST \
  -u "$REDDIT_CLIENT_ID:$REDDIT_CLIENT_SECRET" \
  -d "grant_type=client_credentials" \
  -A "CredentialTest/1.0" \
  https://www.reddit.com/api/v1/access_token | jq -r '.access_token')
# Non-null token = valid
```

### Replicate
```bash
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Token $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/models
# 200 = valid
```

---

## 项目设置工作流

初始化需要 API 密钥的项目时：

### 步骤 1：请求凭据文件
```
This project needs the following API keys:
- ANTHROPIC_API_KEY (for Claude)
- SUPABASE_URL and SUPABASE_ANON_KEY

Do you have an access keys file? Please provide the path:
```

### 步骤 2：读取并解析
```python
# Read the file
credentials = parse_credentials_file("~/Documents/Access.txt")

# Show what was found
print("Found credentials:")
for key, value in credentials.items():
    masked = value[:8] + "..." + value[-4:]
    print(f"  {key}: {masked}")
```

### 步骤 3：验证密钥
```
Validating credentials...
✓ ANTHROPIC_API_KEY: Valid
✓ REDDIT_CLIENT_ID: Valid
✗ SUPABASE_URL: Not found in file
```

### 步骤 4：创建 .env 文件
```bash
# Write to project .env
cat > .env << EOF
# Auto-generated from ~/Documents/Access.txt
ANTHROPIC_API_KEY=sk-ant-xxx...
REDDIT_CLIENT_ID=xxx...
REDDIT_CLIENT_SECRET=xxx...
EOF

# Add to .gitignore if not present
echo ".env" >> .gitignore
```

### 第 5 步：报告缺失的密钥
```
Missing credentials that need manual setup:
- SUPABASE_URL: Get from supabase.com/dashboard/project/[ref]/settings/api
- SUPABASE_ANON_KEY: Same location as above

Would you like me to open these URLs?
```

---

## 特定服务的设置指南

### Reddit（来自 Access.txt）
```
Found in your access file:
- REDDIT_CLIENT_ID: Y1FgKA...
- REDDIT_CLIENT_SECRET: -QLoYd...

Also needed (add to Access.txt or enter manually):
- REDDIT_USER_AGENT: YourApp/1.0 by YourUsername
```

### Supabase（通常不在文件中）
```
Supabase credentials are project-specific. Get them from:
https://supabase.com/dashboard/project/[your-ref]/settings/api

Required:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (for admin operations)
```

---

## 安全规则

- **绝不要**将 Access.txt 或其路径提交到 git
- **绝不要**记录完整的 API 密钥——始终遮盖中间字符
- **始终**将 `.env` 添加到 `.gitignore`
- **始终**使用环境变量，绝不要硬编码密钥
- **验证**密钥后再在生产环境设置中使用

---

## 快速参考

```bash
# Check if credentials file exists
ls -la ~/Documents/Access.txt

# Common env var names
OPENAI_API_KEY
ANTHROPIC_API_KEY
RENDER_API_KEY
REDDIT_CLIENT_ID
REDDIT_CLIENT_SECRET
REPLICATE_API_TOKEN
ELEVEN_LABS_API_KEY
SUPABASE_URL
SUPABASE_ANON_KEY
GITHUB_TOKEN
```

### 提示词模板
```
I need API credentials for this project.

Do you have a centralized access keys file (like ~/Documents/Access.txt)?

If yes, provide the path and I'll:
1. Read and parse your keys
2. Validate they're working
3. Set up your project's .env file
4. Tell you which keys are missing
```