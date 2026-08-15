---
name: debugging-network-issues
description: >-
  Evidence-driven investigation for network, streaming, and protocol-layer bugs where symptoms don't match the obvious cause. Use when debugging connection resets (ECONNRESET, HTTP/2 RST_STREAM, INTERNAL_ERROR), SSE or long-polling stalls, fixed-time connection drops, CDN/proxy/CGNAT idle timeouts, client-side proxy/VPN/TUN misrouting, CNAME-based proxy rule overrides, or symptoms like "socket closed unexpectedly", "stream interrupted", "fails after N seconds", "works sometimes but not always", "upstream silent for X seconds", ERR_CONNECTION_CLOSED, SSL_ERROR_SYSCALL, or certificate-verification errors (UNKNOWN_CERTIFICATE_VERIFICATION_ERROR, wrong-site certificate) that hit some domains while others work. Also use for LAN-layer mysteries: identifying an unknown device (mystery IP/MAC/banner), devices silenced by a subnet change, or a host declared "dead" that is alive on another segment. Applies falsification-first layered isolation to pin down the responsible network layer instead of stacking assumptions.
---
# 调试网络问题

一种证据驱动的调查方法，适用于那些显而易见的原因很可能并非真正原因的故障事件。该方法源自一个真实的、耗时 5 小时的生产环境案例（参见 [references/case-sse-rst-130s.md](references/case-sse-rst-130s.md)）：层层叠加的假设浪费了数小时，而一个 10 分钟的分层实验原本就能解决问题。

当用户报告网络、流式传输或协议相关症状，而调查人员想仅凭一行日志或一个间接数据点就做出诊断时，请应用此技能。此技能的作用就是抑制这种下意识反应。

## 先进行分诊——这是否属于某个已知领域？

在应用下面的通用方法之前，请先检查症状是否指向本仓库中已有专用技能的技术栈。这些技能包含特定领域的症状→原因→修复方案对照表，而本技能刻意保持通用性，不涉及这些内容——请先从相应的专用技能入手；如果最终发现根本原因位于其他地方，再回到这里使用本方法。

| 如果症状是……                                                                                                                                                                                       | 请先使用                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| macOS 上 Tailscale ⨯ 代理/VPN 冲突（Shadowrocket / Clash / Surge）：`tailscale ping` 正常，但 SSH/curl/git 失败、出现 `Connection closed by 198.18.x.x`、TUN DNS 劫持、约 60 秒的 `getaddrinfo` 解析器阻塞 | **tunnel-doctor**                            |
| Cloudflare 配置问题：`ERR_TOO_MANY_REDIRECTS`、SSL 模式不匹配、橙色云朵代理后的 DNS / 代理状态问题                                                                                        | **cloudflare-troubleshooting**               |
| Windows App / AVD / W365 RDP 连接质量问题：使用 WebSocket 而非 UDP Shortpath、高 RTT、STUN/TURN 干扰                                                                                    | **windows-remote-desktop-connection-doctor** |
| 客户端代理 / VPN / TUN 路由错误：某个特定站点出现 `ERR_CONNECTION_CLOSED` 或 `SSL_ERROR_SYSCALL`，其他站点正常，DNS 返回虚假/TUN IP，并且添加 PROXY 规则也无济于事 | **本技能**——请先阅读 [references/case-proxy-tun-cname-override.md](references/case-proxy-tun-cname-override.md) |
| TLS 证书验证错误（`UNKNOWN_CERTIFICATE_VERIFICATION_ERROR`、证书对应了错误的网站），或所有通过 **DIRECT** 路由的国内域名同时在握手中途出现 EOF，而经代理的域名正常——并且所有代理健康状态监视器仍然显示绿色                                        | **tunnel-doctor**（TUN DIRECT 脑裂步骤） |

如果没有任何匹配项——或者你尝试了某个领域专用技能，但证据指向其他地方——请继续阅读下文。该方法适用于任何多层系统。

