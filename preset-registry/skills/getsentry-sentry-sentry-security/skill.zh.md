---
name: sentry-security
description: 'Sentry-specific security review based on real vulnerability history. Use when reviewing Sentry endpoints, serializers, or views for security issues. Trigger keywords: "sentry security review", "check for IDOR", "access control review", "org scoping", "cross-org", "security audit endpoint".'
allowed-tools: Read Grep Glob Bash
---
# Sentry 安全审查

通过检查曾在该代码库中造成真实漏洞的模式，查找 Sentry 代码中的安全漏洞。

此技能专用于 Sentry。它编码了过去一年中发布的 37 个真实安全补丁所涉及的模式，而非通用的 OWASP 理论。

## 范围

审查用户提供的代码（文件、差异或端点）。根据需要研究代码库，在报告问题前建立足够的信心。

仅报告置信度为 **高** 和 **中** 的发现。不要报告理论上的问题。

| 置信度 | 标准                                 | 操作                   |
| ------ | ------------------------------------ | ---------------------- |
| **高** | 已追踪完整流程，并确认不存在检查     | 报告并提供修复方案     |
| **中** | 检查可能存在，但无法确认             | 报告为需要验证         |
| **低** | 理论问题或已在其他位置得到缓解       | 不要报告               |

## 第 1 步：对代码进行分类

确定正在审查的代码类型，并加载相关参考资料。

| 代码类型                                 | 加载参考资料                         |
| ---------------------------------------- | ------------------------------------ |
| API 端点（继承自 `*Endpoint`）           | `references/endpoint-patterns.md`    |
| 序列化器或表单字段                       | `references/serializer-patterns.md`  |
| 电子邮件模板或 HTML 渲染                 | `references/output-sanitization.md`  |
| 令牌、OAuth 或会话处理                   | `references/token-lifecycle.md`      |
| 角色或权限逻辑                           | `references/privilege-escalation.md` |

如果代码涉及多个类别，请加载所有相关参考资料。

**始终加载** `references/enforcement-layers.md`——该文档说明了安全检查可以合理存在于 Sentry 请求生命周期中的哪些位置。位于任何一层的检查都算作强制执行。

## 第 2 步：检查最常见的 6 类漏洞

以下类别按过去一年真实补丁中的出现频率排序。

### 检查 1：跨组织对象访问（IDOR）——过去一年有 9 个补丁

这是最常见的漏洞。端点接受请求中的 ID，但未使用 URL 中的组织限定查询范围。

**对于来自请求的每个 ID，都要追踪以下流程：**

```
1. Where does the ID enter? (query param, request body, URL kwarg)
2. Where is it used in an ORM query?
3. Between (1) and (2), is the query scoped by organization_id or project_id
   from the URL (NOT from the request body)?
```

**危险信号：**

- `Model.objects.get(id=request.data["something_id"])`——未限定组织范围
- `Model.objects.filter(id=request.GET["id"])`——未限定组织范围
- 直接使用请求体或查询参数中的 `project_id`，而未通过 `Project.objects.filter(id=pid, organization_id=organization.id)` 进行校验
- 端点继承自 `OrganizationEndpoint`，但处理程序方法不接受或不使用 `organization` 参数

**安全模式：**

- 查询包含 `organization_id=organization.id`，其中 `organization` 来自 `convert_args()`
- 使用 `self.get_projects()`，其内部会按组织限定范围
- 对象通过由 `convert_args()` 解析的 URL kwargs 获取
- 未限定范围的查询仅作为保护性检查并只会抛出错误（绝不返回数据），**并且**
  同一流程中的下游查询已限定组织范围且会抛出相同错误——
  不存在差异化行为意味着不会泄露信息

### 检查 2：缺少授权检查——去年有 10 个补丁

端点或序列化器在未验证用户是否有权限的情况下执行敏感操作。

**检查：**

- 端点是否继承了正确的基类？（`OrganizationEndpoint`、`ProjectEndpoint` 等）
- 是否声明了 `permission_classes`？如果没有，它将继承基类的默认值——请验证该默认值是否适用。
- 对于引用其他对象的序列化器字段：是否验证了用户可以访问这些对象？
- 对于 Django 视图（非 DRF）：是否有 `@login_required` 或等效机制？

### 检查 3：权限提升/角色滥用——去年有 3 个补丁

用户可以分配所有权、修改角色，或将访问权限提升到其角色允许的范围之外。

**检查：**

- 所有者/受理人字段：使用 `OwnerActorField`（验证成员身份），而不是 `ActorField`（允许任何参与者）
- 角色修改端点：验证发起请求的用户角色是否 >= 目标角色
- 团队分配：验证用户是否为目标团队的成员（或拥有 `team:admin`）

