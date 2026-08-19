---
name: spring-boot-engineer
description: Generates Spring Boot 3.x configurations, creates REST controllers, implements Spring Security 6 authentication flows, sets up Spring Data JPA repositories, and configures reactive WebFlux endpoints. Use when building Spring Boot 3.x applications, microservices, or reactive Java applications; invoke for Spring Data JPA, Spring Security 6, WebFlux, Spring Cloud integration, Java REST API design, or Microservices Java architecture.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: backend
  triggers: Spring Boot, Spring Framework, Spring Cloud, Spring Security, Spring Data JPA, Spring WebFlux, Microservices Java, Java REST API, Reactive Java
  role: specialist
  scope: implementation
  output-format: code
  related-skills: java-architect, database-optimizer, microservices-architect, devops-engineer
---
# Spring Boot 工程师

## 核心工作流程

1. **分析需求** — 确定服务边界、API、数据模型和安全需求
2. **设计架构** — 规划微服务、数据访问、云集成和安全方案；在编码前确认设计
3. **实现** — 使用构造器注入和分层架构创建服务（参见下方的快速开始）
4. **保障安全** — 添加 Spring Security、OAuth2、方法安全和 CORS 配置；验证安全规则能够编译并通过测试。如果编译或测试失败：检查错误输出，修复失败的规则或配置，然后重新运行后再继续
5. **测试** — 编写单元测试、集成测试和切片测试；运行 `./mvnw test`（或 `./gradlew test`），确认全部通过后再继续。如果测试失败：检查堆栈跟踪，定位失败的断言或组件，修复问题，然后重新运行完整测试套件
6. **部署** — 通过 Actuator 配置健康检查和可观测性；验证 `/actuator/health` 返回 `UP`。如果健康状态为 `DOWN`：检查响应中的 `components` 详情，解决失败的组件（例如 datasource、broker），然后重新验证

## 参考指南

根据上下文加载详细指导：

| 主题 | 参考文档 | 加载时机 |
|-------|-----------|-----------|
| Web 层 | `references/web.md` | 控制器、REST API、验证、异常处理 |
| 数据访问 | `references/data.md` | Spring Data JPA、repositories、事务、projections |
| 安全 | `references/security.md` | Spring Security 6、OAuth2、JWT、方法安全 |
| 云原生 | `references/cloud.md` | Spring Cloud、Config、Discovery、Gateway、resilience |
| 测试 | `references/testing.md` | @SpringBootTest、MockMvc、Testcontainers、测试切片 |

## 快速开始 — 最小可用结构

标准的 Spring Boot 功能由以下层组成。将这些内容作为复制粘贴的起点。

### 实体

```java
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @DecimalMin("0.0")
    private BigDecimal price;

    // getters / setters or use @Data (Lombok)
}
```

### Repository

```java
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCase(String name);
}
```

### Service（构造器注入）

```java
@Service
public class ProductService {
    private final ProductRepository repo;

    public ProductService(ProductRepository repo) { // constructor injection — no @Autowired
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<Product> search(String name) {
        return repo.findByNameContainingIgnoreCase(name);
    }

    @Transactional
    public Product create(ProductRequest request) {
        var product = new Product();
        product.setName(request.name());
        product.setPrice(request.price());
        return repo.save(product);
    }
}
```

### REST 控制器

```java
@RestController
@RequestMapping("/api/v1/products")
@Validated
public class ProductController {
    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public List<Product> search(@RequestParam(defaultValue = "") String name) {
        return service.search(name);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product create(@Valid @RequestBody ProductRequest request) {
        return service.create(request);
    }
}
```

### DTO（`record`）

```java
public record ProductRequest(
    @NotBlank String name,
    @DecimalMin("0.0") BigDecimal price
) {}
```

### 全局异常处理器

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidation(MethodArgumentNotValidException ex) {
        return ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> handleNotFound(EntityNotFoundException ex) {
        return Map.of("error", ex.getMessage());
    }
}
```

### 测试切片

```java
@WebMvcTest(ProductController.class)
class ProductControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean ProductService service;

    @Test
    void createProduct_validRequest_returns201() throws Exception {
        var product = new Product(); product.setName("Widget"); product.setPrice(BigDecimal.TEN);
        when(service.create(any())).thenReturn(product);

        mockMvc.perform(post("/api/v1/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"name":"Widget","price":10.0}"""))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Widget"));
    }
}
```

## 约束

### 必须做到

| 规则 | 正确模式 |
|------|----------|
| 构造器注入 | `public MyService(Dep dep) { this.dep = dep; }` |
| 验证 API 输入 | 在每个修改型端点上使用 `@Valid @RequestBody MyRequest req` |
| 类型安全的配置 | 将 `@ConfigurationProperties(prefix = "app")` 绑定到记录类或普通类 |
| 使用合适的 stereotype | 业务逻辑使用 `@Service`，数据访问使用 `@Repository`，HTTP 接口使用 `@RestController` |
| 事务范围 | 对多步写操作使用 `@Transactional`；对读取操作使用 `@Transactional(readOnly = true)` |
| 隐藏内部细节 | 在 `@RestControllerAdvice` 中捕获领域异常；返回问题详情，而不是堆栈跟踪 |
| 外部化机密信息 | 使用环境变量或 Spring Cloud Config，绝不要使用 `application.properties` |

### 禁止做到
- 使用字段注入（在字段上使用 `@Autowired`）
- 跳过 API 端点的输入验证
- 在适用 `@Service`/`@Repository`/`@Controller` 时使用 `@Component`
- 混用阻塞式代码和响应式代码（例如在 WebFlux 链中调用 `.block()`）
- 将机密信息或凭据存储在 `application.properties`/`application.yml` 中
- 硬编码 URL、凭据或特定环境的值
- 使用已弃用的 Spring Boot 2.x 模式（例如 `WebSecurityConfigurerAdapter`）

[文档](https://jeffallan.github.io/claude-skills/skills/backend/spring-boot-engineer/)