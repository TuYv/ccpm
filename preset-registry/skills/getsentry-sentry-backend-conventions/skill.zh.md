---
name: backend-conventions
description: Sentry backend conventions for logging, tracing/spans, span/tag attribute naming, metrics tags, and the options system. Use when adding or editing Python in src/ that logs (logger.info/exception), records metrics (metrics.incr/timing with tags), instruments spans/transactions, calls sentry_sdk.set_tag/set_attribute or set_span_tag/set_span_data, or reads registered options with options.get(). Trigger on "add logging", "log an error", "add a metric", "add a span", "instrument tracing", "set an attribute", "add a tag", "read an option", "LOG005", "LOG011", or metrics tag cardinality questions.
---
# 后端约定：日志、追踪、指标、选项

## 选项系统

Sentry 使用集中式选项系统，所有选项都在 `src/sentry/options/defaults.py` 中注册，并且必须提供默认值。

```python
# CORRECT: options.get() without default - registered default is used
from sentry import options

batch_size = options.get("deletions.group-hash-metadata.batch-size")

# WRONG: Redundant default value
batch_size = options.get("deletions.group-hash-metadata.batch-size", 1000)
```

**重要**：绝不要在 `options.get()` 调用中添加默认值。所有选项都通过 `defaults.py` 中的 `register()` 注册，并且必须提供默认值。如果未设置值，选项系统始终会返回已注册的默认值，因此额外的默认参数是多余的，并且可能导致不一致。

## 日志记录模式

```python
import logging
from sentry import analytics
from sentry.analytics.events.feature_used import FeatureUsedEvent  # does not exist, only for demonstration purposes

logger = logging.getLogger(__name__)

# Structured logging
logger.info(
    "user.action.complete",
    extra={
        "user_id": user.id,
        "action": "login",
        "ip_address": request.META.get("REMOTE_ADDR"),
    }
)

# IMPORTANT: LOG005 use exception() within an exception handler
# WRONG: Calling logger.error() when capturing exception
try:
    risky_operation()
except ValidationError as e:
    logger.error("error.invalid_payload")

# RIGHT: Use logger.exception() with a message when capturing an exception
try:
    risky_operation()
except ValidationError:
    logger.exception("error.invalid_payload")

# IMPORTANT: Avoid LOG011 - Never pre-format log messages with f-strings or .format()
# WRONG: Pre-formatting evaluates before logger call, even if logging is disabled
logger.info(f"User {user.id} completed {action}")
logger.info("User {} completed {}".format(user.id, action))

# RIGHT: Use logger's %-formatting for lazy evaluation
logger.info("%s.user.action.complete", PREFIX)

# ALSO RIGHT: Use structured logging with extra parameters only
logger.info(
    "user.action.complete", extra={"user_id": user.id}
)

# Analytics event
analytics.record(
    FeatureUsedEvent(
        user_id=user.id,
        organization_id=org.id,
        feature="new-dashboard",
    )
)
```

## 追踪 / Span

请使用 `sentry.utils.tracing` 中的封装，而不是直接调用 SDK。由于我们正在试用流式追踪生命周期（Span First rollout），这是必需的。

| 不要使用 | 应使用 |
| -------------------------------- | -------------------------------- |
| `sentry_sdk.start_span()`        | `start_span(name=..., op=...)`                   |
| `sentry_sdk.start_transaction()` | `start_span(name=..., op=..., transaction=True)` |
| `span.set_tag(key, value)`       | `set_span_tag(span, key, value)`                 |
| `span.set_data(key, value)`      | `set_span_data(span, key, value)`                |

```python
from sentry.utils.tracing import start_span, set_span_tag, set_span_data

# Child span — no need to capture the span when you don't set tags/data
with start_span(name="event_manager.save", op="save"):
    do_work()

# Child span with tags/data — capture via `as span`
with start_span(name="event_manager.save", op="save") as span:
    set_span_tag(span, "platform", platform)
    set_span_data(span, "rows_count", len(rows))

# Transaction root (replaces sentry_sdk.start_transaction)
with start_span(name="monitors.consumer", op="process", transaction=True):
    process_batch()
```

## Span / Tag 属性名称

在为 `sentry_sdk.set_tag`/`set_attribute`、`set_span_tag` 或 `set_span_data` 发明键之前，请检查 OTel 或 Sentry 是否已在 `sentry_conventions.attributes.ATTRIBUTE_NAMES` 中提供了标准名称。复用约定名称可以确保该属性可查询，并与其他生产者（SDK、Relay）针对同一概念发出的属性保持一致；自定义名称会使同一数据分散到两个键中。

```python
from sentry_conventions.attributes import ATTRIBUTE_NAMES

# WRONG: inventing a name for a concept the conventions already cover
sentry_sdk.set_attribute("request_user_agent", user_agent)

# RIGHT: use the existing convention name
sentry_sdk.set_attribute(ATTRIBUTE_NAMES.USER_AGENT_ORIGINAL, user_agent)
```

`ATTRIBUTE_NAMES` 根据 OTel 语义约定以及 Sentry 自有模型生成（`.venv/lib/python*/site-packages/sentry_conventions/attributes.py`）；在添加新名称之前，先在其中 grep 候选关键词。只有当某个概念确实没有对应约定时，才回退到自定义键，并且应优先使用带命名空间且描述性明确的名称。在功能尚未发布期间，将某个键保留在 `_test`/POC 后缀之后，是一种独立且有意为之的做法；这涉及隐藏字段，而不是选择字段名称。

## Metrics 标签

每一种不同的标签值组合都是一个独立的时间序列，因此请保持标签**低基数、有意义且最少化**：

- 仅在确实需要通过该标签进行筛选或分组时添加它。越少越好。
- 标签值必须是有界且可枚举的（例如 `status`、`platform`、`reason`），绝不能使用无界标识符（ID、电子邮件、URL、自由文本）。

中间件（`src/sentry/metrics/middleware.py`）通过拒绝标签键来强制执行这一点：标签键以 `_id` 结尾，或完全等于 **`event`/`project`/`group`** 时会被拒绝。此类标签**无法正常工作**：默认情况下会被静默移除；启用 `SENTRY_METRICS_DISALLOW_BAD_TAGS` 后（例如在 CI 中）则会引发 `BadMetricTags`，因此某个指标可能在本地看起来正常，却在其他环境中失败。

```python
metrics.incr("my.metric", tags={"project_id": project.id})   # WRONG: stripped / raises
metrics.incr("my.metric", tags={"platform": project.platform})  # RIGHT: bounded values
```

尽管有上述规则，仍有少数键被列入允许列表（参见 `_NOT_BAD_TAGS`）；不要通过扩展允许列表来规避这一约束，而应选择低基数的标签。