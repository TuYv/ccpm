---
name: go-database
description: >
  Database patterns for Go services: database/sql, connection management, transactions,
  migrations, query builders, and ORM usage (sqlc, GORM, ent).
  Use when: "database access", "SQL query", "connection pool", "transactions",
  "database migration", "sqlc", "GORM", "ent", "prepared statement", "repository pattern".
  Do NOT use for: in-memory data structures (use go-coding-standards),
  security aspects of SQL (use go-security-audit), or
  performance profiling of queries (use go-performance-review).
license: MIT
metadata:
  version: "1.1.0"
---
# Go 数据库模式

数据库访问是大多数 Go 服务消耗复杂度预算的主要部分。
应正确处理连接管理、事务和查询模式。

以下详细参考资料可按需加载：

- `references/query-patterns.md` — 完整的查询、扫描及行处理模式、NULL 值
  处理、避免 N+1 问题以及连接泄漏示例。
- `references/tooling.md` — 仓储模式实现、sqlc
  注解查询、迁移工具及规则。

仅当以下摘要不足以满足需求时，才读取参考文件。

## 1. 连接管理

显式配置连接池——默认情况下连接数不受限制：

```go
func OpenDB(dsn string) (*sql.DB, error) {
    db, err := sql.Open("postgres", dsn)
    if err != nil {
        return nil, fmt.Errorf("open db: %w", err)
    }

    db.SetMaxOpenConns(25)
    db.SetMaxIdleConns(10)
    db.SetConnMaxLifetime(5 * time.Minute)
    db.SetConnMaxIdleTime(1 * time.Minute)

    if err := db.PingContext(context.Background()); err != nil {
        return nil, fmt.Errorf("ping db: %w", err)
    }

    return db, nil
}
```

| 设置 | 指导原则 |
|---|---|
| `MaxOpenConns` | 根据数据库的最大连接数和应用实例数量进行设置 |
| `MaxIdleConns` | `MaxOpenConns` 的 40-50% |
| `ConnMaxLifetime` | 5-10 分钟（防止负载均衡器后方出现失效连接） |
| `ConnMaxIdleTime` | 1-2 分钟 |

## 2. 查询规则

1. **仅使用参数化查询**——将字符串拼接到 SQL 中会造成
   注入漏洞，无一例外。
2. **始终传递上下文**——使用 `*Context` 变体
   （`QueryContext`、`QueryRowContext`、`ExecContext`），以便查询遵循
   取消和超时设置。
3. 在错误检查后立即执行 **`defer rows.Close()`**，并在
   迭代循环后检查 `rows.Err()`。
4. 使用 `errors.Is` **显式处理 `sql.ErrNoRows`**，并将其映射为
   `ErrUserNotFound` 之类的领域错误。

```go
var user User
err := db.QueryRowContext(ctx,
    "SELECT id, name, email FROM users WHERE id = $1", id,
).Scan(&user.ID, &user.Name, &user.Email)

if errors.Is(err, sql.ErrNoRows) {
    return nil, ErrUserNotFound
}
if err != nil {
    return nil, fmt.Errorf("get user %s: %w", id, err)
}
```

多行迭代模式：`references/query-patterns.md`。

## 3. 事务

使用能够保证出错时回滚的辅助函数：

```go
func WithTx(ctx context.Context, db *sql.DB, fn func(tx *sql.Tx) error) error {
    tx, err := db.BeginTx(ctx, nil)
    if err != nil {
        return fmt.Errorf("begin tx: %w", err)
    }

    if err := fn(tx); err != nil {
        if rbErr := tx.Rollback(); rbErr != nil {
            return fmt.Errorf("rollback failed: %v (original: %w)", rbErr, err)
        }
        return err
    }

    if err := tx.Commit(); err != nil {
        return fmt.Errorf("commit tx: %w", err)
    }
    return nil
}
```

对于关键操作，应显式设置隔离级别：
`sql.TxOptions{Isolation: sql.LevelSerializable}`。

## 4. 结构与工具

- **仓储模式：**在使用方定义接口，
  使用具体的数据库访问方式实现该接口，并在此边界将驱动程序错误映射为
  领域错误。
- **sqlc：**对于使用原生 SQL 的项目应优先采用——它能根据
  带注解的 SQL 生成类型安全的 Go 代码，并在构建时发现查询与模式不匹配的问题。
- **迁移：**使用工具（`goose`、`golang-migrate`、`atlas`），每次
  变更对应一个迁移；生产环境中仅允许前向迁移，并提供 `down` SQL；应将迁移作为
  独立步骤运行，而不是在服务器启动时运行。

实现和示例：`references/tooling.md`。

## 5. 常见陷阱

- **空值列：**使用 `sql.NullString`/`sql.NullInt64` 或指针
  字段（`*string`，nil = SQL NULL）。将 NULL 扫描到普通字符串中
  会在运行时出错。
- **N+1 查询：**在遍历查询结果的循环中执行查询。应替换
  为 JOIN 或批量查询（`WHERE id = ANY($1)`）。
- **连接泄漏：**在 `Query` 和
  `defer rows.Close()` 之间的任何提前 `return` 都会导致连接池中的连接泄漏。

每种陷阱的完整示例：`references/query-patterns.md`。

## 验证清单

1. 连接池已配置明确的限制（`MaxOpenConns`、`MaxIdleConns`、生命周期）
2. 所有查询均使用参数化占位符，绝不使用字符串拼接
3. 所有 `QueryContext` 结果均在错误检查后立即调用 `defer rows.Close()`
4. 在行迭代循环结束后检查 `rows.Err()`
5. 使用 `errors.Is` 显式处理 `sql.ErrNoRows`
6. 事务使用能保证出错时回滚的辅助函数
7. 上下文传递给所有数据库调用（`*Context` 变体）
8. 可空列使用 `sql.NullString` / `sql.NullInt64` 或指针类型
9. 不存在 N+1 查询模式——使用 JOIN 或批量查询
10. 迁移具有版本控制、可回滚，并与应用启动分开运行