---
name: dotnet-devcert-trust
description: Diagnose and fix .NET HTTPS dev certificate trust issues on Linux. Covers the full certificate lifecycle from generation to system CA bundle inclusion, with distro-specific guidance for Ubuntu, Fedora, Arch, and WSL2.
invocable: false
---
# Linux 上的 .NET 开发证书信任

## 何时使用此 Skill

在以下情况下使用此 Skill：
- Aspire 中的 Redis TLS 连接因 `UntrustedRoot` 或 `RemoteCertificateNameMismatch` 而失败
- `dotnet dev-certs https --check --trust` 返回退出代码 7
- HTTPS localhost 连接因证书验证错误而失败
- 运行 `dotnet dev-certs https --clean` 后需要恢复信任
- 为 .NET HTTPS 开发设置新的 Linux 开发机器
- Aspire 仪表板或服务间 gRPC 调用因 TLS 错误而失败
- 从 Aspire < 13.1.0 升级（该版本默认未对 Redis 使用 TLS）

## 问题所在

在 Windows 和 macOS 上，`dotnet dev-certs https --trust` 会自动处理所有事情——它会生成证书，将其安装到用户存储区，并将其添加到系统信任存储区。在 Linux 上，**它几乎不会执行任何有用的操作**。该命令会生成证书并将其放入用户存储区，但是：

1. 它**不会**将证书导出到系统 CA 目录
2. 它**不会**运行 `update-ca-certificates` 来重新构建 CA 捆绑包
3. 它**不会**将证书添加到浏览器信任存储区（NSS/NSSDB）
4. `--trust` 标志会静默成功，但证书仍不受信任

这意味着 .NET 应用程序、OpenSSL、curl 和浏览器都会拒绝该开发证书——即使 `dotnet dev-certs https --check` 报告该证书已存在。

### 为什么 Aspire 13.1.0+ 会暴露此问题

在 Aspire 13.1.0 之前，Redis 连接使用明文。从 13.1.0 开始，Aspire 默认在 Redis 上启用 TLS。如果你的开发证书在系统级别不受信任，Redis 连接会立即失败，并显示：

```
System.Security.Authentication.AuthenticationException:
  The remote certificate is invalid because of errors in the certificate chain: UntrustedRoot
```

## Linux 证书信任的工作原理

理解其架构可以避免照搬式调试：

```
┌─────────────────────────────────────────────────────┐
│ Application (.NET, curl, OpenSSL)                   │
│   reads: /etc/ssl/certs/ca-certificates.crt         │
│          (consolidated CA bundle)                    │
└──────────────────────┬──────────────────────────────┘
                       │ built by
┌──────────────────────▼──────────────────────────────┐
│ update-ca-certificates                              │
│   reads from:                                        │
│     /usr/share/ca-certificates/      (distro CAs)   │
│     /usr/local/share/ca-certificates/ (local CAs)   │
│   writes to:                                         │
│     /etc/ssl/certs/ca-certificates.crt (bundle)     │
│     /etc/ssl/certs/*.pem (individual symlinks)      │
└─────────────────────────────────────────────────────┘
```

**关键要点：** 将 `.crt` 文件放入 `/usr/local/share/ca-certificates/` 是必要的，但**还不够**。必须运行 `update-ca-certificates` 来重新构建位于 `/etc/ssl/certs/ca-certificates.crt` 的整合捆绑包。应用程序读取的是该捆绑包，而不是单独的文件。

## 5 点诊断流程

按顺序运行这些检查。在遇到第一个 FAIL 时停止，应用其修复方案后再继续。

### 检查 1：开发证书是否存在

```bash
dotnet dev-certs https --check
echo "Exit code: $?"
```

| 退出代码 | 含义 | 操作 |
|-----------|---------|--------|
| 0 | 用户存储中存在证书 | PASS — 继续 |
| 非零 | 没有有效的开发证书 | 运行 `dotnet dev-certs https` |

### 检查 2：系统信任存储区 — 单个证书、权限正确

```bash
ls -la /usr/local/share/ca-certificates/ | grep -iE 'dotnet|aspnet'
```

| 结果 | 含义 |
|--------|---------|
| 仅有权限为 `-rw-r--r--`（644）的 `dotnet-dev-cert.crt` | PASS |
| 存在多个证书文件、权限错误或过期的 `aspnet*` 文件 | FAIL |

**之前会话遗留的常见过期文件：**

| 文件 | 问题 |
|------|---------|
| `aspnetcore-dev.crt` | 通常以 `0600` 权限创建（`update-ca-certificates` 无法读取） |
| `aspnet/https.crt` | 旧约定，其指纹可能与当前开发证书不同 |
| 权限为 `0600` 的 `dotnet-dev-cert.crt` | 名称正确，但权限错误 |

