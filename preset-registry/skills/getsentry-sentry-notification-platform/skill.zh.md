---
name: notification-platform
description: Guide for adding notifications, custom renderers, or new providers to Sentry's NotificationPlatform. Use when asked to "add notification", "new notification", "notification platform", "send notification", "notification template", "notification renderer", "notification provider", "NotificationPlatform", "notify user", "send email notification", "send slack notification".
---
# NotificationPlatform 指南

Sentry 的 NotificationPlatform 是一个基于提供程序的系统，用于通过 Email、Slack、Discord 和 MS Teams 发送通知。你需要定义数据和模板并进行注册，平台将负责针对每个提供程序进行渲染和投递。

## 术语表

| 概念                           | 作用                                                                                                                                                                                                 | 位置          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `NotificationData`             | 协议。用于承载单条通知有效载荷的冻结数据类。必须声明一个 `source` 类变量。                                                                                                                           | `types.py`    |
| `NotificationTemplate`         | 抽象类。将 `NotificationData` 转换为 `NotificationRenderedTemplate`。按 `NotificationSource` 注册。                                                                                                 | `types.py`    |
| `NotificationRenderedTemplate` | 数据类。与提供程序无关的输出：主题（字符串或文本块）、正文（包含文本块的分区）、操作、图表、页脚（字符串或文本块），以及可选的电子邮件路径。                                                       | `types.py`    |
| `NotificationProvider`         | 协议。负责验证目标、选择渲染器，并发送最终的可渲染内容（Email、Slack 等）。                                                                                                                          | `provider.py` |
| `NotificationRenderer`         | 协议。将 `NotificationRenderedTemplate` 转换为特定于提供程序的可渲染内容（HTML 电子邮件、Slack 块等）。                                                                                              | `renderer.py` |
| `NotificationTarget`           | 协议。标识接收者：电子邮件地址、频道 ID 或私信用户 ID。包含两个具体类：`GenericNotificationTarget`（电子邮件）和 `IntegrationNotificationTarget`（Slack/Discord/MSTeams）。                         | `target.py`   |
| `NotificationService`          | 入口点。协调查找、渲染和投递。提供 `has_access()`、`notify_target()`、`notify_async()`、`notify_sync()`。                                                                                            | `service.py`  |

以下所有路径均相对于 `src/sentry/notifications/platform/`。

## 第 1 步：确定你的操作

| 我想要……                                       | 前往      |
| ---------------------------------------------- | --------- |
| 添加新通知（最常见）                           | 第 2-5 步 |
| 为现有提供程序添加自定义渲染器                 | 第 6 步   |
| 添加全新的提供程序                             | 第 7 步   |

完成任何操作后，请继续执行第 8 步（测试）和第 9 步（验证）。

## 第 2 步：定义通知来源

每个通知都需要一个唯一的 `NotificationSource` 枚举值，并且必须映射到一个 `NotificationCategory`。`NotificationSource` 应表示给定通知所属的领域或功能。

> 如需查看示例，请加载 `src/sentry/notifications/platform/types.py`。

**文件：** `types.py`

1. 在适当的类别注释下添加枚举值：

```python
class NotificationSource(StrEnum):
    # MY_CATEGORY
    MY_NEW_SOURCE = "my-new-source"
```

2. 将其添加到匹配类别键下的 `NOTIFICATION_SOURCE_MAP` 中：

```python
NOTIFICATION_SOURCE_MAP[NotificationCategory.MY_CATEGORY].append(
    NotificationSource.MY_NEW_SOURCE
)
```

如果现有的 `NotificationCategory` 均不适用，请先向 `NotificationCategory` 枚举添加一个新值，然后在 `NOTIFICATION_SOURCE_MAP` 中为其创建对应条目。

所有 `NotificationCategory` 选项都定义在 `src/sentry/notifications/platform/types.py` 文件中。

## 第 3 步：创建通知数据

数据类是一个实现了 `NotificationData` 协议的冻结数据类。它包含模板渲染所需的所有内容。

**文件：** `templates/<your_notification>.py`（新文件）

```python
from dataclasses import dataclass
from sentry.notifications.platform.types import NotificationData, NotificationSource

@dataclass(frozen=True)
class MyNotificationData(NotificationData):
    source = NotificationSource.MY_NEW_SOURCE  # class variable, not a field
    title: str
    detail_url: str
```

规则：

- `source` 是一个**类变量**（无类型注解），而不是数据类字段
- 使用 `frozen=True` 以确保序列化安全
- 仅包含模板的 `render()` 方法所需的字段
- 避免使用 Django 模型实例；使用基本类型或简单的数据类，以支持异步序列化

