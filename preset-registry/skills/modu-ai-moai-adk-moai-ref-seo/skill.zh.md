---
name: moai-ref-seo
description: >
  Search-visibility and crawlability reference for web output: canonical URL
  discipline, per-page title and meta description uniqueness, robots.txt and
  sitemap.xml as host-derived artifacts, JSON-LD structured data with entity
  consistency, and the document-semantics rules that decide whether a machine can
  read a page at all. Agent-extending skill that amplifies web-output implementation
  and pre-ship review with production-grade indexing and structured-data patterns.
  NOT for: keyboard operability, visible focus indicators, and form-control labeling
  (accessibility owns those; delegated to the accessibility surface); generative-engine
  optimization, deliberately excluded as insufficiently settled; visual polish and
  interface detail (see moai-ref-ui-polish); API contract design (see
  moai-ref-api-patterns); security headers and hardening (see moai-ref-owasp-checklist
  and moai-ref-secops).

when_to_use: >
  Use when a project emits pages that a search engine or an automated reader will
  fetch: choosing canonical addresses, writing per-page metadata, emitting robots.txt
  or sitemap.xml, adding or reviewing JSON-LD, keeping entity naming consistent
  between the page and its serialized data, or auditing heading structure, image alt
  text, anchor text, and in-page fragment targets before shipping. Guidance stays at
  the protocol and output layer — addresses, response headers, markup, serialized
  data — so it applies to any stack that produces HTML.

user-invocable: false
metadata:
  version: "1.0.0"
  category: "domain"
  status: "active"
  updated: "2026-08-01"
  tags: "seo, canonical, structured-data, json-ld, sitemap, robots, metadata, crawlability, reference"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 3000
---
# 搜索可见性参考

## 目标代理

- `manager-develop` — 在实现页面、路由和序列化元数据输出时应用这些规则
- `/moai review` — 发布前的索引审查界面；也可等效地在每次生成时使用带有 Web 输出审查指令的 `Agent(general-purpose)`

## 核心原则

页面是否会被索引，取决于机器能够抓取和解析的内容，而不是一切加载完成后用户看到的内容。以下所有问题主要归结为两种故障：同一内容可通过多个地址访问，以及序列化数据中声明了页面上没有任何内容可以佐证的信息。这里的每条规则都是这两种故障之一的具体化。

搜索引擎发布后又悄然修订的数值——截断宽度、排名权重、抓取限额——被有意省略。在限制确实重要的地方，本参考会给出决策规则和应执行的测量方法，使这些指导原则不会因具体数值变化而过时。

## 文档语义

解析器在抵达任何内容信号之前所读取的结构。这是最容易引入的一类缺陷，也是最容易检测的一类缺陷。

| 规则 | 检查方法 | 所防止的故障 |
|---|---|---|
| 每个文档恰好有一个 `h1` | 统计每个页面渲染输出中的 `h1` 元素 | 相互竞争的主题信号使主题含糊不清 |
| 不跳过标题层级 | 遍历标题序列；每次向下深入最多只跨一个层级 | 解析器无法重建章节嵌套关系 |
| 每张图片都带有 `alt` 文本 | 每个图片元素都有非空的 `alt` 属性，或者空属性并配有明确的装饰性标记 | 含义被封存在解析器无法打开的二进制文件中 |
| 锚文本说明其目标 | 隐藏周围句子后阅读每个链接的文本，然后判断它指向何处 | 指令式链接文本无法传递任何关于目标的信息 |
| 片段目标可解析 | 对于每个页内片段链接，确认同一渲染输出中存在匹配的标识符 | 导航悄无声息地跳转到不存在的位置 |

应根据图片描绘的内容编写 `alt` 文本，绝不能根据其文件名编写。如果图片确实没有提供读者需要的任何信息，应有意将其标记为装饰性图片，而不是为它凭空编造描述。

## 身份与规范地址

一个资源对应一个地址；其他所有地址都重定向到该地址。

