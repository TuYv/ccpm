---
name: code-deduplication
description: Prevent semantic code duplication with capability index and check-before-write
when-to-use: Before creating new utility functions or shared code
user-invocable: false
effort: medium
---
# 代码去重 Skill


**目的：** 防止语义重复和代码膨胀。维护能力索引，确保 Claude 在编写新内容之前始终了解已有内容。

---

## 核心理念

```
┌─────────────────────────────────────────────────────────────────┐
│  CHECK BEFORE YOU WRITE                                         │
│  ─────────────────────────────────────────────────────────────  │
│  AI doesn't copy/paste - it reimplements.                       │
│  The problem isn't duplicate code, it's duplicate PURPOSE.      │
│                                                                 │
│  Before writing ANY new function:                               │
│  1. Check CODE_INDEX.md for existing capabilities               │
│  2. Search codebase for similar functionality                   │
│  3. Extend existing code if possible                            │
│  4. Only create new if nothing suitable exists                  │
├─────────────────────────────────────────────────────────────────┤
│  AFTER WRITING: Update the index immediately.                   │
│  PERIODICALLY: Run /audit-duplicates to catch overlap.          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 代码索引结构

在项目根目录中维护 `CODE_INDEX.md`，按**能力**而非文件位置进行组织：

```markdown
# Code Index

*Last updated: [timestamp]*
*Run `/update-code-index` to regenerate*

## Quick Reference

| Category | Count | Location |
|----------|-------|----------|
| Date/Time | 5 functions | src/utils/dates.ts |
| Validation | 8 functions | src/utils/validate.ts |
| API Clients | 12 functions | src/api/*.ts |
| Auth | 6 functions | src/auth/*.ts |

---

## Date/Time Operations

| Function | Location | Does What | Params |
|----------|----------|-----------|--------|
| `formatDate()` | utils/dates.ts:15 | Formats Date → "Jan 15, 2024" | `(date: Date, format?: string)` |
| `formatRelative()` | utils/dates.ts:32 | Formats Date → "2 days ago" | `(date: Date)` |
| `parseDate()` | utils/dates.ts:48 | Parses string → Date | `(str: string, format?: string)` |
| `isExpired()` | auth/tokens.ts:22 | Checks if timestamp past now | `(timestamp: number)` |
| `addDays()` | utils/dates.ts:61 | Adds days to date | `(date: Date, days: number)` |

---

## Validation

| Function | Location | Does What | Params |
|----------|----------|-----------|--------|
| `isEmail()` | utils/validate.ts:10 | Validates email format | `(email: string)` |
| `isPhone()` | utils/validate.ts:25 | Validates phone with country | `(phone: string, country?: string)` |
| `isURL()` | utils/validate.ts:42 | Validates URL format | `(url: string)` |
| `isUUID()` | utils/validate.ts:55 | Validates UUID v4 | `(id: string)` |
| `sanitizeHTML()` | utils/sanitize.ts:12 | Strips XSS from input | `(html: string)` |
| `sanitizeSQL()` | utils/sanitize.ts:28 | Escapes SQL special chars | `(input: string)` |

---

## String Operations

| Function | Location | Does What | Params |
|----------|----------|-----------|--------|
| `slugify()` | utils/strings.ts:8 | Converts to URL slug | `(str: string)` |
| `truncate()` | utils/strings.ts:20 | Truncates with ellipsis | `(str: string, len: number)` |
| `capitalize()` | utils/strings.ts:32 | Capitalizes first letter | `(str: string)` |
| `pluralize()` | utils/strings.ts:40 | Adds s/es correctly | `(word: string, count: number)` |

---

## API Clients

| Function | Location | Does What | Returns |
|----------|----------|-----------|---------|
| `fetchUser()` | api/users.ts:15 | GET /users/:id | `Promise<User>` |
| `fetchUsers()` | api/users.ts:28 | GET /users with pagination | `Promise<User[]>` |
| `createUser()` | api/users.ts:45 | POST /users | `Promise<User>` |
| `updateUser()` | api/users.ts:62 | PATCH /users/:id | `Promise<User>` |
| `deleteUser()` | api/users.ts:78 | DELETE /users/:id | `Promise<void>` |

---

## Error Handling

| Function/Class | Location | Does What |
|----------------|----------|-----------|
| `AppError` | utils/errors.ts:5 | Base error class with code |
| `ValidationError` | utils/errors.ts:20 | Input validation failures |
| `NotFoundError` | utils/errors.ts:32 | Resource not found |
| `handleAsync()` | utils/errors.ts:45 | Wraps async route handlers |
| `errorMiddleware()` | middleware/error.ts:10 | Express error handler |

---

## Hooks (React)

| Hook | Location | Does What |
|------|----------|-----------|
| `useAuth()` | hooks/useAuth.ts | Auth state + login/logout |
| `useUser()` | hooks/useUser.ts | Current user data |
| `useDebounce()` | hooks/useDebounce.ts | Debounces value changes |
| `useLocalStorage()` | hooks/useLocalStorage.ts | Persisted state |
| `useFetch()` | hooks/useFetch.ts | Data fetching with loading/error |

---

## Components (React)

| Component | Location | Does What |
|-----------|----------|-----------|
| `Button` | components/Button.tsx | Styled button with variants |
| `Input` | components/Input.tsx | Form input with validation |
| `Modal` | components/Modal.tsx | Dialog overlay |
| `Toast` | components/Toast.tsx | Notification popup |
| `Spinner` | components/Spinner.tsx | Loading indicator |
```

---

## 文件头格式

每个文件都应包含一个摘要头：

### TypeScript/JavaScript

```typescript
/**
 * @file User authentication utilities
 * @description Handles login, logout, session management, and token refresh.
 *
 * Key exports:
 * - login(email, password) - Authenticates user, returns tokens
 * - logout() - Clears session and tokens
 * - refreshToken() - Gets new access token
 * - validateSession() - Checks if session is valid
 *
 * @see src/api/auth.ts for API endpoints
 * @see src/hooks/useAuth.ts for React hook
 */

