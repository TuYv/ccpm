---
name: django-access-review
description: 'Django access control and IDOR security review. Use when reviewing Django views, DRF viewsets, ORM queries, or any Python/Django code handling user authorization. Trigger keywords: "IDOR", "access control", "authorization", "Django permissions", "object permissions", "tenant isolation", "broken access".'
allowed-tools: Read, Grep, Glob, Bash, Task
license: LICENSE
---
<!--
参考资料基于 OWASP Cheat Sheet Series（CC BY-SA 4.0）
https://cheatsheetseries.owasp.org/
-->

# Django 访问控制与 IDOR 审查

通过调查代码库如何回答以下问题来发现访问控制漏洞：

**用户 A 能否访问、修改或删除用户 B 的数据？**

## 理念：调查优先于模式匹配

不要扫描预定义的漏洞模式。相反，应当：

1. **理解**此代码库中的授权机制如何运作
2. 针对具体的数据流**提出问题**
3. **追踪代码**，找出访问检查发生在何处（或是否发生）
4. 仅**报告**经调查确认的问题

每个代码库实现授权的方式都不同。你的任务是理解这个特定实现，然后找出其中的缺口。

---

## 阶段 1：理解授权模型

在查找漏洞之前，先回答以下有关代码库的问题：

### 授权是如何实施的？

研究代码库，找出：

```
□ Where are permission checks implemented?
  - Decorators? (@login_required, @permission_required, custom?)
  - Middleware? (TenantMiddleware, AuthorizationMiddleware?)
  - Base classes? (BaseAPIView, TenantScopedViewSet?)
  - Permission classes? (DRF permission_classes?)
  - Custom mixins? (OwnershipMixin, TenantMixin?)

□ How are queries scoped?
  - Custom managers? (TenantManager, UserScopedManager?)
  - get_queryset() overrides?
  - Middleware that sets query context?

□ What's the ownership model?
  - Single user ownership? (document.owner_id)
  - Organization/tenant ownership? (document.organization_id)
  - Hierarchical? (org -> team -> user -> resource)
  - Role-based within context? (org admin vs member)
```

### 调查命令

```bash
# Find how auth is typically done
grep -rn "permission_classes\|@login_required\|@permission_required" --include="*.py" | head -20

# Find base classes that views inherit from
grep -rn "class Base.*View\|class.*Mixin.*:" --include="*.py" | head -20

# Find custom managers
grep -rn "class.*Manager\|def get_queryset" --include="*.py" | head -20

# Find ownership fields on models
grep -rn "owner\|user_id\|organization\|tenant" --include="models.py" | head -30
```

**在理解授权模型之前，请勿继续。**

---

## 阶段 2：梳理攻击面

识别处理用户特定数据的端点：

### 存在哪些资源？

```
□ What models contain user data?
□ Which have ownership fields (owner_id, user_id, organization_id)?
□ Which are accessed via ID in URLs or request bodies?
```

### 暴露了哪些操作？

对于每种资源，梳理：
- 列表端点——返回哪些数据？
- 详情/检索端点——如何获取对象？
- 创建端点——由谁设置所有者？
- 更新端点——用户能否修改他人的数据？
- 删除端点——用户能否删除他人的数据？
- 自定义操作——它们访问什么？

---

## 阶段 3：提出问题并进行调查

对于每个处理用户数据的端点，提出以下问题：

### 核心问题

**“如果我是用户 A，并且知道用户 B 的资源 ID，我能访问该资源吗？”**

跟踪代码以回答此问题：

```
1. Where does the resource ID enter the system?
   - URL path: /api/documents/{id}/
   - Query param: ?document_id=123
   - Request body: {"document_id": 123}

2. Where is that ID used to fetch data?
   - Find the ORM query or database call

3. Between (1) and (2), what checks exist?
   - Is the query scoped to current user?
   - Is there an explicit ownership check?
   - Is there a permission check on the object?
   - Does a base class or mixin enforce access?

4. If you can't find a check, is there one you missed?
   - Check parent classes
   - Check middleware
   - Check managers
   - Check decorators at URL level
```

### 后续问题

```
□ For list endpoints: Does the query filter to user's data, or return everything?

□ For create endpoints: Who sets the owner - the server or the request?

□ For bulk operations: Are they scoped to user's data?

□ For related resources: If I can access a document, can I access its comments?
  What if the document belongs to someone else?

□ For tenant/org resources: Can User in Org A access Org B's data by changing
  the org_id in the URL?
```

---

## 阶段 4：跟踪具体流程

选择一个具体端点并完整跟踪其流程。

### 调查示例