**修复：**
```bash
# Remove ALL stale cert files
sudo rm -f /usr/local/share/ca-certificates/aspnetcore-dev.crt
sudo rm -rf /usr/local/share/ca-certificates/aspnet/

# Ensure correct permissions on the dev cert (if it exists)
sudo chmod 644 /usr/local/share/ca-certificates/dotnet-dev-cert.crt
```

### 检查 3：是否包含在 CA 捆绑包中

这是最常失败的检查。证书文件虽已存在，但从未添加到捆绑包中。

```bash
openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt \
  /usr/local/share/ca-certificates/dotnet-dev-cert.crt
```

| 结果 | 含义 |
|--------|---------|
| `dotnet-dev-cert.crt: OK` | PASS — 证书已包含在整合后的捆绑包中 |
| `error 20 at 0 depth lookup: unable to get local issuer certificate` | FAIL — 捆绑包从未重新构建 |
| `error 2 at 0 depth lookup: unable to get issuer certificate` | FAIL — 问题相同，但 OpenSSL 版本不同 |

**修复：**
```bash
sudo update-ca-certificates
# Expected output includes "1 added" or similar

# Re-verify
openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt \
  /usr/local/share/ca-certificates/dotnet-dev-cert.crt
```

### 检查 4：环境变量覆盖

SSL 环境变量可能会将证书查找重定向到系统捆绑包之外：

```bash
echo "SSL_CERT_DIR=${SSL_CERT_DIR:-<unset>}"
echo "SSL_CERT_FILE=${SSL_CERT_FILE:-<unset>}"
echo "DOTNET_SSL_CERT_DIR=${DOTNET_SSL_CERT_DIR:-<unset>}"
echo "DOTNET_SYSTEM_NET_HTTP_USESOCKETSHTTPHANDLER=${DOTNET_SYSTEM_NET_HTTP_USESOCKETSHTTPHANDLER:-<unset>}"
```

| 结果 | 含义 |
|--------|---------|
| 全部为 `<unset>` | PASS |
| 设置了任意变量 | FAIL — 可能会重定向证书查找 |

**修复：** 从 shell 配置文件（`~/.bashrc`、`~/.zshrc`、`~/.profile`）中移除有问题的变量，然后启动一个新的 shell。

### 检查 5：符号链接完整性

之前已移除证书所遗留的过期符号链接可能会干扰 OpenSSL：

```bash
find /etc/ssl/certs/ -xtype l 2>/dev/null | head -5
```

| 结果 | 含义 |
|--------|---------|
| 无输出 | 通过 |
| 列出了损坏的符号链接 | 失败 |

**修复方法：**
```bash
sudo update-ca-certificates --fresh
# Rebuilds ALL symlinks from scratch
```

## 完整恢复流程

当多项检查失败，或者你希望从干净状态重新开始时，请运行以下完整流程：

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "=== .NET Dev Certificate Trust Recovery ==="

# Step 1: Remove ALL stale certificate files
echo "--- Removing stale certificate files ---"
sudo rm -f /usr/local/share/ca-certificates/aspnetcore-dev.crt
sudo rm -rf /usr/local/share/ca-certificates/aspnet/
sudo rm -f /usr/local/share/ca-certificates/dotnet-dev-cert.crt

# Step 2: Clean and regenerate dev cert
echo "--- Regenerating dev certificate ---"
dotnet dev-certs https --clean
dotnet dev-certs https

# Step 3: Export as PEM and install to system trust store
echo "--- Installing to system trust store ---"
dotnet dev-certs https --export-path /tmp/dotnet-dev-cert.crt --format PEM --no-password
sudo cp /tmp/dotnet-dev-cert.crt /usr/local/share/ca-certificates/dotnet-dev-cert.crt
sudo chmod 644 /usr/local/share/ca-certificates/dotnet-dev-cert.crt
rm /tmp/dotnet-dev-cert.crt

# Step 4: Rebuild CA bundle (CRITICAL — most commonly missed step)
echo "--- Rebuilding CA bundle ---"
sudo update-ca-certificates

# Step 5: Verify
echo "--- Verifying ---"
openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt \
  /usr/local/share/ca-certificates/dotnet-dev-cert.crt