> **关于此技能的特别说明**：如果症状是在**大型 `POST` 请求体**（例如，`/<openrouter-path>` 的 `Content-Length` > 1 MB）上出现 Cloudflare 524/522，故障原因通常是**上传到源站所花费的时间超过了 Cloudflare 的源站读取超时时间**，而不是后端响应缓慢。在认定后端停滞之前，请先使用下方的上传与处理检查清单。

## 核心原则

### 1. 证据优先于假设

如果你无法指出具体的证据——日志行、pcap 帧、探测输出、指标样本——那么你只是在猜测，而不是诊断。在断言“X 是原因”之前，必须能够给出直接证据。如果目前还没有证据，请先添加检测手段（参见 [references/instrumentation-patterns.md](references/instrumentation-patterns.md)）或捕获证据（参见 [references/packet-capture-recipes.md](references/packet-capture-recipes.md)），然后再继续。

### 2. 证伪优先于证实

N 个独立来源“证实”某个假设，并不能使其成为事实。一项能够证伪的观察结果就足以排除它。在依据某个假设采取行动之前，请回答：

> “什么样的观察结果会让我放弃这个假设？”

如果答案是“没有”或“我想不到”，那么这个假设就是不可证伪的，不能用来推动调查。如果答案很具体，请在决定采取行动之前先寻找该观察结果。

### 3. 分层隔离

多跳系统（客户端 → CDN → LB → 反向代理 → 应用 → 上游）的缺陷往往集中在各层之间的衔接处。当某个症状可能来自多个层时，**不要推理它究竟来自哪一层；直接测试**。标准方法是：让同一个逻辑请求通过三条或更多路径，每条路径之间只相差一个跳点，然后比较症状出现在哪些路径上。这种方法几分钟内就能解决靠堆叠假设数小时也无法解决的问题。参见 [references/layered-isolation-experiment.md](references/layered-isolation-experiment.md)。

### 4. 提交前进行反向审查

在确定根本原因或发布修复方案之前，请让独立审查者质疑结论，而不是确认结论。代理擅长发现单个调查者未曾想到的风险，但不擅长权衡这些风险。在让任何发现影响行动之前，请对其应用四问筛选法（参见 [references/counter-review-pattern.md](references/counter-review-pattern.md)）。

### 5. 正常的健康检查只能证明其探测路径正常

监控关注的是其作者设想到并选择探测的路径。多平面系统——具有 DIRECT 平面和代理平面的 TUN 代理、具有数据平面和控制平面的服务、同时包含后端 API 和 Web 登录页面的技术栈——往往每次只在一个平面上发生故障，而仅探测其他平面的看门狗在整个故障期间仍会保持绿色。在这一原则所源自的事件中，一个代理健康守护进程每 5 分钟通过代理探测一个海外端点，并在直接连接平面完全中断的 2 个多小时内持续记录“健康”。

在将“监控显示它是健康的”作为证据之前，请先问：**该检查具体覆盖了哪条路径？** 它显示绿色只能作为该路径正常的证据。请列举系统实际转发或提供服务的各个平面，并直接探测发生故障的平面——能够捕获该故障的检查通常只差一条 curl 命令。

## 工作流程

将此检查清单复制到调查笔记中，并逐项勾选：

