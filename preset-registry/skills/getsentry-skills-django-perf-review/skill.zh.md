---
name: django-perf-review
description: Django performance code review. Use when asked to "review Django performance", "find N+1 queries", "optimize Django", "check queryset performance", "database performance", "Django ORM issues", or audit Django code for performance problems.
allowed-tools: Read, Grep, Glob, Bash, Task
license: LICENSE
---
# Django 性能审查

审查 Django 代码中**经过验证的**性能问题。在报告问题之前，先研究代码库并加以确认。只报告你能够证实的问题。

## 审查方法

1. **先研究** - 追踪数据流，检查现有优化，核实数据量
2. **报告前验证** - 模式匹配不等于验证
3. **没有发现问题也可以** - 不要为了显得审查全面而捏造问题
4. **严重程度必须与影响相符** - 如果你发现自己在一个 CRITICAL 问题中使用了“轻微”一词，那它就不是严重问题。降低其等级或跳过它。

## 影响类别

问题按影响分类。重点关注 CRITICAL 和 HIGH——这些问题在规模扩大时会造成实际影响。

| 优先级 | 类别 | 影响 |
|----------|----------|--------|
| 1 | N+1 查询 | **CRITICAL** - 随数据量成倍增加，导致超时 |
| 2 | 无界查询集 | **CRITICAL** - 内存耗尽，进程因 OOM 被终止 |
| 3 | 缺少索引 | **HIGH** - 在大型数据表上进行全表扫描 |
| 4 | 写入循环 | **HIGH** - 锁争用、请求缓慢 |
| 5 | 低效模式 | **LOW** - 通常不值得报告 |

---

## 优先级 1：N+1 查询（CRITICAL）

**影响：** 每个 N+1 问题都会增加 `O(n)` 次数据库往返。100 行 = 100 次额外查询。10,000 行 = 超时。

### 规则：预取循环中访问的关联数据

通过追踪进行验证：视图 → 查询集 → 模板/序列化器 → 循环访问

```python
# PROBLEM: N+1 - each iteration queries profile
def user_list(request):
    users = User.objects.all()
    return render(request, 'users.html', {'users': users})

# Template:
# {% for user in users %}
#     {{ user.profile.bio }}  ← triggers query per user
# {% endfor %}

# SOLUTION: Prefetch in view
def user_list(request):
    users = User.objects.select_related('profile')
    return render(request, 'users.html', {'users': users})
```

### 规则：在序列化器中进行预取，而不只是在视图中

如果查询集未经过优化，DRF 序列化器访问关联字段时会导致 N+1 问题。

```python
# PROBLEM: SerializerMethodField queries per object
class UserSerializer(serializers.ModelSerializer):
    order_count = serializers.SerializerMethodField()

    def get_order_count(self, obj):
        return obj.orders.count()  # ← query per user

# SOLUTION: Annotate in viewset, access in serializer
class UserViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return User.objects.annotate(order_count=Count('orders'))

class UserSerializer(serializers.ModelSerializer):
    order_count = serializers.IntegerField(read_only=True)
```

### 规则：会执行查询的模型属性在循环中很危险

```python
# PROBLEM: Property triggers query when accessed
class User(models.Model):
    @property
    def recent_orders(self):
        return self.orders.filter(created__gte=last_week)[:5]

# Used in template loop = N+1

# SOLUTION: Use Prefetch with custom queryset, or annotate
```

### N+1 验证清单
- [ ] 已追踪从视图到模板/序列化器的数据流
- [ ] 已确认关联字段是在循环内部访问的
- [ ] 已在代码库中搜索现有的 select_related/prefetch_related
- [ ] 已确认数据表具有可观的行数（1000+）
- [ ] 已确认这是一个高频路径（不是管理后台，也不是罕见操作）

---

## 优先级 2：无界查询集（严重）

**影响：** 加载整个数据表会耗尽内存。大型数据表会导致 OOM 终止和工作进程重启。

### 规则：始终对列表端点进行分页