echo "=== Done! Restart your .NET application. ==="
```

将其保存为 `~/fix-devcert.sh`，并在需要时使用 `bash ~/fix-devcert.sh` 运行。

## 发行版特定说明

### Ubuntu / Debian

上述流程针对 Ubuntu/Debian 编写，可直接使用。

- **CA 目录：** `/usr/local/share/ca-certificates/`
- **证书包命令：** `sudo update-ca-certificates`
- **证书包输出：** `/etc/ssl/certs/ca-certificates.crt`
- **证书格式：** 必须使用扩展名为 `.crt` 的 PEM 格式

### Fedora / RHEL / CentOS

Fedora 使用 `update-ca-trust`，而不是 `update-ca-certificates`：

```bash
# Export cert
dotnet dev-certs https --export-path /tmp/dotnet-dev-cert.pem --format PEM --no-password

# Install to Fedora trust store (different directory!)
sudo cp /tmp/dotnet-dev-cert.pem /etc/pki/ca-trust/source/anchors/dotnet-dev-cert.pem
sudo chmod 644 /etc/pki/ca-trust/source/anchors/dotnet-dev-cert.pem
rm /tmp/dotnet-dev-cert.pem

# Rebuild trust bundle
sudo update-ca-trust

# Verify
openssl verify /etc/pki/ca-trust/source/anchors/dotnet-dev-cert.pem
```

**主要区别：**
| | Ubuntu/Debian | Fedora/RHEL |
|--|---------------|-------------|
| CA 目录 | `/usr/local/share/ca-certificates/` | `/etc/pki/ca-trust/source/anchors/` |
| 重建命令 | `update-ca-certificates` | `update-ca-trust` |
| 证书包路径 | `/etc/ssl/certs/ca-certificates.crt` | `/etc/pki/tls/certs/ca-bundle.crt` |
| 扩展名 | `.crt` | `.pem`（任何扩展名均可） |

### Arch Linux

Arch 使用与 Fedora 相同的 `update-ca-trust` 方法：

```bash
sudo cp /tmp/dotnet-dev-cert.pem /etc/ca-certificates/trust-source/anchors/dotnet-dev-cert.pem
sudo chmod 644 /etc/ca-certificates/trust-source/anchors/dotnet-dev-cert.pem
sudo update-ca-trust
```

### WSL2

WSL2 运行真正的 Linux 内核，并拥有自己的证书存储——与 Windows 主机相互独立。标准的 Ubuntu/Debian 操作流程同样适用，但需要注意：

1. **共享文件系统（`/mnt/c/`）**——Windows 文件系统中的证书文件具有 Windows 权限，可能不是 644。务必先将其复制到原生 Linux 路径。
2. **systemd 未运行**——一些较旧的 WSL2 环境没有 systemd，而 `update-ca-certificates` 的钩子可能依赖它。如果命令卡住，请改用 `sudo dpkg-reconfigure ca-certificates`。
3. **Docker Desktop 集成**——如果使用 Docker Desktop 的 WSL2 后端，容器会继承 WSL2 发行版的 CA 证书包。因此，修复 WSL2 中的信任问题也会同时修复容器中的问题。

## Aspire 特定注意事项

### Redis TLS（Aspire 13.1.0+）

Aspire 13.1.0 默认在 Redis 上启用 TLS。如果在 Redis 连接错误中看到：

```
UntrustedRoot
```

则说明开发证书未在系统级别受到信任。请执行上文所述的完整恢复流程。

### Aspire 仪表板 HTTPS

Aspire 仪表板使用开发证书提供 HTTPS。如果浏览器中的仪表板显示证书警告，则说明该证书不在浏览器的信任存储中。在开发环境中，可以选择忽略警告并继续访问——系统级信任（Redis、gRPC 等所需要的信任）才是首要事项。

### ASPIRE_ALLOW_UNSECURED_TRANSPORT

设置 `ASPIRE_ALLOW_UNSECURED_TRANSPORT=true` 是一种**临时变通方法**，而不是修复方案。它会禁用服务间通信的 TLS，这会：

- 掩盖底层的信任问题
- 与生产环境的行为不一致
- 可能导致与生产环境中不同的错误

应改为修复证书信任问题。

## 证书生命周期

开发证书自创建之日起有效期为 1 年。过期后：

1. `dotnet dev-certs https --check` 将报告没有有效证书
2. 执行完整恢复流程以生成新证书
3. `/usr/local/share/ca-certificates/` 中的旧证书文件将被替换
4. `update-ca-certificates` 会在证书包中将旧证书替换为新证书

**无需重启系统。**应用程序会在下一次 TLS 握手时加载新的证书包（请重启你的应用程序）。

## 自动化：CI/CD 流水线

在 Linux 运行器上的 CI/CD 环境中，通常很少需要开发证书（一般会使用真实证书进行测试，或在测试框架中禁用 TLS 验证）。但是，如果集成测试需要受信任的开发证书：

### GitHub Actions

```yaml
- name: Trust .NET Dev Certificate
  run: |
    dotnet dev-certs https
    dotnet dev-certs https --export-path /tmp/dotnet-dev-cert.crt --format PEM --no-password
    sudo cp /tmp/dotnet-dev-cert.crt /usr/local/share/ca-certificates/dotnet-dev-cert.crt
    sudo chmod 644 /usr/local/share/ca-certificates/dotnet-dev-cert.crt
    rm /tmp/dotnet-dev-cert.crt
    sudo update-ca-certificates
