---
name: terraform-skill
description: >
  Operational traps for Terraform provisioners, multi-environment isolation, and
  zero-to-deployment reliability. Use when writing null_resource / remote-exec /
  local-exec / file provisioners, setting up fresh instances with cloud-init, or any
  IaC code that SSHs into remote hosts; when creating multi-environment Terraform
  setups (DNS record duplication, snapshot cross-contamination); or when debugging
  containers that are Restarting/unhealthy after terraform apply. Also when the user
  mentions terraform plan/apply errors, provisioner failures, infrastructure drift,
  TLS certificate errors, Cloudflare credential format, or Caddy/gateway / Caddyfile /
  compose configuration.
---
# Terraform 运维陷阱

真实部署中的故障模式。每一项都曾引发事故。组织形式为：**确切错误 → 根本原因 → 可复制粘贴的修复方案**。

## Provisioner 陷阱（症状 → 修复）

### `remote-exec` 中出现 `docker: not found`

当 provisioner 通过 SSH 连接时，cloud-init 仍在安装 Docker。

```hcl
provisioner "remote-exec" {
  inline = [
    "cloud-init status --wait || true",
    "which docker || { echo 'FATAL: Docker not ready'; exit 1; }",
  ]
}
```

### `local-exec` 中出现 `rsync: connection unexpectedly closed`

Terraform 保持其 SSH 连接处于打开状态；local-exec rsync 会打开第二个连接，而该连接会被拒绝。绝不要使用 local-exec 向远程主机传输文件。请使用 tarball + file provisioner：

```hcl
provisioner "local-exec" {
  command = "tar czf /tmp/src.tar.gz --exclude=node_modules --exclude=.git -C ${path.module}/../../.. myproject"
}
provisioner "file" {
  source      = "/tmp/src.tar.gz"
  destination = "/tmp/src.tar.gz"
}
provisioner "remote-exec" {
  inline = ["tar xzf /tmp/src.tar.gz -C /data/ && rm -f /tmp/src.tar.gz"]
}
```

macOS BSD tar：`--exclude` 必须放在源参数之前。

### `cloud-init status` 永远显示 "running"

`apt-get -y` 不会抑制 debconf 对话框。`iptables-persistent` 等软件包会阻塞在 TTY 提示上。

```yaml
- |
    echo iptables-persistent iptables-persistent/autosave_v4 boolean true | debconf-set-selections
    echo iptables-persistent iptables-persistent/autosave_v6 boolean true | debconf-set-selections
    DEBIAN_FRONTEND=noninteractive apt-get install -y iptables-persistent
```

已知会导致此问题的软件包：`iptables-persistent`、`postfix`、`mysql-server`、`wireshark-common`。

### 容器日志中出现 `EACCES: permission denied`，容器处于 Restarting 状态

主机卷目录归 root 所有；容器以非 root 用户（uid 1001）运行。在执行 `docker compose up` 之前修复：

```bash
mkdir -p /data/myapp/data /data/myapp/logs
chown -R 1001:1001 /data/myapp/data /data/myapp/logs
```

查找 UID：在 Dockerfile 中 grep `adduser.*-u` 或 `USER`。

### Provisioner 失败但没有诊断输出

`set -e` 会在第一个错误处退出，从而隐藏后续的 `docker logs` 输出。使用不带 `-e` 的 `set -u`，并在末尾设置一个验证关卡：

```hcl
provisioner "remote-exec" {
  inline = [
    "set -u",
    "docker compose up -d",
    "sleep 15",
    "docker logs myapp --tail 20 2>&1 || true",
    "docker ps --format 'table {{.Names}}\\t{{.Status}}' || true",
    "docker ps --filter name=myapp --format '{{.Status}}' | grep -q healthy || exit 1",
  ]
}
```

### 容器处于 `Restarting` 状态——缺少数据库表

Provisioner 中未包含数据库迁移。PostgreSQL `docker-entrypoint-initdb.d` 仅在数据目录为空时运行。显式创建数据库并运行迁移：