import { ... } from '...';
```

### Python

```python
"""
User authentication utilities.

Handles login, logout, session management, and token refresh.

Key exports:
    - login(email, password) - Authenticates user, returns tokens
    - logout() - Clears session and tokens
    - refresh_token() - Gets new access token
    - validate_session() - Checks if session is valid

See Also:
    - src/api/auth.py for API endpoints
    - src/services/user.py for user operations
"""

from typing import ...
```

---

## 函数文档

每个函数都需要一行摘要：

### TypeScript

```typescript
/**
 * Formats a date into a human-readable relative string.
 * Examples: "2 minutes ago", "yesterday", "3 months ago"
 */
export function formatRelative(date: Date): string {
  // ...
}

/**
 * Validates email format and checks for disposable domains.
 * Returns true for valid non-disposable emails.
 */
export function isValidEmail(email: string): boolean {
  // ...
}
```

### Python

```python
def format_relative(date: datetime) -> str:
    """Formats a date into a human-readable relative string.

    Examples: "2 minutes ago", "yesterday", "3 months ago"
    """
    ...

def is_valid_email(email: str) -> bool:
    """Validates email format and checks for disposable domains.

    Returns True for valid non-disposable emails.
    """
    ...
```

---

## 写入前检查流程

### 创建任何新函数之前

```
┌─────────────────────────────────────────────────────────────────┐
│  BEFORE WRITING NEW CODE                                        │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  1. DESCRIBE what you need in plain English                     │
│     "I need to format a date as relative time"                  │
│                                                                 │
│  2. CHECK CODE_INDEX.md                                         │
│     Search for: date, time, format, relative                    │
│     → Found: formatRelative() in utils/dates.ts                 │
│                                                                 │
│  3. EVALUATE if existing code works                             │
│     - Does it do what I need? → Use it                          │
│     - Close but not quite? → Extend it                          │
│     - Nothing suitable? → Create new, update index              │
│                                                                 │
│  4. If extending, check for breaking changes                    │
│     - Add optional params, don't change existing behavior       │
│     - Update tests for new functionality                        │
└─────────────────────────────────────────────────────────────────┘
```

### 决策树

```
Need new functionality
        │
        ▼
Check CODE_INDEX.md for similar
        │
        ├─► Found exact match ──────► USE IT
        │
        ├─► Found similar ──────────► Can it be extended?
        │                                   │
        │                    ┌──────────────┴──────────────┐
        │                    ▼                             ▼
        │               Yes: Extend                   No: Create new
        │               (add params)                  (update index)
        │
        └─► Nothing found ──────────► Create new (update index)
```

---

## 常见重复模式

### 模式 1：重复实现工具函数

❌ **错误做法：** 已存在 `isEmail()` 时又创建 `validateEmail()`
```typescript
// DON'T: This already exists as isEmail()
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

✅ **正确做法：** 先检查索引，使用现有函数
```typescript
import { isEmail } from '@/utils/validate';

if (isEmail(userInput)) { ... }
```

### 模式 2：略有差异的多个版本

❌ **错误做法：** 存在多个略有差异的日期格式化函数
```typescript
// In file A
function formatDate(d: Date) { return d.toLocaleDateString(); }

// In file B
function displayDate(d: Date) { return d.toLocaleDateString('en-US'); }

// In file C
function showDate(d: Date) { return d.toLocaleDateString('en-US', { month: 'short' }); }
```

✅ **正确做法：** 使用一个带选项的函数
```typescript
// utils/dates.ts
function formatDate(d: Date, options?: { locale?: string; format?: 'short' | 'long' }) {
  const locale = options?.locale ?? 'en-US';
  const formatOpts = options?.format === 'short'
    ? { month: 'short', day: 'numeric' }
    : { month: 'long', day: 'numeric', year: 'numeric' };
  return d.toLocaleDateString(locale, formatOpts);
}
```

### 模式 3：应该提取出来的内联逻辑

❌ **错误做法：** 相同的验证逻辑散落在多个文件中
```typescript
// In signup.ts
if (!email || !email.includes('@') || email.length < 5) { ... }

// In profile.ts
if (!email || !email.includes('@') || email.length < 5) { ... }

// In invite.ts
if (!email || !email.includes('@') || email.length < 5) { ... }
```