```

### Azure DevOps

```yaml
- script: |
    dotnet dev-certs https
    dotnet dev-certs https --export-path /tmp/dotnet-dev-cert.crt --format PEM --no-password
    sudo cp /tmp/dotnet-dev-cert.crt /usr/local/share/ca-certificates/dotnet-dev-cert.crt
    sudo chmod 644 /usr/local/share/ca-certificates/dotnet-dev-cert.crt
    rm /tmp/dotnet-dev-cert.crt
    sudo update-ca-certificates
  displayName: 'Trust .NET Dev Certificate'
```

## 常见陷阱

### 1. 已放置证书，但从未重新构建证书包

**症状：** 证书文件存在于 `/usr/local/share/ca-certificates/` 中，但 `openssl verify` 验证失败。

**原因：** 放置文件后从未运行 `update-ca-certificates`。

**修复：** `sudo update-ca-certificates`

这是最常见的错误。CA 目录是证书包生成流程的**输入**，而不是证书包本身。

### 2. 权限错误的过期证书文件

**症状：** `update-ca-certificates` 可以运行，但报告 `0 added`。

**原因：** 权限为 `0600` 的证书文件无法被 `update-ca-certificates` 读取（它以 root 身份运行，但会通过一个可能检查所有用户是否可读的进程来读取文件）。文件权限必须为 `644`。

**修复：** `sudo chmod 644 /usr/local/share/ca-certificates/*.crt`

### 3. 来自不同会话的多个证书文件

**症状：** `update-ca-certificates` 添加了多个证书，但应用程序仍然失败。

**原因：** 之前执行 `dotnet dev-certs https --clean` / 重新生成循环时留下的旧证书文件仍然存在于 CA 目录中。旧证书的指纹与当前开发证书不匹配。

**修复：** 删除所有 `dotnet*` 和 `aspnet*` 文件，然后重新导出当前证书。

### 4. 清理/重新生成后指纹不匹配

**症状：** `openssl verify` 验证通过，但 .NET 仍然报告 `UntrustedRoot`。

**原因：** `/usr/local/share/ca-certificates/` 中的证书是从**之前的**开发证书导出的。执行 `dotnet dev-certs https --clean && dotnet dev-certs https` 后，生成了一个指纹不同的**新**证书。系统信任的是旧证书，而不是新证书。

**修复：** 重新导出并安装：
```bash
dotnet dev-certs https --export-path /tmp/dotnet-dev-cert.crt --format PEM --no-password
sudo cp /tmp/dotnet-dev-cert.crt /usr/local/share/ca-certificates/dotnet-dev-cert.crt
sudo update-ca-certificates
```

### 5. 使用 --trust 并假定它已生效

**症状：** `dotnet dev-certs https --trust` 返回退出代码 0，但实际上没有任何证书受到信任。

**原因：** 在 Linux 上，`--trust` 会尝试将证书添加到 OpenSSL 信任存储区，但**不会调用 `update-ca-certificates`**。从 dotnet 的角度来看，该操作“成功”了，但证书包仍未发生变化。

**修复：** 不要在 Linux 上依赖 `--trust`。请遵循此技能中的手动操作流程。

## 快速参考

```bash
# Generate dev cert (if missing)
dotnet dev-certs https

# Export as PEM
dotnet dev-certs https --export-path /tmp/dotnet-dev-cert.crt --format PEM --no-password

# Install to system trust (Ubuntu/Debian)
sudo cp /tmp/dotnet-dev-cert.crt /usr/local/share/ca-certificates/dotnet-dev-cert.crt
sudo chmod 644 /usr/local/share/ca-certificates/dotnet-dev-cert.crt
sudo update-ca-certificates

# Verify trust
openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt \
  /usr/local/share/ca-certificates/dotnet-dev-cert.crt

# Check cert details
openssl x509 -in /usr/local/share/ca-certificates/dotnet-dev-cert.crt -noout -subject -dates -fingerprint

# Nuclear option: full clean + rebuild
dotnet dev-certs https --clean && dotnet dev-certs https
```

## 相关技能

- `dotnet-skills:aspire-configuration` — Aspire AppHost 配置，包括 TLS 设置
- `dotnet-skills:aspire-service-defaults` — 服务默认配置，包括 HTTPS 配置