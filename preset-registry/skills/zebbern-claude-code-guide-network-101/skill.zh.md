---
name: Network 101
description: This skill should be used when the user asks to "set up a web server", "configure HTTP or HTTPS", "perform SNMP enumeration", "configure SMB shares", "test network services", or needs guidance on configuring and testing network services for penetration testing labs.
metadata:
  author: zebbern
  version: "1.1"
---
# 网络基础 101

## 目的

在渗透测试实验环境中配置并测试常见的网络服务（HTTP、HTTPS、SNMP、SMB）。支持针对配置正确的目标系统进行服务枚举、日志分析和安全测试的动手实践。

## 输入/前提条件

- 用于承载服务的 Windows Server 或 Linux 系统
- 用于测试的 Kali Linux 或类似系统
- 目标系统的管理员访问权限
- 基础网络知识（IP 寻址、端口）
- 用于端口配置的防火墙访问权限

## 输出/交付物

- 已配置的 HTTP/HTTPS Web 服务器
- 配置了可访问团体字符串的 SNMP 服务
- 具有不同权限级别的 SMB 文件共享
- 用于分析的已捕获日志
- 已记录的枚举结果

## 核心工作流程

### 1. 配置 HTTP 服务器（端口 80）

搭建用于测试的基础 HTTP Web 服务器：

**Windows IIS 设置：**
1. 打开 IIS 管理器（Internet Information Services）
2. 右键点击 Sites → Add Website
3. 配置站点名称和物理路径
4. 绑定到 IP 地址和端口 80

**Linux Apache 设置：**

```bash
# Install Apache
sudo apt update && sudo apt install apache2

# Start service
sudo systemctl start apache2
sudo systemctl enable apache2

# Create test page
echo "<html><body><h1>Test Page</h1></body></html>" | sudo tee /var/www/html/index.html

# Verify service
curl http://localhost
```

**为 HTTP 配置防火墙：**

```bash
# Linux (UFW)
sudo ufw allow 80/tcp

# Windows PowerShell
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
```

### 2. 配置 HTTPS 服务器（端口 443）

使用 SSL/TLS 搭建安全的 HTTPS：

**生成自签名证书：**

```bash
# Linux - Generate certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/apache-selfsigned.key \
  -out /etc/ssl/certs/apache-selfsigned.crt

# Enable SSL module
sudo a2enmod ssl
sudo systemctl restart apache2
```

**为 HTTPS 配置 Apache：**

```bash
# Edit SSL virtual host
sudo nano /etc/apache2/sites-available/default-ssl.conf

# Enable site
sudo a2ensite default-ssl
sudo systemctl reload apache2
```

**验证 HTTPS 设置：**

```bash
# Check port 443 is open
nmap -p 443 192.168.1.1

# Test SSL connection
openssl s_client -connect 192.168.1.1:443

# Check certificate
curl -kv https://192.168.1.1
```

### 3. 配置 SNMP 服务（端口 161）

为枚举练习搭建 SNMP：

**Linux SNMP 设置：**

```bash
# Install SNMP daemon
sudo apt install snmpd snmp

# Configure community strings
sudo nano /etc/snmp/snmpd.conf

# Add these lines:
# rocommunity public
# rwcommunity private

# Restart service
sudo systemctl restart snmpd
```

**Windows SNMP 设置：**
1. 打开 Server Manager → Add Features
2. 选择 SNMP Service
3. 在 Services → SNMP Service → Properties 中配置团体字符串

**SNMP 枚举命令：**

```bash
# Basic SNMP walk
snmpwalk -c public -v1 192.168.1.1

# Enumerate system info
snmpwalk -c public -v1 192.168.1.1 1.3.6.1.2.1.1

# Get running processes
snmpwalk -c public -v1 192.168.1.1 1.3.6.1.2.1.25.4.2.1.2

# SNMP check tool
snmp-check 192.168.1.1 -c public

# Brute force community strings
onesixtyone -c /usr/share/seclists/Discovery/SNMP/common-snmp-community-strings.txt 192.168.1.1
```

### 4. 配置 SMB 服务（端口 445）

为枚举搭建 SMB 文件共享：

**Windows SMB 共享：**
1. 创建要共享的文件夹
2. 右键点击 → Properties → Sharing → Advanced Sharing
3. 启用共享并设置权限
4. 配置 NTFS 权限

