---
name: sentry-backend-bugs
description: 'Review Sentry Python and Django changes for bug patterns drawn from real production issues. Use when reviewing a backend diff or PR, checking Warden findings, auditing the current branch, reviewing production-error patterns, or looking for common regressions in `src/` and `tests/`.'
allowed-tools: Read Grep Glob Bash
---
# Sentry 后端缺陷模式审查

通过检查最容易导致真实生产错误的模式，发现 Sentry 后端代码中的缺陷。

此技能归纳了 638 个真实生产问题（393 个已解决、220 个未解决、25 个已忽略）中的模式，这些问题共产生了超过 2700 万个错误事件，影响了 65,000 多名用户。这些并非理论风险——它们是最常被发布到生产环境中的实际缺陷，并且已解决的问题都有已知修复方案。

## 范围

审查用户、Warden 或当前分支差异所提供的代码。如果用户未提供目标，则审查当前分支差异。从发生变更的代码块或文件开始，仅在需要确认行为时向外扩展阅读范围。

1. 根据下述模式检查项分析变更后的代码。
2. 必要时使用 `Read` 和 `Grep` 追踪初始差异之外的数据流。沿着函数调用、调用方、序列化器、任务和 ORM 边界进行追踪，直到确认其行为。
3. 仅报告置信度为 **高** 和 **中** 的发现。

| 置信度     | 标准                                                                  | 操作                     |
| ---------- | --------------------------------------------------------------------- | ------------------------ |
| **高**     | 已追踪代码路径，并确认该模式与已知缺陷类别相符                        | 报告并提供修复方案       |
| **中**     | 存在该模式，但上下文可能会降低其影响                                  | 报告为需要验证           |
| **低**     | 仅为理论风险或已在其他位置得到缓解                                    | 不报告                   |

## 第 1 步：对代码进行分类

确定正在审查的代码类型，并加载相关参考资料。

| 代码类型                                                          | 加载参考资料                         |
| ----------------------------------------------------------------- | ------------------------------------ |
| ORM 查询、模型查找、`.objects.get()`、FK 访问                     | `references/missing-records.md`      |
| 类型转换、None 处理、选项读取、序列化器返回值                     | `references/null-and-type-errors.md` |
| 数据输入解析、字段长度、请求体、解压                              | `references/data-validation.md`      |
| `get_or_create`、`save()`、唯一约束、整数溢出                     | `references/database-integrity.md`   |
| 集成 Webhook、外部 API 调用、SentryApp 钩子                       | `references/integration-errors.md`   |
| 字典迭代、共享状态、并发访问                                      | `references/concurrency-bugs.md`     |
| Snuba 查询、指标订阅、搜索过滤器                                  | `references/query-validation.md`     |
| 重定向 URL、URL 构造、路由                                        | `references/url-safety.md`           |

如果代码横跨多个类别，请加载所有相关参考资料。

## 第 2 步：检查高频缺陷模式

以下模式按照真实生产数据中的综合发生频率和影响程度排序。

### 检查 1：指标订阅查询错误——113 个问题，3,035,640 个事件

引用了目标数据集中不存在的标签或函数的告警和指标订阅。此类订阅一旦创建，就会持续触发。

**危险信号：**

- 使用用户提供且未经验证的查询字符串，通过 `SubscriptionData` 创建 Snuba 订阅
- 在指标数据集的 p95/p99 函数中引用 `transaction.duration`（该字段在此数据集中是字符串类型）
- 使用自定义标签名称（例如 `customerType`）作为过滤维度，而不检查它们是否存在
- 调用 `resolve_apdex_function`，但未验证数据集是否支持阈值参数

**安全模式：**

- 创建订阅前，根据数据集 schema 验证查询字段
- 使用 try/except `SubscriptionError` 包装 `_create_in_snuba` 调用，并将订阅标记为无效
- 构建指标订阅查询前，使用 `IncompatibleMetricsQuery` 检查

### 检查 2：记录缺失 / 引用失效——81 个问题，1,403,592 个事件

代码对 Django 模型调用 `.get()`，并假定记录存在，但该记录可能已被删除、合并，或从未创建。

**危险信号：**

- 使用 `Model.objects.get(id=some_id)`，但未通过 try/except 处理 `DoesNotExist`
- 在工作流引擎中使用 `Detector.objects.get(id=detector_id)`，但未处理记录被删除的情况
- 在监控器/cron 消费者中使用 `Environment.objects.get(name=env_name)`
- 在计费任务中使用 `Subscription.objects.get(id=sub_id)`
- 使用 Snuba 查询结果中的 ID 调用 `Group.objects.get()`（组可能已被删除或合并）
- 链式查询中第二个 `.get()` 失败

**安全模式：**

