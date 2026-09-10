---
name: cloudflare-troubleshooting
description: Investigate and resolve Cloudflare configuration issues using API-driven evidence gathering. Use when troubleshooting ERR_TOO_MANY_REDIRECTS, SSL errors, DNS issues, or any Cloudflare-related problems. Focus on systematic investigation using Cloudflare API to examine actual configuration rather than making assumptions.
---
# Cloudflare 故障排查

> **方法论基础：** 通用的、以证据为驱动的网络诊断原则（证伪、分层隔离、交叉复核）位于 **debugging-network-issues** skill 中。本 skill 是构建于其之上的 Cloudflare *领域层*。

## 核心原则

**基于证据进行调查，而不是基于假设。** 诊断问题前，始终先查询 Cloudflare API，以检查实际配置。本 skill 的价值在于系统化的调查方法，而不是预设解决方案。

## 调查方法

### 1. 收集凭据

复用用户或项目配置中已提供的域名和已授权的 Cloudflare 连接。仅询问缺失的连接信息：域名、账户邮箱加 Global API Key，或 API Token。保留当前使用的身份验证方式；故障排查不需要更换身份验证方式。

Global API Key 位置：Cloudflare Dashboard → My Profile → API Tokens → View Global API Key

### 2. 获取 Zone 信息

任何 Cloudflare 故障排查的第一步都是获取 zone ID：

```bash
curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=<domain>" \
  -H "X-Auth-Email: <email>" \
  -H "X-Auth-Key: <api_key>" | jq '.'
```

提取 `id` 前，选择完全匹配的 zone 和账户；当账户或域名身份存在歧义时，不要盲目选择第一个结果。账户范围调用应使用该 zone 的 `account.id`。

### 3. 系统化调查

针对每个问题，先收集证据再得出结论。使用 Cloudflare API 检查：
- 当前配置状态
- 最近的变更（如果审计日志可用）
- 可能相互影响的相关设置

## 常见调查模式

### 重定向循环（ERR_TOO_MANY_REDIRECTS）

**证据收集顺序：**

1. **检查 SSL/TLS 模式：**
   ```bash
   curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/settings/ssl" \
     -H "X-Auth-Email: email" \
     -H "X-Auth-Key: key"
   ```

   查找：`result.value` - 用于说明当前 SSL 模式

2. **检查 Always Use HTTPS 设置：**
   ```bash
   curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/settings/always_use_https" \
     -H "X-Auth-Email: email" \
     -H "X-Auth-Key: key"
   ```

3. **检查重定向相关的 Page Rules：**
   ```bash
   curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/pagerules" \
     -H "X-Auth-Email: email" \
     -H "X-Auth-Key: key"
   ```

   查找：`forwarding_url` 或 `always_use_https` 操作

4. **直接测试源服务器（如果可能）：**
   ```bash
   curl -I -H "Host: <domain>" https://<origin_ip>
   ```

**诊断逻辑：**
- SSL 模式为 "flexible" + 源站强制使用 HTTPS = 重定向循环
- 多条重定向规则可能相互冲突
- 检查浏览器与 curl 行为之间的差异

**修复：**
```bash
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/{zone_id}/settings/ssl" \
  -H "X-Auth-Email: email" \
  -H "X-Auth-Key: key" \
  -H "Content-Type: application/json" \
  --data '{"value":"full"}'
```

修复后清除缓存：
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "X-Auth-Email: email" \
  -H "X-Auth-Key: key" \
  -d '{"purge_everything":true}'
```

### 电子邮件路由和转发

对于别名投递、目标地址验证、全收件行为或转发 MX 问题，请参阅 [Email Routing](references/email-routing.md)。其中提供了账户/区域 API 的读取顺序，并区分已保存的配置与实际到达收件箱的情况。

### DNS 问题

**证据收集：**

1. **列出 DNS 记录：**
   ```bash
   curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records" \
     -H "X-Auth-Email: email" \
     -H "X-Auth-Key: key"
   ```

2. **检查外部 DNS 解析：**
   ```bash
   dig <domain>
   dig @8.8.8.8 <domain>
   ```

3. **检查 DNSSEC 状态：**
   ```bash
   curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/dnssec" \
     -H "X-Auth-Email: email" \
     -H "X-Auth-Key: key"
   ```

**检查以下内容：**
- 缺少 A/AAAA/CNAME 记录
- 代理状态不正确（已代理与仅 DNS）
- TTL 值
- 冲突的记录

### SSL 证书错误

**证据收集：**

1. **检查 SSL 证书状态：**
   ```bash
   curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/ssl/certificate_packs" \
     -H "X-Auth-Email: email" \
     -H "X-Auth-Key: key"
   ```

2. **检查源站证书（如果使用 Full Strict）：**
   ```bash
   openssl s_client -connect <origin_ip>:443 -servername <domain>
   ```

3. **检查 SSL 设置：**
   - 最低 TLS 版本
   - TLS 1.3 状态
   - Opportunistic Encryption

**常见问题：**
- 错误 526：SSL 模式为 "strict"，但源站证书无效
- 错误 525：源站 SSL 握手失败
- 配置延迟：Universal SSL 需要等待 15-30 分钟

### 源站服务器错误（502/503/504）

**证据收集：**

1. **检查源站是否可访问：**
   ```bash
   curl -I -H "Host: <domain>" https://<origin_ip>
   ```

2. **检查 DNS 记录是否指向正确的源站：**
   ```bash
   curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records" \
     -H "X-Auth-Email: email" \
     -H "X-Auth-Key: key"
   ```

3. **检查负载均衡器配置（如果适用）：**
   ```bash
   curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/load_balancers" \
     -H "X-Auth-Email: email" \
     -H "X-Auth-Key: key"
   ```

4. **检查防火墙规则：**
   ```bash
   curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/firewall/rules" \
     -H "X-Auth-Email: email" \
     -H "X-Auth-Key: key"
   ```

## 学习新的 API

遇到上述内容未涵盖的问题时，请参阅 Cloudflare API 文档：

1. **浏览 API 参考：** https://developers.cloudflare.com/api/
2. **使用问题关键词搜索相关端点**
3. **检查 API schema** 以了解可用的操作
4. **先使用 GET 请求进行测试**，以了解数据结构
5. **确认方案后使用 PATCH/POST 进行更改**

**探索新 API 的模式：**
```bash
# List available settings for a zone
curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/settings" \
  -H "X-Auth-Email: email" \
  -H "X-Auth-Key: key"
