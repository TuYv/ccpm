---
name: windows-vm
description: Create, manage, or connect to a headless Windows 11 VM running in Docker with SSH access. Use when the user wants to spin up, stop, restart, or SSH into a Windows VM.
argument-hint: "[create|start|stop|restart|ssh|status]"
allowed-tools: Bash, Read, Write
---
# 无头 Windows 11 虚拟机

管理一个通过 Docker 中的 [dockur/windows](https://github.com/dockur/windows) 运行并启用 KVM 加速的无头 Windows 11 虚拟机。该虚拟机仅可通过 SSH 访问——无需 RDP 或 GUI。

## 主机前置条件

- Docker
- KVM 支持（必须存在 `/dev/kvm`——使用 `ls /dev/kvm` 检查）
- `sshpass`（`sudo apt install sshpass`）
- `imagemagick`（可选，用于截图调试：`sudo apt install imagemagick`）

## 配置

- **容器名称**：`windows11`
- **虚拟机目录**：`/home/jesse/windows-vm/`
  - `storage/`——虚拟机磁盘镜像（由 dockur 管理，重新创建时会被清除）
  - `iso/win11x64.iso`——缓存的 Windows ISO（7.3GB，重新创建后仍会保留）
  - `oem/install.bat`——安装后脚本（安装 OpenSSH Server）
- **凭据**：user / password
- **SSH**：`localhost:2222`（仅绑定到 127.0.0.1）
- **RDP**：`localhost:3389`（仅绑定到 127.0.0.1，作为备用方案）
- **Web 控制台**：`localhost:8006`（浏览器中的 VNC，用于调试）
- **资源**：8GB 内存、4 个 CPU 核心、64GB 磁盘

## 操作

### create——首次设置或完全重新创建

1. 确保目录存在：
   ```bash
   mkdir -p /home/jesse/windows-vm/oem /home/jesse/windows-vm/storage /home/jesse/windows-vm/iso
   ```

2. 确保 `/home/jesse/windows-vm/oem/install.bat` 存在并包含 OpenSSH 设置：
   ```bat
   @echo off
   echo Installing OpenSSH Server...
   powershell -Command "Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0" 2>nul
   powershell -Command "Get-WindowsCapability -Online -Name OpenSSH.Server* | Add-WindowsCapability -Online" 2>nul
   dism /Online /Add-Capability /CapabilityName:OpenSSH.Server~~~~0.0.1.0 2>nul
   powershell -Command "Start-Service sshd" 2>nul
   powershell -Command "Set-Service -Name sshd -StartupType Automatic"
   powershell -Command "New-ItemProperty -Path 'HKLM:\SOFTWARE\OpenSSH' -Name DefaultShell -Value 'C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe' -PropertyType String -Force"
   powershell -Command "New-NetFirewallRule -Name 'OpenSSH-Server' -DisplayName 'OpenSSH Server' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22"
   powershell -Command "Get-Service sshd" 2>nul
   echo Done.
   ```

3. 如果要重新创建，请删除旧容器和磁盘：
   ```bash
   docker stop windows11 && docker rm windows11
   rm -f /home/jesse/windows-vm/storage/data.img
   ```

4. 启动容器。分为两种情况：

   **如果缓存的 ISO 存在**（`/home/jesse/windows-vm/iso/win11x64.iso`）：
   ```bash
   docker run -d \
     --name windows11 \
     -p 127.0.0.1:3389:3389 \
     -p 127.0.0.1:2222:22 \
     -p 127.0.0.1:8006:8006 \
     -e RAM_SIZE="8G" \
     -e CPU_CORES="4" \
     -e DISK_SIZE="64G" \
     -e USERNAME="user" \
     -e PASSWORD="password" \
     --cap-add NET_ADMIN \
     --device /dev/kvm \
     -v /home/jesse/windows-vm/storage:/storage \
     -v /home/jesse/windows-vm/oem:/oem \
     -v /home/jesse/windows-vm/iso/win11x64.iso:/boot.iso \
     dockurr/windows
   ```

**首次运行（无缓存的 ISO）** — 省略 `/boot.iso` 挂载并添加 `VERSION`：
   ```bash
   docker run -d \
     --name windows11 \
     -p 127.0.0.1:3389:3389 \
     -p 127.0.0.1:2222:22 \
     -p 127.0.0.1:8006:8006 \
     -e RAM_SIZE="8G" \
     -e CPU_CORES="4" \
     -e DISK_SIZE="64G" \
     -e VERSION="win11" \
     -e USERNAME="user" \
     -e PASSWORD="password" \
     --cap-add NET_ADMIN \
     --device /dev/kvm \
     -v /home/jesse/windows-vm/storage:/storage \
     -v /home/jesse/windows-vm/oem:/oem \
     dockurr/windows
   ```
   ISO 下载完成且 Windows 启动后，请在容器停止之前**立即**将 ISO 复制出来（dockur 会在重新创建容器时清空 `/storage`）：
   ```bash
   cp /home/jesse/windows-vm/storage/win11x64.iso /home/jesse/windows-vm/iso/win11x64.iso
   ```

5. 等待 Windows 安装和 OpenSSH 设置完成。全新安装需要 **20-30 分钟**（OEM install.bat 会在 Windows OOBE 结束时运行，并从 Microsoft 下载 OpenSSH，这一过程较慢）。使用以下命令监控：
   ```bash
   docker logs -f windows11
   ```
   你也可以通过位于 `http://localhost:8006` 的 Web 控制台查看虚拟机屏幕
   （在另一台计算机上使用 `ssh -L 8006:localhost:8006 jesse@magic-kingdom` 建立隧道）。

   要检查 SSH 是否已启动：
   ```bash
   sshpass -p 'password' ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -p 2222 user@localhost "whoami"
   ```

6. SSH 开始响应后，通过 stdin 管道传入设置脚本来安装 Node.js 和 Claude Code
   （避免通过 SSH 处理 PowerShell 转义的麻烦）：
   ```bash
   cat << 'PS' | sshpass -p 'password' ssh -o StrictHostKeyChecking=no -p 2222 user@localhost "powershell -ExecutionPolicy Bypass -Command -"
   # Download and install Node.js silently
   Invoke-WebRequest -Uri 'https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi' -OutFile 'C:\Users\user\node-install.msi'
   Start-Process msiexec.exe -ArgumentList '/i C:\Users\user\node-install.msi /qn /norestart' -Wait -Verb RunAs
   Write-Host "Node.js installed"

   # Install Claude Code globally
   & 'C:\Program Files\nodejs\npm.cmd' install -g @anthropic-ai/claude-code
   Write-Host "Claude Code installed"

   # Add npm global bin and Git to SYSTEM PATH (user PATH is not read by sshd)
   $systemPath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
   $additions = @()
   if ($systemPath -notlike '*AppData*npm*') { $additions += 'C:\Users\user\AppData\Roaming\npm' }
   if ($systemPath -notlike '*Git\cmd*') { $additions += 'C:\Program Files\Git\cmd' }
   if ($additions.Count -gt 0) {
       [Environment]::SetEnvironmentVariable('Path', $systemPath + ';' + ($additions -join ';'), 'Machine')
       Write-Host "Added to system PATH: $($additions -join ', ')"
   }

   # Set git config
   git config --global user.name "Jesse Vincent"
   git config --global user.email "jesse@fsck.com"
   Write-Host "Git configured"

   # Set execution policy machine-wide (required for claude.ps1)
   Set-ExecutionPolicy RemoteSigned -Scope LocalMachine -Force -ErrorAction SilentlyContinue

   # Create system-wide PowerShell profile that rebuilds PATH from registry on login.
   # Without this, interactive SSH sessions don't pick up the full system PATH.
   $profileDir = Split-Path $PROFILE.AllUsersAllHosts
   if (-not (Test-Path $profileDir)) { New-Item -ItemType Directory -Path $profileDir -Force }
   @'
   $machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
   $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
   $env:Path = "$machinePath;$userPath"
   '@ | Set-Content -Path $PROFILE.AllUsersAllHosts -Force
   Write-Host "PowerShell profile created"

   # Restart sshd so it picks up the new PATH
   Restart-Service sshd -Force
   PS
   ```
   注意：sshd 重启时连接会中断——这是预期行为。

7. 清除过期的主机密钥（新虚拟机 = 新主机密钥）并验证：
   ```bash
   ssh-keygen -f ~/.ssh/known_hosts -R '[localhost]:2222'
   sshpass -p 'password' ssh -o StrictHostKeyChecking=no -p 2222 user@localhost "claude --version"
   ```

### start — 启动已停止的虚拟机
```bash
docker start windows11
```

### stop — 停止虚拟机
```bash
docker stop windows11
```

### restart — 重启虚拟机
```bash
docker restart windows11
```

### status — 检查虚拟机状态
```bash
docker ps -f name=windows11 --format "table {{.Status}}\t{{.Ports}}"
docker logs windows11 2>&1 | tail -5
```

### ssh — 连接到虚拟机
```bash
ssh -p 2222 user@localhost
```
通过 magic-kingdom 从另一台 tailnet 机器连接：
```bash
ssh -J jesse@magic-kingdom -p 2222 user@localhost
```

### screenshot — 查看虚拟机屏幕上的内容（用于调试）
```bash
docker exec windows11 bash -c "echo 'screendump /tmp/screen.ppm' | nc -w 2 localhost 7100" > /dev/null 2>&1
sleep 1
docker cp windows11:/tmp/screen.ppm /tmp/screen.ppm
convert /tmp/screen.ppm /tmp/screen.png
```

## 重要说明

- **ISO 缓存**：`/storage` 卷由 dockur 管理，并会在重新创建时被清空。请将 ISO 单独存储在 `/home/jesse/windows-vm/iso/` 中，并将其挂载为 `/boot.iso`，以避免下载 7.3GB 的文件。
- **`--cap-add NET_ADMIN`** 是端口转发正常工作所必需的。如果没有它，QEMU 会回退到用户模式网络，而端口转发会在不提示错误的情况下失败。
- **`--device /dev/kvm`** 是启用硬件加速所必需的。
- **启动时间**：全新安装需要 20–30 分钟（Windows 安装 + 从 Microsoft 下载 OpenSSH）。之后从现有 `data.img` 启动会很快（约 2 分钟）。
- 端口仅绑定到 `127.0.0.1`，不会暴露到网络。其他机器可通过 Tailscale SSH 隧道访问。
- 挂载 `/boot.iso` 时请勿使用 `-e VERSION="win11"`——系统会根据 ISO 自动检测版本。

## 安装后的注意事项

- **Node.js 未预安装**——Claude Code 安装脚本（`irm https://claude.ai/install.ps1 | iex`）会报告安装成功，但如果没有 Node，`claude` 将无法运行。请先通过 MSI 安装 Node.js。
- **npm 全局 bin 目录不在 PATH 中**——Node 的 MSI 会将 `C:\Program Files\nodejs` 添加到 PATH，但不会添加 `C:\Users\user\AppData\Roaming\npm`（`npm install -g` 会将二进制文件放在此处）。必须将其添加到**系统** PATH（而不是用户 PATH），因为 OpenSSH 的 sshd 仅读取系统 PATH。更改系统 PATH 后，请重启 sshd。
- **PowerShell 执行策略**——默认策略为 `Restricted`，会阻止 `claude.ps1`。必须在 **LocalMachine** 作用域（而不是 CurrentUser）将其设置为 `RemoteSigned`，才能在 SSH 会话中生效。
- **转义噩梦**——通过 SSH 运行带有嵌套引号的 PowerShell 命令并不可靠。应改用 `powershell -ExecutionPolicy Bypass -Command -`，通过 stdin 将脚本传入。
- **交互式 SSH 会话无法获得完整的 PATH**——Windows OpenSSH sshd 无法将系统 PATH 正确传递给交互式 PowerShell 会话。修复方法：创建一个系统范围的 PowerShell 配置文件（`$PROFILE.AllUsersAllHosts`），在每次登录时从注册表重建 `$env:Path`。
- **winget 可能无法工作**——Microsoft Store 证书在虚拟机中可能失效。请改用直接下载的 MSI/安装程序。
- **主机密钥会发生变化**——每个重新创建的虚拟机都会生成新的 SSH 主机密钥。运行 `ssh-keygen -R '[localhost]:2222'` 以清除旧密钥。