- 使用 `Model.objects.filter(...).first()` 并检查结果是否为 None
- 使用 try/except `DoesNotExist`，并妥善降级处理（返回 404、跳过、记录日志）
- 在调用 `.get()` 前先使用 Queryset 的 `.exists()` 检查
- 在 API 端点中：遇到 `DoesNotExist` 时返回 404，遇到验证错误时返回 400。切勿建议故意返回 500。

**并非 bug——请勿标记：**

- 基础设施不变量：使用 `.get()` 强制执行部署前提条件（例如“单组织模式下默认组织必须存在”）时，应当让程序崩溃——500 表示配置错误，而非代码缺陷。
- 已由父级验证：如果端点基类已验证对象（例如 `OrganizationEndpoint` 会解析组织），则不要标记针对相关记录的 `.get()`，除非确实存在竞态条件或删除时间窗口。报告前请阅读端点的父类。
- 配置查询：加载必需配置对象的代码（`get_default()`、基于 settings 的查询）在配置错误时本就应该直接失败。

### 检查 3：搜索查询验证——57 个问题，2,001,330 个事件

由用户提供或存储在订阅中的查询过滤器引用了无效值、已删除的问题或无法解析的标签，从而引发 InvalidSearchQuery。

**危险信号：**

- 使用存储订阅中的短 ID 调用 `by_qualified_short_id_bulk()`，而这些短 ID 引用了已删除或重命名的项目
- `_issue_filter_converter` 对用户提供的问题短 ID 调用 `Group.objects.get()`
- 调用 `resolve_tag_key()`，但未检查目标数据集中是否存在该标签
- 将告警规则订阅中未经验证的 `query` 字符串传递给 Snuba

**安全模式：**

- 在传递给 `by_qualified_short_id_bulk()` 之前验证短 ID——处理 `Group.DoesNotExist`
- 使用 try/except 包装 `_issue_filter_converter`，并针对无效过滤器返回空结果
- 根据数据集 schema 预先验证标签是否存在

### 检查 4：值验证错误——45 个问题，1,000,624 次事件

因输入验证不足而引发的 ValueError：解包错误、无效的枚举值、缺少预期对象，以及 Pydantic/DRF 验证失败。

**危险信号：**

- 操作构建器中的 `SentryAppInstallation.objects.get()` 假定恰好存在 1 个结果
- 按 ID 查找 `AlertRuleWorkflow` 时未处理 `DoesNotExist`
- 对分隔符数量可能不足的字符串执行元组解包（`a, b, c = value.split(":")`）
- 查找整数枚举时未捕获 `ValueError`（例如 `DetectorPriorityLevel(value)`）

**安全模式：**

- 在 `.get()` 之前验证预期数量：使用 `.filter()` 并检查 `.count()`
- 使用 try/except `ValueError` 包装元组解包，或先验证长度
- 面向用户进行枚举转换时，使用 `try: EnumClass(value) except ValueError:`
- 在 API 端点中：针对 `ValueError` 和验证失败返回 400。

### 检查 5：类型错误——28 个问题，740,106 次事件

向函数传入了错误类型：迭代不可迭代对象、使用无效的字典键、在预期为对象的位置传入 None。

**危险信号：**

- 对可能包含非字符串键的 payload 字典调用 `orjson.dumps(payload)`
- 当 `setting` 可能是整数（来自 `project.get_option()`）时调用 `list(setting)`
- 当 `result` 可能为 None 时执行 `result["key"] = value`
- 对来自数据库/配置且可能是整数或 None 而非列表的值进行迭代

**安全模式：**

- 迭代前检查类型：在调用 `list(value)` 之前使用 `isinstance(value, (list, str))`
- 在进行 JSON 序列化之前验证字典键：确保所有键都是字符串
- 在进行下标赋值之前检查 None：`if result is not None:`
- 读取选项时进行防御性类型检查
- 在 API 端点中：针对用户输入导致的类型不匹配返回 400。

### 检查 6：内部 API 请求错误——71 个问题，829,753 次事件

服务之间的内部 Sentry API 调用引发 ApiError，通常由过期的订阅参数导致。

**危险信号：**

- 指标告警图表渲染中的 `api.client.get()` 调用未处理 400 响应
- 转发过期订阅查询（引用已移除的标签/指标）的内部 API 调用
- `incidents/charts.py` 中的 `fetch_metric_alert_events_timeseries()` 未处理 ApiError

**安全模式：**

- 使用 try/except `ApiError` 包装内部 API 调用，并返回适当的回退结果
- 在发起内部 API 请求之前验证查询参数
- 在图表/可视化代码中显式处理 400/500 响应

### 检查 7：数据库约束冲突——22 个问题，2,962,198 次事件

因整数溢出、外键冲突和唯一约束冲突而引发的 IntegrityError 和 DataError。

**危险信号：**

- 无边界地递增 `times_seen` 计数器（约 21 亿时发生整数溢出）
- 删除 `MonitorCheckIn` 记录时未处理来自 `MonitorIncident` 的外键约束
- 对 `GroupOpenPeriod` 日期范围执行 `UPDATE` 时，下限可能超过上限
- 对具有唯一约束的模型调用 `save()` 时未处理 `IntegrityError`

