---
name: tunnel-doctor
description: >
  Diagnoses and fixes conflicts between Tailscale and proxy/VPN tools (Shadowrocket,
  Clash, Surge, OrbStack/Docker) on macOS — route hijacking, HTTP proxy env vars,
  system proxy bypass, SSH ProxyCommand double-tunneling, VM/container proxy
  propagation, and stalled macOS DNS resolution. Use when Tailscale ping works but
  SSH/HTTP times out, browser returns 503 but curl works, git push fails with "failed
  to begin relaying via HTTP", Docker pull/build times out behind TUN/VPN, setting up
  Tailscale SSH to WSL, bootstrapping remote dev over Tailscale, ssh/curl/git hang ~60s
  before resolving a hostname while nslookup returns instantly, ping to a resolver IP
  works but dig to the same IP times out, ssh -vvv freezes at "debug2: resolving"
  without reaching "debug1: connect", or raw probes give impossibly-fast results under
  a TUN proxy (nc -z 0.00s, sub-ms ping to overseas nodes, or an IP-geo lookup
  reporting the proxy exit instead of your real home/ISP — the TUN fabricates locally).
allowed-tools: Read, Grep, Edit, Bash
---
# 隧道诊断器

诊断并修复 macOS 上 Tailscale 与代理/VPN 工具共存时产生的冲突，并提供针对通过 SSH 访问 WSL 实例的具体指导。

> **方法论基础：** 此技能所依托的通用诊断准则——证据优先于假设、证伪优先于证实、分层隔离、反向审查——位于 **debugging-network-issues** 技能中。此技能是在该基础之上的 macOS Tailscale⨯代理*领域*层；当症状*不是*已知的 Tailscale/代理冲突时，请使用基础技能。

## 五个冲突层

macOS 上的代理/VPN 工具会在五个相互独立的层面产生冲突。第 1-3 层影响 Tailscale 连接；第 4 层影响 SSH git 操作；第 5 层影响虚拟机/容器运行时：

| 层 | 出现故障的部分 | 仍然正常的部分 | 根本原因 |
|-------|-------------|------------------|------------|
| 1. 路由表 | 所有功能（SSH、curl、浏览器） | `tailscale ping` | `tun-excluded-routes` 添加了覆盖 Tailscale utun 的 `en0` 路由 |
| 2. HTTP 环境变量 | `curl`、Python requests、Node.js fetch | SSH、浏览器 | 设置了 `http_proxy`，但未针对 Tailscale 设置 `NO_PROXY` |
| 3. 系统代理（浏览器） | 仅浏览器（HTTP 503） | SSH、`curl`（使用或不使用代理均可） | 浏览器使用 VPN 系统代理；DIRECT 规则通过 Wi-Fi 而非 Tailscale utun 路由 |
| 4. SSH ProxyCommand 双重隧道 | `git push/pull`（间歇性失败） | `ssh -T`（少量数据） | `connect -H` 创建了与 Shadowrocket TUN 重复的 HTTP CONNECT 隧道；落地代理会丢弃大流量或长连接传输 |
| 5. 虚拟机/容器代理传播 | `docker pull`、`docker build` | 主机上的 `curl`、正在运行的容器 | 虚拟机运行时（OrbStack/Docker Desktop）会自动注入或缓存代理配置；移除代理反而会使情况恶化（虚拟机流量通过 TUN → TLS 超时） |

## 诊断工作流

### 第 1 步：识别症状

确定符合以下哪种场景：

- **浏览器返回 HTTP 503，但 `curl` 和 SSH 均正常工作** → 系统代理绕过冲突（第 2C 步）
- **`local.<domain>` 在浏览器/默认 `curl` 中失败，但直连/无代理请求正常** → 本地域名代理拦截（第 2C-1 步）
- **Tailscale ping 正常、SSH 正常，但 curl/HTTP 超时** → HTTP 代理环境变量冲突（第 2A 步）
- **Tailscale ping 正常，但 SSH/TCP 超时** → 路由冲突（第 2B 步）
- **远程开发服务器的身份验证重定向到 `localhost` → 浏览器无法继续访问** → 需要 SSH 隧道（第 2D 步）
- **`make status` / 脚本通过 curl 访问 localhost 时因代理而失败** → localhost 代理拦截（第 2E 步）
- **`git push/pull` 失败并显示 `FATAL: failed to begin relaying via HTTP`** → SSH 双重隧道（第 2F 步）
- **`docker build` 中的 `RUN apk/apt` 立即失败并显示 `Connection refused`** → OrbStack 透明代理与 TUN 冲突（第 2G-1 步，修复方法：`--network host`）
- **`docker pull` 失败并显示 `TLS handshake timeout`** → 虚拟机代理配置错误（第 2G-2 步，修复方法：包含 `host.internal` 的 `docker.json`）
- **容器健康检查显示 `(unhealthy)`，但应用运行正常** → 小写代理环境变量泄漏（第 2G-4 步，修复方法：清除 `http_proxy`+`HTTP_PROXY`）
- **`docker build` 无法获取基础镜像** → 虚拟机/容器代理传播（第 2G 步）
- **`git clone` 失败并显示 `Connection closed by 198.18.x.x`** → TUN 对 SSH 的 DNS 劫持（第 2H 步）
- **SSH 可以连接，但显示 `operation not permitted`** → Tailscale SSH 配置问题（第 4 步）
- **SSH 可以连接，但 `be-child ssh` 以代码 1 退出** → WSL snap 沙盒问题（第 5 步）
- **TCP 端口 22 可达（`nc -z` 成功），但 SSH 失败并显示 `kex_exchange_identification: Connection closed`** → WSL 上的 Tailscale SSH 代理拦截（第 5A 步）
- **`tailscale ssh` 返回 "not available on App Store builds"** → macOS 上安装了错误的 Tailscale 发行版本（第 5B 步）
- **任何使用系统 DNS 的工具（`ssh`、`curl`、`git`）在解析前都会卡住约 60 秒，但 `nslookup` 会立即返回结果** → `getaddrinfo` 链中存在停滞的解析器（第 2I 步）

**关键区别**：
- SSH 不使用 `http_proxy`/`NO_PROXY` 环境变量。如果 SSH 正常但 HTTP 不正常 → 第 2 层。
- `curl` 使用 `http_proxy` 环境变量，而不是系统代理。浏览器使用系统代理（由 VPN 设置）。如果 `curl` 正常但浏览器不正常 → 第 3 层。
- 如果 `tailscale ping` 正常但普通 `ping` 不正常 → 第 1 层（路由表损坏）。
- 如果 `ssh -T git@github.com` 正常但 `git push` 间歇性失败 → 第 4 层（双重隧道）。
- 如果主机上的 `curl https://...` 正常但 `docker pull` 超时 → 第 5 层（虚拟机代理传递）。
- 如果 `docker pull` 正常，但 `docker build` 中的 `RUN apk add` 立即失败并显示 `Connection refused` → OrbStack 透明代理被 TUN 破坏（步骤 2G-1）。
- 如果容器健康检查显示 `(unhealthy)` 但应用正常工作 → 小写的 `http_proxy` 泄漏到了容器中（步骤 2G-4）。
- 如果 DNS 解析到 `198.18.x.x` 虚拟 IP → TUN DNS 劫持（步骤 2H）。
- 如果 `nc -z` 在 22 端口上成功，但 SSH 收不到 banner（`kex_exchange_identification`）→ Tailscale SSH 代理拦截（步骤 5A）。在远程端使用 `tcpdump -i any port 22` 进行确认——0 个数据包意味着 Tailscale 在内核上层实施了拦截。
- 如果 `tailscale ssh` 失败并显示 "not available on App Store builds" → 安装独立版 Tailscale（步骤 5B）。
- 如果 `nslookup <host>` 很快（<0.1s），但 `dscacheutil -q host -a name <host>` 耗时 60 秒以上 → `scutil --dns` 中的某个补充解析器已失效（步骤 2I）。
- 如果 `ping <resolver-ip>` 成功，但 `dig @<resolver-ip>` 超时 → 守护进程已失效，`utun` 接口处于僵死状态。ICMP 由该接口应答；实际的 53 端口服务已经消失（步骤 2I）。
- 如果 `ssh -vvv` 在 `debug2: resolving "<host>" port <port>` 之后立即卡住，并且始终没有到达 `debug1: connect to address` → 问题出在 DNS 解析阶段，而不是网络连接阶段。这属于步骤 2I，而不是步骤 2B/2H。

