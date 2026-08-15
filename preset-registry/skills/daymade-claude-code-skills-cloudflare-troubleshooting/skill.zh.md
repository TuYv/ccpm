---
name: cloudflare-troubleshooting
description: Investigate and resolve Cloudflare configuration issues using API-driven evidence gathering. Use when troubleshooting ERR_TOO_MANY_REDIRECTS, SSL errors, DNS issues, or any Cloudflare-related problems. Focus on systematic investigation using Cloudflare API to examine actual configuration rather than making assumptions.
---
# Cloudflare 故障排查

> **方法论基础：** 通用的、以证据为驱动的网络诊断准则（证伪、分层隔离、反向审查）位于 **debugging-network-issues** Skill 中。本 Skill 是构建于其上的 Cloudflare *领域* 层。

## 核心原则

**基于证据而非假设进行调查。** 在诊断问题之前，始终通过查询 Cloudflare API 检查实际配置。本 Skill 的价值在于系统化的调查方法，而非预先确定的解决方案。

## 调查方法

### 1. 获取凭据

向用户索取：
- 域名
- Cloudflare 账户电子邮箱
- Cloudflare Global API Key（或 API Token）

Global API Key 的位置：Cloudflare Dashboard → My Profile → API Tokens → View Global API Key

### 2. 获取 Zone 信息

进行任何 Cloudflare 故障排查时，第一步都是获取 Zone ID：

```bash
curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=<domain>" \
  -H "X-Auth-Email: <email>" \
  -H "X-Auth-Key: <api_key>" | jq '.'
```

从 `result[0].id` 中提取 `zone_id`，供后续 API 调用使用。

### 3. 进行系统化调查

对于每个问题，在得出结论之前先收集证据。使用 Cloudflare API 检查：
- 当前配置状态
- 最近的变更（如果审计日志可用）
- 可能产生相互影响的相关设置

## 常见调查模式

### 重定向循环（ERR_TOO_MANY_REDIRECTS）

**证据收集顺序：**

1. **检查 SSL/TLS 模式：**
   ```bash
   curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/settings/ssl" \
     -H "X-Auth-Email: email" \
     -H "X-Auth-Key: key"
   ```

   查找：`result.value`——它表示当前的 SSL 模式

2. **检查 Always Use HTTPS 设置：**
   ```bash
   curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/settings/always_use_https" \
     -H "X-Auth-Email: email" \
     -H "X-Auth-Key: key"
   ```

3. **检查 Page Rules 中的重定向：**
   ```bash
   curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/pagerules" \
     -H "X-Auth-Email: email" \
     -H "X-Auth-Key: key"
   ```

   查找：`forwarding_url` 或 `always_use_https` 操作

4. **直接测试源站服务器（如果可行）：**
   ```bash
   curl -I -H "Host: <domain>" https://<origin_ip>
   ```

**诊断逻辑：**
- SSL 模式为 "flexible" + 源站强制使用 HTTPS = 重定向循环
- 多条重定向规则可能相互冲突
- 检查浏览器与 curl 之间的行为差异

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
   - 机会性加密

**常见问题：**
- 错误 526：SSL 模式为 "strict"，但源站证书无效
- 错误 525：源站 SSL 握手失败
- 配置延迟：等待 15-30 分钟，以完成 Universal SSL 配置

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

3. **检查负载均衡器配置（如适用）：**
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

遇到上述内容未涵盖的问题时，请查阅 Cloudflare API 文档：

1. **浏览 API 参考：** https://developers.cloudflare.com/api/
2. **使用问题关键词搜索相关端点**
3. **检查 API 架构**以了解可用操作
4. **先使用 GET 请求进行测试**，以了解数据结构
5. **确认方法后，使用 PATCH/POST 进行更改**

**探索新 API 的模式：**
```bash
# List available settings for a zone
curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/settings" \
  -H "X-Auth-Email: email" \
  -H "X-Auth-Key: key"
```

## API 参考概览

有关以下内容，请查阅 `references/api_overview.md`：
- 按类别组织的常用端点
- 请求/响应架构
- 身份验证模式
- 速率限制和错误处理

有关以下内容，请查阅 `references/ssl_modes.md`：
- SSL/TLS 模式的详细说明
- 平台兼容性
- 安全影响

有关以下内容，请查阅 `references/common_issues.md`：
- 问题模式和症状
- 调查检查清单
- 特定于平台的说明

## 最佳实践

### 基于证据的调查

1. **先查询，再假设** - 使用 API 检查实际状态
2. **收集多个数据点** - 交叉核对各项设置
3. **检查相关配置** - 设置之间通常会相互影响
4. **从外部验证** - 使用 dig/curl 进行确认
5. **逐步测试** - 每次只做一项更改

### API 使用

1. **解析 JSON 响应** - 使用 `jq` 或 python 提高可读性
2. **检查 success 字段** - 响应中的 `"success": true/false`
3. **妥善处理错误** - 读取响应中的 `errors` 数组
4. **遵守速率限制** - Cloudflare API 存在调用限制
5. **使用适当的方法：**
   - GET：检索信息
   - PATCH：更新设置
   - POST：创建资源 / 触发操作
   - DELETE：删除资源

### 进行更改

1. **先收集证据** - 了解当前状态
2. **确定根本原因** - 不要猜测
3. **应用针对性修复** - 只更改必要的内容
4. **必要时清除缓存** - 尤其是在更改 SSL/重定向配置时
5. **验证修复结果** - 再次查询 API 以确认
6. **告知用户等待时间：**
   - 边缘服务器传播：30-60 秒
   - DNS 传播：最长 48 小时
   - 浏览器缓存：需要手动清除

### 安全

- 切勿在输出中记录 API 密钥
- 如果用户在公开场合分享凭据，应发出警告
- 建议使用具有特定权限范围的 API Token，而不是 Global API Key
- 调查时使用只读操作

## 工作流模板

```
1. Gather: domain, email, API key
2. Get zone_id via zones API
3. Investigate:
   - Query relevant APIs for evidence
   - Check multiple related settings
   - Verify with external tools (dig, curl)
4. Analyze evidence to determine root cause
5. Apply fix via appropriate API endpoint
6. Purge cache if configuration change affects delivery
7. Verify fix via API query and external testing
8. Inform user of resolution and any required actions
```

## 示例：完整调查流程

当用户报告“网站显示 ERR_TOO_MANY_REDIRECTS”时：

```bash
# 1. Get zone ID
curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=example.com" \
  -H "X-Auth-Email: user@example.com" \
  -H "X-Auth-Key: abc123" | jq '.result[0].id'

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

## 适合使用脚本的情况

随附的脚本（`scripts/check_cloudflare_config.py`、`scripts/fix_ssl_mode.py`）可用作：
- 调查模式的**参考实现**
- Python 可用时的**快速诊断工具**
- 以编程方式使用 API 的**示例**

不过，为了灵活性和透明度，**应优先通过 Bash/curl 直接调用 API**。脚本不应限制能力——方便时可以使用，但在以下情况下应使用原始 API 调用：
- 不熟悉的场景
- 边缘情况
- 学习/调试
- 脚本未涵盖的操作

核心技能是调查方法和 API 知识，而不是脚本。