**安全模式：**

- 更新前限制整数字段的上限：对于 32 位整数列，使用 `min(value, 2_147_483_647)`
- 批量删除前使用 `CASCADE` 或处理 FK 约束
- 保存前验证日期范围边界
- 使用 try/except 捕获 `IntegrityError`，并回退到 `get()` 或 `update_or_create()`

### 检查 8：数据解析与反序列化——19 个问题，272,812 次事件

解析外部数据或已存储的压缩数据时出现 JSONDecodeError 和 ZstdError。

**危险信号：**

- 使用 `json.loads(response.body)` 时未捕获 `JSONDecodeError`
- 使用 `zstd.decompress(data)` 时未处理损坏的帧描述符
- 解析可能被截断的 VSTS/Azure DevOps Webhook 请求体
- 假定 API 响应始终是有效的 JSON（也可能是 HTML 错误页面）

**安全模式：**

- 始终使用 try/except 包裹 JSON 解析/解压缩操作，并提供妥善的回退处理
- 解析前检查 `content-type` 标头
- 解析响应体前验证响应状态

### 检查 9：访问缺失的键（KeyError）——25 个问题，155,020 次事件

访问字典键或 HTTP 标头时未检查其是否存在。

**危险信号：**

- 在 Webhook 处理程序中使用 `request.META["HTTP_X_GITLAB_TOKEN"]`（该标头可能不存在）
- 在 Bitbucket Webhook 处理程序中使用 `request.META["HTTP_X_EVENT_KEY"]`
- 使用 `HANDLERS[event_type]` 查找字典键，但未检查该事件类型是否已注册
- 对通过长度可变的拆分操作获得的标头值进行元组解包

**安全模式：**

- 使用 `request.META.get("HTTP_X_GITLAB_TOKEN")` 并检查是否为 None
- 使用 `HANDLERS.get(event_type)`，并为未知事件类型提供回退处理
- 在 Webhook 处理程序开始处理前验证必需的标头

### 检查 10：并发与运行时错误——23 个问题，38,443 次事件

迭代期间修改字典、共享可变状态，以及未实现的代码路径。

**危险信号：**

- 执行 `for key in self._dict:` 时另一个线程对其进行修改（RuntimeError）
- 向共享 `KafkaPublisher` 字典发布数据，导致其无限增长
- 对正在被另一个线程迭代的字典执行 `dict.pop()` 或 `dict[key] = value`
- 缺少针对新搜索表达式类型的 `NotImplementedError` 处理程序

**安全模式：**

- 迭代前使用 `dict.copy()`
- 对共享可变状态使用 `threading.Lock`
- 启用功能前实现所有代码路径
- 需要在迭代期间修改字典时，使用 `list(dict.keys())` 进行安全迭代

### 检查 11：逻辑正确性——不基于模式

检查完上述所有已知模式后，对变更的代码本身进行推理：

- 每条代码路径是否都返回正确的类型？
- 条件语句的所有分支是否都得到了处理（尤其是 `else` / 默认分支）？
- 是否有任何输入（None、空列表、0、空字符串）会导致意外行为？
- 循环、切片或范围检查中是否存在差一错误？
- 如果此代码并发运行，共享状态是否受到保护？

仅当你能追踪到可触发错误的具体输入时才报告。不要报告理论上的问题。

**不属于错误——请勿标记：**

- 用于强制执行基础设施不变量的 `assert` 语句——Sentry 不会使用 `python -O` 运行，因此断言始终处于启用状态。违反不变量时崩溃是有意为之。
- 推测性的输入问题（例如“此 URL 可能过长”“此标头可能格式错误”），除非你能证明该输入确实未经验证便到达了该代码路径。报告前请检查现有验证（主机检查、模式验证、DRF 序列化器）。

**如果所有检查都没有发现潜在问题，请停止并报告零项发现。不要为了填充报告而编造问题。当代码不存在符合这些模式的缺陷时，空结果就是正确的输出。**

每个代码位置只应在与其匹配的最具体模式下报告一次。不要在多项检查中重复标记同一行。

## 步骤 3：报告发现

对于每项发现，请提供审查工具所需的证据：

- 精确位置
- 严重程度和置信度
- 触发问题的具体输入或状态
- 根本原因及后果
- 如有可用信息，提供匹配的生产环境先例
- 具体的代码修复方案；如果审查工具支持，最好以统一差异格式提供

修复建议必须包含实际代码。切勿建议使用注释或文档字符串作为修复方案。

为 API 端点建议修复方案时，请使用适当的 HTTP 状态码（未找到使用 404，错误输入使用 400，冲突使用 409）。切勿建议故意返回 500。

不要自行规定输出格式——响应结构由审查工具控制。