| 决策 | 规则 |
|---|---|
| 哪个地址是规范地址 | 为每个资源选择一种地址形式并声明它。声明的值必须与实际提供服务的地址一致 |
| 尾部斜杠变体 | 选择一种形式，并将另一种形式永久重定向到它。同时提供两种形式会使一个资源分散到两个地址 |
| 大小写、查询参数、跟踪后缀 | 在提供服务前进行规范化。不会改变响应的参数不得生成第二个地址 |
| 参数化路由 | 根据解析后的参数构建声明值，绝不能使用整个路由共享的固定字符串 |
| 停用某个地址 | 将旧形式永久重定向，并在同一次变更中更新声明 |

指向会重定向、报错或提供不同内容的地址的声明，比完全没有声明更糟：它会主动将读者从声明所在的页面引向别处。

## 每页元数据

| 字段 | 规则 | 常见缺陷 |
|---|---|---|
| `title` | 每个页面都应唯一，由页面特定部分加上稳定的网站标识符组成 | 脚手架的默认值在每条路由上都被带入生产环境 |
| 元描述 | 每个页面都应唯一，并面向阅读搜索结果摘要的用户撰写 | 所有页面都复制同一条描述，或者文案没有描述任何实际内容 |
| 索引指令 | 为公开页面设置默认值，然后按页面类别进一步收紧。经过身份验证的区域和内部工具应被明确排除，而不能仅仅依靠不提供链接来避免索引 | 私有页面因为没有声明禁止索引而被收录 |
| 社交预览字段 | 必须存在并使用绝对地址。第三方获取相对地址字段时，会相对于错误的主机进行解析 | 分享卡片在站外显示为空白 |

长度预算是一项决策规则，而不是常量：先起草文本，观察使用它的界面会在哪里截断，然后根据观察结果进行删减。占位符检测应纳入发布前检查——扫描生成的输出，查找脚手架自身的默认字符串，只要有任何一个残留就让检查失败。

## 结构化数据

序列化的 JSON-LD 用于说明页面*是什么*。它唯一的硬性约束是必须与可见页面相对应。

| 决策 | 规则 |
|---|---|
| 要输出哪些类型 | 根据页面的实际角色确定——组织、产品、软件、地点或文章。在所有页面上输出站点级类型，仅在适用的页面上输出页面特定类型 |
| 必填字段 | 每种类型都有一组精简的必填核心字段。应完整输出这组核心字段，而不是不完整地输出多个类型 |
| 数据中的地址 | 必须是绝对地址，并且可以成功解析。相对值会被直接丢弃，且不会给出警告 |
| 一个页面上的多个实体 | 使用一个区块容纳所有实体，为每个实体提供稳定的标识符，并通过标识符进行交叉引用，而不是嵌套重复副本 |
| 放置位置 | 将每种类型保留在它所描述的页面上。在整个站点中重复某种类型只会削弱其作用，而不会增强其作用 |

**镜像规则**——序列化数据中的每一项声明，都需要在同一页面上有可见的对应内容。仅存在于标记中的名称、描述、评分或问答对，是读者无法核实的声明；如今，这会被视为负面信号，而不再是中性信号。

## 实体一致性

结构化数据用于标识实体。一致性则确保该身份在相互独立的信息来源之间保持成立。

| 表面 | 要求 |
|---|---|
| 规范名称 | 使用同一种拼写、同一种大小写形式和同一种后缀——在序列化数据、页面文案和标题中保持一致 |
| 自有资料链接 | 仅限该实体自行管理的账户，并逐一确认链接可以正常解析，而不是跳转到登录页面 |
| 联系信息 | 名称、地址和联系电话在序列化数据、可见页面以及所有第三方列表中完全一致 |
| 宁可省略，也不要近似填写 | 没有准确值的字段应予以省略。部分准确或虚构的值会割裂它原本旨在建立的实体身份 |

对人而言微不足道的格式差异，对匹配器来说却是不同的值。为每个字段确定一种格式，并在该实体出现的所有位置始终沿用这一格式。

## 基于主机生成的抓取产物

`robots.txt` 和 `sitemap.xml` 是网站对外提供的输出，而不是在不同环境之间传递的文件。

| 产物 | 规则 |
|---|---|
| `robots.txt` | 根据传入请求的主机推导其中包含的绝对地址，使每个环境都能正确描述自身 |
| `sitemap.xml` | 枚举实际提供的地址。为已移除页面保留条目会浪费抓取尝试，并释放内容陈旧的信号 |
| 保持同步 | 添加或移除路由时，应在同一次变更中更新枚举。手动维护的列表在一次迭代内就会发生偏移 |
| 每个条目的提示 | 附加到条目上的新鲜度和权重提示仅供参考，且普遍会被弱化处理。地址集合的正确性远比其上的提示重要 |

