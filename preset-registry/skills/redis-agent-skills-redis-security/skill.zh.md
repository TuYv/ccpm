---
name: redis-security
description: Redis security guidance covering authentication (requirepass and ACL users), TLS, ACL-based least-privilege access control, restricting network exposure via bind and protected-mode, firewall rules, and disabling dangerous commands. Use when deploying Redis to production, defining ACL users for an application, configuring TLS connections, locking down a Redis instance behind a firewall, or auditing a Redis deployment for security hardening.
license: MIT
metadata:
  author: Redis, Inc.
  version: "0.1.0"
---
# Redis 安全

针对 Redis 的生产环境加固：身份验证、基于 ACL 的访问控制以及网络暴露面。三者必须同时覆盖——任何一项单独缺失都会留下可被利用的漏洞。

## 何时应用

- 部署或审查即将投入生产环境的 Redis 实例。
- 在共享密码之外为应用程序配置专属凭据。
- 依照安全清单审计 Redis 部署。
- 收到扫描器报告的「Redis 暴露于互联网」的问题。

## 1. 始终启用身份验证（并使用 TLS）

绝不运行没有密码的生产环境 Redis。将身份验证与 TLS 配合使用，确保凭据和数据不会以明文传输。

```
# redis.conf
requirepass your-strong-password
tls-port 6380
tls-cert-file /path/to/redis.crt
tls-key-file  /path/to/redis.key
```

```python
r = redis.Redis(
    host="localhost",
    port=6380,
    password="your-strong-password",
    ssl=True,
    ssl_cert_reqs="required",
)
```

如果可以使用 ACL 用户（见下一节）来替代单一的 `requirepass`，就这么做——`requirepass` 实际上是旧式的『默认用户』快捷方式。

参见 [references/auth.md](references/auth.md)。

## 2. 用 ACL 实现最小权限访问

使用共享密码的 `default` 用户在开发阶段没有问题。但在生产环境中，应为每个应用分配一个专用的 ACL 用户，且只授予它实际需要的命令和键模式。

```
# Cache-only reader
ACL SETUSER app_readonly on >password ~cache:* +get +mget +scan

# Writer that can't run dangerous ops
ACL SETUSER app_writer   on >password ~*        +@all -@dangerous

# Admin (use sparingly, never for application traffic)
ACL SETUSER admin        on >strong-password ~* +@all
```

常用的命令类别：

| 类别 | 涵盖内容 |
|---|---|
| `@read` | 读命令（`GET`、`MGET`、`HGET` 等） |
| `@write` | 写命令（`SET`、`DEL`、`XADD` 等） |
| `@dangerous` | `FLUSHALL`、`DEBUG`、`KEYS` 等 |
| `@admin` | 管理类命令 |

一旦应用凭据泄露，严格的 ACL 可以限制爆炸半径——攻击者不会仅仅因为拿到了缓存只读账号的密码，就能对你的数据库执行 `FLUSHALL`。

参见 [references/acls.md](references/acls.md)。

## 3. 限制网络访问

最常见的 Redis 入侵事件，就是未经身份验证的 Redis 直接暴露在公网上。通过以下三层防护来避免这种情况：

```
# redis.conf — bind to specific interfaces, keep protected-mode on
bind 127.0.0.1 192.168.1.100
protected-mode yes
```

```bash
# Firewall — allow only application subnets
iptables -A INPUT -p tcp --dport 6379 -s 192.168.1.0/24 -j ACCEPT
iptables -A INPUT -p tcp --dport 6379 -j DROP
```

反模式：`bind 0.0.0.0` + `protected-mode no`——会让 Redis 在毫无防护的情况下暴露给整个网络。

可选但推荐：重命名或禁用破坏性命令，防止被攻陷的客户端毁掉数据库：

```
rename-command FLUSHALL ""
rename-command DEBUG ""
rename-command CONFIG ""
```

参见 [references/network.md](references/network.md)。

## 参考资源

- [Redis: Security](https://redis.io/docs/latest/operate/oss_and_stack/management/security/)
- [Redis: ACL](https://redis.io/docs/latest/operate/oss_and_stack/management/security/acl/)
