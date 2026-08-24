---
name: debugging-network-issues
description: >-
  Investigates network, streaming, and protocol failures with falsification-first
  layered experiments. Use for ECONNRESET, HTTP/2 RST_STREAM, SSE or long-polling
  stalls, fixed-time drops, CDN/proxy/CGNAT timeouts, client-side proxy/TUN
  misrouting, CNAME-rule surprises, certificate errors, generic throughput collapse
  where everything returns 200 but transfers crawl, or LAN identity/topology
  mysteries. Trigger phrases include "socket closed unexpectedly", "stream
  interrupted", "fails after N seconds", "works sometimes but not always",
  "upstream silent for X seconds", ERR_CONNECTION_CLOSED, SSL_ERROR_SYSCALL,
  UNKNOWN_CERTIFICATE_VERIFICATION_ERROR, and wrong-site certificate. Treat this as
  the general method and unknown-root-cause fallback. Use tunnel-doctor for known
  Tailscale/TUN/DNS/route/WSL-Docker conflicts and for a confirmed proxy
  exit/node/chain quality problem.
---
# 网络问题调试

针对那些显而易见的原因很可能是错误判断的事故，采用证据驱动的调查方法。本方法源自一个真实的 5 小时生产环境案例（参见 [references/case-sse-rst-130s.md](references/case-sse-rst-130s.md)）：层层叠加的假设浪费了数小时，而一个 10 分钟的分层实验本可解决问题。

当用户报告网络、流式传输或协议相关症状，而调查人员想仅凭一行日志或一个间接数据点就作出诊断时，请应用此技能。此技能的作用就是抑制这种下意识反应。

## 首先进行分诊——这是已知领域吗？

在应用下方的通用方法之前，请检查该症状是否指向此代码库中已有专用技能的技术栈。这些技能包含本技能有意不涉及的特定领域“症状→原因→修复”对照表——请先从那里开始；如果根本原因最终被证明在其他地方，再回到这里使用本方法。

