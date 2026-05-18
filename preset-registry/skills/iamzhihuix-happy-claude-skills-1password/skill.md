---
name: 1password
description: 使用 1Password CLI (op) 管理密码和 API credentials。保存、查询、读取 API key/token，注入环境变量到脚本。当用户提到保存密码、保存 API key、查询密码、1password、op CLI、secret 管理时使用此 skill。
metadata:
  author: iamzhihuix
  version: "1.0.0"
---

# 1Password CLI

使用 `op` CLI 管理 1Password vault 中的密码和 API credentials。

## 前置检查

使用前确认 `op` 已安装并已集成桌面 App：

```bash
op --version
```

未安装则引导安装：

```bash
brew install --cask 1password-cli
```

安装后需在 1Password 桌面 App 中开启集成：Settings → Developer → Integrate with 1Password CLI。

---

## 保存 API Credential

用户提供 API Key 信息时，使用以下命令保存。字段按实际提供情况填写，未提供的字段省略。

**标题命名规范：** `{服务商} API Key - {用途标识}`（如 `OpenAI API Key - agent`）

```bash
op item create \
  --category="API Credential" \
  --title="{标题}" \
  --vault="Personal" \
  "credential={API Key}" \
  "website[url]={网站 URL}" \
  "base_url[text]={API base URL}" \
  "username[text]={邮箱或用户名}" \
  "用途说明[text]={用途描述}" \
  "过期时间[text]={YYYY-MM-DD}" \
  "创建日期[text]={YYYY-MM-DD}" \
  --tags "{服务商},{项目标签}"
```

**最小必填字段：** `credential`（API Key 本身）。其余字段按用户提供情况填入。

---

## 查询/搜索条目

按标题或 URL 关键词模糊查找：

```bash
op item list --format=json | python3 -c "
import json, sys
items = json.load(sys.stdin)
keyword = '{关键词}'.lower()
for i in items:
    title_match = keyword in i['title'].lower()
    url_match = any(keyword in str(u) for u in i.get('urls', []))
    if title_match or url_match:
        print('ID:', i['id'], '| Title:', i['title'], '| Updated:', i.get('updated_at', ''))
"
```

---

## 读取 Credential

```bash
# 读取（隐藏值）
op item get "{标题}" --fields credential

# 读取（显示明文）
op item get "{标题}" --fields credential --reveal
```

---

## 注入环境变量（开发工作流）

在 `.env` 文件中使用 Secret References 代替明文，可以安全提交到 git：

```
OPENAI_API_KEY=op://Personal/OpenAI API Key - agent/credential
DEEPSEEK_API_KEY=op://Personal/DeepSeek API Key - agent skd/credential
```

运行脚本时注入真实值：

```bash
op run --env-file=.env -- your-script.sh
op run --env-file=.env -- python3 main.py
```

---

## Vault 管理

```bash
# 查看所有 vault
op vault list

# 查看某 vault 下所有条目
op item list --vault="Personal"

# 按 tag 筛选
op item list --tags "deepseek"
```

---

## 工作流示例

用户说「帮我保存 OpenAI 的 API Key：sk-xxx」时：

1. 确认 `op` 已安装可用
2. 收集信息：服务商名、API Key、网站 URL、用途、关联项目（按用户提供情况）
3. 执行 `op item create` 保存
4. 输出保存结果（ID、标题、字段列表），不显示 credential 明文