```
Investigation Progress:
- [ ] Step 0:   Scope the symptom (exact error, exact times, who, who-not, what changed)
- [ ] Step 0.5: Verify the premise — does direct evidence show the symptom is actually happening?
- [ ] Step 0.6: **For large POST bodies: distinguish upload-timeout from processing-timeout** (see recipe below)
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

范围界定是否严谨，决定了调查只需 20 分钟还是长达 5 小时。在查看任何内容之前，先提取以下信息：

- **确切的错误字符串**（复制粘贴，不要转述）。`socket closed` 不等同于 `ECONNRESET`，也不等同于 `HTTP/2 RST_STREAM INTERNAL_ERROR (err 2)`。
- **确切的时间戳**（使用带时区的 ISO-8601 格式，而不是“昨天晚上”）
- **可复现性**（每次发生／间歇发生／仅特定用户发生）
- **哪些人受到影响，哪些人未受影响**（差异性观察可以缩小搜索范围）
- **最近发生了什么变更**（部署、配置、上游依赖项、客户端版本）

区分症状与诊断。“慢”不是症状。“请求耗时 130.898 秒，随后返回 HTTP/2 INTERNAL_ERROR”才是。

### 步骤 0.5：验证前提

在投入全面调查之前，先确认报告的症状确实正在发生，而不是仅根据下游影响或用户的不满推断出来的。一次低成本的直接观察，胜过花费数小时调查一个并不存在的问题。

问：**“有什么直接证据表明该症状确实存在？”**

- 如果用户报告“在 130 秒时超时”：这是来自带时间戳的日志、浏览器网络面板，还是回忆？
- 如果用户报告“连接被重置”：他们确实看到了数据包，还是根据重试次数激增推断出来的？
- 如果用户报告“有些人会失败，另一些人不会”：是否已在受控测试中复现，还是仅为传闻？

可接受的前提：

- 包含时间戳和错误字符串的日志行
- 显示失败情况的浏览器 DevTools Network 截图
- 可按需复现该症状的命令
- 显示特定错误数量上升的指标图表

不足以作为前提的情况：

- “用户说感觉很慢”
- “告警触发了，但我没有检查究竟是什么失败了”
- “上周有人提到过……”

如果前提未能通过验证，需要采取的是观察，而不是调查。补充缺失的遥测，在检测手段就绪后等待下一次问题发生，并在获得真实数据后再回来。不要因为“反正我们已经开始了”就屈从于沉没成本心态，执意继续调查。

### 步骤 0.6：大体积 POST 请求体的上传超时与处理超时

对于由 CDN 代理的、包含大体积请求体的 `POST`/`PUT` 端点，最常见的误诊是将问题归咎于后端处理缓慢，而真正的问题其实是**上传请求体所需的时间超过了 CDN/代理的源站超时时间**。

当症状是 `Content-Length > ~500 KB` 的请求返回 524/522/504 时，请执行以下子检查清单：

1. **找到边缘节点/反向代理访问日志**（Caddy、nginx、Envoy、Cloudflare Logpush）。
2. **将 `bytes_read`（或等效字段）与 `Content-Length` 进行比较**：
   - `bytes_read == Content-Length` 且 `status` 为错误 → 可能是后端/处理问题。
   - `bytes_read < Content-Length` 且连接在接近超时时间窗口时关闭 → **上传问题**。
3. **检查 `duration` / `request_time` 的语义**：
   - Caddy 的 `duration` = 从读取第一个字节到响应结束的实际经过时间。
   - nginx 的 `$request_time` = 含义相同。
   - <upstream-capture-service> / 应用的 `request_time` = 请求体被完全接收后，后端用于处理的时间。
   - 如果代理的 `duration` ≈ 超时时间，但上游的 `request_time` 很短或根本没有记录，则瓶颈在请求体上传。
4. **查找 `status=0`（Caddy）或 `-`（nginx）**：
   - `status=0` 表示代理从未写入 HTTP 响应，通常是因为下游/客户端一侧先关闭了连接。
5. **与上游日志进行关联**：
   - 如果请求 ID / Ray ID / 跟踪 ID **没有出现**在上游（<new-api-container>、<upstream-capture-service>、应用）日志中，则说明请求从未完成上传。

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

解读：代理将连接维持了 125 秒，读取了 6 MB 请求体中的 4.1 MB，随后 Cloudflare 关闭连接并返回 524。

**处理超时的示例特征：**

```json
{
  "status": 504,
  "duration": 120.1,
  "bytes_read": 6042141,
  "request": { "headers": { "Content-Length": ["6042141"] } }
}
```

解读：请求体已完整上传，但后端未能在代理超时前响应 → 后端/处理问题。

### 步骤 1：收集每一跳的直接证据

在提出假设之前，请收集：

- 请求路径中每一跳的服务端日志
- 客户端日志（浏览器开发者工具 HAR、CLI 调试日志、SDK 跟踪记录）
- 故障时间窗口内的指标（RPS、延迟、错误率、连接数、CPU/内存）
- 分布式跟踪记录（如可用）
- 如果症状发生在线路层面，则收集数据包捕获（参见 [references/packet-capture-recipes.md](references/packet-capture-recipes.md)）

如果其中任何相关证据缺失，**请先填补证据缺口，再进行推测**。添加一个 `TRACE_*` 环境变量标志并重启容器，胜过花费一小时层层堆叠假设。[references/instrumentation-patterns.md](references/instrumentation-patterns.md) 中的插桩模式风险较低，由环境变量控制，并且可以安全地永久部署到生产环境中。

#### 通过反向代理访问日志区分上传与处理阶段

Caddy 和 nginx 日志是证伪“后端很慢”这一说法成本最低的方式。重点关注以下字段：

| 字段                | Caddy JSON 键                    | nginx 变量                | 含义                                                               |
| ------------------- | -------------------------------- | ------------------------- | ------------------------------------------------------------------ |
| 总耗时              | `duration`                       | `$request_time`           | 从客户端发送第一个字节 → 向客户端发送最后一个字节（或连接关闭）    |
| 已接收的请求体字节数 | `bytes_read`                     | `$request_length` (rough) | 代理实际从客户端读取的字节数                                       |
| 声明的请求体大小    | `request.headers.Content-Length` | `$content_length`         | 客户端声称将要发送的字节数                                         |
| 响应状态            | `status`                         | `$status`                 | `0` / `-` 表示代理从未写入响应                                     |

**关键模式：**

- `bytes_read < Content-Length` 且 `duration ≈ timeout` → 上传超时。
- `bytes_read == Content-Length` 且 `status` 为 5xx → 处理超时。
- `status == 0` 且 `bytes_read < Content-Length` → 客户端/CDN 在上传完成前关闭了连接。

#### 跨整个技术栈追踪单个请求

对于 <project> 技术栈（Cloudflare → Caddy → <provider-gateway-service> → <upstream-capture-service> → <new-api-container>），标准追踪流程如下：

1. **Cloudflare**：从客户端错误或 Cloudflare Logpush 中获取 `Cf-Ray` 和时间戳。
2. **Caddy**：`docker logs <gateway-container> | grep <Cf-Ray>` → 提取 `X-Request-Id`（Caddy `uuid`），并确认 `bytes_read`、`duration`、`status`。
3. **<provider-gateway-service>**：在 `docker logs <provider-gateway-service>` 中查找 `Client request error: aborted` 或请求/响应日志。
4. **<upstream-capture-service>**：`grep <X-Request-Id or timestamp> /data/<upstream-capture-service>/log/access.log` → 确认请求是否到达 <new-api-container>，以及上游处理耗时。
5. **<new-api-container>**：在 `docker logs <new-api-container>` 中查找计费/渠道错误。

如果请求 ID 始终未出现在步骤 3–5 中，则故障发生在边缘节点或请求体上传期间。

#### 按客户端 IP 聚合以发现规律

单个 524 可能只是偶发现象；如果大量 524 集中在同一个 IP 和同一路径上，那就是确凿证据。运行如下聚合：

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

如果某个 IP 的失败占比极高，且其 `max_cl` 很大，请先调查上传带宽/路径，再调查后端。

### 第 2 步：包含证伪条件和威胁模型边界的假设

列出三个或更多合理的原因。对于每个原因，写三个句子：

- **什么可以证实它？**（容易做到，但往往会产生误导）
- **什么可以证伪它？**（证伪条件——这才是关键）
- **干预措施针对的是哪一层边界？**（威胁模型问题——迫使你准确说明修复措施将作用于何处）

第三个问题可以防止一种常见的反模式：提出作用于错误网络跳点的修复措施。例如，通过向客户端下游写入字节实现的“keepalive”修复，对解决*上游*空闲超时毫无用处——干预措施针对的边界与问题所在的边界不同。在开始编码之前就明确边界，可以提前暴露这种不匹配。

如果你无法给出具体的证伪条件，那么该假设就是不可证伪的。标记它，但不要据此采取行动。如果你无法说明某项拟议修复针对的是哪个边界，那么你还没有真正理解该修复究竟会做什么。

### 第 3 步：决定性实验

对于网络层问题，默认方法是**分层隔离**：使用三条恰好只相差一个网络跳点的路径。以下是面向 CDN 的服务示例：

| 路径 | 路由                                  | 如果通过，可以排除的层                 |
| ---- | ------------------------------------- | -------------------------------------- |
| A    | 经由 CDN 的完整路径                   | 无——这是发生故障的基线                 |
| B    | 使用 `--resolve` 连接源站 IP（绕过 CDN） | CDN 层                                 |
| C    | 服务器环回路径（绕过 CDN + LB）       | CDN + LB                               |

如果只有 A 失败，原因就是 CDN。如果 A 和 B 失败，但 C 通过，原因就是 LB。根据需要组合更多变体。有关使用模拟空闲上游的可运行模板，请参阅 [references/layered-isolation-experiment.md](references/layered-isolation-experiment.md)——该实验不需要等待一个可配合的生产请求来触发，而是可以精确控制空闲时间间隔。

对于非网络领域：

- 性能：只改变一个变量的受控基准测试
- 正确性缺陷：能够复现问题的失败测试用例
- 间歇性问题：采样追踪 + 等待问题再次发生

### 第 4 步：在需要时添加插桩

如果决定性实验需要某项当前无法进行的观测，请添加相应能力——不要跳过。标准做法是使用由环境变量控制的插桩，它应当：

- 默认关闭（稳定运行时的运行时开销为零）
- 通过一个环境变量开启，无需更改代码
- 写入便于 grep 搜索的日志标签（`[SSE-CHUNK] ts=... req=... bytes=...`）
- 永久部署到生产环境——未来的事件可以复用它

有关本次事件中用于诊断 <upstream-provider> 上游静默 125 秒问题的确切模板，请参阅 [references/instrumentation-patterns.md](references/instrumentation-patterns.md)。

### 第 5 步：执行并记录

完整记录并运行一次实验：命令、环境、输入、观测到的输出以及墙上时钟时间戳。将结果与第 2 步中作出的预测进行比较。如果实际结果与预测一致，则该假设已得到校准。如果不一致，则该假设是错误的——**不要使用临时添加的辅助假设来挽救它**（“哦，但也许 X 也产生了干扰……”）。返回第 2 步，从头编写新的假设。

### 步骤 6：反向审查

在确定根本原因或发布修复之前，安排独立审查者对结论提出质疑。向他们提供相同的证据，并要求他们证伪，而不是确认。对他们提出的每一项发现应用四问筛选法：

1. **概率**——这真的会发生吗？
2. **成本**——修复与忽略相比，成本分别是多少？
3. **现实场景**——这适用于用户的实际业务场景吗？
4. **验证**——我能否以较低成本确认或反驳这一点？

对每项发现进行分类：确有问题 / 部分正确 / 不太可能 / 会造成实际危害。绝不要将智能体的原始输出直接粘贴给用户；应先进行筛选。参见 [references/counter-review-pattern.md](references/counter-review-pattern.md)。

### 步骤 7：修复并验证

应用修复。重新运行步骤 3 中同一个具有决定性的实验。确认在此前能够稳定复现该症状的相同环境下，症状不再出现。如果修复后无法再复现修复前的状态，就无法证明修复有效——在宣布成功之前，先弄清楚为什么丢失了复现条件。

### 步骤 8：记录错误尝试

调查中的错误尝试比正确答案更有价值。编写一份事件报告，记录：

- 症状 + 直接证据
- 尝试过的每个假设 + 如何将其证伪
- 决定性实验的设计 + 结果
- 修复 + 验证
- 新增的监控或检测手段

未来的调查者——包括未来的自己——会阅读这些内容，以避免陷入相同的认知陷阱。

## 常见认知陷阱

1. **间接证据趋同。** 五条间接线索全都指向同一个方向，会让人觉得这就是证据。其实不是。如果直接探测的成本很低，就执行它。
2. **字段语义混淆。** `duration=5.95s` 在一个工具中可能表示总墙钟时间，在另一个工具中可能表示处理程序执行阶段，在第三个工具中又可能表示 TTFB。引用任何数值字段之前，务必对照文档或代码核实其语义。
3. **单一原因偏见。** 多层系统的故障往往源于多层缺陷的叠加。修复直接原因，但也要记录放大故障的因素，以便进一步强化下一层防线。
4. **名称假设。** 标记为 `spot-instance` 的资源未必真的是竞价实例。通过 API 验证属性，不要依据元数据名称做判断。
5. **探测自我验证。** 通过故障连接来运行诊断，并用它测试该故障连接，只会得到无法解释的结果。始终使用独立探测手段进行交叉验证。
6. **假设补救循环。** 当证据与假设矛盾时，人们很容易为假设添加限定条件（“是的，但仅限于情况 X”）。要抵制这种冲动。一旦第一个证伪条件成立，就放弃该假设。
7. **未经验证的前提。** 调查一个从未被直接观察到、仅根据用户的不满、警报标题或下游影响推断出的症状。先进行验证（步骤 0.5）。不要调查轶事。
8. **威胁模型不匹配。** 提出的修复针对了错误的层级——通过向下游写入字节来解决上游问题，或调整一个永远不会触发超时的跃点上的超时设置。明确每个假设所针对的边界（步骤 2），有助于暴露这类问题。
9. **反向路径 / 方向不对称。** A→B 正常 ≠ B→A 正常。从外部对节点进行探测，只能证明该节点的返回/入站方向；网络路径和拥塞具有方向性。在宣布某个跃点正常之前，应从用户一侧沿用户流量的实际方向进行测量（从受影响的源端运行 TCP 模式的 `mtr`/`nexttrace`）。
10. **边缘超时伪装成上游客户端中止。** Cloudflare 返回的 524 可能导致源站代理（Caddy/nginx）将上游连接记录为“客户端中止”（`status=0`、`Client request error: aborted`）。在源站看来，中止确实发生了，但其_原因_是 CDN 边缘节点先发生了超时。在将中止归因于客户端之前，务必关联分析边缘错误代码、边缘时间戳和源站日志。参见步骤 0.6 中的上传与处理诊断方法。
11. **假设列表顶部的代理规则优先于 CNAME 匹配。** 会解析 CNAME 的代理客户端可能会将规则应用于解析后的 CNAME 链，而不只是原始主机名。`DOMAIN-SUFFIX,<cname-suffix>,DIRECT` 规则可能会覆盖显式的 `DOMAIN,<target>,PROXY` 规则。通过检查配置，并经由代理分别测试主机名路径和 IP 路径来验证。
12. **代理节点 DNS = 客户端 DNS。** 代理节点解析主机名的结果可能与客户端不同。客户端侧的 DoH 查询可能返回可用的 IP，而代理节点却返回被屏蔽或无法路由的 IP。使用 `curl -x proxy -H 'Host: host' -I https://<working-ip>` 进行测试，以区分 DNS 问题和可达性问题。
13. **指纹 ≠ 身份。** 服务横幅、端口特征或 MAC OUI 都只是容易被仿冒的线索，不能证明设备的真实身份。某个端口 5000 的响应端带有 `Server: AirTunes/…` 标头，且没有 `_raop` mDNS 广播，因此“看起来像”自建的 Linux AirPlay 接收器（shairport-sync）——但它实际上是 macOS AirPlay 接收器（ControlCenter 监听 5000/7000 端口），而较新的 `OpenSSH_10.x` 横幅才是揭示真相的线索。在同一事件中，Realtek OUI MAC 让人误以为它“与 NAS 属于同一厂商系列”，但实际上它来自连接到 Mac 的 USB 以太网适配器。在确定设备究竟是什么之前，应检查自我身份证据：将 SSH 主机密钥与 `~/.ssh/known_hosts` 对比（具有决定性——一台主机，一个密钥）、mDNS 主机名解析结果、AirPlay `/info` plist（设备自行报告的名称/型号/osBuildVersion）。应将横幅和 OUI 视为需要证伪的假设，绝不能将其作为结论。
14. **在一个网段上不可达 ≠ 已停止运行。** 探测只能证明其执行所在的 L2 域中的情况。更换路由器后，旧路由器在以太网上不响应 ARP——看起来“已停止运行”——但它的 Wi-Fi AP 仍在广播并提供 DHCP 服务，因此存有凭据的设备会悄无声息地加入一个无法访问 WAN 的网络。在宣布目标已消失之前，应从目标自身的视角验证（包括它的其他接口，例如在设备本身运行 `ipconfig getifaddr en1`）；此外，在任何拓扑变更后，都应物理关闭退役设备——一台仍在提供 DHCP 服务的“已停止运行”路由器会成为不断吸附设备的陷阱。
15. **拓扑变更会使手动 IP 设备变成孤岛。** DHCP 客户端会自动切换到新网络；使用手动/静态 IP 的设备则会保留旧网关和 DNS，从而成为沉默的孤岛——其他设备无法访问它们，它们也无法访问任何其他设备。macOS 中的“Manually Using DHCP Router Configuration”让这个问题更隐蔽（手动 IP + 从旧 DHCP 获取的路由器配置）：地址看起来是有意设置的，但网关已经过时。任何路由器/子网变更后，在宣布迁移完成之前，都应全面排查：检查旧子网上的 ARP 条目、解析到旧子网地址的 mDNS 名称，并重新验证每一台已知的静态 IP 设备（服务器、NAS、打印机）的网关和 DNS。