```bash
# After postgres healthy:
docker exec pg psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname='mydb'" | grep -q 1 \
  || docker exec pg psql -U postgres -c "CREATE DATABASE mydb;"

# Idempotent migrations:
for f in migrations/*.sql; do
  VER=$(basename $f)
  APPLIED=$($PSQL -tAc "SELECT 1 FROM schema_migrations WHERE version='$VER'" | tr -d ' ')
  [ "$APPLIED" = "1" ] && continue
  { echo 'BEGIN;'; cat $f; echo 'COMMIT;'; } | $PSQL
  $PSQL -tAc "INSERT INTO schema_migrations(version) VALUES ('$VER') ON CONFLICT DO NOTHING"
done
```

### `docker compose build` 会忽略环境变量覆盖

Compose 从 `.env` 文件而非 shell 环境中读取构建参数。`VAR=x docker compose build` 不起作用。

```bash
# WRONG
DOCKER_WITH_PROXY_MODE=disabled docker compose build

# RIGHT
grep -q DOCKER_WITH_PROXY_MODE .env || echo 'DOCKER_WITH_PROXY_MODE=disabled' >> .env
docker compose build
```

### TLS 握手失败：`Invalid format for Authorization header`

Caddy DNS-01 ACME 需要 Cloudflare **API Token**（以 `cfut_` 开头、长度为 40 个以上字符、使用 Bearer 认证）。使用 **Global API Key**（37 个十六进制字符、使用 X-Auth-Key 认证）会导致 `HTTP 400 Code:6003`。生产环境可能看起来工作正常，因为其中缓存了证书；全新环境在首次请求证书时会失败。

```bash
# Verify token format before deploy:
TOKEN=$(grep CLOUDFLARE_API_TOKEN .env | cut -d= -f2)
echo "$TOKEN" | grep -q "^cfut_" || echo "FATAL: needs API Token, not Global Key"
```

通过 API 创建作用域受限的令牌：
```bash
curl -s "https://api.cloudflare.com/client/v4/user/tokens" -X POST \
  -H "X-Auth-Email: $CF_EMAIL" -H "X-Auth-Key: $CF_GLOBAL_KEY" \
  -d '{"name":"caddy-dns-acme","policies":[{"effect":"allow",
    "resources":{"com.cloudflare.api.account.zone.<ZONE_ID>":"*"},
    "permission_groups":[
      {"id":"4755a26eedb94da69e1066d98aa820be","name":"DNS Write"},
      {"id":"c8fed203ed3043cba015a93ad1616f1f","name":"Zone Read"}]}]}'
```

### TLS 在暂存环境中失败，但在生产环境中正常——域名被硬编码

Caddyfile 或 compose 中包含字面量域名。暂存环境的 Caddy 加载了生产环境配置，并尝试为不属于它的域名获取证书 → ACME 失败。

**Caddyfile**：使用 `{$VAR}`——Caddy 在启动时计算环境变量。
```caddy
# WRONG
example.com { tls { dns cloudflare {env.CLOUDFLARE_API_TOKEN} } }

# RIGHT
{$LOBEHUB_DOMAIN} { tls { dns cloudflare {env.CLOUDFLARE_API_TOKEN} } }
```

**Compose**：使用 `${VAR:?required}`——如果未设置，则快速失败。
```yaml
# WRONG
- APP_URL=https://example.com

# RIGHT
- APP_URL=${APP_URL:?APP_URL is required}
```

将环境变量传递给网关容器，以便 Caddy 可以读取它：
```yaml
environment:
  - LOBEHUB_DOMAIN=${LOBEHUB_DOMAIN:?LOBEHUB_DOMAIN is required}
  - CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN:?required for DNS-01 TLS}
```

### OAuth 登录失败：`Social sign in failed`

Casdoor 的 `init_data.json` 包含硬编码的重定向 URI。`--createDatabase=true` 仅在首次创建数据库时应用 init_data，而不会在重启时应用。通过预配器中的 SQL 修复：