✅ **正确做法：** 只提取一次，然后在各处导入
```typescript
// utils/validate.ts
export const isEmail = (email: string) =>
  email && email.includes('@') && email.length >= 5;

// Everywhere else
import { isEmail } from '@/utils/validate';
if (!isEmail(email)) { ... }
```

---

## 定期审计

定期运行 `/audit-duplicates` 以发现语义重叠：

### 审计检查清单

- [ ] **工具函数**：是否有执行相似操作的函数？
- [ ] **API 调用**：是否存在多种获取相同数据的方式？
- [ ] **验证**：是否存在散落各处的内联验证逻辑？
- [ ] **错误处理**：错误处理模式是否不一致？
- [ ] **组件**：是否有可以合并的相似 UI 组件？
- [ ] **Hooks**：自定义 Hook 是否存在重叠逻辑？

### 审计输出格式

```markdown
## Duplicate Audit - [DATE]

### 🔴 High Priority (Merge These)

1. **Date formatting** - 3 similar functions found
   - `formatDate()` in utils/dates.ts
   - `displayDate()` in components/Header.tsx
   - `showDate()` in pages/Profile.tsx
   - **Action:** Consolidate into utils/dates.ts

2. **Email validation** - Inline logic in 5 files
   - signup.ts:42
   - profile.ts:28
   - invite.ts:15
   - settings.ts:67
   - admin.ts:33
   - **Action:** Extract to utils/validate.ts

### 🟡 Medium Priority (Consider Merging)

1. **User fetching** - 2 different patterns
   - `fetchUser()` in api/users.ts
   - `getUser()` in services/user.ts
   - **Action:** Decide on one pattern

### 🟢 Low Priority (Monitor)

1. **Button components** - 3 variants exist
   - May be intentional for different use cases
   - **Action:** Document the differences
```

---

## 向量数据库集成（可选）

对于大型代码库（100 个以上文件），添加向量搜索：

### 使用 ChromaDB 设置

```python
# scripts/index_codebase.py
import chromadb
from chromadb.utils import embedding_functions

# Initialize
client = chromadb.PersistentClient(path="./.chroma")
ef = embedding_functions.DefaultEmbeddingFunction()
collection = client.get_or_create_collection("code_index", embedding_function=ef)

# Index a function
collection.add(
    documents=["Formats a date into human-readable relative string like '2 days ago'"],
    metadatas=[{"function": "formatRelative", "file": "utils/dates.ts", "line": 32}],
    ids=["formatRelative"]
)

# Search before writing
results = collection.query(
    query_texts=["format date as relative time"],
    n_results=5
)
# Returns: formatRelative in utils/dates.ts - 0.92 similarity
```

### 使用 LanceDB 设置（更轻量）

```python
# scripts/index_codebase.py
import lancedb

db = lancedb.connect("./.lancedb")

# Create table
data = [
    {"function": "formatRelative", "file": "utils/dates.ts", "description": "Formats date as relative time"},
    {"function": "isEmail", "file": "utils/validate.ts", "description": "Validates email format"},
]
table = db.create_table("code_index", data)

# Search
results = table.search("validate email address").limit(5).to_list()
```

### 何时使用向量数据库

| 代码库规模 | 建议 |
|---------------|----------------|
| 少于 50 个文件 | 仅使用 Markdown 索引 |
| 50-200 个文件 | Markdown + 定期审查 |
| 200 个以上文件 | 添加向量数据库 |
| 500 个以上文件 | 向量数据库必不可少 |

---

## Claude 指令

### 会话开始时

1. 如果 `CODE_INDEX.md` 存在，则读取它
2. 了解可用的分类和关键函数
3. 在本次会话中保留此上下文

### 编写新代码之前

1. **暂停并检查**：“是否已存在类似的功能？”
2. 在 CODE_INDEX.md 中搜索类似功能
3. 如果不确定，则搜索代码库：`grep -r "functionName\|similar_term" src/`
4. 只有在确认不存在合适的功能时，才创建新代码

### 编写新代码之后

1. **立即更新 CODE_INDEX.md**
2. 如果是新文件，则添加文件头
3. 添加函数文档字符串
4. 将索引更新与代码一并提交

### 当用户说“添加 X 功能”时

```
Before implementing, let me check if we already have something similar...

[Checks CODE_INDEX.md]

Found: `existingFunction()` in utils/file.ts does something similar.
Options:
1. Use existing function as-is
2. Extend it with new capability
3. Create new (if truly different use case)

Which approach would you prefer?
```

---

## 快速参考

### 更新索引命令
```bash
/update-code-index
```

### 审查命令
```bash
/audit-duplicates
```

### 文件头模板
```typescript
/**
 * @file [Short description]
 * @description [What this file does]
 *
 * Key exports:
 * - function1() - [what it does]
 * - function2() - [what it does]
 */
```

### 函数模板
```typescript
/**
 * [One line description of what it does]
 */
export function name(params): ReturnType {
```

### 索引条目模板
```markdown
| `functionName()` | path/file.ts:line | Does what in plain English | `(params)` |
```