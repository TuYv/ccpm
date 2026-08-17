---
name: debugging-network-issues
description: >-
  Evidence-driven investigation for network, streaming, and protocol-layer bugs where symptoms don't match the obvious cause. Use when debugging connection resets (ECONNRESET, HTTP/2 RST_STREAM, INTERNAL_ERROR), SSE or long-polling stalls, fixed-time connection drops, CDN/proxy/CGNAT idle timeouts, client-side proxy/VPN/TUN misrouting, CNAME-based proxy rule overrides, or symptoms like "socket closed unexpectedly", "stream interrupted", "fails after N seconds", "works sometimes but not always", "upstream silent for X seconds", ERR_CONNECTION_CLOSED, SSL_ERROR_SYSCALL, or certificate-verification errors (UNKNOWN_CERTIFICATE_VERIFICATION_ERROR, wrong-site certificate) that hit some domains while others work. Also use for throughput collapse where nothing errors at all — "it works, it's just slow", transfers crawling, downloads truncating. Also for LAN-layer mysteries: unknown device (mystery IP/MAC/banner), devices silenced by a subnet change, or a host declared "dead" that is alive on another segment.
---
# 调试网络问题

一种由证据驱动的调查方法，适用于显而易见的原因很可能是错误判断的事故。该方法源自一个真实的、持续 5 小时的生产环境案例（参见 [references/case-sse-rst-130s.md](references/case-sse-rst-130s.md)）：由于不断叠加假设，浪费了数小时，而一个 10 分钟的分层实验本可解决问题。

当用户报告网络、流式传输或协议方面的症状，而调查人员想仅凭一行日志或一个间接数据点就作出诊断时，请应用此技能。此技能的作用就是抑制这种冲动。

## 首先进行分诊——这是否属于已知领域？

在应用下面的通用方法之前，请先检查症状是否指向此仓库中已有专用技能的技术栈。这些技能包含从特定领域的症状到原因再到修复方案的对应表，而本技能刻意保持通用，不涉及这些内容——请先从相应的专用技能开始；如果最终发现根本原因在其他地方，再回到这里使用本方法。