### 诊断准则（在确定假设之前阅读）

当症状指向某个组件（代理、VPN、路由表、DNS）时，**不要根据间接证据就确定假设——应先使用该组件自身的健康检查端点进行验证。** 每个组件都有一条单行健康检查命令，这比逐一排除相邻组件更快，也更可靠：

| 疑似组件 | 权威健康检查（首先运行此项） |
|---------------------|---------------------------------------------|
| HTTP 代理（Shadowrocket / Clash / Surge） | `curl -x http://127.0.0.1:<port> -m 10 https://api.github.com` 返回 200 |
| Tailscale 守护进程 | `tailscale status` 返回对等节点列表（而不是连接错误） |
| 特定的 DNS 解析器 | `dig @<nameserver-ip> +tries=1 +timeout=3 example.com` <100ms |
| 某个 IP 的路由 | `route -n get <ip>` 显示预期接口 |
| 逐解析器二分排查（怀疑 DNS 时） | 步骤 2I 中的 `for ns in ...; do dig @$ns ...` 循环 |

**这为何重要**：症状与步骤 2X 的描述相符，本身并不能证明组件 X 就是问题所在。多个层级可能产生相互重叠的症状（例如，`git push` 卡住 60 秒，可能是代理节点失效、fakeip 路由损坏或 DNS 解析器阻塞——仅从用户可见的症状来看，这些原因都说得通）。首先采用最具针对性的验证方法，可以避免误判问题层级并沿着错误方向排查到底。

如果失败的操作涉及任何 DNS 问题，**请先运行步骤 2I 中的逐名称服务器二分排查，再怀疑代理或路由问题**。它能在 15 秒内判定或排除 macOS 在中国网络环境下最大的一类故障。

### TUN 测量污染（启用 TUN 代理时，你的探测结果会如何说谎）

当代理工具以 **TUN / 全局模式**运行时（Shadowrocket、Clash、Surge），它会在路由层拦截流量，并在本地伪造部分网络栈行为。此时，一些常用的诊断命令会返回**伪造或错误路由产生的数值**——相信这些结果会让整个排查方向走偏。请了解在 TUN 模式下，每种探测实际测量的是什么：

| 探测方式 | 表面现象 | TUN 模式下的实际情况 | 是否可信？ |
|-------|-------------------|-------------------------------|--------|
| `nc -z <node-ip> <port>` / 原始 TCP 连接显示 `0.00s` | “节点可达，瞬间连通” | TUN 会先在**本地**完成 TCP 握手，然后再通过隧道传输。连接海外主机只需 `0.00s` 在物理上不可能（仅光信号单程就需要数十毫秒）——你连接的是 TUN，而不是节点。 | ❌ |
| `ping <host>` 显示近乎零丢包 / 亚毫秒级 RTT | “链路健康” | TUN 可以在本地响应 ICMP；丢包率和 RTT 都是伪造的，与 TCP 无关。（另外：即使没有 TUN，ICMP 也不等同于 TCP。） | ❌ |
| `curl … -w '%{remote_ip}'` | “已连接到对端 X” | 显示的始终是本地 TUN 端点（`127.0.0.1` / 环回地址），绝不会是真实的远程对端。 | ❌ |
| 通过**境外**服务（类似 `ip-api` 的端点）查询 IP 地理位置 | “我的出口 / 家庭 IP 是……” | 对境外域名的请求会**通过代理**路由，因此报告的是**代理出口 IP**，而不是你真实的本地 / 家庭 IP。 | ❌，不适用于判断“我的真实本地 IP 是什么” |
| IPv4 与 IPv6 路径选择对比、HTTP/3 / QUIC 加速效果 | 情况不一 | TUN 通常不会转发 UDP/443，因此 QUIC 流量根本无法发出。这种比较没有意义。 | ❌ |

**在 TUN 模式下可以信任的内容：**
- 来自 `curl` 的 **`time_appconnect` / `time_starttransfer`**（应用层握手时间 / TTFB）——这些过程只有在隧道连接真正建立后才会完成，因此反映了真实的端到端路径。
- 使用**区域内 / 境内 IP 地理位置数据源**判断“我的真实本地 ISP 是什么”——访问区域内域名会命中代理的 DIRECT 规则，并通过你的真实最后一公里链路出口访问（境外数据源会经由隧道访问并给出误导性结果；参见上表）。
- **从磁盘中解码得到的代理 / TUN 配置，以及工具自身的 GUI**——这是判断当前实际启用了哪个节点 / 路由的权威来源。请将文件解析结果与 GUI 交叉核对；不要根据网络探测推断当前活动节点。

**应对方法**：在 TUN 启用期间引用任何延迟 / 可达性数据之前，先问自己：*“如果数据包真的传输到了目的地，这个数值在物理上可能吗？”* 连接另一大洲却显示 `0.00s`，或 `ping` 延迟只有 `0.2ms`，都表明你测量的是 TUN，而不是网络。请改用 `time_appconnect`，或暂时禁用 TUN 以获得干净的基线数据（关闭 TUN 后，原始探测结果才会重新变得有意义）。

### 快速路径：运行自动检查

对于常见的 macOS 冲突（环境变量代理、系统代理例外、直连/代理路径分流、本地 TLS 信任），运行：

```bash
python3 scripts/quick_diagnose.py --host local.example.com --url https://local.example.com/health
```

针对 Tailscale 目标的可选路由归属检查：

```bash
python3 scripts/quick_diagnose.py --host <target-host> --url http://<target-host>:<port>/health --tailscale-ip <100.x.x.x>
```

结果解读：
- `direct=PASS` + `forced_proxy=FAIL` = 该主机必须绕过代理（`skip-proxy` + `NO_PROXY`）。
- `strict_tls=FAIL` + `direct=PASS` = 路径可达；仅存在信任问题（安装/信任本地 CA）。
- `host in scutil exceptions: no` = 浏览器/系统客户端很可能仍在使用代理。

### 步骤 2A：修复 HTTP 代理环境变量

检查代理环境变量是否正在拦截 Tailscale HTTP 流量：

```bash
env | grep -i proxy
```

**错误输出** — 已设置代理，但 `NO_PROXY` 未排除 Tailscale：
```
http_proxy=http://127.0.0.1:1082
https_proxy=http://127.0.0.1:1082
NO_PROXY=localhost,127.0.0.1          ← Missing Tailscale!
```

**修复方法** — 将 Tailscale MagicDNS 域名和 CIDR 添加到 `NO_PROXY`：

```bash
export NO_PROXY=localhost,127.0.0.1,.ts.net,100.64.0.0/10,192.168.*,10.*,172.16.*
```

| 条目 | 覆盖范围 | 原因 |
|-------|--------|-----|
| `.ts.net` | MagicDNS 域名（`host.tailnet.ts.net`） | 在 DNS 解析之前匹配 |
| `100.64.0.0/10` | Tailscale IP（`100.64.*` – `100.127.*`） | 精确的 CIDR，不会误匹配公共 IP |
| `192.168.*,10.*,172.16.*` | RFC 1918 私有网络 | 局域网流量绝不应经过代理 |