将某个环境的主机硬编码到任一产物中，是一个反复出现的缺陷，因为它能够通过审查，却只在一个环境中是正确的。

## 交付瓶颈

| 关注点 | 规则 |
|---|---|
| 响应标头 | 在所有响应都会经过的单一包装点应用它们，包括错误响应和重定向响应。仅在成功路径上设置的标头，恰恰会在最可能误导读取者的时候缺失 |
| 渲染模式 | 将“读取者在首次响应中会收到什么？”视为项目需要明确回答的问题。只有在客户端工作完成后才出现的内容，不执行客户端代码的读取者可能永远无法看到 |
| 重定向链 | 只需一次跳转即可到达规范地址。每增加一次跳转，就多一次失去读取者的机会 |
| 第三方源 | 对页面所依赖源的连接提示，应放在使用这些源的资源之前。应衡量其对本项目页面的实际影响，而不是想当然地假设效果 |

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的合理化说辞

| 合理化说辞 | 事实 |
|---|---|
| “框架已经设置了合理的元数据默认值” | 默认值在设计上对所有路由都相同。唯一性正是该字段存在的全部目的，因此它不能通过继承获得。 |
| “两种地址形式提供的是同一个页面，所以没有区别” | 对抓取工具而言，用两个地址提供同一项资源就是两项资源。除非通过声明和重定向刻意确定，否则只能靠猜测决定保留哪一个。 |
| “序列化数据可以表达比页面所展示内容更多的信息——这是额外的上下文” | 没有可见对应内容的数据是一项无法验证的声明，评分时也会被如此对待。 |
| “标题结构和 `alt` 文本属于无障碍范畴，而不属于索引范畴” | 它们是机器用来分段和描述页面的解析结构。与无障碍功能共用一种机制，并不构成推迟处理它们的理由。 |
| “地址枚举可以在后续变更中更新” | 与路由分开维护的列表会立即发生偏移，而且悄无声息。根据路由推导列表，是唯一能使其始终保持真实准确的做法。 |
| “产物中使用暂存环境主机没问题，我们会在部署时替换它” | 硬编码的主机只在一个环境中正确，在其他所有环境中都错误，包括最终被索引的环境。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 一个页面上存在两个或更多 `h1` 元素，或标题层级序列出现跳级
- canonical 声明与实际提供该页面的地址不匹配
- 同一个 `title` 或元描述被重复用于多个路由
- 图片没有 `alt` 属性，或 `alt` 文本重复了文件名
- 链接文本是操作指令，而不是目标位置的名称
- 页面内片段链接在渲染输出中没有匹配的标识符
- `robots.txt` 或 `sitemap.xml` 使用硬编码的主机，而不是从请求中派生的主机
- 序列化的 JSON-LD 声明了名称、描述或优惠信息，但页面上没有对应的可见内容
- 第三方会获取的字段中使用了相对地址——例如分享预览图片、结构化数据徽标
- 响应标头仅应用于成功路径，未覆盖重定向和错误响应

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 每个渲染后的页面都恰好有一个 `h1`，且标题层级序列没有跳级——报告实际观察到的数量，而非设计意图
- [ ] 已获取每个路由的 canonical 声明，且该地址未经过中间重定向便返回同一页面
- [ ] 已收集所有路由的 `title` 和元描述；不存在重复项，也没有遗留脚手架默认字符串
- [ ] 每个图片元素都有 `alt` 属性，且装饰性图片被有意标记为此类图片
- [ ] 每个页面内片段链接均已根据其所在页面的渲染输出进行解析
- [ ] 已从部署主机获取 `robots.txt` 和 `sitemap.xml`，且其中每个地址均可解析——列出实际观察到的地址集合
- [ ] 序列化的 JSON-LD 可被解析，其中的地址均为绝对地址，且它作出的每项声明在页面上都有对应的可见内容，并已引用该内容
- [ ] 已在成功响应、重定向响应和错误响应中观察到响应标头

<!-- moai:evolvable-end -->