> 如需查看完整示例（DataExportSuccess、DataExportFailure），请加载 `references/data-and-templates.md`。

## 第 4 步：创建通知模板

模板会将数据转换为与提供商无关的 `NotificationRenderedTemplate`。

**与第 3 步使用同一文件：** `templates/<your_notification>.py`

```python
from sentry.notifications.platform.registry import template_registry
from sentry.notifications.platform.types import (
    NotificationCategory,
    NotificationRenderedAction,
    NotificationRenderedTemplate,
    NotificationTemplate,
    ParagraphSection,
    PlainTextBlock,
)

@template_registry.register(MyNotificationData.source)
class MyNotificationTemplate(NotificationTemplate[MyNotificationData]):
    category = NotificationCategory.MY_CATEGORY
    example_data = MyNotificationData(
        title="Example title",
        detail_url="https://example.com",
    )

    def render(self, data: MyNotificationData) -> NotificationRenderedTemplate:
        return NotificationRenderedTemplate(
            subject=data.title,
            body=[
                ParagraphSection(blocks=[PlainTextBlock(text="Something happened.")])
            ],
            actions=[
                NotificationRenderedAction(label="View Details", link=data.detail_url)
            ],
        )
```

**可用类型：**

通知由**章节**和**文本块**组成。文本块可以出现在章节中（用于正文），也可以直接出现在 `subject` 和 `footer` 字段中（类型为 `list[NotificationTextBlock]`，而不是普通的 `str`）。

章节（消息的组成部分，用于 `body`）：

| 章节                | 说明                         |
| ------------------- | ---------------------------- |
| `ParagraphSection`  | 前面带有换行符的文本块。     |
| `CodeSection`       | 前面带有换行符的代码块。     |
| `BlockQuoteSection` | 以块引用形式呈现的引用文本块。 |

文本块（文本的组成部分——用于章节内部，也用于 `subject` 和 `footer`）：

| 块                | 说明                                   |
| ----------------- | -------------------------------------- |
| `PlainTextBlock`  | 未格式化文本。                         |
| `BoldTextBlock`   | 粗体文本。                             |
| `ItalicTextBlock` | 斜体文本。                             |
| `CodeTextBlock`   | 行内代码。                             |
| `LinkTextBlock`   | 包含 `text` 和 `url` 字段的超链接。    |

完整定义请参阅 `src/sentry/notifications/platform/types.py`。

**在 `templates/__init__.py` 中注册导入：**

```python
from .my_notification import MyNotificationTemplate
```

此导入是必需的，以便 `@template_registry.register` 装饰器在启动时执行（通过 `sentry/notifications/apps.py`）。

> 如需完整的已渲染模板字段参考和更多示例，请加载 `references/data-and-templates.md`。

## 第 5 步：注册灰度发布并发送

### 灰度发布注册

该平台采用分层灰度发布系统。每个通知来源必须先添加到相应的灰度发布选项中，通知才会被送达。

灰度发布选项在 `sentry-options-automator`（而非此仓库）中进行外部配置。选项键如下：

| 灰度发布阶段 | 选项键                                          |
| ------------ | ----------------------------------------------- |
| 内部测试     | `notifications.platform-rollout.internal-testing` |
| Sentry 组织  | `notifications.platform-rollout.is-sentry`        |
| 早期采用者   | `notifications.platform-rollout.early-adopter`    |
| 全面开放     | `notifications.platform-rollout.general-access`   |

每个选项都是一个 `Dict`，用于将来源字符串映射到灰度发布比例（0.0-1.0）。示例：

```python
{"my-new-source": 1.0}
```

这些选项已在 `src/sentry/options/defaults.py` 中注册（上述四个阶段均已完成注册）。

### 发送模式

```python
from sentry.notifications.platform.service import NotificationService
from sentry.notifications.platform.target import GenericNotificationTarget
from sentry.notifications.platform.types import (
    NotificationProviderKey,
    NotificationTargetResourceType,
)

data = MyNotificationData(title="Export ready", detail_url="https://...")

# Guard with rollout check
if NotificationService.has_access(organization, data.source):
    service = NotificationService(data=data)
    target = GenericNotificationTarget(
        provider_key=NotificationProviderKey.EMAIL,
        resource_type=NotificationTargetResourceType.EMAIL,
        resource_id=user.email,
    )
    service.notify_async(targets=[target])
```

> 有关目标类型、异步/同步决策和策略模式，请加载 `references/targets-and-sending.md`。