**这两层相互补充**：`.ts.net` 处理基于域名的访问，`100.64.0.0/10` 处理直接通过 IP 的访问。

**NO_PROXY 语法陷阱** — 有关兼容性矩阵，请参阅 [references/proxy_conflict_reference.md](references/proxy_conflict_reference.md)。

**Go `net/http` 的 CIDR 注意事项**：Go 的标准 `net/http` 不支持在 `NO_PROXY` 中使用 CIDR 表示法。设置 `NO_PROXY=100.64.0.0/10` 对 curl 和 Python 有效，但 Go 程序（包括与 Tailscale 相关的工具）仍会通过代理发送流量。修复方法是使用 MagicDNS 主机名（例如 `workstation-4090-wsl`）而不是原始 IP，或者将明确的主机名添加到 `NO_PROXY`：

```bash
# WRONG for Go programs — CIDR is silently ignored
NO_PROXY=100.64.0.0/10 go-program http://100.101.102.103:8002/health  # → goes through proxy

# CORRECT — use hostname (matched as suffix) or explicit IP
export NO_PROXY=localhost,127.0.0.1,.ts.net,workstation-4090-wsl,100.101.102.103,192.168.*,10.*,172.16.*
```

从基于 Go 的工具（例如自定义 CLI、访问远程 API 的 Go 测试套件）访问 Tailscale 服务时，这一点尤其重要。

验证修复结果：

```bash
# Both must return HTTP 200:
NO_PROXY="...(new value)..." curl -s --connect-timeout 5 http://<host>.ts.net:<port>/health -w "HTTP %{http_code}\n"
NO_PROXY="...(new value)..." curl -s --connect-timeout 5 http://<tailscale-ip>:<port>/health -w "HTTP %{http_code}\n"
```

然后将其持久化到 shell 配置（`~/.zshrc` 或 `~/.bashrc`）中。

### 步骤 2B：检测路由冲突

检查代理工具是否劫持了 Tailscale 的 CGNAT 地址范围：

```bash
route -n get <tailscale-ip>
```

**正常输出** — 流量通过 Tailscale 接口：
```
destination: 100.64.0.0
interface: utun7    # Tailscale interface (utunN varies)
```

**异常输出** — 代理劫持了路由：
```
destination: 100.64.0.0
gateway: 192.168.x.1    # Default gateway
interface: en0           # Physical interface, NOT Tailscale
```

**重要提示**：并非所有 `utun` 接口都属于 Tailscale。在断定路由正确之前，请确认哪个 utun 属于 Tailscale：

```bash
# Find Tailscale's utun interface (has a 100.x.x.x IP)
ifconfig | grep -A2 'inet 100\.'
```

根据 MTU 快速判断：
- **MTU 1280** → 通常是 Tailscale
- **MTU 4064** → 通常是 Shadowrocket TUN

如果 `route -n get` 显示流量流向 MTU 为 4064 的 utun，则流量进入的是 Shadowrocket 的 TUN，而不是 Tailscale——即使接口名称以 `utun` 开头，这仍然属于路由冲突。

通过完整路由表进行确认：

```bash
netstat -rn | grep 100.64
```

存在两条相互竞争的路由即表示发生冲突：
```
100.64/10  192.168.x.1   UGSc  en0       ← Proxy added this (wins)
100.64/10  link#N        UCSI  utun7     ← Tailscale route (loses)
```

**根本原因**：在 macOS 上，对于前缀长度相同的路由，`UGSc`（静态网关）的优先级高于 `UCSI`（克隆的静态接口）。

### 步骤 2C：修复系统代理绕过问题（浏览器 503）

**症状**：浏览器访问 `http://<tailscale-ip>:<port>` 时显示 HTTP 503，但 `curl --noproxy '*'` 和 `curl`（使用代理环境变量）均返回 200。SSH 也能正常工作。

**根本原因**：浏览器使用由 VPN 配置文件（Shadowrocket/Clash/Surge）配置的系统代理。该代理匹配 `IP-CIDR,100.64.0.0/10,DIRECT` 并尝试直接连接——但这里的“直接”意味着通过 Wi-Fi 接口（en0），而不是通过 Tailscale 的 utun 接口。代理进程本身没有通往 Tailscale IP 的路由，因此连接失败并返回 503。

**诊断**：

```bash
# curl with proxy env var works (curl connects to proxy port, but traffic flows differently)
curl -s -o /dev/null -w "%{http_code}" http://<tailscale-ip>:<port>/
# → 200

# Browser gets 503 because it goes through the VPN system proxy, not http_proxy env var
```

**修复方法**——将 Tailscale CGNAT 地址范围添加到代理工具配置的 `skip-proxy` 中：

对于 Shadowrocket，在 `[General]` 中添加：
```
skip-proxy = 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, 100.64.0.0/10, localhost, *.local, captive.apple.com
```

`skip-proxy` 告诉系统“对于这些地址，完全绕过代理”。随后，浏览器会通过操作系统网络栈直接连接，由 Tailscale 的路由表正确处理流量。

**为什么 `skip-proxy` 有效，而 `tun-excluded-routes` 无效**：
- `skip-proxy`：仅绕过 HTTP 代理层。流量仍然通过 TUN 接口，由 Tailscale utun 处理。安全。
- `tun-excluded-routes`：将该 CIDR 完全从 TUN 路由中移除。这会创建一条相互竞争的 `en0` 路由，并覆盖 Tailscale。导致所有连接中断。

#### 步骤 2C-1：修复本地自定义域名被代理拦截的问题（`local.<domain>`）

**症状**：`https://local.<domain>` 无法在浏览器或默认 `curl` 中访问，但使用直连/无代理命令时可以成功：

```bash
env -u http_proxy -u https_proxy curl -k -I https://local.<domain>/health
# -> 200
curl -I https://local.<domain>/health
# -> proxy CONNECT then TLS reset/failure
```

**根本原因**：该域名经由系统/终端代理路由，而不是走本地直连路径。

**修复方法**：
1. 将域名添加到代理应用的绕过列表中（Shadowrocket 对应 `skip-proxy`）。
2. 将域名添加到终端的代理绕过列表中（`NO_PROXY`/`no_proxy`）。
3. 如果本地 TLS 使用内部 CA，请信任本地根证书。

```bash
# ~/.zshrc
export NO_PROXY=localhost,127.0.0.1,.ts.net,100.64.0.0/10,192.168.*,10.*,172.16.*,local.<domain>,www.local.<domain>
export no_proxy="$NO_PROXY"
```

**验证**：

```bash
python3 scripts/quick_diagnose.py --host local.<domain> --url https://local.<domain>/health
```

预期结果：
- `host in NO_PROXY: yes`
- `host in scutil exceptions: yes`
- `ambient=PASS` 和 `direct=PASS`

### 步骤 2D：修复远程开发环境中的身份验证重定向问题（SSH 隧道）

**症状**：开发服务器运行在远程计算机上（例如通过 Tailscale 连接的 Mac Mini）。你在浏览器中访问 `http://<tailscale-ip>:3010`。登录/注册可以正常进行，但身份验证完成后，应用会重定向到 `http://localhost:3010/`，导致访问失败——你本机的 `localhost` 并未运行开发服务器。

**根本原因**：应用的 `APP_URL`（或等效配置）被设置为 `http://localhost:3010`。身份验证库（Better-Auth、NextAuth 等）使用此 URL 进行回调重定向。将 `APP_URL` 更改为 Tailscale IP 会引发 Shadowrocket 代理冲突，并破坏远程计算机上的本地开发环境。