有关此案例研究在内的扩展示例，请参阅 [references/cognitive-traps.md](references/cognitive-traps.md)。

## 客户端代理 / VPN / TUN 路由错误

当症状是**客户端特有的**（某台机器上的浏览器无法访问，而其他设备或网络可以正常工作，或者关闭代理/VPN 后故障消失）时，代理客户端本身就是一个网络跳点。应将其视为网络跳点进行排查。

快速差异诊断检查清单：

1. **DNS**：操作系统将域名解析到什么 IP？如果是假 IP/TUN IP（例如 `198.18.x.x`），则代理客户端正在拦截 DNS。
2. **路由**：`route -n get <ip>` 会显示数据包从哪个接口发出。在 TUN 模式下，通过 `utun5` 路由假 IP 是正常的；如果真实 IP 仅通过 TUN 路由，而物理接口无法访问它，则说明本地直连已失效。
3. **代理端口**：本地代理是否正在监听？使用 `lsof -P -i TCP:<port>` 确认。分别在使用和不使用代理的情况下进行测试。
4. **通过代理访问主机名与 IP**：
   - `curl -x http://127.0.0.1:<port> -I https://<host>`
   - 自行解析主机名（DoH），然后运行 `curl -x http://127.0.0.1:<port> -k -H 'Host: <host>' -I https://<ip>`
   如果第二种方式成功而第一种失败，则说明代理节点的 DNS 返回了与客户端 DoH 查询结果不同或错误的 IP。