| 如果症状是……                                                                                                                                                                                       | 首先使用                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| macOS Tailscale 与代理/VPN 冲突（Shadowrocket / Clash / Surge）：`tailscale ping` 正常，但 SSH/curl/git 失败，出现 `Connection closed by 198.18.x.x`、TUN DNS 劫持、约 60 秒的 `getaddrinfo` 解析器停滞 | **tunnel-doctor**                            |
| Cloudflare 配置：`ERR_TOO_MANY_REDIRECTS`、SSL 模式不匹配、橙色云代理下的 DNS / 代理状态问题                                                                                        | **cloudflare-troubleshooting**               |
| Windows App / AVD / W365 RDP 连接质量问题：使用 WebSocket 而非 UDP Shortpath、RTT 较高、STUN/TURN 干扰                                                                                    | **windows-remote-desktop-connection-doctor** |
| 客户端代理 / VPN / TUN 路由错误：只有某个特定站点出现 `ERR_CONNECTION_CLOSED` 或 `SSL_ERROR_SYSCALL`，其他站点正常，DNS 返回伪造/TUN IP，并且添加 PROXY 规则也无济于事 | **本技能**——请先阅读 [references/case-proxy-tun-cname-override.md](references/case-proxy-tun-cname-override.md) |
| 所有经 DIRECT 路由的域名/国内域名同时出现 TLS 证书验证错误（`UNKNOWN_CERTIFICATE_VERIFICATION_ERROR`、证书属于错误的站点）或握手中途 EOF，而代理域名正常——且所有代理健康监控仍显示正常                                        | **tunnel-doctor**（TUN DIRECT 脑裂排查步骤） |
| **没有任何错误——只是很慢。** 每个请求都返回 200，延迟和健康检查看起来都正常，但传输速度极慢、批量作业超过预计耗时，或收到的文件不完整 | **本技能**——直接前往 [步骤 0.7](#step-07-throughput-collapse--when-nothing-errors-and-everything-is-slow)；基于错误的排查步骤在这种情况下无从着手 |

如果都不匹配——或者你已尝试使用某个领域技能，但证据指向其他方向——请继续阅读下文。该方法可推广到任何多层系统。

> **特别针对本技能的说明**：如果症状是在**大型 `POST` 请求体**（例如 `/<openrouter-path>` 且 `Content-Length` > 1 MB）上出现 Cloudflare 524/522，故障原因通常是**上传到源站所需的时间超过了 Cloudflare 的源站读取超时时间**，而不是后端响应缓慢。在认定后端卡顿之前，请先使用下面的上传与处理检查清单。

## 核心原则

### 1. 证据优先于假设

如果你无法指出某个具体依据——日志行、pcap 帧、探测输出或指标样本——那么你只是在猜测，而不是在诊断。在断言“X 是原因”之前，必须能够说出直接证据是什么。如果直接证据尚不存在，请先添加检测手段（参见 [references/instrumentation-patterns.md](references/instrumentation-patterns.md)）或捕获证据（参见 [references/packet-capture-recipes.md](references/packet-capture-recipes.md)），然后再继续。

### 2. 证伪优先于证实

N 个独立来源“证实”某个假设，并不能使它成为事实。一项证伪观察即可将其排除。在依据某个假设采取行动之前，请回答：

> “什么观察结果会让我放弃这个假设？”

如果答案是“没有”或“我想不到”，那么该假设就是不可证伪的，不得用它来推动调查。如果答案是具体的，就先去寻找该观察结果，再决定是否采取行动。

### 3. 分层隔离

多跳系统（客户端 → CDN → LB → 反向代理 → 应用 → 上游）的缺陷往往集中在层与层之间的衔接处。当某种症状可能来自多个层时，**不要推断是哪一层；直接测试**。标准方法是：让同一个逻辑请求通过三条或更多条路径执行，每条路径之间恰好只相差一跳，然后比较症状出现在哪里。这种方法几分钟内就能解决的问题，靠不断叠加假设可能数小时都无法解决。参见 [references/layered-isolation-experiment.md](references/layered-isolation-experiment.md)。

**同样的技术不仅能隔离正确性问题，也能隔离容量问题。** 当症状表现为速率而不是错误时，应改变的是*技术栈*而不是*跳数*：通过两个共享网络路径但不共享任何应用代码的通道，测量同一方向的性能。这是避免继续调优一个从来都不是瓶颈的应用的成本最低的方法。不要把结果简单概括为“结果一致就说明是路径问题”——这只在两个通道都*慢*时成立；两个快速通道意味着探测未能复现症状，因此完全无法证明任何事情。有关如何解读这四种结果中的每一种，请参见步骤 0.7。

### 4. 提交前进行反向审查

在确定根本原因或发布修复之前，请让独立审查者质疑结论，而不是确认结论。智能体擅长发现单个调查者未曾想到的风险，但不擅长权衡这些风险。在让任何发现影响行动之前，都要应用四问筛选法（参见 [references/counter-review-pattern.md](references/counter-review-pattern.md)）。

### 5. 绿色健康检查只证明其探测路径是健康的

监控只会观察其作者设想到要探测的路径。多平面系统——例如具有 DIRECT 平面和代理平面的 TUN 代理、具有数据平面和控制平面的服务、具有后端 API 和 Web 登录页面的技术栈——往往每次只有一个平面发生故障，而仅探测另一个平面的看门狗会在整个故障期间始终保持绿色。在这一原则背后的事故中，一个代理健康检查守护进程每 5 分钟通过代理探测一个海外端点；在直连平面完全不可用的同时，它仍连续 2 个多小时记录 "healthy"。

在接受“监控显示它是健康的”作为证据之前，先问一句：**这项检查实际经过的究竟是哪条路径？** 其绿色状态只能作为该路径健康的证据。列举系统实际转发或提供服务的各个平面，并直接探测发生故障的那个平面——本可发现此次故障的检查通常只差一次 curl。

**一项检查也只能证明其规模足以测量的那个*量*。** 路径覆盖是一个维度；规模是另一个维度，而吞吐量崩溃往往就隐藏在后者之中。存活探针只返回几百字节，因此其耗时主要由握手和往返时间决定——在案例研究中，它一整天的响应时间都保持在 40 ms，即使链路的实际容量出现了 100× 的波动也毫无变化；而它并没有撒谎：它确实准确完成了自己所测量的事情。`ping`/RTT 也是如此，它测量的是一个小数据包的往返时间，并不能说明容量。

实用规则是：**只有当传输时间在总耗时中占主导时，探针才真正测量了链路。** 因此，应根据你需要获得的答案来确定探针规模，而不是只图方便——如果探针远不到一秒就返回，那么其中几乎所有时间都花在了建立连接上，你测量到的也只是连接建立过程。可以通过设定*时间*预算而非字节预算，完全绕开规模选择问题（持续传输 N 秒，再用收到的数据量除以 N）；步骤 0.7 中的命令正是这样做的，这也解释了为什么即使链路已经慢如蜗牛，它们的开销仍然很低。把问题扩展为：**哪条路径，以及多大规模？**

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

明确而严格的范围决定了调查只需 20 分钟还是耗时 5 小时。在查看任何内容之前，先提取：

- **确切的错误字符串**（复制粘贴，不要转述）。`socket closed` 与 `ECONNRESET` 不同，也与 `HTTP/2 RST_STREAM INTERNAL_ERROR (err 2)` 不同。
- **确切的时间戳**（使用带时区的 ISO-8601 格式，而不是“昨天晚上”）
- **可复现性**（每次发生 / 间歇发生 / 仅特定用户发生）
- **哪些人受影响，哪些人不受影响**（差异性观察可以缩小搜索范围）
- **最近发生了什么变更**（部署、配置、上游依赖项、客户端版本）

区分症状与诊断。“慢”不是症状。“请求耗时 130.898 秒，随后返回 HTTP/2 INTERNAL_ERROR”才是。

**但不要因为这句话就把真实事故归入无需调查的类别。** 它要求的是量化，而不是错误代码——有一整个故障类别只能量化为一个*速率*，且自始至终不会出现任何错误代码：每个请求都返回 200，没有任何连接被重置，但系统仍然无法使用。当你将“慢”表述为**在给定负载大小下每秒传输的字节数**时（“8.4 MB 在 95 秒内传完 = 0.09 MB/s，全程 HTTP 200”），它就成为了症状。一旦得到这个数字，步骤 0.7 中就有一项可以得出明确结论的实验。真正不在范围内的是*未经测量的*抱怨——“用户说感觉很慢”——这是步骤 0.5 要解决的问题，而不是本步骤的问题。

### 步骤 0.5：验证前提

在投入完整调查之前，先确认报告的症状确实正在发生，而不是仅根据下游影响或用户的不满推断出来的。一次成本低廉的直接观察，胜过花费数小时调查一个并不存在的问题。

询问：**“有哪些直接证据表明这个症状确实存在？”**

- 如果用户报告“在 130 秒时超时”：这是来自带时间戳的日志、浏览器网络面板，还是回忆？
- 如果用户报告“连接重置”：他们是否看到了数据包，还是根据重试次数激增推断出来的？
- 如果用户报告“有些人会失败，另一些人不会”：是否已在受控测试中复现，还是仅仅来自传闻？

可接受的前提：

- 包含时间戳和错误字符串的日志行
- 显示故障的浏览器 DevTools Network 截图
- 可按需复现症状的命令
- 显示特定错误数量上升的指标图表

不足以作为前提：

- “用户说感觉很慢”
- “告警触发了，但我没有检查实际失败的内容”
- “上周有人提到过……”

如果前提验证失败，需要修复的是观测能力，而不是开展调查。补充缺失的遥测，在监控就绪后等待问题再次发生，拿到真实数据后再回来调查。不要屈从于沉没成本心理，仅仅因为“反正我们已经开始了”就继续调查。

### 步骤 0.6：大型 POST 请求体的上传超时与处理超时

对于由 CDN 代理的、请求体较大的 `POST`/`PUT` 端点，最常见的误诊是将问题归咎于后端处理缓慢，而真正的问题其实是**请求体上传耗时超过了 CDN/代理的源站超时时间**。

当症状是在 `Content-Length > ~500 KB` 的请求上出现 524/522/504 时，请使用以下子检查清单：

1. **找到边缘/反向代理访问日志**（Caddy、nginx、Envoy、Cloudflare Logpush）。
2. **比较 `bytes_read`（或等效字段）与 `Content-Length`**：
   - `bytes_read == Content-Length` 且 `status` 为错误状态 → 很可能是后端/处理问题。
   - `bytes_read < Content-Length` 且连接在超时时间窗口附近关闭 → **上传问题**。
3. **检查 `duration` / `request_time` 的语义**：
   - Caddy `duration` = 从读取第一个字节到响应结束的实际经过时间。
   - nginx `$request_time` = 同上。
   - <upstream-capture-service> / 应用的 `request_time` = 完整接收请求体后，后端处理所花费的时间。
   - 如果代理的 `duration` ≈ 超时时间，但上游的 `request_time` 很短或根本没有记录，则请求体上传是瓶颈。
4. **查找 `status=0`（Caddy）或 `-`（nginx）**：
   - `status=0` 表示代理从未写入 HTTP 响应，通常是因为下游/客户端侧先关闭了连接。
5. **与上游日志进行关联**：
   - 如果请求 ID / ray ID / trace ID **没有出现**在上游（<new-api-container>、<upstream-capture-service>、应用）日志中，则请求从未完成上传。

**上传超时型 524 的示例特征：**

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

### 步骤 0.7：吞吐量崩溃——没有任何报错，但一切都很慢

上面的方案（0.6）处理的是*超时*——一种可以通过 grep 搜索的错误代码。本方案处理的是**完全没有错误**的一类问题：每个请求都成功，每项健康检查都是绿色，但由于字节到达速率只有预期速率的一小部分，系统完全无法使用。这是最有可能被误诊数小时的故障模式，因为整套由错误驱动的工具链都无从下手。

**为什么常规信号全都显示绿色**——在链路性能下降 100 倍时，以下所有现象曾同时出现：

| 信号 | 显示结果 | 为什么它仍然显示绿色 |
| --- | --- | --- |
| HTTP 状态 | 所有请求均为 `200` | 慢并不是错误；响应仍会完成，只是完成得很晚 |
| 往返延迟 | 12 ms | RTT 测量的是小数据包的往返时间；它**不是**容量测量指标 |
| 存活性/健康端点 | `0.04 s` | 它的响应大小与握手数据相当，因此其耗时完全来自 RTT，而不涉及传输。**如果探针在链路成为限制因素之前就已完成，它便无法测量该链路**——参见原则 5 |
| 传输状态字段 | `active; direct <endpoint>` | 报告的是**路径类型**，而不是路径容量——参见陷阱 16 |

所以第一步是停止查看状态，转而**测量速率**。

**决定性实验：两个独立通道、同一方向、相同时间预算。**

这是将原则 3 的分层隔离应用于容量而非正确性。选择两个通过相同网络路径到达同一主机、但**不共享任何应用程序代码**的通道——关键在于，如果二者的结果一致，就不可能是其中任何一方的内部机制造成的。

下面两个命令都**按时间设定预算，而不是按大小设定预算**：它们会持续传输固定的秒数，并报告实际收到的数据量。这样，无论链路状况多么糟糕，探测成本都保持不变——在案例研究中，一个固定的 8 MB 载荷在健康路径上用时不到一秒，而在性能下降的路径上用时约 90 秒；如果性能下降得更严重，等待时间将无限增长，而这恰恰发生在你最无力承担这种等待的时候。这也解释了为什么这两个数字可以比较：秒数相同、方向相同，而且都在**接收端**测量。

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

> **不要用 `dd` 自己的摘要行代替通道 B 的数字。** `dd if=/dev/zero … ` 报告的是它向*自身标准输出*写入数据的速度；对于通过管道传输的 SSH 数据，这些数据会被管道和 SSH 的通道窗口接收——它测量的是本地写入，而不是线路传输，并且完全没有计入连接建立时间。在案例研究的健康路径上进行测量时，原始 SSH 以 44 MB/s 的端到端速率传输了 33.6 MB，而在同一次传输中，`dd` 自行报告的速率为 54.9 MB/s。发送端速率只是线路速率的上限，绝不是对线路速率的测量。应像上面那样，从接收端对整个调用计时。

**这两个通道的绝对数值预计会有差异——这不是问题。** 在同一条健康路径上，原始 SSH 测得约 44 MB/s，而通过媒体服务获取数据时测得 11–16 MB/s，因为除了线路传输外，通道 A 还要承担该服务自身的读取和编码工作。这就是为什么下面的判定规则关注的是**数量级**而不是数值相等：你要测试的是两个通道是否处于同一速率区间，而不是它们是否打印出相同的数字。如果两个通道在健康链路上的速率相差 3 倍，而在性能下降的链路上都骤降至 0.1 MB/s，那么它们已经准确提供了你所需要的信息。

**在查看表格之前，请确认两个探测都确实运行过。** 这是将陷阱 17 应用于你自己的操作步骤，也是此处最容易导致你自信地得出错误答案的情况：一个从未实际传输任何数据的探测会产生*很低或为零的速率*，而下表会将其解读为“慢”，并直接把问题归因于“路径”——这是根据一次根本没有发生过的测量得出的结论。有两项检查，而且成本都很低：

- **通道 A**：`size_download` 是否接近对象的实际大小？DNS 解析失败（curl 退出码 6）、连接被拒绝（退出码 7）或 404 错误页面都会快速返回少量数据——这甚至可能被判断为*快*，导致你从相反方向落入错误的行。只有退出码 28（`--max-time` 在传输过程中触发）意味着“测量结果有效，只是对象大小超出了预算”。
- **通道 B**：`$B` 是否很可能非零？该命令中的 `2>/dev/null` 会隐藏 SSH 自身的错误，因此，对于你无法通过身份验证的主机，它会静默地产生 `B=0`。如果这个数字看起来不对，请去掉 `2>/dev/null` 再运行一次。

将结果视为一个四分支测试——四种结果都有可能出现，其中三种意味着你应该停止正准备进行的操作：

| 通道 A | 通道 B | 结论 |
| --- | --- | --- |
| 慢 | 慢 | **路径问题。** 两个彼此无关的技术栈不可能因为彼此无关的原因而以相同速率变慢。停止调优应用程序——其内部的任何调整都无济于事。转到下文的“路径发生了什么变化”。 |
| 慢 | 快 | **应用程序/服务问题。** 路径显然可以传输数据；A 却不行。现在你有了一个可用于对照排查的有效参照。 |
| 快 | 慢 | **暂时无法得出结论——你的对照本身存在异常。** 可能是 SSH 特有的开销（弱 CPU 上的加密算法、某一跳对 SSH 进行限速），也可能是 B 经过了不同的路径。不要得出“服务没有问题”的结论；请使用第三种技术栈替换 B，然后重新运行。 |
| 快 | 快 | **探测未能复现该症状。** 不要宣布事件已经解决。实际工作负载在某个你尚未复现的维度上有所不同——方向（上传与下载）、并发量、对象大小或时段。先改变其中一个因素并重新测量，然后再相信这个正常结果。 |

**怎样才算“速率相同”？** 就此用途而言，将差异在 **约 20%** 以内视为速率相同——两个通道在封装、加密和单对象开销方面存在差异，因此既不期望也不要求二者完全相等。这里的判断着眼于数量级：两个技术栈分别测得 0.09 和 0.11 MB/s，二者一致；0.1 和 12 MB/s 则不一致。如果差距介于约 20% 和约 2 倍之间，应将其视为尚无定论，并扩大预算或对象大小，而不是贸然选择一方。

**没有 SSH 时如何搭配通道 B。** 唯一要求是*同一主机、同一方向、不共享应用程序代码*——SSH 只是方便，并无特殊之处。以下任何一种方案都可以：主机上的另一个无关服务（指标端点、对象存储、静态文件服务器）、容器运行时传输（从该主机执行 `docker cp`）、可以在两端运行的原始吞吐量工具（`iperf3 -c`），或者主机自身的软件包/制品镜像。不符合要求的是同一服务的另一个端点——它与待排除嫌疑的服务共享代码，因此即使结果一致也无法证明任何事情。

**然后查明路径发生了什么变化。** 一旦确定路径有问题，变量通常是拓扑而非硬件：流量今天实际经过的路由与昨天有何不同。对于网状 VPN（Tailscale、Nebula、ZeroTier）和分流隧道代理，同一个逻辑地址可能通过局域网直连路径、广域网直连路径或中继提供服务——这些路径的容量可能相差一个数量级，而且**状态字段或你连接的地址不会发生任何变化**。让传输层报告其实际使用的路径（`tailscale ping <host>` 会输出端点，以及回复是否通过中继传来）。

如果没有可供比较的、先前已知正常的测量结果——首次发生事故时通常如此——你仍然可以在没有基准的情况下取得进展，因为“这里是否发生了变化？”这个问题有一种成本更低的替代方法：**从其他位置测量同一条路径。** 使用位于不同网络中的第二个客户端，或者让主机通过环回接口测量*自身*，无需任何历史数据即可界定问题范围。然后，将今天的数值记录为此前缺失的基准；这样，这类事故第二次发生时的处理成本会比第一次低得多，但前提是有人把这个数值记录下来。

**最后，审查错误假设已经造成了哪些破坏。** 链路性能下降不只会让系统变慢——它还会悄无声息地使你基于快速路径校准的所有超时设置失效，而这些超时会产生*看似成功的损坏产物*。在宣布事故结束之前，重新验证性能下降期间传输的所有内容；参见陷阱 18 和步骤 7。

### 步骤 1：收集每一跳的直接证据

在提出假设之前，收集：

- 请求路径中每一跳的服务端日志
- 客户端日志（浏览器开发者工具 HAR、CLI 调试日志、SDK 跟踪记录）
- 事故时间窗口内的指标（RPS、延迟、错误率、连接数、CPU/内存）
- 分布式跟踪记录（如果有）
- 如果症状出现在网络传输层，则收集数据包捕获记录（参见 [references/packet-capture-recipes.md](references/packet-capture-recipes.md)）

如果缺少其中任何一项且该项与问题相关，**请先补齐证据，再进行猜测**。添加一个 `TRACE_*` 环境变量标志并重启容器，胜过花一个小时层层堆叠假设。[references/instrumentation-patterns.md](references/instrumentation-patterns.md) 中的插桩模式风险较低、由环境变量控制，并且可以安全地永久部署到生产环境中。

#### 通过反向代理访问日志区分上传与处理阶段

Caddy 和 nginx 日志是证伪“后端很慢”这一判断成本最低的方法。重点关注以下三个字段：

| 字段                | Caddy JSON 键                    | nginx 变量                | 含义                                                               |
| ------------------- | -------------------------------- | ------------------------- | ------------------------------------------------------------------ |
| 总墙上时间          | `duration`                       | `$request_time`           | 从收到客户端第一个字节到向客户端发送最后一个字节（或连接关闭）     |
| 已接收的请求体字节数 | `bytes_read`                     | `$request_length` (rough) | 代理实际从客户端读取的字节数                                       |
| 声明的请求体大小    | `request.headers.Content-Length` | `$content_length`         | 客户端声称将发送的数据量                                           |
| 响应状态            | `status`                         | `$status`                 | `0` / `-` 表示代理从未写入响应                                     |

**关键模式：**

- `bytes_read < Content-Length` 且 `duration ≈ timeout` → 上传超时。
- `bytes_read == Content-Length` 且 `status` 为 5xx → 处理超时。
- `status == 0` 且 `bytes_read < Content-Length` → 客户端/CDN 在上传完成前关闭了连接。

#### 跨整个技术栈追踪单个请求

对于 <project> 技术栈（Cloudflare → Caddy → <provider-gateway-service> → <upstream-capture-service> → <new-api-container>），标准追踪流程如下：

1. **Cloudflare**：从客户端错误或 Cloudflare Logpush 中获取 `Cf-Ray` 和时间戳。
2. **Caddy**：`docker logs <gateway-container> | grep <Cf-Ray>` → 提取 `X-Request-Id`（Caddy `uuid`），并确认 `bytes_read`、`duration`、`status`。
3. **<provider-gateway-service>**：查看 `docker logs <provider-gateway-service>`，查找 `Client request error: aborted` 或请求/响应日志。
4. **<upstream-capture-service>**：`grep <X-Request-Id or timestamp> /data/<upstream-capture-service>/log/access.log` → 确认请求是否到达 <new-api-container>，以及上游处理耗时。
5. **<new-api-container>**：查看 `docker logs <new-api-container>`，查找计费/渠道错误。

如果请求 ID 从未出现在步骤 3–5 中，则故障发生在边缘侧或请求正文上传期间。

#### 按客户端 IP 聚合以发现规律

单次 524 可能只是偶发现象；如果 524 集中出现在某一个 IP 和某一条路径上，就构成了确凿证据。运行类似以下的聚合：

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

如果某一个 IP 在失败请求中占据绝大多数，且其 `max_cl` 很大，请先调查上传带宽/路径，再检查后端。

### 步骤 2：包含证伪条件和威胁模型边界的假设

列出三个或更多合理的原因。针对每个原因，写三个句子：

- **什么情况可以证实它？**（通常容易做到，但也经常具有误导性）
- **什么情况可以否定它？**（即证伪条件——这才是关键）
- **干预措施针对的是哪一层边界？**（威胁模型问题——迫使你准确说明修复措施将作用于何处）

第三个问题可以防止一种常见的反模式：提出的修复措施作用在错误的链路节点上。例如，通过向下游客户端写入字节实现的“keepalive”修复，对解决_上游_空闲超时毫无作用——干预措施针对的边界与问题所在的边界不同。在开始编码之前明确指出边界，可以提前暴露这种不匹配。

如果你无法给出具体的反驳条件，那么该假设就是不可证伪的。标记它，但不要据此采取行动。如果你无法说明某项拟议的修复针对的是哪一处边界，那么你还没有真正理解该修复实际上做了什么。

### 步骤 3：决定性实验

对于网络层问题，默认方法是**分层隔离**：使用三条仅相差一个网络跳点的路径。以下是面向 CDN 的服务示例：

| 路径 | 路由                                  | 通过时可排除的因素                       |
| ---- | ------------------------------------- | ---------------------------------------- |
| A    | 经由 CDN 的完整路径                   | 无——这是发生故障的基线                   |
| B    | 使用 `--resolve` 连接源站 IP（绕过 CDN） | CDN 层                                   |
| C    | 服务器环回（绕过 CDN + LB）           | CDN + LB                                 |

如果只有 A 失败，原因就在 CDN。如果 A 和 B 失败但 C 通过，原因就在 LB。可根据需要组合更多变体。有关使用模拟空闲上游的可运行模板，请参阅 [references/layered-isolation-experiment.md](references/layered-isolation-experiment.md)——该实验不需要等待一个能够配合触发问题的生产请求，可以精确控制空闲时间间隔。

对于非网络领域：

- 性能：只改变一个变量的受控基准测试
- 正确性缺陷：能够复现问题的失败测试用例
- 间歇性问题：采样追踪 + 等待问题再次出现

### 步骤 4：必要时添加可观测手段

如果决定性实验需要某项目前无法获得的观测数据，就添加相应的可观测手段——不要跳过它。标准模式是通过环境变量控制的检测机制，它：

- 默认关闭（稳定运行时的运行成本为零）
- 通过一个环境变量开启，无需更改代码
- 写入便于 grep 检索的日志标签（`[SSE-CHUNK] ts=... req=... bytes=...`）
- 永久部署到生产环境——未来的事故可以复用它

有关本次事故中用于诊断 <upstream-provider> 上游静默 125 秒问题的确切模板，请参阅 [references/instrumentation-patterns.md](references/instrumentation-patterns.md)。

### 步骤 5：执行并记录

完整记录并运行一次实验：命令、环境、输入、观测到的输出、实际时间戳。将结果与步骤 2 中作出的预测进行比较。如果实际结果与预测一致，则该假设得到了校准。如果不一致，则该假设是错误的——**不要使用临时附加假设来挽救它**（“哦，但也许 X 也产生了干扰……”）。返回步骤 2，从头编写新的假设。

### 步骤 6：反向审查

在确定根本原因或发布修复方案之前，安排独立审查者对结论提出质疑。向他们提供相同的证据，并要求他们尝试证伪，而不是确认。对他们提出的每项发现应用以下四问筛选法：

1. **概率**——这真的会发生吗？
2. **成本**——修复与忽略它的成本分别是多少？
3. **现实场景**——这适用于用户的实际业务场景吗？
4. **验证**——我能否以较低成本确认或反驳这一点？

对每项发现进行分类：确实存在的问题 / 部分正确 / 不太可能 / 会造成实际危害。绝不要将代理的原始输出直接粘贴给用户；应先进行筛选。参见 [references/counter-review-pattern.md](references/counter-review-pattern.md)。

### 步骤 7：修复并验证

应用修复。重新运行步骤 3 中同一个具有决定性的实验。确认在此前能够稳定复现问题的相同设置下，该症状不再出现。如果修复后无法再复现修复前的状态，就无法证明修复有效——在宣告成功之前，先弄清楚为何复现条件会丢失。

### 步骤 8：记录错误路径

调查过程中走过的错误路径比正确答案更有价值。编写一份事件报告，记录：

- 症状 + 直接证据
- 尝试过的每个假设 + 如何证伪
- 决定性实验的设计 + 结果
- 修复 + 验证
- 新增的监控或检测手段

未来的调查人员——包括未来的自己——将阅读这些内容，以避免陷入相同的认知陷阱。

## 常见认知陷阱

1. **间接证据汇聚。** 五条都指向同一方向的间接线索会让人感觉像是证据确凿。其实不然。如果直接探测的成本很低，就执行它。
2. **字段语义混淆。** `duration=5.95s` 在一个工具中可能表示总墙上时间，在另一个工具中可能表示处理程序执行阶段，而在第三个工具中可能表示 TTFB。除非已经对照文档或代码验证过某个数值字段的语义，否则绝不要引用它。
3. **单一原因偏见。** 多层系统的故障往往由多层缺陷共同造成。修复直接原因，但也要记录放大问题的因素，以便下一层防线也能得到加固。
4. **命名假设。** 标记为 `spot-instance` 的资源未必真的是竞价实例。应通过 API 验证属性，而不是依赖元数据名称。
5. **探测自验证。** 通过已损坏的连接运行诊断来测试该连接，得到的结果无法解释。始终使用独立探测进行交叉验证。
6. **假设挽救循环。** 当证据与假设矛盾时，人们很容易通过添加限定条件来挽救它（“没错，但只在 X 情况下如此”）。要抵制这种冲动。一旦第一个证伪条件成立，就放弃该假设。
7. **未经验证的前提。** 调查一个从未被直接观察到的症状——它只是从用户的不满、告警标题或下游影响中推断出来。应先验证（步骤 0.5）。不要调查传闻。
8. **威胁模型不匹配。** 提出的修复针对了错误的层级——为解决上游问题而向下游写入字节，或调整一个永远不会触发超时的跃点上的超时设置。明确每个假设所针对的边界（步骤 2），有助于暴露此类问题。
9. **返回路径 / 方向不对称。** A→B 健康 ≠ B→A 健康。从外部探测某个节点，只能证明该节点的返回/入站方向正常；网络路径和拥塞具有方向性。在断言某个跃点健康之前，应从用户一侧沿与用户流量相同的方向进行测量（从受影响的源端运行 TCP 模式的 `mtr`/`nexttrace`）。
10. **边缘超时伪装成上游客户端中止。** Cloudflare 返回的 524 可能导致源站代理（Caddy/nginx）将上游连接记录为“客户端中止”（`status=0`、`Client request error: aborted`）。源站观察到的中止确实存在，但其 _原因_ 是 CDN 边缘节点先发生超时。在将中止归因于客户端之前，始终要关联分析边缘错误码、边缘时间戳和源站日志。参见步骤 0.6 中的上传与处理问题排查方法。
11. **假设位于列表顶部的代理规则优先于 CNAME 匹配。** 会解析 CNAME 的代理客户端可能会对解析后的 CNAME 链应用规则，而不仅仅针对原始主机名。`DOMAIN-SUFFIX,<cname-suffix>,DIRECT` 规则可能覆盖显式的 `DOMAIN,<target>,PROXY` 规则。应通过检查配置，并经由代理分别测试主机名路径与 IP 路径来验证。
12. **代理节点 DNS = 客户端 DNS。** 代理节点解析主机名的结果可能与客户端不同。客户端侧的 DoH 查询可能返回一个可用 IP，而代理节点却返回被封锁或不可路由的 IP。使用 `curl -x proxy -H 'Host: host' -I https://<working-ip>` 进行测试，以区分 DNS 问题和可达性问题。
13. **指纹 ≠ 身份。** 服务横幅、端口特征或 MAC OUI 都只是容易被仿冒的线索，并不能证明设备的真实身份。一个在端口 5000 上响应、带有 `Server: AirTunes/…` 标头且不广播 `_raop` mDNS 的设备，“看起来像”自建的 Linux AirPlay 接收器（shairport-sync）——但它实际上是 macOS AirPlay 接收器（ControlCenter 监听 5000/7000 端口），而较新的 `OpenSSH_10.x` 横幅才是关键线索。在同一事件中，一个带 Realtek OUI 的 MAC 地址让人以为它“与 NAS 属于同一厂商系列”，但它实际上来自连接到 Mac 的 USB 以太网适配器。在断定设备的真实身份之前，应检查自我身份信息：对照 `~/.ssh/known_hosts` 检查 SSH 主机密钥（具有决定性——一台主机对应一个密钥）、mDNS 主机名解析结果、AirPlay `/info` plist（设备自行报告的名称/型号/osBuildVersion）。应将横幅和 OUI 视为有待证伪的假设，绝不能将其作为结论。
14. **在一个网段上不可达 ≠ 已停止运行。** 一次探测只能证明其所在的 L2 域中的情况。更换路由器后，旧路由器在以太网上不响应 ARP——看似“已停止运行”——但它的 Wi-Fi AP 仍在广播并提供 DHCP 服务，因此保存了凭据的设备会悄然接入一个无法访问 WAN 的网络。在断言目标已经消失之前，应从目标自身的视角验证（检查它的其他接口，例如在设备自身运行 `ipconfig getifaddr en1`）；而且在任何拓扑变更后，都应物理关闭退役设备——一台仍在提供 DHCP 服务的“已停止运行”的路由器是一个会不断吸引设备接入的陷阱。
15. **拓扑变更会使手动 IP 设备成为孤岛。** DHCP 客户端会自动跟随新网络；使用手动/静态 IP 的设备则会保留旧网关和 DNS，从而成为与外界隔绝的孤岛——既无法被访问，也无法访问任何目标。macOS 中的 “Manually Using DHCP Router Configuration”（手动 IP + 从旧 DHCP 获得的路由器配置）让这个问题更加隐蔽：地址看起来是有意设置的，但网关已经过时。任何路由器/子网变更后，在宣告迁移完成之前都应进行全面排查：检查旧子网上的 ARP 条目、解析到旧子网地址的 mDNS 名称，并重新验证每台已知的静态 IP 设备（服务器、NAS、打印机）的网关和 DNS。

16. **将路径*类型*字段误读为路径*容量*字段。** Mesh VPN 和代理状态行报告的是如何到达某个对等节点——`direct` 还是 `relay`，以及端点地址。它回答的是“是否进行了打洞？”，绝不回答“速度有多快？”。两者可能截然不同：在这一陷阱背后的事件中，无论处于 0.09–0.11 MB/s 的状态，还是处于 11–16 MB/s 的状态，状态行都显示 `active; direct <endpoint>`——同一个字段、同一个词，速率却相差两个数量级——因为较慢的是一条跨 WAN 的直连路径，而较快的是一条跨 LAN 的直连路径。RTT 同样无法更好地预测容量：*较慢*状态的数值看起来反而*更低*，为 12 ms，而较快状态为 4 ms。两者都是对某些事物的真实测量，但都不是对容量的测量。请测量速率（步骤 0.7），并将状态字段视为无关紧要的拓扑信息。

17. **把自己的探测方式造成的问题归咎于远端主机。** 在得出“服务器很慢”的结论之前，先确认你发出的请求确实是你原本想发送的请求。格式错误的标识符通常会走一条比有效标识符*更慢*的路径——查找未命中会触发全量扫描，然后返回错误——因此，一次有问题的探测会制造出恰好符合你预期的“另一端不堪重负”迹象。真实案例：一个 Windows 风格的对象键（`…\archive\…`）通过 shell 插值时，shell 将 `\a` 吞掉并转换成了 BEL 字节；损坏后的键未命中任何索引，服务扫描了约 21 秒，然后返回了一个 17 字节的 `404`。如果将其解读为“返回空内容花了 21 秒——主机过载了”，它几乎会让整个调查转向错误的方向。线索在于有效载荷大小：**用 21 秒传输 17 字节并不是带宽问题的症状**，而是服务端扫描；当扫描的是一个并不存在的对象时，问题通常出在你的键，而不是对方的磁盘。移除路径中的 shell，重新构建探测方式（使用通过参数向量传参的脚本），然后再次测量，之后再进行任何归因。

18. **错误的容量假设会悄无声息地损坏产物，却仍能通过成功检查。** 吞吐量下降造成的影响不会仅限于“速度慢”——它会使所有按照健康路径校准的超时设置失效，而被*你自己的*超时机制终止的传输会留下截断的文件，而不是错误。能否注意到这一点，完全取决于成功检查测量的内容——而一个*看似合理*的大小下限救不了你。在这一陷阱背后的事件中，获取循环检查的是 `HTTP 200 && bytes > 1000`，这听起来像是真正的完整性检查，并且 **35 个**下载全部通过，但其中 14 个实际上遭到了截断。180 秒的上限对于健康状态下的速率绰绰有余，但在性能下降的状态下根本不可能完成传输；被终止的传输仍然带有 `200`，因为状态行早在响应正文停止传输之前就已经到达；它们也仍然超过了 1000 字节，因为与任何你可能想到的阈值相比，一个被截断的数兆字节文件依然非常大。**任何字节数下限都无法区分“完整文件”和“大部分文件”**——这是文件格式本身的属性，而不是文件大小的属性。有两个可靠的修复方法：**检查传输的退出状态，而不只是响应状态**（HTTP 200 描述的是响应的开始；只有退出码才能描述其结束），以及**使用产物自身的格式验证产物**——带有终止标记（`%%EOF`、`IEND`、结束帧）的容器可以自行证明其完整性。这项检查也可用于事后审计影响范围：带有终止标记的文件与解析器接受的文件完全一致，均为 21 个，从而将“某些下载可能已损坏”转化为一份精确的列表。

[references/cognitive-traps.md](references/cognitive-traps.md) 对陷阱 1–12 进行了更详尽的说明（救援循环警告、字段语义示例）。陷阱 13–18 则记录在其来源案例研究中，而不是该文档中：13–15 见 LAN/拓扑材料，16–18 见 [references/case-throughput-collapse-no-errors.md](references/case-throughput-collapse-no-errors.md)。

## 客户端侧代理 / VPN / TUN 路由错误

当症状是**特定于客户端的**（某台机器上的浏览器无法访问，而其他设备或网络可以正常工作，或者关闭代理/VPN 后故障消失）时，代理客户端本身就是一个网络跳点。应将其视为一个网络跳点来排查。

快速差异诊断清单：

1. **DNS**：操作系统将域名解析到了什么 IP？如果是假 IP/TUN IP（例如 `198.18.x.x`），说明代理客户端正在拦截 DNS。
2. **路由**：`route -n get <ip>` 会显示数据包从哪个接口发出。在 TUN 模式下，将假 IP 路由到 `utun5` 是正常的；如果真实 IP 只能通过 TUN 路由，而物理接口无法访问它，则说明本地直连存在问题。
3. **代理端口**：本地代理是否正在监听？可使用 `lsof -P -i TCP:<port>` 确认。分别在使用和不使用代理的情况下进行测试。
4. **通过代理访问主机名与 IP**：
   - `curl -x http://127.0.0.1:<port> -I https://<host>`
   - 自行解析主机名（使用 DoH），然后运行 `curl -x http://127.0.0.1:<port> -k -H 'Host: <host>' -I https://<ip>`
   如果第二种方式成功而第一种失败，则说明代理节点的 DNS 返回了与客户端 DoH 查询结果不同或错误的 IP。
5. **物理接口可达性**：临时强制让真实 IP 通过 `en0`（或当前活动的物理接口）发出。如果该路径失败，而 TUN 路径成功，则说明本地网络无法访问目标；必须使用代理/TUN。
6. **规则/CNAME 交互**：检查代理配置中是否存在与目标 CNAME 后缀匹配的规则。如果客户端会根据解析后的 CNAME 评估规则，则 `DOMAIN-SUFFIX,<cname-suffix>,DIRECT` 规则可能会覆盖显式的 `DOMAIN,<host>,PROXY` 规则。

如果上述所有检查结果都指向代理客户端解析到了错误的 CNAME，或依赖了错误的代理节点 DNS，请参阅 [references/case-proxy-tun-cname-override.md](references/case-proxy-tun-cname-override.md) 中的修复模式。

## 反模式——需要明确避免的做法

- **在找到证伪条件之前就直接尝试修复。**“可能是 X，让我重启 / 调整 / 升级一下。”这种做法会把学习机会变成原因不明的修复，无法防止问题再次发生。
- **全盘接受智能体复核得出的发现。**智能体往往会产出过多风险发现。采取行动前应先进行筛选（参见上文的四问题筛选法）。
- **绕过 IaC 对生产环境进行临时修改。**如果调查需要更改生产环境，应先修改事实来源，然后再应用更改——否则，“修复”会在下次部署时消失，而配置漂移会掩盖真实状态。
- **根据单一观察结果宣布根本原因。**必须先尝试证伪。
- **在未重新运行失败实验的情况下写下“现在应该能用了”。**应重新验证。

## 案例研究

四个典型案例展示了该方法论在不同故障模式下的应用：

1. [references/case-sse-rst-130s.md](references/case-sse-rst-130s.md) — 一次历时 5 小时的调查，期间助手反复得出错误结论。一旦某个子代理设计出一个包含模拟空闲上游的三路径分层隔离实验，正确答案——Cloudflare 边缘节点的 HTTP/2 流空闲超时时间为 126 秒，并因 <upstream-provider> 在 <model-name> 生成 tool_use 期间未发送 SSE ping 而被放大——仅用 10 分钟便浮出水面。

2. [references/case-cloudflare-524-upload.md](references/case-cloudflare-524-upload.md) — `<api-domain>/<openrouter-path>` 上出现 Cloudflare 524，其中一个约 6 MB 的 POST 请求体从美国客户端上传到 <origin-region> 源站所花费的时间，超过了 Cloudflare 默认源站读取超时所允许的时长。关键洞见来自将 `bytes_read`（4.1 MB）与 `Content-Length`（6.0 MB）进行比较，并确认请求从未到达 `<upstream-capture-service>` 或 `<new-api-container>`。此案例是上述上传与处理判定方法以及“边缘超时伪装成客户端中止”陷阱的来源。

3. [references/case-proxy-tun-cname-override.md](references/case-proxy-tun-cname-override.md) — 一个客户端侧 `<proxy-client>` TUN 案例，其中 `<auth-domain>` 出现 `ERR_CONNECTION_CLOSED`，尽管显式的 PROXY 规则位于配置顶部。根本原因是一条 `DOMAIN-SUFFIX,<cname-suffix>,DIRECT` 规则匹配了目标的 CNAME 链，同时代理节点自身的 DNS 返回了一个不同于客户端 DoH 查询结果的 IP。修复模式使用 `[Host]` 映射和 `use-local-host-item-for-proxy`。

4. [references/case-throughput-collapse-no-errors.md](references/case-throughput-collapse-no-errors.md) — 这里唯一一个**完全没有错误字符串**的案例：全程 HTTP 200、RTT 为 12 ms、健康检查端点响应时间为 0.04 s，而链路传输速率仅为 0.09–0.11 MB/s。三个小时耗费在“验证阶段很慢”→“主机的上行带宽一定约为 1 Mbps”→“问题出在中继”这些推断上；它们看似都合理，却没有一个得到验证。两条共享同一路径但不涉及任何应用程序代码的通道（一个 HTTP 服务和纯 SSH）测得的结果相差不到约 20%，并通过一条命令得出结论：问题在路径，而不在服务。这是步骤 0.7 和陷阱 16–18 的来源，其中包括：基于错误速率推导出的 180 秒超时，如何截断了 35 个下载中的 14 个，而这些下载全都通过了 `200 && bytes > 1000` 检查。

在将此技能应用于陌生的问题领域之前，请先阅读这些案例；其中对误入歧途过程的剖析才是教学重点。

## 参考文件

- [references/layered-isolation-experiment.md](references/layered-isolation-experiment.md) — 三路径技术、模拟上游模板、结果矩阵
- [references/instrumentation-patterns.md](references/instrumentation-patterns.md) — 由环境变量控制的 TRACE\_\*、可通过 grep 检索的日志标签、部署检查清单
- [references/packet-capture-recipes.md](references/packet-capture-recipes.md) — 用于隔离 RST 的 tcpdump 过滤器、Docker 上的接口选择、HTTP/2 解码
- [references/counter-review-pattern.md](references/counter-review-pattern.md) — 四代理团队构成、四问题筛选法、集成工作流
- [references/cognitive-traps.md](references/cognitive-traps.md) — 扩展示例、补救循环警告
- [references/case-sse-rst-130s.md](references/case-sse-rst-130s.md) — 包含误入歧途时间线的典型案例研究
- [references/case-cloudflare-524-upload.md](references/case-cloudflare-524-upload.md) — 上传超时与处理超时的判定方法
- [references/case-proxy-tun-cname-override.md](references/case-proxy-tun-cname-override.md) — 客户端侧代理/TUN CNAME 规则覆盖及修复模式
- [references/case-throughput-collapse-no-errors.md](references/case-throughput-collapse-no-errors.md) — 所有信号均正常时的吞吐量下降；双通道容量隔离；产物被截断的后续影响

## 脚本

- [scripts/mock-idle-upstream.py](scripts/mock-idle-upstream.py) — 一个 SSE 服务器，发送一帧后空闲 N 秒。在分层隔离实验中将其用作上游，以精确控制空闲间隔。
- [scripts/layered-isolation-probe.sh](scripts/layered-isolation-probe.sh) — 运行三路径 A/B/C 对比并输出诊断矩阵。