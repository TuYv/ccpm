---
name: backend-conventions
description: Sentry backend conventions for logging, tracing/spans, metrics tags, and the options system. Use when adding or editing Python in src/ that logs (logger.info/exception), records metrics (metrics.incr/timing with tags), instruments spans/transactions, or reads registered options with options.get(). Trigger on "add logging", "log an error", "add a metric", "add a span", "instrument tracing", "read an option", "LOG005", "LOG011", or metrics tag cardinality questions.
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

**重要**：切勿向 `options.get()` 调用添加默认值。所有选项都通过 `defaults.py` 中的 `register()` 注册，而该函数要求提供默认值。如果没有设置值，选项系统始终会返回已注册的默认值，因此第二个默认值参数不仅多余，还可能导致不一致。

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

请使用 `sentry.utils.tracing` 中的封装函数，而不是直接调用 SDK。在我们内部试用流式追踪生命周期（Span First rollout）期间，这是必需的。

| 不要使用                         | 应使用                                           |
| -------------------------------- | ------------------------------------------------ |
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

## 指标标签

每种不同的标签和值组合都是一个独立的时间序列，因此应确保标签**低基数、有意义且精简**：

- 仅当你确实会按某个标签进行筛选或分组时，才添加该标签。越少越好。
- 标签值必须是有界的/可枚举的（例如 `status`、`platform`、`reason`）——绝不能使用无界标识符（ID、电子邮件地址、URL、自由文本）。

中间件（`src/sentry/metrics/middleware.py`）通过拒绝标签键来强制执行此规则：标签键**以 `_id` 结尾**，或者恰好为 **`event`/`project`/`group`** 时，都会被拒绝。此类标签**将不起作用**：默认情况下会被静默移除，而在启用 `SENTRY_METRICS_DISALLOW_BAD_TAGS` 时（例如在 CI 中）则会引发 `BadMetricTags`——因此，一个在本地看起来正常的指标可能会在其他环境中失败。

```python
metrics.incr("my.metric", tags={"project_id": project.id})   # WRONG: stripped / raises
metrics.incr("my.metric", tags={"platform": project.platform})  # RIGHT: bounded values
```

尽管存在上述规则，仍有少数键被列入允许列表（参见 `_NOT_BAD_TAGS`）；不要为了绕过此限制而扩展该列表——应改用低基数标签。