### 检查 4：令牌/会话安全——去年有 5 个补丁

令牌生命周期中存在可能导致未经授权访问的漏洞。

**检查：**

- 令牌刷新：在允许刷新之前，是否检查了应用程序的活跃状态？
- 组织级令牌：是否要求提供并验证 `organization_id`？
- 成员状态：在授予令牌之前，是否检查了成员的启用/禁用状态？
- 用户模拟：模拟用户的会话是否受到速率限制？

### 检查 5：输出净化（XSS/HTML 注入）——去年有 4 个补丁

用户可控字符串在电子邮件、Markdown 或 HTML 中以不安全的方式呈现。

**检查：**

- 电子邮件模板中使用的用户显示名称、团队名称和组织名称：是否经过净化？
- Markdown 渲染：是否允许传入自定义 CSS 或 HTML？
- 模板中使用 `format_html()` 还是字符串拼接
- 是否对用户输入调用了 `mark_safe()`

### 检查 6：身份验证/MFA 缺陷——去年有 3 个补丁

身份验证状态不一致。

**检查：**

- 移除身份验证器时：是否清理了恢复代码？
- CSRF 令牌处理：是否在不同标签页/窗口之间同步？
- 会话失效：移除身份验证因素时，是否会使相关会话正确失效？

**如果所有检查均未发现潜在问题，请停止并报告零项发现。不要为了填充报告而凭空捏造问题。当代码中不存在符合这些模式的漏洞时，空结果才是正确的输出。**

## 步骤 3：追踪完整的强制执行链

对于每一项潜在发现，端到端追踪**完整的**请求流程。不要止步于身份验证类——继续追踪到端点处理程序，然后深入到它委托的所有业务逻辑类（例如 `Validator`、`Refresher`、`GrantExchanger`）。

```
1. Authentication class   → does authenticate() or authenticate_token() enforce the check?
2. Permission class       → does has_permission() enforce it?
3. convert_args()         → does has_object_permission() / determine_access() enforce it?
4. Access module          → does from_rpc_auth() or from_request() enforce it?
5. Handler method         → does the endpoint handler enforce it?
6. Business logic classes → do downstream classes (Validator, etc.) enforce it?
7. Serializer             → do validate_*() methods enforce it?
```

**任何一层存在检查都属于强制执行。** 在标记为 HIGH 之前，请使用 `enforcement-layers.md` 中的检查清单确认所有层都不存在该检查。

如果无法确认每一层都不存在该检查，请将该发现标记为 **MEDIUM**（需要验证），而不是 HIGH。

**令牌签发的跨流程执行：** 对于令牌/凭证签发流程，还应检查所签发的凭证是否在**使用时**被阻止（例如，`determine_access()` 在相关范围内的所有端点都拒绝该凭证）。根据执行范围进行分类：

- **集中式执行**（检查在受影响范围内所有端点继承的权限类中运行）→ 该凭证实际上无法生效 → **LOW**（不报告）
- **分散式执行**（仅部分端点或序列化器执行检查，其他位置可能不检查）→ **MEDIUM**（报告为需要验证）

请参阅 `enforcement-layers.md` 中的“跨流程执行”。

**非 DRF 视图：** OAuth 视图是普通 Django 视图——7 层 DRF 模型不适用于视图本身。请检查视图自身的装饰器和处理程序逻辑。但这些视图签发的令牌之后会在 DRF 端点使用，而完整的执行链适用于这些端点。

## 第 4 步：报告发现

````markdown
## Sentry Security Review: [Component]

### Findings

#### [SENTRY-001] [Title] (Severity: Critical/High/Medium)

- **Category**: [IDOR | Missing Auth | Privilege Escalation | Token | XSS | Auth/MFA]
- **Location**: `path/to/file.py:123`
- **Confidence**: HIGH — confirmed through code tracing
- **Issue**: [What the vulnerability is]
- **Trace**:
  1. [Step-by-step trace showing how the vulnerability is reached]
- **Impact**: [What an attacker could do]
- **Fix**:
  ```python
  [Code that fixes the issue — must enforce, not document]
  ```
````

- **先例**：[类似的过往修复（如适用），例如“类似于 #104990 PromptsActivity IDOR”]

### 需要验证

[MEDIUM 置信度项目，并说明需要验证的内容]

### 未审查

[本次审查范围之外的区域]

```

Fix suggestions must include actual enforcement code. Never suggest a comment or docstring as a fix.
```