5. **物理接口可达性**：暂时强制真实 IP 通过 `en0`（或当前活动的物理接口）发送。如果该路径失败而 TUN 路径成功，则说明本地网络无法访问目标；必须使用代理/TUN。
6. **规则/CNAME 交互**：检查代理配置中是否存在匹配目标 CNAME 后缀的规则。如果客户端会根据解析后的 CNAME 评估规则，则 `DOMAIN-SUFFIX,<cname-suffix>,DIRECT` 规则可能会覆盖显式的 `DOMAIN,<host>,PROXY` 规则。

如果以上各项均指向代理客户端解析到了错误的 CNAME，或依赖了错误的代理节点 DNS，请参阅 [references/case-proxy-tun-cname-override.md](references/case-proxy-tun-cname-override.md) 中的修复模式。

## 反模式——需要明确避免的做法

- **在找到证伪条件之前就急于修复。**“可能是 X，让我重启 / 调整 / 升级一下。”这种做法会把学习机会变成无法防止问题再次发生的神秘修复。
- **全盘接受代理的反向审查结果。**代理往往会过度输出风险发现。采取行动前应先进行筛选（参见上文的四问筛选法）。
- **绕过 IaC 对生产环境进行临时修改。**如果调查需要更改生产环境，应先修改事实来源，然后再应用更改——否则，“修复”会在下一次部署时消失，而配置漂移也会掩盖真实状态。
- **根据单一观察结果断定根本原因。**必须先尝试进行证伪。
- **在没有重新运行失败实验的情况下写下“现在应该可以了”。**务必重新验证。