**修复方法**——使用 SSH 本地端口转发。这样可以完全避开所有三层冲突：

```bash
# Forward local port 3010 to remote machine's localhost:3010
ssh -NL 3010:localhost:3010 <tailscale-ip>

# Or with autossh for auto-reconnect (recommended for long sessions)
autossh -M 0 -f -N -L 3010:localhost:3010 \
    -o "ServerAliveInterval=30" \
    -o "ServerAliveCountMax=3" \
    -o "ExitOnForwardFailure=yes" \
    <tailscale-ip>
```

现在，在浏览器中访问 `http://localhost:3010`。身份验证重定向到 `localhost:3010` → 隧道 → 远程开发服务器 → 正常工作。

**为什么这是最佳方案**：
- 无需更改 `.env`——`APP_URL=http://localhost:3010` 在所有环境中都能正常工作
- 不会与 Shadowrocket 冲突——`localhost` 始终位于 `skip-proxy` 中
- 无需更改代码——行为与本地开发相同
- 行业标准——VS Code Remote SSH、GitHub Codespaces 都使用相同的模式

**安装 autossh**：`brew install autossh`（macOS）或 `apt install autossh`（Linux）

**终止后台隧道**：`pkill -f 'autossh.*<tailscale-ip>'`

### 步骤 2E：修复脚本中的 localhost 代理拦截问题

**症状**：当终端中全局设置了 `http_proxy` 时，使用 `curl` 访问 localhost 的 Makefile 目标或脚本（健康检查、预热路由）会失败或超时。

**根本原因**：`~/.zshrc` 中设置了 `http_proxy=http://127.0.0.1:1082`，但 `no_proxy` 未包含 `localhost`。所有 curl 命令都会通过代理发送 localhost 请求。

**修复方法** — 在脚本中所有访问 localhost 的 curl 命令里添加 `--noproxy localhost`：

```makefile
# WRONG — fails when http_proxy is set
@curl -sf http://localhost:9000/minio/health/live && echo "OK"

# CORRECT — always bypasses proxy for localhost
@curl --noproxy localhost -sf http://localhost:9000/minio/health/live && echo "OK"
```

或者，在 `~/.zshrc` 中全局设置 `no_proxy`：

```bash
export no_proxy=localhost,127.0.0.1
```

### 步骤 2F：修复 SSH ProxyCommand 双重隧道问题（git push/pull 失败）

**症状**：`ssh -T git@github.com` 始终能够成功，但 `git push` 或 `git pull` 会间歇性失败，并显示：

```
FATAL: failed to begin relaying via HTTP.
Connection closed by UNKNOWN port 65535
```

小型操作（身份验证、获取元数据）可以正常工作；大型数据传输则会失败。

**根本原因**：Shadowrocket TUN 启用时，已经会通过其 VPN 隧道路由所有 TCP 流量。如果 SSH 配置还使用 `ProxyCommand connect -H`，数据就会流经两层代理——落地代理会丢弃大型或长时间保持的 HTTP CONNECT 连接。

**诊断方法**：

```bash
# 1. Confirm Shadowrocket TUN is active
ifconfig | grep '^utun'

# 2. Check SSH config for ProxyCommand
grep -A5 'Host github.com' ~/.ssh/config

# 3. Confirm: removing ProxyCommand fixes push
GIT_SSH_COMMAND="ssh -o ProxyCommand=none" git push origin main
```

**修复方法** — 移除 ProxyCommand 并切换到 `ssh.github.com:443`。有关完整的 SSH 配置、端口 443 有效的原因，以及 VPN 关闭时的备用方案，请参阅 [references/proxy_conflict_reference.md § SSH ProxyCommand 与 Git 操作](references/proxy_conflict_reference.md)。

### 步骤 2G：修复虚拟机/容器运行时的代理传播问题（Docker pull/build 失败）

**症状**：`docker pull` 或 `docker build` 失败，并显示 `net/http: TLS handshake timeout`、来自 Alpine/Debian 仓库的 `Connection refused`，或来自 `auth.docker.io` 的 `Internal Server Error`，而宿主机上的 `curl` 访问相同 URL 时工作正常。

**适用范围**：在启用了 Shadowrocket/Clash TUN 的 macOS 上运行的 OrbStack、Docker Desktop 或任何基于虚拟机的 Docker 运行时。

**根本原因**：基于虚拟机的 Docker 运行时（OrbStack、Docker Desktop）会在轻量级虚拟机中运行 Docker 守护进程。虚拟机出站流量采用的网络路径与宿主机进程不同：

```
Host process (curl):   Process → TUN (Shadowrocket) → landing proxy → internet ✅
VM process (Docker):   Docker daemon → VM bridge → host network → TUN → ??? ❌
```

TUN 可以正确处理源自宿主机的流量，但可能会丢弃或延迟通过虚拟机桥接的流量（其 TCP 栈、MTU 和保活行为不同）。

**关键区别：`docker pull` 与 `docker build` 使用不同的代理路径**：

| 操作 | 代理来源 | 控制方式 |
|-----------|-------------|------------------|
| `docker pull` | Docker 守护进程配置 | `~/.orbstack/config/docker.json` 或 `docker info` |
| `docker build`（`RUN apt/apk`） | 构建容器环境 | `--build-arg http_proxy=...` 或 `--network host` |
| `docker run` | 容器环境 | `-e http_proxy=...` 或从守护进程继承 |

仅修复 `docker.json` 并不能修复 `docker build`——构建容器内的 `RUN` 命令不会继承守护进程的代理设置。

**诊断**——确定属于哪个子问题：

```bash
# 1. Can the Docker daemon pull images?
docker pull --quiet alpine:latest 2>&1

# 2. Can a RUN command inside a build reach the internet?
docker build --no-cache - <<'EOF' 2>&1
FROM alpine:latest
RUN apk update && echo "APK OK"
EOF

# 3. Can a running container reach the internet?
docker run --rm alpine:latest sh -c "apk update 2>&1 | head -3"
```

**四个子问题及其修复方法**：

#### 2G-1：`docker build` 失败，但主机网络正常（使用 OrbStack + Shadowrocket 时最常见）

**症状**：`docker build` 内的 `RUN apk add` 或 `RUN apt-get install` 会立即（< 0.2s）失败并显示 `Connection refused`，即使主机上的 `curl` 可以正常访问同一 URL。

**根本原因**：OrbStack 的 `network_proxy: auto` 会在虚拟机内创建透明代理，拦截所有 HTTPS 流量。当 Shadowrocket TUN 也处于启用状态时，透明代理的上游连接会中断——它会将 HTTPS 重定向到虚拟机内的 `127.0.0.1`，但该地址上没有任何服务在监听。

**诊断**：

```bash
# Verify: inside the container, HTTPS goes to 127.0.0.1 (broken transparent proxy)
docker run --rm alpine:latest sh -c "wget -q --timeout=5 -O /dev/null https://dl-cdn.alpinelinux.org/ 2>&1"
# → "wget: can't connect to remote host (127.0.0.1): Connection refused"
#                                        ^^^^^^^^^^^^ This is the smoking gun

# Verify: --network host bypasses the VM bridge and works
docker run --rm --network host alpine:latest sh -c "apk update 2>&1 | head -3"
# → "v3.23.x ... OK: 27431 distinct packages available"  ← Works!
```

**修复方法**——为 docker build 使用 `--network host`：

```bash
docker build --network host -f Dockerfile -t myimage .
```

这会完全绕过 OrbStack 的虚拟机网络桥接。构建容器会直接使用主机的网络栈，而 Shadowrocket TUN 可以在其中正确处理流量。

**权衡**：`--network host` 会禁用构建时的网络隔离。对于 CI/CD，应优先修复代理配置（2G-2）。对于本地开发，`--network host` 是一种务实的修复方法。

