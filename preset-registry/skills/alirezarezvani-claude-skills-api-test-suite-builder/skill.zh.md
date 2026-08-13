---
name: "api-test-suite-builder"
description: "Use when the user asks to generate API tests, create integration test suites, test REST endpoints, or build contract tests."
---
# API 测试套件构建器

**层级：** 强大
**类别：** 工程
**领域：** 测试 / API 质量

---

## 概述

扫描多种框架（Next.js App Router、Express、FastAPI、Django REST）中的 API 路由定义，并
自动生成全面的测试套件，涵盖身份验证、输入验证、错误代码、分页、文件
上传和速率限制。输出可直接运行的 Vitest+Supertest（Node）或 Pytest+httpx
（Python）测试文件。

---

## 核心能力

- **路由检测** — 扫描源文件以提取所有 API 端点
- **身份验证覆盖** — 有效/无效/过期令牌，以及缺少身份验证请求头的情况
- **输入验证** — 缺少字段、类型错误、边界值、注入尝试
- **错误代码矩阵** — 针对每条路由测试 400/401/403/404/422/500
- **分页** — 第一页/最后一页/空页面/超大页面
- **文件上传** — 有效文件、超大文件、错误的 MIME 类型、空文件
- **速率限制** — 突发请求检测、每用户限制与全局限制

---

## 适用场景

- 新增 API — 在编写实现之前生成测试脚手架（TDD）
- 没有测试的旧版 API — 扫描并生成基准测试覆盖
- API 契约审查 — 验证现有测试是否与当前路由定义一致
- 发布前回归检查 — 确保所有路由至少具有冒烟测试
- 安全审计准备 — 生成对抗性输入测试

---

## 路由检测

### Next.js App Router
```bash
# Find all route handlers
find ./app/api -name "route.ts" -o -name "route.js" | sort

# Extract HTTP methods from each route file
grep -rn "export async function\|export function" app/api/**/route.ts | \
  grep -oE "(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)" | sort -u

# Full route map
find ./app/api -name "route.ts" | while read f; do
  route=$(echo $f | sed 's|./app||' | sed 's|/route.ts||')
  methods=$(grep -oE "export (async )?function (GET|POST|PUT|PATCH|DELETE)" "$f" | \
    grep -oE "(GET|POST|PUT|PATCH|DELETE)")
  echo "$methods $route"
done
```

### Express
```bash
# Find all router files
find ./src -name "*.ts" -o -name "*.js" | xargs grep -l "router\.\(get\|post\|put\|delete\|patch\)" 2>/dev/null

# Extract routes with line numbers
grep -rn "router\.\(get\|post\|put\|delete\|patch\)\|app\.\(get\|post\|put\|delete\|patch\)" \
  src/ --include="*.ts" | grep -oE "(get|post|put|delete|patch)\(['\"][^'\"]*['\"]"

# Generate route map
grep -rn "router\.\|app\." src/ --include="*.ts" | \
  grep -oE "\.(get|post|put|delete|patch)\(['\"][^'\"]+['\"]" | \
  sed "s/\.\(.*\)('\(.*\)'/\U\1 \2/"
```

### FastAPI
```bash
# Find all route decorators
grep -rn "@app\.\|@router\." . --include="*.py" | \
  grep -E "@(app|router)\.(get|post|put|delete|patch)"

# Extract with path and function name
grep -rn "@\(app\|router\)\.\(get\|post\|put\|delete\|patch\)" . --include="*.py" | \
  grep -oE "@(app|router)\.(get|post|put|delete|patch)\(['\"][^'\"]*['\"]"
```

### Django REST Framework
```bash
# urlpatterns extraction
grep -rn "path\|re_path\|url(" . --include="*.py" | grep "urlpatterns" -A 50 | \
  grep -E "path\(['\"]" | grep -oE "['\"][^'\"]+['\"]" | head -40

# ViewSet router registration
grep -rn "router\.register\|DefaultRouter\|SimpleRouter" . --include="*.py"
```

---

## 测试生成模式

### 认证测试矩阵

对于每个需要认证的端点，生成：

| 测试用例 | 预期状态码 |
|-----------|----------------|
| 无 Authorization 请求头 | 401 |
| 无效的 token 格式 | 401 |
| 有效 token，但用户角色错误 | 403 |
| 过期的 JWT token | 401 |
| 有效 token，且角色正确 | 2xx |
| 来自已删除用户的 token | 401 |

### 输入验证矩阵

对于每个带有请求体的 POST/PUT/PATCH 端点：

| 测试用例 | 预期状态码 |
|-----------|----------------|
| 空请求体 `{}` | 400 或 422 |
| 缺少必填字段（每次缺少一个） | 400 或 422 |
| 类型错误（预期 int 时传入 string） | 400 或 422 |
| 边界：值为 min-1 | 400 或 422 |
| 边界：值为 min | 2xx |
| 边界：值为 max | 2xx |
| 边界：值为 max+1 | 400 或 422 |
| string 字段中的 SQL 注入 | 400 或 200（已净化） |
| string 字段中的 XSS 载荷 | 400 或 200（已净化） |
| 必填字段的值为 Null | 400 或 422 |

---

## 测试文件示例
→ 详情请参阅 references/example-test-files.md

## 根据路由扫描生成测试

拿到代码库后，请遵循以下流程：

1. 使用上面的检测命令**扫描路由**
2. **阅读每个路由处理程序**，以了解：
   - 预期的请求体 schema
   - 认证要求（middleware、decorators）
   - 返回类型和状态码
   - 业务规则（ownership、role checks）
3. 使用上面的模式，按路由组**生成测试文件**
4. **使用描述性名称命名测试**：`"token 过期时返回 401"`，而不是 `"认证测试 3"`
5. 对测试数据**使用 factories/fixtures**——绝不要硬编码 ID
6. **断言响应结构**，而不只是状态码

---

## 常见陷阱

- **只测试正常路径**——80% 的 bug 存在于错误路径中；优先测试这些路径
- **硬编码测试数据 ID**——使用 factories/fixtures；ID 会因环境而异
- **测试之间共享状态**——始终在 afterEach/afterAll 中进行清理
- **测试实现而非行为**——测试 API 返回什么，而不是它如何实现
- **缺少边界测试**——差一错误在 pagination 和 limits 中极其常见
- **不测试 token 过期**——过期 token 与无效 token 的行为不同
- **忽略 Content-Type**——测试 API 是否会拒绝错误的 content types（预期 json 时传入 xml）

---

## 最佳实践

1. 每个端点使用一个 describe 块——使失败相互隔离且易于理解
2. 只填充最少量的数据——不要加载整个 DB；仅创建测试所需的数据
3. 使用 `beforeAll` 进行共享设置，使用 `afterAll` 进行清理——不要对开销较大的操作使用 `beforeEach`
4. 断言具体的错误消息/字段，而不只是状态码
5. 测试敏感字段（password、secret）绝不会出现在响应中
6. 对于认证测试，始终将“缺少请求头”的情况与“无效 token”分开测试
7. 最后添加 rate limit 测试——如果并行运行，它们可能会干扰其他测试套件