```
Endpoint: GET /api/documents/{pk}/

1. Find the view handling this URL
   → DocumentViewSet.retrieve() in api/views.py

2. Check what DocumentViewSet inherits from
   → class DocumentViewSet(viewsets.ModelViewSet)
   → No custom base class with authorization

3. Check permission_classes
   → permission_classes = [IsAuthenticated]
   → Only checks login, not ownership

4. Check get_queryset()
   → def get_queryset(self):
   →     return Document.objects.all()
   → Returns ALL documents!

5. Check for has_object_permission()
   → Not implemented

6. Check retrieve() method
   → Uses default, which calls get_object()
   → get_object() uses get_queryset(), which returns all

7. Conclusion: IDOR - Any authenticated user can access any document
```

### 跟踪时需要查找的内容

```
Potential gap indicators (investigate further, don't auto-flag):
- get_queryset() returns .all() or filters without user
- Direct Model.objects.get(pk=pk) without ownership in query
- ID comes from request body for sensitive operations
- Permission class checks auth but not ownership
- No has_object_permission() and queryset isn't scoped

Likely safe patterns (but verify the implementation):
- get_queryset() filters by request.user or user's org
- Custom permission class with has_object_permission()
- Base class that enforces scoping
- Manager that auto-filters
```

---

## 阶段 5：报告发现

仅报告已通过调查确认的问题。

### 置信度级别

| 级别 | 含义 | 操作 |
|-------|---------|--------|
| **高** | 已跟踪流程，并确认不存在检查 | 提供证据并报告 |
| **中** | 可能存在检查，但无法确认 | 标注为需要人工验证 |
| **低** | 理论上存在，但很可能已被缓解 | 不要报告 |

### 建议的修复措施必须强制执行，而非仅作文档说明

**错误的修复**：添加一条注释，说明“调用方必须验证权限”
**正确的修复**：添加实际验证权限的代码

注释或文档字符串无法强制执行授权。你建议的修复措施必须包含实际代码，以实现以下要求：
- 在继续执行之前验证用户具有相应权限
- 如果用户未经授权，则抛出异常或返回错误
- 使未经授权的访问无法发生，而不只是劝阻此类访问

错误修复建议的示例：
```python
def get_resource(resource_id):
    # IMPORTANT: Caller must ensure user has access to this resource
    return Resource.objects.get(pk=resource_id)
```

正确修复建议的示例：
```python
def get_resource(resource_id, user):
    resource = Resource.objects.get(pk=resource_id)
    if resource.owner_id != user.id:
        raise PermissionDenied("Access denied")
    return resource
```

如果你无法确定正确的强制执行机制，请如实说明，但绝不能建议将编写文档作为修复措施。

### 报告格式

```markdown
## Access Control Review: [Component]

### Authorization Model
[Brief description of how this codebase handles authorization]

### Findings

#### [IDOR-001] [Title] (Severity: High/Medium)
- **Location**: `path/to/file.py:123`
- **Confidence**: High - confirmed through code tracing
- **The Question**: Can User A access User B's documents?
- **Investigation**:
  1. Traced GET /api/documents/{pk}/ to DocumentViewSet
  2. Checked get_queryset() - returns Document.objects.all()
  3. Checked permission_classes - only IsAuthenticated
  4. Checked for has_object_permission() - not implemented
  5. Verified no relevant middleware or base class checks
- **Evidence**: [Code snippet showing the gap]
- **Impact**: Any authenticated user can read any document by ID
- **Suggested Fix**: [Code that enforces authorization - NOT a comment]

### Needs Manual Verification
[Issues where authorization exists but couldn't confirm effectiveness]

### Areas Not Reviewed
[Endpoints or flows not covered in this review]
```

---

## 常见的 Django 授权模式

以下是你可能会发现的模式，而不是需要逐项匹配的检查清单。

### 查询范围限定
```python
# Scoped to user
Document.objects.filter(owner=request.user)

# Scoped to organization
Document.objects.filter(organization=request.user.organization)

# Using a custom manager
Document.objects.for_user(request.user)  # Investigate what this does
```

### 权限强制执行
```python
# DRF permission classes
permission_classes = [IsAuthenticated, IsOwner]

# Custom has_object_permission
def has_object_permission(self, request, view, obj):
    return obj.owner == request.user

# Django decorators
@permission_required('app.view_document')

# Manual checks
if document.owner != request.user:
    raise PermissionDenied()
```

### 所有权分配
```python
# Server-side (safe)
def perform_create(self, serializer):
    serializer.save(owner=self.request.user)

# From request (investigate)
serializer.save(**request.data)  # Does request.data include owner?
```

---

## 调查清单

使用此清单指导你的审查，而不要将其作为通过/不通过的检查清单：

```
□ I understand how authorization is typically implemented in this codebase
□ I've identified the ownership model (user, org, tenant, etc.)
□ I've mapped the key endpoints that handle user data
□ For each sensitive endpoint, I've traced the flow and asked:
  - Where does the ID come from?
  - Where is data fetched?
  - What checks exist between input and data access?
□ I've verified my findings by checking parent classes and middleware
□ I've only reported issues I've confirmed through investigation
```