## 案例研究

以下三个典型案例展示了该方法论在不同故障模式下的应用：

1. [references/case-sse-rst-130s.md](references/case-sse-rst-130s.md)——一次持续 5 小时的调查，期间助手反复得出错误结论。一旦子代理设计了一个使用模拟空闲上游的三路径分层隔离实验，正确答案——Cloudflare 边缘节点在 126 秒触发 HTTP/2 流空闲超时，而 <upstream-provider> 在 <model-name> 的 tool_use 生成期间未发送 SSE ping，进一步放大了该问题——便在 10 分钟内浮出水面。

2. [references/case-cloudflare-524-upload.md](references/case-cloudflare-524-upload.md) — 在 `<api-domain>/<openrouter-path>` 上发生的 Cloudflare 524：一个约 6 MB 的 POST 请求体从美国客户端上传到位于 <origin-region> 的源站所花费的时间，超过了 Cloudflare 默认允许的源站读取超时时间。关键洞见来自将 `bytes_read`（4.1 MB）与 `Content-Length`（6.0 MB）进行比较，并确认请求从未到达 `<upstream-capture-service>` 或 `<new-api-container>`。此案例是上述“上传与处理的区分方法”和“边缘超时伪装成客户端中止”陷阱的来源。

3. [references/case-proxy-tun-cname-override.md](references/case-proxy-tun-cname-override.md) — 一个客户端侧的 `<proxy-client>` TUN 案例，其中即使显式的 PROXY 规则位于配置顶部，`<auth-domain>` 仍因 `ERR_CONNECTION_CLOSED` 而失败。根本原因是 `DOMAIN-SUFFIX,<cname-suffix>,DIRECT` 规则匹配了目标的 CNAME 链，而且代理节点自身的 DNS 返回了与客户端 DoH 查询不同的 IP。修复模式使用 `[Host]` 映射和 `use-local-host-item-for-proxy`。