```bash
# Replace production domain with staging in existing Casdoor DB
$PSQL -c "UPDATE application SET redirect_uris = REPLACE(redirect_uris,
  'example.com', 'staging.example.com')
  WHERE name='lobechat'
  AND redirect_uris LIKE '%example.com%'
  AND redirect_uris NOT LIKE '%staging.example.com%';"
```

还要检查 `AUTH_CASDOOR_ISSUER`——它必须与 Casdoor 子域名（`auth.staging.example.com`）匹配，而不是应用的根域名。

## 多环境隔离

创建第二个环境之前，请在 `.tf` 文件中使用 grep 检查硬编码的名称。完整矩阵请参阅 [references/multi-env-isolation.md](references/multi-env-isolation.md)。

**应用时必然失败**（全局唯一）：

| 资源 | 作用域 | 修复方式 |
|---|---|---|
| SSH 密钥对 | 区域 | `"${env}-deploy"` |
| SLS 日志项目 | 账户 | `"${env}-logs"` |
| CloudMonitor 联系人 | 账户 | `"${env}-ops"` |

**DNS 重复陷阱**：两个环境在同一个 Cloudflare 区域中为相同名称创建 A 记录 → 两个相互独立的记录 ID → DNS 轮询 → 约 50% 的流量被发送到错误的实例。修复方式：使用子域名隔离（`staging.example.com`）或独立的区域。请记得为 Caddy 提供服务的所有子域名创建 DNS 记录（例如 `auth.staging`、`minio.staging`）。

**快照交叉污染**：未经过滤的 `data "alicloud_ecs_snapshots"` 会返回账户中的所有快照。新环境继承旧的 100GB 快照，导致创建 40GB 磁盘失败。使用变量进行控制：

```hcl
locals {
  latest_snapshot_id = var.enable_snapshot_recovery && length(local.available_snapshots) > 0
    ? local.available_snapshots[0].snapshot_id : null
}
```

不要向数据源添加 `count`——这会更改其状态地址并导致漂移。

## 部署前验证

在执行 `terraform apply` **之前**运行验证脚本，以便在本地发现配置错误。这样可以消除部署→发现→修复→重新部署的循环。

关键检查项（参见 [references/pre-deploy-validation.md](references/pre-deploy-validation.md)）：
1. `terraform validate`——语法
2. Caddyfile 或 compose 文件中没有硬编码的域名
3. 必需的环境变量已设置（`LOBEHUB_DOMAIN`、`CLAUDE4DEV_DOMAIN`、`CLOUDFLARE_API_TOKEN`、`APP_URL` 等）
4. Cloudflare API Token 格式正确（而非 Global API Key）
5. Caddy 提供服务的所有域名都存在 DNS 记录
6. Casdoor 颁发者 URL 与 `auth.*` 子域名匹配
7. SSH 私钥存在

集成到 Makefile 中：在执行 `make apply` 前运行 `make pre-deploy ENV=staging`。

## 从零开始部署

全新磁盘会暴露所有隐式依赖项。参见 [references/zero-to-deploy-checklist.md](references/zero-to-deploy-checklist.md)。

会导致全新实例上的 provisioner 失败的关键项：
1. **目录**：在 cloud-init 中执行 `mkdir -p /data/{svc1,svc2}`——如果目标目录不存在，`file` provisioner 会失败
2. **数据库**：显式执行 `CREATE DATABASE`——PG 初始化脚本只会在数据目录为空时运行
3. **迁移**：在 `schema_migrations` 表中进行跟踪，并以幂等方式应用
4. **Provisioner 顺序**：在共享 Docker 网络的资源之间设置 `depends_on`
5. **内存**：在小型实例（≤8GB）上进行 Docker 构建期间，停止非关键容器
6. **域名参数化**：Caddyfile/compose 中的每个域名都必须使用 `{$VAR}` / `${VAR:?required}`
7. **凭据格式**：Caddy 需要 API Token（`cfut_`），而不是 Global API Key