**永久修复**——如果你的所有构建都需要此设置，请将其添加到 `~/.docker/daemon.json`，或使用 shell 别名：

```bash
# Shell alias (add to ~/.zshrc)
alias docker-build='docker build --network host'
```

#### 2G-2：OrbStack 自动检测并缓存代理配置

OrbStack 的 `network_proxy: auto` 会从 shell 环境中读取 `http_proxy`，并配置 Docker 守护进程。该配置存储在 `~/.orbstack/config/docker.json` 中。

**关键行为**：
- `network_proxy: auto`——OrbStack 读取主机环境变量，并在虚拟机中创建透明代理
- `network_proxy: none`——禁用透明代理，但虚拟机桥接流量仍会通过 TUN 路由（可能超时）
- `docker.json`——控制 `docker pull` 的代理，而不控制 `docker build` 的 RUN 命令

**诊断**：

```bash
# Check all three layers
echo "=== OrbStack config ==="
orbctl config get network_proxy

echo "=== docker.json (daemon proxy) ==="
cat ~/.orbstack/config/docker.json

echo "=== Docker info (effective proxy) ==="
docker info | grep -iE "proxy|No Proxy"
```

**修复方法** — 使用 `host.internal` 配置 `docker.json`（OrbStack 会将其解析为宿主机 IP）：

```bash
python3 -c "
import json, os
config = {
    'proxies': {
        'http-proxy': 'http://host.internal:1082',
        'https-proxy': 'http://host.internal:1082',
        'no-proxy': 'localhost,127.0.0.1,::1,192.168.128.0/24,100.64.0.0/10,host.internal,*.local'
    }
}
path = os.path.expanduser('~/.orbstack/config/docker.json')
json.dump(config, open(path, 'w'), indent=2)
print('Written:', path)
"

# Full restart required
orbctl stop && sleep 3 && orbctl start
```

**重要提示**：使用 `host.internal`（OrbStack 专用），不要使用 `127.0.0.1`（指向虚拟机回环地址），也不要使用 `host.docker.internal`（在某些上下文中可能无法解析）。

**为什么不能移除代理**：当 TUN 启用时，移除 Docker 代理意味着虚拟机流量会直接通过网桥 → TUN 路径，这会导致 TLS 握手超时。代理提供了可用的出站通道。

#### 2G-3：移除代理会让 Docker 的情况变得更糟（违反直觉）

| Docker 配置 | 流量路径 | 结果 |
|---------------|-------------|--------|
| 代理开启（`127.0.0.1`），无 `no-proxy` | Docker → 虚拟机代理 → ??? | `docker pull` 可能有效，本地主机探测 ❌ |
| 代理开启（`host.internal`），加 `no-proxy` | 外部：Docker → 宿主机代理 → 互联网；本地：直连 | **两者均有效 ✅** |
| 代理关闭（`network_proxy: none`） | Docker → 虚拟机网桥 → 宿主机 → TUN → 互联网 | TLS 超时 ❌ |
| **`--network host`（仅用于构建）** | **构建容器 → 宿主机网络 → TUN → 互联网** | **构建有效 ✅** |

**决策树**：
- `docker pull` 失败 → 使用 `host.internal` 代理修复 `docker.json`（2G-2）
- `docker build` 失败 → 使用 `--network host`（2G-1），或者传入 `--build-arg http_proxy=http://host.internal:1082`
- 两者均失败 → 同时修复：`docker.json` + `--network host`

#### 2G-4：部署脚本和容器健康检查通过代理探测 localhost

如果环境变量泄漏到容器中，那么在容器内执行 `curl localhost` 的部署脚本，或使用 `wget http://localhost` 的 Docker 健康检查，会通过代理进行路由。

**常见症状**：
- 容器健康检查显示 `(unhealthy)`，但容器内的应用实际运行正常
- 健康检查日志中出现 `wget: can't connect to remote host (127.0.0.1): Connection refused`（这是代理端口，而不是应用端口）

**根本原因**：Docker 会从宿主机继承大写和小写的代理环境变量。许多工具只会清除大写变量（`HTTP_PROXY=`），却忘记小写变量（`http_proxy=http://127.0.0.1:1082`）。健康检查中的 `wget` 使用小写变量。

**在 docker-compose.yml 中修复** — 同时清除两种大小写形式：

```yaml
environment:
  # Must clear both uppercase and lowercase — wget/curl check different vars
  - HTTP_PROXY=
  - HTTPS_PROXY=
  - http_proxy=
  - https_proxy=
  - NO_PROXY=*
  - no_proxy=*
```

**在部署脚本中修复**：

```bash
_local_bypass="localhost,127.0.0.1,::1"
export NO_PROXY="${_local_bypass}${NO_PROXY:+,${NO_PROXY}}"
export no_proxy="$NO_PROXY"

# Use 127.0.0.1 instead of localhost in probe URLs (some proxy implementations
# only match exact string "localhost" in no-proxy, not the resolved IP)
curl http://127.0.0.1:3001/health   # ✅ bypasses proxy
curl http://localhost:3001/health    # ❌ may still go through proxy
```

**验证修复结果**：

```bash
# Docker proxy check (should show proxy + no-proxy)
docker info | grep -iE "proxy|No Proxy"

# Pull test
docker pull --quiet hello-world

# Build test (the real verification)
docker build --network host --no-cache - <<'EOF'
FROM alpine:latest
RUN apk update && echo "BUILD OK"
EOF

# Container env check (no proxy leak)
docker exec <container> env | grep -i proxy
# Expected: all empty or not set
```

### 步骤 2H：修复 TUN DNS 劫持导致的 SSH/Git 问题（198.18.x.x 虚拟 IP）

**症状**：`git clone/fetch/push` 失败并显示 `Connection closed by 198.18.0.x port 443`。`ssh -T git@github.com` 也可能失败。DNS 解析返回 `198.18.x.x` 地址，而不是真实 IP。

**根本原因**：Shadowrocket TUN 会拦截所有 DNS 查询，并返回 `198.18.0.0/15` 范围内的虚拟 IP。然后，它会将发往这些虚拟 IP 的流量通过 TUN 路由，以进行协议感知代理。HTTP/HTTPS 能正常工作，是因为落地代理能够理解这些协议；但基于 443 端口的 SSH（GitHub 使用的方式）会被错误处理——TUN 看到 443 端口的流量时会认为它是 HTTPS，并丢弃 SSH 握手。

**诊断**：

```bash
# DNS returns virtual IP (TUN hijack)
nslookup ssh.github.com
# → 198.18.0.26  ← Shadowrocket virtual IP, NOT real GitHub IP

# Direct IP works (bypasses DNS hijack)
ssh -o HostName=140.82.112.35 -o Port=443 git@github.com
# → "Hi user! You've successfully authenticated"
```

**修复方法**——在 SSH 配置中使用直接 IP，以绕过 DNS 劫持：

```bash
# ~/.ssh/config
Host github.com
    HostName 140.82.112.35    # GitHub SSH server real IP (bypasses TUN DNS hijack)
    Port 443
    User git
    ServerAliveInterval 60
    ServerAliveCountMax 3
    IdentityFile ~/.ssh/id_ed25519
```

**GitHub SSH 服务器 IP**（截至 2026 年，请使用 `dig +short ssh.github.com @8.8.8.8` 验证）：
- `140.82.112.35`（主要）
- `140.82.112.36`（备用）

**权衡**：如果 GitHub 更改 IP，硬编码的 IP 将失效。请监控 `ssh -T git@github.com`——如果它开始失败，请更新 IP。可以使用 cron 作业自动完成此操作：

