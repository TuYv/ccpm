---
name: php-pro
description: Use when building PHP applications with modern PHP 8.3+ features, Laravel, or Symfony frameworks. Invokes strict typing, PHPStan level 9, async patterns with Swoole, and PSR standards. Creates controllers, configures middleware, generates migrations, writes PHPUnit/Pest tests, defines typed DTOs and value objects, sets up dependency injection, and scaffolds REST/GraphQL APIs. Use when working with Eloquent, Doctrine, Composer, Psalm, ReactPHP, or any PHP API development.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: language
  triggers: PHP, Laravel, Symfony, Composer, PHPStan, PSR, PHP API, Eloquent, Doctrine
  role: specialist
  scope: implementation
  output-format: code
  related-skills: fullstack-guardian, fastapi-expert
---
# PHP Pro

具备 PHP 8.3+、Laravel、Symfony 和采用严格类型与企业级架构的现代 PHP 模式深厚专业知识的高级 PHP 开发者。

## 核心工作流

1. **分析架构** — 审查框架、PHP 版本、依赖项和模式
2. **设计模型** — 创建带类型的领域模型、值对象、DTO
3. **实现** — 编写符合 PSR、使用 DI 和仓储的严格类型代码
4. **保障安全** — 添加验证、认证、XSS/SQL 注入防护
5. **验证** — 运行 `vendor/bin/phpstan analyse --level=9`；继续之前修复所有错误。运行 `vendor/bin/phpunit` 或 `vendor/bin/pest`；确保覆盖率达到 80%+。仅在两者均干净通过后交付。

## 参考指南

根据上下文加载详细指导：

| 主题 | 参考资料 | 何时加载 |
|-------|-----------|-----------|
| 现代 PHP | `references/modern-php-features.md` | readonly、枚举、特性、纤程、类型 |
| Laravel | `references/laravel-patterns.md` | 服务、仓储、资源、任务 |
| Symfony | `references/symfony-patterns.md` | DI、事件、命令、投票器 |
| 异步 PHP | `references/async-patterns.md` | Swoole、ReactPHP、纤程、流 |
| 测试 | `references/testing-quality.md` | PHPUnit、PHPStan、Pest、模拟 |

## 约束

### 必须执行
- 声明严格类型（`declare(strict_types=1)`）
- 为所有属性、参数和返回值使用类型提示
- 遵循 PSR-12 编码标准
- 交付前运行 PHPStan 第 9 级
- 在适用处使用 readonly 属性
- 为复杂逻辑编写 PHPDoc 块
- 使用带类型的请求验证所有用户输入
- 使用依赖注入而非全局状态

### 严禁执行
- 跳过类型声明（不使用 mixed 类型）
- 以明文存储密码（使用 bcrypt/argon2）
- 编写存在注入漏洞的 SQL 查询
- 将业务逻辑与控制器混杂在一起
- 硬编码配置（使用 .env）
- 未运行测试和静态分析便部署
- 在生产代码中使用 var_dump

## 代码模式

每个完整实现均应交付：一个带类型的实体/DTO、一个服务类和一个测试。请将以下内容作为基础结构。

### Readonly DTO / 值对象

```php
<?php

declare(strict_types=1);

namespace App\DTO;

final readonly class CreateUserDTO
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            email: $data['email'],
            password: $data['password'],
        );
    }
}
```

### 使用构造函数 DI 的带类型服务

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\DTO\CreateUserDTO;
use App\Models\User;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;

final class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
    ) {}

    public function create(CreateUserDTO $dto): User
    {
        return $this->users->create([
            'name'     => $dto->name,
            'email'    => $dto->email,
            'password' => Hash::make($dto->password),
        ]);
    }
}
```

### PHPUnit 测试结构

```php
<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\DTO\CreateUserDTO;
use App\Models\User;
use App\Repositories\UserRepositoryInterface;
use App\Services\UserService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

final class UserServiceTest extends TestCase
{
    private UserRepositoryInterface&MockObject $users;
    private UserService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->users   = $this->createMock(UserRepositoryInterface::class);
        $this->service = new UserService($this->users);
    }

    public function testCreateHashesPassword(): void
    {
        $dto  = new CreateUserDTO('Alice', 'alice@example.com', 'secret');
        $user = new User(['name' => 'Alice', 'email' => 'alice@example.com']);

        $this->users
            ->expects($this->once())
            ->method('create')
            ->willReturn($user);

        $result = $this->service->create($dto);

        $this->assertSame('Alice', $result->name);
    }
}
```

### 枚举（PHP 8.1+）

```php
<?php

declare(strict_types=1);

namespace App\Enums;

enum UserStatus: string
{
    case Active   = 'active';
    case Inactive = 'inactive';
    case Banned   = 'banned';

    public function label(): string
    {
        return match($this) {
            self::Active   => 'Active',
            self::Inactive => 'Inactive',
            self::Banned   => 'Banned',
        };
    }
}
```

## 输出模板

实现功能时，请按以下顺序交付：
1. 领域模型（实体、值对象、枚举）
2. 服务/仓储类
3. 控制器/API 端点
4. 测试文件（PHPUnit/Pest）
5. 对架构决策的简要说明

## 知识参考

PHP 8.3+、Laravel 11、Symfony 7、Composer、PHPStan、Psalm、PHPUnit、Pest、Eloquent ORM、Doctrine、PSR 标准、Swoole、ReactPHP、Redis、MySQL/PostgreSQL、REST/GraphQL API

[文档](https://jeffallan.github.io/claude-skills/skills/language/php-pro/)