在将此技能应用于不熟悉的问题领域之前，请先阅读这些案例；其中对错误路径的剖析才是教学重点。

## 参考文件

- [references/layered-isolation-experiment.md](references/layered-isolation-experiment.md) — 三路径技术、模拟上游模板、结果矩阵
- [references/instrumentation-patterns.md](references/instrumentation-patterns.md) — 由环境变量控制的 TRACE\_\*、便于 grep 检索的日志标签、部署检查清单
- [references/packet-capture-recipes.md](references/packet-capture-recipes.md) — 用于隔离 RST 的 tcpdump 过滤器、Docker 上的接口选择、HTTP/2 解码
- [references/counter-review-pattern.md](references/counter-review-pattern.md) — 由 4 个智能体组成的团队、4 问过滤法、集成工作流
- [references/cognitive-traps.md](references/cognitive-traps.md) — 扩展示例、补救循环警告
- [references/case-sse-rst-130s.md](references/case-sse-rst-130s.md) — 包含错误路径时间线的经典案例研究
- [references/case-cloudflare-524-upload.md](references/case-cloudflare-524-upload.md) — 上传超时与处理超时的区分方法
- [references/case-proxy-tun-cname-override.md](references/case-proxy-tun-cname-override.md) — 客户端侧代理/TUN 的 CNAME 规则覆盖及修复模式

## 脚本

- [scripts/mock-idle-upstream.py](scripts/mock-idle-upstream.py) — 一个 SSE 服务器：发送一帧后空闲 N 秒。在分层隔离实验中将其用作上游，以精确控制空闲时间间隔。
- [scripts/layered-isolation-probe.sh](scripts/layered-isolation-probe.sh) — 运行三路径 A/B/C 对比并输出诊断矩阵。