```

## API 参考概览

请参阅 `references/api_overview.md`，了解：
- 按类别整理的常用端点
- 请求/响应架构
- 身份验证模式
- 速率限制和错误处理

请参阅 `references/ssl_modes.md`，了解：
- SSL/TLS 模式的详细说明
- 平台兼容性
- 安全影响

请参阅 `references/common_issues.md`，了解：
- 问题模式和症状
- 调查清单
- 平台特定说明

## 最佳实践

### 基于证据的调查

1. **先查询再假设** - 使用 API 检查实际状态
2. **收集多个数据点** - 交叉核对设置
3. **检查相关配置** - 设置之间通常会相互影响
4. **从外部验证** - 使用 dig/curl 进行确认
5. **逐步测试** - 一次只进行一项更改

### API 使用

1. **解析 JSON 响应** - 使用 `jq` 或 python 提高可读性
2. **检查 success 字段** - 响应中的 `"success": true/false`
3. **妥善处理错误** - 读取响应中的 `errors` 数组
4. **遵守速率限制** - Cloudflare API 有速率限制
5. **使用适当的方法：**
   - GET：获取信息
   - PATCH：更新设置
   - POST：创建资源 / 触发操作
   - DELETE：移除资源

### 进行更改

1. **先收集证据** - 了解当前状态
2. **确定根本原因** - 不要猜测
3. **应用针对性修复** - 只更改必要内容
4. **必要时清除缓存** - 尤其是 SSL/重定向更改
5. **验证修复结果** - 重新查询 API 进行确认
6. **告知用户等待时间：**
   - 边缘服务器传播：30-60 秒
   - DNS 传播：最长 48 小时
   - 浏览器缓存：需要手动清除

### 安全性

- 永远不要在输出中记录 API 密钥
- 如果用户在公开环境中分享凭据，应发出警告
- 建议使用具有受限权限的 API Tokens，而不是 Global API Key
- 调查时使用只读操作

## 工作流模板

```
1. 复用已配置的域名和已授权的 API 连接；仅获取缺失的值
2. 通过 zones API 获取 zone_id
3. 进行调查：
   - 查询相关 API 以获取证据
   - 检查多个相关设置
   - 使用外部工具（dig、curl）进行验证
4. 分析证据以确定根本原因
5. 通过适当的 API 端点应用修复
6. 如果配置更改会影响交付，则清除缓存
7. 通过 API 查询和外部测试验证修复结果
8. 告知用户解决结果以及任何所需操作
```

## 示例：完整调查

当用户报告“网站显示 ERR_TOO_MANY_REDIRECTS”时：

```bash
# 1. Get zone ID
curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=example.com" \
  -H "X-Auth-Email: user@example.com" \
  -H "X-Auth-Key: abc123" | jq '.result[] | select(.name == "example.com") | {id, account}'

# Select the intended account from the exact-domain result before using its id.
# 2. Check SSL mode (primary suspect for redirect loops)
curl -s -X GET "https://api.cloudflare.com/client/v4/zones/ZONE_ID/settings/ssl" \
  -H "X-Auth-Email: user@example.com" \
  -H "X-Auth-Key: abc123" | jq '.result.value'

# If returns "flexible" and origin is GitHub Pages/Netlify/Vercel:

# 3. Fix by changing to "full"
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/ZONE_ID/settings/ssl" \
  -H "X-Auth-Email: user@example.com" \
  -H "X-Auth-Key: abc123" \
  -H "Content-Type: application/json" \
  --data '{"value":"full"}'

# 4. Purge cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "X-Auth-Email: user@example.com" \
  -H "X-Auth-Key: abc123" \
  -d '{"purge_everything":true}'

# 5. Inform user: Wait 60 seconds, clear browser cache, retry
```

## 脚本适用场景

捆绑的脚本（`scripts/check_cloudflare_config.py`、`scripts/fix_ssl_mode.py`）可用于：
- **调查模式的参考实现**
- **Python 可用时的快速诊断工具**
- **以编程方式使用 API 的示例**

不过，出于灵活性和透明度考虑，**优先通过 Bash/curl 直接调用 API**。脚本不应限制能力，在以下情况下需要时应使用原始 API 调用：
- 不熟悉的场景
- 边缘情况
- 学习/调试
- 脚本未涵盖的操作

调查方法和 API 知识才是核心技能，而不是脚本本身。