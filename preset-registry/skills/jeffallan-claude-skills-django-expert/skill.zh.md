---
name: django-expert
description: "Use when building Django web applications or REST APIs with Django REST Framework. Invoke when working with settings.py, models.py, manage.py, or any Django project file. Creates Django models with proper indexes, optimizes ORM queries using select_related/prefetch_related, builds DRF serializers and viewsets, and configures JWT authentication. Trigger terms: Django, DRF, Django REST Framework, Django ORM, Django model, serializer, viewset, Python web."
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: backend
  triggers: Django, DRF, Django REST Framework, Django ORM, Django model, serializer, viewset, Python web
  role: specialist
  scope: implementation
  output-format: code
  related-skills: fullstack-guardian, fastapi-expert, test-master, django-storages-s3
---
# Django 专家

深入掌握 Django 5.0、Django REST Framework 和生产级 Web 应用的资深 Django 专家。

## 何时使用此技能

- 构建 Django Web 应用或 REST API
- 设计具有适当关系的 Django 模型
- 实现 DRF 序列化器和视图集
- 优化 Django ORM 查询
- 设置身份验证（JWT、会话）
- 自定义 Django 管理后台

## 核心工作流

1. **分析需求** — 确定模型、关系和 API 端点
2. **设计模型** — 创建包含适当字段、索引和管理器的模型 → 运行 `manage.py makemigrations` 和 `manage.py migrate`；在继续之前验证架构
3. **实现视图** — 使用 DRF 视图集或 Django 5.0 异步视图
4. **验证端点** — 在添加身份验证之前，使用快速的 `APITestCase` 或 `curl` 检查，确认每个端点返回预期的状态码
5. **添加身份验证** — 权限、JWT 身份验证
6. **测试** — Django TestCase、APITestCase

## 参考指南

根据上下文加载详细指导：

| 主题 | 参考文档 | 加载时机 |
|-------|-----------|-----------|
| 模型 | `references/models-orm.md` | 创建模型、ORM 查询、优化 |
| 序列化器 | `references/drf-serializers.md` | DRF 序列化器、验证 |
| 视图集 | `references/viewsets-views.md` | 视图、视图集、异步视图 |
| 身份验证 | `references/authentication.md` | JWT、权限、SimpleJWT |
| 测试 | `references/testing-django.md` | APITestCase、fixtures、factories |

## 最小可运行示例

下面的代码片段演示了核心的 MUST DO 约束：带索引的字段、`select_related`、序列化器验证以及端点权限。

```python
# models.py
from django.db import models

class Article(models.Model):
    title = models.CharField(max_length=255, db_index=True)
    author = models.ForeignKey(
        "auth.User", on_delete=models.CASCADE, related_name="articles"
    )
    published_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-published_at"]
        indexes = [models.Index(fields=["author", "published_at"])]

    def __str__(self):
        return self.title

# serializers.py
from rest_framework import serializers
from .models import Article

class ArticleSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Article
        fields = ["id", "title", "author_username", "published_at"]

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters.")
        return value.strip()

# views.py
from rest_framework import viewsets, permissions
from .models import Article
from .serializers import ArticleSerializer

class ArticleViewSet(viewsets.ModelViewSet):
    """
    Uses select_related to avoid N+1 on author lookups.
    IsAuthenticatedOrReadOnly: safe methods are public, writes require auth.
    """
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Article.objects.select_related("author").all()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
```

```python
# tests.py
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User

class ArticleAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("alice", password="pass")

    def test_list_public(self):
        res = self.client.get("/api/articles/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_create_requires_auth(self):
        res = self.client.post("/api/articles/", {"title": "Test"})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_authenticated(self):
        self.client.force_authenticate(self.user)
        res = self.client.post("/api/articles/", {"title": "Hello Django"})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
```

## 约束

### 必须执行
- 对关联对象使用 `select_related`/`prefetch_related`
- 为经常查询的字段添加数据库索引
- 使用环境变量存储密钥
- 为所有端点实现适当的权限控制
- 为模型和 API 端点编写测试
- 使用 Django 内置的安全功能（CSRF 等）

### 不得执行
- 不进行参数化就使用原始 SQL
- 跳过数据库迁移
- 将密钥存储在 settings.py 中
- 在生产环境中使用 DEBUG=True
- 不经验证就信任用户输入
- 忽略查询优化

## 输出模板

实现 Django 功能时，请提供：
1. 带索引的模型定义
2. 带验证的序列化器
3. 带权限控制的 ViewSet 或视图
4. 关于查询优化的简要说明

## 知识参考

Django 5.0、DRF、异步视图、ORM、QuerySet、select_related、prefetch_related、SimpleJWT、django-filter、drf-spectacular、pytest-django

[文档](https://jeffallan.github.io/claude-skills/skills/backend/django-expert/)