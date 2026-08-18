---
name: django-storages-s3
description: "Use when configuring Django to store static and media files on AWS S3 with django-storages. Invoke when working with the STORAGES setting, S3 buckets, presigned URLs, CloudFront, or boto3-backed file storage in settings.py. Configures the Django 4.2+ STORAGES dict, public/private custom backends, presigned GET/POST URLs, IAM policies, and S3 mocking for tests. Trigger terms: django-storages, S3, boto3, S3Boto3Storage, STORAGES, presigned URL, CloudFront, media files, collectstatic, AWS_STORAGE_BUCKET_NAME."
license: MIT
metadata:
  author: https://github.com/awais786
  version: "1.0.0"
  domain: backend
  triggers: django-storages, S3, boto3, S3Boto3Storage, STORAGES, presigned URL, CloudFront, media files, collectstatic
  role: specialist
  scope: implementation
  output-format: code
  related-skills: django-expert
---
# Django Storages S3

使用 `django-storages` 和 `boto3` 在 AWS S3 上实现生产级文件存储的资深 Django 专家——支持公开和私有媒体文件、静态文件、预签名 URL 以及 CloudFront。

## 适用场景

- 将静态文件和/或媒体文件从本地文件系统迁移到 AWS S3
- 配置 Django 4.2+ 的 `STORAGES` 字典或旧版 `DEFAULT_FILE_STORAGE`
- 分离公开文件（通过 CDN 提供服务）和私有文件（通过预签名 URL 访问）的存储后端
- 生成预签名下载 URL 或由浏览器直接上传到 S3 的 URL
- 使用 CloudFront 作为 S3 的前置服务，并编写遵循最小权限原则的 IAM policy
- 在不修改代码的情况下，将本地 `FileField`/`ImageField` 存储迁移到 S3
- 在不访问 S3 的情况下测试存储代码

## 核心工作流

1. **安装并注册** — `pip install django-storages[s3] boto3`；将 `"storages"` 添加到 `INSTALLED_APPS`
2. **配置凭证** — 从环境变量加载，或依赖附加的 IAM role；绝不要硬编码
3. **接入 `STORAGES` 字典** — 为 `default`（媒体文件）和 `staticfiles` 后端设置不同的 `location` 前缀
4. **添加命名后端** — 在需要时添加额外的 `STORAGES` 条目，以拆分公开和私有的 bucket/ACL
5. **验证并测试** — 运行 `collectstatic`，确认上传文件已写入 S3，并在测试中使用 `InMemoryStorage` 或 `moto` 模拟 S3

## 参考指南

根据上下文加载详细指导：

| 主题 | 参考文档 | 加载时机 |
|-------|-----------|-----------|
| Settings 与 STORAGES | `references/configuration.md` | 核心设置、4.2+ 与旧版配置、CloudFront |
| 自定义后端 | `references/custom-backends.md` | 公开与私有 bucket、按字段配置存储 |
| 预签名 URL | `references/presigned-urls.md` | 下载链接、由浏览器直接上传 |
| 测试与 IAM | `references/testing-storages.md` | 模拟 S3、IAM policy、常见问题 |

## 最小可用示例

下面的代码片段演示了核心的必须遵守的约束：从环境变量加载凭证、使用 `STORAGES` 字典、分别设置媒体文件和静态文件的位置，以及在媒体后端中设置 `default_acl=None`。

```python
# settings.py
import os

AWS_STORAGE_BUCKET_NAME = os.environ["AWS_STORAGE_BUCKET_NAME"]
AWS_S3_REGION_NAME = os.environ.get("AWS_S3_REGION_NAME", "us-east-1")
AWS_S3_CUSTOM_DOMAIN = f"{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.amazonaws.com"
# On EC2/ECS/Lambda, omit keys entirely — boto3 uses the attached IAM role.

STORAGES = {
    "default": {  # media uploads
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        "OPTIONS": {
            "bucket_name": AWS_STORAGE_BUCKET_NAME,
            "location": "media",
            "default_acl": None,        # rely on bucket policy, not per-object ACLs
            "file_overwrite": False,
            "querystring_auth": False,  # public objects → clean URLs
        },
    },
    "staticfiles": {
        "BACKEND": "storages.backends.s3boto3.S3StaticStorage",
        "OPTIONS": {
            "bucket_name": AWS_STORAGE_BUCKET_NAME,
            "location": "static",
        },
    },
}

MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/media/"
STATIC_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/static/"
```