## 第 6 步：添加自定义渲染器

对于特定的提供商与类别组合，自定义渲染器会绕过默认的模板到可渲染对象转换。当默认的基于节/块的渲染方式限制过多时使用（例如，交互式 Slack 按钮、富卡片布局）。

**适用场景：**

- 通知需要提供商特定的交互元素（带有操作 ID 的按钮、富文本块）
- 渲染后的输出结构与主题 + 正文 + 操作存在显著差异
- 需要在同一提供商中以不同方式渲染不同的数据类型

**工作原理：** 在提供商上重写 `get_renderer()`，为相关类别返回自定义渲染器类：

```python
# In the provider class
@classmethod
def get_renderer(
    cls, *, data: NotificationData, category: NotificationCategory
) -> type[NotificationRenderer[MyRenderable]]:
    if category == NotificationCategory.MY_CATEGORY:
        return MyCustomRenderer
    return cls.default_renderer
```

**文件位置：** `{provider}/renderers/{name}.py`（例如 `slack/renderers/seer.py`）

> 有关架构细节和完整的 Seer Slack 渲染器示例，请加载 `references/custom-renderers.md`。

## 第 7 步：添加新的提供商

添加新的提供商需要实现 `NotificationProvider` 协议和默认的 `NotificationRenderer`，并注册二者。仅应在接入新的集成提供商时执行此操作。

概要步骤：

1. 创建包含提供商和默认渲染器类的 `{provider_name}/provider.py`
2. 使用 `@provider_registry.register(NotificationProviderKey.MY_PROVIDER)` 注册
3. 将 `NotificationProviderKey.MY_PROVIDER` 添加到 `types.py` 中的 `NotificationProviderKey` 枚举
4. 在 `sentry/notifications/apps.py` 中导入提供商
5. 在 `is_available()` 中使用功能标志控制可用性

> 有关完整的提供商脚手架和协议要求，请加载 `references/provider-template.md`。

## 第 8 步：测试

测试目录：`tests/sentry/notifications/platform/`

### 模板测试

```python
class TestMyNotificationTemplate:
    def test_render(self):
        data = MyNotificationData(title="Test", detail_url="https://example.com")
        template = MyNotificationTemplate()
        rendered = template.render(data)

        assert rendered.subject == "Test"
        assert len(rendered.body) == 1
        assert len(rendered.actions) == 1
        assert rendered.actions[0].link == "https://example.com"

    def test_render_example(self):
        template = MyNotificationTemplate()
        rendered = template.render_example()
        assert rendered.subject  # Verify example_data produces valid output
```

### 服务集成测试

```python
from unittest.mock import patch
from sentry.notifications.platform.service import NotificationService

class TestMyNotificationService:
    @patch("sentry.notifications.platform.email.provider.EmailNotificationProvider.send")
    def test_notify_target(self, mock_send):
        data = MyNotificationData(title="Test", detail_url="https://example.com")
        service = NotificationService(data=data)
        target = GenericNotificationTarget(
            provider_key=NotificationProviderKey.EMAIL,
            resource_type=NotificationTargetResourceType.EMAIL,
            resource_id="user@example.com",
        )
        service.notify_target(target=target)
        assert mock_send.called
```

### 自定义渲染器测试

如果添加了自定义渲染器，请测试提供方是否会分派给它：

```python
def test_get_renderer_returns_custom():
    data = MySpecialData(source=NotificationSource.MY_SOURCE, ...)
    renderer = MyProvider.get_renderer(data=data, category=NotificationCategory.MY_CATEGORY)
    assert renderer is MyCustomRenderer
```

## 第 9 步：验证

提交前检查清单：

- [ ] 已将 `NotificationSource` 枚举值添加到 `types.py`
- [ ] 已将来源添加到正确类别下的 `NOTIFICATION_SOURCE_MAP`
- [ ] 数据类使用 `@dataclass(frozen=True)`，并将 `source` 作为类变量
- [ ] 模板已使用 `@template_registry.register(DataClass.source)` 注册
- [ ] 模板已导入 `templates/__init__.py`
- [ ] 模板上的 `example_data` 可通过 `render_example()` 生成有效输出
- [ ] 已配置灰度发布选项值（或已为 `sentry-options-automator` 创建工单）
- [ ] 发送代码已使用 `NotificationService.has_access()` 进行保护
- [ ] 测试通过：`pytest -svv --reuse-db tests/sentry/notifications/platform/`
- [ ] 所有修改过的文件均通过预提交检查