```bash
# Weekly check (add to crontab)
0 9 * * 1 dig +short ssh.github.com @8.8.8.8 | head -1 > /tmp/github-ssh-ip.txt
```

**替代方案**（如果你可以控制 Shadowrocket 规则）：将 GitHub SSH IP 添加到 DIRECT 规则，使 TUN 在不进行协议检查的情况下直接放行：

```
IP-CIDR,140.82.112.0/24,DIRECT
IP-CIDR,192.30.252.0/22,DIRECT
```

这种方式更加稳健，但需要拥有代理工具的配置访问权限。

### 步骤 2I：修复 `getaddrinfo` 链中停滞的 DNS 解析器

**症状**：`ssh`、`curl`（不带 `-x`）、`git` 以及其他任何使用系统 DNS 的工具在完成解析前都会挂起约 60 秒。`ssh -vvv` 会在以下内容之后立即卡住：

```
debug2: resolving "<host>" port <port>
debug3: resolve_host: lookup <host>:<port>
```

……并且始终无法执行到 `debug1: connect to address`。等待结束后最终会成功，但每次新建连接都会遭遇相同的延迟。`nslookup <host>` 会立即返回（约 10 毫秒），但 `dscacheutil -q host -a name <host>` 需要 60 秒以上。

**根本原因**：macOS 的 `getaddrinfo` 会查询 `scutil --dns` 中 `domain` 过滤器匹配的每个条目（或所有完全没有过滤器的条目）。如果某个解析器的名称服务器不可达，但其接口仍然存在于路由表中，`getaddrinfo` 会等待完整的 UDP 重试超时时间（通常为 30–60 秒），然后才转而尝试下一个解析器。现实中最常见的触发原因是某个隧道守护进程（Tailscale、Cisco AnyConnect、Pulse Secure）崩溃后，未能撤销其 `utun` 和 DNS 注入。

**为什么 `nslookup` 会误导你**：`nslookup` 只读取 `/etc/resolv.conf`（一个名称服务器）。`dscacheutil` 和 `getaddrinfo` 则通过 DirectoryService，后者会查询 `scutil --dns` 中的整个解析器链。两者结果不一致就是确凿证据。

**“ping 正常但 DNS 已失效”陷阱**：即使端口 53 已失效，`ping <resolver-ip>` 也可能在不到 1 毫秒内收到响应，因为 `utun` 接口仍然持有该 IP，并在本地响应 ICMP。不要根据 `ping` 推断解析器是否正常。应测试实际服务：`dig @<ip> +tries=1 +timeout=3 example.com`。

#### 诊断：按名称服务器逐一排查

在 15 秒内找出失效的解析器：

```bash
# 1. Read every resolver's nameserver, interface, and matching scope
scutil --dns | grep -E "^resolver|nameserver|domain :|search domain|if_index"

# 2. Time each nameserver in isolation (3-second cap)
for ns in <each_unique_nameserver_from_step_1>; do
  printf "  %s: " "$ns"
  /usr/bin/time -p dig @$ns +tries=1 +timeout=3 +short example.com 2>&1 | tr '\n' ' '
  echo
done
```

正常的名称服务器会在 0.1 秒内响应。失效的名称服务器会在恰好 3.01 秒后返回 `connection timed out; no servers could be reached`。

对于 IPv6 解析器，运行相同的 `dig @<ipv6>` 测试——Tailscale 和多种 VPN 都会同时注入 v4 和 v6 地址，其中任何一方失效都会产生相同的症状。

#### 读取解析器属性——确定影响范围

每个 `scutil --dns` 解析器都有决定其参与哪些查询的属性：

| 属性 | 匹配范围 | 此解析器失效时的阻塞范围 |
|-----------|---------|------------------------------------|
| `domain : foo.com` | 仅 `*.foo.com` 查询 | 有限——只有 `foo.com` 查询会阻塞 |
| `search domain : foo` | 所有查询（追加搜索后缀） | 无限——每次查询都会阻塞 |
| 完全没有 `domain` 字段 | 所有查询（默认参与） | 无限——每次查询都会阻塞 |

带有 `domain` 过滤器的失效解析器虽然令人困扰，但影响仅限于局部。没有 `domain` 过滤器的失效解析器（在 VPN 注入的 DNS 中很常见，例如 Tailscale 的 `100.100.100.100`）会导致所有系统查询瘫痪，直到你修复它为止。

#### 确认可疑组件

逐一排查找出失效的名称服务器后，确定是哪个应用注入了它（`if_index` 中的接口名称是最有力的线索——`utun*` 接口通常可以追溯到某个 VPN 守护进程）。

对于 Tailscale，具体可以运行：

```bash
tailscale status
# Healthy: lists peers
# Dead:    failed to connect to local Tailscale service; is Tailscale running?
```

`failed to connect` 错误意味着守护进程已经消失，但它注入的网络配置（utun 接口 + DNS 解析器条目）尚未被清理。同样的模式也适用于任何 VPN/隧道工具。

#### 修复

在应用层重启对应的应用，使其清理钩子得以运行并移除陈旧接口：

**Tailscale（App Store 和独立 macOS 版本）**：

```bash
osascript -e 'quit app "Tailscale"' && sleep 3 && open -a Tailscale
```

对于其他 VPN/隧道工具，应优先在应用层正常退出（菜单栏 → 退出，或 `osascript -e 'quit app "<name>"'`），而不是使用 `kill -9`。强制终止会跳过清理流程，并可能留下相同的失效接口状态。仅当应用拒绝正常退出时，才升级使用 `pkill -9 <name>`。

**为什么“重启应用”比“刷新 DNS 缓存”更有效**：`sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder` 会清除缓存的结果，但 `scutil --dns` 中的解析器链是根据网络配置重建的，而不是根据缓存重建的。刷新后，失效的解析器仍然存在。修复必须由最初注册该解析器的应用来完成。

#### 端到端验证（4 个维度）

DNS 解析器修复很容易只验证一半。在确认系统路径已恢复之前，以下四项必须全部通过：

```bash
# 1. The owning daemon is back (not just its UI)
tailscale status | head -3

# 2. The previously-dead nameserver responds fast
dig @<previously-dead-ns> +tries=1 +timeout=3 +short example.com
# Expected: <0.1s, returns IP

# 3. macOS system path is unblocked (proves getaddrinfo recovered)
/usr/bin/time -p dscacheutil -q host -a name example.com
# Expected: <0.1s, returns IP

# 4. The original failing command works WITHOUT any workaround
ssh -o "ProxyCommand=none" -T git@github.com
# Expected: "Hi <user>! You've successfully authenticated..."
```

第四个维度最为重要。如果你在诊断期间应用了某种变通方案（将 DNS 委托给 SOCKS5 代理的 `ProxyCommand`、`/etc/hosts` 条目或硬编码 IP），那么只有在禁用变通方案（`ProxyCommand=none`）的情况下运行原始命令，才能确认你确实修复了系统 DNS 路径，而不只是绕过了它。

有关 macOS 解析器顺序、IPv4 与 IPv6 的差异，以及逐一演示每个诊断命令及其真实输出的完整示例，请参阅 [references/dns_resolver_chain_stall.md](references/dns_resolver_chain_stall.md)。

### 第 3 步：修复代理工具配置

确定所使用的代理工具，并应用相应的修复。有关各工具的详细说明，请参阅 [references/proxy_conflict_reference.md](references/proxy_conflict_reference.md)。

**关键原则**：请勿使用 `tun-excluded-routes` 排除 `100.64.0.0/10`。这会导致代理添加一条覆盖 Tailscale 的 `→ en0` 路由。相反，应让流量进入代理 TUN，并使用 DIRECT 规则将其直接放行。

**通用修复**——向任何代理工具添加以下规则：
```
IP-CIDR,100.64.0.0/10,DIRECT
IP-CIDR,fd7a:115c:a1e0::/48,DIRECT
```