| 如果症状是……                                                                                                                                                                                       | 首先使用                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| macOS Tailscale ⨯ 代理/VPN 冲突（Shadowrocket / Clash / Surge）：`tailscale ping` 正常，但 SSH/curl/git 失败；出现 `Connection closed by 198.18.x.x`；TUN DNS 劫持；约 60 秒的 `getaddrinfo` 解析器停顿 | **tunnel-doctor**                            |
| Cloudflare 配置问题：`ERR_TOO_MANY_REDIRECTS`、SSL 模式不匹配、橙色云代理后的 DNS / 代理状态问题                                                                                        | **cloudflare-troubleshooting**               |
| Windows App / AVD / W365 RDP 连接质量问题：使用 WebSocket 而非 UDP Shortpath、RTT 较高、STUN/TURN 干扰                                                                                    | **windows-remote-desktop-connection-doctor** |
| 客户端代理 / VPN / TUN 路由错误：某个特定站点出现 `ERR_CONNECTION_CLOSED` 或 `SSL_ERROR_SYSCALL`，其他站点正常；DNS 返回虚假/TUN IP；并且添加 PROXY 规则也无效 | **本技能**——先阅读 [references/case-proxy-tun-cname-override.md](references/case-proxy-tun-cname-override.md) |
| TLS 证书验证错误（`UNKNOWN_CERTIFICATE_VERIFICATION_ERROR`、证书对应错误的站点），或**所有**经 DIRECT 路由/国内域名同时在握手中途出现 EOF，而经代理的域名正常——并且所有代理健康状态监视器仍报告正常                                        | **tunnel-doctor**（TUN DIRECT 脑裂排查步骤） |
| 代理可访问，且 OS/Tailscale 路由正常，但批量传输速度缓慢，并且更换当前使用的出口/节点会改变测得的速率 | **tunnel-doctor**——代理节点 / 出口 / 链路容量分支 |
| **没有任何错误——只是很慢。** 每个请求都返回 200，延迟和健康检查看起来都正常，但传输速度极慢、批量任务超出预计时间，或收到的文件被截断 | **本技能**——直接转到 [步骤 0.7](#step-07-throughput-collapse--when-nothing-errors-and-everything-is-slow)；由错误驱动的步骤在这里无从着手 |

如果都不匹配——或者你尝试了某个领域技能，但证据指向其他方向——请继续阅读下文。该方法可推广到任何多层系统。

> **特别针对本技能的说明**：如果症状是**大型 `POST` 请求体**（例如 `/<openrouter-path>` 且 `Content-Length` > 1 MB）触发 Cloudflare 524/522，故障原因通常是**上传到源站的时间超过 Cloudflare 的源站读取超时时间**，而非后端响应缓慢。在认定后端停滞之前，请先使用下文的上传与处理核对清单。

## 核心原则

### 1. 证据优先于假设

如果你无法指出具体的证据——日志行、pcap 帧、探测输出、指标样本——那你就是在猜测，而不是诊断。在断言“X 是原因”之前，必须能够说出直接证据。如果目前还没有直接证据，请先添加插桩（参见 [references/instrumentation-patterns.md](references/instrumentation-patterns.md)）或捕获证据（参见 [references/packet-capture-recipes.md](references/packet-capture-recipes.md)），然后再继续。

### 2. 证伪优先于证实

N 个独立来源“证实”一个假设，并不能使它成为事实。一项证伪观察就足以排除该假设。在依据某个假设采取行动之前，请先回答：

> “什么观察结果会让我放弃这个假设？”

如果答案是“没有”或“我想不到”，那么该假设就是不可证伪的，不能用它来主导调查。如果答案是具体的，请在决定采取行动之前，先去寻找该观察结果。

### 3. 分层隔离

多跳系统（客户端 → CDN → LB → 反向代理 → 应用 → 上游）的缺陷往往集中在层与层之间的衔接处。当某个症状可能来自多个层时，**不要推理它来自哪一层；直接测试**。标准方法是：让同一个逻辑请求通过三条或更多路径运行，每条路径恰好只相差一跳，然后比较症状出现在哪里。这种方法能在几分钟内解决层层叠加假设数小时也无法解决的问题。参见 [references/layered-isolation-experiment.md](references/layered-isolation-experiment.md)。

**同样的技术不仅能隔离正确性问题，也能隔离容量问题。** 当症状体现为速率而非错误时，应改变的是*技术栈*，而不是*网络跳点*：通过两条共享网络路径但不共享任何应用代码的通道，测量同一方向的数据传输。这是停止调优一个从来就不是瓶颈的应用的成本最低的方法。不要把结果简化理解为“结果一致就说明问题在路径上”——只有两条通道都*慢*时，这一结论才成立；两条通道都快，意味着探测未能复现症状，因此完全不能证明任何事情。有关如何解读四种结果，请参见步骤 0.7。

### 4. 决策前进行反向审查

在确定根本原因或发布修复之前，请让独立审查者质疑结论，而不是确认结论。智能体善于发现单个调查者未曾想到的风险，却不擅长权衡这些风险。在任何发现影响行动之前，都应使用四问题过滤法（参见 [references/counter-review-pattern.md](references/counter-review-pattern.md)）对其进行审查。

### 5. 绿色健康检查只证明其探测的路径是健康的

监控程序只会观察其作者想到要探测的路径。多平面系统——例如具有 DIRECT 平面和代理平面的 TUN 代理、具有数据平面和控制平面的服务、具有后端 API 和 Web 登录页面的技术栈——往往一次只故障一个平面，而仅探测另一个平面的看门狗在整个故障期间都会保持绿色。在这一原则背后的事故中，一个代理健康守护进程每 5 分钟通过代理探测一次某个海外端点，并在直接连接平面完全中断的情况下，仍持续记录了 2 个多小时的 "healthy"。

在接受“监控显示它是健康的”作为证据之前，先问一句：**该检查具体经过了哪条路径？** 它的绿色状态只能作为该路径健康的证据。列举系统实际转发流量或提供服务的各个平面，并直接探测发生故障的平面——能够捕获这次故障的检查通常只差一次 curl。

**检查也只能证明其规模足以测量的*量*。** 路径覆盖是一个维度；规模是另一个维度，而吞吐量崩溃往往就隐藏在这个维度中。存活探针只返回几百字节，因此其耗时主要由握手和往返时间决定——在案例研究中，它全天都在 40 ms 内响应，始终没有变化，而链路的实际容量却发生了 100× 的波动；它并没有撒谎：它确实如实完成了自己所测量的事情。`ping`/RTT 也是如此，它测量的是一个小数据包的往返时间，完全无法说明容量。

实用规则是：**只有当传输时间在总耗时中占主导地位时，探针才真正测量了链路。** 因此，应根据你需要得到的答案而不是方便程度来确定探针大小——如果探针远不到一秒就返回，那么其中几乎全部时间都花在建立连接上，你测量到的也只是连接建立过程。可以通过按*时间*而不是按字节设定预算，完全绕过探针大小问题（持续传输 N 秒，再用这段时间内收到的数据量除以 N）；Step 0.7 中的命令正是这样做的，这也是为什么即使链路已经慢如蜗牛，它们仍然开销很低。应将问题扩展为：**哪条路径，以及多大规模？**

## 工作流程

将此检查清单复制到调查记录中，并逐项勾选：

```
Investigation Progress:
- [ ] Step 0:   Scope the symptom (exact error, exact times, who, who-not, what changed)
- [ ] Step 0.5: Verify the premise — does direct evidence show the symptom is actually happening?
- [ ] Step 0.6: **For large POST bodies: distinguish upload-timeout from processing-timeout** (see recipe below)
- [ ] Step 0.7: **If nothing errors and it is just slow: measure a rate, then two-channel it** (see recipe below)
- [ ] Step 1:   Gather direct evidence at every hop before hypothesizing
- [ ] Step 2:   Frame ≥3 hypotheses; for each, name (a) what falsifies it, (b) which layer boundary the intervention would target
- [ ] Step 3:   Design a decisive experiment (for network: layered isolation)
- [ ] Step 4:   Add instrumentation if evidence gaps block direct observation
- [ ] Step 5:   Execute, record actual vs predicted
- [ ] Step 6:   Counter-review before acting
- [ ] Step 7:   Fix + re-run the same experiment to verify
- [ ] Step 8:   Document wrong turns as teaching material
```

### 步骤 0：界定范围

明确而严格的范围，决定了一次调查是耗时 20 分钟还是 5 小时。在查看任何内容之前，先提取：

- **确切的错误字符串**（复制粘贴，不要转述）。`socket closed` 与 `ECONNRESET` 不同，也与 `HTTP/2 RST_STREAM INTERNAL_ERROR (err 2)` 不同。
- **确切的时间戳**（带时区的 ISO-8601 格式，而不是“昨天晚上”）
- **可复现性**（每次都发生 / 间歇性发生 / 仅特定用户发生）
- **哪些人受到影响，哪些人未受影响**（差异性观察可以缩小搜索范围）
- **最近发生了什么变更**（部署、配置、上游依赖项、客户端版本）

区分症状与诊断。“慢”不是症状。“请求耗时 130.898 秒，随后返回 HTTP/2 INTERNAL_ERROR”才是。

**但不要因为这句话就把真实事故丢进废纸篓。** 它要求的是量化，而不是错误代码——有一整类故障需要用*速率*来量化，并且完全没有任何错误代码：每个请求都返回 200，没有任何连接重置，但系统仍然不可用。当你将“慢”表述为**给定有效载荷大小下的每秒字节数**时（“8.4 MB 耗时 95 秒 = 0.09 MB/s，全程 HTTP 200”），它就成为了症状。一旦有了这个数字，步骤 0.7 就提供了一个能得出明确结论的实验。不在范围内的仍然是*未经测量的*抱怨——“用户说感觉很慢”——这是步骤 0.5 要解决的问题，而不是本步骤的问题。

### 步骤 0.5：验证前提

在投入完整调查之前，先确认报告的症状确实正在发生，而不只是根据下游影响或用户的不满推断出来的。一次成本低廉的直接观察，胜过花费数小时调查一个并不存在的问题。

询问：**“有什么直接证据表明这个症状确实存在？”**

- 如果用户报告“在 130 秒时超时”：这是来自带时间戳的日志、浏览器网络面板，还是回忆？
- 如果用户报告“连接重置”：他们确实看到了数据包，还是根据重试次数激增推断出来的？
- 如果用户报告“对某些人失败，但对其他人不失败”：是否已在受控测试中复现，还是仅仅来自传闻？

可接受的前提：

- 包含时间戳和错误字符串的日志行
- 显示故障的浏览器 DevTools Network 截图
- 能按需重现症状的复现命令
- 显示特定错误计数正在上升的指标图表

不足以作为前提：

- “用户说感觉很慢”
- “告警触发了，但我没有检查实际失败的是什么”
- “上周有人提到……”

如果前提未通过验证，解决方案是观察，而不是调查。添加缺失的遥测，在监测手段就位后等待下一次发生，并在获得真实数据后再回来。不要因为“反正我们都已经开始了”就屈从于沉没成本心理，继续进行调查。

### 步骤 0.6：大型 POST 请求体的上传超时与处理超时

对于由 CDN 提供前置服务且请求体较大的 `POST`/`PUT` 端点，最常见的误诊是将问题归咎于后端速度慢，而真正的问题是**请求体上传耗时超过了 CDN/代理的源站超时时间**。

当症状是在 `Content-Length > ~500 KB` 的请求上出现 524/522/504 时，请应用以下子检查清单：

1. **定位边缘/反向代理访问日志**（Caddy、nginx、Envoy、Cloudflare Logpush）。
2. **比较 `bytes_read`（或等效字段）与 `Content-Length`**：
   - `bytes_read == Content-Length` 且 `status` 为错误状态 → 很可能是后端/处理问题。
   - `bytes_read < Content-Length` 且连接在接近超时时间窗口时关闭 → **上传问题**。
3. **检查 `duration` / `request_time` 的语义**：
   - Caddy `duration` = 从读取第一个字节到响应结束的实际经过时间。
   - nginx `$request_time` = 同上。
   - <upstream-capture-service> / 应用的 `request_time` = 完整接收请求体后，后端所花费的处理时间。
   - 如果代理的 `duration` ≈ 超时时间，但上游的 `request_time` 很短或根本没有记录，则瓶颈在请求体上传。
4. **查找 `status=0`（Caddy）或 `-`（nginx）**：
   - `status=0` 表示代理从未写入 HTTP 响应，通常是因为下游/客户端一侧先关闭了连接。
5. **与上游日志进行关联**：
   - 如果请求 ID / ray ID / trace ID **未出现**在上游（<new-api-container>、<upstream-capture-service>、应用）日志中，则请求从未完成上传。

**上传超时 524 的示例特征：**

```json
{
  "status": 0,
  "duration": 125.0,
  "bytes_read": 4111422,
  "request": {
    "headers": { "Content-Length": ["6042141"] }
  }
}
```

解读：代理将连接保持了 125 秒，读取了 6 MB 请求体中的 4.1 MB，随后 Cloudflare 将其关闭并返回 524。

**处理超时的示例特征：**

```json
{
  "status": 504,
  "duration": 120.1,
  "bytes_read": 6042141,
  "request": { "headers": { "Content-Length": ["6042141"] } }
}
```

解读：完整请求体已上传，但后端未能在代理超时前响应 → 后端/处理问题。

### 步骤 0.7：吞吐量骤降——没有任何报错，但一切都很慢

上述方案（0.6）处理的是*超时*——一种可以通过 grep 搜索的错误代码。本方案处理的是**完全没有错误**的一类问题：每个请求都成功，每项健康检查都是绿色，但由于字节到达速率仅为预期的一小部分，系统实际上无法使用。这是最有可能被误诊数小时的故障模式，因为整套错误驱动型工具对此都无从下手。

**为什么常规信号都显示绿色**——以下所有现象都曾在链路性能下降 100 倍时同时出现：

| 信号 | 显示内容 | 为什么它仍然是绿色 |
| --- | --- | --- |
| HTTP 状态 | 所有请求均为 `200` | 慢并不是错误；响应最终会完成，只是很晚 |
| 往返延迟 | 12 ms | RTT 测量的是小数据包的往返时间；它**不是**容量测量值 |
| 存活性/健康检查端点 | `0.04 s` | 其响应大小仅与握手数据相当，因此其耗时完全由 RTT 构成，与传输无关。**在链路成为限制因素之前就已完成的探针无法测量链路**——参见原则 5 |
| 传输状态字段 | `active; direct <endpoint>` | 报告的是**路径类型**，而非路径容量——参见陷阱 16 |

因此，第一步是停止查看状态，转而**测量速率**。

**决定性实验：两个相互独立的通道、相同方向、相同时间预算。**

这是将原则 3 的分层隔离应用于容量而非正确性。选择两个经由同一网络路径到达同一主机、但**不共享任何应用程序代码**的通道——关键在于，如果二者得出一致的结果，那么该结果就不可能是其中任一通道的内部机制所致。

下面两条命令都**以时间为预算，而不是以大小为预算**：它们会持续流式传输固定的秒数，并报告实际收到的数据量。这样，无论链路状况有多差，探测成本都保持不变——在案例研究中，固定的 8 MB 负载在健康路径上耗时不到一秒，而在性能退化的路径上耗时约 90 秒；如果退化得更严重，等待时间将无限增长，而这恰恰发生在你最无力承担这种等待的时候。这也是两个数字可以比较的原因：秒数相同、方向相同，而且都**在接收端**测量。

```bash
BUDGET=20

# Channel A — the service under suspicion. Point it at the largest object you can name.
# --max-time aborts mid-transfer; -w still prints, and curl exits 28. That is a
# successful measurement, not a failure — read the rate, ignore the exit code here.
curl -s -o /dev/null --max-time "$BUDGET" \
  -w 'A: %{size_download} B in %{time_total}s = %{speed_download} B/s\n' \
  "http://<host>:<port>/<a-large-object>"

# Channel B — a completely different stack to the same host. `cat /dev/zero` streams
# until cut off, so the byte count is decided by the link, not by the payload size.
B=$(timeout "$BUDGET" ssh <host> 'cat /dev/zero' 2>/dev/null | wc -c)
echo "B: $B B in ${BUDGET}s = $((B / BUDGET)) B/s"
```

> **不要用 `dd` 自己的摘要行替代通道 B 的数字。** `dd if=/dev/zero … ` 报告的是它将数据写入*自身标准输出*的速度；对于通过管道传输的 SSH 数据，这些数据会被管道和 SSH 的通道窗口吸收——它测量的是本地写入速度，而不是线路速度，并且完全没有计入连接建立过程。在案例研究的健康路径上进行测量时，原始 SSH 端到端传输了 33.6 MB，速率为 44 MB/s，而 `dd` 对同一次传输自行报告的速率为 54.9 MB/s。发送端速率只是线路速率的上限，绝不是对线路速率的测量。应像上面那样，从接收端为整个调用计时。

**两个通道的绝对数值很可能不同——这不是问题。** 在同一条健康路径上，原始 SSH 测得约 44 MB/s，而通过媒体服务获取数据时测得 11–16 MB/s，因为通道 A 除了承担线路传输开销，还要承担服务自身的读取和编码工作。因此，下面的决策规则关注的是**数量级**，而不是数值相等：你要测试的是两个通道是否处于同一档位，而不是它们是否输出相同的数字。如果两个通道在健康链路上的速率相差 3 倍，而在退化链路上都跌至 0.1 MB/s，那么它们已经准确提供了你所需要的信息。

**在查看表格之前，先确认两个探测确实都运行了。** 这是将陷阱 17 应用于你自己的操作步骤，也是这里最容易让人信心十足地得出错误答案的情况：一个从未传输任何数据的探测会产生一个*很低或为零的速率*，而下表会将其解读为“慢”，并直接归因于“路径”——这个结论却来自一次根本没有发生的测量。有两项检查，而且成本都很低：

- **通道 A**：`size_download` 是否接近对象的实际大小？DNS 解析失败（curl 退出码 6）、连接被拒绝（退出码 7）或 404 错误页面都会快速返回少量数据——这甚至可能被解读为*快速*，从另一个方向把你带到错误的行。只有退出码 28（`--max-time` 在传输过程中触发）意味着“测量结果有效，只是对象大小超出了预算”。
- **通道 B**：`$B` 是否确实可能为非零值？该命令中的 `2>/dev/null` 会隐藏 SSH 自身的错误，因此，无法通过身份验证的主机会悄无声息地产生 `B=0`。如果数值看起来不对，请去掉 `2>/dev/null` 后重新运行一次。

将结果视为一个四路测试——四种结果都有可能出现，其中三种意味着你应当停止正准备进行的操作：

| 通道 A | 通道 B | 结论 |
| --- | --- | --- |
| 慢 | 慢 | **路径问题。** 两个互不相关的技术栈不可能因为互不相关的原因而以相同速率变慢。停止调优应用程序——应用程序内部的任何调整都无济于事。转到下文的“路径发生了什么变化”。 |
| 慢 | 快 | **应用程序/服务问题。** 路径显然能够传输数据；A 做不到。现在你有了一个可用的对照项，可据此进行二分排查。 |
| 快 | 慢 | **尚不能得出任何结论——你的对照项才是异常所在。** 可能存在 SSH 特有的开销（弱 CPU 上的加密算法、某一跳对 SSH 进行流量整形），或者 B 经过了不同的路径。不要得出“服务没有问题”的结论；请将 B 替换为第三个技术栈，然后重新运行。 |
| 快 | 快 | **探测未能复现症状。** 不要宣布事件已经解决。实际工作负载在某个你尚未复现的维度上有所不同——方向（上传与下载）、并发量、对象大小或时段。在相信这个正常结果之前，先改变其中一个维度并重新测量。 |

**怎样才算“相同速率”？** 为此，可将差异在 **~20%** 以内视为相同速率——两个通道在数据封装、加密和每个对象的开销方面有所不同，因此既不期望也不要求速率完全相等。这里判断的是数量级：两个技术栈的读速率分别为 0.09 和 0.11 MB/s，可视为一致；0.1 和 12 MB/s 则不一致。如果差距介于 ~20% 和 ~2× 之间，应视为尚无定论，并扩大预算或对象大小，而不是选择支持其中一方。

**没有 SSH 时如何搭配通道 B。** 要求仅仅是*同一主机、同一方向、不共享应用程序代码*——SSH 只是方便，并无特殊之处。以下任一种都可以：主机上的另一个无关服务（指标端点、对象存储、静态文件服务器）、容器运行时传输（从该主机执行 `docker cp`）、可在两端运行的原始吞吐量工具（`iperf3 -c`），或主机自身的软件包/制品镜像源。不能算作有效对照的是同一服务的另一个端点——它与要排除嫌疑的代码共享同一套代码，因此结果一致并不能证明任何事情。

**然后查明路径发生了什么变化。** 一旦确认路径有问题，变量通常是拓扑，而不是硬件：流量今天实际采用的路由与昨天相比有何不同。对于网状 VPN（Tailscale、Nebula、ZeroTier）和拆分隧道代理，同一个逻辑地址可能由局域网直连路径、广域网直连路径或中继提供服务——这些路径的容量可能相差一个数量级，而且**状态字段或你连接的地址都不会发生变化**。让传输层报告它实际使用的路径（`tailscale ping <host>` 会输出端点，并说明回复是否经由中继返回）。

如果没有可供比较的、此前已知正常的测量结果——这在首次发生事故时很常见——你仍然可以在没有它的情况下推进排查，因为“这里发生变化了吗？”这个问题有一种成本更低的替代方法：**从其他位置测量同一条路径。** 使用另一网络上的第二个客户端，或者让主机通过环回接口测量*自身*，即使没有任何历史数据，也能圈定问题范围。然后将今天的数值记录为此前缺失的基线；这样，同类事故第二次发生时，处理成本会比第一次低得多——但前提是有人把这个数值记录下来。

**最后，审查错误假设已经造成的破坏。** 链路性能下降不只是让速度变慢——它还会悄无声息地使你根据快速路径校准的所有超时设置失效，而这些超时会产生*看似成功的损坏产物*。在宣布事故结束之前，重新验证性能下降时间窗口内传输的所有内容；参见陷阱 18 和步骤 7。

**在更改原始工作负载的语义之前，先重放它。** 当路径或
节点变更恢复了具有代表性的传输速率后，使用原始的完整性约定重新运行
最初失败的确切操作：对于克隆事故，执行完整的 Git 克隆；
对于上传事故，传输完整的正文；对于流式传输事故，使用原始的
流式传输协议。小型健康检查请求、`ls-remote` 或
部分/浅克隆只能证明它们各自较小的路径可以正常工作。如果原始
工作负载现在能在现有截止时间内完成，则该证据表明无需采用
部分克隆或放宽超时等应用层变通方案。
如果它仍然失败，请保留该结果，然后再调查工作负载语义。
这遵循 RFC 6349 对持续 TCP 吞吐量与 RTT/存活性所做的区分：
验证必须传输足够多的数据，才能让传输容量的影响超过建立连接的成本。

### 步骤 1：收集每一跳的直接证据

在构建假设之前，收集：

- 请求路径中每一跳的服务端日志
- 客户端日志（浏览器开发者工具 HAR、CLI 调试日志、SDK 跟踪记录）
- 事故时间窗口内的指标（RPS、延迟、错误率、连接数、CPU/内存）
- 分布式跟踪记录（如有）
- 如果症状出现在网络传输层，则进行数据包捕获（参见 [references/packet-capture-recipes.md](references/packet-capture-recipes.md)）

如果其中缺少任何相关信息，**先补齐缺口，再进行猜测**。添加一个 `TRACE_*` 环境变量开关并重启容器，胜过花一个小时层层堆叠假设。[references/instrumentation-patterns.md](references/instrumentation-patterns.md) 中的插桩模式风险低、由环境变量控制，并且可以安全地永久部署到生产环境中。

#### 通过反向代理访问日志区分上传与处理耗时

Caddy 和 nginx 日志是证伪“后端很慢”这一判断成本最低的方式。重点关注三个字段：

| 字段                | Caddy JSON 键                     | nginx 变量                | 含义                                                               |
| ------------------- | -------------------------------- | ------------------------- | ------------------------------------------------------------------ |
| 总墙钟时间          | `duration`                       | `$request_time`           | 从收到客户端第一个字节 → 向客户端发送最后一个字节（或连接关闭） |
| 收到的正文总字节数  | `bytes_read`                     | `$request_length`（粗略） | 代理实际从客户端读取的字节数                                     |
| 声明的正文大小      | `request.headers.Content-Length` | `$content_length`         | 客户端声明将发送的字节数                                         |
| 响应状态            | `status`                         | `$status`                 | `0` / `-` 表示代理从未写入响应                                   |

**关键模式：**

- `bytes_read < Content-Length` 且 `duration ≈ timeout` → 上传超时。
- `bytes_read == Content-Length` 且 `status` 为 5xx → 处理超时。
- `status == 0` 且 `bytes_read < Content-Length` → 客户端/CDN 在上传完成前关闭了连接。

#### 跨整个技术栈追踪单个请求

对于 <project> 技术栈（Cloudflare → Caddy → <provider-gateway-service> → <upstream-capture-service> → <new-api-container>），标准追踪流程如下：

1. **Cloudflare**：从客户端错误或 Cloudflare Logpush 中获取 `Cf-Ray` 和时间戳。
2. **Caddy**：`docker logs <gateway-container> | grep <Cf-Ray>` → 提取 `X-Request-Id`（Caddy `uuid`），并确认 `bytes_read`、`duration`、`status`。
3. **<provider-gateway-service>**：查看 `docker logs <provider-gateway-service>` 中是否存在 `Client request error: aborted` 或请求/响应日志。
4. **<upstream-capture-service>**：`grep <X-Request-Id or timestamp> /data/<upstream-capture-service>/log/access.log` → 确认请求是否到达 <new-api-container>，以及上游处理耗时。
5. **<new-api-container>**：查看 `docker logs <new-api-container>` 中是否存在计费/渠道错误。

如果请求 ID 始终未出现在步骤 3–5 中，则故障发生在边缘层或请求体上传期间。

#### 按客户端 IP 聚合以发现模式

单次 524 可能只是偶发现象；如果 524 集中出现在同一个 IP + 同一条路径上，则是确凿证据。运行类似以下的聚合：

```bash
# Caddy JSON example: count failures by IP and body size for an endpoint
python3 -c "
import sys, json
from collections import Counter, defaultdict
stats = defaultdict(lambda: {'total': 0, 'fail': 0, 'slow': 0, 'max_cl': 0})
for line in sys.stdin:
    d = json.loads(line)
    req = d.get('request', {})
    if req.get('uri', '').startswith('/<openrouter-path>'):
        ip = req.get('headers', {}).get('Cf-Connecting-Ip', [''])[0]
        cl = int(req.get('headers', {}).get('Content-Length', ['0'])[0] or 0)
        dur = d.get('duration', 0)
        status = d.get('status', 0)
        s = stats[ip]
        s['total'] += 1
        s['max_cl'] = max(s['max_cl'], cl)
        if status == 0:
            s['fail'] += 1
        elif status == 200 and dur > 60:
            s['slow'] += 1
for ip, s in sorted(stats.items(), key=lambda x: -x[1]['fail']):
    print(f\"{ip}: total={s['total']} fail={s['fail']} slow={s['slow']} max_cl={s['max_cl']}\")
" < caddy-access-log.jsonl
```

如果某个 IP 占据了大部分故障，且其 `max_cl` 很大，请先调查上传带宽/路径，再调查后端。

### 步骤 2：包含证伪条件和威胁模型边界的假设

列出三个或更多可能的原因。对于每个原因，写三个句子：

- **什么可以证实它？**（容易做到，但往往具有误导性）
- **什么可以否定它？**（证伪条件——这才是关键）
- **干预措施针对的是哪个层级边界？**（威胁模型问题——迫使你精确说明修复措施将作用于何处）

第三个问题可以防止一种常见的反模式：提出作用于错误链路的修复方案。例如，通过向下游客户端写入字节实现的“保活”修复，对于_上游_空闲超时毫无用处——干预措施针对的边界与问题所在的边界不同。在开始编码前先明确边界，可以提前暴露这种不匹配。

如果你无法指出一个具体的反驳条件，那么该假设就是不可证伪的。标记它，但不要据此采取行动。如果你无法说明某个拟议修复针对的是哪一层边界，那么你还不理解该修复实际上做了什么。

### 第 3 步：决定性实验

对于网络层问题，默认方法是**分层隔离**：使用三条恰好只相差一跳的路径。以下是面向 CDN 前置服务的示例：

| 路径 | 路由                                  | 通过时可排除的因素                     |
| ---- | ------------------------------------- | -------------------------------------- |
| A    | 经由 CDN 的完整路径                   | 无——这是发生故障的基线                 |
| B    | 使用 `--resolve` 连接源站 IP（绕过 CDN） | CDN 层                                 |
| C    | 服务器环回（绕过 CDN + LB）           | CDN + LB                               |

如果只有 A 失败，那么原因在 CDN。如果 A 和 B 都失败，但 C 通过，那么原因在 LB。根据需要组合更多变体。有关使用模拟空闲上游的可运行模板，请参阅 [references/layered-isolation-experiment.md](references/layered-isolation-experiment.md)——该实验不需要等待一个能够配合触发问题的生产请求，可以精确控制空闲间隔。

对于非网络领域：

- 性能：仅改变一个变量的受控基准测试
- 正确性缺陷：能够复现问题的失败测试用例
- 间歇性问题：采样追踪 + 等待问题再次发生

### 第 4 步：必要时添加检测手段

如果决定性实验需要某项当前无法获取的观测数据，就添加相应的检测手段——不要跳过。规范模式是使用环境变量控制的检测机制，它应当：

- 默认关闭（稳定运行时的运行时开销为零）
- 无需更改代码，通过一个环境变量即可开启
- 写入便于 grep 检索的日志标签（`[SSE-CHUNK] ts=... req=... bytes=...`）
- 永久部署到生产环境中——未来的事故可以复用它

有关本次事故中用于诊断 <upstream-provider> 上游静默 125 秒问题的确切模板，请参阅 [references/instrumentation-patterns.md](references/instrumentation-patterns.md)。

### 第 5 步：执行并记录

执行一次实验，并完整记录：命令、环境、输入、观测到的输出、墙上时钟时间戳。将结果与第 2 步中做出的预测进行比较。如果实际结果与预测一致，则该假设经过了校准。如果不一致，则该假设是错误的——**不要使用临时拼凑的辅助假设来挽救它**（“哦，但也许 X 也造成了干扰……”）。返回第 2 步，从头编写新的假设。

### 第 6 步：反向审查

在确定根本原因或发布修复之前，安排独立审查者质疑该结论。向他们提供相同的证据，要求他们尝试证伪，而不是确认。对他们提出的每项发现应用四问筛选法：

1. **概率**——这真的会发生吗？
2. **成本**——修复与忽略它的成本分别是多少？
3. **现实场景**——这是否适用于用户的实际业务场景？
4. **验证**——我能否以较低成本确认或反驳这一点？

对每项发现进行分类：确有问题 / 部分正确 / 不太可能 / 会造成实际危害。绝不要将智能体的原始输出直接粘贴给用户；必须先进行筛选。参见 [references/counter-review-pattern.md](references/counter-review-pattern.md)。

### 第 7 步：修复并验证

应用修复。重新运行第 3 步中同一个具有决定性的实验。确认在此前能够稳定复现症状的相同设置下，该症状不再复现。如果修复后无法再复现修复前的状态，就无法证明修复有效——在宣布成功之前，先弄清楚为什么复现条件丢失了。

### 第 8 步：记录走过的弯路

调查中走过的弯路比正确答案更有价值。编写一份事件报告，记录：

- 症状 + 直接证据
- 尝试过的每个假设 + 如何将其证伪
- 决定性实验的设计 + 结果
- 修复 + 验证
- 新增的监控或检测手段

未来的调查人员——包括未来的自己——会阅读这份报告，以避免陷入同样的认知陷阱。

## 常见认知陷阱

1. **间接证据汇聚。** 五条间接线索都指向同一个方向，会让人感觉这就是证据。其实不是。如果直接探测的成本很低，就执行它。
2. **字段语义混淆。** `duration=5.95s` 可能表示总挂钟时间（在一种工具中）、处理程序执行阶段（在另一种工具中），也可能表示 TTFB（在第三种工具中）。在依据文档或代码核实其语义之前，绝不要引用数值字段。
3. **单一原因偏见。** 多层系统中的故障往往由多层缺陷共同造成。修复直接原因，但也要记录放大问题的因素，以便下一层防御也能得到加固。
4. **名称假设。** 标记为 `spot-instance` 的资源未必真的是竞价实例。应通过 API 验证其属性，而不是依赖元数据名称。
5. **探测自我验证。** 如果诊断工具通过已损坏的连接来测试这条已损坏的连接，其结果将无法解释。始终使用独立探测进行交叉验证。
6. **挽救假设循环。** 当证据与假设矛盾时，人们容易通过添加限定条件来挽救假设（“是的，但只在 X 情况下才会如此”）。要抵制这种诱惑。只要第一个反证成立，就应放弃该假设。
7. **未经验证的前提。** 调查一个从未被直接观察到、仅根据用户的不满、告警标题或下游影响推断出的症状。应先进行验证（第 0.5 步）。不要调查传闻。
8. **威胁模型不匹配。** 提出的修复针对了错误的层级——试图通过向下游写入字节来解决上游问题，或调整一个永远不会触发超时的链路节点。明确每个假设所针对的边界（第 2 步），有助于暴露此类问题。
9. **反向路径 / 方向不对称。** A→B 健康 ≠ B→A 健康。从外部探测某个节点，只能证明该节点的返回/入站方向；网络路径和拥塞具有方向性。在宣布某个链路节点健康之前，应从用户侧沿用户流量的同一方向进行测量（从受影响的源端运行 TCP 模式的 `mtr`/`nexttrace`）。
10. **边缘超时伪装成上游客户端中止。** Cloudflare 返回的 524 可能导致源站代理（Caddy/nginx）将上游连接记录为“客户端中止”（`status=0`、`Client request error: aborted`）。在源站看来，中止确实发生了，但其_原因_是 CDN 边缘节点率先超时。在将中止归因于客户端之前，务必关联分析边缘错误代码、边缘时间戳和源站日志。参见第 0.6 步中的上传与处理判别方法。
11. **假设位于列表顶部的代理规则优先于 CNAME 匹配。** 会解析 CNAME 的代理客户端可能会对解析得到的 CNAME 链应用规则，而不只是对原始主机名应用规则。`DOMAIN-SUFFIX,<cname-suffix>,DIRECT` 规则可能覆盖显式的 `DOMAIN,<target>,PROXY` 规则。应通过检查配置，并经由代理分别测试主机名路径和 IP 路径来验证。
12. **代理节点 DNS = 客户端 DNS。** 代理节点解析主机名的结果可能与客户端不同。客户端侧的 DoH 查询可能返回一个可用 IP，而代理节点却返回被封锁或不可路由的 IP。使用 `curl -x proxy -H 'Host: host' -I https://<working-ip>` 进行测试，以区分 DNS 问题和可达性问题。
13. **指纹 ≠ 身份。** 服务横幅、端口特征或 MAC OUI 都是容易被模仿的提示，不能证明设备究竟是什么。一个在端口 5000 上响应、带有 `Server: AirTunes/…` 标头且不广播 `_raop` mDNS 的设备，“看起来像”一个自行搭建的 Linux AirPlay 接收器（shairport-sync）——实际上它是 macOS AirPlay Receiver（ControlCenter 监听端口 5000/7000），而现代的 `OpenSSH_10.x` 横幅才是揭示真相的线索。在同一起事件中，一个带有 Realtek OUI 的 MAC 地址让人以为该设备“与 NAS 属于同一厂商系列”，但它实际上来自连接到 Mac 的 USB 以太网适配器。在断定设备究竟是什么之前，应检查其自我身份凭据：对照 `~/.ssh/known_hosts` 检查 SSH 主机密钥（具有决定性——一台主机对应一个密钥）、mDNS 主机名解析结果、AirPlay `/info` plist（设备自行报告的名称/型号/osBuildVersion）。应将横幅和 OUI 视为需要证伪的假设，绝不能将其作为结论。
14. **在一个网段上不可达 ≠ 已停机。** 探测只能证明执行探测的 L2 域中的情况。更换路由器后，旧路由器在以太网上不响应 ARP——看似“已停机”——但它的 Wi-Fi AP 仍在广播并提供 DHCP 服务，因此保存了凭据的设备会悄悄加入一个无法访问 WAN 的网络。在断定目标已消失之前，应从目标自身的视角验证（检查它的其他接口，例如在设备本身运行 `ipconfig getifaddr en1`）；完成任何拓扑变更后，都应物理关闭退役设备的电源——一台看似“已停机”但仍提供 DHCP 服务的路由器，是一个会不断吸引设备接入的陷阱。
15. **拓扑变更会使手动配置 IP 的设备成为孤岛。** DHCP 客户端会自动跟随新网络；使用手动/静态 IP 的设备会继续保留旧网关和 DNS，从而成为沉默的孤岛——其他设备无法访问它们，它们也无法访问任何设备。macOS 的“Manually Using DHCP Router Configuration”让这个问题更难察觉（手动 IP + 从旧 DHCP 获取的路由器）：地址看起来像是有意配置的，而网关却已经过时。每次更换路由器或子网后，在宣布迁移完成之前都应进行全面排查：检查旧子网上的 ARP 条目、解析到旧子网地址的 mDNS 名称，并重新验证每台已知的静态 IP 设备（服务器、NAS、打印机）的网关和 DNS。

16. **把路径*类型*字段误读为路径*容量*字段。** Mesh-VPN 和代理状态行报告的是如何连接到某个对等节点——`direct` 还是 `relay`，以及端点地址。这只能回答“是否进行了打洞？”，绝不能回答“速度有多快？”两者可能存在巨大差异：在这个陷阱背后的事故中，无论是在 0.09–0.11 MB/s 的状态下，还是在 11–16 MB/s 的状态下，状态行都显示 `active; direct <endpoint>`——同一个字段、同一个词，速度却相差两个数量级——因为较慢的是一条跨 WAN 的直连路径，而较快的是一条跨 LAN 的直连路径。RTT 同样无法更好地预测容量：*较慢*状态的延迟看起来反而更低，为 12 ms，而较快状态为 4 ms。两者都是对某种事物的真实测量，但都没有测量容量。请测量速率（步骤 0.7），并把状态字段当作无关紧要的拓扑信息。

17. **把你自己的探测行为造成的问题归咎于远端主机。** 在得出“服务器很慢”的结论之前，请先确认你发出的请求就是你原本打算发出的请求。格式错误的标识符通常会走一条比有效标识符*更慢*的路径——查找未命中会触发完整扫描，然后返回错误——因此，一个有问题的探测请求恰好会制造出你正在寻找的“另一端不堪重负”这一表象。真实案例：一个 Windows 风格的对象键（`…\archive\…`）通过 shell 插值，而 shell 将 `\a` 吞掉并解释成了 BEL 字节；损坏的键未命中任何索引，服务扫描了约 21 秒，最终返回一个 17 字节的 `404`。如果将其解读为“返回空内容都用了 21 秒——主机过载了”，就差点使整个调查转向错误的方向。识别这一问题的线索是有效载荷大小：**用 21 秒传送 17 字节并不是带宽症状**，而是服务器端扫描；如果扫描的是一个不存在的对象，问题通常出在你的键，而不是对方的磁盘。请在不经过 shell 的情况下重新构造探测请求（使用带参数向量的脚本），重新测量后再进行归因。

18. **错误的容量假设会悄无声息地损坏产物，同时通过成功检查。** 吞吐量下降造成的影响并不会局限于“速度变慢”——它会使基于健康路径校准的所有超时设置失效，而被*你自己的*超时机制终止的传输会留下一个截断文件，而不是错误。你能否注意到这一点，完全取决于成功检查测量的内容——而一个*看似合理*的大小下限也救不了你。在这个陷阱背后的事故中，获取循环检查的是 `HTTP 200 && bytes > 1000`，听起来像是一项真正的完整性检查；然而，尽管其中 14 个文件被截断，它仍然让**全部 35 个**下载通过了检查。180 秒的上限在健康速率下绰绰有余，但在降级后的速率下根本不可能完成传输；被终止的传输仍然带有 `200`，因为状态行早在正文停止传输之前就已到达；它们也仍然超过了 1000 字节，因为即使被截断，多兆字节文件的大小与任何你想得到的阈值相比都极其庞大。**任何字节数下限都无法区分“完整文件”和“文件的大部分”**——这是文件格式自身的属性，而不是文件大小的属性。有两种持久可靠的修复方法：**检查传输的退出状态，而不只是响应状态**（HTTP 200 描述的是响应的开始；只有退出代码才能描述其结束），以及**根据产物自身的格式验证产物**——带有终止标记的容器（`%%EOF`、`IEND`、结束帧）可以自行证明其完整性。这项检查也能用于事后审计影响范围：带有终止标记的文件与解析器接受的文件完全一致，都是 21 个，从而将“某些下载可能有问题”转化为一份精确的列表。

[references/cognitive-traps.md](references/cognitive-traps.md) 收录了陷阱 1–12 的扩展说明（救援循环警告、字段语义示例）。陷阱 13–18 并未记录于该文件中，而是记录在其来源案例研究中：13–15 位于 LAN/拓扑材料中，16–18 位于 [references/case-throughput-collapse-no-errors.md](references/case-throughput-collapse-no-errors.md) 中。

## 客户端代理 / VPN / TUN 路由错误

当症状是**特定于客户端的**（某台机器上的浏览器无法访问，但其他设备或网络可以正常访问，或者关闭代理/VPN 后故障消失）时，代理客户端本身就是网络中的一跳。应将其视为网络跳点来处理。

快速差异诊断检查清单：

1. **DNS**：操作系统将域名解析为什么 IP？如果是假 IP/TUN IP（例如 `198.18.x.x`），说明代理客户端正在拦截 DNS。
2. **路由**：`route -n get <ip>` 会显示数据包从哪个接口发出。对于 TUN 模式，假 IP 通过 `utun5` 路由是正常现象；如果真实 IP 只能通过 TUN 路由，而物理接口无法访问它，则说明本地直连已失效。
3. **代理端口**：本地代理是否正在监听？可使用 `lsof -P -i TCP:<port>` 确认。分别在使用和不使用代理的情况下进行测试。
4. **通过代理访问主机名与 IP**：
   - `curl -x http://127.0.0.1:<port> -I https://<host>`
   - 自行解析主机（使用 DoH），然后执行 `curl -x http://127.0.0.1:<port> -k -H 'Host: <host>' -I https://<ip>`
   如果第二种方式成功而第一种失败，则说明代理节点的 DNS 返回了与客户端 DoH 查询结果不同或错误的 IP。
5. **物理接口可达性**：临时强制真实 IP 通过 `en0`（或当前活动的物理接口）发出。如果该路径失败而 TUN 路径成功，则说明本地网络无法访问目标；必须使用代理/TUN。
6. **规则/CNAME 交互**：检查代理配置中是否存在匹配目标 CNAME 后缀的规则。如果客户端会依据解析后的 CNAME 评估规则，则 `DOMAIN-SUFFIX,<cname-suffix>,DIRECT` 规则可能会覆盖显式的 `DOMAIN,<host>,PROXY` 规则。

如果以上所有检查都指向代理客户端解析到了错误的 CNAME，或依赖了代理节点上有问题的 DNS，请参阅 [references/case-proxy-tun-cname-override.md](references/case-proxy-tun-cname-override.md) 中的修复模式。

## 反模式——需要明确避免的做法

- **在找到可证伪条件之前就急于修复。**“可能是 X，让我重启 / 调整 / 升级一下。”这种做法会把学习机会变成原因不明的修复，无法防止问题再次发生。
- **全盘接受代理的反向审查发现。**代理往往会产出过多的风险发现。采取行动前先进行筛选（参见上文的四问筛选法）。
- **绕过 IaC 临时修改生产环境。**如果调查需要更改生产环境，应先修改事实来源，再应用变更——否则“修复”会在下次部署时消失，而配置漂移会掩盖真实状态。
- **根据单一观察结果宣布根本原因。**必须先尝试证伪。
- **没有重新运行失败实验就写下“现在应该可以了”。**重新验证。

## 案例研究

四个典型案例展示了该方法在不同故障模式下的应用：

1. [references/case-sse-rst-130s.md](references/case-sse-rst-130s.md) — 一次长达 5 小时的调查，期间助手反复得出错误结论。正确答案是 Cloudflare 边缘节点的 HTTP/2 流空闲超时时间为 126 秒，而 <upstream-provider> 在 <model-name> 的 tool_use 生成期间未发送 SSE ping，进一步放大了该问题；当一个子代理设计出包含模拟空闲上游的三路径分层隔离实验后，仅用 10 分钟便找到了答案。

2. [references/case-cloudflare-524-upload.md](references/case-cloudflare-524-upload.md) — `<api-domain>/<openrouter-path>` 上出现 Cloudflare 524，其中约 6 MB 的 POST 请求体从美国客户端上传到 <origin-region> 源站所花的时间，超过了 Cloudflare 默认允许的源站读取超时时间。关键洞察来自将 `bytes_read`（4.1 MB）与 `Content-Length`（6.0 MB）进行比较，并确认请求从未到达 `<upstream-capture-service>` 或 `<new-api-container>`。此案例是上文上传与处理判别方法以及“边缘超时伪装成客户端中止”陷阱的来源。

3. [references/case-proxy-tun-cname-override.md](references/case-proxy-tun-cname-override.md) — 一个客户端侧 `<proxy-client>` TUN 案例，其中 `<auth-domain>` 出现 `ERR_CONNECTION_CLOSED`，尽管显式 PROXY 规则位于配置顶部。根本原因是 `DOMAIN-SUFFIX,<cname-suffix>,DIRECT` 规则匹配了目标的 CNAME 链，此外，代理节点自身的 DNS 返回了与客户端 DoH 查询不同的 IP。修复模式使用 `[Host]` 映射和 `use-local-host-item-for-proxy`。

4. [references/case-throughput-collapse-no-errors.md](references/case-throughput-collapse-no-errors.md) — 这是此处唯一一个**完全没有错误字符串**的案例：全程为 HTTP 200、RTT 为 12 ms、健康检查端点响应时间为 0.04 s，并且链路传输速率为 0.09–0.11 MB/s。三个小时被耗费在“验证阶段很慢”→“主机的上行链路一定只有约 1 Mbps”→“问题出在中继”这些判断上，它们都看似合理，却没有一个得到验证。共享同一路径但不涉及应用程序代码的两个通道（一个 HTTP 服务和纯 SSH）的结果相差约 20%，只用一条命令便确定了结论：问题在路径，而不在服务。此案例是步骤 0.7 和陷阱 16–18 的来源，其中还包括由错误速率推导出的 180 秒超时如何截断 35 个下载中的 14 个，而这些下载全部通过了 `200 && bytes > 1000` 检查。

在将此技能应用到不熟悉的问题领域之前，请先阅读这些案例；其中对错误转向过程的剖析才是教学重点。

## 参考文件

- [references/layered-isolation-experiment.md](references/layered-isolation-experiment.md) — 三路径技术、模拟上游模板、结果矩阵
- [references/instrumentation-patterns.md](references/instrumentation-patterns.md) — 由环境变量控制的 TRACE\_\*、可供 grep 检索的日志标签、部署检查清单
- [references/packet-capture-recipes.md](references/packet-capture-recipes.md) — 用于隔离 RST 的 tcpdump 过滤器、Docker 上的接口选择、HTTP/2 解码
- [references/counter-review-pattern.md](references/counter-review-pattern.md) — 四代理团队构成、四问题过滤器、集成工作流
- [references/cognitive-traps.md](references/cognitive-traps.md) — 扩展示例、补救循环警告
- [references/case-sse-rst-130s.md](references/case-sse-rst-130s.md) — 包含错误转向时间线的典型案例研究
- [references/case-cloudflare-524-upload.md](references/case-cloudflare-524-upload.md) — 上传超时与处理超时判别方法
- [references/case-proxy-tun-cname-override.md](references/case-proxy-tun-cname-override.md) — 客户端侧代理/TUN CNAME 规则覆盖及修复模式
- [references/case-throughput-collapse-no-errors.md](references/case-throughput-collapse-no-errors.md) — 所有信号均正常时的吞吐量下降；双通道容量隔离；制品被截断的后续影响

## 脚本

- [scripts/mock-idle-upstream.py](scripts/mock-idle-upstream.py) — 一个 SSE 服务器，发送一帧后空闲 N 秒。在分层隔离实验中将其用作上游，以精确控制空闲间隔。
- [scripts/layered-isolation-probe.sh](scripts/layered-isolation-probe.sh) — 运行三路径 A/B/C 对比并输出诊断矩阵。