**Linux Samba 设置：**

```bash
# Install Samba
sudo apt install samba

# Create share directory
sudo mkdir -p /srv/samba/share
sudo chmod 777 /srv/samba/share

# Configure Samba
sudo nano /etc/samba/smb.conf

# Add share:
# [public]
#    path = /srv/samba/share
#    browsable = yes
#    guest ok = yes
#    read only = no

# Restart service
sudo systemctl restart smbd
```

**SMB 枚举命令：**

```bash
# List shares anonymously
smbclient -L //192.168.1.1 -N

# Connect to share
smbclient //192.168.1.1/share -N

# Enumerate with smbmap
smbmap -H 192.168.1.1

# Full enumeration
enum4linux -a 192.168.1.1

# Check for vulnerabilities
nmap --script smb-vuln* 192.168.1.1
```

### 5. 分析服务日志

查看日志以进行安全分析：

**HTTP/HTTPS 日志：**

```bash
# Apache access log
sudo tail -f /var/log/apache2/access.log

# Apache error log
sudo tail -f /var/log/apache2/error.log

# Windows IIS logs
# Location: C:\inetpub\logs\LogFiles\W3SVC1\
```

**解析日志以查找凭据：**

```bash
# Search for POST requests
grep "POST" /var/log/apache2/access.log

# Extract user agents
awk '{print $12}' /var/log/apache2/access.log | sort | uniq -c
```

## 快速参考

### 关键端口

| 服务 | 端口 | 协议 |
|---------|------|----------|
| HTTP | 80 | TCP |
| HTTPS | 443 | TCP |
| SNMP | 161 | UDP |
| SMB | 445 | TCP |
| NetBIOS | 137-139 | TCP/UDP |

### 服务验证命令

```bash
# Check HTTP
curl -I http://target

# Check HTTPS
curl -kI https://target

# Check SNMP
snmpwalk -c public -v1 target

# Check SMB
smbclient -L //target -N
```

### 常用枚举工具

| 工具 | 用途 |
|------|---------|
| nmap | 端口扫描与脚本 |
| nikto | Web 漏洞扫描 |
| snmpwalk | SNMP 枚举 |
| enum4linux | SMB/NetBIOS 枚举 |
| smbclient | SMB 连接 |
| gobuster | 目录暴力破解 |

## 约束条件

- 自签名证书会触发浏览器警告
- SNMP v1/v2c 的团体字符串以明文形式传输
- SMB 匿名访问通常默认被禁用
- 防火墙规则必须允许入站连接
- 实验环境应与生产环境隔离

## 示例

### 示例 1：完整的 HTTP 实验环境搭建

```bash
# Install and configure
sudo apt install apache2
sudo systemctl start apache2

# Create login page
cat << 'EOF' | sudo tee /var/www/html/login.html
<html>
<body>
<form method="POST" action="login.php">
Username: <input type="text" name="user"><br>
Password: <input type="password" name="pass"><br>
<input type="submit" value="Login">
</form>
</body>
</html>
EOF

# Allow through firewall
sudo ufw allow 80/tcp
```

### 示例 2：SNMP 测试环境搭建

```bash
# Quick SNMP configuration
sudo apt install snmpd
echo "rocommunity public" | sudo tee -a /etc/snmp/snmpd.conf
sudo systemctl restart snmpd

# Test enumeration
snmpwalk -c public -v1 localhost
```

### 示例 3：SMB 匿名访问

```bash
# Configure anonymous share
sudo apt install samba
sudo mkdir /srv/samba/anonymous
sudo chmod 777 /srv/samba/anonymous

# Test access
smbclient //localhost/anonymous -N
```

## 故障排除

| 问题 | 解决方案 |
|-------|----------|
| 端口无法访问 | 检查防火墙规则（ufw、iptables、Windows 防火墙） |
| 服务无法启动 | 使用 `journalctl -u service-name` 检查日志 |
| SNMP 超时 | 验证 UDP 161 端口是否开放，检查团体字符串 |
| SMB 访问被拒绝 | 验证共享权限和用户凭据 |
| HTTPS 证书错误 | 接受自签名证书或将其添加到受信任存储区 |
| 无法远程连接 | 将服务绑定到 0.0.0.0 而非 localhost |