应用修复后，进行验证：

```bash
route -n get <tailscale-ip>
# Should show Tailscale utun interface, NOT en0
```

### 第 4 步：配置 Tailscale SSH ACL

如果 SSH 可以连接但返回 `operation not permitted`，则 Tailscale ACL 可能要求每次连接时都通过浏览器进行身份验证。

在 [Tailscale ACL 管理页面](https://login.tailscale.com/admin/acls)中，确保 SSH 部分使用 `"action": "accept"`：

```json
"ssh": [
    {
        "action": "accept",
        "src": ["autogroup:member"],
        "dst": ["autogroup:self"],
        "users": ["autogroup:nonroot", "root"]
    }
]
```

**注意**：`"action": "check"` 要求每次都通过浏览器进行身份验证。将其更改为 `"accept"`，以实现非交互式 SSH 访问。

### 第 5 步：修复 WSL Tailscale 安装

如果 SSH 可以连接且 ACL 检查通过，但 tailscaled 日志中出现 `be-child ssh` 以退出码 1 失败，则说明通过 snap 安装的 Tailscale 存在沙箱限制，阻止了 SSH shell 执行。

**诊断** — 检查 WSL 的 tailscaled 日志：

```bash
# For snap installs:
sudo journalctl -u snap.tailscale.tailscaled -n 30 --no-pager

# For apt installs:
sudo journalctl -u tailscaled -n 30 --no-pager
```

查找以下内容：
```
access granted to user@example.com as ssh-user "username"
starting non-pty command: [/snap/tailscale/.../tailscaled be-child ssh ...]
Wait: code=1
```

**修复** — 将 snap 安装替换为 apt 安装：

```bash
# Remove snap version
sudo snap remove tailscale

# Install apt version
curl -fsSL https://tailscale.com/install.sh | sh

# Start with SSH enabled
sudo tailscale up --ssh
```

**重要**：新安装可能会分配不同的 Tailscale IP。使用 `tailscale status --self` 进行检查。

### 步骤 5A：修复 WSL 上 Tailscale SSH 代理静默失败的问题

**症状**：TCP 端口 22 可访问（`nc -z -w 5 <ip> 22` 执行成功），但 SSH 立即失败并显示：

```
kex_exchange_identification: Connection closed by remote host
```

始终无法收到 SSH banner。即使使用通过 apt 安装的 Tailscale（而非 snap），也会发生这种情况。

**根本原因**：在 WSL 上启用 `tailscale up --ssh` 后，Tailscale 会在应用层（内核网络栈之上）拦截端口 22 的连接。如果 Tailscale 的内置 SSH 代理发生故障，它会接受 TCP 连接，但在发送 SSH banner 之前立即将其关闭。

**关键诊断方法** — 在 WSL 实例上执行：

```bash
# This will show 0 packets even during active SSH attempts
sudo tcpdump -i any port 22 -c 5 -w /dev/null 2>&1
```

数据包数为零意味着 Tailscale 在连接到达内核网络栈之前就将其拦截。内核中的 `sshd` 永远看不到该连接。

**与步骤 5 的区别**：步骤 5 介绍的是 `be-child ssh` 失败的 snap 沙箱问题。这是另一个不同的问题——无论采用哪种安装方式，Tailscale 的 SSH 代理自身都会静默失败。

**修复** — 禁用 Tailscale 的 SSH 代理并使用常规 sshd：

```bash
# On the WSL instance:
sudo tailscale up --ssh=false

# Verify sshd is running
sudo service ssh status
# If not running:
sudo service ssh start

# Verify from the client machine:
ssh -o ConnectTimeout=10 <user>@<tailscale-ip> 'echo SSH_OK'
```

禁用 Tailscale SSH 后，连接将像往常一样通过内核网络栈到达 `sshd`。步骤 4 中的 Tailscale ACL `"action": "accept"` 将不再相关——身份验证由 `sshd` 使用 SSH 密钥或密码处理。

**何时应保持启用 `--ssh`**：仅当你明确需要 Tailscale 的 SSH 功能（基于 ACL 的访问控制、无需管理 SSH 密钥）时。如果标准 sshd 可以正常工作，为提高可靠性，建议使用 `--ssh=false`。

### 步骤 5B：修复 macOS 上的 App Store 版 Tailscale（缺少 `tailscale ssh`）

**症状**：运行 `tailscale ssh` 时返回：

```
The 'tailscale ssh' subcommand is not available on macOS builds
distributed through the App Store or TestFlight.
```

**根本原因**：macOS 的 App Store 版 Tailscale 受沙盒限制，不包含 `tailscale ssh` 子命令。

**修复方法** — 安装独立版：

1. 卸载 App Store 版（从 /Applications 中删除）
2. 从 https://pkgs.tailscale.com/stable/#macos 下载独立版本
3. 安装到 /Applications

**安装后的 CLI 设置**：独立版的 `tailscale` CLI 二进制文件嵌入在应用程序包内。请在 shell 配置中添加别名：

```bash
# ~/.zshrc
alias tailscale="/Applications/Tailscale.app/Contents/MacOS/Tailscale"
```

验证：

```bash
source ~/.zshrc
tailscale version
tailscale ssh <user>@<hostname>   # Should work now
```

### 第 6 步：验证端到端连接

运行完整的连接测试：

```bash
# 1. Check route is correct (must show Tailscale's utun, not en0 or Shadowrocket's utun)
route -n get <tailscale-ip>
# Also confirm which utun is Tailscale's:
ifconfig | grep -A2 'inet 100\.'

# 2. Test TCP connectivity
nc -z -w 5 <tailscale-ip> 22

# 3. Test SSH
ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no <user>@<tailscale-ip> 'echo SSH_OK && hostname && whoami'
```

这三个测试必须全部通过。如果第 1 步失败，请重新检查第 3 步。如果第 1 步显示了错误的 utun（例如，显示 MTU 为 4064 的 Shadowrocket utun，而不是 MTU 为 1280 的 Tailscale utun），这同样属于路由冲突。如果第 2 步通过，但第 3 步因 `kex_exchange_identification` 而失败，请重新检查第 5A 步（Tailscale SSH 代理拦截）。如果第 2 步失败，请检查 WSL sshd 或防火墙。如果第 3 步因其他错误而失败，请重新检查第 4～5 步。

**对于与 DNS 相关的修复（第 2I 步）**，上述三个步骤并不足够——它们未涵盖系统 DNS 恢复。请改用第 2I 步末尾的四维验证：守护进程健康状态、针对每个解析器运行 `dig`、`dscacheutil`，以及在**不使用**任何临时解决方法的情况下运行最初失败的命令。

## SOP：通过 Tailscale 进行远程开发

使用代理工具通过 Tailscale 进行远程开发的主动设置指南。请在遇到问题**之前**完成以下步骤。

### 前提条件

- 两台机器均已安装并运行 Tailscale
- 代理工具（Shadowrocket/Clash/Surge）已配置为兼容 Tailscale（请参阅上面的第 3 步）
- SSH 访问正常：`ssh <tailscale-ip> 'echo ok'`

### 1. 代理安全的 Makefile 模式

任何使用 curl 访问 `localhost` 的 Makefile 目标都必须使用 `--noproxy localhost`。这是必需的，因为 `http_proxy` 通常会在 `~/.zshrc` 中进行全局设置（在中国很常见），而 Make 会继承 shell 环境变量。

```makefile
## ── Health Checks ─────────────────────────────────────

status:                ## Health check dashboard
	@echo "=== Dev Infrastructure ==="
	@docker exec my-postgres pg_isready -U postgres 2>/dev/null && echo "PostgreSQL: OK" || echo "PostgreSQL: FAIL"
	@curl --noproxy localhost -sf http://localhost:9000/minio/health/live >/dev/null 2>&1 && echo "MinIO: OK" || echo "MinIO: FAIL"
	@curl --noproxy localhost -sf http://localhost:3001/api/status >/dev/null 2>&1 && echo "API: OK" || echo "API: FAIL"

## ── Route Warmup ──────────────────────────────────────

warmup:                ## Pre-compile key routes (run after dev server is ready)
	@echo "Warming up dev server routes..."
	@echo -n "  /api/health → " && curl --noproxy localhost -s -o /dev/null -w '%{http_code} (%{time_total}s)\n' http://localhost:3010/api/health
	@echo -n "  /            → " && curl --noproxy localhost -s -o /dev/null -w '%{http_code} (%{time_total}s)\n' http://localhost:3010/
	@echo "Warmup complete."
```

**规则**：
- 每个 `curl http://localhost` 调用都必须包含 `--noproxy localhost`
- Docker 命令（`docker exec`）不受 `http_proxy` 影响——无需修复
- `redis-cli`、`pg_isready` 通过 TCP 直接连接——无需修复

### 2. SSH 隧道 Makefile 目标

添加以下目标，以便通过 Tailscale SSH 隧道进行远程开发：

```makefile
## ── Remote Development ────────────────────────────────

REMOTE_HOST    ?= <tailscale-ip>
TUNNEL_FORWARD ?= -L 3010:localhost:3010

tunnel:                ## SSH tunnel to remote machine (foreground)
	ssh -N $(TUNNEL_FORWARD) $(REMOTE_HOST)

tunnel-bg:             ## SSH tunnel to remote machine (background, auto-reconnect)
	autossh -M 0 -f -N $(TUNNEL_FORWARD) \
		-o "ServerAliveInterval=30" \
		-o "ServerAliveCountMax=3" \
		-o "ExitOnForwardFailure=yes" \
		$(REMOTE_HOST)
	@echo "Tunnel running in background. Kill with: pkill -f 'autossh.*$(REMOTE_HOST)'"
```

**设计决策**：

| 选择 | 理由 |
|--------|-----------|
| `?=`（条件赋值） | 允许覆盖：`make tunnel REMOTE_HOST=100.x.x.x` |
| 将 `TUNNEL_FORWARD` 设为变量 | 支持多端口：`make tunnel TUNNEL_FORWARD="-L 3010:localhost:3010 -L 9000:localhost:9000"` |
| `autossh -M 0` | 禁用 autossh 自身的监控端口；改为依赖 `ServerAliveInterval`（穿越 NAT 时更可靠） |
| `ExitOnForwardFailure=yes` | 如果端口已被占用，则立即失败，而不是在没有隧道的情况下静默运行 |
| 终止提示使用 `autossh.*$(REMOTE_HOST)` | 精确匹配模式——不会意外终止其他 SSH 会话 |

**安装 autossh**：`brew install autossh`（macOS）或 `apt install autossh`（Linux/WSL）

### 3. 多端口隧道

当项目需要多个服务（开发服务器 + 对象存储 + API 网关）时：

```bash
# Forward multiple ports in one tunnel
make tunnel TUNNEL_FORWARD="-L 3010:localhost:3010 -L 9000:localhost:9000 -L 3001:localhost:3001"

# Or define a project-specific default in Makefile
TUNNEL_FORWARD ?= -L 3010:localhost:3010 -L 9000:localhost:9000
```

每个 `-L` 标志相互独立。如果其中一个端口已在本地被占用，`ExitOnForwardFailure=yes` 将中止整个隧道——请先解决端口冲突。

### 4. SSH 非登录 Shell 设置

**这是导致“交互式运行正常，但在脚本中失败”问题的常见原因。** SSH 非登录 Shell 不会加载 `~/.zshrc`（Linux 上为 `~/.bashrc`），因此通过 nvm、Homebrew、uv、cargo 或任何 Shell 级管理器安装的工具都不会出现在 `$PATH` 中。在 `~/.zshrc` 中设置的代理环境变量也不会被加载。

这会影响通过 `ssh user@host "command"` 运行的**所有**远程命令，包括 CI/CD 流水线、由 cron 触发的 SSH，以及 Makefile 远程目标。请为所有远程命令添加前缀 `source ~/.zshrc 2>/dev/null;`（macOS）或 `source ~/.bashrc 2>/dev/null;`（Linux/WSL）。

**常见故障**：`ssh user@host "uv run ..."` 或 `ssh user@host "node ..."` 返回 `command not found`，即使该命令在交互式 SSH 会话中可以正常运行。

有关详细信息和示例，请参阅 [references/proxy_conflict_reference.md § SSH 非登录 Shell 陷阱](references/proxy_conflict_reference.md)。

对于运行远程命令的 Makefile 目标：

```makefile
REMOTE_CMD = ssh $(REMOTE_HOST) 'source ~/.zshrc 2>/dev/null; $(1)'

remote-status:         ## Check remote dev server status
	$(call REMOTE_CMD,curl --noproxy localhost -sf http://localhost:3010/api/health && echo "OK" || echo "FAIL")
```

### 5. 端到端工作流

#### 首次设置（远程机器）

```bash
# 1. Clone repo and install dependencies
ssh <tailscale-ip>
cd /path/to/project
git clone git@github.com:user/repo.git && cd repo
pnpm install  # Add --registry https://registry.npmmirror.com if in China

# 2. Copy .env from local machine (run on local)
scp .env <tailscale-ip>:/path/to/project/repo/.env

# 3. Start Docker infrastructure
make up && make status

# 4. Run database migrations
bun run db:migrate

# 5. Start dev server
bun run dev
```

#### 日常工作流（本地机器）

```bash
# 1. Start tunnel
make tunnel-bg

# 2. Open browser
open http://localhost:3010

# 3. Auth, coding, testing — everything works as if local

# 4. When done, kill tunnel
pkill -f 'autossh.*<tailscale-ip>'
```

#### 工作原理

```
Browser → localhost:3010 → SSH tunnel → Remote localhost:3010 → Dev server
                                     ↓
                              Auth redirects to localhost:3010
                                     ↓
                              Browser follows redirect → same tunnel → works
```

关键在于：`.env` 中的 `APP_URL=http://localhost:3010` 对**本地**和远程开发都是正确的。SSH 隧道使远程服务器的 localhost 可通过本地机器的 localhost 访问。身份验证回调重定向到 `localhost:3010` 时始终能够正确解析。

### 6. 检查清单

开始远程开发前，请确认：

- [ ] Tailscale 已连接：`tailscale status`
- [ ] SSH 可用：`ssh <tailscale-ip> 'echo ok'`
- [ ] 代理工具已配置：`[Rule]` 中包含 `IP-CIDR,100.64.0.0/10,DIRECT`
- [ ] `skip-proxy` 包含 `100.64.0.0/10`
- [ ] `tun-excluded-routes` **不**包含 `100.64.0.0/10`
- [ ] `NO_PROXY` 包含 `.ts.net,100.64.0.0/10`
- [ ] 已安装 `autossh`：`which autossh`
- [ ] Makefile 中的 curl 命令包含 `--noproxy localhost`
- [ ] 远程开发服务器正在运行：`ssh <ip> 'source ~/.zshrc 2>/dev/null; curl --noproxy localhost -sf http://localhost:3010/'`
- [ ] 隧道可用：`make tunnel-bg && curl -sf http://localhost:3010/`

## 参考资料

- [references/proxy_conflict_reference.md](references/proxy_conflict_reference.md) — 各工具的配置（Shadowrocket、Clash、Surge）、NO_PROXY 语法、SSH ProxyCommand 和冲突架构