```python
# PROBLEM: No pagination - loads all rows
class UserListView(ListView):
    model = User
    template_name = 'users.html'

# SOLUTION: Add pagination
class UserListView(ListView):
    model = User
    template_name = 'users.html'
    paginate_by = 25
```

### 规则：使用 iterator() 处理大型批量任务

```python
# PROBLEM: Loads all objects into memory at once
for user in User.objects.all():
    process(user)

# SOLUTION: Stream with iterator()
for user in User.objects.iterator(chunk_size=1000):
    process(user)
```

### 规则：绝不要对无界查询集调用 list()

```python
# PROBLEM: Forces full evaluation into memory
all_users = list(User.objects.all())

# SOLUTION: Keep as queryset, slice if needed
users = User.objects.all()[:100]
```

### 无界查询集验证清单
- [ ] 数据表很大（1 万行以上）或将无限增长
- [ ] 没有分页类、paginate_by 或切片
- [ ] 此操作在面向用户的请求中运行（而非使用分块处理的后台任务）

---

## 优先级 3：缺少索引（高）

**影响：** 导致全表扫描。在小型数据表上影响微不足道，但在大型数据表上会造成灾难性后果。

### 规则：为大型数据表中用于 WHERE 子句的字段建立索引

```python
# PROBLEM: Filtering on unindexed field
# User.objects.filter(email=email)  # full scan if no index

class User(models.Model):
    email = models.EmailField()  # ← no db_index

# SOLUTION: Add index
class User(models.Model):
    email = models.EmailField(db_index=True)
```

### 规则：为大型数据表中用于 ORDER BY 的字段建立索引

```python
# PROBLEM: Sorting requires full scan without index
Order.objects.order_by('-created')

# SOLUTION: Index the sort field
class Order(models.Model):
    created = models.DateTimeField(db_index=True)
```

### 规则：为常见查询模式使用复合索引

```python
class Order(models.Model):
    user = models.ForeignKey(User)
    status = models.CharField(max_length=20)
    created = models.DateTimeField()

    class Meta:
        indexes = [
            models.Index(fields=['user', 'status']),  # for filter(user=x, status=y)
            models.Index(fields=['status', '-created']),  # for filter(status=x).order_by('-created')
        ]
```

### 缺少索引验证清单
- [ ] 数据表有 1 万行以上
- [ ] 字段在热点路径上的 filter() 或 order_by() 中使用
- [ ] 已检查模型——不存在 db_index=True 或 Meta.indexes 条目
- [ ] 不是外键（外键已自动建立索引）

---

## 优先级 4：写入循环（高）

**影响：** 执行 N 次数据库写入，而不是 1 次。会导致锁争用和请求缓慢。

### 规则：在循环中使用 bulk_create，而不是 create()

```python
# PROBLEM: N inserts, N round trips
for item in items:
    Model.objects.create(name=item['name'])

# SOLUTION: Single bulk insert
Model.objects.bulk_create([
    Model(name=item['name']) for item in items
])
```

### 规则：在循环中使用 update() 或 bulk_update，而不是 save()

```python
# PROBLEM: N updates
for obj in queryset:
    obj.status = 'done'
    obj.save()

# SOLUTION A: Single UPDATE statement (same value for all)
queryset.update(status='done')

# SOLUTION B: bulk_update (different values)
for obj in objects:
    obj.status = compute_status(obj)
Model.objects.bulk_update(objects, ['status'], batch_size=500)
```

### 规则：对 queryset 使用 delete()，不要在循环中调用

```python
# PROBLEM: N deletes
for obj in queryset:
    obj.delete()

# SOLUTION: Single DELETE
queryset.delete()
```

### 写入循环验证清单
- [ ] 循环遍历 100 个以上的项目（或数量无上限）
- [ ] 每次迭代都会调用 create()、save() 或 delete()
- [ ] 此代码在面向用户的请求中运行（而非一次性迁移脚本）

---

## 优先级 5：低效模式（低）

**通常不值得报告。** 仅当你已经在报告实际问题时，才将其作为次要备注列出。

### 模式：count() 与 exists()