```python
# models.py — uploads go straight to S3 on save()
from django.db import models

class Document(models.Model):
    file = models.FileField(upload_to="docs/")  # uses STORAGES["default"]
```

## 审查现有配置

审查已经使用 S3 的项目时（而不是从零开始构建的项目），请按以下清单逐项检查——每一项都是将下面的约束改写为“查找 X，确认 Y”：

1. **凭证** — `grep -rn "AWS_SECRET_ACCESS_KEY\|aws_secret" settings/` → 确认值来自 `os.environ`/`django-environ` 或 IAM 角色，绝不能是提交到代码仓库中的字面量。
2. **ACL** — `grep -rn "default_acl\|AWS_DEFAULT_ACL" .` → 对于 2023 年 4 月之后创建的存储桶，每个值都必须是 `None`。任何 `"public-read"`/`"private"` 都会引发 `AccessControlListNotSupported`；公共访问应通过存储桶策略控制。
3. **存储后端** — 确认 Django 4.2+ 使用 `STORAGES` 字典，而不是 `DEFAULT_FILE_STORAGE`/`STATICFILES_STORAGE`（它们已在 Django 5.1 中移除，因此在 5.1/5.2/6.0 中会被静默忽略）；确认静态文件类是 `S3StaticStorage`，而不是虚构的名称。
4. **位置** — 确认 `default`（媒体文件）和 `staticfiles` 使用不同的 `location` 前缀或不同的存储桶，以确保 `collectstatic` 不会与上传文件发生冲突。
5. **区域** — 确认 `region_name`（或全局的 `AWS_S3_REGION_NAME`）与存储桶的实际区域一致，并且对于非 `us-east-1` 存储桶，`AWS_S3_CUSTOM_DOMAIN` 包含区域部分。
6. **预签名** — 对于私有后端，确认 `querystring_auth=True` **并且** `custom_domain=None`；确认预签名的 `.url()` 结果不会缓存超过 `AWS_QUERYSTRING_EXPIRE`。
7. **覆盖清理** — 当 `file_overwrite=False` 时，确认已显式删除被替换的文件（否则已被替代的对象会泄漏）。
8. **IAM** — 确认策略仅授予存储桶 ARN 上的 `Get/Put/Delete/ListBucket` 权限，而不是更广泛的 S3 访问权限。

## 约束

### 必须执行
- 从环境变量或附加的 IAM 角色中加载 AWS 凭证
- 设置 `default_acl=None`，使存储桶策略（而不是对象 ACL）控制访问权限
- 为静态文件和媒体文件提供不同的 `location` 前缀或使用不同的存储桶
- 在 Django 4.2+ 中使用 `STORAGES` 字典（在 5.2 LTS 和 6.0 中使用相同配置）；`DEFAULT_FILE_STORAGE`/`STATICFILES_STORAGE` 已在 5.1 中移除，因此仅限 < 4.2 使用
- 在任何会发出预签名 URL 的后端上设置 `custom_domain=None`
- 在测试中使用模拟的 S3（`InMemoryStorage` 或 `moto`），而不是访问真实存储桶

### 禁止执行
- 在 `settings.py` 中硬编码 `AWS_SECRET_ACCESS_KEY`，或将其提交到代码仓库
- 将 `querystring_auth=True` 与 `custom_domain` 混用（预签名会失效）
- 将静态文件和媒体文件混在同一个前缀下
- 向 IAM 用户授予超出存储桶 ARN 上 `Get/Put/Delete/ListBucket` 的权限
- 依赖 2023 年 4 月之后创建的存储桶上的单对象 ACL（ACL 默认已禁用）

## 知识参考

django-storages、S3Boto3Storage、S3StaticStorage、boto3、STORAGES 字典、预签名 URL、generate_presigned_post、CloudFront、IAM policy、InMemoryStorage、moto

## 相关 Skills

- `django-expert` — 核心 Django 模型、DRF 和 ORM，用于生成本 Skill 持久化到 S3 的文件
- `fullstack-guardian` — 围绕已存储文件的安全端到端上传流程和访问控制
- `devops-engineer` — 为本 Skill 面向的 S3 存储桶、IAM 角色和 CloudFront 分发配置资源

[文档](https://jeffallan.github.io/claude-skills/skills/backend/django-storages-s3/)