```python
# Slightly suboptimal
if queryset.count() > 0:
    do_thing()

# Marginally better
if queryset.exists():
    do_thing()
```

**通常跳过**——在大多数情况下，差异小于 1ms。

### 模式：len(queryset) 与 count()

```python
# Fetches all rows to count
if len(queryset) > 0:  # bad if queryset not yet evaluated

# Single COUNT query
if queryset.count() > 0:
```

**仅在以下情况下标记**：queryset 很大且尚未求值。

### 模式：在小型循环中使用 get()

```python
# N queries, but if N is small (< 20), often fine
for id in ids:
    obj = Model.objects.get(id=id)
```

**仅在以下情况下标记**：循环规模较大，或此代码位于非常频繁执行的路径中。

---

## 验证要求

在报告任何问题之前：

1. **追踪数据流**——从 queryset 的创建一直跟踪到使用
2. **搜索现有优化**——使用 Grep 搜索 select_related、prefetch_related、pagination
3. **验证数据量**——检查数据表是否确实很大
4. **确认高频路径**——追踪调用位置，验证此代码是否频繁运行
5. **排除缓解措施**——检查缓存、速率限制

**如果无法验证所有步骤，请勿报告。**

---

## 输出格式

```markdown
## Django Performance Review: [File/Component Name]

### Summary
Validated issues: X (Y Critical, Z High)

### Findings

#### [PERF-001] N+1 Query in UserListView (CRITICAL)
**Location:** `views.py:45`

**Issue:** Related field `profile` accessed in template loop without prefetch.

**Validation:**
- Traced: UserListView → users queryset → user_list.html → `{{ user.profile.bio }}` in loop
- Searched codebase: no select_related('profile') found
- User table: 50k+ rows (verified in admin)
- Hot path: linked from homepage navigation

**Evidence:**
```python
def get_queryset(self):
    return User.objects.filter(active=True)  # no select_related
```

**Fix:**
```python
def get_queryset(self):
    return User.objects.filter(active=True).select_related('profile')
```
```

如果未发现问题：“审查 [files] 并验证 [what you checked] 后，未发现性能问题。”

**提交前，请对每项发现进行合理性检查：**
- 严重程度是否与实际影响相符？（“轻微低效” ≠ CRITICAL）
- 这是真正的性能问题，还是仅仅属于代码风格偏好？
- 修复后是否会带来可衡量的性能提升？

如果其中任何一个问题的答案为“否”，请移除该项发现。

---

## 不应报告的内容

- 测试文件
- 仅限管理员使用的视图
- 管理命令
- 迁移文件
- 一次性脚本
- 位于已禁用功能标志之后的代码
- 行数少于 1000 且不会增长的表
- 冷路径中的模式（很少执行的代码）
- 微优化（在没有证据的情况下比较 `exists` 与 `count`、使用 `only`/`defer`）

### 应避免的误报

**为 Queryset 赋值给变量不是问题：**
```python
# This is FINE - no performance difference
projects_qs = Project.objects.filter(org=org)
projects = list(projects_qs)

# vs this - identical performance
projects = list(Project.objects.filter(org=org))
```
Queryset 是惰性求值的。将其赋值给变量不会执行任何操作。

**单次查询模式不是 N+1：**
```python
# This is ONE query, not N+1
projects = list(Project.objects.filter(org=org))
```
N+1 必须存在一个会触发额外查询的循环。单次调用 `list()` 没有问题。

**获取单个对象时缺少 select_related 并不属于 N+1：**
```python
# This is 2 queries, not N+1 - report as LOW at most
state = AutofixState.objects.filter(pr_id=pr_id).first()
project_id = state.request.project_id  # second query
```
N+1 必须存在循环。单个对象执行 2 次查询而非 1 次，如果确实相关，最多可以报告为 LOW，但绝不能报告为 CRITICAL/HIGH。

**代码风格偏好不是性能问题：**
如果你的唯一建议是“合并这两行”或“重命名这个变量”，那属于代码风格问题，而不是性能问题。不要报告。